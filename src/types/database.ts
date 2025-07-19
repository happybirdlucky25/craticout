// 🏛️ Shadow Congress Database Types
// Comprehensive TypeScript interfaces for all database tables

export interface Bill {
  bill_id: string;
  session_id?: number;
  bill_number?: string;
  status?: string;
  status_desc?: string;
  status_date?: string;
  title?: string;
  description?: string;
  committee_id?: string;
  committee?: string;
  last_action_date?: string;
  last_action?: string;
  url?: string;
  state_link?: string;
  full_bill_text?: string;
  change_hash?: string;
}

export interface Person {
  people_id: string;
  name?: string;
  first_name?: string;
  middle_name?: string;
  last_name?: string;
  suffix?: string;
  nickname?: string;
  party_id?: string;
  party?: string;
  role_id?: string;
  role?: string;
  district?: string;
  followthemoney_eid?: string;
  votesmart_id?: string;
  opensecrets_id?: string;
  ballotpedia?: string;
  knowwho_pid?: string;
  committee_id?: string;
}

export interface History {
  history_id: number;
  bill_id?: string;
  date?: string;
  chamber?: string;
  sequence?: number;
  action?: string;
}

export interface RollCall {
  roll_call_id: string;
  bill_id?: string;
  date?: string;
  chamber?: string;
  description?: string;
  yea?: number;
  nay?: number;
  nv?: number;
  absent?: number;
  total?: number;
}

export interface Vote {
  vote_id: number;
  roll_call_id?: string;
  people_id?: string;
  vote?: string;
  vote_desc?: string;
}

export interface Sponsor {
  sponsor_id: number;
  bill_id?: string;
  people_id?: string;
  position?: string;
  has_bill_id?: boolean;
}

export interface Document {
  id: number;
  content?: string;
  metadata?: Record<string, any>;
  embedding?: any; // Vector embedding type
}

export interface DocumentLeg {
  document_id: string;
  bill_id?: string;
  document_type?: string;
  document_size?: number;
  document_mime?: string;
  document_desc?: string;
  url?: string;
  state_link?: string;
}

export interface ChatHistory {
  id: number;
  session_id: string;
  message: Record<string, any>;
}

// 🔗 Relationship Types for Joins

export interface BillWithSponsors extends Bill {
  sponsors?: (Sponsor & {
    person?: Person;
  })[];
}

export interface BillWithHistory extends Bill {
  history?: History[];
}

export interface BillWithVotes extends Bill {
  rollcalls?: (RollCall & {
    votes?: (Vote & {
      person?: Person;
    })[];
  })[];
}

export interface PersonWithVotes extends Person {
  votes?: (Vote & {
    rollcall?: RollCall & {
      bill?: Bill;
    };
  })[];
}

export interface PersonWithSponsorship extends Person {
  sponsored_bills?: (Sponsor & {
    bill?: Bill;
  })[];
}

// 📊 Analytics Types

export interface VotingPattern {
  people_id: string;
  person_name: string;
  party: string;
  total_votes: number;
  yea_votes: number;
  nay_votes: number;
  not_voting: number;
  absent_votes: number;
  voting_percentage: number;
}

export interface BillProgress {
  bill_id: string;
  bill_number: string;
  title: string;
  current_status: string;
  days_since_introduction: number;
  total_actions: number;
  sponsor_count: number;
  committee: string;
}

export interface PartyVotingSummary {
  party: string;
  total_members: number;
  average_voting_rate: number;
  bills_sponsored: number;
  bills_co_sponsored: number;
}

// 🔍 Search and Filter Types

export interface BillFilters {
  status?: string[];
  committee?: string[];
  party?: string[];
  date_range?: {
    start: string;
    end: string;
  };
  search_term?: string;
  session_id?: number;
}

export interface PersonFilters {
  party?: string[];
  role?: string[];
  state?: string[];
  committee?: string[];
  search_term?: string;
}

export interface VoteFilters {
  bill_id?: string;
  people_id?: string;
  chamber?: string[];
  vote_type?: string[];
  date_range?: {
    start: string;
    end: string;
  };
}

// 📈 Dashboard Summary Types

export interface DashboardStats {
  total_bills: number;
  active_bills: number;
  bills_passed: number;
  bills_failed: number;
  total_legislators: number;
  recent_votes: number;
  user_tracked_bills: number;
}

export interface RecentActivity {
  type: 'bill_action' | 'vote' | 'sponsorship' | 'committee';
  bill_id?: string;
  bill_title?: string;
  person_name?: string;
  action_description: string;
  date: string;
}

// 🎯 User Interaction Types

export interface UserBillTracking {
  user_id: string;
  bill_id: string;
  tracked_since: string;
  notifications_enabled: boolean;
  notes?: string;
}

export interface UserLegislatorFollow {
  user_id: string;
  people_id: string;
  followed_since: string;
  notification_types: string[];
}

// 🔧 API Response Types

export interface BillListResponse {
  bills: Bill[];
  total_count: number;
  page: number;
  per_page: number;
  filters_applied: BillFilters;
}

export interface PersonListResponse {
  people: Person[];
  total_count: number;
  page: number;
  per_page: number;
  filters_applied: PersonFilters;
}

export interface VoteHistoryResponse {
  votes: (Vote & {
    rollcall?: RollCall;
    bill?: Bill;
  })[];
  summary: {
    total_votes: number;
    yea_count: number;
    nay_count: number;
    not_voting_count: number;
    absent_count: number;
  };
}

// 🚨 Error Types

export interface DatabaseError {
  message: string;
  code?: string;
  details?: string;
  hint?: string;
}

export interface ApiError {
  error: string;
  message: string;
  status_code: number;
  timestamp: string;
}