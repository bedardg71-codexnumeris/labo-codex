# Portes terrain — chaîne du 7 novembre 2026 (en-tête épuré, accueil épuré, pages sans doublons, pages sans emboîtement, logo)

**État : PASSÉES — chantier clos.** Grégoire, le 8 nov. 2026 à 7 h 32 : **9 sur 9, aucun échec** (Mac : 0.1,
2.1.a, 2.1.b ; iPad : 0.2, 2.2.a, 2.2.b, 2.3.a, 2.4.a, 2.4.b). Numéro lu sur le Mac : **Bêta publique 1.236.0**.
Résultats copiés depuis la page des portes : https://claude.ai/artifact/PancnMXGXYELoNk5oCdQ18

**Historique : FUSIONNÉ dans `main` le 7 nov. 2026 vers 22 h, version 1.236.0 (build `1107-2156`).** Les portes s'ouvrent quand ce numéro est en ligne, après le push qui suit le verdict complet de la nuit. Cowork publie l'artefact jumeau, avec le bouton « Copier mes résultats ».

**Ce qui n'est PAS ici, et pourquoi.** L'apparence des pages, en clair et en sombre, à 1180 et 820 px, se juge sur
les captures WebKit que Cowork relit (`Claude outputs/captures-2026-11-07-*`). Les cadres, les contrastes et les
seuils sont mesurés par les bancs. Règle : aucune porte quand une machine peut répondre. Ne restent ici que les
quatre gestes que seuls Safari et l'iPad peuvent montrer. Aucune donnée n'est touchée par ces lots : pas de § 1.

Ce qui échoue devient un item de backlog, avec le numéro de la porte.

---

## § 0 · Préalable

| # | Geste | Attendu |
|---|---|---|
| 0.1 | Sur le Mac (Safari), ouvre `https://app.codexnumeris.org`, recharge avec vidage du cache (Option-Cmd-E, puis Cmd-R). Lis le numéro en bas de page. | Le numéro inscrit ici à la fusion : **Bêta publique 1.236.0** |
| 0.2 | Même geste sur l'iPad. | Le même numéro. |

## § 2 · Interface

### 2.1 L'icône dans l'onglet de Safari `Mac`
**Pourquoi** : à 16 px, l'ancienne icône se lisait comme une tache ; ses traits sont maintenant près de quatre fois
plus épais. Aucune capture ne montre la barre d'onglets du navigateur.

| | Geste | Attendu |
|---|---|---|
| 2.1.a | Regarde l'icône de l'onglet de Labo Codex, Mac en apparence claire. | On reconnaît l'icône de Labo Codex, pas une tache. |
| 2.1.b | Passe le Mac en apparence sombre (Réglages Système › Apparence), recharge, regarde l'icône. | La version pour fond sombre, aussi lisible. |

### 2.2 Les icônes de l'en-tête au doigt `iPad`
**Pourquoi** : les icônes de l'en-tête ont un fond discret au survol. Sur un écran tactile, Safari peut garder ce
fond après le toucher, ou demander un deuxième toucher avant d'agir.

| | Geste | Attendu |
|---|---|---|
| 2.2.a | Touche une fois le menu (les trois traits, en haut à droite). | Le menu s'ouvre dès le premier toucher. |
| 2.2.b | Ferme le menu, puis regarde l'icône que tu viens de toucher. | Aucun fond ne reste dessus. |

### 2.3 La frise des étapes au doigt `iPad`
**Pourquoi** : les étapes de la frise sont plus grandes au doigt (44 px) qu'à la souris. La taille se mesure ; la
précision d'un vrai doigt, non.

| | Geste | Attendu |
|---|---|---|
| 2.3.a | En Conception › Carte, touche tour à tour chaque étape de la frise, en haut. | Chaque toucher ouvre le guide de l'étape visée, du premier coup, jamais celui de sa voisine. |

### 2.4 La frise qui défile, iPad debout `iPad`
**Pourquoi** : en portrait, les sept étapes ne tiennent plus sur la largeur : la frise défile à l'horizontale. Seul
le geste du doigt sur un vrai iPad dit si c'est la frise qui bouge, ou toute la page.

| | Geste | Attendu |
|---|---|---|
| 2.4.a | iPad debout, en Conception › Carte, glisse le doigt de droite à gauche sur la frise. | La frise défile jusqu'à la septième étape. |
| 2.4.b | Pendant ce geste, regarde le reste de l'écran. | La page ne bouge pas de côté. |

## § 3 · Décisions

Aucune. Les choix faits seuls pendant ces lots portent sur l'apparence : ils se jugent sur les captures (sections
« Ce que j'ai décidé seul » des rapports du 7 nov.).

## § 4 · Ce que je n'ai pas pu vérifier

- **Safari réel.** Les bancs tournent sur le WebKit de Playwright, proche de Safari mais pas identique. Un écart de
  rendu propre à Safari ne serait vu qu'en usage ; il n'en fait pas une porte (apparence, sans risque pour les données).
- **Le toucher.** Les essais cliquent à la souris, même là où ils simulent la largeur de l'iPad.
- **La barre d'onglets.** Les captures montrent la page, jamais l'interface du navigateur.
- **Le déploiement.** Rien de cette chaîne n'est en ligne au moment d'écrire cette liste (voir l'état, en tête).
