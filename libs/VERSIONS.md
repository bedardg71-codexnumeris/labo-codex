# Librairies tierces vendored — Labo Codex

> **Dernière vérification** : 25 mai 2026
> **Stratégie** : libs incluses directement dans le dépôt (`libs/*.min.js`)
> pour préserver le fonctionnement 100 % hors-ligne. Pas de CDN runtime,
> pas de bundler, pas de `package.json` à la racine.
> **Référence audit** : `PLAN-MOYEN-TERME` §5.4 (hygiène licences).

---

## 1. Pourquoi vendored ?

Labo Codex tourne entièrement côté client sans serveur applicatif et doit
fonctionner offline. Les 7 librairies tierces sont donc **incluses
directement** dans `libs/`, plutôt que chargées depuis un CDN. Conséquence :

- Les bumps de version sont **manuels** (téléchargement + remplacement).
- Aucune surveillance automatique par Dependabot (Dependabot ne couvre que
  les écosystèmes de packages — npm, github-actions, etc., pas les bundles
  vendored statiques).
- La revue de licences est **statique** et documentée dans ce fichier.

Justification dans [`docs/adr/001-javascript-vanilla.md`](../docs/adr/001-javascript-vanilla.md)
(choix vanilla JS, pas de framework, pas de build) et
[`docs/adr/003-mode-hors-ligne.md`](../docs/adr/003-mode-hors-ligne.md)
(mode hors-ligne 100 %).

---

## 2. Inventaire

Toutes les licences sont compatibles avec la double licence du projet
**AGPL v3 (code) + CC BY-NC-SA 4.0 (contenu)** documentée dans
[`docs/adr/009-licences.md`](../docs/adr/009-licences.md).

| Fichier | Lib | Version | Taille | Licence | Origine |
|---|---|---:|---:|---|---|
| `chart.min.js` | Chart.js | 4.4.1 | 201 Ko | MIT | <https://www.chartjs.org/> |
| `chartjs-plugin-annotation.min.js` | chartjs-plugin-annotation | 3.0.1 | 34 Ko | MIT | <https://www.chartjs.org/chartjs-plugin-annotation/> |
| `html2canvas.min.js` | html2canvas | 1.4.1 | 194 Ko | MIT | <https://html2canvas.hertzen.com/> |
| `jspdf.umd.min.js` | jsPDF | 2.5.1 | 356 Ko | MIT | <https://github.com/parallax/jsPDF> |
| `jspdf-autotable.min.js` | jsPDF AutoTable | 3.8.1 | 38 Ko | MIT | <https://github.com/simonbengtsson/jsPDF-AutoTable> |
| `jszip.min.js` | JSZip | 3.10.1 | 95 Ko | MIT (ou GPL v3, dual) | <https://stuk.github.io/jszip/> |
| `pdf.min.js` | PDF.js | 3.11.174 | 313 Ko | Apache 2.0 | <https://mozilla.github.io/pdf.js/> |
| `pdf.worker.min.js` | PDF.js (worker) | 3.11.174 | 1,06 Mo | Apache 2.0 | (idem PDF.js) |

**Total** : 8 fichiers, 7 librairies distinctes (PDF.js = 1 librairie en
2 fichiers), ~2,3 Mo cumulés.

---

## 3. Détails par librairie

### Chart.js — 4.4.1

- **Usage** : graphiques de progression, longitudinaux, corrélations,
  tableaux de bord (≈ 12 modules `js/*.js` consommateurs).
- **Licence** : MIT — Copyright (c) 2023 Chart.js Contributors.
- **Origine fichier** : `https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.js`
- **Dernière maj manuelle** : ≈ avril 2024 (estimation, à confirmer via
  `git log libs/chart.min.js`).
- **Compatibilité plugin** : `chartjs-plugin-annotation` 3.x requiert
  Chart.js 4.x — versions compatibles.

### chartjs-plugin-annotation — 3.0.1

- **Usage** : annotations sur graphiques (lignes de seuil, zones, étiquettes).
- **Licence** : MIT — Copyright (c) 2023 plugin Contributors.
- **Origine** : <https://github.com/chartjs/chartjs-plugin-annotation>
- **Dépendance** : Chart.js 4.x (déjà vendored).

### html2canvas — 1.4.1

- **Usage** : capture de zones DOM en image (utilisé pour les exports PDF
  via jsPDF).
- **Licence** : MIT — Copyright (c) 2022 Niklas von Hertzen.
- **Origine** : <https://github.com/niklasvh/html2canvas>
- **Note** : la version 1.4.1 est la dernière publiée. Le projet upstream
  est en mode maintenance — une version 2.0 est en alpha mais pas adoptée.
- **Sous-licence incluse** : extraits Microsoft sous licence permissive
  apparentée MIT (libellé `Apache-2.0-like` à confirmer).

### jsPDF — 2.5.1

