require('dotenv').config();
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

async function testEmail() {
    console.log("Using API Key:", process.env.RESEND_API_KEY ? process.env.RESEND_API_KEY.substring(0, 8) + '...' : 'NONE');

    try {
        const { data, error } = await resend.emails.send({
            from: 'IntraHub <onboarding@resend.dev>',
            to: ['isaiahkuzivakwashechikeya@gmail.com'], // Using the test email we saw earlier
            subject: 'Test Email Verification',
            html: '<p>This is a test email from the Resend script.</p>'
        });

        if (error) {
            console.error("Resend API Error:", error);
        } else {
            console.log("Success! Email sent. Response data:", data);
        }
    } catch (err) {
        console.error("Caught Exception:", err);
    }
}

testEmail();
