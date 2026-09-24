# AUDIT — le parcours d'un·e enseignant·e en sommative traditionnelle : ce que son élève reçoit

> **24 septembre 2026, Claude Code sur le Mac.** Consigne : `plans de travail/CONSIGNE-AUDIT-PARCOURS-SOMMATIF.md`
> (Cowork, même jour). **Audit en lecture seule : rien n'a été corrigé.** Mesuré à `a67890fe` (1.156.4, build
> `0924-0838`), après le lot #940, comme la consigne le demande.
> Banc : `tests/integration/audit-parcours-sommatif-2026-09-24.spec.js` (WebKit, vraie page, profil vierge, 18 s). Il
> imprime `AUDIT-SOM {…}` et ne rougit que si le parcours s'interrompt. Tout ce qui n'a pas été exécuté est marqué
> **[lu]**.
> Les trois dispositions de `CLAUDE.md` sont au § 6. Un seul item ouvert au BACKLOG : **#941**.

## 0 · En une phrase

**L'hypothèse de Cowork est confirmée par l'exécution.** Un·e collègue qui démarre en sommative reçoit une échelle
IDME **sans repères**, que personne ne lui a proposée. Dans le bilan de son élève, « Présentement », « Ta force » et
les récurrences des « Points récurrents » sont vides, sans un mot. « Copier tout », lui, garde le titre
« Présentement, il faut se concentrer sur : » suivi de rien. Et la note de la copie n'est écrite nulle part sur la
page du PDF.

## 1 · L'hypothèse, éprouvée

| Ce que Cowork avait lu | Mesuré |
|---|---|
| Aucune échelle livrée ne porte `seuilSuffisance` / `seuilMaitrise` | **Vrai.** Au démarrage d'un profil vierge, `a2026_echellesTemplates` contient une seule échelle, `ECHELLE_IDME_DEPART` « Échelle de départ (IDME) », avec `seuilSuffisance: null` et `seuilMaitrise: null`. Ses niveaux : I Incomplet [0-64,99] v=32, D Développement [65-74,99] v=69,5, M Maîtrise [75-84,99] v=79,5, E Étendu [85-100] v=92,5. **[lu]** Les deux échelles du pack démo (`ECH_DEMO_1759264511178`, `ECH_DEMO_1762273745231`, `pack-demo-10.js`) n'en portent pas non plus. |
| Le bilan est alors vide | **Vrai, pour les trois copies** : `concentration.priorites = []`, `signales = []`, `recurrents.force = ''`, `recurrences = []`. La cause est `zoneDuNiveau`, qui rend `null` pour chaque critère (`profil-etudiant-calculs.js:352`). |
| « sans un mot » | **Vrai dans le PDF** : la rangée « Présentement » disparaît. **Pire dans « Copier tout »** : le titre reste, suivi de rien (§ 3, bloc 6). |
| Vaut aussi pour les Standards | **[lu]** Oui, mais avec une différence. L'assistant Standards affiche l'échelle et avertit : « Sans ces deux repères, la rétroaction remise à l'élève ne peut ni nommer ses priorités ni dire ce qui est acquis » (`wizard-pratique-v2.js:1732-1738`). **L'assistant sommatif ne montre aucune échelle** (`wizard-pratique-v2.js:2083`) : l'enseignant·e sommatif·ve n'est jamais averti·e. |

## 2 · Le parcours, étape par étape

Ont été semés, sans que ce soit l'objet de l'audit : un trimestre, un groupe-cours sans pratique, un élève fictif,
trois productions et trois copies. La page a ensuite été rechargée : c'est le **vrai démarrage** qui a semé l'échelle,
la grille et la cartouche de départ.

