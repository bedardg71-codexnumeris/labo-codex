# Consigne du jour – Lot N6 : les réglages que rien ne lit, et un réglage lu sous deux noms (#900 ; #935 volet nom ; #899 ; dénotation à zéro cible)

> Écrite le 23 septembre 2026, 12 h 20 (Toronto), par Cowork, sur `origin/main` = `dcd22d4f` (1.155.5, en production chez Netlify depuis 11 h 56, déploiement mesuré). **Proposée** tant que Grégoire ne l'a pas relayée.
> La précédente (lot N5, livrée en 1.155.5) est archivée sous `plans de travail/_ancienne-CONSIGNE-DU-JOUR-2026-09-23-lot-n5-cibles.md` (déplacée par Cowork, à commiter avec ce lot).
> **Les fiches font foi** : `BACKLOG.md`, #900 (constat A-7 et ses ajouts du lot 28) et #935 (volet « deux noms » seulement). Dernier lot de la file des pratiques de notation (`plans de travail/FILE-DES-LOTS.md`). **Aucune question à Grégoire en entrée** ; un arrêt prévu au §4, et des mots à lui proposer au §2d.
> ⚠ **Rappel de protocole** (écart du 23 sept. sur N5) : après le complément de relecture, **attends que Cowork l'ait revérifié** avant le verdict, la fusion et le push. Le push du lot N5 a précédé cette revérification ; elle s'est révélée verte, mais l'ordre fait partie de la preuve (PROTOCOLE, règle 2).

## 1 · Ce que fait le lot, en quatre volets

**1a. Retirer du CODE ce qui écrit des champs sans lecteur (#900).** Liste de la fiche : `configuration.varianteCalcul` (hors miroir et formulaire), `portfolio.hybride`, `portfolio.reprisesPermises`, `afficherRang`, `afficherMoyenneGroupe`, `reglesSommatives`, SOM `portfolio{nbArtefacts, qualitatif}`, `jetons.delaiActif`, `jetons.repriseActif`, `portfolio.decouplerPN`, `modeDEN`, et les seuils camelCase du « Modèle sommatif » (B-4, `pratiques-bibliotheque.js`). **Remesure chacun avant de le retirer** : la fiche date du 17 sept., et les lots N1 à N5 ont touché ces fichiers (`modeleBundle`, par exemple, a maintenant un lecteur depuis N4 : il reste). Pour chaque champ : lecteur trouvé → il reste, et tu le dis ; aucun lecteur → l'écriture part. **Rien n'est effacé des données déjà écrites** (limite de Grégoire du 20 sept.) : on cesse d'écrire, on ne nettoie pas. Un champ lu par une phrase seulement (`reprisesPermises`, la fiche le dit) : la phrase dit-elle vrai sans le champ ? Si elle devient fausse ou vide, dis-le.

**1b. Un réglage, un nom (#935, volet nom seulement).** L'assistant écrit `seuilAcceptabilite`, le formulaire de gestion lit et écrit `seuilAcceptable`, le moteur fait primer `seuilAcceptable` : enregistrer au formulaire une spécification créée à 70 la fait passer à 75 sans un mot (mesuré par N4). **Décidé par Cowork (technique)** : un seul nom, celui que le moteur lit ; le formulaire affiche la valeur que la pratique porte, sous l'un ou l'autre nom, et écrit sous le nom unique ; l'assistant écrit sous ce nom. Les pratiques déjà écrites sous l'autre nom se lisent (pas de conversion en base). **Hors lot, à Grégoire plus tard** : la valeur par défaut (75, 100, 60) ; n'en change aucune.

**1c. La flèche (#899).** Le récapitulatif de l'assistant écrit « Conception › Pratiques de notation » (`wizard-pratique-v2.js` ≈ l. 2146) : « → », comme le reste de l'application. Balaye `js/` et `index.html` pour d'autres « › » dans un chemin de navigation montré à l'utilisateur ; aligne ceux des pratiques de notation, inscris les autres s'il y en a.

**1d. Une dénotation sans cible ne s'enregistre plus (mesuré par N5, `aa7007e9`).** La gestion des pratiques accepte d'enregistrer une dénotation à zéro cible ; toutes ses notes sont alors plafonnées à 59. L'assistant, lui, l'interdit. Même garde dans la gestion, par le même composant (`EditeurCibles`) : pas de copie de la règle. **Le message du refus est un mot neuf : propose-le dans le rapport**, Grégoire le lira avant le push.

## 2 · Arrêt prévu

Si un champ de la liste 1a est lu par un **export, un import, un partage de pratique ou la Réserve** (ce qui voyage), il ne part pas : **arrête-toi sur ce champ et dis lequel**, les autres continuent. Rétro-compatibilité de ce qui voyage (`CLAUDE.md`).

## 3 · Tests

- Pour chaque champ retiré : une pratique créée (assistant, formulaire, gabarit) ne le porte plus ; une pratique ancienne qui le porte encore s'ouvre, calcule et s'enregistre sans erreur, et **la note ne bouge pas** (même valeur avant et après, sur les quatre familles).
- 1b : une spécification créée par l'assistant à 70 s'affiche 70 au formulaire et reste 70 après un enregistrement sans rien toucher ; une pratique ancienne sous l'autre nom aussi.
- 1c : la phrase du récapitulatif, mot pour mot.
- 1d : la gestion refuse zéro cible avec le message ; une cible suffit.
- Sentinelle : aucun écrivain des champs retirés dans `js/`.
- Break-test sur chaque assertion ; suite Vitest complète verte.

## 4 · Livraison

- Version **patch** par `scripts/release.mjs`. Item de « Nouvelles » **proposé, à valider par Grégoire avant le push** (sans doute un seul : le seuil qui ne change plus au formulaire, et la dénotation qui exige une cible ; le ménage lui-même ne se voit pas).
- Ordre : commit, relecture de Cowork, corrections, **revérification de Cowork**, verdict, push.
- Ensuite : N6 sort de `FILE-DES-LOTS.md`. **La file des pratiques de notation est vide.** Le chantier suivant, décidé par Grégoire le 23 sept. : le dernier lot de l'export (une seule carte « Exporter des travaux », #895).

## 5 · Le geste que Grégoire vérifiera à l'écran (s'il le souhaite)

Aucun sur ses données : rien ne change pour une pratique Standards. Le lot se prouve par les tests.
