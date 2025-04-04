<template>
  <view class="loss-calculator-container">
    <!-- <view class="title">容错计算</view> -->
    
    <!-- <view v-if="props.useExternalData" class="data-source-info">
      <text>使用当前谱面数据</text>
    </view> -->
    
    <view class="note-count-info">
      <text class="note-count-text">{{ selectedNoteType.name }} 音符数量：</text>
      <text class="note-count-value">{{ noteCount }}/{{ totalNotes }}</text>
    </view>
    
    <view class="note-type-tabs">
      <view 
        v-for="(type, index) in noteTypes" 
        :key="index"
        class="note-type-tab"
        :class="{ active: selectedNoteTypeIndex === index }"
        @click="selectedNoteTypeIndex = index"
      >
        {{ type.name }}
      </view>
    </view>
    
    <!-- <button @click="calculate" class="calculate-btn">计算损失</button> -->
    
    <view v-if="showResults" class="results">
      <view class="section-title">{{ selectedNoteType.name }} 音符判定损失</view>
      
      <view class="result-table">
        <view class="table-header">
          <view class="header-cell">判定</view>
          <view class="header-cell">损失达成率</view>
          <view class="header-cell" v-if="isBreakNote">奖励损失</view>
        </view>
        
        <view v-if="isBreakNote" class="table-section">
          <view class="section-title">Perfect 判定</view>
          
          <view class="table-row">
            <view class="cell">50落 (0.75)</view>
            <view class="cell">{{ formatPercent(singleNoteLoss.perfectHigh) }}%</view>
            <view class="cell">-{{ formatPercent(singleNoteBonusLoss.perfectHigh) }}%</view>
          </view>
          
          <view class="table-row">
            <view class="cell">100落 (0.5)</view>
            <view class="cell">{{ formatPercent(singleNoteLoss.perfectLow) }}%</view>
            <view class="cell">-{{ formatPercent(singleNoteBonusLoss.perfectLow) }}%</view>
          </view>
        </view>
        
        <view class="table-section">
          <view class="section-title" v-if="isBreakNote">Great 判定</view>
          
          <view class="table-row" v-if="isBreakNote">
            <view class="cell">80% Great</view>
            <view class="cell">{{ formatPercent(singleNoteLoss.greatHigh) }}%</view>
            <view class="cell">-{{ formatPercent(singleNoteBonusLoss.greatHigh) }}%</view>
          </view>
          
          <view class="table-row" v-if="isBreakNote">
            <view class="cell">60% Great</view>
            <view class="cell">{{ formatPercent(singleNoteLoss.greatMid) }}%</view>
            <view class="cell">-{{ formatPercent(singleNoteBonusLoss.greatMid) }}%</view>
          </view>
          
          <view class="table-row" v-if="isBreakNote">
            <view class="cell">50% Great</view>
            <view class="cell">{{ formatPercent(singleNoteLoss.greatLow) }}%</view>
            <view class="cell">-{{ formatPercent(singleNoteBonusLoss.greatLow) }}%</view>
          </view>
          
          <view class="table-row" v-if="!isBreakNote">
            <view class="cell">Great</view>
            <view class="cell">{{ formatPercent(singleNoteLoss.great) }}%</view>
          </view>
        </view>
        
        <view class="table-section">
          <view class="table-row">
            <view class="cell">Good</view>
            <view class="cell">{{ formatPercent(singleNoteLoss.good) }}%</view>
            <view class="cell" v-if="isBreakNote">-{{ formatPercent(singleNoteBonusLoss.good) }}%</view>
          </view>
          
          <view class="table-row">
            <view class="cell">Miss</view>
            <view class="cell">{{ formatPercent(singleNoteLoss.miss) }}%</view>
            <view class="cell" v-if="isBreakNote">-{{ formatPercent(singleNoteBonusLoss.miss) }}%</view>
          </view>
        </view>
      </view>
      
      <view class="weight-percentage">
        <text class="label">{{ selectedNoteType.name }} 占总权重比例：</text>
        <text class="value">{{ formatPercent(calculateWeightPercentage()) }}%</text>
      </view>
      
      <view class="tolerance-info">
        <view class="tolerance-title">{{ selectedNoteType.name }} 容错数量</view>
        
        <view class="tolerance-row">
          <view class="tolerance-label">SSS+ 容错 (0.5%)</view>
          <view class="tolerance-values">
            <view class="tolerance-item">
              <text class="tolerance-type">Great:</text>
              <text class="tolerance-count">{{ calculateToleranceCount(0.5, 'great') }}</text>
            </view>
            <view class="tolerance-item">
              <text class="tolerance-type">Good:</text>
              <text class="tolerance-count">{{ calculateToleranceCount(0.5, 'good') }}</text>
            </view>
            <view class="tolerance-item">
              <text class="tolerance-type">Miss:</text>
              <text class="tolerance-count">{{ calculateToleranceCount(0.5, 'miss') }}</text>
            </view>
          </view>
        </view>
        
        <view class="tolerance-row">
          <view class="tolerance-label">SSS 容错 (1%)</view>
          <view class="tolerance-values">
            <view class="tolerance-item">
              <text class="tolerance-type">Great:</text>
              <text class="tolerance-count">{{ calculateToleranceCount(1, 'great') }}</text>
            </view>
            <view class="tolerance-item">
              <text class="tolerance-type">Good:</text>
              <text class="tolerance-count">{{ calculateToleranceCount(1, 'good') }}</text>
            </view>
            <view class="tolerance-item">
              <text class="tolerance-type">Miss:</text>
              <text class="tolerance-count">{{ calculateToleranceCount(1, 'miss') }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>
    
    <view class="weight-info">
      <view class="total-weight">
        <text class="label">修正物量：</text>
        <text class="value">{{ calculateTotalWeight() }}</text>
      </view>
      
      <view v-if="isBreakNote" class="break-bonus-weight">
        <text class="label">BREAK奖励分权重：</text>
        <text class="value">{{ calculateBreakBonusWeight() }}</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, watch, onMounted, defineProps, computed } from 'vue';

