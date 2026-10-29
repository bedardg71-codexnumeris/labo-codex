# Le guidage de la démo et la fenêtre « Données démo » — les textes réécrits

**Proposés, à valider par Grégoire.** Écrits par Claude Code le 29 oct. 2026, lot 5 de l'Aide (#1152), en exécution de la décision n° 6 de `plans de travail/TEXTES-2026-10-28-textes-d-ecran.md`. Rien n'est posé dans le code.

**Méthode.** Chaque texte actuel a été confronté à l'écran qu'il désigne aujourd'hui (libellés lus dans `js/config.js` et `index.html`), chaque nombre recompté dans le pack de la démo par un script `node` en lecture seule, et les mots repris des entrées de l'Aide validées aux lots 2a à 3 plutôt qu'inventés.

---

## 0. Vue d'ensemble

### Ce que la mesure a trouvé avant d'écrire

`GUIDAGE_TEXTES` compte **18 entrées, pas 19** (`js/guidage-demo.js:15-83`, une clé toutes les quatre lignes). Le texte s'affiche dans la sous-section dont l'identifiant porte la clé (`js/navigation.js:674-675` → `afficherGuidageDemo(idSousSection)`).

**Deux clés ne s'affichent jamais** : `apercu-contenu` et `suivi-apercu-legacy` n'existent comme identifiant d'aucune sous-section d'`index.html` (`grep -c 'id="apercu-contenu"' index.html` → 0 ; idem pour `suivi-apercu-legacy`). La première visait l'ancien Tableau de bord, devenu Suivi › Suivi du groupe (`id="suivi-groupe"`, `index.html:7375`) — l'écran même où la démo s'ouvre, qui n'a donc **aucune bulle**. La seconde visait un écran « Présences — Aperçu » qui n'existe plus (la section `presences` a été supprimée le 3 avril 2026, `js/config.js:36`).

**La carte d'alignement de la démo n'est pas dans le pack** : elle est dans `js/demo-namespace.js:39-102` (`CARTE_DEMO_ALIGNEMENT`). Le « 26 nœuds et 45 liens » de la bulle actuelle lit `compteur: 26` et `compteurLiens: 45`, qui sont les **compteurs d'identifiants**, pas les comptes : la carte a 17 nœuds et 12 liens.

### Les comptes mesurés

Méthode : `eval` du fichier dans un `node` isolé, puis comptage de `window.PACK_DEMARRAGE` (scripts dans le scratchpad, aucune écriture au dépôt).

| Objet | Compte | Comment |
|---|---|---|
| Étudiant·es | 10 | `groupeEtudiants.length` |
| Productions | 11 : 1 portfolio, 9 artefacts, 1 évaluation terminale | `productions.length` et `type` (`portfolio`, `artefact-portfolio` ×9, `terminale`) ; 10 sur 11 ont un `grilleId`, le portfolio n'en a pas |
| Évaluations | 101 (98 verrouillées, 3 non) | `evaluationsSauvegardees.length`, champ `verrouillee` |
| Présences | 313 entrées sur 32 dates, du 2025-08-25 au 2025-12-10 (307 « present », 6 « absent ») | clés de `presences`, puis somme des entrées par date |
| Grilles | 3 : deux toutes holistiques (« Grille-5 FR-HOLIS-20 H26 », « Grille-4 »), une dont « Français écrit » est algorithmique (« Grille-5 FR-ALGO-20 H26 ») | `grillesTemplates[].criteres[].type` |
| Échelles | 2 : « IDME et niv 0 » (0, I, D, M, E), « IDME 4 niv » (I, D, M, E) | `echellesTemplates[].niveaux[].code` |
| Cartouches | 9 (4 + 4 + 1, une clé `cartouches_*` par grille) | longueur de chaque clé `cartouches_GRILLE_DEMO_*` |
| Pratiques | 2 : « PAN – Standards (démo) », « PAN – Spécifications (démo) » ; active : `standards` | `pratiquesConfigurables`, `modalitesEvaluation.pratique` |
| Carte | 17 nœuds, 12 liens : 1 compétence, 3 idées maîtresses, 1 séquence, 2 leçons, 6 connaissances (2 factuelles, 4 procédurales), 2 activités, 2 évaluations | `js/demo-namespace.js`, `cartes.carte_1.noeuds.length` et `.liens.length`, par `type` |
| Copies | 0 | `js/demo-activation.js:612` : « le pack ne livre aucune copie » |
| Interventions | 0 | aucune clé `interventions` dans le pack ni dans `peuplerNamespace` |

Ces comptes recoupent l'entrée de l'Aide `accordeon-aide-demo` (`index.html:9986-10003`, validée au lot 2a), dont je reprends la phrase.

