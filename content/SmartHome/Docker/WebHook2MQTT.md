---
date: 2023-01-01 21:54:05
title: WebHook2MQTT
description: Forward WebHook POST Requests as MQTT
tags: 
- Docker 
- NodeJS
- ExpressJS
- MQTT
- Typescript
- Dockerfile
---

# References
<https://betterstack.com/community/guides/logging/how-to-install-setup-and-use-winston-and-morgan-to-log-node-js-applications/>
<http://www.steves-internet-guide.com/using-node-mqtt-client/>
<https://nodejs.org/en/docs/guides/nodejs-docker-webapp/>

# File tsconfig.json
~~~json
{
  "compilerOptions": {
    "module": "commonjs",
    "esModuleInterop": true,
    "target": "es6",
    "moduleResolution": "node",
    "sourceMap": true,
    "outDir": "dist"
  },
  "lib": ["es2015"]
}
~~~

# File  package.json
~~~json
{
  "name": "webhook2mqtt",
  "version": "1.0.0",
  "description": "",
  "main": "./dist/webhook2mqtt.js",
  "scripts": {
    "buildImage": "docker build . -t webhook2mqtt",
    "build": "npx tsc",
    "webhook2mqtt": "node ./dist/webhook2mqtt.js"
  },
  "author": "",
  "license": "ISC",
  "devDependencies": {
    "@types/express": "^4.17.15",
    "@types/node": "^18.14.0",
    "@typescript-eslint/eslint-plugin": "^5.53.0",
    "@typescript-eslint/parser": "^5.53.0",
    "eslint": "^8.34.0",
    "typescript": "^4.9.4"
  },
  "dependencies": {
    "body-parser": "^1.20.1",
    "express": "^4.18.2",
    "express-winston": "^4.2.0",
    "mqtt": "^4.3.7",
    "uuid": "^9.0.0",
    "winston": "^3.8.2"
  }
}
~~~

# File .eslintrc.jrc
~~~javascript
module.exports = {
   extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
   parser: "@typescript-eslint/parser",
   plugins: ["@typescript-eslint"],
   root: true,
};
~~~

# Dockerfile
~~~yaml
FROM node:19.3.0-alpine3.16

# Create app directory
WORKDIR /webhook2mqtt

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install
# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
COPY ./dist/webhook2mqtt.js .

EXPOSE 3001
CMD [ "node", "/webhook2mqtt/webhook2mqtt.js" ]
~~~

# Generate Javascript from Typescript
~~~bash
npm run build
~~~

# Run webhook2mqtt.js
~~~bash
npm run webhook2mqtt
~~~

# Create Docker image
~~~bash
npm run buildImage
~~~

# Source code webhook2mqtt.ts
~~~typescript
import express from "express";
import bodyParser from "body-parser";
import winston from "winston";
import expressWinston from "express-winston";
import { v4 as uuidv4 } from "uuid";
import mqtt from "mqtt";

const expressApp = express();
const expressPort = 3001;
const grafanaRoute = "/Grafana/*";
const mqttBroker = "mqtt://docker.fritz.box";
const mqttClientId = "webhook2mqtt";

let loggerUuid = null;

// Create Logger
const logger = winston.createLogger({
   level: "info",
   format: winston.format.combine(winston.format.timestamp(), winston.format.json(), winston.format.errors({ stack: true })),
   transports: [new winston.transports.Console()],
   exceptionHandlers: [new winston.transports.Console()],
   rejectionHandlers: [new winston.transports.Console()],
   defaultMeta: {
      get uuid() {
         return loggerUuid;
      },
   },
});

const expressLogger = expressWinston.logger({ winstonInstance: logger });
const expressErrorLogger = expressWinston.errorLogger({ winstonInstance: logger });

// Add POST request helper
expressApp.use(expressLogger);
expressApp.use(bodyParser.urlencoded({ extended: false }));
expressApp.use(bodyParser.json());
expressApp.use(expressErrorLogger);
// eslint-disable-next-line @typescript-eslint/no-unused-vars
expressApp.use(function (err, req, res, next) {
   res.status(500).send("Internal Error");
});

// Connect to MQTT Broker
let mqttClientConnected = false;
const mqttClient = mqtt.connect(mqttBroker, { clientId: mqttClientId });

// Handle POST request for /Grafana/*
expressApp.post(grafanaRoute, (request, response) => {
   // generate new uuid
   loggerUuid = uuidv4();
   logger.info(`Received POST requst for url "${request.path}"`, {
      request_path: request.path,
      request_body: request.body,
   });
   const grafanaAlert = request.body;

   // forward POST request to MQTT
   if (mqttClientConnected) {
      const mqttPrefix = "webhook2mqtt";
      const mqttWebHook = "Grafana";
      const mqttAlertName = grafanaAlert.commonLabels.alertname;
      const topic = "/" + mqttPrefix + "/" + mqttWebHook + "/" + mqttAlertName;
      const mqttPayload = JSON.stringify({
         topic: topic,
         mqttPrefix: mqttPrefix,
         mqttWebHook: mqttWebHook,
         mqttAlertName: mqttAlertName,
         path: request.path,
         payload: request.body,
      });

      logger.info("Publish to MQTT with topic " + topic, { topic: topic, payload: mqttPayload });
      mqttClient.publish(topic, mqttPayload);
   }
   response.end();
   loggerUuid = null;
});

mqttClient.on("connect", () => {
   mqttClientConnected = true;
   logger.info("Connected to MQTT Broker");
});

mqttClient.on("error", function (error) {
   logger.error("Error connecting to MQTT Broker, Error:" + error);
   process.exit(1);
});

// Start HTTP Server
expressApp.listen(expressPort, () => {
   logger.info(`Express is listening at http://localhost:${expressPort}`);
});
~~~

# Create new user webhook2mqtt
~~~bash
sudo useradd -m webhook2mqtt
~~~

# Add user webhook2mqtt to docker group
~~~bash
sudo usermod -aG docker webhook2mqtt
~~~

# Login as user webhook2mqtt
~~~bash
sudo -u webhook2mqtt -i
~~~

# Get uid and gid for user webhook2mqtt
~~~bash
webhook2mqtt@docker:~ $ id
uid=1014(webhook2mqtt) gid=1014(webhook2mqtt) groups=1014(webhook2mqtt),995(docker)
~~~

# File docker-compose.yaml
~~~yaml
version: "3.5"

services:
  webhook2mqtt:
    image: webhook2mqtt:latest
    container_name: webhook2mqtt
    user: 1014:995
    restart: always
    networks:
        - smarthome
    ports:
      - "3001:3001"
networks:
    influxdb2:
        external: true
        name: "smarthome"
~~~
