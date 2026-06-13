const axios = require('axios');
const fs = require('fs');

// Test the ID verification endpoint directly
async function testIDEndpoint() {
    try {
        console.log('=== Testing ID Verification Endpoint ===');
        
        // Use a valid token from your system
        const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3NTU5YzQ0YjFiOWQ0MGI5NzY4YzM1OSIsImlhdCI6MTczMzg5OTU4OCwiZXhwIjoxNzMzOTg1OTg4fQ.Xy3v3J6v3J3v3J6v3J3v3J6v3J3v3J6v3J3v3J6v3J3'; // Replace with actual token
        
        // Test without file (should fail with proper error)
        console.log('Testing without file...');
        try {
            const response = await axios.post('http://localhost:3000/api/verification/submit-id', 
                { documentType: 'national_id' },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            console.log('Unexpected success:', response.data);
        } catch (error) {
            if (error.response) {
                console.log('Expected error (no file):', error.response.status, error.response.data);
            } else {
                console.log('Network error:', error.message);
            }
        }
        
        console.log('\n=== Test Complete ===');
        
    } catch (error) {
        console.error('Test failed:', error);
    }
}

testIDEndpoint();