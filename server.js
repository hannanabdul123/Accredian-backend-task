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
app.post('/api/referrals', async (req, res) => {
  const { referrer, referee, email } = req.body;

  if (!referrer || !referee || !email) {
    return res.status(400).json({ error: 'Missing fields' });
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
        user: 'Your email',  
        pass: 'your Password',
        //ntft zune kbma irwe
      },
    });

    const mailOptions = {
      from: 'Your email',  
      to: email,
      subject: 'You have been assigned Prime Role!',
      text: `Hello ${referee},\n\n${referrer} has assigned you to Prime Role .\n\nBest Regards,\nTCS `,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Failed to send email:', error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });

  } catch (error) {
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
