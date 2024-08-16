---
date: 2024-06-05
title: 
image: LinuxCommandLine.png
description: 
tags: 
- Linux
---

## Commands

~~~
PS C:\Users\fleishor> Get-VMSwitch

Name           SwitchType NetAdapterInterfaceDescription
----           ---------- ------------------------------
Intern         Internal
Extern         External   DisplayLink Network Adapter NCM
Default Switch Internal
~~~

~~~
PS C:\Users\fleishor> Get-NetAdapter -includeHidden

Name                      InterfaceDescription                    ifIndex Status       MacAddress             LinkSpeed
----                      --------------------                    ------- ------       ----------             ---------
vEthernet (Default Switc… Hyper-V Virtual Ethernet Adapter             46 Up           00-15-5D-85-07-EF        10 Gbps
Ethernet (Docking)        Dell Giga Ethernet                           42 Up           9C-EB-E8-62-55-E8         1 Gbps
LAN-Verbindung* 11        WAN Miniport (Network Monitor)               40 Up                                      0 bps
vSwitch (VPN)             Hyper-V Virtual Switch Extension A...#3      38 Up                                    10 Gbps
LAN-Verbindung* 4         WAN Miniport (SSTP)                          35 Disconnected                            0 bps
Ethernet (Kerneldebugger) Microsoft Kernel Debug Network Adapter       33 Not Present                             0 bps
vEthernet (Intern)        Hyper-V Virtual Ethernet Adapter #3          32 Up           00-15-5D-B2-37-02        10 Gbps
LAN-Verbindung* 6         WAN Miniport (L2TP)                          31 Disconnected                            0 bps
LAN-Verbindung* 10        WAN Miniport (IPv6)                          30 Up                                      0 bps
WLAN                      Intel(R) Wi-Fi 6 AX201 160MHz                26 Disconnected 4C-79-6E-89-FD-E6          0 bps
Bluetooth-Netzwerkverbin… Bluetooth Device (Personal Area Networ…      25 Disconnected 4C-79-6E-89-FD-EA         3 Mbps
LAN-Verbindung* 9         WAN Miniport (IP)                            24 Up                                      0 bps
Teredo Tunneling Pseudo-…                                              23 Not Present                             0 bps
vSwitch (Default Switch)  Hyper-V Virtual Switch Extension Adapt…       3 Up                                    10 Gbps
vEthernet (Extern)        Hyper-V Virtual Ethernet Adapter #2          20 Up           9C-EB-E8-62-55-E8         1 Gbps
Ethernet 7                PANGP Virtual Ethernet Adapter Secure        19 Disabled     02-50-41-00-00-01         2 Gbps
LAN-Verbindung* 12        Microsoft Wi-Fi Direct Virtual Ada...#4      18 Disconnected 4E-79-6E-89-FD-E6          0 bps
LAN-Verbindung* 7         WAN Miniport (PPTP)                          16 Disconnected                            0 bps
LAN-Verbindung* 3         Microsoft Wi-Fi Direct Virtual Ada...#3      15 Disconnected 4C-79-6E-89-FD-E7          0 bps
LAN-Verbindung* 5         WAN Miniport (IKEv2)                         10 Disconnected                            0 bps
vSwitch (Extern)          Hyper-V Virtual Switch Extension A...#2       7 Up                                    10 Gbps
LAN-Verbindung* 8         WAN Miniport (PPPOE)                          6 Disconnected                            0 bps
Microsoft IP-HTTPS Platf…                                               5 Not Present                             0 bps
6to4 Adapter                                                            2 Not Present                             0 bps
~~~

~~~
PS C:\Users\fleishor> get-netipAddress -interfaceindex 46

IPAddress         : 192.168.96.1
InterfaceIndex    : 46
InterfaceAlias    : vEthernet (Default Switch)
AddressFamily     : IPv4
Type              : Unicast
PrefixLength      : 20
PrefixOrigin      : Manual
SuffixOrigin      : Manual
AddressState      : Preferred
ValidLifetime     : Infinite ([TimeSpan]::MaxValue)
PreferredLifetime : Infinite ([TimeSpan]::MaxValue)
SkipAsSource      : False
PolicyStore       : ActiveStore
~~~

~~~
PS C:\Users\fleishor> New-VMSwitch -SwitchName "MyHyperV NAT" -SwitchType Internal

Name         SwitchType NetAdapterInterfaceDescription
----         ---------- ------------------------------
MyHyperV NAT Internal

~~~

~~~
PS C:\Users\fleishor> Get-NetAdapter

Name                      InterfaceDescription                    ifIndex Status       MacAddress             LinkSpeed
----                      --------------------                    ------- ------       ----------             ---------
vEthernet (MyHyperV NAT)  Hyper-V Virtual Ethernet Adapter #4          79 Up           00-15-5D-B2-37-15        10 Gbps
Ethernet (Docking)        Dell Giga Ethernet                           42 Up           9C-EB-E8-62-55-E8         1 Gbps
vEthernet (Intern)        Hyper-V Virtual Ethernet Adapter #3          32 Up           00-15-5D-B2-37-02        10 Gbps
WLAN                      Intel(R) Wi-Fi 6 AX201 160MHz                26 Disconnected 4C-79-6E-89-FD-E6          0 bps
Bluetooth-Netzwerkverbin… Bluetooth Device (Personal Area Networ…      25 Disconnected 4C-79-6E-89-FD-EA         3 Mbps
vEthernet (Extern)        Hyper-V Virtual Ethernet Adapter #2          20 Up           9C-EB-E8-62-55-E8         1 Gbps
Ethernet 7                PANGP Virtual Ethernet Adapter Secure        19 Disabled     02-50-41-00-00-01         2 Gbps
~~~

~~~
PS C:\Users\fleishor> New-NetIPAddress -IPAddress 192.168.0.1 -PrefixLength 24 -InterfaceIndex 79

IPAddress         : 192.168.0.1
InterfaceIndex    : 79
InterfaceAlias    : vEthernet (MyHyperV NAT)
AddressFamily     : IPv4
Type              : Unicast
PrefixLength      : 24
PrefixOrigin      : Manual
SuffixOrigin      : Manual
AddressState      : Tentative
ValidLifetime     : Infinite ([TimeSpan]::MaxValue)
PreferredLifetime : Infinite ([TimeSpan]::MaxValue)
SkipAsSource      : False
PolicyStore       : ActiveStore

IPAddress         : 192.168.0.1
InterfaceIndex    : 79
InterfaceAlias    : vEthernet (MyHyperV NAT)
AddressFamily     : IPv4
Type              : Unicast
PrefixLength      : 24
PrefixOrigin      : Manual
SuffixOrigin      : Manual
AddressState      : Invalid
ValidLifetime     : Infinite ([TimeSpan]::MaxValue)
PreferredLifetime : Infinite ([TimeSpan]::MaxValue)
SkipAsSource      : False
PolicyStore       : PersistentStore
~~~

~~~
PS C:\Users\fleishor> New-NetNat -Name "MyHyperV NAT" -InternalIPInterfaceAddressPrefix 192.168.0.0/24

Name                             : MyHyperV NAT
ExternalIPInterfaceAddressPrefix :
InternalIPInterfaceAddressPrefix : 192.168.0.0/24
IcmpQueryTimeout                 : 30
TcpEstablishedConnectionTimeout  : 1800
TcpTransientConnectionTimeout    : 120
TcpFilteringBehavior             : AddressDependentFiltering
UdpFilteringBehavior             : AddressDependentFiltering
UdpIdleSessionTimeout            : 120
UdpInboundRefresh                : False
Store                            : Local
Active                           : True
~~~
