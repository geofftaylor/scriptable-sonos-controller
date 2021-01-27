// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: yellow; icon-glyph: play-circle;
/**
 * SonosController is a wrapper around the Sonos HTTP API.
 * @param {string} sonosServerUrl The IP address and port where the Sonos HTTP API server is listening.
 */
class SonosController {
  constructor(sonosServerUrl) {
    this.sonosBaseUrl = sonosServerUrl.endsWith('/') ? sonosServerUrl : sonosServerUrl + '/';
  }

  actions = {
    zones: 'zones',
    services: 'services/all',
    state: 'state',
    favorite: 'favorite',
    favorites: 'favorites',
    playlist: 'playlist',
    playlists: 'playlists',
    play: 'play',
    pause: 'pause',
    toggle: 'playpause',
    next: 'next',
    volume: 'volume',
    groupVolume: 'groupvolume',
    previous: 'previous',
    addPlayer: 'add',
    ungroup: 'ungroup'
  }

  // *********************************************************************
  // INTERNAL METHODS
  // *********************************************************************

  /**
   * Returns `room` converted to lowercase with a slash appended.
   * @param {string} room The name of a room in the Sonos system.
   * @returns {string}
   */
  _formatRoomForUrl(room) {
    let formatted = room.toLowerCase();
    formatted = encodeURIComponent(formatted) + '/';
    return formatted;
  }

  /**
   * Returns the JSON response from an system API action (i.e., an action not performed on a specific room).
   * @param {string} endpoint The API endpoint.
   * @returns {Object} The JSON response.
   * @throws Throws an exception if the API call is not successful.
   */
  async _getResponse(action) {
    let url = this.sonosBaseUrl + this.actions[action];
    let req = new Request(url=url);
    let resp = null;

    try {
      resp = await req.loadJSON();
    } catch (error) {
      throw error;
    }

    return resp;
  }

  /**
   * Returns the JSON response from the API's `state` endpoint.
   * @param {string} room The name of a room in the Sonos system.
   * @returns {Object} The state data for `room`.
   * @throws Throws an exception if the API call is not successful.
   */
  async _getRoomState(room) {
    let url = this.sonosBaseUrl + this._formatRoomForUrl(room) + this.actions.state;
    let req = new Request(url=url);
    let resp = null;

    try {
      resp = await req.loadJSON();
    } catch (error) {
      throw error;
    }

    return resp;
  }

  /**
   * Performs an API action in `room`.
   * @param {string} action The action to perform, e.g., 'play'.
   * @param {string} room   The name of a room in the Sonos system.
   * @param {Array}  params (Optional) Any additional parameters required by the API call. Each member of the array is appended to the URL after the API endpoint.
   * @returns {string} The status of the underlying API call, e.g., 'success'.
   * @throws Throws an exception if the underlying API call is not successful.
   */
  async _performActionInRoom(action, room, params=[]) {
    let url = this.sonosBaseUrl + this._formatRoomForUrl(room) + this.actions[action];

    if (params.length > 0) {
      for (let p of params) {
        p = encodeURIComponent(p);
        url = `${url}/${p}`;
      }
    }

    let req = new Request(url=url);
    let resp = null;
    
    try {
      resp = await req.loadJSON();
    } catch (error) {
      throw error;
    }

    return resp['status'];
  }

  /**
   * Gets the music service from a track's URI.
   * @param {string} uri The URI of a track. The track URI is included in the output of `getCurrentTrack()` and `getNextTrack()`.
   * @returns {string} The name of the music service.
   * @throws Throws an exception if the underlying API call is not successful.
   */
  async _getServiceFromTrackUri(uri) {
    // Construct an object containing the ID and name for each available service.
    let serviceInfo = null;

    try {
      serviceInfo = await this.getServices();
    } catch (error) {
      throw error;
    }

    let services = {};
    for (let serviceName in serviceInfo) {
      let id = serviceInfo[serviceName]['id'];
      services[id] = serviceName;
    }

    // Find the service ID in the track's URI. It's the value of the "sid" parameter (always a number).
    let serviceId = null;
    const sidRegex = /sid=\d+/g;
    let match = uri.match(sidRegex);

    if (match.length == 1) {
      serviceId = match[0].split('=')[1];
    } else {
      throw 'error: "sid" parameter not found in track URI.'
    }

    return services[serviceId];
  }

  // *********************************************************************
  // SYSTEM INFORMATION METHODS
  // *********************************************************************

