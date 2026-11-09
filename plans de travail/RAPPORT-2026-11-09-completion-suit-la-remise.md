En cours : la mesure est faite et poussée, le code suit. Cette ligne dira « Codé » ou « Pas codé » à la fin de la session.

# Rapport : lot « La complétion suit la remise » (session D, nuit du 8 au 9 nov. 2026)

Consigne : `plans de travail/CONSIGNE-LOT-2026-11-08-completion-suit-la-remise.md` (sur `main`). Plan de la nuit :
`plans de travail/NUIT-2026-11-08-TRAVAIL-DANS-LE-CLOUD.md`, section « Session D ». Branche `lot/completion-suit-la-remise`,
partie de `origin/main` = `98c04bf` (1.237.2 en ligne). Non fusionnée, non publiée, rien au changelog. Écrit par Claude Code,
session dans le nuage : ni WebKit ni les données de Grégoire ici.

## En tête

**Fait** : la mesure que demande la consigne (section 1 ci-dessous).

**Attend Grégoire** : rien pour l'instant ; les questions viendront avec le code.

**Pas vérifiable ici** : ce qui change sur ton groupe d'A2026 (tes données sont sur le Mac).

## 1. La mesure, avant tout code

### 1.1 Le constat de Cowork tient

Lu dans `98c04bf` :
- `evaluationCompteCommeRemise` (`js/pratiques/pratique-registre.js:1185`) passe par `evaluationEntreDansLaNote` (`:991`) :
  une copie n'est une remise que si elle a une note, est verrouillée, n'est ni « Incomplet » (qui, lui, compte comme
  remise), ni de portée nulle, ni non recevable, ni « Non reçu ».
- Le dénominateur de la sommative (`calculerDetailsCompletion`, `js/pratiques/pratique-sommative.js:292`, filtre à `:307`)
  réunit les productions non facultatives dont **au moins une copie du groupe** entre dans la note. La première copie
  évaluée et verrouillée y fait entrer sa production pour tout le monde.
- Effet : sur un groupe neuf de douze, après une première copie évaluée, les onze autres sont à 0/1, donc 0 %. Je
  le reproduis dans l'essai du lot (section 3), sans navigateur.

### 1.2 Ce qu'est une copie importée dans le code : un fichier, pas une évaluation

C'est le fait qui décide de la forme du correctif. Une copie importée est une fiche de la liste `fichiersTravaux`
(`js/travaux-stockage.js:337`, `ajouterFichierTravail`), rangée par élève (`etudiantDA`) et par production
(`productionId`). L'import ne crée **aucune** évaluation. Aucun calcul de complétion ne lit cette liste aujourd'hui :
ils ne lisent que `evaluationsSauvegardees`. Une copie mise à la corbeille sort de la liste (`deplacerEnCorbeilleLot`,
`:1061`) : elle n'y est plus.

### 1.3 Le dénominateur peut rester tel qu'il est

Il faut distinguer deux classes, parce qu'une pratique ne calcule pas toujours C au même endroit :
- une pratique **de ta bibliothèque** (créée par « Partir d'un modèle », par l'assistant, importée d'un collègue) est
  calculée par `PratiqueConfigurable` (`obtenirPratiqueParId`, `pratique-registre.js:631-636`), quelle que soit sa famille ;
- une pratique absente de la bibliothèque retombe sur l'instance codée en dur de sa famille (`PratiqueSommative`,
  `PratiquePANStandards`, `PratiquePanSpecifications`).

En sommative, les deux chemins ont le même dénominateur : la sommative codée en dur (`pratique-sommative.js:307`) et la
configurable (`pratique-configurable.js:630`, qui écarte en plus les productions diagnostiques). Une production y entre
à la première copie évaluée et verrouillée du groupe, et pas avant. C'est ce que Grégoire dit déjà réglé.

Avec la règle décidée, ce dénominateur reste juste sans y toucher :
- avant toute évaluation, la production n'y est pas : une copie importée ne rapporte rien, et personne ne perd rien ;
- dès la première copie évaluée, chaque copie importée de cette production compte comme remise ; seul·e un·e étudiant·e
  sans fichier et sans évaluation compte comme non remis·e, ce qui est la règle (« sans import, c'est l'évaluation seule
  qui confirme la remise ») ;
