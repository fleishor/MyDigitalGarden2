---
date: 2021-12-29 08:55:18
title: Installation Promtail with Docker
description: Installation steps for Promtail with Docker
tags: 
- Docker
- Promtail
- SmartHome
---

# Create new user promtail

~~~bash
sudo useradd -m promtail
~~~

# Add user promtail to docker group

~~~bash
sudo usermod -aG docker promtail
~~~

# Login as user promtail

~~~bash
sudo -u promtail -i
~~~

# Create directories for promtail

~~~bash
mkdir etc_promtail
~~~

# docker-compose.yaml file

~~~yaml
version: "3.5"

services:
   promtail:
      image: grafana/promtail:latest
      pid: "host"
      container_name: promtail
      command: -config.file=/etc/promtail/promtail.yaml
      volumes:
         - /run/log/journal:/run/log/journal:ro
         - /var/lib/docker/containers:/var/lib/docker/containers:ro
         - ./etc_promtail/promtail.yaml:/etc/promtail/promtail.yaml
      restart: always
      networks:
         - smarthome

networks:
  influxdb2:
    external: true
    name: "smarthome"
~~~

# Gather journald logs and Docker container logs

![[SmartHome/Docker/Install-Promtail-with-Docker/overview.svg]]
# /etc/docker/daemon.json

<https://docs.docker.com/config/containers/logging/log_tags/>

Add tag log option so ImageName and Name will be written to Docker log files;
new tag flag will be only add after containers are recreated

~~~json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3",
    "tag": "{{.ImageName}}|{{.Name}}"
  }
}
~~~

Example log line

~~~json
{
   "log":"t=2021-12-30T10:38:14+0000 lvl=info msg=\"Successful Login\" logger=http.server User=admin@localhost\n",
   "stream":"stdout",
   "attrs":
   {
      "tag":"grafana/grafana:latest|grafana"
   },
   "time":"2021-12-30T10:38:14.566975699Z"
}
~~~

# /etc/promtail/promtail.yaml

Promtail configuration for sending

- systemd journal messages (job_name: journal) and
- container logs (job_name: container) to Loki

Path /run/log/journal and /var/lib/docker/containers/*/*log from host system
must be also mounted to docker container (see docker-compose.yaml)

~~~yaml
server:
  http_listen_address: 0.0.0.0
  http_listen_port: 9080

positions:
  filename: /tmp/positions.yaml

clients:
  - url: http://loki:3100/loki/api/v1/push

scrape_configs:
- job_name: journal
  journal:
    json: false
    max_age: 12h
    path: /run/log/journal
    labels:
      job: systemd-journal
      host: docker.fritz.box
  relabel_configs:
    - source_labels: ['__journal__systemd_unit']
      target_label: 'unit'
- job_name: containers
  static_configs:
  - targets:
      - localhost
    labels:
      job: containerlogs
      host: docker.fritz.box
      __path__: /var/lib/docker/containers/*/*log

  pipeline_stages:
  - json:
      expressions:
        output: log
        stream: stream
        attrs:
        log:
  - json:
      expressions:
        tag:
      source: attrs
  - regex:
      expression: (?P<image_name>(?:[^|]*[^|])).(?P<container_name>(?:[^|]*[^|]))
      source: tag
  - regex:
      expression: '.*lvl=(?P<level>[a-zA-Z]+).*'
      source: log
  - regex:
      expression: '.*level=(?P<level>[a-zA-Z]+).*'
      source: log
  - timestamp:
      format: RFC3339Nano
      source: time
  - labels:
      stream:
      image_name:
      container_name:
      level:
  - output:
      source: output
~~~

Pipeline stages

![Pipeline stages](container_pipeline_stages.svg "Pipeline stages")
