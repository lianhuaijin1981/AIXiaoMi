// 3D 扫描相关类型定义

// 支持的设备品牌
export type DeviceBrand = 'xiaomi' | 'huawei' | 'apple' | 'oppo' | 'vivo' | 'samsung' | 'other'

// 品牌显示名称映射
export const BRAND_NAMES: Record<DeviceBrand, string> = {
  xiaomi: '小米',
  huawei: '华为',
  apple: '苹果',
  oppo: 'OPPO',
  vivo: 'Vivo',
  samsung: '三星',
  other: '其他'
}

// 设备信息
export interface DeviceInfo {
  brand: DeviceBrand
  model?: string
  os: 'ios' | 'android' | 'other'
  osVersion?: string
  browser: string
  hasCamera: boolean
  hasARSupport: boolean
  hasLiDAR: boolean // 是否支持 LiDAR（iPhone 12 Pro 及以上）
  recommendedMethod: ScanMethod
}

// 扫描方法
export type ScanMethod = 
  | 'arkit'      // iOS ARKit
  | 'arengine'   // 华为 AREngine
  | 'mi-ar'      // 小米 AR
  | 'oppo-ar'    // OPPO AR
  | 'vivo-ar'    // Vivo AR
  | 'webxr'      // WebXR API
  | 'camera'     // 普通相机 + 上传照片
  | 'upload'     // 直接上传 3D 模型

// 扫描方法显示信息
export interface ScanMethodInfo {
  method: ScanMethod
  title: string
  description: string
  steps: string[]
  requirements: string[]
  icon: string
}

// 扫描状态
export type ScanStatus = 
  | 'idle'           // 空闲
  | 'detecting'      // 检测设备
  | 'preparing'      // 准备扫描
  | 'scanning'       // 扫描中
  | 'processing'     // 处理中
  | 'uploading'      // 上传中
  | 'completed'      // 已完成
  | 'error'          // 错误

// 扫描状态显示标签
export const SCAN_STATUS_LABELS: Record<ScanStatus, string> = {
  idle: '未开始',
  detecting: '检测设备中',
  preparing: '准备扫描',
  scanning: '扫描中',
  processing: '处理中',
  uploading: '上传中',
  completed: '已完成',
  error: '错误'
}

// 3D 模型格式
export type ModelFormat = 'obj' | 'fbx' | 'gltf' | 'glb' | 'stl' | 'ply'

// 3D 模型信息
export interface Model3D {
  id: string
  userId: string
  fileName: string
  format: ModelFormat
  fileSize: number
  fileUrl: string
  thumbnailUrl?: string
  vertices?: number // 顶点数
  faces?: number    // 面数
  createdAt: string
  updatedAt: string
}

// 扫描会话
export interface ScanSession {
  id: string
  userId: string
  deviceInfo: DeviceInfo
  method: ScanMethod
  status: ScanStatus
  progress: number // 0-100
  modelId?: string
  error?: string
  createdAt: string
  updatedAt: string
}

// 品牌支持的扫描方法配置
export interface BrandScanConfig {
  brand: DeviceBrand
  supportedMethods: ScanMethod[]
  setupGuide: string[]
  tips: string[]
}

// 获取设备品牌 from UserAgent
export function detectDeviceBrand(userAgent: string): DeviceBrand {
  const ua = userAgent.toLowerCase()
  
  if (ua.includes('mi ') || ua.includes('miui') || ua.includes('redmi')) {
    return 'xiaomi'
  }
  if (ua.includes('huawei') || ua.includes('harmonyos') || ua.includes('emui')) {
    return 'huawei'
  }
  if (ua.includes('iphone') || ua.includes('ipad') || ua.includes('mac os')) {
    return 'apple'
  }
  if (ua.includes('oppo') || ua.includes('coloros')) {
    return 'oppo'
  }
  if (ua.includes('vivo') || ua.includes('funtouch')) {
    return 'vivo'
  }
  if (ua.includes('samsung') || ua.includes('galaxy')) {
    return 'samsung'
  }
  
  return 'other'
}

