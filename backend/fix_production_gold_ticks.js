// Run on Linode VPS:
// node fix_production_gold_ticks.js
// Or with options:
// node fix_production_gold_ticks.js --unverify-name nicholas

require('dotenv').config();
const mongoose = require('mongoose');

const User = require('./src/models/User');
const IDVerification = require('./src/models/IDVerification');

async function main() {
    const uri = process.env.MONGODB_URI;
    console.log('=== KONDANI VERIFICATION AUDIT & REPAIR ===');
    console.log('Connecting to database...');
    
    try {
        await mongoose.connect(uri, { serverSelectionTimeoutMS: 15000 });
        console.log('Connected to MongoDB successfully.\n');

        // Check command line arguments
        const args = process.argv.slice(2);
        const targetNameIndex = args.indexOf('--unverify-name');
        const targetName = targetNameIndex !== -1 ? args[targetNameIndex + 1] : null;

        // 1. Specifically inspect any user matching targetName or "nicholas"
        const searchRegex = new RegExp(targetName || 'nicholas', 'i');
        const targetUsers = await User.find({ name: searchRegex });
        console.log(`Found ${targetUsers.length} user(s) matching "${searchRegex}":`);
        
        for (const u of targetUsers) {
            console.log(`\n----------------------------------------`);
            console.log(`Name: ${u.name}`);
            console.log(`User ID: ${u._id}`);
            console.log(`User.isVerified: ${u.isVerified}`);
            console.log(`User.verification:`, JSON.stringify(u.verification, null, 2));

            const idRecords = await IDVerification.find({ userId: u._id });
            console.log(`IDVerification records found (${idRecords.length}):`);
            idRecords.forEach((rec, idx) => {
                console.log(`  [${idx + 1}] ID: ${rec._id}, status: ${rec.status}, selfieUrl: ${rec.selfieUrl ? 'EXISTS (' + rec.selfieUrl.substring(0, 40) + '...)' : 'NONE'}, faceMatchScore: ${rec.faceMatchScore}`);
            });

            // If user has isVerified or any IDVerification record, revoke/clear them
            console.log(`\n>> Revoking gold tick for ${u.name}...`);
            await User.findByIdAndUpdate(u._id, {
                $set: {
                    isVerified: false,
                    'verification.id.verified': false,
                    'verification.id.status': 'none'
                }
            });

            if (idRecords.length > 0) {
                // Delete or set to rejected
                await IDVerification.deleteMany({ userId: u._id });
                console.log(`>> Deleted ${idRecords.length} IDVerification record(s) for ${u.name}`);
            }
            console.log(`>> SUCCESS: ${u.name} is now completely unverified (no gold tick).`);
        }

        // 2. Global cleanup: Find all users with isVerified=true
        console.log(`\n========================================`);
        console.log(`GLOBAL AUDIT: Checking all users with isVerified=true...`);
        const verifiedUsers = await User.find({ isVerified: true });
        console.log(`Found ${verifiedUsers.length} total users with isVerified=true.`);

        let revokedCount = 0;
        for (const user of verifiedUsers) {
            const hasValidRecord = await IDVerification.findOne({
                userId: user._id,
                status: 'approved',
                selfieUrl: { $exists: true, $ne: '' }
            });

            if (!hasValidRecord) {
                console.log(`⚠️ User "${user.name}" (${user._id}) has isVerified=true but NO approved IDVerification record with a valid selfieUrl.`);
                await User.findByIdAndUpdate(user._id, {
                    $set: {
                        isVerified: false,
                        'verification.id.verified': false,
                        'verification.id.status': 'none'
                    }
                });
                revokedCount++;
                console.log(`   -> Revoked gold tick for "${user.name}".`);
            } else {
                console.log(`✓ User "${user.name}" (${user._id}) has valid approved selfie verification. Keeping verified.`);
            }
        }

        console.log(`\n========================================`);
        console.log(`AUDIT COMPLETE:`);
        console.log(`Total users inspected: ${verifiedUsers.length}`);
        console.log(`Stale verifications revoked: ${revokedCount}`);
        console.log(`========================================\n`);

    } catch (err) {
        console.error('Error during audit/repair:', err);
    } finally {
        await mongoose.connection.close();
        console.log('Database connection closed.');
    }
}

main();
