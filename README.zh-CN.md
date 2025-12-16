# [Easy Graphics Engine](https://github.com/wysaid/xege) 的 VSCode 插件

一个用于帮助配置 [ege](https://xege.org) 的 VSCode 插件。享受它吧！

## 功能特性

- 一键生成 `EGE 项目`
- **31+ 示例模板**: 创建新项目时可以从多种示例模板中选择
  - 基础入门：Hello World
  - 游戏示例：贪吃蛇、俄罗斯方块、五子棋、打字练习
  - 图形绘制：星空动画、时钟、变幻线、烟花特效
  - 算法可视化：A*寻路算法、排序算法可视化、K-Means聚类、生命游戏
  - 物理模拟：弹球碰撞、群集模拟、水波效果
  - 分形与数学：Julia集、Mandelbrot集
  - 图像处理：加载、旋转、变换
  - 摄像头：摄像头基础、水波特效
- 构建并运行支持 EGE 的单个 cpp 文件 (`graphics.h`)
- 为 `C/C++` 源代码添加 EGE CMake 项目模板
- 支持 MacOS/Linux (通过 `mingw-w64` 和 `wine`)
- **国际化 (i18n)**: 根据 VS Code 的显示语言自动检测语言
  - English (默认)
  - 中文 - 当 VS Code 的显示语言为中文时自动选择
- 基于 EGE 源码生成项目模板. 源码模式会不定期更新为 EGE 最新代码, 方便发现问题.

## 依赖项

- Windows: Visual Studio `2017`/`2019`/`2022`/`2026+`
- MacOS: `mingw-w64`, `wine-stable` (wine64)
  - 您可以通过 `brew install mingw-w64 wine-stable` 安装
- Linux: `mingw-w64`, `wine64`
  - 您可以通过 `apt install mingw-w64 wine64` 安装 (Ubuntu/Debian)

## 安装

- 在 Visual Studio 商店中搜索 `ege`
- 在 <https://marketplace.visualstudio.com/items?itemName=wysaid.ege> 获取

## 扩展设置

您可以定义如下选项：

```jsonc
{
    "ege.update_url": "https://xege.org/download/ege-latest-version",
    "ege.showEditorContextMenu": true,
    "ege.explorerContextMenu": true,
    "ege.downloadFromOfficial": false // 从官网下载 EGE 而不是使用内置版本
}
```

### 配置说明

- **`ege.downloadFromOfficial`**: 默认情况下，插件使用内置的 EGE 库（经过测试且稳定）。如果您想从官网 (<https://xege.org>) 下载最新版本，请将此选项设置为 `true`。注意：官网下载的版本可能不总是稳定或与插件兼容。

## 命令

此扩展提供以下命令：

- `EGE: 在当前工作区设置 ege 项目` - 在当前工作区中创建 EGE 项目
- `EGE: 在当前工作区设置带有 EGE 源代码的 ege 项目` - 使用 EGE 源代码创建项目
- `EGE: 全局设置` - 全局安装 EGE
- `EGE: 构建并运行当前文件` - 构建并运行当前的 .cpp 文件
- `EGE: 清理缓存` - 清理插件缓存
- `EGE: 打开缓存目录` - 打开缓存目录

## 使用说明

1. 打开一个文件夹或工作区
2. 使用命令面板 (`Ctrl+Shift+P` 或 `Cmd+Shift+P`)
3. 输入 `EGE:` 查看可用命令
4. 选择 `EGE: 在当前工作区设置 ege 项目` 来初始化项目
5. 开始编写您的 EGE 程序！

## 支持的语言

- 英文 (默认)
- 中文 (简体) - 当 VS Code 语言设置为中文时自动激活

## 问题报告

如果您遇到任何问题，请在 [GitHub Issues](https://github.com/wysaid/vscode-ege/issues) 中报告。

## 许可证

请查看 [LICENSE](LICENSE) 文件获取详细信息。
