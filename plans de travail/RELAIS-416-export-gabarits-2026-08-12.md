# RELAIS — #416 exports configurables · passation Cowork → Claude Code

> **Écrit le 12 août 2026, en fin de session Cowork.**
> **Destinataire** : la session Claude Code qui prend la suite.
> **Spec du chantier** : `plans de travail/PLAN-export-gabarits-2026-08-12.md`.
> **Caveat de fraîcheur** : les faits ci-dessous ont été relevés au code et à
> l'état git le 12 août en après-midi. **Ne fais confiance à aucune ligne sans
> la re-vérifier** — c'est la règle du `PLAN-mi-aout-2026`, et elle vaut ici
> plus qu'ailleurs : la session Cowork ne pouvait pas committer.

---

## 1. ⚠ À FAIRE EN PREMIER — l'arbre est SALE et non commité

La session Cowork a écrit **directement dans le répertoire de travail**, sans
pouvoir toucher à git (`unable to unlink '.git/index.lock': Operation not
permitted` dans le bac à sable Cowork). Rien n'est commité, **et Grégoire est
resté sur `main`**.

État relevé à 14 h 30 :

```
branche : main          HEAD : 3469357a          version : 1.75.0 (build 0811-1319)

 M BACKLOG.md
 M index.html
 M js/planification-carte.js
 M styles.css
?? plans de travail/PLAN-export-gabarits-2026-08-12.md
?? plans de travail/_archives/PLAN-export-calendrier-2026-08-12-SUPERSEDE.md
?? scripts/break-test-416-rang-seance.mjs
?? tests/unit/sentinelle-rang-seance-416.test.js
?? ignorés/                    ← déchet de session, à supprimer (voir §6)
```

**Geste attendu** : rituel `SKILL_Debut_de_session.md`, puis créer la branche
`claude/export-gabarits-416` et committer ce qui est là **en deux commits
distincts** — la documentation d'un côté, le code de l'autre. Le message de
commit du code est proposé au §3.

⚠ **Ne recommence pas le lot A. Vérifie-le.** Le code est écrit, testé, et ses
break-tests sont rejouables (§3). Ce qui reste dû, c'est le regard de Grégoire
au navigateur, que la session Cowork ne pouvait pas porter.

---

## 2. Ce qui s'est passé en Cowork aujourd'hui — trois volets

**a) Transposition du calendrier H26 (hors code).** Le déroulement H2026 de
Grégoire (CSV) a été transposé dans sa carte d'alignement A26, livré en JSON et
importé par lui. 88 nœuds → 144. Aucun rapport avec le code ; mentionné parce
que c'est ce qui a fait émerger le besoin d'export.

**b) `#455` versé au BACKLOG** — contradiction du modèle du cours :
`planification-donnees.js` dit « le cours est global, le même objet d'un
trimestre à l'autre » ; `trimestre-v2-cours.js` (#442, trois jours plus tard)
l'identifie par le tuple `code|SESSION+ANNÉE`. Les deux ne peuvent pas être
vrais. **Hors de ce chantier**, mais à connaître : c'est pourquoi le groupe-cours
A2026 de Grégoire pointe vers un cours `h2026-601-101-MQ-00001`.

**c) `#416 lot A` codé** — le rang de séance entre dans le modèle. Détail au §3.

---

## 3. Lot A — livré, vérifié, à committer

**Ce qu'il fait.** `metadata.rangSeance` (ENTIER 1-4, affiché A-D) sur les
nœuds `lecon`, avec son sélecteur dans l'en-tête du bloc, à droite de celui de
la semaine. Porte d'écriture unique `definirRangSeance()`, sur le patron exact
de `definirSemaineLecon()`.

**Ce qu'il lève.** Le report de #410/#411 : « la séance n'a pas de logement dans
le modèle (colonnes reportées) ». Elle en a un. Le **lot E** pourra donc enfin
proposer le retrait de « séance 2 » dans les titres — la moitié que
`analyserRepereTitre` refusait de toucher.

**Décisions incorporées** (arbitrées par Grégoire le 12 août) :

- **rang entier, lettre à l'affichage seulement** — `obtenirRangSeanceDansSemaine()`
  raisonne déjà en rang, et « A/B » suppose deux séances par semaine ;
- **leçons seulement**, pas les séquences — une séquence s'étend sur des
  semaines, elle n'a pas de rang *dans* une semaine ; lui en donner un rouvrirait
  la contradiction séquence/leçons retirée le 6 août ;
- **pas de passage par `deposerDansGrille`** — la grille est organisée par
  semaine, il n'existe aucun geste de glisser équivalent pour le rang ;
