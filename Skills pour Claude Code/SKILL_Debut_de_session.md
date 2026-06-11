---
name: debut-de-session-labo-codex
description: >
  Workflow exécutable de début de session pour Labo Codex. Déclencher
  SYSTÉMATIQUEMENT au premier tour de toute nouvelle session de travail
  sur ce projet, ou dès que Grégoire dit « où en est-on », « état des
  lieux », « on commence », « relai », « audit », ou envoie une prémisse
  de relance avec des commandes git. Objectif : produire un état des
  lieux factuel du dépôt AVANT de prendre la prémisse de relance pour
  argent comptant, et signaler tout écart entre la prémisse reçue et
  l'état mesuré.
  Lecture seule — aucune modification de fichier, aucun commit, aucun push.
  Pendant inverse de SKILL_Fin_de_session.md.
---

# SKILL : Rituel de début de session — Labo Codex

> Cette skill est une procédure exécutable, pas une référence. Elle
> automatise l'audit factuel qu'un développeur consciencieux ferait
> avant d'ouvrir un chantier dans un dépôt qu'il n'a pas touché depuis
> plusieurs heures. Elle est en lecture seule.
>
> **Justification** : la commande de relance que Grégoire envoie au
> début d'une session est souvent préparée la veille au soir et pointe
> vers un état du dépôt qui a évolué entre-temps (autre cycle de
> travail, commits poussés depuis, sessions intermédiaires). Sans
> audit, le risque est de coder sur la base d'une prémisse périmée —
> refaire un travail déjà livré, collider avec l'existant, ou rater
> une urgence ajoutée depuis. Acté 28 mai 2026 PM après écart de 24 h
> détecté sur le Lot A ✴ (livré au commit `11f87a1` mais demandé à
> nouveau dans la prémisse du lendemain).

---

## 0. QUAND DÉCLENCHER

- Tout premier tour d'une nouvelle session de travail sur ce projet
- Quand Grégoire dit « où en est-on », « état des lieux », « on commence »,
  « relai », « audit », « fais le point »
- Quand Grégoire envoie une prémisse de relance contenant des assertions
  vérifiables (« HEAD attendu », « N tests verts », « ~N occurrences »,
  « version X.Y.Z attendue »)
- Quand plus de quelques heures se sont écoulées depuis le dernier
  échange et que le contexte de session précédent est perdu

**Ne PAS déclencher** pendant une session déjà en cours (le contexte
récent suffit), pendant un debug actif, ou si Grégoire enchaîne
explicitement une demande sur un travail déjà en cours.

---

## 1. INVENTAIRE GIT

**Objectif** : connaître le HEAD réel et l'état du dépôt.

```bash
# depuis la racine du dépôt
git status
git log --oneline main -10
git fetch origin
```

