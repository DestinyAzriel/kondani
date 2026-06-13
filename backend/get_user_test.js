const axios = require('axios');

async function testGetUser() {
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5MzkxZjI4ZWU3ODlmZDY4ZDhkMzM0ZSIsImlhdCI6MTc2NTM1NTAxOSwiZXhwIjoxNzY3OTQ3MDE5fQ.k_Yv393Lc5bzQ6zQadyuDyEAlqTqiHndcolkaJ5TLds'; // Use the token from the previous response
    
    try {
        console.log('Testing Get User Profile...');
        const response = await axios.get('http://localhost:3000/api/auth/me', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        console.log('User Profile Response:', response.data);
    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
    }
}

testGetUser();