- `RANG_SEANCE_MAX = 4` est une **capacité d'interface**, pas une inférence sur
  l'horaire : le rang garde son sens sans horaire saisi.

**Vérification faite.** Sentinelle `tests/unit/sentinelle-rang-seance-416.test.js`
— **20 cas verts**. Harnais complet **2246/2246** (249 fichiers), contre
2226/2226 avant. **13 break-tests ROUGE**, rejouables :

```
node scripts/break-test-416-rang-seance.mjs
```

⚠ **Deux break-tests ont d'abord résisté**, et les motifs sont connus du dépôt :

1. « on retire `select.value = courant` » restait VERT parce que le faux
   `<select>` était un objet nu — il ne perd pas sa valeur quand on vide ses
   options, un vrai `<select>` si. C'est la leçon du break-test de **#407 lot 2**
   (un faux `db` qui sérialisait rendait la cassure indétectable). Le faux
   modélise désormais les deux comportements.
2. « on retire la garde d'idempotence » restait VERT parce que l'assertion
   portait sur le **nombre final d'options** — or repeupler produit la même
   liste. Le rendu paresseux ne promet pas une liste différente, il promet de
   **ne pas refaire le travail**. Le test compte les `appendChild`.

Une **ancre ambiguë** attrapée au passage : `.planif-noeud-semaine` matchait
d'abord `.planif-noeud-rollup + .planif-noeud-semaine`, la règle voisine au
contenu opposé. Le helper exige maintenant un début de ligne.

