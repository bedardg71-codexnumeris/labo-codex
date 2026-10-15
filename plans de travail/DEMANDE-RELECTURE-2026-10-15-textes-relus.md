# Demande de relecture – les textes relus par Grégoire (#364, #18, #821, #1041)

> Écrite par Claude Code le 15 octobre 2026 à 15 h 46 (Toronto, mesuré par `date`), sur `CONSIGNE-LOT-2026-10-15-textes-relus.md` (Cowork, 15 h 29). Pour Cowork.
> Rien n'est poussé, aucune release, aucun verdict Playwright : on attend le signal du soir.

## En bref

Un commit de code. Les blocs 1, 2, 3 et 6c sont posés tels quels ; 6a sans phrase. 6b, 7, 8 et 9 sont posés selon ce que Grégoire a tranché. **À relire avant le commit final** : les phrases de 6b et du bloc 7 (§ 2 et § 3), et les mots du bloc 8 (§ 4, une supposition corrigée).

## 1. Posé tel quel

- **Bloc 1, le Comparateur** : le bouton d'aide est sur le titre dessiné par le Comparateur (`entete()`, `comparateur-pratiques.js`), avec « Aide : le Comparateur de pratiques ». La fenêtre « Comprendre le Comparateur de pratiques » (`accompagnement-contenu-popup.js`) et les trois termes du glossaire sont posés. « une de tes pratiques » partout, ni « souche » ni « pratique aboutie ».
- **Bloc 2, l'import** : le terme « Trimestres séparés » remplace « Namespacing (préfixe trimestre) » (catégorie « Réglages »). La fenêtre « Importer depuis un autre trimestre » s'ouvre par un bouton d'aide sur le titre de la section, dans les cinq bibliothèques. Chaque « Tout importer » porte sa bulle, avec le nom de sa bibliothèque.
- **Bloc 3, l'assistant de pratique** : onze bulles, posées sur le titre de l'étape quand elle s'affiche, retirées sur une étape sans bulle. « Approche d'évaluation » prend la phrase corrigée par Cowork. **Remesuré** : « Configuration du portfolio » suit bien « Approche d'évaluation » (depuis le bloc 9, plus rien ne s'intercale). « à l'étape suivante » reste donc.
- **Bloc 6c** : la ligne des équipes était déjà posée telle quelle (`equipes.js:196`, `cae3178a`). Rien à faire.
- **Bloc 6a** : aucune phrase sous le badge.

## 2. Bloc 6b – plus aucun chiffre sous le dégradé (phrase à relire)

**Mesuré** : chaque barre place l'élève selon UN indice, A, C ou P (`positionSurEchelleDistribution(e.valeur)`), pas selon la moyenne (A+C)/2. Rien à remonter de ce côté. La légende dessinée sous les barres ne portait que les quatre repères chiffrés : elle est **retirée**, avec ses deux fonctions de libellé (plus aucun lecteur). Le dégradé et la position des couleurs ne bougent pas (`ARRETS_DEGRADE` intact). La bulle des quatre repères (`tdb-zones-couleur`) perd son ancre et sort du catalogue.

| Où | Avant | Proposé (posé) |
|---|---|---|
| Bulle « Observer » (Tableau de bord › Aperçu) | « Indices A-C-P du groupe. Chaque barre positionne les étudiant·es sur une échelle continue, de 30 % à 100 %. » | « Indices A-C-P du groupe. Chaque barre place les étudiant·es selon un indice : plus un point est à droite, plus l'indice est haut. Pour A, la droite veut dire « Aucune absence ou presque », la gauche « Absences très fréquentes » ; pour C, « Aucun travail manquant ou presque » et « Travaux manquants très fréquents ». » |
| Légende sous les barres | « 30-47,5 % · 47,5-65 % · 65-82,5 % · ≥ 82,5 % » | (retirée) |

Vérifié : les deux bouts de la barre tombent bien dans ces paliers (gauche ≤ 30 %, sous 60 % : « très fréquentes » ; droite 100 %, à partir de 85 % : « Aucune… ou presque »). La barre P n'a pas de mots à elle : la bulle n'en invente pas.

## 3. Bloc 7 – les recommandations, au conditionnel (à relire)

Les gestes restent ; plus de jugement ni d'injonction ; plus aucun pourcentage dans la prose (la phrase qui décrit est juste au-dessus).

**Carte « Contexte d'apprentissage »** (`contexte-qualification.js`)

