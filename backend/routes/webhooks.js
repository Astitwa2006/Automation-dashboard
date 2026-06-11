const express = require('express');
const router = express.Router();
const Workflow = require('../models/Workflow');
const Execution = require('../models/Execution');
const { runWorkflow } = require('../services/workflowEngine');

// Map webhook source to workflow type
const sourceTypeMap = {
  n8n: 'data_sync',
  email: 'email_parse',
  crm: 'lead_score'
};

async function handleWebhook(source, payload, io, res) {
  const type = sourceTypeMap[source];
  if (!type) {
    return res.status(400).json({ success: false, error: `Unknown webhook source: ${source}` });
  }

  // Find first active workflow of matching type
  const workflow = await Workflow.findOne({ type, status: 'active' });
  if (!workflow) {
    return res.status(404).json({
      success: false,
      error: `No active ${type} workflow found. Make sure a workflow of type "${type}" exists and is not paused.`
    });
  }

  // Create execution record
  const execution = new Execution({
    workflowId: workflow._id,
    status: 'running',
    triggerType: 'webhook'
  });
  await execution.save();

  // Fire and forget — run async without blocking response
  runWorkflow(workflow._id, execution._id, io).catch(console.error);

  return res.json({
    success: true,
    message: `Webhook received. Triggered workflow: "${workflow.name}"`,
    workflowId: workflow._id,
    executionId: execution._id,
    payload: payload
  });
}

// n8n general webhook — use in n8n HTTP Request node
// POST /api/webhooks/n8n
// Body: { "event": "...", "data": { ... } }
router.post('/n8n', async (req, res, next) => {
  try {
    const io = req.app.get('io');
    console.log('[Webhook] n8n event received:', JSON.stringify(req.body));
    await handleWebhook('n8n', req.body, io, res);
  } catch (error) {
    next(error);
  }
});

// Email inbox webhook
// POST /api/webhooks/email
// Body: { "from": "...", "subject": "...", "body": "..." }
router.post('/email', async (req, res, next) => {
  try {
    const io = req.app.get('io');
    console.log('[Webhook] Email event received:', JSON.stringify(req.body));
    await handleWebhook('email', req.body, io, res);
  } catch (error) {
    next(error);
  }
});

// CRM webhook — triggers lead scoring
// POST /api/webhooks/crm
// Body: { "leadEmail": "...", "company": "...", "name": "..." }
router.post('/crm', async (req, res, next) => {
  try {
    const io = req.app.get('io');
    console.log('[Webhook] CRM event received:', JSON.stringify(req.body));
    // Pass any lead data from CRM into execution context
    await handleWebhook('crm', req.body, io, res);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
