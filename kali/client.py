from tornado.ioloop import IOLoop, PeriodicCallback
from tornado import gen
from tornado.websocket import websocket_connect
from tornado.queues import Queue
import os, sys
import json
import socket
import subprocess
import random
import traceback
# from procbridge import procbridge

# python client.py gc 80 1.1.1.1
gameServerAddress = sys.argv[1] if len(sys.argv) > 1 else "gc"
gameServerPort = sys.argv[2] if len(sys.argv) > 2 else "80"
ip = sys.argv[3] if len(sys.argv) > 3 else ""
url = "ws://" + gameServerAddress + ":" + str(gameServerPort) + "/kali"

procBridgePort = 34567

class Client(object):
	def __init__(self, url):
		self.url = url
		self.ioloop = IOLoop.instance()
		self.ws = None
		self.connect()
		self.cleanupScript = None
		
		# start proc bridge server
		self.events = []
		# ipc = procbridge.ProcBridgeServer("127.0.0.1", procBridgePort, self.request_handler)
		# ipc.start()
		# PeriodicCallback(self.send_events, 1000).start()
		# self.ioloop.spawn_callback(self.send_events)

		#PeriodicCallback(self.keep_alive, 20000, io_loop=self.ioloop).start()
		try:
			self.ioloop.start()
		except:
			# ipc.stop()
			if self.cleanupScript:
				self.run_script(self.cleanupScript)

	# @gen.coroutine
	def request_handler(self:id, event:str, args:dict) -> dict:
		self.events.append({"type": "event", "event": event, "args": args})
		# yield self.events.put({"type": "event", "event": event, "args": args})
		return {'result': 'ok'}
	
	# @gen.coroutine
	def send_events(self):
		while len(self.events) > 0:
			self.ws.write_message(json.dumps(self.events.pop(0)))

	@gen.coroutine
	def connect(self):
		print("trying to connect")
		try:
			self.ws = yield websocket_connect(self.url)
		except Exception as e:
			print("connection error")
			self.ioloop.call_later(2, self.connect)
		else:
			print("connected")
			self.run()

	@gen.coroutine
	def run(self):
		msg = json.dumps({"type": "login", "ip": ip})
		self.ws.write_message(msg)

		while True:
			msg = yield self.ws.read_message()
			print("received", msg)

			if msg is None:
				print("connection closed")
				self.ws = None
				self.connect()
				break
			try:
				msg = json.loads(msg)
				if msg["type"] == "keepalive":
					self.ws.write_message(json.dumps(msg))
				elif msg["type"] == "script":
					out, err = self.run_script(msg["script"])
					self.ws.write_message(json.dumps({
						"type": "script_result",
						"id": msg["id"]
						# "output": out,
						# "error": err
					}))
				elif msg["type"] == "cleanupScript":
					self.cleanupScript = msg["script"]
				elif msg["type"] == "cleanup":
					if self.cleanupScript:
						self.run_script(self.cleanupScript)
						self.cleanupScript = None
			except Exception as e:
				print("msg error: " + str(e))
				traceback.print_exc()

	def keep_alive(self):
		if self.ws is None:
			self.connect()
		else:
			self.ws.write_message("keep alive")

	def run_script(self, script):
		print("running script...\n", script)
		scriptFile = "_script" + str(random.randint(0, 999999)) + ".sh"
		with open(scriptFile, 'w') as f:
			f.write(script)	

		out = None
		err = None
		# try:
		# 	p = subprocess.Popen(["bash " + scriptFile + ""],
		# 		stdout=subprocess.PIPE,
		# 		stderr=subprocess.PIPE,
		# 		cwd=os.path.dirname(os.path.realpath(__file__)),
		# 		shell=True)
		# 	# out, err = p.communicate(timeout=5)
		# except:
		# 	pass
		os.system("bash " + scriptFile)

		os.remove(scriptFile)
		print("script output", out)
		print("script error", err)
		return (out, err)

if __name__ == "__main__":
	client = Client(url)