| Palier | Avant | Après |
|---|---|---|
| Très favorable, favorable | Les interventions peuvent se concentrer sur le développement des habiletés et compétences. | À la lumière de ces données, les interventions pourraient se concentrer sur le développement des habiletés et des compétences. |
| Modéré | Suivi régulier recommandé pour maintenir l'engagement et éviter une baisse de performance. | À la lumière de ces données, un suivi régulier pourrait aider à garder le cap. |
| Fragile | Interventions recommandées : Rencontrer l'étudiant·e pour comprendre les absences/non-remises, encourager la mobilisation, vérifier s'il y a des obstacles (emploi, santé, etc.). | À la lumière de ces données, il pourrait être pertinent de rencontrer l'étudiant·e pour comprendre les absences ou les travaux manquants, et de vérifier s'il y a des obstacles (emploi, santé, etc.). |

**Carte « Mobilisation »** (`profil-etudiant-sections-affichage.js`, la prose sous la phrase)

| Branche | Avant | Après |
|---|---|---|
| Décrochage | L'étudiant ne se présente plus au cours. Les interventions pédagogiques ne sont plus possibles. Référer aux services d'aide et à l'API. | Tu as indiqué un décrochage. À la lumière de cette situation, il pourrait être pertinent de passer le relais à l'aide pédagogique individuelle (API) ou aux services d'aide. |
| A et C sous 70 | Situation critique : présence ET remise des travaux sous 70%. Intervention RàI niveau 3 immédiate requise. | À la lumière de ces données, il pourrait être pertinent de rencontrer l'étudiant·e, du côté de la présence comme de la remise ; une intervention de palier 3 (RàI) pourrait être envisagée. |
| A sous 70 | Assiduité critique (< 70%). La présence irrégulière compromet l'apprentissage. Intervention prioritaire sur l'engagement comportemental. | À la lumière de ces données, il pourrait être pertinent de chercher, avec l'étudiant·e, ce qui l'empêche d'être présent·e en classe. |
| C sous 70 | Complétion critique (< 70%). Les travaux ne sont pas remis. Investigation des obstacles organisationnels ou motivationnels nécessaire. | À la lumière de ces données, il pourrait être pertinent de chercher ce qui fait obstacle à la remise des travaux : organisation, motivation ou autre chose. |
| A et C de 70 à 79 | Les deux composantes (A et C) sont entre 70-80%. Soutien proactif recommandé pour stabiliser l'engagement. | À la lumière de ces données, un soutien sur la présence et sur la remise pourrait aider à stabiliser la situation. |
| A de 70 à 79 | L'assiduité est entre 70-80% alors que la complétion est satisfaisante. Renforcer la présence en classe. | À la lumière de ces données, il pourrait être utile d'encourager la présence en classe ; la remise, elle, se tient. |
| C de 70 à 79 | La complétion est entre 70-80% alors que l'assiduité est satisfaisante. Soutenir l'organisation et la planification. | À la lumière de ces données, un soutien à l'organisation et à la planification pourrait aider ; la présence, elle, se tient. |
| A et C à 90 ou plus | Excellent engagement comportemental. Assiduité et complétion ≥ 90%. Maintenir cette dynamique positive. | Ces données ne suggèrent aucun geste particulier du côté de la présence et de la remise. |
| Le reste (80 à 89) | Engagement comportemental satisfaisant. Assiduité et complétion ≥ 80%. Continuer la surveillance de niveau 1. | Ces données ne suggèrent pas d'autre geste que le suivi habituel en classe. |

**Les encadrés sous la carte**

| Encadré | Avant | Après |
|---|---|---|
| Décrochage, titre | Actions requises | Pistes possibles |
| Décrochage, gestes | Contact immédiat avec l'API · Tentative de contact direct · Référence aux services d'aide psychosociale si pertinent · Documentation du dossier étudiant | Communiquer avec l'aide pédagogique individuelle (API) · Tenter un contact direct (téléphone, courriel) · Diriger vers les services d'aide psychosociale, si c'est pertinent · Garder une trace au dossier |
| Sous 70, titre | Recommandations d'intervention (niveau critique) | Pistes d'intervention |
| Sous 70, gestes | Intervention RàI niveau 3 immédiate – les deux composantes sont critiques · Assiduité critique : rencontre immédiate… · Complétion critique : investigation des obstacles… · Établir un PIP… · Suivi hebdomadaire jusqu'à amélioration significative · Mobiliser les ressources d'aide… | Présence et remise : une intervention de palier 3 (RàI) pourrait être envisagée · Présence : une rencontre pourrait aider à comprendre les absences · Remise : chercher ce qui fait obstacle à la remise des travaux pourrait aider · Un plan d'intervention personnalisé (PIP), avec des objectifs mesurables, pourrait être utile · Un suivi chaque semaine pourrait permettre de voir si la situation évolue · Les ressources d'aide (tutorat, aide technologique, etc.) pourraient être mises à contribution |
| Sous 80, titre | Recommandations préventives (niveau fragile) | Pistes de prévention |
| Sous 80, gestes | Mobilisation / Assiduité / Complétion fragile : … · Discussion informelle pour identifier les obstacles émergents · Offrir stratégies d'autorégulation et de planification · Réévaluation dans 2 semaines | Présence et remise : un soutien sur les deux pourrait aider (ou Présence : encourager la présence aux séances pourrait aider ; ou Remise : un soutien à l'organisation et à la gestion du temps pourrait aider) · Une discussion informelle pourrait faire voir les obstacles qui apparaissent · Des stratégies d'autorégulation et de planification pourraient être proposées · Un nouveau regard dans deux semaines pourrait permettre de voir l'évolution |

