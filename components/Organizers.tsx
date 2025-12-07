
import React from 'react';
import { Viewer } from '../types';
import { Users, Clock, Shield } from 'lucide-react';

interface OrganizersProps {
    visitors: Viewer[];
    isUrdu: boolean;
}

export const Organizers: React.FC<OrganizersProps> = ({ visitors, isUrdu }) => {
    // Deduplicate visitors by name, keeping the most recent timestamp
    const uniqueVisitors = visitors.reduce((acc, current) => {
        const existingIndex = acc.findIndex(v => v.name.toLowerCase() === current.name.toLowerCase());
        if (existingIndex === -1) {
            acc.push(current);
        } else {
            // Update timestamp if current is newer
            if (new Date(current.timestamp) > new Date(acc[existingIndex].timestamp)) {
                acc[existingIndex] = current;
            }
        }
        return acc;
    }, [] as Viewer[]).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return (
        <div className="space-y-6">
            <div className={`flex flex-col gap-2 ${isUrdu ? 'text-right' : ''}`}>
                <h2 className="text-xl font-bold text-gray-900">
                    {isUrdu ? "شادی کے منتظمین" : "Wedding Organizers & Family"}
                </h2>
                <p className="text-gray-500 text-sm">
                    {isUrdu 
                        ? "ان لوگوں کی فہرست جو اس شادی کے ایونٹ تک رسائی حاصل کر چکے ہیں (مثلاً والد، بھائی، انکل)۔" 
                        : "List of family members and organizers who have logged in to manage this event."}
                </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                    <div className="flex items-center gap-2 text-brand-700 font-semibold">
                        <Users className="w-5 h-5" />
                        <span>{isUrdu ? "فعال اراکین" : "Active Members"} ({uniqueVisitors.length})</span>
                    </div>
                </div>
                
                <div className="divide-y divide-gray-100">
                    {uniqueVisitors.map((visitor, index) => (
                        <div key={index} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-100 to-purple-100 text-brand-700 flex items-center justify-center font-bold text-lg border border-brand-200">
                                    {visitor.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">{visitor.name}</h3>
                                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                                        <Shield className="w-3 h-3 text-green-600" />
                                        <span>{isUrdu ? "منتظم" : "Organizer / Family"}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                    <Clock className="w-3 h-3" />
                                    <span>
                                        {new Date(visitor.timestamp).toLocaleDateString()} {new Date(visitor.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </span>
                                </div>
                                <span className="text-[10px] text-gray-400 mt-1 block">Last Active</span>
                            </div>
                        </div>
                    ))}
                    
                    {uniqueVisitors.length === 0 && (
                        <div className="p-8 text-center text-gray-400">
                            No organizers have logged in yet.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
