# Verdict de relecture – Avant la version : la spec du texte troué (#1138), la phrase du profil

> Cowork, mercredi 21 octobre 2026, 12 h 20 (Toronto, mesuré par `date`). Commit relu : `cceaa892` sur `main`, non poussé. Demande : `DEMANDE-RELECTURE-2026-10-21-avant-version.md`.

## Verdict : accepté, sans correction

- **#1138** : la condition est mesurée dans un vrai WebKit avant toute réécriture (la quatrième zone est « Aucune annotation », une seule fois, dans le pli « Quand la copie ne porte aucun code ») ; la spec suit la règle de #1131, avec un essai neuf qui prouve l'écriture en création sans écriture en base. Le premier break-test qui ne cassait rien a été vu et refait sur le bon indicateur : c'est exactement ce que le break-test sert à attraper.
- **La phrase du profil** : `formaterPoints` (`note-pourcentage.js`) devient la seule écriture des points, au profil et dans le PDF. Lu au diff : pour le PDF, `toFixed(1)` puis la virgule et l'insécable, comme `nombreFr(…toFixed(1))` + `NBSP` hier ; une contribution absente rend une chaîne vide au lieu de lever.
- La ligne « … × 65% = 55.3 pts » du profil, restée à l'ancienne norme : *inscrite* sous #1137, accepté.

La version peut partir : `CONSIGNE-LOT-2026-10-21-version.md`, au signal de Grégoire.
