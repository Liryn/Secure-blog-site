const express = require('express');
const mysql = require('mysql');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

const { parseUrl } = require('mysql/lib/ConnectionConfig');

dotenv.config({path: './db.env'});

const database = mysql.createConnection({
        host: process.env.DB_HOST, 
        user: process.env.DB_USER, 
        password: process.env.DB_PASS, 
        database: process.env.DB,
        port: process.env.DB_PORT
});

database.connect((err) => {
    if(err){
        console.log('mysql connection failed');
    } else {
    console.log("mysql connected")
    };
});

const app = express(); 
app.set('view engine', 'ejs');
app.set('views', 'ejs');

app.use(express.static('css'));
app.use(express.urlencoded({ extended: false}))
app.use(express.json())

app.listen(3000);

app.get('/homepage', (req, res) => {
    res.render('homepage');
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.get('/createaccount', (req, res) => {
    res.render('createaccount');
});

app.get('/makepost', (req, res) => {
    res.render('makepost')
});

app.get('/myprofile', (req, res) => {
    res.render('myprofile')
});

app.get('/settings', (req, res) => {
    const users = database.query('SELECT * FROM Users', (err, users) => {
    res.render('settings', users)
    });
});

app.post('/homepage', async (req, res) => {
    try {
        const {title, content} = req.body;
        console.log(req.body)
        database.query("INSERT INTO Blogs SET ?", {title: title, content: content}), (err, res) => {
            if(err){
                console.log(err);
            } else {
                res.redirect('/homepage')
                console.log(res)
            }
        }
    } 
    catch(err) {
        console.log(err);
    }
});

app.post('/login', async (req, res) => {
    try {
        const {email, password} = req.body;
        const user = database.query("SELECT email FROM Users WHERE email = ?", [email], (err, res) => {
            if(err) {
                console.log(err)
            } else {
                console.log(res)
            }
        })
        
        if(user) {
            const hash = database.query("SELECT password FROM Users WHERE email = ?", [email], (err, res) => {
                if(err) {
                    console.log(err)
                } else {
                    console.log(res)
                }
            })
            const pass = bcrypt.compare(password, hash);
            if(pass) {
                console.log('Valid credentials!');
                res.redirect('/homepage')
            }
            else {
                console.log('Invalid credentials')
                res.redirect('/createaccount')
            }
        }
    } catch(err){
        console.log(err);
    }
});

app.post('/createaccount', async (req, res) => {
    try {
        const {fname, lname, email, password} = req.body;
        console.log(req.body)

        database.query("SELECT email FROM Users WHERE email = ?", [email], (err, res) => {
            if(err) {
                console.log(err)
            } else if(res.length > 0) {
                console.log('email in use')
                // Find way to cancel process
            }
        })
                 
        // const hash = await bcrypt.hash(password, 8);

        const salt = await bcrypt.genSalt();
        const hash = await bcrypt.hash(password, salt);

        database.query("INSERT INTO Users SET ?", {first_name: fname, second_name: lname, email: email, password: hash}), (err, res) =>{
            if(err){
                console.log(err);
            } else {
                console.log(res);
                }
            }
        console.log("REGISTERED");
        res.redirect('/login');
    } 
    catch(err) {
        console.log(err);
    }
}); 
