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

![[01_Workflow.png]]

# MQTT node

![[02-Mqtt-Node.png]]

# MQTT configuration

![[03-Mqtt-Broker-Node-Configuration.png]]

# Convert MQTT payload from string to Javascript object

![[04-Convert-Payload-To-JSON.png]]

# Switch depending on topic

![[05-Switch-mqttType.png]]

# Create Telegram message for SMTP

![[06-Create-Telegram-Message-Smtp.png]]

# Create Telegram message for WebHook

![[07-Create-Telegram-Message-Webhook.png]]

# Send Telegram message to SmartHomeNotification channel

![[08-Send-To-SmartHomeNotificaton-Channel.png]]

# Write log message to NodeRed console and therefore to Loki

![[09-Notification-Sent-To-Telegram.png]]
![[10-Mqtt.png]]
