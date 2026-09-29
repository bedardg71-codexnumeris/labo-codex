# Demande de relecture – lot H : la vérification avant l'envoi dure une heure (#987)

> Écrite le 29 sept. 2026, vers 18 h (Toronto), par Claude Code. Répond à `plans de travail/CONSIGNE-DU-JOUR.md` (lot H). Branche `lot-h-duree-suite`, partie de `main` (`69c7d523`). Ni release ni push avant ta relecture. Le détail des mesures est dans `plans de travail/RAPPORT-2026-09-29-987-duree-suite.md`.

## 1 · Ce que le lot fait

- **Cause mesurée** : le Mac se met en veille après une minute sans activité (`sleep 1`), et rien n'empêchait la veille pendant le verdict. Au premier passage, 75 des 115 minutes sont tombées dans 13 essais qui ont chacun commencé à l'heure d'une veille, et ces essais portaient les 2 échecs et les 10 reprises. Le temps actif est de 40 minutes : la suite a doublé depuis le 19 sept.
- **Correction** : `scripts/verifier-playwright.mjs` lance `caffeinate -i -w <pid>` sur macOS avant la suite. Estimations remises au chiffre mesuré : « ~45 min », dans `verifier-playwright.mjs` (qui disait « ~4 min ») et dans `pousser.sh` (lignes 60 et 125).
- **Après** : 42,8 min, 0 échec, 4 reprises (18 s), aucune veille, même état de la machine.
- **Sentinelle** : `tests/unit/sentinelle-987-veille-pendant-la-suite.test.js`, 3 essais, 4 mutations, 4 rouges.

## 2 · À éprouver en relecture

1. **L'appel suit-il le processus du verdict, et seulement lui ?** `-w` attache `caffeinate` au processus du verdict ; il a été éprouvé à part (voir rapport § 3), pas dans un passage de `pousser.sh` complet.
2. **Aucune version n'est due**, à ton avis aussi ? (Rien de visible pour les utilisateurs.)
3. **Hypothèse (d)** : jugée par une comparaison des durées par fichier ancien et nouveau, sans la tranche sur 1.167.0 dans un worktree que la consigne évoquait. Est-ce une preuve suffisante ?

## 3 · Remonte à Grégoire (hors lot, non tranché)

La CI GitHub est annulée chaque jour à 60 min (`timeout-minutes: 60`) : c'est la même croissance de la suite, sur un serveur qui ne s'endort pas. Relever ce plafond coûte des minutes GitHub (règle 7).

## 4 · Fichiers du commit

`scripts/verifier-playwright.mjs`, `scripts/pousser.sh`, `tests/unit/sentinelle-987-veille-pendant-la-suite.test.js`, le rapport et cette demande. Les fichiers de Cowork non commités dans l'arbre (`CONSIGNE-DEMARRAGE-COWORK.md`, la consigne, les archives, `Claude outputs/`, `guide-alignement-actuel.md`) ne sont pas touchés.
