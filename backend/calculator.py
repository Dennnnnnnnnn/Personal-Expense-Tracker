from .expense import Expense

def calculate_total_price(expenses: list[Expense]) -> float:
    total_price = 0

    for item in expenses:
        total_price += item.price

    return total_price

def calculate_total_category(expenses: list[Expense]) -> dict:
    categories = {}

    for item in expenses:
        categories.setdefault(item.category, 0)
        categories[item.category] += item.price

    return categories