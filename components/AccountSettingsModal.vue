<template>
  <view class="modal-container" v-if="visible">
    <view class="modal-overlay" @click="handleCancel"></view>
    <view class="modal-content">
      <view class="modal-title">修改设置</view>
      <view class="settings-form">
        <view class="form-item">
          <view class="label-with-help">
            <text class="help-icon" @click="showHelp('token')">ⓘ</text>
            <text class="form-label">导入令牌：</text>
          </view>
          <view class="input-with-button">
            <input 
              type="text"
              v-model="settingsForm.importToken"
              :readonly="true"
              disabled
              class="form-input readonly"
            />
            <button class="refresh-btn" @click="refreshImportToken">
              <text class="btn-icon">🔄</text>
            </button>
          </view>
        </view>
        <view class="form-item">
          <view class="label-with-help">
            <text class="help-icon" @click="showHelp('nickname')">ⓘ</text>
            <text class="form-label">昵称：</text>
          </view>
          <input 
            type="text"
            v-model="settingsForm.nickname"
            placeholder="请输入昵称"
            class="form-input"
          />
        </view>
        <view class="form-item">
          <view class="label-with-help">
            <text class="help-icon" @click="showHelp('qq')">ⓘ</text>
            <text class="form-label">绑定QQ：</text>
          </view>
          <input 
            type="text"
            v-model="settingsForm.bind_qq"
            placeholder="请输入QQ号"
            class="form-input"
          />
        </view>
        <view class="form-item">
          <view class="label-with-help">
            <text class="help-icon" @click="showHelp('channel')">ⓘ</text>
            <text class="form-label">频道UID：</text>
          </view>
          <input 
            type="text"
            v-model="settingsForm.qq_channel_uid"
            placeholder="请输入QQ频道UID"
            class="form-input"
          />
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
import { ref, reactive, watch } from 'vue';

// 定义props
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  userData: {
    type: Object,
    default: () => ({
      nickname: '',
      importToken: '',
      bind_qq: '',
      qq_channel_uid: ''
    })
  }
});

// 定义emit事件
const emit = defineEmits(['cancel', 'confirm', 'update:visible', 'refresh-token']);

// 内部状态
const settingsForm = reactive({
  nickname: '',
  importToken: '',
  bind_qq: '',
  qq_channel_uid: ''
});

// 监听props变化，更新表单数据
watch(() => props.userData, (newValue) => {
  settingsForm.nickname = newValue.nickname || '';
  settingsForm.importToken = newValue.importToken || '';
  settingsForm.bind_qq = newValue.bind_qq || '';
  settingsForm.qq_channel_uid = newValue.qq_channel_uid || '';
}, { immediate: true });

// 显示帮助信息
function showHelp(type) {
  let message = '';
  switch(type) {
    case 'token':
      message = '导入令牌用于数据导入，请妥善保管';
      break;
    case 'nickname':
      message = '设置您在系统中显示的昵称';
      break;
    case 'qq':
      message = '绑定QQ号用于机器人通知等功能';
      break;
    case 'channel':
      message = 'QQ频道UID用于频道通知功能';
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

// 刷新导入令牌
function refreshImportToken() {
  emit('refresh-token');
}

// 取消操作
function handleCancel() {
  emit('cancel');
  emit('update:visible', false);
}

// 确认操作
function handleConfirm() {
  emit('confirm', {...settingsForm});
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
    
    .settings-form {
      .form-item {
        margin-bottom: 24rpx;
        
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
        
        // 普通输入框样式
        .form-input {
          width: 100%;
          height: 88rpx;
          border: 2rpx solid #e2e8f0;
          border-radius: 12rpx;
          padding: 0 24rpx;
          font-size: 28rpx;
          box-sizing: border-box;
          transition: all 0.2s ease;
          
          &:focus {
            border-color: #818cf8;
            box-shadow: 0 0 0 2rpx rgba(129, 140, 248, 0.1);
            outline: none;
          }
          
          &::placeholder {
            color: #94a3b8;
          }
          
          &.readonly {
            background-color: #f8fafc;
            color: #64748b;
            border-color: #e2e8f0;
            cursor: not-allowed;
            
            &:focus {
              border-color: #e2e8f0;
              box-shadow: none;
            }
          }
        }
        
        // 带按钮的输入框容器
        .input-with-button {
          display: flex;
          gap: 16rpx;
          align-items: center;
          
          .form-input {
            flex: 1;
          }
          
          .refresh-btn {
            width: 80rpx;
            height: 80rpx;
            border-radius: 12rpx;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #f1f5f9;
            border: none;
            
            .btn-icon {
              font-size: 32rpx;
              color: #64748b;
            }
            
            &:active {
              background: #e2e8f0;
              
              .btn-icon {
                color: #475569;
              }
            }
          }
        }
      }
    }
    
    .modal-buttons {
      display: flex;
      gap: 16rpx;
      margin-top: 30rpx;
      
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
          background: #818cf8;
          color: white;
        }
        
        &:active {
          transform: scale(0.98);
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