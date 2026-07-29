from expense import Expense
from calculator import calculate_total_price, calculate_total_category
from storage import read_expenses, save_expenses_to_file, remove_expense_from_list

running = True
data_file = "data.json"
expenses = read_expenses(data_file) 

def print_expenses(expenses):
    if not expenses: 
        print("No expenses in the file")
    else:
        for index, item in enumerate(expenses):
            print(f"{index}: {item}")

while running:
    
    print('''
    Personal Expense Tracker

    1. Add expense
    2. Remove expense
    3. Show expenses
    4. Show total
    5. Show categories
    6. Exit
    ''')

    decision = int(input("Choose: "))
    if (decision == 1):
        name = input("Enter name of expense: ")
        try:
            price = int(input("Enter price: "))
        except ValueError:
            print("Price must be integer")
            price = int(input("Enter price: "))
        category = input("Enter category: ")
        date = input("Enter date: ")

        expenses.append(Expense(name, price, category, date))
        save_expenses_to_file(expenses, data_file)

    elif (decision == 2):
        print_expenses(expenses)
        expense_to_remove = int(input("Enter the number of expense to remove"))
        if expense_to_remove < len(expenses) and expense_to_remove >= 0:
            expenses = remove_expense_from_list(expenses, expense_to_remove)
        else: print("Expense not found")
        save_expenses_to_file(expenses, data_file)
        print(f"Expense {expense_to_remove} was removed successfully")
        
    elif (decision == 3):
        print("Expenses: ")
        print_expenses(expenses)
        
    elif (decision == 4):
        print("Total expenses: ", calculate_total_price(expenses))

    elif (decision == 5):
        print("Expenses by categories: ", calculate_total_category(expenses))

    elif (decision == 6):
        running = False

    else: print("Incorrect value")