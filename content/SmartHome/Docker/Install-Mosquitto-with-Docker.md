---
date: 2022-12-28 14:54:05
title: Installation Mosquitto with Docker
description: Installation steps for Mosquitto with Docker
tags: 
- Docker
- MQTT
- SmartHome
---

# Create new user mosquitto

~~~bash
sudo useradd -m mosquitto
~~~

# Add user mosquitto to docker group

~~~bash
sudo usermod -aG docker mosquitto
~~~

# Login as user mosquitto

~~~bash
sudo -u mosquitto -i
~~~

# Get uid and gid for user mosquitto

~~~bash
mosquitto@docker:~ $ id
uid=1013(mosquitto) gid=1013(mosquitto) groups=1013(mosquitto),995(docker)
~~~

# Create directories for Mosquitto

~~~bash
mkdir mosquitto
~~~

# docker-compose.yaml file

~~~bash
version: "3.5"

services:
  mosquitto:
    image: eclipse-mosquitto:2.0.15
    container_name: mosquitto
    user: 1013:995
    volumes:
      - /home/mosquitto/mosquitto/config:/mosquitto/config:rw
      - /home/mosquitto/mosquitto/log:/mosquitto/log:rw
      - /home/mosquitto/mosquitto/data:/mosquitto/data:rw
    ports:
      - "1883:1883"
      - "9001:9001"
    restart: always
    networks:
        - influxdb2

networks:
    influxdb2:
        external: true
        name: "influxdb2"
~~~

# mosquitto.conf
~~~
allow_anonymous true
listener 1883
persistence true
persistence_location /mosquitto/data/
log_dest file /mosquitto/log/mosquitto.log
~~~
