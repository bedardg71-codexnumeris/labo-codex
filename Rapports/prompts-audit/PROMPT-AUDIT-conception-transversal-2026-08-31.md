---
serie : Revue des onglets par audit cadré
onglet : Conception — passe transversale (temps 1 de 3)
destinataire : Fable 5 (accès complet au dépôt)
executant_des_correctifs : Opus 5, au temps 3 seulement
type : audit de cohérence structurelle
livrable_attendu : carte du modèle d'objets + inventaire des divergences + désignation des zones à approfondir
correctifs : AUCUN à ce stade
date : 2026-08-31
statut : à exécuter
---

# Audit transversal — modèle d'objets de l'onglet Conception (Labo Codex)

## Nature de cet audit

Ceci n'est PAS un audit de robustesse. Ne cherche pas ce qui casse quand
l'utilisateur fait une mauvaise manipulation. Cherche si le code dit la
même chose partout, une seule fois, et si les objets que l'enseignant crée
dans cet onglet tiennent ensemble.

L'onglet Conception vient d'être audité et corrigé au cours de plusieurs
sessions de travail successives. Ces sessions n'ont pas partagé de vue
d'ensemble : chacune a corrigé ce qu'elle voyait depuis son angle. Le
soupçon à instruire est que certaines corrections se sont recouvertes, se
sont annulées, ou ont laissé derrière elles des références orphelines.

N'essaie PAS de reconstruire cet historique. Ne lis ni SESSION.md ni le
git log pour deviner les intentions passées. Juge le code tel qu'il est
aujourd'hui. Si l'état actuel est incohérent, c'est un fait présent, pas
une question d'archéologie.

## Ton livrable est une CARTE, pas des correctifs

Cet audit est la première passe d'une séquence en trois temps :

  1. cette passe → la carte du modèle d'objets et l'inventaire des
     divergences
  2. deux ou trois audits ciblés en profondeur, sur les zones que TU
     désigneras au terme de celle-ci
  3. un plan de correction unique, exécuté ensuite

N'écris AUCUN correctif. Ne propose AUCUN diff. Ne modifie AUCUN fichier.
Si tu identifies une correction évidente, note-la en une ligne dans les
constats et passe à la suite : elle sera planifiée au temps 3, avec les
autres, une fois la carte connue. Un correctif proposé maintenant, avant
la carte, reproduirait exactement le problème qu'on cherche à sortir.

## Périmètre

L'onglet Conception, ses six sous-sections visibles dans index.html :

  #conception-carte                 (carte de planification)
  #conception-productions           (productions étudiantes)
  #conception-grille-criteres       (grilles de critères, cartouches)
  #conception-echelle-performance   (échelles de performance)
  #conception-retroactions          (banques de rétroaction)
  #conception-pratiques-notation    (pratiques de notation)

Environ 42 000 lignes de JS, dont notamment :

  js/planification-carte.js (11 838)   js/echelles.js (4 776)
  js/grilles.js (4 359)                js/productions.js (3 270)
  js/wizard-pratique-v2.js (3 148)     js/pratiques-gestion.js (2 992)
  js/pratiques.js (2 436)              js/planification-export.js (1 638)
  js/pratique-notation-v2.js (1 250)   js/comparateur-pratiques.js (1 128)
  js/pratiques-bibliotheque.js (989)   js/productions-bibliotheque-ui.js (867)
  js/productions-import-export.js (696)  js/planification-bibliotheque.js (644)
  js/planification-donnees.js (603)    js/productions-liste.js (502)
  js/echelles-bibliotheque.js (359)    js/productions-namespace-garde.js (183)
  js/grilles-bibliotheque.js (301)     js/productions-bibliotheque.js (331)
  js/cartouches.js, js/cartouches-bibliotheque.js
  js/pratiques/ (répertoire), js/planification.js (86)

Plus la portion HTML correspondante d'index.html (~lignes 4156-6219).

Tu ne LIS pas ces 42 000 lignes intégralement. Tu les traverses en
suivant les objets, avec grep et lectures ciblées. Si tu te retrouves à
lire un fichier en entier, c'est que tu as perdu le fil de l'objet.

## Ce qui est HORS de cette passe

- La qualité du code prise isolément (nommage, longueur des fonctions,
  style, complexité). Non pertinent ici.
- L'ergonomie, le design, les libellés, l'accessibilité.
- Les performances.
- Tout ce qui ne concerne ni un objet du domaine ni un état partagé.

## Outils disponibles

  python3 scripts/audit-ssot.py

régénère `scripts/audit-ssot.{json,md}` : pour chaque clé de stockage, qui
l'écrit et qui la lit, extrait du code. LANCE-LE EN PREMIER.

