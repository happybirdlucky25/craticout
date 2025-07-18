# 🏛️ Shadow Congress Database Schema

## 📊 Current Database Structure

Based on the Supabase types and existing configuration, here's your current database schema:

### **Bills Table** (`bills`)
```sql
CREATE TABLE bills (
  bill_id TEXT PRIMARY KEY,
  bill_number TEXT,
  change_hash TEXT,
  committee TEXT,
  committee_id TEXT,
  description TEXT,
  full_bill_text TEXT,
  last_action TEXT,
  last_action_date TEXT,
  session_id INTEGER,
  state_link TEXT,
  status TEXT,
  status_date TEXT,
  status_desc TEXT,
  title TEXT,
  url TEXT
);
```

**Purpose**: Stores congressional bills and legislative data
**Key Fields**:
- `bill_id`: Unique identifier for each bill
- `bill_number`: Official bill number (e.g., "HR-1234", "S-567")
- `title`: Human-readable bill title
- `description`: Bill summary/description
- `full_bill_text`: Complete bill text content
- `status`: Current status (e.g., "introduced", "passed", "failed")
- `last_action`: Most recent action taken on the bill
- `committee`: Assigned committee name

### **Chat Histories Table** (`n8n_chat_histories`)
```sql
CREATE TABLE n8n_chat_histories (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  user_id TEXT,
  session_id TEXT,
  message TEXT,
  response TEXT,
  metadata JSONB
);
```

**Purpose**: Stores user chat conversations with the AI
**Key Fields**:
- `user_id`: Links to authenticated user
- `session_id`: Groups messages into conversation sessions
- `message`: User's input message
- `response`: AI's response
- `metadata`: Additional data (context, sources, etc.)

## 🔗 Authentication Integration

The app uses **Supabase Auth** with the following user data:
- `user.id`: Unique user identifier
- `user.email`: User email address
- `user.created_at`: Account creation date
- `user.user_metadata`: Additional user profile data

## 🚀 Next Steps for Real Data Integration

### 1. **Complete Supabase CLI Setup**
```bash
# Get access token from: https://supabase.com/dashboard/account/tokens
supabase login --token YOUR_ACCESS_TOKEN

# Link to your project
supabase link --project-ref sjnhunrbzunwkfjivynl

# Pull remote schema
supabase db pull
```

### 2. **Create Missing Tables** (if needed)
Based on your app structure, you may want to add:

```sql
-- User preferences
CREATE TABLE user_preferences (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  bill_alerts BOOLEAN DEFAULT true,
  email_notifications BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Saved bills (user bookmarks)
CREATE TABLE saved_bills (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  bill_id TEXT REFERENCES bills(bill_id),
  saved_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, bill_id)
);

-- User activity tracking
CREATE TABLE user_activity (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  action_type TEXT, -- 'chat', 'bill_view', 'search', etc.
  target_id TEXT,   -- bill_id, search_term, etc.
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 3. **Data Mapping Plan**

#### **Bills Data**
- **Source**: Real congressional API (congress.gov, ProPublica, etc.)
- **Update Frequency**: Daily/Real-time
- **Key Mapping**:
  - Map official bill numbers to your `bill_number` field
  - Store full bill text in `full_bill_text`
  - Track status changes in `last_action` and `status`

#### **Chat Data**
- **Current**: Already integrated with Supabase edge functions
- **Enhancement**: Add conversation tagging, search functionality

#### **User Data**
- **Authentication**: ✅ Already working with Supabase Auth
- **Preferences**: Need to create `user_preferences` table
- **Activity**: Implement activity tracking for analytics

### 4. **API Integration Points**

#### **Congress.gov API**
```typescript
// Example API endpoints to integrate:
const congressAPI = {
  bills: 'https://api.congress.gov/v3/bill',
  members: 'https://api.congress.gov/v3/member',
  votes: 'https://api.congress.gov/v3/vote'
};
```

#### **ProPublica Congress API**
```typescript
// Alternative/supplementary data source:
const propublicaAPI = {
  members: 'https://api.propublica.org/congress/v1/117/house/members.json',
  votes: 'https://api.propublica.org/congress/v1/117/house/votes/recent.json'
};
```

### 5. **Environment Variables for Data Sources**

Add to your `.env.local`:
```env
# Congressional data APIs
VITE_CONGRESS_API_KEY=your_congress_gov_api_key
VITE_PROPUBLICA_API_KEY=your_propublica_api_key

# Data sync settings
VITE_DATA_SYNC_INTERVAL=3600000  # 1 hour in ms
```

### 6. **Real Data Implementation Checklist**

- [ ] **Setup Supabase CLI access**
- [ ] **Create additional database tables**
- [ ] **Implement bill data fetching from Congress API**
- [ ] **Set up data synchronization job**
- [ ] **Add user preference storage**
- [ ] **Implement bill bookmarking**
- [ ] **Add search functionality with real data**
- [ ] **Create activity tracking**
- [ ] **Add data caching strategy**

## 🔧 Development Workflow

1. **Local Development**: Use `supabase start` for local database
2. **Schema Changes**: Use `supabase db diff` to track changes
3. **Migrations**: Apply with `supabase db push`
4. **Data Seeding**: Create seed scripts for development data

## 🚨 Important Notes

- **No Mock Data**: ✅ Application is now ready for real data
- **Authentication**: ✅ Properly integrated with Supabase
- **API Structure**: ✅ Edge functions ready for congressional data
- **Database Schema**: ✅ Core tables defined and ready

Your Shadow Congress application is well-architected and ready for real congressional data integration!