- le numérateur ne parcourt que les productions du dénominateur : une remise ne peut pas dépasser le total.

Je ne change donc pas le dénominateur.

### 1.4 Les autres familles : la même règle de remise, pas le même dénominateur

Ce qui compte comme remise est **la même règle** (`evaluationCompteCommeRemise`) dans :
- la sommative codée en dur (`pratique-sommative.js:332`) ;
- les standards codés en dur (`pratique-pan-standards.js:332`) ;
- **toute pratique de ta bibliothèque**, toutes familles confondues : sommative, standards, spécifications, dénotation
  (`pratique-configurable.js:652`). C'est le point à retenir : dans la configurable, le calcul de C est le même code pour
  les quatre familles. Le défaut constaté par Cowork (onze à 0 % après une première copie évaluée) y existe donc aussi
  en standards, en spécifications et en dénotation ;
- les deux calculs de C des captures du Suivi (`js/snapshots.js:268`, C de chaque étudiant·e ; `:774`, C du groupe),
  qui ne regardent pas la famille.

Deux exceptions :
- les standards codés en dur ont un autre dénominateur : les travaux **assignés avec une échéance**
  (`pratique-pan-standards.js:308`), qu'une copie soit évaluée ou non ;
- les spécifications codées en dur ne comptent pas des remises : C y est la part des travaux **acceptables** du palier le
  plus haut (`pratique-pan-specifications.js:397`). Une copie importée n'y a pas de sens avant d'être jugée.

Conséquence pour le code : la décision est appliquée **en sommative seulement**, comme la consigne le demande. Dans la
configurable, une condition sur la famille (`obtenirCode() === 'SOM'`) garde les trois autres familles telles qu'elles
sont. Rien n'oblige à étendre la règle pour que la sommative soit juste : les familles ne se mélangent dans aucun calcul
de C. Étendre ou non reste ta décision (question en tête du rapport final).

### 1.5 C n'entre dans aucune note

Cherché partout où C ou la complétion est lue :
- la note du cours (P) se calcule à part : `calculerNoteDuCours` (`js/portfolio.js:460`), à côté de C (`:457`), sans le lire ;
  `calculerDetailsNoteFinale` (`js/profil-etudiant-actions.js:452`) ne le lit pas non plus ;
- le « minimum de complétion » du portfolio (`minimumCompletion`) ne lit pas C : il compte les copies qui **entrent dans la
  note**. Il sert de seuil d'affichage de P (`js/etudiants.js:957`, `js/tableau-bord-apercu.js:1822`) et, en standards,
  de déficit pour le plafonnement de conformité (`profil-etudiant-actions.js:561`, `nombreEvalues` = copies qui entrent
  dans la note). Une copie importée et non évaluée n'y entre pas, avant comme après ;
- le type « completion » d'une évaluation d'un modèle prédéfini (`pratiques-predefines.js:655`) est un type de
  production, pas l'indice C.

C sert au dépistage (risque, niveau de RàI, carte Complétion du profil, rapport), pas à une note. Les notes d'A2025 et
d'H2026 ne sont pas touchées.

### 1.6 Le stock

Les captures du Suivi déjà enregistrées gardent l'ancienne valeur de C. Rien n'est recalculé d'office. « Recalculer
les captures » (Réglages) les recalculerait avec la nouvelle règle. Les indices du jour (`indicesCP`) se recalculent
au prochain calcul, comme toujours.

### 1.7 La démo

Le pack démo (`js/pack-demo-10.js`) ne contient **aucune** copie importée (aucune entrée `fichiersTravaux`), et sa pratique
est « standards ». Ses chiffres ne peuvent pas bouger : Loyal Suricate reste à 80 %, et les deux productions non remises
dont parle « Découvrir » restent non remises. Mesure dans Chromium avant et après : section 4.

### 1.8 Ton groupe d'A2026

À mesurer sur le Mac, en lecture seule. Ce qui décide : la famille de la pratique appliquée au groupe, et le nombre de
copies importées qui ne sont pas encore évaluées. Si la pratique n'est pas une sommative, rien ne change à l'écran.
