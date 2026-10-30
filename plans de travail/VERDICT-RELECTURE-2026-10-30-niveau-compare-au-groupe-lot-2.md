# Verdict de relecture – Le lot 2 : le niveau RàI comparé au groupe-cours (9e2be4b4, 5b154aeb)

> Cowork, vendredi 30 octobre 2026, 11 h 31 (Toronto). Lecture faite par une session de relecture indépendante, en lecture seule, à partir de la cartographie de `787f2ca9` ; Cowork a revérifié au commit `9e2be4b4` les constats 1, 3, 4 et 5. Rien exécuté : ni le rejeu des 47 dates, ni Vitest, ni Playwright.

## Verdict

**Pas accepté tel quel.** Le calcul est fidèle aux scripts mesurés (`__classerRegles` ↔ `classerNiveauDansLeGroupe` : bornes strictes, condition de maîtrise, règle 2 sur les notes chiffrées, règle 1 dès une copie, écart-type n−1, minimum de 5, mêmes copies). Jetons bumpés, pas de faille ajoutée, ancien calcul retiré. Les défauts sont autour du calcul.

## À finir dans le lot

1. **La carte dit « Dans la moyenne de son groupe » sans comparaison** (`js/profil-etudiant-calculs.js:1799`, texte `:1881`). Le motif `dans-le-groupe` sort aussi (a) quand le groupe a moins de 5 élèves avec copie (`reference` nulle) et (b) quand l'élève est au-dessus du repère de maîtrise mais à plus d'un demi-écart-type sous la moyenne. Deux motifs à ajouter ; leurs phrases vont dans la liste des mots à valider. L'Aide ne dit pas qu'il n'y a pas de comparaison sous 5 élèves.
3. **Une phrase de l'Aperçu a changé de sens** (`js/tableau-bord-apercu.js:838`) : `niveauRai === 1` compté comme « progression favorable ». Presque tout élève en Développement proche de son groupe est maintenant au niveau 1 : la phrase gonfle. Ne garder que `pattern === 'Stable'`.
5. **Les élèves des autres groupes du cours sont classés sans leur groupe, et c'est écrit** : `calculerEtStockerPatternsGroupe` (`js/profil-etudiant-actions.js:767`) parcourt `obtenirDonneesSelonMode('groupeEtudiants')` (tout le cours), `_lireLeGroupeDuDepistage` (`profil-etudiant-calculs.js:1834`) ne connaît que le groupe actif. Les élèves de l'autre groupe n'ont pas de référence (jamais de niveau 3) et ce résultat entre dans `indicesPatternsRaI` (`:802`), copié par le registre longitudinal. Calculer les références sur tout le cours, par numéro de groupe : les vues « un groupe » et « tous les groupes » coïncident alors par construction. Corriger au rapport « rien n'est écrit » : ce cache dérivé est réécrit au prochain chargement de l'Aperçu.
6. **Les tests verrouillent moins que le rapport ne le dit.** Calculé : sur les six jeux de la sentinelle, écart-type n et n−1 donnent les mêmes niveaux. Inféré : un minimum passé de 5 à 6 resterait vert (groupes de 4 ou 6) ; aucun cas du vrai chemin n'a de repère de maîtrise (`reperes.maitrise` → `null` à `:1983` resterait vert : la jonction avec le lot 1 n'est pas gardée) ; le banc n'a ni copie remplacée, ni diagnostique, ni non recevable. Ajouter des cas qui départagent chacun.
7. **Les copies toutes « non remises »** (`:1927`, `:2190`) : niveau 3 seulement si A > 0, sinon « En attente » ; le rapport dit « niveau 3 » sans condition (à corriger). La garde de la cible (`:2190`) n'est pas alignée sur celle de la carte (la carte dit « Non-participation », la barre des patterns « Difficulté persistante ») : une ligne.
8. **Le coût hors lot** : chaque appel relit tout le cours, et `evaluationEntreDansLaNote(c, brutes)` reconstruit l'index par copie remplacée (`:1823`). La Liste fait au moins deux passages hors lot (`etudiants.js:913`, `:1006`), plus un par filtre. Encadrer ces boucles par `demarrerCacheLecture` / `terminerCacheLecture`. (Code de ce lot : c'est le lot, pas une trouvaille.)
10. **`signalGroupe`** (`:1974`, `:1993`) n'a aucun lecteur : export sans consommateur écrit par ce lot. Le retirer.

## À Grégoire

> **Constat 4 tranché le 30 oct. à 11 h 33** : les repères de l'échelle des copies se lisent dans toutes les pratiques (§ 4 de la consigne des retouches).

4. **Sommative et spécifications : la condition de maîtrise ne s'applique jamais** (le lot 1 ne leur donne pas d'échelle). Sentinelle, ligne 123 : dans un groupe à 94 de moyenne, un élève à 80 % est « Niveau 3 - Intensif ». Même question que le constat 3 du lot 1 ; posée le 30 oct. à 11 h 32, recommandation de Cowork : lire les repères de l'échelle des copies dans toutes les pratiques.
2. **Niveau 1 avec le pattern « Difficulté persistante »** (attendu par `audit-onglet-suivi-2026-09-05.test.js:595`, `:915`). Le pattern lit les 3 derniers artefacts sous le repère de suffisance ; le niveau, la moyenne de toutes les copies comparée au groupe. Ce que voit l'enseignant·e : badge vert « Niveau 1 - Universel », badge rouge « Difficulté persistante », puis « Dans la moyenne de son groupe. Suivi régulier en classe. » ; hors du filtre « RàI 2-3 ». À trancher avec les questions 2 à 5 du lot. Piste de la relecture : le pattern ne relève pas le niveau (ce serait défaire le modèle accepté), mais la carte n'écrit plus « Suivi régulier » sous un badge rouge.
9. **L'orthopédagogie** : un service qui suit des élèves individuellement, aux activités différentes ; la comparaison au groupe a-t-elle un sens ? Sous 5 élèves, seule la règle 1 parle. À poser à la relance du volet, rien à coder d'ici là.

## Inscrire et continuer

- Le défi principal entre sans `echapperHtml` (`js/profil-etudiant-sections-affichage.js:1235`), antérieur au lot ; un nom de critère peut venir d'une grille importée. La CSP bloque le script, pas l'injection de HTML.

## Commenter et oublier

- Vue « tous les groupes », deux groupes aux échelles divergentes : la condition de maîtrise se lève dans cette vue et pas dans l'autre.
- `calculerNiveauRai` (`pratique-pan-specifications.js:642`) et les `genererCibleIntervention` des pratiques : sans appelant, antérieurs au lot.

## Non vérifié

Le rejeu « 0 écart sur 47 dates » et les chronos (104 ms, 22 ms) ; Vitest, Playwright, Safari, iPad ; la fréquence de la paire niveau 1 / « Difficulté persistante » sur ses données ; des copies « non remises » portant une note dans son codex.
