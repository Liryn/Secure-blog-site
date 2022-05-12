const express = require('express');
const mysql = require('mysql');
const bcrypt = require('bcryptjs');
const { parseUrl } = require('mysql/lib/ConnectionConfig');

// const blog = require('./models/blog');
// const { redirect } = require('express/lib/response');
// const res = require('express/lib/response');
// const blog = require('./models/blog');

const database = mysql.createConnection({
        host: "sql4.freesqldatabase.com", 
        user: "sql4491086", 
        password: "k6TrSsVcap", 
        database: "sql4491086",
        port: 3306,
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
    // const blogs = database.query("SELECT * FROM Blogs")
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

// app.post('/homepage', (req, res) =>{
//     const blog = new blog(req.body);
//     blog.save()
//         .then((result) =>{
//             res.redirect('/homepage');
//         })
//         .catch((err) =>{
//             console.log(err);
//         })   
//     });


app.post('/homepage', async (req, res) => {
    try {
        const {title, content} = req.body;
        console.log(req.body)
        database.query("INSERT INTO Blogs SET ?", {title: title, content: content}), (err, res) =>{
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
        const user = await database('Users').first('*').where({email: email});
        if(user) {
            const pass = await bcrypt.compare(password, user.hash);
            if(pass) {
                console.log('Valid credentials!');
            }
            else {
                console.log('Invalid credentials')
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

    // const hash = await bcrypt.genSalt(12).then(salt => { // Arg is the length of running operation
    //     bcrypt.hash("password", salt)
    // });
        
        const salt = await bcrypt.genSalt();
        const hash = await bcrypt.hash(password, salt);
        database.query("INSERT INTO Users SET ?", {first_name: fname, second_name: lname, email: email, password: hash}), (err, res) =>{
            if(err){
                console.log(err);
            } else {
                console.log(res);
            }
        }
    } 
    catch(err) {
        console.log(err);
    }
    res.redirect('/homepage');
}); 

// bcrypt.genSalt(12).then(salt => { // Arg is the length of running operation (Salt Rounds). Higher equals more secure, but takes more time.
//     bcrypt.hash("password", salt).then(hash => {
//         // Store in password DB
//         bcrypt.compare("password", hash).then(result => console.log(result));
//     });
// })