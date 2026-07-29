from expense import Expense
from calculator import calculate_total, calculate_total_category
from storage import read_expenses, save_expenses_to_file

running = True
data_file = "data.json"
expenses = read_expenses(data_file) 

while running:
    
    print('''
    Personal Expense Tracker

    1. Add expense
    2. Show expenses
    3. Show total
    4. Show categories
    5. Exit
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
        print("Expenses: ")
        for item in expenses:
            print(item)

    elif (decision == 3):
        print("Total expenses: ", calculate_total(expenses))

    elif (decision == 4):
        print("Expenses by categories: ", calculate_total_category(expenses))

    elif (decision == 5):
        running = False

    else: print("Incorrect value")
