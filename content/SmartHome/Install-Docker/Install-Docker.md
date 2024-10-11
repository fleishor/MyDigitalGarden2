---
date: 2021-12-28 11:50:19
title: Installation Docker
image: Docker.png
description: Installation steps for Docker on Raspberry Pi 4
tags: 
- Docker
- Raspberry Pi
---

## Installation Guides

<https://docs.docker.com/engine/install/debian/>
<https://www.antary.de/2021/09/20/raspberry-pi-docker-und-portainer/>

## Update Raspi to latest versions

~~~bash
sudo apt update
sudo apt upgrade
sudo rpi-update
sudo reboot
~~~

## Install Docker

And here we have to possible ways

- use the installation script (I will do it next time)
- install packages manually

### Use Installation script

~~~bash
curl -sSL https://get.docker.com | sh
~~~

### Install necessary packages

~~~bash
sudo apt-get install \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

curl -fsSL https://download.docker.com/linux/debian/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

echo \
  "deb [arch=arm64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/debian \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
~~~

### Install docker packages

~~~bash
sudo apt update

sudo apt install docker-ce docker-ce-cli containerd.io
~~~

## Create group and add current user to group

~~~bash
sudo groupadd docker

sudo usermod -aG docker $USER
~~~
