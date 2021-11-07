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
            event.stopPropagation();
        });

        key.addEventListener("mouseup", () => {
            osc1.stop();
        });

        key.addEventListener("mouseleave", () => {
            osc1.stop();
        });
    }
}