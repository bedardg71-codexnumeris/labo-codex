# Consigne du jour — trois réglages qui ne font rien s'en vont, un se rebranche

> **Écrite le 10 septembre 2026 au soir par Cowork, sur un arbitrage de Grégoire du même soir.**
> Elle remplace la carte des effets, **livrée** et archivée à côté sous
> `_ancienne-CONSIGNE-DU-JOUR-2026-09-10-carte-des-effets.md` — **commets l'archivage avec ton
> premier commit.**
>
> **Remesure avant d'exécuter** : `git --no-optional-locks log --oneline -5`, `cat version.json`,
> `TZ=America/Toronto date`.
> ⚠ **Une consigne peut se tromper : mesure, n'obéis pas.**
>
> **Préalable de lecture, et il fait autorité** : le **§ 4** de
> `plans de travail/CADRAGE-2026-09-10-ecran-de-reglage-du-depistage.md` — la carte des effets.
> **Ne la refais pas.** Elle nomme, pour chacun des vingt réglages, ce qu'il écrit et qui le lit.

---

## POURQUOI

La carte a montré que **quatre des vingt contrôles de `Labo › Outils d'observation` n'agissent nulle
part** (`#823`). Un cinquième de la page. L'écran ne se contente pas d'être encombré : par endroits,
il promet ce que le code ne fait pas.

▣ **Arbitrage de Grégoire, 10 septembre au soir** : « ok, retirer trois, brancher la fenêtre. »

Le partage suit une différence d'état mesurée, pas une préférence : **chez trois d'entre eux il n'y a
rien derrière ; chez le quatrième, tout fonctionne sauf un nom.**

---

## LOT A — les trois qui s'en vont

### 1. « Découpler Performance (P) et Niveau d'attention (N) »

Écrit la préférence `decouplerPN`, que **personne ne lit** (le panneau qui l'écrit, et une table de
migration). Son texte promet pourtant de séparer la note du dépistage.

**Retirer** : la case et ses trois lignes d'explication dans `index.html` · sa lecture et son écriture
dans `preferences-v2.js` · son entrée dans la table de correspondance de `preferences.js` · son défaut.

### 2. « Unité d'affichage de l'assiduité (A) »

Écrit `uniteAffichageAssiduite`, lue par deux fonctions de formatage de `preferences-v2.js`
(`formaterAssiduiteAvecUnite`, `formaterTotalPresence`) qui **n'ont aucun appelant**.

**Retirer** : le menu et son étiquette · la préférence · **et les deux formateurs**. ⛔ Zéro-dette
(`CLAUDE.md`) : un chantier retire ce qu'il remplace. Laisser les formateurs, c'est laisser la moitié
du problème.

### 3. « Direction du risque »

Le curseur écrit `seuilsInterpretation.directionRisque`, lu par `calculerDirectionRisque`, appelée
**une** fois par `genererSectionAccompagnement`, qui range le résultat dans une variable que rien ne
lit.

**Retirer** : le curseur et ses libellés · la clé du modèle de `interpretation-config.js` ·
`calculerDirectionRisque` · la variable morte de `genererSectionAccompagnement` · et ce que la chaîne
laisse derrière (`extraireScoresCriteres`, **seulement si elle n'a plus d'autre appelant** — mesure-le).

▣ **Deuxième motif, et il est de Grégoire** : « risque » est proscrit par `docs/adr/007-vocabulaire-descriptif.md`.
Ce retrait retire aussi le mot.

⚠ **La ligne « Variation minimale pour afficher une tendance du risque (→ ou ←) » disparaît avec le
curseur.** Vérifie qu'aucun autre texte de l'écran n'y renvoie.

---

## LOT B — la fenêtre se rebranche

**L'état mesuré** : le champ « dernières productions » écrit la préférence `fenetrePatterns`. Les
**douze** calculs lisent `seuilsInterpretation.nombreProductionsAnalyse`
(`obtenirNombreProductionsPourPatterns`, `profil-etudiant-helpers.js:426`), que **rien n'écrit** — sa
seule occurrence dans le code est sa valeur par défaut. ⮕ **La fenêtre vaut 3 quoi qu'on tape.**

**Le mécanisme qui manque existe déjà et fonctionne** : `sauvegarderSeuilsV2()` (`preferences-v2.js:333`)
écrit directement dans `seuilsInterpretation`, et c'est lui qui sauvegarde les trois champs
Fragile / Acceptable / Bon du même écran. Il suffit d'y faire passer une valeur de plus.

