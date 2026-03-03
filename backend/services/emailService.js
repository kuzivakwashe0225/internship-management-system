const { Resend } = require('resend');
const { verificationTokenTemplate, interviewInviteTemplate, deadlineReminderTemplate } = require('../utils/emailTemplates');

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = 'IntraHub <onboarding@resend.dev>'; // Using Resend dev sandbox by default. Change when domain verified.

exports.sendVerificationEmail = async (email, token) => {
    try {
        const verifyLink = `http://localhost:5173/verify-email?token=${token}`;

        const { data, error } = await resend.emails.send({
            from: FROM_EMAIL,
            to: [email],
            subject: "Verify your IntraHub Account",
            html: verificationTokenTemplate.replace(/\{\{VERIFICATION_LINK\}\}/g, verifyLink),
        });

        if (error) {
            console.error("Resend API rejected the email:", error);
            if (error.name === 'validation_error' && FROM_EMAIL.includes('resend.dev')) {
                console.error("CRITICAL: You are using the Resend Sandbox. You can ONLY send emails to the email address you signed up to Resend with (i.e., your personal gmail). Sending to dummy emails will fail until you verify a custom domain!");
            }
        } else {
            console.log("Resend API accepted the email. ID:", data?.id);
        }
    } catch (error) {
        console.error("Error sending verification email:", error);
    }
};

exports.sendInterviewInviteEmail = async (email, companyName) => {
    try {
        await resend.emails.send({
            from: FROM_EMAIL,
            to: [email],
            subject: `Interview Invitation from ${companyName}`,
            html: interviewInviteTemplate.replace("{{COMPANY_NAME}}", companyName),
        });
    } catch (error) {
        console.error("Error sending interview invite email:", error);
    }
};

exports.sendDeadlineReminderEmail = async (email, taskTitle, deadline) => {
    try {
        await resend.emails.send({
            from: FROM_EMAIL,
            to: [email],
            subject: `Upcoming Deadline: ${taskTitle}`,
            html: deadlineReminderTemplate
                .replace("{{TASK_TITLE}}", taskTitle)
                .replace("{{DEADLINE}}", new Date(deadline).toLocaleString()),
        });
    } catch (error) {
        console.error("Error sending deadline reminder email:", error);
    }
};
