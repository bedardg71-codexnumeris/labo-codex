# SESSION — État au 22 avril 2026 matin

**Date** : 22 avril 2026
**Dernier build** : `0422-0809` · Beta 99.21
**Branche** : `main` (pushée)
**Statut** : **Consolidation onboarding LIVRÉE (21 avril). Plan 1 Autonomisation — Phase 2 quasi-complète.** Prêt à démarrer **Phase 3** (affichage `inspireDe` sur les cartes) après test terrain.

---

## 🚀 Consigne de démarrage pour la prochaine session

À copier-coller au début de la prochaine session :

```
cd /Users/kuekatsheu/Documents/GitHub/Monitorage_v6

Contexte : clear context effectué le 22 avril matin après session intense
(18 commits aujourd'hui). Build actuel : 0422-0809, Beta 99.21, pushé
sur origin.

Lis dans cet ordre :
1. SESSION.md (état complet, consigne)
2. MEMORY.md (auto-mémoire)
3. memory/feedback_no_debt.md (PRINCIPE DIRECTEUR : stabilité zéro-dette)
4. memory/project_autonomisation_utilisateur.md (Plan 1, Phases 2-7)
5. plans de travail/PLAN-AUTONOMISATION-UTILISATEUR.md (plan détaillé,
   Phases 3+ à attaquer)

Puis selon travail :
6. memory/project_partage_ressources.md (Plan 2 CC, pas démarré)

Principe cardinal (feedback_no_debt.md, CLAUDE.md §Principes directeurs) :
« Tout nouveau chantier retire ce qu'il remplace, il ne l'empile pas
  à côté. Stabilité prime sur vitesse. »

Action concrète à démarrer : Plan 1 Phase 3 — affichage `inspireDe`
sur les cartes bibliothèque (« Inspiré de X par Y » visible sur les
items forkés). Voir §2 de ce fichier pour le détail technique.

Convention de build : MMJJ-HHMM (Toronto). Demander le numéro de beta
à Grégoire avant chaque commit. Beta fixe pour la journée, seul le
build change entre commits.
```

---

## 1. Travail fait aujourd'hui (22 avril 2026)

### Commits de la journée (11 commits)

| Build | SHA | Livrable |
|---|---|---|
| 0422-0715 | `5d5d22c` | Audit UX 22 avril : 6 corrections (attribution Labo Codex, logo CC, Gabarit Test retiré, flèche sticky, contributeurs dans cartes, btn-mini) + Migration RLO silencieuse |
| 0422-0721 | `9d71776` | Plan 1 Phase 2.4 : 4 dropdowns natifs (Cours/Enseignant/Horaire/Groupe-cours) avec `<optgroup>` Démo |
| 0422-0738 | `399c854` | Phase 2.5 + 2 bugfixes UX (checkbox Démo persistance + Quitter démo → accueil) |
| 0422-0755 | `77cbec3` | Fix 8 dropdowns vidés en mode démo legacy (détection `enDemoLegacy`) |
| 0422-0800 | `7607d91` | Console propre : export `sauvegarderIdentificationTrimestreV2` + 3 clés `tourGuide_*` dans DEFAUTS |
| 0422-0809 | `e0c8f3b` | Bandeau transition « espace de travail prêt » démo-aware + 3 prefs `_demo` (Option B) |

Plus les commits du 21 avril soir (Phase 2.0-2.2) pushés ensemble :
`cfee015` / `337855b` / `f796d93` / `2dc86e1` / `dbbb72e` / `9a2bd83`
(Phase 3-8 consolidation) + `a959f68` / `7163457` / `8f9c786` / `739c705`
/ `faba5e6` (Plan 1 Phase 2.0-2.2) + `7e26e09` (merge).

### Phase 2 du plan d'autonomisation — état

| Phase | État | Commits |
|---|---|---|
| 2.0 Audit 11 sélecteurs | ✅ Livré | `a959f68` |
| 2.1 POC Grille | ✅ Livré | `7163457` + `8f9c786` (simplification post-retour) |
| 2.2 Propagation 4 modules bibliothèque | ✅ Livré | `faba5e6` + `739c705` (fix préfixes) |
| 2.3 Production hybride | ✅ Fusionnée avec 2.1/2.2 | — |
| 2.4 Dropdowns natifs (4/5) | ✅ Livré | `9d71776` |
| 2.5 Dropdowns d'assemblage (4/5) | ✅ Livré | `399c854` |
| 2.x Fix mode démo legacy dropdowns | ✅ Livré | `77cbec3` |

**Reste hors scope Phase 2** :
- `v2-gc-trimestre` / `v2-selectTrimestreActif` — logique complexe liée au mode démo legacy (sera naturellement traité en Phase 5)
- `v2-gc-groupe` — numéros de groupe (pas des entités)
- `selectGroupeEval` (evaluation.js) — filtre par numéro de groupe

---

