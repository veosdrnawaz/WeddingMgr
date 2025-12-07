
import React, { useState } from 'react';
import { Guest, Table } from '../types';
import { GripVertical, PlusCircle, X, Circle, Square } from 'lucide-react';

interface SeatingPlannerProps {
    guests: Guest[];
    tables: Table[];
    onAssignSeat: (guestId: string, tableId: string | undefined) => void;
    onAddTable: (table: Table) => void;
    isUrdu: boolean;
}

export const SeatingPlanner: React.FC<SeatingPlannerProps> = ({ guests, tables, onAssignSeat, onAddTable, isUrdu }) => {
    const [selectedGuestId, setSelectedGuestId] = useState<string | null>(null);
    const [showAddTable, setShowAddTable] = useState(false);

    const unseatedGuests = guests.filter(g => !g.tableId);
    
    // Group guests by table
    const guestsByTable: Record<string, Guest[]> = {};
    tables.forEach(t => {
        guestsByTable[t.id] = guests.filter(g => g.tableId === t.id);
    });

    const handleGuestClick = (guestId: string) => {
        if (selectedGuestId === guestId) {
            setSelectedGuestId(null);
        } else {
            setSelectedGuestId(guestId);
        }
    };

    const handleTableClick = (tableId: string) => {
        if (selectedGuestId) {
            onAssignSeat(selectedGuestId, tableId);
            setSelectedGuestId(null);
        }
    };

    const handleRemoveSeat = (guestId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        onAssignSeat(guestId, undefined);
    };

    return (
        <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-140px)]">
            {/* Unseated Sidebar */}
            <div className="lg:w-80 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col max-h-[30vh] lg:max-h-full">
                <div className="p-4 border-b border-gray-100 bg-gray-50 rounded-t-xl sticky top-0">
                    <h3 className={`font-semibold text-gray-700 ${isUrdu ? 'font-urdu text-right' : ''}`}>
                        {isUrdu ? "بیٹھے نہیں" : "Unseated Guests"} ({unseatedGuests.length})
                    </h3>
                    {selectedGuestId && (
                        <div className="mt-2 text-xs bg-brand-50 text-brand-700 px-2 py-1 rounded border border-brand-100">
                            {isUrdu ? "ٹیبل منتخب کریں" : "Select a table to assign"}
                        </div>
                    )}
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                    {unseatedGuests.map(guest => (
                        <div 
                            key={guest.id}
                            onClick={() => handleGuestClick(guest.id)}
                            className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center gap-3
                                ${selectedGuestId === guest.id 
                                    ? 'border-brand-500 bg-brand-50 ring-1 ring-brand-500' 
                                    : 'border-gray-100 hover:border-brand-300 hover:bg-gray-50'
                                }`}
                        >
                            <GripVertical className="w-4 h-4 text-gray-300" />
                            <div>
                                <p className="text-sm font-medium text-gray-900">{guest.fullName}</p>
                                <p className="text-xs text-gray-500">{guest.partySize} {isUrdu ? "سیٹیں" : "seats"}</p>
                            </div>
                        </div>
                    ))}
                    {unseatedGuests.length === 0 && (
                        <div className="p-4 text-center text-sm text-gray-400 italic">
                            All guests assigned!
                        </div>
                    )}
                </div>
            </div>

            {/* Tables Canvas */}
            <div className="flex-1 bg-gray-100 rounded-xl border border-gray-200 p-4 md:p-6 overflow-y-auto relative">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 pb-20">
                    {tables.map(table => {
                        const seated = guestsByTable[table.id] || [];
                        const currentOccupancy = seated.reduce((acc, g) => acc + g.partySize, 0);
                        const isFull = currentOccupancy >= table.capacity;
                        const isNearFull = currentOccupancy >= table.capacity * 0.8;
                        const isRound = table.shape === 'Round';
                        
                        // Visual Styles based on shape and status
                        const statusColor = isFull ? 'bg-red-50 border-red-200' : isNearFull ? 'bg-yellow-50 border-yellow-200' : 'bg-white border-transparent';
                        const badgeColor = isFull ? 'bg-red-100 text-red-700' : isNearFull ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-700';
                        
                        // Round tables get distinct rounded corners and centered layout
                        const shapeClasses = isRound 
                            ? 'rounded-[3rem] px-6 text-center' 
                            : 'rounded-lg px-4';

                        return (
                            <div 
                                key={table.id}
                                onClick={() => handleTableClick(table.id)}
                                className={`${statusColor} ${shapeClasses} shadow-sm py-4 border-2 transition-all cursor-pointer min-h-[220px] flex flex-col relative
                                    ${selectedGuestId 
                                        ? 'border-dashed border-brand-300 hover:border-brand-500 hover:bg-brand-50' 
                                        : 'hover:shadow-md'
                                    }`}
                            >
                                <div className={`flex items-center mb-4 pb-2 border-b border-gray-100/50 ${isRound ? 'justify-center flex-col gap-2' : 'justify-between'}`}>
                                    <div className="flex items-center gap-2">
                                        {isRound ? <Circle className="w-4 h-4 text-gray-400"/> : <Square className="w-4 h-4 text-gray-400"/>}
                                        <h4 className="font-bold text-gray-800">{table.name}</h4>
                                    </div>
                                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${badgeColor}`}>
                                        {currentOccupancy}/{table.capacity}
                                    </span>
                                </div>
                                
                                {/* Seats Visualization */}
                                <div className={`flex-1 flex flex-wrap content-start gap-2 ${isRound ? 'justify-center' : ''}`}>
                                    {seated.map(guest => (
                                        <div key={guest.id} className="relative group max-w-full">
                                            <div className="flex items-center gap-2 p-2 bg-white/60 rounded-md border border-gray-200/50 text-sm backdrop-blur-sm shadow-sm hover:bg-white hover:shadow-md transition-all">
                                                <div className="w-2 h-2 rounded-full bg-brand-400 shrink-0"></div>
                                                <div className="text-left leading-tight">
                                                    <div className="truncate max-w-[100px] font-medium">{guest.fullName}</div>
                                                    <span className="text-[10px] text-gray-500">({guest.partySize})</span>
                                                </div>
                                            </div>
                                            <button 
                                                onClick={(e) => handleRemoveSeat(guest.id, e)}
                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))}
                                    {seated.length === 0 && (
                                        <div className="w-full flex items-center justify-center text-gray-300 text-sm italic py-4">
                                            Empty Table
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                    
                    {/* Add Table Button */}
                    <button 
                        onClick={() => setShowAddTable(true)}
                        className="border-2 border-dashed border-gray-300 rounded-2xl p-4 flex flex-col items-center justify-center text-gray-400 hover:border-brand-400 hover:text-brand-500 hover:bg-white transition-all min-h-[220px]"
                    >
                        <PlusCircle className="w-8 h-8 mb-2" />
                        <span>Add Table</span>
                    </button>
                </div>
            </div>

            {/* Add Table Modal */}
            {showAddTable && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl w-full max-w-sm p-6 shadow-2xl animate-fadeIn">
                        <h3 className="text-xl font-bold mb-4">{isUrdu ? "نئی میز" : "Add New Table"}</h3>
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            const formData = new FormData(e.currentTarget);
                            onAddTable({
                                id: Math.random().toString(36).substr(2, 9),
                                weddingId: '', // Handled by API wrapper
                                name: formData.get('name') as string,
                                capacity: Number(formData.get('capacity')),
                                shape: formData.get('shape') as any
                            });
                            setShowAddTable(false);
                        }}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Table Name</label>
                                    <input name="name" required placeholder="e.g. Table 15" className="w-full border rounded-lg px-3 py-2" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
                                    <input name="capacity" type="number" min="2" max="20" defaultValue="8" className="w-full border rounded-lg px-3 py-2" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Shape</label>
                                    <div className="flex gap-4 mt-2">
                                        <label className="flex items-center gap-2 cursor-pointer bg-gray-50 p-2 rounded-lg border border-gray-200 hover:border-brand-500 transition-colors flex-1 justify-center">
                                            <input type="radio" name="shape" value="Round" defaultChecked className="text-brand-600 focus:ring-brand-500" />
                                            <Circle className="w-4 h-4 text-gray-500" />
                                            <span className="text-sm">Round</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer bg-gray-50 p-2 rounded-lg border border-gray-200 hover:border-brand-500 transition-colors flex-1 justify-center">
                                            <input type="radio" name="shape" value="Rectangular" className="text-brand-600 focus:ring-brand-500" />
                                            <Square className="w-4 h-4 text-gray-500" />
                                            <span className="text-sm">Square/Rect</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-6 flex justify-end gap-3">
                                <button type="button" onClick={() => setShowAddTable(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700">Add Table</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
