import { createApp } from "https://unpkg.com/vue@3/dist/vue.esm-browser.js";
import {
  collection,
  getDocs,
  query,
  where,
  getDoc,
  doc,
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { db } from "../src/firebase.js";

// Register necessary components

let budget = 0;

const app = createApp({
  data: () => ({
    userId: "fFAn1qIMMeEAc6G4R9nf",
    pastTransactions: [],
    loading: true,
    user: null,
    budget: 0,
  }),
  methods: {
    async getUserById(userId) {
      const userDoc = await getDoc(doc(db, "users", userId));
      this.user = userDoc.data();
      this.budget = this.user.budget;
      budget = this.budget;
    },
    async getPastPaidTransactions(userId) {
      //      Query documents where paymentStatuses contains the given participant ID and the payment status is "paid"
      const q = query(
        collection(db, "expenses"),
        where("participants", "array-contains", userId)
      );
      const querySnapshot = await getDocs(q);
      const allExpenses = querySnapshot.docs.map(doc => ({
        id: doc.id,
        data: doc.data(),
      }));
      const filteredExpenses = allExpenses.filter(expense => {
        return expense.data.paymentStatuses[userId] === "paid";
      });
      this.pastTransactions = filteredExpenses.map(expense => {
        return {
          id: expense.id,
          date: new Date(expense.data.timestamp).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
          category: expense.data.category,
          amount: expense.data.expenseSplit[userId],
          status: expense.data.paymentStatuses[userId],
        };
      });
      this.loading = false;
    },
  },
  mounted() {
    this.getUserById(this.userId);
    this.getPastPaidTransactions(this.userId);
  },
});

app.mount("#app");

$(document).ready(async function () {
  // Initialize DataTables for the transactions table
  $("#transactionsTable").DataTable({
    responsive: true,
    paging: true,
    searching: true,
    ordering: true,
    language: {
      search: "_INPUT_",
      searchPlaceholder: "Search transactions...",
    },
  });

  // Function to fetch data from Firestore and update the chart
  async function fetchChartData() {
    let monthlyExpenses = {};
    let currentMonthExpensesByCategory = [];
    const userId = "fFAn1qIMMeEAc6G4R9nf";
    const past12Months = new Date(
      new Date().setMonth(new Date().getMonth() - 12)
    ).toISOString();
    const currentDate = new Date().toISOString();
    const q = query(
      collection(db, "expenses"),
      where("timestamp", ">=", past12Months),
      where("timestamp", "<=", currentDate),
      where("participants", "array-contains", userId)
    );
    const querySnapshot = await getDocs(q);
    const allExpenses = querySnapshot.docs.map(doc => ({
      id: doc.id,
      data: doc.data(),
    }));
    const filteredExpenses = allExpenses.filter(expense => {
      return expense.data.paymentStatuses[userId] === "paid";
    });
    const expensesByMonth = {};
    filteredExpenses.forEach(expense => {
      const month = new Date(expense.data.timestamp).toLocaleString("default", {
        month: "long",
        year: "numeric",
      });
      if (!expensesByMonth[month]) {
        expensesByMonth[month] = [];
      }
      expensesByMonth[month].push(expense);
    });
    monthlyExpenses = expensesByMonth;

    // Split expenses by category for the current month
    const currentMonth = new Date().toLocaleString("default", {
      month: "long",
      year: "numeric",
    });
    const currentMonthExpenses = monthlyExpenses[currentMonth];
    const expensesByCategory = {};
    currentMonthExpenses.forEach(expense => {
      if (!expensesByCategory[expense.data.category]) {
        expensesByCategory[expense.data.category] = [];
      }
      expensesByCategory[expense.data.category].push(expense);
    });

    currentMonthExpensesByCategory = [
      expensesByCategory["Rent"]?.reduce(
        (prev, curr) => prev + curr.data.expenseSplit[userId],
        0
      ) || 0,
      expensesByCategory["Grocery"]?.reduce(
        (prev, curr) => prev + curr.data.expenseSplit[userId],
        0
      ) || 0,
      expensesByCategory["Transportation"]?.reduce(
        (prev, curr) => prev + curr.data.expenseSplit[userId],
        0
      ) || 0,
      expensesByCategory["Utilities"]?.reduce(
        (prev, curr) => prev + curr.data.expenseSplit[userId],
        0
      ) || 0,
      expensesByCategory["Entertainment"]?.reduce(
        (prev, curr) => prev + curr.data.expenseSplit[userId],
        0
      ) || 0,
    ];

    // Get the total expenses for the each month
    const monthlyLabels = Object.keys(monthlyExpenses);
    const monthlyData = Object.values(monthlyExpenses).map(expense => {
      return expense.reduce((prev, curr) => {
        return prev + curr.data.expenseSplit[userId];
      }, 0);
    });

    //   Get Weekly Expenses for the current month
    const weeklyExpenses = {};
    currentMonthExpenses.forEach(expense => {
      const expenseDate = new Date(expense.data.timestamp);
      const weekNumber = Math.ceil(
        (expenseDate.getDate() + new Date(expenseDate).getDay()) / 7
      );
      const week = `Week ${weekNumber}`;
      if (!weeklyExpenses[week]) {
        weeklyExpenses[week] = [];
      }
      weeklyExpenses[week].push(expense);
    });

    // Get Total expenses for each week
    const weeklyLabels = Object.keys(weeklyExpenses);
    const weeklyData = Object.values(weeklyExpenses).map(expense => {
      return expense.reduce((prev, curr) => {
        return prev + curr.data.expenseSplit[userId];
      }, 0);
    });

    // Get Total Expenses
    const totalExpenses = Object.values(monthlyExpenses).reduce(
      (prev, curr) => {
        return (
          prev +
          curr.reduce((prev, curr) => {
            return prev + curr.data.expenseSplit[userId];
          }, 0)
        );
      },
      0
    );

    return {
      monthlyExpenses,
      currentMonthExpensesByCategory,
      monthlyLabels,
      monthlyData,
      weeklyLabels,
      weeklyData,
      totalExpenses,
    };
  }

  // Fetch and update chart data on document ready
  const {
    monthlyExpenses,
    currentMonthExpensesByCategory,
    monthlyLabels,
    monthlyData,
    weeklyLabels,
    weeklyData,
    totalExpenses,
  } = await fetchChartData();
  console.log(monthlyExpenses);
  //   Pie Chart
  const expensePieCtx = document
    .getElementById("expensePieChart")
    .getContext("2d");
  new Chart(expensePieCtx, {
    type: "pie",
    data: {
      labels: [
        "Rent",
        "Grocery",
        "Transportation",
        "Utilities",
        "Entertainment",
      ],
      datasets: [
        {
          label: "Expense Categories",
          data: currentMonthExpensesByCategory,
          backgroundColor: [
            "rgba(54, 162, 235, 0.6)",
            "rgba(255, 206, 86, 0.6)",
            "rgba(75, 192, 192, 0.6)",
            "rgba(153, 102, 255, 0.6)",
            "rgba(255, 99, 132, 0.6)",
          ],
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "top",
        },
      },
    },
  });

  // Bar Chart
  const expenseBarCtx = document
    .getElementById("expenseBarChart")
    .getContext("2d");
  new Chart(expenseBarCtx, {
    type: "bar",
    data: {
      labels: monthlyLabels,
      datasets: [
        {
          label: "Monthly Spending",
          data: monthlyData,
          backgroundColor: "rgba(54, 162, 235, 0.6)",
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });
  // Line Chart
  const expenseLineCtx = document
    .getElementById("expenseLineChart")
    .getContext("2d");
  new Chart(expenseLineCtx, {
    type: "line",
    data: {
      labels: weeklyLabels,
      datasets: [
        {
          label: "Cumulative Spending",
          data: weeklyData,
          borderColor: "rgba(255, 99, 132, 1)",
          fill: true,
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });

  const budgetDoughnutCtx = document
    .getElementById("budgetDoughnutChart")
    .getContext("2d");
  new Chart(budgetDoughnutCtx, {
    type: "doughnut",
    data: {
      labels: ["Spent", "Remaining"],
      datasets: [
        {
          label: "Budget Status",
          data: [totalExpenses, budget - totalExpenses],
          backgroundColor: [
            "rgba(255, 99, 132, 0.6)",
            "rgba(75, 192, 192, 0.6)",
          ],
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "top",
        },
      },
    },
  });
});
