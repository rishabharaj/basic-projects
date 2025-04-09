@echo off
echo Viewing Database Contents...
echo.
sqlite3 instance/site.db ".tables"
echo.
echo === User Table Structure ===
sqlite3 instance/site.db ".schema user"
echo.
echo === Users in Database ===
sqlite3 instance/site.db "SELECT id, username, email FROM user;"
echo.
echo === Features Table Structure ===
sqlite3 instance/site.db ".schema feature"
echo.
echo === Features in Database ===
sqlite3 instance/site.db "SELECT * FROM feature;"
echo.
pause 