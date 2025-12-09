import React, { useState, useEffect } from 'react';
import { 
  Camera, 
  Plus, 
  TrendingUp, 
  Calendar, 
  ChevronLeft, 
  Trash2, 
  Image as ImageIcon, 
  Target,
  ArrowRight,
  Save
} from 'lucide-react';

// --- 类型定义 ---

interface LogEntry {
  id: string;
  date: string;
  value: number; // 例如：体重 kg，或者进度 %
  note: string;
  imageData: string | null; // Base64 图片字符串
}

interface Tracker {
  id: string;
  title: string;
  targetDescription: string; // "每天运动30分钟"
  unit: string; // "kg", "页", "%"
  logs: LogEntry[];
  createdAt: string;
}

// --- 组件 ---

export default function App() {
  const [trackers, setTrackers] = useState<Tracker[]>(() => {
    try {
      const saved = localStorage.getItem('changeTrackerData');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Failed to parse data", e);
      return [];
    }
  });
  
  const [activeView, setActiveView] = useState<'home' | 'create' | 'detail' | 'addLog'>('home');
  const [selectedTrackerId, setSelectedTrackerId] = useState<string | null>(null);
  
  // 仅用于 addLog 视图的临时状态
  const [tempLog, setTempLog] = useState<{value: string, note: string, image: string | null}>({
    value: '',
    note: '',
    image: null
  });

  // 仅用于 create 视图的临时状态
  const [newTrackerData, setNewTrackerData] = useState({ title: '', target: '', unit: '' });

  // --- 初始化与持久化 ---

  useEffect(() => {
    localStorage.setItem('changeTrackerData', JSON.stringify(trackers));
  }, [trackers]);

  // --- 辅助函数 ---

  const getActiveTracker = () => trackers.find(t => t.id === selectedTrackerId);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempLog(prev => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const createTracker = () => {
    if (!newTrackerData.title) return;
    const newTracker: Tracker = {
      id: Date.now().toString(),
      title: newTrackerData.title,
      targetDescription: newTrackerData.target,
      unit: newTrackerData.unit || '单位',
      logs: [],
      createdAt: new Date().toISOString()
    };
    setTrackers([newTracker, ...trackers]);
    setNewTrackerData({ title: '', target: '', unit: '' });
    setActiveView('home');
  };

  const addLog = () => {
    if (!selectedTrackerId) return;
    const newLog: LogEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      value: parseFloat(tempLog.value) || 0,
      note: tempLog.note,
      imageData: tempLog.image
    };

    const updatedTrackers = trackers.map(t => {
      if (t.id === selectedTrackerId) {
        return { ...t, logs: [newLog, ...t.logs] }; // 最新的在前面
      }
      return t;
    });

    setTrackers(updatedTrackers);
    setTempLog({ value: '', note: '', image: null });
    setActiveView('detail');
  };

  const deleteTracker = (id: string) => {
    if (confirm('确定要删除这个记录吗？所有数据将无法恢复。')) {
      const newTrackers = trackers.filter(t => t.id !== id);
      setTrackers(newTrackers);
      if (selectedTrackerId === id) {
        setActiveView('home');
        setSelectedTrackerId(null);
      }
    }
  };

  const deleteLog = (trackerId: string, logId: string) => {
     if (confirm('确定删除这条日志吗？')) {
        const updatedTrackers = trackers.map(t => {
          if (t.id === trackerId) {
            return { ...t, logs: t.logs.filter(l => l.id !== logId) };
          }
          return t;
        });
        setTrackers(updatedTrackers);
     }
  }

  // --- 视图渲染 ---

  const renderHome = () => (
    <div className="space-y-6 pb-20">
      <header className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">蜕变日志</h1>
          <p className="text-gray-500 text-sm">记录每一个微小的进步</p>
        </div>
        <button 
          onClick={() => setActiveView('create')}
          className="bg-blue-600 text-white p-3 rounded-full shadow-lg active:scale-95 transition-transform"
        >
          <Plus size={24} />
        </button>
      </header>

      {trackers.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
          <Target className="mx-auto text-gray-300 mb-3" size={48} />
          <p className="text-gray-500">还没有正在追踪的项目</p>
          <button 
            onClick={() => setActiveView('create')}
            className="mt-4 text-blue-600 font-medium"
          >
            + 开始一个新的计划
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {trackers.map(tracker => {
            const latestLog = tracker.logs[0];
            const startLog = tracker.logs[tracker.logs.length - 1];
            const change = latestLog && startLog ? (latestLog.value - startLog.value).toFixed(1) : 0;

            return (
              <div 
                key={tracker.id} 
                onClick={() => { setSelectedTrackerId(tracker.id); setActiveView('detail'); }}
                className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 active:bg-gray-50 transition-colors cursor-pointer"
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-bold text-lg text-gray-800">{tracker.title}</h3>
                  <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full">
                    {tracker.logs.length} 次记录
                  </span>
                </div>
                <p className="text-gray-500 text-sm mb-4 line-clamp-1">{tracker.targetDescription}</p>
                
                {latestLog ? (
                  <div className="flex items-center justify-between text-sm">
                    <div className="text-gray-600">
                      最新: <span className="font-bold text-gray-900">{latestLog.value} {tracker.unit}</span>
                    </div>
                    <div className={`flex items-center ${Number(change) <= 0 ? 'text-green-500' : 'text-orange-500'}`}>
                      <TrendingUp size={16} className="mr-1" />
                      <span>{Number(change) > 0 ? '+' : ''}{change}</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-gray-400">暂无数据，点击开始记录</div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  const renderCreate = () => (
    <div className="pb-20">
       <header className="flex items-center mb-6">
        <button onClick={() => setActiveView('home')} className="mr-4 p-2 -ml-2 rounded-full hover:bg-gray-100">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-xl font-bold">新建追踪计划</h1>
      </header>

      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">标题</label>
          <input 
            type="text" 
            placeholder="例如：30天减脂计划"
            className="w-full p-4 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            value={newTrackerData.title}
            onChange={e => setNewTrackerData({...newTrackerData, title: e.target.value})}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">目标/要求</label>
          <textarea 
            placeholder="例如：每天少吃糖，每周运动3次..."
            className="w-full p-4 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all h-32"
            value={newTrackerData.target}
            onChange={e => setNewTrackerData({...newTrackerData, target: e.target.value})}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">记录单位</label>
          <input 
            type="text" 
            placeholder="例如：kg, cm, 分钟"
            className="w-full p-4 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            value={newTrackerData.unit}
            onChange={e => setNewTrackerData({...newTrackerData, unit: e.target.value})}
          />
        </div>

        <button 
          onClick={createTracker}
          disabled={!newTrackerData.title}
          className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed mt-8 active:scale-95 transition-transform"
        >
          创建计划
        </button>
      </div>
    </div>
  );

  const renderAddLog = () => {
    const tracker = getActiveTracker();
    if (!tracker) return null;

    return (
      <div className="pb-20">
        <header className="flex items-center mb-6">
          <button onClick={() => setActiveView('detail')} className="mr-4 p-2 -ml-2 rounded-full hover:bg-gray-100">
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-xl font-bold">今日打卡</h1>
        </header>

        <div className="space-y-6">
          {/* 图片上传区域 */}
          <div className="relative group">
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleImageUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div className={`w-full aspect-video rounded-2xl flex flex-col items-center justify-center border-2 border-dashed transition-all ${tempLog.image ? 'border-transparent' : 'border-gray-300 bg-gray-50'}`}>
              {tempLog.image ? (
                <img src={tempLog.image} alt="Preview" className="w-full h-full object-cover rounded-2xl shadow-md" />
              ) : (
                <div className="text-center text-gray-400">
                  <Camera size={48} className="mx-auto mb-2" />
                  <p>点击上传照片记录变化</p>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">当前数值 ({tracker.unit})</label>
              <input 
                type="number" 
                placeholder="0.0"
                className="w-full p-3 rounded-xl bg-gray-50 text-xl font-bold text-gray-800 outline-none focus:ring-2 focus:ring-blue-500"
                value={tempLog.value}
                onChange={e => setTempLog({...tempLog, value: e.target.value})}
              />
            </div>
            <div className="flex items-end pb-3 text-gray-500 text-sm">
                上次: {tracker.logs[0]?.value || '-'} {tracker.unit}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">心得/备注</label>
            <textarea 
              placeholder="今天感觉怎么样？完成了哪些要求？"
              className="w-full p-4 rounded-xl bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500 h-32"
              value={tempLog.note}
              onChange={e => setTempLog({...tempLog, note: e.target.value})}
            />
          </div>

          <button 
            onClick={addLog}
            className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-transform"
          >
            <Save size={20} />
            保存记录
          </button>
        </div>
      </div>
    );
  };

  const renderDetail = () => {
    const tracker = getActiveTracker();
    if (!tracker) return null;

    // 提取有图片的记录用于对比
    const logsWithImages = tracker.logs.filter(l => l.imageData);
    const startLog = tracker.logs[tracker.logs.length - 1];
    const latestLog = tracker.logs[0];
    const firstImage = logsWithImages[logsWithImages.length - 1];
    const lastImage = logsWithImages[0];

    // 计算总变化
    const totalChange = startLog && latestLog ? (latestLog.value - startLog.value).toFixed(1) : '0';

    return (
      <div className="pb-20">
        <header className="flex justify-between items-center mb-6">
          <button onClick={() => setActiveView('home')} className="p-2 -ml-2 rounded-full hover:bg-gray-100">
            <ChevronLeft size={24} />
          </button>
          <div className="flex gap-2">
            <button 
                onClick={() => deleteTracker(tracker.id)}
                className="p-2 text-red-500 hover:bg-red-50 rounded-full"
            >
                <Trash2 size={20} />
            </button>
          </div>
        </header>

        {/* 顶部概览卡片 */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 text-white shadow-lg mb-8">
          <h1 className="text-2xl font-bold mb-1">{tracker.title}</h1>
          <p className="text-blue-100 text-sm mb-6 opacity-90">{tracker.targetDescription}</p>
          
          <div className="flex justify-between items-end">
            <div>
              <p className="text-blue-200 text-xs mb-1">当前 ({tracker.unit})</p>
              <p className="text-4xl font-bold">{latestLog?.value || '-'}</p>
            </div>
            <div className="text-right">
              <p className="text-blue-200 text-xs mb-1">总变化</p>
              <p className="text-2xl font-semibold flex items-center">
                 {Number(totalChange) > 0 ? '+' : ''}{totalChange}
                 <span className="text-sm ml-1 opacity-70">{tracker.unit}</span>
              </p>
            </div>
          </div>
        </div>

        {/* 核心功能：前后对比 (只有当有至少两张图片时显示) */}
        {logsWithImages.length >= 2 && (
          <div className="mb-8">
            <h2 className="font-bold text-gray-800 mb-4 flex items-center">
              <ImageIcon size={18} className="mr-2 text-blue-600" />
              蜕变对比
            </h2>
            <div className="flex gap-2 h-40">
              <div className="flex-1 relative rounded-xl overflow-hidden bg-gray-100">
                <img src={firstImage.imageData!} className="w-full h-full object-cover" alt="Start" />
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 text-center">
                  开始: {new Date(firstImage.date).toLocaleDateString()}
                </div>
              </div>
              <div className="flex items-center justify-center text-gray-300">
                <ArrowRight size={20} />
              </div>
              <div className="flex-1 relative rounded-xl overflow-hidden bg-gray-100">
                <img src={lastImage.imageData!} className="w-full h-full object-cover" alt="Current" />
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 text-center">
                  现在: {new Date(lastImage.date).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 历史记录列表 */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-gray-800 flex items-center">
              <Calendar size={18} className="mr-2 text-blue-600" />
              进度记录
            </h2>
            <button 
              onClick={() => setActiveView('addLog')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium shadow active:scale-95 transition-transform"
            >
              + 打卡
            </button>
          </div>

          <div className="space-y-4">
            {tracker.logs.length === 0 && (
                <div className="text-center py-8 text-gray-400 text-sm">还没有记录，快去打卡吧！</div>
            )}
            {tracker.logs.map((log, index) => (
              <div key={log.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-4">
                {/* 时间线装饰 */}
                <div className="flex flex-col items-center pt-1">
                   <div className="w-2 h-2 rounded-full bg-blue-400 mb-1"></div>
                   {index !== tracker.logs.length - 1 && <div className="w-0.5 h-full bg-gray-100"></div>}
                </div>

                <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <span className="text-xs text-gray-400 block">{new Date(log.date).toLocaleDateString()} {new Date(log.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                            <span className="font-bold text-lg text-gray-800">{log.value} <span className="text-sm font-normal text-gray-500">{tracker.unit}</span></span>
                        </div>
                        <button onClick={() => deleteLog(tracker.id, log.id)} className="text-gray-300 hover:text-red-400">
                            <Trash2 size={14} />
                        </button>
                    </div>
                    {log.note && (
                        <p className="text-gray-600 text-sm bg-gray-50 p-2 rounded-lg mb-2">{log.note}</p>
                    )}
                    {log.imageData && (
                        <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 mt-2">
                            <img src={log.imageData} alt="Log" className="w-full h-full object-cover" />
                        </div>
                    )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-blue-100">
      <div className="max-w-md mx-auto min-h-screen bg-white shadow-2xl overflow-hidden relative">
        <div className="h-full overflow-y-auto p-6 scrollbar-hide">
          {activeView === 'home' && renderHome()}
          {activeView === 'create' && renderCreate()}
          {activeView === 'detail' && renderDetail()}
          {activeView === 'addLog' && renderAddLog()}
        </div>
      </div>
    </div>
  );
}