  /**
   * Tests connectivity to the Sonos HTTP API server.
   * @returns {boolean} Returns `true` if the controller can communicate with the server. Otherwise returns `false`.
   */
  async isConnected() {
    // Calling the 'services' endpoint without any parameters should return {'status': 'success'}.
    let url = this.sonosBaseUrl + 'services';
    let req = new Request(url=url);
    let connected = null;

    try {
      let resp = await req.loadJSON();
      if (resp['status'] === 'success') {
        connected = true
      } else {
        connected = false;
      }
    } catch (error) {
      connected = false;
    }

    return connected;
  }

  /**
   * Returns a list of all supported music services. (Not all of the services may be in use on the system.)
   * @returns {(Object|string)} An object containing the supported music services or an error message.
   */
  async getServices() {
    let result = null;

    try {
      result = await this._getResponse('services');
    } catch (error) {
      result = `error: ${error}`;
    }

    return result;
  }

  /**
   * Returns a list of the system's zones.
   * @returns {(Array|string)} An array of objects or an error message.
   */
  async getZones() {
    let result = null;

    try {
      result = await this._getResponse('zones');
    } catch (error) {
      result = `error: ${error}`;
    }

    return result;
  }

  /**
   * Returns the names of all rooms in the system.
   * @returns {(Array|string)} An array of room names or an error message.
   */
  async getRooms() {
    let result = null;
    
    try {
      let zones = await this._getResponse('zones');
      let allMembers = zones.flatMap(z => z['members']);
      result = allMembers.map(z => z['roomName']);
    } catch (error) {
      result = `error: ${error}`;
    }

    return result;
  }

  /**
   * Returns a list of groups.
   * @returns {(Array|string)} An array of arrays. Each array represents one group and contains the names of the rooms in that group (which could be a single room, if that room is not grouped). If an error occurred, returns an error message instead of an array.
   */
  async getGroups() {
    let groups = [];

    try {
      let zones = await this.getZones();

      for (let z of zones) {
        let zoneMembers = z['members'];
        let roomsInGroup = zoneMembers.map(r => r['roomName']);
        groups.push(roomsInGroup);
      }
    } catch (error) {
      return `error: ${error}`;
    }

    return groups;
  }

  /**
   * Returns a list of the stations, playlists, etc. that have been marked as favorites.
   * @returns {(Array|string)} An array of favorites or an error message.
   */
  async getFavorites() {
    let result = null;

    try {
      result = await this._getResponse('favorites');
    } catch (error) {
      result = `error: ${error}`;
    }

    return result;
  }

  /**
   * Returns a list of Sonos playlists.
   * @returns {(Array|string)} An array of playlists or an error message.
   */
  async getPlaylists() {
    let result = null;

    try {
      result = await this._getResponse('playlists');
    } catch (error) {
      result = `error: ${error}`;
    }

    return result;
  }

  // *********************************************************************
  // ROOM (PLAYER) INFORMATION METHODS
  // *********************************************************************

  /**
   * Returns the current playback state of `room` (e.g., PLAYING, STOPPED).
   * @param {string} room The name of a room in the Sonos system.
   * @returns {string} The current playback state or an error message.
   */
  async getCurrentPlaybackState(room) {
    let resp = null;
    let playbackState = null;

    try {
      resp = await this._getRoomState(room);
      playbackState = resp['playbackState'];
    } catch (error) {
      playbackState = `error: ${error}`;
    }

    return playbackState;
  }

  /**
   * Returns the details of the track currently playing in `room`. The returned object contains the following keys:
   * `artist`, `title`, `album`, `albumArtUri`, `room`, `type`, `service`, `station`, `trackUri`.
   * @param {string} room The name of a room in the Sonos system.
   * @returns {(Object|string)} The details of the current track or an error message.
   */
  async getCurrentTrack(room) {
    let resp = null;
    let service = null;
    let currentTrack = null;
    let result = null;

    try {
      resp = await this._getRoomState(room);
      currentTrack = resp['currentTrack'];
    } catch (error) {
      result = `error retrieving state of room "${room}": ${error}`;
    }

    if (currentTrack !== null) {
      try {
        service = await this._getServiceFromTrackUri(currentTrack['uri']);
      } catch (error) {
        service = `error - Unable to determine service: ${error}`;
      }
      
      let trackDetails = {
        artist: currentTrack['artist'],
        title: currentTrack['title'],
        album: currentTrack['album'],
        albumArtUri: currentTrack['absoluteAlbumArtUri'],
        room: room,
        type: currentTrack['type'],
        service: service,
        station: currentTrack['stationName'],
        trackUri: currentTrack['uri'],
      }

      result = trackDetails
    }

    return result;
  }

