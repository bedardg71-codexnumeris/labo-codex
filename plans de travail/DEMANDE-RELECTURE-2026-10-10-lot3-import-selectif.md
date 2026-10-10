# Demande de relecture – lot 3 de la file : l'import sélectif rattache juste

> Claude Code, 10 octobre 2026, 10 h 30 (mesuré par `date`). Consigne : `plans de travail/CONSIGNE-DU-JOUR.md` (Cowork, 10 h 13).
> Commits locaux, **non poussés, pas de release** : `95c98004` (listes blanches, nombre en texte), `c2be076a` (ordre, tables, identité, trimestre).

## 1 · Ce qui change pour l'usager

Quand on importe une sélection depuis un ancien fichier de sauvegarde :

- une grille ou une échelle qui entre sous un nouveau nom d'identifiant (parce que l'identifiant était déjà pris chez soi) garde ses cartouches, et les productions et pratiques reçues avec elle la désignent toujours (#952, #664) ;
- une cartouche déjà là à l'identique n'est plus ajoutée en double, ni la première fois ni au réimport (#954) ;
- les cartouches importées apparaissent dans le trimestre actif, au lieu de dormir sous une clé qu'aucun trimestre ne lit (#655) ;
- ce qui voyageait jusqu'ici en perdant des morceaux (la méthode de calcul d'une pratique, les règles d'une production, la description d'une cartouche, les codes de pratique d'une grille…) arrive entier, à l'import sélectif comme à l'ajout en Bibliothèque ; une valeur d'échelle écrite « 40 » reste 40 au lieu de tomber à 0 (trouvaille du lot 2).

## 2 · La mesure d'abord

**Champs perdus, mesurés sur le codex de banc 1.172.0** (6 grilles, 2 échelles, 2 pratiques, 12 productions, passées par `assainirObjet`) :

| Type | Perdu avant le lot |
|---|---|
| grille | `pratiques`, `pratiquesCompatibles`, `estGabarit`, `baseSur`, `criteres[].estStandard`, `metadata_cc.date_creation` |
| échelle | `niveaux[].valeurCalcul` en texte (« 40 », « 65 », « 75 », « 100 ») ramené à 0 |
| pratique | `calcul_note.methode`, `echelle` (type, niveaux : code, label, valeur_pourcentage, ordre) |
| production | `regles` (nombreARetenir, minimumCompletion, nombreTotal), `code` ; `coursId` (délibéré, #511) |

**Recensés dans le code en plus** (écrivains, pack démo ; la fixture n'a aucune cartouche) : cartouche `description`, `contexteSpecifique`, `pratiquesCompatibles` ; grille `discipline`, `paramsProjection.libelleSignalement`, `paliersProjection[].leveSignalement` (#790) ; pratique `config`, `variante`, `reglesSpeciales`, `nbEvaluationsPrevues`, `estMaquette` ; `metadata_cc` tel que l'écrit `cc-license.js` (licence_url, licence_resume, email_auteur, site_auteur, type, nom, version, attribution, niveau, institution, discipline, date_modification, contributeurs[].modifications ; et la forme pratique : auteur, courriel, siteWeb) ; `metadata` et `institution` à la racine.

**Après le lot**, même mesure : seul `coursId` des productions manque encore (délibéré), et les quatre valeurs en texte sont devenues des nombres (40, 65, 75, 100).

**#545** : les deux écrivains d'`echellesTemplates` de ce chemin (`executerImportConfigComplete`, `executerImportSelectif`) ne peuvent pas effacer une échelle en place. Ils fusionnent par `fusionnerParIdentite`, qui ne retire jamais un élément distinct, et n'écrivent que le trimestre actif, donc pas la paire h2026/a2026 créée à 4 ms d'écart. `executerImportLocalStorageBrut`, qui remplace la clé entière, n'est atteint par aucun format : les trois appels de sa modale sont dans la branche « configuration complète ». **Fiche laissée ouverte**, avec cette exclusion écrite.

## 3 · Ce qui est fait, commit par commit

**`95c98004` – les listes blanches.** Les champs du § 2 entrent dans `SCHEMAS_IMPORT`, chaque objet libre avec un sous-schéma fermé, sauf `config` et `calcul_note.conditions_speciales`, copiés bruts comme `configuration` l'était déjà. Restent dehors, délibérément (commentaire de `CHAMPS_CC_RACINE`) : `idOriginal`, `inspireDeTrimestre`, `coursId`, `etablissement` (interdit au partage), `inspireDe.idOriginal`. Le type `number` passe par `nombreImporte` : un texte qui est un nombre décimal simple, virgule acceptée, est converti ; tout le reste (« 40 points », « 0x10 », vide) retombe à 0 comme avant. `partage-schemas.js` : `metadata` et `institution` inscrits comme non partagés, ce qui laisse le `.lcz` inchangé (la sentinelle AE.a l'exigeait).

**`c2be076a` – l'ordre et les liens.** Grilles, puis échelles, puis cartouches, pratiques et productions. `remapGrilles` et `remapEchelles` sont tenues aux renommages pour conflit ; les cartouches (clé, `grilleId`, `echelleId`), les pratiques (`echelleId`) et les productions (`grilleId`, `echelleId`, `cartoucheId`) passent par `rebrancher`. `fusionnerParIdentite` prend un quatrième argument facultatif, les champs que l'import pose lui-même (`CHAMPS_POSES_PAR_L_IMPORT` : `dateImport`, `auteurOriginal`), écartés de la comparaison d'identité ; seul le bloc des cartouches le passe. Les cartouches s'écrivent sous `cle('cartouches_…')`.

## 4 · Mots d'écran — à relire

Aucun mot existant ne change. **Une ligne neuve** au bilan d'import, quand au moins une cartouche est écartée (`js/import-export.js`, bloc des cartouches) :

> « N cartouche(s) déjà présente(s) à l'identique, non ajoutée(s) »

Elle prend place entre « cartouche(s) » et « production(s) ». Le compte « N cartouche(s) » ne compte plus que celles qui sont entrées ; il comptait aussi les écartées. Si tout est écarté, le message reste « Aucune nouvelle donnée à importer… existent déjà (même nom). » – inexact sur « même nom » pour une cartouche, mais je ne l'ai pas touché.

## 5 · Ce que j'ai supposé

- Une grille ou une échelle écartée **parce qu'une de même nom est déjà là** est tenue pour la même : ce qui la désignait suit celle de même nom. Sans cela, au second passage, les cartouches d'une grille renommée tombaient sous la grille locale de même id (cas A.b du banc). Ce n'était pas nommé dans la consigne.
- Les renommages internes au lot entrant (deux grilles reçues de même id, sous `grillesTemplates` et `bibliothequeGrilles`) ne sont pas rebranchés : la référence serait ambiguë.
- `auteurOriginal` est tenu pour « posé par l'import » (l'import l'écrase par l'auteur du fichier) et sort de la comparaison, comme `dateImport`.
- Une référence d'échelle cachée dans `configuration` ou `config` d'une pratique n'est pas rebranchée ; seul `echelleId` l'est.
- L'ordre du message de fin est gardé, ce qui répond à la question ouverte de #664.

## 6 · Ce qui est vérifié, et comment

- Banc `tests/unit/import-selectif-lot3-rattache-juste.test.js`, 13 essais, par le vrai geste (`ouvrirModalImport` → `previsualiserImport` → `executerImportSelectif`), DOM et base simulés. A : renommage et liens, puis second passage sans rien ajouter ; B : identité des cartouches (identique écartée, différente gardée sous un id neuf, la ligne du bilan) ; C : aucune clé nue ; D : champs et nombres ; **E, ce qui voyage** : les grilles et productions du codex de banc 1.172.0, puis ses échelles et pratiques, ressortent identiques (moins les marques d'import et `coursId`), avec « 40 » devenu 40 ; F : l'ordre du message.
- **Break-test : 12 mutations, 12 rouges** (un rebranchement retiré à chaque bloc, table non tenue, suivi par nom retiré, marques comparées, clé nue, nombre ramené à 0, champs retirés du schéma, ordre du bilan). Le fichier est restauré par copie, empreinte vérifiée.
- Vitest complet : 705 fichiers, 8 468 essais, vert. L'état intermédiaire `95c98004` a été vérifié à part : vert, hors 4 sentinelles qui lisent git, sur une copie qui n'en est pas un.
- Trois sentinelles ajustées, chacune avec sa raison : #383 (la variable s'appelle `cleFichier`), P.b.2 (trois → cinq `pratiquesCompatibles`, conforme à « le champ voyage toujours ») et AE.a (via `partage-schemas.js`).
- **Pas de verdict Playwright** : `import-export.js` est sous les règles de sécurité, donc `cd tests && npm test` est dû avant la release, Chrome, Safari et Cowork fermés.

## 7 · Stock, et trouvailles

**Stock assumé** : les doublons de cartouches et les cartouches écrites sous une clé nue, déjà présents chez les utilisateurs, ne sont ni fusionnés ni déplacés. Écrit aux fiches #954 et #655 du BACKLOG.

**Trouvaille (issue 2 proposée, non inscrite : ni vécue, ni bloquante — règle du 24 août)** : l'import sélectif ne cherche les grilles, échelles, pratiques et cartouches que sous des clés **nues** (`grillesTemplates`, `cartouches_<id>`…), plus les productions namespacées. Dans le codex de banc 1.172.0, les ressources du trimestre sont sous `a2031_…` / `demo_…` ; seules `bibliothequeGrilles` et les productions y sont proposées. Un fichier récent n'offre donc pas les grilles de son trimestre à cocher. À toi de dire si cela entre dans la file.

**Trouvaille (issue 3)** : `executerImportLocalStorageBrut` n'est atteint par aucun format (§ 2) ; c'est du code mort.

## 8 · Proposition pour la release

Mineure. **Titre** : « Ce qu'on importe d'une ancienne sauvegarde arrive entier et bien rangé ».
**Ligne des Nouvelles** (à soumettre à Grégoire) : « Importer une sélection depuis une ancienne sauvegarde garde désormais les liens entre grilles, échelles, cartouches et productions, n'ajoute plus en double une cartouche déjà là, range les cartouches dans le trimestre ouvert, et ne perd plus en chemin la méthode de calcul d'une pratique ni les règles d'une production. »
