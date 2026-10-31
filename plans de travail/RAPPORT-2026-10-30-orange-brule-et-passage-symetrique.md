# Rapport – L'orange brûlé et le passage symétrique

> Claude Code, vendredi 30 octobre 2026, 22 h 50 (Toronto). Exécute `CONSIGNE-LOT-2026-10-30-orange-brule-et-passage-symetrique.md`. Pas de release, pas de push : relecture de Cowork d'abord.

## Ce qui est livré

| Point de la consigne | Fait | Où |
|---|---|---|
| § 1 Passage symétrique à la cassure seulement | Oui : la moitié de la plus étroite des deux zones à l'écran. Par défaut 12,5 % de la barre de chaque côté, comme à droite jusqu'ici | `fondDeLaBarre`, `js/tableau-bord-apercu.js` |
| § 2 Barres | `#CC5500` ; `couleurAuSeuil` suit (`rgb(230, 139, 4)` au seuil, lu dans Chrome) | `COULEUR_BANDE`, `js/contexte-qualification.js` |
| § 2 Liste | `var(--zone-bas-texte)` : `#F07E33` en sombre, `#A84400` en clair et à l'impression | `COULEUR_LISTE`, `styles.css` |
| § 2 Pastilles | Sombre : texte `#FF9A5C`, fond `rgba(204, 85, 0, 0.3)`. Clair et impression : texte `#943C00`, fond `rgba(204, 85, 0, 0.14)` | `.prioritaire-indice-critique` |
| § 2 Autres lecteurs de `bas` | `COULEURS_PALIERS` et la branche `critiques` de la Mobilisation | `js/contexte-qualification.js` |
| § 2 `design-system.html` | Une entrée ajoutée sous « Badges de risque » ; pas regardée à l'écran | `design-system.html` |
| § 2 Gardes | Suivent, décision nommée : `sentinelle-821a…`, `sentinelle-seuils-une-source…`, `sentinelle-barres-apercu…` ; une garde neuve : `sentinelle-orange-brule-2026-10-30.test.js` | `tests/unit/` |
| § 3 Inscrire | #1208, issue 2 | `BACKLOG.md` |
| § 4 Captures Chrome, clair et sombre | Chrome 156, pack de démo : Aperçu dans les deux axes, liste, pastilles | `plans de travail/captures/orange-brule-*-chrome-mac.png` |

## Le contraste, mesuré

La consigne cite `#13262f` : ce fond n'existe ni dans `styles.css` ni dans `design-system.html`. Les fonds ci-dessous sont lus dans Chrome, couches empilées comprises.

| Élément | Mode | Fond réel | Rapport |
|---|---|---|---|
| `#CC5500` en texte (écarté) | sombre, `#13262f` de la consigne | – | 3,62:1 |
| `#CC5500` en texte (écarté) | clair, blanc | – | 4,31:1 |
| Liste `#F07E33` | sombre | rangée `#142428`, rangée paire voilée | 5,89:1 |
| Liste `#A84400` | clair | blanc / rangée paire | 6,01:1 / 5,44:1 |
| Pastille `#FF9A5C` | sombre | sur son fond empilé | 5,08:1 |
| Pastille `#943C00` | clair | au repos / au survol | 5,05:1 / 4,58:1 |
| Barre `#CC5500` | sombre, sur la carte | sans voile / avec le voile | 3,16:1 / 2,34:1 |

Avec le voile, l'ancien rouge faisait 2,22:1 : pas de recul, mais le 3:1 n'est tenu que sans le voile, que Grégoire a gardé.

## Le jaune : il se confond pour les daltonismes rouge-vert

Écart CIEDE2000, simulation Machado 2009 à sévérité 1,0. Mon repère, pas une norme : sous 10, difficile à distinguer. C'est une simulation, personne daltonienne n'a regardé.

| Paire orange brûlé / jaune | Vision typique | Protanopie | Deutéranopie | Ancien rouge (vision typique, proto, deutéro) |
|---|---|---|---|---|
| Liste, sombre : `#F07E33` / `#ca8a04` | 15,6 | **2,8** | **3,4** | 34,3 · 23,1 · 10,7 |
| Liste, clair : `#A84400` / `#ca8a04` | 26,2 | 23,0 | 18,6 | même repère |
| Pastille, sombre, texte | 18,3 | **8,1** | **4,2** | 35,5 · 20,4 · 11,7 |
| Pastille, sombre, fond | 15,9 | **2,7** | **3,1** | – |
| Pastille, clair, texte | 16,0 | **9,0** | **6,0** | 30,2 · 15,0 · 5,1 |
| Pastille, clair, fond | **5,7** | **2,4** | **1,7** | – |
| Barres : `#CC5500` / `#ffc107` | 34,2 | 30,1 | 22,9 | 50,0 · 38,8 · 25,5 |

