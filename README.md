# Overview

A Sonos control module for [Scriptable](https://scriptable.app/).

# Requirements

1. One or more Sonos speakers
2. [Scriptable](https://scriptable.app/)
3. [Sonos HTTP API](https://github.com/jishi/node-sonos-http-api)

# Usage

1. Copy `SonosController.js` to a location where Scriptable's `importModule` function can find it. (If you're using iCloud Drive, copy the file to the Scriptable folder in iCloud Drive. See the [importModule documentation](https://docs.scriptable.app/importmodule/) for other suitable locations.)
2. Copy `SonosSettings.js` to a location where Scriptable's `importModule` function can find it. (If you're using iCloud Drive, copy the file to the Scriptable folder in iCloud Drive. See the [importModule documentation](https://docs.scriptable.app/importmodule/) for other suitable locations.)
3. Change the `sonosServerUrl` value in `SonosSettings.js` to the IP address of the computer where the Sonos HTTP API server is running.
4. Create a new script in Scriptable. At the top of the script, add these lines:

```
// Import the controller class and settings.
const SonosController = importModule('SonosController');
const settings = importModule('SonosSettings');

// Create a controller instance.
const controller = new SonosController(settings.sonosServerUrl);
```

You can then access any of the [methods](docs/SonosController.md) via the `controller`.

Examples:

* Get a list of your Sonos playlists: `let myPlaylists = await controller.getPlaylists();`
* Play a playlist in a room: `await controller.playPlaylist('My Playlist', 'Living Room');`

(All of the methods are asynchronous, so use `await` if you need things to happen in a particular sequence.)

# Public methods
The "public" methods are the methods not prefixed by an underscore. None of these methods throw exceptions, though they may return error messages. In general, the output will contain "success" or an error message. Some methods return more detailed information. See the [documentation](docs/SonosController.md) for a list of the methods, their parameters and their return values.

# Internal methods
The methods prefixed with an underscore are "internal" methods that are used by the public methods. You can use these methods if you want, but be aware that they may throw exceptions, so you'll need to handle those accordingly. These methods aren't included in the [documentation](docs/SonosController.md), but the parameters, return values, etc. are documented in [`SonosController.js`](./SonosController.js).

# Tests
[`SonosControllerTests.js`](./SonosControllerTests.js) is a very basic test suite for the `SonosController` class. If you want to run the tests, copy `SonosControllerTests.js` to Scriptable and change the values in the block marked "TEST DATA. CHANGE THESE VALUES." Then run the script inside the app. There is a configurable delay (default: 5 seconds) between each test to allow time to manually evaluate (by observing your Sonos system) the success or failure of the test.