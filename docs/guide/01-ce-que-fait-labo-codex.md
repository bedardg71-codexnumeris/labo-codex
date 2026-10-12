# 1. Ce que fait Labo Codex

> **Statut : BROUILLON du 12 octobre 2026**, rédigé par Claude Code à partir du code et des
> documents du dépôt (version 1.199.0). **À corriger par Grégoire Bédard.** Les passages marqués
> **[À valider]** sont des points où la rédaction a dû choisir ou interpréter.
>
> **Pour qui** : tous les lecteurs du guide : le développeur qui reprend le code sans connaître
> la pédagogie, le pédagogue qui répond de l'application sans connaître le code, et le cégep qui
> l'héberge.
>
> **Ce que ce document n'est pas** : un mode d'emploi (c'est l'Aide intégrée à l'application) ni
> une description technique (voir le document 8, Architecture). Il dit ce que l'application fait,
> pour qui, avec quels objets, et dans quel ordre on s'en sert.

---

## 1.1 En une page

Labo Codex est une **application web de suivi formatif des apprentissages** pour l'enseignement
au collégial. Un enseignant y pose le cadre de son trimestre (cours, groupe, horaire, élèves),
conçoit ses évaluations (productions, grilles de critères, échelles, rétroactions), corrige les
copies de ses élèves directement à l'écran, leur remet une rétroaction en PDF, et suit
l'engagement et la progression de chacun au fil du trimestre.

Trois traits la définissent, et un repreneur doit les connaître avant tout le reste :

1. **Les données restent chez l'utilisateur.** Il n'y a pas de serveur d'application ni de base
   de données centrale : tout vit dans le navigateur de l'enseignant (stockage local du
   navigateur) et dans les fichiers qu'il enregistre lui-même. Aucune donnée n'est transmise,
   aucune télémétrie n'est collectée. Voir le document 2, Principes.
2. **Elle fonctionne hors ligne.** Une fois chargée, elle n'a plus besoin du réseau. Elle peut même
   s'ouvrir depuis un fichier local (`file://`), une clé USB par exemple.
3. **Elle accueille plusieurs façons d'évaluer.** L'application ne prescrit pas une pédagogie :
   elle propose quatre familles de pratiques de notation (sommative traditionnelle et trois
   variantes de la notation par standards, regroupées sous le nom PAN) que chaque enseignant
   configure. Le modèle de l'auteur en est un exemple, pas la norme. Voir le document 13.

## 1.2 Pour qui

- **Les enseignants du collégial**, toutes disciplines. Le vocabulaire de l'application vise une
  discipline neutre : une rétroaction ne parle que de la discipline de celui qui l'écrit.
- **Les orthopédagogues**, qui ont une porte d'entrée dédiée à l'accueil (« Tu es
  orthopédagogue ? ») et une sous-section « Rencontres » pour les rencontres individuelles ou en
  sous-groupe. Dans l'application, l'orthopédagogie est un **service**, que l'on configure à la
  place d'un cours.
- **L'auteur**, Grégoire Bédard, enseignant de littérature au Cégep de Drummondville, qui l'utilise
  dans sa propre pratique depuis l'automne 2025.

**État d'adoption** : depuis septembre 2026, d'autres enseignants l'utilisent, notamment autour
d'une communauté de pratique de l'AQPC (lien « CoP » de la barre de navigation). **Leur nombre
n'est mesuré nulle part** : l'application ne collecte rien, c'est une conséquence directe du
principe 1.

## 1.3 Les objets, et comment ils s'emboîtent

Le cœur de l'application est une hiérarchie. Chaque objet a son écran, et l'ordre ci-dessous est
celui dans lequel l'enseignant les crée.

**Le cadre** (section « Cadre ») :

1. **Trimestre** : le contenant de tout. Dates, congés, journées de reprise ; il génère le
   calendrier scolaire. Presque toutes les données sont rangées par trimestre.
