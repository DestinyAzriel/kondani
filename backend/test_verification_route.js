// Simple test to check if the verification route is accessible
const axios = require('axios');

async function testVerificationRoute() {
    try {
        console.log('Testing verification route accessibility...');
        
        // Test basic connectivity
        console.log('Testing basic connectivity to localhost:3000...');
        const pingResponse = await axios.get('http://localhost:3000/api/auth/me', {
            timeout: 5000
        }).catch(err => {
            console.log('Connection test result:', err.message);
            throw err;
        });
        
        console.log('✓ Server is responding');
        
        // Test OPTIONS request (preflight)
        console.log('Testing OPTIONS request...');
        const optionsResponse = await axios.options('http://localhost:3000/api/verification/submit-id', {
            timeout: 5000
        });
        console.log('✓ OPTIONS request successful');
        console.log('Allowed methods:', optionsResponse.headers['access-control-allow-methods']);
        console.log('Allowed headers:', optionsResponse.headers['access-control-allow-headers']);
        
        // Test POST request without authentication (should fail but show route exists)
        console.log('Testing POST request without authentication...');
        try {
            await axios.post('http://localhost:3000/api/verification/submit-id', {}, {
                timeout: 5000
            });
        } catch (error) {
            if (error.response) {
                if (error.response.status === 401) {
                    console.log('✓ Route exists and requires authentication');
                } else {
                    console.log('✓ Route exists, response status:', error.response.status);
                }
            } else {
                console.log('Request failed:', error.message);
            }
        }
        
        console.log('\nRoute test completed successfully');
    } catch (error) {
        console.error('❌ Route test failed:', error.message);
        console.error('Error details:', error);
    }
}

testVerificationRoute();