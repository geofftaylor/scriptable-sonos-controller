// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: yellow; icon-glyph: clipboard-check;
// Tests to be run inside of Scriptable.
// Depending on the number of Sonos speakers that you have, you may need to alter some of the tests.
// Note that these tests aren't very smart or comprehensive. They generally just check for the right type of output.
// There's still a lot of human judgment required (e.g., Did the right station start playing in the right room?).
// The tests could be written to make some of those judgments, but I don't think the outcome is worth the effort.
// (The easiest way to assess the outcome of many of the tests is to watch what happens in the Sonos app on a different device than the one that's running this script.

// **** TEST DATA. CHANGE THESE VALUES. ****
const allRooms = ['Basement', 'Kitchen', 'Living Room', 'Move-Master Bedroom', 'Office']; // All rooms in the system.
const threeRooms = ['Kitchen', 'Living Room', 'Office']; // Used to validate grouping.
const roomsToGroup = ['Kitchen', 'Living Room']; // This is used for `roomsToGroup` in the test functions.
const mainRoom = 'Office'; // This is used for `mainRoom` in the test functions.
const favorite = 'Downtempo'; // This is used for `favorite` in the test functions.
const playlist = 'Test Playlist'; // This is used for `playlist` in the test functions.
const millisecondsBetweenTests = 5000; // Delay between each test. 1000 = 1 second
// **** END TEST DATA. DO NOT CHANGE ANYTHING BELOW THIS LINE. ****

// Import the controller and settings.
const SonosController = importModule('SonosController');
const settings = importModule('SonosSettings');

// Create the controller.
const controller = new SonosController(settings.sonosServerUrl);

// Other variables
let runTests = false;
let testResults = {};

// Test connectivity to server. If successful, run the tests.
try {
  let connected = await controller.isConnected();
  if (connected) {
    runTests = true;
  } else {
    let message = `Unable to connect to the server. Verify that the server is running at ${controller.sonosBaseUrl}.`;
    console.log(message);
    let popup = new Alert();
    popup.title = 'Error';
    popup.message = message;
    let result = await popup.presentAlert();
  }
} catch (error) {
  console.log(`Error testing connectivity: ${error}`);
}

if (runTests) {
  console.log('Connected to server. Running tests...');
  await systemInformationTests();
  await roomTests(mainRoom, favorite, playlist, millisecondsBetweenTests);
  await groupTests(mainRoom, roomsToGroup, playlist, millisecondsBetweenTests);
  console.log(testResults);
  await displayTestReport();
}

// Pass in the test name as a string and a boolean.
// If `booleanResult` is true, the test passed. Else the test failed.
function testPassed(testName, testOutput, booleanResult) {
  let result = {}

  if (booleanResult === true) {
    result['result'] = 'Passed';
  } else {
    result['result'] = 'Failed';
  }

  result['output'] = testOutput;

  testResults[testName] = result;
}

function createHTML(includeOutput=false) {
  let style = `
  <style>
    body {
      font-family: Helvetica, sans-serif;
      font-size: 1.5em;
    }

    table, tr, th, td {
      border: 1px solid black;
    }

    table {
      border-collapse: collapse;
    }

    th, td {
      padding: 0.5em;
    }

    .passed {
      color: green;
      font-weight: bold;
    }

    .failed {
      color: red;
      font-weight: bold;
    }
  </style>
  `;

  let head = `
  <head>
    <title>Test Results</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    ${style}
  </head>
  `;

  let tableHeader;
  if (includeOutput) {
    tableHeader = '<th>Test Name</th><th>Test Result</th><th>Test Output</th>';
  } else {
    tableHeader = '<th>Test Name</th><th>Test Result</th>';
  }

  let html = `<html>${head}<body>`;
  html += `<table><tr>${tableHeader}</tr>`;

  for (r in testResults) {
    let testName = r;
    let testResult = testResults[r]['result'];
    let resultStyle = testResult.toLowerCase();

    if (includeOutput) {
      let testOutput = JSON.stringify(testResults[r]['output']);
    }

    html += `<tr><td>${testName}</td>`;
    html += `<td class="${resultStyle}">${testResult}</td>`;

    if (includeOutput) {
      html += `<td>${testOutput}</td></tr>`;
    }
  }

  html += '</table></body></html>';
  return html;
}

function sleep(ms) {
  let startTime = new Date().getTime();
  while (new Date().getTime() < startTime + ms);
}