2. **Cours ou service** : le cours enseigné (code, titre), ou un service comme l'orthopédagogie.
3. **Enseignant·e**.
4. **Étudiant·es** : la liste du groupe, importée d'un fichier, collée depuis un tableur ou
   Omnivox, ou saisie à la main. Chaque élève est identifié par son **DA** (numéro d'admission).
5. **Horaire** : les séances de la semaine.
6. **Groupe-cours** : **l'assemblage** des cinq précédents (un trimestre, un cours, un numéro de
   groupe, un horaire, un·e enseignant·e), auquel on peut rattacher une pratique de notation.
   C'est l'unité de travail : l'enseignant choisit son **groupe-cours actif** dans l'en-tête, et
   la plupart des écrans montrent celui-là.

**La conception** (section « Conception ») :

- **Production** : un travail demandé aux élèves (dissertation, examen, exercice…), avec sa
  pondération, son échéance et l'activité d'apprentissage qu'elle sanctionne.
- **Grille de critères** : ce que l'on évalue dans une production.
- **Échelle de performance** : les niveaux possibles pour chaque critère, et leurs seuils.
- **Cartouche de rétroaction** : une matrice de commentaires prêts à l'emploi, un par critère et
  par niveau. On la génère en liant une grille et une échelle.
- **Pratique de notation** : la règle qui transforme les évaluations en note. Elle se construit
  avec un assistant.

Une production se lie à **une** grille, **une** échelle et **une** cartouche. Grilles, échelles
et cartouches sont réutilisables d'un trimestre et d'une production à l'autre, et peuvent se
partager entre collègues.

**Le travail du trimestre** :

- **Présences**, saisies séance par séance.
- **Copies** : les fichiers des travaux remis (PDF, images, photos HEIC), importés puis associés
  aux élèves.
- **Évaluations** : la copie annotée, les niveaux attribués à chaque critère, la rétroaction ;
  puis le verrouillage. Certaines pratiques ajoutent des **jetons** (délai, reprise, reprise
  ciblée) que l'élève peut utiliser.
- **Indices** : l'application calcule pour chaque élève trois indices, **A** (assiduité),
  **C** (complétion des travaux) et **P** (performance), à partir desquels elle repère les élèves
  à surveiller. Voir le glossaire (document 3).
- **Interventions** : les actions de soutien planifiées pour un groupe ciblé ou un individu,
  selon le modèle de la réponse à l'intervention (RàI).

**Où vivent ces objets** : les données d'élèves, d'évaluations, de productions et de
configuration de notation sont **rangées par trimestre** ; les trimestres eux-mêmes, la liste
des cours, les enseignants, les préférences et les bibliothèques sont **communs à tous les
trimestres**. Le détail est au document 8.

## 1.4 La navigation

La barre principale compte six sections, plus un lien externe. **L'Aide et les Réglages** ne sont
pas dans la barre : ce sont des icônes de l'en-tête.

Le développeur retrouvera chaque écran par son **identifiant interne** (colonne de droite), qui
diffère parfois du libellé.

| Section (libellé) | Sous-sections (libellés) | Identifiants internes |
|---|---|---|
| « Accueil » | aucune : des cartes de tâches et d'utilitaires | `accueil` |
| « Cadre » | « Trimestre », « Calendrier scolaire » | `calendrier` : `trimestre`, `vue` |
| « Conception » | « Carte d'alignement », « Productions étudiantes », « Grilles de critères », « Échelles de performance », « Cartouches de rétroaction », « Pratiques de notation » | `conception` : `carte`, `productions`, `grille-criteres`, `echelle-performance`, `retroactions`, `pratiques-notation` |
| « Évaluation » | « Préparer et importer », « Liste des évaluations », « Annoter et évaluer », « Exporter et archiver » | `evaluations` : `importer`, `liste`, `annoter`, `exporter` |
| « Suivi » | « Suivi du groupe », « Liste des étudiant·es », « Saisie des présences », « Profils individuels », « Interventions », « Rencontres », « Animation » | `suivi` : `groupe`, `liste`, `saisie`, `profil`, `interventions`, `rencontres`, `animation` |
| « Labo » | « Outils d'observation », « Modélisation », « Exploration des pratiques », « Rythme de travail », « Études », « Bilan réflexif », « Suivi longitudinal » | `labo` : `accompagnement`, `modelisation`, `comparateur`, `rythme`, `etudes`, `bilan`, `longitudinal` |
| « CoP » | lien vers la communauté de pratique de l'AQPC | aucun |
| Aide (icône) | « Introduction », « Configuration », « Formation et démonstration », « Utilisation hebdomadaire », « Consultation », « Référence rapide » | `aide` |
| Réglages (icône) | « Préférences », « Données », « À propos » | `reglages` |

