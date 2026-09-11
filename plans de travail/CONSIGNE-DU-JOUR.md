# Consigne du jour — « Rencontres » : l'orthopédagogue entre par Suivi (lots 1 et 2 du cadrage « Rencontres », formule si le temps reste)

> **Écrite le 11 septembre 2026 à 20 h 25 (Toronto) par Cowork**, pour la journée du samedi 12. Application au moment de l'écriture :
> **`1.134.0`**, build `0911-1922`, `main` = `7092ce42` (lot 4 du cadrage 11 livré à 19 h 22). Elle remplace la consigne du lot 4,
> archivée à côté sous `_ancienne-CONSIGNE-DU-JOUR-2026-09-11-lot-4-profils-individuels.md`.
> **Cadrage** : `plans de travail/CADRAGE-2026-09-11-rencontres-l-orthopedagogue-entre-par-suivi.md` (entrée 11 de
> `00-CADRAGES-OUVERTS.md`). **Sources** : dossier `docs/orthopedagogie/` du dépôt (les deux courriels de
> l'orthopédagogue, les deux mesures du 11, l'idée de Grégoire) — copié depuis le dossier Cowork le 11 à 20 h 45 ; c'est la copie vivante.
> **Décisions de Grégoire, dans ses mots** : « universaliser l'application » (18 h 45) ; entrée par Suivi, « trois questions, un cours de
> service visible dans Cadre » (19 h 20) ; les mots « Rencontres », « rencontre », « Service » (19 h 35) ; « je voudrais que l'on avance le
> plus possible l'application pour elle, pour lundi, quitte à poursuivre le développement dans la semaine ou le mois » (20 h 10).
> **But de la journée** : lundi 14, l'orthopédagogue ouvre l'application, répond à trois questions, et tient ses rencontres dedans.
>
> **AVANT TOUT — un commit documentaire séparé** : l'archivage de la consigne du lot 4, la présente, le cadrage « Rencontres », l'entrée 11
> de `00-CADRAGES-OUVERTS.md`, `Rapports/INVENTAIRE-2026-09-11-orthopedagogie-dans-l-app-et-la-doc.md`. `git add` ciblé.
>
> ⚠ **Une consigne peut se tromper : mesure, n'obéis pas.** Les numéros de ligne datent du 11 au soir sur `1.133.0`-`1.134.0`.
> ⛔ **`js/config.js` et `js/navigation.js` sont des zones protégées** (`CLAUDE.md`) : le sous-onglet (§ C) les touche. **Sans l'autorisation
> explicite de Grégoire dans sa ligne de lancement, § C ne se fait pas** ; le reste se fait, et « Rencontres » attend son feu vert.
>
> **Préalables** : le cadrage (§ 3-5) ; les deux mesures du 11 (couplage au groupe-cours ; la séance comme unité de temps) ; `CLAUDE.md`
> (ce qui remonte à Grégoire, règle 1) ; `PROTOCOLE.md` (relecture croisée : ce lot « ne se reprend pas », il part chez une utilisatrice
> réelle lundi). Skills : `labo-codex`, `depistage-rai` (§ profil), `verification-adverse`, `portes-terrain`, `release-et-changelog`.

---

## 0 · CE QUE CE LOT CHANGE, POUR ELLE ET POUR GRÉGOIRE

1. **Pour elle** : dans Suivi, un sous-onglet **« Rencontres »**. À la première ouverture, **trois questions** — les dates de son trimestre
   (si aucun trimestre n'existe), le **nom de son service**, **sa liste d'élèves** (saisie ou collée) — et l'application crée ce que le magasin
   exige : un trimestre, un **cours de nature « service »** (sans code, sans discipline, sans compétences), un groupe d'élèves, un
   groupe-cours ; le tout **visible dans Cadre, tel quel**. Ensuite, « Rencontres » liste ses rencontres et lui permet d'en créer
   (individuelle ou sous-groupe, date, heure, durée, participants, notes par élève, bilan). Profils individuels, volet confidentiel et rapport
   marchent déjà pour ses élèves (mesure 1, § 4 : ils ne lisent aucun contexte).
2. **Pour Grégoire et ses collègues** : **rien ne bouge** sur un groupe-cours ordinaire — harnais AVANT/APRÈS obligatoire (§ F). Une chose
   s'améliore pour tous : une intervention **sait désormais dans quel groupe-cours elle est née**, et la liste des interventions d'un cours ne
   mêle plus celles d'un autre (constat de l'audit du 5 sept., « les interventions ne portent pas leur groupe-cours »).
3. **Ce qui reste manuel, exprès, pour un mois** (décision de Grégoire, 20 h 10 : « tout est manuel, comme si elle écrivait sur papier ») :
   la présence se note **dans la rencontre** (participants), l'indice A et la complétion **se taisent** sur un service, la carte RàI d'un
   élève de service **ne s'affiche pas**. Ses retours d'octobre trancheront (cadrage § 7). ⛔ Ne rien inventer là.

