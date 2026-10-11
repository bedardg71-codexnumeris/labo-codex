# Demande de relecture – lot 17 : des fenêtres qui parlent comme l'application

> Claude Code, 11 octobre 2026, 16 h 51 (mesuré par `date`). Consigne : `CONSIGNE-DU-JOUR.md`, série des lots 14 à 19.
> Sur `main`, **non poussé, pas de release, pas de verdict Playwright**. Vitest complet vert (736 fichiers, 8 660 essais). Une spec Playwright lancée seule (§ 2).

## 1 · Ce qui change pour l'usager

- Bibliothèque des trimestres : « Supprimer… » pose sa question, demande le nom et dit le résultat par les fenêtres et les notifications de l'application ; la bibliothèque vide aussi. « Clore » et « Rouvrir » ne changent pas (moratoire de l'archivage) (#1037).
- Partage, confirmation d'export : l'avertissement « grille utilisée dans N trimestres » a la mise en forme d'une alerte (#951).
- Présences : l'en-tête de la colonne « Présence » garde son infobulle après le premier affichage d'une séance (#783).
- Productions : fermer le formulaire fait la même chose quel que soit le bouton ; supprimer la production affichée ne laisse plus de surlignage dans la barre latérale (#633).
- Grilles : enregistrer une grille dont les critères ne totalisent pas 100 % le dit, sans bloquer (#483, une moitié).

## 2 · Fiche par fiche

| Fiche | Commit | Remesure sur main | Geste |
|---|---|---|---|
| #951 | `6a956db5` | `texte-avertissement` toujours sans règle CSS | `alerte alerte-attention` (patron #583) |
| #783 | `81a60e0a` | deux gabarits ; celui du JS perdait l'infobulle `data-tooltip` | le JS ne pose plus que le nombre de périodes et l'état verrouillé sur les boutons du gabarit d'`index.html` |
| #633 | `d6afd557` | deux corps vivants, quatre sites | un seul corps, union des deux ; la couche `window` retirée ; le témoin « mise à l'écart #633 » de #626 retourné en sentinelle |
| #483 (moitié) | `8cd87b3a`, `fc66c820` | aucune confirmation à l'enregistrement | avertissement non bloquant au geste explicite ; silence en sauvegarde automatique |
| #536 | `c90e0434` | `idmeMoyen` n'a **aucun lecteur** | le champ retiré des deux producteurs, avec `_tablePour` resté sans appelant ; aucun mot neuf (aucun écran ne l'affichait) |
| #1037 | `57168148` | 14 `alert`, 3 `confirm`, 1 `prompt` | les 9 hors moratoire convertis ; les 9 de « Clore », « Rouvrir » et `archiverTrimestreActif` restent |

Vérifications : #951 1 mutation rouge ; #783 2 ; #633 2 ; #483 3 ; #536 1 ; #1037 3 (la troisième a d'abord survécu : un essai « Annuler à la confirmation » a été ajouté au banc #361). La spec `1007-codex-a-part-avant-suppression` (trois tests X1) suivait la suppression d'un trimestre par ses dialogues natifs : réécrite sur les fenêtres de l'application (`repondreSuppressionX1`) et lancée seule, **3 verts sous WebKit (44,8 s)** ; ce n'est pas un verdict. Bancs ajustés : #361 (fenêtres et notifications au lieu des natifs, qui lèvent désormais), #626, #768 (commentaire), type-grille lot 1 (`warning`).

## 3 · Mots d'écran – à soumettre à Grégoire

1. Grille enregistrée hors 100 % (`js/grilles.js`, notification d'avertissement) : « **Grille enregistrée : ses critères totalisent N %, pas 100 %.** »
2. « Supprimer… » un trimestre : les mots d'avant, mais le titre et le message séparés dans la fenêtre ; les deux boutons d'action disent « **Supprimer** » (les natifs disaient « OK »).
3. Gardé tel quel, à signaler : la bibliothèque vide dit encore « Cliquez sur "+ Nouveau trimestre" pour en créer un. » (vouvoiement d'origine).

## 4 · Ce qui revient à Grégoire

**#483, l'autre moitié.** En sommative, `pratique-sommative.js` ≈ 101 et ≈ 150 pèsent `production?.ponderation || 1` : une évaluation dont la production est introuvable, **et** une production de pondération 0, comptent pour 1 (audit du 16 sept., D-3 : 85 au lieu de 87,43 quand une classe passe de STD à SOM). Les exclure change des notes d'élèves de l'automne 2026 ; et le constat D-3 est noté comme « matériau du labo ». Fiche laissée ouverte pour cette moitié.

**#678** : pas ouverte, le lot n'est pas resté petit ; la mesure est dans la fiche.

## 5 · Ce que j'ai supposé – une ligne chacune

- #783 : le premier bouton garde « ✓ » jusqu'au premier rendu d'une séance, comme avant.
- #633 : « Fermer » et « Supprimer » (fiche) remettent maintenant la production en édition à zéro ; rien n'en dépendait après la fermeture. Le test manuel inscrit à la fiche (Mac et iPad : enregistrer, supprimer la production affichée, Fermer) reste dû.
- #483 : la confirmation suit la même somme que l'indicateur de l'éditeur ; elle vaut aussi pour une grille en points (comme l'indicateur).
- #536 : un champ sans lecteur n'a pas à dire « pas de donnée » ; retiré plutôt que corrigé.
- #1037 : les gestes d'archivage gardent leurs natifs tant que le moratoire tient.
- Trouvaille, issue 3 : `pratique-pan-standards.js` ≈ 795 déclare `cacheTables` sans le lire (préexistant).
- Les specs Playwright des présences, des productions et des grilles n'ont pas été relancées.

## 6 · Item de Nouvelles proposé

« Supprimer un trimestre se fait maintenant dans les fenêtres de l'application, et enregistrer une grille dont les pondérations ne font pas 100 % te le signale. »
