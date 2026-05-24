import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { GraduationCap, Search, Check, Loader2, ArrowRight, LogOut, AlertCircle } from "lucide-react";

interface University {
  id: string;
  name: string;
}

export default function OnboardingPage() {
  const { user, completeProfile, logout } = useAuth();
  const navigate = useNavigate();

  const [universities, setUniversities] = useState<University[]>([]);
  const [filteredUniversities, setFilteredUniversities] = useState<University[]>([]);
  const [selectedUniversity, setSelectedUniversity] = useState<University | null>(null);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 1. Fetch Universities from /api/v1/universities
  useEffect(() => {
    const fetchUniversities = async () => {
      try {
        const response = await fetch("/api/v1/universities");
        if (!response.ok) {
          throw new Error("Failed to fetch universities.");
        }
        const data: University[] = await response.json();
        setUniversities(data);
        setFilteredUniversities(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load universities.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUniversities();
  }, []);

  // 2. Filter universities based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredUniversities(universities);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredUniversities(
        universities.filter((uni) => uni.name.toLowerCase().includes(query))
      );
    }
  }, [searchQuery, universities]);

  // 3. Handle click outside dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // 4. Handle Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUniversity) {
      toast.error("Please select a university to continue.");
      return;
    }

    setIsSubmitting(true);
    try {
      await completeProfile(selectedUniversity.id);
      toast.success("Profile completed successfully!", {
        description: "Welcome to the UniMarket community!",
      });
      navigate("/dashboard");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to complete onboarding.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#f4f5f2] dark:bg-[#0d0f0e] bg-[radial-gradient(circle_at_15%_20%,rgba(216,162,74,0.16)_0%,transparent_55%),radial-gradient(circle_at_85%_0%,rgba(42,166,127,0.18)_0%,transparent_50%)]">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-[#151816] rounded-2xl shadow-[0_18px_40px_rgba(10,12,11,0.08)] dark:shadow-[0_20px_45px_rgba(0,0,0,0.4)] border border-[rgba(18,20,18,0.12)] dark:border-white/10 px-6 py-8 relative">
          
          {/* Header Info */}
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-[#0f1411] flex items-center justify-center shadow-[0_8px_20px_rgba(15,107,79,0.25)]">
                <svg width="24" height="24" viewBox="0 0 64 64" fill="none">
                  <circle cx="32" cy="32" r="30" fill="#0f1411" />
                  <path
                    d="M19 36c0-9 6-16 13-18 6-2 13 2 13 10 0 10-8 18-20 18-4 0-6-3-6-10Z"
                    fill="url(#gradient-logo)"
                  />
                  <path
                    d="M26 40c6-3 12-9 14-16"
                    stroke="#f4f2ee"
                    strokeWidth="2.6"
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="gradient-logo" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#2aa67f" />
                      <stop offset="100%" stopColor="#d8a24a" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <span className="font-bold text-sm tracking-tight text-[#121412] dark:text-[#f4f2ee]">
                UniMarket
              </span>
            </div>
            
            <button
              onClick={() => {
                logout();
                navigate("/login");
              }}
              className="flex items-center gap-1.5 text-xs text-[#5f5b52] dark:text-[#b7b1a6] hover:text-red-500 dark:hover:text-red-400 transition-colors py-1 px-2.5 rounded-lg border border-[rgba(18,20,18,0.12)] dark:border-white/10 bg-white dark:bg-[#121412] cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>

          <h2 className="text-xl font-extrabold text-[#121412] dark:text-[#f4f2ee] tracking-tight">
            Welcome to UniMarket{user?.first_name ? `, ${user.first_name}` : ""}! 🎉
          </h2>
          <p className="text-xs text-[#5f5b52] dark:text-[#b7b1a6] mt-1 leading-relaxed">
            We're excited to have you! Let's complete your profile setup by selecting your university so you can access your campus marketplace.
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div className="space-y-2 relative" ref={dropdownRef}>
              <label className="text-xs font-bold text-[#121412] dark:text-[#f4f2ee] flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-[#d8a24a] dark:text-[#e4b363]" />
                Select Your University
              </label>

              {isLoading ? (
                // Skeletons while loading
                <div className="w-full h-11 bg-gray-100 dark:bg-[#121412] rounded-lg animate-pulse border border-gray-200 dark:border-white/5 flex items-center px-3 gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-[#d8a24a]" />
                  <span className="text-xs text-[#5f5b52]/50">Loading universities...</span>
                </div>
              ) : error ? (
                // Error card
                <div className="p-3.5 rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/10 dark:border-red-900/30 text-red-600 dark:text-red-400 text-xs flex gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <div className="space-y-1">
                    <p className="font-semibold">Could not load campus list.</p>
                    <p className="opacity-90">{error}</p>
                    <button
                      type="button"
                      onClick={() => window.location.reload()}
                      className="underline font-bold hover:text-red-700 mt-1 block"
                    >
                      Retry Connection
                    </button>
                  </div>
                </div>
              ) : (
                // Autocomplete Selection Box
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full text-left px-3.5 py-3 text-sm rounded-lg border border-[rgba(18,20,18,0.12)] dark:border-white/10 bg-white dark:bg-[#121412] text-[#121412] dark:text-[#f4f2ee] focus:outline-none focus:ring-2 focus:ring-[#d8a24a] transition-all flex items-center justify-between cursor-pointer"
                  >
                    <span className={selectedUniversity ? "font-medium" : "text-[#5f5b52]/50 dark:text-[#b7b1a6]/50"}>
                      {selectedUniversity ? selectedUniversity.name : "Search or select university"}
                    </span>
                    <span className="text-xs text-[#5f5b52] dark:text-[#b7b1a6] transition-transform duration-200">
                      ▼
                    </span>
                  </button>

                  {/* Dropdown Card */}
                  {isOpen && (
                    <div className="absolute left-0 right-0 top-full mt-1.5 bg-white dark:bg-[#151816] border border-[rgba(18,20,18,0.12)] dark:border-white/10 rounded-xl shadow-[0_12px_30px_rgba(0,0,0,0.15)] z-50 overflow-hidden max-h-60 flex flex-col">
                      
                      {/* Search Bar */}
                      <div className="p-2 border-b border-[rgba(18,20,18,0.08)] dark:border-white/5 bg-gray-50/50 dark:bg-[#121412] flex items-center gap-2">
                        <Search className="w-3.5 h-3.5 text-[#5f5b52] dark:text-[#b7b1a6] shrink-0" />
                        <input
                          type="text"
                          placeholder="Type to filter..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full bg-transparent text-xs text-[#121412] dark:text-[#f4f2ee] focus:outline-none border-none py-1"
                        />
                      </div>

                      {/* Items */}
                      <div className="overflow-y-auto flex-1 py-1">
                        {filteredUniversities.length === 0 ? (
                          <div className="px-4 py-3.5 text-xs text-[#5f5b52]/60 text-center">
                            No campuses match "{searchQuery}"
                          </div>
                        ) : (
                          filteredUniversities.map((uni) => (
                            <button
                              key={uni.id}
                              type="button"
                              onClick={() => {
                                setSelectedUniversity(uni);
                                setIsOpen(false);
                                setSearchQuery("");
                              }}
                              className="w-full text-left px-4 py-2.5 text-xs text-[#121412] dark:text-[#f4f2ee] hover:bg-gray-50 dark:hover:bg-[#1a1d1b] flex items-center justify-between transition-colors cursor-pointer"
                            >
                              <span className={selectedUniversity?.id === uni.id ? "font-bold text-[#d8a24a] dark:text-[#e4b363]" : ""}>
                                {uni.name}
                              </span>
                              {selectedUniversity?.id === uni.id && (
                                <Check className="w-3.5 h-3.5 text-[#d8a24a] dark:text-[#e4b363]" />
                              )}
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={!selectedUniversity || isSubmitting}
                className="w-full bg-[#d8a24a] dark:bg-[#e4b363] text-[#121412] rounded-full px-4 py-3 text-sm font-semibold shadow-[0_8px_20px_rgba(216,162,74,0.25)] hover:shadow-[0_12px_20px_rgba(216,162,74,0.3)] hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#d8a24a] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Completing your profile...
                  </>
                ) : (
                  <>
                    Complete Registration
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
}
