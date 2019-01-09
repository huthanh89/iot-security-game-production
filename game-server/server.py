import threading
import tornado.ioloop
from tornado.ioloop import PeriodicCallback
import tornado.web
import tornado.websocket
import tornado.template
import tornado.httpserver
import os, sys, inspect, time
import json
from datetime import datetime
from collections import namedtuple
import traceback
from operator import attrgetter
import db
from netmiko import ConnectHandler
from common import *
import levels
# from tictactoe import *
from rings import *
from netmiko import *
from paramiko import SSHException

# python server.py 8080 [nocheck]
port = sys.argv[1]
noCheckInstructorVlan = "nocheck" in sys.argv
noSwitch = "noswitch" in sys.argv

startNewSession = "nosave" in sys.argv


# global vars
_game = None
_teams = []
_players = {}
_instructorWss = []
_devices = {}
_unclaimedKalis = []
_switchSsh = None
_internetEnabled = False

#device template
c2960 = {
    'device_type': 'cisco_ios',
    'ip': '10.1.1.1',
    'username': 'admin',
    'password': 'iot_Ruth3rf0rd!',
    'port': 22,
    'secret': 'iot_Ruth3rf0rd!'
}

#establish the SSH connection

def resetGame():
    global _game, _teams, _players, _instructorWss, _devices, _unclaimedKalis

    _game = None
    _teams = []
    _players = {}


    _devices = {}
    _unclaimedKalis = []


def connectToSwitch():
    global _internetEnabled, _switchSsh
    try:
        print("Connecting to 2960...")
        _switchSsh = ConnectHandler(**c2960)
        _switchSsh.enable()
        result = _switchSsh.send_command('show run | section include interface Vlan99')
        print(result)
        _internetEnabled = (result.find('ip access-group 150 in') >= 0)

    except (NetMikoTimeoutException, NetMikoAuthenticationException,) as e:
        print("Unable to connect to switch due to: %s ", str(e))
        connectToSwitch()

    except SSHException as e:
        print("Unable to connect to switch due to: %s ", str(e))
        connectToSwitch()


if not noSwitch:
    connectToSwitch()

# determines if the IP is in the instructor VLAN (10.1.1.x)
def isInstructorVlan(ip):
    try:
        vlan = int(ip.split(".")[2])
        return vlan == 1
    except:
        return False

# returns the instructor dashboard if in instructor vlan
# otherwise student dashboard
class RootHandler(tornado.web.RequestHandler):
    def get(self):
        db.log(self.request.remote_ip, "web_root_access")
        file = "html/" + ("instructor-dashboard.html" if isInstructorVlan(self.request.remote_ip) else "student-dashboard.html")
        with open(file, 'rb') as f:
            data = f.read()
            self.write(data)
        self.finish()

# websocket handler for instructor dashboard
class InstructorViewHandler(tornado.websocket.WebSocketHandler):
    def open(self):
        print("instructor view connected")
        db.log(self.request.remote_ip, "instructor_ws_connected")

        # return error and close if not from instructor vlan
        if not noCheckInstructorVlan and not isInstructorVlan(self.request.remote_ip):
            try:
                self.write_message(json.dumps({
                    "type": "error",
                    "code": "not_instructor_vlan",
                    "msg": "Cannot access Instructor Dashboard from this VLAN."
                }))
                self.close()
            except:
                pass

        _instructorWss.append(self)
        sendAllPlayersAndDevicesToInstructor()

        sendToInstructor("internet", {
            "enabled": _internetEnabled
        })

        if _game:
            sendToInstructor("started", {})
            sendGameStateToAll()

    def on_close(self):
        print("instructor view disconnected")
        db.log(self.request.remote_ip, "instructor_ws_disconnected")
        _instructorWss.remove(self)
        # viewers.remove(self)

    def on_message(self, message):
        print("instructor view received: ", message)
        # db.log(self.request.remote_ip, "instructor_msg", argStr = message)
        global _players, _teams, _game, _internetEnabled, _switchSsh
        try:
            ssh_command = ""
            msg = json.loads(message)
            if msg["type"] == "start" and _game == None:
                teamConfig = msg["teams"]
                otherConfig = msg["otherConfig"]
                startGame(teamConfig, otherConfig, False)

            elif msg["type"] == "endGame":
                resetGame()
                print("ending game")

            elif msg["type"] == "chat":
                to = msg["to"]
                sendChat(None, "Instructor", to, msg["msg"])

            elif msg["type"] == "internet":
                enable = msg["enable"]

                try:
                    if _switchSsh:
                        print("configuring on 2960...")

                        if enable:
                            ssh_command = '''config t
                                int vlan 99
                                ip access-group 150 in
                                end
                                write'''
                        else:
                            ssh_command = '''config t
                                int vlan 99
                                ip access-group 110 in
                                end
                                write'''


                        _switchSsh.enable()
                        _switchSsh.send_command(ssh_command)
                        print("configured on 2960.")

                        _internetEnabled = enable
                        sendToInstructor("internet", {
                            "enabled": _internetEnabled
                        })
                except Exception as e:
                    print("Unable to connect to switch due to: %s " % str(e))
                    connectToSwitch()
                    _switchSsh.enable()
                    print("retrying command %s" % ssh_command)
                    _switchSsh.send_command(ssh_command)
                    _internetEnabled = enable
                    sendToInstructor("internet", {
                        "enabled": _internetEnabled
                    })

            else:
                raise Exception("Invalid msg type")

            autoSaveGameState()


        except Exception as e:
            print("instructor view msg error: " + str(e))
            traceback.print_exc()
            db.log(self.request.remote_ip, "instructor_msg_error", argStr = message)
            db.log("app", "error", argStr = traceback.format_exc())

