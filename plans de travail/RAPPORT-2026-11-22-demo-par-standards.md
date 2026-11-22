# Rapport – Le matériel de la démo « Par standards » (22 nov. 2026)

> **Relais (22 nov. 2026).** Branche `lot/demo-par-standards`, partie de `main` (1.254.1, `d0dd74205`), poussée ;
> ni fusion, ni version, ni Nouvelles. Session : Claude Code dans un conteneur cloud Linux. `RELAIS.md` (sur `main`)
> n'est pas touché : ce rapport tient lieu de relais de la branche.
>
> **ARRÊT au point « Mesure d'abord, et tranche », comme la consigne le prescrit.** Aucune voie ne garde Enjouée Loutre
> dans un groupe « Par standards » sans toucher une règle de l'application (ou le matériel validé d'un autre parcours).
> **Le matériel n'est pas codé.** La branche ne porte que la consigne (copiée mot pour mot) et ce rapport.
>
> **Ce qui remonte à Grégoire (et à Cowork)** : le choix de la voie, § 2. **Recommandation : la voie B**, un troisième
> groupe du pack, dix totems neufs, « Deux-Rives » gardé ; elle demande deux accords, dits au § 2.
>
> **Fait** : les mesures (§ 1), les voies et la recommandation (§ 2), ce que `main` sait enregistrer de l'observation
> (§ 3), la note d'Enjouée Loutre telle qu'elle se calculerait (§ 4).
> **Reste** : tout le matériel, une fois la voie choisie ; Vitest et le banc Chromium viendront avec lui (aucun code n'a
> changé ici, il n'y avait rien à éprouver).

---

## 1. Ce que le code permet (mesuré, fichier et ligne)

**La démo a un seul trimestre.** `demo_trimestres` porte une entrée, `demo` (`js/demo-namespace.js:214-222`) ; `cle()`
rend `demo_<clé>` (`js/trimestres.js:384-450`) ; « Remettre la démo à neuf » efface le seul préfixe `demo_`
(`js/demo-namespace.js:324-332`).

**Le deuxième groupe n'est pas dans le pack.** Il naît des gestes de la Modélisation de « Mettre ta classe en place »
(`js/parcours-classe.js:614-626`, la liste ; `:957-962`, `deuxiemeGroupe`). Enjouée Loutre y est le DA `9900002`
(nom « Enjouée », prénom « Loutre »). Le pack ne connaît qu'un groupe, `GC_DEMO`, dont les DA commencent par `DEMO`.

**Un DA, une fiche par trimestre.** L'ajout refuse un DA déjà porté (`js/trimestre-v2-etudiants.js:779-787`) ; l'import
l'ignore et le compte « déjà présent·e » (`:1437-1449`). L'appartenance à un groupe-cours se conclut par le cours et le
numéro de groupe de la fiche (`js/modes.js:1820-1850`) : une même personne ne peut pas être dans deux groupes.

**« Un groupe qui a des résultats ne change plus de modèle » : vrai dans la vue simple, pas dans la vue étendue.**
- Vue simple : « Changer de modèle » n'est offert que tant que le cours n'a aucune production (`js/vue-simple.js:1106-1111`).
  Sur `lot/observation-par-standards`, le refus est dit en clair : « Ce groupe a déjà des productions ou des résultats :
  son modèle ne change plus. Pour essayer un autre modèle, crée un groupe d'essai. » (texte accepté par Grégoire le
  22 nov., 9 h 39, selon le commentaire du code). C'est une règle voulue, renforcée aujourd'hui.
- Vue étendue : aucune garde. « Appliquer au cours actif » (`js/pratiques-gestion.js:2552`) appelle
  `changerPratiqueActive` (`js/pratiques/pratique-manager.js:64`), qui écrit sans condition.

**« Évaluer » fige le deuxième groupe.** Son modèle y crée « Artefact 1 » (`js/parcours-evaluer.js:1068`), y applique
`STD-n-meilleurs` (`:1082`) et y verrouille une évaluation : le cours a une production, la vue simple ne lui offre plus
de changer de modèle.

