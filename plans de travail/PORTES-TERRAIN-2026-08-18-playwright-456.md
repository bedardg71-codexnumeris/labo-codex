# PORTES TERRAIN — Passe WebKit des specs Playwright (#456 + #418)

> **Cycle** : 1.87.4 → 1.87.5 (18 août 2026, session cloud « backlog »)
> **Artefact interactif** : <https://claude.ai/code/artifact/2ccba225-4893-4502-be58-557b812d6331>
> **État** : ✅ 1ʳᵉ passe RETOURNÉE ET TRAITÉE (18 août, relevé complet) ·
> ✅ **2ᵉ passe EXÉCUTÉE** (18 août, au terminal, pas via l'artefact) ·
> ⏳ **Reste ouvert** : l'aimantation (porte 2.6), seul chantier de la suite.
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

## Retour de la 2ᵉ passe (18 août, exécutée en local — 5 portes ✓ · 1 ✗ · 2 mesures)

**Bilan des deux specs : 7 passés / 2 échecs (57,7 s).**
**Bilan de la suite entière (via la sentinelle) : baseline inchangée à 2.**

- ⛔ **La prédiction sur l'aimantation est infirmée** : la spec reste rouge,
  mais **autrement**. La mesure n'est plus 426 (frame intermédiaire) — elle
  est **400**, c'est-à-dire la position de départ du bloc, qui est aussi
  celle de REF. Le repos de 300 ms a donc réglé ce qu'il visait, et découvert
  un second problème derrière. Détail et hypothèses au §4.
- ✅ **La sonde d'Alt/⌥ a rendu son verdict, et il est net** : le chemin
  applicatif CRÉE la copie en WebKit ; c'est le modificateur ⌥ qui ne voyage
  pas avec la souris du harnais. ⮕ Ce n'est **pas** un défaut de l'app. La
  spec teste un geste que Playwright ne sait pas produire dans ce moteur.
- ✅ **Aucune régression ailleurs** : la régénération de la baseline relance
  les 87 tests, et son diff est vide. C'était la vraie inconnue de 2.8.
- ⚠ **La 2ᵉ passe n'a pas été remplie via l'artefact interactif** : elle a été
  exécutée au terminal. Le formulaire HTML jumeau reste donc à l'état « 2ᵉ
  passe due » — il a servi de plan, pas de journal.

---

## §0 · Préalable (2ᵉ passe)

- [x] **0.1a** `Terminal` — dans le dossier `Monitorage_v6` :
  `git checkout main && git pull origin main`
  ⮕ Attendu : `Fast-forward`. La version d'app ne bouge pas (correctifs de
  tests seuls) : la fraîcheur se lit à `git log --oneline -1`, qui doit
  mentionner « retour de terrain #456 ».
  ⮕ **Fait** : `Fast-forward` 179843b3 → 6cb8645d (2 commits, 6 fichiers).

## §2-bis · La 2ᵉ passe — deux fichiers, ~2 minutes

- [x] **2.5** `Terminal` — depuis `Monitorage_v6/tests` :
  `npx playwright test integration/planif-alignement.spec.js integration/planif-toolbar.spec.js`
  ⮕ **Relevé : 7 passed / 2 failed en 57,7 s** (projet `webkit`).
- [ ] **2.6** L'**aimantation** (« un bloc glissé près d'un autre COLLE »)
  est **verte**. ⛔ **PRÉDICTION INFIRMÉE — la spec est ROUGE.**
  `planif-alignement.spec.js:85` : attendu `440`, reçu **`400`**.
  ⮕ Le 426 a disparu : le repos de 300 ms a bien réglé la frame intermédiaire.
  Ce qu'il révèle est un autre échec, décrit au §4.
- [x] **2.7** **Alt/⌥+glisser** est attendue **rouge** — mais son message
  d'échec contient maintenant une ligne qui commence par `SONDE :`.
  ⮕ **Conforme** : rouge, et la sonde a parlé.
- [x] **2.7m** — MESURE, la ligne recopiée en entier :
  > `SONDE : un pointerdown synthétique altKey:true CRÉE la copie — le chemin`
  > `applicatif marche dans ce moteur ; c'est le modificateur ⌥ qui ne voyage`
  > `pas avec la souris du harnais.`
  ⮕ **Verdict : le défaut est dans le HARNAIS Playwright, pas dans l'app.**
  La carte fait son travail en WebKit aussi. Cette rougeur ne donne donc pas
  un item de backlog applicatif — elle reste une dette d'outillage de test.
- [x] **2.8** `Terminal` — **si 2.6 est verte** : depuis `Monitorage_v6` :
  `node scripts/verifier-playwright.mjs --ecrire`
  ⮕ Exécutée **malgré 2.6 rouge**, sur demande explicite. La condition visait
  à éviter de figer une dette non rétrécie ; la baseline étant déjà à ces
  deux specs, l'écriture ne pouvait rien figer de neuf.
- [x] **2.8m** — MESURE : `totalEchecsConnus` = **2** (visé : 1), soit
  `planif-alignement.spec.js › ⚠ un bloc glissé près d'un autre COLLE…` et
  `planif-toolbar.spec.js › Alt/⌥+glisser un bloc…`.
  ⮕ **`git diff` de la baseline : VIDE.** Le fichier régénéré est identique.
  La sentinelle relançant les **87** tests et pas seulement nos deux specs,
  ce diff vide dit plus que la passe ciblée : **aucune rougeur nouvelle**
  **nulle part ailleurs dans la suite**. La dette #456 est stable à 2.

## §4 · Ce qui reste à trancher (au sortir de la 2ᵉ passe)

- **L'aimantation (2.6)** est le seul chantier ouvert. Deux lectures encore
  possibles, que la mesure n'a pas départagées : soit le bloc n'est jamais
  parti (drag non démarré), soit il est parti puis a été **aimanté sur REF
  alors qu'il est à 40 px** — distance à laquelle la spec postule qu'aucune
  aimantation ne doit se produire. La seconde est la plus économique : le
  geste rendait 426 avant le repos de 300 ms, donc le drag démarrait bien.
  ⮕ Ce qui départagerait : compter les guides et mesurer à mi-geste, sans
  toucher aux assertions.
- **Extrapolation, non vérifiée** : seuil d'aimantation plus large en WebKit,
  ou écart d'échelle px CSS / px écran entre les moteurs.
- La sonde d'Alt/⌥, elle, a rendu son verdict — plus rien à présumer là.

---

## Au retour du terrain

1. ✅ Trier les échecs : les deux rougeurs sont triées ci-dessus — Alt/⌥ est
   un défaut de harnais (pas de BACKLOG applicatif), l'aimantation reste à
   trancher.
2. ⏳ Chaque échec réel → BACKLOG avec son numéro de porte : reste l'item
   « aimantation WebKit à 40 px » (porte 2.6), à ouvrir.
3. ✅ Mettre à jour CE fichier : fait le 18 août au retour de la 2ᵉ passe.
4. ✅ La baseline ne se réécrit **que** sur une passe réelle — respecté : la
   régénération de 2.8 a relancé les 87 tests, et son diff est vide.
