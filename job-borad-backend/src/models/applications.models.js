import { Schema, model } from "mongoose";

const ApplicationSchema = new Schema({
  jobTitle: {
    type: String,
    required: true,
  },
  jobId: {
    type: Schema.Types.ObjectId,
    ref: "Job",
    required: true,
  },
  candidateId: {
    type: Schema.Types.ObjectId,
    ref: "Candidate",
    required: true,
  },
  candidateName: {
    type: String,
    required: true,
  },
  keySkills: [{
    type: String,
    required: true,
  }],
  candidateResume: {
    type: String,
    required: true,
  },
  applicationVarificationStatus: {
    type: String,
    default: "Pending",
  },
  applicationStatus: {
    type: String,
    default: "Pending",
  },
}, {timestamps:true});

// models
const Application = model("Application", ApplicationSchema);
export default Application;
