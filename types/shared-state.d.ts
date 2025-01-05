enum ServoAnimations {
  Linear,
  Jumping,
  Sine,
}

type ServoSharedState = {
  angle: number;
  isEnabled: boolean;

  error?: string;
  runningAnimation?: ServoAnimations;
  animationFrequency?: number;
};

type MotorSharedState = {
  isEnabled: boolean;

  error?: string;
};

type ShockPower = {
  power: number;
  isTesting: boolean;
};

type ScheduleState = {
  alarmTime: string;
  scheduleId: string;
};
