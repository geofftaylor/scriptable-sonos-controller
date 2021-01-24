# Overview

A Sonos control module for [Scriptable](https://scriptable.app/).

# Requirements

1. One or more Sonos speakers
2. [Scriptable](https://scriptable.app/)
3. [Sonos HTTP API](https://github.com/jishi/node-sonos-http-api)

# Usage

1. Install the [Sonos HTTP API](https://github.com/jishi/node-sonos-http-api) server on a computer that's on the same network as your Sonos system. (A Raspberry Pi works well for this purpose.)
2. Copy `SonosController.js` to a location where Scriptable's `importModule` function can find it. (If you're using iCloud Drive, copy the file to the Scriptable folder in iCloud Drive. See the [importModule documentation](https://docs.scriptable.app/importmodule/) for other suitable locations.)
3. Copy `SonosSettings.js` to a location where Scriptable's `importModule` function can find it. (If you're using iCloud Drive, copy the file to the Scriptable folder in iCloud Drive. See the [importModule documentation](https://docs.scriptable.app/importmodule/) for other suitable locations.)
4. Change the `sonosServerUrl` value in `SonosSettings.js` to the IP address of the computer where the Sonos HTTP API server is running.
5. Create a new script in Scriptable. At the top of the script, add these lines:

```
// Import the controller class and settings.
const SonosController = importModule('SonosController');
const settings = importModule('SonosSettings');

// Create a controller instance.
const controller = new SonosController(settings.sonosServerUrl);
```

You can then access any of the [methods](Documentation/SonosController.md) via the `controller`.

Examples:

* Get a list of your Sonos playlists: `let myPlaylists = await controller.getPlaylists();`
* Play a playlist in a room: `await controller.playPlaylist('My Playlist', 'Living Room');`

(All of the methods are asynchronous, so use `await` if you need things to happen in a particular sequence.)

See the Examples directory for examples of small and medium "now playing" widgets built using this module.