| Étape | Ce que l'enseignant·e voit (mesuré) | Où il ou elle peut bloquer | Ce qui manque |
|---|---|---|---|
| 1 · Grille en points | L'éditeur offre le type « Analytique » par critère et pour la grille **[lu]** (`grilles.js:3518`). À l'évaluation : un champ de points par critère, aucun menu de niveaux. | Rien de mesuré. L'éditeur lui-même n'a pas été conduit (la grille est posée sous la forme qu'il enregistre). | — |
| 2 · Pratique sommative (assistant) | Six étapes puis le récapitulatif (7/7) : entrée → calcul (« moyenne ») → règles (« aucune ») → nombre d'évaluations → seuils personnels → informations. « Créer », puis « Appliquer au cours actif » : tout passe. La pratique enregistrée n'a **ni `config.echelle` ni bloc `jetons`**. **[lu]** Le « Modèle sommatif » de la bibliothèque n'en a pas non plus (`pratiques-bibliotheque.js:103`). | Nulle part. | Aucune question sur l'échelle, les repères, les jetons, ni sur ce que l'élève lira. |
| 3 · Sans échelle | **L'application ne le permet pas.** Le sélecteur d'échelle de l'évaluation offre « Échelle de départ (IDME) (4 niveaux) », **déjà choisie** d'office (seule option). Chaque copie enregistrée porte `echelleId: ECHELLE_IDME_DEPART`. Si l'enseignant·e supprime cette échelle, le sélecteur dit « Aucune échelle configurée — Conception → Échelles de performance » et la note devient « -- », **même pour une grille entièrement en points** (`calculerNote`, `evaluation-calcul.js:1471-1480`). | Supprimer l'échelle qu'on n'a pas choisie bloque la note. | Une grille en points n'a pas besoin d'échelle pour se noter, mais le code en exige une. |
| … ce que l'échelle glissée change | Chaque critère reçoit un **niveau déduit** de ses points, par les bornes de l'échelle (`niveauDeduitDesPoints`). La copie reçoit un niveau général. Copie 1 : **62,0 % → « I »**. Copie 2 : 70,0 % → D. Copie 3 : 74,0 % → D. | — | Voir § 3 : l'élève à 62 % (une réussite en sommative) lit « Niveau général · Incomplet ». |
| 4 · Cartouche | Le sélecteur n'offre que « — Choisir une cartouche — ». La seule cartouche semée, `cartouches_GRILLE_GENERIQUE`, appartient à la grille de départ. | — | **[lu]** Une cartouche se remplit par critère × niveau de l'échelle (lot 3, `evaluation-calcul.js:1339-1346`). Pour commenter une grille en points, il faut donc écrire des commentaires par niveau IDME, sur une échelle que l'enseignant·e n'a pas choisie. |
| 5 · Trois copies | Points saisis, note calculée, « Enregistrer » sans refus. Voir le tableau des points ci-dessous. | Nulle part. | — |
| 6 · PDF et « Copier tout » | Voir le § 3. | — | — |

Les trois copies de l'audit (même élève fictif) :

| Copie | Compréhension /40 | Structure /30 | Langue /30 | Note | Niveau déduit par l'échelle de départ |
|---|---|---|---|---|---|
| Travail 1 | 30 (75 %) → M | 17 (56,7 %) → I | 15 (50 %) → I | 62,0 % | I |
| Travail 2 | 34 (85 %) → E | 19 (63,3 %) → I | 17 (56,7 %) → I | 70,0 % | D |
| Travail 3 | 36 (90 %) → E | 22 (73,3 %) → D | 16 (53,3 %) → I | 74,0 % | D |

## 3 · Ce que l'élève lit, bloc par bloc (page de synthèse du PDF, copie « Travail 3 »)

La colonne « Élève de Grégoire » s'appuie sur le rapport du 6 sept. (section A) et sur les lignes du lot #940. La
variante « repères posés » a été mesurée ici : ce sont les mêmes copies, avec les repères D et M posés sur l'échelle
de départ par l'écrivain de l'éditeur (`ecrireRepereEchelle`).

| Bloc | Élève en sommative (mesuré, sans repères) | Même élève, repères D / M posés (mesuré) | Élève de Grégoire (Standards, échelle à repères) |
|---|---|---|---|
| 1 · en-tête | Barre du trimestre en **lettres** : « I 1 · D 2 · ▼ D 3 ». | idem | lettres de son échelle |
| 2 · ruban | « OBJECTIF … TÂCHE … **CONTEXTE** » : l'étiquette CONTEXTE est **vide** (pas de cartouche) | idem | contexte de la cartouche |
| 3 · par critère | « Compréhension · définition · 36 / 40 », idem pour les autres. **Aucun commentaire.** | idem | commentaire de cartouche gelé au niveau retenu |
| 4 · niveau général | « D Niveau général · Développement ». À la copie 1 (62 %) : « **I Niveau général · Incomplet** ». | idem | niveau de son échelle |
| 5 · tampons + erreurs | Complet : tampons, « 2 catégories les plus fréquentes / 3 erreurs », textes du catalogue (les dix codes de repli). | idem | idem |
| 6 · bilan — Présentement | **Absent** du PDF. Dans « Copier tout » : « Présentement, il faut se concentrer sur : » **suivi de rien**. | « Langue (16 / 30) : Écrire dans une langue correcte » ; « Acquis en développement, à consolider : Structure (22 / 30) : … » | ses priorités et ses « à consolider », avec leur définition (#940) |
| 6 · bilan — Points récurrents | Seulement « Erreurs annotées : 3 erreurs (principalement : …) » et la tendance (« Parcours sur 3 productions : en progrès »). À la copie 2 : « Progrès : I → D depuis Travail 1 ». Le rang se lit sans repères. | + « Ta force : Compréhension (36 / 40) », « Langue : prioritaire depuis 3 productions », « Structure : à consolider depuis 3 productions », « En Structure, tu as fait de beaux progrès… » | les mêmes rangées |
| 6 · bilan — Jetons | « **Délai : 0 / 2 · Reprise : 0 / 2 · Reprise ciblée : 0 / 2** ». Ce sont des jetons que l'enseignant·e n'a jamais offerts : la pratique n'a pas de bloc `jetons`, et `obtenirConfigJetons` retombe sur ses valeurs par défaut (`evaluation-jetons.js:145-150`). | idem | les jetons de sa pratique |
| 6 · bilan — Note provisoire | **Absente** : `calculerDetailsNoteFinale` rend `null` hors Standards (`profil-etudiant-actions.js:405`). | idem | « Note provisoire » (N meilleurs, à venir, note finale) |
| 7 · pied | « Prof Banc · XXX-101 CC BY-NC-SA 4.0 » | idem | idem |

**La note, dans une pratique où elle est le message principal.** La page de synthèse d'une copie sommative n'écrit
**ni la note de la copie (74 %) ni la note cumulée** : aucune des deux n'apparaît dans les sept blocs. Pourtant, le
moteur la connaît : l'indice P mesuré vaut 69, la moyenne de 62, 70 et 74. Seul « Copier tout » écrit « Note finale :
74.0 % | Niveau : D ». L'élève de Grégoire, lui, lit sa « Note provisoire ».

**Le texte libre de l'enseignant·e** (zone « Rétroaction finale ») n'est toujours pas sur la page du PDF, comme au
6 sept. Sans cartouche, **la page ne porte donc aucun mot écrit par l'enseignant·e sommatif·ve**, hormis l'objectif et
la tâche de la production.

## 4 · La proposition de Grégoire, éprouvée — rien n'est codé

> « Tout critère qui est inférieur à 60 % (donc un échec) pourrait recevoir un commentaire spécifique (comme un
> défi ou une cible à relever). »

**Le cas central : des points, sans échelle.** Le pourcentage d'un critère (points / pondération) est toujours
défini. Voici ce que la règle aurait produit sur les trois copies mesurées. Ce tableau est un **calcul à la main** fait
sur les points mesurés : rien n'a été exécuté.

| Copie | « Présentement » selon la règle « < 60 % » | « Présentement » avec les repères D / M (mesuré) | Écart |
|---|---|---|---|
| Travail 1 | Structure (56,7 %), Langue (50 %) | Structure, Langue (priorités) | aucun |
| Travail 2 | Langue (56,7 %) | Structure (63,3 % → I), Langue (priorités) | **Structure** : prioritaire par les repères, rien par la règle |
| Travail 3 | Langue (53,3 %) | Langue (priorité) ; Structure (73,3 % → D) « à consolider » | **Structure** : « à consolider » par les repères, rien par la règle |

- **« Points récurrents »** selon la règle : à la copie 3, « Langue : sous 60 % depuis 3 productions ». Structure
  n'y paraît pas, puisqu'elle n'est pas sous 60 % sur la copie courante.
- **« Ta force »** selon la règle : **rien**. 60 % ne dit pas où commence l'acquis. Avec les repères, Compréhension en
  est une.
- **Une question que la règle doit trancher, et qui ne se voit pas dans les données mesurées [lu, inférence]** :
  `lignesRecurrentes` (`synthese-retroaction-data.js:1401-1405`) arrête le compte sur « acquis » seulement. Il
  **saute** toute copie dont la zone vaut `null` (c'est la décision de Grégoire sur la copie qui n'évalue pas le
  critère). Si « 60 % et plus » n'a pas de zone, une suite Langue 50 %, 72 %, 50 % se lirait « sous 60 % depuis
  3 productions », en sautant la réussite du milieu. Il faut dire ce que vaut une copie à 60 % ou plus : arrêt, ou
  saut.

**Où un pourcentage de critère existe aussi**

- **Critère holistique** : les échelles livrées portent une `valeurCalcul` pour chaque niveau. Échelle de départ :
  I 32, D 69,5, M 79,5, E 92,5. Pack démo : 0 → 0, I 40, D 65, M 75, E 100. Par cette valeur, seul I (et 0) tombe
  sous 60. **Par la plage, en revanche, I couvre [0-64,99]** : le niveau enjambe 60 et ne dit pas de quel côté se
  trouve l'élève. Ce sont deux lectures d'un même niveau ; ce rapport n'en choisit aucune.
- **Critère algorithmique** : sa note existe en pourcentage (`donneesAlgorithmiques.pourcentage`, par exemple
  « 12 erreurs sur 600 mots → 60,0 % » au banc du 6 sept.).
- **Où il n'existe pas** : un niveau sans `valeurCalcul`. C'est le cas des huit échelles « collègues » retirées le
  1er sept. et encore présentes dans les données de qui les a connues (`echelles.js:513-520`). La règle n'y dirait
  rien. Aucune correspondance lettre → % n'est proposée ici.

**Comment la règle cohabite avec une échelle qui a ses repères.** Aux copies 2 et 3, les deux lectures divergent sur
Structure. Laquelle l'emporte ? **La question est posée, pas tranchée** (§ 5).

⚠ **Le principe que la règle contredit**, écrit le 28 août dans la documentation de `zoneDuNiveau`
(`profil-etudiant-calculs.js:336-339`) :

> « l'échelle ne porte AUCUN des deux repères — le cas de toute échelle antérieure au lot 1. **Aucune valeur n'est
> devinée à leur place : ni par les lettres, ni par une position dans la liste, ni par un pourcentage.** »

Réviser ce principe revient à Grégoire, pas au code.

## 5 · Ce qui revient à Grégoire (pédagogie, et mots que l'élève lit)

1. **Une grille en points doit-elle se noter sans échelle ?** Aujourd'hui, une échelle est glissée d'office, et
   l'élève à 62 % lit « Incomplet ».
2. **La règle « < 60 % »** : l'adopter ? Si oui, pour les points seulement ou aussi pour les niveaux (par
   `valeurCalcul` ou par la plage) ? Et que vaut une copie à 60 % ou plus pour les « Points récurrents » : arrêt ou
   saut ?
3. **Quand une échelle a ses repères**, lesquels l'emportent : les repères ou les 60 % ?
4. **La note sur la page du PDF en sommative** : écrire la note de la copie, la moyenne cumulée, ou rien ?
5. **Les jetons** : une pratique qui n'en déclare aucun doit-elle en montrer à l'élève ?

## 6 · Dispositions (CLAUDE.md, « Ce qu'un audit doit produire »)

| # | Constat | Disposition |
|---|---|---|
| H | Le bilan est vide pour toute échelle sans repères, et l'assistant sommatif n'avertit pas | **inscrit #941** (a) |
| C1 | Aucune échelle possible pour une grille en points ; l'échelle de départ est glissée d'office ; 62 % se lit « Incomplet » | **inscrit #941** (b) |
| C2 | « Copier tout » : le titre « Présentement… : » est suivi de rien quand aucune zone ne se lit. C'est le symptôme de la porte terrain 2.6, par un autre chemin (`evaluation-retroaction.js:1206-1230` ne couvre pas « tous les critères sans zone ») | **inscrit #941** (c) |
| C3 | Jetons par défaut (2 / 2 / 2) montrés à l'élève par une pratique qui n'en déclare aucun | **inscrit #941** (d). Voisin, mais distinct, de #854 et #938 (réglage du formulaire perdu ou non lu) |
| C4 | Aucune note sur la page du PDF en sommative | **inscrit #941** (e) |
| C5 | Étiquette « CONTEXTE » vide sur le ruban sans cartouche | **inscrit #941** (f) |
| C6 | Sans cartouche, aucun mot de l'enseignant·e sur la page (texte libre absent) | **périmé comme trouvaille** : déjà cartographié au 6 sept. (« ce qui n'est nulle part dans A ») ; rattaché à #941 (e) pour la décision |
| C7 | `criteres[].retroaction` enregistre l'amorce « Saisis les points » (stock) | **refusé** : déjà filtré à la lecture et documenté (`synthese-retroaction-data.js:414-425`) ; aucune conséquence observable |
| P | La règle « < 60 % » | **inscrit #941** (décisions 2 et 3 du § 5) ; rien n'est codé |

## 7 · Ce que je n'ai pas regardé

- L'éditeur de grilles et l'accueil (trimestre, cours) : semés, pas conduits.
- L'adoption du « Modèle sommatif » : lue, pas exécutée.
- Le rendu rasterisé et l'iPad.
- La « Rétroaction spécifique » de « Copier tout » : la visionneuse n'était pas ouverte, et le texte copié dit
  « Ouvre un fichier pour voir la rétroaction spécifique ». C'est un artefact du banc, pas un constat.
- Le profil de l'élève et l'export CSV en sommative : déjà audités le 16 sept.

## Commandes qui le prouvent

```
cd tests && npx playwright test integration/audit-parcours-sommatif-2026-09-24.spec.js --project=webkit --retries=0   # AUDIT-SOM {…}
grep -c "seuilSuffisance\|seuilMaitrise" js/pack-demo-10.js   # 0 : le pack démo ne pose aucun repère ; le semis de départ : AUDIT-SOM, etapes.demarrage
grep -n "jetonsDefaut" -A5 js/evaluation-jetons.js ; grep -n "if (!estFamilleStandards) return null" js/profil-etudiant-actions.js
```
