import tornado.ioloop
import tornado.web
import tornado.websocket
import tornado.template
import tornado.httpserver
import os, sys, inspect, time
import json
import requests

# python hospital.py 8080 game-server.local 8080
port = sys.argv[1]
gameServerAddress = sys.argv[2]
gameServerPort = sys.argv[3]

controlPath = "/control/hospital"
loginUser = "technician1"
loginPassword = "secretpass"

class LoginHandler(tornado.web.RequestHandler):
	def get(self):
		user = self.get_argument("user")
		password = self.get_argument("password")
		print(self.__class__.__name__, user, password)

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

try:
	tornado.ioloop.IOLoop.current().start()
except:
	print("\nserver stopped.")
	