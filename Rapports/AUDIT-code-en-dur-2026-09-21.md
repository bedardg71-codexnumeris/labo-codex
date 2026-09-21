# AUDIT — ce qui ne marche qu'avec la pratique de Grégoire

**Date** : 21 septembre 2026 · **Base** : `main` `1defd61c`, 1.152.2 · **Lecture seule** : aucune ligne de `js/`, `index.html`, `styles.css` n'a changé, aucune fiche inscrite.
**Question de Grégoire (10 h 40)** : « je croyais qu'on avait retiré tout ce qui est codé en dur ».
**Statut de ce rapport** : des mesures et des dispositions PROPOSÉES. Grégoire dispose. Cowork relit.

---

## En tête — dix lignes

1. **Réponse courte : presque tout ce qui avait été nommé le 26 août et le 1er septembre a été retiré.** Sur les sept points du cadrage, deux sont retirés (le seuil 0,7125 et son échelle, le portrait confidentiel), deux sont passés dans un registre réglable ou neutralisés (les phrases « français », les ressources SA / CAF), trois subsistent sans effet visible (§ 3).
2. **Famille 1 — commentaires et code sans appelant** : ≈ 640 lignes de commentaires (« Grégoire » 560, « 601-101 » 44, « Bédard » 21, « EUF » 11) et 5 blocs de code que rien n'appelle. Sans effet.
3. **Famille 2 — défauts réglables** : 9 traces (énoncés, projection, formule, codes d'annotation, sous-critères, seuils, exemples de saisie, gabarits de pratiques, replis d'échelle).
4. **Famille 3 — ne marche bien qu'avec une pratique précise** : 5 constats, dont **3 sont des doublons de fiches déjà ouvertes** (#553, #716, #677).
5. **Famille 4 — mots d'élève** : 2 constats.
6. ⚠ **Le constat le plus lourd joue CONTRE la pratique de Grégoire, pas pour elle** (F3-1) : un critère dont le nom commence par « Français » disparaît du diagnostic des forces et défis. Un·e collègue de chimie qui nomme son critère « Qualité de la langue » n'a pas ce défaut ; Grégoire, avec « Français écrit », l'a. Prouvé par banc.
7. F3-1 est le diagnostic que la fiche **#553** attendait depuis le 27 août (« aucune session ne peut le mesurer seule ») : il est maintenant mesuré.
8. Familles 3 et 4, une par une : **F3-1** critère « Français… » filtré ou fusionné (#553) · **F3-2** historique de P converti par I/D/M/E en clair (#716) · **F3-3** paliers de couleur 0,60 / 0,50 (#677) · **F3-4** DA à sept chiffres · **F3-5** cinq mots d'aide qui décrivent la grille de Grégoire comme celle du logiciel · **F4-1** « artefact » et « niveau É » dans une phrase de bilan · **F4-2** « En prévision de l'EUF » pour les critères créés avant le 4 septembre.
9. Une seule disposition « à corriger avant que la cohorte l'atteigne » est proposée : **F3-1**. Une seconde est à arbitrer par Grégoire parce qu'elle touche les mots d'élève : **F4-1**.
10. Ce que l'audit n'a pas mesuré est dit au § 5.

---

## 1 · Famille 3 — ce qui ne marche bien qu'avec une pratique précise

### F3-1 — Un critère nommé « Français… » disparaît du diagnostic ; deux critères « Français… » n'en font qu'un · doublon de #553

**Ce qu'on voit.** Un·e enseignant·e de littérature dont la grille porte « Français écrit » ouvre le profil d'un·e élève très faible en langue : le bloc des forces et défis nomme un autre critère comme défi principal, et la cible d'intervention vise cet autre critère. La faiblesse en français n'apparaît pas. Un·e collègue de français langue seconde qui évalue « Français oral » et « Français écrit » voit la même valeur sur les deux lignes du profil : celle du dernier critère de sa grille.

**La preuve — banc jetable, vrai code (`profil-etudiant-helpers.js`, `contexte-qualification.js`, `profil-etudiant-calculs.js`), montage de la sentinelle #552, échelle W/X/Y/Z à 10 / 40 / 70 / 90.**

| Cas | Entrée | Ce que le code rend |
|---|---|---|
| 1 · chimie, cinq critères dont « Qualité de la langue » à 10 % | les quatre autres à 70-90 % | moyennes correctes sur cinq clés ; défi principal « Qualité de la langue » ; cible « Difficulté persistante — Qualité de la langue ». **Rien à signaler.** |
| 2 · « Français oral » 10 %, « Français écrit » 90 %, « Compréhension » 70 % | | `moyennes = { francais: 0.9, comprehension: 0.7 }` ; défi principal « Compréhension » ; le profil affiche 90 % sur l'oral ET sur l'écrit. **Le 10 % a disparu.** |
| 2 bis · les mêmes, inversés | | `francais: 0.1` ; 10 % sur les deux lignes. |
| 3 · grille de Grégoire : « Structure » 70 %, « Rigueur » 70 %, « Français écrit » **10 %** | | `moyennes = { structure: .7, rigueur: .7, francais: .1 }` ; défis = Structure, Rigueur ; **« Français écrit » absent** ; cible « Difficulté persistante — Structure ». |

**La cause, lue après la mesure.** Le producteur des moyennes rabote lui-même la clé (`profil-etudiant-calculs.js:926`, `startsWith('francais') → 'francais'`). Sept lecteurs rabotent de la même façon et retrouvent donc la valeur. Un huitième, `diagnostiquerForcesChallenges` (`profil-etudiant-calculs.js:1292-1302`), lit `moyennes['francaisecrit']`, ne trouve rien, et filtre le critère (`.filter(c => c.score !== null)`). La fusion du cas 2 vient du même rabotage : deux accumulateurs, une seule clé d'arrivée, le dernier écrase.
⮕ Réponse à la question laissée ouverte en #553 (« d'où vient la clé `francais` du côté receveur ? ») : elle ne vient pas d'ailleurs, **elle est fabriquée par le producteur**. Les normalisations étant identiques des deux côtés (mesuré le 31 août), retirer le rabotage partout ferait coïncider les clés sans lui.

**Ampleur.** Neuf sites : `profil-etudiant-calculs.js:926`, `:1036`, `:1292` (celui qui ne rabote pas) · `profil-etudiant-helpers.js:984` · `profil-etudiant-sections-affichage.js:1213` · `interventions.js:1090`, `:1291`, `:1342` · `pratiques/pratique-pan-standards.js:1179`.
⚠ **Il y a du stock** : `interventions.js:1468-1484` enregistre `snapshotAvant[da].criteres` avec la clé `francais`. Un correctif tarit la source ; le bilan avant/après des interventions déjà enregistrées devra lire l'ancienne clé avec tolérance. À assumer et à écrire, pas à réparer d'office.

**Coût estimé** : intermédiaire (neuf sites, une lecture tolérante du stock, une sentinelle sur les cas 2 et 3).
**Disposition proposée** : *à corriger avant que la cohorte l'atteigne* — sous **#553**, dont l'énoncé est à remplacer par cette mesure. Motif : les collègues de la cohorte les plus probables enseignent le français, et c'est leur critère de langue qui est touché ; ce que l'écran montre oriente une intervention.
▣ Limite : la mesure porte sur les fonctions de calcul, pas sur l'écran rendu dans un navigateur.

### F3-2 — L'historique de la performance convertit les niveaux par I / D / M / E écrits en clair · doublon de #716

**Ce qu'on voit.** Un·e collègue dont la pratique n'est ni « Standards » ni l'ancienne sommative, et dont l'échelle ne s'appelle pas I-D-M-E, regarde la courbe d'évolution de P : les semaines passées sont calculées avec 40 / 65 / 75 / 100 pour les lettres I, D, M, E, et ses propres niveaux (A, B, C…) ne sont pas lus.
**La preuve.** `snapshots.js:325-328` et `:360-363` ; `grep -n calculerPerformanceHistorique js/pratiques/*.js` : sommative 1, pan-standards 1, **configurable 0, pan-specifications 0**. Constat B-6 du backlog (5 sept.), établi par lecture et `grep`. ⚠ **Non rejoué au banc aujourd'hui** : c'est un doublon déjà inscrit, et la lecture des deux blocs est sans ambiguïté — mais ce n'est pas une exécution.
**Ampleur** : un fichier, deux blocs jumeaux. **Coût** : laborieux (c'est tout le P historique qui est à rebrancher sur la pratique).
**Disposition proposée** : *doublon de #716* (ouverte, triée « après la cohorte » le 12 sept.). Rien de neuf, sauf un rappel : le tri supposait que ça « n'empêche aucun des huit énoncés » ; un·e collègue à échelle non IDME verra une courbe fausse dès la première semaine. À Grégoire de dire si le tri tient.

### F3-3 — Deux paliers de couleur en clair dans le profil · doublon de #677

**Ce qu'on voit.** Dans le bloc des badges par critère, le passage du jaune à l'orange (60 %) et de l'orange au rouge (50 %) ne suit aucun réglage.
**La preuve.** `profil-etudiant-sections-affichage.js:4177-4178` (`score >= 0.60`, `score >= 0.50`). Le seuil de force juste au-dessus, lui, lit `obtenirSeuil('defiSpecifique')` depuis #817.
**Ampleur** : deux lignes. **Coût** : rapide une fois la décision de conception prise.
**Disposition proposée** : *doublon de #677* — dont l'énoncé est **périmé en partie** : le 0,7125 qu'il décrit cinq fois n'existe plus (`grep -rnE '0[.,]7125' js index.html` : une occurrence, en commentaire).

### F3-4 — Un numéro d'élève doit avoir sept chiffres

**Ce qu'on voit.** Un·e collègue dont l'établissement n'identifie pas ses élèves par sept chiffres ne peut pas enregistrer un·e élève (« DA invalide »).
**La preuve.** `trimestre-v2-etudiants.js:262` et `:648` (`/^\d{7}$/`) ; `grep -rnE "da\.length !== 7" js` hors commentaires : 25 gardes dans quatre pratiques ; `travaux-import.js:81-84` apparie un fichier à un·e élève par sept chiffres.
**Ampleur** : 31 sites, 6 fichiers. **Coût** : laborieux.
**Disposition proposée** : *refuser* — motif : c'est une hypothèse du réseau collégial québécois, pas de la pratique de Grégoire ; aucun symptôme vécu ; aucune trace aux deux registres (`grep` fait). À rouvrir seulement si un membre de la cohorte vient d'ailleurs — Grégoire connaît sa cohorte, pas l'audit.

### F3-5 — Cinq mots d'aide décrivent la grille de Grégoire comme celle du logiciel

**Ce qu'on voit, et où.**
- Le glossaire définit « Grille de critères » par « 5 critères : Structure (15 %), Rigueur (20 %), Plausibilité (10 %), Nuance (25 %), Français (30 %) » — `index.html:13918`. L'entrée voisine « SRPNF » (`:14008`) a été recadrée en « grille d'exemple » ; sa jumelle a été oubliée.
- Chercher « critères » dans l'aide propose « srpnf, structure, rigueur, plausibilité, nuance, français écrit » — `init-inline.js:571`.
- Le bouton « Utiliser sous-critères par défaut (0-10) » pose onze catégories de grammaire française sans le dire — `grilles.js:4428`, contenu `:5013-5093`. Par geste, modifiable ensuite.
- L'aide du critère algorithmique parle du « nombre de mots de la rédaction » — `grilles.js:3645`.
- Le formulaire d'intervention donne en exemple « Stratégie de lecture n°3… » — `interventions.js:1075`.

**La preuve** : les cinq commandes `grep -n` correspondantes. Aucun calcul touché : ce sont des mots d'enseignant·e.
**Coût** : rapide (cinq chaînes). **Disposition proposée** : *inscrire*, en une seule fiche « mots d'aide », ⚠ les formulations remontent à Grégoire.

---

## 2 · Famille 4 — des mots qui nomment une discipline ou un vocabulaire à un·e élève

### F4-1 — « depuis plus d'un artefact » et « vers le niveau É » dans une phrase de bilan

**Ce qu'on voit.** L'élève d'un·e collègue qui a tout maîtrisé deux fois de suite lit : « Tous les critères sont maîtrisés depuis plus d'un artefact. Tu peux aider tes collègues — c'est une excellente façon d'étendre tes compétences vers le niveau É (transfert à d'autres contextes). » Son échelle n'a peut-être pas de niveau É, et ses travaux ne s'appellent pas des artefacts.
**La preuve.** `evaluation-retroaction.js:971`, chaîne littérale, appelée par `genererRetroactionBilan` (`:1207`). Sa jumelle `synthese-retroaction-data.js:832-836` dérive déjà le niveau du sommet de l'échelle (`niveauLePlusHaut`) mais dit encore « artefact ». Repli de titre « Artefact » en `:1212`.
**Ampleur** : trois chaînes, deux fichiers. **Coût** : rapide.
**Disposition proposée** : *inscrire* — et la formulation remonte à Grégoire (mots d'élève). Rappel de sa décision du 21 sept. : « productions étudiantes » plutôt qu'« artefacts » pour ce qui sort de son cours.

### F4-2 — « En prévision de l'EUF… » pour un critère algorithmique créé avant le 4 septembre

**Ce qu'on voit.** Un critère algorithmique qui ne porte aucun réglage de projection lit le modèle « norme externe » : l'élève reçoit « En prévision de l'EUF, ce ratio est… ». Un critère NEUF reçoit « aucune projection » à sa naissance.
**La preuve.** `evaluation-projection.js:420` (`MODELE_PAR_DEFAUT = 'norme_externe'`), `:813` (`gabaritNeuf` → `'aucune'`), posé par `grilles.js:3268`.
**Ampleur** : le stock seulement — les grilles d'avant le 4 sept., donc celles de Grégoire et des premiers testeurs, et celles qu'ils partageraient.
**Disposition proposée** : *refuser* — motif : choix assumé et écrit dans le code (« tarir n'est pas réparer ») ; la cohorte crée des critères neufs. À garder en tête si Grégoire partage une grille d'avant le 4 sept. à un·e collègue d'une autre discipline.

---

## 3 · Ce qui a été retiré depuis le 26 août — la réponse à « je croyais qu'on avait retiré »

**Retiré ou sorti du code, mesuré aujourd'hui :**
- les cinq barres SRPNF en tableau littéral, l'objet des cinq noms, et l'expression régulière qui lisait les scores dans la prose (#529) — `code-seul "rigueur|plausibilit|nuance"` ne rend plus rien dans les calculs ni l'affichage ;
- le popup d'aide « Barres SRPNF » (devenu « Barres par critère »), l'entrée « SRPNF » du glossaire (recadrée en exemple) ;
- le seuil 0,7125, cinq fois en clair (#817) → `obtenirSeuil('defiSpecifique')` ; l'échelle 0,85 / 0,75 / 0,65 de `profil-etudiant-diagnostics.js` : plus aucune occurrence ;
- le portrait confidentiel à cinq champs (#539, 1.134.0) ;
- « erreurs de français » et ses six variantes, dont celle du PDF (#581) → registre `evaluation-enonces.js`, modèle « générique » pour tout critère qui ne dit pas « français » ;
- la formule (#667) et la projection (#668) → registres réglables ; les sigles « SA » / « CAF » → « Services adaptés du collège », « Centre d'aide du collège » ;
- la moyenne en langue qui pilotait les cibles d'intervention (#552, #535, #537) ;
- les dix codes d'annotation « de français » → les sous-critères de la grille, par geste (3 sept.) ;
- les deux libellés divergents de I (« Incomplet » / « Insuffisant ») : les deux replis disent « Incomplet ».

**Pas retiré, sans effet visible (famille 1 ou 2) :**
- `copierCriteresSRPN` / `copierCriteresSRPNF` — `evaluation.js:3077`, `:3101` : présents, aucun appelant (seul un test les nomme) ;
- trois `facteurNormalisation || 500` — `evaluation-chargement.js:1014`, `:1244`, `evaluation-calcul.js:1663` : même valeur que le défaut du registre ;
- deux replis de niveaux I-D-M-E quand l'échelle est introuvable — `evaluation.js:1066`, `evaluation-chargement.js:1232` ;
- `francaisMoyen` de `pratique-pan-standards.js:1169-1192` : calculé, passé en paramètre, **jamais lu** ; et `genererCibleIntervention` des pratiques (« Viser l'excellence (niveau E) », ressources) n'a d'appelant que `pratique-test.js` ;
- `afficherConfigurationCategoriesErreurs` (`grilles.js:5466`) et l'export « recherche » (`trimestres.js:2622-2656`, compte `nb_I`…`nb_E`) : exportés, aucun appelant.

**Pas retiré, avec effet** : F3-1 (#553), F3-2 (#716), F3-3 (#677).

**Noms propres** (hors pack de démonstration et changelog) — ce qui atteint l'écran, les données ou un calcul :

| Mot | Fichiers | Lignes | Hors commentaire | Dont atteint l'écran, les données ou un calcul |
|---|---|---|---|---|
| Grégoire | 114 | 567 | 7 | 2 exemples de saisie ; 1 table de migration qui n'agit que si l'auteur d'une pratique est « Grégoire Bédard » (`pratiques.js:439`) ; 1 attribution de source dans un guide (« données recueillies par Grégoire Bédard à l'automne 2025 ») ; 3 commentaires HTML invisibles |
| Bédard | 20 | 24 | 3 | les mêmes |
| 601-101 | 19 | 48 | 4 | 2 exemples de saisie ; 2 replis du cours de DÉMONSTRATION (`trimestres.js:632`, `:634`) |
| EUF | 5 | 24 | 13 | le modèle réglable « Projection à l'EUF » (voir F4-2) ; 1 exemple de saisie |

---

## 4 · Famille 2 — la pratique de Grégoire comme point de départ réglable

| Trace | Où ça se règle |
|---|---|
| Phrases d'un critère algorithmique | gabarit de la grille, modèle d'énoncés et textes libres |
| Projection (« norme externe », EUF 900 / 30) | gabarit de la grille, modèle de projection |
| Formule et longueur de référence 500 | gabarit de la grille, formule |
| Dix codes d'annotation et leurs rétroactions | Annoter › palette, ou les sous-critères de la grille |
| Onze sous-critères par défaut | bouton, puis chaque ligne est modifiable (voir F3-5 pour son libellé) |
| Seuils `defiSpecifique`, `idme.*` | réglages d'interprétation (`obtenirSeuil`) |
| Gabarits de pratiques (« PAN-Standards (IDME + SRPNF) », auteur « Labo Codex ») | bibliothèque de pratiques, présentés comme modèles |
| Une vingtaine d'exemples de saisie (« Ex : Cégep de Drummondville », « Ex : Littérature, Philosophie »…) | texte d'exemple, s'efface à la saisie |
| Replis I-D-M-E quand l'échelle manque | chemin de repli, pas nominal |

---

## 5 · Ce que l'audit n'a pas mesuré

- **Aucun écran n'a été ouvert dans un navigateur.** Les bancs exercent les fonctions de calcul ; ce que dessine le profil pour le cas 3 reste à voir à l'écran (la sonde WebKit du 17 sept. a montré qu'un constat sur la fonction peut différer de l'écran).
- **F3-2 (#716) n'a pas été rejoué par un banc** : lecture et `grep` seulement, comme au 5 sept.
- **Aucune donnée réelle lue.** En particulier : combien d'interventions enregistrées portent la clé `francais` dans leur stock, et si le critère de langue de Grégoire cet automne s'appelle bien « Français… ».
- **L'aide d'`index.html`** n'a été fouillée que par mots (SRPNF, noms de critères), pas relue en entier ; **`styles.css`** n'a pas été balayé.
- **Le pack de démonstration, ses gabarits, `changelog-data.js` et les tests** sont exclus, comme demandé. Je n'ai pas vérifié que le pack « se présente comme un exemple ».
- **La composition de la cohorte** (disciplines, établissements) : elle décide de F3-4 et du tri de #716, et l'audit ne la connaît pas.
- Le balayage large cherche des mots et des symboles ; un littéral pédagogique qui ne ressemble à aucun de ces motifs lui échappe.

**Outils** (jetables, hors dépôt) : deux scripts de grep hors commentaires et un banc Vitest de quatre cas, écrit sous `tests/unit/`, exécuté, puis retiré avant le commit.

▣ Statut de ces lectures : des mesures reproductibles, pas un avis de pair. Les dispositions sont des propositions.