// 获取扫描方法信息
export function getScanMethodInfo(method: ScanMethod): ScanMethodInfo {
  const methodMap: Record<ScanMethod, ScanMethodInfo> = {
    arkit: {
      method: 'arkit',
      title: 'iOS ARKit 扫描',
      description: '使用 iPhone/iPad 的 ARKit 框架进行高精度 3D 扫描',
      steps: [
        '打开"测量"应用或兼容的 3D 扫描应用',
        '选择"3D 扫描"模式',
        '围绕头部缓慢旋转扫描（保持 30-50cm 距离）',
        '确保光线充足，避免强光直射',
        '完成后导出 .obj 或 .usd 格式',
        '返回本页面上传文件'
      ],
      requirements: [
        'iPhone/iPad（iOS 12+）',
        '建议：iPhone 12 Pro 及以上（LiDAR 扫描更精准）',
        '需要安装 3D 扫描应用（如 Qlone、Scandy Pro、Heges）'
      ],
      icon: '📱'
    },
    arengine: {
      method: 'arengine',
      title: '华为 AREngine 扫描',
      description: '使用华为 AREngine 进行 3D 人脸识别与重建',
      steps: [
        '打开华为"3D 建模"应用或 AR Engine 示例应用',
        '选择"人脸扫描"模式',
        '保持面部正对摄像头，缓慢旋转头部',
        '确保光线均匀，避免阴影',
        '导出 .obj 或 .fbx 格式',
        '返回本页面上传文件'
      ],
      requirements: [
        '华为手机（Mate 20 及以上）',
        'EMUI 9.0+ 或 HarmonyOS 2.0+',
        '需要安装华为 3D 建模应用'
      ],
      icon: '🔷'
    },
    'mi-ar': {
      method: 'mi-ar',
      title: '小米 AR 扫描',
      description: '使用小米 MACE + ARCore 进行 3D 扫描',
      steps: [
        '打开小米"3D 扫描"功能（MIUI 12+）',
        '或在应用商店下载"3D Scanner"应用',
        '选择"人体扫描"或"头部扫描"',
        '按照引导完成 360° 扫描',
        '导出 .obj 格式文件',
        '返回本页面上传文件'
      ],
      requirements: [
        '小米手机（Mi 8 及以上）',
        'MIUI 12+ 或 Android 8.0+',
        '需要支持 ARCore'
      ],
      icon: '📷'
    },
    'oppo-ar': {
      method: 'oppo-ar',
      title: 'OPPO AR 扫描',
      description: '使用 OPPO ARUnit 进行 3D 建模',
      steps: [
        '打开"OPPO 3D 建模"应用（ColorOS 11+）',
        '选择"人脸重建"功能',
        '按照屏幕引导完成扫描',
        '保持静止，避免抖动',
        '导出模型文件',
        '返回本页面上传文件'
      ],
      requirements: [
        'OPPO 手机（Reno 系列、Find 系列）',
        'ColorOS 11+',
        '需要支持 ARUnit'
      ],
      icon: '🔶'
    },
    'vivo-ar': {
      method: 'vivo-ar',
      title: 'Vivo AR 扫描',
      description: '使用 Vivo AR 引擎进行 3D 人脸扫描',
      steps: [
        '打开"vivo 3D 扫描"应用（Funtouch OS 10+）',
        '选择"人体建模"功能',
        '按照引导完成头部扫描',
        '确保光线充足',
        '导出 .obj 或 .fbx 格式',
        '返回本页面上传文件'
      ],
      requirements: [
        'Vivo 手机（X 系列、NEX 系列）',
        'Funtouch OS 10+ 或 OriginOS',
        '需要支持 ARCore'
      ],
      icon: '🔵'
    },
    webxr: {
      method: 'webxr',
      title: 'WebXR 浏览器扫描',
      description: '使用浏览器 WebXR API 进行简易 3D 扫描（实验性）',
      steps: [
        '确保使用 Chrome 81+ 或 Edge 81+',
        '点击"开始扫描"按钮',
        '授权摄像头访问权限',
        '围绕头部缓慢旋转（需要他人协助拍摄）',
        '系统将自动生成简易 3D 模型',
        '预览并确认上传'
      ],
      requirements: [
        'Chrome 81+ 或 Edge 81+',
        '需要摄像头权限',
        '精度较低，仅支持简易建模'
      ],
      icon: '🌐'
    },
    camera: {
      method: 'camera',
      title: '照片上传 + AI 重建',
      description: '上传多张照片，使用 AI 算法重建 3D 模型',
      steps: [
        '准备 10-20 张清晰照片（正面、侧面、45°角）',
        '确保光线充足，背景简洁',
        '上传照片到本页面',
        '系统将使用 AI 算法重建 3D 模型',
        '等待处理完成（约 2-5 分钟）',
        '预览并确认上传'
      ],
      requirements: [
        '需要上传多张清晰照片',
        '建议使用纯色背景',
        '处理时间较长'
      ],
      icon: '📸'
    },
    upload: {
      method: 'upload',
      title: '直接上传 3D 模型',
      description: '如果您已有 3D 模型文件，可直接上传',
      steps: [
        '点击"选择文件"按钮',
        '选择 .obj、.fbx、.gltf、.glb 格式文件',
        '等待上传完成',
        '预览 3D 模型',
        '确认并保存'
      ],
      requirements: [
        '支持格式：.obj、.fbx、.gltf、.glb、.stl、.ply',
        '文件大小限制：50MB',
        '建议使用标准 3D 模型格式'
      ],
      icon: '📦'
    }
  }
  
  return methodMap[method]
}

