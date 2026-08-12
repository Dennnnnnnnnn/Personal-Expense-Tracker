import sqlite3

DATABASE = "backend/expenses.db"

def get_connection():
    try:
        conn = sqlite3.connect(DATABASE)
    except FileNotFoundError: 
        print("Database file was not found!")
        return False
    conn.row_factory = sqlite3.Row
    return conn

def initialize_database():
    conn = get_connection()
    conn.execute("""CREATE TABLE IF NOT EXISTS expenses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    category TEXT NOT NULL,
    date TEXT NOT NULL,
    comment TEXT
    )
""")
    conn.commit()
    conn.close()
    print("Database initialized successfully.")