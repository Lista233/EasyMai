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

  // 根据成绩评级筛选记录
  filterRecordsByRate(rate) {
    if (!this.playerData?.records) return [];
    return this.playerData.records.filter(record => record.rate === rate);
  }

  // 根据FC状态筛选记录
  filterRecordsByFC(fcType) {
    if (!this.playerData?.records) return [];
    return this.playerData.records.filter(record => record.fc === fcType);
  }

  // 根据FS状态筛选记录
  filterRecordsByFS(fsType) {
    if (!this.playerData?.records) return [];
    return this.playerData.records.filter(record => record.fs === fsType);
  }

  // 组合筛选方法
  filterRecords({ rate, fc, fs }) {
    if (!this.playerData?.records) return [];
    
    return this.playerData.records.filter(record => {
      const matchRate = !rate || record.rate === rate;
      const matchFC = !fc || record.fc === fc;
      const matchFS = !fs || record.fs === fs;
      return matchRate && matchFC && matchFS;
    });
  }

  // 获取指定版本歌曲的游玩记录
  getRecordsByVersion(songService, version, options = {}) {
    if (!this.playerData?.records) return [];
    
    // 获取指定版本的所有歌曲
    const versionSongs = songService.getSongsByVersion(version, options);
    const versionSongIds = versionSongs.map(song => song.id.toString());
    
    // 筛选出这些歌曲的游玩记录
    const records = this.playerData.records.filter(record => 
      versionSongIds.includes(String(record.song_id))
    );

    // 返回带有完整歌曲信息的记录
    return records.map(record => {
      const songInfo = songService.getSongById(record.song_id);
      return {
        ...record,
        songInfo: {
          title: songInfo?.title,
          version: songInfo?.basic_info?.from,
          ds: songInfo?.ds?.[record.level_index],
          level: songInfo?.level?.[record.level_index]
        }
      };
    });
  }

  // 获取指定版本歌曲的游玩统计
  getVersionPlayStats(songService, version, options = {}) {
    const records = this.getRecordsByVersion(songService, version, options);
    
    return {
      totalSongs: records.length,
      rateStats: {
        sssp: records.filter(r => r.rate === 'sssp').length,
        sss: records.filter(r => r.rate === 'sss').length,
        ssp: records.filter(r => r.rate === 'ssp').length,
        ss: records.filter(r => r.rate === 'ss').length,
        sp: records.filter(r => r.rate === 'sp').length,
        s: records.filter(r => r.rate === 's').length,
      },
      fcStats: {
        ap: records.filter(r => r.fc === 'ap').length,
        fcp: records.filter(r => r.fc === 'fcp').length,
        fc: records.filter(r => r.fc === 'fc').length,
      },
      fsStats: {
        fsp: records.filter(r => r.fs === 'fsp').length,
        fs: records.filter(r => r.fs === 'fs').length,
        sync: records.filter(r => r.fs === 'sync').length,
      },
      records: records
    };
  }

  // 根据指定条件对记录进行排序
  sortRecords({ 
    sortBy = 'ra',  // 'ra' 或 'achievements'
    order = 'desc', // 'desc' 或 'asc'
    limit = null    // 可选，限制返回数量
  } = {}) {
    if (!this.playerData?.records) return [];
    
    const records = [...this.playerData.records]; // 创建副本以避免修改原数据
    
    records.sort((a, b) => {
      const valueA = a[sortBy] || 0;
      const valueB = b[sortBy] || 0;
      
      if (order === 'desc') {
        return valueB - valueA;
      } else {
        return valueA - valueB;
      }
    });

    return limit ? records.slice(0, limit) : records;
  }

  // 获取最高ra记录
  getTopRaRecords(limit = 10) {
    return this.sortRecords({
      sortBy: 'ra',
      order: 'desc',
      limit
    });
  }

  // 获取最高达成率记录
  getTopAchievementsRecords(limit = 10) {
    return this.sortRecords({
      sortBy: 'achievements',
      order: 'desc',
      limit
    });
  }

  // 获取指定定数范围内的最佳成绩
  getBestRecordsByDs(songService, dsRange, options = {}) {
    const {
      sortBy = 'ra',
      order = 'desc',
      limit = null
    } = options;

    if (!this.playerData?.records) return [];

    // 获取所有符合定数范围的歌曲
    const songs = songService.getSongsByDs(dsRange);
    const songMap = new Map(songs.map(song => [song.id.toString(), song]));

    // 筛选并排序记录
    const records = this.playerData.records
      .filter(record => {
        const song = songMap.get(String(record.song_id));
        if (!song) return false;
        
        // 检查该难度的定数是否在范围内
        const ds = song.ds[record.level_index];
        return ds >= dsRange.min && ds <= dsRange.max;
      })
      .sort((a, b) => {
        const valueA = a[sortBy] || 0;
        const valueB = b[sortBy] || 0;
        return order === 'desc' ? valueB - valueA : valueA - valueB;
      });

    return limit ? records.slice(0, limit) : records;
  }

  // 添加一个新方法：根据多条件筛选记录
  filterRecordsByMultipleConditions(songService, options = {}) {
    const {
      version = '',
      difficultyIndex = null,
      dsRange = null,
      sortBy = 'ra',
      order = 'desc'
    } = options;
    
    if (!this.playerData?.records) return [];
    
    let records = [...this.playerData.records]; // 创建副本
    
    // 版本筛选
    if (version) {
      const versionSongs = songService.getSongsByVersion(version);
      const versionSongIds = versionSongs.map(song => song.id.toString());
      records = records.filter(record => 
        versionSongIds.includes(String(record.song_id))
      );
    }
    
    // 难度筛选
    if (difficultyIndex !== null) {
      records = records.filter(record => 
        Number(record.level_index) === difficultyIndex
      );
    }
    
    // 定数范围筛选
    if (dsRange && dsRange.min !== undefined && dsRange.max !== undefined) {
      const dsRangeSongs = songService.getSongsByDs(dsRange);
      const songMap = new Map(dsRangeSongs.map(song => [song.id.toString(), song]));
      
      records = records.filter(record => {
        const song = songMap.get(String(record.song_id));
        if (!song) return false;
        
        const levelIndex = Number(record.level_index);
        if (levelIndex < 0 || levelIndex >= song.ds.length) return false;
        
        const ds = song.ds[levelIndex];
        return ds >= dsRange.min && ds <= dsRange.max;
      });
    }
    
    // 排序
    records.sort((a, b) => {
      const valueA = a[sortBy] || 0;
      const valueB = b[sortBy] || 0;
      
      if (order === 'desc') {
        return valueB - valueA;
      } else {
        return valueA - valueB;
      }
    });
    
    return records;
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