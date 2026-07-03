"use client";

import SiteFooter from "@/components/SiteFooter";

import { useState } from "react";

// ─────────────────────────────────────────────────────────────
// PAGE RACINE  /  →  Waitlist
// ─────────────────────────────────────────────────────────────

type WaitlistStep = "email" | "qualify" | "success";

const ACTIVITIES = [
  "Freelance / Développeur web",
  "Agence web / Marketing digital",
  "Consultant indépendant",
  "Commercial / Business Developer",
  "Étudiant / En reconversion",
  "Autre",
];

const PRICES = [
  { value: "99", label: "99 €/mois",        sub: "Fonctionnalités complètes" },
  { value: "49", label: "49 €/mois",        sub: "Bon rapport qualité/prix"  },
  { value: "19", label: "19 €/mois",        sub: "Je débute, je veux tester" },
  { value: "0",  label: "Gratuit seulement",sub: "Je ne paie pas pour ça"   },
];

interface FormData {
  email: string; firstName: string; lastName: string;
  activity: string; price: string;
}

// ── Waitlist Form (3 étapes) ──────────────────────────────────
function WaitlistForm({ size = "inline" }: { size?: "hero" | "inline" }) {
  const [step, setStep]   = useState<WaitlistStep>("email");
  const [form, setForm]   = useState<FormData>({ email: "", firstName: "", lastName: "", activity: "", price: "" });
  const [loading, setLoading] = useState(false);

  const isHero = size === "hero";

  if (step === "email") {
    return (
      <form onSubmit={(e) => { e.preventDefault(); if (form.email) setStep("qualify"); }} className="space-y-3">
        <div className="flex gap-2.5">
          <input type="email" required value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="ton@email.com"
            className={`flex-1 bg-white border border-slate-200 rounded-xl px-4 ${isHero ? "py-4 text-base" : "py-3 text-sm"} text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 shadow-sm transition-all`}
          />
          <button type="submit"
            className={`bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl ${isHero ? "px-7 py-4 text-base" : "px-5 py-3 text-sm"} shadow-lg shadow-blue-600/25 transition-all cursor-pointer whitespace-nowrap`}>
            Rejoindre →
          </button>
        </div>
        <p className="text-xs text-slate-400">Gratuit pour les premiers · Pas de spam · Désabonnement en 1 clic</p>
      </form>
    );
  }

  if (step === "qualify") {
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!form.firstName || !form.activity || !form.price) return;
      setLoading(true);
      try {
        await fetch("/api/waitlist", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
      } catch { /* on affiche le succès quoi qu'il arrive */ }
      setLoading(false);
      setStep("success");
    };

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm" onClick={() => setStep("email")} />
        <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-2xl p-8 overflow-hidden max-h-[90vh] overflow-y-auto">
          <div className="absolute -top-16 -right-16 w-56 h-56 bg-blue-500/8 rounded-full blur-3xl pointer-events-none" />

          <div className="relative flex items-start justify-between mb-6">
            <div>
              <p className="text-xs font-bold tracking-widest uppercase text-blue-600 mb-1">Profil de qualification</p>
              <h2 className="text-xl font-bold text-slate-900">Dernière étape.</h2>
              <p className="text-sm text-slate-500 mt-1">Les profils qualifiés passent en premier.</p>
            </div>
            <button onClick={() => setStep("email")} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 cursor-pointer">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="relative space-y-4">
            {/* Email readonly */}
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
              <svg className="w-4 h-4 text-blue-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <span className="text-sm text-slate-700 font-medium">{form.email}</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Prénom *", key: "firstName", ph: "Jean",   req: true  },
                { label: "Nom",      key: "lastName",  ph: "Dupont", req: false },
              ].map(({ label, key, ph, req }) => (
                <div key={key}>
                  <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wide">{label}</label>
                  <input type="text" required={req} placeholder={ph}
                    value={form[key as keyof FormData]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 shadow-sm transition-all" />
                </div>
              ))}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wide">Activité *</label>
              <select required value={form.activity} onChange={(e) => setForm({ ...form, activity: e.target.value })}
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 shadow-sm appearance-none cursor-pointer">
                <option value="">Sélectionne ton profil…</option>
                {ACTIVITIES.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">Ce que tu paierais *</label>
              <div className="grid grid-cols-2 gap-2">
                {PRICES.map(p => (
                  <label key={p.value} className={`relative flex flex-col p-3 rounded-xl border cursor-pointer transition-all ${form.price === p.value ? "border-blue-500 bg-blue-50/80" : "border-slate-200 hover:border-slate-300"}`}>
                    <input type="radio" name="price" value={p.value} checked={form.price === p.value} onChange={() => setForm({ ...form, price: p.value })} className="sr-only" />
                    <span className={`text-sm font-bold ${form.price === p.value ? "text-blue-600" : "text-slate-800"}`}>{p.label}</span>
                    <span className="text-xs text-slate-400 mt-0.5">{p.sub}</span>
                    {form.price === p.value && (
                      <div className="absolute top-2.5 right-2.5 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                        <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      </div>
                    )}
                  </label>
                ))}
              </div>
            </div>

            <button type="submit" disabled={loading || !form.firstName || !form.activity || !form.price}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold rounded-xl py-3.5 text-sm shadow-lg shadow-blue-600/25 transition-all cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-1">
              {loading ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Envoi…</> : "Confirmer mon profil →"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Succès
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm" />
      <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-2xl p-8 text-center overflow-hidden">
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-72 h-56 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative w-16 h-16 mx-auto mb-5">
          <div className="absolute inset-0 bg-blue-50 rounded-2xl" />
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <div className="absolute inset-0 rounded-2xl border-2 border-blue-300/50 animate-ping" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-3">Profil reçu. 🎯</h2>
        {form.firstName && <p className="text-blue-600 font-semibold mb-2">Bonjour {form.firstName} !</p>}
        <p className="text-slate-600 text-sm leading-relaxed mb-5">
          Votre profil est en cours d&apos;analyse. Nous libérons <span className="font-bold text-slate-900">10 accès privés par jour</span> en priorité aux profils les plus qualifiés.
        </p>
        <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 mb-5 text-left">
          <div className="flex gap-2.5">
            <span className="flex-shrink-0">⚡</span>
            <p className="text-xs text-amber-700 leading-relaxed">L&apos;email d&apos;accès part chaque matin à 9h. Vérifie tes spams si tu ne reçois rien dans 48h.</p>
          </div>
        </div>
        <button onClick={() => { setStep("email"); setForm({ email: "", firstName: "", lastName: "", activity: "", price: "" }); }}
          className="w-full border border-slate-200 hover:border-slate-300 text-slate-600 font-medium rounded-xl py-3 text-sm transition-all cursor-pointer">
          ← Retour sur le site
        </button>
      </div>
    </div>
  );
}

