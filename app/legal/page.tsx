export const metadata = {
  title: "Mentions légales — LocalLeads",
};

import SiteFooter from "@/components/SiteFooter";

export default function LegalPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="border-b border-slate-100 px-6 py-5">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <a href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center">
              <svg className="w-[18px] h-[18px] text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
            </div>
            <span className="font-bold text-slate-900">LocalLeads</span>
          </a>
          <a href="/" className="text-sm text-slate-500 hover:text-slate-700 transition-colors">← Retour à l&apos;accueil</a>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-14 prose prose-slate flex-1 w-full">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">Mentions légales</h1>

        <section className="mb-8">
          <h2 className="text-lg font-bold text-slate-900 mb-2">1. Éditeur du site</h2>
          <p className="text-slate-600 text-sm leading-relaxed">
            Le site LocalLeads est édité par : <strong>[Nom / raison sociale à compléter]</strong>, [statut
            juridique — auto-entrepreneur / SASU / etc.], immatriculé sous le numéro SIRET [à compléter],
            dont le siège est situé [adresse à compléter].
            <br />
            Responsable de la publication : Noé Grancho.
            <br />
            Contact : <a href="mailto:noegrancho@gmail.com" className="text-blue-600 hover:underline">noegrancho@gmail.com</a>
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-bold text-slate-900 mb-2">2. Hébergement</h2>
          <p className="text-slate-600 text-sm leading-relaxed">
            Le site est hébergé par Vercel Inc., 340 S Lemon Ave #4133, Walnut, CA 91789, USA.
            <br />
            Les données applicatives (comptes, profils, résultats) sont hébergées par Supabase Inc.
            <br />
            Les paiements sont traités par Stripe Payments Europe, Ltd.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-bold text-slate-900 mb-2">3. Propriété intellectuelle</h2>
          <p className="text-slate-600 text-sm leading-relaxed">
            L&apos;ensemble des éléments du site (textes, design, logo, code) est protégé par le droit
            d&apos;auteur. Toute reproduction, même partielle, est interdite sans autorisation préalable.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-bold text-slate-900 mb-2">4. Données personnelles</h2>
          <p className="text-slate-600 text-sm leading-relaxed">
            Les informations collectées via la waitlist, le formulaire de contact ou lors de la création
            d&apos;un compte (email, nom, activité) sont utilisées uniquement pour la gestion de votre
            accès au service et la relation client. Elles ne sont ni vendues ni cédées à des tiers.
            Conformément au RGPD, vous disposez d&apos;un droit d&apos;accès, de rectification et de
            suppression de vos données, exerçable à l&apos;adresse{" "}
            <a href="mailto:noegrancho@gmail.com" className="text-blue-600 hover:underline">noegrancho@gmail.com</a>{" "}
            ou via le <a href="/contact" className="text-blue-600 hover:underline">formulaire de contact</a>.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-bold text-slate-900 mb-2">5. Cookies</h2>
          <p className="text-slate-600 text-sm leading-relaxed">
            Le site utilise uniquement des cookies techniques nécessaires à l&apos;authentification
            (Supabase Auth) et à la session Stripe Checkout. Aucun cookie publicitaire ou de tracking
            tiers n&apos;est utilisé.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-slate-900 mb-2">6. Contact</h2>
          <p className="text-slate-600 text-sm leading-relaxed">
            Pour toute question, réclamation ou demande relative à ces mentions légales, utilisez notre{" "}
            <a href="/contact" className="text-blue-600 hover:underline">formulaire de contact</a>.
          </p>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}