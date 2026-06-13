const axios = require('axios');

async function testVerifyAPI() {
    try {
        console.log('Testing Verify OTP...');
        const verifyResponse = await axios.post('http://localhost:3000/api/auth/verify-otp', {
            phoneNumber: '+265992222222',
            otp: '962056'  // Use the OTP that was generated and shown in the server console
        });
        console.log('Verify OTP Response:', verifyResponse.data);
        
        // Test getting user profile with the new token
        const token = verifyResponse.data.token;
        console.log('\nTesting Get User with new token...');
        const getUserResponse = await axios.get('http://localhost:3000/api/auth/me', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        console.log('Get User Response:', getUserResponse.data);
        
    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
    }
}

testVerifyAPI();