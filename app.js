const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');

const db = mysql.createConnection({
  host : 'localhost',
  user : 'root',
  password : 'password',
  database : 'db'
});

db.connect((err) => {
  if (err) {
    throw err;
  }
  console.log('Connection to post database successful');
});

const app = express();

//create post database
app.get('/createdb', (req, res) => {
  let sql = 'CREATE DATABASE db';
  db.query(sql, (err, result) => {
    if (err) {
      throw err;
    }
    console.log(result);
    res.send('database created');
  })
})

//create post table
app.get('/createpoststable', (req, res) => {
  let sql = 'CREATE TABLE posts(id int AUTO_INCREMENT, title VARCHAR(255), user int, image VARCHAR(255), PRIMARY KEY(id))';  
  db.query(sql, (err, result) => {
    if (err) {
      throw err;
    }
    console.log(result);
    res.send('post table created');
  });
});

//create account-information table
app.get('/createusertable', (req, res) => {
  let sql = 'CREATE TABLE accountInformation(Username VARCHAR(255), Password VARCHAR(255))';  
  db.query(sql, (err, result) => {
    if (err) {
      throw err;
    }
    console.log(result);
    res.send('Account information table created.');
  });
});
app.set('view engine', 'ejs');
app.use('/assets', express.static('stuff'));
app.listen(3000, () => {
  console.log("Server started, access at http://localhost:3000/");
});

var urlencodedParser = bodyParser.urlencoded({ extended: false });
app.use(urlencodedParser);

app.get('/', (req, res) => {
  res.render('index');
});

app.get('/login', (req, res) => {
  res.render('login');
});

app.post('/login', (req, res) => {
  let username = req.body.Username;
  let inputPass = req.body.Password;
  let sql = 'SELECT * FROM accountInformation WHERE Username = "' + username + '"';
  console.log(sql);
  let query = db.query(sql, (err, result) => {
    let realPass = result[0]["Password"];
    console.log(realPass); 
    if(inputPass === realPass){
      // placeholder for right now
      res.render('index');
    }
    else{
      res.render('create-account');
    }
  })
})

app.get('/create-account', (req, res) => {
  res.render('create-account');
});

app.get('/create-account-failed', (req, res) => {
  res.render('create-account-failed');
})

app.post('/create-account-failed', (req, res) => {
  res.redirect('create-account');
})

app.post('/create-account', (req, res) => {
  let username = req.body.Username;
  let pass1 = req.body.Password1;
  let pass2 = req.body.Password2;

  if(pass1 === pass2){
    // SQL account stuff goes here
    let sql = 'INSERT INTO accountInformation (Username, Password) VALUES ("'
      + username + '", "' + pass1 + '")';
    let query = db.query(sql, (err, result) => {
      if (err) {
        throw err;
      }
    })
    return res.redirect('login');
  }
  else{
    return res.redirect('create-account-failed');
  }
});

app.get('/create-post', (req, res) => {
  res.render('create-post');
});

app.post('/create-post', urlencodedParser, function (req, res) {
  let post = {title: req.body.itemName, user:0, image:"test.png"};
  let sql = 'INSERT INTO posts SET ?';
  let query = db.query(sql, post, (err, result) => {
    if (err) {
      throw err;
    }
    console.log('post added');
    post.id = result.insertId;
    res.render('view-post', {data: post});
  });
});

app.get('/view-post/:id', (req, res) => {
  let id = req.params.id;
  let sql = `SELECT * FROM posts WHERE id = ${req.params.id}`;
  let  query = db.query(sql, (err, result) => {
    if (err) {
      throw err;
    }
    let data = {id: result['0']['id'], title: result['0']['title'], user: result['0']['user'], image: result['0']['image']};
    console.log('post fetched');
    res.render('view-post', {data: data});
  });
});

