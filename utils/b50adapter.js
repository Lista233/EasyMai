
function fcadapter(num){
  switch (num) {
    case 0:
      return '';
      break
    case 1:
      return 'fc'
      break
    case 2:
      return 'fcp'
      break
    case 3:
      return 'ap'
      break
    case 4:
      return 'app'
      break
    default:
      throw('error');
  }
}
function fsadapter(num){
  switch (num) {
    case 0:
      return '';
      break
    case 1:
      return 'fs'
      break
    case 2:
      return 'fsp'
      break
    case 3:
      return 'fdx'
      break
    case 4:
      return 'fdxp'
      break
    case 5:
      return 'sync'
      break
    default:
      throw('error');
  }
}

export async function test(){
	console.log(1);
	let musicdata=uni.getStorageSync('musicData')
    console.log(musicdata);
}
export async function b50adapter(user_data){
  let musicdata=uni.getStorageSync('musicData')
  const userMusicData=user_data;
  
  let updatelist=[];
let play=userMusicData.userMusicList[0]
let n=0
  let b=musicdata.filter(m => m.id == 11617 )[0]
  console.log(b)
for(let userMusicList of userMusicData.userMusicList)
{
  for(let playdata of userMusicList.userMusicDetailList)
  {

    let music=musicdata.filter(m => m.id == playdata.musicId)[0]
    if(!music){
      console.log(playdata);
      continue;
    }
    let updateData={
    achievements:playdata.achievement/10000,
    dxScore: playdata.deluxscoreMax,
    fc:fcadapter(playdata.comboStatus),
    fs:fsadapter(playdata.syncStatus),
    level_index:playdata.level,
	musicId:playdata.musicId,
	playCount:playdata.playCount,
    type:music.type,
    title:music.title,}
    updatelist.push(updateData)
  }
}

 return updatelist;
// console.log(JSON.stringify(updatelist) )
 
}

// let a=b50adapter(udata)

// let res=await  axios.request({
//   url:config.maiApi.updateRecords,
//   headers:{
//     'import-token':config.divingFishToken.importToken,
//   },
//   method:"POST",
//   data:a
// })
// console.log(res.data);