  /**
   * Returns the details of the next queued track in `room`. The returned object contains the following keys:
   * `artist`, `title`, `album`, `albumArtUri`, `room`, `service`, `trackUri`.
   * @param {string} room The name of a room in the Sonos system.
   * @returns {(Object|string)} The details of the next track or an error message.
   */
  async getNextTrack(room) {
    let resp = null;
    let service = null;
    let nextTrack = null;
    let result = null;

    try {
      resp = await this._getRoomState(room);
      nextTrack = resp['nextTrack'];
    } catch (error) {
      result = `error retrieving state of room "${room}": ${error}`;
    }

    if (nextTrack !== null) {
      // Some services don't include next track information.
      // If next track information isn't present, the function will return null.
      if (nextTrack['title'].length > 0) {
        try {
          service = await this._getServiceFromTrackUri(nextTrack['uri']);
        } catch (error) {
          service = `error - Unable to determine service: ${error}`;
        }
        
        let trackDetails = {
          artist: nextTrack['artist'],
          title: nextTrack['title'],
          album: nextTrack['album'],
          albumArtUri: nextTrack['absoluteAlbumArtUri'],
          room: room,
          service: service,
          trackUri: nextTrack['uri'],
        }

        result = trackDetails;
      }
    }

    return result;
  }

  /**
   * Returns the album art as an [Image](https://docs.scriptable.app/image/) object.
   * @param {string} albumArtUri The album art URI returned by `getCurrentTrack` or `getNextTrack`.
   * @returns {Image} An [Image](https://docs.scriptable.app/image/) object or `null` if the image could not be loaded.
   */
  async getAlbumArt(albumArtUri) {
    let req = new Request(albumArtUri);
    let image = null;

    try {
      image = await req.loadImage();
    } catch (error) {
      image = null;
    }

    return image;
  }

  /**
   * Returns the album art as a base64 encoded string.
   * @param {string} albumArtUri The album art URI returned by `getCurrentTrack` or `getNextTrack`.
   * @returns {string} A base64 encoded string or `null` if the image could not be encoded.
   */
  async getAlbumArtAsBase64(albumArtUri) {
    let image = null;
    let data = null;

    try {
      image = await this.getAlbumArt(albumArtUri);
    } catch (error) {
      // No need to continue.
      return null;
    }

    try {
      // Try to create a Data object from a JPEG image.
      data = Data.fromJPEG(image);
    } catch (error) {
      try {
        // If it can't be created from a JPEG, try to create it from a PNG image.
        data = Data.fromPNG(image);
      } catch (error) {
        // If it can't be created from a JPEG or a PNG, return null.
        return null;
      }
    }

    return data.toBase64String();
  }

  // *********************************************************************
  // ROOM (PLAYER) CONTROL METHODS
  // *********************************************************************

  /**
   * Starts playback in `room`.
   * @param {string} room The name of a room in the Sonos system.
   * @returns {string} The status of the underlying API call if the call is successful. Otherwise returns an error message.
   */
  async play(room) {
    let result = null;

    try {
      result = await this._performActionInRoom('play', room);
    } catch (error) {
      result = `error: ${error}`;
    }
    
    return result;
  }

  /**
   * Pauses playback in `room`.
   * @param {string} room The name of a room in the Sonos system.
   * @returns {string} The status of the underlying API call if the call is successful. Otherwise returns an error message.
   */
  async pause(room) {
    let result = null;

    try {
      result = await this._performActionInRoom('pause', room);
    } catch (error) {
      result = `error: ${error}`;
    }
    
    return result;
  }

  /**
   * Skips to the next track in `room`.
   * @param {string} room The name of a room in the Sonos system.
   * @returns {string} The status of the underlying API call if the call is successful. Otherwise returns an error message.
   */
  async next(room) { 
    let result = null;

    try {
      result = await this._performActionInRoom('next', room);
    } catch (error) {
      result = `error: ${error}`;
    }
    
    return result;
  }

  /**
   * Returns to the previous track in `room`.
   * @param {string} room The name of a room in the Sonos system.
   * @returns {string} The status of the underlying API call if the call is successful. Otherwise returns an error message.
   */
  async previous(room) {
    let result = null;

    try {
      result = await this._performActionInRoom('previous', room);
    } catch (error) {
      result = `error: ${error}`;
    }
    
    return result;
  }

  /**
   * Resumes playback (if currently paused) or pauses playback (if currently playing) in `room`.
   * @param {string} room The name of a room in the Sonos system.
   * @returns {string} The status of the underlying API call if the call is successful. Otherwise returns an error message.
   */
  async toggle(room) {
    let result = null;

    try {
      result = await this._performActionInRoom('toggle', room);
    } catch (error) {
      result = `error: ${error}`;
    }
    
    return result;
  }

