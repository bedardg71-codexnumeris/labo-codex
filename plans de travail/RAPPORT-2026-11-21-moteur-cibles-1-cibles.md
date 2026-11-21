# Rapport – « Par standards », lot 1 : les cibles du cours et l'échelle

> **Relais (21 nov. 2026, nuit).** Branche `lot/moteur-cibles-1-cibles`, partie de `lot/moteur-cibles-0-garde`
> (`567f251a`), poussée ; **aucune fusion dans `main`** (consigne : rien n'y entre avant que les quatre gestes existent
> et que Grégoire les ait essayés). PR d'aperçu : voir la dernière ligne de ce relais.
> **Réunies sur la branche** : `lot/standards-conception` (`7ac26506`, la fiche et le skill) et
> `lot/renommer-selection-productions` (`3b8204f4`, livrée : l'assistant ne montre plus deux « standards »).
> **Session** : Claude Code dans un conteneur cloud Linux, pas sur le Mac. **WebKit n'y existe pas** : les écrans neufs
> sont vérifiés et capturés sous Chromium ; le passage WebKit reste dû au Mac (porte ci-dessous).
> **Fait** : le lot 1 entier (le choix « Par standards », les cibles du cours, l'échelle et le niveau « sans donnée »,
> la fiche, le groupe-cours, la note qui dit pourquoi elle manque) ; les retraits prévus, dans un commit à part ; la
> page des textes proposés ; le plan révisé (décisions du 20 nov. en tête, lots 1 à 5).
> **Reste** : les textes à faire corriger par Grégoire (`TEXTES-2026-11-20-par-standards-lot-1.md`, 80 textes et
> 4 questions) ; le passage WebKit du Mac ; le lot 2 (inscrire un niveau).

## 1. Ce qui a été livré

- **L'assistant** : « Par standards » dans la voie rapide et dans « Comment calcules-tu la note finale ? » ; l'étape
  « Les cibles du cours » (le cours, puis une carte par cible : étiquette, poids et sa part, « Cible terminale », énoncé,
  critères un par ligne avec « Critère essentiel » ; ajouter, retirer, monter, descendre ; poids égaux d'office ; total
  lu) ; l'étape « L'échelle des niveaux » (une échelle de la bibliothèque, ou l'échelle de départ proposée ; le niveau
  « sans donnée » parmi les niveaux qui valent 0 %) ; le récapitulatif ; la réédition (mêmes ids, même ensemble).
- **La fiche** : la carte « Structure des évaluations » montre le cours, l'échelle, le niveau « sans donnée » et les
  cibles, en lecture seule, avec « Modifier les cibles dans l'assistant ». Le menu du type est verrouillé pour cette
  pratique ; l'option est fermée pour les autres. La carte commune de l'échelle est masquée pour elle (elle réécrirait
  l'échelle sans son niveau « sans donnée »).
- **Le groupe-cours** : le menu de l'assemblage la propose ; « Appliquer au cours actif » la pose (vérifié dans la démo).
- **La note** : `null`, jamais un zéro ; la cause se dit par `expliquerNoteNonConstructible` (une seule phrase, lue par
  le profil, le rapport, l'export et le Suivi).

## 2. Ce qui a été mesuré

Voir le bloc du rapport final de la session (chiffres de Vitest, break-tests, garde du lot 0, captures).

## 3. Les trouvailles et leur issue

| Trouvaille | Issue |
|---|---|
| Au profil, la carte « Performance » d'une pratique par standards montre « — » avec la cause en bulle (`title`, mécanisme #713) : **invisible au toucher sur iPad** ; et sa ligne décrit un portfolio (« 4 meilleures, maîtrise de standards ») qui n'existe pas pour cette pratique (`_genererTexteMethodePerformanceMobilisation`, code existant qui suppose qu'une famille non sommative est un portfolio) | **inscrire et continuer** : lot 3 (la section du profil de cette pratique) |
| `sentinelle-noms-reels-retires-2026-10-24` rougit sur la branche : le nom de famille d'une coautrice du rapport PAREA, homonyme d'un nom protégé, est cité dans la fiche de conception (4 fois), le skill (2) et sa consigne (1), réunis de `lot/standards-conception`. Le banc n'admet ce nom qu'en quatre fichiers, une fois chacun | **remonte à Grégoire** (règle 6 : un nom réel ; le banc encode une décision sur ses élèves). Non touché ici |
| `pratique-manager.js` compare les ids des pratiques aux NOMS des constantes de `PRATIQUES_PREDEFINES` (`Object.keys`) : sa migration V2 ne reconnaît jamais une pratique prédéfinie | **commenter et oublier** : sans conséquence observable (migration d'une forme ancienne) |
| Copier une pratique par standards (« Dupliquer », « Partir d'un modèle ») garde le même `ensembleCiblesId` : les deux pratiques partagent leurs cibles | **assumé** (C7 : les cibles sont celles du cours) ; à revoir si Grégoire veut des copies indépendantes |
| L'import d'une pratique seule (sélectif, partage) n'emporte pas son ensemble de cibles : la fiche dit « introuvables », la réédition recrée l'ensemble sous le même id | **inscrire et continuer** : lot du partage (plan, § 3, « non mesuré ») |