// 定义接收的属性
const props = defineProps({
  // 接收外部传入的音符数据
  noteData: {
    type: Object,
    default: () => ({
      tap: 0,
      hold: 0,
      slide: 0,
      touch: 0,
      break: 0,
      total: 0
    })
  },
  // 是否使用外部数据
  useExternalData: {
    type: Boolean,
    default: false
  }
});

// 音符类型及其权重
const noteTypes = [
  { name: 'TAP', weight: 1, key: 'tap' },
  { name: 'HOLD', weight: 2, key: 'hold' },
  { name: 'SLIDE', weight: 3, key: 'slide' },
  { name: 'TOUCH', weight: 1, key: 'touch' },
  { name: 'BREAK', weight: 5, key: 'break' }
];

// 选中的音符类型索引
const selectedNoteTypeIndex = ref(0);

// 当前选中的音符类型
const selectedNoteType = computed(() => noteTypes[selectedNoteTypeIndex.value]);

// 是否为BREAK音符
const isBreakNote = computed(() => selectedNoteType.value.name === 'BREAK');

// 音符数量 - 修改默认值为0
const noteCount = computed(() => {
  if (props.useExternalData) {
    return props.noteData[selectedNoteType.value.key] || 0;
  }
  return 0; // 默认值改为0
});

// 谱面总物量 - 现在从外部数据获取或使用默认值
const totalNotes = computed(() => {
  if (props.useExternalData && props.noteData.total) {
    return props.noteData.total;
  }
  
  // 如果没有提供总物量，则计算所有音符的总和
  if (props.useExternalData) {
    return (
      (props.noteData.tap || 0) + 
      (props.noteData.hold || 0) + 
      (props.noteData.slide || 0) + 
      (props.noteData.touch || 0) + 
      (props.noteData.break || 0)
    );
  }
  
  return 100; // 默认值
});

// 单个音符损失
const singleNoteLoss = ref({
  perfectHigh: 0,
  perfectLow: 0,
  greatHigh: 0,
  greatMid: 0,
  greatLow: 0,
  great: 0,
  good: 0,
  miss: 0
});

// 单个音符奖励损失
const singleNoteBonusLoss = ref({
  perfectHigh: 0,
  perfectLow: 0,
  greatHigh: 0,
  greatMid: 0,
  greatLow: 0,
  good: 0,
  miss: 0
});

// 判定得分比例
const judgmentScores = {
  perfect: 1, // 100%
  great: 0.8, // 80%
  good: 0.5,  // 50%
  miss: 0     // 0%
};

// BREAK音符的特殊判定得分比例
const breakJudgmentScores = {
  perfect: 1,    // 100%
  great: [0.8, 0.6, 0.5], // 三档GREAT
  good: 0.4,     // 40%
  miss: 0        // 0%
};

