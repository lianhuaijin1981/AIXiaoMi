import React, { useState, useCallback } from 'react'
import { useDeviceDetection } from '../hooks/useDeviceDetection'
import type { DeviceBrand, ScanMethod, ScanStatus, ScanMethodInfo } from '../types/3d-scan'
import { BRAND_NAMES, getScanMethodInfo, getBrandScanConfig, SCAN_STATUS_LABELS } from '../types/3d-scan'

/**
 * 3D 扫描引导组件
 * 提供分品牌的扫描引导流程
 */
export default function ThreeDScanGuide() {
  const { deviceInfo, isDetecting, error, refresh } = useDeviceDetection()
  const [selectedMethod, setSelectedMethod] = useState<ScanMethod | null>(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [scanStatus, setScanStatus] = useState<ScanStatus>('idle')
  const [showMethodSelector, setShowMethodSelector] = useState(false)
  
  // 处理扫描方法选择
  const handleMethodSelect = useCallback((method: ScanMethod) => {
    setSelectedMethod(method)
    setShowMethodSelector(false)
    setCurrentStep(0)
    setScanStatus('preparing')
  }, [])
  
  // 处理下一步
  const handleNextStep = useCallback(() => {
    if (!selectedMethod) return
    
    const methodInfo = getScanMethodInfo(selectedMethod)
    if (currentStep < methodInfo.steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      // 所有步骤完成
      setScanStatus('completed')
    }
  }, [selectedMethod, currentStep])
  
  // 处理上一步
  const handlePrevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }, [currentStep])
  
  // 重新开始
  const handleRestart = useCallback(() => {
    setSelectedMethod(null)
    setCurrentStep(0)
    setScanStatus('idle')
    setShowMethodSelector(false)
  }, [])
  
  // 渲染设备检测界面
  const renderDeviceDetection = () => {
    if (isDetecting) {
      return (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">正在检测您的设备...</p>
        </div>
      )
    }
    
    if (error) {
      return (
        <div className="text-center py-8">
          <div className="text-red-500 mb-4">
            <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={refresh}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            重新检测
          </button>
        </div>
      )
    }
    
    if (!deviceInfo) {
      return null
    }
    
    const brandName = BRAND_NAMES[deviceInfo.brand]
    const brandConfig = getBrandScanConfig(deviceInfo.brand)
    
    return (
      <div className="space-y-6">
        {/* 设备信息卡片 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">检测结果</h3>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-500">设备品牌</p>
              <p className="font-medium">{brandName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">设备型号</p>
              <p className="font-medium">{deviceInfo.model || '未知'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">操作系统</p>
              <p className="font-medium">
                {deviceInfo.os === 'ios' ? 'iOS' : deviceInfo.os === 'android' ? 'Android' : '其他'}
                {deviceInfo.osVersion && ` ${deviceInfo.osVersion}`}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">浏览器</p>
              <p className="font-medium">{deviceInfo.browser}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 text-sm">
            <div className={`flex items-center ${deviceInfo.hasCamera ? 'text-green-600' : 'text-red-600'}`}>
              <span className="mr-1">{deviceInfo.hasCamera ? '✓' : '✗'}</span>
              摄像头
            </div>
            <div className={`flex items-center ${deviceInfo.hasARSupport ? 'text-green-600' : 'text-gray-400'}`}>
              <span className="mr-1">{deviceInfo.hasARSupport ? '✓' : '✗'}</span>
              AR 支持
            </div>
            <div className={`flex items-center ${deviceInfo.hasLiDAR ? 'text-green-600' : 'text-gray-400'}`}>
              <span className="mr-1">{deviceInfo.hasLiDAR ? '✓' : '✗'}</span>
              LiDAR
            </div>
          </div>
        </div>
        
        {/* 推荐扫描方法 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">推荐扫描方法</h3>
          
          <div className="space-y-3">
            {brandConfig.supportedMethods.map((method, index) => {
              const methodInfo = getScanMethodInfo(method)
              const isRecommended = index === 0
              
              return (
                <div
                  key={method}
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    isRecommended ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'
                  }`}
                  onClick={() => handleMethodSelect(method)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">{methodInfo.icon}</span>
                      <div>
                        <h4 className="font-medium">{methodInfo.title}</h4>
                        {isRecommended && (
                          <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded">推荐</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">{methodInfo.description}</p>
                </div>
              )
            })}
          </div>
        </div>
        
        {/* 设置指南 */}
        {brandConfig.setupGuide.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">设置指南</h3>
            <ol className="list-decimal list-inside space-y-2">
              {brandConfig.setupGuide.map((step, index) => (
                <li key={index} className="text-gray-700">{step}</li>
              ))}
            </ol>
          </div>
        )}
        
        {/* 提示 */}
        {brandConfig.tips.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-medium text-yellow-800 mb-2">💡 提示</h4>
            <ul className="list-disc list-inside space-y-1">
              {brandConfig.tips.map((tip, index) => (
                <li key={index} className="text-sm text-yellow-700">{tip}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    )
  }
  
  // 渲染扫描方法详情
  const renderMethodGuide = () => {
    if (!selectedMethod) return null
    
    const methodInfo = getScanMethodInfo(selectedMethod)
    const isCompleted = scanStatus === 'completed'
    
    return (
      <div className="space-y-6">
        {/* 方法标题 */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <span className="text-3xl">{methodInfo.icon}</span>
              <div>
                <h3 className="text-lg font-semibold">{methodInfo.title}</h3>
                <p className="text-sm text-gray-600">{methodInfo.description}</p>
              </div>
            </div>
            <button
              onClick={handleRestart}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              ← 返回
            </button>
          </div>
          
          {/* 状态指示 */}
          <div className="mb-4">
            <span className={`inline-block px-3 py-1 rounded-full text-sm ${
              isCompleted ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
            }`}>
              状态：{SCAN_STATUS_LABELS[scanStatus]}
            </span>
          </div>
        </div>
        
        {/* 操作步骤 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h4 className="font-semibold mb-4">操作步骤</h4>
          
          <div className="space-y-4">
            {methodInfo.steps.map((step, index) => (
              <div
                key={index}
                className={`flex items-start space-x-3 ${
                  index < currentStep ? 'opacity-50' : ''
                } ${
                  index === currentStep ? 'font-medium' : ''
                }`}
              >
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  index < currentStep ? 'bg-green-500 text-white' : 
                  index === currentStep ? 'bg-blue-500 text-white' : 
                  'bg-gray-200 text-gray-600'
                }`}>
                  {index < currentStep ? '✓' : index + 1}
                </div>
                <div className="flex-1 pt-1">
                  <p className={index === currentStep ? 'text-gray-900' : 'text-gray-600'}>
                    {step}
                  </p>
                </div>
              </div>
            ))}
          </div>
          
          {/* 导航按钮 */}
          {!isCompleted && (
            <div className="flex justify-between mt-6">
              <button
                onClick={handlePrevStep}
                disabled={currentStep === 0}
                className={`px-4 py-2 rounded-lg ${
                  currentStep === 0
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                } transition-colors`}
              >
                上一步
              </button>
              
              <button
                onClick={handleNextStep}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                {currentStep === methodInfo.steps.length - 1 ? '完成' : '下一步'}
              </button>
            </div>
          )}
          
          {isCompleted && (
            <div className="mt-6 text-center">
              <div className="text-green-500 mb-4">
                <svg className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-green-600 font-medium mb-4">🎉 扫描准备完成！</p>
              <p className="text-gray-600 mb-4">现在您可以上传 3D 模型文件了</p>
              <button
                onClick={handleRestart}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                重新选择方法
              </button>
            </div>
          )}
        </div>
        
        {/* 要求 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h4 className="font-semibold mb-4">要求</h4>
          <ul className="space-y-2">
            {methodInfo.requirements.map((req, index) => (
              <li key={index} className="flex items-start space-x-2">
                <span className="text-gray-400 mt-1">•</span>
                <span className="text-gray-700">{req}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    )
  }
  
  // 主渲染
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">3D 数字分身扫描</h2>
        <p className="text-gray-600 mt-2">
          使用您的手机扫描生成 3D 写实分身
        </p>
      </div>
      
      {!selectedMethod ? renderDeviceDetection() : renderMethodGuide()}
    </div>
  )
}
