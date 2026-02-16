import React, { useEffect, useMemo, useState } from "react";
import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  reload,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { httpsCallable } from "firebase/functions";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { auth, cloudFunctions, db, googleProvider, storage } from "./firebase";
import "./App.css";

const categories = [
  { title: "Electronics", count: 128 },
  { title: "Furniture", count: 86 },
  { title: "Books", count: 204 },
  { title: "Fashion", count: 142 },
  { title: "Sports", count: 51 },
  { title: "Hostel Finds", count: 67 },
];

const universities = [
  "Adventist University of Central Africa",
  "African Leadership University, Rwanda",
  "Catholic University of Rwanda",
  "East African University Rwanda",
  "Institut Catholique de Kabgayi",
  "Institut d'Enseignement Superieur de Ruhengeri",
  "Institute of Legal Practice and Development",
  "Kibogora Polytechnic",
  "Mount Kigali University",
  "Protestant University of Rwanda",
  "Universite Libre de Kigali",
  "University of Gitwe",
  "University of Global Health Equity",
  "University of Kigali",
  "University of Lay Adventists of Kigali",
  "University of Rwanda",
  "University of Technology and Arts of Byumba",
  "University of Tourism Technology and Business Studies",
  "Vatel School Rwanda",
];

const initialProducts = [
  {
    id: 1,
    name: "Dell XPS 13 i7 (2019)",
    price: "590,000 RWF",
    location: "Kigali - Kicukiro",
    rating: 4.8,
    tag: "Verified",
    university: "African Leadership University, Rwanda",
    image:
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 2,
    name: "Ergo Study Desk + Chair",
    price: "120,000 RWF",
    location: "Kigali - Nyarugenge",
    rating: 4.6,
    tag: "Fast Pickup",
    university: "University of Kigali",
    image:
      "https://images.unsplash.com/photo-1487017159836-4e23ece2e4cf?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 3,
    name: "Canon EOS M50 Kit",
    price: "410,000 RWF",
    location: "Kigali - Gasabo",
    rating: 4.7,
    tag: "Like New",
    university: "University of Rwanda",
    image:
      "https://images.unsplash.com/photo-1519183071298-a2962be90b8e?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 4,
    name: "Kitchen Starter Pack",
    price: "38,000 RWF",
    location: "Kigali - Kimihurura",
    rating: 4.5,
    tag: "Bundle",
    university: "Adventist University of Central Africa",
    image:
      "https://images.unsplash.com/photo-1506368249639-73a05d6f6488?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 5,
    name: "Textbooks: Data Science",
    price: "18,000 RWF",
    location: "Huye - UR",
    rating: 4.9,
    tag: "Top Rated",
    university: "University of Rwanda",
    image:
      "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 6,
    name: "Nike Training Shoes",
    price: "35,000 RWF",
    location: "Kigali - Remera",
    rating: 4.4,
    tag: "Hot Deal",
    university: "Mount Kigali University",
    image:
      "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 7,
    name: "HP Pavilion 15",
    price: "420,000 RWF",
    location: "Kigali - Gikondo",
    rating: 4.3,
    tag: "Great Value",
    university: "University of Kigali",
    image:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 8,
    name: "Engineering Drawing Kit",
    price: "22,000 RWF",
    location: "Huye - UR",
    rating: 4.7,
    tag: "New",
    university: "University of Rwanda",
    image:
      "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 9,
    name: "Hostel Bedding Set",
    price: "29,000 RWF",
    location: "Kigali - Kacyiru",
    rating: 4.5,
    tag: "Bundle",
    university: "Adventist University of Central Africa",
    image:
      "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 10,
    name: "MacBook Pro 13 (2018)",
    price: "780,000 RWF",
    location: "Kigali - Kimihurura",
    rating: 4.9,
    tag: "Verified",
    university: "African Leadership University, Rwanda",
    image:
      "https://images.unsplash.com/photo-1487017159836-4e23ece2e4cf?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 11,
    name: "Mini Fridge",
    price: "95,000 RWF",
    location: "Kigali - Remera",
    rating: 4.4,
    tag: "Fast Pickup",
    university: "Mount Kigali University",
    image:
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 12,
    name: "Textbooks: Business",
    price: "16,000 RWF",
    location: "Kigali - Nyarugenge",
    rating: 4.6,
    tag: "Top Rated",
    university: "Universite Libre de Kigali",
    image:
      "https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 13,
    name: "iPad 9th Gen + Pencil",
    price: "350,000 RWF",
    location: "Kigali - Kacyiru",
    rating: 4.7,
    tag: "Hot Deal",
    university: "University of Kigali",
    image:
      "https://images.unsplash.com/photo-1542751110-97427bbecf20?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 14,
    name: "Graphic Calculator FX-991",
    price: "35,000 RWF",
    location: "Huye - UR",
    rating: 4.5,
    tag: "New",
    university: "University of Rwanda",
    image:
      "https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 15,
    name: "Dorm Storage Cabinet",
    price: "65,000 RWF",
    location: "Kigali - Gikondo",
    rating: 4.4,
    tag: "Bundle",
    university: "Adventist University of Central Africa",
    image:
      "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 16,
    name: "Wireless Microphone Set",
    price: "58,000 RWF",
    location: "Kigali - Remera",
    rating: 4.6,
    tag: "Verified",
    university: "African Leadership University, Rwanda",
    image:
      "https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 17,
    name: "Standing Desk Converter",
    price: "95,000 RWF",
    location: "Kigali - Kimihurura",
    rating: 4.8,
    tag: "Like New",
    university: "Mount Kigali University",
    image:
      "https://images.unsplash.com/photo-1487017159836-4e23ece2e4cf?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 18,
    name: "Samsung Galaxy A52",
    price: "240,000 RWF",
    location: "Kigali - Nyamirambo",
    rating: 4.5,
    tag: "Fast Pickup",
    university: "University of Kigali",
    image:
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 19,
    name: "Campus Bicycle",
    price: "160,000 RWF",
    location: "Huye - UR",
    rating: 4.3,
    tag: "Best Value",
    university: "University of Rwanda",
    image:
      "https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 20,
    name: "Bluetooth Speaker",
    price: "28,000 RWF",
    location: "Kigali - Kicukiro",
    rating: 4.4,
    tag: "New",
    university: "University of Kigali",
    image:
      "https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 21,
    name: "Logitech Wireless Mouse",
    price: "12,000 RWF",
    location: "Kigali - Remera",
    rating: 4.6,
    tag: "New",
    university: "University of Kigali",
    image:
      "https://images.unsplash.com/photo-1527814050087-3793815479db?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 22,
    name: "Noise-Canceling Headphones",
    price: "72,000 RWF",
    location: "Kigali - Kicukiro",
    rating: 4.7,
    tag: "Verified",
    university: "African Leadership University, Rwanda",
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 23,
    name: "Dorm Study Lamp",
    price: "9,500 RWF",
    location: "Huye - UR",
    rating: 4.3,
    tag: "Best Value",
    university: "University of Rwanda",
    image:
      "https://images.unsplash.com/photo-1493666438817-866a91353ca9?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 24,
    name: "Mini Projector",
    price: "115,000 RWF",
    location: "Kigali - Kimihurura",
    rating: 4.5,
    tag: "Like New",
    university: "Mount Kigali University",
    image:
      "https://images.unsplash.com/photo-1523475472560-d2df97ec485c?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 25,
    name: "Canon Printer",
    price: "85,000 RWF",
    location: "Kigali - Nyarugenge",
    rating: 4.4,
    tag: "Fast Pickup",
    university: "Universite Libre de Kigali",
    image:
      "https://images.unsplash.com/photo-1589330694653-ded6df03f754?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 26,
    name: "Backpack + Laptop Sleeve",
    price: "18,000 RWF",
    location: "Kigali - Kacyiru",
    rating: 4.6,
    tag: "Bundle",
    university: "Adventist University of Central Africa",
    image:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 27,
    name: "Study Chair Ergonomic",
    price: "75,000 RWF",
    location: "Kigali - Gasabo",
    rating: 4.5,
    tag: "Top Rated",
    university: "University of Kigali",
    image:
      "https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 28,
    name: "Raspberry Pi Kit",
    price: "62,000 RWF",
    location: "Huye - UR",
    rating: 4.7,
    tag: "New",
    university: "University of Rwanda",
    image:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 29,
    name: "Gym Resistance Set",
    price: "14,000 RWF",
    location: "Kigali - Remera",
    rating: 4.2,
    tag: "Hot Deal",
    university: "Mount Kigali University",
    image:
      "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 30,
    name: "Microwave Oven",
    price: "110,000 RWF",
    location: "Kigali - Gikondo",
    rating: 4.4,
    tag: "Verified",
    university: "Adventist University of Central Africa",
    image:
      "https://images.unsplash.com/photo-1586201375754-1421e1fcbdd0?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 31,
    name: "Smart Watch",
    price: "55,000 RWF",
    location: "Kigali - Kicukiro",
    rating: 4.3,
    tag: "Like New",
    university: "University of Kigali",
    image:
      "https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 32,
    name: "Wireless Keyboard",
    price: "19,000 RWF",
    location: "Kigali - Kimihurura",
    rating: 4.5,
    tag: "New",
    university: "African Leadership University, Rwanda",
    image:
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 33,
    name: "Electric Kettle",
    price: "13,000 RWF",
    location: "Huye - UR",
    rating: 4.2,
    tag: "Best Value",
    university: "University of Rwanda",
    image:
      "https://images.unsplash.com/photo-1506368249639-73a05d6f6488?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 34,
    name: "Photography Tripod",
    price: "22,000 RWF",
    location: "Kigali - Gasabo",
    rating: 4.4,
    tag: "New",
    university: "African Leadership University, Rwanda",
    image:
      "https://images.unsplash.com/photo-1519183071298-a2962be90b8e?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 35,
    name: "USB-C Hub",
    price: "18,500 RWF",
    location: "Kigali - Nyarugenge",
    rating: 4.6,
    tag: "Verified",
    university: "Universite Libre de Kigali",
    image:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 36,
    name: "Android Tablet",
    price: "190,000 RWF",
    location: "Kigali - Remera",
    rating: 4.3,
    tag: "Fast Pickup",
    university: "Mount Kigali University",
    image:
      "https://images.unsplash.com/photo-1542751110-97427bbecf20?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 37,
    name: "Whiteboard + Markers",
    price: "17,000 RWF",
    location: "Huye - UR",
    rating: 4.5,
    tag: "Bundle",
    university: "University of Rwanda",
    image:
      "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 38,
    name: "External SSD 512GB",
    price: "89,000 RWF",
    location: "Kigali - Kacyiru",
    rating: 4.8,
    tag: "Top Rated",
    university: "University of Kigali",
    image:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 39,
    name: "Blender",
    price: "38,000 RWF",
    location: "Kigali - Gikondo",
    rating: 4.2,
    tag: "New",
    university: "Adventist University of Central Africa",
    image:
      "https://images.unsplash.com/photo-1506368083636-6defb67639b7?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 40,
    name: "Gaming Controller",
    price: "30,000 RWF",
    location: "Kigali - Kimihurura",
    rating: 4.4,
    tag: "Hot Deal",
    university: "African Leadership University, Rwanda",
    image:
      "https://images.unsplash.com/photo-1605901309584-818e25960a8f?auto=format&fit=crop&w=900&q=80",
  },
];

const testimonials = [
  {
    name: "Aline M.",
    school: "CMU Africa",
    quote:
      "I listed my old laptop and got paid the same day. The buyer pickup was smooth.",
  },
  {
    name: "Jean P.",
    school: "AUCA",
    quote:
      "The verified badge really builds trust. I found a study desk in 20 minutes.",
  },
  {
    name: "Claudine R.",
    school: "UR",
    quote:
      "UniMarket feels like a campus marketplace, just with better choices.",
  },
];

const businessBundles = [
  {
    id: "weekly-basic",
    name: "Weekly Starter",
    priceUsd: 1,
    durationDays: 7,
    description: "For quick market testing and weekly inventory refresh.",
    features: ["Publish up to 10 items", "Business badge", "WhatsApp lead access"],
  },
  {
    id: "monthly-basic",
    name: "Monthly Standard",
    priceUsd: 5,
    durationDays: 30,
    description: "Best value for active shops posting continuously.",
    features: ["Publish up to 60 items", "Priority listing refresh", "Business badge"],
  },
  {
    id: "weekly-plus",
    name: "Weekly Plus Bundle",
    priceUsd: 3,
    durationDays: 7,
    description: "Weekly plan with extra visibility slots.",
    features: ["Publish up to 25 items", "1 featured slot", "Priority support"],
  },
  {
    id: "monthly-pro",
    name: "Monthly Pro Bundle",
    priceUsd: 12,
    durationDays: 30,
    description: "For established stores wanting stronger exposure.",
    features: ["Publish up to 200 items", "5 featured slots", "Advanced shop insights"],
  },
];

const fallbackDetailImages = [
  "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=900&q=80",
];

