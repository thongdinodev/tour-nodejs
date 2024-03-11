const nodemailer = require('nodemailer');

const sendEmail = async options => {
    // 1) create a transporter
    const transporter = nodemailer.createTransport({
        host: "sandbox.smtp.mailtrap.io",
        port: 2525,
        auth: {
            user: '2606df355beb55',
            pass: '1b0ef593f8f0a9'
        }
    });

    // 2) Defined the email options
    const mailOptions = {
        from: 'Admin tours NodeJS <thong.dino.dev@gmail.com>',
        to: options.email,
        subject: options.subject,
        text: options.message,
    }

    // 3) Actually send the email
    await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;