# Demande de relecture – lot 11 : le confort, sans mot neuf (un seul, pour #324)

> Claude Code, 11 octobre 2026, 13 h 44 (mesuré par `date`). Consigne : `CONSIGNE-DU-JOUR.md`, enchaînement des lots 10 à 13 (Cowork, 13 h 32).
> Sur `main`, **non poussé, pas de release, pas de verdict Playwright**. Vitest complet vert après chaque commit (723 fichiers, 8 592 essais au dernier passage).

## 1 · Ce qui change pour l'usager

- Tableau de bord, courbes d'intervention : quand un élève d'un groupe ciblé a fait une reprise, une courbe pointillée fine « P sans reprises · <titre de l'intervention> » montre la moyenne du groupe sans l'apport des reprises. Même chose pour le groupe contrôle (« P sans reprises · contrôle »). Sans reprise qui change P, rien ne s'ajoute (#241).
- Quatre boutons gagnent la marge du haut qu'ils devaient avoir : « + Ajouter un critère » d'une grille, et trois « Ajouter » de la page des productions (portfolio, examen, examen formatif). Au profil, les cartes d'artefact (seconde liste) deviennent opaques au survol, comme la première (#865).
- Comparateur de pratiques : la ligne « Reprises » d'une sommative ne dit plus « Non permises », « Limitées » ou « Illimitées » ; elle dit ce qui s'applique (#324).

## 2 · Fiche par fiche

| Fiche | Commit | Remesure sur main | Geste |
|---|---|---|---|
| #241 | `f690cfec` | « P sans reprises » existait au profil individuel seulement (`impact-jetons.js`) | calcul extrait (`deltasReprisesParSeance`, `ecartReprisesALaSeance`), appliqué par élève aux courbes d'intervention et au contrôle ; dataset pointillé conditionnel |
| #865 | `d4916465` | 4 cas restaient sur les 5 annoncés : la carte d'artefact de la ligne ≈ 765 était déjà fusionnée, la 5ᵉ vivait ≈ 817 (balise sur plusieurs lignes) | fusion premier puis second ; bloc C de `sentinelle-779` sur tout `js/` |
| #324 | `8de981fa` | `_reprises` lisait le déclaratif retiré par #903 | une phrase pour toute sommative |

Vérifications : #241, harnais avant/après joué contre HEAD (la courbe individuelle est identique), puis 2 mutations rouges (écart annulé ; courbe toujours rendue). #865, 1 mutation rouge (le rouge nomme le fichier et la classe). #324, 1 mutation rouge. L'essai R3 de `construction-attributs-326` a été mis à jour : il verrouillait « Limitées ».

## 3 · Mot d'écran – à soumettre à Grégoire

1. Comparateur, ligne « Reprises » d'une sommative : « **La reprise prend la place de la copie d'origine dans la note** » (`js/pratiques/construction-attributs.js`). J'ai d'abord écrit « remplace », mais la sentinelle #903 interdit « remplac » sur une sommative, pour ne pas évoquer la règle de remplacement retirée. D'où « prend la place ».
2. (Composé de mots existants, à confirmer) la légende « P sans reprises · <titre> » et « P sans reprises · contrôle » (`js/correlations-longitudinales.js`). Le mot vient du profil individuel.

## 4 · Ce que j'ai supposé – une ligne chacune

- #241 : l'écart d'un élève est celui du profil (somme des « reprise − originale » à l'échéance, divisée par ses évaluations actives), appliqué au P du snapshot.
- #241 : le groupe contrôle reçoit aussi sa courbe : sans elle, la comparaison intervention / contrôle mélangerait deux mesures.
- #241 : l'infobulle du graphique n'affiche pas la valeur « sans reprises » ; seule la courbe la montre.
- #241 : le dataset du graphique n'a pas de test (rendu Chart.js) ; le calcul en a un.
- #865 : la marge et l'opacité au survol étaient voulues (le second attribut avait été écrit pour son effet, règle de #787).
- #324 : la phrase vaut pour toute sommative, quel que soit le déclaratif encore stocké ; les autres familles ne changent pas.

## 5 · Item de Nouvelles proposé

« Sur les courbes d'intervention du tableau de bord, une courbe pointillée montre P sans l'apport des reprises : l'effet d'une intervention ne se confond plus avec celui d'un jeton. »
