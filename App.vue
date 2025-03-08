<script>
	/*
	本地存储:
	mai接口相关：
	maiUid;
	maiPlayData
	水鱼相关:
	b50;
	musicData;
	divingFish_qqid;
	divingFish_username;
	divingFish_nickname
	divingFish_importToken
	*/
	export default {
		onLaunch: function() {
			console.log('App Launch')
			//uni.clearStorageSync();
			let info=uni.getStorageInfoSync()
			let initkey=
			['maiUid','maiPlayData','divingFish_qqid','divingFish_username'
			,'divingFish_importToken','divingFish_nickname','musicData','b50'
			,'divingFish_password']
			
			for(let item of initkey){
			if(!(info.keys.includes(item)))
			{			
				uni.setStorageSync(item,"")
			}
			}
			let musicData=uni.getStorageSync('musicData')
			let uid=uni.getStorageSync('uid')
			console.log(musicData)
			if(uid==''){
				uid=-1
				uni.setStorageSync('uid',uid)
			}
			if(musicData=='')
			{
				let resp=uni.request({
				  url:`https://www.diving-fish.com/api/maimaidxprober/music_data`,
				  method:"get",
				}).then((resp)=>{musicData=resp.data;
				uni.setStorageSync("musicData",musicData)
				//console.log(musicData)
				})
				
			}
			//if()
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		}
	}
</script>

<style>
	/*每个页面公共css */
</style>