Les barres et la liste en clair tiennent. En sombre, aucun orange plus clair ne règle la liste : pour tenir 4,5:1, il doit avoir la luminance du jaune, et c'est alors la teinte seule qui les sépare. Le chiffre et son libellé restent lisibles dans tous les cas : la couleur n'est jamais le seul signal de la valeur, mais elle l'est de la zone.

### Proposition, non appliquée (la consigne dit « propose ») : éclaircir le jaune, pas revenir au rouge

| Où | Aujourd'hui | Proposé | Contraste | Écart avec l'orange (typique, proto, deutéro) |
|---|---|---|---|---|
| Liste, sombre | `#ca8a04` | `#facc15` | 10,45:1 | 29,4 · 18,8 · 13,2 |
| Pastille, sombre, texte | `#f0c060` | `#ffe082` | 7,62:1 | 25,1 · 14,5 · 10,1 |
| Pastille, clair, fond | `rgba(200, 140, 0, 0.12)` | `rgba(250, 204, 21, 0.45)` | – | 19,2 · 19,4 · 18,8 |
| Pastille, clair, texte | `#906000` | `#5f5200` | 5,69:1 (4,07 aujourd'hui) | 24,3 · 1,9 · 4,3 : c'est le fond qui les sépare |

La liste en clair ne bouge pas. La liste sombre a besoin d'une variable de plus, le jaune y étant aujourd'hui une seule valeur pour les deux modes.

## Ce que j'ai décidé, et supposé

- **Largeur à la cassure** : la consigne offre deux formules. J'ai pris « la moitié de la plus étroite à l'écran » : elle donne le même 12,5 % par défaut et ne déborde jamais sur le passage suivant.
- **La branche `critiques` de la Mobilisation suit**, malgré son nom : A et C y sont tous deux sous le seuil, et Grégoire a dit « partout ». `#ff9800` (un seul des deux) ne bouge pas ; l'écart reste net (21,4 · 21,6 · 17,2).
- **Le mot de l'aide change** : « un chiffre sous ce seuil est rouge » devient « est orange brûlé » (`depist-seuil-fragile`). C'est lu par l'enseignant·e, pas par ses élèves, et ce serait faux sinon. À relire par Grégoire.
- **Restent rouges, parce qu'ils ne marquent pas la zone** : les badges du niveau RàI (décision de Grégoire), les patterns et diagnostics (`Difficulté persistante`, `profil-etudiant-calculs.js`, `pratique-sommative.js`, `pratique-pan-standards.js`), le niveau 3 de `graphiques-progression.js`, les échelles enregistrées (`couleur` de leurs niveaux), les erreurs.
- **Le filtre actif reste rouge** (`.prioritaire-tri-actif`, y compris « A→Z »), et « Détails » aussi, à côté des pastilles orange : c'est un état sélectionné, pas une zone. Visible sur la capture : à Grégoire de dire si ça le gêne.

## Trois issues pour les trouvailles

| Trouvaille | Issue |
|---|---|
| « 1 étudiant·e en Développement montrent » | 2 : #1208 |
| `genererSectionMobilisation` et `genererSectionAssiduiteLegacy` n'ont aucun appelant : les couleurs de `COULEURS_PALIERS` et de la Mobilisation ne paraissent donc nulle part à l'écran. J'avais retouché le titre de la première, retouche retirée : c'était du code mort | 3 : commenté dans le code |
| `#ca8a04` sur blanc : 2,94:1, antérieur au lot | 3 : aucun symptôme vécu ; le foncer le rapprocherait de l'orange. Écrit ici pour la décision du jaune |

## Vérifié comment

- **Vitest entier** vert : 10 521, 857 fichiers.
- **Specs WebKit touchées** vertes, 7/7 : `seuils-une-source`, `barres-apercu-axe`. Une nouvelle y mesure, à l'écran et dans les deux modes, la couleur et le contraste des pastilles et de la liste.
- **Break-tests** : 22 changements volontaires dans un banc jetable font tous rougir une garde. M14 a demandé une garde de plus, sur une zone étroite au-dessus de la cassure. M17 a d'abord rendu 0 rouge, ma mutation ne changeant qu'une occurrence sur deux ; rejouée sur toutes, 1 rouge. Journaux : `sentinelle-orange-brule-2026-10-30.test.js`, `sentinelle-barres-apercu-2026-10-30.test.js`.

**Pas éprouvé** : la vérification complète du navigateur, l'iPad, le vrai codex de Grégoire, une personne daltonienne, l'impression à l'écran (seules les variables sont gardées). Le `#13262f` de la consigne reste inexpliqué.

## À Grégoire

1. **Le jaune** : appliquer la proposition ci-dessus, ou le garder tel quel ?
2. **Les mots du réglage des barres** : toujours à valider (`RAPPORT-2026-10-30-barres-apercu.md`, six textes), plus le mot de l'aide ci-dessus.
3. **Les captures** : `plans de travail/captures/orange-brule-*-chrome-mac.png`.
