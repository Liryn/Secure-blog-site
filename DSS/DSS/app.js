const express = require('express');
const { redirect } = require('express/lib/response');

const app = express(); 
app.set('view engine', 'ejs');
app.set('views', 'ejs');

app.listen(3000);

app.get('/homepage', (req, res) => {
    const blogs = [
        {title: 'SAMPLE TITLE', content: 'SAMPLE WORDS'},
        {title: 'SAMPLE TITLE', content: 'SAMPLE WORDS'},
        {title: 'SAMPLE TITLE', content: 'SAMPLE WORDS'},
    ];
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

app.use(express.static('css'));
app.use(express.urlencoded({ extended: true}))

// app.post('/homepage', (req, res) =>{
//     const blog = new Blog(req.body);
//     blog.save()
//         .then((result) =>{
//             res.redirect('/homepage');
//         })
//         .catch((err) =>{
//             console.log(err);
//         })   });