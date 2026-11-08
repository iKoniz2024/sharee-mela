"use client";

import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

import { useState, useEffect } from "react";
import { Search, ShoppingCart, Sun, Moon, ChevronDown, Menu, X, Phone, Package, House, LayoutGrid, Store, TrendingUp, Zap, User, Sparkles, ArrowRight, Layers } from "lucide-react";
import { FaFacebookF, FaYoutube, FaTwitter, FaInstagram, FaWhatsapp } from "react-icons/fa";
import { useQuery } from "@tanstack/react-query";
import useCart from "@/hooks/useCart";
import useTheme from "@/hooks/useTheme";
import { getCategories } from "@/services/category.api";
import useSettings from "@/hooks/useSettings";
import { getLocalCartCount } from "@/utils/localCart";
import { useAuth } from "@/hooks/useAuth";

const Navbar = () => {
    const { cartCount, refetchCartCount } = useCart();
    const { theme, toggleTheme } = useTheme();
    const { siteName, logo, contactPhone, facebookUrl, instagramUrl, youtubeUrl } = useSettings();
    const { user, logout } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [search, setSearch] = useState("");
    const [mobileOpen, setMobileOpen] = useState(false);
    const [mobileCatOpen, setMobileCatOpen] = useState(false);
    const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    const socialLinks = [
        { icon: FaFacebookF, href: facebookUrl || "https://facebook.com", label: "Facebook" },
        { icon: FaYoutube, href: youtubeUrl || "https://youtube.com", label: "YouTube" },
        { icon: FaTwitter, href: "https://twitter.com", label: "Twitter" },
        { icon: FaInstagram, href: instagramUrl || "https://instagram.com", label: "Instagram" },
    ];

    const announcementText = "ঢাকার ভিতরে ডেলিভারি মাত্র ৬০ টাকা, ঢাকার বাইরে ১২০ টাকা 💚 সারাদেশে ক্যাশ অন ডেলিভারি সুবিধা 💚 আপনার পছন্দের শাড়িটি পেতে এখনই অর্ডার করুন 💚 খুব দ্রুত হোম ডেলিভারি সেবা দিয়ে থাকি";

    const { data: categories } = useQuery({
        queryKey: ["categories"],
        queryFn: getCategories,
        staleTime: 10 * 60 * 1000,
    });

    const currentCategory = searchParams?.get("category");

    const categoryList = Array.isArray(categories)
        ? categories
        : Array.isArray(categories?.categories)
        ? categories.categories
        : [];

    const scrollToSection = (sectionId) => {
        if (pathname === "/") {
            const el = document.getElementById(sectionId);
            if (el) el.scrollIntoView({ behavior: "smooth" });
        } else {
            router.push("/", { state: { scrollTo: sectionId } });
        }
    };

    useEffect(() => {
        refetchCartCount(getLocalCartCount());
        setMounted(true);
    }, [refetchCartCount]);

    useEffect(() => {
        setMenuOpen(false);
    }, [pathname, searchParams]);

    return (
        <header className="sticky top-0 z-100 bg-background">
            {/* Top Announcement Bar */}
            <div className="bg-[#d8359b] text-white">
                <div className="mx-auto flex h-8 sm:h-9 max-w-7xl items-center justify-between px-3 sm:px-4 text-xs sm:text-[13px]">
                    {/* Left: Announcement Label & Marquee Ticker */}
                    <div className="flex items-center flex-1 overflow-hidden mr-2 sm:mr-4">
                        <div className="flex items-center gap-1.5 shrink-0 bg-white/20 backdrop-blur-xs px-2 sm:px-2.5 py-0.5 rounded text-[11px] sm:text-xs font-bold text-white tracking-wide shadow-xs mr-2 sm:mr-3">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                            </span>
                            <span>ঘোষণা</span>
                        </div>

                        <div className="overflow-hidden whitespace-nowrap flex-1 flex items-center select-none">
                            <div className="animate-topbar-marquee inline-flex items-center gap-8 sm:gap-12 font-medium">
                                <span className="inline-block">{announcementText}</span>
                                <span className="inline-block" aria-hidden="true">{announcementText}</span>
                            </div>
                        </div>
                    </div>

                    {/* Right: Social Media Links (Desktop/Tablet) */}
                    <div className="hidden sm:flex items-center gap-1.5 sm:gap-2.5 shrink-0 pl-2 sm:pl-3 border-l border-white/20">
                        {socialLinks.map((item, idx) => (
                            <a
                                key={idx}
                                href={item.href || "#"}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex size-5 sm:size-6 items-center justify-center rounded-full bg-white/15 hover:bg-white hover:text-[#d8359b] text-white transition-all duration-200"
                                title={item.label}
                                aria-label={item.label}
                            >
                                <item.icon className="size-2.5 sm:size-3" />
                            </a>
                        ))}
                    </div>
                </div>
            </div>

            {/* Top Header */}
            <div className="border-b border-border">
                <div className="mx-auto flex h-16 sm:h-20 max-w-7xl items-center justify-between px-4">
                    {/* Mobile/Tablet Left: Menu Toggle Icon */}
                    <button
                        onClick={() => setMobileOpen(true)}
                        className="flex size-10 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-muted lg:hidden"
                        title="Open Menu"
                    >
                        <Menu className="size-6" />
                    </button>

                    {/* Logo (Centered on mobile/tablet, Left on desktop) */}
                    <Link href="/" className="flex items-center justify-center shrink-0">
                        {mounted && logo && (
                            <img src={logo} alt={siteName || "Logo"} className="h-8 sm:h-14 w-auto dark:invert object-contain" />
                        )}
                    </Link>

                    {/* Desktop Search Bar */}
                    <div className="hidden flex-1 max-w-xl mx-6 lg:block">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search Product....."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && search.trim()) {
                                        router.push(`/products?search=${encodeURIComponent(search.trim())}`);
                                    }
                                }}
                                className="w-full rounded-lg border border-border bg-muted/50 py-2.5 pl-4 pr-12 text-sm outline-none focus:border-foreground/30 transition-colors"
                            />
                            <button
                                onClick={() => {
                                    if (search.trim()) {
                                        router.push(`/products?search=${encodeURIComponent(search.trim())}`);
                                    }
                                }}
                                className="absolute right-0 top-0 flex h-full items-center justify-center px-3 text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <Search className="size-4" />
                            </button>
                        </div>
                    </div>

                    {/* Mobile/Tablet Right: Search & Cart Icons */}
                    <div className="flex items-center gap-1 lg:hidden">
                        <button
                            onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
                            className="flex size-9 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-muted"
                            title="Search"
                        >
                            <Search className="size-5" />
                        </button>
                        <Link
                            href="/cart"
                            className="relative flex size-9 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-muted"
                            title="Cart"
                        >
                            <ShoppingCart className="size-5" />
                            {mounted && cartCount > 0 && (
                                <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground leading-none">
                                    {cartCount}
                                </span>
                            )}
                        </Link>
                    </div>

                    {/* Desktop Actions */}
                    <div className="hidden items-center gap-2 sm:gap-3 lg:flex">
                        <Link
                            href="/orders"
                            className="hidden items-center gap-1.5 rounded-lg bg-primary px-3 py-2 sm:px-4 sm:py-2.5 text-xs font-bold text-primary-foreground transition-colors hover:bg-primary/90 lg:flex shrink-0"
                        >
                            <Package className="size-4 shrink-0" />
                            <span>Track Your Order</span>
                        </Link>

                        <a
                            href={contactPhone ? `tel:${contactPhone}` : "#"}
                            className="hidden items-center gap-1.5 rounded-lg bg-primary px-3 py-2 sm:px-4 sm:py-2.5 text-xs font-bold text-primary-foreground transition-colors hover:bg-primary/90 lg:flex shrink-0"
                        >
                            <Phone className="size-4 shrink-0" />
                            <span>{contactPhone || "+880 1XXXXXXXXX"}</span>
                        </a>

                        <div className="hidden h-6 w-px bg-border lg:block" />

                        <button
                            onClick={toggleTheme}
                            className="hidden sm:flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                            title={mounted && theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
                        >
                            {mounted && theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
                        </button>

                        <Link
                            href="/cart"
                            className="relative hidden sm:flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        >
                            <ShoppingCart className="size-5" />
                            {mounted && cartCount > 0 && (
                                <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                                    {cartCount}
                                </span>
                            )}
                        </Link>

                        {user ? (
                            <div className="relative hidden sm:block group/profile">
                                <button
                                    className="flex size-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90 shadow-sm"
                                >
                                    {user?.name?.charAt(0)?.toUpperCase() || "U"}
                                </button>
                                <div className="invisible opacity-0 group-hover/profile:visible group-hover/profile:opacity-100 transition-all duration-200 absolute right-0 top-full z-50 mt-2 w-56 rounded-xl border border-border bg-background py-2 shadow-xl">
                                    <div className="px-4 py-2 border-b border-border">
                                        <p className="text-sm font-semibold text-foreground truncate">{user?.name}</p>
                                        <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                                    </div>
                                    <Link
                                        href="/dashboard"
                                        className="flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                                    >
                                        Dashboard
                                    </Link>
                                    <Link
                                        href="/dashboard/profile"
                                        className="flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                                    >
                                        Profile
                                    </Link>
                                    <button
                                        onClick={async () => {
                                            await logout();
                                            router.push("/");
                                        }}
                                        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                                    >
                                        Logout
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <Link
                                href="/login"
                                className="hidden sm:inline-block rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                            >
                                Admin
                            </Link>
                        )}
                    </div>
                </div>

                {/* Mobile Expandable Search Bar */}
                {mobileSearchOpen && (
                    <div className="border-t border-border bg-background p-3 lg:hidden">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search Product....."
                                value={search}
                                autoFocus
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && search.trim()) {
                                        router.push(`/products?search=${encodeURIComponent(search.trim())}`);
                                        setMobileSearchOpen(false);
                                    }
                                }}
                                className="w-full rounded-lg border border-border bg-muted/50 py-2.5 pl-4 pr-10 text-sm outline-none focus:border-foreground/30"
                            />
                            <button
                                onClick={() => {
                                    if (search.trim()) {
                                        router.push(`/products?search=${encodeURIComponent(search.trim())}`);
                                        setMobileSearchOpen(false);
                                    }
                                }}
                                className="absolute right-0 top-0 flex h-full items-center justify-center px-3 text-muted-foreground"
                            >
                                <Search className="size-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Second Navbar: Category Navigation (Desktop only) */}
            <nav className="relative hidden lg:block border-b border-border bg-[#f8f9fa] dark:bg-[#1a131b]">
                <div className="mx-auto max-w-7xl px-2 sm:px-4">
                    <div className="flex items-center overflow-x-auto no-scrollbar gap-1 sm:gap-2 pt-1.5 pb-0.5">
                        {/* Menu Bar Button */}
                        <button
                            type="button"
                            onClick={() => setMenuOpen(!menuOpen)}
                            className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-[14px] font-semibold rounded-md transition-all ${
                                menuOpen
                                    ? "bg-primary text-primary-foreground shadow-xs"
                                    : "text-foreground/80 hover:text-primary hover:bg-muted/50"
                            }`}
                            title="Toggle Menu"
                        >
                            <Menu className="size-4" />
                            <span>Menu</span>
                            <ChevronDown className={`size-3 transition-transform duration-200 ${menuOpen ? "rotate-180" : ""}`} />
                        </button>

                        {/* All Products */}
                        <Link
                            href="/products"
                            className={`shrink-0 inline-flex items-center px-3 py-2.5 text-xs sm:text-[14px] font-semibold transition-colors border-b-2 whitespace-nowrap ${
                                pathname === "/products" && !currentCategory
                                    ? "border-primary text-primary font-bold"
                                    : "border-transparent text-foreground/80 hover:text-primary hover:bg-muted/50 rounded-t-md"
                            }`}
                        >
                            All Products
                        </Link>

                        {/* All Dynamic Categories */}
                        {mounted && categoryList.map((cat) => {
                            const hasChildren = Array.isArray(cat.children) && cat.children.length > 0;
                            const isActive = currentCategory === cat.slug;

                            return (
                                <div key={cat._id || cat.slug} className="relative shrink-0 group/cat">
                                    <Link
                                        href={`/products?category=${encodeURIComponent(cat.slug)}`}
                                        className={`inline-flex items-center gap-1 px-3 py-2.5 text-xs sm:text-[14px] font-semibold transition-colors border-b-2 whitespace-nowrap ${
                                            isActive
                                                ? "border-primary text-primary font-bold"
                                                : "border-transparent text-foreground/80 hover:text-primary hover:bg-muted/50 rounded-t-md"
                                        }`}
                                    >
                                        <span>{cat.name}</span>
                                        {hasChildren && (
                                            <ChevronDown className="size-3 text-muted-foreground transition-transform duration-200 group-hover/cat:rotate-180 group-hover/cat:text-primary" />
                                        )}
                                    </Link>

                                    {/* Dropdown for Subcategories */}
                                    {hasChildren && (
                                        <div className="invisible opacity-0 group-hover/cat:visible group-hover/cat:opacity-100 transition-all duration-200 absolute left-0 top-full z-50 pt-1 min-w-[200px]">
                                            <div className="rounded-xl border border-border bg-background py-2 shadow-xl backdrop-blur-sm">
                                                <div className="px-3 py-1.5 border-b border-border/60 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                                                    {cat.name} Collection
                                                </div>
                                                <div className="py-1">
                                                    {cat.children.map((sub, idx) => (
                                                        <Link
                                                            key={idx}
                                                            href={`/products?category=${encodeURIComponent(sub.slug || cat.slug)}`}
                                                            className="block px-4 py-2 text-xs sm:text-sm text-foreground/90 hover:bg-primary/10 hover:text-primary transition-colors font-medium"
                                                        >
                                                            {sub.name}
                                                        </Link>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                        {/* Hot sell [HOT] */}
                        <div className="relative shrink-0 ml-auto pl-2">
                            <Link
                                href="/best-selling"
                                className={`relative inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-[14px] font-bold transition-colors border-b-2 whitespace-nowrap ${
                                    pathname === "/best-selling"
                                        ? "border-primary text-primary font-bold"
                                        : "border-transparent text-[#e11d48] hover:text-[#e11d48]/80 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-t-md"
                                }`}
                            >
                                <span className="absolute -top-1 right-2 inline-flex items-center justify-center rounded-xs bg-[#e11d48] px-1.5 py-0.2 text-[8px] font-extrabold text-white uppercase tracking-wider shadow-xs leading-tight">
                                    HOT
                                    <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 border-solid border-t-[#e11d48] border-t-2 border-x-transparent border-x-2 border-b-0" />
                                </span>
                                <span>Hot sell</span>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Mega Menu Grid Dropdown (Design 3 Premium) */}
                {menuOpen && (
                    <>
                        {/* Backdrop overlay */}
                        <div
                            className="fixed inset-0 z-40 bg-black/45 backdrop-blur-xs transition-opacity"
                            onClick={() => setMenuOpen(false)}
                        />

                        {/* Mega Menu Body */}
                        <div className="absolute left-0 right-0 top-full z-50 border-b border-border bg-background/98 backdrop-blur-xl shadow-2xl transition-all duration-200">
                            {/* Top subtle highlight gradient line */}
                            <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-primary to-transparent opacity-80" />

                            <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
                                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                                    {/* Column 1: Quick Links (3 cols) */}
                                    <div className="space-y-3 md:col-span-3 md:border-r md:border-border/60 md:pr-4">
                                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary pb-1">
                                            <LayoutGrid className="size-4" />
                                            <span>Quick Links</span>
                                        </div>
                                        <div className="space-y-1.5 mt-2">
                                            <Link
                                                href="/"
                                                onClick={() => setMenuOpen(false)}
                                                className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold transition-all ${
                                                    pathname === "/" ? "bg-primary text-primary-foreground shadow-xs" : "text-foreground hover:bg-muted/70"
                                                }`}
                                            >
                                                <div className={`flex size-7 items-center justify-center rounded-lg ${pathname === "/" ? "bg-white/20" : "bg-primary/10 text-primary"}`}>
                                                    <House className="size-3.5" />
                                                </div>
                                                <span>Home</span>
                                            </Link>

                                            <Link
                                                href="/products"
                                                onClick={() => setMenuOpen(false)}
                                                className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold transition-all ${
                                                    pathname === "/products" && !currentCategory ? "bg-primary text-primary-foreground shadow-xs" : "text-foreground hover:bg-muted/70"
                                                }`}
                                            >
                                                <div className={`flex size-7 items-center justify-center rounded-lg ${pathname === "/products" && !currentCategory ? "bg-white/20" : "bg-sky-500/10 text-sky-600"}`}>
                                                    <Store className="size-3.5" />
                                                </div>
                                                <span>All Products</span>
                                            </Link>

                                            <Link
                                                href="/best-selling"
                                                onClick={() => setMenuOpen(false)}
                                                className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold transition-all ${
                                                    pathname === "/best-selling" ? "bg-primary text-primary-foreground shadow-xs" : "text-foreground hover:bg-muted/70"
                                                }`}
                                            >
                                                <div className={`flex size-7 items-center justify-center rounded-lg ${pathname === "/best-selling" ? "bg-white/20" : "bg-[#e11d48]/10 text-[#e11d48]"}`}>
                                                    <TrendingUp className="size-3.5" />
                                                </div>
                                                <span className="flex-1">Best Selling</span>
                                                <span className="rounded-full bg-[#e11d48]/10 px-2 py-0.5 text-[10px] font-bold text-[#e11d48]">HOT</span>
                                            </Link>

                                            <Link
                                                href="/flash-sale"
                                                onClick={() => setMenuOpen(false)}
                                                className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold transition-all ${
                                                    pathname === "/flash-sale" ? "bg-primary text-primary-foreground shadow-xs" : "text-foreground hover:bg-muted/70"
                                                }`}
                                            >
                                                <div className={`flex size-7 items-center justify-center rounded-lg ${pathname === "/flash-sale" ? "bg-white/20" : "bg-amber-500/10 text-amber-600"}`}>
                                                    <Zap className="size-3.5 fill-current" />
                                                </div>
                                                <span className="flex-1">Flash Sale</span>
                                                <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-600">OFFER</span>
                                            </Link>

                                            <Link
                                                href="/orders"
                                                onClick={() => setMenuOpen(false)}
                                                className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-foreground hover:bg-muted/70 transition-all"
                                            >
                                                <div className="flex size-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
                                                    <Package className="size-3.5" />
                                                </div>
                                                <span>Track Order</span>
                                            </Link>
                                        </div>
                                    </div>

                                    {/* Column 2: Saree Categories from DB (6 cols) */}
                                    <div className="space-y-3 md:col-span-6 px-1">
                                        <div className="flex items-center justify-between border-b border-border/60 pb-2">
                                            <div className="flex items-center gap-2">
                                                <Sparkles className="size-4 text-primary" />
                                                <span className="text-xs font-bold uppercase tracking-wider text-primary">
                                                    Categories ({categoryList.length})
                                                </span>
                                            </div>
                                            <Link
                                                href="/products"
                                                onClick={() => setMenuOpen(false)}
                                                className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors"
                                            >
                                                <span>View All</span>
                                                <ArrowRight className="size-3" />
                                            </Link>
                                        </div>

                                        {/* Categories Grid as Modern Dynamic Cards */}
                                        {categoryList.length === 0 ? (
                                            <div className="flex h-36 flex-col items-center justify-center rounded-xl border border-dashed border-border text-center p-4">
                                                <Layers className="size-6 text-muted-foreground/40 mb-1" />
                                                <p className="text-xs text-muted-foreground">No categories added yet</p>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[300px] overflow-y-auto no-scrollbar pr-1">
                                                {categoryList.map((cat) => (
                                                    <div
                                                        key={cat._id || cat.slug}
                                                        className="group rounded-xl border border-border/70 bg-card/60 p-2.5 shadow-2xs hover:border-primary/50 hover:bg-primary/5 hover:shadow-xs transition-all"
                                                    >
                                                        <div className={`flex gap-3 ${cat.children && cat.children.length > 0 ? "items-start" : "items-center"}`}>
                                                            <Link
                                                                href={`/products?category=${encodeURIComponent(cat.slug)}`}
                                                                onClick={() => setMenuOpen(false)}
                                                                className="shrink-0"
                                                            >
                                                                {cat.image ? (
                                                                    <img
                                                                        src={cat.image}
                                                                        alt={cat.name}
                                                                        className="size-11 rounded-lg object-cover border border-border/50 shrink-0"
                                                                    />
                                                                ) : (
                                                                    <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary/15 via-rose-500/10 to-primary/5 text-primary group-hover:scale-105 transition-transform">
                                                                        <Layers className="size-5" />
                                                                    </div>
                                                                )}
                                                            </Link>
                                                            <div className="min-w-0 flex-1">
                                                                <Link
                                                                    href={`/products?category=${encodeURIComponent(cat.slug)}`}
                                                                    onClick={() => setMenuOpen(false)}
                                                                    className="font-bold text-sm text-foreground hover:text-primary transition-colors block truncate"
                                                                >
                                                                    {cat.name}
                                                                </Link>

                                                                {/* Subcategories if present */}
                                                                {cat.children && cat.children.length > 0 && (
                                                                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                                                                        {cat.children.map((sub, idx) => (
                                                                            <Link
                                                                                key={idx}
                                                                                href={`/products?category=${encodeURIComponent(sub.slug || cat.slug)}`}
                                                                                onClick={() => setMenuOpen(false)}
                                                                                className="rounded-md bg-muted/80 px-2 py-0.5 text-[11px] font-medium text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                                                                            >
                                                                                {sub.name}
                                                                            </Link>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Column 3: Promo & Helpline Support (3 cols) */}
                                    <div className="space-y-3 md:col-span-3 md:border-l md:border-border/60 md:pl-4 flex flex-col justify-between">
                                        {/* Promo Banner Card */}
                                        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#d8359b] via-[#be123c] to-[#9f1239] p-4 text-white shadow-md">
                                            <div className="absolute -right-3 -bottom-3 opacity-20 pointer-events-none">
                                                <Package className="size-24" />
                                            </div>
                                            <div className="inline-flex items-center gap-1 rounded-full bg-white/20 backdrop-blur-xs px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                                                <span>⚡ Delivery Perks</span>
                                            </div>
                                            <h4 className="mt-2 text-sm font-extrabold leading-snug">
                                                Inside Dhaka ৳60 <br /> Outside Dhaka ৳120
                                            </h4>
                                            <p className="mt-1 text-[11px] text-white/90">
                                                Cash on Delivery Available Nationwide
                                            </p>
                                            <Link
                                                href="/products"
                                                onClick={() => setMenuOpen(false)}
                                                className="mt-3.5 inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-[#be123c] shadow-xs hover:bg-white/95 hover:gap-2 transition-all"
                                            >
                                                <span>Shop Sarees</span>
                                                <ArrowRight className="size-3.5" />
                                            </Link>
                                        </div>

                                        {/* Phone Call Helpline & WhatsApp */}
                                        <div className="flex items-center justify-between gap-2 rounded-xl border border-border/70 bg-muted/40 p-2.5">
                                            <a
                                                href={contactPhone ? `tel:${contactPhone}` : "#"}
                                                className="flex items-center gap-2.5 min-w-0 flex-1 hover:opacity-80 transition-opacity"
                                            >
                                                <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                                                    <Phone className="size-4" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-[10px] text-muted-foreground font-medium">Need Help?</p>
                                                    <p className="text-xs font-bold text-foreground truncate">
                                                        {contactPhone || "+880 1XXXXXXXXX"}
                                                    </p>
                                                </div>
                                            </a>
                                            <a
                                                href={`https://wa.me/${(contactPhone || "").replace(/[^0-9]/g, "")}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                aria-label="WhatsApp Us"
                                                className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-colors"
                                                title="WhatsApp Support"
                                            >
                                                <FaWhatsapp className="size-4" />
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </nav>

            {/* Mobile Sidebar */}
            {mobileOpen && (
                <div className="fixed inset-0 z-100 lg:hidden">
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={() => setMobileOpen(false)}
                    />
                    <div className="absolute inset-y-0 left-0 w-80 max-w-[85vw] bg-background shadow-2xl overflow-y-auto">
                        <div className="flex items-center justify-between border-b border-border px-5 py-4">
                            <Link href="/" onClick={() => setMobileOpen(false)}>
                                {mounted && logo && <img src={logo} alt={siteName} className="h-14 w-auto dark:invert" />}
                            </Link>
                            <button
                                onClick={() => setMobileOpen(false)}
                                className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted"
                            >
                                <X className="size-5" />
                            </button>
                        </div>

                        <div className="px-5 py-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                <input
                                    type="text"
                                    placeholder="Search Product....."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" && search.trim()) {
                                            router.push(`/products?search=${encodeURIComponent(search.trim())}`);
                                            setMobileOpen(false);
                                        }
                                    }}
                                    className="w-full rounded-lg border border-border bg-muted/50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-foreground/30"
                                />
                            </div>
                        </div>

                        <div className="px-5 pb-4">
                            <Link
                                href="/orders"
                                onClick={() => setMobileOpen(false)}
                                className="flex items-center gap-3 rounded-xl border border-border bg-muted/50 px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                            >
                                <Package className="size-5 text-muted-foreground" />
                                <div>
                                    <div className="font-semibold">Track Order</div>
                                    <div className="text-xs text-muted-foreground">Know Your Order Status</div>
                                </div>
                            </Link>
                        </div>

                        <nav className="border-t border-border px-5 py-4">
                            <div className="space-y-1">
                                <Link
                                    href="/"
                                    onClick={() => setMobileOpen(false)}
                                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                                >
                                    Home
                                </Link>

                                <div>
                                    <button
                                        onClick={() => setMobileCatOpen(!mobileCatOpen)}
                                        className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                                    >
                                        <span>Categories</span>
                                        <ChevronDown className={`size-4 text-muted-foreground transition-transform ${mobileCatOpen ? "rotate-180" : ""}`} />
                                    </button>
                                    {mobileCatOpen && (
                                        <div className="ml-6 mt-1 space-y-1 border-l-2 border-border pl-4">
                                            {mounted && categoryList.map((cat) => (
                                                <div key={cat._id || cat.slug}>
                                                    <Link
                                                        href={`/products?category=${encodeURIComponent(cat.slug)}`}
                                                        onClick={() => setMobileOpen(false)}
                                                        className="block rounded-lg px-3 py-2 text-sm text-foreground/80 transition-colors hover:bg-muted hover:text-primary font-medium"
                                                    >
                                                        {cat.name}
                                                    </Link>
                                                    {cat.children?.map((sub, idx) => (
                                                        <Link
                                                            key={idx}
                                                            href={`/products?category=${encodeURIComponent(sub.slug || cat.slug)}`}
                                                            onClick={() => setMobileOpen(false)}
                                                            className="block rounded-lg pl-6 pr-3 py-1 text-xs text-muted-foreground hover:bg-muted hover:text-primary"
                                                        >
                                                            • {sub.name}
                                                        </Link>
                                                    ))}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <Link
                                    href="/products"
                                    onClick={() => setMobileOpen(false)}
                                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                                >
                                    Shop Product
                                </Link>

                                <Link
                                    href="/best-selling"
                                    onClick={() => setMobileOpen(false)}
                                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                                >
                                    Best Selling
                                </Link>

                                <Link
                                    href="/flash-sale"
                                    onClick={() => setMobileOpen(false)}
                                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                                >
                                    Flash Sale
                                </Link>
                            </div>
                        </nav>

                        <div className="border-t border-border px-5 py-4 space-y-2">
                            <Link
                                href="/cart"
                                onClick={() => setMobileOpen(false)}
                                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                            >
                                <ShoppingCart className="size-4" />
                                Cart {cartCount > 0 && `(${cartCount})`}
                            </Link>
                            {user ? (
                                <>
                                    <div className="rounded-lg bg-muted/50 px-4 py-3">
                                        <p className="text-sm font-semibold text-foreground truncate">{user?.name}</p>
                                        <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                                    </div>
                                    <Link
                                        href="/dashboard"
                                        onClick={() => setMobileOpen(false)}
                                        className="block w-full rounded-lg border border-border px-4 py-2.5 text-center text-sm font-medium text-foreground transition-colors hover:bg-muted"
                                    >
                                        Dashboard
                                    </Link>
                                    <Link
                                        href="/dashboard/profile"
                                        onClick={() => setMobileOpen(false)}
                                        className="block w-full rounded-lg border border-border px-4 py-2.5 text-center text-sm font-medium text-foreground transition-colors hover:bg-muted"
                                    >
                                        Profile
                                    </Link>
                                    <button
                                        onClick={async () => {
                                            await logout();
                                            setMobileOpen(false);
                                            router.push("/");
                                        }}
                                        className="block w-full rounded-lg border border-red-200 px-4 py-2.5 text-center text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/10"
                                    >
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <Link
                                    href="/login"
                                    onClick={() => setMobileOpen(false)}
                                    className="block w-full rounded-lg border border-border px-4 py-2.5 text-center text-sm font-medium text-foreground transition-colors hover:bg-muted"
                                >
                                    Admin Login
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Fixed Bottom Navigation Bar for Mobile & Tablet */}
            <div className="fixed bottom-0 left-0 right-0 z-[100] border-t border-border bg-background/95 backdrop-blur-md lg:hidden shadow-2xl">
                <div className="grid grid-cols-5 items-center px-1 py-2">
                    <Link
                        href="/"
                        className={`flex flex-col items-center gap-1 text-[11px] font-medium transition-colors ${
                            pathname === "/" ? "text-primary font-bold" : "text-muted-foreground hover:text-foreground"
                        }`}
                    >
                        <House className="size-5" />
                        <span>Home</span>
                    </Link>

                    <button
                        onClick={() => setMobileOpen(true)}
                        className={`flex flex-col items-center gap-1 text-[11px] font-medium transition-colors ${
                            mobileOpen ? "text-primary font-bold" : "text-muted-foreground hover:text-foreground"
                        }`}
                    >
                        <LayoutGrid className="size-5" />
                        <span>Menu</span>
                    </button>

                    <Link
                        href="/cart"
                        className={`relative flex flex-col items-center gap-1 text-[11px] font-medium transition-colors ${
                            pathname === "/cart" ? "text-primary font-bold" : "text-muted-foreground hover:text-foreground"
                        }`}
                    >
                        <div className="relative">
                            <ShoppingCart className="size-5" />
                            {mounted && cartCount > 0 && (
                                <span className="absolute -right-2 -top-1.5 flex size-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
                                    {cartCount}
                                </span>
                            )}
                        </div>
                        <span>Cart</span>
                    </Link>

                    <Link
                        href="/orders"
                        className={`flex flex-col items-center gap-1 text-[11px] font-medium transition-colors ${
                            pathname === "/orders" ? "text-primary font-bold" : "text-muted-foreground hover:text-foreground"
                        }`}
                    >
                        <Package className="size-5" />
                        <span>Orders</span>
                    </Link>

                    <Link
                        href={user ? "/dashboard" : "/login"}
                        className={`flex flex-col items-center gap-1 text-[11px] font-medium transition-colors ${
                            pathname.startsWith("/dashboard") || pathname === "/login"
                                ? "text-primary font-bold"
                                : "text-muted-foreground hover:text-foreground"
                        }`}
                    >
                        <User className="size-5" />
                        <span>{user ? "Account" : "Account"}</span>
                    </Link>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
