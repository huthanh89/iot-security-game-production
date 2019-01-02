from common import *
import json
import shutil
import db

# data structure for mission
class Mission():
	def __init__(self, model):
		self.model = model
		self.id = model["id"]
		self.name = model["name"]
		self.fsm = model["states"]
		self.unlocked = False
		self.player = None
		self.progress = 0   # not used now
		self.done = False
		self.state = None
		self.device = None
		self.stateHistory = []
		self.unlockedFiles = {}
		self.quizAnswers = {}
		self.pointsEarned = 0
		self.quizCount = 0
		self.quizCorrectCount = 0

		self.deviceDns = ""
		self.model["completedCount"] = 0
		# self.model["useCount"] = self.model["useCount"] + 1
		# self.deviceDns = self.model["machines"][0]["name"]
		# if self.model["useCount"] == 1:
		# 	for machine in self.model["machines"]:
		# 		if "files" in machine:
		# 			for file, dir in machine["files"].items():
		# 				if file.endswith(".zip") and not dir.endswith(".zip"):
		# 					print("zipping...", shutil.make_archive(
		# 						self.model["dir"] + "/machines/" + file[:-4],
		# 						'zip', self.model["dir"] + "/" + dir))
		# 					machine["files"][file] = dir + ".zip"
		# else:
		# 	self.deviceDns = self.deviceDns + str(self.model["useCount"])

	def toJSON(self):
		return {
			"id": self.id,
			"name": self.name,
			"description": self.model["description"],
			"unlocked": self.unlocked,
			"team": self.player.team.name if self.player else None,
			"playerId": self.player.id if self.player else None,
			"playerName": self.player.name if self.player else None,
			"state": self.state["name"] if self.state else None,
			"progress": self.progress,
			"done": self.done,
			"quizCorrectCount": self.quizCorrectCount,
			"pointsEarned": self.pointsEarned
		}

	def sendStateDataToPlayer(self, player=None):
		if player == None:
			player = self.player
		if player == None or player.viewWs == None:
			return

		with open(self.model["dir"] + "/" + self.state["text"], "r") as f:
			text = f.read()

		# replace all these tags in the html file
		text = text.replace("[[device]]", self.deviceDns
			).replace("[[studentPiIP]]", self.player.device.ip if self.player.device else "[[YourPiIP]]"
			).replace("[[mission]]", self.name
			).replace("[[quizCount]]", str(self.quizCount)
			).replace("[[quizCorrectCount]]", str(self.quizCorrectCount)
			).replace("[[score]]", str(self.pointsEarned)
			).replace("[[completedBy]]", self.player.name
			).replace("[[disableAnswers]]", "true" if self.player != player else "false"
			).replace("[[otherPlayerInProgress]]", (self.player.name + " is working on it.") if self.player != player else ""
			)

		# if the instructor dashboard enabled "cheat" flag
		if Rings.showAnswers:
			text = text.replace("[[answers]]", json.dumps(self.state["events"]))
		else:
			text = text.replace("[[answers]]", "")

		missionTools = self.model["tools"] if "tools" in self.model else []
		stateTools = self.state["tools"] if "tools" in self.state else []
		tools = missionTools + stateTools
		
		try:
			player.viewWs.write_message(json.dumps({
				"missionId": self.id,
				"type": "stateData",
				"text": text,
				"tools": tools
			}))
		except:
			pass

# a team's game data with the current ring, and all mission data
class TeamGameData():
	def __init__(self, model, team):
		self.model = model
		self.team = team
		self.currentRing = 0
		self.progress = 0
		self.done = False
		self.missions = {}
		self.levels = []

		# create all the missions from the model
		for index, ring in enumerate(model["missions"]):
			level = {}
			for missionId in ring:
				missionModel = ring[missionId]
				missionModel["level"] = index
				mission = Mission(missionModel)
				self.missions[missionId] = mission
				level[missionId] = mission
			self.levels.append(level)

		self.missions["0"].unlocked = True

	def toJSON(self):
		missionData = {}
		for id, mission in self.missions.items():
			missionData[id] = mission.toJSON()
		return {
			"team": self.team.name,
			"currentRing": self.currentRing,
			"progress": self.progress,
			"done": self.done,
			"score": self.team.score,
			"missions": missionData
		}

