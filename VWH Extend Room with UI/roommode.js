import xapi from 'xapi';

// Functions for video connector controls
function video_extend() {
    xapi.command('Video Input SetMainVideoSource', { Connector: 2 })
        .then(() => console.log('Video Connector 2 turned on (extend)'))
        .catch((err) => console.error('Failed to turn on Video Connector 2 (extend):', err));
}

function video_single() {
    xapi.command('Video Input SetMainVideoSource', { Connector: 1 }) // Assuming Connector 1 is the default
        .then(() => console.log('Video Connector 2 turned off (single)'))
        .catch((err) => console.error('Failed to turn off Video Connector 2 (single):', err));
}

// Room presets (that execute multiple actions)
function room_extend() {
    console.log('Executing room extend preset');
    video_extend();
    ext_speakers_on();
    ext_mics_on();
    set_speaker_volume('50')
    set_mic_level('75')

     // Video function
    // Add additional functions for room_extend preset here
    // For example, you can add logic to control lights, blinds, etc.
}

function room_single() {
    console.log('Executing room single preset');
    video_single(); // Video function
    // Add additional functions for room_single preset here
    // For example, you can add logic to control lights, blinds, etc.
}

// Functions for "extend_speakers" widget actions
function ext_speakers_on() {
  console.log(`Running Command to Turn Ext Speakers On`);
  xapi.Config.Audio.Output.Line[1].Mode.set('On')
      .then(() => {
          console.info(`Successfully Turned Speakers On`);
      })
      .catch((err) => {
          console.error(`Failed to turn speakers on`, err);
      });
}
function ext_speakers_off() {
  console.log(`Running Command to Turn Ext Speakers Off`);
  xapi.Config.Audio.Output.Line[1].Mode.set('Off')
      .then(() => {
          console.info(`Successfully Turned Speakers Off`);
      })
      .catch((err) => {
          console.error(`Failed to turn speakers off`, err);
      });
}
// Functions for "extend_mics" widget actions
function ext_mics_on() {
  console.log(`Running Command to Turn Ext Mics On`);
  xapi.Config.Audio.Input.Microphone[1].Mode.set('On')
      .then(() => {
          console.info(`Successfully Turned Ext Mics On`);
      })
      .catch((err) => {
          console.error(`Failed to turn mics on`, err);
      });
}

function ext_mics_off() {
  console.log(`Running Command to Turn Ext Mics Off(Mute)`);
  xapi.Config.Audio.Input.Microphone[1].Mode.set('Off')
      .then(() => {
          console.info(`Successfully Turned Ext Mics Off`);
      })
      .catch((err) => {
          console.error(`Failed to turn mics off`, err);
      });
}

// Function to handle speaker volume
function set_speaker_volume(level) {
  console.log(`Running Command to Set speaker volume to: ${level}`);
  xapi.Config.Audio.Output.Speaker.Level.set(level)
      .then(() => {
          console.info(`Successfully Set speaker volume to: ${level}`);
      })
      .catch((err) => {
          console.error(`Failed to set speaker volume to: ${level}`, err);
      });
}

// Function to handle mic level
function set_mic_level(level) {
  console.log(`Running Command to Set speaker volume to: ${level}`);
  xapi.Config.Audio.Input.Microphone[1].Level.set(level)
      .then(() => {
          console.info(`Successfully Set microphone volume to: ${level}`);
      })
      .catch((err) => {
          console.error(`Failed to set microphone volume to: ${level}`, err);
      });
}

// Normalization function (0-255 to 0-100) Because sliders are 0-255 and Volume levels are 0-100 so we need to convert it.
function normalizeSliderValue(value) {
    return parseInt(value * 100 / 255);
}



// Listen for widget actions for multiple UI elements
xapi.event.on('UserInterface Extensions Widget Action', (event) => {
    switch (event.WidgetId) {
        case 'roommode':
            if (event.Type === 'released') {
                if (event.Value === 'extend') {
                    console.log('Button released: extend');
                    room_extend(); // Execute room_extend preset
                } else if (event.Value === 'single') {
                    console.log('Button released: single');
                    room_single(); // Execute room_single preset
                }
            }
            break;

        case 'extend_speakers': // Handling "extend_speakers"
            if (event.Type === 'changed') {
                if (event.Value === 'on') {
                    console.log('Speakers switched to: on');
                    ext_speakers_on();
                } else if (event.Value === 'off') {
                    console.log('Speakers switched to: off');
                    ext_speakers_off();
                }
            }
            break;

        case 'extend_mics': // Handling "extend_mics"
            if (event.Type === 'changed') {
                if (event.Value === 'on') {
                    console.log('Microphones switched to: on');
                    ext_mics_on();
                } else if (event.Value === 'off') {
                    console.log('Microphones switched to: off');
                    ext_mics_off();
                }
            }
            break;
        
        case 'ext_speaker_volume': // Handling speaker volume slider
            if (event.Type === 'changed') {
                const normalizedVolume = normalizeSliderValue(event.Value);
                console.log(`Normalized speaker volume: ${normalizedVolume}`);
                set_speaker_volume(normalizedVolume);
            }
            break;

        case 'ext_mic_level': // Handling mic level slider
            if (event.Type === 'changed') {
                const normalizedMicLevel = normalizeSliderValue(event.Value);
                console.log(`Normalized mic level: ${normalizedMicLevel}`);
                set_mic_level(normalizedMicLevel);
            }
            break;

        // Log for unknown widget actions
        default:
            console.log('Unknown widget action:', event);
    }
});
