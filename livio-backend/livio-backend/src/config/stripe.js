const stripe = require("stripe");
const Stripe = stripe(process.env.STRIPE_SECRET_KEY);

const createCheckoutSession = async (price, customer, expense) => {
  try {
    const session = await Stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer,
      line_items: [
        {
          price_data: {
            currency: process.env.STRIPE_CURRENCY,
            product_data: {
              name: expense.description,
            },
            unit_amount: price * 100,
          },
          // price should be the ID of a price object
          quantity: 1,
        },
      ],
      success_url: `${process.env.CLIENT_URL}/expense.html`,
      cancel_url: `${process.env.CLIENT_URL}/expense.html`,
    });

    return session;
  } catch (error) {
    throw new Error(error);
  }
};

const createBillingSession = async userId => {
  const session = await Stripe.billingPortal.sessions.create({
    customer: userId.toString(),
    return_url: process.env.CLIENT_URL,
  });

  return session;
};

const getCustomerID = async user => {
  const customer = await Stripe.customers.list({
    email: user.email,
  });

  return customer.data[0].id;
};

const createNewCustomer = async (user, expenseId) => {
  const customer = await Stripe.customers.create({
    email: user.email,
    name: `${user.firstName} ${user.lastName}`,
    metadata: {
      userId: user.id.toString(),
      expenseId: expenseId.toString(),
    },
  });

  return customer;
};

const retrieveCustomer = async customerId => {
  const customer = await Stripe.customers.retrieve(customerId);
  let { metadata: userInfo, id } = customer;
  return { userInfo, id };
};

module.exports = {
  createCheckoutSession,
  createBillingSession,
  getCustomerID,
  createNewCustomer,
  retrieveCustomer,
};
