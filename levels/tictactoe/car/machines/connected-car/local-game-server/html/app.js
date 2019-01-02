var app = angular.module('myApp', []);
app.controller('myCtrl', function($scope, $http) {
    // ws://game-server.local:8080/player
    var url = 'ws://' + window.location.host + '/player'
    var ws = null;
    var bar;

    function connectToWS() {
        console.log('connecting to websocket');
        ws = new WebSocket(url);
        ws.onopen = function() {
            console.log('ws opened');
        };
        ws.onclose = function() {
            setTimeout(function() {
                connectToWS();
            }, 2000);
        }
        ws.onmessage = function(event) {
            console.log('ws msg', event.data);
            try {
                var msg = JSON.parse(event.data);
                var type = msg['type'];
                if (type == 'mission') {
                    $scope.missionStarted = true;
                    $scope.unlockedMission = msg['level'];
                    $scope.$applyAsync();
                } else if (type == 'endgame') {
                    $scope.missionCompleted = true;
                    $scope.$applyAsync();
                } else if (type == 'scores') {
                    for (var i in msg.scores) {
                        var s = msg.scores[i];
                        if (s.name == 'player1' && bar) {
                            bar.setText("Progress: " + s.score + "%")
                            bar.animate(s.score / 100)
                        }

                    }

                }

            } catch (e) {
                console.log('ws msg err', e);
            }
        };
    }

    connectToWS();
    $scope.startLogin = false;
    $scope.missionStarted = false;
    $scope.missionCompleted = false;
    $scope.unlockedMission = 0;
    $scope.scores = [];
    $scope.startLoginProcess = function() {
        var selectedValue = document.getElementById('labs').value
        if (selectedValue == 'Connected Car') {
            $scope.missionStarted = true;
            ws.send(JSON.stringify({
                "type": "login",
                "user": "player1"
            }));

            $scope.$applyAsync();
            $scope.startLogin = true;
            $scope.$applyAsync();
            setTimeout(function() {
                bar = new ProgressBar.Line('#progressBar', {
                    color: 'red',
                    duration: 3000,
                    easing: 'easeInOut',
                    trailColor: '#f4f4f4',
                    trailWidth: 0.8,
                    text: {
                        value: 'Progress: 0%',
                        style: {
                            // Text color.
                            // Default: same as stroke color (options.color)
                            color: 'white',
                            position: 'absolute',
                            left: '50%',
                            top: '50%',
                            padding: 0,
                            margin: '15px',
                            // You can specify styles which will be browser prefixed
                            transform: {
                                prefix: true,
                                value: 'translate(-50%, -50%)'
                            }
                        }
                    }
                });

                bar.animate(0);

            }, 50)

        } else {
            alert("Not implemented. Please choose Connected Car Lab.");
        }



    }

});