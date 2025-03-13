class PlayerRecordService {
  constructor(recordlist=[]) {
    this.playerData = recordlist;
  }

  // 初始化玩家数据
  initPlayerData(data) {
    // console.log('初始化数据:', data); // 调试日志
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
    if (!this.playerData || !Array.isArray(this.playerData.data.records)) {
      // console.log('playerData 无效:', this.playerData); // 调试日志
      return null;
    }

    const targetId = String(songId);
    // console.log('查找记录:', { targetId, levelIndex }); // 调试日志
    
    const record = this.playerData.data.records.find(record => 
      String(record.song_id) === targetId && 
      Number(record.level_index) === Number(levelIndex)
    );
    
    // console.log('找到的记录:', record); // 调试日志
    return record || null;
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