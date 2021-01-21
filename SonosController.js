/**
 * SonosController is a wrapper around the Sonos HTTP API.
 * @param {string} sonosServerUrl The IP address and port where the Sonos HTTP API server is listening.
 */
class SonosController {
  constructor(sonosServerUrl) {
    this.sonosBaseUrl = sonosServerUrl.endsWith('/') ? sonosServerUrl : sonosServerUrl + '/';
  }

  endPoints = {
    zones: 'zones',
    services: 'services/all',
    state: 'state',
    favorite: 'favorite/',
    favorites: 'favorites',
    playlist: 'playlist/',
    playlists: 'playlists',
    play: 'play',
    pause: 'pause',
    toggle: 'playpause',
    next: 'next',
    volume: 'volume/',
    groupvolume: 'groupvolume/',
    previous: 'previous',
    addPlayer: 'add/',
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
    let formatted = room.toLowerCase() + '/';
    return formatted;
  }

  /**
   * Returns the JSON response from an API endpoint.
   * @param {string} endpoint The API endpoint.
   * @returns {Object} The JSON response.
   * @throws Throws an exception if the API call is not successful.
   */
  async _getResponse(endpoint) {
    let url = this.sonosBaseUrl + this.endPoints[endpoint];
    url = encodeURI(url);
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
   * Performs a room action that takes no parameters and returns only a status message.
   * @param {string} action The action to perform, e.g., 'play'.
   * @param {string} room   The name of a room in the Sonos system.
   * @returns {string} The status of the underlying API call, e.g., 'success'.
   * @throws Throws an exception if the underlying API call is not successful.
   */
  async _performActionInRoom(action, room) {
    let url = this.sonosBaseUrl + this._formatRoomForUrl(room) + this.endPoints[action];
    url = encodeURI(url);
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
    url = encodeURI(url);
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
    let url = this.sonosBaseUrl + this._formatRoomForUrl(room) + this.endPoints.state;
    url = encodeURI(url);
    let req = new Request(url=url);
    let resp = null;
    let status = null;

    try {
      resp = await req.loadJSON();
      status = resp['playbackState'];
    } catch (error) {
      status = `error: ${error}`;
    }

    return status;
  }

  /**
   * Returns the details of the track currently playing in `room`. The returned object contains the following keys:
   * `artist`, `title`, `album`, `artworkUri`, `type`, `service`, `station`, `trackUri`.
   * @param {string} room The name of a room in the Sonos system.
   * @returns {(Object|string)} The details of the current track or an error message.
   */
  async getCurrentTrack(room) {
    let url = this.sonosBaseUrl + this._formatRoomForUrl(room) + this.endPoints.state;
    url = encodeURI(url);
    let req = new Request(url=url);
    let resp = null;
    let service = null;
    let currentTrack = null;
    let result = null;

    try {
      resp = await req.loadJSON();
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
        artworkUri: currentTrack['absoluteAlbumArtUri'],
        type: currentTrack['type'],
        service: service,
        station: currentTrack['station'],
        trackUri: currentTrack['uri'],
      }

      result = trackDetails
    }

    return result;
  }

