# Inventaire — ce que l'application et la documentation disent de l'orthopédagogie

> **Date** : 11 septembre 2026, 18 h 55 (heure de Montréal)
> **Rédigé par** : Cowork, sur mesure du dépôt (`grep -ri orthop`, hors `node_modules`, sauvegardes et traces Playwright)
> **Destinataire** : Grégoire, avant la lecture de ce que l'orthopédagogue lui a transmis
> **Ce que ce document fait** : rapatrier, sans rien proposer. Les propositions viendront après sa lecture à elle.
> Marques : **[VÉRIFIÉ]** lu dans le dépôt, avec sa référence · **[INFÉRÉ]** cohérent, non prouvé · **[À ÉTABLIR]** ouvert.

---

## 1. Où le mot apparaît, et où il n'apparaît pas

**[VÉRIFIÉ]** Le mot « orthopédagogue » ou « orthopédagogie » est absent du code exécuté. Dans `js/`, une seule
occurrence, et c'est un commentaire d'en-tête (`js/contexte-qualification.js:21-23`) : « le renommage des mots attend le travail
d'automne avec l'orthopédagogue ». Dans `index.html`, une seule occurrence : le nom d'un programme technique
(« 144.F0 – Orthèses, prothèses et soins orthopédiques »), sans rapport. Aucune fonction, aucune clé, aucun réglage, aucun
écran ne porte ce mot.

**[VÉRIFIÉ]** Il apparaît dans **21 fichiers de documentation**, tous datés du 31 août au 11 septembre 2026, sauf le skill
`depistage-rai` (avril 2026). Autrement dit : l'orthopédagogie est, à ce jour, un **horizon nommé dans les documents de
travail**, pas une chose que l'application sait faire.

Sources, par ordre d'importance :

| Source | Date | Ce qu'elle apporte |
|---|---|---|
| `Rapports/RAPPORT-depistage-etat-et-orthopedagogie-2026-08-31.md` | 31 août | Le seul document consacré au sujet : limites du modèle, cinq questions à lui poser, gestes à faire avant la rencontre |
| `.claude/skills/depistage-rai/SKILL.md` | avril | Le cadre RàI ; l'orthopédagogue comme relais du palier 3 ; la vision « multi-intervenants » |
| `Rapports/INVENTAIRE-2026-09-10-nomenclature-des-zones.md` § 8 | 10 sept. | Le tableau des divergences de bornes et de mots « qui part chez l'orthopédagogue » |
| `plans de travail/CADRAGE-2026-09-10-…` et `CADRAGE-2026-09-11-…` | 10-11 sept. | Tes mots : « préparer le travail d'automne avec l'orthopédagogue » ; ce qui ne se rouvre pas avant elle |
| `Rapports/AUDIT-onglet-suivi-2026-09-05.md` | 5 sept. | L'onglet Suivi audité parce que « c'est lui que l'orthopédagogue lira » |
| `BACKLOG.md` #553, #821, #822 ; `OU-EN-EST-ON.md` ; consignes de démarrage ; `RELAIS.md` ; `SESSION.md` | 31 août – 11 sept. | Mentions de suivi, toutes dérivées des précédentes |

---

## 2. Deux images de l'orthopédagogue coexistent dans les documents, et elles ne se recoupent pas

C'est le constat principal de cet inventaire. Aucun document ne les distingue ; les deux sont vraies à leur date.

### 2.1 Image A — une **lectrice** des données de l'enseignant (skill, avril ; audit du Suivi, 5 sept.)

**[VÉRIFIÉ]** Le skill `depistage-rai` la place au bout de la chaîne : au palier 3, « ce sont les services spécialisés
(services adaptés, aide pédagogique individuelle, éventuellement orthopédagogue) qui devraient prendre le relais » ; le
rapport du profil est décrit comme « dossier de référence pour un orthopédagogue ou l'API » (SKILL.md:173, 196). La section
« Vision future — Labo Codex multi-intervenants » (SKILL.md:360-365) nomme les contraintes à préserver pour cette image :
**rôles et permissions** (vues différenciées sur les mêmes données), **traçabilité des interventions par intervenant**,
**confidentialité sélective** de certaines notes, **plans d'intervention partageables** (Student Intervention Plan du NCII),
**historique inter-trimestres**, **indépendance disciplinaire** du modèle de données.

**[VÉRIFIÉ]** L'audit du 5 septembre et sa section dans `OU-EN-EST-ON.md` (ligne 1621) reprennent cette image : l'onglet
Suivi « n'avait jamais été pris pour objet, et c'est lui que l'orthopédagogue de la cohorte 1 lira ». Deux des quatre
correctifs du soir même (la reprise comptée deux fois, le rapport du profil qui ne se générait pas) ont été priorisés parce
qu'ils « touchent ce que l'orthopédagogue lira ».