// 获取品牌扫描配置
export function getBrandScanConfig(brand: DeviceBrand): BrandScanConfig {
  const configMap: Record<DeviceBrand, BrandScanConfig> = {
    xiaomi: {
      brand: 'xiaomi',
      supportedMethods: ['mi-ar', 'camera', 'upload'],
      setupGuide: [
        '打开"设置" → "应用设置" → "应用管理"',
        '搜索"3D 扫描"或"AR 测量"',
        '如果没有，请在应用商店搜索"3D Scanner"'
      ],
      tips: [
        '建议使用 Mi 11 及以上机型',
        '确保光线充足，避免强光直射',
        '扫描时保持手机稳定'
      ]
    },
    huawei: {
      brand: 'huawei',
      supportedMethods: ['arengine', 'camera', 'upload'],
      setupGuide: [
        '打开"华为 3D 建模"应用',
        '或在应用市场搜索"3D 建模"',
        '确保已安装 AR Engine SDK'
      ],
      tips: [
        '建议使用 Mate 30 及以上机型',
        'HarmonyOS 2.0+ 体验更佳',
        '可以使用鸿蒙系统的"3D 人脸"功能'
      ]
    },
    apple: {
      brand: 'apple',
      supportedMethods: ['arkit', 'camera', 'upload'],
      setupGuide: [
        '打开 App Store，搜索"3D 扫描"',
        '推荐应用：Qlone、Scandy Pro、Heges',
        '或使用"测量"应用的 3D 扫描功能'
      ],
      tips: [
        'iPhone 12 Pro 及以上（LiDAR）扫描更精准',
        '建议使用 Qlone 应用（操作简单）',
        '可以导出高质量 .obj 文件'
      ]
    },
    oppo: {
      brand: 'oppo',
      supportedMethods: ['oppo-ar', 'camera', 'upload'],
      setupGuide: [
        '打开"OPPO 3D 建模"应用',
        '或在软件商店搜索"3D 扫描"',
        '确保 ColorOS 11+'
      ],
      tips: [
        '建议使用 Reno 6 及以上机型',
        'ARUnit 需要在开发者选项中启用',
        '扫描时保持 30-50cm 距离'
      ]
    },
    vivo: {
      brand: 'vivo',
      supportedMethods: ['vivo-ar', 'camera', 'upload'],
      setupGuide: [
        '打开"vivo 3D 扫描"应用',
        '或在应用商店搜索"3D Scanner"',
        '确保 Funtouch OS 10+'
      ],
      tips: [
        '建议使用 X60 及以上机型',
        '支持 ARCore 的机型体验更佳',
        '可以使用"3D 人体建模"功能'
      ]
    },
    samsung: {
      brand: 'samsung',
      supportedMethods: ['webxr', 'camera', 'upload'],
      setupGuide: [
        '打开 Galaxy Store，搜索"3D 扫描"',
        '推荐应用：Samsung 3D Scanner',
        '或使用 ARCore 兼容应用'
      ],
      tips: [
        '建议使用 Galaxy S10 及以上机型',
        '支持 ARCore 的机型可以使用 Google 3D Scan',
        '可以导出 .obj 格式'
      ]
    },
    other: {
      brand: 'other',
      supportedMethods: ['webxr', 'camera', 'upload'],
      setupGuide: [
        '使用 Chrome 或 Edge 浏览器',
        '访问在线 3D 扫描工具',
        '或直接在本文上传 3D 模型'
      ],
      tips: [
        '建议使用支持 ARCore 的 Android 手机',
        '可以在应用商店搜索"3D Scanner"',
        '直接使用上传功能最快'
      ]
    }
  }
  
  return configMap[brand]
}
