---
date: 2022-01-11 20:03:05
title: Install Promtail on RaspberryPi (homematic.fritz.box)
image: Promtail.png
description: Installation steps for Promtail on RaspberryPi without Docker
tags: 
- Promtail
- SmartHome
---

## References

<https://sbcode.net/grafana/install-promtail-service/>
<https://grafana.com/docs/loki/latest/clients/promtail/troubleshooting/>
<https://regex101.com/>

## Download and install binary

~~~bash
cd /usr/local/bin
sudo curl -O -L "https://github.com/grafana/loki/releases/download/v2.4.1/promtail-linux-arm.zip"
sudo unzip "promtail-linux-arm.zip"
sudo chmod a+x "promtail-linux-arm
rm "promtail-linux-arm.zip"
~~~

## /etc/promtail/promtail.yml

~~~yaml
server:
  http_listen_address: 0.0.0.0
  http_listen_port: 9080

positions:
  filename: /home/pi/promtail/positions.yaml

clients:
  - url: http://docker.fritz.box:3100/loki/api/v1/push

scrape_configs:
   - job_name: system
     static_configs:
        - targets:
           - localhost
          labels:
             host: homematic.fritz.box
             job: varlogs
             __path__: /var/log/*.log
     pipeline_stages:
        - regex:
           expression: (?P<month>\S+)\s+(?P<date>[0-9]{1,2})\s+(?P<time>[0-9]+:[0-9]+:[0-9]+)\s+(?P<hostname>\S+)\s+(?P<daemon>\S+)(?P<pid>\[[0-9]+\]):\s+
        - labels:
           daemon:
~~~

## RegEx for parsing the syslogs

"P" is required
~~~
(?P<month>\S+)\s+(?P<date>[0-9]{1,2})\s+(?P<time>[0-9]+:[0-9]+:[0-9]+)\s+(?P<hostname>\S+)\s+(?P<daemon>\S+)(?P<pid>\[[0-9]+\]):\s+
~~~

## Test promtail configuration

~~~bash
echo "Jan  5 13:16:17 HomeMatic systemd[1]: Started Session 4858 of user pi." | promtail-linux-arm --stdin --dry-run --inspect --client.url  http://docker.fritz.box:3100/loki/api/v1/push --config.file /etc/promtail/promtail.yml
~~~

## Create promtail service user

~~~bash
sudo useradd --system promtail
usermod -a -G adm promtail
~~~

## /etc/systemd/system/promtail.service

~~~bash
[Unit]
Description=Promtail service
After=network.target

[Service]
Type=simple
User=promtail
ExecStart=/usr/local/bin/promtail-linux-arm -config.file /etc/promtail/promtail.yml

[Install]
WantedBy=multi-user.target
~~~

## Start promtail service

~~~bash
sudo systemctl start promtail.service
sudo systemctl enable promtail.service
sudo systemctl status promtail.service
~~~
