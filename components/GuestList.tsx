
import React, { useState, useRef, useEffect } from 'react';
import { Guest, RSVPStatus, MealChoice } from '../types';
import { Plus, Search, Filter, MoreHorizontal, UserCheck, XCircle, ChevronDown, Users, User, Lightbulb, Check, MessageCircle, Loader2, MapPin } from 'lucide-react';
import { generateReminderText } from '../services/geminiService';

interface GuestListProps {
  guests: Guest[];
  onAddGuest: (guest: Guest) => void;
  onUpdateGuest: (id: string, updates: Partial<Guest>) => void;
  isUrdu: boolean;
  weddingId: string;
  currentUserName: string;
}

const VILLAGES = [
  'Attock',
  'Sagri',
  'Nala',
  'Undrela',
  'Madi Jallal'
];

export const GuestList: React.FC<GuestListProps> = ({ guests, onAddGuest, onUpdateGuest, isUrdu, weddingId, currentUserName }) => {
  const [activeTab, setActiveTab] = useState<'Main' | 'Suggestions'>('Main');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [filter, setFilter] = useState<'All' | RSVPStatus>('All');
  const [villageFilter, setVillageFilter] = useState<string>('All');
  const [generatingFor, setGeneratingFor] = useState<string | null>(null);
  
  // Dropdown state
  const [showAddMenu, setShowAddMenu] = useState(false);
  const addMenuRef = useRef<HTMLDivElement>(null);
  const [modalTitle, setModalTitle] = useState("Add Guest");

  // Form default values
  const [formCounts, setFormCounts] = useState({ men: 0, women: 0, children: 0 });

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (addMenuRef.current && !addMenuRef.current.contains(event.target as Node)) {
        setShowAddMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredGuests = guests.filter(g => {
    const isSuggestion = g.rsvpStatus === RSVPStatus.Suggested;
    if (activeTab === 'Main' && isSuggestion) return false;
    if (activeTab === 'Suggestions' && !isSuggestion) return false;

    const matchesSearch = g.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (g.phone && g.phone.includes(searchTerm));
    const matchesFilter = filter === 'All' || g.rsvpStatus === filter;
    const matchesVillage = villageFilter === 'All' || g.village === villageFilter;
    
    // For suggestions tab, ignore the standard RSVP filter usually, but let's keep search
    if (activeTab === 'Suggestions') return matchesSearch;

    return matchesSearch && matchesFilter && matchesVillage;
  });

  const handleStatusToggle = (guest: Guest) => {
      if (guest.rsvpStatus === RSVPStatus.Suggested) {
          // Approve suggestion
          if (confirm(isUrdu ? "کیا آپ اس مہمان کو منظور کرنا چاہتے ہیں؟" : "Approve this guest for invitation?")) {
              onUpdateGuest(guest.id, { rsvpStatus: RSVPStatus.Invited });
          }
          return;
      }

      const nextStatus = guest.rsvpStatus === RSVPStatus.Accepted 
        ? RSVPStatus.Declined 
        : guest.rsvpStatus === RSVPStatus.Declined 
            ? RSVPStatus.Invited 
            : RSVPStatus.Accepted;
      onUpdateGuest(guest.id, { rsvpStatus: nextStatus });
  };

  const handleSendReminder = async (guest: Guest) => {
      setGeneratingFor(guest.id);
      const msg = await generateReminderText(
          guest.fullName, 
          'RSVP', 
          isUrdu ? 'Urdu' : 'English',
          'Wedding Invite'
      );
      setGeneratingFor(null);
      
      const cleanPhone = (guest.phone || '').replace(/\D/g, '');
      const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
      window.open(url, '_blank');
  };

  const openAddModal = (type: 'Single' | 'Couple' | 'Family') => {
      if (type === 'Single') {
          setFormCounts({ men: 1, women: 0, children: 0 });
          setModalTitle(isUrdu ? "ایک فرد شامل کریں" : "Add Single Person");
      } else if (type === 'Couple') {
          setFormCounts({ men: 1, women: 1, children: 0 });
          setModalTitle(isUrdu ? "جوڑا شامل کریں" : "Add Couple");
      } else {
          setFormCounts({ men: 1, women: 1, children: 2 });
          setModalTitle(isUrdu ? "خاندان شامل کریں" : "Add Family");
      }
      setShowAddMenu(false);
      setShowAddModal(true);
  };

  const calculateTotal = () => formCounts.men + formCounts.women + formCounts.children;

  return (
    <div className="space-y-6">
      
      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
            onClick={() => setActiveTab('Main')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'Main' ? 'border-brand-600 text-brand-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
        >
            {isUrdu ? "مدعو مہمان" : "Invited Guests"}
        </button>
        <button
            onClick={() => setActiveTab('Suggestions')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === 'Suggestions' ? 'border-brand-600 text-brand-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
        >
            <Lightbulb className="w-4 h-4" />
            {isUrdu ? "تجاویز" : "Suggestions"}
            <span className="bg-gray-100 px-2 py-0.5 rounded-full text-xs text-gray-600">
                {guests.filter(g => g.rsvpStatus === RSVPStatus.Suggested).length}
            </span>
        </button>
      </div>

      {/* Controls */}
      <div className={`flex flex-col md:flex-row gap-4 justify-between items-center ${isUrdu ? 'flex-row-reverse' : ''}`}>
        <div className="relative w-full md:w-80">
          <Search className={`absolute ${isUrdu ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5`} />
          <input 
            type="text"
            placeholder={isUrdu ? "مہمان تلاش کریں (نام یا فون)..." : "Search guests by name or phone..."}
            className={`w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 ${isUrdu ? 'text-right pr-10 pl-4' : ''}`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex flex-wrap gap-2 w-full md:w-auto relative" ref={addMenuRef}>
            {activeTab === 'Main' && (
                <>
                    <select 
                        value={villageFilter}
                        onChange={(e) => setVillageFilter(e.target.value)}
                        className="px-4 py-2 border border-gray-200 rounded-lg bg-white text-sm focus:ring-2 focus:ring-brand-500"
                    >
                        <option value="All">{isUrdu ? "تمام گاؤں" : "All Villages"}</option>
                        {VILLAGES.map(v => (
                            <option key={v} value={v}>{v}</option>
                        ))}
                    </select>

                    <select 
                        value={filter}
                        onChange={(e) => setFilter(e.target.value as any)}
                        className="px-4 py-2 border border-gray-200 rounded-lg bg-white text-sm focus:ring-2 focus:ring-brand-500"
                    >
                        <option value="All">{isUrdu ? "سب دکھائیں" : "All Status"}</option>
                        <option value={RSVPStatus.Accepted}>{isUrdu ? "قبول شدہ" : "Accepted"}</option>
                        <option value={RSVPStatus.Declined}>{isUrdu ? "مسترد شدہ" : "Declined"}</option>
                        <option value={RSVPStatus.Invited}>{isUrdu ? "مدعو کیا گیا" : "Pending"}</option>
                    </select>
                </>
            )}
            
            <div className="relative ml-auto md:ml-0">
                <button 
                    onClick={() => setShowAddMenu(!showAddMenu)}
                    className="flex items-center gap-2 bg-brand-600 text-white px-4 py-2 rounded-lg hover:bg-brand-700 transition-colors text-sm font-medium"
                >
                    <Plus className="w-4 h-4" />
                    {activeTab === 'Main' 
                        ? (isUrdu ? "مہمان شامل کریں" : "Add Guest") 
                        : (isUrdu ? "تجویز شامل کریں" : "Suggest Guest")
                    }
                    <ChevronDown className="w-3 h-3 ml-1" />
                </button>

                {showAddMenu && (
                    <div className={`absolute top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 z-20 py-1 animate-fadeIn ${isUrdu ? 'left-0' : 'right-0'}`}>
                        <button 
                            onClick={() => openAddModal('Single')}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                        >
                            <User className="w-4 h-4 text-gray-400" />
                            {isUrdu ? "اکیلا فرد" : "Add Single Person"}
                        </button>
                        <button 
                            onClick={() => openAddModal('Couple')}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                        >
                            <Users className="w-4 h-4 text-gray-400" />
                            {isUrdu ? "جوڑا" : "Add Couple"}
                        </button>
                        <button 
                            onClick={() => openAddModal('Family')}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                        >
                            <Users className="w-4 h-4 text-brand-500" />
                            {isUrdu ? "خاندان" : "Add Family"}
                        </button>
                    </div>
                )}
            </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left" dir={isUrdu ? 'rtl' : 'ltr'}>
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className={`px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider ${isUrdu ? 'text-right' : ''}`}>{isUrdu ? "نام" : "Name"}</th>
                <th className={`px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider ${isUrdu ? 'text-right' : ''}`}>{isUrdu ? "گاؤں" : "Village"}</th>
                <th className={`px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider ${isUrdu ? 'text-right' : ''}`}>{isUrdu ? "فون" : "Phone / Description"}</th>
                <th className={`px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider ${isUrdu ? 'text-right' : ''}`}>{isUrdu ? "تفصیل" : "Breakdown"}</th>
                <th className={`px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider ${isUrdu ? 'text-right' : ''}`}>{isUrdu ? "کل" : "Total"}</th>
                <th className={`px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider ${isUrdu ? 'text-right' : ''}`}>{isUrdu ? "اسٹیٹس" : "Status"}</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredGuests.map((guest) => (
                <tr key={guest.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{guest.fullName}</div>
                    <div className="text-xs text-gray-500 inline-flex items-center gap-2">
                        <span className="bg-gray-100 px-2 py-0.5 rounded-full">{guest.relation}</span>
                        {guest.email && <span>{guest.email}</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                      {guest.village ? (
                          <div className="flex items-center gap-1 text-sm text-gray-700">
                              <MapPin className="w-3 h-3 text-gray-400" />
                              {guest.village}
                          </div>
                      ) : (
                          <span className="text-gray-400 text-xs">-</span>
                      )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-700">{guest.phone || "-"}</div>
                    {guest.description && (
                        <div className="text-xs text-gray-500 italic mt-0.5">{guest.description}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                     <div className="flex gap-2">
                         <span title="Men" className="bg-blue-50 text-blue-600 px-1.5 rounded text-xs">M:{guest.menCount || 0}</span>
                         <span title="Women" className="bg-pink-50 text-pink-600 px-1.5 rounded text-xs">W:{guest.womenCount || 0}</span>
                         <span title="Children" className="bg-green-50 text-green-600 px-1.5 rounded text-xs">C:{guest.childrenCount || 0}</span>
                     </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-700">
                      {guest.partySize}
                  </td>

                  <td className="px-6 py-4">
                    <button 
                        onClick={() => handleStatusToggle(guest)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                        guest.rsvpStatus === RSVPStatus.Accepted ? 'bg-green-100 text-green-700' :
                        guest.rsvpStatus === RSVPStatus.Declined ? 'bg-red-100 text-red-700' :
                        guest.rsvpStatus === RSVPStatus.Suggested ? 'bg-purple-100 text-purple-700 hover:bg-purple-200' :
                        'bg-yellow-100 text-yellow-700'
                    }`}>
                        {guest.rsvpStatus === RSVPStatus.Accepted && <UserCheck className="w-3 h-3" />}
                        {guest.rsvpStatus === RSVPStatus.Declined && <XCircle className="w-3 h-3" />}
                        {guest.rsvpStatus === RSVPStatus.Suggested && <Lightbulb className="w-3 h-3" />}
                        {guest.rsvpStatus === RSVPStatus.Suggested ? (isUrdu ? "منظور کریں" : "Approve?") : guest.rsvpStatus}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right flex justify-end gap-2">
                    {(guest.rsvpStatus === RSVPStatus.Invited || guest.rsvpStatus === RSVPStatus.Maybe) && (
                        <button 
                            onClick={() => handleSendReminder(guest)}
                            disabled={generatingFor === guest.id}
                            title="Send WhatsApp Reminder"
                            className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                        >
                            {generatingFor === guest.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <MessageCircle className="w-5 h-5" />}
                        </button>
                    )}
                    <button className="text-gray-400 hover:text-gray-600">
                        <MoreHorizontal className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredGuests.length === 0 && (
            <div className="p-8 text-center text-gray-400">
                {activeTab === 'Main' 
                    ? (isUrdu ? "کوئی مہمان نہیں ملا" : "No invited guests found.") 
                    : (isUrdu ? "کوئی تجویز نہیں ملی" : "No suggestions yet.")
                }
            </div>
        )}
      </div>

      {/* Add Guest Modal */}
      {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl animate-fadeIn overflow-y-auto max-h-[90vh]">
                  <h3 className="text-xl font-bold mb-4">
                      {activeTab === 'Suggestions' 
                        ? (isUrdu ? "تجویز شامل کریں" : "Suggest Guest")
                        : modalTitle
                      }
                  </h3>
                  <form onSubmit={(e) => {
                      e.preventDefault();
                      const formData = new FormData(e.currentTarget);
                      const m = Number(formData.get('menCount'));
                      const w = Number(formData.get('womenCount'));
                      const c = Number(formData.get('childrenCount'));
                      
                      onAddGuest({
                          id: Math.random().toString(36).substr(2, 9),
                          weddingId: weddingId,
                          fullName: formData.get('fullName') as string,
                          email: formData.get('email') as string,
                          phone: formData.get('phone') as string,
                          description: formData.get('description') as string,
                          village: formData.get('village') as string,
                          partySize: m + w + c,
                          menCount: m,
                          womenCount: w,
                          childrenCount: c,
                          relation: formData.get('relation') as any,
                          rsvpStatus: activeTab === 'Suggestions' ? RSVPStatus.Suggested : RSVPStatus.Invited,
                          mealChoice: MealChoice.None,
                          addedBy: currentUserName,
                          checkedIn: false
                      });
                      setShowAddModal(false);
                  }}>
                      <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{isUrdu ? "پورا نام" : "Full Name / Family Name"}</label>
                            <input name="fullName" required type="text" className="w-full border rounded-lg px-3 py-2" placeholder="e.g. Ali Khan" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{isUrdu ? "فون نمبر" : "Phone Number"}</label>
                            <input name="phone" type="tel" className="w-full border rounded-lg px-3 py-2" placeholder="0300-1234567" />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{isUrdu ? "گاؤں / شہر" : "Village/City"}</label>
                                <select name="village" className="w-full border rounded-lg px-3 py-2">
                                    <option value="">Select Village</option>
                                    {VILLAGES.map(v => (
                                        <option key={v} value={v}>{v}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{isUrdu ? "تعلق" : "Relation"}</label>
                                <select name="relation" className="w-full border rounded-lg px-3 py-2">
                                    <option>Family</option>
                                    <option>Friend</option>
                                    <option>Colleague</option>
                                    <option>VIP</option>
                                </select>
                            </div>
                        </div>

                         <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{isUrdu ? "تفصیل" : "Description / Identity"}</label>
                            <input name="description" type="text" className="w-full border rounded-lg px-3 py-2" placeholder="e.g. Groom's Friend from College" />
                        </div>
                        
                        <div className="border-t border-gray-100 pt-3">
                            <label className="block text-sm font-medium text-gray-700 mb-2">{isUrdu ? "مہمانوں کی تعداد" : "Guest Count Breakdown"}</label>
                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className="text-xs text-gray-500">Men</label>
                                    <input 
                                        name="menCount" 
                                        type="number" 
                                        min="0" 
                                        value={formCounts.men}
                                        onChange={e => setFormCounts(p => ({...p, men: Number(e.target.value)}))}
                                        className="w-full border rounded-lg px-2 py-2 text-center" 
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500">Women</label>
                                    <input 
                                        name="womenCount" 
                                        type="number" 
                                        min="0" 
                                        value={formCounts.women}
                                        onChange={e => setFormCounts(p => ({...p, women: Number(e.target.value)}))}
                                        className="w-full border rounded-lg px-2 py-2 text-center" 
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500">Kids</label>
                                    <input 
                                        name="childrenCount" 
                                        type="number" 
                                        min="0" 
                                        value={formCounts.children}
                                        onChange={e => setFormCounts(p => ({...p, children: Number(e.target.value)}))}
                                        className="w-full border rounded-lg px-2 py-2 text-center" 
                                    />
                                </div>
                            </div>
                            <div className="text-right mt-1 text-sm font-bold text-gray-700">
                                Total: {calculateTotal()}
                            </div>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email (Optional)</label>
                            <input name="email" type="email" className="w-full border rounded-lg px-3 py-2" />
                        </div>
                        
                        {activeTab === 'Suggestions' && (
                             <div className="bg-blue-50 p-3 rounded-lg text-xs text-blue-700 mt-2">
                                This guest will be added to the <strong>Suggestions</strong> list for review.
                             </div>
                        )}
                      </div>
                      <div className="mt-6 flex gap-3 justify-end">
                          <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                              {isUrdu ? "منسوخ کریں" : "Cancel"}
                          </button>
                          <button type="submit" className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700">
                              {isUrdu ? "شامل کریں" : "Save Guest"}
                          </button>
                      </div>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
};