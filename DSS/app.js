const express = require('express');
// const mysql = require('mysql')
// const { redirect } = require('express/lib/response');
// const res = require('express/lib/response');

// const data = mysql.createConnection({
//     host: 'localhost',
//     user: 'root',
//     password: '123',
// });

// data.connect((err) => {
//     if(err){
//         throw err;
//     }
//     console.log("mysql connected")
// });

const app = express(); 
app.set('view engine', 'ejs');
app.set('views', 'ejs');

app.use(express.static('css'));
app.use(express.urlencoded({ extended: true}))

// app.get('/createdata', (req, res) =>{
//     let sql = 'CREATE DATABASE nodemysql';
//     data.query(sql, (err, result) =>{
//         if(err) throw err;
//         res.send('Database created');
//     });
// });

app.listen(3000);

const blogs = [
    {title: 'SAMPLE TITLE', content: 'SAMPLE WORDS'},
    {title: 'SAMPLE TITLE', content: 'SAMPLE WORDS'},
    {title: 'SAMPLE TITLE', content: 'SAMPLE WORDS'},
];

app.get('/homepage', (req, res) => {
    res.render('homepage', {blogs});
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
    res.render('settings')
});

app.post('/homepage', (req, res) =>{
    const blog = req.body;
    blogs.push(blog)
        // .then((result) =>{
        //     res.redirect('/homepage');
        // })
        // .catch((err) =>{
        //     console.log(err);
        // })   
    });