---
date: 2022-01-30
title: Integrate Voltcraft SEM6000 (homematic.fritz.box)
image: Sem6000.png
description: Integrate Voltcraft SEM6000 
tags: 
- Raspberry Pi
- SEM6000
- SmartHome
---

## References

<https://github.com/Heckie75/voltcraft-sem-6000>
<https://git.geekify.de/sqozz/sem6000>

## Overview

![Overview](SmartHome/Homematic/Integrate-Voltcraft-Sem6000-on-RaspberryPi/overview.svg "Overview")

## Wohnzimmer.py

~~~python3
#!/usr/bin/env python3

import sys
import time
from sem6000 import SEMSocket

import bluepy

socket = None

i = 0
while i < 5:
    try:
        if socket == None:
            socket = SEMSocket('F0:C7:7F:0A:56:99')
            socket.login("0000")

        socket.getStatus()
        print("Sem6000,Socket=Wohnzimmer powered={}".format("1" if socket.powered else "0"))
        print("Sem6000,Socket=Wohnzimmer voltage={}".format(socket.voltage))
        print("Sem6000,Socket=Wohnzimmer current={}".format(socket.current))
        print("Sem6000,Socket=Wohnzimmer power={}".format(socket.power))
        break
    except SEMSocket.NotConnectedException as ex:
        print("SEMSocket.NotConnectedException: ", ex, file =sys.stderr)
        i += 1
        print("Restarting after 5s...", file = sys.stderr)
        time.sleep(5)
    except bluepy.btle.BTLEDisconnectError as ex:
        print("bluepy.btle.BTLEDisconnectError: ", ex, file =sys.stderr)
        i += 1
        print("Restarting after 5s...", file = sys.stderr)
        time.sleep(5)
    except BrokenPipeError as ex:
        print("BrokenPipeError:", ex, file =sys.stderr)
        i += 1
        print("Restarting after 5s...", file = sys.stderr)
        time.sleep(5)
    finally:
        if socket != None:
            socket.disconnect()
            socket = None
~~~

## Wohnzimmer.sh

~~~bash
#!/bin/bash
{ python3 Wohnzimmer.py 2>&3 | socat - UNIX-CLIENT:/var/run/telegraf/unixsock; } 3>&1 | logger -i --priority cron.error --tag sem6000-Wohnzimmer
~~~

Logger write the error messages to /var/log/cron.log:

~~~
Jan 30 19:30:09 HomeMatic sem6000-Wohnzimmer[28979]: bluepy.btle.BTLEDisconnectError:  Failed to connect to peripheral $
Jan 30 19:30:09 HomeMatic sem6000-Wohnzimmer[28979]: Restarting after 5s...
~~~

Promtail extracts "sem6000-Wohnzimmer" and sent it as label daemon to Loki

## crontab

~~~crontab
*/10 * * * * cd /home/pi/sem6000 && ./Wohnzimmer.sh
~~~

## telegraf.conf

~~~
[[inputs.socket_listener]]
  service_address = "unix:////var/run/telegraf/unixsock"
  socket_mode = "777"
~~~
