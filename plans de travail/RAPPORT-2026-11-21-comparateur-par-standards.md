# Rapport — lot comparateur-par-standards (21 nov. 2026)

Le comparateur (Labo → Exploration) décrit la pratique « Par standards » par ses propres lignes. Avant, sa colonne empruntait celles de l'ancienne famille « standards » (devenue SEL).

## En tête

**Branche** : `lot/comparateur-par-standards`, partie de `origin/main` à `16360f43c` (1.253.0). Arbre de travail : `../labo-codex-comparateur-std`. Ni fusion ni release.
**PR en brouillon et aperçu** : voir la fin du rapport.

## Ce que la colonne STD affiche maintenant

Pratique fictive du banc : trois cibles (poids 1, 1, 2 ; une terminale), échelle à cinq niveaux, niveau « sans donnée » désigné, double seuil éteint, notes non finalisées.

| Paramètre | Ligne | Avant | Maintenant |
|---|---|---|---|
| Objet | Productions comptées | Sélection d'artefacts | s.o. |
| Objet | Cibles comptées (neuve) | — | 3 cibles, dont 1 terminale |
| Objet | Alignement sur des cibles d'apprentissage | Non couvert (la note se rapporte à des instruments) | Couvert (la note se rapporte aux cibles) |
| Révisabilité | Reprises | La reprise prend la place de la copie d'origine dans la note | Le meilleur niveau démontré est retenu pour chaque cible ; une reprise ne le fait jamais baisser |
| Agentivité | Choix et flexibilité laissés à l'étudiant·e | Non couvert par l'application | inchangé |
| Communication | Ce à quoi la note se rapporte | — | Cibles d'apprentissage |
| Communication | Échelle de performance | nom (5 niveaux) | inchangé ; « Échelle introuvable dans ce trimestre » si elle manque |
| Communication | Temporalité de la note | Réglage global | inchangé |
| Granularité | Niveaux de performance (évaluations) | 5 niveaux | inchangé |
| Granularité | Niveau « sans donnée » (neuve) | — | Données insuffisantes |
| Granularité | Niveaux de la note du cours | Non couvert par l'application | inchangé |
| Détermination | Pondération | Égale (sans lire les poids) | Inégale entre les cibles (poids de 1 à 2) |
| Détermination | Calcul de la note (neuve) | — | Moyenne pondérée des valeurs des niveaux retenus |
| Détermination | Double seuil (neuve) | — | Éteint ; allumé : « Note plafonnée à 55 % si la moyenne des cibles terminales est sous 60 % » |
| Détermination | Notes finalisées (neuve) | — | Non : pas de note tant qu'une cible est sans donnée ; cochée : « Oui : une cible sans donnée compte pour 0 % » |

Les lignes propres à SEL (Méthode de sélection, Composantes, Mode « note finale ») affichent « s.o. » dans la colonne quand une autre colonne les porte. Toutes les valeurs possibles : `TEXTES-2026-11-21-comparateur-par-standards.md`.

## La garde contre la récidive

`extraire` tient la liste des familles qu'il sait décrire. Une famille absente de cette liste ne traverse plus les branches par défaut : elle reçoit « Non décrit par le comparateur pour cette pratique » sur les cinq lignes qui dépendaient d'une branche par famille. Restent les faits sans famille : l'échelle que la config porte, le réglage global, les deux « non couvert » de l'outil. Les quatre familles d'avant rendent les mêmes valeurs qu'avant.

## Ce que j'ai supposé

