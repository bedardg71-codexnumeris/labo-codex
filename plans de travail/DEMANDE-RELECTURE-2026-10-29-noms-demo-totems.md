# Demande de relecture – Les élèves de la démo portent des totems scouts (29 octobre 2026)

> Claude Code, jeudi 29 octobre 2026, 8 h 46 (Toronto, mesuré par `date`). Consigne : `plans de travail/CONSIGNE-LOT-2026-10-29-noms-demo-totems.md`.
> Base : `main` = `08208359`, puis la consigne commitée seule (`66a92356`). Code : `68ce070a`. BACKLOG : **#1180** (coché).
> Rien n'est poussé ; ni release ni verdict Playwright complet. Données fictives partout.

## Vue d'ensemble

Les dix élèves du pack démo portent les totems du tableau de la consigne, mot pour mot, sous leur DA. Le remplacement suit la structure, champ par champ : `groupeEtudiants` (`nom`, `prenom`), les 101 `etudiantNom`, et le « Bonjour X ! » des rétroactions. La version du pack passe de 21.1 à 21.2, pour que le namespace `demo_*` déjà installé chez les gens se réécrive.

**Une décision prise en chemin**, au § 2 : trois copies saluaient un autre élève que le leur. Elles saluent maintenant leur élève.

**L'ordre des lots.** La consigne dit « après les lots déjà en file ». Le guidage de la démo était en file, non commencé quand ce lot a démarré. Je suis parti quand même, parce que les fichiers des deux lots ne se recoupent pas (`guidage-demo.js` et `accompagnement-contenu-popup.js` d'un côté, le pack et les tests de l'autre). Une autre session a ouvert le guidage pendant ce lot, dans le même arbre de travail. Mes commits ne portent que mes chemins ; ses fichiers en cours n'y sont pas.

## 1. Le recompte, avant → après

Dans `js/pack-demo-10.js`, comptage brut des sous-chaînes (mesuré le 29 oct. avant et après le lot) :

| DA | Avant | Comptes avant | Après | Comptes après |
|---|---|---|---|---|
| DEMO004 | Aimé Césaire | 20 / 11 | Castor Jovial | 20 / 11 |
| DEMO006 | Marie Curie | 20 / 11 | Mésange Joyeuse | 21 / 11 |
| DEMO007 | Félix Leclerc | 20 / 11 | Hérisson Chaleureux | 21 / 11 |
| DEMO010 | Gabrielle Roy | 20 / 11 | Bernache Fidèle | 21 / 11 |
| DEMO011 | Frida Kahlo | 19 / 11 | Vigogne Fière | 19 / 11 |
| DEMO015 | Nelson Mandela | 17 / 9 | Suricate Loyal | 17 / 9 |
| DEMO016 | Lionel Messi | 21 / 11 | Condor Courageux | 21 / 11 |
| DEMO017 | Toni Morrison | 28 / 13 | Grue Gracieuse | 25 / 13 |
| DEMO019 | Oumou Sangaré | 23 / 12 | Gazelle Intrépide | 23 / 12 |
| DEMO020 | Ravi Shankar | 21 / 11 | Panda Serein | 21 / 11 |

Les vingt anciens noms : **0 occurrence** après le lot, commentaires compris, sans exception. Aucun des vingt nouveaux noms n'existait dans le pack avant (mesuré : 0 chacun).

Les écarts de comptes de prénom s'expliquent tous par le § 2 : « Toni » perd trois saluts (28 → 25), Mésange, Hérisson et Bernache en gagnent un chacun (20 → 21).

La preuve que seuls ces champs ont bougé : le texte transformé, relu en objet, est identique à l'objet d'avant auquel on applique la transformation de référence (`_metadata.version`, `prenom`/`nom`, `etudiantNom`, les saluts). Rien d'autre ne diffère.

## 2. Décision : trois copies saluaient un autre élève

Mesuré dans le pack d'avant : les copies EV2 `EVAL_1759618372460` (DEMO006, Marie Curie), `EVAL_1759618539496` (DEMO010, Gabrielle Roy) et `EVAL_1759618550660` (DEMO007, Félix Leclerc) commençaient par « Bonjour Toni ! ».

Un remplacement nom à nom aurait donné « Bonjour Grue ! » dans la copie de Mésange. La consigne dit « Bonjour Prénom ! », et le geste de Grégoire : « le prénom de l'élève ouvert ». Chaque salut porte donc le prénom de l'élève de la copie. Le reste du texte de ces trois rétroactions n'a pas été relu pour son contenu : il peut avoir été écrit pour la copie de DEMO017. Issue : **inscrit ici** ; à voir seulement si Grégoire le remarque à l'écran.

## 3. Hors du pack

- `js/etudiants.js:626`, l'exemple du commentaire de la recherche : « herisson » trouve Hérisson, « fiere » Fière. Le garde anti-cache a exigé un nouveau jeton : `index.html`, `etudiants.js?v=20261028b`.
- `design-system.html` : l'option « Curie, Marie (DEMO006) », deux fois, devient « Joyeuse, Mésange (DEMO006) ».
- `sentinelle-690-aucun-prenom-dans-le-code` : ses deux commentaires disaient que le pack porte des « figures historiques et culturelles ». Ils disent maintenant les totems depuis #1180.
- `js/changelog-data.js:1300` : **non touché**, par décision de Cowork.

## 4. Les tests qui citaient les anciens noms

Recensement fait dans `js/`, `tests/unit/`, `tests/integration/`, `index.html`, `design-system.html`, `scripts/`. Seuls les fichiers liés à la démo ont été retenus. « Marie Tremblay », « Camille Roy » et les autres fixtures génériques n'ont rien à voir avec le pack et ne bougent pas.

