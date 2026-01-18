$store = @{
  name = 'ÁREA VERDE'
  code = 'LJ1'
  address = 'RUA JOSÉ FELICIANO'
  city = 'Maranguape'
  state = 'CE'
  manager = ''
  status = 'active'
} | ConvertTo-Json

$resp = Invoke-WebRequest -Uri 'http://localhost:3000/api/stores' -Method POST -Headers @{ 'Content-Type'='application/json' } -Body $store -UseBasicParsing

Write-Host "Status:" $resp.StatusCode
$body = $resp.Content | ConvertFrom-Json
$body | ConvertTo-Json -Depth 5

$resp2 = Invoke-WebRequest -Uri 'http://localhost:3000/api/stores' -UseBasicParsing
Write-Host "Lista de lojas:" (($resp2.Content | ConvertFrom-Json).Length)
