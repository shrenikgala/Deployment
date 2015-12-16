var express = require('express')
  , http = require('http')
  , request = require('request')
  , os = require('os')
  ;
var redis = require('redis');
var client = redis.createClient(6379, '52.10.45.29', {})
var nodemailer = require("nodemailer");
var ses = require("nodemailer-ses-transport");
var aws     = require('aws-sdk');

var email   = "djain2@ncsu.edu";

// Load your AWS credentials and try to instantiate the object.
aws.config.loadFromPath('config/config-sample.json');

var app = express();
var app1 = http.createServer(app);

// Instantiate SES.
var ses = new aws.SES();


app.get('/', function (req, res) {
  res.send('hello jenkins');
});

app.get('/slow', function (req, res) {
	client.get("mykey", function(err,value){
  	if(value == "true")
  	{
  		for( var i =0 ; i < 200; i++ )
		{
			Math.sin(i) * Math.cos(i);
		}
		res.send('Extra feature is enabled! '+value);
	}
	else
	{
		res.send("Extra feature turned off!");
	}
});

});
function memoryLoad()
{
	var memload = ((os.totalmem()-os.freemem())/os.totalmem())*100;
	console.log( "Memory load is " + memload + "%" );
	return memload;
}

function sendEmail()
{

    var ses_mail = "From: 'DevOps M3' <" + email + ">\n";
    ses_mail = ses_mail + "To: " + email + "\n";
    ses_mail = ses_mail + "Subject: High Latency Alert\n";
    ses_mail = ses_mail + "The latency is higher than the threshhold specified.\n\n";
    
    var params = {
        RawMessage: { Data: new Buffer(ses_mail) },
        Destinations: [ email ],
        Source: "'DevOps M3' <" + email + ">'"
    };
    
    ses.sendRawEmail(params, function(err, data) {
        if(err) {
            console.log("Error in sending email " + err);
        } 
        else {
            console.log("Email Sent Successfully");
        }           
    });
}
function measureLatenancy()
{
	var startTime = Date.now();
	//console.log(startTime);
	var latency = 0;
	var options = 
	{
		url: 'http://localhost' + ":5000/slow",
	};
	request(options, function (error, res, body) 
	{

		latency = Date.now()-startTime;
		if(latency > 10)
		{
			client.set("mykey", "false");
			sendEmail();
		}
		console.log("latency is  " + latency);
		
	});
return latency;

	
}

///////////////
//// Broadcast heartbeat over websockets
//////////////
setInterval( function () 
{
	//console.log("Memory load is "+memoryLoad()+"And latency is "+measureLatenancy());
	//sendEmail();
	/*io.sockets.emit('heartbeat', 
	{ 
        name: "Your Computer", memoryLoad: memoryLoad(), latency:measureLatenancy()
        
   });*/

	memoryLoad();
	measureLatenancy();
	//sendEmail();

}, 2000);

app.listen(5000);
 
module.exports = app;
