# Verdict de relecture – La note en pourcentage à la norme française

> Cowork, mercredi 21 octobre 2026, 12 h 10 (Toronto, mesuré par `date`). Commit relu : `01b40658` sur `main`, non poussé. Demande : `DEMANDE-RELECTURE-2026-10-21-note-norme-francaise.md` ; consigne : `CONSIGNE-DU-JOUR.md`.

## Verdict : accepté, une correction dans le lot qui suit

- **La ligne de partage (ce qu'est une note) : retenue.** Nuance tirée du skill `pratiques-notation` (§6) : l'indice P est la performance qui unifie les familles, donc une moyenne de notes au sens de la ligne de partage. Le laisser avec les indices A et C reste juste pour aujourd'hui : un seul indice à la norme française mêlerait deux normes dans la même carte. Il passera avec eux, sous #1137.
- **La phrase de la note finale du profil, à l'écran** (« 44.5 pts + 28.4 pts = 72,9 % », `profil-etudiant-sections-affichage.js` l. 3109) : *corriger maintenant*. C'est ce lot qui a rendu la phrase mixte ; avant, elle suivait une seule norme. Ses points prennent la virgule et l'insécable, comme dans le PDF : « 44,5 pts + 28,4 pts = 72,9 % ». Dans `CONSIGNE-LOT-2026-10-21-avant-version.md`.
- **Les 14 specs réécrites, le jeu de 360 essais non relancé en entier** : accepté ; le verdict complet de 13 h les relance toutes.
- **#1138** (la spec du texte troué, rouge depuis `6992bec4`) : tranché par Cowork, dans le même lot. Elle vient du lot du critère algorithmique de ce matin, relu par Cowork à 9 h 16 sans la voir : la relecture n'avait pas demandé quelles specs lisent le gabarit en création.
