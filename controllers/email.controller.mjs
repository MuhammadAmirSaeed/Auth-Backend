// import nodemailer from 'nodemailer';
// import path, { dirname } from 'path';
// import { fileURLToPath } from 'url';
// import ejs from 'ejs'


// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: {
//     user: process.env.NODMAILER_USER,
//     pass: process.env.NODMAILER_PASS
//   }
// });

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// export const sendEmail = async (req, res) => {

//   const {subject, send_to,send_from,reply_to,template,name,link} = req.body
  
//   try {
  
    
//       const   htmlTemplate = await ejs.renderFile(
//     path.join(__dirname, "../verifyEmail.ejs"),
//       { name,link }
//      );
  
    
      

//     // Create email message
//     const mailOptions = {
//       from: send_from,
//       to:  send_to,
//       subject: subject ,
//       replyTo:reply_to,
//       html: htmlTemplate,
//     };

//     // Send the email
//     await transporter.sendMail(mailOptions);
//     console.log('message  sent successfully');
//     res.json({ success: true, message: 'Message sent successfully' });
//   } catch (error) {
//     console.error('Error sending message:', error);
//     res.json({ success: false, message: error.message });
//   }
// };
