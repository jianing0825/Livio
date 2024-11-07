const express = require("express");
const router = express.Router();
const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const {
  createNewCustomer,
  createCheckoutSession,
  retrieveCustomer,
} = require("../config/stripe");
const UserService = require("../services/userService");
const ExpenseService = require("../services/expenseService");

router.post("/", async (req, res) => {
  try {
    const { userId, expenseId, paymentDue } = req.body;

    let user = await UserService.getUserByID(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const expense =
      await ExpenseService.getExpenseByIDAndValidatePendingPayment(
        expenseId,
        userId
      );

    user = {
      id: userId,
      ...user,
    };

    const customerInfo = await createNewCustomer(user, expenseId);

    // Create checkout session
    const session = await createCheckoutSession(
      paymentDue,
      customerInfo.id,
      expense
    );

    res.send({ session });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    try {
      const sig = req.headers["stripe-signature"];
      const rawBody = req.rawBody || req.body;

      let event;
      try {
        event = stripe.webhooks.constructEvent(
          rawBody,
          sig,
          process.env.STRIPE_WEBHOOK_SECRET
        );
      } catch (err) {
        console.log(`⚠️Webhook signature verification failed.`, err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
      }

      const data = event.data.object;
      //   console.log(data);

      if (
        event.type === "checkout.session.completed" &&
        data.payment_status === "paid"
      ) {
        const { userInfo, id } = await retrieveCustomer(data.customer);

        await ExpenseService.updatePaymentStatusForUser(
          userInfo.expenseId,
          userInfo.userId,
          "paid"
        );
        // Done...
      }

      res.send({ received: true });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
);

module.exports = router;