La liste de référence est la constante `configurationsOnglets` de `js/config.js`, fichier
protégé : on ne la modifie qu'avec l'accord du responsable du projet.

**Ce que fait la section « Labo »** : c'est l'espace d'analyse de sa propre pratique. On y règle
les outils d'observation (taxonomie SOLO, dépistage), on compare des pratiques de notation sur
des profils d'élèves types, on mesure le temps passé à corriger, on mène un bilan réflexif
auprès des élèves, et on suit des élèves d'un trimestre à l'autre.

## 1.5 Le parcours d'un trimestre

| Étape | Où, dans l'application |
|---|---|
| Créer le trimestre (le calendrier se génère) | Cadre › Trimestre, accordéon « Trimestre » |
| Cours, enseignant·e, élèves, horaire, puis assembler le groupe-cours | Cadre › Trimestre, accordéons successifs |
| Choisir ou construire sa pratique de notation | Conception › Pratiques de notation, ou Accueil › « Adopter ta pratique » |
| Productions, grilles, échelles, cartouches | Conception, quatre sous-sections |
| Planifier le cours (séquences, leçons, liens avec les évaluations) | Conception › Carte d'alignement (facultatif) |
| Saisir les présences | Suivi › Saisie des présences |
| Importer les copies | Évaluation › Préparer et importer |
| Annoter, évaluer, verrouiller | Évaluation › Annoter et évaluer |
| Remettre la rétroaction en PDF | Évaluation › Exporter et archiver, ou Liste des évaluations |
| Observer le groupe, consulter un élève | Suivi › Suivi du groupe, Profils individuels |
| Planifier des interventions | Suivi › Interventions (ou Rencontres pour un service) |
| Exporter les résultats finaux | Suivi › Suivi du groupe, « Exporter la synthèse (CSV) » |
| Clore le trimestre | Cadre › Trimestre, bibliothèque des trimestres, « Clore » |
| Archiver | menu « Codex » de l'en-tête, « Archiver… » |

**Clore et archiver ne sont pas la même chose.** Un trimestre **clos** est gelé dans
l'application : il reste consultable en lecture seule. Un trimestre **archivé** est déposé hors
du navigateur, dans les Archives (section suivante), et peut en revenir.

## 1.6 Les espaces de données

Comme rien ne vit sur un serveur, l'application organise elle-même la sauvegarde et la
circulation des données. Les Réglages › Données présentent quatre concepts :

- **Codex** : l'espace de travail actif, enregistré dans un fichier `.codex.zip` (données et
  copies) que l'enseignant garde où il veut, par exemple sur une clé USB. C'est sa sauvegarde et
  le moyen de passer d'un appareil à l'autre. Menu « Codex » de l'en-tête.
- **Archives** : un dépôt local, hors du navigateur, où l'on verse ce qui est terminé (un
  groupe-cours, un trimestre clos, ses copies). Jamais purgé. **Dans le code, les Archives
  s'appellent « Réserve »** (fichiers `js/reserve*.js`).
- **Codex data** : un extrait sans les copies, qui peut réunir plusieurs trimestres, pour
  l'analyse dans le Labo. **Il porte les noms des élèves** : l'anonymisation est prévue mais pas
  écrite. Il ne se partage donc pas.
- **Partage** : des ressources (grilles, échelles, cartouches, pratiques) exportées dans des
  fichiers signés (`.lcz`) pour des collègues. Aucune donnée d'élève n'y voyage.

Le document de référence sur ces espaces est `docs/architecture/ECOSYSTEME-DONNEES.md`. Le
document 11 du guide dira ce qu'un développeur doit savoir des formats qui voyagent.

## 1.7 Les modes et les aides transverses

