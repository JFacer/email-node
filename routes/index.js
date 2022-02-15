const express = require('express');
const router = express.Router();
const logger = require("../logger");
const xlsReader = require('xlsx')

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/logger', function(req, res, next) {
  logger.info('I am an info log.', {name: '/logger', message: 'Login ... message', moreinfo: "Other info for logging."});
  return res.json({logged: true});
});

router.get('/xls', function(req, res, next) {
  const xlsFile = xlsReader.readFile('public/Audit.xlsx');
  let data = [];
  
  const sheets = xlsFile.SheetNames
    
  for(let i = 0; i < sheets.length; i++)
  {
    const temp = xlsReader.utils.sheet_to_json(
      xlsFile.Sheets[xlsFile.SheetNames[i]]);
    //data = `"${xlsFile.SheetNames[i]}": []`;
    //data[xlsFile.SheetNames[i]] = temp;
    temp.forEach((line) => {
      data.push(line)
      //console.log(data);
      //data.push(res);
    });
  }
    
  // Printing data
  res.status(200).send(data);
});


Post = {
  find: (id) => {
    if (id == 1) {
      return 1
    } else if (id == 2 ) {
      return null
    } else {
      throw new Error("Internal error");
    }
  }

};

router.get('/post/:id', function(req, res, next) {
  logger.info(`ID: ${req.params.id}`);
  
  try {
    const id = req.params.id;
    const post = Post.find(id); // We assume that we have some kind of ORM in the app.
    
    if (!post) {
      logger.warn(`Post with id ${id} was not found`);
      console.log(`Post with id ${id} was not found`);
      //res.status(404);
      let error = new Error("Not found!");
      error.status = 404;
      res.status(error.status);
      return res.render('error', {message: 'Post not found', error: { message: error.message, status: error.status, stack: error.stack } });
      //return res.render('post', { title: 'Post', param: req.params.id });
    }
    
    return res.render('post', { title: 'Post', param: req.params.id });
  } catch(error) {
    logger.error('ERROR 500', error);
    console.error('ERROR 500', error);
    //let error = new Error("Internal Error!");
    error.status = 500;
    res.status(error.status);
    return res.render('error', {message: 'Internal Error', error: { message: error.message, status: error.status, stack: error.stack } });
  }

});

module.exports = router;
