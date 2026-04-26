import mysql.connector

# ===== connexion =====
conn = mysql.connector.connect(
    host="localhost",
    user="root",
    password="",
    database="data"
)

cursor = conn.cursor()

print("✅ Connected to MySQL")

# ===== add product =====
def add_product(name, category, quantity, price, status):
    sql = """
    INSERT INTO products (name, category, quantity, price, status)
    VALUES (%s, %s, %s, %s, %s)
    """
    values = (name, category, quantity, price, status)

    cursor.execute(sql, values)
    conn.commit()

    print("✔️ Product added")

# ===== show products =====
def show_products():
    cursor.execute("SELECT * FROM products")
    for row in cursor.fetchall():
        print(row)

# ===== test =====
add_product("Laptop", "Electronics", 10, 900, "En stock")
add_product("Mouse", "Accessories", 50, 20, "En stock")

show_products()

# ===== close =====
conn.close()