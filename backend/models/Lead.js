const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  email: { type: String, required: true },
  name: String,
  company: String,
  score: { type: Number, default: 0, min: 0, max: 100 },
  factors: {
    emailEngagement: Number,
    websiteActivity: Number,
    companySize: Number,
    jobTitle: Number,
    recentInteraction: Number
  },
  status: { type: String, enum: ['new', 'contacted', 'qualified', 'converted'], default: 'new' },
  source: String,
  workflowId: { type: mongoose.Schema.Types.ObjectId, ref: 'Workflow' },
  executionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Execution' }
}, { timestamps: true });

module.exports = mongoose.model('Lead', leadSchema);
