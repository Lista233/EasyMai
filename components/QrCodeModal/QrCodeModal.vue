<template>
  <view class="modal-container" :class="{ 'dark-mode': darkMode }" v-if="visible">
    <view class="modal-overlay" @click="handleCancel"></view>
    <view class="modal-content qr-modal">
      <view class="modal-title">绑定二维码获取UID</view>
      <view class="qr-form">
        <view class="form-item">
          <view class="label-with-help">
            <text class="help-icon" @click="showHelp('qrcode')">ⓘ</text>
            <text class="form-label">二维码信息：</text>
          </view>
          <textarea 
            v-model="qrCodeInput"
            placeholder="进入舞萌公众号界面->点击玩家二维码->长按二维码识别->将字符串复制到此处"
            class="form-textarea"
            :maxlength="-1"
            :auto-height="true"
          />
     <!--     <button class="import-btn" @click="chooseImage">
            <text class="btn-icon">📁</text>
            <text class="btn-text">从相册导入/扫码</text>
          </button> -->
        </view>
      </view>
      <view class="modal-buttons">
        <button class="modal-btn cancel" @click="handleCancel">取消</button>
        <button class="modal-btn confirm" @click="handleConfirm">确定</button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, inject } from 'vue';
import './dark-mode.scss';

const qrCodeInput = ref('');
// 定义props
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
});

// 定义emit事件
const emit = defineEmits(['cancel', 'confirm', 'update:visible']);

// 注入darkMode状态
const darkMode = inject('darkMode', ref(false));

// 显示帮助信息
function showHelp(type) {
  let message = '';
  switch(type) {
    case 'qrcode':
      message = '请输入舞萌DX二维码信息，可从微信公众号获取';
      break;
    default:
      message = '请输入有效信息';
  }
  
  uni.showToast({
    title: message,
    icon: 'none',
    duration: 3000
  });
}

// 取消操作
function handleCancel() {
  qrCodeInput.value = '';
  emit('cancel');
  emit('update:visible', false);
}

// 确认操作
function handleConfirm() {
  if (!qrCodeInput.value) {
    uni.showToast({
      title: '请输入二维码信息',
      icon: 'none'
    });
    return;
  }
  
  emit('confirm', qrCodeInput.value);
  emit('update:visible', false);
}
</script>

<style lang="scss" scoped>
.modal-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  
  .modal-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
  }
  
  .modal-content {
    position: relative;
    width: 85%;
    max-width: 600rpx;
    background: white;
    border-radius: 16rpx;
    padding: 30rpx;
    z-index: 10000;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
    animation: modalShow 0.2s ease;
    
    .modal-title {
      font-size: 32rpx;
      font-weight: 600;
      text-align: center;
      margin-bottom: 24rpx;
      color: #1e293b;
    }
    
    &.qr-modal {
      .qr-form {
        padding: 20rpx 0;
        
        .form-item {
          .label-with-help {
            display: flex;
            align-items: center;
            gap: 8rpx;
            margin-bottom: 12rpx;
            
            .help-icon {
              color: #94a3b8;
              font-size: 24rpx;
              padding: 4rpx 8rpx;
              border-radius: 50%;
              cursor: pointer;
              transition: all 0.2s ease;
              margin-right: 4rpx;
              
              &:active {
                color: #6366f1;
                background: rgba(99, 102, 241, 0.1);
              }
            }
            
            .form-label {
              color: #64748b;
              font-size: 28rpx;
              font-weight: 500;
            }
          }
          
          .form-textarea {
            width: 100%;
            min-height: 240rpx;
            max-height: 400rpx;
            border: 2rpx solid #e2e8f0;
            border-radius: 16rpx;
            padding: 24rpx;
            font-size: 28rpx;
            box-sizing: border-box;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            background: #f8fafc;
            margin-bottom: 0rpx;
            line-height: 1.6;
            
            &:focus {
              border-color: #818cf8;
              box-shadow: 0 0 0 4rpx rgba(129, 140, 248, 0.1);
              background: white;
              outline: none;
            }
            
            &:hover {
              border-color: #818cf8;
              background: white;
            }
            
            &::placeholder {
              color: #94a3b8;
            }
          }
          
          .import-btn {
            width: 100%;
            height: 88rpx;
            border: 2rpx dashed #e2e8f0;
            border-radius: 16rpx;
            background: #f8fafc;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12rpx;
            transition: all 0.3s ease;
            margin-bottom: 20rpx;
            
            .btn-icon {
              font-size: 36rpx;
              color: #64748b;
            }
            
            .btn-text {
              font-size: 28rpx;
              color: #64748b;
              font-weight: 500;
            }
            
            &:active {
              background: #f1f5f9;
              border-color: #818cf8;
              
              .btn-icon, .btn-text {
                color: #6366f1;
              }
            }
          }
        }
      }
      
      .modal-buttons {
        margin-top: 10rpx;
        display: flex;
        gap: 16rpx;
        
        .modal-btn {
          flex: 1;
          height: 80rpx;
          border: none;
          border-radius: 12rpx;
          font-size: 28rpx;
          font-weight: 500;
          
          &.cancel {
            background: #f1f5f9;
            color: #64748b;
          }
          
          &.confirm {
            background: linear-gradient(135deg, #818cf8 0%, #6366f1 100%);
            color: white;
            
            &:active {
              background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
            }
          }
          
          &:active {
            transform: scale(0.98);
          }
        }
      }
    }
  }
}

@keyframes modalShow {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style> 