$data = @{
    employee_id = "1768620904508"
    employee_name = "Angelina Ferreira"
    start_date = "2026-02-01"
    end_date = "2026-02-15"
    days_entitled = 30
    vacation_pay = 5500
    status = "scheduled"
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri 'http://localhost:3000/api/vacations' `
  -Method POST `
  -Headers @{'Content-Type'='application/json'} `
  -Body $data

Write-Host "Status: $($response.StatusCode)"
Write-Host "Response:"
$response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
