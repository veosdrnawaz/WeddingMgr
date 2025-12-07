import React, { useState } from 'react';
import { api } from '../services/api';
import { Heart, Loader2, LogIn, PlusCircle } from 'lucide-react';

interface LandingProps {
    onLogin: (weddingId: string, userName: string) => void;
    isUrdu: boolean;
}

export const Landing: React.FC<LandingProps> = ({ onLogin, isUrdu }) => {
    const [mode, setMode] = useState<'join' | 'create'>('join');
    const [isLoading, setIsLoading] = useState(false);
    
    // Form States
    const [weddingId, setWeddingId] = useState('');
    const [userName, setUserName] = useState('');
    const [coupleName, setCoupleName] = useState('');
    const [error, setError] = useState('');

    const handleJoin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        
        try {
            const res = await api.joinWedding(weddingId);
            if (res.status === 'success') {
                onLogin(weddingId, userName);
            } else {
                setError(isUrdu ? "درست ویڈنگ آئی ڈی نہیں" : "Invalid Wedding ID");
            }
        } catch (err) {
            setError("Connection Error");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const res = await api.createWedding(coupleName);
            if (res.status === 'success' && res.weddingId) {
                onLogin(res.weddingId, "Admin");
            } else {
                setError("Failed to create wedding");
            }
        } catch (err) {
             setError("Connection Error");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-brand-50 to-purple-100 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-fadeIn">
                <div className="bg-brand-600 p-8 text-center text-white">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                        <Heart className="w-8 h-8 text-white" fill="currentColor" />
                    </div>
                    <h1 className={`text-2xl font-bold ${isUrdu ? 'font-urdu' : ''}`}>
                        {isUrdu ? "ویڈنگ منیجر میں خوش آمدید" : "Welcome to Wedding Manager"}
                    </h1>
                    <p className="text-brand-100 mt-2 text-sm">
                        {isUrdu ? "اپنی شادی کی منصوبہ بندی کریں" : "Plan your perfect celebration together"}
                    </p>
                </div>

                <div className="p-8">
                    {/* Tabs */}
                    <div className="flex bg-gray-100 p-1 rounded-xl mb-6">
                        <button 
                            onClick={() => setMode('join')}
                            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                                mode === 'join' ? 'bg-white shadow text-brand-700' : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            {isUrdu ? "شادی میں شامل ہوں" : "Join Wedding"}
                        </button>
                        <button 
                            onClick={() => setMode('create')}
                            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                                mode === 'create' ? 'bg-white shadow text-brand-700' : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            {isUrdu ? "نئی شادی بنائیں" : "Create New"}
                        </button>
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4 text-center">
                            {error}
                        </div>
                    )}

                    {mode === 'join' ? (
                        <form onSubmit={handleJoin} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {isUrdu ? "ویڈنگ آئی ڈی" : "Wedding ID"}
                                </label>
                                <input 
                                    value={weddingId}
                                    onChange={(e) => setWeddingId(e.target.value.toUpperCase())}
                                    placeholder="e.g. W1234"
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none uppercase tracking-widest"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {isUrdu ? "آپ کا نام" : "Your Name"}
                                </label>
                                <input 
                                    value={userName}
                                    onChange={(e) => setUserName(e.target.value)}
                                    placeholder="e.g. Aunt Fatima"
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                                    required
                                />
                            </div>
                            <button 
                                type="submit" 
                                disabled={isLoading}
                                className="w-full bg-brand-600 text-white py-3 rounded-xl font-semibold hover:bg-brand-700 transition-colors flex items-center justify-center gap-2"
                            >
                                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <LogIn className="w-5 h-5" />}
                                {isUrdu ? "لاگ ان کریں" : "Login to Wedding"}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleCreate} className="space-y-4">
                             <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {isUrdu ? "جوڑے کا نام" : "Couple's Names"}
                                </label>
                                <input 
                                    value={coupleName}
                                    onChange={(e) => setCoupleName(e.target.value)}
                                    placeholder="e.g. Ali & Sarah"
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                                    required
                                />
                            </div>
                            <button 
                                type="submit" 
                                disabled={isLoading}
                                className="w-full bg-brand-600 text-white py-3 rounded-xl font-semibold hover:bg-brand-700 transition-colors flex items-center justify-center gap-2"
                            >
                                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <PlusCircle className="w-5 h-5" />}
                                {isUrdu ? "شادی بنائیں" : "Create Wedding ID"}
                            </button>
                            <p className="text-xs text-center text-gray-500 mt-2">
                                {isUrdu ? "آپ کو شیئر کرنے کے لیے ایک ID ملے گا" : "You'll get a unique ID to share with family"}
                            </p>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};
