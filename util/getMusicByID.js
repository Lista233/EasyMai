import {} from 'vue'
import * as maiApi from '../api/maiapi.js'
let muisclist=uni.getStorageSync('musicdata');
if(!muisclist){
	muisclist=await maiApi.divingFishGetMusic() ;
}