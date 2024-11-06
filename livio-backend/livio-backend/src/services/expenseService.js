const { db } = require("../config/firebase");
const { doc, getDoc, setDoc } = require("firebase/firestore");

const getExpenseByIDAndValidatePendingPayment = async (expenseId, userId) => {
  try {
    const expenseDocRef = doc(db, "expenses", expenseId); // Reference to the user document
    const expenseSnapshot = await getDoc(expenseDocRef); // Get the document

    if (expenseSnapshot.exists()) {
      const expense = expenseSnapshot.data();

      if (expense.paymentStatuses[userId] !== "pending")
        throw new Error("Payment already processed");

      return expense;
    } else {
      throw new Erro("No user found with the given ID");
    }
  } catch (error) {
    throw new Error(error);
  }
};

const updatePaymentStatusForUser = async (expenseId, userId, status) => {
  try {
    const expenseDocRef = doc(db, "expenses", expenseId); // Reference to the user document
    const expenseSnapshot = await getDoc(expenseDocRef); // Get the document

    if (expenseSnapshot.exists()) {
      const expense = expenseSnapshot.data();
      console.log(expense, "expense");
      expense.paymentStatuses[userId] = status;
      await setDoc(expenseDocRef, expense);
    } else {
      throw new Error("No user found with the given ID");
    }
  } catch (error) {
    throw new Error(error);
  }
};

module.exports = {
  getExpenseByIDAndValidatePendingPayment,
  updatePaymentStatusForUser,
};