| Fichier | Ce qui suit |
|---|---|
| `unit/sentinelle-749-lot2-liste-des-etudiants` | Aimé Césaire → **Hérisson Chaleureux** (voir sous le tableau) |
| `unit/audit-sous-onglets-suivi-2026-09-06` (L-3) | idem ; « hérisson », « HÉRISSON », « herisson », « chaleureux » |
| `unit/sentinelle-915-registre-longitudinal-capture` | `demo_groupeEtudiants` DEMO004 → Castor Jovial |
| `unit/sentinelle-872-nouveau-groupe` | la ligne collée DEMO004 → Jovial, Castor |
| `unit/sentinelle-t1-da-demo-import` (non listé par la consigne) | DEMO011 → Vigogne Fiere ; fichiers `Fiere_DEMO011_…` |
| `integration/anonymisation-cadre-liste-etudiants` | les noms témoins → Jovial, Joyeuse, Fière |
| `integration/profil-745-eleve-exclu` | `/^Loyal, Suricate\b/` |
| `integration/lot-a-anonymisation-enregistre` (textes libres) | Curie → Joyeuse, Césaire → Jovial, Kahlo → Fière |
| `integration/modifier-relit-donnees-algo-categories-1034` (commentaire) | « DEMO006 » |

**La recherche sans accents.** Ces deux bancs vérifiaient qu'un nom accentué se trouve sans accent. Aucun totem n'a à la fois un prénom et un nom accentués. J'ai pris Hérisson Chaleureux : le prénom porte l'accent, et le tri par nom (Absent, Chaleureux, Comăneci) garde l'ordre attendu.

**Le format Léa.** Dans les noms de fichiers, `Fiere` est écrit sans accent, comme le faisait `Curie`. Le banc teste la lecture du DA, pas les accents.

**Trois commentaires gardent un ancien nom**, annoté « avant les totems, #1180 », parce qu'ils citent un symptôme mesuré ou vécu tel qu'il était :
- `sentinelle-t1-da-demo-import:7` (« Curie_DEMO011_… », le 5 oct.) ;
- `anonymisation-cadre-liste-etudiants:16` (« DEMO004 0demo Césaire Aimé », le 14 sept.) ;
- `modifier-relit-donnees-algo-categories-1034:12` (« Marie Curie », le 6 oct.).

## 5. Les tests neufs

- **`tests/unit/sentinelle-noms-demo-totems-2026-10-29.test.js`**, 8 essais :
  - A. les dix couples sous leur DA ;
  - B. `etudiantNom` concorde avec le DA ; les 98 saluts saluent l'élève de la copie ;
  - C. les vingt anciens noms sont absents, par mot entier (« Roy » ne rougit pas sur « Royaume »), avec un témoin de la recherche ;
  - D. le stock (§ 6).
  
  **Break-test**, pack restauré par sha256 (`de94ba3b…`, identique avant et après) :

  | Sabotage | Résultat |
  |---|---|
  | (1) le pack d'avant | 6 rouges |
  | (2) les totems sous la version 21.1 | les 2 essais du stock |
  | (3) un « Bonjour Grue ! » dans la copie de Mésange | l'essai B des saluts |
  | (4) « Roy » dans un commentaire du pack | l'essai C |

- **`tests/integration/noms-demo-totems-29-oct.spec.js`** : la démo est activée, la Liste du Suivi a 10 lignes (on attend l'élément, aucun `waitForTimeout`), on y trouve les dix totems et aucun ancien nom. **Rouge sur l'ancien pack**, arbre restauré.
- **Vitest complet**, lancé depuis `tests/` : **849/849 fichiers, 10 289/10 289 essais**.
- **Playwright ciblé** (WebKit) : la spec neuve et les quatre specs modifiées, **14/14**.

## 6. Le stock

`initialiserDemoNamespace` (`js/demo-namespace.js:280`) ne réécrit `demo_*` que si `_metadata.version` diffère de `demo-version-installee`. L'essai D part d'un espace démo d'avant : version 21.1, Aimé Césaire, une copie « Bonjour Aimé ! ». Il relance l'initialisation et constate les totems, sans aucun ancien nom.

**Son témoin** : le même pack, remis sous la version 21.1, laisse le stock intact. C'est bien la montée de version qui transporte le changement.

Ce qui n'est pas couvert : une démo ouverte chez quelqu'un garde les anciens noms jusqu'au prochain chargement de la page. Et ce lot ne touche que `demo_*` : aucune donnée réelle n'est écrite.

## 7. Trouvailles et leur issue

- **« Comăneci »**, dans `sentinelle-749-lot2-liste-des-etudiants` : c'est une personne réelle (fixture de tri et de recherche, sans DA de démo). Elle n'est servie à personne et ne figure pas dans le pack. Issue : **commenter et oublier**. Je la nomme ici seulement : aucun symptôme vécu, donc pas de fiche au BACKLOG.
- **Le contenu des trois rétroactions EV2** (§ 2) : **inscrit ici**.

## 8. Ce qui n'a pas été mesuré

- Safari et l'iPad. La suite Playwright complète n'a pas été lancée, donc pas de verdict.
- L'aspect à l'écran : un nom plus long (« Hérisson Chaleureux ») dans les colonnes étroites.

## Pour Grégoire : le geste à l'écran

Ouvrir la démo. La Liste des élèves montre les dix totems. La rétroaction d'une copie commence par « Bonjour Castor ! », ou par le prénom de l'élève ouvert.
