# PORTES TERRAIN — Passe WebKit des specs Playwright (#456 + #418)

> **Cycle** : 1.87.4 → 1.87.5 (18 août 2026, session cloud « backlog »)
> **Artefact interactif** : <https://claude.ai/code/artifact/2ccba225-4893-4502-be58-557b812d6331>
> **État** : ✅ 1ʳᵉ passe RETOURNÉE ET TRAITÉE (18 août, relevé complet) ·
> ⏳ **2ᵉ passe DUE** (courte, §2-bis ci-dessous).
> Ce qui échoue devient un item de backlog, pas une note mentale.

---

## Retour de la 1ʳᵉ passe (18 août, relevé de Grégoire — 8 ✓ · 0 ✗ · 3 mesures)

**Bilan Mac WebKit : 91 passés / 2 échecs (3,7 min).**

- ✅ **Quatre réparations tiennent en WebKit** : plein écran, comptabilité du
  temps, import inter-trimestre, CAS D.
- ⛔ **La 5ᵉ (Alt/⌥+glisser) NE tient PAS en WebKit** — verte en Chromium,
  « le clone jamais créé » en WebKit. Le message de commit du cycle disait
  « 5 des 6 réparées » : il surestimait, sur la foi du seul moteur disponible
  en conteneur. ⮕ Spec **instrumentée** depuis : si le geste ne crée rien,
  une SONDE dispatche un `pointerdown` synthétique `altKey:true` sur la
  poignée et le message d'échec dit lequel des deux mondes casse — le
  modificateur ⌥ qui ne voyage pas avec la souris du harnais, ou le chemin
  applicatif dans ce moteur. Mécanique de la sonde éprouvée en Chromium
  (18 → 19 nœuds).
- ✅ **L'aimantation est enfin diagnostiquée par la mesure** : 426 au lieu de
  440 — 14 px manquants sur un geste de +40, la position d'une frame
  intermédiaire (mesure à 80 ms, drag throttlé par requestAnimationFrame).
  Même classe que le CAS D, qui repasse au vert en WebKit avec le même
  correctif. ⮕ **Réparée sur mesure** (verdict 3.1 de Grégoire : voie 1) :
  300 ms de repos avant chaque mesure, assertions exactes inchangées.
- ✅ **Baseline 6 → 2** (les deux restantes : aimantation + Alt/⌥) —
  transcrite dans le dépôt depuis le relevé. ⚠ Si la session Mac garde
  encore ce diff non committé, **le jeter** : il est identique.
- Remarque du relevé sur `genereLe` inchangé (même date) : exact, c'est un
  fichier neuf du même jour — rien à corriger.

---

## §0 · Préalable (2ᵉ passe)

- [ ] **0.1a** `Terminal` — dans le dossier `Monitorage_v6` :
  `git checkout main && git pull origin main`
  ⮕ Attendu : `Fast-forward`. La version d'app ne bouge pas (correctifs de
  tests seuls) : la fraîcheur se lit à `git log --oneline -1`, qui doit
  mentionner « retour de terrain #456 ».

## §2-bis · La 2ᵉ passe — deux fichiers, ~2 minutes

- [ ] **2.5** `Terminal` — depuis `Monitorage_v6/tests` :
  `npx playwright test integration/planif-alignement.spec.js integration/planif-toolbar.spec.js`
  ⮕ Attendu : ~2 min, un bilan `N passed / M failed`.
- [ ] **2.6** L'**aimantation** (« un bloc glissé près d'un autre COLLE »)
  est **verte** (⚠ prédiction : réparée depuis la mesure 426/440, éprouvée en
  Chromium seulement).
- [ ] **2.7** **Alt/⌥+glisser** est attendue **rouge** — mais son message
  d'échec contient maintenant une ligne qui commence par `SONDE :`.
- [ ] **2.7m** — MESURE : recopier la ligne `SONDE : …` en entier. C'est elle
  qui dit quoi réparer (harnais vs chemin applicatif).
- [ ] **2.8** `Terminal` — **si 2.6 est verte** : depuis `Monitorage_v6` :
  `node scripts/verifier-playwright.mjs --ecrire`
  ⮕ Attendu : baseline réécrite à **1** échec connu (Alt/⌥). Committer/pousser
  (ou le demander à la session Mac).
- [ ] **2.8m** — MESURE : recopier `totalEchecsConnus` et la liste.

## §4 · Ce que je n'ai pas pu vérifier (2ᵉ passe)

- La réparation de l'aimantation suit la mesure WebKit (426/440) et le
  précédent du CAS D — mais elle est éprouvée en **Chromium** ; 2.6 est le
  juge.
- La sonde d'Alt/⌥ est éprouvée en Chromium (où le chemin applicatif crée la
  copie) ; en WebKit, c'est précisément son verdict qu'on attend — aucun des
  deux mondes n'est présumé.

---

## Au retour du terrain

1. Trier les échecs : défaut réel, ou build en retard (0.1a) ?
2. Chaque échec réel → BACKLOG avec son numéro de porte.
3. Mettre à jour CE fichier : état, date, ce qui reste.
4. La baseline ne se réécrit **que** sur une passe réelle — jamais pour
   « faire propre ».
