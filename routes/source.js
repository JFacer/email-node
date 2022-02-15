const express = require("express");
const router = express.Router();
var fs = require("fs");
const path = require("path");
const inlineCss = require("inline-css");
const utils = require("./utils");
const xlsReader = require("xlsx");
const logger = require("../logger");

/* GET home page. */
router.get("/:page", function (req, res, next) {
    const strSourceFile = path.join(__dirname, "../source", req.params.page);
    const strTargetFile = path.join(__dirname, "../target", req.params.page);
    logger.info(`Requested page: ${strSourceFile}`);

    const options = {
        applyLinkTags: true,
        applyStyleTags: true,
        removeStyleTags: true,
        removeLinkTags: true,
        url: "http://localhost:3000/prep/", //strTargetFile
    };

    try {
        //const data = fs.readFileSync(strSourceFile, 'utf8');
        const data = fs.readFileSync(strSourceFile, {
            encoding: "utf8",
            flag: "r",
        });
        logger.info(`File: ${strSourceFile} read ok.`);
        //var inlined = cssInline.inline(data, { remove_style_tags: true });
        inlineCss(data, options)
            .then(function (html) {
                logger.info(`Data inlined ok.`);
                fs.writeFileSync(strTargetFile, html);
                res.send(html);
            })
            .catch((error) => {
                logger.error(`Error converting: ${strSourceFile}: \n${error.message}`);
                next(error);
            });
    } catch (error) {
        logger.error(
            `Some error ocurred converting file ${strSourceFile} :\n    ${error.message}`
        );
        error.status = 404;
        next(error);
    }
});

router.get("/:page/:line", function (req, res, next) {
    const strSourceFile = path.join(__dirname, "../source", req.params.page);
    const strTargetFile = path.join(__dirname, "../target", req.params.page);
    const custLine = req.params.line;
    logger.info(`Requested page: ${strSourceFile}`);

    const options = {
        applyLinkTags: true,
        applyStyleTags: true,
        removeStyleTags: true,
        removeLinkTags: true,
        url: "http://localhost:3000/prep/", //strTargetFile
    };

    try {
        /** READ HTML SOURCE FILE */
        const data = fs.readFileSync(strSourceFile, {
            encoding: "utf8",
            flag: "r",
        });
        logger.info(`File: ${strSourceFile} read ok.`);

        /** READ CUSTOMER LIST */
        const xlsFile = xlsReader.readFile("public/Audit.xlsx");
        const sheetJSON = xlsReader.utils.sheet_to_json(
            xlsFile.Sheets["CustomerList"]
        );
        let custData = {};
        if (sheetJSON == undefined) {
            custData = {};
        } else {
            let lineCount = 0;
            sheetJSON.forEach((line) => {
                lineCount = lineCount + 1;
                if (lineCount == custLine) {
                    custData = utils.parseLine(line);
                }
            });
        }

        let content = utils.prepareContent(data, custData);
        logger.info(`Data merged ok.`);

        inlineCss(content, options)
            .then(function (html) {
                logger.info(`Data inlined ok.`);
                fs.writeFileSync(strTargetFile, html);
                res.send(html);
            })
            .catch((error) => {
                logger.error(`Error converting: ${strSourceFile}: \n${error.message}`);
                next(error);
            });
    } catch (error) {
        logger.error(
            `Some error ocurred converting file ${strSourceFile} :\n    ${error.message}`
        );
        error.status = 404;
        next(error);
    }
});

module.exports = router;
