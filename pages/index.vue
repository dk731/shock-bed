<script lang="ts" setup>
import hardwareConfig from "#utils/hardware-configuration";
import { DateTime, Duration } from "luxon";

const registeredSchedules = useSocketState<ScheduleState[]>(
  `registeredSchedules`,
  [
    {
      scheduleId: "qwe",
      alarmTime: DateTime.now().plus(Duration.fromMillis(10000)).toISO(),
    },
  ]
);

const schedules = computed({
  get() {
    return (
      registeredSchedules.state.value?.map((el) => ({
        ...el,
        parsedTime: DateTime.fromISO(el.alarmTime),
      })) || []
    );
  },
  set(value: ScheduleState[]) {
    // registeredSchedules.setState(value);
  },
});

const currentTime = ref(DateTime.now());

onMounted(() => setInterval(() => (currentTime.value = DateTime.now()), 100));

async function onScheduleClick(scheduleId: string) {
  registeredSchedules.state.value = registeredSchedules.state.value?.filter(
    (el) => el.scheduleId !== scheduleId
  );
}
</script>

<template>
  <div class="flex flex-col p-4">
    <ShockPower />
    <Separator class="h-px my-8 w-full bg-base-300" />
    <div class="text-center place-items-center">
      <template v-for="(schedule, i) in schedules" :key="i">
        <div
          class="flex flex-row shadow-lg"
          :class="{
            'animate-[pulse_1s_ease-in-out_infinite] border-2 border-warning rounded-lg p-4 ':
              DateTime.fromISO(schedule.alarmTime)
                .diffNow()
                .as(`milliseconds`) < 0,
          }"
        >
          <div class="flex flex-col mb-2 p-4 rounded-lg mr-8">
            <div class="text-xl font-bold mb-4">
              Scheduled Time:
              {{ DateTime.fromISO(schedule.alarmTime).toFormat("HH:mm") }}
            </div>
            <div class="text-lg font-bold">
              Shock In:
              {{
                DateTime.fromISO(schedule.alarmTime)
                  .diff(currentTime, [
                    "hours",
                    "minutes",
                    "seconds",
                    "milliseconds",
                  ])
                  .toHuman()
                  .split(", ")
                  .splice(0, 3)
                  .join(", ")
              }}
            </div>
          </div>
          <button
            class="btn"
            @click="() => onScheduleClick(schedule.scheduleId)"
          >
            Cancel
          </button>
        </div>
      </template>
    </div>
  </div>
</template>