**`?v=` déjà bumpés** à `20260812a` pour `planification-carte.js` et
`styles.css` (prévention #413/#367 — livré et inerte). `release.mjs` les
rebumpera à la release, sans dommage.

**Message de commit proposé :**

```
feat(#416 lot A): la séance entre dans le modèle — metadata.rangSeance

Le report de #410/#411 est levé : « séance 2 » vivait dans les titres
faute de logement dans le modèle. Il en a un.

Rang ENTIER, lettre à l'affichage seulement — obtenirRangSeanceDansSemaine
raisonne déjà en rang, et « A/B » suppose deux séances par semaine.
Leçons seulement : une séquence n'a pas de rang dans une semaine.
Porte d'écriture unique definirRangSeance(), patron definirSemaineLecon().

Sentinelle 20 cas, 13 break-tests ROUGE — dont deux refaits (stub trop
propre, puis assertion sur le mauvais observable).
```

### ⏳ Porte terrain DUE — non couverte par les tests

Aucune session sans navigateur ne peut la porter. À faire vérifier par Grégoire,
**Mac et iPad, deux modes**, selon `SKILL_portes_terrain.md` :

1. Le sélecteur apparaît-il **collé** à celui de la semaine, et non éparpillé à
   l'autre bout de l'en-tête ? (piège #412 : deux `margin-left: auto` dans le
   même en-tête.)
2. Au doigt sur iPad : peut-on l'ouvrir **sans que le bloc parte en glissant** ?
3. Le choix survit-il au rechargement ?

---

## 4. La suite — lots C, G, I, H, B, E, F

La spec complète est dans `plans de travail/PLAN-export-gabarits-2026-08-12.md`.
Résumé de l'ordre et des points durs :

**Lot C — la date, dérivée et jamais stockée.** `dateDeLecon(lecon)` pure :
cours de la carte → groupe-cours → `obtenirSeancesCompletes()` → filtre
`numeroSemaine` → tri par date → rang. Trois états dégradés silencieux (pas de
cours rattaché, pas de rang posé, pas de séance à ce rang).

> ⚠ **Vérifié sur les données réelles le 12 août** : les séances sont indexées
> par **GROUPE-COURS** (`seancesCompletes_gc_<id>`), pas par cours, alors que la
> carte se rattache à un cours (#407). Le A2026 de Grégoire a 30 séances du
> 2026-08-21 au 2026-12-11, chacune portant `date`, `jour`, `numeroSemaine`.
>
> ⮕ **D9, tranchée par Grégoire le 12 août** : un cours à plusieurs groupes est
> le cas FRÉQUENT (il en avait deux à l'hiver). Le groupe devient donc un
> **paramètre d'export**, choisi **au moment de l'export** et non mémorisé dans
> le gabarit — sinon trois groupes obligent à trois gabarits identiques. Et il
> se déclenche tout seul : **c'est la présence de la colonne Date qui pose la
> question du groupe**. Pas de colonne Date → document générique, aucune
> question. Colonne Date + un seul groupe → il est pris sans rien demander.

**Lot G — le générateur à trois axes.** Granularité (ligne par nœud / par
séance) en paramètre ; colonnes en liste ordonnée d'objets `{id, libelle}`,
cochables, ordonnables, **renommables**, **préfixe compris** (D8 : le préfixe
fixe `Séquence | Leçon | Semaine` est libéré).

> ⚠ **Les préréglages FONDENT dans les gabarits** — Sommaire, En classe et
> Preuve d'alignement deviennent des gabarits d'usine ; le niveau
> « Personnalisé » de #431 disparaît en tant que niveau. Zéro-dette : sans ça,
> l'app porte deux mécanismes de configuration d'export.
>
> ⮕ **Le filet est déjà là** : `tests/unit/harnais-parite-exports-424.test.js`.
> Si les quatre gabarits d'usine sortent **bit-à-bit** comme 1.75.0, la fonte
> n'a rien changé pour l'utilisateur. **Aucune assertion du harnais ne doit être
> retouchée** — si l'une doit bouger, c'est qu'un comportement a changé sans
> avoir été décidé : s'arrêter et le dire.
>
> ⮕ **Dette à fondre au passage** (§1.4 de l'audit du 8 août) : les exports
> disent « SÉANCE » là où ils désignent une **leçon**. Le mot devient
> franchement ambigu maintenant que la séance existe.

**Lot I — le gabarit d'usine « Calendrier ».** Six colonnes : Semaine · Séance ·
Date · Contenu · Évaluations · Travail personnel. Une ligne par séance. TSV et
Markdown, pas Texte. Sans le lot B, la 6ᵉ colonne sort vide — compromis accepté
par Grégoire pour livrer plus tôt.

**Lot H — les gabarits nommés.** Collection `{id, nom, granularite, colonnes,
format}` ; créer, dupliquer, renommer, supprimer. Les quatre d'usine sont
duplicables, pas modifiables sur place. Le réglage unique
`exportPlanPersonnalise` de #431 **migre** en gabarit — pas d'alias.

> Origine : l'hypothèse posée par Grégoire lui-même au journal
> `Retours des testeurs/USAGE-FORMATS.md` le 8 août (« un seul réglage
> suffit-il, ou faudra-t-il des gabarits nommés ? »), **levée par son usage le
> 12 août**. Le noter là où elle a été posée, au lot F.

**Lot B — le travail hors classe.** `metadata.horsClasse` (booléen), case dans
l'Inspecteur, patron `metadata.prealable`. **Aucune durée** quand la case est
cochée, et le nœud sort de `dureeRollupNoeud`. Break-test qui compte : **le Σ
d'une leçon ne bouge pas** quand on marque un de ses nœuds hors classe.

**Lot E — les repères de séance quittent les titres.** `analyserRepereTitre`
peut enfin proposer le retrait de « séance 2 ». ⚠ Réciproque de la règle du
6 août : **on ne LIT jamais le rang depuis le titre** pour le poser d'office.
Proposé, confirmé, jamais appliqué seul.

**Lot F — clôture.** `release.mjs minor`, changelog, BACKLOG (#416 avance,
#410/#411 se ferment sur leur moitié restante), SESSION.md, USAGE-FORMATS,
porte terrain.

---

## 5. Idées écartées, pour ne pas les redécouvrir

**Un 4ᵉ/5ᵉ préréglage « Calendrier ».** Écarté le 12 août. D4 de l'audit du
8 août le déconseille explicitement : « au-delà de trois, le choix devient
lui-même une friction ». Le calendrier est un **gabarit**, pas un niveau.

**Une modale d'export en canevas** (glisser-déposer des blocs sur un plan 2-D,
façon carte mentale). Idée de Grégoire, **reportée par lui le 12 août** —
« chaque département a ses exigences, gardons ça pour plus tard ». Ce qu'elle
apporterait et que rien d'autre ne donne : la mise en page hors-tableau
(en-tête sur deux rangées, cellules fusionnées, bloc de notes). Ce qui la
retient : c'est un concepteur de rapports, dont la partie chère n'est pas le
glisser mais la **sémantique d'agrégation** ; et le public cible du module est
« enseignants novices et intermédiaires ». À reprendre si un gabarit
départemental réel l'exige.

---

## 6. Ménage dû

`ignorés/snapshot-pour-tests.tar.gz` (18 Mo) — archive `git archive HEAD`
produite par la session Cowork pour faire tourner Vitest ailleurs (les
`node_modules` du Mac sont en `darwin-arm64`, le bac à sable Cowork est en
`linux-arm64` : `rollup` y échoue). Le dossier est gitignoré (`*ignorés*/`),
donc inoffensif, mais **à supprimer** : la session Cowork ne pouvait pas le
faire (`rm` interdit sur les dossiers montés).
