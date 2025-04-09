import sqlite3
from tabulate import tabulate

def view_database():
    # Connect to the database
    conn = sqlite3.connect('site.db')
    cursor = conn.cursor()

    # Get all tables
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = cursor.fetchall()
    
    print("\n=== Database Tables ===")
    for table in tables:
        table_name = table[0]
        print(f"\nTable: {table_name}")
        
        # Get table structure
        cursor.execute(f"PRAGMA table_info({table_name})")
        columns = cursor.fetchall()
        print("\nColumns:")
        print(tabulate(columns, headers=['cid', 'name', 'type', 'notnull', 'dflt_value', 'pk']))
        
        # Get table data
        cursor.execute(f"SELECT * FROM {table_name}")
        rows = cursor.fetchall()
        if rows:
            print("\nData:")
            # Get column names
            cursor.execute(f"PRAGMA table_info({table_name})")
            column_names = [column[1] for column in cursor.fetchall()]
            print(tabulate(rows, headers=column_names))
        else:
            print("No data in this table")

    # Close the connection
    conn.close()

if __name__ == '__main__':
    view_database() 