Les bornes (70, 80, 90) décident toujours de la branche (banc 821a).

**Trouvaille, remontée sans rien changer** : la même carte affiche « Décomposition de l'indice M : M = (A + C) / 2 = … ». Grégoire a dit le 15 oct. que cette moyenne est « un reliquat… abandonné » (consigne, ⚠ du bloc 6b). Le dégradé ne l'emploie pas, mais cette carte la montre. → **Issue 2**, à Cowork.

## 4. Bloc 8 – le réglage des seuils (une supposition corrigée)

| Champ (défaut) | Avant | Après |
|---|---|---|
| 70 % | Fragile si inférieur à | « Quelques absences » à partir de |
| 80 % | Acceptable si inférieur à | « Absences rares » à partir de |
| 85 % | Bon si supérieur ou égal à | « Aucune absence ou presque » à partir de |

**Supposé, corrigé** : l'exemple de la consigne (« Quelques absences sous », « Absences rares sous ») aurait inversé le sens. Sous 70 %, le profil écrit « Absences fréquentes », pas « Quelques absences ». La forme « à partir de » dit exactement la table de l'Aide (même mot, même borne). Les trois bulles des champs disent les mots de A et de C. Elles disent aussi la couleur que prend le chiffre dans la liste : rouge sous 70, jaune de 70 à 79, vert de 80 à 84, bleu à 85 et plus. L'ancienne bulle du troisième champ disait « vert » pour 85 et plus ; l'écran dessine bleu (`obtenirCouleurSelonSeuils`). Le paragraphe au-dessus disait « qualifient l'engagement dans le profil » ; il dit maintenant « choisissent les mots qui décrivent la présence et la remise dans le profil ». Aucune borne, aucune clé, aucun identifiant ne bouge.

## 5. Bloc 9 – les deux étapes vides de l'assistant

