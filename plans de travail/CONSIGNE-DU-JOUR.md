# Consigne – lot court : une rétroaction finale réécrite à la main ne suit plus les niveaux

> Écrite le 26 septembre 2026, à 18 h 59 (Toronto), par Cowork. **Ne commence qu'une fois 1.160.2 poussée** (`git log origin/main` montre `958683a7` ou plus récent). Au début du lot : archive l'actuelle `CONSIGNE-DU-JOUR.md` (#960) sous `_ancienne-CONSIGNE-DU-JOUR-2026-09-26-lot-960.md`, puis renomme celle-ci en `CONSIGNE-DU-JOUR.md`. À remesurer avant tout code. Lot court, AVANT le lot B ; cap « finir la rétroaction ». **Aucune mesure du stock** (demande de Grégoire).

## 0 · Ménage d'ouverture

- Supprime la branche locale `lot-960-retroaction-a-la-main` (fusionnée dans `main`, jamais poussée seule ; 1.160.2 en production chez Netlify depuis 18 h 56, constaté par Cowork).

## 1 · Le constat (le tien, point 4 de #960, `[exécuté]`)

Changer le niveau d'un critère APRÈS une rétroaction finale réécrite à la main remplace toute la rétroaction par le texte régénéré (`niveauSelectionne` → `genererRetroaction(1)` ; idem `pointsSaisis`), sans avertissement ; l'auto-save l'écrit 1,5 s plus tard. Par la copie et par la Liste. Le texte à la main est perdu.
⮕ **Inscris la fiche** au BACKLOG (prochain ID), disposition « tranché par Grégoire, lot court », avec la ligne ci-dessous.

## 2 · La décision de Grégoire (26 sept., option b, recommandée par Cowork)

**Une rétroaction finale réécrite à la main ne suit plus les niveaux.** Changer un niveau ou des points ne la remplace plus. Une ligne d'avis, sous la zone de rétroaction, le dit : « Tu as réécrit cette rétroaction : elle ne suit plus les niveaux. », avec un bouton « Régénérer » qui, lui seul, remplace le texte par la version générée (après quoi elle suit de nouveau les niveaux). Motifs : « ce qui est enregistré fait foi » (#939, #946, #960) appliqué jusqu'au bout, et aucun texte perdu ; une fenêtre à chaque changement de niveau interromprait plusieurs fois par copie.
⮕ Ajoute-la à `plans de travail/DECISIONS-2026-09-26-enregistrement.md` comme **D7 · Une rétroaction réécrite à la main ne suit plus les niveaux**, avec ces mots. Les deux textes (l'avis et « Régénérer ») sont acceptés avec l'option ; `[à vérifier]` s'ils tiennent sur iPad à côté de la zone.

## 3 · Ce qui est attendu (tranché par Cowork, question technique)

- **Qui est « réécrite à la main »** : une frappe de l'utilisateur dans la zone (l'événement `input` de `retroactionModifiee`, que `.value = …` ne déclenche pas). Le marqueur se **persiste** avec l'évaluation, pour qu'une copie rouverte le garde.
- **Stock sans marqueur** : à l'ouverture, une rétroaction enregistrée qui DIFFÈRE du texte que la génération donnerait compte comme réécrite (le sens sûr : dans le doute, on ne remplace pas). Si la comparaison n'est pas fiable (options d'affichage, gabarits changés depuis), dis-le et arrête-toi avant de coder ce volet.
- **« Régénérer »** efface le marqueur et remplace ; rien d'autre ne l'efface. « Changer de cartouche » confirmé (#944) : dis ce qu'il fait aujourd'hui de la rétroaction finale, sans le changer dans ce lot.
- **Aucune donnée réécrite** à l'ouverture (la neutralité de #960 tient : banc `evaluation-959-neutralite-chargeur`).

## 4 · Preuves

- WebKit, par la copie ET par la Liste : réécrire, changer un niveau, attendre > 1,5 s → base et écran gardent le texte, l'avis s'affiche ; « Régénérer » → texte généré, avis parti, un niveau changé ensuite suit de nouveau. Même chose par les points d'un critère analytique.
- Rouvrir une copie réécrite (marqueur en base) → avis présent, niveau changé → texte gardé.
- Mutations : marqueur non persisté ; garde retirée dans `niveauSelectionne` ; garde retirée dans `pointsSaisis` ; « Régénérer » qui n'efface pas le marqueur. Chacune rouge.

## 5 · Livraison

Commit sur branche, demande de relecture croisée dans `plans de travail/DEMANDE-RELECTURE-2026-09-26-<fiche>.md`, et arrête-toi : Cowork relit. **Cases à cocher à la livraison** : la fiche inscrite au § 1. **Nouvelles** proposées par Cowork, à faire accepter par Grégoire : « Évaluer : une rétroaction finale que tu as réécrite à la main n'est plus remplacée quand tu changes un niveau ; le bouton « Régénérer » la refait à la demande. »
