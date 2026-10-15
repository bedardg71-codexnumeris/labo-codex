# Demande de relecture – les mots décidés (#821, #1017), les équipes (#1041), les textes à relire

> Écrite par Claude Code le 15 octobre 2026 à 13 h 57 (Toronto, mesuré par `date`), sur `CONSIGNE-LOT-2026-10-15-mots-equipes-textes.md`. Pour Cowork.
> Rien n'est poussé, aucune release, aucun verdict Playwright : on attend le signal du soir.

## Les commits

| Commit | Partie | Ce qu'il fait |
|---|---|---|
| `a43513d7` | A1 | #821 : les mots du mécanisme 2, la phrase des deux observations pour 3 et 4, le dégradé sans mot |
| `5160ac68` | A2 | #1017 : « Exporter les travaux », « Garder l'original » |
| `cae3178a` | A3 | #1041 : au plus une personne de plus par équipe |
| `e17be181` | A1 | la phrase sous le badge sort dans une fonction (cliquet de complexité 34 → 35 évité, 31 reporté) ; cliquet #616 reporté |
| `1668e8fe` | A1 | cliquet #467 : 111 → 112, sans désescape (une couleur, aucun nom) |
| `caad371e` | B | `TEXTES-A-RELIRE-2026-10-15.md`, décisions des groupes 6 à 8, la consigne |
| `ca979bed` | C | BACKLOG : les lignes des décisions ; #821, #1017, #1041, #2, #33, #273, #837 cochées |

Vitest complet : voir la dernière section. Les cinq specs Playwright retouchées pour A2 (`aide-exporter-archiver-893`, `nettoyage-sans-perte-892`, `carrousel-881`, `eleve-supprime-masque-1013`) n'ont **pas** été lancées : elles iront au verdict du soir.

## A1 – #821

