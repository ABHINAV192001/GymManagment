@echo off
set PGPASSWORD=1234
set PAGER=
echo Searching for wocovi5860@alexida.com in ALL tables:
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -h localhost -U postgres -d gymmanagment -Atc "SELECT 'users', email FROM users WHERE email ILIKE 'wocovi5860%%' UNION ALL SELECT 'premium_users', email FROM premium_users WHERE email ILIKE 'wocovi5860%%' UNION ALL SELECT 'trainers', email FROM trainers WHERE email ILIKE 'wocovi5860%%' UNION ALL SELECT 'staffs', email FROM staffs WHERE email ILIKE 'wocovi5860%%' UNION ALL SELECT 'admins', email FROM admins WHERE email ILIKE 'wocovi5860%%' UNION ALL SELECT 'organizations', owner_email FROM organizations WHERE owner_email ILIKE 'wocovi5860%%';"
