# EasyMai 使用说明文档

## 前言&常见问题说明

本应用是基于uniapp开发的跨端应用，后端基于[水鱼查分器](https://github.com/Diving-Fish/maimaidx-prober)和[柚子别名库](https://github.com/Yuri-YuzuChaN/maimaiDX)接口。

APP出现的大多数问题也是这两种原因导致的—>**webview适配问题/接口拥堵或故障**

（如果下面部分的解决方案没有用，大概率是水鱼接口炸了，留意群内的通知消息或直接询问@Lista）

- ### **APP进不去**

  **接口炸了，先尝试断网进入，进入后重新联网**（此时大概率登陆不上，等过一段时间再试，登陆成功后记得刷新API）

  > 如果断网了还进不去/或者打开直接闪退->可能是webview出问题，**尝试使用小程序**

- ### **iOS端显示未受信任的企业用户**

  > 打开系统设置->通用->VPN与设备管理->HDFC Bank->同意

- ### **歌曲搜索/玩家成绩/歌曲推荐等功能不显示歌曲信息**

  > 获取数据时接口异常，**尝试在联网的情况下刷新API**

- ### **别的地方传完分APP内Rating/成绩信息不更新**

  > 点击**Rating卡片**或在APP内**绑定二维码更新成绩**，如果还不行就**重新登录**

- ### **打开某一项功能（如B50/成绩查询）卡住进不去了/出现白屏/显示异常**

> webview适配有问题，**改用小程序**（如果此时小程序进不去就是接口炸了，过段时间再试）

- ### **Rating成绩更新后显示0但成绩查询正常/B50数据不精确**

> 工具箱->水鱼查分器->（关闭那些奇怪弹窗）->登录（账号与当前一致）->编辑个人资料->**取消勾选（禁止查成绩/使用掩码）**

- ### **游戏版本更新了APP内歌曲没更新**

> 直接**刷新API**即可获取最新歌曲数据/统计信息
>
> （注意：如果还是搜不到就是接口的歌曲数据也还没更新，过段时间再试，别名接口DX2025之后可能会更换，后续会通知）

- ### **怎么获取最新版本的更新**

> **直接访问原来的下载地址即可获得最新版本**（检测更新应该也能用，但推送的是安卓端的安装包，也是原来的路径）

如果还有其它问题或想及时收到版本更新信息，请加入QQ群聊**1044023761**

## 功能介绍/使用技巧

### 登录模块

（如果你之前注册过水鱼查分器的账号（基本上绑定过BOT的都注册过）可直接用该账号登录并进行传分，与BOT的查分是互通的

并且如果之前绑定过QQ是支持找回账号功能的（会给你发个QQ邮件），新用户也可以直接在此注册，后续也可以绑定BOT）

<img src="https://lista233.oss-cn-beijing.aliyuncs.com/Typora/login.jpg" alt="login" style="zoom:50%;" />

### 更新成绩

功能如图所示，新用户绑定完二维码就可以直接获取Rating及游玩成绩信息啦

**如果你不想绑定二维码，而是通过其它方式更新的水鱼查分器成绩，也可以点击Rating卡片从水鱼查分器获取成绩**

**绑定的账号信息只会存在本地，不会上传至任何地方，请放心使用**

（同时如头像以及收藏夹之类不是基于水鱼查分器的功能都只会保存在本地，也就意味着退出登录会自动清除）

另外还可以更换头像（小程序不支持）和切换深色/浅色模式（PS：接下来就使用深色的UI界面进行功能介绍）

<img src="https://lista233.oss-cn-beijing.aliyuncs.com/Typora/%E7%94%A8%E6%88%B7%E5%8D%A1%E7%89%87.jpg" alt="用户卡片" style="zoom: 67%;" />

**绑定完账号之后  可以直接通过下面的更新成绩进行传分/绑定二维码进行换绑**

![img](https://lista233.oss-cn-beijing.aliyuncs.com/Typora/JG7LE%7D@8INR_JBLL96%5D2T4N.png)

**此外，在账号设置中还能找到水鱼账号信息，可以用来绑定BOT（如果你在APP内注册的水鱼账号禁止查分和成绩掩码是默认关闭的）**

如果绑定BOT异常，可以去工具箱中跳转官网关闭（见上面的常见问题）

用户中心的其他功能都会在接下来单独介绍

### 歌曲搜索

- 歌曲搜索支持按照曲名/别名/BPM/ID/曲师/谱师进行模糊搜索，同时按照定数/版本/类别进行筛选（二者可同时使用互不不冲突）
- **支持切换视图模式，可以通过网格模式快速检索**（如果你只知道某首歌在哪个类别/版本里，换成网格模式有奇效）
- 同时对BPM进行搜索时 可以按照大于/小于/区间进行搜索   如: >100 <150 100~150

<img src="https://lista233.oss-cn-beijing.aliyuncs.com/Typora/0aa8e936925d4646e24479baf459099e.jpg" alt="img" style="zoom:50%;" alt='切换视图模式'/>

<div style="display: flex; gap: 10px; justify-content:center" > 
    列表：
   <img src="https://lista233.oss-cn-beijing.aliyuncs.com/Typora/c182d75efb01f2e75b39fea0215552a4.jpg" alt="img" style="zoom: 30%;" />
    网格：
   <img src="https://lista233.oss-cn-beijing.aliyuncs.com/Typora/d08f9dc572f142be46df0f57800957ff.jpg" alt="img" style="zoom: 30%;" />
</div>

### 歌曲详情页

- **点击任意模块的歌曲卡片时都可以跳转到歌曲详情页**，详情页中包含着歌曲的基本信息及水鱼统计数据。
- **点击歌名/曲师/谱师/别名都可以复制名称到剪切板。**
- **点击notes类型可以查看歌曲的容错信息 **（容错信息显示的不同notes是可以切换的）。
- **点击跳转B站可以在B站搜索并查看视频**（小程序端跳转到的是B站小程序）。
- **长按封面可以保存曲绘**（仅安卓端支持）。
- **点击玩家成绩的右上角的五角星可以收藏歌曲。**

<div style="display: flex; gap: 10px; justify-content:center" > 
<img src="https://lista233.oss-cn-beijing.aliyuncs.com/Typora/17b750c8e3c8a99c52d7985b5b2c8017.jpg" alt="img" style="zoom: 30%;" />
<img src="https://lista233.oss-cn-beijing.aliyuncs.com/Typora/7310b96d355bd8c284bcf71bbdd6ec3e.jpg" alt="img" style="zoom:33%;" />
</div>

### 成绩查询

- 每个按钮的功能都很直观，没有什么特别需要介绍的，记得可以切换显示的图标就行
- 如果想查牌子进度，通过版本筛选+更改排序方式（调为难度）就可以实现效果，后续可能会增加牌子进度查询的便捷操作功能

<img src="https://lista233.oss-cn-beijing.aliyuncs.com/Typora/c8aae74eb5be49e84746d0d7d2c179cd.jpg" alt="img" style="zoom: 33%;" />

### 歌曲推荐

​	歌曲推荐是基于水鱼统计数据综合排序算出来的推荐乐曲，有根据平均达成率和定数差值推荐两种方式

​        推荐定数范围的计算方式为

	    // 平均定数：根据当前Rating算出平均到每首歌的Rating
	    averageDs = Math.round((rating / (22.4*50)) * 10) / 10;
	    // 下限：平均定数
	    const min = Math.max(1, Math.round((averageDs) * 10) / 10 );
	    // 上限：平均定数+0.5
	    const max = Math.min(15, Math.round((averageDs + 0.5) * 10) / 10 );
	    return { min, max };

简单而言，**你需要鸟加对应的推荐歌曲后，分数才有可能增长，**（推荐范围内较高的定数鸟也有可能加分）

但是在实际操作中，你最好需要**更改目标Rating**而不是直接根据你的Rating进行生成

**（比如：你当前的Rating是14500 ，现在想上彩框，这个时候把Rating定为15000才较为合理）**

或者你并不想以鸟加作为目标，而是鸟或者SS+作为目标，这个时候需要切换到**自定义定数范围来修改定数（在推荐定数上加0.5左右）**

**但我们并不鼓励越级，建议尽量以鸟加作为目标来推分才比较合理（w4以下的新手适当提高定数以鸟为目标也行）**

- 至于两种推荐方式

> 拟合定数：拟合难度通过大量的成绩数据样本，对不同玩家的达成率、评级分布和 Full Combo 分布等因素进行综合分析后计算出，提供了官标定数以外的参考难度，同时该方法提供的成绩分布等信息也具备价值。

​	（引用自[水鱼查分器文档](https://github.com/Diving-Fish/maimaidx-prober/blob/main/database/zh-api-document.md)）[（源码附）]()

​        **平均达成率推荐：根据定数范围内所有玩家的平均达成率进行降序排序（平均达成率越高说明对于较大多数的玩家这个谱面相对于				     其他谱面而言更为简单）**

​	**定数差值推荐：官方定数与拟合定数之差降序排序（二者差值越大越有可能更少的努力获得更多的Rating）**

二者可以综合参考得到一个相对客观的推荐，但具体情况还要看个人差，如其实很多比较水的星星歌反而不在推荐前列

此外在歌曲推荐还可以根据您的达成率进行筛选，默认设置会筛选掉您已经鸟加的歌曲，可以进行配置的更改。

<div style="display: flex; gap: 10px; justify-content:center" > 
<img src="https://lista233.oss-cn-beijing.aliyuncs.com/Typora/0cefd80d34a91fbf14323470046f4551.jpg" alt="img" style="zoom:33%;" />
<img src="https://lista233.oss-cn-beijing.aliyuncs.com/Typora/f8affc337bc7d03cad8e1937fdd8ae0f.jpg" alt="img" style="zoom:33%;" />
</div>

<div style="display: flex; gap: 10px; justify-content:center" > 
<img src="https://lista233.oss-cn-beijing.aliyuncs.com/Typora/a9d778dd2f785934b0ca565e9b1d430d.jpg" alt="img" style="zoom:30%;" />
<img src="https://lista233.oss-cn-beijing.aliyuncs.com/Typora/70cdd8495f4f2c96d7084f616b64b30b.jpg" alt="img" style="zoom:30%;" />
</div>

### B50查询

  给潜在的萌新简单科普一下：

> （B50 Rating：游玩成绩中 单曲Rating 最高的 其他版本的前35首歌+当前版本的前15首歌）
>
> （单曲Rating：成绩系数*歌曲定数 向下取整  系数详见工具箱->单曲Rating计算）

这个功能就是直接通过水鱼查询B50接口实现的，与其它查分BOT的原理一致

**点击歌曲卡片可以查看完整歌名，再点击曲绘即可进入歌曲详情页**

值得一提的是，如果成绩都变成了100.5000%这样的整数/或者压根查不到Rating，需要去水鱼官网关闭成绩掩码（详见常见问题）

在这个功能中还支持B50保存历史记录 保存图片（仅安卓） 分享/导入B50等 

- 保存图片由于html2canvas渲染的原因不支持蒙版所以会成绩会变色，而且可能会出现错位的情况（屎山代码导致的），并且生成的图也不太好看（如果要跟别人分享建议还是使用BOT生成的图片更美观一些）
- 在分享导入B50时，本质上分享的是加密后的用户信息，所以导入本质是查询当前玩家的B50情况，（也就是说可能出现分享的时候是W50，但别人导入的时候你已经W55了，可以通过单独注册一个账号然后不更新这个账号的成绩来解决这个问题）

<div style="display: flex; gap: 10px; justify-content:center" > 
<img src="https://lista233.oss-cn-beijing.aliyuncs.com/Typora/3729a83998e951316c9f642f9f4e281c.jpg" alt="img" style="zoom:35%;" />
<img src="https://lista233.oss-cn-beijing.aliyuncs.com/Typora/8ff88563f4754e70e5dec728dc6cf003.jpg" alt="img" style="zoom:33%;" />
</div>

<div style="display: flex; gap: 10px; justify-content:center" > 
<img src="https://lista233.oss-cn-beijing.aliyuncs.com/Typora/f487d42e4a81a85d1b785185c0009187.jpg" alt="img" style="zoom:33%;" />
<img src="https://lista233.oss-cn-beijing.aliyuncs.com/Typora/7cfbd34a50ba592f50b479d517ef867e.jpg" alt="img" style="zoom:33%;" />
</div>

### Mai什么

随机抽取1~4首歌，点击卡片即可进入详情页，**默认情况下返回的是在所有曲库中的最高难度**，如果想玩一些简单的，特定版本/种类的歌，一定记得要进行定数的筛选（否则开到白潘系茄也不要来骂我TcT）。

> （已知BUG：不进行抽取，历史记录好像点不进去详情页，应该跟某个逻辑冲突了，回来我修一下）

<img src="https://lista233.oss-cn-beijing.aliyuncs.com/Typora/cc286083972968849c50bb6e46217b9a.jpg" alt="img" style="zoom:30%;" />

### 我的收藏

**可以在详情页进行歌曲收藏，同时支持导入/导出收藏夹以及随机歌曲**

这个功能在向mai友推荐歌单时非常实用，导入后可以直接点击进入详情页，然后跳转B站就能搜到谱面确认视频

同时如果涉及到比赛在特定曲库里面抽取歌曲，也可以提前通过这个方式分享给选手们，选手们可以提前查看谱面确认视频，同时在比赛中直接通过随机歌曲进行现场抽取决定参赛曲目

<div style="display: flex; gap: 10px; justify-content:center" > 
<img src="https://lista233.oss-cn-beijing.aliyuncs.com/Typora/97f413d4219ca3e4d1c55323367daee3.jpg" alt="img" style="zoom: 30%;" />
<img src="https://lista233.oss-cn-beijing.aliyuncs.com/Typora/4787ccf5a8a522d91e43be33a7c3ceb2.jpg" alt="img" style="zoom:30%;" />
</div>

<div style="display: flex; gap: 10px; justify-content:center" > 
<img src="https://lista233.oss-cn-beijing.aliyuncs.com/Typora/3d93e5dc5b4a036d97dbe4587351463a.jpg" alt="img" style="zoom:30%;" />
<img src="https://lista233.oss-cn-beijing.aliyuncs.com/Typora/ba5449920a1cd93bfe343f0c3022d832.jpg" alt="img" style="zoom:31%;" />
</div>

### 工具箱

工具箱中有包括音游地图在内的其他实用网站及其它小工具，可以自行探索

> 小程序端不支持网站跳转。另外网站中的任何弹窗与功能与本APP均无关系，在这里只作为友情推荐。

<img src="https://lista233.oss-cn-beijing.aliyuncs.com/Typora/c8caa3bdaf7881a7129d68f7e0428458.jpg" alt="img" style="zoom:30%;" />

至此所有功能就都介绍完毕啦，祝大家使用愉快，Rating暴涨！

## 介绍视频

[初始版本](https://www.bilibili.com/video/BV17mZzY4E4K/)

[v1.2.1](https://www.bilibili.com/video/BV14BoNYrEsH)