/** Get the module */
var app = angular.module('gameApp');

/** Angular injections. */
app.controller('instructorCtrl', ['$scope', '$uibModal', '$location', '$sce', '$filter', function($scope, $uibModal, $location, $sce, $filter) {

    /**
     * Dependency injectors .
     * @param $scope Angular scope
     * @param $uibModal Angular UI modal
     * @param $sce Angular sce service
     * @param $filter angular filter service      
     */

    /** Intialize scope variables. */
    window.scope = $scope;
    $scope.teamData = {
        teams: [],
        players: [],
        teamPlayers: []
    };
    $scope.scoreBoard = [];
    $scope.gameboards = {};
    $scope.internetEnabled = false;

    /** Function to update the game board chart based on chart data */
    $scope.updateChart = function() {
        // Create the chart
        Highcharts.chart('container', {
            chart: {
                type: 'column'
            },
            title: {
                text: 'Team Progress'
            },
            xAxis: {
                type: 'category'
            },
            yAxis: {
                title: {
                    text: 'Level'
                }
            },
            legend: {
                enabled: false
            },
            plotOptions: {
                series: {
                    borderWidth: 0,
                    dataLabels: {
                        enabled: true,
                        format: '{point.y:.1f}'
                    }
                }
            },
            tooltip: {
                headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
                pointFormat: '<span style="color:{point.color}">{point.name}</span>: <b>Level {point.y:.2f}</b><br/>'
            },
            "series": [{
                "name": "Teams",
                "colorByPoint": true,
                "data": $scope.chartData
            }]
        });
    };

    /** Intialize scope variables to display this data in Arrange Mission and Player Block */
    $scope.playerData = {};
    $scope.deviceData = {};
    $scope.arrangeList = [];

    /** Repeat the for loop for pushing the player data to arrange list */
    for (var i = 0; i < 9; i++) {
        $scope.arrangeList.push({
            playerData: $scope.playerData,
            missionType: "Webcam",
            device: "null",
            playerType: "null"
        });
    }

    /** Function to update the player data
      @param : player to update
     */
    function updatePlayerData(player) {
        var oldPlayer = $scope.playerData[player.id];
        if (oldPlayer) {
            for (var i in player)
                oldPlayer[i] = player[i];
            angular.forEach(scope.teamData.players, function(t, i) {
                if (t.id == player.id) {
                    t = player;
                }
            });
        } else {
            $scope.playerData[player.id] = player;
            $scope.teamData.players.push(player);

        }
        $scope.$applyAsync();
    }

    /** Function to update the device data
      @param : device to update
    */
    function updateDeviceData(device) {
        var oldDevice = $scope.deviceData[device.ip];
        if (oldDevice) {
            for (var i in device)
                oldDevice[i] = device[i];
        } else {
            $scope.deviceData[device.ip] = device;
        }
        $scope.$applyAsync();
    }

    /** Triggering the updateDeviceData for Updating the devices*/
    updateDeviceData({ "id": "GameController", "ip": "10.1.1.5", "online": true, "isInfrastructure": true, "player": null });
    updateDeviceData({ "id": "2960Switch", "ip": "10.1.1.1", "online": true, "isInfrastructure": true, "player": null });

    /** Function to update the mission
      @param : block is selected mission
    */
    $scope.updatePlayer = function(block) {
        return;
        var missionList = $scope.playerData;
        angular.forEach($scope.arrangeList, function(value, key) {
            if (key != block && $scope.arrangeList[block].missionType == value.missionType) {
                missionList = missionList.filter(function(player) { return value.playerType != player });
            }
        });
        $scope.arrangeList[block].playerData = missionList;
    }

    /** Function to update the player
       @param : block is selected player
     */
    $scope.updatePlayerList = function(block) {
        return;
        var missionList = [];
        angular.forEach($scope.arrangeList, function(value, key) {
            if ($scope.arrangeList[block].missionType == value.missionType) {
                missionList.push(value.playerType);
            }
        });
        angular.forEach($scope.arrangeList, function(value, key) {
            if (key != block && $scope.arrangeList[block].missionType == value.missionType) {
                value.playerData = $scope.playerData.filter(function(player) {
                    return missionList.indexOf(player) == -1 || value.playerType == player;
                });
            }
        });
    }


    /** Function to move the selected players to right(Team Players)*/
    $scope.moveRight = function() {
        var filterList = $scope.teamData.teams.filter(function(t, id) {
            return t.isSelected;
        });
        if (filterList.length > 1) {
            return;
        }
        var selectedList = [];
        var unSelectedList = [];
        angular.forEach($scope.teamData.players, function(team) {
            if (team.isSelected) {
                team.isSelected = false;
                team.selectedTeam = filterList[0].name;
                selectedList.push(team);
            } else {
                unSelectedList.push(team);
            }
        });
        $scope.teamData.players = unSelectedList;
        $scope.teamData.teamPlayers = $scope.teamData.teamPlayers.concat(selectedList);
    };

    /** Function to move the selected team players toleft(Players) */
    $scope.moveLeft = function() {
        var selectedList = [];
        var unSelectedList = [];
        angular.forEach($scope.teamData.teamPlayers, function(team) {
            if (team.isSelected) {
                team.isSelected = false;
                team.selectedTeam = '';
                selectedList.push(team);

            } else {
                unSelectedList.push(team);
            }
        });
        $scope.teamData.teamPlayers = unSelectedList;
        $scope.teamData.players = $scope.teamData.players.concat(selectedList);
    }

    /** Function to select a player for moving team player list */
    $scope.selectPlayer = function(team) {
        var filterList = $scope.teamData.teams.filter(function(t, id) {
            return t.isSelected;
        });
        if (!team.isSelected && filterList.length != 1) {
            var text = filterList.length > 1 ? "Please select single team to rename" : "Please Select Team";
            alert(text);
        } else {
            team.isSelected = !team.isSelected;
        }
    }

    /** Function to  unselect all teams*/
    $scope.unselectAll = function(team) {
        angular.forEach($scope.teamData.teams, (function(t, id) {
            if (team.name != t.name) {
                t.isSelected = false;
            }
        }));
        if (!team.isSelected) {
            team.isSelected = true;
            $scope.selectedTeam = team.name;
        } else {
            team.isSelected = false;
            $scope.selectedTeam = '';
        }

    }

    /** Function to add team*/
    $scope.addTeam = function() {
        if ($scope.teamText) {
            var filterList = $scope.teamData.teams.filter(function(t) {
                return t.name == $scope.teamText;
            })
            if (filterList.length == 0) {
                $scope.teamData.teams.push({ name: $scope.teamText, id: $scope.teamText });
            } else {
                alert("This Name has already taken Please Enter new Name");
            }
            $scope.teamText = '';
        } else {
            alert("Enter Team Name");
        }
    }

    /** Function to update team*/
    $scope.updateTeam = function(team) {
        if (!team.isEdit) {
            team.isEdit = !team.isEdit;
            return;
        }
        var filterList = $scope.teamData.teams.filter(function(t) {
            return t.name == team.name;
        })
        if (filterList.length > 1) {
            team.name = '';
            alert("Dulplicate Team name");
            return;
        }
        angular.forEach($scope.teamData.teamPlayers, function(tp) {
            if (tp.selectedTeam == team.id) {
                tp.selectedTeam = team.name;
            }
        });
        team.id = team.name;
        team.isEdit = !team.isEdit
    }

    /** Function to remove team */
    $scope.removeTeam = function(team, index) {
        var selectedList = [];
        var unSelectedList = [];
        angular.forEach($scope.teamData.teamPlayers, function(tp) {
            if (team.name == tp.selectedTeam) {
                tp.selectedTeam = '';
                selectedList.push(tp);
            } else {
                unSelectedList.push(tp);
            }
        });
        $scope.teamData.players = $scope.teamData.players.concat(selectedList);
        $scope.teamData.teamPlayers = unSelectedList;
        $scope.teamData.teams.splice(index, 1);
    }

    /** Intialize scope variable for update view */
    $scope.hideConfig = false;

    /** Function to start the game .*/
    $scope.start = function() {
        var data = {
            'type': 'start',
            'piCount': 9,
            'teams': [],
            'otherConfig': {
                'cheat': ($location.search().cheat == true)
            }
        };
        let teams = {}
        angular.forEach($scope.teamData.teamPlayers, function(t) {
            if (teams[t.selectedTeam]) {
                teams[t.selectedTeam].players.push(t.id);
            } else {
                teams[t.selectedTeam] = { name: t.selectedTeam, players: [t.id] }
            }
        });

        for (var i in teams)
            data.teams.push(teams[i]);
        ws.send(JSON.stringify(data));
    }

    /** Intialize scope variable for chat view */
    $scope.chatHistory = '';
    $scope.chatMsg = '';
    $scope.chatToList = [{
        id: 'everyone',
        name: 'Everyone'
    }, {
        id: 'notification',
        name: 'Notification'
    }];
    $scope.chatTo = $scope.chatToList[0];

    /** Function to update the chat to the list */
    $scope.updateChatToList = function() {
        if ($scope.chatToList.length == 2) {
            $scope.chatToList.push({ disabled: true, id: '__', name: '--' });
            for (var t in $scope.scoreBoard) {
                var team = $scope.scoreBoard[t];
                $scope.chatToList.push({ id: 'team:' + team.name, name: team.name });
            }

            $scope.chatToList.push({ disabled: true, id: '__', name: '--' });
            for (var t in $scope.scoreBoard) {
                var team = $scope.scoreBoard[t];
                for (var p in team.players) {
                    var player = team.players[p];
                    $scope.chatToList.push({ id: player.id, name: player.name });
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

    /** Function to send  the chat */
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

    /** Function to play beep sound */
    $scope.playSound = function() {
        var sound = document.getElementById('play');
        sound.play();
    }

    $scope.showSettings = function() {
        var template = $('.settings-modal-template').html();
        var modalInstance = $uibModal.open({
            animation: true,
            template: template,
            scope: $scope,
            controller: function($uibModalInstance) {
                $ctrl = this;
                $ctrl.enableInternet = $scope.internetEnabled;
                $ctrl.ok = function() {
                    $uibModalInstance.dismiss('ok');

                    if ($scope.internetEnabled != $ctrl.enableInternet) {
                        ws.send(JSON.stringify({
                            type: 'internet',
                            enable: ($ctrl.enableInternet == true)
                        }));
                    }
                };

                $ctrl.cancel = function() {
                    $uibModalInstance.dismiss('cancel');
                };

                $ctrl.close = function() {
                    $uibModalInstance.close('saved');
                }
            },
            controllerAs: 'ctrl',
            windowClass: 'mission-modal-window',
            size: 'md',
            backdrop: false
        });

        modalInstance.result.then(function(response) {}, function() {});
    }

    /** Function to get scores from score board */
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
    var url = 'ws://' + window.location.host + '/instructor'
    var ws = null;

    function connectToWS() {
        var toReconnect = true;
        ws = new WebSocket(url);
        window.ws = ws;
        ws.onopen = function() {};
        ws.onclose = function() {
            if (toReconnect) {
                setTimeout(function() {
                    connectToWS();
                }, 2000);
            }
        };
        ws.onmessage = function(event) {
            try {
                var msg = JSON.parse(event.data);
                var type = msg['type'];
                if (type == 'player') {
                    updatePlayerData(msg);
                    $scope.playSound();
                } else if (type == 'device') {
                    updateDeviceData(msg);
                    $scope.playSound();
                } else if (type == 'started') {
                    $scope.hideConfig = true;
                    $scope.$applyAsync();
                } else if (type == 'scores') {
                    if (JSON.stringify(getScores($scope.scoreBoard)) != JSON.stringify(getScores(msg.scores))) {
                        $scope.playSound();
                    }
                    $scope.scoreBoard = msg.scores;
                    $scope.updateChatToList();
                    $scope.$applyAsync();

                } else if (type == 'chat') {
                    $scope.appendChat(msg.from, msg.to, msg.msg);
                    $scope.playSound();

                } else if (type == 'gameboard') {
                    $scope.gameboards = msg.gameboard;
                    $scope.chartData = [];
                    for (var teamName in $scope.gameboards) {
                        var gameboard = $scope.gameboards[teamName];
                        $scope.chartData.push({ name: gameboard.team, y: gameboard.progress });
                    }
                    $scope.chartData = $filter('orderBy')($scope.chartData, "name");
                    $scope.updateChart();
                    $scope.$applyAsync();

                } else if (type == 'internet') {
                    $scope.internetEnabled = msg.enabled;
                    $scope.$applyAsync();

                } else if (type == 'error') {
                    if (msg.code != 'not_instructor_vlan') {
                        alert(msg.msg);
                    } else {
                        toReconnect = false;
                        var template = $('.blocking-modal-template').html();
                        template = template.replace('[[name]]', 'Error').replace('[[description]]', msg.msg);
                        var modalInstance = $uibModal.open({
                            animation: true,
                            template: template,
                            scope: $scope,
                            controllerAs: 'ctrl',
                            windowClass: 'alert-modal-window',
                            size: 'sm',
                            backdrop: 'static'
                        });
                    }

                } else if (type == 'grid') {
                    $scope.gridData = msg.grid;
                    $scope.$applyAsync();

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
            } catch (e) {}
        };
    }

    connectToWS();
    /** web socket logic ends here */
}]);



/** User Form logic goes here */

/** Angular injections. */
app.controller('formCtrl', ['$scope', function($scope) {

    /**
     * Dependency injectors .
     * @param $scope Angular scope     
     */

    /** Intialize scope variables. */
    $scope.registerUser = false;

    /** Function to show register button */
    $scope.showRegister = function() {
        $scope.registerUser = $scope.registerUser ? false : true;
    }
}])

/** User Form logic ends here */