# Annexe du rapport du neuvième parcours : les vérifications contre le code (9 nov. 2026, nuit)

Relevé d'un agent de vérification en lecture seule, sur la branche `lot/parcours-9-notation-alternative` à a328bb9f (avant le lot). Les numéros de ligne sont ceux de ce point de départ. Le rapport (`RAPPORT-2026-11-09-parcours-9-notation-alternative.md`) en reprend les conclusions et dit ce qui a été corrigé depuis.

# Vérifications du neuvième parcours, contre le code (9 nov. 2026)

Branche `lot/parcours-9-notation-alternative`, HEAD a328bb9f (un commit après 02f7434d, celui de la consigne). Lecture seule : rien n'a été exécuté.
[lu] = vu dans le code. [inféré] = déduit de la lecture, à éprouver au banc ou sur l'iPad.

## Ce qui ne tient pas (à soumettre à Grégoire, avec la phrase proposée)

1. **Étape 2, « le menu « Pratique ouverte » ».** Ne tient pas [lu]. « Pratique ouverte » est le `<label>` du lecteur d'écran, masqué (`menu-selection.js:72`, classe `u-lecteur-ecran`, `styles.css:782`). À l'écran, le menu affiche « Aucune pratique ouverte » tant qu'aucune fiche n'est ouverte (`menu-selection.js:74`, `pratiques-gestion.js:109`). Il est placé entre « Consulter la bibliothèque » et « + Nouvelle pratique » (`index.html:5330-5335`).
   Phrase proposée : « Pour régler ta pratique, ouvre-la : choisis-la dans le menu « Aucune pratique ouverte », à côté de « + Nouvelle pratique ». »

2. **Étape 3, standards : « Dessous, écris combien en retenir, puis à partir de combien de productions évaluées le Suivi montre la performance de ta classe. »** Ne tient pas, sur deux points [lu].
   - Le champ du nombre à retenir est À CÔTÉ de « Mode de sélection » : grille à deux colonnes, `index.html:5626-5645`. Seul le minimum est dessous.
   - Le minimum ne décide pas du moment où le Suivi montre la performance de la classe :
     - La barre P de Suivi › Groupe paraît dès la première évaluation (`tableau-bord-apercu.js:1923, 1973, 2334-2335`).
     - Le seuil (`seuilEvaluationsPourP`, :1819-1825) n'ajoute que « (N évaluations en attente) », et seulement quand aucune moyenne n'est significative (:2350-2356).
     - Ce que fait vraiment le minimum : la case « ≥ Min. » de Suivi › Étudiant·es (`etudiants.js:943-957`, `index.html:7504`) et le «, » ou « Minimum N évaluations requises » du profil (`profil-etudiant-sections-affichage.js:173, 382, 473`). L'Aide le dit déjà ainsi (`index.html:10135`).
     - Le « sept » de la consigne : 7 est bien le minimum de « N meilleures évaluations » (`pratiques-bibliotheque.js:186`), mais il ne cache pas la performance de la classe.
   Phrase proposée : « À côté, écris combien en retenir. Dessous, le minimum de productions évaluées pour qu'une performance soit jugée fiable : sous ce nombre, le profil ne la donne pas, et Suivi › Étudiant·es le signale (« ≥ Min. »). »

