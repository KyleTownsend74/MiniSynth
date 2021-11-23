const keyboard = document.querySelector("#keyboard");
const baseOctaveNum = 3;
const osc1 = new Tone.Oscillator();
const osc2 = new Tone.Oscillator();
const osc3 = new Tone.Oscillator();
const ampEnv = new Tone.AmplitudeEnvelope({
    attack: 0,
    decay: 0,
    sustain: 1,
    release: 0.05   // Release at 0.05 to avoid bug and give smoother sound without dedicated knob
}).toDestination();

// Offset for note range of each oscillator
let osc1RangeOffset = 0;
let osc2RangeOffset = 0;
let osc3RangeOffset = 0;

osc1.type = document.querySelector("#osc1-waveform").value;
osc2.type = document.querySelector("#osc2-waveform").value;
osc3.type = document.querySelector("#osc3-waveform").value;
osc1.connect(ampEnv);
osc2.connect(ampEnv);
osc3.connect(ampEnv);

setKeyboardListeners();

// Set up event listeners for keyboard controller
function setKeyboardListeners() {
    // Get all keys on keyboard
    const keys = keyboard.querySelectorAll(".note");

    // Set listeners on each key on keyboard
    for(let key of keys) {
        key.addEventListener("mousedown", (event) => {
            // Play note associated with key
            osc1.frequency.value = key.dataset.note 
                + (baseOctaveNum + osc1RangeOffset + parseInt(key.dataset.octave));
            osc2.frequency.value = key.dataset.note 
                + (baseOctaveNum + osc2RangeOffset + parseInt(key.dataset.octave));
            osc3.frequency.value = key.dataset.note 
                + (baseOctaveNum + osc3RangeOffset + parseInt(key.dataset.octave));
            if(osc1.state === "stopped") {
                osc1.start();
                osc2.start();
                osc3.start();
            }
            ampEnv.triggerAttack();
            key.classList.add("pressed");
            event.stopPropagation();
        });

        key.addEventListener("mouseup", () => {
            key.classList.remove("pressed");
            ampEnv.triggerRelease();
        });

        key.addEventListener("mouseleave", () => {
            key.classList.remove("pressed");
            ampEnv.triggerRelease();
        });
    }
}

// Represents a general input on the synthesizer - use specific subclasses instead
class Input {
    constructor(element, action) {
        this.element = element;
        this.action = action;
    }
}

// Represents a knob in document with current rotation
class Knob extends Input{
    constructor(element, action, curRotation) {
        super(element, action);
        this.curRotation = curRotation;
    }
}

setKnobListeners();

// Set up event listeners for knob controllers
function setKnobListeners() {
    const knobs = createKnobObjects();

    // Set listeners on each knob in document
    for(let knob of knobs) {
        // Get necessary subelements of each knob element
        const graphics = knob.element.querySelector(".knob-graphics");
        const downButton = knob.element.querySelector(".button-down");
        const upButton = knob.element.querySelector(".button-up");

        // Rotate knob left by 10 degrees
        downButton.addEventListener("mousedown", () => {
            // Get the new rotation (without passing -130 degrees)
            const newRotation = Math.max(-130, knob.curRotation - 10);

            // Update the rotation
            graphics.style.transform = `rotate(${newRotation}deg)`;
            knob.curRotation = newRotation;

            // Use knob effect
            knob.action();

            // Show pressed styling
            downButton.classList.add("pressed");
        });

        downButton.addEventListener("mouseup", () => {
            downButton.classList.remove("pressed");
        });

        downButton.addEventListener("mouseleave", () => {
            downButton.classList.remove("pressed");
        });

        // Rotate knob right by 10 degrees
        upButton.addEventListener("mousedown", () => {
            // Get the new rotation (without passing 130 degrees)
            const newRotation = Math.min(130, knob.curRotation + 10);

            // Update the rotation
            graphics.style.transform = `rotate(${newRotation}deg)`;
            knob.curRotation = newRotation;

            // Use knob effect
            knob.action();

            // Show pressed styling
            upButton.classList.add("pressed");
        });

        upButton.addEventListener("mouseup", () => {
            upButton.classList.remove("pressed");
        });

        upButton.addEventListener("mouseleave", () => {
            upButton.classList.remove("pressed");
        });
    }
}

// Create array of Knob objects from all knobs in document
function createKnobObjects() {
    const knobArray = [];
    const knobElements = document.querySelectorAll(".knob");

    for(let knobElement of knobElements) {
        // Declare variables to construct knob
        let defaultRotation;
        let actionFunction;

        // Use knob ID to determine what values each knob will use
        switch(knobElement.id) {
            case "osc1-volume":
                actionFunction = function() {
                    // Set volume based on knob (range -60 - 0)
                    osc1.volume.value = ((this.curRotation - 130) / 260) * 60;
                }
                defaultRotation = 130;
                break;
            case "osc2-volume":
                actionFunction = function() {
                    // Set volume based on knob (range -60 - 0)
                    osc2.volume.value = ((this.curRotation - 130) / 260) * 60;
                }
                defaultRotation = 130;
                break;
            case "osc3-volume":
                actionFunction = function() {
                    // Set volume based on knob (range -60 - 0)
                    osc3.volume.value = ((this.curRotation - 130) / 260) * 60;
                }
                defaultRotation = 130;
                break;
            case "amp-attack":
                actionFunction = function() {
                    // Set attack based on knob (range 0 - 2)
                    ampEnv.attack = (this.curRotation + 130) / 130;
                }
                defaultRotation = -130;
                break;
            case "amp-decay":
                actionFunction = function() {
                    // Set decay based on knob (range 0 - 2)
                    ampEnv.decay = (this.curRotation + 130) / 130;
                }
                defaultRotation = -130;
                break;
            case "amp-sustain":
                actionFunction = function() {
                    // Set sustain based on knob (range 0 - 1)
                    ampEnv.sustain = (this.curRotation + 130) / 260;
                }
                defaultRotation = 130;
                break;
            default:
                actionFunction = function() {
                    console.log("Knob function not set");
                }
                defaultRotation = 0;
        }

        // Create and add knob to array to be returned
        knobArray.push(new Knob(knobElement, actionFunction, defaultRotation));

        // Set initial knob rotation
        knobElement.querySelector(".knob-graphics").style.transform = `rotate(${defaultRotation}deg)`;
    }

    return knobArray;
}

