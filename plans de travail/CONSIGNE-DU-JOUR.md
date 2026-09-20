# Consigne suivante – l'aide de « Exporter et archiver » dit la vérité sur l'écran (#893)

> Écrite le 20 septembre 2026, 13 h 33 (Toronto), par Cowork. **Aucun calcul, aucune donnée touchée : ce lot ne change que des mots.** Les textes proposés ci-dessous attendent le mot de Grégoire (mots lus par les testeurs de la cohorte) : **ne pas les poser avant son « ok »**, qui sera inscrit dans `RELAIS.md`.
> **Condition de départ** : `git --no-optional-locks log origin/main` porte 1.151.3 (`ee2669f9`) ou plus récent. Aucune autre session n'écrit dans `js/` ni dans `index.html`.
> **Archive** : la consigne précédente est rangée par Cowork sous `_ancienne-CONSIGNE-DU-JOUR-2026-09-20-zone-non-planifie.md`. Chemins à commiter avec le lot : les deux fichiers.
> ⚠ **Hors périmètre, et c'est délibéré** : `proposerNettoyage` et ce qu'il supprime (#892). **Le libellé du bouton « Proposer un nettoyage » ne change pas** : une aide ne doit pas promettre un geste plus sûr qu'il ne l'est. La fiche #892 reste ouverte ; Grégoire a demandé le 20 sept. qu'aucun lot n'efface de données de façon irréversible.

---

## 1 · Ce que Grégoire verra

Dans Aide, la carte « Exporter et archiver les travaux » décrit les trois cartes qui existent vraiment à l'écran, plus les cases à cocher qui n'existent pas, plus la fonction d'allègement retirée le 28 août. Dans l'écran lui-même, le bloc d'espace de stockage porte ses accents et parle français plutôt que jargon.

## 2 · Mesuré par Cowork (lecture de `main` à 1.151.3) – à remesurer

- L'écran rend **trois** cartes (`js/travaux-ui.js`, ≈ l. 1284-1340) : « Exporter des travaux » (Évaluations en JSON + productions en PDF), « Trimestre complet », « Export Léa ». Aucune case « Inclure annotés » ni « Inclure évaluations » n'existe.
- L'aide (`index.html`, accordéon `accordeon-aide-exporter-archiver`, ≈ l. 11717-11750) annonce « 4 modes d'export », les deux cases, et « Allègement des fichiers » (fac-similé, retiré le 28 août).
- La fiche d'accompagnement `js/accompagnement-contenu-popup.js:512` : titre « Archivage des travaux » (l'écran dit « Exporter et archiver » depuis #569) ; ≈ l. 530 : « importé via le panneau Annoter et évaluer » (l'import vit dans « Préparer et importer »).
- `chargerQuota` (`js/travaux-ui.js`, ≈ l. 3685-3706) : « utilises », « Espace bientot plein », « liberera », « Rafraichir », « Mode: IndexedDB ».
- `docs/modules/pipeline-annotation-evaluation.md` ≈ l. 165-205 : mêmes modes périmés, section « Allegement ».

## 3 · Ce qui est attendu

1. **Réécrire l'accordéon de l'aide** avec les textes du §6, une fois validés. Aucun autre accordéon touché.
2. **Corriger la fiche d'accompagnement** : titre « Exporter et archiver » ; l'inventaire vient de « Préparer et importer ».
3. **Accents et français dans le bloc d'espace** (§6). Le bouton « Proposer un nettoyage » garde son libellé et son comportement.
4. **Mettre le document `docs/modules/pipeline-annotation-evaluation.md` au même état** : trois modes, section « Allegement » retirée, un renvoi à la date du retrait (28 août).
5. **MESURER avant d'écrire** : les trois titres de cartes et leurs sous-titres se lisent dans le code qui les REND, pas dans l'aide (erreur 2 du relais : un écran se nomme par ce qu'il affiche).

## 4 · Arrêts

- Si une carte, une case ou une option existe à l'écran et que le §6 ne la nomme pas : arrête-toi et dis-le. Mon texte est une proposition lue dans le code, pas un inventaire prouvé.
- Aucun changement de comportement, aucune donnée réécrite, aucun libellé de bouton d'action modifié.

## 5 · Preuve

- Une sentinelle qui vérifie que l'aide nomme les trois cartes RENDUES et aucune quatrième, et qu'elle ne cite plus « Inclure annotés », « Inclure évaluations » ni « Allègement » ; mutation : réintroduire un mode → rouge.
- Une garde d'accents sur les chaînes de `chargerQuota` (aucun « utilises », « liberera », « bientot », « Rafraichir » dans le texte rendu à l'écran).
- Banc WebKit : ouvrir l'Aide, déplier la carte, lire les trois modes.
- Patch par `scripts/release.mjs`. Entrée de « Nouvelles » : une ligne, PROPOSÉE.

## 6 · Les textes proposés (à valider par Grégoire)

**Aide › Exporter et archiver les travaux**

> **Navigation :** Évaluation → Exporter et archiver
>
> Cet écran sort tes copies et tes évaluations de l'application, sous forme de fichiers que tu gardes sur ton ordinateur.
>
> **Trois façons d'exporter :**
> 1. **Exporter des travaux** : une sélection, par production ou par élève. Tu reçois les productions en PDF et les évaluations en JSON.
> 2. **Trimestre complet** : toutes les productions en PDF, classées par élève, avec les évaluations en JSON. C'est l'archive de fin de session.
> 3. **Export Léa** : la copie annotée et son évaluation – note et rétroaction – en un PDF prêt à téléverser dans Léa.
>
> Les copies annotées et les évaluations sont toujours incluses : il n'y a rien à cocher.
>
> **Espace de stockage :** le bloc en haut de l'écran dit ce que tes copies occupent. Exporte tes anciennes copies avant d'en importer beaucoup d'autres.

**Bloc d'espace de stockage (l'écran lui-même)**

> 45 Mo utilisés sur 100 Mo (45 %)
> 12 fichiers de travaux (34 Mo)
> Rangement : dans le navigateur — ou : Rangement : fichiers sur ton disque
> **L'espace est presque plein.** Exporte tes anciens travaux avant d'en importer d'autres.
