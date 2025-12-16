/**
 * Author: wysaid
 * Date: 2025-12-16
 * Demo options management for EGE VSCode Extension
 */

import * as path from 'path';
import * as fs from 'fs-extra';

/**
 * Demo 分类枚举
 */
export enum DemoCategory {
    BASIC = 'BASIC',
    GAME = 'GAME',
    GRAPHICS = 'GRAPHICS',
    ALGORITHM = 'ALGORITHM',
    PHYSICS = 'PHYSICS',
    FRACTAL = 'FRACTAL',
    IMAGE = 'IMAGE',
    CAMERA = 'CAMERA'
}

/**
 * Demo category display names
 */
export const DemoCategoryDisplayNames: { [key: string]: { [key in DemoCategory]: string } } = {
    'en': {
        [DemoCategory.BASIC]: 'Basic',
        [DemoCategory.GAME]: 'Game',
        [DemoCategory.GRAPHICS]: 'Graphics',
        [DemoCategory.ALGORITHM]: 'Algorithm',
        [DemoCategory.PHYSICS]: 'Physics',
        [DemoCategory.FRACTAL]: 'Fractal',
        [DemoCategory.IMAGE]: 'Image',
        [DemoCategory.CAMERA]: 'Camera'
    },
    'zh': {
        [DemoCategory.BASIC]: '基础入门',
        [DemoCategory.GAME]: '游戏示例',
        [DemoCategory.GRAPHICS]: '图形绘制',
        [DemoCategory.ALGORITHM]: '算法可视化',
        [DemoCategory.PHYSICS]: '物理模拟',
        [DemoCategory.FRACTAL]: '分形与数学',
        [DemoCategory.IMAGE]: '图像处理',
        [DemoCategory.CAMERA]: '摄像头'
    }
};

/**
 * Demo 信息数据类
 */
export interface DemoInfo {
    title: string;
    description: string;
    category: DemoCategory;
}

/**
 * Demo 选项数据类
 */
export interface DemoOption {
    displayName: string;
    fileName: string | null;
    info: DemoInfo | null;
}

/**
 * Demo 元数据注册表
 * 包含所有 Demo 的中文和英文标题和描述
 */
