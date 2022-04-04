const env = require("dotenv").config();
const nodemailer = require("nodemailer");
const cheerio = require('cheerio');
const logger = require("../logger");
const { attachment } = require("express/lib/response");

function parseLine(line) {
    let data = {};

    data.send = line.Env ? true : false;
    data.test = line.Test ? true : false;
    data.client = line.Cliente;
    data.dueDate = ExcelDateToJSDate(line.Fecha);
    data.contract = line.Contrato.toString();
    data.contactName = line.Contacto;
    data.emails = line.EMail;
    data.att1 = line.Adjunto1;
    data.att2 = line.Adjunto2;
    data.att3 = line.Adjunto3;
    data.append = line.Apendice;

    return data;
}

function prepareContent(content, custData) {
  const $ = cheerio.load(content);

  $("#custName").text(custData.client);
  $("#dueDate").text(FormatDate(custData.dueDate));
  $("#dueDateLit").text(DateLiteral(custData.dueDate));
  $("#contract").text(custData.contract);
  $("#contactName").text(custData.contactName);
  //$("#emails").text(custData.emails);

  return $.html();
}

function setAttachments(custData) {
  let attachments = [];
  
  if (typeof(custData.att1) != 'undefined' )
    attachments.push({path :'/workspace/public/attach/' + custData.att1})

  if (typeof(custData.att2) != 'undefined' )
    attachments.push({path :'/workspace/public/attach/' + custData.att2})

  if (typeof(custData.att3) != 'undefined' )
    attachments.push({path :'/workspace/public/attach/' + custData.att3})

  return attachments;
}

function defineTransporter() {
  let transporter = nodemailer.createTransport({
    pool: true,
    maxConnections: 3,
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
  return transporter;
  // verify connection configuration
/*   transporter.verify(function (error, success) {
    if (error) {
      logger.error(error);
      throw error;
    } else {
      logger.info("Server is ready to take our messages ", success);
      return transporter;
    }
  }); */
}

function ExcelDateToJSDate(serial) {
    var utc_days  = Math.floor(serial - 25569);
    var utc_value = utc_days * 86400;                                        
    var date_info = new Date(utc_value * 1000);
 
    var fractional_day = serial - Math.floor(serial) + 0.0000001;
 
    var total_seconds = Math.floor(86400 * fractional_day);
 
    var seconds = total_seconds % 60;
 
    total_seconds -= seconds;
 
    var hours = Math.floor(total_seconds / (60 * 60));
    var minutes = Math.floor(total_seconds / 60) % 60;
 
    return new Date(date_info.getFullYear(), date_info.getMonth(), date_info.getDate(), hours, minutes, seconds);
 }

function DateLiteral(jsDate) {
    //const event = new Date(Date.UTC(2012, 11, 20, 3, 0, 0));
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };

    //console.log(jsDate.toLocaleDateString('es-ES', options));
    return jsDate.toLocaleDateString('es-ES', options);
    // expected output (varies according to local timezone): Donnerstag, 20. Dezember 2012
}

function FormatDate(jsDate) {
    const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    return jsDate.toLocaleDateString('en-GB', options);
}

module.exports = {
    parseLine,
    prepareContent,
    setAttachments,
    defineTransporter
}