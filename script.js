const keyboard = document.querySelector("#keyboard");
const osc1 = new Tone.Oscillator();
const ampEnv = new Tone.AmplitudeEnvelope({
    attack: 0,
    decay: 0,
    sustain: 1,
    release: 0.05   // Release at 0.05 to avoid bug and give smoother sound without dedicated knob
}).toDestination();

osc1.type = "sine";
osc1.connect(ampEnv);

setKeyboardListeners();

// Set up event listeners for keyboard controller
function setKeyboardListeners() {
    // Get all keys on keyboard
    const keys = keyboard.querySelectorAll(".note");

    // Set listeners on each key on keyboard
    for(let key of keys) {
        key.addEventListener("mousedown", (event) => {
            // Play note associated with key
            osc1.frequency.value = key.dataset.note;
            if(osc1.state === "stopped") {
                osc1.start();
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

// Represents a knob in document with reference to the element and current rotation
class Knob {
    constructor(element, curRotation, action) {
        this.element = element;
        this.curRotation = curRotation;
        this.action = action;
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
            case "amp-attack":
                actionFunction = function() {
                    // Set attack based on knob (range 0 - 2)
                    ampEnv.attack = (this.curRotation + 130) / 130
                }
                defaultRotation = -130;
                break;
            case "amp-decay":
                actionFunction = function() {
                    // Set decay based on knob (range 0 - 2)
                    ampEnv.decay = (this.curRotation + 130) / 130
                }
                defaultRotation = -130;
                break;
            case "amp-sustain":
                actionFunction = function() {
                    // Set sustain based on knob (range 0 - 1)
                    ampEnv.sustain = (this.curRotation + 130) / 260
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
        knobArray.push(new Knob(knobElement, defaultRotation, actionFunction));

        // Set initial knob rotation
        knobElement.querySelector(".knob-graphics").style.transform = `rotate(${defaultRotation}deg)`;
    }

    return knobArray;
}