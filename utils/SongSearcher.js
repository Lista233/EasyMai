class SongSearcher {
  constructor(jsonData) {
    try {
      // 如果传入的是字符串，则解析它
      this.data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
      this.songs = this.data.content || [];
      // 创建ID到歌曲的映射
      this.idMap = new Map(
        this.songs.map(song => [song.SongID.toString(), {
          id: song.SongID.toString(),
          name: song.Name,
          alias: song.Alias || []
        }])
      );
    } catch (error) {
      console.error('JSON解析错误:', error);
      this.songs = [];
      this.idMap = new Map();
    }
  }

  /**
   * 搜索歌曲并返回匹配结果
   * @param {Object} query - 搜索条件
   * @param {string} query.keyword - 搜索关键词
   * @param {boolean} query.exactMatch - 是否精确匹配
   * @returns {Array<Object>} - 返回匹配的ID和匹配信息
   */
  search(query = {}) {
    const {
      keyword,
      exactMatch = false
    } = query;

    if (!keyword) return [];
    
    const searchTerm = keyword.toLowerCase().trim();
    const results = [];
    
    this.idMap.forEach((song, id) => {
      const matchInfo = {
        id: id,
        matchFields: []
      };

      // 检查主名称
      const nameMatch = exactMatch 
        ? song.name.toLowerCase() === searchTerm
        : song.name.toLowerCase().includes(searchTerm);
      
      if (nameMatch) {
        matchInfo.matchFields.push('name');
      }

      // 检查别名
      const aliasMatches = song.alias.filter(alias => {
        return exactMatch 
          ? alias.toLowerCase() === searchTerm
          : alias.toLowerCase().includes(searchTerm);
      });

      if (aliasMatches.length > 0) {
        matchInfo.matchFields.push('alias');
        matchInfo.matchedAliases = aliasMatches;
      }

      // 如果有任何匹配，添加到结果中
      if (matchInfo.matchFields.length > 0) {
        results.push(matchInfo);
      }
    });

    return results;
  }

  /**
   * 获取所有歌曲ID
   * @returns {Array<string>} - 返回所有歌曲ID列表
   */
  getAllIds() {
    return Array.from(this.idMap.keys());
  }

  /**
   * 获取指定ID的别名信息
   * @param {string} id - 歌曲ID
   * @returns {Object|null} - 返回别名信息或null
   */
  getAliasInfo(id) {
    const song = this.idMap.get(id?.toString());
    if (!song) return null;
    
    return {
      id: song.id,
      name: song.name,
      alias: song.alias
    };
  }
}

export default SongSearcher; 