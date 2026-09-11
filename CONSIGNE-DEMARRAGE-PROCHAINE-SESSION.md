# Consigne de démarrage à froid — les sessions qui prennent le relais

> ↻ **ÉTAT MESURÉ remesuré par Claude Code le 11 septembre 2026 à 19 h 25 (Toronto), à la clôture de
> `1.134.0` (lot 4 du cadrage 11, les Profils individuels).** Le MANDAT de Cowork (17 h 08) est **consommé pour le lot 4** ;
> le lot 5 a sa consigne en file (`plans de travail/CONSIGNE-SUIVANTE-lot-5-interventions.md`, Cowork 17 h 45) — Cowork la promeut
> quand le lot 4 est VU (porte `plans de travail/PORTES-TERRAIN-2026-09-11-profils-individuels.md`, huit rangées).
> Version précédente : **ÉTAT MESURÉ remesuré par Claude Code le 11 septembre 2026 à 17 h 29 (Toronto), à la clôture de
> `1.133.0` (lot 3 du cadrage 11, la Saisie des présences).** Le MANDAT de Cowork (17 h 08) est **consommé pour le lot 3** ;
> le lot 4 a sa consigne en file (`plans de travail/CONSIGNE-SUIVANTE-lot-4-profils-individuels.md`, Cowork 17 h 14).
> Version précédente : **ÉTAT MESURÉ remesuré par Claude Code le 11 septembre 2026 à 16 h 30 (Toronto), à la clôture de
> `1.132.0` (lot 2 du cadrage 11, la Liste des étudiant·es).** **MANDAT réécrit par Cowork à 17 h 08, tableau des lots remis à jour à 17 h 54** pour une session
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

## ÉTAT MESURÉ — 11 SEPTEMBRE 2026, 19 H 25 (TORONTO)

▣ **Remesuré par Claude Code à la clôture de `1.134.0` — chaque ligne avec la commande qui la
produit.** La version précédente de ce bloc (11 septembre 17 h 29, 1.133.0) est remplacée, pas corrigée.
⚠ **Un état mesuré vieillit en heures. Remesure, ne recopie pas.**

