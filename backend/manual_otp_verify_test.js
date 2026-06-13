const axios = require('axios');

async function testVerifyOTP() {
    try {
        console.log('Testing Manual OTP Verification...');
        const response = await axios.post('http://localhost:3000/api/auth/verify-otp', {
            phoneNumber: '+265992745780',  // Your actual phone number
            otp: '745323'  // Use the new OTP shown in the server console
        });
        console.log('Verification Response:', response.data);
        
        // Save the token for the next test
        if (response.data.token) {
            console.log('\nUse this token for the get_user_test.js:');
            console.log(response.data.token);
        }
    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
    }
}

testVerifyOTP();