---

## Groupe 1 — Le Suivi (bulles 1 à 4)

### 1. `apercu-contenu` → à poser sous `suivi-groupe`

**Écran désigné :** l'ancien Tableau de bord, aujourd'hui **Suivi › Suivi du groupe**. La clé actuelle ne s'affiche jamais ; à l'intégration, la bulle change de clé.

**AVANT** — *Tableau de bord — État des lieux* : Ce tableau présente les indicateurs ACPE (Assiduité, Complétion, Performance, Engagement) pour tes 10 étudiants fictifs. Les barres graduées montrent la distribution du groupe. Survole un point pour voir le profil d’un étudiant.

**APRÈS** — *Suivi du groupe* : Voici les indices A, C et P (assiduité, complétion, performance) des 10 étudiant·es de la démo. « Détails » les montre sur chaque étudiant·e, et un clic sur l'un d'eux ouvre son profil.

Mesuré : titre « Suivi du groupe » et bouton « Détails », `index.html:7377, 7400-7403` ; phrase de « Détails » reprise de l'Aide `tableau-bord` (`index.html:10808`, validée le 28 oct., 12 h 07) ; survoler un point montre le nom et la valeur, pas le profil (`js/tableau-bord-apercu.js:2145`, attribut `title`) — d'où le retrait du « survole ».

### 2. `suivi-liste`

**Écran désigné :** Suivi › Liste des étudiant·es.

**AVANT** — *Liste des individus* : Chaque ligne résume un étudiant : son taux de présence, sa complétion des travaux et sa performance moyenne. Clique sur un nom pour ouvrir son profil détaillé.

**APRÈS** — *Liste des étudiant·es* : Une rangée par étudiant·e : A, C et P, son profil d'apprentissage, son niveau RàI et ses interventions. Les filtres et la recherche resserrent la liste ; un clic sur une rangée ouvre le profil.

Mesuré : colonnes « A », « C », « P », « Profils », « RàI », « Interv. » et filtres « Groupe », « Programme », « Niveau RàI », « Profils d'apprentissage », « Recherche » (`index.html`, `id="suivi-liste"`) ; le clic porte sur toute la rangée (`js/etudiants.js:1152-1155`, `tr.onclick` → `afficherProfilComplet`).

### 3. `suivi-profil`

**Écran désigné :** Suivi › Profils individuels.

**AVANT** — *Profil étudiant* : Le profil individuel rassemble toutes les données d’un étudiant : présences, évaluations, progression. C’est ici que tu planifies une intervention si nécessaire.

**APRÈS** — *Profils individuels* : Le profil d'un·e étudiant·e, en sections : « Productions », « Engagement ACP », « Progression temporelle ACP », « Développement des habiletés »… Le menu du haut passe d'un·e étudiant·e à l'autre. Si la RàI est activée, « Accompagnement » offre « + Nouvelle intervention ».

Mesuré : noms des sections et du bouton repris de l'Aide `profil-etudiant` (`index.html:10929`, titre et D4 validés le 28 oct., 12 h 07) ; « + Nouvelle intervention » ne paraît que sous « Accompagnement », RàI activée (même entrée).

### 4. `suivi-interventions`

**Écran désigné :** Suivi › Interventions.

**AVANT** — *Interventions RàI* : Le système Réponse à l’Intervention (RàI) classe les étudiants en 3 niveaux selon leurs indicateurs. Les recommandations sont générées automatiquement pour guider tes interventions.

**APRÈS** — *Interventions* : Tu y planifies et documentes tes interventions des niveaux RàI 2 et 3. « Planifier une intervention » ouvre une fiche ; les critères ciblés s'y pré-cochent d'après les défis communs des étudiant·es que tu coches. La démo n'en contient aucune.

Mesuré : sous-titre de l'écran « Planifie et documente tes interventions ciblées (niveaux RàI 2 et 3). » (`index.html`, `id="suivi-interventions"`) ; bouton « Planifier une intervention » (`js/interventions.js:105`) ; pré-cochage repris de l'Aide `planifier-rai` (`index.html:11059`) ; aucune intervention dans le pack. « Recommandations générées automatiquement » retiré : seul « Suggérer » propose un objectif, à la demande (`js/interventions.js:1139`).

---

## Groupe 2 — Présences, calendrier, liste des évaluations (bulles 5 à 8)

### 5. `suivi-apercu-legacy` → à retirer

**Écran désigné :** « Présences — Aperçu », qui n'existe plus. La clé ne s'affiche jamais.

