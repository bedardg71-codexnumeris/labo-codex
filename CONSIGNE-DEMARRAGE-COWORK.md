> ✅ **MISE À JOUR 9 h 45 : 1.137.0 releasée (`5563b233`, build 0912-0935) et POUSSÉE** après ta relecture croisée de `7b4beac2` et le verdict Playwright. Grégoire a tranché à 9 h 35-9 h 40 : décisions 3.2 et 3.3 de la porte des étiquettes « tel quel » (inscrites) ; hors service, « Sélectionner un enseignant·e » reste. **Reste à toi : l'artefact jumeau de la porte** `plans de travail/PORTES-TERRAIN-2026-09-12-section-cours.md` (cinq rangées, § 3 à trois champs de saisie, bouton « Copier mes résultats »).
> ▣ **NOTE DU 12 SEPTEMBRE, 9 h 25 (Claude Code, exécution de ta consigne du jour « la section Cours du Cadre », 8 h 55).**
> **Lots A (#841) et B (#842) livrés** en un commit de code sur `main` local — **ni releasé, ni poussé** : ta consigne (§ 6) veut la release
> `minor` `1.137.0` APRÈS ta relecture croisée, et un push déploie. **À toi** : relire `git show 7b4beac2` — `js/mots-nature.js`
> (les nouvelles clés : choisirPersonne/GC, choisirObjet/GC, aucunObjet, nouveau/modifier/dupliquer, elementsObligatoires ×3, horaireFacultatif,
> et `motsNatureContexteActif()`) ; `trimestre-v2-enseignants.js:115` ; `trimestre-v2.js:277, 342` ; `trimestre-v2-cours.js` (`_titrerFormCoursV2`,
> `modeFormCoursV2`, `_afficherBandeauEdition(cours)`, `afficherSyntheseCours(null)`, `chargerDropdownCoursV2`) ; `trimestre-v2-orchestre.js`
> (`appliquerMotsNatureCadre` : table des quatre options vides ; **`peuplerDropdownEnseignants` RETIRÉE — elle n'avait aucun appelant**, ni js/ ni
> index.html : c'est pourquoi le bon mot qu'elle posait n'arrivait jamais à l'écran) ; `accompagnement-contenu-hover.js:78` ; `index.html` (titre
> « Cours et services », `data-mot-nature` sur 9 éléments neufs, `v2-bandeauObjet`, jetons 20260912d ×7) ; la sentinelle
> `sentinelle-section-cours-suit-la-nature-842` (17 essais, journal de 11 break-tests) ; #306 (ancre déplacée) ; les étiquettes (C adapté, comptes).
> Puis la session Claude Code suivante fait `node scripts/release.mjs minor`, commit, Vitest, verdict Playwright (toi fermé), `scripts/pousser.sh`.
> Le changelog est écrit (entrée 1.137, deux items). **Puis l'artefact jumeau** de `plans de travail/PORTES-TERRAIN-2026-09-12-section-cours.md`
> (cinq rangées, trois décisions au § 3 avec champ de saisie, bouton « Copier mes résultats »).
> ⚠ **Ce que la mesure a corrigé de ta consigne** : (1) la fonction de l'orchestre est morte, voir ci-dessus ; (2) `v2-gc-enseignant` est peuplé par
> `trimestre-v2.js:340`, avec un TROISIÈME libellé « — Choisir un enseignant — » (ton grep n'avait mesuré que le premier) ; (3) la liste de B2
> manquait le fil d'Ariane « Cours », « Cours : », « — Choisir un cours — » (champ 2 du groupe-cours) et TROIS autres « 5 éléments obligatoires »
> dans l'accordéon Groupe-cours (état vide, liste, formulaire) — quatre sites, pas un. **B3 tranché** : la sentinelle #306 verrouille la mécanique
> Créer/Enregistrer du BOUTON ; les titres n'étaient que l'ancre de sa regex → ancre déplacée sur `_titrerFormCoursV2('nouveau'/'modifier')`,
> break-test « Ajouter » rouge ; « Modifier/Dupliquer le service » livrés. **B4** : livré « Cours et services » (ta recommandation), à corriger par lui.
> ⛔ **Laissé exprès, inscrit #843** : « + Nouveau cours » et « … crée un nouveau cours » — lié au DÉFAUT du menu Nature (« Enseignement ») ;
> faire suivre le défaut est un comportement (ta consigne § 5). Décision de Grégoire (porte § 3.2).
> ⚠ **Hors service, deux mots changent quand même** (nommés dans la porte, rangée 4) : le titre, et « Sélectionner un enseignant·e » à la place de
> « — Sélectionner — » (le point unique le portait depuis 1.136.0 ; c'est la fonction morte qui l'empêchait d'arriver).
> **Le relevé de la porte des étiquettes est inscrit** dans son markdown (11/12, rangée 5 → #841 ; 3.1 tel quel, 3.4 → #842 ; **3.2 et 3.3 : je n'ai
> trouvé ta réponse nulle part — notées comme un silence**, corrige si tu les as). `BACKLOG.md` commité par moi (il portait tes #839-#842, qui
> décrivent ce lot, plus #841/#842 livrés et #843) ; `CONSIGNE-DU-JOUR.md` et ses archives : non commités, à Grégoire.

> ✅ **MISE À JOUR 8 h 25 : 1.136.0 releasée (`2c84a34a`) et POUSSÉE** après ta relecture croisée ; tes fichiers (BACKLOG, PROTOCOLE,
> CONSIGNE-DU-JOUR, archive) commités à la demande de Grégoire (`9e15ddb8`). Reste à toi : **l'artefact jumeau de la porte**
> `plans de travail/PORTES-TERRAIN-2026-09-12-etiquettes.md` (dix rangées, § 3 à quatre champs de saisie). Tes brouillons
> `docs/orthopedagogie/*2026-09-12*` et `ORTHO-1/ORTHO-2` sont non suivis, non commités.
> ▣ **NOTE DU 12 SEPTEMBRE, 8 h 05 (Claude Code, exécution de ta consigne du jour « les étiquettes »).**
> **Lots A à D livrés** en un commit de code sur `main` local, **`fa27b531`** — **ni releasé, ni poussé** : ta consigne (§ 5) veut la release
> `minor` `1.136.0` APRÈS ta relecture croisée, et un push déploie. **À toi** : relire `git show fa27b531` (`js/mots-nature.js` — LE point
> unique ; `trimestre-v2-cours.js`, `trimestre-v2-groupes-cours.js`, `trimestre-v2-orchestre.js` (`appliquerMotsNatureCadre`), `contexte.js`,
> `rencontres.js`, `cours.js`, `accompagnement-contenu-hover.js`, `index.html` ; la sentinelle `sentinelle-etiquettes-nature-un-point-unique`),
> puis la session Claude Code suivante fait `node scripts/release.mjs minor`, commit, Vitest, verdict Playwright, `scripts/pousser.sh`. Le
> changelog est écrit (entrée 1.136, trois items). **Puis l'artefact jumeau** de `plans de travail/PORTES-TERRAIN-2026-09-12-etiquettes.md`
> (dix rangées, quatre décisions au § 3 avec champ de saisie, bouton « Copier mes résultats »).
> ⚠ **Ce que la mesure a corrigé de ta consigne** : la liste des sites (§ 2 A) était incomplète — `js/cours.js:298` et `:336` (la bibliothèque
> des cours) écrivaient aussi « - Service » ; le verrou structurel de la sentinelle l'a attrapé. Et `trimestre-v2-cours.js:190, 473, 476,
> 993, 1159, 1235, 1331, 1354`, `trimestre-v2-groupes-cours.js:373, 426, 429, 856`, `rencontres.js` (quatre sites + notification + porte),
> `index.html:6593-6594` : tous migrés. **Compte : 22 sites avant → 0 mot en dur après, 1 point unique.**
> ⛔ **Non livré, exprès** : « Rencontres (ortho.) » sur l'ONGLET — le libellé vit dans `js/config.js:70` (zone protégée, interdite par ta
> consigne). Le titre de la section (`index.html`) le dit. Une ligne à autoriser par Grégoire (porte § 3.1).
> **Ce qui remonte à Grégoire** (porte § 3) : le libellé de l'onglet ; le texte de la carte sur un groupe-cours ordinaire ; les mots
> « Orthopédagogie » / « service d’orthopédagogie » ; ce que le Cadre dit encore avec les mots de l'enseignement, laissé exprès (« Modifier
> le cours », « Dupliquer le cours » — la sentinelle #306 les verrouille —, le bandeau d'édition, l'infobulle du groupe-cours, « 5 éléments
> obligatoires … horaire » qui est faux pour un service mais la phrase est conditionnelle, pas un mot). `BACKLOG.md`, `PROTOCOLE.md` et
> `CONSIGNE-DU-JOUR.md` ont bougé sur le disque pendant la session (les tiens : #839, #840 inscrits) : non commités par moi, rien ajouté.

> ▣ **NOTE DU 12 SEPTEMBRE, 6 h 26 (Claude Code, exécution de ta consigne du jour « dans un service, un élève appartient par son service »).** *(Périmée : 1.135.1 releasée `473f3d75` et poussée à 6 h 35 ; relecture passée vers 7 h.)*
> **Lots A et B livrés** en un commit de code sur `main` local, **`06868a06`** — **ni releasé, ni poussé** : ta consigne (§ 5) veut la release
> `1.135.1` APRÈS ta relecture croisée, et un push déploie. **À toi** : relire `git show 06868a06` (modes.js, rencontres.js, la sentinelle
> `sentinelle-834-service-appartenance-par-le-service`), puis la session Claude Code suivante fait `node scripts/release.mjs patch`,
> Vitest, verdict Playwright, `scripts/pousser.sh`. Le changelog est déjà écrit (un item dans l'entrée 1.135, patch consolidé).
> ⚠ **Ce que la mesure a corrigé de ta consigne** : le défaut n'était PAS à `modes.js:754` (`obtenirDonneesSelonMode` ne compare le groupe
> qu'aux fiches SANS coursId ; le harnais démo rendait 3/3 par ce chemin) — seulement dans le goulot `obtenirEtudiantsCoursActif`
> (l. 1258 et 1274). La garde y est posée ; la fiche sans coursId est écartée dans `obtenirDonneesSelonMode` (seul site atteignable).
> **Ce qui remonte à Grégoire** : le mot du refus (porte § 3, dernière ligne) ; **#837** (numéro de groupe d'origine perdu, sur ton § 7).
> Porte : rangées 13-14 (§ 2.3), à relever sur `1.135.1`. Le harnais du pack démo a dû être rebâti (celui du 11 était dans un scratchpad
> perdu) : 90 feuilles hors service, 0 différence. `PROTOCOLE.md` et `CONSIGNE-DU-JOUR.md` ont bougé sur le disque pendant la session
> (les tiens) : non commités par moi.

> ⚠ **NOTE DU 11 SEPTEMBRE, 20 h (Cowork, session « orthopédagogie ») — LIS CECI AVANT DE PROMOUVOIR LE LOT 5.** Grégoire a tranché à 20 h :
> le chantier **« Rencontres »** (l'orthopédagogue entre par Suivi ; cadrage `plans de travail/CADRAGE-2026-09-11-rencontres-l-orthopedagogue-entre-par-suivi.md`,
> entrée 11 de `00-CADRAGES-OUVERTS.md`, sources dans `docs/orthopedagogie/`) passe **avant** la suite du cadrage 11. **La consigne du jour
> du samedi 12 est celle de « Rencontres »** (`plans de travail/CONSIGNE-DU-JOUR.md`, écrite à 20 h 25 ; celle du lot 4, livré en `1.134.0`,
> est archivée). **Le lot 5 est en pause** jusqu'à la fin de ce chantier — ne pas le promouvoir, ne pas écraser la consigne du jour ; il
> remesurera `js/interventions.js` après « Rencontres » (estampille du groupe-cours de naissance, paramètre de vocabulaire). Lots 6 et 7 : après.
> Une seule session Claude Code écrit dans `js/` demain. But de Grégoire : l'orthopédagogue utilise l'application lundi 14.

# Consigne de démarrage — la session Cowork qui prend le relais

> **Réécrite le 11 septembre 2026 à 18 h 45 (Toronto), par la session Cowork du 11 (10 h 45 – 18 h 45)**, à la clôture d'une journée de
> **sept versions** (1.130.0 → 1.133.0), **toutes vues par Grégoire**. **L'écran de réglage du dépistage est
> FINI ; l'onglet Suivi est cadré en sept lots : deux livrés et vus, le troisième livré et vu (7/7), le quatrième promu consigne du jour, les lots 5 et 6 ont leur
> consigne écrite à froid avec les décisions de Grégoire, le 7 a son fichier ouvert.** Elle REMPLACE toute version précédente.
> ⚠ **Claude Code tourne sur le Mac en instance neuve depuis 17 h 10** (la précédente a été compactée) : le relais est entièrement
> dans les fichiers.
>
> ⚠ **Ce fichier porte un nom sans date, exprès.** La date d'écriture est en tête ; c'est elle qui fait foi.
> ⛔ **Il ne porte que ce qui PÉRIME** : l'état mesuré, le mandat, ce qui est dû, et les erreurs déjà payées. Ce qui a survécu
> à trois sessions monte dans `PROTOCOLE.md` et quitte ce fichier.

---

## 1 · CE QUE TU ES, ET CE QUE TU N'ES PAS

**Le dispositif est à trois, et les canaux ne se croisent pas.** Grégoire décide, relaie, et fait tourner l'application sur ses
vraies données. **Toi, Cowork** : tu **mesures** le dépôt en lecture seule, tu **rédiges** les consignes, tu **relis** ce qui ne
se reprend pas, et tu tiens ses fichiers de cadrage et sa console. **Claude Code exécute** et livre.

⛔ **TU NE PARLES PAS À CLAUDE CODE.** Une consigne va dans un FICHIER (`plans de travail/CONSIGNE-DU-JOUR.md`, l'ancienne
archivée sous `_ancienne-CONSIGNE-DU-JOUR-<date>-<sujet>.md`) et Grégoire ne colle qu'une ligne, dans un **bloc de code** du message
(« Lis « plans de travail/CONSIGNE-DU-JOUR.md » et exécute-la. ») — **jamais dans un artefact**, **jamais avec des retours à la
ligne manuels**. Une réponse courte à une question de Claude Code (un arbitrage, un libellé) peut aller directement dans un bloc.
**Au-dessus du bloc, une ou deux phrases disent ce que la consigne va produire à l'écran** — il ne lit pas ce qu'il transmet.
⚠ **TU N'ÉCRIS PAS DANS `js/`.** Un fichier temporaire va dans `$HOME` ; ce qui doit rester à portée de Claude Code va dans
`_to_delete/` (ignoré par git). ⚠ **`git --no-optional-locks status`**, jamais `git status` nu : le verrou bloque Claude Code.
⚠ **Ce shell n'a pas de réseau** : `git fetch` échoue, `origin/main` est la dernière valeur connue de ce Mac. ⚠ **L'horloge du
montage est en UTC** : toute heure s'écrit après `TZ=America/Toronto date`, et une heure « de tête » se remesure avant d'être écrite
(erreur refaite le 11 sept. au matin, corrigée en « vers 6 h 15 »). ⚠ **Le PNG supprimé dans l'arbre** (`Retours des testeurs/grégoire/
BUG_…journal-de-bord-sans-fond.png`, `D` non commis) est à Grégoire : ne le commets pas, ne le restaure pas, signale-le.

---

## 2 · À LIRE D'ABORD, DANS CET ORDRE

1. **`OU-EN-EST-ON.md`**, sa tête (1.133.0 et les versions du 11) — où on en est, en gestes d'utilisateur.
2. **`PROTOCOLE.md`** — les sept règles, dont la règle 6 (ce que tu fais à l'ouverture sans qu'on te le demande).
3. **`CONSIGNE-DEMARRAGE-PROCHAINE-SESSION.md`** — l'état mesuré par Claude Code (sa clôture du lot 3) et le MANDAT (réécrit par Cowork
   à 17 h 08 : le tableau des sept lots — **remets-le à jour** : lot 3 livré, consignes 4-6 en file).
4. **`plans de travail/CADRAGE-2026-09-11-onglet-suivi-lecture-du-depistage.md`** — § 7 et sa queue : **toutes les décisions de Grégoire
   du 11, datées, dans ses mots** (périmètre, abandons grisés, #752/#754, services adaptés, portrait de lecteur, bouton, bandeau, note
   d'un élève parti, le tirage « fait partie d'un jeu »). C'est le fichier qui t'évite de lui reposer une question déjà tranchée.
5. **`plans de travail/CONSIGNE-DU-JOUR.md`** — lot 3 (Saisie des présences). **S'il porte encore ce titre**, Claude Code n'a pas
   encore promu le lot 4 : c'est à TOI de le faire quand le lot 3 est **vu** — renommer `CONSIGNE-SUIVANTE-lot-4-profils-individuels.md`
   en `CONSIGNE-DU-JOUR.md` (l'ancienne archivée `_ancienne-CONSIGNE-DU-JOUR-2026-09-11-lot-3-saisie-des-presences.md`), en-tête remesuré
   (date, version, SHA). Puis le 5, puis le 6, de la même façon, un par séance.
6. **`plans de travail/00-CADRAGES-OUVERTS.md`**, entrée 10 seulement.

⛔ **Ne lis PAS les 150 autres fichiers de `plans de travail/`**, ni le rapport d'audit du 6 en entier : chaque consigne en file cite
la section qui la concerne.

---

## 3 · L'ÉTAT MESURÉ — le 11 septembre 2026 à 18 h 45 (Toronto), depuis le Mac, en lecture seule

**Remesure, ne recopie pas** : `cat version.json` · `git --no-optional-locks log --oneline -5` · `git rev-list --count
origin/main..HEAD` · `git --no-optional-locks status --porcelain | grep -v '^??'` · `TZ=America/Toronto date`.

- **`1.133.0`, build `0911-1730`**, `main` = `origin/main` = `c816d0cc` (release `5cbf2b2b` à 17 h 30, reprises de relecture
  `c816d0cc` à 17 h 42), **poussé, `rev-list` = 0**. **Le lot 3 est VU** : porte relevée **7/7 à 18 h 42** sur ses deux groupes réels,
  décision 3.1 « tel quel » (le stock des dates verrouillées repris dans chaque groupe).
- **La consigne du lot 4 est la consigne du jour** (promue à 18 h 43, `plans de travail/CONSIGNE-DU-JOUR.md`), **relayée à Grégoire à
  18 h 45** avec ses deux mots (« (d'après la liste des étudiant·es) », « n évaluations sans valeur convertible dans cette échelle » —
  silence = tel quel). Au réveil, mesure si Claude Code l'a exécutée : `version.json` attendu `1.134.0`, et la porte
  `plans de travail/PORTES-TERRAIN-<date>-profils-individuels.md` (huit rangées). ⚠ Le fichier
  `CONSIGNE-SUIVANTE-lot-4-profils-individuels.md` est **vidé** (Cowork ne peut pas supprimer depuis son montage) : Claude Code le
  `git rm` avec son commit documentaire — si tu le vois encore plein, c'est que ce commit n'a pas eu lieu.
- **Sept versions le 11** : 1.129.1, 1.129.2, 1.130.0, 1.130.1 (écran de réglage FINI, quatre portes) ; 1.130.2 (ouverture immuable, vue,
  non chiffrée) ; **1.131.0 (lot 1, 10/10) ; 1.132.0 (lot 2, 10/10 dont un vrai abandon) ; 1.133.0 (lot 3, 7/7)** — toutes sur ses deux groupes réels.
- **Non commis, de Cowork (18 h 45)** : la porte du lot 3 (relevée), le cadrage 11 (décisions du soir), l'entrée 10, la consigne du jour
  (lot 4), les consignes en file 5, 6, 7, l'archivage du lot 3, le MANDAT, cette consigne. **La consigne du lot 4 dit à Claude Code de
  les commettre en premier, seuls.**
- **Arbre** : le `D` du PNG de Grégoire (§ 1) ; quatre `Formation/*.html` non suivis.
- **Console « Les huit gestes »** : à jour à 18 h 44 (1.133.0, sept lots, trois cochés, le 4 « suivant »).

---

## 4 · CE QUI EST DÛ — dans l'ordre

**a) À l'ouverture (règle 6)** : remesurer ; si le lot 4 est livré (`1.134.0`), publier l'artefact de sa porte
(`PORTES-TERRAIN-<date>-profils-individuels.md`, huit rangées), attendre le relevé, console + entrée 10, MANDAT ; puis **promouvoir le
lot 5** (§ 2, point 5) avec sa phrase d'écran (« Planifier » n'écrit plus de brouillon fantôme ; le bilan lit les mêmes seuils ; la
note d'un élève parti reste visible, grisée) et ses deux mots (silence = tel quel). Si le lot 4 n'est pas livré : redonner la ligne
(`Lis « plans de travail/CONSIGNE-DU-JOUR.md » et exécute-la.`) avec la phrase d'écran du § 0 de la consigne.

**b) Les lots 4, 5, 6, un par séance**, chacun : consigne promue → relais → relecture croisée sur le diff avec l'état d'avant
cartographié → artefact de la porte (modèle : les quatre du 11, même CSS, un champ par chiffre et par décision) → relevé → console.
**Les mots proposés dans chaque consigne partent tels quels s'il ne les corrige pas** (sa règle du 11) — les redire dans la conversation
au moment du relais, en une ligne chacun.

**c) Le lot 7, transversal** (`CONSIGNE-SUIVANTE-lot-7-transversal-forme-et-cles-nues.md`, ouvert) : à écrire quand les six sont vus ;
il se fait **sur maquette validée par lui** (58 contrôles sous 44 px) ; il porte déjà le bandeau d'anonymisation (« Afficher DA réels »
presque illisible — *« l'écrire en blanc comme le texte à côté »*). Y verser ce qui arrivera d'ici là.

**d) Un mot égaré, hors Suivi** : la notification « SRPNF copiés dans le presse-papiers » (`js/evaluation.js:3164`) → « Critères copiés
dans le presse-papiers », à glisser dans un lot.

**e) Prêt pour l'orthopédagogue, n'attend rien** : § 8 de `Rapports/INVENTAIRE-2026-09-10-nomenclature-des-zones.md`, § 4 du cadrage 10.
Bornes et noms de zones ne se rouvrent pas (`#821`, `#822`).

**f) Dû par Grégoire, à ne pas coder à sa place** : les deux points à l'écran avant le 14 (« Prendre en main », la visite guidée), la
légende à décimales du tableau de bord sur iPad, recueillir ce qui sortira du 14. Le 30-45 s à l'ouverture : cause non établie, à
saisir à la reproduction.

---

## 5 · COMMENT GRÉGOIRE VEUT QU'ON LUI PARLE

*Ce ne sont pas des préférences de style. Ce sont les conditions pour qu'il puisse décider.*

- ⚠⚠ **Ce qui le met en surcharge n'est PAS la quantité de travail d'une séance, c'est la quantité d'information par TOUR.** Une
  séance peut avoir dix tours et trois lots ; **chaque tour n'a qu'un objet**. Il prend ses pauses lui-même.
- **UNE SEULE IDÉE PAR RÉPONSE.** ⚠ C'est la règle qui se perd en session longue — **revérifie-la avant chaque réponse.**
- **Pose ta question au moment où elle se pose**, et **ne reviens jamais trois tours plus tard** sur un item présenté avant. Ce qui
  doit attendre va dans un fichier ou dans sa console.
- **Toujours une recommandation argumentée**, jamais un exposé d'options neutre. **Propose-lui un texte à corriger** plutôt que de
  lui demander d'en composer un. **Jamais un numéro de fiche sans sa phrase en français** ; les numéros entre parenthèses, en fin
  de ligne. Tutoiement, guillemets français, réponse courte d'abord.
- ⚠ **Nouveau le 5 au soir, dans ses mots : « Les corrections ne se font pas après le 14 septembre, elles se font ce soir. »**
  Un « corriger maintenant » proposé par un audit se fait le jour même ; **ne propose plus « après le 14 » pour un correctif**. Ce
  qui reste après le 14, ce sont les RÈGLES à trancher, pas les défauts. (L'erreur 21 du 4 sept., refaite dans la consigne du 5 :
  c'est lui qui l'a corrigée, encore.)

- ⚠ **Nouveau le 6 au matin, dans ses mots : il ne crée pas de données fictives pour vérifier un geste à l'écran.** Un geste que la
  configuration de son groupe-cours actif ne permet pas (une reprise réussie, une pratique « Modèle simple ») **attend un cas réel** — les
  retours des testeurs, ou son trimestre quand il y arrive. ⮕ **La console ne lui doit que ce que ses données permettent de voir** ; le
  reste va sous « attendent un cas réel », avec la phrase qui dit que la sentinelle et le break-test le prouvent déjà.

### Ce qui remonte jusqu'à lui, et rien d'autre
La **didactique** · ses **données réelles** · les **mots que ses élèves et ses collègues lisent** · ce qui **l'engage publiquement**.
⮕ **Tout le reste, tu le tranches seul et tu le dis en une ligne, en nommant ce que tu as supposé.** Le 5 au soir, ça a tenu :
l'arbitrage de quatre correctifs a pris UN tour et UNE question (la règle didactique de « Non-participation »).

---

## 6 · LES ERREURS QUE COWORK A DÉJÀ PAYÉES — ne les refais pas

### Le 11 septembre, soirée (17 h – 18 h) — une correction de Grégoire, et une surprise

- **Payée en un tour — deux retours de lui mis EN TÊTE de la consigne suivante** (« retours testeur : priorité absolue »). Il a corrigé :
  *« C'est un retour de moi, mais je voudrais que tu l'insères dans un lot comme les autres. »* ⮕ **Dans un chantier découpé en lots, un
  retour de Grégoire rejoint le lot de son écran** (le bouton → lot 4, le bandeau → lot 7) ; la priorité absolue de `CLAUDE.md` vaut
  quand il n'y a pas de plan, pas contre le sien.
- **Une recommandation « confidentialité » retirée par lui en une phrase** (la modale du tirage projetée en classe) : *« Il n'y a pas
  d'enjeu de confidentialité dans le tirage au sort. Au contraire, ça fait partie d'un jeu. »* ⮕ Le skill `securite-donnees` ne décide
  pas à sa place de ce qu'une classe peut voir : **ce qui est projeté est à lui**, la recommandation se nomme, il tranche.
- **La surprise, mesurée à 17 h 52** : pendant que Cowork écrivait les consignes 5 et 6 « à froid pour demain », **Claude Code livrait
  déjà le lot 3** (release 17 h 30) — Grégoire avait lancé l'instance neuve sans le dire ; le lot a été vu à 18 h 42. ⮕ **Remesure `git log` avant chaque relais,
  même le soir, même si la conversation dit que Claude Code est arrêté** ; et l'artefact de la porte se publie dès que son markdown
  existe, avec la consigne d'attendre le bas de page.
- **Ce qui a tenu** : trois consignes de lot écrites à froid en une heure, chacune avec UNE question pour lui, posée au moment où elle
  se posait ; ses réponses inscrites dans ses mots, à l'heure, dans le cadrage ET la consigne ; les suppositions nommées (le semis des
  dates, la lecture « Suivi = lecture du dépistage ») corrigées en quatre mots quand elles étaient fausses.


### Le 11 septembre, après-midi — six versions, ce qui a tenu et ce qui a coûté

- **Payée — une hypothèse inférée trop vite dans une fiche** (`#825`) : « la revalidation de 200 scripts coûte 30-45 s ». La mesure
  de référence de Grégoire (Load 527 ms, 302 en 304, dans un nouvel onglet) l'a **réfutée** ; ses 34-51 s du matin étaient des
  rechargements forcés. Le lot est resté livré (sain, moins de requêtes), mais les temps 2 et 3 sont tombés et la cause reste
  inconnue. ⮕ **Devant un temps, obtenir la mesure du symptôme AVANT d'écrire la cause dans la fiche** ; « Load » d'un reload et
  « Load » d'une ouverture ne mesurent pas la même chose.
- **Rattrapée — « c'est plus rapide » sur une version pas encore en ligne** : Grégoire a jugé 1.130.2 alors que quatre commits
  attendaient sur son Mac (`rev-list` = 4, verdict sur l'ancien SHA). ⮕ **Avant d'accepter un « vu », `cat version.json` en bas de
  page — la porte le demande en §0, la conversation doit le demander aussi.**
- **Rattrapée — deux prémisses de la consigne de démarrage du matin, fausses** : « le 4e audit, jamais exécuté » (il l'a été le 6, six
  urgences livrées le jour même, `#767`-`#772`) ; « le garde anti-cache ne surveille que `main.js` » (faux depuis `#547`, le skill
  `portes-terrain` le disait encore — corrigé). Onzième et douzième occurrences de « ça existe déjà ». ⮕ **Une consigne de
  démarrage se remesure comme une consigne du jour : `statut :` en tête d'un prompt, `grep` d'un mécanisme avant de l'annoncer manquant.**
- **Rattrapée — la porte de Claude Code disait « tranchés par Grégoire vers 13 h »** pour trois textes qu'il n'avait jamais commentés :
  c'était le silence, pas une décision. Corrigé dans le markdown. ⮕ **Un silence se note comme un silence** (« proposé, non corrigé,
  parti tel quel ») ; c'est sa règle du 11, et elle vaut parce qu'elle est dite.
- **Payée en un tour — la question du périmètre posée avec la mauvaise recommandation** : Cowork recommandait « Suivi comme lecture du
  dépistage » (trois sous-onglets) ; Grégoire a tranché « tout l'onglet, 35 constats ». La supposition (« ce que l'enseignant lit » =
  les sorties du dépistage) était nommée, il l'a corrigée en quatre mots. ⮕ Rien à changer : **c'est exactement ce qu'une supposition
  nommée doit coûter.** Mais ne pas confondre SA règle du 24 août (le backlog) avec SON intention (le chantier) : il peut lever la
  première pour la seconde.
- **Ce qui a tenu** : une consigne par lot écrite à froid, relayée en une ligne ; trois textes proposés « sinon c'est ceux-là » (zéro
  tour perdu) ; la relecture croisée de Cowork sur le diff **avec l'état d'avant cartographié** (le piège du lot 2 vérifié en un
  `grep`) ; la porte publiée avant le rapport de push, avec la consigne d'attendre le bas de page ; la console mise à jour au tour même
  de chaque relevé ; **l'heure lue dans la même commande que l'écriture, à chaque fois** (l'erreur 14 n'a pas eu lieu le 11).


### Le 10 et le 11 septembre — quatre choses, trois rattrapées, une payée

- **Payée — la carte des effets a déclaré mort un réglage vivant** (« Direction du risque »). Elle avait suivi une fonction
  quasi homonyme (`calculerDirectionRisque`, morte) et pas la CLÉ (`directionRisque`, lue par `calculerDirectionsCriteres`, cinq
  appelants). Rattrapée par la relecture de Claude Code AVANT de retirer ; sans elle, les flèches par critère auraient été figées à
  0,05 chez tout le monde. ⮕ **Un « mort » se mesure par sa clé et chaque lecteur de la clé, pas par le nom d'une fonction.** La
  consigne de #824 le répète pour chacun des cinq chemins.
- **Rattrapée — une supposition dans un texte d'aide** (« d'une production à l'autre ») : le code compare deux fenêtres décalées.
  Nommée comme supposition dans le bloc relayé, Claude Code l'a mesurée et remplacée. ⮕ Une supposition NOMMÉE se corrige en dix
  secondes ; elle ne coûte que si elle est tue.
- **Rattrapée — les heures écrites de tête** (6 h 15 / 6 h 25 / 6 h 40 pour des décisions prises entre 6 h 10 et 6 h 25) et
  « fin de soirée » dans l'en-tête de la consigne de démarrage pour un commit de 15 h 33. ⮕ `TZ=America/Toronto date` avant
  d'écrire une heure, et « vers » quand on n'a pas l'horloge.
- **Rattrapée — le compte de la console** (« dix-huit versions depuis le 6 » : c'étaient trente-sept, comptées sur `version.json`).
  ⮕ Un chiffre dans la console vient d'une commande, pas d'une lecture de titres.
- **Payée en tokens, pas en erreur — le rechargement simple qui « prouvait » que le cache marche** (0,9 s) : Chrome ne revalide
  que le document principal sur un reload. C'est `netlify.toml` (`max-age=0, must-revalidate` sur `/js/*`) qui dit la vérité :
  chaque OUVERTURE revalide ~200 scripts à la file. ⮕ Devant un temps de chargement, lire les en-têtes de cache avant de
  mesurer au navigateur.

### Le motif qui a tenu, du 10 au 11 : « le lot est fini quand Grégoire l'a VU »
Quatre livraisons en une matinée (1.129.1, 1.129.2, 1.130.0, et la clôture en cours), chacune avec sa porte terrain relevée par
lui (5/5, —, 13/13) avant la suivante. Il a lui-même levé sa règle « une livraison par séance » pour les queues de lot ; **il
regarde avant, et c'est ça qui compte**, pas le nombre.

### Avant le 10 septembre — leçons des 4, 5 et 6 (à promouvoir selon la règle 3 quand elles auront servi trois fois)

*Les 2 et 3 septembre. Elles sont écrites parce qu'elles se ressemblent toutes.*

1. **Une consigne d'hier promue sans remesure.** Le rapport portait déjà ses dispositions depuis
   la veille, et le site visé était corrigé. C'est Claude Code qui l'a signalé. ⮕ **Règle 1 :
   remesure avant de relayer, même ton propre texte de la veille.**
2. **Un zéro annoncé sans son témoin** — deux fois. « Il n'y a rien » n'est pas une mesure tant
   que la commande qui rend zéro n'est pas montrée. ⮕ **Aucune ancre sans sa preuve ET son
   témoin.**
3. **« Neuf autres plans » annoncés sur la foi d'un `head -14`.** Il y en avait 126.
4. **Un manque annoncé sans avoir lu le bloc jusqu'au bout.** La consigne du lot 1 exigeait
   d'ajouter `type` au schéma d'import — **il y était déjà** (`js/import-export.js:737`) ; le
   schéma commence à 610 et finit à 748, et la lecture s'était arrêtée en chemin. **Claude Code a
   vérifié au lieu d'obéir, et il a eu raison.** ⮕ **Une consigne peut se tromper. Dis-lui de
   mesurer, pas de te croire.**
5. **La nomenclature confondue.** Un **code** identifie et compte (rattaché aux sous-critères) ;
   un **tampon** commente et se restitue. Un cadrage entier et un module portaient le mauvais nom.

### Et le 4 septembre — quatre choses qui n'ont PAS coûté, parce qu'elles ont été mesurées à temps

6. **Un bloc relayé n'est pas un bloc appliqué.** Grégoire avait transmis la décision du menu ;
   Claude Code avait lancé la suite et n'avait rien changé. Mesuré avant de le croire :
   `grep "critères sont tous" js/` rendait 0 avec son témoin. ⮕ **Après un relais, remesure
   ce qui devait changer, pas ce que le rapport dit.**
7. **En relayant une décision, Cowork l'avait ÉTENDUE** (la ligne parlerait aussi quand les types
   divergent). C'était son ajout, pas la décision. Retiré quand la note de la session précédente
   a montré l'écart. ⮕ **Relaie la décision au mot ; ce que tu ajoutes, tu le nommes comme tien.**
8. **Un `grep` littéral qui rend zéro sur un nom CONSTRUIT.** `data-on-input` n'apparaît nulle part
   dans `main.js`, parce que l'attribut y est assemblé (`'data-on-' + eventType`, `main.js:1330`).
   Un zéro qui ressemblait à un défaut bloquant. ⮕ **Devant un zéro, cherche la construction
   avant d'annoncer l'absence.**
9. **Le badge MIXTE que Grégoire croyait fautif** : Cowork a dit « je ne retrouve pas ce
   comportement dans le code » et a demandé un regard de trente secondes, au lieu d'inventer une
   cause. C'était une erreur de manipulation. ⮕ **Ne pas retrouver, c'est une réponse.**

10. **Trois dossiers annoncés « non suivis » qui l'étaient** (4 septembre au soir, corrigé le 4 au
    matin). Le montage Linux de Cowork rend les noms de fichiers en **NFD** (`franc\u0327ois`) ;
    le dépôt les suit en **NFC** (`français`, `core.precomposeunicode=true`). `git status` depuis
    Cowork montre donc comme non suivis des fichiers suivis, et comme non ignorés des dossiers
    ignorés — et une question est montée jusqu'à Grégoire pour rien. ⮕ **Devant un « non suivi »
    qui porte un accent, normalise en NFC et cherche dans `git ls-files` avant de l'annoncer.**

11. **Une consigne qui nommait « le PDF de l'élève » sans avoir mesuré combien de textes l'élève
    lit.** La consigne du lot 3 visait un site ; il y en avait **quatre** (l'aperçu enseignant,
    la synthèse PDF, le texte copié vers LÉA, et le bilan — **deux bilans distincts**, un dans
    l'app, un dans le PDF). Deux retouches, trouvées par Grégoire à l'écran, pas par la
    relecture. ⮕ **« Ce que l'élève lit » est un PÉRIMÈTRE à mesurer (grep des rendus), pas un
    fichier.**
12. **Un banc vert sur une grille MIXTE ne prouve rien pour une grille ENTIÈREMENT analytique.**
    Le spec du lot 3 rouvrait une copie dont le premier critère avait un menu ; la régression
    (timeout au rechargement, cadenas absent) ne se voyait que si le PREMIER critère est
    analytique. Trouvée par Grégoire, cause mesurée par Cowork en un `grep`
    (`attendreSelectsCriteres`). ⮕ **Quand un lot change ce qui ENTRE dans une structure, le banc
    doit couvrir le cas où la structure n'a QUE du neuf.**
13. **Deux questions montées à Grégoire pour rien, parce que la mesure aurait suffi** : les
    dossiers « non suivis » (erreur 10), et « distinguer la pénalité de la projection » — l'option
    « Aucune projection » existait (`evaluation-projection.js:232`). **Six fois en trois jours**,
    ce qu'il demande existe déjà sous un autre nom. ⮕ **Avant de remonter une question, `grep`
    la demande dans `js/` ; la réponse y est une fois sur deux.**

14. **Des heures écrites de mémoire au lieu d'être lues.** Cowork a daté ses fichiers « 9 h 30 »,
    « 9 h 45 », « 10 h » alors que l'horloge de Toronto disait 7 h 25 à 7 h 40 (témoin : le
    build `0904-0729` et le push `7a197996` à 7 h 32). Corrigé après coup, dans sept fichiers.
    ⮕ **Toute heure qu'on écrit se lit d'abord : `TZ=America/Toronto date`.** L'horloge du montage
    est en UTC ; la date en tête d'un fichier « fait foi » — elle doit donc être mesurée.

15. **Deux leviers de CI proposés à Grégoire sans avoir lu `tests.yml`** (4 septembre, 16 h) : les shards
    et les runs parallèles. Le fichier portait, en commentaire, la décision du 2 septembre qui les
    écartait (« ils raccourcissent l'attente, pas la facture ») et le quota déjà épuisé. Retirés au tour
    suivant, dit comme une correction. ⮕ **Avant de proposer sur la CI, lis `tests.yml` : ses commentaires
    sont un journal de décisions.**
16. **L'erreur 14, REFAITE le jour même** : Cowork a daté sa relecture « 15 h 30 », les retouches « 16 h 15 »,
    « 17 h », les mots « 17 h 50 » — les commits disent 11 h 20, 12 h, 13 h, 14 h 15. **Quatre heures
    d'écart, et Claude Code a recopié « 17 h 50 » dans un message de commit.** Corrigé le soir dans quatre
    fichiers ; la console porte encore « 15 h 30 ». ⮕ **`TZ=America/Toronto date` AVANT chaque heure
    écrite, sans exception.** Une heure « vers » qui n'a pas été lue est une heure fausse.
17. **Sept retouches pliées dans la release parce qu'elles sont nées du coup d'œil.** Le code du lot 4 a
    pris 48 min ; 2 h 20 de retouches ont suivi, une seule corrigeait quelque chose de cassé. Grégoire a
    situé l'attente ailleurs (la CI) et a gardé sa règle d'une livraison par séance ; la proposition
    « cassé → maintenant, envie → lot suivant » **n'a pas été adoptée** — elle vit dans la consigne du
    texte troué comme ordre de séance, pas comme règle. ⮕ **Ne la présente pas comme acquise.**

### Et le 4 septembre au soir — Cowork, cinq erreurs, toutes corrigées après coup

18. **Un fichier écrit dans `js/`** — interdit à Cowork. En comparant l'ancien et le nouveau module de projection,
    Cowork a copié l'ancien dans `js/_ep_avant_tmp.js` pour le charger par `require`. `rm` est refusé depuis
    le montage ; déplacé dans `_to_delete/` (ignoré). ⮕ **Un fichier temporaire va dans `$HOME`, et un module
    ancien se charge par un chemin absolu hors du dépôt.** Dit à Grégoire au tour suivant.
19. **L'erreur 14, refaite DEUX fois le même soir** : « 18 h 55 » écrit à 18 h 38, « 19 h 15 » écrit à 19 h 12.
    Corrigé les deux fois, mais après coup. ⮕ **`TZ=America/Toronto date` dans la même commande que l'écriture,
    et l'heure recopiée depuis sa sortie, jamais tapée.**
20. **La console a dit « cadré, pas commencé » d'un mécanisme livré la veille** (les codes par grille,
    `codes-annotation.js`, quatre commits du 3). La page précédente le disait déjà, Cowork l'a recopié sans
    mesurer. Trouvé en préparant la consigne du 5. ⮕ **Huitième occurrence du motif « ça existe déjà »** — et
    la première où c'est la console elle-même qui se trompait. Avant de porter un item « cadré », `git log
    --oneline -- <fichier du cadrage>` et `grep` du mécanisme dans `js/`.
21. **« Après le 14 » décidé pour Grégoire, sur une lecture fausse de sa surcharge** (voir §5). Il a corrigé :
    la maturité au 14 est SA priorité ; ce qui reste après, c'est ce qui ne peut pas servir avant (le recalcul
    sans évaluations). ⮕ **L'adoption est sa décision, pas une variable de charge.**
22. **L'étape 3 du texte troué appelée « finition »** sans avoir relu la carte, qui la nomme « les badges dans
    la phrase », un composeur neuf. Corrigé au tour suivant. ⮕ **Un chantier ne se qualifie qu'après lecture
    de sa carte.**

### Et le 5 septembre — quatre choses, deux payées, deux rattrapées

23. **La console a oublié un lot que Grégoire venait de décider** (l'étape 3, 8 h 59 → 9 h 01) : il a dû demander « as-tu
    ajouté l'étape 3 au menu du jour ? ». ⮕ **Une décision de Grégoire va dans la console au tour même où elle est prise**, pas
    au prochain lot.
24. **Une phrase lue par les collègues, proposée et jamais relayée** (« #581 », 7 h 50) : 1.118 puis 1.119 sont parties avec.
    Rangée dans le cadrage « Bilan », mais c'est un mot d'utilisateur qui attend depuis deux livraisons. ⮕ **Une correction de
    mots proposée à Grégoire a besoin de SA réponse avant la release ; sinon, la redemander au moment des mots du changelog.**
25. **Deux heures TAPÉES et rattrapées avant publication** (Cowork : « 8 h 05 » à 8 h 03 ; « 8 h 50 » pour une décision prise
    entre 8 h 53 et 8 h 58) ; et **une tapée par Claude Code** dans une carte (« 9 h 35 » à 9 h 27), vue à la relecture.
    ⮕ L'erreur 14 en est à sa **septième occurrence** en deux jours : **lire l'heure dans la même commande que l'écriture**.
26. **Le mécanisme d'aperçu de PR existait pour exactement le besoin du jour** (éprouver sur iPad avant la fusion,
    `netlify.toml` l. 29-31) et il a été retrouvé en lisant le fichier, pas de mémoire. ⮕ **Dixième occurrence de « ça existe
    déjà »**, cette fois payante : lire la configuration avant de proposer une voie.

### ▣ Et un motif qui est revenu HUIT fois en trois jours
**« Ce que Grégoire demande existe déjà, ailleurs, sous un autre nom. »** L'écran de
personnalisation des codes, les bornes d'échelle, le seuil de réussite, les collections de
paramètres, les paliers d'une grille analytique (l'échelle), « Aucune projection », et le 4 septembre
la personnalisation des codes d'annotation (Annoter › palette, et la case « utiliser ces sous-critères
comme codes » qu'il avait sous les yeux), et le 4 au soir **les codes par grille eux-mêmes, livrés la veille et
portés « cadré » par la console**. ⮕ **Avant de cadrer un mécanisme neuf, cherche s'il existe déjà.** Le plus souvent,
ce qui manque n'est pas le mécanisme : c'est le chemin pour le trouver.

---


### Et le 5 septembre au soir, puis le 6 au matin — trois choses, une payée

27. **Un relais qui supposait que Claude Code tournait SUR LE MAC.** La session de clôture a tourné à distance (branche
    `claude/closure-…`, dépôt cloné) : elle a vu un arbre propre à `2a05b188`, pendant que les trois brouillons de clôture, écrits par
    la session interrompue, restaient sur le Mac. Elle a réécrit la clôture depuis les commits et l'a poussée ; le Mac est resté un
    commit derrière, avec ses brouillons. Rattrapé par Cowork au réveil (patch sauvé, consigne de rapatriement). ⮕ **Un relais nomme
    OÙ la session tourne, et ce qu'elle trouvera dans l'arbre à cet endroit-là.** Et « `main` = `origin/main` » mesuré depuis ce
    shell sans réseau ne dit rien de GitHub : c'est la dernière valeur poussée depuis CE Mac.
28. **« Après le 14 » écrit une seconde fois pour des correctifs** (consigne du 5 au soir, §4 c). Grégoire l'a corrigé en une phrase.
    ⮕ Voir §5 ; c'est l'erreur 21, et elle a coûté un tour.
29. **Ce qui a tenu** : quatre correctifs arbitrés en un tour, une seule question (didactique), le relais dans un fichier, la relecture
    croisée sur le diff réel avant la release, le geste à l'écran nommé avant le push. **Et un run perdu par le serveur lui-même**
    (« shutdown signal » après 220 tests) : ce n'est ni la spec ni le code — **un run coupé n'est pas un run rouge**, il ne prouve rien
    dans aucun sens.

---

### Et le 6 au matin — Cowork, deux choses rattrapées, une payée

30. **La console lui a compté « cinq gestes dus » puis « sept », dont quatre que ses données ne permettent pas** (un élève qui a
    repris et réussi, une pratique « Modèle simple » sur Projet + Examen…). C'est lui qui l'a dit, en une phrase, et il a dû
    l'expliquer. ⮕ **Avant de porter un geste « dû par toi », demande-toi si SON groupe-cours actif le permet sans données fictives.**
    Sinon, « attend un cas réel ».
31. **Presque écrit que « les testeurs rapportent enfin »** (quatre bogues en une matinée). Vérifié dans `SUIVI-BUGS.md` avant
    d'écrire : les quatre venaient de Grégoire lui-même. L'angle mort tient. ⮕ **Qui a rapporté se lit dans la colonne « source »,
    pas dans le nombre de fiches.**
32. **Une republication d'artefact refusée par le filtre de la session**, dite en une phrase, sans contournement ; Grégoire a redonné
    l'ordre. ⮕ Rien à changer, c'est la bonne conduite ; noté pour que la prochaine session ne s'y perde pas.
33. **Ce qui a tenu** : C1/C2 arbitrés en un tour (recommandation (a), les deux le jour même — sa règle du 5) ; la relecture croisée sur
    le diff réel avant de mettre la console à jour ; le quatrième audit cadré comme COMPLÉMENT du troisième, périmètre recompté au
    `grep`, et non comme une redite ; l'heure lue dans la même commande que l'écriture, à chaque fois.

---

## 7 · LA DATE QUI COMPTE

**Le 14 septembre 2026, dans trois jours** — la communauté de pratique se réunit pour la première fois. **Ce n'est pas la date où
ces gens arrivent : c'est celle où ils se parlent.** Toujours rien pour recueillir ce que vingt personnes diront ; c'est à lui, et
personne ne l'a pris. Ne propose pas de le coder : propose un gabarit de retour d'une demi-page, à froid, s'il le demande.
