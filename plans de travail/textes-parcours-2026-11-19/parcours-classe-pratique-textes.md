# Parcours « Mettre ta classe en place », « Nous faisons » (Pratique guidée) : bulles réécrites avec Grégoire (19 nov. 2026)

Ouvert le 19 nov. 2026 à 8 h 13 par la conversation du Projet ouverte à 8 h 08, pendant que deux instances de Claude Code travaillent (sur le Mac, la mise en ligne de midi ; dans le cloud, la grille d'autoévaluation). Choisi par Grégoire à 8 h 10, sur la recommandation de Cowork : pour le 30 nov., il faut les deux temps dans chaque parcours ; aucun « Nous faisons » n'est encore réécrit dans le ton de la carte « À propos » ; ce parcours a fixé le moule de « Je regarde », il fixe celui du deuxième temps ; il ne dépend pas des descripteurs. « Je regarde » de « Lire ta classe et intervenir » vient après (il repose sur l'exemple d'« Évaluer », en pause).

**Base.** Les huit étapes de la Pratique guidée telles qu'elles sont dans le code (`js/parcours-classe.js`, `ETAPES`, lues sur `origin/claude/ecstatic-brown-urn6v8` = `ebc9a9a` le 19 nov. à 8 h 12) : Ton trimestre ; Ton cours ; Ton profil ; Ta classe ; Ton horaire ; Ton groupe-cours ; Prendre les présences (avec sa variante d'avant la première séance) ; Ta classe d'un coup d'œil. Leurs textes viennent de l'essai du 14 nov. (`claude/essai-parcours-2026-11-14.md`), validés pour la plupart. La forme à suivre : celle de « Je regarde » (`claude/parcours-classe-modele-textes.md`) et les règles de `areas/parcours-assistes.md` (objectif à la première bulle avec un verbe de Bloom ; « Tu es dans… » avec la section ; confirmation « C'est fait : … » au-dessus du titre, en petit, à partir de la bulle 2 ; explications sans tiret, seuls les gestes marqués ; rappel de l'objectif atteint à la dernière bulle ; la phrase de la poignée, posée par le moteur, dans la première bulle). En « Nous faisons », pas de « Remplir » : la personne remplit elle-même (« c'est le geste qui fait que c'est mémorisé »), et jamais de donnée inventée sur de vrai·es étudiant·es.

**Présentation des lignes (règle de Grégoire du 18 nov., 14 h 10, rappelée par lui le 19 nov. à 10 h 39).** La confirmation « C'est fait : … » au-dessus du titre, en petit ; les explications sans tiret ni marque ; seuls les gestes sont marqués : une flèche (→) pour un geste à faire, un crochet quand il est fait. Dans ce document, les bulles sont montrées à leur ouverture : tous leurs gestes portent la flèche. Les bulles 1 à 6 ont d'abord été montrées à Grégoire avec un tiret devant les gestes (repris des textes du 14 nov.) ; corrigé ici, mots inchangés. Dans le code, chaque ligne dit si elle est un geste (`champs`, `consigne`) ou une explication (`note`) ; c'est ce classement que le relais doit respecter.

Noms des sections du Cadre (lus dans `index.html`) : « Trimestre », « Cours et services », « Enseignant·e », « Groupe d'étudiant·es », « Horaire », « Groupe-cours ».

## Bulle 1 (validée par Grégoire le 19 nov. à 8 h 13 : « C'est bien »)

**Ton trimestre** · 1 sur 8

À la fin de ce parcours, tu seras en mesure de mettre ta propre classe en place, du trimestre jusqu'aux présences d'une séance.

Tu es dans « Cadre », à la section « Trimestre » : c'est là que tu donnes les dates de ton trimestre.

Cette fois, c'est ta propre classe : ce que tu crées ici reste dans ton application.

Aie sous la main le calendrier scolaire de ton collège.
→ Choisis la session et l'année (elles serviront à identifier ton trimestre)
→ Donne trois dates (elles serviront à bâtir ton calendrier de séances) : le début du trimestre · la fin des cours réguliers · la fin du trimestre
→ **Touche « Créer le trimestre »**

Le reste du formulaire peut attendre.

