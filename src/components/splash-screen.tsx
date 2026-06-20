// components/splash-screen.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/lib/redux-hooks";

const defaultMessages = [
    "Squeezing fresh fruits...",
    "Blending the goodness...",
    "Almost ready...",
    "Welcome!",
];

interface SplashScreenProps {
    onComplete?: () => void;
    messages?: string[];
}

export function SplashScreen({ onComplete, messages = defaultMessages }: SplashScreenProps) {
    const router = useRouter();
    const [progress, setProgress] = useState(0);
    const [msgIdx, setMsgIdx] = useState(0);
    const user = useAppSelector((state) => state.shop.user);

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress((p) => {
                const next = Math.min(p + Math.random() * 3 + 1, 100);
                const newMsgIdx = Math.min(Math.floor((next / 100) * messages.length), messages.length - 1);
                setMsgIdx(newMsgIdx);
                
                if (next >= 100) {
                    clearInterval(interval);
                    setTimeout(() => {
                        onComplete?.();
                            // User is logged in, go to home
                            router.push("/");
                    }, 400);
                }
                return next;
            });
        }, 80);
        return () => clearInterval(interval);
    }, [onComplete, user, router]);

    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center w-full h-full bg-gradient-to-br from-green-50 via-pink-50 to-orange-50 m-0 p-0 overflow-hidden">
            
            <style>{`
                @keyframes bottleFill {
                    0% { height: 4%; }
                    65% { height: 92%; }
                    80% { height: 92%; }
                    100% { height: 4%; }
                }
                @keyframes bubble {
                    0% { bottom: 4px; opacity: 1; transform: translateX(0) scale(1); }
                    100% { bottom: 95%; opacity: 0; transform: translateX(4px) scale(0.4); }
                }
                @keyframes floatBottle {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-8px); }
                }
                @keyframes blobPulse1 {
                    0%, 100% { transform: scale(1) translate(0, 0); }
                    50% { transform: scale(1.12) translate(6px, -6px); }
                }
                @keyframes blobPulse2 {
                    0%, 100% { transform: scale(1) translate(0, 0); }
                    50% { transform: scale(1.08) translate(-8px, 5px); }
                }
                @keyframes blobPulse3 {
                    0%, 100% { transform: scale(1) translate(0, 0); }
                    50% { transform: scale(1.15) translate(4px, 8px); }
                }
                @keyframes fruitOrbit {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                @keyframes fruitCounter {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(-360deg); }
                }
                @keyframes dotBounce {
                    0%, 100% { transform: translateY(0) scale(1); opacity: 0.5; }
                    50% { transform: translateY(-6px) scale(1.3); opacity: 1; }
                }
                @keyframes textShimmer {
                    0% { background-position: -200% center; }
                    100% { background-position: 200% center; }
                }
                @keyframes taglineFade {
                    0%, 100% { opacity: 0.6; }
                    50% { opacity: 1; }
                }
                @keyframes capBounce {
                    0%, 90%, 100% { transform: translateY(0); }
                    95% { transform: translateY(-4px); }
                }
                @keyframes ripple {
                    0% { transform: scale(0.5); opacity: 0.8; }
                    100% { transform: scale(2.2); opacity: 0; }
                }
                @keyframes sparkle {
                    0%, 100% { opacity: 0; transform: scale(0); }
                    50% { opacity: 1; transform: scale(1); }
                }
            `}</style>

            <div className="min-h-[520px] flex flex-col items-center justify-center relative p-8">
                {/* Background blobs */}
                <div className="absolute w-[220px] h-[220px] rounded-full bg-green-200 -top-[60px] -left-[60px] animate-[blobPulse1_4s_ease-in-out_infinite] opacity-50" />
                <div className="absolute w-[180px] h-[180px] rounded-full bg-pink-200 -bottom-[40px] -right-[40px] animate-[blobPulse2_3.5s_ease-in-out_infinite] opacity-45" />
                <div className="absolute w-[140px] h-[140px] rounded-full bg-orange-200 top-[40%] -left-[30px] animate-[blobPulse3_5s_ease-in-out_infinite] opacity-40" />
                <div className="absolute w-[100px] h-[100px] rounded-full bg-purple-200 top-5 right-[30px] animate-[blobPulse1_4.5s_ease-in-out_infinite_reverse] opacity-40" />

                {/* Sparkles */}
                <div className="absolute top-[15%] left-[20%] w-2.5 h-2.5 bg-pink-300 rounded-full animate-[sparkle_2s_ease-in-out_infinite_0.3s]" />
                <div className="absolute top-[25%] right-[22%] w-2 h-2 bg-green-300 rounded-full animate-[sparkle_2s_ease-in-out_infinite_0.9s]" />
                <div className="absolute bottom-[25%] left-[18%] w-1.5 h-1.5 bg-orange-300 rounded-full animate-[sparkle_2s_ease-in-out_infinite_1.5s]" />
                <div className="absolute bottom-[20%] right-[16%] w-2.5 h-2.5 bg-purple-300 rounded-full animate-[sparkle_2s_ease-in-out_infinite_0.6s]" />
                <div className="absolute top-[55%] right-[10%] w-1.5 h-1.5 bg-emerald-300 rounded-full animate-[sparkle_2s_ease-in-out_infinite_1.2s]" />

                {/* Fruit orbit ring */}
                <div className="relative w-[160px] h-[160px] mb-2">
                    {/* Ripple rings */}
                    <div className="absolute -inset-4 rounded-full border-2 border-green-300 animate-[ripple_2.4s_ease-out_infinite_0s]" />
                    <div className="absolute -inset-4 rounded-full border-2 border-pink-300 animate-[ripple_2.4s_ease-out_infinite_0.8s]" />
                    <div className="absolute -inset-4 rounded-full border-2 border-orange-300 animate-[ripple_2.4s_ease-out_infinite_1.6s]" />

                    {/* Orbiting fruits */}
                    <div className="absolute inset-0 animate-[fruitOrbit_4s_linear_infinite]">
                        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-orange-50 border-2 border-orange-400 flex items-center justify-center text-base animate-[fruitCounter_4s_linear_infinite]">🍊</div>
                        <div className="absolute -bottom-3.5 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-green-50 border-2 border-green-400 flex items-center justify-center text-base animate-[fruitCounter_4s_linear_infinite]">🍋</div>
                    </div>
                    <div className="absolute inset-0 animate-[fruitOrbit_5s_linear_infinite_reverse]">
                        <div className="absolute top-1/2 -left-3.5 -translate-y-1/2 w-7 h-7 rounded-full bg-pink-50 border-2 border-pink-400 flex items-center justify-center text-base animate-[fruitCounter_5s_linear_infinite_reverse]">🍓</div>
                        <div className="absolute top-1/2 -right-3.5 -translate-y-1/2 w-7 h-7 rounded-full bg-purple-50 border-2 border-purple-400 flex items-center justify-center text-base animate-[fruitCounter_5s_linear_infinite_reverse]">🥭</div>
                    </div>

                    {/* Center bottle */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-[floatBottle_2.8s_ease-in-out_infinite]">
                        <div className="relative w-[52px] h-[88px]">
                            {/* Cap */}
                            <div className="absolute top-0 left-[11px] right-[11px] h-2 bg-gradient-to-br from-pink-400 to-pink-600 rounded-t-md animate-[capBounce_2.4s_ease-in-out_infinite]" />
                            {/* Neck */}
                            <div className="absolute top-1.5 left-[14px] right-[14px] h-[18px] bg-green-50 border-2 border-green-600 rounded-t-sm" />
                            {/* Body */}
                            <div className="absolute top-[22px] left-0.5 right-0.5 bottom-0 bg-green-50 border-[2.5px] border-green-600 rounded-[6px_6px_12px_12px] overflow-hidden">
                                {/* Liquid fill */}
                                <div className="absolute bottom-0 left-0 right-0 transition-all duration-100" style={{ height: `${progress}%`, background: "linear-gradient(180deg, #4ade80 0%, #16a34a 50%, #0f6e56 100%)" }}>
                                    {/* Wave top */}
                                    <div className="absolute -top-1.5 -left-1.5 -right-1.5 h-3 bg-green-400 rounded-[50%_50%_0_0/60%_60%_0_0]" />
                                </div>
                                {/* Bubbles */}
                                <div className="absolute inset-0 overflow-hidden">
                                    <div className="absolute w-1.5 h-1.5 rounded-full bg-white/70 left-[20%] animate-[bubble_2.4s_ease-in_infinite_0.2s]" />
                                    <div className="absolute w-1 h-1 rounded-full bg-white/60 left-[50%] animate-[bubble_2.4s_ease-in_infinite_0.7s]" />
                                    <div className="absolute w-[6px] h-[6px] rounded-full bg-white/50 left-[70%] animate-[bubble_2.4s_ease-in_infinite_1.3s]" />
                                    <div className="absolute w-0.5 h-0.5 rounded-full bg-white/80 left-[35%] animate-[bubble_2.4s_ease-in_infinite_1.8s]" />
                                </div>
                                {/* Shine */}
                                <div className="absolute top-1.5 left-1.5 w-1.5 h-5 bg-white/35 rounded-full -rotate-15" />
                            </div>
                            {/* Label stripe */}
                            <div className="absolute top-8 left-0.5 right-0.5 h-3.5 bg-gradient-to-r from-pink-400 via-orange-400 to-yellow-400 opacity-35 rounded-sm" />
                        </div>
                    </div>
                </div>

                {/* Brand name with shimmer */}
                <div className="text-3xl font-medium tracking-tight mt-4 bg-gradient-to-r from-green-600 via-pink-600 via-orange-600 to-purple-600 bg-[length:200%_auto] bg-clip-text text-transparent animate-[textShimmer_3s_linear_infinite]">
                    Jaba Waba
                </div>

                {/* Tagline */}
                <div className="text-xs text-green-600 tracking-[0.12em] mt-1.5 animate-[taglineFade_2s_ease-in-out_infinite] font-medium">
                    FRESH · ORGANIC · DELIVERED
                </div>

                {/* Animated dots */}
                <div className="flex gap-2.5 mt-6 items-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-green-400 animate-[dotBounce_1.2s_ease-in-out_infinite_0s]" />
                    <div className="w-2.5 h-2.5 rounded-full bg-pink-400 animate-[dotBounce_1.2s_ease-in-out_infinite_0.2s]" />
                    <div className="w-2.5 h-2.5 rounded-full bg-orange-400 animate-[dotBounce_1.2s_ease-in-out_infinite_0.4s]" />
                    <div className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-[dotBounce_1.2s_ease-in-out_infinite_0.6s]" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-400 animate-[dotBounce_1.2s_ease-in-out_infinite_0.8s]" />
                </div>

                {/* Progress bar */}
                <div className="mt-5 w-40 h-0.5 bg-black/10 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-green-400 via-pink-400 to-orange-400 rounded-full transition-all duration-100" style={{ width: `${progress}%` }} />
                </div>
                <div className="text-[11px] text-green-600 mt-1.5 font-medium tracking-wide">
                   {defaultMessages[msgIdx]}
                </div>
            </div>
        </div>
    );
}