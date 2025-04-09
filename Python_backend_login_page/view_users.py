import sqlite3
from prettytable import PrettyTable

def view_users():
    try:
        # Connect to database
        conn = sqlite3.connect('instance/site.db')
        cursor = conn.cursor()

        # Create pretty table for users
        users_table = PrettyTable()
        users_table.field_names = ["ID", "Username", "Email"]

        # Get all users (excluding password hashes)
        cursor.execute("SELECT id, username, email FROM user")
        users = cursor.fetchall()

        # Add users to table
        for user in users:
            users_table.add_row(user)

        print("\n=== Registered Users ===")
        print(users_table)

        # Create pretty table for features
        features_table = PrettyTable()
        features_table.field_names = ["ID", "Title", "Description", "Author ID"]

        # Get all features
        cursor.execute("SELECT id, title, description, user_id FROM feature")
        features = cursor.fetchall()

        print("\n=== Features ===")
        if features:
            for feature in features:
                features_table.add_row(feature)
            print(features_table)
        else:
            print("No features found")

    except sqlite3.Error as e:
        print(f"Database error: {e}")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        if conn:
            conn.close()

if __name__ == '__main__':
    view_users() 