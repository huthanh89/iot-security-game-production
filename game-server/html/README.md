# Development Game Server startup process.

cd game-server

python server.py 8080 nocheck noswitch          

Open instructor dashboard:

http://localhost:8080/instructor-dashboard.html?cheat

Open student dashboard:

http://localhost:8080/student-dashboard.html?ip=10.1.101.11  

# Web Development setup.

1. Install node v10.15.0

https://nodejs.org/en/

2. Install Chrome extension livereload

https://chrome.google.com/webstore/detail/livereload/jnihajbhpnppcggbcgedagnkighmdlei?hl=en

3. Install node packages with the following commands:

npm install gulp
npm install gulp-livereload
npm install -g gulp

# Web Development startup process.

1. Enable livereload extension on Chrome browser, then run command

gulp


