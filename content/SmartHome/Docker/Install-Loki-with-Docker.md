---
date: 2021-12-28 21:05:18
title: Installation Loki with Docker
description: Installation steps for Loki with Docker
tags: 
- Docker
- Loki
- SmartHome
---

# Create new user loki

~~~bash
sudo useradd -m loki
~~~

# Add user loki to docker group

~~~bash
sudo usermod -aG docker loki
~~~

# Login as user loki

~~~bash
sudo -u loki -i
~~~

# Get uid and gid for user loki

~~~bash
loki@docker:~ $ id
uid=1007(loki) gid=1007(loki) groups=1007(loki),995(docker)
~~~

# Create directories for loki

~~~bash
mkdir etc_loki
~~~

# docker-compose.yaml file

~~~yaml
version: "3.5"

services:
loki:
   image: grafana/loki:latest
    pid: "host"
    container_name: loki
    user: 1007:995
   volumes:
     - ./etc_loki/loki.yaml:/etc/loki/loki.yaml
   entrypoint:
     - /usr/bin/loki
     - -config.file=/etc/loki/loki.yaml
   ports:
     - "3100:3100"
    restart: always
    networks:
      - smarthome

networks:
  influxdb2:
    external: true
    name: "smarthome"
~~~
