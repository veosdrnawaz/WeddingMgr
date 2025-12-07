import React, { useState } from 'react';
import { Task } from '../types';
import { Plus, Calendar, CheckSquare, Square, Clock, Bell } from 'lucide-react';

interface TaskManagerProps {
    tasks: Task[];
    onAddTask: (task: Task) => void;
    onToggleTask: (taskId: string) => void;
    onDeleteTask: (taskId: string) => void;
    isUrdu: boolean;
    weddingId: string;
}

export const TaskManager: React.FC<TaskManagerProps> = ({ tasks, onAddTask, onToggleTask, onDeleteTask, isUrdu, weddingId }) => {
    const [filter, setFilter] = useState<'All' | 'Pending' | 'Completed'>('All');
    const [showModal, setShowModal] = useState(false);

    const filteredTasks = tasks.filter(t => {
        if (filter === 'Pending') return !t.completed;
        if (filter === 'Completed') return t.completed;
        return true;
    });

    return (
        <div className="space-y-6">
            <div className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${isUrdu ? 'md:flex-row-reverse' : ''}`}>
                <div>
                    <h2 className="text-xl font-bold text-gray-900">{isUrdu ? "کام کی فہرست" : "Task Checklist"}</h2>
                    <p className="text-sm text-gray-500">
                        {tasks.filter(t => t.completed).length} / {tasks.length} completed
                    </p>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <div className="bg-gray-100 p-1 rounded-lg flex text-sm font-medium">
                        {(['All', 'Pending', 'Completed'] as const).map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-3 py-1.5 rounded-md transition-all ${filter === f ? 'bg-white shadow text-brand-700' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                    <button 
                        onClick={() => setShowModal(true)}
                        className="bg-brand-600 text-white px-4 py-2 rounded-lg hover:bg-brand-700 flex items-center gap-2 ml-auto"
                    >
                        <Plus className="w-4 h-4" />
                        <span className="hidden md:inline">{isUrdu ? "نیا کام" : "New Task"}</span>
                    </button>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                <div 
                    className="bg-green-500 h-full transition-all duration-500"
                    style={{ width: `${tasks.length ? (tasks.filter(t => t.completed).length / tasks.length) * 100 : 0}%` }}
                ></div>
            </div>

            {/* Task List */}
            <div className="space-y-3">
                {filteredTasks.map(task => (
                    <div 
                        key={task.id} 
                        className={`group bg-white p-4 rounded-xl border transition-all flex items-center gap-4 ${
                            task.completed ? 'border-gray-100 bg-gray-50/50 opacity-75' : 'border-gray-100 shadow-sm hover:border-brand-200'
                        }`}
                    >
                        <button 
                            onClick={() => onToggleTask(task.id)}
                            className={`flex-shrink-0 transition-colors ${task.completed ? 'text-green-500' : 'text-gray-300 hover:text-brand-500'}`}
                        >
                            {task.completed ? <CheckSquare className="w-6 h-6" /> : <Square className="w-6 h-6" />}
                        </button>
                        
                        <div className="flex-1 min-w-0">
                            <h3 className={`font-medium truncate ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                                {task.title}
                            </h3>
                            <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                                <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" /> Due: {task.dueDate || "No date"}
                                </span>
                                {task.assignedTo && (
                                    <span className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-600">
                                        @{task.assignedTo}
                                    </span>
                                )}
                                <span className={`px-1.5 py-0.5 rounded font-medium ${
                                    task.priority === 'High' ? 'bg-red-50 text-red-600' :
                                    task.priority === 'Medium' ? 'bg-yellow-50 text-yellow-600' :
                                    'bg-blue-50 text-blue-600'
                                }`}>
                                    {task.priority}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                             {!task.completed && (
                                <button onClick={() => alert("Reminder sent!")} className="p-2 text-gray-400 hover:text-brand-600 hover:bg-gray-100 rounded-lg" title="Send Reminder">
                                    <Bell className="w-4 h-4" />
                                </button>
                             )}
                        </div>
                    </div>
                ))}
                 {filteredTasks.length === 0 && (
                    <div className="text-center py-12 text-gray-400">
                        No tasks found in this view.
                    </div>
                )}
            </div>

            {/* Add Task Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-2xl animate-fadeIn">
                        <h3 className="text-lg font-bold mb-4">{isUrdu ? "نیا کام شامل کریں" : "Add New Task"}</h3>
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            const formData = new FormData(e.currentTarget);
                            onAddTask({
                                id: Math.random().toString(36).substr(2, 9),
                                weddingId: weddingId,
                                title: formData.get('title') as string,
                                dueDate: formData.get('dueDate') as string,
                                assignedTo: formData.get('assignedTo') as string,
                                priority: formData.get('priority') as any,
                                completed: false
                            });
                            setShowModal(false);
                        }}>
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Task Title</label>
                                    <input name="title" required className="w-full border rounded-lg px-3 py-2 mt-1" placeholder="e.g. Call Caterer" />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Due Date</label>
                                        <input name="dueDate" type="date" required className="w-full border rounded-lg px-3 py-2 mt-1" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Priority</label>
                                        <select name="priority" className="w-full border rounded-lg px-3 py-2 mt-1">
                                            <option>High</option>
                                            <option>Medium</option>
                                            <option>Low</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Assign To</label>
                                    <input name="assignedTo" className="w-full border rounded-lg px-3 py-2 mt-1" placeholder="Team member name" />
                                </div>
                            </div>
                            <div className="mt-6 flex justify-end gap-3">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700">Create Task</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};