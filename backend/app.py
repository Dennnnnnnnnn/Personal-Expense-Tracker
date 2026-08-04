from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from .storage import read_expenses, save_expenses_to_file, get_next_id
from .expense import Expense
from pydantic import BaseModel
import os

app = FastAPI()
DATA_FILE = "backend/data.json"
app.add_middleware(CORSMiddleware, allow_origins=["http://localhost:5173"], allow_methods=["*"], allow_headers=["*"],)

#get expenses
@app.get("/expenses")
def get_expenses():
    expenses = read_expenses(DATA_FILE)
    print("Loaded expenses:", expenses)
    print("Number of expenses:", len(expenses))
    return [expense.to_dict() for expense in expenses]

class ExpenseCreate(BaseModel): #expense validator - used to check if the data types that come from frontend meet my class dt in models/expense.py. (to avoid price="abc")
    name: str
    price: float
    category: str
    date: str

@app.post("/expenses")
def add_expense(expense: ExpenseCreate):
    expenses = read_expenses(DATA_FILE)
    new_expense = Expense(
        get_next_id(expenses),
        expense.name, 
        expense.price, 
        expense.category, 
        expense.date,
        )
    expenses.append(new_expense)
    save_expenses_to_file(expenses, DATA_FILE)
 
    return new_expense.to_dict() #** - unpacking of the dictionary

@app.put("/expenses/{id}")
def update_expense(id: int, updated_expense: ExpenseCreate):
    expenses = read_expenses(DATA_FILE)

    for current_expense in expenses:
        if current_expense.id == id: #if we found object, update it
            current_expense.name = updated_expense.name
            current_expense.category = updated_expense.category
            current_expense.date = updated_expense.date
            current_expense.price = updated_expense.price

            save_expenses_to_file(expenses, DATA_FILE)
            return current_expense.to_dict()
        
    raise HTTPException(status_code=404, detail="Expense wasn't found!")

@app.delete("/expenses/{id}")
def delete_expense(id: int):
    expenses = read_expenses(DATA_FILE)

    for current_expense in expenses:
        if current_expense.id == id:
            deleted_expense = current_expense
            expenses.remove(current_expense)
            save_expenses_to_file(expenses, DATA_FILE)
            return deleted_expense

    raise HTTPException(status_code=404, detail="Expense wasn't found!")
    