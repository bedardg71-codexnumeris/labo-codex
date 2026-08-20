# Portes terrain — 19 août 2026 (après-midi) · Suppression de fiche de cours (#449, 1.88.0)

> **Cycle 1.87.9 → 1.88.0.** La décision du 11 août (porte 3.2) livrée : le
> menu ⋮ de la Bibliothèque de cours porte le réversible ET le définitif, et
> la suppression n'existe que GARDÉE — refus dès que le cours porte des
> données. Le bouton Supprimer du Cadre passe par le même garde.
>
> **Artefact interactif** : lien donné dans la conversation du 19 août.
> **Ce qui échoue devient un item de backlog, pas une note mentale.**
>
> État : **✅ CLOSE — 11/11, ZÉRO ÉCHEC** (relevé de Grégoire, 20 août 2026,
> exporté par le bouton de l'artefact). Le refus a protégé sa vraie fiche
> 601-101 depuis la Bibliothèque ET depuis le Cadre ; le cycle complet sur
> « 000-TEST-ZZ » passe (création sans avertissement, **visible sans
> recharger — le correctif #458 revalidé au terrain**, confirmation « tous
> trimestres », suppression) ; le menu ⋮ à trois entrées se touche bien sur
> l'iPad. Rien de dû de ce cycle.
>
> Historique : à la première passe (19 août), la rangée 2.2a a révélé
> **#458** — fiche neuve invisible de la Bibliothèque (champ
> `dansBibliotheque` jamais posé à la création + filtres stricts de la
> modale), corrigé en **1.88.1** aux deux bouts, sentinelle 3 cas.

---

## §0 · Avant de commencer

- [ ] **0.1a** — SEULE commande de Terminal de la liste (app Terminal, dossier
  `Monitorage_v6`) : `git checkout main && git pull origin main`.
  ⮕ Attendu : `Fast-forward`. `[Terminal]` `[Mac]`
- [ ] **0.1b** — Recharger l'app, lire le numéro en bas de page.
  ⮕ Attendu : **1.88.0**, build **0819-0826**. `[Mac]`

## §1 · ⚠⚠ Données

- [ ] **1.1** — Backup Codex avant la porte 2.2 (elle supprime une fiche de
  TEST créée exprès ; tes vraies fiches sont protégées par le refus — mais la
  règle de la maison, c'est le filet d'abord). `[⚠⚠ Données]` `[Mac]`

## §2 · Interface

### 2.1 — Le refus protège ta vraie fiche (#449)

**Pourquoi** : avant, supprimer un cours (par le Cadre) demandait un simple
« irréversible ? » et laissait orphelins groupes-cours, productions,
évaluations et présences — le mécanisme du bug « productions H26
inaccessibles » d'août.

- [ ] **2.1a** — Cadre → Cours → bouton « Bibliothèque ». Sur la carte de ton
  601-101-MQ, ouvrir le menu ⋮. ⮕ Attendu : TROIS entrées — « Exporter »,
  « Retirer de ma sélection », « Supprimer la fiche » (celle-ci en rouge). `[Mac]`
- [ ] **2.1b** — Cliquer « Supprimer la fiche » sur ton 601-101-MQ.
  ⮕ Attendu : REFUS — « Impossible de supprimer… Ce cours porte encore des
  données », avec la liste trimestre par trimestre (groupes, évaluations,
  présences…). Rien n'est supprimé ; le menu des cours n'a pas bougé. `[Mac]`

### 2.2 — Le cycle complet, sur une fiche de test

- [ ] **2.2a** — Cadre → Cours → « + Nouveau cours » : code `000-TEST-ZZ`,
  une discipline, « Créer ». ⮕ Attendu : la fiche se crée SANS avertissement
  (code neuf — le garde ne mord pas le cas légitime). `[⚠⚠ Données]` `[Mac]`
- [ ] **2.2b** — Bibliothèque → menu ⋮ de « 000-TEST-ZZ » → « Supprimer la
  fiche ». ⮕ Attendu : confirmation — « la fiche disparaît de TOUS les
  trimestres… irréversible ». `[Mac]`
- [ ] **2.2c** — Confirmer. ⮕ Attendu : « Fiche supprimée (tous
  trimestres) » ; la fiche disparaît de la Bibliothèque ET du menu des cours
  du Cadre. `[⚠⚠ Données]` `[Mac]`

### 2.3 — Le Cadre passe par le même garde

- [ ] **2.3a** — Cadre → Cours → sélectionner ton 601-101-MQ → bouton
  « Supprimer » du formulaire. ⮕ Attendu : le MÊME refus listant les données.
  Avant : un simple « irréversible ? » qui aurait tout laissé orphelin. `[Mac]`

### 2.4 — iPad

- [ ] **2.4a** — Sur l'iPad, ouvrir la Bibliothèque de cours et le menu ⋮
  d'une fiche, au doigt. ⮕ Attendu : le menu s'ouvre, les trois entrées se
  touchent sans viser. `[iPad]`

## §4 · Ce que je n'ai pas pu vérifier

1. **Rien n'a été vu sur ton matériel** — Chromium seul : menu à trois
   entrées, refus sur fiche pleine, confirm refusé qui n'écrit rien,
   suppression ciblée, tous mesurés au conteneur.
2. **Le refus a été éprouvé sur des données SEMÉES**, pas sur ton corpus —
   la rangée 2.1b sur ton vrai 601-101 est le test qui compte.
3. **Le cas « fiche + groupes-cours vides à retirer ensemble »** n'a
   probablement pas d'exemplaire réel chez toi — éprouvé par test
   automatique seulement (5 break-tests ROUGE).
4. **« Retirer de ma sélection » est inchangé** (il désactive le cours,
   ne touche pas le pointeur de cours actif) — vérifié au code, pas de
   rangée terrain dédiée.

---

**Au retour du terrain** : trier les échecs (défaut réel vs build en
retard), verser chaque échec réel au BACKLOG, mettre à jour ce fichier.
