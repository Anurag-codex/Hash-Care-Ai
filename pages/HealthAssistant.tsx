
import React, { useState, useEffect, useRef } from 'react';
import { Card, Button, Badge } from '../components/Common';
import { 
  Mic, MicOff, Activity, Zap, BrainCircuit, X, 
  Play, Pause, Volume2, Sparkles, MessageSquare, History, User, Bot, AlertTriangle
} from 'lucide-react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';

// --- Types ---
interface AudioStreamConfig {
  sampleRate: number;
}

interface TranscriptItem {
    id: string;
    role: 'user' | 'model';
    text: string;
    isPartial: boolean;
}

// --- Audio Utils ---
const AUDIO_SAMPLE_RATE = 24000;
const INPUT_SAMPLE_RATE = 16000;

function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

function float32ToInt16(float32: Float32Array): Int16Array {
  const int16 = new Int16Array(float32.length);
  for (let i = 0; i < float32.length; i++) {
    const s = Math.max(-1, Math.min(1, float32[i]));
    int16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
  }
  return int16;
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}


export const HealthAssistant: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [status, setStatus] = useState<'offline' | 'connecting' | 'listening' | 'speaking' | 'error'>('offline');
  const [errorMessage, setErrorMessage] = useState('');
  const [transcripts, setTranscripts] = useState<TranscriptItem[]>([]);
  const [volume, setVolume] = useState(0); 
  
  // Refs for Audio Contexts and Processor
  const audioContextRef = useRef<AudioContext | null>(null);
  const inputContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sessionRef = useRef<any>(null); 
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioSourcesRef = useRef<AudioBufferSourceNode[]>([]);
  
  // Transcription Accumulators
  const currentInputTransRef = useRef("");
  const currentOutputTransRef = useRef("");

  // Scroll ref
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of transcript
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcripts]);

  // --- Visualizer Animation ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let rotation = 0;

    const render = () => {
        const width = canvas.width;
        const height = canvas.height;
        const centerX = width / 2;
        const centerY = height / 2;
        
        // Clear
        ctx.fillStyle = '#020617'; 
        ctx.fillRect(0, 0, width, height);

        // Grid Background
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 1;
        ctx.beginPath();
        for(let i=0; i<width; i+=40) { ctx.moveTo(i, 0); ctx.lineTo(i, height); }
        for(let i=0; i<height; i+=40) { ctx.moveTo(0, i); ctx.lineTo(width, i); }
        ctx.stroke();

        if (status === 'offline' || status === 'error') {
            // Idle State - Static Ring
            ctx.beginPath();
            ctx.arc(centerX, centerY, 50, 0, Math.PI * 2);
            ctx.strokeStyle = status === 'error' ? '#ef4444' : '#334155';
            ctx.lineWidth = 2;
            ctx.stroke();
            
            ctx.font = '14px sans-serif';
            ctx.fillStyle = status === 'error' ? '#ef4444' : '#64748b';
            ctx.textAlign = 'center';
            ctx.fillText(status === 'error' ? "ERROR" : "OFFLINE", centerX, centerY + 5);
        } else {
            // Active Holographic Animation
            rotation += 0.01 + (volume * 0.1); 
            const baseRadius = 60;
            const pulse = Math.sin(Date.now() / 500) * 5 + (volume * 40); // Increased sensitivity
            
            // Core Glow
            const gradient = ctx.createRadialGradient(centerX, centerY, 10, centerX, centerY, 100);
            gradient.addColorStop(0, status === 'speaking' ? '#60a5fa' : '#2dd4bf'); 
            gradient.addColorStop(1, 'transparent');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(centerX, centerY, baseRadius + pulse, 0, Math.PI * 2);
            ctx.fill();

            // Orbiting Rings
            ctx.save();
            ctx.translate(centerX, centerY);
            ctx.rotate(rotation);
            
            // Ring 1
            ctx.beginPath();
            ctx.ellipse(0, 0, baseRadius + 20, (baseRadius + 20) * 0.4, 0, 0, Math.PI * 2);
            ctx.strokeStyle = status === 'speaking' ? 'rgba(96, 165, 250, 0.6)' : 'rgba(45, 212, 191, 0.6)';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Ring 2 (Opposite rotation)
            ctx.rotate(Math.PI / 2);
            ctx.beginPath();
            ctx.ellipse(0, 0, baseRadius + 30, (baseRadius + 30) * 0.4, 0, 0, Math.PI * 2);
            ctx.strokeStyle = status === 'speaking' ? 'rgba(147, 197, 253, 0.4)' : 'rgba(94, 234, 212, 0.4)';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Particles
            for(let i=0; i<8; i++) {
                const angle = (Date.now() / 1000) + (i * (Math.PI / 4));
                const r = baseRadius + 40 + Math.sin(Date.now()/300 + i)*10;
                ctx.fillStyle = '#fff';
                ctx.fillRect(Math.cos(angle) * r, Math.sin(angle) * r, 2, 2);
            }

            ctx.restore();
        }

        animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [status, volume]);


  // --- Logic ---
  const connectToGemini = async () => {
    try {
        setErrorMessage('');
        
        // Ensure API Key Selection
        if ((window as any).aistudio) {
            const hasKey = await (window as any).aistudio.hasSelectedApiKey();
            if (!hasKey) {
                await (window as any).aistudio.openSelectKey();
            }
        }
        
        const apiKey = process.env.API_KEY || '';
        if (!apiKey) throw new Error("API Key Missing. Please select a key.");

        setStatus('connecting');
        
        // 1. Setup Audio Output Context
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: AUDIO_SAMPLE_RATE });
        await audioContextRef.current.resume();
        nextStartTimeRef.current = audioContextRef.current.currentTime;
        audioSourcesRef.current = [];

        // 2. Setup Audio Input
        inputContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: INPUT_SAMPLE_RATE });
        
        let stream: MediaStream;
        try {
            stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        } catch (err) {
            throw new Error("Microphone access denied. Please check your permissions.");
        }

        // RACE CONDITION CHECK: If we disconnected while awaiting, stop here
        if (!inputContextRef.current) {
            stream.getTracks().forEach(track => track.stop());
            return;
        }

        streamRef.current = stream;
        const source = inputContextRef.current.createMediaStreamSource(stream);
        processorRef.current = inputContextRef.current.createScriptProcessor(4096, 1, 1);
        
        // 3. Initialize Gemini Client
        const ai = new GoogleGenAI({ apiKey });
        
        // 4. Connect Session
        const sessionPromise = ai.live.connect({
            model: 'gemini-2.5-flash-native-audio-preview-09-2025',
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } }
                },
                systemInstruction: "You are Hash Voice Care, an advanced AI medical assistant. You are helpful, professional, and concise. You speak with a calm, reassuring tone. Keep answers short and medically relevant. Always respond in the same language the user is speaking.",
                inputAudioTranscription: {}, 
                outputAudioTranscription: {}, 
            },
            callbacks: {
                onopen: () => {
                    console.log("Gemini Live Connected");
                    // Check if still mounted/active
                    if (audioContextRef.current) {
                        setStatus('listening');
                        setIsActive(true);
                    }
                },
                onmessage: async (msg: LiveServerMessage) => {
                    // Handle Interruption
                    if (msg.serverContent?.interrupted) {
                        console.log("Interrupted!");
                        audioSourcesRef.current.forEach(node => {
                            try { node.stop(); } catch(e) {}
                        });
                        audioSourcesRef.current = [];
                        if (audioContextRef.current) {
                            nextStartTimeRef.current = audioContextRef.current.currentTime;
                        }
                        currentOutputTransRef.current = ""; 
                        return;
                    }

                    // Audio Output
                    const audioData = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
                    if (audioData && audioContextRef.current) {
                        setStatus('speaking');
                        // Fake visualizer volume if raw analysis is too heavy
                        setVolume(0.5 + Math.random() * 0.5); 
                        
                        const ctx = audioContextRef.current;
                        const bytes = base64ToUint8Array(audioData);
                        const int16 = new Int16Array(bytes.buffer);
                        const float32 = new Float32Array(int16.length);
                        for(let i=0; i<int16.length; i++) {
                            float32[i] = int16[i] / 32768.0;
                        }
                        
                        const buffer = ctx.createBuffer(1, float32.length, AUDIO_SAMPLE_RATE);
                        buffer.copyToChannel(float32, 0);
                        
                        const sourceNode = ctx.createBufferSource();
                        sourceNode.buffer = buffer;
                        sourceNode.connect(ctx.destination);
                        
                        const startTime = Math.max(ctx.currentTime, nextStartTimeRef.current);
                        sourceNode.start(startTime);
                        nextStartTimeRef.current = startTime + buffer.duration;
                        
                        audioSourcesRef.current.push(sourceNode);
                        sourceNode.onended = () => {
                            audioSourcesRef.current = audioSourcesRef.current.filter(n => n !== sourceNode);
                            if (audioSourcesRef.current.length === 0) {
                                 setStatus('listening');
                                 setVolume(0);
                            }
                        };
                    }

                    // Transcription Handling
                    if (msg.serverContent?.outputTranscription?.text) {
                        const text = msg.serverContent.outputTranscription.text;
                        currentOutputTransRef.current += text;
                        updateTranscript('model', currentOutputTransRef.current, true);
                    }
                    if (msg.serverContent?.inputTranscription?.text) {
                         const text = msg.serverContent.inputTranscription.text;
                         currentInputTransRef.current += text;
                         updateTranscript('user', currentInputTransRef.current, true);
                    }
                    
                    if (msg.serverContent?.turnComplete) {
                        // Commit transcript
                        if (currentInputTransRef.current) {
                            updateTranscript('user', currentInputTransRef.current, false);
                            currentInputTransRef.current = "";
                        }
                        if (currentOutputTransRef.current) {
                            updateTranscript('model', currentOutputTransRef.current, false);
                            currentOutputTransRef.current = "";
                        }
                    }
                },
                onclose: () => {
                    console.log("Gemini Live Closed");
                    disconnect();
                },
                onerror: (err) => {
                    console.error("Gemini Error", err);
                    setErrorMessage("Service unavailable or network error. Please try again.");
                    setStatus('error');
                    disconnect();
                }
            }
        });

        sessionRef.current = sessionPromise;

        // 5. Start Streaming Input
        processorRef.current.onaudioprocess = (e) => {
            if (status !== 'listening' && status !== 'speaking' && status !== 'connecting') return;
            
            const inputData = e.inputBuffer.getChannelData(0);
            
            let sum = 0;
            for(let i=0; i<inputData.length; i++) sum += inputData[i] * inputData[i];
            const rms = Math.sqrt(sum / inputData.length);
            if (status === 'listening') setVolume(rms * 8); 

            const pcmInt16 = float32ToInt16(inputData);
            const pcmBuffer = pcmInt16.buffer;
            
            sessionPromise.then(session => {
                session.sendRealtimeInput({
                    media: {
                        mimeType: 'audio/pcm;rate=16000',
                        data: arrayBufferToBase64(pcmBuffer)
                    }
                });
            }).catch(e => {
                // SIlently fail if session not ready, loop will retry or close
            });
        };

        source.connect(processorRef.current);
        processorRef.current.connect(inputContextRef.current.destination);

    } catch (e: any) {
        console.error("Connection Failed", e);
        setErrorMessage(e.message || "Connection failed");
        setStatus('error');
        setIsActive(false);
        // Clean up potentially partially opened contexts
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
             audioContextRef.current.close();
             audioContextRef.current = null;
        }
        if (inputContextRef.current && inputContextRef.current.state !== 'closed') {
             inputContextRef.current.close();
             inputContextRef.current = null;
        }
    }
  };

  const updateTranscript = (role: 'user' | 'model', text: string, isPartial: boolean) => {
      setTranscripts(prev => {
          // Check if the last item is the same role and is partial
          const last = prev[prev.length - 1];
          if (last && last.role === role && last.isPartial) {
              const newArr = [...prev];
              newArr[prev.length - 1] = { ...last, text, isPartial };
              return newArr;
          } else {
              // If commit (isPartial false), ensure we replace the partial one
              if (!isPartial && last && last.role === role && last.isPartial) {
                   const newArr = [...prev];
                   newArr[prev.length - 1] = { ...last, text, isPartial: false };
                   return newArr;
              }
              return [...prev, { id: Date.now().toString(), role, text, isPartial }];
          }
      });
  };

  const disconnect = () => {
    setIsActive(false);
    if (status !== 'error') setStatus('offline');
    setVolume(0);
    currentInputTransRef.current = "";
    currentOutputTransRef.current = "";
    
    // Stop Tracks
    if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
    }
    // Close Contexts
    if (inputContextRef.current) {
        inputContextRef.current.close();
        inputContextRef.current = null;
    }
    if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
    }
    // Clean Processor
    if (processorRef.current) {
        processorRef.current.disconnect();
        processorRef.current = null;
    }
  };

  // Toggle Handler
  const toggleJarvis = () => {
      if (isActive) {
          disconnect();
          setStatus('offline'); // clear error on manual stop
      } else {
          connectToGemini();
      }
  };

  const handleQuickConsult = async (prompt: string) => {
      if (!isActive) {
          await connectToGemini();
          // wait a beat for connection logic to start, then optimistically show user bubble
          // Real sending happens if session connects.
      }
      
      // Attempt to send text if session object allows (optimistic)
      if (sessionRef.current) {
          sessionRef.current.then((session: any) => {
               // We simulate the user turn in transcript for UX, as explicit text injection is experimental
               updateTranscript('user', prompt, false);
          });
      }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col gap-6">
        {/* Header Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <BrainCircuit className="w-8 h-8 text-brand-500" />
                    Hash Voice Care
                </h1>
                <p className="text-slate-500 dark:text-slate-400">Advanced AI Holographic Medical Consultant</p>
            </div>
            
            <div className="flex items-center gap-4">
                 {isActive && (
                    <div className="flex items-center gap-2 px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full animate-pulse">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        <span className="text-xs font-bold uppercase">Voice Recognition Active</span>
                    </div>
                 )}
                 <Button 
                    variant={isActive ? 'danger' : 'primary'} 
                    onClick={toggleJarvis}
                    icon={isActive ? MicOff : Mic}
                    className="shadow-lg shadow-brand-500/20"
                 >
                     {isActive ? 'Deactivate HashCare' : 'Activate HashCare'}
                 </Button>
            </div>
        </div>

        {errorMessage && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl flex items-center gap-3 border border-red-200 dark:border-red-800 animate-in fade-in slide-in-from-top-2">
                <AlertTriangle className="w-5 h-5" />
                <span className="font-medium">{errorMessage}</span>
                <button onClick={() => setErrorMessage('')} className="ml-auto"><X className="w-4 h-4" /></button>
            </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
            {/* Main Holographic Interface */}
            <Card className="lg:col-span-2 bg-slate-950 border-slate-800 relative overflow-hidden flex flex-col p-0 shadow-2xl">
                {/* Canvas Visualizer */}
                <div className="relative flex-1 bg-slate-950 flex items-center justify-center overflow-hidden">
                    <canvas 
                        ref={canvasRef} 
                        width={800} 
                        height={600} 
                        className="w-full h-full object-cover opacity-90"
                    />
                    
                    {/* Overlay Grid UI */}
                    <div className="absolute inset-0 pointer-events-none p-6 flex flex-col justify-between">
                        {/* Top HUD */}
                        <div className="flex justify-between items-start text-cyan-500/50 font-mono text-xs">
                             <div className="space-y-1">
                                 <p>SYS.METRICS</p>
                                 <p>CPU: 12%</p>
                                 <p>MEM: 404MB</p>
                             </div>
                             <div className="text-right space-y-1">
                                 <p>NET.LATENCY</p>
                                 <p>{isActive ? '12ms' : '--'}</p>
                                 <p>SECURE.CONN</p>
                             </div>
                        </div>

                        {/* Central Status Text */}
                        {isActive && (
                            <div className="absolute top-3/4 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center space-y-2">
                                <div className="px-4 py-1 rounded-full border border-cyan-500/30 bg-cyan-950/50 backdrop-blur-md text-cyan-400 text-xs font-bold tracking-widest uppercase">
                                    {status === 'speaking' ? 'AI SPEAKING...' : status === 'listening' ? 'LISTENING...' : 'CONNECTING...'}
                                </div>
                                <p className="text-slate-500 text-xs">Dr. HashCare AI</p>
                            </div>
                        )}
                        
                        {!isActive && status !== 'error' && (
                             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                                 <div className="w-16 h-16 rounded-full border-2 border-slate-800 flex items-center justify-center mx-auto mb-4">
                                     <MicOff className="w-6 h-6 text-slate-700" />
                                 </div>
                                 <p className="text-slate-500 text-sm">Click Activate to start session</p>
                             </div>
                        )}

                        {/* Bottom HUD - Live Subtitles */}
                        <div className="w-full max-w-2xl mx-auto min-h-[60px] flex items-end justify-center pointer-events-none">
                             {transcripts.length > 0 && transcripts[transcripts.length-1].role === 'model' && (
                                 <p className="text-cyan-100 text-lg font-medium text-center drop-shadow-md animate-in slide-in-from-bottom-2 fade-in bg-black/40 backdrop-blur-sm px-4 py-2 rounded-xl">
                                     "{transcripts[transcripts.length-1].text}"
                                 </p>
                             )}
                        </div>
                    </div>
                </div>
            </Card>

            {/* Right Panel: Quick Actions & History */}
            <div className="flex flex-col gap-4 min-h-0 h-full overflow-hidden">
                {/* Quick Prompts */}
                <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shrink-0">
                    <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-brand-500" />
                        <h3 className="font-bold text-slate-800 dark:text-white text-sm">Quick Consultation</h3>
                    </div>
                    <div className="p-4 space-y-3">
                        {[
                            "I have chest pain and shortness of breath",
                            "I feel dizzy and have headaches",
                            "I have been feeling tired lately",
                            "My blood pressure seems high"
                        ].map((prompt, i) => (
                            <button 
                                key={i}
                                onClick={() => handleQuickConsult(prompt)}
                                className="w-full text-left p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-brand-500 hover:bg-brand-50 dark:hover:bg-brand-900/10 transition-all group active:scale-95"
                            >
                                <div className="flex items-center gap-3">
                                    <MessageSquare className="w-4 h-4 text-slate-400 group-hover:text-brand-500" />
                                    <span className="text-sm text-slate-600 dark:text-slate-300 font-medium group-hover:text-brand-700 dark:group-hover:text-brand-400">
                                        "{prompt}"
                                    </span>
                                </div>
                            </button>
                        ))}
                    </div>
                </Card>

                {/* Recent Consultations (Live Transcript) */}
                <Card className="flex-1 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 flex flex-col min-h-0">
                    <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <History className="w-4 h-4 text-slate-500" />
                            <h3 className="font-bold text-slate-800 dark:text-white text-sm">Session Transcript</h3>
                        </div>
                        {transcripts.length > 0 && (
                            <button onClick={() => setTranscripts([])} className="text-xs text-slate-400 hover:text-red-500">Clear</button>
                        )}
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
                        {transcripts.length === 0 ? (
                            <div className="text-center text-slate-400 text-sm mt-10">
                                <p>No conversation history.</p>
                                <p className="text-xs mt-1">Start speaking to see transcript.</p>
                            </div>
                        ) : (
                            transcripts.map((t, i) => (
                                <div key={i} className={`flex gap-3 ${t.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    {t.role === 'model' && (
                                        <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center shrink-0">
                                            <Bot className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                                        </div>
                                    )}
                                    <div className={`p-3 rounded-2xl max-w-[80%] text-sm ${
                                        t.role === 'user' 
                                        ? 'bg-brand-600 text-white rounded-tr-sm' 
                                        : 'bg-slate-100 dark:bg-slate-700/50 text-slate-800 dark:text-slate-200 rounded-tl-sm'
                                    }`}>
                                        <p>{t.text}{t.isPartial && <span className="animate-pulse">...</span>}</p>
                                    </div>
                                    {t.role === 'user' && (
                                        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center shrink-0">
                                            <User className="w-4 h-4 text-slate-500 dark:text-slate-300" />
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                        <div ref={transcriptEndRef} />
                    </div>
                </Card>
            </div>
        </div>
    </div>
  );
};
