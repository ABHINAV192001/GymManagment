@echo off
set TOKEN=eyJhbGciOiJIUzI1NiJ9.eyJvcmdhbml6YXRpb25JZCI6MSwiYnJhbmNoSWQiOjEsInJvbGUiOiJQUkVNSVVNX1VTRVIiLCJzdWIiOiJUZXN0cHJlbWl1bXVzZXI1MzUwIiwiaWF0IjoxNzY5MTg5NTgyLCJleHAiOjE3NjkyNzU5ODJ9.gWpcaHG9PlVmedqA6BB00j6gI6tsemtBCsUqvf6BI0w
curl.exe -v -X GET "http://localhost:8083/api/user/workout?category=Strength" -H "Authorization: Bearer %TOKEN%"