def startGame(teamConfig, otherConfig, auto_load_save):
    global _players, _teams, _game, _internetEnabled

    print("startGame", teamConfig)
    # playerCount = msg["playerCount"]
    # piCount = msg["piCount"]

    #teamConfig = msg["teams"]
    #otherConfig = msg["otherConfig"]

    _teams = []

    # create game
    # _game = TicTacToe(_teams, _players, _devices)
    _game = Rings(_teams, _players, _devices)
    if auto_load_save:
        _game.level = levels._levels[0]
        restoreGameState()

        _game.setup(levels._levels[0], _game.teamConfig, _game.otherConfig, sendGameStateToAll, True)

    else:
        _game.setup(levels._levels[0], teamConfig, otherConfig, sendGameStateToAll, False)



    # TODO config all devices
    setDns()

    db.log("game", "game_started", {"teams": teamConfig})
    sendToAll("started", {})
    sendChat(None, "Server", "notification", "Game started!!!")
    sendGameStateToAll()



# util function to send msg to instructor
def sendToInstructor(type, data):
    for ws in _instructorWss:
        data["type"] = type
        try:
            ws.write_message(json.dumps(data))
        except:
            pass

# util function to send all player and device info to instructor
def sendAllPlayersAndDevicesToInstructor():
    for player in _players.values():
        sendToInstructor("player", player.toJSON())
    for device in _devices.values():
        sendToInstructor("device", device.toJSON())

# util function to send msg to all
def sendToAll(type, data):
    data["type"] = type
    msg = json.dumps(data)
    for ws in _instructorWss:
        try:
            ws.write_message(msg)
        except:
            pass
    for player in _players.values():
        try:
            player.viewWs.write_message(msg)
        except:
            pass

# util function to send msg to all players
def sendToAllPlayers(type, data):
    data["type"] = type
    msg = json.dumps(data)
    for player in _players.values():
        try:
            player.viewWs.write_message(msg)
        except:
            pass

# util function send scores and gameboard to all
def sendGameStateToAll():
    print("sending gamestate to all")
    sendScores()
    sendToAll("gameboard", {"gameboard": _game.toJSON()})

# sorts teams by score and send to all
def sendScores():
    sortedTeams = list(_teams)
    sortedTeams = sorted(sortedTeams, key=attrgetter('name'))
    sortedTeams = sorted(sortedTeams, key=attrgetter('score'), reverse=True)
    scores = []

    for i in range(0, len(sortedTeams)):
        team = sortedTeams[i]
        scores.append(team.toJSON())

    sendToAll("scores", { "scores": scores })

# get domain names from the game and write to dns file and restart dns server
def setDns():
    filePath = "/etc/bind/db.security.game.lan"
    dnames = _game.getDNames()
    with open('dns/db.security.game.lan', 'r') as f:
        data = f.read()
    for name,ip in dnames.items():
        data += name + " IN A " + ip + "\n"
    print("dnames", data)

    if os.path.isfile(filePath):
        with open(filePath, 'w') as f:
            f.write(data)
        os.system("sudo service bind9 restart")

