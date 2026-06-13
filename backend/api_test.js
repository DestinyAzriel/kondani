const axios = require('axios');

async function testAPI() {
    try {
        console.log('Testing Send OTP...');
        const sendResponse = await axios.post('http://localhost:3000/api/auth/send-otp', {
            phoneNumber: '+265992222222'
        });
        console.log('Send OTP Response:', sendResponse.data);
        
        // You'll need to check the server console for the OTP that was generated
        // Then manually test the verify OTP endpoint with that OTP
        
    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
    }
}

testAPI();