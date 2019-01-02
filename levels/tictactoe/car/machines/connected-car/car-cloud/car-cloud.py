import tornado.ioloop
import tornado.web
import tornado.websocket
import tornado.template
import tornado.httpserver
import os, sys, inspect, time
import json
import requests

# python car-cloud.py 8080 game-server.local 8080
port = sys.argv[1]
gameServerAddress = sys.argv[2]
gameServerPort = sys.argv[3]

controlPath = "/control/carcloud"
loginUser = "testuser"
loginPassword = '" or ""="'

car = None

class LoginHandler(tornado.web.RequestHandler):
	def get(self):
		user = self.get_argument("user")
		password = self.get_argument("password")
		devtools = self.get_argument("devtools")
		print(self.__class__.__name__, user, password, devtools)

		if devtools == "true" and user == loginUser:
			url = "http://" + gameServerAddress + ":" + str(gameServerPort) + \
				controlPath + "?event=debug&src=" + self.request.remote_ip + \
				"&arg="
		else:
			url = "http://" + gameServerAddress + ":" + str(gameServerPort) + \
				controlPath + "?event=login&src=" + self.request.remote_ip + \
				"&arg="
			
		response = None
		if user == loginUser and password == loginPassword:
			response = "true"
			url += "success"
		else:
			response = "false"
			url += "failed"

		print("request", url)
		print("reply", requests.get(url = url).text)
		self.write(response)

class DevToolsHandler(tornado.web.RequestHandler):
	def get(self):
		url = "http://" + gameServerAddress + ":" + str(gameServerPort) + \
			controlPath + "?event=devtools&src=" + self.request.remote_ip + \
			"&arg=1"
			
		print("request", url)
		print("reply", requests.get(url = url).text)
		self.write("ok")

class DebugHandler(tornado.web.RequestHandler):
	def get(self):
		url = "http://" + gameServerAddress + ":" + str(gameServerPort) + \
			controlPath + "?event=debug&src=" + self.request.remote_ip + \
			"&arg=1"
			
		print("request", url)
		print("reply", requests.get(url = url).text)
		self.write("ok")

class CarHandler(tornado.websocket.WebSocketHandler):
	def open(self):
		print("car connected")
		global car
		car = self
	def on_close(self):
		print("car disconnected")
		global car
		car = None
	def on_message(self, message):
		print("car received: ", message)
		try:
			msg = json.loads(message)
		except Exception as e:
			print("car msg error: " + str(e))

class UnlockHandler(tornado.web.RequestHandler):
	def get(self):
		if car:
			car.write_message(json.dumps({"action": "unlock"}))
		self.write("ok")

class TurnOffHandler(tornado.web.RequestHandler):
	def get(self):
		if car:
			car.write_message(json.dumps({"action": "turnoff"}))
		self.write("ok")

root = os.path.dirname(os.path.abspath(inspect.getfile(inspect.currentframe())))
index = "index.html"
		
settings = {
	"static_hash_cache": False
}

application = tornado.web.Application([
	(r"/login", LoginHandler),
	(r"/devtools", DevToolsHandler),
	(r"/debug", DebugHandler),
	(r"/unlock", UnlockHandler),
	(r"/turnoff", TurnOffHandler),
	(r"/car", CarHandler),
	(r"/(.*)", tornado.web.StaticFileHandler, {"path": root + "/html", "default_filename": index})
], **settings)

httpServer = application.listen(port)
print("started on port: " + str(port))

try:
	tornado.ioloop.IOLoop.current().start()
except:
	print("\nserver stopped.")
	