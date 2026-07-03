"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

import SearchForm   from "@/components/SearchForm";
import FilterPanel  from "@/components/FilterPanel";
import ResultsTable from "@/components/ResultsTable";
import ExportButton from "@/components/ExportButton";
import { useLeadsStore } from "@/store/useLeadsStore";

// ─────────────────────────────────────────────────────────────
// États possibles de la page
// ─────────────────────────────────────────────────────────────
type View =
  | "loading"          // détection session en cours
  | "teaser"           // pas connecté
  | "set-password"     // premier accès → doit créer/changer son MDP
  | "choose-plan"      // MDP défini mais pas d'abonnement actif
  | "app";             // connecté, abonné (ou essai en cours) ✅

interface Profile {
  plan: "free" | "paid" | string;
  searches_remaining: number;
  onboarded: boolean;
}

export default function HomePage() {
  const supabase = createClient();
  const [view, setView]           = useState<View>("loading");
  const [user, setUser]           = useState<User | null>(null);
  const [profile, setProfile]     = useState<Profile | null>(null);
  const [showLogin, setShowLogin] = useState(false);
  const [quotaPlan, setQuotaPlan] = useState<string | null>(null); // quota épuisé → upsell
  const { rawBusinesses }         = useLeadsStore();

  // Résout la vue à afficher une fois qu'on a un utilisateur authentifié
  // avec mot de passe déjà défini : l'écran de choix d'abonnement ne
  // s'affiche que si l'utilisateur n'a jamais fait son choix (onboarded).
  const resolveAppAccess = async () => {
    try {
      const res = await fetch("/api/profile");
      if (!res.ok) { setView("choose-plan"); return; }
      const { profile: p } = await res.json();
      setProfile(p);
      setView(p?.onboarded ? "app" : "choose-plan");
    } catch {
      setView("choose-plan");
    }
  };

  useEffect(() => {
    // ── Supabase gère automatiquement le hash #access_token=...
    // On écoute onAuthStateChange qui se déclenche pour :
    // - SIGNED_IN classique (email/MDP)
    // - PASSWORD_RECOVERY (lien reset MDP)
    //
    // NB : on ne se fie plus au flux "invite" natif de Supabase (SIGNED_IN
    // + email_confirmed_at null) car il est peu fiable en pratique. La
    // méthode recommandée pour créer un utilisateur est de l'ajouter
    // manuellement dans Supabase (Authentication → Add user) avec un mot
    // de passe provisoire ET la métadonnée { need_password_change: true }.
    // C'est ce flag, seul, qui déclenche l'écran de création de mot de passe.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("[Auth]", event, session?.user?.email);

        if (!session?.user) {
          setUser(null);
          setView("teaser");
          return;
        }

        const u = session.user;
        setUser(u);

        // Cas 1 : lien "reset password" par email → PASSWORD_RECOVERY
        if (event === "PASSWORD_RECOVERY") {
          setView("set-password");
          return;
        }

        // Cas 2 : métadonnée posée manuellement (mot de passe provisoire)
        if (u.user_metadata?.need_password_change === true) {
          setView("set-password");
          return;
        }

        // Cas 3 : connexion normale ou MDP déjà changé
        resolveAppAccess();
        setShowLogin(false);
      }
    );

    // Lecture de la session existante au montage (tab déjà ouvert)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) {
        setView("teaser");
        return;
      }
      const u = session.user;
      setUser(u);
      if (u.user_metadata?.need_password_change === true) {
        setView("set-password");
      } else {
        resolveAppAccess();
      }
    });

    return () => subscription.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Retour de Stripe Checkout : le webhook peut avoir un léger
  // délai, on retente une fois après 1.5s si toujours pas abonné.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("payment") === "success") {
      resolveAppAccess();
      const retry = setTimeout(() => resolveAppAccess(), 1500);
      return () => clearTimeout(retry);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Écrans bloquants (pas de header, pas de nav) ──────────
  if (view === "loading") return <Spinner />;

  if (view === "set-password" && user) {
    return (
      <SetPassword
        user={user}
        onSuccess={() => { resolveAppAccess(); setShowLogin(false); }}
      />
    );
  }

  if (view === "choose-plan" && user) {
    return (
      <ChoosePlan
        onFreeTrial={async () => {
          try {
            await fetch("/api/profile", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ action: "activate_free" }),
            });
          } finally {
            resolveAppAccess();
          }
        }}
      />
    );
  }

  // ── Interface principale ───────────────────────────────────
  return (
    <div className="min-h-screen bg-white">

      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-lg border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center shadow-md shadow-blue-600/20">
              <svg className="w-[18px] h-[18px] text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"/>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"/>
              </svg>
            </div>
            <span className="font-bold text-slate-900">LocalLeads</span>
            <span className="hidden sm:inline text-xs text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full font-semibold">App</span>
          </a>

          <div className="flex items-center gap-3">
            {view === "app" && user ? (
              <>
                <div className="hidden sm:flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-700">
                    {user.email?.[0].toUpperCase()}
                  </div>
                  <span className="text-sm text-slate-600">{user.email}</span>
                </div>
                <button
                  onClick={() => supabase.auth.signOut()}
                  className="text-sm text-slate-500 hover:text-slate-700 border border-slate-200 hover:border-slate-300 px-4 py-2 rounded-xl transition-all cursor-pointer"
                >
                  Se déconnecter
                </button>
              </>
            ) : (
              <>
                <a href="/" className="text-sm text-slate-500 hover:text-slate-700 transition-colors">← Accueil</a>
                <button
                  onClick={() => setShowLogin(true)}
                  className="text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 px-5 py-2.5 rounded-xl shadow-md shadow-blue-600/20 transition-all cursor-pointer"
                >
                  Se connecter
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Contenu */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-8">

        <div className="max-w-2xl">
          {view === "app" ? (
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Accès complet activé
              </span>
              {profile?.plan === "free" && (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-full">
                  {profile.searches_remaining > 0
                    ? `${profile.searches_remaining} recherche${profile.searches_remaining > 1 ? "s" : ""} gratuite${profile.searches_remaining > 1 ? "s" : ""} restante${profile.searches_remaining > 1 ? "s" : ""}`
                    : "Essai gratuit épuisé"}
                </span>
              )}
            </div>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-full mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              Mode aperçu — Connecte-toi pour rechercher
            </span>
          )}
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight block">
            Trouve tes prochains clients.
          </h1>
          <p className="text-slate-500 mt-2">
            {view === "app"
              ? "Lance une recherche pour trouver des entreprises locales qui ont besoin de toi."
              : "Découvre l'interface. Connecte-toi pour accéder aux données réelles."}
          </p>
        </div>

        {/* Zone de recherche */}
        <div className="relative">
          {view === "teaser" && (
            <div className="absolute inset-0 z-10 rounded-2xl cursor-pointer" onClick={() => setShowLogin(true)} />
          )}
          <div className={`bg-white border border-slate-100 rounded-2xl p-6 shadow-sm ${view === "teaser" ? "opacity-70 pointer-events-none select-none" : ""}`}>
            <SearchForm
              disabled={view === "teaser"}
              onBlockedClick={() => setShowLogin(true)}
              onQuotaExceeded={(plan) => setQuotaPlan(plan)}
              onSearchSettled={() => resolveAppAccess()}
            />
          </div>
        </div>

        {/* Résultats — app uniquement */}
        {view === "app" && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1"><FilterPanel /></div>
            <div className="lg:col-span-3 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-500">Résultats</h2>
                <ExportButton />
              </div>
              <ResultsTable />
            </div>
          </div>
        )}

        {/* Placeholder teaser */}
        {view === "teaser" && <TeaserPlaceholder onLogin={() => setShowLogin(true)} />}
      </main>

      {/* Modale login */}
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}

      {/* Modale quota de recherches épuisé */}
      {quotaPlan && <QuotaExceededModal plan={quotaPlan} onClose={() => setQuotaPlan(null)} />}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// CHOIX D'ABONNEMENT — écran bloquant avant accès au scraper
// ─────────────────────────────────────────────────────────────
function ChoosePlan({ onFreeTrial }: { onFreeTrial: () => Promise<void> }) {
  const [loading, setLoading]         = useState(false);
  const [trialLoading, setTrialLoading] = useState(false);
  const [error, setError]             = useState<string | null>(null);

  const handleSubscribe = async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch("/api/stripe", { method: "POST" });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error ?? "Erreur Stripe.");
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur s'est produite.");
      setLoading(false);
    }
  };

  const handleFreeTrial = async () => {
    setTrialLoading(true);
    await onFreeTrial();
    setTrialLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2.5 mb-10">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/30">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"/>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"/>
            </svg>
          </div>
          <span className="text-lg font-bold text-slate-900">LocalLeads</span>
        </div>

        <div className="bg-white border border-slate-100 rounded-3xl shadow-xl shadow-slate-200/50 p-8 text-center">
          <h2 className="text-xl font-bold text-slate-900 mb-1">Dernière étape avant l&apos;accès complet</h2>
          <p className="text-sm text-slate-500 mb-6">
            Choisis un abonnement, ou lance ton essai gratuit (1 recherche, 3 résultats).
          </p>

          {error && (
            <div className="bg-red-50 border border-red-100 rounded-xl px-3 py-2.5 mb-4">
              <p className="text-xs text-red-600">{error}</p>
            </div>
          )}

          <button onClick={handleSubscribe} disabled={loading || trialLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 text-white font-semibold rounded-xl py-3.5 text-sm shadow-lg shadow-blue-600/25 transition-all cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2 mb-3">
            {loading ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Redirection…</> : "S'abonner →"}
          </button>

          <button onClick={handleFreeTrial} disabled={loading || trialLoading}
            className="w-full border border-slate-200 hover:border-slate-300 text-slate-600 font-medium rounded-xl py-3 text-sm transition-all cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2">
            {trialLoading ? <><span className="w-4 h-4 border-2 border-slate-300 border-t-slate-500 rounded-full animate-spin"/>Activation…</> : "Essayer gratuitement (1 recherche, 3 résultats)"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// QUOTA ÉPUISÉ — proposé quand une recherche est bloquée en cours
// d'utilisation (essai gratuit terminé, ou palier du forfait atteint)
// ─────────────────────────────────────────────────────────────
function QuotaExceededModal({ plan, onClose }: { plan: string; onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const isFree = plan === "free";

  const handleSubscribe = async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch("/api/stripe", { method: "POST" });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error ?? "Erreur Stripe.");
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur s'est produite.");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-white border border-slate-200 rounded-3xl shadow-2xl p-8 text-center">
        <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 cursor-pointer">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        </div>

        {isFree ? (
          <>
            <h2 className="text-lg font-bold text-slate-900 mb-1">Ton essai gratuit est terminé</h2>
            <p className="text-sm text-slate-500 mb-6">Abonne-toi pour continuer à générer des leads illimités.</p>
          </>
        ) : (
          <>
            <h2 className="text-lg font-bold text-slate-900 mb-1">Limite de recherches atteinte</h2>
            <p className="text-sm text-slate-500 mb-6">
              Tu as utilisé tout ton quota. Les paliers supérieurs arrivent bientôt —
              en attendant, contacte-nous pour augmenter ton quota.
            </p>
          </>
        )}

        {error && (
          <div className="bg-red-50 border border-red-100 rounded-xl px-3 py-2.5 mb-4">
            <p className="text-xs text-red-600">{error}</p>
          </div>
        )}

        {isFree ? (
          <button onClick={handleSubscribe} disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 text-white font-semibold rounded-xl py-3.5 text-sm shadow-lg shadow-blue-600/25 transition-all cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2">
            {loading ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Redirection…</> : "S'abonner →"}
          </button>
        ) : (
          <a href="/contact"
            className="w-full inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl py-3.5 text-sm shadow-lg shadow-blue-600/25 transition-all">
            Nous contacter →
          </a>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SET PASSWORD — écran bloquant (invitation + premier accès)
// ─────────────────────────────────────────────────────────────
function SetPassword({ user, onSuccess }: { user: User; onSuccess: () => void }) {
  const supabase = createClient();
  const [pwd, setPwd]         = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const [showPwd, setShowPwd] = useState(false);

  const strength = pwd.length === 0 ? 0 : pwd.length < 8 ? 1 : pwd.length < 12 ? 2 : 3;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (pwd.length < 8) { setError("8 caractères minimum."); return; }
    if (pwd !== confirm) { setError("Les mots de passe ne correspondent pas."); return; }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password: pwd,
      data: { need_password_change: false },
    });

    if (error) { setError(error.message); setLoading(false); return; }

    onSuccess();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white flex items-center justify-center p-6">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-10">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/30">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"/>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"/>
            </svg>
          </div>
          <span className="text-lg font-bold text-slate-900">LocalLeads</span>
        </div>

        <div className="bg-white border border-slate-100 rounded-3xl shadow-xl shadow-slate-200/50 p-8">

          {/* Icone clé */}
          <div className="w-14 h-14 mx-auto mb-5 relative">
            <div className="absolute inset-0 bg-blue-50 rounded-2xl" />
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="w-7 h-7 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/>
              </svg>
            </div>
          </div>

          <h2 className="text-xl font-bold text-slate-900 text-center mb-1">Choisis ton mot de passe</h2>
          <p className="text-xs text-slate-400 text-center mb-6">
            Cette étape est obligatoire pour accéder à l&apos;application.
          </p>

          {/* Email */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 mb-5">
            <svg className="w-4 h-4 text-blue-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <span className="text-sm text-slate-700 font-medium truncate">{user.email}</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Mot de passe */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5">
                Nouveau mot de passe *
              </label>
              <div className="relative">
                <input
                  type={showPwd ? "text" : "password"}
                  required minLength={8}
                  value={pwd} onChange={e => setPwd(e.target.value)}
                  placeholder="8 caractères minimum"
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 pr-10 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 shadow-sm transition-all"
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    {showPwd
                      ? <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                      : <><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></>}
                  </svg>
                </button>
              </div>

              {/* Jauge force */}
              {pwd.length > 0 && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex gap-1 flex-1">
                    {[1,2,3].map(i => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-all ${
                        i <= strength
                          ? strength === 1 ? "bg-red-400" : strength === 2 ? "bg-amber-400" : "bg-emerald-500"
                          : "bg-slate-100"
                      }`} />
                    ))}
                  </div>
                  <span className={`text-xs font-medium ${strength === 1 ? "text-red-500" : strength === 2 ? "text-amber-600" : "text-emerald-600"}`}>
                    {strength === 1 ? "Faible" : strength === 2 ? "Moyen" : "Fort"}
                  </span>
                </div>
              )}
            </div>

            {/* Confirmation */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5">
                Confirmer *
              </label>
              <input
                type="password" required
                value={confirm} onChange={e => setConfirm(e.target.value)}
                placeholder="Répète ton mot de passe"
                className={`w-full bg-white border rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 shadow-sm transition-all ${
                  confirm && confirm !== pwd
                    ? "border-red-300 focus:border-red-400 focus:ring-red-400/15"
                    : confirm && confirm === pwd
                    ? "border-emerald-300 focus:border-emerald-400 focus:ring-emerald-400/15"
                    : "border-slate-200 focus:border-blue-500 focus:ring-blue-500/15"
                }`}
              />
              {confirm && confirm !== pwd && (
                <p className="text-xs text-red-500 mt-1">Les mots de passe ne correspondent pas.</p>
              )}
            </div>

            {/* Erreur serveur */}
            {error && (
              <div className="bg-red-50 border border-red-100 rounded-xl px-3 py-2.5">
                <p className="text-xs text-red-600">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || pwd.length < 8 || pwd !== confirm}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold rounded-xl py-3.5 text-sm shadow-lg shadow-blue-600/25 disabled:shadow-none transition-all cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading
                ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Enregistrement…</>
                : "Enregistrer mon mot de passe →"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// MODAL LOGIN
// ─────────────────────────────────────────────────────────────
type LoginMode = "signin" | "reset" | "reset-sent";

function LoginModal({ onClose }: { onClose: () => void }) {
  const supabase = createClient();
  const [mode, setMode]       = useState<LoginMode>("signin");
  const [email, setEmail]     = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(null);

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(
        error.message.includes("Email not confirmed") ? "Email non confirmé dans Supabase." :
        error.message.includes("Invalid login") ? "Email ou mot de passe incorrect." :
        error.message
      );
      setLoading(false);
    }
    // Si OK → onAuthStateChange gère la suite
  };

  const handleGoogle = async () => {
    setLoading(true);
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/home` },
    });
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(null);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/home`,
    });
    if (error) { setError(error.message); setLoading(false); }
    else { setLoading(false); setMode("reset-sent"); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-sm bg-white border border-slate-200 rounded-3xl shadow-2xl p-8 overflow-hidden">
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-blue-500/8 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="relative flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
                <svg className="w-[15px] h-[15px] text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"/>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"/>
                </svg>
              </div>
              <span className="font-bold text-slate-900 text-sm">LocalLeads</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              {mode === "signin" ? "Connexion" : mode === "reset" ? "Mot de passe oublié" : "Email envoyé !"}
            </h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 cursor-pointer">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* Signin */}
        {mode === "signin" && (
          <div className="relative space-y-3">
            <button onClick={handleGoogle} disabled={loading}
              className="w-full flex items-center justify-center gap-2.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 font-semibold rounded-xl py-3 text-sm shadow-sm transition-all cursor-pointer disabled:opacity-50">
              <GoogleIcon />
              Continuer avec Google
            </button>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-slate-100"/><span className="text-xs text-slate-400">ou</span><div className="flex-1 h-px bg-slate-100"/>
            </div>
            <form onSubmit={handleSignIn} className="space-y-3">
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                placeholder="ton@email.com"
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 shadow-sm transition-all"/>
              <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
                placeholder="Mot de passe"
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 shadow-sm transition-all"/>
              {error && <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-xl px-3 py-2">{error}</p>}
              <button type="submit" disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold rounded-xl py-3 text-sm shadow-lg shadow-blue-600/25 transition-all cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2">
                {loading ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Connexion…</> : "Se connecter"}
              </button>
            </form>
            <div className="flex flex-col items-center gap-2 pt-1">
              <button onClick={() => { setMode("reset"); setError(null); }}
                className="text-xs text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">
                Mot de passe oublié ?
              </button>
              <span className="text-xs text-slate-400">
                Pas de compte ?{" "}
                <a href="/" className="text-blue-600 hover:text-blue-700 font-medium underline underline-offset-2">S&apos;inscrire à la waitlist</a>
              </span>
            </div>
          </div>
        )}

        {/* Reset */}
        {mode === "reset" && (
          <div className="relative space-y-3">
            <p className="text-sm text-slate-500 mb-2">Entre ton email pour recevoir un lien de réinitialisation.</p>
            <form onSubmit={handleReset} className="space-y-3">
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                placeholder="ton@email.com"
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 shadow-sm transition-all"/>
              {error && <p className="text-xs text-red-500">{error}</p>}
              <button type="submit" disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl py-3 text-sm shadow-lg shadow-blue-600/25 transition-all cursor-pointer flex items-center justify-center gap-2">
                {loading ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Envoi…</> : "Envoyer le lien"}
              </button>
              <button type="button" onClick={() => { setMode("signin"); setError(null); }}
                className="w-full text-xs text-slate-400 hover:text-slate-600 transition-colors cursor-pointer text-center">
                ← Retour
              </button>
            </form>
          </div>
        )}

        {/* Reset envoyé */}
        {mode === "reset-sent" && (
          <div className="text-center py-4">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
              </svg>
            </div>
            <p className="text-sm font-semibold text-slate-900 mb-1">Email envoyé !</p>
            <p className="text-xs text-slate-500 mb-4">Clique sur le lien reçu pour choisir un nouveau mot de passe.</p>
            <button onClick={() => setMode("signin")} className="text-xs text-blue-600 hover:text-blue-700 cursor-pointer">← Retour</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// TEASER PLACEHOLDER
// ─────────────────────────────────────────────────────────────
function TeaserPlaceholder({ onLogin }: { onLogin: () => void }) {
  const rows = [
    { name: "Plomberie Durand & Fils", city: "Lyon",     cat: "Plombier",    badge: "Sans site web",   bc: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    { name: "Électricité Martin",       city: "Bordeaux", cat: "Électricien", badge: "E-réputation ↓", bc: "bg-orange-50 text-orange-700 border-orange-200"   },
    { name: "Coiffure Isabelle B.",     city: "Nantes",   cat: "Coiffeur",    badge: "Sans site web",   bc: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    { name: "Boulangerie Moreau",       city: "Lille",    cat: "Boulanger",   badge: "E-réputation ↓", bc: "bg-orange-50 text-orange-700 border-orange-200"   },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Filtres */}
      <div className="lg:col-span-1 bg-slate-50 border border-slate-100 rounded-2xl p-5 space-y-4">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Filtres</p>
        {["Sans site web", "Note maximum", "E-réputation", "Sans téléphone"].map(l => (
          <div key={l} className="flex items-center justify-between">
            <span className="text-sm text-slate-400">{l}</span>
            <div className="w-9 h-5 bg-slate-200 rounded-full" />
          </div>
        ))}
        <p className="text-xs text-center text-slate-300 border-t border-slate-100 pt-3">Disponible après connexion</p>
      </div>

      {/* Table */}
      <div className="lg:col-span-3 rounded-xl border border-slate-100 overflow-hidden relative">
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/75 backdrop-blur-[2px]">
          <div className="bg-white border border-slate-200 rounded-2xl px-7 py-5 text-center shadow-lg max-w-xs">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-3">
              <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
              </svg>
            </div>
            <p className="text-sm font-bold text-slate-900 mb-1">Données réservées aux membres</p>
            <p className="text-xs text-slate-500 mb-4">
              Connecte-toi pour accéder aux vrais leads.{" "}
              <a href="/" className="text-blue-600 hover:underline font-medium">Pas encore de compte ?</a>
            </p>
            <button onClick={onLogin}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl py-2.5 text-sm shadow-md shadow-blue-600/20 transition-all cursor-pointer">
              Se connecter →
            </button>
          </div>
        </div>
        <table className="w-full text-sm select-none">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              {["Entreprise", "Ville", "Note", "Statut", ""].map(h => (
                <th key={h} className="px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider text-left">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {rows.map((r, i) => (
              <tr key={i} className="bg-white">
                <td className="px-4 py-3.5"><div className="font-semibold text-slate-800 blur-sm">{r.name}</div><div className="text-xs text-slate-400 blur-sm">{r.cat}</div></td>
                <td className="px-4 py-3.5 text-xs text-slate-400 blur-sm">{r.city}</td>
                <td className="px-4 py-3.5"><span className="text-amber-500 font-bold blur-sm">★ 3.x</span></td>
                <td className="px-4 py-3.5"><span className={`inline-flex items-center gap-1 text-xs font-semibold border px-2.5 py-1 rounded-full ${r.bc}`}>{r.badge}</span></td>
                <td className="px-4 py-3.5"><div className="w-14 h-7 bg-slate-100 rounded-lg blur-sm" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// UTILS
// ─────────────────────────────────────────────────────────────
function Spinner() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="relative w-10 h-10">
        <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full" />
        <div className="absolute inset-0 border-4 border-transparent border-t-blue-600 rounded-full animate-spin" />
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}