class DemoMetadataRegistry {
    private metadata: { [key: string]: { zh: DemoInfo, en: DemoInfo } } = {
        // 基础入门
        'main.cpp': {
            zh: { title: 'Hello World', description: '最简单的EGE程序，初始化窗口并显示', category: DemoCategory.BASIC },
            en: { title: 'Hello World', description: 'The simplest EGE program, initialize window and display', category: DemoCategory.BASIC }
        },
        
        // 摄像头
        'camera_base.cpp': {
            zh: { title: '摄像头基础', description: '调用系统摄像头，支持切换设备和分辨率', category: DemoCategory.CAMERA },
            en: { title: 'Camera Basic', description: 'Call system camera, support device and resolution switching', category: DemoCategory.CAMERA }
        },
        'camera_wave.cpp': {
            zh: { title: '摄像头水波特效', description: '实时摄像头画面配合水波网格变形效果', category: DemoCategory.CAMERA },
            en: { title: 'Camera Wave Effect', description: 'Real-time camera feed with water wave mesh deformation effect', category: DemoCategory.CAMERA }
        },
        
        // 游戏示例
        'game_gomoku.cpp': {
            zh: { title: '五子棋', description: '经典五子棋游戏，带简单AI对手和音效', category: DemoCategory.GAME },
            en: { title: 'Gomoku', description: 'Classic Gomoku game with simple AI opponent and sound effects', category: DemoCategory.GAME }
        },
        'game_snake.cpp': {
            zh: { title: '贪吃蛇', description: '约90行代码实现的精简版贪吃蛇游戏', category: DemoCategory.GAME },
            en: { title: 'Snake Game', description: 'Simplified snake game implemented in about 90 lines of code', category: DemoCategory.GAME }
        },
        'game_tetris.cpp': {
            zh: { title: '俄罗斯方块', description: '完整的俄罗斯方块游戏实现', category: DemoCategory.GAME },
            en: { title: 'Tetris', description: 'Complete Tetris game implementation', category: DemoCategory.GAME }
        },
        'game_type.cpp': {
            zh: { title: '打字练习', description: '字母下落式打字练习小游戏', category: DemoCategory.GAME },
            en: { title: 'Typing Practice', description: 'Letter-falling typing practice mini game', category: DemoCategory.GAME }
        },
        
        // 图形绘制
        'graph_5star.cpp': {
            zh: { title: '五角星旋转', description: '绘制五角星并展示旋转动画效果', category: DemoCategory.GRAPHICS },
            en: { title: '5-Star Rotation', description: 'Draw a pentagram and demonstrate rotation animation', category: DemoCategory.GRAPHICS }
        },
        'graph_alpha.cpp': {
            zh: { title: 'Alpha透明度', description: '演示Alpha通道透明度与图层混合', category: DemoCategory.GRAPHICS },
            en: { title: 'Alpha Transparency', description: 'Demonstrate alpha channel transparency and layer blending', category: DemoCategory.GRAPHICS }
        },
        'graph_arrow.cpp': {
            zh: { title: '箭头绘制', description: '多种箭头绘制算法演示', category: DemoCategory.GRAPHICS },
            en: { title: 'Arrow Drawing', description: 'Demonstration of various arrow drawing algorithms', category: DemoCategory.GRAPHICS }
        },
        'graph_clock.cpp': {
            zh: { title: '模拟时钟', description: '绘制带时针分针秒针的模拟时钟', category: DemoCategory.GRAPHICS },
            en: { title: 'Analog Clock', description: 'Draw analog clock with hour, minute and second hands', category: DemoCategory.GRAPHICS }
        },
        'graph_getimage.cpp': {
            zh: { title: '图片加载', description: '演示如何加载显示PNG/JPG图片', category: DemoCategory.IMAGE },
            en: { title: 'Image Loading', description: 'Demonstrate how to load and display PNG/JPG images', category: DemoCategory.IMAGE }
        },
        'graph_lines.cpp': {
            zh: { title: '变幻线', description: '多边形变幻线屏保特效', category: DemoCategory.GRAPHICS },
            en: { title: 'Morphing Lines', description: 'Polygon morphing lines screensaver effect', category: DemoCategory.GRAPHICS }
        },
        'graph_new_drawimage.cpp': {
            zh: { title: '图像变换', description: 'PIMAGE图像绘制与矩阵变换', category: DemoCategory.IMAGE },
            en: { title: 'Image Transform', description: 'PIMAGE image drawing and matrix transformation', category: DemoCategory.IMAGE }
        },
        'graph_rotateimage.cpp': {
            zh: { title: '图片旋转', description: '图片旋转缩放动画演示', category: DemoCategory.IMAGE },
            en: { title: 'Image Rotation', description: 'Image rotation and scaling animation demonstration', category: DemoCategory.IMAGE }
        },
        'graph_rotatetransparent.cpp': {
            zh: { title: '透明旋转', description: '带透明背景的图片旋转', category: DemoCategory.IMAGE },
            en: { title: 'Transparent Rotation', description: 'Image rotation with transparent background', category: DemoCategory.IMAGE }
        },
        'graph_star.cpp': {
            zh: { title: '星空屏保', description: '满天繁星流动的屏保效果', category: DemoCategory.GRAPHICS },
            en: { title: 'Starfield Screensaver', description: 'Flowing starfield screensaver effect', category: DemoCategory.GRAPHICS }
        },
        'graph_triangle.cpp': {
            zh: { title: '渐变三角形', description: '彩色渐变填充三角形动画', category: DemoCategory.GRAPHICS },
            en: { title: 'Gradient Triangle', description: 'Colorful gradient-filled triangle animation', category: DemoCategory.GRAPHICS }
        },
        
        // 算法可视化
        'graph_astar_pathfinding.cpp': {
            zh: { title: 'A*寻路算法', description: 'A*路径搜索算法的可视化演示', category: DemoCategory.ALGORITHM },
            en: { title: 'A* Pathfinding', description: 'Visualization of A* path search algorithm', category: DemoCategory.ALGORITHM }
        },
        'graph_sort_visualization.cpp': {
            zh: { title: '排序算法可视化', description: '11种排序算法的动态可视化对比', category: DemoCategory.ALGORITHM },
            en: { title: 'Sorting Visualization', description: 'Dynamic visualization comparison of 11 sorting algorithms', category: DemoCategory.ALGORITHM }
        },
        'graph_kmeans.cpp': {
            zh: { title: 'K-Means聚类', description: 'K-Means机器学习算法可视化', category: DemoCategory.ALGORITHM },
            en: { title: 'K-Means Clustering', description: 'Visualization of K-Means machine learning algorithm', category: DemoCategory.ALGORITHM }
        },
        'graph_game_of_life.cpp': {
            zh: { title: '生命游戏', description: '康威生命游戏元胞自动机模拟', category: DemoCategory.ALGORITHM },
            en: { title: 'Game of Life', description: 'Conway\'s Game of Life cellular automaton simulation', category: DemoCategory.ALGORITHM }
        },
        'graph_function_visualization.cpp': {
            zh: { title: '函数图像', description: '基于蒙特卡洛法的2D数学函数绘制', category: DemoCategory.FRACTAL },
            en: { title: 'Function Visualization', description: '2D mathematical function drawing based on Monte Carlo method', category: DemoCategory.FRACTAL }
        },
        
        // 物理模拟
        'graph_ball.cpp': {
            zh: { title: '弹球碰撞', description: '多彩弹球物理碰撞模拟', category: DemoCategory.PHYSICS },
            en: { title: 'Ball Collision', description: 'Colorful ball physics collision simulation', category: DemoCategory.PHYSICS }
        },
        'graph_boids.cpp': {
            zh: { title: '群集模拟', description: 'Boids算法模拟鸟群/鱼群行为', category: DemoCategory.PHYSICS },
            en: { title: 'Boids Simulation', description: 'Boids algorithm simulating flock/school behavior', category: DemoCategory.PHYSICS }
        },
        'graph_mouseball.cpp': {
            zh: { title: '鼠标拖动弹球', description: '用鼠标拖动弹球的物理模拟', category: DemoCategory.PHYSICS },
            en: { title: 'Mouse Drag Ball', description: 'Physics simulation of dragging balls with mouse', category: DemoCategory.PHYSICS }
        },
        'graph_wave_net.cpp': {
            zh: { title: '碧波荡漾', description: '鼠标拖动弹力网格物理模拟', category: DemoCategory.PHYSICS },
            en: { title: 'Rippling Waves', description: 'Physics simulation of elastic mesh dragged by mouse', category: DemoCategory.PHYSICS }
        },
        
        // 分形与数学
        'graph_julia.cpp': {
            zh: { title: 'Julia集', description: 'Julia分形集屏保动画', category: DemoCategory.FRACTAL },
            en: { title: 'Julia Set', description: 'Julia fractal set screensaver animation', category: DemoCategory.FRACTAL }
        },
        'graph_mandelbrot.cpp': {
            zh: { title: 'Mandelbrot集', description: '鼠标缩放Mandelbrot分形集', category: DemoCategory.FRACTAL },
            en: { title: 'Mandelbrot Set', description: 'Mouse zoom Mandelbrot fractal set', category: DemoCategory.FRACTAL }
        },
        'graph_catharine.cpp': {
            zh: { title: '烟花特效', description: '绚丽的烟花粒子效果', category: DemoCategory.GRAPHICS },
            en: { title: 'Fireworks Effect', description: 'Gorgeous fireworks particle effect', category: DemoCategory.GRAPHICS }
        }
    };

