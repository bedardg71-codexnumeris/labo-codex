# Plan — Export des résultats finaux (CSV + PDF)

**Date** : 10 juin 2026
**Statut** : Cadrage complet (Cowork), implémentation non démarrée
**Origine** : Demande de Grégoire — pouvoir exporter les résultats finaux des élèves en CSV et PDF, en présentant clairement la pratique de notation en vigueur et la construction de la note finale.
**Dépendances** : s'appuie sur #303 Session C (signature paramétrable `calculerDetailsNoteFinale(da, pratiqueId)`). Coordination requise avec #329 (Voûte) : **ne pas passer par `import-export.js`** — module d'export dédié.

---

## 1. Décisions de cadrage (actées avec Grégoire, 10 juin 2026)

| Question | Décision |
|----------|----------|
| Destinataires | (a) **Archives personnelles** de l'enseignant (trace de fin de trimestre) ; (b) **l'étudiant lui-même** (bulletin individuel transparent sur la construction de sa note). |
| Couverture des pratiques | **Les 4 familles** (SOM, STD, SPE, DEN) via une API de décomposition unifiée sur l'interface IPratique. Pas de cas particulier STD déguisé en fonctionnalité générale. |
| Contenu au-delà de la note | **Détail par production** (note, niveau IDME, rôle dans le calcul) + **récit narratif** du calcul. Pas d'indices A-C-P (données de dépistage, pas de sanction — hors périmètre d'un document de résultats). |
| Pratique en vigueur | En-tête compact obligatoire : nom, code, famille, principe de calcul en 1-2 phrases (exigence initiale de la demande). |
| Anonymisation | **Non** — export nominatif seulement, usage local légitime. L'anonymisation Codex data couvre déjà le partage recherche. |

---

## 2. Le nœud conceptuel : la décomposition varie par famille

« Comment la note est construite » signifie quatre choses différentes :

| Famille | Nature de la construction | Présentation |
|---------|---------------------------|--------------|
| SOM | Moyenne pondérée production × note × pondération | Tableau + total |
| STD | Portfolio : artefacts retenus, obligatoires, terminale, pondérations | Tableau + récit (existe déjà via `calculerDetailsNoteFinale`) |
| SPE | Bundles tout-ou-rien par palier atteint (seuils) | Liste des paliers avec statut conforme/non conforme, palier atteint |
| DEN | Note saisie/suggérée par l'enseignant, garde « cibles atteintes » | Jugement global + état des cibles ; **rien à décomposer arithmétiquement** — le document doit l'assumer, pas simuler un calcul |

Conséquence : le prérequis du chantier est une méthode d'interface que chaque famille implémente à sa manière.

---

## 3. Lot 1 — API unifiée de décomposition

**Nouvelle méthode IPratique** : `obtenirDecompositionNoteFinale(da)` → structure commune :

```js
{
  noteFinale: 79.2,            // ou null (DEN sans saisie)
  estProvisoire: true,          // trimestre non complété / saisies manquantes
  pratique: { id, code, nom, famille, principe },  // principe = 1-2 phrases
  lignes: [                     // détail par production, sémantique selon famille
    { production, note, niveauIDME, role, ponderation }
    // role : 'retenu-portfolio' | 'obligatoire' | 'terminale' | 'pondere' |
    //        'bundle-palier-X' | 'cible' | 'exclu' ...
  ],
  recit: '...'                  // narration du calcul (réutiliser le pattern STD)
}
```

**Implémentations** :
- STD : adapter/absorber `calculerDetailsNoteFinale` (`js/profil-etudiant-actions.js:411`).
- SOM : nouvelle décomposition (productions × pondérations × notes — le total existe, pas le détail).
- SPE : paliers, bundles, seuils, palier atteint.
- DEN : note saisie, jugement, cibles atteintes (`denotation-jugements.js`).

**Zéro-dette** : migrer le caller du profil étudiant (panneau « Note finale de session ») vers la nouvelle API et **retirer** le chemin STD-only dans la même session. Auditer les call-sites avant (`grep calculerDetailsNoteFinale`).

**Tests Vitest** (`tests/unit/`) : une décomposition par famille sur données synthétiques ; invariant lecture seule (aucune écriture dans les clés du trimestre) ; cohérence noteFinale ↔ somme des lignes pour SOM/STD.

---

## 4. Lot 2 — Export CSV (archives)

**Module dédié** : `js/export-resultats-finaux.js` (CSV + orchestration ; modèle : `exporterCSV()` de `comparateur-pratiques.js:724`).

Deux fichiers (la décomposition variant par pratique, un seul tableau large serait illisible) :

