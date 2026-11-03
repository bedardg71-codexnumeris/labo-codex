# Portes terrain – la 1.231.1, boucle sans relais (3 novembre 2026)

> **La trace.** L'opération est l'artefact « Portes terrain 1.231.1 », que Cowork publie à partir de ce fichier. Il porte le bouton « Copier mes résultats ».
> Contexte : premier passage de la boucle sans relais (`BOUCLE-SANS-RELAIS.md`), qui a traité neuf entrées de `FILE-DES-CORRECTIFS.md`. Release 1.231.1, build 1103-1338, commit `b789ee32`, poussée le 3 nov. vers 15 h 35. Verdict du Mac vert sur ce commit.
> Trois gestes, qu'aucune machine ne peut faire : la reprise réelle de l'Artefact 6, puis, au vrai doigt, la corbeille de la carte et le défilement d'Annoter. Ce défilement reprend les portes iPad dues depuis le 2 nov. Le reste est mesuré par les essais ou relève de l'usage normal (§4).
> **Elle ne vaut qu'une fois la version en ligne** : tant que le bas de page n'affiche pas 1.231.1, elle juge la version d'avant.
> Un échec devient un item de `Retours des testeurs/SUIVI-BUGS.md`, pas une note mentale.

## §0 · Préalable
- [ ] 0.1 · Mac · Ouvre app.codexnumeris.org, recharge en vidant le cache (Cmd+Maj+R), puis lis le numéro en bas de page. ⮕ 1.231.1.
- [ ] 0.2 · Mac · ⚠⚠ Données · Enregistre ton codex avant le §1. ⮕ le fichier est dans tes Téléchargements.

## §1 · ⚠⚠ Données · Les reprises de l'Artefact 6
Pourquoi : le lot de reprises, déposé avec le jeton de reprise, t'était présenté copie par copie comme des doublons (« renommer » ou « intégrer »). Ta condition, le 3 nov. à 11 h 13 : « il ne faut pas que ces travaux écrasent l'artefact 6 déjà évalué. »
- [ ] 1.1 · Mac · Note la note d'une copie de l'Artefact 6 déjà évaluée, puis importe le lot de reprises avec le jeton de reprise. ⮕ la confirmation ne te présente aucun doublon.
- [ ] 1.2 · Mac · Une fois l'import fini, cherche dans Travaux un élève qui a remis une reprise. ⮕ il a deux copies, l'originale et la reprise.
- [ ] 1.3 · Mac · Ouvre son Artefact 6 d'origine. ⮕ il garde son évaluation, avec la même note qu'en 1.1.

## §2 · Interface · La corbeille de la carte d'alignement, au doigt
Pourquoi : un bloc lâché sur la corbeille était déplacé, pas supprimé. Après la correction, un simple toucher sur la corbeille risquait de supprimer un bloc sans qu'on l'ait glissé : c'est le cas que la relecture a trouvé et corrigé. Seul ton doigt peut juger ce geste ; le Mac ne connaît que la souris.
- [ ] 2.1 · iPad · Sur une carte d'essai (ou un bloc que tu peux perdre), glisse un bloc jusqu'à la corbeille. ⮕ la corbeille vire au rouge sous le bloc.
- [ ] 2.2 · iPad · Lâche-le. ⮕ le bloc disparaît.
- [ ] 2.3 · iPad · Touche « Annuler ». ⮕ le bloc revient.
- [ ] 2.4 · iPad · Touche un bloc sans le bouger, puis touche la corbeille. ⮕ rien n'est supprimé.
- [ ] 2.5 · iPad · Glisse un bloc vers la corbeille, puis ramène-le ailleurs avant de lâcher. ⮕ il est déplacé là où tu l'as lâché, pas supprimé.

## §2 bis · Interface · Le défilement en Annoter et en Évaluer
Pourquoi : ton rapport du 2 nov., 19 h 30 : « Je ne peux pas scroller dans la page d'annotation et d'évaluation. » Tu voulais faire monter tout l'écran pour cacher l'en-tête et les menus, comme avant la 1.230.0. Ces portes étaient dues depuis le 2 et le 3 nov. (#1218 à #1220).
- [ ] 2b.1 · iPad · En Annoter, hors plein écran, sur une copie : fais défiler la page d'un doigt, hors de la copie. ⮕ l'en-tête et les menus montent et sortent de l'écran.
- [ ] 2b.2 · iPad · Défile jusqu'au bout. ⮕ la zone de la copie va du haut au bas de l'écran, sans bande vide en bas.
- [ ] 2b.3 · iPad · Passe en Évaluer. ⮕ la page reste défilée.
- [ ] 2b.4 · iPad · Ouvre une évaluation par « Consulter », reviens en Annoter, puis fais glisser deux doigts sur la copie. ⮕ la copie défile.
- [ ] 2b.5 · iPad · En Annotation compacte, regarde le bas de la palette. ⮕ Annuler, Supprimer et Rétablir y sont, avec « Effacer la page ».

## §3 · Décisions
- Aucune.

## §4 · Ce que je n'ai pas pu vérifier
- **Le défilement (§2 bis).** Il est mesuré au banc avec des événements tactiles fabriqués, dans Chromium et WebKit sur le Mac. Le vrai Safari de l'iPad n'y est pas.
- **L'éditeur de grille à la largeur de l'iPad (#1126, #1095).** Il n'y a pas de porte, d'après la règle 2, car c'est de l'apparence. À 1 440 px, l'essai vérifie que le nom du critère tient dans son champ. Entre 1 181 et 1 280 px, le nom reste un peu coupé ; c'est noté dans la file, pas inscrit.
- **L'import en mode anonymisation (#1221).** Aucun vrai nom à l'étape Optimisation : c'est mesuré dans WebKit sur le Mac, pas dans le vrai Safari de l'iPad.
- **Les reprises (#1222) sur ton corpus.** Le banc Vitest prouve que l'original n'est ni réécrit ni retiré, sur des copies fictives. Le §1 est la seule épreuve sur tes vraies copies.
- **Le stock.** Les rapports de bug déjà archivés gardent `envoye: true` et leur date UTC (#1068, #812). La correction tarit la source, rien n'est réécrit chez toi.
- **La version en ligne.** Je n'ai pas pu lire la version en ligne depuis la session : l'adresse renvoie une redirection. D'où le 0.1.
- **Le verdict du Mac.** 1 358 essais : 1 353 verts, 1 vert au second essai (`lot-i-rappel-mene-au-codex`), 4 rouges connus, 23 sautés.
