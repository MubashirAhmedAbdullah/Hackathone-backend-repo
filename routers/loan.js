import express from "express"
import LoanApplication from "../models/loan.js"
const router = express.Router();

// POST route to apply for a loan// POST route to apply for a loan
router.post('/apply', async (req, res) => {
    try {
      // Destructure the data from the request body
      const {
        name,
        father,
        cnic,
        phoneNo,
        address,
        city,
        country,
        loanAmount,
        loanPurpose,
        installmentAmount,
        loanTimePeriod
      } = req.body;
  
      // Validate the required fields
      if (!name || !father || !cnic || !phoneNo || !address || !city || !country || !loanAmount || !loanPurpose || !installmentAmount || !loanTimePeriod) {
        return res.status(400).json({ message: 'All fields are required' });
      }
  
      // Check if CNIC is unique
      const existingLoan = await LoanApplication.findOne({ cnic });
      if (existingLoan) {
        return res.status(400).json({ message: 'A loan application already exists with this CNIC' });
      }
  
      // Create a new loan application
      const newLoanApplication = new LoanApplication({
        name,
        father,
        cnic,
        phoneNo,
        address,
        city,
        country,
        loanAmount,
        loanPurpose,
        installmentAmount,
        loanTimePeriod
      });
  
      // Save the new loan application to the database
      await newLoanApplication.save();
  
      // Respond with success message
      res.status(201).json({ message: 'Loan application submitted successfully!' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Something went wrong. Please try again later.' });
    }
  });


  // Assuming you have an express app and a LoanApplication model
router.get('/check-cnic', async (req, res) => {
  try {
    // Retrieve CNIC from the query parameters
    const { cnic } = req.query;

    // Validate the CNIC parameter
    if (!cnic) {
      return res.status(400).json({ message: 'CNIC is required' });
    }

    // Check if there is any loan application with the provided CNIC
    const existingLoan = await LoanApplication.findOne({ cnic });

    if (existingLoan) {
      return res.status(200).json({ exists: true, message: 'CNIC already exists' });
    } else {
      return res.status(200).json({ exists: false, message: 'CNIC is available' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Something went wrong. Please try again later.' });
  }
});



export default router;

