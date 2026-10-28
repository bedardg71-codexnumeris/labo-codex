# Consigne – L'Aide, lot 2d : le Labo, le codex et la Référence disent vrai, en moins de mots (#1152)

> Écrite par Cowork le mercredi 28 octobre 2026 à 12 h 50 (Toronto, mesuré par `date`), sur `main` = `81baa318` (lots 2c et 2c bis faits et relus ; #1175 fait et relu ; rien de poussé). Ce fichier ne remplace aucune autre consigne : n'y touche pas.
> Plan : `PLAN-2026-10-24-refonte-de-l-aide.md`. Sources, **dans cet ordre** : `audit-aide-2026-10-24/REMESURE-2026-10-27.md` (sections Labo, Codex et archives, Référence ; elle l'emporte sur le dossier pour les entrées qu'elle nomme), puis `AUDIT-AIDE-2026-10-24.md` (décisions D1 à D13, verdicts finals), puis le détail : `lot-5-consultation.md` (`labo`, `rai-solo`, `bilan-reflexif`), `lot-4-utilisation-2.md` (`modelisation`, `collaboration`), `lot-1-introduction.md` (`pan`, `criteres`, `partage`), `lot-2-configuration.md` (`grille-depistage`), `lot-6-reference.md` (`codex`, `export-import`, `glossaire`, `faq`, `problemes`, `ressources`).
> **Les lots 2a à 2c bis servent de modèle** : même méthode, mêmes règles de mots, mêmes tests. Rappels des verdicts : l'ordre se lit dans `js/config.js` (sous-onglets du Labo, l. 85-93) ; un libellé se recopie ; « seul », « toujours », « partout » ne s'écrivent qu'après avoir mesuré tous les autres écrans (l'erreur de « Détails » au 2c bis) ; aucun mot qui juge l'élève (le vocabulaire du risque et de l'urgence, retiré le 15 oct.).

## 0. Avant tout

- Un seul lot à la fois, sur un `main` à jour, aucune suite qui tourne. Rituel de début de session.
- Commit de docs seul, fichiers nommés : ce fichier et `VERDICT-RELECTURE-2026-10-28-aide-lot-2c-bis.md`. Rien d'autre (`CONSIGNE-DEMARRAGE-COWORK.md` et les deux icônes non suivies restent hors du commit).

## 1. Le mandat

Les 16 entrées des trois dernières parties en font 13, hors `glossaire-statique`, qui n'est pas de ce lot (il part au lot 3, un seul glossaire : n'y touche pas). `modelisation` est absorbée par `labo`, `criteres` par `grille-depistage`. Chacune dit ce que fait l'écran d'aujourd'hui, sans redire l'écran ni ses aides contextuelles ; la théorie va aux guides intégrés (D1). Environ 5 575 mots aujourd'hui (compte de Cowork, sans `glossaire-statique` ; donne aussi le tien), environ 1 930 visés selon les verdicts finals. Aucun comportement ne change ; aucun fichier de `js/` touché sans le dire.

## 2. Les entrées

Repère chaque entrée par son id (préfixe `accordeon-aide-`). Cibles : le tableau des verdicts finals.

