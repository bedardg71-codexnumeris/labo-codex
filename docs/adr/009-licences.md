# ADR-009 : AGPL v3 (code) + CC BY-NC-SA 4.0 (contenu)

**Statut** : Acté
**Date de décision originale** : 27 octobre 2025 (initiale), 3 novembre 2025 (durcissement AGPL), 26 novembre 2025 (ajout NC), 14 avril 2026 (avis commercial) — formalisation ADR : 14 mai 2026
**Auteur** : Grégoire Bédard

---

## Contexte

Labo Codex est un projet pédagogique conçu comme un **commun éducatif** — fruit de 30 ans d'enseignement, 7 ans de pratique de l'enseignement explicite et 2 ans de recherche-action. L'auteur veut :
- Permettre aux enseignants du réseau collégial et universitaire d'utiliser, d'adapter et de partager librement l'outil et ses concepts pédagogiques.
- Protéger le projet contre l'appropriation commerciale (rachat, repackaging, hébergement payant fermé).
- Encourager les contributions sous des conditions qui préservent l'ouverture.
- Distinguer le **code technique** (technique, reproductible) des **concepts pédagogiques** (artefacts intellectuels du travail enseignant).

Plusieurs combinaisons de licences ont été testées au cours du projet (cf. historique en bas de `LICENSE.md`). La trajectoire :
- **27 octobre 2025** : GPL v3 + CC BY-SA 4.0 (versions initiales).
- **3 novembre 2025** : passage à AGPL v3 (fermer la « faille SaaS » du GPL v3).
- **26 novembre 2025** : passage du CC BY-SA à CC BY-NC-SA (ajout du Non-Commercial pour protéger le travail des enseignants).
- **14 avril 2026** : ajout d'un avis d'usage commercial et précision du statut de commun éducatif.

---

## Décision

**Double licence** :

### Code technique → GNU Affero General Public License v3.0 (AGPL v3)

Couvre :
- Tous les fichiers HTML (`index.html`, `design-system.html`).
- Tous les fichiers JavaScript (`js/*.js`).
- Tous les fichiers CSS (`styles.css`, `css/*.css`).
- La structure technique de l'application.

**Pourquoi AGPL v3** :
- Garantit que le code reste libre et open source.
- Protège contre l'appropriation commerciale, **y compris en mode SaaS** (différence clé vs GPL v3 : oblige à publier le code source si l'app est hébergée et exposée à des utilisateurs).
- Compatible avec les dépendances vendored (MIT, Apache 2.0 — toutes one-way compatible vers AGPL v3 ; cf. sous-audit 4.5).

### Contenu pédagogique → Creative Commons BY-NC-SA 4.0 (Attribution - Non-Commercial - ShareAlike)

Couvre :
- Documentation et aide intégrée (section Aide de l'application).
- Concepts pédagogiques (A-C-P, RàI, SRPNF, IDME, cartouches).
- Formules et algorithmes de calcul des indices.
- Guides méthodologiques (`CLAUDE.md`, README, documentation `docs/`).
- Articles et références bibliographiques.

**Pourquoi CC BY-NC-SA 4.0** :
- Permet l'adaptation pour différents contextes pédagogiques.
- Autorise le partage dans des publications académiques avec attribution.
- **Protège le travail des enseignants** (pas d'usage commercial sans autorisation).
- Redistribution sous même licence (ShareAlike) — empêche le « capture and close ».

---

## Conséquences

### Positives

- **Posture juridiquement claire** : un tiers peut identifier sans ambiguïté ce qu'il peut faire avec le code et avec le contenu.
- **Protection contre l'appropriation SaaS** : AGPL v3 ferme la faille la plus dangereuse pour un projet open source.
- **Reconnaissance du travail enseignant** : la clause NC sur le contenu reconnaît que les concepts pédagogiques sont des artefacts intellectuels du travail enseignant et méritent une protection contre l'exploitation commerciale.
- **Forkabilité** : AGPL v3 permet le fork du code, ce qui est une mitigation au bus factor de 1 (cf. ADR-bus-factor / sous-audit 4.2).

### Négatives

- **Complexité juridique** : la double licence demande une explication. Risque qu'un utilisateur confonde les deux périmètres. Mitigation : `LICENSE.md` détaillé avec FAQ + cas d'usage.
- **Effet repoussoir AGPL** : certains tiers commerciaux refusent par politique tout code sous AGPL. Pas un problème pour le périmètre actuel du projet, mais à noter.
- **Non-Commercial ambigu** : la clause NC du CC est interprétée différemment selon les juridictions. Mitigation : avis commercial explicite dans `LICENSE.md` qui précise la posture de l'auteur.
- **Dette d'hygiène à corriger** : plusieurs documents internes (`audit/04-sustainability/README.md`, `audit/package.json`, ancienne version du README) mentionnent encore « CC BY-SA 4.0 » au lieu de « CC BY-NC-SA 4.0 ». Identifié par le sous-audit 4.5, en cours de correction.

### Neutres

- **Compatibilité dépendances** : tous les vendored libs sont compatibles avec AGPL v3 (cf. sous-audit 4.5).
- **Headers SPDX par fichier** : non implémentés. Décision Grégoire à prendre (cf. sous-audit 4.5 §6 recommandation 5).

---

## Alternatives considérées

### Option A : MIT (code) + CC BY 4.0 (contenu)

Le plus permissif. **Écartée** parce qu'incompatible avec la volonté de protéger contre l'appropriation commerciale.

### Option B : GPL v3 (code) + CC BY-SA 4.0 (contenu)

Position initiale du projet. **Abandonnée** parce que GPL v3 laisse la « faille SaaS » ouverte et que CC BY-SA autorise l'usage commercial.

### Option C : Proprietary / Closed-source

Aurait permis un contrôle total mais à l'opposé de la posture de commun éducatif revendiquée.

### Option D : CC BY-SA 4.0 pour tout (code et contenu)

Techniquement possible mais Creative Commons ne recommande pas l'usage de ses licences pour du code source. AGPL v3 est l'outil adapté pour le code.

---

## Références

- `LICENSE.md` à la racine — texte canonique avec historique.
- Audit annuel 2026, sous-audit 4.5 Licences — analyse de cohérence et non-conformités identifiées.
- `https://www.gnu.org/licenses/agpl-3.0.html` — texte officiel AGPL v3.
- `https://creativecommons.org/licenses/by-nc-sa/4.0/legalcode.fr` — texte officiel CC BY-NC-SA 4.0.

---

## Notes de révision

À réviser si :
- Une institution partenaire exige une licence différente pour un usage spécifique (négociation au cas par cas, possiblement avec une exception explicite).
- Une transition vers Creative Commons By-SA (sans NC) est demandée pour faciliter l'inclusion dans des outils libres (peu probable dans la posture actuelle).

---

**Source du format** : Michael Nygard, *Documenting Architecture Decisions* (2011).
