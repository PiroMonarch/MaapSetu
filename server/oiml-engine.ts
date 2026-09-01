/**
 * OIML R 76-1:2006 Compliance Engine
 * ─────────────────────────────────────
 * All formulas are derived from OIML R 76-1 (Edition 2006, corrected 2009).
 * References: T.3.x, T.4.x, T.5.x clauses.
 *
 * Units convention throughout this file:
 *   - Load / Mass values  → grams (g)
 *   - e (scale interval)  → grams (g)
 *   - maxCapacity input   → kg → converted to g internally
 *
 * Rule source: data/rules/oiml-r76-2006.json (versioned, not hard-coded).
 * The getMPE() function uses the piecewise table from that file.
 */

import path from 'path';
import fs from 'fs';

// ─── Load rule set from JSON (once at startup) ────────────────────────────────
let _ruleSet: any = null;
function getRuleSet(): any {
    if (_ruleSet) return _ruleSet;
    const filePath = path.join(process.cwd(), 'data', 'rules', 'oiml-r76-2006.json');
    if (fs.existsSync(filePath)) {
        _ruleSet = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    }
    return _ruleSet;
}

export function getRuleSetInfo() {
    const rs = getRuleSet();
    return rs ? rs.rule_set : { id: 'OIML-R76-2006', version: '2006', status: 'ACTIVE' };
}

export function getTestTypes() {
    const rs = getRuleSet();
    return rs ? rs.test_types : [];
}

export function getRules() {
    const rs = getRuleSet();
    return rs ? rs.rules : [];
}

export type AccuracyClass = 'I' | 'II' | 'III' | 'IIII';

// ─── MPE Table (OIML R76-1 Table 1) ──────────────────────────────────────────
// Attempts to load from JSON rule set first; falls back to hardcoded table.
// Returns Max Permissible Error (±) in grams for a given load and instrument.
export function getMPE(loadG: number, eG: number, cls: AccuracyClass): number {
    const ruleSet = getRuleSet();
    if (ruleSet?.mpe_table?.classes?.[cls]) {
        const rows: Array<{ load_range_min_e: number; load_range_max_e: number | null; mpe_in_e: number }>
            = ruleSet.mpe_table.classes[cls];
        const multiples = loadG / eG;
        for (const row of rows) {
            const hi = row.load_range_max_e ?? Infinity;
            if (multiples >= row.load_range_min_e && multiples < hi) {
                return row.mpe_in_e * eG;
            }
        }
        return 1.5 * eG;
    }

    // ── Hardcoded fallback (mirrors JSON file) ──────────────────────────────────
    const table: Record<AccuracyClass, [number, number, number][]> = {
        'I': [[0, 50000, 0.5], [50000, 200000, 1.0], [200000, Infinity, 1.5]],
        'II': [[0, 5000, 0.5], [5000, 20000, 1.0], [20000, Infinity, 1.5]],
        'III': [[0, 500, 0.5], [500, 2000, 1.0], [2000, Infinity, 1.5]],
        'IIII': [[0, 50, 0.5], [50, 200, 1.0], [200, Infinity, 1.5]],
    };
    const multiples = loadG / eG;
    const rows = table[cls];
    for (const [lo, hi, mpeE] of rows) {
        if (multiples >= lo && multiples < hi) return mpeE * eG;
    }
    return 1.5 * eG;
}

// ─── Weighing Performance (T.3.2) ─────────────────────────────────────────────
export interface WeighingRow {
    load: number;   // g — applied test load
    ind: number;   // g — instrument indication
    add: number;   // g — added small weight (ΔL) to find switch point
}

export interface WeighingResult {
    load: number;
    ind: number;
    add: number;
    P: number;   // conventional indication = I + 0.5e - ΔL
    E: number;   // error = P - L
    Ec: number;   // corrected error = E - E0
    mpe: number;   // ±
    result: 'Pass' | 'Fail' | 'Review' | 'Pending';
}

