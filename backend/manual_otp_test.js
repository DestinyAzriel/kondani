const axios = require('axios');

async function testSMS() {
    try {
        console.log('Testing Manual OTP Flow...');
        const response = await axios.post('http://localhost:3000/api/auth/send-otp', {
            phoneNumber: '+265992745780'  // Your actual phone number
        });
        console.log('API Response:', response.data);
        console.log('Check the server console for the OTP that needs to be manually sent.');
    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
    }
}

testSMS();