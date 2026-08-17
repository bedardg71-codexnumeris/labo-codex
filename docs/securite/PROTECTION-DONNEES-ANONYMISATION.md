# Protection des données — Anonymisation pour le partage

> **Document autonome** — première version : 6 mai 2026.
>
> **Question d'origine (Grégoire)** : comment protéger les micro-data recueillies par un enseignant, dans le contexte particulier du partage (Voûte, recherche pédagogique, collègues).
>
> **Angle traité** : l'**anonymisation**, c'est-à-dire la transformation des données identifiantes en données non identifiantes **avant tout partage hors du codex original**. Troisième et dernier document de la série « Protection des données vivantes ». Les deux précédents traitent du chiffrement au repos (doc A) et du versioning (doc B).
>
> **Distinction importante avec les autres angles** : le chiffrement et le versioning protègent les données **dans leur état complet et identifiant**, sur ta machine. L'anonymisation **transforme** les données pour qu'elles puissent voyager — vers la Voûte, vers la recherche pédagogique, vers un collègue — sans révéler l'identité des étudiants.
>
> **Liens avec d'autres docs** : ce document concrétise le §3 du `.claude/skills/securite-donnees/SKILL.md` (Anonymisation), §1.2 (Données indirectement identifiantes), §1.4 (Données pédagogiques partageables). Et la mention X-01 P3 (anonymisation comme défense contre l'exfiltration) du `MODELE-MENACES.md`.

---

## Table des matières

