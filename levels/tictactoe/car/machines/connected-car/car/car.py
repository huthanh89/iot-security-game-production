from tornado.ioloop import IOLoop, PeriodicCallback
from tornado import gen
from tornado.websocket import websocket_connect
import requests
import os, sys
import json
import serial
import random
import RPi.GPIO as GPIO

# python car.py game-server.local 8080 car-cloud.local 8080
#user = sys.argv[1]
gameServerAddress = sys.argv[1]
gameServerPort = sys.argv[2]
carCloudAddress = sys.argv[3]
carCloudPort = sys.argv[4]

controlPath = "/control/car"

# gameUrl = "ws://" + gameServerAddress + ":" + str(gameServerPort) + "/control/car"
carCloudUrl = "ws://" + carCloudAddress + ":" + str(carCloudPort) + "/car"

ser = serial.Serial(
	port = '/dev/serial0',
	parity = serial.PARITY_NONE,
	stopbits = serial.STOPBITS_ONE,
	baudrate = 115200,
	bytesize = serial.EIGHTBITS,
	timeout = 0
)

unlockPin = 38
powerPin = 40

GPIO.setmode(GPIO.BOARD)
GPIO.setup(unlockPin, GPIO.OUT, initial=GPIO.HIGH)
GPIO.setup(powerPin, GPIO.OUT, initial=GPIO.HIGH)

# gameClient = None
# carCloudClient = None

# class GameClient(object):
# 	def __init__(self, url, timeout):
# 		self.url = url
# 		self.timeout = timeout
# 		self.ioloop = IOLoop.instance()
# 		self.ws = None
# 		self.connect()
# 		#PeriodicCallback(self.keep_alive, 20000, io_loop=self.ioloop).start()
# 		# try:
# 		# 	self.ioloop.start()
# 		# except:
# 		# 	unlock(TOOLS.keys())

# 	@gen.coroutine
# 	def connect(self):
# 		print "trying to connect to game server"
# 		try:
# 			self.ws = yield websocket_connect(self.url)
# 		except Exception, e:
# 			print "game server connection error"
# 		else:
# 			print "game server connected"
# 			self.run()

# 	@gen.coroutine
# 	def run(self):
# 		msg = json.dumps({"type": "login", "user": user})
# 		print("sending", msg)
# 		self.ws.write_message(msg)

# 		while True:
# 			msg = yield self.ws.read_message()
# 			if msg is None:
# 				print "connection closed"
# 				self.ws = None
# 				break
# 			try:
# 				msg = json.loads(msg)
# 				if msg["type"] == "lock":
# 					tools = msg["tools"]
# 					lock(tools)
# 				elif msg["type"] == "unlock":
# 					tools = msg["tools"]
# 					unlock(tools)
# 			except Exception as e:
# 				print("msg error: " + str(e))

# 	def keep_alive(self):
# 		if self.ws is None:
# 			self.connect()
# 		else:
# 			self.ws.write_message("keep alive")

class CarCloudClient(object):
	def __init__(self, url, timeout):
		self.url = url
		self.timeout = timeout
		self.ioloop = IOLoop.instance()
		self.ws = None
		self.connect()
		#PeriodicCallback(self.keep_alive, 20000, io_loop=self.ioloop).start()
		# try:
		# 	self.ioloop.start()
		# except:
		# 	unlock(TOOLS.keys())

	@gen.coroutine
	def connect(self):
		print("trying to connect to car cloud")
		try:
			self.ws = yield websocket_connect(self.url)
		except Exception as e:
			print("car cloud connection error")
		else:
			print("car cloud connected")
			self.run()

	@gen.coroutine
	def run(self):
		while True:
			msg = yield self.ws.read_message()
			if msg is None:
				print("connection closed")
				self.ws = None
				break
			try:
				msg = json.loads(msg)
				if msg["action"] == "unlock":
					unlockCar()
				elif msg["action"] == "turnoff":
					turnOffCar()
			except Exception as e:
				print("msg error: " + str(e))

	def keep_alive(self):
		if self.ws is None:
			self.connect()
		else:
			self.ws.write_message("keep alive")

def attackerConnected():
	url = "http://" + gameServerAddress + ":" + str(gameServerPort) + \
			controlPath + "?event=attacker_connected&src=1&arg=1"
			
	print("request", url)
	print("reply", requests.get(url = url).text)

def unlockCar():
	GPIO.output(unlockPin, GPIO.LOW)
	
	url = "http://" + gameServerAddress + ":" + str(gameServerPort) + \
			controlPath + "?event=unlock&src=1&arg=1"
			
	print("request", url)
	print("reply", requests.get(url = url).text)

def turnOffCar():
	GPIO.output(powerPin, GPIO.LOW)

	url = "http://" + gameServerAddress + ":" + str(gameServerPort) + \
			controlPath + "?event=turn_off&src=1&arg=1"
			
	print("request", url)
	print("reply", requests.get(url = url).text)

def serialSendReceive():
	random_speed = random.randint(10,85)
	random_accel = random.randint(10,85)
	random_brake = random.randint(0, 10)
	random_gear = random.randint(1,6)
	random_x_coord = random.uniform(85, -180)
	random_y_coord = random.uniform(-85, 180)
	
	car_values = "Speed: " + str(random_speed) + " \nAcceleration: " + str(random_accel)+ " \nBrake Pressure: " + str(random_brake) + " \nGear: " + str(random_gear)+ " \nCoordinates: " + str(random_x_coord) + " , " + str(random_y_coord) 
	ser.write(car_values.encode())

	try:
		recv = ser.readline(50)
		if recv and len(recv) > 0:
			data = recv.decode()
			print(data)
			if "ping" in data:
				attackerConnected()
			elif "unlock" in data:
				unlockCar()
			elif "turnoff" in data:
				turnOffCar()
	except:
		pass

if __name__ == "__main__":
	# global gameClient, carCloudClient

	# gameClient = GameClient(gameUrl, 5)
	carCloudClient = CarCloudClient(carCloudUrl, 5)

	PeriodicCallback(serialSendReceive, 2000, io_loop=IOLoop.instance()).start()

	try:
		IOLoop.instance().start()
	except:
		# unlock(TOOLS.keys())
		GPIO.cleanup()
		pass
