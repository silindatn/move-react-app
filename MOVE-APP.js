// server.js
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
// const parts_portal_handler = require('./server-side/parts-portal-post-handler');
// const audatex_handler = require('./server-side/audatex-handler');
// const EmailService = require('./server-side/EmailService');m
// const OneTimeService = require('./server-side/OneTimeService');
// const emailHandler = require('./server-side/email-handler');
// const driveHandler = require('./server-side/drive-handler');
let compression = require('compression');
let path = require('path')
let serveStatic = require('serve-static')
let log4js = require('log4js');
let fs = require('fs')
let https = require('https');
let h5bp = require('h5bp');
let pagespeed = require('pagespeed');
// var expressStaticGzip = require("express-static-gzip");

// var httpsOptions = {
//   key: fs.readFileSync('/home/thulanis/WebstormProjects/smart-parts-portal/cert/server.key')
//     , cert: fs.readFileSync('/home/thulanis/WebstormProjects/smart-parts-portal/cert/127.0.0.1 - Autoboys')
// }
let logger = log4js.getLogger('PARTS-PORTAL');
logger.level = 'debug';
// Run the app by serving the static files
// in the build directory

let time = new Date();
// app.configure( function( ) {
    app.use( pagespeed.middleware( { debug: true } ));
// }
app.use(h5bp({ root: __dirname + '/build' }));
app.set('view cache', true);
// app.use("/", expressStaticGzip(__dirname + '/build', { indexFromEmptyFile: false }));
app.use(compression());
// app.use(function(req, res, next) {
//     res.setHeader("Content-Security-Policy", "default-src https:; script-src https: 'unsafe-inline'; style-src https: 'unsafe-inline'; img-src https: data:; frame-src https: data:;object-src https: data:;");
//     return next();
// });
app.use(serveStatic(__dirname + '/build', {
    maxAge: '86400',
    setHeaders: setCustomCacheControl
  }));  
app.use(bodyParser.json({limit: '500mb'}));
app.use(bodyParser.urlencoded({extended: false, limit: '500mb'}));
app.use(express.static(__dirname + 'build'));
// app.use(parts_portal_handler);
// app.use(audatex_handler);
// app.use('/', emailHandler);
// app.use('/', driveHandler);
app.get('/*', function(req, res){
    res.sendFile(__dirname + '/build/index.html');
})
// for secure server
/* https.createServer(httpsOptions, app).listen(process.env.PORT || 443, function() {
    let _time = new Date();
    logger.info('SERVER STARTUP COMPLETED [', _time - time, 'ms]', 443);
    EmailService.startServices();
    // OneTimeService.startServices();

}); */
// Start the app by listening on the default
app.listen(process.env.PORT || 80, function() {
    let _time = new Date();
    logger.info('SERVER STARTUP COMPLETED [', _time - time, 'ms]');
});

function setCustomCacheControl (res, path) {
    //if (serveStatic.mime.lookup(path) === 'text/html') {
      // Custom Cache-Control for HTML files
      res.setHeader('Cache-Control', 'public, max-age=86400')
    //}
  }
