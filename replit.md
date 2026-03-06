# @sagor/fca-unofficial

## Overview
Unofficial Facebook Chat API for Node.js. This is an **npm library** (not a web application) that allows programmatic interaction with Facebook Messenger. It is meant to be imported by bot/automation projects.

## Project Structure
- `index.js` - Main entry point, exports the `login` function
- `module/` - Core login and configuration modules
- `src/api/` - Facebook API method implementations (messaging, threads, users, etc.)
- `src/database/` - Sequelize-based local database for caching thread/user data
- `src/utils/` - Utilities (HTTP client, cookies, headers, formatting, etc.)
- `src/core/` - MQTT core request handling
- `src/remote/` - Remote control WebSocket client
- `func/` - Logging and utility functions
- `examples/` - Usage examples
- `Fca_Database/` - SQLite database file location
- `demo.js` - Simple console demo script (workflow entry point)

## Dependencies
All defined in `package.json`. Key dependencies:
- `axios` + `axios-cookiejar-support` - HTTP requests with cookie support
- `mqtt` - MQTT messaging (Facebook's real-time protocol)
- `sequelize` - ORM for local SQLite caching
- `ws` - WebSocket support
- `cheerio` - HTML parsing

## Workflow
- **Start application**: `node demo.js` — displays library info and keeps the process alive

## Usage
```js
const login = require('@sagor/fca-unofficial');
login({ appState: [...] }, (err, api) => {
  api.listenMqtt((err, event) => {
    if (event.body === '!ping') api.sendMessage('pong', event.threadID);
  });
});
```
