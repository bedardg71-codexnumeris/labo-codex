# Consigne de démarrage à froid — 31 août 2026

> Réécrite le **30 août 2026 à 22 h 30** par `kuekatsheu-bc`, qui a coordonné trois
> sessions parallèles ce soir. Elle REMPLACE entièrement la version du 30 août
> 20 h 20 : celle-ci parlait de la chaîne d'importation, et la soirée a porté sur
> tout autre chose. Tous les chiffres ci-dessous ont été mesurés ; ceux qui viennent
> d'un rapport sont annoncés comme tels.

--

Ouvre le dépôt Monitorage_v6. Rituel d'abord : délègue l'audit de début de session
au subagent `audit-debut-session`, puis lis la section « POUR LA SESSION QUI PREND
LE RELAIS » en tête de RELAIS.md. On est à la **1.106.12** (build `0830-1947`).

⚠ **Piège de démarrage payé hier soir** : si ta session s'ouvre dans
`/Users/kuekatsheu` et non dans le dépôt, **les skills et les agents de `.claude/`
ne se chargent PAS, en silence**. Lis leur fichier à la main et passe-le au subagent.

## ÉTAT MESURÉ AU 30 AOÛT, 22 h 30

- **Tout est poussé.** `main` = `origin/main`. Arbre propre, hors les deux mêmes
  fichiers non suivis qu'hier : `_sauvegarde-20260830-1905/` et
  `ETAT-AVANT-REDEMARRAGE-2026-08-30.md`. Leur suppression se demande à Grégoire.
- **Vitest vert** au hook de push (suite entière, code de sortie 0).
- **Playwright WebKit relancé et vert** en début de soirée sur le dernier lot de
  CODE (`15ef1c45`) : aucune rougeur nouvelle. **Rien de code n'a bougé depuis** —
  la soirée entière est documentaire. Le verdict tient.
- **Dernier ID utilisé : #632.**
- Trois sessions ont travaillé sans une seule collision : aucune écriture dans
  `js/`, `index.html` ni `tests/` de la soirée. Lance `ListAgents` avant d'écrire
  à quiconque, et **inscris-toi dans la table de répartition** du plan avant
  d'ouvrir un `js/`.

## ⛔ CE QUI PASSE AVANT TOUT LE RESTE

