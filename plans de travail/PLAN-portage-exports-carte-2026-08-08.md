# PLAN — Portage des exports vers la Carte d'alignement

> **Écrit le 8 août 2026 en après-midi, AVANT de coder.** Même rôle que
> `PLAN-alignement-noeuds-et-duree-2026-08-08.md` : **filet contre la
> compression**. Tout ce qui est tranché est ici avec sa source ; ce qui reste
> ouvert est marqué 📐 avec une recommandation. La session qui exécute n'a
> RIEN à re-débattre — elle lit, elle vérifie, elle livre.
>
> État de départ : **1.56.4**, build `0808-1156`, Vitest **1889/1889**
> (219 fichiers), `main` seule vérité. Dernier ID BACKLOG : **#429**.
>
> Périmètre BACKLOG : **#424** (exécution — l'audit est consommé) et le début
> de **#425** (les deux préalables de vivacité). Documents fondateurs :
> `AUDIT-carte-alignement-exports-productions-2026-08-08.md` (§3bis =
> l'arbitrage tranché, §1 = le relevé au code) — **à relire AVANT le Lot C**.

---

## 0. CE QUI EST DÉJÀ TRANCHÉ — ne pas rouvrir

| Décision | Verdict | Source |
|---|---|---|
| Porter les exports AVANT de supprimer la page | ✅ acté | audit §3bis (D3) |
| UN générateur, profondeur en paramètre, format en mise en forme finale | ✅ acté | audit §3bis (D5) |
| TROIS niveaux : **Sommaire** (plan de cours) / **Déroulement** (en classe) / **Alignement** (la preuve) | ✅ acté | audit §3bis (D4) |
| Générateur d'abord, niveaux ensuite (D5 avant D4 à l'exécution) | ✅ acté | audit §3bis |
| Les données migrent vers le nœud **APRÈS** que les exports le lisent — jamais avant | ✅ acté, ⚠ contrainte d'ordre | audit §3bis (D2) |
| Rétroaction **formative** → nœud **ACTIVITÉ** ; `productionId` → nœud **ÉVALUATION** | ✅ veto Grégoire | audit §3bis (D2b) |
| Le sélecteur du nœud Évaluation **SURVIT**, sens distinct : rétroaction *sur le rendu* — libellé clarifié | ✅ décision Grégoire (option 2, 8 août midi) | audit §3bis (D2b résolue) |
| Vocabulaire : « **Leçon** », jamais « Séance » dans les exports | ✅ acté (les 6-7 août) | audit §1.4 |
| Durées : `dureeRollupNoeud()`, jamais `lecon.metadata.duree` | ✅ acté (4 août) | audit §1.5 |
| Objectifs : **au pluriel**, avec les liens « servi par » (#403) | ✅ acté | audit §1.6 |
| Renommage de l'onglet → « Carte d'alignement » | ✅ tranché (#426) — se fait avec #421, PAS dans ce chantier | BACKLOG #426 |

**Le relevé D1 est FAIT** (Grégoire, 8 août midi, données réelles) :
**3 rétroactions à migrer (h2026), 0 production, 0 référence morte.**
La migration du Lot F porte trois valeurs, rien d'autre — périmètre connu
d'avance, pas de surprise possible.

---

## 1. INVENTAIRE TECHNIQUE — repères vérifiés au 8 août (1.56.4)

### Ce qui doit MOURIR (zéro-dette : le chantier retire ce qu'il remplace)

| Quoi | Où | Note |
|---|---|---|
| `genererPlanTexte()` | `planification-carte.js:5196` | dit « SÉANCE », compte la durée en double |
| `genererPlanTSV()` | `planification-carte.js:5314` | colonne « Séance » |
| `genererExportTXT(estEleve)` | `organisateur.js:1084` | porte l'axe d'audience §1.9 |
| `genererExportMD(estEleve)` | `organisateur.js:1211` | idem |
| `sauvegarderChoixActivite` **×2, dupliquée verbatim** | `organisateur.js:1643` ET `planification-carte.js:5011` | meurt avec le stockage `activites` |
| la liste `retros` en dur **×3** | `organisateur.js:742`, `planification-carte.js:2150`, `:5115` | devient UNE constante au Lot E |
| le bouton « Exporter / Importer » | `index.html:4482` (`org-btn-export`) | |
| la page « Plan de la leçon » entière | onglet + section `index.html`, `js/organisateur.js` | Lot G — EN DERNIER |
| le sous-objet `activites` de `planification_seances` | clés composites `<carte>::<lecon>` | ⚠ la clé elle-même SURVIT : elle porte les **notes** (#367) |

### Ce qui doit VIVRE à la fin

- **Un** générateur : traverse la carte une fois, **profondeur** en paramètre
  (3 niveaux), **format** en sortie (texte · TSV · Markdown). C'est lui qui
  corrige « SÉANCE », le double comptage et les objectifs — **une fois, pas six**.
- Le sélecteur de rétroaction **formative** sur les activités (Inspecteur,
  `TYPES_AVEC_DUREE` non — `TYPES_ACTIVITE`), écrivant `metadata.retroaction`
  du nœud activité.
- Le sélecteur du nœud Évaluation, **relibellé** « Rétroaction sur le rendu ».
- L'import Markdown corrigé (et déplacé — 📐 voir §3.3).
- `planification_seances` réduite aux notes composites de #367.

### Ce qui RÉSISTE déjà (ne pas réécrire)

Les exports passent par `obtenirLabelNoeud()` — l'Exposé et les 5 nœuds
d'enseignement explicite sortent déjà correctement (audit §1.8). Le nouveau
générateur DOIT garder cet idiome : **jamais de liste de types en dur**.

---

## 2. LES LOTS, DANS L'ORDRE

> Chaque lot : un fichier à la fois, sentinelle + **break-test §4** avant
> commit, `cd tests && npm test`, puis commit. L'ordre des lots est une
> **contrainte**, pas une préférence — D2 (Lot F) casse les exports s'il
> passe avant C-D.

### Lot A — l'import Markdown écrit dans le champ MORT (petit, isolé)

`organisateur.js:1558` et `:1588` posent `metadata.objectif` (chaîne legacy)
au lieu de `metadata.objectifs` (liste #403). Aujourd'hui rattrapé par la
migration de chargement — l'objectif importé n'apparaît qu'après un
rechargement. Corriger : écrire directement le format vivant (voir
`appliquerObjectifs` / le format `{id, texte}` de `planification-carte.js`).
Sentinelle : l'import MD ne produit plus jamais `metadata.objectif`.

### Lot B — vivacité de `productionId` : les DEUX chemins (petit, correctif)

Le relevé dit 0 référence morte AUJOURD'HUI — le correctif protège les
rentrées à venir (`productions` est namespacée : le trou s'ouvre à chaque
reprise inter-trimestre).

1. `planification-donnees.js` (reprise de carte, ~`:486-492`) : appliquer à
   `metadata.productionId` le MÊME contrôle de vivacité que `coursId` — mais
   contre `<trimestre-cible>_productions` (avec le repli clé nue de
   `trimestres.js:717` — leçon #419 : lire par le chemin par lequel on juge).
2. `copierSeancesLecons` : la deep-copy emporte `.activites[].productionId` —
   même contrôle. ⚠ Ce chemin disparaît au Lot G avec `activites` ; le couvrir
   quand même si G glisse à une session ultérieure.

Sentinelle comportementale : une reprise avec production morte → champ absent ;
production vivante → champ conservé. Break-test : retirer le contrôle → ROUGE.

### Lot C — LE GÉNÉRATEUR UNIQUE (le cœur du chantier)

Un moteur qui traverse la carte UNE fois et produit une structure
intermédiaire (séquences → leçons → enfants, avec durées rollup, objectifs,
liens, rétroactions, production) ; la profondeur FILTRE cette structure ; le
format la MET EN FORME. Neuf sorties (3 niveaux × 3 formats) pour un moteur.

Contenu par niveau (acté, audit §3bis D4) :

| Niveau | Contenu |
|---|---|
| **Sommaire** | séquences, semaines, titres de leçons, évaluations avec pondération. NI durées, NI activités, NI liens |
| **Déroulement** | + tous les objectifs · + exposés/activités avec durées · + Σ par leçon et séquence · + rétroactions |
| **Alignement** | + connaissances · + liens verbalisés · + objectifs servis (#403) · + productions rattachées (grille, pondération, échéance) |

⚠ **Pendant ce lot, les rétroactions se lisent ENCORE dans
`planification_seances[...].activites`** (le porteur qui a des lecteurs) — le
générateur lit les deux porteurs avec priorité au nœud, pour que le Lot F soit
un basculement sans retouche du générateur.

**Harnais de parité** (sentinelle du lot) : sur une carte de test fournie,
toute information émise par les ANCIENS générateurs (titres, durées,
objectifs, rétroactions, productions, audiences) doit apparaître dans le
niveau approprié du nouveau. Pas un diff byte-à-byte — le vocabulaire change
exprès — une couverture de CONTENU. C'est ce harnais qui autorise le Lot G.

### Lot D — l'interface dans la Carte (après C)

📐 §3.1 pour l'emplacement. Trois niveaux, trois formats, remplacement des
quatre boutons actuels. Copy UX : nommer les niveaux par leur USAGE
(« Plan de cours », « En classe », « Preuve d'alignement ») plutôt que par
jargon — à valider avec le design system, deux modes.

### Lot E — la capacité rétroaction (la trouvaille du veto D2b)

1. Constante `RETROACTIONS` **unique** (fond des 3 copies en dur).
2. Sélecteur de rétroaction formative sur les **activités** dans l'Inspecteur
   (`TYPES_ACTIVITE`), écrivant `metadata.retroaction` du nœud.
3. Le sélecteur du nœud Évaluation **relibellé** « Rétroaction sur le rendu »
   (décision option 2 — deux notions, deux libellés).
4. L'Organisateur n'est PAS touché : il meurt au Lot G.

### Lot F — la migration des 3 rétroactions (APRÈS C-D-E, jamais avant)

`planification_seances[<carte>::<lecon>].activites[<actId>].retroaction`
→ `metadata.retroaction` du nœud `<actId>`, pour TOUS les trimestres.

- **Patron #409/#428** : migration one-shot à drapeau + **moissonneuse sans
  drapeau** pour les backups Codex de la fenêtre qui réintroduiraient
  `activites` à l'import — avec **date de retrait** inscrite au BACKLOG.
- **Leçon #419** : lire par le même chemin qu'on purge (clés namespacées par
  trimestre, composites par carte).
- **Leçon #429** : balayer TOUS les trimestres, pas l'actif.
- Sentinelle comportementale sur la VRAIE fonction (extraction, patron de
  `sentinelle-367-notes-lecon.test.js`) + break-tests. ⚠ Stub complet —
  le faux-vert du 8 août venait d'un stub sans `setSync`.
- `productionId` d'`activites` : le relevé dit 0 — la migration le porte
  quand même si présent (backup ancien), vers le nœud ÉVALUATION parent…
  ⚠ NON : `activites[actId]` porte l'id d'une ACTIVITÉ ; sa production
  rattachée va au nœud Évaluation de la MÊME leçon s'il est unique, sinon
  **ne rien inventer** : consigner dans le rapport de migration et laisser
  l'archive de moisson trancher à la main. (Cas théorique — 0 au relevé.)

### Lot G — la suppression (EN DERNIER, harnais de parité VERT exigé)

L'onglet, la section HTML, `js/organisateur.js`, les 4 générateurs, les
2 `sauvegarderChoixActivite`, `org-btn-export`, le sous-objet `activites`.
Vérifier au grep qu'AUCUN appelant ne survit. La clé `planification_seances`
reste (notes #367). Les sentinelles de l'Organisateur
(`sentinelle-367-notes-lecon` §« l'organisateur suit la même source »,
`planif-toolbar.spec.js` s'il le traverse) : retirer les cas devenus sans
objet, PAS les affaiblir — les cas de la migration #367 restent.

---

## 3. 📐 DÉCISIONS OUVERTES — à trancher en début de session (recommandations)

1. **Où vit l'export dans la Carte ?** ★ Recommandé : le menu **Actions**
   (où vivent déjà Exporter/Importer JSON et la reprise inter-trimestre) —
   pas de nouveau panneau, pas de modale (anti-pattern CLAUDE.md). Un item
   « Exporter le plan… » ouvrant un choix niveau × format inline.
2. **Le format « tableau collable » (#416)** : ★ TSV d'abord (colle dans
   Numbers/Excel, existe déjà) ; HTML presse-papiers seulement si le terrain
   le redemande. CSV = le même moteur, séparateur différent.
3. **L'import Markdown après la mort de la page** : ★ le porter dans le menu
   Actions à côté de l'export. ⚠ MAIS demander d'abord à Grégoire s'il s'en
   sert — il est lossy par construction (audit §1.7) et ne crée que
   séquences/leçons. S'il ne sert pas : le RETIRER (zéro-dette), c'est une
   décision de retrait de fonctionnalité → **Grégoire tranche**.
4. **Intention de version** : `minor` (nouveauté sans rupture de données —
   la migration du Lot F préserve tout). Le Lot G retire une PAGE : visible,
   mais déjà annoncé par le changelog 1.56 (« la carte montre tout »).
   Confirmer `minor` avec Grégoire au moment du release.

---

## 4. PIÈGES CONNUS — la section anti-compression

- ⚠⚠ **L'ORDRE D2** : migrer les rétroactions avant que les exports lisent le
  nœud = exports silencieusement VIDES. C'est LA contrainte du chantier.
  (Deux fois le même motif le 8 août : un porteur sans lecteur est une copie
  morte — archive #409, metadata D2.)
- ⚠ **`planification_seances` ne meurt PAS** : elle porte les notes de leçon
  en clés composites (#367). Seul le sous-objet `activites` disparaît.
- ⚠ **Le lasso, le drag, les panneaux sont en Pointer Events** depuis #148
  (1.56.3) avec un RATCHET zéro-listener-souris
  (`sentinelle-drag-canevas-pointer-148.test.js`) : tout nouveau code UI dans
  `planification-carte.js` doit être pointer, jamais mouse.
- ⚠ **`echapperHtml()` sur tout contenu utilisateur** dans les sorties HTML-
  ish et l'UI du Lot D (règle sécurité non négociable). Les exports TEXTE
  n'échappent pas — ils ne sont pas du HTML.
- ⚠ **WebKit CI** : `planif-drag-pointer-148.spec.js` a été validée sur
  Chromium conteneur — si la CI WebKit rougit dessus à la première PR, c'est
  un ajustement d'environnement de spec, pas une régression du drag.
- ⚠ La consigne de relais (règle du 8 août) : **fusionner vers `main` en fin
  de session** ; sinon remplir `RELAIS.md` et le pousser sur `main` SEUL.

---

## 5. DÉFINITION DE FINI

1. Les neuf sorties (3 niveaux × 3 formats) se génèrent depuis la Carte, sur
   les données réelles de Grégoire, avec le vocabulaire « leçon », les durées
   rollup et les objectifs pluriels.
2. Le harnais de parité est VERT ; les six anciens générateurs, la page, ses
   boutons et ses doublons ont DISPARU (grep propre).
3. Les 3 rétroactions de Grégoire vivent sur leurs nœuds activité et
   s'affichent dans l'Inspecteur ; le sélecteur de l'Évaluation dit
   « sur le rendu ».
4. Vitest vert, sentinelles break-testées, `main` porte tout, RELAIS.md à
   « aucun », SESSION.md §0 écrit, BACKLOG #424 fermé (et #425 amputé de ses
   préalables).
5. **Porte terrain** : un export de chaque niveau ouvert par Grégoire sur SA
   carte A26, et le geste « poser une rétroaction formative sur une activité »
   fait au doigt sur iPad.
