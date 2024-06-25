---
date: 2024-06-20
title: InfluxDB2 Maintenance
image: Influx.png
description: Important commands for maintenance of Influxdb2
tags: 
- Influxdb
---

## API Token setzen

~~~
export INFLUX_TOKEN="***"
echo $INFLUX_TOKEN
~~~

## Measurement löschen

Ein Measurement kann nicht direkt gelöscht werden, sondern nur die Daten. Der Vorteil ist, dass ein leeres Measurement nicht angezeigt wird.

~~~
influx delete --bucket Fritzbox --start '1970-01-01T00:00:00Z' --stop $(date +"%Y-%m-%dT%H:%M:%SZ") --predicate '_measurement="Fritzbox"'
~~~

## Alle Measurements in einem Bucket anzeigen lassen

Leider wird die Anzeige abgeschnitten

~~~
influx query 'import "influxdata/influxdb/schema" schema.measurements(bucket: "HomeAssistant")'
~~~

