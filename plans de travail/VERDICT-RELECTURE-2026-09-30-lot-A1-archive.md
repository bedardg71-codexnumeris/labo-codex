# Verdict de relecture – lot A1 : une archive fabriquée comme le codex (chantier des archives)

> Écrit le 30 septembre 2026 à 13 h 28 (Toronto) par Cowork. Porte sur `6187882f`, branche `lot-a1-archive-sans-copier`.

## Verdict : le lot part, sans correction de code. Une décision de mots attend Grégoire avant la release.

## Ce que j'ai fait, et ce que je n'ai pas fait

- **Lu** : le diff entier de `js/reserve.js`, le module neuf `js/fichier-sortant.js`, ton rapport.
- **Comparé ligne à ligne** : `assemblerZip` du module à `_assemblerCodexZip` de `main`. Dix lignes diffèrent, toutes des noms ou des messages d'erreur ; `_crc32` est identique ; `entreesDuZip` ne change que par le dossier des copies, devenu un paramètre. La pièce relue ce matin est donc déplacée, pas réécrite.
- **Rejoué, indépendamment de ton banc** (Node 22, le module de la branche, JSZip du dépôt) : une archive à la forme réelle (`trimestres/<dossier>/travaux/`), huit copies aux tailles de bord, un nom hors ASCII. JSZip avec CRC : 8 empreintes sur 8 ; `unzip -tq` sans erreur ; `zipfile.testzip()` de Python sans entrée fautive, 8 empreintes sur 8. L'ordre rendu à la Défense K et à l'aperçu place les copies sous leur dossier.
- **Lu** : l'appelant (`actionVerser`) n'annonce rien quand l'usager ne confirme pas ; le registre n'est écrit qu'après « Il y est ».
- **Pas fait** : ton banc, tes mutations, Playwright et la mesure de mémoire ne sont pas relancés ici. Le mode dossier n'est pas rejoué.

## Tes choix « tranché seul » : tous retenus

Le module commun (plus large que la consigne, mais il évite le doublon et respecte la spécification d'avril), l'empreinte dans `meta.json`, « Réessayer » qui relance le même fichier, `RELAIS.md` retenu jusqu'à la release.

## Une remarque, sans correction demandée

L'empreinte de chaque copie est calculée à la collecte, **avant** l'aperçu : un aperçu annulé a coûté la lecture de toutes les copies. Acceptable à 4,6 s ; à noter si la durée devient gênante sur l'iPad.

## Ce que ta réponse apporte au plan

Une copie peut changer après son import (éditeur de pages, « Ré-importer » sur un fac-similé, ouverture ou fusion d'un codex). Le lot A4 comparera donc les empreintes **au moment du retrait**, pas seulement à la vérification. Retenu au plan.

## La release

- **Correctif, sans entrée aux Nouvelles** (tranché par Cowork) : la ligne viendra avec le lot A2, quand l'archive se vérifie ; d'ici là le geste est amélioré, pas neuf.
- **Les mots de « Groupe non archivé »** : Cowork recommande l'option (b), sans la phrase sur l'espace. Ils sont soumis à Grégoire ; la consigne de release suit sa réponse.
