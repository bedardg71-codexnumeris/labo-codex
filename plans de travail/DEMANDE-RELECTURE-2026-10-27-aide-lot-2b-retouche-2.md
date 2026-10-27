# Demande de relecture – L'Aide, lot 2b, la seconde retouche (#1152)

> Claude Code, mardi 27 octobre 2026, 18 h 52, sur `main`. Verdict : `VERDICT-RELECTURE-2026-10-27-aide-lot-2b-retouche.md` (18 h 37, avec les mots de Grégoire de 18 h 38). Commit du code : `9b55e8ec`. Rien n'est poussé : 11 commits locaux d'avance sur `origin/main`, et 12 avec celui des docs.

## En bref

- **Les cinq points sont faits**, chacun avec un essai qui rougit sans son correctif. Le banc compte 8 essais et 6 mutations, qui ont toutes rougi. Les fichiers ont été restaurés par copie et leurs empreintes vérifiées.
- **La spec PS va de bout en bout** sur la Cartouche de départ d'un trimestre neuf. Au formulaire, le geste réel du menu montre le commentaire PS de chaque critère. Le PDF porte ces quatre commentaires. Sans le correctif de la cartouche, ses deux essais rougissent.
- **Ce qui n'est pas dans la retouche est inscrit** : deux sites à #551, un commentaire au code sur l'arrondi, trois textes ajoutés à la remesure.
- **Tests** :
  - Vitest complet : 836 fichiers, **9 983 essais sur 9 983** ;
  - Playwright ciblé (WebKit) : **17 réussis**, soit la spec PS plus cinq specs voisines (cartouches par trimestre, bilan du tableau de bord, lecture brute des travaux, élève supprimé, triptyque semé).
  - Le verdict complet n'est pas rendu, et il n'y a pas de release.

## Les cinq points

1. **L'export anonymisé** (`js/trimestres.js`, `calculerPerformanceParCritere`) : `nb_PS` est ajouté devant `nb_I`, et `taux_maitrise` reste (M + E) / total.
   - **Qui lit ce fichier, mesuré** : personne dans l'app. Un `grep` de `performance_par_critere`, `nb_I` et `taux_maitrise` sur `js/` et `index.html` ne rend que l'écrivain. Le fichier sert à la recherche.
   - **Un lecteur qui attend les quatre comptes** continue de marcher : la clé est additive.
   - **Un fichier déjà exporté ne change pas** : il n'a simplement pas la clé.
   - **Supposé** : `version_format` passe de 1.2 à 1.3, comme pour les deux ajouts additifs précédents (#902, #913). Les quatre assertions de `sentinelle-902` et de `sentinelle-913` suivent.
2. **La Cartouche de départ** (`js/cartouches.js`) :
   - `{ code: 'PS', nom: 'Préstructurel' }` est en tête des niveaux ;
   - les quatre `CR_…_PS` sont les mots de Grégoire, mot pour mot, avec les apostrophes des commentaires voisins (`\'`) ;
   - la matrice est pleine, avec vingt commentaires ;
   - la bibliothèque lit `cartouche.niveaux` (`cartouches.js:3803`) : elle dira « Niveaux : PS · I · D · M · E » pour une cartouche semée après ce commit. C'est inféré à la lecture : l'essai vérifie les niveaux, pas la phrase.
   - **Stock** : une cartouche de départ déjà semée garde ses niveaux et ses seize commentaires. Un essai le prouve.
3. **Le message « en difficulté »** (`js/tableau-bord-apercu.js`) compte PS et I ensemble, avec `['PS', 'I'].flatMap(…)`. La première écriture (`…(parNiveau['PS'] || [])`) faisait monter `genererInterpretationPerformance` de 15 à 16 et rougir le cliquet de complexité (446) ; la seconde le laisse à 15.
4. **Le zéro** (`js/travaux-ui.js`) : `noteFinale ?? note`. L'essai passe par le vrai `supprimerFichierImporte` avec une évaluation à 0 : la question dit « 0 % ». Le commentaire est posé au-dessus du bloc, parce que `sentinelle-1007` lit le texte exact de la question.
5. **La couleur** :
   - `'var(--gris-moyen)': '#8aa4b0'` dans la table de `hexVersRgba` (`js/graphiques-progression.js`). C'est la valeur de `:root`, comme les voisines, qui sont des valeurs fixes.
   - La règle `.apercu-niveau-PS, .apercu-niveau-ps { color: var(--gris-moyen) }` est dans `styles.css`. Elle suit les deux modes, contrairement aux quatre voisines, qui sont en hexadécimal fixe.

Le hook anti-cache a fait poser les jetons `?v=` des huit fichiers touchés (`index.html`).

## Ce qui n'est pas dans cette retouche

- **#551** : les deux sites (`js/profil-etudiant-helpers.js:203-218`, `js/interventions.js:1194-1197`) sont ajoutés à sa fiche, dans `BACKLOG.md`.
- **L'arrondi à 39,5 %** (issue 3) : un commentaire est posé dans `niveauDuPourcentage` (`js/evaluation-calcul.js`) et dans `situerPourcentageDansEchelle` (`js/profil-etudiant-helpers.js`). Les deux fonctions ne sont pas alignées.
- **Les textes « quatre niveaux »** sont ajoutés à `audit-aide-2026-10-24/REMESURE-2026-10-27.md` :
  - `rai-solo` (`index.html:12173`) dans une section « Labo » neuve, la remesure n'en ayant pas ;
  - `glossaire-statique` (`index.html:12670`) et le terme « Échelle de performance » (`js/accompagnement-contenu-terme.js:115`) sous « Référence », avec le lot du glossaire.

## Trouvailles

- **Issue 3, nommée, non touchée** : `niveauVersScore`, dans `calculerPerformanceParCritere`, n'a aucun lecteur. C'est du code étranger au lot.

## Ce qui reste à Grégoire

- Aucun mot neuf. Les quatre commentaires PS sont les siens, et ils sont posés tels quels.
- Le push des 12 commits locaux attend son signal, comme le verdict le demande.
