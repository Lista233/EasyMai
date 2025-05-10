export const remoteRoute='https://mai.lista233.cn';
export const aliasRoute='https://api.yuzuchan.moe/maimaidx/maimaidxalias'
export const divingFishRoute = 'https://www.diving-fish.com';
export const h5ProxyRoute = '/h5api';
export const version = '20250410';
export const apiversion = '20250410';
export const ProxyRoute = 'https://proxy.lista233.cn';
export const statsRoute ='https://mai.lista233.cn';
export const ProxyDivingFishRoute='https://test-proxy.lista233.cn';
export const proxyConfig = {
  baseUrl: 'https://proxy.lista233.cn',//远程地址
  
  getProxyUrl() {
    return (
      this.baseUrl
    );
  },
  
  getApiUrl(endpoint) {
    return `${this.getProxyUrl()}${endpoint}`;
  }
};