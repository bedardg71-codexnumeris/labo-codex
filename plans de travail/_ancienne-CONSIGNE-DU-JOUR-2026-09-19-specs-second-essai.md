# Consigne suivante — les specs qui passent au second essai (#685, #833)

> Écrite le 19 septembre 2026, 7h50 (Toronto), par Cowork.
> **Condition de départ** : `git --no-optional-locks log --oneline -1 origin/main` doit montrer `fc1c012d` ou plus récent, et `git --no-optional-locks status --porcelain` doit être propre côté code. ⚠ `main` local porte au moins un commit de documentation d'avance sur `origin/main` (`80661049`) : **ce n'est pas un blocage**, mais nomme-le au démarrage. Puis archive `plans de travail/CONSIGNE-DU-JOUR.md` sous `_ancienne-CONSIGNE-DU-JOUR-2026-09-17-resultats-ulterieurs.md` et renomme ce fichier en `CONSIGNE-DU-JOUR.md`.
> **Identifiant** : relis « Dernier ID utilisé » sur `main` (elle était à **#922**) avant d'en prendre un ; `grep` les deux registres.
> ⚠ **Ce lot ne touche AUCUN fichier de `js/`.** Donc : aucune entrée de « Nouvelles », aucune phrase à demander à Grégoire, aucun écran à vérifier chez lui. C'est voulu — il travaille en parallèle.

---

## 1 · Pourquoi ce lot, maintenant

La suite Playwright est l'instrument sur lequel tout le dispositif repose : c'est elle qui autorise un push. **Elle se dégrade.** Mesuré dans `RELAIS.md` : le mot « second essai » y apparaît **quatorze fois**, et la seule journée du 18 sept. en compte **six specs d'un coup** dans un verdict de 70 minutes (accueil-640, portes-relais-cadre, portes-terrain-vague3, pratiques-898, profil-871, texte-troue-paliers). Le 17 au soir, `planif-toolbar` a bloqué un push sur un commit qui avait été vert une heure plus tôt.

Ta propre note du 18 dit l'essentiel : « **ce n'est plus la charge seule : c'est un sujet** ». Et le registre porte déjà l'avertissement qui compte — « une CI rouge en permanence ne signale plus rien ». Un verdict qu'on rattrape au second essai ne prouve plus rien non plus.

⮕ **L'objet du lot : rendre son pouvoir de preuve à la suite.** Pas la faire passer.

## 2 · Ce que Cowork a mesuré `[lecture]` — à REMESURER avant de coder

- **295 appels à `waitForTimeout` dans 113 des 135 fichiers de `tests/integration/`.** Ce sont des attentes **fixes** : elles parient sur une durée au lieu d'attendre une condition. C'est le mécanisme d'instabilité le plus banal qui soit, et le plus sensible à la charge de la machine.
- **La corrélation est nette sur les trois specs nommées instables** : `planif-toolbar.spec.js` en porte **24 — le maximum du dépôt** ; `triptyque-seme-produit-une-note.spec.js` en porte 4 (#685 le nommait déjà : « trois `waitForTimeout(700)` fixes », hypothèse mesurée mais non éprouvée) ; `liste-651-annoter-depuis-le-mode-evaluer.spec.js` n'en porte **qu'un seul**.
- ⮕ **Donc la cause n'est PAS la même partout**, et c'est la première chose que le lot doit établir. Pour `liste-651`, ta note du 18 nomme déjà autre chose : l'attente qui expire est `#evaluations-liste.sous-section.active` (ligne 157 de la spec).
- **L'outillage est déjà bon, ne le refais pas** : `workers: 1` et `fullyParallel: false` (motif écrit : le `localStorage` de `file://` est partagé) ; `retries: 1` ; et `scripts/verifier-playwright.mjs` **rapporte déjà** les vertes au second essai (`flakyDuRapport`), avec le commentaire qui dit pourquoi. Le problème n'est pas qu'on ne voit pas : c'est qu'on regarde ailleurs.
- ⚠ **Une fiche peut être mal rattachée** : `RELAIS.md` range `liste-651` sous **#685**, alors que la fiche #685 nomme `triptyque-seme-produit-une-note.spec.js`. **Mesure qui couvre quoi avant d'écrire une ligne au registre**, et corrige le rattachement s'il est faux.

## 3 · Ce que le lot doit tenir

1. **Un inventaire daté**, dans `plans de travail/`, des specs vertes au second essai depuis le 1er sept. : le nom, la date de chaque occurrence, la charge quand elle est connue, et **la cause mesurée** — pas supposée.
2. **La cause lue pour au moins `planif-toolbar` et `triptyque`** : quelle attente expire, et pourquoi. Une attente fixe qui suffit à charge basse et pas à charge haute est une cause ; « instable » n'en est pas une.
3. **Le remplacement des attentes fixes par des attentes sur condition** dans ces specs — `expect(locator).toBeVisible()`, `waitForFunction`, `waitForSelector` — chaque fois que la condition attendue est **nommable**. Là où elle ne l'est pas, garde l'attente fixe **et écris en commentaire ce qu'on attend et pourquoi rien ne le dit** : c'est une dette nommée, pas un échec.
4. **La preuve par répétition** : chaque spec touchée est rejouée **10 fois de suite, `--retries=0`**, avant et après. Le lot ne conclut que sur des comptes. Avant/après, en toutes lettres.

## 4 · Le critère d'arrêt — mesurable par toi seul

**Arrête-toi et rapporte** dès que l'un de ces cas se présente :

- Une spec rejouée 10 fois avec `--retries=0` est **verte 10 fois AVANT** toute modification : sa cause n'est pas dans la spec, elle est dans la charge ou ailleurs. Ne la touche pas, inscris la mesure.
- Une spec reste rouge après le remplacement de ses attentes : **c'est peut-être un vrai défaut de l'application**, pas un défaut de test. ⮕ Ne la « stabilise » pas, ne l'exclus pas : rapporte-la, elle devient une fiche à part.
- Le lot dépasse **six specs**. Ce n'est pas un chantier de nettoyage des 295 attentes du dépôt : c'est la remise en état des specs qui ont réellement flanché.

## 5 · ⛔ Ce qui est interdit, et pourquoi

- **Augmenter `retries`.** Ce serait masquer la mesure au lieu de la faire.
- **Ajouter une spec à `EXCLUS_WEBKIT_LINUX`.** Une spec exclue ne dit plus rien du tout, et c'est précisément le mécanisme par lequel une suite cesse de signaler.
- **Allonger un `waitForTimeout` existant.** Le même pari, plus cher.
- **Toucher à `js/`.** Si la mesure révèle un défaut d'application, il devient une fiche, pas une rustine dans ce lot.
- **Affaiblir une assertion** pour qu'elle passe. Une attente peut changer de forme ; ce qu'elle juge, non.

## 6 · Ce que le lot livre

Des fichiers de `tests/` et un document de `plans de travail/`. **Aucun code d'application**, donc **aucun bump de version et aucune entrée de « Nouvelles »** — un commit de tests et de documentation, poussé quand Grégoire le demande. Inscris au registre : le rattachement corrigé de #685 et de #833, les causes mesurées, et toute spec que le §4 t'a fait mettre de côté.

## 7 · Une chose que je n'ai pas mesurée, et qu'il faut regarder

Une sauvegarde Time Machine tournait pendant le verdict de 70 minutes du 18 (`backupd-helper`, charge 93). Si la charge de la machine explique à elle seule une partie des occurrences, **dis-le avec les chiffres** — et alors la vraie suite n'est pas de réécrire des specs, c'est que `pousser.sh` refuse de partir au-dessus d'une charge donnée. ⚠ Le relais du 18 note déjà que sa boucle d'attente de charge **abandonnait après 5 min et lançait quand même** : « ne pas plafonner l'attente de charge, ou plafonner et NE PAS lancer ». Si ta mesure pointe là, ce lot-là vaut mieux que celui-ci — **dis-le avant de réécrire quoi que ce soit.**
