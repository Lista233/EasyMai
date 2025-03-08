import { ref, onMounted } from 'vue'

export default function useBrowser() {
	const webview = ref(null)
	const navBottom = ref(null)
	
	// 初始化浏览器
	function initWebview(options) {
		webview.value = plus.webview.create('', 'browser', {
			titleNView: {
				backgroundColor: '#FFFFFF',
				progress: { //进度条
					color: '#4678e7',
					height: '3px'
				},
				splitLine: { //底部分割线
					color: '#cccccc',
					height: '1px'
				},
				buttons: [
				{ //关闭按钮
					'float': 'left',
					fontSrc: '/static/uni.ttf',
					text: '\ue460',
					onclick: () => close()
				}, { //更多按钮
					'float': 'right',
					fontSrc: '/static/uni.ttf',
					text: '\ue507',
					onclick: () => more()
				}]
			},
			additionalHttpHeaders: options?.headers || {}
		})
		// 配置下拉刷新
		webview.value.setPullToRefresh({
			support: true
		}, () => {
			reload()
			const titleUpdate = () => {
				setTimeout(() => {
					webview.value.endPullToRefresh()
					webview.value.removeEventListener('titleUpdate', titleUpdate)
				}, 300)
			};
			webview.value.addEventListener('titleUpdate', titleUpdate)
		})
		
		//绘制返回前进按钮
		const screenWidth = plus.screen.resolutionWidth
		const left = screenWidth / 4
		navBottom.value = new plus.nativeObj.View("navBottom", { 
			bottom: '0px', left: '0px', height: '44px', width: '100%', backgroundColor: 'rgb(255,255,255)'
		})
		navBottom.value.draw([
			{
				tag: 'font',
				id: 'back',
				text: '\ue471',
				textStyles: {
					fontSrc: '/static/uni.ttf',
					size: '24px',
					color: '#000000'
				},
				position:{
					right: left,
					height:'100%',
				}
			},
			{
				tag: 'font',
				id: 'forward',
				text: '\ue470',
				textStyles: {
					fontSrc: '/static/uni.ttf',
					size: '24px',
					color: '#000000'
				},
				position:{
					left: left,
					height:'100%',
				}
			}
		])
		
		//点击前进或后退
		navBottom.value.addEventListener("click", (e) => { 
			if (e.clientX > left && e.clientX < (left + 24)) {
				back()
			}
			if(e.clientX > (screenWidth - left - 12) && e.clientX < (screenWidth - left + 12)){
				forward()
			}
		})
		
		//监听页面变化
		webview.value.addEventListener('loaded', () => {
			webview.value.canBack((event) => {
				let canBack = false
				if(event.canBack) {
					canBack = true
					navBottom.value.show()
				}else{
					canBack = false
				}
				webview.value.canForward((event) => {
					if(event.canForward) {
						navBottom.value.drawText('\ue470', {left: left, height:'100%'}, {color:'#000000', fontSrc: '/static/uni.ttf', size: '24px'}, 'forward')
					}else{
						navBottom.value.drawText('\ue470', {left: left, height:'100%'}, {color:'#EEEEEE', fontSrc: '/static/uni.ttf', size: '24px'}, 'forward')
					}
					if(!canBack && !event.canForward){
						navBottom.value.hide()
					}
				})
			})
		})
	}

	// 处理返回键事件
	function handleEvent() {
		plus.key.addEventListener('backbutton', () => {
			const topWebview = plus.webview.getTopWebview()
			if (topWebview.id === 'browser') {
				webview.value.canBack((event) => {
					if (event.canBack) {
						// 如果浏览器可以后退，则后退
						webview.value.back()
					} else {
						// 如果浏览器不能后退，则关闭浏览器
						close()
					}
				})
			}
			// 移除了 plus.runtime.quit() 的调用
		})
	}

	// 显示浏览器
	function show(url = 'https://www.baidu.com') {
		webview.value.loadURL(url)
		webview.value.show('slide-in-right')
	}

	// 后退
	function back() {
		// 后退
		webview.value.canBack((event) => {
			if(event.canBack) {
				webview.value.back()
			} else {
				close()
			}
		})
	}

	// 更多选项
	function more() {
		uni.showActionSheet({
			itemList: ['刷新', '分享', 'Safari浏览器打开'],
			success: (res) => {
				if(res.tapIndex == 0){
					reload()
				}else if(res.tapIndex == 1){
					
				}else if(res.tapIndex == 2){
					plus.runtime.openURL(webview.value.getURL())
				}
			}
		})
	}

	// 刷新
	function reload() {
		// 刷新
		webview.value.reload(true)
	}

	// 前进
	function forward() {
		//前进
		webview.value.canForward((event) => {
			if(event.canForward) {
				webview.value.forward();
			} else {
				plus.nativeUI.toast('没有可前进的地址')
			}
		})
	}

	// 关闭
	function close() {
		//关闭
		navBottom.value.close()
		webview.value.close('browser', 'slide-out-right')
		webview.value.clear()
		// 确保移除所有相关的事件监听
		plus.key.removeEventListener('backbutton')
	}

	// 初始化
	function init(options) {
		initWebview(options)
		handleEvent()
	}

	return {
		init,
		show,
		back,
		forward,
		reload,
		close,
		more
	}
}