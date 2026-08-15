# dsh-deepseek-chat

[English](README.en.md) | 中文

DeepSeek Harness(dsh)Web UI 插件:在对话页右侧新增一个**「问 DeepSeek」**入口,点开即是一个独立的简洁聊天面板,直接用你在 dsh 里配置好的 DeepSeek API 与 **DeepSeek-V4-Flash / Pro** 对话——与主 Agent 会话互不影响。

## 功能

- 💬 **右侧入口 + 滑出面板**:屏幕右缘常驻「问 DeepSeek」竖排按钮,点击滑出聊天面板
- 🆕 **全新独立对话**:面板内的会话与 dsh 的 Agent 会话完全隔离,一键「新对话」清空重来
- ⚡ **Flash / Pro 模型切换**:面板头部下拉即切,默认模型记住你的选择(localStorage)
- 🔑 **复用 dsh 的 API 配置**:宿主半侧通过 `ctx.llm` 走 dsh 已注册的 `deepseek-official` 路由——API Key、baseURL、settings 覆盖全部生效,插件本身不接触、不存储任何密钥
- 🌊 **流式输出**:SSE 逐字输出,支持思考过程(reasoning)展示、随时停止
- ⚙️ **设置弹窗**:默认模型选择、GitHub 意见反馈入口、一键卸载插件(两步确认)
- 🌗 **跟随主题**:自动适配 dsh Web UI 的明暗主题(`body[data-ds-dark-theme]`)

## 安装

```bash
# 从 npm 安装(发布后)
dsh plugin --profile web add dsh-deepseek-chat

# 本地开发:从源码目录安装
git clone https://github.com/lhenlihai-hub/dsh-deepseek-chat.git
cd dsh-deepseek-chat
npm install
npm run build
dsh plugin --profile web add link:$(pwd)
```

装完重启 `dsh web`,打开任意会话,屏幕右缘即可看到「问 DeepSeek」入口。

> 前置条件:已在 dsh **设置 → 模型** 中配置 DeepSeek API Key(插件复用该配置,不另行索要密钥)。

## 卸载

- 面板内:设置(⚙)→ 卸载插件 → 确认;
- 或终端执行:

```bash
dsh plugin --profile web remove dsh-deepseek-chat
```

重启 `dsh web` 后生效。

## 开发

```bash
npm install
npm run build      # 产出 lib/index.js(宿主半侧)+ lib/client.js(浏览器半侧)
npm run watch      # 监听构建
npm run typecheck  # 类型检查
```

> 注意:pnpm/npm 的 `file:` / `link:` 安装是复制而非链接,改动源码后需重新 `remove` + `add`(或重启 dsh)才会生效。

### 结构

```
src/
├── index.ts          # 宿主半侧:/deepseek-chat/* 路由(chat SSE / models / uninstall)
└── client/
    ├── index.ts      # 浏览器半侧入口:挂载 React 根
    ├── app.tsx       # UI:入口按钮、聊天面板、设置弹窗
    └── styles.ts     # 内联 CSS(亮/暗双主题)
cordis.patch.yml      # bundle patch(安装时自动挂进 web profile)
```

### 工作原理

- **宿主半侧**是标准 Cordis 插件,`inject: ['webServer', 'llm']`,通过 `ctx.webServer.register()` 注册三条回环地址专属的 HTTP 路由;聊天请求经 `ctx.llm.stream()` 进入 dsh 的 LLM seam,使用部署中已注册的 DeepSeek provider 路由。
- **浏览器半侧**是 `window.__ModuleLoader__.load({ id, factory })` 闭包工厂产物;React 等运行时依赖从 dsh 外壳的冻结模块表获取(bundle external),CSS 以 `<style data-plugin>` 内联注入,卸载时自动清理。

## 开源协议

[MIT](LICENSE)
