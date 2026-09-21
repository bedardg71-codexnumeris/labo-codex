# Consigne du jour – Lot N1 : trouver la pratique active d'une seule façon (#710, #711, #712, #713 volet registre, #719)

> Écrite le 21 septembre 2026, 14 h 31 (Toronto), par Cowork. **Proposée** tant que Grégoire ne l'a pas relayée.
> La précédente (1.152.6, trois « artefact » du PDF, poussée) est archivée sous `plans de travail/_ancienne-CONSIGNE-DU-JOUR-2026-09-21-trois-artefact-pdf.md` (déplacée par Cowork, à commiter avec ce lot).
> **Cap de Grégoire (13 h 08)** : après les demies, les dix fiches de notation encore ouvertes ; groupement de Cowork dans `FILE-DES-LOTS.md` (14 h 29), N1 en premier.
> **DÉCISION DE GRÉGOIRE, 21 sept. à 14 h 31** (question fermée, recommandation de Cowork) : **sans pratique assignée, aucune note.** Pas de repli : « non constructible » partout, et le diagnostic vrai – la phrase qui existe déjà (`profil-etudiant-actions.js` ≈ l. 142) : « Aucune pratique de notation n'est assignée à ce groupe-cours. Ouvre Conception → Pratiques de notation, choisis ta pratique et clique « Appliquer au cours actif ». » Rien n'est effacé : les notes reviennent dès qu'une pratique est assignée.
> Ligne exacte à poser sous #710 dans `BACKLOG.md` (par toi) : « ✅ TRANCHÉ PAR GRÉGOIRE le 21 sept. 2026, 14 h 31 : sans pratique assignée, aucune note (non constructible partout, diagnostic « Aucune pratique de notation n'est assignée… ») ; pas de repli. »

## 0 · Conditions de départ

`git --no-optional-locks log --oneline -1 origin/main` porte `1ca0f949` (journal de 1.152.6) ou un commit de journal après. Sinon, arrête-toi. Aucune autre session n'écrit dans `js/`. **⚠ Laborieux (trois modules et plus, données déjà écrites) : mesure d'abord, et si le lot dépasse ce qu'une session tient proprement, coupe-le en deux (la résolution d'abord, les lecteurs ensuite) et dis-le avant de coder.**

## 1 · Ce que Cowork a remesuré (grep, 14 h 29 ; à remesurer par exécution)

