const Transaction = require("../models/transaction.model");

const escapeRegex = (value) => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

const buildTransactionPayload = (payload) => {
  const data = {};

  if (payload.type !== undefined) {
    data.type = String(payload.type).trim().toLowerCase();
  }

  if (payload.amount !== undefined) {
    data.amount = Number(payload.amount);
  }

  if (payload.category !== undefined) {
    data.category = String(payload.category).trim();
  }

  if (payload.paymentMethod !== undefined) {
    data.paymentMethod = String(payload.paymentMethod).trim().toLowerCase();
  }

  if (payload.description !== undefined) {
    data.description = String(payload.description).trim();
  }

  if (payload.date !== undefined) {
    data.date = new Date(payload.date);
  }

  if (payload.person !== undefined) {
    data.person = String(payload.person).trim();
  }

  return data;
};

const createTransaction = async (req, res, next) => {
  try {
    const payload = buildTransactionPayload(req.body);

    const transaction = await Transaction.create({
      ...payload,
      user: req.user._id,
    });

    return res.status(201).json({
      success: true,
      message: "Transaction created successfully.",
      data: {
        transaction,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getTransactions = async (req, res, next) => {
  try {
    const query = { user: req.user._id };

    if (req.query.category) {
      query.category = {
        $regex: `^${escapeRegex(String(req.query.category).trim())}$`,
        $options: "i",
      };
    }

    if (req.query.type) {
      query.type = String(req.query.type).trim().toLowerCase();
    }

    if (req.query.paymentMethod) {
      query.paymentMethod = String(req.query.paymentMethod).trim().toLowerCase();
    }

    if (req.query.startDate || req.query.endDate) {
      query.date = {};

      if (req.query.startDate) {
        query.date.$gte = new Date(req.query.startDate);
      }

      if (req.query.endDate) {
        query.date.$lte = new Date(req.query.endDate);
      }
    }

    const transactions = await Transaction.find(query).sort({
      date: -1,
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      message: "Transactions fetched successfully.",
      results: transactions.length,
      data: {
        transactions,
      },
    });
  } catch (error) {
    next(error);
  }
};

const updateTransaction = async (req, res, next) => {
  try {
    const { transactionId } = req.params;

    const existingTransaction = await Transaction.findOne({
      _id: transactionId,
      user: req.user._id,
    });

    if (!existingTransaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found.",
      });
    }

    const updatePayload = buildTransactionPayload(req.body);
    const mergedPayload = {
      type: updatePayload.type ?? existingTransaction.type,
      amount: updatePayload.amount ?? existingTransaction.amount,
      category: updatePayload.category ?? existingTransaction.category,
      paymentMethod:
        updatePayload.paymentMethod ?? existingTransaction.paymentMethod,
      description: updatePayload.description ?? existingTransaction.description,
      date: updatePayload.date ?? existingTransaction.date,
      person:
        updatePayload.person !== undefined
          ? updatePayload.person
          : existingTransaction.person,
    };

    if (mergedPayload.type === "transfer" && !mergedPayload.person) {
      return res.status(400).json({
        success: false,
        message: "Person is required for transfer transactions.",
      });
    }

    Object.assign(existingTransaction, updatePayload);

    if (mergedPayload.type !== "transfer" && updatePayload.person === undefined) {
      existingTransaction.person = "";
    }

    await existingTransaction.save();

    return res.status(200).json({
      success: true,
      message: "Transaction updated successfully.",
      data: {
        transaction: existingTransaction,
      },
    });
  } catch (error) {
    next(error);
  }
};

const deleteTransaction = async (req, res, next) => {
  try {
    const { transactionId } = req.params;

    const deletedTransaction = await Transaction.findOneAndDelete({
      _id: transactionId,
      user: req.user._id,
    });

    if (!deletedTransaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Transaction deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTransaction,
  getTransactions,
  updateTransaction,
  deleteTransaction,
};
