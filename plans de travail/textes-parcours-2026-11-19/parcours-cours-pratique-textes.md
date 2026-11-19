# Parcours « Monter ton cours », « Nous faisons » (Pratique guidée) : bulles réécrites avec Grégoire (19 nov. 2026)

Ouvert le 19 nov. 2026 à 13 h 49 par la séance de Cowork ouverte à 12 h 09 (celle qui a écrit le parcours 6 de 12 h 15 à 12 h 25). Choisi par Cowork à 13 h 44, accepté par Grégoire à 13 h 45 (« Ok ») : le plus court des parcours qui restent (sept bulles, contre onze pour la notation alternative et douze pour « Automatiser tes commentaires ») ; textes du 8 nov. (10 h 25 à 10 h 49), corrigés le 9 nov. (10 h 01 à 10 h 04), déjà validés ; il ne touche ni à la grille ni à l'échelle, donc pas aux descripteurs ; c'est le plus didactique (la carte d'alignement). Laissé de côté : « Évaluer une première production » (en pause pour les descripteurs). Même moule que `claude/parcours-donnees-pratique-textes.md` (parcours 6), `claude/parcours-recevoir-pratique-textes.md` (parcours 4) et `claude/parcours-classe-pratique-textes.md` (parcours 2).

**Retouche du 19 nov., 15 h 34 (conversation du Projet ouverte à 15 h 19)** : à la bulle 4, « tes évaluations devront l'exiger » devient « tes évaluations devront le vérifier » (retouche de Grégoire à 15 h 32, faite dans la bulle 4 du « Je regarde » de ce parcours, `claude/parcours-cours-modele-textes.md` ; portée ici sur la recommandation de Cowork, pour que les deux temps disent la même chose ; Grégoire, 15 h 34 : le relais n'était pas encore parti). Portée dans la bulle 4 ci-dessous ET dans le texte du relais. **Retouche du 19 nov., 15 h 53**, même chemin : à la bulle 6, « ton plan de cours l'écrira » devient « ton plan de cours le précisera » (retouche de Grégoire dans la bulle 6 du « Je regarde »), dans la bulle ET dans le relais.

**Base.** Les sept étapes telles qu'elles sont dans le code (`js/parcours-cours.js`, `ETAPES`, lues sur `origin/claude/ecstatic-brown-urn6v8` = `ebc9a9ad` le 19 nov. à 13 h 46) : Ta compétence ; Ton idée maîtresse ; Ta leçon ; Ton objectif ; Ton activité ; Ton évaluation (avec sa variante « ⚠ », `TEXTE_6_APRES`) ; Raffiner, si tu veux. Textes en paragraphes (`texte`, `geste`). La ligne du panneau (« De la compétence à ta production : un outil facultatif qui garde pour toi les liens entre ce que tu enseignes et ce que tu évalues. ») et le refus (`REFUS`) ne changent pas. Consigne d'origine : `plans de travail/CONSIGNE-LOT-2026-11-08-parcours-5-monter-ton-cours.md` ; la sentinelle `tests/unit/sentinelle-parcours-cours-2026-11-09.test.js` confronte les textes à cette consigne (à repointer au relais). Ce parcours n'a pas de « Je regarde » écrit (matériel choisi : une chaîne tirée de la carte de Grégoire), d'où ni « Cette fois… » (comme au parcours 6). `lancer()` referme déjà la démo (`desactiverModeDemo`). (↻ 19 nov., 15 h 23 : son « Je regarde » s'écrit maintenant, `claude/parcours-cours-modele-textes.md`.)

**Forme (celle des parcours 2, 4 et 6).** La confirmation « C'est fait : … » au-dessus du titre, en petit, à partir de la bulle 2 ; l'objectif à la première bulle, rappelé comme atteint à la dernière ; la phrase du lieu quand la page change (seulement à la bulle 1 : toutes les étapes se jouent sur la carte) ; les explications sans marque ; seuls les gestes marqués, d'une flèche (→) à faire, d'un crochet une fois faits ; une explication ne s'écrit pas à l'impératif (elle aurait l'air d'un geste). Dans ce document, les bulles sont montrées à leur ouverture : tous leurs gestes portent la flèche. Pas de « Remplir » ; aucune donnée inventée ; aucun produit commercial nommé.

Noms lus dans le code : l'onglet « Alignement » de « Conception » (`js/config.js` l. 57, sous-section `conception-carte`, titre de page « Carte d'alignement ») ; la palette « Nœuds » (`index.html` l. 4343) ; l'« Inspecteur » ; la palette « Planificateur » ; la frise ; « Actions » ; « Consulter la bibliothèque ».

## Bulle 1 (validée par Grégoire le 19 nov. à 13 h 49 : « C'est bon »)

**Ta compétence** · 1 sur 7

À la fin de ce parcours, tu seras en mesure d'aligner une première chaîne de ton cours, de sa compétence jusqu'à ta production.

Tu es dans « Conception », à l'onglet « Alignement » : c'est là que tu construis ta carte d'alignement.

La carte d'alignement n'est pas une tâche de plus : c'est un outil pour monter ton cours, et tu peux utiliser l'application sans elle.
Elle montre comment tes leçons et tes productions mènent à la compétence de ton cours, et donc sur quoi repose la note que tu construis.
Elle garde ces liens pour toi et signale ceux qui manquent : tu n'as plus à tout tenir en tête.
Son principe : tu évalues ce que tu enseignes, et tu enseignes ce que tu évalues, au même niveau d'exigence.
Tout part de la compétence que ton cours doit développer : le reste de ta carte s'y rattachera.

Aie sous la main le devis ministériel de ton cours.
→ Touche « Compétence » dans la palette « Nœuds »
→ **Écris son énoncé, tel que le devis décrit la compétence et ses éléments**

(Puis la phrase de la poignée, posée par le moteur.)

Notation pour le relais : objectif (posé par le moteur depuis la définition, `objectif` sur `DEF`) ; [L] `lieuSuite: ": c'est là que tu construis ta carte d'alignement."` (section Conception, sous-onglet « Alignement », avec le halo du menu) ; [E] ×5 ; [E] « Aie sous la main… » (ne se grise pas) ; [G] toucher « Compétence » (se grise quand un bloc de compétence neuf existe : `duType('competence').length`) ; [G] la consigne (se grise à `atteint` : une compétence neuve avec un énoncé). `avant`, `zones`, `contour` inchangés. Objectif atteint, pour la dernière bulle : « Objectif atteint : tu es en mesure d'aligner une première chaîne de ton cours, de sa compétence jusqu'à ta production. » (forme des parcours 2 et 4, un seul deux-points ; à confirmer avec la bulle 7).

