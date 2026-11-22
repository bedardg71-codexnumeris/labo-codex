# Textes proposés : « Par standards » dans la vue simple (à l'essai)

> **Partis en ligne le 21 nov. 2026 sans relecture, par décision de Grégoire (13 h 53) ; à corriger après son essai.**

> Claude Code, 21 nov. 2026. Mandat du 21 nov. (décision de Grégoire, 14 h 19 : « il faut que la vue simple soit
> fonctionnelle avant la release »), branche `lot/moteur-cibles-3-4-retenu-note`, PR n° 46.
> **Tout ce qui suit est une PROPOSITION.** Ces textes partent en ligne tels quels (décision de Grégoire, 13 h 53) et se
> corrigent après son essai. Aucun n'est arrêté.
> **Le ton de la vue simple** : « tu » partout, des phrases courtes, aucun des mots que la vue simple s'interdit (« critère »,
> « grille », « portfolio », « artefact »…, banc `aucunMotInterdit`). **Sur les écrans, le mot est « cible ».**
> Aucun de ces textes n'est lu par un·e étudiant·e : aucun écran ni PDF de l'étudiant·e ne change.
> **Une ligne par texte**, avec l'endroit où on le lit. « X », « N » : une valeur de l'enseignant·e.
> Les textes repris tels quels des lots 2 à 4 (la fenêtre d'une case, la colonne de la note, la légende du tableau,
> « Annuler cette inscription » et sa raison, « En attente : X, Y ») ne sont pas répétés : voir
> `TEXTES-2026-11-21-par-standards-lot-2.md` et `TEXTES-2026-11-21-par-standards-lots-3-4.md`.

## D'abord : ce qui revient à Grégoire

