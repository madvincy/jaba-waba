"use client";

import { useEffect, useState } from "react";
import { getUserProfile, updateUserProfile } from "@/lib/api/profile";
import { useAppDispatch, useAppSelector } from "@/lib/redux-hooks";
import { updateUser } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function ProfilePage() {
  const supabase = createClient();  // ← add this 
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.shop.user);
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    deliveryAddress: "",
    location: "",
  });
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  // useEffect(() => {
  //   if (user) {
  //     setProfileData({
  //       name: user.name || "",
  //       email: user.email || "",
  //       phone: user.phone || "",
  //       deliveryAddress: user.deliveryAddress || "",
  //       location: user.location || "",
  //     });
  //   }
  // }, [user]);

  useEffect(() => {
    let isMounted = true;

    async function loadProfile() {
      // getSession reads from cookie — fast, no network
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        setIsFetching(false);
        return;
      }

      const profile = await getUserProfile(supabase, session.user.id);
      console.log("profile loaded:", profile);

      if (profile && isMounted) {
        setProfileData({
          name: profile.name || "",
          email: profile.email || "",
          phone: profile.phone || "",
          deliveryAddress: profile.delivery_address || "",
          location: profile.location || "",
        });
      }
      if (isMounted) setIsFetching(false);
    }

    loadProfile();

    return () => { isMounted = false; };
  }, []);  // ← run once on mount

  if (isFetching) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setIsSaved(false);
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const updated = await updateUserProfile(supabase, user.id, {
        name: profileData.name,
        phone: profileData.phone,
        delivery_address: profileData.deliveryAddress,
        location: profileData.location,
      });

      if (!updated) throw new Error("Failed to save profile");

      dispatch(
        updateUser({
          name: profileData.name,
          phone: profileData.phone,
          delivery_address: profileData.deliveryAddress,
          location: profileData.location,
        }),
      );

      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (error) {
      console.error("Failed to save profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Not Logged In</CardTitle>
            <CardDescription>Please log in to view your profile</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/auth/signin">
              <Button className="w-full bg-green-600 hover:bg-green-700">
                Go to Login
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Back Button */}
        <Link href="/" className="flex items-center gap-2 text-green-600 hover:text-green-700 mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        {/* Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">My Profile</CardTitle>
            <CardDescription className="text-sm text-slate-600">
              Update your account information and delivery preferences
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Full Name
              </Label>
              <Input
                id="name"
                name="name"
                value={profileData.name}
                onChange={handleInputChange}
                placeholder="Enter your full name"
                className="w-full"
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email Address
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={profileData.email}
                onChange={handleInputChange}
                placeholder="Enter your email"
                className="w-full"
                disabled
              />
              <p className="text-xs text-slate-500">Email cannot be changed</p>
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium">
                Phone Number
              </Label>
              <Input
                id="phone"
                name="phone"
                value={profileData.phone}
                onChange={handleInputChange}
                placeholder="Enter your phone number (e.g., +254712345678)"
                className="w-full"
              />
            </div>

            {/* Delivery Address */}
            <div className="space-y-2">
              <Label htmlFor="deliveryAddress" className="text-sm font-medium">
                Delivery Address
              </Label>
              <Textarea
                id="deliveryAddress"
                name="deliveryAddress"
                value={profileData.deliveryAddress}
                onChange={handleInputChange}
                placeholder="Enter your delivery address (exact location)"
                className="w-full min-h-[100px]"
              />
            </div>

            {/* Location / Area */}
            <div className="space-y-2">
              <Label htmlFor="location" className="text-sm font-medium">
                Area / Location
              </Label>
              <Input
                id="location"
                name="location"
                value={profileData.location}
                onChange={handleInputChange}
                placeholder="e.g., Westlands, Karen, Kilimani"
                className="w-full"
              />
            </div>

            {/* Save Status */}
            {isSaved && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                ✓ Profile saved successfully!
              </div>
            )}

            {/* Account Type Badge */}
            <div className="pt-4 border-t border-slate-200">
              <p className="text-xs text-slate-600 mb-2">Account Type</p>
              <div className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                {user.role || "Customer"}
              </div>
            </div>

            {/* Save Button */}
            <div className="flex gap-3 pt-6">
              <Button
                onClick={handleSaveProfile}
                disabled={isLoading}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              >
                <Save className="w-4 h-4 mr-2" />
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Account Security Section */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Account Security</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-slate-600">
              To change your password or manage connected accounts, please visit account settings.
            </p>
            <Button variant="outline" className="w-full">
              Manage Account Settings
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
