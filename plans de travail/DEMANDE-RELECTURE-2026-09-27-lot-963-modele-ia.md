# Demande de relecture – #963, carte d'alignement lot 1 : « Je fais relire ma carte par une IA »

> Écrite le 27 septembre 2026 par Claude Code (session infonuagique), pour Cowork. Branche `claude/carte-alignement-963-relire-par-ia`, partie de `df359bf` (`main`, 1.163.0). Consigne : `plans de travail/CARTE-ALIGNEMENT-2026-09-27-1-relire-ma-carte-par-une-IA.md`. Mesure citée : `mesure-carte-alignement.md`. **Pas de release ni de fusion avant ta relecture**, et pas de version publique sans l'accord de Grégoire (consigne, LIVRAISON).

## 1 · Ce que le lot livre

| Pièce | Où | Ce qu'elle fait |
|---|---|---|
| Entrée « Télécharger un modèle… » | menu **Actions ▾** de la carte, sous « Exporter le plan… » et « Exporter cette carte » (`index.html`, `#planif-btn-modele-ia`) | ouvre un panneau, même patron que l'export du plan. **Emplacement choisi par Grégoire** (27 sept., question posée en séance) |
| Panneau | `rendrePanneauModeleIA` (`js/planification-carte.js`) | trois radios d'étape (« Construire les séances », « Relier », « Vérifier ») ; la semaine jusqu'où la carte est bâtie (défaut : la dernière semaine qui contient une leçon) ; « Télécharger » |
| Principe | sous le sous-titre de la carte (`index.html`), en italique, classe `text-muted` | texte exact de la consigne. **Emplacement choisi par Grégoire** (« Sous le titre ») ; j'ai **ajouté** la ligne sous le sous-titre existant, sans le remplacer. Le plein écran le masque comme le sous-titre (`#conception-carte > .text-muted`) |
| Composition | `js/planification-export.js` : `construireDonneesModele` (lit la carte une fois) puis `composerModeleCarte` (pure) | consignes validées, octet pour octet, puis les données |
| Lectures ajoutées à `window.planificationCarte` | `NIVEAUX_COGNITIFS`, `trouverClones`, `deriverRangeesGrille` | lecture seule, pour le modèle |

**Aller simple** : aucun chemin du lot n'écrit, ni dans la carte ni dans le magasin (prouvé en Vitest et dans le navigateur, § 4).

## 2 · Ce que j'ai décidé seul (à corriger en dix secondes si c'est faux)

