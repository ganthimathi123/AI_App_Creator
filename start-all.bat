@echo off
echo ==============================================
echo Config-Driven AI App Generator - Startup Script
echo ==============================================

echo [1/3] Starting backend database migrations and server...
cd backend
start cmd /k "npx prisma generate && npx prisma db push && npm run dev"

echo [2/3] Waiting for backend to initialize (5 seconds)...
timeout /t 5 /nobreak >nul

echo [3/3] Starting frontend development server...
cd ../frontend
start cmd /k "npm run dev"

echo ==============================================
echo All services started!
echo Backend: http://localhost:5000
echo Frontend: http://localhost:5173
echo ==============================================
cd ..
