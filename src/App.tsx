import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { 
  BookOpen, 
  MessageSquare, 
  FileText, 
  Sparkles, 
  ChevronRight, 
  Send, 
  User, 
  Bot, 
  Layout, 
  CheckCircle2,
  Plus,
  Trash2,
  Save,
  ArrowRight,
  Paperclip,
  X,
  Copy,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { chatWithAI, refineExperience } from './services/geminiService';
import { Message, Experience, SOPDraft } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<'chat' | 'sop' | 'star' | 'cv'>('chat');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'model',
      text: '### 👋 你好！我是你的留學寫作學伴\n\n我會協助你打造完美的 **SOP** 與 **CV**。你想先聊聊你的背景，還是直接開始規劃架構？\n\n🚀 **你可以嘗試：**\n- 告訴我你想申請的科系\n- 提供一段經歷讓我用 STAR 法則潤飾\n- 貼上你的 SOP 草稿進行診斷',
      timestamp: Date.now()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<{ name: string; type: string; data: string } | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // STAR Method State
  const [starExp, setStarExp] = useState<Experience>({
    id: Date.now().toString(),
    situation: '',
    task: '',
    action: '',
    result: ''
  });
  const [refinedExp, setRefinedExp] = useState('');

  // SOP Draft State
  const [sopDraft, setSopDraft] = useState<SOPDraft>({
    introduction: '',
    academicBackground: '',
    experience: '',
    conclusion: ''
  });

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if ((!input.trim() && !selectedFile) || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: Date.now(),
      attachment: selectedFile ? { name: selectedFile.name, type: selectedFile.type } : undefined
    };

    setMessages(prev => [...prev, userMsg]);
    const currentInput = input;
    const currentFile = selectedFile;
    
    setInput('');
    setSelectedFile(null);
    setIsLoading(true);

    try {
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      const lastParts: any[] = [];
      if (currentInput) lastParts.push({ text: currentInput });
      if (currentFile) {
        lastParts.push({
          inlineData: {
            mimeType: currentFile.type,
            data: currentFile.data
          }
        });
      }

      history.push({ role: 'user', parts: lastParts });

      const aiResponse = await chatWithAI(history);
      const modelMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: aiResponse || '抱歉，我現在無法回應。',
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, modelMsg]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert('目前僅支援 PDF 檔案上傳。');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = (event.target?.result as string).split(',')[1];
      setSelectedFile({
        name: file.name,
        type: file.type,
        data: base64
      });
    };
    reader.readAsDataURL(file);
  };

  const handleRefineSTAR = async () => {
    setIsLoading(true);
    try {
      const result = await refineExperience(starExp);
      setRefinedExp(result || '');
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#F5F2ED] text-[#1A1A1A] font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-[#1A1A1A]/10 flex flex-col">
        <div className="p-6 border-b border-[#1A1A1A]/10">
          <h1 className="text-xl font-serif font-bold tracking-tight flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-[#5A5A40]" />
            留學 AI 學伴
          </h1>
          <p className="text-xs text-[#1A1A1A]/50 mt-1 italic">Inspired by Fiona Hu</p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <button 
            onClick={() => setActiveTab('chat')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'chat' ? 'bg-[#5A5A40] text-white shadow-md' : 'hover:bg-black/5'}`}
          >
            <MessageSquare className="w-5 h-5" />
            <span className="font-medium">AI 諮詢對話</span>
          </button>
          <button 
            onClick={() => setActiveTab('sop')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'sop' ? 'bg-[#5A5A40] text-white shadow-md' : 'hover:bg-black/5'}`}
          >
            <Layout className="w-5 h-5" />
            <span className="font-medium">SOP 架構規劃</span>
          </button>
          <button 
            onClick={() => setActiveTab('star')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'star' ? 'bg-[#5A5A40] text-white shadow-md' : 'hover:bg-black/5'}`}
          >
            <Sparkles className="w-5 h-5" />
            <span className="font-medium">STAR 經歷潤飾</span>
          </button>
          <button 
            onClick={() => setActiveTab('cv')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'cv' ? 'bg-[#5A5A40] text-white shadow-md' : 'hover:bg-black/5'}`}
          >
            <FileText className="w-5 h-5" />
            <span className="font-medium">CV 撰寫指南</span>
          </button>
        </nav>

        <div className="p-4 border-t border-[#1A1A1A]/10">
          <div className="bg-[#E6E6E6] p-4 rounded-2xl text-xs space-y-2">
            <p className="font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> 寫作小撇步
            </p>
            <p className="opacity-70 italic">"Show, Don't Tell. 用具體事例代替空洞形容詞。"</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-[#1A1A1A]/10 flex items-center justify-between px-8">
          <h2 className="font-serif text-lg font-medium">
            {activeTab === 'chat' && 'AI 寫作諮詢'}
            {activeTab === 'sop' && 'SOP 樹狀架構規劃'}
            {activeTab === 'star' && 'STAR 法則經歷潤飾'}
            {activeTab === 'cv' && 'CV 專業格式指南'}
          </h2>
          <div className="flex items-center gap-4">
            <span className="text-xs font-mono bg-black/5 px-2 py-1 rounded">v1.0.0</span>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          <AnimatePresence mode="wait">
            {activeTab === 'chat' && (
              <motion.div 
                key="chat"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="max-w-3xl mx-auto flex flex-col h-full"
              >
                <div className="flex-1 space-y-6 mb-4">
                  {messages.map((m) => (
                    <div key={m.id} className={`flex gap-4 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${m.role === 'user' ? 'bg-[#5A5A40] text-white' : 'bg-white border border-[#1A1A1A]/10'}`}>
                        {m.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                      </div>
                      <div className={`max-w-[80%] group relative p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${m.role === 'user' ? 'bg-[#5A5A40] text-white' : 'bg-white'}`}>
                        {m.attachment && (
                          <div className={`mb-2 p-2 rounded-lg flex items-center gap-2 text-xs ${m.role === 'user' ? 'bg-white/10' : 'bg-black/5'}`}>
                            <FileText className="w-4 h-4" />
                            <span className="font-medium truncate">{m.attachment.name}</span>
                          </div>
                        )}
                        <div className="markdown-body">
                          <ReactMarkdown>{m.text}</ReactMarkdown>
                        </div>
                        
                        <button 
                          onClick={() => handleCopy(m.text, m.id)}
                          className={`absolute top-2 ${m.role === 'user' ? '-left-10' : '-right-10'} p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-black/5 text-[#1A1A1A]/40 hover:text-[#5A5A40]`}
                          title="複製內容"
                        >
                          {copiedId === m.id ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-white border border-[#1A1A1A]/10 flex items-center justify-center">
                        <Bot className="w-5 h-5" />
                      </div>
                      <div className="bg-white p-4 rounded-2xl shadow-sm">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-black/20 rounded-full animate-bounce" />
                          <div className="w-2 h-2 bg-black/20 rounded-full animate-bounce [animation-delay:0.2s]" />
                          <div className="w-2 h-2 bg-black/20 rounded-full animate-bounce [animation-delay:0.4s]" />
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                <div className="sticky bottom-0 bg-[#F5F2ED] pt-4 pb-2">
                  {selectedFile && (
                    <div className="mb-2 flex items-center gap-2 bg-white border border-[#1A1A1A]/10 rounded-xl px-4 py-2 w-fit animate-fade-in">
                      <FileText className="w-4 h-4 text-[#5A5A40]" />
                      <span className="text-xs font-medium truncate max-w-[200px]">{selectedFile.name}</span>
                      <button onClick={() => setSelectedFile(null)} className="hover:text-red-500 transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  <div className="relative flex items-center gap-2">
                    <div className="relative flex-1">
                      <input 
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder={selectedFile ? "針對此 PDF 檔案提問..." : "輸入你的問題或草稿內容..."}
                        className="w-full bg-white border border-[#1A1A1A]/10 rounded-2xl px-6 py-4 pr-24 focus:outline-none focus:ring-2 focus:ring-[#5A5A40]/20 transition-all shadow-sm"
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                        <input 
                          type="file" 
                          ref={fileInputRef} 
                          onChange={handleFileChange} 
                          accept=".pdf" 
                          className="hidden" 
                        />
                        <button 
                          onClick={() => fileInputRef.current?.click()}
                          className="w-10 h-10 text-[#1A1A1A]/40 hover:text-[#5A5A40] hover:bg-black/5 rounded-xl flex items-center justify-center transition-all"
                          title="上傳 PDF"
                        >
                          <Paperclip className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={handleSendMessage}
                          disabled={isLoading || (!input.trim() && !selectedFile)}
                          className="w-10 h-10 bg-[#5A5A40] text-white rounded-xl flex items-center justify-center hover:opacity-90 disabled:opacity-50 transition-all shadow-md"
                        >
                          <Send className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'sop' && (
              <motion.div 
                key="sop"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="max-w-4xl mx-auto space-y-8"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <section className="bg-white p-6 rounded-3xl shadow-sm border border-[#1A1A1A]/5">
                      <h3 className="font-serif font-bold text-lg mb-4 flex items-center gap-2">
                        <span className="w-6 h-6 bg-[#5A5A40] text-white rounded-full text-xs flex items-center justify-center">1</span>
                        引言 (Introduction)
                      </h3>
                      <textarea 
                        className="w-full h-32 p-4 bg-[#F5F2ED]/50 rounded-xl border-none focus:ring-1 focus:ring-[#5A5A40] text-sm"
                        placeholder="動機、主旨句 (Thesis Statement)..."
                        value={sopDraft.introduction}
                        onChange={(e) => setSopDraft({...sopDraft, introduction: e.target.value})}
                      />
                    </section>

                    <section className="bg-white p-6 rounded-3xl shadow-sm border border-[#1A1A1A]/5">
                      <h3 className="font-serif font-bold text-lg mb-4 flex items-center gap-2">
                        <span className="w-6 h-6 bg-[#5A5A40] text-white rounded-full text-xs flex items-center justify-center">2</span>
                        學術背景 (Academic)
                      </h3>
                      <textarea 
                        className="w-full h-32 p-4 bg-[#F5F2ED]/50 rounded-xl border-none focus:ring-1 focus:ring-[#5A5A40] text-sm"
                        placeholder="大學主修、重要課程、研究興趣..."
                        value={sopDraft.academicBackground}
                        onChange={(e) => setSopDraft({...sopDraft, academicBackground: e.target.value})}
                      />
                    </section>
                  </div>

                  <div className="space-y-6">
                    <section className="bg-white p-6 rounded-3xl shadow-sm border border-[#1A1A1A]/5">
                      <h3 className="font-serif font-bold text-lg mb-4 flex items-center gap-2">
                        <span className="w-6 h-6 bg-[#5A5A40] text-white rounded-full text-xs flex items-center justify-center">3</span>
                        專業經歷 (Experience)
                      </h3>
                      <textarea 
                        className="w-full h-32 p-4 bg-[#F5F2ED]/50 rounded-xl border-none focus:ring-1 focus:ring-[#5A5A40] text-sm"
                        placeholder="實習、工作、專案成果..."
                        value={sopDraft.experience}
                        onChange={(e) => setSopDraft({...sopDraft, experience: e.target.value})}
                      />
                    </section>

                    <section className="bg-white p-6 rounded-3xl shadow-sm border border-[#1A1A1A]/5">
                      <h3 className="font-serif font-bold text-lg mb-4 flex items-center gap-2">
                        <span className="w-6 h-6 bg-[#5A5A40] text-white rounded-full text-xs flex items-center justify-center">4</span>
                        結論 (Conclusion)
                      </h3>
                      <textarea 
                        className="w-full h-32 p-4 bg-[#F5F2ED]/50 rounded-xl border-none focus:ring-1 focus:ring-[#5A5A40] text-sm"
                        placeholder="職涯目標、為什麼申請這所學校..."
                        value={sopDraft.conclusion}
                        onChange={(e) => setSopDraft({...sopDraft, conclusion: e.target.value})}
                      />
                    </section>
                  </div>
                </div>

                <div className="flex justify-center gap-4">
                  <button className="flex items-center gap-2 px-8 py-3 bg-white border border-[#1A1A1A]/10 rounded-2xl font-medium hover:bg-black/5 transition-all">
                    <Save className="w-5 h-5" /> 保存草稿
                  </button>
                  <button 
                    onClick={() => {
                      setActiveTab('chat');
                      setMessages(prev => [...prev, {
                        id: Date.now().toString(),
                        role: 'user',
                        text: `請幫我分析我的 SOP 草稿大綱：\n\n引言：${sopDraft.introduction}\n學術：${sopDraft.academicBackground}\n經歷：${sopDraft.experience}\n結論：${sopDraft.conclusion}`,
                        timestamp: Date.now()
                      }]);
                      handleSendMessage();
                    }}
                    className="flex items-center gap-2 px-8 py-3 bg-[#5A5A40] text-white rounded-2xl font-medium hover:opacity-90 shadow-lg transition-all"
                  >
                    <Sparkles className="w-5 h-5" /> AI 診斷分析
                  </button>
                </div>
              </motion.div>
            )}

            {activeTab === 'star' && (
              <motion.div 
                key="star"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="max-w-4xl mx-auto"
              >
                <div className="bg-white rounded-[2rem] shadow-xl overflow-hidden flex flex-col md:flex-row border border-[#1A1A1A]/5">
                  <div className="flex-1 p-8 space-y-6">
                    <div className="space-y-4">
                      <label className="block">
                        <span className="text-xs font-bold uppercase tracking-widest text-[#5A5A40]">Situation 背景</span>
                        <input 
                          type="text" 
                          className="mt-1 w-full p-3 bg-[#F5F2ED]/50 rounded-xl border-none focus:ring-1 focus:ring-[#5A5A40] text-sm"
                          placeholder="當時在什麼公司/專案？面臨什麼情況？"
                          value={starExp.situation}
                          onChange={(e) => setStarExp({...starExp, situation: e.target.value})}
                        />
                      </label>
                      <label className="block">
                        <span className="text-xs font-bold uppercase tracking-widest text-[#5A5A40]">Task 任務</span>
                        <input 
                          type="text" 
                          className="mt-1 w-full p-3 bg-[#F5F2ED]/50 rounded-xl border-none focus:ring-1 focus:ring-[#5A5A40] text-sm"
                          placeholder="你的目標是什麼？需要解決什麼問題？"
                          value={starExp.task}
                          onChange={(e) => setStarExp({...starExp, task: e.target.value})}
                        />
                      </label>
                      <label className="block">
                        <span className="text-xs font-bold uppercase tracking-widest text-[#5A5A40]">Action 行動</span>
                        <textarea 
                          className="mt-1 w-full h-24 p-3 bg-[#F5F2ED]/50 rounded-xl border-none focus:ring-1 focus:ring-[#5A5A40] text-sm"
                          placeholder="你具體做了什麼？使用了什麼技能？"
                          value={starExp.action}
                          onChange={(e) => setStarExp({...starExp, action: e.target.value})}
                        />
                      </label>
                      <label className="block">
                        <span className="text-xs font-bold uppercase tracking-widest text-[#5A5A40]">Result 結果</span>
                        <input 
                          type="text" 
                          className="mt-1 w-full p-3 bg-[#F5F2ED]/50 rounded-xl border-none focus:ring-1 focus:ring-[#5A5A40] text-sm"
                          placeholder="最終成效為何？(建議包含數據)"
                          value={starExp.result}
                          onChange={(e) => setStarExp({...starExp, result: e.target.value})}
                        />
                      </label>
                    </div>
                    <button 
                      onClick={handleRefineSTAR}
                      disabled={isLoading || !starExp.action}
                      className="w-full py-4 bg-[#5A5A40] text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 transition-all shadow-lg"
                    >
                      {isLoading ? '潤飾中...' : <><Sparkles className="w-5 h-5" /> AI 專業潤飾</>}
                    </button>
                  </div>

                  <div className="w-full md:w-80 bg-[#1A1A1A] p-8 text-white flex flex-col">
                    <h3 className="font-serif text-xl font-bold mb-6 italic">Refined Result</h3>
                    <div className="flex-1 bg-white/5 rounded-2xl p-6 text-sm leading-relaxed border border-white/10 overflow-y-auto">
                      {refinedExp ? (
                        <div className="markdown-body dark">
                          <ReactMarkdown>{refinedExp}</ReactMarkdown>
                        </div>
                      ) : (
                        <p className="opacity-40 italic">填寫左側 STAR 內容並點擊潤飾，AI 將為你生成專業的經歷段落。</p>
                      )}
                    </div>
                    {refinedExp && (
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(refinedExp);
                          alert('已複製到剪貼簿！');
                        }}
                        className="mt-6 w-full py-3 bg-white/10 border border-white/20 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-white/20 transition-all"
                      >
                        Copy to Clipboard
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'cv' && (
              <motion.div 
                key="cv"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8"
              >
                <div className="md:col-span-1 space-y-6">
                  <div className="bg-white p-6 rounded-3xl shadow-sm border border-[#1A1A1A]/5">
                    <h3 className="font-serif font-bold text-lg mb-4">CV 核心原則</h3>
                    <ul className="space-y-4">
                      <li className="flex gap-3 text-sm">
                        <CheckCircle2 className="w-5 h-5 text-[#5A5A40] shrink-0" />
                        <span>**倒敘法**：從最近的經歷開始寫。</span>
                      </li>
                      <li className="flex gap-3 text-sm">
                        <CheckCircle2 className="w-5 h-5 text-[#5A5A40] shrink-0" />
                        <span>**量化成果**：使用數據 (%, $, 人數) 增加說服力。</span>
                      </li>
                      <li className="flex gap-3 text-sm">
                        <CheckCircle2 className="w-5 h-5 text-[#5A5A40] shrink-0" />
                        <span>**強動詞**：使用 Led, Developed, Optimized 等動詞開頭。</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="bg-[#5A5A40] p-6 rounded-3xl text-white shadow-lg">
                    <h3 className="font-serif font-bold text-lg mb-2">需要範例嗎？</h3>
                    <p className="text-sm opacity-80 mb-4">我可以根據你的目標領域，提供不同風格的 CV 模板建議。</p>
                    <button 
                      onClick={() => {
                        setActiveTab('chat');
                        setInput('請給我一份適合申請 [你的領域] 研究所的 CV 範例與排版建議。');
                      }}
                      className="w-full py-3 bg-white text-[#5A5A40] rounded-xl font-bold text-sm hover:bg-opacity-90 transition-all"
                    >
                      獲取範例
                    </button>
                  </div>
                </div>

                <div className="md:col-span-2 bg-white rounded-[2rem] shadow-sm border border-[#1A1A1A]/5 p-10 overflow-hidden">
                  <div className="border-b-2 border-black pb-4 mb-8">
                    <h1 className="text-3xl font-serif font-bold text-center uppercase tracking-widest">Your Name</h1>
                    <p className="text-center text-xs mt-2 opacity-60">Email: your@email.com | Phone: +886 912 345 678 | LinkedIn: linkedin.com/in/username</p>
                  </div>

                  <div className="space-y-8">
                    <section>
                      <h2 className="text-sm font-bold uppercase tracking-widest border-b border-black/10 pb-1 mb-3">Education</h2>
                      <div className="flex justify-between text-sm font-bold">
                        <span>National Taiwan University</span>
                        <span>Taipei, Taiwan</span>
                      </div>
                      <div className="flex justify-between text-sm italic opacity-70">
                        <span>B.S. in Computer Science</span>
                        <span>Sept 2020 – June 2024</span>
                      </div>
                    </section>

                    <section>
                      <h2 className="text-sm font-bold uppercase tracking-widest border-b border-black/10 pb-1 mb-3">Work Experience</h2>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm font-bold">
                            <span>Software Engineer Intern, Tech Corp</span>
                            <span>Hsinchu, Taiwan</span>
                          </div>
                          <div className="text-xs italic opacity-70 mb-2">June 2023 – Aug 2023</div>
                          <ul className="list-disc list-inside text-sm space-y-1 opacity-80">
                            <li>Developed a new feature using React that increased user engagement by 15%.</li>
                            <li>Optimized database queries, reducing API response time by 200ms.</li>
                          </ul>
                        </div>
                      </div>
                    </section>

                    <section>
                      <h2 className="text-sm font-bold uppercase tracking-widest border-b border-black/10 pb-1 mb-3">Skills</h2>
                      <p className="text-sm opacity-80"><span className="font-bold">Languages:</span> Python, Java, JavaScript, C++</p>
                      <p className="text-sm opacity-80"><span className="font-bold">Tools:</span> React, Node.js, Git, Docker, AWS</p>
                    </section>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
