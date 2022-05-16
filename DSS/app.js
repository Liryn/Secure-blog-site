const express = require('express');
const mysql = require('mysql');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const JSON = require('JSON');

const { parseUrl } = require('mysql/lib/ConnectionConfig');
const { indexOf } = require('lodash');

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
app.use(express.urlencoded({ extended: false}));
app.use(express.json());

app.listen(3000);

app.get('/homepage', (req, res) => {
    res.render('homepage');
    let blogArray = [];
    const blog = database.query("SELECT * FROM Blogs", (err, res) => {
        if(err){
            console.log(err);
        } else {
            // console.log(res);
            for (let i = 0; i < res.length; i++){
                //Change name of blogstuff
                var blogListing = [];
                var blogstuff = JSON.stringify(res[i])
                var postID = (blogstuff.slice(blogstuff.indexOf("PostID")+8,blogstuff.indexOf("title")-2))
                var title = (blogstuff.slice(blogstuff.indexOf("title")+8,blogstuff.indexOf("content")-3))
                var content = (blogstuff.slice(blogstuff.indexOf("content")+10,blogstuff.indexOf("UserID")-3))
                var userID = (blogstuff.slice(blogstuff.indexOf("UserID")+8,blogstuff.indexOf("}")))
                blogListing.push(postID,title,content,userID)
                blogArray.push(blogListing)
            }
            console.log(blogArray)
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
    res.render('myprofile')
});

app.get('/settings', (req, res) => {
    const users = database.query('SELECT * FROM Users', (err, users) => {
    res.render('settings', users)
    });
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

app.post('/login', async (req, res) => {

    try {
        const {email, password} = req.body;

        if(!email){
            console.log('missing email')
        } else if(!password){
            console.log('missing password')
        }

        const hash = database.query("SELECT password FROM Users WHERE email = ? LIMIT 1", [email])
        console.log(hash);

        if(hash){
            // const check = await bcrypt.compare(password, hash)
        
            // if(check == true){
            //     console.log('valid');
            //     res.redirect('/makepost');
            // }
            // else {
            //     console.log('invalid');
            // }
        } else {
            console.log('no user found');
        }


} catch(err){
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
            console.log('email in use');
            
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

        const salt = await bcrypt.genSalt(); // Generate salt
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
