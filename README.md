# TransYouth Status Monitor

A lightweight service designed to **continuously monitor the availability and health of https://transyouth.xyz/** and related services, with results publicly displayed on a dedicated status page.

Status page: https://status.transyouth.xyz/

---

## Overview

TransYouth Status is a real-time website monitoring system that periodically checks the accessibility, response status, and latency of TransYouth services. It keeps a rolling history of service states to ensure transparency and reliability for both users and maintainers.

The project aims to provide a clear and trustworthy overview of service uptime and recent incidents.

---

## Features

- Real-time monitoring of website availability
- Classification of service states (Operational, Degraded, Down)
- Tracking of HTTP response status and latency (RTT)
- Automatic cleanup of outdated historical data
- Public-facing status dashboard
- Simple, minimal, and reliable design

---

## Service Status Definitions

Each monitored service is categorized into one of the following states based on the latest check result:

| Status | Description |
|------|-------------|
| OK | The service is fully operational and responding normally |
| Degraded | The service responds, but with abnormal HTTP status or partial issues |
| Down | The service is unreachable, timed out, or encountered a network error |

---

## Monitoring Logic

The monitoring process follows a consistent cycle:

1. Load the existing monitoring state
2. Iterate through all configured services
3. Perform availability checks for each service
4. Record timestamped status results
5. Retain only recent history within a defined time window
6. Update the global last-updated timestamp

This ensures that the status page always reflects the most recent and relevant service information.

---

## Status Page

All monitoring results are used to power the public status page, which displays:

- Current operational status of each service
- Recent status history
- Response latency information
- Last update time

Public status page:  
https://status.transyouth.xyz/

---

## Design Goals

- **Lightweight** — minimal complexity and low operational overhead  
- **Transparent** — public visibility into service health  
- **Extensible** — easy to add or modify monitored services  
- **Automated** — suitable for scheduled execution environments such as cron jobs or serverless workers  

---

## License

MIT License  
© TransYouth
