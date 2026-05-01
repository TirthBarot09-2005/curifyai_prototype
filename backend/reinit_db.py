import os
from database import init_db

if __name__ == "__main__":
    db_path = os.path.join(os.path.dirname(__file__), "curify.db")
    if os.path.exists(db_path):
        os.remove(db_path)
        print(f"Removed existing database at {db_path}")
    
    init_db()
    print("Database re-initialized with updated schema and seed data.")
