import sqlite3
import os


# Find the RecoverAI project folder
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Location of the RecoverAI database
DB_PATH = os.path.join(BASE_DIR, "recoverai.db")


def analyze_transaction(transaction):
    """
    Analyze a transaction and recommend a recovery action.
    """

    transaction_id = transaction["transaction_id"]
    status = transaction["status"]
    failure_reason = transaction["failure_reason"]
    attempts = transaction["attempts"]

    # Rule 1: Successful transaction
    if status == "success":
        return {
            "transaction_id": transaction_id,
            "action": "No recovery required",
            "priority": "Low",
            "reason": "Payment was successful."
        }

    # Rule 2: Already recovered
    if transaction["recovery_status"] == "Recovered":
        return {
            "transaction_id": transaction_id,
            "action": "No recovery required",
            "priority": "Low",
            "reason": "Payment has already been recovered."
        }

    # Rule 3: Multiple failed attempts
    if attempts >= 3:
        return {
            "transaction_id": transaction_id,
            "action": "Contact customer support",
            "priority": "High",
            "reason": "Multiple payment attempts have failed."
        }

    # Rule 4: Abandoned checkout
    if status == "abandoned":
        return {
            "transaction_id": transaction_id,
            "action": "Send checkout reminder",
            "priority": "Medium",
            "reason": "Customer abandoned the checkout process."
        }

    # Rule 5: Insufficient funds
    if failure_reason == "Insufficient funds":

        if attempts >= 2:
            return {
                "transaction_id": transaction_id,
                "action": "Suggest alternate payment method",
                "priority": "High",
                "reason": "Payment failed multiple times because of insufficient funds."
            }

        return {
            "transaction_id": transaction_id,
            "action": "Retry payment after 24 hours",
            "priority": "Medium",
            "reason": "Payment failed because of insufficient funds."
        }

    # Rule 6: Card declined
    if failure_reason == "Card declined":
        return {
            "transaction_id": transaction_id,
            "action": "Request alternate payment method",
            "priority": "High",
            "reason": "The customer's card was declined."
        }

    # Rule 7: Bank transaction declined
    if failure_reason == "Bank transaction declined":
        return {
            "transaction_id": transaction_id,
            "action": "Suggest another payment method",
            "priority": "High",
            "reason": "The bank declined the transaction."
        }

    # Rule 8: Subscription payment failure
    if failure_reason == "Subscription payment failed":
        return {
            "transaction_id": transaction_id,
            "action": "Send subscription payment reminder",
            "priority": "High",
            "reason": "A subscription payment failed."
        }

    # Rule 9: Generic failed payment
    if status == "failed":
        return {
            "transaction_id": transaction_id,
            "action": "Retry payment",
            "priority": "Medium",
            "reason": "Payment failed and may be recoverable."
        }

    # Default rule
    return {
        "transaction_id": transaction_id,
        "action": "No action",
        "priority": "Low",
        "reason": "No recovery rule matched."
    }


def get_all_transactions():
    """
    Get all transactions from the RecoverAI database.
    """

    connection = sqlite3.connect(DB_PATH)

    # Allows us to access columns using their names
    connection.row_factory = sqlite3.Row

    cursor = connection.cursor()

    cursor.execute("""
        SELECT
            id,
            transaction_id,
            customer_id,
            amount,
            status,
            failure_reason,
            attempts,
            recovery_status,
            created_at
        FROM transactions
        ORDER BY id
    """)

    transactions = cursor.fetchall()

    connection.close()

    return transactions


def analyze_all_transactions():
    """
    Analyze every transaction using the recovery engine.
    """

    transactions = get_all_transactions()

    results = []

    for transaction in transactions:

        analysis = analyze_transaction(transaction)

        results.append({
            "transaction_id": transaction["transaction_id"],
            "customer_id": transaction["customer_id"],
            "amount": transaction["amount"],
            "status": transaction["status"],
            "failure_reason": transaction["failure_reason"],
            "attempts": transaction["attempts"],
            "recovery_status": transaction["recovery_status"],
            "action": analysis["action"],
            "priority": analysis["priority"],
            "reason": analysis["reason"]
        })

    return results


# Test the recovery engine
if __name__ == "__main__":

    results = analyze_all_transactions()

    print("\n" + "=" * 100)
    print("                 RECOVERAI RECOVERY ANALYSIS")
    print("=" * 100)

    for result in results:

        print(f"""
Transaction ID : {result["transaction_id"]}
Customer ID    : {result["customer_id"]}
Amount         : ₹{result["amount"]:.2f}
Status         : {result["status"]}
Failure Reason : {result["failure_reason"]}
Attempts       : {result["attempts"]}
Recovery Status: {result["recovery_status"]}
Priority       : {result["priority"]}
Action         : {result["action"]}
Reason         : {result["reason"]}
""")

        print("-" * 100)

    print(f"\nTotal Transactions Analyzed: {len(results)}")
