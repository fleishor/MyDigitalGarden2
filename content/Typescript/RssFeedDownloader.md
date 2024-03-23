---
date: 2023-11-27
title: RSSFeedDownloader
image: RSS.png
description: Mit RSSFeedDownloader können Prodcasts von BR und von ARD Audiothek heruntergeladen werden
external_links:
  - title: RssFeedDownloader
    url: https://github.com/fleishor/MyDevelopment/tree/master/RssFeedDownloader
  - title: ARD-Audiothek-RSS Konverter
    url: https://github.com/matztam/ARD-Audiothek-RSS
  - title: RSS Feed für ARD Audiothek Podcasts
    url: https://blog.sengotta.net/rss-feed-fuer-ard-audiothek-podcasts/
tags:
  - Typescript
  - NodeJS
---

## Podcast von BR herunterladen

### Podcast mit curl herunterladen und in "Podcast.xml" speichern

~~~
curl -o  "Podcast.xml" "https://feeds.br.de/radiowissen/feed.xml"
~~~

### Verzeichnis ./downloads anlegen

~~~
 C:\Users\fleishor\MyDevelopment\RssFeedDownloader> mkdir downloads

    Directory: C:\Users\fleishor\MyDevelopment\RssFeedDownloader

Mode                 LastWriteTime         Length Name
----                 -------------         ------ ----
d----          23.11.2023    13:48                downloads

PS C:\Users\fleishor\MyDevelopment\RssFeedDownloader> dir

    Directory: C:\Users\fleishor\MyDevelopment\RssFeedDownloader

Mode                 LastWriteTime         Length Name
----                 -------------         ------ ----
d----          23.11.2023    13:48                downloads
d----          31.10.2023    10:08                node_modules
-a---          31.10.2023    10:09            227 .eslintrc.cjs
-a---          31.10.2023    10:08          63793 package-lock.json
-a---          09.11.2023    17:21            434 package.json
-a---          23.11.2023    13:42        6237078 Podcast.xml
-a---          15.11.2023    19:04           2033 RssFeedDownloaderARD.ts
-a---          23.11.2023    13:47           2121 RssFeedDownloaderBR.ts
-a---          30.10.2023    14:07          12399 tsconfig.json

PS C:\Users\fleishor\MyDevelopment\RssFeedDownloader>
~~~

### Filterdatum im Typescript file, line 8 anpassen

~~~Typescript
const startDate = new Date("2023-11-23");
~~~

### RssFeedDownloader aufrufen

~~~
C:\Users\fleishor\MyDevelopment\RssFeedDownloader> npm run RssFeedDownloaderBR

> rssfeeddownloader@1.0.0 RssFeedDownloaderBR
> ts-node RssFeedDownloaderBR.ts

c:\tools\wget -O ./downloads/231123_0310_radiowissen_flechten-meister-der-extreme-alles-natur.mp3 https://media.neuland.br.de/file/2081037/c/feed/flechten-meister-der-extreme-alles-natur.mp3

c:\tools\wget -O ./downloads/231123_0300_radiowissen_ordnung-in-die-natur-der-schwedische-forscher-carl-von-linn.mp3 https://media.neuland.br.de/file/2081028/c/feed/ordnung-in-die-natur-der-schwedische-forscher-carl-von-linn.mp3

PS C:\Users\fleishor\MyDevelopment\RssFeedDownloader> 
~~~

### Generierte Statements ausführen und Audiodateien herunterladen

