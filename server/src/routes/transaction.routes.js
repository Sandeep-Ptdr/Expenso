const express = require("express");
const {
  createTransaction,
  getTransactions,
  updateTransaction,
  deleteTransaction,
} = require("../controllers/transaction.controller");
const { protect } = require("../middlewares/auth.middleware");
const { validateRequest } = require("../middlewares/validate-request.middleware");
const {
  createTransactionValidation,
  updateTransactionValidation,
  getTransactionsValidation,
  transactionIdValidation,
} = require("../validations/transaction.validation");

const router = express.Router();

router.use(protect);

router
  .route("/")
  .post(createTransactionValidation, validateRequest, createTransaction)
  .get(getTransactionsValidation, validateRequest, getTransactions);

router
  .route("/:transactionId")
  .patch(updateTransactionValidation, validateRequest, updateTransaction)
  .delete(transactionIdValidation, validateRequest, deleteTransaction);

module.exports = router;
