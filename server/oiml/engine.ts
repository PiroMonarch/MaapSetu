import {
  DEFAULT_COMPLIANCE_CONFIG,
  type ComplianceConfig,
  mpeForLoad,
} from "./rules";

export type Verdict = "PASS" | "FAIL" | "PENDING";

const round = (n: number, digits = 6) => {
  if (!Number.isFinite(n)) return n;
  const f = 10 ** digits;
  return Math.round(n * f) / f;
};

const num = (v: unknown): number | null => {
  if (v === "" || v === null || v === undefined) return null;
  const n = typeof v === "number" ? v : parseFloat(String(v));
  return Number.isFinite(n) ? n : null;
};

function verdictFromAbs(error: number, mpe: number): Verdict {
  if (Math.abs(error) <= mpe + 1e-12) return "PASS";
  return "FAIL";
}

export interface InstrumentParams {
  eValue?: number;
  dValue?: number;
  accuracyClass?: string;
  maxCapacity?: number;
  minCapacity?: number;
}

export class OIMLComplianceEngine {
  constructor(private config: ComplianceConfig = DEFAULT_COMPLIANCE_CONFIG) {}

  getConfig() {
    return this.config;
  }

  setConfig(config: ComplianceConfig) {
    this.config = config;
  }

  evaluateWeighing(observations: any[], instrument: InstrumentParams) {
    const e = instrument.eValue || 1;
    const useSubstitution = observations.some(
      (r) => num(r.add) !== null && String(r.add) !== ""
    );

    let E0 = 0;
    if (useSubstitution) {
      const zeroRow = observations.find((r) => num(r.load) === 0);
      if (zeroRow && num(zeroRow.ind) !== null && num(zeroRow.add) !== null) {
        const I = num(zeroRow.ind)!;
        const add = num(zeroRow.add)!;
        const L = 0;
        E0 = I + 0.5 * e - add - L;
      }
    }

    const rows = observations.map((row, idx) => {
      const load = num(row.load ?? row.test_load_g ?? row.testLoad);
      const ind = num(row.ind ?? row.indication_g ?? row.indication);
      const add = num(row.add ?? row.deltaL);

      if (load === null || ind === null) {
        return {
          ...row,
          id: row.id ?? idx + 1,
          load: row.load ?? "",
          ind: row.ind ?? "",
          add: row.add ?? "",
          result: "PENDING",
          explanation: "Incomplete observation",
        };
      }

      const mpe = mpeForLoad(load, e, instrument.accuracyClass || "III", this.config);
      let P = ind;
      let E = round(ind - load);
      let Ec = E;
      let method = this.config.simpleErrorFormula;

      if (useSubstitution && add !== null) {
        P = round(ind + 0.5 * e - add);
        E = round(P - load);
        Ec = round(E - E0);
        method = this.config.substitutionFormula;
      }

      const result = verdictFromAbs(Ec, mpe.mpeG);
      const explanation = [
        `Test load L = ${load} g`,
        `Indication I = ${ind} g`,
        useSubstitution && add !== null ? `ΔL = ${add} g; P = ${P} g` : null,
        `Error = ${Ec} g`,
        `Permissible error (MPE) = ±${round(mpe.mpeG)} g  (${mpe.rule})`,
        `Result: ${result}`,
        this.config.disclaimer,
      ]
        .filter(Boolean)
        .join(" | ");

      return {
        ...row,
        id: row.id ?? idx + 1,
        load,
        ind,
        add: add ?? "",
        testLoad: load,
        indication: ind,
        calc: String(P),
        err: String(E),
        corr: String(Ec),
        error: Ec,
        mpe: `±${round(mpe.mpeG)}`,
        permissibleError: round(mpe.mpeG),
        result,
        method,
        rule: mpe.rule,
        explanation,
      };
    });

    const complete = rows.filter((r) => r.result === "PASS" || r.result === "FAIL");
    const passed = complete.length > 0 && complete.every((r) => r.result === "PASS");
    return {
      testName: "Weighing Performance",
      data: rows,
      passed,
      verdict: complete.length === 0 ? "PENDING" : passed ? "PASS" : "FAIL",
      explanation: passed
        ? "All weighing points are within the configured MPE."
        : "One or more weighing points exceed the configured MPE.",
      disclaimer: this.config.disclaimer,
    };
  }

