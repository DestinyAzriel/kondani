const axios = require('axios');
const fs = require('fs');
const path = require('path');

async function testFullIDVerification() {
    try {
        console.log('=== Testing Full ID Verification Flow ===\n');
        
        // Step 1: Login with phone number and OTP
        console.log('1. Logging in with phone number...');
        const loginResponse = await axios.post('http://localhost:3000/api/auth/verify-otp', {
            phoneNumber: '+265992745780',
            otp: '123456' // You'll need to replace this with a valid OTP
        });
        
        const token = loginResponse.data.token;
        console.log('✓ Login successful. Token received.\n');
        
        // Step 2: Check current user profile
        console.log('2. Getting current user profile...');
        const userResponse = await axios.get('http://localhost:3000/api/auth/me', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        console.log(`✓ User: ${userResponse.data.name}`);
        console.log(`✓ Has profile photos: ${userResponse.data.photos && userResponse.data.photos.length > 0}\n`);
        
        // Step 3: Create a simple test image if it doesn't exist
        const testImagePath = path.join(__dirname, 'test-id-card.jpg');
        if (!fs.existsSync(testImagePath)) {
            console.log('3. Creating test ID image...');
            // Create a simple placeholder image
            const imageData = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAEBAQEBAQECAQECAQEBAQICAwICAgIFBAMFBgYGBgUFCAcIBwcHBxELDQoPDQ0SDw0UEhIOFx0fHiMaGyQtKyoyEx8eHv/bAEMBAQEBAQECCQEBCR4OCQ4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHv/AABEIABAAEAMBIgACEQEDEQH/xAAVAAEBAAAAAAAAAAAAAAAAAAAACf/EABQQAQAAAAAAAAAAAAAAAAAAAAD/xAAUAQEAAAAAAAAAAAAAAAAAAAAA/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8An8AdQH//2Q==';
            const buffer = Buffer.from(imageData.split(',')[1], 'base64');
            fs.writeFileSync(testImagePath, buffer);
            console.log('✓ Test ID image created.\n');
        } else {
            console.log('3. Using existing test ID image.\n');
        }
        
        // Step 4: Submit ID for verification
        console.log('4. Submitting ID for verification...');
        
        // Create form data
        const FormData = require('form-data');
        const formData = new FormData();
        formData.append('document', fs.createReadStream(testImagePath));
        formData.append('documentType', 'national_id');
        
        const verifyResponse = await axios.post('http://localhost:3000/api/verification/submit-id', formData, {
            headers: {
                'Authorization': `Bearer ${token}`,
                ...formData.getHeaders()
            }
        });
        
        console.log('✓ ID verification submitted successfully!');
        console.log(`✓ Response: ${JSON.stringify(verifyResponse.data, null, 2)}\n`);
        
        // Step 5: Check verification status
        console.log('5. Checking verification status...');
        const statusResponse = await axios.get('http://localhost:3000/api/verification/status', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        console.log('✓ Verification status checked successfully!');
        console.log(`✓ Status: ${JSON.stringify(statusResponse.data, null, 2)}\n`);
        
        console.log('=== Test Completed Successfully ===');
        
    } catch (error) {
        console.error('❌ Error during test:', error.response ? error.response.data : error.message);
        if (error.response && error.response.status === 400) {
            console.error('This might be due to:');
            console.error('- Invalid OTP (please use a fresh OTP)');
            console.error('- Missing profile photos (please upload profile photos first)');
            console.error('- Invalid document format');
        }
    }
}

// Run the test
testFullIDVerification();