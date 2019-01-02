from common import *
import json
import shutil

class Mission():
	def __init__(self, model):
		self.model = model
		self.name = model["name"]
		self.fsm = model["states"]
		self.player = None
		self.progress = 0
		self.done = False
		self.state = None
		self.device = None
		self.stateHistory = []
		self.unlockedFiles = {}
		self.quizAnswers = {}

		self.model["useCount"] = self.model["useCount"] + 1
		self.deviceDns = self.model["machines"][0]["name"]
		if self.model["useCount"] == 1:
			for machine in self.model["machines"]:
				if "files" in machine:
					for file, dir in machine["files"].items():
						if file.endswith(".zip") and not dir.endswith(".zip"):
							print("zipping...", shutil.make_archive(
								self.model["dir"] + "/machines/" + file[:-4],
								'zip', self.model["dir"] + "/" + dir))
							machine["files"][file] = dir + ".zip"
		else:
			self.deviceDns = self.deviceDns + str(self.model["useCount"])

	def toJSON(self):
		return {
			"name": self.name,
			"description": self.model["description"],
			"team": self.player.team.name if self.player else "null",
			"playerId": self.player.id if self.player else "null",
			"playerName": self.player.name if self.player else "null",
			"progress": self.progress,
			"done": self.done
		}

	def sendStateDataToPlayer(self):
		if self.player == None or self.player.viewWs == None:
			return

		with open(self.model["dir"] + "/" + self.state["text"], "r") as f:
			text = f.read()
		text = text.replace("[[device]]", self.deviceDns).replace("[[mission]]", self.name)
		tools = self.state["tools"]
		
		self.player.viewWs.write_message(json.dumps({
			"type": "stateData",
			"text": text,
			"tools": tools
		}))

class TicTacToe():
	def __init__(self, teams, players, devices):
		self.teams = teams
		self.team1 = Team("Team O")
		self.team2 = Team("Team X")
		teams.append(self.team1)
		teams.append(self.team2)

		self.players = players
		self.devices = devices
		self.grid = []
	
	def setup(self, level, teamConfig, gridConfig, sendGameStateToAll):
		self.level = level
		self.sendGameStateToAll = sendGameStateToAll

		for index, config in enumerate(teamConfig):
			team = self.teams[index]
			for playerId in config:
				team.assign(self.players[playerId])

		for m in self.level["missions"]:
			m["useCount"] = 0

		for index, config in enumerate(gridConfig):
			missionModel = self.findMissionModel(config["mission"])
			mission = Mission(missionModel)

			if config["device"] != "null":
				device = self.devices[config["device"]]
				mission.device = device
				device.missions.append(mission)
				if "setup" in missionModel["machines"][0]:
					try:
						with open(missionModel["dir"] + "/" + missionModel["machines"][0]["setup"], "r") as f:
							script = f.read()
						device.ws.write_message(json.dumps({
							"type": "script",
							"id": 0,
							"script": script
						}))
					except:
						pass
				if "cleanup" in missionModel["machines"][0]:
					try:
						with open(missionModel["dir"] + "/" + missionModel["machines"][0]["cleanup"], "r") as f:
							script = f.read()
						device.ws.write_message(json.dumps({
							"type": "cleanupScript",
							"id": 0,
							"script": script
						}))
					except:
						pass
			self.grid.append(mission)

			if config["player"] != "null":
				player = self.players[config["player"]]
				self.takeMission(player, index)

	def toJSON(self):
		data = []
		for mission in self.grid:
			data.append(mission.toJSON())
		return data

	def findMissionModel(self, name):
		for m in self.level["missions"]:
			if m["name"] == name:
				return m
		return None

	def takeMission(self, player, index):
		mission = self.grid[index]
		if ("mission" in player.data and player.data["mission"] != None) or mission.player != None:
			return False

		player.data["mission"] = mission
		mission.player = player
		self.gotoState(mission, "start")
		return True

	def gotoState(self, mission, state):
		mission.state = mission.fsm[state]
		mission.state["name"] = state
		mission.stateHistory.append(mission.state)

		if "files" in mission.state:
			for file, path in mission.state["files"].items():
				mission.unlockedFiles[file] = path

		mission.player.score += mission.state["points"]
		mission.player.team.score += mission.state["points"]
		if state == "end":
			mission.done = True
			mission.progress = 100
			mission.player.data["mission"] = None

		#TODO tell device to execute script

		mission.sendStateDataToPlayer()
		self.sendGameStateToAll()

	def deviceEvent(self, device, event, args):
		for mission in self.grid:
			if mission.device == device and mission.state:
				if event in mission.state["events"]:
					self.gotoState(mission, mission.state["events"][event])
	
	def viewEvent(self, player, event, args):
		for mission in self.grid:
			if mission.player == player and mission.state:
				if event in mission.state["events"]:
					if event == "flag":
						if args in mission.state["events"][event]:
							self.gotoState(mission, mission.state["events"][event][args])
						else:
							mission.player.viewWs.write_message(json.dumps({
								"type": "incorrectFlag"
							}))
					elif event == "quiz":
						answers = mission.state["events"][event]["answers"]
						nextState = mission.state["events"][event]["nextState"]
						mission.quizAnswers[mission.state["name"]] = args
						self.gotoState(mission, nextState)
	
	def getFile(self, player, device, machineName, missionName, file):
		print(player, device, machineName, missionName, file)
		if player:
			if "mission" in player.data and player.data["mission"] != None:
				mission = player.data["mission"]
				if mission.name == missionName and file in mission.unlockedFiles:
					return mission.model["dir"] + "/" + mission.unlockedFiles[file]
		elif device:
			for mission in device.missions:
				print('mission', mission.name)
				if mission.name == missionName:
					for machine in mission.model["machines"]:
						print(machine)
						if machine["name"] == machineName and file in machine["files"]:
							return mission.model["dir"] + "/" + machine["files"][file]
							
		return None
		
	def getDNames(self):
		data = {}
		for mission in self.grid:
			if mission.device:
				data[mission.deviceDns] = mission.device.ip
		return data