"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Database, Loader2, CheckCircle } from "lucide-react";
import { seedDatabase } from "@/lib/api/seed";

export default function SetupPage() {
  const [isSeeding, setIsSeeding] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [error, setError] = useState("");

  const handleSeed = async () => {
    setIsSeeding(true);
    setError("");
    setResult(null);
    try {
      const res = await seedDatabase();
      setResult(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Seed failed");
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="flex items-center gap-2 text-green-600 hover:text-green-700 mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Supabase Data Setup
            </CardTitle>
            <CardDescription>
              Seed your Supabase database with Jaba Waba sample products, stores, riders, and more.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <ol className="list-decimal list-inside space-y-2 text-sm text-slate-600">
              <li>Create a Supabase project at supabase.com</li>
              <li>
                Run{" "}
                <code className="bg-slate-100 px-1 rounded text-xs">
                  supabase/migrations/001_initial_schema.sql
                </code>{" "}
                in the SQL Editor
              </li>
              <li>
                Add{" "}
                <code className="bg-slate-100 px-1 rounded text-xs">NEXT_PUBLIC_SUPABASE_URL</code>,{" "}
                <code className="bg-slate-100 px-1 rounded text-xs">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>, and{" "}
                <code className="bg-slate-100 px-1 rounded text-xs">SUPABASE_SERVICE_ROLE_KEY</code>{" "}
                to <code className="bg-slate-100 px-1 rounded text-xs">.env.local</code>
              </li>
              <li>Enable Google provider in Supabase Auth settings</li>
              <li>Click the button below to seed sample data</li>
            </ol>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {result?.success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                {result.message}
              </div>
            )}

            <Button
              onClick={handleSeed}
              disabled={isSeeding}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {isSeeding ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Seeding Database...
                </>
              ) : (
                <>
                  <Database className="w-4 h-4 mr-2" />
                  Seed Sample Data
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
