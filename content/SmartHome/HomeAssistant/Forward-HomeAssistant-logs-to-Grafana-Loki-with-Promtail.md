---
date: 2024-07-10
title: 
image: LinuxCommandLine.png
description: 
tags:
  - SmartHome
  - Loki
  - HomeAssistant
---

## Add bluemaex to Addon-on Repositories

![[Add-bluemaex-to-Addon-on-Repositories.png]]

## Install Grafana Loki addon

![[Install-Grafana-Loki-addon.png]]

## YAML configuration

~~~yaml
log_level: info
client:
  url: http://docker.fritz.box:3100/loki/api/v1/push
additional_scrape_configs: /config/local-journal-scrape-config.yaml
skip_local_journal_scrape_config: true
~~~

## /config/local-journal-scrape-config.yaml

~~~yaml
- job_name: journal
  journal:
    json: false
    max_age: 12h
    labels:
      job: systemd-journal
      host: homeassistanterdgeschoss.fritz.box
    path: "${JOURNAL_PATH}"
  relabel_configs:
    - source_labels:
        - __journal__systemd_unit
      target_label: unit
    - source_labels:
        - __journal_syslog_identifier
      target_label: syslog_identifier
    - source_labels:
        - __journal_container_name
      target_label: container_name
  pipeline_stages:
    - match:
        selector: '{container_name=~"homeassistant|hassio_supervisor"}'
        stages:
          - multiline:
              firstline: '^\x{001b}'
~~~

## Logs in Grafana Loki

![[Logs-in-Grafana-Loki.png]]