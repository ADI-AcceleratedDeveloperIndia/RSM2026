import { Schema, model, models } from "mongoose";

const GovernmentReportSchema = new Schema({
  reportId: { type: String, required: true, unique: true, index: true },
  title: { type: String, required: true },
  scope: {
    type: String,
    enum: ["statewide", "district", "national"],
    default: "statewide",
    index: true,
  },
  templateType: {
    type: String,
    enum: ["morth_atr", "cors_compliance", "drsc_action_plan", "general_impact"],
    default: "general_impact",
    index: true,
  },
  statutoryReference: { type: String, default: "MoRTH / CoRS Statutory Framework" },
  complianceScore: { type: Number, default: 95 },
  auditStatus: { type: String, default: "AUDIT-READY" },
  districtCode: { type: String },
  districtName: { type: String },
  state: { type: String, default: "State Government" },
  year: { type: Number, default: 2027 },
  generatedBy: { type: String, default: "Mission Control Engine" },
  
  executiveSummary: { type: String },
  
  // Synthesized 4E Indicators
  fourEAnalysis: {
    education: {
      totalInitiatives: { type: Number, default: 0 },
      participantsReached: { type: Number, default: 0 },
      institutionsEngaged: { type: Number, default: 0 },
      highlights: [String],
    },
    engineering: {
      blackspotsIdentified: { type: Number, default: 0 },
      potholesFixed: { type: Number, default: 0 },
      rectificationsCompleted: { type: Number, default: 0 },
      highlights: [String],
    },
    enforcement: {
      complianceDrives: { type: Number, default: 0 },
      helmetCheckpoints: { type: Number, default: 0 },
      highlights: [String],
    },
    emergency: {
      firstAidTrained: { type: Number, default: 0 },
      drillsConducted: { type: Number, default: 0 },
      highlights: [String],
    },
  },

  // MoRTH National Road Safety Month (NRSM-ATR) Statutory Metrics
  morthAtr: {
    campaignPeriod: {
      from: { type: String, default: "01 Jan 2027" },
      to: { type: String, default: "31 Jan 2027" },
    },
    driverHealthCamps: {
      campsCount: { type: Number, default: 0 },
      driversScreened: { type: Number, default: 0 },
      spectaclesDistributed: { type: Number, default: 0 },
    },
    blackspotAudit: {
      identified: { type: Number, default: 0 },
      rectified: { type: Number, default: 0 },
      underProcess: { type: Number, default: 0 },
      expenditureLakhs: { type: Number, default: 0 },
    },
    schoolZoneAudits: {
      schoolsAudited: { type: Number, default: 0 },
      signageInstalled: { type: Number, default: 0 },
      speedCalmingBuilt: { type: Number, default: 0 },
    },
    goodSamaritanSOP: {
      awarenessDrives: { type: Number, default: 0 },
      personsFelicitated: { type: Number, default: 0 },
      cashRewardsGivenLakhs: { type: Number, default: 0 },
    },
    massPledgesCount: { type: Number, default: 0 },
    studentQuizzesCompleted: { type: Number, default: 0 },
    simulationDrives: { type: Number, default: 0 },
  },

  // Supreme Court Committee on Road Safety (CoRS Form SCCRS-QPR) Metrics
  corsMatrix: {
    sccrsMeetingsHeld: { type: Number, default: 4 },
    drscMeetingComplianceRate: { type: Number, default: 96 },
    roadSafetyFund: {
      collectedCr: { type: Number, default: 84.5 },
      allocatedCr: { type: Number, default: 75.0 },
      utilizedPercentage: { type: Number, default: 88.7 },
    },
    enforcementData: {
      eChallansIssued: { type: Number, default: 0 },
      drunkenDrivingCases: { type: Number, default: 0 },
      helmetViolations: { type: Number, default: 0 },
      licenseSuspended: { type: Number, default: 0 },
    },
    electronicMonitoring: {
      speedCamsActive: { type: Number, default: 0 },
      interceptorVehicles: { type: Number, default: 0 },
      cctvIntersections: { type: Number, default: 0 },
    },
    goldenHourResponse: {
      avg108ResponseTimeMinutes: { type: Number, default: 11.4 },
      traumaCentresDesignated: { type: Number, default: 42 },
      cashlessSchemeActive: { type: Boolean, default: true },
    },
    iradComplianceRate: { type: Number, default: 94.2 },
  },

  // Section 215D District Road Safety Committee (DRSC) Dossier
  drscDossier: {
    committeeChairperson: { type: String, default: "District Collector & District Magistrate" },
    meetingDate: { type: String },
    interDeptDecisions: [{
      dept: String,
      task: String,
      deadline: String,
      status: String,
    }],
  },
  
  // Audits
  hazardAudit: {
    reported: { type: Number, default: 0 },
    resolved: { type: Number, default: 0 },
    rectificationRate: { type: Number, default: 0 },
  },
  actionAudit: {
    committed: { type: Number, default: 0 },
    completed: { type: Number, default: 0 },
    verified: { type: Number, default: 0 },
  },
  
  // Top Performing Districts in this report
  topDistricts: [{
    districtName: String,
    score: Number,
    grade: String,
    rank: Number,
  }],
  
  evidenceAnnexures: [{
    title: String,
    type: String,
    url: String,
    description: String,
  }],

  // Formal Gazette Signatories
  signatories: [{
    designation: String,
    name: String,
    department: String,
    status: { type: String, default: "Digitally Authenticated" },
    signedAt: { type: Date, default: Date.now },
  }],
  
  status: {
    type: String,
    enum: ["draft", "final", "published"],
    default: "final",
  },
  
  generatedAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

GovernmentReportSchema.index({ generatedAt: -1 });

export default models.GovernmentReport || model("GovernmentReport", GovernmentReportSchema);
