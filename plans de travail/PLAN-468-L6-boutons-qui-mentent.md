# PLAN #468 — L6 : boutons qui mentent, gestes qui plantent

> **Ouvert** : 21 août 2026, sur ordre du triage (§5 de TRIAGE-audits-2026-08-21.md, rang 4).
> **Constats** : CT-13, CO-05, CO-12, CO-17, CO-18, CO-25.
> **Critère de fin** : aucun libellé du périmètre ne promet ce que son action ne fait pas ;
> aucun geste nominal ne meurt après coup ; sentinelle par sous-lot, break-testée ;
> suites vertes ; release patch ; porte terrain publiée.

## Vérification d'entrée (21 août, sur 1.91.1)

Les six constats sont **tous encore vivants**, aux lignes suivantes (décalées depuis l'audit) :

| Constat | Ligne réelle aujourd'hui |
|---|---|
| CO-05 | `echelles.js:898` (`afficherEchellesPerformance()` inexistante) ; `echelles.js:3348` et `:3393` (`#nbNiveauxEchelle` absent d'index.html) |
| CO-18 | `pratiques-gestion.js:2573-2577` (le `>` manque après `class="hover-fond-subtil"`) |
| CO-12 | `pratiques.js:948` (dupliquerPratique), `:1146` (adopterMaquette) ; forçage `false` : `pratiques/pratique-manager.js:208-211` |
| CO-17 | `productions.js:1137-1141` |
| CT-13 | `cours.js:311` (menu ⋮) vs `:710` (partagerCours) ; `exporterCoursSimple` (`:579`) morte |
| CO-25 | `gabarits-utils.js:438` (ajouterGabaritsDefautSiManquants) |

## Décisions de conception

1. **CT-13 — deux entrées distinctes** (verdict Grégoire, 21 août). « Exporter » télécharge
   un JSON du cours SEUL ; l'action actuelle est renommée « Déposer dans les cours disponibles ».
   Moyen : `exporterCoursSimple()` (morte, doublon de `partagerTousLesCours` qui télécharge déjà
   la sélection entière) est **reconvertie en `exporterUnCours(id)`** — zéro-dette, pas de
   troisième fonction. Elle suit le patron de `partagerTousLesCours` : métadonnées CC demandées,
   wrapper `{metadata_cc, type, dateExport, cours:[…]}`, téléchargement.
2. **CT-13, bord relevé au passage** : `partagerCours` pose `dansBibliotheque=false` mais laisse
   `actif` inchangé, alors que « Retirer de ma sélection » (`retirerCoursDeBibliotheque:377`) pose
   `actif=false` — un cours déposé pouvait rester actif. Aligné ici (même geste, même famille).
3. **CO-17 — les champs d'état ne sont posés QU'À LA CRÉATION.** `construireProductionData`
   reçoit `estModification` ; en modification, `verrouille`/`dansBibliotheque`/`coursId` ne
   figurent PAS dans l'objet, donc le spread `{...existante, ...productionData}` les préserve.
4. **CO-17 — `echeancesParGroupe` : la clé est OMISE quand le formulaire n'a rien à dire.**
   `lireEcheancesParGroupeDepuisFormulaire` rend `null` uniquement quand le conteneur multi est
   masqué (mode simple, ≤1 groupe frère, cours non résolu) — c'est « je ne sais pas », jamais
   « efface ». Un `undefined` dans un spread ÉCRASE : on n'écrit la clé que si l'objet existe.
5. **CO-17 point 3 (héritage au « + Nouvelle production ») — À REQUALIFIER, pas corrigé au jugé** :
   `reinitialiserFormulaireProduction` appelle déjà `peuplerEcheancesParGroupe(null)` (`:863`),
   qui RECONSTRUIT la liste vide en mode multi. Reproduction requise avant tout correctif ; si
   non reproduit, le noter comme tel (patron « 2.1 requalifiée conforme » de la porte L2).
6. **CO-12** — `dupliquerPratique` pose `dansBibliotheque: true` dans l'objet `copie` ;
   `adopterMaquette` pose `dansBibliotheque = true` avec `estMaquette = false` (rattrape les
   maquettes créées avant le fix). Sûr pour les maquettes : la sidebar les masque par
   `filtrerParMaquette`, pas par `dansBibliotheque` (`pratiques-gestion.js:148`).
7. **CO-05 — retrait, pas réanimation** (règle « fix par retrait > fix par activation ») :
   l'appel `afficherEchellesPerformance()` disparaît ; les deux écritures `#nbNiveauxEchelle`
   disparaissent (aucune cible dans index.html — la sidebar se rafraîchit par
   `afficherListeEchelles`). Les chemins morts voisins cités par l'audit (btnExporter,
   `afficherGrillesExistantes`) appartiennent au **lot L7/#469** : notés, pas touchés ici.
8. **CO-25 — tombstones honorés + les deux gabarits de cartouches RETIRÉS** (verdict Grégoire,
   21 août) : leur schéma `sections[]` sans grilleId ni commentaires est un cul-de-sac
   (« 0 commentaire(s) »). `ajouterGabaritsDefautSiManquants` consulte `estRessourceSupprimee`
   avant de resemer.

## Sous-lots (un commit vert chacun, release patch à la fin)

- **S1** CO-18 : fermer la balise + sentinelle de rendu (le plus petit, ouvre le lot).
- **S2** CO-05 : deux retraits + sentinelle « la suppression notifie ».
- **S3** CO-12 : duplication/adoption visibles + sentinelle.
- **S4** CO-17 : création vs modification + échéances préservées + sentinelle ; requalification (5).
- **S5** CT-13 : « Exporter » exporte, « Déposer » dépose + sentinelle.
- **S6** CO-25 : tombstones + retrait des gabarits cartouches + sentinelle ; changelog + release.

## Ce que ce lot ne fait PAS

Les chemins morts voisins de CO-05 (btnExporter, afficherGrillesExistantes/…) → **L7/#469**.
Le verrouillage de production sans point d'entrée UI (`verrouillerEvaluation`) reste inerte —
constat noté, décision hors périmètre. #346 n'est PAS fermé ici : CO-17 ferme le **mécanisme
d'entretien** (la réécriture du coursId), pas les données déjà déviées.