// Represents a checkbox in document with checked value
class Checkbox extends Input {
    constructor(element, action, isChecked) {
        super(element, action);
        this.isChecked = isChecked;
    }
}

setCheckboxListeners();

// Set up event listeners for checkboxes
function setCheckboxListeners() {
    const checkboxes = createCheckboxObjects();

    // Set listeners on each checkbox in document
    for(let checkbox of checkboxes) {
        const element = checkbox.element;

        element.addEventListener("change", () => {
            // If check has changed, take the action on the checkbox and update isChecked
            if(element.checked !== checkbox.isChecked) {
                checkbox.action();
                checkbox.isChecked = element.checked;
            }
        });
    }
}

// Create array of Checkbox objects from all checkboxes in document
function createCheckboxObjects() {
    const checkboxArray = [];
    const checkboxElements = document.querySelectorAll("input[type=checkbox]");

    for(let checkboxElement of checkboxElements) {
        // Declare variables to construct checkbox
        let defaultValue;
        let actionFunction;

        // Use checkbox ID to determine what values each checkbox will use
        switch(checkboxElement.id) {
            case "osc1-enabled":
                actionFunction = function() {
                    // Toggle osc1 mute
                    osc1.mute = !osc1.mute;
                }
                defaultValue = true;
                break;
            case "osc2-enabled":
                actionFunction = function() {
                    // Toggle osc1 mute
                    osc2.mute = !osc2.mute;
                }
                defaultValue = true;
                break;
            case "osc3-enabled":
                actionFunction = function() {
                    // Toggle osc1 mute
                    osc3.mute = !osc3.mute;
                }
                defaultValue = true;
                break;
            default:
                actionFunction = function() {
                    console.log("Checkbox function not set");
                }
                defaultValue = false;
        }

        // Create and add checkbox to array to be returned
        checkboxArray.push(new Checkbox(checkboxElement, actionFunction, defaultValue));

        // Set initial checkbox value
        checkboxElement.checked = defaultValue;
    }

    return checkboxArray;
}

// Represents a select in document - extends from Input for consistency with rest of script
class Select extends Input {
    constructor(element, action) {
        super(element, action);
    }
}

setSelectListeners();

// Set up event listeners for selects
function setSelectListeners() {
    const selects = createSelectObjects();

    // Set listeners on each select in document
    for(let select of selects) {
        const element = select.element;

        element.addEventListener("change", (event) => {
            // Change waveform
            select.action(event.target.value);
        });
    }
}

// Create array of Select objects from all selects in document
function createSelectObjects() {
    const selectArray = [];
    const selectElements = document.querySelectorAll("select");

    for(let selectElement of selectElements) {
        // Declare variable to construct select
        let actionFunction;

        // Use select ID to determine what values each select will use
        switch(selectElement.id) {
            case "osc1-waveform":
                actionFunction = function(waveType) {
                    // Set osc1 waveform type
                    osc1.type = waveType;
                }
                break;
            case "osc2-waveform":
                actionFunction = function(waveType) {
                    // Set osc2 waveform type
                    osc2.type = waveType;
                }
                break;
            case "osc3-waveform":
                actionFunction = function(waveType) {
                    // Set osc3 waveform type
                    osc3.type = waveType;
                }
                break;
            case "osc1-range":
                actionFunction = function(range) {
                    // Set osc1 range
                    osc1RangeOffset = determineRangeOffset(range);
                }
                // Set default selected
                selectElement.value = "middle";
                break;
            case "osc2-range":
                actionFunction = function(range) {
                    // Set osc2 range
                    osc2RangeOffset = determineRangeOffset(range);
                }
                // Set default selected
                selectElement.value = "middle";
                break;
            case "osc3-range":
                actionFunction = function(range) {
                    // Set osc3 range
                    osc3RangeOffset = determineRangeOffset(range);
                }
                // Set default selected
                selectElement.value = "middle";
                break;
            default:
                actionFunction = function() {
                    console.log("Select function not set");
                }
        }

        // Create and add Selects to array to be returned
        selectArray.push(new Select(selectElement, actionFunction));
    }

    return selectArray;
}

// Determine offset value from range string value
function determineRangeOffset(range) {
    let rangeInt;

    switch(range) {
        case "low":
            rangeInt = -1;
            break;
        case "middle":
            rangeInt = 0;
            break;
        case "high":
            rangeInt = 1;
            break;
        default:
            rangeInt = 0;
            console.log("Unknown range");
    }

    return rangeInt;
}