export function evaluateWeighingPerformance(
    rows: WeighingRow[],
    eG: number,
    cls: AccuracyClass
): { results: WeighingResult[]; passed: boolean; summary: string } {
    // E0 = error at zero (first zero load reading)
    let E0 = 0;
    const zeroRow = rows.find(r => r.load === 0);
    if (zeroRow) {
        const P0 = zeroRow.ind + 0.5 * eG - zeroRow.add;
        E0 = P0 - 0;
    }

    const results: WeighingResult[] = rows.map(r => {
        const P = r.ind + 0.5 * eG - r.add;
        const E = P - r.load;
        const Ec = E - E0;
        const mpe = getMPE(r.load, eG, cls);
        const absEc = Math.abs(Ec);
        const result: WeighingResult['result'] =
            absEc > mpe ? 'Fail' : absEc === mpe ? 'Review' : 'Pass';
        return { load: r.load, ind: r.ind, add: r.add, P, E, Ec, mpe, result };
    });

    const passed = results.every(r => r.result !== 'Fail');
    const fails = results.filter(r => r.result === 'Fail').length;
    const summary = passed
        ? `All ${results.length} weighing readings comply with MPE.`
        : `${fails} out of ${results.length} readings exceed MPE. Test FAILED.`;

    return { results, passed, summary };
}

// ─── Repeatability (T.3.3) ────────────────────────────────────────────────────
export interface RepeatabilityRow {
    reading: number;  // grams
}

export interface RepeatabilityResult {
    readings: number[];
    mean: number;
    range: number;   // max - min
    mpeRepeat: number;   // 0.5 * e (initial and final verification)
    passed: boolean;
    summary: string;
}

export function evaluateRepeatability(
    readings: number[],
    eG: number
): RepeatabilityResult {
    if (!readings.length) {
        return { readings: [], mean: 0, range: 0, mpeRepeat: 0.5 * eG, passed: false, summary: 'No readings provided.' };
    }
    const mean = readings.reduce((a, b) => a + b, 0) / readings.length;
    const range = Math.max(...readings) - Math.min(...readings);
    // R 76 clause T.3.3: range must not exceed 0.5e (for initial verification, 1e for in-service)
    const mpeRepeat = 0.5 * eG;
    const passed = range <= mpeRepeat;
    const summary = passed
        ? `Repeatability range ${range.toFixed(4)}g ≤ MPE ${mpeRepeat.toFixed(4)}g. PASS.`
        : `Repeatability range ${range.toFixed(4)}g exceeds MPE ${mpeRepeat.toFixed(4)}g. FAIL.`;
    return { readings, mean, range, mpeRepeat, passed, summary };
}

// ─── Eccentricity (T.3.4) ─────────────────────────────────────────────────────
// Five load positions: centre + N/S/E/W (or 5 equidistant positions)
export interface EccentricityRow {
    position: string;  // 'Centre' | 'NE' | 'NW' | 'SE' | 'SW' etc.
    indication: number; // grams
}

export interface EccentricityResult {
    rows: EccentricityRow[];
    maxDiff: number;
    mpe: number;  // = getMPE(testLoad, e, cls)
    passed: boolean;
    summary: string;
}

export function evaluateEccentricity(
    rows: EccentricityRow[],
    testLoadG: number,
    eG: number,
    cls: AccuracyClass
): EccentricityResult {
    if (!rows.length) {
        const mpe = getMPE(testLoadG, eG, cls);
        return { rows, maxDiff: 0, mpe, passed: false, summary: 'No readings provided.' };
    }
    const inds = rows.map(r => r.indication);
    const maxDiff = Math.max(...inds) - Math.min(...inds);
    const mpe = getMPE(testLoadG, eG, cls);
    const passed = maxDiff <= mpe;
    const summary = passed
        ? `Max eccentricity difference ${maxDiff.toFixed(4)}g ≤ MPE ${mpe.toFixed(4)}g. PASS.`
        : `Max eccentricity difference ${maxDiff.toFixed(4)}g exceeds MPE ${mpe.toFixed(4)}g. FAIL.`;
    return { rows, maxDiff, mpe, passed, summary };
}

