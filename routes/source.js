const express = require('express');
const router = express.Router();
var fs = require('fs');
const path = require('path');
const inlineCss = require('inline-css');
const logger = require('../logger');

/* GET home page. */
router.get('/:page', function(req, res, next) {
    const strSourceFile = path.join(__dirname, '../source', req.params.page);
    const strTargetFile = path.join(__dirname, '../target', req.params.page);
    logger.info(`Requested page: ${strSourceFile}`);
    
    const options = { 
        applyLinkTags: true,
        applyStyleTags: true,
        removeStyleTags: true,
        removeLinkTags: true,
        url: "http://localhost:3000/prep/" //strTargetFile
    };
    try {
        //const data = fs.readFileSync(strSourceFile, 'utf8');
        const data = fs.readFileSync(strSourceFile,
              {encoding:'utf8', flag:'r'});
        logger.info(`File: ${strSourceFile} read ok.`);
        //var inlined = cssInline.inline(data, { remove_style_tags: true });
        inlineCss(data, options).then(function(html) { 
            logger.info(`Data inlined ok.`);
            fs.writeFileSync(strTargetFile, html);
            res.send(html);
        }).catch( error => { 
            logger.error(`Error converting: ${strSourceFile}: \n${error.message}`);
            next (error)
        });        

    } catch(error) {
        logger.error(`Some error ocurred converting file ${strSourceFile} :\n    ${error.message}`);
        error.status = 404;
        next(error);
    }
});

module.exports = router;