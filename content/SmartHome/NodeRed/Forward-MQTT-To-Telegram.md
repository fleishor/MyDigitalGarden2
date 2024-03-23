---
date: 2023-03-05 17:51:00
title: Forward MQTT message to telegram
image: MqttTelegram.png
description: Forward MQTT messages from Smtp2MQTT and Webhook2MQTT to Telegram
tags:
   - Docker
   - Raspberry Pi
   - NodeRed
   - Telegram
---

# Workflow for sending MQTT to Telegram

![WorkFlow](./Forward-MQTT-To-Telegram/01_Workflow.png)

# MQTT node

![WorkFlow](./Forward-MQTT-To-Telegram/02-Mqtt-Node.png)

# MQTT configuration

![WorkFlow](./Forward-MQTT-To-Telegram/03-Mqtt-Broker-Node-Configuration.png)

# Convert MQTT payload from string to Javascript object

![WorkFlow](./Forward-MQTT-To-Telegram/04-Convert-Payload-To-JSON.png)

# Switch depending on topic

![WorkFlow](./Forward-MQTT-To-Telegram/05-Switch-mqttType.png)

# Create Telegram message for SMTP

![WorkFlow](./Forward-MQTT-To-Telegram/06-Create-Telegram-Message-Smtp.png)

# Create Telegram message for WebHook

![WorkFlow](./Forward-MQTT-To-Telegram/07-Create-Telegram-Message-Webhook.png)

# Send Telegram message to SmartHomeNotification channel

![WorkFlow](./Forward-MQTT-To-Telegram/08-Send-To-SmartHomeNotificaton-Channel.png)

# Write log message to NodeRed console and therefore to Loki

![WorkFlow](./Forward-MQTT-To-Telegram/09-Notification-Sent-To-Telegram.png)
![WorkFlow](./Forward-MQTT-To-Telegram/10-Mqtt.png)