Nouveau par rapport au texte du 8 nov. : le paragraphe devient des lignes ; l'objectif (verbe d'application « aligner » ; la bulle 7 dit « une première chaîne alignée, de la compétence à ta production » : « monter ton cours » promettrait tout le cours) ; la phrase du lieu (la bulle ouvre l'onglet : `allerALaCarte`) ; « Commence par la compétence que ton cours doit développer… Tout le reste de ta carte s'y rattachera » devient une explication, « Tout part de la compétence… : le reste de ta carte s'y rattachera » ; « Aie sous la main le devis ministériel de ton cours » (règle 3 du 14 nov. : la bulle nomme d'abord le document dont l'étape a besoin) ; le geste se coupe en deux (toucher, puis écrire) ; « tel que le devis ministériel décrit la compétence et ses éléments » devient « tel que le devis décrit… » (le devis est nommé juste au-dessus).

**Remarque de Grégoire (13 h 49), pour la bulle 3** : au-delà de l'alignement constructif, la carte a une fonction minimale : donner à chaque séance un contenu et une date ; la saisie des présences pourra alors dire à chaque absent·e le contenu manqué ; l'alignement n'est pas nécessaire pour ce minimum. Mesuré par Cowork (13 h 51) : le profil › Engagement nomme, pour chaque absence, toute leçon SITUÉE (semaine et séance posées) des cartes du cours, liée ou non à une idée maîtresse ou à une compétence (`leconsSitueesDuCours`, `js/planification-carte.js` l. 8565 ; `lecteurLeconsDuGroupe`, `js/planification-export.js` l. 331 ; #942). Recommandé par Cowork : le dire à la bulle 3, là où la leçon et sa semaine sont sous les yeux et où le texte du 8 nov. parle déjà du profil de l'absent·e ; pas à la bulle 1 (la leçon n'y est pas encore vue, et la bulle 1 dit déjà « tu peux utiliser l'application sans elle »).

## Bulle 2 (validée par Grégoire le 19 nov. à 13 h 53 : « Ok »)

C'est fait : ta compétence est écrite. (en petit, au-dessus du titre)

**Ton idée maîtresse** · 2 sur 7

Une idée maîtresse, c'est l'essentiel : ce qui restera quand l'étudiant·e aura oublié les détails, et autour de quoi tu organises ton contenu.
Chaque compétence se décline en une ou plusieurs idées maîtresses : une seule suffit pour l'instant.
C'est par tes idées maîtresses que tes leçons se rattacheront à ta compétence.

→ Touche « Idée maîtresse » dans la palette « Nœuds »
→ Écris ton idée maîtresse
→ **Depuis l'un des petits cercles au bord de ta compétence, tire un trait jusqu'à ton idée maîtresse** (le lien « se décline en » s'affiche)

Pour aller plus loin, « Idées maîtresses », dans la frise au-dessus de la carte, ouvre le guide à la page qui en parle.

Notation pour le relais : [C] ; [E] ×3 ; [G] toucher « Idée maîtresse » (se grise quand un bloc d'idée maîtresse neuf existe) ; [G] écrire (se grise quand ce bloc a un texte : `duType('idee-maitresse').find(texte)`) ; [G] la consigne, en gras, suivie hors du gras de sa parenthèse (se grise à `atteint`, `ideeReliee`) ; [E] après la consigne. Pas de phrase du lieu (même onglet). `avant` (les cercles d'attache en contour, `poserExtras`), `zones`, `contour` inchangés.

Nouveau par rapport au texte du 8 nov. : le paragraphe devient des lignes ; la confirmation ; « Une seule suffit pour l'instant » rejoint « se décline en une ou plusieurs idées maîtresses » ; le geste du 8 nov. (« Touche « Idée maîtresse », écris-la, puis tire un trait… ») devient trois gestes marqués, avec les mots du texte (« depuis l'un des petits cercles au bord de la compétence ») ; « Le lien « se décline en » s'affiche » passe en parenthèse de la consigne ; « Pour aller plus loin, touche « Idées maîtresses » dans la frise… » devient une explication après la consigne, sans impératif (geste facultatif).

## Bulle 3 (validée par Grégoire le 19 nov. à 13 h 57 : « Oui, on poursuit », avec la troisième ligne revue à 13 h 56)

C'est fait : ton idée maîtresse est reliée à ta compétence. (en petit, au-dessus du titre)

**Ta leçon** · 3 sur 7

Tes leçons structurent ton cours dans le temps : chacune porte sa semaine et sa séance.
Une leçon datée apparaît dans le profil d'un·e étudiant·e absent·e ce jour-là : tu sais quelle matière il ou elle a manquée. Pour cela, des leçons datées suffisent, même sans le reste de ta carte.
Touchée deux fois, ta leçon montre dans l'Inspecteur sa date pour chacun de tes groupes, calculée d'après son horaire. Sans tes journées sans cours et tes semaines spéciales (Cadre › Trimestre), ces dates peuvent tomber à côté.

→ Touche « Leçon » dans la palette « Nœuds »
→ Donne-lui un titre
→ Dans son en-tête, choisis sa semaine (S1, S2…), puis sa séance dans la semaine (A pour la première rencontre, B pour la deuxième)
→ **Tire un trait de ton idée maîtresse jusqu'à ta leçon** (le lien « se concrétise dans » s'affiche)

C'est ce lien qui fait remonter tes objectifs et tes évaluations jusqu'à la compétence.
Pour aller plus loin, « Leçons », dans la frise, ouvre le guide à la page qui en parle.

