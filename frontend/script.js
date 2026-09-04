/* ==========================================
   RecoverAI Dashboard
   Complete Script
   ========================================== */

let allTransactions = [];


/* ==========================================
   Load Dashboard
   ========================================== */

async function loadDashboard() {

    try {

        const transactionsResponse = await fetch(
            "http://127.0.0.1:5000/api/transactions"
        );

        if (!transactionsResponse.ok) {
            throw new Error("Failed to fetch transactions");
        }

        const transactions =
            await transactionsResponse.json();


        const analysisResponse = await fetch(
            "http://127.0.0.1:5000/api/recovery-analysis"
        );

        if (!analysisResponse.ok) {
            throw new Error("Failed to fetch recovery analysis");
        }

        const analysis =
            await analysisResponse.json();


        console.log("Transactions:", transactions);
        console.log("Recovery Analysis:", analysis);


        /* Combine transaction data with recovery analysis */

        allTransactions = transactions.map(transaction => {

            const recovery = analysis.find(
                item =>
                    item.transaction_id ===
                    transaction.transaction_id
            );

            return {

                ...transaction,

                action: recovery
                    ? recovery.action
                    : "—",

                priority: recovery
                    ? recovery.priority
                    : "—"

            };

        });


        /* Display dashboard */

        displayTransactions(
            allTransactions
        );

        updateAnalytics(
            allTransactions
        );

        updateAIInsights(
            allTransactions
        );

    }

    catch (error) {

        console.error(
            "RecoverAI Error:",
            error
        );

    }

}


/* ==========================================
   Display Transactions
   ========================================== */

function displayTransactions(transactions) {

    const table =
        document.getElementById(
            "transactionTable"
        );


    if (!table) {
        return;
    }


    table.innerHTML = "";


    if (transactions.length === 0) {

        table.innerHTML = `
            <tr>
                <td colspan="6" class="no-results">
                    No transactions found
                </td>
            </tr>
        `;

        updateStatistics([]);

        return;
    }


    transactions.forEach(transaction => {

        const row =
            document.createElement("tr");


        const status =
            transaction.status
                ? transaction.status.toLowerCase()
                : "unknown";


        const priority =
            transaction.priority
                ? transaction.priority.toLowerCase()
                : "";


        row.innerHTML = `

            <td>

                <span
                    class="transaction-link"
                    data-transaction-id="${transaction.transaction_id}"
                >
                    ${transaction.transaction_id}
                </span>

            </td>


            <td>
                ₹${transaction.amount}
            </td>


            <td>

                <span
                    class="status-badge status-${status}"
                >
                    ${transaction.status}
                </span>

            </td>


            <td>
                ${transaction.failure_reason || "—"}
            </td>


            <td>
                ${transaction.action || "—"}
            </td>


            <td>

                <span
                    class="priority-badge priority-${priority}"
                >
                    ${transaction.priority || "—"}
                </span>

            </td>

        `;


        table.appendChild(row);

    });


    /* Add click events to transaction IDs */

    const transactionLinks =
        document.querySelectorAll(
            ".transaction-link"
        );


    transactionLinks.forEach(link => {

        link.addEventListener(
            "click",
            function () {

                const transactionId =
                    this.getAttribute(
                        "data-transaction-id"
                    );


                showTransactionDetails(
                    transactionId
                );

            }
        );

    });


    updateStatistics(
        transactions
    );

}


/* ==========================================
   Transaction Details
   ========================================== */

