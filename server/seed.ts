/**
 * Database seeder — loads synthetic dataset from data/ JSON files.
 * Instruments, users, test cases, observations, and OIML rules all
 * come from the versioned JSON files in data/ rather than being
 * hard-coded here. The rule engine logic is in oiml-engine.ts.
 */

import path from 'path';
import fs from 'fs';
import { Instrument, Report, TestResult, User, OimlRule } from './models';
import { getMPE, evaluateWeighingPerformance, evaluateRepeatability, evaluateEccentricity, type AccuracyClass } from './oiml-engine';

// ─── Helpers ───────────────────────────────────────────────────────────────────
function loadJSON(relPath: string) {
  const abs = path.join(process.cwd(), relPath);
  if (!fs.existsSync(abs)) {
    console.warn(`[seed] JSON file not found: ${abs}`);
    return null;
  }
  return JSON.parse(fs.readFileSync(abs, 'utf-8'));
}

// Maps legacy dataset instrument_id strings → Mongoose ObjectIds
const instrumentIdMap: Record<string, string> = {};

// ─── Instruments ───────────────────────────────────────────────────────────────
async function seedInstruments() {
  const count = await Instrument.countDocuments();
  if (count > 0) return;

  const data = loadJSON('data/instruments/instruments.json');
  if (!data) {
    console.log('[seed] No instruments data file found, skipping.');
    return;
  }

  console.log('[seed] Seeding instruments from data/instruments/instruments.json …');
  for (const item of data) {
    const doc = await Instrument.create({
      manufacturer: item.manufacturer,
      model: item.model,
      serialNumber: item.serial_number,
      accuracyClass: item.accuracy_class,
      maxCapacity: item.max_capacity_kg,
      minCapacity: item.min_capacity_kg,
      eValue: item.verification_scale_interval_kg,
      dValue: item.display_scale_interval_kg ?? item.verification_scale_interval_kg,
      nMax: item.number_of_verification_intervals,
      notes: item.notes,
    });
    instrumentIdMap[item.instrument_id] = String(doc._id);
  }
  console.log(`[seed] ${Object.keys(instrumentIdMap).length} instruments seeded.`);
}

// ─── Users ─────────────────────────────────────────────────────────────────────
async function seedUsers() {
  const count = await User.countDocuments();
  if (count > 0) return;

  const data = loadJSON('data/users/users.json');
  if (!data) {
    // Minimal fallback
    await User.create({
      email: 'inspector@maapsetu.com', password: 'password123',
      name: 'Anjali Sharma', role: 'test_officer',
      designation: 'Scientific Officer', laboratory: 'NABL Lab',
    });
    return;
  }

  const roleMap: Record<string, string> = {
    TEST_OFFICER: 'test_officer', LAB_MANAGER: 'lab_manager',
    REVIEWER: 'reviewer', AUDITOR: 'reviewer', ADMIN: 'admin',
  };

  console.log('[seed] Seeding users from data/users/users.json …');
  const passwords: Record<string, string> = {
    'admin@maapsetu.com': 'admin123',
    'inspector@maapsetu.com': 'password123',
    'manager@maapsetu.com': 'password123',
    'reviewer@maapsetu.com': 'password123',
    'auditor@maapsetu.com': 'password123',
  };

  for (const u of data) {
    await User.create({
      email: u.email,
      password: passwords[u.email] ?? 'password123',
      name: u.name,
      role: roleMap[u.role] ?? 'test_officer',
      designation: u.designation,
      laboratory: u.laboratory_id,
    });
  }
  console.log(`[seed] ${data.length} users seeded.`);
}

// ─── OIML Rules ────────────────────────────────────────────────────────────────
async function seedOimlRules() {
  const count = await OimlRule.countDocuments();
  if (count > 0) return;

  const ruleSet = loadJSON('data/rules/oiml-r76-2006.json');
  if (!ruleSet) return;

  console.log('[seed] Seeding OIML rules from data/rules/oiml-r76-2006.json …');
  const version = ruleSet.rule_set.id;

  for (const t of ruleSet.test_types) {
    const rule = ruleSet.rules.find((r: any) => r.test_type === t.code) || {};
    await OimlRule.create({
      version: version,
      testCode: t.clause || t.code,
      testName: t.name,
      description: rule.description || t.name,
      applicableClasses: rule.applicable_classes || ['I', 'II', 'III', 'IIII'],
      mpeFormula: rule.calculation
        ? Object.values(rule.calculation).filter(v => typeof v === 'string').join('; ')
        : '',
      limits: rule.calculation || {},
      required: t.required,
    });
  }
  console.log(`[seed] ${ruleSet.test_types.length} OIML rules seeded.`);
}

