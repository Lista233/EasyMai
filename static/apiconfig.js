// export const remoteRoute='http://192.168.125.148:25441';
export const remoteRoute='https://mai.lista233.cn';

export const aliasRoute='https://api.yuzuchan.moe/maimaidx/maimaidxalias'

export const divingFishRoute = 'https://www.diving-fish.com';

export const h5ProxyRoute = '/h5api';

export const version = '20250613';

export const apiversion = '20250613';

export const ProxyRoute = 'https://proxy.lista233.cn';

export const statsRoute ='https://stats.lista233.cn';

export const ProxyDivingFishRoute='https://proxy.lista233.cn';

export const AnnouncementsRoute = 'https://oss.lista233.cn/announcements.json'

export const VersionRoute='https://oss.lista233.cn/version.json';

export const MusicDataRoute='https://oss.lista233.cn/music.json'

export const AliasDataRoute='https://oss.lista233.cn/alias.json'

export const ChartStatsRoute='https://oss.lista233.cn/chart.json'



export const SECRET_KEY = "MaiLista233QwQ";

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


//兄弟你怎么能找到这的,求求您别C我了,我真怕了QcQ,咱萍水相逢一场我也没招您惹您对不对......,小的给您磕了TcT


function encryptString(text, key = SECRET_KEY) {
  let result = '';
  
  
  let offset = 0;
  for (let i = 0; i < key.length; i++) {
    offset += key.charCodeAt(i);
  }
  offset = offset % 256;
  
  
  for (let i = 0; i < text.length; i++) {
    
    const charCode = text.charCodeAt(i);
    
    const keyChar = key.charCodeAt(i % key.length);
    
    const encryptedCode = ((charCode + offset) % 65536) ^ keyChar;
    
    
    result += encryptedCode.toString(16).padStart(4, '0');
    
    
    offset = (offset + charCode) % 256;
  }
  
  return result;
}


export {
  encryptString,
};