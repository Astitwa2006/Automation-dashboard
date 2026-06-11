const mongoose = require('mongoose');

const workflowSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['email_parse', 'lead_score', 'data_sync'], required: true },
  status: { type: String, enum: ['active', 'paused', 'error'], default: 'active' },
  description: String,
  config: { type: mongoose.Schema.Types.Mixed, default: {} },
  lastRun: Date,
  runCount: { type: Number, default: 0 },
  successCount: { type: Number, default: 0 },
  errorCount: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Workflow', workflowSchema);
