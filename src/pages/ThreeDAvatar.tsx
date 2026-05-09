import React, { useState } from 'react'
import ThreeDScanGuide from '../components/3DScanGuide'
import ThreeDModelUpload from '../components/3DModelUpload'

/**
 * 3D 分身展示页面
 * 展示用户的 3D 数字分身
 */
export default function ThreeDAvatar() {
  const [activeTab, setActiveTab] = useState<'guide' | 'upload' | 'gallery'>('guide')
  const [models, setModels] = useState([
    {
      id: '1',
      name: '我的 3D 分身 v1',
      format: 'OBJ',
      size: '12.5 MB',
      createdAt: '2026-05-09',
      thumbnail: null
    },
    {
      id: '2',
      name: '我的 3D 分身 v2',
      format: 'GLB',
      size: '8.3 MB',
      createdAt: '2026-05-08',
      thumbnail: null
    }
  ])
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 页面头部 */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">3D 数字分身</h1>
          <p className="mt-2 text-gray-600">
            使用手机扫描生成您的 3D 写实分身，支持小米、华为、苹果、OPPO、Vivo 等主流品牌
          </p>
        </div>
      </div>
      
      {/* 标签页导航 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6 w-fit">
          <button
            onClick={() => setActiveTab('guide')}
            className={`px-4 py-2 rounded-md transition-colors ${
              activeTab === 'guide'
                ? 'bg-white text-blue-600 shadow'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            📱 扫描引导
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-4 py-2 rounded-md transition-colors ${
              activeTab === 'upload'
                ? 'bg-white text-blue-600 shadow'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            📦 上传模型
          </button>
          <button
            onClick={() => setActiveTab('gallery')}
            className={`px-4 py-2 rounded-md transition-colors ${
              activeTab === 'gallery'
                ? 'bg-white text-blue-600 shadow'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            🎨 我的分身
          </button>
        </div>
        
        {/* 内容区域 */}
        <div className="mt-6">
          {activeTab === 'guide' && (
            <div>
              <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium text-blue-900 mb-2">💡 使用说明</h3>
                <p className="text-sm text-blue-800">
                  本功能将引导您使用手机原生的 3D 扫描功能生成 3D 模型，然后将文件上传到本平台。
                  支持小米、华为、苹果、OPPO、Vivo 等主流品牌。
                </p>
              </div>
              <ThreeDScanGuide />
            </div>
          )}
          
          {activeTab === 'upload' && (
            <div>
              <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-medium text-green-900 mb-2">📦 上传说明</h3>
                <p className="text-sm text-green-800">
                  如果您已经使用手机完成了 3D 扫描，请将生成的 3D 模型文件上传到此处。
                  支持格式：OBJ, FBX, GLTF, GLB, STL, PLY
                </p>
              </div>
              <ThreeDModelUpload />
            </div>
          )}
          
          {activeTab === 'gallery' && (
            <div>
              <div className="mb-6 flex justify-between items-center">
                <h2 className="text-xl font-semibold">我的 3D 分身</h2>
                <button
                  onClick={() => setActiveTab('upload')}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  + 上传新模型
                </button>
              </div>
              
              {models.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  <p className="mt-4 text-gray-600">暂无 3D 分身模型</p>
                  <button
                    onClick={() => setActiveTab('guide')}
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    开始创建
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {models.map(model => (
                    <div key={model.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
                      <div className="h-48 bg-gray-100 rounded-t-lg flex items-center justify-center">
                        {model.thumbnail ? (
                          <img src={model.thumbnail} alt={model.name} className="h-full w-full object-cover rounded-t-lg" />
                        ) : (
                          <svg className="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1m0 0l-2 1m2-1v2.5M12 21l-2-1m2 1l-2 1m2-1v2.5M6 7l-2 1m2-1L4 7m2 1v2.5" />
                          </svg>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-medium text-gray-900 mb-1">{model.name}</h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                          <span>格式：{model.format}</span>
                          <span>大小：{model.size}</span>
                        </div>
                        <p className="text-xs text-gray-400 mb-3">创建时间：{model.createdAt}</p>
                        <div className="flex space-x-2">
                          <button className="flex-1 px-3 py-1.5 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors">
                            预览
                          </button>
                          <button className="flex-1 px-3 py-1.5 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300 transition-colors">
                            下载
                          </button>
                          <button className="px-3 py-1.5 bg-red-50 text-red-600 text-sm rounded hover:bg-red-100 transition-colors">
                            删除
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* 功能说明 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">支持的设备品牌</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {[
              { brand: '小米', icon: '📱', models: 'Mi 8 及以上' },
              { brand: '华为', icon: '🔷', models: 'Mate 20 及以上' },
              { brand: '苹果', icon: '🍎', models: 'iPhone X 及以上' },
              { brand: 'OPPO', icon: '🔶', models: 'Reno 6 及以上' },
              { brand: 'Vivo', icon: '🔵', models: 'X60 及以上' }
            ].map(item => (
              <div key={item.brand} className="text-center p-4 border border-gray-200 rounded-lg">
                <div className="text-4xl mb-3">{item.icon}</div>
                <h3 className="font-medium text-gray-900 mb-1">{item.brand}</h3>
                <p className="text-xs text-gray-500">{item.models}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* 技术说明 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="bg-gray-800 text-white rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-4">⚙️ 技术说明</h2>
          <div className="space-y-3 text-gray-300">
            <p>• 本功能基于 Web 技术实现，需要配合手机原生 3D 扫描应用使用</p>
            <p>• 支持的扫描方法：ARKit (iOS)、AREngine (华为)、Mi AR (小米)、ARCore (Android)</p>
            <p>• 3D 模型渲染需要集成 Three.js 或 Babylon.js（后续版本支持）</p>
            <p>• 上传的 3D 模型文件存储在云服务器，确保安全备份</p>
            <p>• 模型格式支持：OBJ, FBX, GLTF, GLB, STL, PLY</p>
          </div>
        </div>
      </div>
    </div>
  )
}
