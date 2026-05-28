# 我的个人网站

这是一个简约现代的个人网站，可以免费部署到Cloudflare Pages。

## 功能特点

- ✅ 响应式设计（手机电脑都能看）
- ✅ 预留广告位（可接入Google AdSense）
- ✅ 简洁现代的界面
- ✅ 完全免费托管

## 网站结构

```
personal-website/
├── index.html       # 首页
├── about.html       # 关于我
├── resources.html   # 资源分享
├── contact.html     # 联系我
├── style.css        # 样式文件
└── README.md        # 说明文件
```

## 部署步骤

### 方法1：使用Cloudflare Pages（推荐）

1. **注册GitHub账号**
   - 访问 https://github.com
   - 注册一个免费账号

2. **创建GitHub仓库**
   - 点击 "New Repository"
   - 名称填：`personal-website`
   - 选择 "Public"
   - 点击 "Create repository"

3. **上传文件**
   - 在仓库页面点击 "uploading an existing file"
   - 将所有网站文件拖拽上传
   - 点击 "Commit changes"

4. **注册Cloudflare账号**
   - 访问 https://dash.cloudflare.com/sign-up
   - 注册免费账号

5. **部署到Cloudflare Pages**
   - 登录Cloudflare
   - 点击 "Pages"
   - 点击 "Create a project"
   - 选择 "Connect to Git"
   - 授权GitHub并选择你的仓库
   - 点击 "Save and Deploy"
   - 等待部署完成

6. **绑定域名**
   - 在Cloudflare Pages项目中
   - 点击 "Custom domains"
   - 输入你的域名
   - 按提示配置DNS

### 方法2：直接访问

双击 `index.html` 文件即可在浏览器中预览网站。

## 自定义内容

### 修改文字内容
- 用记事本打开HTML文件
- 找到对应的文字修改
- 保存文件

### 添加广告

1. 申请Google AdSense账号
2. 获取广告代码
3. 在HTML文件中找到 `<div class="ad-space">` 部分
4. 将广告代码插入其中

### 添加资源下载

1. 在 `resources.html` 中复制一个卡片
2. 修改标题和描述
3. 将 `href="#"` 改为实际的下载链接

## 修改网站名称

在所有HTML文件中，将以下内容替换：

1. `<title>我的个人网站</title>` 改为你的网站名
2. `<div class="logo">我的网站</div>` 改为你的网站名

## 技术支持

如有问题，可以：
- 查看Cloudflare Pages官方文档
- 搜索"YouTube部署教程"
- 咨询有经验的朋友

## 注意事项

- 网站是静态的，不能动态上传文件
- 如需更新内容，需要修改HTML文件后重新上传
- Google AdSense需要网站有一定流量才能申请

---

祝你网站运营成功！🎉
