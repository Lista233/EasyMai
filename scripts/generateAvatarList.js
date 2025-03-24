// 文件名: generateAvatarList.js
const fs = require('fs');
const path = require('path');

// 配置
const sourceFolder = './static/maiicon'; // 头像文件夹路径
const outputFile = './utils/avatarList.js'; // 输出JS文件路径
const filePattern = /UI_Icon_\d+\.jpg$/; // 文件名匹配模式

// 读取文件夹内容
function generateAvatarList() {
  console.log(`正在读取文件夹: ${sourceFolder}`);
  
  try {
    // 确保源文件夹存在
    if (!fs.existsSync(sourceFolder)) {
      console.error(`错误: 文件夹 ${sourceFolder} 不存在`);
      return;
    }
    
    // 读取文件夹中的所有文件
    const files = fs.readdirSync(sourceFolder);
    
    // 过滤出符合模式的文件
    const avatarFiles = files.filter(file => filePattern.test(file));
    
    // 按文件名排序
    avatarFiles.sort();
    
    // 生成相对路径
    const avatarPaths = avatarFiles.map(file => `../../static/maiicon/${file}`);
    
    // 生成JavaScript代码
    const jsContent = `// 此文件由脚本自动生成，请勿手动修改
// 生成时间: ${new Date().toISOString()}

export const avatarList = ${JSON.stringify(avatarPaths, null, 2)};

export default avatarList;
`;

    // 确保输出目录存在
    const outputDir = path.dirname(outputFile);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // 写入文件
    fs.writeFileSync(outputFile, jsContent);
    
    console.log(`成功生成头像列表文件: ${outputFile}`);
    console.log(`共找到 ${avatarPaths.length} 个头像文件`);
  } catch (error) {
    console.error('生成头像列表时出错:', error);
  }
}

// 执行生成
generateAvatarList();