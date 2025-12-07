
import { Guest, Table, Vendor, Task, Viewer } from '../types';

// Replace this with your actual Web App URL after deployment
const API_URL = process.env.REACT_APP_API_URL || "YOUR_GOOGLE_SCRIPT_WEB_APP_URL";

interface ApiResponse {
    guests: Guest[];
    tables: Table[];
    vendors: Vendor[];
    tasks: Task[];
    visitors: Viewer[];
}

export const api = {
    // Auth
    createWedding: async (coupleName: string): Promise<{status: string, weddingId?: string, message?: string}> => {
        if (API_URL === "YOUR_GOOGLE_SCRIPT_WEB_APP_URL") return { status: 'success', weddingId: 'W1000' };
        
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                body: JSON.stringify({ action: 'createWedding', data: { coupleName } }),
                headers: { 'Content-Type': 'text/plain' },
            });
            return await response.json();
        } catch (e) {
            console.error(e);
            return { status: 'error', message: 'Network error' };
        }
    },

    joinWedding: async (weddingId: string): Promise<{status: string, coupleName?: string, message?: string}> => {
        if (API_URL === "YOUR_GOOGLE_SCRIPT_WEB_APP_URL") return { status: 'success', coupleName: 'Demo Wedding' };

        try {
             const response = await fetch(API_URL, {
                method: 'POST',
                body: JSON.stringify({ action: 'joinWedding', data: { weddingId } }),
                headers: { 'Content-Type': 'text/plain' },
            });
            return await response.json();
        } catch (e) {
             return { status: 'error', message: 'Network error' };
        }
    },

    logVisit: async (weddingId: string, name: string) => {
        if (API_URL === "YOUR_GOOGLE_SCRIPT_WEB_APP_URL") return;
        try {
            await fetch(API_URL, {
                method: 'POST',
                body: JSON.stringify({ action: 'logVisit', data: { weddingId, name } }),
                headers: { 'Content-Type': 'text/plain' },
            });
        } catch (e) { console.error("Log visit failed", e); }
    },

    // Fetch all data
    fetchAll: async (weddingId: string): Promise<ApiResponse> => {
        if (API_URL === "YOUR_GOOGLE_SCRIPT_WEB_APP_URL") {
            return Promise.resolve({ guests: [], tables: [], vendors: [], tasks: [], visitors: [] });
        }
        
        try {
            const response = await fetch(`${API_URL}?action=getAll&weddingId=${weddingId}`);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error("Failed to fetch data", error);
            throw error;
        }
    },

    // Generic POST helper
    post: async (action: string, data: any) => {
        if (API_URL === "YOUR_GOOGLE_SCRIPT_WEB_APP_URL") return;

        // Google Apps Script requires text/plain for CORS text handling in simple requests
        await fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify({ action, data }),
            headers: { 'Content-Type': 'text/plain' }, 
        });
    },

    // Guests
    addGuest: async (guest: Guest) => api.post('addGuest', guest),
    updateGuest: async (guest: Guest) => api.post('updateGuest', guest),
    deleteGuest: async (id: string, weddingId: string) => api.post('deleteGuest', { id, weddingId }),

    // Tables
    addTable: async (table: Table) => api.post('addTable', table),

    // Vendors
    addVendor: async (vendor: Vendor) => api.post('addVendor', vendor),
    updateVendor: async (vendor: Vendor) => api.post('updateVendor', vendor),
    deleteVendor: async (id: string, weddingId: string) => api.post('deleteVendor', { id, weddingId }),

    // Tasks
    addTask: async (task: Task) => api.post('addTask', task),
    updateTask: async (task: Task) => api.post('updateTask', task),
    deleteTask: async (id: string, weddingId: string) => api.post('deleteTask', { id, weddingId }),
};
