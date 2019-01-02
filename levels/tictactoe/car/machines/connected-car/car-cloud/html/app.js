var app = angular.module('myApp', [])
app.controller('myCtrl', function($scope, $http) {
    $scope.loggedInUser = null;
    $scope.loginFailed = false;
    $scope.loginSuccess = false;
    $scope.loginAttempt = 0;
    $scope.devToolsOpened = false;

    $scope.login = function(user) {
        if (user && user.username && user.password) {
            // var sqlInjectionRegex=/(ALTER|CREATE|DELETE|DROP|EXEC(UTE){0,1}|INSERT( +INTO){0,1}|OR|AND|MERGE|SELECT|UPDATE|UNION( +ALL){0,1})\s/ig;
            //     if(sqlInjectionRegex.test(user.password.trim())) {
            //         console.log("Congratulation! you have succefully login to the Server.");
            //         $scope.loginSuccess = true;
            //         $scope.$applyAsync();

            //         return
            //     }
            //  $scope.loginAttempt = 0;
            // $scope.loginFailed = true;
            //     console.log("you have to hack the system via sqlInjection");
            //     console.log("try sqlInjection in password field to sucessfully login into the system");
            //         $scope.$applyAsync();

            $http.get('/login?user=' + user.username + '&password=' + user.password + '&devtools=' + $scope.devToolsOpened)
                .then(function(response) {
                    // console.log(response);
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
                    console.log('SQL ERROR: \'SELECT * FROM Users WHERE Name = "' + user.username + '" AND Pass = "' + user.password + '"\'');
                    // console.log("you are going to hack the system via sqlInjection");
                    // console.log("insert any sql commands in the password field to login ")
                    $scope.$applyAsync();
                })
        }
    }
    window.addEventListener('devtoolschange', function(e) {
        if (e.detail.open) {
            $scope.devToolsOpened = true;
            $http.get('/devtools');
            //console.log("game in pr")
            //$http.post
        }
        //console.log('changed');
        //console.log('is DevTools open?', e.detail.open);
        //console.log('and DevTools orientation?', e.detail.orientation);
    });

    $scope.unlock = function() {
        $http.get("/unlock")

    }
    $scope.turnOff = function() {
        $http.get("/turnoff")

    }
    $scope.logout = function() {
        location.reload();

    }


})