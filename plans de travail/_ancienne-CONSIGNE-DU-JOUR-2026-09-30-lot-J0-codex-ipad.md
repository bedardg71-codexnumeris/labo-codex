# Consigne du jour – lot J0 : sur l'iPad, la page meurt pendant la compression du codex (#988 rouverte)

> Écrite le 30 septembre 2026 à 5 h 24 (Toronto) par Cowork. **Retour testeur vécu : il passe avant le plan** (`PLAN-2026-09-29-fin-carte-et-enregistrement.md` reprend ensuite, lot J).
> **Condition de départ** : `git --no-optional-locks log --oneline -1 origin/main` montre `0502e0f8` ou plus récent. Branche `lot-j0-codex-ipad-memoire`, partie de `main`.

## 1 · Le symptôme, vécu et tracé

Porte terrain du lot I, 30 sept. vers 5 h 12-5 h 20, iPad (Safari 27, iPadOS, 820×1180), 1.170.0, codex réel de Grégoire : « Mettre à jour le codex » n'a produit aucun fichier ; le menu dit toujours « Ton codex n'a pas tes derniers changements », dernier fichier `…2026-09-29-15h00.zip`. Deux tentatives. Rapport de bug de la seconde (5 h 22), section du lot G, **mot pour mot** :

```
Geste: Mettre à jour le codex
Début: 2026-09-30 05:20:32
Étape atteinte: compression
Taille estimée: 1331788225 octets
Taille du fichier: —
Essais d'écriture: 0
Issue: interrompue (la page a été rechargée pendant la tentative)
```

Stockage au même rapport : 600 clés localStorage (4,3 M car.), IDB 1029 clés. Aucune erreur console.

**Ce qui est établi** : la page est rechargée pendant la compression, avant toute écriture ; la trace de `sessionStorage` survit à ce rechargement (question ouverte du 29 : réglée). C'est très probablement l'échec muet du 29 au matin, que 1.169.0 ne pouvait pas dire (la page qui devait le dire est morte).
**Inférence, non prouvée** : Safari tue l'onglet par manque de mémoire. `js/codex.js` l. 477 : `zip.generateAsync({ type: 'blob', compression: 'DEFLATE', level: 6 })` sur environ 1,33 Go tient en mémoire les sources, la sortie et le tampon de compression. Le 29 à 15 h 03, la même mise à jour avait réussi (taille alors affichée non relevée). ⮕ **À mesurer avant de corriger** : remesure-la, ne la recopie pas.

## 2 · Le mandat (technique : tranche seul, dis-le en une ligne)

1. **Mesurer** le pic mémoire de la génération du codex en fonction de sa taille (WebKit sur le Mac, `performance.memory` absent sous WebKit : trouve l'instrument et nomme-le), et ce que contient le 1,33 Go (part des copies PDF et images, déjà compressées).
2. **Réduire le pic** sans changer le contenu du codex ni son format de lecture (un codex produit après le lot s'ouvre dans 1.170.0, et l'inverse). Pistes, à juger par la mesure : `STORE` pour les entrées déjà compressées (PDF, images, ZIP) ; `generateInternalStream` et un Blob assemblé par morceaux plutôt qu'une seule sortie ; relâcher les références aux sources dès qu'elles sont lues. Une piste qui ne baisse pas le pic mesuré ne part pas.
3. **Ce qui ne change pas** : le parcours et les messages du lot G ; rien n'est écrit ni effacé dans les données ; aucun fichier de codex existant n'est touché.
4. **Si la mesure montre qu'aucune piste ne suffit** pour un codex de cette taille sur un iPad : arrête-toi et écris-le dans la demande de relecture, avec les chiffres. Ce qui se proposerait alors à Grégoire (un codex sans les copies, par exemple) touche ses données : ce n'est pas à toi de le trancher.

## 3 · Ce qui est dû

- Un banc qui juge le contenu : un codex produit avant et après le lot s'ouvre et restitue les mêmes données (empreintes). Break-test.
- La mesure du pic, avant et après, dans `plans de travail/MESURE-2026-09-30-lot-J0-codex-memoire.md`.
- Commit sur la branche, puis `plans de travail/DEMANDE-RELECTURE-2026-09-30-lot-J0-codex-ipad.md` pour Cowork. **Ni release ni push avant la relecture.**
- Une porte terrain (markdown) : sur l'iPad, avec le vrai codex, une mise à jour qui aboutit et un fichier daté du jour dans Fichiers ; puis les rangées §1 du lot I (rappel absent après la réussite), qui n'ont rien prouvé le 30 au matin.
- À inscrire en chemin, dans `SUIVI-BUGS.md` : #988 revient d'« Corrigés » à « Ouverts », avec ce rapport. Aucune case à cocher à la livraison sans la porte passée.
- Pour Grégoire, en une ou deux phrases : ce qui se passe maintenant quand il met son codex à jour sur l'iPad.