`docs/DATA-OWNERSHIP.md` est le registre de propriété des clés, mais son
propre en-tête avertit que les listes de contourneurs datent de mai 2026 :
ne t'y fie pas sans l'avoir régénéré. Traite l'écart entre le registre et
la sortie fraîche du script comme un constat en soi — c'est une mesure
directe de la dérive.

Limite connue du script : il ne capture pas les écritures passant par une
variable opaque (`const CLE = 'foo'; db.setSync(CLE, …)`). Ces cas sont
marqués « via variable » dans le registre, et plusieurs propriétaires du
périmètre en font partie. Complète le script par grep là où il est aveugle.

Lis aussi, ciblé :
  docs/architecture/ECOSYSTEME-DONNEES.md  (Codex, Archives, Voûte)
  docs/modules/evaluations-productions.md
  docs/adr/ et docs/decisions/  (décisions d'architecture actées)

/!\ SESSION.md (~7 600 lignes) et BACKLOG.md (~1 300) ne se lisent JAMAIS en
entier. Ici, tu n'as en principe pas à les ouvrir du tout.

## Axe 1 — Le modèle d'objets

Établis, pour chaque objet du domaine Conception :

  production · grille de critères · cartouche · échelle de performance ·
  banque de rétroaction · pratique de notation · modalités d'évaluation ·
  carte de planification (mindmap) · alignement

- sa clé de stockage et son régime (namespacé par trimestre / global)
- son module propriétaire réel, mesuré, pas déclaré
- sa forme : quels champs, quels identifiants
- son cycle de vie complet : création, édition, duplication, import depuis
  une bibliothèque, import depuis un package de partage, suppression,
  archivage de trimestre
- quels autres objets le référencent, et par quoi (id, nom, index ?)

Puis instruis l'intégrité référentielle :

- Que devient une référence quand la cible est supprimée ? Y a-t-il un
  contrôle avant suppression, une réparation après, ou rien ?
- Une duplication régénère-t-elle les identifiants ? Les références
  internes de la copie pointent-elles vers la copie ou vers l'original ?
- Un objet importé depuis la bibliothèque ou depuis un package de partage
  conserve-t-il des références vers des objets qui n'existent pas chez
  l'utilisateur ?
- Deux objets peuvent-ils porter le même identifiant ? Par quel chemin ?
- Existe-t-il des objets atteignables par un écran mais absents d'un autre
  qui devrait les voir ?

## Axe 2 — Les trois régimes de portée

Les objets de travail sont namespacés par trimestre (`cle('nomCle')`), les
bibliothèques sont globales, et les entités importées par partage vivent
dans des collections `partage_*` avec des identifiants préfixés. Trois
régimes, et des références qui les traversent.

Cartographie où passent ces frontières et quelles références les
franchissent. Une référence qui traverse une frontière de portée sans
traduction explicite est un conflit, même si rien n'a encore cassé.

Hypothèse à confirmer ou à infirmer, formulée par l'auteur du présent
cadrage et NON vérifiée : `cartouches_[grilleId]` est déclarée globale au
registre, alors que `grillesTemplates` est passée namespacée par trimestre
lors du chantier #358 (28 juin 2026). Si des grilles de trimestres
différents peuvent porter le même identifiant, leurs cartouches
partageraient la même clé. Vérifie-le. Si l'hypothèse est fausse, dis-le
clairement — c'est une information utile.

Instruis aussi le passage d'un trimestre à l'autre :
`js/productions-namespace-garde.js` est un garde-fou posé après l'incident
#340, où un changement de trimestre a écrasé `h2026_productions` avec le
contenu de `a2025_productions`. Son en-tête admet que l'écrivain fautif n'a
jamais été identifié : la garde neutralise l'effet, la cause est peut-être
encore là. Le mécanisme décrit — un read-modify-write asynchrone qui lit
sous un namespace et réécrit sous un autre parce que le trimestre a basculé
entre temps — existe-t-il ailleurs dans le périmètre, pour d'autres objets
que les productions ?

## Axe 3 — L'état global partagé

Ces objets vivent sur `window` et sont écrits depuis plusieurs modules :

  window.planificationDonnees   (~68 sites)
  window.tempCriteres           (~51 sites)
  window.modalitesEvaluation    (~36 sites)
  window.repertoiresBibliotheque (~28 sites)
  window.planificationCarte     (~27 sites)
  window.IDS_GABARITS_HARDCODES (~16 sites)

Pour chacun : qui l'initialise, qui l'écrit, quand est-il remis à zéro, et
survit-il à des transitions où il ne devrait pas (fermeture de modale sans
enregistrer, passage d'une sous-section à l'autre, changement de trimestre,
ouverture d'un second objet en édition). `tempCriteres` mérite une
attention particulière : un état d'édition temporaire partagé globalement
et écrit depuis cinquante endroits est la forme canonique du conflit entre
deux objets ouverts.

Cherche aussi les cas où deux modules écrivent le même état sans se
connaître, et où l'ordre de chargement dans index.html détermine qui gagne.

## Axe 4 — Résidus de dérive

- Références DOM mortes : le JS mentionne des identifiants de sous-section
  qui ne semblent plus exister dans index.html (`conception-alignement`,
  `conception-cartouches`, `conception-grilles`, `conception-echelles`,
  `conception-pratiques`, `conception-organisateur`,
  `conception-apercu-legacy`, `conception-productions-nouvelle`,
  `conception-grilles-nouvelle`). Établis lesquels sont morts, lesquels
  sont des alias vivants, et ce que fait le code quand il ne trouve pas
  son élément.
- Structure HTML : index.html porte au moins un commentaire de cicatrice
  (#155, vers la ligne 4467) sur des fermetures de <div> mal placées qui
  avaient rendu des pages Conception vides. Vérifie l'équilibre de la
  structure des six sous-sections.
- Logique dupliquée : la même règle métier implémentée à deux endroits qui
  ont divergé. Signale-la même si tu n'as pas été mandaté dessus — c'est
  une source directe de confusion entre sessions.
- Code mort : chemins inatteignables, fonctions sans appelant, gardes
  devenues sans objet.
- Diagnostics résiduels : scripts/diagnostic-154-productions-inaccessibles.js
  et scripts/diagnostic-156-echelles-grilles-invisibles.js traitent
  d'incidents passés dans ce périmètre exact. Les symptômes qu'ils
  cherchaient sont-ils réellement éteints, ou seulement masqués ?

## Rigueur exigée

Pour chaque affirmation, distingue explicitement :
- VÉRIFIÉ — tu l'as lu dans le code, avec fichier:ligne et l'extrait
- INFÉRÉ — cohérent avec ce que tu as lu, non prouvé
- SUPPOSÉ — hypothèse qui demanderait un test à l'exécution

Une carte fausse est pire que pas de carte : elle fera prendre de mauvaises
décisions au temps 3. Quand tu n'arrives pas à établir quelque chose, écris
« non établi » et dis ce qu'il faudrait pour trancher. Ne comble aucun trou
par de la plausibilité, et n'infère pas l'intention derrière un bout de
code : décris ce qu'il fait.

Signale aussi ce qui est propre. Le registre cite `planification_mindmap`
et `calendrierComplet` comme des patterns exemplaires à un seul écrivain —
si c'est encore vrai, dis-le : les zones saines délimitent les zones
malades, et évitent qu'on aille corriger ce qui n'est pas cassé.

Politique du projet : zéro dette. Pas d'alias de compatibilité « au cas
où », pas de code mort conservé. Quand tu signales un résidu, dis
explicitement qu'il doit être RETIRÉ, pas contourné.

## Livrable

Un rapport en français, en Markdown, structuré ainsi :

1. **Carte du modèle d'objets** — un tableau : objet, clé, régime de
   portée, propriétaire réel, écrivains effectifs, objets qui le
   référencent. Plus un schéma des références croisées (Mermaid ou texte
   structuré). C'est la pièce maîtresse : elle doit pouvoir être collée
   dans la documentation du projet et servir de référence commune aux
   sessions suivantes.

2. **Divergences constatées** — chaque écart entre ce que le registre
   déclare et ce que le code fait, chaque référence qui traverse une
   frontière de portée sans traduction, chaque état global à écrivains
   multiples, chaque résidu. Classés :
   - CONFLIT — deux vérités concurrentes pour la même donnée ; corruption
     ou perte possible
   - INCOHÉRENCE — le code ne dit pas la même chose partout, sans
     conséquence prouvée à ce jour
   - RÉSIDU — mort, orphelin, ou devenu sans objet
   Chacune avec fichier:ligne et niveau de certitude.

3. **Zones à auditer en profondeur** — deux ou trois, pas plus, choisies
   par toi. Pour chacune : son périmètre exact en fichiers, la question
   précise à laquelle l'audit ciblé devra répondre, et pourquoi elle
   passe avant les autres. C'est ce qui commandera la suite du travail :
   sois explicite sur ton critère de priorisation.

4. **Angles morts** — ce que l'analyse statique ne peut pas trancher et
   qui demanderait un test à l'exécution, sur Mac et sur iPad séparément.

Ne modifie aucun fichier du dépôt. N'écris ni dans SESSION.md, ni dans
BACKLOG.md, ni dans DATA-OWNERSHIP.md. La sortie régénérée de
`scripts/audit-ssot.py` est une exception acceptable, puisque le script
est prévu pour cela. Rends le rapport, rien d'autre.
