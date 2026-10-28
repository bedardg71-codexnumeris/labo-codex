# Consigne – En dénotation, un jugement sans note n'est pas calculable (E14 ; #1152, trou 2)

> Écrite par Cowork le mercredi 28 octobre 2026 vers 15 h 15 (Toronto). Ce fichier ne remplace aucune autre consigne. **Ordre** : après le lot des correctifs E1-E7 (`CONSIGNE-LOT-2026-10-28-construction-de-la-note-correctifs.md`), qui modifie aussi `js/pratiques/pratique-configurable.js` ; avant les lots 4 et 5 de l'Aide. Petit lot : il peut se joindre à la retouche des correctifs si Cowork en demande une.
> Source : `DECISIONS-2026-10-28-construction-de-la-note.md`, § E14 (la décision de Grégoire, 15 h 11, mot pour mot).

## 0. Avant tout

- Un seul lot à la fois, sur un `main` à jour, aucune suite qui tourne. Rituel de début de session.
- Commit de docs seul, fichiers nommés : ce fichier, `DECISIONS-2026-10-28-construction-de-la-note.md`, `TEXTES-2026-10-28-aide-sept-trous.md`. Rien d'autre.
- **Tarir et stock** : le correctif se lit **au calcul** ; aucune écriture dans les données de personne. Un jugement déjà enregistré sans note passe de 0 à « non calculable » sans réécriture : dis-le dans la demande (il ira aux Nouvelles si la mise en ligne le porte).

## 1. Le mandat

1. Dans `_calculerPerformanceDenotation` (`js/pratiques/pratique-configurable.js:~377-405`) : une saisie dont `noteFinale` n'est pas un nombre donne `null` (non calculable), comme l'absence de saisie ; la garde des cibles (plafond 59) ne s'applique qu'à une note saisie. Une note saisie de 0 reste 0.
2. Mesure d'abord qui d'autre lit `noteFinale` d'un jugement de dénotation (le récit, `:~482` ; le profil ; l'export ; les captures, `snapshots.js:~283`) et dis ce que chacun montre pour un jugement sans note. Aucun ne doit afficher 0 ni `NaN`.
3. Le panneau de saisie (`js/pratiques/denotation-saisie-ui.js`) continue d'accepter un champ vide (Grégoire veut qu'on puisse cocher les cibles peu à peu) : n'y change rien, aucun mot neuf à l'écran.

## 2. Les tests

- Le banc `sentinelle-construction-de-la-note-2026-10-28` gagne **DEN-4** : un jugement enregistré, cibles cochées ou non, sans note → P, Comparateur et export « non constructible » ; cite E14. DEN-1 à DEN-3 ne bougent pas (si un autre cas bouge, arrête-toi et dis-le).
- Break-test : sans le correctif, DEN-4 rougit (arbre restauré par sha256).
- Vitest depuis `tests/`.

## 3. Clôture

`BACKLOG.md` : une fiche (E14), cochée si fait ; demande de relecture `plans de travail/DEMANDE-RELECTURE-2026-10-28-denotation-jugement-sans-note.md` (avant, après, preuve, test). Pas de release, de verdict ni de push sans le signal de Grégoire.
