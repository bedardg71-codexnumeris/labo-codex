# Rapport – les critères d'une cible en vue simple (22 nov. 2026)

**Dernier relais** : branche `lot/vue-simple-criteres-cibles`, partie de `lot/vue-simple-porte-standards` (`ef9d5e2bc`,
1.255.0), pour que la porte parte seule. Arbre : `../labo-codex-criteres-cibles`. Release 1.256.0 préparée (build
`1122-1017`) ; ligne de Nouvelles PROPOSÉE. **Non fusionné, rien sur `main`.** Ordre de mise en ligne : la porte d'abord,
puis ce lot (une avance rapide de plus). Reste : la validation de la ligne de Nouvelles, le verdict complet WebKit sur
le Mac, le feu vert de Grégoire.

Décision : Grégoire, 22 nov., 9 h 14 (elle remplace, pour les critères, celle du 21 nov. à 14 h 20).

## 1. La mesure, en lecture seule (avant tout code)

- **La fenêtre d'inscription de la vue simple** (`ouvrirInscriptionSimple`) ne montrait AUCUN critère, par construction
  (commentaire du 21 nov. : « ni critères, ils se cochent en vue étendue »). Chaque inscription écrivait pourtant les
  critères de la cible, tous « non renseignés » (`etatDesCriteres(cible, {})`). La dernière inscription les cachait aussi.
- **« Ta pratique »** ne montrait des cibles que leur étiquette, en pastilles : des critères venus de la vue étendue y
  étaient invisibles. Ils n'étaient pas perdus : renommer une cible la réécrivait entière (`ciblesReglees`).
- **Le modèle** : `ensemblesCibles`, `cibles[].criteres: [{ id, texte, essentiel }]`, seul écrivain
  `EnsemblesCibles.enregistrer`. Chaque inscription garde une copie des critères jugés (id, texte, essentiel, respecte).

## 2. Ce qui change, en gestes

- **« Ta pratique », cibles lues** : une liste ; sous chaque cible, ses critères (« Critère essentiel » en marque) et
  « + Ajouter un critère ». Ce bouton ouvre le réglage des cibles avec une ligne de critère neuve, le curseur dedans.
- **Réglage des cibles** : sous chaque cible, « Critères, un par ligne », une ligne par critère (texte, case « Critère
  essentiel », « Retirer ce critère »), puis « + Ajouter un critère ». L'aide B3 sous la phrase d'intro. « Enregistrer »
  écrit par le seul écrivain ; énoncé, poids, « terminale » de la vue étendue restent. Une ligne vide n'est pas un critère.
- **Inscrire un niveau** : si la cible a des critères, la section « Critères » de la vue étendue (mêmes morceaux, mêmes
  mots : « Respecté », « Non respecté », touche encore pour vider), 46 px. Les coches sont écrites ; rien n'est calculé.
  Une cible sans critère : pas de section. La dernière inscription montre ses critères.
- **La création ne change pas** : cibles une par ligne, « Créer ma pratique », aucun critère exigé.

## 3. Retirer un critère qui porte des coches

Rien n'est effacé et aucune question n'est posée (comme en vue étendue) : chaque inscription garde le texte, l'identité
et la coche des critères qu'elle a jugés. Mesuré par le banc : l'inscription passée identique, octet pour octet, après
le retrait.

## 4. Supposition nommée : le mot « critère » en vue simple

Le banc de la vue simple interdisait « critère » (règle du 9 nov. : mots qu'un novice ne lit pas). La décision de 9 h 14
et les mots acceptés l'y amènent. La tolérance est BORNÉE aux zones des cibles d'une pratique « Par standards » (le bloc
« Tes cibles » et la fenêtre d'inscription) ; partout ailleurs, la règle tient.

## 5. Mots

Aucun mot neuf affiché. Repris tels quels : B15, B17, B18, B19, B3 (`TEXTES-2026-11-20-par-standards-lot-1.md`), et ceux de
la fenêtre de la vue étendue. B17 sert aussi de marque sur un critère lu (la fenêtre, elle, garde sa marque en
minuscule, « critère essentiel », mot de la vue étendue). PROPOSÉS : le titre et la ligne de Nouvelles 1.256.

## 6. Preuves

- Vitest : sentinelle V4 bis (3 essais : gestes, ligne vide, cible neuve ; brouillon sans critères). Brouillon V4 aligné.
- Playwright, banc « les critères d'une cible », 3 essais : ajouter/renommer/retirer ; inscrire avec coches ; aller-retour
  avec la vue étendue (écrivain et éditeur de la vue étendue) et inscription intacte après retrait.
- Break-tests : coches non lues → rouge (`true` attendu, `null` reçu) ; critères du brouillon ignorés → rouge (unitaire et
  banc) ; réglage non relu → rouge. Restauré.
- Bancs WebKit : vue simple et épinglage 63 verts ; « Par standards » voisins 20 verts. Vitest complet : 948 fichiers,
  12 308 verts. Cliquet #679 : trois classes neuves ont reçu leur règle.
- Captures WebKit (réglage, lecture, fenêtre ; clair et sombre) : dans le bloc-notes de la session, à relire par Cowork.
- Complexité : au-dessus de 15 : 434 → 434 ; somme 10 950 → 10 950 ; au-dessus de 30 : 75 → 75.
