import mongoose, { Schema } from "mongoose";

// Define the schema for Employee Details
const EmployeeDetailSchema = new Schema({
    // Full name of the employee
    fullName: {
        type: String,
        required: [true, "This field is required"]
    },
    // Email of the employee with validation for correct format
    email: {
        type: String,
        required: [true, "This field is required"],
        unique: [true, "Username already exists"],
        match: [/.+\@.+\..+/, "Please enter a valid email address"]
    },
    // Unique employee ID
    empId: {
        type: String,
        required: [true, "This field is required"],
        unique: [true, "Username already exists"]
    },
    // Department where the employee works
    department: {
        type: String,
        required: [true, "This field is required"]
    },
    // Position or job title of the employee
    position: {
        type: String,
        required: [true, "This field is required"]
    },
    // Branch location of the employee
    branch: {
        type: String,
    },
    // Reference to the user who created this record, default is null
    created_By: {
        type: Schema.Types.ObjectId,
        ref: "UserDetail",
        default: null
    },
    // URL to the employee's avatar image
    avatar: {
        type: String,
        default : process.env.DEFAULT_USER_PIC_CLOUDINARY_URL,
    },
    // Salary of the employee
    salaryInfo: {
        type: String,
    },
    // Date when the employee joined, default is the current date
    joiningDate: {
        type: Date,
        default: Date.now
    },
    // Status to check if the employee is currently active
    isActive: {
        type: Boolean,
        default: true,
    },
}, { timestamps: true }); // Automatically adds createdAt and updatedAt fields

// Export the EmployeeDetail model
const EmployeeDetail = mongoose.model('EmployeeDetail', EmployeeDetailSchema);
export default EmployeeDetail
