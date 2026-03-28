"use client";

import React, { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
import { CircleUser, Copy } from "lucide-react";
import { Toaster, toast } from "sonner";
import { getProfile } from "@/lib/api/user";
import { useRouter } from "next/navigation";
import Navbar from "@/app/components/Navbar";

// --- Sub-components remain the same ---

function BiometricsSection({ data, totalCalories }) {
  return (
    <div className="border border-white/10 rounded-xl p-6 bg-slate-900/40 backdrop-blur-md shadow-lg h-full">
      <h2 className="mb-4 text-xl font-bold text-white">Biometrics & Goals</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
        <div className="space-y-2">
          <p className="text-slate-300">
            <span className="font-semibold text-white">Height:</span> {data.height}
          </p>
          <p className="text-slate-300">
            <span className="font-semibold text-white">Weight:</span> {data.weight}
          </p>
          <p className="text-slate-300">
            <span className="font-semibold text-white">Goal:</span> {data.goal}
          </p>
          <p className="text-slate-300">
            <span className="font-semibold text-white">Activity Level:</span> {data.activityLevel}
          </p>
          <p className="text-slate-300">
            <span className="font-semibold text-white">Age:</span> {data.age}
          </p>
        </div>

        {/* Total Calories Display */}
        <div className="bg-blue-500/10 rounded-xl p-6 border border-blue-500/20 flex flex-col justify-center">
          <p className="font-semibold text-blue-300">Total Calories:</p>
          <p className="text-4xl font-black text-blue-400 mt-2">{totalCalories}</p>
          <p className="text-xs text-blue-200/50 mt-3 leading-relaxed">
            (Here we will display the total calories the user needs to eat in a day in realtime)
          </p>
        </div>
      </div>
    </div>
  );
}

function OtherDetailsSection({ data }) {
  return (
    <div className="border border-white/10 rounded-xl p-6 bg-slate-900/40 backdrop-blur-md shadow-lg h-full">
      <h2 className="mb-1 text-xl font-bold text-white">Other Details</h2>
      <p className="text-sm text-slate-500 mb-6">(Note: this user can't edit)</p>
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <p className="text-slate-300">
            <span className="font-semibold text-white">Trainer Name:</span>{" "}
            {data.trainerName || "N/A"}
          </p>
          <p className="text-slate-300">
            <span className="font-semibold text-white">Trainer ID:</span>{" "}
            {data.trainerId || "N/A"}
          </p>
        </div>
        <p className="text-slate-300">
          <span className="font-semibold text-white">Joined Date:</span> {data.joinedDate}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <p className="text-slate-300">
            <span className="font-semibold text-white">Plan:</span> {data.plan}
          </p>
          <p className="text-slate-300">
            <span className="font-semibold text-white">Shift:</span> {data.shift}
          </p>
        </div>
        <p className="text-slate-300">
          <span className="font-semibold text-white">Membership Ending Date:</span>{" "}
          {data.membershipEndingDate}
        </p>
      </div>
    </div>
  );
}

function ProfileHeader({
  name,
  email,
  phone,
  username,
  workoutPlan,
  onEditProfile,
}) {
  return (

    <div className="border border-white/10 rounded-xl p-6 bg-slate-900/40 backdrop-blur-md shadow-lg mb-6">
      <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
        {/* Profile Picture */}
        <Avatar className="h-28 w-28 border-2 border-blue-400/30 ring-4 ring-blue-500/10">
          <AvatarImage src={null} alt={name} />
          <AvatarFallback className="bg-slate-800">
            <CircleUser className="h-20 w-20 text-blue-400" />
          </AvatarFallback>
        </Avatar>

        {/* User Info */}
        <div className="flex-1 space-y-3 text-center md:text-left w-full pt-1">
          <div>
            <p className="text-slate-300 text-lg">
              <span className="font-bold text-white">Name:</span> {name}
            </p>
            <p className="text-slate-300">
              <span className="font-bold text-white">Email:</span> {email}
            </p>
            <p className="text-slate-300">
              <span className="font-bold text-white">Number:</span> {phone}
            </p>
            <a href="#" className="text-blue-400 hover:text-blue-300 text-sm font-semibold hover:underline inline-block mt-1">
              reset Password (Link)
            </a>
          </div>
        </div>

        {/* Username and Workout Plan */}
        <div className="space-y-4 text-center md:text-right w-full md:w-auto pt-1">
          <div className="space-y-1">
            <p className="text-slate-300">
              <span className="font-bold text-white">Username:</span> {username}
            </p>
            <p className="text-slate-300">
              <span className="font-bold text-white">Workout plan:</span> <span className="text-blue-400">{workoutPlan}</span>
            </p>
          </div>
          <Button
            onClick={onEditProfile}
            className="w-full md:w-40 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 px-6 rounded-lg transition-colors shadow-lg shadow-blue-500/20"
          >
            Edit Profile
          </Button>
        </div>
      </div>
    </div>
  );

}

function ReferralSection({ referralLink }) {
  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    toast.success("Referral link copied to clipboard!");
  };

  return (
    <div className="border border-white/10 rounded-xl p-6 bg-slate-900/40 backdrop-blur-md shadow-lg mt-6">
      <h2 className="mb-1 text-xl font-bold text-white">Referral</h2>
      <p className="text-sm text-slate-500 mb-6">(Note: this user can't edit)</p>
      <div className="space-y-6">
        <p className="text-slate-300 leading-relaxed font-medium">
          Earn <span className="text-blue-400 font-bold">1 month</span> of membership if your friend joined with your referral and took 6 months or 1 year of membership
        </p>
        <div className="flex flex-col sm:flex-row items-end gap-3 bg-slate-800/50 p-4 rounded-xl border border-white/5">
          <div className="flex-1 w-full">
            <p className="font-bold text-sm text-slate-400 mb-2 uppercase tracking-tight">Demo Link:</p>
            <div className="bg-slate-900/50 rounded-lg border border-white/10 p-3 break-all text-slate-300 font-mono text-sm shadow-inner">
              {referralLink}
            </div>
          </div>
          <Button
            onClick={copyToClipboard}
            className="bg-slate-800 border border-white/10 hover:bg-slate-700 p-3 h-12 w-12 flex items-center justify-center rounded-lg shadow-sm transition-all active:scale-95 group"
          >
            <Copy className="h-5 w-5 text-slate-400 group-hover:text-blue-400" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// --- Main Page Component ---

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getProfile();
        setProfile(data);
      } catch (err) {
        console.error(err);
        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
          router.push("/auth/login");
          return;
        }
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const userLinks = [
    { name: "Home", href: "/user", icon: "🏠" },
    { name: "Workouts", href: "/user/workout", icon: "💪" },
    { name: "Activities", href: "/user/activities", icon: "🏃" },
    { name: "Explore", href: "/user/explore", icon: "🔍" },
    { name: "Exercises", href: "/user/exercises", icon: "🏋️" },
    { name: "Diet", href: "/user/diet", icon: "🥗" },
  ];

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-600 font-medium">Loading...</div>;

  const biometricsData = {
    height: profile?.height ? `${profile.height} cm` : "--",
    weight: profile?.weight ? `${profile.weight} kg` : "--",
    goal: profile?.goal || "--",
    activityLevel: profile?.activityLevel?.replace(/_/g, " ") || "--",
    age: profile?.age || "--"
  };

  const otherData = {
    trainerName: profile?.trainerName,
    trainerId: profile?.trainerId,
    joinedDate: profile?.startDate || "N/A",
    plan: profile?.plan || "N/A",
    shift: profile?.shiftTimings || "General",
    membershipEndingDate: profile?.endDate || "N/A"
  };

  return (
    <div className="bg-transparent min-h-screen pb-16 font-sans text-white">
      <div className="max-w-6xl mx-auto px-4 md:px-6 mt-10">
        <ProfileHeader
          name={profile?.name || "User"}
          email={profile?.email || ""}
          phone={profile?.phone || "N/A"}
          username={profile?.username || ""}
          workoutPlan={profile?.workoutPlanName || "Push Pull Legs"}
          onEditProfile={() => router.push("/profile/edit")}
        />

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="w-full lg:w-2/3">
            <BiometricsSection
              data={biometricsData}
              totalCalories={profile?.dailyCalorieTarget || 2500}
            />
          </div>
          <div className="w-full lg:w-1/3">
            <OtherDetailsSection
              data={otherData}
            />
          </div>
        </div>

        <ReferralSection referralLink={`https://gymbross.com/join?ref=${profile?.userCode || "CODE123"}`} />
      </div>

      <Toaster position="bottom-center" richColors />
    </div>
  );
}
