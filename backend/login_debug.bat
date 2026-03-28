@echo off
curl.exe -v -X POST "http://localhost:8080/api/auth/login" -H "Content-Type: application/json" -d @login_test.json
