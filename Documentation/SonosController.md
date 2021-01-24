<a name="SonosController"></a>

## SonosController
SonosController is a wrapper around the [Sonos HTTP API](https://github.com/jishi/node-sonos-http-api).

* [SonosController](#SonosController)
    * [new SonosController(sonosServerUrl)](#new_SonosController_new)
    * [.isConnected()](#SonosController+isConnected) ⇒ <code>boolean</code>
    * [.getServices()](#SonosController+getServices) ⇒ <code>Object</code> \| <code>string</code>
    * [.getZones()](#SonosController+getZones) ⇒ <code>Array</code> \| <code>string</code>
    * [.getRooms()](#SonosController+getRooms) ⇒ <code>Array</code> \| <code>string</code>
    * [.getGroups()](#SonosController+getGroups) ⇒ <code>Array</code> \| <code>string</code>
    * [.getFavorites()](#SonosController+getFavorites) ⇒ <code>Array</code> \| <code>string</code>
    * [.getPlaylists()](#SonosController+getPlaylists) ⇒ <code>Array</code> \| <code>string</code>
    * [.getCurrentPlaybackState(room)](#SonosController+getCurrentPlaybackState) ⇒ <code>string</code>
    * [.getCurrentTrack(room)](#SonosController+getCurrentTrack) ⇒ <code>Object</code> \| <code>string</code>
    * [.getNextTrack(room)](#SonosController+getNextTrack) ⇒ <code>Object</code> \| <code>string</code>
    * [.getAlbumArt(albumArtUri)](#SonosController+getAlbumArt) ⇒ <code>Image</code>
    * [.getAlbumArtAsBase64(albumArtUri)](#SonosController+getAlbumArtAsBase64) ⇒ <code>string</code>
    * [.play(room)](#SonosController+play) ⇒ <code>string</code>
    * [.pause(room)](#SonosController+pause) ⇒ <code>string</code>
    * [.next(room)](#SonosController+next) ⇒ <code>string</code>
    * [.previous(room)](#SonosController+previous) ⇒ <code>string</code>
    * [.toggle(room)](#SonosController+toggle) ⇒ <code>string</code>
    * [.setRoomVolume(room, volume)](#SonosController+setRoomVolume) ⇒ <code>string</code>
    * [.playFavorite(favorite, room)](#SonosController+playFavorite) ⇒ <code>string</code>
    * [.playFavoriteEverywhere(favorite)](#SonosController+playFavoriteEverywhere) ⇒ <code>string</code>
    * [.playPlaylist(playlist, room)](#SonosController+playPlaylist) ⇒ <code>string</code>
    * [.playPlaylistEverywhere(playlist)](#SonosController+playPlaylistEverywhere) ⇒ <code>string</code>
    * [.group(room, others)](#SonosController+group) ⇒ <code>string</code>
    * [.groupAllRoomsWith(room)](#SonosController+groupAllRoomsWith) ⇒ <code>string</code>
    * [.ungroup(rooms)](#SonosController+ungroup) ⇒ <code>string</code>
    * [.ungroupAllRoomsFrom(room)](#SonosController+ungroupAllRoomsFrom) ⇒ <code>string</code>
    * [.getRoomsInGroupInclusive(room)](#SonosController+getRoomsInGroupInclusive) ⇒ <code>Array</code> \| <code>string</code>
    * [.getRoomsInGroupExclusive(room)](#SonosController+getRoomsInGroupExclusive) ⇒ <code>Array</code> \| <code>string</code>
    * [.setGroupVolume(room, volume)](#SonosController+setGroupVolume) ⇒ <code>string</code>

<a name="new_SonosController_new"></a>

### new SonosController(sonosServerUrl)
Creates a new controller instance.

| Param | Type | Description |
| --- | --- | --- |
| sonosServerUrl | <code>string</code> | The IP address and port where the Sonos HTTP API server is listening. |

<a name="SonosController+_formatRoomForUrl"></a>


<a name="SonosController+isConnected"></a>

### .isConnected() ⇒ <code>boolean</code>
Tests connectivity to the Sonos HTTP API server.


**Returns**: <code>boolean</code> - Returns `true` if the controller can communicate with the server. Otherwise returns `false`.  
<a name="SonosController+getServices"></a>

### .getServices() ⇒ <code>Object</code> \| <code>string</code>
Returns a list of all supported music services. (Not all of the services may be in use on the system.)


**Returns**: <code>Object</code> \| <code>string</code> - An object containing the supported music services or an error message.  
<a name="SonosController+getZones"></a>

### .getZones() ⇒ <code>Array</code> \| <code>string</code>
Returns a list of the system's zones.


**Returns**: <code>Array</code> \| <code>string</code> - An array of objects or an error message.  
<a name="SonosController+getRooms"></a>

### .getRooms() ⇒ <code>Array</code> \| <code>string</code>
Returns the names of all rooms in the system.


**Returns**: <code>Array</code> \| <code>string</code> - An array of room names or an error message.  
<a name="SonosController+getGroups"></a>

### .getGroups() ⇒ <code>Array</code> \| <code>string</code>
Returns a list of groups.


**Returns**: <code>Array</code> \| <code>string</code> - An array of arrays. Each array represents one group and contains the names of the rooms in that group (which could be a single room, if that room is not grouped). If an error occurred, returns an error message instead of an array.  
<a name="SonosController+getFavorites"></a>

### .getFavorites() ⇒ <code>Array</code> \| <code>string</code>
Returns a list of the stations, playlists, etc. that have been marked as favorites.


**Returns**: <code>Array</code> \| <code>string</code> - An array of favorites or an error message.  
<a name="SonosController+getPlaylists"></a>

### .getPlaylists() ⇒ <code>Array</code> \| <code>string</code>
Returns a list of Sonos playlists.


**Returns**: <code>Array</code> \| <code>string</code> - An array of playlists or an error message.  
<a name="SonosController+getCurrentPlaybackState"></a>

### .getCurrentPlaybackState(room) ⇒ <code>string</code>
Returns the current playback state of `room` (e.g., PLAYING, STOPPED).


**Returns**: <code>string</code> - The current playback state or an error message.  

| Param | Type | Description |
| --- | --- | --- |
| room | <code>string</code> | The name of a room in the Sonos system. |

<a name="SonosController+getCurrentTrack"></a>

### .getCurrentTrack(room) ⇒ <code>Object</code> \| <code>string</code>
Returns the details of the track currently playing in `room`. The returned object contains the following keys:
`artist`, `title`, `album`, `albumArtUri`, `room`, `type`, `service`, `station`, `trackUri`.


**Returns**: <code>Object</code> \| <code>string</code> - The details of the current track or an error message.  

| Param | Type | Description |
| --- | --- | --- |
| room | <code>string</code> | The name of a room in the Sonos system. |

<a name="SonosController+getNextTrack"></a>

### .getNextTrack(room) ⇒ <code>Object</code> \| <code>string</code>
Returns the details of the next queued track in `room`. The returned object contains the following keys:
`artist`, `title`, `album`, `albumArtUri`, `room`, `type`, `service`, `station`, `trackUri`.


**Returns**: <code>Object</code> \| <code>string</code> - The details of the next track or an error message.  

| Param | Type | Description |
| --- | --- | --- |
| room | <code>string</code> | The name of a room in the Sonos system. |

<a name="SonosController+getAlbumArt"></a>

### .getAlbumArt(albumArtUri) ⇒ <code>Image</code>
Returns the album art as an [Image](https://docs.scriptable.app/image/) object.


**Returns**: <code>Image</code> - An [Image](https://docs.scriptable.app/image/) object or `null` if the image could not be loaded.  

| Param | Type | Description |
| --- | --- | --- |
| albumArtUri | <code>string</code> | The album art URI returned by `getCurrentTrack` or `getNextTrack`. |

<a name="SonosController+getAlbumArtAsBase64"></a>

### .getAlbumArtAsBase64(albumArtUri) ⇒ <code>string</code>
Returns the album art as a base64 encoded string.


**Returns**: <code>string</code> - A base64 encoded string or `null` if the image could not be encoded.  

| Param | Type | Description |
| --- | --- | --- |
| albumArtUri | <code>string</code> | The album art URI returned by `getCurrentTrack` or `getNextTrack`. |

<a name="SonosController+play"></a>

### .play(room) ⇒ <code>string</code>
Starts playback in `room`.


**Returns**: <code>string</code> - The status of the underlying API call if the call is successful. Otherwise returns an error message.  

| Param | Type | Description |
| --- | --- | --- |
| room | <code>string</code> | The name of a room in the Sonos system. |

<a name="SonosController+pause"></a>

### .pause(room) ⇒ <code>string</code>
Pauses playback in `room`.


**Returns**: <code>string</code> - The status of the underlying API call if the call is successful. Otherwise returns an error message.  

| Param | Type | Description |
| --- | --- | --- |
| room | <code>string</code> | The name of a room in the Sonos system. |

<a name="SonosController+next"></a>

### .next(room) ⇒ <code>string</code>
Skips to the next track in `room`.


**Returns**: <code>string</code> - The status of the underlying API call if the call is successful. Otherwise returns an error message.  

| Param | Type | Description |
| --- | --- | --- |
| room | <code>string</code> | The name of a room in the Sonos system. |

<a name="SonosController+previous"></a>

### .previous(room) ⇒ <code>string</code>
Returns to the previous track in `room`.


**Returns**: <code>string</code> - The status of the underlying API call if the call is successful. Otherwise returns an error message.  

| Param | Type | Description |
| --- | --- | --- |
| room | <code>string</code> | The name of a room in the Sonos system. |

<a name="SonosController+toggle"></a>

### .toggle(room) ⇒ <code>string</code>
Resumes playback (if currently paused) or pauses playback (if currently playing) in `room`.


**Returns**: <code>string</code> - The status of the underlying API call if the call is successful. Otherwise returns an error message.  

| Param | Type | Description |
| --- | --- | --- |
| room | <code>string</code> | The name of a room in the Sonos system. |

<a name="SonosController+setRoomVolume"></a>

### .setRoomVolume(room, volume) ⇒ <code>string</code>
Sets the volume in `room` to the amount specified by `volume`.


**Returns**: <code>string</code> - The status of the underlying API call if the call is successful. Otherwise returns an error message.  

| Param | Type | Description |
| --- | --- | --- |
| room | <code>string</code> | The name of a room in the Sonos system. |
| volume | <code>number</code> | The desired absolute volume percentage (e.g., 50 will set the volume to 50%). Do not include '%'. |

<a name="SonosController+playFavorite"></a>

### .playFavorite(favorite, room) ⇒ <code>string</code>
Plays a favorite station, playlist, etc. in `room`.


**Returns**: <code>string</code> - The status of the underlying API call if the call is successful. Otherwise returns an error message.  

| Param | Type | Description |
| --- | --- | --- |
| favorite | <code>string</code> | The name of a "favorited" station, playlist, etc. |
| room | <code>string</code> | The name of a room in the Sonos system. |

<a name="SonosController+playFavoriteEverywhere"></a>

### .playFavoriteEverywhere(favorite) ⇒ <code>string</code>
Plays a favorite station, playlist, etc. in all rooms. Internally, this method calls `groupAllRoomsWith` with the first room returned by `getRooms`, then it calls `playFavorite` with that same room.


**Returns**: <code>string</code> - The status of the underlying API call if the call is successful. Otherwise returns an error message.  

| Param | Type | Description |
| --- | --- | --- |
| favorite | <code>string</code> | The name of a "favorited" station, playlist, etc. |

<a name="SonosController+playPlaylist"></a>

### .playPlaylist(playlist, room) ⇒ <code>string</code>
Plays a Sonos playlist in `room`.


**Returns**: <code>string</code> - The status of the underlying API call if the call is successful. Otherwise returns an error message.  

| Param | Type | Description |
| --- | --- | --- |
| playlist | <code>string</code> | The name of a Sonos playlist. |
| room | <code>string</code> | The name of a room in the Sonos system. |

<a name="SonosController+playPlaylistEverywhere"></a>

### .playPlaylistEverywhere(playlist) ⇒ <code>string</code>
Plays a Sonos playlist in all rooms. Internally, this method calls `groupAllRoomsWith` with the first room returned by `getRooms`, then it calls `playPlaylist` with that same room.


**Returns**: <code>string</code> - The status of the underlying API call if the call is successful. Otherwise returns an error message.  

| Param | Type | Description |
| --- | --- | --- |
| playlist | <code>string</code> | The name of a Sonos playlist. |

<a name="SonosController+group"></a>

### .group(room, others) ⇒ <code>string</code>
Groups `others` with `room` ("other" rooms will start playing whatever is playing in `room`).


**Returns**: <code>string</code> - Returns 'success' if all `others` were successfully grouped with `room`. Otherwise returns 'error'.  

| Param | Type | Description |
| --- | --- | --- |
| room | <code>string</code> | The name of a room in the Sonos system. |
| others | <code>Array</code> | An array of one or more room names. |

<a name="SonosController+groupAllRoomsWith"></a>

### .groupAllRoomsWith(room) ⇒ <code>string</code>
Groups all rooms with `room` (all other rooms will start playing whatever is playing in `room`). Internally, this method calls `group` and simply returns the output from that call.


**Returns**: <code>string</code> - Returns 'success' if all rooms were successfully grouped with `room`. Otherwise returns 'error'.  

| Param | Type | Description |
| --- | --- | --- |
| room | <code>string</code> | The name of a room in the Sonos system. |

<a name="SonosController+ungroup"></a>

### .ungroup(rooms) ⇒ <code>string</code>
Removes `rooms` from their current group(s). (Playback will stop in `rooms`.)


**Returns**: <code>string</code> - Returns 'success' if all rooms were successfully ungrouped. Otherwise returns 'error'.  

| Param | Type | Description |
| --- | --- | --- |
| rooms | <code>Array</code> | An array of one or more room names. |

<a name="SonosController+ungroupAllRoomsFrom"></a>

### .ungroupAllRoomsFrom(room) ⇒ <code>string</code>
Ungroups all rooms from `room`. (`room` will remain as a standalone player; playback will stop in all other rooms.) Internally, this method calls `ungroup` and simply returns the output from that call.


**Returns**: <code>string</code> - Returns 'success' if all rooms were successfully ungrouped. Otherwise returns 'error'.  

| Param | Type | Description |
| --- | --- | --- |
| room | <code>string</code> | The name of a room in the Sonos system. |

<a name="SonosController+getRoomsInGroupInclusive"></a>

### .getRoomsInGroupInclusive(room) ⇒ <code>Array</code> \| <code>string</code>
Returns the list of rooms grouped with `room` (including `room`).


**Returns**: <code>Array</code> \| <code>string</code> - An array of room names. If `room` is not grouped, the method will return an array of one room. If an error occurs, the method returns an error message.  

| Param | Type | Description |
| --- | --- | --- |
| room | <code>string</code> | The name of a room in the Sonos system. |

<a name="SonosController+getRoomsInGroupExclusive"></a>

### .getRoomsInGroupExclusive(room) ⇒ <code>Array</code> \| <code>string</code>
Returns the list of rooms grouped with `room` (excluding `room`).


**Returns**: <code>Array</code> \| <code>string</code> - An array of room names. If `room` is not grouped, the array will be empty. If an error occurs, the method returns an error message.  

| Param | Type | Description |
| --- | --- | --- |
| room | <code>string</code> | The name of a room in the Sonos system. |

<a name="SonosController+setGroupVolume"></a>

### .setGroupVolume(room, volume) ⇒ <code>string</code>
Sets the volume of the group controlled by `room` to the amount specified by `volume`.


**Returns**: <code>string</code> - The status of the underlying API call if the call is successful. Otherwise returns an error message.  

| Param | Type | Description |
| --- | --- | --- |
| room | <code>string</code> | The name of a room in the Sonos system. |
| volume | <code>number</code> | The desired absolute volume percentage (e.g., 50 will set the volume to 50%). Do not include '%'. |

