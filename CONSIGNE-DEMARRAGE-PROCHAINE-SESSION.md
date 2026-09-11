# Consigne de démarrage à froid — les sessions qui prennent le relais

> ↻ **ÉTAT MESURÉ remesuré par Claude Code le 11 septembre 2026 à 17 h 29 (Toronto), à la clôture de
> `1.133.0` (lot 3 du cadrage 11, la Saisie des présences).** Le MANDAT de Cowork (17 h 08) est **consommé pour le lot 3** ;
> le lot 4 a sa consigne en file (`plans de travail/CONSIGNE-SUIVANTE-lot-4-profils-individuels.md`, Cowork 17 h 14).
> Version précédente : **ÉTAT MESURÉ remesuré par Claude Code le 11 septembre 2026 à 16 h 30 (Toronto), à la clôture de
> `1.132.0` (lot 2 du cadrage 11, la Liste des étudiant·es).** **MANDAT réécrit par Cowork à 17 h 08** pour une session
> neuve : le lot 3 (la Saisie des présences) a sa consigne dans `plans de travail/CONSIGNE-DU-JOUR.md`.
> Version précédente : **ÉTAT MESURÉ réécrit par Claude Code le 11 septembre 2026 à midi (Toronto), à la clôture de
> `1.130.2` (#825 temps 1).** Le MANDAT ci-dessous reste celui de Cowork du 10 au soir : ses deux
> premiers points (écran de réglage, #824) sont **consommés** ; `#825` est livré en temps 1, jugé par sa
> porte. Cowork reprend le mandat à froid.
>
> ↻ **MANDAT réécrit par Cowork le 10 septembre 2026 à 18 h 15 (Toronto), après la relève de la porte
> terrain de `1.129.0`.** L'ÉTAT MESURÉ ci-dessous date de la clôture de `1.128.4` par Claude Code, en
> fin d'après-midi — son en-tête dit « fin de soirée », mais le commit qui le porte est de **15 h 33,
> heure de Toronto** (`git log --format=%ci -1 aeaca09a`) ; l'écart de quatre heures est celui d'une
> horloge UTC, c'est une inférence, pas une mesure. **Il est périmé d'une version** ; la note en tête
> du mandat dit ce qui a changé.
> Version précédente de cet en-tête : **ÉTAT MESURÉ et MANDAT réécrits le 10 septembre 2026, en début d'après-midi, par Claude Code**,
> à la demande explicite de Grégoire. Ils remplacent la version du 9 au soir, périmée de six versions
> mineures, **et dont les deux fichiers du mandat étaient entièrement consommés**.
>
> ⚠ **Exception nommée à `PROTOCOLE.md` § « Qui écrit quoi »**, qui réserve le MANDAT à Cowork.
> Motif de la règle : *une session qui rédige sa propre consigne se relit elle-même — elle transmet
> ce qu'elle a vu, pas ce qu'elle a manqué.* Le risque est réel ici. ⮕ **Cowork peut et devrait
> reprendre le mandat à froid** ; ce qui suit est une proposition, pas un mandat arrêté.
>
> ⚠ **Nom sans date, exprès.** La date d'écriture est en tête ; c'est elle qui fait foi.
> ⛔ **Ce fichier ne porte que ce qui PÉRIME** : l'état mesuré, le mandat, ce qui est dû.

---

## À LIRE D'ABORD, DANS CET ORDRE

1. **`PROTOCOLE.md`** — comment nous trois travaillons ensemble. Sept règles.
2. **`OU-EN-EST-ON.md`** — où on en est, en gestes d'utilisateur. Sa tête porte `1.128.3`.
3. **`Rapports/INVENTAIRE-2026-09-10-nomenclature-des-zones.md`**, puis
   **`plans de travail/CONSIGNE-DU-JOUR.md`** — le chantier de la journée (voir LE MANDAT plus bas).
   La proposition d'origine, `plans de travail/CONSIGNE-SUIVANTE-nomenclature-des-zones.md`, est
   **consommée** : ses temps 1 et 2 sont faits, son temps 4 est tranché.
4. `CLAUDE.md`, puis `OBJECTIF-COHORTE-1.md` (les huit énoncés).

Puis le rituel : skill `debut-de-session-labo-codex`, **délégué au subagent `audit-debut-session`**.

⚠ Les trois entrées périmées de la version précédente ont été retirées, pas corrigées : le ménage
documentaire est livré, la consigne du dépistage du français est archivée sans avoir été exécutée
(son cadrage vit dans `plans de travail/CADRAGE-2026-09-07-depistage-du-francais-semaine-1.md`), et
il n'y avait **aucune consigne du jour en attente** au matin du 10.

---

## ÉTAT MESURÉ — 11 SEPTEMBRE 2026, 17 H 29 (TORONTO)

▣ **Remesuré par Claude Code à la clôture de `1.133.0` — chaque ligne avec la commande qui la
produit.** La version précédente de ce bloc (10 septembre, 1.128.4) est remplacée, pas corrigée.
⚠ **Un état mesuré vieillit en heures. Remesure, ne recopie pas.**

- **Version `1.133.0`** (`cat version.json` ; le build y est) — lot 3 du cadrage 11, la Saisie des présences
  (S-3, S-4, S-6 de l'audit du 6 ; S-7 cité). Avant elle, 1.132.0 (16 h, lot 2, la Liste, L-1 à L-11) ; 1.131.1 (15 h) : retour testeur #830, la
  barre A des groupes H2026 (horaires d'avant #540 sans périodes par séance → héritage du format déclaré) ; puis
  #831 et #832 (données H2026 de l'instance en ligne, réparées par Grégoire avec des outils dry-run par preuve,
  sans release). **Quatre releases le 11 au matin**
  (1.129.1, 1.129.2, 1.130.0, 1.130.1), **1.130.2 à midi** (#825 temps 1, l'ouverture immuable ;
  hypothèse réfutée par la référence de 11 h 58) puis **1.131.0 vers 13 h 30** : #749, lot 1 du cadrage
  11 — la liste suivie du Suivi du groupe par groupe-cours, ce que Grégoire verra à sa première bascule.
- **`origin/main` = `main`** au rituel de midi (`git fetch && git rev-list --count origin/main..HEAD`
  = 0 sur `7130d0db`), puis deux commits locaux (docs de Cowork, release 1.130.2) et le commit de
  relais, poussés par `scripts/pousser.sh` à la clôture. Aucune branche ne porte de travail.
  ⚠ **Le SHA n'est pas écrit ici, exprès.** `git log --oneline -1`.
- **Arbre : quatre `Formation/*.html` non suivis** (chantier Formation, pas à commettre avec un lot de
  l'application) et la **suppression non commise** de la capture du 9 sept. (`Retours des
  testeurs/grégoire/BUG_…journal-de-bord-sans-fond.png`, à Grégoire). Rien d'autre
  (`git status --porcelain -uall`).
- **Vitest : 538 fichiers / 5875 essais, 0 échec** (`cd tests && npm run test:unit`, ~27 s), mesuré
  AVANT et APRÈS le commit de release (la sentinelle anti-cache post-commit ne juge qu'un bump commité).
  ⛔ **PAS `npm test`** : il enchaîne Playwright, plus de dix minutes.
- **Playwright : verdict local rendu par `scripts/pousser.sh` sur le SHA du commit de relais** — lire
  `scripts/.verdict-playwright.json` (`code`, `sha`). Le CI WebKit sur `main` est à relire
  (`gh run list --branch main -L 1`) : au rituel de midi, le run du commit `7130d0db` était encore
  `in_progress`.
- **#825 : l'hypothèse de la fiche est RÉFUTÉE** par la référence relevée par Grégoire à 11 h 58 sur
  1.130.1, nouvel onglet : **Load 527 ms, 302 lignes en 304**. La revalidation ne coûtait pas 30-45 s.
  Le lot 1.130.2 reste livré (sain, 300 requêtes de moins) ; temps 2 et 3 retirés ; **la cause des
  30-45 s est inconnue** et se saisit à la reproduction (porte § 3.1). Ne pas rouvrir #825 sans une
  capture de la barre longue.

**Ce que le 11 septembre à midi a livré, et ce que la mesure a corrigé de la consigne** :

| Lot | Livré | ⚠ Ce que la mesure a corrigé |
|---|---|---|
| `#749` lot 3 du cadrage 11 (1.133.0, la Saisie des présences) | `datesVerrouillees` par trimestre ET groupe-cours (patron `cleEtudiantsSuivis`, semis de la liste nue ENTIÈRE, lue jamais réécrite, décision de stock de Cowork nommée dans la porte § 3) ; quatre préférences d'écran sous `cle()` sans semis, champ REMIS depuis la base ; bandeau réévalué à chaque initialisation, sur horaire OU séances complètes ; date par défaut = dernière séance ≤ aujourd'hui ; « Précédent » sans date ; garde `!coursId` (deux sites) ; saisie réinitialisée à l'activation et au retrait de la démo ; `donnees-v2.js` montre la clé réelle ; sentinelle 12 essais / 10 break-tests ; essai Playwright démo → saisie (1 break-test) ; porte 5 rangées | les quatre clés d'écran DOIVENT être au registre `CLES_NAMESPACEES` (une clé absente est rendue nue par `cle()`, avec un warn) — donc l'export de trimestre les emporte si elles existent (quatre chaînes, sans effet) ; les trois signaux « groupe-cours / trimestre / démo » : l'orchestre réinitialise TOUJOURS la saisie (`#suivi-saisie` n'a jamais `u-hide`), la démo ne le faisait pas (le mapping de modes.js vise `afficherTableauPresences`, inexistant — #736, cité) → appel direct ajouté dans demo-activation.js ; le cliquet #398 monte à 2 (second appel légitime à la date locale) ; la même garde S-3 manquait dans `sauvegarderPresencesSansValidation` ; « ← Précédent » sans date : remesuré, le bouton rendait sans rien faire ; aucun nouvel ID |
| `#749` lot 2 du cadrage 11 (1.132.0, la Liste) | abandons visibles grisés avec statut (décision Grégoire 14 h 17), statistiques sur les actifs prouvées ; tris « # » et « DA » ; recherche NFD ; une écriture par rendu + saisie différée 200 ms ; six patterns ; « ≥ Min. » tient, 0 sous N ; DA en double refusé / ignoré et compté ; `normaliserNumeroGroupe` unique ; bouton d'aide conservé ; sentinelle 14 essais / 6 break-tests ; porte 7 rangées | `String(...).padStart(5,'0')` présent **dix** fois dans trimestre-v2-etudiants.js, pas trois ; quatre sentinelles voisines figeaient les constats d'origine (ordre, message d'import, stub du groupe, forme du `localeCompare`) ; relecture adverse : un exclu n'est jamais « insuffisant » (le badge (N) et le grisé partageaient mal leur population), le compteur « N personnes » compte des lignes (commenté), `normaliserNumeroGroupe(undefined)` rend `'00000'` (commenté) ; aucun nouvel ID |
| `#749` lot 1 du cadrage 11 (1.131.0, `1d51883e`) | liste suivie par trimestre et groupe-cours, filtrée à la lecture, semis réversible ; sixième notifié ; filtre P ; panneau mort retiré ; G-8 ; démo résolue à la lecture ; sentinelle 21 essais / 6 break-tests | G-7 **périmé** (fonctions sans appelant depuis #303) ; la préférence `grilleReferenceDepistage` est GLOBALE — « poser à l'activation de la démo » aurait écrasé le choix réel (résolution à la lecture à la place) ; relecture adverse : le semis lit aussi `<trim>_etudiantsSuivis` (migration des résidus), l'ajout ne purge plus l'abandon ; `#828`, `#829` inscrits |
| `#825` temps 1 (1.130.2) | `netlify.toml` : `/js/*` et `/css/*` immuables un an, invariant écrit ; trois trous bouchés à la source (`repertoires-bibliotheque.js`, `pack-demo-20.js`, `heic-worker.js`) ; sentinelle #825, 16 essais, 5 break-tests rouges ; skill `portes-terrain` corrigé ; porte terrain à 4 rangées | la fiche #825 et le skill disaient « le garde ne surveille que `main.js` » : **faux depuis #547** ; un commentaire contenant `/js/*` a fait avaler la ligne du Worker par le strip-commentaires des tests 597 — reformulé ; **`/styles.css` NE devient PAS immuable** (relecture adverse : `design-system.html` + 17 modules servis la chargent sans jeton) ; le garde #547 ne voit pas les deux fichiers à jeton de build → garde pre-push ajoutée ; `#826` inscrit (jetons déjà servis deux fois le 10 sept.) |

⮕ **La leçon qui se répète** : la consigne elle-même avait corrigé la prémisse de la fiche ; la
mesure a encore trouvé un piège (une séquence `/*` dans un commentaire). Une consigne est une piste,
pas un fait.

---

## LE MANDAT — réécrit par Cowork le 11 septembre 2026 à 17 h 08 (Toronto), à froid, pour une session Claude Code NEUVE

> ⚠ **La session Claude Code du 11 a été compactée : tu es une instance neuve.** L'ÉTAT MESURÉ ci-dessus date de 16 h 30
> (clôture de `1.132.0`) ; depuis, seul un commit de test (`8a6ddc92`) et des documents de Cowork. **Remesure, ne recopie pas.**
> La version précédente de ce mandat (10 sept., 18 h 15 : « les mots de l'écran de réglage ») est **entièrement consommée** :
> l'écran de réglage du dépistage est FINI (cinq temps, cinq portes relevées), `#824` et `#825` sont livrés.

**Où on en est** : le dossier « dépistage » a deux moitiés. La première, l'écran de réglage (`Labo › Outils d'observation`), est
**finie et vue** (1.129.1 → 1.130.1, cadrage 10). La seconde, **l'onglet Suivi**, est cadrée (`plans de travail/CADRAGE-2026-09-11-onglet-suivi-lecture-du-depistage.md`,
§ 7) sur la décision de Grégoire du 11 à 12 h 31, dans ses mots : *« tout l'onglet, 35 constats de l'audit »* — les 35 « inscrire »
du quatrième audit (`Rapports/AUDIT-sous-onglets-suivi-2026-09-06.md`) entrent dans le chantier, **sept lots, un par sous-onglet dans
l'ordre de l'audit puis un transversal, un lot par séance, sa porte relevée avant le suivant.**

| Lot | Sous-onglet | État |
|---|---|---|
| 1 | Suivi du groupe | **livré `1.131.0`, vu** (porte 10/10 sur ses deux groupes réels, `#749` clos) |
| 2 | Liste des étudiant·es | **livré `1.132.0`, vu** (porte 10/10, dont un vrai abandon grisé — sa décision de 14 h 17) |
| 3 | Saisie des présences | **livré `1.133.0`, porte DUE** (`plans de travail/PORTES-TERRAIN-2026-09-11-saisie-des-presences.md`, cinq rangées, la 1 écrit chez lui) |
| **4** | **Profils individuels** | **consigne en file** : `plans de travail/CONSIGNE-SUIVANTE-lot-4-profils-individuels.md` (Cowork, 17 h 14 ; `#754` et `#752` entrent, sa décision de 17 h 15) — Cowork la renomme en consigne du jour quand le lot 3 est VU |
| 5 | Interventions | à cadrer (I-1, I-5, I-6, I-7, code mort) |
| 6 | Animation | à cadrer (ce qui est projeté aux élèves : à Grégoire) |
| 7 | Transversal | 58 cibles tactiles sur maquette validée ; 12 clés nues, une par une |

**Ce que la journée du 11 a appris, à ne pas réapprendre** :
- **Le lot est fini quand Grégoire l'a VU** — six versions le 11, six portes relevées par lui avant la suivante. Il a levé lui-même
  sa règle « une livraison par séance » pour les queues de lot ; il regarde avant, c'est ça qui compte.
- **Un mot proposé sans réponse vaut « tel quel »** (sa règle du 11) : Cowork propose les textes dans la conversation, « à corriger si
  tu veux, sinon c'est ceux-là » ; s'il ne répond pas, ils partent tels quels et la porte le note.
- **Une clé nue passe par trimestre ET groupe-cours avec un SEMIS lu une fois, jamais réécrit** (patron `cleEtudiantsSuivis`, lot 1) —
  rien n'est détruit chez personne ; l'orpheline s'inscrit dans `diagnostic-353`.
- **L'audit du 6 a cinq jours et une soixantaine de commits de retard** : chaque constat se remesure avant d'être corrigé ; un constat
  périmé se dit périmé (G-7 l'était), pas corrigé.
- **La relecture adverse a fait reprendre un point par lot** (le semis à deux clés, l'abandon grisé par son statut) : elle n'est pas
  un rituel, elle trouve.

**Si Grégoire veut autre chose** : un retour de testeur passe avant (`CLAUDE.md`). Le chargement lent (`#825`) est **clos en temps 1** ;
sa cause de 30-45 s n'est pas établie et se saisit à la reproduction (barre longue du Network), pas avant.

**Ce qui ne se rouvre pas** : les bornes et les noms des zones (`#821`, `#822`, dossier prêt pour l'orthopédagogue) ; les vingt règles
de l'audit 3 (`#735`-`#754`, après le 14) ; la chaîne des indices (jugée le 5).

⏸ **Dû à l'écran par Grégoire avant le 14** (dans trois jours — il ne les a pas confirmés) : la carte « Prendre en main », la visite
guidée de bout en bout, la légende à décimales du tableau de bord sur iPad. Et **recueillir ce qui sortira du 14** : personne ne l'a
pris ; ne le code pas — un gabarit d'une demi-page, à froid, s'il le demande.

---

## ⏳ CE QUI EST DÛ PAR GRÉGOIRE — ne pas le coder à sa place, ne pas l'oublier

⚠ **Cette liste date du 5 septembre au soir et N'A PAS été remesurée depuis.** Trois jours de travail
la séparent d'aujourd'hui ; certaines lignes sont probablement réglées. **Ne l'oppose pas à Grégoire
comme un constat** — demande-lui plutôt ce qui est tombé, et retire d'ici ce qu'il te confirme.
Seule exception, mesurée le 8 : `_to_delete/` **existe toujours** (douze fichiers).

- **Deux gestes à l'écran** sur les versions en ligne : le profil d'un élève avec une copie en
  brouillon ; une pratique créée depuis « Partir d'un modèle » › « Modèle simple ».
- **L'arbitrage des dispositions** `#700`-`#705` (audit 1) et `#710`-`#721` (audit 2), **après le
  14**, plus le cadrage « non remis par famille » (règle par famille, dans ses mots).
- **Le renommage de la page « Les huit gestes »** en « Ce qu'il reste à faire » — proposé, non
  tranché.
- **Recueillir ce qui sortira du 14** : un gabarit de retour et un canal ; le canal est sa décision.
- **Le test manuel de `#612`** (bandeau AVANT / « Non associé » APRÈS ; import sans groupe-cours
  refusé) ; **effacer `_to_delete/`** ; les portes terrain jamais relevées (`#568` cibles tactiles
  iPad, `#572` hiérarchie des titres, `#660`/`#661` zoom iPad) ; `#598` volet B, la balance des
  blancs.

---

## LE TRI DU 2 SEPTEMBRE — où sont parties les leçons

*Règle 3 de `PROTOCOLE.md`. Rien n'a été jeté : tout ce qui a quitté ce fichier est
arrivé quelque part, et huit fichiers en portent la trace (`181d608a`, `a4b58eda`).*

| Ce qui a quitté ce fichier | Où c'est maintenant |
|---|---|
| Le piège du répertoire de démarrage (session hors dépôt → skills muets) | skill `debut-de-session-labo-codex` §0.5 |
| Les deux mesures d'ouverture (`rev-list`, verdict Playwright) | skill `debut-de-session-labo-codex` §2 |
| « Push réussi ≠ suite verte » | `CLAUDE.md`, §Avant chaque commit |
| L'ordre `commit → relecture → verdict → push`, et pourquoi le hook ne peut pas lancer la suite | skill `fin-de-session-labo-codex` §4.5 |
| **Le bump à quatre emplacements**, et `version.js` qui n'y était pas nommé | skill `release-et-changelog` §3 |
| Les sept règles du travail à plusieurs sessions | `PROTOCOLE.md`, règle 5 |
| La condition de la relecture croisée (cartographier AVANT) | `PROTOCOLE.md`, règle 2 |
| Un banc vert peut couvrir un écran cassé · `grep` la cible avant de planifier · l'assertion à borne · le break-test sans mutation · le JSDoc relié par la position · `ls` avant d'écrire un chemin | skill `verification-adverse` §8 |
| `head -n -1` n'existe pas sur ce Mac | skill `debug-labo-codex` |
| Le garde anti-cache ne surveille que `main.js` | skill `portes-terrain` |
| Les notes d'A2025 et H2026 ne sont pas rouvertes | `CLAUDE.md`, §Zones protégées |

⚠ **Deux destinations étaient PÉRIMÉES et ont été corrigées au passage** :
`release-et-changelog` prescrivait `npm test` (qui enchaîne Playwright, plus de dix
minutes) et n'énumérait pas `version.js` parmi les quatre points de vérité.
`debut-de-session` prescrivait `npm test` aussi. **La règle 3 ne déplace pas du
texte : elle répare les endroits qui donnaient de mauvaises instructions.**

⚠ **`CLAUDE.md` est à 250 lignes, EXACTEMENT au plafond.** La prochaine promotion
vers lui exigera un retrait délibéré, pas une compression.
