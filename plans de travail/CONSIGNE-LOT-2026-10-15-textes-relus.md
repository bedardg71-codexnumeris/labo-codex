# Consigne de lot – poser les textes relus par Grégoire (#364, #18, #821, #1041), et ce qu'il a tranché à la relecture

> Écrite par Cowork le 15 octobre 2026 à 15 h 29 (Toronto, mesurée par `date`), d'après les réponses de Grégoire de 15 h 27 sur la page « Textes à relire » (source : `TEXTES-A-RELIRE-2026-10-15.md`). Commite ce fichier avec ton lot.
> **Ordre** : tout de suite ; le texte du plagiat attend la réponse de Grégoire au § 8. Ne modifie ni `CONSIGNE-DU-JOUR.md` ni les autres `CONSIGNE-LOT-*`, mais **commite avec ce lot** les fichiers de Cowork restés hors du dépôt : le verdict ajouté à `CONSIGNE-LOT-2026-10-15-diagnostique.md`, `CONSIGNE-LOT-2026-10-15-aide-plagiat.md`, et tout autre `CONSIGNE-LOT-2026-10-15-*` non suivi.

## Ce qui n'est PAS dans ce lot

- **Bloc 4, l'encadré de l'épreuve uniforme** (#668, lot 6) : Grégoire n'a pas encore répondu. Rien ne se pose.
- **Bloc 5, le bulletin d'une page** (#333) : réponse reçue, mais le bulletin n'existe pas encore ; elle ira au lot qui le construit. Décision à recopier sous #333 : « au bloc 1, le NOM de la pratique seulement, sans sa description (écrite pour les collègues, elle peut être technique) ; le bloc 3 explique en mots d'élève ; la note finale s'affiche à l'entier (décision de 14 h 57, #1076) ».

## À poser tels quels

- **Bloc 1** – l'aide du Comparateur : bouton d'aide, fenêtre, trois termes du glossaire, « une de tes pratiques » (ni « souche » ni « pratique aboutie »).
- **Bloc 2** – l'aide de l'import d'un trimestre à l'autre : le terme « Trimestres séparés », la fenêtre, et la même bulle de « Tout importer » pour les cinq bibliothèques, avec leur nom.
- **Bloc 3** – les bulles de l'assistant de pratique, avec **une correction de Cowork acceptée par Grégoire** : la bulle « Approche d'évaluation » devient « En standards, la note se construit sur le portfolio ; à l'étape suivante, tu choisis quels artefacts comptent. » (l'ancienne disait « pas la moyenne de tous les essais », faux quand le portfolio retient « tous »). Remesure que « Configuration du portfolio » suit bien « Approche d'évaluation » ; sinon, remplace « à l'étape suivante » par « plus loin ».
- **Bloc 6c** – la ligne des équipes : « Au plus une personne de plus par équipe : il en reste trop, une équipe sera de 3. » (le chiffre calculé).
- **Bloc 6a** – aucune phrase sous le badge.

## Ce que Grégoire a changé ou tranché

### Bloc 6b – plus aucun chiffre de repère dans les bulles du dégradé

Ses mots : « Je ne sais pas d'où viennent ces chiffres (30-47,5 %, 47,5-65 %, 65-82,5 %, ≥ 82,5 %) et je ne sais pas ce qui justifie cette précision de la décimale… Je préférerais ne pas les afficher, seulement les commentaires sur A et C. »

