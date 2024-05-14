---
date: 2022-11-15 13:50:19
title: Deploy Nginx und NetShoot
image: Kubernetes.png
description: Deploy Nginx und NetShoot
tags: 
- Kubernetes 
- Nginx 
- Deployment
---

## Übersicht

Diese Deployment erzeugt 6 Pods mit jeweils 2 Containers (nginx und netshoot) und 1 Init-Cotainer

## Skripte

### Deployment file

~~~yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-deployment
  labels:
    app: nginx-deployment # Label of the Deployment
spec:
  replicas: 3
  selector:
    matchLabels:
      app: nginx-pods # Which Pods should be handled by this ReplicaSet
  template:
    metadata:
      labels:
        app: nginx-pods # Label of the Pods which is used by ReplicaSet and 
                        # ClusterIP Service
    spec:
      containers:
      - name: nginx-container # Name of the container
        image: nginx:latest # Image name and version
        ports:
        - containerPort: 80 # Exposed port from the container
        volumeMounts:
        - name: local-volume # Name of the volumeMount to use in the container
          mountPath: /usr/share/nginx/html # The mountpoint inside the container
      - name: netshoot-container # SideCar container for network analyzes
        image: nicolaka/netshoot
        volumeMounts:
        - name: local-volume
          mountPath: /html
        command: [ "sleep" ] # Sleep infinite, because only shell access 
                             # should be possible
        args: [ "infinity" ]
      initContainers:
      - name: init-container # InitContainer for creating /html/index.html
        image: busybox
        volumeMounts:
        - name: local-volume
          mountPath: /html
        command: ["/bin/sh", "-c"]
        args:
          - hostname > /html/index.html; sleep 5;
      volumes:
      - name: nfs-volume # NFS volumn from NFS server which is currently not used
        nfs:
          server: nfsserver
          path: /mnt/nfs_share # The exported directory/share at NFS server
      - name: local-volume # for each Pod local volumne, is initialized by InitContainer
        emptyDir: {}  # Empty directory within each Pod; 
                      # shared directory over all containers within the same pod
~~~

### nginx container

- Führt eine nginx Webserver im Pod aus.
- Das nginx Verzeichnis /usr/share/nginx/html wird ein Pod-internes Verzeichnis gemounted
- Ausserhalt des Pods ist dieses Verzeichnis nicht verfügbar und wenn der Pod sich beendet wird der Inhalt des Verzeichnisses auch gelöscht. (nicht persistent)

### init container

- Der init container schreibt den hostname/podname nach /html/index.html
- Die index.html wird dann über den nginx ausgeliefert
- Anschliessend beendet sich der init container und gibt somit den nginx container und netshoot container ""frei"

### netshoot container

- Netshoot container ist ein side-car-container und wird nur in dem Pod mit installiert, damit auf auf das Pod-Netzwerk zugegriffen werden kann. Im nginx container fehlen zahlreiche tools, z.B. ip, curl, ...

## Quellen
