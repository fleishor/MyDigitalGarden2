---
date: 2021-12-28 14:54:05
title: Installation Grafana with Docker
description: Installation steps for Grafana with Docker
tags: 
- Docker
- Grafana
- SmartHome
---

# Create new user grafana

~~~bash
sudo useradd -m grafana
~~~

# Add user grafana to docker group

~~~bash
sudo usermod -aG docker grafana
~~~

# Login as user grafana

~~~bash
sudo -u grafana -i
~~~

# Get uid and gid for user grafana

~~~bash
grafana@docker:~ $ id
uid=1004(grafana) gid=1004(grafana) groups=1004(grafana),995(docker)
~~~

# Create directories for Grafana

~~~bash
mkdir var_lib
~~~

# docker-compose.yaml file

~~~bash
version: "3.5"

services:
  grafana8:
    image: grafana/grafana:latest
    container_name: grafana
    user: 1004:995
    volumes:
      - /home/grafana/var_lib:/var/lib/grafana:rw
    ports:
      - "3000:3000"
    restart: always
    networks:
        - influxdb2
        
networks:
    influxdb2:
        external: true
        name: "influxdb2"
~~~
