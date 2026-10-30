# Rapport du lot 1 : une seule source par famille de seuils (30 oct. 2026)

Commit du lot : `b6b74585`, retouche d'échappement ensuite. Aucun résultat sur données réelles ici : ils restent en page privée.

## Ce qui lit quoi

| Famille | Source | Lecteurs |
|---|---|---|
| A et C | Labo › Outils d'observation, défauts 95 · 90 · 85, quatre paliers (`interpretation.*`) | mots, couleurs de la liste, pastilles, badge du contexte, carte et encadré Mobilisation, filtre « A ou C < … », barres A et C |
| P | Repères de l'échelle des copies du groupe (`seuilSuffisance`, `seuilMaitrise`, `reperesPerformance`) | pastille, filtre « P < … », couleur de la liste, barre P, répartition, RàI, suggestion d'objectif, lettre du bilan |
| Note de passage | `NOTE_DE_PASSAGE` | repli sans repère, phrase sans SOLO ni RàI, Aide |

Module : `js/contexte-qualification.js`. Défauts : `js/interpretation-config.js`.

## Ce que j'ai fait quand l'échelle ne répond pas

| Cas | Ce que fait le code | Statut |
|---|---|---|
| Échelle sans repère | Seule la note de passage signale ; pas de test « sous la maîtrise » | Dit, à confirmer |
| Plusieurs échelles, mêmes plages | Une seule ; repères de celle qui en porte | Dit |
| Plusieurs échelles, plages différentes | Aucune choisie ; note de passage (`echelles-divergentes`) | Dit |
| Échelles en bibliothèque sans copie | Ignorées : seules les copies comptent | Dit |
| Pratique sommative ou par spécifications | Pas d'échelle pour la note (règle du 27 août, `lireEchelleNoteGlobale`) ; note de passage seule | **Touche au sens : à Grégoire** |
| Un seul repère, la maîtrise | Pastille rouge sous la maîtrise, niveau 3 sous la note de passage | Dit |
| Pack de démo | Repères D et M posés sur ses deux échelles | Dit |
| Échelle de départ d'un nouvel utilisateur | Sans repère, inchangée | **À Grégoire : les semer ou non** |

## Stock (tarir n'est pas réparer)

Rien n'est écrit dans les réglages enregistrés. Les nouveaux défauts valent pour qui n'a rien enregistré. `idme` (0,64 / 0,75 / 0,85) reste dans l'objet enregistré et voyage dans le codex ; plus aucun code ne le lit. Grégoire change lui-même ses réglages : Labo › Outils d'observation, section des seuils d'interprétation, « Restaurer », ou les trois champs à la main.

## Mots à valider par Grégoire

| Où | Avant | Proposé (déjà dans le code, non livré) |
|---|---|---|
| Palier le plus bas | « Absences fréquentes » et « très fréquentes » | « Absences très fréquentes », « Travaux manquants très fréquents » (le plus fort qui existait ; variante : « Absences fréquentes ») |
| Filtres | « P < 65 % », « A ou C < 70 % » | Valeurs lues : « P < 65 % » selon l'échelle, « A ou C < 85 % » |
| Aide, Détails | Les filtres chiffrés | « Les filtres sur P, sur A ou C, « Suivi » et « RàI 2-3 » se combinent […]. Le filtre sur P part du repère « Suffisant à partir de » de ton échelle, ou de la note de passage sans repère ; celui sur A ou C, du palier le plus bas réglé dans Labo → Outils d'observation. » |
| Aide, profil | « trois paliers fixes, 85, 75 et 65 % » ; « sous 75 % » | « suit les trois bornes réglées dans Labo → Outils d'observation […] » ; « dès que A ou C passe sous « Absences rares » » |
| Aide, mots de A et C | « 85, 80, 70 […] La borne de 60 % est fixe. […] colorent A, C et P » | Bornes lues ; « Les mêmes trois bornes colorent A et C dans la liste, dans les pastilles et dans les barres. P se lit dans les repères de ton échelle […] ; sans repère, seule la note de passage le signale. » |
| Aide, RàI et patterns | « 64 % et 75 %, fixes », « sous 64 % », « sous 75 % » | « les repères de ton échelle », « sous le repère de suffisance (sans ce repère, sous la note de passage) », « sous le repère de maîtrise » |
| FAQ, seuils | « 70, 80, 85 », « 60 fixe », « Mobilisation fixe » | Sans nombre : ces bornes décident de tous les signaux de A et de C, et de la Mobilisation |
| Bulles, terme, guide RàI | « 70 / 80 / 85 », « 64 % ou 75 % » (texte validé n° 16) | Sans nombre : « le prochain repère de ton échelle », « sous le repère de maîtrise » |

Non changé, proposé : le refus de sauvegarde dit encore « Fragile < Acceptable < Bon », mots qui ne sont plus à l'écran. Proposition : « « Quelques absences » < « Absences rares » < « Aucune absence ou presque » ».

## Sentinelles recalées : valeur, nouvelle valeur, décision

Décisions du 30 oct. : **D1** défauts 95 · 90 · 85 ; **D2** quatre paliers, sans 60 fixe ; **D3** P lu depuis l'échelle ; **D4** note de passage à une source ; **D5** tout en découle (contexte, Mobilisation, encadré, filtre, bandes, « Restaurer », Aide) ; **D6** `idme` n'est plus lu ni effacé.

