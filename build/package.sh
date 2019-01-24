#!/bin/bash
# packages up game-server and uploads it

# increment build version
version=`cat VERSION`
version=$((version + 1))
echo $version > VERSION

# create the build
echo "making build $version"
cp -r ../game-server game-server
rm game-server/autosave.json
rm game-server/saves/*
cp VERSION game-server/
zip -r archive/game-server-$version.zip game-server

# upload it and link to latest
echo -n Password:
read -s PASSWORD
sshpass -p $PASSWORD scp archive/game-server-$version.zip vitapoly@45.33.41.65:/var/www/html/iotsec
sshpass -p $PASSWORD ssh -t vitapoly@45.33.41.65 rm /var/www/html/iotsec/game-server-latest.zip
sshpass -p $PASSWORD ssh -t vitapoly@45.33.41.65 ln -s /var/www/html/iotsec/game-server-$version.zip /var/www/html/iotsec/game-server-latest.zip

# clean up
rm -r game-server

# write VERSION to JS Game Server
echo "VERSION='$version';" > ../game-server/html/VERSION.js

echo $version built
echo tagging build
cd ../
git tag -a build_$version -m "Dev Build Version $version"