**Tout groupe-cours ajouté au pack serait pris pour le groupe monté par la personne.** `js/parcours-classe.js` reconnaît
« le groupe créé » comme tout groupe-cours qui n'est pas `GC_DEMO` (`:742`, `:748`, `:960`), « l'horaire créé » comme
tout horaire qui n'est pas `HOR_DEMO` (`:738`), « les étudiant·es ajouté·es » comme tout DA sans le préfixe `DEMO`
(`:734`). Inféré de la lecture (non joué) : avec un troisième groupe dans le pack, la Modélisation de « Mettre ta classe
en place » tiendrait ses étapes 5 à 7 pour faites dès l'ouverture, et « Évaluer » jouerait sur ce groupe-là plutôt que
sur celui que la personne vient de monter.

**Écart avec la prémisse (inférence, non vu à l'écran).** Le modèle d'« Évaluer » ne nomme pas la personne évaluée : il
désigne la première ligne de la Liste (`ligneDeLaListe` sans DA, `js/parcours-evaluer.js:441-452`, `:828-837`), triée
par nom d'office (`js/liste-evaluations.js:168`). Le nom « Amical » vient en tête : la personne évaluée serait Amical
Yack, pas Enjouée Loutre. Le lien « même personne » n'existe donc pas encore dans « Évaluer » ; seul le groupe et le texte
« Deux-Rives » sont communs.

---

## 2. Les voies, et la recommandation

| Voie | Garde Enjouée Loutre | Garde « Deux-Rives » | Ce qu'elle touche |
|---|---|---|---|
| **A.** Le deuxième groupe passe à « Par standards » après « Évaluer » (par la vue étendue) | oui | oui | La règle « son modèle ne change plus » (vue simple, renforcée ce matin). Le groupe naît de gestes : le matériel ne peut pas être dans l'état de départ du pack, il faudrait que le futur parcours l'écrive. La démo enseignerait le geste que la vue simple refuse. |
| **B.** Un troisième groupe du pack, dix totems neufs | non | oui | Aucune règle. Mais `js/parcours-classe.js` (trois détecteurs, § 1) doit apprendre à reconnaître les groupes du pack autrement que par l'identifiant `GC_DEMO`. |
| **C.** Un troisième groupe avec une homonyme d'Enjouée Loutre (autre DA) | le nom seul | oui | Aucune règle, mais deux « Enjouée Loutre » dans le trimestre de la démo dès que le deuxième groupe est monté. Mêmes détecteurs que B. |
| **D.** Enjouée Loutre, avec son DA, dans le groupe du pack ; retirée des dix de « Mettre ta classe en place » | oui | oui | Le matériel validé d'un autre parcours (les dix noms du 13 nov.) et sa sentinelle. L'histoire se coupe quand même en deux groupes. Mêmes détecteurs que B. |
| **E.** Un second trimestre dans la démo, où le même DA serait dans un groupe « Par standards » | oui | oui | L'architecture de la démo (un seul préfixe `demo_`, la remise à neuf, l'activation). Hors de proportion. |

