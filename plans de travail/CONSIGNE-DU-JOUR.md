# Consigne – lot E2 de l'enregistrement : créer ou modifier, zone Cadre et élèves (D3)

> Écrite le 28 septembre 2026, à 8 h 05 (Toronto), par Cowork. Source qui fait foi : `plans de travail/DECISIONS-2026-09-26-enregistrement.md`, **D3** (et D0). Constat : `plans de travail/INVENTAIRE-ENREGISTREMENT-2026-09-26.md`, § 3 « Cadre », annexe A3 « Cadre ». Modèle : le lot E1 (1.164.0, porte passée sur l'iPad le 28 à 7 h 56), `DEMANDE-RELECTURE-2026-09-27-lot-E1-conception.md` et `RELECTURE-2026-09-27-lot-E1-conception.md`. Reprends ses mécanismes (témoin commun, question « … n'est pas encore créé », « Fermer », `beforeunload` commun) au lieu d'en inventer d'autres.
>
> **Au début du lot** : archive l'actuelle `CONSIGNE-DU-JOUR.md` (lot E1, livré) sous `_ancienne-CONSIGNE-DU-JOUR-2026-09-27-lot-E1-conception.md`, puis renomme celle-ci en `CONSIGNE-DU-JOUR.md`.
>
> **Condition de départ** : `git log origin/main` montre `6a43e278` (1.164.0) ou plus récent ; le commit documentaire local `185eba31` peut partir avec ce lot. Aucun autre lot en cours dans `js/` (le chantier de la carte d'alignement attend son tour : **un seul lot à la fois dans `js/`**). Branche `lot-e2-cadre-eleves` ; fusion après la relecture croisée seulement.
>
> **À remesurer avant le code** : les lignes citées viennent de l'inventaire du 26 et de ma lecture du 28 vers 8 h ; elles ont pu bouger avec les lots B à E1.

## 1 · Ce que Grégoire a décidé (D3, 26 sept. vers 13 h 41, « excellent, je garde »)

- **Créer** quelque chose de neuf (ici : trimestre, cours ou service, horaire, groupe-cours, élève) : un bouton qui nomme le geste. Tant qu'on n'a pas cliqué, rien n'existe ; quitter avant avertit.
- **Modifier** ce qui existe : tout s'enregistre tout seul, champ par champ – Cadre du trimestre, profil enseignant, élèves compris.
- Dans une fiche existante, **« Annuler » devient « Fermer »**.
- Les champs que l'application vérifie (session et année du trimestre…) disent **« Non enregistré : ‹raison› »** au lieu de deux messages contradictoires.

## 2 · Ce que j'ai lu, et les décisions techniques de Cowork

- **Le Cadre du trimestre, identification** (`trimestre-v2-init.js`, `sauvegarderIdentificationTrimestreV2` vers la l. 158, `sauvegarderTrimestreCompletV2` vers la l. 277). ⚠ C'est le point délicat du lot. La session et l'année **fixent l'identifiant du trimestre, donc le préfixe de toutes ses clés** (#379) ; l'écriture par champ avait été retirée exprès en juillet pour cette raison (#306, lot 2). Décision de Cowork :
  - le **nom** du trimestre s'enregistre seul, comme tout champ ;
  - la **session et l'année** s'écrivent **ensemble**, au changement (`change`, pas à la frappe), et seulement quand les deux sont valides ; un état intermédiaire (session changée, année pas encore) ne s'écrit pas et ne déclenche aucune erreur de collision ; la garde de collision et la garde « Changement bloqué » restent telles quelles et disent leur refus par le témoin, « Non enregistré : ‹raison› », en remettant les champs à la valeur enregistrée ;
  - le **double message** mesuré (« Identification incomplète » puis « Cadre du trimestre sauvegardé ») disparaît : un refus n'est jamais suivi d'un succès ;
  - le cadre calendaire s'écrit sous l'identifiant **en vigueur après** l'identification, jamais sous un identifiant intermédiaire ;
  - **aucune migration de clés** : si un chemin que tu trouves déplace ou renomme des données d'un trimestre, **arrête-toi et dis-le** (ça remonte à Grégoire : ses données réelles).
  - S'il n'y a **aucun trimestre actif**, l'identification **crée** un trimestre : c'est un geste de création, avec son bouton (« Créer le trimestre »).
- **Le cadre calendaire** (dates, bornes, semaines spéciales, journées sans cours) : les dates s'enregistrent seules ; les gestes déjà automatiques (vers les l. 401-483 et 700-743) passent par le témoin. Le bouton « Enregistrer » de la carte disparaît.
- **Profil enseignant** (`trimestre-v2-enseignants.js`, vers les l. 81-93) : s'enregistre seul, champ par champ. La carte de synthèse ne montre plus que ce qui est écrit.
- **Cours ou service, horaire, groupe-cours** (`trimestre-v2-horaires.js` vers les l. 834-961, `groupes-cours.js` vers les l. 618-830) : existant → automatique ; neuf → « Créer le … », rien en base avant, la question de sortie du lot E1 à « Fermer », à l'ouverture d'une autre fiche et au rechargement. Aujourd'hui, **le message de réussite part avant l'écriture** : le témoin parle après avoir lu le retour de l'écriture, jamais avant.
- **Élèves** (`etudiants.js` vers les l. 622-740, `await db.modifier` sans `try` ; `trimestre-v2-etudiants.js`) : une fiche d'élève existante s'enregistre seule ; un élève neuf n'existe qu'au clic sur le bouton d'ajout. Le mode anonymisation suit ce que le lot A a posé (on travaille normalement, rien d'identifiant ne s'affiche) : vérifie que les gardes « Modification impossible » (vers les l. 354 et 965) sont cohérentes avec le lot A, sans les affaiblir.
- **Retirer un élève, supprimer un horaire ou un cours** : **ne change rien** aux suppressions (confirmation, portée). Aucun code neuf ne supprime une donnée.
- **La navigation** vit dans `js/navigation.js`, **zone protégée** (CLAUDE.md) : même règle qu'au lot E1. Si l'avertissement exige `navigation.js`, arrête-toi et dis-le.
- **Ne touche pas** : l'**archivage d'un trimestre** (moratoire actif, #622 ; son « Erreur: undefined » est inscrit là) ; la Conception (E1, livrée) ; les productions, interventions et volet confidentiel (E3) ; l'Alignement ; les mots du codex, de la Réserve et de la copie de secours (lot F).
- **En passant, dans ces fichiers** : les `alert` bloquants et au vouvoiement du Cadre (#678 pour ceux du parcours de création) : relève-les pour Grégoire, en tableau avant / après ; ne les remplace que si le lot touche déjà la fonction.
- **Fiches** : cherche dans `BACKLOG.md` et `SUIVI-BUGS.md` celles que le lot règle, au moins #678, #791, #472, #477 ; liste-les avec « réglée / en partie / non ».

## 3 · Les mots – à faire accepter par Grégoire AVANT le push

Déjà décidés (D3) : « Créer le … » ; « Fermer » ; « … n'est pas encore créé. » ; « Non enregistré : ‹raison› ».

Proposés par Cowork (sur le patron du lot E1) :
- Boutons : **« Créer le trimestre »**, **« Créer le cours »**, **« Créer l'horaire »**, **« Créer le groupe-cours »**, **« Ajouter l'élève »** (« créer » un élève sonne faux ; le geste existant dit « Ajouter l'étudiant·e » : à trancher par Grégoire).
- Question de sortie : **« Ce cours n'est pas encore créé. »** (et ses jumeaux ; pour l'élève : « Cet élève n'est pas encore ajouté. »), boutons **« Rester »** / **« Quitter sans créer »** (« Quitter sans ajouter » pour l'élève).
- Refus d'identification : **« Non enregistré – Identification du trimestre : ‹raison› »**, les raisons actuelles reprises telles quelles.
- Les `alert` relevés : tableau avant / après.
- **Nouvelles** : « Cadre et élèves : le trimestre, ton profil, un cours, un horaire, un groupe-cours ou un élève existant s'enregistrent tout seuls, champ par champ ; le témoin le dit. Pour en créer un nouveau, un bouton nomme le geste, et l'application te prévient si tu quittes avant. « Annuler » devient « Fermer ». » (À ajuster à ce que le lot couvre réellement.)

## 4 · Preuves

- Par comportement : (a) modifier le nom du trimestre, une date, un champ du profil enseignant, un champ d'un élève existant, puis changer d'écran sans autre geste → en base, le témoin a dit « Enregistré ». (b) Identification : changer la session seule n'écrit rien et ne dit aucune erreur ; changer session et année vers une paire libre sur un trimestre vide → écrit, une seule fois ; vers une paire prise → « Non enregistré », champs remis, **aucune clé déplacée** (compte des clés du trimestre avant / après) ; sur un trimestre qui a des données → « Changement bloqué » par le témoin, aucun succès. (c) Nouveau cours, horaire, groupe-cours, élève : rien en base avant le clic ; « Fermer » pose la question, « Rester » ne perd rien, « Quitter sans créer » n'écrit rien. (d) Un échec d'écriture sur un champ du Cadre : « Non enregistré – ‹geste› : … », aucun succès. (e) Le message de réussite d'un horaire ou d'un groupe-cours ne précède plus l'écriture.
- Mutations, chacune rouge : l'identification écrite à la frappe ; l'état intermédiaire écrit ; un succès après un refus ; un écrivain du Cadre sans témoin ; « Créer le cours » qui écrit avant le clic ; la question de sortie retirée.
- Vitest complet ; bancs WebKit voisins (lot B, lot E1, #379 et ses gardes, parcours de rentrée, import d'élèves) verts ; placement des boutons renommés à 360, 768, 1024 et 1180 px, hors du témoin.

## 5 · Livraison

- **Relecture croisée exigée** (identifiant du trimestre, données d'élèves) : commit → `plans de travail/DEMANDE-RELECTURE-2026-09-28-lot-E2-cadre-eleves.md` → relecture de Cowork → corrections → verdict → fusion.
- **Cases à cocher** : celles que ta recherche trouve réglées, et elles seules.
- **Stock** : rien n'est réécrit, déplacé ni effacé.
- Release `minor`. Mots, relevé des `alert` et Nouvelles acceptés par Grégoire avant le push.
- **Porte terrain** : seulement ce qu'aucun test ne peut juger, sur ses données réelles et **sans rien créer de fictif** (il ne crée pas de données pour tester) ; un geste qui modifie une donnée réelle prévoit sa rangée de retour à l'état d'origine, comme au lot E1.