**Archiver Hiver 2026 aujourd'hui détruirait ses DIX pratiques.** Mesuré sur les
données réelles de Grégoire (#630). Pas « substituerait » : le trimestre actif
`a2026` n'a qu'UNE pratique, aucun identifiant ne se recoupe, l'intersection est
vide, et l'archivage écrit un tableau vide par-dessus. Automne 2025, déjà archivé,
perdrait ses 3 au désarchivage-réarchivage.

⮕ **Et il n'existe aucun filet.** Le snapshot dit « backup complet » dans son propre
commentaire mais n'enregistre que les SURVIVANTS. Le fichier produit par
« Exporter » n'a **aucun chemin de restauration** : `type: 'archive-trimestre'`
n'apparaît qu'une fois dans tout le dépôt, à l'écriture.

⮕ **Le moratoire élargi de Grégoire est ce qui tient la porte** : ne pas archiver,
ne pas supprimer un trimestre, ne pas exporter depuis une ligne NON ACTIVE. Il est
en tête de RELAIS.md. **S4 (#622) n'est pas dû, il est urgent.**

## PRIORITÉ DATÉE — LE 1er SEPTEMBRE, DEMAIN

**#427 + #508.** Décision prise (option A, Grégoire tient la date). Deux versants :
ce qui est dû par lui dans la console Cloudflare (les trois noms, la durée de
session, la règle `Include`), et ce qui est dû côté code **le jour même** — réécrire
le paragraphe d'accueil au présent dans `js/accueil.js`. Les deux textes sont écrits
d'avance au §7 de `plans de travail/REFERMAGE-2026-09-01-cloudflare-access.md`. Le
bandeau s'éteint seul.
⮕ **C'est demain. Ne le laisse pas passer derrière le plan Conception.**

## OÙ EN EST LE PLAN CONCEPTION — LA PHASE DE MESURE EST CLOSE

Le **tableau d'état** en tête de `plans de travail/PLAN-modele-objets-conception-2026-08-30.md`
est la seule vue d'ensemble. Ne crois pas un `LIVRÉ` sur parole : vérifie dans `main`.

- **S0 LIVRÉE** — les cinq décisions D1 à D5 sont tranchées, **toutes option A**.
  Les cinq motifs sont **vides**, et consignés vides. D2, D3 et D4 ont été tranchées
  AVANT les audits dont elles dépendaient : **si un audit les contredit, elles doivent
  être REPRÉSENTÉES à Grégoire**, pas appliquées par inertie.
- **S1 / Z1 LIVRÉ** (`fc203e58`) · **S2 / Z2 LIVRÉ** (`56562f85`) · **S3 / Z3 LIVRÉ**
  (`e766339a`). Les trois rapports sont dans `Rapports/`.
- **S4 à S11 : huit sessions de code, aucune commencée.** Ordre strict **S4 → S5 → S6**,
  motivé dans le plan. S5 migre des DONNÉES RÉELLES : sauvegarde par copie obligatoire.

⚠ **Z3 renverse la prémisse de S10.** Les stubs cachés des quatre sections ne sont
pas du legacy inerte : **les 26 identifiants sont lus par du code ATTEIGNABLE**. Le
retrait en bloc est impossible tel quel — séquence D1 → D2 → D3 → D4 du §3 de Z3, où
D2 est un **refactor** (relocaliser l'état) et non une suppression. D1 est le seul cas
où supprimer EST le correctif : deux identifiants existent **en double** dans
`index.html`, le code lit le div vide et **écrit le résultat en base**.

## CE QUI A ÉTÉ TROUVÉ HORS PLAN — #631 ET #632

**408 évaluations d'Hiver 2026 pointent vers trois grilles qui n'existent nulle part.**
Trouvé sur les DONNÉES RÉELLES ; les trois audits de CODE ne pouvaient pas le voir.

⚠ **Ce n'est PAS une perte en cours.** L'hypothèse a été instruite puis **RÉFUTÉE** :
les trois chemins d'écriture refusent, aucune note n'est écrasée. **C'est un gel** —
Grégoire ne peut plus modifier ces 408 évaluations, et le message qu'il reçoit ne dit
ni laquelle, ni qu'elles sont 408, ni quoi faire. **Rien ne se dégrade en attendant.**

⮕ **NE PURGE AUCUN des 16 « magasins fantômes » de cartouches.** Onze d'entre eux
sont la seule trace restante des trois grilles disparues.

⮕ **PAR OÙ REPRENDRE, ET C'EST UNE MESURE, PAS UN DIFF** : **combien des 408 portent
un `criteres[]` non vide ?** Le code établit que la structure existe et qu'elle est
riche ; il n'établit PAS qu'elle est peuplée pour ces 408 — `_collecterCriteresSauv`
rend `[]` si la grille manquait déjà à l'enregistrement. **Aucun diff de reconstruction
ne s'écrit avant ce chiffre.** Les deux sessions ont refusé de conclure, délibérément.
⮕ Ce que la reconstruction aura : une cartouche persiste `criteres:[{id,nom}]` et
`niveaux:[{code,nom}]` — direct, pas déductif. Ce qui lui manquera : **la pondération**.

## PROPOSE-LUI UN CHOIX FERMÉ ENTRE

(a) **#427 + #508 d'abord** — c'est daté, c'est demain, et personne d'autre ne peut le
    faire. Court. **Le seul qui porte une date.**
(b) **S4 / #622 — l'archivage** — urgent au sens mesuré du terme, et c'est lui qui lève
    le moratoire à trois gestes. Le rapport Z1 porte ses diffs, plus celui
    d'`exporterTrimestreArchive` qu'il absorbe. ⚠ Son test manuel revient à Grégoire.
(c) **La mesure préalable de #632** — courte, en lecture seule, et elle débloque tout le
    reste de #631. Bon candidat si la journée est courte.
(d) **S7 / #625 ou S8 / #626** — indépendants, permutables, sans décision en attente.

## TROIS CHOSES QUI N'ATTENDENT QUE GRÉGOIRE

1. Le **JSON brut** de T1.2 et #630, à coller aux §3 et §3bis du rapport Z1. Ce qui y
   est aujourd'hui est un relevé de seconde main, et c'est écrit comme tel.
2. Une vérification à **deux minutes, sans risque** : ouvrir un fichier produit par
   « Exporter » sur une ligne NON ACTIVE et lire `donnees.presences`. Elle transforme
   le dernier INFÉRÉ de B2 en fait.
3. Le sort des deux fichiers non suivis à la racine.

## PIÈGES DÉJÀ PAYÉS — ne les réapprends pas

· **Un grep ment dans les deux sens.** Trois faux positifs mesurés hier soir :
  `analyse.donnees.etudiants` (un objet d'analyse, pas un champ de fichier) ;
  `typeEchelle`/`seuilReussite` dans `pack-demo-20.js` (des clés de DONNÉES, pas des
  identifiants DOM) ; `data-action` cherché dans `index.html` seul alors qu'il vit
  aussi dans le HTML GÉNÉRÉ par le JS.
· **`[]` est TRUTHY.** `db.getSync(k, [])` ne peut jamais rendre une valeur fausse :
  tout repli `||` derrière lui est mort. `getSync(key, defaultValue = null)`.
· **Deux identifiants en double : `getElementById` rend LE PREMIER du document.**
  C'est le stub caché qui gagne, pas le vrai champ.
· **Un 0 n'est un fait que s'il porte un témoin.** Deux fois hier soir : un
  `nbGrillesHomonymes: 0` qu'il a fallu un second diagnostic pour interpréter, et un
  `substituees: 0` qui signifiait « tout est parti dans `disparues` ».
· **Un chiffre exact peut porter un libellé faux.** Un total gonflé par un scénario
  impossible (le trimestre actif, qu'on ne peut pas archiver) — attrapé par un témoin,
  pas par une relecture.
· **Les diffs d'un rapport d'audit sont des ESQUISSES.** Ouvre le code de référence, et
  grep TOUS les `return` avant de changer une forme de retour.
· Vitest ne voit pas le rendu ; il se lance depuis `tests/` ; lis le CODE DE SORTIE.
  Node n'a pas d'IndexedDB. Ferme GitHub Desktop avant Playwright.
· `git commit -m "…"` : zsh exécute les backticks. Toujours `-F -` avec `<<'EOF'`.
· Sur les fichiers PARTAGÉS, `--stat` repère un fichier étranger, pas un bloc étranger :
  lis le diff stagé ENTIER.
· **Inscris un `#NNN` dans `BACKLOG.md` AVANT de l'employer. Dernier utilisé : #632.**
