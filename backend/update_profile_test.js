const axios = require('axios');

async function updateAndRetrieveProfile() {
    try {
        // First, let's login to get a valid token
        console.log('Logging in with your phone number...');
        const loginResponse = await axios.post('http://localhost:3000/api/auth/verify-otp', {
            phoneNumber: '+265992745780',
            otp: '829624' // Use the new OTP
        });
        
        const token = loginResponse.data.token;
        console.log('Login successful. Token received.');
        
        // Let's update your profile with some sample data
        console.log('\nUpdating profile...');
        const updateData = {
            name: "Sarah",
            age: 25,
            bio: "Love coffee and gym sessions!",
            job: "Software Developer",
            location: "Blantyre, Malawi",
            interests: ["Coffee", "Gym", "Afrobeats"]
        };
        
        // Note: We would need to implement a profile update endpoint
        // For now, let's just fetch your current profile
        console.log('\nFetching your current profile data...');
        const profileResponse = await axios.get('http://localhost:3000/api/auth/me', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        console.log('Your Current Profile Data:');
        console.log(JSON.stringify(profileResponse.data, null, 2));
        
        // Check if profile is complete
        const isComplete = profileResponse.data.isProfileComplete;
        console.log(`\nProfile Completion Status: ${isComplete ? 'Complete' : 'Incomplete'}`);
        
    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
    }
}

updateAndRetrieveProfile();