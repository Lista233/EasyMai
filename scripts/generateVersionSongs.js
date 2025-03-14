const axios = require('axios')
const fs = require('fs')
const path = require('path')

class VersionSongGenerator {
  constructor() {
    this.baseUrl = 'https://www.diving-fish.com/api/maimaidxprober'
    this.outputPath = path.join(__dirname, '../static/data/versionSongs.json')
    
    // 版本映射配置
    this.versionMap = {
      'maimai': 'maimai',
      'maimai PLUS': 'maimai PLUS',
      'maimai GreeN': 'maimai GreeN',
      'maimai GreeN PLUS': 'maimai GreeN PLUS',
      'maimai ORANGE': 'maimai ORANGE',
      'maimai ORANGE PLUS': 'maimai ORANGE PLUS',
      'maimai PiNK': 'maimai PiNK',
      'maimai PiNK PLUS': 'maimai PiNK PLUS',
      'maimai MURASAKi': 'maimai MURASAKi',
      'maimai MURASAKi PLUS': 'maimai MURASAKi PLUS',
      'maimai MiLK': 'maimai MiLK',
      'maimai MiLK PLUS': 'maimai MiLK PLUS',
      'maimai FiNALE': 'maimai FiNALE',
      'maimai でらっくす': 'maimai でらっくす',
      'maimai でらっくす PLUS': 'maimai でらっくす PLUS',
      'maimai でらっくす Splash': 'maimai でらっくす Splash',
      'maimai でらっくす Splash PLUS': 'maimai でらっくす Splash PLUS',
      'maimai でらっくす UNiVERSE': 'maimai でらっくす UNiVERSE',
      'maimai でらっくす UNiVERSE PLUS': 'maimai でらっくす UNiVERSE PLUS',
      'maimai でらっくす FESTiVAL': 'maimai でらっくす FESTiVAL',
      'maimai でらっくす FESTiVAL PLUS': 'maimai でらっくす FESTiVAL PLUS',
      'maimai でらっくす BUDDiES': 'maimai でらっくす BUDDiES'
    }
  }

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

  processVersionSongs(rawData) {
    console.log('按版本处理歌曲数据...')
    const versionSongs = {}

    // 初始化所有版本的空数组
    Object.values(this.versionMap).forEach(version => {
      versionSongs[version] = []
    })

    // 处理每首歌曲
    rawData.forEach(song => {
      const version = song.basic_info?.from || '未知版本'
      if (this.versionMap[version]) {
        versionSongs[this.versionMap[version]].push({
          songTitle: song.title,
          songId: song.id.toString(),
          songUrl: ['', '', '', '', ''] // 5个空字符串占位
        })
      }
    })

    return versionSongs
  }

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

  async run() {
    try {
      // 获取原始数据
      const rawData = await this.fetchAllSongs()
      console.log(`获取到 ${rawData.length} 首歌曲数据`)

      // 按版本处理数据
      const versionSongs = this.processVersionSongs(rawData)
      
      // 保存数据
      await this.saveToFile(versionSongs)
      console.log('数据生成和保存完成!')
      
      // 输出每个版本的歌曲数量
      Object.entries(versionSongs).forEach(([version, songs]) => {
        console.log(`${version}: ${songs.length} 首歌曲`)
      })
    } catch (error) {
      console.error('执行失败:', error.message)
      process.exit(1)
    }
  }
}

// 执行脚本
const generator = new VersionSongGenerator()
generator.run() 