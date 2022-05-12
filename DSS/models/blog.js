const mysql = require('mysql')
const Schema = mysql.Schema;

const blogSchema = new mysql.Schema({
    title: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true
    },
});

const blog = mysql.model('blog', blogSchema);
module.exports = blog;