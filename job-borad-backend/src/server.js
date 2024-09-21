import app from "./app.js";
import connectDb from "./db/connect.db.js";

// variable defining
const port = process.env.PORT
const db_uri = process.env.DATABASE_URI
const db_name = process.env.DATABASE_NAME


// connect DataBase and listen server
connectDb(db_uri, db_name)
.then(
    app.listen(port, function(){
        console.log(`server listen on PORT : ${port}`)
    })
)
.catch(error => (
    console.log(`Db-Server connection faild \nErrors : ${error.message}`)
))
