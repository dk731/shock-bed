<script setup lang="ts">
const registeredSchedules = useSocketState<boolean>(`isShockActive`);
</script>

<template>
  <div
    class="min-h-screen min-w-screen box-border"
    :class="{
      'animate-[pulse_1s_ease-in-out_infinite] border-2 border-warning':
        registeredSchedules.state.value,
    }"
  >
    <!-- Sticky header -->
    <header class="w-full bg-base-100 shadow-lg">
      <nav class="navbar container mx-auto px-4">
        <div class="flex-1">
          <icon class="mr-4" name="mdi:electricity" size="40" />
          <div>Shock Bed</div>
        </div>
      </nav>
    </header>

    <!-- Main content -->
    <main class="h-full mx-auto px-2 py-6 overflow-auto">
      <slot />
    </main>
  </div>
</template>