1. **Synthèse** — 1 ligne/étudiant : `DA, nom, prénom, groupe, cours, trimestre, pratique (code+nom), note finale, statut (provisoire/final)`.
2. **Détail** — format long, 1 ligne/étudiant×production : `DA, nom, production, note, niveau IDME, rôle, pondération`.

**Sécurité CSV** : échappement RFC 4180 (guillemets, virgules, sauts de ligne) + **protection injection de formules** (préfixer `'` toute cellule commençant par `=`, `+`, `-`, `@` — les CSV s'ouvrent dans Excel/Numbers).

---

## 5. Lot 3 — Export PDF

**Infrastructure** : jsPDF + jspdf-autotable (modèle : `export-pdf.js`, réutiliser réglages `CLE_REGLAGES_PDF` et pied de page existants). Pas de html2canvas : contenu tabulaire/textuel, autotable suffit et reste sélectionnable/léger.

**Deux modes**, partageant le même rendu de « bloc étudiant » :

1. **Rapport de groupe** (archives) : page de garde (cours, groupe, trimestre, enseignant, date, **encadré pratique en vigueur**) → tableau synthèse du groupe → un bloc par étudiant (détail + récit).
2. **Bulletin individuel** (remise à l'étudiant) : 1 étudiant = 1 PDF — en-tête cours/trimestre, encadré pratique (vocabulaire accessible à l'élève), détail par production, récit narratif, note finale, mention « provisoire » le cas échéant. Génération en lot : N PDF dans un ZIP (JSZip déjà en `libs/`). **Aucune donnée d'un autre étudiant ne doit figurer dans un bulletin individuel.**

**Mention obligatoire** sur tout document provisoire (trimestre non complété).

---

## 6. Lot 4 — Point d'entrée UI + finitions

- Emplacement proposé (à valider avec Grégoire) : tableau de bord, onglet Suivi — panneau « Résultats finaux » avec boutons « Exporter CSV » / « PDF groupe » / « Bulletins étudiants ». Pas de nouvelle vue complète ni de modale lourde.
- `design-system.html` + variables CSS, deux modes (sombre/clair), cibles tactiles ≥ 44 px (iPad), focus visible.
- Handlers via `data-action` (zéro inline), `echapperHtml()` sur tout nom affiché.
- Changelog (`js/changelog-data.js`) : 1 item utilisateur. Version : `minor` (nouveauté sans rupture).
- Doc : entrée dans `docs/modules/` si convention applicable.

---

## 7. Contraintes transversales

- **Lecture seule** : l'export ne modifie jamais les données du trimestre.
- **Données nominatives** : restent sur la machine (SKILL_Securite_donnees §9) ; pas de passage par la Voûte ni `import-export.js`.
- **CSP `script-src 'self'`** : uniquement les libs locales (jsPDF, JSZip déjà présents). Aucune nouvelle dépendance.
- **console.warn/error** uniquement ; retirer les `console.log` avant commit.
- **Sources canoniques** : `obtenirPratiqueParId` (`pratique-registre.js:487`), config portfolio via `pratiquesConfigurables` (post-Session C Lot 2), clés via `window.cle()`.

---

## 8. Risques et questions ouvertes

1. **DEN** : si aucune note saisie, le document doit afficher un état explicite (« note non encore arrêtée »), pas un zéro.
2. **SPE** : la présentation des paliers/bundles n'a pas de précédent visuel dans l'app — prévoir une validation visuelle avec Grégoire avant de finaliser le gabarit PDF.
3. **#328 (SSOT modalitesEvaluation, L2-L3 restants)** : lire via l'API du module propriétaire `js/pratiques/modalites-evaluation.js`, jamais en accès direct — sinon le chantier #328 cassera l'export.
4. **Emplacement UI** (§6) : hypothèse de travail, à confirmer.
5. **Pratiques configurables** (`PratiqueConfigurable`) : vérifier que la décomposition fonctionne aussi pour les pratiques créées par l'utilisateur, pas seulement les 4 du registre.

---

## 9. Ordre d'exécution suggéré pour Claude Code

1. Rituel de début de session (`SKILL_Debut_de_session.md`) + charger `SKILL_labo_codex.md`, `SKILL_pratiques_notation.md` (obligatoire — chantier touchant le calcul de la note).
2. Lot 1 (API + migration + tests) — **valider fonctionnellement avant de continuer**.
3. Lot 2 (CSV) — validation sur données réelles du trimestre H2026.
4. Lot 3 (PDF) — validation visuelle des deux modes, Mac et iPad.
5. Lot 4 (UI + changelog + release `minor`).

Chaque lot = session distincte possible ; un fichier à la fois, validation avant le suivant (procédure CLAUDE.md).
