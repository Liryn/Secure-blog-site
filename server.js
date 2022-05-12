const mysql = require("mysql2/promise");
// Creating an async await function


const insertIntoDb = async () => {
    const connection = await mysql.createConnection({
        host: "sql4.freesqldatabase.com", 
        user: "sql4491086", 
        password: "k6TrSsVcap", 
        database: "sql4491086",
        port: 3306,


    })

    try{
        await connection.query(
            "INSERT INTO Users (first_name,second_name,email, password) VALUES ('john', 'smith', 'john@gmail.com', 'test')"
        );
        console.log("inserted")
    }catch(e){
        console.log(e)
    }
   
};

insertIntoDb();