// BREAK音符的额外奖励分数
const breakBonusScores = {
  criticalPerfect: 1.0,   // 暴击Perfect奖励
  perfectHigh: 0.75,      // 高分档Perfect奖励
  perfectLow: 0.5,        // 低分档Perfect奖励
  great: 0.4,             // GREAT的奖励
  good: 0.3,              // GOOD的奖励
  miss: 0                 // MISS没有奖励
};

// 是否显示结果
const showResults = ref(false);

// 初始化组件
onMounted(() => {
  // 如果使用外部数据，则初始化相关值
  if (props.useExternalData && props.noteData) {
    initializeWithExternalData();
  }
  
  // 组件加载后自动计算一次
  calculate();
});

// 使用外部数据初始化
const initializeWithExternalData = () => {
  // 根据外部数据设置默认选中的音符类型
  // 选择数量最多的音符类型
  const counts = [
    props.noteData.tap || 0,
    props.noteData.hold || 0,
    props.noteData.slide || 0,
    props.noteData.touch || 0,
    props.noteData.break || 0
  ];
  
  const maxIndex = counts.indexOf(Math.max(...counts));
  if (maxIndex >= 0) {
    selectedNoteTypeIndex.value = maxIndex;
  }
};

// 格式化百分比
const formatPercent = (value) => {
  return value.toFixed(4);
};

// 添加计算总权重的方法
const calculateTotalWeight = () => {
  // 如果使用外部数据，则根据外部数据计算总权重
  if (props.useExternalData && props.noteData) {
    return (
      (props.noteData.tap || 0) * 1 +
      (props.noteData.hold || 0) * 2 +
      (props.noteData.slide || 0) * 3 +
      (props.noteData.touch || 0) * 1 +
      (props.noteData.break || 0) * 5
    );
  }
  
  // 否则使用默认总权重
  return totalNotes.value;
};

// 计算BREAK奖励分的总权重
const calculateBreakBonusWeight = () => {
  if (props.useExternalData && props.noteData) {
    // BREAK音符数量 * 5（BREAK权重）
    return (props.noteData.break || 0) * 5;
  }
  
  // 如果是BREAK音符，则使用当前音符数量 * 5
  if (isBreakNote.value) {
    return noteCount.value * 5;
  }
  
  return 0; // 如果没有BREAK音符，则返回0
};

// 计算当前音符类型占总权重的百分比 - 添加音符数量为0的判断
const calculateWeightPercentage = () => {
  const totalWeight = calculateTotalWeight();
  if (totalWeight === 0 || noteCount.value === 0) return 0;
  
  const typeWeight = selectedNoteType.value.weight * noteCount.value;
  return (typeWeight / totalWeight) * 100;
};

// 计算容错数量
const calculateToleranceCount = (tolerancePercent, judgmentType) => {
  // 获取单个音符的损失百分比
  let lossPercent = 0;
  
  if (isBreakNote.value) {
    if (judgmentType === 'great') {
      // 对于BREAK音符，使用greatLow（最差的Great判定）
      lossPercent = singleNoteLoss.value.greatLow + singleNoteBonusLoss.value.greatLow;
    } else if (judgmentType === 'good') {
      lossPercent = singleNoteLoss.value.good + singleNoteBonusLoss.value.good;
    } else if (judgmentType === 'miss') {
      lossPercent = singleNoteLoss.value.miss + singleNoteBonusLoss.value.miss;
    }
  } else {
    if (judgmentType === 'great') {
      lossPercent = singleNoteLoss.value.great;
    } else if (judgmentType === 'good') {
      lossPercent = singleNoteLoss.value.good;
    } else if (judgmentType === 'miss') {
      lossPercent = singleNoteLoss.value.miss;
    }
  }
  
  // 如果损失百分比为0，则无法容错
  if (lossPercent <= 0) {
    return '∞';
  }
  
  // 计算可以容错的数量
  const count = Math.floor(tolerancePercent / lossPercent);
  return count;
};

