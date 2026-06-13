const axios = require('axios');
const fs = require('fs');

async function completeIDVerificationTest() {
    try {
        console.log('=== Complete ID Verification Test ===\n');
        
        // Step 1: Request OTP
        console.log('1. Requesting OTP...');
        const sendOtpResponse = await axios.post('http://localhost:3000/api/auth/send-otp', {
            phoneNumber: '+265992745780'
        });
        console.log('✓ OTP request sent successfully\n');
        
        // Prompt user to check Telegram for OTP
        console.log(' PLEASE CHECK YOUR TELEGRAM FOR THE OTP CODE NOW!');
        console.log(' Once you receive it, run this script again with the actual OTP.');
        console.log(' The script will wait for 30 seconds for you to get the code.\n');
        
        // In a real implementation, we would wait for user input
        // For now, we'll exit and let the user run again with the real OTP
        console.log('Run this command when you have the OTP:');
        console.log('node complete_id_verification_test.js --otp YOUR_OTP_HERE');
        
    } catch (error) {
        console.error('❌ Error requesting OTP:', error.response ? error.response.data : error.message);
    }
}

// Check if OTP was provided as argument
const args = process.argv.slice(2);
const otpIndex = args.indexOf('--otp');
let otp = null;

if (otpIndex !== -1 && args[otpIndex + 1]) {
    otp = args[otpIndex + 1];
}

// If OTP provided, run the full test
if (otp) {
    runFullTest(otp);
} else {
    // Otherwise just request OTP
    completeIDVerificationTest();
}

async function runFullTest(otp) {
    try {
        console.log(`Using OTP: ${otp}\n`);
        
        // Step 2: Verify OTP and get token
        console.log('2. Verifying OTP...');
        const verifyOtpResponse = await axios.post('http://localhost:3000/api/auth/verify-otp', {
            phoneNumber: '+265992745780',
            otp: otp
        });
        
        const token = verifyOtpResponse.data.token;
        console.log('✓ OTP verified successfully');
        console.log(`Token: ${token.substring(0, 20)}...\n`);
        
        // Step 3: Get user profile
        console.log('3. Getting user profile...');
        const userProfileResponse = await axios.get('http://localhost:3000/api/auth/me', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        console.log('✓ User profile retrieved');
        console.log(`User: ${userProfileResponse.data.name}`);
        console.log(`Profile complete: ${userProfileResponse.data.isProfileComplete}\n`);
        
        // Step 4: Create a test ID image if it doesn't exist
        console.log('4. Preparing test ID document...');
        const testImagePath = 'test-id-document.jpg';
        
        // Download a test image if it doesn't exist
        if (!fs.existsSync(testImagePath)) {
            console.log('Downloading test image...');
            const imageResponse = await axios({
                method: 'GET',
                url: 'https://i.pravatar.cc/400?img=2',
                responseType: 'stream'
            });
            
            const writer = fs.createWriteStream(testImagePath);
            imageResponse.data.pipe(writer);
            
            await new Promise((resolve, reject) => {
                writer.on('finish', resolve);
                writer.on('error', reject);
            });
            
            console.log('✓ Test image downloaded');
        } else {
            console.log('✓ Using existing test image');
        }
        
        // Step 5: Submit ID for verification
        console.log('5. Submitting ID for verification...');
        
        // Create form data
        const FormData = require('form-data');
        const formData = new FormData();
        formData.append('document', fs.createReadStream(testImagePath));
        formData.append('documentType', 'national_id');
        
        const verificationResponse = await axios.post('http://localhost:3000/api/verification/submit-id', formData, {
            headers: {
                'Authorization': `Bearer ${token}`,
                ...formData.getHeaders()
            }
        });
        
        console.log('✓ ID verification submitted successfully!');
        console.log(`Response: ${JSON.stringify(verificationResponse.data, null, 2)}\n`);
        
        // Step 6: Check verification status
        console.log('6. Checking verification status...');
        const statusResponse = await axios.get('http://localhost:3000/api/verification/status', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        console.log('✓ Verification status checked');
        console.log(`ID Status: ${statusResponse.data.id.status}`);
        console.log(`ID Verified: ${statusResponse.data.id.verified}\n`);
        
        // Clean up test file
        fs.unlinkSync(testImagePath);
        
        console.log('=== Test Completed Successfully ===');
        console.log('Your ID has been submitted for verification.');
        console.log('In MVP mode, it will be queued for manual review.');
        
    } catch (error) {
        console.error('❌ Error during test:', error.response ? error.response.data : error.message);
        
        // Clean up test file if it exists
        if (fs.existsSync('test-id-document.jpg')) {
            fs.unlinkSync('test-id-document.jpg');
        }
    }
}