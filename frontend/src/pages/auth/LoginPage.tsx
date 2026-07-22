import React from 'react';
import { Activity, ShieldCheck, UsersRound } from 'lucide-react';
import { LoginForm } from '../../features/auth/components/LoginForm';

type LoginPageProps = {
  onLogin: () => void;
};

export function LoginPage({ onLogin }: LoginPageProps) {
  return (
    <main className="min-h-screen bg-zinc-100 p-4 text-zinc-900 sm:p-6 lg:grid lg:grid-cols-2 lg:p-0">
      <section className="relative hidden overflow-hidden bg-zinc-950 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(37,99,235,0.35),transparent_30%),radial-gradient(circle_at_80%_80%,rgba(14,165,233,0.22),transparent_35%)]" />
        <div className="relative flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 font-black">G</div>
          <span className="text-lg font-extrabold tracking-tight">GymOS Pro</span>
        </div>

        <div className="relative max-w-lg">
          <p className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-blue-300">Gym management, connected</p>
          <h1 className="text-5xl font-black leading-tight tracking-tight">Run every branch from one focused workspace.</h1>
          <p className="mt-6 max-w-md text-base leading-7 text-zinc-300">Manage members, payments, classes, equipment, and your team with clear operational visibility.</p>
        </div>

        <div className="relative grid grid-cols-3 gap-3 text-sm">
          <Metric icon={UsersRound} label="Members" value="360+" />
          <Metric icon={Activity} label="Check-ins" value="1,240" />
          <Metric icon={ShieldCheck} label="Secure roles" value="RBAC" />
        </div>
      </section>

      <section className="flex min-h-[calc(100vh-2rem)] items-center justify-center rounded-2xl bg-white px-5 py-10 shadow-sm lg:min-h-screen lg:rounded-none lg:shadow-none">
        <div className="w-full max-w-md">
          <div className="mb-9 lg:hidden">
            <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 font-black text-white">G</div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-600">GymOS Pro</p>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-zinc-950">Welcome back</h2>
          <p className="mt-2 text-sm leading-6 text-zinc-500">Sign in to access your organization’s GymOS workspace.</p>
          <div className="mt-8"><LoginForm onSuccess={onLogin} /></div>
          <p className="mt-7 text-center text-xs leading-5 text-zinc-500">By continuing, you agree to your organization’s security and access policies.</p>
        </div>
      </section>
    </main>
  );
}

function Metric({ icon: Icon, label, value }: { icon: typeof Activity; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur-sm">
      <Icon className="mb-4 h-4 w-4 text-blue-300" />
      <p className="font-bold">{value}</p>
      <p className="mt-0.5 text-xs text-zinc-400">{label}</p>
    </div>
  );
}
