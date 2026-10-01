# Consigne du jour – l'avertissement à la mise à jour d'un codex auquel des copies manquent (#1012, suite)

> Écrite par Cowork le 1er octobre 2026 à 17 h 52 (Toronto, mesurée par `date`). Remplace la consigne de la mesure de 16 h 56, archivée sous `_ancienne-CONSIGNE-DU-JOUR-2026-10-01-1012-mesure-des-copies.md`. L'ordre des chantiers de 13 h 02 ne change pas : ce lot est la fin du point 1 (le codex).

## Où on en est

Ta mesure de 17 h 03 : chez Grégoire, 500 copies, 500 fichiers, aucune copie attendue sans fichier. L'avertissement ne s'afficherait pas à chaque mise à jour : il peut avertir sans refuser, comme tu le proposais (§ 5.3 de ta demande de relecture). **Grégoire a accepté les mots** (« oui », à 17 h 52).

## D'abord

Pousse `dcf5cd5a` sur `main`, avec les fichiers de Cowork qui traînent dans l'arbre (cette consigne, les anciennes archivées). Supprime aussi chez `origin` les trois branches fusionnées, si le garde de permissions le laisse faire ; sinon dis-le et continue.

## Ce que tu fais, sur une branche

1. **L'avertissement.** Quand l'usager écrit le codex entier (« Mettre à jour le codex », « Enregistrer sous… », le partage de l'iPad, le téléchargement : tous les chemins de ton § 5.1) et que des copies attendues n'ont pas de fichier dans l'application, une fenêtre le dit **avant** toute écriture hors de l'application. Le signal est celui de ton § 5.2 : compté à la génération, pas lu dans les statuts. Redis dans ta demande ce que « attendue » veut dire, au mot près, et ce que deviennent le « manquant » qui a son fichier et les « exporte » qui ont le leur (ta mesure en a trouvé chez Grégoire).
   Les mots, acceptés par Grégoire, à poser tels quels :
   - Titre : « Ce codex n'aura pas toutes tes copies »
   - Texte : « {N} copies sur {M} ne sont pas dans l'application. Le codex que tu vas écrire ne les contiendra pas. »
   - Puis : « Si un autre fichier de codex les contient encore, ne le remplace pas : donne un autre nom à celui-ci. »
   - Boutons : « Annuler » et « Écrire sans ces copies ».
   - L'accord en nombre (« 1 copie sur 3 n'est pas dans l'application », « ne la contiendra pas ») : tranche-le, c'est de la grammaire.
2. **Tant que des copies manquent, l'application demande toujours où écrire** : jamais de réécriture en place, même si un fichier est tenu, et la destination choisie n'est pas adoptée. Décision de Cowork, technique : c'est ce qui rend utile la dernière phrase de l'avertissement. Sur « Annuler » : rien n'est écrit, et le témoin ne dit pas « Codex mis à jour ».
3. **« Exporter une sélection »** (ta trouvaille 6.1) : reproduis par le geste, puis corrige selon la règle du verdict : jamais dans le fichier tenu, destination jamais adoptée, toujours demander où écrire. Les mots de l'avertissement disent « ce codex » : ne les pose pas sur un export de sélection. Dis ce qui arrive à une sélection dont des copies manquent, et inscris-le si c'est un défaut.
4. **L'ancien fichier ouvert par la case** (relevé du verdict) : mesure par le geste. Un codex A tenu, puis un ancien fichier ouvert par la case « Ouvrir un Codex… » : que remplace cet import dans l'espace, et où écrit ensuite « Mettre à jour le codex » ? Si c'est le défaut de ce matin par une autre porte et qu'il se corrige sans mot neuf (l'application oublie le fichier tenu quand l'espace est remplacé), corrige ; sinon rends la mesure et arrête-toi là pour ce point.
5. **La preuve** : des bancs qui jugent par le geste (quel fichier reçoit quoi, ou qu'une destination est demandée, ou que rien n'est écrit après « Annuler »), un témoin sans copie manquante où aucune fenêtre ne s'affiche, des mutations rouges, Vitest complet. Dis ce qui reste inféré pour Chrome et pour le partage de l'iPad.
6. **Source ou stock** : dis-le. Aucune écriture dans les données de l'usager n'est attendue de ce lot ; si tu en trouves une nécessaire, arrête-toi.
7. **Arrête-toi à la demande de relecture** : `plans de travail/DEMANDE-RELECTURE-2026-10-01-1012-avertissement.md`, avec une proposition de ligne pour les Nouvelles. Ni release, ni push du code.

## Ce que tu ne fais pas

- Les mots des trois autres causes d'une ouverture incomplète (ton § 4.3) : Grégoire ne les a pas encore tranchés. Ils auront leur lot.
- Aucune lecture nouvelle de l'espace réel de Grégoire.

## Ce que tu rends

À Grégoire, trois lignes en gestes : ce qui est codé ; ce que la mesure du point 4 a montré ; ce qui l'attend. Ce que tu as supposé, en une ligne.

## Ajout de 17 h 55 – les mots des trois autres causes entrent dans ce lot

Grégoire les a acceptés (« oui », à 17 h 55). La section « Ce que tu ne fais pas » ne les exclut plus : pose-les dans ce lot, dans `construireBilanImport`, à la place des phrases de #334. Ils partiront avec l'avertissement, dans la même relecture.

Le cadre est celui du manque d'espace, inchangé : titre « Codex ouvert, mais incomplet » ; deuxième phrase « Tes données, elles, sont complètes, et ton fichier de codex n'a pas changé. » ; à la fin, « Recharger la page pour appliquer les données ? ». Seuls changent la première phrase et le conseil :

- **Copies absentes du fichier.** « {N} copies sur {M} ne sont pas dans ce fichier de codex. » Conseil : « Elles manquaient déjà quand ce codex a été écrit : le rouvrir ne les ramènera pas. Cherche-les dans un codex plus ancien ou dans une archive. »
- **Format non reconnu.** « {N} copies sur {M} n'ont pas été reprises : leur contenu n'est ni une image ni un PDF. » Conseil : « Rouvrir le même codex ne les ramènera pas. »
- **Erreur technique.** « {N} copies sur {M} n'ont pas pu revenir, à cause d'une erreur. » Conseil : « Pour retrouver ces copies : rouvre le même codex. Si l'erreur revient, utilise « Signaler un bug ou donner ton avis » : le détail y sera. »
  ⚠ Le nom du bouton est celui d'`index.html` (lu par Cowork, l. 3927). **Vérifie par le geste que le détail de l'erreur se retrouve bien dans le signalement** avant de poser « le détail y sera ». S'il n'y est pas, pose le conseil sans ces quatre mots et dis-le dans ta demande : Grégoire tranchera.
- **Mélange de causes** (composition tranchée par Cowork, c'est de l'assemblage) : une première phrase qui donne le nombre par cause, sur ton modèle (« {N} copies sur {M} n'ont pas pu revenir : {a} faute d'espace, {b} absentes du fichier, {c} dans un format non reconnu, {d} à cause d'une erreur. », seules les causes présentes) ; puis le conseil de chaque cause présente, celui de l'espace en premier. Les accords en nombre : tranche-les.

Le titre « Recharger la page » ne sert donc plus qu'à l'ouverture complète, et « rouvre le même ZIP » disparaît. Mets à jour les bancs et les mutations en conséquence.
