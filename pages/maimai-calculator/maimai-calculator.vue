<template>
  <view class="maimai-calculator">
      <MaimaiCalculator />
  </view>
</template>

<script setup>
import MaimaiCalculator from '@/components/maimai-calculator/maimai-calculator.vue';
</script>

<style>
.maimai-calculator {
  padding: 20px;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.page-title {
  font-size: 22px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 30px;
  color: #333;
}

.calculator-wrapper {
  margin: 0 auto;
  max-width: 650px;
}
</style> 