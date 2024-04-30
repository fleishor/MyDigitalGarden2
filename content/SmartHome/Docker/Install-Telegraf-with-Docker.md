---
date: 2021-12-28 14:32:45
title: Installation Telegraf with Docker
description: Installation steps for Telegraf with Docker with SNMP support
tags: 
- Docker
- Telegraf
- SmartHome
---

# Create new user telegraf

~~~bash
sudo useradd -m telegraf
~~~

# Add user telegraf to docker group

~~~bash
sudo usermod -aG docker telegraf
~~~

# Login as user telegraf

~~~bash
sudo -u telegraf -i
~~~

# Get uid and gid for user telegraf

~~~bash
telegraf@docker:~ $ id
uid=1003(telegraf) gid=1003(telegraf) groups=1003(telegraf),995(docker)
~~~

# Create directories for telegraf

~~~bash
mkdir etc_telegraf
~~~

# Add support for SNMP

## Enable SNMP support in Netgear

### Set System Name
![[SetSystemName.png]]

### Add Management Station IP to Netgear
![[AddManagementStationIP.png]]

## MIBS files

Download MIBS files from Netgear website and copy them to /usr/share/snmp/mibs

## Enable SNMP input plugin in telegraf

Because I want to store SNMP in a separate bucket in InfluxDB, `namedrop` setting must be added to `outputs.influxdb_v2` configuration:

~~~ini
[[outputs.influxdb_v2]]
  urls = ["http://influxdb2:8086"]
  token = "v_akXZrwkS42z9-14XIG3BNaV3AmJGllFEiehC_oZKhzSbJy_EMdnNbCs9jdXpSdSI8FS_HhNuCpMxYGwJqg8A=="
  organization = "fleishor"
  bucket = "Docker"
  namedrop = ["NetgearWohnzimmer", "NetgearKeller"]
~~~

Add second entry for influxdb_v2 for the `Snmp` bucket, `namepass` setting will only forward NetgearWohnzimmer und NetgearKeller to this bucket:

~~~ini
[[outputs.influxdb_v2]]
  urls = ["http://influxdb2:8086"]
  token = "v_akXZrwkS42z9-14XIG3BNaV3AmJGllFEiehC_oZKhzSbJy_EMdnNbCs9jdXpSdSI8FS_HhNuCpMxYGwJqg8A=="
  organization = "fleishor"
  bucket = "Snmp"
  namepass = ["NetgearWohnzimmer","NetgearKeller"]
~~~

Configure SNMP input plugin; `name_override` is the name of the measurement in InfluxDB:

~~~ini
[[inputs.snmp]]
  agents = [ "netgearwohnzimmer.fritz.box:161" ]
  version = 2
  community = "geheim"
  name = "NetgearWohnzimmer"
  name_override = "NetgearWohnzimmer"

 [[inputs.snmp.field]]
    name = "hostname"
    oid = "SNMPv2-MIB::sysName.0"
    is_tag = true

  [[inputs.snmp.table]]
    name = "snmp"
    inherit_tags = [ "hostname" ]
    oid = "IF-MIB::ifXTable"

    [[inputs.snmp.table.field]]
      name = "ifName"
      oid = "IF-MIB::ifName"
      is_tag = true
~~~

And now we need the same for NetgearKeller:

~~~ini
[[inputs.snmp]]
  agents = [ "netgearkeller.fritz.box:161" ]
  version = 2
  community = "geheim"
  name = "NetgearKeller"
  name_override = "NetgearKeller"

 [[inputs.snmp.field]]
    name = "hostname"
    oid = "SNMPv2-MIB::sysName.0"
    is_tag = true

  [[inputs.snmp.table]]
    name = "snmp"
    inherit_tags = [ "hostname" ]
    oid = "IF-MIB::ifXTable"

    [[inputs.snmp.table.field]]
      name = "ifName"
      oid = "IF-MIB::ifName"
      is_tag = true
~~~

# Configuration files

## docker-compose.yaml

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
      - /usr/share/snmp/mibs:/usr/share/snmp/mibs:ro
    environment:
      - HOST_PROC=/host/proc
      - HOST_SYS=/host/sys
      - HOST_ETC=/host/etc
    restart: always
    networks:
      - smarthome

networks:
  influxdb2:
    external: true
    name: "smarthome"
~~~

## telegraf.conf

~~~ini
# Telegraf Configuration
#
# Global tags can be specified here in key="value" format.
[global_tags]

# Configuration for telegraf agent
[agent]
  interval = "60s"
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
  token = "v_akXZrwkS42z9-14XIG3BNaV3AmJGllFEiehC_oZKhzSbJy_EMdnNbCs9jdXpSdSI8FS_HhNuCpMxYGwJqg8A=="
  organization = "fleishor"
  bucket = "Docker"
  namedrop = ["NetgearWohnzimmer", "NetgearKeller"]

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
service_address = "tcp://:8094"
data_format = "influx"

[[inputs.file]]
  files = ["/sys/class/thermal/thermal_zone0/temp"]
  name_override = "cpu_temperature"
  data_format = "value"
  data_type = "integer"

[[outputs.influxdb_v2]]
  urls = ["http://influxdb2:8086"]
  token = "v_akXZrwkS42z9-14XIG3BNaV3AmJGllFEiehC_oZKhzSbJy_EMdnNbCs9jdXpSdSI8FS_HhNuCpMxYGwJqg8A=="
  organization = "fleishor"
  bucket = "Snmp"
  namepass = ["NetgearWohnzimmer","NetgearKeller"]

[[inputs.snmp]]
  agents = [ "netgearwohnzimmer.fritz.box:161" ]
  version = 2
  community = "geheim"
  name = "NetgearWohnzimmer"
  name_override = "NetgearWohnzimmer"

 [[inputs.snmp.field]]
    name = "hostname"
    oid = "SNMPv2-MIB::sysName.0"
    is_tag = true

  [[inputs.snmp.table]]
    name = "snmp"
    inherit_tags = [ "hostname" ]
    oid = "IF-MIB::ifXTable"

    [[inputs.snmp.table.field]]
      name = "ifName"
      oid = "IF-MIB::ifName"
      is_tag = true

[[inputs.snmp]]
  agents = [ "netgearkeller.fritz.box:161" ]
  version = 2
  community = "geheim"
  name = "NetgearKeller"
  name_override = "NetgearKeller"

 [[inputs.snmp.field]]
    name = "hostname"
    oid = "SNMPv2-MIB::sysName.0"
    is_tag = true

  [[inputs.snmp.table]]
    name = "snmp"
    inherit_tags = [ "hostname" ]
    oid = "IF-MIB::ifXTable"

    [[inputs.snmp.table.field]]
      name = "ifName"
      oid = "IF-MIB::ifName"
      is_tag = true
~~~

