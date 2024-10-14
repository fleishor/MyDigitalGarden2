---
date: 2023-01-01
title: Linux Kommandos zur Bilderverwaltung
image: LinuxCommandLine.png
description: Linux Kommandos um identische Bilder zu finden/löschen und Bilder nach Datum in Unterverzeichnisse einsortieren
tags: 
- Linux
---

## Identische Dateien finden

~~~bash
fdupes --recurse --reverse  /srv/dev-disk-by-label-Disk01/Bilder
~~~

## ... und löschen

Im Set der Duplicate wird die erste behalten und alle anderen gelöscht.

~~~bash
fdupes --recurse --reverse --delete --noprompt /srv/dev-disk-by-label-Disk01/Bilder
~~~

## Bilder nach Datum YYYY-MM in Unterverzeichnisse sortieren

~~~bash
exiftool -d %Y-%m "-directory<createdate" *.jpg
~~~

## Bilder aus allen Unterverzeichnissen in ein Verzeichnis kopieren

~~~bash
find ./*__ -type f -exec cp --backup=numbered -t ./tmp {} +
~~~
