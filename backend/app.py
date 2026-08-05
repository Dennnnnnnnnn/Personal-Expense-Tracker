from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from .storage import read_expenses, save_expenses_to_file, get_next_id
from .storage import save_expense_to_database, read_expenses_from_database, update_expense_in_database, remove_expense_from_database #related to db imports
from .expense import Expense
from .database import initialize_database, get_connection
from pydantic import BaseModel
import os

app = FastAPI()
initialize_database()
DATA_FILE = "backend/data.json"
app.add_middleware(CORSMiddleware, allow_origins=["http://localhost:5173"], allow_methods=["*"], allow_headers=["*"],)

#get expenses
@app.get("/expenses")
def get_expenses():
    #expenses = read_expenses(DATA_FILE) #related to .json file
    conn = get_connection()
    expenses = read_expenses_from_database(conn)
    conn.close()
    return [expense.to_dict() for expense in expenses]

class ExpenseCreate(BaseModel): #expense validator - used to check if the data types that come from frontend meet my class dt in models/expense.py. (to avoid price="abc")
    name: str
    price: float
    category: str
    date: str

@app.post("/expenses")
def add_expense(expense: ExpenseCreate):
    conn = get_connection()
    expenses = read_expenses_from_database(conn)
    print(f"Length of expenses array: {len(expenses)}")
    
    new_expense = Expense(
        get_next_id(expenses),
        expense.name, 
        expense.price, 
        expense.category, 
        expense.date,
        )

    save_expense_to_database(new_expense, conn)
    conn.close()

    return new_expense.to_dict() #** - unpacking of the dictionary

@app.put("/expenses/{id}")
def update_expense(id: int, updated_expense: ExpenseCreate):
    conn = get_connection()

    rows_updated = update_expense_in_database(id, updated_expense, conn)
    conn.close()
    if rows_updated == 0:
        raise HTTPException(status_code=404, detail="Expense wasn't found!")

    return {"message": "Expense was updated successfully"}

@app.delete("/expenses/{id}")
def delete_expense(id: int):
    conn = get_connection()

    rows_updated = remove_expense_from_database(id, conn)

    conn.close()
    if rows_updated == 0:
        raise HTTPException(status_code=404, detail="Expense wasn't found!")

    return {"message" : "Expense was deleted successfully"}