**Labo** (ordre : les sous-onglets, Outils d'observation, Modélisation, Exploration des pratiques, Rythme de travail, Études, Bilan réflexif, Suivi longitudinal ; une entrée qui explique un réglage se range à côté de l'écran qui le porte ; propose l'ordre, avec son motif).

1. **`labo`** absorbe **`modelisation`** (~180 + ~25 mots). Une vue d'ensemble du Labo : une ou deux phrases par sous-section, dont Exploration des pratiques (avec les six paramètres de la carte PAN, si `pan` ne les porte pas), Rythme de travail, Suivi longitudinal, Modélisation en une phrase (« + Ouvrir » : PDF, JPG, PNG, HEIC ; la palette d'annotation sans les codes) ; les Études réduites à ce que les notes de l'écran ne disent pas ; aucune lecture causale des courbes (« des pistes de réflexion, pas des preuves »). **Piège** : `sentinelle-audit-aide-lot-D` exige que l'id `accordeon-aide-modelisation` existe : mesure-la, et adapte-la par décision (fusion) en citant cette consigne. Un titre neuf va à Grégoire.
2. **`pan`** (~150). Couper les familles, déjà dans `pratique` ; garder les six paramètres en les rattachant à l'écran qui les affiche.
3. **`grille-depistage`** absorbe **`criteres`** (~130 + ~60). Les sept corrections du dossier : le réglage s'écrit dès qu'on le change (plus d'« Enregistrer les réglages ») ; « + Nouvelle grille » puis « Créer la grille » ; le total de 100 % ne vaut pas pour une grille en points ; le rapprochement des critères par leur nom (égalité ou préfixe, sans accents ni casse), pas « la même grille pour toutes tes évaluations » ; les points d'abord, le niveau sinon ; le « Seuil de défi spécifique » (70 % par défaut, réglable de 60 à 80) ; la pondération ne départage que deux scores égaux. De `criteres`, ce qui n'a de sens qu'avec ce réglage (~60 mots). « analyse tes rétroactions » reste interdit dans toute l'Aide (sentinelle du 15 oct.).
4. **`rai-solo`** (~120). Les deux options avec leur libellé exact (« Appliquer une adaptation du modèle de la Réponse à l'intervention », « Activer l'observation de la structure des résultats d'apprentissage ») et le « active si / désactive si » ; la carte SOLO regroupe les critères par niveau atteint de l'échelle, un bloc par niveau, sous le nom que l'enseignant·e lui donne, plus de forces et défis (#542) ; **la remesure** : plus « 4 niveaux IDME », l'Échelle de départ en a cinq depuis le 27 oct., « PS – Préstructurel » en tête (ne nomme pas les niveaux si l'écran lit ceux de l'échelle de chacun). **Pièges** : la sentinelle du 15 oct. tranche « Option 1 : Détection des patterns » → « Option 2 : Observation » et y exige les six patterns nommés ; `sentinelle-audit-aide-lot-A` exige le libellé « Appliquer une adaptation… ».
5. **`bilan-reflexif`** (~150). Les trois corrections (« Cliquer pour sélectionner un fichier CSV », pas de glisser-déposer ; « Copier les questions », sans nommer de service ; l'anonymat dépend du formulaire externe, que l'écran demande de configurer). Le verdict final dit aussi « retirer l'import des résultats jusqu'au correctif » : **mesure d'abord** si ce correctif est fait ; s'il ne l'est pas, retire, et dis-le.

**Codex et archives**

6. **`codex`** (~220). **La remesure** : « Mettre à jour le codex » ouvre une fenêtre d'aperçu (titre « Mettre à jour le codex », bouton « Mettre à jour », son « i » vers « Ce que contient le fichier ») ; « Écrire le codex à part » avant une suppression (trimestre, groupe-cours, étudiant·es). Le renvoi pour archiver : « Archiver… » du menu archive **un groupe-cours** ; un trimestre entier s'archive par la bibliothèque des trimestres (« Clos (n) », ⋮ › « Archiver le trimestre… »). Les trois redites partent.
7. **`export-import`** (~150). L'encadré Loi 25 reste mot pour mot (`sentinelle-862` : titre de la carte, encadré, lien, contact). **La remesure** : entre trimestres, la bibliothèque (« Garder dans ma bibliothèque → », « ← Utiliser dans ce trimestre ») et le repli « Importer depuis un autre trimestre », au lieu de l'export de configuration.
8. **`partage`** (~70). Ce qui rassure (fichier signé, licence, rien de confidentiel) ; le mode d'emploi renvoie à `collaboration`. **La remesure** : le repli par trimestre est au pied de « Dans ce trimestre » pour les grilles, cartouches et pratiques, au pied de « Dans ta bibliothèque » pour les échelles et les productions, où la copie arrive.
9. **`collaboration`** (~220). Cinq ressources (les pratiques aussi) ; « Exporter pour partager » dans le ⋮ d'une rangée de « Dans ce trimestre » ; l'import par « Importer ou exporter ▾ › Importer le partage d'une ou d'un collègue », dans les cinq fenêtres, **et** par Réglages › Données (**la remesure l'emporte** : le dossier disait faux « une seule zone de dépôt ») ; « Partagés par des collègues », au pied de « Dans ta bibliothèque », non modifiable, et « Duplique vers mes documents » ; l'identité vient de Cadre › Trimestre › Enseignant·e ; la chaîne d'attribution a un seul maillon (pas « préservé à jamais », pas « les trois personnes ») ; « Exporter pour partager » ne demande aucun nom ; l'import .txt compare les noms sans casse, accents ni ponctuation, puis par inclusion. Gardé : « Ressources partageables (.lcz signé) » (sentinelle du 15 oct.). **Piège** : `sentinelle-audit-aide-lot-E` (le nom de famille du propriétaire précédé d'une marque d'exemple) : mesure ce qu'elle exige.

**Référence** (sans `glossaire-statique`)

10. **`glossaire`** (~12). Titre sans nombre ; phrase sans la liste des étapes. Les corrections de `js/accompagnement-contenu-terme.js` que liste le dossier **ne sont pas de ce lot** (lot 3).
11. **`faq`** (~310). Les questions qui répètent une carte voisine partent ; les quatre réponses qui décrivent un geste ou une règle que le code ne fait pas se corrigent ou partent ; la remesure : le matériel se garde pour tous les trimestres par la bibliothèque. **Pièges** (sentinelle du 15 oct.) : la question des seuils, « Transférer le fichier codex », et la phrase RàI, comptée au moins trois fois dans l'Aide : mesure le compte après les lots 2c bis et 2d avant de couper.
12. **`problemes`** (~70). Les deux solutions qui renvoient à un bouton absent : le geste réel (dont le calendrier) ; « Régénérer » : `sentinelle-audit-aide-lot-A` l'exige dans l'Aide et le dossier la dit faux vert : mesure, et dis ce que tu fais.
13. **`ressources`** (~120). Ne garder que la bibliographie ; « LICENSE.md » devient « Réglages › À propos ». Gardée : la mention « Bédard » marquée par « Pédagogie collégiale » ou l'année (`sentinelle-audit-aide-lot-E`).

**D2 ailleurs.** Toute phrase qui présente la pratique de Grégoire comme la règle : un exemple, au conditionnel, ou elle part.

## 3. Les règles de mots

Celles des lots 2a à 2c bis. Pour Grégoire : les titres neufs, et les phrases qui disent quelque chose de l'application au-delà d'un libellé d'écran (décision de Cowork du 27 oct., 15 h 40).

## 4. Les tests

- Les sentinelles de l'Aide avant de toucher (`tests/unit/sentinelle-*aide*`, dont `-15-oct-…`, `-lot-A` à `-lot-E`, `sentinelle-862`, `sentinelle-803`, et les specs de l'Aide).
- Une assertion qui tombe par décision (fusion, correction, borne déplacée) : adapte-la en citant l'audit, la remesure et cette consigne. Une autre : arrête-toi et dis-le.
- **Une sentinelle neuve**, `tests/unit/sentinelle-aide-2026-10-28-lot-2d.test.js`, calculée des deux côtés : chaque partie a ses entrées dans l'ordre retenu, `modelisation` et `criteres` absentes, `glossaire-statique` intacte (son texte inchangé, sha256 de sa tranche) ; aucune entrée des trois parties ne dit « sidebar », « barre latérale », « dropdown », « Enregistrer les réglages », « 4 niveaux IDME », « préservé à jamais », « une seule zone de dépôt » ; chaque libellé entre « » de `codex`, `export-import`, `partage` et `collaboration` existe dans `index.html` ou `js/` hors de l'Aide. Break-test, arbre restauré par sha256.
- **Un essai Playwright ciblé** : la recherche de l'Aide trouve « Modélisation », « Importer le partage » et « Archiver le trimestre », chacune dans sa partie.
- Vitest depuis `tests/`.

## 5. Ce qui n'entre pas

`glossaire-statique` et `js/accompagnement-contenu-terme.js` (lot 3) ; les sept trous (lot 4) ; les textes d'écran hors de l'Aide (lot 5). Le réglage de la copie non recevable (#1176) : rien à écrire ici.

## 6. Clôture

- `BACKLOG.md` : sous #1152, le lot 2d ; le plan dit « 2d : codé, en relecture ».
- Demande de relecture : `plans de travail/DEMANDE-RELECTURE-2026-10-28-aide-lot-2d.md`, sur le modèle des lots 2c (entrée par entrée, mots avant et après, preuves `fichier:ligne`, tests, « Pour Grégoire », captures de `labo` et de `collaboration` à 1 440 et 820 px).
- Pas de release, de verdict ni de push sans le signal de Grégoire.
- Le geste à vérifier à l'écran après la mise en ligne : Aide › Labo, « Labo » présente ses sept outils ; Aide › Codex et archives, chercher « collègue » mène à l'import par la bibliothèque.
