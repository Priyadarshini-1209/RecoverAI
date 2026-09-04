import sqlite3
import os


# RecoverAI project folder
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Database created by database.py
DB_PATH = os.path.join(BASE_DIR, "recoverai.db")


def add_sample_transactions():

    connection = sqlite3.connect(DB_PATH)
    cursor = connection.cursor()

    transactions = [
        (
            "TXN001",
            "CUST001",
            499.00,
            "success",
            None,
            1,
            "Completed"
        ),
        (
            "TXN002",
            "CUST002",
            999.00,
            "failed",
            "Insufficient funds",
            1,
            "Pending"
        ),
        (
            "TXN003",
            "CUST003",
            1499.00,
            "abandoned",
            "Checkout abandoned",
            0,
            "Pending"
        ),
        (
            "TXN004",
            "CUST004",
            799.00,
            "failed",
            "Bank transaction declined",
            1,
            "Pending"
        ),
        (
            "TXN005",
            "CUST005",
            299.00,
            "failed",
            "Card declined",
            1,
            "Pending"
        ),
        (
            "TXN006",
            "CUST005",
            299.00,
            "success",
            None,
            2,
            "Recovered"
        ),
        (
            "TXN007",
            "CUST006",
            1999.00,
            "failed",
            "Subscription payment failed",
            1,
            "Pending"
        ),
        (
            "TXN008",
            "CUST007",
            599.00,
            "abandoned",
            "Checkout abandoned",
            0,
            "Pending"
        ),
        (
            "TXN009",
            "CUST008",
            1299.00,
            "failed",
            "Insufficient funds",
            1,
            "Pending"
        ),
        (
            "TXN010",
            "CUST008",
            1299.00,
            "failed",
            "Insufficient funds",
            2,
            "Pending"
        )
    ]

    query = """
        INSERT INTO transactions
        (
            transaction_id,
            customer_id,
            amount,
            status,
            failure_reason,
            attempts,
            recovery_status
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """

    successful = 0

    for transaction in transactions:

        try:
            cursor.execute(query, transaction)

            print(f"Added {transaction[0]}")

            successful += 1

        except sqlite3.IntegrityError:

            print(f"{transaction[0]} already exists - skipped")

        except Exception as error:

            print(f"Could not insert {transaction[0]}: {error}")

    connection.commit()
    connection.close()

    print()
    print(f"{successful} sample transactions added successfully!")


if __name__ == "__main__":
    add_sample_transactions()
