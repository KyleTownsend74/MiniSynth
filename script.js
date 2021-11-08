const keyboard = document.querySelector("#keyboard");
const osc1 = new Tone.Oscillator().toDestination();

osc1.type = "sine";

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
            osc1.start();
            key.classList.add("pressed");
            event.stopPropagation();
        });

        key.addEventListener("mouseup", () => {
            key.classList.remove("pressed");
            osc1.stop();
        });

        key.addEventListener("mouseleave", () => {
            key.classList.remove("pressed");
            osc1.stop();
        });
    }
}

// Represents a knob in document with reference to the element and current rotation
class Knob {
    constructor(element, curRotation) {
        this.element = element;
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
        });

        // Rotate knob right by 10 degrees
        upButton.addEventListener("mousedown", () => {
            // Get the new rotation (without passing 130 degrees)
            const newRotation = Math.min(130, knob.curRotation + 10);

            // Update the rotation
            graphics.style.transform = `rotate(${newRotation}deg)`;
            knob.curRotation = newRotation;
        });
    }
}

// Create array of Knob objects from all knobs in document
function createKnobObjects() {
    const knobArray = [];
    const knobElements = document.querySelectorAll(".knob");

    for(let knobElement of knobElements) {
        knobArray.push(new Knob(knobElement, 0));
    }

    return knobArray;
}