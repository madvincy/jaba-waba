"use client";

import { useAppSelector } from "@/lib/redux-hooks";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Package, Clock, CheckCircle, AlertCircle } from "lucide-react";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export default function OrdersPage() {
  const user = useAppSelector((state) => state.shop.user);
  const orders = useAppSelector((state) => state.shop.orders);

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Not Logged In</CardTitle>
            <CardDescription>Please log in to view your orders</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/auth/signin">
              <Button className="w-full bg-green-600 hover:bg-green-700">
                Go to Login
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "pending":
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case "cancelled":
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Package className="w-5 h-5 text-blue-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-50 text-green-700 border-green-200";
      case "pending":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "cancelled":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-blue-50 text-blue-700 border-blue-200";
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col">
      <Navbar />
      <main className="flex-1 px-6 py-10 max-w-7xl mx-auto w-full">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Link href="/" className="flex items-center gap-2 text-green-600 hover:text-green-700 mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        {/* Header */}
        <div className="mb-8">
        <h2 className="text-3xl font-bold md:text-2xl bg-gradient-to-r from-green-600 to-pink-600 bg-clip-text text-transparent">
          My Orders
        </h2>
          <p className="text-slate-600 mt-2">
            Track and manage all your juice orders
          </p>
        </div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Package className="w-12 h-12 text-slate-300 mb-4" />
              <p className="text-lg font-medium text-slate-700">No orders yet</p>
              <p className="text-slate-600 mb-4">Start shopping to see your orders here</p>
              <Link href="/">
                <Button className="bg-green-600 hover:bg-green-700">
                  Start Shopping
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    {/* Order Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-100">
                          {getStatusIcon(order.status)}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">
                            Order #{order.id.slice(-6).toUpperCase()}
                          </p>
                          <p className="text-sm text-slate-600">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Items */}
                    <div className="flex-1">
                      <p className="text-sm text-slate-600 mb-1">Items</p>
                      <div className="space-y-1">
                        {order.items.slice(0, 2).map((item, idx) => (
                          <p key={idx} className="text-sm font-medium text-slate-700">
                            {item.quantity}x {item.name}
                          </p>
                        ))}
                        {order.items.length > 2 && (
                          <p className="text-xs text-slate-500">
                            +{order.items.length - 2} more items
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Total */}
                    <div className="flex-1">
                      <p className="text-sm text-slate-600 mb-1">Total</p>
                      <p className="text-xl font-bold text-green-600">
                        KSH {order.total.toLocaleString()}
                      </p>
                    </div>

                    {/* Status */}
                    <div className="flex-1">
                      <p className="text-sm text-slate-600 mb-1">Status</p>
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-sm font-medium ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        <span className="capitalize">{order.status}</span>
                      </div>
                    </div>

                    {/* Action */}
                    <Link href={`/orders/${order.id}`}>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
    <Footer />
    </div>
  );
}
