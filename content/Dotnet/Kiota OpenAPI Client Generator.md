---
date: 2024-09-19
title: Kiota OpenApi client generator
image: Kiota.png
description: Kiota is a command line tool for generating an API client to call any OpenAPI described API you are interested in. Kiota API clients provide a strongly typed experience with all the features you expect from a high quality API SDK, but without having to learn a new library for every HTTP API.
tags:
  - Dotnet
---

## References

[Kiota Github](https://github.com/microsoft/kiota)
[Kiota documentation](https://learn.microsoft.com/de-de/openapi/kiota/)

## Install Kiota as .NET tool

```
dotnet tool install --global Microsoft.OpenApi.Kiota
```

## Add required Nuget packages to the project

```
dotnet add package Microsoft.Kiota.Abstractions
dotnet add package Microsoft.Kiota.Http.HttpClientLibrary
dotnet add package Microsoft.Kiota.Serialization.Form
dotnet add package Microsoft.Kiota.Serialization.Json
dotnet add package Microsoft.Kiota.Serialization.Text
dotnet add package Microsoft.Kiota.Serialization.Multipart
``````

## Generate the client API for https://autobahn.api.bund.dev

```
kiota generate \
   --exclude-backward-compatible \
   --additional-data false
   --language CSharp \
   --class-name AutobahnClient \
   --namespace-name Bund.API.Autobahn.Client \
   --openapi https://autobahn.api.bund.dev/openapi.yaml \
   --output ./AutobahnClient
```
