from tornado.ioloop import IOLoop, PeriodicCallback
from tornado import gen
from tornado.websocket import websocket_connect
import os, sys
import json
import serial

# python client.py player1 game-server.local 8080
user = "player1"
gameServerAddress = sys.argv[1]
gameServerPort = sys.argv[2]
url = "ws://" + gameServerAddress + ":" + str(gameServerPort) + "/control/attacker"

TOOLS = {
	"pyobd": ["/srv/pl-app/lib/python3.5/pyobd.py", "/srv/pl-app/lib/python3.5/.pyobd.py"],
}

ser = serial.Serial(
	port = '/dev/serial0',
	parity = serial.PARITY_NONE,
	stopbits = serial.STOPBITS_ONE,
	baudrate = 115200,
	bytesize = serial.EIGHTBITS,
	timeout = 0
)

def lock(tools):
	print("lock", tools)
	for tool in tools:
		t = TOOLS[tool]
		cmd = "/bin/mv " + t[0] + " " + t[1]
		os.system(cmd)

def unlock(tools):
	print("unlock", tools)
	for tool in tools:
		t = TOOLS[tool]
		cmd = "/bin/mv " + t[1] + " " + t[0]
		os.system(cmd)

def serialSend():
	ser.write("ping\n".encode())


class Client(object):
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
		print("trying to connect")
		try:
			self.ws = yield websocket_connect(self.url)
		except Exception as e:
			print("connection error")
		else:
			print("connected")
			self.run()

	@gen.coroutine
	def run(self):
		msg = json.dumps({"type": "login", "user": user})
		print("sending", msg)
		self.ws.write_message(msg)

		while True:
			msg = yield self.ws.read_message()
			if msg is None:
				print("connection closed")
				self.ws = None
				break
			try:
				msg = json.loads(msg)
				if msg["type"] == "lock":
					tools = msg["tools"]
					lock(tools)
				elif msg["type"] == "unlock":
					tools = msg["tools"]
					unlock(tools)
			except Exception as e:
				print("msg error: " + str(e))

	def keep_alive(self):
		if self.ws is None:
			self.connect()
		else:
			self.ws.write_message("keep alive")

if __name__ == "__main__":
	client = Client(url, 5)

	PeriodicCallback(serialSend, 2000, io_loop=IOLoop.instance()).start()

	try:
		IOLoop.instance().start()
	except:
		unlock(TOOLS.keys())
