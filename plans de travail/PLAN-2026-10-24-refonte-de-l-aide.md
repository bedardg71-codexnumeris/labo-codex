# Plan – La refonte de l'Aide (24 octobre 2026)

> Écrit par Cowork (session dans le nuage) le samedi 24 octobre 2026 au soir, sur `main` = `dc39bff2`, à partir de l'audit `plans de travail/audit-aide-2026-10-24/AUDIT-AIDE-2026-10-24.md` et des treize décisions que Grégoire y a rendues (24 oct., 18 h 24-18 h 25).
> **Ordre avec l'autre plan du jour.** `PLAN-2026-10-24-bibliotheques-chaines-critere-algo.md` a encore ses lots 3 et 4. Une seule session écrit à la fois (règle de parallélisme) : les lots de ce plan passent **entre** deux lots de l'autre, ou après lui, jamais en même temps. Le lot 1 ne décrit aucun écran ; les lots 2 décrivent les écrans tels qu'ils sont quand ils passent.

## État au 24 octobre 2026, 20 h 07 : chantier suspendu

Décision de Grégoire (20 h 06) : le chantier est mis en suspens, parce que d'autres lots tournent dans d'autres sessions et qu'il n'en lance pas plusieurs à la fois ; l'interface des bibliothèques va être revue.

- **Fait** : le lot 1, couper et ranger (`c320a977`, relu et accepté par Cowork ; pas encore en ligne, il part avec la prochaine version).
- **Il reste** :
  - la consigne `CONSIGNE-LOT-2026-10-24-correction-noms-fictifs.md`, pas encore exécutée : les deux noms retirés en `cac1465d` étaient fictifs (Grégoire, 19 h 18) ; elle retire la sentinelle sans objet et rend vrais un commentaire de test et une ligne du relais ;
  - D6 (« Étudiant·e 1 » en mode anonymisé) : la décision de Grégoire, sur la voie qui ne réécrit aucune table (`DEMANDE-RELECTURE-2026-10-24-aide-lot-1.md`) ;
  - les lots 2a, 2b, 2c, 3, 4, 5 et la porte, tels que décrits plus haut.
