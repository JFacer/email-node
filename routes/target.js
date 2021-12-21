const env = require("dotenv").config();
const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const nodemailer = require("nodemailer");
const logger = require("../logger");

/* GET home page. */
router.get("/:page", function (req, res, next) {
  const strTargetFile = path.join(__dirname, "../target", req.params.page);
  logger.info(`Requested page for send: ${strTargetFile}`);

  let transporter = nodemailer.createTransport({
    host: env.parsed.SMTPSERV,
    port: env.parsed.SMTPPORT,
    secure: false, // upgrade later with STARTTLS
    debug: false,
    logger: false,
    requireTLS: true,
    auth: {
      user: env.parsed.SMTPUSER,
      pass: env.parsed.SMTPPWD,
    },
    tls: {
      // do not fail on invalid certs
      //rejectUnauthorized: false
      cyphers: "SSLv3",
    },
  });

  // verify connection configuration
  transporter.verify(function (error, success) {
    if (error) {
      logger.error(error);
    } else {
      logger.info("Server is ready to take our messages ", success);
    }
  });

  const emails = ["j.fernando.acevedo.b@gmail.com", "facevedo@actualisapbolivia.com"];
/*   const emails = [
    "mmenacho@landicorp.com.bo", 
    "josueapaze@gmail.com", 
    "Hugo.Alcazar@ypfbtransporte.com.bo", 
    "carlos.eguez@ypfbrefinacion.com.bo"  
  ]; */
  let resp = [];

  try {
    const data = fs.readFileSync(strTargetFile, "utf8");
    // Message object
    let message = {
      from: "soporte@actualisapbolivia.com",
      // Comma separated list of recipients
      //to: email,
      cc: "soporte@actualisapbolivia.com",
      // Subject of the message
      subject: "ACB - Notificacion Centro de Soporte",
      // plaintext body
      //text: 'Hello to myself!',
      // HTML body
      html: data,
    };
    
    emails.forEach( ( email, index, emails ) => {

      message.to = email;
 
      transporter
        .sendMail(message)
        .then((info) => {
          logger.info(`Message sent \n ${JSON.stringify(info)}`);
          resp.push(info);
          if (index == emails.length-1) {
            res.status(200).send(resp);
          }
        })
        .catch((error) => {
          error.status = 500;
          logger.error(
            `Some error ocurred target:sendmail\n    ${error.message}`
          );
          throw error;
        });
    });
  } catch (error) {
    logger.error(
      `Some error ocurred target:sendmail:\n    ${error.message}`
    );
    error.status = 404;
    next(error);
  };
});

module.exports = router;
