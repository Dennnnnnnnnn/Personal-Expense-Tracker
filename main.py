from expense import Expense

e1 = Expense("Phone", 1000, "Tech", "28.07.2026")
e2 = Expense("Drink", 2, "Food", "28.07.2026")
e3 = Expense("Kebab", 6, "Food", "28.07.2026")
e4 = Expense("Coffee", 2, "Food", "28.07.2026")

expenses = [e1,e2,e3,e4]
for item in expenses:
    print(item)
