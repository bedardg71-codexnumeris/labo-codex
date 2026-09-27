# Demande de relecture – #966, carte d'alignement lot 4 : « Le guide dit ce que fait la carte »

> Écrite le 27 septembre 2026 par Claude Code (session infonuagique), pour Cowork. Branche `claude/carte-alignement-966-guide`, **partie de la branche #965** (qui part de #964). Consigne : `plans de travail/CARTE-ALIGNEMENT-2026-09-27-4-le-guide-dit-ce-que-fait-la-carte.md`. **Publication avec #964 et #965, jamais avant**, sur accord de Grégoire.

## 1 · Ce qui change

| Page | Geste | Détail |
|---|---|---|
| 1 | remplacée | texte validé, références comprises ; **lien unesdoc retiré** (Grégoire le vérifiera à la main) |
| 2 | ligne ajoutée | après l'astuce du sélecteur de niveau cognitif, en paragraphe |
| 4 | remplacée | la séquence devient facultative (encadré « astuce », comme l'ancienne page) |
| 6 | ligne ajoutée | juste après la liste des quatre types |
| 8 | remplacée | la légende des pastilles d'évaluation est rendue par `legendePastillesEvaluationHTML()`, **la même fonction que l'Inspecteur** : mêmes symboles, mêmes couleurs (comme la page 5 pour les objectifs) |
| 3, 5, 7, 9 | inchangées | empreinte identique à `main` (df359bf), vérifiée par le banc |

Le guide garde neuf pages.

## 2 · Ce que j'ai décidé seul (typographie)

- **Apostrophes courbes et espaces insécables** devant « : » et « ; » et dans les guillemets, comme tout le reste du guide. Les mots sont ceux du texte validé, sans exception ; le banc compare après avoir ramené ces deux signes à leur forme simple.
- **Mise en forme des autres pages** : noms de blocs et d'outils en gras (compétence, idées maîtresses, leçons, badges, pastilles, Leçons, Séquence, Évaluation, Inspecteur), pastille de couleur devant Leçons, Séquence et Évaluation comme ailleurs dans le guide, verbe de lien en italique ; glyphes ✓, ! et ⚠ de la page 1 dans les pastilles `guide-glyphe` existantes.
- **Références** : titres d'ouvrages et de revue en italique (APA), sous un « Références : » en gras, dans le style `planif-guide-ref` de l'ancienne référence.

## 3 · Vérifications demandées (signalées, NON modifiées)

1. **Page 5 (inchangée par consigne)** : « Dans l'Inspecteur d'une activité, d'un exposé ou d'une évaluation de cette leçon, coche les **objectifs servis** » et « Le bloc doit être dans la même leçon que l'objectif ». Depuis #964, l'Inspecteur d'une évaluation dit « **Objectifs vérifiés** », et une évaluation peut cocher (et glisser sur) l'objectif d'une leçon placée avant la sienne. Pas de contradiction franche avec la page 8, mais deux approximations. **À Grégoire de dire s'il faut la retoucher.**
2. **Infobulle `planif-design-apprentissages`** (`js/accompagnement-contenu-hover.js` l. 622) : « Vérification : l'évaluation ferme la boucle — **relie-la à ce qu'elle vérifie (idées maîtresses, connaissances ou activités)**. » **Décrit l'ancien geste, faux depuis #964.**
3. **Définition du terme « Leçon »** (`js/accompagnement-contenu-terme.js` l. 364) : « Un bloc pédagogique **à l'intérieur d'une séquence**… » : présente la séquence comme le contenant obligé, alors que la page 4 la dit désormais facultative.
4. Données du pack démo (`js/demo-namespace.js` l. 86 et 90) : deux liens `se_verifie_par` vers une évaluation. Ce ne sont pas des textes : ils restent lus et comptés (compatibilité #964). Mentionné pour mémoire.

Aucune autre page, infobulle ou aide trouvée (recherche « se vérifie par », `se_verifie_par`, et « séquence » dans les contenus d'accompagnement).

## 4 · Preuves

- **Vitest complet** : 647 fichiers, 7 541 essais verts.
- **Nouvelle sentinelle** `tests/unit/sentinelle-guide-carte-966.test.js`, 9 essais : neuf pages ; texte rendu des pages 1, 4 et 8 **égal** au texte validé (recopié dans le banc : `plans de travail/` est ignoré par la CI) ; lignes des pages 2 et 6 à leur place, le reste gardé ; plus d'unesdoc ni de « se vérifie par » ; légende d'évaluation en page 8 ; mise en forme ; empreinte des pages 3, 5, 7, 9.
- **Mutations, cinq sur cinq rouges** : un mot de la page 1 ; la ligne de la page 2 retirée (**première version de cette mutation mal construite** : un `<p hidden>` gardait le texte ; refaite en retirant la ligne) ; lien unesdoc remis ; page 3 retouchée ; légende d'objectif à la place de celle d'évaluation.
- **Banc réancré** : `sentinelle-carte-alignement-421-426` (« propose N étapes » → « propose N repères », texte validé ; le compte reste calculé).
- **Navigateur** `tests/integration/planif-guide-966.spec.js` : le guide s'ouvre, neuf pages, la page 8 porte les quatre pastilles d'évaluation, sans « se vérifie par ». Captures des pages 1, 2, 4, 6, 8 par `CAPTURES_966=<dossier>` (transmises à Grégoire). **Vert sous Chromium, avec les 24 essais `planif-*`.** Verdict WebKit à prendre sur le Mac.

## 5 · Les mots

Tous les textes sont validés par Grégoire. Aucun mot neuf.
