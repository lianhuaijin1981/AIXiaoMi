import React, { useRef, useEffect, useState, useCallback } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js'
import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader.js'
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js'

/**
 * ThreeDViewer 组件属性
 */
interface ThreeDViewerProps {
  modelUrl: string
  format: 'obj' | 'fbx' | 'gltf' | 'glb' | 'stl' | 'ply'
  width?: number
  height?: number
  onLoad?: () => void
  onError?: (error: string) => void
}

/**
 * Three.js 3D 模型查看器组件
 * 支持 OBJ, FBX, GLTF, GLB, STL, PLY 格式
 */
export default function ThreeDViewer({
  modelUrl,
  format,
  width = 800,
  height = 600,
  onLoad,
  onError
}: ThreeDViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const controlsRef = useRef<OrbitControls | null>(null)
  const frameRef = useRef<number>(0)
  
  const [isLoading, setIsLoading] = useState(true)
  const [loadProgress, setLoadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  
  /**
   * 初始化 Three.js 场景
   */
  const initScene = useCallback(() => {
    if (!containerRef.current) return
    
    // 创建场景
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0xf0f0f0)
    scene.fog = new THREE.Fog(0xf0f0f0, 10, 1000)
    sceneRef.current = scene
    
    // 创建相机
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000)
    camera.position.set(0, 0, 5)
    cameraRef.current = camera
    
    // 创建渲染器
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    containerRef.current.appendChild(renderer.domElement)
    rendererRef.current = renderer
    
    // 添加轨道控制器
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controlsRef.current = controls
    
    // 添加光源
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
    scene.add(ambientLight)
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight.position.set(5, 10, 7)
    directionalLight.castShadow = true
    directionalLight.shadow.mapSize.width = 2048
    directionalLight.shadow.mapSize.height = 2048
    scene.add(directionalLight)
    
    const pointLight = new THREE.PointLight(0xffffff, 0.5)
    pointLight.position.set(-5, 5, -5)
    scene.add(pointLight)
    
    // 添加网格地面
    const gridHelper = new THREE.GridHelper(10, 10, 0x000000, 0x000000)
    gridHelper.material.opacity = 0.2
    gridHelper.material.transparent = true
    scene.add(gridHelper)
    
    // 动画循环
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate)
      controls.update()
      renderer.render(scene, camera)
    }
    animate()
  }, [width, height])
  
  /**
   * 加载 3D 模型
   */
  const loadModel = useCallback(async () => {
    if (!sceneRef.current) return
    
    setIsLoading(true)
    setLoadProgress(0)
    setError(null)
    
    const scene = sceneRef.current
    
    try {
      // 清除之前的模型
      const objectsToRemove = scene.children.filter(child => 
        child.type === 'Group' || child.type === 'Mesh'
      )
      objectsToRemove.forEach(obj => scene.remove(obj))
      
      // 根据格式选择加载器
      switch (format) {
        case 'obj': {
          const loader = new OBJLoader()
          const object = await new Promise<THREE.Group>((resolve, reject) => {
            loader.load(
              modelUrl,
              resolve,
              (xhr: ProgressEvent) => {
                if (xhr.total > 0) {
                  setLoadProgress((xhr.loaded / xhr.total) * 100)
                }
              },
              reject
            )
          })
          scene.add(object)
          break
        }
        
        case 'fbx': {
          const loader = new FBXLoader()
          const object = await new Promise<THREE.Group>((resolve, reject) => {
            loader.load(
              modelUrl,
              resolve,
              (xhr: ProgressEvent) => {
                if (xhr.total > 0) {
                  setLoadProgress((xhr.loaded / xhr.total) * 100)
                }
              },
              reject
            )
          })
          scene.add(object)
          break
        }
        
        case 'gltf':
        case 'glb': {
          const loader = new GLTFLoader()
          const gltf = await new Promise<any>((resolve, reject) => {
            loader.load(
              modelUrl,
              resolve,
              (xhr: ProgressEvent) => {
                if (xhr.total > 0) {
                  setLoadProgress((xhr.loaded / xhr.total) * 100)
                }
              },
              reject
            )
          })
          scene.add(gltf.scene)
          break
        }
        
        case 'stl': {
          const loader = new STLLoader()
          const geometry = await new Promise<THREE.BufferGeometry>((resolve, reject) => {
            loader.load(
              modelUrl,
              resolve,
              (xhr: ProgressEvent) => {
                if (xhr.total > 0) {
                  setLoadProgress((xhr.loaded / xhr.total) * 100)
                }
              },
              reject
            )
          })
          const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 })
          const mesh = new THREE.Mesh(geometry, material)
          scene.add(mesh)
          break
        }
        
        case 'ply': {
          const loader = new PLYLoader()
          const geometry = await new Promise<THREE.BufferGeometry>((resolve, reject) => {
            loader.load(
              modelUrl,
              resolve,
              (xhr: ProgressEvent) => {
                if (xhr.total > 0) {
                  setLoadProgress((xhr.loaded / xhr.total) * 100)
                }
              },
              reject
            )
          })
          const material = new THREE.MeshStandardMaterial({ color: 0xffffff })
          const mesh = new THREE.Mesh(geometry, material)
          scene.add(mesh)
          break
        }
        
        default:
          throw new Error(`不支持的模型格式: ${format}`)
      }
      
      // 调整相机位置以适应模型
      const box = new THREE.Box3().setFromObject(scene)
      const center = box.getCenter(new THREE.Vector3())
      const size = box.getSize(new THREE.Vector3())
      
      const maxDim = Math.max(size.x, size.y, size.z)
      const fov = cameraRef.current!.fov * (Math.PI / 180)
      let cameraZ = Math.abs(maxDim / Math.sin(fov / 2))
      
      cameraRef.current!.position.set(center.x, center.y, cameraZ * 1.5)
      cameraRef.current!.lookAt(center)
      
      if (controlsRef.current) {
        controlsRef.current.target.copy(center)
        controlsRef.current.update()
      }
      
      setIsLoading(false)
      setLoadProgress(100)
      if (onLoad) onLoad()
      
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : '模型加载失败'
      setError(errorMsg)
      setIsLoading(false)
      if (onError) onError(errorMsg)
    }
  }, [modelUrl, format, onLoad, onError])
  
  /**
   * 处理窗口大小变化
   */
  const handleResize = useCallback(() => {
    if (!containerRef.current || !cameraRef.current || !rendererRef.current) return
    
    const width = containerRef.current.clientWidth
    const height = containerRef.current.clientHeight
    
    cameraRef.current.aspect = width / height
    cameraRef.current.updateProjectionMatrix()
    rendererRef.current.setSize(width, height)
  }, [])
  
  // 初始化场景
  useEffect(() => {
    initScene()
    
    return () => {
      // 清理资源
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current)
      }
      if (rendererRef.current) {
        rendererRef.current.dispose()
        if (containerRef.current && rendererRef.current.domElement) {
          containerRef.current.removeChild(rendererRef.current.domElement)
        }
      }
    }
  }, [initScene])
  
  // 加载模型
  useEffect(() => {
    if (modelUrl) {
      loadModel()
    }
  }, [modelUrl, loadModel])
  
  // 监听窗口大小变化
  useEffect(() => {
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [handleResize])
  
  return (
    <div className="relative w-full h-full min-h-[500px]">
      {/* Three.js 渲染容器 */}
      <div
        ref={containerRef}
        className="w-full h-full"
        style={{ minHeight: '500px' }}
      />
      
      {/* 加载指示器 */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-gray-600">加载模型中... {loadProgress.toFixed(0)}%</p>
            <div className="mt-2 w-48 bg-gray-200 rounded-full h-2.5 mx-auto">
              <div
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${loadProgress}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}
      
      {/* 错误提示 */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="text-center text-red-600">
            <svg className="h-12 w-12 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="font-medium">模型加载失败</p>
            <p className="text-sm mt-2">{error}</p>
          </div>
        </div>
      )}
      
      {/* 控制提示 */}
      {!isLoading && !error && (
        <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white text-xs px-3 py-2 rounded">
          鼠标左键拖拽旋转 | 右键拖拽平移 | 滚轮缩放
        </div>
      )}
    </div>
  )
}

/**
 * 默认导出
 */
export { ThreeDViewer }