- Mesuré par Cowork : ces quatre valeurs sont la barre de 30 à 100 % coupée en quarts (`tableau-bord-apercu.js` ~55), rien de pédagogique.
- La bulle de la légende de l'Aperçu et la bulle « Observer » ne donnent plus aucun chiffre (ni les quatre repères, ni « de 30 % à 100 % ») : elles disent ce que le point représente à partir de A et de C, dans ses mots (« Aucune absence ou presque » … « Absences très fréquentes » ; « Aucun travail manquant ou presque » … « Travaux manquants très fréquents »). Propose la phrase ; Cowork la relit (texte lu par l'enseignant).
- ⚠ Si les repères sont aussi DESSINÉS sous le dégradé (graduations, étiquettes chiffrées), retire les chiffres affichés ; la position des couleurs ne bouge pas (gel d'octobre, aucune borne ne bouge).
- ⚠ Si le dégradé place le point d'après la moyenne (A+C)/2, remonte à Cowork sans rien changer : Grégoire a dit le 15 oct. que cette moyenne est « un reliquat… abandonné » (confrontation, `observation/11-confrontation-prevu-pas-fait.md`, l. 44).

### Bloc 7 – les recommandations des cartes « Contexte » et « Mobilisation » : réécrites, au conditionnel

Ses mots : « L'application ne doit pas être prescriptive. Elle doit parler au conditionnel, du genre : “À la lumière de ces données, il pourrait être pertinent de…” »

- Chaque recommandation garde ses GESTES (rencontrer l'étudiant·e, chercher les obstacles…) et les dit au conditionnel, comme une piste, jamais comme une obligation. Plus de jugement (« critique », « excellent », « fragile ») ni d'injonction (« requise », « immédiate », « doit », « maintenir »).
- Elles s'appuient sur la phrase qui décrit (« Absences rares, quelques travaux manquants »), pas sur un niveau.
- Carte « Contexte d'apprentissage » (`contexte-qualification.js`, `qualifierContexteApprentissage`) et carte « Mobilisation » (`profil-etudiant-sections-affichage.js` ~1681-1693, ~1724-1750), encadrés « Recommandations d'intervention (niveau critique) » et « Recommandations préventives (niveau fragile) » compris : retitre-les aussi, sans « critique » ni « fragile ».
- Mets avant et après dans un tableau de la demande de relecture ; Cowork relit avant le commit final.
- **Le principe vaut pour toute l'application** : liste (sans les réécrire) les autres phrases prescriptives que tu croises (grep : « requis », « immédiat », « doit », « il faut », « Maintenir ») dans la demande, issue 2 ; Cowork en fera une fiche.

### Bloc 8 – le réglage des seuils prend les mots qui décrivent

Labo › Outils d'observation (`index.html` ~8902-8916) : « Fragile si inférieur à », « Acceptable si inférieur à », « Bon si supérieur ou égal à » prennent les mots de la table de l'Aide (lot de l'Aide, 15 oct.), par exemple « Quelques absences sous », « Absences rares sous », « Aucune absence ou presque à partir de ». Mêmes mots qu'à l'Aide, au caractère près. Aucune borne ne bouge, aucune clé ne change.

### Bloc 9 – les deux étapes vides de l'assistant de pratique sont retirées

« Tes seuils personnels » et « Nombre d'évaluations » (`js/wizard-pratique-v2.js` ~527, ~2607) sortent de l'assistant. Les valeurs déjà enregistrées dans les pratiques restent : rien n'est effacé, aucune migration. Remesure qu'aucun lecteur n'existe (`va_bien`, `difficulte`, `nbEvaluationsPrevues`) ; s'il en existe un, remonte à Cowork. Retire aussi le code qui ne sert plus qu'à ces étapes (zéro dette).

## La méthode

Un commit par bloc ou un seul, à toi de voir ; Vitest complet depuis `tests/` ; une sentinelle qui lit les textes posés là où ils vivent (bulles, glossaire, fenêtres) et vérifie qu'aucune bulle du dégradé ne porte de chiffre, break-test. Demande `plans de travail/DEMANDE-RELECTURE-2026-10-15-textes-relus.md` (les phrases de 6b et du bloc 7 à relire, la liste des phrases prescriptives). Propose la ligne des Nouvelles. **Aucun push, aucune release, aucun verdict Playwright avant le signal du soir.** Rapport court à Grégoire, en gestes d'utilisateur.