**Fait.** `js/contexte-qualification.js` : un seul vocabulaire, les cinq paliers du mécanisme 2 (`MOTS_PRESENCE`, `MOTS_REMISE`, mots de 11 h 38 tels quels) ; `decrireContexte(A, C)` écrit « Absences rares, quelques travaux manquants » ; le mécanisme 3 garde son palier (`niveau`), son badge et sa couleur, son `label` est cette phrase ; le mécanisme 4 garde ses neuf branches (nouveau champ `code`), sa couleur, et son `niveau` est la même phrase, sauf « Décrochage ». La carte Mobilisation choisit sa prose par `code`. Le dégradé de l'Aperçu n'a plus de mot (légende, bulle, fenêtre d'aide, glossaire : phrases au § 6b des textes). Les `description` qui jugeaient sont retirées.

**Mesuré.** Aucune borne, aucune couleur ne bouge (sentinelle 821a). Rien ne sort vers les élèves : les seuls lecteurs sont le profil (écran enseignant) et `determinerCibleIntervention` (`profil-etudiant-calculs.js`, lit `code === 'decrochage'`). Break-test : trois mutations (proportion glissée par ×100/÷100, un mot remis sur la légende, la prose relue par l'ancien mot), trois rouges.

**Supposé, à confirmer.** Les mots des mécanismes 3 et 4 suivent les seuils RÉGLABLES du mécanisme 2 (85 / 80 / 70, plus la borne fixe 60), alors que le badge du 3 et la couleur du 4 suivent leurs bornes fixes. Conséquence : à A = 76 %, le badge est vert (palier « favorable », ≥ 75) et la phrase dit « Quelques absences » (sous 80). C'est la proposition de Cowork, éprouvée telle quelle ; rien n'est caché, mais l'écart se voit.

**Les recommandations attachées, non réécrites (à relire par Grégoire) :**
- Carte « Contexte d'apprentissage » (`qualifierContexteApprentissage`) : paliers « très favorable » et « favorable » : « Les interventions peuvent se concentrer sur le développement des habiletés et compétences. » ; « modéré » : « Suivi régulier recommandé pour maintenir l'engagement et éviter une baisse de performance. » ; « fragile » : « Interventions recommandées : Rencontrer l'étudiant·e pour comprendre les absences/non-remises, encourager la mobilisation, vérifier s'il y a des obstacles (emploi, santé, etc.). »
- Carte « Mobilisation » (`genererSectionMobilisation`), la prose sous la phrase, par branche : « L'étudiant ne se présente plus au cours… » (décrochage) ; « Situation critique : présence ET remise des travaux sous 70%. Intervention RàI niveau 3 immédiate requise. » ; « Assiduité critique (< 70%). La présence irrégulière compromet l'apprentissage… » ; « Complétion critique (< 70%). Les travaux ne sont pas remis… » ; « Les deux composantes (A et C) sont entre 70-80%. Soutien proactif recommandé… » ; « L'assiduité est entre 70-80%… » ; « La complétion est entre 70-80%… » ; « Excellent engagement comportemental… » ; « Engagement comportemental satisfaisant… ». Puis les blocs « Actions requises », « Recommandations d'intervention (niveau critique) », « Recommandations préventives (niveau fragile) », dont les puces portent encore « Assiduité critique : », « Mobilisation fragile : », « Assiduité fragile : », « Complétion fragile : ».
⚠ Ces textes portent encore les mots qui jugent (« critique », « fragile », « Excellent engagement »). La décision les laisse à la relecture ; ils se lisent juste sous la nouvelle phrase.

**Trouvailles (issue 2, proposées, rien d'inscrit : aucun symptôme vécu) :**
1. Le réglage des seuils (Labo › Outils d'observation, `index.html` l. 8900-8916) nomme ses bornes « Fragile si inférieur à », « Acceptable si inférieur à », « Bon si supérieur ou égal à », et des tableaux de l'Aide (`index.html` l. 12783, 12789, 12959, 13110, 13140, 13295) gardent l'ancien vocabulaire. Ce sont des mots d'écran : à Grégoire, si le « vocabulaire unique » doit s'y étendre.
2. Issue 3 (code mort, sans conséquence) : `genererSectionCompletion` et `genererSectionAssiduiteLegacy` (`profil-etudiant-sections-affichage.js`) n'ont aucun appelant ; les variables `interpA` (l. 394), `interpC` (l. 467) et `interpM` d'`afficherProfilComplet` ne sont lues nulle part.

## A2 – #1017

**Fait.** Menu (`js/config.js`, le seul libellé autorisé), titre de l'écran, aide d'`index.html`, fiche d'aide `archiver-travaux`, guide de la démo, infobulles ; le ZIP n'est plus « l'archive » (« Compresser le ZIP », « Compression du ZIP… », « l'export de tout le groupe ») ; jetons : « Garder l'original », notification « Jeton de reprise appliqué (original gardé) », aide des jetons accordée. Aucune clé, aucun champ, aucun identifiant (`archiver-travaux`, `travaux-archivage-*`, `value="archiver"`, `dateArchivage`) renommé.

**Phrases dont le sens change au-delà du mot (à toi, Cowork) :**
1. Guide de la démo (`js/guidage-demo.js` l. 57) : « Exporter les PDF annotés aux étudiants et archiver le semestre. » → « Exporter les PDF annotés aux étudiants. » (l'écran n'archive aucun semestre).
2. Infobulle du sous-onglet (`nav-eval-exporter`, `accompagnement-contenu-hover.js`) : « Exporte les PDF annotés aux étudiant·es, archive le trimestre et allège le stockage. » → « … aux étudiant·es et allège le stockage. »
3. Infobulle `travaux-archivage-production` : « Pratique pour archiver une évaluation complète. » → « Pratique pour garder une copie d'une évaluation complète. »

**Laissé, à trancher :** d'autres textes des jetons disent encore « l'originale » au féminin, sans le mot « archiv » : « Originale restaurée », « La reprise (…) sera supprimée et l'originale (…) sera restaurée. », « Reprise supprimée, originale restaurée » (`evaluation-jetons.js` l. 726, 765, 785), et l'étiquette « Évaluation originale : » au-dessus de « Garder l'original ». Les accorder sur « l'original » ? Hors de la lettre de la décision.

## A3 – #1041

**Fait.** `agrandirPlafonne(n, taille)` : vrai quand le reste dépasse le nombre d'équipes complètes ; alors « plus grandes » rend la même chose que « plus petites ». 7 en 4 → 4 et 3 ; 11 → 4, 4 et 3 ; 10 → 5 et 5. **Un autre cas change** : 5 en équipes de 3 → 3 et 2 (avant : une équipe de 5). Inchangés : moins qu'une équipe, division exacte, équipes de 2 avec un reste de 1. Banc `equipes-1041-une-personne-de-plus` (3 mutations, 3 rouges) ; `equipes-1039` ne fige plus « 7 ».
**La ligne d'écran** (sous l'option, seulement quand le plafond joue) : « Au plus une personne de plus par équipe : il en reste trop, une équipe sera de 3. » Posée comme brouillon, soumise à Grégoire au § 6c des textes.
**Source, pas stock** : les équipes déjà formées ne sont pas refaites.

## B – les textes

`plans de travail/TEXTES-A-RELIRE-2026-10-15.md`, six blocs. Points « À trancher » qu'il porte : cinq boutons « Tout importer » et non deux (même bulle proposée pour les trois autres) ; « Construction de la note » lue comme l'assistant de pratique, pas l'encadré d'`index.html` l. 5855 ; deux bulles non vérifiées à fond (« Forfaits », « Récapitulatif ») ; pour l'EUF, la ligne du service sur toutes les copies ou seulement « Risqué » et « Échec », et l'arrondi de la projection.
**Trouvaille du texte 3 (issue 2, à toi)** : dans l'assistant de pratique, « Nombre d'évaluations » (`nbEvaluationsPrevues`) n'a pas de lecteur visible, et « Tes seuils personnels » annonce servir au dépistage alors que `va_bien` et `difficulte` ne sont lus que par `interpreterNiveau` (`pratique-configurable.js` l. 795), sans appelant. Aucune bulle proposée pour ces deux étapes.

## C – le BACKLOG

Lignes posées sous #810, #33 (groupe 5), #1041, #837 (groupe 6), #781, #591, #840, #273, #2 (groupe 7), #1017, #364, #18 (groupe 8) ; celle de #821 y était déjà. Cochées : #2, #33, #273, #837 (closes par décision), #821, #1017, #1041 (faites sur `main`, non poussées, avec une ligne « Fait le 15 oct. » qui dit comment c'est vérifié). Aucun numéro neuf.

## La ligne des Nouvelles (proposée)

> Au profil d'un élève, la présence et la remise se disent maintenant en mots qui décrivent ce qu'on observe (« Absences rares, quelques travaux manquants »), sans juger. « Exporter et archiver » devient « Exporter les travaux », et la reprise garde « l'original ». En Animation, « Des équipes plus grandes » n'ajoute plus qu'une personne par équipe.

## Vitest

Lancé depuis `tests/` sur `ca979bed` : **759 fichiers, 8 826 essais, tous verts** (42,9 s), aucune ligne `Errors` ni `Unhandled`. Le premier passage complet, après A, avait donné deux rouges (cliquets de complexité et #616, causés par A1) puis un troisième au second passage (cliquet #467) : corrigés par `e17be181` et `1668e8fe`, raisons dans les commits.
