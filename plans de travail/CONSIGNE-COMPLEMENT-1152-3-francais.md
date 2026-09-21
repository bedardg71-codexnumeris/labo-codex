# Complément au lot 1.152.3 (#553) – deux preuves de comportement, avant le push

> Écrit le 21 septembre 2026, 11 h 43 (Toronto), par Cowork, après la relecture croisée de `9151a595`. **Relecture : verte par exécution sur le code ; les deux trous que tu as toi-même signalés sont confirmés.**

## Ce que la relecture a fait

Clone de `9151a595`, les neuf bancs qui touchent ces fonctions : 164 / 164. Lu : `francaisMoyen` n'avait aucun usage dans `_determinerCibleIntervention` (paramètre mort) – ta décision de le retirer tient. Six mutations de Cowork :

| Mutation | Résultat |
|---|---|
| la flèche de direction du profil rabotée à nouveau (`sections-affichage.js` ≈ l. 1215) | rouge (2) – **mais seulement par le verrou sur le texte du code** |
| rabotage remis dans l'IPB, côté évaluation | rouge (2) |
| rabotage remis dans l'IPB, côté grille | rouge (2) |
| rabotage remis dans les barres du profil (`helpers.js` ≈ l. 982) | rouge (3) |
| la lecture tolérante qui ne vérifie plus que le candidat est le critère demandé | rouge (1) |
| la lecture tolérante qui compte les candidats sur le préfixe « franc » | **verte** – sans conséquence réaliste (aucune grille connue n'a un critère « Franc… » qui ne soit pas du français) ; **à laisser**, dit ici |

## Ce qui est attendu

1. **Deux essais de COMPORTEMENT**, sur le vrai code :
   - la flèche de direction du profil : pour un critère « Français écrit » qui a une direction, le rendu porte la flèche ; même critère avec la clé rabotée remise → pas de flèche ;
   - le compte des défis du formulaire d'intervention (le second trou que tu as signalé au relais) : une grille à deux critères « Français… » faibles compte deux défis, pas un.
2. Repose une mutation qui **garde le texte exigé par le verrou et change le comportement** (par exemple `c.cleNormalisee.indexOf('francais') === 0 ? 'francais' : …` à la flèche) : elle doit rougir par l'essai de comportement, pas seulement par le verrou.
3. Build-only, numéro 1.152.3 inchangé ; Vitest vert. Commite avec ce fichier.
4. **Puis le verdict Playwright sur le SHA exact et le push, sur le mot de Grégoire donné ici** : `scripts/pousser.sh origin main` sous `caffeinate`, en arrière-plan, **Cowork fermé** (vérifie-le), `pgrep pousser.sh` vide. Corrige le bloc de `RELAIS.md` quand c'est poussé.
5. **Ensuite seulement**, la consigne suivante est `plans de travail/CONSIGNE-SUIVANTE-bilan-mots-eleve.md` (Cowork) : ne la lance que si Grégoire la relaie.
