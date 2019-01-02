import json
import os

_levels = []

# load all files in the level folder into _levels global var
def loadLevels(dir):
	global _levels
	with open(dir + '/levels.json') as f:
		_levels = json.load(f)
	
	for index, levelDir in enumerate(_levels):
		with open(dir + '/' + levelDir + '/level.json') as f:
			level = json.load(f)
			level["dir"] = os.path.dirname(os.path.abspath(f.name))
			_levels[index] = level

		if level["type"] == "tictactoe":
			for index2, missionDir in enumerate(level["missions"]):
				with open(dir + '/' + levelDir + '/' + missionDir + '/mission.json') as f:
					mission = json.load(f)
					mission["dir"] = os.path.dirname(os.path.abspath(f.name))
					level["missions"][index2] = mission
		elif level["type"] == "rings":
			for index2, ring in enumerate(level["missions"]):
				for missionId in ring:
					missionData = ring[missionId]
					missionDir = missionData["dir"]
					with open(dir + '/' + levelDir + '/' + missionDir + '/mission.json') as f:
						mission = json.load(f)
						mission["id"] = missionId
						mission["dir"] = os.path.dirname(os.path.abspath(f.name))
						mission["next"] = missionData["next"]
						ring[missionId] = mission
		
	print(json.dumps(_levels))

