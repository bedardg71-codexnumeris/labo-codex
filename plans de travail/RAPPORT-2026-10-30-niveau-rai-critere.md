# Rapport – Le niveau RàI au critère (lot 3 des seuils)

> Claude Code, 30 oct. 2026. Consigne : `CONSIGNE-LOT-2026-10-30-niveau-rai-critere.md`, § 1, § 2, § 3 bis, § 4. Pour relecture de Cowork. Pas de release, pas de push.

## Le modèle tel que codé (pour la section de l'Aide)

- **Ligne** (`ligneDeReussite`) : le repère de suffisance de l'échelle des copies ; sinon `NOTE_DE_PASSAGE`, y compris quand l'échelle ne porte que la maîtrise.
- **Note** (`_noteProvisoireAffichee`) : P ; aucune si la note n'est pas constructible, si l'élève n'a aucune copie chiffrée, ou sous le minimum de la pratique.
- **Note présente** : sous la ligne avec un critère de `criteresSuiviFondations` sous la ligne, niveau 3 ; sous la ligne, niveau 2 ; « Difficulté persistante », niveau 2 ; le reste, niveau 1. Le signalement ne fixe plus rien.
- **Note absente** : diagnostic réglé à 3, niveau 3 ; « Difficulté persistante », niveau 2 ; diagnostic réglé à 2, niveau 2 ; le reste, **« En attente » (niveau 0), pas le niveau 1**.
- **Toujours** : présent·e, sans copie, groupe jugeable : « Non-participation », niveau 3.
- **Phrase du groupe** (`signauxDeGroupeDepistage`) : la moyenne des notes affichées des élèves non exclus, par groupe à l'écran, sous la ligne. Aucun effectif minimum. Elle ne touche aucun niveau.

## Suppositions tranchées

