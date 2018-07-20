let express = require('express');
let app = express();
let https = require('https');
let bodyParser = require('body-parser');
let cors = require('cors');

// Replace the accessKey string value with your valid access key.
let accessKey = '841d20b982524f05a41c802f09b1c79c';

// NOTE: Free trial access keys are generated in the westcentralus region, so if you are using
// a free trial access key, you should not need to change this region.
let uri = 'westeurope.api.cognitive.microsoft.com';
let path = '';

app.use(bodyParser.json());
app.use(cors());

let response_handler =

app.post('/', function (req, res) {

    // JSON Objekt, welches von fb.js geschickt wird
    let documents = { 'documents': [ //
            { 'id': req.body.id , 'language': req.body.language , 'text': req.body.text }
        ]};

    // Objekt wird zur Analyse in eine Variable gespeichert
    let body = JSON.stringify (documents);

    // Abfrage nach der gewünschten Analyse
    if ( req.body.analyse == "language") {
        path = '/text/analytics/v2.0/languages'; // Pfad wird danach ausgerichtet
    }

    if ( req.body.analyse == "sentiment") {
        path = '/text/analytics/v2.0/sentiment';
    }

    if ( req.body.analyse == "keyPhase") {
        path = '/text/analytics/v2.0/keyPhrases';
    }

    // Request an den Server von Microsoft
    let request_params = {
        method: 'POST',
        hostname: uri,
        path: path,
        headers: {
            'Ocp-Apim-Subscription-Key': accessKey,
        }
    };

    // Daten werden ermittelt und wieder zurückgeschickt
    let request = https.request(request_params, function (response) {
        let body = '';
        response.on('data', function (d) {
                body += d;
        });
        response.on('end', function () {
                let body_ = JSON.parse(body);
                let body__ = JSON.stringify(body_, null, '  ');
                console.log(body__);
                res.send(body__);
        });
        response.on('error', function (e) {
                console.log('Error: ' + e.message);
        });
    });
        request.write(body);
        request.end();
});

//lokaler Server über welchen die Analyse-Daten laufen
let cognitiveServer = app.listen(8081, function () {
    let host = cognitiveServer.address().address;
    let port = cognitiveServer.address().port;

    console.log("Example app listening at http://%s:%s", host, port)
});
