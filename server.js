const express = require('express');
const { PrismaClient } = require('@prisma/client');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();
const prisma = new PrismaClient();
app.use(cors());
app.use(bodyParser.json());

// Endpoint to handle referral form submission
console.log("My name");
app.post('/api/referrals', async (req, res) => {
  const { referrer, referee, email } = req.body;
  console.log('Incoming request:', req.body); 
  if (!referrer || !referee || !email) {
    console.log('Missing fields');
    return res.status(400).json({ error: 'Missing fields' });
  }
  const emailPattern = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
  if (!emailPattern.test(email)) {
    return res.status(400).json({ error: 'Invalid email format.' });
  }
  try {
    const referral = await prisma.referral.create({
      data: {
        referrer,
        referee,
        email,
      },
    });

    res.status(201).json(referral);

    // Send referral email

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
          
      },
    });

    const mailOptions = {
      
      from:process.env.EMAIL_USER, 
      to: email,
      subject: 'You have been Referral',
      text: `Hello ${referee},\n\n${referrer} has referred you to our service .\n\nBest Regards,\nAccredian `,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Failed to send email:', error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });

  } catch (error) {
    console.error('Error creating referral:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Error saving referral' });
    }
  }
});

// Start the server
const PORT = process.env.PORT || 3300;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
