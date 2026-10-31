# Rapport – Le jaune « signalé » loin de l'orange brûlé

> Claude Code, vendredi 30 octobre 2026, 23 h 05 (Toronto). Exécute la décision de Grégoire du 30 oct., 22 h 55 (`VERDICT-RELECTURE-2026-10-30-orange-brule-et-passage-symetrique.md`), avec les valeurs de `RAPPORT-2026-10-30-orange-brule-et-passage-symetrique.md`. Pas de release, pas de push : relecture de Cowork d'abord.

## Ce qui est livré

| Où | Avant | Après |
|---|---|---|
| Liste, sombre | `#ca8a04` | `#facc15` (`--zone-signale-texte`) |
| Liste, clair et impression | `#ca8a04` | inchangé, lu par la même variable |
| Pastille, sombre, texte | `#f0c060` | `#ffe082` (`--zone-signale-pastille-texte`) |
| Pastille, sombre, fond | `rgba(220, 160, 20, 0.2)` | inchangé, lu par `--zone-signale-pastille-fond` |
| Pastille, clair et impression, texte | `#906000` | `#5f5200` |
| Pastille, clair et impression, fond | `rgba(200, 140, 0, 0.12)` | `rgba(250, 204, 21, 0.45)` |
| Barres | `#ffc107` | inchangé |

`design-system.html` suit, avec une entrée sous celle de l'orange ; elle n'a pas été regardée à l'écran.

## Les écarts avec l'orange, mesurés à l'écran

Chrome 156, pack de démo : couleurs et fonds empilés lus dans la page, puis calculés avec `tests/unit/_helpers/ecart-daltonisme.js`. Écart CIEDE2000, simulation Machado 2009 à sévérité 1,0. Le repère de 10 reste le mien, pas une norme. La fonction rend les valeurs de référence de Sharma et al. (2005) et retrouve les chiffres du rapport précédent.

| Paire orange / jaune | Vision typique | Protanopie | Deutéranopie | Avant (typique · proto · deutéro) |
|---|---|---|---|---|
| Liste, sombre | 29,4 | 18,8 | 13,2 | 15,6 · **2,8** · **3,4** |
| Liste, clair | 26,2 | 23,0 | 18,6 | inchangé |
| Pastille, sombre, texte | 25,1 | 14,5 | 10,1 | 18,3 · **8,1** · **4,2** |
| Pastille, sombre, fond | 15,8 | **2,7** | **3,1** | inchangé |
| Pastille, clair, fond | 19,2 | 19,4 | 18,8 | **5,7** · **2,4** · **1,7** |
| Pastille, clair, texte | 24,3 | **1,9** | **4,3** | 16,0 · **9,0** · **6,0** |
| Barres | 34,2 | 30,1 | 22,9 | inchangé |

Chaque pastille garde donc une couche qui sépare : le texte en sombre, le fond en clair. Le fond en sombre et le texte en clair, eux, se confondent toujours : ce sont les valeurs de la proposition, écrites au rapport précédent.

## Le contraste, mesuré à l'écran

| Élément | Mode | Fond réel | Rapport | Avant |
|---|---|---|---|---|
| Liste `#facc15` | sombre | `#12242e` | 10,45:1 | – |
| Liste `#ca8a04` | clair | `#ebf5fc` (rangée paire) | **2,66:1** | identique |
| Pastille `#ffe082` | sombre | au repos / au survol | 7,62:1 / 6,45:1 | 5,83:1 au repos |
| Pastille `#5f5200` | clair | au repos / au survol | 5,69:1 / 5,35:1 | 4,07:1 au repos |

## Un effet que la proposition n'avait pas mesuré : le jaune et le vert, liste en sombre

| Paire jaune / vert `#34c759` | Vision typique | Protanopie | Deutéranopie |
|---|---|---|---|
| Avant, `#ca8a04` | 41,1 | 12,4 | 8,8 |
| Après, `#facc15` | 34,5 | **8,7** | 16,0 |

Le pire cas ne recule presque pas (8,8 devient 8,7), mais il change de vision : la protanopie passe sous 10, la deutéranopie en sort. Je garde les valeurs décidées. Le jaune et le vert sont deux zones voisines, l'une et l'autre au-dessus du seuil : une confusion y pèse moins que celle de l'orange et du jaune, qui sépare « sous le seuil » de « signalé ». C'est mon jugement, pas une mesure.

## Trois issues pour les trouvailles

| Trouvaille | Issue |
|---|---|
| Le jaune et le vert, ci-dessus | 3 : écrit ici, aucun symptôme vécu |
| `#ca8a04` sous 4,5:1 dans la liste en clair (2,66:1 sur rangée paire, 2,94:1 sur blanc) : antérieur au lot, et le foncer le rapprocherait de l'orange | 3 : aucun symptôme vécu |
| `_ligneDescriptionContexte` garde `#ca8a04` en dur pour `modere`, `js/profil-etudiant-sections-affichage.js:819` : sans effet : le palier `modere` ne porte pas de `description` (`js/contexte-qualification.js`), la fonction sort donc avant | 3 : non modifié |

## Ce que j'ai décidé, et supposé

- **`#5f5200` est appliqué** : Grégoire a nommé le sombre et le fond en clair, et « les valeurs du rapport » incluent ce texte. Sans lui, le texte sur le fond renforcé n'est plus celui mesuré.
- **Le fond de la pastille en sombre passe par une variable sans changer de valeur** : les deux modes lisent ainsi la même règle.
- **Les nouvelles captures s'ajoutent aux anciennes** : les `orange-brule-*` restent la trace du lot précédent, et elles montrent l'ancien jaune.
- **Fenêtre de 1280 × 720** pour que la table entre en entier, et le message de démo fermé : il cachait les rangées 8 et 9.

## Vérifié comment

- **Vitest entier** vert : 10 534, 858 fichiers (13 tests neufs : `sentinelle-jaune-signale-2026-10-30.test.js`).
- **Specs WebKit touchées** vertes, 8/8 : `seuils-une-source`, `barres-apercu-axe`. Une nouvelle y lit le jaune à l'écran, dans les deux modes.
- **Break-tests** : 16 changements volontaires dans un banc jetable font tous rougir une garde, y compris une fonction d'écart et une simulation volontairement cassées. Journal en fin de sentinelle.
- **Motifs interdits** du rituel : aucun dans le diff. Zones protégées : non touchées.
- **Captures** (Chrome 156, pack de démo) : `plans de travail/captures/jaune-signale-{liste,pastille}-{clair,sombre}-chrome-mac.png`.

**Pas éprouvé** : le verdict Playwright complet, l'iPad, le vrai codex de Grégoire, une personne daltonienne, l'impression à l'écran (seules les variables sont gardées).
