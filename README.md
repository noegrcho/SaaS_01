# LocalLeads 🎯

> Trouve des entreprises locales sans site web. Génère tes leads qualifiés en 30 secondes.

## Stack technique

- **Next.js 14** (App Router) — Frontend + API Routes serverless
- **Tailwind CSS** — Styling
- **Zustand** — State management (résultats + filtres)
- **SerpAPI** — Source de données Google Maps (100 req/mois gratuit)
- **xlsx** — Export Excel natif côté client

---

## Démarrage rapide (local)

### 1. Cloner et installer

```bash
git clone <ton-repo>
cd local-leads
npm install
```

### 2. Configurer les variables d'environnement

```bash
cp .env.example .env.local
```

Ouvre `.env.local` et remplis :

```env
SERPAPI_KEY=ta_clé_serpapi_ici
```

> **Sans clé SerpAPI**, l'app tourne en **mode démo** avec des données fictives.
> Obtiens une clé gratuite (100 req/mois) sur [serpapi.com](https://serpapi.com)

### 3. Lancer en développement

```bash
npm run dev
```

Ouvre [http://localhost:3000](http://localhost:3000)

---

## Déploiement sur Vercel (gratuit)

### Option A — Via CLI

```bash
npm i -g vercel
vercel login
vercel --prod
```

Lors du déploiement, Vercel te demandera tes variables d'environnement. Ajoute `SERPAPI_KEY`.

### Option B — Via l'interface Vercel

1. Push ton code sur GitHub
2. Va sur [vercel.com](https://vercel.com) → "New Project"
3. Importe ton repo
4. Dans **Environment Variables**, ajoute `SERPAPI_KEY`
5. Deploy 🚀

---

## Architecture du projet

```
local-leads/
├── app/
│   ├── page.tsx                    # Page principale
│   ├── layout.tsx                  # Layout racine
│   ├── globals.css
│   └── api/
│       ├── search/route.ts         # POST /api/search → SerpAPI
│       └── check-website/route.ts  # POST /api/check-website → HEAD request
│
├── components/
│   ├── SearchForm.tsx              # Formulaire métier + ville
│   ├── FilterPanel.tsx             # Filtres dynamiques (extensible)
│   ├── ResultsTable.tsx            # Tableau des résultats
│   └── ExportButton.tsx            # Export CSV / Excel
│
├── lib/
│   ├── types.ts                    # Types TypeScript (Business, FilterConfig)
│   ├── filters.ts                  # Logique de filtrage (fonctions pures)
│   ├── parsers.ts                  # Parsing SerpAPI + Mock data
│   └── export.ts                   # CSV et Excel
│
└── store/
    └── useLeadsStore.ts            # Zustand store global
```

---

## Ajouter un nouveau filtre (5 minutes)

L'architecture est conçue pour ça. Exemple : "Moins de 5 avis".

**1. `lib/types.ts`** — Ajoute le champ dans `FilterConfig` :
```ts
reviewCountMax: number | null; // déjà présent ✅
```

**2. `lib/filters.ts`** — La fonction de filtre existe déjà :
```ts
const filterMaxReviews = (b: Business, max: number): boolean => ...
```

**3. `components/FilterPanel.tsx`** — Ajoute le composant UI :
```tsx
<FilterToggle
  label="Moins de 5 avis"
  checked={filters.reviewCountMax === 5}
  onChange={(v) => updateFilter("reviewCountMax", v ? 5 : null)}
/>
```

C'est tout. Le store et le tableau se mettent à jour automatiquement.

---

## Roadmap

### MVP (actuel)
- [x] Recherche par métier + ville
- [x] Filtrage "sans site web"
- [x] Export CSV + Excel
- [x] Mode démo (sans clé API)
- [x] Filtres : note, téléphone, e-réputation

### Phase 2
- [ ] Auth utilisateur (Supabase)
- [ ] Limite de recherches par plan (freemium)
- [ ] Génération de site web en 1 clic via Claude API
- [ ] Historique des recherches
- [ ] Vérification active des sites web (batch)

---

## Limites du MVP

| Contrainte | Solution |
|---|---|
| SerpAPI gratuit = 100 req/mois | Suffit pour tester. Passe sur le plan $50/mois quand rentable. |
| Google Maps peut changer son format | Le parser `lib/parsers.ts` est isolé, facile à mettre à jour |
| Pas d'auth utilisateur | À ajouter en Phase 2 avec Supabase (gratuit jusqu'à 50k MAU) |
