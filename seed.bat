@echo off
echo Seeding database...
docker-compose exec api-server npm run seed
pause
