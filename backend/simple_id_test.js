const axios = require('axios');
const fs = require('fs');

async function simpleIDTest() {
    try {
        console.log('=== Simple ID Verification Test ===\n');
        
        // First, let's request an OTP
        console.log('1. Requesting OTP...');
        const sendOtpResponse = await axios.post('http://localhost:3000/api/auth/send-otp', {
            phoneNumber: '+265992745780'
        });
        
        console.log('✓ OTP request sent. Check your Telegram for the code.\n');
        console.log('PLEASE CHECK YOUR TELEGRAM FOR THE OTP AND ENTER IT BELOW:');
        console.log('(Run this script again once you have the OTP)');
        return;
        
    } catch (error) {
        console.error('❌ Error requesting OTP:', error.response ? error.response.data : error.message);
    }
}

simpleIDTest();