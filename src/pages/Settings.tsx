import { useState } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Switch } from "../components/ui/switch";
import { Checkbox } from "../components/ui/checkbox";
import { Label } from "../components/ui/label";
import { Separator } from "../components/ui/separator";
import { 
  Bell, 
  Mail, 
  Shield, 
  Trash2, 
  Key, 
  Settings as SettingsIcon,
  AlertTriangle
} from "lucide-react";

const Settings = () => {
  const [billAlerts, setBillAlerts] = useState(true);
  const [aiReportAlerts, setAiReportAlerts] = useState(false);
  const [weeklyDigest, setWeeklyDigest] = useState(true);

  const handleChangePassword = () => {
    console.log("Change password triggered");
    // Will implement password change functionality
  };

  const handleDeleteAccount = () => {
    console.log("Delete account triggered");
    // Will implement account deletion functionality
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
              <span className="text-gray-900">Settings</span>
            </li>
          </ol>
        </nav>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
          <p className="text-gray-600">Manage your account preferences and security settings</p>
        </div>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notification Settings
            </CardTitle>
            <CardDescription>
              Configure how and when you receive notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Bill Alerts */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="bill-alerts" className="text-base font-medium">
                  Bill Alerts
                </Label>
                <p className="text-sm text-gray-500">
                  Get notified when tracked bills have updates or status changes
                </p>
              </div>
              <Switch
                id="bill-alerts"
                checked={billAlerts}
                onCheckedChange={setBillAlerts}
              />
            </div>

            <Separator />

            {/* AI Report Alerts */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="ai-report-alerts" className="text-base font-medium">
                  AI Report Alerts
                </Label>
                <p className="text-sm text-gray-500">
                  Receive notifications when AI analysis reports are ready
                </p>
              </div>
              <Switch
                id="ai-report-alerts"
                checked={aiReportAlerts}
                onCheckedChange={setAiReportAlerts}
              />
            </div>
          </CardContent>
        </Card>

        {/* Email Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Email Preferences
            </CardTitle>
            <CardDescription>
              Control the emails you receive from ShadowCongress
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="weekly-digest"
                checked={weeklyDigest}
                onCheckedChange={setWeeklyDigest}
              />
              <Label htmlFor="weekly-digest" className="text-base font-medium">
                Send weekly digest
              </Label>
            </div>
            <p className="text-sm text-gray-500 mt-2 ml-6">
              Receive a weekly summary of your tracked bills and legislative activity
            </p>
          </CardContent>
        </Card>

        {/* Account Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Account Security
            </CardTitle>
            <CardDescription>
              Manage your account security and authentication settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              variant="outline" 
              className="justify-start w-full md:w-auto"
              onClick={handleChangePassword}
            >
              <Key className="h-4 w-4 mr-2" />
              Change Password
            </Button>
            
            <div className="text-sm text-gray-500">
              Last password change: Never
            </div>
          </CardContent>
        </Card>

        {/* Account Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SettingsIcon className="h-5 w-5" />
              Account Management
            </CardTitle>
            <CardDescription>
              Manage your account data and preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button variant="outline" className="justify-start">
                Download My Data
              </Button>
              <Button variant="outline" className="justify-start">
                Export Settings
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Danger Zone
            </CardTitle>
            <CardDescription>
              Irreversible and destructive actions for your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-red-800">Delete Account</h4>
                    <p className="text-sm text-red-600 mt-1">
                      Permanently delete your account and all associated data. This action cannot be undone.
                    </p>
                  </div>
                  <Button 
                    variant="destructive" 
                    onClick={handleDeleteAccount}
                    className="ml-4"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Account
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Changes Button */}
        <div className="flex justify-end">
          <Button>
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Settings;