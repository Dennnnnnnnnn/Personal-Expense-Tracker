from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from .expense import Expense
from .database import initialize_database, get_connection
from .storage import save_expense_to_database, read_expenses_from_database, update_expense_in_database, remove_expense_from_database, get_next_id #related to db imports
from .schemas import ExpenseCreate

app = FastAPI()
initialize_database()
app.add_middleware(CORSMiddleware, allow_origins=["http://localhost:5173"], allow_methods=["*"], allow_headers=["*"],)

#get expenses
@app.get("/expenses")
def get_expenses():
    conn = get_connection()
    expenses = read_expenses_from_database(conn)
    conn.close()
    
    return [expense.to_dict() for expense in expenses]

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