  evaluateEccentricity(observations: any[], instrument: InstrumentParams) {
    const e = instrument.eValue || 1;
    const rows = (observations || []).map((row, idx) => {
      const load = num(row.test_load_g ?? row.load ?? row.testLoad);
      const ind = num(row.indication_g ?? row.ind ?? row.indication);
      if (load === null || ind === null) {
        return { ...row, result: "PENDING", explanation: "Incomplete observation" };
      }
      const error = round(ind - load);
      const mpe = mpeForLoad(load, e, instrument.accuracyClass || "III", this.config);
      const result = verdictFromAbs(error, mpe.mpeG);
      return {
        ...row,
        id: row.id ?? idx + 1,
        position: row.position || `P${idx + 1}`,
        load,
        ind,
        testLoad: load,
        indication: ind,
        error,
        err: String(error),
        mpe: `±${round(mpe.mpeG)}`,
        permissibleError: round(mpe.mpeG),
        result,
        rule: mpe.rule,
        explanation: `Error = ${ind} − ${load} = ${error} g; MPE = ±${round(mpe.mpeG)} g → ${result}`,
      };
    });
    const complete = rows.filter((r) => r.result === "PASS" || r.result === "FAIL");
    const passed = complete.length > 0 && complete.every((r) => r.result === "PASS");
    return {
      testName: "Eccentricity",
      data: rows,
      passed,
      verdict: complete.length === 0 ? "PENDING" : passed ? "PASS" : "FAIL",
      explanation: passed
        ? "All eccentricity positions are within the configured MPE."
        : "One or more eccentricity positions exceed the configured MPE.",
      disclaimer: this.config.disclaimer,
    };
  }

  evaluateRepeatability(series: any[], instrument: InstrumentParams) {
    const e = instrument.eValue || 1;
    const evaluated = (series || []).map((s, sIdx) => {
      const load = num(s.test_load_g ?? s.load ?? s.testLoad);
      const readings = (s.readings || []).map((r: any, i: number) => {
        const indication = num(r.indication_g ?? r.ind ?? r.indication);
        return {
          trial: r.trial ?? i + 1,
          test_load_g: load,
          indication_g: indication,
          indication,
        };
      });
      const values = readings.map((r: any) => r.indication).filter((v: any) => v !== null) as number[];
      const mean = values.length ? round(values.reduce((a, b) => a + b, 0) / values.length) : null;
      const range = values.length ? round(Math.max(...values) - Math.min(...values)) : null;
      const mpe = load !== null ? mpeForLoad(load, e, instrument.accuracyClass || "III", this.config) : null;
      const errorsOk = values.every((v) => load !== null && mpe && Math.abs(v - load) <= mpe.mpeG + 1e-12);
      const rangeOk = range === null || !mpe ? false : range <= mpe.mpeG + 1e-12;
      const passed = this.config.repeatability.useRangeVsMpe ? rangeOk && errorsOk : errorsOk;
      return {
        ...s,
        series: s.series || `Series ${sIdx + 1}`,
        test_load_g: load,
        readings,
        mean_g: mean,
        range_g: range,
        mpe_g: mpe?.mpeG ?? null,
        result: values.length === 0 ? "PENDING" : passed ? "PASS" : "FAIL",
        explanation: mpe
          ? `Load ${load} g; range ${range} g; MPE ±${round(mpe.mpeG)} g → ${passed ? "PASS" : "FAIL"}`
          : "Missing load",
      };
    });
    const complete = evaluated.filter((s) => s.result === "PASS" || s.result === "FAIL");
    const passed = complete.length > 0 && complete.every((s) => s.result === "PASS");
    return {
      testName: "Repeatability",
      data: evaluated,
      passed,
      verdict: complete.length === 0 ? "PENDING" : passed ? "PASS" : "FAIL",
      explanation: passed
        ? "Repeatability series are within the configured MPE."
        : "Repeatability exceeds the configured MPE.",
      disclaimer: this.config.disclaimer,
    };
  }

