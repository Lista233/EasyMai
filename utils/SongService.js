class SongService {
  /**
   * @param {Array} songList - 歌曲列表数据
   */
  constructor(songList = []) {
    this.songList = songList
  }

  /**
   * 通过ID获取歌曲信息
   * @param {string} id - 歌曲ID
   * @returns {Object|null} - 返回歌曲信息或null
   */
  getSongById(id) {
    if (!id) return null
    
    // 查找匹配的歌曲
    const song = this.songList.find(song => song.id === id.toString())
    return song || null
  }

  /**
   * 更新歌曲列表
   * @param {Array} newSongList - 新的歌曲列表
   */
  updateSongList(newSongList) {
    if (Array.isArray(newSongList)) {
      this.songList = newSongList
    }
  }

  /**
   * 格式化歌曲数据
   * @param {Object} rawData - 原始歌曲数据
   * @returns {Object} - 格式化后的歌曲数据
   */
  formatSongData(rawData) {
    const difficultyNames = ['Basic', 'Advanced', 'Expert', 'Master', 'Re:Master']
    
    // 处理难度信息
    const difficulties = rawData.ds.map((ds, index) => ({
      name: difficultyNames[index],
      level: rawData.level[index],
      ds: ds,
      notes: rawData.charts[index].notes,
      charter: rawData.charts[index].charter,
      // 计算总note数
      totalNotes: rawData.charts[index].notes.reduce((sum, count) => sum + count, 0)
    }))

    return {
      id: rawData.id,
      title: rawData.title,
      type: rawData.type,
      difficulties,
      // 添加一些辅助方法
      getDifficultyInfo(index) {
        return this.difficulties[index]
      },
      getHighestLevel() {
        return Math.max(...rawData.level.map(Number))
      },
      getNoteTypes(difficultyIndex) {
        const notes = rawData.charts[difficultyIndex].notes
        return {
          tap: notes[0],
          hold: notes[1],
          slide: notes[2],
          break: notes[3]
        }
      }
    }
  }
}

export default SongService

// 使用示例：
/*
const songList = [
  {
    id: "8",
    title: "True Love Song",
    // ... 其他属性
  },
  // ... 其他歌曲
]

const songService = new SongService(songList)
const song = songService.getSongById("8")
*/ 