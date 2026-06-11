const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Log = require('../models/Log');

const checkObjectId = (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ error: 'Invalid ID format' });
  }
  next();
};

router.get('/', async (req, res, next) => {
  try {
    const { workflowId, level, limit } = req.query;
    const query = {};
    
    if (workflowId) {
      if (!mongoose.isValidObjectId(workflowId)) {
        return res.status(400).json({ error: 'Invalid workflowId' });
      }
      query.workflowId = workflowId;
    }
    
    if (level) {
      query.level = level;
    }
    
    const safeLimit = Math.max(1, parseInt(limit) || 50);
    
    const logs = await Log.find(query)
      .sort({ createdAt: -1 })
      .limit(safeLimit);
      
    res.json(logs);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', checkObjectId, async (req, res, next) => {
  try {
    const log = await Log.findById(req.params.id);
    if (!log) return res.status(404).json({ error: 'Log not found' });
    res.json(log);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
