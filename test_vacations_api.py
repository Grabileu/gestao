#!/usr/bin/env python3
import requests
import json
from datetime import datetime, timedelta

# Teste de endpoint de vacations
BASE_URL = 'http://localhost:3000/api'

# Dados de teste
test_data = {
    "employee_id": "1768620904508",
    "employee_name": "Angelina Ferreira",
    "acquisition_period_start": "2026-01-17",
    "acquisition_period_end": "2027-01-16",
    "concession_period_end": "2028-01-16",
    "days_entitled": 30,
    "days_taken": 15,
    "days_sold": 0,
    "start_date": "2026-02-01",
    "end_date": "2026-02-15",
    "return_date": "2026-02-16",
    "vacation_pay": 5500,
    "vacation_bonus": 1833.33,
    "sold_days_pay": 0,
    "total_pay": 7333.33,
    "status": "scheduled",
    "observations": "Teste"
}

print("Testando POST /api/vacations")
print(f"URL: {BASE_URL}/vacations")
print(f"Body: {json.dumps(test_data, indent=2)}")
print("-" * 50)

try:
    response = requests.post(f"{BASE_URL}/vacations", json=test_data, timeout=10)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
    print(f"JSON: {json.dumps(response.json(), indent=2)}")
except Exception as e:
    print(f"Erro: {e}")

# Teste de GET
print("\n" + "=" * 50)
print("Testando GET /api/vacations")
print("-" * 50)

try:
    response = requests.get(f"{BASE_URL}/vacations", timeout=10)
    print(f"Status Code: {response.status_code}")
    print(f"JSON: {json.dumps(response.json(), indent=2)}")
except Exception as e:
    print(f"Erro: {e}")