  evaluateTare(tareValues: any[], instrument: InstrumentParams) {
    const e = instrument.eValue || 1;
    const evaluated = (tareValues || []).map((tv, tIdx) => {
      const steps = (tv.steps || []).map((step: any, i: number) => {
        const load = num(step.net_load_applied_g ?? step.load ?? step.testLoad);
        const ind = num(step.net_indication_g ?? step.ind ?? step.indication);
        if (load === null || ind === null) {
          return { ...step, result: "PENDING" };
        }
        const error = round(ind - load);
        const mpe = mpeForLoad(load, e, instrument.accuracyClass || "III", this.config);
        const result = verdictFromAbs(error, mpe.mpeG);
        return {
          ...step,
          net_load_applied_g: load,
          net_indication_g: ind,
          error_g: error,
          mpe_g: round(mpe.mpeG),
          result,
          explanation: `Net error = ${ind} − ${load} = ${error} g; MPE ±${round(mpe.mpeG)} g → ${result}`,
        };
      });
      const complete = steps.filter((s: any) => s.result === "PASS" || s.result === "FAIL");
      const ok = complete.length > 0 && complete.every((s: any) => s.result === "PASS");
      return {
        ...tv,
        tare_value_g: tv.tare_value_g ?? tv.tare,
        steps,
        result: complete.length === 0 ? "PENDING" : ok ? "PASS" : "FAIL",
      };
    });
    const complete = evaluated.filter((t) => t.result === "PASS" || t.result === "FAIL");
    const passed = complete.length > 0 && complete.every((t) => t.result === "PASS");
    return {
      testName: "Tare Weighing",
      data: evaluated,
      passed,
      verdict: complete.length === 0 ? "PENDING" : passed ? "PASS" : "FAIL",
      explanation: passed ? "Tare weighing is within configured MPE." : "Tare weighing exceeds configured MPE.",
      disclaimer: this.config.disclaimer,
    };
  }

  evaluateDiscrimination(points: any[], instrument: InstrumentParams) {
    const factor = this.config.discrimination.minChangeFactor;
    const rows = (points || []).map((p, idx) => {
      const added = num(p.added_test_weight_g ?? p.added);
      const change = num(p.indication_change_g ?? p.change);
      if (added === null || change === null) {
        return { ...p, result: "PENDING" };
      }
      const minChange = added * factor;
      const result: Verdict = Math.abs(change) + 1e-12 >= minChange ? "PASS" : "FAIL";
      return {
        ...p,
        id: p.id ?? idx + 1,
        added_test_weight_g: added,
        indication_change_g: change,
        result,
        explanation: `|ΔI| = ${change} g; required ≥ ${round(minChange)} g (factor ${factor}) → ${result}. ${this.config.disclaimer}`,
      };
    });
    const complete = rows.filter((r) => r.result === "PASS" || r.result === "FAIL");
    const passed = complete.length > 0 && complete.every((r) => r.result === "PASS");
    return {
      testName: "Discrimination",
      data: rows,
      passed,
      verdict: complete.length === 0 ? "PENDING" : passed ? "PASS" : "FAIL",
      explanation: passed ? "Discrimination change meets the configured minimum." : "Discrimination change is below the configured minimum.",
      disclaimer: this.config.disclaimer,
    };
  }

