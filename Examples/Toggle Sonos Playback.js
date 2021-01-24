// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: yellow; icon-glyph: play;
const SonosController = importModule('SonosController');
const settings = importModule('SonosSettings');
const controller = new SonosController(settings.sonosServerUrl);

let room = args.shortcutParameter;
let result = await controller.toggle(room);
Script.setShortcutOutput(result);
Script.complete();