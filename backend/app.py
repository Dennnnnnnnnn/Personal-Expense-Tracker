from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .storage import read_expenses, save_expenses_to_file
from .expense import Expense
from pydantic import BaseModel

app = FastAPI()
DATA_FILE = "backend/data.json"
app.add_middleware(CORSMiddleware, allow_origins=["http://localhost:5173"], allow_methods=["*"], allow_headers=["*"],)

import os
print("Current folder:", os.getcwd())
print("Data file exists:", os.path.exists(DATA_FILE))
#get expenses
@app.get("/expenses")
def get_expenses():
    expenses = read_expenses(DATA_FILE)
    print("Loaded expenses:", expenses)
    print("Number of expenses:", len(expenses))
    return [{"id": index, **expense.to_dict()} for index, expense in enumerate(expenses)]

#add expense
class ExpenseCreate(BaseModel):
    name: str
    price: float
    category: str
    date: str

@app.post("/expenses")
def add_expense(expense: ExpenseCreate):
    expenses = read_expenses(DATA_FILE)
    new_expense = Expense(expense.name, expense.price, expense.category, expense.date,    )
    expenses.append(new_expense)
    save_expenses_to_file(expenses, DATA_FILE)

    return {"id": len(expenses) - 1, **new_expense.to_dict()}