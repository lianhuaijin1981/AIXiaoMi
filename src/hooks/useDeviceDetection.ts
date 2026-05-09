import { useState, useEffect, useCallback } from 'react'
import type { DeviceBrand, DeviceInfo, ScanMethod } from '../types/3d-scan'
import { detectDeviceBrand, getBrandScanConfig } from '../types/3d-scan'

/**
 * 设备兼容性检测 Hook
 * 检测用户设备品牌、型号、浏览器兼容性
 */
export function useDeviceDetection() {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null)
  const [isDetecting, setIsDetecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // 检测设备信息
  const detectDevice = useCallback(() => {
    setIsDetecting(true)
    setError(null)
    
    try {
      const userAgent = navigator.userAgent
      const brand = detectDeviceBrand(userAgent)
      
      // 检测操作系统
      const isIOS = /iPad|iPhone|iPod/.test(userAgent)
      const isAndroid = /Android/.test(userAgent)
      const os: 'ios' | 'android' | 'other' = isIOS ? 'ios' : isAndroid ? 'android' : 'other'
      
      // 检测操作系统版本
      let osVersion: string | undefined
      if (isIOS) {
        const match = userAgent.match(/OS (\d+)_(\d+)/)
        if (match) {
          osVersion = `${match[1]}.${match[2]}`
        }
      } else if (isAndroid) {
        const match = userAgent.match(/Android (\d+\.?\d*)/)
        if (match) {
          osVersion = match[1]
        }
      }
      
      // 检测浏览器
      let browser = 'Unknown'
      if (/Chrome/.test(userAgent) && !/Edge/.test(userAgent)) {
        browser = 'Chrome'
      } else if (/Firefox/.test(userAgent)) {
        browser = 'Firefox'
      } else if (/Safari/.test(userAgent) && !/Chrome/.test(userAgent)) {
        browser = 'Safari'
      } else if (/Edge/.test(userAgent)) {
        browser = 'Edge'
      } else if (/MSIE|Trident/.test(userAgent)) {
        browser = 'IE'
      }
      
      // 检测硬件能力
      const hasCamera = 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices
      
      // 检测 WebXR 支持
      const hasARSupport = 'xr' in navigator || 
        (isAndroid && /Chrome\/([89][0-9]|[1-9][0-9]{2,})/.test(userAgent))
      
      // 检测 LiDAR 支持（iPhone 12 Pro 及以上）
      let hasLiDAR = false
      if (isIOS && osVersion) {
        const majorVersion = parseInt(osVersion.split('.')[0])
        const isPro = /iPhone1[3-9]|iPhone[2-9][0-9]/.test(userAgent) && /Pro/.test(userAgent)
        hasLiDAR = isPro && majorVersion >= 14 // iOS 14+ 且是 Pro 机型
      }
      
      // 获取推荐扫描方法
      const brandConfig = getBrandScanConfig(brand)
      const recommendedMethod: ScanMethod = brandConfig.supportedMethods[0]
      
      // 尝试获取设备型号
      let model: string | undefined
      if (isIOS) {
        const match = userAgent.match(/iPhone OS (\d+)/)
        if (match) {
          model = `iPhone (iOS ${match[1]})`
        }
      } else if (isAndroid) {
        const match = userAgent.match(/;\s*([^;]+)\s+Build/)
        if (match) {
          model = match[1].trim()
        }
      }
      
      const info: DeviceInfo = {
        brand,
        model,
        os,
        osVersion,
        browser,
        hasCamera,
        hasARSupport,
        hasLiDAR,
        recommendedMethod
      }
      
      setDeviceInfo(info)
      setIsDetecting(false)
      
      return info
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : '设备检测失败'
      setError(errorMsg)
      setIsDetecting(false)
      return null
    }
  }, [])
  
  // 组件挂载时自动检测
  useEffect(() => {
    detectDevice()
  }, [detectDevice])
  
  // 重新检测
  const refresh = useCallback(() => {
    detectDevice()
  }, [detectDevice])
  
  return {
    deviceInfo,
    isDetecting,
    error,
    refresh
  }
}

/**
 * 获取设备品牌显示名称
 */
export function useDeviceBrandName(): string {
  const { deviceInfo } = useDeviceDetection()
  
  if (!deviceInfo) {
    return '正在检测...'
  }
  
  const BRAND_NAMES: Record<DeviceBrand, string> = {
    xiaomi: '小米',
    huawei: '华为',
    apple: '苹果',
    oppo: 'OPPO',
    vivo: 'Vivo',
    samsung: '三星',
    other: '其他'
  }
  
  return BRAND_NAMES[deviceInfo.brand] || '未知'
}

/**
 * 检查浏览器是否支持 WebXR
 */
export function useWebXRSupport(): boolean {
  const [supported, setSupported] = useState(false)
  
  useEffect(() => {
    const checkWebXR = async () => {
      if ('xr' in navigator) {
        try {
          const xr = (navigator as any).xr
          const supported = await xr.isSessionSupported('immersive-ar')
          setSupported(supported)
        } catch (err) {
          setSupported(false)
        }
      } else {
        setSupported(false)
      }
    }
    
    checkWebXR()
  }, [])
  
  return supported
}

/**
 * 检查摄像头权限
 */
export function useCameraPermission(): {
  hasPermission: boolean | null
  requestPermission: () => Promise<boolean>
} {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!('mediaDevices' in navigator)) {
      setHasPermission(false)
      return false
    }
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      stream.getTracks().forEach(track => track.stop())
      setHasPermission(true)
      return true
    } catch (err) {
      setHasPermission(false)
      return false
    }
  }, [])
  
  useEffect(() => {
    // 检查权限状态（如果可能）
    if ('permissions' in navigator) {
      navigator.permissions.query({ name: 'camera' as PermissionName })
        .then(result => {
          if (result.state === 'granted') {
            setHasPermission(true)
          } else if (result.state === 'denied') {
            setHasPermission(false)
          } else {
            setHasPermission(null) // 未知，需要请求
          }
        })
        .catch(() => {
          setHasPermission(null)
        })
    }
  }, [])
  
  return {
    hasPermission,
    requestPermission
  }
}
