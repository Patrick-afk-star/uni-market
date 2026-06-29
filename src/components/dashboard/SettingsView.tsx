import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  Monitor,
  Smartphone,
  Globe
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
  const { user, accessToken } = useAuth();
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
  const [email] = useState(
    user?.email || "alex.johnson@university.edu",
  );
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSavingAccount, setIsSavingAccount] = useState(false);

  // University state
  const [universities, setUniversities] = useState<University[]>([]);
  const [selectedUniversityId, setSelectedUniversityId] = useState("");

  const [uploadedIdImage, setUploadedIdImage] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

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
    <div ref={containerRef} className="w-full max-w-[1200px] mx-auto p-4 md:p-8 space-y-8 settings-entry">
      {/* Header */}
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Dashboard Settings
        </h1>
        <p className="text-muted-foreground">
          Manage your profile, security, privacy, and student credentials.
        </p>
      </div>

      {/* Horizontal Tabs */}
      <div className="flex space-x-2 border-b border-white/[0.08] pb-0 overflow-x-auto scrollbar-hide">
        {[
          { id: "profile", label: "Profile", icon: User },
          { id: "verification", label: "Verification", icon: GraduationCap },
          { id: "account", label: "Account", icon: Lock },
          { id: "privacy", label: "Privacy", icon: Shield },
          { id: "security", label: "Security", icon: Lock },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`relative flex items-center gap-2 px-5 py-4 text-sm font-medium transition-colors whitespace-nowrap ${isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-white/[0.02] rounded-t-xl"
                }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
              {isActive && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#bb740a]"
                  initial={false}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Content Area */}
      <div className="mt-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="bg-[#0f0f0f] border border-white/[0.08] rounded-2xl p-6 md:p-8 shadow-2xl"
          >
            {/* PROFILE SETTINGS */}
            {activeTab === "profile" && (
              <form onSubmit={handleSaveProfile} className="space-y-8">
                <div>
                  <h2 className="text-xl font-semibold text-foreground">
                    Profile Details
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    This information will be shown publicly to other buyers and
                    sellers.
                  </p>
                </div>

                <div className="flex flex-col md:flex-row gap-8">
                  {/* Left Column: Avatar */}
                  <div className="flex flex-col items-center gap-4">
                    <input
                      type="file"
                      accept="image/*"
                      ref={fileInputRef}
                      onChange={handleAvatarFileChange}
                      className="hidden"
                    />
                    <div
                      className="relative w-32 h-32 rounded-full overflow-hidden group bg-secondary/50 flex items-center justify-center cursor-pointer border-4 border-secondary transition-all hover:border-[#bb740a]/50 shadow-lg"
                      onClick={handleAvatarClick}
                    >
                      {avatarPreview ? (
                        <img
                          src={avatarPreview}
                          alt="Avatar"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-12 h-12 text-muted-foreground" />
                      )}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity text-white text-xs font-medium">
                        <Camera className="w-5 h-5 mb-1" />
                        Upload
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="text-xs border-white/10 hover:bg-[#bb740a]/10 hover:text-white rounded-xl"
                      onClick={handleAvatarClick}
                    >
                      Change Picture
                    </Button>
                  </div>

                  {/* Right Column: Form Fields */}
                  <div className="flex-1 space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-muted-foreground">
                          First Name
                        </label>
                        <Input
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="bg-secondary/20 h-11 rounded-xl border-white/[0.08] focus:border-[#bb740a] transition-colors"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-muted-foreground">
                          Last Name
                        </label>
                        <Input
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className="bg-secondary/20 h-11 rounded-xl border-white/[0.08] focus:border-[#bb740a] transition-colors"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-muted-foreground">
                          Email Address
                        </label>
                        <Input
                          type="email"
                          value={email}
                          readOnly
                          disabled
                          className="bg-secondary/10 h-11 rounded-xl border-transparent text-muted-foreground cursor-not-allowed"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-muted-foreground">
                          Phone Number
                        </label>
                        <Input
                          value={phone_number}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          className="bg-secondary/20 h-11 rounded-xl border-white/[0.08] focus:border-[#bb740a] transition-colors"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-muted-foreground">
                          University
                        </label>
                        <Input
                          value={universities.find((u) => u.id === selectedUniversityId)?.name || "Carnegie Mellon University Africa"}
                          readOnly
                          disabled
                          className="bg-secondary/10 h-11 rounded-xl border-transparent text-muted-foreground cursor-not-allowed"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-muted-foreground">
                          Student ID
                        </label>
                        <Input
                          value="UM-2026-9923"
                          readOnly
                          disabled
                          className="bg-secondary/10 h-11 rounded-xl border-transparent text-muted-foreground cursor-not-allowed"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-muted-foreground">
                        Bio / Description
                      </label>
                      <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        rows={4}
                        className="w-full text-sm rounded-xl border border-white/[0.08] bg-secondary/20 p-4 text-foreground focus:outline-none focus:ring-1 focus:ring-[#bb740a] focus:border-[#bb740a] transition-colors resize-none"
                        placeholder="Tell buyers and sellers a bit about yourself..."
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-white/[0.05]">
                  <Button
                    type="submit"
                    disabled={isSavingProfile}
                    className="bg-[#bb740a] hover:bg-[#bb740a]/90 text-white rounded-xl px-8 h-12 text-sm font-semibold transition-all shadow-lg hover:shadow-[#bb740a]/20"
                  >
                    {isSavingProfile ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </form>
            )}

            {/* VERIFICATION SETTINGS */}
            {activeTab === "verification" && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-xl font-semibold text-foreground">
                    Student Verification
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Verify your student status to unlock selling and messaging features.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Left Column: Status & Info */}
                  <div className="space-y-6">
                    <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.08] space-y-4 relative overflow-hidden">
                      {/* Decorative Background */}
                      <div className="absolute top-0 right-0 w-32 h-32 bg-[#bb740a]/10 rounded-full blur-3xl" />

                      <div className="flex items-center gap-3 mb-2 relative z-10">
                        {isVerified ? (
                          <div className="w-10 h-10 rounded-full bg-[#177865]/20 flex items-center justify-center text-[#177865]">
                            <CheckCircle className="w-5 h-5" />
                          </div>
                        ) : isPending ? (
                          <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-500">
                            <Loader2 className="w-5 h-5 animate-spin" />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center text-red-500">
                            <AlertTriangle className="w-5 h-5" />
                          </div>
                        )}
                        <div>
                          <h3 className="font-semibold text-foreground">
                            {isVerified ? "Verified Student" : isPending ? "Verification Pending" : "Unverified"}
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            {isVerified ? "Your student status is active." : isPending ? "We are reviewing your ID." : "Please verify your account."}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-3 pt-4 border-t border-white/[0.05] relative z-10">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-muted-foreground">Email:</span>
                          <span className="font-medium text-foreground">{email}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-muted-foreground">Student ID:</span>
                          <span className="font-medium text-muted-foreground">UM-2026-9923</span>
                        </div>
                        {isVerified && (
                          <div className="flex justify-between items-center text-sm pt-2">
                            <span className="text-muted-foreground">Progress:</span>
                            <div className="flex items-center gap-2">
                              <div className="w-24 h-1.5 rounded-full bg-secondary overflow-hidden">
                                <div className="w-full h-full bg-[#177865]" />
                              </div>
                              <span className="text-xs text-[#177865] font-bold">100%</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="p-5 rounded-2xl bg-[#bb740a]/5 border border-[#bb740a]/20">
                      <h4 className="text-sm font-semibold text-[#bb740a] mb-2 flex items-center gap-2">
                        <BookOpen className="w-4 h-4" /> Why verify?
                      </h4>
                      <ul className="text-xs text-muted-foreground space-y-2 list-disc pl-4">
                        <li>Create marketplace listings to sell items.</li>
                        <li>Directly message other verified students.</li>
                        <li>Build trust within the university community.</li>
                      </ul>
                    </div>
                  </div>

                  {/* Right Column: Upload */}
                  <div className="space-y-6">
                    {!isVerified && (
                      <div className="p-6 rounded-2xl border border-white/[0.08] bg-white/[0.01]">
                        <h3 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
                          <Camera className="w-5 h-5 text-[#bb740a]" /> Upload Student ID
                        </h3>

                        {!uploadedIdImage ? (
                          <div
                            onClick={handleUploadId}
                            className="border-2 border-dashed border-white/[0.1] hover:border-[#bb740a]/50 rounded-xl h-48 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all bg-secondary/10 group"
                          >
                            <div className="w-12 h-12 rounded-full bg-secondary/50 flex items-center justify-center group-hover:scale-110 transition-transform">
                              <Camera className="w-6 h-6 text-muted-foreground group-hover:text-[#bb740a]" />
                            </div>
                            <div className="text-center">
                              <p className="text-sm font-medium text-foreground">
                                Click to browse files
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                JPG, PNG up to 5MB
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div className="relative rounded-xl overflow-hidden border border-white/[0.08] h-48 group">
                              <img
                                src={uploadedIdImage}
                                alt="Uploaded card"
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity backdrop-blur-sm">
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => setUploadedIdImage(null)}
                                  className="h-8 rounded-lg"
                                >
                                  Remove Image
                                </Button>
                              </div>
                            </div>
                            <Button
                              onClick={handleVerifySubmit}
                              className="w-full bg-[#177865] hover:bg-[#177865]/90 text-white rounded-xl h-11 font-semibold transition-all shadow-lg hover:shadow-[#177865]/20"
                            >
                              Submit for Review
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ACCOUNT SETTINGS */}
            {activeTab === "account" && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-xl font-semibold text-foreground">
                    Account Settings
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Manage your email, password, and account data.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Change Password Card */}
                  <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.08] space-y-5 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-secondary/50 border border-white/[0.05]">
                        <Lock className="w-5 h-5 text-foreground" />
                      </div>
                      <h3 className="font-semibold text-foreground">Change Password</h3>
                    </div>
                    <form onSubmit={handleSaveAccount} className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground">Current Password</label>
                        <Input
                          type="password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="bg-secondary/20 h-11 rounded-xl border-white/[0.08] focus:border-[#bb740a]"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground">New Password</label>
                        <Input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="bg-secondary/20 h-11 rounded-xl border-white/[0.08] focus:border-[#bb740a]"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground">Confirm New Password</label>
                        <Input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="bg-secondary/20 h-11 rounded-xl border-white/[0.08] focus:border-[#bb740a]"
                        />
                      </div>
                      <Button
                        type="submit"
                        disabled={isSavingAccount || !newPassword}
                        className="w-full bg-secondary hover:bg-secondary/80 text-foreground rounded-xl h-11 mt-2 font-medium"
                      >
                        {isSavingAccount ? "Updating..." : "Update Password"}
                      </Button>
                    </form>
                  </div>

                  {/* Change Email Card */}
                  <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.08] space-y-5 flex flex-col shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-secondary/50 border border-white/[0.05]">
                        <Mail className="w-5 h-5 text-foreground" />
                      </div>
                      <h3 className="font-semibold text-foreground">Change Email</h3>
                    </div>
                    <div className="space-y-2 flex-1">
                      <label className="text-xs font-medium text-muted-foreground">Current Email</label>
                      <Input
                        type="email"
                        value={email}
                        readOnly
                        disabled
                        className="bg-secondary/10 h-11 rounded-xl border-transparent text-muted-foreground cursor-not-allowed"
                      />
                      <p className="text-[11px] text-muted-foreground mt-3 leading-relaxed">
                        To change your email, you must verify the new address before the change takes effect.
                      </p>
                    </div>
                    <Button variant="outline" className="w-full border-white/[0.1] rounded-xl h-11 hover:bg-white/[0.05]">
                      Request Email Change
                    </Button>
                  </div>

                  {/* Export Data Card */}
                  <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.08] space-y-4 md:col-span-2 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="space-y-1">
                      <h3 className="font-semibold text-foreground">Export Account Data</h3>
                      <p className="text-xs text-muted-foreground">
                        Download a copy of all your data, including listings, messages, and profile info.
                      </p>
                    </div>
                    <Button variant="outline" className="border-white/[0.1] hover:bg-white/[0.05] rounded-xl h-11 px-6 whitespace-nowrap shrink-0">
                      Request Data Archive
                    </Button>
                  </div>

                  {/* Danger Zone */}
                  <div className="p-6 rounded-2xl border border-red-500/20 bg-red-500/5 space-y-4 md:col-span-2 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    <div className="space-y-1">
                      <h3 className="font-semibold text-red-400 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" /> Danger Zone
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Permanently delete your account and all associated data. This action cannot be undone.
                      </p>
                    </div>
                    <Button
                      variant="destructive"
                      className="bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20 rounded-xl h-11 px-6 whitespace-nowrap transition-colors shrink-0 font-medium"
                      onClick={() => {
                        const confirmDel = window.confirm(
                          "Are you sure you want to permanently delete your UniMarket account?"
                        );
                        if (confirmDel) toast.error("Account deletion requested.");
                      }}
                    >
                      <Trash2 className="w-4 h-4 mr-2" /> Delete Account
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* PRIVACY SETTINGS */}
            {activeTab === "privacy" && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-xl font-semibold text-foreground">
                    Privacy Preferences
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Control what information is visible to other students on UniMarket.
                  </p>
                </div>

                <div className="bg-white/[0.02] border border-white/[0.08] rounded-2xl overflow-hidden divide-y divide-white/[0.05] shadow-sm">
                  {[
                    { title: "Show Phone Number", desc: "Allow buyers to see your phone number on listings.", icon: Smartphone, enabled: true },
                    { title: "Show Email Address", desc: "Display your university email on your public profile.", icon: Mail, enabled: false },
                    { title: "Show University", desc: "Display your associated university campus.", icon: Globe, enabled: true },
                    { title: "Allow Direct Messages", desc: "Let other students message you directly.", icon: Mail, enabled: true },
                    { title: "Email Notifications", desc: "Receive emails when you get new messages or offers.", icon: Mail, enabled: true },
                  ].map((setting, idx) => {
                    const Icon = setting.icon;
                    return (
                      <div key={idx} className="p-5 flex items-center justify-between gap-4 hover:bg-white/[0.03] transition-colors cursor-pointer group">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-secondary/50 flex items-center justify-center text-muted-foreground group-hover:text-[#bb740a] transition-colors">
                            <Icon className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold text-foreground">{setting.title}</h4>
                            <p className="text-xs text-muted-foreground mt-0.5">{setting.desc}</p>
                          </div>
                        </div>
                        {/* Toggle Switch */}
                        <div className={`w-12 h-6 rounded-full relative transition-colors ${setting.enabled ? 'bg-[#bb740a]' : 'bg-secondary/80'}`}>
                          <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform shadow-sm ${setting.enabled ? 'translate-x-6' : 'translate-x-0'}`} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* SECURITY SETTINGS */}
            {activeTab === "security" && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-xl font-semibold text-foreground">
                    Security Settings
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Manage 2FA and monitor your active login sessions.
                  </p>
                </div>

                <div className="space-y-6">
                  {/* 2FA Card */}
                  <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.08] flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-5">
                      <div className="w-12 h-12 rounded-2xl bg-[#bb740a]/10 flex items-center justify-center text-[#bb740a] shrink-0 border border-[#bb740a]/20">
                        <Shield className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1.5">
                          <h3 className="font-semibold text-foreground text-base">Two-Factor Authentication</h3>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-secondary/80 text-muted-foreground uppercase tracking-wider">Disabled</span>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          Protect your account with an extra layer of security. We'll ask for a code in addition to your password when you sign in.
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" className="shrink-0 rounded-xl h-11 px-6 border-white/[0.1] hover:bg-white/[0.05] font-medium">
                      Configure 2FA
                    </Button>
                  </div>

                  {/* Active Sessions */}
                  <div className="rounded-2xl bg-white/[0.02] border border-white/[0.08] overflow-hidden shadow-sm">
                    <div className="p-6 border-b border-white/[0.05] bg-white/[0.01]">
                      <h3 className="font-semibold text-foreground">Active Sessions</h3>
                      <p className="text-xs text-muted-foreground mt-1">Review the devices that are currently logged into your account.</p>
                    </div>
                    <div className="divide-y divide-white/[0.05]">
                      {/* Session 1 */}
                      <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/[0.01]">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-secondary/80 flex items-center justify-center text-foreground">
                            <Monitor className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2.5">
                              <h4 className="text-sm font-semibold text-foreground">Mac OS • Chrome</h4>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#177865]/20 text-[#2aa67f]">Current Session</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">Kigali, Rwanda • Active now</p>
                          </div>
                        </div>
                      </div>
                      {/* Session 2 */}
                      <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-white/[0.01] transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-secondary/80 flex items-center justify-center text-foreground">
                            <Smartphone className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold text-foreground">iOS • Safari</h4>
                            <p className="text-xs text-muted-foreground mt-1">Kigali, Rwanda • Last active 2 hours ago</p>
                          </div>
                        </div>
                        <Button variant="ghost" className="text-xs text-red-400 hover:text-red-500 hover:bg-red-500/10 rounded-xl h-9 px-4">
                          Log out
                        </Button>
                      </div>
                    </div>
                    <div className="p-5 border-t border-white/[0.05] flex justify-end bg-white/[0.01]">
                      <Button variant="outline" className="text-xs rounded-xl h-10 px-5 border-white/[0.1] hover:bg-white/[0.05]">
                        Log Out All Other Devices
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