- **Usage** : génération de PDF côté client (synthèses de rétroaction,
  exports d'évaluations, etc.).
- **Licence** : MIT — Copyright (c) 2010-2021 James Hall + yWorks GmbH +
  Lukas Holländer + Aras Abbasi + Aaron Spike + Willow Systems Corporation
  + Pablo Hess + Florian Jenett + Warren Weckesser et autres.
- **Build** : `2022-01-28T15:37:57.789Z` (build du fichier vendored).
- **Origine** : <https://github.com/parallax/jsPDF>
- **Note** : une version 2.5.2 et une 3.x existent en upstream. Bump
  potentiel pour la prochaine vérification annuelle (mai 2027).

### jsPDF AutoTable — 3.8.1

- **Usage** : génération de tableaux structurés dans les PDF jsPDF.
- **Licence** : MIT — Copyright (c) 2023 Simon Bengtsson.
- **Origine** : <https://github.com/simonbengtsson/jsPDF-AutoTable>
- **Dépendance** : jsPDF 2.x (déjà vendored).

### JSZip — 3.10.1

- **Usage** : génération + lecture de fichiers ZIP côté client (exports
  Codex, imports de réserve, sauvegardes).
- **Licence** : **dual MIT ou GPL v3** — Copyright (c) 2009-2016
  Stuart Knightley. Voir
  <https://raw.github.com/Stuk/jszip/main/LICENSE.markdown>.
- **Sous-dépendance** : utilise `pako` (MIT) pour la déflation, intégrée
  dans le bundle. Voir <https://github.com/nodeca/pako/blob/main/LICENSE>.
- **Origine** : <https://stuk.github.io/jszip/>
- **Choix de licence côté Labo Codex** : MIT (la branche permissive du dual,
  compatible AGPL v3 sans contamination).

### PDF.js — 3.11.174

- **Usage** : visualisation de PDF importés (productions étudiantes, jetons
  de reprise, etc.).
- **Licence** : Apache 2.0 — Copyright 2023 Mozilla Foundation.
- **Origine** : <https://mozilla.github.io/pdf.js/>
- **2 fichiers** : `pdf.min.js` (API principale) + `pdf.worker.min.js`
  (worker Web pour le rendu hors thread principal). Les deux doivent être
  bumpés ensemble.
- **Note** : la version 4.x est sortie en upstream. Bump potentiel pour la
  prochaine vérification annuelle.

---

## 4. Procédure de mise à jour

**Quand bumper une lib** :

1. Vulnérabilité de sécurité publiée par l'éditeur (CVE).
2. Bug fonctionnel observé en production qui est corrigé en aval.
3. Vérification annuelle (lors du prochain audit annuel, mai 2027).

**Comment bumper** :

1. Télécharger la version `.min.js` officielle depuis le CDN
   recommandé par l'éditeur (jsDelivr, unpkg, npm package, ou GitHub
   release selon la lib).
2. Remplacer le fichier dans `libs/`.
3. Mettre à jour le tableau §2 ci-dessus (version, date, taille).
4. Tester l'app dans Safari macOS + iPad : les chemins critiques sont
   - graphiques (Chart.js + annotation plugin)
   - export PDF (jsPDF + AutoTable + html2canvas)
   - import/export ZIP (JSZip)
   - visualisation PDF (PDF.js)
5. Commit séparé : `chore(libs): bump <lib> from X.Y.Z to X.Y.W`.
6. Pas de bump beta pour un bump de lib (sauf si introduction de
   fonctionnalité visible).

**Hygiène** : si une lib n'est plus utilisée, la retirer dans le même
chantier (zéro-dette CLAUDE.md). Vérifier l'absence de référence par
`grep -rn "nom-de-la-lib" js/ index.html` avant de supprimer.

---

## 5. Compatibilité avec la double licence du projet

| Licence lib | Compatible AGPL v3 | Notes |
|---|:---:|---|
| MIT | ✅ | Compatible (permissive, sans contamination). |
| Apache 2.0 | ✅ | Compatible (permissive, clauses brevets explicites). |
| GPL v3 (option JSZip) | ⚠️ | Compatible mais introduirait copyleft fort. Choisir MIT côté Labo Codex (option du dual). |

Aucune lib sous LGPL, MPL, EUPL, BSD-4-clause ou autre licence à
restriction supplémentaire — la compatibilité AGPL v3 est intégrale.

Référence : [`docs/adr/009-licences.md`](../docs/adr/009-licences.md) §
« Compatibilité libs tierces ».

---

## 6. Historique

| Date | Action | Auteur |
|---|---|---|
| 2026-05-25 | Création de ce fichier — inventaire complet 8 fichiers, 7 libs | Grégoire Bédard + Claude Code |

Mises à jour ultérieures : ajouter une ligne ici à chaque bump ou retrait.

---

**Fin du document.** À réviser à chaque cycle d'audit annuel ou bump de
lib significatif.