1. **Le minimum n'existe qu'en standards** (`portfolio.actif !== false`, `minimumCompletion || 3`, compte de la colonne « ≥ Min. »). Une sommative, des spécifications ou une dénotation lisent la note dès la première copie, donc **le niveau 3 peut y arriver à la première copie**. Motif : leurs productions ne sont souvent pas des « Artefact », et le compte les laisserait sous le minimum tout le trimestre.
2. **« Première note provisoire » pour le diagnostic = la note affichée**, pas `noteConstructible` (vrai dès la première copie). C'est la lecture cohérente avec 1 C. Le script de mesure faisait jouer le diagnostic aussi après la note ; le code suit le § 2.
3. **Plusieurs signalements** : le niveau le plus haut parmi ceux que garde `pourEleve`, qui dédoublonne par phrase, la copie la plus récente l'emportant.
4. **Un palier coché sans phrase ne fixe rien** : il ne lève déjà aucun signalement (#790).
5. **Décocher un palier reprend son niveau** ; recocher repart sans niveau.
6. **Sans pratique assignée** : pas de note, donc « En attente », persistante ou non-participation (sentinelle I3 réécrite).
7. **La barre RàI compte tout le groupe**, « En attente » compris, et la phrase ajoute « N étudiant·es en attente de leur note provisoire ». Sinon 4 élèves à niveau sur 25 feraient « 100 % ». Conséquence de ce lot, donc dans ce lot.

## Vérifié comment

- **Vitest** : 854 fichiers, 10 437 verts. Sentinelle neuve : `tests/unit/sentinelle-niveau-au-critere-2026-10-30.test.js` ; elle remplace celle du lot 2.
- **Break-tests** : 35 mutations, 34 rouges, journal en fin de sentinelle. Un mutant équivalent, nommé (lire le diagnostic après la note : la règle l'ignore déjà).
- **WebKit** : `critere-algorithmique-table-de-cas` (menu du palier : apparaît sans valeur, enregistre 3, décocher le retire, recocher repart vide), `texte-troue-paliers-projection`, `profil-etudiant-chargement`, `aide-forme-1152` : 12 verts, 1 sauté (captures sur demande).
- **Capture du menu**, clair et sombre : lisible, cible de 44 px.
- **Témoin sur le corpus** : `niveau-rai-critere.mjs` sur `a8bf7778`, codex SHA-256 `e0b3a87b672a1852d2b00ce859a58be38aec521761c45a44d0ce5458c939fdd7`, 0 erreur de page : le code rend le modèle décidé, écart 0 à toutes les dates des trois trimestres.
- **Non éprouvés** : la suite Playwright complète, Safari hors banc, iPad, Chrome. Aucune mise en ligne.

## Source et stock

La source change. Le stock reste, et rien n'est écrit dans les données : le cache `indicesPatternsRaI` d'un trimestre garde l'ancien niveau jusqu'à son prochain calcul, et le registre longitudinal lit ce cache par trimestre ; les interventions gardent leur niveau d'alors ; un palier déjà coché reste sans niveau jusqu'au choix de l'enseignant·e.

## Les textes de Cowork (`TEXTES-2026-10-30-aide-rai-niveau-critere.md`) : validés, puis intégrés

**Validés** par Grégoire le 30 oct. (16 h 07), **intégrés** dans `index.html` : la carte « La Réponse à l'Intervention (RàI) » entière et les deux changements de « Repérer les patterns de progression ». Comparaison par script au fichier des textes, entités ramenées : 10 paragraphes sur 10 et les 2 changements identiques, la ligne du niveau 1 comparée à sa décision ci-dessous.

Les trois écarts relevés, et ce qu'ils sont devenus :

1. **« Niveau 1 : tous les autres »** : décision de Grégoire, option A. La ligne est maintenant « **Niveau 1 (Universel)** : tous les autres, une fois la note du cours affichée. Avant, sans ces signaux, le niveau reste « En attente ». » Le § 3 bis tient, le code ne change pas. Le fichier des textes de Cowork garde son ancienne ligne : non touché.
2. **« l'écran écrit « — » »** : phrase gardée, code inchangé, inscrit au backlog comme écart connu, sans cas vécu (**#1203**), sur décision de Grégoire.
3. **`index.html:10881`** : la phrase de remplacement est retenue, mot pour mot. Relue entière : « Ce diagnostic nomme la cible de l'intervention ; il ne fixe pas le niveau RàI (voir « La Réponse à l'Intervention (RàI) »). Quand les deux vues divergent, c'est un signal pour ton jugement. » Elle tient ; rien d'ajusté. **La dernière phrase de « Repérer les patterns »** (« Tant que rien n'est jugeable… ») reste telle quelle : elle demeure vraie et personne ne l'a changée ; elle ne couvre pas l'attente sous le minimum, que dit maintenant la ligne du niveau 1.

**Ce que la carte ne dit plus**, par le remplacement validé : la fenêtre du pattern (3 par défaut, toujours dite au Suivi de l'apprentissage) et les critères qu'il lit (toujours dits par la bulle et le glossaire).

**Vérifié comment** : Vitest entier vert (854 fichiers, 10 442) ; garde neuve dans `sentinelle-niveau-au-critere-2026-10-30.test.js` ; 7 mutations de l'Aide, chacune rouge sur 1 test, `index.html` restauré à l'identique (empreinte comparée). Deux gardes anciennes réécrites, car elles citaient l'ancienne Aide (`sentinelle-aide-2026-10-28-lot-2c-bis`, `sentinelle-audit-aide-15-oct`) ; le plancher des renvois du Suivi passe de 6 à 5.

**Non éprouvés** : la suite Playwright complète, exigée par Grégoire avant toute release ; **Safari hors banc et l'iPad**. L'Aide n'a été rendue dans aucun navigateur : ses gardes lisent le source.

## Mots à valider (aucun n'est validé)

⚠ Ils portent presque tous « note provisoire », que Grégoire vient de réserver aux pratiques alternatives (en-tête des textes de l'Aide) ; en sommative, l'écran dirait donc un mot que l'Aide évite. Inchangés : c'est aux mots à valider de le trancher.

| Où | Mots |
|---|---|
| Carte du profil, sous le niveau (`DESCRIPTION_DU_MOTIF`) | Note provisoire sous le seuil minimal de réussite, avec une difficulté sur un critère de fondation. · Note provisoire sous le seuil minimal de réussite. · Note provisoire au seuil minimal de réussite ou au-dessus, mais ses derniers résultats sont sous ce seuil. · Ses derniers résultats sont sous le seuil minimal de réussite. La note provisoire ne s'affiche pas encore. · Signalement de la production diagnostique : il fixe le niveau jusqu'à la première note provisoire. · Note provisoire au seuil minimal de réussite ou au-dessus. Suivi régulier en classe. · La note provisoire ne s'affiche pas encore : le niveau l'attend. |
| Éditeur du palier | Niveau RàI que ce palier fixe · Aucun : le signalement reste à côté · Niveau 2 – Préventif · Niveau 3 – Intensif · Jusqu'à la première note provisoire. Ensuite, la note et la trajectoire décident, et le signalement reste affiché. |
| Sous la barre RàI | La moyenne des notes provisoires du groupe (x) est sous le seuil minimal de réussite (y) : c'est l'enseignement universel qu'il faut renforcer, pour tous. · N étudiant·es en attente de leur note provisoire. · 1 étudiant·e en attente de sa note provisoire. |
| Cible d'intervention | Signalement diagnostique |
| Bulles, glossaire, fenêtres d'aide, guide RàI | `accompagnement-contenu-hover.js` (`tdb-rai` et la bulle voisine), `-popup.js` (trois listes), `-terme.js` (niveau RàI), `guides-pedagogiques.js` (les deux paragraphes « Dans Labo Codex ») : réécrits pour ne plus décrire l'ancien modèle |

## Questions 2 à 5 du lot 2

**Leur énoncé n'est nulle part dans le dépôt** (seulement des renvois) : je ne peux pas dire lesquelles tombent. Seule certitude : la paire « niveau 1 / Difficulté persistante » (L2-2) est caduque, « persistante » donne maintenant au moins le niveau 2. Cowork a l'énoncé ou sait où il est.

## Trouvailles

- **Inscrit (#1203)** : l'écart du « — » entre le profil et le niveau.
- **Classé, rien à corriger (Grégoire, 30 oct.)** : le palier « lève un signalement » sur G5M et non sur G1A est voulu. La grille à 5 critères localise les difficultés dès le premier artefact ; G1A, à un seul critère (français écrit), sert au texte diagnostique avant le premier artefact. La configuration reste telle quelle ; la mesure demandée puis annulée n'a pas de suite et son script n'est pas conservé.
- **Inscrit ici, à l'attention de Grégoire, rien de corrigé** : sur le codex du 30 oct. (`e0b3a87b…`, code `086f60f8`), le critère « Français écrit » de G5M a le palier « Échec » coché et sa phrase « Ce que le signalement affiche à l'enseignant » vide. Le code ne lève rien sans cette phrase (`js/entites/signalement-depistage.js:96-98`, #790). Lu lors de la mesure annulée ; aucune écriture dans ses données.
- **Inscrit ici, non vérifié sur les données, rien de corrigé** : `js/entites/signalement-depistage.js:84` ne lit que `totalErreurs`, mais la saisie du nombre d'erreurs écrit `erreurs` (`js/evaluation-calcul.js:147`, `:1036`) ; seul le mode des codes écrit `totalErreurs` (`:827-833`). `calculer` ramène alors le compte absent à 0 (`js/evaluation-projection.js:665`) : une telle copie tombe à « sans erreur » et ne lève jamais de signalement, même avec la phrase. Le banc de #790 ne monte que le mode des codes. C'est une lecture du code ; la mesure qui l'aurait éprouvée est annulée.
