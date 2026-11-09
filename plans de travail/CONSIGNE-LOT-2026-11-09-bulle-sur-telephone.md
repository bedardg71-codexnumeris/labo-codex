# Lot « La bulle sur téléphone » — consigne du 9 novembre 2026

Décidé avec Grégoire le 9 nov. 2026, 9 h 19, en Cowork ; ajout du 9 nov., 9 h 51 (le filet de
sécurité de toutes les bulles). Relayé à la nouvelle instance du Mac (celle de la partie 1).
Branche `lot/bulle-sur-telephone`. Groupe 2 des verdicts (décision du 9 nov., 10 h 26) : pas
de verdict complet ni de release dans ce lot.

## Le constat

Quatre rapports de la nuit, Chromium à 390 px : parcours 2, 8, 9, vérifications 3 à 5. Sur
téléphone, la bulle couvre ce qu'il faut toucher (« Créer… », la date des présences,
« + Nouvelle grille ») ; le témoin « Enregistré » recouvre « Plus tard » ; la carte
d'alignement et Annoter ne sont pas utilisables à cette largeur, bulle ou pas.

## Validé par Grégoire

1. Dans le moteur (`js/parcours-moteur.js`), sur téléphone, la bulle se range en bas de
   l'écran, repliée : son titre et « n sur N » seulement. Un toucher la déplie ; dépliée, elle
   ne couvre pas la zone éclairée. Un toucher la replie. Le seuil (largeur ~500 px suggérée par
   la session H), le geste exact et le cas de l'iPad en écran partagé : c'est la session qui
   tranche, et elle nomme ce qu'elle a supposé. Corriger aussi le recouvrement du témoin
   « Enregistré » sur « Plus tard » (la bulle passe au-dessus ou le témoin se décale, selon ce
   qu'elle juge le plus sûr).
2. Les parcours « Monter ton cours » (pas encore codé) et « Automatiser tes commentaires »
   (branche `lot/parcours-8-automatiser-tes-commentaires`) ne sont pas proposés sur téléphone.
   Dans le panneau, sous leur titre, ce texte validé, mot pour mot : « Ce parcours se fait sur
   un écran plus grand : une tablette ou un ordinateur. » ; « Commencer » ne lance rien. En
   faire une propriété générique du registre des parcours (un parcours la déclare) ; ne coder
   ni le parcours 5 ni le 8 ici. Écrire dans le rapport, sous « À reporter », la ligne à
   ajouter à la consigne du parcours 5 et à la branche du 8 lors de sa fusion.

### Ajout du 9 nov., 9 h 51 : le filet de sécurité de toutes les bulles

Filet de sécurité pour toutes les bulles, à toutes les largeurs. Quand une bulle dépliée est
plus haute que l'espace disponible (fenêtre courte, iPad à l'horizontale, clavier ouvert), elle
se limite à cet espace et son texte défile à l'intérieur ; le titre, « n sur N », la ligne
orange du geste et ses boutons restent visibles hors de la zone qui défile. Le défilement au
doigt ne doit pas faire défiler la page derrière (essai). Au-delà de ce cas, rien ne change :
une bulle qui tient reste telle quelle (preuve sur les captures de « Découvrir » à 1180 px).

## Ce qui ne change pas

Au-delà de 500 px, rien ne bouge. Les captures de « Découvrir » que Grégoire a approuvées à
1180 px doivent rester identiques : preuve dans le rapport.

## Vérification

Spec Playwright à 390 px (bulle repliée, dépliée, la zone éclairée touchable dans les deux
états, « Plus tard » atteignable) et à 1180 px (rien n'a changé) ; break-test ; Vitest depuis
`tests/` ; relecture par un agent neuf. Captures WebKit à 390 px de « Découvrir », étapes 1, 5
et 8, repliée et dépliée, et du panneau avec le texte du refus, dans
`Claude outputs/captures-2026-11-09-bulle-sur-telephone/`.

## Arrêt avant la release

Grégoire juge d'abord ces captures (Cowork les lui présente). Pas de verdict complet, pas de
release avant son accord.
