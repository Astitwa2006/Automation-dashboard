const mongoose = require('mongoose');
const Workflow = require('./models/Workflow');
const Lead = require('./models/Lead');
const Execution = require('./models/Execution');
const Log = require('./models/Log');
const config = require('./config');

const seedWorkflows = [
  {
    name: 'Incoming Email Parser',
    type: 'email_parse',
    status: 'active',
    description: 'Parses incoming emails from sales@company.com',
    runCount: 142,
    successCount: 139,
    errorCount: 3,
    config: { inbox: 'sales@company.com' }
  },
  {
    name: 'Lead Scoring Engine',
    type: 'lead_score',
    status: 'active',
    description: 'Scores leads based on interactions and profile',
    runCount: 530,
    successCount: 503,
    errorCount: 27,
    config: { threshold: 70 }
  },
  {
    name: 'CRM Data Sync',
    type: 'data_sync',
    status: 'paused',
    description: 'Syncs data between HubSpot and PostgreSQL',
    runCount: 89,
    successCount: 75,
    errorCount: 14,
    config: { source: 'HubSpot', dest: 'PostgreSQL' }
  }
];

const seedLeads = [
  {
    email: 'sarah.j@techstart.io',
    name: 'Sarah Jenkins',
    company: 'TechStart',
    score: 85,
    source: 'email',
    status: 'new',
    factors: {
      companySize: 35,
      recentInteraction: 50
    }
  },
  {
    email: 'm.chen@enterprise.com',
    name: 'Michael Chen',
    company: 'Enterprise Corp',
    score: 92,
    source: 'webhook',
    status: 'contacted',
    factors: {
      companySize: 40,
      recentInteraction: 52
    }
  }
];

async function seed() {
  try {
    await mongoose.connect(config.mongoUri);
    console.log('Connected to MongoDB');

    // Clear existing
    await Workflow.deleteMany({});
    await Lead.deleteMany({});
    await Execution.deleteMany({});
    await Log.deleteMany({});
    console.log('Cleared existing data');

    // Insert new
    await Workflow.insertMany(seedWorkflows);
    await Lead.insertMany(seedLeads);
    console.log('Successfully seeded database');

    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
}

seed();
