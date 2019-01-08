//-------------------------------------------------------------------------------//
// Controller
//-------------------------------------------------------------------------------//

function Controller($scope, $rootScope){
  
  $scope.tools = {
    "nmap": {
        "name": "Nmap",
        "img": "images/nmap.png",
        "url": "https://nmap.org",
        "desc": "Nmap is a security tool used to scan and discover hosts and services on a computer network."
    },
    "wireshark": {
        "name": "Wireshark",
        "img": "images/2000px-Wireshark_icon.svg.png",
        "url": "https://www.wireshark.org",
        "desc": "Wireshark is the world's foremost and widely-used network protocol analyzer."
    },
    "usb2serial": {
        "name": "USB to TTL Serial Cable",
        "img": "images/usb2ttl.jpg",
        "url": "https://www.adafruit.com/product/954",
        "desc": "A USB to TTL serial converter cable to provide connectivity between USB and serial UART interfaces on your Pi."
    },
    "uart_gpio": {
        "name": "UART GPIO pins",
        "img": "images/UART GPIO pins.png",
        "url": "images/UART GPIO pins.png",
        "desc": "A USB to TTL serial cable to connect to your Raspberry Pi's serial console port."
    },
    "putty": {
        "name": "PuTTY",
        "img": "images/Putty.png",
        "url": "https://www.putty.org/",
        "desc": "PuTTY is a free and open-source terminal emulator, serial console and network file transfer application."
    },
    "kali": {
        "name": "Kali Linux VM",
        "img": "images/kali-icon.png",
        "url": "https://www.kali.org/",
        "desc": "An open source Debian-derived Linux distribution designed for digital forensics and penetration testing."
    },
    "wget": {
        "name": "Wget Command",
        "img": "images/wget.png",
        "url": "https://www.gnu.org/software/wget/",
        "desc": "A software package used to retrieve contents from web servers using HTTP, HTTPS, FTP, and FTPS."
    },
    "binwalk": {
        "name": "Binwalk",
        "img": "images/binwalk.png",
        "url": "https://tools.kali.org/forensics/binwalk",
        "desc": "A tool for searching a given binary image for embedded files and executable code. Designed for identifying files and code embedded inside of firmware images."
    },
    "sudo": {
        "name": "Sudo",
        "img": "images/sudo.png",
        "url": "https://www.sudo.ws/",
        "desc": "Allows a user to run commands with the security privileges of another user, by default the superuser."
    },
    "john": {
        "name": "John the Ripper",
        "img": "images/johntheripper1_design.png",
        "url": "https://www.openwall.com/john/",
        "desc": "A password cracking tool designed to detect weak passwords."
    },
    "ettercap": {
        "name": "Ettercap",
        "img": "images/ettercap.PNG",
        "url": "http://www.ettercap-project.org/",
        "desc": "A security tool used for man-in-the-middle attacks on a LAN."
    },
    "webbrowser": {
        "name": "webbrowser",
        "img": "images/webbrowser.jpg",
        "url": "https://www.mozilla.org/en-US/firefox/new/",
        "desc": "A web browser is a software application for accessing information on the World Wide Web."
    },
    "sqlmap": {
        "name": "SQLmap",
        "img": "images/sqlmap.png",
        "url": "http://sqlmap.org/",
        "desc": "sqlmap is an open source penetration testing tool that automates the process of detecting and exploiting SQL injection flaws and taking over of database servers."
    }
  };
  
  $scope.itemClicked = function(index){
    let url = $scope.currentTools[index].url;
    window.open(url,"__target")
  }

  $scope.currentTools = [];

  $rootScope.$on('ws:tools', function(event, msg) {

    // Reset tools array.

    $scope.currentTools = [];

    // Append mission tools to array.

    msg.tools.forEach(function(tool){
      $scope.currentTools.push($scope.tools[tool]);
    });

    $scope.$digest();

  });
  
}

//------------------------------------------------------------------------------//
// Component
//------------------------------------------------------------------------------//

angular.module('gameApp').component('tools', {
  templateUrl: 'student/components/tools/tools.html',
  controller:   Controller
});

//------------------------------------------------------------------------------//