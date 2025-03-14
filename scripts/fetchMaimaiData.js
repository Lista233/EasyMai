const axios = require('axios')
const fs = require('fs')
const path = require('path')

class MaimaiDataFetcher {
  constructor() {
    this.baseUrl = 'https://www.diving-fish.com/api/maimaidxprober'
    this.outputPath = path.join(__dirname, '../static/data/musicData.json')
  }

  /**
   * 获取所有歌曲数据
   * @returns {Promise<Array>}
   */
  async fetchAllSongs() {
    try {
      console.log('开始获取歌曲数据...')
      const response = await axios.get(`${this.baseUrl}/music_data`)
      return response.data
    } catch (error) {
      console.error('获取歌曲数据失败:', error.message)
      throw error
    }
  }

  /**
   * 处理歌曲数据
   * @param {Array} rawData - 原始歌曲数据
   * @returns {Array} - 处理后的歌曲数据
   */
  processSongData(rawData) {
    console.log('处理歌曲数据...')
    return rawData.map(song => ({
      id: song.id.toString(),
      title: song.title,
      type: song.type,
      ds: song.ds,
      level: song.level,
      charts: song.charts.map(chart => ({
        notes: chart.notes || [0, 0, 0, 0, 0],
        charter: chart.charter || ''
      })),
      basic_info: {
        title: song.title,
        artist: song.basic_info?.artist || '',
        genre: song.basic_info?.genre || '',
        bpm: song.basic_info?.bpm || '',
        from: song.basic_info?.from || '',
        is_new: !!song.basic_info?.is_new
      },
      // 添加额外信息
      version: this.getVersionNumber(song.basic_info?.from),
      release_date: song.basic_info?.release_date || '',
      aliases: song.basic_info?.aliases || []
    }))
  }

  /**
   * 获取版本号
   * @param {string} versionString - 版本字符串
   * @returns {number} - 版本号
   */
  getVersionNumber(versionString = '') {
    const versionMap = {
      'maimai': 1,
      'maimai PLUS': 2,
      'maimai GreeN': 3,
      'maimai GreeN PLUS': 4,
      'maimai ORANGE': 5,
      'maimai ORANGE PLUS': 6,
      'maimai PiNK': 7,
      'maimai PiNK PLUS': 8,
      'maimai MURASAKi': 9,
      'maimai MURASAKi PLUS': 10,
      'maimai MiLK': 11,
      'maimai MiLK PLUS': 12,
      'maimai FiNALE': 13,
      'maimai でらっくす': 14,
      'maimai でらっくす PLUS': 15,
      'maimai でらっくす Splash': 16,
      'maimai でらっくす Splash PLUS': 17,
      'maimai でらっくす UNiVERSE': 18,
      'maimai でらっくす UNiVERSE PLUS': 19,
      'maimai でらっくす FESTiVAL': 20,
      'maimai でらっくす FESTiVAL PLUS': 21,
      'maimai でらっくす BUDDiES': 22
    }
    return versionMap[versionString] || 0
  }

  /**
   * 验证数据完整性
   * @param {Array} data - 处理后的数据
   * @returns {boolean} - 是否通过验证
   */
  validateData(data) {
    console.log('验证数据完整性...')
    return data.every(song => {
      const isValid = 
        song.id &&
        song.title &&
        Array.isArray(song.ds) &&
        Array.isArray(song.level) &&
        Array.isArray(song.charts)

      if (!isValid) {
        console.error(`数据验证失败: ${song.id} - ${song.title}`)
      }
      return isValid
    })
  }

  /**
   * 保存数据到文件
   * @param {Array} data - 要保存的数据
   */
  async saveToFile(data) {
    try {
      console.log('保存数据到文件...')
      const dirPath = path.dirname(this.outputPath)
      
      // 确保目录存在
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true })
      }

      // 保存数据
      fs.writeFileSync(
        this.outputPath,
        JSON.stringify(data, null, 2),
        'utf8'
      )
      console.log(`数据已保存到: ${this.outputPath}`)
    } catch (error) {
      console.error('保存数据失败:', error.message)
      throw error
    }
  }

  /**
   * 执行完整的数据获取流程
   */
  async run() {
    try {
      // 获取原始数据
      const rawData = await this.fetchAllSongs()
      console.log(`获取到 ${rawData.length} 首歌曲数据`)

      // 处理数据
      const processedData = this.processSongData(rawData)
      console.log(`处理完成 ${processedData.length} 首歌曲数据`)

      // 验证数据
      if (!this.validateData(processedData)) {
        throw new Error('数据验证失败')
      }

      // 保存数据
      await this.saveToFile(processedData)
      console.log('数据获取和保存完成!')
    } catch (error) {
      console.error('执行失败:', error.message)
      process.exit(1)
    }
  }
}

// 执行脚本
const fetcher = new MaimaiDataFetcher()
fetcher.run() 