| N° | Question | Ce qui est en place | Statut |
|---|---|---|---|
| Q1 | Le texte de la carte : « Tu écris les cibles de ton cours. Chaque étudiant·e reçoit un niveau par cible ; la note vient du meilleur niveau démontré pour chaque cible. » | En place. La seconde phrase simplifie : la note est la MOYENNE des meilleurs niveaux (dit à l'écran Pratique, bloc « La note ») | proposé |
| Q2 | Le nom du modèle et de la pratique créée : « Par standards » | En place : c'est le nom que Grégoire a retenu pour la famille. ⚠ Des pratiques nommées « Par standards » existent déjà dans le stock (ancien modèle, famille « par sélection de productions ») : deux pratiques peuvent porter le même nom dans un même trimestre. L'écran les distingue (famille lue au type) ; la liste « Pratique » de la vue étendue, non | proposé, à trancher |
| Q3 | « À l'essai » : un mot encadré sous le titre de la carte, sans couleur d'alerte | En place | proposé |
| Q4 | La dernière inscription en vue simple ne montre ni les critères cochés en vue étendue, ni « Sans production » | En place (« pas de critères à cocher en vue simple » ; l'historique complet reste en vue étendue, et la fenêtre le dit) | supposé par Claude Code |
| Q5 | Le bouton d'export du tableau des cibles en vue simple : « Exporter la synthèse (CSV) », le mot du tableau des productions de la vue simple | En place (repris tel quel, pas un mot neuf) | repris |
| Q6 | Les cartes de l'accueil nomment deux modèles : « Choisis un modèle, par sélection de productions ou par spécifications, et la règle qui construit la note. » ; « Inscris un niveau, ou acceptable / non acceptable, dans un tableau : tes étudiant·es en lignes, tes productions en colonnes. » | **Inchangées** (l'accueil est commun ; le changer change l'écran de tous). Proposition, non en place : « Choisis un modèle (par sélection de productions, par spécifications, ou par standards, à l'essai) et la règle qui construit la note. » Même cas, inchangés : le mot d'un groupe d'une autre famille (« …ni par sélection de productions ni par spécifications se suit en vue étendue. »), juste mais incomplet depuis ce lot | à trancher |

## Écran « Pratique » : choisir un modèle

| N° | Où | Texte proposé |
|---|---|---|
| P1 | Titre de la troisième carte | Par standards |
| P2 | Sous le titre, lisible sans survol | À l'essai |
| P3 | Texte de la carte | Tu écris les cibles de ton cours. Chaque étudiant·e reçoit un niveau par cible ; la note vient du meilleur niveau démontré pour chaque cible. |
| P4 | Bouton | Choisir ce modèle (le mot de la carte « Par sélection de productions », repris) |

## Écran « Pratique » : écrire ses cibles

| N° | Où | Texte proposé |
|---|---|---|
| E1 | Titre du bloc | Tes cibles |
| E2 | Sous le titre | Écris les cibles de ton cours, une par ligne : ce que tes étudiant·es doivent pouvoir faire. Tu pourras en ajouter, en renommer ou en retirer ensuite. |
| E3 | Étiquette du champ | Tes cibles, une par ligne |
| E4 | Exemple dans le champ vide (trois lignes) | Analyser un texte / Structurer un propos / Rédiger une dissertation |
| E5 | Boutons | Créer ma pratique · Annuler |
| E6 | Refus : champ vide | Écris au moins une cible. |
| E7 | Refus (réglage) : une ligne vide | Chaque ligne nomme une cible : une ligne est vide. |
| E8 | Refus : deux cibles pareilles (sans égard à la casse) | Deux cibles portent le même nom. |

## Écran « Pratique » : la pratique « Par standards »

| N° | Où | Texte proposé |
|---|---|---|
| R1 | Bloc « Tes cibles », sous la liste | Les énoncés, les poids et les cibles terminales se règlent en vue étendue. |
| R2 | Bloc « Tes cibles », si les poids ont été réglés en vue étendue (inégaux) | Les poids de tes cibles ont été réglés en vue étendue : ils restent tels quels. |
| R3 | Bloc « Tes cibles », aucune cible | Ta pratique n'a pas encore de cible. |
| R4 | Bloc « Tes cibles », l'ensemble introuvable dans le trimestre (repris du tableau, un seul texte) | Les cibles de cette pratique sont introuvables dans ce trimestre. Elles se règlent en vue étendue. |
| R5 | Réglage : en-tête de la colonne ; nom lu d'un champ (lecteur d'écran) | Cible ; Cible 1, Cible 2… |
| R6 | Réglage : boutons | Retirer · + Cible |
| R7 | Réglage enregistré | Cibles enregistrées. |
| R8 | Retirer une cible qui porte des inscriptions | La question de l'assistant, mot pour mot (une seule source, `InscriptionsCibles.questionRetraitCibles`) : « Retirer une cible » / « Tu retires une cible qui porte des inscriptions. « X » : N niveau(x) inscrit(s) [et N remarque(s)] pour N étudiant·e(s). Ses inscriptions restent enregistrées, mais cette cible ne sera plus montrée au tableau. Retirer quand même ? » / « Retirer quand même » |
| R9 | Bloc « Tes niveaux », sous l'échelle | Pour chaque cible, le niveau retenu est le meilleur que l'étudiant·e a démontré. Ces niveaux se règlent en vue étendue. |
| R10 | Bloc « La note », titre puis texte | La note. La moyenne des niveaux retenus de tes cibles. Tant qu'une cible n'a aucun niveau, la note attend : les cibles en attente sont nommées. |
| R11 | Bloc « La note », si le second seuil est actif (vue étendue) | Un second seuil, réglé en vue étendue, peut plafonner la note. |
| R12 | Bloc « La note », si « Notes finalisées » est cochée (vue étendue) | Notes finalisées (vue étendue) : une cible sans niveau compte pour 0 %. |

## Écran « Résultats » : le tableau des cibles en vue simple

| N° | Où | Texte proposé |
|---|---|---|
| T1 | Fenêtre d'une case, sous la rétroaction | L'inscription prend la date d'aujourd'hui. |
| T2 | Fenêtre : « Inscrire le niveau » sans tuile choisie | Choisis un niveau : touche une tuile. |
| T3 | Fenêtre : titre de la section du bas | Dernière inscription |
| T4 | Fenêtre : sous la dernière inscription | Toutes les inscriptions de cette cible se lisent en vue étendue. |
| T5 | Fenêtre : après « Annuler l'inscription » | Inscription annulée. Rien ne s'efface : elle reste, barrée, dans l'historique de la vue étendue. |
| T6 | Tableau vide : aucune cible ; son bouton | Ta pratique n'a pas encore de cible. Écris tes cibles : une par ligne. Bouton : Écrire mes cibles |
| T7 | Tableau vide : l'ensemble introuvable | = R4 |
| T8 | Tableau vide : l'échelle introuvable | L'échelle de cette pratique est introuvable dans ce trimestre : elle se règle en vue étendue. |

## Écran « Note finale »

| N° | Où | Texte proposé |
|---|---|---|
| N1 | Une note en attente, colonne du détail | En attente : X, Y (repris du lot 4) ; la note se lit « – », jamais 0 |
| N2 | Une note plafonnée, colonne du détail | plafonnée (repris du lot 4) |
| N3 | Aucune cible ; son bouton | = T6 (un seul texte, celui du tableau) |
| N4 | Ensemble ou échelle introuvable | = R4, = T8 |
