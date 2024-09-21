import { Schema, model } from "mongoose";

const JobSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  employeeId: {
    type: Schema.Types.ObjectId,
    ref: "Employee",
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  startStatus: {
    type: String,
    required: true,
  },
  field: {
    type: String,
    required: true,
  },
  keySkills: [
    {
      type: String,
      required: true,
    },
  ],
  numberOfOpening: {
    type: Number,
    default: 1,
  },
  maxApplications: {
    type: Number,
    default: 1000,
  },
  applicationStartDate: {
    type: Date,
    required: true,
  },
  applicationEndDate: {
    type: Date,
    required: true,
  },
  applicationArray: [
    {
      applicationId: {
        type: Schema.Types.ObjectId,
        ref: "Application",
      },
      date: Date,
    },
  ],
  status: {
    type: String,
    default: "Active",
  },
}, {timestamps : true});

// models
const Job = model("Job", JobSchema);
export default Job;
