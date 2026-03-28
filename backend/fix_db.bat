@echo off
set PGPASSWORD=1234
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -h localhost -U postgres -d gymmanagment -c "DELETE FROM food WHERE food_name IS NULL;"