# vlan is the third octet of the IP address in the classroom setup
# if the vlan is above 100, then it's a student vlan
# create a new player and assign it to the dict using the IP as the key
def findOrCreatePlayerByIp(ip):
    if ip in _players:
        return _players[ip]

    try:
        vlan = int(ip.split(".")[2])
    except:
        vlan = 0
    name = "Player "
    if vlan > 100:
        name = name + str(vlan - 100)
    else:
        name = name + str(len(_players) + 1)
    player = Player(ip, name)
    player.vlan = vlan
    _players[ip] = player
    return player

def findPlayerByIpVlan(ip):
    try:
        vlan = int(ip.split(".")[2])
    except:
        vlan = 0

    for player in _players.values():
        if player.vlan == vlan:
            return player
    return None

# find devices in the same vlan (third octet of the IP in classroom setup)
def findDeviceByIpVlan(ip):
    try:
        vlan = int(ip.split(".")[2])
    except:
        vlan = 0

    for device in _devices.values():
        try:
            deviceVlan = int(device.ip.split(".")[2])
            if deviceVlan == vlan:
                return device
        except:
            pass
    return None

# if a device is in the same vlan as the player, let the player claim it 
def playerClaimDevice(player):
    if player.device == None:
        device = findDeviceByIpVlan(player.ip)
        player.device = device
    if player.device:
        player.device.player = player
        player.device.name = player.name + "'s Pi"
        sendToInstructor("device", player.device.toJSON())

def findUnclaimedKaliByIpVlan(ip):
    try:
        vlan = int(ip.split(".")[2])
    except:
        vlan = 0

    for kali in _unclaimedKalis:
        try:
            kaliVlan = int(kali.ip.split(".")[2])
            if kaliVlan == vlan:
                return kali
        except:
            pass
    return None

# if an unclaimed kali is in the same vlan as the player, let the player claim it 
def playerClaimKali(player):
    if player.kaliWs == None:
        player.kaliWs = findUnclaimedKaliByIpVlan(player.ip)
        if player.kaliWs:
            player.kaliWs.player = player

# websocket handler for student dashboard
class PlayerViewHandler(tornado.websocket.WebSocketHandler):
    def open(self):
        print("player view connected")
        db.log(self.request.remote_ip, "student_ws_connected")
        self.player = None

    def on_close(self):
        print("player view disconnected")
        db.log(self.request.remote_ip, "student_ws_disconnected")
        if self.player:
            self.player.viewWs = None
            sendToInstructor("player", self.player.toJSON())

    def on_message(self, message):
        print("player view received: ", self.player.name if self.player else 'no player', message)
        # db.log(self.player.name if self.player else self.request.remote_ip, "student_msg", argStr = message)
        try:
            msg = json.loads(message)
            if msg["type"] == "login":
                name = msg["name"]
                try:
                    ip = msg["ip"]
                except:
                    ip = self.request.remote_ip
                self.player = findOrCreatePlayerByIp(ip)

                print("Player View Handler.login")
                print(self.player.toJSON())

                self.player.viewWs = self
                self.player.name = name

                db.log(self.request.remote_ip, "student_login", {"srcIP": ip, "name": name})

                playerClaimKali(self.player)
                playerClaimDevice(self.player)

                sendToInstructor("player", self.player.toJSON())

                self.write_message(json.dumps({"type":"login", "result":"ok", "id": self.player.id}))

                if _game:
                    self.write_message(json.dumps({"type":"started"}))
                    sendGameStateToAll()
                    if self.player.team == None:
                        self.write_message(json.dumps({
                            "type": "error",
                            "code": "not_part_of_team",
                            "msg": "You are not part of a team and the game has already started."
                        }))
                    # if "mission" in self.player.data:
                    # 	self.player.data["mission"].sendStateDataToPlayer()

            elif msg["type"] == "chat":
                to = msg["to"]
                sendChat(self.player, None, to, msg["msg"])

            elif msg["type"] == "selectMission":
                mission = msg["mission"]
                _game.takeMission(self.player, mission)

            elif msg["type"] == "flag":
                # mission = msg["mission"]
                flag = msg["flag"]
                _game.viewEvent(self.player, "flag", flag)

            elif msg["type"] == "quiz":
                # mission = msg["mission"]
                answers = msg["answers"]
                _game.viewEvent(self.player, "quiz", answers)

            else:
                raise Exception("Invalid msg type")

            autoSaveGameState()


        except Exception as e:
            print("player msg error: " + str(e))
            traceback.print_exc()
            db.log(self.request.remote_ip, "player_msg_error", argStr = message)
            db.log("app", "error", argStr = traceback.format_exc())