async function displayTestReport() {
  let wv = new WebView();
  let html = createHTML();
  wv.loadHTML(html);
  await wv.present();
}

// **** SYSTEM INFORMATION TESTS ***
async function systemInformationTests() {
  let testName = null;
  let output = null;
  let result = null;

  // Get the list of all available services.
  testName = 'Get Services';
  console.log(`Testing ${testName}...`);
  output = await controller.getServices();
  result = output !== null && Object.keys(output).includes('Pandora');
  testPassed(testName, output, result);
  console.log(`Finished testing ${testName}.`);

  // Get the system zones.
  testName = 'Get Zones';
  console.log(`Testing ${testName}...`);
  output = await controller.getZones();
  result = Array.isArray(output);
  testPassed(testName, output, result);
  console.log(`Finished testing ${testName}.`);

  // Get the names of all rooms in the system.
  testName = 'Get Rooms';
  console.log(`Testing ${testName}...`);
  output = await controller.getRooms();
  result = Array.isArray(output) && output.length === allRooms.length;
  testPassed(testName, output, result);
  console.log(`Finished testing ${testName}.`);

  testName = 'Get Groups';
  console.log(`Testing ${testName}...`);
  output = await controller.getGroups();
  result = Array.isArray(output) && output.length > 0;
  testPassed(testName, output, result);
  console.log(`Finished testing ${testName}.`);

  // Get stations, playlists, etc. that have been marked as favorites.
  testName = 'Get Favorites';
  console.log(`Testing ${testName}...`);
  output = await controller.getFavorites();
  result = Array.isArray(output) && output.includes(favorite);
  testPassed(testName, output, result);
  console.log(`Finished testing ${testName}.`);

  // Get Sonos playlists.
  testName = 'Get Playlists';
  console.log(`Testing ${testName}...`);
  output = await controller.getPlaylists();
  result = Array.isArray(output) && output.includes(playlist);
  testPassed(testName, output, result);
  console.log(`Finished testing ${testName}.`);

  return true;
}