export default function App() {
  const [products, setProducts] = useState(initialProducts);
  const [currentView, setCurrentView] = useState("home");
  const [selectedUniversity, setSelectedUniversity] = useState("All");
  const [checkoutProduct, setCheckoutProduct] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("MTN MoMo");
  const [deliveryMethod, setDeliveryMethod] = useState("Campus pickup");
  const [quantity, setQuantity] = useState(1);
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [confirmationSent, setConfirmationSent] = useState(false);
  const [confirmationError, setConfirmationError] = useState("");
  const [listingSubmitted, setListingSubmitted] = useState(false);
  const [listingError, setListingError] = useState("");
  const [listingData, setListingData] = useState({
    publisherType: "student",
    name: "",
    category: "",
    price: "",
    university: "University of Rwanda",
    condition: "Used - good",
    payment: "MTN MoMo",
    delivery: "Campus pickup",
    description: "",
    sellerName: "",
    sellerPhone: "",
    sellerResponse: "Under 1 hour",
  });
  const [businessSubscription, setBusinessSubscription] = useState(() => {
    const stored = localStorage.getItem("unimarket_business_subscription");
    if (!stored) return null;
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  });
  const [selectedBusinessBundle, setSelectedBusinessBundle] = useState(
    "weekly-basic"
  );
  const [subscriptionNotice, setSubscriptionNotice] = useState("");
  const [profileData, setProfileData] = useState({
    name: "Student Seller",
    university: "University of Rwanda",
    bio: "Reliable campus seller. Fast replies and safe handovers.",
    phone: "+250 789 000 000",
    email: "student@unimarket.rw",
    preferredPayment: "MTN MoMo",
    program: "Computer Science",
    year: "Year 3",
    skills: "UI Design, Data Analysis, Marketing",
    languages: "English, Kinyarwanda, French",
    linkedin: "linkedin.com/in/student",
    instagram: "@student.seller",
  });
  const [profileToasts, setProfileToasts] = useState([]);
  const [profileAvatar, setProfileAvatar] = useState("");
  const [profileCover, setProfileCover] = useState("");
  const [authUser, setAuthUser] = useState(null);
  const [verificationRequests, setVerificationRequests] = useState([]);
  const [signInOpen, setSignInOpen] = useState(false);
  const [signInStep, setSignInStep] = useState("email");
  const [signInData, setSignInData] = useState({
    university: "University of Rwanda",
    email: "",
    password: "",
    code: "",
  });
  const [signInError, setSignInError] = useState("");
  const [signInSuccess, setSignInSuccess] = useState(false);
  const [, setIsVerified] = useState(
    () => localStorage.getItem("unimarket_verified") === "true"
  );
  const [resendNotice, setResendNotice] = useState("");
  const [, setPendingApproval] = useState(false);
  const [adminConfig, setAdminConfig] = useState(() => {
    const stored = localStorage.getItem("unimarket_admin_config");
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return { email: "patrickvenansio123@gmail.com", password: "2846" };
      }
    }
    return { email: "patrickvenansio123@gmail.com", password: "2846" };
  });
  const [isAdmin, setIsAdmin] = useState(
    () => localStorage.getItem("unimarket_admin") === "true"
  );
  const [deals, setDeals] = useState([
    {
      id: "deal-1",
      title: "Freshers Starter Kit",
      detail: "Bedset + lamp + storage box",
      imageUrl:
        "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1400&q=80",
      active: true,
      featured: true,
      schedule: "Always on",
    },
    {
      id: "deal-2",
      title: "Creator Bundle",
      detail: "Laptop + camera + tripod",
      imageUrl:
        "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1400&q=80",
      active: true,
      featured: false,
      schedule: "Weekends",
    },
    {
      id: "deal-3",
      title: "Exam Season Pack",
      detail: "Desk + chair + whiteboard",
      imageUrl:
        "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1400&q=80",
      active: false,
      featured: false,
      schedule: "April - May",
    },
  ]);
  const [newDeal, setNewDeal] = useState({
    title: "",
    detail: "",
    imageUrl: "",
    schedule: "Always on",
    featured: false,
    active: true,
  });
  const [dealsHeroImages, setDealsHeroImages] = useState(() => {
    const stored = localStorage.getItem("unimarket_deals_hero_images");
    if (!stored) return [];
    try {
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });
  const [dealsHeroProductIds, setDealsHeroProductIds] = useState(() => {
    const stored = localStorage.getItem("unimarket_deals_hero_product_ids");
    if (!stored) return [];
    try {
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });
  const [dealsBgIndex, setDealsBgIndex] = useState(0);
  const [dealsHeroSelection, setDealsHeroSelection] = useState({});
  const [dealsHeroUrlDraft, setDealsHeroUrlDraft] = useState("");
  const [dealsHeroUploadError, setDealsHeroUploadError] = useState("");
  const [adminLoginOpen, setAdminLoginOpen] = useState(false);
  const [adminLoginData, setAdminLoginData] = useState({
    email: "",
    password: "",
  });
  const [adminLoginError, setAdminLoginError] = useState("");
  const [adminConfigDraft, setAdminConfigDraft] = useState(() => ({
    email: adminConfig.email,
    password: adminConfig.password,
  }));
  const [adminSection, setAdminSection] = useState("overview");
  const [analyticsRange, setAnalyticsRange] = useState("7d");
  const [customRange, setCustomRange] = useState({ from: "", to: "" });
  const [universityFilter, setUniversityFilter] = useState("All");
  const [compareUniversities, setCompareUniversities] = useState({
    left: "University of Rwanda",
    right: "University of Kigali",
  });
  const [liveTick, setLiveTick] = useState(0);
  const [idScanStatus, setIdScanStatus] = useState("idle");
  const [autoCode, setAutoCode] = useState("");
  const [listingOpen, setListingOpen] = useState(false);
  const [listingImages, setListingImages] = useState([]);
  const [mainImageIndex, setMainImageIndex] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [themeMode, setThemeMode] = useState("system");
  const [detailProduct, setDetailProduct] = useState(null);
  const [detailImageIndex, setDetailImageIndex] = useState(0);

  useEffect(() => {
    const productsRef = collection(db, "products");
    const q = query(productsRef, orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      if (items.length > 0) {
        setProducts(items);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthUser(user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!isAdmin) {
      setVerificationRequests([]);
      return;
    }
    const requestsRef = collection(db, "verificationRequests");
    const q = query(requestsRef, where("status", "==", "pending"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setVerificationRequests(items);
    });
    return () => unsubscribe();
  }, [isAdmin]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setLiveTick((value) => value + 1);
    }, 6000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "unimarket_deals_hero_images",
      JSON.stringify(dealsHeroImages.slice(0, 30))
    );
  }, [dealsHeroImages]);

  useEffect(() => {
    localStorage.setItem(
      "unimarket_deals_hero_product_ids",
      JSON.stringify(dealsHeroProductIds.slice(0, 60))
    );
  }, [dealsHeroProductIds]);

  useEffect(() => {
    if (!businessSubscription) {
      localStorage.removeItem("unimarket_business_subscription");
      return;
    }
    localStorage.setItem(
      "unimarket_business_subscription",
      JSON.stringify(businessSubscription)
    );
  }, [businessSubscription]);

  const dealsCarouselImages = useMemo(() => {
    const dealImages = deals
      .filter((deal) => deal.active !== false && Boolean(deal.featured))
      .map((deal) => deal.imageUrl)
      .filter(Boolean);

    const selectedProductImages = dealsHeroProductIds
      .map((id) => products.find((p) => String(p.id) === String(id)))
      .map((p) => p?.image)
      .filter(Boolean);

    const curated = [...dealsHeroImages, ...dealImages, ...selectedProductImages]
      .map((url) => String(url).trim())
      .filter(Boolean);

    const seen = new Set();
    const unique = [];
    curated.forEach((url) => {
      if (seen.has(url)) return;
      seen.add(url);
      unique.push(url);
    });

    if (unique.length === 0) {
      return products.slice(0, 10).map((p) => p.image).filter(Boolean);
    }
    return unique.slice(0, 12);
  }, [deals, dealsHeroImages, dealsHeroProductIds, products]);

  useEffect(() => {
    if (dealsCarouselImages.length <= 1) return;
    const timer = window.setInterval(() => {
      setDealsBgIndex((prev) => (prev + 1) % dealsCarouselImages.length);
    }, 5200);
    return () => window.clearInterval(timer);
  }, [dealsCarouselImages.length]);

  const filteredProducts = useMemo(() => {
    if (selectedUniversity === "All") {
      return products;
    }
    return products.filter(
      (product) => product.university === selectedUniversity
    );
  }, [selectedUniversity, products]);

  const activeBusinessSubscription = useMemo(() => {
    if (!businessSubscription?.expiresAt) return null;
    const expiresAt = new Date(businessSubscription.expiresAt).getTime();
    if (Number.isNaN(expiresAt)) return null;
    if (Date.now() > expiresAt) return null;
    return businessSubscription;
  }, [businessSubscription]);

  const spotlightDeal = useMemo(() => {
    const activeDeals = deals.filter((deal) => deal.active !== false);
    return (
      activeDeals.find((deal) => Boolean(deal.featured)) ||
      activeDeals[0] ||
      null
    );
  }, [deals]);

  const openCheckout = (product) => {
    setCheckoutProduct(product);
    setQuantity(1);
    setOrderConfirmed(false);
    setOrderId("");
    setContactEmail("");
    setContactPhone("");
    setConfirmationSent(false);
    setConfirmationError("");
  };

  const closeCheckout = () => {
    setCheckoutProduct(null);
  };

  const openDetails = (product) => {
    setDetailProduct(product);
    setDetailImageIndex(0);
  };

  const closeDetails = () => {
    setDetailProduct(null);
  };

  const getDetailMedia = (product) => {
    if (!product) return [];
    if (product.media && product.media.length > 0) {
      return product.media;
    }
    const imageList = product.images || [product.image, ...fallbackDetailImages];
    return imageList.map((url) => ({ url, type: "image" }));
  };

  const confirmOrder = () => {
    const randomId = `UM-${Math.floor(100000 + Math.random() * 900000)}`;
    setOrderId(randomId);
    setOrderConfirmed(true);
    setConfirmationSent(false);
    setConfirmationError("");
  };

  const isValidEmail = (value) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

  const normalizePhone = (value) => value.replace(/\s+/g, "");

  const isValidPhone = (value) =>
    /^(\+250|0)7\d{8}$/.test(normalizePhone(value));

  const sendConfirmation = () => {
    const hasEmail = contactEmail.trim().length > 0;
    const hasPhone = contactPhone.trim().length > 0;

    if (!hasEmail && !hasPhone) {
      setConfirmationError("Add an email or phone number.");
      setConfirmationSent(false);
      return;
    }

    if (hasEmail && !isValidEmail(contactEmail)) {
      setConfirmationError("Enter a valid email address.");
      setConfirmationSent(false);
      return;
    }

    if (hasPhone && !isValidPhone(contactPhone)) {
      setConfirmationError("Use a valid Rwanda phone number.");
      setConfirmationSent(false);
      return;
    }

    setConfirmationError("");
    setConfirmationSent(true);
  };

  const printReceipt = () => {
    window.print();
  };

  const handleListingChange = (event) => {
    const { name, value } = event.target;
    setListingData((prev) => ({ ...prev, [name]: value }));
  };

  const activateBusinessSubscription = () => {
    const bundle = businessBundles.find((item) => item.id === selectedBusinessBundle);
    if (!bundle) return;
    const startedAt = new Date();
    const expiresAt = new Date(
      startedAt.getTime() + bundle.durationDays * 24 * 60 * 60 * 1000
    );
    setBusinessSubscription({
      ...bundle,
      startedAt: startedAt.toISOString(),
      expiresAt: expiresAt.toISOString(),
      status: "active",
    });
    setSubscriptionNotice(
      `${bundle.name} activated. Expires ${expiresAt.toLocaleDateString("en-US")}.`
    );
    window.setTimeout(() => setSubscriptionNotice(""), 3500);
  };

  const getLocationFromUniversity = (university) => {
    if (university.includes("University of Rwanda")) {
      return "Huye - UR";
    }
    if (university.includes("University of Global Health Equity")) {
      return "Butaro - UGHE";
    }
    if (university.includes("University of Kigali")) {
      return "Kigali - KG";
    }
    if (university.includes("African Leadership University")) {
      return "Kigali - ALU";
    }
    if (university.includes("Universite Libre de Kigali")) {
      return "Kigali - ULK";
    }
    return "Kigali";
  };

  const submitListing = async (event) => {
    event.preventDefault();
    if (listingData.publisherType === "business" && !activeBusinessSubscription) {
      setListingError(
        "Business accounts require an active subscription (weekly or monthly) before publishing."
      );
      setListingSubmitted(false);
      return;
    }
    if (listingData.sellerPhone && !isValidPhone(listingData.sellerPhone)) {
      setListingError("Use a valid Rwanda phone number for the seller.");
      setListingSubmitted(false);
      return;
    }
    setListingError("");
    const newId = products.length
      ? Math.max(...products.map((item) => item.id)) + 1
      : 1;
    const placeholderImage =
      "https://images.unsplash.com/photo-1523473827533-2a64d0f9f66d?auto=format&fit=crop&w=900&q=80";

    const newProduct = {
      id: newId,
      name: listingData.name,
      price: listingData.price.includes("RWF")
        ? listingData.price
        : `${listingData.price} RWF`,
      location: getLocationFromUniversity(listingData.university),
      rating: 4.6,
      tag: listingData.publisherType === "business" ? "Business" : "New",
      university: listingData.university,
      image: placeholderImage,
      media: [],
      publisherType: listingData.publisherType,
      seller: {
        name: listingData.sellerName || "Verified seller",
        phone: listingData.sellerPhone || "Not provided",
        responseTime: listingData.sellerResponse,
      },
      ownerId: authUser?.uid || "guest",
      businessBundleId:
        listingData.publisherType === "business"
          ? activeBusinessSubscription?.id || null
          : null,
      businessSubscriptionExpiresAt:
        listingData.publisherType === "business"
          ? activeBusinessSubscription?.expiresAt || null
          : null,
      createdAt: serverTimestamp(),
    };

    try {
      const docRef = await addDoc(collection(db, "products"), newProduct);
      const uploads = await Promise.all(
        listingImages.map(async (media, index) => {
          const fileRef = ref(
            storage,
            `products/${docRef.id}/${index}-${media.file.name}`
          );
          await uploadBytes(fileRef, media.file, {
            contentType: media.file.type,
          });
          const url = await getDownloadURL(fileRef);
          return { url, type: media.file.type };
        })
      );
      const mainMedia = uploads[mainImageIndex] || uploads[0];
      await updateDoc(docRef, {
        media: uploads,
        image: mainMedia ? mainMedia.url : placeholderImage,
      });
      setProducts((prev) => [{ ...newProduct, id: docRef.id }, ...prev]);
    } catch {
      setListingError("Upload failed. Please try again.");
      return;
    }

    setListingSubmitted(true);
    setListingData({
      publisherType: "student",
      name: "",
      category: "",
      price: "",
      university:
        selectedUniversity !== "All"
          ? selectedUniversity
          : "University of Rwanda",
      condition: "Used - good",
      payment: "MTN MoMo",
      delivery: "Campus pickup",
      description: "",
      sellerName: "",
      sellerPhone: "",
      sellerResponse: "Under 1 hour",
    });
    setListingImages([]);
    setMainImageIndex(0);
  };

  const openListing = () => {
    setListingOpen(true);
    setListingSubmitted(false);
    setListingError("");
    setListingImages([]);
    setMainImageIndex(0);
    setListingData((prev) => ({
      ...prev,
      university:
        selectedUniversity !== "All"
          ? selectedUniversity
          : prev.university,
    }));
  };

  const closeListing = () => {
    setListingOpen(false);
  };

  const handleProfileChange = (event) => {
    const { name, value } = event.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setProfileAvatar(url);
  };

  const handleCoverChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setProfileCover(url);
  };

  const handleSignInChange = (event) => {
    const { name, value } = event.target;
    setSignInData((prev) => ({ ...prev, [name]: value }));
  };

  const openSignIn = () => {
    setSignInOpen(true);
    setSignInStep("email");
    setSignInError("");
    setSignInSuccess(false);
    setSignInData((prev) => ({ ...prev, code: "", password: "" }));
    setIdScanStatus("idle");
    setAutoCode("");
  };

  const closeSignIn = () => {
    setSignInOpen(false);
  };

  const signInWithEmail = async () => {
    if (!isValidEmail(signInData.email) || !signInData.password) {
      setSignInError("Enter email and password.");
      return;
    }
    try {
      await signInWithEmailAndPassword(
        auth,
        signInData.email,
        signInData.password
      );
      setSignInError("");
      setPendingApproval(true);
      if (idScanStatus === "verified") {
        setSignInStep("code");
      }
    } catch (error) {
      if (error.code === "auth/user-not-found") {
        setSignInError("Account not found. Create an account first.");
      } else if (error.code === "auth/wrong-password") {
        setSignInError("Wrong password. Try again.");
      } else {
        setSignInError("Sign in failed. Check your credentials.");
      }
    }
  };

  const signUpWithEmail = async () => {
    if (!isValidEmail(signInData.email) || !signInData.password) {
      setSignInError("Enter email and password.");
      return;
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        signInData.email,
        signInData.password
      );
      await sendEmailVerification(userCredential.user);
      setSignInError("");
      setPendingApproval(true);
      setResendNotice("Verification email sent. Please check your inbox.");
      if (idScanStatus === "verified") {
        setSignInStep("code");
      }
    } catch (error) {
      if (error.code === "auth/email-already-in-use") {
        setSignInError("Email already in use. Sign in instead.");
      } else if (error.code === "auth/weak-password") {
        setSignInError("Password must be at least 6 characters.");
      } else {
        setSignInError("Account creation failed.");
      }
    }
  };

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      setSignInData((prev) => ({
        ...prev,
        email: result.user?.email || prev.email,
      }));
      setSignInError("");
      setPendingApproval(true);
      if (!result.user?.emailVerified) {
        setResendNotice("Please verify your email address to continue.");
      }
      if (idScanStatus === "verified") {
        setSignInStep("code");
      }
    } catch {
      setSignInError("Google sign-in failed.");
    }
  };

  const resendVerificationEmail = async () => {
    if (!authUser) {
      setSignInError("Sign in first to resend verification.");
      return;
    }
    try {
      await sendEmailVerification(authUser);
      setResendNotice("Verification email resent. Check your inbox.");
    } catch {
      setSignInError("Could not resend verification email.");
    }
  };

  const refreshVerificationStatus = async () => {
    if (!authUser) return;
    try {
      await reload(authUser);
      if (auth.currentUser?.emailVerified) {
        setResendNotice("Email verified! You can upload your student card.");
      } else {
        setResendNotice("Email not verified yet.");
      }
    } catch {
      setSignInError("Unable to refresh verification status.");
    }
  };

  const openWhatsApp = (product) => {
    const rawPhone = product?.seller?.phone || "";
    const digits = rawPhone.replace(/\D/g, "");
    const phone = digits.startsWith("250") ? digits : `250${digits}`;
    if (!digits) {
      setSignInError("Seller phone number not available.");
      return;
    }
    const message = encodeURIComponent(
      `Hello, I'm interested in "${product.name}" listed on UniMarket. Is it still available?`
    );
    const waWeb = `https://wa.me/${phone}?text=${message}`;
    const waApp = `whatsapp://send?phone=${phone}&text=${message}`;
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (isMobile) {
      window.location.href = waApp;
      setTimeout(() => {
        window.location.href = waWeb;
      }, 900);
    } else {
      window.open(waWeb, "_blank", "noopener,noreferrer");
    }
  };

  const resendCode = () => {
    setResendNotice("Verification code resent.");
    setTimeout(() => setResendNotice(""), 2500);
  };

  const verifyCode = (event) => {
    event.preventDefault();
    if (signInData.code.trim() !== autoCode) {
      setSignInError("Enter the code sent after ID verification.");
      return;
    }
    setSignInError("");
    setSignInSuccess(true);
    setIsVerified(true);
    localStorage.setItem("unimarket_verified", "true");
    setPendingApproval(false);
  };

  const handleStudentCard = async (event) => {
    if (!authUser) {
      setSignInError("Sign in first, then upload your student card.");
      return;
    }
    if (!authUser.emailVerified) {
      setSignInError("Please verify your email before uploading your ID.");
      return;
    }
    setIdScanStatus("scanning");
    try {
      const file = event.target.files?.[0];
      if (!file) {
        setIdScanStatus("idle");
        return;
      }
      const fileRef = ref(
        storage,
        `verifications/${authUser.uid}/${file.name}`
      );
      await uploadBytes(fileRef, file, { contentType: file.type });
      const cardUrl = await getDownloadURL(fileRef);
      const requestVerification = httpsCallable(
        cloudFunctions,
        "requestStudentVerification"
      );
      await requestVerification({
        studentEmail: signInData.email,
        university: signInData.university,
        cardUrl,
      });
      const generated = `${Math.floor(1000 + Math.random() * 9000)}`;
      setAutoCode(generated);
      setSignInData((prev) => ({ ...prev, code: "" }));
      setIdScanStatus("verified");
      setSignInStep("code");
      setResendNotice("Verification code sent to your email.");
    } catch {
      setSignInError("Card upload failed. Try again.");
      setIdScanStatus("idle");
    }
  };

  const saveProfile = () => {
    const toastId = Date.now();
    setProfileToasts((prev) => [
      ...prev,
      { id: toastId, message: "Profile saved successfully." },
    ]);
    setTimeout(() => {
      setProfileToasts((prev) => prev.filter((toast) => toast.id !== toastId));
    }, 3000);
  };


  useEffect(() => {
    const root = document.documentElement;
    const media = window.matchMedia("(prefers-color-scheme: dark)");

    const applyTheme = () => {
      if (themeMode === "system") {
        root.setAttribute("data-theme", media.matches ? "dark" : "light");
      } else {
        root.setAttribute("data-theme", themeMode);
      }
    };

    applyTheme();
    media.addEventListener("change", applyTheme);
    return () => media.removeEventListener("change", applyTheme);
  }, [themeMode]);

  const openSidebar = () => setSidebarOpen(true);
  const closeSidebar = () => setSidebarOpen(false);
  const approveStudent = () => {
    setIsVerified(true);
    localStorage.setItem("unimarket_verified", "true");
    setSignInSuccess(true);
    setPendingApproval(false);
  };

  const handleDealsHeroUpload = async (event) => {
    setDealsHeroUploadError("");
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const safeName = file.name.replace(/[^\w.-]/g, "_");
      const fileRef = ref(storage, `deals/${Date.now()}-${safeName}`);
      await uploadBytes(fileRef, file, { contentType: file.type });
      const url = await getDownloadURL(fileRef);
      setDealsHeroImages((prev) => [url, ...prev].slice(0, 30));
    } catch {
      setDealsHeroUploadError(
        "Upload failed. Enable Firebase Storage in the Firebase console, then deploy storage rules."
      );
    } finally {
      event.target.value = "";
    }
  };

  const addDeal = (event) => {
    event.preventDefault();
    if (!newDeal.title.trim()) return;
    setDeals((prev) => [
      ...prev,
      {
        id: `deal-${Date.now()}`,
        title: newDeal.title.trim(),
        detail: newDeal.detail.trim(),
        imageUrl: newDeal.imageUrl.trim(),
        active: newDeal.active !== false,
        featured: Boolean(newDeal.featured),
        schedule: newDeal.schedule?.trim() || "Always on",
      },
    ]);
    setNewDeal({
      title: "",
      detail: "",
      imageUrl: "",
      schedule: "Always on",
      featured: false,
      active: true,
    });
  };

  const deleteDeal = (targetId) => {
    setDeals((prev) => prev.filter((deal, index) => (deal.id || index) !== targetId));
  };

  const toggleDealFeatured = (targetId) => {
    setDeals((prev) =>
      prev.map((deal, index) =>
        (deal.id || index) === targetId
          ? { ...deal, featured: !deal.featured }
          : deal
      )
    );
  };

  const toggleDealActive = (targetId) => {
    setDeals((prev) =>
      prev.map((deal, index) =>
        (deal.id || index) === targetId ? { ...deal, active: deal.active === false ? true : false } : deal
      )
    );
  };

  const openAdminLogin = () => {
    setAdminLoginOpen(true);
    setAdminLoginError("");
  };

  const closeAdminLogin = () => {
    setAdminLoginOpen(false);
  };

  const handleAdminLoginChange = (event) => {
    const { name, value } = event.target;
    setAdminLoginData((prev) => ({ ...prev, [name]: value }));
  };

  const submitAdminLogin = (event) => {
    event.preventDefault();
    const isEmailValid = isValidEmail(adminLoginData.email);
    const isAdminEmail = adminLoginData.email === adminConfig.email;
    const isPasswordValid = adminLoginData.password === adminConfig.password;
    if (!isEmailValid || !isAdminEmail || !isPasswordValid) {
      setAdminLoginError("Invalid admin credentials.");
      return;
    }
    setAdminLoginError("");
    setIsAdmin(true);
    localStorage.setItem("unimarket_admin", "true");
    setAdminLoginOpen(false);
    setAdminSection("overview");
    setCurrentView("admin");
    window.scrollTo(0, 0);
  };

  const signOutAdmin = () => {
    setIsAdmin(false);
    localStorage.removeItem("unimarket_admin");
    setCurrentView("home");
  };

  const handleAdminConfigChange = (event) => {
    const { name, value } = event.target;
    setAdminConfigDraft((prev) => ({ ...prev, [name]: value }));
  };

  const saveAdminConfig = () => {
    setAdminConfig(adminConfigDraft);
    localStorage.setItem(
      "unimarket_admin_config",
      JSON.stringify(adminConfigDraft)
    );
  };

  const handleListingImages = (event) => {
    const files = Array.from(event.target.files || []).filter(
      (file) => file.type.startsWith("image/") || file.type.startsWith("video/")
    );
    const newImages = files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
      name: file.name,
      type: file.type,
    }));
    setListingImages((prev) => [...prev, ...newImages].slice(0, 6));
    if (listingImages.length === 0 && files.length > 0) {
      setMainImageIndex(0);
    }
  };

  const removeListingImage = (indexToRemove) => {
    setListingImages((prev) =>
      prev.filter((_, index) => index !== indexToRemove)
    );
    setMainImageIndex((prev) => (prev === indexToRemove ? 0 : prev));
  };

  const buildPdf = (lines) => {
    const escapedLines = lines.map((line) =>
      line.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)")
    );
    const textObjects = escapedLines
      .map((line, index) => `50 ${760 - index * 18} Td (${line}) Tj`)
      .join(" ");
    const contentStream = `BT /F1 12 Tf ${textObjects} ET`;

    const objects = [];
    objects.push("1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj");
    objects.push("2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj");
    objects.push(
      "3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj"
    );
    objects.push(
      `4 0 obj << /Length ${contentStream.length} >> stream\n${contentStream}\nendstream endobj`
    );
    objects.push(
      "5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj"
    );

    let offset = 0;
    const header = "%PDF-1.4\n";
    let body = "";
    const xref = ["xref", `0 ${objects.length + 1}`, "0000000000 65535 f "];

    offset += header.length;
    objects.forEach((obj) => {
      const record = obj + "\n";
      xref.push(`${offset.toString().padStart(10, "0")} 00000 n `);
      body += record;
      offset += record.length;
    });

    const xrefOffset = offset;
    const trailer = [
      "trailer",
      `<< /Size ${objects.length + 1} /Root 1 0 R >>`,
      "startxref",
      `${xrefOffset}`,
      "%%EOF",
    ].join("\n");

    return header + body + xref.join("\n") + "\n" + trailer;
  };

  const downloadReceiptPdf = () => {
    if (!checkoutProduct || !orderSummary) return;
    const lines = [
      "UniMarket Rwanda - Receipt",
      `Order ID: ${orderId}`,
      `Item: ${checkoutProduct.name}`,
      `University: ${checkoutProduct.university}`,
      `Payment: ${paymentMethod}`,
      `Delivery: ${deliveryMethod}`,
      `Quantity: ${quantity}`,
      `Subtotal: ${formatPrice(orderSummary.subtotal)}`,
      `Service fee: ${formatPrice(orderSummary.serviceFee)}`,
      `Delivery fee: ${formatPrice(orderSummary.deliveryFee)}`,
      `Total: ${formatPrice(orderSummary.total)}`,
    ];
    const pdfText = buildPdf(lines);
    const blob = new Blob([pdfText], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `unimarket-receipt-${orderId}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const parsePrice = (priceText) =>
    Number(priceText.replace(/[^\d]/g, ""));

  const formatPrice = (amount) =>
    `${amount.toLocaleString("en-US")} RWF`;

  const orderSummary = useMemo(() => {
    if (!checkoutProduct) {
      return null;
    }
    const itemPrice = parsePrice(checkoutProduct.price);
    const subtotal = itemPrice * quantity;
    const serviceFee = Math.round(subtotal * 0.03);
    const deliveryFee = deliveryMethod === "Dorm delivery" ? 1500 : 0;
    const total = subtotal + serviceFee + deliveryFee;
    return { itemPrice, subtotal, serviceFee, deliveryFee, total };
  }, [checkoutProduct, quantity, deliveryMethod]);

  const analyticsData = useMemo(() => {
    const hashText = (text) =>
      String(text || "")
        .split("")
        .reduce((sum, char, index) => sum + char.charCodeAt(0) * (index + 1), 0);

    const inferCategory = (product) => {
      if (product.category) return product.category;
      const text = `${product.name || ""} ${product.tag || ""}`.toLowerCase();
      if (text.includes("laptop") || text.includes("phone") || text.includes("ipad")) return "Electronics";
      if (text.includes("book") || text.includes("textbook")) return "Books";
      if (text.includes("chair") || text.includes("desk") || text.includes("cabinet")) return "Furniture";
      if (text.includes("shoe") || text.includes("watch") || text.includes("backpack")) return "Fashion";
      if (text.includes("gym") || text.includes("bicycle")) return "Sports";
      return "Hostel Finds";
    };

    const rangeDays =
      analyticsRange === "today"
        ? 1
        : analyticsRange === "7d"
          ? 7
          : analyticsRange === "30d"
            ? 30
            : (() => {
                if (!customRange.from || !customRange.to) return 30;
                const from = new Date(customRange.from);
                const to = new Date(customRange.to);
                const diff = Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
                return Math.max(1, Number.isNaN(diff) ? 30 : diff + 1);
              })();

    const dealsCount = deals.length;
    const totalListings = products.length;
    const listingsToday = Math.max(1, Math.round(totalListings * 0.08));
    const approvedListings = Math.max(1, Math.round(totalListings * 0.91));
    const rejectedListings = Math.max(0, totalListings - approvedListings);

    const categoriesCount = categories.map((cat) => ({ name: cat.title, count: 0 }));
    products.forEach((product) => {
      const inferred = inferCategory(product);
      const target = categoriesCount.find((item) => item.name === inferred);
      if (target) target.count += 1;
    });
    categoriesCount.forEach((item) => {
      if (item.count === 0) item.count = Math.max(2, Math.round(totalListings / categoriesCount.length));
    });

    const perUniversity = universities.map((name, index) => {
      const listings = products.filter((product) => product.university === name).length;
      const seed = hashText(name);
      const students = 120 + (seed % 240) + listings * 4;
      const activeUsers = Math.min(students, Math.round(students * (0.26 + ((seed % 12) / 100))));
      const onlineUsers = Math.max(
        1,
        Math.min(
          activeUsers,
          Math.round(activeUsers * (0.2 + ((seed % 5) / 100))) + (liveTick + index) % 3
        )
      );
      const growthRate = Number((3 + (seed % 19) + listings * 0.18).toFixed(1));
      return {
        name,
        students,
        activeUsers,
        onlineUsers,
        listings,
        avgListingsPerStudent: Number((listings / Math.max(students, 1)).toFixed(3)),
        growthRate,
      };
    });

    const totalStudents = perUniversity.reduce((sum, item) => sum + item.students, 0);
    const active24h = Math.round(totalStudents * 0.28);
    const active7d = Math.round(totalStudents * 0.47);
    const active30d = Math.round(totalStudents * 0.66);
    const onlineUsersNow = perUniversity.reduce((sum, item) => sum + item.onlineUsers, 0);

    const listingViews = products.map((product) => {
      const views = 80 + (hashText(product.name) % 420);
      return { ...product, views };
    });
    const totalViews = listingViews.reduce((sum, item) => sum + item.views, 0);
    const engagementRate = Number((totalViews / Math.max(totalListings, 1)).toFixed(1));

    const sellerActivity = Object.values(
      products.reduce((acc, product) => {
        const key = product?.seller?.name || "Verified seller";
        if (!acc[key]) {
          acc[key] = {
            name: key,
            listings: 0,
            views: 0,
          };
        }
        acc[key].listings += 1;
        acc[key].views += 80 + (hashText(product.name) % 420);
        return acc;
      }, {})
    )
      .sort((a, b) => b.listings - a.listings || b.views - a.views)
      .slice(0, 5);

    const topViewedListings = listingViews
      .sort((a, b) => b.views - a.views)
      .slice(0, 5)
      .map((item) => ({ name: item.name, views: item.views }));

    const dailyRegistrations = Array.from({ length: Math.min(12, Math.max(6, rangeDays)) }, (_, index) => {
      const day = index + 1;
      const value = 18 + ((index * 7 + totalListings) % 24) + Math.round(day * 0.9);
      return { label: `D${day}`, value };
    });

    const growthSeries = Array.from({ length: 10 }, (_, index) => {
      const users = 220 + index * 28 + (index % 3) * 14;
      const listings = 70 + index * 11 + (index % 2) * 5;
      return { label: `W${index + 1}`, users, listings };
    });

    const filteredUniversityRows =
      universityFilter === "All"
        ? perUniversity
        : perUniversity.filter((item) => item.name === universityFilter);

    const rankedUniversities = [...perUniversity].sort(
      (a, b) => b.activeUsers + b.listings - (a.activeUsers + a.listings)
    );

    const compareLeft =
      perUniversity.find((item) => item.name === compareUniversities.left) || perUniversity[0];
    const compareRight =
      perUniversity.find((item) => item.name === compareUniversities.right) || perUniversity[1];

    const onlineByUniversity = perUniversity
      .map((item) => ({ name: item.name, online: item.onlineUsers }))
      .sort((a, b) => b.online - a.online)
      .slice(0, 8);

    const liveListingsFeed = products.slice(0, 6).map((product, index) => ({
      id: product.id || `${index}`,
      text: `${product.name} listed at ${product.university}`,
      time: `${2 + ((index + liveTick) % 9)}m ago`,
    }));

    const registrationsFeed = perUniversity.slice(0, 6).map((item, index) => ({
      id: `${item.name}-${index}`,
      text: `New student joined from ${item.name}`,
      time: `${1 + ((index + liveTick) % 12)}m ago`,
    }));

    const verifiedFeed = verificationRequests.slice(0, 5).map((item, index) => ({
      id: item.id || index,
      text: `${item.studentEmail || "Student"} pending verification`,
    }));

    const trafficSources = [
      { source: "Direct", share: 38 },
      { source: "WhatsApp", share: 27 },
      { source: "Search", share: 19 },
      { source: "Campus ambassadors", share: 10 },
      { source: "Other", share: 6 },
    ];

    const behavior = {
      avgSession: "7m 48s",
      keywords: ["laptop", "desk", "textbooks", "hostel", "iphone", "calculator"],
      mostViewedCategories: categoriesCount
        .slice()
        .sort((a, b) => b.count - a.count)
        .slice(0, 5),
      dropOffRate: 34,
      conversionRate: 18.7,
      peakHours: "18:00 - 21:00",
      deviceSplit: { mobile: 78, desktop: 22 },
      returningVsNew: { returning: 41, newUsers: 59 },
      cohort: [
        { label: "Week 1", retention: 100 },
        { label: "Week 2", retention: 68 },
        { label: "Week 3", retention: 49 },
        { label: "Week 4", retention: 37 },
      ],
      forecast: [82, 87, 95, 102, 114, 123, 131],
    };

    const featuredRevenue = dealsCount * 12000;
    const subscriptionRevenue = Math.round(totalStudents * 0.035) * 3000;
    const monthlyRecurringRevenue = featuredRevenue + subscriptionRevenue;
    const arpu = Number((monthlyRecurringRevenue / Math.max(totalStudents, 1)).toFixed(1));
    const conversionToPaid = Number((Math.min(24, 8 + dealsCount * 1.1)).toFixed(1));
    const revenuePerUniversity = rankedUniversities.slice(0, 8).map((item) => ({
      name: item.name,
      revenue: Math.round(item.activeUsers * 210 + item.listings * 460),
    }));

    const suspiciousSpike = onlineUsersNow > Math.round(active24h * 0.55);

    return {
      rangeDays,
      totalStudents,
      active24h,
      active7d,
      active30d,
      onlineUsersNow,
      totalListings,
      listingsToday,
      approvedListings,
      rejectedListings,
      categoriesCount,
      dailyRegistrations,
      growthSeries,
      sellerActivity,
      topViewedListings,
      engagementRate,
      perUniversity,
      filteredUniversityRows,
      rankedUniversities,
      compareLeft,
      compareRight,
      onlineByUniversity,
      liveListingsFeed,
      registrationsFeed,
      verifiedFeed,
      trafficSources,
      behavior,
      featuredRevenue,
      subscriptionRevenue,
      monthlyRecurringRevenue,
      arpu,
      conversionToPaid,
      revenuePerUniversity,
      suspiciousSpike,
    };
  }, [
    analyticsRange,
    compareUniversities.left,
    compareUniversities.right,
    customRange.from,
    customRange.to,
    deals,
    liveTick,
    products,
    universityFilter,
    verificationRequests,
  ]);

  const exportAnalyticsCsv = () => {
    const rows = [
      ["Metric", "Value"],
      ["Total registered students", analyticsData.totalStudents],
      ["Active users 24h", analyticsData.active24h],
      ["Active users 7d", analyticsData.active7d],
      ["Active users 30d", analyticsData.active30d],
      ["Currently online", analyticsData.onlineUsersNow],
      ["Total listings", analyticsData.totalListings],
      ["Listings posted today", analyticsData.listingsToday],
      ["Approved listings", analyticsData.approvedListings],
      ["Rejected listings", analyticsData.rejectedListings],
      ["Engagement rate (views/listing)", analyticsData.engagementRate],
      ["Revenue from featured listings", analyticsData.featuredRevenue],
      ["Subscription revenue", analyticsData.subscriptionRevenue],
      ["MRR", analyticsData.monthlyRecurringRevenue],
      ["ARPU", analyticsData.arpu],
      ["Conversion to paid (%)", analyticsData.conversionToPaid],
      [],
      ["University", "Students", "Active users", "Online", "Listings", "Growth %"],
      ...analyticsData.rankedUniversities.map((item) => [
        item.name,
        item.students,
        item.activeUsers,
        item.onlineUsers,
        item.listings,
        item.growthRate,
      ]),
    ];
    const csv = rows.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `unimarket-analytics-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const adminNavItems = [
    { id: "overview", label: "Overview" },
    { id: "analytics", label: "Analytics" },
    { id: "demographics", label: "Universities" },
    { id: "realtime", label: "Live Ops" },
    { id: "behavior", label: "Behavior" },
    { id: "monetization", label: "Monetization" },
    { id: "deals", label: "Deals" },
    { id: "verification", label: "Verification" },
    { id: "settings", label: "Settings" },
    { id: "security", label: "Security" },
  ];

  const renderAdminOverview = () => (
    <>
      <div className="admin-grid-v2 analytics-kpi-grid">
        <div className="admin-card-v2 live-card">
          <span>Currently online</span>
          <strong>{analyticsData.onlineUsersNow.toLocaleString("en-US")}</strong>
          <span>Real-time indicator</span>
        </div>
        <div className="admin-card-v2">
          <span>Total registered students</span>
          <strong>{analyticsData.totalStudents.toLocaleString("en-US")}</strong>
          <span>Estimated campus population</span>
        </div>
        <div className="admin-card-v2">
          <span>Total listings</span>
          <strong>{analyticsData.totalListings.toLocaleString("en-US")}</strong>
          <span>Marketplace inventory</span>
        </div>
        <div className="admin-card-v2">
          <span>Engagement rate</span>
          <strong>{analyticsData.engagementRate}</strong>
          <span>Views per listing</span>
        </div>
      </div>

      <div className="admin-grid-v2 compact">
        <div className="admin-card-v2 admin-card-full">
          <div className="admin-inline-controls analytics-toolbar">
            <div className="chip-wrap">
              <span className="status-badge approved">Investor-ready</span>
              <span className="status-badge pending">Realtime</span>
              <span className="status-badge flagged">Actions required</span>
            </div>
            <button
              className="primary-button"
              type="button"
              onClick={() => setAdminSection("analytics")}
            >
              Open analytics
            </button>
          </div>
          <div className="growth-chart" aria-label="Growth chart">
            {analyticsData.growthSeries.map((point) => (
              <div
                className="growth-col"
                key={point.label}
                title={`${point.label}: ${point.users} users, ${point.listings} listings`}
              >
                <div
                  className="growth-bar users"
                  style={{
                    height: `${Math.max(18, Math.round(point.users * 0.55))}px`,
                  }}
                />
                <div
                  className="growth-bar listings"
                  style={{
                    height: `${Math.max(12, Math.round(point.listings * 2.2))}px`,
                  }}
                />
                <span>{point.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );

  const renderAdminAnalytics = () => (
    <>
      <div className="admin-card-v2 admin-card-full">
        <div className="admin-inline-controls analytics-toolbar">
          <div className="chip-wrap">
            <span className="status-badge approved">Core KPIs</span>
            <span className="status-badge pending">Filters</span>
            <span className="status-badge approved">Export</span>
          </div>
          <div className="admin-inline-controls">
            {[
              { id: "today", label: "Today" },
              { id: "7d", label: "7 days" },
              { id: "30d", label: "30 days" },
              { id: "custom", label: "Custom" },
            ].map((item) => (
              <button
                key={item.id}
                className={
                  analyticsRange === item.id ? "primary-button" : "ghost-button"
                }
                type="button"
                onClick={() => setAnalyticsRange(item.id)}
              >
                {item.label}
              </button>
            ))}
            {analyticsRange === "custom" && (
              <>
                <input
                  type="date"
                  value={customRange.from}
                  onChange={(event) =>
                    setCustomRange((prev) => ({
                      ...prev,
                      from: event.target.value,
                    }))
                  }
                  aria-label="From date"
                />
                <input
                  type="date"
                  value={customRange.to}
                  onChange={(event) =>
                    setCustomRange((prev) => ({
                      ...prev,
                      to: event.target.value,
                    }))
                  }
                  aria-label="To date"
                />
              </>
            )}
            <button
              className="secondary-button"
              type="button"
              onClick={exportAnalyticsCsv}
            >
              Export CSV
            </button>
          </div>
        </div>
        {analyticsData.suspiciousSpike ? (
          <p className="section-subtitle">
            <span className="status-badge flagged">Alert</span> Online activity
            is spiking above normal. Review traffic sources and the live feed.
          </p>
        ) : (
          <p className="section-subtitle">
            Real-time KPIs update periodically. Use filters to review trends,
            growth, and engagement.
          </p>
        )}
      </div>

      <div className="admin-grid-v2 analytics-kpi-grid">
        <div className="admin-card-v2">
          <span>Total registered students</span>
          <strong>{analyticsData.totalStudents.toLocaleString("en-US")}</strong>
          <span>All universities</span>
        </div>
        <div className="admin-card-v2">
          <span>Active users</span>
          <strong>
            {(analyticsRange === "today"
              ? analyticsData.active24h
              : analyticsRange === "7d"
                ? analyticsData.active7d
                : analyticsData.active30d
            ).toLocaleString("en-US")}
          </strong>
          <span>
            {analyticsRange === "today"
              ? "Last 24h"
              : analyticsRange === "7d"
                ? "Last 7d"
                : "Last 30d"}
          </span>
        </div>
        <div className="admin-card-v2 live-card">
          <span>Currently online</span>
          <strong>{analyticsData.onlineUsersNow.toLocaleString("en-US")}</strong>
          <span>Real-time indicator</span>
        </div>
        <div className="admin-card-v2">
          <span>Total listings</span>
          <strong>{analyticsData.totalListings.toLocaleString("en-US")}</strong>
          <span>Inventory</span>
        </div>
        <div className="admin-card-v2">
          <span>Listings posted today</span>
          <strong>{analyticsData.listingsToday.toLocaleString("en-US")}</strong>
          <span>New supply</span>
        </div>
        <div className="admin-card-v2">
          <span>Engagement rate</span>
          <strong>{analyticsData.engagementRate}</strong>
          <span>Views per listing</span>
        </div>
      </div>

      <div className="analytics-grid">
        <div className="admin-card-v2">
          <span>Listings by category</span>
          <strong>Distribution</strong>
          <div className="mini-chart" role="img" aria-label="Listings by category">
            {analyticsData.categoriesCount
              .slice()
              .sort((a, b) => b.count - a.count)
              .map((row) => (
                <div
                  className="mini-chart-row"
                  key={row.name}
                  title={`${row.name}: ${row.count}`}
                >
                  <span>{row.name}</span>
                  <div className="mini-chart-track">
                    <div
                      className="mini-chart-fill"
                      style={{
                        width: `${Math.min(
                          100,
                          Math.round(
                            (row.count / Math.max(analyticsData.totalListings, 1)) *
                              100
                          )
                        )}%`,
                      }}
                    />
                  </div>
                  <strong>{row.count}</strong>
                </div>
              ))}
          </div>
        </div>

        <div className="admin-card-v2">
          <span>Approved vs rejected</span>
          <strong>Moderation</strong>
          <div className="pie-wrap">
            <div
              className="pie-chart"
              style={{
                "--approved": analyticsData.approvedListings,
                "--rejected": analyticsData.rejectedListings,
              }}
              aria-label="Approved vs rejected pie chart"
              title={`Approved ${analyticsData.approvedListings} / Rejected ${analyticsData.rejectedListings}`}
            />
            <div className="pie-legend">
              <span>
                <i className="dot approved" aria-hidden="true" /> Approved{" "}
                <strong>{analyticsData.approvedListings}</strong>
              </span>
              <span>
                <i className="dot rejected" aria-hidden="true" /> Rejected{" "}
                <strong>{analyticsData.rejectedListings}</strong>
              </span>
            </div>
          </div>
        </div>

        <div className="admin-card-v2">
          <span>Daily new registrations</span>
          <strong>Trend</strong>
          <div className="line-chart" role="img" aria-label="Daily registrations line graph">
            {analyticsData.dailyRegistrations.map((point) => (
              <div
                className="line-point"
                key={point.label}
                title={`${point.label}: ${point.value}`}
              >
                <div
                  className="line-bar"
                  style={{ height: `${Math.max(18, point.value * 2)}px` }}
                />
                <span>{point.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="admin-card-v2">
          <span>Growth trend</span>
          <strong>Users & listings</strong>
          <div className="area-chart" role="img" aria-label="Growth trend area chart">
            {analyticsData.growthSeries.map((point) => (
              <div
                className="area-col"
                key={point.label}
                title={`${point.label}: ${point.users} users, ${point.listings} listings`}
              >
                <div
                  className="area-user"
                  style={{
                    height: `${Math.max(18, Math.round(point.users * 0.38))}px`,
                  }}
                />
                <div
                  className="area-listing"
                  style={{
                    height: `${Math.max(12, Math.round(point.listings * 1.7))}px`,
                  }}
                />
                <span>{point.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="admin-card-v2">
          <span>Top 5 most active sellers</span>
          <strong>Seller momentum</strong>
          <div className="admin-stack">
            {analyticsData.sellerActivity.map((seller) => (
              <div
                className="admin-list-item"
                key={seller.name}
                title={`${seller.listings} listings, ${seller.views} views`}
              >
                <div>
                  <strong>{seller.name}</strong>
                  <span>{seller.listings} listings</span>
                </div>
                <span className="status-badge approved">{seller.views} views</span>
              </div>
            ))}
          </div>
        </div>

        <div className="admin-card-v2">
          <span>Top 5 most viewed listings</span>
          <strong>Demand</strong>
          <div className="admin-stack">
            {analyticsData.topViewedListings.map((item) => (
              <div className="admin-list-item" key={item.name} title={`${item.views} views`}>
                <div>
                  <strong>{item.name}</strong>
                  <span>{item.views} views</span>
                </div>
                <span className="status-badge pending">Top</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );

  const renderAdminDemographics = () => (
    <>
      <div className="admin-card-v2 admin-card-full">
        <div className="admin-inline-controls analytics-toolbar">
          <div className="chip-wrap">
            <span className="status-badge approved">Demographics</span>
            <span className="status-badge pending">University-based</span>
          </div>
          <div className="admin-inline-controls">
            <select
              value={universityFilter}
              onChange={(event) => setUniversityFilter(event.target.value)}
              aria-label="Filter by university"
            >
              <option value="All">All universities</option>
              {universities.map((school) => (
                <option key={school} value={school}>
                  {school}
                </option>
              ))}
            </select>
          </div>
        </div>
        <p className="section-subtitle">
          Student distribution, activity, and listings volume by university.
        </p>
      </div>

      <div className="analytics-grid">
        <div className="admin-card-v2">
          <span>Total students per university</span>
          <strong>Population</strong>
          <div className="mini-chart" role="img" aria-label="Students per university bar chart">
            {analyticsData.filteredUniversityRows
              .slice()
              .sort((a, b) => b.students - a.students)
              .slice(0, 10)
              .map((row) => (
                <div className="mini-chart-row" key={row.name} title={`${row.name}: ${row.students} students`}>
                  <span>{row.name}</span>
                  <div className="mini-chart-track">
                    <div
                      className="mini-chart-fill"
                      style={{
                        width: `${Math.min(
                          100,
                          Math.round((row.students / Math.max(analyticsData.totalStudents, 1)) * 420)
                        )}%`,
                      }}
                    />
                  </div>
                  <strong>{row.students}</strong>
                </div>
              ))}
          </div>
        </div>

        <div className="admin-card-v2">
          <span>Percentage distribution</span>
          <strong>Donut</strong>
          <div className="donut-wrap">
            <div className="donut-chart" aria-label="University distribution donut chart" />
            <div className="admin-stack">
              {analyticsData.rankedUniversities.slice(0, 6).map((row) => (
                <div className="admin-list-item" key={row.name}>
                  <div>
                    <strong>{row.name}</strong>
                    <span>{Math.round((row.students / analyticsData.totalStudents) * 100)}%</span>
                  </div>
                  <span className="status-badge approved">{row.students}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="admin-card-v2">
          <span>Compare universities</span>
          <strong>Side-by-side</strong>
          <div className="admin-form-grid">
            <div className="listing-field">
              <label>Left</label>
              <select
                value={compareUniversities.left}
                onChange={(event) =>
                  setCompareUniversities((prev) => ({ ...prev, left: event.target.value }))
                }
              >
                {universities.map((school) => (
                  <option key={school} value={school}>
                    {school}
                  </option>
                ))}
              </select>
            </div>
            <div className="listing-field">
              <label>Right</label>
              <select
                value={compareUniversities.right}
                onChange={(event) =>
                  setCompareUniversities((prev) => ({ ...prev, right: event.target.value }))
                }
              >
                {universities.map((school) => (
                  <option key={school} value={school}>
                    {school}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="compare-grid">
            <div>
              <h5>{analyticsData.compareLeft.name}</h5>
              <p>
                <span className="status-badge approved">Students</span>{" "}
                {analyticsData.compareLeft.students.toLocaleString("en-US")}
              </p>
              <p>
                <span className="status-badge pending">Active</span>{" "}
                {analyticsData.compareLeft.activeUsers.toLocaleString("en-US")}
              </p>
              <p>
                <span className="status-badge approved">Listings</span>{" "}
                {analyticsData.compareLeft.listings.toLocaleString("en-US")}
              </p>
            </div>
            <div>
              <h5>{analyticsData.compareRight.name}</h5>
              <p>
                <span className="status-badge approved">Students</span>{" "}
                {analyticsData.compareRight.students.toLocaleString("en-US")}
              </p>
              <p>
                <span className="status-badge pending">Active</span>{" "}
                {analyticsData.compareRight.activeUsers.toLocaleString("en-US")}
              </p>
              <p>
                <span className="status-badge approved">Listings</span>{" "}
                {analyticsData.compareRight.listings.toLocaleString("en-US")}
              </p>
            </div>
          </div>
        </div>

        <div className="admin-card-v2">
          <span>Heatmap of active campuses</span>
          <strong>Operations view</strong>
          <div className="heatmap-grid" role="img" aria-label="Campus activity heatmap">
            {analyticsData.rankedUniversities.slice(0, 9).map((row, index) => (
              <div
                key={row.name}
                className="heat-cell"
                title={`${row.name}: ${row.activeUsers} active, ${row.listings} listings`}
                style={{
                  background: `rgba(42, 166, 127, ${0.18 + Math.min(0.52, index * 0.045)})`,
                }}
              >
                <strong>{row.name}</strong>
                <div>{row.activeUsers} active</div>
                <div>{row.listings} listings</div>
              </div>
            ))}
          </div>
        </div>

        <div className="admin-card-v2 admin-card-full">
          <span>Ranking table</span>
          <strong>Most active to least active</strong>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>University</th>
                  <th>Students</th>
                  <th>Active</th>
                  <th>Online</th>
                  <th>Listings</th>
                  <th>Avg listings/student</th>
                  <th>Growth %</th>
                </tr>
              </thead>
              <tbody>
                {analyticsData.rankedUniversities.slice(0, 14).map((row) => (
                  <tr key={row.name}>
                    <td>{row.name}</td>
                    <td>{row.students}</td>
                    <td>{row.activeUsers}</td>
                    <td>{row.onlineUsers}</td>
                    <td>{row.listings}</td>
                    <td>{row.avgListingsPerStudent}</td>
                    <td>
                      <span className="status-badge approved">{row.growthRate}%</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );

  const renderAdminRealtime = () => (
    <>
      <div className="admin-grid-v2 analytics-kpi-grid">
        <div
          className={`admin-card-v2 live-card ${
            analyticsData.suspiciousSpike ? "alert" : ""
          }`}
        >
          <span>Users currently online</span>
          <strong>{analyticsData.onlineUsersNow.toLocaleString("en-US")}</strong>
          <span>{analyticsData.suspiciousSpike ? "Spike detected" : "Normal range"}</span>
        </div>
        <div className="admin-card-v2">
          <span>Live feed</span>
          <strong>{analyticsData.liveListingsFeed.length}</strong>
          <span>New listings</span>
        </div>
        <div className="admin-card-v2">
          <span>New registrations</span>
          <strong>{analyticsData.registrationsFeed.length}</strong>
          <span>Latest sign-ups</span>
        </div>
        <div className="admin-card-v2">
          <span>Traffic sources</span>
          <strong>{analyticsData.trafficSources[0].source}</strong>
          <span>Largest share</span>
        </div>
      </div>

      <div className="analytics-grid">
        <div className="admin-card-v2">
          <span>Users online per university</span>
          <strong>Real-time</strong>
          <div className="mini-chart">
            {analyticsData.onlineByUniversity.map((row) => (
              <div className="mini-chart-row" key={row.name} title={`${row.name}: ${row.online} online`}>
                <span>{row.name}</span>
                <div className="mini-chart-track">
                  <div
                    className="mini-chart-fill"
                    style={{
                      width: `${Math.min(
                        100,
                        Math.round((row.online / Math.max(analyticsData.onlineUsersNow, 1)) * 260)
                      )}%`,
                    }}
                  />
                </div>
                <strong>{row.online}</strong>
              </div>
            ))}
          </div>
        </div>

        <div className="admin-card-v2">
          <span>Live listings feed</span>
          <strong>New posts</strong>
          <div className="admin-stack">
            {analyticsData.liveListingsFeed.map((item) => (
              <div className="admin-list-item" key={item.id}>
                <div>
                  <strong>{item.text}</strong>
                  <span>{item.time}</span>
                </div>
                <span className="status-badge pending">LIVE</span>
              </div>
            ))}
          </div>
        </div>

        <div className="admin-card-v2">
          <span>Live registrations feed</span>
          <strong>New students</strong>
          <div className="admin-stack">
            {analyticsData.registrationsFeed.map((item) => (
              <div className="admin-list-item" key={item.id}>
                <div>
                  <strong>{item.text}</strong>
                  <span>{item.time}</span>
                </div>
                <span className="status-badge approved">NEW</span>
              </div>
            ))}
          </div>
        </div>

        <div className="admin-card-v2">
          <span>Verification activity</span>
          <strong>Recently verified / pending</strong>
          <div className="admin-stack">
            {(analyticsData.verifiedFeed.length
              ? analyticsData.verifiedFeed
              : [{ id: "none", text: "No pending verification requests." }]
            ).map((item) => (
              <div className="admin-list-item" key={item.id}>
                <div>
                  <strong>{item.text}</strong>
                  <span>Verification center</span>
                </div>
                <span className="status-badge pending">QUEUE</span>
              </div>
            ))}
          </div>
        </div>

        <div className="admin-card-v2 admin-card-full">
          <span>Traffic source tracking</span>
          <strong>Attribution</strong>
          <div className="mini-chart">
            {analyticsData.trafficSources.map((row) => (
              <div className="mini-chart-row" key={row.source} title={`${row.source}: ${row.share}%`}>
                <span>{row.source}</span>
                <div className="mini-chart-track">
                  <div className="mini-chart-fill" style={{ width: `${row.share}%` }} />
                </div>
                <strong>{row.share}%</strong>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );

  const renderAdminBehavior = () => (
    <>
      <div className="admin-grid-v2 analytics-kpi-grid">
        <div className="admin-card-v2">
          <span>Avg session duration</span>
          <strong>{analyticsData.behavior.avgSession}</strong>
          <span>Student sessions</span>
        </div>
        <div className="admin-card-v2">
          <span>Drop-off rate</span>
          <strong>{analyticsData.behavior.dropOffRate}%</strong>
          <span>Where users leave</span>
        </div>
        <div className="admin-card-v2">
          <span>Conversion rate</span>
          <strong>{analyticsData.behavior.conversionRate}%</strong>
          <span>View â†’ contact seller</span>
        </div>
        <div className="admin-card-v2">
          <span>Peak usage hours</span>
          <strong>{analyticsData.behavior.peakHours}</strong>
          <span>Local time</span>
        </div>
      </div>

      <div className="analytics-grid">
        <div className="admin-card-v2">
          <span>Most searched keywords</span>
          <strong>Demand intent</strong>
          <div className="chip-wrap">
            {analyticsData.behavior.keywords.map((word) => (
              <span className="status-badge pending" key={word}>
                {word}
              </span>
            ))}
          </div>
        </div>

        <div className="admin-card-v2">
          <span>Most viewed categories</span>
          <strong>Attention</strong>
          <div className="mini-chart">
            {analyticsData.behavior.mostViewedCategories.map((row) => (
              <div className="mini-chart-row" key={row.name} title={`${row.name}: ${row.count}`}>
                <span>{row.name}</span>
                <div className="mini-chart-track">
                  <div
                    className="mini-chart-fill"
                    style={{
                      width: `${Math.min(
                        100,
                        Math.round((row.count / Math.max(analyticsData.totalListings, 1)) * 100)
                      )}%`,
                    }}
                  />
                </div>
                <strong>{row.count}</strong>
              </div>
            ))}
          </div>
        </div>

        <div className="admin-card-v2">
          <span>Device distribution</span>
          <strong>Mobile vs desktop</strong>
          <div className="mini-chart">
            {[
              { name: "Mobile", value: analyticsData.behavior.deviceSplit.mobile },
              { name: "Desktop", value: analyticsData.behavior.deviceSplit.desktop },
            ].map((row) => (
              <div className="mini-chart-row" key={row.name} title={`${row.name}: ${row.value}%`}>
                <span>{row.name}</span>
                <div className="mini-chart-track">
                  <div className="mini-chart-fill" style={{ width: `${row.value}%` }} />
                </div>
                <strong>{row.value}%</strong>
              </div>
            ))}
          </div>
        </div>

        <div className="admin-card-v2">
          <span>Returning vs new users</span>
          <strong>Cohort mix</strong>
          <div className="mini-chart">
            {[
              { name: "Returning", value: analyticsData.behavior.returningVsNew.returning },
              { name: "New", value: analyticsData.behavior.returningVsNew.newUsers },
            ].map((row) => (
              <div className="mini-chart-row" key={row.name} title={`${row.name}: ${row.value}%`}>
                <span>{row.name}</span>
                <div className="mini-chart-track">
                  <div className="mini-chart-fill" style={{ width: `${row.value}%` }} />
                </div>
                <strong>{row.value}%</strong>
              </div>
            ))}
          </div>
        </div>

        <div className="admin-card-v2">
          <span>Funnel visualization</span>
          <strong>Conversion steps</strong>
          <div className="funnel" role="img" aria-label="Conversion funnel visualization">
            <div className="funnel-step step-1">Views</div>
            <div className="funnel-step step-2">Details</div>
            <div className="funnel-step step-3">Contact Seller</div>
            <div className="funnel-step step-4">Purchase Intent</div>
          </div>
        </div>

        <div className="admin-card-v2">
          <span>Cohort analysis</span>
          <strong>Retention</strong>
          <div className="line-chart" role="img" aria-label="Cohort retention chart">
            {analyticsData.behavior.cohort.map((point) => (
              <div className="line-point" key={point.label} title={`${point.label}: ${point.retention}%`}>
                <div
                  className="line-bar"
                  style={{ height: `${Math.max(18, point.retention * 1.2)}px` }}
                />
                <span>{point.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="admin-card-v2">
          <span>Trend forecasting</span>
          <strong>Next 7 days</strong>
          <div className="line-chart" role="img" aria-label="Forecasting graph">
            {analyticsData.behavior.forecast.map((value, index) => (
              <div className="line-point" key={`f-${index}`} title={`D${index + 1}: ${value}`}>
                <div
                  className={`line-bar ${index > 3 ? "forecast" : ""}`}
                  style={{ height: `${Math.max(18, value * 1.4)}px` }}
                />
                <span>D{index + 1}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );

  const renderAdminMonetization = () => (
    <>
      <div className="admin-grid-v2 analytics-kpi-grid">
        <div className="admin-card-v2">
          <span>Featured listing revenue</span>
          <strong>{formatPrice(analyticsData.featuredRevenue)}</strong>
          <span>Projected monthly</span>
        </div>
        <div className="admin-card-v2">
          <span>Subscription revenue</span>
          <strong>{formatPrice(analyticsData.subscriptionRevenue)}</strong>
          <span>Projected monthly</span>
        </div>
        <div className="admin-card-v2">
          <span>MRR</span>
          <strong>{formatPrice(analyticsData.monthlyRecurringRevenue)}</strong>
          <span>Monthly recurring revenue</span>
        </div>
        <div className="admin-card-v2">
          <span>ARPU</span>
          <strong>{analyticsData.arpu} RWF</strong>
          <span>Average revenue per user</span>
        </div>
        <div className="admin-card-v2">
          <span>Conversion to paid</span>
          <strong>{analyticsData.conversionToPaid}%</strong>
          <span>Paid features adoption</span>
        </div>
      </div>

      <div className="analytics-grid">
        <div className="admin-card-v2 admin-card-full">
          <span>Revenue per university</span>
          <strong>Institutional breakdown</strong>
          <div className="mini-chart">
            {analyticsData.revenuePerUniversity.map((row) => (
              <div className="mini-chart-row" key={row.name} title={`${row.name}: ${formatPrice(row.revenue)}`}>
                <span>{row.name}</span>
                <div className="mini-chart-track">
                  <div
                    className="mini-chart-fill"
                    style={{
                      width: `${Math.min(
                        100,
                        Math.round(
                          (row.revenue /
                            Math.max(analyticsData.revenuePerUniversity[0]?.revenue || 1, 1)) *
                            100
                        )
                      )}%`,
                    }}
                  />
                </div>
                <strong>{formatPrice(row.revenue)}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );

  const renderAdminDeals = () => (
    <>
      <div className="admin-card-v2 admin-card-full">
        <span>Deals & promotions</span>
        <strong>Admin-managed deals</strong>
        <p className="section-subtitle">
          Add deals, attach a background image, and control which deals appear
          in the homepage Deals carousel (Featured).
        </p>
        <form className="admin-form-grid" onSubmit={addDeal}>
          <div className="listing-field">
            <label htmlFor="deal-title">Deal title</label>
            <input
              id="deal-title"
              type="text"
              value={newDeal.title}
              onChange={(event) =>
                setNewDeal((prev) => ({ ...prev, title: event.target.value }))
              }
              placeholder="e.g. Hostel Starter Kit"
              required
            />
          </div>
          <div className="listing-field">
            <label htmlFor="deal-detail">Deal details</label>
            <input
              id="deal-detail"
              type="text"
              value={newDeal.detail}
              onChange={(event) =>
                setNewDeal((prev) => ({ ...prev, detail: event.target.value }))
              }
              placeholder="e.g. Bedding + lamp + storage box"
            />
          </div>
          <div className="listing-field">
            <label htmlFor="deal-image">Background image URL</label>
            <input
              id="deal-image"
              type="url"
              value={newDeal.imageUrl}
              onChange={(event) =>
                setNewDeal((prev) => ({ ...prev, imageUrl: event.target.value }))
              }
              placeholder="https://..."
            />
          </div>
          <div className="listing-field">
            <label htmlFor="deal-schedule">Schedule</label>
            <input
              id="deal-schedule"
              type="text"
              value={newDeal.schedule}
              onChange={(event) =>
                setNewDeal((prev) => ({ ...prev, schedule: event.target.value }))
              }
              placeholder="Always on / Weekends / etc."
            />
          </div>
          <div className="listing-field">
            <label className="admin-toggle">
              <input
                type="checkbox"
                checked={newDeal.active !== false}
                onChange={(event) =>
                  setNewDeal((prev) => ({ ...prev, active: event.target.checked }))
                }
              />
              Active
            </label>
            <label className="admin-toggle">
              <input
                type="checkbox"
                checked={Boolean(newDeal.featured)}
                onChange={(event) =>
                  setNewDeal((prev) => ({ ...prev, featured: event.target.checked }))
                }
              />
              Featured (shows in carousel)
            </label>
          </div>
          <div className="listing-field">
            <label>&nbsp;</label>
            <button className="primary-button" type="submit">
              Add deal
            </button>
          </div>
        </form>
      </div>

      <div className="admin-card-v2 admin-card-full">
        <span>Deals background media</span>
        <strong>Upload / add images</strong>
        <p className="section-subtitle">
          These images rotate in the Deals section background. Uploads require
          Firebase Storage to be enabled on your project.
        </p>
        <div className="admin-form-grid">
          <div className="listing-field">
            <label htmlFor="deals-hero-url">Add image URL</label>
            <input
              id="deals-hero-url"
              type="url"
              placeholder="https://..."
              value={dealsHeroUrlDraft}
              onChange={(event) => setDealsHeroUrlDraft(event.target.value)}
            />
          </div>
          <div className="listing-field">
            <label>&nbsp;</label>
            <button
              className="primary-button"
              type="button"
              onClick={() => {
                const url = dealsHeroUrlDraft.trim();
                if (!url) return;
                setDealsHeroImages((prev) => [url, ...prev].slice(0, 30));
                setDealsHeroUrlDraft("");
              }}
            >
              Add URL
            </button>
          </div>
          <div className="listing-field">
            <label htmlFor="deals-hero-upload">Upload image</label>
            <input
              id="deals-hero-upload"
              type="file"
              accept="image/*"
              onChange={handleDealsHeroUpload}
            />
            {dealsHeroUploadError ? (
              <p className="signin-error">{dealsHeroUploadError}</p>
            ) : null}
          </div>
        </div>

        {dealsHeroImages.length > 0 ? (
          <div className="image-grid">
            {dealsHeroImages.slice(0, 8).map((url, index) => (
              <div className="image-card" key={url}>
                <img src={url} alt="Deals background" />
                <div className="image-actions">
                  <button
                    className="ghost-button"
                    type="button"
                    onClick={() =>
                      setDealsHeroImages((prev) => {
                        if (index === 0) return prev;
                        const next = [...prev];
                        const tmp = next[index - 1];
                        next[index - 1] = next[index];
                        next[index] = tmp;
                        return next;
                      })
                    }
                  >
                    Up
                  </button>
                  <button
                    className="ghost-button"
                    type="button"
                    onClick={() =>
                      setDealsHeroImages((prev) => {
                        if (index >= prev.length - 1) return prev;
                        const next = [...prev];
                        const tmp = next[index + 1];
                        next[index + 1] = next[index];
                        next[index] = tmp;
                        return next;
                      })
                    }
                  >
                    Down
                  </button>
                  <button
                    className="ghost-button danger"
                    type="button"
                    onClick={() =>
                      setDealsHeroImages((prev) => prev.filter((item) => item !== url))
                    }
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="section-subtitle">No custom background images yet.</p>
        )}
      </div>

      <div className="admin-card-v2 admin-card-full">
        <span>Carousel products</span>
        <strong>Add/remove multiple at once</strong>
        <p className="section-subtitle">
          Select products to include in the moving Deals background (uses their
          listing image). Stored locally for now.
        </p>
        <div className="admin-inline-controls">
          <button
            className="secondary-button"
            type="button"
            onClick={() => {
              const selected = Object.keys(dealsHeroSelection).filter(
                (key) => dealsHeroSelection[key]
              );
              const productIds = selected
                .filter((id) => String(id).startsWith("p:"))
                .map((id) => id.slice(2));
              setDealsHeroProductIds((prev) => {
                const next = new Set(prev.map(String));
                productIds.forEach((id) => next.add(String(id)));
                return Array.from(next);
              });
            }}
          >
            Add selected products
          </button>
          <button
            className="ghost-button"
            type="button"
            onClick={() => {
              const selected = Object.keys(dealsHeroSelection).filter(
                (key) => dealsHeroSelection[key]
              );
              const productIds = selected
                .filter((id) => String(id).startsWith("p:"))
                .map((id) => id.slice(2));
              setDealsHeroProductIds((prev) =>
                prev.filter((id) => !productIds.includes(String(id)))
              );
            }}
          >
            Remove selected products
          </button>
          <button
            className="ghost-button"
            type="button"
            onClick={() => setDealsHeroSelection({})}
          >
            Clear selection
          </button>
        </div>

        <div className="admin-table-wrap admin-top-gap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Select</th>
                <th>Product</th>
                <th>In carousel</th>
              </tr>
            </thead>
            <tbody>
              {products.slice(0, 30).map((product) => {
                const key = `p:${product.id}`;
                const checked = Boolean(dealsHeroSelection[key]);
                const isIn = dealsHeroProductIds.map(String).includes(String(product.id));
                return (
                  <tr key={key}>
                    <td>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(event) =>
                          setDealsHeroSelection((prev) => ({
                            ...prev,
                            [key]: event.target.checked,
                          }))
                        }
                        aria-label={`Select ${product.name}`}
                      />
                    </td>
                    <td>
                      <strong>{product.name}</strong>
                      <div className="section-subtitle">{product.university}</div>
                    </td>
                    <td>
                      <span className={`status-badge ${isIn ? "pending" : "approved"}`}>
                        {isIn ? "Included" : "Not included"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="admin-card-v2 admin-card-full">
        <span>All deals</span>
        <strong>Manage</strong>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Deal</th>
                <th>Status</th>
                <th>Featured</th>
                <th>Schedule</th>
                <th>Background</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {deals.map((deal, index) => {
                const dealKey = deal.id || index;
                const isActive = deal.active !== false;
                const isFeatured = Boolean(deal.featured);
                return (
                  <tr key={dealKey}>
                    <td>
                      <strong>{deal.title}</strong>
                      <div className="section-subtitle">{deal.detail}</div>
                    </td>
                    <td>
                      <span className={`status-badge ${isActive ? "approved" : "rejected"}`}>
                        {isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${isFeatured ? "pending" : "approved"}`}>
                        {isFeatured ? "Featured" : "Normal"}
                      </span>
                    </td>
                    <td>{deal.schedule || "Always on"}</td>
                    <td>
                      {deal.imageUrl ? (
                        <a
                          className="ghost-button"
                          href={deal.imageUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Preview
                        </a>
                      ) : (
                        <span className="section-subtitle">None</span>
                      )}
                    </td>
                    <td>
                      <div className="admin-row-actions">
                        <button
                          className="ghost-button"
                          type="button"
                          onClick={() => toggleDealActive(dealKey)}
                        >
                          {isActive ? "Deactivate" : "Activate"}
                        </button>
                        <button
                          className="ghost-button"
                          type="button"
                          onClick={() => toggleDealFeatured(dealKey)}
                        >
                          {isFeatured ? "Unfeature" : "Feature"}
                        </button>
                        <button
                          className="ghost-button danger"
                          type="button"
                          onClick={() => deleteDeal(dealKey)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );

  const renderAdminVerification = () => (
    <div className="admin-card-v2 admin-card-full">
      <span>Student verification center</span>
      <strong>ID review</strong>
      <div className="admin-inline-controls">
        <span className="status-badge pending">
          Pending {verificationRequests.length}
        </span>
      </div>
      {verificationRequests.length === 0 ? (
        <p className="section-subtitle">No pending requests.</p>
      ) : (
        <div className="admin-stack">
          {verificationRequests.map((request) => (
            <div className="admin-list-item" key={request.id}>
              <div>
                <strong>{request.studentEmail}</strong>
                <span>{request.university || "Unknown campus"}</span>
              </div>
              <div className="admin-row-actions">
                {request.cardUrl ? (
                  <a
                    className="ghost-button"
                    href={request.cardUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Preview
                  </a>
                ) : null}
                <button
                  className="primary-button"
                  type="button"
                  onClick={async () => {
                    const approve = httpsCallable(cloudFunctions, "approveStudent");
                    await approve({
                      requestId: request.id,
                      userId: request.ownerId,
                    });
                    approveStudent();
                  }}
                >
                  Approve
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderAdminSettings = () => (
    <div className="admin-card-v2 admin-card-full">
      <span>Platform settings</span>
      <strong>Admin controls</strong>
      <p className="section-subtitle">
        Update credentials and platform behavior. (Wire advanced toggles to Firestore
        for production.)
      </p>
      <div className="admin-form-grid">
        <div className="listing-field">
          <label htmlFor="admin-email-config">Admin email</label>
          <input
            id="admin-email-config"
            name="email"
            type="email"
            value={adminConfigDraft.email}
            onChange={handleAdminConfigChange}
          />
        </div>
        <div className="listing-field">
          <label htmlFor="admin-password-config">Admin password</label>
          <input
            id="admin-password-config"
            name="password"
            type="password"
            value={adminConfigDraft.password}
            onChange={handleAdminConfigChange}
          />
        </div>
        <div className="listing-field">
          <label>&nbsp;</label>
          <button className="primary-button" type="button" onClick={saveAdminConfig}>
            Save admin credentials
          </button>
        </div>
      </div>
    </div>
  );

  const renderAdminSecurity = () => (
    <div className="admin-card-v2 admin-card-full">
      <span>Security & logs</span>
      <strong>Operational controls</strong>
      <div className="admin-stack">
        <div className="admin-list-item">
          <div>
            <strong>Admin login history</strong>
            <span>Local demo (store in Firestore for production)</span>
          </div>
          <span className="status-badge approved">OK</span>
        </div>
        <div className="admin-list-item">
          <div>
            <strong>Failed login attempts</strong>
            <span>Monitor credential abuse</span>
          </div>
          <span className="status-badge pending">Monitor</span>
        </div>
        <div className="admin-list-item">
          <div>
            <strong>Two-factor authentication</strong>
            <span>Recommended for admin accounts</span>
          </div>
          <span className="status-badge flagged">Planned</span>
        </div>
      </div>
    </div>
  );

  const renderAdminSection = () => {
    switch (adminSection) {
      case "overview":
        return renderAdminOverview();
      case "analytics":
        return renderAdminAnalytics();
      case "demographics":
        return renderAdminDemographics();
      case "realtime":
        return renderAdminRealtime();
      case "behavior":
        return renderAdminBehavior();
      case "monetization":
        return renderAdminMonetization();
      case "deals":
        return renderAdminDeals();
      case "verification":
        return renderAdminVerification();
      case "settings":
        return renderAdminSettings();
      case "security":
        return renderAdminSecurity();
      default:
        return renderAdminOverview();
    }
  };

  const renderAdminPanel = () => (
    <div className="container admin-layout">
      <aside className="admin-sidebar-v2" aria-label="Admin navigation">
        <div>
          <p className="section-kicker">Navigation</p>
          <div className="admin-toolbar-badges">
            <span className="status-badge approved">LIVE</span>
            <span className="status-badge pending">
              Pending {verificationRequests.length}
            </span>
            <span
              className={`status-badge ${
                analyticsData.suspiciousSpike ? "flagged" : "approved"
              }`}
            >
              {analyticsData.suspiciousSpike ? "ALERT" : "NORMAL"}
            </span>
          </div>
        </div>

        <nav className="admin-sidebar-nav">
          {adminNavItems.map((item) => (
            <button
              key={item.id}
              className={`admin-side-link ${
                adminSection === item.id ? "active" : ""
              }`}
              type="button"
              onClick={() => setAdminSection(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="admin-stack">
          <div className="admin-card-v2">
            <span>Theme</span>
            <div
              className="theme-mini-toggle"
              role="tablist"
              aria-label="Theme mode"
            >
              {[
                { id: "light", label: "Light" },
                { id: "dark", label: "Dark" },
                { id: "system", label: "System" },
              ].map((mode) => (
                <button
                  key={mode.id}
                  type="button"
                  className={themeMode === mode.id ? "active" : ""}
                  onClick={() => setThemeMode(mode.id)}
                >
                  {mode.label}
                </button>
              ))}
            </div>
          </div>

          <div className="admin-card-v2">
            <span>Quick export</span>
            <button
              className="secondary-button"
              type="button"
              onClick={exportAnalyticsCsv}
            >
              Export CSV
            </button>
          </div>
        </div>
      </aside>

      <div className="admin-content-v2">{renderAdminSection()}</div>
    </div>
  );

  return (
    <div className={`app view-${currentView}`}>
      <header className="topbar">
        <div className="container topbar-inner">
          <div className="brand">
            <span className="brand-mark" aria-hidden="true">
              <svg viewBox="0 0 64 64" role="img" aria-label="UniMarket logo">
                <defs>
                  <linearGradient id="umLeaf" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#2aa67f" />
                    <stop offset="100%" stopColor="#0f6b4f" />
                  </linearGradient>
                </defs>
                <circle cx="32" cy="32" r="30" fill="#0f1411" />
                <path
                  d="M19 36c0-9 6-16 13-18 6-2 13 2 13 10 0 10-8 18-20 18-4 0-6-3-6-10Z"
                  fill="url(#umLeaf)"
                />
                <path
                  d="M26 40c6-3 12-9 14-16"
                  stroke="#f4f2ee"
                  strokeWidth="2.6"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            <div>
              <div className="brand-name">UniMarket Rwanda</div>
              <div className="brand-tag">UniMarket Rwanda â€” for students, by students.</div>
            </div>
          </div>
          <nav className="nav" aria-label="Primary">
            <a className="nav-link" href="#categories">
              Categories
            </a>
            <a className="nav-link" href="#universities">
              Universities
            </a>
            <a className="nav-link" href="#featured">
              Featured
            </a>
            <a className="nav-link" href="#deals">
              Deals
            </a>
            <a className="nav-link" href="#payments">
              Payments
            </a>
            <button
              className="nav-link"
              type="button"
              onClick={() => {
                setCurrentView("profile");
                window.scrollTo(0, 0);
              }}
            >
              Profile
            </button>
            <button
              className="nav-link"
              type="button"
              onClick={() => {
                if (isAdmin) {
                  setCurrentView("admin");
                  window.scrollTo(0, 0);
                } else {
                  openAdminLogin();
                }
              }}
            >
              Admin
            </button>
            <a className="nav-link" href="#support">
              Support
            </a>
          </nav>
          <div className="topbar-actions">
            <button className="ghost-button" type="button" onClick={openSignIn}>
              Sign in
            </button>
            {authUser && (
              <button
                className="ghost-button"
                type="button"
                onClick={() => signOut(auth)}
              >
                Sign out
              </button>
            )}
            <button className="ghost-button" type="button" onClick={openSidebar}>
              Menu
            </button>
            <button className="primary-button" type="button" onClick={openListing}>
              Add an item
            </button>
          </div>
        </div>
      </header>

      <main className="home-only">

      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <p className="hero-pill">Trusted by 18,000+ students</p>
            <h1>Shop smarter. Sell faster. Right on campus.</h1>
            <p className="hero-subtitle">
              Discover verified student listings, affordable tech, and
              hostel-ready essentials across Rwanda. Buy now, or list your
              item in under two minutes.
            </p>
            <div className="hero-search">
              <input
                type="text"
                placeholder="Search for laptops, textbooks, furniture..."
                aria-label="Search products"
              />
              <button className="primary-button" type="button">
                Search
              </button>
            </div>
            <div className="hero-stats">
              <div>
                <div className="stat-number">4.9/5</div>
                <div className="stat-label">Average rating</div>
              </div>
              <div>
                <div className="stat-number">2,600+</div>
                <div className="stat-label">Active listings</div>
              </div>
              <div>
                <div className="stat-number">90 min</div>
                <div className="stat-label">Avg. sell time</div>
              </div>
            </div>
          </div>
          <div className="hero-card">
            <div className="hero-card-header">
              <p>Today on UniMarket</p>
              <span className="chip">New</span>
            </div>
            <div className="hero-card-body">
              <div className="hero-item">
                <img
                  src="https://images.unsplash.com/photo-1521791055366-0d553872125f?auto=format&fit=crop&w=800&q=80"
                  alt="Wireless headphones"
                />
                <div>
                  <h3>Wireless Headphones</h3>
                  <p>28,000 RWF â€¢ KG 15 mins ago</p>
                </div>
              </div>
              <div className="hero-item">
                <img
                  src="https://images.unsplash.com/photo-1540574163026-643ea20ade25?auto=format&fit=crop&w=800&q=80"
                  alt="Minimal study desk"
                />
                <div>
                  <h3>Minimal Study Desk</h3>
                  <p>85,000 RWF â€¢ UR Huye</p>
                </div>
              </div>
              <div className="hero-item">
                <img
                  src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80"
                  alt="Coding books stack"
                />
                <div>
                  <h3>Programming Books</h3>
                  <p>12,000 RWF â€¢ CMU Africa</p>
                </div>
              </div>
            </div>
                <button
                  className="secondary-button"
                  type="button"
                  onClick={() => {
                    if (currentView !== "home") {
                      setCurrentView("home");
                      setTimeout(() => {
                        const section = document.getElementById("featured");
                        section?.scrollIntoView({ behavior: "smooth" });
                      }, 0);
                    } else {
                      const section = document.getElementById("featured");
                      section?.scrollIntoView({ behavior: "smooth" });
                    }
                  }}
                >
                  Browse all listings
                </button>
          </div>
        </div>
      </section>

      <section className="section deals" id="deals">
        <div className="deals-motion-layer" aria-hidden="true">
          <div className="deals-bg-carousel">
            {dealsCarouselImages.map((image, index) => (
              <img
                key={`${image}-${index}`}
                src={image}
                alt=""
                className={index === dealsBgIndex ? "active" : ""}
                loading="lazy"
              />
            ))}
          </div>
          <span className="orb orb-a" />
          <span className="orb orb-b" />
          <span className="orb orb-c" />
        </div>
        <div className="container deals-grid">
          <article>
            <p className="section-kicker">Deals</p>
            <h2>Campus bundles with student pricing</h2>
            <p className="section-subtitle">
              The background rotates through featured deal images and selected
              products. Admin controls what shows.
            </p>
            <div className="deal-list">
              {deals
                .filter((deal) => deal.active !== false)
                .slice(0, 6)
                .map((deal) => (
                  <div key={deal.id || deal.title} className={deal.featured ? "active" : ""}>
                    <h4>
                      {deal.title}{" "}
                      {deal.featured ? (
                        <span className="status-badge pending">Featured</span>
                      ) : null}
                    </h4>
                    <p>{deal.detail || "Limited-time campus bundle."}</p>
                  </div>
                ))}
            </div>
            <div className="admin-inline-controls">
              <button className="primary-button" type="button">
                Browse deals
              </button>
              <button
                className="ghost-button"
                type="button"
                onClick={() => {
                  if (isAdmin) {
                    setCurrentView("admin");
                    setAdminSection("deals");
                    window.scrollTo(0, 0);
                  } else {
                    openAdminLogin();
                  }
                }}
              >
                Admin: manage deals
              </button>
            </div>
          </article>
          <article className="deal-card">
            <p className="chip">Spotlight</p>
            <h3>{spotlightDeal?.title || "Featured deal"}</h3>
            <p>{spotlightDeal?.detail || "Set a featured deal in Admin → Deals."}</p>
            <div className="deal-timer">
              <div>
                <span>08</span>
                <small>Hours</small>
              </div>
              <div>
                <span>24</span>
                <small>Minutes</small>
              </div>
              <div>
                <span>52</span>
                <small>Seconds</small>
              </div>
            </div>
            {spotlightDeal?.imageUrl ? (
              <a className="secondary-button" href={spotlightDeal.imageUrl} target="_blank" rel="noreferrer">
                View deal image
              </a>
            ) : (
              <button className="secondary-button" type="button">
                View details
              </button>
            )}
          </article>
        </div>
      </section>

      <section className="section" id="categories">
        <div className="container">
          <div className="section-header">
            <div>
              <p className="section-kicker">Categories</p>
              <h2>Shop by student needs</h2>
              <p className="section-subtitle">
                From tech to hostel essentials, find what matters most this
                semester.
              </p>
            </div>
            <button className="ghost-button" type="button">
              View all
            </button>
          </div>
          <div className="category-grid">
            {categories.map((category) => (
              <div className="category-card" key={category.title}>
                <div className="category-icon">{category.title[0]}</div>
                <div>
                  <h3>{category.title}</h3>
                  <p>{category.count} listings</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section universities" id="universities">
        <div className="container universities-grid">
          <div>
            <p className="section-kicker">Your campus</p>
            <h2>Choose your university</h2>
            <p className="section-subtitle">
              Filter listings and get pickup options that match your campus.
            </p>
            <div className="university-select">
              <select
                aria-label="Select your university"
                value={selectedUniversity}
                onChange={(event) => setSelectedUniversity(event.target.value)}
              >
                <option value="All">All universities</option>
                {universities.map((school) => (
                  <option key={school} value={school}>
                    {school}
                  </option>
                ))}
              </select>
              <span className="selection-chip">
                Showing: {selectedUniversity}
              </span>
            </div>
          </div>
          <div className="university-card">
            <h3>Campus perks</h3>
            <ul>
              <li>Verified student badges for trusted listings</li>
              <li>Pickup points near your lecture halls</li>
              <li>Deal alerts for your campus community</li>
            </ul>
          </div>
        </div>
      </section>

          <section className="section featured" id="featured">
            <div className="container">
              <div className="section-header">
                <div>
                  <p className="section-kicker">Featured</p>
                  <h2>Handpicked for high value</h2>
                  <p className="section-subtitle">
                    Verified sellers and items in top condition with fair campus
                    pricing.
                  </p>
                </div>
                <button className="primary-button" type="button">
                  See more
                </button>
              </div>
              <div className="product-grid">
                {products.map((product) => (
                  <article className="product-card" key={product.id}>
                <div className="product-image">
                  <img src={product.image} alt={product.name} />
                  <span className="product-tag">{product.tag}</span>
                </div>
                <div className="product-body">
                  <h3>{product.name}</h3>
                  <div className="product-meta">
                    <span className="price">{product.price}</span>
                    <span className="rating">â˜… {product.rating}</span>
                  </div>
                  <p>{product.location}</p>
                  <p className="product-campus">{product.university}</p>
                  <button
                    className="secondary-button"
                    type="button"
                    onClick={() => openDetails(product)}
                  >
                    View details
                  </button>
                  <button
                    className="primary-button"
                    type="button"
                    onClick={() => openCheckout(product)}
                  >
                    Buy now
                  </button>
                  <button
                    className="whatsapp-button"
                    type="button"
                    onClick={() => openWhatsApp(product)}
                  >
                    WhatsApp seller
                  </button>
                </div>
                  </article>
                ))}
              </div>
          {filteredProducts.length === 0 && (
            <div className="empty-state">
              <h3>No listings for this campus yet.</h3>
              <p>Try another university or list the first item.</p>
            </div>
          )}
        </div>
      </section>

      <section className="section payments" id="payments">
        <div className="container">
          <div className="section-header">
            <div>
              <p className="section-kicker">Payments</p>
              <h2>Pay the way students do</h2>
              <p className="section-subtitle">
                Choose trusted local options including MoMo and face-to-face
                exchange on campus.
              </p>
            </div>
            <button className="ghost-button" type="button">
              Payment help
            </button>
          </div>
          <div className="payment-grid">
            <div className="payment-card">
              <h3>MTN MoMo</h3>
              <p>Instant mobile money with escrow protection.</p>
              <span className="payment-tag">Most used</span>
            </div>
            <div className="payment-card">
              <h3>Airtel Money</h3>
              <p>Quick transfers for verified student sellers.</p>
            </div>
            <div className="payment-card">
              <h3>Face-to-face</h3>
              <p>Meet on campus and pay in person.</p>
              <span className="payment-tag light">Campus pickup</span>
            </div>
            <div className="payment-card">
              <h3>Bank transfer</h3>
              <p>For higher-value items and bundles.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container steps-grid">
          <div className="steps-card">
            <p className="section-kicker">How it works</p>
            <h2>Secure, student-focused commerce</h2>
            <p className="section-subtitle">
              Every seller is verified, with easy chat and optional campus
              delivery to keep transactions smooth.
            </p>
            <div className="steps">
              <div>
                <span>1</span>
                <div>
                  <h4>Verify your campus</h4>
                  <p>Use your student email to unlock listings.</p>
                </div>
              </div>
              <div>
                <span>2</span>
                <div>
                  <h4>Chat and pay safely</h4>
                  <p>Secure chat and escrow for peace of mind.</p>
                </div>
              </div>
              <div>
                <span>3</span>
                <div>
                  <h4>Pick up or deliver</h4>
                  <p>Meet on campus or schedule delivery.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="testimonial-card">
            <p className="section-kicker">Students love us</p>
            <h2>Trusted across Rwanda</h2>
            <div className="testimonial-list">
              {testimonials.map((item) => (
                <div key={item.name}>
                  <p>"{item.quote}"</p>
                  <span>
                    {item.name} â€¢ {item.school}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="newsletter" id="support">
        <div className="container newsletter-card">
          <div>
            <p className="section-kicker">Stay in the loop</p>
            <h2>Get weekly drops and student deals</h2>
            <p className="section-subtitle">
              Join our newsletter for the latest campus discounts and verified
              listings.
            </p>
          </div>
          <div className="newsletter-form">
            <input type="email" placeholder="Your email address" />
            <button className="primary-button" type="button">
              Subscribe
            </button>
          </div>
        </div>
      </section>

      <section className="section safety" id="safety">
        <div className="container">
          <div className="section-header">
            <div>
              <p className="section-kicker">Safety tips</p>
              <h2>Trade safely on campus</h2>
              <p className="section-subtitle">
                Simple steps that help buyers and sellers stay safe during
                meetups and payments.
              </p>
            </div>
          </div>
          <div className="safety-grid">
            <div className="safety-card">
              <h3>Meet in public spots</h3>
              <p>Use campus cafÃ©s, libraries, or security desks for exchanges.</p>
            </div>
            <div className="safety-card">
              <h3>Verify student IDs</h3>
              <p>Ask to see a student card before exchanging highâ€‘value items.</p>
            </div>
            <div className="safety-card">
              <h3>Use secure payments</h3>
              <p>MoMo and escrow help reduce cash risks.</p>
            </div>
            <div className="safety-card">
              <h3>Bring a friend</h3>
              <p>For firstâ€‘time meetups, donâ€™t go alone.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section help" id="help">
        <div className="container help-grid">
          <div>
            <p className="section-kicker">Help center</p>
            <h2>Need help? Weâ€™ve got you.</h2>
            <p className="section-subtitle">
              Quick answers, support channels, and guides for buying and selling.
            </p>
            <div className="help-actions">
              <button className="primary-button" type="button">
                Contact support
              </button>
              <button className="secondary-button" type="button">
                Report an issue
              </button>
            </div>
          </div>
          <div className="help-faq">
            <div>
              <h4>How do I verify a student?</h4>
              <p>Ask for a student card and prefer campus pickup points.</p>
            </div>
            <div>
              <h4>What payments are supported?</h4>
              <p>MTN MoMo, Airtel Money, bank transfer, and faceâ€‘toâ€‘face.</p>
            </div>
            <div>
              <h4>How do refunds work?</h4>
              <p>Refunds are handled by the seller; report disputes to support.</p>
            </div>
            <div>
              <h4>Can I edit my listing?</h4>
              <p>Yes, open your listing and choose Edit details.</p>
            </div>
          </div>
        </div>
      </section>
      </main>

      <main className="profile-only">
        <section className="section profile" id="profile">
        <div className="container profile-grid">
          <div className="profile-card">
            <div className="profile-page-actions">
              <button
                className="ghost-button"
                type="button"
                onClick={() => setCurrentView("home")}
              >
                Back to marketplace
              </button>
            </div>
            <div className="profile-cover">
              {profileCover ? (
                <img src={profileCover} alt="Profile cover" />
              ) : (
                <div className="profile-cover-placeholder" />
              )}
              <label className="profile-cover-upload">
                Change cover
                <input type="file" accept="image/*" onChange={handleCoverChange} />
              </label>
            </div>
            <div className="profile-header">
              <div className="profile-avatar">
                {profileAvatar ? (
                  <img src={profileAvatar} alt="Profile avatar" />
                ) : (
                  <span>SS</span>
                )}
                <label className="profile-avatar-upload">
                  Edit
                  <input type="file" accept="image/*" onChange={handleAvatarChange} />
                </label>
              </div>
              <div>
                <h3>{profileData.name}</h3>
                <p>{profileData.university}</p>
              </div>
              <span className="chip">Verified student</span>
            </div>
            <p className="profile-bio">{profileData.bio}</p>
            <div className="profile-stats">
              <div>
                <strong>{products.length}</strong>
                <span>Listings</span>
              </div>
              <div>
                <strong>18</strong>
                <span>Sales completed</span>
              </div>
              <div>
                <strong>4.8</strong>
                <span>Seller rating</span>
              </div>
            </div>
            <div className="profile-meta">
              <div>
                <span>Phone</span>
                <strong>{profileData.phone}</strong>
              </div>
              <div>
                <span>Email</span>
                <strong>{profileData.email}</strong>
              </div>
              <div>
                <span>Preferred payment</span>
                <strong>{profileData.preferredPayment}</strong>
              </div>
            </div>
            <div className="profile-meta">
              <div>
                <span>Program</span>
                <strong>{profileData.program}</strong>
              </div>
              <div>
                <span>Year</span>
                <strong>{profileData.year}</strong>
              </div>
              <div>
                <span>Languages</span>
                <strong>{profileData.languages}</strong>
              </div>
            </div>
            <div className="profile-badges">
              <span>Fast responder</span>
              <span>Safe meetups</span>
              <span>Top campus seller</span>
            </div>
            <div className="profile-socials">
              <div>
                <span>LinkedIn</span>
                <strong>{profileData.linkedin}</strong>
              </div>
              <div>
                <span>Instagram</span>
                <strong>{profileData.instagram}</strong>
              </div>
            </div>
          </div>
          <div className="profile-form">
            <div className="section-header">
              <div>
                <p className="section-kicker">Your profile</p>
                <h2>Manage your student profile</h2>
                <p className="section-subtitle">
                  Keep your contact info, campus, and payment preferences up to
                  date so buyers can trust you.
                </p>
              </div>
            </div>
            <div className="profile-fields">
              <div className="listing-split">
                <div className="listing-field">
                  <label htmlFor="profile-avatar">Profile photo</label>
                  <input
                    id="profile-avatar"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                  />
                </div>
                <div className="listing-field">
                  <label htmlFor="profile-cover">Cover photo</label>
                  <input
                    id="profile-cover"
                    type="file"
                    accept="image/*"
                    onChange={handleCoverChange}
                  />
                </div>
              </div>
              <div className="listing-field">
                <label htmlFor="profile-name">Full name</label>
                <input
                  id="profile-name"
                  name="name"
                  type="text"
                  value={profileData.name}
                  onChange={handleProfileChange}
                />
              </div>
              <div className="listing-field">
                <label htmlFor="profile-university">University</label>
                <select
                  id="profile-university"
                  name="university"
                  value={profileData.university}
                  onChange={handleProfileChange}
                >
                  {universities.map((school) => (
                    <option key={school} value={school}>
                      {school}
                    </option>
                  ))}
                </select>
              </div>
              <div className="listing-split">
                <div className="listing-field">
                  <label htmlFor="profile-program">Program</label>
                  <input
                    id="profile-program"
                    name="program"
                    type="text"
                    value={profileData.program}
                    onChange={handleProfileChange}
                  />
                </div>
                <div className="listing-field">
                  <label htmlFor="profile-year">Study year</label>
                  <input
                    id="profile-year"
                    name="year"
                    type="text"
                    value={profileData.year}
                    onChange={handleProfileChange}
                  />
                </div>
              </div>
              <div className="listing-split">
                <div className="listing-field">
                  <label htmlFor="profile-phone">Phone</label>
                  <input
                    id="profile-phone"
                    name="phone"
                    type="tel"
                    value={profileData.phone}
                    onChange={handleProfileChange}
                  />
                </div>
                <div className="listing-field">
                  <label htmlFor="profile-email">Email</label>
                  <input
                    id="profile-email"
                    name="email"
                    type="email"
                    value={profileData.email}
                    onChange={handleProfileChange}
                  />
                </div>
              </div>
              <div className="listing-field">
                <label htmlFor="profile-payment">Preferred payment</label>
                <select
                  id="profile-payment"
                  name="preferredPayment"
                  value={profileData.preferredPayment}
                  onChange={handleProfileChange}
                >
                  <option value="MTN MoMo">MTN MoMo</option>
                  <option value="Airtel Money">Airtel Money</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Face-to-face">Face-to-face</option>
                </select>
              </div>
              <div className="listing-field">
                <label htmlFor="profile-skills">Skills</label>
                <input
                  id="profile-skills"
                  name="skills"
                  type="text"
                  value={profileData.skills}
                  onChange={handleProfileChange}
                />
              </div>
              <div className="listing-field">
                <label htmlFor="profile-languages">Languages</label>
                <input
                  id="profile-languages"
                  name="languages"
                  type="text"
                  value={profileData.languages}
                  onChange={handleProfileChange}
                />
              </div>
              <div className="listing-split">
                <div className="listing-field">
                  <label htmlFor="profile-linkedin">LinkedIn</label>
                  <input
                    id="profile-linkedin"
                    name="linkedin"
                    type="text"
                    value={profileData.linkedin}
                    onChange={handleProfileChange}
                  />
                </div>
                <div className="listing-field">
                  <label htmlFor="profile-instagram">Instagram</label>
                  <input
                    id="profile-instagram"
                    name="instagram"
                    type="text"
                    value={profileData.instagram}
                    onChange={handleProfileChange}
                  />
                </div>
              </div>
              <div className="listing-field">
                <label htmlFor="profile-bio">Short bio</label>
                <textarea
                  id="profile-bio"
                  name="bio"
                  rows={4}
                  value={profileData.bio}
                  onChange={handleProfileChange}
                />
              </div>
              <div className="listing-actions">
                <button className="primary-button" type="button" onClick={saveProfile}>
                  Save profile
                </button>
                <button className="secondary-button" type="button">
                  View public profile
                </button>
              </div>
            </div>
            <div className="profile-activity">
              <h4>Recent listings</h4>
              <div className="profile-list">
                {products.slice(0, 3).map((item) => (
                  <div key={item.id}>
                    <span>{item.name}</span>
                    <strong>{item.price}</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        </section>
      </main>

      <main className="admin-only">
        <section className="section admin" id="admin">
          {isAdmin ? (
            <>
              <div className="container admin-page-header">
                <button
                  className="ghost-button"
                  type="button"
                  onClick={() => setCurrentView("home")}
                >
                  Back to marketplace
                </button>
                <div>
                  <p className="section-kicker">Admin panel</p>
                  <h2>Marketplace control center</h2>
                </div>
                <button className="secondary-button" type="button" onClick={signOutAdmin}>
                  Sign out admin
                </button>
              </div>
              {renderAdminPanel()}
            </>
          ) : (
            <div className="container admin-locked">
              <h2>Admin access required</h2>
              <p>Sign in as admin to manage deals and verify students.</p>
              <button className="primary-button" type="button" onClick={openAdminLogin}>
                Admin sign in
              </button>
            </div>
          )}
        </section>
      </main>

      <footer className="footer">
        <div className="container footer-grid">
          <div>
            <div className="brand-name">UniMarket Rwanda</div>
            <p>
              The campus-first marketplace that helps students buy and sell
              confidently.
            </p>
          </div>
          <div>
            <h4>Marketplace</h4>
            <a href="#featured">Featured items</a>
            <a href="#categories">Categories</a>
            <a href="#deals">Deals</a>
          </div>
          <div>
            <h4>Support</h4>
            <a href="#support">Help center</a>
            <a href="#support">Delivery options</a>
            <a href="#support">Safety tips</a>
          </div>
          <div>
            <h4>Contact</h4>
            <p>kigali@unimarket.rw</p>
            <p>+250 794 426 200</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>Â© 2026 UniMarket Rwanda. All rights reserved.</p>
        </div>
      </footer>

      {profileToasts.length > 0 && (
        <div className="toast-container">
          {profileToasts.map((toast) => (
            <div key={toast.id} className="profile-toast">
              {toast.message}
            </div>
          ))}
        </div>
      )}

      {checkoutProduct && (
        <div className="checkout-overlay" role="dialog" aria-modal="true">
          <div className="checkout-modal">
            <div className="checkout-header">
              <div>
                <p className="section-kicker">Checkout</p>
                <h3>{orderConfirmed ? "Order confirmed" : "Complete your purchase"}</h3>
              </div>
              <button
                className="ghost-button"
                type="button"
                onClick={closeCheckout}
              >
                Close
              </button>
            </div>
            <div className="checkout-body">
              {!orderConfirmed ? (
                <>
                  <div className="checkout-summary">
                    <img src={checkoutProduct.image} alt={checkoutProduct.name} />
                    <div>
                      <h4>{checkoutProduct.name}</h4>
                      <p>{checkoutProduct.university}</p>
                      <span className="price">{checkoutProduct.price}</span>
                    </div>
                  </div>
                  <div className="checkout-options">
                    <div>
                      <h4>Payment method</h4>
                      <div className="radio-group">
                        {["MTN MoMo", "Airtel Money", "Bank Transfer", "Face-to-face"].map(
                          (method) => (
                            <label key={method} className="radio-card">
                              <input
                                type="radio"
                                name="payment"
                                value={method}
                                checked={paymentMethod === method}
                                onChange={(event) =>
                                  setPaymentMethod(event.target.value)
                                }
                              />
                              <span>{method}</span>
                            </label>
                          )
                        )}
                      </div>
                    </div>
                    <div>
                      <h4>Delivery option</h4>
                      <div className="radio-group">
                        {["Campus pickup", "Dorm delivery", "Meet in public spot"].map(
                          (method) => (
                            <label key={method} className="radio-card">
                              <input
                                type="radio"
                                name="delivery"
                                value={method}
                                checked={deliveryMethod === method}
                                onChange={(event) =>
                                  setDeliveryMethod(event.target.value)
                                }
                              />
                              <span>{method}</span>
                            </label>
                          )
                        )}
                      </div>
                    </div>
                    <div>
                      <h4>Quantity</h4>
                      <div className="quantity-control">
                        <button
                          className="ghost-button"
                          type="button"
                          onClick={() =>
                            setQuantity((value) => Math.max(1, value - 1))
                          }
                        >
                          -
                        </button>
                        <span>{quantity}</span>
                        <button
                          className="ghost-button"
                          type="button"
                          onClick={() => setQuantity((value) => value + 1)}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                  {orderSummary && (
                    <div className="order-summary">
                      <h4>Order summary</h4>
                      <div className="summary-row">
                        <span>
                          Item price x {quantity}
                        </span>
                        <span>{formatPrice(orderSummary.subtotal)}</span>
                      </div>
                      <div className="summary-row">
                        <span>Service fee (3%)</span>
                        <span>{formatPrice(orderSummary.serviceFee)}</span>
                      </div>
                      <div className="summary-row">
                        <span>Delivery fee</span>
                        <span>{formatPrice(orderSummary.deliveryFee)}</span>
                      </div>
                      <div className="summary-row total">
                        <span>Total</span>
                        <span>{formatPrice(orderSummary.total)}</span>
                      </div>
                    </div>
                  )}
                  <div className="checkout-form">
                    <input type="text" placeholder="Full name" />
                    <input type="tel" placeholder="Phone number" />
                    <input type="text" placeholder="Meeting point or dorm" />
                    <button
                      className="primary-button"
                      type="button"
                      onClick={confirmOrder}
                    >
                      Confirm order
                    </button>
                    <p className="checkout-note">
                      By confirming, you agree to meet safely on campus or use secure
                      MoMo escrow.
                    </p>
                  </div>
                </>
              ) : (
                <div className="receipt print-area">
                  <div className="receipt-header">
                    <div className="receipt-badge">Success</div>
                    <div>
                      <h4>Order #{orderId}</h4>
                      <p>Your order has been placed successfully.</p>
                    </div>
                  </div>
                  <div className="receipt-details">
                    <div>
                      <span>Item</span>
                      <strong>{checkoutProduct.name}</strong>
                    </div>
                    <div>
                      <span>University</span>
                      <strong>{checkoutProduct.university}</strong>
                    </div>
                    <div>
                      <span>Payment</span>
                      <strong>{paymentMethod}</strong>
                    </div>
                    <div>
                      <span>Delivery</span>
                      <strong>{deliveryMethod}</strong>
                    </div>
                    <div>
                      <span>Quantity</span>
                      <strong>{quantity}</strong>
                    </div>
                    {orderSummary && (
                      <div>
                        <span>Total paid</span>
                        <strong>{formatPrice(orderSummary.total)}</strong>
                      </div>
                    )}
                  </div>
                  <div className="confirmation-form">
                    <h4>Send confirmation</h4>
                    <div className="confirmation-fields">
                      <input
                        type="email"
                        placeholder="Email address"
                        value={contactEmail}
                        onChange={(event) => setContactEmail(event.target.value)}
                      />
                      <input
                        type="tel"
                        placeholder="Phone number (SMS)"
                        value={contactPhone}
                        onChange={(event) => setContactPhone(event.target.value)}
                      />
                    </div>
                    <button
                      className="primary-button print-hide"
                      type="button"
                      onClick={sendConfirmation}
                    >
                      Send confirmation
                    </button>
                    {confirmationError && (
                      <p className="confirmation-error">{confirmationError}</p>
                    )}
                    {confirmationSent && (
                      <p className="confirmation-note">
                        Confirmation sent to {contactEmail || "email"} and{" "}
                        {contactPhone || "phone"}.
                      </p>
                    )}
                  </div>
                  <div className="receipt-actions">
                    <button
                      className="secondary-button"
                      type="button"
                      onClick={closeCheckout}
                    >
                      Done
                    </button>
                    <button
                      className="ghost-button print-hide"
                      type="button"
                      onClick={printReceipt}
                    >
                      Print receipt
                    </button>
                    <button
                      className="ghost-button print-hide"
                      type="button"
                      onClick={downloadReceiptPdf}
                    >
                      Download PDF
                    </button>
                    <button
                      className="primary-button print-hide"
                      type="button"
                      onClick={() => setOrderConfirmed(false)}
                    >
                      Edit order
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {detailProduct && (
        <div className="details-overlay" role="dialog" aria-modal="true">
          <div className="details-modal">
            <div className="details-header">
              <div>
                <p className="section-kicker">Product details</p>
                <h3>{detailProduct.name}</h3>
              </div>
              <button className="ghost-button" type="button" onClick={closeDetails}>
                Close
              </button>
            </div>
            <div className="details-body">
              <div className="details-media">
                <button
                  className="details-nav prev"
                  type="button"
                  onClick={() => {
                    const media = getDetailMedia(detailProduct);
                    setDetailImageIndex(
                      (prev) => (prev - 1 + media.length) % media.length
                    );
                  }}
                >
                  â€¹
                </button>
                {getDetailMedia(detailProduct)[detailImageIndex]?.type?.startsWith(
                  "video/"
                ) ? (
                  <video
                    src={getDetailMedia(detailProduct)[detailImageIndex].url}
                    controls
                  />
                ) : (
                  <img
                    src={
                      getDetailMedia(detailProduct)[detailImageIndex]?.url ||
                      detailProduct.image
                    }
                    alt={detailProduct.name}
                  />
                )}
                <button
                  className="details-nav next"
                  type="button"
                  onClick={() => {
                    const media = getDetailMedia(detailProduct);
                    setDetailImageIndex((prev) => (prev + 1) % media.length);
                  }}
                >
                  â€º
                </button>
                {getDetailMedia(detailProduct).length > 1 ? (
                  <div className="details-thumbs">
                    {getDetailMedia(detailProduct).map((media, index) => (
                      <button
                        key={`${media.url}-${index}`}
                        className={`details-thumb ${
                          index === detailImageIndex ? "active" : ""
                        }`}
                        type="button"
                        onClick={() => setDetailImageIndex(index)}
                      >
                        {media.type?.startsWith("video/") ? (
                          <video src={media.url} muted />
                        ) : (
                          <img
                            src={media.url}
                            alt={`${detailProduct.name} ${index + 1}`}
                          />
                        )}
                      </button>
                    ))}
                  </div>
                ) : null}
                <div className="details-tags">
                  <span className="product-tag">{detailProduct.tag}</span>
                  <span className="rating">â˜… {detailProduct.rating}</span>
                </div>
              </div>
              <div className="details-info">
                <div className="details-price">
                  <span className="price">{detailProduct.price}</span>
                  <span>{detailProduct.location}</span>
                </div>
                <div className="seller-card">
                  <h4>Seller details</h4>
                  <div>
                    <span>Name</span>
                    <strong>{detailProduct.seller?.name || "Verified seller"}</strong>
                  </div>
                  <div>
                    <span>Phone</span>
                    <strong>{detailProduct.seller?.phone || "Not provided"}</strong>
                  </div>
                  <div>
                    <span>Response time</span>
                    <strong>{detailProduct.seller?.responseTime || "1-2 hours"}</strong>
                  </div>
                </div>
                <div className="details-meta">
                  <div>
                    <span>University</span>
                    <strong>{detailProduct.university}</strong>
                  </div>
                  <div>
                    <span>Condition</span>
                    <strong>Used - good</strong>
                  </div>
                  <div>
                    <span>Pickup</span>
                    <strong>Campus pickup</strong>
                  </div>
                </div>
                <div className="details-description">
                  <h4>About this item</h4>
                  <p>
                    Clean condition, student-owned, ready for immediate pickup.
                    Includes charger and basic accessories. Chat seller for
                    more details.
                  </p>
                </div>
                <div className="details-actions">
                  <button
                    className="secondary-button"
                    type="button"
                    onClick={closeDetails}
                  >
                    Back to list
                  </button>
                  <button
                    className="whatsapp-button"
                    type="button"
                    onClick={() => openWhatsApp(detailProduct)}
                  >
                    WhatsApp seller
                  </button>
                  <button
                    className="primary-button"
                    type="button"
                    onClick={() => {
                      openCheckout(detailProduct);
                      closeDetails();
                    }}
                  >
                    Buy now
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {listingOpen && (
        <div className="listing-overlay" role="dialog" aria-modal="true">
          <div className="listing-modal">
            <div className="listing-modal-header">
              <div>
                <p className="section-kicker">Sell fast</p>
                <h3>List an item in minutes</h3>
              </div>
              <button className="ghost-button" type="button" onClick={closeListing}>
                Close
              </button>
            </div>
            <div className="listing-modal-body">
              <div className="listing-modal-copy">
                <p className="section-subtitle">
                  Add your item, choose a campus pickup point, and reach verified
                  students quickly.
                </p>
                <div className="listing-tips">
                  <div>
                    <h4>Boost visibility</h4>
                    <p>Add 3+ photos and a clear title.</p>
                  </div>
                  <div>
                    <h4>Trust first</h4>
                    <p>Use MoMo or face-to-face for safe transactions.</p>
                  </div>
                  <div>
                    <h4>Fast pickup</h4>
                    <p>Offer campus pickup for quicker sales.</p>
                  </div>
                </div>
              </div>
              <form className="listing-form" onSubmit={submitListing}>
                <div className="listing-form-header">
                  <h3>Item details</h3>
                  <span className="chip">Seller dashboard</span>
                </div>
                <div className="listing-field">
                  <label>Publisher type</label>
                  <div className="radio-group">
                    <label className="radio-card">
                      <input
                        type="radio"
                        name="publisherType"
                        value="student"
                        checked={listingData.publisherType === "student"}
                        onChange={handleListingChange}
                      />
                      <span>Student seller</span>
                    </label>
                    <label className="radio-card">
                      <input
                        type="radio"
                        name="publisherType"
                        value="business"
                        checked={listingData.publisherType === "business"}
                        onChange={handleListingChange}
                      />
                      <span>Business owner (non-student)</span>
                    </label>
                  </div>
                  {listingData.publisherType === "business" && (
                    <div className="admin-card-v2 admin-top-gap">
                      <span>Business subscription required</span>
                      <strong>
                        {activeBusinessSubscription
                          ? `${activeBusinessSubscription.name} active`
                          : "No active subscription"}
                      </strong>
                      <p className="section-subtitle">
                        Weekly plan is $1, monthly plan is $5. Choose a bundle
                        and activate before publishing.
                      </p>
                      <div className="admin-form-grid">
                        <div className="listing-field">
                          <label htmlFor="business-bundle">Choose bundle</label>
                          <select
                            id="business-bundle"
                            value={selectedBusinessBundle}
                            onChange={(event) =>
                              setSelectedBusinessBundle(event.target.value)
                            }
                          >
                            {businessBundles.map((bundle) => (
                              <option key={bundle.id} value={bundle.id}>
                                {bundle.name} - ${bundle.priceUsd}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="listing-field">
                          <label>&nbsp;</label>
                          <button
                            className="primary-button"
                            type="button"
                            onClick={activateBusinessSubscription}
                          >
                            Activate subscription
                          </button>
                        </div>
                      </div>
                      <div className="admin-stack">
                        {businessBundles.map((bundle) => (
                          <div className="admin-list-item" key={bundle.id}>
                            <div>
                              <strong>
                                {bundle.name} - ${bundle.priceUsd}
                              </strong>
                              <span>{bundle.description}</span>
                            </div>
                            <span className="status-badge pending">
                              {bundle.durationDays} days
                            </span>
                          </div>
                        ))}
                      </div>
                      {activeBusinessSubscription?.expiresAt ? (
                        <p className="section-subtitle">
                          Expires:{" "}
                          {new Date(
                            activeBusinessSubscription.expiresAt
                          ).toLocaleDateString("en-US")}
                        </p>
                      ) : null}
                      {subscriptionNotice ? (
                        <p className="signin-note">{subscriptionNotice}</p>
                      ) : null}
                    </div>
                  )}
                </div>
                <div className="listing-field">
                  <label htmlFor="listing-name">Item title</label>
                  <input
                    id="listing-name"
                    name="name"
                    type="text"
                    placeholder="E.g. MacBook Air 2020"
                    value={listingData.name}
                    onChange={handleListingChange}
                    required
                  />
                </div>
                <div className="listing-field">
                  <label htmlFor="listing-category">Category</label>
                  <select
                    id="listing-category"
                    name="category"
                    value={listingData.category}
                    onChange={handleListingChange}
                    required
                  >
                    <option value="" disabled>
                      Select category
                    </option>
                    {categories.map((category) => (
                      <option key={category.title} value={category.title}>
                        {category.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="listing-split">
                  <div className="listing-field">
                    <label htmlFor="listing-price">Price (RWF)</label>
                    <input
                      id="listing-price"
                      name="price"
                      type="text"
                      placeholder="e.g. 120,000"
                      value={listingData.price}
                      onChange={handleListingChange}
                      required
                    />
                  </div>
                  <div className="listing-field">
                    <label htmlFor="listing-condition">Condition</label>
                    <select
                      id="listing-condition"
                      name="condition"
                      value={listingData.condition}
                      onChange={handleListingChange}
                    >
                      <option value="New">New</option>
                      <option value="Used - like new">Used - like new</option>
                      <option value="Used - good">Used - good</option>
                      <option value="Used - fair">Used - fair</option>
                    </select>
                  </div>
                </div>
                <div className="listing-split">
                  <div className="listing-field">
                    <label htmlFor="listing-university">University</label>
                    <select
                      id="listing-university"
                      name="university"
                      value={listingData.university}
                      onChange={handleListingChange}
                    >
                      {universities.map((school) => (
                        <option key={school} value={school}>
                          {school}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="listing-field">
                    <label htmlFor="listing-payment">Preferred payment</label>
                    <select
                      id="listing-payment"
                      name="payment"
                      value={listingData.payment}
                      onChange={handleListingChange}
                    >
                      <option value="MTN MoMo">MTN MoMo</option>
                      <option value="Airtel Money">Airtel Money</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="Face-to-face">Face-to-face</option>
                    </select>
                  </div>
                </div>
                <div className="listing-field">
                  <label htmlFor="listing-delivery">Delivery option</label>
                  <select
                    id="listing-delivery"
                    name="delivery"
                    value={listingData.delivery}
                    onChange={handleListingChange}
                  >
                    <option value="Campus pickup">Campus pickup</option>
                    <option value="Dorm delivery">Dorm delivery</option>
                    <option value="Meet in public spot">Meet in public spot</option>
                  </select>
                </div>
                <div className="listing-field">
                  <label htmlFor="listing-description">Description</label>
                  <textarea
                    id="listing-description"
                    name="description"
                    placeholder="Tell buyers about the condition, accessories, and pickup times."
                    value={listingData.description}
                    onChange={handleListingChange}
                    rows={4}
                  />
                </div>
                <div className="listing-field">
                  <label>Seller contact</label>
                  <div className="listing-split">
                    <input
                      name="sellerName"
                      type="text"
                      placeholder="Seller name"
                      value={listingData.sellerName}
                      onChange={handleListingChange}
                    />
                    <input
                      name="sellerPhone"
                      type="tel"
                      placeholder="Phone number"
                      value={listingData.sellerPhone}
                      onChange={handleListingChange}
                    />
                  </div>
                  <select
                    name="sellerResponse"
                    value={listingData.sellerResponse}
                    onChange={handleListingChange}
                  >
                    <option value="Under 1 hour">Under 1 hour</option>
                    <option value="1-2 hours">1-2 hours</option>
                    <option value="Same day">Same day</option>
                    <option value="Within 24 hours">Within 24 hours</option>
                  </select>
                </div>
                <div className="listing-field">
                  <label htmlFor="listing-images">Product photos</label>
                  <div className="image-upload">
                      <input
                        id="listing-images"
                        type="file"
                        accept="image/*,video/*"
                        multiple
                        onChange={handleListingImages}
                      />
                      <p>
                      Upload up to 6 photos or videos. Choose one as the main
                      image that represents the rest.
                      </p>
                  </div>
                  {listingImages.length > 0 && (
                    <div className="image-grid">
                      {listingImages.map((image, index) => (
                        <div
                          className={`image-card ${
                            index === mainImageIndex ? "main" : ""
                          }`}
                          key={image.url}
                        >
                          {image.type && image.type.startsWith("video/") ? (
                            <video src={image.url} muted />
                          ) : (
                            <img src={image.url} alt={image.name} />
                          )}
                          <div className="image-actions">
                            <label className="radio-card">
                              <input
                                type="radio"
                                name="mainImage"
                                checked={index === mainImageIndex}
                                onChange={() => setMainImageIndex(index)}
                              />
                              <span>Main</span>
                            </label>
                            <button
                              className="ghost-button"
                              type="button"
                              onClick={() => removeListingImage(index)}
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="listing-actions">
                  <button className="primary-button" type="submit">
                    Publish listing
                  </button>
                  <button
                    className="secondary-button"
                    type="button"
                    onClick={() => setListingSubmitted(false)}
                  >
                    Save draft
                  </button>
                </div>
                {listingSubmitted && (
                  <div className="listing-success">
                    <strong>Listing submitted!</strong>
                    <p>
                      Your item is now pending verification and will appear on your
                      campus feed soon.
                    </p>
                  </div>
                )}
                {listingError && (
                  <div className="listing-error">
                    <strong>Listing error</strong>
                    <p>{listingError}</p>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      )}

      {sidebarOpen && (
        <div className="sidebar-overlay" role="dialog" aria-modal="true">
          <aside className="sidebar">
            <div className="sidebar-header">
              <div>
                <p className="section-kicker">Quick access</p>
                <h3>UniMarket menu</h3>
              </div>
              <button className="ghost-button" type="button" onClick={closeSidebar}>
                Close
              </button>
            </div>
            <div className="sidebar-links">
              <a href="#featured">Featured items</a>
              <a href="#categories">Categories</a>
              <a href="#deals">Deals</a>
              <a href="#payments">Payments</a>
              <button
                className="nav-link"
                type="button"
                onClick={() => {
                  setCurrentView("profile");
                  closeSidebar();
                  window.scrollTo(0, 0);
                }}
              >
                Profile page
              </button>
              <a href="#support">Help center</a>
            </div>
            <div className="sidebar-block">
              <h4>Theme mode</h4>
              <div className="radio-group">
                {[
                  { value: "light", label: "Light" },
                  { value: "dark", label: "Dark" },
                  { value: "system", label: "System default" },
                ].map((mode) => (
                  <label key={mode.value} className="radio-card">
                    <input
                      type="radio"
                      name="theme"
                      value={mode.value}
                      checked={themeMode === mode.value}
                      onChange={(event) => setThemeMode(event.target.value)}
                    />
                    <span>{mode.label}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="sidebar-block">
              <h4>Extras</h4>
              <p>
                Campus safety tips, seller guidelines, and marketplace policies
                live here for quick reference.
              </p>
            </div>
          </aside>
        </div>
      )}

      {signInOpen && (
        <div className="signin-overlay" role="dialog" aria-modal="true">
          <div className="signin-modal">
            <div className="signin-header">
              <div>
                <p className="section-kicker">Secure access</p>
                <h3>Student verification</h3>
              </div>
              <button className="ghost-button" type="button" onClick={closeSignIn}>
                Close
              </button>
            </div>
            {!signInSuccess ? (
              <>
                <div className="signin-steps">
                  <span className={signInStep === "email" ? "active" : ""}>
                    1. Student email
                  </span>
                  <span className={signInStep === "code" ? "active" : ""}>
                    2. Verify code
                  </span>
                </div>
                {signInStep === "email" ? (
                  <form
                    className="signin-form"
                    onSubmit={(event) => event.preventDefault()}
                  >
                    <div className="listing-field">
                      <label htmlFor="signin-university">University</label>
                      <select
                        id="signin-university"
                        name="university"
                        value={signInData.university}
                        onChange={handleSignInChange}
                      >
                        {universities.map((school) => (
                          <option key={school} value={school}>
                            {school}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="listing-field">
                      <label htmlFor="signin-email">Student email</label>
                      <input
                        id="signin-email"
                        name="email"
                        type="email"
                        placeholder="name@example.com"
                        value={signInData.email}
                        onChange={handleSignInChange}
                        required
                      />
                    </div>
                    <div className="listing-field">
                      <label htmlFor="signin-password">Password</label>
                      <input
                        id="signin-password"
                        name="password"
                        type="password"
                        placeholder="Create or enter a password"
                        value={signInData.password}
                        onChange={handleSignInChange}
                        required
                      />
                    </div>
                    <div className="listing-field">
                      <label htmlFor="signin-card">Student ID card</label>
                      <input
                        id="signin-card"
                        type="file"
                        accept="image/*"
                        required
                        onChange={handleStudentCard}
                      />
                      {idScanStatus !== "idle" && (
                        <p className="signin-note">
                          {idScanStatus === "scanning"
                            ? "Scanning ID card with AI..."
                            : "ID verified. A code was sent to your email."}
                        </p>
                      )}
                    </div>
                    {signInError && <p className="signin-error">{signInError}</p>}
                    <button
                      className="primary-button"
                      type="button"
                      onClick={signInWithEmail}
                    >
                      Sign in & submit for review
                    </button>
                    <button
                      className="secondary-button"
                      type="button"
                      onClick={signUpWithEmail}
                    >
                      Create account & send email verification
                    </button>
                    <button
                      className="ghost-button"
                      type="button"
                      onClick={resendVerificationEmail}
                    >
                      Resend verification email
                    </button>
                    <button
                      className="ghost-button"
                      type="button"
                      onClick={refreshVerificationStatus}
                    >
                      Refresh verification status
                    </button>
                    <button
                      className="ghost-button"
                      type="button"
                      onClick={signInWithGoogle}
                    >
                      Continue with Google
                    </button>
                    <p className="signin-note">
                      Verify your email first, then upload your student card for
                      admin approval.
                    </p>
                  </form>
                ) : (
                  <form className="signin-form" onSubmit={verifyCode}>
                    <div className="listing-field">
                      <label htmlFor="signin-code">Admin approval code</label>
                      <input
                        id="signin-code"
                        name="code"
                        type="text"
                        placeholder="Enter admin approval code"
                        value={signInData.code}
                        onChange={handleSignInChange}
                        required
                      />
                    </div>
                    {signInError && <p className="signin-error">{signInError}</p>}
                    {resendNotice && (
                      <p className="signin-note">{resendNotice}</p>
                    )}
                    <button className="primary-button" type="submit">
                      Submit for approval
                    </button>
                    <button
                      className="ghost-button"
                      type="button"
                      onClick={resendCode}
                    >
                      Request admin code
                    </button>
                    <button
                      className="secondary-button"
                      type="button"
                      onClick={() => setSignInStep("email")}
                    >
                      Change email
                    </button>
                  </form>
                )}
              </>
            ) : (
              <div className="signin-success">
                <h4>Verified!</h4>
                <p>
                  Your student account has been secured. You now have access to
                  verified listings and campus-only features.
                </p>
                <button className="primary-button" type="button" onClick={closeSignIn}>
                  Go to marketplace
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {adminLoginOpen && (
        <div className="signin-overlay" role="dialog" aria-modal="true">
          <div className="signin-modal">
            <div className="signin-header">
              <div>
                <p className="section-kicker">Admin access</p>
                <h3>Sign in as admin</h3>
              </div>
              <button className="ghost-button" type="button" onClick={closeAdminLogin}>
                Close
              </button>
            </div>
            <form className="signin-form" onSubmit={submitAdminLogin}>
              <div className="listing-field">
                <label htmlFor="admin-email">Admin email</label>
                <input
                  id="admin-email"
                  name="email"
                  type="email"
                  value={adminLoginData.email}
                  onChange={handleAdminLoginChange}
                  placeholder="admin@unimarket.rw"
                  required
                />
              </div>
              <div className="listing-field">
                <label htmlFor="admin-password">Password</label>
                <input
                  id="admin-password"
                  name="password"
                  type="password"
                  value={adminLoginData.password}
                  onChange={handleAdminLoginChange}
                  placeholder="Admin password"
                  required
                />
              </div>
              {adminLoginError && <p className="signin-error">{adminLoginError}</p>}
              <button className="primary-button" type="submit">
                Sign in
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

