# Rapport — release 1.254.0 : l'assemblage de cinq lots (22 nov. 2026)

- **Version** : 1.254.0, build `1122-0639`. **En ligne à 9 h 10 min 42 s** (Netlify, déploiement `6b02f7ce`, commit `bad001143`, `version.json` du permalien = `1.254.0` / `1122-0639` ; `version.js`, `index.html`, `js/changelog-data.js`, `js/pratiques/ensembles-cibles.js`, `js/comparateur-pratiques.js` servis identiques au commit).
- **Mandat** : Cowork, 22 nov., décision de Grégoire de 6 h 23 (« A, un seul assemblage, une seule mise en ligne ») et complément de 6 h 27. Branche `lot/assemblage-1.254`, arbre `../labo-codex-assemblage-1.254` ; verdict dans `../labo-codex-fusion`.
- **Ouverture (mesuré à 6 h 25)** : aucun verdict ni Playwright ne tournait ; trois autres sessions Claude Code étaient ouvertes dans le dépôt (depuis 9 à 11 h), sans aucune écriture dans les arbres des cinq lots, de `main`, du relevé ni de « pratique en usage » depuis trois heures ; les cinq lots étaient aux SHA du mandat, tous partis de `16360f43c`. Le Mac était sur secteur. L'app Claude et Chrome, ouverts à 6 h 25, étaient fermés au lancement du verdict (mesuré, sur le mot de Grégoire « tout est fermé »).
- **Décision portée** (Grégoire, 22 nov., 6 h 23) : le « Modèle par standards » garde « Échelle de départ – Par standards » (0 à 4, « 0 – Données insuffisantes »), pas l'IDME ; le niveau zéro doit dire l'absence de donnée, pas un niveau d'apprentissage, et c'est l'échelle que l'assistant et la vue simple proposent déjà (acceptée le 21 nov., 6 h 53). Écrite en tête de `TEXTES-2026-11-21-modele-par-standards.md` et au point 1 de `RAPPORT-2026-11-21-modele-par-standards.md`.
- **Nouvelles** : quatre lignes et un titre, acceptés par Grégoire **à 6 h 38, tels quels**, avant le verdict.

## 1. Ce qui est mesuré, lu, non vu

**Mesuré.**
- Vitest après chaque réunion et à la release : 948 fichiers, 12 304 essais, verts ; garde du lot 0, 16 sur 16 ; les sentinelles des modèles épinglés (assistant, vue simple) vertes.
- Bancs WebKit des cinq lots après les cinq réunions : 19 verts, 2 captures sautées (variable non posée). Bancs voisins (Comparateur, assistant, « Par standards » lots 1 à 4, vue simple et ses modèles épinglés, import entre trimestres, partage, bibliothèque) : 119 verts, 1 sauté.
- **Verdict WebKit complet**, sur `bad001143`, de 7 h 22 à 9 h 08, 40 demi-morceaux, sous `caffeinate -i`, gardes de charge et de mémoire non abaissées : **jeton code 0, 1 823 essais, 1 802 verts, 21 au second essai, 0 rouge, 70 sautés** ; mémoire libre 76 à 77 % tout du long ; passage le plus long 402 s (13a). Aucun des 21 essais au second essai n'appartient aux cinq lots.
- Un premier verdict, sur le commit de release `15e628f9b`, a été arrêté au morceau 6b (voir § 2) ; Grégoire a choisi de corriger.
- Break-test du voyage : une échelle différente de même identité réécrite sous son identité → la sentinelle `sentinelle-pratique-std-voyage` rougit (V9) ; restaurée, verte.
- Le fichier réel « PAN-STD H27 essai » (lu hors dépôt, banc jetable non versionné) : voir § 4.
- Complexité (par rapport à la 1.253.0) : fonctions au-dessus de 15 : 434 → 434 ; somme 10 971 → 10 950 (Δ − 21) ; au-dessus de 30 : 76 → 75 ; fichiers de plus de 1 000 lignes : 44 → 44 ; lignes de code 174 399 → 174 832.

**Lu en adversaire** : le code du lot 1 (voyage) en entier ; celui des lots 3 et 4 pour la colonne « Par standards » ; le diff d'`index.html` du lot 5 ; les TEXTES des quatre lots qui en ont.

**Non vu** : Safari à la main et l'iPad ; `app.codexnumeris.org` elle-même (Cloudflare Access) ; le verdict de GitHub sous WebKit Linux (run du push en cours à l'écriture) ; aucune capture relue par Cowork.

