<script lang="ts" setup>
const shockPower = useSocketState<ShockPower>(`shockPower`, {
  power: 0.5,
  isTesting: false,
});
</script>

<template>
  <div
    class="grid grid-cols-2 place-items-center p-4 rounded"
    :class="{
      'animate-[pulse_1s_ease-in-out_infinite] border-2 border-warning':
        shockPower.state.value?.isTesting,
    }"
  >
    <template v-if="shockPower.state.value !== undefined">
      <div class="w-full flex flex-col">
        <div class="mb-4">
          Power: {{ Math.round(shockPower.state.value.power * 100) }}%
        </div>
        <!-- eslint-disable-next-line vue/html-self-closing -->
        <input
          v-model="shockPower.state.value.power"
          class="range"
          type="range"
          :min="0.01"
          :max="1"
          :step="0.01"
        />
      </div>

      <button
        class="btn"
        @click="() => (shockPower.state.value!.isTesting = !shockPower.state.value!.isTesting)"
      >
        <span>Toggle Test </span>
        <icon name="mdi:flash" size="25" />
      </button>
    </template>
    <template v-else>
      <span class="loading loading-spinner loading-lg" />
    </template>
  </div>
</template>
