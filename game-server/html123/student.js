/** Get The Module */
var app = angular.module('gameApp');

/** Angular Injections. */
app.controller('studentCtrl', ['$scope', '$window', '$uibModal', '$location', '$sce', '$timeout', function($scope, $window, $uibModal, $location, $sce, $timeout) {
    /**
        * Dependency injectors .
        * @param $scope Angular scope
        * @param $window angular window   
        * @param $uibModal Angular UI modal
        * @param $location angular location service  
        * @param $sce Angular sce service
        * @param $timeout angular timeout 
    */
      
 /** Intialize variables */
    var LOCKED_COLOR = '#d3d3d3';
    var UNLOCKED_COLOR = '#ffff00';
    var COMPLETED_COLOR = '#005073';
    var IN_PROGRESS_COLOR = '#5cb85c';
    
    /** Function to intialize the game board chart(mx client chart) */
    $scope.initGameboard = function() {
        var container = document.getElementById('gameboardContainer');
        // Checks if the browser is supported
        if (!mxClient.isBrowserSupported()) {
            // Displays an error message if the browser is not supported.
            mxUtils.error('Browser is not supported!', 200, false);
        } else {
            // don't load other languages
            mxResources.loadSpecialBundle = false;

            var graph = new mxGraph(container);
            $scope.gameboardView = graph;
            $scope.gameboardView.data = { missions: {}, levels: {} };
            graph.setEnabled(false);
            graph.setCellsEditable(false);
            graph.setAllowDanglingEdges(false);
            graph.setAllowLoops(false);
            graph.setCellsDeletable(false);
            graph.setCellsCloneable(false);
            graph.setCellsDisconnectable(false);
            graph.setDropEnabled(false);
            graph.setSplitEnabled(false);
            graph.setCellsBendable(false);
            graph.setConnectable(false);
            graph.setPanning(false);
            graph.setHtmlLabels(true);
            graph.convertValueToString = function(cell) {
                if (mxUtils.isNode(cell.value)) {
                    return cell.getAttribute('label', '')
                }
                return cell.value;
            };
            graph.setTooltips(true);
            graph.getTooltipForCell = function(cell) {
                if (cell.getAttribute('mission')) {
                    var missionId = cell.getAttribute('mission');
                    var mission = $scope.gameboard.missions[missionId];
                    if (!mission)
                        return '';
                    var text = 'Mission ' + missionId + ': ' + mission.name + '<br>';
                    if (!mission.unlocked) {
                        text += 'Locked';
                    } else if (mission.done) {
                        text += 'Completed by ' + mission.playerName;
                    } else if (mission.playerName) {
                        text += 'In progress by ' + mission.playerName;
                    } else {
                        text += 'Unlocked';
                    }
                    return text;
                } else if (cell.getAttribute('level')) {
                    return 'Level ' + cell.getAttribute('level');
                }
                return '';
            }
            // Needs to set a flag to check for dynamic style changes,
            // that is, changes to styles on cells where the style was
            // not explicitely changed using mxStyleChange
            graph.getView().updateStyle = true;
            // Overrides mxGraphModel.getStyle to return a specific style
            // for edges that reflects their target terminal (in this case
            // the strokeColor will be equal to the target's fillColor).
            var previous = graph.model.getStyle;
            graph.model.getStyle = function(cell) {
                if (cell != null) {
                    var style = previous.apply(this, arguments);
                    if (cell.extraStyle)
                        style += ';' + cell.extraStyle;
                    return style;
                }
                return null;
            };
            new mxRubberband(graph);
            var parent = graph.getDefaultParent();
            var style = graph.getStylesheet().getDefaultVertexStyle();
            style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_ELLIPSE;
            style[mxConstants.STYLE_PERIMETER] = mxPerimeter.EllipsePerimeter;
            graph.addListener(mxEvent.CLICK, function(sender, evt) {
                var e = evt.getProperty('event');
                var cell = evt.getProperty('cell');
                if (cell != null) {
                    var missionId = cell.getAttribute('mission');
                    if (missionId) {
                        $scope.selectMission(missionId);
                    }
                    evt.consume();
                }
            });
            graph.getModel().beginUpdate();
            var xmlFile = "./gameBoard.xml";
            try {
                var doc = mxUtils.load(xmlFile);
                var codec = new mxCodec(doc);
                codec.decode(doc.getDocumentElement(), graph.getModel());
                var cells = graph.getChildVertices();
                for (var i in cells) {
                    var cell = cells[i];
                    if (cell.getAttribute('mission')) {
                        cell.extraStyle = 'fillColor=' + LOCKED_COLOR;
                        graph.data.missions[cell.getAttribute('mission')] = cell;
                    } else if (cell.getAttribute('level')) {
                        cell.extraStyle = 'strokeColor=' + LOCKED_COLOR;
                        graph.data.levels[cell.getAttribute('level')] = cell;
                    }
                }
            } finally {
                graph.getModel().endUpdate();
                $('#gameboardContainer > svg').css('width', '');
                $('#gameboardContainer > svg').css('margin', 'auto');
            }
        }
    }
    
    /** Intialize scope variables */
    window.scope = $scope;
    $scope.tools = {
        "nmap": {
            "name": "Nmap",
            "img": "images/nmap.png",
            "url": "https://nmap.org",
            "desc": "Nmap is a security tool used to scan and discover hosts and services on a computer network."
        },
        "wireshark": {
            "name": "Wireshark",
            "img": "images/2000px-Wireshark_icon.svg.png",
            "url": "https://www.wireshark.org",
            "desc": "Wireshark is the world's foremost and widely-used network protocol analyzer."
        },
        "usb2serial": {
            "name": "USB to TTL Serial Cable",
            "img": "images/usb2ttl.jpg",
            "url": "https://www.adafruit.com/product/954",
            "desc": "A USB to TTL serial converter cable to provide connectivity between USB and serial UART interfaces on your Pi."
        },
        "uart_gpio": {
            "name": "UART GPIO pins",
            "img": "images/UART GPIO pins.png",
            "url": "images/UART GPIO pins.png",
            "desc": "A USB to TTL serial cable to connect to your Raspberry Pi's serial console port."
        },
        "putty": {
            "name": "PuTTY",
            "img": "images/Putty.png",
            "url": "https://www.putty.org/",
            "desc": "PuTTY is a free and open-source terminal emulator, serial console and network file transfer application."
        },
        "kali": {
            "name": "Kali Linux VM",
            "img": "images/kali-icon.png",
            "url": "https://www.kali.org/",
            "desc": "An open source Debian-derived Linux distribution designed for digital forensics and penetration testing."
        },
        "wget": {
            "name": "Wget Command",
            "img": "images/wget.png",
            "url": "https://www.gnu.org/software/wget/",
            "desc": "A software package used to retrieve contents from web servers using HTTP, HTTPS, FTP, and FTPS."
        },
        "binwalk": {
            "name": "Binwalk",
            "img": "images/binwalk.png",
            "url": "https://tools.kali.org/forensics/binwalk",
            "desc": "A tool for searching a given binary image for embedded files and executable code. Designed for identifying files and code embedded inside of firmware images."
        },
        "sudo": {
            "name": "Sudo",
            "img": "images/sudo.png",
            "url": "https://www.sudo.ws/",
            "desc": "Allows a user to run commands with the security privileges of another user, by default the superuser."
        },
        "john": {
            "name": "John the Ripper",
            "img": "images/johntheripper1_design.png",
            "url": "https://www.openwall.com/john/",
            "desc": "A password cracking tool designed to detect weak passwords."
        },
        "ettercap": {
            "name": "Ettercap",
            "img": "images/ettercap.PNG",
            "url": "http://www.ettercap-project.org/",
            "desc": "A security tool used for man-in-the-middle attacks on a LAN."
        },
        "webbrowser": {
            "name": "webbrowser",
            "img": "images/webbrowser.jpg",
            "url": "https://www.mozilla.org/en-US/firefox/new/",
            "desc": "A web browser is a software application for accessing information on the World Wide Web."
        },
        "sqlmap": {
            "name": "SQLmap",
            "img": "images/sqlmap.png",
            "url": "http://sqlmap.org/",
            "desc": "sqlmap is an open source penetration testing tool that automates the process of detecting and exploiting SQL injection flaws and taking over of database servers."
        }
    };
    $scope.currentTools = [];
    $scope.gameboard = {};
    $scope.scoreBoard = [];
    $scope.waiting = true;
    $scope.missionContentShown = false;
    
    /** Function to select mission */
    $scope.selectMission = function(missionId) {
        $scope.selectedMission = $scope.gameboard.missions[missionId];
        if (!$scope.selectedMission) {
            $scope.openModal("Warning", 'Mission not available.');
            return;
        }
        if (!$scope.selectedMission.unlocked) {
            $scope.openModal("Warning", 'Mission is locked.');
            return;
        }
        var showContent = false;
        if ($scope.selectedMission.playerId) {
            ws.send(JSON.stringify({
                type: 'selectMission',
                mission: missionId
            }));
            showContent = true;
        }else {

            $scope.missionContentShown = true;
            var modalInstance = $uibModal.open({
                animation: true,
                scope: $scope,
                templateUrl: './missionModel.html',
                controller: function($uibModalInstance) {
                    $ctrl = this;
                    $ctrl.showContent = showContent;
                    $ctrl.ok = function() {
                        ws.send(JSON.stringify({
                            type: 'selectMission',
                            mission: missionId
                        }));
                        $ctrl.showContent = true;
                        $uibModalInstance.dismiss('ok');
                        $scope.missionContentShown = false;
                    };

                    $ctrl.cancel = function() {
                        $uibModalInstance.dismiss('cancel');
                        $scope.missionContentShown = false;
                    };

                    $ctrl.close = function() {
                        $uibModalInstance.close('saved');
                        $scope.missionContentShown = false;
                    }

                },
                controllerAs: 'ctrl',
                windowClass: 'mission-modal-window',
                size: 'md',
                backdrop: false
            });

            modalInstance.result.then(function(response) {}, function() {});
        }
    };

    /** Function to open modal pop up.
     @param title is heading of the modal
     @param content is  content of modal
    */
    $scope.openModal = function(title, content) {
        var template = $('.modal-template').html();
        template = template.replace('[[name]]', title).replace('[[description]]', content);
        $scope.isSuccess = false;
        if (title === 'Success') {
            $scope.isSuccess = true;
        }
        var modalInstance = $uibModal.open({
            animation: true,
            template: template,
            scope: $scope,
            controller: function($uibModalInstance) {
                $ctrl = this;
                $ctrl.ok = function() {
                    $ctrl.close();
                };

                $ctrl.cancel = function() {
                    $uibModalInstance.dismiss('cancel');
                };

                $ctrl.close = function() {
                    $uibModalInstance.close('saved');
                }

            },
            controllerAs: 'ctrl',
            windowClass: 'alert-modal-window',
            size: 'sm',
            backdrop: 'static'
        });

        modalInstance.result.then(function(response) {
        }, function() {
        });
    };

    /** Function to open  window.
     @param  url is  window location url
    */
    $scope.goToUrl = function(url) {
        if (url)
            $window.open(url, "_blank");
    };

    /** Intialize scope variables. */
    $scope.chatHistory = '';
    $scope.chatMsg = '';
    $scope.chatToList = [{
        id: 'everyone',
        name: 'Everyone'
    }, {
        id: 'instructor',
        name: 'Instructor'
    }];
    $scope.chatTo = $scope.chatToList[0];
    
    /** Function to update the chat to the list .*/
    $scope.updateChatToList = function() {
        if ($scope.chatToList.length == 2) {
            for (var t in $scope.scoreBoard) {
                var team = $scope.scoreBoard[t];
                for (var p in team.players) {
                    var player = team.players[p];
                    if (player.id == $scope.playerId) {
                        $scope.teamName = team.name;
                        break;
                    }
                }
            }

            $scope.chatToList.push({ disabled: true, id: '__', name: '--' });
            $scope.chatToList.push({ id: 'team', name: 'My Team' });
            for (var t in $scope.scoreBoard) {
                var team = $scope.scoreBoard[t];
                if (team.name != $scope.teamName) {
                    $scope.chatToList.push({ id: 'team:' + team.name, name: team.name });
                }
            }

            $scope.chatToList.push({ disabled: true, id: '__', name: '--' });
            for (var t in $scope.scoreBoard) {
                var team = $scope.scoreBoard[t];
                for (var p in team.players) {
                    var player = team.players[p];
                    if (player.id != $scope.playerId) {
                        $scope.chatToList.push({ id: player.id, name: player.name });
                    }
                }
            }
        }
    };

    /** Function to append chat to the chat view */
    
    $scope.appendChat = function(from, to, msg) {
        var chatDiv = $('#chathistory');
        chatDiv.html(chatDiv.html() + '<br>' + from + ' to ' + to + ': ' + msg);
        $('.chat-history').scrollTop(chatDiv[0].scrollHeight);
    }

    /** Function to append notification to the notification view*/
    $scope.appendNotification = function(from, msg) {
        var notiDiv = $('#notificationhistory');
        notiDiv.html(notiDiv.html() + from + ': ' + msg + '<br>');
        $('.notification-history').scrollTop(notiDiv[0].scrollHeight);
    }

    /** Function to send the chat */
    $scope.sendChat = function() {
        var msg = $scope.chatMsg;
        $scope.chatMsg = '';
        if (!msg)
            return;
        $scope.appendChat('Me', $scope.chatTo.name, msg);
        ws.send(JSON.stringify({
            type: 'chat',
            to: $scope.chatTo.id,
            msg: msg
        }));
    };

     /** Clear the mission content */ 
    $scope.missionContent = '';
    
     /** Function to submit flag.
     @param flag is boolean  to update flag
     */ 
    $scope.submitFlag = function(flag) {
        if (flag) {
            ws.send(JSON.stringify({
                type: 'flag',
                flag: flag
            }));
        }
    }
    
     /** Function to submit quiz.
     @param answers  for submitting  quiz
     */ 
    $scope.submitQuiz = function(answers) {
        for (var i in answers) {
            var answer = answers[i];
            if (answer && (typeof(answer) == 'object')) {
                var newAnswer = [];
                for (var j in answer) {
                    if (answer[j])
                        newAnswer.push(j);
                }
                answers[i] = newAnswer.sort();
            }
        }
        ws.send(JSON.stringify({
            type: 'quiz',
            answers: answers
        }));
    }

    /** Function to play beep sound */ 
    $scope.playSound = function() {
        var sound = document.getElementById('play');
        sound.play();
    }

     /** Function to get scores from score board*/ 
    function getScores(scoreboard) {
        var scores = [];
        for (var i in scoreboard) {
            scores.push({
                name: scoreboard[i].name,
                score: scoreboard[i].score
            });
        }
        return scores;
    }

     /** web socket logic start here */
    // ws://game-server.local:8080/player
    var url = 'ws://' + window.location.host + '/player'
    var ws = null;

    function connectToWS() {
        ws = new WebSocket(url);
        $scope.ws = ws;
        ws.onopen = function() {
            var name = $scope.playerName;
            while (name == null || name == "") {
                name = prompt("Name:");
            }
            $scope.playerName = name;

            ws.send(JSON.stringify({
                type: 'login',
                name: name,
                ip: $location.search().ip
            }));

            $scope.$applyAsync();
        };
        ws.onclose = function() {
            setTimeout(function() {
                connectToWS();
            }, 2000);
            $scope.$applyAsync();
        };
        ws.onmessage = function(event) {
            try {
                var msg = JSON.parse(event.data);
                var type = msg['type'];
                if (type == 'login') {
                    $scope.playerId = msg.id;
                    $scope.teamName = null;
                } else if (type == 'chat') {
                    if (msg.to == '__notification__') {
                        $scope.appendNotification(msg.from, msg.msg);
                    } else {
                        $scope.appendChat(msg.from, msg.to, msg.msg);
                    }
                    $scope.playSound();
                } else if (type == 'started') {
                    $scope.waiting = false;;
                    $scope.$applyAsync();
                    $scope.playSound();
                    introJs().start()
                } else if (type == 'scores') {
                    if (JSON.stringify(getScores($scope.scoreBoard)) != JSON.stringify(getScores(msg.scores))) {
                        $scope.playSound();
                    }

                    $scope.scoreBoard = msg.scores;
                    $scope.updateChatToList();
                    $scope.$applyAsync();
                } else if (type == 'gameboard') {
                    $scope.gameboard = msg.gameboard[$scope.teamName];
                    for (var id in $scope.gameboard.missions) {
                        var mission = $scope.gameboard.missions[id];
                        var missionView = $scope.gameboardView.data.missions[id];
                        if (missionView) {
                            if (!mission.unlocked) {
                                missionView.extraStyle = 'fillColor=' + LOCKED_COLOR;
                            } else if (mission.done) {
                                missionView.extraStyle = 'fillColor=' + COMPLETED_COLOR;
                            } else if (mission.playerName) {
                                missionView.extraStyle = 'fillColor=' + IN_PROGRESS_COLOR;
                            } else {
                                missionView.extraStyle = 'fillColor=' + UNLOCKED_COLOR;
                            }
                        }
                    }
                    var levelNum;
                    for (levelNum = 0; levelNum < $scope.gameboard.currentRing; levelNum++) {
                        $scope.gameboardView.data.levels[levelNum].extraStyle = 'strokeColor=' + COMPLETED_COLOR;
                    }
                    if ($scope.gameboardView.data.levels[levelNum])
                        $scope.gameboardView.data.levels[levelNum].extraStyle = 'strokeColor=' + IN_PROGRESS_COLOR;

                    $scope.gameboardView.view.refresh();

                    $scope.$applyAsync();
                } else if (type == 'stateData') {
                    $scope.missionContent = $sce.trustAsHtml(msg.text);

                    $scope.currentTools = [];
                    for (var i in msg.tools) {
                        var tool = msg.tools[i];
                        $scope.currentTools.push($scope.tools[tool]);
                    }

                    $scope.selectedMission = $scope.gameboard.missions[msg.missionId];
                    if (!$scope.missionContentShown) {
                        $scope.missionContentShown = true;
                        var modalInstance = $uibModal.open({
                            animation: true,
                            scope: $scope,
                            templateUrl: './missionModel.html',
                            controller: function($uibModalInstance) {
                                $ctrl = this;
                                $ctrl.showContent = true;
                                $ctrl.ok = function() {
                                    $uibModalInstance.dismiss('ok');
                                    $scope.missionContentShown = false;
                                };

                                $ctrl.cancel = function() {
                                    $uibModalInstance.dismiss('cancel');
                                    $scope.missionContentShown = false;
                                };

                                $ctrl.close = function() {
                                    $uibModalInstance.close('saved');
                                    $scope.missionContentShown = false;
                                }

                            },
                            controllerAs: 'ctrl',
                            windowClass: 'mission-modal-window',
                            size: 'sm',
                            backdrop: false
                        });

                        modalInstance.result.then(function(response) {}, function() {});
                    }
                    $scope.$applyAsync();
                    $timeout(function() {
                        $('.disable-answers-true input').prop('disabled', true);
                        $('.disable-answers-true textarea').prop('disabled', true);
                        $('.disable-answers-true button').prop('disabled', true);
                    }, 500);

                } else if (type == 'incorrectFlag') {
                    $scope.openModal("Error", 'Incorrect Flag');

                } else if (type == 'error') {
                    $scope.openModal("Error", msg.msg);

                } else if (type == 'levelsCompleted') {
                    $scope.openModal("Success", 'Congratulations! Your team has completed all levels.');

                } else if (type == 'endgame') {
                    var winner = msg['winner'];
                    if ($scope.loggedInUser.username == winner) {
                        $scope.missionCompleted = true;
                        $scope.$applyAsync();
                    } else {
                        $scope.otherMissionCompleted = true;
                        $scope.$applyAsync();
                    }
                }
            } catch (e) {
            }
        };
    }
    connectToWS();
    
     /** web socket logic ends here */
}]);