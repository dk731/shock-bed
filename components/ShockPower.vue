<script lang="ts" setup>
const shockPower = useSocketState<ShockPowerState>(`shockPower`, {
  power: 0.5,
  isTesting: false,
});
</script>

<template>
  <div class="grid grid-cols-2 place-items-center p-4 rounded">
    <template v-if="shockPower.state.value !== undefined">
      <div class="w-full flex flex-col">
        <div class="mb-4">
          Power: {{ Math.round(shockPower.state.value.power * 1000) / 10 }}%
        </div>
        <!-- eslint-disable-next-line vue/html-self-closing -->
        <input
          v-model="shockPower.state.value.power"
          class="range"
          type="range"
          :min="0.001"
          :max="1"
          :step="0.001"
        />
      </div>

      <button
        class="btn"
        @click="() => (shockPower.state.value!.isTesting = true)"
      >
        <span>Start Test</span>
        <icon name="mdi:flash" size="25" />
      </button>
    </template>
    <template v-else>
      <span class="loading loading-spinner loading-lg" />
    </template>
  </div>
</template>
