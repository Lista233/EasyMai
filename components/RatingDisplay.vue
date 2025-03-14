<template>
  <view class="rating-container" :class="[ratingClass, { 'not-logged': !isLoggedIn }]">
    <view class="rating-title">{{ isLoggedIn ? '总 Rating' : '欢迎使用' }}</view>
    <view class="rating-value">{{ isLoggedIn ? totalRating : '请先登录' }}</view>
    <view class="rating-subtitle" v-if="isLoggedIn">B35: {{ b35rating }} + B15: {{ b15rating }}</view>
    <view class="rating-subtitle" v-else>登录后查看您的游戏成绩</view>
  </view>
</template>

<script setup>
import { computed } from 'vue';

// 定义props
const props = defineProps({
  b35rating: {
    type: Number,
    default: 0
  },
  b15rating: {
    type: Number,
    default: 0
  },
  isLoggedIn: {
    type: Boolean,
    default: false
  }
});

// 计算总Rating
const totalRating = computed(() => props.b35rating + props.b15rating);

// 根据总Rating确定样式类
const ratingClass = computed(() => {
  if (!props.isLoggedIn) return 'default';
  
  const total = totalRating.value;
  if (total >= 15000) return 'rainbow';
  if (total >= 14500) return 'bright-gold';
  if (total >= 14000) return 'gold';
  if (total >= 13000) return 'blue';
  if (total >= 12000) return 'copper';
  return 'default';
});
</script>

<style lang="scss" scoped>
.rating-container {
  width: 100%;
  max-width: 650rpx;
  margin: 20rpx auto 30rpx;
  padding: 24rpx 30rpx;
  border-radius: 20rpx;
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.06);
  text-align: center;
  position: relative;
  overflow: hidden;
  animation: fadeInUp 0.5s;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.7);
  box-sizing: border-box;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 4rpx;
    background: linear-gradient(90deg, #4ade80, #22c55e);
  }
  
  .rating-title {
    font-size: 26rpx;
    font-weight: 600;
    color: #64748b;
    margin-bottom: 8rpx;
    text-transform: uppercase;
    letter-spacing: 2rpx;
  }
  
  .rating-value {
    font-size: 64rpx;
    font-weight: 800;
    color: #334155;
    line-height: 1.2;
    margin-bottom: 6rpx;
  }
  
  .rating-subtitle {
    font-size: 22rpx;
    color: #94a3b8;
    font-weight: 500;
  }
  
  // 默认主题细节增强
  &.default {
    &::before {
      background: linear-gradient(90deg, #4ade80, #22c55e);
    }
    
    .rating-value {
      background: linear-gradient(135deg, #34d399, #10b981);
      -webkit-background-clip: text;
      color: transparent;
    }
  }
  
  // 铜色主题
  &.copper {
    &::before {
      background: linear-gradient(90deg, #f97316, #ea580c);
    }
    
    .rating-value {
      background: linear-gradient(135deg, #fb923c, #ea580c);
      -webkit-background-clip: text;
      color: transparent;
    }
  }
  
  // 蓝色主题
  &.blue {
    &::before {
      background: linear-gradient(90deg, #3b82f6, #2563eb);
    }
    
    .rating-value {
      background: linear-gradient(135deg, #60a5fa, #2563eb);
      -webkit-background-clip: text;
      color: transparent;
    }
  }
  
  // 金色主题
  &.gold {
    &::before {
      background: linear-gradient(90deg, #f59e0b, #d97706);
    }
    
    .rating-value {
      background: linear-gradient(
        to right,
        #f59e0b,
        #fbbf24,
        #d97706,
        #fbbf24,
        #f59e0b
      );
      background-size: 200% 100%;
      -webkit-background-clip: text;
      color: transparent;
      animation: gold-shine 6s linear infinite;
    }
  }
  
  // 亮金色主题
  &.bright-gold {
    &::before {
      background: linear-gradient(90deg, #facc15, #eab308);
    }
    
    .rating-value {
      background: linear-gradient(
        to right,
        #facc15,
        #fef3c7,
        #eab308,
        #fef3c7,
        #facc15
      );
      background-size: 200% 100%;
      -webkit-background-clip: text;
      color: transparent;
      animation: gold-shine 4s linear infinite;
    }
  }
  
  // 彩虹主题
  &.rainbow {
    &::before {
      background: linear-gradient(
        90deg,
        #ef4444,
        #f97316,
        #eab308,
        #22c55e,
        #0ea5e9,
        #8b5cf6,
        #ef4444
      );
      background-size: 300% 100%;
      animation: rainbow-bg 12s linear infinite;
    }
    
    .rating-value {
      background: linear-gradient(
        90deg,
        #ef4444,
        #f97316,
        #eab308,
        #22c55e,
        #0ea5e9,
        #8b5cf6,
        #ef4444
      );
      background-size: 300% 100%;
      -webkit-background-clip: text;
      color: transparent;
      animation: rainbow-text 8s linear infinite;
    }
  }
}

@keyframes gold-shine {
  0% { background-position: 0% 50%; }
  100% { background-position: 200% 50%; }
}

@keyframes rainbow-bg {
  0% { background-position: 0% 50%; }
  100% { background-position: 300% 50%; }
}

@keyframes rainbow-text {
  0% { background-position: 0% 50%; }
  100% { background-position: 300% 50%; }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// 添加未登录状态的样式
.not-logged {
  &::before {
    background: linear-gradient(90deg, #94a3b8, #64748b);
  }
  
  .rating-value {
    font-size: 48rpx;
    background: linear-gradient(135deg, #94a3b8, #64748b);
    -webkit-background-clip: text;
    color: transparent;
  }
}
</style> 