## 2. Conflits rencontrés, et comment

1. **Lot 4 contre lots 1, 2, 3, dans `index.html`** : seulement les numéros de cache de quatre balises (`pratiques-bibliotheque.js`, `pratiques-gestion.js`, `wizard-pratique-v2.js`, `comparateur-pratiques.js`). Gardé les deux commentaires, un numéro neuf. Le premier numéro (`20261122a`) faisait rougir `sentinelle-anticache-fichiers-modifies` (le jour du `?v=` doit être celui du build) : remplacé par `20261121zz` jusqu'à la release, qui a tout remonté. Aucun conflit de code : `js/comparateur-pratiques.js`, `js/pratiques-gestion.js` et `js/wizard-pratique-v2.js` se sont réunis seuls, et les bancs des lots déjà réunis sont restés verts. **Aucun écran où deux lots se contredisent.**
2. **Les Nouvelles contre la sentinelle du lot 2** (`sentinelle-modele-par-standards`, M2 : « aucun autre fichier de `js/` ne nomme le modèle ») : l'entrée 1.254 le nomme. Exclu `js/changelog-data.js`, seul, avec un commentaire daté.
3. **Le pied de page à 820 px** (hors des cinq lots) : au premier verdict, `pied-de-page-et-assistance` rougissait, déterministe : « Nouveautés » passait sous la version. Cause mesurée : le build lui-même (« 1122-0639 » est plus large que « 1121-1619 », le chiffre 1 étant étroit) ; 284 px demandés pour 282. Arrêté et rapporté ; **Grégoire a choisi de corriger**. Correctif (`bad001143`, styles en tête d'`index.html`) : le build en chiffres de même largeur, 6 px entre la version et le lien (10 avant), 10 px entre le texte et le logo (14 avant). Mesuré : 284,5 px demandés pour 286,2 disponibles, **quel que soit le build** (`0000-0000`, `1111-1111`, `1122-0639` : même largeur). Bancs du pied de page et de l'accueil verts ; verdict complet repris de zéro.
4. **`lot/moteur-cibles-5-releve` à la réunion de `main`** : seulement les numéros de cache. Les deux fichiers que seul `main` touchait prennent ceux de `main` ; les six que la branche touche (le relevé, `tableau-cibles`, `profil-cibles`, sa feuille de style) prennent `20261122b`, pour rester neufs par rapport à la 1.254.0. Vitest de la branche : 949 fichiers, 12 337 essais, verts.

## 3. Ce que j'ai supposé

- Les numéros de cache provisoires (`20261121zz`, puis `20261122b` sur la branche du relevé) : des valeurs techniques, que la prochaine release remonte.
- L'exclusion des Nouvelles dans la sentinelle M2 : les Nouvelles nomment le modèle, elles ne l'offrent pas.
- La couleur verte de l'entrée 1.254 (« fonctionnalités »), comme la 1.253.
- Les réglages du correctif du pied de page (chiffres de même largeur, 6 px, 10 px) : Grégoire a choisi « corriger », je les ai tranchés.

## 4. La relecture adverse du voyage (lot 1)

| Exigence du mandat | Mesuré |
|---|---|
| Rien d'existant n'est écrasé ni supprimé à l'arrivée **dans un trimestre** | Tenu. L'ensemble de cibles est recréé sous une identité neuve à chaque arrivée ; une pratique déjà en base garde l'ensemble qu'elle nomme ; le trimestre source n'est jamais écrit (banc, octet pour octet). |
| Une échelle de même identité mais différente n'est jamais réécrite | Tenu. Une copie « (importée) » arrive sous une identité neuve ; une échelle identique (mêmes niveaux) sert telle quelle. Break-test rouge. |
| Les inscriptions ne voyagent jamais | Tenu. Seules les définitions des cibles (étiquette, énoncé, critères, poids, terminale) et l'échelle partent ; le module ne nomme pas la clé des inscriptions (sentinelle) ; bancs : aucun DA dans un fichier exporté. |
| Un ancien fichier sans cibles le dit | Tenu. « « … » arrive sans ses cibles. Ce fichier ne les contient pas. Rouvre la pratique dans l'assistant pour les dire. », à l'import et de nouveau à « Utiliser dans ce trimestre » ; aucun ensemble inventé. |
| Le fichier réel « PAN-STD H27 essai » s'importe sans rien abîmer | **Tenu dans le trimestre ; une réserve dans la bibliothèque.** Dans un trimestre vide : il entre (avant le lot, « Format invalide ») et le dit deux fois. Dans un trimestre qui porte déjà la même pratique, son ensemble, son échelle et des inscriptions : **aucun octet du trimestre ne bouge**. Mais si la **bibliothèque** porte déjà une pratique de la même identité, elle est **remplacée** par celle du fichier (annoncé : « 1 pratique(s) mise(s) à jour »). |

**La réserve, nommée.** Le remplacement d'un exemplaire de bibliothèque de même identité à l'import est la règle de `confirmerImportPratiques` depuis janvier 2026 (#599) ; le lot 1 l'étend au fichier « une pratique », qui n'avait pas de lecteur. **Le piège concret** : si Grégoire « garde » d'abord « PAN-STD H27 essai » dans sa bibliothèque (l'exemplaire emporte alors ses cibles), puis importe le fichier du 21 nov. (même identité, sans cibles), l'exemplaire de bibliothèque perd ses cibles. Le trimestre, lui, ne bouge pas. **Disposition : inscrire et continuer** (rapporté ici ; pas au BACKLOG, aucun symptôme vécu, règle du 24 août). Les gestes du § 7 sont ordonnés pour l'éviter.

## 5. Le Comparateur, rangée par rangée, pour une pratique « Par standards » (lots 3 et 4 réunis)

Contre `js/pratiques/note-cibles.js` :

| Rangée | Ce qu'elle dit | Verdict |
|---|---|---|
| Cibles comptées | « N cibles, dont T terminales » | Vrai. |
| Alignement sur des cibles d'apprentissage | « Couvert (la note se rapporte aux cibles) » | Vrai (règle F8). |
| Reprises | « Le meilleur niveau démontré est retenu pour chaque cible ; une reprise ne le fait jamais baisser » | Vrai pour une reprise (règle 1). **Incomplet** : une annulation peut le faire baisser (règle 2), la rangée ne le dit pas. |
| Choix et flexibilité laissés à l'étudiant·e | « Non couvert par l'application » | **Douteux** : une « Par standards » porte un réglage des jetons, lu par l'évaluation (le fichier réel : 2 jetons, jeton ciblé allumé) ; la rangée ne le voit pas. Même rangée pour toutes les familles. |
| Ce à quoi la note se rapporte | « Cibles d'apprentissage » | Vrai (S2). |
| Échelle de performance | le nom de l'échelle | Vrai. |
| Temporalité de la note | « Réglage global (note différée), dans Réglages → Préférences » | **Faux** pour toutes les familles : la case est dans Labo › Outils d'observation (le changelog l'avait déjà corrigé ailleurs). |
| Niveaux de performance (évaluations) | « N niveaux » | Vrai. |
| Niveau « sans donnée » | le nom du niveau désigné | Vrai (règles E2, 11). |
| Niveaux de la note du cours | « Non couvert » | Vrai. |
| Pondération | égale, ou « de x à y » ; poids nul dit | Vrai (même lecture que le moteur, poids > 0). |
| Calcul de la note | « Moyenne pondérée des valeurs des niveaux retenus » | Vrai. |
| Double seuil | « Éteint », ou « Note plafonnée à P si la moyenne des terminales est sous S » | Vrai (lu par `NoteCibles.lireDoubleSeuil`). |
| Notes finalisées | « Oui : une cible sans donnée compte pour 0 % » / « Non : pas de note tant qu'une cible est sans donnée » | Vrai (règles 9, 10). |
| Productions comptées | absente : « s.o. » | Vrai : rien d'autre que les cibles n'entre dans la note. |

**Reste faux ou douteux** : « Temporalité » (faux, toutes familles), « Reprises » (incomplet), « Choix et flexibilité » (douteux). Rien de vide. **Disposition : inscrire et continuer** (rapporté ici). Les trois défauts inscrits par le lot 4 restent inscrits, hors de l'assemblage.

## 6. Où je m'écarte du mandat

- **Le pied de page** : un correctif hors des cinq lots, sur décision de Grégoire au rouge (§ 2, point 3).
- **`main` avancé localement** dans `../labo-codex-fusion` avant le verdict, pour que l'outil du verdict (chemins codés sur cet arbre) juge le commit à pousser ; rien n'a été poussé avant le vert.
- **Les PR 48, 49, 50, 51 et 52** : GitHub les a marquées « fusionnées » d'office au push (leurs commits sont dans `main`) ; il n'y avait rien à fermer.
- **Le lot 5 n'a pas de fichier TEXTES** (il retire, il n'écrit pas) : la mention « partis sans relecture » est en tête des quatre autres. La coupe de l'aide, acceptée par Grégoire le 22 nov. à 6 h 27, est écrite dans le commentaire daté d'`index.html` (là où le retrait est daté) et dans le rapport du lot 5.
- **Aucun texte corrigé** : aucun n'affirme que « Par sélection de productions » est ou n'est pas une PAN ; « STD » n'apparaît dans les écrans neufs qu'à son sens nouveau (« Par standards »).
- **Rien d'inscrit au BACKLOG** : les trouvailles (§ 4, § 5) n'ont pas de symptôme vécu (règle du 24 août).

