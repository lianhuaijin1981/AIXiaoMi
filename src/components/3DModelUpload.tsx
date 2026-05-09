import React, { useState, useCallback, useRef } from 'react'
import type { Model3D, ModelFormat, ScanStatus } from '../types/3d-scan'
import { SCAN_STATUS_LABELS } from '../types/3d-scan'
import ThreeDViewer from './ThreeDViewer'

/**
 * 3D 模型上传组件
 * 支持上传和预览 3D 模型文件
 */
export default function ThreeDModelUpload() {
  const [uploadStatus, setUploadStatus] = useState<ScanStatus>('idle')
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadedModel, setUploadedModel] = useState<Model3D | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // 支持的文件格式
  const SUPPORTED_FORMATS: ModelFormat[] = ['obj', 'fbx', 'gltf', 'glb', 'stl', 'ply']
  const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB
  
  // 处理文件选择
  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    
    // 验证文件格式
    const extension = file.name.split('.').pop()?.toLowerCase() as ModelFormat
    if (!SUPPORTED_FORMATS.includes(extension)) {
      setError(`不支持的文件格式。支持的格式：${SUPPORTED_FORMATS.join(', ')}`)
      return
    }
    
    // 验证文件大小
    if (file.size > MAX_FILE_SIZE) {
      setError(`文件过大。最大支持 50MB，当前文件：${(file.size / 1024 / 1024).toFixed(2)}MB`)
      return
    }
    
    setError(null)
    uploadFile(file)
  }, [])
  
  // 上传文件（模拟）
  const uploadFile = useCallback(async (file: File) => {
    setUploadStatus('uploading')
    setUploadProgress(0)
    
    try {
      // 模拟上传进度
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval)
            return 100
          }
          return prev + 10
        })
      }, 200)
      
      // 模拟上传延迟
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      clearInterval(interval)
      setUploadProgress(100)
      
      // 创建模型对象
      const model: Model3D = {
        id: Date.now().toString(),
        userId: 'current-user', // TODO: 从 auth store 获取
        fileName: file.name,
        format: file.name.split('.').pop()?.toLowerCase() as ModelFormat,
        fileSize: file.size,
        fileUrl: URL.createObjectURL(file),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      setUploadedModel(model)
      setUploadStatus('completed')
      
      // 创建预览 URL
      if (model.format === 'obj' || model.format === 'gltf' || model.format === 'glb') {
        setPreviewUrl(model.fileUrl)
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : '上传失败')
      setUploadStatus('error')
    }
  }, [])
  
  // 处理拖拽上传
  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    
    const file = event.dataTransfer.files[0]
    if (!file) return
    
    // 验证文件格式
    const extension = file.name.split('.').pop()?.toLowerCase() as ModelFormat
    if (!SUPPORTED_FORMATS.includes(extension)) {
      setError(`不支持的文件格式。支持的格式：${SUPPORTED_FORMATS.join(', ')}`)
      return
    }
    
    setError(null)
    uploadFile(file)
  }, [uploadFile])
  
  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
  }, [])
  
  // 重新上传
  const handleReupload = useCallback(() => {
    setUploadStatus('idle')
    setUploadedModel(null)
    setPreviewUrl(null)
    setUploadProgress(0)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [])
  
  // 渲染上传区域
  const renderUploadArea = () => {
    if (uploadStatus === 'completed' && uploadedModel) {
      return renderModelPreview()
    }
    
    return (
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-blue-500 transition-colors cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".obj,.fbx,.gltf,.glb,.stl,.ply"
          onChange={handleFileSelect}
          className="hidden"
        />
        
        <div className="mb-4">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </div>
        
        <p className="text-lg font-medium text-gray-900 mb-2">
          点击或拖拽文件到此处上传
        </p>
        <p className="text-sm text-gray-600">
          支持格式：{SUPPORTED_FORMATS.join(', ').toUpperCase()}
        </p>
        <p className="text-sm text-gray-500 mt-1">
          最大文件大小：50MB
        </p>
        
        {uploadStatus === 'uploading' && (
          <div className="mt-6">
            <div className="bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 mt-2">上传中... {uploadProgress}%</p>
          </div>
        )}
        
        {error && (
          <div className="mt-4 text-red-600 text-sm">
            {error}
          </div>
        )}
      </div>
    )
  }
  
  // 渲染模型预览
  const renderModelPreview = () => {
    if (!uploadedModel) return null
    
    const fileSizeMB = (uploadedModel.fileSize / 1024 / 1024).toFixed(2)
    
    return (
      <div className="space-y-6">
        {/* 模型信息 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">上传成功！</h3>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-500">文件名</p>
              <p className="font-medium">{uploadedModel.fileName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">格式</p>
              <p className="font-medium">{uploadedModel.format.toUpperCase()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">文件大小</p>
              <p className="font-medium">{fileSizeMB} MB</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">上传时间</p>
              <p className="font-medium">
                {new Date(uploadedModel.createdAt).toLocaleString('zh-CN')}
              </p>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={handleReupload}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              重新上传
            </button>
            <button
              onClick={() => {
                // TODO: 保存到数据库
                alert('模型已保存！')
              }}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              保存模型
            </button>
          </div>
        </div>
        
        {/* 3D 预览 - 使用真实的 ThreeDViewer 组件 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">3D 预览</h3>
          <div className="rounded-lg overflow-hidden" style={{ height: '500px' }}>
            <ThreeDViewer
              modelUrl={uploadedModel.fileUrl}
              format={uploadedModel.format}
              onLoad={() => {
                console.log('模型加载成功')
              }}
              onError={(errorMsg) => {
                console.error('模型加载失败:', errorMsg)
              }}
            />
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">3D 模型上传</h2>
        <p className="text-gray-600 mt-2">
          上传您的 3D 数字分身模型文件
        </p>
      </div>
      
      {renderUploadArea()}
    </div>
  )
}