**Recommandation : B.** C'est la réponse que l'application donne elle-même (« Pour essayer un autre modèle, crée un groupe
d'essai »), elle ne touche aucune règle, et « Deux-Rives » garde le fil de l'histoire. Le prix est la personne : le récit
d'Enjouée Loutre serait porté par une autre personne. A est la seule voie qui garde tout, au prix de la règle de ce matin :
je ne la recommande pas, et c'est à Grégoire d'en juger (ce que la démo enseigne).

**B demande deux accords avant de coder :**
1. **Cowork** : toucher `js/parcours-classe.js` (les trois détecteurs, sans aucune bulle ni texte). La consigne exclut
   d'écrire un parcours ; ce n'en est pas un, mais c'est le fichier d'un parcours. Mesuré : le pack pose `isDemo: true`
   sur son groupe-cours (`js/demo-namespace.js:252-266`), et `js/trimestre-v2-groupes-cours.js` n'écrit `isDemo` nulle
   part. La marque « vient du pack » existe donc déjà (inféré : non éprouvé par un banc).
2. **Grégoire** : le nom de la personne qui porte le récit, et les neuf autres (règle des totems du 29 oct. : prénom
   animal, nom une qualité bienveillante, parité, cinq continents, aucun nom déjà dans le pack).

---

## 3. L'observation du point 3 : ce que `main` sait enregistrer

**`main` l'enregistre presque entière, comme une « remarque »** (`js/pratiques/inscriptions-cibles.js:148-169` et
`:207-215`) : `niveau: null`, `echelleId: null`, `productionId: null`, la date, la note brève (« Relève bien les
procédés ; son hypothèse ne s'appuie pas encore sur le texte. »), et les quatre critères tels qu'écrits au moment du
jugement : Structure `true`, Rigueur `true`, Plausibilité `false`, Nuance `null`. Elle passe le refus (un texte est
présent). Elle n'entre ni au niveau retenu ni à la note.

**Ce qui manque sur `main` : l'origine.** Sur `lot/observation-par-standards`, `origine` vaut `production`,
`observation` ou `conversation` ; une inscription sans ce champ et sans production se LIT « observation » (`lireOrigine`),
sans rien réécrire. Une remarque écrite aujourd'hui se lira donc « observation » quand cette branche sera en ligne. À
ajouter alors au matériel : `origine: 'observation'`, explicite, pour que le pack ne dépende pas d'une lecture de repli.

**Ce qui ne s'enregistre nulle part : le contexte** (« pendant un atelier d'annotation sur « Deux-Rives » »). Ni `main`
ni la branche n'ont de champ pour l'activité. Seule la note brève pourrait le dire, et son texte est fixé par la
consigne : à trancher par Grégoire (ce sont ses mots).

---

## 4. La note d'Enjouée Loutre (calculée à la main, rien n'est affiché)

Échelle de départ « Par standards » : 2 vaut 50 %, 3 vaut 75 % (`js/pratiques/ensembles-cibles.js:169-190`). Moyenne
pondérée des niveaux retenus (`js/pratiques/note-cibles.js`, règle 7) :

(25 × 75 + 30 × 75 + 10 × 75 + 25 × 50 + 10 × 75) / 100 = 6 875 / 100 = **68,75 %, affichée 69** (`arrondirIndiceSurCent`,
`js/portfolio.js:309`).

Le double seuil est éteint d'office ; aucune cible n'est terminale : il ne joue pas.

---

## 5. Les suppositions de Cowork, à corriger par Grégoire

Rien n'est posé, puisque rien n'est codé. Elles restent ouvertes : les poids (ceux de l'hiver, le français écrit fondu
dans « La rédaction ») ; les niveaux du point 4 ; les noms des deux productions de lecture ; les niveaux des neuf autres
personnes. S'ajoute, avec la voie B : le nom de la personne qui porte le récit.

---

## 6. Ce qui n'a pas été fait, ni vérifié

- **Le matériel**, le banc Chromium, les break-tests et l'essai des clés hors démo : non faits (arrêt prescrit).
- **Vitest** : non lancé ; la branche ne change que deux fichiers markdown.
- **WebKit** n'existe pas dans ce conteneur ; rien n'a été simulé.
- **Non vu à l'écran** : la personne qu'évalue le modèle d'« Évaluer » (§ 1, inférence) ; l'effet d'un troisième groupe
  sur les deux modèles (§ 1, inférence de lecture).
- **Trouvailles, et leur issue** : l'écart sur la personne d'« Évaluer » est inscrit ici, pour Cowork (rien à corriger :
  aucun parcours ne la nomme). La fragilité des détecteurs de `js/parcours-classe.js` n'est pas un défaut aujourd'hui (le
  pack n'a qu'un groupe) : elle n'en devient un que si la voie B est retenue, et elle est alors le premier geste du lot.