### 2.2 Image B — une **utilisatrice** qui pose son propre appareil (rapport du 31 août ; cadrages des 10-11 sept.)

**[VÉRIFIÉ]** Le rapport du 31 août la traite comme une utilisatrice à part entière, d'une autre profession, qui déclare
son propre cadre : « Une orthopédagogue peut poser son propre appareil d'évaluation sans toucher au code » (§ 4.1) ; elle
« ne nommera pas ses critères comme Grégoire » (§ 4.4). Les cinq questions du § 5.3 lui demandent ce qu'elle observe, comment
elle qualifie, comment elle lit une évolution, comment elle décide d'intervenir, ce qu'elle fait ensuite.

**[VÉRIFIÉ]** Tes mots du 10 septembre (cadrage 10, l. 22-24) : « préparer le travail d'automne avec l'orthopédagogue, en
faisant sur le dépistage ce qui a déjà été fait sur Cadre, Conception et Évaluation. Le dépistage n'est pas nommément
explicité dans l'application. » Et `BACKLOG.md:5615` : « une orthopédagogue qui rejoint l'équipe — retrait des éléments codés
en dur liés à SOLO, pour que le dépistage suive les souhaits de l'utilisateur ».

### 2.3 Ce qu'aucun document ne dit

**[VÉRIFIÉ, par absence]** Aucune des 21 sources ne mentionne que l'orthopédagogue **n'a pas de groupes**, qu'elle suit des
**individus à horaires distincts**, ni qu'elle tient des **dossiers individuels**. Les deux images supposent, sans le dire,
que ses élèves entrent dans l'unité de l'application : le groupe-cours, avec sa liste et son horaire. Ce que tu as dit ce
soir est donc une information nouvelle, qui ne se trouve nulle part dans le dépôt.

---

## 3. Ce que l'application sait faire, et qui la concerne

### 3.1 La chaîne du dépistage **[VÉRIFIÉ]** (rapport du 31 août, § 2 ; skill)

Grille de critères (chacun avec son `niveauSOLO`) → échelle de performance (chaque niveau avec son `niveauSOLO` et ses
repères) → évaluation des artefacts → indices **A-C-P** (assiduité, complétion, performance) → **IPB** (artefacts consécutifs
récents sous le seuil de défi, sur les critères multistructurels) → diagnostic croisé IPB × direction → niveau **RàI 1 / 2 / 3**
→ accompagnement au profil → planification, bilan, suivi.

### 3.2 Le volet confidentiel du profil **[VÉRIFIÉ]** (`index.html`, champs `confidentiel-*`)

Catégorie et sous-catégorie ; situation du cours (régulier, renforcement, échec, abandon, décrochage) ; ÉPGC ; défis
particuliers (FLS, intégration, organisation scolaire, organisation citoyenne, socialisation) ; **services adaptés** avec
détails ; portrait de lecteur ; notes personnelles ; notes de présences. ⚠ Le portrait de lecteur est décliné en cinq champs
`confidentiel-portrait-structure / -rigueur / -plausibilite / -nuance / -francais` : **ce sont tes cinq critères SRPNF, écrits
en dur dans le volet confidentiel** — même famille de défaut que les 48 occurrences de « SRPNF » dans `js/` que tu as
reportées le 10 septembre (cadrage 10, l. 348-349). Pour une orthopédagogue, ce portrait est vide de sens tel quel.

**[VÉRIFIÉ]** L'audit du 5 septembre a cherché partout : le volet confidentiel ne sort dans aucun flux du Suivi (rapport,
archives, consolidation, export, PDF, graphiques, console). Mais le mode anonymisation ne l'anonymise pas (inscrit après le 14).

### 3.3 Le module interventions **[VÉRIFIÉ]** (`docs/modules/depistage-et-suivi.md` § 9 ; refonte du 11 avril)

Une intervention porte : `type` (groupe / **individuel** / mio), `niveauRai` (2 ou 3), date, heure, durée, `seanceConcernee`,
liste d'élèves (DA), `criteresCibles`, `objectifVise`, `snapshotAvant`, observations, notes individuelles, `statut`
(planifiée / en cours / complétée), `bilan` (atteint · suite : reconduire / ajuster / **référer** / aucune · observations).
⚠ Deux constats de l'audit du 5 : **les interventions ne portent pas leur groupe-cours**, et la liste des élèves suivis est
« une clé nue vidée à chaque changement de groupe » (inscrits après le 14). Le type « individuel » existe donc déjà, mais
l'intervention est rattachée à une séance du groupe.

