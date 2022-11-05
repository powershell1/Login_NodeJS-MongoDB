const express = require('express');
const { MongoClient } = require('mongodb');
const cookieParser = require('cookie-parser');
const path = require('path');
const bodyParser = require('body-parser');
const uuid = require('uuid');

const app = express();
app.use(cookieParser());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

const databases = '// Enter your mongoDB uri here (mongodb+srv://<username>:<password>@cluster123456.mongodb.net)';
const client = new MongoClient(databases);

var portopen = 3000;

var dbsaved;
var DataBasesSaved;

var WebDataStore;

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'src', 'login-index.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'src', 'register-index.html'));
});

app.post('/private-api/login', async (req, res) => {
    var userinp = req.body['username'];
    var passinp = req.body['password'];
    var reminp = req.body['remember'];
    if (!(userinp && passinp)) {
        res.send({
            'status': 'error',
            'message': 'Missing body'
        });
        return;
    };
    const collection = WebDataStore;
    collection.findOne({
        user: userinp,
        pass: passinp
    }, function(err, result) {
        if (err) throw err;
        if (result) {
            var cookie = result['login-session'];
            var deleteoutput = result;
            delete deleteoutput['login-session'];
            if (reminp) {
                var maxage = 1000 * 60 * 60 * 24 * 365 * 30;
                res.cookie('remember-login', cookie, { maxAge: maxage, httpOnly: true });
            };
            res.send(deleteoutput);
        } else {
            res.send({
                'status': 'error',
                'message': 'Incorrect username or password'
            });
        };
    });
});

app.post('/private-api/register', async (req, res) => {
    var userinp = req.body['username'];
    var passinp = req.body['password'];
    var emainp = req.body['email'];
    if (!(userinp && passinp && emainp)) {
        res.send({
            'status': 'error',
            'message': 'Missing body'
        });
        return;
    };
    const collection = WebDataStore;
    collection.findOne({
        user: userinp
    }, function(err, result) {
        if (result) {
            res.send({
                'status': 'error',
                'message': 'Username already exists'
            });
        } else {
            var randomuuid = uuid.v4();
            collection.insertOne({
                user: userinp,
                pass: passinp,
                gmail: emainp,
                ['login-session']: randomuuid,
            }, function(err, data) {
                if (err) throw err;
                res.send(data);
            });
        };
    });
});

(async () => {
    await client.connect();
    DataBasesSaved = client.db('DataSave');
    WebDataStore = DataBasesSaved.collection('WebsideDataStore');
    app.listen(portopen, () => {
        console.log(`Server started on port ${portopen}`);
    });
})();