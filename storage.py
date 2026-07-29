from expense import Expense
import json

def convert_expenses_to_list(expenses: list[Expense]) -> list[dict]:
    expenses_json = list()

    for expense in expenses:
        expenses_json.append(expense.to_dict())

    return expenses_json

def save_expenses_to_file(expenses: list[Expense], filename):
    with open(filename, "w") as file:
        json.dump(convert_expenses_to_list(expenses), file, indent=2)

# def save_json_to_file(expenses: list[dict], filename):
#     with open(filename, "w") as file:
#         json.dump(expenses, file, indent=2)
def remove_expense_from_list(expenses: list[Expense], num_to_remove: str) -> list[Expense]:
    # found = False
    # for expense in expenses:
    #     if expense.name == name_to_remove:
    #         expenses.remove(expense)
    #         found = True
    #         break
    # if found == True:
    #     return expenses
    # else: print("Expense not found")
    if num_to_remove < len(expenses):
        expenses.pop(num_to_remove)
        return expenses
    else: print("Expense not found")

def read_expenses(filename: str) -> list[Expense]:
    try:
        with open (filename, "r") as jsonfile:
            try:
                data = json.load(jsonfile)
            except json.decoder.JSONDecodeError:
                return []
    except FileNotFoundError:
        return []
    
    data_list = list()
    for item in data:
        expense = Expense.from_dict(item)
        data_list.append(expense)
        
    return data_list
