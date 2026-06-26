# Plan d'exécution — Brique A (suite) : écrans d'ANALYSE namespacés

> Créé le 24 juin 2026 (session Cowork). **Cadrage à froid, à relire AVANT de coder.**
> Suite directe de la Brique A « flux d'évaluation » (livrée 24 juin) du
> `PLAN-namespacing-par-trimestre.md`. Prolonge l'audit
> `Rapports/AUDIT-call-sites-namespacing-2026-06-24.md` (Catégorie 1b).
> **Vérifié sur le code courant** (post-livraison Brique A éval), pas seulement sur l'audit.

---

## 0. Pourquoi maintenant (lien avec l'objectif réel)

Finalité opérationnelle : l'**analyse longitudinale des résultats** (A25 ⇄ A24 ⇄ H24,
cours 101/102/103) pour l'article avec Steve Bissonnette (mi-août). Cette analyse se
lit dans les écrans **profil étudiant, graphiques de progression, tableau de bord,
synthèse**. Or la Brique A livrée le 24 juin n'a branché que le sous-système
**évaluation** (édition/calcul d'une éval) ; les écrans d'analyse lisent **encore le
global en direct**. Tant qu'ils ne sont pas namespacés, consulter un trimestre archivé
(A25…) y affiche les modèles du mauvais trimestre (échelle vide, grille « introuvable »).
**C'est le verrou suivant pour l'objectif.**

---

## 1. Invariant de sûreté (inchangé, central)

`cle(nomCle)` (`trimestres.js:266`, exposé `window.cle` l.1905) :

- trimestre actif **NON archivé** (cas **H26 actif**) → rend la **clé globale INCHANGÉE**
  (`trimestres.js:294`) → **comportement identique**, substitution = **no-op** pour H26 ;
- trimestre **archivé AVEC copies** (`a2025_*`) → rend la clé **namespacée** ;
- archivé **sans** copie → **repli** sur le global (rétrocompat).

Conséquence directe : **toute la Brique A ci-dessous est sûre à livrer immédiatement**
(H26 = no-op), et son **effet visible sur A25 n'apparaît qu'une fois les copies
`a2025_*` posées** (pilote A25, qui attend tes JSON). Le code et la donnée sont donc
**découplés** — on peut faire le code sans attendre les JSON.

---

## 2. Périmètre confirmé (état réel du code, 24 juin soir)

**Idiome exact à employer** (copié de la Brique A éval déjà livrée) :

```js
db.getSync(cle('echellesTemplates'), [])
db.getSync(cle('grillesTemplates'), [])
db.getSync(cle(`cartouches_${grilleId}`), [])
```

`cle` est un global (pas d'import) ; même écriture que `evaluation-chargement.js:216` etc.

### 2.1 Sites Brique A — à brancher sur `cle()` (8 fichiers, 16 sites)

Tous classés **lecture d'affichage/diagnostic d'un trimestre consulté** (aucun n'est un
recalcul de note re-sauvegardé — ce chemin-là, `evaluation-calcul.js`, est déjà fait).
Substitution uniforme, sûre.

| Fichier | Ligne(s) | Clé | Rôle |
|---|---|---|---|
| `liste-evaluations.js` | 865 | cart | `obtenirNomCartouche` — nom affiché dans la liste |
| `tableau-bord-apercu.js` | 692, 1730 | éch | distribution de performance |
| `graphiques-progression.js` | 378, 3823 | éch, gr | zones colorées du graphe |
| `synthese-retroaction-data.js` | 242, 930, 936 | éch, gr, cart | `lireGrille`/`lireCartouche` (données PDF de synthèse, aussi consommées par l'export #333) |
| `profil-etudiant-calculs.js` | 52 | éch | table de conversion IDME (score↔niveau) |
| `profil-etudiant-diagnostics.js` | 396 | éch | couleurs des barres SRPNF |
| `profil-etudiant-helpers.js` | 147, 260 | éch, gr | échelle/grille de référence du dépistage |
| `profil-etudiant-sections-affichage.js` | 686, 3191, 3579, 3800 | éch×3, gr | sections profil / accompagnement |

### 2.2 Correction de l'audit — 2 fichiers reclassés HORS Brique A

L'audit (Cat. 1b) listait `accompagnement.js` et `statistiques.js`. **Lecture du code
courant : ce ne sont pas des lectures de consultation de résultats**, mais de la
**bibliothèque/onboarding** → relèvent de la **Catégorie 6 « à décider »** (UX), pas
de la Brique A. **Ne pas les substituer dans ce chantier.**

| Fichier | Ligne(s) | Vrai rôle | Verdict |
|---|---|---|---|
| `accompagnement.js` | 505, 519, 535, 537 | conditions du **tour guidé** (« crée ta première grille/échelle/cartouche » — teste si la bibliothèque locale est vide) | Cat. 6 — même nature que `pratiques-gestion.js:1412/1508` |
| `statistiques.js` | 142, 146 (+ boucle `cartouches_` ~150) | **compteurs** « X grilles / Y échelles / Z cartouches » de l'écran Matériel | Cat. 6 |

Question Cat. 6 (à trancher AVANT la Brique B, pas ici) : ces compteurs/tours doivent-ils
suivre le **trimestre actif** ou rester une **bibliothèque globale** ? Le principe directeur
(« chaque trimestre porte ses modèles ») pousse vers namespacé ; mais ces vues servent à
**gérer/créer** la bibliothèque, argument pour le global. **Décision Grégoire requise.**

---

## 3. Découpage par fichier & ordre (du moins risqué au plus sensible)

Un **commit par fichier** (zéro-dette), sentinelle + oracle L0 vert à chaque étape.

1. `liste-evaluations.js` (1 site) — affichage pur, plus petit.
2. `tableau-bord-apercu.js` (2) — distribution.
3. `graphiques-progression.js` (2) — vérifier que `:3823` est bien sur un chemin de
   consultation (fichier volumineux).
4. `synthese-retroaction-data.js` (3) — alimente aussi l'export PDF (#333) : valider l'export.
5. **Grappe profil** (la plus sensible — dépistage SOLO/RaI + conversion IDME, donc les
   chiffres mêmes de l'article) : `profil-etudiant-calculs.js` → `-diagnostics.js` →
   `-helpers.js` → `-sections-affichage.js` (8 sites). Validation visuelle + L0 renforcées.

**Point de vigilance grappe profil** : `calculs.js:52` et `diagnostics.js:396` résolvent
l'échelle par `echelles.find(e => e.active) || echelles[0]`. En mode archive, la copie
`a2025_echellesTemplates` doit donc contenir l'échelle **avec son drapeau `active`** (ou
au moins en position [0]) — **dépendance sur la donnée du pilote A25**, pas sur le code.

---

## 4. Tests (règle projet — obligatoires)

1. **Étendre le ratchet existant** `tests/unit/sentinelle-cle-modeles-trimestre-briqueA.test.js` :
   - ajouter les **8 fichiers Brique A** (§2.1) au tableau `fichiers` du `describe('RATCHET…')`
     (assert : plus aucune `db.getSync('grillesTemplates'` / `'echellesTemplates'` /
     `` `cartouches_ `` nue) ;
   - **NE PAS** y ajouter `accompagnement.js` ni `statistiques.js` (ils gardent volontairement
     le global) ;
   - ajouter une assertion « branchement `cle()` présent » sur 1-2 fichiers représentatifs.
   - Les 3 tests de **comportement** de `cle()` (invariant H26 / archive / repli) existent
     déjà et restent valables — ne pas dupliquer.
2. **1 Playwright** (`tests/integration/*-rendu.spec.js`) : fixtures avec copies `a2025_*`,
   trimestre A25 actif → profil + graphique + tableau de bord + synthèse **résolvent
   `a2025_*`** (échelle non vide, pas d'avertissement « grille introuvable ») ; trimestre
   H26 actif → **rendu identique** (invariant).
3. **Break-test** chaque sentinelle (la faire ROUGIR : casser `cle()` ou réintroduire une
   lecture nue → rouge ; restaurer → vert). §4 fin de session.
4. **Oracle L0** `scripts/valider-golden-master-trimestre.mjs` **VERT** après chaque
   fichier : **aucune note ne bouge**. (L2 isolation non affecté.)

---

## 5. Ce que ce chantier NE fait pas (frontières explicites)

- Ne touche pas `accompagnement.js` / `statistiques.js` (Cat. 6, décision UX à part).
- Ne touche pas la **création** (Brique B), l'**import-copie** (Brique C), la **migration**
  (Brique D), ni le mécanisme d'archivage (Cat. 5 — `trimestres.js`, à préserver).
- Ne pose pas les copies `a2025_*` (c'est le **pilote A25**, qui attend tes JSON) ; ce
  chantier rend juste les écrans **capables** de les lire.

---

## 6. Dépendances / inputs

- **Aucun input requis pour livrer le code** (H26 = no-op, sûr immédiatement).
- Pour **voir l'effet sur A25** : copies `a2025_grillesTemplates` / `_echellesTemplates` /
  `_cartouches_<grille>` en place (pilote A25 — tes JSON), avec l'échelle marquée `active`.

---

## 7. Décisions ouvertes (pour toi, Grégoire)

1. **Cat. 6** : compteurs `statistiques.js` + tour guidé `accompagnement.js` → suivre le
   trimestre actif, ou rester global ? (à trancher avant Brique B).
2. Ordre de réplication après le pilote A25 : A24 puis H24 (tableurs complets déjà présents).
3. Confirmer le découpage **un commit par fichier** vs un commit unique pour les 8 fichiers
   (je recommande par fichier, pour garder L0 vert à chaque pas).
