@echo off
py -m venv venv 
call venv\Scripts\activate.bat
pip install flask ackinator
python app001.py
pause