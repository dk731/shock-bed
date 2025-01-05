<script lang="ts" setup>
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

const newShockScheduleMinutes = ref<{
  minutes: number;
  hours: number;
}>({
  minutes: 5,
  hours: 0,
});

const schedules = computed(() => {
  const parsedTimes =
    registeredSchedules.state.value?.map((el) => ({
      ...el,
      parsedTime: DateTime.fromISO(el.alarmTime),
    })) || [];

  parsedTimes.sort((el1, el2) => {
    return el1.parsedTime.diff(el2.parsedTime).as("milliseconds");
  });

  return parsedTimes;
});

const currentTime = ref(DateTime.now());

onMounted(() => setInterval(() => (currentTime.value = DateTime.now()), 100));

async function onScheduleClick(scheduleId: string) {
  registeredSchedules.state.value = registeredSchedules.state.value?.filter(
    (el) => el.scheduleId !== scheduleId
  );
}

async function onScheduleAddClick() {
  const newSchedule = {
    scheduleId: Math.random().toString(36).substring(7),
    alarmTime: DateTime.now()
      .plus({
        hours: newShockScheduleMinutes.value.hours,
        minutes: newShockScheduleMinutes.value.minutes,
      })
      .toISO(),
  };
  registeredSchedules.state.value = [
    ...registeredSchedules.state.value!,
    newSchedule,
  ];
}
</script>

<template>
  <div class="flex flex-col p-4">
    <ShockPower />
    <Separator class="h-px my-8 w-full bg-base-300" />
    <div class="text-center place-items-center">
      <div class="flex flex-row mb-8 shadow p-4">
        <NumberFieldRoot
          id="age"
          v-model="newShockScheduleMinutes.hours"
          class="text-sm flex flex-row items-center mr-8"
          :min="0"
          :default-value="5"
        >
          <div class="mr-4">Schock In:</div>
          <div class="mt-1 flex items-center border rounded-md">
            <NumberFieldDecrement class="p-2 disabled:opacity-20">
              <icon name="mdi:minus" />
            </NumberFieldDecrement>
            <NumberFieldInput
              class="bg-transparent w-20 tabular-nums focus:outline-0 p-1"
            />
            <NumberFieldIncrement class="p-2 disabled:opacity-20">
              <icon name="mdi:plus" />
            </NumberFieldIncrement>
          </div>
          <div class="ml-4">hours</div>
        </NumberFieldRoot>
        <NumberFieldRoot
          id="age"
          v-model="newShockScheduleMinutes.minutes"
          class="text-sm flex flex-row items-center mr-8"
          :min="0"
          :default-value="5"
        >
          <div class="mt-1 flex items-center border rounded-md">
            <NumberFieldDecrement class="p-2 disabled:opacity-20">
              <icon name="mdi:minus" />
            </NumberFieldDecrement>
            <NumberFieldInput
              class="bg-transparent w-20 tabular-nums focus:outline-0 p-1"
            />
            <NumberFieldIncrement class="p-2 disabled:opacity-20">
              <icon name="mdi:plus" />
            </NumberFieldIncrement>
          </div>
          <div class="ml-4">minutes</div>
        </NumberFieldRoot>
        <button class="btn" @click="onScheduleAddClick">Add</button>
      </div>
      <template v-if="schedules.length > 0">
        <template v-for="(schedule, i) in schedules" :key="i">
          <div
            class="flex flex-row shadow-lg mb-2"
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
      </template>
      <template v-else> No schedules found </template>
    </div>
  </div>
</template>