**AVANT** — *Présences — Aperçu* : Vue synthétique de l’assiduité du groupe : taux de présence global, tendances hebdomadaires et étudiants à surveiller. Les 313 présences de la démo couvrent une session complète.

**APRÈS** — *(aucun texte : l'entrée se retire de `GUIDAGE_TEXTES`)*. Ce qu'elle disait des présences de la démo passe à la bulle 7.

Mesuré : aucun `id="suivi-apercu-legacy"` dans `index.html` ; section `presences` supprimée le 3 avril 2026 (`js/config.js:36`).

### 6. `calendrier-vue`

**Écran désigné :** Cadre › Calendrier scolaire.

**AVANT** — *Calendrier scolaire* : Le calendrier affiche chaque séance avec un code couleur par étudiant. Repère les patterns d’absence pour intervenir au bon moment.

**APRÈS** — *Calendrier scolaire* : Tous les mois du trimestre d'un coup. Les couleurs disent le type de journée et les échéances, pas les présences. Un clic sur un jour de cours ouvre la saisie des présences à cette date.

Mesuré : Aide `presences-calendrier`, « Lire le calendrier scolaire » (`index.html:10168`, chemin remesuré le 27 oct.) ; l'onglet principal s'appelle « Cadre » (`index.html:4133-4134`).

### 7. `suivi-saisie`

**Écran désigné :** Suivi › Saisie des présences.

**AVANT** — *Saisie des présences* : C’est ici que tu prends les présences au quotidien. Sélectionne la date, coche les présents, note les retards. En démo, tu peux tester la saisie sans conséquence.

**APRÈS** — *Saisie des présences* : Choisis la « Date du cours ». Par défaut, tous les étudiant·es sont présent·es : saisis seulement les absences et les retards, en périodes. Si personne n'est absent, « Confirmer la séance » l'enregistre. La démo porte déjà 32 dates de présences, du 25 août au 10 décembre.

Mesuré : libellé « Date du cours » (`index.html`, `id="suivi-saisie"`) ; présent·es par défaut (`js/saisie-presences.js:1531-1534`, et `:867` « les étudiant·es non marqué·es comptent présent·es ») ; « Confirmer la séance » (`index.html:7923`) ; phrases de l'Aide `saisie-presences` (`index.html:10906`) ; 32 dates, du 2025-08-25 au 2025-12-10 (pack, clés de `presences`). Il n'y a rien à « cocher » : l'écran saisit des périodes, par pas de 0,5.

### 8. `evaluations-liste`

**Écran désigné :** Évaluation › Liste des évaluations.

**AVANT** — *Liste des évaluations* : Toutes les évaluations enregistrées, filtrables par production et par groupe. Clique sur une évaluation pour voir le détail critérié.

**APRÈS** — *Liste des évaluations* : Une rangée par copie attendue, avec son statut, sa note et ses jetons. Les filtres « Production » et « Statut » et la recherche resserrent la liste ; le menu « Actions » d'une rangée n'offre que ce que la copie permet. La démo porte 101 évaluations.

Mesuré : filtres « Production », « Statut », « Recherche » et colonnes « Jeton », « Statut », « Niveau », « Note % » (`index.html`, `id="evaluations-liste"`) — **il n'y a pas de filtre par groupe** ; menu « Actions » repris de l'Aide `liste-evaluations` (`index.html:10646`, validée le 28 oct., 5 h 49) ; 101 = `evaluationsSauvegardees.length`.

---

## Groupe 3 — Les copies (bulles 9 à 11)

### 9. `evaluations-importer`

**Écran désigné :** Évaluation › Préparer et importer.

**AVANT** — *Préparer et importer* : Importer les fichiers des étudiants (PDF, images), les préparer (rotation, assemblage) et les associer à une production.

**APRÈS** — *Préparer et importer* : Importe les fichiers de tes étudiant·es (PDF ou images), prépare-les (rotation, assemblage des pages) et associe chacun à une production. La démo ne livre aucune copie ; ce que tu importes ici, « Retirer les copies » (bandeau vert) l'efface.

Mesuré : rotation (`js/travaux-preparation.js:407`, opérations `rotation90` et `fineRotation`) ; aucune copie dans le pack (`js/demo-activation.js:612`) ; bouton « Retirer les copies (N) » du bandeau, en démo seulement (`js/demo-activation.js:609, 673`).

### 10. `evaluations-annoter`

**Écran désigné :** Évaluation › Annoter et évaluer.

**AVANT** — *Annoter et évaluer* : Annoter les copies directement à l’écran, apposer des tampons de rétroaction et évaluer selon la grille de critères.

**APRÈS** — *Annoter et évaluer* : Annote les copies à l'écran, appose des tampons, puis évalue-les selon la grille : « Actions ▾ » passe d'« Annoter » à « Évaluer ». Pour annoter dans la démo, importe d'abord une copie : le pack n'en livre aucune.

Mesuré : bascule « Actions ▾ » reprise de l'Aide `annoter-evaluer` (`index.html:10667`) ; aucune copie dans le pack (`js/demo-activation.js:612`).

### 11. `evaluations-exporter`

**Écran désigné :** Évaluation › Exporter les travaux.

**AVANT** — *Exporter les travaux* : Exporter les PDF annotés aux étudiants.

**APRÈS** — *Exporter les travaux* : Sors tes copies et tes évaluations de l'application : un ZIP pour tout le groupe, une production ou un·e étudiant·e, ou l'« Export Léa », un PDF à téléverser dans Léa.

Mesuré : Aide `exporter-archiver` (`index.html:10775-10790`), cartes « Exporter des travaux » et « Export Léa ». L'écran n'envoie rien aux étudiant·es : il produit des fichiers que tu gardes.

---

## Groupe 4 — La Conception (bulles 12 à 15)

### 12. `conception-grille-criteres`

**Écran désigné :** Conception › Grilles de critères.

**AVANT** — *Grilles de critères* : Les grilles définissent les critères d’évaluation et leur pondération. La démo inclut 3 grilles prêtes à l’emploi que tu peux explorer et dupliquer.

**APRÈS** — *Grilles de critères* : Une grille porte tes critères, leur pondération et leur type. La démo en a 3 : deux toutes holistiques, une avec un critère algorithmique (« Français écrit »). Ouvertes, elles sont en lecture seule ; « Dupliquer pour créer ma grille » t'en fait une copie.

Mesuré : critères, pondération, type (Aide `creer-grilles`, `index.html:10320`) ; 3 grilles et leurs types (pack, `grillesTemplates[].criteres[].type`) ; lecture seule et bouton « Dupliquer pour créer ma grille » (`js/grilles.js:5638`, `js/bibliotheque-ui.js:309-324`).

### 13. `conception-echelle-performance`

**Écran désigné :** Conception › Échelles de performance.

**AVANT** — *Échelles de performance* : Les échelles définissent les niveaux de réussite (ex. : A, B, C ou Excellent à Insuffisant). Elles sont associées aux grilles pour convertir les cotes en notes.

**APRÈS** — *Échelles de performance* : Une échelle sert les critères holistiques : tu choisis un niveau, l'échelle en donne la note. La démo en a 2, sur les niveaux I, D, M et E ; l'une ajoute un niveau 0, « Aucun ». « Dupliquer pour créer mon échelle » t'en fait une copie.

Mesuré : première phrase de l'Aide `creer-echelles` (`index.html:10468`, lot 2b) ; 2 échelles et leurs codes (pack, `echellesTemplates[].niveaux`) ; bouton (`js/echelles.js:2177`).

### 14. `conception-retroactions`

**Écran désigné :** Conception › Cartouches de rétroaction.

**AVANT** — *Cartouches de rétroaction* : Les cartouches sont des banques de commentaires prérédigés associés aux niveaux de ta grille. Elles accélèrent la rétroaction écrite lors de l’évaluation.

**APRÈS** — *Cartouches de rétroaction* : Une cartouche porte un commentaire par critère et par niveau ; à l'évaluation, la rétroaction se compose des commentaires des niveaux atteints. La démo en a 9, liées à ses 3 grilles.

Mesuré : première phrase de l'Aide `creer-cartouches` (`index.html:10587`) ; 9 cartouches sur trois clés `cartouches_GRILLE_DEMO_*` (pack), chargées à l'activation (`js/demo-activation.js:206-226`).

### 15. `conception-productions`

**Écran désigné :** Conception › Productions étudiantes.

**AVANT** — *Productions étudiantes* : Les productions sont les travaux que tes étudiants doivent remettre (dissertations, examens, projets). La démo en contient 11, chacune associée à une grille de critères.

**APRÈS** — *Productions étudiantes* : Les productions sont les travaux que tes étudiant·es remettent. La démo en a 11 : un portfolio, les 9 artefacts qu'il rassemble et une évaluation terminale. Toutes, sauf le portfolio, sont liées à une grille.

Mesuré : `productions[].type` et `grilleId` (pack) — le portfolio n'a pas de grille, donc « chacune associée à une grille » était faux ; le portfolio retient les artefacts (`modalitesEvaluation.configPAN.portfolio.nombreTotal: 9`) ; décompte identique à l'Aide `demo`.

---

## Groupe 5 — Animation, carte, Labo (bulles 16 à 18)

### 16. `suivi-animation`

**Écran désigné :** Suivi › Animation.

**AVANT** — *Animation* : Outils pour animer la classe : questions flash, tirage au sort d’étudiant·es et formation d’équipes.

**APRÈS** — *Animation* : Trois outils pour animer la classe : « Questions flash » tire une question de ta banque, « Tirage au sort » tire des étudiant·es, « Équipes » forme des équipes de 2, 3 ou 4 avec les présent·es du jour.

Mesuré : titres des trois outils (`index.html:8099-8105`) ; ce que fait chacun, repris de l'Aide `tirage-sort` (`index.html:11098`). Le texte actuel n'est pas faux : la réécriture ne fait que nommer les boutons.

### 17. `conception-carte`

**Écran désigné :** Conception › Carte d'alignement.

**AVANT** — *Planification — Carte mentale* : La carte mentale te permet de visualiser l’alignement pédagogique de ton cours. La démo inclut une carte complète « Écriture et littérature » avec 26 nœuds et 45 liens. Explore les séquences, leçons et activités pour voir comment les éléments se relient.

**APRÈS** — *Carte d'alignement* : La carte relie ce que tu vises, ce que tu enseignes et ce que tu évalues. Celle de la démo, « Écriture et littérature (démo) », compte 17 nœuds et 12 liens : une compétence, trois idées maîtresses, puis une séquence de deux leçons, chacune avec ses connaissances, son activité et son évaluation formative. Le bouton « Guide » l'explique page par page.

Mesuré : libellé de l'onglet (`js/config.js:53`) ; première phrase reprise de l'Aide `lecons` (`index.html:10299`) ; nom, nœuds et liens comptés dans `CARTE_DEMO_ALIGNEMENT` (`js/demo-namespace.js:54-98`) ; chaque leçon a pour enfants 3 connaissances, 1 activité et 1 évaluation de visée `formative` ; bouton « Guide » (Aide `lecons`).

### 18. `labo-modelisation`

**Écran désigné :** Labo › Modélisation.

**AVANT** — *Labo — Modélisation* : La modélisation te permet d’ouvrir un PDF pour l’annoter en direct lors d’une projection en classe. Ouvre un fichier depuis ton ordinateur pour tester les outils d’annotation.

**APRÈS** — *Modélisation* : « + Ouvrir » charge un document de ton appareil (PDF, JPG, PNG ; HEIC selon le navigateur), que tu projettes et annotes devant le groupe. Les annotations restent d'une séance à l'autre.

Mesuré : bouton « + Ouvrir » et son infobulle « PDF, JPG, PNG ; HEIC selon le navigateur » (`js/modelisation.js:81`, décision de Cowork du 28 oct.) ; persistance des annotations reprise de l'Aide `labo` (`index.html:11127`).

---

## La fenêtre « Données démo » (`accueil-donnees-demo`)

**Où elle s'ouvre :** le bouton « i » de la carte « Données démo » de l'accueil (`js/accueil.js:282`). **Où elle vit :** `js/accompagnement-contenu-popup.js:1254-1293`. Sept blocs ; le `voirAussi` reste tel quel.

### Le titre

**AVANT** : Mode démonstration & duplication CC

**APRÈS** : Données démo

Mesuré : c'est le nom de la case sur l'accueil (`js/accueil.js:282`) et du terme du glossaire (`js/accompagnement-contenu-terme.js`, `donnees-demo`).

### Bloc 1 (texte)

**AVANT** : Labo Codex embarque un jeu complet de données de démonstration : un cours fictif « Écriture et littérature », 10 étudiants, 11 productions, 101 évaluations, 313 présences, 3 grilles, 2 échelles et une carte mentale d'alignement pédagogique. Coche la case « Données démo » sur l'accueil pour activer ce matériel et explorer l'outil sans toucher à tes vraies données.

**APRÈS** : La démo est un cours fictif, « Écriture et littérature (Démo) » : 10 étudiant·es, 11 productions (1 portfolio, 9 artefacts et une évaluation terminale), 101 évaluations, 32 dates de présences (du 25 août au 10 décembre), 3 grilles de critères, 2 échelles de performance, 9 cartouches et une carte d'alignement. Coche « Données démo » : elle s'ouvre dans Suivi › Suivi du groupe, à part de tes vraies données.

Mesuré : comptes du tableau du § 0 ; titre du cours `listeCours[0].titre` (pack) ; phrase de dénombrement et lieu d'ouverture repris de l'Aide `demo` (`index.html:9986`, lot 2a).

### Bloc 2 (texte)

**AVANT** : Ce que tu fais dans la démo est provisoire : une nouvelle version du pack démo remplace tes évaluations, et « Retirer les copies » efface les copies importées.

**APRÈS** : *inchangé* — phrase validée par Grégoire le 7 oct. 2026 (décision G4, commentaire en `js/accompagnement-contenu-popup.js:1262`), reprise mot pour mot par l'Aide `demo`.

### Bloc 3 (texte)

**AVANT** : Ce matériel est publié sous licence CC BY-NC-SA 4.0 (Attribution, pas d'utilisation commerciale, partage à l'identique). L'auteur est affiché partout sous le nom « Labo Codex ». Il sert de modèle et t'accompagne vers l'autonomie selon le modèle de l'enseignement explicite.

**APRÈS** : Ce matériel est publié sous licence CC BY-NC-SA 4.0 (attribution, pas d'utilisation commerciale, partage dans les mêmes conditions). Il sert de modèle et t'accompagne vers l'autonomie, selon l'enseignement explicite.

Mesuré : « affiché partout sous le nom « Labo Codex » » est faux. Les grilles du pack portent `metadata_cc.auteur_original: "Labo Codex"`, mais les pratiques et le groupe-cours de la démo portent `auteur: 'Demo Labo Codex'` (pack ; `js/demo-namespace.js:221-263`) et la carte `auteur_original: "Grégoire Bédard"` (`js/demo-namespace.js:45`). La phrase part ; la licence reste.

### Bloc 4 (liste « Le parcours en trois temps »)

**AVANT** :
- **Modélisation** — Active la démo et explore l'aperçu peuplé. Tu vois directement ce que l'outil produit avec des données réalistes.
- **Pratique guidée** — Ouvre une grille ou une échelle démo pour comprendre sa structure. Le formulaire est en lecture seule (aucun risque de modifier accidentellement le matériel).
- **Autonomie** — Clique sur « Dupliquer » (ou ta propre échelle, cartouche, production, pratique, groupe-cours) et renomme. Tu pars du modèle mais tu deviens l'auteur.

**APRÈS** (↻ Cowork, 29 oct. : « – » au lieu de « — » ; la fin d'« Autonomie » réécrite par la décision de Grégoire de 8 h 00, ci-dessous) :
- **Modélisation** – Active la démo : Suivi du groupe s'ouvre, déjà rempli. Tu vois ce que l'outil produit avec des données réalistes.
- **Pratique guidée** – Ouvre une grille ou une échelle de la démo pour voir sa structure. Elle est en lecture seule : tu ne peux pas la modifier par accident.
- **Autonomie** – Clique sur « Dupliquer pour créer ma grille » (ou mon échelle, ma cartouche, ma production, ma pratique) et renomme la copie. Elle reste dans la démo : une nouvelle version du pack l'efface.

Mesuré : lieu d'ouverture (Aide `demo`) ; lecture seule, champs désactivés (`js/bibliotheque-ui.js:309-319`) ; les cinq boutons « Dupliquer pour créer ma grille / mon échelle / ma cartouche / ma production / ma pratique » (`js/grilles.js:5638`, `js/echelles.js:2177`, `js/cartouches.js:1612`, `js/productions-liste.js:192`, `js/pratiques-gestion.js:1074`). Le groupe-cours n'a pas ce bouton : il part de la liste.

### Bloc 5 (exemple)

**AVANT** : Tu ouvres la grille démo « Analyse littéraire ». Tu cliques sur « Dupliquer ». Une copie apparaît dans ta bibliothèque, prête à être renommée. Dans les métadonnées de ta copie, une ligne « Inspiré de : Analyse littéraire par Labo Codex » reste visible — c'est la reconnaissance d'origine exigée par la licence CC.

**APRÈS** : Tu ouvres la grille « Grille-5 FR-HOLIS-20 H26 » de la démo et tu cliques sur « Dupliquer pour créer ma grille ». Ta copie porte la ligne « Inspiré de Grille-5 FR-HOLIS-20 H26 par Labo Codex » : c'est la reconnaissance d'origine qu'exige la licence.

Mesuré : aucune grille ne s'appelle « Analyse littéraire » (c'est une cartouche) ; noms des grilles (pack) ; forme exacte « Inspiré de <nom> par <auteur> », sans deux-points (`js/bibliotheque-ui.js:291`) ; l'auteur d'une grille du pack se lit dans `metadata_cc.auteur_original` = « Labo Codex » (`js/bibliotheque-ui.js:206-218`) ; la ligne s'affiche dans la rangée de la grille (`js/grilles.js:2231`).

### Bloc 6 (conseil)

**AVANT** : Les sélecteurs (grilles, échelles, pratiques, groupes-cours, etc.) affichent deux sections : « Mes documents » pour tes créations, « Démo » pour le matériel original. Tu peux mélanger les deux dans les dropdowns, mais au moment d'enregistrer un item utilisateur, Labo Codex refuse les références mixtes (ex. une vraie grille qui pointerait sur une échelle démo) — duplique l'échelle démo d'abord, puis référence ta copie.

**APRÈS** : Dans les menus de Cadre › Trimestre (cours, horaire, enseignant·e, pratique, groupe-cours), le matériel de la démo paraît grisé, sous « Démo (par Labo Codex – à dupliquer pour utiliser) ». Ton matériel ne peut pas pointer vers un modèle de la démo : duplique-le d'abord, puis choisis ta copie.

Mesuré : le groupe « Démo » n'existe que dans les menus de Cadre › Trimestre (8 appels de `ajouterOptgroupDemo`, tous dans `js/trimestre-v2*.js`), ses options sont désactivées et son libellé est « Démo (par Labo Codex – à dupliquer pour utiliser) » (`js/bibliotheque-ui.js:260-275`) ; aucune section « Mes documents » n'existe dans le code ; la garde qui refuse une référence à la démo demande de dupliquer d'abord (`js/bibliotheque-ui.js:386-418`).

### Bloc 7 (alerte)

**AVANT** : Les données démo vivent en permanence dans un espace séparé. Cocher/décocher la case ne touche jamais à tes vrais trimestres (H2026, A2025, etc.). Tu peux activer la démo, explorer, et décocher à tout moment — ton état réel revient intact.

**APRÈS** : Les données démo vivent dans un espace à part : cocher ou décocher la case ne touche jamais à tes vrais trimestres. Pour en sortir, « Quitter la démo » dans le bandeau vert, ou décoche « Données démo » ; tes vraies données reviennent telles quelles.

Mesuré : espace `demo_*` (`js/demo-namespace.js`, `cleDemo`) ; bouton « Quitter la démo » (`index.html:4018`) ; phrase de sortie reprise de l'Aide `demo`.

---

## Ce que je n'ai pas pu mesurer

1. **L'écran lui-même.** Tout est mesuré dans le code, rien à l'écran : aucun navigateur n'a été ouvert. En particulier, je n'ai pas vu la démo s'ouvrir sur Suivi du groupe (je me fie à l'Aide `demo`, validée).
2. **Où va une copie faite pendant la démo.** Pendant la démo, `cle('grillesTemplates')` rend `demo_grillesTemplates` (commentaire de `js/demo-activation.js:448-451`), et `peuplerNamespace` réécrit ces clés à chaque nouvelle version du pack (`js/demo-namespace.js:177-191`). *Inférence, non vérifiée :* une copie « Dupliquer pour créer ma grille » faite en démo resterait dans la démo et serait écrasée à la prochaine version du pack. C'est pourquoi le bloc 4 ne dit plus « dans ta bibliothèque » ni où vit la copie. À vérifier avant de promettre davantage ; si l'inférence tient, la question remonte à Grégoire (ce que l'enseignant·e croit garder).
3. **La date du 3 novembre 2025.** Elle n'a que 3 entrées de présence sur 10 (pack). *Inférence :* si la séance compte comme saisie, les 7 autres comptent absent·es (« Non saisi·e : compté·e absent·e », Aide `saisie-presences`). Non vérifié à l'écran. Je le signale sans l'inscrire (aucun symptôme vécu).
4. **Une démo installée avant #970** garde son ancienne carte jusqu'au prochain pack (`js/demo-namespace.js:37`) : chez elle, le compte de liens peut différer de 12. Je n'ai pas la version antérieure de la carte.
5. **La banque de « Questions flash » en démo** : le pack n'en livre pas (aucune clé de questions) ; je n'ai pas établi ce que l'outil montre alors. La bulle 16 n'en dit rien.
6. **« Remplacée »**, filtre de statut de la Liste des évaluations, et les 3 évaluations non verrouillées du pack : je n'en dis rien, faute de les avoir vues à l'écran.

## Les choix que j'ai faits seul

- **Titres des bulles = libellé exact du sous-onglet** (`js/config.js`), y compris « Profils individuels » au pluriel, et sans le préfixe « Labo — » que seule la Modélisation portait.
- **Deux clés mortes** : je propose de reposer la bulle 1 sous `suivi-groupe` et de retirer la bulle 5, plutôt que de réécrire des textes qui ne s'affichent pas.
- **Aucune bulle neuve** pour les écrans qui n'en ont pas (Apporter mon matériel, Pratiques de notation, Trimestre, Rencontres, les autres onglets du Labo) : hors mandat.
- **Bloc 2 de la fenêtre inchangé** : il est validé par Grégoire (G4, 7 oct.).
- **Le parcours en trois temps (bloc 4) garde ses trois noms** (modélisation, pratique guidée, autonomie) : c'est de la didactique, je n'ai corrigé que les gestes. Le bloc 3 garde la phrase sur l'enseignement explicite, resserrée.
- **Aucun nom d'étudiant·e** dans les textes : les étudiant·es du pack portent des noms de personnes célèbres, donc réelles ; j'ai préféré n'en citer aucun.
- **Le « survole un point » est retiré** de la bulle 1 : sur iPad, l'attribut `title` ne s'affiche pas ; « Détails » marche sur les deux appareils.
- **Typographie** : les espaces avant « ; », « : » et dans « … » sont des espaces ordinaires ici ; à l'intégration, ils deviennent insécables (` `), comme dans le code actuel.
- **Hors périmètre, constaté en chemin** : les définitions du glossaire « Cartouche de rétroaction » (« automatiquement ») et « Niveau RàI » (« tableau de bord », « recommandée ») gardent des mots que les bulles abandonnent. Je ne les ai pas touchées.

---

## Relecture de Cowork (29 oct. 2026, 7 h 53)

- **Les bulles 1 à 18** : vérifiées par sondage contre le code et les entrées validées de l'Aide (la bulle 1 reprend mot pour mot la phrase validée de `tableau-bord`, `index.html:10821`). Rien de faux trouvé. Soumises à Grégoire par groupes, dans l'ordre du fichier ; sa validation s'inscrit ci-dessous, groupe par groupe.
- **Bloc 4, « Autonomie » : l'inférence du § « Ce que je n'ai pas pu mesurer », point 2, tient à la lecture du code.** « Dupliquer pour créer ma grille » écrit dans `cle('grillesTemplates')` (`js/grilles.js:5656`), qui rend `demo_grillesTemplates` pendant la démo, et `peuplerNamespace` réécrit cette clé à chaque nouvelle version du pack (`js/demo-namespace.js:177-191`). Une copie faite en démo reste dans la démo et disparaît à la version suivante du pack. « la copie est à toi » ne peut pas s'écrire tel quel : la question va à Grégoire avec la fenêtre « Données démo » (ce que l'enseignant·e croit garder).
- **Typographie** : dans le bloc 4, les « — » qui suivent les trois noms deviennent « – » (la règle de Grégoire, appliquée à l'accueil le 28 oct.).

## Validations de Grégoire
- **Groupe 1 (bulles 1 à 4, le Suivi) : validé par Grégoire le 29 oct. 2026 à 7 h 53** (« on garde »), mot pour mot.
- **Groupe 2 (bulles 6 à 8 ; la bulle 5, clé morte, retirée par décision de Cowork) : validé par Grégoire le 29 oct. 2026 à 7 h 54** (« on garde »), mot pour mot.
- **Groupe 3 (bulles 9 à 11, les copies) : validé par Grégoire le 29 oct. 2026 à 7 h 54** (« on garde »), mot pour mot.
- **Groupe 4 (bulles 12 à 15, la Conception) : validé par Grégoire le 29 oct. 2026 à 7 h 55** (« on garde »), mot pour mot.
- **Groupe 5 (bulles 16 à 18) : validé par Grégoire le 29 oct. 2026 à 7 h 57** (« on garde »), mot pour mot. Les 17 bulles sont validées ; reste la fenêtre « Données démo ».
- **La copie faite en démo : décision de Grégoire le 29 oct. 2026 à 8 h 00** (« oui » à la recommandation de Cowork). La fenêtre dit la vérité : « Elle reste dans la démo : une nouvelle version du pack l'efface. » (bloc 4, « Autonomie », remplace « Tu pars du modèle ; la copie est à toi. »). Un chantier est inscrit sur la page du tri : qu'une copie faite pendant la démo puisse rejoindre la bibliothèque de l'enseignant·e, ce qui rendrait l'étape « Autonomie » réelle.
- **Fenêtre « Données démo », titre et blocs 1, 3 et 4 : validés par Grégoire le 29 oct. 2026 à 8 h 02** (« on garde »), mot pour mot (bloc 4 dans sa version ↻ du 29 oct.). Le bloc 2 reste celui du 7 oct.
- **Fenêtre « Données démo », blocs 5, 6 et 7 : validés par Grégoire le 29 oct. 2026 à 8 h 03** (« on garde »), mot pour mot. **Tout le fichier est validé** : 17 bulles, la bulle 5 retirée, la fenêtre (titre, blocs 1 et 3 à 7 ; bloc 2 du 7 oct.). À poser : `CONSIGNE-LOT-2026-10-29-guidage-demo.md`.
