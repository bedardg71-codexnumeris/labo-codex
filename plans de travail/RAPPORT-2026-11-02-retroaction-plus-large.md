# Rapport – La palette Rétroaction s'ouvre plus large (2 novembre 2026)

> Claude Code, lundi 2 novembre 2026. Consigne : `CONSIGNE-LOT-2026-11-02-retroaction-plus-large.md` (Cowork, 8 h 03).
> Commits : `64687e4b` (consigne), `dcd42b2b` (la largeur), `6f9aae1c` (↕). Base : `ffd69a47` = 1.230.1, en ligne.
> **Pas de release ni de verdict** : le lot part avec la prochaine mise en ligne.

## La mesure (§ 1)

Le texte mesuré est la plus longue rétroaction finale du pack de démo (`js/pack-demo-10.js`, 3 560 caractères, noms fictifs). Le compte de caractères par ligne passe par un miroir du champ (même police de 12,8 px, mêmes marges, même largeur). On range chaque caractère sur sa ligne et on fait la moyenne des lignes pleines : la dernière ligne d'un paragraphe ne compte pas.

| Format | Mode | Rétroaction | Car. / ligne | Pied (3 boutons) | Copie libre |
|---|---|---|---|---|---|
| 1180 × 820 | hors plein écran, **avant** | 200 | 24 | 2 rangées | 432 |
| 1180 × 820 | plein écran, **avant** | 200 | 24 | 2 rangées | 432 |
| 1280 × 720 | hors plein écran, **avant** | 200 | 24 | 2 rangées | 532 |
| 1280 × 720 | plein écran, **avant** | 200 | 24 | 2 rangées | 532 |
| 1180 × 820 | hors et plein, **après** | **360** | **50,7** | **1 rangée** | **272** |
| 1280 × 720 | hors et plein, **après** | **360** | **50,7** | **1 rangée** | **372** |

Le plein écran ne change pas la largeur : la zone fait déjà toute la largeur de la fenêtre. Il ne gagne que de la hauteur.

Balayage à 1180 × 820 (largeur → caractères par ligne → copie libre) : 300 → 40,6 → 332 ; 340 → 47,3 → 292 ; **360 → 50,7 → 272** ; 380 → 54,0 → 252 ; 400 → 57,6 → 232. Le pied tient sur une rangée dès 300.

## Le correctif (§ 2)

**Largeur retenue : 360 px.** C'est la plus proche de 50 caractères par ligne, et le pied y tient sur une rangée. **La copie y perd 160 px** à tous les formats : 432 → 272 à 1180, 532 → 372 à 1280. En Annoter, rien ne change, puisque ces palettes n'y existent pas.

- `styles.css` : `#travaux-palette-eval-retro { width: clamp(200px, calc(100% - 556px), 360px) }`. La borne garde Paramètres, Évaluation et la Rétroaction côte à côte dans une zone étroite (iPad en portrait, 820 de large : la Rétroaction y cède), et jamais sous les 200 d'avant.
- Évaluation se cale contre elle comme avant (écart de 8), et Paramètres ne bouge pas. Une largeur posée à la poignée l'emporte, puisqu'elle est en ligne.
- **Trouvaille corrigée dans le lot (`6f9aae1c`)** : ↕ (disposition verticale) posait 200 px en dur et l'enregistrait. Un seul toucher aurait donc ramené la Rétroaction à son ancienne largeur pour de bon. Et une Rétroaction ouverte en bandeau puis remise en colonne aurait couvert Évaluation, restée à son repli (220). Désormais, ↕ rend à la Rétroaction la largeur de la feuille de style, et Évaluation se recale contre elle. Le calage a déménagé de `travaux-ui.js` à `travaux-outils.js` : une seule fonction sert l'ouverture et ↕.

**Source ou stock** : la source est tarie, le stock est assumé. Une largeur déjà enregistrée chez quelqu'un (poignée, ou ↕ avant ce lot) l'emporte, comme le veut la consigne : sa Rétroaction ne s'ouvre pas à 360. Rien n'est réécrit. Si Grégoire ne voit pas 360 sur l'iPad, un toucher sur ↕ de la Rétroaction la ramène à sa largeur d'ouverture.

## Les tests (§ 3)

`tests/integration/palette-retroaction-compacte.spec.js` : 22 essais, tous verts.

- **Neufs** :
  - À 1180 × 820 et 1280 × 720, hors plein écran et en plein écran : de 45 à 55 caractères par ligne sur le texte de démo (plus de 20 lignes pleines), le pied sur une rangée avec ses trois boutons, l'écart de 8 entre Évaluation et la Rétroaction, les trois palettes dans la zone.
  - iPad en portrait (820 × 1180) : Évaluation ne couvre pas Paramètres, et la Rétroaction reste entre 200 et 360.
  - ↕ depuis un bandeau : 360, une largeur enregistrée vide, Évaluation recalée sans chevauchement.
- **Mis à jour** :
  - Les largeurs : 200/316/200/8/432 devient 200/316/360/8/272, valeurs tirées de la mesure.
  - Les trois mots de la bande et le pied : vérifiés à l'ouverture (360, une rangée), puis à 200 posés à la poignée (le pied sur deux rangées).
- **Inchangé et vert** : une Rétroaction en bandeau ne pousse pas Évaluation hors de la zone (repli à 220).

**Contre-épreuves** : chaque sabotage a été restauré, et `cmp` confirme les fichiers identiques après coup.

| Sabotage | Résultat |
|---|---|
| Sans la largeur (retour à 200) | 3 rouges : largeurs, et les deux formats |
| Trop large (460) | 3 rouges (au-dessus de 55 caractères) |
| Sans la borne du portrait (360 fixe) | 1 rouge : le portrait |
| Écart de 20 au lieu de 8 | 4 rouges |
| ↕ à 200 en dur | rouge |
| ↕ sans le recalage d'Évaluation | rouge |

**Specs voisines** : 77 essais verts, à travers 8 specs (la Rétroaction, Évaluation compacte, #1214, #868, #911, #651, la copie à sa taille, les deux doigts). **Vitest entier** : 10 615 verts.

## Pas encore

- Le vrai Safari et l'iPad. C'est une porte terrain pour la prochaine mise en ligne : en Évaluer, la Rétroaction s'ouvre-t-elle large, et ↕ la ramène-t-elle à cette largeur si elle reste étroite ?
- Le rouge GitHub (WebKit Linux) de la 1.230.0 : 8 essais, dont `palette-retroaction-compacte` (couleurs en mode sombre). Inscrit, pas encore lu. Ce lot ne touche pas aux couleurs.
