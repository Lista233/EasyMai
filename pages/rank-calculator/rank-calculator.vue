<template>
  <view class="calculator-container">
    <view class="header">
      <text class="title">Rating 计算器</text>
      <text class="subtitle">根据定数与达成率计算Rating</text>
    </view>
    
    <!-- 计算器部分 -->
    <view class="calculator-section">
      <view class="input-group">
        <view class="input-label">歌曲定数</view>
        <input 
          type="digit" 
          v-model="songLevel" 
          class="input-field" 
          placeholder="输入歌曲定数"
          @blur="calculateRating"
        />
      </view>
      
      <view class="input-group">
        <view class="input-label">达成率 (%)</view>
        <input 
          type="digit" 
          v-model="achievement" 
          class="input-field" 
          placeholder="输入达成率"
          @blur="calculateRating"
        />
      </view>
      
      <!-- 结果显示 -->
      <view class="result-container">
        <view v-if="errorMessage" class="error-overlay">
          <text class="error-text">{{ errorMessage }}</text>
        </view>
        
        <template v-else>
          <view class="result-item">
            <text class="result-label">RANK 等级</text>
            <text class="result-value rank-value">{{ rankResult }}</text>
          </view>
          
          <view class="result-item">
            <text class="result-label">单曲 Rating</text>
            <text class="result-value">{{ ratingResult }}</text>
          </view>
          
          <view class="result-item">
            <text class="result-label">系数</text>
            <text class="result-value">{{ multiplier }}</text>
          </view>
        </template>
      </view>
    </view>
    
    <!-- RANK 系数表 -->
    <view class="rank-table-section">
      <view class="section-title">RANK 系数表</view>
      <view class="rank-formula">
        <text>单曲rating = 歌曲定数 × 系数 × 达成率(取整，不计小数)</text>
        <text>歌曲rating = 15个最高单曲rating(舞萌2024分类) + 35个最高单曲rating(舞萌2024以外分类)</text>
      </view>
      
      <view class="rank-table">
        <view class="table-header">
          <text class="table-cell rank-cell">RANK</text>
          <text class="table-cell">达成率</text>
          <text class="table-cell">系数</text>
          <text class="table-cell">倍率(达成率*系数)</text>
        </view>
        
        <view v-for="(rank, index) in rankTable" :key="index" class="table-row">
          <text class="table-cell rank-cell" :class="{'highlight': isCurrentRank(rank.name)}">{{ rank.name }}</text>
          <text class="table-cell" :class="{'highlight': isCurrentRank(rank.name)}">{{ rank.achievement }}</text>
          <text class="table-cell" :class="{'highlight': isCurrentRank(rank.name)}">{{ rank.multiplier }}</text>
          <text class="table-cell" :class="{'highlight': isCurrentRank(rank.name)}">{{ rank.rate }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

// 输入值
const songLevel = ref('');
const achievement = ref('');
const errorMessage = ref('');

// RANK 表数据
const rankTable = [
  { name: 'SSS+', achievement: '100.5000%', multiplier: '22.4', rate: '22.512' },
  { name: 'SSS', achievement: '100.4999%', multiplier: '22.2', rate: '22.310' },
  { name: 'SSS', achievement: '100.0000%', multiplier: '21.6', rate: '21.707-21.600' },
  { name: 'SS+', achievement: '99.9999%', multiplier: '21.4', rate: '21.399' },
  { name: 'SS+', achievement: '99.5000%', multiplier: '21.1', rate: '21.099-20.994' },
  { name: 'SS', achievement: '99.0000%', multiplier: '20.8', rate: '20.695-20.592' },
  { name: 'S+', achievement: '98.0000%', multiplier: '20.3', rate: '20.096-19.894' },
  { name: 'S', achievement: '97.0000%', multiplier: '20.0', rate: '19.599-19.400' },
];

// 计算结果
const rankResult = ref('-');
const ratingResult = ref('-');
const multiplier = ref('-');

// 计算当前 RANK 和 Rating
const calculateRating = () => {
  // 重置错误信息
  errorMessage.value = '';
  
  if (!songLevel.value || !achievement.value) {
    rankResult.value = '-';
    ratingResult.value = '-';
    multiplier.value = '-';
    return;
  }
  
  const level = parseFloat(songLevel.value);
  let achieve = parseFloat(achievement.value);
  
  if (isNaN(level) || isNaN(achieve)) return;
  
  // 检查歌曲定数范围
  if(level < 1.0 ){
	  errorMessage.value = '定数<1,你也不想rating变成负数吧\n(•́へ•́╬)(威胁)'
	  return;
  }
  if (level > 15.0) {
    errorMessage.value = '定数>15,是中二定数(*^▽^*)(确信)\n';
    return;
  }
  
  // 检查达成率范围
  if (achieve > 101.0000) {
    errorMessage.value = '准度太高了,溢出来了o(╥﹏╥)o';
    return;
  } else if (achieve < 97.0000) {
    errorMessage.value = '准度<97%,不要越级啊喂(#`O′)';
    return;
  }
  
  // 如果达成率在 100.5% 到 101% 之间，按 100.5% 计算
  if (achieve > 100.5000 && achieve <= 101.0000) {
    achieve = 100.5000;
  }
  
  // 确定 RANK 和系数
  let rankIndex = rankTable.length - 1;
  for (let i = 0; i < rankTable.length; i++) {
    const rankAchieve = parseFloat(rankTable[i].achievement.replace('%', ''));
    if (achieve >= rankAchieve) {
      rankIndex = i;
      break;
    }
  }
  
  rankResult.value = rankTable[rankIndex].name;
  multiplier.value = rankTable[rankIndex].multiplier;
  
  // 计算 Rating
  const multi = parseFloat(rankTable[rankIndex].multiplier);
  const rating = Math.floor(level * multi * (achieve / 100));
  ratingResult.value = rating.toString();
};

// 检查是否为当前 RANK
const isCurrentRank = (rankName) => {
  return rankName === rankResult.value;
};

onMounted(() => {
  // 页面加载时的初始化逻辑
  uni.setNavigationBarTitle({
    title: 'RANK 计算器'
  });
});
</script>

<style lang="scss" scoped>
.calculator-container {
  padding: 30rpx;
  background-color: #f0f4ff;
  min-height: 100vh;
}

.header {
  margin-bottom: 40rpx;
  
  .title {
    font-size: 44rpx;
    font-weight: 700;
    color: #3949ab;
    display: block;
    margin-bottom: 10rpx;
  }
  
  .subtitle {
    font-size: 28rpx;
    color: #5c6bc0;
  }
}

.calculator-section {
  background: #ffffff;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 40rpx;
  box-shadow: 0 4rpx 20rpx rgba(63, 81, 181, 0.1);
}

.input-group {
  margin-bottom: 24rpx;
  
  .input-label {
    font-size: 28rpx;
    font-weight: 600;
    color: #3949ab;
    margin-bottom: 12rpx;
  }
  
  .input-field {
    width: 90%;
    height: 80rpx;
    background: #f5f7ff;
    border: 2rpx solid #c5cae9;
    border-radius: 12rpx;
    padding: 0 24rpx;
    font-size: 32rpx;
    color: #303f9f;
  }
}

.result-container {
  margin-top: 40rpx;
  background: linear-gradient(135deg, #3949ab, #5c6bc0);
  border-radius: 16rpx;
  padding: 30rpx;
  display: flex;
  justify-content: space-between;
  position: relative;
  min-height: 120rpx;
  
  .error-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    background: rgba(57, 73, 171, 0.9);
    border-radius: 16rpx;
    animation: fadeIn 0.3s ease;
    
    .error-text {
      font-size: 36rpx;
      font-weight: 700;
      color: #ffffff;
      text-align: center;
    }
  }
  
  .result-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    
    .result-label {
      font-size: 24rpx;
      color: rgba(255, 255, 255, 0.8);
      margin-bottom: 8rpx;
    }
    
    .result-value {
      font-size: 36rpx;
      font-weight: 700;
      color: #ffffff;
    }
    
    .rank-value {
      font-size: 44rpx;
    }
  }
}

