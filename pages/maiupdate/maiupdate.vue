<template>
	<view class="maiupdate">
		<view class="container">
			<form class="form-container">
				<view class="input-group">
					<text class="label">二维码信息:</text>
					<textarea 
						class="input-area" 
						placeholder="请输入二维码信息"  
						@blur="(e)=>setQrCode(e)" 
						:value="QrCode"
					></textarea>
				</view>
				
				<view class="input-group">
					<text class="label">水鱼导入token:</text> 
					<textarea 
						class="input-area" 
						placeholder="请输入成绩导入token" 
						@blur="(e)=>setImportToken(e)" 
						:value="importToken"
					></textarea>
				</view>
				
				<button 
					class="btn save-btn" 
					@click="saveConfig()"
					:disabled="!QrCode || !importToken"
				>
					<text>保存设置</text>
				</button>
			</form>
			
			<view class="action-buttons">
				<button 
					v-if="uid== -1||uid==''" 
					class="btn bind-btn" 
					@click="getUid()"
					:disabled="!QrCode || isProcessing"
				>
					<text>获取ID（先绑二维码）</text>
				</button>
				
				<button 
					class="btn update-btn" 
					@click="divingFishUpdate()"
					:disabled="uid === -1 || isProcessing"
				>
					<text>水鱼传分</text>
				</button>
			</view>
			
			<button 
				v-if="uid !== -1"
				class="btn clear-btn" 
				@click="clearUid()"
				:disabled="isProcessing"
			>
				<text>清除UID</text>
			</button>
			
			<button 
				v-if="uid !== -1"
				class="btn bind-btn hasbinded" 
				@click="getUid()"
				:disabled="isProcessing"
			>
				<text>UID: {{uid}}</text>
				<text class="sub-text">(点此重绑)</text>
			</button>
		</view>
	</view>
</template>

<script setup>
	import { ref } from "vue";
    import * as maiApi from "../../api/maiapi.js"
	import * as adapter from "../../utils/b50adapter.js";
	let importToken=ref('');
	let QrCode=ref('');
	let uid=ref(-1);
	let isProcessing=ref(false);
	importToken.value=uni.getStorageSync("importToken")
	uid.value=uni.getStorageSync("uid")
	QrCode.value=uni.getStorageSync("QrCode")
	
	// 保存设置
	function saveConfig()
	{
		uni.showToast({
			title:"保存成功",
			icon:"none",
			position:"center",
			})
		uni.setStorageSync("importToken",importToken.value)
		uni.setStorageSync("QrCode",QrCode.value)
		uni.setStorageSync("uid",uid.value)
	}
	
	//设置成绩导入令牌
	function setImportToken(e){importToken.value=e.detail.value};
	
	//设置二维码
	function setQrCode(e){QrCode.value=e.detail.value;};
	
	//获取用户ID
	async function getUid(){
		if(isProcessing.value) return;
		isProcessing.value = true;
		
		try {
			let resp=await maiApi.maiGetUid(QrCode.value)
			let tempuid=resp.data.userID
			console.log(tempuid)
			if(tempuid==-1){
				uni.showToast({
					title:'您的二维码不合法或已过期',
					icon:'none',
					position:"center"
				})
			} else {
				uid.value=tempuid;
				uni.setStorageSync("uid",uid.value)
				uni.showToast({
					title:'绑定成功',
					icon:'none',
					position:"center"
				})
			}
		} catch (error) {
			uni.showToast({
				title:'网络错误，请重试',
				icon:'none',
				position:"center"
			})
		} finally {
			isProcessing.value = false;
		}
	}
	
	//获取用户游玩数据，并进行按水鱼传分格式转换
	async function getUserMusicData(){
		let resp=await maiApi.maiGetUserMusicData(uid.value)
		uni.setStorageSync(resp.data)
		if(!(resp.data.userId))
		{
			return null;
		}
		let a=await adapter.b50adapter(resp.data)
		console.log(a);
		return a
		
	}
	
	//传入歌曲数据进行水鱼传分
	async function updateMusicData(musicScoreList){
		let res=await maiApi.divingFishUpdateData(musicScoreList,importToken.value)
		return res;
	}
	
	const timeCutDown=4000;
	let cutDownTime=0;
	
	//一键传分
	async function divingFishUpdate()
	{
		if(isProcessing.value) return;
		isProcessing.value = true;
		
		let time=new Date().getTime()
		if(cutDownTime-time>0)
		{
			uni.hideToast()
			uni.showToast({
				title:`操作过于频繁，请${Math.floor((cutDownTime-time)/1000)+1}秒后再试`,
				icon:'none'
			})
			isProcessing.value = false;
			return;
		}
		
		try {
			let temp=[]
			let tempres=await updateMusicData(temp)
			console.log(tempres.data.message)
			
			if(uid.value<=0)
			{
				uni.showToast({
					title:"您还未绑定二维码获取UID",
					icon:"none",
					position:"center"
				})
				cutDownTime=new Date().getTime()+timeCutDown
				return
			}
			
			if(tempres.data.message=="导入token有误")
			{
				uni.showToast({
					title:"导入token有误",
					icon:"none",
					position:"center"
				})
				cutDownTime=new Date().getTime()+timeCutDown
				return
			}
			
			uni.showLoading({
				title:"上传中",
				mask:true,
			})
			
			let muiscList=await getUserMusicData();
			uni.hideLoading()
			
			if(!muiscList) {
				uni.showToast({
					title:"用户信息错误",
					icon:"none",
					position:"center"
				})
				return
			}
			
			let res=await updateMusicData(muiscList)
			console.log(res)
			
			if(res.data.message=="更新成功"){
				uni.showToast({
					title:"上传成功",
					icon:"none",
					position:"center"
				})
			} else {
				uni.showToast({
					title:"上传失败(出BUG了o(╥﹏╥)o)",
					icon:"none",
					position:"center"
				})
			}
		} catch (error) {
			uni.showToast({
				title:"网络错误，请重试",
				icon:"none",
				position:"center"
			})
		} finally {
			isProcessing.value = false;
			cutDownTime=new Date().getTime()+timeCutDown;
		}
	}
	
	//清除UID
	function clearUid() {
		uid.value = -1;
		uni.setStorageSync("uid", -1);
		uni.showToast({
			title: "UID已清除",
			icon: "none",
			position: "center"
		});
	}
