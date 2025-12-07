import React, { useState } from 'react';
import { Guest, Table } from '../types';
import { Search, QrCode, CheckCircle, XCircle, User, Utensils, Info, MapPin } from 'lucide-react';

interface CheckInProps {
  guests: Guest[];
  tables: Table[];
  onCheckIn: (guestId: string, status: boolean) => void;
  isUrdu: boolean;
}

export const CheckIn: React.FC<CheckInProps> = ({ guests, tables, onCheckIn, isUrdu }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);

  // Filter only accepted or maybe guests for check-in usually, but let's show all just in case
  const filteredGuests = guests.filter(g => 
    g.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTable = (guest: Guest) => tables.find(t => t.id === guest.tableId);

  const handleScanClick = () => {
    setIsScanning(true);
    // Simulate finding a guest after 2 seconds
    setTimeout(() => {
        setIsScanning(false);
        const randomGuest = guests[Math.floor(Math.random() * guests.length)];
        setSearchTerm(randomGuest.fullName);
        setSelectedGuest(randomGuest);
    }, 2000);
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header Actions */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className={`absolute ${isUrdu ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5`} />
          <input 
            type="text"
            placeholder={isUrdu ? "مہمان تلاش کریں..." : "Search guest name..."}
            className={`w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500 ${isUrdu ? 'text-right pr-10 pl-4' : ''}`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button 
            onClick={handleScanClick}
            className="bg-gray-900 text-white p-3 rounded-xl shadow-sm hover:bg-gray-800 transition-colors flex items-center justify-center w-12 flex-shrink-0"
        >
            <QrCode className="w-6 h-6" />
        </button>
      </div>

      {/* Camera Simulator Overlay */}
      {isScanning && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center">
            <div className="relative w-64 h-64 border-4 border-green-500 rounded-lg overflow-hidden mb-8">
                <div className="absolute inset-0 bg-green-500/20 animate-pulse"></div>
                <div className="absolute top-0 left-0 w-full h-1 bg-green-500 shadow-[0_0_20px_rgba(34,197,94,1)] animate-[scan_2s_ease-in-out_infinite]"></div>
            </div>
            <p className="text-white text-lg font-medium animate-pulse">Scanning QR Code...</p>
            <button 
                onClick={() => setIsScanning(false)}
                className="mt-8 px-6 py-2 bg-white/20 text-white rounded-full hover:bg-white/30"
            >
                Cancel
            </button>
            <style>{`
                @keyframes scan {
                    0% { top: 0; }
                    50% { top: 100%; }
                    100% { top: 0; }
                }
            `}</style>
        </div>
      )}

      {/* Stats Summary */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm text-center">
            <div className="text-2xl font-bold text-brand-600">
                {guests.filter(g => g.checkedIn).length}
            </div>
            <div className="text-xs text-gray-500 uppercase tracking-wide">{isUrdu ? "چیک ان" : "Checked In"}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm text-center">
            <div className="text-2xl font-bold text-gray-400">
                {guests.length - guests.filter(g => g.checkedIn).length}
            </div>
            <div className="text-xs text-gray-500 uppercase tracking-wide">{isUrdu ? "باقی" : "Pending"}</div>
        </div>
      </div>

      {/* Guest List */}
      <div className="space-y-3">
        {filteredGuests.map(guest => {
            const table = getTable(guest);
            return (
                <div 
                    key={guest.id} 
                    className={`bg-white p-4 rounded-xl border transition-all ${
                        guest.checkedIn 
                        ? 'border-green-200 bg-green-50/50' 
                        : 'border-gray-100 shadow-sm hover:border-brand-200'
                    }`}
                >
                    <div className="flex items-center justify-between">
                        <div onClick={() => setSelectedGuest(guest)} className="cursor-pointer flex-1">
                            <div className="flex items-center gap-2">
                                <h3 className={`font-semibold text-lg ${guest.checkedIn ? 'text-green-800' : 'text-gray-900'}`}>
                                    {guest.fullName}
                                </h3>
                                {guest.relation === 'VIP' && (
                                    <span className="bg-yellow-100 text-yellow-800 text-[10px] font-bold px-2 py-0.5 rounded-full">VIP</span>
                                )}
                            </div>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-gray-500">
                                <span className="flex items-center gap-1">
                                    <User className="w-3 h-3" /> {guest.partySize} guests
                                </span>
                                {table && (
                                    <span className="flex items-center gap-1 text-brand-600 font-medium">
                                        <MapPin className="w-3 h-3" /> {table.name}
                                    </span>
                                )}
                            </div>
                        </div>

                        <button
                            onClick={() => onCheckIn(guest.id, !guest.checkedIn)}
                            className={`p-3 rounded-full transition-all ${
                                guest.checkedIn 
                                ? 'bg-green-500 text-white shadow-green-200' 
                                : 'bg-gray-100 text-gray-300 hover:bg-gray-200'
                            }`}
                        >
                            {guest.checkedIn ? <CheckCircle className="w-6 h-6" /> : <div className="w-6 h-6 border-2 border-gray-300 rounded-full" />}
                        </button>
                    </div>
                </div>
            );
        })}
      </div>

      {/* Detail Modal */}
      {selectedGuest && (
        <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4" onClick={() => setSelectedGuest(null)}>
            <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-start mb-4">
                    <h2 className="text-2xl font-bold">{selectedGuest.fullName}</h2>
                    <button onClick={() => setSelectedGuest(null)}><XCircle className="text-gray-400" /></button>
                </div>
                
                <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="bg-white p-2 rounded-full shadow-sm"><User className="w-5 h-5 text-brand-500" /></div>
                        <div>
                            <p className="text-xs text-gray-400 uppercase">Party Size</p>
                            <p className="font-semibold">{selectedGuest.partySize} Persons</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="bg-white p-2 rounded-full shadow-sm"><Utensils className="w-5 h-5 text-orange-500" /></div>
                        <div>
                            <p className="text-xs text-gray-400 uppercase">Meal Preference</p>
                            <p className="font-semibold">{selectedGuest.mealChoice}</p>
                            {selectedGuest.dietaryNotes && (
                                <p className="text-xs text-red-500 mt-1">⚠️ {selectedGuest.dietaryNotes}</p>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="bg-white p-2 rounded-full shadow-sm"><MapPin className="w-5 h-5 text-blue-500" /></div>
                        <div>
                            <p className="text-xs text-gray-400 uppercase">Seating</p>
                            <p className="font-semibold">{getTable(selectedGuest)?.name || "Unassigned"}</p>
                        </div>
                    </div>
                    
                    {selectedGuest.notes && (
                         <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-100">
                            <Info className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
                            <p className="text-sm text-yellow-800">{selectedGuest.notes}</p>
                        </div>
                    )}

                    <button 
                        onClick={() => {
                            onCheckIn(selectedGuest.id, !selectedGuest.checkedIn);
                            setSelectedGuest(null);
                        }}
                        className={`w-full py-3 rounded-xl font-bold text-white transition-colors ${
                            selectedGuest.checkedIn ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
                        }`}
                    >
                        {selectedGuest.checkedIn ? "Undo Check-in" : "Check In Guest"}
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};