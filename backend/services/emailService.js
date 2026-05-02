const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    }
});

exports.sendVerificationEmail = async (email, otpCode) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Your IntraHub OTP Verification Code",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                    <h2 style="color: #6366f1; text-align: center;">Email Verification</h2>
                    <p>Hello,</p>
                    <p>Thank you for registering with IntraHub. Use the following 6-digit OTP code to verify your email address. This code is valid for 10 minutes.</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <span style="font-size: 2rem; font-weight: bold; letter-spacing: 5px; color: #1e293b; background: #f1f5f9; padding: 10px 20px; border-radius: 5px;">${otpCode}</span>
                    </div>
                    <p>If you did not request this, please ignore this email.</p>
                    <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                    <p style="font-size: 0.8rem; color: #64748b; text-align: center;">&copy; 2026 IntraHub Intelligent industrial attachment management platform</p>
                </div>
            `,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("Verification email sent:", info.messageId);
        return info;
    } catch (error) {
        console.error("Error sending verification email:", error.message);
        throw new Error(`Failed to send verification email: ${error.message}`);
    }
};

exports.sendInterviewInviteEmail = async (email, companyName) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: `Interview Invitation from ${companyName}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px;">
                    <h2 style="color: #6366f1;">Interview Invitation</h2>
                    <p>Hello,</p>
                    <p>We are pleased to invite you for an interview with <strong>${companyName}</strong>.</p>
                    <p>Please check your IntraHub dashboard for more details and to confirm your participation.</p>
                    <p>Best regards,<br/>IntraHub Team</p>
                </div>
            `,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("Interview invite email sent:", info.messageId);
        return info;
    } catch (error) {
        console.error("Error sending interview invite email:", error.message);
        throw new Error(`Failed to send interview invite email: ${error.message}`);
    }
};

exports.sendDeadlineReminderEmail = async (email, taskTitle, deadline) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: `Upcoming Deadline: ${taskTitle}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px;">
                    <h2 style="color: #f59e0b;">Deadline Reminder</h2>
                    <p>Hello,</p>
                    <p>This is a reminder that your task <strong>${taskTitle}</strong> is due on <strong>${new Date(deadline).toLocaleString()}</strong>.</p>
                    <p>Please log in to your IntraHub dashboard to submit your work.</p>
                    <p>Best regards,<br/>IntraHub Team</p>
                </div>
            `,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("Deadline reminder email sent:", info.messageId);
        return info;
    } catch (error) {
        console.error("Error sending deadline reminder email:", error.message);
        throw new Error(`Failed to send deadline reminder email: ${error.message}`);
    }
};