**Principe de construction** : **un service EST un cours** (enregistrement de `cours` ordinaire + `nature: 'service'`), un groupe-cours de
service EST un groupe-cours (`horaireId` possiblement `null`). Aucun magasin à part, aucun troisième chemin de données : la liste de ses
élèves passe par `obtenirEtudiantsCoursActif()` (`js/modes.js:1169`) **sans nouveau cas** — c'est la raison de ce choix. Le mot
« orthopédagogie » n'apparaît **nulle part** dans le code : un enseignant qui reçoit des élèves à son bureau a le même sous-onglet.

---

## 1 · LE LOT — dans cet ordre, un commit par lettre, une seule livraison à la fin

### A. Un cours de nature « service » (Cadre › Cours)
- `cours.nature ∈ { 'cours' (défaut, absent = cours), 'service' }`. Dans le formulaire du cours, un choix **« Cours / Service »** (mot
  « Service », tranché). Pour un service : **seul le nom est requis** ; `codeCours`, `discipline`, `ponderation`, compétences : vides, et
  la validation de `trimestre-v2-cours.js:1292-1319` (#540) ne les exige pas. **Mesure d'abord** chaque lecteur de `codeCours` /
  `discipline` / `ponderation` (grep sur `js/`) : ce qui affiche un code vide doit afficher le **nom** ; ce qui calcule sur la
  pondération doit tolérer l'absence sans NaN. Liste tes trouvailles avant de coder.
- Dans les listes de Cadre, le service se distingue par son mot (« Service »), pas par une couleur nouvelle.

### B. Un groupe-cours sans horaire — MESURE AVANT DE PROMETTRE
- `trimestre-v2-groupes-cours.js:612` exige un horaire. Pour un groupe-cours dont le cours est un service, l'horaire devient **facultatif**.
- ⚠ **C'est le mur de la mesure 2** : 22 fichiers lisent les séances, `genererSeancesCompletes` (`horaire.js:570`) part de l'horaire.
  **Mesure** ce que `horaireId: null` produit sur chaque lecteur (Suivi du groupe, Liste, Saisie des présences, Profils, Interventions,
  calendrier, tableau de bord, export PDF, captures) : attendu, **un calendrier vide et des écrans qui le disent** (« Ce service n'a pas
  d'horaire : la présence se note dans la rencontre »), **jamais une exception ni un écran blanc**.
- **Si un lecteur casse et ne se répare pas en une heure** : repli **visible**, jamais caché — les trois questions créent un « horaire de
  service » nommé ainsi, d'un créneau par semaine, affiché dans Cadre. Écris dans le rapport lequel des deux tu as livré et pourquoi.

### C. Le sous-onglet « Rencontres » (Suivi) — ⛔ ZONE PROTÉGÉE, autorisation de Grégoire requise
- `js/config.js:67` (liste des sous-onglets de Suivi) et `js/navigation.js:169` (correspondance) : ajouter `rencontres` **après**
  « Interventions ». Une seule sous-section nouvelle dans `index.html`.
- **Sans service dans le trimestre actif** (ou sans trimestre) : la sous-section montre **les trois questions**, sur un seul écran, et un
  bouton « Créer mon service ». Réutilise l'existant : la création de trimestre (dates), la création de cours (A), la saisie d'élèves
  (`trimestre-v2-etudiants.js:497`, `ajouterEtudiantV2`) et, si elle existe, l'analyse d'une liste collée (import CSV) — **mesure ce qui
  est réutilisable, ne réécris pas un parseur**. À la fin : le service devient le groupe-cours **actif**, et l'écran passe à la liste.
- **Avec un service actif** : la liste des rencontres de CE service (D), le bouton « + Nouvelle rencontre », et le formulaire d'intervention
  existant (`interventions.js`) rendu avec le vocabulaire « rencontre » (titre, boutons, libellés) et `type: 'individuel'` par défaut.
  **Même module, même données, un paramètre de vocabulaire** — pas de copie de `interventions.js`. Le champ « séance concernée » et
  « marquer les non-participants motivés » sont **cachés** sur un service (ils supposent une séance de groupe).
- **Avec un groupe-cours ordinaire actif** : « Rencontres » montre la même liste, filtrée sur ce groupe-cours, avec le vocabulaire
  « rencontre » — c'est l'universalisation demandée ; « Interventions » reste ce qu'il est. Si les deux sous-onglets se marchent dessus,
  dis-le dans le rapport, **ne fusionne rien** : ça remonte à Grégoire.
- ⛔ **Si l'autorisation n'est pas dans la ligne de lancement** : A, B, D, E, F se font ; C est écrit dans le rapport comme « prêt, attend
  le feu vert », et le repli pour lundi est le chemin manuel par Cadre (Cowork l'écrit dimanche).

### D. Une intervention porte son contexte de naissance (pour tous)
- À la création (`interventions.js:127`), `groupeCoursId` = l'identifiant du groupe-cours actif (via **un point unique** — voir E).
- La liste (Interventions comme Rencontres) filtre sur le groupe-cours actif. **Compatibilité** : une intervention sans `groupeCoursId`
  (toutes celles d'avant) reste visible dans tous les contexts et est **estampillée au prochain enregistrement** ; aucune purge, aucun semis.
- Sentinelle : deux groupes-cours, une intervention chacun, chacun ne voit que la sienne ; une intervention ancienne sans contexte est vue
  des deux.

### E. Un point unique pour l'identifiant du contexte (hygiène, mesurée le 11)
- Huit sites recalculent `infoCours._groupeCoursId || infoCours.id` (`profil-etudiant-calculs.js:1830`,
  `profil-etudiant-sections-affichage.js:2670`, `graphiques-progression.js:595, 820, 1422, 3619`, `snapshots.js:78, 1102`). Une fonction
  (`snapshots.js:78` en est déjà presque une), exportée, huit appels. **Zéro changement de valeur** : sentinelle qui compare l'ancienne
  expression et la fonction sur les mêmes `infoCours`.

### F. Rien ne bouge pour l'enseignant — harnais AVANT/APRÈS, puis sentinelles
- Harnais sur le **pack démo** (comme le 10 sept., `1630 cas / 0 différence` : reprends le même dispositif) : Suivi du groupe, Liste,
  Présences, Profils (indices, cartes, rapport), Interventions, Cadre, export — **avant** le premier commit de code, **après** le dernier.
  Un pixel qui bouge hors « Rencontres » et hors l'estampille D est un défaut.
- Sentinelles : `sentinelle-<n>-un-service-est-un-cours` (A+B : un service se crée sans code, sans horaire, et `obtenirEtudiantsCoursActif`
  rend sa liste) ; `sentinelle-<n>-intervention-porte-son-contexte` (D) ; `sentinelle-<n>-point-unique-contexte` (E). Break-tests rouges
  pour chacune, fichiers restaurés à empreinte identique.

### G. Si le lot est fini avant 16 h — la formule « taux de repérage »
- Registre `js/evaluation-formules.js` (trois modèles, l. 88-150) : un quatrième, `taux_reperage`, note = pondération × (erreurs repérées ÷
  erreurs au total). Réutilise les deux saisies existantes (`erreurs`, `mots`) **si** le registre permet de renommer leurs libellés par
  modèle ; sinon, dis-le et n'ajoute rien — un libellé « nombre de mots » sous une saisie qui attend « erreurs au total » est un piège.
  Sa grille (six critères, quatre niveaux, `docs/orthopedagogie/courriel-2026-09-11_fig2`) **n'est pas semée** : elle la crée dans
  Conception ; un **modèle** de bibliothèque viendra plus tard, après son mois d'usage.

---

## 2 · CE QUI REMONTE À GRÉGOIRE (ne code pas à sa place)
- L'autorisation pour `config.js` / `navigation.js` (§ C) — dans sa ligne de lancement, ou pas.
- Tout mot nouveau à l'écran hors « Rencontres », « rencontre », « Service » : les trois questions, le message « ce service n'a pas
  d'horaire », les libellés du formulaire de rencontre — **propose-les dans le rapport, avec leur emplacement** ; livre-les tels quels,
  il corrigera dimanche.
- Si A ou B révèle qu'un calcul (note, indice, pondération) change de valeur pour un cours ordinaire : **arrête ce point, inscris, remonte**.

## 3 · LIVRER — `minor` (`1.135.0`) : un sous-onglet nouveau et une estampille sur les interventions
Une seule livraison, à la fin, après le coup d'œil de Grégoire (§ 4) et la relecture croisée de Cowork sur les commits. Changelog
utilisateur : ce qu'elle verra lundi, en trois lignes, sans le mot « orthopédagogue » (le sous-onglet sert à tous). Si § C n'a pas eu son
feu vert : `patch` (`1.134.1`), rien de visible, et le changelog le dit.

## 4 · LA PORTE TERRAIN
Markdown par Claude Code (`PORTES-TERRAIN-2026-09-12-rencontres.md`) ; artefact par Cowork. Rangées :
1. **Ses deux groupes réels** — Cadre, Suivi du groupe, Liste, Présences, un profil, Interventions : **identiques à hier** (ce qu'il regarde :
   rien). Ses interventions existantes sont toutes là.
2. **Mode démo** (pas ses données) — Suivi › Rencontres : les trois questions ; « Créer mon service » ; Cadre montre le service ; Suivi ›
   Liste montre les élèves saisis ; une rencontre créée, avec notes et bilan, visible dans Rencontres seulement.
3. **Lundi, la vraie porte** : l'orthopédagogue, sur son poste. Ce que Cowork lui écrit dimanche part de ce que CETTE consigne a livré, pas
   de ce qu'elle promettait.

## 5 · TROUVAILLES ET RAPPORT
Ce qui casse avec `horaireId: null` (B), lecteur par lecteur ; les mots proposés (§ 2) ; ce que § C a coûté dans les zones protégées ;
et, si tu les vois passer, les deux questions du cadrage § 7 que la journée éclaire (sous-groupes récurrents, vue de la semaine) —
**inscris, ne code pas**. Fin de journée : `CONSIGNE-DEMARRAGE-PROCHAINE-SESSION.md` réécrite, état mesuré.
