---
date: 2021-12-28 11:56:25
title: Installation of Portainer
description: Installation steps for Portainer
tags: 
- Docker
- Portainer
- SmartHome
---

# Create new user portainer

~~~bash
sudo useradd -m portainer
~~~

# Add user portainer to docker group

~~~bash
sudo usermod -aG docker portainer
~~~

# Login as user portainer

~~~bash
sudo -u portainer -i
~~~

# Get uid and gid for user portainer

~~~bash
portainer@docker:~ $ id
uid=1001(portainer) gid=1001(portainer) groups=1001(portainer),995(docker)
~~~

# Create directories for portainer

~~~bash
mkdir portainer_data
~~~

# docker-compose.yaml file

~~~yaml
version: '3.5'

services:
  portainer:
    image: portainer/portainer-ce:latest
    container_name: portainer
    user: 1001:995
    restart: always
    ports:
      - 9000:9000
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - /home/portainer/portainer_data:/data
~~~

# Update portainer

~~~bash
docker stop portainer

docker pull portainer/portainer-ce
~~~
