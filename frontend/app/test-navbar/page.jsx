"use client";
import Navbar from "@/app/components/Navbar";

export default function TestNavbarPage() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-neutral-900 text-black dark:text-white">
            <Navbar />
            <main className="p-10">
                <h1 className="text-2xl font-bold mb-4">Navbar Verification Page</h1>
                <p>This page exists solely to test the Navbar E2E without authentication.</p>
            </main>
        </div>
    );
}