function showTransactionDetails(transactionId) {

    const transaction =
        allTransactions.find(
            item =>
                item.transaction_id ===
                transactionId
        );


    if (!transaction) {

        console.error(
            "Transaction not found:",
            transactionId
        );

        return;
    }


    /* Get details panel */

    const detailsPanel =
        document.getElementById(
            "transactionDetails"
        );


    if (!detailsPanel) {
        return;
    }


    /* Fill transaction details */

    const detailsSubtitle =
        document.getElementById(
            "detailsSubtitle"
        );

    if (detailsSubtitle) {

        detailsSubtitle.textContent =
            `Details for ${transaction.transaction_id}`;

    }


    const detailTransactionId =
        document.getElementById(
            "detailTransactionId"
        );

    if (detailTransactionId) {

        detailTransactionId.textContent =
            transaction.transaction_id || "—";

    }


    const detailCustomerId =
        document.getElementById(
            "detailCustomerId"
        );

    if (detailCustomerId) {

        detailCustomerId.textContent =
            transaction.customer_id || "—";

    }


    const detailAmount =
        document.getElementById(
            "detailAmount"
        );

    if (detailAmount) {

        detailAmount.textContent =
            transaction.amount !== undefined
                ? `₹${transaction.amount}`
                : "—";

    }


    const detailStatus =
        document.getElementById(
            "detailStatus"
        );

    if (detailStatus) {

        detailStatus.textContent =
            transaction.status || "—";

    }


    const detailFailureReason =
        document.getElementById(
            "detailFailureReason"
        );

    if (detailFailureReason) {

        detailFailureReason.textContent =
            transaction.failure_reason || "—";

    }


    const detailAttempts =
        document.getElementById(
            "detailAttempts"
        );

    if (detailAttempts) {

        detailAttempts.textContent =
            transaction.attempts !== undefined
                ? transaction.attempts
                : "—";

    }


    const detailRecoveryStatus =
        document.getElementById(
            "detailRecoveryStatus"
        );

    if (detailRecoveryStatus) {

        detailRecoveryStatus.textContent =
            transaction.recovery_status || "—";

    }


    const detailPriority =
        document.getElementById(
            "detailPriority"
        );

    if (detailPriority) {

        detailPriority.textContent =
            transaction.priority || "—";

    }


    const detailAction =
        document.getElementById(
            "detailAction"
        );

    if (detailAction) {

        detailAction.textContent =
            transaction.action ||
            "No recovery recommendation available";

    }


    /* ==========================================
       Recovery Action Button
       ========================================== */

    const recoveryButton =
        document.getElementById(
            "recoveryActionButton"
        );


    const actionMessage =
        document.getElementById(
            "actionMessage"
        );


    if (recoveryButton) {

        /* Clear previous message */

        if (actionMessage) {

            actionMessage.textContent = "";

        }


        /* Check transaction status */

        const transactionStatus =
            transaction.status
                ? transaction.status.toLowerCase()
                : "";


        /* Successful payment */

        /* Successful or already recovered payment */

if (
    transactionStatus === "success" ||
    transaction.recovery_status?.toLowerCase() === "recovered"
) {

    if (
        transaction.recovery_status?.toLowerCase() ===
        "recovered"
    ) {

        recoveryButton.textContent =
            "Recovery Already Executed";

    } else {

        recoveryButton.textContent =
            "No Recovery Required";

    }

    recoveryButton.disabled =
        true;

}
        /* Failed or abandoned payment */

        else {

            recoveryButton.textContent =
                "Execute Recovery Action";

            recoveryButton.disabled =
                false;


            recoveryButton.onclick =
                function () {

                    executeRecoveryAction(
                        transaction
                    );

                };

        }

    }


    /* Show panel */

    detailsPanel.classList.add(
        "active"
    );


    /* Scroll smoothly to details */

    detailsPanel.scrollIntoView({

        behavior: "smooth",

        block: "nearest"

    });

}


/* ==========================================
   Execute Recovery Action
   ========================================== */

async function executeRecoveryAction(transaction) {

    const actionMessage =
        document.getElementById(
            "actionMessage"
        );

    const recoveryButton =
        document.getElementById(
            "recoveryActionButton"
        );

    if (!actionMessage) {
        return;
    }

    actionMessage.textContent =
        "⏳ Executing recovery action...";

    if (recoveryButton) {
        recoveryButton.disabled = true;
        recoveryButton.textContent =
            "Processing...";
    }

    try {

        const response = await fetch(
            "http://127.0.0.1:5000/api/execute-recovery",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    transaction_id:
                        transaction.transaction_id
                })
            }
        );

        const result =
            await response.json();

        if (!response.ok || !result.success) {

            actionMessage.textContent =
                `⚠ ${result.message || "Recovery action failed."}`;

            if (recoveryButton) {
                recoveryButton.disabled = false;
                recoveryButton.textContent =
                    "Execute Recovery Action";
            }

            return;
        }

        actionMessage.textContent =
            `✓ ${result.message} Action: ${result.action}`;

        transaction.recovery_status =
            result.recovery_status;
        if (recoveryButton) {
    recoveryButton.disabled = true;
    recoveryButton.textContent =
        "Recovery Executed";
}

