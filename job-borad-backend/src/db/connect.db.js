import mongoose from "mongoose"

const connectDb = async(db_uri, db_name) => {
    try {
        const connectDB = await mongoose.connect(`${db_uri}/${db_name}`)
        console.log("DATABASE connected seccessfully")
        console.log(`host : ${connectDB?.connection?.host}`)
    } catch (error) {
        console.log(`Database Connection failed \nError : ${error.message}`)
    }
}

export default connectDb