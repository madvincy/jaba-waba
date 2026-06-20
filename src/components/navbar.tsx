"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Search,
  ShoppingCart,
  Menu,
  X,
  ChevronDown,
  User,
  LogOut,
  Moon,
  Sun,
  LayoutDashboard,
  Truck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "@/lib/api/auth";
import { getInitials } from "@/lib/auth-utils";
import { useAppDispatch, useAppSelector } from "@/lib/redux-hooks";
import { logout } from "@/lib/store";
import { useTheme } from "@/lib/theme-provider";

export function Navbar() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const cart = useAppSelector((state) => state.shop.cart);
  const user = useAppSelector((state) => state.shop.user);
  const authReady = useAppSelector((state) => state.shop.authReady);
  const orders = useAppSelector((state) => state.shop.orders);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const userOrders = orders.slice(0, 3);
  const isCustomer = user?.role === "customer";
  const isStaffOrAdmin = user?.role === "staff" || user?.role === "admin";
  const isRider = user?.role === "rider";

  const handleLogout = async () => {
    await signOut();
    dispatch(logout());
    setIsProfileOpen(false);
    setIsOpen(false);
    router.push("/");
  };

  const closeMenus = () => {
    setIsProfileOpen(false);
    setIsOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/95 backdrop-blur-lg shadow-sm dark:border-slate-800 dark:bg-slate-950/95">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <Link href="/" className="flex items-center gap-2 flex-shrink-0">
              <Image src="/assets/jaba_waba.png" alt="Jaba Waba" width={60} height={60} className="rounded-lg object-cover" />
              <span className="text-xl font-bold bg-gradient-to-r from-green-600 to-pink-600 bg-clip-text text-transparent hidden sm:block">
                Jaba Waba
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-4 flex-1 min-w-0">
              <Link href="/products" className="text-sm font-medium text-slate-700 hover:text-green-600 dark:text-slate-200 dark:hover:text-green-400">
                Products
              </Link>
              <Link href="/events" className="text-sm font-medium text-slate-700 hover:text-green-600 dark:text-slate-200 dark:hover:text-green-400">
                Events
              </Link>
              <Link href="/about" className="text-sm font-medium text-slate-700 hover:text-green-600 dark:text-slate-200 dark:hover:text-green-400">
                About
              </Link>
              <Link href="/contact" className="text-sm font-medium text-slate-700 hover:text-green-600 dark:text-slate-200 dark:hover:text-green-400">
                Contact
              </Link>
            </div>
          </div>

          <div className="hidden md:flex flex-1 max-w-md">
            <div className="relative w-full">
              <Input
                type="text"
                placeholder="Search products..."
                className="rounded-full pl-10 pr-4 bg-slate-100 border-0 focus-visible:ring-2 focus-visible:ring-green-500 dark:bg-slate-900"
              />
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            {cartCount > 0 && (
              <Link href="/checkout">
                <Button variant="ghost" size="icon" className="relative">
                  <ShoppingCart className="h-5 w-5 text-green-600" />
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-pink-500 text-xs font-bold text-white flex items-center justify-center">
                    {cartCount}
                  </span>
                </Button>
              </Link>
            )}

            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>

            <div className="hidden sm:flex items-center gap-2">
              {!authReady ? (
                // Skeleton while auth resolves (~100ms)
                <div className="w-24 h-8 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse" />
              ) : user ? (
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center gap-2 pl-1"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                      {getInitials(user.name, user.email)}
                    </div>
                    <div className="text-left hidden md:block">
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-200 leading-tight">
                        {user.name}
                      </p>
                      <p className="text-xs text-slate-500 truncate max-w-[140px]">
                        {user.email}
                      </p>
                    </div>
                    <ChevronDown className="w-4 h-4 text-slate-600 shrink-0" />
                  </Button>

                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-50">
                      <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                        <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{user.name}</p>
                        <p className="text-xs text-slate-500 truncate">{user.email}</p>
                        <span className="inline-block mt-1 px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-700 capitalize">
                          {user.role}
                        </span>
                      </div>

                      {isCustomer && (
                        <div className="border-b border-slate-100 dark:border-slate-800 max-h-40 overflow-y-auto">
                          <div className="px-4 py-2 text-xs font-semibold text-slate-600 uppercase">
                            My Orders
                          </div>
                          {userOrders.length > 0 ? (
                            userOrders.map((order) => (
                              <Link
                                key={order.id}
                                href="/orders"
                                onClick={closeMenus}
                                className="block px-4 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-800"
                              >
                                <p className="font-medium text-slate-700 dark:text-slate-200">
                                  Order #{order.id.slice(-6)}
                                </p>
                                <p className="text-xs text-slate-500">{order.status}</p>
                              </Link>
                            ))
                          ) : (
                            <div className="px-4 py-2 text-sm text-slate-500">No orders yet</div>
                          )}
                          <Link
                            href="/orders"
                            onClick={closeMenus}
                            className="block px-4 py-2 text-sm text-green-600 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium"
                          >
                            View All Orders
                          </Link>
                        </div>
                      )}

                      {isStaffOrAdmin && (
                        <Link
                          href="/staff"
                          onClick={closeMenus}
                          className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-800 border-b border-slate-100 dark:border-slate-800"
                        >
                          <LayoutDashboard className="w-4 h-4 text-slate-600" />
                          <span>Staff Portal</span>
                        </Link>
                      )}

                      {isRider && (
                        <Link
                          href="/rider"
                          onClick={closeMenus}
                          className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-800 border-b border-slate-100 dark:border-slate-800"
                        >
                          <Truck className="w-4 h-4 text-slate-600" />
                          <span>Rider Portal</span>
                        </Link>
                      )}

                      {isCustomer && (
                        <Link
                          href="/profile"
                          onClick={closeMenus}
                          className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-800 border-b border-slate-100 dark:border-slate-800"
                        >
                          <User className="w-4 h-4 text-slate-600" />
                          <span>My Profile</span>
                        </Link>
                      )}

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-800 text-red-600"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/auth/signin">Login</Link>
                  </Button>
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-full"
                    asChild
                  >
                    <Link href="/auth/signup">Sign up</Link>
                  </Button>
                </>
              )}
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="sm:hidden"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {isOpen && (
          <div className="border-t border-slate-200 py-4 space-y-3 dark:border-slate-800 sm:hidden">
            {user ? (
              <>
                <div className="flex items-center gap-3 px-4 py-2 border-b border-slate-200 dark:border-slate-800">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white text-sm font-bold">
                    {getInitials(user.name, user.email)}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-slate-500">{user.email}</p>
                  </div>
                </div>
                <div className="px-2 space-y-2">
                  {isCustomer && (
                    <Button variant="ghost" size="sm" className="w-full justify-start" asChild>
                      <Link href="/orders" onClick={closeMenus}>My Orders</Link>
                    </Button>
                  )}
                  {isCustomer && (
                    <Button variant="ghost" size="sm" className="w-full justify-start" asChild>
                      <Link href="/profile" onClick={closeMenus}>My Profile</Link>
                    </Button>
                  )}
                  {isStaffOrAdmin && (
                    <Button variant="ghost" size="sm" className="w-full justify-start" asChild>
                      <Link href="/staff" onClick={closeMenus}>Staff Portal</Link>
                    </Button>
                  )}
                  {isRider && (
                    <Button variant="ghost" size="sm" className="w-full justify-start" asChild>
                      <Link href="/rider" onClick={closeMenus}>Rider Portal</Link>
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-red-600"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex gap-2 px-2">
                <Button variant="outline" size="sm" className="flex-1" asChild>
                  <Link href="/auth/signin">Login</Link>
                </Button>
                <Button size="sm" className="flex-1 bg-green-600 text-white" asChild>
                  <Link href="/auth/signup">Sign up</Link>
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
