#!/bin/bash
# this should be run on the game controller pi
echo -n Password:
read -s PASSWORD
wget --user update --password $PASSWORD http://45.33.41.65/iotsec/game-server-latest.zip

rm -rf game-server

unzip game-server-latest.zip

rm game-server-latest.zip