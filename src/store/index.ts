import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  subscription: 'free' | 'premium';
  stripeCustomerId?: string;
  subscriptionId?: string;
  subscriptionStatus?: 'active' | 'canceled' | 'past_due' | 'unpaid';
  subscriptionEndsAt?: string;
  avatar?: string;
}

export interface Bill {
  id: string;
  title: string;
  status: string;
  sponsor: string;
  summary: string;
  lastAction: string;
  chamber: 'house' | 'senate';
  state: string;
  session: string;
}

export interface Campaign {
  id: string;
  name: string;
  description: string;
  billCount: number;
  updated: string;
  stakeholders: string[];
}

export interface Legislator {
  people_id: string;
  name: string;
  first_name: string | null;
  last_name: string | null;
  party: string | null;
  role: string | null;
  district: string | null;
  photo?: string;
  ballotpedia?: string;
  opensecrets_id?: string;
  votesmart_id?: string;
  state?: string;
  chamber?: 'House' | 'Senate';
}

export interface Report {
  id: string;
  title: string;
  type: 'summary' | 'fiscal' | 'opinion' | 'strategy';
  content: string;
  timestamp: string;
  read: boolean;
}

export interface Alert {
  id: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  timestamp: string;
  read: boolean;
}

interface AppState {
  // User & Auth
  user: User | null;
  isAuthenticated: boolean;
  
  // UI State
  sidebarOpen: boolean;
  darkMode: boolean;
  
  // Legislators Page State
  legislatureLevel: 'federal' | 'state';
  selectedState: string | null;
  legislatorFilters: {
    chamber: string | null;
    party: string | null;
    searchTerm: string;
    district: string | null;
    state: string | null;
  };
  selectedLegislator: Legislator | null;
  
  // Data
  bills: Bill[];
  campaigns: Campaign[];
  legislators: Legislator[];
  reports: Report[];
  alerts: Alert[];
  
  // Loading states
  loading: {
    bills: boolean;
    campaigns: boolean;
    legislators: boolean;
    reports: boolean;
  };
  
  // Actions
  setUser: (user: User | null) => void;
  setSidebarOpen: (open: boolean) => void;
  setDarkMode: (dark: boolean) => void;
  
  // Subscription actions
  updateSubscription: (subscription: Partial<Pick<User, 'subscription' | 'stripeCustomerId' | 'subscriptionId' | 'subscriptionStatus' | 'subscriptionEndsAt'>>) => void;
  
  // Legislators Page Actions
  setLegislatureLevel: (level: 'federal' | 'state') => void;
  setSelectedState: (state: string | null) => void;
  setLegislatorFilters: (filters: Partial<AppState['legislatorFilters']>) => void;
  setSelectedLegislator: (legislator: Legislator | null) => void;
  
  // Data actions
  setBills: (bills: Bill[]) => void;
  setCampaigns: (campaigns: Campaign[]) => void;
  setLegislators: (legislators: Legislator[]) => void;
  setReports: (reports: Report[]) => void;
  setAlerts: (alerts: Alert[]) => void;
  
  // Loading actions
  setLoading: (key: keyof AppState['loading'], loading: boolean) => void;
  
  // Alert actions
  addAlert: (alert: Omit<Alert, 'id'>) => void;
  markAlertRead: (id: string) => void;
  dismissAlert: (id: string) => void;
  
  // Report actions
  markReportRead: (id: string) => void;
}

export const useAppStore = create<AppState>()(
  devtools(
    (set, get) => ({
      // Initial state
      user: {
        id: '1',
        email: 'demo@shadowcongress.com',
        name: 'Demo User',
        role: 'user',
        subscription: 'free',
        subscriptionStatus: undefined
      },
      isAuthenticated: true,
      sidebarOpen: false,
      darkMode: false,
      legislatureLevel: 'federal',
      selectedState: null,
      legislatorFilters: {
        chamber: null,
        party: null,
        searchTerm: '',
        district: null,
        state: null,
      },
      selectedLegislator: null,
      bills: [],
      campaigns: [],
      legislators: [],
      reports: [],
      alerts: [],
      loading: {
        bills: false,
        campaigns: false,
        legislators: false,
        reports: false,
      },
      
      // Actions
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
      setDarkMode: (darkMode) => set({ darkMode }),
      
      // Subscription actions
      updateSubscription: (subscription) => 
        set((state) => ({
          user: state.user ? { ...state.user, ...subscription } : state.user
        })),
      
      // Legislators Page Actions
      setLegislatureLevel: (legislatureLevel) => set({ legislatureLevel }),
      setSelectedState: (selectedState) => set({ selectedState }),
      setLegislatorFilters: (filters) => 
        set((state) => ({
          legislatorFilters: { ...state.legislatorFilters, ...filters }
        })),
      setSelectedLegislator: (selectedLegislator) => set({ selectedLegislator }),
      
      // Data actions
      setBills: (bills) => set({ bills }),
      setCampaigns: (campaigns) => set({ campaigns }),
      setLegislators: (legislators) => set({ legislators }),
      setReports: (reports) => set({ reports }),
      setAlerts: (alerts) => set({ alerts }),
      
      // Loading actions
      setLoading: (key, loading) => 
        set((state) => ({ 
          loading: { ...state.loading, [key]: loading } 
        })),
      
      // Alert actions
      addAlert: (alert) => 
        set((state) => ({
          alerts: [
            { ...alert, id: Math.random().toString(36), timestamp: new Date().toISOString() },
            ...state.alerts
          ]
        })),
      
      markAlertRead: (id) =>
        set((state) => ({
          alerts: state.alerts.map(alert =>
            alert.id === id ? { ...alert, read: true } : alert
          )
        })),
      
      dismissAlert: (id) =>
        set((state) => ({
          alerts: state.alerts.filter(alert => alert.id !== id)
        })),
      
      // Report actions
      markReportRead: (id) =>
        set((state) => ({
          reports: state.reports.map(report =>
            report.id === id ? { ...report, read: true } : report
          )
        })),
    }),
    {
      name: 'shadowcongress-store',
    }
  )
);