| Sentinelle | Avant | Après | Décision |
|---|---|---|---|
| `sentinelle-821a` | Contexte 85/75/65 ; Mobilisation 70/80/90 ; mots 85/80/70 ; 60 fixe ; bandes 30/47,5/65/82,5 ; divergence protégée | 95/90/85 partout, source commune, 4 paliers, zones de barre lues | D1, D2, D5 |
| `sentinelle-lot-C-744` | 85/75/65, `BORNE_FIXE` 0,60 | 95/90/85, plus de 60 | D1, D2, D5 |
| `sentinelle-lot-F-860` | Filtre à `BORNES_MOBILISATION.critique` 0,7 ; « 65 - e.P » | Filtre au réglage ; aucune borne P écrite | D3, D5 |
| `sentinelle-aide-lot-2c-bis` | 64 et 75, 85/75/65, « P < 65 % » | Repères ; trois champs ; libellés lus | D3, D5 |
| `sentinelle-aide-lot-2d` | `value="70"` du champ | Aucun `value` : le défaut se lit à la source | D5 |
| `sentinelle-aide-lot-5` | Texte validé n° 16 « 64 % ou 75 % » | « le prochain repère de ton échelle » ; mot à valider | D3 |
| `sentinelle-audit-aide-15-oct` | 5 rangées, FAQ 70/80/85, 60 fixe | 4 rangées lues, FAQ sans nombre | D1, D2, D5 |
| `sentinelle-audit-aide-lot-B` | 4 arrêts de dégradé ; bulle 70/80/85 | 0 arrêt, zones lues ; bulle sans nombre | D5 |
| `sentinelle-541` | Lettre par 0,64/0,75/0,85 | Lettre par les plages de l'échelle ; leçon d'unité gardée | D3 |
| `sentinelle-542` (2 fichiers) | Mouchard par la fonction retirée | Lecture du source : aucun `obtenirSeuil` | D3 |
| `sentinelle-555-d` | Lectures `idme.*` nommées | Aucune lecture ; 4 emplois du code de repère ajoutés | D3, D6 |
| `sentinelle-555-replis` | Miroirs 0,64 et 0,75 | Absents ; seul le défi reste | D3, D6 |
| `sentinelle-746-551` | « à 64 % », « à 75 % » | Repères de l'échelle ; sans échelle « à 60 % » | D3, D4 |
| `sentinelle-818b` | `obtenirSeuil('idme.maitrise')` | `idme` conservé dans l'objet, non lu | D6 |
| `sentinelle-lot-5-cadrage-11` | Bornes 0,64 ; 0,66 déplacée | Repère D à 65 ; repère déplacé à 66 | D3 |
| `audit-sous-onglets-suivi` | Stub 0,64/0,75/0,85 ; lettre par seuils | Échelle du banc ; lettre par l'échelle | D3 |
| `audit-onglet-suivi` B2, B3 | « Difficulté émergente » | « Défi spécifique » (banc sommatif) | D3, **repli à confirmer** |
| `audit-onglet-suivi` C4 | P 62 : niveau 3 | Niveau 2 (banc sommatif, 62 au-dessus de 60) | D3, D4, **repli à confirmer** |
| `audit-onglet-suivi` F1 | Filtre P < 65 retient P 63 | Personne : sans échelle, la borne est 60 | D3, D4, **repli à confirmer** |
| `sentinelle-lot-A-737` | « Difficulté émergente » | « Défi spécifique » (banc sommatif) | D3, **repli à confirmer** |
| `sentinelle-749` | Élève du banc à P 63 | P 58 : sans échelle, la borne est 60 | D3, D4 |
| `sentinelle-552`, `sentinelle-775` | Stubs `idme` | Vrais modules chargés ; aucune attente de valeur changée | D3, D4 |
| `refactor-profil-etudiant` | Export `obtenirNiveauIDMEDepuisPourcentage` | Retiré | D3 |
| `sentinelle-nombres-1137` | – | Ligne CSS `fondDeLaBarre` en liste blanche ; aucun seuil | Sans objet |
| `_helpers/bac-suivi.js` | – | Vrais seuils chargés, échelle à repères fournie | Sans objet |
| `assiduite-lot-D` (navigateur) | Défaut 70 | Réglage posé à 70 pour garder le cas : C 80 jugé sur son seul A | D1 |
| `lot-e3-creer-ou-modifier` (navigateur) | Champ posé à 89 | Palier suivant + 1 : 89 est désormais en ordre | D1 |

Restaurée sans changement, parce qu'elle n'avait pas de décision : `sentinelle-lot-e3-reglages` (message de refus). Retirés du code avec elle : la nouvelle phrase du refus et le refus au-dessus de 100 %.

Défense neuve : `sentinelle-seuils-une-source-2026-10-30.test.js`, `integration/seuils-une-source.spec.js`.

## Trouvailles

| Constat | Issue |
|---|---|
| `genererInterpretationPerformance` nomme les codes M, E, D, PS, I en dur : la phrase sous la barre P ne vaut que pour une échelle IDME | Inscrire et continuer (#1190) |
| Phrase sous la barre RàI : 70 et 60 % au niveau 1, en dur | Inscrire, à régler avec le lot 2 (#1191) |
| L'aide de la section dit « Progression : 5 points » ; le défaut est 10 | Inscrire et continuer (#1192) |
| `seuilReussite: 60` et `seuilExcellence: 80` en défaut d'une pratique par spécifications : réglage de pratique, pas un signal | Inscrire et continuer (#1193) |
| H2026 a montré 3 grilles au lieu de 7 dans une exécution enchaînée de mes mesures, non reproduit | Inscrire et continuer (#1194) |
| Rouvrir un ancien trimestre ne montre aucun défi : la grille de dépistage est un réglage commun | Inscrire et continuer (#1195) |
| Le bandeau rouge couvre 79 % des barres A et C, l'axe partant de 30 % | Commenter et oublier : conséquence nommée, décision de Grégoire si le rendu le gêne |