  /**
   * Returns the details of the next queued track in `room`. The returned object contains the following keys:
   * `artist`, `title`, `album`, `artworkUri`, `type`, `service`, `station`, `trackUri`.
   * @param {string} room The name of a room in the Sonos system.
   * @returns {(Object|string)} The details of the next track or an error message.
   */
  async getNextTrack(room) {
    let url = this.sonosBaseUrl + this._formatRoomForUrl(room) + this.endPoints.state;
    url = encodeURI(url);
    let req = new Request(url=url);
    let resp = null;
    let service = null;
    let nextTrack = null;
    let result = null;

    try {
      resp = await req.loadJSON();
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
          artworkUri: nextTrack['absoluteAlbumArtUri'],
          type: nextTrack['type'],
          service: service,
          station: nextTrack['station'],
          trackUri: nextTrack['uri'],
        }

        result = trackDetails;
      }
    }

    return result;
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
    let url = this.sonosBaseUrl + this._formatRoomForUrl(room) + this.endPoints.volume + volume;
    url = encodeURI(url);
    let req = new Request(url=url);
    let resp = null;
    let result = null;

    try {
      resp = await req.loadJSON();
      result = resp['status'];
    } catch (error) {
      result = `error: ${error}`;
    }

    return result;
  }

  /**
   * Plays a favorite (station, playlist, etc.) in `room`.
   * @param {string} favorite The name of a "favorited" station, playlist, etc.
   * @param {string} room     The name of a room in the Sonos system.
   * @returns {string} The status of the underlying API call if the call is successful. Otherwise returns an error message.
   */
  async playFavorite(favorite, room) {
    let url = this.sonosBaseUrl + this._formatRoomForUrl(room) + this.endPoints.favorite + favorite;
    url = encodeURI(url);
    let req = new Request(url=url);
    let resp = null;
    let result = null;

    try {
      resp = await req.loadJSON();
      result = resp['status'];
    } catch (error) {
      result = `error: ${error}`;
    }

    return result;
  }

  /**
   * Plays a favorite (station, playlist, etc.) in all rooms. Internally, this method calls `groupAllRoomsWith` with the first room returned by `getRooms`, then it calls `playFavorite` with that same room.
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
    let url = this.sonosBaseUrl + this._formatRoomForUrl(room) + this.endPoints.playlist + playlist;
    url = encodeURI(url);
    let req = new Request(url=url);
    let resp = null;
    let result = null;

    try {
      resp = await req.loadJSON();
      result = resp['status'];
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
   * @returns {Object} An object in the form `{status: 'success', rooms: [{name: 'Room 1', status: 'success'}, {name: 'Room 2', status: 'success'}]}`. If all rooms were successfully grouped, `status` will be 'success'. If at least one room couldn't be grouped, `status` will be 'error'. The `rooms` array contains the result of attempting to add each room to the group.
   */
  async group(room, others) {
    const isSuccess = (currentValue) => currentValue === 'success';
    let status = null;

    let result = {
      status: status,
      rooms: []
    }

    for (let other of others) {
      // Don't try to group `room` with itself.
      if (other !== room) {
        let url = this.sonosBaseUrl + this._formatRoomForUrl(room) + this.endPoints.addPlayer + this._formatRoomForUrl(other);
        url = encodeURI(url);
        let req = new Request(url=url);
        let resp = null;

        try {
          resp = await req.loadJSON();
          result.rooms.push({name: other, status: resp['status']});
        } catch (error) {
          result.rooms.push({name: other, status: error});
        }
      }
    }

    if (result.rooms.flatMap(o => o['status']).every(isSuccess)) {
      status = 'success';
    } else {
      status = 'error';
    }

    result.status = status;

    return result;
  }

  /**
   * Groups all rooms with `room` (all other rooms will start playing whatever is playing in `room`). Internally, this method calls `group` and simply returns the output from that call.
   * @param {string} room The name of a room in the Sonos system.
   * @returns {Object} If the call to `group` is successful, this method returns the same output as `group`. If the call to `group` fails, this method returns the object `{status: 'error'}`, potentially with a detailed error message.
   */
  async groupAllRoomsWith(room) {
    let allRooms = null;
    let result = null;

    try {
      allRooms = await this.getRooms();
    } catch (error) {
      result = {status: `error: ${error}`};
    }

    try {
      // Remove `room` from `allRooms`.
      let otherRooms = allRooms.filter(a => a !== room);
      result = await this.group(room, otherRooms);
    } catch (error) {
      result = {status: `error: ${error}`};
    }

    return result;
  }

  /**
   * Removes `rooms` from their current group(s). (Playback will stop in `rooms`.)
   * @param {Array} rooms An array of one or more room names.
   * @returns {Object} An object in the form `{status: 'success', rooms: [{name: 'Room 1', status: 'success'}, {name: 'Room 2', status: 'success'}]}`. If all rooms were successfully ungrouped, `status` will be 'success'. If at least one room couldn't be ungrouped, `status` will be 'error'. The `rooms` array contains the result of attempting to ungroup each room.
   */
  async ungroup(rooms) {
    const isSuccess = (currentValue) => currentValue === 'success';
    let status = null;

    let result = {
      status: status,
      rooms: []
    }

    for (let room of rooms) {
      try {
        let resp = await this._performActionInRoom('ungroup', room);
        result.rooms.push({name: room, status: resp['status']});
      } catch (error) {
        result.rooms.push({name: room, status: error});
      }
    }
    
    if (result.rooms.flatMap(o => o['status']).every(isSuccess)) {
      status = 'success';
    } else {
      status = 'error';
    }
    
    result.status = status;

    return result;
  }

  /**
   * Ungroups all rooms from `room`. (`room` will remain as a standalone player; playback will stop in all other rooms.) Internally, this method calls `ungroup` and simply returns the output from that call.
   * @param {string} room The name of a room in the Sonos system.
   * @returns {Object} If the call to `ungroup` is successful, this method returns the same output as `ungroup`. If the call to `ungroup` fails, this method returns the object `{status: 'error'}`, potentially with a detailed error message.
   */
  async ungroupAllRoomsFrom(room) {
    const isSuccess = (currentValue) => currentValue === 'success';
    let roomsToUngroup = null;
    let result = null;

    // Find the group that contains `room`.
    try {
      let zones = await this.getZones();

      for (let z of zones) {
        let zoneMembers = z['members'];
        let roomsInZone = zoneMembers.map(r => r['roomName']);
        
        if (roomsInZone.indexOf(room) !== -1) {
          // If `room` is in the zone, return the other members.
          roomsToUngroup = roomsInZone.filter(r => r !== room);
          break;
        }
      }
    } catch (error) {
      result = {status: `error: ${error}`};

      // No need to continue.
      return result;
    }

    if (roomsToUngroup === null) {
      // `room` isn't in a group.
      result = {status: `error: ${room} is not part of a group.`};

      // No need to continue.
      return result;
    } else {
      try {
        result = await this.ungroup(roomsToUngroup);
      } catch (error) {
        result = {status: `error: ${error}`};
      }
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
    let url = this.sonosBaseUrl + this._formatRoomForUrl(room) + this.endPoints.volume + volume;
    url = encodeURI(url);
    let req = new Request(url=url);
    let resp = null;
    let result = null;

    try {
      resp = await req.loadJSON();
      result = resp['status'];
    } catch (error) {
      result = `error: ${error}`;
    }

    return result;
  }
}

module.exports = SonosController;