const detailRecoveryStatus =
    document.getElementById(
        "detailRecoveryStatus"
    );

if (detailRecoveryStatus) {
    detailRecoveryStatus.textContent =
        result.recovery_status;
}
    }

    catch (error) {

        console.error(
            "Recovery API Error:",
            error
        );

        actionMessage.textContent =
            "⚠ Unable to connect to the recovery server.";

        if (recoveryButton) {
            recoveryButton.disabled = false;
            recoveryButton.textContent =
                "Execute Recovery Action";
        }

    }

}

/* ==========================================
   Close Transaction Details
   ========================================== */

function closeTransactionDetails() {

    const detailsPanel =
        document.getElementById(
            "transactionDetails"
        );


    if (!detailsPanel) {
        return;
    }


    detailsPanel.classList.remove(
        "active"
    );

}


/* ==========================================
   Close Button Event
   ========================================== */

const closeDetailsButton =
    document.getElementById(
        "closeDetails"
    );


if (closeDetailsButton) {

    closeDetailsButton.addEventListener(
        "click",
        closeTransactionDetails
    );

}


/* ==========================================
   Dashboard Statistics
   ========================================== */

function updateStatistics(transactions) {

    const total =
        transactions.length;


    const failed =
        transactions.filter(
            transaction =>
                transaction.status &&
                transaction.status
                    .toLowerCase() ===
                "failed"
        ).length;


   const recovered =
    transactions.filter(
        transaction =>
            transaction.recovery_status &&
            (
                transaction.recovery_status.toLowerCase() ===
                "completed" ||
                transaction.recovery_status.toLowerCase() ===
                "recovered"
            )
    ).length;

    const recoveryRate =
        failed > 0
            ? Math.round(
                (recovered / failed) * 100
            )
            : 0;


    const totalTransactions =
        document.getElementById(
            "totalTransactions"
        );


    const failedTransactions =
        document.getElementById(
            "failedTransactions"
        );


    const recoveredTransactions =
        document.getElementById(
            "recoveredTransactions"
        );


    const recoveryRateElement =
        document.getElementById(
            "recoveryRate"
        );


    if (totalTransactions) {

        totalTransactions.textContent =
            total;

    }


    if (failedTransactions) {

        failedTransactions.textContent =
            failed;

    }


    if (recoveredTransactions) {

        recoveredTransactions.textContent =
            recovered;

    }


    if (recoveryRateElement) {

        recoveryRateElement.textContent =
            recoveryRate + "%";

    }

}


/* ==========================================
   Analytics
   ========================================== */

function updateAnalytics(transactions) {

    updateStatusChart(
        transactions
    );

    updatePriorityChart(
        transactions
    );

    updateFailureChart(
        transactions
    );

}


/* ==========================================
   Payment Status Chart
   ========================================== */

function updateStatusChart(transactions) {

    const container =
        document.getElementById(
            "statusChart"
        );


    if (!container) {
        return;
    }


    const success =
        transactions.filter(
            t =>
                t.status &&
                t.status.toLowerCase() ===
                "success"
        ).length;


    const failed =
        transactions.filter(
            t =>
                t.status &&
                t.status.toLowerCase() ===
                "failed"
        ).length;


    const abandoned =
        transactions.filter(
            t =>
                t.status &&
                t.status.toLowerCase() ===
                "abandoned"
        ).length;


    const total =
        transactions.length || 1;


    container.innerHTML = `

        ${createChartRow(
            "Success",
            success,
            total
        )}

        ${createChartRow(
            "Failed",
            failed,
            total
        )}

        ${createChartRow(
            "Abandoned",
            abandoned,
            total
        )}

    `;

}


/* ==========================================
   Priority Chart
   ========================================== */

