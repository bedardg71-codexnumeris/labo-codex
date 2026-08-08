# Dossier de reprise — août 2026

> **Addendum du 10 juillet 2026 (Cowork)** : re-audit complet — RIEN n'a bougé
> depuis le 4 juillet. Labo Codex est en pause propre : main local = 1.27.3
> (identique à la prod vérifiée le 4), un SEUL geste en attente = `git push`
> (commit `7a0bd098`, ce dossier ; `bb85cd6d` est poussé). La revue des PR (§3)
> date du 4 juillet — re-vérifier leur statut à la reprise. Ce dossier reste LA
> référence pour rouvrir le projet en août.
>
> **Correctif du 10 juillet 2026 (Claude Code, Mac)** : le constat « rien n'a
> bougé » était vrai en LOCAL seulement. Au push, `origin/main` contenait 4
> commits d'une session cloud postérieurs au 4 juillet (lots V/W/X :
> pré-validation Chromium des portes terrain, filets Playwright WebKit
> permanents, enquêtes #300/#301/#332-c1 closes — tip `5ba91564`). Le Mac a
> été rebasé dessus puis poussé le 10 juillet ; les 3 verrous git périmés du
> signet SESSION.md ont été retirés. À la reprise : lire aussi le bloc
> SESSION.md des lots V/W/X.

> Compilé le 4 juillet 2026 (Cowork). Une page pour rouvrir le projet sans relire
> un mois de traces. Sources : SESSION.md (signet + bloc 3 juillet), BACKLOG.md,
> PLAN-mi-aout-2026.md §9 (28 juin, expurgé des décisions tranchées depuis),
> revue des PR GitHub et vérification prod du 4 juillet.

## État au départ en congé

- **1.27.3 en production, vérifiée le 4 juillet** : `app.codexnumeris.org` sert bien
  1.27.3 (build 0703-1529) — le cache-busting fonctionne. Console d'un boot vierge :
  propre, sauf 2 warnings bénins (migration #358 : « aucun trimestre dérivable » +
  8 échelles orphelines de la lignée test Bruno/Xavier/etc. conservées — bruit à
  chaque boot vierge, cosmétique, apparenté au ménage #342).
- Vagues 1-2-3 de juillet : 12/12 tâches livrées ou closes par écart, mergées et
  déployées (décision du 3 juillet). Bilan factuel : SESSION.md bloc 3 juillet.
- Clone Mac réconcilié le 4 juillet. **Si pas encore fait : `git push`** (commit
  `bb85cd6d` + le commit du présent dossier).

## 1. Décisions qui t'attendent (rien ne code sans toi)

1. **#365 audit blanc** : l'audit n'a trouvé AUCUN manque de namespacing au bilan
   réflexif. Y avait-il un symptôme observé, ou on clôt ?
2. **#279** : 3 champs au formulaire de production — décision UX avant code.
3. **#306** : décision UX « apparition du formulaire » restée ouverte (consignée vague 3).
4. **Voûte #329** : confirmer taille max 50 Mo + champs exclus du format, avant lot final.
   Jalon pilote restreint fin août (toi + 2-3 collègues).
5. **#336** : exécuter ou non la purge auto de l'espace précédent sur les vraies données.
6. **#353 suite** : l'observabilité (Option 1) est en place depuis 1.27.3 — laisser
   mesurer, puis trancher entre options 2/3/4 avec des chiffres.
7. **§9.1 du plan mi-août** : re-trier ce qui reste des 🟡 (beaucoup ont été livrés
   en juillet — le plan du 28 juin est périmé en volume).

## 2. Validations terrain accumulées (Mac + iPad, 2 modes)

- Session 29 juin : #310, #311, #351 (appariement Césaire/Goodall), #240, #347.
- Vague 1 : #313, #344, #361. Vague 2 : #355, #305, #121. Vague 3 : #118/#283-T1,
  #306. Détail des portes : SESSION.md blocs 2-3 juillet.
- Chantiers plus anciens : #334 (iPad), #340 (confirmation), #336 (terrain),
  #329 (re-passe iPad).

## 3. PR GitHub ouvertes (revue du 4 juillet)

| PR | Contenu | État | Recommandation |
|----|---------|------|----------------|
| #63 | Reliquats DEN #343-T3/T4 (1.21.1) | « Able to merge », tests CI verts, CodeQL rouge (check mort) | ⚠ **NE PAS merger tel quel** : contient une release **1.21.1** → régresserait version.json/init-inline/main.js (main = 1.27.x). Reprendre les commits de contenu SANS le commit de release, vérifier que les fixes n'ont pas été absorbés depuis, re-release patch. T5 (portes wizard) reporté à une session Mac. |
| #65 | Retrait CodeQL + recadrage docs (privatisation) | Tests CI **rouges** (branche du 24-25 juin, antérieure au fix des specs comparateur 1.26.0) | Toujours pertinent (CodeQL pollue chaque PR). Rebaser sur main → les tests devraient verdir ; vérifier le chevauchement avec l'audit #363 (3 juillet) sur ETAT-PROJET.md. Puis merger. |
| #23 | vitest 2.1.9 → 4.1.9 (majeur) | Checks verts | Ton « @dependabot squash and merge » de jadis n'a pas abouti (force-push ultérieurs). Re-merger ; puis `npm test` local. Créer les labels manquants `dependencies` et `tests` (dependabot les réclame). |
| #37 | @playwright/test 1.60 → 1.61.1 | Checks verts | Merger, risque faible. |
| #61 | actions/checkout 4 → 7 | CI seulement | Merger, risque faible. |
| #19 | actions/upload-artifact 4 → 7 | CI seulement | Merger, risque faible. |

## 4. Chantiers structurants d'août

1. **Triage des 5 worktrees** avec `plans de travail/INVENTAIRE-worktrees-2026-07.md`
   (⚠ `wonderful-galileo` en premier : diffs Brique C non commités ; `distracted-swanson`
   prouvé absorbé). Protocole local 5 min fourni dans l'inventaire.
2. **#364 T3/T4/T5** : contenu d'aide (tu valides les formulations avant pose).
3. **#362** grilles h2026 désappariées : séance dédiée avec backup + L0 avant/après
   (`plans de travail/RELAIS-grilles-h2026-desappariees.md`). Englobe #354.
4. **Voûte #329** : revue du format puis jalon pilote fin août.
5. **USAGE-FORMATS.md** : bilan de juillet rédigé (4 juillet) — reste TON point 4 :
   transférer les notes du colloque AQPC dans le journal, ou acter leur perte.

## 5. Rappels de cadre

- Retours testeurs (`SUIVI-BUGS.md`) avant tout : ouverts au 4 juillet = #145, #121
  (enquête vague 2 à relire), #114 (option 1 = dashboard Cloudflare, geste à toi),
  #116 (livré vague 1 — vérifier la clôture au tracker), #118 (livré vague 3, porte
  terrain).
- La source de vérité reste BACKLOG.md + SUIVI-BUGS.md, ré-audités en début de tâche ;
  ce dossier n'est qu'une vue au 4 juillet.
