const express = require('express');
const mysql = require('mysql');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const JSON = require('JSON');
const bodyParser = require('body-parser');
const fetch = require("isomorphic-fetch");


const { parseUrl } = require('mysql/lib/ConnectionConfig');
const { indexOf, join } = require('lodash');

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
app.use(bodyParser.urlencoded({ extended: false}));
app.use(bodyParser.json());

app.listen(3000);

app.get('/homepage', (req, res) => {
    database.query("SELECT * FROM Blogs", (err, blog) => {
        if(err){
            console.log(err);
        } else {
            res.render('homepage', {blog});
        }
    });
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
    database.query("SELECT * FROM Blogs WHERE userID = ?",[1], (err, blog) => { // change to account for users session id.
        if(err){
            console.log(err);
        } else {
            res.render('myprofile', {blog});
        }
    });
});

app.get('/settings', (req, res) => {
    res.render('settings');
});

app.post('/homepage', async (req, res) => {
    try {
        const {title, content, userid} = req.body;
        console.log(req.body)
        database.query("INSERT INTO Blogs SET ?", {title: title, content: content, UserID: userid}), (err, res) => {
            // redirect fix
            if(err){
                console.log(err);
            } else {
                console.log(res)
            }
        }
        res.redirect('/homepage')
    } 
    catch(err) {
        console.log(err);
    }
});

app.post('/validate', async (req, res) => {
	const secret_key = "6LeCKfsfAAAAAM4X7AtaonmGY2knJ_S0MUMC-zZI";
    const token = req.body.token;
    const url = `https://www.google.com/recaptcha/api/siteverify?secret=${secret_key}&response=${token}`;

    fetch(url, {
        method: 'post'
    })
        .then(response => response.json())
        .then(google_response => res.json({ google_response }))
        .catch(error => res.json({ error }));
	
});

app.post('/login', async (req, res) => {
    try {
        const {email, password} = req.body;
		
		const sql =`SELECT password FROM Users WHERE email = '${email}' LIMIT 1`;
		
		var hash;
		
		function getPassword(callback) {
			database.query(sql, (err, databaseHash) => {
				if(err){
					console.log(err);
				}
				else{
					hash = databaseHash
					callback();
				}
			});
		}
		
		async function compareHash() {
			stringPassword = JSON.stringify(hash)
			hashedPassword = stringPassword.slice(stringPassword.indexOf("password")+11, stringPassword.indexOf("}")-1)
			
			console.log("The hashed function from the database is: ", hashedPassword);
			console.log("The password the user passed in is: ", password);
				
			const hashComparison = await bcrypt.compare(password, hashedPassword);	

            console.log(hashComparison);
			
			if(hashComparison){
                console.log('Bcrypt says the passwords match');
                res.redirect('/myprofile');
            }
            else {
                console.log('Bcrypt says the passwords do not match');
            }			
		}
		getPassword(compareHash);
    }
	catch(err){
    console.log(err);
    }
});

app.post('/createaccount', async (req, res) => {
    try {
        const {fname, lname, email, password} = req.body;

        // Get all emails in the database
        database.query("SELECT email FROM Users", (err, res) => {
            if(err) {
                console.log(err);
			} 
			// Check if the user table is empty
			else if(res.length > 0) {
            console.log('There are emails');
            
				// Turn the res array of emails to one large string, check if the email has an index in the string, if so, it's present
				if(JSON.stringify(res).indexOf(email) >= 0){
					console.log("Index is", JSON.stringify(res).indexOf(email));
					console.log('Email in Use, has been found with the index checker');
				} 

                // Find way to cancel process
            }
        })

        if(password < 8){
            // find way to cancel process as per NIST convention
        }

        const salt = await bcrypt.genSalt(10); // Generate salt
        const hash = await bcrypt.hash(password, salt); // Generate hash

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