// 计算损失 - 添加音符数量为0的判断
const calculate = () => {
  // 如果音符数量为0，所有损失值设为0
  if (noteCount.value === 0) {
    if (isBreakNote.value) {
      Object.keys(singleNoteLoss.value).forEach(key => {
        singleNoteLoss.value[key] = 0;
      });
      Object.keys(singleNoteBonusLoss.value).forEach(key => {
        singleNoteBonusLoss.value[key] = 0;
      });
    } else {
      singleNoteLoss.value.great = 0;
      singleNoteLoss.value.good = 0;
      singleNoteLoss.value.miss = 0;
    }
    showResults.value = true;
    return;
  }

  // 计算总权重
  const totalWeight = calculateTotalWeight();
  
  // 计算BREAK奖励分权重
  const breakBonusWeight = calculateBreakBonusWeight();
  
  const weight = selectedNoteType.value.weight;
  // 使用总权重而不是总物量
  const normalizedWeight = weight / totalWeight;
  
  if (isBreakNote.value) {
    // BREAK音符的损失计算
    
    // 基础分损失
    singleNoteLoss.value.perfectHigh = normalizedWeight * (1 - 1) * 100;
    singleNoteLoss.value.perfectLow = normalizedWeight * (1 - 1) * 100;
    singleNoteLoss.value.greatHigh = normalizedWeight * (1 - breakJudgmentScores.great[0]) * 100;
    singleNoteLoss.value.greatMid = normalizedWeight * (1 - breakJudgmentScores.great[1]) * 100;
    singleNoteLoss.value.greatLow = normalizedWeight * (1 - breakJudgmentScores.great[2]) * 100;
    singleNoteLoss.value.good = normalizedWeight * (1 - breakJudgmentScores.good) * 100;
    singleNoteLoss.value.miss = normalizedWeight * (1 - breakJudgmentScores.miss) * 100;
    
    // 奖励分损失 - 使用BREAK奖励分权重，并调整量级
    if (breakBonusWeight > 0) {
      const singleBreakWeight = 5; // 单个BREAK音符的权重
      // 将计算结果除以10000以调整量级
      singleNoteBonusLoss.value.perfectHigh = (breakBonusScores.criticalPerfect - breakBonusScores.perfectHigh) / breakBonusWeight * 100 * singleBreakWeight / 100;
      singleNoteBonusLoss.value.perfectLow = (breakBonusScores.criticalPerfect - breakBonusScores.perfectLow) / breakBonusWeight * 100 * singleBreakWeight / 100;
      singleNoteBonusLoss.value.greatHigh = (breakBonusScores.criticalPerfect - breakBonusScores.great) / breakBonusWeight * 100 * singleBreakWeight / 100;
      singleNoteBonusLoss.value.greatMid = (breakBonusScores.criticalPerfect - breakBonusScores.great) / breakBonusWeight * 100 * singleBreakWeight / 100;
      singleNoteBonusLoss.value.greatLow = (breakBonusScores.criticalPerfect - breakBonusScores.great) / breakBonusWeight * 100 * singleBreakWeight / 100;
      singleNoteBonusLoss.value.good = (breakBonusScores.criticalPerfect - breakBonusScores.good) / breakBonusWeight * 100 * singleBreakWeight / 100;
      singleNoteBonusLoss.value.miss = (breakBonusScores.criticalPerfect - breakBonusScores.miss) / breakBonusWeight * 100 * singleBreakWeight / 100;
    } else {
      // 如果没有BREAK音符，则奖励分损失为0
      Object.keys(singleNoteBonusLoss.value).forEach(key => {
        singleNoteBonusLoss.value[key] = 0;
      });
    }
  } else {
    // 普通音符的损失计算
    singleNoteLoss.value.great = normalizedWeight * (1 - judgmentScores.great) * 100;
    singleNoteLoss.value.good = normalizedWeight * (1 - judgmentScores.good) * 100;
    singleNoteLoss.value.miss = normalizedWeight * (1 - judgmentScores.miss) * 100;
  }
  
  showResults.value = true;
};

// 监听音符类型变化，自动重新计算
watch(() => selectedNoteTypeIndex.value, () => {
  calculate();
});

// 监听外部数据变化
watch(() => props.noteData, (newData) => {
  if (props.useExternalData && newData) {
    initializeWithExternalData();
    calculate();
  }
}, { deep: true });

// 监听是否使用外部数据
watch(() => props.useExternalData, (newValue) => {
  if (newValue && props.noteData) {
    initializeWithExternalData();
    calculate();
  }
});
</script>

<style lang="scss" scoped>
.loss-calculator-container {
  padding: 30rpx;
  background-color: #fff;
  border-radius: 12rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.1);
}

.title {
  font-size: 36rpx;
  font-weight: bold;
  text-align: center;
  margin-bottom: 30rpx;
  color: #333;
}

.data-source-info {
  text-align: center;
  font-size: 24rpx;
  color: #4f46e5;
  margin-bottom: 20rpx;
  padding: 10rpx;
  background-color: #f0f4ff;
  border-radius: 8rpx;
}

