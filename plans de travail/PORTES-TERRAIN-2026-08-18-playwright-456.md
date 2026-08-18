# PORTES TERRAIN — Passe WebKit des specs Playwright (#456 + #418)

> **Cycle** : 1.87.4 → 1.87.5 (18 août 2026, session cloud « backlog »)
> **Artefact interactif** : <https://claude.ai/code/artifact/2ccba225-4893-4502-be58-557b812d6331>
> **État** : ✅ 1ʳᵉ et 2ᵉ passes RETOURNÉES ET TRAITÉES (18 août, relevés
> complets) · ⏳ **3ᵉ passe DUE** (2 minutes, §2-ter ci-dessous).
> Ce qui échoue devient un item de backlog, pas une note mentale.

---

## Retour de la 1ʳᵉ passe (18 août — 91 passés / 2 échecs, 3,7 min)

- ✅ Quatre réparations tiennent en WebKit (plein écran, comptabilité du
  temps, import inter-trimestre, CAS D). Baseline **6 → 2**.
- ⛔ La 5ᵉ (Alt/⌥) ne tenait pas — le « 5 des 6 » du commit surestimait,
  attrapé par Grégoire. Spec instrumentée d'une sonde.
- 📏 L'aimantation mesurée : 426 au lieu de 440 → réparée (300 ms de repos
  avant mesure, classe CAS D).

## Retour de la 2ᵉ passe (18 août, exécutée au terminal — 5 portes ✓ · 1 ✗ · 2 mesures)

**Bilan des deux specs : 7 passés / 2 échecs (57,7 s, projet `webkit`).**
**Bilan de la suite entière (via la sentinelle `--ecrire`) : baseline
inchangée à 2 — diff VIDE, donc aucune rougeur nouvelle nulle part ailleurs
dans les 87 tests.** (2.8 a été exécutée malgré 2.6 rouge, sur demande
explicite : la baseline étant déjà à ces deux specs, l'écriture ne pouvait
rien figer de neuf.) ⚠ La passe a été remplie au terminal, pas via
l'artefact — il a servi de plan, pas de journal.

- ✅ **SONDE Alt/⌥ : verdict net.** « Un pointerdown synthétique altKey:true
  CRÉE la copie — le chemin applicatif marche dans ce moteur ; c'est le
  modificateur ⌥ qui ne voyage pas avec la souris du harnais. » ⮕ **Pas un
  bug d'app** : la carte fait son travail en WebKit aussi ; la spec testait
  un geste que Playwright ne sait pas produire dans ce moteur. Dette
  d'outillage, pas de backlog applicatif.
- ⛔ **La prédiction sur l'aimantation est infirmée — elle est rouge
  AUTREMENT : 400 au lieu de 440** (`planif-alignement.spec.js:85`), et 400
  est AUSSI la position de départ de MOB (et celle de REF). Le repos de
  300 ms a réglé ce qu'il visait (le 426 a disparu) et découvert un second
  problème derrière.

### Ce qui en a été fait (18 août, session cloud — commit « 3ᵉ passe »)

- **Alt/⌥ réécrite en PointerEvent purs**, conformément au verdict de la
  sonde : pointerdown `altKey:true` sur la poignée ⠿, pointermove sur
  `document` (là où le drag écoute) avec une frame rAF entre chaque (drag
  throttlé), mesure PENDANT le drag, pointerup. La mécanique à la vraie
  souris reste couverte par le CAS D, vert en WebKit. 9/9 verts en Chromium ;
  **break-testée** : sans `altKey`, elle rougit. La sonde, verdict rendu et
  acté, est retirée.
- **L'aimantation embarque son diagnostic** — exactement ce que le §4 de la
  2ᵉ passe demandait (« compter les guides et mesurer, sans toucher aux
  assertions ») : à l'échec, le message livre `zoom`, `guidesVisibles`,
  `dragEnCours` et les largeurs réelles des deux blocs. De quoi départager
  « aimanté sur REF » (exigerait zoom ≈ 0,15, le seuil étant
  `AIMANT_SEUIL = 6 px écran ÷ zoom`) et « le drag s'est interrompu »
  (l'hypothèse concurrente du relevé, gardée vivante — `dragEnCours:false`
  la confirmerait). Les assertions exactes n'ont pas bougé ; rien n'est
  tranché au jugé.

---

## §0 · Préalable (3ᵉ passe)

- [ ] **0.1a** `Terminal` — dossier `Monitorage_v6` :
  `git checkout main && git pull origin main`, puis `git log --oneline -1`
  ⮕ Attendu : `Fast-forward`, dernier commit mentionnant la « 3ᵉ passe »
  (PointerEvent / diagnostic). L'app ne bouge pas (tests seuls).

## §2-ter · La 3ᵉ passe — deux fichiers, ~2 minutes

- [ ] **2.9** `Terminal` — dossier `Monitorage_v6/tests` :
  `npx playwright test integration/planif-alignement.spec.js integration/planif-toolbar.spec.js`
- [ ] **2.10** **Alt/⌥+glisser** est **verte** (⚠ prédiction : le verdict de
  ta sonde dit que le chemin applicatif marche en WebKit ; la spec ne passe
  plus par le modificateur du harnais).
- [ ] **2.10m** — MESURE : si l'aimantation est encore rouge, recopier son
  message d'échec EN ENTIER — il contient maintenant une ligne
  `diagnostic : {"x":…,"zoom":…,"guidesVisibles":…,"dragEnCours":…,…}`.
  C'est elle qui tranche « aimanté » vs « drag interrompu ». (Si elle est
  verte, écrire « verte ».)
- [ ] **2.11** `Terminal` — **si 2.10 est verte** : `node
  scripts/verifier-playwright.mjs --ecrire` puis committer/pousser.
  ⮕ Attendu : baseline à **1** (l'aimantation) — ou **0** si tout est vert.
- [ ] **2.11m** — MESURE : recopier `totalEchecsConnus` et la liste.

## §4 · Ce que je n'ai pas pu vérifier (3ᵉ passe)

- La réécriture d'Alt/⌥ suit le verdict de TA sonde, mesuré en WebKit — mais
  la spec réécrite n'a tourné qu'en Chromium (9/9 verts, break-testée).
  2.10 est le juge.
- Le diagnostic embarqué de l'aimantation n'a jamais produit de relevé
  WebKit : c'est sa raison d'être (2.10m).

---

## Au retour du terrain

1. Trier les échecs : défaut réel, ou build en retard (0.1a) ?
2. Chaque échec réel → BACKLOG avec son numéro de porte. (Alt/⌥ est tranché :
   dette d'outillage, pas d'item applicatif. L'aimantation attend son
   diagnostic avant tout item.)
3. Mettre à jour CE fichier : état, date, ce qui reste.
4. La baseline ne se réécrit **que** sur une passe réelle.