  /**
   * Sets the volume in `room` to the amount specified by `volume`.
   * @param {string} room   The name of a room in the Sonos system.
   * @param {number} volume The desired absolute volume percentage (e.g., 50 will set the volume to 50%). Do not include '%'.
   * @returns {string} The status of the underlying API call if the call is successful. Otherwise returns an error message.
   */
  async setRoomVolume(room, volume) {
    let result = null;

    try {
      result = await this._performActionInRoom('volume', room, [volume]);
    } catch (error) {
      result = `error: ${error}`;
    }

    return result;
  }

  /**
   * Plays a favorite station, playlist, etc. in `room`.
   * @param {string} favorite The name of a "favorited" station, playlist, etc.
   * @param {string} room     The name of a room in the Sonos system.
   * @returns {string} The status of the underlying API call if the call is successful. Otherwise returns an error message.
   */
  async playFavorite(favorite, room) {
    let result = null;

    try {
      result = await this._performActionInRoom('favorite', room, [favorite]);
    } catch (error) {
      result = `error: ${error}`;
    }

    return result;
  }

  /**
   * Plays a favorite station, playlist, etc. in all rooms. Internally, this method calls `groupAllRoomsWith` with the first room returned by `getRooms`, then it calls `playFavorite` with that same room.
   * @param {string} favorite The name of a "favorited" station, playlist, etc.
   * @returns {string} The status of the underlying API call if the call is successful. Otherwise returns an error message.
   */
  async playFavoriteEverywhere(favorite) {
    let allRooms = null;
    let room = null;
    let result = null;

    try {
      allRooms = await this.getRooms();
      room = allRooms[0];
    } catch (error) {
      result = `error: ${error}`;

      // No need to continue.
      return result;
    }

    try {
      result = await this.groupAllRoomsWith(room);
    } catch (error) {
      result = `error: ${error}`;

      // No need to continue.
      return result;
    }

    try {
      result = await this.playFavorite(favorite, room);
    } catch (error) {
      result = `error: ${error}`;
    }

    return result;
  }

  /**
   * Plays a Sonos playlist in `room`.
   * @param {string} playlist The name of a Sonos playlist.
   * @param {string} room     The name of a room in the Sonos system.
   * @returns {string} The status of the underlying API call if the call is successful. Otherwise returns an error message.
   */
  async playPlaylist(playlist, room) {
    let result = null;

    try {
      result = await this._performActionInRoom('playlist', room, [playlist]);
    } catch (error) {
      result = `error: ${error}`;
    }

    return result;
  }

  /**
   * Plays a Sonos playlist in all rooms. Internally, this method calls `groupAllRoomsWith` with the first room returned by `getRooms`, then it calls `playPlaylist` with that same room.
   * @param {string} playlist The name of a Sonos playlist.
   * @returns {string} The status of the underlying API call if the call is successful. Otherwise returns an error message.
   */
  async playPlaylistEverywhere(playlist) {
    let allRooms = null;
    let room = null;
    let result = null;

    try {
      allRooms = await this.getRooms();
      room = allRooms[0];
    } catch (error) {
      result = `error: ${error}`;

      // No need to continue.
      return result;
    }

    try {
      result = await this.groupAllRoomsWith(room);
    } catch (error) {
      result = `error: ${error}`;

      // No need to continue.
      return result;
    }

    try {
      result = await this.playPlaylist(playlist, room);
    } catch (error) {
      result = `error: ${error}`;
    }

    return result;
  }

  // *********************************************************************
  // GROUP CONTROL METHODS
  // *********************************************************************

  /**
   * Groups `others` with `room` ("other" rooms will start playing whatever is playing in `room`).
   * @param {string} room   The name of a room in the Sonos system.
   * @param {Array}  others An array of one or more room names.
   * @returns {string} Returns 'success' if all `others` were successfully grouped with `room`. Otherwise returns 'error'.
   */
  async group(room, others) {
    const isSuccess = (currentValue) => currentValue === 'success';
    let status = null;
    let result = [];

    for (let other of others) {
      // Don't try to group `room` with itself.
      if (other !== room) {
        let resp = null;

        try {
          resp = await this._performActionInRoom('addPlayer', room, [other]);
          result.push(resp);
        } catch (error) {
          result.push('error');
        }
      }
    }

    if (result.every(isSuccess)) {
      status = 'success';
    } else {
      status = 'error';
    }

    return status;
  }

