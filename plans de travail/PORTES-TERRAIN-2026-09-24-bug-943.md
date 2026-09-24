# Portes terrain – #943 (1.159.2) : une ligne tracée se courbe aussitôt

> Écrite le 24 septembre 2026 par Claude Code. **Artefact jumeau : à publier par Cowork** (bouton « Copier mes résultats »).
> ⚠ **Cette porte attend le push** : tant que `https://app.codexnumeris.org` n'affiche pas **1.159.2**, elle jugerait la version d'avant.
> Ce qui échoue devient une fiche au BACKLOG, pas une note mentale.

## §0 · Préalable

- [ ] Sur l'iPad, ouvre `https://app.codexnumeris.org`, recharge, et lis le numéro en bas de page.
      ⮕ Attendu : **1.159.2**. Sinon, s'arrêter là : le correctif n'est pas encore en ligne.

## §1 · Données

Une copie de test, ou une copie réelle que tu annotes de toute façon : les lignes tracées ici s'effacent par Cmd-Z (ou la gomme). Rien d'autre n'est écrit.

## §2 · Interface

### 2.1 · Tracer, puis courber, avec le Pencil — sans changer d'outil   [1.159.2]
#943 · ton rapport du 24 sept. 10 h 18 (et la capture de la flèche courbée)

> **POURQUOI** — Pour courber une ligne, il fallait passer par l'outil Sélection. La spec WebKit simule une souris ; seul le Pencil sur l'iPad dit si le geste tombe juste sous le doigt.

- [ ] Annoter › outil **Ligne** (fléchée). Trace une flèche au Pencil, puis, sans toucher à la palette, pose le Pencil sur **le rond du milieu** et tire.
      ⮕ Attendu : la flèche se courbe ; aucune deuxième flèche n'apparaît. Tirer une **extrémité** (petit carré) la déplace.
- [ ] **Le compromis de la relecture (§ 2)** : enchaîne deux flèches **bout à bout** — commence la deuxième exactement sur la pointe de la première.
      ⮕ Attendu (tel que codé) : ce geste **saisit la pointe de la première** au lieu de tracer une nouvelle flèche. Dis si ça te gêne en usage réel : si oui, on réduit la zone des poignées ou on la limite au milieu. Commencer un peu à côté de la pointe trace bien une nouvelle flèche.
- [ ] Choisis une autre couleur dans la palette, puis trace une nouvelle ligne.
      ⮕ Attendu : la flèche précédente **garde sa couleur** ; seule la nouvelle prend la couleur choisie.

## §3 · Décisions

Retenues par toi le 24 sept. (relecture de Cowork) :
- la couleur, l'épaisseur ou les pointes choisies après un tracé visent la **ligne suivante** ;
- changer d'outil retire les poignées (vers l'outil Sélection, la ligne arrive sélectionnée).

## §4 · Ce que je n'ai pas pu vérifier

- **Le Pencil lui-même** : la spec simule une souris sous WebKit ; le Pencil passe par le même chemin de code (`pointerType: 'pen'`), non éprouvé.
- **La taille de la zone des poignées au doigt près** : 12 px de canvas, celle de l'outil Sélection, inchangée.
- **Le Pointillé** n'a pas de poignée de courbure (ni avant, ni maintenant) ; non inscrit, rien de vécu.