def sendChat(player, fromStr, to, msg):
    data = {
        "type": "chat",
        "from": player.name if player else fromStr,
        "msg": msg
    }

    db.log(data["from"], "chat", {"to": to, "msg": msg})

    wss = []
    if to == "everyone" or to == "notification":
        data["to"] = "Everyone" if to == "everyone" else "__notification__"
        if player != None:
            wss += _instructorWss
        for p in _players.values():
            if p != player and p.viewWs:
                wss.append(p.viewWs)
    elif to == "instructor":
        data["to"] = "me"
        wss += _instructorWss
    elif to == "team":
        if player.team:
            data["to"] = "My Team"
            for p in player.team.players:
                if p != player and p.viewWs:
                    wss.append(p.viewWs)
    elif to.startswith("team:"):
        name = to.split(":")[1]
        data["to"] = "My Team"
        for team in _teams:
            if team.name == name:
                for p in team.players:
                    if p.viewWs:
                        wss.append(p.viewWs)
    else:
        p = _players[to]
        data["to"] = "me"
        if p.viewWs:
            wss.append(p.viewWs)

    data = json.dumps(data)
    for ws in wss:
        try:
            ws.write_message(data)
        except:
            pass

# get handler for requesting files
# the game controls whether the file is there and the path
class FilesHandler(tornado.web.RequestHandler):
    def get(self):
        mission = self.get_argument('mission')
        file = self.get_argument('file')
        ip = self.get_argument('ip', default=self.request.remote_ip)
        machineName = self.get_argument('machine', default="")

        player = None
        device = None
        if len(machineName) > 0:
            if ip in _devices:
                device = _devices[ip]
        else:
            if ip in _players:
                player = _players[ip]

        try:
            path = _game.getFile(player, device, machineName, mission, file)
            with open(path, 'rb') as f:
                self.set_header('Content-Type', 'application/octet-stream')
                self.set_header('Content-Disposition', 'attachment; filename=' + file)
                while 1:
                    data = f.read(16384)
                    if not data: break
                    self.write(data)
            self.finish()
        except Exception as e:
            print("FilesHandler error: " + str(e))
            traceback.print_exc()
            raise tornado.web.HTTPError(404, 'Not found')

# websocket handler for kali
# not much more than just login and status update for now
class KaliHandler(tornado.websocket.WebSocketHandler):
    def open(self):
        print("kali connected")
        db.log(self.request.remote_ip, "kali_ws_connected")
        self.player = None

    def on_close(self):
        print("kali disconnected")
        db.log(self.request.remote_ip, "kali_ws_disconnected")
        if self.player:
            self.player.kaliWs = None
            sendToInstructor("player", self.player.toJSON())

    def on_message(self, message):
        print("kali received: ", self.player.name if self.player else 'no player', message)
        # db.log(self.player.name if self.player else self.ip, "kali_msg", argStr = message)
        try:
            msg = json.loads(message)
            if msg["type"] == "login":
                ip = msg["ip"]
                if ip == None or len(ip) == 0:
                    ip = self.request.remote_ip
                self.ip = ip
                self.player = findPlayerByIpVlan(ip)
                if self.player:
                    db.log(self.request.remote_ip, "kali_login", {"srcIP": ip, "player": self.player.name})
                    self.player.kaliWs = self
                    sendToInstructor("player", self.player.toJSON())
                else:
                    db.log(self.request.remote_ip, "kali_login", {"srcIP": ip})
                    _unclaimedKalis.append(self)

                self.write_message(json.dumps({"type":"login", "result":"ok"}))


            autoSaveGameState()

        except Exception as e:
            print("kali msg error: " + str(e))
            traceback.print_exc()
            db.log(self.request.remote_ip, "kali_msg_error", argStr = message)
            db.log("app", "error", argStr = traceback.format_exc())

