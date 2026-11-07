# Rapport — lot « L'accueil épuré » (7 nov. 2026), et #1240

Consignes : `CONSIGNE-LOT-2026-11-07-accueil-epure.md` et `CONSIGNE-2026-11-07-chaine-des-quatre-lots.md`.
Branche `lot/en-tete-epure`, non fusionnée, rien au changelog. Écrit par Claude Code. Captures :
`Claude outputs/captures-2026-11-07-accueil-epure/` (WebKit ; accueil à 1180, 820 et 390 px, sombre et clair, « À
propos » ouvert puis replié ; pied de page à 1180 ; le témoin #1240 à 360 px).

## 1. #1240, le témoin « Non enregistré »

**Mesuré** (WebKit, présences de la démo, page en haut) : sous 768 px, le témoin flottant (270 × 208 px) couvrait
« ← Précédent », la date ou « Rapport » à l'affichage ; à 768 px et au-delà, rien. **Fait** : sous 780 px (le seuil
de l'iPhone pour l'en-tête), il se pose dans la page, juste au-dessus de « Date du cours » et de ses boutons. Spec
`temoin-dans-le-flux-1240.spec.js` : les deux boutons touchés (un vrai toucher) à 360 et 390 px, sombre et clair,
et ils font leur geste. Casse vérifiée : la place retirée, 6 essais sur 7 rougissent.

Ce que j'ai décidé seul :
- **Seule la page des présences déclare une place.** Ailleurs, sous 780 px, le témoin flotte comme avant. La
  consigne ne nommait que les présences ; étendre aux autres pages demande de choisir une place par page.
- **Un échec arrivé plus bas dans la page est amené à la vue** (défilement au plus près). Sans cela, il serait
  hors de l'écran — le défaut que le témoin existe pour éviter.
- **Restent flottants** : le « Enregistré » passager (dans la page, il ferait sauter le contenu à chaque
  enregistrement automatique), et le « Non enregistré » quand une fenêtre ou Annoter en plein écran est ouvert.

## 2. Avant de coder : les constats demandés

**La démo.** La carte « Tu es conseiller·ère pédagogique ? » faisait le même geste que la case « Données démo » :
elle cochait la case et appelait son gestionnaire. On quitte la démo par « Quitter la démo », dans le bandeau vert
au bas de l'écran — la case n'était pas le seul moyen. Elle est donc retirée ; « Explorer » appelle directement
l'entrée de la démo, qui porte la même garde (un import de copies en cours l'empêche).

**Les destinations.** Huit cartes mènent où la consigne le dit (vérifié par un essai qui clique chacune). **Un
écart** : « Adopter ta pratique » ouvre l'assistant de pratique en fenêtre, par-dessus l'accueil, et ne navigue pas
vers Conception › Pratiques. Comportement gardé ; la carte affiche quand même « Conception › Pratiques », le mot de
la consigne. À trancher (§ 5).

## 3. Ce que j'ai décidé seul (à corriger en dix secondes si c'est faux)

- **Les portes n'ont plus de boîte** : elles sont dans « À propos », qui est une carte ; la règle du quatrième lot
  (« jamais de carte dans une carte ») est déjà appliquée ici. Trois colonnes séparées par un filet.
- **« À propos » retient le choix fait avant le premier trimestre** : replié sans trimestre, il se rouvre ; dès
  qu'un trimestre existe, le dernier choix s'applique. Le trimestre de la démo ne compte pas.
- **Les colonnes s'empilent sous 820 px** : à 820 (iPad debout), elles restent côte à côte.
- **Le pied de page** affiche « Bêta publique 1.235.0 » ; le numéro de build qui suivait sur la carte Nouveautés
  n'y est plus (il reste dans Réglages › À propos). Le logo vient de `img/` (la copie publiée, celle de l'en-tête),
  pas de `Logo/`. « Le blog : codexnumeris.org » est un seul lien.
- **La neuvième icône** : deux bulles dessinées au trait (2 unités sur 30, comme « Annoter »). Les huit autres
  sont pleines ou au trait selon leur origine ; aucune n'a changé de forme.
- **Contrastes** : posés sur le fond de la page, la version (4,4:1) et la devise du pied (3,4:1, couleur héritée
  de l'ancien pied) tombaient sous 4,5:1 en clair. Les deux passent au texte secondaire : 5,71:1 (clair),
  6,76:1 (sombre). Le reste : chemins des tâches 4,92:1 et 5,63:1 ; liens et intertitres 5,33:1 et 6,38:1.

## 4. Les textes devenus faux — versés à l'inventaire de « Les pages sans doublons »

Retirer les deux cases de l'accueil rend faux des textes que la consigne ne nommait pas. Je ne les ai pas touchés ;
ils entrent dans l'inventaire du lot 3, soumis à Grégoire :

| Où | Ce qu'il dit |
|---|---|
| Aide, liste des modes (`index.html`) | « Données démo, une case de la page d'accueil » |
| Aide, « Explorer la démonstration » | « Cocher « Données démo » sur la page d'accueil ouvre un cours fictif… » ; « ou décoche « Données démo » » |
| Aide contextuelle « i » de la case (`accueil-donnees-demo`) | son bouton est parti avec la case : l'entrée n'a plus de déclencheur |
| Glossaire, « mode assistance » | « ou par la case « Assistance » de la page d'accueil » |
| Aide contextuelle de la visite, glossaire « visite guidée » | « la relancer depuis le bouton… » de l'en-tête (la visite elle-même est corrigée, consigne) |

## 5. Questions pour Grégoire

1. **« Adopter ta pratique »** : garder l'assistant en fenêtre (et le chemin affiché « Conception › Pratiques »),
   ou mener à la page Pratiques comme les autres cartes ?
2. **Les captures** : l'accueil à 1180, 820 et 390, et le témoin à 360 — accord pour passer au lot 3 ?

## 6. Trouvailles et leur disposition

1. **Les règles CSS `.accueil-nouvelles-*`** (index.html) : aucun élément ne les emploie, avant comme après ce lot.
   **Commentées et oubliées** (sans conséquence).
2. **À 360 px, le champ de date des présences** est écrasé entre ses deux boutons (visible sur la capture du
   témoin) : existait avant le lot. **Signalé, non inscrit** (aucun symptôme vécu).

## 7. Vérifications

- **Vitest entier** (depuis `tests/`) : 10 752 sur 10 752 verts. Sentinelles réalignées : #846 (l'accueil ; blocs
  B1 à B5 réécrits), T7 (la case de l'accueil devient « Explorer »), lot F (la carte « Ton codex »), glossaire du
  lot 3 de l'Aide (la case « Assistance »). Casse : « C'est une application » remis, 2 rouges ; « Explorer » sans
  l'entrée de la démo, 3 rouges ; empreinte du fichier identique après restauration.
- **Playwright WebKit** : `accueil-epure-2026-11-07.spec.js` (8 essais et 6 de captures), `en-tete-epure`,
  `lot-f-placement-mots`, `temoin-dans-le-flux-1240` (7), `temoin-enregistrement-lot-b` (13) : tous verts.
- **Verdict Playwright complet : PAS pris** (consigne : une fois, après l'accord sur le quatrième lot).
