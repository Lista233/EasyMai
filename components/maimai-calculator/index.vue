<template>
  <view class="calculator-container">
    <view class="title">maimai达成率计算器</view>
    
    <!-- 全局自动计算开关 -->
    <view class="global-auto-calculate">
      <text>自动计算总数</text>
      <switch :checked="globalAutoCalculate" @change="(e) => globalAutoCalculate = e.detail.value" />
    </view>
    
    <!-- 普通音符表格 - 优化样式 -->
    <view class="table-section">
      <view class="section-title">普通音符</view>
      
      <view class="note-table">
        <!-- 表头 - 判定类型 -->
        <view class="table-row header">
          <view class="table-cell first-cell"></view>
          <view class="table-cell cp-cell">
            <text class="judgement-label cp-label">CRITICAL<br>PERFECT</text>
          </view>
          <view class="table-cell p-cell">
            <text class="judgement-label p-label">PERFECT</text>
          </view>
          <view class="table-cell g-cell">
            <text class="judgement-label g-label">GREAT</text>
          </view>
          <view class="table-cell gd-cell">
            <text class="judgement-label gd-label">GOOD</text>
          </view>
          <view class="table-cell m-cell">
            <text class="judgement-label m-label">MISS</text>
          </view>
        </view>
        
        <!-- 表格内容 - 每行是一种音符类型 -->
        <view class="table-row" v-for="(type, tIndex) in noteTypes" :key="tIndex">
          <view class="table-cell first-cell note-type-cell">
            <text :class="'note-type-label type-' + type.name.toLowerCase()">{{ type.name }}</text>
          </view>
          
          <view class="table-cell cp-cell">
            <input 
              type="number" 
              v-model.number="type.criticalPerfect" 
              class="table-input cp-input"
              @focus="handleFocus(type, 'criticalPerfect')"
              @blur="handleBlur(type, 'criticalPerfect')"
            />
          </view>
          
          <view class="table-cell p-cell">
            <input 
              type="number" 
              v-model.number="type.perfect" 
              class="table-input p-input"
              @focus="handleFocus(type, 'perfect')"
              @blur="handleBlur(type, 'perfect')"
            />
          </view>
          
          <view class="table-cell g-cell">
            <input 
              type="number" 
              v-model.number="type.great" 
              class="table-input g-input"
              @focus="handleFocus(type, 'great')"
              @blur="handleBlur(type, 'great')"
            />
          </view>
          
          <view class="table-cell gd-cell">
            <input 
              type="number" 
              v-model.number="type.good" 
              class="table-input gd-input"
              @focus="handleFocus(type, 'good')"
              @blur="handleBlur(type, 'good')"
            />
          </view>
          
          <view class="table-cell m-cell">
            <input 
              type="number" 
              v-model.number="type.miss" 
              class="table-input m-input"
              @focus="handleFocus(type, 'miss')"
              @blur="handleBlur(type, 'miss')"
            />
          </view>
        </view>
        
        <!-- 判定类型总数统计行 -->
        <view class="table-row totals-row">
          <view class="table-cell first-cell">总计</view>
          
          <view class="table-cell cp-cell">
            <text class="total-value cp-total">{{ judgementTotals.criticalPerfect }}</text>
          </view>
          
          <view class="table-cell p-cell">
            <text class="total-value p-total">{{ judgementTotals.perfect }}</text>
          </view>
          
          <view class="table-cell g-cell">
            <text class="total-value g-total">{{ judgementTotals.great }}</text>
          </view>
          
          <view class="table-cell gd-cell">
            <text class="total-value gd-total">{{ judgementTotals.good }}</text>
          </view>
          
          <view class="table-cell m-cell">
            <text class="total-value m-total">{{ judgementTotals.miss }}</text>
          </view>
        </view>
      </view>
    </view>
    
    <!-- BREAK音符输入部分 - 重新设计为表格布局 -->
    <view class="input-section break-section">
      <view class="section-title">BREAK音符</view>
      
      <!-- Perfect表格 - 每个元素独占一行 -->
      <view class="break-table-section">
        <view class="break-table-title">Perfect</view>
        <view class="break-table">
          <view class="break-table-row">
            <view class="break-item-container">
              <view class="break-label-cell">大P</view>
              <view class="break-input-container">
                <input 
                  type="number" 
                  v-model.number="breakNote.criticalPerfect" 
                  class="break-input critical-perfect-input"
                  @focus="handleBreakFocus('criticalPerfect')"
                  @blur="handleBreakBlur('criticalPerfect')"
                />
              </view>
            </view>
          </view>
          
          <view class="break-table-row">
            <view class="break-item-container">
              <view class="break-label-cell">50落</view>
              <view class="break-input-container">
                <input 
                  type="number" 
                  v-model.number="breakNote.perfectHigh" 
                  class="break-input perfect-high-input"
                  @focus="handleBreakFocus('perfectHigh')"
                  @blur="handleBreakBlur('perfectHigh')"
                />
              </view>
            </view>
          </view>
          
          <view class="break-table-row">
            <view class="break-item-container">
              <view class="break-label-cell">100落</view>
              <view class="break-input-container">
                <input 
                  type="number" 
                  v-model.number="breakNote.perfectLow" 
                  class="break-input perfect-low-input"
                  @focus="handleBreakFocus('perfectLow')"
                  @blur="handleBreakBlur('perfectLow')"
                />
              </view>
            </view>
          </view>
        </view>
      </view>
      
      <!-- Great表格 - 每个元素独占一行 -->
      <view class="break-table-section">
        <view class="break-table-title">Great</view>
        <view class="break-table">
          <view class="break-table-row">
            <view class="break-item-container">
              <view class="break-label-cell">80%</view>
              <view class="break-input-container">
                <input 
                  type="number" 
                  v-model.number="breakNote.greatHigh" 
                  class="break-input great-high-input"
                  @focus="handleBreakFocus('greatHigh')"
                  @blur="handleBreakBlur('greatHigh')"
                />
              </view>
            </view>
          </view>
          
          <view class="break-table-row">
            <view class="break-item-container">
              <view class="break-label-cell">60%</view>
              <view class="break-input-container">
                <input 
                  type="number" 
                  v-model.number="breakNote.greatMid" 
                  class="break-input great-mid-input"
                  @focus="handleBreakFocus('greatMid')"
                  @blur="handleBreakBlur('greatMid')"
                />
              </view>
            </view>
          </view>
          
          <view class="break-table-row">
            <view class="break-item-container">
              <view class="break-label-cell">50%</view>
              <view class="break-input-container">
                <input 
                  type="number" 
                  v-model.number="breakNote.greatLow" 
                  class="break-input great-low-input"
                  @focus="handleBreakFocus('greatLow')"
                  @blur="handleBreakBlur('greatLow')"
                />
              </view>
            </view>
          </view>
        </view>
      </view>
      
      <!-- GOOD和MISS也分别独占一行 -->
      <view class="break-table-section">
        <view class="break-table">
          <view class="break-table-row">
            <view class="break-item-container">
              <view class="break-label-cell good-label">GOOD</view>
              <view class="break-input-container">
                <input 
                  type="number" 
                  v-model.number="breakNote.good" 
                  class="break-input good-input"
                  @focus="handleBreakFocus('good')"
                  @blur="handleBreakBlur('good')"
                />
              </view>
            </view>
          </view>
          
          <view class="break-table-row">
            <view class="break-item-container">
              <view class="break-label-cell miss-label">MISS</view>
              <view class="break-input-container">
                <input 
                  type="number" 
                  v-model.number="breakNote.miss" 
                  class="break-input miss-input"
                  @focus="handleBreakFocus('miss')"
                  @blur="handleBreakBlur('miss')"
                />
              </view>
            </view>
          </view>
        </view>
      </view>
      
      <!-- 总数移到最下方 -->
      <view class="input-group total-group">
        <text class="label">Break总数：</text>
        <input 
          type="number" 
          v-model.number="breakNote.total" 
          class="input"
          :disabled="breakNote.autoCalculate"
          @focus="handleBreakFocus('total')"
          @blur="handleBreakBlur('total')"
        />
      </view>
    </view>
    
    <button @click="calculate" class="calculate-btn">计算达成率</button>
    
    <view v-if="showResults" class="results">
      <view class="result-item">
        <text class="result-label">补正总物量：</text>
        <text class="result-value">{{ totalNormalizedNotes }}</text>
      </view>
      <view class="result-item">
        <text class="result-label">基础分数：</text>
        <text class="result-value">{{ baseAchievementRate.toFixed(4) }}%</text>
      </view>
      <view class="result-item">
        <text class="result-label">绝赞分数：</text>
        <text class="result-value">+{{ breakBonus.toFixed(4) }}%</text>
      </view>
      <view class="result-item">
        <text class="result-label">总达成率：</text>
        <text class="result-value">{{ totalAchievementRate.toFixed(4) }}%</text>
      </view>
      
      <view class="section-title">各音符类型损失的达成率：</view>

      
      <view class="result-item" v-for="(item, index) in lossDetails" :key="index">
        <text class="result-label">{{ item.name }}：</text>
        <text class="result-value">-{{ item.totalLoss.toFixed(4) }}%</text>
        <view class="loss-details">
          <text>-{{ item.greatLoss.toFixed(4) }}%</text>
          <text>-{{ item.goodLoss.toFixed(4) }}%</text>
          <text>-{{ item.missLoss.toFixed(4) }}%</text>
        </view>
      </view>
      
   
      
      <view class="note-details" v-for="(item, index) in noteDetails" :key="'detail-'+index">
        <view class="note-detail-header">
          <text class="note-name">{{ item.name }}</text>
          <text class="note-achievement">达成率: {{ item.achievementRate }}%</text>
        </view>
        
        <view class="note-detail-content">
          <view class="note-detail-row">
            <text>总数: {{ item.total }}</text>
            <text>权重: {{ item.weight }}</text>
          </view>
          
          <view v-if="item.name !== 'BREAK'" class="note-detail-row">
            <text>Cri-PERFECT: {{ item.criticalPerfect }}</text>
            <text>PERFECT: {{ item.perfect }}</text>
           
          </view>
          <view v-if="item.name !== 'BREAK'" class="note-detail-row">
            <text>GREAT: {{ item.great }}</text>
            <text>GOOD: {{ item.good }}</text>
            <text>MISS: {{ item.miss }}</text>
          </view>
          
          <view class="note-detail-row">
            <text>理论分数: {{ item.maxScore }}</text>
            <text>实际分数: {{ item.actualScore }}</text>
          </view>
        </view>

        <view v-if="item.name === 'BREAK'" class="note-detail-row">
          <text>基础达成率: {{ item.baseRate }}%</text>
          <text>奖励达成率: +{{ item.bonusRate }}%</text>
        </view>

        <view v-if="item.name === 'BREAK'" class="note-detail-row break-details">
          <view class="break-detail-group">
            <text class="break-label">Perfect</text>
            <text>大P: {{ item.criticalPerfect }}</text>
            <text>50落: {{ item.perfectHigh }}</text>
            <text>100落: {{ item.perfectLow }}</text>
          </view>
          <view class="break-detail-group">
            <text class="break-label">Great</text>
            <text>80%: {{ item.greatHigh }}</text>
            <text>60%: {{ item.greatMid }}</text>
            <text>50%: {{ item.greatLow }}</text>
          </view>
          <view class="break-detail-group">
            <text class="break-label">其他</text>
            <text>GOOD: {{ item.good }}</text>
            <text>MISS: {{ item.miss }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, watch } from 'vue';

