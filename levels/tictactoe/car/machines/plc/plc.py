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

# python plc.py 80 8888 game-server.local 80
port = sys.argv[1]
plcPort = sys.argv[2]
gameServerAddress = sys.argv[3]
gameServerPort = sys.argv[4]

controlPath = "/control/plc"

class RootHandler(tornado.web.RequestHandler):
	def get(self):
		url = "http://" + gameServerAddress + ":" + str(gameServerPort) + \
			controlPath + "?event=http&src=" + self.request.remote_ip + \
			"&arg=1"

		print("request", url)
		print("reply", requests.get(url = url).text)

		with open("html/index.html", 'rb') as f:
			data = f.read()
			self.write(data)
		self.finish()

root = os.path.dirname(os.path.abspath(inspect.getfile(inspect.currentframe())))
index = "index.html"
		
settings = {
	"static_hash_cache": False
}

application = tornado.web.Application([
	(r"/", RootHandler),
	(r"/(.*)", tornado.web.StaticFileHandler, {"path": root + "/html", "default_filename": index})
], **settings)

httpServer = application.listen(port)
print("started on port: " + str(port))

try:
	tornado.ioloop.IOLoop.current().start()
except:
	print("\nserver stopped.")
	