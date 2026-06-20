"use client";

import Link from "next/link";
import { Mail, MapPin, Phone, Clock, Facebook, Instagram, Twitter, ArrowUp, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/lib/theme-provider";
import Image from "next/image";

export function Footer() {
  const { theme, toggleTheme } = useTheme();

  const handleScrollTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* About */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
            <Image src="/assets/jaba_waba.png" alt="Jaba Waba" width={60} height={60} className="rounded-lg object-cover" />
              <span className="font-bold text-lg">Jaba Waba</span>
              <Image src="/assets/jabawb_logo.png" alt="Jaba Waba" width={60} height={60} className="rounded-lg object-cover" />
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-green-600 to-pink-600 bg-clip-text text-transparent hidden sm:block">
                Happiness In a Bottle
              </span>
            <p className="text-slate-400 text-sm">
              Fresh, organic juices delivered to your door. Handcrafted with love and local ingredients.
            </p>
          </div>

          {/* Location & Hours */}
          <div className="space-y-4">
            <h3 className="font-semibold">Location & Hours</h3>
            <div className="space-y-3 text-sm text-slate-400">
              <div className="flex gap-3">
                <MapPin className="h-5 w-5 text-green-500 flex-shrink-0" />
                <div>
                  <p className="font-medium text-white">Freedom Heights, Langata</p>
                  <p>Nairobi, Kenya</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Clock className="h-5 w-5 text-green-500 flex-shrink-0" />
                <div>
                  <p className="font-medium text-white">Mon - Sun</p>
                  <p>8:00 AM - 8:00 PM</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="font-semibold">Contact Us</h3>
            <div className="space-y-3 text-sm text-slate-400">
              <div className="flex gap-3">
                <Mail className="h-5 w-5 text-green-500 flex-shrink-0" />
                <a href="mailto:hello@jabawaba.com" className="hover:text-white transition-colors">
                  hello@jabawaba.com
                </a>
              </div>
              <div className="flex gap-3">
                <Phone className="h-5 w-5 text-green-500 flex-shrink-0" />
                <a href="tel:+254700000000" className="hover:text-white transition-colors">
                  +254 (0) 700 000 000
                </a>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold">Quick Links</h3>
            <div className="flex flex-col gap-2 text-sm">
              <Link href="/products" className="text-slate-400 hover:text-white transition-colors">
                Shop
              </Link>
              <Link href="/events" className="text-slate-400 hover:text-white transition-colors">
                Events
              </Link>
              <Link href="/about" className="text-slate-400 hover:text-white transition-colors">
                About Us
              </Link>
              <Link href="/contact" className="text-slate-400 hover:text-white transition-colors">
                Contact
              </Link>
              <Link href="/staff" className="text-slate-400 hover:text-white transition-colors">
                Staff Portal
              </Link>
              <Link href="/rider" className="text-slate-400 hover:text-white transition-colors">
                Rider Portal
              </Link>
              <Link href="/faq" className="text-slate-400 hover:text-white transition-colors">
                FAQs
              </Link>
            </div>
          </div>
        </div>
        {/* Social & Copyright */}
        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col gap-4 md:flex-row md:justify-between md:items-center">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
            <p className="text-slate-400 text-sm">
              © 2026 Jaba Waba. All rights reserved.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="rounded-full border-slate-700 text-slate-300 hover:border-white hover:text-white"
              onClick={toggleTheme}
            >
              {theme === "dark" ? (
                <><Sun className="h-4 w-4 mr-2" /> Light Mode</>
              ) : (
                <><Moon className="h-4 w-4 mr-2" /> Dark Mode</>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="rounded-full border-slate-700 text-slate-300 hover:border-white hover:text-white"
              onClick={handleScrollTop}
            >
              <ArrowUp className="h-4 w-4 mr-2" /> Back to Top
            </Button>
          </div>
          <div className="flex gap-4">
            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
              <Facebook className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
              <Instagram className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
              <Twitter className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </footer>
  );
}
