import hardwareConfig from "#utils/hardware-configuration";
import { DateTime } from "luxon";
import { SharedState } from "./2.socket-shared-state";
import { Gpio, I2C, Level, Mode } from "@okee-tech/rppal";
import { Mutex } from "async-mutex";

const gpio = new Gpio();
const hvEnablePin = gpio.get(hardwareConfig.hvEnablePin);
const shockOutputPin = gpio.get(hardwareConfig.shockOuputPin);
const hvI2cPot = new I2C(hardwareConfig.i2cPotBus);
hvEnablePin.mode = Mode.Output;
shockOutputPin.mode = Mode.Output;
const shockMutex = new Mutex();
let isShockActive: SharedState<boolean>;

async function doShockAnimation() {
  const lockGuard = await shockMutex.acquire();
  try {
    isShockActive.state = true;

    console.log("Starting shock animation");

    hvEnablePin.value = Level.High;
    for (let i = 1; i <= 10; i++) {
      shockOutputPin.setPwm(i * 10, i * 0.6);
      await new Promise((resolve) => setTimeout(resolve, i * 125));
    }

    hvEnablePin.value = Level.Low;
    shockOutputPin.clearPwm();
    isShockActive.state = false;
  } finally {
    lockGuard();
  }
}

const scheduleTimeouts: Map<string, NodeJS.Timeout> = new Map();
async function onScheduleUpdate(
  originalState: SharedState<ScheduleState[]>,
  state: ScheduleState[]
) {
  for (const [scheduleId, timeout] of scheduleTimeouts) {
    if (state.some((schedule) => schedule.scheduleId === scheduleId)) continue;

    console.log(`Clearing deleted schedule: ${scheduleId}`);
    clearTimeout(timeout);
    scheduleTimeouts.delete(scheduleId);
  }

  for (const schedule of state) {
    if (scheduleTimeouts.has(schedule.scheduleId)) continue;

    console.log(`Registering schedule: ${schedule.scheduleId}`);
    const scheduleDelay = DateTime.fromISO(schedule.alarmTime)
      .diffNow()
      .as("milliseconds");

    scheduleTimeouts.set(
      schedule.scheduleId,
      setTimeout(async () => {
        console.log(`Executing schedule: ${schedule.scheduleId}`);
        await doShockAnimation();

        setTimeout(() => {
          console.log(`Finishing scheduled shock: ${schedule.scheduleId}`);
          originalState.state =
            originalState.state?.filter(
              (el) => el.scheduleId !== schedule.scheduleId
            ) ?? [];
        }, 1000);
      }, scheduleDelay)
    );
  }
}

async function onShockPowerUpdate(
  originalState: SharedState<ShockPowerState>,
  state: ShockPowerState
) {
  const newPotValue = Math.round((1 - state.power) * 255) & 0xff;

  console.log(`Setting pot value to ${newPotValue}`);
  await hvI2cPot.write(hardwareConfig.i2cPotAddress, [0x00, newPotValue]);

  if (state.isTesting) {
    console.log("Testing shock power");
    await doShockAnimation();
    setTimeout(() => {
      console.log("Finishing test shock");
      originalState.state = { ...state, isTesting: false };
    }, 1000);
  }
}

async function hardwareRoutine() {
  const registeredSchedules = SharedState.get<ScheduleState[]>(
    `registeredSchedules`,
    []
  );
  const shockPowerState = SharedState.get<ShockPowerState>(`shockPower`, {
    power: 0.1,
    isTesting: false,
  });
  isShockActive = SharedState.get<boolean>(`isShockActive`, false);

  registeredSchedules.on("update", (newState) =>
    onScheduleUpdate(registeredSchedules, newState)
  );
  shockPowerState.on("update", (newState) =>
    onShockPowerUpdate(shockPowerState, newState)
  );
}

export default defineNitroPlugin(hardwareRoutine);