(Puis la phrase de la poignée, posée par le moteur : « Tu peux déplacer cette bulle par sa poignée et faire défiler la page pour mieux voir. »)

Nouveau par rapport au 14 nov. : l'objectif (« mettre en place », verbe d'application, là où « Je regarde » dit « expliquer ») ; la ligne du lieu (pour le moteur : `lieu`, `section: sectionDuCadre('trimestre')`, `nommeLaSection`, `lieuSuite: ": c'est là que tu donnes les dates de ton trimestre."`) ; la phrase « Cette fois… ». Le reste, mot pour mot celui du 14 nov. Objectif atteint, pour la dernière bulle (forme supposée d'après « Je regarde », à confirmer avec elle) : « Objectif atteint : tu es en mesure de mettre ta propre classe en place, du trimestre jusqu'aux présences d'une séance. »

## Bulle 2 (validée par Grégoire le 19 nov. à 9 h 20, avec sa retouche de la dernière ligne)

C'est fait : ton trimestre est créé. (en petit, au-dessus du titre)

**Ton cours** · 2 sur 8

Tu es dans la section « Cours et services » : c'est là que tu dis quel cours tu donnes.

Aie sous la main ton plan de cours.
→ Le code du cours (ex. : 601-101-MQ)
→ Sa pondération (elle servira à calculer tes heures de cours)
→ Sa discipline (elle servira à identifier le matériel que tu partageras)
→ **Touche « Créer le cours »**

Tu donnes plusieurs cours ? Crée-en un seul pour l'instant : tu ajouteras les autres après ce parcours.

Nouveau : la confirmation ; la ligne du lieu (`lieuSuite` repris de « Je regarde ») ; la dernière ligne. Celle-ci remplace « Tu donnes plusieurs cours ? Un seul suffit pour l'instant. » : Grégoire a proposé à 9 h 19 « Complète un seul pour l'instant. Tu pourras faire les autres ensuite. » (une consigne plutôt qu'un constat) ; Cowork a gardé son ton en rendant la condition (sans elle, « les autres » ne renvoie à rien pour qui donne un seul cours) et « après ce parcours » (dit quand revenir) ; accepté à 9 h 20 (« oui, c'est mieux »).

## Bulle 3 (validée par Grégoire le 19 nov. à 9 h 22 : « c'est ok »)

C'est fait : ton cours est créé. (en petit, au-dessus du titre)

**Ton profil** · 3 sur 8

Tu es dans la section « Enseignant·e » : c'est là que tu dis qui donne le cours.

→ Ton prénom et ton nom (ils paraîtront au bas des PDF que tu remettras à tes étudiant·es)
→ Ton courriel et ton institution (ils accompagnent les ressources que tu partageras)
→ **Touche « Créer le profil »**

Le reste du formulaire peut attendre.

Nouveau : la confirmation ; la ligne du lieu (`lieuSuite: ": c'est là que tu dis qui donne le cours."`) ; la parenthèse du nom, qui remplace « ton groupe-cours doit savoir qui le donne » (notion vue seulement à la bulle 6 ; ce qui la remplace est mesuré, voir « Faits mesurés »).

## Bulle 4 (validée par Grégoire le 19 nov. à 9 h 35 : « oui, bien vu ! »)

C'est fait : ton profil est créé. (en petit, au-dessus du titre)

**Ta classe** · 4 sur 8

Tu es dans la section « Groupe d'étudiant·es » : c'est là que tu apportes la liste de ton groupe.

Aie sous la main la liste de ton groupe, tirée du système de gestion scolaire de ton collège.
→ Colle ta liste, copiée de ton tableur, ou choisis un fichier .csv. Une ligne par personne :
  · son DA (il l'identifie partout dans l'application)
  · son numéro de groupe (il servira à ton horaire et à ton groupe-cours)
  · son nom et son prénom
→ Vérifie l'aperçu
→ **Touche « Importer »**

Nouveau : la confirmation ; la ligne du lieu (`lieuSuite` repris de « Je regarde » : ": c'est là que tu apportes la liste de ton groupe.") ; la ligne du document et la première ligne de geste, qui disaient « dans Léa, sur Omnivox : format Excel » et « Colle ta liste ou choisis ton fichier » : le choix de fichier n'accepte pas un fichier Excel (voir « Faits mesurés ») ; plus de noms de produits (règle du 15 nov.), les mots de « Je regarde » (« système de gestion scolaire »), « tableur » comme « traitement de texte ».

## Bulle 5 (validée par Grégoire le 19 nov. à 10 h 34 : « Oui », avec sa précision)

C'est fait : tes étudiant·es sont importé·es. (en petit, au-dessus du titre)

**Ton horaire** · 5 sur 8

Tu es dans la section « Horaire » : c'est là que tu dis quand ton groupe se rencontre.

Aie sous la main ton horaire.
→ Choisis le groupe (l'horaire lui sera lié)
→ Nomme l'horaire (ex. : Lun-Mar)
→ Choisis le nombre de séances par semaine (des heures consécutives avec un même groupe comptent pour une seule séance)
→ Pour chaque séance : le jour, le début et la fin (le nombre de périodes s'écrit d'après ces heures ; corrige-le au besoin)
→ **Touche « Créer l'horaire »**

Nouveau : la confirmation ; la ligne du lieu (`lieuSuite` repris de « Je regarde » : ": c'est là que tu dis quand ton groupe se rencontre.") ; la ligne des séances par semaine, qui manquait (le menu `v2-hor-nbSeances` est à 2 par défaut ; qui donne ses heures d'un seul bloc doit le changer). Sa parenthèse : Cowork proposait « un bloc de 4 heures compte pour une seule séance » ; Grégoire a précisé à 10 h 33 « 4 heures consécutives avec un même groupe » ; Cowork a retiré le chiffre (propre à la littérature ; un laboratoire peut durer 3 heures ; règle du 21 oct.) ; accepté à 10 h 34. Ligne à griser quand le menu a été touché ? Le menu naît avec un défaut : comme le jour et les heures, rien ne dit que la personne l'a regardé ; supposé par Cowork : elle ne se grise pas (à trancher par Claude Code selon ce que le moteur sait faire, et à dire).

## Bulle 6 (validée par Grégoire le 19 nov. à 10 h 36, avec sa retouche « tu assembles »)

C'est fait : ton horaire est créé. (en petit, au-dessus du titre)

**Ton groupe-cours** · 6 sur 8

Tu es dans la section « Groupe-cours » : c'est là que tu assembles ce que tu viens de créer.

Un groupe-cours, c'est une classe : un cours, un groupe, un horaire, un·e enseignant·e. C'est à lui que se rattachera tout ce que l'application gardera : présences, productions, évaluations.

→ Ton cours
→ Ton numéro de groupe
→ Ton horaire
→ Toi, comme enseignant·e
→ **Touche « Créer le groupe-cours »** (il apparaîtra dans l'en-tête de l'application)

La pratique de notation peut attendre.

Nouveau : la confirmation ; la ligne du lieu (`lieuSuite: ": c'est là que tu assembles ce que tu viens de créer."` ; Grégoire, 10 h 36 : « tu assembles » au lieu de « tu réunis », le verbe de la page elle-même, « Assemble un groupe-cours », `index.html` l. 7159) ; les deux phrases qui disent ce qu'est un groupe-cours, reprises de « Je regarde » (la personne qui commence par « Nous faisons » rencontre le mot ici pour la première fois) ; la ligne « Réunis ce que tu viens de créer : » retirée (elle redisait le lieu). Les quatre lignes de geste gardent leurs champs (`v2-gc-cours`, `v2-gc-groupe`, `v2-gc-horaire`, `v2-gc-enseignant`) et se grisent une à une ; rien n'y est présélectionné (décision du 14 nov. : le geste s'apprend).

**À faire dans « Je regarde » aussi (décidé par Cowork, dit à Grégoire à 10 h 37)** : la bulle 5 de « Je regarde » (« Un groupe-cours ») dit « c'est là que tu réunis ce que tu viens de créer » ; elle passe à « tu assembles », pour que les deux temps parlent pareil. À mettre au relais.

## Bulle 7 (validée par Grégoire le 19 nov. à 10 h 41 : « C'est très bien »)

C'est fait : ton groupe-cours est créé. La mise en place est terminée. (en petit, au-dessus du titre)

**Prendre les présences** · 7 sur 8

Tu es dans « Suivi », à l'onglet « Présences ». Ce qui suit, tu le referas à chaque séance, tes étudiant·es devant toi.

Tu prends déjà les présences ; ici, chaque séance s'ajoute à la mémoire de ta classe.

→ Choisis une séance déjà donnée, ou celle d'aujourd'hui (l'application propose la plus récente)
→ Note seulement les absences et les retards (tout le monde est présent par défaut)
→ **Touche « Verrouiller la saisie »** (c'est ce qui dit à l'application que cette séance a eu lieu)

Nouveau : la confirmation (reprise de la bulle 6 de « Je regarde ») ; la phrase du lieu avec « Ce qui suit, tu le referas à chaque séance, tes étudiant·es devant toi. » (remplace la note du 14 nov. « Ta classe est en place. Ce qui suit, tu le referas à chaque séance. », que la confirmation dit déjà) ; la phrase sur la mémoire de la classe, reprise de « Je regarde ». Les trois gestes : mot pour mot ceux du 14 nov. C'est en présentant cette bulle que Grégoire a relevé (10 h 39) que les maquettes portaient des tirets au lieu des marques de sa règle du 18 nov. (voir « Présentation des lignes »).

## Bulle 7, variante d'avant la première séance (validée par Grégoire le 19 nov. à 10 h 44 : « C'est bien, on continue »)

C'est fait : ton groupe-cours est créé. La mise en place est terminée. (en petit, au-dessus du titre)

**Prendre les présences** · 7 sur 8

Tu es dans « Suivi », à l'onglet « Présences ».

Ta première séance n'a pas encore eu lieu. Reviens après l'avoir donnée : le parcours reprendra ici, avec ta première saisie de présences.

En attendant, tu peux préparer tes grilles d'évaluation dans « Conception ».

→ **Touche « D'accord »**

Écrite par Claude Code le 14 nov. (`LIGNES_7_AVANT`), jamais vue par Grégoire avant ce jour. Changé : la forme (deux explications sans marque, un seul geste) ; « tes outils » devient « tes grilles d'évaluation » (« outils » ne dit rien à qui découvre l'application).

## Bulle 8 (validée par Grégoire le 19 nov. à 10 h 46 : « C'est très bien, merci »)

C'est fait : la séance est verrouillée. (en petit, au-dessus du titre)

**Ta classe d'un coup d'œil** · 8 sur 8

Tu es dans « Suivi », à l'onglet « Groupe ». Reviens-y avant chaque séance.

Chaque point blanc est un·e de tes étudiant·es. La bande « Assiduité » le place selon ses présences : plus il glisse vers la gauche, plus les absences s'accumulent.

Ce point à l'écart, c'est l'absence que tu viens de noter. (ou, si aucune absence ni retard n'est noté dans son groupe à la séance qu'il vient de verrouiller, `absenceNotee` : « Tout le monde était là : un point s'écartera à la première absence. »)

Les bandes « Complétion » et « Performance » sont vides : elles s'allumeront à tes premières évaluations.

Séance après séance, tu verras qui s'éloigne, sans attendre une main levée.

(filet) **Objectif atteint : tu es en mesure de mettre ta propre classe en place, du trimestre jusqu'aux présences d'une séance.** (filet) — posé par le moteur (`objectifAtteint` sur la définition, comme `DEF_MODELE`).

Chaque parcours a son objectif. C'est toi qui choisis la suite.
Pour revoir une étape, touche « 8 sur 8 ».

→ **Touche « Parcours suivant », ou « Terminer ».** (la consigne de fin que le moteur dit déjà quand la bulle offre les deux boutons, relais du 14 nov.)

Boutons : « Parcours suivant » et « Terminer », de même poids (décision du 14 nov., 10 h 58, pour la fin d'une Pratique guidée).

Nouveau : la confirmation ; tout est explication (aucune marque) sauf la consigne de fin ; la fin reprise de « Je regarde » (l'objectif atteint entre deux filets, « Chaque parcours a son objectif… », « Pour revoir une étape… ») ; « La bande « Assiduité » le place selon ses présences : à droite, il vient à ses cours ; s'il glisse vers la gauche, ses absences s'accumulent » devient « …selon ses présences : plus il glisse vers la gauche, plus les absences s'accumulent » (« cours » employé pour une séance, contre la règle 6 du 14 nov.) ; la note « Reviens-y avant chaque séance. » rejoint la phrase du lieu, comme dans « Je regarde » ; la phrase « Séance après séance… » reprise de « Je regarde » (sans « Une seule séance et la classe se dessine déjà », qui ne tient pas quand personne n'était absent). Les deux phrases conditionnelles : celles du 14 nov., inchangées.

## État (19 nov., 10 h 46)
Les huit bulles de « Nous faisons » et la variante de la bulle 7 sont validées. Aucun relais n'est parti. Le relais portera aussi « tu assembles » dans la bulle 5 de « Je regarde ».

## À mesurer avant le relais (non fait)
- Si « Nous faisons » sort de la démo avant la bulle 1 (règle 10 : démo et réel ne se mêlent pas) et ce qu'il fait d'un trimestre déjà existant (le parcours saute aujourd'hui les étapes déjà réglées : `premiereNonFaite`, `ETAPES_DU_CADRE`).
- Si le groupe-cours créé devient le groupe actif de l'en-tête (« Je regarde » a une étape « D'un groupe à l'autre » ; « Nous faisons » n'en a pas).

## Faits mesurés en chemin
- Le nom de l'enseignant·e paraît au pied des PDF, à gauche (`js/export-pdf.js`, `obtenirNomEnseignantPDF`, l. 158 ; l'option `piedEnseignant` de l'aperçu du PDF, cochée par défaut, l. 87). Champs obligatoires du profil (`index.html`) : prénom, nom, courriel, institution.
- Le choix de fichier de la liste n'accepte que `.csv`, `.tsv` et `.txt` (`index.html`, `v2-fichierCsvEntree`, `accept`) : un fichier Excel (.xlsx) n'y passe pas. La zone de collage, elle, dit en exemple « Depuis Excel ou Omnivox... » (texte de la page, noms commerciaux : trouvaille hors bulle, à inscrire au relais, issue 2).

- Le formulaire de l'horaire (`index.html`, l. 7055 et suiv.) : « Groupe associé » (obligatoire), « Nom de l'horaire » (obligatoire, exemple « Ex: Lun-Mer 10h »), « Séances par semaine » (menu de 1 à 5, 2 par défaut), le résumé « Format : … », puis une rangée par séance.

## Le relais (remis à Grégoire le 19 nov. à 10 h 55, pour une session du cloud après la release de midi)

Modèle pour les relais des autres « Nous faisons ». Texte remis, mot pour mot :

```
Pour Claude Code, à relayer — parcours 2 (« Mettre ta classe en place »), « Nous faisons » : les huit bulles réécrites. Session du cloud, à lancer APRÈS la mise en ligne du 19 nov. à midi.

Contexte. Les huit bulles de la Pratique guidée (`ETAPES` de `js/parcours-classe.js`) ont été réécrites avec Grégoire le 19 nov., de 8 h 13 à 10 h 46, dans la forme et le ton de « Je regarde » (`ETAPES_MODELE`). Les textes ci-dessous sont validés par lui mot pour mot : ce sont des mots d'enseignant. Un mot qui ne tient pas techniquement se signale au rapport ; il ne se remplace pas.

0. Préalable. Vérifie que la release du 19 nov. est publiée : `origin/main` a avancé au-delà de `03dc7d2f7` et `RELAIS.md` sur `main` dit la release en ligne. Sinon, arrête-toi et dis-le, sans rien créer. Branche : `lot/nous-faisons-classe`, créée depuis `origin/claude/ecstatic-brown-urn6v8` (`ebc9a9a` ou plus récent : elle porte la disposition des bulles du 18 nov., `poserConfirmation`, `secondeForme`), puis `git merge --no-ff origin/main` ; conflits tranchés en gardant les deux côtés, nommés au rapport. Le commit `4c36db4` (parcours rouverts sur la branche) reste : c'est un aperçu. Ne fusionne rien vers `main`.

1. Deux mesures d'abord, au rapport avant tout code. (a) Lancé pendant que la démo est active, « Nous faisons » en sort-il avant la bulle 1 ? Règle de Grégoire : démo et réel ne se mêlent jamais, rien de la démo ne reste dans son trimestre réel. (b) Le groupe-cours créé à la bulle 6 devient-il le groupe actif de l'en-tête, pour une personne qui n'en a aucun et pour une personne qui en a déjà un autre ? Si non, la bulle 7 prendrait les présences d'un autre groupe : arrête-toi là, dis-le, n'ajoute aucune bulle (les textes sont à Grégoire).

2. La forme, pour les huit, avec les mécanismes qui existent déjà (ceux d'`ETAPES_MODELE` et du moteur), sans en inventer d'autres : la confirmation « C'est fait : … » au-dessus du titre, en petit, à partir de la bulle 2, seulement si l'étape d'avant a été faite pendant ce passage (une étape sautée parce que déjà réglée n'a pas de confirmation : décision de Cowork) ; la phrase du lieu (`lieu`, `section: sectionDuCadre(...)`, `nommeLaSection`, `lieuSuite`) ; les explications sans marque (`note`) ; seuls les gestes marqués (flèche à faire, crochet fait) ; l'objectif à la bulle 1 et l'objectif atteint à la bulle 8, posés par le moteur depuis la définition (`objectif`, `objectifAtteint` sur `DEF`, comme `DEF_MODELE`) ; la phrase de la poignée, posée par le moteur. Notation ci-dessous : [C] confirmation, [L] suite de la phrase du lieu, [E] explication, [G] geste ; « inchangé » = le texte actuel d'`ETAPES`, avec ses champs.

(Suivent les textes des huit bulles et de la variante, tels qu'ils sont plus haut dans ce document ; puis :)

3. « Je regarde », bulle 5 (« Un groupe-cours ») : le `lieuSuite` « : c'est là que tu réunis ce que tu viens de créer. » devient « : c'est là que tu assembles ce que tu viens de créer. » (Grégoire : le verbe de la page, « Assemble un groupe-cours »). Rien d'autre dans « Je regarde ».

4. Trouvaille, issue 2 (inscrire, ne pas corriger) : la zone de collage de la liste a pour exemple « Depuis Excel ou Omnivox... » (`index.html`), des noms de produits, contre la règle de Grégoire du 15 nov. (dire « tableur », comme « traitement de texte »).

5. Tests. Les bancs du parcours 2 (`parcours-2-ma-classe`, `parcours-1-et-2`, `sentinelle-parcours-classe`) suivent les nouveaux textes sans s'affaiblir. Un banc neuf vérifie, bulle par bulle, la confirmation (présente après une étape faite, absente après une étape sautée) et le classement geste ou explication, avec break-test. Les trois rouges connus sur `main` (`parcours-1-et-2` test 2, `parcours-2-ma-classe` tests 1 et 5) : rejoue-les sur `main` et dis s'ils le sont encore. Vitest complet ; Playwright Chromium sur les fichiers liés, 1180 × 820 et 820 × 1180 ; WebKit par GitHub au push. Jetons `?v=` neufs pour chaque fichier touché.

6. Porte terrain en markdown (`plans de travail/PORTES-TERRAIN-2026-11-19-nous-faisons-classe.md`), règle 1 : aucune porte quand une machine peut répondre ; Cowork la relira avant d'en publier l'artefact. Commit, push, PR d'aperçu titrée « APERÇU, ne pas fusionner ». Ni fusion ni release. Rapport `plans de travail/RAPPORT-2026-11-19-nous-faisons-classe.md` : les deux mesures, le commit, les bancs et leurs break-tests, toute supposition nommée, l'adresse de l'aperçu.
```

Dans le relais remis, chaque bulle était décrite ligne par ligne avec les marques [C], [L], [E], [G] ; les textes sont ceux des sections « Bulle 1 » à « Bulle 8 » ci-dessus.

## Prochaine étape
Au rapport de la session : le lire, mesurer les textes contre ce document, puis la porte avec Grégoire. Le parcours suivant (« Nous faisons » du parcours 4, « Recevoir les productions ») s'écrit dans une séance neuve de Cowork (consigne remise à Grégoire le 19 nov. à 11 h) : `claude/parcours-recevoir-pratique-textes.md`.