// 音符类型及其权重
const noteTypes = ref([
{ name: 'TAP', weight: 1, total: 0, criticalPerfect: 0, perfect: 0, great: 0, good: 0, miss: 0, autoCalculate: true },
 
  
  { name: 'HOLD', weight: 2, total: 0, criticalPerfect: 0, perfect: 0, great: 0, good: 0, miss: 0, autoCalculate: true },
  { name: 'SLIDE', weight: 3, total: 0, criticalPerfect: 0, perfect: 0, great: 0, good: 0, miss: 0, autoCalculate: true },
  { name: 'TOUCH', weight: 1, total: 0, criticalPerfect: 0, perfect: 0, great: 0, good: 0, miss: 0, autoCalculate: true }
]);

// 判定类型列表
const judgementTypes = [
  { key: 'criticalPerfect', label: 'Critical\nPERFECT', shortLabel: 'C-PERF' },
  { key: 'perfect', label: 'PERFECT', shortLabel: 'PERF' },
  { key: 'great', label: 'GREAT', shortLabel: 'GREAT' },
  { key: 'good', label: 'GOOD', shortLabel: 'GOOD' },
  { key: 'miss', label: 'MISS', shortLabel: 'MISS' }
];

// BREAK音符单独处理
const breakNote = ref({
  name: 'BREAK', 
  weight: 5, 
  total: 0,
  criticalPerfect: 0,  // 暴击Perfect
  perfectHigh: 0,      // 高分档Perfect (奖励0.75)
  perfectLow: 0,       // 低分档Perfect (奖励0.5)
  greatHigh: 0,        // 高分档Great (基础分0.8)
  greatMid: 0,         // 中分档Great (基础分0.6)
  greatLow: 0,         // 低分档Great (基础分0.5)
  good: 0, 
  miss: 0,
  autoCalculate: true  // 添加自动计算属性，默认为true
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
  good: 0.4,     // 50%
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

const showResults = ref(false);
const totalNormalizedNotes = ref(0);
const totalAchievementRate = ref(0);
const lossDetails = ref([]);
const breakBonus = ref(0);
const noteDetails = ref([]);

// 添加全局自动计算开关
const globalAutoCalculate = ref(true);

// 添加 baseAchievementRate 的初始化
const baseAchievementRate = ref(0);

// 更新音符总数的函数
function updateNoteTotal(type) {
  // 确保所有值都被转换为数字
  const criticalPerfect = Number(type.criticalPerfect) || 0;
  const perfect = Number(type.perfect) || 0;
  const great = Number(type.great) || 0;
  const good = Number(type.good) || 0;
  const miss = Number(type.miss) || 0;
  
  // 计算总和
  type.total = criticalPerfect + perfect + great + good + miss;
  logNoteTypeDetails(type);
}

// 更新BREAK音符总数的函数
function updateBreakTotal() {
  // 确保所有值都被转换为数字
  const criticalPerfect = Number(breakNote.value.criticalPerfect) || 0;
  const perfectHigh = Number(breakNote.value.perfectHigh) || 0;
  const perfectLow = Number(breakNote.value.perfectLow) || 0;
  const greatHigh = Number(breakNote.value.greatHigh) || 0;
  const greatMid = Number(breakNote.value.greatMid) || 0;
  const greatLow = Number(breakNote.value.greatLow) || 0;
  const good = Number(breakNote.value.good) || 0;
  const miss = Number(breakNote.value.miss) || 0;
  
  // 计算总和
  breakNote.value.total = criticalPerfect + perfectHigh + perfectLow + 
                          greatHigh + greatMid + greatLow + good + miss;
}

// 监听全局自动计算开关变化
watch(globalAutoCalculate, (newValue) => {
  // 更新所有音符类型的自动计算状态
  noteTypes.value.forEach(type => {
    type.autoCalculate = newValue;
    if (newValue) {
      updateNoteTotal(type);
    }
  });
  
  // 更新BREAK音符的自动计算状态
  breakNote.value.autoCalculate = newValue;
  if (newValue) {
    updateBreakTotal();
  }
  
  console.log("全局自动计算状态更改为:", newValue);
});

// 添加对各判定数量的监听，自动计算总数
noteTypes.value.forEach(type => {
  ['criticalPerfect', 'perfect', 'great', 'good', 'miss'].forEach(judgement => {
    watch(() => type[judgement], () => {
      if (type.autoCalculate) {
        updateNoteTotal(type);
      }
    });
  });
  
  // 监听total的变化
  watch(() => type.total, (newValue) => {
    if (!type.autoCalculate) {
      // 当手动修改total时，自动调整perfect数量
      const sum = type.criticalPerfect + type.perfect + type.great + type.good + type.miss;
      if (sum > newValue) {
        // 如果总和超过了total，优先减少perfect
        type.perfect = Math.max(0, type.perfect - (sum - newValue));
      } else if (sum < newValue) {
        // 如果总和小于total，增加perfect
        type.perfect += (newValue - sum);
      }
    }
    logNoteTypeDetails(type);
  });
});

// 添加对BREAK音符各判定数量的监听，自动计算总数
['criticalPerfect', 'perfectHigh', 'perfectLow', 'greatHigh', 'greatMid', 'greatLow', 'good', 'miss'].forEach(judgement => {
  watch(() => breakNote.value[judgement], () => {
    if (breakNote.value.autoCalculate) {
      updateBreakTotal();
    }
  });
});

// 监听BREAK total的变化
watch(() => breakNote.value.total, (newValue) => {
  if (!breakNote.value.autoCalculate) {
    // 当手动修改total时，自动调整perfectHigh数量
    const sum = Number(breakNote.value.criticalPerfect) + 
                Number(breakNote.value.perfectHigh) + 
                Number(breakNote.value.perfectLow) + 
                Number(breakNote.value.greatHigh) + 
                Number(breakNote.value.greatMid) + 
                Number(breakNote.value.greatLow) + 
                Number(breakNote.value.good) + 
                Number(breakNote.value.miss);
    
    if (sum > newValue) {
      // 如果总和超过了total，优先减少perfectHigh
      breakNote.value.perfectHigh = Math.max(0, Number(breakNote.value.perfectHigh) - (sum - newValue));
    } else if (sum < newValue) {
      // 如果总和小于total，增加perfectHigh
      breakNote.value.perfectHigh = Number(breakNote.value.perfectHigh) + (newValue - sum);
    }
  }
});

// 为BREAK音符添加监听器
const breakProperties = [
  'total', 'criticalPerfect', 'perfectHigh', 'perfectLow', 
  'greatHigh', 'greatMid', 'greatLow', 'good', 'miss'
];

breakProperties.forEach(prop => {
  watch(() => breakNote.value[prop], (newValue) => {
    console.log(`BREAK ${prop}更新为: ${newValue}`);
    logBreakDetails();
  });
});

// 输出普通音符详细信息的函数
function logNoteTypeDetails(type) {
  const perfectCount = type.total - type.criticalPerfect - type.great - type.good - type.miss;
  console.log({
    name: type.name,
    total: type.total,
    criticalPerfect: type.criticalPerfect,
    perfect: perfectCount,
    great: type.great,
    good: type.good,
    miss: type.miss,
    weight: type.weight,
    normalizedTotal: type.total * type.weight
  });
}

// 输出BREAK音符详细信息的函数
function logBreakDetails() {
  const breakData = {
    name: 'BREAK',
    total: breakNote.value.total,
    criticalPerfect: breakNote.value.criticalPerfect,
    perfectHigh: breakNote.value.perfectHigh,
    perfectLow: breakNote.value.perfectLow,
    greatHigh: breakNote.value.greatHigh,
    greatMid: breakNote.value.greatMid,
    greatLow: breakNote.value.greatLow,
    good: breakNote.value.good,
    miss: breakNote.value.miss,
    weight: breakNote.value.weight,
    normalizedTotal: breakNote.value.total * breakNote.value.weight
  };
  
  // 计算BREAK奖励
  if (breakNote.value.total > 0) {
    const rawBreakBonus = (
      breakNote.value.criticalPerfect * breakBonusScores.criticalPerfect +
      breakNote.value.perfectHigh * breakBonusScores.perfectHigh + 
      breakNote.value.perfectLow * breakBonusScores.perfectLow + 
      (breakNote.value.greatHigh + breakNote.value.greatMid + breakNote.value.greatLow) * breakBonusScores.great + 
      breakNote.value.good * breakBonusScores.good
    ) / (breakNote.value.total * 1.0) * 100;
    
    breakData.estimatedBonus = Math.min(rawBreakBonus, 1.0).toFixed(4) + '%';
  }
  
  console.log(breakData);
}

// 计算补正总物量 (不包括BREAK，BREAK单独计算)
const calculateTotalNormalizedNotes = () => {
  return noteTypes.value.reduce((sum, type) => {
    return sum + Number(type.total) * type.weight;
  }, 0);
};

// 计算达成率
const calculate = () => {
  // 确保breakNote已定义
  if (!breakNote.value) {
    uni.showToast({
      title: '初始化错误',
      icon: 'none'
    });
    return;
  }
  
  // 重置结果
  lossDetails.value = [];
  noteDetails.value = [];
  
  // 计算补正总物量 (包括BREAK)
  const breakNoteWeight = Number(breakNote.value.total) * breakNote.value.weight;
  totalNormalizedNotes.value = calculateTotalNormalizedNotes() + breakNoteWeight;
  
  if (totalNormalizedNotes.value === 0) {
    uni.showToast({
      title: '请输入音符数量',
      icon: 'none'
    });
    return;
  }
  
  // 验证输入数据
//   for (const type of noteTypes.value) {
//     const judgedNotes = type.great + type.good + type.miss;
//     const perfectNotes = type.total - judgedNotes;
    
//     if (perfectNotes < 0) {
//       uni.showToast({
//         title: `${type.name}的GREAT/GOOD/MISS总和不能超过总数`,
//         icon: 'none'
//       });
//       return;
//     }
//   }
  
  // 计算基础分数（不包括BREAK奖励）
  let baseScore = 0;
  let maxBaseScore = totalNormalizedNotes.value; // 理论分数就是补正总物量
  
  // 计算各类音符的损失详情
  lossDetails.value = [];
  
  // 计算普通音符
  noteTypes.value.forEach(type => {
    // 计算普通Perfect数量
    const perfectCount = type.total - type.criticalPerfect - type.great - type.good - type.miss;
    
    let typeActualScore = 
      (type.criticalPerfect + perfectCount) * type.weight * judgmentScores.perfect + // Critical Perfect和普通Perfect基础分相同
      type.great * type.weight * judgmentScores.great +
      type.good * type.weight * judgmentScores.good;
    
    baseScore += typeActualScore;
    
    // 计算损失
    const greatLoss = (type.great * type.weight * (1 - judgmentScores.great));
    const goodLoss = (type.good * type.weight * (1 - judgmentScores.good));
    const missLoss = (type.miss * type.weight);
    const totalLoss = greatLoss + goodLoss + missLoss;
    
    lossDetails.value.push({
      name: type.name,
      greatLoss: (greatLoss / totalNormalizedNotes.value * 100),
      goodLoss: (goodLoss / totalNormalizedNotes.value * 100),
      missLoss: (missLoss / totalNormalizedNotes.value * 100),
      totalLoss: (totalLoss / totalNormalizedNotes.value * 100)
    });
    
    // 更新noteDetails
    noteDetails.value.push({
      name: type.name,
      total: type.total,
      criticalPerfect: type.criticalPerfect,
      perfect: perfectCount,
      great: type.great,
      good: type.good,
      miss: type.miss,
      weight: type.weight,
      maxScore: type.total * type.weight,
      actualScore: typeActualScore,
      achievementRate: type.total > 0 ? (typeActualScore / (type.total * type.weight) * 100).toFixed(4) : '0.0000',
      baseRate: 0,
      bonusRate: 0
    });
  });
  
  // 计算BREAK音符的基础分
  const breakBaseScore = 
    breakNote.value.criticalPerfect * breakNote.value.weight * breakJudgmentScores.perfect +
    breakNote.value.perfectHigh * breakNote.value.weight * breakJudgmentScores.perfect +
    breakNote.value.perfectLow * breakNote.value.weight * breakJudgmentScores.perfect +
    breakNote.value.greatHigh * breakNote.value.weight * breakJudgmentScores.great[0] +
    breakNote.value.greatMid * breakNote.value.weight * breakJudgmentScores.great[1] +
    breakNote.value.greatLow * breakNote.value.weight * breakJudgmentScores.great[2] +
    breakNote.value.good * breakNote.value.weight * breakJudgmentScores.good;
  
  baseScore += breakBaseScore;
  
  // 计算BREAK损失
  const breakGreatHighLoss = (breakNote.value.greatHigh * breakNote.value.weight * (1 - breakJudgmentScores.great[0]));
  const breakGreatMidLoss = (breakNote.value.greatMid * breakNote.value.weight * (1 - breakJudgmentScores.great[1]));
  const breakGreatLowLoss = (breakNote.value.greatLow * breakNote.value.weight * (1 - breakJudgmentScores.great[2]));
  const breakGoodLoss = (breakNote.value.good * breakNote.value.weight * (1 - breakJudgmentScores.good));
  const breakMissLoss = (breakNote.value.miss * breakNote.value.weight);
  const breakTotalLoss = breakGreatHighLoss + breakGreatMidLoss + breakGreatLowLoss + breakGoodLoss + breakMissLoss;
  
  lossDetails.value.push({
    name: breakNote.value.name,
    greatLoss: ((breakGreatHighLoss + breakGreatMidLoss + breakGreatLowLoss) / totalNormalizedNotes.value * 100),
    goodLoss: (breakGoodLoss / totalNormalizedNotes.value * 100),
    missLoss: (breakMissLoss / totalNormalizedNotes.value * 100),
    totalLoss: (breakTotalLoss / totalNormalizedNotes.value * 100)
  });
  
  // 计算基础达成率
  baseAchievementRate.value = (baseScore / maxBaseScore) * 100;
  
  // 计算BREAK奖励（最高为1%）
  let rawBreakBonus = 0;
  if (breakNote.value.total > 0) {
    rawBreakBonus = (
      breakNote.value.criticalPerfect * breakBonusScores.criticalPerfect +
      breakNote.value.perfectHigh * breakBonusScores.perfectHigh + 
      breakNote.value.perfectLow * breakBonusScores.perfectLow + 
      (breakNote.value.greatHigh + breakNote.value.greatMid + breakNote.value.greatLow) * breakBonusScores.great + 
      breakNote.value.good * breakBonusScores.good
    ) / (breakNote.value.total * 1.0) ;
  }
  console.log(rawBreakBonus);
  // 限制BREAK奖励上限为1%
  breakBonus.value = Math.min(rawBreakBonus, 1.0);
  
  // 计算总达成率
  totalAchievementRate.value = baseAchievementRate.value + breakBonus.value;
  
  showResults.value = true;
};

// 处理输入框获得焦点
const handleFocus = (type, key) => {
  // 如果值为0，则清空输入框
  if (type[key] === 0) {
    type[key] = '';
  }
};

// 处理输入框失去焦点
const handleBlur = (type, key) => {
  // 如果值为空或NaN，则设置为0
  if (type[key] === '' || isNaN(type[key])) {
    type[key] = 0;
  } else {
    // 确保值为数字
    type[key] = Number(type[key]);
  }
  
  // 如果是自动计算模式，更新总数
  if (type.autoCalculate && key !== 'total') {
    updateNoteTotal(type);
  }
};

// 处理BREAK音符输入框获得焦点
const handleBreakFocus = (key) => {
  // 如果值为0，则清空输入框
  if (breakNote.value[key] === 0) {
    breakNote.value[key] = '';
  }
};

// 处理BREAK音符输入框失去焦点
const handleBreakBlur = (key) => {
  // 如果值为空或NaN，则设置为0
  if (breakNote.value[key] === '' || isNaN(breakNote.value[key])) {
    breakNote.value[key] = 0;
  } else {
    // 确保值为数字
    breakNote.value[key] = Number(breakNote.value[key]);
  }
};

// 计算各判定类型的总数
const calculateJudgementTotals = () => {
  const totals = {
    criticalPerfect: 0,
    perfect: 0,
    great: 0,
    good: 0,
    miss: 0
  };
  
  noteTypes.value.forEach(type => {
    judgementTypes.forEach(judgement => {
      const key = judgement.key;
      totals[key] += Number(type[key]) || 0;
    });
  });
  
  return totals;
};

// 判定总数
const judgementTotals = ref({
  criticalPerfect: 0,
  perfect: 0,
  great: 0,
  good: 0,
  miss: 0
});

// 更新判定总数
const updateJudgementTotals = () => {
  judgementTotals.value = calculateJudgementTotals();
};

// 监听所有音符类型的变化，更新判定总数
noteTypes.value.forEach(type => {
  judgementTypes.forEach(judgement => {
    const key = judgement.key;
    watch(() => type[key], () => {
      updateJudgementTotals();
    });
  });
});
</script>

<style>
.calculator-container {
  padding: 10px;
  padding-top: 30px;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.title {

  font-size: 20px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 20px;
  color: #333;
}

.global-auto-calculate {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin: 0 10px 20px 10px;
  padding: 8px 15px;
  background-color: #f8f9fa;
  border-radius: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  border: 1px solid #e0e0e0;
}

.global-auto-calculate text {
  margin-right: 12px;
  font-size: 14px;
  color: #3949ab;
  font-weight: 500;
}

.global-auto-calculate switch {
  transform: scale(0.8);
}

.global-auto-calculate switch .uni-switch-input.uni-switch-input-checked {
  background-color: #6366f1 !important;
  border-color: #4f46e5 !important;
}

/* 表格样式 - 优化 */
.table-section {
  margin-bottom: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 10px;
  padding-top: 20px;
  padding-bottom: 20px;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.note-table {
  width: 100%;
  border-collapse: collapse;
  border: 1px solid #ccc;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.table-row {
  display: flex;
  border-bottom: 1px solid #ccc;
}

.table-row:last-child {
  border-bottom: none;
}

.table-row.header {
  font-weight: bold;
  background: linear-gradient(135deg, #f0f8ff, #e6f0ff);
}

.table-row.totals-row {
  background-color: #f0f0f0;
  border-top: 0px solid #ccc;
  font-weight: bold;
}

.table-cell {
  width: 60px;
  height: 45px;
  padding: 6px;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  border-right: 1px solid #ccc;
  overflow: hidden;
}

.table-cell:last-child {
  border-right: none;
}

.first-cell {
  width: 70px; /* 第一列稍宽一些 */
  text-align: center;
  justify-content: center;
  font-weight: bold;
  background-color: #e6f0ff;
  color: #3366cc;
}

.note-type-cell {
  background-color: #e6f0ff;
}

.note-type-label {
  font-weight: bold;
  font-size: 14px;
  color: #3366cc;
}

.type-tap { color: #3366cc; }
.type-hold { color: #3366cc; }
.type-slide { color: #3366cc; }
.type-touch { color: #3366cc; }
.type-break { color: #3366cc; }

.judgement-label {
  font-size: 12px; /* 更小的字体 */
  text-align: center;
  line-height: 1.2;
  font-weight: bold;
}

.cp-label { 
  background: linear-gradient(135deg, #ffcc00, #ffa500);
  -webkit-background-clip: text;
  color: transparent;
  font-size: 10px;
}

.p-label { 
  background: linear-gradient(135deg, #ff9900, #ff6600);
  -webkit-background-clip: text;
  color: transparent;
  font-size: 10px;
}

.g-label { 
  background: linear-gradient(135deg, #ff66cc, #ff3399);
  -webkit-background-clip: text;
  color: transparent;
}

.gd-label { 
  background: linear-gradient(135deg, #33cc33, #009900);
  -webkit-background-clip: text;
  color: transparent;
}

.m-label { 
  background: linear-gradient(135deg, #999999, #666666);
  -webkit-background-clip: text;
  color: transparent;
}

.cp-cell { background: linear-gradient(135deg, #fffde7, #fff8e1); }
.p-cell { background: linear-gradient(135deg, #fff8e1, #fff3cd); }
.g-cell { background: linear-gradient(135deg, #fce4ec, #f8bbd0); }
.gd-cell { background: linear-gradient(135deg, #e8f5e9, #c8e6c9); }
.m-cell { background: linear-gradient(135deg, #f5f5f5, #eeeeee); }

.table-input {
  width: 100%;
  height: 35px;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 0 4px;
  text-align: center;
  box-sizing: border-box;
  font-size: 14px;
  background-color: #fff;
  transition: all 0.3s ease;
}

.table-input:focus {
  box-shadow: 0 0 0 2px rgba(51, 102, 204, 0.2);
  transform: translateY(-1px);
}

.cp-input { color: #e6b800; font-weight: bold; }
.p-input { color: #e67300; font-weight: bold; }
.g-input { color: #e6399b; font-weight: bold; }
.gd-input { color: #00b300; font-weight: bold; }
.m-input { color: #666666; font-weight: bold; }

.total-value {
  font-weight: bold;
  font-size: 14px;
}

.cp-total { 
  background: linear-gradient(135deg, #ffcc00, #ffa500);
  -webkit-background-clip: text;
  color: transparent;
  font-weight: bold;
}

.p-total { 
  background: linear-gradient(135deg, #ff9900, #ff6600);
  -webkit-background-clip: text;
  color: transparent;
  font-weight: bold;
}

.g-total { 
  background: linear-gradient(135deg, #ff66cc, #ff3399);
  -webkit-background-clip: text;
  color: transparent;
  font-weight: bold;
}

.gd-total { 
  background: linear-gradient(135deg, #33cc33, #009900);
  -webkit-background-clip: text;
  color: transparent;
  font-weight: bold;
}

.m-total { 
  background: linear-gradient(135deg, #999999, #666666);
  -webkit-background-clip: text;
  color: transparent;
  font-weight: bold;
}

/* 禁用状态的输入框样式 */
.table-input:disabled {
  background-color: #f0f0f0;
  color: #888;
}

/* BREAK音符部分样式 - 重新设计为表格布局 */
.input-section {
  margin-bottom: 20px;
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 10px;
  background-color: #f9f9f9;
}

.break-section {
  border: 1px solid #ffcccc;
  background-color: #fff9f9;
}

.input-group {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.label {
  width: 150px;
  font-size: 14px;
  color: #333;
}

.input {
  flex: 1;
  height: 35px;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 0 10px;
  background-color: #fff;
}

.section-title {
    font-size: 18px;
  font-weight: bold;
  color: #3949ab;
  margin-bottom: 15px;
  text-align: center;
  padding-bottom: 10px;
  border-bottom: 2px solid #c5cae9;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 计算按钮样式 */
.calculate-btn {
  width: 100%;
  height: 40px;
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
  color: white;
  padding: 100rpx,20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  margin: 20px 0;
  font-weight: bold;
}

/* 结果显示部分样式 */
.results {
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 15px;
  background-color: #f9f9f9;
}

.result-item {
  margin-bottom: 15px;
  padding: 12px;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
}

.result-item:hover {
  background-color: #f0f0f0;
  transform: translateX(2px);
}

.result-item .result-label {
  display: block;
  font-weight: bold;
  margin-bottom: 8px;
  color: #3949ab;
  font-size: 15px;
}

.result-item .result-value {
  display: inline-block;
  color: #303f9f;
  font-weight: bold;
  font-size: 16px;
  background-color: #f5f7ff;
  padding: 5px 10px;
  border-radius: 4px;
  margin-bottom: 10px;
}

/* 损失详情样式 */
.loss-details {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px dashed #e0e0e0;
}

.loss-details text {
  background-color: #fff;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 13px;
  color: #555;
  border: 1px solid #eee;
}

/* 特定损失类型样式 */
.loss-details text:nth-child(1) {
  color: #ff3399; /* GREAT损失颜色 */
  border-color: rgba(255, 51, 153, 0.2);
}

.loss-details text:nth-child(2) {
  color: #33cc33; /* GOOD损失颜色 */
  border-color: rgba(51, 204, 51, 0.2);
}

.loss-details text:nth-child(3) {
  color: #666666; /* MISS损失颜色 */
  border-color: rgba(102, 102, 102, 0.2);
}

/* BREAK奖励特殊样式 */
.result-item:last-child .result-value {
  color: #4caf50; /* 绿色表示奖励 */
  background-color: rgba(76, 175, 80, 0.1);
}

/* 结果部分标题 */
.results .section-title {
  font-size: 16px;
  font-weight: bold;
  margin: 20px 0 15px;
  padding-bottom: 8px;
  border-bottom: 2px solid #3949ab;
  color: #3949ab;
}

.note-details {
  margin-bottom: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 15px;
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.note-detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.note-name {
  font-weight: bold;
  color: #3949ab;
  font-size: 16px;
}

.note-achievement {
  color: #303f9f;
  font-weight: bold;
  font-size: 16px;
  background-color: #f5f7ff;
  padding: 5px 10px;
  border-radius: 4px;
}

.note-detail-content {
  margin-left: 10px;
}

.note-detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  padding: 6px 10px;
  font-size: 13px;
  color: #555;
  background-color: #f9f9f9;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.note-detail-row:hover {
  background-color: #f0f0f0;
  transform: translateX(2px);
}

.note-detail-row .label {
  font-weight: bold;
  color: #3949ab;
}

.note-detail-row .value {
  font-weight: 500;
  color: #303f9f;
}

.auto-calculate-switch {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-bottom: 15px;
}

.auto-calculate-switch text {
  margin-right: 10px;
  font-size: 14px;
}

/* BREAK音符表格样式 */
.break-table-section {
  justify-content: center;
  align-items: center;
  margin-bottom: 15px;

  width: 100%;
}

.break-table-title {
  font-weight: bold;
  margin-bottom: 8px;
  color: #3949ab;
  font-size: 16px;
  text-align: center;
  padding: 5px 10px;
  background: linear-gradient(135deg, #e8eaf6, #c5cae9);
  border-radius: 6px;
}

.break-table {
  border: 1px solid #c5cae9;
  border-radius: 12px;
  overflow: hidden;
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  margin-bottom: 15px;
  width: 100%;
}

/* 容器样式 */
.break-item-container {
  display: flex;
  width: 100%;
  margin: 0;
  border-radius: 8px;
  overflow: hidden;
  background-color: #fafafa;
  transition: all 0.2s ease;
}

/* 输入框容器样式 */
.break-input-container {
  flex: 1;
  padding: 8px 15px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  background-color: white;
  border-top-right-radius: 8px;
  border-bottom-right-radius: 8px;
}

/* 标签单元格样式 */
.break-label-cell {
  width: 70px;
  min-width: 100px;
  font-weight: bold;
  font-size: 14px;
  padding: 12px 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  border-top-left-radius: 0px;
  border-bottom-left-radius: 8px;
  border-right: 1px solid #e0e0e0;
  box-sizing: border-box;
  transition: all 0.2s ease;
}

/* Perfect部分标签样式 */
.break-table-section:nth-child(2) .break-label-cell {
  background-color: #fff8e1;
  color: #ff9800;
}

/* Great部分标签样式 */
.break-table-section:nth-child(3) .break-label-cell {
  background-color: #f3e5f5;
  color: #9c27b0;
}

/* GOOD标签样式 */
.good-label {
  background-color: #e8f5e9 !important;
  color: #4caf50 !important;
}

/* MISS标签样式 */
.miss-label {
  background-color: #fafafa !important;
  color: #757575 !important;
}

/* 输入框样式 */
.break-input {
  width: 100%;
  height: 38px;
  border: 1px solid #ddd;
  border-radius: 6px;
  padding: 0 15px;
  text-align: center;
  font-weight: bold;
  font-size: 15px;
  transition: all 0.3s ease;
}

.break-input:focus {
  border-color: #3949ab;
  box-shadow: 0 0 0 2px rgba(57, 73, 171, 0.2);
  outline: none;
  transform: translateY(-1px);
}

/* 特定输入框样式 */
.critical-perfect-input {
  color: #ff9800;
  background-color: rgba(255, 152, 0, 0.05);
}

.perfect-high-input, .perfect-low-input {
  color: #ff9800;
  background-color: rgba(255, 152, 0, 0.05);
}

.great-high-input, .great-mid-input, .great-low-input {
  color: #9c27b0;
  background-color: rgba(156, 39, 176, 0.05);
}

.good-input {
  color: #4caf50;
  background-color: rgba(76, 175, 80, 0.05);
}

.miss-input {
  color: #757575;
  background-color: rgba(117, 117, 117, 0.05);
}

/* 总数组样式 */
.total-group {
  margin-top: 20px;
  display: flex;
  align-items: center;
  background-color: #e8eaf6;
  padding: 12px 15px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.total-group .label {
  font-weight: bold;
  margin-right: 10px;
  color: #3949ab;
  font-size: 16px;
}

.total-group .input {
  flex: 1;
  height: 40px;
  border: 1px solid #c5cae9;
  border-radius: 6px;
  padding: 0 15px;
  font-weight: bold;
  background-color: #fff;
  font-size: 16px;
  color: #3949ab;
  transition: all 0.3s ease;
}

.total-group .input:focus {
  border-color: #3949ab;
  box-shadow: 0 0 0 2px rgba(57, 73, 171, 0.2);
  outline: none;
}

/* BREAK音符部分整体样式 */
.input-section.break-section {
  background-color: #f9f9f9;
  border-radius: 12px;
  padding: 15px;
  margin-bottom: 25px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.input-section.break-section .section-title {
  font-size: 18px;
  font-weight: bold;
  color: #3949ab;
  margin-bottom: 15px;
  text-align: center;
  padding-bottom: 10px;
  border-bottom: 2rpx solid #c5cae9;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* Perfect部分特殊样式 */
.break-table-section:nth-child(2) .break-table-title {
  background: linear-gradient(135deg, #fff8e1, #ffecb3);
  color: #ff9800;
}

.break-table-section:nth-child(2) .break-table {
  border-color: #ffe0b2;
}

/* Great部分特殊样式 */
.break-table-section:nth-child(3) .break-table-title {
  background: linear-gradient(135deg, #f3e5f5, #e1bee7);
  color: #9c27b0;
}

.break-table-section:nth-child(3) .break-table {
  border-color: #e1bee7;
}

/* 行样式 */
.break-table-row {
  display: flex;
  width: 100%;
  border-bottom: 1px solid #e0e0e0;
  margin: 0px 0px;
  padding: 1px;
  transition: all 0.2s ease;
}

.break-table-row:last-child {
  border-bottom: none;
}

/* BREAK音符详细信息样式 */
.break-details {
  flex-direction: column;
  gap: 10px;
  padding: 12px !important;
  background-color: #f5f5f5 !important;
}

.break-detail-group {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 8px;
  background-color: white;
  border-radius: 6px;
  border: 1px solid #e0e0e0;
}

.break-label {
  width: 100%;
  font-weight: bold;
  color: #3949ab;
  margin-bottom: 4px;
  padding-bottom: 4px;
  border-bottom: 1px solid #e0e0e0;
}

.break-detail-group text:not(.break-label) {
  font-size: 13px;
  color: #555;
  background-color: #f8f9fa;
  padding: 4px 8px;
  border-radius: 4px;
  border: 1px solid #eee;
}

/* Perfect组的样式 */
.break-detail-group:nth-child(1) text:not(.break-label) {
  color: #ff9800;
  background-color: #fff8e1;
  border-color: #ffe0b2;
}

/* Great组的样式 */
.break-detail-group:nth-child(2) text:not(.break-label) {
  color: #9c27b0;
  background-color: #f3e5f5;
  border-color: #e1bee7;
}

/* 其他组的样式 */
.break-detail-group:nth-child(3) text:not(.break-label) {
  color: #757575;
  background-color: #fafafa;
  border-color: #e0e0e0;
}
</style> 