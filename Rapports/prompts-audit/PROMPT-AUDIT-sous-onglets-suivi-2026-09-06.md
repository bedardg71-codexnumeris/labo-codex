---
serie : Revue des onglets par audit cadré
onglet : Suivi — les six sous-onglets, un par un (Suivi du groupe, Liste des étudiant·es, Saisie des présences, Profils individuels, Interventions, Animation)
destinataire : Claude Code (accès complet au dépôt, sur le Mac)
executant_des_correctifs : Claude Code, un lot à la fois, après arbitrage de Grégoire
type : audit de ce que chaque sous-onglet FAIT à l'écran et ÉCRIT en base — le complément du troisième audit cadré, qui a jugé la chaîne des indices
livrable_attendu : rapport de constats, chaque constat portant sa disposition proposée ; AUCUN correctif appliqué
rapport_a_produire : Rapports/AUDIT-sous-onglets-suivi-2026-09-XX.md (date du jour de l'exécution)
rapport_produit : Rapports/AUDIT-sous-onglets-suivi-2026-09-06.md (banc : tests/unit/audit-sous-onglets-suivi-2026-09-06.test.js, 34 mesures ; captures WebKit locales hors dépôt)
prerequis : Rapports/AUDIT-onglet-suivi-2026-09-05.md (déposé, lot #730-#734 livré en 1.123.0, #735-#754 inscrits) — la chaîne présences → indices → palier → écrans est JUGÉE ; ne la remesure pas
cadre_par : Cowork, 6 septembre 2026, 10 h 06, à la demande de Grégoire
statut : exécuté le 6 septembre 2026 (10 h 12 – 11 h 05, Claude Code sur le Mac, worktree sur 2fb1facf / 1.123.5) — six sous-onglets, trois axes chacun ; six « corriger maintenant » proposés (§0 du rapport), aucun correctif appliqué, rien au BACKLOG
---

# Audit — les six sous-onglets de Suivi : logique propre, affichage, qualité des sauvegardes

## Pourquoi, et pourquoi maintenant

Le 5 septembre, le troisième audit cadré a jugé ce que l'onglet Suivi **dit d'un élève** : la chaîne des indices, du dépistage, du palier, et ce qui en sort. Il a écarté explicitement le design (« sauf quand la mise en page cache ou déforme une information »), la prise de présences comme geste, et l'Animation (« hors chaîne »). Ses 42 mesures ont donné cinq correctifs et vingt fiches inscrites.

Ce qu'il n'a pas regardé, c'est **chaque sous-onglet comme un écran qu'un collègue ouvre le 14** : ce qu'il montre, ce qu'il permet de faire, et ce qu'il écrit quand on le fait. Grégoire a trouvé ce matin, sur ses propres données, quatre défauts de cette famille-là en deux heures (une vignette qui menait à une page vide, une pratique qui ne s'appliquait pas, un Cadre qui ne montrait pas ce qu'on venait de faire, un « Copier tout » incomplet) — aucun n'était dans la chaîne des indices, tous étaient à l'écran ou dans une écriture. Il y en a d'autres du même genre, et il vaut mieux que ce soit toi qui les trouves avant vingt personnes.

## La question directrice

**Pour chacun des six sous-onglets : ce que l'écran montre est-il ce que la base contient ; chaque geste offert fait-il ce que son libellé promet ; et ce qu'il écrit est-il complet, au bon endroit, relu à l'identique après rechargement, et impossible à perdre par un geste ordinaire ?**

Trois axes, dans cet ordre pour chaque sous-onglet :

1. **Logique propre** — pas la chaîne des indices (jugée), mais la mécanique de l'écran : filtres, tris, sélection, navigation vers les autres onglets, état conservé ou perdu au changement de groupe-cours ou de trimestre, boutons dont le libellé promet une chose. Chaque `data-action` de la sous-section est un geste : recense-les tous, et pour chacun dis ce qu'il fait réellement.
2. **Affichage** — ce que l'écran montre contre ce que la base contient, sur les données de banc : nombres, libellés, badges, couleurs qui portent un sens, états vides (aucun élève, aucune séance, aucune intervention, groupe sans pratique), textes tronqués ou débordants, et le rendu à **1024 × 768** (iPad Air) et à **1366 × 1024**. Pas de jugement esthétique ; un défaut d'affichage, c'est une information cachée, déformée, ou un libellé qui dit autre chose que le code.
3. **Qualité des sauvegardes** — pour **chaque écriture** de la sous-section (`db.setSync`, `db.set`, et tout `localStorage` direct) : ce qui la déclenche, la clé (nue ou namespacée par trimestre ?), la forme écrite, ce qui est relu après un rechargement complet, ce qui arrive si le geste est répété (idempotence), si deux gestes se suivent vite (le second écrase-t-il le premier ?), si l'on change de groupe-cours entre le geste et l'enregistrement, et si l'écriture échoue à mi-chemin. Compte d'entrée, mesuré le 6 à 10 h (`grep -c 'setSync(' js/<module>.js`) : `saisie-presences.js` 8, `interventions.js` 3, `boite-outils.js` 2, `trimestre-v2-etudiants.js` 1 + 1 `db.set(`, `tableau-bord-apercu.js` 1, `profil-etudiant-actions.js` 1, `profil-etudiant-confidentiel.js` 1, `etudiants.js` 0, `consolidation.js` 0. **Recompte, et cherche les écritures indirectes** (une fonction d'un autre module appelée depuis la sous-section, qui écrit) : le compte d'un `grep` littéral n'est pas le compte des écritures.

## Périmètre

Les sous-sections d'`index.html` (lignes mesurées le 6 à 10 h, à recompter) : `#suivi-groupe` (l. 7469), `#suivi-liste` (7709), `#suivi-saisie` (7912), `#suivi-profil` (8119), `#suivi-interventions` (8132), `#suivi-animation` (8148). Pars de leurs `data-action` et `id` pour retrouver les modules — le rapport du 5 les a identifiés une première fois :

  Suivi du groupe        js/tableau-bord-apercu.js      3 247   liste suivie (≤ 5), panneau, carte A-C-P-E, tri
  Liste des étudiant·es  js/etudiants.js                1 602   consultation, filtre RàI ; js/trimestre-v2-etudiants.js 1 019 (ajout, retrait, statut)
  Saisie des présences   js/saisie-presences.js         2 187   séances, congés, motifs, transfert de rattrapage
  Profils individuels    js/profil-etudiant-sections-affichage.js 4 795 · -actions.js 803 · -confidentiel.js 325 · -rapport.js 395 · graphiques-progression.js 4 773
  Interventions          js/interventions.js            1 558   planification, notes individuelles, bilan, clôture ; js/consolidation.js 769
  Animation              js/boite-outils.js             1 211   tirage au sort, questions — jamais audité

Frontières, pour la concordance seulement : `modes.js` (le mode anonymisation et ce qu'il laisse passer — #736 et #751 le disent déjà), `demo-activation.js` (les données de démonstration servent de banc d'affichage), `snapshots.js`.

## Hors périmètre — décisions explicites

- **La chaîne des indices** (A, C, P, IPB, patterns, palier, diagnostic croisé, cible) : jugée le 5. Si une mesure d'affichage te ramène à un nombre faux dans la chaîne, recoupe avec la fiche #735-#754 qui le porte et passe.
- **La pédagogie** : les seuils, la taxonomie, ce qu'un palier veut dire. Positions, pas défauts.
- **L'esthétique** : une couleur laide n'est pas un constat ; une couleur qui dit le contraire du nombre en est un.
- **Aucune donnée réelle.** Les élèves de banc et les données de démonstration seulement. Le volet confidentiel se teste avec des valeurs inventées. Tu ne lis ni A2025 ni H2026 ni l'automne en cours.

## Méthode attendue

**Un sous-onglet à la fois, les six dans l'ordre de la navigation**, et pour chacun les trois axes avant de passer au suivant : le rapport se lit onglet par onglet, c'est ainsi que Grégoire arbitrera.

**Logique et sauvegardes : en bac à sable Vitest**, patron des trois bancs d'audit (modules réels chargés dans un faux `window`, `db` de banc inspectable). Pour chaque écriture : déclenche le geste par sa fonction réelle, lis la clé et la valeur écrites, recharge (nouveau `window`, même `db`) et compare. Un verdict `[lecture]` se dit comme tel.

**Affichage : dans le vrai navigateur, en local seulement** (Playwright WebKit local, mode démonstration, les deux viewports) — **rien de poussé vers la CI** pour cette partie ; le quota est compté. Une capture par sous-onglet et par viewport, rangées hors du dépôt suivi (`_to_delete/captures-audit-suivi-2026-09-06/` ou `$HOME`), le rapport dit ce que chacune montre. Ce qui est mesurable au texte (un libellé, un nombre, un état vide) se mesure au texte (`get_page_text`, `textContent`), pas à l'œil.

**Recense avant de juger** : le tableau des `data-action` de chaque sous-section (geste → fonction → effet mesuré → écriture ou non) est la première chose du rapport pour chaque onglet. Un geste absent de ce tableau est un geste non audité.

**Reproduis avant de conclure**, et cherche la construction avant d'annoncer une absence : un `grep` littéral rend zéro sur un nom assemblé (`'data-on-' + eventType`, `main.js`). Devant un zéro, cherche l'assemblage.

Lis d'abord, et rien d'autre en entier :
  Rapports/AUDIT-onglet-suivi-2026-09-05.md — l'en-tête et le tableau des dispositions (ce qui est jugé, ce qui est inscrit)
  .claude/skills/labo-codex/SKILL.md (l'architecture des clés : nues, namespacées, par trimestre)
  .claude/skills/design-interface/SKILL.md (§ accessibilité et cibles tactiles iPad : c'est la norme de l'axe affichage)
  docs/DATA-OWNERSHIP.md · .claude/skills/securite-donnees/SKILL.md (§ données sensibles)
  .claude/skills/verification-adverse/SKILL.md (§4, le break-test)

⚠ `SESSION.md`, `BACKLOG.md`, `RELAIS.md` : en-tête, puis `grep`. Jamais un `Read` nu.

## Ce qu'il faut vérifier, sous-onglet par sous-onglet

### 1. Suivi du groupe
La liste des élèves suivis (au plus cinq) : ajout, retrait, ordre, ce qui la vide (#749 dit qu'elle vit sous une clé nue partagée entre trimestres — mesure ce que ça produit à l'écran quand on change de trimestre, sans rejuger la fiche). Le tri et ses boutons : chaque critère de tri trie-t-il sur la valeur affichée ? La carte A-C-P-E d'un groupe sans séance, sans évaluation, sans pratique. Le panneau : ce qu'il montre d'un élève cliqué, et où mène chaque lien.

### 2. Liste des étudiant·es
Le filtre RàI : chaque valeur du filtre contre le palier réellement affiché sur la ligne. Ajout d'un élève, retrait, changement de statut (`trimestre-v2-etudiants.js`) : ce qui est écrit, sous quelle clé, et ce que les autres sous-onglets en voient immédiatement (sans rechargement) et après rechargement. Un DA en double, un nom avec accent composé (NFD) ou apostrophe : affichage et tri. Les deux « moyenne A » (#750) : constate seulement.

### 3. Saisie des présences
C'est ici que les écritures sont les plus nombreuses (8 sites). Pour chacune : la séance, le congé, le motif, l'absence motivée RàI, le transfert de rattrapage (#747), la suppression d'une séance. Répète le même geste deux fois ; fais deux gestes à moins d'une seconde ; change de groupe-cours entre le clic et l'écriture ; recharge après chaque geste et compare. Les trois portes d'écriture hors du mode (#736) : constate, ne rejuge pas. L'affichage d'une grille de 30 élèves × 15 séances à 1024 px : lisible, ou coupée ?

### 4. Profils individuels
Le profil se rend trois fois à l'ouverture (#754) : mesure ce que ça coûte à l'écran (clignotement, zone de texte vidée) sans le corriger. Les gestes du profil qui écrivent (`profil-etudiant-actions.js`, une écriture ; le volet confidentiel, une écriture) : forme, clé, relecture, et ce que le mode anonymisation en laisse voir (#751 : constate). Le bouton « Rapport » (livré le 5, vu par Grégoire) : le texte généré recharge-t-il à l'identique ? Les graphiques : un élève sans donnée, un élève avec une seule évaluation, une échelle non convertible — courbe vide, zéro, ou courbe inventée ? Cinq mesures suffisent.

### 5. Interventions
Créer, modifier, ajouter une note individuelle, clôturer, supprimer : cinq gestes, trois écritures — lesquelles portent lesquels ? Une intervention sans groupe-cours (#746) : constate ce qu'elle montre. La note individuelle d'un élève qui a quitté le groupe (#748) : constate. Le bilan : ses lettres et seuils sont en clair (#742) — vérifie seulement que ce qu'il affiche correspond aux valeurs du code. La consolidation : lit-elle les mêmes interventions que la liste ?

### 6. Animation
Jamais audité. `boite-outils.js` lit `groupeEtudiants`, `infoCours` et son propre `etatTirage`, et écrit deux fois. Ce que c'est, d'abord : quels outils, quels gestes, ce qui est projeté en classe (ce que les élèves voient — signale tout nom, DA ou donnée qui apparaît à l'écran projeté). Le tirage au sort : équitable au sens du code (chaque élève tiré une fois avant qu'un le soit deux fois ?), ce qu'il fait d'un élève retiré du groupe entre deux tirages, et ce qu'il écrit (`etatTirage` : clé nue ou par groupe-cours ? survit-il au rechargement ? se vide-t-il au changement de groupe ?). Les questions : d'où elles viennent, où elles vont. Le rendu projeté à 1366 × 1024.

## Ce qui est déjà su — ne le redécouvre pas comme une trouvaille

- **Inscrits le 5 septembre, à trancher par Grégoire** : #735 (élève ajouté en cours de trimestre), #736 (portes d'écriture hors du mode), #737 (brouillon compté comme remis), #738 (« non remis » à 0), #739, #740, #741 (ce qui entre dans le dépistage), #742 (seuils en clair), #743 (A = 100 sans séance), #744 (deux paliers), #745 (élève hors indices), #746 (intervention sans groupe-cours), #747 (transfert de rattrapage), #748 (note individuelle d'un élève parti), #749 (liste suivie sous clé nue), #750 (deux « moyenne A »), #751 (anonymisation et volet confidentiel), #752 (I/D/M/E en dur dans les graphiques), #754 (triple rendu du profil). **Si tu les retrouves, recoupe et passe** ; ce qui est neuf, c'est ce qu'ils PRODUISENT à l'écran ou dans une écriture, si le rapport du 5 ne l'a pas dit.
- **Livrés ce matin, 1.123.2 à 1.123.5** : la vignette d'un travail dans le profil (#761), « Appliquer au cours actif » et le Cadre (#762, #763), « Copier tout » (#764). Ne les remesure pas ; si l'un régresse, c'est un constat MAJEUR.
- **Ouverts ailleurs** : #759 (collage sans sauts de ligne), #760 (bloc Observations), #551, #542, #677, #683, #539.
- Écrire dans les données de quelqu'un remonte à Grégoire ; tu mesures, tu ne proposes pas de script.

## Livrable

Un seul fichier, `Rapports/AUDIT-sous-onglets-suivi-2026-09-XX.md`, au format des trois premiers : en-tête mesuré (`git rev-parse --short HEAD`, `version.json`, Vitest re-roulé depuis `tests/`, périmètre recompté) ; puis **six sections, une par sous-onglet, dans l'ordre de la navigation**, chacune ouverte par son tableau des gestes (`data-action` → fonction → effet mesuré → écriture) puis ses constats par axe (logique / affichage / sauvegardes) et par gravité, avec le `grep` qui les retrouve, le verdict `[exécuté]`, `[navigateur]` (mesuré dans WebKit local, capture nommée) ou `[lecture]`, l'attendu et l'obtenu, **ce que l'enseignant voit ou perd** en une phrase de français, et la disposition proposée (corriger maintenant / inscrire / commenter). En tête, un tableau récapitulatif : les « corriger maintenant » de tout le rapport, avec pour chacun la phrase que Grégoire lira pour arbitrer. Le banc : `tests/unit/audit-sous-onglets-suivi-2026-09-XX.test.js`, un `describe` par sous-onglet.

## Fini quand

Chaque sous-onglet a son tableau des gestes complet (aucun `data-action` de sa sous-section absent) ; chaque écriture recensée a été déclenchée, relue après rechargement et répétée, avec le résultat écrit ; chaque sous-onglet a au moins une capture par viewport et son état vide mesuré ; l'Animation est décrite en entier, avec la liste de ce qui est projeté ; aucun correctif n'est appliqué (`git status -- js/` propre, empreintes identiques après les break-tests du banc) ; le tableau des « corriger maintenant » tient en une page.
