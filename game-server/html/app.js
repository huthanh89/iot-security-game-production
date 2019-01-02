
var app = angular.module('gameApp',  ['ui.bootstrap']);

app.controller('myCtrl', function($scope, $http) {
    // ws://game-server.local:8080/player
    var url = 'ws://' + window.location.host + '/player'
    var ws = null;

    function connectToWS() {
        ws = new WebSocket(url);
        ws.onopen = function() {
        };
        ws.onclose = function() {
            setTimeout(function() {
                connectToWS();
            }, 2000);
        };
        ws.onmessage = function(event) {
            try {
                var msg = JSON.parse(event.data);
                var type = msg['type'];
                if (type == 'mission') {
                    $scope.missionStarted = true;
                    $scope.unlockedMission = msg['level'];
                    $scope.$applyAsync();
                } else if (type == 'scores') {
                    $scope.scores = msg.scores;
                    var p1score, p2score;
                    // find the score of player1, player2
                    for (var i in msg.scores) {
                        var s = msg.scores[i];
                        if (s.name == 'player1')
                            p1score = s.score;
                        else if (s.name == 'player2')
                            p2score = s.score;
                    }
                    $scope.p1score = p1score;
                    $scope.p2score = p2score;
                    if (p1score >= 10) {
                        document.getElementsByClassName('playerOneHighlight').classList.add('highlight');
                        // show player1
                    }
                    if (p1score >= 60) {
                        document.getElementsByClassName("xrayHighlight").classList.add('highlight');
                        // show x-ray
                    }
                    if (p1score >= 100) {
                        document.getElementsByClassName("hospitalHighlight").classList.add('highlight');
                        // show hospital
                    }

                    if (p2score >= 10) {
                        document.getElementsByClassName('playerTwoHighlight').classList.add('highlight');
                        // show player2
                    }
                    if (p2score >= 60) {
                        document.getElementsByClassName('webCamHighlight').classList.add('highlight');

                        // show webcam
                    }
                    if (p2score >= 100) {
                        document.getElementsByClassName('webCamCloudHighlight').classList.add('highlight');
                        // show webcam-cloud
                    }

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

            } catch (e) {
            }
        };
    }

    connectToWS();

    $scope.startLogin = false;
    $scope.loggedInUser = null;
    $scope.loginFailed = false;
    $scope.loginSuccess = false;
    $scope.missionStarted = false;
    $scope.missionCompleted = false;
    $scope.otherMissionCompleted = false;
    $scope.unlockedMission = 0;
    $scope.scores = [];

    $scope.startLoginProcess = function() {
        $scope.startLogin = true;
        $scope.$applyAsync();
    }
    
    $scope.login = function(user) {
        if (user) {
            api.login(user.username, user.password)
                .then(function(response) {
                    $scope.loggedInUser = user;
                    $scope.loginSuccess = true;
                    $scope.$applyAsync();

                    ws.send(JSON.stringify({
                        "type": "login",
                        "user": user.username
                    }));
                }).catch(function(err) {
                    $scope.loginFailed = true;
                    $scope.$applyAsync();
                })
        }
    }

    $scope.startMission = function() {
        api.startMission()
            .then(function(data) {
                $scope.missionStarted = true;
                $scope.unlockedMission = data.unlock;
                $scope.$applyAsync();
            })
    }
})


app.config(['$locationProvider', function($locationProvider) {
    $locationProvider.html5Mode({ enabled: true, requireBase: false });
}]);

app.filter('makeRange', function() {
    return function(input) {
        var lowBound, highBound;
        switch (input.length) {
            case 1:
                lowBound = 0;
                highBound = parseInt(input[0]) - 1;
                break;
            case 2:
                lowBound = parseInt(input[0]);
                highBound = parseInt(input[1]);
                break;
            default:
                return input;
        }
        var result = [];
        for (var i = lowBound; i <= highBound; i++)
            result.push(i);
        return result;
    };
});

app.filter('fixDecimal', function($filter) {
    return function(input, decimalPlaces) {
        if (isNaN(input)) return input;

        if (Number.isInteger(input)) {
            return input;
        }
        // If we want 1 decimal place, we want to mult/div by 10
        // If we want 2 decimal places, we want to mult/div by 100, etc
        // So use the following to create that factor
        var factor = "1" + Array(+(decimalPlaces > 0 && decimalPlaces + 1)).join("0");
        return Math.round(input * factor) / factor;
    };
});

app.directive('compile', ['$compile', function($compile) {
    return function(scope, element, attrs) {
        scope.$watch(
            function(scope) {
                // watch the 'compile' expression for changes
                return scope.$eval(attrs.compile);
            },
            function(value) {
                // when the 'compile' expression changes
                // assign it into the current DOM
                element.html(value);

                // compile the new DOM and link it to the current
                // scope.
                // NOTE: we only compile .childNodes so that
                // we don't get into infinite loop compiling ourselves
                $compile(element.contents())(scope);
            }
        );
    };
}])