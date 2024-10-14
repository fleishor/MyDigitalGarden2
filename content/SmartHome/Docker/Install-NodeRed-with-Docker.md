---
date: 2021-12-28
title: Installation NodeRed with Docker
description: Installation steps for NodeRed with Docker
tags: 
- Docker
- NodeRed
- SmartHome
---

## Create new user nodered

~~~bash
sudo useradd -m nodered
~~~

## Add user nodered to docker group

~~~bash
sudo usermod -aG docker nodered
~~~

## Login as user nodered

~~~bash
sudo -u nodered -i
~~~

## Get uid and gid for user nodered

~~~bash
nodered@docker:~ $ id
uid=1006(nodered) gid=1006(nodered) groups=1006(nodered),995(docker)
~~~

## Create directories for nodered

~~~bash
mkdir nodered_data
~~~

## docker-compose.yaml file

~~~bash
version: '3.5'

services:
  nodered:
    image: nodered/node-red:latest
    container_name: nodered
    environment:
      - TZ=Europe/Berlin
    user: 1006:995
    restart: always
    ports:
      - 1880:1880
    volumes:
      - /home/nodered/nodered_data:/data
    networks:
        - influxdb2
        
networks:
    influxdb2:
        external: true
        name: "influxdb2"
~~~