// **** ROOM TESTS ****
async function roomTests(mainRoom, favorite, playlist, millisecondsBetweenTests=5000) {
  let testName = null;
  let output = null;
  let result = null;

  // Play a favorite.
  testName = 'Play Favorite';
  console.log(`Testing ${testName}...`);
  output = await controller.playFavorite(favorite, mainRoom);
  result = output !== null && !output.startsWith('error');
  testPassed(testName, output, result);
  console.log(`Finished testing ${testName}.`);

  // Wait before running next test.
  sleep(millisecondsBetweenTests);

  // Get current playback state.
  testName = 'Get Current Playback State';
  console.log(`Testing ${testName}...`);
  output = await controller.getCurrentPlaybackState(mainRoom);
  result = output !== null && !output.startsWith('error');
  testPassed(testName, output, result);
  console.log(`Finished testing ${testName}.`);

  // Get the current track.
  testName = 'Get Current Track';
  console.log(`Testing ${testName}...`);
  output = await controller.getCurrentTrack(mainRoom);
  result = output !== null && typeof output === 'object';
  testPassed(testName, output, result);
  console.log(`Finished testing ${testName}.`);

  // Get the current track's album art.
  testName = 'Get Album Art';
  console.log(`Testing ${testName}...`);
  currentTrack = await controller.getCurrentTrack(mainRoom);
  output = await controller.getAlbumArt(currentTrack.albumArtUri);
  result = output !== null && output.size.width > 0;
  testPassed(testName, output, result);
  console.log(`Finished testing ${testName}.`);

  // Get the current track's album art as a base64 encoded string.
  testName = 'Get Album Art as base64';
  console.log(`Testing ${testName}...`);
  currentTrack = await controller.getCurrentTrack(mainRoom);
  output = await controller.getAlbumArtAsBase64(currentTrack.albumArtUri);
  result = output !== null;
  testPassed(testName, output, result);
  console.log(`Finished testing ${testName}.`);

  // Get the next track.
  testName = 'Get Next Track';
  console.log(`Testing ${testName}...`);
  output = await controller.getNextTrack(mainRoom);
  result = output !== null && typeof output === 'object';
  testPassed(testName, output, result);
  console.log(`Finished testing ${testName}.`);

  // Pause playback.
  testName = 'Pause';
  console.log(`Testing ${testName}...`);
  output = await controller.pause(mainRoom);
  result = output !== null && !output.startsWith('error');
  testPassed(testName, output, result);
  console.log(`Finished testing ${testName}.`);

  // Wait before running next test.
  sleep(millisecondsBetweenTests);

  // Start playback.
  testName = 'Play';
  console.log(`Testing ${testName}...`);
  output = await controller.play(mainRoom);
  result = output !== null && !output.startsWith('error');
  testPassed(testName, output, result);
  console.log(`Finished testing ${testName}.`);

  // Wait before running next test.
  sleep(millisecondsBetweenTests);

  // Toggle playback. (It should pause.)
  testName = 'Toggle (should pause)';
  console.log(`Testing ${testName}...`);
  output = await controller.toggle(mainRoom);
  result = output !== null && !output.startsWith('error');
  testPassed(testName, output, result);
  console.log(`Finished testing ${testName}.`);

  // Wait before running next test.
  sleep(millisecondsBetweenTests);

  // Toggle playback. (It should start playing again.)
  testName = 'Toggle (should play)';
  console.log(`Testing ${testName}...`);
  output = await controller.toggle(mainRoom);
  result = output !== null && !output.startsWith('error');
  testPassed(testName, output, result);
  console.log(`Finished testing ${testName}.`);

  // Wait before running next test.
  sleep(millisecondsBetweenTests);

  // Skip to next track.
  testName = 'Play Next Track';
  console.log(`Testing ${testName}...`);
  output = await controller.next(mainRoom);
  result = output !== null && !output.startsWith('error');
  testPassed(testName, output, result);
  console.log(`Finished testing ${testName}.`);

  // Wait before running next test.
  sleep(millisecondsBetweenTests);

  // Go back to previous track.
  testName = 'Play Previous Track';
  console.log(`Testing ${testName}...`);
  output = await controller.previous(mainRoom);
  result = output !== null && !output.startsWith('error');
  testPassed(testName, output, result);
  console.log(`Finished testing ${testName}.`);

  // Wait before running next test.
  sleep(millisecondsBetweenTests);

  // Set room volume to 20%.
  testName = 'Set Room Volume to 20%';
  console.log(`Testing ${testName}...`);
  output = await controller.setRoomVolume(mainRoom, 20);
  result = output !== null && !output.startsWith('error');
  testPassed(testName, output, result);
  console.log(`Finished testing ${testName}.`);

  // Wait before running next test.
  sleep(millisecondsBetweenTests);

  // Set room volume to 10%.
  testName = 'Set Room Volume to 10%';
  console.log(`Testing ${testName}...`);
  output = await controller.setRoomVolume(mainRoom, 10);
  result = output !== null && !output.startsWith('error');
  testPassed(testName, output, result);
  console.log(`Finished testing ${testName}.`);

  // Wait before running next test.
  sleep(millisecondsBetweenTests);

  // Play a playlist
  testName = 'Play Playlist';
  console.log(`Testing ${testName}...`);
  output = await controller.playPlaylist(playlist, mainRoom);
  result = output !== null && !output.startsWith('error');
  testPassed(testName, output, result);
  console.log(`Finished testing ${testName}.`);

  // Wait before running next test.
  sleep(millisecondsBetweenTests);

  await controller.pause(mainRoom);

  return true;
}