1. [Pourquoi anonymiser](#1-pourquoi-anonymiser)
2. [Quand anonymiser, quand ne pas anonymiser](#2-quand-anonymiser-quand-ne-pas-anonymiser)
3. [Pseudonymisation vs anonymisation](#3-pseudonymisation-vs-anonymisation)
4. [Les données à transformer (inventaire détaillé)](#4-les-données-à-transformer-inventaire-détaillé)
5. [Stratégies de transformation](#5-stratégies-de-transformation)
6. [Le risque de ré-identification](#6-le-risque-de-ré-identification)
7. [Cas spécifiques](#7-cas-spécifiques)
8. [Architecture proposée pour Labo Codex](#8-architecture-proposée-pour-labo-codex)
9. [L'UX de l'anonymisation](#9-lux-de-lanonymisation)
10. [Limites légales et décisions en suspens](#10-limites-légales-et-décisions-en-suspens)
11. [Plan de mise en œuvre en trois phases](#11-plan-de-mise-en-œuvre-en-trois-phases)
12. [Questions ouvertes pour Grégoire](#12-questions-ouvertes-pour-grégoire)
13. [Synthèse en une page](#synthèse-en-une-page)

---

## 1. Pourquoi anonymiser

### 1.1 Trois motivations distinctes

**Motivation 1 — Recherche pédagogique.** Tu accumules depuis plusieurs trimestres des données sur la progression de tes étudiants : indices A-C-P-E, présences, notes, observations qualitatives. Cette masse d'observations est précieuse pour comprendre des phénomènes pédagogiques (corrélations entre indices, efficacité de méthodes d'évaluation, profils d'apprentissage). Pour publier ou collaborer sur cette recherche, tu ne peux pas diffuser des données identifiantes — il faut anonymiser.

**Motivation 2 — Partage entre enseignants via Voûte.** Quand la Voûte sera ouverte, tu pourras peut-être partager un « codex data » avec des collègues qui veulent voir des exemples de pratique d'évaluation. Tu ne partages pas tes étudiants nominalement — tu partages des données anonymisées qui montrent comment ta pratique fonctionne sans identifier qui que ce soit.

**Motivation 3 — Conformité Loi 25 lors de tout transfert hors du codex original.** Le DA d'un étudiant est un renseignement personnel identifiant inter-institutionnel (SRAM, 32 cégeps). Le faire sortir de ta machine sans anonymisation t'expose à une obligation de signalement à la CPVP en cas de fuite et engage la responsabilité de ton cégep.

### 1.2 Distinction avec les autres angles de protection

| Angle | Ce qu'il fait | Données concernées | Quand s'applique |
|---|---|---|---|
| Chiffrement au repos (doc A) | Rend les données illisibles sans clé | Données dans IndexedDB de ton Mac | Au repos, hors session |
| Versioning (doc B) | Permet la restauration | Données dans IndexedDB et Réserve | À tout moment, en cas de perte |
| **Anonymisation (ce doc)** | Transforme les données pour qu'elles ne soient plus identifiantes | Données qui voyagent hors du codex original | Au moment de l'export pour partage |

Les trois sont **complémentaires** :
- Le chiffrement protège ton **codex original** contre l'accès non autorisé.
- Le versioning te permet de revenir en arrière en cas de problème.
- L'anonymisation transforme ce qui sort de chez toi pour que ça soit publiable.

### 1.3 Lien avec le scénario X-01 du modèle de menaces

Le scénario X-01 décrit le vol des données identifiantes (DA, noms, journal confidentiel) via une grille empoisonnée. Si tes données dans le codex sont anonymisées **par défaut**, l'attaque perd beaucoup de sa valeur — il ne reste rien d'identifiant à voler.

**Mais** : l'anonymisation s'applique aux **exports** et aux **données partagées**. Dans ton codex de travail quotidien, tu as besoin des vrais noms (tu enseignes à de vraies personnes). Le codex original reste donc identifiant. L'anonymisation est une transformation **au moment du partage**, pas une protection au stockage.

---

## 2. Quand anonymiser, quand ne pas anonymiser

### 2.1 Ne pas anonymiser : ton codex actif

Ton codex de travail quotidien doit rester identifiant. Tu as besoin de :
- Voir le nom de Marie-Hélène quand tu corriges son devoir.
- Reconnaître Pierre quand tu remarques son pattern d'absences.
- Faire le lien entre un étudiant et son DA quand tu communiques avec l'administration.

Pour ces usages, **toute anonymisation serait néfaste**. Les noms et DA sont nécessaires à ton travail. La protection ici relève du chiffrement (doc A) et du contrôle d'accès (verrouillage de session, FileVault).

### 2.2 Anonymiser : tout ce qui sort du codex original

Quatre cas typiques où l'anonymisation est nécessaire :

**Cas 1 — Export pour publication ou recherche.** Tu prépares un article sur la corrélation entre indices A-C-P et résultats sommatifs. Tu veux inclure des données réelles. Tu anonymises avant de publier.

**Cas 2 — Partage avec un collègue chercheur.** Une collègue prépare un mémoire sur l'évaluation par compétences. Tu lui passes des exemples de tes évaluations. Tu anonymises avant le transfert.

**Cas 3 — Dépôt dans la Voûte (futur).** Tu déposes un « codex data » dans la Voûte pour que d'autres enseignants puissent s'inspirer de ta démarche. Le dépôt est anonymisé.

**Cas 4 — Analyse par une IA tierce.** Tu demandes à ChatGPT ou Claude (en dehors de ton Mac) d'analyser tes données pour trouver des patterns. Tu anonymises avant de soumettre la requête (cf. risque de prompt injection mentionné dans le document `MODELE-MENACES.md` — et risque RGPD/Loi 25 du transfert vers un service tiers).

### 2.3 Cas intermédiaire : la Réserve sur disque

La Réserve archive des trimestres complets. Doit-elle contenir des données identifiantes ou anonymisées ?

**Position pragmatique** : **les deux versions**.

- Un versement **complet et identifiant** dans la Réserve, protégé par FileVault et le chiffrement local. C'est ton archive de travail à long terme.
- Une version **anonymisée** générée à la demande, qui peut être copiée vers un service externe ou la Voûte.

Cette dualité est cohérente avec ton workflow réel : tu as besoin de récupérer un étudiant nommément même 5 ans plus tard (correction d'erreur, attestation, recherche personnelle). L'anonymisation **détruit** cette possibilité — donc on la garde pour les cas où elle est nécessaire, on ne l'applique pas à l'archive maître.

---

## 3. Pseudonymisation vs anonymisation

C'est une distinction technique importante avec des conséquences légales différentes.

### 3.1 Anonymisation (au sens Loi 25)

**Définition** : transformation qui rend la ré-identification **mathématiquement impossible**, même pour le producteur des données.

Exemple : tu remplaces le nom « Marie-Hélène Tremblay » par « Étudiante-001 » **et tu détruis la table de correspondance**. Plus personne, toi compris, ne peut savoir que Étudiante-001 est Marie-Hélène.

Conséquence légale : les données anonymisées au sens strict **ne sont plus des renseignements personnels** au sens de la Loi 25. Elles échappent aux obligations de protection, de conservation limitée, de droit d'accès.

**Avantage** : régime simplifié, possibilité de publier librement.

**Inconvénient** : tu ne peux pas inverser. Si tu réalises 6 mois plus tard que tu as fait une erreur dans le profil de Marie-Hélène et que tu veux la corriger dans tes données publiées, c'est impossible — tu ne sais plus qui elle est.

### 3.2 Pseudonymisation (au sens Loi 25)

**Définition** : transformation qui retire les identifiants directs (noms, DA) **mais permet la ré-identification par une partie qui détient la clé de correspondance**.

Exemple : tu remplaces « Marie-Hélène Tremblay » par « Étudiante-001 » **mais tu gardes une table chiffrée localement qui dit « Étudiante-001 ↔ Marie-Hélène Tremblay »**. Tu peux remonter quand tu veux. Personne d'autre ne peut.

Conséquence légale : les données pseudonymisées **restent des renseignements personnels** au sens de la Loi 25 — parce qu'une partie (toi) a toujours la capacité de ré-identifier. Tu restes responsable de leur protection, même partagées.

**Avantage** : flexibilité (correction d'erreurs, suivi longitudinal).

**Inconvénient** : régime plus contraignant, et la table de correspondance est elle-même un actif sensible à protéger.

### 3.3 Décision en suspens (cf. SKILL_Securite_donnees §3.1)

Le `.claude/skills/securite-donnees/SKILL.md` §3.1 marque explicitement la décision en suspens entre :
- **Pseudonymisation réversible** : table de correspondance chiffrée localement, l'enseignant peut inverser.
- **Anonymisation irréversible** : correspondance détruite, plus personne ne peut remonter.

Cette décision relève de l'avis Loi 25 que tu prévoyais consulter. Pour ce document, je propose les deux options en parallèle (ton module d'anonymisation peut faire l'un ou l'autre selon ton choix au moment de l'export). C'est techniquement faisable et te laisse la flexibilité.

### 3.4 Cas d'usage pour chaque mode

**Choisir l'anonymisation irréversible quand** :
- Tu publies des données dans un article ou une thèse.
- Tu déposes dans une Voûte ouverte au public.
- Tu n'as pas besoin de re-corréler aux étudiants individuels.

**Choisir la pseudonymisation réversible quand** :
- Tu partages avec un cercle restreint (équipe de recherche).
- Tu veux pouvoir corriger des erreurs après coup.
- Tu fais un suivi longitudinal sur plusieurs sessions.

---

## 4. Les données à transformer (inventaire détaillé)

Reprise et extension du `.claude/skills/securite-donnees/SKILL.md` §3.2.

### 4.1 Données directement identifiantes (à transformer obligatoirement)

| Donnée | Traitement recommandé | Réversible ? |
|---|---|---|
| Nom, prénom | Remplacement par identifiant séquentiel (`Étudiant-001`) | Optionnel (selon mode) |
| DA (numéro d'admission) | **Suppression complète**, pas de hash | Non. Un hash de 7 chiffres est réversible par force brute en secondes (10⁷ tentatives). |
| Numéro de groupe | Remplacement par identifiant générique (`Groupe-A`) | Optionnel |
| Adresse courriel étudiant | Suppression complète | Non |
| Date de naissance complète | **Généralisation** : remplacer par décennie ou tranche d'âge | Non (par construction) |

**Sur le DA** : c'est une donnée particulièrement sensible. Un DA permet à n'importe qui ayant accès à un autre système (Lea, Omnivox, base SRAM) de croiser les données. Il **doit** être supprimé, pas hashé. Le hash de 7 chiffres décimaux peut être inversé par essai-erreur en quelques secondes — donc équivalent à pas de protection.

### 4.2 Données indirectement identifiantes (à atténuer)

Données qui, combinées, permettent la ré-identification dans un petit groupe.

| Donnée | Risque | Traitement |
|---|---|---|
| Profil de notes (10+ productions) | Quasi unique dans groupe de 25 | Agrégation par groupe, retrait des outliers, ou bruit différentiel |
| Pattern de présences | Discriminant si combiné aux notes | Généraliser (présent / absent partiel) |
| Indices A-C-P-E par étudiant | Profil comportemental identifiable | Conserver si l'analyse en a besoin, sinon agréger |
| Interventions RaI | Cible les étudiants en difficulté | Conserver avec attention — c'est précisément la cible de la recherche |
| Snapshots de progression | Trajectoire temporelle individuelle | Conserver si l'analyse en a besoin |
| Genre / langue maternelle (si saisis) | Avec petit groupe, fortement discriminant | Suppression ou regroupement très large |

### 4.3 Données biométriques involontaires

| Donnée | Risque | Traitement |
|---|---|---|
| Photos de travaux manuscrits | Écriture manuscrite = biométrique. Nom souvent écrit sur la copie. | **Exclusion par défaut** du codex data anonymisé. Pas anonymisable sans OCR + masquage du nom écrit. |
| PDF de travaux natifs | Métadonnées (auteur, timestamps) | Strip metadata + exclusion par défaut |

Les blobs (photos, PDF) ne sont pas anonymisables par renommage seul. Le `.claude/skills/securite-donnees/SKILL.md` §1.3 et §3.2 sont explicites sur ce point. La décision opérationnelle est : par défaut, les blobs sont **exclus** du codex data anonymisé. Exception possible avec consentement explicite et traitement supplémentaire (masquage des noms écrits, conversion en transcription textuelle).

### 4.4 Données pédagogiques (partageables presque sans transformation)

| Donnée | Caractère | Transformation |
|---|---|---|
| Grilles d'évaluation | Travail intellectuel de l'enseignant | Aucune si tu acceptes d'être attribué comme auteur |
| Échelles descriptives | Idem | Aucune |
| Cartouches (commentaires types) | Idem | Aucune |
| Productions (gabarits) | Structure pédagogique | Aucune |
| Séquences, objectifs | Idem | Aucune |

Pour ces données, le mécanisme de protection est la **licence CC BY-NC-SA** (cf. `.claude/skills/securite-donnees/SKILL.md` §1.4 et `cc-license.js`), pas l'anonymisation. Tu acceptes que ton travail soit attribué à toi (par opposition à anonymisé) parce que c'est ton travail intellectuel — l'anonymisation aurait l'effet inverse de te dépouiller de la paternité.

### 4.5 Métadonnées de contexte (à décider au cas par cas)

| Donnée | Décision | Justification |
|---|---|---|
| Nom de l'enseignant | Conservé sauf demande explicite d'anonymat | C'est l'auteur — pas un sujet de recherche |
| Nom du cégep | Conservé selon consentement de l'enseignant | Indique l'institution mais ne ré-identifie pas individuellement |
| Discipline, niveau | Conservé | Métadonnée de recherche nécessaire |
| Session (trimestre) | **Généralisé** (« Trimestre H » sans année si nécessaire) | Combiné avec d'autres méta, peut réduire l'anonymat du groupe |

---

## 5. Stratégies de transformation

Cinq stratégies utilisables seules ou combinées selon le cas.

### 5.1 Stratégie A — Remplacement par identifiant séquentiel

**Principe** : remplacer chaque valeur identifiante par un identifiant artificiel, **stable dans le contexte de l'export** (le même étudiant a le même identifiant partout dans le fichier).

**Exemple** :
- Avant : `[{nom: "Tremblay", prenom: "Marie-Hélène", da: "2024567", ...}]`
- Après : `[{identifiant: "Étudiant-001", ...}]` (champs nom, prenom, da supprimés)

**Réversibilité** : possible si tu gardes une table de correspondance (`Étudiant-001 ↔ DA 2024567`). Stockée chiffrée localement. Sinon, irréversible.

**Pour quoi** : transformation de base, applicable à tous les exports. C'est le point de départ.

### 5.2 Stratégie B — Généralisation (réduction de précision)

**Principe** : remplacer une valeur précise par une plage ou une catégorie plus large.

**Exemples** :
- Date de naissance précise (`2007-03-15`) → décennie (`2000-2009`) ou tranche d'âge (`18-19 ans`).
- Note précise (`78.5%`) → tranche (`70-79%`) ou lettre (`B`).
- Date d'évaluation précise (`2026-05-06 14:23`) → semaine (`Semaine 12`) ou phase (`Mi-session`).

**Effet** : préserve la valeur statistique tout en réduisant le pouvoir d'identification individuelle.

**Pour quoi** : utile quand la précision n'est pas nécessaire à l'analyse. À calibrer au cas par cas.

### 5.3 Stratégie C — K-anonymité

**Principe** : s'assurer que chaque combinaison de quasi-identifiants (âge + programme + genre, par exemple) est partagée par **au moins k individus** dans l'ensemble publié. Si k=5, tu garantis qu'il n'existe pas de profil unique dans tes données — chacun est confondu avec au moins 4 autres.

**Effet** : protège contre la ré-identification par croisement de quasi-identifiants.

**Mise en œuvre** : nécessite de **généraliser** les quasi-identifiants jusqu'à ce que la condition soit remplie. Itératif et parfois lossy.

**Pour quoi** : approche rigoureuse pour la publication de données. **Difficile à atteindre dans un petit groupe** (25 étudiants) — `.claude/skills/securite-donnees/SKILL.md` §3.3 le note explicitement.

### 5.4 Stratégie D — Bruit différentiel

**Principe** : ajouter du bruit aléatoire aux valeurs numériques pour empêcher la ré-identification par valeur exacte.

**Exemple** : note de 78 → 78 ± aléatoire(2) = 76, 77, 78, 79, ou 80.

**Effet** : préserve les tendances statistiques globales (la moyenne reste représentative) mais empêche de retrouver une valeur individuelle exacte.

**Limite** : si on connaît déjà la valeur exacte d'un étudiant par un autre canal, le bruit ne protège pas (on peut savoir que `78 ± 2 = 79` est probablement Marie-Hélène qui a eu 78). Plus le bruit est large, plus la protection est forte, mais plus l'utilité statistique diminue.

**Pour quoi** : recherche pédagogique sur des populations plus grandes que 25 étudiants. Moins pertinent pour Labo Codex en l'état.

### 5.5 Stratégie E — Suppression sélective des outliers

**Principe** : retirer du dataset publié les profils **extrêmes** (le meilleur, le pire, les rares cas de doubles troubles), parce qu'ils sont plus facilement identifiables.

**Exemple** : si une étudiante a une note moyenne de 95% (la plus haute du groupe) et un autre de 32% (le plus bas), ces deux profils sont presque toujours identifiables même anonymisés. Les retirer protège.

**Effet** : protège les profils extrêmes au prix de l'exhaustivité.

**Limite** : la recherche sur les profils extrêmes est elle-même pertinente — supprimer peut biaiser l'analyse.

**Pour quoi** : compromis pragmatique pour les publications académiques.

### 5.6 Stratégie de base pour Labo Codex (recommandation)

Pour la première version du module d'anonymisation, je recommande une **combinaison simple** :

- **A. Remplacement par identifiant séquentiel** (`Étudiant-001`, `Groupe-A`) sur tous les noms, DA, numéros de groupe.
- **B. Généralisation** sur les dates de naissance (→ décennie) et les dates de productions (→ semaine).
- **Exclusion** des blobs (photos, PDF) par défaut.
- **Exclusion** des notes confidentielles du journal (commentaires de l'enseignant) par défaut, avec option d'inclusion explicite.
- **Suppression complète** des courriels étudiants.

C'est une base solide qui couvre la grande majorité des besoins. Les stratégies plus sophistiquées (C, D, E) peuvent être ajoutées en option pour les cas avancés.

---

## 6. Le risque de ré-identification

C'est la limite fondamentale de l'anonymisation dans un petit groupe.

### 6.1 Le problème en chiffres

Tu as un groupe de 25 étudiants. Tu produis un export anonymisé contenant pour chacun : 10 notes, 12 présences, indices A-C-P-E. Soit ~25 valeurs par étudiant.

Combien de profils différents sont possibles avec 25 valeurs ? Mathématiquement, beaucoup plus que 25. Statistiquement, **chaque étudiant a un profil quasi unique** dans ce groupe.

Quelqu'un qui connaît la composition du groupe (un collègue, un parent, un autre enseignant) peut, en regardant le profil anonymisé « Étudiant-001 a eu 72 / 65 / 88 / 70... », souvent l'identifier (« ça correspond aux résultats de Marie-Hélène »).

C'est noté dans le `.claude/skills/securite-donnees/SKILL.md` §3.3.

### 6.2 Mitigation 1 — Limiter l'accès

La défense la plus efficace contre la ré-identification dans un petit groupe est de **limiter qui peut accéder aux données anonymisées**. Si seul un cercle restreint et de confiance voit le codex data, le risque est contrôlable.

Concrètement :
- Ne pas publier des profils individuels de petits groupes ouvertement.
- Limiter la diffusion à des chercheurs identifiés avec engagement de confidentialité.
- Préférer la publication d'**agrégats** (moyennes, distributions) plutôt que de profils individuels.

### 6.3 Mitigation 2 — Agrégation

Plutôt que de publier 25 profils individuels, publier la moyenne du groupe + la médiane + l'écart-type. C'est presque toujours suffisant pour la recherche pédagogique et beaucoup plus difficile à ré-identifier.

### 6.4 Mitigation 3 — Combinaison de plusieurs groupes

Si tu peux **mélanger** les données de plusieurs groupes (de plusieurs trimestres, de plusieurs enseignants), le pool s'élargit. Avec 300 étudiants au lieu de 25, la k-anonymité devient atteignable.

C'est précisément un cas d'usage de la Voûte : plusieurs enseignants contribuent leurs codex data anonymisés, le pool combiné est suffisamment large pour permettre une recherche sans ré-identification.

### 6.5 Mitigation 4 — Cadre éthique

Au-delà de la technique, le cadre éthique de la recherche pédagogique impose :
- Consentement éclairé des étudiants (cf. CÉR — Comité d'Éthique de la Recherche).
- Engagement de confidentialité des chercheurs accédant aux données.
- Destruction des données à la fin de la recherche.

Ces protections **complètent** l'anonymisation technique. Elles ne la remplacent pas.

---

## 7. Cas spécifiques

### 7.1 Photos de travaux manuscrits

Position du `.claude/skills/securite-donnees/SKILL.md` §1.3 et §3.2 : les blobs sont **exclus par défaut** du codex data anonymisé.

Justifications :
- Écriture manuscrite = biométrique. Identifie l'auteur même sans nom.
- Le nom de l'étudiant est souvent écrit directement sur la copie.
- Métadonnées (EXIF) du fichier peuvent identifier l'appareil de scan ou de prise de vue.

**Si Grégoire veut inclure des exemples de travaux dans un codex data** (cas d'usage : tutoriel sur la correction, partage de productions exemplaires), il doit :
- Choisir spécifiquement quels travaux inclure (jamais le batch entier).
- Masquer manuellement les noms écrits sur les copies.
- Strip les métadonnées EXIF avant inclusion.
- Obtenir le consentement explicite de l'étudiant.

C'est lourd. C'est intentionnel — la facilité du « partager toutes mes photos » serait disproportionnée par rapport au risque.

### 7.2 Notes confidentielles du journal

Le journal contient des informations sensibles : suspicions de troubles d'apprentissage, observations comportementales, situations familiales. Même anonymisé (« Étudiant-001 : suspecte dyslexie, parents en séparation »), ces commentaires restent **fortement identifiants** pour quiconque connaît un peu le groupe.

**Recommandation** : exclusion du journal par défaut de tout export anonymisé. Inclusion **opt-in explicite** par l'enseignant, avec avertissement clair sur le risque résiduel de ré-identification.

### 7.3 Identité de l'enseignant et du cégep

Cas inverse de l'anonymisation des étudiants : l'enseignant est typiquement l'**auteur** des données partagées, pas un sujet anonyme. Conservé par défaut.

Mais l'enseignant peut souhaiter l'anonymat dans certains cas (publication d'observations critiques sur l'institution, par exemple). L'app doit permettre l'opt-in pour l'anonymisation de l'enseignant aussi.

Le cégep est plus ambigu : il identifie le contexte (« cégep régional », « cégep urbain », « grande ville ») mais peut aussi restreindre la diffusion (si la haute direction n'apprécie pas la publication). Recommandation : générer un champ « Établissement » générique par défaut, avec option de conserver le nom exact.

### 7.4 Codex data minimal vs codex data riche

L'utilisateur peut vouloir produire :

- Un **codex data minimal** : seules les données strictement nécessaires à une analyse précise. Approche conservatrice.
- Un **codex data riche** : toutes les données pédagogiques, anonymisées au maximum. Pour permettre l'analyse exploratoire.

L'outil d'anonymisation devrait permettre les deux niveaux via un sélecteur explicite.

---

## 8. Architecture proposée pour Labo Codex

### 8.1 Nouveau module `js/anonymisation.js`

API principale :

```javascript
// Pseudo-code conceptuel

/**
 * Produit un codex data anonymisé à partir du codex actif.
 * @param options - Configuration de l'anonymisation
 * @returns Un objet codex data anonymisé prêt à être exporté
 */
async function produireCodexData(options) {
  const config = {
    mode: options.mode || 'pseudonymisation', // ou 'anonymisation' irreversible
    cles_a_inclure: options.cles_a_inclure || CLES_STANDARDS,
    inclure_blobs: options.inclure_blobs || false,
    inclure_journal: options.inclure_journal || false,
    granularite_dates: options.granularite_dates || 'semaine',
    granularite_naissance: options.granularite_naissance || 'decennie',
    auteur_anonyme: options.auteur_anonyme || false,
    cegep_anonyme: options.cegep_anonyme || false
  };
  
  // 1. Charger les données identifiantes
  const donneesOriginales = await chargerDonneesPourAnonymisation(config.cles_a_inclure);
  
  // 2. Générer la table de correspondance (si pseudonymisation)
  const correspondance = config.mode === 'pseudonymisation'
    ? genererTableCorrespondance(donneesOriginales)
    : null;
  
  // 3. Appliquer les transformations
  const donneesAnonymes = appliquerTransformations(donneesOriginales, config, correspondance);
  
  // 4. Stocker la table de correspondance chiffrée localement (si pseudonymisation)
  if (correspondance) {
    await stockerCorrespondanceChiffree(correspondance, options.mot_de_passe_correspondance);
  }
  
  // 5. Retourner le codex data prêt à l'export
  return {
    format: 'codex-data',
    version: '1.0',
    mode: config.mode,
    date_anonymisation: new Date().toISOString(),
    donnees: donneesAnonymes,
    metadata: {
      groupe_taille: donneesOriginales.length,
      avertissement_reidentification: genererAvertissement(donneesAnonymes)
    }
  };
}
```

### 8.2 Table de correspondance pseudonymisée

Si mode pseudonymisation, table stockée chiffrée localement :

```
keyvalue.correspondance_codex_data:
  iv: "...",
  ciphertext: base64({
    "Étudiant-001": { da: "2024567", nom: "Tremblay", prenom: "Marie-Hélène" },
    "Étudiant-002": { da: "2024891", nom: "Lévesque", prenom: "Pierre" },
    ...
  })
```

Chiffrée avec la clé maître du chiffrement au repos (doc A). Si pas de chiffrement au repos activé, la table doit être chiffrée séparément avec un mot de passe spécifique.

### 8.3 Format du codex data exporté

Un codex data exporté contient :

```json
{
  "format": "codex-data",
  "version": "1.0",
  "date_export": "2026-05-06T15:00:00-04:00",
  "mode_anonymisation": "pseudonymisation",
  "metadata": {
    "auteur": "Grégoire Bédard",
    "cegep": "Cégep de Sherbrooke",
    "discipline": "Littérature",
    "trimestre": "Hiver 2026",
    "nombre_etudiants": 25,
    "remarques": "Codex data anonymisé pour partage pédagogique. Inclut indices A-C-P, notes et présences. Exclut le journal et les blobs."
  },
  "integrite": {
    "donnees_sha256": "a1b2c3...",
    "date_calcul": "..."
  },
  "licence": "CC BY-NC-SA 4.0",
  "donnees": {
    "etudiants": [
      { "identifiant": "Étudiant-001", "decennie_naissance": "2000-2009", "programme": "Sciences humaines" },
      ...
    ],
    "evaluations": [
      { "etudiant": "Étudiant-001", "production": "Diss-01", "note": 78, "semaine": 4 },
      ...
    ],
    ...
  }
}
```

Le codex data est typiquement encapsulé dans un conteneur `.lcz` signé (cf. `PROTECTION-FICHIERS-EXPORT.md` §7) pour bénéficier de l'intégrité et de la signature.

### 8.4 Intégration avec les autres mécanismes de sécurité

| Mécanisme | Interaction avec l'anonymisation |
|---|---|
| Chiffrement au repos (doc A) | La table de correspondance est chiffrée avec la même clé maître. |
| Versioning (doc B) | Les codex data exportés ne sont **pas** versionnés en interne — ils vivent leur vie une fois exportés. |
| Hash + signature (`PROTECTION-FICHIERS-EXPORT.md`) | Le codex data exporté est signé avec la clé de l'auteur pour authentification. |
| Modèle de menaces X-01 | Couverture partielle — si le codex original est anonymisé avant tout partage, l'exfiltration via export devient bénigne. |

---

## 9. L'UX de l'anonymisation

### 9.1 Dialogue de configuration

À l'export, l'utilisateur choisit le mode et les options :

```
┌────────────────────────────────────────────────────────────┐
│  Préparer un codex data pour partage                       │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  Mode d'anonymisation :                                    │
│  ◉ Pseudonymisation (tu peux re-identifier plus tard)      │
│  ○ Anonymisation irréversible (impossible de re-identifier)│
│                                                            │
│  Données à inclure :                                       │
│  ☑ Indices A-C-P-E                                         │
│  ☑ Notes et évaluations                                    │
│  ☑ Présences                                               │
│  ☐ Photos de travaux (déconseillé — biométrique)           │
│  ☐ Journal de l'enseignant (déconseillé — sensible)        │
│                                                            │
│  Métadonnées :                                             │
│  Mon nom (auteur) :  ◉ Conservé    ○ Anonymisé             │
│  Mon cégep :         ◉ Conservé    ○ Anonymisé             │
│  Granularité dates : ◉ Semaine     ○ Jour                  │
│                                                            │
│  ⚠ Avertissement : avec 25 étudiants, un profil de notes  │
│  est quasi unique. Limite l'accès aux cercles de confiance.│
│                                                            │
│  [Aperçu]  [Annuler]   [Produire le codex data]            │
└────────────────────────────────────────────────────────────┘
```

L'utilisateur a la maîtrise des options. Les valeurs par défaut sont conservatrices (blobs et journal **exclus**).

### 9.2 Aperçu avant export

L'utilisateur clique « Aperçu » et voit ce qui sera dans le fichier exporté :

```
Codex data — aperçu
==================
Mode : pseudonymisation
Étudiants : 25 (identifiants Étudiant-001 à Étudiant-025)
Évaluations : 287 enregistrements
Présences : 525 enregistrements
Indices A-C-P-E : 100 enregistrements
Métadonnées : auteur "Grégoire Bédard", cégep "Sherbrooke"

Échantillon :
  Étudiant-001, programme Sciences humaines, décennie 2000-2009
    Évaluation Diss-01 : 78 (semaine 4)
    Présence semaine 1 : Présent
    ...

Données EXCLUES : journal (notes confidentielles), photos de travaux
Table de correspondance : sera stockée chiffrée localement
```

L'utilisateur a une chance de vérifier ce qu'il s'apprête à exporter.

### 9.3 Avertissement de ré-identification

Au moment de la production, un avertissement clair :

```
⚠ Risque résiduel de ré-identification

Tes données concernent un groupe de 25 étudiants. Même
anonymisées, chaque profil reste quasi unique.

Si tu connais la composition du groupe (toi et tes
collègues), tu peux probablement ré-identifier la plupart
des étudiants à partir de leurs profils.

Recommandations :
• Ne diffuse pas largement ces données.
• Limite l'accès à un cercle restreint de confiance.
• Pour publication ouverte, privilégie l'agrégation
  (moyennes, distributions) plutôt que les profils individuels.

[J'ai compris]   [Annuler l'export]
```

Honnête sur la limite. Mieux vaut un utilisateur informé qu'un utilisateur qui croit son anonymisation parfaite.

### 9.4 Gestion de la table de correspondance (mode pseudonymisation)

Si l'utilisateur a choisi la pseudonymisation, une fonctionnalité dédiée permet de :

- Consulter la table (pour ré-identifier `Étudiant-007` plus tard).
- Effacer la table (passage à anonymisation irréversible *a posteriori*).
- Exporter la table chiffrée (pour migration entre Macs).

---

## 10. Limites légales et décisions en suspens

### 10.1 La distinction Loi 25 reste à confirmer

Le `.claude/skills/securite-donnees/SKILL.md` §10 liste comme question ouverte : « L'anonymisation par pseudonymisation (remplaçable par l'auteur) est-elle suffisante au sens de la Loi 25, ou faut-il une anonymisation irréversible ? »

C'est une question pour un juriste ou un responsable de la protection des renseignements personnels. Les éléments à clarifier :

- Le seuil légal d'anonymisation acceptable pour publier sans consentement.
- Le statut de la pseudonymisation comme protection « raisonnable » au sens de l'article 10.
- L'obligation éventuelle de notification à la CPVP si fuite de données pseudonymisées.

**Position pragmatique en attendant** : l'outil d'anonymisation Labo Codex permet les deux modes. L'utilisateur (Grégoire) choisit selon son contexte. Quand l'avis Loi 25 sera disponible, il pourra éventuellement contraindre l'outil (par exemple : « pour tout partage ouvert, mode irréversible obligatoire »).

### 10.2 Comité d'éthique de la recherche (CÉR)

Pour la recherche publique, le passage par un CÉR cégépial peut être obligatoire selon la nature de la recherche. Le CÉR évalue notamment :

- La qualité de l'anonymisation.
- Le consentement des étudiants (cf. `.claude/skills/securite-donnees/SKILL.md` §8 question 3).
- La durée de conservation des données.
- Les mesures de sécurité pendant la recherche.

L'outil d'anonymisation Labo Codex ne remplace pas le CÉR. Il **produit** les données qui seront soumises au CÉR, mais c'est au chercheur de respecter le protocole d'éthique de son institution.

### 10.3 Consentement étudiant

Le `.claude/skills/securite-donnees/SKILL.md` §8 question 3 le marque comme en suspens. Position raisonnable : pour toute recherche publique, consentement éclairé des étudiants. Pour usage purement personnel (suivi pédagogique de l'enseignant), pas de consentement nécessaire car les données restent dans le contexte de prestation du service éducatif.

L'anonymisation **n'élimine pas** l'obligation de consentement — elle la **réduit** dans certains cas (Loi 25, article 12 — usage statistique sans consentement individuel sous condition).

---

## 11. Plan de mise en œuvre en trois phases

### 11.1 Phase 1 — Module d'anonymisation de base (3-4 semaines)

Objectif : poser les fondations avec stratégie A + B (remplacement séquentiel + généralisation), exclusion blobs et journal par défaut.

**Code** :
- Module `js/anonymisation.js` avec API `produireCodexData`.
- Format codex data version 1.0.
- Génération de la table de correspondance (chiffrée localement).
- Dialogue UI de configuration et d'aperçu.
- Intégration avec le mécanisme d'export ZIP signé (cf. PROTECTION-FICHIERS-EXPORT.md §8.2 Phase B).

**Effort** : 3-4 semaines.

**Effet** : tu peux produire un codex data anonymisé prêt à partager.

### 11.2 Phase 2 — Stratégies avancées (3-4 semaines)

Objectif : ajouter les stratégies C, D, E pour les cas plus exigeants.

**Code** :
- Implémentation de la k-anonymité (avec auto-généralisation pour atteindre k).
- Implémentation du bruit différentiel calibrable.
- Implémentation de la suppression sélective des outliers.
- UI avancée : sélecteur de stratégie selon l'usage (« publication ouverte », « partage restreint », « usage interne »).

**Effort** : 3-4 semaines.

**Effet** : couverture des cas de publication ouverte avec garanties statistiques.

### 11.3 Phase 3 — Intégration Voûte et workflow CÉR (long terme)

Objectif : connecter le module d'anonymisation au pipeline de dépôt Voûte et au workflow CÉR.

**Code** :
- Dépôt automatique d'un codex data dans la Voûte avec validation.
- Templates de documents CÉR pré-remplis à partir des paramètres d'anonymisation.
- Traçabilité : quelles données ont été partagées avec qui, quand.

**Effort** : 3-4 semaines + accords institutionnels.

**Effet** : workflow complet de la recherche pédagogique reproductible.

### 11.4 Effort total

Phases 1+2+3 : ~9-12 semaines. La Phase 1 est l'essentiel — peut être livrée seule et utilisée en production. Les Phases 2 et 3 sont des raffinements.

---

## 12. Questions ouvertes pour Grégoire

### Q1 — Mode par défaut : pseudonymisation ou anonymisation irréversible ?

Question légale et opérationnelle. Si tu veux pouvoir corriger des erreurs ou faire du suivi longitudinal → pseudonymisation. Si tu veux le régime simplifié post-Loi 25 → anonymisation irréversible.

Ma préférence : **pseudonymisation par défaut**, avec option claire pour l'anonymisation irréversible. Plus flexible, table de correspondance bien protégée.

### Q2 — Stratégie pour les blobs ?

Exclusion par défaut (recommandé). Option d'inclusion individuelle (sélection manuelle) ? Ou option d'inclusion massive avec strip metadata + alerte ?

Ma préférence : **exclusion par défaut, sélection manuelle individuelle** si nécessaire avec strip metadata.

### Q3 — Stratégie pour le journal ?

Exclusion par défaut clairement recommandée. Mais cas d'usage : tu veux partager des observations qualitatives anonymisées. Inclure une option d'inclusion **par étudiant** (cocher individuellement) ?

Ma préférence : **exclusion par défaut, inclusion explicite étudiant par étudiant** si vraiment nécessaire.

### Q4 — Niveau de transparence sur la ré-identification résiduelle ?

L'avertissement (§9.3) est-il suffisamment clair ? Trop alarmiste ? Pas assez ?

À ajuster selon ton ressenti — tu sais mieux que moi comment les utilisateurs typiques de Labo Codex (toi et tes collègues) accueillent ce genre d'information.

### Q5 — Intégration avec le chiffrement (doc A) ?

Si le chiffrement au repos est activé, la table de correspondance est chiffrée avec la même clé maître. Acceptable ? Préfères-tu une clé séparée pour la table de correspondance (sécurité plus forte, complexité accrue) ?

Ma préférence : **même clé maître**, simplicité prime.

### Q6 — Politique de rétention de la table de correspondance ?

Garder indéfiniment ? Effacer après N mois ? Effacer à la fin du trimestre ?

Ma préférence : **garder indéfiniment**, avec option utilisateur pour effacer à tout moment.

### Q7 — Quand intégrer ce chantier dans ton roadmap ?

L'anonymisation devient critique au moment où tu veux publier ou partager. Tant que tu travailles en local, c'est moins urgent. La priorité est-elle :

- Avant la Voûte (préparation au partage).
- Avec la Voûte (chantier conjoint).
- Après la Voûte (raffinement à mesure que des cas d'usage émergent).

Ma préférence : **avant ou conjointement avec la Voûte**. L'anonymisation est une dépendance de la Voûte pour partager des codex data, donc autant la préparer en parallèle.

---

## Synthèse en une page

**Question** : comment transformer les données identifiantes pour qu'elles puissent voyager hors du codex (publication, recherche, partage entre enseignants, dépôt Voûte) sans révéler l'identité des étudiants ?

**Réponse courte** : un module d'anonymisation appliqué **à l'export** (pas au stockage), qui combine remplacement par identifiants séquentiels + généralisation des dates + exclusion par défaut des blobs et du journal.

**Distinction avec les autres angles** :
- Chiffrement (doc A) : protège l'accès aux données identifiantes au repos.
- Versioning (doc B) : permet la restauration en cas de perte.
- **Anonymisation (ce doc)** : transforme les données pour qu'elles puissent voyager.

**Deux modes possibles** :
- **Pseudonymisation réversible** : table de correspondance gardée chiffrée localement. Flexible, conforme à un usage de recherche avec corrections possibles.
- **Anonymisation irréversible** : correspondance détruite. Régime Loi 25 simplifié.

**Stratégie recommandée pour Labo Codex** : combinaison simple de **A. remplacement par identifiants séquentiels** + **B. généralisation des dates** + exclusion des blobs et du journal par défaut. Stratégies avancées (k-anonymité, bruit différentiel, suppression d'outliers) en option pour les cas de publication ouverte.

**Limite fondamentale** : dans un petit groupe (25 étudiants), chaque profil est quasi unique. L'anonymisation seule ne suffit pas — il faut combiner avec **limitation de l'accès** et **cadre éthique** (consentement, CÉR). L'app affiche un avertissement clair de ré-identification résiduelle.

**Plan en trois phases** :
1. **Phase 1** (3-4 sem) — Module de base avec stratégies A et B.
2. **Phase 2** (3-4 sem) — Stratégies avancées (k-anonymité, bruit différentiel).
3. **Phase 3** (3-4 sem) — Intégration Voûte et workflow CÉR.

**Recommandation immédiate** : la Phase 1 est utile dès maintenant pour les cas de partage entre collègues. Elle peut être lancée en parallèle des chantiers Chiffrement (doc A) et Versioning (doc B) — pas de dépendance bloquante.

**Couverture des scénarios du modèle de menaces** : X-01 (Vol d'informations enseignant + étudiants) — couverture partielle (l'exfiltration de données anonymisées a beaucoup moins de valeur pour l'attaquant). Le codex original reste à protéger par chiffrement et versioning.

---

## Historique

| Date | Version | Changement |
|---|---|---|
| 2026-05-06 | 1.0 | Création. Distinction pseudonymisation/anonymisation, inventaire des données à transformer, cinq stratégies, risque de ré-identification, cas spécifiques (blobs, journal), architecture proposée, UX du dialogue d'anonymisation, limites légales, plan en trois phases, sept questions ouvertes. |

---

**Fin du document C. Trilogie « Protection des données vivantes » complétée.**
