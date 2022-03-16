const express = require('express')
const bodyParser = require('body-parser')

const app = express();
app.set('view engine', 'ejs');
app.use('/assets', express.static('stuff'));
app.listen(3000);

var urlencodedParser = bodyParser.urlencoded({ extended: false });
app.use(urlencodedParser);

app.get('/', (req, res) => {
  res.render('index');
});

app.get('/login', (req, res) => {
  res.render('login');
});

app.get('/create-account', (req, res) => {
  res.render('create-account');
});

app.get('/create-post', (req, res) => {
  res.render('create-post');
});

app.post('/create-post', urlencodedParser, function (req, res) {
  console.log(req.body);
  res.render('post-created-successfully', {data: req.body});
})