.note-count-info {
  display: flex;
  justify-self: center;
  align-self: center;
  text-align: center;
  align-items: center;
  justify-content: center;
  margin: 20rpx 0;
  margin-top: 0rpx;
  padding: 15rpx;
 // background-color: #f0f4ff;
  border-radius: 8rpx;
  width: 70%;
  .note-count-text {
    color: #666;
    font-size: 28rpx;
  }
  
  .note-count-value {
    color: #4f46e5;
    font-weight: bold;
    font-size: 32rpx;
    margin-left: 10rpx;
  }
}

.note-type-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
  margin-bottom: 30rpx;
}

.note-type-tab {
  flex: 1;
  min-width: 120rpx;
  padding: 15rpx 10rpx;
  text-align: center;
  font-size: 28rpx;
  background-color: #f0f4ff;
  border-radius: 8rpx;
  color: #4f46e5;
  transition: all 0.3s;
  
  &.active {
    background-color: #4f46e5;
    color: #fff;
    font-weight: bold;
    box-shadow: 0 2rpx 8rpx rgba(79, 70, 229, 0.3);
  }
  
  &:active {
    opacity: 0.8;
  }
}

.calculate-btn {
  width: 100%;
  height: 80rpx;
  background-color: #4f46e5;
  color: #fff;
  border-radius: 8rpx;
  font-size: 30rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 30rpx;
}

.results {
  margin-bottom: 30rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: bold;
  margin: 20rpx 0;
  padding-left: 20rpx;
  border-left: 8rpx solid #4f46e5;
  color: #333;
}

.result-table {
  border: 1rpx solid #ddd;
  border-radius: 8rpx;
  overflow: hidden;
  margin-bottom: 30rpx;
}

.table-header {
  display: flex;
  background-color: #f0f4ff;
  border-bottom: 1rpx solid #ddd;
}

.header-cell {
  flex: 1;
  padding: 15rpx;
  text-align: center;
  font-weight: bold;
  font-size: 28rpx;
  color: #3949ab;
}

.table-section {
  border-bottom: 1rpx solid #eee;
}

.table-section:last-child {
  border-bottom: none;
}

.table-section .section-title {
  font-size: 26rpx;
  color: #666;
  margin: 10rpx 0;
  padding: 0 15rpx;
  border-left: none;
}

.table-row {
  display: flex;
  border-bottom: 1rpx solid #eee;
}

.table-row:last-child {
  border-bottom: none;
}

.cell {
  flex: 1;
  padding: 15rpx;
  text-align: center;
  font-size: 26rpx;
  color: #333;
}

.weight-percentage {
  padding: 15rpx;
  background-color: #f0f4ff;
  border-radius: 10rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.weight-percentage .label {
  font-size: 28rpx;
  color: #333;
}

.weight-percentage .value {
  font-size: 28rpx;
  font-weight: bold;
  color: #4f46e5;
}

.tolerance-info {
  background-color: #f9f9f9;
  border-radius: 10rpx;
  padding: 20rpx;
  margin-top: 20rpx;
}

.tolerance-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 15rpx;
  text-align: center;
}

.tolerance-row {
  margin-bottom: 20rpx;
  background-color: #fff;
  border-radius: 8rpx;
  padding: 15rpx;
  box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.05);
}

.tolerance-label {
  font-size: 28rpx;
  font-weight: bold;
  color: #4f46e5;
  margin-bottom: 10rpx;
  padding-bottom: 10rpx;
  border-bottom: 1rpx solid #eee;
}

.tolerance-values {
  display: flex;
  justify-content: space-around;
}

.tolerance-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10rpx;
}

.tolerance-type {
  font-size: 24rpx;
  color: #666;
  margin-bottom: 5rpx;
}

.tolerance-count {
  font-size: 36rpx;
  font-weight: bold;
  color: #4f46e5;
}

.weight-info {
  margin-top: 10rpx;
}

.total-weight, .break-bonus-weight {
  padding: 15rpx;
  background-color: #f0f4ff;
  border-radius: 10rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10rpx;
}

.break-bonus-weight {
  background-color: #f0e6ff;
}

.total-weight .label, .break-bonus-weight .label {
  font-size: 28rpx;
  color: #333;
}

.total-weight .value, .break-bonus-weight .value {
  font-size: 28rpx;
  font-weight: bold;
  color: #4f46e5;
}

.break-bonus-weight .value {
  color: #9c27b0;
}
</style> 