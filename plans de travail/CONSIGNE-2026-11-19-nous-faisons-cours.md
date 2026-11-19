# Consigne, 19 au 20 nov. 2026 (session de nuit B, lot 2) : « Nous faisons » de « Monter ton cours »

Le relais ci-dessous est celui du document de Cowork `plans de travail/textes-parcours-2026-11-19/parcours-cours-pratique-textes.md` (branche `origin/lot/textes-parcours-nuit`, commit `afb106679`), recopié mot pour mot, retouches de 15 h 34 (bulle 4) et de 15 h 53 (bulle 6) comprises. C'est la consigne du lot, avec les deux changements que le mandat de la nuit y apporte (Grégoire, relayé de Cowork, 19 nov. au soir) :

- **Changement 1, la base.** Le relais dit de partir de la branche « Nous faisons » la plus récente qui existe. Cette nuit, NON : une autre session (A) crée ces branches en même temps. Partir de `origin/claude/ecstatic-brown-urn6v8` (`ebc9a9ad` ou plus récent), quoi qu'il existe d'autre, puis `git merge --no-ff origin/main`, puis `git merge --no-ff lot/glisser-alignement` si le lot 1 a livré une correction (le parcours repose sur ce geste) ; ces fusions sont nommées au rapport comme faisant partie de l'aperçu. Le reste du point 0 vaut tel quel.
- **Changement 2, les deux retouches de mots.** Le document porte déjà « tes évaluations devront le vérifier » (bulle 4) et « ton plan de cours le précisera » (bulle 6) : elles sont codées ainsi dès ce lot.

Règles de la nuit qui touchent ce lot : les mots sont à Grégoire (un mot qui ne tient pas techniquement se signale au rapport, il ne se remplace pas) ; quand une consigne dit « Cowork tranchera » ou « arrête-toi », la mesure et ce qu'elle bloque vont au rapport, sans code ni texte inventé ; aucune fusion vers `main`, aucune release, aucun bump, rien au changelog ; le commit qui ouvre le parcours dans `PARCOURS_OUVERTS` reste sur la branche, à part, à annuler avant toute fusion ; ne pas toucher aux branches de la session A ni à `js/parcours-classe.js`, `js/parcours-recevoir.js`, `js/parcours-donnees.js`.

## Le relais, mot pour mot

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