.rank-table-section {
  background: #ffffff;
  border-radius: 20rpx;
  padding: 30rpx;
  box-shadow: 0 4rpx 20rpx rgba(63, 81, 181, 0.1);
  
  .section-title {
    font-size: 34rpx;
    font-weight: 700;
    color: #3949ab;
    margin-bottom: 20rpx;
  }
  
  .rank-formula {
    background: #e8eaf6;
    border-radius: 12rpx;
    padding: 20rpx;
    margin-bottom: 30rpx;
    
    text {
      display: block;
      font-size: 24rpx;
      color: #3949ab;
      line-height: 1.5;
    }
  }
}

.rank-table {
  border-radius: 12rpx;
  overflow: hidden;
  border: 2rpx solid #c5cae9;
  
  .table-header {
    display: flex;
    background: #3949ab;
    
    .table-cell {
      flex: 1;
      padding: 16rpx 12rpx;
      font-size: 26rpx;
      font-weight: 600;
      color: #ffffff;
      text-align: center;
    }
    
    .rank-cell {
      flex: 0.8;
    }
  }
  
  .table-row {
    display: flex;
    border-bottom: 2rpx solid #e8eaf6;
    
    &:last-child {
      border-bottom: none;
    }
    
    .table-cell {
      flex: 1;
      padding: 16rpx 12rpx;
      font-size: 26rpx;
      color: #3c4043;
      text-align: center;
      
      &.highlight {
        background-color: #e8eaf6;
        font-weight: 600;
        color: #3949ab;
      }
    }
    
    .rank-cell {
      flex: 0.8;
      font-weight: 600;
    }
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style> 