~~~
PS C:\Users\fleishor\MyDevelopment\RssFeedDownloader> c:\tools\wget -O ./downloads/231123_0300_radiowissen_ordnung-in-die-natur-der-schwedische-forscher-carl-von-linn.mp3 https://media.neuland.br.de/file/2081028/c/feed/ordnung-in-die-natur-der-schwedische-forscher-carl-von-linn.mp3
--2023-11-27 11:46:10--  https://media.neuland.br.de/file/2081028/c/feed/ordnung-in-die-natur-der-schwedische-forscher-carl-von-linn.mp3
Resolving media.neuland.br.de (media.neuland.br.de)... 34.76.217.83
Connecting to media.neuland.br.de (media.neuland.br.de)|34.76.217.83|:443... connected.
HTTP request sent, awaiting response... 301 Moved Permanently
Location: https://cdn-storage.br.de/MUJIuUOVBwQIbtChb6OHu7ODifWH_-46/_AiS/_2FG5yrH9U1S/231124_0905_radioWissen_Ordnung-in-die-Natur-Der-schwedische-Forsch.mp3?download=true [following]
--2023-11-27 11:46:10--  https://cdn-storage.br.de/MUJIuUOVBwQIbtChb6OHu7ODifWH_-46/_AiS/_2FG5yrH9U1S/231124_0905_radioWissen_Ordnung-in-die-Natur-Der-schwedische-Forsch.mp3?download=true
Resolving cdn-storage.br.de (cdn-storage.br.de)... 195.138.255.24, 195.138.255.8
Connecting to cdn-storage.br.de (cdn-storage.br.de)|195.138.255.24|:443... connected.
HTTP request sent, awaiting response... 200 OK
Length: 24943802 (24M) [audio/mpeg]
Saving to: './downloads/231123_0300_radiowissen_ordnung-in-die-natur-der-schwedische-forscher-carl-von-linn.mp3'

./downloads/231123_0300_radio 100%[=================================================>]  23,79M  3,62MB/s    in 6,6s

2023-11-27 11:46:17 (3,63 MB/s) - './downloads/231123_0300_radiowissen_ordnung-in-die-natur-der-schwedische-forscher-carl-von-linn.mp3' saved [24943802/24943802]

PS C:\Users\fleishor\MyDevelopment\RssFeedDownloader>
~~~

## Podcast von der ARD Audiothek herunterladen

Im Gegensatz zu BR bietet die ARD die Podcasts nur auf der Webseite an, leider nicht als RSSFeed. Unter [ARD-Audiothek-RSS](https://github.com/matztam/ARD-Audiothek-RSS) hat sich "matztam" schon die Mühe gemacht und einen Konverter geschrieben.

### Install ARDAudiothek -> RSSFeed converter

- <https://blog.sengotta.net/rss-feed-fuer-ard-audiothek-podcasts/>

- <https://github.com/matztam/ARD-Audiothek-RSS>

Ich hab den Konverter auf der docker.fritz.box als Docker container installiert.

### Podcast mit curl herunterladen und in "Podcast.xml" speichern

~~~
curl -o "Podcast.xml" "http://docker.fritz.box:3010/index.php?show=12810141"
~~~

"12810141" ist die Id des Podcasts, findet man aber relative einfach über die URL des Prodcasts, z.B. "<https://www.ardaudiothek.de/sendung/der-raeuber-hotzenplotz/12810141/>"

### Verzeichnis ./downloads anlegen

### Filterdatum im Typescript file, line 8 anpassen

~~~Typescript
const startDate = new Date("2023-11-23");
~~~

### RssFeedDownloader aufrufen

~~~
PS C:\Users\fleishor\MyDevelopment\RssFeedDownloader> npm run RssFeedDownloaderARD

> rssfeeddownloader@1.0.0 RssFeedDownloaderARD
> ts-node RssFeedDownloaderARD.ts

c:\tools\wget -O ./downloads/231013_0004_der-raeuber-hotzenplotz_der-raeuber-hotzenplotz-teil-1.mp3 https://avdlswr-a.akamaihd.net/swr/swr2/hoerspiel/podcast/raeuber-hotzenplotz-teil-1.l.mp3
c:\tools\wget -O ./downloads/231013_0003_der-raeuber-hotzenplotz_der-raeuber-hotzenplotz-teil-2.mp3 https://avdlswr-a.akamaihd.net/swr/swr2/hoerspiel/podcast/raeuber-hotzenplotz-teil-2.l.mp3 
c:\tools\wget -O ./downloads/231013_0002_der-raeuber-hotzenplotz_der-raeuber-hotzenplotz-teil-3.mp3 https://avdlswr-a.akamaihd.net/swr/swr2/hoerspiel/podcast/raeuber-hotzenplotz-teil-3.l.mp3 
c:\tools\wget -O ./downloads/231013_0001_der-raeuber-hotzenplotz_der-raeuber-hotzenplotz-teil-4.mp3 https://avdlswr-a.akamaihd.net/swr/swr2/hoerspiel/podcast/raeuber-hotzenplotz-teil-4.l.mp3 
PS C:\Users\fleishor\MyDevelopment\RssFeedDownloader> 
~~~

### Generierte Statements ausführen und Audiodateien herunterladen