1. **Le total de semaines** vient du Cadre du trimestre (`calendrierComplet`, via `deriverRangeesGrille`). **Sans Cadre**, la phrase s'arrête à « … jusqu'à la semaine N. », sans « sur [total] » : je n'ai pas voulu écrire un total deviné. C'est le seul endroit où le texte validé peut perdre des mots.
2. **Sans leçon planifiée**, le défaut de la semaine est la dernière semaine du trimestre (ou 1).
3. **Les objectifs servis sont lus bruts et résolus contre TOUTE la carte**, comme l'exige la consigne (« même quand l'objectif appartient à une autre leçon ») : ils s'écrivent alors « « texte » (objectif de la leçon « X », semaine N) ». **Un identifiant qui ne résout rien (objectif retiré) est omis** : il n'a pas de texte, et l'écran l'omet aussi.
4. **Les liens sont agrégés sur les clones** : un clone est le même bloc, et les badges comptent déjà ainsi. Sans cela, l'IA signalerait « sans lien » un clone dont l'original est relié. Chaque lien apparaît **aux deux bouts** (sous chacun des deux blocs), en phrase complète : « « A » (Type, semaine N) verbe « B » (Type, semaine M). » ; c'est ce qui permet à l'IA de citer « nom et semaine » (ANCRAGE).
5. **L'échelle d'une évaluation vient de sa production** (`production.echelleId`), **la production est cherchée dans toutes les productions du trimestre** (pas dans la projection filtrée de l'Inspecteur). Une production désignée mais absente s'écrit « Production : introuvable dans ce trimestre ». Motif : constats 3 et 4 (§ 6).
6. **« Idées maîtresses » d'une leçon** = `trouverIdeesMaitressesAncetres` (liens de la leçon et de ses séquences parentes), la lecture que l'export du plan emploie déjà pour son objectif dérivé.
7. **Le fichier** se nomme `modele-ia-<carte>.md` et passe par `telechargerFichier` (celui de l'export du plan, BOM compris).
8. **La visée non choisie** s'écrit « Visée : non précisée » (même règle que `viseeChoisie` : ne rien affirmer que Grégoire n'a pas posé).

## 3 · Écarts avec la consigne

- **Aucun écart sur le texte validé.** Un essai le compare, ligne par ligne, à une copie de la consigne du lot recopiée dans le banc. **Recopiée, pas lue** : le premier jet lisait le fichier de `plans de travail/`, et `sentinelle-ci-paths-ignore` l'a refusé (ce dossier est ignoré par la CI : le commit qui casserait le banc ne le rejouerait pas). Si le texte validé change, les deux copies changent ensemble.
- **Consigne « inscris-le au suivi des retours avant de commencer »** : fait (`SUIVI-BUGS.md`, ligne #963). Le texte d'origine du retour de 7 h 44 n'est pas dans le dépôt : la ligne cite la consigne, sans le citer.

## 4 · Preuves

- **Vitest** : `tests/unit/sentinelle-modele-ia-963.test.js`, 15 essais sur une carte fictive (cours inventé « Astronomie de terrain »), les deux vraies sources montées. Suite complète : voir § 4 bis.
- **Mutations Vitest, dix sur dix rouges** : objectifs servis filtrés à la leçon ; échelle lue sur la grille ; productions filtrées comme l'Inspecteur ; une virgule ajoutée au texte validé ; une écriture dans le magasin (**survivante au premier passage** : réécrire à l'identique laissait le contenu égal ; le banc compte désormais les écritures) ; l'identifiant mort écrit ; un total deviné sans Cadre ; le sens d'un lien inversé ; les leçons dans l'ordre d'insertion ; la production introuvable tue.
- **Navigateur** : `tests/integration/planif-modele-ia-963.spec.js`, 2 essais (carte démo) : le principe sous le titre ; Actions ▸ « Télécharger un modèle… » ▸ « Relier » ▸ semaine 3 ▸ « Télécharger » : nom du fichier, première ligne, étape et semaine remplies, panneau refermé, **carte en mémoire et magasin identiques, zéro écriture**. **Verts sous Chromium seulement** : WebKit n'est pas installé dans ce conteneur. **Le verdict WebKit reste à prendre sur le Mac de Grégoire.**
- **Mutations navigateur, six sur six rouges** : semaine choisie ignorée ; étape ignorée ; une écriture au téléchargement ; principe retouché ; nom de fichier générique ; panneau laissé ouvert.
- **Mesuré en chemin** : sous Chromium sans interface en `file://`, `suggestedFilename()` rend « download » pour ce modèle **et pour l'export du plan existant**. C'est ce navigateur dans ce conteneur, pas le lot : l'essai lit le nom que l'application demande (l'attribut `download` du lien). Aucun symptôme vécu : non inscrit.

## 4 bis · Suite complète

- **Vitest complet** (depuis `tests/`, sur l'arbre du commit) : **645 fichiers, 7 511 essais verts**, code de sortie 0. Premier passage : 1 rouge, `sentinelle-ci-paths-ignore` (le banc lisait `plans de travail/`, corrigé, § 3).
- **Playwright complet : non lancé.** WebKit n'existe pas dans ce conteneur ; seul le spec du lot a tourné, sous Chromium. **Le verdict de la suite complète (WebKit) se prend sur le Mac de Grégoire**, avant toute fusion.

## 5 · Les mots – à faire accepter par Grégoire avant le push

| Où | Texte |
|---|---|
| Menu Actions | « Télécharger un modèle… » (consigne) |
| Panneau, titres | « Mon étape » ; « Carte bâtie jusqu'à la semaine » ; options « Semaine N » |
| Panneau, note | « Le fichier contient des consignes, puis ta carte telle qu'elle est. Colle-le dans l'IA de ton choix : ta carte n'est pas modifiée. » |
| Message après téléchargement | « Modèle téléchargé : colle-le dans l'IA de ton choix. » ; échec : « Le modèle n'a pas pu être produit : aucune carte active. » |
| Fichier, sections (après les consignes validées) | « Le cours » ; « Compétences et idées maîtresses de la carte » ; « Semaine par semaine » ; « Leçons sans semaine » ; « Blocs rattachés à aucune leçon » ; « Objectifs de la leçon », « Idées maîtresses », « Blocs de la leçon », « Objectifs servis », « Objectifs vérifiés », « Visée », « Production », « Grille », « Échelle », « Échéance » ; « aucun·e », « non précisée », « introuvable dans ce trimestre », « Aucun cours n'est rattaché à cette carte. » (voir l'exemple, § 7) |
| Nouvelles (à la release, si Grégoire la veut) | « Carte d'alignement : Actions ▸ « Télécharger un modèle… » produit un fichier à coller dans l'IA de ton choix, pour faire relire ta carte. Rien n'est modifié dans ta carte. Le principe « Évaluer ce qu'on enseigne, et enseigner ce qu'on évalue, au même niveau d'exigence. » s'affiche sous le titre. » |

## 6 · Les quatre constats de Cowork (mesurés au code, non corrigés)

| # | Constat | Disposition |
|---|---|---|
| 1 | « Objectifs servis » vide dans l'export du plan quand un bloc sert l'objectif d'une autre leçon | **Confirmé** : `objectifsServisPar` filtre à la leçon parente, délibérément ; un clone partage ses métadonnées (`propagerModification`), un bloc déplacé garde les siennes. **Inscrit #967.** |
| 2 | Une activité sert un objectif qui n'existe plus | **Confirmé** : `appliquerObjectifs` ne retire pas l'identifiant des blocs qui servaient l'objectif retiré ; filtré à la lecture, visible dans le JSON. **Inscrit #968.** |
| 3 | « Artefact n°2 » porte un identifiant de production, et l'export du plan ne lui trouve aucune production | **Non confirmé au code** : la reprise d'une carte d'un autre trimestre nettoie déjà les identifiants morts (`planification-donnees.js` l. ~501-510). Trois causes restent possibles, que seules ses données tranchent : la production a `dansBibliotheque: false` (filtrée par `chargerProductions`), elle a été supprimée après la pose, ou la carte vient d'un import de fichier (pas de nettoyage). **Mesure en un geste** : le modèle de ce lot cherche dans toutes les productions ; s'il écrit la production d'« Artefact n°2 », c'est le filtre ; s'il écrit « introuvable dans ce trimestre », elle n'existe plus. **Non inscrit** en attendant cette mesure. |
| 4 | « Aucune échelle » partout dans l'export du plan | **Confirmé** : `afficherDetailsProduction` lit `grille.echelleId`, que l'éditeur de grille n'écrit jamais (déjà établi par le diagnostic #578) ; l'échelle vit sur la production. **Inscrit #969.** |

Compteur « Dernier ID utilisé » porté à #969 dans `BACKLOG.md`.

## 7 · Exemple : fichier téléchargé sur la carte fictive du banc (étape « Relier », semaine 4 sur 15)

````markdown
# Carte d'alignement : Astronomie A26 v2

> CONSIGNES : à lire par l'assistant, puis à laisser telles quelles.
>
> Tu reçois ci-dessous la carte d'alignement d'un cours, telle que l'enseignant·e l'a construite dans Labo Codex. Tu en fais la lecture critique ; tu ne la réécris pas. L'enseignant·e décidera seul·e de ce qu'il faut modifier.
>
> LE PRINCIPE
> Évaluer ce qu'on enseigne, et enseigner ce qu'on évalue, au même niveau d'exigence.
>
> OÙ EN EST L'ENSEIGNANT·E
> Étape : Relier. Carte bâtie jusqu'à la semaine 4 sur 15.
> - Construire les séances : les objectifs et les liens ne sont pas encore posés. Ne signale ni leur absence ni ce qui suit la semaine 4 ; lis les séances déjà bâties par leurs titres et leur ordre.
> - Relier : signale aussi les objectifs sans lien et les évaluations qui ne vérifient aucun objectif.
> - Vérifier : lis la carte comme terminée.
>
> CE QUE TU VÉRIFIES
> La carte calcule déjà les liens manquants. Ton rôle est ce qu'un calcul ne voit pas : le sens de ces liens.
> - Ce qui est évalué a-t-il été enseigné ? Pour chaque évaluation, pars des objectifs qu'elle vérifie (à défaut, de son titre) et repère où la carte les enseigne et les fait pratiquer. Signale ce qu'elle exige sans que la carte montre où cela a été appris.
> - Ce qui est enseigné est-il évalué ? Signale ce qui est enseigné sans être évalué nulle part, en admettant que ce puisse être voulu (un préalable, une mise en route).
> - L'ordre : ce qui est évalué a-t-il été enseigné avant l'évaluation ?
> - Le verbe : repère le verbe de chaque objectif (identifier, expliquer, concevoir…). Vérifie que les activités font exercer ce verbe et que l'évaluation exige ce même verbe, pas un verbe plus exigeant. Compare aussi ce verbe au niveau cognitif indiqué sur l'évaluation.
> - Les liens eux-mêmes : un lien posé ne prouve pas l'alignement. Signale un objectif coché par une activité ou une évaluation qui, d'après son titre, ne le travaille pas.
> - La démarche : si la carte montre une progression (des étapes, des types d'activités), vérifie qu'elle suit la sienne. Ne lui impose aucune démarche qu'elle ne montre pas.
>
> CE QUE TU RENDS
> 1. Les trous : ce qui manque, en nommant les blocs concernés.
> 2. Les incohérences : ce qui se contredit, en nommant les blocs et le lien en cause.
> 3. Les questions : ce que la carte ne permet pas de trancher.
> 4. Au plus trois suggestions, classées par importance.
>
> ANCRAGE
> - Tu ne connais pas la discipline de ce cours et tu n'en juges pas le contenu. Emploie uniquement les termes de la carte ; suis-les d'un bloc à l'autre pour vérifier que ce qui est évalué a été enseigné, et que ce qui est enseigné est évalué. N'introduis aucun concept qui n'y figure pas.
> - Appuie chaque remarque sur un bloc ou un lien présent dans la carte, cité par son nom et sa semaine.
> - Distingue ce que la carte montre de ce que tu en infères.
> - Aucune note, aucune félicitation.

---

## Le cours

Cours : 999-ZZZ-XX, Astronomie de terrain
Compétence 0ZZ9 : Observer le ciel nocturne
Éléments de la compétence :
- Repérer les constellations
- Consigner une observation

## Compétences et idées maîtresses de la carte

- Compétence « Observer le ciel » (niveau cognitif : Appliquer)
  - « Observer le ciel » (Compétence) se décline en « Le ciel tourne » (Idée maîtresse).
- Idée maîtresse « Le ciel tourne » (niveau cognitif : Comprendre)
  - « Observer le ciel » (Compétence) se décline en « Le ciel tourne » (Idée maîtresse).
  - « Le ciel tourne » (Idée maîtresse) se concrétise dans « Lire une carte du ciel » (Leçon, semaine 2).

## Semaine par semaine

### Semaine 2

#### Leçon « Lire une carte du ciel », séance A

Séquence : « Premières nuits »
Durée : 30 min
Idées maîtresses : « Le ciel tourne »
Objectifs de la leçon :
- Repérer l’étoile Polaire

Blocs de la leçon :
- Conceptuelle « Rotation apparente »
  - « Rotation apparente » (Conceptuelle, semaine 2) s'acquiert par « Repérage au planisphère » (Activité, semaine 2).
- Activité « Repérage au planisphère » (30 min ; niveau cognitif : Appliquer)
  - Objectifs servis : « Repérer l’étoile Polaire »
  - « Rotation apparente » (Conceptuelle, semaine 2) s'acquiert par « Repérage au planisphère » (Activité, semaine 2).

### Semaine 4

#### Leçon « Tenir un carnet », séance B

Séquence : « Premières nuits »
Durée : 70 min
Idées maîtresses : aucune
Objectifs de la leçon :
- Décrire une observation

Blocs de la leçon :
- Activité « Relecture du planisphère » (20 min)
  - Objectifs servis : « Repérer l’étoile Polaire » (objectif de la leçon « Lire une carte du ciel », semaine 2) ; « Décrire une observation »
  - « Relecture du planisphère » (Activité, semaine 4) se vérifie par « Carnet n°1 » (Évaluation certificative, semaine 4).
- Évaluation certificative « Carnet n°1 » (50 min ; niveau cognitif : Analyser)
  - Objectifs vérifiés : « Décrire une observation »
  - Visée : certificative
  - Production : « Carnet d’observation n°1 » (20 %)
  - Grille : « Grille Ciel profond »
  - Échelle : « Échelle à quatre paliers »
  - Échéance : 2026-10-08
  - « Relecture du planisphère » (Activité, semaine 4) se vérifie par « Carnet n°1 » (Évaluation certificative, semaine 4).
- Évaluation « Quiz fantôme »
  - Objectifs vérifiés : aucun
  - Visée : non précisée
  - Production : introuvable dans ce trimestre

### Leçons sans semaine

#### Leçon « Leçon en chantier »

Idées maîtresses : aucune
Objectifs de la leçon : aucun

Blocs de la leçon : aucun

## Blocs rattachés à aucune leçon

- Soutien « Atelier libre » (15 min)
````

## 8 · Stock et sécurité

- **Stock** : rien n'est écrit, rien n'est lu autrement à l'écran. Aucun effet sur les données existantes.
- **Sécurité** : le panneau n'injecte dans `innerHTML` que des constantes du module, passées par `echapperHtml` par principe ; les données de la carte ne vont que dans le fichier texte. Aucun `console.log`, aucun gestionnaire en ligne.

## 9 · Trouvailles en chemin

- Les quatre constats du § 6 (consigne du lot).
- `suggestedFilename` « download » sous Chromium sans interface (§ 4) : issue 3, noté ici.
