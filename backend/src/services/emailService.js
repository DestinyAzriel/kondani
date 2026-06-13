const nodemailer = require('nodemailer');
const sgMail = require('@sendgrid/mail');

// Configure SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

class EmailService {
    constructor() {
        this.fromEmail = process.env.FROM_EMAIL || 'noreply@kondani.mw';
        this.fromName = 'Kondani';
    }

    /**
     * Send email via SendGrid
     */
    async sendEmail(to, subject, html, text) {
        try {
            const msg = {
                to,
                from: {
                    email: this.fromEmail,
                    name: this.fromName
                },
                subject,
                text,
                html
            };

            await sgMail.send(msg);
            console.log(`Email sent to ${to}: ${subject}`);
            return { success: true };

        } catch (error) {
            console.error('Send email error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Send welcome email
     */
    async sendWelcomeEmail(user) {
        const subject = 'Welcome to Kondani! 💝';
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #10b981;">Welcome to Kondani, ${user.name}!</h1>
                <p>We're excited to have you join Malawi's premier dating platform.</p>
                <p>Here's what you can do next:</p>
                <ul>
                    <li>Complete your profile with photos and interests</li>
                    <li>Verify your ID for a gold badge</li>
                    <li>Start swiping to find your match!</li>
                </ul>
                <a href="https://kondani.mw/feed" style="display: inline-block; padding: 12px 24px; background: #10b981; color: white; text-decoration: none; border-radius: 8px; margin: 20px 0;">
                    Start Matching
                </a>
                <p style="color: #666; font-size: 12px; margin-top: 40px;">
                    Questions? Reply to this email or contact support@kondani.mw
                </p>
            </div>
        `;
        const text = `Welcome to Kondani, ${user.name}! Start matching at https://kondani.mw/feed`;

        return await this.sendEmail(user.email || user.phoneNumber + '@kondani.mw', subject, html, text);
    }

    /**
     * Send payment receipt
     */
    async sendPaymentReceipt(user, payment, subscription) {
        const subject = 'Payment Receipt - Kondani Premium';
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #10b981;">Payment Successful!</h1>
                <p>Hi ${user.name},</p>
                <p>Thank you for subscribing to Kondani Premium!</p>
                
                <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3>Receipt Details</h3>
                    <p><strong>Plan:</strong> ${subscription.plan.replace('_', ' ').toUpperCase()}</p>
                    <p><strong>Amount:</strong> MWK ${payment.amount.toLocaleString()}</p>
                    <p><strong>Transaction ID:</strong> ${payment.transactionId}</p>
                    <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
                    <p><strong>Valid Until:</strong> ${subscription.endDate.toLocaleDateString()}</p>
                </div>
                
                <p>Your premium features are now active:</p>
                <ul>
                    <li>✓ See who likes you</li>
                    <li>✓ Unlimited swipes</li>
                    <li>✓ Global Passport</li>
                    <li>✓ Priority visibility</li>
                </ul>
                
                <p style="color: #666; font-size: 12px; margin-top: 40px;">
                    Need help? Contact support@kondani.mw
                </p>
            </div>
        `;
        const text = `Payment successful! Your Kondani Premium subscription is now active. Transaction ID: ${payment.transactionId}`;

        return await this.sendEmail(user.email || user.phoneNumber + '@kondani.mw', subject, html, text);
    }

    /**
     * Send match notification email
     */
    async sendMatchEmail(user, matchedUser) {
        const subject = '💝 You have a new match!';
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #10b981;">It's a Match!</h1>
                <p>Hi ${user.name},</p>
                <p>You and ${matchedUser.name} liked each other!</p>
                <a href="https://kondani.mw/chats" style="display: inline-block; padding: 12px 24px; background: #10b981; color: white; text-decoration: none; border-radius: 8px; margin: 20px 0;">
                    Start Chatting
                </a>
            </div>
        `;
        const text = `You matched with ${matchedUser.name}! Start chatting at https://kondani.mw/chats`;

        return await this.sendEmail(user.email || user.phoneNumber + '@kondani.mw', subject, html, text);
    }

    /**
     * Send weekly digest
     */
    async sendWeeklyDigest(user, stats) {
        const subject = 'Your Weekly Kondani Update';
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #10b981;">Your Week on Kondani</h1>
                <p>Hi ${user.name},</p>
                <p>Here's what happened this week:</p>
                <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <p><strong>${stats.likes}</strong> people liked you</p>
                    <p><strong>${stats.matches}</strong> new matches</p>
                    <p><strong>${stats.messages}</strong> messages received</p>
                </div>
                <a href="https://kondani.mw/feed" style="display: inline-block; padding: 12px 24px; background: #10b981; color: white; text-decoration: none; border-radius: 8px;">
                    Continue Matching
                </a>
            </div>
        `;
        const text = `Your week on Kondani: ${stats.likes} likes, ${stats.matches} matches, ${stats.messages} messages`;

        return await this.sendEmail(user.email || user.phoneNumber + '@kondani.mw', subject, html, text);
    }
}

module.exports = new EmailService();
