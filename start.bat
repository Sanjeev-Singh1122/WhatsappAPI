
@echo off

title WhatsApp Web App

echo Installing Packages...
npm install

echo Opening Browser...
start http://localhost:3000

echo Starting Server...
npm start

pause