1. **Les cibles passent par l'appelant.** L'extracteur reste pur (aucun stockage). Le comparateur lit l'ensemble par `EnsemblesCibles.lireParId` et le double seuil par `NoteCibles.lireDoubleSeuil`, puis les passe en second argument. Lecture seule.
2. **« Productions comptées » : s.o.** La pratique ne compte pas des productions. J'ai ouvert une ligne « Cibles comptées » au lieu de loger les cibles sous ce libellé (la dénotation, elle, le fait encore : non touché).
3. **Les coches « essentiel » ne sont pas décrites** : aucun calcul ne les lit (choix du 21 nov.).
4. **Pondération** : égale ou inégale, avec l'étendue des poids ; pas le détail cible par cible.
5. **Ensemble ou échelle introuvable** : la colonne le dit (« Cibles introuvables dans ce trimestre », « Échelle introuvable dans ce trimestre »), au lieu d'un tiret.
6. **« Niveaux de la note du cours »** reste « Non couvert par l'application », comme pour toute famille.
7. **Pas de fiche au BACKLOG** : le mandat n'en demande pas.

## Pourquoi tous les profils-types affichent « non constructible »

Mesuré dans le navigateur (WebKit), sur une pratique fictive : l'hypothèse est confirmée.

- Le corpus fictif injecte deux choses dans la simulation : des évaluations (54) et des productions (`comparateur-pratiques.js`, `_corpusInjection`).
- Le moteur de « Par standards » ne lit jamais les évaluations : il lit les inscriptions de niveaux sur les cibles (`NoteCibles.lireEleve` → `InscriptionsCibles.lireToutes`), dans le stockage du trimestre. Aucune inscription n'existe pour les profils `SIM0000` à `SIM0005` (0 lue).
- Chaque cible est donc « sans donnée », l'état de la note est « attente », et la simulation rend `noteConstructible: false`.
- La cause que dit le moteur : « Pas encore de note : les cibles « Analyser », « Dissertation » sont sans donnée. La note se calcule quand chaque cible a un niveau retenu, ou à l'arrêt des notes. »

Non corrigé, comme demandé. Pour qu'une note paraisse, il faudrait que le générateur de profils produise aussi des inscriptions par cible, et que le moteur accepte de les lire en simulation.

## Trouvailles

| Trouvaille | Statut | Disposition |
|---|---|---|
| Profils-types « non constructible » pour « Par standards » (ci-dessus) | Mesuré | Inscrire (issue 2). Hors du lot, à Cowork de dire si une fiche s'ouvre |
| La cellule dit « Note non constructible avec ces paramètres », alors que le moteur sait dire la cause exacte (`expliquerNoteNonConstructible`) | Mesuré | Inscrire (issue 2) |
| La dénotation range ses cibles sous le libellé « Productions comptées » | Lu | Commenté ici (issue 3) ; non touché |

## Mesuré, non vu

**Mesuré** :
- Vitest complet : 945 fichiers, 12 212 essais verts.
- Sentinelle du lot (`sentinelle-comparateur-par-standards.test.js`) : 37 essais. Break-test : sur le code d'`origin/main`, 31 rouges sur 37 ; les six verts sont des invariants (six paramètres, agentivité, nom de l'échelle, faits sans famille, quatre familles d'avant, module pur).
- Banc navigateur neuf (`comparateur-par-standards.spec.js`) : 3 essais verts sous WebKit ; 3 rouges sur le code d'avant.
- Banc existant du comparateur (`comparateur-pratiques-rendu.spec.js`) : 6 essais verts sous WebKit.

**Non vu** : Safari sur le Mac et l'iPad ; le verdict Playwright complet (dû avant toute fusion). Le rituel de fin de session n'est pas lancé (ni release ni fusion).

Quatre sentinelles existantes ont rougi en chemin sur mon propre code, et m'ont fait corriger : la virgule décimale hors du formateur, un « 0 % » sans espace insécable, une découpe par `indexOf` dans l'essai, et « CIB » écrit hors des places internes.

## Fichiers

- `js/pratiques/construction-attributs.js` : la famille « cibles », la garde, les libellés partagés en une seule table.
- `js/comparateur-pratiques.js` : `_contexteExtraction`, et l'appel.
- `index.html` : les deux versions de cache.
- `tests/unit/sentinelle-comparateur-par-standards.test.js`, `tests/integration/comparateur-par-standards.spec.js`.
- `plans de travail/TEXTES-2026-11-21-comparateur-par-standards.md`.

## Aperçu et PR

À compléter après le push.
