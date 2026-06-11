const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Lead = require('../models/Lead');

const checkObjectId = (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ error: 'Invalid ID format' });
  }
  next();
};

router.get('/', async (req, res, next) => {
  try {
    const { limit } = req.query;
    const safeLimit = Math.max(1, parseInt(limit) || 20);
    
    const leads = await Lead.find()
      .sort({ createdAt: -1 })
      .limit(safeLimit);
      
    res.json(leads);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', checkObjectId, async (req, res, next) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ error: 'Lead not found' });
    res.json(lead);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
