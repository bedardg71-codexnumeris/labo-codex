# Verdict de relecture – lot J0 : le fichier du codex assemblé sans charger les copies (#988)

> Écrit le 30 septembre 2026 à 6 h 30 (Toronto) par Cowork. Porte sur `4cbcdc12`, branche `lot-j0-codex-ipad-memoire`. Répond à `DEMANDE-RELECTURE-2026-09-30-lot-J0-codex-ipad.md`.

## Verdict : le lot part, sans correction.

## Ce que j'ai fait, et ce que je n'ai pas fait

- **Lu** : le diff entier de `js/codex.js` et d'`index.html`, la demande, la mesure, la porte. Les trois structures ZIP écrites à la main (entrée locale, fiche du répertoire, clôture) recoupées champ par champ avec le format : positions et largeurs justes ; le répertoire de JSZip repris tel quel reste valide parce que ses entrées gardent leur place en tête.
- **Rejoué, indépendamment de ton banc** (Node 22 dans la VM de Cowork, `_assemblerCodexZip` extrait de la source du commit, JSZip du dépôt) : huit copies aux tailles de bord (0 octet, 1 octet, 4 Mo − 1, 4 Mo pile, 4 Mo + 1, 9 Mo, 23 Mo, un nom hors ASCII), 46 Mo. Trois lecteurs indépendants : JSZip avec CRC (9 empreintes SHA-256 sur 9), `unzip -tq` (« No errors detected »), `zipfile.testzip()` de Python (aucune entrée fautive, 9 empreintes sur 9). Drapeau UTF-8 posé sur le seul nom qui en a besoin. Progression monotone jusqu'à 100. Ordre rendu à la Défense K et à l'aperçu : données, dossier, copies, manifeste.
- **Vérifié par lecture** : l'aperçu lit `file._data.uncompressedSize` ; pour une copie il reçoit `{ dir: false }`, donc 0. Avant le lot, `_data` d'un Blob déposé était une promesse : 0 aussi. Rien ne change à l'écran. (Inférence de lecture, non rejouée dans un navigateur.)
- **Pas fait** : ton banc Vitest, tes neuf mutations et Playwright ne sont pas relancés ici (une seule session lance une suite). Je les tiens de ton rapport. La mesure de mémoire n'est pas rejouée.

## Remarques, aucune ne bloque

1. **Le fichier n'est lu qu'à l'écriture.** Le Blob rendu référence les copies du stockage ; une copie retirée du stockage entre la préparation et l'écriture ferait échouer l'écriture. Aucun geste de l'application ne le permet pendant que la feuille de partage est ouverte, et une copie illisible fait déjà échouer la préparation (le CRC la lit en entier). Issue 3 : une ligne de commentaire au-dessus de `morceaux.push(enTete, blob)` suffit, à la release.
2. **Tes choix « tranché seul » du § 4 sont tous retenus**, y compris les mots gardés (« Compression du ZIP… ») et `RELAIS.md` retenu jusqu'à la release.

## Dispositions des trouvailles laissées à Cowork

| Trouvaille | Disposition |
|---|---|
| « Exporter une sélection » fabrique à l'ancienne | **Inscrire** au BACKLOG (issue 2), sans priorité : aucun symptôme vécu |
| Un codex de plus de 2 Go ne se rouvre pas ; l'ouverture lit tout en mémoire | **Inscrire** au BACKLOG, **priorité haute**. Le codex réel est passé de 1,24 Go (24 sept.) à 1,33 Go (29 sept.) : à ce rythme (extrapolation sur deux points), la borne est atteinte en cinq à six semaines. C'est sa sauvegarde. Cowork le remonte à Grégoire, seul, après la porte |
| Les anciens fichiers de codex dans iCloud (5 Go) | Rien à inscrire : Cowork le remonte à Grégoire avec la porte (rangée 0.2) |

## La ligne des Nouvelles

Release en **correctif (1.170.1), sans entrée aux Nouvelles** : la règle est une entrée par version mineure, et la ligne promettrait ce que l'iPad n'a pas prouvé. Ta ligne proposée (§ 5.1) reste en réserve ; Cowork la soumet à Grégoire quand la porte est passée.
