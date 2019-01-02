import tornado.ioloop
import tornado.web
import tornado.websocket
import tornado.template
import tornado.httpserver
import threading
import os, sys, inspect, time
import json
import requests
import random
import string
import ipc

# python webcam.py 8080 8888 8080
port = sys.argv[1]
debugPort = sys.argv[2]
cloudServerPort = sys.argv[3]

loginUser = "testuser"
loginPassword = "secretiot"

cloudServer = None

class LoginHandler(tornado.web.RequestHandler):
	def get(self):
		user = self.get_argument("user")
		password = self.get_argument("password")
		print(self.__class__.__name__, user, password)

		# url = "http://" + gameServerAddress + ":" + str(gameServerPort) + \
		# 	controlPath + "?event=login&src=" + self.request.remote_ip + \
		# 	"&arg="
			
		response = None
		if user == loginUser and password == loginPassword:
			response = "true"
			event = "successful_login"
		else:
			response = "false"
			event = "failed_login"

		ipc.event(event, {})

		self.write(response)

class InfoHandler(tornado.web.RequestHandler):
	def get(self):
		info = json.dumps({
			"model": "VS4000",
			"status": "online",
			"recording": False,
			"cloud_server": cloudServer if cloudServer else "webcam-cloud.local",
			"time_zone": "PST"
		})
		self.write(info)

class SetCloudServerHandler(tornado.web.RequestHandler):
	#def get(self):
	def post(self):
		global cloudServer
		cloudServer = self.get_argument("address")

		# url = "http://" + gameServerAddress + ":" + str(gameServerPort) + \
		# 	controlPath + "?event=setcloudserver&src=" + self.request.remote_ip + \
		# 	"&arg=1"

		# print("request", url)
		# print("reply", requests.get(url = url).text)

		ipc.event("redirected", {})
		self.write("ok")

class SendUpdateToCloudServer(threading.Thread):
	def __init__(self):
		threading.Thread.__init__(self)
	def run(self):
		while True:
			time.sleep(10)
			if cloudServer == None:
				continue

			url = "http://" + cloudServer + ":" + str(cloudServerPort) + \
				"/status?id=webcam&user=testuser&pass=2a8efe43864acb1a9b104ae29eb4ede7&method=md5&data=" + \
				''.join(random.choice(string.ascii_uppercase + string.digits) for _ in range(10))
				
			print("request", url)
			try:
				print("reply", requests.get(url = url).text)
			except Exception as e:
				print('SendUpdateToCloudServer', e)

SendUpdateToCloudServer().start()

root = os.path.dirname(os.path.abspath(inspect.getfile(inspect.currentframe())))
index = "index.html"
		
settings = {
	"static_hash_cache": False
}

application = tornado.web.Application([
	(r"/login", LoginHandler),
	(r"/(.*)", tornado.web.StaticFileHandler, {"path": root + "/html", "default_filename": index})
], **settings)

httpServer = application.listen(port)
print("started on port: " + str(port))


debugApp = tornado.web.Application([
	(r"/info", InfoHandler),
	(r"/set_cloud_server", SetCloudServerHandler)
], **settings)

debugServer = debugApp.listen(debugPort)
print("started on debug port: " + str(debugPort))

try:
	tornado.ioloop.IOLoop.current().start()
except:
	print("\nserver stopped.")
	