- `obtenirPratiqueActiveGroupeCours` (`modes.js` ≈ 1352) rend `gc.pratiqueId || 'sommative'` ; `PRATIQUE_DEFAUT = 'standards'` (`pratiques/pratique-registre.js:29`) sert de repli à `calculerDetailsNoteFinale` et `obtenirPratiqueActuelle` → deux replis contraires (#710 : P 87 au tableau de bord, « introuvable » au profil ; la branche « Aucune pratique… » de `_diagnostiquerNoteNonCalculable` est inatteignable).
- `obtenirPratiqueParId` normalise l'id, `obtenirConfigPratiqueActive` cherche l'id brut (#711, `pan-standards`).
- `obtenirConfigPratiqueActive` (`portfolio.js` ≈ 1176) ne lit que `.configuration`, alors que `construireConfigComplete` résout aussi `.config` (#712).
- `PratiqueManager.chargerPratiqueActive` (`pratiques/pratique-manager.js:52`) tient `'specifications'` pour une pratique codée en dur valide → instance registre SPE jamais configurée, 50 % pour tous, « constructible » (#713, **volet registre seulement** ; le plancher 50 d'une SPE configurée est le lot N4, didactique, NE PAS y toucher).
- `obtenirPratiqueActuelle` (`profil-etudiant-helpers.js` ≈ 640-690) passe le TYPE au registre ; `denotation` n'y est pas → une PratiquePANStandards est fabriquée ; le jugement 78 se lit « M » (#719).
- ⮕ **Commence par lister TOUS les chemins qui répondent « quelle est la pratique active ? » et « quelle est sa configuration ? »** (grep sur les symboles, pas les noms de fichiers), et dis la liste au rapport.

## 2 · Ce qui change

- **Une seule résolution** : id du groupe-cours actif → id normalisé → configuration par `construireConfigComplete` (`.configuration` puis `.config`) → instance. Tous les lecteurs passent par elle ; le type ne sert plus de clé de registre.
- **Aucun repli** : pas de pratique assignée, ou pratique introuvable, ou id qui ne mène à aucune configuration (y compris `specifications` / `pan-specifications` nus) → « non constructible », au tableau de bord, au profil, à l'export, dans `indicesCP`. Le diagnostic dit la vraie raison : « Aucune pratique… » quand rien n'est assigné ; « introuvable » quand un id est assigné mais ne mène à rien.
- **#711** : un id ancien (`pan-standards`) qui, normalisé, mène à une configuration existante calcule avec CETTE configuration (N = 4), pas avec les défauts du registre.
- **Changer ou retirer la pratique** (ajout du 17 sept. sous #710, D-1) : `indicesCP` ne garde pas l'indice de l'ancienne pratique. Au minimum, un retrait rend « non constructible » ; si recalculer au changement est simple, fais-le, sinon inscris-le et dis-le.
- **Aucun mot neuf** : les deux phrases existent. Si une phrase doit changer ou naître, arrête-toi et propose-la (mots que des collègues lisent).

## 3 · Stock – limite du 20 sept. : rien ne s'efface, rien ne se réécrit

- Lecture tolérante : un pointeur ancien reste tel quel en base ; seule la lecture le normalise. **Aucune migration écrite.**
- ⚠ **Mesure l'effet sur le pack démo et dis-le** : combien de groupes-cours sans pratique, combien d'élèves dont la note passe d'un nombre à « — ». Grégoire a une pratique assignée : pour lui, rien ne doit bouger – un essai le prouve (groupe avec pratique assignée : notes identiques à l'octet, avant/après).
- ⚠ **Arrêt** : si un chemin réel écrit une note dans la base À PARTIR d'un repli (ex. un snapshot, un relevé hebdomadaire), arrête-toi et dis-le : ce qui est déjà écrit reste, mais Grégoire doit savoir.

## 4 · Preuves

- Sur le vrai moteur, cinq montages : sans pratique ; id introuvable ; `pan-standards` avec configuration N = 4 ; pratique rangée sous `.config` seul ; pointeur `specifications` nu ; dénotation active avec un jugement 78. Pour chacun : tableau de bord, profil, export, `indicesCP` disent la même chose (la même note, ou « — » partout), et le diagnostic dit la bonne phrase.
- Parité : pour une pratique assignée normale (chacune des quatre familles), notes identiques à avant.
- Mutations, une à la fois, rouges : repli `'sommative'` remis ; `PRATIQUE_DEFAUT` remis comme repli ; id brut au lieu de normalisé ; `.configuration` seul ; le type passé au registre ; `'specifications'` remis comme pratique codée en dur.
- Vitest complet vert. **Release : minor** (un comportement change pour les groupes sans pratique). Phrase de « Nouvelles » : **à PROPOSER à Grégoire** (question fermée). Relecture croisée par Cowork avant le verdict et le push ; push sur le mot de Grégoire.

## 5 · Ce que Grégoire verra

Rien, dans son groupe (sa pratique est assignée). Un collègue qui n'a pas encore choisi sa pratique voit « — » à la place d'une note, et le profil lui dit d'aller choisir sa pratique. Un collègue en dénotation voit la note chiffrée de sa pratique, plus une lettre « M » qu'aucune règle de sa pratique ne donne.

## 6 · Fichiers de Cowork à commiter avec ce lot

Cette consigne, l'archive de la précédente, `plans de travail/FILE-DES-LOTS.md` (le lot N1 en sort une fois poussé).
