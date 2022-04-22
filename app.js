const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const path = require('path');

const db = mysql.createConnection({
  host : 'localhost',
  user : 'root',
  password : 'password',
  database : 'db'
});

//establish db connection
db.connect((err) => {
  if (err) {
    throw err;
  }
  console.log('Connection to post database successful');
});

const app = express();

//create post database. ONLY RUN THIS ONCE (must remove line 10, run this, and re-add 10)
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

//create post table. ONLY RUN THIS ONCE
app.get('/createpoststable', (req, res) => {
  let sql = 'CREATE TABLE posts(id int AUTO_INCREMENT, user VARCHAR(255), title VARCHAR(255), brand VARCHAR(255), gender VARCHAR(255), type VARCHAR(255), image MEDIUMTEXT, PRIMARY KEY(id))';
  db.query(sql, (err, result) => {
    if (err) {
      throw err;
    }
    console.log(result);
    res.send('post table created');
  });
});

//create account-information table. ONLY RUN THIS ONCE
app.get('/createusertable', (req, res) => {
  let sql = 'CREATE TABLE accountInformation(userid int AUTO_INCREMENT PRIMARY KEY, Username VARCHAR(255), Password VARCHAR(255))';
  db.query(sql, (err, result) => {
    if (err) {
      throw err;
    }
    console.log(result);
    res.send('Account information table created.');
  });
});

//setup Node environment
app.set('view engine', 'ejs');
app.use('/assets', express.static('stuff'));
app.listen(3000, () => {
  console.log("Server started, access at http://localhost:3000/");
});

var urlencodedParser = bodyParser.urlencoded({limit: '50mb', extended: true, parameterLimit: 50000});
app.use(urlencodedParser);
app.use(express.static("public"));

//POST REQUESTS

//user login
app.post('/login', (req, res) => {
  let username = req.body.Username;
  let inputPass = req.body.Password;
  let sql = 'SELECT Password FROM accountInformation WHERE Username = "' + username + '"';
  console.log(sql);
  let query = db.query(sql, (err, result) => {
    let realPass = result[0]["Password"];
    console.log(realPass);
    if(inputPass === realPass){
      // this is where you redirect to the user page
      res.redirect('/user/' + username);
    }
    else{
      res.redirect('create-account');
    }
  })
});

//create an account
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

//create a post
app.post('/:user/create-post', urlencodedParser, function (req, res) {
  let user = req.params.user;
  let sql = 'SELECT * FROM accountinformation WHERE Username = "' + user + '"';
  let  query = db.query(sql, (err, result) => {
    if (err) {
      throw err;
    }
    let id = result['0']['Username'];
    let post = {user: id, title: req.body.itemName, brand: req.body.brand, gender: req.body.gender, type: req.body.itemType, image: req.body.imageData};
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
});

//PAGE RENDERING

//render index page
app.get('/', (req, res) => {
  res.render('index');
});

//render login page
app.get('/login', (req, res) => {
  res.render('login');
});

//send CSS file from server
app.get('/css', (req, res) => {
  res.sendFile(path.join(__dirname, "public/style.css"));
});

//render account creation page
app.get('/create-account', (req, res) => {
  res.render('create-account');
});

//render account creation failed
app.get('/create-account-failed', (req, res) => {
  res.render('create-account-failed');
})

//redirect account creation failed
app.post('/create-account-failed', (req, res) => {
  res.redirect('create-account');
})

//render create post
app.get('/:user/create-post', (req, res) => {
  let user = req.params.user;
  let sql = 'SELECT * FROM accountinformation WHERE Username = "' + user + '"';
  let  query = db.query(sql, (err, result) => {
    if (err) {
      throw err;
    }
    let data = {user: result['0']['Username']};
    console.log(data);
    res.render('create-post', {data});
  });
});

//render view post
app.get('/view-post/:id', (req, res) => {
  let id = req.params.id;
  let sql = `SELECT * FROM posts WHERE id = ${req.params.id}`;
  let  query = db.query(sql, (err, result) => {
    if (err) {
      throw err;
    }
    let data = {id: result['0']['id'], user: result['0']['user'], title: result['0']['title'], brand: result['0']['brand'], gender: result['0']['gender'],  type: result['0']['type'], image: result['0']['image']};
    console.log('post fetched');
    res.render('view-post', {data: data});
  });
});

//render all posts
app.get('/view-all-post', (req, res) => {
  let sql = "SELECT * FROM posts;";
  let query = db.query(sql, (err, result) => {
    if(err) {
      throw err;
    }
    //let data = {id: result['0']['id'], title: result['0']['title'], user: result['0']['user'], image: result['0']['image']};
    // console.log(result);
      res.render('view-all-post', { result, result });
  });
});

//render user landing page
app.get('/user/:user', (req, res) => {
  let user = req.params.user;
  let sql = 'SELECT * FROM accountinformation WHERE Username = "' + user + '"';
  let  query = db.query(sql, (err, result) => {
    if (err) {
      throw err;
    }
    let data = {user: result['0']['Username']};
    res.render('user-landing', {data: data});
  });
});