- **Version `1.134.0`** (`cat version.json` ; le build y est) — lot 4 du cadrage 11, les Profils individuels
  (P-1, P-2, P-5 et le tableau 4.1 de l'audit du 6 ; `#752` et `#754` clos ; P-3, P-4, P-6 cités). Avant elle, 1.133.0
  (17 h 30, lot 3, la Saisie des présences, S-3, S-4, S-6 ; porte relevée 7/7 à 18 h 42) ; 1.132.0 (16 h, lot 2, la Liste, L-1 à L-11) ; 1.131.1 (15 h) : retour testeur #830, la
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
- **Vitest : 539 fichiers / 5890 essais, 0 échec, 0 « Errors | Unhandled »** (`cd tests && npm run test:unit`, ~27 s), mesuré
  AVANT et APRÈS le commit de release (la sentinelle anti-cache post-commit ne juge qu'un bump commité).
- **CI WebKit Linux sur `main` `c816d0cc` : ROUGE** (run 34651540999, `#833`) — deux specs, l'une verte au retry, l'autre
  tuée à 143 ; la seconde (761) attendait trois rendus du profil et est réécrite avec ce lot. Relire le run du push de 1.134.0.
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
| lot 4 du cadrage 11 (1.134.0, les Profils individuels — `#754`, `#752` clos) | un seul rendu à l'ouverture SANS toucher `navigation.js` (`_activerSousSectionProfil` lève `_profilAutoChargement` le temps de l'appel ; observateur retiré ; les appelants n'appellent plus `afficherSousSection` avant le profil) — sonde Playwright : 1 rendu par six chemins, texte du rapport conservé ; graphiques par l'échelle de chaque évaluation (`scoreCritereEvaluation` + `tableConversionPourEvaluation`, points → fraction, non convertible → absent et dit, zones majoritaires) — non-régression : 20 profils / 945 points / 105 trajectoires du pack démo identiques avant-après ; `<trim>_preferencesRapport` au geste ; trois gestes sans bouton + panneau d'indice retirés ; « Services adaptés » ← `etudiant.sa` (non modifiable, catégorie pour « Oui ») ; « Portrait de lecteur » retiré (stock : tombe au prochain Enregistrer, aucune purge) ; export anonymisé lit `sa` ; rangée HISTORIQUE `u-flex-between u-mb-10` (mesurée 1024 et 1366) ; sentinelle 11 essais / 4 break-tests ; porte 8 rangées | **B.2 : la prémisse « la même fonction que le dépistage convertit les points » est FAUSSE** — aucune fonction ne le fait (`#739`, ouvert : le dépistage lit le niveau déduit) → helper unique créé dans calculs.js, candidat pour #739, dépistage non touché ; `toggleDetailIndice` n'était pas « mort sans appelant » mais l'appelant (`portfolio.js:443`) lisait un nom privé d'une autre IIFE par `typeof` (toujours `undefined`) et aucun conteneur n'existe → retiré ; `e.servicesAdaptes` de l'export anonymisé n'existait sur aucun élève (toujours faux) → `sa` ; le pack démo référence DEUX échelles : la note « Zones : échelle « IDME et niv 0 » (4 évaluations sur 7) » s'affiche en démo, c'est voulu ; **CI rouge sur HEAD au rituel** (`#833`, inscrit et continué) ; aucun chemin n'a demandé de toucher `navigation.js` |
| `#749` lot 3 du cadrage 11 (1.133.0, la Saisie des présences) | `datesVerrouillees` par trimestre ET groupe-cours (patron `cleEtudiantsSuivis`, semis de la liste nue ENTIÈRE, lue jamais réécrite, décision de stock de Cowork nommée dans la porte § 3) ; quatre préférences d'écran sous `cle()` sans semis, champ REMIS depuis la base ; bandeau réévalué à chaque initialisation, sur horaire OU séances complètes ; date par défaut = dernière séance ≤ aujourd'hui ; « Précédent » sans date ; garde `!coursId` (deux sites) ; saisie réinitialisée à l'activation et au retrait de la démo ; `donnees-v2.js` montre la clé réelle ; sentinelle 12 essais / 10 break-tests ; essai Playwright démo → saisie (1 break-test) ; porte 5 rangées | les quatre clés d'écran DOIVENT être au registre `CLES_NAMESPACEES` (une clé absente est rendue nue par `cle()`, avec un warn) — donc l'export de trimestre les emporte si elles existent (quatre chaînes, sans effet) ; les trois signaux « groupe-cours / trimestre / démo » : l'orchestre réinitialise TOUJOURS la saisie (`#suivi-saisie` n'a jamais `u-hide`), la démo ne le faisait pas (le mapping de modes.js vise `afficherTableauPresences`, inexistant — #736, cité) → appel direct ajouté dans demo-activation.js ; le cliquet #398 monte à 2 (second appel légitime à la date locale) ; la même garde S-3 manquait dans `sauvegarderPresencesSansValidation` ; « ← Précédent » sans date : remesuré, le bouton rendait sans rien faire ; **relecture croisée (rien en A)** : le semis entrait dans la DÉMO (clés `demo_*` jamais purgées → ses dates verrouillées y seraient restées) → pas de semis sous `trimestreActif === 'demo'` ; la recherche n'était pas remise depuis la base → remise ; `obtenirSeancesCompletes` GÉNÈRE et ÉCRIT (clé nue `seancesCompletes` au boot d'un poste vide) → lecture du cache sans génération + génération seulement avec un trimestre ; la purge `diagnostic-353` détruirait la source du semis → note complétée ; boot avant `db-ready` sous localStorage saturé (classe #353, commune à tout `cle()` au boot) : nommé, pas traité ; aucun nouvel ID |
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
| 3 | Saisie des présences | **livré `1.133.0`, vu** (porte 7/7 à 18 h 42 sur ses deux groupes réels) |
| 4 | Profils individuels | **livré `1.134.0`, porte DUE** (`plans de travail/PORTES-TERRAIN-2026-09-11-profils-individuels.md`, huit rangées ; la 3 — SES courbes — est la vraie porte de `#752` ; deux mots proposés, silence = tel quel) |
| **5** | **Interventions** | **consigne en file** : `plans de travail/CONSIGNE-SUIVANTE-lot-5-interventions.md` (Cowork, 17 h 45 ; tranché à 17 h 47 : la note d'un élève parti reste visible, grisée) — Cowork la promeut quand le lot 4 est VU |
| 6 | Animation | **consigne en file** : `plans de travail/CONSIGNE-SUIVANTE-lot-6-animation.md` (17 h 48 ; tranché à 17 h 50 : rien ne change à ce qui est projeté) |
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
