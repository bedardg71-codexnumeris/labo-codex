# Les chaînes d'étapes, lot 3b : les étapes validées par Grégoire, outil par outil

> Tenu par Cowork, samedi 24 octobre 2026 (Toronto). Plan : `PLAN-2026-10-24-bibliotheques-chaines-critere-algo.md`, lot 3. Le lot 3a (composant, option, chaîne des grilles) est accepté : `VERDICT-RELECTURE-2026-10-24-chaines-etapes-3a.md`. Chaque chaîne est proposée par Cowork, corrigée ou acceptée par Grégoire ; la consigne du lot 3b s'écrit quand les quatre sont validées. Même dessin et mêmes règles qu'au 3a (composant `js/chaine-etapes.js`, l'état « en attention » dans la teinte des avertissements, le point d'arrivée en nœud plus grand).

## Échelles de performance — validée par Grégoire le 24 oct. à 19 h 44 (« d'accord »)

| Étape | Réglée quand | Sous l'étape |
|---|---|---|
| **Niveaux** | au moins deux niveaux, chacun avec un code et un nom | « 4 niveaux » ; « 1 niveau » ; « aucun » |
| **Pourcentages** | les niveaux couvrent de 0 à 100 %, sans trou ni chevauchement (la convention de l'app : un niveau finit à 64,99, le suivant commence à 65) | « 0 à 100 % » ; sinon « trou à 65 % » ou « chevauchement à 75 % », en attention |
| **Repères** | « Suffisant à partir de » et « Maîtrisé à partir de » sont posés (`seuilSuffisance`, `seuilMaitrise`, #555) | les deux codes, « D · M » ; « à poser » (à régler, pas en attention) |
| **Production** (point d'arrivée) | au moins une production du trimestre actif porte cette échelle (`echelleId`) | « 2 prod. » ; « 1 prod. » ; « aucune » |

- **Repères** : Grégoire a décidé le 28 août qu'une échelle sans repères est légitime (#555 : aucune valeur devinée). La chaîne le respecte : l'étape est « à régler », jamais une erreur. Motif de l'inclure (Cowork, accepté) : sans repères, l'app ne sait pas où commence la maîtrise sur une échelle autre que IDME, et ne peut pas dire à l'élève ses forces et ses défis.
- Le mot « seuil » est déjà employé à l'écran pour les repères (« Le seuil de suffisance ne peut pas être plus haut… ») : d'où « Pourcentages » pour les bornes des niveaux.

## Cartouches de rétroaction — validée par Grégoire le 24 oct. à 19 h 45 (« d'accord »)

| Étape | Réglée quand | Sous l'étape |
|---|---|---|
| **Grille** | la grille de la cartouche (`grilleId`, la clé `cartouches_{grilleId}`) existe et a au moins un critère | « 5 critères » ; « aucun » |
| **Échelle** | l'échelle de la cartouche est choisie (`echelleId`, #578 : elle donne les colonnes ; aucune devinée) | « 4 niveaux » ; « à choisir » |
| **Commentaires** | chaque case critère × niveau a un commentaire non vide (le même compte que le pourcentage de complétion de l'écran, `calculerPourcentageComplete`) | « 20 sur 20 » ; « 14 sur 20 » (à régler, pas en attention) |
| **Production** (point d'arrivée) | au moins une production du trimestre actif porte cette cartouche (`cartoucheId`) | « 2 prod. » ; « 1 prod. » ; « aucune » |

- **Commentaires** : réglée seulement quand toutes les cases sont remplies (décision de Grégoire sur la recommandation de Cowork) : une case vide, c'est un élève de ce niveau qui ne lit rien pour ce critère, le manque que l'écran d'évaluation nomme depuis la 1.216.2. Incomplète : « à régler », sans couleur d'alerte.

## Productions étudiantes — validée par Grégoire le 24 oct. à 19 h 47, Objectif et Tâche ajoutés à sa demande (19 h 47), forme acceptée à 19 h 49 (« oui »)

| Étape | Réglée quand | Sous l'étape |
|---|---|---|
| **Objectif** | le champ objectif de la production est rempli (`objectif`, non vide après `trim`) | « écrit » ; « à écrire » |
| **Tâche** | la description de la tâche est remplie (`tache`, non vide après `trim`) | « écrite » ; « à écrire » |
| **Grille** | une grille est choisie (`grilleId`) | « choisie » ; « à choisir » |
| **Échelle** | une échelle est choisie (`echelleId`) | « choisie » ; « à choisir » |
| **Cartouche** | une cartouche est choisie (`cartoucheId`) | « choisie » ; « aucune » |
| **Échéance** (point d'arrivée) | une échéance est assignée au groupe-cours actif (la lecture `assignee && date` de `obtenirEcheanceEffective`) | la date, « 14 nov. » ; « à planifier » |

- **Objectif et Tâche** : la demande de Grégoire (19 h 47), parce qu'ils paraissent dans la feuille de synthèse que l'élève reçoit. Mesuré par Cowork : le ruban « OBJECTIF / TÂCHE / CONTEXTE » de la synthèse (`js/synthese-retroaction-rendu.js` l. ~290, `renderRuban`) lit `production.objectif` et `production.tache` (`js/synthese-retroaction-data.js` l. ~291) ; une cellule vide ne s'affiche pas. Le « Détail de la tâche » n'est pas dans ce ruban (seulement dans le PDF détaillé, `js/export-pdf.js` l. ~2025, si l'option est cochée) : il n'est pas une étape. Les libellés des deux étapes sont ceux du ruban que l'élève lit.
- Aucune étape n'est « en attention » : un champ vide ou un outil non choisi est « à régler ».
- **Échéance** : « à planifier », le mot déjà affiché par l'app ; sans couleur d'alerte (#486 : une production sans échéance assignée est un état légitime).
- **Cartouche** : obligatoire pour une chaîne complète (recommandation de Cowork, acceptée) ; une production évaluée sans cartouche garde l'étape « à régler ».
- **La pondération n'est pas une étape** : elle tient à l'ensemble des productions, et la liste affiche déjà « Pondération correcte ».

## Pratiques de notation — validée par Grégoire le 24 oct. à 19 h 51 (« d'accord ») ; le lien avec l'assistant, à 19 h 52 (« oui »)

| Étape | Réglée quand | Sous l'étape |
|---|---|---|
| **Méthode** | la famille et la méthode de calcul sont posées (`calcul_note.methode`) | le nom de la famille, tel que l'app l'affiche (« Sommative », « Standards »…) |
| **Échelle** | une échelle est choisie (`configuration.echelleId`). **N'apparaît que pour les méthodes qui la consomment** (`methodesAvecEchelle` de `js/pratiques/pratique-configurable.js`, aujourd'hui `conversion_niveaux`) | « choisie » ; « à choisir » |
| **Pondération** | **pratique sommative seulement** (`moyenne_ponderee`) : les productions du trimestre totalisent 100 % (le calcul de « Pondération correcte » de la liste, `mettreAJourPonderationTotale`, artefacts-portfolio exclus) | « 100 % » ; « 70 % » (à régler, **sans couleur**) ; « 110 % » **en rouge** (l'état critique du 3a) |
| **Groupe-cours** (point d'arrivée) | la pratique est la pratique active du groupe-cours actif (`obtenirIdPratiqueActive`) | « active » ; « à activer » |

- **Pondération** : sous 100 %, ce n'est pas une erreur en cours de trimestre (toutes les productions ne sont pas encore créées) ; au-dessus, oui. Recommandation de Cowork acceptée. Pour les autres familles, l'étape n'apparaît pas.
- **L'assistant** : Grégoire proposait d'en faire la première étape (19 h 51). Pas retenu, sur la mesure de Cowork, acceptée : la chaîne ne paraît que dans le gabarit, donc après l'assistant (une étape toujours cochée) ; l'app ne garde pas trace du passage par l'assistant (une pratique tirée de la bibliothèque ou importée resterait « à régler » pour toujours). **À la place : toucher « Méthode » rouvre l'assistant** en mode édition (`ouvrirWizardV2(true, id)`, qui entre à la classification `calcul-note-finale`), comme le fait déjà `editerPratique` (`js/pratiques.js` l. ~597).
