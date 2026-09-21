# Complément au lot 1.152.0 – l'item 2 de « Nouvelles », avant le push

> Écrit le 21 septembre 2026, 9 h 01 (Toronto), par Cowork, après la relecture croisée de `f86683f4` (verte, par exécution, aucune retouche de code ; détail en tête de `RELAIS.md`).

## Ce qui est attendu

1. Dans `js/changelog-data.js`, entrée `1.152`, remplacer l'item 2 par ce texte, **validé par Grégoire le 21 sept. à 9 h 01** (il décrivait mal le lot : les reprises ont aussi quitté la branche Standards) :

> L'assistant de pratique ne propose plus le plafonnement ni le remplacement pour une sommative, ni le choix des reprises&nbsp;: rien ne les appliquait à la note. Le Comparateur ne les annonce plus «&nbsp;Actif&nbsp;». Tes pratiques déjà créées ne perdent rien.

   Garde les espaces insécables du fichier (`&nbsp;` avant « : » et à l'intérieur des guillemets), comme l'item 1.
2. Build-only, numéro inchangé (1.152.0). Vitest vert.
3. Commite avec ce fichier (`plans de travail/CONSIGNE-COMPLEMENT-1152-nouvelles.md`) et `RELAIS.md` (ajout de Cowork de 8 h 59, verdict de relecture).
4. Puis le push, sur le mot de Grégoire donné ici : `scripts/pousser.sh origin main` sous `caffeinate`, en arrière-plan, **Cowork fermé** (vérifie-le), `pgrep pousser.sh` vide. Corrige le bloc de `RELAIS.md` quand c'est poussé.
