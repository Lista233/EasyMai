# qr-code-parsing 二维码解析（识别）

## 示例说明

### 默认 （可传入图片、chooseImage 选择图片相册及照相机）

```
<qr-code-parsing @callback="deCodeCallback" :awm-file-path="awmFilePath"></qr-code-parsing>


<script>
	export default {
		data() {
			return {
				awmFilePath: '../../static/qrcode.png',
			}
		},
		methods: {
			deCodeCallback(code) {
				console.log(code)
			}
		}
	}
</script>
```

#### 参数
deCodeCallback	解码回调
awmFilePath			默认图片


### 自定义 （可传入图片、chooseImage 选择图片相册及照相机）

```
<qr-code-parsing ref="qrCodeParsing" :awm-file-path="awmFilePath" @callback="deCodeCallback" :isCustom="true">
	<view class="box">
		<view class="qrcode">
			<image :src="awmFilePath" mode="aspectFit" @click="camera" />
		</view>
		<button class="btn" @click="deCode">解码</button>
	</view>
</qr-code-parsing>

<script>
	export default {
		data() {
			return {
				awmFilePath: '../../static/qrcode.png',
			}
		},
		methods: {
			deCodeCallback(code) {
				console.log(code)
			},
			camera() {
				uni.chooseImage({
					count: 1,
					success: res => {
						this.awmFilePath = res.tempFilePaths[0];
					}
				})
			},
			deCode() {
				this.$refs.qrCodeParsing.deCode(this.awmFilePath)
			}
		}
	}
</script>
```

#### 参数
isCustom				是否自定义Boolean
deCodeCallback	解码回调
awmFilePath			默认图片