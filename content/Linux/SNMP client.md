---
date: 2024-04-29
title: SNMP client
image: LinuxCommandLine.png
description: Query SNMP values with snmpget and snmpwalk
tags: 
- Linux
---

## SNMP client

### Installation

~~~bash
> sudo apt install snmp
~~~

### snmpget

~~~bash
pi@docker:~ $ snmpget -v2c -c geheim 192.168.178.4 SNMPv2-MIB::sysName.0
SNMPv2-MIB::sysName.0 = STRING: NetgearWohnzimmer
pi@docker:~ $
~~~

### snmptable

~~~bash
pi@docker:~ $ snmptable -v2c -c geheim 192.168.178.4 IF-MIB::ifXTable
SNMP table: IF-MIB::ifXTable

ifName               ifHCInOctets ifHCOutOctets 
GigabitEthernet1     234679312    451727834
GigabitEthernet2     62873258     176562137
GigabitEthernet3     310072382    189007549
GigabitEthernet4     0            0
GigabitEthernet5     0            0
GigabitEthernet6     0            0
GigabitEthernet7     0            0
GigabitEthernet8     0            0
pi@docker:~ $

~~~

### snmpwalk

~~~bash
pi@docker:~ $ snmpwalk -v2c -c geheim 192.168.178.4 IF-MIB::ifXTable
IF-MIB::ifName.1 = STRING: GigabitEthernet1
IF-MIB::ifName.2 = STRING: GigabitEthernet2
IF-MIB::ifName.3 = STRING: GigabitEthernet3
IF-MIB::ifName.4 = STRING: GigabitEthernet4
IF-MIB::ifName.5 = STRING: GigabitEthernet5
IF-MIB::ifName.6 = STRING: GigabitEthernet6
IF-MIB::ifName.7 = STRING: GigabitEthernet7
IF-MIB::ifName.8 = STRING: GigabitEthernet8
IF-MIB::ifName.1000 = STRING: LAG1
IF-MIB::ifName.1001 = STRING: LAG2
IF-MIB::ifName.1002 = STRING: LAG3
IF-MIB::ifName.1003 = STRING: LAG4
IF-MIB::ifName.1004 = STRING: LAG5
IF-MIB::ifName.1005 = STRING: LAG6
IF-MIB::ifName.1006 = STRING: LAG7
IF-MIB::ifName.1007 = STRING: LAG8
IF-MIB::ifName.10000 = STRING: CPU
IF-MIB::ifInMulticastPkts.1 = Counter32: 260607
IF-MIB::ifInMulticastPkts.2 = Counter32: 22014
IF-MIB::ifInMulticastPkts.3 = Counter32: 26716
IF-MIB::ifInMulticastPkts.4 = Counter32: 0
...
~~~
