var app = angular.module('myApp', [])
app.controller('myCtrl', function($scope, $http) {
    $scope.loggedInUser = null;
    $scope.loginFailed = false;
    $scope.loginSuccess = false;
    $scope.loginAttempt = 0;

    $scope.login = function(user) {
        if (user) {
            $http.get('/login?user=' + user.username + '&password=' + user.password)
                .then(function(response) {
                    console.log(response);
                    if (response.data == 'true') {
                        $scope.loggedInUser = user;
                        $scope.loginSuccess = true;
                        $scope.$applyAsync();
                    } else {
                        throw 'login error';
                    }
                }).catch(function(err) {
                    $scope.loginAttempt = 0;
                    $scope.loginFailed = true;
                    $scope.$applyAsync();
                })
        }
    }
})