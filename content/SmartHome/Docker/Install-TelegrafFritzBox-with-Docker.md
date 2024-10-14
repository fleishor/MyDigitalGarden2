---
date: 2021-12-28
title: Installation Telegraf-FritzBox with Docker
description: Create a Docker image which fetch statistics from FritzBox and send them to Telegraf
tags: 
- Docker
- Telegraf
- FritzBox
- SmartHome
---

## References

<https://github.com/Lexiv/TelegrafFritzBox>

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

## Clone git repository

~~~bash
git clone https://github.com/Lexiv/TelegrafFritzBox.git
~~~

## Install required packages

~~~bash
apt install python3-pip
pip3 install fritzconnection
~~~

## crontab

~~~crontab
*/5 * * * * /home/fritzbox/telegrafFritzBox.sh
~~~

## telegrafFritzBox.sh

~~~bash
#!/bin/sh
export PATH=${PATH}:/home/fritzbox/.local/bin
python3 /home/fritzbox/telegrafFritzBox.py -u ${FRITZ_USERNAME} -p ${FRITZ_PASSWORD} -i ${FRITZ_ADDRESS} | nc -q 1 ${TELEGRAF_HOSTNAME} ${TELEGRAF_PORT}
python3 /home/fritzbox/telegrafFritzSmartHome.py -u ${FRITZ_USERNAME} -p ${FRITZ_PASSWORD} -i ${FRITZ_ADDRESS} | nc -q 1 ${TELEGRAF_HOSTNAME} ${TELEGRAF_PORT}
~~~

## Dockerfile

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

RUN pip3 install fritzconnection
COPY --chown=fritzbox:fritzbox ./TelegrafFritzBox/telegrafFritzBox.py .
COPY --chown=fritzbox:fritzbox ./TelegrafFritzBox/telegrafFritzSmartHome.py .
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
docker image build -t fritzbox .
~~~

## docker-compose.yaml file

~~~bash
version: "3.5"

services:
  fritzbox:
    image: fritzbox:latest
    container_name: fritzbox
    user: 1005:995
    environment:
      - FRITZ_ADDRESS=192.168.178.1
      - FRITZ_USERNAME=collectd
      - FRITZ_PASSWORD=***
      - TELEGRAF_HOSTNAME=telegraf
      - TELEGRAF_PORT=8094
    restart: always
    networks:
        - influxdb2
        
networks:
    influxdb2:
        external: true
        name: "influxdb2"
~~~
