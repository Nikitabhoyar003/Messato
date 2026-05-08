const db = require("../config/db");

/* =====================================================
   📌 INSERT TRANSACTION
   ✔ Prevent duplicate ONLINE_EARNING per order
===================================================== */
exports.insertTransaction = async (data) => {
  const {
    vendor_id,
    order_id = null,
    type,
    amount,
    status = "Completed",
    settlement_date = null,
    source = "SYSTEM",
    notes = null,
  } = data;

  // 🟢 Duplicate check ONLY for earnings
  if (type === "ONLINE_EARNING") {
    await db.query(
      `
      INSERT INTO vendor_wallet_transactions
      (
        vendor_id, order_id, type, amount,
        status, settlement_date, source, notes
      )
      SELECT ?, ?, ?, ?, ?, ?, ?, ?
      FROM DUAL
      WHERE NOT EXISTS (
        SELECT 1
        FROM vendor_wallet_transactions
        WHERE order_id = ?
        AND type = 'ONLINE_EARNING'
      )
      `,
      [
        vendor_id,
        order_id,
        type,
        amount,
        status,
        settlement_date,
        source,
        notes,
        order_id,
      ]
    );
  } else {
    // 🟢 Normal insert for withdrawal / COD / etc.
    await db.query(
      `
      INSERT INTO vendor_wallet_transactions
      (
        vendor_id, order_id, type, amount,
        status, settlement_date, source, notes
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        vendor_id,
        order_id,
        type,
        amount,
        status,
        settlement_date,
        source,
        notes,
      ]
    );
  }
};

/* =====================================================
   📌 WALLET SUMMARY
===================================================== */
exports.getWalletSummary = async (vendorId) => {
  const [[row]] = await db.query(
    `
    SELECT

    /* 💰 Available balance */
    COALESCE(SUM(
      CASE
        WHEN LOWER(status) = 'completed'
        THEN amount
        ELSE 0
      END
    ), 0) AS availableBalance,

    /* ⏳ Processing earnings (settlement pending) */
    COALESCE(SUM(
      CASE
        WHEN LOWER(status) = 'processing'
        AND amount > 0
        THEN amount
        ELSE 0
      END
    ), 0) AS processingEarnings,

    /* ⏳ Processing withdrawals */
    COALESCE(SUM(
      CASE
        WHEN LOWER(status) = 'processing'
        AND type = 'WITHDRAWAL'
        THEN ABS(amount)
        ELSE 0
      END
    ), 0) AS processingWithdrawals

    FROM vendor_wallet_transactions
    WHERE vendor_id = ?
    `,
    [vendorId]
  );

  return row;
};

/* =====================================================
   📌 GET ALL TRANSACTIONS
===================================================== */
exports.getTransactions = async (vendorId) => {
  const [rows] = await db.query(
    `
    SELECT
      id,
      order_id,
      type,
      amount,
      status,
      source,
      notes,
      created_at
    FROM vendor_wallet_transactions
    WHERE vendor_id = ?
    ORDER BY created_at DESC
    `,
    [vendorId]
  );

  return rows;
};

/* =====================================================
   📌 TOTAL WITHDRAWN
===================================================== */
exports.getTotalWithdrawn = async (vendorId) => {
  const [[row]] = await db.query(
    `
    SELECT COALESCE(SUM(ABS(amount)),0) AS total
    FROM vendor_wallet_transactions
    WHERE vendor_id = ?
    AND type = 'WITHDRAWAL'
    AND LOWER(status) = 'completed'
    `,
    [vendorId]
  );

  return row.total;
};

/* =====================================================
   📌 TOTAL COD COMMISSION
===================================================== */
exports.getTotalCODCommission = async (vendorId) => {
  const [[row]] = await db.query(
    `
    SELECT COALESCE(SUM(ABS(amount)),0) AS total
    FROM vendor_wallet_transactions
    WHERE vendor_id = ?
    AND type = 'COD_COMMISSION'
    `,
    [vendorId]
  );

  return row.total;
};