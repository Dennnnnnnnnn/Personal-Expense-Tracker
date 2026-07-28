from expense import Expense
from calculator import *

e1 = Expense("Phone", 1000, "Tech", "28.07.2026")
e2 = Expense("Drink", 2, "Food", "28.07.2026")
e3 = Expense("Kebab", 6, "Food", "28.07.2026")
e4 = Expense("Coffee", 2, "Food", "28.07.2026")
expenses = [e1,e2,e3,e4]

print('''
Personal Expense Tracker

1. Add expense
2. Show expenses
3. Show total
4. Show categories
5. Exit
''')
flag = True
while flag:
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
    elif (decision == 2):
        print("Expenses: ")
        for item in expenses:
            print(item)
    elif (decision == 3):
        print("Total expenses: ", calculate_total(expenses))
    elif (decision == 4):
        print("Expenses by categories: ", calculate_total_category(expenses))
    elif (decision == 5):
        flag = False


