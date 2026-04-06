import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Bell, Lock, Palette, Globe, Database, Smartphone, MapPin } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "next-themes";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useTranslation } from "react-i18next";

import { useLanguage, SUPPORTED_LANGUAGES, getLanguageLabel } from "@/hooks/use-language";
import { INDIAN_STATES, getCitiesByState } from "@/data/locations";

const Settings = () => {
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const { t } = useTranslation();
  
  // Notification settings state
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [newProperties, setNewProperties] = useState(true);
  const [priceDrops, setPriceDrops] = useState(true);
  
  // Privacy settings state
  const [profileVisibility, setProfileVisibility] = useState(true);
  const [showPhone, setShowPhone] = useState(false);
  
  // Language state
  const { language, setLanguage } = useLanguage();
  
  // Location preference state
  const [selectedState, setSelectedState] = useState<string>("");
  const [cities, setCities] = useState<string[]>([]);
  
  // Change password dialog state
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleStateChange = (state: string) => {
    setSelectedState(state);
    setCities(getCitiesByState(state));
    toast({
      title: "Location Updated",
      description: `State changed to ${state}`,
    });
  };
  
  const handleSettingChange = (setting: string, value: boolean) => {
    toast({
      title: "Setting Updated",
      description: `${setting} ${value ? "enabled" : "disabled"}`,
    });
  };
  
  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({
        title: "Error",
        description: "Please fill in all password fields",
        variant: "destructive",
      });
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match",
        variant: "destructive",
      });
      return;
    }
    
    if (newPassword.length < 8) {
      toast({
        title: "Error",
        description: "Password must be at least 8 characters",
        variant: "destructive",
      });
      return;
    }
    
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Password Changed",
      description: "Your password has been updated successfully",
    });
    
    setIsPasswordDialogOpen(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };
  
  const handleLanguageChange = (value: string) => {
    setLanguage(value);
    toast({
      title: "Language Updated",
      description: `Language changed to ${getLanguageLabel(value)}`,
    });
  };
  
  const handleClearCache = () => {
    toast({
      title: "Cache Cleared",
      description: "12.4 MB of cache has been cleared successfully",
    });
  };
  
  const handleDownloadData = () => {
    toast({
      title: "Download Started",
      description: "Your data export is being prepared",
    });
  };
  
  const handleDeleteAccount = () => {
    toast({
      title: "Delete Account",
      description: "Account deletion requires confirmation",
      variant: "destructive",
    });
  };
  return (
    <div className="min-h-screen bg-background p-4 space-y-6 pb-24">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-foreground mb-6">{t("settings.title")}</h1>

        {/* Notifications Settings */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
            <CardDescription>Manage your notification preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="push-notifications" className="flex-1">
                <div className="font-medium">Push Notifications</div>
                <div className="text-sm text-muted-foreground">Receive push notifications on your device</div>
              </Label>
              <Switch 
                id="push-notifications" 
                checked={pushNotifications}
                onCheckedChange={(checked) => {
                  setPushNotifications(checked);
                  handleSettingChange("Push Notifications", checked);
                }}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <Label htmlFor="email-notifications" className="flex-1">
                <div className="font-medium">Email Notifications</div>
                <div className="text-sm text-muted-foreground">Receive property updates via email</div>
              </Label>
              <Switch 
                id="email-notifications" 
                checked={emailNotifications}
                onCheckedChange={(checked) => {
                  setEmailNotifications(checked);
                  handleSettingChange("Email Notifications", checked);
                }}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <Label htmlFor="new-properties" className="flex-1">
                <div className="font-medium">New Properties</div>
                <div className="text-sm text-muted-foreground">Get notified about new listings</div>
              </Label>
              <Switch 
                id="new-properties" 
                checked={newProperties}
                onCheckedChange={(checked) => {
                  setNewProperties(checked);
                  handleSettingChange("New Properties", checked);
                }}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <Label htmlFor="price-drops" className="flex-1">
                <div className="font-medium">Price Drops</div>
                <div className="text-sm text-muted-foreground">Alert when saved properties reduce price</div>
              </Label>
              <Switch 
                id="price-drops" 
                checked={priceDrops}
                onCheckedChange={(checked) => {
                  setPriceDrops(checked);
                  handleSettingChange("Price Drops", checked);
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Privacy Settings */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Privacy & Security
            </CardTitle>
            <CardDescription>Control your privacy settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="profile-visibility" className="flex-1">
                <div className="font-medium">Profile Visibility</div>
                <div className="text-sm text-muted-foreground">Make your profile visible to others</div>
              </Label>
              <Switch 
                id="profile-visibility" 
                checked={profileVisibility}
                onCheckedChange={(checked) => {
                  setProfileVisibility(checked);
                  handleSettingChange("Profile Visibility", checked);
                }}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <Label htmlFor="show-phone" className="flex-1">
                <div className="font-medium">Show Phone Number</div>
                <div className="text-sm text-muted-foreground">Display your phone on listings</div>
              </Label>
              <Switch 
                id="show-phone" 
                checked={showPhone}
                onCheckedChange={(checked) => {
                  setShowPhone(checked);
                  handleSettingChange("Show Phone Number", checked);
                }}
              />
            </div>
            <Separator />
            <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full">
                  Change Password
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Change Password</DialogTitle>
                  <DialogDescription>
                    Enter your current password and choose a new one
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input
                      id="current-password"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input
                      id="new-password"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsPasswordDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleChangePassword}>
                    Change Password
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        {/* App Preferences */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              App Preferences
            </CardTitle>
            <CardDescription>Customize your app experience</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="dark-mode" className="flex-1">
                <div className="font-medium">Dark Mode</div>
                <div className="text-sm text-muted-foreground">Enable dark theme</div>
              </Label>
              <Switch 
                id="dark-mode" 
                checked={theme === "dark"}
                onCheckedChange={(checked) => {
                  setTheme(checked ? "dark" : "light");
                  handleSettingChange("Dark Mode", checked);
                }}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="font-medium">Language</div>
                <div className="text-sm text-muted-foreground">Choose your preferred language</div>
              </div>
              <Select value={language} onValueChange={handleLanguageChange}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>{lang.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Location Preferences */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Location Preferences
            </CardTitle>
            <CardDescription>Set your preferred location for property searches</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="font-medium">Preferred State</div>
                <div className="text-sm text-muted-foreground">Your default state for searches</div>
              </div>
              <Select value={selectedState} onValueChange={handleStateChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {INDIAN_STATES.map((state) => (
                    <SelectItem key={state} value={state}>{state}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="font-medium">Preferred City</div>
                <div className="text-sm text-muted-foreground">Your default city for searches</div>
              </div>
              <Select disabled={!selectedState}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={selectedState ? "Select city" : "Select state first"} />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {cities.map((city) => (
                    <SelectItem key={city} value={city}>{city}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Data & Storage */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Data & Storage
            </CardTitle>
            <CardDescription>Manage your app data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full justify-between" onClick={handleClearCache}>
              <span>Clear Cache</span>
              <span className="text-sm text-muted-foreground">12.4 MB</span>
            </Button>
            <Button variant="outline" className="w-full justify-between" onClick={handleDownloadData}>
              <span>Download My Data</span>
              <Smartphone className="h-4 w-4" />
            </Button>
            <Separator />
            <Button variant="destructive" className="w-full" onClick={handleDeleteAccount}>
              Delete Account
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
