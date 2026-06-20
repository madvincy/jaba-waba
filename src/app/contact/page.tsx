"use client";

import { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin, Clock, Send } from "lucide-react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (
      !formData.name ||
      !formData.email ||
      !formData.subject ||
      !formData.message
    ) {
      return;
    }
    setSubmitted(true);
    setFormData({
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
    });
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col">
      <Navbar />

      <main className="flex-1 mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 w-full">
        <div className="space-y-16">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold md:text-5xl bg-gradient-to-r from-green-600 to-pink-600 bg-clip-text text-transparent">
              Get In Touch
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Have a question or feedback? We'd love to hear from you. Reach out
              and we'll get back to you as soon as possible.
            </p>
          </div>

          <div className="grid gap-12 md:grid-cols-2">
            {/* Contact Information */}
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">
                  Contact Information
                </h2>
                <div className="space-y-4">
                  <Card className="border-green-200 dark:border-green-900">
                    <CardContent className="p-6 flex gap-4">
                      <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-950 flex items-center justify-center flex-shrink-0">
                        <MapPin className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">Location</h3>
                        <p className="text-slate-600 dark:text-slate-400">
                          Freedom Heights, Langata
                          <br />
                          Nairobi, Kenya
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-pink-200 dark:border-pink-900">
                    <CardContent className="p-6 flex gap-4">
                      <div className="w-12 h-12 rounded-lg bg-pink-100 dark:bg-pink-950 flex items-center justify-center flex-shrink-0">
                        <Phone className="h-6 w-6 text-pink-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">Phone</h3>
                        <a
                          href="tel:+254700000000"
                          className="text-slate-600 dark:text-slate-400 hover:text-green-600"
                        >
                          +254 (0) 700 000 000
                        </a>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-purple-200 dark:border-purple-900">
                    <CardContent className="p-6 flex gap-4">
                      <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-950 flex items-center justify-center flex-shrink-0">
                        <Mail className="h-6 w-6 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">Email</h3>
                        <a
                          href="mailto:hello@jabawaba.com"
                          className="text-slate-600 dark:text-slate-400 hover:text-green-600"
                        >
                          hello@jabawaba.com
                        </a>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-orange-200 dark:border-orange-900">
                    <CardContent className="p-6 flex gap-4">
                      <div className="w-12 h-12 rounded-lg bg-orange-100 dark:bg-orange-950 flex items-center justify-center flex-shrink-0">
                        <Clock className="h-6 w-6 text-orange-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">Working Hours</h3>
                        <p className="text-slate-600 dark:text-slate-400">
                          Monday - Sunday
                          <br />
                          8:00 AM - 8:00 PM
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div>
              <Card className="border-2 border-green-200 dark:border-green-900 py-0">
                <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-t-xl">
                  <CardTitle className="mt-4">Send us a message</CardTitle>
                  <CardDescription className="text-green-100 mb-2">
                    We'll respond within 24 hours
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  {submitted && (
                    <div className="p-4 rounded-lg bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300 text-sm">
                      Thank you! We've received your message and will get back to
                      you soon.
                    </div>
                  )}

                  <div>
                    <Label htmlFor="name" className="mb-2">Full name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="Your name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email" className="mb-2">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      placeholder="your@email.com"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone" className="mb-2">Phone (optional)</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      placeholder="Your phone number"
                    />
                  </div>

                  <div>
                    <Label htmlFor="subject" className="mb-2">Subject</Label>
                    <Input
                      id="subject"
                      value={formData.subject}
                      onChange={(e) =>
                        setFormData({ ...formData, subject: e.target.value })
                      }
                      placeholder="What is this about?"
                    />
                  </div>

                  <div>
                    <Label htmlFor="message" className="mb-2">Message</Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) =>
                        setFormData({ ...formData, message: e.target.value })
                      }
                      placeholder="Tell us what you think..."
                      rows={6}
                    />
                  </div>

                  <Button
                    className="w-full bg-green-600 hover:bg-green-700 text-white rounded-lg"
                    onClick={handleSubmit}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Send Message
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Map Placeholder */}
          <div>
            <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">
              Find Us
            </h2>
            <div className="w-full h-96 rounded-3xl overflow-hidden border-2 border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="h-12 w-12 text-slate-400 mx-auto mb-2" />
                <p className="text-slate-500 dark:text-slate-400">
                  Embedded Google Map Coming Soon
                </p>
                <p className="text-sm text-slate-400 dark:text-slate-500 mt-2">
                  Freedom Heights, Langata, Nairobi
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
