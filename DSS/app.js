const express = require('express');
const mysql = require('mysql');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const JSON = require('JSON');
const bodyParser = require('body-parser');
const { parseUrl } = require('mysql/lib/ConnectionConfig');
const { indexOf, join } = require('lodash');
const { check, validationResult } = require('express-validator');


var escapeHtml = require('escape-html')
var session = require('express-session')
var alert = require('alert');


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

app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true
  }))

  function isAuthenticated (req, res, next) {
    if (req.session.user) next()
    else next('route')
  }
  app.get('/', isAuthenticated, function (req, res) {
    // this is only called when there is an authentication user due to isAuthenticated
    res.send('hello, ' + escapeHtml(req.session.user) + '!' +
      ' <a href="/login">Logout</a>')
  })

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
    database.query("SELECT * FROM Blogs WHERE userID = ?",[1], (err, blog) => { // change to account for users session id. Will therefore not need mitigating
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
		//Ignore User ID as it should be taken automatically
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

app.post('/login', express.urlencoded({ extended: false}),async (req, res) => {
    
    try {
        const {email, password} = req.body;
		
		var hash;
		
		function getPassword(callback) {
			
			//This regex accepts (a-z, A-Z, 0-9), then 1 "@" for the email, then (a-z, A-Z and ".")
			if (!email.match(/^[a-zA-Z0-9]+\@{1}[a-zA-Z/.]+$/)){
				console.log("Email is in unacceptable format")
				
				//Refresh the create account page to clear boxes
				res.render('login')

				//alert('For Email please do not use any special characters, apart from the "@" and "." in your email address')
				//End the post
				res.end()
			}
			// This regex accepts everything except "=", "'", '"' and ";"
			// NEED TO SANITISE THIS INSTEAD
			else if (!password.match(/^[^\=\'\"\;\<\>]+$/)){
				console.log("Password is in unacceptable format")
				
				//Refresh the create account page to clear boxes
				res.render('login')

				//alert("For Password please do not use any of the following characters; (=), ('), (\"), (;), (<), (>)")
				//End the post
				res.end()
			}
			
			else{
				database.query("SELECT password FROM Users WHERE email = ?", email, (err, databaseHash) => {
					if(err){
						console.log(err);
					}
					else{
						hash = databaseHash
						
						callback();
					}
				});
			}
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
     // regenerate the session, which is good practice to help
  // guard against forms of session fixation
  req.session.regenerate(function (err) {
    if (err) next(err)

    // store user information in session, typically a user id
    req.session.user = req.body.user

    // save the session before redirection to ensure page
    // load does not happen before session is saved
    req.session.save(function (err) {
      if (err) return next(err)
      res.redirect('/')
    })
  })
});

app.get('/logout', function (req, res, next) {
    // logout logic
  
    // clear the user from the session object and save.
    // this will ensure that re-using the old session id
    // does not have a logged in user
    req.session.user = null
    req.session.save(function (err) {
      if (err) next(err)
  
      // regenerate the session, which is good practice to help
      // guard against forms of session fixation
      req.session.regenerate(function (err) {
        if (err) next(err)
        res.redirect('/')
      })
    })
  })
  

// Sanitisation
var createAccountSanitizer = [
	//Validates and Sanitizes Email
	check('email').isEmail().trim().escape().normalizeEmail(),
    //Sanitizes Password
	check('password').trim().escape()];
  
  
app.post('/createaccount', createAccountSanitizer, async (req, res) => {
    try {
		const errors = validationResult(req);
		//Any Errors will come from isEmail() and so means not inputted valid email
		if (!errors.isEmpty()) {
			res.render('createaccount')
			alert('To input Email, please do not use special characters. Format email such as: "Example10@gmail.com"')
			//End the post
			res.end()
		}
		else {
			//Obtain variables from user input in req
			const {fname, lname, email, password} = req.body;

			//Initiate a boolean var, true if email is new, false if it already has been used
			var newEmail;
			
			//Function to check new email against list of existing ones
			function checkEmail(callback){
				
				//This regex accepts (a-z, A-Z and whitespace), then 1 "-" for double barrel names, then (a-z and A-Z)
				if(!fname.match(/^[a-zA-Z\s]+\-{0,1}[a-zA-Z]+$/)){
					console.log("First Name is in unacceptable format")
					
					//Refresh the create account page to clear boxes
					res.render('createaccount')

					alert('To input First Name, please use only letters. The Following formats are accepted; "Elizabeth", "Elizabeth Ann", "Elizabeth-Ann"')
					//End the post
					res.end()
				}
				//This regex accepts (a-z, A-Z and whitespace), then 1 "-" for double barrel names, then (a-z and A-Z)
				else if (!lname.match(/^[a-zA-Z\s]+\-{0,1}[a-zA-Z]+$/)){
					console.log("Last Name is in unacceptable format")
					
					//Refresh the create account page to clear boxes
					res.render('createaccount')

					alert('To input Last Name, please use only letters. The Following formats are accepted; "Smith", "Smith Jones", "Smith-Jones"')
					//End the post
					res.end()
				}
				//This regex accepts (a-z, A-Z, 0-9), then 1 "@" for the email, then (a-z, A-Z and ".")
				else if (!email.match(/^[a-zA-Z0-9]+\@{1}[a-zA-Z/.]+$/)){
					console.log("Email is in unacceptable format")
					
					//Refresh the create account page to clear boxes
					res.render('createaccount')

					alert('To input Email, please do not use special characters. Format email such as: "Example10@gmail.com"')
					//End the post
					res.end()
				}
				// This regex finds all special characters except for "_"
				else {
					console.log("Email after sanitization: ", email)
					console.log("Password after sanitization: ", password)
		
					// Get all emails in the database
					database.query("SELECT email FROM Users", (err, res) => {
						if(err) {
							console.log(err);
						} 
						
						// Check if there are any emails in the database
						else if(res.length > 0) {
							
							// Turn the res array of emails to one large string, check if the email has an index in the string, if so, it's present
							if(JSON.stringify(res).indexOf(email) >= 0){
								console.log('Email in Use, has been found with the index checker');
								newEmail = false;
							}
							else{
								newEmail = true;
							} 
						callback();
						}
					})
				}
			}
			
			async function processAccount(){
				//Check if the email already exists
				if(newEmail == false){
					console.log("Process of making account is ending, account should not have been added")
					//Refresh the create account page to clear boxes
					res.render('createaccount')

					alert('That email has already been registered, please try again')
					//End the post
					res.end()
				}
				else{
					//If email is new, create a salt and hash
					console.log("Email is absolutely fine, it can be added to the database");
					const salt = await bcrypt.genSalt(10); // Generate salt
					const hash = await bcrypt.hash(password, salt); // Generate hash

					//Use an SQL inset statement to place the user into the table
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
				
			}
			checkEmail(processAccount);
		} 
	}
    catch(err) {
        console.log(err);
    }
});