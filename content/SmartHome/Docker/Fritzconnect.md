---
date: 2024-05-17
title: Command line tools of fritzconnect
image: avm.png
description: Python-Interface/commandline tools to communicate with the AVM Fritz!Box. This Python-Interface is used by Fritzbox2Telegraf
tags:
  - Linux
  - FritzBox
---

## Fritzconnect

### References

- <https://avm.de/service/schnittstellen/>
- <https://fritzconnection.readthedocs.io/en/1.13.2/>
- <https://github.com/kbr/fritzconnection>
- <https://github.com/Schmidsfeld/TelegrafFritzBox>

### Installation

~~~bash
fritzbox@docker:~$ pip3 install fritzconnection
~~~

### Service discovery

~~~
fritzbox@docker:~ $ fritzconnection -s -i 192.168.178.1

fritzconnection v1.13.2
FRITZ!Box 7490 at http://192.168.178.1
FRITZ!OS: 7.57

Servicenames:
                    any1
                    WANCommonIFC1
                    WANDSLLinkC1
                    WANIPConn1
                    WANIPv6Firewall1
                    DeviceInfo1
                    DeviceConfig1
                    Layer3Forwarding1
                    LANConfigSecurity1
                    ManagementServer1
                    Time1
                    UserInterface1
                    X_AVM-DE_Storage1
                    X_AVM-DE_WebDAVClient1
                    X_AVM-DE_UPnP1
                    X_AVM-DE_Speedtest1
                    X_AVM-DE_RemoteAccess1
                    X_AVM-DE_MyFritz1
                    X_VoIP1
                    X_AVM-DE_OnTel1
                    X_AVM-DE_Dect1
                    X_AVM-DE_TAM1
                    X_AVM-DE_AppSetup1
                    X_AVM-DE_Homeauto1
                    X_AVM-DE_Homeplug1
                    X_AVM-DE_Filelinks1
                    X_AVM-DE_Auth1
                    X_AVM-DE_HostFilter1
                    X_AVM-DE_USPController1
                    WLANConfiguration1
                    WLANConfiguration2
                    WLANConfiguration3
                    Hosts1
                    LANEthernetInterfaceConfig1
                    LANHostConfigManagement1
                    WANCommonInterfaceConfig1
                    WANDSLInterfaceConfig1
                    X_AVM-DE_WANMobileConnection1
                    WANDSLLinkConfig1
                    WANEthernetLinkConfig1
                    WANPPPConnection1
                    WANIPConnection1

fritzbox@docker:~ $
~~~

### Get list of actions offered by a service

~~~
fritzbox@docker:~ $ fritzconnection -i 192.168.178.1 -S LANEthernetInterfaceConfig1

fritzconnection v1.13.2
FRITZ!Box 7490 at http://192.168.178.1
FRITZ!OS: 7.57


Servicename:        LANEthernetInterfaceConfig1
Actionnames:
                    SetEnable
                    GetInfo
                    GetStatistics

fritzbox@docker:~ $
~~~

### Inspect Action

~~~
fritzbox@docker:~ $ fritzconnection -i 192.168.178.1 -A LANEthernetInterfaceConfig1 GetInfo

fritzconnection v1.13.2
FRITZ!Box 7490 at http://192.168.178.1
FRITZ!OS: 7.57


Service:            LANEthernetInterfaceConfig1
Action:             GetInfo
Parameters:

    Name                                  direction     data type

    NewEnable                                out ->     boolean
    NewStatus                                out ->     string
    NewMACAddress                            out ->     string
    NewMaxBitRate                            out ->     string
    NewDuplexMode                            out ->     string

fritzbox@docker:~ $
~~~

### Tool fritzstatus

~~~
fritzbox@docker:~ $ fritzstatus -i 192.168.178.1

fritzconnection v1.13.2
FRITZ!Box 7490 at http://192.168.178.1
FRITZ!OS: 7.57

FritzStatus:

    is linked             : True
    is connected          : True
    external ip (v4)      : 109.199.164.81
    external ip (v6)      : ::
    internal ipv6-prefix  : ::
    uptime                : 15:56:10
    bytes send            : 53531425479
    bytes received        : 626125259214
    max. bit rate         : ('5.5 MBit/s', '33.0 MBit/s')

fritzbox@docker:~ $
~~~

### Tool fritzwlan

~~~
fritzbox@docker:~/.local/bin $ fritzwlan -i 192.168.178.1 -u {user} -p {password}

fritzconnection v1.13.2
FRITZ!Box 7490 at http://192.168.178.1
FRITZ!OS: 7.57

Hosts registered at WLANConfiguration1:
WLAN name: router.fleishor
channel  : 1
index  active                 mac                ip  signal   speed
    0       1   38:37:8B:A2:28:DD    192.168.178.57      55      70
    1       1   C8:C2:FA:9B:10:0C    192.168.178.34      51      72
    2       1   00:22:61:FC:A2:D2    192.168.178.45      32      60
    3       1   4C:79:75:1C:36:D9    192.168.178.35      55     142
    4       1   48:55:19:C9:0E:B7    192.168.178.65      29      19
    5       1   B8:8C:29:CC:B8:46    192.168.178.51      83      72

Hosts registered at WLANConfiguration2:
WLAN name: router.fleishor
channel  : 36
index  active                 mac                ip  signal   speed
    0       1   4C:6B:E8:D5:71:23    192.168.178.42      32     263

fritzbox@docker:~/.local/bin $
~~~

### Tool fritzhosts

~~~
fritzbox@docker:~/.local/bin $ fritzhosts -i 192.168.178.1 -u {user} -p {password}

fritzconnection v1.13.2
FRITZ!Box 7490 at http://192.168.178.1
FRITZ!OS: 7.57

FritzHosts:
List of registered hosts:

  n: ip               name                         mac                 status

  1: 192.168.178.41   AVM1220-b82f993              98:9B:CB:82:F9:93   active
  2: 192.168.178.40   AVM1220Heizungskeller        98:9B:CB:82:F9:34   active
...
  7: 192.168.178.19   Docker                       E4:5F:01:20:16:A5   active
  8: 192.168.178.52   Grundig                      00:11:E1:4F:FF:8D   -
  9: 192.168.178.34   HUAWEI-Mate-20-lite-82a27    C8:C2:FA:9B:10:0C   active
...
 12: 192.168.178.57   HuaweiP10                    38:37:8B:A2:28:DD   active
...
 24: 192.168.178.44   desktop                      F4:4D:30:01:23:06   -
...
 30: 192.168.178.20   openmediavault               DC:A6:32:B7:D4:7A   -


fritzbox@docker:~/.local/bin $
~~~

### Tool fritzhomeauto

~~~
fritzbox@docker:~/.local/bin $ fritzhomeauto -i 192.168.178.1 -u {user} -p {password}

fritzconnection v1.13.2
FRITZ!Box 7490 at http://192.168.178.1
FRITZ!OS: 7.57

FritzHomeautomation:
Status of registered home-automation devices:

Device Name             AIN                 Power[W]   t[°C]   switch
iPhone2020              'xxx'                  0.000     0.0   off
OpenMediaVault          'xxx'                  0.000    24.0   off
Buero                   'xxx'                107.350    20.0   on
Gefriertruhe            'xxx'                  1.390    20.0   on
Kueche                  'xxx'                  0.330    23.5   on
~~~
