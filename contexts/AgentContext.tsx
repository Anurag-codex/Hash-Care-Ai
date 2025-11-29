
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { AgentThought, AgentAction, UserRole, MedicalDocument, MedicalMemory } from '../types';
import { useNotification } from './NotificationContext';
import { analyzeMedicalImage, analyzeMedicalText } from '../services/geminiService';

interface AgentContextType {
  thoughts: AgentThought[];
  actions: AgentAction[];
  isThinking: boolean;
  activeAgents: string[]; // List of active modules (e.g., "Biometric Guardian")
  
  // Medical Intelligence State
  documents: MedicalDocument[];
  medicalMemory: MedicalMemory[];
  processDocument: (file: File) => Promise<void>;
  processTranscript: (text: string) => Promise<void>;

  // Methods
  addThought: (text: string, category: AgentThought['category']) => void;
  executeAction: (id: string) => void;
  rejectAction: (id: string) => void;
  triggerScenario: (type: 'HighHR' | 'LowStock' | 'StaffBurnout' | 'SOS') => void;
  generateDailyReport: () => DailyReportData;
}

export interface DailyReportData {
    summary: string;
    score: number;
    metrics: {
        sleep: { duration: string; quality: string; deepSleep: string };
        heart: { avgBpm: number; hrv: number; status: string };
        activity: { steps: number; calories: number; status: string };
    };
    insights: string[];
    actionPlan: string[];
}

const AgentContext = createContext<AgentContextType | undefined>(undefined);

