
const ExecutionModel = require('../models/Execution');
const LogModel = require('../models/Log');
const LeadModel = require('../models/Lead');
const WorkflowModel = require('../models/Workflow');

const simulateStepDelay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function executeEmailParse(execution, io) {
  const steps = [
    { name: 'Connect to Inbox', delay: 1000 },
    { name: 'Fetch Unread Emails', delay: 1500 },
    { name: 'Extract Headers & Body', delay: 800 },
    { name: 'Classify Intent (AI)', delay: 2000 }
  ];
  return await runSteps(execution, steps, io);
}

async function executeLeadScore(execution, io) {
  const steps = [
    { name: 'Fetch Lead Data', delay: 800 },
    { name: 'Enrich Company Info', delay: 1200 },
    { name: 'Calculate Engagement Score', delay: 1000 },
    { name: 'Update CRM', delay: 1500 }
  ];
  const result = await runSteps(execution, steps, io);
  
  if (result.status === 'success') {
    const lead = new LeadModel({
      email: `test-${Date.now()}@example.com`,
      name: 'Demo User',
      company: 'Tech Corp',
      score: Math.floor(Math.random() * 50) + 50,
      status: 'new',
      factors: { companySize: 35 }
    });
    await lead.save();
    io.emit('lead:new', { lead });
  }
  return result;
}

async function executeDataSync(execution, io) {
  const steps = [
    { name: 'Connect to Source API', delay: 1000 },
    { name: 'Fetch Delta Records', delay: 2000 },
    { name: 'Transform Schema', delay: 1500 },
    { name: 'Upsert to Destination DB', delay: 2500 }
  ];
  return await runSteps(execution, steps, io);
}

async function runSteps(execution, stepDefinitions, io) {
  execution.steps = stepDefinitions.map(s => ({ name: s.name, status: 'pending' }));
  await execution.save();
  io.emit('execution:progress', { executionId: execution._id, workflowId: execution.workflowId });

  let success = true;
  for (let i = 0; i < stepDefinitions.length; i++) {
    const stepDef = stepDefinitions[i];
    
    execution.steps[i].status = 'running';
    execution.steps[i].startedAt = new Date();
    await execution.save();
    io.emit('execution:progress', { executionId: execution._id, workflowId: execution.workflowId, step: { name: stepDef.name, status: 'running', duration: 0 }, progress: Math.floor((i / stepDefinitions.length) * 100) });

    const log = new LogModel({
      workflowId: execution.workflowId,
      executionId: execution._id,
      level: 'info',
      message: `Starting step: ${stepDef.name}`
    });
    await log.save();
    io.emit('log:new', { log });

    await simulateStepDelay(stepDef.delay);

    if (Math.random() < 0.05) {
      execution.steps[i].status = 'error';
      execution.steps[i].completedAt = new Date();
      success = false;
      
      const errLog = new LogModel({
        workflowId: execution.workflowId,
        executionId: execution._id,
        level: 'error',
        message: `Failed at step: ${stepDef.name} - simulated error`
      });
      await errLog.save();
      io.emit('log:new', { log: errLog });
      break;
    }

    execution.steps[i].status = 'success';
    execution.steps[i].duration = stepDef.delay;
    execution.steps[i].completedAt = new Date();
    await execution.save();
    io.emit('execution:progress', { executionId: execution._id, workflowId: execution.workflowId, step: { name: stepDef.name, status: 'success', duration: stepDef.delay }, progress: Math.floor(((i + 1) / stepDefinitions.length) * 100) });
  }

  return { status: success ? 'success' : 'error' };
}

async function runWorkflow(workflowId, executionId, io) {
  const workflow = await WorkflowModel.findById(workflowId);
  if (!workflow) throw new Error('Workflow not found');

  const execution = await ExecutionModel.findById(executionId);
  if (!execution) throw new Error('Execution not found');

  const startLog = new LogModel({
    workflowId: workflow._id,
    executionId: execution._id,
    level: 'info',
    message: `Started workflow execution: ${workflow.name}`
  });
  await startLog.save();
  io.emit('log:new', { log: startLog });
  io.emit('execution:started', { executionId: execution._id, workflowId: workflow._id });

  let result;
  const startTime = Date.now();

  try {
    switch (workflow.type) {
      case 'email_parse':
        result = await executeEmailParse(execution, io);
        break;
      case 'lead_score':
        result = await executeLeadScore(execution, io);
        break;
      case 'data_sync':
        result = await executeDataSync(execution, io);
        break;
      default:
        throw new Error('Unknown workflow type');
    }

    execution.status = result.status;
    execution.completedAt = new Date();
    execution.duration = Date.now() - startTime;
    await execution.save();

    workflow.lastRun = new Date();
    workflow.runCount += 1;
    if (result.status === 'success') {
      workflow.successCount += 1;
    } else {
      workflow.errorCount += 1;
    }
    await workflow.save();

    io.emit('execution:completed', { executionId: execution._id, workflowId: workflow._id, status: result.status, duration: execution.duration });
    io.emit('workflow:status', { workflowId: workflow._id, status: workflow.status, runCount: workflow.runCount, successCount: workflow.successCount, errorCount: workflow.errorCount });
    io.emit('metrics:update', {}); // Trigger frontend to refresh stats

    const endLog = new LogModel({
      workflowId: workflow._id,
      executionId: execution._id,
      level: result.status === 'success' ? 'info' : 'error',
      message: `Workflow completed with status: ${result.status}`
    });
    await endLog.save();
    io.emit('log:new', { log: endLog });

  } catch (error) {
    console.error(error);
  }
}

module.exports = { runWorkflow };