## 2. À faire — Plan 1 Phase 3 — Affichage `inspireDe` sur les cartes

Objectif : respect visible de la licence CC BY — chaque copie forkée
porte la trace de son origine, et cette trace est VISIBLE sur la carte
/ dans les listes.

### Détails techniques

Depuis les commits 2.1/2.2, toute duplication via `Dupliquer` enrichit
la copie avec une métadonnée :
```js
inspireDe: {
    nom: '<nom original>',
    auteur: '<auteur original>',
    date: '2026-04-21'
}
```

Enrichissement présent dans 8 fonctions `dupliquer*` de grilles.js,
echelles.js, cartouches.js, productions.js, pratiques.js,
pratiques-materiel.js.

**Phase 3 cibles** :

1. **Carte bibliothèque** (Section 1 — items locaux) : afficher une
   ligne discrète sous le titre « Inspiré de <nom> par <auteur> » si
   `inspireDe` est présent. Exemple : « Inspiré de Checklist de
   spécifications par Labo Codex ».

2. **Carte bibliothèque** (Section 2 — items partagés) : idem, si un
   item partagé a lui-même un `inspireDe` (chaîne CC).

3. **Formulaire d'édition** : afficher `inspireDe` dans les
   « Métadonnées sur cette X » (panneau géré par cc-license.js
   `genererPanneauMetadonnees`). Pattern existant pour `contributeurs`,
   à étendre pour `inspireDe`.

4. **Champ auteur séparé du champ enseignant** (plan §4.4) : vérifier
   que le champ `auteur` (métadonnée CC) est bien distinct du champ
   `enseignant` du groupe-cours. À auditer dans les formulaires
   d'édition de pratique/grille/etc.

5. **BibliothequeUI helper** : ajouter `BibliothequeUI.formaterInspireDe(item)`
   qui retourne « Inspiré de X par Y » (ou `''` si absent).

### Architecture

- Style discret dans `styles.css` : ligne italique couleur texte-secondaire
- Les 5 modules bibliothèque consomment le helper dans leur
  `preparerDonnees*` (comme pour `formaterAttribution` en Phase 2).

### Risques

- Risque zéro : `inspireDe` est un nouveau champ, pas de données legacy
  qui pourraient générer des conflits.
- Les items historiques (sans `inspireDe`) n'afficheront simplement
  rien — comportement attendu.

---

## 3. Architecture actuelle (Beta 99.21)

### Matériel CC
- Tout le matériel livré attribué à « Labo Codex » (45+ items corrigés)
- Logo CC BY-NC-SA déplacé dans `icons/by-nc-sa-2.svg` (évite espace dans chemin)
- `inspireDe` ajouté automatiquement à chaque duplication (respect CC)

### Démo
- Namespace `demo_*` permanent (pack-demo version 20.2)
- 4 dropdowns natifs + 4 dropdowns d'assemblage exposent les démos dans
  `<optgroup>` avec items désactivés (option A — non sélectionnables)
- 5 modules bibliothèque (grilles/échelles/cartouches/productions/pratiques)
  affichent badge « Démo » violet + titre préfixé `[Démo]`
- Bouton « Dupliquer » retire le flag démo de la copie et ajoute `inspireDe`
- Bandeau « espace de travail prêt » démo-aware

### Accompagnement
- 5 flèches « première X » avec condition (disparaissent dès qu'un item
  existe)
- 3 bandeaux de transition tracking mode démo / mode normal séparément

### Console
- Silencieuse au démarrage hors violations CSP Cloudflare (attendues)

---

## 4. Plans en cours

| Plan | Statut | Priorité | Remarque |
|---|---|---|---|
| PLAN-CONSOLIDATION-ONBOARDING.md | ✅ Livré 21 avril | — | — |
| PLAN-AUTONOMISATION-UTILISATEUR.md | **Phases 1+2 livrées** | **Haute** | Phase 3 à attaquer |
| PLAN-PARTAGE-RESSOURCES.md | Cadré | Basse | Attend autonomisation Phase 6+ |

---

## 5. Conventions opérationnelles

- **Build** : format `MMJJ-HHMM` Toronto. Bump à chaque commit. Beta fixe journée.
- **Demander numéro de beta** avant chaque commit ; ne jamais renuméroter auto.
- **version.json** + fallback `js/init-inline.js` BUILD_ID à chaque commit.
- **CSP strict** : `script-src 'self'`. Violations Cloudflare/beacon attendues.
- **Principe zéro-dette** (CLAUDE.md §Principes directeurs) : appliquer partout.
- **Sécurité** : `echapperHtml` sur innerHTML, `validerZipSecurite` sur imports, etc.

---

## 6. Préservation des données personnelles

Grégoire fait des backups Codex réguliers. Données personnelles (trimestres
réels H2026/A2025, grilles, évaluations, productions) **intouchables**. Les
migrations silencieuses du chantier ne touchent que les flags et attributions
techniques.
