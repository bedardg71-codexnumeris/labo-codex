# Demande de relecture – l'Aide face à l'audit du 15 octobre (#1087)

> Écrite par Claude Code le 15 octobre 2026 à 14 h 29 (Toronto, mesuré par `date`), sur `CONSIGNE-LOT-2026-10-15-aide-face-a-l-audit.md` (Cowork, 13 h 51). Pour Cowork.
> Rien n'est poussé, aucune release, aucun verdict Playwright : on attend le signal du soir.

## En bref

Un commit de code, `72f87e6a`, qui ne change que du texte (section Aide d'`index.html`, les trois catalogues, `guides-pedagogiques.js`, un commentaire de `rapport-bug.js`). Les points 1 et 3 à 14 de la consigne sont faits. **Le point 2 (ce que la note fait d'une copie non recevable) ne l'est pas : une famille ne fait pas ce que Grégoire a décidé, je n'ai touché ni au moteur ni au texte de la note** (§ 2).

Toutes les mesures ont été refaites après #821, sur `8532dfe0`.

## 1. Ce qui a changé, point par point

| Point | Où | Ce que dit l'Aide maintenant |
|---|---|---|
| 1 | Carte « Travail NON RECEVABLE » | C : comptée non remise, elle reste dans le total attendu ; exemple 7/9 = 78 % ; tableau « Non (non remis) » ; 2/9 = 22 %. La phrase « comme si cette production n'avait jamais existé dans les attentes » est retirée. |
| 3 | Sept endroits + « Suivi hebdomadaire » du Labo | R, 1-A×C×P, l'échelle à six zones, N et E ↔ P retirés. La carte « Seuils critiques d'alerte » ne garde qu'un renvoi et la première moitié de la règle d'or. La bascule « Détails techniques » (qui montrait la formule de R) n'existe plus dans le code : retirée aussi, aux deux endroits. |
| 4 | Introduction (2 encadrés), carte SOLO, FAQ RàI, glossaire (2 entrées), infobulle `tdb-rai`, terme `niveau-rai`, guide RàI | Une seule phrase : le niveau se décide d'après P, quand la note existe, et d'après le pattern des derniers artefacts (3 par défaut), qui lit tous les critères de la grille de référence sauf « Aucun » ; l'IPB nomme la cible, il ne fixe pas le niveau. Niveau 2 : « Préventif » partout (popup, glossaire, deux cartes). |
| 5 | Carte « Repérer les patterns », carte « Options », guide RàI, infobulle du filtre, encadré des profils d'apprentissage | Non-participation (conditions de #731) et Données insuffisantes / En attente nommés. |
| 6 | Guide ACP, glossaire, infobulle, carte des captures | Seules les séances saisies comptent ; « Séance non saisie » n'entre pas dans A ; A inconnue, un tiret. |
| 7 | « Comprendre les diagnostics automatiques », FAQ des seuils | Une seule table, cinq paliers, bornes et mots lus à la source (§ 3) ; les deux autres tables renvoient à elle ; la FAQ dit « Oui, dans Labo → Outils d'observation ». |
| 8 | Infobulle `entete-signaler-bug` | Ce que porte le rapport, « affiché avant l'envoi » ; « Une action garde le début du texte cliqué : relis le rapport avant de l'envoyer. » Je n'ai **pas** écrit « aucun nom ni DA » : c'est faux (trouvaille 2). |
| 9 | Infobulle `donnees-reinitialiser` | Un codex à part, deux confirmations, « EFFACER ». |
| 10 | Carte « 6. Captures » | Une fois par semaine, à l'ouverture de l'application ; chaque intervention garde l'état des indices de ses élèves au moment où on les y inscrit (`interventions.js:1579`). |
| 11 | Popup et terme `horaire`, deux cartes | Séances de la semaine (1 à 5), jour, heures, nombre de périodes, exigé. |
| 12 | Carte « 7. Collaboration », FAQ appareils | `.lcz` signé ; « Exporter ma config » reste un `.json` ; changer d'appareil passe par le codex (menu Codex). |
| 13 | Terme `bilan-reflexif` | Questionnaire, import des réponses, rapport (score sur 4, signaux forts), auto-réflexion. |
| 14 | Le reste | Dépistage : lit les niveaux, pas le texte (2 cartes). Grille de critères : exemple SRPNF, renvoi à l'entrée SRPNF. Visite : 7 étapes, relancée depuis l'en-tête (glossaire et terme). Mode anonymisé : « Élève 1 », depuis le bouton du masque (glossaire et infobulle ; la carte « Formation » le disait déjà). Langue de code : trois phrases. IDME : « < 65 % », lu dans l'échelle de départ (`echelles.js`, D commence à 65) ; le seuil de 64 % des patterns, lui, est juste et reste. |

