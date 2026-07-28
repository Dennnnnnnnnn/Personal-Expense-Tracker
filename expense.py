class Expense:
    def __init__(self, name, price, category, date):
        if not name:
            raise ValueError("Name can't be empty")
        if price <= 0:
            raise ValueError("Price must be positive")
        self.name = name
        self.price = price
        self.category = category
        self.date = date

    def __str__(self):
        return f"Name: {self.name}, Price: {self.price}, Date: {self.date} ({self.category})"
