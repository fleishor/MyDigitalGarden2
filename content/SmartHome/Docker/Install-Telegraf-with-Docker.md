---
date: 2021-12-28
title: Installation Telegraf with Docker
description: Installation steps for Telegraf with Docker
tags: 
- Docker
- Telegraf
- SmartHome
---

## Create new user telegraf

~~~bash
sudo useradd -m telegraf
~~~

## Add user telegraf to docker group

~~~bash
sudo usermod -aG docker telegraf
~~~

## Login as user telegraf

~~~bash
sudo -u telegraf -i
~~~

## Get uid and gid for user telegraf

~~~bash
telegraf@docker:~ $ id
uid=1003(telegraf) gid=1003(telegraf) groups=1003(telegraf),995(docker)
~~~

## Create directories for telegraf

~~~bash
mkdir etc_telegraf
~~~

### docker-compose.yaml

~~~yaml
version: "3.5"

services:
  telegraf:
    image: telegraf:latest
    pid: "host"
    container_name: telegraf
    user: 1003:995
    ports:
      - "8094:8094"
      - "8125:8125"
    volumes:
      - /home/telegraf/etc_telegraf/telegraf.conf:/etc/telegraf/telegraf.conf:ro
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - /sys:/host/sys:ro
      - /proc:/host/proc:ro
      - /etc:/host/etc:ro
    environment:
      - HOST_PROC=/host/proc
      - HOST_SYS=/host/sys
      - HOST_ETC=/host/etc
    restart: always
    networks:
      - influxdb2

networks:
  influxdb2:
    external: true
    name: "influxdb2"
~~~

## telegraf.conf

~~~ini
# Telegraf Configuration
#
# Global tags can be specified here in key="value" format.
[global_tags]

# Configuration for telegraf agent
[agent]
  interval = "10s"
  round_interval = true
  metric_batch_size = 1000
  metric_buffer_limit = 10000
  collection_jitter = "0s"
  flush_interval = "60s"
  flush_jitter = "0s"
  precision = ""
  hostname = "docker.fritz.box"
  omit_hostname = false

[[outputs.influxdb_v2]]
urls = ["http://influxdb2:8086"]
token = "***"
organization = "fleishor"
bucket = "fleishor"

[[inputs.cpu]]
  percpu = true
  totalcpu = true
  collect_cpu_time = false
  report_active = false

[[inputs.disk]]
  ignore_fs = ["tmpfs", "devtmpfs", "devfs", "iso9660", "overlay", "aufs", "squashfs"]

[[inputs.diskio]]

[[inputs.kernel]]

[[inputs.mem]]

[[inputs.processes]]

[[inputs.swap]]

[[inputs.system]]

[[inputs.docker]]
container_names = []
container_name_include = []
perdevice = false
perdevice_include = []
total = true
total_include = ["cpu", "blkio", "network"]

[[inputs.socket_listener]]
service_address = "tcp://:8094"
data_format = "influx"
~~~
