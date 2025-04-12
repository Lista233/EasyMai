<template>
  <!-- <view class="maimai-calculator" :class="{'dark-mode': isDarkMode}"> -->
      <MaimaiCalculator />
  <!-- </view> -->
</template>

<script setup>
import MaimaiCalculator from '@/components/maimai-calculator/maimai-calculator.vue';
import { inject,onBeforeMount } from 'vue';
import {updateNativeTabBar} from '@/utils/updateNativeTabBar.js';
const applyTheme=inject('applyTheme',false);
// 注入深色模式变量
const isDarkMode = inject('isDarkMode', false);
onBeforeMount(()=>{
  applyTheme();
  updateNativeTabBar(isDarkMode.value);
})
</script>

<style lang="scss">
.maimai-calculator {
  padding: 20px;
  background-color: #f5f5f5;
  min-height: 100vh;
  
  // 深色模式样式
  &.dark-mode {
    background-color: #1a1c2a;
    
    .page-title {
      color: #e0e0e0;
    }
  }
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