  /**
   * Groups all rooms with `room` (all other rooms will start playing whatever is playing in `room`). Internally, this method calls `group` and simply returns the output from that call.
   * @param {string} room The name of a room in the Sonos system.
   * @returns {string} Returns 'success' if all rooms were successfully grouped with `room`. Otherwise returns 'error'.
   */
  async groupAllRoomsWith(room) {
    let allRooms = null;
    let result = null;

    try {
      allRooms = await this.getRooms();
    } catch (error) {
      result = 'error';

      // No need to continue.
      return result;
    }

    try {
      // Remove `room` from `allRooms`.
      let otherRooms = allRooms.filter(a => a !== room);
      result = await this.group(room, otherRooms);
    } catch (error) {
      result = 'error';
    }

    return result;
  }

  /**
   * Removes `rooms` from their current group(s). (Playback will stop in `rooms`.)
   * @param {Array} rooms An array of one or more room names.
   * @returns {string} Returns 'success' if all rooms were successfully ungrouped. Otherwise returns 'error'.
   */
  async ungroup(rooms) {
    const isSuccess = (currentValue) => currentValue === 'success';
    let status = null;
    let result = [];

    for (let room of rooms) {
      try {
        let resp = await this._performActionInRoom('ungroup', room);
        result.push(resp);
      } catch (error) {
        result.push('error');
      }
    }
    
    if (result.every(isSuccess)) {
      status = 'success';
    } else {
      status = 'error';
    }

    return status;
  }

  /**
   * Ungroups all rooms from `room`. (`room` will remain as a standalone player; playback will stop in all other rooms.) Internally, this method calls `ungroup` and simply returns the output from that call.
   * @param {string} room The name of a room in the Sonos system.
   * @returns {string} Returns 'success' if all rooms were successfully ungrouped. Otherwise returns 'error'.
   */
  async ungroupAllRoomsFrom(room) {
    let roomsToUngroup = null;
    let result = null;

    // Find the group that contains `room`.
    try {
      let groups = await this.getGroups();

      for (let g of groups) {
        if (g.includes(room)) {
          // If `room` is in the group, return the other members.
          roomsToUngroup = g.filter(r => r !== room);
          break;
        }
      }
    } catch (error) {
      result = 'error';

      // No need to continue.
      return result;
    }

    if (roomsToUngroup === null) {
      // `room` isn't in a group; there's nothing to do.
      result = 'success';
    } else {
      try {
        result = await this.ungroup(roomsToUngroup);
      } catch (error) {
        result = 'error';
      }
    }

    return result;
  }

  /**
   * Returns the list of rooms grouped with `room` (including `room`).
   * @param {string} room The name of a room in the Sonos system.
   * @returns {(Array|string)} An array of room names. If `room` is not grouped, the method will return an array of one room. If an error occurs, the method returns an error message.
   */
  async getRoomsInGroupInclusive(room) {
    let result = null;

    // Find the group that contains `room`.
    try {
      let groups = await this.getGroups();

      for (let g of groups) {
        if (g.includes(room)) {
          // If `room` is in the group, return the group.
          result = g;
          break;
        }
      }
    } catch (error) {
      result = `error: ${error}`;
    }

    if (result === null || result.length < 1) {
      // We should return a non-empty array or an error message.
      result = 'error';
    }

    return result;
  }

  /**
   * Returns the list of rooms grouped with `room` (excluding `room`).
   * @param {string} room The name of a room in the Sonos system.
   * @returns {(Array|string)} An array of room names. If `room` is not grouped, the array will be empty. If an error occurs, the method returns an error message.
   */
  async getRoomsInGroupExclusive(room) {
    let result = null;

    // Find the group that contains `room`.
    try {
      let groups = await this.getGroups();

      for (let g of groups) {
        if (g.includes(room)) {
          // If `room` is in the group, return the other members. (This will result in an empty array if `room` is the only member).
          result = g.filter(r => r !== room);
          break;
        }
      }
    } catch (error) {
      result = error;
    }

    if (result === null) {
      // We should return an array or an error message.
      result = 'error';
    }

    return result;
  }

  /**
   * Sets the volume of the group controlled by `room` to the amount specified by `volume`.
   * @param {string} room   The name of a room in the Sonos system.
   * @param {number} volume The desired absolute volume percentage (e.g., 50 will set the volume to 50%). Do not include '%'.
   * @returns {string} The status of the underlying API call if the call is successful. Otherwise returns an error message.
   */
  async setGroupVolume(room, volume) {
    let result = null;

    try {
      result = await this._performActionInRoom('groupVolume', room, [volume]);
    } catch (error) {
      result = `error: ${error}`;
    }

    return result;
  }
}

module.exports = SonosController;