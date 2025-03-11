class SongSearcher {
  constructor(jsonData) {
    try {
      // 如果传入的是字符串，则解析它
      this.data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
      this.songs = this.data.content || [];
    } catch (error) {
      console.error('JSON解析错误:', error);
      this.songs = [];
    }
  }

  // 通过别名搜索歌曲
  searchByAlias(keyword) {
    if (!keyword) return [];
    
    keyword = keyword.toLowerCase().trim();
    
    return this.songs.filter(song => {
      // 检查主名称
      if (song.Name.toLowerCase().includes(keyword)) {
        return true;
      }
      
      // 检查别名数组
      return song.Alias.some(alias => 
        alias.toLowerCase().includes(keyword)
      );
    }).map(song => ({
      songId: song.SongID,
      name: song.Name,
      matchedAliases: song.Alias.filter(alias => 
        alias.toLowerCase().includes(keyword)
      )
    }));
  }

  // 精确匹配搜索
  searchByExactAlias(keyword) {
    if (!keyword) return [];
    
    keyword = keyword.toLowerCase().trim();
    
    return this.songs.filter(song => {
      // 检查主名称
      if (song.Name.toLowerCase() === keyword) {
        return true;
      }
      
      // 检查别名数组
      return song.Alias.some(alias => 
        alias.toLowerCase() === keyword
      );
    }).map(song => ({
      songId: song.SongID,
      name: song.Name,
      matchedAliases: song.Alias.filter(alias => 
        alias.toLowerCase() === keyword
      )
    }));
  }

  // 获取所有歌曲
  getAllSongs() {
    return this.songs.map(song => ({
      songId: song.SongID,
      name: song.Name,
      aliases: song.Alias
    }));
  }
}

export default SongSearcher; 