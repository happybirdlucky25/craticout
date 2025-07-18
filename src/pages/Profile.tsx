import { Layout } from "@/components/layout/Layout";
import { User, MessageSquare, Settings, LogOut, LucideIcon } from "lucide-react";
import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import type { User as SupabaseUser } from "@supabase/supabase-js";

// --- Data Definitions (for a data-driven UI) ---

// Define the shape of an action item
interface ActionItem {
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
  buttonText: string;
  variant: 'default' | 'danger';
  onClick: () => void; // Placeholder for future functionality
}




// --- Reusable Sub-components (in a real app, each would be in its own file) ---

/**
 * ProfileHeader: Displays the main user avatar and title section.
 */
const ProfileHeader = () => (
  <header className="flex items-center mb-8">
    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
      <User className="w-8 h-8 text-gray-600" />
    </div>
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">Profile</h1>
      <p className="text-gray-600">Manage your Shadow Congress account</p>
    </div>
  </header>
);

/**
 * ActionCard: A versatile card for user actions.
 * It supports different color schemes via the 'variant' prop.
 */
interface ActionCardProps extends Omit<ActionItem, 'id'> {}

const ActionCard = ({ icon: Icon, title, description, buttonText, onClick, variant }: ActionCardProps) => {
  // Define styles based on the variant
  const theme = {
    default: {
      bg: "bg-gray-50",
      iconColor: "text-gray-600",
      titleColor: "text-gray-900",
      textColor: "text-gray-600",
      buttonClasses: "bg-black text-white hover:bg-gray-800",
    },
    danger: {
      bg: "bg-red-50",
      iconColor: "text-red-600",
      titleColor: "text-red-900",
      textColor: "text-red-700",
      buttonClasses: "bg-red-600 text-white hover:bg-red-700",
    },
  };

  const currentTheme = theme[variant];

  return (
    <section className={`${currentTheme.bg} rounded-lg p-6 flex flex-col`}>
      <div className="flex items-center mb-4">
        <Icon className={`w-5 h-5 ${currentTheme.iconColor} mr-2`} />
        <h3 className={`text-lg font-medium ${currentTheme.titleColor}`}>{title}</h3>
      </div>
      <p className={`${currentTheme.textColor} mb-4 flex-grow`}>{description}</p>
      <button
        onClick={onClick}
        className={`px-4 py-2 rounded transition-colors self-start ${currentTheme.buttonClasses}`}
      >
        {buttonText}
      </button>
    </section>
  );
};


/**
 * InfoCard: Displays key-value information for the user's account.
 */
interface InfoCardProps {
    title: string;
    data: Record<string, string>;
}
const InfoCard = ({ title, data }: InfoCardProps) => (
    <section className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
        <div className="space-y-3">
            {Object.entries(data).map(([key, value]) => (
                <div key={key}>
                    <label className="block text-sm font-medium text-gray-700">{key}</label>
                    <p className="text-gray-900">{value}</p>
                </div>
            ))}
        </div>
    </section>
);


// --- Main Page Component ---
export default function Profile() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Get current user
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };

    getCurrentUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const handleChatHistory = () => {
    navigate('/history');
  };

  const handlePreferences = () => {
    navigate('/preferences');
  };

  // Array of actions with real functionality
  const actionItems: ActionItem[] = [
    {
      id: 'history',
      icon: MessageSquare,
      title: "Chat History",
      description: "View your previous conversations with Shadow Congress AI.",
      buttonText: "View History",
      variant: 'default',
      onClick: handleChatHistory,
    },
    {
      id: 'preferences',
      icon: Settings,
      title: "Preferences",
      description: "Customize your Shadow Congress experience.",
      buttonText: "Manage Preferences",
      variant: 'default',
      onClick: handlePreferences,
    },
    {
      id: 'signout',
      icon: LogOut,
      title: "Sign Out",
      description: "Sign out of your Shadow Congress account.",
      buttonText: "Sign Out",
      variant: 'danger',
      onClick: handleSignOut,
    },
  ];

  // Real user account information
  const accountInfo = {
    Email: user?.email || 'Not available',
    "Member Since": user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long' 
    }) : 'Unknown',
    "User ID": user?.id || 'Not available',
  };

  if (loading) {
    return (
      <Layout>
        <main className="min-h-screen bg-gray-100 p-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm p-8">
              <div className="flex items-center justify-center h-64">
                <div className="text-gray-600">Loading profile...</div>
              </div>
            </div>
          </div>
        </main>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <main className="min-h-screen bg-gray-100 p-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm p-8">
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="text-gray-600 mb-4">Please sign in to view your profile.</div>
                  <button 
                    onClick={() => navigate('/auth')}
                    className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
                  >
                    Sign In
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </Layout>
    );
  }

  return (
    <Layout>
      <main className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <ProfileHeader />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                <InfoCard title="Account Information" data={accountInfo} />
                <ActionCard {...actionItems.find(item => item.id === 'signout')!} />
              </div>
              
              {/* Right Column */}
              <div className="space-y-6">
                 {actionItems
                    .filter(item => item.id !== 'signout')
                    .map(item => <ActionCard key={item.id} {...item} />)
                 }
              </div>
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
}