Notation pour le relais : [C] ; [E] ×3 ; [G] toucher « Leçon » (se grise quand un bloc de leçon neuf existe) ; [G] le titre (se grise quand la leçon neuve a un titre : `leconNeuve()`) ; [G] semaine et séance (se grise quand elle est datée : `leconDatee(leconNeuve())`) ; [G] la consigne, en gras, suivie hors du gras de sa parenthèse (se grise à `atteint`, `leconReliee`) ; [E] ×2 après la consigne. Pas de phrase du lieu. `avant` (la semaine et la séance, puis les cercles d'attache, en contour), `zones`, `contour` inchangés.

Nouveau par rapport au texte du 8 nov. : le paragraphe devient des lignes ; la confirmation ; **la fonction minimale (remarque de Grégoire de 13 h 49)** : « Avec sa date, ta leçon apparaîtra aussi dans le profil… » devient la deuxième ligne, au présent, suivie de « Pour cela, des leçons datées suffisent, même sans le reste de ta carte » (mesuré : `leconsSitueesDuCours` lit toute leçon située, liée ou non) ; « Touche deux fois la leçon : l'Inspecteur affiche sa date » et « Si tu n'as pas encore ajouté tes journées sans cours… fais-le » deviennent une explication sans impératif (gestes facultatifs ; l'étape avance dès le trait tiré, avant qu'on les lise) ; **une date par groupe (question de Grégoire, 13 h 56)** : il demande si les dates varient selon les groupes et l'horaire, et si on les retrouve d'un coup dans la carte ; mesuré par Cowork : oui, l'Inspecteur montre « Séance B », puis une ligne par groupe du cours (« Gr. 1 : mardi 30 septembre », « Gr. 2 : jeudi 2 octobre »), chaque date tirée de l'horaire du groupe, « pas de séance B en semaine N » quand le rang manque, aucune date devinée (`lignesDateDeLecon`, `horairesDesGroupesDuCours`, `js/planification-export.js` l. 381 à 430) ; condition : la carte rattachée au cours (sinon « Carte rattachée à aucun cours : pas de date ») ; une carte créée quand un cours est actif l'est d'office (`creerEntreeIndex`, `js/planification-donnees.js` l. 55) ; d'où « sa date pour chacun de tes groupes, calculée d'après son horaire » et « ces dates », acceptés à 13 h 57 ; le geste du 8 nov. devient quatre gestes marqués ; « Le lien « se concrétise dans » apparaît » passe en parenthèse de la consigne ; « Pour aller plus loin… » sans impératif.

## Bulle 4 (validée par Grégoire le 19 nov. à 13 h 59 : « Ok » ; ↻ 15 h 34 : « le vérifier » au lieu de « l'exiger », sa retouche de 15 h 32)

C'est fait : ta leçon est datée et reliée à ton idée maîtresse. (en petit, au-dessus du titre)

**Ton objectif** · 4 sur 7

L'objectif de leçon est la boussole : c'est lui qui dit ce que l'étudiant·e saura faire à la fin, et c'est par rapport à lui que se choisissent les connaissances, les activités et l'évaluation.
Le verbe que tu choisis, tes activités devront le faire exercer et tes évaluations devront le vérifier.
Ta production porte déjà un objectif d'apprentissage : si c'est celui que vise cette leçon, tu peux le reprendre ici.

→ Touche le badge 🎯 dans l'en-tête de ta leçon (la zone des objectifs se déplie)
→ **Écris ton objectif en commençant par un verbe** (l'invite « Sera en mesure de… » t'y aide)

Pour aller plus loin, « Objectifs », dans la frise, ouvre le guide à la page qui en parle.

Notation pour le relais : [C] ; [E] ×3 ; [G] le badge, en clair, suivi de sa parenthèse (se grise quand la zone des objectifs de la leçon est dépliée, si le parcours sait le lire ; sinon ne se grise pas ; à dire au rapport) ; [G] la consigne, en gras, suivie hors du gras de sa parenthèse (se grise à `atteint` : un objectif écrit, champ quitté) ; [E] après la consigne. Pas de phrase du lieu. `avant`, `zones`, `contour` (le badge 🎯) inchangés.

Nouveau par rapport au texte du 8 nov. : le paragraphe devient des lignes ; la confirmation ; « Le verbe que tu choisis… » remonte avec l'explication de la boussole ; « reprends-le ici » devient « tu peux le reprendre ici » (geste conditionnel : une explication, sans impératif) ; « Touche le badge 🎯… : la zone des objectifs se déplie » et « Écris ton objectif en commençant par un verbe ; l'invite « Sera en mesure de… » t'y aide » deviennent deux gestes marqués, leur suite en parenthèse ; **« Une pastille « ! » apparaît à côté : aucun bloc ne sert encore cet objectif. Elle changera à mesure que tu le relieras. » passe à la bulle 5 (décidé par Cowork, accepté par Grégoire à 13 h 59)** : l'étape avance dès l'objectif écrit, la pastille paraît quand la bulle 5 s'ouvre ; chaque bulle décrit la pastille qu'on a sous les yeux à son ouverture (« ! » à la bulle 5, « ⚠ » à la bulle 6, « ✓ » à la bulle 6 une fois l'évaluation alignée) ; « Pour aller plus loin… » sans impératif. ↻ 15 h 34 : « tes évaluations devront l'exiger » devient « tes évaluations devront le vérifier » (retouche de Grégoire, voir l'en-tête).

## Bulle 5 (validée par Grégoire le 19 nov. à 14 h : « C'est bon »)

C'est fait : ton objectif est écrit. (en petit, au-dessus du titre)

**Ton activité** · 5 sur 7

La pastille « ! » à côté de ton objectif dit qu'aucun bloc ne le sert encore : elle changera à mesure que tu le relieras.
Le type d'activité dépend de ce que tu vises : un exercice de mémorisation ne développe pas la même chose qu'une analyse de cas.
Cocher l'objectif qu'une activité sert, c'est vérifier qu'aucun objectif ne reste sans moyen.

→ Touche « Activité » dans la palette « Nœuds »
→ Donne-lui un titre
→ Glisse le bloc dans ta leçon par sa poignée ⠿
→ Touche deux fois cette poignée (l'Inspecteur s'ouvre)
→ **Dans l'Inspecteur, coche l'objectif que ton activité sert**

Pour aller plus loin, « Activités », dans la frise, ouvre le guide à la page qui en parle.

