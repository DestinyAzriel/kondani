/**
 * Clean-slate utility — pre-launch only.
 *
 * Deletes EVERY account except yours, clears your matches/likes/passes,
 * and wipes messages, intents, verifications, reports and blocks so you
 * start fresh with real users only.
 *
 * Usage (from the backend folder):
 *   node cleanup-test-data.js +265XXXXXXXXX
 *
 * The phone number you pass must match YOUR account's phoneNumber exactly.
 * If no matching account is found, the script aborts and deletes nothing.
 *
 * MONGODB_URI is read from your .env (same DB the app uses). To target a
 * specific DB inline:  MONGODB_URI="mongodb+srv://..." node cleanup-test-data.js +265...
 */

const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./src/models/User');

const keepPhone = process.argv[2];
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/kondani';

async function run() {
  if (!keepPhone) {
    console.error('Usage: node cleanup-test-data.js <your-phone-number, e.g. +265991234567>');
    process.exit(1);
  }

  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB.');

  const me = await User.findOne({ phoneNumber: keepPhone });
  if (!me) {
    console.error(`\nNo account found with phoneNumber "${keepPhone}". Nothing was deleted.`);
    const all = await User.find({}, 'name phoneNumber');
    console.log('\nAccounts currently in the database:');
    all.forEach(u => console.log(`  - ${u.name || '(no name)'}  ${u.phoneNumber}`));
    console.log('\nRe-run with one of the phone numbers above.');
    process.exit(1);
  }

  console.log(`Keeping: ${me.name || '(no name)'}  ${me.phoneNumber}`);

  const del = await User.deleteMany({ _id: { $ne: me._id } });
  console.log(`Deleted ${del.deletedCount} other account(s).`);

  me.likes = [];
  me.passes = [];
  me.matches = [];
  me.dailyPicks = [];
  me.lastPicksDate = undefined;
  await me.save();
  console.log('Reset your likes / passes / matches / dailyPicks.');

  for (const m of ['Message', 'Intent', 'IDVerification', 'Report', 'Block']) {
    try {
      const Model = require(`./src/models/${m}`);
      const r = await Model.deleteMany({});
      console.log(`Cleared ${r.deletedCount} ${m} document(s).`);
    } catch (e) {
      // Model may not exist — skip quietly.
    }
  }

  console.log('\nClean slate complete. Only your account remains.');
  process.exit(0);
}

run().catch(err => {
  console.error('Cleanup failed:', err);
  process.exit(1);
});
