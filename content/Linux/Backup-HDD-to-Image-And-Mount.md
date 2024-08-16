---
date: 2023-03-16T16:02
title: Backup HDD to image file and mount the image file
image: LinuxCommandLine.png
description: Backup hard disc with dd to image file and mount the image file
tags: 
- Linux
---

## Get partitions of a HDD

~~~bash
sudo parted -l

Modell: ATA SanDisk SSD PLUS (scsi)
Festplatte  /dev/sda:  480GB
Sektorgröße (logisch/physisch): 512B/512B
Partitionstabelle: gpt
Disk-Flags: 

Nummer  Anfang  Ende   Größe  Dateisystem  Name                  Flags
 1      1049kB  538MB  537MB  fat32        EFI System Partition  boot, esp
 2      538MB   480GB  480GB  ext4


Modell: ATA WDC WD10EZEX-21W (scsi)
Festplatte  /dev/sdb:  1000GB
Sektorgröße (logisch/physisch): 512B/4096B
Partitionstabelle: gpt
Disk-Flags: 

Nummer  Anfang  Ende    Größe   Dateisystem  Name  Flags
 1      1049kB  1000GB  1000GB  ext4


Modell: ST950032 5AS (scsi)
Festplatte  /dev/sdc:  500GB
Sektorgröße (logisch/physisch): 512B/512B
Partitionstabelle: gpt
Disk-Flags: 

Nummer  Anfang  Ende   Größe   Dateisystem  Name                          Flags
 1      1049kB  420MB  419MB   ntfs         Basic data partition          versteckt, diag
 2      420MB   735MB  315MB   fat32        EFI system partition          boot, esp
 3      735MB   869MB  134MB                Microsoft reserved partition  msftres
 4      869MB   243GB  242GB   ntfs         Basic data partition          msftdata
 5      243GB   483GB  241GB   ntfs         Basic data partition          msftdata
 6      483GB   500GB  16,6GB  ntfs         Basic data partition          versteckt, diag
~~~

## Dump HDD to image file

~~~bash
sudo dd if=/dev/sdc4 of=sdc4.img status=progress
~~~

## Mount image to file system /mnt/ntfs1

~~~bash
sudo mount -o loop sdc4.img /mnt/ntfs1
~~~

## Unmount

~~~bash
sudo umount /mnt/ntfs1/
~~~
