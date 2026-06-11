const mongoose = require('mongoose');

const executionSchema = new mongoose.Schema({
  workflowId: { type: mongoose.Schema.Types.ObjectId, ref: 'Workflow', required: true },
  status: { type: String, enum: ['running', 'success', 'error', 'cancelled'], default: 'running' },
  steps: [{
    name: String,
    status: { type: String, enum: ['pending', 'running', 'success', 'error'] },
    duration: Number,
    output: mongoose.Schema.Types.Mixed,
    startedAt: Date,
    completedAt: Date
  }],
  startedAt: { type: Date, default: Date.now },
  completedAt: Date,
  duration: Number,
  triggerType: { type: String, enum: ['manual', 'webhook', 'scheduled'], default: 'manual' }
}, { timestamps: true });

module.exports = mongoose.model('Execution', executionSchema);