export const AgentProvider: React.FC<{ children: React.ReactNode; userRole: UserRole }> = ({ children, userRole }) => {
  const [thoughts, setThoughts] = useState<AgentThought[]>([]);
  const [actions, setActions] = useState<AgentAction[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [activeAgents, setActiveAgents] = useState<string[]>([]);
  
  // Medical Intel State
  const [documents, setDocuments] = useState<MedicalDocument[]>([]);
  const [medicalMemory, setMedicalMemory] = useState<MedicalMemory[]>([]);

  const { addNotification } = useNotification();

  // Initialize Agents based on Role
  useEffect(() => {
    if (userRole === 'patient') {
        setActiveAgents(['Neural-Link', 'Bio-Metric Core', 'Medical Document Handler', 'Doctor Memory Agent']);
    } else {
        setActiveAgents(['Resource Orchestrator', 'Triage Algorithm', 'Supply-Chain Neural Net']);
    }
  }, [userRole]);

  const addThought = (text: string, category: AgentThought['category']) => {
    const newThought: AgentThought = {
        id: Date.now().toString(),
        timestamp: new Date(),
        category,
        text,
        confidence: 85 + Math.random() * 15,
        status: 'thinking'
    };
    setThoughts(prev => [newThought, ...prev].slice(0, 10)); // Keep last 10
    setIsThinking(true);
    setTimeout(() => setIsThinking(false), 2000);
  };

  const addAction = (title: string, description: string, type: AgentAction['type'], autoExecuteIn?: number) => {
      const newAction: AgentAction = {
          id: Date.now().toString(),
          title,
          description,
          type,
          status: 'pending',
          timestamp: new Date(),
          autoExecuteIn
      };
      setActions(prev => [newAction, ...prev]);
  };

  const executeAction = (id: string) => {
      setActions(prev => prev.map(a => a.id === id ? { ...a, status: 'executed' } : a));
      const action = actions.find(a => a.id === id);
      addThought(`EXECUTING PROTOCOL: ${action?.title}`, 'Logistics');
      if (action) {
          addNotification('success', 'Protocol Executed', `${action.title} has been initiated successfully.`);
      }
  };

  const rejectAction = (id: string) => {
      setActions(prev => prev.map(a => a.id === id ? { ...a, status: 'rejected' } : a));
  };

  // --- MEDICAL DOCUMENT PROCESSING ---
  const processDocument = async (file: File) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
          const base64 = reader.result as string;
          const base64Data = base64.split(',')[1]; // Remove header

          const newDoc: MedicalDocument = {
              id: Date.now().toString(),
              name: file.name,
              type: 'other',
              dateUploaded: new Date().toISOString(),
              status: 'analyzing',
              content: base64,
              tags: [],
              abnormalities: []
          };
          setDocuments(prev => [newDoc, ...prev]);
          addThought(`Ingesting document: ${file.name}. Initializing Vision Core...`, 'Medical_Intel');

          // Call Real Agent Service
          try {
              const analysis = await analyzeMedicalImage(base64Data);
              
              if (analysis.error) throw new Error(analysis.error);

              // Update Document State
              setDocuments(prev => prev.map(d => d.id === newDoc.id ? {
                  ...d,
                  status: 'processed',
                  type: analysis.docType || 'other',
                  summary: analysis.summary,
                  abnormalities: analysis.abnormalities || [],
                  tags: analysis.docType ? [analysis.docType] : []
              } : d));

              // Update Memory & Actions
              if (analysis.actionItems) {
                  analysis.actionItems.forEach((item: any) => {
                      // Add to Memory
                      const memory: MedicalMemory = {
                          id: Date.now().toString() + Math.random(),
                          sourceDocId: newDoc.id,
                          date: new Date().toISOString(),
                          type: item.type === 'medication' ? 'medication' : 'instruction',
                          detail: item.detail,
                          status: 'active',
                          confidence: 90
                      };
                      setMedicalMemory(prev => [memory, ...prev]);

                      // Trigger Action if High Priority
                      if (item.priority === 'high') {
                          addAction(
                              `New ${item.type} Detected`, 
                              `From ${file.name}: ${item.detail}`, 
                              'intervention'
                          );
                          addNotification('warning', 'Action Required', item.detail);
                      }
                  });
              }

              if (analysis.abnormalities && analysis.abnormalities.length > 0) {
                  addThought(`DETECTED ABNORMALITY: ${analysis.abnormalities[0]}`, 'Health');
                  addNotification('critical', 'Medical Alert', `Abnormality detected in ${file.name}: ${analysis.abnormalities[0]}`);
              } else {
                  addThought(`Document ${file.name} processed. No critical flags.`, 'Medical_Intel');
              }

          } catch (e) {
              console.error(e);
              setDocuments(prev => prev.map(d => d.id === newDoc.id ? { ...d, status: 'error' } : d));
              addThought(`Analysis Failed for ${file.name}.`, 'Medical_Intel');
          }
      };
  };

  const processTranscript = async (text: string) => {
      addThought("Parsing conversation transcript for medical directives...", 'Medical_Intel');
      try {
          const result = await analyzeMedicalText(text);
          
          if (result.insights) {
              result.insights.forEach((insight: any) => {
                  setMedicalMemory(prev => [{
                      id: Date.now().toString() + Math.random(),
                      date: new Date().toISOString(),
                      type: insight.type,
                      detail: insight.text,
                      status: 'active',
                      confidence: insight.confidence
                  }, ...prev]);
              });
              addThought(`Extracted ${result.insights.length} actionable items from conversation.`, 'Medical_Intel');
          }

          if (result.missedActions && result.missedActions.length > 0) {
              addNotification('warning', 'Gap Detected', `You may have missed: ${result.missedActions[0]}`);
              addAction('Missed Follow-up', result.missedActions[0], 'suggestion');
          }

      } catch (e) {
          console.error(e);
      }
  };

  const generateDailyReport = (): DailyReportData => {
      return {
          summary: "Patient vitals have remained within optimal baselines for 96% of the monitoring period. A slight deviation in HRV was detected post-exercise but normalized rapidly. Sleep architecture shows improvement in REM cycles.",
          score: 88,
          metrics: {
              sleep: { duration: "7h 20m", quality: "Good", deepSleep: "1h 45m" },
              heart: { avgBpm: 68, hrv: 42, status: "Optimal" },
              activity: { steps: 8432, calories: 2150, status: "On Target" }
          },
          insights: [
              "Hydration levels correlated positively with afternoon energy peaks.",
              "Stress markers (cortisol inference) spiked at 14:00 but were managed effectively.",
              "Deep sleep duration increased by 12% compared to weekly average."
          ],
          actionPlan: [
              "Increase water intake by 250ml before 12:00 PM.",
              "Maintain bed-time routine to solidify sleep consistency.",
              "Scheduled low-intensity cardio recommended for tomorrow."
          ]
      };
  };

  // --- Background "Reasoning" Loop ---
  useEffect(() => {
    const interval = setInterval(() => {
        // Random background thoughts to show "aliveness"
        if (Math.random() > 0.6) {
            if (userRole === 'patient') {
                const topics = [
                    { text: "Correlating HRV with circadian rhythm baseline...", cat: 'Health' },
                    { text: "Analyzing ambient particulate matter (PM2.5)... Safe.", cat: 'Environment' },
                    { text: "Verifying pharmacological adherence log... 100%.", cat: 'Logistics' },
                    { text: "Optimizing homeostatic environmental controls.", cat: 'Environment' },
                    { text: "Scanning Document Queue for unprocessed items...", cat: 'Medical_Intel' },
                    { text: "Cross-referencing Dr. Smith's last instructions with current vitals...", cat: 'Medical_Intel' }
                ];
                const topic = topics[Math.floor(Math.random() * topics.length)];
                addThought(topic.text, topic.cat as any);
            } else {
                // ... admin thoughts
                const topics = [
                    { text: "Forecasting ER patient influx vs Staff Capacity...", cat: 'Resource' },
                    { text: "Analyzing bed turnover efficiency metrics... 92%.", cat: 'Resource' },
                    { text: "Scanning workforce fatigue indicators... Green.", cat: 'Health' }
                ];
                const topic = topics[Math.floor(Math.random() * topics.length)];
                addThought(topic.text, topic.cat as any);
            }
        }
    }, 6000); // Slightly faster thinking

    return () => clearInterval(interval);
  }, [userRole]);

  // --- Scenario Triggers for Demo Purposes ---
  const triggerScenario = (type: 'HighHR' | 'LowStock' | 'StaffBurnout' | 'SOS') => {
      switch (type) {
          case 'HighHR':
              addNotification('critical', 'High Heart Rate Alert', 'Patient HR exceeds 110bpm at rest. Interventional protocol recommended.', 8000);
              addThought("ALERT: Tachycardia event detected (>110 bpm) at rest.", 'Health');
              setTimeout(() => {
                  addThought("Context Analysis: No physical exertion. Cortisol markers inferred.", 'Health');
                  addAction("Stress Intervention Protocol", "Dimming ambient lights. Queuing guided breathing exercise. Monitoring for escalation.", 'intervention', 300);
              }, 1500);
              break;
          case 'LowStock':
              addNotification('warning', 'Supply Chain Warning', 'Metformin inventory critical. Auto-restock advised.', 6000);
              addThought("SUPPLY CHAIN EVENT: 'Metformin' inventory below safety threshold.", 'Logistics');
              setTimeout(() => {
                  addThought("Querying vendor database... Apollo Pharmacy offers best rate.", 'Logistics');
                  addAction("Auto-Procurement Order", "Execute purchase order #8821 for 30-day supply. Cost: ₹140.", 'automation');
              }, 1500);
              break;
          case 'StaffBurnout':
              addNotification('error', 'Workforce Alert', 'Nurse Priya fatigue index > 85%. Shift rotation required.', 7000);
              addThought("WORKFORCE SAFETY: Nurse Priya exceeded 12h duty cycle.", 'Resource');
              setTimeout(() => {
                  addThought("Resource Re-allocation: Nurse Raj is available in Ward B.", 'Resource');
                  addAction("Shift Rotation Mandate", "Assign Nurse Raj to relieve Nurse Priya immediately to prevent fatigue error.", 'suggestion');
              }, 1500);
              break;
          case 'SOS':
              addNotification('critical', 'SOS BEACON DETECTED', 'Emergency Protocols Activated. EMS Dispatching.', 10000);
              addThought("CRITICAL EVENT: SOS Beacon Triangulated.", 'Security');
              setTimeout(() => addThought("Broadcasting encrypted location packet to EMS...", 'Security'), 500);
              setTimeout(() => addThought("Overriding Smart Lock: [Front_Main] -> UNLOCKED.", 'Security'), 1000);
              setTimeout(() => addAction("Emergency Response Coordination", "EMS Dispatched. Medical Profile Transmitted. Family Alerted.", 'intervention'), 2000);
              break;
      }
  };

  return (
    <AgentContext.Provider value={{ thoughts, actions, isThinking, activeAgents, documents, medicalMemory, processDocument, processTranscript, addThought, executeAction, rejectAction, triggerScenario, generateDailyReport }}>
      {children}
    </AgentContext.Provider>
  );
};

export const useAgent = () => {
  const context = useContext(AgentContext);
  if (context === undefined) {
    throw new Error('useAgent must be used within an AgentProvider');
  }
  return context;
};
