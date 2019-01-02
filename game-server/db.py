import os
import sqlite3
import datetime
import time
import json

#Default path to connect to the database.  This will first create the .db if it does not exist.
DEFAULT_PATH = os.path.join(os.path.dirname(__file__), '..', 'log.db')
conn = None

def connect(db_path=DEFAULT_PATH):
	global conn, cur
	conn = sqlite3.connect(db_path)
	create()

#Creates the logging table
def create():
	conn.execute("""CREATE TABLE IF NOT EXISTS logging (
				LoggingId INTEGER PRIMARY KEY,
				DateTime TEXT,
				Source TEXT,
				Event TEXT,
				Arguments TEXT)""")

#Insert log into logging table
def log(source, event, args = {}, argStr = None):
	if conn == None:
		connect()

	#Using unix time and date for timestamp
	unix = int(time.time())
	date = str(datetime.datetime.fromtimestamp(unix).strftime('%Y-%m-%d %H:%M:%S'))
	
	#Convert json to string
	if argStr == None:
		argStr = json.dumps(args)

	conn.execute("""INSERT INTO logging (DateTime, Source, Event, Arguments)
			VALUES 
				(?, ?, ?, ?)""",
				(date, source, event, argStr))
	conn.commit()

#Fetch and returns all logs in logging table
def print_logs():
	if conn == None:
		connect()

	c = conn.execute("SELECT * FROM logging")
	data = c.fetchall()
	
	return data