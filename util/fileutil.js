// 添加一个创建目录的辅助函数
function ensureDirectory(dirPath) {
	return new Promise((resolve, reject) => {
		plus.io.requestFileSystem(plus.io.PRIVATE_DOC, (fs) => {
			fs.root.getDirectory(dirPath, {
				create: true  // 如果目录不存在则创建
			}, (dirEntry) => {
				resolve(dirEntry);
			}, (error) => {
				reject('创建目录失败：' + error.message);
			});
		});
	});
}

// 添加一个下载状态追踪器
const downloadingFiles = new Set();

export function downloadFileToDoc(url, filepath) {
	return new Promise(async (resolve, reject) => {
		try {
			// 首先确保目录存在
			await ensureDirectory(filepath);
			
			// 获取下载文件名（从URL中提取）
			const fileName = url.substring(url.lastIndexOf('/') + 1);
			// 指定下载目录为应用私有文档目录下的指定文件夹
			const downloadDir = `_doc/${filepath}/`;
			const fullPath = downloadDir + fileName;
			
			// 创建下载任务
			const dtask = plus.downloader.createDownload(url, {
				filename: fullPath
			}, (d, status) => {
				if (status == 200) {
					// 下载成功
					console.log('下载成功：', d.filename);
					resolve({
						savedFilePath: d.filename,
						localUrl: plus.io.convertLocalFileSystemURL(d.filename)
					});
				} else {
					reject('下载失败，状态码：' + status);
				}
			});
			
			// 启动下载任务
			dtask.start();
			
		} catch(e) {
			console.error('下载异常：', e);
			reject(e);
		}
	});
}

export async function getDirectoryFiles(dirPath) {
	try {
		// 首先确保目录存在
		await ensureDirectory(dirPath);
		
		return new Promise((resolve, reject) => {
			plus.io.requestFileSystem(plus.io.PRIVATE_DOC, (fs) => {
				fs.root.getDirectory(dirPath, {
					create: false  // 这里不需要创建，因为已经确保存在了
				}, (dirEntry) => {
					const directoryReader = dirEntry.createReader();
					directoryReader.readEntries((entries) => {
						// 提取所有文件名到数组
						const fileNames = entries
							.filter(entry => entry.isFile) // 只获取文件，排除子目录
							.map(entry => entry.name);
						resolve(fileNames);
					}, (error) => {
						reject('读取目录失败：' + error.message);
					});
				}, (error) => {
					reject('获取目录失败：' + error.message);
				});
			});
		});
	} catch (error) {
		console.error('处理目录时发生错误：', error);
		return [];  // 如果发生错误，返回空数组
	}
}

export async function ensureFileExists(url, filepath) {
	try {
		// 从URL中获取文件名
		const fileName = String(url).substring(url.lastIndexOf('/') + 1);
		const fullPath = `_doc/${filepath}/${fileName}`;
		
		// 检查目录中是否存在该文件
		const files = await getDirectoryFiles(filepath);
		
		// 确保 files 是数组
		if (!Array.isArray(files)) {
			console.warn('获取到的文件列表不是数组:', files);
			return {
				savedFilePath: fullPath,
				localUrl: url,
				status: 'error'
			};
		}
		
		const fileExists = files.includes(fileName);
		
		if (fileExists) {
			console.log('从本地获取')
			return {
				savedFilePath: fullPath,
				localUrl: plus.io.convertLocalFileSystemURL(fullPath),
				status: 'ready',
					
			};
		} else if (!downloadingFiles.has(fileName)) {
			downloadingFiles.add(fileName);
			
			downloadFileToDoc(url, filepath)
				.then(result => {
				
					console.log('文件下载完成：', result);
					downloadingFiles.delete(fileName);
				})
				.catch(error => {
					console.error('文件下载失败：', error);
					downloadingFiles.delete(fileName);
				});
			
			return {
				savedFilePath: fullPath,
				localUrl: url,
				status: 'downloading'
			};
		} else {
			return {
				savedFilePath: fullPath,
				localUrl: url,
				status: 'downloading'
			};
		}
	} catch (error) {
		console.error('确保文件存在时发生错误：', error);
		return {
			savedFilePath: null,
			localUrl: url,
			status: 'error'
		};
	}
}