import mongoose from "mongoose";

const instrumentSchema = new mongoose.Schema({
  manufacturer: { type: String, required: true },
  model: { type: String, required: true },
  serialNumber: { type: String },
  accuracyClass: { type: String },
  maxCapacity: { type: Number },
  minCapacity: { type: Number },
  eValue: { type: Number }, // verification scale interval
  dValue: { type: Number }, // actual scale interval
  image: { type: String },
}, { timestamps: true });

export const Instrument = mongoose.model("Instrument", instrumentSchema);

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, default: 'inspector' },
});

export const User = mongoose.model("User", userSchema);

const reportSchema = new mongoose.Schema({
  applicationNo: { type: String, required: true, unique: true },
  instrumentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Instrument', required: true },
  status: { type: String, enum: ['Draft', 'Completed'], default: 'Draft' },
  date: { type: Date, default: Date.now },
  inspector: { type: String },
  testConditions: {
    temperature: { type: String },
    humidity: { type: String },
    location: { type: String },
  },
  remarks: { type: String }
}, { timestamps: true });

export const Report = mongoose.model("Report", reportSchema);

const testResultSchema = new mongoose.Schema({
  reportId: { type: mongoose.Schema.Types.ObjectId, ref: 'Report', required: true },
  testName: { type: String, required: true },
  data: { type: mongoose.Schema.Types.Mixed, required: true },
  passed: { type: Boolean, default: null }
}, { timestamps: true });

export const TestResult = mongoose.model("TestResult", testResultSchema);

const complianceRuleSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  condition: { type: String },
  limits: { type: mongoose.Schema.Types.Mixed }
});

export const ComplianceRule = mongoose.model("ComplianceRule", complianceRuleSchema);
