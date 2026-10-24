# Demande de relecture – le Cadre : la rangée de sélection en tête des six accordéons (lot 2, #1148)

> Claude Code, samedi 24 octobre 2026 (Toronto). Pour Cowork (`PROTOCOLE.md`). Consigne exécutée : `CONSIGNE-LOT-2026-10-24-bibliotheques-menu-cadre.md` ; plan `PLAN-2026-10-24-bibliotheques-chaines-critere-algo.md`, lot 2.
> En ligne : la **1.217.0** (`973ad366`, verdict complet vert, poussée à 16 h 06). Sur `main`, **non poussés** : `078eab16` (tes documents, seuls, § 0), `28f379d5` (le relais), puis le lot. Pas de release, ni verdict complet, ni push (consigne § 7).

## 0. Ce que la mesure a contredit ou précisé (consigne § 2)

| Décision de Cowork | Mesuré | Ce que j'ai fait |
|---|---|---|
| § 2.1 : `MenuSelection` là où le menu ouvre une fiche sans autre effet | Aucun des six n'est « sans autre effet » une fois les lecteurs comptés : la valeur de `v2-selectEnseignant` est lue par `cc-license.js` (l. 67) et `export-pdf.js` (l. 202) comme profil courant ; l'option vide de `v2-selectCours` et de `v2-selectEnseignant` est réécrite par `appliquerMotsNatureCadre` (orchestre) ; `v2-selectCours` met « (actif) » et sélectionne le cours actif à chaque rechargement ; `v2-selectGroupeCours` passe par `quitterCreationSiConfirme`. `MenuSelection` remplace l'option vide par « Aucune … ouverte », non choisissable : la valeur `''` lue ailleurs changerait de sens. | **Les six gardent leur menu, son remplissage et son gestionnaire.** Ils prennent la place et l'apparence de la rangée (`rangee-selection-menu`). Pour chacun : Trimestre (active) et Groupe (filtre) : menu gardé, libellé visible ; Cours, Enseignant·e, Horaire, Groupe-cours (ouvrent la fiche) : menu gardé, libellé au lecteur d'écran. |
| § 2.1 : `#v2-selectGroupeCours` « à mesurer » | `choisirGroupeCoursV2` → `changerGroupeCoursSelectionneV2` → `editerGroupeCoursV2` : ouvre la fiche, **n'active pas** (l'activation a son bouton dans la fiche). | Rangé avec ceux qui ouvrent une fiche : libellé au lecteur d'écran. |
| § 2.3 : les cartes résumé | Trimestre : semaines, jours de cours, congés — la fiche ne les dit pas (les « anciens spans » sont masqués). Cours : nom, code, discipline, compétence, « actif » — la fiche montre les quatre champs, le menu dit déjà « (actif) ». Profil : nom, courriel, établissement — dans la fiche. Élèves : effectifs, groupes, SA, programmes — pas dans la liste. Horaire : la carte **ne paraissait que sans fiche ouverte** (`editerHoraireV2` la masquait, « évite redondance – Beta 95.2 ») et disait alors « Aucun horaire sélectionné ». Groupe-cours : « Complet » ou « n/5 configurés » (#475) et « Groupe-cours actif » — la fiche ne les dit pas. | **Partent** : Cours, Profil, Horaire (et leur code). **Restent, sous la rangée, en bande** : Trimestre, Élèves, Groupe-cours. Celle du groupe-cours se tait sans fiche ouverte (elle ne dirait que « Aucun groupe-cours sélectionné », que la fiche dit déjà ; règle CSS `:has`, aucun JS). |
| § 2.7 : la Carte d'alignement, « son couple bouton + menu » | Dans `index.html`, `#planif-selecteur-cartes` contient le bouton, le menu **et** « Actions ▾ », « Annuler », « Rétablir ». | La bande bleu pâle entoure donc les cinq. Bouton et menu à 44 px partout (le menu ne l'était qu'au doigt) ; « Actions ▾ », « Annuler », « Rétablir » gardent leurs 28 px au Mac. **À trancher si tu voulais la bande sur le couple seul** : un `div` de plus autour des deux. |

## 1. Le lot

- **`index.html`** : les six `disposition-bibliotheque-formulaire` / `panneau-bibliotheque` deviennent une `.rangee-selection` en tête de l'accordéon, puis (selon le cas) la bande du résumé ou le texte d'aide, puis la fiche (`.panneau-formulaire`) sur toute la largeur. « Bibliothèque » avec icône devient « Consulter la bibliothèque » (bouton principal, sans icône) pour Trimestre, Cours, Groupe-cours. « + Nouveau … » garde ses mots et sa classe de bouton (secondaire pour le profil et le groupe, comme avant). Le texte d'aide du profil et l'« Info » du groupe-cours passent sous la rangée (§ 2.5).
- **Élèves** (§ 2.4) : « Exporter CSV », « Supprimer un groupe… », « Vider la liste » vont en tête de la liste, à droite. Mêmes identifiants, mêmes `data-action`, mêmes confirmations.
- **Mots** (§ 2.6) : « Gère les groupes-cours affichés dans le menu de l'en-tête. » Le `grep` des « Gérez » et « barre latérale » dans les trois bibliothèques du Cadre ne trouve rien d'autre (Trimestre et Cours tutoyaient déjà).
- **CSS** : `.rangee-selection-libelle`, `.rangee-selection-resume`, `.rangee-selection-aide` rejoignent les règles du lot 1. Une règle propre au Cadre : `#calendrier-trimestre select` (1,0,1) posait `padding: 6px 10px` au menu, le texte passait sous le chevron ; `#calendrier-trimestre .rangee-selection select.rangee-selection-menu` le rétablit. Les résumés des élèves et du groupe-cours passent de la colonne (chiffre de 2 rem centré, filets) à une ligne.
- **La rangée de séance de l'horaire** (#888) : voir § 3, piège 5.
- **`design-system.html`**, section 23 : le spécimen de la colonne devient celui de la rangée du Cadre (deux modes).

## 2. Ce qui est parti (un `grep` avant chaque retrait)

- `index.html` : les six colonnes de gauche ; l'aperçu du cours (`v2-apercuCoursSidebar`), la carte du profil (`enseignant-carte-resume`), la carte de l'horaire (`v2-carteResumeHoraire`).
- JS : `afficherSyntheseCours`, `afficherSyntheseEnseignant`, `mettreAJourCarteEnseignant` (et ses quatre appels), `mettreAJourCarteResumeHoraireV2` (et ses sept appels, et les bascules de la carte dans trois fonctions). Le bloc « synthèses sidebar » de `trimestre-v2-cours.js` part en entier : `afficherSyntheseHoraire`, `afficherSyntheseGroupeCours`, `afficherSyntheseGroupeEtudiants` n'avaient **aucun appelant** (seulement leur export `window`) et doublaient les écrivains vivants des mêmes cartes. Le mot `aucunObjet` de `mots-nature.js` (la synthèse vide du cours) n'a plus de lecteur : parti.
- CSS : 33 règles (la disposition, le panneau, `.btn-bibliotheque`, `.libelle-selection`, la carte du profil, la carte de l'horaire, les marges de `.btn-nouvelle-entite` et `.btn-block`, sans plus aucun usage, les deux `@media` d'empilement de la colonne).
- Le banc `sentinelle-position-bouton-nouvelle-entite` (la place du bouton DANS la colonne, 16 sept.) est remplacé par `sentinelle-rangee-selection-cadre-1148` (renommé, même historique).

## 3. Les pièges de la consigne (§ 4)

1. **Changer de trimestre** : le menu garde `changerTrimestreActifV2` et ce qu'il recharge. Éprouvé : choisir un autre trimestre l'active (`trimestreActif` lu en base) et l'interface se recharge.
2. Les six identifiants n'ont pas changé.
3. `.disposition-bibliotheque-formulaire` et `.panneau-bibliotheque` : plus aucun usage, retirés au HTML et au CSS.
4. Le menu de l'en-tête (groupe-cours) n'est pas touché.
5. **iPad** : 44 px, menus natifs. **Une régression trouvée par les bancs et corrigée** : à 820 px, la rangée de séance de l'horaire (#888) débordait. La grille de l'ancienne colonne laissait la fiche déborder de l'accordéon jusqu'à la largeur minimale de la rangée (721 px pour 695, mesuré). Le seuil « deux colonnes sous 720 px d'écran » ne tenait que par ce débordement. La bascule suit maintenant la largeur de la **fiche** (requête de conteneur, comme `gabarit-algo` et `dissection`) : une ligne au-dessus de 653 px (mesuré), deux en dessous. **Conséquence visible** : en iPad portrait, chaque séance tient sur deux lignes au lieu d'une ligne qui dépassait. Break-test fait (sans la requête : rouge à 820 px).
6. **Sécurité** : règles 1 et 2, rien de neuf interpolé. Et une trouvaille corrigée, voir § 6.
7. **Stock** : de l'affichage, aucune donnée ne change.

## 4. Preuves

- **Vitest** : 9 594 sur 9 594, 813 fichiers. `sentinelle-rangee-selection-cadre-1148.test.js` (18 essais) : la rangée et son ordre dans chacun des six, la colonne partie (HTML et CSS), le libellé selon ce que fait le menu, les trois cartes et leurs écrivains partis (témoin : les écrivains qui restent), les actions des élèves, la place du chevron, le sous-titre. Recalés : #467, #540, #567 et #679 (cliquets qui descendent), complexité (450 → 449 : `afficherSyntheseGroupeCours`), #842, la nature des étiquettes, le profil (lot E2, #474, #1075), le menu « Vue » de la carte.
- **Playwright (WebKit)** : `bibliotheques-menu-cadre-1148.spec.js`, 15 essais. La rangée des six (ordre, à droite, pleine largeur, 44 px, chevron) ; le trimestre s'active ; le groupe filtre, aller et retour (11 → 10 avec un élève fictif d'un autre groupe) ; « + Nouveau groupe » crée et choisit ; les actions au-dessus de la liste ; pour Cours, Profil, Horaire, Groupe-cours : choisir ouvre la fiche, « + Nouveau … » ouvre la création ; le résumé du groupe-cours sous la rangée, muet sans fiche ; un programme `<img …>` lu en texte ; la Carte d'alignement (bande, 44 px, gras, chevron, « Actions ▾ » s'ouvre).
- **Recalés** : `trimestre-v2-rendu` lit maintenant la fiche de l'horaire (jours, heures, local), pas la carte ; `portes-relais-cadre` #371 amène le champ dans la vue avant de mesurer ce qui le recouvre (la rangée et le résumé l'ont fait descendre sous les 956 px de la fenêtre ; `elementFromPoint` rendait « rien »).
- **Le périmètre** (24 specs : Cadre, Carte, trimestres, horaires, lot 1) : 114 sur 114, `--retries=0`.
- **Break-tests** : l'échappement du programme retiré → rouge ; la règle du chevron retirée → rouge (Playwright et Vitest) ; la requête de conteneur retirée → #888 rouge à 820 px.
- **Non fait** : le verdict complet, ni GitHub (Linux). Réservés au signal de Grégoire.
- **Captures** : `plans de travail/captures-2026-10-24-bibliotheques-menu-cadre/` — Trimestre (Cours et Élèves ouverts) à 1440, 1180, 820 px ; Carte d'alignement à 1440. Mode clair seulement.

