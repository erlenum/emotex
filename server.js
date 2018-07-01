let express = require('express');
let app = express();
let https = require('https');
let bodyParser = require('body-parser');
let cors = require('cors');

//let language = require('./languageDetect');

// Replace the accessKey string value with your valid access key.
let accessKey = '841d20b982524f05a41c802f09b1c79c';

// NOTE: Free trial access keys are generated in the westcentralus region, so if you are using
// a free trial access key, you should not need to change this region.
let uri = 'westeurope.api.cognitive.microsoft.com';
let path = '/text/analytics/v2.0/languages';

app.use(bodyParser.json());
app.use(cors());

let response_handler =

app.post('/', function (req, res) {
    console.log(req. body);


    //console.log(res);
    let documents = { 'documents': [
            { 'id': '1', 'text': req.body.text }
        ]};

    /*let documents = { 'documents': [

            { 'id': '1', 'text': 'This is a document written in English.' },
            { 'id': '2', 'text':  'Der Test.' }, // Hier muss statt diesem Text, unser Text hinein!
            { 'id': '3', 'text': 'Test ' }
        ]};*/
    let body = JSON.stringify (documents);

    let request_params = {
        method : 'POST',
        hostname : uri,
        path : path,
        headers : {
            'Ocp-Apim-Subscription-Key' : accessKey,
        }
    };

    let request = https.request (request_params, function (response) {
        let body = '';
        response.on ('data', function (d) {
            body += d;
        });
        response.on ('end', function () {
            let body_ = JSON.parse (body);
            let body__ = JSON.stringify (body_, null, '  ');
            //console.log("Result");
            //console.log (body__);
            //console.log(server);
            console.log("Answer");
            console.log(body__);
            res.send(body__);
        });
        response.on ('error', function (e) {
            console.log ('Error: ' + e.message);
        });
    });
    request.write (body);
    request.end ();

    //language.getLanguage(response_handler);
    //res.send('Hello World');

});

let server = app.listen(8081, function () {
    let host = server.address().address;
    let port = server.address().port;

    console.log("Example app listening at http://%s:%s", host, port)
});
