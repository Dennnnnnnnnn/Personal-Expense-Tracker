class Expense:
    def __init__(self, name, price, category, date):
        if not name:
            raise ValueError("Name can't be empty")
        if price <= 0:
            raise ValueError("Price must be positive")
        self._name = name
        self._price = price
        self._category = category
        self._date = date

    def __str__(self):
        return f"Name: {self.name}, Price: {self.price}, Date: {self.date} ({self.category})"

    @property
    def name(self):
        return self._name
    # @name.setter
    # def name(self, new_name):
    #     if not new_name:
    #         raise ValueError("Name can't be empty")
    #     else: self._name = new_name

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
    # @date.setter
    # def date(self, new_date):
    #     self._date = new_date

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
