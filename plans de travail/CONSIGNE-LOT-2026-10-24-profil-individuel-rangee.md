# Consigne – Le profil individuel : la rangée de sélection au lieu de la barre latérale (lot 2 bis)

> Écrite par Cowork le samedi 24 octobre 2026 à 17 h 45 (Toronto, mesuré par `date`), sur `main` = `2e19fddb` (lots 1 et 2 acceptés, non poussés ; `origin/main` = `973ad366`, 1.217.0). Plan : `PLAN-2026-10-24-bibliotheques-chaines-critere-algo.md` (ligne « 2 bis » ajoutée). Maquette validée par Grégoire à 17 h 41 (« ça convient tout à fait ») : https://claude.ai/artifact/VB2a6v7wB3yPXgg2rDfopp. Modèle : la rangée des lots 1 et 2 (`.rangee-selection`).

## 0. Avant tout

- Ce lot part de `main` tel quel (lots 1 et 2 non poussés : ne les pousse pas).
- Rituel de début de session. Aucune suite en arrière-plan.
- Un commit de docs seul, fichiers nommés : ce fichier et la ligne du plan.
- Inscris une fiche au BACKLOG (prochain numéro libre), demande de Grégoire du 24 oct. : elle sert de numéro à ce lot.

## 1. Ce que le lot livre, en gestes

Dans **Suivi › Profils individuels**, la barre latérale du profil (`.layout-sidebar-2col` › `.sidebar-navigation`, rendue par `afficherProfilComplet`) disparaît. La section prend toute la largeur. En tête, **une seule bande** de la rangée des lots 1 et 2, sur deux lignes :

- **Ligne du haut, l'élève** : « **Liste des étudiant·es** » (bouton principal, à la place de « Consulter la bibliothèque » ; il mène à Suivi › Liste des étudiant·es), puis **‹**, le menu de l'élève (`#selecteurEtudiantProfil`, 44 px, apparence du lot 1), **›**, et le compte « 2 sur 8 ». Poussées à droite, les **étiquettes** de l'élève : statut s'il est exclu (« Abandon · hors des moyennes du groupe »), groupe, programme, « Services adaptés », « Mesure d'aide », selon ce que la carte d'aujourd'hui affiche.
- **Ligne du bas, la section** : les sections d'aujourd'hui en **boutons**, dans le même ordre, avec les mêmes libellés et les mêmes conditions d'affichage (Jugement seulement avec une pratique par dénotation, Engagement ACP, Progression temporelle ACP, Développement des habiletés et Accompagnement selon leurs réglages). Le bouton de la section ouverte est plein, les autres sont bordés.

Le titre « **Profils individuels** » apparaît en tête de la sous-section, avec les deux boutons d'aide qui sont déjà là, comme les autres sous-sections du Suivi (`h2.titre-avec-emoji-toggles`).

## 2. Décidé par Cowork (si la mesure les contredit, dis-le plutôt que de les suivre)

