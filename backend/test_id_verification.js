const axios = require('axios');
const fs = require('fs');
const path = require('path');

async function testIDVerification() {
    try {
        // First, let's login to get a valid token
        console.log('Logging in with your phone number...');
        const loginResponse = await axios.post('http://localhost:3000/api/auth/verify-otp', {
            phoneNumber: '+265992745780',
            otp: '123456' // Use a valid OTP
        });
        
        const token = loginResponse.data.token;
        console.log('Login successful. Token received.');
        
        // For testing purposes, let's create a simple test image
        // In a real scenario, you would use an actual ID document image
        const testImagePath = path.join(__dirname, 'test-id.jpg');
        
        // Check if test image exists, if not create a simple one
        if (!fs.existsSync(testImagePath)) {
            console.log('Creating test image...');
            // Create a simple test image (in reality, you'd use a real ID image)
            const buffer = Buffer.from('data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAEBAQEBAQECAQECAQEBAQICAwICAgIFBAMFBgYGBgUFCAcIBwcHBxELDQoPDQ0SDw0UEhIOFx0fHiMaGyQtKyoyEx8eHv/bAEMBAQEBAQECCQEBCR4OCQ4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHv/AABEIABAAEAMBIgACEQEDEQH/xAAVAAEBAAAAAAAAAAAAAAAAAAAACf/EABQQAQAAAAAAAAAAAAAAAAAAAAD/xAAUAQEAAAAAAAAAAAAAAAAAAAAA/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8An8AdQH//2Q==', 'base64');
            fs.writeFileSync(testImagePath, buffer);
        }
        
        // Create form data for ID verification
        const formData = new FormData();
        formData.append('document', fs.createReadStream(testImagePath));
        formData.append('documentType', 'national_id');
        
        console.log('\nSubmitting ID for verification...');
        const verifyResponse = await axios.post('http://localhost:3000/api/verification/submit-id', formData, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'multipart/form-data'
            }
        });
        
        console.log('ID verification response:');
        console.log(JSON.stringify(verifyResponse.data, null, 2));
        
    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
    }
}

testIDVerification();