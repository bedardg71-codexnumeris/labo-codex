# PORTES TERRAIN — Passe WebKit des specs Playwright (#456 + #418)

> **Cycle** : 1.87.4 → 1.87.5 (18 août 2026, session cloud « backlog »)
> **Artefact interactif** : <https://claude.ai/code/artifact/2ccba225-4893-4502-be58-557b812d6331>
> **État** : ✅ 1ʳᵉ et 2ᵉ passes RETOURNÉES ET TRAITÉES (18 août, relevés
> complets) · ⏳ **3ᵉ passe DUE** (2 minutes, §2-ter ci-dessous).
> Ce qui échoue devient un item de backlog, pas une note mentale.

---

## Retour de la 1ʳᵉ passe (18 août — 91 passés / 2 échecs)

- ✅ Quatre réparations tiennent en WebKit (plein écran, comptabilité du
  temps, import inter-trimestre, CAS D). Baseline **6 → 2**.
- ⛔ La 5ᵉ (Alt/⌥) ne tenait pas — le « 5 des 6 » du commit surestimait,
  attrapé par Grégoire. Spec instrumentée d'une sonde.
- 📏 L'aimantation mesurée : 426 au lieu de 440 → réparée (300 ms de repos
  avant mesure, classe CAS D).

## Retour de la 2ᵉ passe (18 août — relevé complet, 6/6 portes traitées)

- ✅ **SONDE : verdict net.** « Un pointerdown synthétique altKey:true CRÉE
  la copie — le chemin applicatif marche dans ce moteur ; c'est le
  modificateur ⌥ qui ne voyage pas avec la souris du harnais. » ⮕ **Pas un
  bug d'app.** La spec est réécrite : le geste est piloté au niveau des
  `PointerEvent` (ceux que le navigateur produirait — pointerdown altKey sur
  la poignée, pointermove sur document avec une frame rAF entre chaque,
  mesure pendant le drag, pointerup). La vraie souris reste couverte par le
  CAS D, vert en WebKit. Break-testée : sans `altKey`, elle rougit.
- ⚠ **L'aimantation a changé de nature d'échec : 400 au lieu de 440** — et
  400 est AUSSI la position de départ de MOB. Le repos a bien réglé la frame
  intermédiaire (le 426 a disparu) ; ce qui reste est indiscernable sans
  données : « aimanté sur REF » (il faudrait zoom ≈ 0,15, le seuil étant
  `AIMANT_SEUIL = 6 px écran ÷ zoom`) ou « le drag s'est terminé/n'a pas
  tenu ». L'hypothèse concurrente de Grégoire est gardée vivante. ⮕ **La
  spec embarque désormais son diagnostic** : à l'échec, le message livre
  `zoom`, `guidesVisibles`, `dragEnCours`, largeurs réelles des deux blocs
  — de quoi trancher entre les lectures.
- ✅ Baseline confirmée à 2 par la passe complète (`--ecrire`) : aucune
  rougeur nouvelle ailleurs dans la suite.

---

## §0 · Préalable (3ᵉ passe)

- [ ] **0.1a** `Terminal` — dossier `Monitorage_v6` :
  `git checkout main && git pull origin main`, puis `git log --oneline -1`
  ⮕ Attendu : `Fast-forward`, dernier commit mentionnant « 3ᵉ passe » ou
  « pointerevent ». L'app ne bouge pas (tests seuls).

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
2. Chaque échec réel → BACKLOG avec son numéro de porte.
3. Mettre à jour CE fichier : état, date, ce qui reste.
4. La baseline ne se réécrit **que** sur une passe réelle.
