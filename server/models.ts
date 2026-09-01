import mongoose from "mongoose";

const ROLES = ["ADMIN", "LAB_MANAGER", "TECHNICIAN", "REVIEWER"] as const;
export type UserRole = (typeof ROLES)[number];

const STATUSES = [
  "Draft",
  "In Progress",
  "Completed",
  "Under Review",
  "Approved",
  "Rejected",
] as const;
export type ReportStatus = (typeof STATUSES)[number];

const instrumentSchema = new mongoose.Schema(
  {
    instrumentId: { type: String, unique: true, sparse: true, index: true },
    manufacturer: { type: String, required: true },
    model: { type: String, required: true },
    serialNumber: { type: String },
    instrumentType: { type: String },
    accuracyClass: { type: String },
    maxCapacity: { type: Number },
    minCapacity: { type: Number },
    eValue: { type: Number },
    dValue: { type: Number },
    image: { type: String },
  },
  { timestamps: true }
);

export const Instrument = mongoose.model("Instrument", instrumentSchema);

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    role: { type: String, enum: ROLES, default: "TECHNICIAN" },
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);

const attachmentSchema = new mongoose.Schema(
  {
    kind: {
      type: String,
      enum: ["instrument_photo", "nameplate_photo", "test_setup_photo", "supporting_document", "other"],
      default: "other",
    },
    originalName: String,
    storedName: String,
    mimeType: String,
    size: Number,
  },
  { _id: true, timestamps: true }
);

const reportSchema = new mongoose.Schema(
  {
    applicationNo: { type: String, required: true, unique: true, index: true },
    instrumentId: { type: mongoose.Schema.Types.ObjectId, ref: "Instrument", required: true },
    status: { type: String, enum: STATUSES, default: "Draft", index: true },
    overallVerdict: { type: String, enum: ["PASS", "FAIL", "PENDING"], default: "PENDING", index: true },
    date: { type: Date, default: Date.now },
    standardReference: {
      type: String,
      default: "Legal Metrology (General) Rules, 2011 - Seventh Schedule (NAWI); OIML R-76",
    },
    laboratoryDetails: {
      name: { type: String, default: "MaapSetu Demo Laboratory (Synthetic)" },
      address: { type: String, default: "Prototype environment — not an accredited laboratory" },
      accreditation: { type: String, default: "Demo / synthetic data only" },
    },
    environmentalConditions: {
      temperature: { type: String },
      humidity: { type: String },
      location: { type: String },
    },
    inspector: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reviewNotes: { type: String },
    reviewedAt: { type: Date },
    applicability: { type: mongoose.Schema.Types.Mixed },
    remarks: { type: String },
    attachments: [attachmentSchema],
    isSynthetic: { type: Boolean, default: false },
    maxCapacity: { type: Number },
    minCapacity: { type: Number },
    eValue: { type: Number },
    dValue: { type: Number },
  },
  { timestamps: true }
);

reportSchema.index({ status: 1, date: -1 });
reportSchema.index({ overallVerdict: 1 });

export const Report = mongoose.model("Report", reportSchema);

const testResultSchema = new mongoose.Schema(
  {
    reportId: { type: mongoose.Schema.Types.ObjectId, ref: "Report", required: true, index: true },
    testName: { type: String, required: true },
    category: { type: String },
    data: { type: mongoose.Schema.Types.Mixed, required: true },
    passed: { type: Boolean, default: null },
    verdict: { type: String, enum: ["PASS", "FAIL", "PENDING"], default: "PENDING" },
    explanation: { type: String },
    calculation: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

testResultSchema.index({ reportId: 1, testName: 1 }, { unique: true });

export const TestResult = mongoose.model("TestResult", testResultSchema);

const complianceRuleSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    condition: { type: String },
    limits: { type: mongoose.Schema.Types.Mixed },
    isOfficial: { type: Boolean, default: false },
    disclaimer: { type: String },
  },
  { timestamps: true }
);

export const ComplianceRule = mongoose.model("ComplianceRule", complianceRuleSchema);

export const ROLE_LIST = ROLES;
export const STATUS_LIST = STATUSES;
