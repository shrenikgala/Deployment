var http = require('http'),
    httpProxy = require('http-proxy');
var redis = require('redis');
var client = redis.createClient(6379, '52.10.45.29', {})
var canary_url = 'http://http://52.34.76.55:5000/';
var prod_url = 'http://52.34.145.184:5000'
var count = 0;
var url = prod_url;

//http proxy implementation
var pserver = http.createServer(function(req, res) {
    //client.lrange('alertValThreshold', 0, 0, function(err, value) {
        // console.log("Value from redis: " + value)
        client.get("mykey", function(err,value){
        count = count + 1;
        if (count%4 == 0) {
            console.log("Every Fourth request")
            url = canary_url;
            if (value == "false") {
                console.log("Alert Raised !");
                url = prod_url;
            }        
            count = 0;
        }
        else {
            url = prod_url;
        }
	

        console.log("Delivering request to: ", url);
        var proxy = httpProxy.createProxyServer({target: url});
        proxy.web(req, res);
    });
        
});

pserver.listen(3000, function() {
    console.log("proxy server listening on port 3000")
});
