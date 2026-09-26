# Consigne du jour – inventaire : où l'application enregistre-t-elle toute seule, où faut-il enregistrer, et l'écran le dit-il ?

> Écrite le 26 septembre 2026, vers 11 h 20 (Toronto), par Cowork, sur `main` = `origin/main` = `8ab1b416` (1.159.12 en ligne). La précédente (#953) est archivée sous `plans de travail/_ancienne-CONSIGNE-DU-JOUR-2026-09-26-lot-953.md` (déplacée par Cowork, à commiter).
> **AUCUN CHANGEMENT DE CODE.** C'est un inventaire. Le seul livrable est un fichier de `plans de travail/`. Des scripts ou bancs de mesure temporaires sont permis ; ils ne sont pas commités.

## 0 · Avant tout : le bloc 1.159.12 d'`OU-EN-EST-ON.md`

Chaque version livrée y a son bloc (1.159.10 en a un pour « pér. »). Écris celui de 1.159.12 (#953), au format des précédents : « Ce que tu verras », « Vérifié comment », « Tes données ». Commit à part.

## 1 · Pourquoi cet inventaire (Grégoire, 26 sept., vers 11 h 15)

Des usagers lui ont dit qu'ils croyaient devoir enregistrer eux-mêmes alors que l'application enregistrait déjà. Les écrans mélangent « Enregistré », des boutons « Enregistrer », des mentions d'enregistrement automatique, sans qu'on sache lequel dit vrai, ni où. **Sa règle** : par défaut, tout s'enregistre tout seul, tout le temps, et l'écran le dit de la même façon partout ; là où c'est à l'usager d'enregistrer, il doit le savoir sans ambiguïté.

L'inventaire lui servira à trancher, écran par écran : ce qui est manuel devient-il automatique, ou reste-t-il manuel mais clairement signalé ? **Ne propose pas de décision à sa place** : décris, mesure, et signale ce qui est ambigu ou faux. Une recommandation de ta part est bienvenue, mais séparée du constat.

## 2 · Ce que Cowork a relevé (grep sur `8ab1b416`, non exécuté – point de départ, pas une liste close)

- `sauvegarderDonneesSelonMode` (`js/modes.js` l. 848) : **33 appels** dans 12 fichiers (`evaluation.js`, `evaluation-chargement.js`, `evaluation-sauvegarde.js`, `evaluation-jetons.js`, `liste-evaluations.js`, `saisie-presences.js`, `travaux-ui.js`, `groupe.js`, `indices.js`, `migrations.js`, `migration-diagnostic.js`, `modes.js`). Elle rend `true`, `false` (écriture bloquée, anonymisation), `'quota'` ou `'error'` ; #618 et #786 disent que la plupart des appelants lisent les deux chaînes comme un succès. **Ces deux fiches font partie de l'inventaire** : pour chaque appelant, que dit l'écran quand l'écriture échoue ?
- Beaucoup d'écritures passent ailleurs (`db.setSync`, `db.modifier`, `db.set`…) : l'inventaire part des GESTES, pas de cette seule fonction.
- Libellés : « enregistré(e) » ≈ 170 occurrences, « non enregistrée » ≈ 20 (l'évaluation d'une copie, depuis 1.151.0), « enregistrement automatique » dans les cartouches (#573, `js/cartouches.js` ≈ l. 881-900), « sauvegardé automatiquement » dans les Préférences (`index.html` ≈ l. 11235) et « n'est pas sauvegardé automatiquement » pour le rapport d'élève (`js/profil-etudiant-rapport.js` l. 196). Neuf boutons « Enregistrer » nus dans `index.html`, plus « Enregistrer la grille », « Enregistrer sous », « Enregistrer les réglages ».
- ⚠ **Fausse piste** : « AUTO-ENREGISTREMENT » dans `js/pratiques/*.js` et `bilan-reflexif.js` désigne l'inscription d'un module dans un registre, pas l'enregistrement de données. Hors sujet.
- ⚠ **Hypothèse de Cowork, à vérifier** : le mot « enregistrer » a au moins **trois sens** pour l'usager : (a) écrire dans le navigateur ; (b) « Enregistrer le codex », écrire un fichier sur le disque ou la clé USB (un vrai geste manuel : « Avant de partir, enregistre le codex sur ta clé USB ») ; (c) verser à la Réserve. La confusion des usagers pourrait venir de (a) contre (b). Dis si la mesure le confirme ou non.

## 3 · Ce qui est attendu : `plans de travail/INVENTAIRE-ENREGISTREMENT-2026-09-26.md`

**Partie 1 – pour Grégoire, en gestes d'usager, sans nom de fichier ni de fonction** (les numéros de fiche seulement entre parenthèses, en fin de ligne). Un tableau par grande zone (Cadre : trimestre, horaire, groupes, élèves ; Conception : grilles, échelles, cartouches, pratiques, productions ; Alignement ; Évaluer : copie, visionneuse, annotation ; Liste des évaluations ; Présences ; Interventions et rencontres ; Profil de l'élève ; Réglages et préférences ; Codex ; Réserve ; tout autre écran que tu trouves). Colonnes :

1. **Le geste** (ex. « modifier le nom d'un critère dans une grille »).
2. **Comment ça s'enregistre** : automatique (à chaque frappe, à la sortie du champ, après un délai) ou manuel (quel bouton).
3. **Ce que l'écran dit**, mot pour mot, et quand (pendant, après, jamais).
4. **Si c'est manuel : que se passe-t-il si on quitte sans enregistrer** (avertissement, perte silencieuse, brouillon gardé ?).
5. **Si l'écriture échoue** (mémoire pleine, anonymisation) : ce que l'écran dit.
6. **Verdict** : clair / ambigu / ment. Une ligne de motif pour chaque « ambigu » et « ment ».

Puis : **les sens du mot « enregistrer »** (§ 2, hypothèse) et **une synthèse en cinq lignes au plus** : combien d'écrans automatiques, combien de manuels, combien d'ambigus, combien qui mentent, et les trois qui te semblent les plus susceptibles d'expliquer ce que les usagers ont dit.

**Partie 2 – annexe technique**, pour la session qui corrigera : fichier, ligne, mécanisme d'écriture, preuve (commande ou banc et son résultat).

## 4 · Méthode

- **Mesure au navigateur pour ce que l'écran dit** (WebKit) ; lecture de code pour le mécanisme. Écris pour chaque ligne si elle est `[exécuté]` ou `[lu]`.
- L'échec d'écriture se simule dans un banc temporaire (quota plein, mode anonymisation) ; ne le commite pas.
- **Parallélise la lecture** : des sous-agents en lecture seule, un par zone, c'est le bon usage ici. Une seule session lance les bancs.
- Aucun nom d'élève réel, nulle part (règle de Grégoire du 22 sept.) : données fictives du banc seulement.

## 5 · Livraison

- Commit du fichier d'inventaire (et du bloc d'`OU-EN-EST-ON.md`, à part), push. Pas de release : rien ne change dans l'application.
- Puis arrête-toi : **Grégoire tranchera à partir de la Partie 1**, avec Cowork. Les correctifs (dont #618 et #786) viendront après, dans des lots séparés.
