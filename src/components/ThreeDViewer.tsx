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
 * 材质属性接口
 */
interface MaterialProps {
  color: string
  metalness: number
  roughness: number
  wireframe: boolean
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
  const modelRef = useRef<THREE.Group | THREE.Mesh | null>(null)
  
  const [isLoading, setIsLoading] = useState(true)
  const [loadProgress, setLoadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  
  // UI 控制面板状态
  const [autoRotate, setAutoRotate] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [showMaterialPanel, setShowMaterialPanel] = useState(false)
  
  // 材质属性状态
  const [materialProps, setMaterialProps] = useState<MaterialProps>({
    color: '#00ff00',
    metalness: 0.5,
    roughness: 0.5,
    wireframe: false
  })
  
  // 旋转状态
  const [rotation, setRotation] = useState({ x: 0, y: 0, z: 0 })
  
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
      
      // 自动旋转
      if (autoRotate && modelRef.current) {
        modelRef.current.rotation.y += 0.01
      }
      
      renderer.render(scene, camera)
    }
    animate()
  }, [width, height, autoRotate])
  
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
          modelRef.current = object
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
          modelRef.current = object
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
          modelRef.current = gltf.scene
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
          modelRef.current = mesh
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
          modelRef.current = mesh
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
   * 旋转模型
   */
  const rotateModel = useCallback((axis: 'x' | 'y' | 'z', angle: number) => {
    if (!modelRef.current) return
    
    const radians = angle * (Math.PI / 180)
    if (axis === 'x') modelRef.current.rotation.x += radians
    if (axis === 'y') modelRef.current.rotation.y += radians
    if (axis === 'z') modelRef.current.rotation.z += radians
    
    setRotation({
      x: modelRef.current.rotation.x * (180 / Math.PI),
      y: modelRef.current.rotation.y * (180 / Math.PI),
      z: modelRef.current.rotation.z * (180 / Math.PI)
    })
  }, [])
  
  /**
   * 缩放模型
   */
  const scaleModel = useCallback((factor: number) => {
    if (!modelRef.current) return
    modelRef.current.scale.multiplyScalar(factor)
  }, [])
  
  /**
   * 平移模型
   */
  const translateModel = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
    if (!modelRef.current) return
    
    const step = 0.5
    switch (direction) {
      case 'up': modelRef.current.position.y += step; break
      case 'down': modelRef.current.position.y -= step; break
      case 'left': modelRef.current.position.x -= step; break
      case 'right': modelRef.current.position.x += step; break
    }
  }, [])
  
  /**
   * 重置模型和相机
   */
  const resetView = useCallback(() => {
    if (!modelRef.current || !cameraRef.current || !controlsRef.current || !sceneRef.current) return
    
    // 重置模型位置和旋转
    modelRef.current.position.set(0, 0, 0)
    modelRef.current.rotation.set(0, 0, 0)
    modelRef.current.scale.set(1, 1, 1)
    
    // 调整相机位置
    const box = new THREE.Box3().setFromObject(sceneRef.current)
    const center = box.getCenter(new THREE.Vector3())
    const size = box.getSize(new THREE.Vector3())
    
    const maxDim = Math.max(size.x, size.y, size.z)
    const fov = cameraRef.current.fov * (Math.PI / 180)
    let cameraZ = Math.abs(maxDim / Math.sin(fov / 2))
    
    cameraRef.current.position.set(center.x, center.y, cameraZ * 1.5)
    cameraRef.current.lookAt(center)
    
    controlsRef.current.target.copy(center)
    controlsRef.current.update()
    
    setRotation({ x: 0, y: 0, z: 0 })
  }, [])
  
  /**
   * 更新模型材质
   */
  const updateMaterial = useCallback((props: Partial<MaterialProps>) => {
    if (!modelRef.current) return
    
    setMaterialProps(prev => ({ ...prev, ...props }))
    
    modelRef.current.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach(mat => {
            if (mat instanceof THREE.MeshStandardMaterial) {
              if (props.color !== undefined) mat.color.set(props.color)
              if (props.metalness !== undefined) mat.metalness = props.metalness
              if (props.roughness !== undefined) mat.roughness = props.roughness
              if (props.wireframe !== undefined) mat.wireframe = props.wireframe
            }
          })
        } else if (child.material instanceof THREE.MeshStandardMaterial) {
          if (props.color !== undefined) child.material.color.set(props.color)
          if (props.metalness !== undefined) child.material.metalness = props.metalness
          if (props.roughness !== undefined) child.material.roughness = props.roughness
          if (props.wireframe !== undefined) child.material.wireframe = props.wireframe
        }
      }
    })
  }, [])
  
  /**
   * 截图并下载为 PNG
   */
  const takeSnapshot = useCallback(() => {
    if (!rendererRef.current || !sceneRef.current || !cameraRef.current) return
    
    // 临时设置白色背景
    const originalBackground = sceneRef.current.background
    sceneRef.current.background = new THREE.Color(0xffffff)
    
    // 渲染一帧
    rendererRef.current.render(sceneRef.current, cameraRef.current)
    
    // 获取 PNG 数据
    const dataURL = rendererRef.current.domElement.toDataURL('image/png')
    
    // 恢复原始背景
    sceneRef.current.background = originalBackground
    
    // 创建下载链接
    const link = document.createElement('a')
    link.href = dataURL
    link.download = `model-snapshot-${Date.now()}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }, [])
  
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
      
      {/* 顶部工具栏 */}
      {!isLoading && !error && (
        <div className="absolute top-4 right-4 flex space-x-2">
          <button
            onClick={() => setShowControls(!showControls)}
            className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow"
            title="显示/隐藏控制面板"
          >
            🎮 控制
          </button>
          <button
            onClick={() => setShowMaterialPanel(!showMaterialPanel)}
            className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow"
            title="显示/隐藏材质面板"
          >
            🎨 材质
          </button>
          <button
            onClick={takeSnapshot}
            className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow"
            title="保存快照为 PNG"
          >
            📷 快照
          </button>
        </div>
      )}
      
      {/* 右侧控制面板 */}
      {!isLoading && !error && showControls && (
        <div className="absolute top-16 right-4 bg-white p-4 rounded-lg shadow-lg w-64 max-h-[80vh] overflow-y-auto">
          <h3 className="text-lg font-semibold mb-4">🎮 模型控制</h3>
          
          {/* 自动旋转 */}
          <div className="mb-4">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={autoRotate}
                onChange={(e) => setAutoRotate(e.target.checked)}
                className="mr-2"
              />
              <span>自动旋转</span>
            </label>
          </div>
          
          {/* 旋转控制 */}
          <div className="mb-4">
            <p className="font-medium mb-2">旋转 (当前: X:{rotation.x.toFixed(1)}° Y:{rotation.y.toFixed(1)}° Z:{rotation.z.toFixed(1)}°)</p>
            <div className="grid grid-cols-3 gap-2 mb-2">
              <button onClick={() => rotateModel('x', 15)} className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-sm">X+15°</button>
              <button onClick={() => rotateModel('y', 15)} className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-sm">Y+15°</button>
              <button onClick={() => rotateModel('z', 15)} className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-sm">Z+15°</button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button onClick={() => rotateModel('x', -15)} className="bg-blue-300 hover:bg-blue-400 text-white px-2 py-1 rounded text-sm">X-15°</button>
              <button onClick={() => rotateModel('y', -15)} className="bg-blue-300 hover:bg-blue-400 text-white px-2 py-1 rounded text-sm">Y-15°</button>
              <button onClick={() => rotateModel('z', -15)} className="bg-blue-300 hover:bg-blue-400 text-white px-2 py-1 rounded text-sm">Z-15°</button>
            </div>
          </div>
          
          {/* 缩放控制 */}
          <div className="mb-4">
            <p className="font-medium mb-2">缩放</p>
            <div className="grid grid-cols-3 gap-2">
              <button onClick={() => scaleModel(1.2)} className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-sm">放大</button>
              <button onClick={() => scaleModel(0.8)} className="bg-green-300 hover:bg-green-400 text-white px-2 py-1 rounded text-sm">缩小</button>
              <button onClick={() => scaleModel(1)} className="bg-gray-500 hover:bg-gray-600 text-white px-2 py-1 rounded text-sm">重置</button>
            </div>
          </div>
          
          {/* 平移控制 */}
          <div className="mb-4">
            <p className="font-medium mb-2">平移</p>
            <div className="grid grid-cols-3 gap-2">
              <div></div>
              <button onClick={() => translateModel('up')} className="bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded text-sm">上</button>
              <div></div>
              <button onClick={() => translateModel('left')} className="bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded text-sm">左</button>
              <button onClick={() => translateModel('down')} className="bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded text-sm">下</button>
              <button onClick={() => translateModel('right')} className="bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded text-sm">右</button>
            </div>
          </div>
          
          {/* 重置视图 */}
          <div className="mb-4">
            <button onClick={resetView} className="w-full bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded">
              重置视图
            </button>
          </div>
        </div>
      )}
      
      {/* 材质编辑面板 */}
      {!isLoading && !error && showMaterialPanel && (
        <div className="absolute top-16 right-72 bg-white p-4 rounded-lg shadow-lg w-64 max-h-[80vh] overflow-y-auto">
          <h3 className="text-lg font-semibold mb-4">🎨 材质编辑</h3>
          
          {/* 颜色选择 */}
          <div className="mb-4">
            <label className="block font-medium mb-2">颜色</label>
            <input
              type="color"
              value={materialProps.color}
              onChange={(e) => updateMaterial({ color: e.target.value })}
              className="w-full h-10 cursor-pointer"
            />
          </div>
          
          {/* 金属度 */}
          <div className="mb-4">
            <label className="block font-medium mb-2">金属度: {materialProps.metalness.toFixed(2)}</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={materialProps.metalness}
              onChange={(e) => updateMaterial({ metalness: parseFloat(e.target.value) })}
              className="w-full"
            />
          </div>
          
          {/* 粗糙度 */}
          <div className="mb-4">
            <label className="block font-medium mb-2">粗糙度: {materialProps.roughness.toFixed(2)}</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={materialProps.roughness}
              onChange={(e) => updateMaterial({ roughness: parseFloat(e.target.value) })}
              className="w-full"
            />
          </div>
          
          {/* 线框模式 */}
          <div className="mb-4">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={materialProps.wireframe}
                onChange={(e) => updateMaterial({ wireframe: e.target.checked })}
                className="mr-2"
              />
              <span>线框模式</span>
            </label>
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
