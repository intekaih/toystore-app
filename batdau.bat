@echo off
echo === STARTING BACKEND ===
start cmd /k "cd /d E:\Hoc Tap\toystore-app\backend && npm run dev"

echo === STARTING FRONTEND ===
start cmd /k "cd /d E:\Hoc Tap\toystore-app\frontend && npm start"

echo === ALL STARTED ===
