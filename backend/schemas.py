from pydantic import BaseModel

class ExpenseCreate(BaseModel): #expense validator - used to check if the data types that come from frontend meet my class dt in models/expense.py. (to avoid price="abc")
    name: str
    price: float
    category: str
    date: str
    comment: str = ""