// **** GROUP TESTS ****
async function groupTests(mainRoom, roomsToGroup, playlist, millisecondsBetweenTests=5000) {
  let testName = null;
  let output = null;
  let result = null;

  // Make sure music is playing in the main room.
  await controller.playPlaylist(playlist, mainRoom);

  // Wait before running next test.
  sleep(millisecondsBetweenTests);

  // Group two rooms.
  testName = 'Group 2 Rooms';
  console.log(`Testing ${testName}...`);
  output = await controller.group(mainRoom, [roomsToGroup[0]]);
  result = output !== null && !output.startsWith('error');
  testPassed(testName, output, result);
  testPassed(testName, output, result);
  console.log(`Finished testing ${testName}.`);

  // Wait before running next test.
  sleep(millisecondsBetweenTests);

  // Ungroup the room that was just added to the group.
  testName = 'Ungroup 1 Room';
  console.log(`Testing ${testName}...`);
  output = await controller.ungroup([roomsToGroup[0]]);
  result = output !== null && !output.startsWith('error');
  testPassed(testName, output, result);
  testPassed(testName, output, result);
  console.log(`Finished testing ${testName}.`);

  // Wait before running next test.
  sleep(millisecondsBetweenTests);

  // Group three rooms.
  testName = 'Group 3 Rooms';
  console.log(`Testing ${testName}...`);
  output = await controller.group(mainRoom, roomsToGroup);
  result = output !== null && !output.startsWith('error');
  testPassed(testName, output, result);
  testPassed(testName, output, result);
  console.log(`Finished testing ${testName}.`);

  // Wait before running next test.
  sleep(millisecondsBetweenTests);

  testName = 'Get Rooms in Group Inclusive';
  console.log(`Testing ${testName}...`);
  output = await controller.getRoomsInGroupInclusive(mainRoom);
  console.log(output);
  result = output !== null && output.sort() === threeRooms;
  testPassed(testName, output, result);
  console.log(`Finished testing ${testName}.`);

  // Wait before running next test.
  sleep(millisecondsBetweenTests);

  testName = 'Get Rooms in Group Exclusive';
  console.log(`Testing ${testName}...`);
  output = await controller.getRoomsInGroupExclusive(mainRoom);
  result = output !== null && output.sort() === roomsToGroup;
  console.log(output);
  testPassed(testName, output, result);
  console.log(`Finished testing ${testName}.`);

  // Wait before running next test.
  sleep(millisecondsBetweenTests);

  // Set group volume to 20%.
  testName = 'Set Group Volume to 20%';
  console.log(`Testing ${testName}...`);
  output = await controller.setGroupVolume(mainRoom, 20);
  result = output !== null && !output.startsWith('error');
  testPassed(testName, output, result);
  console.log(`Finished testing ${testName}.`);

  // Wait before running next test.
  sleep(millisecondsBetweenTests);

  // Set group volume to 10%.
  testName = 'Set Group Volume to 10%';
  console.log(`Testing ${testName}...`);
  output = await controller.setGroupVolume(mainRoom, 10);
  result = output !== null && !output.startsWith('error');
  testPassed(testName, output, result);
  console.log(`Finished testing ${testName}.`);

  // Wait before running next test.
  sleep(millisecondsBetweenTests);

  // Ungroup the rooms that were grouped with the main room.
  testName = 'Ungroup 2 Rooms';
  console.log(`Testing ${testName}...`);
  output = await controller.ungroup(roomsToGroup);
  result = output !== null && !output.startsWith('error');
  testPassed(testName, output, result);
  testPassed(testName, output, result);
  console.log(`Finished testing ${testName}.`);

  // Wait before running next test.
  sleep(millisecondsBetweenTests);

  // Group all rooms with the main room.
  testName = 'Group All Rooms With Main Room';
  console.log(`Testing ${testName}...`);
  output = await controller.groupAllRoomsWith(mainRoom);
  result = output !== null && !output.startsWith('error');
  testPassed(testName, output, result);
  testPassed(testName, output, result);
  console.log(`Finished testing ${testName}.`);

  // Wait before running next test.
  sleep(millisecondsBetweenTests);

  // Ungroup all rooms from the main room.
  testName = 'Ungroup All From Main Room';
  console.log(`Testing ${testName}...`);
  output = await controller.ungroupAllRoomsFrom(mainRoom);
  result = output !== null && !output.startsWith('error');
  testPassed(testName, output, result);
  testPassed(testName, output, result);
  console.log(`Finished testing ${testName}.`);

  // Wait before running next test.
  sleep(millisecondsBetweenTests);

  // Play a favorite everywhere.
  testName = 'Play Favorite Everywhere';
  console.log(`Testing ${testName}...`);
  output = await controller.playFavoriteEverywhere(favorite);
  result = output !== null && !output.startsWith('error');
  testPassed(testName, output, result);
  console.log(`Finished testing ${testName}.`);

  // Reset system state and wait before running next test.
  await controller.pause();
  await controller.ungroupAllRoomsFrom(mainRoom);
  sleep(millisecondsBetweenTests);

  // Play a playlist everywhere.
  testName = 'Play Playlist Everywhere';
  console.log(`Testing ${testName}...`);
  output = await controller.playPlaylistEverywhere(playlist);
  result = output !== null && !output.startsWith('error');
  testPassed(testName, output, result);
  console.log(`Finished testing ${testName}.`);

  sleep(millisecondsBetweenTests);
  await controller.pause(mainRoom);

  return true;
}