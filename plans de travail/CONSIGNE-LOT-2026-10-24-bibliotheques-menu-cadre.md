# Consigne – Le Cadre : la rangée de sélection en tête des six accordéons du Trimestre (lot 2, #1148)

> Écrite par Cowork le samedi 24 octobre 2026 à 13 h 50 (Toronto), sur `main` = `890bcc09` (lot 1 accepté, non poussé). Plan : `PLAN-2026-10-24-bibliotheques-chaines-critere-algo.md` (lot 2 sur 4). Modèle : ce que le lot 1 a livré dans la Conception (`.rangee-selection`, `js/menu-selection.js`) et la maquette validée par Grégoire (https://claude.ai/artifact/VXgfAqHD1Aose5nnF9rLbX, version « Menu déroulant »).

## 0. Avant tout

- **Ce lot passe après le verdict complet et le push de ce qui est sur `main`**, si Grégoire t'en a donné le signal dans le même message. Sinon, il part de `main` tel quel.
- Rituel de début de session. Aucune suite en arrière-plan.
- Un commit de docs seul, fichiers nommés : ce fichier, la ligne du plan, et `VERDICT-RELECTURE-2026-10-24-codex-a-part-et-aide-apercu.md` (le verdict de Cowork du lot de ce matin, resté non suivi).

## 1. Ce que le lot livre, en gestes

Dans **Cadre › Trimestre**, les six accordéons (Trimestre, Cours, Enseignant·e, Étudiant·es, Horaire, Groupe-cours) perdent leur colonne de gauche (`disposition-bibliotheque-formulaire` / `panneau-bibliotheque`). En tête de chacun, **la rangée du lot 1** :

- « **Consulter la bibliothèque** » (Trimestre, Cours, Groupe-cours) : le même bouton que la Conception, bouton principal, sans icône. Il remplace « Bibliothèque » avec icône.
- le **menu** de l'accordéon (`#selectTrimestreActif`, `#v2-selectCours`, `#v2-selectEnseignant`, `#v2-selectGroupe`, `#v2-selectHoraire`, `#v2-selectGroupeCours`), à 44 px, de la même apparence que celui du lot 1 ;
- « **+ Nouveau …** » poussé à droite, avec ses mots d'aujourd'hui (« + Nouveau trimestre », « + Nouveau cours », « + Nouveau profil », « + Nouveau groupe », « + Nouvel horaire », « + Nouveau groupe-cours »).

Le formulaire prend toute la largeur de l'accordéon, en dessous. La barre des étapes en haut de la page (`#barreConvergence`) ne change pas : elle est l'objet du lot 3.

## 2. Décidé par Cowork (si la mesure les contredit, dis-le plutôt que de les suivre)

1. **Le sens de chaque menu ne change pas.** Trois ne font pas qu'ouvrir une fiche : `#selectTrimestreActif` **active** un trimestre pour toute l'app (`changerTrimestreActifV2`), `#v2-selectGroupe` **filtre** la liste des élèves, `#v2-selectGroupeCours` est à mesurer. Emploie `MenuSelection` là où le menu ouvre une fiche sans autre effet ; ailleurs, garde le menu et son gestionnaire, et donne-lui seulement la place et l'apparence de la rangée. Dis, pour chacun des six, lequel des deux.
2. **Le libellé reste visible là où choisir fait autre chose qu'ouvrir une fiche** (« Trimestre actif : », « Groupe : », et le groupe-cours si la mesure le range là). Ailleurs, il passe au lecteur d'écran seul, comme au lot 1.
3. **Les cartes résumé** (aperçu du trimestre, du cours, carte du profil, résumé des élèves, de l'horaire, du groupe-cours) quittent la colonne. Là où la fiche ouverte montre déjà la même chose, elles partent. Là où elles disent ce que la fiche ne dit pas (le résumé des élèves : effectifs, groupes, programmes, SA), elles passent sous la rangée, sur toute la largeur, compactes. Dis lesquelles partent et lesquelles restent.
4. **Les actions sur la liste des élèves** (« Exporter », « Supprimer le groupe », « Vider la liste ») vont dans la rangée des actions, à droite, en tête du formulaire, comme Dupliquer, Supprimer et Fermer au lot 1. Leur comportement, leurs confirmations et leurs mots ne changent pas.
5. Le texte d'aide de l'accordéon Enseignant·e et l'« Info » du groupe-cours passent sous la rangée.
6. **Mots** : le sous-titre de la bibliothèque des groupes-cours (`js/trimestre-v2-groupes-cours.js` l. ~1084, « Gérez les groupe-cours affichés dans le dropdown de l'en-tête. ») devient « **Gère les groupes-cours affichés dans le menu de l'en-tête.** » Un `grep` des autres « Gérez » et de « barre latérale » dans les textes des trois bibliothèques du Cadre ; même traitement qu'au lot 1 (tutoiement, « ta sélection »).
7. **La Carte d'alignement** (Conception) : son couple bouton + menu prend l'apparence de la rangée (la bande bleu pâle, le menu à 44 px et son apparence). Ses gestes ne changent pas : « Actions ▾ » reste.

## 3. Où (mesuré par Cowork, à revérifier ; les numéros de ligne ont bougé au lot 1)

- `index.html` : les six `panneau-bibliotheque` (l. ~6210 Trimestre, ~6427 Cours, ~6712 Enseignant·e, ~6958 Étudiant·es, ~7140 Horaire, ~7253 Groupe-cours) ; la Carte d'alignement (`#planif-selecteur-cartes`, l. ~4278).
- JS : `js/trimestre-v2-liste.js`, `-cours.js`, `-enseignants.js`, `-etudiants.js`, `-horaires.js`, `-groupes-cours.js` (les gestionnaires nommés au § 1) ; `js/planification-carte.js` (`#planif-liste-cartes`).
- `styles.css` : `.disposition-bibliotheque-formulaire`, `.panneau-bibliotheque` (l. ~9811, ~9941) et leurs règles sous `#calendrier-trimestre` (l. ~14161, ~14270, ~14663) ; `.rangee-selection*` du lot 1 (l. ~9662) ; `#planif-selecteur-cartes #planif-liste-cartes` (l. ~22707).

## 4. Pièges connus

1. **Changer de trimestre recharge toute l'interface** : le menu du trimestre garde son gestionnaire et ce qu'il recharge. Un essai le vérifie.
2. Les identifiants des six menus servent aux essais et au code : ils ne changent pas.
3. `.disposition-bibliotheque-formulaire` et `.panneau-bibliotheque` : un `grep` avant le retrait. Ce qui n'a plus d'objet part.
4. Le menu de l'en-tête (groupe-cours) n'est pas touché.
5. iPad : 820 et 1180 px ; 44 px au doigt ; la rangée se replie sous 760 px comme au lot 1.
6. Sécurité : règles 1 et 2, comme au lot 1.
7. **Stock** : de l'affichage, aucune donnée ne change. « Vider la liste » et « Supprimer le groupe » gardent leur confirmation.

## 5. Preuve exigée

- Playwright (WebKit), pour chacun des six accordéons : la rangée (ordre, « + Nouveau … » à droite, 44 px, plus de colonne de gauche), le menu fait ce qu'il faisait (activer, filtrer, ouvrir), « + Nouveau … » ouvre la création, le formulaire prend la largeur. La Carte d'alignement : la rangée a l'apparence du lot 1 et « Actions ▾ » marche. Le sous-titre des groupes-cours lu. Break-test d'au moins un de ces essais.
- Vitest si un module change de logique (sinon, dis-le).
- Captures de la page Trimestre (accordéons Cours et Étudiant·es ouverts) à 1440, 1180 et 820 px, et de la Carte d'alignement à 1440, jointes à la demande de relecture.
- Portes terrain : skill `portes-terrain`, comme au lot 1.

## 6. Ce qui n'entre pas

Les chaînes d'étapes et leur option (lot 3), le critère algorithmique (lot 4), les tampons, l'en-tête de l'app, la barre des étapes du Trimestre.

## 7. Clôture

- #1148 cochée dans le même commit que le code.
- Demande de relecture : `DEMANDE-RELECTURE-2026-10-24-bibliotheques-menu-cadre.md`.
- Pas de release, de verdict ni de push sans le signal de Grégoire.
