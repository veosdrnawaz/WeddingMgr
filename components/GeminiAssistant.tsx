import React, { useState } from 'react';
import { generateInviteText, analyzeBudget } from '../services/geminiService';
import { Sparkles, MessageSquare, Loader2 } from 'lucide-react';

interface GeminiAssistantProps {
    isUrdu: boolean;
}

export const GeminiAssistant: React.FC<GeminiAssistantProps> = ({ isUrdu }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [mode, setMode] = useState<'invite' | 'budget'>('invite');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<string>('');
    
    // Inputs for invite
    const [coupleNames, setCoupleNames] = useState("Sarah & Ahmed");
    const [venue, setVenue] = useState("Pearl Continental, Lahore");
    const [date, setDate] = useState("December 25, 2024");
    const [tone, setTone] = useState<'Formal'|'Casual'|'Poetic'>('Formal');

    const handleGenerate = async () => {
        setLoading(true);
        setResult('');
        if (mode === 'invite') {
            const text = await generateInviteText(coupleNames, venue, date, tone, isUrdu ? 'Urdu' : 'English');
            setResult(text);
        } else {
            const analysis = await analyzeBudget(5000000, 300); // hardcoded for demo
            setResult(analysis);
        }
        setLoading(false);
    };

    if (!isOpen) {
        return (
            <button 
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 bg-gradient-to-r from-brand-600 to-purple-700 text-white p-4 rounded-full shadow-xl hover:shadow-2xl transition-all hover:scale-105 flex items-center gap-2 z-50"
            >
                <Sparkles className="w-5 h-5" />
                <span className="font-medium hidden md:inline">AI Assistant</span>
            </button>
        );
    }

    return (
        <div className="fixed bottom-6 right-6 w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 overflow-hidden flex flex-col animate-slideUp">
            <div className="bg-gradient-to-r from-brand-600 to-purple-700 p-4 flex justify-between items-center text-white">
                <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    <h3 className="font-bold">Wedding AI</h3>
                </div>
                <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white">✕</button>
            </div>
            
            <div className="p-4 flex-1 overflow-y-auto max-h-[60vh]">
                <div className="flex gap-2 mb-4 bg-gray-100 p-1 rounded-lg">
                    <button 
                        onClick={() => setMode('invite')} 
                        className={`flex-1 py-1 px-2 text-sm rounded-md transition-colors ${mode === 'invite' ? 'bg-white shadow text-brand-700' : 'text-gray-500'}`}
                    >
                        Draft Invite
                    </button>
                    <button 
                        onClick={() => setMode('budget')} 
                        className={`flex-1 py-1 px-2 text-sm rounded-md transition-colors ${mode === 'budget' ? 'bg-white shadow text-brand-700' : 'text-gray-500'}`}
                    >
                        Budget Tips
                    </button>
                </div>

                {mode === 'invite' && (
                    <div className="space-y-3">
                        <div>
                            <label className="text-xs font-semibold text-gray-500">Couple Names</label>
                            <input value={coupleNames} onChange={e => setCoupleNames(e.target.value)} className="w-full text-sm border rounded p-2" />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-gray-500">Venue</label>
                            <input value={venue} onChange={e => setVenue(e.target.value)} className="w-full text-sm border rounded p-2" />
                        </div>
                        <div className="flex gap-2">
                            <div className="flex-1">
                                <label className="text-xs font-semibold text-gray-500">Tone</label>
                                <select value={tone} onChange={e => setTone(e.target.value as any)} className="w-full text-sm border rounded p-2">
                                    <option>Formal</option>
                                    <option>Casual</option>
                                    <option>Poetic</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}
                 {mode === 'budget' && (
                     <p className="text-sm text-gray-600 italic mb-4">
                         Click generate to get a standard budget allocation breakdown for a typical Pakistani wedding with 300 guests.
                     </p>
                 )}

                <button 
                    disabled={loading}
                    onClick={handleGenerate}
                    className="w-full mt-4 bg-brand-600 text-white py-2 rounded-lg font-medium hover:bg-brand-700 disabled:opacity-50 flex justify-center items-center gap-2"
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    Generate
                </button>

                {result && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-100 text-sm whitespace-pre-line text-gray-800">
                        {result}
                    </div>
                )}
            </div>
        </div>
    );
};
