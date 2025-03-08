export async function maiGetUid(qrcode){
	let data=uni.request({
		url:`http://117.72.108.255:25441/apiqr/?qr_code=${qrcode}`,
		method:"GET",
		//data:{"qr_code":qrcode},
	})
	return data;
	console.log(data);
}
export async function maiGetUserMusicData(userID){
	
	let resp=await uni.request({
		url:`http://117.72.108.255:25441/getUserMusic/?userID=${userID}`,
		method:"GET",
		//data:{"userID":userID},
	})
	return resp;
}
export async function divingFishUpdateData(musicdata,importToken){
	console.log(importToken)
	let resp=await uni.request({
  url:`https://www.diving-fish.com/api/maimaidxprober/player/update_records`,
  header:{
    'import-token':importToken
  },
  method:"POST",
  data:musicdata
})
	return resp;
}
export async function divingFishGetMusic(){
	let resp=await uni.request({
  url:`https://www.diving-fish.com/api/maimaidxprober/music_data`,
  method:"get",
 // data:musicdata
})
	return  resp.data;
}
 export async function divingFishgetb50(qqid,username)
{
 return	await uni.request({
		url:'https://www.diving-fish.com/api/maimaidxprober/query/player',
		data:{
			"qqid":qqid,
			"username":username,
			"b50":true,
		},
		method:'POST',
	})
}
export async function divingFishLogin(username,password)
{
	console.log('logining')
	let resp=await uni.request({
	  url:`https://www.diving-fish.com/api/maimaidxprober/login`,
	  method:"POST",
	 data:{
		 "username":username,
		 "password":password,
	 }
	})
	
	console.log(resp)
	return resp
}

export async function divingFishGetProfile(jwt_token)
{
	console.log('getProfile');
	let resp=await uni.request({
	  url:`https://www.diving-fish.com/api/maimaidxprober/player/profile`,
	  method:"GET",
	  header:{
		  "jwt-token":jwt_token
	  }
	})
	console.log(resp);
	return resp;
}
export async function divingFishGetRecords(jwt_token)
{
	console.log('getRecords');
	let resp=await uni.request({
	  url:`https://www.diving-fish.com/api/maimaidxprober/player/records`,
	  method:"GET",
	  header:{
		  "jwt-token":jwt_token
	  }
	})
	console.log(resp);
	return resp;
}
export async function divingFishGetJwtToken(username,password)
{
	let res=await maiApi.divingFishLogin(username,password);
	if(res.data.message!='登录成功')
	{
		return null;
	}
	let headerCookie=res.header['set-cookie']
	let jwt_token=headerCookie.split(';',1)[0].split('=')[1];
	return jwt_token
}

export async function divingFishSetProfile(nickname,bind_qq,qq_channel_uid,jwt_token){
console.log('getProfile');
	let resp=await uni.request({
	  url:`https://www.diving-fish.com/api/maimaidxprober/player/profile`,
	  method:"POST",
	  header:{
		  "jwt-token":jwt_token
	  },
	  data:
	  {
	
	  	"bind_qq":bind_qq,
	  	"qq_channel_uid":qq_channel_uid,
		"nickname":nickname,
	  }
	})
	console.log(resp);
	return resp;
}
export async function divingFishRefreshImportToken(jwt_token)
{
	let resp=await uni.request({
	  url:`https://www.diving-fish.com/api/maimaidxprober/player/import_token`,
	  method:"PUT",
	  header:{
		  "jwt-token":jwt_token
	  },
	})
	return
}
export async function divingFishRegister(username,password)
{
	console.log('regis')
	let resp=await uni.request({
	  url:`https://www.diving-fish.com/api/maimaidxprober/register`,
	  method:"POST",
	 data:{
		 "username":username,
		 "password":password,
	 }
	})
	console.log(resp)
	return resp
}

export async function divingFishAgrement(jwt_token)
{
	console.log('regis')
	let resp=await uni.request({
	  url:`https://www.diving-fish.com/api/maimaidxprober/player/agreement`,
	  method:"POST",
	 data:{
		"accept_agreement":true
	 },
	 header:{
	 	"jwt-token":jwt_token
	 }
	})

	console.log(resp)
	return resp;
}

export function splitJwtToken(res){
	let headerCookie = res.header['set-cookie'];
	return headerCookie.split(';', 1)[0].split('=')[1];
}