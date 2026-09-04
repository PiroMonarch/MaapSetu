/**
 * Centralized, configurable OIML R-76 rule layer (prototype).
 *
 * These tables follow the commonly published MPE interval structure for
 * accuracy classes I–IIII. They are stored as configuration so they can be
 * updated without rewriting calculation code.
 *
 * DISCLAIMER: This is prototype/demo logic for a hackathon system. It is not
 * a certified extract of the official OIML R-76 text and must not be treated
 * as a verified regulatory requirement.
 */

export type AccuracyClass = "I" | "II" | "III" | "IIII";

export interface MpeBand {
  /** Inclusive upper bound of load expressed in number of e. */
  maxE: number;
  mpeInE: number;
}

export interface ComplianceConfig {
  source: "prototype-configurable";
  disclaimer: string;
  substitutionFormula: string;
  simpleErrorFormula: string;
  mpeTables: Record<AccuracyClass, MpeBand[]>;
  discrimination: {
    /** Digital indication must change by at least this factor × added weight (demo). */
    minChangeFactor: number;
    addedWeightInD: number;
  };
  zeroReturn: {
    /** Allowed |deviation| in units of e (demo default 0.5 e). */
    allowedInE: number;
  };
  warmup: {
    allowedZeroErrorInE: number;
  };
  repeatability: {
    /** Compare range of indications against MPE at the test load (demo). */
    useRangeVsMpe: boolean;
  };
}

export const COMPLIANCE_DISCLAIMER =
  "Prototype/demo configurable rules. Not a certified official OIML extract. Values are adjustable in the compliance configuration layer.";

export const DEFAULT_COMPLIANCE_CONFIG: ComplianceConfig = {
  source: "prototype-configurable",
  disclaimer: COMPLIANCE_DISCLAIMER,
  substitutionFormula: "P = I + 0.5·e − ΔL;  E = P − L;  Ec = E − E0",
  simpleErrorFormula: "Error = Indication − Test Load",
  mpeTables: {
    I: [
      { maxE: 50000, mpeInE: 0.5 },
      { maxE: 200000, mpeInE: 1.0 },
      { maxE: Infinity, mpeInE: 1.5 },
    ],
    II: [
      { maxE: 5000, mpeInE: 0.5 },
      { maxE: 20000, mpeInE: 1.0 },
      { maxE: Infinity, mpeInE: 1.5 },
    ],
    III: [
      { maxE: 500, mpeInE: 0.5 },
      { maxE: 2000, mpeInE: 1.0 },
      { maxE: Infinity, mpeInE: 1.5 },
    ],
    IIII: [
      { maxE: 50, mpeInE: 0.5 },
      { maxE: 200, mpeInE: 1.0 },
      { maxE: Infinity, mpeInE: 1.5 },
    ],
  },
  discrimination: {
    minChangeFactor: 1.0,
    addedWeightInD: 1.4,
  },
  zeroReturn: {
    allowedInE: 0.5,
  },
  warmup: {
    allowedZeroErrorInE: 0.5,
  },
  repeatability: {
    useRangeVsMpe: true,
  },
};

export function normalizeAccuracyClass(value?: string | null): AccuracyClass {
  const v = String(value || "III").toUpperCase().replace(/CLASS\s+/g, "").trim();
  if (v === "I" || v === "1") return "I";
  if (v === "II" || v === "2") return "II";
  if (v === "IIII" || v === "IV" || v === "4") return "IIII";
  return "III";
}

export function mpeForLoad(loadG: number, eG: number, accuracyClass: string, config = DEFAULT_COMPLIANCE_CONFIG) {
  const cls = normalizeAccuracyClass(accuracyClass);
  const e = eG > 0 ? eG : 1;
  const n = Math.abs(loadG) / e;
  const bands = config.mpeTables[cls] || config.mpeTables.III;
  const band = bands.find((b) => n <= b.maxE) || bands[bands.length - 1];
  const mpeG = band.mpeInE * e;
  return {
    accuracyClass: cls,
    loadG,
    eG: e,
    loadInE: n,
    mpeInE: band.mpeInE,
    mpeG,
    rule: `Class ${cls}: |m| ≤ ${band.maxE === Infinity ? "∞" : band.maxE} e → MPE = ±${band.mpeInE} e`,
    source: config.source,
    disclaimer: config.disclaimer,
  };
}

export function mpeThresholdRows(eG: number, accuracyClass: string, config = DEFAULT_COMPLIANCE_CONFIG) {
  const cls = normalizeAccuracyClass(accuracyClass);
  const e = eG > 0 ? eG : 1;
  const bands = config.mpeTables[cls] || config.mpeTables.III;
  let prev = 0;
  return bands.map((band) => {
    const fromE = prev;
    const toE = band.maxE;
    prev = band.maxE;
    return {
      label:
        toE === Infinity
          ? `${fromE}e < m`
          : fromE === 0
            ? `0 ≤ m ≤ ${toE}e`
            : `${fromE}e < m ≤ ${toE}e`,
      mpeG: band.mpeInE * e,
      mpeInE: band.mpeInE,
      fromE,
      toE,
    };
  });
}
