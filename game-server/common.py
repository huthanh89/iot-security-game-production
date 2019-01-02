# a team of multiple players, each team has a score
class Team():
	def __init__(self, name):
		self.name = name
		self.players = []
		self.score = 0

	def assign(self, player):
		self.players.append(player)
		player.team = self

	def toJSON(self):
		data = {
			"name": self.name,
			"score": self.score,
			"players": []
		}
		for p in self.players:
			data["players"].append(p.toJSON());
		return data

# a player belongs to a team, uses IP address to identify
# has a view (student dashboard) websocket, kali ws, and device (pi)
class Player():
	def __init__(self, ip, name):
		self.id = ip
		self.name = name
		self.team = None
		self.score = 0
		self.data = {}
		self.ip = ip
		self.vlan = 0
		self.viewWs = None
		self.kaliWs = None
		self.device = None

	def toJSON(self):
		return {
			"id": self.id,
			"ip": self.ip,
			"name": self.name,
			"team": self.team.name if self.team else "none",
			"score": self.score,
			# "data": self.data,
			"viewOnline": self.viewWs != None,
			"kaliOnline": self.kaliWs != None,
			"kaliIp": self.kaliWs.ip if self.kaliWs != None else "",
			"pi": self.device.toJSON() if self.device else {}
		}

# a pi device identified by IP
# can belong to a player and used by multiple missions
class Device():
	def __init__(self, ip, id):
		self.id = id
		self.name = id
		self.ip = ip
		self.player = None
		self.ws = None
		self.missions = []
	
	def toJSON(self):
		return {
			"id": self.id,
			"name": self.name,
			"ip": self.ip,
			"player": self.player.name if self.player else None,
			"online": self.ws != None
		}
