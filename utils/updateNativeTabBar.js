export const updateNativeTabBar = (isDarkMode) => {
   // #ifdef APP-PLUS
  try {
    plus.android.importClass("android.view.Window");
    const main = plus.android.runtimeMainActivity();
    const window = main.getWindow();
    const Color = plus.android.importClass("android.graphics.Color"); 
    const View = plus.android.importClass("android.view.View");
    
    if(uni.getSystemInfoSync().platform === 'android') {
      // 检查 Android 版本
      const Build = plus.android.importClass("android.os.Build");
      
      if (Build.VERSION.SDK_INT >= 21) { // Android 5.0 (API 21) 及以上支持
        // 使用 setNavigationBarColor 方法
        if(isDarkMode) {
          // 深色模式
          window.setNavigationBarColor(Color.parseColor('#1c1c1e'));
          
          // Android 8.0 (API 26) 及以上支持 SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR
          if (Build.VERSION.SDK_INT >= 26) {
            const decorView = window.getDecorView();
            let flags = decorView.getSystemUiVisibility();
            flags |= View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR;
            decorView.setSystemUiVisibility(flags);
          }
        } else {
          // 浅色模式
          window.setNavigationBarColor(Color.parseColor('#ffffff'));
          
          // Android 8.0 (API 26) 及以上支持 SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR
          if (Build.VERSION.SDK_INT >= 26) {
            const decorView = window.getDecorView();
            let flags = decorView.getSystemUiVisibility();
            flags &= ~View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR;
            decorView.setSystemUiVisibility(flags);
          }
        }
        
        console.log('TabBar样式已更新');
      } else {
        console.log('当前 Android 版本不支持设置导航栏颜色');
      }
    }
  } catch(e) {
    console.error('更新原生TabBar样式失败:', e);
  }
  // #endif
};