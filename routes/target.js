const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const logger = require("../logger");
const xlsReader = require('xlsx');
const utils = require('./utils');

/* GET home page. */
router.get("/:page", function (req, res, next) {
  const strTargetFile = path.join(__dirname, "../target", req.params.page);
  logger.info(`Requested page for send: ${strTargetFile}`);
  let data = [];
  
  try {
    /** INITIALIZE MESSAGE */
    let message = {
      from: "soporte@actualisapbolivia.com",
      cc: "soporte@actualisapbolivia.com",
      subject: "ACB - Notificacion Centro de Soporte",
    };

    /* READ HTML FILE */
    const content = fs.readFileSync(strTargetFile, "utf8");

    /* SETUP MAIL TRANSPORT */
    const transporter = utils.defineTransporter();

    /** READ CUSTOMER LIST */
    //const sheets = xlsFile.SheetNames
    const xlsFile = xlsReader.readFile('public/Audit.xlsx');
    const sheetJSON = xlsReader.utils.sheet_to_json(xlsFile.Sheets["CustomerList"]);
    let count = 0;
    let resp = { sent: [] };

    sheetJSON.forEach((line) => {
      const custData = utils.parseLine(line);
      let emails = [];
      if (custData.test) {
        emails = [
          "j.fernando.acevedo.b@gmail.com",
          "facevedo@actualisapbolivia.com",
        ];
      } else {
        emails.push(custData.emails);
      }
      if (custData.send) {
        count += 1;
        emails.forEach((email, index, emails) => {
          message.to = email;
          message.html = utils.prepareContent(content, custData);
          message.attachments = utils.setAttachments(custData);
  
          resp["sent"].push( transporter.sendMail(message) );

        });
      }
    });

    //transporter.close();
    //res.status(200).send(resp);

    const allPromise = Promise.all( resp.sent );

    allPromise.then((values) => {
        //logger.info(`Message sent \n ${JSON.stringify(values)}`);
        transporter.close();
        res.status(200).send(values);
      })
      .catch((error) => {
        error.status = 500;
        logger.error(
          `Some error ocurred target:sendmail\n    ${error.message}`
        );
        throw error;
      });

  } catch (error) {
    logger.error(`Some error ocurred target:sendmail:\n    ${error.message}`);
    error.status = 404;
    next(error);
  }
});

/* 
  for(let i = 0; i < sheets.length; i++)
  {
    const sheet = xlsReader.utils.sheet_to_json(
      xlsFile.Sheets[xlsFile.SheetNames[i]])
    //data = `"${xlsFile.SheetNames[i]}": []`;
    data[xlsFile.SheetNames[i]] = temp;
    //temp.forEach((res) => {
      //data.push(res)
      //console.log(data);
      //data.push(res);
    //})
  }
  const emails = [
    "j.fernando.acevedo.b@gmail.com",
    "facevedo@actualisapbolivia.com",
  ]; 
  
  const emails = [
    "mmenacho@landicorp.com.bo",
    "sreguerin@landicorp.com.bo",
    "josueapaze@gmail.com",
    "titosuarezcatala@gmail.com",
    "Hugo.Alcazar@ypfbtransporte.com.bo", 
  ];

  let resp = { sent: [] };

  try {
    let transporter = defineTransporter();

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

    emails.forEach((email, index, emails) => {
      message.to = email;

      resp["sent"].push( transporter.sendMail(message) );
    });

    const allPromise = Promise.all(resp.sent);

    allPromise.then((values) => {
        logger.info(`Message sent \n ${JSON.stringify(values)}`);
        res.status(200).send(values);
      })
      .catch((error) => {
        error.status = 500;
        logger.error(
          `Some error ocurred target:sendmail\n    ${error.message}`
        );
        throw error;
      });

  } catch (error) {
    logger.error(`Some error ocurred target:sendmail:\n    ${error.message}`);
    error.status = 404;
    next(error);
  } */

module.exports = router;
