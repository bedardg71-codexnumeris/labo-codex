# Consigne du jour — le septième site de #575 : retirer les zones du graphique de progression

> Écrite le 13 septembre 2026, 19 h 35 (Toronto), sur `8acf6a42` (non poussé ; `origin/main` = `28c5fefa`).
> Elle REMPLACE la précédente, archivée sous `_ancienne-CONSIGNE-DU-JOUR-2026-09-13-575-b10b-constat.md`.
> ⚠ B10b est constaté livré et coché. Ce qui suit est **le dernier site ouvert de #575**, et le seul endroit du dépôt où une table IDME en dur survit sur un chemin vivant.
> ⚠⚠ **Une première version de cette consigne, écrite vingt minutes plus tôt, disait de RÉPARER le choix de l'échelle. Grégoire a tranché l'inverse.** Si tu as lu cette version-là, oublie-la.

## 0 · D'abord, pousse

`8acf6a42` est commité et non poussé. `scripts/pousser.sh`, à la demande de Grégoire. Ce sont des commentaires et deux jetons anti-cache : `version.json` reste à `1.140.6`, rien ne change à l'écran.

## 1 · La décision de Grégoire — SUPPRESSION PURE, et le motif qui la porte

**Les zones colorées du graphique de progression sont RETIRÉES. On ne cherche pas quelle échelle elles devraient suivre : elles n'en suivent aucune, parce qu'elles n'ont rien à situer.** Tranché par Grégoire le 13 septembre au soir. Le motif est à inscrire dans la fiche, pour que personne ne rouvre la question en croyant bien faire : **une échelle de performance juge UNE production ; les indices A-C-P-E sont des mesures agrégées en pourcentage sur un trimestre.** Superposer les paliers de l'une aux courbes des autres donne un repère qui a l'air de dire quelque chose et qui ne dit rien. Ce n'est pas un défaut de configuration — c'est un objet qui n'aurait pas dû exister.

⛔ **Et cette décision ne se propage PAS au graphique par critère** (#752, livré le 11 sept.). Ses points SONT des niveaux d'évaluations : ses zones ont un référent, elles restent, et elles sont justes. Ne les touche pas, et n'invoque pas cette consigne pour le faire.

## 2 · LA MESURE QUI PASSE AVANT LE CODAGE

Rends ces trois réponses avant d'écrire une ligne. Elles fixent le périmètre, et l'une d'elles peut l'élargir.

**(a) Qui d'autre lit `ZONES_IDME` et `zonesPourChart` ?** Si ces zones ne servent qu'au graphique de progression, la table en dur part avec elles et #575 se ferme entièrement. Si un autre graphique en dépend, tu retires la zone POUR CE CANVAS seulement et tu dis lequel reste — dans ce cas #575 ne se coche pas, et il faut une fiche neuve pour l'autre site.

**(b) Qu'est-ce qui disparaît exactement à l'écran ?** Nomme-le : lignes pointillées, noms dans la marge droite, légende, axe, autre chose. `_zonesParCanvas` n'a aucune entrée pour ce canvas, donc les zones y viennent du repli — vérifie-le au lieu de me croire, c'est une mesure de Cowork reprise de ta propre lecture.

**(c) Reste-t-il un texte, ailleurs, qui ANNONCE ces zones ?** `texteZones` est mort depuis mars, mais un titre, une infobulle ou une phrase d'aide peut encore promettre des « zones colorées » à l'utilisateur. Un graphique dont la légende annonce ce qui n'est plus dessiné est pire que le défaut qu'on répare. Cherche par le CONTENU, sur le dépôt entier, pas par le nom de la variable.

## 3 · Le geste

Retire, dans le même commit : le calcul de `texteZones` (`js/profil-etudiant-sections-affichage.js`, vers `:3211-3230`) — code mort depuis `4e38bcce` (21 mars), qui a retiré du HTML la ligne qui l'affichait ; la lecture de `echellesTemplates` qui ne sert qu'à lui ; les zones du graphique de progression ; et, sous réserve de la mesure 2a, `ZONES_IDME` elle-même.

⚠ **Le verrou `tests/unit/sentinelle-575-couleurs-badges-barres.test.js:130` exige encore la chaîne `'IDME par défaut'` et rougira. C'est le signal attendu, pas une régression.** Ne le fais pas passer en changeant un chiffre : réécris l'assertion pour qu'elle CONSTATE le retrait — zéro occurrence — afin qu'elle rougisse si quelqu'un réintroduit une table de niveaux dans ce graphique.

## 4 · La preuve

Sentinelle avec break-tests rouges vérifiés isolément, restauration vérifiée à chaque fois. **Le cas qui prouve quelque chose** : un montage sans aucune échelle dans le trimestre, et un autre avec une échelle dont les niveaux ne sont pas I/D/M/E — le graphique rend la même chose dans les deux, parce qu'il ne lit plus d'échelle du tout. Un montage sur l'échelle de Grégoire ne prouve rien : c'est celle où la table en dur tombe juste par coïncidence, et c'est ce qui a caché ce défaut pendant un an.

⚠ **Le rendu change, donc une porte terrain est due.** Ce graphique est du Chart.js dans le profil d'un élève : le verdict se prend à l'écran, pas dans `node`. Prépare la porte selon le skill `portes-terrain` — Grégoire devra regarder, et il le sait.

## 5 · Ce que ce lot ne rouvre pas

#752 (voir §1) · #555 · #553 · #551 · la question de savoir si un indice agrégé se situe dans une échelle de niveaux — tranchée le 13 septembre, elle ne se reprend pas. Aucun bump, aucune release avant le verdict de la porte.
