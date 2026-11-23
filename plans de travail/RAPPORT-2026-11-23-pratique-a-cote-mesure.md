# Rapport — une seconde pratique menée à côté de l'officielle (23 nov. 2026) : la mesure

**Branche** : `lot/pratique-a-cote-mesure`, partie de `origin/main` à `4d1043cce`. Arbre : `../labo-codex-pratique-a-cote`.
**Lecture seule** : aucun fichier de `js/` n'est touché, aucun test n'a été lancé (une autre session faisait tourner Playwright), rien n'a été joué dans un navigateur. Tout ce qui suit est **lu**, sauf mention contraire.

## En tête : ce que la mesure change au besoin

1. **Le troisième geste voulu existe déjà en grande partie.** Le Comparateur, avec la source « Mon groupe actif (données réelles) », montre des élèves réels, la pratique officielle et n'importe quelle pratique de la bibliothèque côte à côte, avec la décomposition dans la fiche. Deux limites : les douze premiers élèves seulement, et aucune entrée depuis le tableau ou le profil.
2. **Ce qui manque vraiment est une porte.** Le tableau des cibles, « Observer » et l'écriture d'une case ne lisent pas le pointeur du groupe : ils travaillent sur le contexte qu'on leur passe. Seule leur porte d'entrée exige que la pratique soit la pratique désignée.
3. **La voie du second trimestre est fermée telle que décrite** : un trimestre s'identifie par sa session et son année, et un second « Automne 2026 » est refusé.
4. **« À l'essai » est déjà un mot d'écran**, avec un autre sens : il marque toute la famille « Par standards ».

## 1. Qui lit « la pratique désignée » pour ouvrir un écran

Le groupe désigne sa pratique par `groupesCours[].pratiqueId` (`js/modes.js:1927-1946`), écrit par `changerPratiqueActive` (`js/pratiques/pratique-manager.js:64-85`) et par la fiche du groupe-cours (`js/trimestre-v2-groupes-cours.js:880`). Toute lecture passe par `designerPratiqueActive` (`js/pratiques/pratique-registre.js:492-509`).

| Écran | La porte | Le contenu |
|---|---|---|
| Tableau des cibles | Pratique désignée : `_contexteDeBase` puis `_contexteDesCibles` (`js/tableau-notation.js:119`, `:141-144`) | Un contexte seulement : `completerContexte(base)` lit `base.donnees.configuration` (`js/tableau-cibles.js:171-175`) |
| « Observer » | Bouton du tableau (`js/tableau-cibles.js:245`, `:410`) | Un contexte seulement (`js/observation-cibles.js:246-247`) ; les absents viennent des présences du cours actif (`:236-239`) |
| Écrire une case | Fenêtre du tableau | `ensembleId` pris au contexte (`js/tableau-cibles.js:720`) ; aucun pointeur lu |
| Redessiner après écriture | **Pratique désignée** : `_rerendre` repasse par `TableauNotation` (`js/tableau-cibles.js:430-433`, `js/tableau-notation.js:594`) | — |
| Profil, section « Cibles » | Pratique désignée (`js/profil-cibles.js:58-66`, `:160`) | Contexte bâti sur la désignation (`:163-164`) |
| Vue simple | Pratique désignée, par la présentation (`js/tableau-notation.js:142`) et la pratique du groupe (`js/vue-simple.js:1059-1062`, `:1184-1187`) | Même tableau, allégé |
| « Note finale » de la vue simple | Idem | `notesDuGroupe(base)` (`js/tableau-cibles.js:824`) |
| Fiche d'une production, « cibles renseignées » | Pratique désignée (`js/pratiques/ensembles-cibles.js:242-248`, `js/productions.js:1666`) | — |
| Relevé par cible | **Absent de `main`** : `lot/moteur-cibles-5-releve` n'est pas fusionnée | Non mesuré |

Constat : le calcul (`NoteCibles.lireEleve`, `js/pratiques/note-cibles.js:310-331`) et les écrans dépendent d'un ensemble de cibles et d'une configuration, pas du pointeur. Les portes, elles, dépendent toutes du pointeur.

## 2. Le minimum pour porter une seconde pratique

Il faut un lien groupe → pratique de plus, une porte qui bâtit le contexte sur cette pratique, et un redessin qui garde ce contexte (aujourd'hui il retombe sur l'officielle, ligne 430).

**Où ranger le lien — trois emplacements comparés.**