Notation pour le relais : [C] ; [E] ×3 ; [G] toucher « Activité » (se grise quand un bloc d'activité neuf existe) ; [G] le titre (se grise quand il a un titre) ; [G] glisser (se grise quand l'activité est dans la leçon : `act.parent`) ; [G] toucher deux fois, suivi de sa parenthèse (se grise quand l'Inspecteur est ouvert sur l'activité : `inspecteurOuvertSur`) ; [G] la consigne (se grise à `atteint`, `blocQuiSert`) ; [E] après la consigne. Pas de phrase du lieu. `avant` (la poignée, puis les cases de l'Inspecteur, en contour), `zones`, `contour` inchangés.

Nouveau par rapport au texte du 8 nov. : le paragraphe devient des lignes ; la confirmation ; la pastille « ! », venue de la bulle 4, en première ligne, au présent (« dit qu'aucun bloc ne le sert encore ») ; « C'est ainsi que tu vérifies qu'aucun objectif ne reste sans moyen » devient l'explication « Cocher l'objectif qu'une activité sert, c'est vérifier… », avant les gestes ; le geste du 8 nov. devient cinq gestes marqués ; **« La pastille de ton objectif passe à « ⚠ » : il est servi, mais aucune évaluation ne le vérifie encore. » passe à la bulle 6 (même motif qu'à la bulle 4, accepté avec la bulle)** ; « Pour aller plus loin… » sans impératif.

## Bulle 6 (validée par Grégoire le 19 nov. à 14 h 05 : « C'est bon », avec ses deux lignes revues et la ligne ajoutée ; ↻ 15 h 53 : « le précisera » au lieu de « l'écrira »)

C'est fait : ton activité sert ton objectif. (en petit, au-dessus du titre)

**Ton évaluation** · 6 sur 7

La pastille « ⚠ » de ton objectif dit qu'il est servi, mais qu'aucune évaluation ne le vérifie encore.
Formative ou certificative, l'évaluation ferme la boucle : elle vérifie ce que tu as enseigné, au niveau que tu as visé, ni plus, ni moins.
Elle vient après l'activité : sous elle dans la même leçon, ou dans une leçon plus tard, la carte comparant alors les semaines et les séances. Ici, elle se place sous ton activité.
Une fois ta production choisie, ta carte sait quelle production vérifie cet objectif, et ce qu'elle pèse dans ta note.

→ Touche « Évaluation » dans la palette « Nœuds »
→ Donne-lui un titre
→ Glisse le bloc dans ta leçon par sa poignée ⠿, sous ton activité
→ Touche deux fois cette poignée (l'Inspecteur s'ouvre)
→ Dans l'Inspecteur, coche l'objectif que ton évaluation vérifie
→ **Choisis dans « Production » celle que tu as décrite**

Dans son en-tête, « Formative » ou « Certificative » dit sa visée : ton plan de cours le précisera.
Pour aller plus loin, « Évaluations », dans la frise, ouvre le guide à la page qui en parle.

Seconde forme, si l'évaluation se retrouve au-dessus de l'activité (`TEXTE_6_APRES`, titre et compteur gardés ; la confirmation part) :

Ta pastille affiche « ⚠ » : dans ta leçon, l'évaluation vient avant l'activité qui enseigne son objectif.
→ **Glisse ton évaluation sous ton activité, par sa poignée ⠿**

Notation pour le relais : [C] ; [E] ×4 ; [G] toucher « Évaluation » (se grise quand un bloc d'évaluation neuf existe) ; [G] le titre ; [G] glisser (se grise quand l'évaluation est dans la leçon) ; [G] toucher deux fois, suivi de sa parenthèse (se grise quand l'Inspecteur est ouvert sur l'évaluation) ; [G] cocher (se grise quand l'évaluation vérifie un objectif : `objectifsVerifiesPar`) ; [G] la consigne (se grise à `atteint`, `evaluationAlignee` : production choisie et pastille « ✓ ») ; [E] ×2 après la consigne. Seconde forme : [E] ; [G] la consigne (le `geste` de la variante). Le passage d'une forme à l'autre : le mécanisme actuel (`varianteRendue`, `M().allerA(5)`), ou `secondeForme` du moteur si elle convient mieux (à dire au rapport). `avant`, `zones`, `contour` inchangés.

Nouveau par rapport au texte du 8 nov. : le paragraphe devient des lignes ; la confirmation ; la pastille « ⚠ », venue de la bulle 5, en première ligne ; **« Formative ou certificative » en tête de « l'évaluation ferme la boucle » et « Elle vient après l'activité : sous elle dans la même leçon, ou dans une leçon plus tard… Ici, elle se place sous ton activité » (deux questions de Grégoire, 14 h 03 : une évaluation formative vérifie aussi l'objectif ; l'évaluation peut venir dans une leçon plus tard que l'activité ; l'application en tient-elle compte ?)** ; mesuré par Cowork (`js/planification-carte.js`) : la visée est un modificateur du bloc Évaluation (`metadata.visee`, « Formative » / « Certificative » dans l'en-tête ; absente, l'export écrit « Évaluation ») et une évaluation formative vérifie un objectif au même titre qu'une certificative (décision de Grégoire du 16 août, l. 1541) ; la pastille de l'évaluation (`evaluerPastilleEvaluation`, l. 1757) compare l'ordre des blocs dans une même leçon, puis la semaine et le rang de séance d'une leçon à l'autre (même rang : « avant ») ; une leçon sans semaine ou sans séance donne « ? » ; d'où les deux lignes revues et l'ajout « Dans son en-tête, « Formative » ou « Certificative » dit sa visée : ton plan de cours l'écrira. », acceptés à 14 h 05 ; « Dans une leçon, l'ordre des blocs dit ce qui vient avant » est fondu dans la ligne revue ; « ta carte sait maintenant quelle production vérifie cet objectif… » devient une explication avant les gestes (« Une fois ta production choisie, ta carte sait… ») ; le geste du 8 nov. devient six gestes marqués ; **« Regarde les pastilles : celle de ton évaluation passe à « ✓ »… Le « ⚠ » de ta compétence disparaît » et « Ta carte est alignée quand… » passent à la bulle 7** (l'étape avance dès l'évaluation alignée) ; « Pour aller plus loin… » sans impératif ; la seconde forme : la phrase de la variante devient une explication et un geste, mots inchangés.

## Bulle 7 (validée par Grégoire le 19 nov. à 14 h 10 : « Oui, c'est bon », avec la ligne du « Planificateur » revue)

C'est fait : ton évaluation vérifie ton objectif. (en petit, au-dessus du titre)

**Raffiner, si tu veux** · 7 sur 7

Les pastilles ont changé : celle de ton évaluation affiche « ✓ », parce que l'objectif qu'elle vérifie a été enseigné avant ; celle de ton objectif aussi, puisqu'il est servi et vérifié. Le « ⚠ » de ta compétence a disparu.
Ta carte est alignée quand chaque objectif est servi et vérifié, et que chaque évaluation ne vérifie que des objectifs déjà enseignés.
Tu peux t'arrêter là : ta carte dit déjà ce que ta production vérifie, et quand tu l'enseignes.
Tu peux aussi la raffiner, à ton rythme :
tes autres leçons, chacune avec ses objectifs
les connaissances que tes activités font acquérir
le niveau cognitif de chaque bloc, dans l'Inspecteur, pour que tes activités et tes évaluations visent le même niveau d'exigence
ta démarche, comme l'enseignement explicite, si c'est la tienne
le « Planificateur », qui montre toutes tes leçons semaine par semaine ; y glisser une leçon change sa semaine, et donc ses dates
Dans « Actions », « Exporter le plan… » en tire ton plan de cours, et « Télécharger un modèle… » te permet de faire relire ta carte par l'IA de ton choix, sans qu'elle soit modifiée.
Dans « Consulter la bibliothèque », « Garder dans ma bibliothèque » la reprend d'un trimestre à l'autre, et « Exporter » en fait un fichier que tes collègues peuvent importer.

(filet) **Objectif atteint : tu es en mesure d'aligner une première chaîne de ton cours, de sa compétence jusqu'à ta production.** (filet), posé par le moteur (`objectifAtteint`).

Chaque parcours a son objectif. C'est toi qui choisis la suite.
Pour revoir une étape, touche « 7 sur 7 ».

→ **Touche « Parcours suivant », ou « Terminer ».** (la consigne de fin du moteur)

Boutons : « Parcours suivant » et « Terminer », de même poids (règle 9 du 14 nov.), à la place du seul « Terminer » primaire de l'étape.

Notation pour le relais : [C] ; [E] ×4 ; [E] ×5 (les pistes, lignes simples sans marque) ; [E] ×2 ; puis la fin du moteur, dans l'ordre du moteur. `centre`, `sansSortie`, `surEchap` gardés ; `terminer()` garde son ménage et l'état « fait ».

Nouveau par rapport au texte du 8 nov. : le paragraphe devient des lignes ; la confirmation ; les pastilles « ✓ » et « Ta carte est alignée quand… », venues de la bulle 6 (« Regarde les pastilles » sans impératif : « Les pastilles ont changé ») ; « Tu peux aussi la raffiner autant que tu le veux. Quelques pistes, à ton rythme : » devient « Tu peux aussi la raffiner, à ton rythme : » ; les cinq pistes en lignes simples, comme les trois vues de la rétroaction au parcours 4 ; « Le guide t'accompagne à chaque pas. » retiré (chaque bulle a dit où ouvrir le guide ; dit à Grégoire) ; la fin du moteur (objectif atteint, deux boutons) à la place de « Touche « Terminer » ». **Le « Planificateur » (question de Grégoire, 14 h 08 : permet-il de changer l'ordre des leçons et de les voir toutes ? est-ce de l'affichage ou cela change-t-il la carte ?)** : mesuré par Cowork (`js/planification-carte.js` l. 9748 à 10524) : une grille, une rangée par semaine du trimestre (tirée du calendrier du Cadre ; les dates du trimestre à côté de son titre), séquences et leçons à leur semaine, une zone « Non planifié » ; toucher une leçon y cadre la carte ; glisser une leçon (ou une séquence entière) vers une autre rangée CHANGE SA SEMAINE (`deposerDansGrille` → `definirSemaineLecon`, la même donnée que le sélecteur de semaine de l'en-tête) : ses dates par groupe, la matière manquée du profil et les pastilles suivent ; la séance (A, B) ne se règle que dans l'en-tête ; dans une semaine, le glisser ne réordonne rien. Non vérifié : le glisser au doigt (commentaire d'août : « souris d'abord » ; `initialiserDragGrille`, pointer events, aucun `touch-action` lu sur la grille) : mesure (a) du relais. « le « Planificateur », qui place tes leçons sur les semaines du trimestre » devient « …qui montre toutes tes leçons semaine par semaine ; y glisser une leçon change sa semaine, et donc ses dates », accepté à 14 h 10. L'objectif atteint, en un seul deux-points, accepté avec la bulle.

## Faits mesurés en chemin
- La leçon manquée d'une absence (profil › Engagement, #942) : les leçons situées (semaine et séance posées) des cartes rattachées au cours, ou à défaut des cartes sans cours ; jamais celles d'un autre cours (`idsCartesDuCours`). La date vient de l'horaire du groupe (`construireHoraireDeLecons`) ; aucune date devinée quand le rang n'existe pas cette semaine-là.

- Les dates d'une leçon dans l'Inspecteur (`lignesDateDeLecon`) : une ligne par groupe du cours quand il y en a plusieurs, chacune tirée de l'horaire du groupe ; une seule ligne (« Mardi 30 septembre · séance B ») quand il n'y en a qu'un ; « Leçon non planifiée », « Semaine N, séance non fixée », « Aucun horaire saisi pour ce cours », « Carte rattachée à aucun cours : pas de date » selon le cas.

- La visée d'une évaluation (`VISEES_EVALUATION`, `js/planification-carte.js` l. 1491 à 1580) : trois états en mémoire (formative, certificative, rien), deux au menu ; le menu montre « Certificative » tant que rien n'est choisi, l'export écrit alors « Évaluation ». La pastille d'une évaluation (`evaluerPastilleEvaluation`, l. 1757) : même leçon, l'ordre des blocs ; autre leçon, la semaine puis le rang de séance ; hors leçon ou sans semaine, « ? » ; le pire état l'emporte (✕, ⚠, ?, ✓) ; aucun objectif coché, « ! ».

- Le « Planificateur » (palette `#planif-palette-nav`, `js/planification-carte.js` l. 9748 à 10524) : une grille par semaine dérivée du calendrier du Cadre ; « Non planifié » en pied ; le clic sur une leçon cadre la carte (`naviguerSommaireLecon`) ; le glisser vertical (`initialiserDragGrille`) écrit la semaine de la leçon ou déplace une séquence (`deposerDansGrille`) ; le rang de séance n'a pas de glisser (sa seule porte d'écriture est le sélecteur de l'en-tête).
- `PARCOURS_OUVERTS` sur `claude/ecstatic-brown-urn6v8` = `['decouvrir', 'classe', 'evaluer', 'recevoir']` (`js/assistance.js` l. 67, commit `4c36db4`) : ni `donnees` ni `monter` ; les relais des parcours 6 et 5 les ajoutent chacun dans un commit à part, branche seulement. L'identifiant de ce parcours : `monter`.

## État (19 nov., 15 h 34)
Les sept bulles de « Nous faisons » validées par Grégoire de 13 h 49 à 14 h 10 (la bulle 6 avec sa seconde forme). Relais remis à Grégoire à 14 h 12, pour une session du cloud après la release de midi (texte ci-dessous) ; pas encore parti à 15 h 34 (Grégoire pense le donner à une session de nuit, avec les autres textes de parcours) ; la bulle 4 retouchée à 15 h 34, dans le relais aussi : c'est ce texte-ci qu'il colle.

## Le relais (remis à Grégoire le 19 nov. à 14 h 12 ; ↻ 15 h 34, bulle 4 : « le vérifier » ; ↻ 15 h 53, bulle 6 : « le précisera »)

Mesuré par Cowork à 14 h 11 (`git ls-remote` depuis le cloud) : `origin/main` = `f6acc378`, encore 1.249.0 : la release de midi n'est pas en ligne ; aucune branche `lot/nous-faisons-*` n'existe ; `origin/claude/ecstatic-brown-urn6v8` = `ebc9a9ad`. D'où le préalable et la base conditionnels. L'ordre de la fin : celui du moteur (le relais du parcours 6 l'énumère dans un autre ordre en disant « dans son ordre » : c'est le moteur qui fait foi). Texte remis, mot pour mot (avec les retouches de 15 h 34 et de 15 h 53) :

```
Pour Claude Code, à relayer : parcours 5 (« Monter ton cours »), « Nous faisons » : les sept bulles réécrites, avec la seconde forme de la bulle 6. Session du cloud, à lancer APRÈS la mise en ligne du 19 nov. à midi.

Contexte. Les sept bulles de la Pratique guidée (`ETAPES` de `js/parcours-cours.js`) ont été réécrites avec Grégoire le 19 nov., de 13 h 49 à 14 h 10, dans la forme et le ton des « Nous faisons » des parcours 2, 4 et 6 (relais du même jour). Les textes ci-dessous sont validés par lui mot pour mot : ce sont des mots d'enseignant. Un mot qui ne tient pas techniquement se signale au rapport ; il ne se remplace pas. Les motifs et les faits mesurés sont dans le document du Projet de Cowork, `claude/parcours-cours-pratique-textes.md` ; ce relais porte tout ce qu'il te faut. La ligne du panneau, le refus (`REFUS`), `grandEcranSeulement`, la garde de saisie (`enSaisie`), `neuf`/`noeudsAvant`, `amenerLeBloc`, les contours en plus (`poserExtras`) et `inspecteurDevant` ne changent pas.

0. Préalable. Vérifie que la release du 19 nov. est publiée : la version de `origin/main` a dépassé 1.249.0 et `RELAIS.md` sur `main` dit la release en ligne (mesuré par Cowork à 14 h 11 : `origin/main` = `f6acc378`, encore 1.249.0). Sinon, arrête-toi et dis-le, sans rien créer. Branche : `lot/nous-faisons-cours`. Point de départ : la tête de la branche « Nous faisons » la plus récente qui existe, dans cet ordre : `origin/lot/nous-faisons-donnees` (parcours 6), `origin/lot/nous-faisons-recevoir` (parcours 4), `origin/lot/nous-faisons-classe` (parcours 2), pour que les « Nous faisons » voyagent ensemble ; sinon `origin/claude/ecstatic-brown-urn6v8` (`ebc9a9ad` ou plus récent). Dis au rapport laquelle, son commit, et si sa session avait poussé son rapport (mesuré à 14 h 11 : aucune n'existe encore). Puis `git merge --no-ff origin/main` ; conflits tranchés en gardant les deux côtés, nommés au rapport. Le commit `4c36db4` (parcours rouverts sur la branche) reste : c'est un aperçu ; ajoute `monter` à `PARCOURS_OUVERTS` dans un commit à part, SUR LA BRANCHE SEULEMENT, nommé au rapport comme un commit à annuler avant toute fusion. Ne fusionne rien vers `main` ni vers les autres branches « Nous faisons ». Écris d'abord la consigne `plans de travail/CONSIGNE-2026-11-19-nous-faisons-cours.md`, mot pour mot depuis ce relais.

1. Trois mesures d'abord, au rapport avant tout code. (a) Le glisser d'une leçon dans le « Planificateur » (`initialiserDragGrille`, `deposerDansGrille`, `js/planification-carte.js`) répond-il au doigt, sur écran tactile (WebKit, iPad émulé) ? Un commentaire d'août dit « souris d'abord ». La bulle 7 dit qu'y glisser une leçon change sa semaine : si le doigt ne le peut pas, dis-le, n'invente rien ; Cowork tranchera. (b) La carte active d'une personne qui arrive au parcours est-elle rattachée à son cours (`coursId` de l'index) ? La bulle 3 promet une date par groupe dans l'Inspecteur ; une carte sans cours affiche « Carte rattachée à aucun cours : pas de date ». Dis dans quels cas cela arrive ; n'ajoute rien. (c) Avec quels boutons le moteur ferme ce parcours quand le parcours suivant (6, « Mettre tes données à l'abri ») est fermé ou n'a pas son « Nous faisons » dans ta base ; la bulle 7 prévoit « Parcours suivant » et « Terminer », de même poids ; si le moteur ne peut offrir que « Terminer », sa consigne de fin suit ses boutons (`consigneDeLaFin`) : dis-le, n'invente rien.

2. La forme, pour les sept bulles, avec les mécanismes qui existent déjà (le moteur, et ceux des lots des autres « Nous faisons » s'ils sont dans ta base), sans en inventer d'autres : `geste` et `texte` remplacés par des lignes (`lignes`) ; la confirmation « C'est fait : … » au-dessus du titre, en petit, à partir de la bulle 2, seulement si l'étape d'avant a été faite pendant ce passage (après « Reprendre », pas de confirmation : décision de Cowork, la même qu'aux autres parcours) ; la phrase du lieu à la bulle 1 seulement (`lieu`, `nommeLaSection`, `lieuSuite`, avec le halo du menu : Conception, sous-onglet « Alignement ») ; toutes les autres étapes se jouent sur la carte, sans phrase du lieu ; les explications sans marque (`note`) ; seuls les gestes marqués (flèche à faire, crochet fait) ; un geste en clair suivi d'une parenthèse : la parenthèse hors du gras quand le geste est la consigne ; l'objectif à la bulle 1 et l'objectif atteint à la bulle 7, posés par le moteur depuis la définition (`objectif`, `objectifAtteint` sur `DEF`, qui n'en a pas aujourd'hui) ; la phrase de la poignée, posée par le moteur. À la bulle 7, la fin du moteur, dans l'ordre du moteur, remplace le seul bouton « Terminer » primaire de l'étape (`terminer()` garde son ménage et l'état « fait » ; `centre`, `sansSortie` et `surEchap` gardés). Titres, `avant`, `zones`, `contour`, `atteint` (avec la garde `enSaisie`) : inchangés. Chaque geste se grise quand l'état de la carte dit qu'il est fait, avec les lecteurs qui existent déjà (`duType`, `texte`, `leconNeuve`, `leconDatee`, `parent`, `inspecteurOuvertSur`, `objectifsVerifiesPar`) ; un geste dont rien ne dit qu'il est fait ne se grise pas : dis lesquels au rapport. Notation : [C] confirmation, [L] suite de la phrase du lieu, [E] explication, [G] geste ; le dernier [G] est la consigne (en gras).

Bulle 1, « Ta compétence » :
Objectif : « À la fin de ce parcours, tu seras en mesure d'aligner une première chaîne de ton cours, de sa compétence jusqu'à ta production. »
[L] « : c'est là que tu construis ta carte d'alignement. »
[E] « La carte d'alignement n'est pas une tâche de plus : c'est un outil pour monter ton cours, et tu peux utiliser l'application sans elle. »
[E] « Elle montre comment tes leçons et tes productions mènent à la compétence de ton cours, et donc sur quoi repose la note que tu construis. »
[E] « Elle garde ces liens pour toi et signale ceux qui manquent : tu n'as plus à tout tenir en tête. »
[E] « Son principe : tu évalues ce que tu enseignes, et tu enseignes ce que tu évalues, au même niveau d'exigence. »
[E] « Tout part de la compétence que ton cours doit développer : le reste de ta carte s'y rattachera. »
[E] « Aie sous la main le devis ministériel de ton cours. »
[G] « Touche « Compétence » dans la palette « Nœuds » »
[G] « Écris son énoncé, tel que le devis décrit la compétence et ses éléments »

Bulle 2, « Ton idée maîtresse » :
[C] « C'est fait : ta compétence est écrite. »
[E] « Une idée maîtresse, c'est l'essentiel : ce qui restera quand l'étudiant·e aura oublié les détails, et autour de quoi tu organises ton contenu. »
[E] « Chaque compétence se décline en une ou plusieurs idées maîtresses : une seule suffit pour l'instant. »
[E] « C'est par tes idées maîtresses que tes leçons se rattacheront à ta compétence. »
[G] « Touche « Idée maîtresse » dans la palette « Nœuds » »
[G] « Écris ton idée maîtresse »
[G] « Depuis l'un des petits cercles au bord de ta compétence, tire un trait jusqu'à ton idée maîtresse », suivi hors du gras de « (le lien « se décline en » s'affiche) »
[E], après la consigne : « Pour aller plus loin, « Idées maîtresses », dans la frise au-dessus de la carte, ouvre le guide à la page qui en parle. »

Bulle 3, « Ta leçon » :
[C] « C'est fait : ton idée maîtresse est reliée à ta compétence. »
[E] « Tes leçons structurent ton cours dans le temps : chacune porte sa semaine et sa séance. »
[E] « Une leçon datée apparaît dans le profil d'un·e étudiant·e absent·e ce jour-là : tu sais quelle matière il ou elle a manquée. Pour cela, des leçons datées suffisent, même sans le reste de ta carte. »
[E] « Touchée deux fois, ta leçon montre dans l'Inspecteur sa date pour chacun de tes groupes, calculée d'après son horaire. Sans tes journées sans cours et tes semaines spéciales (Cadre › Trimestre), ces dates peuvent tomber à côté. »
[G] « Touche « Leçon » dans la palette « Nœuds » »
[G] « Donne-lui un titre »
[G] « Dans son en-tête, choisis sa semaine (S1, S2…), puis sa séance dans la semaine (A pour la première rencontre, B pour la deuxième) »
[G] « Tire un trait de ton idée maîtresse jusqu'à ta leçon », suivi hors du gras de « (le lien « se concrétise dans » s'affiche) »
[E], après la consigne : « C'est ce lien qui fait remonter tes objectifs et tes évaluations jusqu'à la compétence. »
[E] « Pour aller plus loin, « Leçons », dans la frise, ouvre le guide à la page qui en parle. »

Bulle 4, « Ton objectif » :
[C] « C'est fait : ta leçon est datée et reliée à ton idée maîtresse. »
[E] « L'objectif de leçon est la boussole : c'est lui qui dit ce que l'étudiant·e saura faire à la fin, et c'est par rapport à lui que se choisissent les connaissances, les activités et l'évaluation. »
[E] « Le verbe que tu choisis, tes activités devront le faire exercer et tes évaluations devront le vérifier. »
[E] « Ta production porte déjà un objectif d'apprentissage : si c'est celui que vise cette leçon, tu peux le reprendre ici. »
[G] « Touche le badge 🎯 dans l'en-tête de ta leçon (la zone des objectifs se déplie) »
[G] « Écris ton objectif en commençant par un verbe », suivi hors du gras de « (l'invite « Sera en mesure de… » t'y aide) »
[E], après la consigne : « Pour aller plus loin, « Objectifs », dans la frise, ouvre le guide à la page qui en parle. »

Bulle 5, « Ton activité » :
[C] « C'est fait : ton objectif est écrit. »
[E] « La pastille « ! » à côté de ton objectif dit qu'aucun bloc ne le sert encore : elle changera à mesure que tu le relieras. »
[E] « Le type d'activité dépend de ce que tu vises : un exercice de mémorisation ne développe pas la même chose qu'une analyse de cas. »
[E] « Cocher l'objectif qu'une activité sert, c'est vérifier qu'aucun objectif ne reste sans moyen. »
[G] « Touche « Activité » dans la palette « Nœuds » »
[G] « Donne-lui un titre »
[G] « Glisse le bloc dans ta leçon par sa poignée ⠿ »
[G] « Touche deux fois cette poignée (l'Inspecteur s'ouvre) »
[G] « Dans l'Inspecteur, coche l'objectif que ton activité sert »
[E], après la consigne : « Pour aller plus loin, « Activités », dans la frise, ouvre le guide à la page qui en parle. »

Bulle 6, « Ton évaluation » :
[C] « C'est fait : ton activité sert ton objectif. »
[E] « La pastille « ⚠ » de ton objectif dit qu'il est servi, mais qu'aucune évaluation ne le vérifie encore. »
[E] « Formative ou certificative, l'évaluation ferme la boucle : elle vérifie ce que tu as enseigné, au niveau que tu as visé, ni plus, ni moins. »
[E] « Elle vient après l'activité : sous elle dans la même leçon, ou dans une leçon plus tard, la carte comparant alors les semaines et les séances. Ici, elle se place sous ton activité. »
[E] « Une fois ta production choisie, ta carte sait quelle production vérifie cet objectif, et ce qu'elle pèse dans ta note. »
[G] « Touche « Évaluation » dans la palette « Nœuds » »
[G] « Donne-lui un titre »
[G] « Glisse le bloc dans ta leçon par sa poignée ⠿, sous ton activité »
[G] « Touche deux fois cette poignée (l'Inspecteur s'ouvre) »
[G] « Dans l'Inspecteur, coche l'objectif que ton évaluation vérifie »
[G] « Choisis dans « Production » celle que tu as décrite »
[E], après la consigne : « Dans son en-tête, « Formative » ou « Certificative » dit sa visée : ton plan de cours le précisera. »
[E] « Pour aller plus loin, « Évaluations », dans la frise, ouvre le guide à la page qui en parle. »
Seconde forme, quand l'évaluation vérifie l'objectif mais se trouve avant l'activité (la variante d'aujourd'hui, `TEXTE_6_APRES` ; titre et compteur gardés, la confirmation part) :
[E] « Ta pastille affiche « ⚠ » : dans ta leçon, l'évaluation vient avant l'activité qui enseigne son objectif. »
[G] « Glisse ton évaluation sous ton activité, par sa poignée ⠿ »
Le passage d'une forme à l'autre : le mécanisme actuel (`varianteRendue`, `M().allerA(5)`) ou `secondeForme` du moteur, celui qui tient le mieux ; dis lequel.

Bulle 7, « Raffiner, si tu veux » :
[C] « C'est fait : ton évaluation vérifie ton objectif. »
[E] « Les pastilles ont changé : celle de ton évaluation affiche « ✓ », parce que l'objectif qu'elle vérifie a été enseigné avant ; celle de ton objectif aussi, puisqu'il est servi et vérifié. Le « ⚠ » de ta compétence a disparu. »
[E] « Ta carte est alignée quand chaque objectif est servi et vérifié, et que chaque évaluation ne vérifie que des objectifs déjà enseignés. »
[E] « Tu peux t'arrêter là : ta carte dit déjà ce que ta production vérifie, et quand tu l'enseignes. »
[E] « Tu peux aussi la raffiner, à ton rythme : »
[E] « tes autres leçons, chacune avec ses objectifs »
[E] « les connaissances que tes activités font acquérir »
[E] « le niveau cognitif de chaque bloc, dans l'Inspecteur, pour que tes activités et tes évaluations visent le même niveau d'exigence »
[E] « ta démarche, comme l'enseignement explicite, si c'est la tienne »
[E] « le « Planificateur », qui montre toutes tes leçons semaine par semaine ; y glisser une leçon change sa semaine, et donc ses dates »
[E] « Dans « Actions », « Exporter le plan… » en tire ton plan de cours, et « Télécharger un modèle… » te permet de faire relire ta carte par l'IA de ton choix, sans qu'elle soit modifiée. »
[E] « Dans « Consulter la bibliothèque », « Garder dans ma bibliothèque » la reprend d'un trimestre à l'autre, et « Exporter » en fait un fichier que tes collègues peuvent importer. »
Les cinq pistes en lignes simples, sans marque, sous « Tu peux aussi la raffiner, à ton rythme : ». La phrase d'aujourd'hui « Le guide t'accompagne à chaque pas. » est retirée. Puis la fin du moteur : l'objectif atteint entre deux filets, « Objectif atteint : tu es en mesure d'aligner une première chaîne de ton cours, de sa compétence jusqu'à ta production. » ; « Chaque parcours a son objectif. C'est toi qui choisis la suite. » ; « Pour revoir une étape, touche « 7 sur 7 ». » ; la consigne « Touche « Parcours suivant », ou « Terminer ». » ; les boutons « Parcours suivant » et « Terminer », de même poids. Mesure que la bulle tient à 1180 × 820 et 820 × 1180 (elle est centrée, `centre`) ; sinon, dis ce que fait le moteur ; les mots ne changent pas.

3. Tests. La sentinelle `tests/unit/sentinelle-parcours-cours-2026-11-09.test.js` confronte désormais les textes à la consigne du point 0 (la ligne du panneau et le refus restent confrontés à leur consigne du 8 nov.). Le banc `tests/integration/parcours-5-monter-ton-cours-2026-11-09.spec.js` suit les nouveaux textes sans s'affaiblir. Un banc neuf vérifie, bulle par bulle, la confirmation (présente après une étape faite, absente après « Reprendre »), le classement geste ou explication, les gestes qui se grisent, les deux formes de la bulle 6 et la fin (objectif atteint, boutons, consigne), avec break-test. Vitest complet ; Playwright Chromium sur les fichiers liés, 1180 × 820 et 820 × 1180 ; WebKit par GitHub au push. Jetons `?v=` neufs pour chaque fichier touché, d'une lettre que n'emploient pas les lots des autres « Nous faisons ».

4. Porte terrain en markdown (`plans de travail/PORTES-TERRAIN-2026-11-19-nous-faisons-cours.md`), règle 1 : aucune porte quand une machine peut répondre (le glisser au doigt dans le « Planificateur » sur un vrai iPad, si la mesure (a) le laisse ouvert, n'a que la porte). Cowork la relira avant d'en publier l'artefact. Commit, push, PR d'aperçu titrée « APERÇU, ne pas fusionner ». Ni fusion ni release. Rapport `plans de travail/RAPPORT-2026-11-19-nous-faisons-cours.md` : la base choisie, les trois mesures, les commits (celui qui ouvre le parcours sur la branche nommé à part), les gestes qui se grisent et ceux qui ne le peuvent pas, les bancs et leurs break-tests, toute supposition nommée, l'adresse de l'aperçu.
```

## Prochaine étape
Au rapport de la session : le lire, mesurer les textes contre ce document, trancher les mesures (a) le glisser au doigt et (b) la carte sans cours s'il le faut, puis la porte avec Grégoire.