    /**
     * 获取指定文件的元数据
     */
    getInfo(fileName: string | null, language: string = 'zh'): DemoInfo | null {
        if (fileName === null) {
            fileName = 'main.cpp';
        }
        const meta = this.metadata[fileName];
        if (!meta) {
            return null;
        }
        return language === 'zh' ? meta.zh : meta.en;
    }

    /**
     * 获取默认的 Hello World 信息
     */
    getDefaultInfo(language: string = 'zh'): DemoInfo {
        return this.getInfo('main.cpp', language)!;
    }
}

/**
 * Demo 选项管理器
 */
export class DemoOptionsManager {
    private static registry = new DemoMetadataRegistry();
    private static demosDir: string = '';

    /**
     * 设置 demos 目录路径
     */
    static setDemosDir(dir: string): void {
        this.demosDir = dir;
    }

    /**
     * 获取所有可用的 Demo 选项
     */
    static getDemoOptions(language: string = 'zh'): DemoOption[] {
        const options: DemoOption[] = [];
        
        // 添加默认的 Hello World 选项
        const defaultInfo = this.registry.getDefaultInfo(language);
        options.push({
            displayName: defaultInfo.title,
            fileName: null,
            info: defaultInfo
        });
        
        // 从 ege_demos 目录动态加载 Demo 文件
        try {
            const demoFiles = this.discoverDemoFiles();
            demoFiles.sort().forEach(fileName => {
                const info = this.registry.getInfo(fileName, language);
                const displayName = info ? info.title : this.generateDisplayName(fileName);
                options.push({
                    displayName,
                    fileName,
                    info
                });
            });
        } catch (e) {
            console.error('Failed to load demo options', e);
        }
        
        return options;
    }

    /**
     * 按分类获取 Demo 选项
     */
    static getDemoOptionsByCategory(language: string = 'zh'): Map<DemoCategory, DemoOption[]> {
        const options = this.getDemoOptions(language);
        const categoryMap = new Map<DemoCategory, DemoOption[]>();
        
        options.forEach(option => {
            if (option.info) {
                const category = option.info.category;
                if (!categoryMap.has(category)) {
                    categoryMap.set(category, []);
                }
                categoryMap.get(category)!.push(option);
            }
        });
        
        return categoryMap;
    }

    /**
     * 从文件名生成默认显示名称（当没有元数据时使用）
     */
    private static generateDisplayName(fileName: string): string {
        return fileName
            .replace('.cpp', '')
            .replace(/_/g, ' ')
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    /**
     * 扫描 ege_demos 目录，发现所有 .cpp 文件
     */
    private static discoverDemoFiles(): string[] {
        const files: string[] = [];
        
        if (!this.demosDir || !fs.existsSync(this.demosDir)) {
            console.warn('Demos directory not found:', this.demosDir);
            return files;
        }
        
        try {
            const dirFiles = fs.readdirSync(this.demosDir);
            dirFiles.forEach(file => {
                if (file.endsWith('.cpp')) {
                    files.push(file);
                }
            });
        } catch (e) {
            console.error('Failed to discover demo files', e);
        }
        
        return files;
    }
}
