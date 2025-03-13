class SongService {
  /**
   * @param {Array} songList - 歌曲列表数据
   */
  constructor(songList = []) {
    this.songList = songList
    // 创建ID到歌曲的映射，用于优化查询性能
    this.songMap = new Map(
      songList.map(song => [song.id.toString(), song])
    )
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
   * 根据版本获取歌曲
   * @param {string|Array<string>} version - 版本名称或版本名称数组
   * @param {Object} options - 查询选项
   * @param {boolean} options.exact - 是否进行精确匹配，默认为true
   * @returns {Array} - 返回匹配的歌曲列表
   */
  getSongsByVersion(version, options = {}) {
    const {
      exact = true
    } = options

    // 将单个版本名转换为数组
    const versions = Array.isArray(version) ? version : [version]

    return this.songList.filter(song => {
      const songVersion = song.basic_info?.from?.toLowerCase() || ''
      
      if (exact) {
        // 精确匹配：版本名必须完全相同
        return versions.some(v => songVersion === v.toLowerCase())
      } else {
        // 模糊匹配：版本名包含搜索词即可
        return versions.some(v => songVersion.includes(v.toLowerCase()))
      }
    }).map(song => ({
      id: song.id,
      title: song.title,
      version: song.basic_info?.from || '',
      ds: song.ds,
      level: song.level,
      basic_info: song.basic_info
    }))
  }

  /**
   * 根据ds范围获取歌曲
   * @param {Object} dsRange - ds范围对象
   * @param {number} dsRange.min - 最小定数值
   * @param {number} dsRange.max - 最大定数值
   * @param {Object} options - 查询选项
   * @param {number} options.difficulty - 指定难度等级(0-4)，不指定则搜索所有难度
   * @param {boolean} options.includeEqual - 是否包含等于边界值的情况，默认为true
   * @returns {Array} - 返回匹配的歌曲列表
   */
  getSongsByDs(dsRange, options = {}) {
    const {
      min = 0,
      max = Infinity
    } = dsRange

    const {
      difficulty = null,
      includeEqual = true
    } = options

    return this.songList.filter(song => {
      // 如果指定了难度，只检查该难度的ds
      if (difficulty !== null && difficulty >= 0 && difficulty < song.ds.length) {
        const targetDs = song.ds[difficulty]
        return includeEqual 
          ? targetDs >= min && targetDs <= max
          : targetDs > min && targetDs < max
      }

      // 否则检查所有难度
      return song.ds.some(currentDs => {
        return includeEqual 
          ? currentDs >= min && currentDs <= max
          : currentDs > min && currentDs < max
      })
    }).map(song => ({
      id: song.id,
      title: song.title,
      ds: song.ds,
      level: song.level,
      matchingDifficulties: song.ds.map((currentDs, index) => ({
        difficulty: index,
        ds: currentDs,
        level: song.level[index],
        matches: includeEqual 
          ? currentDs >= min && currentDs <= max
          : currentDs > min && currentDs < max
      })).filter(diff => diff.matches)
    }))
  }

  /**
   * 根据歌曲类型获取歌曲
   * @param {string|Array<string>} genre - 歌曲类型或类型数组
   * @param {Object} options - 查询选项
   * @param {boolean} options.exact - 是否进行精确匹配，默认为true
   * @returns {Array} - 返回匹配的歌曲列表
   */
  getSongsByGenre(genre, options = {}) {
    const {
      exact = true
    } = options

    // 将单个类型转换为数组
    const genres = Array.isArray(genre) ? genre : [genre]

    return this.songList.filter(song => {
      const songGenre = song.basic_info?.genre?.toLowerCase() || ''
      
      if (exact) {
        // 精确匹配：类型必须完全相同
        return genres.some(g => songGenre === g.toLowerCase())
      } else {
        // 模糊匹配：类型包含搜索词即可
        return genres.some(g => songGenre.includes(g.toLowerCase()))
      }
    })
  }

  /**
   * 组合查询：同时按版本、定数范围和类型搜索
   * @param {Object} query - 查询条件
   * @param {string|Array<string>} query.version - 版本名称或版本名称数组
   * @param {Object} query.dsRange - 定数范围
   * @param {number} query.dsRange.min - 最小定数值
   * @param {number} query.dsRange.max - 最大定数值
   * @param {string|Array<string>} query.genre - 歌曲类型或类型数组
   * @param {Object} options - 查询选项
   * @param {boolean} options.exactVersion - 是否进行版本精确匹配，默认为true
   * @param {boolean} options.exactGenre - 是否进行类型精确匹配，默认为true
   * @param {number} options.difficulty - 指定难度等级(0-4)，不指定则搜索所有难度
   * @param {boolean} options.includeEqual - 是否包含等于边界值的情况，默认为true
   * @returns {Array} - 返回匹配的歌曲列表
   */
  searchSongs(query, options = {}) {
    const {
      version,
      dsRange,
      genre
    } = query

    const {
      exactVersion = true,
      exactGenre = true,
      difficulty = null,
      includeEqual = true
    } = options

    // 先按版本筛选
    let results = version ? this.getSongsByVersion(version, { exact: exactVersion }) : this.songList

    // 过滤掉ID大于五位数的歌曲
    results = results.filter(song => {
      const songId = String(song.id)
      return songId.length <= 5
    })

    // 如果有类型条件，继续筛选
    if (genre) {
      results = results.filter(song => {
        const songGenre = song.basic_info?.genre?.toLowerCase() || ''
        const genres = Array.isArray(genre) ? genre : [genre]
        
        if (exactGenre) {
          return genres.some(g => songGenre === g.toLowerCase())
        } else {
          return genres.some(g => songGenre.includes(g.toLowerCase()))
        }
      })
    }

    // 如果有定数范围，继续筛选
    if (dsRange) {
      const { min = 0, max = Infinity } = dsRange
      
      results = results.filter(song => {
        if (difficulty !== null && difficulty >= 0 && difficulty < song.ds.length) {
          const targetDs = song.ds[difficulty]
          return includeEqual 
            ? targetDs >= min && targetDs <= max
            : targetDs > min && targetDs < max
        }

        return song.ds.some(currentDs => {
          return includeEqual 
            ? currentDs >= min && currentDs <= max
            : currentDs > min && currentDs < max
        })
      })
    }

    return results
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

  /**
   * 通过ID列表批量获取歌曲信息
   * @param {Array<string>} ids - 歌曲ID列表
   * @param {Object} options - 查询选项
   * @param {boolean} options.keepOrder - 是否保持返回结果与输入ID列表顺序一致，默认为true
   * @param {boolean} options.skipInvalid - 是否跳过无效的ID，默认为true
   * @returns {Array} - 返回匹配的歌曲列表
   */
  getSongsByIds(ids, options = {}) {
    const {
      keepOrder = true,
      skipInvalid = true
    } = options

    if (!Array.isArray(ids)) {
      return []
    }

    // 将所有ID转换为字符串
    const normalizedIds = ids.map(id => id.toString())

    if (keepOrder) {
      // 保持原始顺序
      return normalizedIds
        .map(id => this.songMap.get(id))
        .filter(song => skipInvalid ? song != null : true)
    } else {
      // 不需要保持顺序时，直接从Map中获取
      const results = []
      for (const id of normalizedIds) {
        const song = this.songMap.get(id)
        if (song || !skipInvalid) {
          results.push(song)
        }
      }
      return results
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