Produire :
- Branche courante
- HEAD réel (hash + message du commit)
- Date du dernier commit
- Nombre de commits depuis le HEAD attendu par la prémisse (s'il y en a une)
- Divergence éventuelle avec `origin/main` (ahead/behind)
- État des fichiers tracked (clean ? modifications non commitées ?)
- Volume des fichiers untracked (signal qu'un chantier est en cours
  mais pas commité, ou que des artefacts s'accumulent)

---

## 2. ÉTAT DES TESTS

**Objectif** : confirmer que la suite de tests passe avant d'attaquer
un nouveau chantier.

```bash
cd tests && npm test
```

Reporter :
- Nombre de tests passés / échoués (Vitest + Playwright)
- Si écart avec un nombre attendu par la prémisse, le signaler
- Temps total
- Si échec : nom du test, fichier, ligne, message condensé

Si la suite n'est pas exécutable, le signaler clairement — ne PAS
prétendre que les tests passent.

---

## 3. ÉTAT DE LA VERSION

**Objectif** : lire `version.json` pour connaître la version/build courante.

```bash
cat version.json
```

Reporter :
- Version SemVer (`X.Y.Z`) et build (`MMJJ-HHMM`) du fichier
- Comparaison avec ce que la prémisse annonce (s'il y a une assertion)
- Cohérence avec le dernier commit (le message du dernier commit
  contient souvent le build pour confirmation croisée)

Ne PAS vérifier ici la cohérence avec les fallbacks `init-inline.js`
et `main.js` — c'est le rôle du rituel de fin de session.

---

## 4. LECTURE DE SESSION.md

**Objectif** : prendre connaissance du dernier relai écrit.

Lire :
- Le bloc d'identification (lignes 1-20 environ) — « Chemin canonique »,
  « Dernier cycle livré », « Cycle suivant — démarrage »
- Le §0 (récap de la dernière session) — méthode, livrables, BACKLOG
  inscrit, prochain cap
- Toute « Note de relance » insérée plus haut qu'un §0 antérieur

Identifier :
- La priorité annoncée pour la prochaine session
- Les chantiers en suspens
- Les items BACKLOG cités ⚠️ urgents

Si le bloc d'identification mentionne un HEAD différent du HEAD réel
mesuré au §1, le signaler comme **écart documentaire** (SESSION.md
elle-même est périmée).

---

## 5. LECTURE DU HAUT DE BACKLOG.md

**Objectif** : connaître les items prioritaires actuels.

Lire les 25 premières lignes (en-tête + légende) :
- État courant annoncé (HEAD + items ouverts + dernier ID)
- Présentation AQPC date + J−N
- Si la ligne « État courant » mentionne un HEAD différent du HEAD réel,
  le signaler

Puis parcourir les sections (≤ 1 ligne par section) pour repérer :
- Items ⚠️ priorité haute actée
- Items ⚠️ AVANT AQPC (ou autres deadlines datées)
- Items 📐 en attente de décision UX

---

## 6. COMPARAISON PRÉMISSE vs RÉEL

**Objectif** : pour chaque assertion vérifiable de la prémisse de
relance, indiquer attendu vs mesuré.

Si la prémisse contient des éléments comme :
- « HEAD attendu : ... »
- « N tests verts attendus »
- « ~N occurrences attendues »
- « version X.Y.Z attendue »
- « branche X attendue propre »

Construire un tableau de comparaison ≤ 5 lignes :

| Vérification | Attendu par la prémisse | Réel mesuré |
|---|---|---|

Si écart, nommer le ou les commits qui expliquent la différence et
proposer une note de relance courte à insérer dans SESSION.md (juste
après le bloc d'identification, avant le §0 le plus récent).

Si pas d'écart, le dire en une ligne et passer au §7.

---

## 7. RAPPORT FINAL ET CAP

**Objectif** : produire une synthèse courte qui permet à Grégoire de
choisir le prochain chantier en toute connaissance de cause.

Format :

```
=== ÉTAT DES LIEUX — DÉBUT DE SESSION ===

Repo :
  - Branche : main (à jour avec origin)
  - HEAD : <hash> <message court>
  - Dernier commit : <date>
  - Untracked : <volume résumé>

Tests :
  ✅ N/N verts en T s
  ou
  ❌ K/N échecs

Version :
  X.Y.Z / build MMJJ-HHMM
  (cohérent avec le dernier commit)

Écart prémisse vs réel :
  ✅ Aucun écart
  ou
  ⚠ Écart détecté :
    [tableau attendu vs mesuré]
    Explication : <N commits passés depuis, dont ...>

Priorités annoncées (SESSION.md + BACKLOG) :
  ⚠️ AVANT AQPC : <items>
  ⚠️ Priorité haute actée : <items>
  📐 Décision UX en attente : <items>

Cap recommandé pour la session :
  <propose 1-2 options en question fermée si pertinent>
```

⏸ S'arrêter ici. Attendre confirmation Grégoire sur le cap avant
d'ouvrir un chantier.

---

## 8. CE QUE CETTE SKILL NE FAIT PAS

Lecture seule (cf. Justification en tête) : aucune modification de fichier,
aucun commit, aucun push. En particulier :

- Ne corrige pas la documentation périmée (SESSION.md, BACKLOG.md…) —
  seulement la signaler, et proposer une note de relance que Grégoire validera
- Ne décide pas du chantier à attaquer — prérogative de Grégoire
- Ne se substitue pas à SKILL_Fin_de_session.md (qui audite le code
  modifié contre les règles de sécurité)
- Ne lit pas tout SESSION.md (fichier de >1000 lignes en moyenne) —
  seulement le bloc d'identification et le §0 le plus récent

---

## ANTI-PATTERNS À ÉVITER

- ❌ Prendre la prémisse de relance pour argent comptant sans audit —
  c'est la raison d'être du rituel
- ❌ Sauter le `git fetch origin` (peut masquer une divergence avec le remote)
- ❌ Confondre « SESSION.md à jour » et « prémisse de relance à jour » —
  l'une peut être correcte et l'autre périmée
- ❌ Ignorer les fichiers untracked sans les énumérer rapidement (un
  chantier en cours non commité peut représenter du travail à préserver)
- ❌ Enchaîner directement sur un chantier sans avoir produit le §7
  rapport final — l'objectif du skill est de poser le décor, pas de
  faire le travail

---

## HISTORIQUE

| Date       | Changement                                                |
|------------|-----------------------------------------------------------|
| 2026-05-28 | Création. Pendant inverse de SKILL_Fin_de_session.md. Acté après écart de 24 h sur le Lot A ✴ : prémisse demandait un travail déjà livré au commit `11f87a1`. |
| 2026-06-11 | Format de version aligné sur SemVer (`X.Y.Z`). Déduplication : §8 et ANTI-PATTERNS resserrés (la consigne « lecture seule / ne pas prendre la prémisse pour argent comptant » n'est plus répétée 3×, elle renvoie à la Justification). |
