const Transaction = require('../models/Transaction.model');

// Helper to get financial year prefix, e.g., for Date 2024-04-15 -> 'SVJDM-2425'
const getFinancialYearPrefix = (date) => {
  const d = date ? new Date(date) : new Date();
  const year = d.getFullYear();
  const month = d.getMonth(); // 0-indexed, 3 is April
  const startYear = month >= 3 ? year : year - 1;
  const endYear = startYear + 1;
  return `SVJDM-${startYear.toString().slice(-2)}-${endYear.toString().slice(-2)}`;
};

// Helper to get the latest transaction for a given financial year prefix using numeric collation
const getLatestTransaction = async (prefix) => {
  return await Transaction.findOne({
    transactionNumber: { $regex: new RegExp(`^${prefix}-`) }
  })
    .collation({ locale: 'en', numericOrdering: true })
    .sort({ transactionNumber: -1 })
    .select('transactionNumber')
    .lean();
};

// Helper to determine the next transaction number for a given date
const getNextTransactionNumberValue = async (date) => {
  const prefix = getFinancialYearPrefix(date);
  const lastTransaction = await getLatestTransaction(prefix);

  let nextNumber = `${prefix}-001`;
  if (lastTransaction && lastTransaction.transactionNumber) {
    const match = lastTransaction.transactionNumber.match(new RegExp(`${prefix}-(\\d+)`));
    if (match) {
      const lastNum = parseInt(match[1], 10);
      const newNum = lastNum + 1;
      nextNumber = `${prefix}-${String(newNum).padStart(3, '0')}`;
    }
  }
  return { prefix, nextNumber };
};

