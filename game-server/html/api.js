
var users = [{
        username: 'player1',
        password: '1234'
    },
    {
        username: 'player2',
        password: '1234'
    }
]

var api = {
    login: function(username, password) {
        return new Promise(function(resolve, reject) {
            for (var user of users) {
                if (user.username === username && user.password === password) {
                    return resolve({ type: 'login', result: 'ok' })
                }
            }

            reject(new Error({ status: 500, 'message': 'Invalid username and password' }));
        })
    },
    getPlayersList: function() {
        return new Promise(function(resolve, reject) {
            resolve({
                type: 'scores',
                scores: [
                    { rank: 1, 'name': 'player1', score: 0 },
                    { rank: 2, 'name': 'player2', score: 0 }
                ]
            })
        })
    },
    startMission: function() {
        return new Promise(function(resolve, reject) {
            resolve({
                type: 'mission',
                unlock: 3
            })
        })
    }
}