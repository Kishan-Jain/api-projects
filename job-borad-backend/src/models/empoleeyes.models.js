import { Schema, model } from "mongoose"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

const EmployeeSchema = new Schema({
	emailId: {
		type: String,
		required: [true, "EmailId is required"],
		unique: [true, "EmailId already exits"]
	},
	fullName: {
		type: String,
		required: [true, "FullName is required"]
	},
	password: {
		type: String,
		required: [true, "EmailId is required"],
	},
	companyDetails: {
		name: {
			type: String,
			required: true
		},
		department: {
			type: String
		},
		position: {
			type: String
		},
		joinDate: {
			type: Date
		},

	},
	lastLogin: {
		type: Date
	},
	lastLogout: {
		type: Date,
	},
	isActive: {
		type: Boolean,
		default: true
	},
	avatar: {
		type: String,
	},
	jobsArray: [{
		jobTitle : String,
		jobId : {
		type: Schema.Types.ObjectId,
		ref: "Job"
		}, 
		addDate : Date
	}],
	previousJobsArray: [{
		jobTitle : String,
		jobId : {
			type: Schema.Types.ObjectId,
			ref: "Job"
			}, 
		jobAddDate : Date,
		addDate : Date
	}],
	connectionRequestSendList : [{
		userId : {
			type:String,
			required : true,
			unique : true
		},
		userType : String,
		Date : {
			type : Date
		}
	}],
	connectionRequestReceivedList : [{
		userId : {
			type:String,
			required : true,
			unique : true
		},
		userType : String,
		Date : {
			type : Date
		}
	}],
	connectionList : [{
		userId : {
			type:String,
			required : true,
			unique : true
		},
		userType : String,
		Date : {
			type : Date
		}
	}],
	followersRequestList : [{
		userId : {
			type:String,
			required : true,
			unique : true
		},
		userType : String,
		Date : {
			type : Date
		}
	}],
	followingRequestList : [{
		userId : {
			type:String,
			required : true,
			unique : true
		},
		userType : String,
		Date : {
			type : Date
		}
	}],
	followersList : [{
		userId : {
			type:String,
			required : true,
			unique : true
		},
		userType : String,
		Date : {
			type : Date
		}
	}],
	followingList : [{
		userId : {
			type:String,
			required : true,
			unique : true
		},
		userType : String,
		Date : {
			type : Date
		}
	}]
}, { timestamps: true })

// save password with hash
EmployeeSchema.pre("save", async function (next) {
	if (this.isModified("password")) (
		this.password = await bcrypt.hash(this.password, 10)
	)
	next()
})

// custom methods for utilities of schemas
// check password is correct
EmployeeSchema.methods.checkPasswordCorrect = async function (password) {
	return await bcrypt.compare(password, this.password)
}

// generate AccessRefreshTokens
EmployeeSchema.methods.GenerateAccessToken = async function () {
	return await jwt.sign({
		_id: this._id,
    userType : "Employee"
	},
		process.env.ACCESS_TOKEN_SECRET_KEY,
		{
			expiresIn: process.env.ACCESS_TOKEN_EXPIRY
		}
	)
}
EmployeeSchema.methods.GenerateRefreshToken = async function () {
	return await jwt.sign({
		_id: this._id,
    userType : "Employee"
	},
		process.env.REFRESH_TOKEN_SECRET_KEY,
		{
			expiresIn: process.env.REFRESH_TOKEN_EXPIRY
		}
	)
}


// models
const Employee = model("Employee", EmployeeSchema)
export default Employee
