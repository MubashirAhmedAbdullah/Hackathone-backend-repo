import mongoose from "mongoose";
const {Schema} = mongoose

const loanApplicationSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  father: {
    type: String,
    required: true
  },
  cnic: {
    type: String,
    required: true,
    unique: true
  },
  phoneNo: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  country: {
    type: String,
    required: true
  },
  loanAmount: {
    type: Number,
    required: true
  },
  loanPurpose: {
    type: String,
    required: true
  },
  installmentAmount: {
    type: Number,
    required: true
  },
  loanTimePeriod: {
    type: Number,
    required: true
  },
  applicationDate: {
    type: Date,
    default: Date.now
  }
},{
    timestamps: true
});

const LoanApplication = mongoose.model('LoanApplication', loanApplicationSchema);

export default LoanApplication;