| Emplacement | Fusion de deux codex | Voyage, import | Coût |
|---|---|---|---|
| A. Un champ de plus sur le groupe-cours | `groupesCours` est une liste à `id` : un groupe différent des deux côtés devient un conflit montré, tranché objet entier (`js/codex.js:2319`, `:2472-2476`) | Le champ ne quitte pas le trimestre ; la fiche du groupe le garde (`...groupesCours[index]`, `js/trimestre-v2-groupes-cours.js:872-873`) | Le plus petit |
| B. Un champ sur la pratique | Conflit sur la pratique | **Fuit** : `configuration` est copiée brute à l'import et au partage (`js/import-export.js:1236`) | Écarté |
| C. Une clé neuve par trimestre | Union sans conflit | Rien ne voyage | Six registres à tenir (`js/db.js:2295`, `js/trimestres.js:208`, `js/reserve.js:103`, `js/demo-namespace.js:204`, `js/vue-simple-donnees.js:195`, `js/codex.js:2621`) et `docs/DATA-OWNERSHIP.md` |

Je retiendrais A, en assumant la question posée à la fusion. Supposé : le champ n'a pas à entrer dans les miroirs `infoCours` et `groupeCoursActif` (`js/entites/groupe-cours.js:217`).

Ce que le reste en ferait : l'export du codex emporte tout tel quel ; le voyage d'une pratique n'emporte jamais d'inscription (`js/pratiques/ensembles-cibles.js:264`) ; l'archive d'un groupe emporte les inscriptions de ses élèves (`js/reserve.js:101-103`). **Non lu** : comment la Réserve recopie l'objet groupe-cours.

Trois angles morts qu'un lien neuf ouvre, parce que tout compte aujourd'hui par `pratiqueId` seul :
- la suppression n'est refusée que pour la pratique désignée (`js/pratiques/pratique-manager.js:233-239`) ;
- « modèles réellement utilisés » ignore la seconde pratique (`js/trimestres.js:815-818`) ; sans effet d'écriture depuis #622 ;
- la définition « en usage » du 21 nov. (au moins un groupe la désigne) ne la couvrirait pas.

## 3. Ce qui ne doit jamais bouger

La chaîne officielle ne lit que la désignation : indices C et P (`js/pratiques/pratique-manager.js:98`), export des résultats (`js/export-resultats-finaux.js:139-142`), dépistage (`js/indices.js:477`, `:528-544`), affichage de la note sur le PDF d'une copie (`js/travaux-export-pdf.js:998`). `inscriptionsCibles` n'entre dans une note que par l'instance de la pratique désignée (`js/pratiques/pratique-configurable.js:530`). Tant que le pointeur ne bouge pas, rien de cela ne bouge.

Les endroits où une pratique à l'essai pourrait fuir :

| # | Endroit | Vers qui | Lu à |
|---|---|---|---|
| 1 | Basculer le pointeur « le temps de regarder » : recalcule C et P, donc le dépistage et l'export | Élève et export | `js/pratiques/pratique-manager.js:78-99` |
| 2 | Le bouton d'export posé dans le tableau des cibles (vue simple) : sous une pratique à l'essai, il exporterait l'officielle sans le dire | Export | `js/tableau-cibles.js:246` |
| 3 | « Cibles que cette production renseigne » : étendu à la seconde pratique, il écrit sur les vraies productions | Données | `js/productions.js:1663-1680` |
| 4 | La zone de texte d'une inscription s'appelle « rétroaction » dans le code. Aucun PDF ni export ne la lit aujourd'hui (`noteBreve` : cinq fichiers, tous des écrans de cibles) | Élève, si un lot futur l'imprime | `js/pratiques/inscriptions-cibles.js:24` |
| 5 | Le CSV du Comparateur : notes des deux pratiques, par élève | Fichier de l'enseignant | `js/comparateur-pratiques.js:1178-1201` |
| 6 | Une section de plus au profil : le profil est l'écran le plus proche de l'élève. **Non lu** : ce que `js/profil-etudiant-rapport.js` imprime des sections | Élève | `js/profil-etudiant-sections-affichage.js:2316`, `:2346` |
| 7 | « Notes finalisées » vit dans la pratique, pas dans le groupe : la cocher à l'essai ne touche pas l'officielle | Aucune fuite | `js/pratiques/note-cibles.js:320` |

## 4. Le Comparateur aujourd'hui

