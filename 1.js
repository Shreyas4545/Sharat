const leftButton = document.querySelector("#left-button");
const rightButton = document.querySelector("#right-button");
const stopButton = document.querySelector("#stop-button");
const leftIndicator = document.querySelector(".left-indicator");
const rightIndicator = document.querySelector(".right-indicator");
const parkingLights = document.querySelector(".parking-lights");
const parkingLightsButton = document.querySelector("#parkingLightsButton");
let blinkInterval;

leftButton.addEventListener("click", () => {
  clearInterval(blinkInterval);
  leftIndicator.style.opacity = "1";
  rightIndicator.style.opacity = "0";
  blinkInterval = setInterval(() => {
    leftIndicator.style.opacity =
      leftIndicator.style.opacity === "0" ? "1" : "0";
  }, 500);
});

rightButton.addEventListener("click", () => {
  clearInterval(blinkInterval);
  rightIndicator.style.opacity = "1";
  leftIndicator.style.opacity = "0";
  blinkInterval = setInterval(() => {
    rightIndicator.style.opacity =
      rightIndicator.style.opacity === "0" ? "1" : "0";
  }, 500);
});

stopButton.addEventListener("click", () => {
  clearInterval(blinkInterval);
  leftIndicator.style.opacity = "0";
  rightIndicator.style.opacity = "0";
});
function updateRpm(value) {
  document.querySelector("#revmeter .gauge").style.setProperty("--rpm", value);
}

function updateKmh(value) {
  document
    .querySelector("#speedmeter .gauge")
    .style.setProperty("--kmh", Math.round(value));
}

function updateGear(value) {
  document.querySelector("#revmeter .gauge").style.setProperty("--gear", value);
}

/* Binding functions for manual control of CSS prips from inputs */
const rpmControl = document.querySelector("input[name=rpm]");

rpmControl.addEventListener("keyup", function () {
  updateRpm(this.value);
});
rpmControl.addEventListener("input", function () {
  updateRpm(this.value);
});

const kmhControl = document.querySelector("input[name=kmh]");

kmhControl.addEventListener("keyup", function () {
  updateKmh(this.value);
});
kmhControl.addEventListener("input", function () {
  updateKmh(this.value);
});

const gearControl = document.querySelector("input[name=gear]");

gearControl.addEventListener("keyup", function () {
  updateGear(this.value);
});
gearControl.addEventListener("input", function () {
  updateGear(this.value);
});

/* Driving simulation */

let speed = 0;
let revs = 750;
let gear = 0;
let _prevGear = 0;
let gas = 0;
const idleRevs = 750;
const revLimiter = 6700;
const topGear = 6;
const minGearRatio = 24;
const maxGearRatio = 100;
const gearRatios = [0, 125, 78, 47, 34, 27, 24].map((i) => (i ? 1 / i : i));

function gearUp() {
  if (gear < topGear) {
    _prevGear = gear;
    gear++;
  }
  gearControl.value = gear;
  updateGear(gear);
}

function gearDown() {
  if (gear) {
    _prevGear = gear;
    gear--;
  }
  gearControl.value = gear;
  updateGear(gear);
}

function speedDown() {
  if (speed > 0) {
    speed = Math.max(speed - 1, 0);
  }
}

function calculateSpeed() {
  if (gear) {
    speed = gearRatios[gear] * revs;
  } else {
    speedDown();
  }

  kmhControl.value = speed;
  updateKmh(speed);
}

function calculateRevsFromSpeed() {
  if (gearRatios[gear]) {
    revs = speed / gearRatios[gear];
    if (revs < idleRevs) {
      revs = idleRevs;
      if (_prevGear) {
        _prevGear = gear;
        gear = 0;
      }
      gearControl.value = gear;
      updateGear(gear);
      updateRpm(revs);
    }
  }
}

const to = setInterval(() => {
  if (gas) {
    if (revs < revLimiter) {
      revs += (1 - Math.random()) * 200 + (gearRatios.length - gear) * 100;
    } else {
      if (revs < idleRevs) {
        revs = idleRevs;
      } else {
        revs -= 300;
      }
    }
  } else {
    if (gear) {
      speedDown();
      calculateRevsFromSpeed();
    } else {
      if (revs > idleRevs) {
        revs -= (1 - Math.random()) * 200 + 200;
      }
    }
  }

  rpmControl.value = revs;
  updateRpm(revs);
  calculateSpeed();
}, 100);

const throttleButton = document.querySelector("button[name=throttle]");

throttleButton.addEventListener("mousedown", () => (gas = 1));
throttleButton.addEventListener("mouseup", () => (gas = 0));

const gearUpButton = document.querySelector('button[name="gear-up"]');
const gearDownButton = document.querySelector('button[name="gear-down"]');

gearUpButton.addEventListener("click", gearUp);
gearDownButton.addEventListener("click", gearDown);

const gearControls = Array.from(
  document.querySelectorAll("input[type=range][name^=gear]")
);

gearControls.forEach((gearControl, index) => {
  gearRatios[index + 1] = 1 / Number.parseInt(gearControl.value, 10);

  gearControl.addEventListener("input", function () {
    let value = Number.parseInt(this.value, 10);
    const minValue = Number.parseInt(this.dataset.min, 10);
    const maxValue = Number.parseInt(this.dataset.max, 10);

    if (value < minValue) {
      this.value = minValue;
      value = minValue;
    }
    if (value > maxValue) {
      this.value = maxValue;
      value = maxValue;
    }

    if (index) {
      gearControls[index - 1].dataset.min = value + 1;
    }
    if (index < gearControls.length - 1) {
      gearControls[index + 1].dataset.max = value - 1;
    }

    gearRatios[index + 1] = 1 / value;
    this.nextElementSibling.textContent = `1/${value}`;
  });
});

const lowBeamButton = document.querySelector("#low-beam");
const highBeamButton = document.querySelector("#high-beam");
const headlight = document.querySelector(".headlight");

lowBeamButton.addEventListener("click", () => {
  headlight.style.opacity = 0.5; // Adjust the opacity for low beam
});

highBeamButton.addEventListener("click", () => {
  headlight.style.opacity = 1; // Set full opacity for high beam
});

let parkingLightsBlinking = false;
let parkingLightsInterval;
parkingLightsButton.addEventListener("click", () => {
  toggleParkingLights();
});

function toggleParkingLights() {
  if (parkingLightsBlinking) {
    stopParkingLights();
  } else {
    startParkingLights();
  }
}

function startParkingLights() {
  parkingLightsBlinking = true;
  parkingLightsInterval = setInterval(() => {
    parkingLights.style.opacity =
      parkingLights.style.opacity === "0" ? "1" : "0";
  }, 500); // Blink every 500 milliseconds
}

function stopParkingLights() {
  parkingLightsBlinking = false;
  clearInterval(parkingLightsInterval);
  parkingLights.style.opacity = "0"; // Ensure headlight is visible after stopping blinking
}
