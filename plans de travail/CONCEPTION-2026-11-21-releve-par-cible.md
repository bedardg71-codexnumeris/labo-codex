# Conception – Le relevé par cible que l'étudiant·e reçoit (« Par standards », lot 5)

21 nov. 2026. Branche `lot/moteur-cibles-5-releve` (partie de `main` à 1.253.0, `16360f43`). Mandat relayé par Grégoire à
18 h 22. Rapport : `RAPPORT-2026-11-21-releve-par-cible.md`. Textes : `TEXTES-2026-11-21-releve-par-cible.md`.

**Aucune décision de didactique n'est arrêtée ici.** Chaque question du § 3 porte une recommandation, sa raison et son
origine ; elle est appliquée dans la première version pour que Grégoire réagisse à du concret, et elle se renverse en
changeant UNE valeur (§ 4).

## 1. Ce que le relevé est

Un document par étudiant·e, **rangé par cible**, dans l'ordre de l'ensemble de cibles du cours. Il dit la même chose que
la section « Cibles » du profil (même lecture, même calcul : `TableauCibles.eleveDuContexte`, donc `NoteCibles`), dans
les mots de l'étudiant·e et sans ce qui n'appartient qu'à l'enseignant·e. **Il lit ; il n'écrit rien.**

Dans l'ordre de la page :

1. **L'en-tête** : « Relevé par objectif » (ou « par cible »), le nom, le groupe, la date (« État au … »), le cours ; une
   phrase qui dit ce qu'est le niveau actuel (le meilleur niveau démontré, qui ne redescend pas).
2. **La note du cours** : la note actuelle ou finale et son calcul ; ou « Pas encore de note » et les objectifs encore
   sans niveau, nommés ; ou « sera communiquée plus tard » sous la préférence « note différée ».
3. **Une carte par cible** : l'étiquette, « terminal·e » s'il y a lieu, sa part de la note, l'énoncé, les critères
   (essentiels marqués), le **niveau actuel** et sa date, puis **« Ce qui a été observé »** : chaque inscription, la
   plus récente d'abord, avec sa date, son niveau (ou « Commentaire » pour une inscription sans niveau), la production
   d'où elle vient, la rétroaction, et les critères que l'enseignant·e a cochés.
4. **L'échelle** : chaque niveau, du plus haut au plus bas, son nom et sa description quand l'échelle en porte une.

## 2. Sa forme

- **Une fenêtre d'aperçu**, ouverte depuis la section « Cibles » du profil (« Relevé de l'étudiant·e ») ou depuis le
  tableau des cibles (« Relevés des étudiant·es », vue étendue et vue simple). L'enseignant·e y voit exactement ce que
  l'étudiant·e recevra, peut passer d'un·e étudiant·e à l'autre, et y change deux choses le temps de la fenêtre : le mot
  (« objectif » ou « cible ») et la présence des remarques sans niveau. Rien n'est enregistré.
