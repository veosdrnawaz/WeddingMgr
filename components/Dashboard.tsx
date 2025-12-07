
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Users, CheckCircle, DollarSign, Calendar, Eye, User } from 'lucide-react';
import { WeddingStats, Viewer } from '../types';

interface DashboardProps {
  stats: WeddingStats;
  rsvpData: { name: string; value: number }[];
  budgetData: { category: string; amount: number }[];
  recentVisitors: Viewer[];
  isUrdu: boolean;
}

const COLORS = ['#d946ef', '#a21caf', '#e5e7eb', '#fcd34d'];

export const Dashboard: React.FC<DashboardProps> = ({ stats, rsvpData, budgetData, recentVisitors, isUrdu }) => {
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
            icon={<Users className="w-6 h-6 text-brand-600" />} 
            label={isUrdu ? "کل مہمان" : "Total Guests"} 
            value={stats.totalGuests.toString()} 
            subValue={`${stats.confirmedGuests} ${isUrdu ? "تصدیق شدہ" : "Confirmed"}`}
            isUrdu={isUrdu}
        />
        <StatCard 
            icon={<CheckCircle className="w-6 h-6 text-green-600" />} 
            label={isUrdu ? "جوابات" : "RSVP Rate"} 
            value={`${stats.totalGuests ? Math.round((stats.confirmedGuests / stats.totalGuests) * 100) : 0}%`}
            isUrdu={isUrdu}
        />
        <StatCard 
            icon={<DollarSign className="w-6 h-6 text-blue-600" />} 
            label={isUrdu ? "خرچ شدہ بجٹ" : "Budget Spent"} 
            value={`PKR ${stats.spentBudget.toLocaleString()}`}
            subValue={`of PKR ${stats.totalBudget.toLocaleString()}`}
            isUrdu={isUrdu}
        />
        <StatCard 
            icon={<Calendar className="w-6 h-6 text-orange-600" />} 
            label={isUrdu ? "باقی دن" : "Days To Go"} 
            value={stats.daysToGo.toString()}
            isUrdu={isUrdu}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content Area (Charts) */}
          <div className="lg:col-span-2 space-y-6">
             {/* Gender Breakdown Row */}
             <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex justify-around text-center">
                <div>
                    <div className="text-sm text-gray-500 mb-1">{isUrdu ? "مرد" : "Men"}</div>
                    <div className="text-2xl font-bold text-blue-600">{stats.totalMen}</div>
                </div>
                <div className="w-px bg-gray-200"></div>
                <div>
                    <div className="text-sm text-gray-500 mb-1">{isUrdu ? "خواتین" : "Women"}</div>
                    <div className="text-2xl font-bold text-pink-600">{stats.totalWomen}</div>
                </div>
                 <div className="w-px bg-gray-200"></div>
                <div>
                    <div className="text-sm text-gray-500 mb-1">{isUrdu ? "بچے" : "Children"}</div>
                    <div className="text-2xl font-bold text-green-600">{stats.totalChildren}</div>
                </div>
             </div>

             <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className={`text-lg font-semibold mb-4 ${isUrdu ? 'font-urdu text-right' : ''}`}>
                    {isUrdu ? "جوابات کا خلاصہ" : "RSVP Summary"}
                </h3>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                        data={rsvpData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        >
                        {rsvpData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                        </Pie>
                        <Tooltip />
                    </PieChart>
                    </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-4 mt-2 flex-wrap">
                    {rsvpData.map((entry, index) => (
                        <div key={entry.name} className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                            <span className="text-sm text-gray-600">{entry.name}</span>
                        </div>
                    ))}
                </div>
            </div>
            
             <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className={`text-lg font-semibold mb-4 ${isUrdu ? 'font-urdu text-right' : ''}`}>
                    {isUrdu ? "اخراجات کا تجزیہ" : "Budget Breakdown"}
                </h3>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={budgetData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="category" tick={{fontSize: 12}} />
                        <YAxis tick={{fontSize: 12}} />
                        <Tooltip cursor={{fill: 'transparent'}} formatter={(value: number) => `PKR ${value.toLocaleString()}`} />
                        <Bar dataKey="amount" fill="#a21caf" radius={[4, 4, 0, 0]} />
                    </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
          </div>

          {/* Sidebar Area (Visitors) */}
          <div className="space-y-6">
             <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-full flex flex-col">
                 <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-3">
                    <Eye className="w-5 h-5 text-gray-400" />
                    <h3 className={`font-semibold text-gray-700 ${isUrdu ? 'font-urdu ml-auto' : ''}`}>
                        {isUrdu ? "حال ہی میں دیکھا" : "Recently Viewed"}
                    </h3>
                 </div>
                 <div className="flex-1 overflow-y-auto max-h-[500px] space-y-4 pr-2">
                     {recentVisitors.map((v, i) => (
                         <div key={i} className="flex items-start gap-3">
                             <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 mt-1">
                                 <User className="w-4 h-4" />
                             </div>
                             <div>
                                 <p className="text-sm font-medium text-gray-900">{v.name}</p>
                                 <p className="text-xs text-gray-400">
                                     {new Date(v.timestamp).toLocaleString()}
                                 </p>
                             </div>
                         </div>
                     ))}
                     {recentVisitors.length === 0 && (
                         <p className="text-sm text-gray-400 italic text-center py-4">No recent visitors</p>
                     )}
                 </div>
             </div>
          </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, subValue, isUrdu }: { icon: React.ReactNode, label: string, value: string, subValue?: string, isUrdu: boolean }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-start justify-between hover:shadow-md transition-shadow">
    <div className={`flex-1 ${isUrdu ? 'order-last text-right' : ''}`}>
      <p className={`text-sm text-gray-500 font-medium ${isUrdu ? 'font-urdu' : ''}`}>{label}</p>
      <h4 className="text-2xl font-bold text-gray-900 mt-1">{value}</h4>
      {subValue && <p className="text-xs text-gray-400 mt-1">{subValue}</p>}
    </div>
    <div className={`p-3 bg-gray-50 rounded-lg ${isUrdu ? 'order-first' : ''}`}>
        {icon}
    </div>
  </div>
);
