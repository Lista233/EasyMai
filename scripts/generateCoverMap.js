const fs = require('fs');
const path = require('path');

// maicover 目录路径（相对于脚本位置）
const COVER_DIR = '../static/maicover';
// 输出文件路径
const OUTPUT_FILE = '../utils/maiCoverData.js';

try {
    // 读取 maicover 目录
    const files = fs.readdirSync(path.join(__dirname, COVER_DIR));
    
    // 创建映射对象
    const coverMap = {};
    
    // 处理每个文件
    files.forEach(file => {
        // 只处理 jpg 文件
        if (file.endsWith('.jpg')) {
            // 直接使用完整文件名
            coverMap[file] = true;
        }
    });
    
    // 生成输出内容
    const output = `// 此文件由脚本自动生成，请勿手动修改
// 生成时间：${new Date().toLocaleString()}

// maicover 文件名映射对象（包含后缀）
export const maiCoverMap = ${JSON.stringify(coverMap, null, 2)};

/**
 * 检查歌曲封面文件是否存在
 * @param {string} filename 文件名（需包含.jpg后缀）
 * @returns {boolean} 是否存在封面
 */
export function hasCover(filename) {
    return !!maiCoverMap[filename];
}
`;
    
    // 写入文件
    fs.writeFileSync(path.join(__dirname, OUTPUT_FILE), output);
    
    console.log('生成成功！文件已保存到:', OUTPUT_FILE);
    console.log('共处理封面数量:', Object.keys(coverMap).length);
    
} catch (error) {
    console.error('生成失败:', error);
} 