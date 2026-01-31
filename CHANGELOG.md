# Change Log

All notable changes to the "ege" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## 1.1.0

- **New Feature**: 新增 31+ 个示例模板选择功能
  - 创建新项目时可以从多种示例模板中选择
  - 包含基础入门、游戏示例、图形绘制、算法可视化、物理模拟、分形与数学、图像处理、摄像头等 8 大类
  - 支持中英文双语界面
  - 示例包括：贪吃蛇、俄罗斯方块、五子棋、A*寻路、排序算法可视化、弹球碰撞、Julia集、Mandelbrot集等
- **New Feature**: Added 31+ demo template selection
  - Choose from a variety of demo templates when creating a new project
  - Includes 8 categories: Basic, Games, Graphics, Algorithms, Physics, Fractals, Image Processing, Camera
  - Bilingual support (Chinese and English)
  - Demos include: Snake, Tetris, Gomoku, A* Pathfinding, Sorting visualization, Ball collision, Julia Set, Mandelbrot Set, and more
- **Feature**: 智能文件覆盖保护
  - 自动比较文件内容，相同则跳过，不同则提示用户
  - 支持"全部是"、"全部否"批量操作
  - Git 仓库自动创建 stash 保护现有改动
  - 完整的中英文国际化支持
- **Feature**: Smart file overwrite protection
  - Automatic content comparison, skip if identical, prompt if different
  - "Yes to All" and "No to All" batch operations
  - Automatic git stash creation to protect existing changes
  - Full internationalization support
- **Improvement**: 完善 i18n 国际化系统
  - 新增缺失的翻译字符串
  - 修复硬编码中文字符串
- **Improvement**: Enhanced i18n system
  - Added missing translation keys
  - Fixed hardcoded Chinese strings
- **Documentation**: 移动并完善发布工作流文档
  - 文档移至 `.github/` 目录
  - 新增 dry-run 模式说明
  - 新增 marketplace 版本检查机制文档
- **Documentation**: Moved and improved release workflow documentation
  - Moved to `.github/` directory
  - Added dry-run mode documentation
  - Added marketplace version check documentation

## 1.0.3

- 修正 vscode 项目模板的一些小问题

## 1.0.2

- 修正单文件编译在 GCC 下的错误

## 1.0.1

- fix: 修复 alpha 图像混合错误的问题: <https://github.com/x-ege/xege/pull/347>

## 1.0.0

- 大版本更新: 内置的 EGE 升级至 25.11
- 新增 Visual Studio 2026 支持
- 新增配置项 `ege.downloadFromOfficial`：支持配置是否从官网下载 EGE（默认使用内置版本）
- 移除安装时的版本选择弹窗，默认使用内置版本，提升用户体验
- EGE 25.11 新特性:
  - 新增颜色类型 `color_type` 枚举，支持 PRGB32/ARGB32/RGB32
  - 新增 `image_convertcolor()` 函数用于图像颜色类型转换
  - 新增 `keypress()`/`keyrelease()`/`keyrepeat()` 键盘输入查询函数
  - 相机模块增强：支持查询设备支持的分辨率
  - 图像处理改用预乘 alpha 格式提升渲染性能

## 0.7.0

- 将 ege 更新为更新的 2025 版本， 带来了相机相关 feature. 
- 插件将定期更新以同步 Github 上 ege 的版本.

## 0.6.0

- 支持新的 CMake 模板: ege 源码嵌入项目

## 0.5.0

- Add internationalization (i18n) support
- Automatic language detection based on VS Code's display language
- Support for English and Chinese (中文) languages
- Added missing command `ege.setupProjectWithEgeSrc` for setting up project with EGE source code
- Improved user experience with localized messages and interface

## 0.4.14

- fix c++ CMake template, add arg: `/Zc:__cplusplus`

## 0.4.13

- fix compile error on macOS Sequoia with latest mingw-w64 (undefined reference to `_setjmp`).

## 0.4.11

- fix issue: <https://github.com/wysaid/vscode-ege/issues/6>, thanks to @NCC79601 for reporting.

## 0.4.10

- revert `0.4.9`

## 0.4.9

- 更新 ege libs, 同时支持 /MT 和 /MD 两种运行时库.

## 0.4.8

- 优化 vscode task.

## 0.4.7

- update builtin ege.

## 0.4.3

- update builtin ege.

## 0.4.2

- fix vscode task error.

## 0.4.0

- update ege to 2024 ver.

## 0.3.8

- fix vscode task error.

## 0.3.6

- 修正：使用 CMake 构建项目，运行时中文乱码(源文件字符集 UTF-8，系统字符集 ANSI，Windows MSVC)

## 0.3.5

- 优化内置ege编码方式, 避免警告.
- 优化编译文件的 encoding, 支持 utf8 格式的源文件, 避免中文乱码

## 0.3.4

- 优化 launch tasks.

## 0.3.3

- 解决 windows 下补全的 `tasks` 会依赖 `git-bash` 的问题, 改用 cmd 指令重写

## 0.3.2

- 修正打包问题

## 0.3.1

- 解决 CMake 项目生成在 Windows 下的一些问题. 已处于可用状态.

## 0.3.0

- 解决 CMake 项目生成的问题, 内置一个 CMake 的模板.

## 0.2.2

- 弹窗提示翻译为中文.
- Windows 版的单文件运行功能, 默认依附于 vscode 的 terminal 运行.
- 当检查到代码中存在 cin/cout/printf/scanf 之类的标准输入输出的时候, 给加上 SHOW_CONSOLE 参数

## 0.2.1

- 单文件编译支持 debian/ubuntu, 同时内置对应的静态库.

## 0.2.0

- 重构基本代码结构, 将大量的 callback 传入参数改为 async/await.
- 基于 wine64 + mingw-w64, 支持 MacOS 编译以及运行.

## 0.1.6

- Support paths with space

## 0.1.5

- Fix running cwd.

## 0.1.4

- Fix missing modules.

## 0.1.3

- Fix command err.

## 0.1.2

- Support build&run without `setup-global` command.

## 0.1.0

- Support `Build & Run single cpp file`. Tested platform: `vs2019`, `vs2022`

## 0.0.5

- Support build and run

## 0.0.4

- Support builtin bundle.

## 0.0.3

- Beta:
  - Support installation of `VS2015/VS2017/VS2019/VS2022`

## 0.0.2

- Draft:
  - Support ege installers downloading & unzipping.
  - Support cache manage.

## 0.0.1

- Initial release