1. **Le menu de l'élève garde son identifiant et son gestionnaire** (`data-on-change="afficherProfilComplet"`), comme les menus du Cadre au lot 2. Pas de `MenuSelection` ici : il n'y a ni « Aucun … ouvert » ni création. Son texte d'option ne change pas (« Nom, Prénom (DA) », sans DA en anonymisation).
2. **‹ et ›** remplacent « ← Préc. » et « Suiv. → » : boutons de 44 × 44 px de chaque côté du menu, `aria-label` et `title` « Étudiant·e précédent·e » / « Étudiant·e suivant·e » (les titres d'aujourd'hui), désactivés aux deux bouts.
3. **La carte d'identité** (`.sidebar-info-card`) part : le nom est dans le menu. Ce qu'elle disait d'autre devient les étiquettes de la ligne du haut, **bordure égale sur les quatre côtés** (règle de Grégoire du 24 oct. : pas de liseré). L'attribut `data-statut-exclu` suit l'étiquette du statut. Le DA n'est pas répété (il est dans le menu).
4. **Le titre de la section ouverte (le `h2` de `.profil-contenu-header`) quitte l'écran** : le bouton plein le nomme déjà (même raisonnement qu'au lot 1, où le nom de la fiche ouverte est dans le menu). Il reste pour le lecteur d'écran (`u-lecteur-ecran`). Son infobulle (`data-tooltip="profil-…"`) passe sur le bouton de la section. L'icône d'aide propre à la section (`primo-aide`) reste visible, en tête du contenu, à droite.
5. **Un seul rendu de l'en-tête de section.** Aujourd'hui, deux chemins le dessinent : `_resoudreSectionContenu` à l'ouverture et le `switch` de `changerSectionProfil`, avec des titres qui divergent (« Progression » / « Progression temporelle ACP ») et une icône d'aide qui ne vise pas la même cible (`details-calculs-risque-` à l'ouverture, `details-calculs-<section>-` au changement). Fais passer les deux par le même code. Dis quelle cible d'aide tu gardes et pourquoi.
6. **Le bouton actif se marque par sa `data-param`**, pour le clic comme pour l'appel programmatique (`tableau-bord-apercu.js` l. ~1118 appelle `changerSectionProfil('mobilisation')`). Le code actuel cherche un attribut `onclick` qui n'existe plus depuis le passage à `data-action` : appelé par programme, il ne marque rien. C'est le lot qui réécrit ce marquage, pas une trouvaille. Plus de recours au global `event`.
7. Les classes propres à la barre du profil partent avec leur CSS après un `grep` : `.sidebar-filtre`, `.sidebar-info-card*`, `.sidebar-nav-buttons`, `.sidebar-section-titre` (mesuré : le profil seul les emploie). **`.layout-sidebar-2col`, `.sidebar-navigation` et `.sidebar-item*` restent** : l'Animation (#1039, `index.html` l. ~8073) et d'autres écrans s'en servent.

## 3. Où (mesuré par Cowork, à revérifier)

- `js/profil-etudiant-sections-affichage.js` : `afficherProfilComplet` (le gabarit l. ~2585-2690), `changerSectionProfil` (l. ~2033-2160), `_resoudreSectionContenu` (l. ~2445), `_postRendreProfilSection`.
- `index.html` : `#suivi-profil` (l. ~8026), ses deux boutons d'aide et `#contenuProfilEtudiant`.
- `styles.css` : `.rangee-selection*` (l. ~9663) ; les règles de la barre du profil (l. ~9781-9815) ; `.layout-sidebar-2col` (l. ~9452, ne pas toucher).
- `design-system.html` : la rangée y est décrite depuis le lot 1 ; ajoute la variante à deux lignes (sections en boutons) et les étiquettes de l'élève.

## 4. Pièges connus

1. `#754` : un seul rendu à l'ouverture (`_activerSousSectionProfil`, crochet de `navigation.js`, zone protégée non modifiée). Le bouton « Liste des étudiant·es » **appelle** la navigation existante, il ne la modifie pas. `profil-754-un-seul-rendu.spec.js` doit rester vert.
2. La section mémorisée (`sectionProfilActive`) suit l'élève quand on change d'élève : inchangé. L'onglet interne de Développement (`profilOngletDeveloppementActif`) aussi.
3. Les sous-onglets de Développement des habiletés (Critères, Forces et défis, Gestes cognitifs) gardent leur style souligné : un niveau sous les boutons de la rangée.
4. Le rapport garde le texte tapé (#754) ; les vignettes des travaux se chargent comme avant.
5. iPad : 820 et 1180 px ; 44 px au doigt ; sous 760 px, ‹ menu › prend sa ligne entière ; les boutons de section passent à la ligne, sans défilement horizontal.
6. Sécurité : règles 1 et 2 (noms, programme, statut par `echapperHtml` ; aucun gestionnaire en ligne).
7. **Stock** : de l'affichage, aucune donnée ne change.

## 5. Preuve exigée

- Playwright (WebKit) : plus de barre latérale dans le profil ; la rangée (ordre, 44 px, compte, étiquettes) ; le menu ouvre l'élève choisi ; ‹ et › changent d'élève et se désactivent aux bouts ; chaque bouton de section ouvre sa section et seul lui est plein, **y compris après `changerSectionProfil('mobilisation')` appelé par programme** ; la section reste la même quand on change d'élève ; Jugement n'apparaît qu'avec une pratique par dénotation ; « Liste des étudiant·es » mène à la liste ; en anonymisation, aucun DA. Break-test d'au moins un de ces essais (le marquage programmatique est le bon candidat).
- Les bancs qui lisent l'ancienne barre (`profil-etudiant-rendu`, `profil-745-eleve-exclu`, `sentinelle-lot-E-745-eleve-exclu`, et les autres que ton `grep` trouvera) : recalés sur la rangée, pas affaiblis. Dis lesquels.
- Captures du profil (Productions, puis Développement des habiletés) à 1440, 1180 et 820 px, jointes à la demande de relecture.
- Portes terrain : skill `portes-terrain`, comme aux lots 1 et 2.

## 6. Ce qui n'entre pas

Le contenu des sections, les chaînes d'étapes (lot 3), le critère algorithmique (lot 4), l'Animation et sa barre latérale, la Liste des étudiant·es elle-même.

## 7. Clôture

- La fiche cochée dans le même commit que le code.
- Demande de relecture : `DEMANDE-RELECTURE-2026-10-24-profil-individuel-rangee.md`.
- Pas de release, de verdict ni de push sans le signal de Grégoire.
