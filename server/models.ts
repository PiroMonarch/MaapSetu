import mongoose from "mongoose";

// ─── Instrument ────────────────────────────────────────────────────────────────
const instrumentSchema = new mongoose.Schema({
  manufacturer: { type: String, required: true },
  model: { type: String, required: true },
  serialNumber: { type: String },
  accuracyClass: { type: String, enum: ['I', 'II', 'III', 'IIII'], required: true },
  maxCapacity: { type: Number, required: true },   // kg
  minCapacity: { type: Number, required: true },   // g
  eValue: { type: Number, required: true },   // verification scale interval (g)
  dValue: { type: Number, required: true },   // actual scale interval (g)
  nMax: { type: Number },                   // computed: Max / e
  image: { type: String },
  registeredBy: { type: String },
  notes: { type: String },
}, { timestamps: true });

// Auto-compute nMax before save
instrumentSchema.pre('save', async function () {
  if (this.maxCapacity && this.eValue) {
    // convert maxCapacity (kg) to grams for comparison with eValue (g)
    this.nMax = Math.round((this.maxCapacity * 1000) / this.eValue);
  }
});

export const Instrument = mongoose.model("Instrument", instrumentSchema);

// ─── User ──────────────────────────────────────────────────────────────────────
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, enum: ['admin', 'lab_manager', 'test_officer', 'reviewer'], default: 'test_officer' },
  designation: { type: String },
  laboratory: { type: String },
}, { timestamps: true });

export const User = mongoose.model("User", userSchema);

// ─── Report ────────────────────────────────────────────────────────────────────
const reportSchema = new mongoose.Schema({
  applicationNo: { type: String, required: true, unique: true },
  instrumentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Instrument', required: true },
  status: { type: String, enum: ['Draft', 'In Progress', 'Under Review', 'Completed', 'Failed'], default: 'Draft' },
  oimlVersion: { type: String, default: 'OIML R 76-1:2006' },
  date: { type: Date, default: Date.now },
  inspector: { type: String },
  laboratory: { type: String },

  // Step 1 – Applicant / General
  applicantName: { type: String },
  applicantAddress: { type: String },
  purposeOfTest: { type: String, enum: ['Model Approval', 'Verification', 'Re-verification', 'Other'], default: 'Model Approval' },

  // Step 3 – Environmental / Lab conditions
  testConditions: {
    temperature: { type: String },
    humidity: { type: String },
    atmosphericPressure: { type: String },
    location: { type: String },
    referenceStandards: { type: String },
  },

  // Step 3 – Applicability matrix (stored as array of { id, name, type, active })
  applicability: { type: mongoose.Schema.Types.Mixed },

  // Instrument specs captured at time of report (may differ from instrument master)
  maxCapacity: { type: Number },
  minCapacity: { type: Number },
  eValue: { type: Number },
  dValue: { type: Number },

  // Final determination
  overallResult: { type: String, enum: ['Pass', 'Fail', 'Inconclusive', null], default: null },
  remarks: { type: String },
  reviewedBy: { type: String },
  reviewedAt: { type: Date },
}, { timestamps: true });

export const Report = mongoose.model("Report", reportSchema);

// ─── Test Result ───────────────────────────────────────────────────────────────
const testResultSchema = new mongoose.Schema({
  reportId: { type: mongoose.Schema.Types.ObjectId, ref: 'Report', required: true },
  testName: { type: String, required: true },
  testCode: { type: String },
  data: { type: mongoose.Schema.Types.Mixed, required: true },
  passed: { type: Boolean, default: null },
  aiSummary: { type: String }, // Gemini-generated summary
}, { timestamps: true });

export const TestResult = mongoose.model("TestResult", testResultSchema);

// ─── OIML Rule (versioned) ─────────────────────────────────────────────────────
const oimlRuleSchema = new mongoose.Schema({
  version: { type: String, required: true },  // e.g. "OIML R 76-1:2006"
  testCode: { type: String, required: true },  // e.g. "T.3.1"
  testName: { type: String, required: true },
  description: { type: String },
  applicableClasses: [{ type: String }],           // ['I','II','III','IIII']
  mpeFormula: { type: String },                  // human-readable formula
  limits: { type: mongoose.Schema.Types.Mixed },
  required: { type: Boolean, default: true },
}, { timestamps: true });

export const OimlRule = mongoose.model("OimlRule", oimlRuleSchema);
