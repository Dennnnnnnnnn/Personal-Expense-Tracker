class Expense:
    def __init__(self, id, name, price, category, date, comment=""):
        self.id = id
        self.name = name
        self.price = price
        self.category = category
        self.date = date
        self.comment = comment

    def __str__(self):
        return f"Name: {self.name}(id: {self.id}), Price: {self.price}, Date: {self.date} ({self.category}). Comment: {self.comment}"

    @property
    def id(self):
        return self._id
    @id.setter
    def id(self, new_id):
        if not new_id:
            raise ValueError("Id can't be empty")
        else: self._id = new_id

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

    @property
    def comment(self):
        return self._comment
    @comment.setter
    def comment(self, new_comment):
        self._comment = new_comment

    def to_dict(self):
        expense_data = {
            "id": self.id,
            "name": self.name,
            "price": self.price,
            "category": self.category,
            "date": self.date,
            "comment": self.comment,
        }

        return expense_data

    @classmethod
    def from_dict(cls, json_data: dict):
        id = json_data["id"]
        name = json_data["name"]
        price = json_data["price"]
        category = json_data["category"]
        date = json_data["date"]
        comment = json_data["comment"]

        return cls(id, name, price, category, date, comment)
