# Consigne du jour – Le bilan : la définition de chaque critère à travailler, et des « Points récurrents » qui regardent d'une copie à l'autre

> Écrite le 24 septembre 2026 (Toronto), par Cowork, sur `origin/main` = `4b2e6e4d` (1.156.3, en production chez Netlify depuis 7 h 35, déploiement mesuré).
> La précédente (#939, livrée en 1.156.3) est archivée sous `plans de travail/_ancienne-CONSIGNE-DU-JOUR-2026-09-24-lot-939-commentaire-critere.md` (déplacée par Cowork, à commiter avec ce lot).
> **Troisième lot du chantier « synthèse des rétroactions »** (cap du 21 sept.). Né d'une capture de Grégoire (PDF d'une copie en pratique Standards) : « Ce bilan est une composante majeure de la rétroaction. » **Symptôme vécu.** Inscris UNE fiche au BACKLOG à l'ouverture (numéro suivant #939) et coche-la à la livraison ; ajoute le lot à `FILE-DES-LOTS.md` sous le cap.

## 0 · Les décisions de Grégoire (24 sept. 2026) – elles font foi

Forme validée, mot pour mot (les ‹…› sont des données) :

> **PRÉSENTEMENT, IL FAUT SE CONCENTRER SUR**
> Acquis en développement, à consolider :
> • Structure (En développement) : ‹la définition du critère, telle qu'elle est écrite dans la grille›
>
> **POINTS RÉCURRENTS**
> • Structure : à consolider depuis 2 productions
> • Rigueur : prioritaire depuis 4 productions

1. **Chaque critère de « Présentement, il faut se concentrer sur » porte sa définition** – les prioritaires ET les « à consolider ». Forme : `Nom (niveau) : définition`. La définition telle qu'écrite (plus de minuscules forcées, plus placée devant le nom). Sans définition dans la grille : `Nom (niveau)` seul, rien d'inventé.
2. **« Points récurrents » = ce qui revient D'UNE COPIE À L'AUTRE** (les mots de Grégoire : « une récurrence identifiée dans le temps », « une cible de travail immédiate pour l'élève »). Un critère y paraît quand il est dans une zone à travailler (priorité ou signalé) sur cette copie ET sur la précédente – **dès deux productions**. La ligne donne le **nombre réel de productions consécutives** où il reste à travailler, en remontant l'historique jusqu'à la première copie où il est « acquis » (ou jusqu'au bout de l'historique lu). Le mot vient de la zone de la copie ACTUELLE : « prioritaire » ou « à consolider ». Forme : `Nom : à consolider depuis N productions` / `Nom : prioritaire depuis N productions`.
3. **Les tampons de la copie quittent « Points récurrents »** : ils sont en entier dans « Commentaires ciblés ». (La répétition tronquée à 80 caractères part.)
4. **La mention « Cet objectif est prioritaire depuis 3 productions »** quitte la ligne du critère dans « Présentement… » : la récurrence se dit une seule fois, dans « Points récurrents ».

## 1 · Ce que Cowork a mesuré (lecture seule, sur `4b2e6e4d` – à REMESURER)

- **Pourquoi la définition a disparu** : jusqu'au 28 août, un critère en D était un « défi » et recevait `description` en préfixe (`construireConcentration`, `js/synthese-retroaction-data.js` ≈ l. 834-842). `170db4c6` (#555 lot 2) a créé la zone `'signale'` ; les critères en D y sont passés, et `signales` ne rend que `Nom (niveau)` (≈ l. 847). Même chose côté écran : `_rendreSignalesBilan` (`js/evaluation-retroaction.js` ≈ l. 969).
- **La récurrence existante** : `identifierPatrons` (≈ l. 1318) ne regarde que la zone `'priorite'`, exige trois copies (actuelle + deux précédentes), et n'alimente que le suffixe de « Présentement ». `lireHistorique` (≈ l. 1341) : même élève, non remplacée, sans la copie en cours, triée par date, **cinq au plus** – donc un compte plafonné à 6 ; dis-le, et décide seul si le plafond gêne (technique). Côté écran : le même suffixe (`evaluation-retroaction.js` ≈ l. 931).
- **« Points récurrents » aujourd'hui** (`construireRecurrents`, ≈ l. 853) porte aussi « Ta force », le décompte d'erreurs (« principalement… »), « Progrès : … depuis … », « Tu as progressé en … ». **Hors décision** : ces lignes ne bougent pas dans ce lot. Dis dans ton rapport lesquelles regardent cette copie seule et lesquelles regardent le temps : Grégoire tranchera ensuite, pas maintenant.
- **Écran et PDF, mêmes mots** (#581, `copierToutRetroaction` copie l'un dans l'autre) : le bilan de l'écran (`evaluation-retroaction.js`) suit exactement la même forme. Idéalement une seule règle que les deux lisent (zéro-dette), comme #939 l'a fait pour le commentaire d'un critère.

## 2 · La question de Grégoire – à mesurer et à dire dans le rapport

« On parle ici d'une pratique Standards avec échelle de performance. C'est sans doute différent avec des critères analytiques et une sommative ? À vérifier. »

Ce que Cowork a lu (à confirmer par l'exécution) : le bilan ne dépend pas de la pratique, mais de l'**échelle de l'évaluation** (`zoneDuNiveau`, `profil-etudiant-calculs.js` ≈ l. 352), et chaque copie de l'historique est lue dans SA propre échelle. Un critère analytique porte un niveau déduit de ses points (`niveauSelectionne`) : il a donc une zone, et « Présentement » affiche ses points (« 56 / 70 », `lectureNiveauCritere`). Une échelle sans aucun des deux repères rend `null` : ni « Présentement » ni « Points récurrents » ne disent rien – refus honnête, inchangé. **Prouve-le au banc sur trois copies de chaque sorte** : holistique (Standards, échelle à repères), analytique (sommative, échelle à repères), et une échelle sans repères ; plus un historique qui change d'échelle d'une copie à l'autre. Dis en une ligne, en français d'utilisateur, ce que lit l'élève dans chaque cas.

## 3 · Limites

- **Aucune donnée écrite.** Le bilan se compose à la lecture ; aucune évaluation réécrite.
- Pas de nom d'élève réel dans les bancs ni le rapport (règle 6).
- Ne touche ni l'intro du bilan, ni « Jetons utilisés », ni « Note provisoire ».

## 4 · Preuve attendue

- Vitest (PDF et écran, mêmes cas) : définition présente / absente ; prioritaire et à consolider ; récurrence à 2, à N, interrompue par un « acquis », absente avec une seule copie ; plafond de l'historique ; changement d'échelle ; échelle sans repères ; analytique. Les tampons ne sont plus dans « Points récurrents » ; le suffixe « depuis 3 productions » n'est plus dans « Présentement ».
- WebKit : une copie Standards à deux copies antérieures → le PDF de synthèse et le bilan de l'écran portent les mêmes lignes.
- Break-tests de ton choix, chacun rouge ; nomme-les.
- « Nouvelles » : **proposition de Cowork, à soumettre à Grégoire avant le push** : « Synthèse de rétroaction : « Présentement, il faut se concentrer sur » donne de nouveau la définition de chaque critère à travailler. « Points récurrents » nomme ce qui revient d'une copie à l'autre, dès deux productions, et depuis combien de productions. »
- Relecture croisée de Cowork avant la fusion, puis verdict, fusion, push.

## 5 · Porte terrain

Une rangée, sur ses vraies données : le « Dossier PDF » d'une copie d'un·e élève qui a au moins une copie évaluée avant celle-ci.