## 5. Portes terrain

`PORTES-TERRAIN-2026-10-24-bibliotheques-menu-cadre.md` : **aucune porte due** (règle 2 : de l'affichage, aucune donnée). Ses angles morts y sont dits. Cowork : rien à publier, sauf si tu juges autrement.

## 6. Trouvailles (trois issues)

- **Corriger maintenant** : le nom de programme d'un élève, venu de l'import CSV, entrait **sans `echapperHtml`** dans le résumé des élèves (`trimestre-v2-etudiants.js`, le « top programmes »). Règle de sécurité 1, et c'est le résumé que ce lot remonte en tête de l'accordéon. Échappé ; l'essai « Règle 5 » le prouve (break-test fait).
- **Inscrire et continuer** : les actions de la liste des élèves (« Exporter CSV », « Vider la liste ») restent **cachées** quand la liste passe de zéro élève à des élèves sans recharger la page (après un premier import, par exemple). Le rendu à zéro pose `style="display: none"` (`toggleDisplay`, l. 331) ; le rendu suivant ne retire que la classe `u-hide` (l. 338). Antérieur au lot (le banc recharge la page pour l'éviter). **Non inscrit au BACKLOG** : aucun symptôme vécu par Grégoire à ma connaissance ; à lui de dire s'il l'a vu.
