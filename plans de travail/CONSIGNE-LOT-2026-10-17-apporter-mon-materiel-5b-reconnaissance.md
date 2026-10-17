# Consigne – « Apporter mon matériel », étape 5b du plan : la reconnaissance, d'après douze grilles réelles

> Écrite par Cowork (session du plan de match) le samedi 17 octobre 2026 à 12 h 48 (Toronto, mesuré par `date`). Tirée de `PROPOSITION-2026-10-17-reconnaissance-des-grilles.md` (l'autre session Cowork, 12 h 10, remesurée sur `51a7be2b`) : **lis-la en entier d'abord** ; ses numéros (1 à 16) et ses grilles fictives (F1 à F8) sont repris ici tels quels. Après l'étape 6.
> ⛔ Aucun texte des grilles de Grégoire dans le dépôt (public) : les bancs emploient les grilles fictives F1 à F8, textes inventés. Aucun nom d'élève ni de collègue.
> Skills : `labo-codex`, `integrite-globaux`, `hygiene-donnees-partagees`, `securite-donnees`, `verification-adverse`.

## Ce qui est tranché

- **Q1, par Grégoire (12 h 11)** : « Aussitôt qu'il y a des chiffres, il s'agit d'une note chiffrée. » Une grille qui écrit des points (par niveau, par critère ou en réglette) est **analytique** : points saisis sur le maximum du critère, niveau déduit ; **aucune plage tirée de ces points**. Et : l'objectif n'est pas d'adapter ses grilles, mais de comprendre les formats qu'un·e enseignant·e apporte.
- **Q2 (les constats à cocher, famille C)** : **la description du critère** (aucune perte, aucune interprétation), recommandation de la proposition, **validée par Grégoire à 12 h 52** (« oui »).
- **Les critères « / 0 » sont acceptés** (supposition technique de la proposition, mesurée : `_pourcentageDesPoints` écarte une pondération 0 sans erreur ; le partage l'accepte). Bornes des points : 0 à 100.

## Le mandat : les points 1 à 9 de la proposition (« Avant lundi »)

Tous dans `proposerRoles` / `modeleDepuisRoles` (`js/materiel-lecture.js`) et les manques de `materiel-assistant.js`, sans écran neuf :

1. Les restes de l'étape 5 (« / 0 » accepté ; « Note finale / 100 » et le pied non fusionné ne sont plus des critères ; pas d'en-tête → point 9 ; puces → point 3).
2. **Lignes de pied et de calcul** → « À classer » avec leur raison, jamais un critère.
3. **Les puces, retirées partout**, nom compris (↳ · • ▪ ◦ ‣ ➤ – ☐ ☑ □ ■ * -).
4. **Les points d'un niveau** (dernière ligne de chaque case de niveau = nombre, plage ou énumération) → le plus grand nombre de la rangée devient les points du critère, analytique (Q1) ; le nombre reste dans le descripteur. ⚠ À mesurer et à régler dans ce lot : une grille **entièrement analytique** se note sans échelle (#941) ; ses descripteurs par niveau doivent rester **lisibles avec le nom de leur niveau** dans Grilles de critères (aujourd'hui, sans échelle, le bloc du lot 3b1 ne montre que le code). Choisis la façon (une échelle sans plages n'est pas permise par l'éditeur ; un nom de niveau gardé avec les descripteurs l'est peut-être), **à condition que rien ne se perde au partage** (`partage-schemas.js` : tout champ non déclaré disparaît sans un mot). Dis ce que tu as choisi.
5. **La bande à réglette** → « Nom d'un critère » + « Suite du critère », sans geste.
6. **La case de nom sur plusieurs lignes** : 1re ligne = nom ; lignes à puce = sous-critères ; lignes sans puce = description. Dans une « Suite du critère », l'option « selon les puces », proposée par défaut (les trois du lot 3a restent).
7. **Case de nom vide sous un critère** → « Suite du critère » proposée ; nom coupé sur deux rangées recollé (règle de la proposition).
8. **Colonnes de cases à cocher** (et la rangée de petits numéros) → « À ignorer » proposé ; la colonne des constats → « Description du critère » proposée (Q2).
9. **Pas d'en-tête** : la 1re rangée est un critère quand elle en a la forme.

**Aussi** : l'encadré « Dans l'application » de l'étape « Ce que contient ton tableau » parle d'échelle et de descripteurs même pour une grille en points (constat de ton inventaire) : qu'il dise ce qui vaut pour la grille lue. Texte provisoire, relu à l'étape 7.

**Si le temps le permet, dans cet ordre** : 10 (rôle de rangée « Partie »), 11 (pondération au bout du nom ; un pourcentage dans le titre reste au nom de la grille), 12 (plusieurs tableaux dans un même collage). Ce que tu ne fais pas : inscris-le, avec 13 à 16.

## Les bancs

- Les grilles fictives **F1 à F8 et F8-texte** de la proposition, chacune avec sa lecture **attendue** (écrite dans la proposition) : essai par grille, et le nombre de gestes au menu quand il en faut.
- Non-régression : l'exemple, les grilles des lots 1 et 3a, celles de l'étape 5, lues et créées comme avant.
- Mutation par règle ; Playwright, lancée seule dans WebKit : F1 et F6 collées → Vérification juste → « Créer ma grille ».

## La méthode

Commit (par groupes de règles si c'est plus sûr), Vitest complet, demande `plans de travail/DEMANDE-RELECTURE-2026-10-17-apporter-mon-materiel-5b-reconnaissance.md` avec la liste des textes provisoires neufs. **Complète l'inventaire** `INVENTAIRE-TEXTES-2026-10-17-apporter-mon-materiel.md` avec les textes des étapes 6 et 5b. Bump du bloc de jetons. Aucun push, aucune release, aucune vérification complète (étape 8). Rapport court à Grégoire, en gestes d'utilisateur.