// Get all transactions
exports.getAllTransactions = async (req, res) => {
  try {
    const { search, status, paymentMode, startDate, endDate, page = 1, limit = 100 } = req.query;
    const query = { isDeleted: { $ne: true } };

    if (search) {
      query.$or = [
        { transactionNumber: { $regex: search, $options: 'i' } },
        { memberName: { $regex: search, $options: 'i' } },
        { familyName: { $regex: search, $options: 'i' } }
      ];
    }

    if (status) query.status = status;
    if (paymentMode) query.paymentMode = paymentMode;

    if (startDate && endDate) {
      // If status is 'Paid', filter by paidDate; otherwise filter by transactionDate
      const dateField = status === 'Paid' ? 'paidDate' : 'transactionDate';
      query[dateField] = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    let transactions = await Transaction.find(query)
      .sort({ transactionDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('memberId', 'name phone address')
      .lean();

    const count = await Transaction.countDocuments(query);

    res.status(200).json({
      transactions,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get transaction by ID
exports.getTransactionById = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({ _id: req.params.id, isDeleted: { $ne: true } })
      .populate('memberId', 'name phone address city state');

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.status(200).json(transaction);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create new transaction
exports.createTransaction = async (req, res) => {
  try {
    // Auto-generate transaction number if not provided or handle duplicates
    let transactionData = { ...req.body };

    // Clean up data based on memberType
    if (transactionData.memberType === 'non-member') {
      // Remove member-specific fields for non-member transactions
      if (transactionData.memberId === '' || !transactionData.memberId) {
        delete transactionData.memberId;
      }
      if (transactionData.familyMemberName === '' || !transactionData.familyMemberName) {
        delete transactionData.familyMemberName;
      }
    } else {
      // Remove non-member fields for member transactions
      delete transactionData.nonMemberName;
      delete transactionData.nonMemberPhone;
    }

    let attempts = 0;
    const maxAttempts = 10;
    let lastAttemptedNum = 0;

    while (attempts < maxAttempts) {
      try {
        // Get the next transaction number based on financial year
        const prefix = getFinancialYearPrefix(transactionData.transactionDate);

        const lastTransaction = await getLatestTransaction(prefix);

        let nextNum = 1;
        if (lastTransaction && lastTransaction.transactionNumber) {
          const match = lastTransaction.transactionNumber.match(new RegExp(`${prefix}-(\\d+)`));
          if (match) {
            nextNum = parseInt(match[1], 10) + 1;
          }
        }

        // Ensure each retry advances to avoid repeating an attempted number
        nextNum = Math.max(nextNum, lastAttemptedNum + 1);
        lastAttemptedNum = nextNum;

        const nextNumber = `${prefix}-${String(nextNum).padStart(3, '0')}`;

        transactionData.transactionNumber = nextNumber;
        const transaction = new Transaction(transactionData);
        await transaction.save();

        return res.status(201).json(transaction);
      } catch (error) {
        if (error.code === 11000) {
          // If duplicate key error is on transactionNumber, retry with next number
          if (!error.keyPattern || error.keyPattern.transactionNumber) {
            attempts++;
            if (attempts >= maxAttempts) {
              return res.status(400).json({ error: 'Unable to generate unique transaction number. Please try again.' });
            }
            continue;
          }
        }
        throw error;
      }
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update transaction
exports.updateTransaction = async (req, res) => {
  try {
    let updateData = { ...req.body, updatedBy: req.body.updatedBy || 'Admin' };

    // Clean up data based on memberType
    if (updateData.memberType === 'non-member') {
      // Remove member-specific fields for non-member transactions
      if (updateData.memberId === '' || !updateData.memberId) {
        delete updateData.memberId;
      }
      if (updateData.familyMemberName === '' || !updateData.familyMemberName) {
        delete updateData.familyMemberName;
      }
    } else {
      // Remove non-member fields for member transactions
      delete updateData.nonMemberName;
      delete updateData.nonMemberPhone;
    }

    const transaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.status(200).json(transaction);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete transaction
exports.deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndUpdate(
      { _id: req.params.id, isDeleted: { $ne: true } },
      { isDeleted: true, updatedBy: req.body?.updatedBy || 'Admin' },
      { new: true }
    );

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.status(200).json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get transactions by member
exports.getTransactionsByMember = async (req, res) => {
  try {
    const transactions = await Transaction.find({ memberId: req.params.memberId, isDeleted: { $ne: true } })
      .sort({ transactionDate: -1 });

    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get transactions by date range
exports.getTransactionsByDateRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.params;

    const transactions = await Transaction.find({
      paidDate: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      },
      isDeleted: { $ne: true }
    }).sort({ paidDate: -1 });

    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get transaction statistics
exports.getTransactionStats = async (req, res) => {
  try {
    const stats = await Transaction.aggregate([
      {
        $match: { isDeleted: { $ne: true } }
      },
      {
        $group: {
          _id: null,
          totalTransactions: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' },
          paidAmount: {
            $sum: {
              $cond: [{ $eq: ['$status', 'Paid'] }, '$totalAmount', 0]
            }
          },
          pendingAmount: {
            $sum: {
              $cond: [{ $eq: ['$status', 'Pending'] }, '$totalAmount', 0]
            }
          }
        }
      }
    ]);

    const statusCounts = await Transaction.aggregate([
      {
        $match: { isDeleted: { $ne: true } }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      summary: stats[0] || {},
      statusBreakdown: statusCounts
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get unique non-members
exports.getUniqueNonMembers = async (req, res) => {
  try {
    const nonMembers = await Transaction.distinct('nonMemberName', {
      memberType: 'non-member',
      isDeleted: { $ne: true },
    });

    // Sort and filter out empty strings
    const validNonMembers = nonMembers
      .filter(name => name && typeof name === 'string' && name.trim().length > 0)
      .sort((a, b) => a.localeCompare(b));

    res.status(200).json(validNonMembers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get next transaction number
exports.getNextTransactionNumber = async (req, res) => {
  try {
    const { nextNumber } = await getNextTransactionNumberValue(req.query.date || new Date());
    res.status(200).json({ nextTransactionNumber: nextNumber });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