### 3.4 Ce qui est extensible, et ce qui ne l'est pas **[VÉRIFIÉ]** (rapport du 31 août, § 4)

- **Extensible en valeurs** : critères, échelle, niveaux, repères, seuil de défi, pondérations.
- **Non extensible en dimensions** : les entrées sont fixées à A-C-P ; aucune quatrième dimension ne se déclare.
- **Non extensible en cadres** : SOLO seul cadre ; fenêtre de trois productions ; table IPB × direction ; trois niveaux RàI.
- **[À AJOUTER après ce soir]** Non extensible en **unité** : tout est rattaché au groupe-cours (liste, horaire, séances,
  présences, interventions). Le rapport du 31 août ne mesurait pas cette dimension-là.

---

## 4. Ce qui l'attend explicitement (décisions déjà prises)

| Ce qui attend | Où c'est dit | Statut |
|---|---|---|
| **Les bornes** (0,64 / 0,75 / 0,85 · 65 / 70 / 75 · 60 fixe · 70 %) | cadrage 10 § « hors périmètre » ; `#821` | ⏸ ne se rouvre pas avant elle |
| **Les noms des zones** (Fragile / Acceptable / Bon ; Favorable / Modéré / Critique…) | `#821` ; `OU-EN-EST-ON.md:204` | ⏸ idem |
| **Le palier « Insuffisant » inatteignable** | `#822` | ⏸ « à trancher avec le renommage de #821 » |
| **Le tableau des divergences réelles** (§ 8 de l'inventaire du 10) | « c'est ce tableau qui part chez l'orthopédagogue » | ✔ prêt, rien n'y est recommandé |
| **Les cinq questions** du rapport du 31 août (§ 5.3) | rapport | ✔ écrites, jamais posées (aucune trace de réponse dans le dépôt) |

---

## 5. Ce que le rapport du 31 août demandait de faire avant la rencontre, et où c'en est

| Priorité (31 août) | Geste | État au 11 septembre |
|---|---|---|
| 1 | **#553** — le rabotage `startsWith('francais')` : un critère nommé autrement est filtré du diagnostic sans un mot | **[VÉRIFIÉ] toujours ouvert** (`BACKLOG.md:5589`), avec la note « ne pas corriger isolément sans le cadrage orthopédagogie » |
| 2 | Reprendre `docs/modules/depistage-et-suivi.md` | **[VÉRIFIÉ]** fichier touché le 10 sept., mais son en-tête cite encore `js/profil-etudiant.js`, éclaté depuis ; **[INFÉRÉ]** toujours périmé sur le fond |
| 3 | Unifier A-C-P / A-C-M / A-C-P-E | **[À ÉTABLIR]** aucune trace de lot dédié |
| 4 | Ouvrir un item « extensibilité du dépistage » | **[À ÉTABLIR]** aucun item trouvé sous ce nom |
| — | **#551** (deux définitions de la maîtrise) et **#554** (statut de décrochage jamais transmis) | ouverts ; #551 mesuré par l'audit du 5 (« consolidé » et « niveau 2 » pour le même élève sur une échelle à trois paliers) |

⮕ Des quatre gestes prévus, **aucun n'est clos**. Ce qui a avancé entre-temps est autre chose : les mots de l'écran de
réglage (`#823`, clos), la source unique des règles de qualification (`#821` lot A), l'audit et les correctifs du Suivi.

---

## 6. Ce que ce soir change, sans encore le trancher

**[À ÉTABLIR]** L'information que tu apportes (pas de groupes, des individus à horaires distincts, des dossiers individuels)
touche l'**unité de base** de l'application, pas seulement ses valeurs ou ses cadres. Le rapport du 31 août disait : « ne rien
concevoir avant de l'avoir écoutée ». Ce principe tient ; ce qui change, c'est que la première question n'est plus « qu'observes-
tu ? » mais **« quelle est ton unité de travail ? »** — l'élève seul, une liste d'élèves suivis, un dossier, une rencontre.

Ce que je ne fais pas ici : proposer une architecture. Ce qu'elle t'a fourni se lit d'abord.

---

## Annexe — commande de mesure

```
grep -rli "orthop" --include="*.md" --include="*.js" --include="*.html" --include="*.txt" . | grep -v -E "node_modules|_sauvegarde|_to_delete"
```
21 fichiers de documentation + `js/contexte-qualification.js` (commentaire) + `index.html` (nom de programme).
