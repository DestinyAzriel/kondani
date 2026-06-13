const axios = require('axios');

async function testProfileUpdate() {
    try {
        console.log('Please enter the OTP you received on your phone:');
        // In a real scenario, you would read the OTP from user input
        // For now, we'll simulate this with a placeholder
        const otp = '123456'; // Replace with actual OTP when testing
        
        // First, let's login to get a valid token
        console.log('Logging in with your phone number...');
        const loginResponse = await axios.post('http://localhost:3000/api/auth/verify-otp', {
            phoneNumber: '+265992745780',
            otp: otp
        });
        
        const token = loginResponse.data.token;
        console.log('Login successful. Token received.');
        
        // Let's update your profile with some sample data
        console.log('\nUpdating profile...');
        const updateData = {
            name: "Destiny Mwafulirwa",
            age: 28,
            bio: "Love coffee and gym sessions! Also interested in technology and travel.",
            location: "Blantyre, Malawi",
            photos: ["https://i.pravatar.cc/400?img=1", "https://i.pravatar.cc/400?img=2"],
            interests: ["Coffee", "Gym", "Afrobeats", "Technology", "Travel"]
        };
        
        const updateResponse = await axios.put('http://localhost:3000/api/auth/profile', updateData, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        console.log('Profile updated successfully!');
        console.log('Updated Profile Data:');
        console.log(JSON.stringify(updateResponse.data, null, 2));
        
        // Now let's fetch your updated profile
        console.log('\nFetching your updated profile data...');
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

// Call the function
testProfileUpdate();