# Consigne de démarrage à froid — les sessions qui prennent le relais

> ↻ **ÉTAT MESURÉ réécrit par Claude Code le 11 septembre 2026 à midi (Toronto), à la clôture de
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

## ÉTAT MESURÉ — 11 SEPTEMBRE 2026, 13 H 30 (TORONTO)

▣ **Remesuré par Claude Code à la clôture de `1.131.0` — chaque ligne avec la commande qui la
produit.** La version précédente de ce bloc (10 septembre, 1.128.4) est remplacée, pas corrigée.
⚠ **Un état mesuré vieillit en heures. Remesure, ne recopie pas.**

- **Version `1.131.0`, build `0911-1259`** (`cat version.json`). **Quatre releases le 11 au matin**
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
- **Vitest : 534 fichiers / 5840 essais, 0 échec** (`cd tests && npm run test:unit`, ~27 s), mesuré
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
| `#749` lot 1 du cadrage 11 (1.131.0, `1d51883e`) | liste suivie par trimestre et groupe-cours, filtrée à la lecture, semis réversible ; sixième notifié ; filtre P ; panneau mort retiré ; G-8 ; démo résolue à la lecture ; sentinelle 21 essais / 6 break-tests | G-7 **périmé** (fonctions sans appelant depuis #303) ; la préférence `grilleReferenceDepistage` est GLOBALE — « poser à l'activation de la démo » aurait écrasé le choix réel (résolution à la lecture à la place) ; relecture adverse : le semis lit aussi `<trim>_etudiantsSuivis` (migration des résidus), l'ajout ne purge plus l'abandon ; `#828`, `#829` inscrits |
| `#825` temps 1 (1.130.2) | `netlify.toml` : `/js/*` et `/css/*` immuables un an, invariant écrit ; trois trous bouchés à la source (`repertoires-bibliotheque.js`, `pack-demo-20.js`, `heic-worker.js`) ; sentinelle #825, 16 essais, 5 break-tests rouges ; skill `portes-terrain` corrigé ; porte terrain à 4 rangées | la fiche #825 et le skill disaient « le garde ne surveille que `main.js` » : **faux depuis #547** ; un commentaire contenant `/js/*` a fait avaler la ligne du Worker par le strip-commentaires des tests 597 — reformulé ; **`/styles.css` NE devient PAS immuable** (relecture adverse : `design-system.html` + 17 modules servis la chargent sans jeton) ; le garde #547 ne voit pas les deux fichiers à jeton de build → garde pre-push ajoutée ; `#826` inscrit (jetons déjà servis deux fois le 10 sept.) |

⮕ **La leçon qui se répète** : la consigne elle-même avait corrigé la prémisse de la fiche ; la
mesure a encore trouvé un piège (une séquence `/*` dans un commentaire). Une consigne est une piste,
pas un fait.

---

## LE MANDAT — écrit par Cowork le 10 septembre 2026 à 18 h 15 (Toronto), à froid, après la relève

> ⚠ **Ce qui précède ce titre (l'ÉTAT MESURÉ) date de la clôture de `1.128.4` ; `1.129.0` est sortie
> depuis** (`cat version.json` rend `1.129.0`, build `0910-1645` ; `git log --oneline -1` rend
> `c5ffc520`, poussé, `origin/main` à égalité). **Remesure, ne recopie pas.**

**Où en est le chantier du dépistage** (cadrage 10, `plans de travail/CADRAGE-2026-09-10-ecran-de-reglage-du-depistage.md`) :
l'écran `Labo › Outils d'observation` a livré ses deux premiers temps — la carte des effets (§ 4) et le
tri des réglages morts (`#823`, `1.129.0`, **porte terrain relevée par Grégoire 12/12 à 18 h**). Ordre
qu'il a arrêté : **trier le contenu, puis déplacer.** Il reste trois temps, et **aucun n'est une
consigne** : Cowork en écrit une avant qu'on y touche.

**Le prochain lot, recommandé par Cowork — les MOTS de l'écran (temps 3).** Tout ce qui reste à trier
sur cet écran est un mot que ses collègues lisent : l'IDME écrite de trois façons (« Excellent » pour
le E, qui est *Étendu* ; « Insuffisant » pour le I — cadrage § 2), les deux nomenclatures du même
encadré « Seuils d'interprétation » (§ 3), les deux textes qui promettent ce que le code ne fait pas et
le mot « cueillette » (`#823`, ce qui en reste). ⛔ **Rien ne se code avant son arbitrage** : ce sont
ses mots et son cadre (`CLAUDE.md`, ce qui remonte à lui, point 3). **La séance commence donc par ses
décisions, à froid, pas par du code** — et, une fois arrêtées, le lot est une consigne d'étiquettes :
**les clés de données ne bougent pas** (cadrage § 5, « tarir n'est pas réparer »), seuls les libellés.
Motif de l'ordre : la forme (temps 4) alignerait des mots qui se contredisent ; le déplacement (temps 5)
importerait la cacophonie dans Suivi. Les mots d'abord.

**Si Grégoire n'a pas le temps de trancher des mots** : le lot `#824` (cinq chemins morts lus par des
seuils, cadrage § 4.3) se fait **sans lui** — technique, invisible à l'écran, avec le regard de `#551`.
Cowork écrit la consigne ; Claude Code mesure chaque appelant avant de retirer (la leçon du 10 : un
« mort » sur quatre était vivant).

**Ce qui ne se rouvre pas** : les bornes (0,64 / 0,75 / 0,85 · 65 / 70 / 75 · 70 %) et le nom des zones
(`#821`, `#822`) — dossier prêt pour l'orthopédagogue au § 8 de
`Rapports/INVENTAIRE-2026-09-10-nomenclature-des-zones.md` et au § 4 du cadrage. La valeur
`fenetrePatterns` stockée chez les gens **n'est pas migrée** (décision de Cowork tenue par Grégoire).

**Si Grégoire veut autre chose** : un retour de testeur passe avant (`CLAUDE.md`, priorité absolue).
Sinon, les cadrages ouverts sont dans `plans de travail/00-CADRAGES-OUVERTS.md`.

⏸ **Deux points restent dus à l'écran avant la CoP du 14**, qu'aucune session ne peut faire : la
carte « Prendre en main l'application » (hauteur d'accordéon) et **la visite guidée de bout en bout**,
dont le lot C de l'audit de l'Aide a changé le parcours. S'y ajoute, depuis le 10 : **la légende du
tableau de bord porte maintenant des décimales** (« 47,5 % ») dans quatre colonnes serrées — c'est le
premier endroit à regarder sur iPad.

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
