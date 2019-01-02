import threading
import tornado.ioloop
import tornado.web
import tornado.websocket
import tornado.template
import tornado.httpserver
import os, sys, inspect, time
import json
from datetime import datetime
from collections import namedtuple

# python server.py 8080
port = sys.argv[1]

class Player():
	def __init__(self, name, mission, score, rank, ws, kaliws):
		self.name = name
		self.mission = mission
		self.score = score
		self.rank = rank
		self.ws = ws
		self.kaliws = ws

p1 = Player("player1", "1", 0, 1, None, None)
# p2 = Player("player2", 1, 0, 1, None, None)

players = {
	p1.name: p1,
	# p2.name: p2
}

viewers = []

class PlayerHandler(tornado.websocket.WebSocketHandler):
	def open(self):
		print("player connected")
		self.player = None
		viewers.append(self)
		sendScores()
	def on_close(self):
		print("player disconnected")
		if self.player:
			self.player.ws = None
		viewers.remove(self)
	def on_message(self, message):
		print("player received: ", self.player.name if self.player else 'no player', message)
		try:
			msg = json.loads(message)
			if msg["type"] == "login":
				name = msg["user"]
				if name not in players:
					self.write_message(json.dumps({"type":"login", "result":"No player."}))
					return
				player = players[name]
				player.ws = self
				self.write_message(json.dumps({"type":"login", "result":"ok"}))
				sendPlayerState(player)
				sendScores()
		except Exception as e:
			print("player msg error: " + str(e))

def sendPlayerState(player):
	if player.ws != None:
		msg = json.dumps({
			"type": "mission",
			"level": player.mission
		})
		print('sendPlayerState', player.name, msg)
		player.ws.write_message(msg)

def updatePlayerState(player, mission):
	if player.mission > mission:
		mission = player.mission

	player.mission = mission
	
	if player == p1:
		if mission == "2a":
			player.score = 10
		elif mission == "3a":
			player.score = 60
			sendKali(p1, {"type":"unlock", "tools":["pyobd"]})
		elif mission == "2b":
			player.score = 10
		elif mission == "3b":
			player.score = 60
		elif mission == "4":
			player.score = 100
	# else:
	# 	if mission == 2:
	# 		player.score = 10
	# 		sendKali(p2, {"type":"unlock", "tools":["nmap"]})
	# 	elif mission == 3:
	# 		player.score = 50
	# 		sendKali(p2, {"type":"unlock", "tools":["wireshark", "httpserver"]})
	# 	elif mission == 4:
	# 		player.score = 100

	print('updatePlayerState', player.name, mission, player.score)

	sendScores()
	sendPlayerState(player)

	if player.score == 100:
		sendEndGame(player)

def sendScores():
	# list = None
	# if p1.score >= p2.score:
	# 	list = [p1, p2]
	# else:
	# 	list = [p2, p1]
	list = [p1]
	output = []
	for i in range(0, len(list)):
		p = list[i]
		output.append({
			"rank": i+1,
			"name": p.name,
			"score": p.score
		})
	
	for i in range(len(output) + 1, 11):
		output.append({
			"rank": i,
			"name": "player" + str(i),
			"score": 0
		})

	output = json.dumps({"type":"scores", "scores":output})

	# for player in players.values():
	# 	if player.ws != None:
	# 		player.ws.write_message(output)

	for viewer in viewers:
		try:
			viewer.write_message(output)
		except:
			pass


def sendEndGame(winner):
	output = json.dumps({"type":"endgame", "winner":winner.name})
	print('sendEndGame', output)
	for player in players.values():
		if player.ws != None:
			try:
				player.ws.write_message(output)
			except:
				pass

def sendKali(player, event):
	if player.kaliws != None:
		msg = json.dumps(event)
		print('sendKali', player.name, msg)
		player.kaliws.write_message(msg)

class CarCloudHandler(tornado.web.RequestHandler):
	def get(self):
		event = self.get_argument('event')
		arg = self.get_argument('arg')
		src = self.get_argument('src')
		print(self.__class__.__name__, event, arg, src)

		if event == "login" and arg == "failed":
			updatePlayerState(p1, "2a")
		elif event == "devtools":
			updatePlayerState(p1, "2b")
		elif event == "debug":
			updatePlayerState(p1, "3b")
		self.write("ok")

class CarHandler(tornado.web.RequestHandler):
	def get(self):
		event = self.get_argument('event')
		arg = self.get_argument('arg')
		src = self.get_argument('src')
		print(self.__class__.__name__, event, arg, src)

		if event == "attacker_connected":
			updatePlayerState(p1, "3a")
		elif event == "turn_off":
			updatePlayerState(p1, "4")
		self.write("ok")

class KaliHandler(tornado.websocket.WebSocketHandler):
	def open(self):
		print("kali connected")
		self.player = None
	def on_close(self):
		print("kali disconnected")
		if self.player:
			self.player.kaliws = None
	def on_message(self, message):
		print("kali received: ", self.player.name if self.player else 'no player', message)
		try:
			msg = json.loads(message)
			if msg["type"] == "login":
				name = msg["user"]
				if name not in players:
					self.write_message(json.dumps({"type":"login", "result":"No player."}))
					return
				player = players[name]
				player.kaliws = self
				if player.mission == "1":
					self.write_message(json.dumps({
						"type":"lock",
						"tools":["pyobd"]
					}))
		except Exception as e:
			print("kali msg error: " + str(e))

root = os.path.dirname(os.path.abspath(inspect.getfile(inspect.currentframe())))
index = "index.html"
		
settings = {
	"static_hash_cache": False
}

application = tornado.web.Application([
	(r"/player", PlayerHandler),
#	(r"/viewer", ViewerHandler),

	(r"/control/carcloud", CarCloudHandler),
	(r"/control/car", CarHandler),
	(r"/control/attacker", KaliHandler),

#	(r"/game/(.*)", tornado.web.StaticFileHandler, {"path": root, "default_filename": index}),
	(r'/(.*)', tornado.web.StaticFileHandler, {'path': root + '/html', "default_filename": index})
], **settings)

httpServer = application.listen(port)
print("started on port: " + str(port))

try:
	tornado.ioloop.IOLoop.current().start()
except:
	print("\nserver stopped.")
	