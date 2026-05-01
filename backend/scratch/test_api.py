import httpx
import json

def test_search_api():
    url = "http://127.0.0.1:8000/api/search"
    payload = {
        "query": "hospitals in Ahmedabad",
        "location": "Ahmedabad",
        "budget_max": 5000000,
        "age": 30,
        "comorbidities": []
    }
    try:
        response = httpx.post(url, json=payload, timeout=10.0)
        data = response.json()
        print(f"Status Code: {response.status_code}")
        print(f"Hospitals found: {len(data['hospitals'])}")
        for h in data['hospitals']:
            print(f"- {h['name']} (Score: {h['composite_score']})")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_search_api()
