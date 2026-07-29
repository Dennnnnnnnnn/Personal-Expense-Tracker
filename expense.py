class Expense:
    def __init__(self, name, price, category, date):
        self.name = name
        self.price = price
        self.category = category
        self.date = date

    def __str__(self):
        return f"Name: {self.name}, Price: {self.price}, Date: {self.date} ({self.category})"

    @property
    def name(self):
        return self._name
    @name.setter
    def name(self, new_name):
        if not new_name:
            raise ValueError("Name can't be empty")
        else: self._name = new_name

    @property
    def price(self):
        return self._price
    @price.setter
    def price(self, new_price):
        if new_price > 0:
            self._price = new_price
        else: raise ValueError("Price must be positive")

    @property
    def date(self):
        return self._date
    @date.setter
    def date(self, new_date):
        self._date = new_date

    @property
    def category(self):
        return self._category
    @category.setter
    def category(self, new_cat):
        self._category = new_cat

    def to_dict(self):
        expense_data = {
            "name": self.name,
            "price": self.price,
            "category": self.category,
            "date": self.date,
        }

        return expense_data

    @classmethod
    def from_dict(cls, json_data: dict):
        name = json_data["name"]
        price = json_data["price"]
        category = json_data["category"]
        date = json_data["date"]

        return cls(name, price, category, date)

e1 = Expense('1',1,'1','1')
e1.to_dict()