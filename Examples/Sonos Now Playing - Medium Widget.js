// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: yellow; icon-glyph: music;

// **** INSTRUCTIONS ****
// Change the values under WIDGET CONFIGURATION, PART 1 and WIDGET CONFIGURATION, PART 2.
// To test the widget, scroll to the bottom, comment the line `Script.setWidget(widget);` and uncomment the line `widget.presentMedium();`.
// To use the widget, uncomment the line `Script.setWidget(widget);` and comment the line `widget.presentMedium();`.
// **********************

// Import the controller and settings.
const SonosController = importModule('SonosController');
const settings = importModule('SonosSettings');

// Create the controller.
const controller = new SonosController(settings.sonosServerUrl);

// **** WIDGET CONFIGURATION, PART 1 ****
let anyRoom = true; // If true, the widget will display the details from the first room it finds that is playing. If false, or if no rooms are playing, it will use the room defined in the `room` variable.
let room = 'Office'; // The default room for this widget.
let textColor = Color.darkGray(); // The color of the widget's text.
let backgroundColor = Color.yellow(); // The widget's background color.
// **** END WIDGET CONFIGURATION, PART 1 ****

let playingRoom = null;

if (anyRoom) {
  let allRooms = await controller.getRooms();

  for (let r of allRooms) {
    let state = await controller.getCurrentPlaybackState(r);

    if (state === 'PLAYING') {
      playingRoom = r;
      break;
    }
  }

  if (playingRoom === null) {
    playingRoom = room;  
  }
} else {
  playingRoom = room;
}

// **** WIDGET CONFIGURATION, PART 2 ****
let imageAction = 'sonos://'; // URL to open when the widget image is tapped.
let textAction = `shortcuts://run-shortcut?name=Toggle%20Sonos%20Playback&input=${encodeURI(playingRoom)}`; // URL to open when the widget text is tapped.
// **** END WIDGET CONFIGURATION, PART 2 ****

// Get the details of the currently playing track.
let track = await controller.getCurrentTrack(playingRoom);
let albumArt = await controller.getAlbumArt(track.albumArtUri);

let widget = new ListWidget();
widget.backgroundColor = backgroundColor;

// Container for track album art, track title, etc.
let container = widget.addStack();
container.centerAlignContent();
container.spacing = 15;

// Artwork
let artwork = container.addImage(albumArt);
let artworkSize = new Size(100, 100);
artwork.imageSize = artworkSize;
artwork.url = imageAction;

// Track details
let trackDetails = container.addStack();
trackDetails.layoutVertically();
trackDetails.url = textAction;

trackDetails.addSpacer();

let title = trackDetails.addText(track.title)
title.textColor = textColor;
title.font = Font.semiboldSystemFont(18);

let artist = trackDetails.addText(track.artist)
artist.textColor = textColor;
artist.font = Font.regularSystemFont(18);

trackDetails.addSpacer();

for (let text of [track.album, `${playingRoom}: ${track.service}`]) {
  let widgetText = trackDetails.addText(text);
  widgetText.textColor = textColor;
  widgetText.font = Font.regularSystemFont(15);
}

trackDetails.addSpacer();

// widget.presentMedium();
Script.setWidget(widget);

