var users = [
  {
    username: 'technician1',
    password: 'secretpass'
  }
];

var api = {
  login: function (username, password) {
    return new Promise(function (resolve, reject) {
      for (let user of users) {
        if (user.username === username && user.password === password) {
          return resolve({type: 'login', result: 'ok'});
        }
      }

      reject(new Error({status: 500, 'message': 'Invalid username and password'}));
    })
  }
};


