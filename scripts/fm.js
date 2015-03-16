function Operator(type, freq, gain, output) {
  this.portamento = 0.05;
  this.osc = context.createOscillator();
  this.gainNode = context.createGain();
  this.osc.type = type;
  this.osc.frequency.value = freq;
  this.gainNode.gain.value = gain;
  this.osc.connect(this.gainNode);
  if (output === 'destination') {
    this.gainNode.connect(context.destination);
  } else {
    this.gainNode.connect(output.osc.frequency);
  };
  this.osc.start(0);
};

function onMIDIInit(midi) {
  midiAccess = midi;

  if ((typeof(midiAccess.inputs) == "function")) {  //Old Skool MIDI inputs() code
    var inputs=midiAccess.inputs();
    if (inputs.length === 0)
      alert("No MIDI input devices present.  You're gonna have a bad time.")
    else { // Hook the message handler for all MIDI inputs
      for (var i=0;i<inputs.length;i++)
        inputs[i].onmidimessage = MIDIMessageEventHandler;
    }
  } else {  // new MIDIMap implementation
    var haveAtLeastOneDevice=false;
      var inputs=midiAccess.inputs.values();
      for ( var input = inputs.next(); input && !input.done; input = inputs.next()) {
        input.value.onmidimessage = MIDIMessageEventHandler;
        haveAtLeastOneDevice = true;
      }
      if (!haveAtLeastOneDevice)
      alert("No MIDI input devices present.  You're gonna have a bad time.");
  }
}

function onMIDIReject(err) {
  alert("The MIDI system failed to start.  You're gonna have a bad time.");
}

function MIDIMessageEventHandler(event) {
  // Channel data in lower nibble ignored for now. (omni mode) WIP
  switch (event.data[0] & 0xf0) {
    case 0x90:
      if (event.data[2]!=0) {  // if velocity != 0, this is a note-on message
        noteOn(event.data[1]);
        return;
      }
      // if velocity == 0, fall thru: it's a note-off.
    case 0x80:
      noteOff(event.data[1]);
      return;
  }
}

function frequencyFromNoteNumber( note ) {
  return 440 * Math.pow(2,(note-69)/12);
}

function noteOn(noteNumber) {
  activeNotes.push( noteNumber );
  op1.osc.frequency.cancelScheduledValues(0);
  op1.osc.frequency.setTargetAtTime( frequencyFromNoteNumber(noteNumber), 0, op1.portamento );
  op1.gainNode.gain.value = 1;
}

function noteOff(noteNumber) {
  var position = activeNotes.indexOf(noteNumber);
  if (position!=-1) {
    activeNotes.splice(position,1);
  }
  if (activeNotes.length==0) {
    op1.gainNode.gain.value = 0;
  } else {
    op1.osc.frequency.cancelScheduledValues(0);
    op1.osc.frequency.setTargetAtTime( frequencyFromNoteNumber(activeNotes[activeNotes.length-1]), 0, op1.portamento );
  }
}

var F_IN_STUB = 440; //to be removed when mod pitch from midi is added. WIP

var context=null;   // the Web Audio "context" object
var midiAccess=null;  // the MIDIAccess object.
var activeNotes = []; // the stack of actively-pressed keys
var op1 = null; // the operators! 6, eventually.  WIP
var op2 = null;

window.addEventListener('load', function() {
  window.AudioContext=window.AudioContext||window.webkitAudioContext;
  context = new AudioContext();
  context.sampleRate = 44100;

  if (navigator.requestMIDIAccess) {
    navigator.requestMIDIAccess().then( onMIDIInit, onMIDIReject );
  } else {
    alert("No MIDI support present in your browser.  You're gonna have a bad time.")
  };

  op1 = new Operator('sine', 440, 1, 'destination');
  op2 = new Operator('sine', 440, 100, op1);
  op1.gainNode.gain.value = 0; // start muted.  WIP
  // var op3 = new Operator('sine', 440, 1000, op2);

  setInterval( function() {
    f_in = F_IN_STUB; // system pitch (i.e. midi note or cv derived value)
    // should come from midi input. WIP
    op2.gainNode.gain.value = ReadSliders("#op2_gain");
    op2.osc.frequency.value = f_in * ReadSliders("#op2_coarse_ratio");
  }, 1000/60);

});

// UI Here
$( document ).ready(function() {
  $(function() {
    $( "#op2_gain" ).slider({
      min: 0,
      max: 10000
    });
  });
  $(function() {
    $( "#op2_coarse_ratio" ).slider({
      min: 1,
      max: 32
    });
  });
});

function ReadSliders(selector) {
  return $( selector ).slider( "value" );
};









