<template>
  <view class="version-map">
    <view class="container">
      <view class="header">
        <text class="title">maimai 版本对照表</text>
      </view>

      <view class="table-container">
        <view class="table">
          <view class="table-header">
            <view class="th version">版本名称</view>
            <view class="th code">版本代号</view>
          </view>
          <view 
            class="table-row"
            v-for="(version, index) in versionList" 
            :key="index"
            :class="getVersionClass(version.name)"
          >
            <view class="td version">{{ version.name }}</view>
            <view class="td code">{{ version.code }}</view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'

const versionList = ref([
  { name: 'maimai PLUS', code: '真' },
  { name: 'maimai GreeN', code: '超' },
  { name: 'maimai GreeN PLUS', code: '檄' },
  { name: 'maimai ORANGE', code: '橙' },
  { name: 'maimai ORANGE PLUS', code: '暁' },
  { name: 'maimai PiNK', code: '桃' },
  { name: 'maimai PiNK PLUS', code: '櫻' },
  { name: 'maimai MURASAKi', code: '紫' },
  { name: 'maimai MURASAKi PLUS', code: '菫' },
  { name: 'maimai MiLK', code: '白' },
  { name: 'MiLK PLUS', code: '雪' },
  { name: 'maimai FiNALE', code: '輝' },
  { name: 'ALL FiNALE', code: '舞' },
  { name: 'maimai DX', code: '熊' },
  { name: 'maimai DX PLUS', code: '華' },
  { name: 'maimai DX Splash', code: '爽' },
  { name: 'maimai DX Splash PLUS', code: '煌' },
  { name: 'maimai DX UNiVERSE', code: '宙' },
  { name: 'maimai DX UNiVERSE PLUS', code: '星' },
  { name: 'maimai DX FESTiVAL', code: '祭' },
  { name: 'maimai DX FESTiVAL PLUS', code: '祝' },
  { name: 'maimai DX BUDDiES', code: '双' },
  { name: 'maimai DX BUDDiES PLUS', code: '宴' },
  { name: 'maimai DX PRiSM', code: '镜' },
])

const getVersionClass = (versionName) => {
  if (versionName.includes('DX')) return 'dx'
  if (versionName.includes('FiNALE')) return 'finale'
  return 'classic'
}
</script>

<style lang="scss">
.version-map {
  padding: 20rpx;
  background-color: #f5f5f5;
  min-height: 100vh;

  .container {
    background: #fff;
    border-radius: 20rpx;
    padding: 30rpx;
    box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
  }

  .header {
    margin-bottom: 40rpx;
    
    .title {
      font-size: 40rpx;
      font-weight: bold;
      color: #2c3e50;
      display: block;
      padding-bottom: 20rpx;
      border-bottom: 4rpx solid #eee;
    }
  }

  .table-container {
    .table {
      width: 100%;
      border: 2rpx solid #eee;
      border-radius: 10rpx;
      overflow: hidden;

      .table-header {
        display: flex;
        background-color: #f8f9fa;
        
        .th {
          padding: 20rpx;
          text-align: center;
          font-size: 28rpx;
          font-weight: bold;
          border-right: 2rpx solid #eee;
          
          &.version {
            flex: 3;
          }
          
          &.code {
            flex: 1;
          }
          
          &:last-child {
            border-right: none;
          }
        }
      }

      .table-row {
        display: flex;
        border-top: 2rpx solid #eee;
        transition: background-color 0.3s;

        &:hover {
          background-color: #f8f9fa;
        }

        .td {
          padding: 20rpx;
          text-align: center;
          font-size: 26rpx;
          border-right: 2rpx solid #eee;
          
          &.version {
            flex: 3;
            text-align: left;
          }
          
          &.code {
            flex: 1;
          }
          
          &:last-child {
            border-right: none;
          }
        }

        // 版本样式
        &.classic {
          background-color: rgba(255, 241, 220, 0.3);
        }

        &.finale {
          background-color: rgba(255, 223, 223, 0.3);
        }

        &.dx {
          background-color: rgba(220, 237, 255, 0.3);
        }
      }
    }
  }
}
</style> 