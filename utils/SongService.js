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
      if (difficulty !== null && difficulty >= 0) {
        // 特别处理Re:Master难度(索引4)
        if (difficulty === 4 && (!song.ds || song.ds.length <= 4 || song.level[4] === "-")) {
          return false; // 歌曲没有Re:Master难度，直接排除
        }
        
        // 确保难度索引在有效范围内
        if (difficulty >= song.ds.length) {
          return false;
        }
        
        const targetDs = song.ds[difficulty];
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
    }).map(song => {
      // 找出所有匹配的难度
      const matchingDifficulties = song.ds.map((currentDs, index) => ({
        difficulty: index,
        ds: currentDs,
        level: song.level[index],
        matches: includeEqual 
          ? currentDs >= min && currentDs <= max
          : currentDs > min && currentDs < max
      })).filter(diff => diff.matches);
      
      // 选择索引最高的匹配难度
      const highestMatchingDifficulty = matchingDifficulties.length > 0 
        ? matchingDifficulties.reduce((prev, current) => 
            prev.difficulty > current.difficulty ? prev : current
          ) 
        : null;
      
      return {
        id: song.id,
        title: song.title,
        ds: song.ds,
        level: song.level,
        matchingDifficulties: matchingDifficulties,
        // 添加最高匹配难度
        highestMatchingDifficulty: highestMatchingDifficulty
      }
    })
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

    // 定义类型映射关系
    const genreMapping = {
      'niconico & VOCALOID': ['niconico & VOCALOID', 'niconicoボーカロイド'],
      '流行&动漫': ['流行&动漫', 'POPSアニメ'],
      '舞萌': ['舞萌', 'maimai'],
      '音击&中二节奏': ['音击&中二节奏', 'オンゲキCHUNITHM'],
      '东方Project': ['东方Project', '東方Project'],
      '其他游戏': ['其他游戏', 'ゲームバラエティ'],
    }

    return this.songList.filter(song => {
      const songGenre = song.basic_info?.genre || ''
      
      return genres.some(g => {
        // 获取映射的类型数组
        const mappedGenres = genreMapping[g] || [g]
        
        if (exact) {
          // 精确匹配：类型必须完全相同
          return mappedGenres.some(mg => songGenre === mg)
        } else {
          // 模糊匹配：类型包含搜索词即可
          return mappedGenres.some(mg => songGenre.includes(mg))
        }
      })
    })
  }

  /**
   * 根据谱师名称搜索歌曲
   * @param {string|Array<string>} charter - 谱师名称或谱师名称数组
   * @param {Object} options - 查询选项
   * @param {boolean} options.exact - 是否进行精确匹配，默认为true
   * @param {number} options.difficulty - 指定难度等级(0-4)，不指定则搜索所有难度
   * @returns {Array} - 返回匹配的歌曲列表
   */
  getSongsByCharter(charter, options = {}) {
    const {
      exact = true,
      difficulty = null
    } = options

    // 将单个谱师名称转换为数组
    const charters = Array.isArray(charter) ? charter : [charter]

    return this.songList.filter(song => {
      // 如果指定了难度，只检查该难度的谱师
      if (difficulty !== null && difficulty >= 0 && difficulty < song.charts.length) {
        const targetCharter = song.charts[difficulty]?.charter?.toLowerCase() || ''
        
        if (exact) {
          // 精确匹配：谱师名称必须完全相同
          return charters.some(c => targetCharter === c.toLowerCase())
        } else {
          // 模糊匹配：谱师名称包含搜索词即可
          return charters.some(c => targetCharter.includes(c.toLowerCase()))
        }
      }

      // 否则检查所有难度的谱师
      return song.charts.some(chart => {
        const chartCharter = chart?.charter?.toLowerCase() || ''
        
        if (exact) {
          // 精确匹配：谱师名称必须完全相同
          return charters.some(c => chartCharter === c.toLowerCase())
        } else {
          // 模糊匹配：谱师名称包含搜索词即可
          return charters.some(c => chartCharter.includes(c.toLowerCase()))
        }
      })
    }).map(song => {
      // 返回歌曲信息和匹配的难度
      return {
        id: song.id,
        title: song.title,
        ds: song.ds,
        level: song.level,
        basic_info: song.basic_info,
        matchingDifficulties: song.charts.map((chart, index) => {
          const chartCharter = chart?.charter?.toLowerCase() || ''
          const matches = charters.some(c => 
            exact ? chartCharter === c.toLowerCase() : chartCharter.includes(c.toLowerCase())
          )
          
          return {
            difficulty: index,
            ds: song.ds[index],
            level: song.level[index],
            charter: chart?.charter || '',
            matches: matches
          }
        }).filter(diff => diff.matches)
      }
    })
  }

  /**
   * 根据艺术家名称搜索歌曲
   * @param {string|Array<string>} artist - 艺术家名称或艺术家名称数组
   * @param {Object} options - 查询选项
   * @param {boolean} options.exact - 是否进行精确匹配，默认为true
   * @returns {Array} - 返回匹配的歌曲列表
   */
  getSongsByArtist(artist, options = {}) {
    const {
      exact = true
    } = options

    // 将单个艺术家名称转换为数组
    const artists = Array.isArray(artist) ? artist : [artist]

    return this.songList.filter(song => {
      // 获取艺术家信息
      const songArtist = song.basic_info?.artist?.toLowerCase() || ''
      
      if (exact) {
        // 精确匹配：艺术家名称必须完全相同
        return artists.some(a => songArtist === a.toLowerCase())
      } else {
        // 模糊匹配：艺术家名称包含搜索词即可
        return artists.some(a => songArtist.includes(a.toLowerCase()))
      }
    }).map(song => ({
      id: song.id,
      title: song.title,
      ds: song.ds,
      level: song.level,
      basic_info: song.basic_info,
      // 添加匹配的艺术家信息
      matchedArtist: song.basic_info?.artist || ''
    }))
  }

  /**
   * 根据BPM范围获取歌曲
   * @param {Object} bpmRange - BPM范围对象
   * @param {number} bpmRange.min - 最小BPM值
   * @param {number} bpmRange.max - 最大BPM值
   * @param {Object} options - 查询选项
   * @param {boolean} options.includeEqual - 是否包含等于边界值的情况，默认为true
   * @returns {Array} - 返回匹配的歌曲列表
   */
  getSongsByBpm(bpmRange, options = {}) {
    const {
      min = 0,
      max = Infinity
    } = bpmRange

    const {
      includeEqual = true
    } = options

    return this.songList.filter(song => {
      // 获取歌曲BPM
      const bpm = song.basic_info?.bpm ? parseFloat(song.basic_info.bpm) : null
      
      // 如果歌曲没有BPM信息，则跳过
      if (bpm === null) return false
      
      // 根据includeEqual选项决定是否包含边界值
      return includeEqual 
        ? bpm >= min && bpm <= max
        : bpm > min && bpm < max
    }).map(song => ({
      id: song.id,
      title: song.title,
      ds: song.ds,
      level: song.level,
      basic_info: song.basic_info,
      bpm: song.basic_info?.bpm || null
    }))
  }

  /**
   * 更新组合查询方法，添加BPM筛选支持
   * @param {Object} query - 查询条件
   * @param {string|Array<string>} query.version - 版本名称或版本名称数组
   * @param {Object} query.dsRange - 定数范围
   * @param {string|Array<string>} query.genre - 歌曲类型或类型数组
   * @param {string|Array<string>} query.charter - 谱师名称或谱师名称数组
   * @param {string|Array<string>} query.artist - 艺术家名称或艺术家名称数组
   * @param {Object} query.bpmRange - BPM范围
   * @param {Object} options - 查询选项
   * @returns {Array} - 返回匹配的歌曲列表
   */
  searchSongs(query, options = {}) {
    const {
      version,
      dsRange,
      genre,
      charter,
      artist,
      bpmRange  // 添加BPM范围参数
    } = query

    const {
      exactVersion = true,
      exactGenre = true,
      exactCharter = false,
      exactArtist = false,
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

    // 如果有谱师条件，继续筛选
    if (charter) {
      results = results.filter(song => {
        const charters = Array.isArray(charter) ? charter : [charter]
        
        // 如果指定了难度，只检查该难度的谱师
        if (difficulty !== null && difficulty >= 0 && difficulty < song.charts.length) {
          const targetCharter = song.charts[difficulty]?.charter?.toLowerCase() || ''
          
          if (exactCharter) {
            return charters.some(c => targetCharter === c.toLowerCase())
          } else {
            return charters.some(c => targetCharter.includes(c.toLowerCase()))
          }
        }
        
        // 否则检查所有难度的谱师
        return song.charts.some(chart => {
          const chartCharter = chart?.charter?.toLowerCase() || ''
          
          if (exactCharter) {
            return charters.some(c => chartCharter === c.toLowerCase())
          } else {
            return charters.some(c => chartCharter.includes(c.toLowerCase()))
          }
        })
      })
    }
    
    // 如果有艺术家条件，继续筛选
    if (artist) {
      results = results.filter(song => {
        const songArtist = song.basic_info?.artist?.toLowerCase() || ''
        const artists = Array.isArray(artist) ? artist : [artist]
        
        if (exactArtist) {
          return artists.some(a => songArtist === a.toLowerCase())
        } else {
          return artists.some(a => songArtist.includes(a.toLowerCase()))
        }
      })
    }

    // 如果有BPM范围条件，继续筛选
    if (bpmRange && (bpmRange.min !== undefined || bpmRange.max !== undefined)) {
      results = results.filter(song => {
        const bpm = song.basic_info?.bpm ? parseFloat(song.basic_info.bpm) : null
        
        // 如果歌曲没有BPM信息，则跳过
        if (bpm === null) return false
        
        const min = bpmRange.min !== undefined ? bpmRange.min : 0
        const max = bpmRange.max !== undefined ? bpmRange.max : Infinity
        
        // 根据includeEqual选项决定是否包含边界值
        return includeEqual 
          ? bpm >= min && bpm <= max
          : bpm > min && bpm < max
      })
    }

    // 如果有定数范围条件，继续筛选
    if (dsRange && (dsRange.min !== undefined || dsRange.max !== undefined)) {
      results = results.filter(song => {
        const min = dsRange.min !== undefined ? dsRange.min : 0
        const max = dsRange.max !== undefined ? dsRange.max : Infinity
        
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

  /**
   * 根据ds范围获取歌曲难度信息的映射
   * @param {Object} dsRange - ds范围对象
   * @param {number} dsRange.min - 最小定数值
   * @param {number} dsRange.max - 最大定数值
   * @param {Object} options - 查询选项
   * @param {boolean} options.includeEqual - 是否包含等于边界值的情况，默认为true
   * @returns {Array} - 返回歌曲难度信息的数组
   */
  getDifficultiesByDsRange(dsRange, options = {}) {
    const {
      min = 0,
      max = Infinity
    } = dsRange;

    const {
      includeEqual = true
    } = options;

    const results = [];

    // 遍历所有歌曲
    this.songList.forEach(song => {
      // 检查所有难度
      song.ds.forEach((currentDs, difficultyIndex) => {
        // 检查定数是否在范围内
        const inRange = includeEqual 
          ? currentDs >= min && currentDs <= max
          : currentDs > min && currentDs < max;
        
        if (inRange) {
          // 添加到结果集
          results.push({
            songId: song.id,
            difficulty: difficultyIndex,
            ds: currentDs,
            level: song.level[difficultyIndex],
            title: song.title,
            // 仅包含基本信息，不包含charts
            basic_info: song.basic_info || {}
          });
        }
      });
    });

    return results;
  }

  /**
   * 综合搜索：一次遍历完成所有筛选条件的匹配
   * @param {Object} query - 查询条件
   * @param {string|Array<string>} query.version - 版本名称或版本名称数组
   * @param {Object} query.dsRange - 定数范围
   * @param {string|Array<string>} query.genre - 歌曲类型或类型数组
   * @param {string|Array<string>} query.charter - 谱师名称或谱师名称数组
   * @param {string|Array<string>} query.artist - 艺术家名称或艺术家名称数组
   * @param {Object} query.bpmRange - BPM范围
   * @param {string} query.keyword - 关键词搜索（歌曲名称）
   * @param {Object} options - 查询选项
   * @param {boolean} options.exactVersion - 是否进行版本精确匹配，默认为true
   * @param {boolean} options.exactGenre - 是否进行类型精确匹配，默认为true
   * @param {boolean} options.exactCharter - 是否进行谱师精确匹配，默认为false
   * @param {boolean} options.exactArtist - 是否进行艺术家精确匹配，默认为false
   * @param {boolean} options.exactKeyword - 是否进行关键词精确匹配，默认为false
   * @param {number} options.difficulty - 指定难度等级(0-4)，不指定则搜索所有难度
   * @param {boolean} options.includeEqual - 是否包含等于边界值的情况，默认为true
   * @returns {Array} - 返回匹配的歌曲列表，包含匹配的难度索引
   */
  searchSongsOptimized(query, options = {}) {
    const {
      version,
      dsRange,
      genre,
      charter,
      artist,
      bpmRange,
      keyword
    } = query;

    const {
      exactVersion = true,
      exactGenre = true,
      exactCharter = false,
      exactArtist = false,
      exactKeyword = false,
      difficulty = null,
      includeEqual = true
    } = options;

    // 过滤掉ID大于五位数的歌曲
    const results = this.songList.filter(song => {
      // 检查ID长度
      const songId = String(song.id);
      if (songId.length > 5) return false;

      // 匹配的难度索引数组
      let matchedDifficulties = [];
      
      // 1. 检查版本
      if (version) {
        const songVersion = song.basic_info?.from?.toLowerCase() || '';
        const versions = Array.isArray(version) ? version : [version];
        
        const versionMatch = exactVersion
          ? versions.some(v => songVersion === v.toLowerCase())
          : versions.some(v => songVersion.includes(v.toLowerCase()));
        
        if (!versionMatch) return false;
      }
      
      // 2. 检查类型
      if (genre) {
        const songGenre = song.basic_info?.genre?.toLowerCase() || ''
        const genres = Array.isArray(genre) ? genre : [genre]
        
        // 定义类型映射关系
        const genreMapping = {
          'niconico & VOCALOID': ['niconico & VOCALOID', 'niconicoボーカロイド'],
          '流行&动漫': ['流行&动漫', 'POPSアニメ'],
          '舞萌': ['舞萌', 'maimai'],
          '音击&中二节奏': ['音击&中二节奏', 'オンゲキCHUNITHM']
        }
        
        const genreMatch = genres.some(g => {
          const mappedGenres = genreMapping[g] || [g]
          const lowercaseMappedGenres = mappedGenres.map(mg => mg.toLowerCase())
          
          return exactGenre
            ? lowercaseMappedGenres.some(mg => songGenre === mg)
            : lowercaseMappedGenres.some(mg => songGenre.includes(mg))
        })
        
        if (!genreMatch) return false
      }
      
      // 3. 检查艺术家
      if (artist) {
        const songArtist = song.basic_info?.artist?.toLowerCase() || '';
        const artists = Array.isArray(artist) ? artist : [artist];
        
        const artistMatch = exactArtist
          ? artists.some(a => songArtist === a.toLowerCase())
          : artists.some(a => songArtist.includes(a.toLowerCase()));
        
        if (!artistMatch) return false;
      }
      
      // 4. 检查BPM范围
      if (bpmRange && (bpmRange.min !== undefined || bpmRange.max !== undefined)) {
        const bpm = song.basic_info?.bpm ? parseFloat(song.basic_info.bpm) : null;
        
        // 如果歌曲没有BPM信息，则跳过
        if (bpm === null) return false;
        
        const min = bpmRange.min !== undefined ? bpmRange.min : 0;
        const max = bpmRange.max !== undefined ? bpmRange.max : Infinity;
        
        const bpmMatch = includeEqual
          ? bpm >= min && bpm <= max
          : bpm > min && bpm < max;
        
        if (!bpmMatch) return false;
      }
      
      // 5. 检查关键词（歌曲名称）
      if (keyword) {
        const songTitle = song.title?.toLowerCase() || '';
        const keywordLower = keyword.toLowerCase();
        
        const keywordMatch = exactKeyword
          ? songTitle === keywordLower
          : songTitle.includes(keywordLower);
        
        if (!keywordMatch) return false;
      }
      
      // 6. 检查谱师和定数范围（需要按难度检查）
      // 如果指定了难度，只检查该难度
      if (difficulty !== null && difficulty >= 0) {
        // 检查歌曲是否有指定的难度
        // 特别处理Re:Master难度(索引4)
        if (difficulty === 4 && (!song.ds || song.ds.length <= 4 || song.level[4] === "-")) {
          return false; // 歌曲没有Re:Master难度，直接排除
        }
        
        // 确保难度索引在有效范围内
        if (difficulty >= song.charts?.length) {
          return false;
        }
        
        let difficultyMatched = true;
        
        // 检查谱师
        if (charter) {
          const targetCharter = song.charts[difficulty]?.charter?.toLowerCase() || '';
          const charters = Array.isArray(charter) ? charter : [charter];
          
          const charterMatch = exactCharter
            ? charters.some(c => targetCharter === c.toLowerCase())
            : charters.some(c => targetCharter.includes(c.toLowerCase()));
          
          if (!charterMatch) difficultyMatched = false;
        }
        
        // 检查定数范围
        if (dsRange && (dsRange.min !== undefined || dsRange.max !== undefined) && difficultyMatched) {
          // 确保该难度的定数存在
          if (!song.ds || !song.ds[difficulty]) {
            return false;
          }
          
          const targetDs = song.ds[difficulty];
          const min = dsRange.min !== undefined ? dsRange.min : 0;
          const max = dsRange.max !== undefined ? dsRange.max : Infinity;
          
          const dsMatch = includeEqual
            ? targetDs >= min && targetDs <= max
            : targetDs > min && targetDs < max;
          
          if (!dsMatch) difficultyMatched = false;
        }
        
        if (difficultyMatched) {
          matchedDifficulties.push(difficulty);
        }
      } else {
        // 否则检查所有难度
        for (let i = 0; i < song.charts?.length; i++) {
          let difficultyMatched = true;
          
          // 检查谱师
          if (charter) {
            const chartCharter = song.charts[i]?.charter?.toLowerCase() || '';
            const charters = Array.isArray(charter) ? charter : [charter];
            
            const charterMatch = exactCharter
              ? charters.some(c => chartCharter === c.toLowerCase())
              : charters.some(c => chartCharter.includes(c.toLowerCase()));
            
            if (!charterMatch) difficultyMatched = false;
          }
          
          // 检查定数范围
          if (dsRange && (dsRange.min !== undefined || dsRange.max !== undefined) && difficultyMatched) {
            const currentDs = song.ds[i];
            const min = dsRange.min !== undefined ? dsRange.min : 0;
            const max = dsRange.max !== undefined ? dsRange.max : Infinity;
            
            const dsMatch = includeEqual
              ? currentDs >= min && currentDs <= max
              : currentDs > min && currentDs < max;
            
            if (!dsMatch) difficultyMatched = false;
          }
          
          if (difficultyMatched) {
            matchedDifficulties.push(i);
          }
        }
      }
      
      // 如果有谱师或定数条件但没有匹配的难度，则不返回该歌曲
      if ((charter || (dsRange && (dsRange.min !== undefined || dsRange.max !== undefined))) && matchedDifficulties.length === 0) {
        return false;
      }
      
      // 添加匹配的难度索引到歌曲对象
      song.matchedDifficulties = matchedDifficulties;
      
      // 如果有匹配的难度，选择索引最高的作为默认匹配难度
      // 如果没有特定匹配的难度（例如只匹配了版本或艺术家），则默认选择Master难度(3)或最高可用难度
      if (matchedDifficulties.length > 0) {
        song.matchedDifficulty = Math.max(...matchedDifficulties);
      } else {
        song.matchedDifficulty = Math.min(3, song.charts?.length - 1 || 0);
      }
      
      return true;
    });

    return results;
  }

  /**
   * 根据关键词搜索歌曲（名称、谱师、艺术家）并返回匹配的难度
   * @param {string} keyword - 搜索关键词
   * @param {Object} options - 搜索选项
   * @param {boolean} options.exact - 是否精确匹配，默认为false
   * @param {number} options.defaultDifficulty - 默认难度，当匹配项不是特定难度时使用，默认为3
   * @returns {Array} - 返回匹配的歌曲列表，包含匹配的难度索引
   */
  searchByKeyword(keyword, options = {}) {
    const {
      exact = false,
      defaultDifficulty = 3
    } = options;
    
    if (!keyword || typeof keyword !== 'string') {
      return [];
    }
    
    const keywordLower = keyword.toLowerCase().trim();
    
    return this.songList.filter(song => {
      // 过滤掉ID大于五位数的歌曲
      const songId = String(song.id);
      if (songId.length > 5) return false;
      
      let matched = false;
      let matchType = '';
      let matchedDifficulties = [];
      
      // 1. 检查歌曲名称
      const songTitle = song.title?.toLowerCase() || '';
      if (exact ? songTitle === keywordLower : songTitle.includes(keywordLower)) {
        matched = true;
        matchType = 'title';
      }
      
      // 2. 检查艺术家
      if (!matched && song.basic_info?.artist) {
        const artist = song.basic_info.artist.toLowerCase();
        if (exact ? artist === keywordLower : artist.includes(keywordLower)) {
          matched = true;
          matchType = 'artist';
        }
      }
      
      // 3. 检查谱师（需要遍历所有难度）
      if (!matched && song.charts) {
        for (let i = 0; i < song.charts.length; i++) {
          if (song.charts[i]?.charter) {
            const charter = song.charts[i].charter.toLowerCase();
            if (exact ? charter === keywordLower : charter.includes(keywordLower)) {
              matched = true;
              matchType = 'charter';
              matchedDifficulties.push(i); // 记录匹配的难度索引
            }
          }
        }
      }
      
      if (matched) {
        // 添加匹配信息到歌曲对象
        song.matchType = matchType;
        
        // 如果是谱师匹配且有多个匹配难度，选择索引最高的
        if (matchType === 'charter' && matchedDifficulties.length > 0) {
          song.matchedDifficulty = Math.max(...matchedDifficulties);
        } else {
          // 对于标题或艺术家匹配，使用默认难度
          song.matchedDifficulty = defaultDifficulty;
        }
        
        return true;
      }
      
      return false;
    });
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