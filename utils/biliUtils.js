/**
 * B站跳转工具类
 */

/**
 * 跳转到B站搜索页面
 * @param {string} keyword - 搜索关键词
 * @param {Object} options - 配置选项
 * @param {boolean} options.showError - 是否显示错误提示，默认true
 * @param {boolean} options.useWebFallback - 未安装APP时是否使用网页版作为备选，默认true
 * @returns {Promise<boolean>} 是否跳转成功
 */
export const openBiliSearch = (keyword, options = {}) => {
  const {
    showError = true,
    useWebFallback = true
  } = options;

  return new Promise((resolve) => {
    if (!keyword?.trim()) {
      if (showError) {
        uni.showToast({
          title: '搜索关键词不能为空',
          icon: 'none'
        });
      }
      resolve(false);
      return;
    }

    const encodedKeyword = encodeURIComponent(keyword.trim());
    // B站搜索的Scheme URL
    const biliScheme = `bilibili://search?keyword=${encodedKeyword}`;
    // 备选网页链接
    const webUrl = `https://search.bilibili.com/all?keyword=${encodedKeyword}`;

    // 尝试打开B站APP
    plus.runtime.openURL(biliScheme, (err) => {
      if (err) {
        if (useWebFallback) {
          // 如果打开失败(未安装B站),提示用户或打开网页版
          uni.showModal({
            title: '提示',
            content: '未检测到哔哩哔哩APP，是否打开网页版?',
            success: (res) => {
              if (res.confirm) {
                plus.runtime.openURL(webUrl);
                resolve(true);
              } else {
                resolve(false);
              }
            }
          });
        } else if (showError) {
          uni.showToast({
            title: '未安装哔哩哔哩APP',
            icon: 'none'
          });
          resolve(false);
        }
      } else {
        resolve(true);
      }
    });
  });
};

/**
 * 跳转到B站用户空间
 * @param {string} uid - B站用户ID
 * @param {Object} options - 配置选项
 * @param {boolean} options.showError - 是否显示错误提示，默认true
 * @param {boolean} options.useWebFallback - 未安装APP时是否使用网页版作为备选，默认true
 * @returns {Promise<boolean>} 是否跳转成功
 */
export const openBiliSpace = (uid, options = {}) => {
  const {
    showError = true,
    useWebFallback = true
  } = options;

  return new Promise((resolve) => {
    if (!uid) {
      if (showError) {
        uni.showToast({
          title: '用户ID不能为空',
          icon: 'none'
        });
      }
      resolve(false);
      return;
    }

    // B站个人空间的Scheme URL
    const biliScheme = `bilibili://space/${uid}`;
    // 备选网页链接
    const webUrl = `https://space.bilibili.com/${uid}`;

    // 尝试打开B站APP
    plus.runtime.openURL(biliScheme, (err) => {
      if (err) {
        if (useWebFallback) {
          uni.showModal({
            title: '提示',
            content: '未检测到哔哩哔哩APP，是否打开网页版?',
            success: (res) => {
              if (res.confirm) {
                plus.runtime.openURL(webUrl);
                resolve(true);
              } else {
                resolve(false);
              }
            }
          });
        } else if (showError) {
          uni.showToast({
            title: '未安装哔哩哔哩APP',
            icon: 'none'
          });
          resolve(false);
        }
      } else {
        resolve(true);
      }
    });
  });
};

/**
 * 跳转到B站视频页面
 * @param {string} bvid - B站视频BV号
 * @param {Object} options - 配置选项
 * @param {boolean} options.showError - 是否显示错误提示，默认true
 * @param {boolean} options.useWebFallback - 未安装APP时是否使用网页版作为备选，默认true
 * @returns {Promise<boolean>} 是否跳转成功
 */
export const openBiliVideo = (bvid, options = {}) => {
  const {
    showError = true,
    useWebFallback = true
  } = options;

  return new Promise((resolve) => {
    if (!bvid?.trim()) {
      if (showError) {
        uni.showToast({
          title: '视频ID不能为空',
          icon: 'none'
        });
      }
      resolve(false);
      return;
    }

    // B站视频页面的Scheme URL
    const biliScheme = `bilibili://video/${bvid.trim()}`;
    // 备选网页链接
    const webUrl = `https://www.bilibili.com/video/${bvid.trim()}`;

    // 尝试打开B站APP
    plus.runtime.openURL(biliScheme, (err) => {
      if (err) {
        if (useWebFallback) {
          uni.showModal({
            title: '提示',
            content: '未检测到哔哩哔哩APP，是否打开网页版?',
            success: (res) => {
              if (res.confirm) {
                plus.runtime.openURL(webUrl);
                resolve(true);
              } else {
                resolve(false);
              }
            }
          });
        } else if (showError) {
          uni.showToast({
            title: '未安装哔哩哔哩APP',
            icon: 'none'
          });
          resolve(false);
        }
      } else {
        resolve(true);
      }
    });
  });
}; 