#!/bin/bash
echo "Installing bind9, bind9utils, and dnstutils, pip3, tornado:"
sudo apt-get install bind9 bind9utils dnsutils python3-pip
sudo pip3 install tornado netmiko

echo "Setting up two zones in the configuration file of bind9:"
sudo cp /etc/bind/named.conf.local /etc/bind/named.conf.local.bak

sudo cat >/etc/bind/named.conf.local <<EOL
zone "security.game" IN {
        type master;
        file "/etc/bind/db.security.game.lan";
};

zone "1.1.10.in-addr.arpa" {
        type master;
        file "/etc/bind/db.rev.1.1.10.in-addr.arpa";
};
EOL

sudo cat >/etc/bind/db.security.game.lan <<EOL

security.game. IN SOA gc.security.game. hostmaster.security.game. (
        2018083101 ; serial
        8H ; refresh
        4H ; retry
        4W ; expire
        1D ; minimum
)

security.game. IN NS gc.security.game.
localhost       IN A 127.0.0.1
gc              IN A 10.1.1.5
game-controller IN A 10.1.1.5
game-server     IN A 10.1.1.5
game            IN A 10.1.1.5
router          IN A 10.1.1.1
switch          IN A 10.1.1.1
cloud           IN A 10.1.1.32
EOL

sudo cat >/etc/bind/db.rev.1.1.10.in-addr.arpa <<EOL

@ IN SOA gc.security.game. hostmaster.security.game. (
        2018083101 ; serial
        8H ; refresh
        4H ; retry
        4W ; expire
        1D ; minimum
)

        IN NS gc.security.game.
1       IN PTR switch.security.game.
5       IN PTR gc.security.game.
32      IN PTR.cloud.security.game.
EOL

echo "Setting Google's DNS as a forwarder"

sudo cp /etc/bind/named.conf.options /etc/bind/named.conf.options.bak

sudo cat >/etc/bind/named.conf.options <<EOL
options {
    forwarders {
      8.8.8.8;
    };

    dnssec-validation no;
}
EOL

echo "Restarting BIND for changes to take affect:"

sudo service bind9 restart

echo "Setting the BIND service to autostart if the Pi reboots"

sudo update-rc.d bind9 defaults

echo "copying to /opt/game-server"
sudo cp -r iot_security_game /opt/

echo "run on startup"
#echo >> "/opt/opt_security_game/"
