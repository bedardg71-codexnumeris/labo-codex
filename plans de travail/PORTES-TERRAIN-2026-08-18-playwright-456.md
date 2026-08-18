# PORTES TERRAIN — Passe WebKit des specs Playwright (#456 + #418)

> **Cycle** : 1.87.4 → 1.87.5 (18 août 2026, session cloud « backlog »)
> **Artefact interactif** : <https://claude.ai/code/artifact/2ccba225-4893-4502-be58-557b812d6331>
> **État** : ✅ 1ʳᵉ, 2ᵉ et 3ᵉ passes RETOURNÉES ET TRAITÉES (18 août) ·
> ⏳ **4ᵉ passe DUE** (2 minutes, §2-quater — possiblement la dernière :
> si tout est vert, la baseline tombe à 0 et #456 se ferme).
> Ce qui échoue devient un item de backlog, pas une note mentale.

---

## Retour de la 1ʳᵉ passe (91 passés / 2 échecs, 3,7 min)

Quatre réparations tiennent ; la 5ᵉ (Alt/⌥) non — sonde posée. Aimantation
mesurée 426/440 → repos de 300 ms. Baseline 6 → 2.

## Retour de la 2ᵉ passe (7/2 en 57,7 s ; suite entière : baseline stable à 2)

- Sonde : **Alt/⌥ n'est pas un bug d'app** (le chemin applicatif duplique en
  WebKit ; c'est le modificateur ⌥ du harnais qui ne voyage pas) → spec
  réécrite en PointerEvent purs.
- Aimantation : 400 reçu (= position de départ) → diagnostic embarqué dans
  la spec (`zoom`, `guidesVisibles`, `dragEnCours`, largeurs).

## Retour de la 3ᵉ passe (8 passés / 1 échec, 55 s)

- ✅ **Alt/⌥ EST VERTE en WebKit — la réécriture PointerEvent tient.**
  ⚠ Note de lecture du relevé : la porte 2.10 est revenue cochée ✗, mais la
  mesure jointe la contredit (« 8 passés / 1 échec, l'échec :
  planif-alignement:105 ») — Alt/⌥ n'est pas dans les échecs, donc elle a
  passé. **La mesure fait foi.** La dette d'outillage Alt/⌥ est close.
- 📏 **Le diagnostic embarqué a départagé les deux hypothèses de la 2ᵉ
  passe — c'est la première (bug de harnais)** : reçu **433** (= 440 − un
  pas de ~6,7 px), `guidesVisibles: 0` (aucun snap — un snap trace un
  guide), `dragEnCours: true` (le drag vit). Ni aimantation ni frame en
  retard : **WebKit ne livre pas le dernier `pointermove` d'un trajet
  groupé** (`steps: 6`) — le 426 de la 1ʳᵉ passe manquait DEUX pas, le 433
  en manquait UN. L'app est hors de cause.

### Ce qui en a été fait (18 août, session cloud — commit « 4ᵉ passe »)

- **Trajet livré pas à pas, dernier mouvement doublé** (patron du CAS D,
  vert en WebKit) : mouvements explicites espacés d'attentes, le mouvement
  final émis deux fois, puis repos.
- **L'assertion vise l'invariant, plus l'arrivée au pixel** : « aucune
  aimantation à 40 px » s'affirme par `guides = 0` et une position loin de
  400 (`> 425` — un snap rendrait 400) ; l'arrivée exacte du pointeur est
  l'affaire du CAS D, qui l'affirme lui aussi par inégalités. La phase
  « à 4 px » garde son égalité stricte (`400`) : c'est le snap lui-même qui
  POSE la position. Le diagnostic reste embarqué. 3/3 verts en Chromium.

---

## §0 · Préalable (4ᵉ passe)

- [ ] **0.1a** `Terminal` — dossier `Monitorage_v6` :
  `git checkout main && git pull origin main`, puis `git log --oneline -1`
  ⮕ Attendu : `Fast-forward`, dernier commit mentionnant la « 4ᵉ passe ».

## §2-quater · La 4ᵉ passe — deux fichiers, ~2 minutes

- [ ] **2.12** `Terminal` — dossier `Monitorage_v6/tests` :
  `npx playwright test integration/planif-alignement.spec.js integration/planif-toolbar.spec.js`
  ⮕ Attendu (⚠ prédiction, éprouvée en Chromium) : **9 passed / 0 failed**.
- [ ] **2.12m** — MESURE : recopier la ligne de bilan ; si un échec subsiste,
  son message EN ENTIER (le diagnostic embarqué y sera).
- [ ] **2.13** `Terminal` — **si 2.12 est 9/9** : dossier `Monitorage_v6` :
  `node scripts/verifier-playwright.mjs --ecrire`, puis committer/pousser.
  ⮕ Attendu : baseline à **0** — la dette #456 est éteinte.
- [ ] **2.13m** — MESURE : recopier `totalEchecsConnus` (et la liste s'il en
  reste).

## §4 · Ce que je n'ai pas pu vérifier (4ᵉ passe)

- La réparation du trajet suit le diagnostic mesuré (433, un pas manquant),
  mais n'a tourné qu'en Chromium — 2.12 est le juge.
- Si le dernier mouvement doublé était LUI AUSSI avalé par WebKit (rien ne
  l'indique, mais rien ne l'exclut), l'assertion tolérante (> 425) tient
  tant qu'au moins 4 pas sur 6 sont livrés — les deux passes mesurées en
  livraient 4 et 5.

---

## Au retour du terrain

1. Si 2.12 est 9/9 et la baseline à 0 : **#456 se ferme** — cocher l'item au
   BACKLOG et retirer la ligne « 6 specs rouges » de RELAIS.md.
2. Sinon : le message de 2.12m (diagnostic embarqué) est la donnée du
   prochain cycle.
3. Mettre à jour CE fichier : état, date, ce qui reste.
