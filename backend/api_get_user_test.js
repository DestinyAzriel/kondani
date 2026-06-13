const axios = require('axios');

async function testGetUserAPI() {
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5MzhmNzRlMGEzMTRkY2ZhZGRkNWMxMSIsImlhdCI6MTc2NTM0MTAwNiwiZXhwIjoxNzY3OTMzMDA2fQ.0ww972LGpbbkoH1ECenn5ZmAtvEyUa1wXppLQVs9aU9o'; // Use the token from the previous response
    
    try {
        console.log('Testing Get User...');
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

testGetUserAPI();