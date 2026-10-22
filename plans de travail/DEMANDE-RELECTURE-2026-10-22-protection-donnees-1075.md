# Demande de relecture – #1075, la protection et l'intégrité des données

> Claude Code, jeudi 22 octobre 2026, sur `main`. Consigne : `CONSIGNE-LOT-2026-10-22-protection-donnees-1075.md`. Quatre commits de code non poussés après `5bb7ff6d` : `883bec5e` (points 1, 2, 8, 9, 10), `43202a0d` (points 3, 4, 5), `b0cb9f30` (point 7), `ea3b1753` (point 2, l'annotation). Pas de verdict complet, pas de version, pas de push.

## Ce qui est fait

La fiche compte dix points ; Cowork en annonçait huit. **Le point 6 était déjà fait** (#683, 15 oct. : la marque d'une grille ou d'une cartouche de départ supprimée vaut pour son trimestre). Disposition au BACKLOG : *périmé*. Les neuf autres sont corrigés à la source.

| # | Défense | Où |
|---|---|---|
| 1 | En anonymisation, Propriétés du fichier, l'association de l'import et le Comparateur (libellé, CSV) affichent `obtenirDAAffichage`, jamais le vrai DA. L'import échappe aussi le DA, qu'il interpolait brut dans un `innerHTML`. | `liste-evaluations.js`, `travaux-import.js`, `comparateur-pratiques.js` |
| 2 | `sauvegarderDonneesSelonMode` et `modifierEtAnnoncer` refusent une clé du trimestre actif archivé, sauf si « Permission d'écriture » est cochée. Le témoin le dit, sauf pour une écriture discrète. L'annotation, qui écrit par `travauxStockage`, passe par le même refus à son seul point d'écriture (`sauvegarderAnnotation`). Les sélecteurs CSS `button[onclick*=…]`, qui ne visaient plus rien, sont retirés. Les trois gestes de l'audit sont couverts : « Enregistrer » et le cadenas (par `sauvegarderDonneesSelonMode`, mesuré), l'annotation. | `modes.js` (`_trimestreClosRefuse`, `refuserSiTrimestreClos`), `travaux-annotation.js`, `index.html` |
| 3 | `compterEmploisProduction` compte les évaluations et les copies du trimestre, tous groupes. Les deux suppressions de la Conception refusent une production employée avant de proposer le codex. « Remplacer l'existante » refuse un homonyme employé (`porteursHomonymes`, #967). Réglages › Données compte aussi les copies. | `productions.js`, `productions-liste.js`, `modal-doublon.js`, `echelles.js`, `donnees-v2.js` |
| 4 | « Remplacer l'existant », au doublon d'une copie importée, propose le codex (geste neuf `copieRemplacee`) ; « Annuler » vaut « Garder l'existant ». | `travaux-ui.js`, `codex.js` |
| 5 | `enregistrerProductionModifiee` refuse, dans la file, d'écrire un exemple de démonstration. La feuille de style cache les flèches, « Retirer » et « + Nouveau champ » de ses blocs ; l'aide reste visible. | `productions.js`, `styles.css` |
| 7 | Chaque page de l'éditeur garde son origine (fichier, rang). À l'enregistrement, `reporterAnnotationsPages` réindexe les annotations du fichier : celles d'une page retirée partent. Une page insérée ou fusionnée n'en reçoit aucune. | `travaux-ui.js`, `travaux-stockage.js` |
| 8 | Supprimer « mon profil » retire sa copie `profilEnseignant` quand elle est la sienne (règle `_estMonProfil`, #474) ; il ne revient plus au chargement. | `trimestre-v2-enseignants.js` |
| 9 | Le `.lcz` d'une pratique emporte l'échelle que nomme `configuration.echelleId`, avec sa référence. L'import la rebranchait déjà (`rebrancherReferences`, #627). | `partage-format.js`, `partage-section.js` |
| 10 | L'historique des clics du rapport de bogue ne garde plus le texte cliqué. Il garde l'id, la classe et le `data-action` le plus proche ; une suite de cinq chiffres ou plus y est masquée. | `rapport-bug.js` (`decrireElementClique`) |

## Mes suppositions

1. **Le trimestre clos** : le refus vaut pour les clés du trimestre ACTIF archivé. Une clé globale, ou la clé d'un autre trimestre, passe. Une écriture discrète refusée (recalcul des indices, migration) ne s'annonce pas. **Mesuré** : 48 sites écrivent encore par `db.setSync(cle(…))` sans passer par ces deux fonctions. Parmi eux, les copies et la corbeille (`travaux-stockage.js`), que l'archivage des copies (#1028) écrit légitimement dans un trimestre archivé. Je n'ai donc pas posé la garde dans `db` ni dans `travauxStockage`, seulement au geste d'Annoter. Les autres sites restent sous la règle CSS des champs.
2. **Le point 10** fait partie du lot. Le « pas de code d'ici là » de la fiche valait pour le lot de l'Aide du 15 oct.
3. **Le point 3** : une copie en corbeille ne compte pas, puisqu'elle n'est plus dans `fichiersTravaux`.
4. **Le point 7** : pivoter une page ne déplace pas ses annotations. C'est un défaut voisin, jamais signalé ; il est commenté dans le code. Une annotation ouverte dans Annoter pendant l'édition des pages n'est pas relue : l'éditeur est une vue à part.
5. **Le point 8** retire une donnée de Grégoire (`profilEnseignant`), mais au geste « Supprimer le profil » de ce profil-là : c'est l'intention écrite (audit 2.116).

## Le stock

- **Point 7** : des annotations déjà décalées par une page retirée restent décalées. Rien ne permet de savoir quelle page a été retirée.
- **Point 8** : une copie `profilEnseignant` déjà orpheline revient une dernière fois, puis part à la suppression suivante.
- **Point 9** : les paquets déjà émis restent sans leur échelle.
- **Points 2, 3, 5** : ces défenses ne réécrivent aucune donnée. Les refus valent à partir de maintenant.

## Les mots neufs (enseignant·e seulement, provisoires, à Grégoire avant la release)

- Témoin, trimestre clos : « Non enregistré – ‹geste› : ce trimestre est clos, en lecture seule. Pour une correction ponctuelle, coche « Permission d'écriture » dans son bandeau. » Geste neuf d'Annoter : « Annoter la copie ».
- Témoin, exemple : « … cet exemple fourni par Labo Codex est en lecture seule. Duplique-le pour créer ta production. »
- Refus, production employée : « Impossible de supprimer la production « X ». 3 évaluations et 1 copie l'emploient. Sans elle, elles n'auraient plus de production. » Au singulier : « 1 évaluation l'emploie. Sans elle, elle n'aurait plus de production. »
- Refus, homonyme employé : la phrase de #967 avec le sujet « Une production porte déjà ce nom… ».
- Codex, copie remplacée : « Remplacer ce fichier envoie l'ancien à la corbeille, qui l'efface pour de bon après 30 jours. Ton codex à jour pourra te le rendre… », avec les boutons « Remplacer sans codex » et « Écrire un codex, puis remplacer ».
- Réglages › Données : « N copie(s) y sont rattachées ».

## Les bancs

Un banc par défense. Chacun a rougi sur le code d'avant (break-test fait, rouge constaté, code remis) :

| Banc | Rougit quand |
|---|---|
| `sentinelle-1075-anonymisation-da-affiche` | les trois écrans relisent `e.da` (B1 à C1) |
| `sentinelle-1075-trimestre-clos-refuse` (modes.js réel) | `_trimestreClosRefuse` rend toujours `false` (A1 à A3, E1) ; l'ancien `travaux-annotation.js` (E2) |
| `sentinelle-1075-production-employee` (productions.js et productions-liste.js réels) | le compte rend zéro (A, B1, B2, C) |
| `sentinelle-1007-propose-codex`, porte « Copie remplacée » | l'appel du codex retiré de `traiterDoublonsImport` |
| `sentinelle-1075-production-demo-lecture-seule` (montage du lot E3) | la garde démo retirée du mutateur (A) |
| `sentinelle-1075-page-retiree-emporte-annotations` (éditeur réel, de bout en bout) | l'ancien `travaux-ui.js` (C), l'ancien `travaux-stockage.js` (A, B) |
| `sentinelle-1075-mon-profil-supprime` | sans le retrait de la copie (A1, A2) |
| `sentinelle-1075-paquet-pratique-emporte-echelle` (format réel) | sans la branche `pratique` (A, C). B, la validation, reste verte sur l'ancien code : un paquet sans l'échelle est valide, et c'est bien le défaut. |
| `sentinelle-1075-rapport-bug-sans-texte` (JSDOM) | le texte remis dans la description (A à D) |

Bancs existants ajustés, chacun parce que mon lot change ce qu'ils décrivaient : #932 (le harnais reçoit `obtenirDAAffichage`), l'audit de l'Aide du 15 oct. (l'historique ne garde plus le texte), #474 (le commentaire « sans la purge »), #1007 (la porte neuve ; une porte de boucle sort par `continue`).

Cliquets : la complexité de `sauvegarderDonneesSelonMode` et `modifierEtAnnoncer` repasse sous 16 (le refus est sorti dans `_refuserSiTrimestreClos`). Celle de `traiterDoublonsImport` reste à 37 : le calcul des noms en sort (`_nomsDuDoublon`). Aucune découpe neuve par `indexOf` : les bancs passent par `tranche()`.

## Preuves

- **Vitest complet**, depuis `tests/` sur `b0cb9f30` : 808 fichiers, 9 467 essais, tous verts. Les bancs du commit `ea3b1753` (9 essais) sont verts aussi.
- **WebKit ciblé**, 29 specs des écrans touchés : trimestres archivés (E1, E2, E3, #1028, #916, #911, clore), anonymisation, éditeur de pages, partage, rapport de bogue, Comparateur, duplications. Résultat : **140 verts, 1 instable, 1 rouge**.
  - L'instable est #916. Il est tombé pendant que je modifiais `modes.js` en cours de passe ; rejoué seul, il est vert trois fois sur trois.
  - Le rouge est #915 R5. **Il est préexistant** : il est rouge aussi sur `5bb7ff6d`, avant ce lot, deux fois sur deux. Sa cause : #1137 écrit « Complétion : 50 % » avec l'insécable, et la spec attend une espace ordinaire. Disposition : **inscrit, #1139**. Il bloquera le verdict complet du prochain push.
  - Les 10 specs d'archive et d'annotation, rejouées sur `ea3b1753` : 29 essais verts.

## Mac et iPad

Rien de visuel neuf, sauf les boutons cachés d'un exemple de démonstration, qui suivent la règle `display: none` déjà appliquée à `.btn-groupe` d'un exemple. Le refus d'un trimestre clos passe par le témoin, le même sur les deux appareils.

## À regarder en priorité

1. **Supposition 1** : les 48 écritures directes d'un trimestre clos. Les gestes de l'audit sont couverts ; une garde générale dans `db` casserait l'archivage des copies. Si Cowork veut aller plus loin, le geste est de lister ces sites, sans rien coder. Je les inscrirais alors comme une fiche.
2. **Le point 7** : l'éditeur ouvert en fusion marque aussi les pages de chaque fichier ; seules celles du fichier enregistré gardent leurs annotations, comme avant.
3. **Les mots neufs** : ils sont à soumettre à Grégoire.