function updatePriorityChart(transactions) {

    const container =
        document.getElementById(
            "priorityChart"
        );


    if (!container) {
        return;
    }


    const high =
        transactions.filter(
            t =>
                t.priority &&
                t.priority.toLowerCase() ===
                "high"
        ).length;


    const medium =
        transactions.filter(
            t =>
                t.priority &&
                t.priority.toLowerCase() ===
                "medium"
        ).length;


    const low =
        transactions.filter(
            t =>
                t.priority &&
                t.priority.toLowerCase() ===
                "low"
        ).length;


    const total =
        transactions.length || 1;


    container.innerHTML = `

        ${createChartRow(
            "High",
            high,
            total
        )}

        ${createChartRow(
            "Medium",
            medium,
            total
        )}

        ${createChartRow(
            "Low",
            low,
            total
        )}

    `;

}


/* ==========================================
   Failure Reason Chart
   ========================================== */

function updateFailureChart(transactions) {

    const container =
        document.getElementById(
            "failureChart"
        );


    if (!container) {
        return;
    }


    const failedTransactions =
        transactions.filter(
            t =>
                t.failure_reason
        );


    const reasons = {};


    failedTransactions.forEach(
        transaction => {

            const reason =
                transaction.failure_reason;


            reasons[reason] =
                (reasons[reason] || 0) + 1;

        }
    );


    const entries =
        Object.entries(
            reasons
        );


    if (entries.length === 0) {

        container.innerHTML = `

            <p class="no-results">
                No failure data available
            </p>

        `;

        return;
    }


    const maxValue =
        Math.max(
            ...entries.map(
                entry => entry[1]
            )
        );


    container.innerHTML =
        entries.map(
            ([reason, count]) => {

                return `

                    <div class="chart-row">

                        <div class="chart-label">

                            <span>
                                ${reason}
                            </span>

                            <strong>
                                ${count}
                            </strong>

                        </div>


                        <div class="chart-bar">

                            <div
                                class="chart-fill"
                                style="width: ${
                                    (count / maxValue) *
                                    100
                                }%">
                            </div>

                        </div>

                    </div>

                `;

            }
        ).join("");

}


/* ==========================================
   Create Chart Row
   ========================================== */

function createChartRow(
    label,
    value,
    total
) {

    const percentage =
        Math.round(
            (value / total) * 100
        );


    return `

        <div class="chart-row">

            <div class="chart-label">

                <span>
                    ${label}
                </span>

                <strong>
                    ${value}
                </strong>

            </div>


            <div class="chart-bar">

                <div
                    class="chart-fill"
                    style="width: ${percentage}%">
                </div>

            </div>

        </div>

    `;

}


/* ==========================================
   AI Recovery Insights
   ========================================== */

function updateAIInsights(transactions) {

    const failureInsight =
        document.getElementById(
            "failureInsight"
        );


    const priorityInsight =
        document.getElementById(
            "priorityInsight"
        );


    const strategyInsight =
        document.getElementById(
            "strategyInsight"
        );


    if (
        !failureInsight ||
        !priorityInsight ||
        !strategyInsight
    ) {

        return;

    }


    /* --------------------------------------
       Failed Payment Pattern
       -------------------------------------- */

    const failedTransactions =
        transactions.filter(
            t =>
                t.status &&
                t.status.toLowerCase() ===
                "failed"
        );


    const failureReasons = {};


    failedTransactions.forEach(
        transaction => {

            const reason =
                transaction.failure_reason;


            if (reason) {

                failureReasons[reason] =
                    (failureReasons[reason] || 0) + 1;

            }

        }
    );


    let mostCommonReason =
        "No major failure pattern detected";


    let mostCommonCount =
        0;


    Object.entries(
        failureReasons
    ).forEach(
        ([reason, count]) => {

            if (count > mostCommonCount) {

                mostCommonReason =
                    reason;

                mostCommonCount =
                    count;

            }

        }
    );


    if (mostCommonCount > 0) {

        failureInsight.textContent =
            `${mostCommonReason} is the most frequent failure pattern, occurring ${mostCommonCount} times among failed payments.`;

    }

    else {

        failureInsight.textContent =
            "No significant payment failure pattern detected.";

    }


    /* --------------------------------------
       High Priority Recovery
       -------------------------------------- */

    const highPriority =
        transactions.filter(
            t =>
                t.priority &&
                t.priority.toLowerCase() ===
                "high"
        ).length;


    priorityInsight.textContent =
        `${highPriority} high-priority transaction${highPriority !== 1 ? "s" : ""} require immediate attention to improve recovery chances.`;


    /* --------------------------------------
       Failed Payment Value
       -------------------------------------- */

    const failedAmount =
        failedTransactions.reduce(
            (total, transaction) => {

                return total +
                    Number(
                        transaction.amount || 0
                    );

            },
            0
        );


    /* --------------------------------------
       Recommended Strategy
       -------------------------------------- */

    let strategy;


    if (
        failedTransactions.length === 0
    ) {

        strategy =
            "All payments are currently successful. Continue monitoring transactions for potential recovery opportunities.";

    }

    else {

        strategy =
            `Prioritize payment retries after a suitable interval and encourage customers to use an alternate payment method. Total failed payment value currently at risk: ₹${failedAmount}.`;

    }


    strategyInsight.textContent =
        strategy;

}