- **Un PDF par étudiant·e** (`Releve_Nom_Prénom_DA.pdf`), et **pour le groupe un ZIP d'un PDF par étudiant·e**, comme
  « Exporter pour Léa » : le relevé se remet à une personne, un seul PDF du groupe obligerait à le découper. En
  anonymisation, le nom de fichier ne porte ni nom réel ni DA (même règle que l'export des travaux).
- **Le moule de la synthèse de rétroaction** (HTML mis en image par html2canvas, posé dans jsPDF, CSS en ligne), **à un
  écart près** : la synthèse fait une seule page aussi haute que son contenu ; le relevé est rangé en **pages Lettre**,
  sans jamais couper une carte. Raison (mesurée sur le banc) : trois cibles font déjà deux pages ; dix cibles feraient
  une page de plusieurs mètres, qui ne s'imprime pas. Une carte plus haute qu'une page reçoit sa page, haute comme elle.
- **Limite connue du moule** : le PDF est une image (texte non sélectionnable, non lisible par un lecteur d'écran),
  comme la synthèse. Inscrit, non corrigé : c'est un choix du moule existant, hors de ce lot.

## 3. Les questions de didactique, dans l'ordre où les trancher

Origine des recommandations : sauf mention, **« proposé par Claude Code, à décider par Grégoire »**. Les sources citées
sont celles de la fiche `CONCEPTION-2026-11-20-pratique-par-standards.md` (R : rapport PAREA 2026) et « cas A »
(courriel du 21 nov. 2026, rapporté par le mandat).

| N° | Question | Recommandation appliquée | Raison | Origine |
|---|---|---|---|---|
| 1 | **Le mot que lit l'étudiant·e** : « objectif » ou « cible » | **« objectif » d'office, réglable dans la fenêtre** ; non tranché | C'est le mot du cas A devant ses étudiant·es et dans son plan de cours ; un plan de cours de cégep dit « objectif ». Le risque inverse existe : « objectif » a déjà deux autres sens dans l'application (objectif de leçon, champ « Objectif » d'une production), mais l'étudiant·e ne voit pas ces écrans | cas A ; fiche, É6 ; plan § 9. **Décision à Grégoire** |
| 2 | **Les remarques sans niveau** | **Montrées**, sous le mot « Commentaire » ; une case de la fenêtre les retire | Pour une cible jugée par triangulation, elles sont la seule trace pendant la session : sans elles, le relevé de ces cibles est vide. **Le risque est réel et il est dit** : une remarque peut avoir été écrite pour soi, pas pour l'étudiant·e. D'où l'aperçu obligatoire, la phrase « Relis-le avant de le remettre », et la case | cas A (notes qualitatives à différents moments ; une rétroaction suit chaque occasion). **Décision à Grégoire** |
| 3 | **La note du cours pendant la session** | Tant qu'une cible est sans donnée : **« Pas encore de note »**, la règle, et les objectifs encore sans niveau, **nommés** ; plus la phrase « à la fin du cours, un objectif resté sans niveau compte pour 0 % » | C'est la règle déjà décidée pour l'écran de l'enseignant·e ; la taire à l'étudiant·e lui cacherait ce qui lui reste à démontrer | Décision 9 de Grégoire (20 nov., sans source) ; cas A (aucune note affichée pour les cibles sans occasion) ; R, p. 103 (0 % à l'arrêt) |
| 4 | **Tout l'historique, ou le niveau retenu seul** | **Tout l'historique actif**, le niveau actuel en tête et marqué dans la liste | Voir où l'on en est ET par où l'on est passé ; c'est aussi ce qui permet de répondre à une contestation, pièces en main | Fiche, S3 (BOUCHÉES) ; mandat (mots de Grégoire, 21 nov., 18 h 18) |
| 5 | **Les critères cochés** (respecté, non respecté, non renseigné) | **Seulement ceux que l'enseignant·e a renseignés**, avec le mot en toutes lettres | Un critère non renseigné ne veut pas dire « non respecté » : l'écrire à l'étudiant·e inviterait à le lire ainsi | Décision de Grégoire, 21 nov., 8 h 38 (« rien de coché » ne veut pas dire « aucun critère respecté ») |
| 6 | **Les inscriptions annulées** | **Absentes** du relevé ; si on les allume, barrées, avec la date mais **sans la raison** | Une inscription annulée est une trace invalidée (souvent une erreur de saisie) : elle ne compte pas et ne concerne pas l'étudiant·e. La raison peut nommer un tiers | Décision 2 de Grégoire (rien ne s'efface : elle reste au profil de l'enseignant·e) |
| 7 | **L'origine** (quelle production) | **Le titre de la production** quand il y en a une ; sinon rien (jamais « Sans production ») | L'étudiant·e relie le niveau à un travail qu'il ou elle a en main | Fiche, N3 (un niveau peut venir d'une observation ou d'un entretien) |
| 8 | **Le poids des cibles et le calcul** | La **part de chaque cible** (« Compte pour 25 % de la note ») toujours ; le **tableau du calcul** (niveau, valeur, poids, part, moyenne, plafond s'il joue) seulement quand la note existe | Dire dès le départ ce qui pèse ; ne pas montrer une valeur en pourcentage à côté d'un niveau tant qu'il n'y a pas de note à expliquer | Fiche, S1 ; R, p. 103 (F1, F2) ; S2 (un niveau par cible, jamais une note par instrument) |
| 9 | **Les critères de chaque cible, et lesquels sont essentiels** | **Montrés**, « essentiel » marqué | L'étudiant·e sait sur quoi il ou elle est jugé·e | Fiche, S1 (R, p. 99, p. 160, p. 199) |
| 10 | **L'échelle et le sens de chaque niveau** | **En fin de relevé** : chaque niveau et sa description si l'échelle en a une ; ni plages, ni valeurs | Le sens des niveaux, pas leur arithmétique (elle est dans le calcul, quand il y en a un) | Fiche, S1 |
| 11 | **Une cible sans donnée** | « Niveau actuel : aucun pour l'instant » suivi du **nom du niveau « sans donnée » de l'échelle** ; « Rien d'inscrit pour l'instant » si elle n'a rien, sinon ses commentaires | Jamais un vide ni un zéro : la règle de l'écran de l'enseignant·e | Décision 3 de Grégoire (21 nov., 9 h 17) |
| 12 | **La date du relevé** | **Le jour où il est produit**, « État au … », en tête et au pied de chaque page | Un relevé est une photo : la note peut monter ensuite | — |
| 13 | **« Niveau actuel » ou « niveau retenu »** | **« Niveau actuel »** pendant la session, « Niveau final » quand les notes sont finalisées | « Retenu » est un mot d'enseignant·e (une règle de retenue) | cas A (il communique un « niveau actuel » par objectif) |
| 14 | **À qui parle le relevé** : « tu », « vous », ou personne | **Personne** : aucune phrase ne s'adresse à l'étudiant·e | Le relevé tient dans les deux usages tant que Grégoire n'a pas choisi ; une sentinelle le garde | — |
| 15 | **Un dernier niveau plus bas que le niveau actuel** | Il paraît à sa date dans la liste, **sans phrase à part** ; la règle est dite une fois, en tête | La phrase de l'écran de l'enseignant·e (« est plus bas : le niveau retenu ne redescend pas ») répétée à chaque cible alourdirait | Décision 1 de Grégoire (R, p. 103 ; cas A) |

**Tranché seul (technique), dit ici :** la préférence « note différée » de l'enseignant·e vaut pour le relevé (aucune
note, « sera communiquée plus tard »), comme pour le PDF de synthèse ; une note « non calculable » (échelle ou poids à
corriger) s'écrit « Pas de note pour l'instant », le motif restant chez l'enseignant·e.

## 4. Comment chaque choix se renverse

Tous les choix du § 3 sont des valeurs de `CHOIX`, en tête de `js/releve-cibles-data.js` :
`mot`, `remarques`, `noteEnSession`, `historique`, `coches`, `annulees`, `origine`, `poids`, `calcul`, `criteres`,
`echelle`, `date`. Le rendu et l'export ne les connaissent pas : ils reçoivent un relevé déjà trié. Les questions 13 à
15 sont des mots (`MOTS`, `js/releve-cibles-rendu.js`). La sentinelle éprouve chaque valeur dans les deux sens.

## 5. Ce qui n'est pas dans ce lot

- **Les évaluations par critère sous une cible** (le pont) : mesuré seulement, rapport § C.
- **Remplacer « Productions » au profil** : avis au rapport, § E ; aucune section retirée.
- Enregistrer le mot choisi par l'enseignant·e (le relevé n'écrit rien) : à faire quand le mot sera tranché, ou comme
  réglage de la pratique.
