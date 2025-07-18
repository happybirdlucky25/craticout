import { useState } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Badge } from "../components/ui/badge";
import { Camera, User, Mail, Calendar, Shield } from "lucide-react";

const Profile = () => {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  
  // Mock user data - in real app this would come from your auth/user store
  const user = {
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    joinDate: "January 2024",
    subscriptionStatus: "Premium", // or "Free"
    lastActive: "2 hours ago"
  };

  const handleAvatarChange = () => {
    // Placeholder for file picker - will integrate with edge function
    console.log("Avatar change triggered - will implement edge function integration");
    // For demo purposes, you could set a placeholder image
    // setAvatarUrl("https://placeholder-avatar-url.com");
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-3xl mx-auto p-6 space-y-6">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <ol className="flex items-center space-x-2 text-sm text-gray-500">
            <li>
              <a href="/" className="hover:text-gray-700">Dashboard</a>
            </li>
            <li className="flex items-center">
              <span className="mx-2">/</span>
              <span className="text-gray-900">Profile</span>
            </li>
          </ol>
        </nav>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile</h1>
          <p className="text-gray-600">Manage your account settings and preferences</p>
        </div>

        {/* Profile Overview Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Account Overview
            </CardTitle>
            <CardDescription>
              Your account information and subscription status
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar Section */}
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={avatarUrl || undefined} alt="Profile picture" />
                  <AvatarFallback className="text-lg">
                    {user.firstName[0]}{user.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="sm"
                  variant="outline"
                  className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
                  onClick={handleAvatarChange}
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-1">
                <Button variant="outline" onClick={handleAvatarChange}>
                  Change Photo
                </Button>
                <p className="text-sm text-gray-500">
                  JPG, PNG or GIF. Max size 2MB.
                </p>
              </div>
            </div>

            {/* User Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Full Name</label>
                  <div className="mt-1 p-3 bg-gray-50 border rounded-md">
                    {user.firstName} {user.lastName}
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email Address
                  </label>
                  <div className="mt-1 p-3 bg-gray-50 border rounded-md">
                    {user.email}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Member Since
                  </label>
                  <div className="mt-1 p-3 bg-gray-50 border rounded-md">
                    {user.joinDate}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Subscription Status
                  </label>
                  <div className="mt-1 flex items-center gap-2">
                    <Badge variant={user.subscriptionStatus === "Premium" ? "default" : "secondary"}>
                      {user.subscriptionStatus}
                    </Badge>
                    {user.subscriptionStatus === "Free" && (
                      <Button variant="link" size="sm" className="p-0 h-auto">
                        Upgrade to Premium
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Stats Card */}
        <Card>
          <CardHeader>
            <CardTitle>Account Activity</CardTitle>
            <CardDescription>
              Your recent activity and usage statistics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">0</div>
                <div className="text-sm text-blue-600">Bills Tracked</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">0</div>
                <div className="text-sm text-green-600">Legislators Followed</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">0</div>
                <div className="text-sm text-purple-600">Reports Generated</div>
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-500">
              Last active: {user.lastActive}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions Card */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common account management tasks
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Button variant="outline" className="justify-start">
                Update Account Settings
              </Button>
              <Button variant="outline" className="justify-start">
                Manage Notifications
              </Button>
              <Button variant="outline" className="justify-start">
                View Billing History
              </Button>
              <Button variant="outline" className="justify-start">
                Download Data Export
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;