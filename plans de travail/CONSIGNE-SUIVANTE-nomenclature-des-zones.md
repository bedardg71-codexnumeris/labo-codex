# Consigne suivante — la nomenclature des zones de couleur

> **Écrite le 10 septembre 2026 par Claude Code, à la demande explicite de Grégoire.**
>
> ⚠ **Exception nommée à `PROTOCOLE.md` § « Qui écrit quoi dans la consigne de démarrage »**, qui
> réserve le MANDAT à Cowork. Motif de la règle : *une session qui rédige sa propre consigne se
> relit elle-même — elle transmet ce qu'elle a vu, pas ce qu'elle a manqué.* Ce risque est réel ici :
> ce document est écrit par l'instance qui vient de travailler sur ces mêmes fichiers.
> ⮕ **Cowork peut et devrait le reprendre à froid.** Ce qui suit est une PROPOSITION d'analyse,
> pas un mandat arrêté.

---

## L'ORIGINE, DANS SES MOTS

> « J'ai l'impression que les libellés "fragile", "modéré", "favorable" et "très favorable" n'ont pas
> vraiment de sens. Je ne sais pas sur quoi ils s'appuient. Ce sont des libellés dont la nomenclature
> remonte loin dans le développement, et je crois qu'il faut sans doute les revoir pour leur donner
> plus de pertinence. »

C'est un symptôme VÉCU, pas une trouvaille d'audit : il entre au backlog à ce titre (`#821`).

---

## CE QUI EST DÉJÀ MESURÉ — NE PAS LE REFAIRE

Tout ceci a été établi le 10 septembre, en livrant `#816`, `#817` et `#818`. Chaque ligne est une
mesure, pas une lecture rapide.

1. **Ces mots ne sortent PAS vers les élèves.** Zéro occurrence dans `synthese-retroaction*.js`,
   les cartouches, les exports, `travaux*.js`, `bilan*.js`. Ils vivent dans **dix fichiers**, tous
   côté enseignant.
   ⮕ **Conséquence** : aucun PDF d'élève, aucune grille partagée, aucune rétro-compat. Le renommage
   est cher en SURFACES, pas en RISQUE. C'est ce qui rend le chantier faisable.

2. **Il y a TROIS mécanismes distincts sous des mots voisins**, et c'est la confusion de fond :

   | Mécanisme | Vocabulaire | Bornes | Classe-t-il ? | Réglable ? |
   |---|---|---|---|---|
   | Dégradé de l'Aperçu (`tableau-bord-apercu.js`) | Fragile · Modéré · Favorable · Très favorable | 30 / 47,5 / 65 / 82,5 (dérivées des arrêts de couleur) | **NON — continu, couleur interpolée** | non |
   | Seuils d'interprétation (`interpretation-config.js`, lus par `etudiants.js` et `profil-etudiant-helpers.js`) | Fragile · Acceptable · Bon · Excellent | défauts 70 / 80 / 85 | **OUI — quatre paliers** | oui |
   | Contexte d'élève (`profil-etudiant-calculs.js:2010`) | « Très favorable » | A ≥ 85 % **et** C ≥ 85 % | oui, cas particulier | non |

3. **Le premier n'étiquette pas des catégories.** Aucun `if (valeur >= 0.80)` n'existe dans
   `tableau-bord-apercu.js`. Les repères de la légende situent des changements de teinte sur une
   échelle continue. **C'est la distinction que l'inventaire doit porter en colonne** : elle a fait
   croire pendant des mois qu'il y avait « deux échelles » comparables.

4. **Le vocabulaire du deuxième mécanisme boite déjà tout seul.** Les trois champs disent
   « Fragile si < 70 », « Acceptable si < 80 », « Bon si ≥ 85 ». La bande **80-85** n'est nommée
   nulle part à l'écran, et le mot « bon » désigne cette bande dans le code alors qu'il désigne
   « ≥ 85 » dans le panneau. Les BORNES sont justes ; ce sont les ÉTIQUETTES qui se chevauchent.

5. **Où les trouver**, parce que deux instances s'y sont trompées :
   `Labo › Outils d'observation › carte « Micro-données ACP » › bloc pliable « Seuils
   d'interprétation »`. **Pas** sous « Paramètres avancés », qui appartient à la carte
   « Taxonomie SOLO » et porte les seuils de DÉTECTION. `index.html:8913` ferme l'un, `8923` ouvre
   l'autre.

---

## L'ANALYSE PROPOSÉE — QUATRE TEMPS

### 1. Inventaire exhaustif — mesurable, aucun arbitrage

