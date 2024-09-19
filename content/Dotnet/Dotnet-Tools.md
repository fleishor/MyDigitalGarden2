---
draft: true
date: 2024-09-17
title: Short decription of dotnet tools
image: Dotnet.png
description: 
tags:
  - Kubernetes
  - Dotnet
  - Docker
  - MustBeReworked
---

## References
- [.Net diagnostic tools](https://learn.microsoft.com/de-de/dotnet/core/diagnostics/tools-overview)


## Take a dump

dotnet-dump collect -p 1

![[Take-dump.png]]

## Copy dump to local pc

kubectl cp {PodName}:/{folder}/{dumpfile} {dumpfile}

![[Copy-dump-to-local-pc.png]]