// ─── Synthetic Reports + Observations ──────────────────────────────────────────
async function seedReports() {
  const count = await Report.countDocuments();
  if (count > 0) return;

  const testCases = loadJSON('data/test_cases/test_cases.json');
  const observations = loadJSON('data/observations/observations.json');
  const reports = loadJSON('data/reports/reports.json');

  if (!testCases || !observations || !reports) {
    console.log('[seed] Skipping report seeding — data files not found.');
    return;
  }

  console.log('[seed] Seeding synthetic test cases and observations …');

  const statusMap: Record<string, string> = {
    COMPLETED: 'Completed',
    FAIL: 'Failed',
    IN_PROGRESS: 'In Progress',
    DRAFT: 'Draft',
    UNDER_REVIEW: 'Under Review',
  };

  const purposeMap: Record<string, string> = {
    'Model Approval': 'Model Approval',
    'Verification': 'Verification',
    'Re-verification': 'Re-verification',
  };

  const allObs: any[] = observations.observations || [];

  for (let i = 0; i < testCases.length; i++) {
    const tc = testCases[i];
    const rpt = reports[i] || {};

    const instId = instrumentIdMap[tc.instrument_id];
    if (!instId) {
      console.warn(`[seed] No Mongoose ID found for ${tc.instrument_id}, skipping TC ${tc.test_case_id}`);
      continue;
    }

    // Compute overall result from observations
    const tcObs = allObs.filter((o: any) => o.test_case_id === tc.test_case_id);
    const anyFail = tcObs.some((o: any) => o.engine_result === 'FAIL');

    const statusStr = (() => {
      if (tc.status === 'COMPLETED' && tc.overall_result === 'FAIL') return 'Failed';
      if (tc.status === 'COMPLETED') return 'Completed';
      return statusMap[tc.status] || 'Draft';
    })();

    // Create report
    const report = await Report.create({
      applicationNo: tc.application_number,
      instrumentId: instId,
      status: statusStr,
      oimlVersion: tc.rule_set_id,
      date: new Date(tc.test_date),
      inspector: tc.operator_id === 'USR-001' ? 'Anjali Sharma'
        : tc.operator_id === 'USR-003' ? 'Sunita Patil'
          : tc.operator_id === 'USR-004' ? 'Karthik Rajan'
            : 'Inspector',
      laboratory: tc.laboratory_id === 'LAB-001' ? 'Regional LM Lab, Faridabad'
        : tc.laboratory_id === 'LAB-002' ? 'State LM Lab, Pune'
          : 'Central W&M Lab, Chennai',
      applicantName: tc.applicant_name,
      applicantAddress: tc.applicant_address,
      purposeOfTest: purposeMap[tc.purpose_of_test] || 'Model Approval',
      testConditions: {
        temperature: `${tc.environment.temperature_c} °C`,
        humidity: `${tc.environment.relative_humidity_percent} %`,
        atmosphericPressure: `${tc.environment.atmospheric_pressure_hpa} hPa`,
        location: tc.environment.test_room,
        referenceStandards: `${tc.environment.reference_weight_set} (Cert: ${tc.environment.reference_weight_calibration_cert})`,
      },
      overallResult: tc.overall_result === 'PASS' ? 'Pass'
        : tc.overall_result === 'FAIL' ? 'Fail'
          : null,
      remarks: rpt.remarks || tc.remarks || '',
    });

    // Attach test results — group observations by test_type
    const groupedByType: Record<string, any[]> = {};
    for (const obs of tcObs) {
      const key = obs.test_type;
      if (!groupedByType[key]) groupedByType[key] = [];
      groupedByType[key].push(obs);
    }

    for (const [testType, obsGroup] of Object.entries(groupedByType)) {
      const testFailed = obsGroup.some(o => o.engine_result === 'FAIL');
      const testName = {
        WEIGHING: 'Weighing Performance',
        REPEATABILITY: 'Repeatability',
        ECCENTRICITY: 'Eccentricity',
        DISCRIMINATION: 'Discrimination',
        TARE: 'Tare Weighing',
        ZERO: 'Zero-Setting',
        INCREASING_LOAD: 'Increasing Load',
        DECREASING_LOAD: 'Decreasing Load',
      }[testType] || testType;

      const testCode = {
        WEIGHING: 'T.3.2', REPEATABILITY: 'T.3.3', ECCENTRICITY: 'T.3.4',
        DISCRIMINATION: 'T.3.5', TARE: 'T.4.1', ZERO: 'T.3.1',
        INCREASING_LOAD: 'T.3.2', DECREASING_LOAD: 'T.3.2',
      }[testType] || '';

      await TestResult.create({
        reportId: report._id,
        testName,
        testCode,
        data: obsGroup.map(o => ({
          observationId: o.observation_id,
          testLoad: o.test_load_kg,
          indication: o.indicated_value_kg,
          reference: o.reference_value_kg,
          error: o.error_kg,
          mpe: o.mpe_kg,
          position: o.position,
          engineResult: o.engine_result,
          note: o.calculation_note,
        })),
        passed: !testFailed,
      });
    }
  }

  console.log(`[seed] ${testCases.length} synthetic test cases seeded with observations.`);
}

// ─── Main ──────────────────────────────────────────────────────────────────────
export const seedDatabase = async () => {
  await seedInstruments();
  await seedUsers();
  await seedOimlRules();
  await seedReports();
  console.log('[seed] Database ready.');
};