- **Démonstration** : un cours fictif, déjà configuré, à explorer sans risque (carte « Données
  démo » de l'accueil). Ses données sont isolées de celles de l'enseignant.
- **Anonymisation** : une icône de l'en-tête remplace les noms des élèves par « Élève N » à
  l'écran, par exemple pour projeter devant la classe ou faire une capture d'écran.
- **Assistance** : visite guidée, info-bulles, aide contextuelle, et guides pédagogiques
  (SOLO, indices A-C-P, RàI, pratiques de notation).
- **« Nouveautés »** : le journal des changements, rédigé pour les utilisateurs. Les sessions de
  développement l'appellent « Nouvelles ».
- **Signaler un bug ou donner ton avis** : un formulaire qui prépare un courriel vers l'équipe.
  C'est le seul canal de retour : l'application n'envoie rien d'elle-même.
- **Thème clair ou sombre**.

## 1.8 Où elle tourne

- **Appareils de référence** : Mac et iPad, avec Safari. L'iPad est un cas d'usage principal,
  pas un appoint. Chrome, Firefox et Edge sont déclarés pris en charge ; au moins un utilisateur
  travaille avec Chrome sous Windows.
- **En ligne** : à l'adresse `app.codexnumeris.org`, derrière une porte d'authentification par
  courriel (Cloudflare Access). Le document 15 en décrit l'exploitation.
- **Hors ligne, depuis un fichier local** : possible en tout temps, avec quelques limites (les
  photos HEIC ne se décodent pas, la vérification de mise à jour n'a pas lieu).
- **Une conséquence à retenir** : les données d'un utilisateur sont liées au navigateur et à
  l'adresse d'où il ouvre l'application. La même application ouverte depuis une autre adresse
  démarre vide.

## 1.9 Si vous lisez autre chose ailleurs

L'application a beaucoup changé en un an, et plusieurs textes ne l'ont pas suivie. **Ce document
décrit le code de la version 1.199.0.** Quand un autre texte le contredit, c'est le code qui fait
foi. Écarts connus au 12 octobre 2026 :

| Vous lirez ailleurs | La réalité du code |
|---|---|
| « Réserve », « verser », et l'interdiction d'« archiver » (ADR-011) | L'interface dit « Archives » et « Archiver… » ; « Réserve » ne survit que dans le code |
| Le codex data est « anonymisé » (README, ADR-011) | L'anonymisation n'est pas écrite ; le codex data porte des noms |
| Échelle IDME : « Insuffisant, Développement, Maîtrisé, Étendu » (README, ADR-005) | L'application affiche « Incomplet, Développement, Maîtrise, Étendu » |
| Paliers RàI « Préventif » et « Intensif » (README, Aide, profil de l'élève) | Le formulaire d'intervention dit « Groupe ciblé » (niveau 2) et « Individuel » (niveau 3) : l'application emploie les deux noms selon l'écran |
| « Tableau de bord », « Aperçu » | La sous-section s'appelle « Suivi du groupe » |
| « Mode sombre (par défaut) » (Aide) | Le thème par défaut est clair |
| Un export JSON complet dans Réglages › Données (Aide, ancienne doc) | Retiré ; la sauvegarde passe par le Codex |
| Une « cartouche » est un bloc d'identification (`POUR-LE-PROJET-CLAUDE.md`) | C'est une matrice de commentaires de rétroaction |
| Usage « individuel par son auteur » (README) | D'autres enseignants l'utilisent depuis septembre 2026 |

**[À valider]** Les écarts de l'Aide intégrée sont des textes lus par les utilisateurs : leur
correction relève du responsable du projet, pas du développeur.

---

**Sources principales** : `js/config.js` (navigation), `index.html` (libellés), `js/accueil.js`,
`js/accompagnement.js`, `docs/architecture/ECOSYSTEME-DONNEES.md`, `docs/DATA-OWNERSHIP.md`,
`OBJECTIF-COHORTE-1.md`, `README.md`, `DEPLOY.md`, `PRIVACY.md`. Relevé du 12 octobre 2026 sur
le commit `a73ffb0d`.
