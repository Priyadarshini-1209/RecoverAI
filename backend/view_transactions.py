import sqlite3
import os


# Find the RecoverAI project folder
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Location of the RecoverAI database
DB_PATH = os.path.join(BASE_DIR, "recoverai.db")


def view_transactions():

    connection = sqlite3.connect(DB_PATH)
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

    print("\n" + "=" * 100)
    print("                 RECOVERAI TRANSACTIONS")
    print("=" * 100)

    for transaction in transactions:

        print(f"""
ID              : {transaction[0]}
Transaction ID  : {transaction[1]}
Customer ID     : {transaction[2]}
Amount          : ₹{transaction[3]:.2f}
Status          : {transaction[4]}
Failure Reason  : {transaction[5]}
Attempts        : {transaction[6]}
Recovery Status : {transaction[7]}
Created At      : {transaction[8]}
""")

        print("-" * 100)


if __name__ == "__main__":
    view_transactions()