// ── Navbar Waitlist ───────────────────────────────────────────
function WaitlistNavbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-lg border-b border-slate-100/80">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-8">
        <a href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/30">
            <svg className="w-[18px] h-[18px] text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
          </div>
          <span className="font-bold text-slate-900">LocalLeads</span>
          <span className="hidden sm:inline text-xs text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full font-semibold">Bêta</span>
        </a>

        <nav className="hidden lg:flex items-center gap-6">
          {[
            { label: "Comment ça marche", href: "#how-it-works" },
            { label: "Opportunités",      href: "#use-cases"   },
            { label: "Témoignages",       href: "#testimonials"},
            { label: "FAQ",               href: "#faq"         },
          ].map(l => (
            <a key={l.href} href={l.href} className="text-sm text-slate-500 hover:text-slate-900 transition-colors font-medium">{l.label}</a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {/* ← BOUTON "Accéder à l'app" */}
          <a href="/home" className="text-sm font-medium text-slate-600 hover:text-slate-900 border border-slate-200 hover:border-slate-300 px-4 py-2 rounded-xl transition-all">
            Accéder à l&apos;app
          </a>
          <a href="#top" className="text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 px-5 py-2.5 rounded-xl transition-all shadow-md shadow-blue-600/20">
            Accès anticipé →
          </a>
        </div>
      </div>
    </header>
  );
}

// ── Page principale ───────────────────────────────────────────
export default function WaitlistPage() {
  return (
    <div id="top" className="min-h-screen bg-white">
      <WaitlistNavbar />

      <main>
        {/* Hero */}
        <section className="relative pt-32 pb-8 px-6 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="relative max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-blue-100 text-blue-700 text-xs font-semibold px-4 py-2 rounded-full mb-7 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              Accès Anticipé · Seulement 10 places par jour
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-[4.5rem] font-bold tracking-tight text-slate-900 leading-[1.05] mb-5">
              Trouve des clients<br /><span className="text-blue-600">que personne</span><br />ne contacte encore.
            </h1>
            <p className="text-lg sm:text-xl text-slate-500 font-light max-w-xl mx-auto leading-relaxed mb-10">
              LocalLeads scanne Google Maps et isole les entreprises sans site web, avec une mauvaise réputation ou des avis ignorés.{" "}
              <span className="text-slate-800 font-medium">Tu arrives avec la solution. Ils signent.</span>
            </p>
            <div className="max-w-lg mx-auto mb-8" id="waitlist">
              <WaitlistForm size="hero" />
            </div>
            {/* Réassurance */}
            <div className="flex flex-wrap items-center justify-center gap-5 text-sm text-slate-500">
              <div className="flex items-center gap-1.5">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                ))}
                <span className="font-semibold text-slate-700 ml-1">4.9/5</span>
                <span className="text-slate-400">· bêta-testeurs</span>
              </div>
              <span className="text-slate-200">|</span>
              <span className="text-xs text-slate-400 flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                Données sécurisées · Pas de spam
              </span>
            </div>
          </div>
        </section>

        {/* Preview dashboard */}
        <section className="max-w-5xl mx-auto px-6 pb-20">
          <div className="bg-white border border-slate-200/80 rounded-3xl shadow-2xl shadow-slate-200/60 overflow-hidden">
            <div className="bg-slate-50 border-b border-slate-100 px-5 py-3 flex items-center gap-3">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400/70" />
                <div className="w-3 h-3 rounded-full bg-amber-400/70" />
                <div className="w-3 h-3 rounded-full bg-emerald-400/70" />
              </div>
              <div className="bg-white border border-slate-200 rounded-lg px-3 py-1 text-xs text-slate-500 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Plombiers · Lyon · <strong className="text-slate-700">43 résultats</strong>
                <span className="ml-1 text-emerald-600 font-semibold">31 prospects</span>
              </div>
            </div>
            <div className="grid grid-cols-[1fr_130px_80px_140px] gap-4 px-5 py-2.5 border-b border-slate-100 bg-slate-50/50">
              {["Entreprise", "Ville", "Note", "Statut"].map(h => (
                <span key={h} className="text-xs font-bold text-slate-400 uppercase tracking-wider">{h}</span>
              ))}
            </div>
            {[
              { name: "Plomberie Durand & Fils", city: "Lyon 69003",    cat: "Plombier",    rating: 4.1, badge: "no-website" },
              { name: "Électricité Martin",       city: "Bordeaux 33000",cat: "Électricien", rating: 2.8, badge: "bad-rep"   },
              { name: "Coiffure Isabelle B.",     city: "Nantes 44000",  cat: "Coiffeur",    rating: 4.6, badge: "no-website" },
              { name: "Boulangerie Moreau 1897",  city: "Lille 59000",   cat: "Boulanger",   rating: 3.2, badge: "bad-rep"   },
            ].map((l, i) => (
              <div key={i} className="grid grid-cols-[1fr_130px_80px_140px] gap-4 px-5 py-3.5 items-center border-b border-slate-50">
                <div>
                  <p className="text-sm font-semibold text-slate-800">{l.name}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{l.cat}</p>
                </div>
                <p className="text-xs text-slate-500">{l.city}</p>
                <span className={`font-mono text-sm font-bold ${l.rating >= 4 ? "text-amber-500" : l.rating >= 3 ? "text-amber-600" : "text-red-500"}`}>★ {l.rating}</span>
                {l.badge === "no-website"
                  ? <span className="inline-flex items-center gap-1 text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />Sans site web</span>
                  : <span className="inline-flex items-center gap-1 text-xs font-semibold bg-orange-50 text-orange-700 border border-orange-200 px-2.5 py-1 rounded-full"><span className="w-1.5 h-1.5 rounded-full bg-orange-500" />E-réputation ↓</span>}
              </div>
            ))}
            <div className="relative h-16 flex items-end justify-center pb-3">
              <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-transparent" />
              <p className="relative text-xs text-slate-400">+ 38 prospects · Accès complet après inscription</p>
            </div>
          </div>
        </section>

        {/* Comment ça marche */}
        <section id="how-it-works" className="px-6 py-20 max-w-6xl mx-auto border-t border-slate-100">
          <div className="flex items-center gap-4 mb-14">
            <div className="h-px flex-1 bg-slate-100" />
            <p className="text-xs font-bold tracking-widest uppercase text-slate-400 px-4">Comment ça marche</p>
            <div className="h-px flex-1 bg-slate-100" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { step: "01", label: "Ciblez",    icon: "🔍", headline: "Un métier. Une ville.", body: "Tu tapes « Électricien Bordeaux ». On interroge Google Maps et te ramène tout ce qu'il sait sur les pros locaux.", detail: "Jusqu'à 60 résultats par recherche" },
              { step: "02", label: "Filtrez",   icon: "🎯", headline: "Seulement les bons prospects.", body: "Active les filtres : sans site web, note < 3 étoiles, téléphone manquant. Chaque filtre = une offre précise.", detail: "Sans site · E-réputation · Sans téléphone" },
              { step: "03", label: "Exportez",  icon: "📥", headline: "Ta liste en 1 clic.", body: "CSV ou Excel. Nom, téléphone, adresse, note Google. Prêt pour tes emails de prospection ou tes prompts IA.", detail: "Format CSV · Excel · Prêt pour Claude" },
            ].map((s, i) => (
              <div key={i} className="group relative bg-white border border-slate-100 hover:border-blue-100 rounded-3xl p-8 shadow-sm hover:shadow-md transition-all duration-300">
                <span className="text-6xl font-black text-slate-50 absolute top-6 right-8 select-none group-hover:text-blue-50 transition-colors">{s.step}</span>
                <div className="w-11 h-11 rounded-2xl bg-blue-600 flex items-center justify-center text-white text-xl mb-6 shadow-lg shadow-blue-600/20 group-hover:scale-105 transition-transform">{s.icon}</div>
                <p className="text-xs font-bold tracking-widest uppercase text-blue-600 mb-2">{s.label}</p>
                <h3 className="text-lg font-bold text-slate-900 leading-snug mb-3">{s.headline}</h3>
                <p className="text-sm text-slate-500 leading-relaxed mb-6">{s.body}</p>
                <div className="border-t border-slate-100 pt-4"><p className="text-xs text-slate-400">{s.detail}</p></div>
              </div>
            ))}
          </div>
        </section>

        {/* Opportunités */}
        <section id="use-cases" className="px-6 py-20 max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-bold tracking-widest uppercase text-blue-600 mb-3">Potentiel de gains</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mb-4">Ce que tu peux gagner.</h2>
            <p className="text-slate-500 max-w-xl mx-auto">Chaque filtre révèle un problème que tu peux résoudre et facturer.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { emoji: "🌐", badge: "Sans site web",        badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200", title: "Crée et vends des sites web",         body: "Un plombier sans site rate 70% de ses demandes. Tu génères un site pro avec l'IA en 10 min. Tu factures 600–1 500 €.", gain: "600 – 1 500 €",    sub: "par vente · ~30 min de travail" },
              { emoji: "⭐", badge: "E-réputation en danger",badgeClass: "bg-orange-50 text-orange-700 border-orange-200",  title: "Vends la gestion des avis",          body: "Un restaurant à 2,8★ avec 90 avis sans réponse perd des clients. Forfait mensuel pour répondre et remonter la note.", gain: "150 – 300 €/mois", sub: "abonnement récurrent" },
              { emoji: "📋", badge: "Fiche incomplète",     badgeClass: "bg-blue-50 text-blue-700 border-blue-200",         title: "Optimise les fiches Google",         body: "Pas de téléphone, pas d'horaires = client perdu. Mise à jour en 20 min. 50 à 200 € le forfait.", gain: "50 – 200 €",       sub: "par fiche · sans technique" },
            ].map((c, i) => (
              <div key={i} className="bg-white border border-slate-100 hover:border-slate-200 rounded-3xl p-7 shadow-sm hover:shadow-md transition-all flex flex-col">
                <div className="flex items-start justify-between mb-5">
                  <span className="text-3xl">{c.emoji}</span>
                  <span className={`text-xs font-bold border px-2.5 py-1 rounded-full ${c.badgeClass}`}>{c.badge}</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-3">{c.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed flex-1 mb-6">{c.body}</p>
                <div className="border-t border-slate-100 pt-5">
                  <p className="text-2xl font-black text-slate-900 font-mono">{c.gain}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{c.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Témoignages */}
        <section id="testimonials" className="px-6 py-20 max-w-6xl mx-auto border-t border-slate-100">
          <div className="text-center mb-12">
            <p className="text-xs font-bold tracking-widest uppercase text-blue-600 mb-3">Bêta-testeurs</p>
            <h2 className="text-3xl font-bold text-slate-900">Ils l&apos;ont testé avant toi.</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { text: "J'ai trouvé 34 plombiers sans site web à Lyon en 5 minutes. J'ai signé mon premier client à 800 € la semaine suivante.", author: "Maxime K.",  sub: "Freelance web · Lyon",          initials: "MK", color: "bg-blue-500"   },
              { text: "Cibler les commerces avec de mauvais avis pour vendre de la réputation, j'y avais jamais pensé. C'est maintenant mon offre principale.", author: "Amélie S.", sub: "Consultante digitale · Bordeaux", initials: "AS", color: "bg-violet-500" },
              { text: "Avant je passais 2h à chercher des prospects sur Google Maps à la main. Maintenant c'est 3 minutes pour une liste complète.", author: "Jordan D.", sub: "Agence locale · Nantes",          initials: "JD", color: "bg-emerald-500"},
            ].map((t, i) => (
              <div key={i} className="bg-white border border-slate-100 hover:border-slate-200 rounded-3xl p-7 shadow-sm hover:shadow-md transition-all flex flex-col">
                <div className="flex gap-0.5 mb-5">
                  {[...Array(5)].map((_, s) => <svg key={s} className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>)}
                </div>
                <p className="text-sm text-slate-600 leading-relaxed flex-1 mb-6">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-3 border-t border-slate-50 pt-5">
                  <div className={`w-9 h-9 rounded-full ${t.color} flex items-center justify-center text-xs font-bold text-white`}>{t.initials}</div>
                  <div><p className="text-sm font-bold text-slate-800">{t.author}</p><p className="text-xs text-slate-400">{t.sub}</p></div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <FAQSection />

        {/* Bottom CTA */}
        <section className="px-6 py-20 max-w-6xl mx-auto">
          <div className="relative bg-gradient-to-br from-blue-600 to-blue-700 rounded-3xl p-12 overflow-hidden text-center shadow-2xl shadow-blue-600/30">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-400/20 rounded-full blur-2xl pointer-events-none" />
            <div className="relative">
              <div className="inline-flex items-center gap-2 bg-white/15 border border-white/20 text-white/90 text-xs font-semibold px-3.5 py-1.5 rounded-full mb-8">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />10 accès par jour · Par ordre d&apos;arrivée
              </div>
              <h2 className="text-3xl sm:text-5xl font-bold text-white leading-tight mb-5">
                Rejoins la liste.<br /><span className="text-blue-200">Trouve ton premier client cette semaine.</span>
              </h2>
              <a href="#top" className="inline-block bg-white text-blue-600 font-bold rounded-xl px-8 py-4 text-base hover:bg-blue-50 transition-all shadow-lg">
                Rejoindre la liste d&apos;attente →
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <SiteFooter />
    </div>
  );
}

// ── FAQ ───────────────────────────────────────────────────────
function FAQSection() {
  const [open, setOpen] = useState<number | null>(null);
  const FAQS = [
    { q: "C'est quoi LocalLeads ?",             a: "Un outil SaaS qui scanne Google Maps pour trouver des entreprises locales avec des problèmes de présence en ligne : pas de site, mauvaise note, avis sans réponse. Tu reçois une liste de prospects qualifiés à contacter." },
    { q: "Est-ce que j'ai besoin de compétences techniques ?", a: "Non. Tu tapes un métier et une ville, tu actives des filtres, tu télécharges une liste. Zéro code requis." },
    { q: "D'où viennent les données ?",          a: "De Google Maps via une API. On récupère les infos publiques : nom, adresse, téléphone, note, avis, et URL du site si renseignée." },
    { q: "Combien puis-je trouver de prospects ?", a: "40 à 60 résultats par recherche. Tu peux lancer autant de recherches que tu veux sur des métiers et villes différents." },
    { q: "Combien ça va coûter ?",               a: "On n'a pas arrêté le prix définitif. Les premiers inscrits bénéficieront d'un tarif early-adopter fortement réduit." },
  ];
  return (
    <section id="faq" className="px-6 py-20 max-w-3xl mx-auto border-t border-slate-100">
      <div className="text-center mb-12">
        <p className="text-xs font-bold tracking-widest uppercase text-blue-600 mb-3">FAQ</p>
        <h2 className="text-3xl font-bold text-slate-900">Questions fréquentes.</h2>
      </div>
      <div className="space-y-3">
        {FAQS.map((faq, i) => (
          <div key={i} className={`border rounded-2xl overflow-hidden transition-all ${open === i ? "border-blue-200 shadow-sm" : "border-slate-100 hover:border-slate-200"}`}>
            <button onClick={() => setOpen(open === i ? null : i)} className="w-full flex items-center justify-between px-6 py-4 text-left cursor-pointer group">
              <span className={`text-sm font-semibold pr-4 transition-colors ${open === i ? "text-blue-600" : "text-slate-800 group-hover:text-slate-900"}`}>{faq.q}</span>
              <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all ${open === i ? "bg-blue-600 rotate-45" : "bg-slate-100 group-hover:bg-slate-200"}`}>
                <svg className={`w-3.5 h-3.5 ${open === i ? "text-white" : "text-slate-500"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
              </div>
            </button>
            <div className={`overflow-hidden transition-all duration-300 ${open === i ? "max-h-48 opacity-100" : "max-h-0 opacity-0"}`}>
              <p className="px-6 pb-5 text-sm text-slate-500 leading-relaxed border-t border-slate-100 pt-4">{faq.a}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}