# Consigne – Les retouches des lots 1 et 2 (seuils, niveau comparé au groupe)

> Cowork, vendredi 30 octobre 2026, 11 h 32 (Toronto), sur `main` = `5b154aeb` (10 commits non poussés). Sources : `VERDICT-RELECTURE-2026-10-30-seuils-une-source-lot-1.md` et `VERDICT-RELECTURE-2026-10-30-niveau-compare-au-groupe-lot-2.md`. Les numéros ci-dessous renvoient aux constats de ces deux verdicts.

## 0. Avant tout

Commite d'abord les deux verdicts, non commités (ils sont dans `plans de travail/`). Lis-les : ils portent les lignes, les scénarios et le pourquoi ; cette consigne ne dit que quoi faire.

## 1. Le lot 1, à finir

- **L1-1** Barre P de l'Aperçu : séparer « pas d'échelle unique » de « personne n'a de note ». Test du cas.
- **L1-2** Panneau des seuils : le libellé du bouton lit les défauts à la source ; les textes `index.html:8897`, `:8903` et la bulle `accompagnement-contenu-hover.js:176` ne disent plus que P suit ces seuils ni « Fragile / Acceptable / Bon ». Sentinelle sur le libellé du bouton.
- **L1-6** Pack de démo : bumper `_metadata.version` (les repères et les totems arrivent chez qui a déjà ouvert la démo).
- **L1-7** Retirer le dégradé mort de `.barre-indicateur` ; lire les repères une fois par rendu dans `etudiants.js` ; rendre `sentinelle-lot-F-860` A4 capable d'échouer.

## 2. Le lot 2, à finir

- **L2-1** Deux motifs de plus pour la carte : groupe trop petit pour comparer, au-dessus du repère de maîtrise. L'Aide dit le minimum de 5 élèves.
- **L2-3** `tableau-bord-apercu.js:838` : « progression favorable » ne compte que `pattern === 'Stable'`.
- **L2-5** Références calculées sur tout le cours, par numéro de groupe ; `indicesPatternsRaI` juste pour tous les groupes. Corriger « rien n'est écrit » au rapport.
- **L2-6** Cas de test qui départagent : écart-type n contre n−1, minimum 5 contre 6, un repère de maîtrise sur le vrai chemin (la jonction avec le lot 1), une copie remplacée, une diagnostique, une non recevable.
- **L2-7** Aligner la garde de la cible (`:2190`) sur celle de la carte ; corriger au rapport la phrase des copies toutes non remises.
- **L2-8** Encadrer les passages hors lot par `demarrerCacheLecture` / `terminerCacheLecture` ; donner un chrono avant et après.
- **L2-10** Retirer `signalGroupe`.

## 3. Les mots

Toute phrase neuve ou changée par §§ 1 et 2 entre dans la liste des mots à valider, avec celles des deux rapports. Ne pas les poser comme validées : Grégoire les reçoit un écran à la fois, après ce lot.

## 4. Décidé par Grégoire le 30 oct. à 11 h 33 : les repères dans toutes les pratiques (L1-3, L2-4)

- **Sa décision** : les repères de l'échelle des copies se lisent dans toutes les pratiques, sommative et par spécifications comprises, quand cette échelle en porte. Copies sans échelle (en points) : rien ne change, la comparaison au groupe reste seule.
- **À faire** : retirer l'exclusion par famille de `_echelleDeLaPerformance` (`js/contexte-qualification.js:160-162`). Auditer les lecteurs de `raison` (« note-chiffree », « pratique-sans-methode ») et ce qui en découle (pastille, filtre P, barre P, répartition, pattern, condition de maîtrise du niveau).
- **À ne pas toucher** : `lireEchelleNoteGlobale` et l'expression de la note du cours. La règle du 27 août tient pour la note ; elle ne régit plus les signaux.
- **Tests** : rebasculer B2, B3, C4, F1 (`audit-onglet-suivi`) et `sentinelle-lot-A-737` selon la règle, chacun avec sa décision nommée ; un cas sommatif sur le vrai chemin avec repère de maîtrise (l'élève à 80 % dans un groupe à 94 revient au niveau 1) et un sans échelle (il reste au niveau 3).
- Toute phrase de l'Aide qui disait le contraire entre dans la liste des mots à valider.

## 4 bis. En attente de Grégoire, NE PAS TOUCHER

- Niveau 1 avec « Difficulté persistante » (L2-2), avec les questions 2 à 5 du lot 2.

## 5. Inscrire

- Le défi principal sans `echapperHtml` (`profil-etudiant-sections-affichage.js:1235`), issue 2.
- L1-4, L1-5 et `SEUIL_POINTS_PRIORITE` (verdict du lot 1), issue 2, s'ils ne le sont pas déjà.

## 6. Fin

Commit, Vitest entier, specs WebKit touchées ; pas de push, pas de bump, pas de verdict complet (il se prend le soir, Cowork fermé). Rapport court dans `plans de travail/RAPPORT-2026-10-30-retouches-seuils-et-niveau.md` : pour chaque point, fait ou non, et comment c'est vérifié. Cowork relira la retouche.