# websocket handler for pi
# it can receive events from pi and passes that on to the game
class PiHandler(tornado.websocket.WebSocketHandler):
    def open(self):
        print("pi connected")
        db.log(self.request.remote_ip, "pi_ws_connected")
        self.device = None

    def on_close(self):
        print("pi disconnected")
        db.log(self.request.remote_ip, "pi_ws_disconnected")
        if self.device:
            self.device.ws = None
            sendToInstructor("device", self.device.toJSON())
            if self.device.player:
                sendToInstructor("player", self.device.player.toJSON())

    def on_message(self, message):
        print("pi received: ", self.device.id if self.device else 'no device', message)
        # db.log(self.device.player.name if self.device.player else self.device.ip, "pi_msg", argStr = message)
        global _devices
        try:
            msg = json.loads(message)
            if msg["type"] == "login":
                id = msg["deviceId"]
                ip = msg["ip"]
                if ip == None or len(ip) == 0:
                    ip = self.request.remote_ip

                if ip in _devices:
                    self.device = _devices[ip]
                    self.device.id = id
                    self.device.ip = ip
                else:
                    self.device = Device(ip, id)
                    _devices[ip] = self.device
                self.device.ws = self

                if self.device.player == None:
                    self.device.player = findPlayerByIpVlan(ip)
                if self.device.player:
                    self.device.player.device = self.device
                    self.device.name = self.device.player.name + "'s Pi"
                    db.log(self.request.remote_ip, "pi_login", {"srcIP": ip, "player": self.device.player.name})
                    sendToInstructor("player", self.device.player.toJSON())
                else:
                    db.log(self.request.remote_ip, "pi_login", {"srcIP": ip})

                sendToInstructor("device", self.device.toJSON())

                self.write_message(json.dumps({"type":"login", "result":"ok"}))

            elif msg["type"] == "event":
                event = msg["event"]
                args = msg["args"]
                _game.deviceEvent(self.device, event, args)

            autoSaveGameState()

        except Exception as e:
            print("pi msg error: " + str(e))
            traceback.print_exc()
            db.log(self.request.remote_ip, "pi_msg_error", argStr = message)
            db.log("app", "error", argStr = traceback.format_exc())

def autoSaveGameState():
    saveGameState("autosave.json")


def saveGameState(filename):
    global _game

    if _game == None :
        return

    f = open(filename, "w")
    f.write(json.dumps(_game.serialize(), sort_keys=True, indent=4, separators=(',', ': ')))
    f.close()

    print("dumping game state")


def restoreGameState():
    global _game
    print("restoreGameState", _game)
    try:
        if _game == None:
            return

        f = open("autosave.json", "r")
        _game.deserialize(json.loads(f.read()))
        f.close()

        print("Game Restored")

    except Exception as e:
        print("game restore error: " + str(e))
        traceback.print_exc()

def checkAutoSave():
    try:
        f = open("autosave.json", "r")
        startGame(None, None, True)
    except Exception as e:
        traceback.print_exc()

levels.loadLevels('../levels')

# log web requests to db
def log_function(handler):
    status = handler.get_status()
    if status >= 400:
        if status >= 500:
            event = "web_error_server"
        else:
            event = "web_error_access"
        info = {
            "status": status,
            "method": handler.request.method,
            "url": handler.request.uri,
            "remoteIP": handler.request.remote_ip
        }
        db.log(handler.request.remote_ip, event, info)
        print("WEB ERROR: " + json.dumps(info, indent=4))

root = os.path.dirname(os.path.abspath(inspect.getfile(inspect.currentframe())))
index = "index.html"

settings = {
    "static_hash_cache": False,
    "log_function": log_function,
    "websocket_ping_interval": 10,
    "websocket_ping_timeout": 30
}

application = tornado.web.Application([
    (r"/instructor", InstructorViewHandler),
    (r"/player", PlayerViewHandler),
    (r"/kali", KaliHandler),
    (r"/pi", PiHandler),
    (r"/files", FilesHandler),
    (r"/", RootHandler),

    (r'/(.*)', tornado.web.StaticFileHandler, {'path': root + '/html', "default_filename": index})
], **settings)

if startNewSession != True:
    checkAutoSave()

httpServer = application.listen(port)
print("started on port: " + str(port))
db.log("app", "started", {"port": port})

try:
    tornado.ioloop.IOLoop.current().start()
except:
    print("\nserver stopped.")
    db.log("app", "stopped")