## 7. Ce que Grégoire fera dans la version en ligne

Recharger l'application : le pied de page dit « Bêta publique 1.254.0 · build 1122-0639 ».

1. **Les Nouvelles.** Ouvre « Nouveautés » en bas de l'accueil : l'entrée « « Par standards » voyage, et l'Exploration la décrit », quatre lignes. Sur l'iPad en portrait, « Nouveautés » est à côté de la version, pas dessous.
2. **Le voyage — d'abord ton ancien fichier.** Dans un AUTRE trimestre que celui de « PAN-STD H27 essai » : Conception › Pratiques, la fenêtre des pratiques, « Importer des pratiques », ton fichier du 21 nov. (19 h 49). Tu dois voir « Import réussi » et « « PAN-STD H27 essai » arrive sans ses cibles. » ; puis « Utiliser dans ce trimestre » le redit. Rien d'autre ne change. ⚠ Fais ce geste AVANT le suivant (voir § 4).
3. **Le voyage — avec ses cibles.** Reviens au trimestre de la pratique. Dans la fenêtre des pratiques, sur sa rangée de « Dans ce trimestre » : « Garder dans ma bibliothèque ». La rangée dit « Aussi dans ta bibliothèque » ; l'aperçu de l'exemplaire de bibliothèque montre une ligne « Cibles » et l'échelle. Passe dans l'autre trimestre, « Utiliser dans ce trimestre » sur cet exemplaire : la pratique arrive, et le tableau des cibles montre ses cibles. Aucun niveau d'étudiant·e n'a suivi. (Même résultat par « Exporter (JSON) » puis « Importer des pratiques », ou par un partage .lcz « Dupliquer ».)
4. **Le modèle.** Conception › Pratiques, « + Nouvelle pratique », « Partir d'un modèle » : une carte « Modèle par standards » (STD · Général, « À l'essai »). Choisis-la : l'assistant ouvre tout droit « Les cibles du cours », avec « Échelle de départ – Par standards » et « 0 – Données insuffisantes ». Les autres modèles sont ceux d'avant.
5. **Le Comparateur.** Labo › Exploration des pratiques, une colonne sur une pratique « Par standards » : les rangées « Cibles comptées », « Niveau « sans donnée » », « Double seuil », « Notes finalisées » ; « Productions comptées » montre « s.o. ». Aucun « CIB » nulle part.
6. **La synthèse.** Sous chaque colonne du Comparateur, « Ce que règle cette pratique », replié : déplié, il montre les réglages de la pratique, ceux du récapitulatif de l'assistant.
7. **Les guides.** Conception › Pratiques : plus de boutons « Comprendre sa sommative » ni « Modalités ». Dans l'aide du Labo, la carte des pratiques alternatives de notation se termine après « Choisir ta pratique de notation ».

## 8. Pour la suite

- **Numéro libre au BACKLOG : #1303** (mesuré sur toutes les branches d'origin à 9 h 15 : #1302 est sur `main` et sur les deux branches du Comparateur ; #1303 à #1306 libres).
- **« Pratique en usage » et « grille de cible » partiront de `main` à `bad001143`** (1.254.0 ; les commits de documentation qui suivent ne touchent aucun code).
- `main` réuni dans `lot/moteur-cibles-5-releve` (`1062e3ecd`) et dans `lot/pratique-en-usage` (`ad9917f7c`), poussées ; rien n'est allé dans l'autre sens.
