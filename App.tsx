import React, { useState, useEffect } from 'react';
import { 
  Target, 
  AlertTriangle, 
  Stethoscope, 
  Map, 
  CheckSquare, 
  ArrowRight, 
  Info, 
  RotateCcw,
  User,
  Brain,
  ChevronRight,
  Save,
  Trash2,
  Trophy
} from 'lucide-react';

// --- Components ---

const Card = ({ children, className = "" }: { children?: React.ReactNode, className?: string }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden ${className}`}>
    {children}
  </div>
);

const Button = ({ children, onClick, variant = "primary", className = "", disabled = false }: { children?: React.ReactNode, onClick?: () => void, variant?: string, className?: string, disabled?: boolean }) => {
  const baseStyle = "px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2";
  const variants: {[key: string]: string} = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-indigo-300",
    secondary: "bg-slate-100 text-slate-700 hover:bg-slate-200",
    outline: "border border-slate-300 text-slate-600 hover:bg-slate-50",
    danger: "bg-red-50 text-red-600 hover:bg-red-100",
    success: "bg-emerald-600 text-white hover:bg-emerald-700"
  };
  
  return (
    <button 
      onClick={onClick} 
      disabled={disabled}
      className={`${baseStyle} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

// --- Types ---

interface Problem {
  id: number;
  text: string;
}

interface Diagnosis {
  directCause?: string;
  rootCause?: string;
  isInternal?: boolean;
}

interface Plan {
  id: number;
  text: string;
  isDone: boolean;
}

interface UserProfile {
  biggestWeakness: string;
  humilityScore: number;
  mentalMapScore: number;
}

// --- Constants ---

const PRINCIPLES: {[key: number]: {title: string, desc: string, tips: string[]}} = {
  1: {
    title: "设定明确的目标",
    desc: "选择你追求什么。不要混淆目标和欲望。",
    tips: [
      "你不可能得到想要的所有东西，必须排列优先顺序。",
      "不要因为觉得某个目标无法实现就否决它。",
      "设定目标时，不要想如何实现它，只是设定。",
      "谨记：伟大的期望创造伟大的能力。"
    ]
  },
  2: {
    title: "找出问题，不容忍问题",
    desc: "阻碍你实现目标的问题是什么？把问题摆上桌面。",
    tips: [
      "痛苦 + 反思 = 进步。",
      "不要把问题的某个原因误认为问题本身（如：'睡眠不足'是原因，'工作表现差'是问题）。",
      "区分大问题和小问题，优先解决大问题。",
      "不管出于什么原因，只要你容忍问题，你就处于毫无希望的境地。"
    ]
  },
  3: {
    title: "诊断问题，找到根源",
    desc: "冷静地分析。为什么会发生这个问题？",
    tips: [
      "区分直接原因（动词，如'没查时刻表'）和根本原因（形容词，如'健忘'）。",
      "只有消除根本原因才能真正解决问题。",
      "这通常需要15-60分钟。",
      "要诚实地面对自己或他人的弱点。"
    ]
  },
  4: {
    title: "规划解决方案",
    desc: "设计一部机器来解决问题。写下'电影剧本'。",
    tips: [
      "规划先于行动！",
      "把你的方案设想为一个电影剧本，循序渐进地思考由谁来做什么。",
      "草拟一个大概方案，然后改进。",
      "方案中应当巨细靡遗地写明谁在何时完成什么任务。"
    ]
  },
  5: {
    title: "坚定地践行",
    desc: "做一切必要的事来践行方案，实现成果。",
    tips: [
      "规划做得再好，不执行也无济于事。",
      "建立清晰的衡量标准来确保你在严格执行。",
      "如果你未能实现目标，这就是另一个需要诊断和解决的问题。",
      "保持良好的工作习惯。"
    ]
  }
};

const STEP_ICONS: {[key: number]: React.ElementType} = {
  1: Target,
  2: AlertTriangle,
  3: Stethoscope,
  4: Map,
  5: CheckSquare
};

const STEP_COLORS: {[key: number]: string} = {
  1: "text-blue-600 bg-blue-50 border-blue-200",
  2: "text-red-600 bg-red-50 border-red-200",
  3: "text-purple-600 bg-purple-50 border-purple-200",
  4: "text-amber-600 bg-amber-50 border-amber-200",
  5: "text-emerald-600 bg-emerald-50 border-emerald-200"
};

const STORAGE_KEY = 'evolution_data_v1';

export default function App() {
  // --- State Initialization with Persistence ---
  
  const loadState = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  };

  const savedData = loadState();

  // Core UI State
  const [activeTab, setActiveTab] = useState<'cycle' | 'profile'>('cycle');
  const [currentStep, setCurrentStep] = useState<number>(savedData?.currentStep || 1);
  
  // Cycle Data
  const [goal, setGoal] = useState<string>(savedData?.goal || "");
  const [problems, setProblems] = useState<Problem[]>(savedData?.problems || []);
  const [diagnosis, setDiagnosis] = useState<{[key: number]: Diagnosis}>(savedData?.diagnosis || {});
  const [plans, setPlans] = useState<Plan[]>(savedData?.plans || []);
  
  // Profile Data
  const [userProfile, setUserProfile] = useState<UserProfile>(savedData?.userProfile || {
    biggestWeakness: "",
    humilityScore: 5, 
    mentalMapScore: 5
  });

  // Temporary Inputs
  const [tempInput, setTempInput] = useState("");
  const [activeProblemId, setActiveProblemId] = useState<number | null>(null);

  // Persistence Effect
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      currentStep,
      goal,
      problems,
      diagnosis,
      plans,
      userProfile
    }));
  }, [currentStep, goal, problems, diagnosis, plans, userProfile]);

  // --- Logic ---

  const canProceed = () => {
    if (currentStep === 1) return goal.length > 0;
    if (currentStep === 2) return problems.length > 0;
    if (currentStep === 3) return problems.every(p => diagnosis[p.id]?.rootCause);
    if (currentStep === 4) return plans.length > 0;
    return false;
  };

  const nextStep = () => {
    if (currentStep < 5) setCurrentStep(c => c + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(c => c - 1);
  };

  const resetCycle = () => {
    if (confirm("确定要结束当前循环并开始新的目标吗？当前进度将被重置。")) {
      setGoal("");
      setProblems([]);
      setDiagnosis({});
      setPlans([]);
      setCurrentStep(1);
    }
  };

  // --- Sub-Components (Inline for state access) ---

  const Step1Goal = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-bold text-slate-700 mb-2">
          你的目标是什么？
        </label>
        <textarea 
          className="w-full p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
          rows={4}
          placeholder="例如：在今年年底前学会一门新语言，或者让公司业绩翻倍..."
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
        />
        <p className="text-xs text-slate-500 mt-2">
          提示：不要混淆目标（真正想要的东西）和欲望（想要但会阻碍目标的东西）。
        </p>
      </div>
    </div>
  );

  const Step2Problems = () => {
    const addProblem = () => {
      if (!tempInput.trim()) return;
      setProblems([...problems, { id: Date.now(), text: tempInput }]);
      setTempInput("");
    };

    return (
      <div className="space-y-6">
        <div className="bg-red-50 p-4 rounded-lg border border-red-100 text-red-800 text-sm">
          <strong>残酷的现实：</strong> 当你追求 <span className="font-bold">"{goal}"</span> 时，遇到了什么阻碍？
        </div>

        <div className="flex gap-2">
          <input 
            type="text" 
            className="flex-1 p-3 border border-slate-300 rounded-lg outline-none focus:border-red-500"
            placeholder="记录一个具体的问题..."
            value={tempInput}
            onChange={(e) => setTempInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addProblem()}
          />
          <Button onClick={addProblem} variant="secondary">添加</Button>
        </div>

        <ul className="space-y-3">
          {problems.map((p, idx) => (
            <li key={p.id} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg shadow-sm">
              <span className="flex items-center gap-2">
                <span className="bg-red-100 text-red-600 w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold">{idx + 1}</span>
                {p.text}
              </span>
              <button 
                onClick={() => setProblems(problems.filter(item => item.id !== p.id))}
                className="text-slate-400 hover:text-red-500"
              >
                <Trash2 size={16} />
              </button>
            </li>
          ))}
          {problems.length === 0 && (
            <div className="text-center py-8 text-slate-400 italic">
              还没有记录问题。记住，不容忍问题！
            </div>
          )}
        </ul>
      </div>
    );
  };

  const Step3Diagnosis = () => (
    <div className="space-y-6">
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {problems.map((p, idx) => (
          <button
            key={p.id}
            onClick={() => setActiveProblemId(p.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              activeProblemId === p.id 
                ? 'bg-purple-600 text-white' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            问题 {idx + 1}
          </button>
        ))}
      </div>

      {!activeProblemId ? (
        <div className="text-center py-10 text-slate-500">
          <Stethoscope size={48} className="mx-auto text-purple-200 mb-4" />
          <p>请点击上方的一个问题开始诊断。</p>
          <p className="text-sm mt-2">你需要找到阻碍你成功的根本原因。</p>
        </div>
      ) : (
        <div className="bg-purple-50 p-6 rounded-xl border border-purple-100 animate-fade-in">
          <h3 className="font-bold text-purple-900 mb-2">
            正在诊断: {problems.find(p => p.id === activeProblemId)?.text}
          </h3>
          
          <div className="space-y-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-purple-800 mb-1">
                直接原因（发生了什么行动或不行动？）
              </label>
              <input 
                className="w-full p-2 border border-purple-200 rounded focus:border-purple-500 outline-none"
                placeholder="例如：我没有检查时间表..."
                value={diagnosis[activeProblemId]?.directCause || ""}
                onChange={(e) => setDiagnosis({
                  ...diagnosis,
                  [activeProblemId]: { ...diagnosis[activeProblemId], directCause: e.target.value }
                })}
              />
            </div>
            
            <div className="flex items-start gap-4">
               <div className="flex-1">
                <label className="block text-sm font-bold text-purple-800 mb-1">
                  根本原因（这是什么样的人性特点或弱点？）
                </label>
                <textarea 
                  className="w-full p-2 border border-purple-200 rounded focus:border-purple-500 outline-none min-h-[80px]"
                  placeholder="例如：我做事缺乏条理，或者是过度自信..."
                  value={diagnosis[activeProblemId]?.rootCause || ""}
                  onChange={(e) => setDiagnosis({
                    ...diagnosis,
                    [activeProblemId]: { ...diagnosis[activeProblemId], rootCause: e.target.value }
                  })}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input 
                type="checkbox" 
                id="isWeakness"
                checked={diagnosis[activeProblemId]?.isInternal || false}
                onChange={(e) => setDiagnosis({
                  ...diagnosis,
                  [activeProblemId]: { ...diagnosis[activeProblemId], isInternal: e.target.checked }
                })}
                className="rounded text-purple-600 focus:ring-purple-500" 
              />
              <label htmlFor="isWeakness" className="text-sm text-purple-900">
                这是我个人的主要弱点吗？
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const Step4Design = () => {
    const addPlan = () => {
      if (!tempInput.trim()) return;
      setPlans([...plans, { id: Date.now(), text: tempInput, isDone: false }]);
      setTempInput("");
    };

    return (
      <div className="space-y-6">
        <div className="bg-amber-50 p-4 rounded-lg border border-amber-100 text-sm">
          <h4 className="font-bold text-amber-800 mb-2">诊断总结：</h4>
          <ul className="list-disc list-inside text-amber-700 space-y-1">
            {(Object.values(diagnosis) as Diagnosis[]).map((d, i) => (
              d.rootCause && <li key={i}>{d.rootCause}</li>
            ))}
          </ul>
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">
            设计方案（电影剧本）
          </label>
          <div className="flex gap-2 mb-4">
            <input 
              type="text" 
              className="flex-1 p-3 border border-slate-300 rounded-lg outline-none focus:border-amber-500"
              placeholder="具体的行动步骤（谁，在何时，做什么）..."
              value={tempInput}
              onChange={(e) => setTempInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addPlan()}
            />
            <Button onClick={addPlan} variant="secondary">添加步骤</Button>
          </div>

          <div className="space-y-2">
            {plans.map((plan, idx) => (
              <div key={plan.id} className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-lg">
                <div className="bg-amber-100 text-amber-700 w-6 h-6 flex items-center justify-center rounded text-xs font-bold">
                  {idx + 1}
                </div>
                <div className="flex-1 text-slate-700">{plan.text}</div>
                <button 
                  onClick={() => setPlans(plans.filter(p => p.id !== plan.id))}
                  className="text-slate-300 hover:text-red-500"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const Step5Doing = () => (
    <div className="space-y-8 text-center">
      <div className="py-6">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">开始践行</h2>
        <p className="text-slate-500 mb-8">坚定地从头至尾执行方案。保持自律。</p>
        
        <div className="max-w-md mx-auto space-y-3 text-left">
          {plans.map((plan) => (
            <div 
              key={plan.id} 
              className={`flex items-center gap-3 p-4 rounded-xl border transition-all cursor-pointer ${
                plan.isDone 
                  ? 'bg-emerald-50 border-emerald-200' 
                  : 'bg-white border-slate-200 hover:border-emerald-300'
              }`}
              onClick={() => setPlans(plans.map(p => p.id === plan.id ? {...p, isDone: !p.isDone} : p))}
            >
              <div className={`w-6 h-6 rounded border flex items-center justify-center transition-colors ${
                plan.isDone ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300'
              }`}>
                {plan.isDone && <CheckSquare size={14} className="text-white" />}
              </div>
              <span className={plan.isDone ? 'text-emerald-700 line-through' : 'text-slate-700'}>
                {plan.text}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
        <h3 className="font-bold text-slate-800 mb-2">完成循环？</h3>
        <p className="text-sm text-slate-600 mb-4">
          如果你完成了所有任务并实现了目标，或者你获得了新的反馈需要重新设定目标，请点击下方。
        </p>
        <Button onClick={resetCycle} variant="primary" className="mx-auto w-full md:w-auto">
          <RotateCcw size={18} />
          开启新的进化循环
        </Button>
      </div>
    </div>
  );

  // --- Main Render ---

  const renderCurrentStep = () => {
    switch(currentStep) {
      case 1: return <Step1Goal />;
      case 2: return <Step2Problems />;
      case 3: return <Step3Diagnosis />;
      case 4: return <Step4Design />;
      case 5: return <Step5Doing />;
      default: return <Step1Goal />;
    }
  };

  const Icon = STEP_ICONS[currentStep];
  const principle = PRINCIPLES[currentStep];
  const stepColorClass = STEP_COLORS[currentStep];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-12">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl text-slate-800">
            <RotateCcw className="text-indigo-600" />
            <span>Evolution<span className="text-slate-400 font-normal text-sm ml-2">by Ray Dalio Principles</span></span>
          </div>
          <div className="flex gap-1">
            <button 
              onClick={() => setActiveTab('cycle')}
              className={`p-2 rounded-lg transition ${activeTab === 'cycle' ? 'bg-slate-100 text-indigo-600' : 'text-slate-500 hover:text-slate-800'}`}
            >
              <Target size={20} />
            </button>
            <button 
              onClick={() => setActiveTab('profile')}
              className={`p-2 rounded-lg transition ${activeTab === 'profile' ? 'bg-slate-100 text-indigo-600' : 'text-slate-500 hover:text-slate-800'}`}
            >
              <User size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        
        {activeTab === 'cycle' && (
          <div className="space-y-6">
            {/* Progress Bar */}
            <div className="flex justify-between items-center px-2 relative">
              <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-200 -z-10 rounded"></div>
              {[1, 2, 3, 4, 5].map(step => (
                <div 
                  key={step}
                  onClick={() => step < currentStep ? setCurrentStep(step) : null}
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-4 transition-all duration-300 ${
                    currentStep === step 
                      ? 'bg-indigo-600 text-white border-indigo-100 scale-110' 
                      : step < currentStep 
                        ? 'bg-emerald-500 text-white border-emerald-100 cursor-pointer' 
                        : 'bg-white text-slate-400 border-slate-200'
                  }`}
                >
                  {step < currentStep ? <CheckSquare size={16} /> : step}
                </div>
              ))}
            </div>

            {/* Main Content Card */}
            <Card>
              {/* Header: Principle Info */}
              <div className={`px-6 py-4 border-b flex items-start gap-4 ${stepColorClass.split(' ')[1]}`}>
                <div className={`p-2 rounded-lg ${stepColorClass.split(' ')[2].replace('border', 'bg').replace('200', '200')} bg-opacity-50`}>
                  <Icon className={stepColorClass.split(' ')[0]} size={24} />
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider opacity-70 mb-1">Step {currentStep}</div>
                  <h2 className="text-xl font-bold text-slate-800">{principle.title}</h2>
                  <p className="text-slate-600 text-sm mt-1">{principle.desc}</p>
                </div>
              </div>
              
              {/* Content Area */}
              <div className="p-6 min-h-[300px]">
                {renderCurrentStep()}
              </div>

              {/* Footer: Controls */}
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                <Button 
                  onClick={prevStep} 
                  variant="outline" 
                  disabled={currentStep === 1}
                  className={currentStep === 1 ? "opacity-0" : ""}
                >
                  上一步
                </Button>
                
                {currentStep < 5 && (
                  <Button 
                    onClick={nextStep} 
                    disabled={!canProceed()} 
                    variant={canProceed() ? "primary" : "secondary"}
                  >
                    下一步 <ArrowRight size={16} />
                  </Button>
                )}
              </div>
            </Card>

            {/* Helper Cards */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                <h4 className="flex items-center gap-2 font-bold text-blue-800 text-sm mb-2">
                  <Brain size={16} />
                  达利欧的建议
                </h4>
                <ul className="text-sm text-blue-700 space-y-2">
                  {principle.tips.map((tip, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="mt-1.5 w-1 h-1 bg-blue-400 rounded-full flex-shrink-0"></span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="bg-white p-4 rounded-xl border border-slate-200">
                 <h4 className="flex items-center gap-2 font-bold text-slate-700 text-sm mb-2">
                  <User size={16} />
                  自我反思
                </h4>
                <p className="text-sm text-slate-600">
                  你在这一步通常会遇到困难吗？
                  <br/>
                  <span className="text-xs text-slate-400 mt-1 block">记住：如果你无法做好这一步，你需要保持谦逊，寻求那些擅长这一步的人的帮助。</span>
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="space-y-6 animate-fade-in">
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <User className="text-indigo-600" />
                你的意境地图与谦逊
              </h2>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-4">
                    自我评估坐标
                  </label>
                  <div className="relative w-full aspect-square border-2 border-slate-200 rounded-lg bg-slate-50 p-4">
                     {/* Axis */}
                     <div className="absolute left-4 bottom-8 top-4 w-px bg-slate-300"></div>
                     <div className="absolute left-4 right-4 bottom-8 h-px bg-slate-300"></div>
                     <div className="absolute left-2 top-4 text-xs font-bold text-slate-500">意境地图 (能力)</div>
                     <div className="absolute right-4 bottom-4 text-xs font-bold text-slate-500">谦逊 & 开放</div>
                     
                     {/* Point */}
                     <div 
                      className="absolute w-6 h-6 bg-indigo-600 rounded-full border-4 border-white shadow-lg transform -translate-x-1/2 translate-y-1/2 transition-all duration-500"
                      style={{
                        left: `${(userProfile.humilityScore / 10) * 80 + 10}%`,
                        bottom: `${(userProfile.mentalMapScore / 10) * 80 + 10}%`
                      }}
                     ></div>

                     {/* Zone Label */}
                     <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-slate-300 text-4xl font-bold opacity-20">
                        {userProfile.humilityScore > 7 && userProfile.mentalMapScore > 7 ? "最强大" : "进化中"}
                     </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2 flex justify-between">
                      <span>意境地图 (你的认知/解决问题能力)</span>
                      <span className="font-bold text-indigo-600">{userProfile.mentalMapScore}</span>
                    </label>
                    <input 
                      type="range" min="1" max="10" 
                      value={userProfile.mentalMapScore}
                      onChange={(e) => setUserProfile({...userProfile, mentalMapScore: parseInt(e.target.value)})}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2 flex justify-between">
                      <span>谦逊与头脑开放程度</span>
                      <span className="font-bold text-emerald-600">{userProfile.humilityScore}</span>
                    </label>
                    <input 
                      type="range" min="1" max="10" 
                      value={userProfile.humilityScore}
                      onChange={(e) => setUserProfile({...userProfile, humilityScore: parseInt(e.target.value)})}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                    />
                  </div>

                  <div className="bg-slate-50 p-4 rounded-lg text-sm text-slate-600">
                    <p className="mb-2"><strong>分析：</strong></p>
                    {userProfile.humilityScore < 5 && (
                      <p className="mb-2 text-red-600">你的谦逊度较低。这可能会阻碍你从他人那里学习。记住，如果你不知道答案，承认它比假装知道更强大。</p>
                    )}
                    {userProfile.mentalMapScore < 5 && userProfile.humilityScore > 7 && (
                      <p className="text-emerald-600">虽然你的当前能力（意境地图）不高，但你的高谦逊度是你最大的资产。善于利用他人的大脑！</p>
                    )}
                    {userProfile.humilityScore > 8 && userProfile.mentalMapScore > 8 && (
                      <p className="text-indigo-600">你处于最佳状态。保持这种开放性和能力的结合。</p>
                    )}
                  </div>

                  <div>
                     <label className="block text-sm font-bold text-slate-700 mb-2">
                      我最大的弱点是：
                    </label>
                    <input 
                      type="text"
                      className="w-full p-3 border border-slate-300 rounded-lg"
                      placeholder="例如：我不擅长处理细节..."
                      value={userProfile.biggestWeakness}
                      onChange={(e) => setUserProfile({...userProfile, biggestWeakness: e.target.value})}
                    />
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}