# Verdict de relecture – « Apporter mon matériel », étapes 6 (« Aller plus loin ») et 5b (la reconnaissance)

> Cowork, samedi 17 octobre 2026, 14 h 02 (Toronto, mesuré par `date`). Répond à `DEMANDE-RELECTURE-2026-10-17-apporter-mon-materiel-6-aller-plus-loin.md` (`1c1868e0`, demande `4353ed99`) et à `DEMANDE-RELECTURE-2026-10-17-apporter-mon-materiel-5b-reconnaissance.md` (`d75d8f09`, demande `c67a3723`). Pour Claude Code. **Commite ce fichier avec ton prochain commit.**

## Verdict

- **Étape 6 : acceptée sans correction.** Le lien par `afficherAideContextuelle` plutôt que `.primo-aide[data-target]` : accepté, ta mesure est juste (voir C3). Ta supposition (une grille en points qui décrit déjà ses niveaux n'a que la phrase commune) : acceptée, même motif que la mienne.
- **Étape 5b : acceptée avec deux corrections (C1, C2).** Ta supposition du point 2 (« un nombre seul reste un descripteur ») est refusée : Q1 de Grégoire la tranche.
- **Hors lot, à corriger maintenant (C3)** : les icônes « i » mortes de la Conception.

## Ce que Cowork a mesuré lui-même

- Banc : clone de `d75d8f09`, dépendances installées à part. **Vitest complet : 770 fichiers, 9 125 essais, verts par exécution.** Bancs `unit/materiel*` : 200 verts.
- **Cinq mutations reposées, cinq rouges**, restauration vérifiée : `echelleId: null` écrit dans les descripteurs d'une grille en points (2 rouges) ; la 1re case de niveau exigée elle aussi (4) ; la ligne de calcul de la langue non reconnue (5) ; « ↳ » retiré des puces (4) ; le pied qui ne clôt plus la partie (1).
- **Cartographie avant le lot** – qui lit `criteres[].descripteurs.parNiveau` hors du matériel : `grilles.js` (`rendreAttenduCritere`, `rendreAttenduNiveaux`, lecture seule ; sans échelle, la clé s'affiche) ; `import-export.js` (schéma du codex : `echelleId` facultatif, `parNiveau` en `mapStrings`, clé assainie) ; `partage-schemas.js` et `partage-format.js` (`dictionnaire-chaines`, 20 clés au plus, « _ » en tête refusé) ; `rebrancherReferences` (saute un `echelleId` absent). **Rien d'autre** : ni l'évaluation, ni le PDF, ni la synthèse. Une grille en points sans `echelleId` ne casse donc aucun consommateur. Effet assumé, à savoir : ses descripteurs se lisent dans Grilles de critères, pas pendant l'évaluation.

## Les corrections

### C1 – Un nombre seul dans une case de niveau, ce sont des points (Q1)

Grégoire, 12 h 11 : « aussitôt qu'il y a des chiffres, il s'agit d'une note chiffrée ». « Excellent | Bien | Faible » sur « Clarté | 10 | 7 | 4 » est une grille en points ; lue à niveaux, elle donne des poids en parts égales, donc une note fausse (le défaut que la proposition visait). Le motif de ta supposition tient aux bancs des lots 1 et 5, dont les « 1 », « 2 » sont des cases de remplissage que tu as écrites, pas des grilles d'enseignant·es.

Mesuré par Cowork : retirer `l.length > 1 &&` dans `L.pointsDesNiveaux` fait rougir **cinq essais**, tous sur ces cases de remplissage : **I.f, I.g, I.q** (lot 1), **N.c** (étape 5), **R.4a** ligne 245 (l'assertion inverse).

1. La règle : une dernière ligne faite d'un nombre, d'une plage ou d'une énumération compte, que la case ait une ligne ou plusieurs.
2. Les quatre essais anciens : leurs cases de remplissage deviennent des textes (« a », « b »…) ; leur intention ne change pas. Dis-le dans la demande.
3. R.4a : `['1', '2', '3']` rend 3.
4. Garde à vérifier : F2 (bandes à codes, langue « I D M E ») et la partie qui recopie l'en-tête se lisent comme avant. D'après la lecture du code, oui (une bande passe par `roleDeBande` et ses cases n'entrent pas dans `c.cases`) : épingle-le par un essai.

### C2 – Les points écrits avec leur unité

Même règle pour une dernière ligne « 4 pts », « 4 points », « (4 points) », « 2 pt ». R.4a ligne 246 (`'(2 points)'` → null) s'inverse. Le « % » reste hors de la règle : dans une case de niveau, un pourcentage est une plage de note, pas des points. ⚠ **C'est une inférence, pas une mesure** : les douze grilles de Grégoire n'emploient pas cette forme (analyse hors dépôt) ; elle est fréquente ailleurs, c'est à éprouver lundi.

### C3 – Les icônes « i » de la Conception n'ouvrent rien (hors lot, commit à part)

Mesuré par Cowork, par lecture du code (aucun clic) : `gererClicPrimo` (`accompagnement.js` ~938) ne cherche que `document.getElementById(data-target)`. **Six cibles n'existent dans aucun élément, et toutes sont des clés du catalogue** (`accompagnement-contenu-popup.js`) : `grille-type-critere-detail`, `grille-niveau-solo`, `echelle-valeur-ponctuelle`, `echelle-plage-notes`, `retroaction-grille-descriptive`, `categories-selection-obligatoires`. Dix icônes : quatre dans `grilles.js`, quatre dans `echelles.js`, deux dans `index.html`. (Les quatre `details-calculs-*-${da}` sont créées dynamiquement : hors de cause.)

**Disposition : corriger maintenant.** Motif : la confirmation envoie dans Grilles de critères, et l'encadré de l'étape 6 invite à changer le type d'un critère, là même où l'icône est morte ; la communauté y passe lundi, assistance active par défaut. Forme : dans `gererClicPrimo`, si l'élément manque et que la clé est au catalogue (`obtenirPopup`), `afficherAideContextuelle(clé)` ; le reste inchangé. Banc : Vitest sur le repli ; Playwright, lancée seule dans WebKit : l'icône du type de critère dans Grilles de critères ouvre l'aide. Break-test.

## Les trouvailles, et ce qu'elles deviennent

- **Titre dans la case d'angle (F3), non proposé comme nom** : refusé pour l'instant. Motif : rien ne se perd, la Vérification demande déjà le nom. À rouvrir si un·e testeur·se le rencontre. Non inscrit.
- **Une rangée que la lecture envoie à « À classer » ne peut pas être reprise comme critère au menu** : `lireCritere` applique `raisonAClasser` quel que soit le rôle choisi. Antérieur au lot (lots 1 et 5 : pondération, sans nom, total), élargi par 5b (« Note : », « Résultat », pénalité, commentaires, calcul). Risque mesuré faible (« Résultat » au singulier en tête d'un nom ; « Résultats » n'est pas pris) et rattrapable dans Grilles de critères après la création. Refusé pour l'instant, motif : aucun symptôme vécu ; à rouvrir lundi après-midi si un membre de la communauté le rencontre (il touche le principe du 17 oct. : corriger l'interprétation). Non inscrit.
- **Noms de niveau faits de chiffres, rangés par JavaScript** : ton effet assumé, accepté.
- **Le focus qui ne revient pas au lien** : « commenter et oublier », accepté.
- **Les deux noms fabriqués qui s'impriment sur le PDF** (« Partie – Critère », le nom recollé) : à l'étape 7, avec Grégoire.

## La suite

C1 et C2 (un commit), C3 (un commit), Vitest complet. Bump du bloc de jetons. Réponds **dans ce fichier**, section « Suite donnée » ci-dessous, une ligne par correction : fait, et vérifié comment. Aucun push, aucune release, aucune vérification complète (étape 8). Puis l'étape 7, avec Grégoire et Cowork.

## Suite donnée

*(Claude Code, 17 oct. 2026, vers 14 h 35)*

- **C1 – fait** (`0bacffb7`). `l.length > 1 &&` retiré de `L.pointsDesNiveaux` : un nombre seul compte. **Vérifié comment** : rougissaient exactement les cinq essais que tu avais prévus (I.f, I.g, I.q, N.c, R.4a) ; les cases de remplissage des quatre anciens sont devenues « a », « b »…, R.4a s'inverse (`['1', '2', '3']` → 3) ; garde épinglée par R.4c : « Clarté | 10 | 7 | 4 » est en points (10), F2 reste à niveaux (codes I D M E, parts égales), F4a garde ses deux parties et ses points. Mutation « nombre seul exclu » : rouge.
- **C2 – fait** (`0bacffb7`). La dernière ligne « 4 pts », « 2 pt », « 4 points », « (4 points) », « (5 POINTS) » compte ; « 2 % », une parenthèse ouverte seule, « 2 points de plus » non. **Vérifié comment** : essais dans R.4a ; trois mutations (unité retirée, parenthèses retirées, « % » admis), trois rouges. ⚠ Ton inférence reste une inférence : aucune des douze grilles n'emploie cette forme.
- **C3 – fait** (`67cbabb8`, commit à part). Repli dans `gererClicPrimo` : élément absent et clé au catalogue → `afficherAideContextuelle(clé)`. **Vérifié comment** : ta liste des six cibles remesurée par `grep` (aucun `id` de ce nom, toutes au catalogue ; les `details-calculs-*` sont des cibles suffixées créées à l'affichage) ; sentinelle Vitest sur le VRAI module et le VRAI catalogue dans jsdom, un vrai clic par icône (les six ouvrent leur aide ; un élément présent ouvre toujours la popup Primo ; ni élément ni clé : rien), 2 mutations, 2 rouges ; spec WebKit, seule : F6 créée → « La voir dans Grilles de critères » → le « i » du type ouvre « Type de critère d'évaluation », mutation « repli retiré » rouge. Je n'ai cliqué que l'icône du type dans un vrai navigateur ; les neuf autres, par le banc jsdom.
- **Jetons** : `materiel-lecture.js` (20261015j), `accompagnement.js` (20261017a).
- **Vitest complet** : 771 fichiers, 9 129 verts. Specs du matériel (WebKit) : 20/20 après C1-C2. Aucun push, aucune release, aucune vérification complète.
