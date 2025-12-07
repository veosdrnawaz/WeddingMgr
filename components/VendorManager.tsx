import React, { useState } from 'react';
import { Vendor } from '../types';
import { Plus, Phone, Mail, FileText, DollarSign, Calendar, Bell, Trash2, MessageCircle, Send, Loader2 } from 'lucide-react';
import { generateReminderText } from '../services/geminiService';

interface VendorManagerProps {
    vendors: Vendor[];
    onAddVendor: (vendor: Vendor) => void;
    onUpdateVendor: (id: string, updates: Partial<Vendor>) => void;
    onDeleteVendor: (id: string) => void;
    isUrdu: boolean;
    weddingId: string;
}

export const VendorManager: React.FC<VendorManagerProps> = ({ vendors, onAddVendor, onUpdateVendor, onDeleteVendor, isUrdu, weddingId }) => {
    const [showAddModal, setShowAddModal] = useState(false);
    
    // Reminder Modal State
    const [reminderVendor, setReminderVendor] = useState<Vendor | null>(null);
    const [reminderMessage, setReminderMessage] = useState('');
    const [reminderMethod, setReminderMethod] = useState<'WhatsApp' | 'SMS' | 'Email'>('WhatsApp');
    const [isGenerating, setIsGenerating] = useState(false);

    const openReminderModal = async (vendor: Vendor) => {
        setReminderVendor(vendor);
        setReminderMessage('');
        setIsGenerating(true);
        // Auto-generate initial message
        const text = await generateReminderText(
            vendor.contactName || vendor.name,
            'Payment',
            isUrdu ? 'Urdu' : 'English',
            `Balance due: PKR ${(vendor.cost - vendor.paid).toLocaleString()}, Due Date: ${vendor.dueDate}`
        );
        setReminderMessage(text);
        setIsGenerating(false);
    };

    const handleSendReminder = () => {
        if (!reminderVendor) return;

        const encodedMsg = encodeURIComponent(reminderMessage);
        let url = '';

        if (reminderMethod === 'WhatsApp') {
            // Remove non-digits from phone for the URL
            const cleanPhone = (reminderVendor.phone || '').replace(/\D/g, '');
            url = `https://wa.me/${cleanPhone}?text=${encodedMsg}`;
        } else if (reminderMethod === 'SMS') {
             // Basic SMS link (functionality varies by device)
             url = `sms:${reminderVendor.phone}?body=${encodedMsg}`;
        } else {
            url = `mailto:${reminderVendor.email}?subject=Payment Reminder: ${reminderVendor.name}&body=${encodedMsg}`;
        }

        window.open(url, '_blank');
        setReminderVendor(null);
    };

    return (
        <div className="space-y-6">
            <div className={`flex justify-between items-center ${isUrdu ? 'flex-row-reverse' : ''}`}>
                <h2 className="text-lg font-semibold text-gray-700">{isUrdu ? "آپ کے وینڈرز" : "Your Vendors"}</h2>
                <button 
                    onClick={() => setShowAddModal(true)}
                    className="bg-brand-600 text-white px-4 py-2 rounded-lg hover:bg-brand-700 flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    {isUrdu ? "وینڈر شامل کریں" : "Add Vendor"}
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {vendors.map(vendor => (
                    <div key={vendor.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all">
                        <div className="p-5">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600 mb-2">
                                        {vendor.category}
                                    </span>
                                    <h3 className="font-bold text-lg text-gray-900">{vendor.name}</h3>
                                </div>
                                <div className={`px-2 py-1 rounded text-xs font-bold ${
                                    vendor.status === 'Paid' ? 'bg-green-100 text-green-700' : 
                                    vendor.status === 'Signed' ? 'bg-blue-100 text-blue-700' : 
                                    'bg-gray-100 text-gray-600'
                                }`}>
                                    {vendor.status}
                                </div>
                            </div>

                            <div className="space-y-3 text-sm text-gray-600">
                                <div className="flex items-center gap-2">
                                    <UserAvatar name={vendor.contactName || vendor.name} />
                                    <span>{vendor.contactName || "No contact"}</span>
                                </div>
                                {(vendor.phone || vendor.email) && (
                                    <div className="flex gap-3 pl-1">
                                        {vendor.phone && <Phone className="w-4 h-4 text-gray-400" />}
                                        {vendor.email && <Mail className="w-4 h-4 text-gray-400" />}
                                    </div>
                                )}
                            </div>

                            <div className="mt-6 pt-4 border-t border-gray-50 space-y-3">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-500">Total Cost</span>
                                    <span className="font-semibold">PKR {vendor.cost.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-500">Paid</span>
                                    <span className="text-green-600 font-medium">PKR {vendor.paid.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-500">Balance</span>
                                    <span className="text-red-600 font-bold">PKR {(vendor.cost - vendor.paid).toLocaleString()}</span>
                                </div>
                                
                                <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
                                    <div 
                                        className="bg-brand-500 h-1.5 rounded-full" 
                                        style={{ width: `${Math.min((vendor.paid / vendor.cost) * 100, 100)}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 px-5 py-3 border-t border-gray-100 flex justify-between items-center">
                            <div className="flex gap-2">
                                <button title="View Contract" className="p-2 hover:bg-white rounded-lg text-gray-500 hover:text-brand-600 transition-colors">
                                    <FileText className="w-4 h-4" />
                                </button>
                                <button onClick={() => onDeleteVendor(vendor.id)} title="Delete" className="p-2 hover:bg-white rounded-lg text-gray-500 hover:text-red-600 transition-colors">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                            <button 
                                onClick={() => openReminderModal(vendor)}
                                className="text-xs font-medium text-brand-600 hover:text-brand-800 flex items-center gap-1 bg-brand-50 px-2 py-1 rounded-md"
                            >
                                <Bell className="w-3 h-3" /> {isUrdu ? "یاد دہانی بھیجیں" : "Reminder"}
                            </button>
                        </div>
                    </div>
                ))}

                {/* Empty State */}
                {vendors.length === 0 && (
                    <div className="col-span-full py-12 text-center text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
                        <DollarSign className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p>No vendors yet. Add one to get started.</p>
                    </div>
                )}
            </div>

            {/* Reminder Modal */}
            {reminderVendor && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-2xl animate-fadeIn">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <Bell className="w-5 h-5 text-brand-600" />
                            {isUrdu ? "ادائیگی کی یاد دہانی بھیجیں" : "Send Payment Reminder"}
                        </h3>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Channel</label>
                                <div className="flex bg-gray-100 p-1 rounded-lg">
                                    {(['WhatsApp', 'SMS', 'Email'] as const).map(m => (
                                        <button
                                            key={m}
                                            onClick={() => setReminderMethod(m)}
                                            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                                                reminderMethod === m ? 'bg-white shadow text-brand-700' : 'text-gray-500'
                                            }`}
                                        >
                                            {m}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <label className="block text-sm font-medium text-gray-700">Message</label>
                                    <button 
                                        onClick={() => openReminderModal(reminderVendor)} 
                                        className="text-xs text-brand-600 hover:text-brand-700 flex items-center gap-1"
                                    >
                                        <Loader2 className={`w-3 h-3 ${isGenerating ? 'animate-spin' : ''}`} />
                                        Regenerate AI
                                    </button>
                                </div>
                                <textarea
                                    value={reminderMessage}
                                    onChange={(e) => setReminderMessage(e.target.value)}
                                    rows={4}
                                    className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500"
                                    placeholder="Loading message..."
                                />
                            </div>

                            <div className="bg-gray-50 p-3 rounded-lg text-xs text-gray-600">
                                <strong>Recipient:</strong> {reminderVendor.contactName} <br/>
                                <strong>Detail:</strong> {reminderMethod === 'Email' ? reminderVendor.email : reminderVendor.phone}
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end gap-3">
                            <button 
                                onClick={() => setReminderVendor(null)}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleSendReminder}
                                className="px-4 py-2 bg-[#25D366] text-white rounded-lg hover:bg-[#20bd5a] flex items-center gap-2"
                            >
                                <Send className="w-4 h-4" />
                                Send via {reminderMethod}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Vendor Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl w-full max-w-lg p-6 shadow-2xl animate-fadeIn">
                        <h3 className="text-xl font-bold mb-4">{isUrdu ? "نیا وینڈر" : "Add New Vendor"}</h3>
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            const formData = new FormData(e.currentTarget);
                            onAddVendor({
                                id: Math.random().toString(36).substr(2, 9),
                                weddingId: weddingId,
                                name: formData.get('name') as string,
                                category: formData.get('category') as any,
                                contactName: formData.get('contactName') as string,
                                phone: formData.get('phone') as string,
                                email: formData.get('email') as string,
                                cost: Number(formData.get('cost')),
                                paid: Number(formData.get('paid')),
                                status: 'Draft',
                                dueDate: formData.get('dueDate') as string,
                            });
                            setShowAddModal(false);
                        }}>
                            <div className="grid grid-cols-2 gap-4 space-y-2">
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700">Business Name</label>
                                    <input name="name" required className="w-full border rounded-lg px-3 py-2 mt-1" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Category</label>
                                    <select name="category" className="w-full border rounded-lg px-3 py-2 mt-1">
                                        <option>Venue</option>
                                        <option>Catering</option>
                                        <option>Photo</option>
                                        <option>Decor</option>
                                        <option>Music</option>
                                        <option>Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Contact Person</label>
                                    <input name="contactName" className="w-full border rounded-lg px-3 py-2 mt-1" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Total Cost (PKR)</label>
                                    <input name="cost" type="number" required className="w-full border rounded-lg px-3 py-2 mt-1" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Amount Paid (PKR)</label>
                                    <input name="paid" type="number" defaultValue="0" className="w-full border rounded-lg px-3 py-2 mt-1" />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700">Payment Due Date</label>
                                    <input name="dueDate" type="date" className="w-full border rounded-lg px-3 py-2 mt-1" />
                                </div>
                                <div className="col-span-2 grid grid-cols-2 gap-4">
                                    <div>
                                         <label className="block text-sm font-medium text-gray-700">Phone</label>
                                         <input name="phone" className="w-full border rounded-lg px-3 py-2 mt-1" />
                                    </div>
                                    <div>
                                         <label className="block text-sm font-medium text-gray-700">Email</label>
                                         <input name="email" type="email" className="w-full border rounded-lg px-3 py-2 mt-1" />
                                    </div>
                                </div>
                            </div>
                            <div className="mt-6 flex justify-end gap-3">
                                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700">Add Vendor</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

const UserAvatar = ({ name }: { name: string }) => (
    <div className="w-6 h-6 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-[10px] font-bold">
        {name.charAt(0)}
    </div>
);