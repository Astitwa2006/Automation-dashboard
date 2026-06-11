const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Workflow = require('../models/Workflow');
const Execution = require('../models/Execution');
// Assuming runWorkflow is available in services, although it might be implemented in M2
// For now, require it with a fallback or just mock it if not yet fully implemented
let runWorkflow;
try {
  const engine = require('../services/workflowEngine');
  runWorkflow = engine.runWorkflow;
} catch (e) {
  runWorkflow = () => console.log('Mock runWorkflow');
}

// Middleware to check valid ObjectId
const checkObjectId = (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ error: 'Invalid ID format' });
  }
  next();
};

router.get('/', async (req, res, next) => {
  try {
    const workflows = await Workflow.find().sort({ createdAt: -1 });
    res.json(workflows);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', checkObjectId, async (req, res, next) => {
  try {
    const workflow = await Workflow.findById(req.params.id);
    if (!workflow) return res.status(404).json({ error: 'Workflow not found' });
    res.json(workflow);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const workflow = new Workflow(req.body);
    await workflow.save();
    res.status(201).json(workflow);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', checkObjectId, async (req, res, next) => {
  try {
    const workflow = await Workflow.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!workflow) return res.status(404).json({ error: 'Workflow not found' });
    res.json(workflow);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', checkObjectId, async (req, res, next) => {
  try {
    const workflow = await Workflow.findByIdAndDelete(req.params.id);
    if (!workflow) return res.status(404).json({ error: 'Workflow not found' });
    res.json({ message: 'Workflow deleted successfully' });
  } catch (error) {
    next(error);
  }
});

router.post('/:id/trigger', checkObjectId, async (req, res, next) => {
  try {
    const workflow = await Workflow.findById(req.params.id);
    if (!workflow) return res.status(404).json({ error: 'Workflow not found' });
    
    if (workflow.status === 'paused') {
      return res.status(400).json({ error: 'Cannot trigger a paused workflow' });
    }

    const io = req.app.get('io');
    
    // Create an Execution record to return immediately
    const execution = new Execution({
      workflowId: workflow._id,
      status: 'running',
      triggerType: 'manual'
    });
    await execution.save();

    // Start async execution in background
    if (runWorkflow) {
      runWorkflow(workflow._id, execution._id, io);
    }
    
    res.json(execution);
  } catch (error) {
    next(error);
  }
});

router.patch('/:id/status', checkObjectId, async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['active', 'paused'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    const workflow = await Workflow.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!workflow) return res.status(404).json({ error: 'Workflow not found' });
    
    const io = req.app.get('io');
    if (io) {
      io.emit('workflow:status', workflow);
    }
    
    res.json(workflow);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
