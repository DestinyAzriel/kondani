const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Test the complete ID verification flow
async function testIDVerificationFlow() {
    try {
        console.log('=== Testing ID Verification Flow ===');
        
        // 1. First, let's get a valid token by registering/logging in
        // For this test, we'll assume you have a valid user
        const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3NTU5YzQ0YjFiOWQ0MGI5NzY4YzM1OSIsImlhdCI6MTczMzg5OTU4OCwiZXhwIjoxNzMzOTg1OTg4fQ.Xy3v3J6v3J3v3J6v3J3v3J6v3J3v3J6v3J3v3J6v3J3'; // Replace with a valid token
        
        // 2. Create a simple test image
        const testImagePath = path.join(__dirname, 'test-id.jpg');
        
        // 3. Test the ID verification endpoint
        const formData = new FormData();
        // Note: In a real test, you would attach an actual file
        // For now, we'll just test the endpoint structure
        
        console.log('Testing ID verification endpoint...');
        
        const response = await axios.post('http://localhost:3000/api/verification/submit-id', 
            {}, // Empty data for now
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            }
        );
        
        console.log('Response:', response.data);
        
    } catch (error) {
        if (error.response) {
            console.log('Error response:', error.response.status, error.response.data);
        } else {
            console.log('Error:', error.message);
        }
    }
}

// Run the test
testIDVerificationFlow();