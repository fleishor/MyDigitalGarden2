---
date: 2021-12-28 13:46:22
title: Installation InfluxDB 2.x with Docker
description: Installation steps for InfluxDB 2.x with Docker
tags: 
- Docker
- InfluxDB
- SmartHome
---

## Create new user influxdb2

~~~bash
sudo useradd -m influxdb2
~~~

## Add user influxdb2 to docker group

~~~bash
sudo usermod -aG docker influxdb2
~~~

## Login as user influxdb2

~~~bash
sudo -u influxdb2 -i
~~~

## Get uid and gid for user influxdb2

~~~bash
influxdb2@docker:~ $ id
uid=1002(influxdb2) gid=1002(influxdb2) groups=1002(influxdb2),995(docker)
~~~

## Create directories for influxdb2

~~~bash
influxdb2@docker:~ $ mkdir etc_influxdb2
influxdb2@docker:~ $ mkdir var_lib_influxdb2

drwxr-xr-x 2 influxdb2 influxdb2 4096 Jul  6 08:08 etc_influxdb2
drwxr-xr-x 2 influxdb2 influxdb2 4096 Jul  6 08:08 var_lib_influxdb2
~~~

## docker-compose.yaml file

- with long syntax for volumes
- create a new bridge network for influxdb2 and related containers

~~~yaml
version: "3.5"

services:
  influxdb2:
    image: influxdb:latest
    container_name: influxdb2
    ports:
      - "8086:8086"
    volumes:
      - type: bind
        source: /home/influxdb2/var_lib_influxdb2
        target: /var/lib/influxdb2
      - type: bind
        source: /home/influxdb2/etc_influxdb2
        target: /etc/influxdb2
    environment:
      - DOCKER_INFLUXDB_INIT_MODE=setup
      - DOCKER_INFLUXDB_INIT_USERNAME=fleishor
      - DOCKER_INFLUXDB_INIT_PASSWORD=***
      - DOCKER_INFLUXDB_INIT_ORG=fleishor
      - DOCKER_INFLUXDB_INIT_BUCKET=fleishor
      - DOCKER_INFLUXDB_INIT_RETENTION=90d
      - DOCKER_INFLUXDB_INIT_ADMIN_TOKEN=***
    restart: always
    networks:
      - influxdb2

networks:
  influxdb2:
    name: "influxdb2"
    driver: "bridge"
~~~