**À faire** :
1. `sauvegarderSeuilsV2()` écrit aussi `nombreProductionsAnalyse` depuis le champ.
2. L'initialisation du panneau lit la valeur depuis `seuilsInterpretation`, plus depuis la préférence.
3. **Retirer `fenetrePatterns`** — préférence, défaut, entrée de la table de correspondance. Zéro-dette :
   c'est l'ancien système, il ne reste pas « au cas où ».
4. Le bouton « Restaurer les valeurs par défaut » du bloc SOLO remet 3 **dans la bonne clé**.

### ⛔ CE QUI NE SE FAIT PAS — la valeur déjà stockée chez les gens

Des utilisateurs ont `fenetrePatterns` à 4 ou 5 dans leurs préférences. **Ne la migre pas vers
`nombreProductionsAnalyse`.**

▣ **Décision de Cowork, motivée, et Grégoire peut la renverser** : cette valeur n'a **jamais** eu
d'effet. La migrer donnerait rétroactivement un effet à un réglage qu'un enseignant croyait actif il y
a des mois, et changerait ses profils sans qu'il ait rien demandé. Repartir du défaut 3 — l'état réel
d'aujourd'hui — est le seul choix qui ne surprend personne. Qui veut 5 le retape, et cette fois ça
marchera.

⛔ Plus largement : **aucune écriture dans les données de personne.** Les clés `decouplerPN`,
`uniteAffichageAssiduite`, `directionRisque` et `fenetrePatterns` resteront orphelines dans les
préférences des utilisateurs. **C'est voulu** — « tarir n'est pas réparer », et nettoyer le stock de
quelqu'un remonte à Grégoire (`CLAUDE.md`). Écris-le dans le rapport de session plutôt que de le faire.

---

## CE QUI CHANGE À L'ÉCRAN — et qui doit être dit

Contrairement aux deux lots précédents, **celui-ci se voit** : trois contrôles disparaissent de
`Labo › Outils d'observation`, et un quatrième se met à fonctionner.

⚠ **Conséquence à assumer, arbitrée par Grégoire** : aujourd'hui les analyses portent sur trois
productions quelle que soit la valeur affichée. Après ce lot, la valeur du champ s'applique vraiment.
**Un profil peut changer d'aspect** — aucune donnée n'est touchée, seulement la lecture qu'on en fait.

⮕ **Release `minor`, pas `patch`** : un réglage change de comportement et trois disparaissent.
⮕ **Entrée de changelog obligatoire**, skill `release-et-changelog`. Elle dit deux choses en langue
d'utilisateur : trois réglages qui ne faisaient rien ont été retirés ; la fenêtre d'analyse, elle,
fonctionne maintenant — et si tu y avais mis une valeur, elle est repartie à trois.

⮕ **Porte terrain DUE** — l'écran change (skill `portes-terrain`, règle 1 : une machine ne peut pas
répondre à « est-ce que ça a l'air bien »). Markdown à toi, artefact à Cowork. Quatre portes, pas plus :
les trois blocs ont bien disparu sans laisser de trou ni de titre orphelin · le bloc « Paramètres
avancés » se replie et se déplie encore · une valeur tapée dans la fenêtre survit à un rechargement ·
et elle atteint vraiment un profil (change-la, rouvre un profil, l'analyse porte sur ce nombre).
⚠ Sur `https://app.codexnumeris.org`, **pas** le fichier local.

---

## CE QUI REMONTE À GRÉGOIRE

1. **Si un des trois « morts » se révèle vivant** à la mesure, arrête et dis-le. La carte est solide,
   mais elle a été écrite par la session qui l'a mesurée ; c'est exactement le cas où une relecture
   croisée existe (`PROTOCOLE.md`, règle 2).
2. **Rien d'autre.** Le reste est technique : tranche, puis dis-le en une ligne en nommant ce que tu as
   supposé.

⛔ **Hors périmètre, et ce n'est pas un oubli** : la forme de l'écran (sa « cacophonie »), les deux
nomenclatures du bloc « Seuils d'interprétation », les cinq chemins morts de `#824`, les trois défauts
du lot B (« Assiduité critique » sous deux bornes, la borne à 60 %, le palier inatteignable), et le
déplacement de l'écran vers `Suivi`. **Un lot, une livraison.**
