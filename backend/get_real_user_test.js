const axios = require('axios');

async function getRealUserProfile() {
    try {
        // First, let's login to get a valid token
        console.log('Logging in with your phone number...');
        const loginResponse = await axios.post('http://localhost:3000/api/auth/verify-otp', {
            phoneNumber: '+265992745780',
            otp: '590900' // Use the new OTP
        });
        
        const token = loginResponse.data.token;
        console.log('Login successful. Token received.');
        
        // Now let's fetch your real profile
        console.log('\nFetching your real profile data...');
        const profileResponse = await axios.get('http://localhost:3000/api/auth/me', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        console.log('Your Real Profile Data:');
        console.log(JSON.stringify(profileResponse.data, null, 2));
        
    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
    }
}

getRealUserProfile();