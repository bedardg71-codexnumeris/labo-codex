# Verdict de relecture – L'Aide, lot 2b, la retouche (#1152)

> Cowork, mardi 27 octobre 2026, 18 h 37 (Toronto, mesuré par `date`), sur `main` = `f78045a9`. Lu : les deux demandes de relecture de la retouche, le diff d'`index.html` (`0eff1eaa`, `e316b1bc`), le diff de `js/echelles.js` et de `js/guides-pedagogiques.js` (`87b35ccf`, `e316b1bc`). Le niveau PS éprouvé par une lecture indépendante de tout ce qui lit une échelle (la RàI, le dépistage, le profil, le tableau de bord, les exports, les cartouches, le PDF, les graphiques) ; ses trois constats graves revérifiés par Cowork au code.

## Verdict

- **L'Aide** (`0eff1eaa` et la part Aide d'`e316b1bc`) : **acceptée sans retouche**. Les corrections du § 1 et les réponses de Grégoire sont posées comme le verdict les dit ; « PS – Préstructurel » est dans les deux tableaux de `solo`.
- **Les valeurs 40 / 65 / 75 / 100** (`87b35ccf`) : **acceptées sans retouche**. Seul le semis lit `niveauxDefaut` ; le stock ne bouge pas (essai).
- **Le niveau PS** (`e316b1bc`) : **accepté, avec une seconde retouche**. PS entre dans l'échelle de départ, mais pas encore dans tout ce qui la lit : ce n'est pas une trouvaille, c'est le lot qui n'est pas fini (CLAUDE.md, « est-ce que je viens de l'écrire ? »). Aucune confusion entre PS et le « 0 » du non recevable ; dans la RàI, les patterns, les défis, le Comparateur, le PDF et la rétroaction par rang, PS est le niveau le plus bas et sa valeur 0 est gardée.

## La seconde retouche (Claude Code)

1. **L'export anonymisé** (`js/trimestres.js:2599-2611`) : une copie PS compte dans `nb_evaluations` et dans le dénominateur de `taux_maitrise`, dans aucun des comptes `nb_I` à `nb_E`. Ajoute `nb_PS`. **Mesure d'abord** qui lit ce fichier (import, suivi longitudinal, autre) : un lecteur qui attend les quatre comptes doit continuer de marcher. C'est un format qui voyage : dis ce qui change pour un fichier déjà exporté (rien, s'il est seulement lu).
2. **La « Cartouche de départ »** (`js/cartouches.js:158-195`) : semée avec les niveaux I, D, M, E. Une copie PS n'y trouve aucune colonne ni aucun commentaire (formulaire et PDF vides), sa matrice dit « 16 sur 16 », sa bibliothèque « Niveaux : I · D · M · E ». Ajoute en tête `{ code: 'PS', nom: 'Préstructurel' }` et les quatre commentaires `CR_…_PS` **dans les mots de Grégoire** (§ ci-dessous ; **ne lance pas ce point avant qu'ils y soient**). Le stock ne bouge pas : une cartouche de départ déjà semée garde ses seize commentaires (essai, comme pour l'échelle).
3. **Le message « en difficulté » du tableau de bord** (`js/tableau-bord-apercu.js:854-866`) ne lit que `parNiveau['I']` : les étudiant·es PS en disparaissent, alors qu'ils y étaient (au niveau I) avant `e316b1bc`. Décidé par Cowork : le message compte PS et I ensemble.
4. **Le zéro** (`js/travaux-ui.js:3872`) : `noteFinale || note` annonce « --% » pour une copie à 0 ; avec PS, une note de 0 devient courante. Le zéro est une valeur.
5. **La couleur de PS** : `--gris-moyen` manque à la table des couleurs des graphiques de progression (`js/graphiques-progression.js:282-291` : la zone PS sort #888888) et la classe `apercu-niveau-PS` n'a pas de règle (`styles.css`, vers les l. 15307-15330 : le code PS de l'aperçu PDF sort sans couleur). Ajoute les deux.

Pour chaque point, un essai qui rougit sans le correctif ; la spec PS du lot passe une copie PS de bout en bout avec la cartouche de départ d'un trimestre neuf.

**Pas dans cette retouche** :
- le bilan d'une intervention situe un pourcentage par la table fixe 64 / 75 / 85 (`js/profil-etudiant-helpers.js:203-218`, appelée par `js/interventions.js:1194-1197`) : une moyenne de 30 % s'y lit « I », l'échelle dit PS ; et l'objectif proposé à un sous-groupe PS est « 64 % ». C'est la question des bornes fixes de la RàI, qui attend Grégoire (D3, #551) : ajoute ces deux sites à la note de #551 ;
- l'arrondi différent de `niveauDuPourcentage` et de `situerPourcentageDansEchelle` (39,5 % : I d'un côté, PS de l'autre) existait déjà à chaque borne : issue 3, un commentaire au code ;
- les textes qui disent encore « quatre niveaux » ou « I < 65 % » : `js/accompagnement-contenu-terme.js:115` (glossaire, lot 3), `index.html:12173` et `12670` (lots 2c et 2d) ; ajoute-les à la remesure du 27 oct., section de leur partie.

## Les mots de Grégoire pour la cartouche de départ

**Validés par Grégoire le 27 oct. 2026 à 18 h 38** (« je les garde »), sur la proposition de Cowork de 18 h 37, mot pour mot :

- `CR_COMPREHENSION_PS` : « La réponse ne traite pas encore du sujet demandé. Relis la consigne et repère ce qu'elle te demande. »
- `CR_APPLICATION_PS` : « Les connaissances ne sont pas encore appliquées à la tâche demandée. Repars d'un exemple vu en classe. »
- `CR_ANALYSE_PS` : « Aucun élément de l'analyse demandée n'est encore présent. Commence par nommer les éléments à examiner. »
- `CR_SYNTHESE_PS` : « La synthèse demandée n'est pas encore amorcée. Commence par dégager l'idée principale. »

Apostrophes : celles des commentaires voisins du même fichier.

## Clôture

- Un commit pour le code, un pour les docs ; pas de release, de verdict ni de push sans le signal de Grégoire.
- Demande de relecture : `plans de travail/DEMANDE-RELECTURE-2026-10-27-aide-lot-2b-retouche-2.md`.
