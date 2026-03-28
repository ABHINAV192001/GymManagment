'use client';

import Link from 'next/link';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { FaDumbbell, FaUsers, FaVideo, FaPlay, FaRunning, FaBicycle, FaHeartbeat } from 'react-icons/fa';
import { useState, useEffect } from 'react';

export default function LandingPage() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <div className="min-h-screen flex flex-col bg-[var(--bg-dark)]">
            {/* Navigation */}
            <nav className="p-6 flex justify-between items-center max-w-7xl mx-auto w-full sticky top-0 bg-[var(--bg-dark)]/80 backdrop-blur-md z-50">
                <div className="text-2xl font-black italic tracking-tighter flex items-center gap-1">
                    <span className="text-[var(--text)]">GYM</span>
                    <span className="text-[var(--primary-dark)]">BROSS</span>
                </div>

                {/* Center Container: Animation Background + Foreground Links */}
                <div className="hidden md:flex flex-1 mx-12 relative h-12 items-center justify-center">
                    {/* Bkg Layer: Equipment Animation Loop */}
                    <div className="absolute inset-0 overflow-hidden flex items-center opacity-30 select-none pointer-events-none">
                        <div className="flex gap-16 animate-marquee whitespace-nowrap text-[var(--text-secondary)]">
                            {mounted && (
                                <>
                                    <FaDumbbell className="text-2xl" />
                                    <FaRunning className="text-2xl" />
                                    <FaBicycle className="text-2xl" />
                                    <FaHeartbeat className="text-2xl" />
                                    <FaDumbbell className="text-2xl" />
                                    <FaRunning className="text-2xl" />
                                    <FaBicycle className="text-2xl" />
                                    <FaHeartbeat className="text-2xl" />
                                    <FaDumbbell className="text-2xl" />
                                    <FaRunning className="text-2xl" />
                                    <FaBicycle className="text-2xl" />
                                    <FaHeartbeat className="text-2xl" />
                                </>
                            )}
                        </div>
                    </div>

                    {/* Foreground Layer: Navigation Links */}
                    <div className="relative z-10 flex gap-8 font-bold text-lg uppercase tracking-wider">
                        <Link href="#pricing" className="text-[var(--text)] hover:text-[var(--primary-dark)] transition-colors">Price</Link>
                        <Link href="#features" className="text-[var(--text)] hover:text-[var(--primary-dark)] transition-colors">Feature</Link>
                        <Link href="#" className="text-[var(--text)] hover:text-[var(--primary-dark)] transition-colors">Management</Link>
                    </div>
                </div>

                <div className="flex gap-4">
                    <Button href="/auth/login" className="!rounded-full px-6">Login</Button>
                </div>
            </nav>

            {/* Hero Section */}
            <header className="relative min-h-[80vh] flex items-center overflow-hidden">
                {/* Background - Using Image for Hero, but ensure text is readable. 
            For Light Theme, User usually wants light background with dark text,
            BUT the hero section often looks better with an image + white text even in light mode apps.
            HOWEVER, user said "not able to see anything", implying total white out.
            Let's make the Hero section distinct: Dark Image Background with White Text (standard hero),
            OR Light Background with Dark Text.
            Given the request "light theme", I will assume standard sections should be light.
            But Hero with image usually stays dark-ish overlay for text contrast.
            Let's ensure the text has contrast against whatever background it sits on.
        */}
                <div className="absolute inset-0 z-0 bg-gray-900">
                    {/* If we use an image background, we MUST use white text on top of it */}
                    <div className="absolute inset-0 bg-black/40 z-10"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent z-10"></div>

                    <img
                        src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop"
                        alt="Gym Background"
                        className="w-full h-full object-cover opacity-60"
                    />
                </div>

                <div className="max-w-7xl mx-auto px-6 w-full relative z-20 pt-20">
                    {/* Hero Text - Keep White because it's on top of a dark image overlay */}
                    <h1 className="text-6xl md:text-8xl font-black text-white leading-[0.9] mb-6 uppercase italic">
                        Build Your <br /> Best Self
                    </h1>
                    <p className="text-gray-200 text-lg max-w-md mb-8">
                        Unlock your full potential with the right mindset, discipline, and training.
                        Start your journey today.
                    </p>
                    <div className="flex gap-4">
                        <Button href="/auth/register/organization" className="!bg-[var(--primary)] !text-black border-none !px-8 !py-4 !rounded-none uppercase font-bold tracking-wider hover:!bg-white transition-colors">
                            Start Now
                        </Button>
                        <Button href="/auth/login" variant="outline" className="!border-white !text-white hover:!bg-white hover:!text-black !px-8 !py-4 !rounded-none uppercase font-bold tracking-wider">
                            Contact
                        </Button>
                    </div>
                </div>
            </header>

            {/* Infinite Scroll Banner - Lime Green with Black Text - Good Visibility */}
            <div className="bg-[var(--primary)] py-4 overflow-hidden whitespace-nowrap relative z-20">
                <div className="scroll-text text-black font-black italic text-2xl uppercase tracking-widest inline-block animate-marquee">
                    Perseverance // Passion // Attitude // Commitment // Mental Strength // Dedication //
                    Perseverance // Passion // Attitude // Commitment // Mental Strength // Dedication //
                </div>
            </div>

            {/* Transform Section - WHITE Background (from theme) -> need DARK Text */}
            <section className="py-24 px-6 bg-[var(--bg-dark)]">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-4xl md:text-5xl font-black italic uppercase mb-16 text-center text-[var(--text)]">Transform Your Body</h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Card 1 */}
                        <div className="bg-[var(--bg-darker)] p-10 border border-[var(--border-color)] group hover:border-[var(--primary)] transition-all duration-300 relative overflow-hidden">
                            <div className="text-4xl mb-6 text-[var(--text-secondary)] group-hover:text-[var(--primary-dark)] transition-colors" suppressHydrationWarning>
                                <FaDumbbell />
                            </div>
                            <h3 className="text-2xl font-bold uppercase italic mb-4 text-[var(--text)]">Private Sessions</h3>
                            <p className="text-[var(--text-secondary)]">One-on-one coaching tailored specifically to your goals and needs.</p>
                        </div>

                        {/* Card 2 */}
                        <div className="bg-[var(--bg-darker)] p-10 border border-[var(--border-color)] group hover:border-[var(--primary)] transition-all duration-300 relative overflow-hidden">
                            <div className="text-4xl mb-6 text-[var(--text-secondary)] group-hover:text-[var(--primary-dark)] transition-colors" suppressHydrationWarning>
                                <FaUsers />
                            </div>
                            <h3 className="text-2xl font-bold uppercase italic mb-4 text-[var(--text)]">Private Groups</h3>
                            <p className="text-[var(--text-secondary)]">Train and grow alongside a supportive community of like-minded people.</p>
                        </div>

                        {/* Card 3 */}
                        <div className="bg-[var(--bg-darker)] p-10 border border-[var(--border-color)] group hover:border-[var(--primary)] transition-all duration-300 relative overflow-hidden">
                            <div className="text-4xl mb-6 text-[var(--text-secondary)] group-hover:text-[var(--primary-dark)] transition-colors" suppressHydrationWarning>
                                <FaVideo />
                            </div>
                            <h3 className="text-2xl font-bold uppercase italic mb-4 text-[var(--text)]">Video Tutorials</h3>
                            <p className="text-[var(--text-secondary)]">Access exclusive workout guides anytime, anywhere from your device.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Real People Section - Dark Background (Zinc 900) - Text White OK */}
            <section className="py-24 bg-zinc-900 text-white relative">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    <div>
                        {/* Placeholder for collage */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="h-64 bg-zinc-800 rounded-lg overflow-hidden">
                                <img src="https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&q=80" className="w-full h-full object-cover" />
                            </div>
                            <div className="h-64 bg-zinc-800 rounded-lg overflow-hidden mt-8">
                                <img src="https://images.unsplash.com/photo-1605296867304-46d5465a13f1?auto=format&fit=crop&q=80" className="w-full h-full object-cover" />
                            </div>
                        </div>
                    </div>
                    <div className="text-right">
                        <h2 className="text-4xl md:text-6xl font-black italic uppercase mb-6 leading-tight">
                            Real Changes <br /> In Real People
                        </h2>
                        <p className="text-gray-400 text-lg mb-8 max-w-md ml-auto">
                            Real change comes with real effort. Push your limits, stay consistent, and achieve the results you deserve.
                        </p>
                        <div className="flex justify-end gap-4">
                            <button className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center hover:bg-white hover:text-black transition-colors">
                                ←
                            </button>
                            <button className="w-12 h-12 rounded-full bg-[var(--primary)] text-black flex items-center justify-center hover:bg-white transition-colors">
                                →
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Train With Me Section - White Background - Needs Dark Text */}
            <section className="py-24 px-6 bg-[var(--bg-dark)]">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div>
                        <h2 className="text-5xl font-black italic uppercase mb-6 text-[var(--text)]">Train With Me</h2>
                        <p className="text-[var(--text-secondary)] text-lg mb-8">
                            Let's work together to push your limits, break barriers, and build the strongest, healthiest versions of yourself. True change starts with commitment.
                        </p>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
                            <div className="bg-black text-white p-4 text-center">
                                <div className="text-3xl font-black">12+</div>
                                <div className="text-xs uppercase tracking-wider text-gray-400">Monthly Videos</div>
                            </div>
                            <div className="bg-zinc-800 text-white p-4 text-center">
                                <div className="text-3xl font-black">2</div>
                                <div className="text-xs uppercase tracking-wider text-gray-400">Personal Sessions</div>
                            </div>
                            <div className="bg-zinc-800 text-white p-4 text-center">
                                <div className="text-3xl font-black">4</div>
                                <div className="text-xs uppercase tracking-wider text-gray-400">Individual Classes</div>
                            </div>
                            <div className="bg-zinc-800 text-white p-4 text-center">
                                <div className="text-3xl font-black">98%</div>
                                <div className="text-xs uppercase tracking-wider text-gray-400">Success Rate</div>
                            </div>
                        </div>
                    </div>
                    <div className="relative">
                        <div className="aspect-video bg-zinc-900 rounded-lg overflow-hidden relative group cursor-pointer">
                            <img src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&q=80" className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30 group-hover:scale-110 transition-transform" suppressHydrationWarning>
                                    <FaPlay className="text-white ml-2 text-2xl" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Pricing Section - Zinc 900 Background (Dark) - Text White OK */}
            <section className="py-24 px-6 bg-zinc-900 text-white">
                <div className="max-w-7xl mx-auto">
                    <div className="flex justify-between items-end mb-16">
                        <div>
                            <h2 className="text-5xl font-black italic uppercase leading-none">All Training Plans</h2>
                            <p className="text-gray-400 mt-4">Choose the plan that's right for you</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Card Gold */}
                        <div className="bg-white text-black p-8 rounded-xl relative overflow-hidden flex flex-col h-full">
                            <div className="text-sm font-bold uppercase mb-2 text-gray-500">Pack</div>
                            <h3 className="text-4xl font-black uppercase mb-4 italic">Gold</h3>
                            <div className="text-3xl font-bold mb-8">$700<span className="text-sm font-normal text-gray-500">/Year</span></div>

                            <ul className="space-y-3 mb-8 text-sm flex-1">
                                <li className="flex items-center gap-2">• Monthly Supplementation</li>
                                <li className="flex items-center gap-2">• Free Online Sessions</li>
                                <li className="flex items-center gap-2">• Free Merchandising</li>
                                <li className="flex items-center gap-2">• Daily Videos</li>
                                <li className="flex items-center gap-2">• Personal Nutrition Program</li>
                            </ul>

                            <Button href="/auth/register/organization" className="!bg-[var(--primary)] !text-black w-full !rounded-none font-bold uppercase">Start Today</Button>
                        </div>

                        {/* Card Beginner */}
                        <div className="bg-zinc-800 p-8 rounded-xl border border-zinc-700 flex flex-col h-full opacity-60 hover:opacity-100 transition-opacity">
                            <h3 className="text-3xl font-black uppercase mb-2 italic">Beginner</h3>
                            <div className="inline-block bg-[var(--primary)] text-black font-bold px-3 py-1 text-sm rounded mb-4 w-fit">$80 / Month</div>
                            <p className="text-gray-400 text-sm mb-8">Perfect for those starting their fitness journey.</p>
                        </div>

                        {/* Card Pro */}
                        <div className="bg-zinc-800 p-8 rounded-xl border border-zinc-700 flex flex-col h-full opacity-60 hover:opacity-100 transition-opacity">
                            <h3 className="text-3xl font-black uppercase mb-2 italic">Pro</h3>
                            <div className="inline-block bg-[var(--primary)] text-black font-bold px-3 py-1 text-sm rounded mb-4 w-fit">$300 / Month</div>
                            <p className="text-gray-400 text-sm mb-8">Designed for advanced athletes ready to push further.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Large CTA Footer */}
            <section className="h-[60vh] relative flex items-center justify-center overflow-hidden">
                <img src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80" className="absolute inset-0 w-full h-full object-cover filter grayscale brightness-50" />
                <div className="relative z-10 text-center">
                    <h2 className="text-[12rem] font-black italic text-zinc-800 uppercase leading-none mix-blend-overlay">START</h2>
                    <div className="absolute inset-0 flex items-center justify-center top-8">
                        <Button href="/auth/register/organization" className="!bg-[var(--primary)] !text-black !px-12 !py-4 !rounded-none uppercase font-bold text-xl hover:scale-105 transition-transform">
                            Join Now
                        </Button>
                    </div>
                </div>
            </section>

            <style jsx global>{`
        @keyframes marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
        }
        .animate-marquee {
            animation: marquee 20s linear infinite;
        }
      `}</style>
        </div>
    );
}
