---
date: 2022-02-11
title: Install-Telegraf-on-RaspberryPi
image: Telegraf.png
description: Installation steps for Telegraf on RaspberryPi without Docker
tags:
- Raspberry Pi
- SmartHome
---

## References

<https://docs.influxdata.com/telegraf/v1.21/introduction/installation/>

## Add InfluxDB repository

~~~bash
wget -qO- <https://repos.influxdata.com/influxdb.key> | sudo tee /etc/apt/trusted.gpg.d/influxdb.asc >/dev/null
source /etc/os-release
echo "deb <https://repos.influxdata.com/${ID>} ${VERSION_CODENAME} stable" | sudo tee /etc/apt/sources.list.d/influxdb.list
~~~

## Install Telegraf

~~~bash
sudo apt-get update && sudo apt-get install telegraf
~~~

## Add runtimeDirectory to Telegraf service file

~~~ini
[Unit]
Description=The plugin-driven server agent for reporting metrics into InfluxDB
Documentation=<https://github.com/influxdata/telegraf>
After=network.target

[Service]
EnvironmentFile=-/etc/default/telegraf
User=telegraf
ExecStart=/usr/bin/telegraf -config /etc/telegraf/telegraf.conf -config-directory /etc/telegraf/telegraf.d $TELEGRAF_OPTS
ExecReload=/bin/kill -HUP $MAINPID
Restart=on-failure
RestartForceExitStatus=SIGPIPE
KillMode=control-group
RuntimeDirectory=telegraf

[Install]
WantedBy=multi-user.target
~~~

## Telegraf config file

~~~ini
[global_tags]
[agent]
  interval = "60s"
  round_interval = true
  metric_batch_size = 1000
  metric_buffer_limit = 10000
  collection_jitter = "0s"
  flush_interval = "60s"
  flush_jitter = "0s"
  precision = ""
  hostname = "homematic.fritz.box"
  omit_hostname = false

###############################################################################
#                            OUTPUT PLUGINS                                   #
###############################################################################
[[outputs.influxdb_v2]]
urls = ["http://docker.fritz.box:8086"]
token = "***"
organization = "fleishor"
bucket = "fleishor"

###############################################################################
#                            INPUT PLUGINS                                    #
###############################################################################
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

[[inputs.socket_listener]]
  service_address = "unix:////var/run/telegraf/unixsock"
  socket_mode = "777"
~~~
