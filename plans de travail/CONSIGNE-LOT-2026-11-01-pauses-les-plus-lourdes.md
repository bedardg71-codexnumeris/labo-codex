# Consigne – Les 30 pauses les plus lourdes : attendre ce que l'essai a besoin de voir (1er novembre 2026)

> Écrite par Cowork le dimanche 1er novembre 2026 à 11 h 15 (Toronto, mesuré par `date`) ; `main` local = `e00f9fe9` (session d'Annoter), `origin/main` = `0fd0427f` ; branche `lot/pauses-apres-ouverture` = `3a29ef9a`, non fusionnée.
> **Source** : `plans de travail/RAPPORT-2026-11-01-pauses-apres-ouverture.md` (sur cette branche), relu par Cowork et accepté (11 h 14). Deux points vérifiés : la branche ne touche ni le code de l'application ni les specs rouges hors lot ; le fichier muté un moment par le banc est restauré. Il reste 2 067 pauses, 39,3 min sur GitHub ; **les 30 sites les plus lourds en font 21,8**.
> **Décision de Grégoire** (11 h 15) : ce lot.

## 0. Avant tout

- **Ton propre worktree**, sur une branche partie de `lot/pauses-apres-ouverture` (`3a29ef9a`) : le cliquet, `attendreApplication` et `scripts/mesurer-verification.mjs` y sont. Déplaces-y cette consigne (elle n'est pas suivie par Git : un simple `mv`), puis un commit de docs seul.
- **Fusion** : après la mise en ligne de ce soir, dans cet ordre : `lot/verification-plus-rapide`, `lot/pauses-apres-ouverture`, puis ta branche.
- **Sur le Mac, une spec à la fois, et aucune passe large.** Ce matin, une session de Claude Code s'est arrêtée, la mémoire du Mac probablement saturée (dit par Grégoire, non mesuré). La session d'Annoter tourne à côté. Les répétitions se font sur GitHub, sur des branches jetables, comme au lot précédent (vérifié le 1er nov. : une branche poussée ne publie rien chez Netlify).
- Rien à demander à Grégoire : ce lot ne touche que des tests.

## 1. Le périmètre

- **Dedans** : les 30 sites du tableau « Pour le lot suivant » du rapport. Plusieurs sont dans des aides appelées des dizaines de fois (`lot-e3-creer-ou-modifier:32`, 98 fois ; `chaines-etapes-1149-lot-3b:24`, 108 fois) : le gain s'y concentre.
- **Dehors** : les autres sites (environ 17,5 min sur GitHub) ; le code de l'application ; les deux images de `attendreApplication` (piste écartée au lot précédent).

## 2. La règle : celle du lot précédent, plus ses deux leçons

- Une pause fixe devient une attente sur la condition dont l'étape suivante a besoin. Jamais une pause plus courte. Aucune assertion modifiée, retirée ou affaiblie.
- **Une pause qui précède un constat d'absence** (aucune erreur, aucun message, rien n'a bougé) garde sa fenêtre : marqueur `pause-gardee :` et son motif. Pour chacun des 30 sites, dis lequel des deux cas il est.
- **Un rappel ou une animation qui arrive tard** et gêne l'essai (le rappel de sauvegarde, 1,5 s après l'ouverture) : le neutraliser dans le banc seulement si un autre essai juge déjà ce geste ; nomme cet essai.
- Abaisse le plafond du cliquet au compte réel.

## 3. La preuve

- **Le gain se mesure sur le Mac**, pas sur GitHub (leçon du lot précédent : les machines de GitHub mettent autant de temps à être prêtes que la pause en attendait). Chaque spec touchée, en alternance avant, après, après, avant, une à la fois. Le total en secondes, puis l'estimation pour la passe complète du Mac.
- **Contre-épreuve sur chaque spec touchée**, pas sur un échantillon : une cassure directe de ce qu'elle vérifie, elle rougit. Et pour chaque constat d'absence, une cause tardive (l'erreur arrive après le délai) : l'essai la voit.
- **Aucune intermittente neuve** : trois tours sur GitHub sur les specs touchées.
- Le cliquet : vert, plafond abaissé, contre-épreuve (une pause ajoutée le fait rougir).

## 4. Le rapport

- En minutes du Mac et en gestes. Les sites traités, les pauses gardées avec leur motif.
- **Pour décider de la suite** : le gain mesuré sur le Mac par site touché, et ce que la longue traîne promettrait au même rythme. Cowork décide s'il y a un lot de plus.
- Trouvailles hors lot : inscrire est le défaut. Noms fictifs uniquement (règle 6 de `CLAUDE.md`).