# Rings game class
class Rings():
	showAnswers = False

	def __init__(self, teams, players, devices):
		self.teams = teams
		self.players = players
		self.devices = devices
		self.teamData = {}
	
	def setup(self, level, teamConfig, otherConfig, sendGameStateToAll):
		self.level = level
		Rings.showAnswers = otherConfig["cheat"]
		self.sendGameStateToAll = sendGameStateToAll

		# assign all teams
		for index, config in enumerate(teamConfig):
			team = Team(config["name"])
			self.teams.append(team)
			self.teamData[team] = TeamGameData(level, team)
			for playerId in config["players"]:
				team.assign(self.players[playerId])

	def toJSON(self):
		data = {}
		for team, teamData in self.teamData.items():
			data[team.name] = teamData.toJSON()
		return data

	# when player starts or opens a mission that has already started or done
	def takeMission(self, player, missionId):
		teamData = self.teamData[player.team]
		mission = teamData.missions[missionId]
		db.log(player.name, "take_mission", mission.toJSON())

		# if the mission is already started by another player, just send state data
		if mission.player != None:
			mission.sendStateDataToPlayer(player)
			return False

		try:
			# don't allow multiple missions by the same player at the same time
			if "mission" in player.data:
				if player.data["mission"] == mission:
					mission.sendStateDataToPlayer(player)
					return False
				elif player.data["mission"] != None:
					player.viewWs.write_message(json.dumps({
						"type": "error",
						"msg": "Cannot work on multiple missions at the same time."
					}))
					return False
			if mission.player != None:
				player.viewWs.write_message(json.dumps({
					"type": "error",
					"msg": "Mission is taken."
				}))
				return False
			if not mission.unlocked or teamData.currentRing != mission.model["level"]:
				player.viewWs.write_message(json.dumps({
					"type": "error",
					"msg": "Mission is locked."
				}))
				return False
		except:
			pass

		player.data["mission"] = mission
		mission.player = player
		self.gotoState(mission, "start")
		return True

	# transition the state in the FSM
	def gotoState(self, mission, state):
		player = mission.player
		team = player.team
		mission.state = mission.fsm[state]
		mission.state["name"] = state
		mission.stateHistory.append(mission.state)

		db.log("game", "mission_state_changed", mission.toJSON())

		# unlock all files in that state
		if "files" in mission.state:
			for file, path in mission.state["files"].items():
				mission.unlockedFiles[file] = path

		# increment scores
		player.score += mission.state["points"]
		team.score += mission.state["points"]

		# if end state
		if state == "end":
			mission.done = True
			mission.progress = 100
			player.data["mission"] = None

			# unlock all next mission if it's within the current ring
			teamData = self.teamData[team]
			for nextMissionId in mission.model["next"]:
				if nextMissionId in teamData.missions:
					nextMission = teamData.missions[nextMissionId]
					if nextMission.model["level"] == teamData.currentRing:
						nextMission.unlocked = True

			# scoring
			maxScore = mission.model["points"]
			
			# find out how many other teams have completed first
			# first team gets 100%, second gets 75%, then 50%, then 30%
			completedCount = mission.model["completedCount"] + 1
			mission.model["completedCount"] = completedCount
			if completedCount == 1:
				x = 1
			elif completedCount == 2:
				x = 0.75
			elif completedCount == 3:
				x = 0.5
			else:
				x = 0.3
			
			# check quiz answers
			quizCorrectCount = 0
			quizCount = 0
			for stateName, quizAnswers in mission.quizAnswers.items():
				state = mission.model["states"][stateName]
				quizModel = state["events"]["quiz"]["answers"]
				if len(quizModel) != len(quizAnswers):
					print('bad length for quiz answers')
					continue
				for i, correctAnswer in enumerate(quizModel):
					quizCount += 1
					if type(correctAnswer) is str:
						if correctAnswer == "__feedback__":
							quizCount -= 1
						elif correctAnswer == quizAnswers[i]:
							quizCorrectCount += 1
					elif type(quizAnswers[i]) == list and sorted(quizAnswers[i]) == correctAnswer:
						quizCorrectCount += 1
			
			# scoring formula
			y = 1 + quizCorrectCount / quizCount
			score = maxScore * x * y / 2
			player.score += score
			team.score += score

			mission.quizCount = quizCount
			mission.quizCorrectCount = quizCorrectCount
			mission.pointsEarned = score

			db.log("game", "mission_completed", mission.toJSON())
	
			# check if the current ring/level is done
			levelDone = True
			missionDoneCount = 0
			for m in teamData.levels[teamData.currentRing].values():
				if m.done:
					missionDoneCount += 1
				else:
					levelDone = False

			# calculate progress of the team to be displayed in instructor dashboard
			teamData.progress = teamData.currentRing + missionDoneCount / len(teamData.levels[teamData.currentRing])


			if levelDone:
				# unlock all starting missions in the next ring
				for m in teamData.levels[teamData.currentRing].values():
					for nextMissionId in m.model["next"]:
						if nextMissionId in teamData.missions:
							nextMission = teamData.missions[nextMissionId]
							nextMission.unlocked = True

				teamData.currentRing += 1

				db.log("game", "level_completed", teamData.toJSON())

				# game end condition
				if teamData.currentRing >= len(teamData.levels):
					teamData.done = True
					for player in teamData.team.players:
						if player.viewWs:
							try:
								player.viewWs.write_message(json.dumps({
									"type": "levelsCompleted"
								}))
							except:
								pass

		#TODO tell device to execute script

		mission.sendStateDataToPlayer()
		self.sendGameStateToAll()

	# for rings game, pi devices don't send events
	def deviceEvent(self, device, event, args):
		pass
		# for mission in self.grid:
		# 	if mission.device == device and mission.state:
		# 		if event in mission.state["events"]:
		# 			self.gotoState(mission, mission.state["events"][event])
	
	# student dashboard sends these events
	# for submitting flag and quiz
	def viewEvent(self, player, event, args):
		mission = player.data["mission"]
		if mission and mission.state:
			if event in mission.state["events"]:
				if event == "flag":
					if args in mission.state["events"][event]:
						db.log(player.name, "correct_flag_submitted", {"mission": mission.id, "flag": args})
						self.gotoState(mission, mission.state["events"][event][args])
					else:
						db.log(player.name, "incorrect_flag_submitted", {"mission": mission.id, "flag": args})
						try:
							player.viewWs.write_message(json.dumps({
								"type": "incorrectFlag"
							}))
						except:
							pass
				elif event == "quiz":
					db.log(player.name, "quiz_submitted", {"mission": mission.id, "answers": args})
					answers = mission.state["events"][event]["answers"]
					nextState = mission.state["events"][event]["nextState"]
					mission.quizAnswers[mission.state["name"]] = args
					self.gotoState(mission, nextState)
	
	# get files for player or pi based on whether it was unlocked
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
		
	# for rings game, not using domain names for pi devices
	def getDNames(self):
		data = {}
		# for mission in self.grid:
		# 	if mission.device:
		# 		data[mission.deviceDns] = mission.device.ip
		return data