/* ==========================================
   Filter Transactions
   ========================================== */

function filterTransactions() {

    const searchElement =
        document.getElementById(
            "searchInput"
        );


    const statusElement =
        document.getElementById(
            "statusFilter"
        );


    const priorityElement =
        document.getElementById(
            "priorityFilter"
        );


    if (
        !searchElement ||
        !statusElement ||
        !priorityElement
    ) {

        return;

    }


    const searchText =
        searchElement.value
            .toLowerCase()
            .trim();


    const selectedStatus =
        statusElement.value;


    const selectedPriority =
        priorityElement.value;


    const filteredTransactions =
        allTransactions.filter(
            transaction => {

                const transactionId =
                    transaction.transaction_id
                        ? transaction.transaction_id
                            .toLowerCase()
                        : "";


                const status =
                    transaction.status
                        ? transaction.status
                            .toLowerCase()
                        : "";


                const priority =
                    transaction.priority
                        ? transaction.priority
                            .toLowerCase()
                        : "";


                const matchesSearch =
                    transactionId.includes(
                        searchText
                    );


                const matchesStatus =
                    selectedStatus === "all" ||
                    status === selectedStatus;


                const matchesPriority =
                    selectedPriority === "all" ||
                    priority === selectedPriority;


                return (
                    matchesSearch &&
                    matchesStatus &&
                    matchesPriority
                );

            }
        );


    displayTransactions(
        filteredTransactions
    );

}


/* ==========================================
   Search
   ========================================== */

const searchInput =
    document.getElementById(
        "searchInput"
    );


if (searchInput) {

    searchInput.addEventListener(
        "input",
        filterTransactions
    );

}


/* ==========================================
   Status Filter
   ========================================== */

const statusFilter =
    document.getElementById(
        "statusFilter"
    );


if (statusFilter) {

    statusFilter.addEventListener(
        "change",
        filterTransactions
    );

}


/* ==========================================
   Priority Filter
   ========================================== */

const priorityFilter =
    document.getElementById(
        "priorityFilter"
    );


if (priorityFilter) {

    priorityFilter.addEventListener(
        "change",
        filterTransactions
    );

}


/* ==========================================
   Clear Filters
   ========================================== */

const clearFilters =
    document.getElementById(
        "clearFilters"
    );


if (clearFilters) {

    clearFilters.addEventListener(
        "click",
        function () {

            const search =
                document.getElementById(
                    "searchInput"
                );

            const status =
                document.getElementById(
                    "statusFilter"
                );

            const priority =
                document.getElementById(
                    "priorityFilter"
                );


            if (search) {
                search.value = "";
            }


            if (status) {
                status.value = "all";
            }


            if (priority) {
                priority.value = "all";
            }


            displayTransactions(
                allTransactions
            );

        }
    );

}


/* ==========================================
   Start Dashboard
   ========================================== */

loadDashboard();
