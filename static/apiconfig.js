export const remoteRoute='https://mai.lista233.cn';
export const aliasRoute='https://api.yuzuchan.moe/maimaidx/maimaidxalias'
export const divingFishRoute = 'https://www.diving-fish.com';
export const h5ProxyRoute = '/h5api';
export const version = '20250330';
export const apiversion = '20250330';
export const ProxyRoute = 'http://localhost:3000';

export const proxyConfig = {
  baseUrl: 'https://proxy.lista233.cn',//远程地址
  
  getProxyUrl() {
    return (
      (typeof process !== 'undefined' && process.env && process.env.VUE_APP_PROXY_URL) ||
      (getApp() && getApp().globalData && getApp().globalData.proxyUrl) ||
      uni.getStorageSync('proxyUrl') ||
      this.baseUrl
    );
  },
  
  getApiUrl(endpoint) {
    return `${this.getProxyUrl()}${endpoint}`;
  }
};