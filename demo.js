"use strict";

const pkg = require("./package.json");

console.log("===========================================");
console.log(`  ${pkg.name} v${pkg.version}`);
console.log("===========================================");
console.log(pkg.description);
console.log("");
console.log("Library loaded successfully.");
console.log("");
console.log("This is an npm library for interacting with Facebook Messenger.");
console.log("To use it, require/import it in your bot project:");
console.log("");
console.log("  const login = require('sagor-fca-unofficial');");
console.log("");
console.log("  login({ appState: [...] }, (err, api) => {");
console.log("    api.listenMqtt((err, event) => {");
console.log("      if (event.body === '!ping') api.sendMessage('pong', event.threadID);");
console.log("    });");
console.log("  });");
console.log("");
console.log("See README.md or DOCS.md for full documentation.");
console.log("===========================================");

const login = require("./index.js");
console.log("Export type:", typeof login);
console.log("Named exports:", Object.keys(login).join(", "));
console.log("===========================================");
console.log("Ready. Press Ctrl+C to exit.");

setInterval(() => {}, 1 << 30);