**Remesuré** : `va_bien` et `difficulte` ne sont lus que par `interpreterNiveau`, `grande_difficulte` par `detecterDefis`, tous deux dans `pratique-configurable.js`. Ce sont des méthodes du contrat des pratiques qu'aucun écran n'appelle (#551). `nbEvaluationsPrevues` n'est lu que par la copie, l'import, l'export et le registre. Aucun effet visible : les étapes sont retirées. Je le signale tout de même, puisque la consigne disait « s'il en existe un, remonte ».

- **Les étapes** « Nombre d'évaluations » et « Tes seuils personnels » sont retirées. Les étapes voisines sont recâblées :
  - les règles sommatives vont aux règles spéciales ou aux informations de base ;
  - l'approche d'évaluation va au portfolio ;
  - les spécifications vont à leur configuration de base ;
  - les trois précédents sont recâblés de même.
- **Le code qui ne servait qu'à elles** est retiré :
  - l'écriture de `seuils` et de `nbEvaluationsPrevues` à la création ;
  - la section « Paramètres généraux » du récapitulatif ;
  - la reconstitution de ces réponses à la réédition.
  - Complexité : `creerPratiqueV2` 86 → 78, `genererRecapitulatif` 48 → 44, `chargerPratiqueExistante` 44 → 40 (cliquet abaissé).
- **Le stock** : rien n'est effacé. `seuils` et `nbEvaluationsPrevues` sortent de `CHAMPS_EDITES_PAR_L_ASSISTANT`. Une pratique rouverte puis enregistrée garde donc les siens : le banc #903 C.1 rouvre une pratique qui les porte, et la retrouve identique. La copie (`pratiques.js:679-680`), l'import et le partage les transportent toujours.

## 6. Le principe « pas prescriptif » ailleurs dans l'application (issue 2, pour une fiche de Cowork)

Relevé dans les chaînes affichées (grep de « requis », « immédiat », « doit », « il faut », « Maintenir », « nécessitant »), sans réécrire. Les phrases qui prescrivent un geste envers un élève :

| Où | Phrase |
|---|---|
| Carte RàI du profil, « Non-participation » (`profil-etudiant-calculs.js:1815`) | « Profil prioritaire nécessitant une intervention immédiate. » |
| Carte RàI, niveau 3 (`:1856`) | « Difficultés pédagogiques majeures nécessitant un soutien intensif. » |
| Carte RàI, niveau 2 (`:1871`, `:1873`, `:1875`) | « … nécessitant un accompagnement préventif », « … une intervention préventive ciblée », « … un accompagnement ciblé » |
| Fenêtre d'aide RàI (`accompagnement-contenu-popup.js:603`) | « Intervention intensive et soutien individualisé nécessaires. » |
| Guide RàI (`guides-pedagogiques.js`) | « Zone d'intervention prioritaire » (Difficulté persistante) |
| Pratiques, cible d'intervention (`pratique-sommative.js:492`, `pratique-pan-standards.js:477`) | « Intervention intensive immédiate (Niveau 3 RàI) » — **jamais affichée** : `genererCibleIntervention` n'a aucun consommateur (#551) |

Les autres occurrences (« La pondération totale doit atteindre 100 % », « Les fichiers doivent appartenir au même étudiant »…) sont des règles de saisie, pas des prescriptions sur un élève : hors du principe.

## 7. Ce qui n'est pas dans ce lot

- **Bloc 4** (épreuve uniforme, #668) : pas de réponse de Grégoire, rien de posé.
- **Bloc 5** (bulletin, #333) : la décision est recopiée sous #333 au BACKLOG. ⚠ **Contradiction à lever** : la ligne dit « la note finale s'affiche à l'entier (décision de 14 h 57, #1076) », alors que #1076 dit « on arrondit au dixième partout ». Je l'ai recopiée telle quelle.
- **Le texte du plagiat** : Grégoire a tranché à 15 h 30 (option a), verdict de Cowork ajouté à `CONSIGNE-LOT-2026-10-15-aide-plagiat.md`. C'est le lot suivant, pas commencé.

## 8. La preuve

- **Sentinelle** `tests/unit/sentinelle-textes-relus-15-oct.test.js`, 14 essais. Elle lit chaque texte là où il vit (bulles, glossaire, fenêtres, titre dessiné, réglage) et les mots du réglage à leur source (`MOTS_PRESENCE`, `MOTS_REMISE`). Elle vérifie aussi qu'aucune bulle du dégradé ne porte de chiffre et que les étapes retirées ne reviennent pas.
- **Bancs suivis** :
  - `821a` : la carte Mobilisation ; ses essais lisent maintenant les pistes, et un essai neuf vérifie qu'aucune branche ne juge ni n'ordonne.
  - `audit-aide-lot-B` : le dégradé sans chiffre.
  - `golden-creation-319` et `inference-comportementale` : le parcours sans les deux étapes.
  - `577` et `910` : le titre d'étape du harnais reçoit la bulle.
  - Deux cliquets abaissés : la complexité, et les classes sans règle (la légende retirée).
- **Break-test par ablation** : 22 mutations (une par bloc et par branche, dont le stock de seuils effacé à la réédition), **22 rouges**, fichiers restaurés par copie et empreinte vérifiée.
- **Vitest complet** depuis `tests/` : 762 fichiers, 8 903 essais verts, aucune ligne « Errors » ni « Unhandled ».
- **Playwright** : non lancé. Les specs qui passent par l'assistant (`audit-pratiques-notation-parcours-2026-09-16`, `audit-parcours-sommatif-2026-09-24`) donnent encore des réponses aux deux étapes retirées : ces réponses sont ignorées. Aucun spec ne cite le titre d'une étape retirée, ni un texte changé de ce lot (grep de `tests/integration`) ; le verdict du soir le confirmera.

## 9. La ligne des Nouvelles, proposée

> Le Comparateur de pratiques et l'import d'un trimestre à l'autre ont leur aide, et chaque étape de l'assistant de pratique sa bulle. Le profil parle au conditionnel : il propose des pistes, sans juger. Le réglage des seuils prend les mêmes mots que le profil. L'assistant perd deux étapes qui n'avaient aucun effet.
