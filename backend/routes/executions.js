const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Execution = require('../models/Execution');

const checkObjectId = (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ error: 'Invalid ID format' });
  }
  next();
};

router.get('/', async (req, res, next) => {
  try {
    const { workflowId, limit } = req.query;
    const query = {};
    if (workflowId) {
      if (!mongoose.isValidObjectId(workflowId)) {
        return res.status(400).json({ error: 'Invalid workflowId' });
      }
      query.workflowId = workflowId;
    }
    
    const safeLimit = Math.max(1, parseInt(limit) || 10);
    const executions = await Execution.find(query)
      .sort({ createdAt: -1 })
      .limit(safeLimit)
      .populate('workflowId', 'name type status');
      
    res.json(executions);
  } catch (error) {
    next(error);
  }
});

router.get('/stats', async (req, res, next) => {
  try {
    const totalExecutions = await Execution.countDocuments();
    const successExecutions = await Execution.countDocuments({ status: 'success' });
    const successRate = totalExecutions > 0 ? (successExecutions / totalExecutions) * 100 : 0;
    
    const aggResult = await Execution.aggregate([
      { $match: { status: 'success', duration: { $exists: true } } },
      { $group: { _id: null, avgDuration: { $avg: '$duration' } } }
    ]);
    const avgDuration = aggResult.length > 0 ? aggResult[0].avgDuration : 0;

    res.json({
      totalExecutions,
      successRate: Math.round(successRate * 100) / 100,
      avgDuration: Math.round(avgDuration)
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', checkObjectId, async (req, res, next) => {
  try {
    const execution = await Execution.findById(req.params.id).populate('workflowId', 'name type');
    if (!execution) return res.status(404).json({ error: 'Execution not found' });
    res.json(execution);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
