import { useState, useRef, useEffect } from "react";
import { gsap } from "gsap";
import {
  User,
  Lock,
  GraduationCap,
  Mail,
  Camera,
  CheckCircle,
  AlertTriangle,
  Shield,
  Trash2,
  Save,
  Loader2,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { useVerification } from "@/hooks/useVerification";
import { toast } from "sonner";
import { getApiUrl } from "@/lib/api";

interface University {
  id: string;
  name: string;
}

export function SettingsView() {
  const { user, completeProfile, accessToken } = useAuth();
  const { submitVerification, isVerified, isPending } =
    useVerification();

  const [activeTab, setActiveTab] = useState<
    "profile" | "verification" | "account" | "privacy" | "security"
  >("profile");

  // Profile fields state
  const [fullName, setFullName] = useState(user?.first_name || "Alex Johnson");
  const [lastName, setLastName] = useState(user?.last_name || "");
  const [bio, setBio] = useState("");
  const [phone_number, setPhoneNumber] = useState(user?.phone_number || "");
  const [avatarPreview, setAvatarPreview] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Account settings state
  const [email, setEmail] = useState(
    user?.email || "alex.johnson@university.edu",
  );
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSavingAccount, setIsSavingAccount] = useState(false);

  // University state
  const [universities, setUniversities] = useState<University[]>([]);
  const [selectedUniversityId, setSelectedUniversityId] = useState("");
  const [isSubmittingOnboarding, setIsSubmittingOnboarding] = useState(false);
  const [uploadedIdImage, setUploadedIdImage] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Fetch universities for settings page dropdown
  useEffect(() => {
    const fetchUnis = async () => {
      try {
        const response = await fetch(getApiUrl("/api/v1/universities"));
        if (response.ok) {
          const data = await response.json();
          setUniversities(data);
          // Set initial selection if available
          if (data.length > 0) {
            setSelectedUniversityId(data[0].id);
          }
        }
      } catch (err) {
        console.error("Failed to load universities list:", err);
      }
    };
    fetchUnis();
  }, []);

  // GSAP animations for tab transitions and entry
  useEffect(() => {
    const ctx = gsap.context(() => {
      if (containerRef.current) {
        gsap.fromTo(
          containerRef.current.querySelectorAll(".settings-entry"),
          { opacity: 0, y: 15 },
          {
            opacity: 1,
            y: 0,
            duration: 0.4,
            stagger: 0.05,
            ease: "power2.out",
          },
        );
      }
    });
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (contentRef.current) {
        gsap.fromTo(
          contentRef.current,
          { opacity: 0, x: 10 },
          { opacity: 1, x: 0, duration: 0.35, ease: "power1.out" },
        );
      }
    });
    return () => ctx.revert();
  }, [activeTab]);

  // Handlers
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken) {
      toast.error("You must be logged in to update your profile.");
      return;
    }

    setIsSavingProfile(true);
    try {
      const formData = new FormData();
      formData.append("first_name", fullName);
      formData.append("last_name", lastName);
      formData.append("phone_number", phone_number);
      formData.append("bio", bio);
      if (avatarFile) {
        formData.append("avatar_url", avatarFile);
      }

      const res = await fetch(getApiUrl("/api/v1/profiles/me"), {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || "Failed to update profile");
      }

      toast.success("Profile updated successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to update profile");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSaveAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword && newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsSavingAccount(true);
    // Simulate API update
    setTimeout(() => {
      setIsSavingAccount(false);
      toast.success("Account settings updated!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }, 1000);
  };

  const handleUniversitySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUniversityId) {
      toast.error("Please select a university");
      return;
    }
    setIsSubmittingOnboarding(true);
    try {
      await completeProfile(selectedUniversityId);
      toast.success("University info updated successfully!");
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Failed to update university info.",
      );
    } finally {
      setIsSubmittingOnboarding(false);
    }
  };

  const handleUploadId = () => {
    // Simulate ID Card image upload selection
    const mockImage =
      "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=400&h=250&fit=crop";
    setUploadedIdImage(mockImage);
    toast.success("ID image uploaded successfully!");
  };

  const handleVerifySubmit = () => {
    if (uploadedIdImage) {
      submitVerification(uploadedIdImage);
      toast.success("Verification ID submitted for review!");
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  return (
    <div ref={containerRef} className="p-4 md:p-7 max-w-5xl mx-auto space-y-6">
      {/* Title */}
      <div className="settings-entry">
        <h1 className="text-2xl font-bold text-foreground">
          Dashboard Settings
        </h1>
        <p className="text-sm text-[#676767]">
          Manage your profile, security, and student credentials.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Navigation Tabs */}
        <div className="settings-entry md:col-span-1 flex flex-row md:flex-col gap-1 pb-2 md:pb-0 border-b md:border-b-0 border-transparent overflow-x-auto">
          <button
            onClick={() => setActiveTab("profile")}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${activeTab === "profile"
              ? "bg-[#1a1a1a] text-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-[#bb740a]/10"
              }`}
          >
            <User className="w-4 h-4 shrink-0" />
            <span>View/Edit Profile</span>
          </button>
          <button
            onClick={() => setActiveTab("verification")}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${activeTab === "verification"
              ? "bg-[#1a1a1a] text-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-[#bb740a]/10"
              }`}
          >
            <GraduationCap className="w-4 h-4 shrink-0" />
            <span>Student Verification</span>
          </button>
          <button
            onClick={() => setActiveTab("account")}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${activeTab === "account"
              ? "bg-[#1a1a1a] text-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-[#bb740a]/10"
              }`}
          >
            <Lock className="w-4 h-4 shrink-0" />
            <span>Account Settings</span>
          </button>
          <button
            onClick={() => setActiveTab("privacy")}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${activeTab === "privacy"
              ? "bg-[#1a1a1a] text-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-[#bb740a]/10"
              }`}
          >
            <Shield className="w-4 h-4 shrink-0" />
            <span>Privacy</span>
          </button>
          <button
            onClick={() => setActiveTab("security")}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${activeTab === "security"
              ? "bg-[#1a1a1a] text-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-[#bb740a]/10"
              }`}
          >
            <Lock className="w-4 h-4 shrink-0" />
            <span>Security</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div
          ref={contentRef}
          className="md:col-span-3 bg-[#0f0f0f] border-transparent rounded-2xl p-5 md:p-7 shadow-xl"
        >
          {/* PROFILE SETTINGS */}
          {activeTab === "profile" && (
            <form onSubmit={handleSaveProfile} className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  Profile Details
                </h2>
                <p className="text-xs text-muted-foreground">
                  This information will be shown publicly to other buyers and
                  sellers.
                </p>
              </div>

              {/* Avatar Update */}
              <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-xl bg-white/[0.02] border border-white/[0.03]">
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleAvatarFileChange}
                  className="hidden"
                />
                <div 
                  className="relative w-20 h-20 rounded-2xl overflow-hidden group bg-secondary/50 flex items-center justify-center cursor-pointer border border-white/[0.06]"
                  onClick={handleAvatarClick}
                >
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-8 h-8 text-muted-foreground" />
                  )}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity text-white text-[10px] font-medium">
                    <Camera className="w-4 h-4 mb-1" />
                    Upload
                  </div>
                </div>
                <div className="text-center sm:text-left space-y-1">
                  <h4 className="text-sm font-medium text-foreground">
                    Profile Picture
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Click the image to upload a new avatar.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2 text-xs border-white/10 hover:bg-[#bb740a]/10 hover:text-white"
                    onClick={handleAvatarClick}
                  >
                    Upload Image
                  </Button>
                </div>
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">
                      First Name
                    </label>
                    <Input
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="bg-secondary/40 border-white/[0.08] focus:outline-none focus:ring-1 focus:ring-[#bb740a] focus:border-[#bb740a] transition-all"
                      required
                    />
                    <label className="text-xs font-semibold text-muted-foreground">
                      Last Name
                    </label>
                    <Input
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="bg-secondary/40 border-white/[0.08] focus:outline-none focus:ring-1 focus:ring-[#bb740a] focus:border-[#bb740a] transition-all"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">
                      Phone Number
                    </label>
                    <Input
                      value={phone_number}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="bg-secondary/40 border-white/[0.08] focus:outline-none focus:ring-1 focus:ring-[#bb740a] focus:border-[#bb740a] transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">
                    Bio / Description
                  </label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={3}
                    className="w-full text-sm rounded-lg border border-white/[0.08] bg-secondary/40 p-3 text-foreground focus:outline-none focus:ring-1 focus:ring-[#bb740a] focus:border-[#bb740a] transition-all"
                    placeholder="Tell buyers and sellers a bit about yourself..."
                  />
                </div>
              </div>

              {/* Profile Ratings Statistics */}
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.03] grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Average Rating
                  </p>
                  <p className="text-lg font-bold text-[#e4b363] mt-1">★ 4.8</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Total Sales
                  </p>
                  <p className="text-lg font-bold text-foreground mt-1">24</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Member Since
                  </p>
                  <p className="text-sm font-semibold text-foreground mt-2">
                    Jan 2024
                  </p>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  disabled={isSavingProfile}
                  className="bg-[#bb740a] hover:bg-[#bb740a]/90 text-white rounded-xl px-5 h-11 font-medium transition-all"
                >
                  {isSavingProfile ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Profile Changes
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}

          {/* ACCOUNT & SECURITY */}
          {activeTab === "account" && (
            <form onSubmit={handleSaveAccount} className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  Account Credentials & Security
                </h2>
                <p className="text-xs text-muted-foreground">
                  Keep your email and password secure.
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5" /> Email Address
                  </label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-secondary/40 border-white/[0.08] focus:border-[#bb740a]"
                    readOnly={true}
                    disabled={true}
                    required
                  />
                </div>

                <div className="border-t border-white/[0.06] pt-5">
                  <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-[#bb740a]" /> Update
                    Password
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground">
                        Current Password
                      </label>
                      <Input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="••••••••"
                        className="bg-secondary/40 border-white/[0.08] focus:border-[#bb740a]"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground">
                        New Password
                      </label>
                      <Input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Min. 8 chars"
                        className="bg-secondary/40 border-white/[0.08] focus:border-[#bb740a]"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground">
                        Confirm Password
                      </label>
                      <Input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm password"
                        className="bg-secondary/40 border-white/[0.08] focus:border-[#bb740a]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/5 mt-6 space-y-3">
                <h4 className="text-sm font-semibold text-red-400 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" /> Danger Zone
                </h4>
                <p className="text-xs text-muted-foreground">
                  Once you delete your account, all listed items, messages, and
                  order history are permanently deleted.
                </p>
                <Button
                  type="button"
                  variant="destructive"
                  className="bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs px-4 h-9 cursor-pointer font-semibold transition-all"
                  onClick={() => {
                    const confirmDel = window.confirm(
                      "Are you sure you want to permanently delete your UniMarket account?",
                    );
                    if (confirmDel) toast.error("Account deletion requested.");
                  }}
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Delete Account
                </Button>
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  disabled={isSavingAccount}
                  className="bg-[#bb740a] hover:bg-[#bb740a]/90 text-white rounded-xl px-5 h-11 font-medium transition-all"
                >
                  {isSavingAccount ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving Settings...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Account Settings
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}

          {/* UNIVERSITY & VERIFICATION STATUS */}
          {activeTab === "verification" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  University & Verification
                </h2>
                <p className="text-xs text-muted-foreground">
                  Manage your university alignment and student verification
                  details.
                </p>
              </div>

              {/* Verification Status Card */}
              {/* <div className="p-5 rounded-2xl border bg-white/[0.01] border-white/[0.05] space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">
                      Current Verification Status
                    </p>
                    <div className="flex items-center gap-2">
                      {isVerified && (
                        <>
                          <Badge className="bg-[#177865] text-[#022420] font-bold flex items-center gap-1">
                            <CheckCircle className="w-3.5 h-3.5" /> Verified
                            Student
                          </Badge>
                          <span className="text-[10px] text-muted-foreground">
                            Exp: Dec 2026
                          </span>
                        </>
                      )}
                      {isPending && (
                        <Badge className="bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 font-bold flex items-center gap-1 animate-pulse">
                          <Clock className="w-3.5 h-3.5" /> Pending Review
                        </Badge>
                      )}
                      {isUnverified && (
                        <Badge className="bg-red-500/10 text-red-400 border border-red-500/20 font-bold flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" /> Unverified
                        </Badge>
                      )}
                    </div>
                  </div>

                  {isUnverified && (
                    <Button
                      size="sm"
                      onClick={handleUploadId}
                      className="bg-[#bb740a] hover:bg-[#bb740a]/90 text-white rounded-xl text-xs h-9 cursor-pointer transition-all"
                    >
                      <Upload className="w-3.5 h-3.5 mr-1" />
                      Mock ID Upload
                    </Button>
                  )}
                </div>

                <div className="border-t border-white/[0.06] pt-4 text-xs text-muted-foreground space-y-2">
                  <p>
                    • Verified status allows you to create selling listings and
                    directly message other students.
                  </p>
                  <p>
                    • Verification requires uploading a valid student ID card or
                    official university enrollment document.
                  </p>
                </div>
              </div> */}

              {/* ID Verification Form (if unverified or pending) */}
              {!isVerified && (
                <div className="p-4 rounded-xl border border-white/[0.06] bg-white/[0.01] space-y-4">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Shield className="w-4 h-4 text-[#bb740a]" /> Upload
                    Credentials
                  </h3>

                  {!uploadedIdImage ? (
                    <div
                      onClick={handleUploadId}
                      className="border-2 border-dashed border-white/[0.08] rounded-xl p-8 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary/50 transition-all bg-white/[0.01]"
                    >
                      <Camera className="w-7 h-7 text-muted-foreground mb-1" />
                      <p className="text-xs font-semibold text-foreground">
                        Click to upload student ID card image
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        Mock image gets populated automatically on click
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="relative rounded-xl overflow-hidden border border-white/[0.06]">
                        <img
                          src={uploadedIdImage}
                          alt="Uploaded card"
                          className="w-full h-32 object-cover opacity-80"
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <CheckCircle className="w-6 h-6 text-green-400" />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={handleVerifySubmit}
                          className="flex-1 bg-[#177865] hover:bg-[#177865]/90 text-white rounded-xl text-xs h-10 font-bold"
                        >
                          Submit ID for Review
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setUploadedIdImage(null)}
                          className="border-white/10 rounded-xl text-xs h-10"
                        >
                          Clear File
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* University Alignment Form */}
              <form
                onSubmit={handleUniversitySubmit}
                className="border-t border-white/[0.06] pt-5 space-y-4"
              >
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[#bb740a]" /> University
                  Association
                </h3>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground">
                    Associated University Campus
                  </label>
                  <select
                    value={selectedUniversityId}
                    onChange={(e) => setSelectedUniversityId(e.target.value)}
                    className="w-full h-11 text-sm rounded-lg border border-white/[0.08] bg-secondary/40 px-3 text-foreground focus:outline-none focus:ring-1 focus:ring-[#bb740a] focus:border-[#bb740a] transition-all"
                  >
                    {universities.length === 0 ? (
                      <option value="">
                        Carnegie Mellon University Africa
                      </option>
                    ) : (
                      universities.map((uni) => (
                        <option key={uni.id} value={uni.id}>
                          {uni.name}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={isSubmittingOnboarding}
                    className="bg-[#bb740a] hover:bg-[#bb740a]/90 text-white rounded-xl px-5 h-11 font-medium transition-all"
                  >
                    {isSubmittingOnboarding ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Updating University...
                      </>
                    ) : (
                      "Update Campus Association"
                    )}
                  </Button>
                </div>
              </form>

              {/* Simulated Student Card Preview (Show off beautiful premium aesthetics) */}
              <div className="border-t border-white/[0.06] pt-5">
                <h3 className="text-sm font-semibold text-foreground mb-4">
                  Digital Student ID Card Preview
                </h3>

                <div className="relative overflow-hidden rounded-2xl w-full max-w-sm aspect-[1.586] mx-auto border border-white/[0.12] p-5 shadow-[0_12px_24px_rgba(0,0,0,0.4)] bg-gradient-to-br from-[#1c1c1c] via-[#121212] to-[#0a0a0a]">
                  {/* Glowing background highlights */}
                  <div className="absolute -top-16 -right-16 w-32 h-32 rounded-full bg-[#bb740a]/10 blur-2xl" />
                  <div className="absolute -bottom-16 -left-16 w-32 h-32 rounded-full bg-[#177865]/10 blur-2xl" />

                  {/* Top Bar */}
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-1.5">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 64 64"
                        fill="none"
                      >
                        <circle cx="32" cy="32" r="30" fill="#0f1411" />
                        <path
                          d="M19 36c0-9 6-16 13-18 6-2 13 2 13 10 0 10-8 18-20 18-4 0-6-3-6-10Z"
                          fill="url(#umGrad)"
                        />
                        <defs>
                          <linearGradient
                            id="umGrad"
                            x1="0"
                            y1="0"
                            x2="1"
                            y2="1"
                          >
                            <stop offset="0%" stopColor="#2aa67f" />
                            <stop offset="100%" stopColor="#d8a24a" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <span className="text-[10px] font-bold tracking-wider text-foreground">
                        UNIMARKET CARD
                      </span>
                    </div>
                    <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest">
                      Active
                    </span>
                  </div>

                  {/* Middle Info */}
                  <div className="mt-8 flex gap-4 items-center">
                    <div className="w-14 h-14 rounded-xl overflow-hidden border border-white/10 bg-secondary/50 shrink-0">
                      {avatarPreview ? (
                        <img
                          src={avatarPreview}
                          alt="Avatar"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          <User className="w-6 h-6" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-extrabold text-foreground truncate">
                        {fullName}
                      </h4>
                      <p className="text-[10px] text-primary font-semibold tracking-wide truncate">
                        {universities.find((u) => u.id === selectedUniversityId)
                          ?.name || "Carnegie Mellon University Africa"}
                      </p>
                      <p className="text-[9px] text-muted-foreground mt-0.5">
                        Role: Student Merchant
                      </p>
                    </div>
                  </div>

                  {/* Bottom Verification Info */}
                  <div className="absolute bottom-4 left-5 right-5 flex justify-between items-center border-t border-white/[0.04] pt-2.5">
                    <div>
                      <p className="text-[7px] text-muted-foreground uppercase font-bold tracking-widest">
                        Status
                      </p>
                      <p
                        className={`text-[9px] font-bold ${isVerified ? "text-[#2aa67f]" : isPending ? "text-yellow-400" : "text-red-400"}`}
                      >
                        {isVerified
                          ? "★ VERIFIED"
                          : isPending
                            ? "⏳ PENDING"
                            : "⚠️ UNVERIFIED"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[7px] text-muted-foreground uppercase font-bold tracking-widest">
                        Card ID
                      </p>
                      <p className="text-[9px] font-mono text-foreground">
                        UM-2026-9923
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PRIVACY */}
          {activeTab === "privacy" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  Privacy Settings
                </h2>
                <p className="text-xs text-muted-foreground">
                  Manage who can see your profile and listings.
                </p>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white/[0.02] rounded-xl border border-transparent">
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">Profile Visibility</h3>
                    <p className="text-xs text-muted-foreground">Make your profile visible to other students.</p>
                  </div>
                  <div className="w-10 h-5 bg-[#bb740a] rounded-full relative cursor-pointer">
                    <div className="w-4 h-4 bg-white rounded-full absolute top-0.5 right-0.5 shadow-sm" />
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-white/[0.02] rounded-xl border border-transparent">
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">Read Receipts</h3>
                    <p className="text-xs text-muted-foreground">Show when you have read messages.</p>
                  </div>
                  <div className="w-10 h-5 bg-secondary rounded-full relative cursor-pointer">
                    <div className="w-4 h-4 bg-white rounded-full absolute top-0.5 left-0.5 shadow-sm" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECURITY */}
          {activeTab === "security" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  Security
                </h2>
                <p className="text-xs text-muted-foreground">
                  Manage advanced security settings and login sessions.
                </p>
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-white/[0.02] rounded-xl border border-transparent space-y-3">
                  <h3 className="text-sm font-semibold text-foreground">Two-Factor Authentication (2FA)</h3>
                  <p className="text-xs text-muted-foreground">Add an extra layer of security to your account.</p>
                  <Button variant="outline" className="text-xs h-9 border-transparent bg-secondary hover:bg-secondary/80">
                    Enable 2FA
                  </Button>
                </div>
                <div className="p-4 bg-white/[0.02] rounded-xl border border-transparent space-y-3">
                  <h3 className="text-sm font-semibold text-foreground">Active Sessions</h3>
                  <p className="text-xs text-muted-foreground">You are currently logged in on 1 device.</p>
                  <div className="flex items-center gap-3 text-xs">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span className="text-foreground font-medium">Current Session (Chrome on Linux)</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
