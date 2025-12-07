
import React, { useState, useMemo, useEffect } from 'react';
import { LayoutDashboard, Users, Armchair, ShoppingBag, CheckSquare, ShieldCheck, Globe, Menu, LogOut, Loader2 } from 'lucide-react';
import { Dashboard } from './components/Dashboard';
import { GuestList } from './components/GuestList';
import { SeatingPlanner } from './components/SeatingPlanner';
import { VendorManager } from './components/VendorManager';
import { TaskManager } from './components/TaskManager';
import { Organizers } from './components/Organizers';
import { GeminiAssistant } from './components/GeminiAssistant';
import { Landing } from './components/Landing';
import { Guest, Table, WeddingStats, RSVPStatus, MealChoice, Vendor, Task, Viewer } from './types';
import { api } from './services/api';

type View = 'dashboard' | 'guests' | 'seating' | 'vendors' | 'tasks' | 'organizers';

export default function App() {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [isUrdu, setIsUrdu] = useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Auth State
  const [weddingId, setWeddingId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);

  // App State
  const [guests, setGuests] = useState<Guest[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [visitors, setVisitors] = useState<Viewer[]>([]);

  // Load Data only when weddingId is set
  useEffect(() => {
    const loadData = async () => {
        if (!weddingId) return;

        try {
            setIsLoading(true);
            const data = await api.fetchAll(weddingId);
            setGuests(data.guests || []);
            setTables(data.tables || []);
            setVendors(data.vendors || []);
            setTasks(data.tasks || []);
            setVisitors(data.visitors || []);
        } catch (e) {
            console.error("Error loading data:", e);
        } finally {
            setIsLoading(false);
        }
    };
    loadData();
  }, [weddingId]);

  // Log visit on login
  useEffect(() => {
    if (weddingId && userName) {
        api.logVisit(weddingId, userName);
    }
  }, [weddingId, userName]);

  // Derived Stats
  const stats: WeddingStats = useMemo(() => {
      const confirmed = guests.filter(g => g.rsvpStatus === RSVPStatus.Accepted).reduce((acc, g) => acc + g.partySize, 0);
      const total = guests.filter(g => g.rsvpStatus !== RSVPStatus.Suggested).reduce((acc, g) => acc + g.partySize, 0);
      const totalBudget = 5000000; // in PKR
      const spentBudget = vendors.reduce((acc, v) => acc + v.paid, 0);

      // Gender Breakdown
      const totalMen = guests.filter(g => g.rsvpStatus !== RSVPStatus.Suggested).reduce((acc, g) => acc + (g.menCount || 0), 0);
      const totalWomen = guests.filter(g => g.rsvpStatus !== RSVPStatus.Suggested).reduce((acc, g) => acc + (g.womenCount || 0), 0);
      const totalChildren = guests.filter(g => g.rsvpStatus !== RSVPStatus.Suggested).reduce((acc, g) => acc + (g.childrenCount || 0), 0);


      return {
          totalGuests: total,
          confirmedGuests: confirmed,
          totalMen,
          totalWomen,
          totalChildren,
          totalBudget,
          spentBudget,
          daysToGo: 45,
          completedTasks: tasks.filter(t => t.completed).length,
          totalTasks: tasks.length
      };
  }, [guests, vendors, tasks]);

  const rsvpChartData = useMemo(() => [
      { name: 'Accepted', value: guests.filter(g => g.rsvpStatus === RSVPStatus.Accepted).length },
      { name: 'Declined', value: guests.filter(g => g.rsvpStatus === RSVPStatus.Declined).length },
      { name: 'Pending', value: guests.filter(g => g.rsvpStatus === RSVPStatus.Invited).length },
      { name: 'Maybe', value: guests.filter(g => g.rsvpStatus === RSVPStatus.Maybe).length },
  ], [guests]);

  const budgetData = useMemo(() => {
      const map: Record<string, number> = {};
      vendors.forEach(v => {
          map[v.category] = (map[v.category] || 0) + v.cost;
      });
      return Object.entries(map).map(([category, amount]) => ({ category, amount }));
  }, [vendors]);

  // Handlers
  const handleLogin = (id: string, name: string) => {
      setWeddingId(id);
      setUserName(name);
  };

  const handleLogout = () => {
      setWeddingId(null);
      setUserName(null);
      setGuests([]);
      setTables([]);
      setVendors([]);
      setTasks([]);
      setVisitors([]);
  };

  const handleAddGuest = async (newGuest: Guest) => {
      setGuests(prev => [...prev, newGuest]); // Optimistic update
      await api.addGuest(newGuest);
  };
  
  const handleUpdateGuest = async (id: string, updates: Partial<Guest>) => {
      setGuests(prev => prev.map(g => g.id === id ? { ...g, ...updates } : g));
      const guest = guests.find(g => g.id === id);
      if (guest && weddingId) await api.updateGuest({ ...guest, ...updates });
  };

  const handleAssignSeat = async (guestId: string, tableId: string | undefined) => {
      handleUpdateGuest(guestId, { tableId });
  };

  const handleAddTable = async (table: Table) => {
      setTables(prev => [...prev, table]);
      if (weddingId) await api.addTable({ ...table, weddingId });
  };
  
  const handleAddVendor = async (vendor: Vendor) => {
      setVendors(prev => [...prev, vendor]);
      if (weddingId) await api.addVendor({ ...vendor, weddingId });
  };

  const handleUpdateVendor = async (id: string, updates: Partial<Vendor>) => {
      setVendors(prev => prev.map(v => v.id === id ? { ...v, ...updates } : v));
      const vendor = vendors.find(v => v.id === id);
      if (vendor) await api.updateVendor({ ...vendor, ...updates });
  };

  const handleDeleteVendor = async (id: string) => {
      setVendors(prev => prev.filter(v => v.id !== id));
      if (weddingId) await api.deleteVendor(id, weddingId);
  };

  const handleAddTask = async (task: Task) => {
      setTasks(prev => [...prev, task]);
      if (weddingId) await api.addTask({ ...task, weddingId });
  };

  const handleToggleTask = async (id: string) => {
      const task = tasks.find(t => t.id === id);
      if (task) {
          const updated = { ...task, completed: !task.completed };
          setTasks(prev => prev.map(t => t.id === id ? updated : t));
          await api.updateTask(updated);
      }
  };

  const handleDeleteTask = async (id: string) => {
      setTasks(prev => prev.filter(t => t.id !== id));
      if (weddingId) await api.deleteTask(id, weddingId);
  };
  
  const NavItem = ({ view, icon, label }: { view: View, icon: React.ReactNode, label: string }) => (
    <button
      onClick={() => { setCurrentView(view); setSidebarOpen(false); }}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
        currentView === view 
          ? 'bg-brand-50 text-brand-700 font-medium' 
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
      } ${isUrdu ? 'flex-row-reverse text-right' : ''}`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );

  // --- RENDER ---
  
  if (!weddingId || !userName) {
      return <Landing onLogin={handleLogin} isUrdu={isUrdu} />;
  }

  return (
    <div className={`min-h-screen bg-gray-50 flex ${isUrdu ? 'font-urdu' : 'font-sans'}`}>
      
      {/* Sidebar - Desktop */}
      <aside className={`fixed inset-y-0 z-40 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out md:relative md:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } ${isUrdu ? 'order-last border-r-0 border-l' : ''}`}>
        
        <div className="h-16 flex items-center px-6 border-b border-gray-100">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center text-white font-bold text-xl mr-3">W</div>
            <div>
                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-600 to-purple-600">
                    {isUrdu ? "ویڈنگ منیجر" : "WeddingMgr"}
                </span>
                <p className="text-xs text-gray-500">ID: {weddingId}</p>
            </div>
        </div>

        <nav className="p-4 space-y-1">
            <NavItem view="dashboard" icon={<LayoutDashboard className="w-5 h-5"/>} label={isUrdu ? "ڈیش بورڈ" : "Dashboard"} />
            <NavItem view="guests" icon={<Users className="w-5 h-5"/>} label={isUrdu ? "مہمان" : "Guests"} />
            <NavItem view="seating" icon={<Armchair className="w-5 h-5"/>} label={isUrdu ? "بیٹھنے کا انتظام" : "Seating"} />
            <NavItem view="vendors" icon={<ShoppingBag className="w-5 h-5"/>} label={isUrdu ? "وینڈرز" : "Vendors"} />
            <NavItem view="tasks" icon={<CheckSquare className="w-5 h-5"/>} label={isUrdu ? "کام" : "Tasks"} />
            <div className="my-2 border-t border-gray-100"></div>
            <NavItem view="organizers" icon={<ShieldCheck className="w-5 h-5"/>} label={isUrdu ? "منتظمین" : "Organizers"} />
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-gray-100 bg-gray-50">
            <button 
                onClick={() => setIsUrdu(!isUrdu)}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-brand-600 transition-colors w-full p-2 rounded-lg"
            >
                <Globe className="w-4 h-4" />
                <span>{isUrdu ? "English Switch" : "Switch to Urdu"}</span>
            </button>
             <button 
                onClick={handleLogout}
                className="flex items-center gap-2 text-sm text-red-600 hover:bg-red-50 transition-colors w-full p-2 mt-1 rounded-lg"
            >
                <LogOut className="w-4 h-4" />
                <span>{isUrdu ? "لاگ آؤٹ" : "Log out"}</span>
            </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header - Mobile */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-8 shrink-0">
            <button 
                className="md:hidden p-2 text-gray-600"
                onClick={() => setSidebarOpen(!isSidebarOpen)}
            >
                <Menu className="w-6 h-6" />
            </button>
            <div className={`flex items-center gap-4 ${isUrdu ? 'mr-auto' : 'ml-auto'}`}>
                <div className={`text-right ${isUrdu ? 'text-left' : ''}`}>
                    <p className="text-sm font-medium text-gray-900">Welcome, {userName}</p>
                    <p className="text-xs text-gray-500">ID: {weddingId}</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-semibold border border-brand-200">
                    {userName ? userName.charAt(0) : 'G'}
                </div>
            </div>
        </header>

        {/* View Content */}
        <div className="flex-1 overflow-auto p-4 md:p-8 bg-gray-50/50">
            <div className="max-w-7xl mx-auto pb-20">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-[60vh] text-brand-600">
                        <Loader2 className="w-12 h-12 animate-spin mb-4" />
                        <p>Connecting to Wedding Database...</p>
                    </div>
                ) : (
                    <>
                        <header className={`mb-8 ${isUrdu ? 'text-right' : ''}`}>
                            <h1 className="text-2xl font-bold text-gray-900">
                                {currentView === 'dashboard' && (isUrdu ? "جائزہ" : "Event Overview")}
                                {currentView === 'guests' && (isUrdu ? "مہمانوں کا انتظام" : "Guest Management")}
                                {currentView === 'seating' && (isUrdu ? "بیٹھنے کا منصوبہ ساز" : "Seating Planner")}
                                {currentView === 'vendors' && (isUrdu ? "وینڈر کنٹریکٹس" : "Vendor Management")}
                                {currentView === 'tasks' && (isUrdu ? "کام کی فہرست" : "Task Checklist")}
                                {currentView === 'organizers' && (isUrdu ? "منتظمین اور خاندان" : "Organizers & Family")}
                            </h1>
                        </header>

                        {currentView === 'dashboard' && (
                            <Dashboard 
                                stats={stats} 
                                rsvpData={rsvpChartData} 
                                budgetData={budgetData} 
                                recentVisitors={visitors}
                                isUrdu={isUrdu} 
                            />
                        )}
                        
                        {currentView === 'guests' && (
                            <GuestList 
                                guests={guests} 
                                onAddGuest={handleAddGuest} 
                                onUpdateGuest={handleUpdateGuest}
                                isUrdu={isUrdu}
                                weddingId={weddingId}
                                currentUserName={userName}
                            />
                        )}

                        {currentView === 'seating' && (
                            <SeatingPlanner 
                                guests={guests} 
                                tables={tables}
                                onAssignSeat={handleAssignSeat}
                                onAddTable={handleAddTable}
                                isUrdu={isUrdu}
                            />
                        )}

                        {currentView === 'vendors' && (
                            <VendorManager 
                                vendors={vendors}
                                onAddVendor={handleAddVendor}
                                onUpdateVendor={handleUpdateVendor}
                                onDeleteVendor={handleDeleteVendor}
                                isUrdu={isUrdu}
                                weddingId={weddingId || ''}
                            />
                        )}

                        {currentView === 'tasks' && (
                            <TaskManager 
                                tasks={tasks}
                                onAddTask={handleAddTask}
                                onToggleTask={handleToggleTask}
                                onDeleteTask={handleDeleteTask}
                                isUrdu={isUrdu}
                                weddingId={weddingId || ''}
                            />
                        )}

                        {currentView === 'organizers' && (
                            <Organizers 
                                visitors={visitors}
                                isUrdu={isUrdu}
                            />
                        )}
                    </>
                )}
            </div>
        </div>
      </main>

      {/* AI Integration */}
      <GeminiAssistant isUrdu={isUrdu} />
    </div>
  );
}