**Supposé, à confirmer.** J'ai corrigé deux passages hors de la section Aide, parce que c'était la même phrase fausse dans le même fichier : la note d'aide de l'écran des échelles (`index.html` ~5075, « Incomplet (< 64 %) ») et l'encadré « Profils d'apprentissage » du tableau de bord (patterns). Et j'ai remplacé « Profils des étudiant·es « À risque » ou « Critique » » (tableau du rythme de suivi, Labo) par « au niveau RàI 2 ou 3 » : les deux mots venaient de l'échelle de risque.

## 2. Le point 2 : une famille ne fait pas ce que Grégoire a décidé — remonté

Décision (13 h 47) : une copie non recevable vaut 0 dans la note, sauf si une reprise la remplace ou si la pratique ne retient que les meilleures productions et qu'elle n'en fait pas partie. Mesuré famille par famille, dans le code (aucun banc lancé : c'est une lecture).

| Famille | Ce que fait le code | Conforme ? |
|---|---|---|
| Sommative | La copie verrouillée entre avec sa note (`pratique-sommative.js:74-110`, aucune lecture de l'intégrité). Ses critères passent à « 0 - Aucun » au choix du statut (`evaluation-sauvegarde.js:595-625`), donc 0. | Oui |
| Standards, indice P stocké | **Le P de la note du cours vient du chemin du profil** (`portfolio.js:330-345` → `calculerDetailsNoteFinale`). Ce chemin **écarte** la copie plagiat / IA du portfolio, quelle que soit la sélection, même « tous » ou « récents » (`profil-etudiant-actions.js:203-216`). La terminale, elle, entre à 0 (`_obtenirNoteTerminaleEtudiant`, aucune lecture de l'intégrité). | **Non** pour le portfolio |
| Standards, `calculerPerformance` | Garde la copie à 0 dans le pool ; « meilleurs » l'écarte si elle n'en fait pas partie (`pratique-pan-standards.js:170-215`). Mais ce n'est qu'un repli quand le chemin du profil ne rend rien. | Oui (repli) |
| Spécifications | La copie à 0 compte comme un travail non satisfaisant pour le palier (`_compterTravauxAcceptables`). | Oui, au sens d'un palier |
| Dénotation | La note est le jugement saisi par l'enseignant·e (`_calculerPerformanceDenotation`) : aucune copie n'entre par calcul. | Hors de la règle |
| Reprise | `remplaceeParId` écarte l'originale partout (`evaluationEntreDansLaNote`). | Oui |
| Comparateur | `_evalsProfil` écarte la copie (`comparateur-pratiques.js:166-172`). | À savoir |

**Je n'ai pas réécrit** la ligne « Performance (P) : Exclu du calcul de la moyenne », le tableau « Compte dans P ? », ni « n'est pas une note de 0 % » (carte « Travail NON RECEVABLE ») ni l'infobulle `eval-integrite` : le texte proposé par Cowork serait faux en standards, l'ancien est faux en sommative. **Question pour Grégoire, par Cowork :**
- a) le moteur standards rejoint la décision (le chemin du profil garde la copie à 0, « meilleurs » peut l'écarter) : un lot de moteur, avec banc, et l'Aide prend ensuite le texte de Cowork tel quel ;
- b) l'exception standards est voulue : l'Aide la dit (« en standards, une copie non recevable sort du portfolio ; la terminale non recevable vaut 0 ») ;
- et dans les deux cas, pour la dénotation : « ta note est ton jugement ; la copie n'y entre pas par calcul ».

Le texte de Cowork, à reprendre une fois tranché : « Une copie non recevable vaut 0. Elle compte comme non remise dans la complétion et entre à 0 dans la note, sauf si une reprise la remplace ou si ta pratique ne retient que les meilleures productions et qu'elle n'en fait pas partie. » La moyenne de la Liste des évaluations l'exclut (`liste-evaluations.js` ~594) : la carte le dit déjà (« Moyenne : Complètement exclu »).

## 3. Les phrases neuves à faire relire par Grégoire

Ce sont des mots d'écran que Grégoire n'a pas encore vus. Sens vérifié au code ; les mots sont à lui.
1. **La table unique des seuils** (« Comprendre les diagnostics automatiques ») : « Sous A et sous C, le profil écrit ce qu'on observe de la présence et de la remise. Les mots dépendent de la proportion, selon cinq paliers » ; les cinq rangées (≥ 85 %, 80-84 %, 70-79 %, 60-69 %, < 60 %) avec ses mots du 15 oct. ; « Les bornes de 85 %, 80 % et 70 % sont celles de départ : tu les règles dans Labo → Outils d'observation. La borne de 60 % est fixe. Dans la liste des étudiant·es, les mêmes trois bornes colorent le chiffre de A, de C et de P : bleu, vert, jaune, puis rouge sous la troisième. Ces paliers ne fixent pas le niveau RàI. » ⚠ Lié à la question 8 de `TEXTES-A-RELIRE-2026-10-15.md` (le réglage, lui, dit encore « Fragile », « Acceptable », « Bon »).
2. **Le profil, section « Accompagnement »** (Guide détaillé et « Interpréter le profil ») : les trois cartes décrites telles qu'elles s'affichent (badge qui décrit la présence et la remise, A et C, recommandation, services, Confidentiel ; la carte SOLO ; la carte RàI avec pattern, défi principal et rappel « Mobilisation » sous 75 %), puis l'historique des interventions.
3. **La phrase du niveau RàI** (§ 1, point 4), posée à sept endroits.
4. **Les captures** : « une fois par semaine, ce qui crée un historique pour suivre la progression au fil du trimestre » ; « À l'ouverture de l'application, si la semaine en cours n'a pas encore de capture, une capture est créée pour ses séances déjà passées. Chaque intervention garde aussi l'état des indices de ses élèves au moment où tu les y inscris. »
5. **Le rapport de bogue** : « Une action garde le début du texte cliqué : relis le rapport avant de l'envoyer. »
6. **La FAQ des seuils** : « Ces seuils ne fixent pas le niveau RàI, et les bornes de la carte « Mobilisation » du profil sont fixes. »

**La phrase SOLO, non touchée, à Grégoire** : carte SOLO (`index.html` ~10134), « C'est le niveau qui prédit la réussite dans le cours suivant » — affirmation empirique dont l'appui n'est pas cité.

## 4. Trouvailles, avec leur issue

1. **Écran d'évaluation, au choix de « Non recevable »** (`evaluation-sauvegarde.js:617`) : « Cette évaluation sera exclue des calculs de moyenne. » Faux en sommative depuis la décision de 13 h 47 ; mots que l'enseignant·e lit. → **Issue 2**, à trancher avec le § 2.
2. **Le rapport de bogue peut emporter un nom d'élève.** Le journal des clics garde les 30 premiers caractères du texte de l'élément cliqué (`rapport-bug.js:388-392`) : un clic sur un nom dans une liste l'y écrit, hors mode anonymisé ; le contexte « Cadre » joint aussi `infoCours`. L'audit et la comparaison disaient « aucun nom ni DA ». Le rapport est affiché en entier avant l'envoi (`<pre id="rapportBugTexte">`), d'où la phrase de l'infobulle. → **Issue 2**, Loi 25 : à Grégoire (masquer le texte des clics, ou le passer par `anonymiserNom`).
3. **Les « captures d'intervention » de `snapshots.js` n'ont aucun écrivain** : `capturerSnapshotIntervention` n'est appelée nulle part hors de son fichier ; le compteur « Captures interventions » de Réglages › Données lit `snapshots.interventions`, que rien ne remplit (l'« avant » d'une intervention vit dans l'intervention). À rapprocher de #1049. → **Issue 2** (mesure à faire à l'écran).
4. **« Exporter ma config »** annonce un « ZIP léger » ; il télécharge un `.json` et un `LISEZMOI.txt` (`import-export.js:3980-4020`). → **Issue 2**, mots d'écran.
5. **Le tableau « Seuils de vigilance »** de la carte « 5. Vérification hebdomadaire » donne P < 60 % : aucune borne du code n'est à 60 pour P (le RàI lit 64 et 75). Hors des trois tables du point 7. → **Issue 2**.
6. **Le Guide détaillé du profil** dit « 3 grandes sections » ; le profil en a six (Progression, Développement des habiletés, Engagement, Rapport, Accompagnement, Travaux). Réécrire, c'est de la prose neuve. → **Issue 2** (avec les trous de la comparaison).
7. **L'infobulle `tdb-patterns`** dit que la barre lit « les critères multistructurels » ; le pattern lit tous les critères sauf « Aucun ». Non corrigé : je n'ai pas mesuré ce que la barre compte. → **Issue 2**.
8. **L'en-tête de `rapport-bug.js`** annonçait « 10 dernières actions » ; `MAX_ACTIONS` vaut 20. → **Issue 3**, commentaire corrigé.

Rien de cela n'est inscrit au BACKLOG : aucun symptôme vécu, et la consigne dit « une fiche pour ce lot, rien d'autre ».

## 5. La preuve

- **Sentinelle** `tests/unit/sentinelle-audit-aide-15-oct-ce-que-fait-l-application.test.js`, 33 essais : chaque valeur est lue à sa source (patterns de `identifierPatternActuel` et `determinerNiveauRaiPedagogique`, défauts de `interpretation-config.js`, mots de `contexte-qualification.js`, `MAX_ACTIONS` et `MAX_ERREURS`, étapes de `ETAPES_TOUR`, borne D de `echelles.js`…). Elle vérifie aussi que R, E, l'échelle de risque, le risque d'échec et N ne réapparaissent sur aucune des six surfaces. Toutes ses découpes passent par `tranche()` (cliquet #858).
- **Break-test par ablation** : 54 mutations, une par branche quand l'assertion est une alternative (trois pour l'indice R, deux pour la formule du risque, deux pour le niveau de risque, quatre pour l'horaire, deux pour les captures), et côté code (le niveau qui lirait l'IPB, la fenêtre changée, un défaut changé, un mot changé, une troisième confirmation, SOM qui ne lirait plus la non-recevabilité). **54 rouges**, fichiers restaurés par copie, empreinte vérifiée.
- **Vitest complet** depuis `tests/` : 760 fichiers, 8 859 essais verts, aucune ligne « Errors » ni « Unhandled » (avant les jetons anti-cache, puis relancé sur `72f87e6a`).
- **Source ou stock** : source seulement. L'Aide est du code ; aucune donnée n'est touchée.
- Aucun spec Playwright ne cite un fragment changé (grep des 40 anciens fragments dans `tests/`).

## 6. La ligne des Nouvelles, proposée

> L'Aide dit ce que fait l'application : une copie plagiée compte comme non remise, l'assiduité ne compte que les séances saisies, le niveau RàI et les patterns sont décrits comme l'écran les calcule, et les seuils A et C tiennent dans une seule table, que tu règles dans le Labo.

(Sans le point 2 : à compléter s'il est tranché avant la release.)

## 7. Les trois ajouts du verdict de 14 h 02

Ajoutés à `TEXTES-A-RELIRE-2026-10-15.md` (§ 7 à 9), avec ce qui s'affiche aujourd'hui et une question fermée chacun : les recommandations des cartes Contexte et Mobilisation, le vocabulaire du réglage des seuils, les deux étapes de l'assistant qui ne font rien.

## 8. Suite : la consigne du plagiat (Cowork, 14 h 37) — une ligne de verdict demandée

> Ajouté par Claude Code le 15 octobre 2026 à 15 h 23 (Toronto, mesuré par `date`), sur `CONSIGNE-LOT-2026-10-15-aide-plagiat.md`.

**Le texte famille par famille n'est pas posé : une affirmation ne tient pas.** Remesuré au code, phrase par phrase :

| Famille | Phrase de la consigne | Au code |
|---|---|---|
| Complétion | compte comme non remise | **Tient** (`evaluationNonRecevable`, lot 30) |
| Sommative | vaut 0, sauf reprise ou meilleures productions | **Tient** : critères mis à « 0 - Aucun » au choix du statut (`evaluation-sauvegarde.js:595-625`), la copie entre avec sa note (`pratique-sommative.js:74-110`) ; la reprise l'écarte (`remplaceeParId`). ⚠ Aucune sommative ne retient « les meilleures productions » : cette clause ne joue jamais dans cette famille. |
| Spécifications | compte comme un travail non satisfaisant | **Tient** : note 0 sous le seuil, pas acceptable (`_compterTravauxAcceptables`, `_estTravailAcceptable`, `pratique-pan-specifications.js:777-802`) |
| Standards, portfolio | sort du portfolio | **Ne tient pas en entier.** Vrai en sélection « meilleurs », « récents », « tous » et en hybride provisoire (`_filtrerEvaluationsArtefactsValides`, `profil-etudiant-actions.js:203-216`). **Faux en hybride avec les notes finales cochées pour une obligatoire** : la copie sort des obligatoires comptées, mais l'obligatoire reste au dénominateur (`nombreObligatoiresTotal`, `_selectionnerArtefactsHybride`) ; elle vaut donc 0, comme une obligatoire non remise. |
| Standards, terminale | une terminale non recevable vaut 0 | **Tient** (`_obtenirNoteTerminaleEtudiant` ne lit pas l'intégrité) |
| Dénotation | la copie n'entre pas par calcul | **Tient** (`_calculerPerformanceDenotation` lit le jugement saisi) |

**Question à Cowork, puis à Grégoire si c'est de la pédagogie** : en hybride, une fois les notes finales cochées, une obligatoire non recevable vaut 0. a) C'est voulu : la phrase standards le dit, par exemple « en standards, elle sort du portfolio : la compétence n'est jugée qu'à la reprise. Exceptions : une terminale non recevable vaut 0, et, en mode hybride une fois les notes finales cochées, une obligatoire non recevable aussi, comme une obligatoire non remise. » b) Ce n'est pas voulu : le moteur doit l'écarter du dénominateur (lot de moteur, hors de ce lot).

**Fait dans ce lot** : le point (10) de #1075 au BACKLOG (le nom d'élève dans l'historique des clics du rapport de bogue), sans code. Les six autres trouvailles restent dans cette demande.

**Ligne de verdict demandée** : sur `CONSIGNE-LOT-2026-10-15-aide-plagiat.md` et ce § 8.

## 9. Le texte du plagiat posé, la ligne M retirée, la fiche #1088 (verdicts de Cowork de 15 h 30 et 15 h 53)

> Ajouté par Claude Code le 15 octobre 2026 à 15 h 57 (Toronto, mesuré par `date`).

- **Posé** sur la carte « Travail NON RECEVABLE » : le texte de Cowork avec ses deux retouches (sommative sans la clause des meilleures productions ; standards avec ses deux exceptions). L'exemple chiffré est maintenant présenté comme celui des standards (portfolio retenant les meilleurs), où l'artefact non recevable « sort du portfolio ». Ses chiffres (2 évaluations comptées, 73,3 %) restent justes pour cette famille. Le « principe clé » dit le sort par famille. L'infobulle `eval-integrite` : « Recevable ou non. Une copie non recevable (plagiat, IA non autorisée) compte comme non remise dans la complétion ; dans la note, son sort dépend de ta pratique (Aide › « Travail NON RECEVABLE »). » (elle ne sait pas la pratique : elle renvoie à la carte).
- **Banc** : sentinelle de l'Aide du 15 oct., bloc « famille par famille », 5 essais. Chaque règle est lue à sa source :
  - la mise à 0 des critères ;
  - `calculerPerformance` sans lecture de l'intégrité ;
  - la reprise ;
  - le seuil des spécifications ;
  - le filtre du portfolio, la terminale et le dénominateur hybride (`nombreObligatoiresTotal`) ;
  - le jugement de dénotation.
  - 13 mutations, une par branche et par phrase, **13 rouges**.
- **La ligne M** : « Décomposition de l'indice M : M = (A + C) / 2 » sort de la carte Mobilisation. Le calcul de M reste : il sert encore à l'indicateur « Mobilisation (M) » affiché en tête de la même carte (`profil-etudiant-sections-affichage.js`, « Mobilisation (M) » : `${indices.M}`). **Autres écrans qui affichent M**, sans y toucher : cet indicateur, seul à l'écran. `obtenirCouleurMobilisation` (`etudiants.js`) colorait une colonne Mobilisation qui n'existe pas (6.46 de #1083) : aucun appelant. Noté sous #1083. Essai neuf (sentinelle des textes relus), rouge sous mutation.
- **BACKLOG** : #1088 « L'application ne prescrit pas » (le tableau du § 6 de la demande des textes relus, sans code). Les lignes des blocs 4 et 5 sont recopiées sous #668 et #333, telles qu'écrites dans `DECISIONS-2026-10-15-textes-relus.md` : la ligne de #333 posée plus tôt est remplacée par la leur.
