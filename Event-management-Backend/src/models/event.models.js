import mongoose, { Schema } from "mongoose";

// Define the schema for Event Details
const EventSchema = new Schema({
    title : {
        type : String,
        required:[true, "Event Title is required"]
    },
    description : {
        type : String,
        required:[true, "Please describe event all details"]
    },
    location : {
        type : String,
        required:[true, "Event locaation is required"]
    },
    startDate : {
        type : Date,
        required:[true, "Start date is required"]
    },
    endDate : {
        type : Date,
        required:[true, "End date is required"]
    },
    userId : {
        type : Schema.Types.ObjectId,
        ref : "UserDetail",
        required:[true, "Event Title is required"]
    },
    
}, { timestamps: true }); // Automatically adds createdAt and updatedAt fields

// Export the Event model
const Event = mongoose.model('Event', EventSchema);
export default Event