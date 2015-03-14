//Dev Stubs
var F_IN_STUB = 440;

var context = new webkitAudioContext();
context.sampleRate = 44100;

function Operator(type, freq, gain, output) {
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

var op1 = new Operator('sine', 440, 1, 'destination');
var op2 = new Operator('sine', 440, 100, op1);
// var op3 = new Operator('sine', 440, 1000, op2);


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

setInterval( function() {
  f_in = F_IN_STUB; // system pitch (i.e. midi note or cv derived value)
  op2.gainNode.gain.value = ReadSliders("#op2_gain");
  op2.osc.frequency.value = f_in * ReadSliders("#op2_coarse_ratio");
}, 1000/60);







