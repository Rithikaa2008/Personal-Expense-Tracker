
const form = document.getElementById("transactionForm");

const transactionList =
    document.getElementById("transactionList");

const totalIncomeEl =
    document.getElementById("totalIncome");

const totalExpenseEl =
    document.getElementById("totalExpense");

const balanceEl =
    document.getElementById("balance");

const dateInput = document.getElementById("date");

const chartMessage =
    document.getElementById("chartMessage");

let transactions =
    JSON.parse(localStorage.getItem("expenseTransactions")) || [];

let expenseChart = null;

dateInput.value = new Date().toISOString().slice(0, 10);


// Save transactions in Local Storage
function saveTransactions() {
    localStorage.setItem(
        "expenseTransactions",
        JSON.stringify(transactions)
    );
}


// Format amount in Indian Rupees
function formatCurrency(amount) {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR"
    }).format(amount);
}


// Add new transaction
form.addEventListener("submit", function(event) {

    event.preventDefault();

    const description =
        document.getElementById("description").value.trim();

    const amount =
        Number(document.getElementById("amount").value);

    const type =
        document.getElementById("type").value;

    const category =
        document.getElementById("category").value;

    const date = dateInput.value;

    if (!description || !Number.isFinite(amount) ||
        amount <= 0 || !date) {
        alert("Please enter valid transaction details.");
        return;
    }

    const transaction = {
        id: Date.now(),
        description: description,
        amount: amount,
        type: type,
        category: category,
        date: date
    };

    transactions.push(transaction);

    saveTransactions();

    renderApp();

    form.reset();

    dateInput.value = new Date().toISOString().slice(0, 10);
});


// Calculate income, expenses and balance
function renderSummary() {

    const income = transactions
        .filter(item => item.type === "income")
        .reduce((sum, item) => sum + item.amount, 0);

    const expenses = transactions
        .filter(item => item.type === "expense")
        .reduce((sum, item) => sum + item.amount, 0);

    totalIncomeEl.textContent = formatCurrency(income);

    totalExpenseEl.textContent = formatCurrency(expenses);

    balanceEl.textContent = formatCurrency(income - expenses);
}


// Display transaction history
function renderTransactions() {

    transactionList.innerHTML = "";

    if (transactions.length === 0) {

        transactionList.innerHTML = `
            <tr>
                <td colspan="6" class="empty-state">
                    No transactions added yet.
                </td>
            </tr>
        `;

        return;
    }

    const sortedTransactions = [...transactions].sort(
        (a, b) => new Date(b.date) - new Date(a.date)
    );

    sortedTransactions.forEach(item => {

        const row = document.createElement("tr");

        const values = [
            item.description,
            item.category,
            item.date,
            item.type,
            formatCurrency(item.amount)
        ];

        values.forEach((value, index) => {

            const cell = document.createElement("td");

            cell.textContent = value;

            if (index === 3) {
                cell.className =
                    item.type === "income"
                    ? "type-income"
                    : "type-expense";
            }

            if (index === 4) {
                cell.className =
                    item.type === "income"
                    ? "amount-income"
                    : "amount-expense";
            }

            row.appendChild(cell);
        });

        const actionCell = document.createElement("td");

        const deleteButton = document.createElement("button");

        deleteButton.textContent = "Delete";

        deleteButton.className = "delete-btn";

        deleteButton.type = "button";

        deleteButton.addEventListener("click", function() {
            deleteTransaction(item.id);
        });

        actionCell.appendChild(deleteButton);

        row.appendChild(actionCell);

        transactionList.appendChild(row);
    });
}


// Delete one transaction
function deleteTransaction(id) {

    transactions = transactions.filter(
        item => item.id !== id
    );

    saveTransactions();

    renderApp();
}


// Create expense breakdown chart
function renderChart() {

    const expensesByCategory = {};

    transactions
        .filter(item => item.type === "expense")
        .forEach(item => {

            expensesByCategory[item.category] =
                (expensesByCategory[item.category] || 0)
                + item.amount;
        });

    const labels = Object.keys(expensesByCategory);

    const values = Object.values(expensesByCategory);

    const canvas = document.getElementById("expenseChart");

    if (expenseChart) {
        expenseChart.destroy();
        expenseChart = null;
    }

    chartMessage.hidden = labels.length > 0;

    if (labels.length === 0) {
        return;
    }

    expenseChart = new Chart(canvas, {

        type: "doughnut",

        data: {
            labels: labels,

            datasets: [{
                data: values,

                backgroundColor: [
                    "#4776d0",
                    "#28a879",
                    "#f2a541",
                    "#d85b68",
                    "#8a6acb",
                    "#42a5b5",
                    "#9aa6b8",
                    "#d18aaf"
                ],

                borderWidth: 2
            }]
        },

        options: {
            responsive: true,

            plugins: {
                legend: {
                    position: "bottom"
                }
            }
        }
    });
}


// Clear all transactions
document.getElementById("clearAllBtn")
    .addEventListener("click", function() {

        if (transactions.length === 0) {
            alert("There are no transactions to clear.");
            return;
        }

        if (confirm("Are you sure you want to delete all transactions?")) {

            transactions = [];

            saveTransactions();

            renderApp();
        }
    });


// Update the complete application
function renderApp() {
    renderSummary();
    renderTransactions();
    renderChart();
}


// Display saved transactions when page opens
renderApp();
