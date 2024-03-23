---
date: 2022-01-11 19:03:05
title: Install NodeRed on RaspberryPi (homematic.fritz.box)
image: NodeRed.png
description: Installation steps for NodeRed on RaspberryPi without Docker
tags: 
- NodeRed
- SmartHome
---

## References

<https://www.golinuxcloud.com/install-nodejs-and-npm-on-raspberry-pi/>
<https://nodered.org/docs/getting-started/raspberrypi>

## Enable NodeSource Repository

~~~bash
sudo su
curl -fsSL https://deb.nodesource.com/setup_17.x | bash -
~~~

## Install NodeJS

~~~bash
sudo apt install nodejs
~~~

## Check NodeJS installation

~~~bash
pi@HomeMatic:/etc/promtail $ node --version
v17.3.0
pi@HomeMatic:/etc/promtail $ npm --version
8.3.0
~~~

## Install Node-RED

~~~bash
bash <(curl -sL https://raw.githubusercontent.com/node-red/linux-installers/master/deb/update-nodejs-and-nodered)
~~~

## Disable credentialSecret encryption

~~~bash
setting.json
   ...
   credentialSecret: false,
   ...
~~~