- **Avant de reprendre** : remesurer, contre le code d'alors, les entrées qui décrivent les écrans changés depuis l'audit (les bibliothèques de la Conception et leur nouvelle revue, la page Trimestre, le profil individuel, les chaînes d'étapes). Le dossier d'audit a été mesuré à `35745bd` ; ses verdicts « vrai ? » sur ces écrans peuvent avoir vieilli. Ajuster le plan si un écran a changé de forme, puis seulement écrire la consigne du lot 2a.

## État au 27 octobre 2026, 14 h 40 : chantier repris, remesure faite

Grégoire reprend le chantier (27 oct., 14 h 23). La remesure demandée plus bas est faite : `audit-aide-2026-10-24/REMESURE-2026-10-27.md`, sur `2fef338a` (1.221.0). Sur les 42 entrées qui décrivent un écran changé depuis l'audit, 21 sont intactes et 21 à reprendre ; le dossier propose pour 14 d'entre elles une correction qui décrit l'ancien écran ; onze gestes neufs n'ont aucune entrée ; deux renvois ont été cassés par le lot 1.

**Ajustements de Cowork au plan** (le détail et leurs motifs sont dans la remesure) :
- les lots 2 lisent la remesure avant le dossier ; pour les entrées qu'elle nomme, elle l'emporte ;
- les gestes neufs vont dans l'entrée de leur écran, au lot de leur partie ; deux entrées neuves dans Commencer, « la bibliothèque » (à partir du texte validé par Grégoire le 25 oct. à 16 h 53) et « les chaînes d'étapes » ;
- le lot 2a est coupé en deux : **2a** Commencer et Cadre ; **2b** Conception (dont la réécriture de `sous-criteres`, texte épinglé par `critere-algorithmique-mots.test.js`) ; l'ancien 2b devient **2c** (Évaluation, Suivi), l'ancien 2c devient **2d** (Labo, Codex et archives, Référence) ;
- la cible de mots se réévalue après le lot 2a.

Restent ouverts, sans changement : la consigne `CONSIGNE-LOT-2026-10-24-correction-noms-fictifs.md` (toujours pas exécutée) et D6.

**Lot 2a fait** (27 oct.) : `51081606`, retouche `ad6484ea` ; relu par Cowork, accepté (`VERDICT-RELECTURE-2026-10-27-aide-lot-2a.md`, puis `-retouche.md`) ; pas encore en ligne. **Consigne du lot 2b écrite** (27 oct., 16 h 32) : `CONSIGNE-LOT-2026-10-27-aide-lot-2b-conception.md`. Elle attend que Grégoire la lance.

## État au 28 octobre 2026, 3 h 20 : lots 2a et 2b en ligne, le 2c coupé en deux

- **Lots 2a et 2b en ligne en 1.222.0** (27 oct., 20 h 44 ; `6cc9ed30`), avec le niveau « PS – Préstructurel » de l'Échelle de départ (seconde retouche `9b55e8ec`, `VERDICT-RELECTURE-2026-10-27-aide-lot-2b-retouche-2.md`).
- **Découpage (décision de Cowork)** : l'ancien 2c pèse 6 611 mots en 19 entrées. **2c, l'Évaluation** (6 entrées, 1 956 mots) : `CONSIGNE-LOT-2026-10-28-aide-lot-2c-evaluation.md`, qui attend que Grégoire la lance. **2c bis, le Suivi** (13 entrées, 4 655 mots) : consigne à écrire, avec la question « Incomplet » (le niveau I et le statut d'une copie) à soumettre à Grégoire. Le lot 2d garde son nom.
- **2c : codé, en relecture** (28 oct., Claude Code) : `DEMANDE-RELECTURE-2026-10-28-aide-lot-2c.md`. Non poussé, pas de release.
- **2c : verdict « accepté avec une retouche »** (Cowork, 5 h 49). Retouches 1, 3 à 6 faites (`2692fd48`) ; **la 2 arrêtée** : une copie non recevable garde sa note calculée dans la sommative, question à Grégoire. `DEMANDE-RELECTURE-2026-10-28-aide-lot-2c-retouche.md`.

## État au 28 octobre 2026, 11 h 10 : 2c fait, 2c bis lancé

- **2c, l'Évaluation** : fait, retouché, relu et accepté (`ec61e6b5`, `2692fd48` ; `VERDICT-RELECTURE-2026-10-28-aide-lot-2c.md`) ; les mots de Grégoire rendus à 5 h 49 ; la ligne de la procédure des copies non recevables posée par le lot #1175 (mots de Grégoire, 6 h 49). Pas encore en ligne.
- **Interruption** : la relecture du 2c a trouvé qu'une copie non recevable ne valait pas ce que la règle dit ; corrigé par #1175 (`c177cc36` et quatre retouches, jusqu'à `fd66e8ee`), relu et accepté.
- **2c bis, le Suivi** : consigne `CONSIGNE-LOT-2026-10-28-aide-lot-2c-bis-suivi.md`, qui attend que Grégoire la lance.
- **2c bis : codé, en relecture** (28 oct., Claude Code) : `DEMANDE-RELECTURE-2026-10-28-aide-lot-2c-bis.md`. Non poussé, pas de release.
- **2c bis : verdict « accepté avec une retouche »** (Cowork, 12 h 05 ; les mots de Grégoire rendus à 12 h 07). Retouche faite (`967a365f`) : `DEMANDE-RELECTURE-2026-10-28-aide-lot-2c-bis-retouche.md`. « Incomplet », deux sens : close par Cowork, rien ne change. Non poussé, pas de release.

## État au 28 octobre 2026, après-midi : 2c bis clos, 2d en relecture

- **2c bis, le Suivi** : retouche relue et acceptée par Cowork (12 h 44) ; lot clos. Pas encore en ligne.
- **2d : codé, en relecture** (28 oct., Claude Code) : `4c071bca` ; `DEMANDE-RELECTURE-2026-10-28-aide-lot-2d.md`. 16 entrées deviennent 14 ; 5 067 mots → 2 518 (mesure de Claude Code). Non poussé, pas de release.

## Ce que l'utilisateur verra à la fin

Une Aide rangée comme l'application : huit parties (Commencer, Cadre, Conception, Évaluation, Suivi, Labo, Codex et archives, Référence), une soixantaine d'entrées au lieu de 75, environ 8 400 mots au lieu de 20 900. Chaque entrée dit ce que fait l'application aujourd'hui ; la théorie est dans les guides intégrés ; plus rien n'y décrit un bouton disparu ; ce qui manquait le plus y est.

## Les lots, dans l'ordre

| Lot | Ce que l'utilisateur voit | Qui écrit les mots | État |
|---|---|---|---|
| 1. Couper et ranger | Les huit parties dans l'ordre des onglets ; 14 entrées en moins ; plus de titres numérotés ; quatre passages retirés (deux promesses que le code ne tient pas, deux gestes qu'un bug empêche) ; les décisions de mots D6 à D10 (« Étudiant·e 1 » en mode anonymisé, l'encadré Loi 25, le courriel retiré, des noms d'exemple fictifs). | Aucun texte neuf, sauf une ligne de renvoi vers Réglages › À propos. | **codé, en relecture** (#1152 ; `DEMANDE-RELECTURE-2026-10-24-aide-lot-1.md`) ; D6 arrêtée sur le stock des tables de pseudonymes, à soumettre à Grégoire ; non poussé |
| 2a. Dire vrai, en moins de mots : Commencer, Cadre (coupé le 27 oct. : la Conception passe en 2b) | Chaque entrée corrigée d'après le dossier d'audit (`lot-1` à `lot-3`) et resserrée à sa cible ; les fusions faites (le mode anonymisé ; le Cadre en une entrée d'ensemble ; la liste des étudiant·es ; SOLO et l'échelle de départ) ; la théorie remplacée par un renvoi au guide intégré (D1) ; la pratique de Grégoire dite comme un exemple (D2) ; une seule définition de « sous-critère » (D5). | Claude Code resserre et corrige ; **toute phrase qui dit quelque chose que l'Aide ne disait pas** va dans la demande de relecture, et Cowork la soumet à Grégoire. | **codé, en relecture** (27 oct. ; `DEMANDE-RELECTURE-2026-10-27-aide-lot-2a.md`) ; non poussé |
| 2b. Même travail : Conception (ajouté le 27 oct.) | La Conception telle qu'elle est après les bibliothèques en deux colonnes, les chaînes d'étapes et les étapes 3 et 4 du critère algorithmique ; `sous-criteres` réécrite d'après la remesure. | Idem. | **codé, en relecture** (27 oct. ; `DEMANDE-RELECTURE-2026-10-27-aide-lot-2b.md`) ; non poussé |
| 2c. Même travail : Évaluation, Suivi (l'ancien 2b) | Idem ; le profil en une seule entrée, décrit tel qu'il est après #1151 (D4 : les deux règles fixes en une phrase) ; les interventions en une entrée, « Planifier les interventions RàI » comme base ; la phrase sur le classement (D13, mots validés) ; les bornes RàI dites telles qu'elles sont (D3). | Idem. | à écrire |
| 2d. Même travail : Labo, Codex et archives, Référence (l'ancien 2c) | Idem ; le Labo en vue d'ensemble de ses outils (Exploration des pratiques avec les six paramètres de la carte PAN, Rythme de travail, Suivi longitudinal, Modélisation en une phrase) ; la FAQ et les problèmes courants ramenés à ce qui est juste ; la bibliographie gardée. | Idem. | **codé, en relecture** (28 oct. ; `DEMANDE-RELECTURE-2026-10-28-aide-lot-2d.md`) ; non poussé |
| 3. Un seul glossaire | Le glossaire statique versé dans le glossaire de l'aide contextuelle (`js/accompagnement-contenu-terme.js`) ; ses contradictions levées (la dénotation est une PRÉN : choix de Grégoire du 17 sept.) ; ses six valeurs fausses corrigées ; les mots tranchés ajoutés (codex, clos, archivé, Faire revenir, réassigner, observation). | Les définitions neuves : soumises à Grégoire. | à écrire |
| 4. Les sept trous | Les sept entrées ou phrases neuves de la décision D12 (la note expliquée pratique par pratique, nuance du 24 oct.). | **Cowork propose les textes, Grégoire les corrige, puis Claude Code les intègre.** | textes à proposer |
| 5. Les textes d'écran qui contredisent le code | Les constats « hors de l'Aide » du dossier d'audit (message « Non recevable », réinitialisation, verrouillage des grilles, « Exporter ma config », formule d'erreurs, indice E et risque, bulles d'onglet, « élève », nom du fichier .lcz, code mort). | Les mots que liront les utilisateurs : soumis à Grégoire. `js/navigation.js` : autorisation requise. | à écrire |
| Porte | Grégoire lit la nouvelle Aide dans l'application, au Mac puis à l'iPad : la recherche, les huit parties, quelques entrées. | Claude Code écrit le markdown de la porte ; Cowork publie l'artefact. | après le lot 4 |

**Pourquoi cet ordre.** Couper et ranger d'abord : on ne corrige pas une entrée qui va disparaître, et chaque lot 2 travaille une partie entière dans sa forme finale. Le glossaire après les lots 2, parce que les entrées corrigées fixent les mots. Les trous après, parce qu'ils s'insèrent dans la forme arrêtée.

**Cadence.** Les lots s'enchaînent dans la journée, chacun relu par Cowork ; une seule release et un seul verdict complet, le soir, au signal de Grégoire.

## Garde-fous pour tous les lots

- Repérer une entrée par son id (`accordeon-aide-…`), jamais par sa ligne : les lignes du dossier d'audit sont celles de `35745bd`.
- Les ids des entrées ne changent pas (des tests et des liens les lisent). Ceux des sous-sections changent au lot 1 : mesurer d'abord qui les lit.
- Toute sentinelle modifiée cite l'audit et la décision de Grégoire du 24 oct. ; une sentinelle neuve passe un break-test.
- Le tableau SOLO de Biggs et Collis : écart volontaire (#810), ne pas le « corriger ».
- Les textes validés et épinglés (`bareme`, `sous-criteres`, le paragraphe sur les pages de `preparer-importer`, les cases d'`exporter-archiver`, l'encadré Loi 25 sauf le mot de D7) changent seulement si l'audit le demande.
- Aucun nom de personne réelle ; aucune phrase prescriptive (l'application parle au conditionnel) ; « étudiant·e » dans les textes affichés.
- Les notes d'A2025 et d'H2026 ne sont pas rouvertes.
