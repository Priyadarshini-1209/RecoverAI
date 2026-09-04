from flask import Flask, jsonify, request
from flask_cors import CORS
import sqlite3
import os

from recovery_engine import analyze_all_transactions


app = Flask(__name__)

# Allow the frontend to communicate with Flask
CORS(app)


# Find the RecoverAI project folder
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Location of the database
DB_PATH = os.path.join(BASE_DIR, "recoverai.db")


@app.route("/")
def home():
    return "RecoverAI server is running!"


@app.route("/api/transactions")
def get_transactions():

    connection = sqlite3.connect(DB_PATH)
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

    transaction_list = []

    for transaction in transactions:

        transaction_list.append({
            "id": transaction["id"],
            "transaction_id": transaction["transaction_id"],
            "customer_id": transaction["customer_id"],
            "amount": transaction["amount"],
            "status": transaction["status"],
            "failure_reason": transaction["failure_reason"],
            "attempts": transaction["attempts"],
            "recovery_status": transaction["recovery_status"],
            "created_at": transaction["created_at"]
        })

    return jsonify(transaction_list)


@app.route("/api/recovery-analysis")
def recovery_analysis():

    results = analyze_all_transactions()

    return jsonify(results)
# ==========================================
# Execute Recovery Action API
# ==========================================

@app.route("/api/execute-recovery", methods=["POST"])
def execute_recovery():

    data = request.get_json()

    if not data or "transaction_id" not in data:
        return jsonify({
            "success": False,
            "message": "Transaction ID is required."
        }), 400

    transaction_id = data["transaction_id"]

    connection = sqlite3.connect(DB_PATH)
    connection.row_factory = sqlite3.Row
    cursor = connection.cursor()

    cursor.execute("""
        SELECT
            transaction_id,
            status,
            recovery_status
        FROM transactions
        WHERE transaction_id = ?
    """, (transaction_id,))

    transaction = cursor.fetchone()

    if not transaction:
        connection.close()

        return jsonify({
            "success": False,
            "message": "Transaction not found."
        }), 404

    # Don't recover an already successful payment
    if transaction["status"].lower() == "success":

        connection.close()

        return jsonify({
            "success": False,
            "message": "No recovery required. Payment was already successful.",
            "transaction_id": transaction_id
        }), 400

    # Don't recover an already recovered payment
    if transaction["recovery_status"].lower() == "recovered":

        connection.close()

        return jsonify({
            "success": False,
            "message": "This payment has already been recovered.",
            "transaction_id": transaction_id
        }), 400

    # Get AI recovery recommendation
    analysis_results = analyze_all_transactions()

    analysis = next(
        (
            item
            for item in analysis_results
            if item["transaction_id"] == transaction_id
        ),
        None
    )

    if not analysis:
        connection.close()

        return jsonify({
            "success": False,
            "message": "Recovery analysis not available."
        }), 500

    # Update recovery status
    cursor.execute("""
        UPDATE transactions
        SET recovery_status = 'Recovered'
        WHERE transaction_id = ?
    """, (transaction_id,))

    connection.commit()
    connection.close()

    return jsonify({
        "success": True,
        "message": "Recovery action executed successfully.",
        "transaction_id": transaction_id,
        "action": analysis["action"],
        "priority": analysis["priority"],
        "reason": analysis["reason"],
        "recovery_status": "Recovered"
    })

if __name__ == "__main__":
    app.run(debug=True)
