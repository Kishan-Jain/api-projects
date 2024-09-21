import { v2 as cloudinary } from 'cloudinary';
import fs from "fs" // node.js file system module --> for unlink file

// Configuration
cloudinary.config({ 
    cloud_name: process.env.CLOUDNARY_CLOUD_NAME, 
    api_key: process.env.CLOUDNARY_API_KEY, 
    api_secret: process.env.CLOUDNARY_API_SECRET 
})

// Upload 
export const uploadFileToCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;
        // upload file on cloudinary
        const responce = await cloudinary.uploader.upload(
            localFilePath, {
                resource_type : "auto"
            }
        )
        // file upload successfully
        console.log("file upload successfully")
        console.log("cloudinary url : ",responce.url)

        // file unlink from sever after upload on cloudinary 
        fs.unlinkSync(localFilePath)
        return responce // return responce for uses
        
    } catch (error) {
        // file unlink from sever if face any error to upload cloudinary 
        fs.unlinkSync(localFilePath)
        return null
        
    }
}

// remove file 

export const RemoveFileToCloudinary = async (file_id) => {
    try {
        if (!file_id) return null;
        // upload file on cloudinary
        const responce = await cloudinary.uploader.destroy(file_id)
        .then(
            // file deleted successfully
            console.log("file deleted successfully")
        )
        return responce // return responce for uses
        
    } catch (error) {
        // file unlink from sever if face any error to upload cloudinary 
        return error
        
    }
}