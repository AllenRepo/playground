var express = require('express');
var app = express();
var config = require('../source.js')();

// app.get('/', function(req, res){
// 	//res.sendFile('./app/app.html', {"root": __dirname});

// });

app.use(express.static(config.paths.app));
app.use(express.static('./'));

app.listen(config.node.port, function(){
});