Les dix fichiers, occurrence par occurrence. Une ligne par occurrence, avec :
le mot · l'écran où il se lit · ce qui le calcule · ses bornes · configurable ou non ·
**et la colonne qui a manqué à `#818` : étiquette-t-il un CONTINU ou des PALIERS ?**

Départ : `grep -rn "Fragile\|Modéré\|Favorable\|Très favorable\|acceptable\|excellent" js/ --include=*.js`

### 2. Archéologie — mesurable aussi

D'où viennent ces quatre mots, et avec quelle justification ?
`git log -S"Très favorable" --oneline`, `BACKLOG-ARCHIVE.md`, `SESSION.md` (lectures CIBLÉES).

**Les deux issues sont utiles** : ou bien une raison documentée existe, et elle se discute ; ou bien
il n'y en a pas — et alors renommer ne renverse aucune décision, ce qui change la liberté de
Grégoire. **Ne pas sauter ce temps** : c'est lui qui dit si on corrige un accident ou si on rouvre
un choix.

### 3. Confrontation au cadre — lecture, pas arbitrage

Ces mots appartiennent-ils à ELLAC, à SOLO, au modèle RàI ? Ou sont-ils apparus hors cadre ?
Skills `ecosysteme-classe` et `depistage-rai`, plus `docs/`.

**Hypothèse à éprouver, pas à supposer vraie** : l'écart que Grégoire sent viendrait de ce que les
indices A-C-P sont **descriptifs** — le glossaire dit lui-même qu'ils « résument le contexte
d'apprentissage observé » — pendant que les mots employés sont **évaluatifs** et se lisent comme un
jugement sur la personne. Si l'archéologie ou le cadre la contredisent, la contredire dans le rapport.

### 4. LA QUESTION QUI DÉCIDE — elle est pour Grégoire, et rien ne se code avant

**Que prétend une bande de couleur ?** Trois familles de réponses, qui **ne se traduisent pas** l'une
dans l'autre :

- **un état de l'élève** — « fragile ». C'est ce que les mots actuels suggèrent, et c'est un jugement
  porté sur la personne ;
- **un état du contexte d'apprentissage observé** — ce que le glossaire dit que A-C-P mesurent ;
- **un appel à l'action de l'enseignant** — « à surveiller », « rien à signaler ». Orienté RàI, et
  c'est l'usage réel du tableau de bord.

⛔ **Ne rien renommer avant que Grégoire ait tranché ce point.** Nommer une bande de résultats est
de la pédagogie : `CLAUDE.md`, « ce qui remonte jusqu'à Grégoire », point 1.

---

## LE LIVRABLE ATTENDU

Un rapport dans `Rapports/`, portant :

1. le tableau d'inventaire du temps 1 ;
2. ce que l'archéologie a trouvé — **ou n'a pas trouvé**, ce qui est un résultat ;
3. la confrontation au cadre ;
4. **deux ou trois nomenclatures candidates COMPLÈTES.** Pas des idées : des tableaux mot par mot,
   pour **chacun des trois mécanismes**, chacune chiffrée — combien de surfaces à changer, quelles
   données touchées, ce qui reste incohérent après.

⮕ **Un audit n'est pas terminé quand il est déposé** (`CLAUDE.md`) : chaque constat porte, DANS le
fichier, l'une de trois dispositions — *inscrit* (n°), *refusé* (motif), *périmé*.

---

## DEUX GARDE-FOUS

1. **Ne pas confondre RENOMMER et REBORNER.** Les bornes de la légende viennent d'être rendues
   exactes le 10 septembre (`#818`, sentinelle du lot B réécrite). Le renommage ne doit pas les
   rouvrir en douce : si une candidate déplace une borne, elle le dit et le chiffre à part.
2. **Ne pas toucher aux données.** Rien de ce chantier ne justifie d'écrire dans
   `seuilsInterpretation` ni dans quoi que ce soit chez Grégoire. Un renommage d'étiquette est un
   changement de PROSE et de CODE, pas de stock.

---

## CE QUI N'EST PAS DANS LE PÉRIMÈTRE

- Les **bornes** elles-mêmes (30 / 47,5 / 65 / 82,5 pour le dégradé ; 70 / 80 / 85 pour
  l'interprétation). Elles ont été traitées le 10 septembre.
- Les **seuils de détection** (progression, direction du risque, défi spécifique) : autre carte,
  autre famille, réglés par `#817`.
- L'échelle **IDME** (0,64 / 0,75 / 0,85) : ce sont des bornes de NIVEAU, pas des étiquettes de zone.
