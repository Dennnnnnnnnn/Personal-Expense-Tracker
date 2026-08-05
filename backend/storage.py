from .expense import Expense
import json
import sqlite3

def convert_expenses_to_list(expenses: list[Expense]) -> list[dict]:
    expenses_json = list()

    for expense in expenses:
        expenses_json.append(expense.to_dict())

    return expenses_json

def save_expenses_to_file(expenses: list[Expense], filename):
    with open(filename, "w") as file:
        json.dump(convert_expenses_to_list(expenses), file, indent=2)

def save_expense_to_database(expense: Expense, connection):
    cursor = connection.cursor()

    print(f"INSERT OR IGNORE INTO expenses (id, name, price, category, date) VALUES {expense.id, expense.name, expense.price, expense.category, expense.date}")
    cursor.execute("INSERT OR IGNORE INTO expenses (id, name, price, category, date) VALUES (?,?,?,?,?)", (expense.id, expense.name, expense.price, expense.category, expense.date))

    connection.commit()

def update_expense_in_database(id: int, updated_expense, connection):
    cursor = connection.cursor()

    cursor.execute("UPDATE expenses SET name=?, price=?, category=?, date=? WHERE id=?", (updated_expense.name, updated_expense.price, updated_expense.category, updated_expense.date, id))

    connection.commit()
    return cursor.rowcount

def remove_expense_from_list(expenses: list[Expense], num_to_remove: int) -> list[Expense]:
    expenses.pop(num_to_remove)
    
    return expenses

def remove_expense_from_database(id: int, connection):
    cursor = connection.cursor()

    cursor.execute("DELETE FROM expenses WHERE id=?", (id,))

    connection.commit()
    return cursor.rowcount

def get_next_id(expenses: list[Expense]) -> int:
    return 1 if not expenses else max([expense.id for expense in expenses]) + 1

def read_expenses(filename: str) -> list[Expense]:
    try:
        with open (filename, "r") as jsonfile:
            try:
                data = json.load(jsonfile)
                print(f"JSON file loaded: {data}")
            except json.decoder.JSONDecodeError:
                return []
    except FileNotFoundError:
        return []
    
    data_list = list()
    for item in data: #each dictionary from json we convert to expense object 
        expense = Expense.from_dict(item)
        data_list.append(expense)
        
    return data_list

def read_expenses_from_database(connection: sqlite3):
    data_list = list()
    cursor = connection.cursor()
    data = cursor.execute("SELECT * FROM expenses").fetchall()
    for row in data:
        data_list.append(Expense(row[0], row[1], row[2], row[3], row[4]))
    return data_list
        

