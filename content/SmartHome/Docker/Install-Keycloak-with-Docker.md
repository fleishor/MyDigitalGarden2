---
showOnIndexPage: true
date: 2024-10-17
title: Installation Keycloak with Docker
description: Installation steps for Keycloak with Docker
image: Keycloak.png
tags: 
- Docker
- Keycloak
---

## References

- [Get started with Keycloak on Docker](https://www.keycloak.org/getting-started/getting-started-docker)
- [Durchstarten mit Keycloak und Docker](https://conciso.de/durchstarten-keycloak-docker/)

## Create new user keycloak

~~~bash
sudo useradd -m keycloak
~~~

## Add user keycloak to docker group

~~~bash
sudo usermod -aG docker keycloak
~~~

## Login as user keycloak

~~~bash
sudo -u keycloak -i
~~~

## Get uid and gid for user keycloak

~~~bash
grafana@docker:~ $ id
uid=1019(keycloak) gid=1019(keycloak) groups=1019(keycloak),995(docker)
~~~

## Create separate network keycloak

~~~bash
~~~

## Install MariaDB as persistence layer

## docker-compose.yaml file

~~~yaml
services:
   mariadb:
      container_name: keycloak_mariadb
      image: mariadb:latest
      ports:
         - 3306:3306
      environment:
         - MARIADB_DATABASE=keycloak
         - MARIADB_ROOT_PASSWORD=mariadb
         - MARIADB_USER=keycloak
         - MARIADB_PASSWORD=keycloak
      volumes:
         - /home/keycloak/var_lib_mysql:/var/lib/mysql:rw
      restart: always
      networks:
         - keycloak

   keycloak:
      container_name: keycloak_server
      image: quay.io/keycloak/keycloak:latest
      environment:
         KEYCLOAK_ADMIN: admin
         KEYCLOAK_ADMIN_PASSWORD: admin
         KC_DB: mariadb
         KC_DB_URL_DATABASE: keycloak
         KC_DB_URL: jdbc:mariadb://mariadb/keycloak
         KC_DB_USERNAME: keycloak
         KC_DB_PASSWORD: keycloak
         KC_HTTP_RELATIVE_PATH: /auth
      command: ['start-dev']
      ports:
         - "8081:8080" # Externe-Portnummer:Interne-Portnummer
      restart: always
      depends_on:
         mariadb:
            condition: service_started
      networks:
         - keycloak

networks:
    keycloak:
        external: true
        name: "keycloak"
~~~
