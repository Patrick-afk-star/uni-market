import { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";
import {
  User,
  Lock,
  Mail,
  Camera,
  AlertTriangle,
  Shield,
  Trash2,
  Save,
  Loader2,
  Monitor,
  Smartphone,
  Globe,
  Edit2,
  Eye,
  MapPin
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { getApiUrl } from "@/lib/api";

interface University {
  id: string;
  name: string;
}

interface LocationNode {
  id: string;
  name: string;
  districts: { id: string; name: string }[];
}

interface Campus {
  id: string;
  name: string;
}

const AVAILABLE_LANGUAGES = ["English", "French", "Kinyarwanda", "Arabic", "Swahili", "Lingala"];
const BIO_MAX = 60;

export function SettingsView() {
  const { user, accessToken, updateUser } = useAuth();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState<
    "profile" | "account" | "privacy" | "security"
  >("profile");

  // Profile: read/edit mode
  const [isEditMode, setIsEditMode] = useState(false);
  const [highlightRequired, setHighlightRequired] = useState(false);

  // Profile fields state
  const [initialProfile, setInitialProfile] = useState<any>(null);
  const [fullName, setFullName] = useState(user?.first_name || "");
  const [lastName, setLastName] = useState(user?.last_name || "");
  const [bio, setBio] = useState((user as any)?.bio || "");
  const [phone_number, setPhoneNumber] = useState(user?.phone_number || "");
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar_url || "");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Residence — Province + District cascading
  const [locations, setLocations] = useState<LocationNode[]>([]);
  const [province, setProvince] = useState("");
  const [district, setDistrict] = useState("");

  // Languages — closed multi-select
  const [languages, setLanguages] = useState<string[]>((user as any)?.profile_details?.languages || []);

  // Social links
  const [socialLinks, setSocialLinks] = useState<Record<string, string>>((user as any)?.profile_details?.socialLinks || {
    linkedin: "", github: "", instagram: "", facebook: "", x: "", tiktok: "", website: ""
  });

  // Contact Preferences
  const [contactPrefs] = useState<string[]>((user as any)?.profile_details?.contactPrefs || ["UniMarket Chat"]);

  // Sync state if redirected with params
  useEffect(() => {
    if (location.state?.editMode) {
      setIsEditMode(true);
    }
    if (location.state?.highlightRequired) {
      setHighlightRequired(true);
    }
  }, [location.state]);

  // Privacy Settings state
  const [privacySettings, setPrivacySettings] = useState({
    showPhone: false,
    showEmail: false,
    showUniversity: true,
    allowDMs: true,
    emailNotifs: true,
  });
  const [isSavingPrivacy, setIsSavingPrivacy] = useState(false);

  // Account settings
  const [email] = useState(user?.email || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSavingAccount, setIsSavingAccount] = useState(false);
  const [isSendingReset, setIsSendingReset] = useState(false);

  // Delete account confirmation dialog
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);



  // University & Campus state
  const [universities, setUniversities] = useState<University[]>([]);
  const [selectedUniversityId, setSelectedUniversityId] = useState("");
  const [selectedUniversityName, setSelectedUniversityName] = useState("");
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [selectedCampus, setSelectedCampus] = useState("");

  const containerRef = useRef<HTMLDivElement>(null);

  // Province change — reset district
  const handleProvinceChange = (p: string) => {
    setProvince(p);
    setDistrict("");
  };

  // Language toggle
  const toggleLanguage = (lang: string) => {
    setLanguages(prev =>
      prev.includes(lang) ? prev.filter(l => l !== lang) : [...prev, lang]
    );
  };


  // Fetch universities, locations, preferences
  useEffect(() => {
    const fetchUnis = async () => {
      try {
        const response = await fetch(getApiUrl("/api/v1/universities"));
        if (response.ok) {
          const data = await response.json();
          setUniversities(data);
        }
      } catch (err) {
        console.error("Failed to load universities list:", err);
      }
    };
    const fetchLocations = async () => {
      try {
        const response = await fetch(getApiUrl("/api/v1/locations/province"));
        if (response.ok) {
          const data = await response.json();
          setLocations(data);
        }
      } catch (err) {
        console.error("Failed to load locations:", err);
      }
    };
    const fetchProfile = async () => {
      if (!accessToken) return;
      try {
        const response = await fetch(getApiUrl("/api/v1/profiles/me"), {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        if (response.ok) {
          const data = await response.json();
          setInitialProfile(data);
          if (data.first_name) setFullName(data.first_name);
          if (data.last_name) setLastName(data.last_name);
          if (data.bio) setBio(data.bio);
          if (data.phone_number) setPhoneNumber(data.phone_number);
          if (data.avatar_url) setAvatarPreview(data.avatar_url);

          if (data.province) setProvince(data.province);
          if (data.district) setDistrict(data.district);
          if (data.languages_spoken) setLanguages(data.languages_spoken);
          if (data.social_links) {
            setSocialLinks(prev => ({ ...prev, ...data.social_links }));
          }
          if (data.student_profile) {
             setSelectedUniversityId(data.student_profile.university?.id || "");
             setSelectedUniversityName(data.student_profile.university?.name || "");
             setSelectedCampus(data.student_profile.campus || "");
          }
        }
      } catch (err) {
        console.error("Failed to load profile:", err);
      }
    };
    const fetchPreferences = async () => {
      if (!accessToken) return;
      try {
        const response = await fetch(getApiUrl("/api/v1/preferences"), {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        if (response.ok) {
          const data = await response.json();
          setPrivacySettings({
            showPhone: data.show_phone_number ?? false,
            showEmail: data.show_email_address ?? false,
            showUniversity: data.show_university ?? true,
            allowDMs: data.allow_direct_messages ?? true,
            emailNotifs: data.email_notifications ?? true,
          });
        }
      } catch (err) {
        console.error("Failed to load preferences:", err);
      }
    };

    fetchUnis();
    fetchLocations();
    fetchProfile();
    fetchPreferences();
  }, [accessToken]);

  // Fetch campuses when university changes
  useEffect(() => {
    if (!selectedUniversityId) {
       setCampuses([]);
       return;
    }
    const fetchCampuses = async () => {
       try {
         const response = await fetch(getApiUrl(`/api/v1/universities/${selectedUniversityId}/campus`));
         if (response.ok) {
           const data = await response.json();
           setCampuses(data);
         }
       } catch (err) {
         console.error("Failed to load campuses:", err);
       }
    };
    fetchCampuses();
  }, [selectedUniversityId]);

  // GSAP entry animation
  useEffect(() => {
    const ctx = gsap.context(() => {
      if (containerRef.current) {
        gsap.fromTo(
          containerRef.current.querySelectorAll(".settings-entry"),
          { opacity: 0, y: 15 },
          { opacity: 1, y: 0, duration: 0.4, stagger: 0.05, ease: "power2.out" },
        );
      }
    });
    return () => ctx.revert();
  }, []);

  // Save profile handler
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken) {
      toast.error("You must be logged in to update your profile.");
      return;
    }
    if (province && !district) {
      toast.error("Please select a District for your chosen Province.");
      return;
    }

    setIsSavingProfile(true);
    try {
      const formData = new FormData();
      if (fullName !== (initialProfile?.first_name || "")) formData.append("first_name", fullName);
      if (lastName !== (initialProfile?.last_name || "")) formData.append("last_name", lastName);
      if (phone_number !== (initialProfile?.phone_number || "")) formData.append("phone_number", phone_number);
      if (bio !== (initialProfile?.bio || "")) formData.append("bio", bio);
      if (avatarFile) formData.append("avatar_url", avatarFile);

      if (province && province !== (initialProfile?.province || "")) formData.append("province", province);
      if (district && district !== (initialProfile?.district || "")) formData.append("district", district);

      const currentLanguages = JSON.stringify(languages);
      const initialLanguages = JSON.stringify(initialProfile?.languages_spoken || []);
      if (currentLanguages !== initialLanguages) {
        formData.append("languages_spoken", currentLanguages);
      }

      const defaultSocialLinks = { linkedin: "", github: "", instagram: "", facebook: "", x: "", tiktok: "", website: "" };
      const currentSocialLinks = JSON.stringify(socialLinks);
      const initialSocialLinks = JSON.stringify({ ...defaultSocialLinks, ...(initialProfile?.social_links || {}) });
      if (currentSocialLinks !== initialSocialLinks) {
        formData.append("social_links", currentSocialLinks);
      }
      
      if (selectedCampus && selectedCampus !== (initialProfile?.student_profile?.campus || "")) {
         formData.append("campus_id", selectedCampus);
      }

      const res = await fetch(getApiUrl("/api/v1/profiles/me"), {
        method: "PATCH",
        headers: { Authorization: `Bearer ${accessToken}` },
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || "Failed to update profile");
      }

      const responseData = await res.json();

      updateUser({
        first_name: fullName,
        last_name: lastName,
        // @ts-ignore
        profile_details: {
          province: responseData.province,
          district: responseData.district,
          languages: responseData.languages_spoken || languages,
          socialLinks: responseData.social_links || socialLinks,
          contactPrefs
        },
        privacy_settings: privacySettings,
      });

      toast.success("Profile updated successfully!");
      setIsEditMode(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to update profile");
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Save password
  const handleSaveAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (!currentPassword) {
      toast.error("Please enter your current password");
      return;
    }
    setIsSavingAccount(true);
    try {
      const res = await fetch(getApiUrl("/api/v1/auth/password/change/"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          old_password: currentPassword,
          new_password1: newPassword,
          new_password2: confirmPassword,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || err.old_password?.[0] || "Failed to change password");
      }
      toast.success("Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast.error(err.message || "Failed to change password");
    } finally {
      setIsSavingAccount(false);
    }
  };

  // Set password for OAuth users (sends reset link)
  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSendingReset(true);
    try {
      const res = await fetch(getApiUrl("/api/v1/auth/password/reset/"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user?.email }),
      });
      if (!res.ok) throw new Error("Failed to send reset email");
      toast.success("Password reset link sent! Check your inbox.");
    } catch (err: any) {
      toast.error(err.message || "Failed to send reset email");
    } finally {
      setIsSendingReset(false);
    }
  };

  // Delete account
  const handleDeleteAccount = async () => {
    setIsDeletingAccount(true);
    try {
      const res = await fetch(getApiUrl("/api/v1/auth/account/delete"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Failed to delete account");
      }
      toast.success("Account deleted. Goodbye!");
      // logout will clear state
      setTimeout(() => window.location.href = "/", 1500);
    } catch (err: any) {
      toast.error(err.message || "Failed to delete account");
    } finally {
      setIsDeletingAccount(false);
      setShowDeleteConfirm(false);
    }
  };

  // Save privacy preferences
  const handleSavePrivacy = async () => {
    if (!accessToken) return;
    setIsSavingPrivacy(true);
    try {
      const res = await fetch(getApiUrl("/api/v1/preferences"), {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          show_phone_number: privacySettings.showPhone,
          show_email_address: privacySettings.showEmail,
          show_university: privacySettings.showUniversity,
          allow_direct_messages: privacySettings.allowDMs,
          email_notifications: privacySettings.emailNotifs,
        }),
      });
      if (!res.ok) throw new Error("Failed to save preferences");
      toast.success("Privacy preferences saved!");
    } catch (err: any) {
      toast.error(err.message || "Failed to save preferences");
    } finally {
      setIsSavingPrivacy(false);
    }
  };



  // const handleUploadId = () => {
  //   const mockImage = "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=400&h=250&fit=crop";
  //   setUploadedIdImage(mockImage);
  //   toast.success("ID image uploaded successfully!");
  // };

  // const handleVerifySubmit = () => {
  //   if (uploadedIdImage) {
  //     submitVerification(uploadedIdImage);
  //     toast.success("Verification ID submitted for review!");
  //   }
  // };

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  // Read-only profile display name
  const displayName = [fullName, lastName].filter(Boolean).join(" ") || user?.email || "Your Profile";

  // Find location names (handling cases where province/district state might already be a name or an ID)
  const selectedProvince = locations.find(l => l.id === province || l.name === province);
  const selectedProvinceName = selectedProvince?.name || province;
  const selectedDistrictName = selectedProvince?.districts.find(d => d.id === district || d.name === district)?.name || district;

  const locationLabel = selectedDistrictName && selectedProvinceName ? `${selectedDistrictName} District, ${selectedProvinceName}` : "";

  // For the select dropdowns in edit mode, we need IDs if they exist.
  const provinceIdForSelect = selectedProvince?.id || province;
  const districtIdForSelect = selectedProvince?.districts.find(d => d.id === district || d.name === district)?.id || district;

  return (
    <div ref={containerRef} className="w-full max-w-[1200px] mx-auto p-4 md:p-8 space-y-8 settings-entry">
      {/* Header */}
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard Settings</h1>
        <p className="text-muted-foreground">Manage your profile, security, privacy, and student credentials.</p>
      </div>

      {/* Horizontal Tabs */}
      <div className="flex space-x-2 border-b border-border pb-0 overflow-x-auto scrollbar-hide">
        {[
          { id: "profile", label: "Profile", icon: User },
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
              className={`relative flex items-center gap-2 px-5 py-4 text-sm font-medium transition-colors whitespace-nowrap ${isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-t-xl"}`}
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
            className="rounded-2xl bg-card border border-border text-card-foreground p-6 md:p-8 shadow-sm"
          >

            {/* ── PROFILE TAB ── */}
            {activeTab === "profile" && (
              <AnimatePresence mode="wait">
                {!isEditMode ? (
                  /* ── READ-ONLY VIEW ── */
                  <motion.div
                    key="read"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-8"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h2 className="text-xl font-semibold text-foreground">Profile Details</h2>
                        <p className="text-sm text-muted-foreground mt-1">This information is shown publicly to other buyers and sellers.</p>
                      </div>
                      <Button
                        onClick={() => setIsEditMode(true)}
                        className="bg-[#bb740a] hover:bg-[#bb740a]/90 text-white rounded-xl h-10 px-5 gap-2 font-semibold text-sm shadow-sm"
                      >
                        <Edit2 className="w-4 h-4" /> Edit Profile
                      </Button>
                    </div>

                    {/* Avatar + Name */}
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                      <div className="w-24 h-24 rounded-full bg-secondary flex items-center justify-center shrink-0 border-2 border-border shadow-xs overflow-hidden">
                        {avatarPreview ? (
                          <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-10 h-10 text-muted-foreground" />
                        )}
                      </div>
                      <div className="space-y-2 text-center sm:text-left">
                        <h3 className="text-2xl font-bold text-foreground">{displayName}</h3>
                        <p className="text-sm text-muted-foreground">{email}</p>
                        {bio && <p className="text-sm text-foreground/80 max-w-md leading-relaxed">"{bio}"</p>}
                      </div>
                    </div>

                    {/* Profile Details Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-4 border-t border-border">
                      {phone_number && (
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Phone</p>
                          <p className="text-foreground text-sm font-medium">{phone_number}</p>
                        </div>
                      )}
                      {locationLabel && (
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Residence</p>
                          <p className="text-foreground text-sm font-medium flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-[#bb740a]" /> {locationLabel}
                          </p>
                        </div>
                      )}
                      {languages.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Languages</p>
                          <div className="flex flex-wrap gap-2">
                            {languages.map(l => (
                              <span key={l} className="text-xs bg-secondary px-2.5 py-1 rounded-full text-foreground border border-border font-medium">{l}</span>
                            ))}
                          </div>
                        </div>
                      )}
                      {Object.values(socialLinks).some(v => v) && (
                        <div className="space-y-2 sm:col-span-2">
                          <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Social Links</p>
                          <div className="flex flex-wrap gap-2">
                            {Object.entries(socialLinks).filter(([_, v]) => v).map(([k, v]) => (
                              <a key={k} href={v.startsWith("http") ? v : `https://${v}`} target="_blank" rel="noopener noreferrer" className="text-xs text-[#bb740a] hover:underline capitalize">{k}</a>
                            ))}
                          </div>
                        </div>
                      )}
                      {!bio && !phone_number && !locationLabel && languages.length === 0 && (
                        <div className="sm:col-span-2 text-center py-8 text-muted-foreground text-sm">
                          <Eye className="w-8 h-8 mx-auto mb-2 opacity-30" />
                          Your profile is empty. Click <strong className="text-[#bb740a]">Edit Profile</strong> to add your details.
                        </div>
                      )}
                    </div>
                  </motion.div>
                ) : (
                  /* ── EDIT VIEW ── */
                  <motion.form
                    key="edit"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onSubmit={handleSaveProfile}
                    className="space-y-8"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h2 className="text-xl font-semibold text-foreground">Edit Profile</h2>
                        <p className="text-sm text-muted-foreground mt-1">Update your public profile information.</p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsEditMode(false)}
                        className="rounded-xl h-10 px-5 border-white/[0.1] hover:bg-white/[0.05] text-sm"
                      >
                        Cancel
                      </Button>
                    </div>

                    <div className="flex flex-col md:flex-row gap-8">
                      {/* Avatar */}
                      <div className="flex flex-col items-center gap-4">
                        <input type="file" accept="image/*" ref={fileInputRef} onChange={handleAvatarFileChange} className="hidden" />
                        <div
                          className={`relative w-32 h-32 rounded-full overflow-hidden group bg-secondary/50 flex items-center justify-center cursor-pointer border-4 transition-all hover:border-[#bb740a]/50 shadow-lg ${highlightRequired && !avatarPreview ? 'border-red-500/80 ring-2 ring-red-500/40 animate-pulse' : 'border-secondary'}`}
                          onClick={handleAvatarClick}
                        >
                          {avatarPreview ? (
                            <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-12 h-12 text-muted-foreground" />
                          )}
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity text-white text-xs font-medium">
                            <Camera className="w-5 h-5 mb-1" /> Upload
                          </div>
                        </div>
                        <Button type="button" variant="outline" size="sm" className="text-xs border-white/10 hover:bg-[#bb740a]/10 hover:text-white rounded-xl" onClick={handleAvatarClick}>
                          Change Picture
                        </Button>
                        {highlightRequired && !avatarPreview && (
                          <p className="text-[11px] text-red-400 mt-1 font-semibold">Avatar is required</p>
                        )}
                      </div>

                      {/* Form Fields */}
                      <div className="flex-1 space-y-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                          <div className="space-y-2">
                            <label className="text-sm font-semibold text-muted-foreground">First Name</label>
                            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} className="bg-secondary/20 h-11 rounded-xl border-white/[0.08] focus:outline-none focus:ring-1 focus:ring-[#bb740a] focus:border-[#bb740a]" required />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-semibold text-muted-foreground">Last Name</label>
                            <Input value={lastName} onChange={(e) => setLastName(e.target.value)} className="bg-secondary/20 h-11 rounded-xl border-white/[0.08] focus:outline-none focus:ring-1 focus:ring-[#bb740a] focus:border-[#bb740a]" />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-semibold text-muted-foreground">Email Address</label>
                            <Input type="email" value={email} readOnly disabled className="bg-secondary/10 h-11 rounded-xl border-transparent text-muted-foreground cursor-not-allowed" />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-semibold text-muted-foreground">Phone Number</label>
                            <Input value={phone_number} onChange={(e) => setPhoneNumber(e.target.value)} className="bg-secondary/20 h-11 rounded-xl border-white/[0.08] focus:outline-none focus:ring-1 focus:ring-[#bb740a] focus:border-[#bb740a]" />
                          </div>
                          <div className="space-y-2 sm:col-span-1">
                            <label className="text-sm font-semibold text-muted-foreground">University</label>
                            <Input value={selectedUniversityName || universities.find((u) => u.id === selectedUniversityId)?.name || "Not set"} readOnly disabled className="bg-secondary/10 h-11 rounded-xl border-transparent text-muted-foreground cursor-not-allowed" />
                          </div>
                          <div className="space-y-2 sm:col-span-1">
                            <label className="text-sm font-semibold text-muted-foreground flex justify-between">
                                Campus
                                {highlightRequired && !selectedCampus && <span className="text-xs text-red-400 font-semibold">Required</span>}
                            </label>
                            <select
                                value={selectedCampus}
                                onChange={(e) => setSelectedCampus(e.target.value)}
                                disabled={campuses.length === 0}
                                className="w-full h-11 rounded-xl border border-white/[0.08] bg-secondary/20 px-3 text-foreground focus:outline-none focus:ring-1 focus:ring-[#bb740a] focus:border-[#bb740a] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                              >
                                <option value="" className="bg-[#0f0f0f]">Select Campus...</option>
                                {campuses.map(c => (
                                  <option key={c.id} value={c.id} className="bg-[#0f0f0f]">{c.name}</option>
                                ))}
                            </select>
                          </div>
                        </div>

                        {/* Bio with 60-char counter */}
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-muted-foreground">Bio / Description</label>
                          <textarea
                            value={bio}
                            onChange={(e) => setBio(e.target.value.slice(0, BIO_MAX))}
                            maxLength={BIO_MAX}
                            rows={3}
                            className="w-full text-sm rounded-xl border border-white/[0.08] bg-secondary/20 p-4 text-foreground focus:outline-none focus:ring-1 focus:ring-[#bb740a] focus:border-[#bb740a] transition-colors resize-none"
                            placeholder="Tell buyers and sellers a bit about yourself..."
                          />
                          <p className={`text-xs mt-0.5 ${bio.length >= BIO_MAX ? 'text-red-400 font-semibold' : bio.length >= 45 ? 'text-[#bb740a]' : 'text-muted-foreground'}`}>
                            {bio.length} / {BIO_MAX}
                          </p>
                        </div>

                        {/* Residence — Province + District */}
                        <div className="space-y-3">
                          <label className="text-sm font-semibold text-muted-foreground flex justify-between">
                            Residence
                            {highlightRequired && (!province || !district) && <span className="text-xs text-red-400 font-semibold">Selection Required</span>}
                          </label>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <label className="text-xs text-muted-foreground flex justify-between">
                                Province
                                {highlightRequired && !province && <span className="text-xs text-red-400 font-semibold">Required</span>}
                              </label>
                              <select
                                value={provinceIdForSelect}
                                onChange={(e) => handleProvinceChange(e.target.value)}
                                className="w-full h-11 rounded-xl border border-white/[0.08] bg-secondary/20 px-3 text-foreground focus:outline-none focus:ring-1 focus:ring-[#bb740a] focus:border-[#bb740a] transition-colors"
                              >
                                <option value="" className="bg-[#0f0f0f]">Select Province...</option>
                                {locations.map(p => (
                                  <option key={p.id} value={p.id} className="bg-[#0f0f0f]">{p.name}</option>
                                ))}
                              </select>
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-xs text-muted-foreground flex justify-between">
                                District
                                {highlightRequired && !district && <span className="text-xs text-red-400 font-semibold">Required</span>}
                              </label>
                              <select
                                value={districtIdForSelect}
                                onChange={(e) => setDistrict(e.target.value)}
                                disabled={!provinceIdForSelect}
                                className="w-full h-11 rounded-xl border border-white/[0.08] bg-secondary/20 px-3 text-foreground focus:outline-none focus:ring-1 focus:ring-[#bb740a] focus:border-[#bb740a] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                              >
                                <option value="" className="bg-[#0f0f0f]">Select District...</option>
                                {provinceIdForSelect && locations.find(l => l.id === provinceIdForSelect)?.districts.map(d => (
                                  <option key={d.id} value={d.id} className="bg-[#0f0f0f]">{d.name}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground flex items-start gap-1">
                            <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0 text-[#bb740a]" />
                            For your security, we only collect Province and District — no streets, cells, or exact addresses.
                          </p>
                        </div>

                        {/* Languages — Closed Multi-Select */}
                        <div className="space-y-3">
                          <label className="text-sm font-semibold text-muted-foreground">Languages Spoken</label>
                          <div className="flex flex-wrap gap-2">
                            {AVAILABLE_LANGUAGES.map(lang => (
                              <button
                                key={lang}
                                type="button"
                                onClick={() => toggleLanguage(lang)}
                                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border ${languages.includes(lang) ? 'bg-[#bb740a]/20 text-[#bb740a] border-[#bb740a]/50' : 'bg-secondary/20 text-muted-foreground border-white/[0.08] hover:border-white/20'}`}
                              >
                                {lang}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Social Links */}
                        <div className="space-y-3">
                          <label className="text-sm font-semibold text-muted-foreground">Social Links</label>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {Object.keys(socialLinks).map(platform => (
                              <div key={platform} className="relative">
                                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-muted-foreground text-xs uppercase font-bold w-16">{platform}</div>
                                <Input
                                  value={socialLinks[platform as keyof typeof socialLinks]}
                                  onChange={(e) => setSocialLinks({ ...socialLinks, [platform as keyof typeof socialLinks]: e.target.value })}
                                  placeholder="https://"
                                  className="bg-secondary/20 h-11 rounded-xl border-white/[0.08] pl-20 focus:outline-none focus:ring-1 focus:ring-[#bb740a] focus:border-[#bb740a] text-sm"
                                />
                              </div>
                            ))}
                          </div>
                        </div>

                      </div>
                    </div>

                    {/* Save at bottom */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-white/[0.05]">
                      <div className="text-xs text-muted-foreground text-left">
                        By using this platform, you agree to the <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-[#bb740a] hover:underline font-semibold">UniMarket Rwanda Terms of Service</a>.
                      </div>
                      <div className="flex justify-end gap-3 w-full sm:w-auto">
                        <Button type="button" variant="outline" onClick={() => setIsEditMode(false)} className="rounded-xl px-6 h-12 border-white/[0.1] hover:bg-white/[0.05]">
                          Cancel
                        </Button>
                        <Button type="submit" disabled={isSavingProfile} className="bg-[#bb740a] hover:bg-[#bb740a]/90 text-white rounded-xl px-8 h-12 text-sm font-semibold transition-all shadow-lg hover:shadow-[#bb740a]/20">
                          {isSavingProfile ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> : <><Save className="w-4 h-4 mr-2" />Save Changes</>}
                        </Button>
                      </div>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>
            )}

            {/* ── ACCOUNT TAB ── */}
            {activeTab === "account" && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-xl font-semibold text-foreground">Account Settings</h2>
                  <p className="text-sm text-muted-foreground">Manage your email, password, and account data.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                  {/* Change Password */}
                  <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.08] space-y-5 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-secondary/50 border border-white/[0.05]"><Lock className="w-5 h-5 text-foreground" /></div>
                      <h3 className="font-semibold text-foreground">
                        {user?.auth_status?.has_password ? "Change Password" : "Set Password"}
                      </h3>
                    </div>
                    {user?.auth_status?.has_password ? (
                      <form onSubmit={handleSaveAccount} className="space-y-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-medium text-muted-foreground">Current Password</label>
                          <Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="bg-secondary/20 h-11 rounded-xl border-white/[0.08] focus:outline-none focus:ring-1 focus:ring-[#bb740a] focus:border-[#bb740a]" required />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-medium text-muted-foreground">New Password</label>
                          <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="bg-secondary/20 h-11 rounded-xl border-white/[0.08] focus:outline-none focus:ring-1 focus:ring-[#bb740a] focus:border-[#bb740a]" required />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-medium text-muted-foreground">Confirm New Password</label>
                          <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="bg-secondary/20 h-11 rounded-xl border-white/[0.08] focus:outline-none focus:ring-1 focus:ring-[#bb740a] focus:border-[#bb740a]" required />
                        </div>
                        {newPassword && confirmPassword && newPassword !== confirmPassword && (
                          <p className="text-xs text-red-400 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Passwords do not match</p>
                        )}
                        <Button type="submit" disabled={isSavingAccount || !newPassword || newPassword !== confirmPassword} className="w-full bg-[#bb740a] hover:bg-[#bb740a]/90 text-white rounded-xl h-11 mt-2 font-semibold shadow-lg">
                          {isSavingAccount ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Updating...</> : "Update Password"}
                        </Button>
                      </form>
                    ) : (
                      <form onSubmit={handleSetPassword} className="space-y-4">
                        <p className="text-sm text-muted-foreground">You signed in with a social account. Request a password reset link to set a password for your account.</p>
                        <div className="space-y-1.5">
                          <label className="text-xs font-medium text-muted-foreground">Your Email</label>
                          <Input type="email" value={email} readOnly disabled className="bg-secondary/10 h-11 rounded-xl border-transparent text-muted-foreground cursor-not-allowed" />
                        </div>
                        <Button type="submit" disabled={isSendingReset} className="w-full bg-[#bb740a] hover:bg-[#bb740a]/90 text-white rounded-xl h-11 font-semibold shadow-lg">
                          {isSendingReset ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Sending...</> : "Send Password Reset Link"}
                        </Button>
                      </form>
                    )}
                  </div>



                  {/* Export Data */}
                  <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.08] space-y-4 md:col-span-2 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="space-y-1">
                      <h3 className="font-semibold text-foreground">Export Account Data</h3>
                      <p className="text-xs text-muted-foreground">Download a copy of all your data, including listings, messages, and profile info.</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-secondary/80 text-muted-foreground uppercase tracking-wider">Coming Soon</span>
                      <Button variant="outline" disabled className="border-white/[0.1] rounded-xl h-11 px-6 whitespace-nowrap opacity-50 cursor-not-allowed">Request Data Archive</Button>
                    </div>
                  </div>

                  {/* Danger Zone */}
                  <div className="p-6 rounded-2xl border border-red-500/20 bg-red-500/5 space-y-4 md:col-span-2 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    <div className="space-y-1">
                      <h3 className="font-semibold text-red-400 flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> Danger Zone</h3>
                      <p className="text-xs text-muted-foreground">Permanently delete your account and all associated data. This action cannot be undone.</p>
                    </div>
                    <Button variant="destructive" className="bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20 rounded-xl h-11 px-6 whitespace-nowrap transition-colors shrink-0 font-medium"
                      onClick={() => setShowDeleteConfirm(true)}>
                      <Trash2 className="w-4 h-4 mr-2" /> Delete Account
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* ── PRIVACY TAB ── */}
            {activeTab === "privacy" && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-xl font-semibold text-foreground">Privacy Preferences</h2>
                  <p className="text-sm text-muted-foreground">Control what information is visible to other students on UniMarket.</p>
                </div>
                <div className="bg-white/[0.02] border border-white/[0.08] rounded-2xl overflow-hidden divide-y divide-white/[0.05] shadow-sm">
                  {[
                    { key: "showPhone", title: "Show Phone Number", desc: "Allow buyers to see your phone number on listings.", icon: Smartphone, enabled: privacySettings.showPhone },
                    { key: "showEmail", title: "Show Email Address", desc: "Display your university email on your public profile.", icon: Mail, enabled: privacySettings.showEmail },
                    { key: "showUniversity", title: "Show University", desc: "Display your associated university campus.", icon: Globe, enabled: privacySettings.showUniversity },
                    { key: "allowDMs", title: "Allow Direct Messages", desc: "Let other students message you directly.", icon: Mail, enabled: privacySettings.allowDMs },
                    { key: "emailNotifs", title: "Email Notifications", desc: "Receive emails when you get new messages or offers.", icon: Mail, enabled: privacySettings.emailNotifs },
                  ].map((setting, idx) => {
                    const Icon = setting.icon;
                    return (
                      <div
                        key={idx}
                        onClick={() => setPrivacySettings(prev => ({ ...prev, [setting.key]: !prev[setting.key as keyof typeof privacySettings] }))}
                        className="p-5 flex items-center justify-between gap-4 hover:bg-white/[0.03] transition-colors cursor-pointer group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-secondary/50 flex items-center justify-center text-muted-foreground group-hover:text-[#bb740a] transition-colors">
                            <Icon className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold text-foreground">{setting.title}</h4>
                            <p className="text-xs text-muted-foreground mt-0.5">{setting.desc}</p>
                          </div>
                        </div>
                        <div className={`w-12 h-6 rounded-full relative transition-colors ${setting.enabled ? 'bg-[#bb740a]' : 'bg-secondary/80'}`}>
                          <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform shadow-sm ${setting.enabled ? 'translate-x-6' : 'translate-x-0'}`} />
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-end pt-2">
                  <Button onClick={handleSavePrivacy} disabled={isSavingPrivacy} className="bg-[#bb740a] hover:bg-[#bb740a]/90 text-white rounded-xl h-11 px-8 font-semibold shadow-lg">
                    {isSavingPrivacy ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> : <><Save className="w-4 h-4 mr-2" />Save Preferences</>}
                  </Button>
                </div>
              </div>
            )}

            {/* ── SECURITY TAB ── */}
            {activeTab === "security" && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-xl font-semibold text-foreground">Security Settings</h2>
                  <p className="text-sm text-muted-foreground">Advanced security features to protect your account.</p>
                </div>
                <div className="space-y-6">
                  {/* 2FA — Future Feature */}
                  <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.08] flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm opacity-70">
                    <div className="flex items-start gap-5">
                      <div className="w-12 h-12 rounded-2xl bg-[#bb740a]/10 flex items-center justify-center text-[#bb740a] shrink-0 border border-[#bb740a]/20">
                        <Shield className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1.5">
                          <h3 className="font-semibold text-foreground text-base">Two-Factor Authentication</h3>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-secondary/80 text-muted-foreground uppercase tracking-wider">Coming Soon</span>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">Protect your account with an extra layer of security using an authenticator app or SMS.</p>
                      </div>
                    </div>
                    <Button variant="outline" disabled className="shrink-0 rounded-xl h-11 px-6 border-white/[0.1] font-medium opacity-50 cursor-not-allowed">Configure 2FA</Button>
                  </div>

                  {/* Sessions — Future Feature */}
                  <div className="rounded-2xl bg-white/[0.02] border border-white/[0.08] overflow-hidden shadow-sm opacity-70">
                    <div className="p-6 border-b border-white/[0.05] bg-white/[0.01] flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-foreground">Active Sessions</h3>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-secondary/80 text-muted-foreground uppercase tracking-wider">Coming Soon</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">View and manage devices currently logged into your account.</p>
                      </div>
                    </div>
                    <div className="p-8 flex flex-col items-center justify-center text-center gap-3">
                      <Monitor className="w-10 h-10 text-muted-foreground opacity-30" />
                      <p className="text-sm text-muted-foreground">Session management will be available in a future update.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </div>

      {/* Delete Account Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowDeleteConfirm(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#0f0f0f] border border-red-500/20 rounded-2xl p-7 max-w-md w-full shadow-2xl"
            >
              <div className="flex items-center gap-4 mb-5">
                <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-400 shrink-0">
                  <Trash2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">Delete Account</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">This action is permanent and cannot be undone.</p>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/15 mb-6 space-y-2">
                <p className="text-sm text-foreground font-medium">You are about to permanently delete:</p>
                <ul className="text-xs text-muted-foreground space-y-1.5 list-disc pl-4">
                  <li>Your profile and all account data</li>
                  <li>All your marketplace listings</li>
                  <li>All your messages and conversations</li>
                </ul>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 rounded-xl h-11 border-white/[0.1] hover:bg-white/[0.05]"
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  disabled={isDeletingAccount}
                  onClick={handleDeleteAccount}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white rounded-xl h-11 font-semibold"
                >
                  {isDeletingAccount ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Deleting...</> : "Yes, Delete My Account"}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
