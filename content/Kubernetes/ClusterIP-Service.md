---
date: 2022-11-28 13:50:19
title: ClusterIP Service
image: Kubernetes.png
description: Erzeugt einen ClusterIP Service für Nginx Pods
tags: 
- Kubernetes
- Nginx
- ClusterIP
---

# Skripte
## Service file
~~~yaml
apiVersion: v1
kind: Service
metadata:
  name: nginx-service-clusterip
  labels:
    app: nginx-clusterip # lable for the ClusterIP service
spec:
  selector:
    app: nginx-pods # Which Pods should be handled by this service
  type: ClusterIP
  ports:
  - name: http
    port: 8080 # Exposed Port by ClusterIP
    targetPort: 80 # Port in Pod which should be exposed
    protocol: TCP
~~~

## Check ClusterIP service
- Der ClusterIP Service hat wieder einen eigenen IP-Bereich (10.110.0.0/16)
 
~~~
fleishor@desktop:~/vagrant-kubernetes-cluster$ kubectl get services
NAME                      TYPE        CLUSTER-IP    EXTERNAL-IP   PORT(S)    AGE
kubernetes                ClusterIP   10.96.0.1     <none>        443/TCP    17d
nginx-service-clusterip   ClusterIP   10.110.1.81   <none>        8080/TCP   23h
~~~

## DNS (ClusterIP Service Name) innerhalb der Pods verwenden
- Der ClusterIP Service (Adresse) ist nur innerhalb des Pod Netzwerkes verfügbar
- Der ClusterIP Service Name kann gleichzeitig als DomainName verwendet werden (FQDN: nginx-server-clusterip.default.svc.cluster.local)
- HTTP Anfragen an den ClusterIP Service leitet dieser an die Pods weiter (Round-Robin-Verfahren oder sowas ähnliches)
- Hauptaufgabe der ClusterIP ist das LoadBalancing auf die Pods
- Innerhalb eines Pods kann auch direkt auf einen anderen Pod zugegriffen werden.
 
~~~
fleishor@desktop:~/vagrant-kubernetes-cluster$ kubectl exec -it nginx-deployment-c4b4cb578-4jqtr -c netshoot-container -- /bin/bash
bash-5.2# curl nginx-service-clusterip:8080
nginx-deployment-c4b4cb578-4jqtr
bash-5.2# curl nginx-service-clusterip:8080
nginx-deployment-c4b4cb578-5jcxd
bash-5.2# curl nginx-service-clusterip:8080
nginx-deployment-c4b4cb578-8qs5h
~~~