Les deux. Source d'office : des profils-types générés depuis l'échelle (`js/comparateur-pratiques.js:95-103`). Source au choix : les élèves du groupe actif (`:345-357`, sélecteur `:1140-1152`). La note vient de `simulerIndices`, en lecture seule, sans toucher au pointeur (`js/portfolio.js:521-539`) ; une pratique par cibles y rend son récit, une ligne par cible (`js/pratiques/pratique-configurable.js:559`), affiché dans la fiche (`js/comparateur-pratiques.js:1017-1062`). La première colonne d'office est la pratique désignée (`:300-313`).

Ce qu'il faudrait pour un élève réel précis :
- lever ou remplacer la limite des douze premiers (`:351`) ;
- une entrée directe (depuis le tableau des cibles ou un nom d'élève) qui ouvre la fiche avec les deux bonnes colonnes ;
- vérifier, en le jouant, que la colonne officielle rend le même nombre que le profil (la parité est promise au commentaire de `js/portfolio.js:512-513`, **non jouée ici**) ; la note y est arrondie à l'entier.

Sans inscription sous la seconde pratique, sa colonne dira « non constructible » ou l'attente : le Comparateur ne sert qu'une fois la porte du § 1 ouverte.

## 5. Le recoupement : un chantier, ou trois ?

| Document | Ce qui reste vrai dans le code |
|---|---|
| `SPEC_simulation_pratiques_307.md` (juin) | `simulerIndices`, éphémère et exportable, trois colonnes au plus (`js/comparateur-pratiques.js:313`). La forme « panneau dans le profil » est close ; le Comparateur l'a remplacée |
| `RAPPORT-2026-11-21-pratique-en-usage.md` (branche non fusionnée) | Environ vingt-cinq voies d'écriture sans point commun ; rien n'est bâti. Sa définition « en usage » repose sur `pratiqueId` seul |
| « Une pratique à venir que tu prépares à côté » | La phrase exacte n'est dans aucun fichier du dépôt ; l'idée est le second volet du mandat de `pratique-en-usage` |

Ma lecture (une inférence, pas un fait) : **deux chantiers, qui partagent une notion**. Le premier est « quels groupes une pratique sert, et à quel titre » : l'officielle, l'essai, et la pratique préparée (un essai sans inscription). Le second est le verrou des vingt-cinq voies, qui reste entier. Les mener séparément ferait écrire deux définitions de « en usage ».

## 6. La voie de rechange : un second trimestre

Le geste : Réglages › Trimestre, choisir session et année, « Créer le trimestre » (`index.html:6396`, `js/trimestre-v2-init.js:360`). L'identifiant est `session + année` (`:279`) ; « Automne 2026 » existe, donc **refus** (`:373-375`). Il faudrait un faux trimestre (« Été 2026 », « Automne 2027 »), puis recréer le cours et le groupe, recoller la liste, importer la pratique d'un trimestre à l'autre (`js/pratiques-gestion.js:711`). Le passage de l'un à l'autre : le menu des trimestres, qui recharge toute l'interface (`js/trimestre-v2-liste.js:366-392`). **Non vu sur iPad.**

| | Second trimestre | Seconde pratique à côté |
|---|---|---|
| Code à écrire | Aucun | Lots 1 et 2 |
| Étanchéité | Totale (autre espace de noms) | À garantir, § 3 |
| Côte à côte | Impossible : le Comparateur lit un trimestre | Oui |
| « Absent aujourd'hui » dans Observer | Faux : pas de présences dans ce trimestre | Juste |
| Élèves | Dédoublés ; un faux nom de trimestre | Les mêmes |
| Risque d'usage | Saisir dans le mauvais trimestre | Confondre les deux tableaux |

## Ce qui contredit le relais

1. Le Comparateur ne fait pas que « lire une pratique de type cibles » : il compare déjà des élèves réels (§ 4).
2. Le second trimestre « avec la même liste collée » ne peut pas porter la même session et la même année (§ 6).
3. « À l'essai » est pris : une seule constante affiche ce mot sur toute la famille « Par standards » (`js/pratiques/ensembles-cibles.js:496-512`, `js/observation-cibles.js:131`).
4. Le « relevé par cible » n'est pas dans `main`.

Confirmé : deux stocks distincts, rangés par `da` et `ensembleId` (`js/pratiques/inscriptions-cibles.js:17`) ; `lireEleve` reçoit la configuration et ne lit ni les évaluations ni `indicesCP` (`js/pratiques/note-cibles.js:7-10`, `:310`) ; un DA déjà porté par une autre fiche du trimestre est refusé à la saisie (`js/trimestre-v2-etudiants.js:779-788`). **Non vérifié** : qu'un import de liste passe par la même garde.

## Proposition de lots

| Lot | Contenu | Ce que Grégoire essaie à la fin | Taille | Risques |
|---|---|---|---|---|
| 0 | Aucun code. Créer une pratique « Par standards » sans la désigner ; ouvrir le Comparateur sur le groupe réel | Les deux colonnes sur ses élèves ; la seconde dit l'attente | Nulle | Douze élèves seulement |
| 1 | Le lien (emplacement A), sa pose et son retrait ; une porte vers le tableau des cibles et « Observer » sur cette pratique ; le redessin qui garde le contexte ; le bouton d'export retiré de ce tableau ; une marque à l'écran | Inscrire des niveaux et observer, sous la seconde pratique ; la retirer, la reposer, tout retrouver | Moyenne : trois fichiers et leurs bancs | Le redessin (ligne 430) ; le conflit à la fusion ; deux tableaux qui se ressemblent |
| 2 | Comparateur : tous les élèves ou un choix d'élève ; ouverture directe sur officielle et seconde pratique | Un élève réel, deux notes, deux décompositions | Petite à moyenne | Parité avec le profil à prouver |
| 3 | « En usage » compte les deux liens ; refus de supprimer une pratique liée | Une suppression refusée, avec son motif | Petite, si jointe au lot 1 de `pratique-en-usage` | Deux définitions si menés à part |
| 4 | Une section au profil | Les deux notes dans le profil | Moyenne | Le plus proche de l'élève (§ 3, n° 6) ; je ne le ferais que sur demande |

Le retrait sans effacement ne demande aucun lot : le stock des inscriptions n'accepte que des ajouts (`js/pratiques/inscriptions-cibles.js:11-13`) ; retirer le lien les laisse entières.

## Questions

**À Grégoire (didactique, mots, élèves)**
1. Le mot de la seconde pratique, « à l'essai » ayant déjà un sens à l'écran.
2. Le profil est-il parfois montré ou imprimé pour l'élève ? Si oui, la seconde pratique en reste-t-elle absente ?
3. Le texte saisi avec un niveau, sous la seconde pratique : une note pour lui, ou un mot destiné à l'élève ?
4. Peut-il inscrire un niveau à partir d'une copie déjà notée officiellement ?
5. Si la seconde pratique devenait l'officielle en cours de trimestre, ses inscriptions compteraient d'office. Est-ce voulu ?

**À Cowork**
1. L'emplacement du lien (A ou C).
2. Où poser la porte : le tableau de notation, ou la fiche de la pratique.
3. Lot 2 : lever la limite, ou choisir l'élève.
4. Lot 3 : le joindre à `pratique-en-usage`, et dans quel ordre par rapport à `lot/moteur-cibles-5-releve`.

## Trouvaille en chemin

| Trouvaille | Statut | Disposition |
|---|---|---|
| La fiche du Comparateur affiche `da` brut en source réelle, alors que la liste affiche `daAffichage` (`js/comparateur-pratiques.js:1093` ; règle #1075 à `:348-355`) | Lu, non joué | Inscrire et continuer : à confirmer en anonymisation avant d'entrer au backlog |

## Lu, non lu

**Lu en entier** : `pratique-manager.js`, `note-cibles.js`. **Lu par passages ciblés** : `pratique-registre.js`, `inscriptions-cibles.js`, `ensembles-cibles.js`, `tableau-cibles.js`, `tableau-notation.js`, `observation-cibles.js`, `profil-cibles.js`, `comparateur-pratiques.js`, `portfolio.js` (`simulerIndices`), `pratique-configurable.js`, `codex.js` (fusion), `import-export.js` (schémas), `trimestres.js`, `trimestre-v2-init.js`, `trimestre-v2-liste.js`, `trimestre-v2-groupes-cours.js`, `export-resultats-finaux.js`, `indices.js`, la spec 307 (soixante premières lignes), le rapport `pratique-en-usage`.

**Non lu** : `vue-simple.js` au-delà de trois passages, `wizard-pratique-v2.js`, `pratiques-gestion.js` (suppression : début seulement), `reserve.js` (recopie du groupe-cours), `profil-etudiant-rapport.js`, `export-pdf.js`, `bilan-reflexif-rapport.js` (un `grep` n'y trouve aucune lecture de la pratique), `interventions.js`, `BACKLOG.md`, `RELAIS.md`, la branche `lot/moteur-cibles-5-releve`.

**Non joué, non vu** : aucun écran, aucun iPad, aucun test.
