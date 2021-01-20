# Overview

A Sonos module for [Scriptable](https://scriptable.app/).

# Requirements

1. One or more Sonos speakers.
2. [Scriptable](https://scriptable.app/)
3. [Sonos HTTP API](https://github.com/jishi/node-sonos-http-api)

# Usage

1. Copy `SonosController.js` to a location where Scriptable's [importModule](https://docs.scriptable.app/importmodule/) function can find it.
2. Copy `SonosSettings.js` to a location where Scriptable's [importModule](https://docs.scriptable.app/importmodule/) function can find it.
3. Edit the `sonosServerUrl` value in `SonosSettings.js` to the IP address of the computer where the Sonos HTTP API server is running.
4. Create a new script in Scriptable. At the top of the script, add these lines:

```
// Import the controller and settings.
const SonosController = importModule('SonosController');
const settings = importModule('SonosSettings');

// Create the controller.
let controller = new SonosController(settings.sonosServerUrl);
```

You can then access any of the [methods](docs/SonosController.md) via the `controller`. For example, to play a playlist in a certain room:

```
await controller.playPlaylist('My Playlist, 'Living Room');
```

(All of the methods are asynchronous, so use `await` if you need things to happen in a particular sequence.)
