---
date: 2021-12-28
title: Forward all AVM statistics to Telegraf and to InfluxDB2
description: Create a Docker image which fetch statistics from FritzBox and send them to Telegraf and to InfluxDB2
tags: 
- Docker
- Telegraf
- FritzBox
- SmartHome
---

## References

- <https://github.com/Schmidsfeld/TelegrafFritzBox>
- <https://github.com/kbr/fritzconnection>
- <https://fritzconnection.readthedocs.io/en/1.13.2/>
- <https://avm.de/service/schnittstellen/>

## Create new user fritzbox

~~~bash
sudo useradd -m fritzbox
~~~

## Add user fritzbox to docker group

~~~bash
sudo usermod -aG docker fritzbox
~~~

## Login as user fritzbox

~~~bash
sudo -u fritzbox -i
~~~

## Get uid and gid for user fritzbox

~~~bash
fritzbox@docker:~ $ id
uid=1005(fritzbox) gid=1005(fritzbox) groups=1005(fritzbox),995(docker)
~~~

## Install required packages

~~~bash
apt install python3-pip
pip3 install fritzconnection
~~~

## crontab
<!-- https://raw.githubusercontent.com/fleishor/MyDevelopment/master/fritzbox2telegraf/crontab -->
~~~crontab
*/5 * * * * /home/fritzbox/telegrafFritzBox.sh
~~~

## telegrafFritzBox.sh

<!-- https://raw.githubusercontent.com/fleishor/MyDevelopment/master/fritzbox2telegraf/telegrafFritzBox.sh -->
~~~bash
#!/bin/sh
export PATH=${PATH}:/home/fritzbox/.local/bin
python3 /home/fritzbox/telegrafFritzBox.4040.py -u ${BUERO_USERNAME} -p ${BUERO_PASSWORD} -i ${BUERO_ADDRESS} | nc -q 1 ${TELEGRAF_HOSTNAME} ${TELEGRAF_PORT}
python3 /home/fritzbox/telegrafFritzBox.7490.py -u ${ROUTER_USERNAME} -p ${ROUTER_PASSWORD} -i ${ROUTER_ADDRESS} | nc -q 1 ${TELEGRAF_HOSTNAME} ${TELEGRAF_PORT}
python3 /home/fritzbox/telegrafFritzBox.SmartHome.py -u ${ROUTER_USERNAME} -p ${ROUTER_PASSWORD} -i ${ROUTER_ADDRESS} | nc -q 1 ${TELEGRAF_HOSTNAME} ${TELEGRAF_PORT}
~~~

## Dockerfile

<!-- https://raw.githubusercontent.com/fleishor/MyDevelopment/master/fritzbox2telegraf/Dockerfile -->
~~~dockerfile
FROM alpine:latest

#install python3
RUN apk add python3 py3-pip netcat-openbsd sudo busybox-suid

RUN addgroup -g 995 -S fritzbox && \
    adduser -h "/home/fritzbox" -S -G fritzbox -u 1005 fritzbox && \
    echo "fritzbox ALL=(ALL) NOPASSWD: ALL" > /etc/sudoers.d/fritzbox \
        && chmod 0440 /etc/sudoers.d/fritzbox

USER fritzbox

WORKDIR /home/fritzbox

RUN pip3 install fritzconnection ping3 --break-system-packages
COPY --chown=fritzbox:fritzbox ./telegrafFritzBox.4040.py .
COPY --chown=fritzbox:fritzbox ./telegrafFritzBox.7490.py .
COPY --chown=fritzbox:fritzbox ./telegrafFritzBox.SmartHome.py .
COPY --chown=fritzbox:fritzbox ./telegrafFritzBox.sh .
RUN chmod +x ./telegrafFritzBox.sh

# Configure cron
COPY crontab /etc/cron/crontab

# Init cron
RUN crontab /etc/cron/crontab

CMD ["sudo", "-E", "crond", "-f"]
~~~

## Build docker image

~~~bash
docker image build -t fritzbox:20240621 .
~~~

## docker-compose.yaml file

<!-- https://raw.githubusercontent.com/fleishor/MyDevelopment/master/fritzbox2telegraf/docker-compose.yml -->
~~~yaml
version: "3.5"

services:
  fritzbox:
    image: fritzbox:20240621
    container_name: fritzbox
    user: 1005:995
    environment:
      - ROUTER_ADDRESS=192.168.178.1
      - ROUTER_USERNAME=telegraf
      - ROUTER_PASSWORD=${ROUTER_PASSWORD}
      - BUERO_ADDRESS=192.168.178.2
      - BUERO_USERNAME=telegraf
      - BUERO_PASSWORD=${BUERO_PASSWORD}
      - TELEGRAF_HOSTNAME=telegraf
      - TELEGRAF_PORT=8094
    restart: always
    networks:
        - smarthome
        
networks:
    smarthome:
        external: true
        name: "smarthome"
~~~

## Configuration of Telegraf

With ```namedrop``` and ```namepass``` it's possible to redirect messages to different buckets.

~~~
...
[[outputs.influxdb_v2]]
  urls = ["http://influxdb2:8086"]
  token = "***"
  organization = "fleishor"
  bucket = "Docker"
  namedrop = ["NetgearWohnzimmer", "NetgearKeller", "Buero", "Router"]

...

[[outputs.influxdb_v2]]
  urls = ["http://influxdb2:8086"]
  token = "***"
  organization = "fleishor"
  bucket = "Fritzbox"
  namepass = ["Buero", "Router"]

[[inputs.socket_listener]]
  service_address = "tcp://:8094"
  data_format = "influx"
~~~