3. **Étape 3 avec le modèle « N plus récentes » (offert par la bulle 1).** Défaut de code qui casse le parcours [lu pour le code ; inféré pour l'affichage, selon le comportement standard d'un `<select>`].
   - Le modèle écrit `methodeSelection: 'recents'` (`pratiques-bibliotheque.js:202`).
   - Le menu « Mode de sélection » de la fiche n'a pas d'option `recents` : seulement meilleurs, derniers, tous et hybride (`index.html:5632-5636`).
   - `remplirFormulairePratique` pose la valeur sans la traduire (`pratiques-gestion.js:1258, 1280`). Le menu s'affiche donc vide.
   - Le premier enregistrement de la fiche écrit `getValeurChamp(...) || 'meilleurs'` (:1693-1697). Cela arrive au nombre ou au minimum de l'étape 3, ou à l'« Affichage » de l'étape 4.
   - Résultat : la pratique passe en silence de « plus récentes » à « meilleures ».
   - Disposition proposée : **corriger maintenant** (ça casse le parcours qu'on livre). Le stock déjà basculé chez quelqu'un ne se distingue pas d'un choix délibéré : à assumer et à écrire, pas à réparer.

4. **Étape 3a → 3b : la table des forfaits ne suit pas les types.** Défaut [lu].
   - « + Ajouter un type », le renommage et la suppression d'un type ne redessinent que la liste des types (`pratiques-gestion.js:1965-1989, 1991-2008, 2025-2052`). Ils n'appellent pas `afficherForfaitsMat` (:2054).
   - À l'étape 3b, un type ajouté ou renommé à 3a n'a donc pas sa colonne, ou garde l'ancien en-tête. Ça dure jusqu'à « + Ajouter un forfait » (:2090-2115) ou à la réouverture de la fiche. Le texte « sous chacun de tes types » est alors faux à l'écran.
   - Disposition : corriger dans le lot (une ligne), ou faire redessiner la table par le parcours à l'entrée de 3b.

5. **Étape 4 : « « Note chiffrée » montre les niveaux et les chiffres ; « Niveau de performance » ne montre que les niveaux ».** Tient pour le texte de la rétroaction, pas pour le PDF [lu].
   - La rétroaction générale, celle de la palette et de « Copier », écrit « Note finale : 78 % | Niveau : M » ou « Niveau de performance : M » (`evaluation-retroaction.js:268-291`).
   - La synthèse PDF ne montre la note de la production dans AUCUN des deux modes. Elle donne le « Niveau général », code et libellé (`synthese-retroaction-data.js:669-675`, `synthese-retroaction-rendu.js:490-517`), et les niveaux par critère.
   - Seuls le bloc « Note provisoire » des standards et une grille en points portent des chiffres. En spécifications et en dénotation, le PDF est identique avec l'un ou l'autre choix.
   Phrase proposée (si Grégoire veut l'exactitude) : « « Note chiffrée » ajoute les chiffres à ta rétroaction écrite et, en standards, à la note provisoire ; « Niveau de performance » n'y laisse que les niveaux, les chiffres restant dans l'application. »

6. **Étapes 4 et 6 : « Ton choix vaut pour chaque nouvelle évaluation ».** Tient en partie [inféré, à éprouver au banc].
   - Le choix de la pratique (`cocherOptionsParDefaut`, `evaluation.js:83-108`) n'est posé qu'à trois moments :
     - la première ouverture des palettes sur une copie (`travaux-ui.js:5564`) ;
     - « Consulter » (`evaluation.js:1610`) ;
     - `nouvelleEvaluation` (:138).
   - Il n'est PAS posé dans deux cas :
     - « Actions › Évaluer » SANS copie importée (`_evaluerSansCopie`, `evaluation.js:239-282`). Les radios gardent leur dernier état : « Note chiffrée » à froid, d'après le HTML (`index.html:8411`) ;
     - la copie suivante quand les palettes existent déjà (`travaux-ui.js:5370-5389`).
   - Risque : l'évaluation de l'étape 6 s'enregistre « complet », et l'étape 7 ne montre pas « Niveau de performance ».
   - Disposition : un test WebKit d'abord. Si c'est confirmé, corriger maintenant, car ça casse la suite 6 → 7.

7. **Étape 5 : « Tes évaluations déjà enregistrées gardent leur affichage ; change-le au besoin dans leur palette « Rétroaction ». » Réponse à la QUESTION CLÉ : NON**, l'affichage d'une évaluation verrouillée ne se change pas sans la déverrouiller [lu].
   - Les radios « Note chiffrée » et « Niveau de performance » NE sont PAS désactivées sous le verrou. Seules les cinq cases le sont (`evaluation.js:2308-2320`). On peut donc les toucher, et la rétroaction affichée se régénère.
   - Mais rien ne s'écrit : l'enregistrement automatique s'arrête sur une évaluation verrouillée. La ligne qui le prouve : `evaluation-chargement.js:2414` : `if (evaluations[idx].verrouillee === true) return;`. Le PDF relit le choix ENREGISTRÉ (`synthese-retroaction-data.js:1301-1302`).
   - Il faut : « Déverrouiller », changer, puis « Verrouiller », qui relit l'écran (`evaluation.js:1977`, `evaluation-sauvegarde.js:270`).
   - Autre écart [lu] : « Consulter » rouvre l'évaluation avec le choix ACTUEL de la pratique, pas le sien (`evaluation.js:1605-1611` → `cocherOptionsParDefaut`). La palette annonce donc un affichage que le PDF n'aura pas. Et « Déverrouiller » puis « Verrouiller » sans rien toucher l'enregistre en silence.
   Phrase proposée : « Tes évaluations déjà enregistrées gardent leur affichage. Pour en changer une, ouvre-la (« Actions › Consulter »), touche « Déverrouiller », choisis l'affichage dans sa palette « Rétroaction », puis « Verrouiller ». »

8. **Étape 6 : « Ouvre ensuite la palette « Rétroaction » : sa première ligne rappelle ton choix ».** Ne tient pas tel quel [lu].
   - La première ligne de la palette est la bande « Générale · Spécifique · Bilan », insérée en tête (`travaux-ui.js:5679-5680`). La ligne « Options : … » vient dessous (`index.html:8398-8400`).
   - Sans copie importée, il n'y a pas de palette : le formulaire sans copie montre le même panneau, mais son titre « Rétroaction » est masqué (`index.html:8390-8392`, `u-hide`).
   Phrase proposée : « Dans la palette « Rétroaction », sous « Générale · Spécifique · Bilan », la ligne « Options : … » rappelle ton choix (« … · niveau de performance »). »

9. **Étape 7 (et « À vérifier ») : « Avec « Niveau de performance », le PDF écrit « Niveau de performance : … » ».** Ne tient pas [lu].
   - Le PDF n'imprime jamais la rétroaction générale (`synthese-retroaction-data.js:669-672`, champs du PDF :96-128).
   - « Niveau de performance : » n'existe que dans le texte de la palette (`evaluation-retroaction.js:275`) et dans l'aperçu de révision d'Annoter (`travaux-export-pdf.js:1020`).
   - La phrase validée de la bulle (« la synthèse dit le niveau de la production et de chaque critère, sans chiffre ») est vraie dans les deux modes, à un détail près : les critères portent leur pondération en % (`synthese-retroaction-rendu.js:393-396`).
   Phrase proposée : « … la synthèse dit le niveau de la production et de chaque critère, sans note chiffrée. »

10. **Étape 7 : « avec « Niveau de performance », elle [la note provisoire] ne porte aucun chiffre ».** Tient pour les notes [lu].
    - Ni note, ni moyenne, ni pondération, ni ligne « Note provisoire = … » (`synthese-retroaction-data.js:1506-1527`, `synthese-retroaction-rendu.js:875-899`).
    - Mais il reste des comptes (« Voici les 3 meilleures productions… », « 1 retenue sur 4 possibles ») et des échéances.
    Proposé : « aucune note chiffrée ».
    - Trouvaille : la liste dit « Voici les N meilleures productions que tu as réalisées » quel que soit le mode, y compris « plus récentes » et « toutes » (`synthese-retroaction-rendu.js:828-831`). Ce sont des mots que l'élève lit : à soumettre à Grégoire, inscrire.

11. **Étape 8 : « coche « Notes finalisées » … : la synthèse s'intitule alors « Note finale » et ne montre plus ce qui était à venir ».** Vrai en standards seulement [lu].
    - En standards : `synthese-retroaction-rendu.js:772, 853`.
    - En spécifications et en dénotation, il n'y a pas de bloc de note, donc la synthèse ne change pas. La case ne fait que marquer l'export « final » (`export-resultats-finaux.js:105`). Or la phrase est commune aux trois familles.
    - En hybride, la case change aussi la note : une obligatoire non remise vaut 0 (`profil-etudiant-actions.js:255, 549`).
    Phrase proposée : « Quand tes notes sont arrêtées, coche « Notes finalisées » dans la fiche de ta pratique : l'export les marque « final » ; en standards, la synthèse s'intitule alors « Note finale » et ne montre plus ce qui était à venir. »

12. **Étape 2, technique (consigne : famille lue dans `configuration.type`, normalisé).** Ne tient pas [lu].
    - Les pratiques standards et spécifications, issues d'un modèle ou de « Décrire ma pratique », n'ont PAS de `configuration.type` (`pratiques-bibliotheque.js:76-86, 182-206`, `wizard-pratique-v2.js:2465-2600`). Seule la dénotation le porte.
    - La famille est à la racine, `type` et `pratiques[0]`. C'est ce que lit la fiche (`pratiques-gestion.js:1213, 1232`).
    - Lire comme `designerPratiqueActive` : `configuration.type || type || config.type` (`pratique-registre.js:471`). Ou la valeur de `#mat-pratique-type`.

13. **Étape 2 : « Après « Créer la pratique », aucune pratique n'est ouverte ».** Tient en partie [lu].
    - La nouvelle pratique n'est pas ouverte (`wizard-pratique-v2.js:2641-2697`).
    - Mais une fiche déjà ouverte avant l'assistant le reste : le menu garde `pratiqueEnEditionMateriel`, `pratiques-gestion.js:108`.
    - La condition « fiche d'une pratique alternative ouverte » peut donc être déjà vraie : à viser après l'étape 1, ou sur la pratique créée.

## Ce qui tient

- **Étape 1, ordre** [lu]. L'écran « Partir d'un modèle » montre : N plus récentes, N meilleures évaluations, Modèle sommatif, Modèle simple, Modèle de base.
  - `unshift` sur l'ordre DEN, SPE, SOM, STD-n-meilleurs, STD-n-recents : `pratiques-bibliotheque.js:30-207, 266-274`, lu par `wizard-pratique-v2.js:895-913`.
  - Les pratiques de la bibliothèque personnelle suivent.
  - Nuance : le badge s'affiche « STD · Général », pas « STD » seul (:903-909), et le sommatif porte « SOM ».
- **Étape 1, échelle** [lu]. Le message est mot pour mot « Ce modèle a besoin d'une échelle de performance pour calculer la note. Choisis-la : » (`pratiques-bibliotheque.js:616`), avec le nom du modèle en titre et le bouton « Adopter » (:673-678). La question est posée au clic sur « Créer la pratique » (`wizard-pratique-v2.js:2417`).
  - Nuance : sans aucune échelle dans le trimestre, c'est une autre phrase, et rien n'est adopté (:622, 668-671). La condition d'entrée (une production et sa grille) ne garantit pas d'échelle.
- **Étape 1, « Décrire ma pratique »** [lu]. Le bouton mène à « Comment calcules-tu la note finale ? » (`wizard-pratique-v2.js:171-177, 344-397`).
  - Une dénotation PEUT se créer par ce chemin, avec « Note finale posée, pas calculée (PAN – Dénotation) » (:376, 393), ou par « Je sais déjà ce que je veux » (:222).
  - Elle ne se crée pas par « Je ne suis pas certain·e », dont l'inférence ne mène qu'à la sommative, aux standards ou aux spécifications (:135-138).
  - Le commentaire de `TYPE_BADGES` (:54-55) est donc faux : la consigne demande de le corriger.
- **Libellés de l'étape 1** [lu]. « Créer la pratique » (`wizard-pratique-v2.js:2126`, `index.html:11895`). « + Nouvelle pratique » (`index.html:5334`).
- **Étape 2, nom du modèle** [lu]. Une pratique créée d'un modèle en porte le nom (`wizard-pratique-v2.js:946, 2422`). Le récapitulatif le montre déjà, modifiable (« Nom de la pratique », :1912-1917).
  - Trouvaille [lu] : si l'on choisit un modèle A, qu'on revient en arrière et qu'on prend B, le nom de A reste. `if (!r.nom)` à :946, et « Précédent » ne remet rien à zéro (:1059-1066). À inscrire.
- **Étape 2, « Informations de base »** [lu]. La carte existe, avec le champ « Nom de la configuration » (`index.html:5374-5379`), enregistré au changement (`pratiques-gestion.js:1514-1540`).
- **Étape 3, standards** [lu].
  - « Mode de sélection » et « Hybride (N meilleures + Obligatoires) » existent (`index.html:5629, 5636`). Les descriptions disent « Valorise le progrès » et « l'état actuel de maîtrise » (`pratiques-gestion.js:2651-2656`).
  - La condition de « Productions qui comptent dans la note » est exacte (`pratiques-gestion.js:2875-2895`) : configuration présente, `categories.actif` faux (hybride, ou case « Activer les catégories »), et aucun « Artefact » dans le cours actif (`pratique-registre.js:800-803`). Pour la détecter : `#mat-productions-comptees` visible.
  - Les libellés suivent `motsPoolStd` (`pratique-registre.js:842-871`, `pratiques-gestion.js:2673-2681`).
  - « Chaque réglage s'enregistre dès que tu le changes » : vrai pour tous les champs de la carte. Mode (`pratiques-gestion.js:2692-2705`), nombre et minimum (`index.html:5640, 5645`), cases des productions (:2932-2957), catégories et pondérations (`init-inline.js:897-914`). Au `change`, c'est-à-dire à la sortie du champ.
  - La terminale « compte selon sa pondération » (`pratique-pan-standards.js:226-271`, `profil-etudiant-actions.js:572-609`).
  - Nuance [lu] : en hybride, le calcul lit « Nombre à retenir » du bloc « Sélection » (`profil-etudiant-actions.js:234`). « Productions pour la note finale » est alors sans effet. À inscrire.
- **Étape 3a** [lu].
  - Libellés « Seuil d'acceptabilité (%) », « Types de productions », « + Ajouter un type » (`index.html:5782, 5794, 5800`).
  - L'appariement par nom ignore la casse et les accents, et aussi les espaces, tirets et soulignés. Il compare au code ou au libellé du « Type » (`pratique-pan-specifications.js:87-110`). « Projet », « Laboratoire » et « Examen » sont bien des types (`productions.js:106-121`).
  - « + Ajouter un type » crée « Type N » avec l'identifiant N, qui ne s'apparie à rien (`pratiques-gestion.js:1977-1982`).
  - Trouvaille : l'identifiant vaut le nombre de types plus un. Après une suppression, il peut doubler celui d'un type restant. À inscrire.
  - « Modèle simple » : types « Projet » et « Examen », pas de plancher (`pratiques-bibliotheque.js:78-85`).
  - « Décrire ma pratique » n'écrit ni types ni forfaits (`wizard-pratique-v2.js:2560-2588`).
  - Acceptable si la note ≥ seuil (`pratique-pan-specifications.js:777-807`).
- **Étape 3b** [lu].
  - « Table des forfaits (bundles) », colonnes « Lettre » et « Note (%) » (`index.html:5806`, `pratiques-gestion.js:2064`).
  - Un forfait sans exigence est le plancher (`pratique-pan-specifications.js:72-73, 849-854`). « + Ajouter un forfait » en crée justement un (`travaux: {}`, `pratiques-gestion.js:2103-2108`).
  - Un forfait « à zéro partout » n'est pas le plancher au sens du moteur, mais il est atteint par tous : même effet.
  - Le plus haut forfait dont toutes les exigences sont remplies (:838-848).
  - `CAUSE_AUCUN_FORFAIT_ATTEINT` (:85, 882).
  - Une production d'un « Type » hors de la pratique ne compte pour aucun forfait (:745-752).
- **Étape 3, dénotation** [lu].
  - « Cibles d'apprentissage » (`index.html:5825`) et « + Ajouter une cible » (`editeur-cibles.js:68`).
  - Règle des 59 : `Math.min(note, 59)` tant qu'une cible n'est pas confirmée (`pratique-configurable.js:397-407`). Mot repris dans le panneau du profil (`denotation-saisie-ui.js:97`).
- **Étape 4** [lu].
  - « Affichage de la note dans la rétroaction », « Note chiffrée », « Niveau de performance » (`index.html:5565-5571`).
  - `cocherOptionsParDefaut` lit `affichageNote` à la racine (`evaluation.js:96-98`), là où la fiche l'écrit (`pratiques-gestion.js:1670-1672`).
  - Une évaluation enregistrée garde le sien en base. Mais voir le point 7 pour ce que montre l'écran.
  - Une production en points garde ses chiffres (`synthese-retroaction-data.js:1300`, `evaluation-retroaction.js:269-273`, `synthese-retroaction-rendu.js:464-473`).
- **Étape 5** [lu].
  - « Appliquer au cours actif », au bas de la fiche (`index.html:5978-5980`).
  - La frise : « Groupe-cours » passe de « à activer » à « active » (`pratiques-gestion.js:1107-1108`), si la préférence « Afficher les chaînes d'étapes » n'est pas décochée (`chaine-etapes.js:25`).
  - Le menu ajoute « (active) » (`pratiques-gestion.js:101`).
  - La bande du groupe-cours est centrée sous la navigation (`index.html:3823-3828`).
  - Les notes déjà attribuées ne bougent pas (`pratique-manager.js:64-99`).
- **Étape 6** [lu].
  - « Évaluer » n'est offert que pour une ligne non évaluée, dans le menu « Actions... » (`liste-evaluations.js:1753-1755, 1840`).
  - Le pli des options est fermé à chaque ouverture (`travaux-ui.js:5375, 5656`, `evaluation-retroaction.js:572-575`).
  - Le résumé rend « Options : tout inclus · niveau de performance » (`evaluation-retroaction.js:551-562`, libellés `index.html:8404-8412`).
  - « Verrouiller » est en haut de « Paramètres » (`index.html:8218-8228`).
- **Étape 7** [lu].
  - « Dossier PDF » n'est offert que pour une ligne au statut « evalue » : brouillon compris, mais ni non recevable, ni remplacée (`liste-evaluations.js:1777-1780`).
  - Il donne le dossier annoté, ou la synthèse seule sans copie, ou quand la copie est aux archives (#912 : `travaux-export-pdf.js:832-846`). Fichier `dossier_…` ou `synthese_…`.
  - Bloc « Note provisoire » (`synthese-retroaction-rendu.js:756`) avec « Productions à venir : » (:872). Il paraît dès une évaluation du pool VERROUILLÉE : pas la terminale, pas une production décochée, pas une diagnostique (`profil-etudiant-actions.js:214-227`, `synthese-retroaction-data.js:1370-1372`).
  - Aucun bloc de note en spécifications ni en dénotation (`profil-etudiant-actions.js:487`, `synthese-retroaction-data.js:1327`).
  - « Continuer quand le PDF est téléchargé » n'est pas vérifiable : l'application ne sait pas quand un téléchargement se termine (`fichier-sortant.js:244-247`). Le parcours peut seulement réagir à l'appel de `doc.save` ou à la fin d'`exporterDossierComplet`.
- **Étape 8** [lu].
  - Section « Jugement » si `jugementDenActif` (`profil-etudiant-sections-affichage.js:2311, 2338-2340`). Le panneau finit par « Enregistrer le jugement » (`denotation-saisie-ui.js:175-178`) : proposé d'ajouter « puis touche « Enregistrer le jugement » ».
  - « Exporter la synthèse (CSV) », carte « Résultats finaux », Suivi › Groupe (`index.html:7395-7403`). Une ligne par étudiant·e (`export-resultats-finaux.js:89-110`).
  - « Système de jetons » au bas de la fiche (`index.html:5858`), délais et reprises. Nuance : pour une pratique par spécifications créée par « Décrire ma pratique », le formulaire est désactivé et dit « Les jetons de cette pratique ont été réglés à sa création… » (`wizard-pratique-v2.js:2564-2569`, `pratiques-gestion.js:1376-1380, 1418-1420`).
  - Labo › Exploration (`config.js:93`), profils fictifs par défaut (`comparateur-pratiques.js:72`). Nuance : jusqu'à TROIS pratiques (:305), pas deux.
- **Question « copie non recevable » à la création d'une pratique** [lu]. Elle n'existe pas : aucun « recevable » ni « plagi » dans `wizard-pratique-v2.js` ou `pratiques-bibliotheque.js`. La bulle 1 n'a rien à en dire aujourd'hui.

## Sur l'iPad : où va le PDF [lu pour le mécanisme, inféré pour Safari]

- Le PDF sort par `doc.save()` (`travaux-export-pdf.js:888, 968`), avec jsPDF 2.5.1 (`index.html:11482`).
- Son FileSaver crée un `<a download href="blob:…">` et le clique (`libs/jspdf.umd.min.js`, branche `"download" in HTMLAnchorElement.prototype`).
- Pas de `navigator.share` pour ce PDF : il ne sert qu'au codex (`codex.js:1741`).
- Sur Safari iPadOS [inféré] : la fenêtre « Télécharger » ou « Afficher » de Safari, puis le gestionnaire de téléchargements (la flèche de la barre d'outils). Le fichier va dans Fichiers › Téléchargements, sur iCloud Drive par défaut (Réglages › Safari).
- Le clic part après des `await`, hors du geste de l'usager : à éprouver. **Porte terrain due.**
- Si la bulle doit le dire : « Ouvre-le : sur l'iPad, touche la flèche des téléchargements de Safari, ou cherche-le dans Fichiers › Téléchargements. »

## En mode anonymisation

- **Étape 7** devient inexacte [lu]. Le PDF porte le pseudonyme « Élève N », sans DA (`synthese-retroaction-data.js:248-258`), et le fichier prend le pseudonyme (`travaux-export-pdf.js:885-887`). Ce n'est pas ce que l'étudiant·e recevra.
- **Étape 8, l'export CSV** [inféré] : il porterait les noms pseudonymisés et le vrai DA (`modes.js:1457-1462`, `export-resultats-finaux.js:93-109`).
- Les autres étapes ne changent pas.

## Trouvailles, avec leur issue proposée

**Corriger maintenant** (cassent le parcours livré) :
- Point 3 : « recents » s'affiche vide et bascule en « meilleurs ».
- Point 4 : la table des forfaits n'est pas redessinée après un changement de type.
- Point 6 : l'affichage de la pratique n'est pas posé hors copie. Seulement si un test le confirme.

**Inscrire** :
- « Consulter » montre le choix de la pratique et non celui de l'évaluation (point 7).
- « Voici les N meilleures » sous « plus récentes » ou « toutes » : mots des élèves, donc Grégoire.
- Identifiant de « Type N » qui peut doubler.
- Le nom du premier modèle choisi reste après un retour en arrière.
- En hybride, « Productions pour la note finale » est sans effet.
- La carte « Note : » de la page Pratiques décrit mal la dénotation et les spécifications (`index.html:5318-5324`).
- La fiche dit « Construction de la note » au-dessus d'un menu nommé « Mode de sélection » (`index.html:5619` contre :5629).

**Commenter et oublier** :
- Le repli de `affichageNiveauxSeulement` lit `configuration`, pas la racine (`synthese-retroaction-data.js:1303-1305`, via `portfolio.js:760`). Il est inerte : toute évaluation porte son choix.
- `chargerPratiques()` est appelée sans être définie (`wizard-pratique-v2.js:2676`).
