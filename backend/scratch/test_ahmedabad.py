import sqlite3
import os
import json

DB_PATH = r"c:\Users\tdbar\Desktop\prototype_v1\backend\curify.db"

def test_search():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    location = "Ahmedabad"
    rows = conn.execute(
        "SELECT * FROM hospitals WHERE LOWER(city) = LOWER(?) OR LOWER(state) = LOWER(?)",
        (location, location)
    ).fetchall()
    
    print(f"Found {len(rows)} hospitals in {location}")
    for row in rows:
        h = dict(row)
        print(f"- {h['name']} ({h['specialties']})")
    
    conn.close()

if __name__ == "__main__":
    test_search()