</script>

<style lang="scss">
.maiupdate {
	min-height: 100vh;
	background: linear-gradient(135deg, #f0f4ff 0%, #e6e9ff 100%);
	padding: 0;
	font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
	
	.container {
		max-width: 600px;
		margin: 0 auto;
		padding: 30px 20px;
		display: flex;
		flex-direction: column;
		gap: 30px;
	}
	
	.form-container {
		background: rgba(255, 255, 255, 0.98);
		border-radius: 24px;
		padding: 40px;
		box-shadow: 0 10px 30px rgba(0, 0, 0, 0.03);
		display: flex;
		flex-direction: column;
		gap: 40px;
		backdrop-filter: blur(10px);
		border: 1px solid rgba(255, 255, 255, 0.9);
		transform: translateY(0);
		transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
		
		&:hover {
			transform: translateY(-2px);
			box-shadow: 0 15px 35px rgba(0, 0, 0, 0.05);
		}
	}
	
	.input-group {
		display: flex;
		flex-direction: column;
		gap: 10px;
		
		.label {
			font-size: 14px;
			color: #64748b;
			font-weight: 500;
			letter-spacing: 0.3px;
			transform: translateX(0);
			transition: all 0.3s ease;
		}
		
		&:focus-within .label {
			color: #6366f1;
			transform: translateX(4px);
		}
	}
	
	.input-area {
		width: 100%;
		height: 120px;
		border: 1px solid #e2e8f0;
		border-radius: 16px;
		padding: 16px;
		font-size: 14px;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		background: #f8fafc;
		box-sizing: border-box;
		color: #1e293b;
		line-height: 1.6;
		transform: scale(1);
		
		&:focus {
			border-color: #a5b4fc;
			box-shadow: 0 0 0 4px rgba(165, 180, 252, 0.1);
			background: white;
			transform: scale(1.01);
		}
		
		&:hover {
			border-color: #a5b4fc;
			background: white;
			transform: scale(1.01);
		}
		
		&::placeholder {
			color: #94a3b8;
		}
	}
	
	.btn {
		width: 100%;
		height: 52px;
		border-radius: 16px;
		border: none;
		font-size: 15px;
		font-weight: 500;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
		overflow: hidden;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.02);
		letter-spacing: 0.3px;
		transform: translateY(0);
		cursor: pointer;
		
		&:active {
			transform: scale(0.98) translateY(1px);
		}
		
		&:disabled {
			opacity: 0.7;
			cursor: not-allowed;
			transform: none;
		}
		
		text {
			font-size: 15px;
			color: white;
			position: relative;
			z-index: 1;
		}
	}
	
	.save-btn {
		margin-top: 20px;
		background: linear-gradient(135deg, #818cf8 0%, #6366f1 100%);
	}
	
	.action-buttons {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}
	
	.bind-btn {
		background: linear-gradient(135deg, #818cf8 0%, #6366f1 100%);
		
		&.hasbinded {
			position: fixed;
			left: 20px;
			bottom: 20px;
			width: auto;
			height: auto;
			padding: 8px 16px;
			flex-direction: row;
			gap: 8px;
			background: #f1f5f9;
			box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
			transform: translateY(0);
			font-size: 13px;
			z-index: 100;
			
			text {
				color: #475569;
				font-size: 13px;
				font-weight: 600;
			}
			
			.sub-text {
				font-size: 12px;
				opacity: 0.7;
				font-weight: 500;
			}
		}
	}
	
	.update-btn {
		background: linear-gradient(135deg, #818cf8 0%, #6366f1 100%);
	}
	
	.clear-btn {
		position: fixed;
		left: 20px;
		bottom: 80px;
		width: auto;
		height: auto;
		padding: 8px 16px;
		background: #f1f5f9;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
		transform: translateY(0);
		font-size: 13px;
		z-index: 100;
		
		text {
			color: #475569;
			font-size: 13px;
			font-weight: 600;
		}
		
		&:active {
			background: #e2e8f0;
		}
	}
}
</style>