// ─── Discrimination (T.3.5) ───────────────────────────────────────────────────
// Instrument indication must change by at least 1d when 0.1e is added
export interface DiscriminationResult {
    loadG: number;
    addedWeightG: number;   // should be 0.1 * e
    indicationBefore: number;
    indicationAfter: number;
    changeMagnitude: number;
    minimumRequired: number;  // 1 * d  (but per R76 = 1 scale interval)
    passed: boolean;
    summary: string;
}

export function evaluateDiscrimination(
    loadG: number,
    indicationBefore: number,
    indicationAfter: number,
    addedWeightG: number,
    dG: number
): DiscriminationResult {
    const changeMagnitude = Math.abs(indicationAfter - indicationBefore);
    const minimumRequired = dG; // indication must change by at least 1d
    const passed = changeMagnitude >= minimumRequired;
    const summary = passed
        ? `Indication changed by ${changeMagnitude.toFixed(4)}g (≥ ${minimumRequired.toFixed(4)}g). PASS.`
        : `Indication changed by ${changeMagnitude.toFixed(4)}g (< ${minimumRequired.toFixed(4)}g required). FAIL.`;
    return {
        loadG, addedWeightG, indicationBefore, indicationAfter,
        changeMagnitude, minimumRequired, passed, summary
    };
}

// ─── Tare (T.4.1) ─────────────────────────────────────────────────────────────
export interface TareResult {
    tareMassG: number;
    indicationAfterTare: number;
    zeroThreshold: number;   // must be within ±0.25e
    passed: boolean;
    summary: string;
}

export function evaluateTare(
    tareMassG: number,
    indicationAfterTare: number,
    eG: number
): TareResult {
    const zeroThreshold = 0.25 * eG;
    const passed = Math.abs(indicationAfterTare) <= zeroThreshold;
    const summary = passed
        ? `Tare indication ${indicationAfterTare.toFixed(4)}g within ±${zeroThreshold.toFixed(4)}g. PASS.`
        : `Tare indication ${indicationAfterTare.toFixed(4)}g exceeds ±${zeroThreshold.toFixed(4)}g. FAIL.`;
    return { tareMassG, indicationAfterTare, zeroThreshold, passed, summary };
}

// ─── Overall Report Determination ─────────────────────────────────────────────
export function determineOverallResult(
    testResults: Array<{ testName: string; passed: boolean | null }>
): { result: 'Pass' | 'Fail' | 'Inconclusive'; failedTests: string[] } {
    const failedTests = testResults
        .filter(t => t.passed === false)
        .map(t => t.testName);

    if (testResults.some(t => t.passed === null)) {
        return { result: 'Inconclusive', failedTests };
    }
    if (failedTests.length > 0) {
        return { result: 'Fail', failedTests };
    }
    return { result: 'Pass', failedTests: [] };
}

// ─── nMax Computation ─────────────────────────────────────────────────────────
export function computeNMax(maxCapacityKg: number, eG: number): number {
    return Math.round((maxCapacityKg * 1000) / eG);
}

// ─── Class Verification (R76 T.1.1) ──────────────────────────────────────────
// Verifies that the number of scale intervals n = Max/e falls within class limits
export function verifyClassConsistency(
    cls: AccuracyClass,
    nMax: number
): { valid: boolean; message: string } {
    const limits: Record<AccuracyClass, [number, number]> = {
        'I': [50000, Infinity],
        'II': [100, 100000],
        'III': [100, 10000],
        'IIII': [100, 1000],
    };
    const [lo, hi] = limits[cls];
    const valid = nMax >= lo && nMax <= hi;
    return {
        valid,
        message: valid
            ? `Class ${cls} valid: n = ${nMax} is within [${lo}, ${hi === Infinity ? '∞' : hi}].`
            : `Warning: n = ${nMax} is outside the valid range [${lo}, ${hi === Infinity ? '∞' : hi}] for Class ${cls}.`,
    };
}
