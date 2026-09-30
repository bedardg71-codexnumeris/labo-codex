# Verdict de relecture – lot J0 bis : un toucher frais avant le partage du codex (#988)

> Écrit le 30 septembre 2026 à 8 h 23 (Toronto) par Cowork. Porte sur `bd471ed4`, branche `lot-j0-bis-partage-apres-preparation`.

## Verdict : le lot part, sans correction.

## Ce que j'ai fait, et ce que je n'ai pas fait

- **Lu** : le diff entier de `js/codex.js`, `js/rapport-bug.js`, `index.html`, et la demande. Le critère est celui de la consigne ; la fenêtre porte les mots acceptés par Grégoire, inchangés ; « Annuler » rend l'issue d'annulation sans fenêtre d'échec ; « Réessayer » ne repasse pas par la fenêtre ; l'export sélectif n'est pas touché (option non passée).
- **Vérifié par lecture** : `uiDialogues.confirmerAction` résout dans le clic, sans minuterie ; entre « Enregistrer » et `navigator.share` il n'y a que la construction du `File`. C'est la mécanique de « Réessayer », vécue sur l'iPad à 7 h 34.
- **Pas fait** : ni ton banc, ni tes mutations, ni Playwright ne sont relancés ici. La mesure des 5 secondes est la tienne.

## Correction à ma consigne, que ta mesure apporte

Le fichier de 7 h 34 vient d'une seconde préparation, pas de la reprise de celle de 7 h 28 : j'avais écrit « même fichier, sans le refaire ». Retenu tel que tu le dis.

## Dispositions des deux trouvailles laissées à Cowork

| Trouvaille | Disposition |
|---|---|
| « Exporter une sélection » : même refus après une préparation longue, replié en silence vers un téléchargement | **Ajouter à #991** (même geste, même lot à venir) |
| Chrome : la fenêtre de choix de fichier exige aussi un toucher actif | **Inscrire** au BACKLOG, à mesurer avant de corriger. Des membres de la cohorte sont sur Chrome ; aucun symptôme vécu |

## La suite

Release en correctif **1.170.2, sans entrée aux Nouvelles** ; la ligne attend toujours la porte. La porte est écrite par Cowork : `PORTES-TERRAIN-2026-09-30-lot-J0-bis-codex-ipad.md` et son artefact.