  evaluateZeroReturn(obs: any, instrument: InstrumentParams) {
    const e = instrument.eValue || 1;
    const deviation = num(obs?.deviation_g ?? obs?.deviation ?? obs?.error);
    const allowed = num(obs?.allowed_g) ?? this.config.zeroReturn.allowedInE * e;
    if (deviation === null) {
      return {
        testName: "Zero Return",
        data: [{ ...obs, result: "PENDING" }],
        passed: false,
        verdict: "PENDING",
        explanation: "Incomplete observation",
        disclaimer: this.config.disclaimer,
      };
    }
    const result = verdictFromAbs(deviation, allowed);
    const row = {
      ...obs,
      deviation_g: deviation,
      allowed_g: allowed,
      error: deviation,
      mpe: `±${round(allowed)}`,
      result,
      explanation: `|deviation| = ${Math.abs(deviation)} g; allowed ±${round(allowed)} g → ${result}`,
    };
    return {
      testName: "Zero Return",
      data: [row],
      passed: result === "PASS",
      verdict: result,
      explanation: row.explanation,
      disclaimer: this.config.disclaimer,
    };
  }

  evaluateWarmup(points: any[], instrument: InstrumentParams) {
    const e = instrument.eValue || 1;
    const allowed = this.config.warmup.allowedZeroErrorInE * e;
    const rows = (points || []).map((p, idx) => {
      const err = num(p.zero_error_g ?? p.error);
      if (err === null) return { ...p, result: "PENDING" };
      const result = verdictFromAbs(err, allowed);
      return {
        ...p,
        id: p.id ?? idx + 1,
        zero_error_g: err,
        allowed_g: allowed,
        result,
        explanation: `t=${p.minutes} min; zero error ${err} g; allowed ±${round(allowed)} g → ${result}`,
      };
    });
    const complete = rows.filter((r) => r.result === "PASS" || r.result === "FAIL");
    const passed = complete.length === 0 ? true : complete.every((r) => r.result === "PASS");
    return {
      testName: "Warm-up",
      data: rows,
      passed,
      verdict: complete.length === 0 ? "PENDING" : passed ? "PASS" : "FAIL",
      explanation: passed
        ? "Warm-up zero errors are within the configured allowance."
        : "Warm-up zero error exceeds the configured allowance.",
      disclaimer: this.config.disclaimer,
    };
  }

  evaluate(testName: string, observations: any, instrument: InstrumentParams) {
    const name = (testName || "").toLowerCase();
    if (name.includes("weigh") && !name.includes("tare")) {
      const rows = Array.isArray(observations) ? observations : observations?.readings || [];
      return this.evaluateWeighing(rows, instrument);
    }
    if (name.includes("eccentric")) {
      const rows = Array.isArray(observations) ? observations : observations?.readings || [];
      return this.evaluateEccentricity(rows, instrument);
    }
    if (name.includes("repeat")) {
      const series = Array.isArray(observations) ? observations : observations?.series || [];
      return this.evaluateRepeatability(series, instrument);
    }
    if (name.includes("tare")) {
      const tvs = Array.isArray(observations) ? observations : observations?.tare_values || [];
      return this.evaluateTare(tvs, instrument);
    }
    if (name.includes("discrim")) {
      const pts = Array.isArray(observations) ? observations : observations?.load_points || [];
      return this.evaluateDiscrimination(pts, instrument);
    }
    if (name.includes("zero")) {
      return this.evaluateZeroReturn(Array.isArray(observations) ? observations[0] : observations, instrument);
    }
    if (name.includes("warm")) {
      const pts = Array.isArray(observations) ? observations : [];
      return this.evaluateWarmup(pts, instrument);
    }
    const rows = Array.isArray(observations) ? observations : [observations];
    return {
      testName,
      data: rows,
      passed: false,
      verdict: "PENDING" as Verdict,
      explanation: "No dedicated evaluator for this test type. Observations stored without a fabricated official rule.",
      disclaimer: this.config.disclaimer,
    };
  }
}

export const complianceEngine = new OIMLComplianceEngine();
