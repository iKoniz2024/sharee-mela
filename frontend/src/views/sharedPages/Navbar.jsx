"use client";

import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

import { useState, useEffect } from "react";
import { Search, ShoppingCart, Sun, Moon, ChevronDown, Menu, X, Phone, Package, House, LayoutGrid, Store, TrendingUp, Zap, User } from "lucide-react";
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
    const { siteName, logo, contactPhone } = useSettings();
    const { user, logout } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [search, setSearch] = useState("");
    const [mobileOpen, setMobileOpen] = useState(false);
    const [mobileCatOpen, setMobileCatOpen] = useState(false);
    const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    const scrollToSection = (sectionId) => {
        if (pathname === "/") {
            const el = document.getElementById(sectionId);
            if (el) el.scrollIntoView({ behavior: "smooth" });
        } else {
            router.push("/", { state: { scrollTo: sectionId } });
        }
    };

    const { data: categories } = useQuery({
        queryKey: ["categories"],
        queryFn: getCategories,
        staleTime: 10 * 60 * 1000,
    });

    useEffect(() => {
        refetchCartCount(getLocalCartCount());
        setMounted(true);
    }, [refetchCartCount]);

    return (
        <header className="sticky top-0 z-100 bg-background">
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
                    <Link href="/" className="flex items-center shrink-0">
                        {mounted && logo && <img src={logo} alt={siteName} className="h-8 sm:h-14 w-auto dark:invert" />}
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

                    {/* Mobile/Tablet Right: Search Toggle Icon */}
                    <button
                        onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
                        className="flex size-10 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-muted lg:hidden"
                        title="Search"
                    >
                        <Search className="size-5" />
                    </button>

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
                            href={`tel:${mounted ? contactPhone : "+8801XXXXXXXXX"}`}
                            className="hidden items-center gap-1.5 rounded-lg bg-primary px-3 py-2 sm:px-4 sm:py-2.5 text-xs font-bold text-primary-foreground transition-colors hover:bg-primary/90 lg:flex shrink-0"
                        >
                            <Phone className="size-4 shrink-0" />
                            <span>{mounted ? contactPhone : "+8809613111333"}</span>
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

            {/* Navigation Bar */}
            <nav className="hidden border-b border-border lg:block">
                <div className="mx-auto max-w-7xl px-4">
                    <div className="flex items-center gap-1">
                        <Link href="/" className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold transition-colors border-b-[3px] ${pathname === "/" ? "border-foreground text-foreground" : "border-transparent text-foreground hover:bg-muted"}`}>
                            <House className="size-4" />
                            <span className="text-base">Home</span>
                        </Link>

                        <div className="relative group/dropdown">
                            <button className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold transition-colors border-b-[3px] border-transparent text-foreground hover:bg-muted">
                                <LayoutGrid className="size-4" />
                                <span className="text-base">Categories</span>
                                <ChevronDown className="size-3.5 text-muted-foreground" />
                            </button>
                            <div className="invisible opacity-0 group-hover/dropdown:visible group-hover/dropdown:opacity-100 transition-all duration-200 fixed left-1/2 -translate-x-1/2 z-200 w-7xl border-b border-border bg-background shadow-xl">
                                <div className="mx-auto max-w-7xl p-6">
                                    <div className="grid grid-cols-6 gap-6">
                                        {mounted && categories?.slice(0, 18).map((cat) => (
                                            <div key={cat._id}>
                                                <Link
                                                    href={`/products?category=${cat.slug}`}
                                                    className="block text-sm font-bold text-foreground hover:underline mb-2"
                                                >
                                                    {cat.name}
                                                </Link>
                                                {cat.children?.length > 0 && (
                                                    <div className="space-y-1.5">
                                                        {cat.children.map((sub, idx) => (
                                                            <Link
                                                                key={idx}
                                                                href={`/products?category=${sub.slug || cat.slug}`}
                                                                className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
                                                            >
                                                                {sub.name}
                                                            </Link>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Link href="/products" className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold transition-colors border-b-[3px] ${pathname === "/products" && !searchParams.toString() ? "border-foreground text-foreground" : "border-transparent text-foreground hover:bg-muted"}`}>
                            <Store className="size-4" />
                            <span className="text-base">Shop Product</span>
                        </Link>

                        <Link
                            href="/best-selling"
                            className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold transition-colors border-b-[3px] ${pathname === "/best-selling" ? "border-foreground text-foreground" : "border-transparent text-foreground hover:bg-muted"}`}
                        >
                            <TrendingUp className="size-4" />
                            <span className="text-base">Best Selling</span>
                        </Link>

                        <Link
                            href="/flash-sale"
                            className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold transition-colors border-b-[3px] ${pathname === "/flash-sale" ? "border-foreground text-foreground" : "border-transparent text-foreground hover:bg-muted"}`}
                        >
                            <Zap className="size-4" />
                            <span className="text-base">Flash Sale</span>
                        </Link>
                    </div>
                </div>
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
                                            {mounted && categories?.map((cat) => (
                                                <Link
                                                    key={cat._id}
                                                    href={`/products?category=${cat.slug}`}
                                                    onClick={() => setMobileOpen(false)}
                                                    className="block rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                                                >
                                                    {cat.name}
                                                </Link>
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
            <div className="fixed bottom-0 left-0 right-0 z-100 border-t border-border bg-background/95 backdrop-blur-md lg:hidden shadow-2xl">
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
