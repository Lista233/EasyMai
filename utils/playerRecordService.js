class PlayerRecordService {
  constructor() {
    this.playerData = null;
  }

  // 初始化玩家数据
  initPlayerData(data) {
    this.playerData = data;
  }

  // 获取玩家基本信息
  getPlayerInfo() {
    if (!this.playerData) return null;
    
    return {
      nickname: this.playerData.nickname,
      rating: this.playerData.rating,
      additional_rating: this.playerData.additional_rating,
      plate: this.playerData.plate
    };
  }

  // 根据歌曲ID获取成绩记录
  getRecordBySongId(songId) {
    if (!this.playerData || !this.playerData.records) {
      return null;
    }

    // 将songId转换为字符串进行比较
    const targetId = String(songId);
    return this.playerData.records.find(record => String(record.song_id) === targetId) || null;
  }

  // 根据歌曲ID和难度等级获取成绩记录
  getRecordBySongIdAndLevel(songId, levelIndex) {	  
	  
	  console.log('getRED')
	  console.log(this.playerData.records)
    if (!this.playerData || !this.playerData.records) {
      return null;
    }

    const targetId = String(songId);
    return this.playerData.records.find(record => 
      String(record.song_id) == targetId && 
      record.level_index == levelIndex
	 
    ) || null;
  }

  // 获取所有成绩记录
  getAllRecords() {
    return this.playerData?.records || [];
  }
}

// 创建单例实例
const playerRecordService = new PlayerRecordService();

// 示例用法：
// 初始化数据
// const playerData = {
//   nickname: "Lista",
//   rating: 15323,
//   additional_rating: 5,
//   plate: "",
//   records: [...]
// };
// playerRecordService.initPlayerData(playerData);

// 导出单例实例
export default playerRecordService; 