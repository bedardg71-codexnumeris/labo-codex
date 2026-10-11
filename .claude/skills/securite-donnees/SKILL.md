---
name: securite-donnees
description: >
  Utiliser ce skill pour toute question touchant à la sécurité, la
  confidentialité, l'anonymisation, l'intégrité ou la pérennité des données
  dans Labo Codex. Déclencher dès que Grégoire mentionne : protection des
  données, anonymisation, chiffrement, Voûte, Réserve, format d'archivage,
  accès étudiant, Loi 25, consentement, SRAM, DA, ou toute préoccupation
  liée à la confidentialité des informations étudiantes.
  Pour l'architecture des données (Codex, Réserve, Codex data, Voûte), voir
  aussi docs/architecture/ECOSYSTEME-DONNEES.md.
---

# SKILL : Sécurité et pérennité des données

> **Document fondateur** — 26 avril 2026
> Ce skill est la référence pour toute décision touchant à la sécurité,
> la confidentialité, l'intégrité et la pérennité des données dans Labo Codex.
> Il s'applique au code (Claude Code) comme à la conception (Cowork).

---

## 1. CLASSIFICATION DES DONNÉES

### 1.1 Données directement identifiantes (CRITIQUE)

Données qui identifient un étudiant sans aucune autre information.

| Donnée             | Clé(s) IndexedDB                        | Présence dans... |
|--------------------|-----------------------------------------|------------------|
| Nom, prénom        | `{tri}_groupeEtudiants[].nom/prenom`    | Codex, Réserve   |
| DA (n° admission)  | `{tri}_groupeEtudiants[].da`            | Codex, Réserve   |
| Numéro de groupe   | `{tri}_groupeEtudiants[].groupe`        | Codex, Réserve   |

**Règle** : ces données ne quittent JAMAIS la machine de l'enseignant
sous forme identifiable. Elles vivent dans le Codex et la Réserve uniquement.
Avant tout transfert vers la Voûte ou un codex data partagé, elles doivent
être anonymisées.

**Attention — DA** : les DA sont gérés par le SRAM (Service régional
d'admission du Montréal métropolitain) pour 32 cégeps, mais il y a 48 cégeps
au total. Le DA est un identifiant inter-institutionnel — sa fuite permettrait
de croiser des données entre systèmes. Traiter le DA comme une donnée CRITIQUE.

### 1.2 Données indirectement identifiantes (SENSIBLE)

Données qui, combinées, permettent de ré-identifier un individu dans un
petit groupe (~25 étudiants).

| Donnée                        | Risque de ré-identification            |
|-------------------------------|----------------------------------------|
| Profil de notes (10+ prod.)  | Quasi unique dans un groupe de 25      |
| Pattern de présences          | Discriminant si combiné aux notes      |
| Indices A-C-P-E par étudiant | Profil comportemental identifiable     |
| Interventions RaI             | Cible des étudiants en difficulté      |
| Snapshots de progression      | Trajectoire temporelle individuelle    |

**Règle** : même après retrait des noms et DA, ces données restent
identifiantes pour quiconque connaît la composition du groupe. L'anonymisation
doit en tenir compte (voir §3).

### 1.3 Données biométriques involontaires (CRITIQUE)

| Donnée                             | Problème                               |
|------------------------------------|----------------------------------------|
| Photos de travaux manuscrits       | Écriture manuscrite = biométrique. Nom souvent écrit sur la copie. |
| PDF de travaux natifs              | Métadonnées PDF (auteur, timestamps)   |

**Règle** : les blobs (photos, PDF) ne sont PAS anonymisables par un simple
renommage. L'écriture manuscrite est biométriquement identifiable. Le nom
de l'étudiant est souvent écrit directement sur la production.
Conséquence : les blobs NE DOIVENT PAS être inclus dans un codex data
destiné au partage ou à la Voûte, sauf décision explicite et consentement.

### 1.4 Données pédagogiques (NON SENSIBLE)

| Donnée                             | Caractère                              |
|------------------------------------|----------------------------------------|
| Grilles d'évaluation               | Travail intellectuel de l'enseignant   |
| Échelles descriptives              | Idem                                   |
| Cartouches (commentaires types)    | Idem                                   |
| Productions (gabarits)             | Structure pédagogique, pas de données personnelles |
| Séquences, objectifs               | Idem                                   |
| Paramètres de cours (infoCours)    | Contient le nom de l'enseignant — semi-sensible |

**Règle** : ces données peuvent être partagées dans la Voûte sous licence
CC BY-NC-SA 4.0 (obligation). Le champ `infoCours` contient le nom de
l'enseignant — il doit être traité comme identifiant de l'AUTEUR (pas
anonymisé, mais soumis au consentement de l'enseignant).

---

## 2. MODÈLE DE MENACES

### 2.1 Acteurs

| Acteur                 | Motivation                | Capacité technique |
|------------------------|---------------------------|--------------------|
| Étudiant curieux       | Voir ses notes/celles des autres | Faible (accès navigateur) |
| Collègue malveillant   | Usurper une identité, voler du contenu | Moyenne |
| Bot/script automatisé  | Spam, déni de service, exfiltration | Élevée |
| Attaquant externe      | Exfiltration de données personnelles | Élevée |
| Utilisateur négligent  | Partage accidentel de données non anonymisées | N/A (erreur humaine) |

### 2.2 Scénarios de menace prioritaires

**M1 — Usurpation d'identité (dépôt)** [PRIORITÉ #1 de Grégoire]
Un acteur dépose dans la Voûte sous le nom d'un enseignant qu'il n'est pas.
Impact : contenu frauduleux attribué à un professionnel, atteinte à la
réputation, contamination de la bibliothèque partagée.

**M2 — Usurpation d'identité (accès)**
Un acteur accède à la Réserve ou au codex d'un collègue et consulte les
données personnelles de ses étudiants.
Impact : fuite de données CRITIQUES (noms, DA, notes).

**M3 — Injection de code malveillant**
Un ZIP ou JSON importé contient du code qui s'exécute dans l'application.
Impact : exécution arbitraire dans le contexte de l'app (accès IndexedDB,
localStorage, toutes les données).
Mitigation existante : CSP `script-src 'self'`, `validerZipSecurite()`,
`validerMagicBytes()`, `echapperHtml()`. À renforcer : validation de schéma
sur tout JSON importé.

**M4 — Données fabriquées/falsifiées**
Un acteur dépose dans la Voûte des grilles truquées, des données bidon,
ou du contenu offensant déguisé en ressource pédagogique.
Impact : contamination de la bibliothèque partagée, enseignants qui
empruntent du contenu défectueux.

**M5 — Déni de service / spam**
Un acteur inonde la Voûte de dépôts pour la rendre inutilisable.
Impact : dégradation du service, perte de confiance des utilisateurs.

**M6 — Exfiltration de données**
Un acteur exploite une faille pour extraire les données personnelles
d'autres utilisateurs depuis la Voûte ou via le mécanisme de sync P2P.
Impact : fuite massive de données CRITIQUES.

**M7 — Corruption/perte de la Réserve**
Défaillance matérielle, bug logiciel, ou erreur humaine qui rend les
archives illisibles ou incomplètes.
Impact : perte irréversible du patrimoine de données.

**M8 — Ré-identification dans les données anonymisées**
Un collègue qui connaît la composition d'un groupe retrouve les identités
dans un codex data anonymisé, via le profil de notes ou les patterns.
Impact : fuite de données personnelles malgré l'anonymisation.

### 2.3 Surfaces d'attaque par composant

| Composant         | Surface                                           |
|-------------------|---------------------------------------------------|
| **Codex**         | Vol physique (clé USB), accès au navigateur        |
| **Réserve**       | Accès au système de fichiers, corruption disque    |
| **Codex data**    | Ré-identification, manipulation avant import       |
| **Voûte**         | Toutes les menaces réseau : usurpation, injection, spam, exfiltration |
| **Sync P2P**      | Man-in-the-middle, données altérées en transit     |
| **App (navigateur)** | XSS via données importées, accès IndexedDB       |

---

## 3. ANONYMISATION

### 3.1 Principes

L'anonymisation vise à rendre les données inutilisables pour identifier
un individu, tout en préservant leur valeur pour la recherche pédagogique.

**Décision en suspens** : réversibilité de l'anonymisation. L'enseignant
auteur pourrait avoir besoin de retrouver « Étudiant-007 » pour corriger
une erreur. Deux options :
- **Pseudonymisation réversible** : une table de correspondance chiffrée
  reste sur la machine de l'enseignant. Lui seul peut inverser.
- **Anonymisation irréversible** : la correspondance est détruite. Plus
  personne ne peut remonter.
→ À trancher avec les contacts Loi 25.

### 3.2 Opérations d'anonymisation (codex data) — PRÉVUES, NON CODÉES

⚠ #989 (11 oct. 2026) : `js/codex-data.js` écrit toujours `anonymise: false` et n'anonymise rien. Ce tableau est la cible, pas l'état.

| Donnée                    | Traitement                                    |
|---------------------------|-----------------------------------------------|
| Noms, prénoms             | Remplacement par identifiant séquentiel (Étudiant-001) |
| DA                        | Suppression complète (pas de hash — le DA est trop court, un hash serait réversible par force brute) |
| Numéro de groupe          | Remplacement par identifiant générique (Groupe-A, Groupe-B) |
| Nom de l'enseignant       | Remplacé par « Enseignant » sauf consentement explicite |
| Nom du cégep              | Remplacé par « Établissement » sauf consentement explicite |
| Notes et indices          | Conservés (valeur de recherche) |
| Présences                 | Conservées (valeur de recherche) |
| Photos/PDF de travaux     | **EXCLUS** du codex data par défaut (voir §1.3) |

### 3.3 Risque de ré-identification et mitigations

Avec 25 étudiants et 10 productions, un profil de notes est quasi unique.
Mitigations possibles (à évaluer selon le cas d'usage) :
- **Agrégation** : publier des moyennes par groupe, pas des profils individuels
- **Bruit différentiel** : ajouter un bruit aléatoire calibré aux valeurs
- **Suppression des outliers** : retirer les profils extrêmes (meilleur/pire)
- **k-anonymité** : s'assurer que chaque profil est partagé par au moins k individus

**Réalité** : pour un groupe de 25, la k-anonymité stricte est très difficile
à atteindre sans dégrader fortement les données. La mitigation la plus réaliste
est de limiter l'accès aux codex data individuels (pas de publication ouverte
de profils étudiants, même anonymisés).

### 3.4 Ce que l'anonymisation NE FAIT PAS

- Elle ne protège pas contre quelqu'un qui a accès au codex original ET
  au codex data anonymisé — la corrélation temporelle suffit à ré-identifier.
- Elle ne touche pas aux blobs (photos de travaux manuscrits).
- Elle ne retire pas les métadonnées de contexte (discipline, niveau, session)
  qui réduisent l'anonymat du groupe.

---

## 4. INTÉGRITÉ ET PÉRENNITÉ DU FORMAT

### 4.1 Principes directeurs

Le format de données doit survivre indéfiniment. C'est un patrimoine
pédagogique. La pérennité ne repose PAS sur la cryptographie (qui sera
déjouée) mais sur la lisibilité et l'auto-description.

**Constat de Grégoire** (26 avril 2026) : « Dans quelles années, l'intelligence
artificielle et l'informatique quantique vont déjouer tout ce qu'on peut
prévoir aujourd'hui. 50 ans, c'est demain. »

### 4.2 Exigences du format

| Exigence                     | Implémentation                              |
|------------------------------|---------------------------------------------|
| **Lisible sans logiciel**    | JSON texte, noms de champs explicites en français, UTF-8 |
| **Auto-descriptif**          | Champ `format`, `version`, `schema` dans chaque fichier racine |
| **Versionné**                | Numéro de version du schéma. Toute modification = incrémentation. |
| **Documenté inline**         | README.txt dans la Réserve. Commentaires dans le manifeste. |
| **Vérifiable**               | Hash SHA-256 du contenu dans meta.json (intégrité) |
| **Identifié**                | UUID v4 par versement (unicité mondiale) |
| **Daté**                     | Timestamps ISO 8601 avec fuseau horaire |
| **Indépendant du logiciel**  | Pas de référence à des structures internes d'IndexedDB ou de l'app |

### 4.3 Hash d'intégrité

Chaque versement dans la Réserve doit inclure un hash SHA-256 de
`donnees.json` dans `meta.json`. Cela permet de vérifier que le fichier
n'a pas été altéré (corruption disque, modification accidentelle).

```json
{
  "uuid": "f47ac10b-...",
  "integrite": {
    "donnees_json_sha256": "a1b2c3d4...",
    "algorithme": "SHA-256",
    "date_calcul": "2026-04-26T15:30:00-04:00"
  }
}
```

SHA-256 est disponible nativement dans Safari via `crypto.subtle.digest()`.
Pas de dépendance externe nécessaire.

**Limite reconnue** : SHA-256 résistera au quantique pour l'intégrité
(Grover's algorithm réduit la sécurité à 128 bits, ce qui reste suffisant
pour la détection de corruption). Ce n'est pas le cas pour le chiffrement
symétrique ou asymétrique actuel.

### 4.4 Versionnement du schéma

Chaque fichier de données porte un numéro de version de schéma :

```json
{
  "format": "reserve-labo-codex",
  "schema_version": 2,
  "schema_changelog": [
    { "version": 1, "date": "2026-04-26", "description": "Structure initiale par trimestre" },
    { "version": 2, "date": "2026-04-26", "description": "Granularité par groupe-cours, UUID, hash intégrité" }
  ]
}
```

Toute modification de la structure de données incrémente la version.
L'application doit savoir lire TOUTES les versions antérieures (compatibilité
ascendante obligatoire).

---

## 5. SÉCURITÉ DE LA RÉSERVE (locale)

### 5.1 Menaces et mitigations

| Menace                      | Mitigation                                    |
|-----------------------------|-----------------------------------------------|
| Vol physique (Mac, clé USB) | FileVault (macOS) chiffre le disque. Clé USB : chiffrer le ZIP de versement (à implémenter). |
| Corruption disque           | Hash SHA-256 dans meta.json détecte la corruption. Copies multiples (USB + iCloud). |
| Erreur humaine (suppression)| Structure de répertoire claire + README + manifeste. Sauvegarde Time Machine / iCloud. |
| Accès non autorisé (session Mac ouverte) | Responsabilité de l'utilisateur (verrouillage de session). L'app ne gère pas l'auth locale. |

### 5.2 Stratégie de sauvegarde de Grégoire (actuelle)

- Copies manuelles sur clé USB (hebdomadaire)
- Copies manuelles sur iCloud
- Pas de Time Machine automatique

**Recommandation** : activer Time Machine sur un disque externe. C'est la
seule protection contre la suppression accidentelle avec historique
versionné. Le coût est un disque externe (~80$).

---

## 6. SÉCURITÉ DE LA VOÛTE (partagée)

### 6.1 Décisions prises

| Décision                   | Valeur                                       |
|----------------------------|----------------------------------------------|
| Accès                      | Ouvert à tous les utilisateurs de Labo Codex |
| Licence obligatoire        | CC BY-NC-SA 4.0 pour tout dépôt             |
| Infrastructure potentielle | TI du cégep (service informatique existant)  |
| Authentification           | **À décider**                                |
| Modération des dépôts      | **À décider**                                |

### 6.2 Gouvernance — questions ouvertes [PRIORITÉ de Grégoire]

La gouvernance de la Voûte est une préoccupation déclarée. Ces questions
sont HUMAINES, pas techniques — elles doivent être tranchées avant de
coder quoi que ce soit :

1. **Qui retire un dépôt problématique ?** Un admin désigné ? Un vote ?
   L'auteur seul ?
2. **Qui tranche un litige de propriété intellectuelle ?** Si deux
   enseignants revendiquent la même grille, quel mécanisme de résolution ?
3. **Qui définit les règles d'admission ?** Un comité ? L'institution
   garante ? La communauté ?
4. **Qui finance et maintient le serveur ?** L'institution garante ?
   Un consortium ? Grégoire ?
5. **Que se passe-t-il si l'institution garante disparaît ?** Plan de
   continuité des données.
6. **Comment révoquer l'accès d'un utilisateur malveillant ?** Procédure,
   autorité, appel.

### 6.3 Anti-contamination (technique)

Tout fichier entrant dans la Voûte (dépôt) doit passer par :

1. **Validation de schéma** : le JSON respecte le schéma attendu (champs
   requis, types corrects, pas de champs inconnus suspects).
2. **Vérification d'intégrité** : le hash SHA-256 déclaré correspond
   au contenu.
3. **Détection d'injection** : aucune valeur de champ ne contient de
   balises HTML, de scripts, ou de séquences suspectes (`<script>`,
   `javascript:`, `onerror=`, etc.). Appliquer `echapperHtml()` sur
   TOUT champ texte au moment de l'affichage, pas seulement à l'import.
4. **Vérification d'anonymisation** : si le dépôt est un codex data,
   scanner automatiquement pour détecter des DA (pattern numérique),
   des noms propres (heuristique), ou des champs identifiants non vidés.
5. **Quota par utilisateur** : limiter le nombre et la taille des dépôts
   par période (anti-spam/DoS).
6. **Signature du dépôt** : le dépôt est signé par l'auteur (clé
   asymétrique). Permet de vérifier qu'il n'a pas été altéré et qu'il
   vient bien de l'auteur déclaré. → Anti-usurpation.

### 6.4 Signature des dépôts (anti-usurpation)

Pour prévenir l'usurpation d'identité (menace #1 de Grégoire), chaque
dépôt dans la Voûte devrait être signé cryptographiquement :

- L'enseignant possède une paire de clés (privée/publique)
- La clé privée reste sur SA machine (jamais transmise)
- La clé publique est enregistrée dans la Voûte à la création du compte
- Chaque dépôt est signé avec la clé privée
- N'importe qui peut vérifier l'authenticité avec la clé publique

**Analogie** : c'est comme signer un document — seul le détenteur du
stylo peut signer, mais tout le monde peut vérifier que c'est sa signature.

**Implémentation** : Web Crypto API (`crypto.subtle.sign()` / `verify()`)
est disponible nativement dans tous les navigateurs modernes. Algorithme
recommandé : ECDSA P-256 (résistant pour les prochaines décennies, compact).

**Limite** : si la clé privée est volée, l'usurpation redevient possible.
Mitigation : la clé peut être protégée par mot de passe local.

---

## 7. INTERACTION ÉTUDIANTE (horizon futur)

### 7.1 Décisions prises

| Décision                   | Valeur                                       |
|----------------------------|----------------------------------------------|
| Modèle d'accès             | Même application, vue limitée               |
| Capacités étudiantes       | Consultation + dépôt de travaux             |
| Sync des données           | Pair-à-pair (P2P), pas de serveur central    |

### 7.2 Implications sécuritaires

L'accès étudiant ouvre une surface d'attaque considérable :

- **Authentification** : comment l'app vérifie-t-elle que « cet étudiant »
  est bien celui qu'il prétend être ?
- **Isolation des vues** : l'étudiant ne doit voir QUE ses propres données.
  Jamais celles des autres étudiants du groupe. Cela nécessite un contrôle
  d'accès côté client (fragile) ou côté serveur/P2P (robuste mais complexe).
- **P2P et confiance** : sans serveur central, qui certifie que les données
  reçues par l'étudiant viennent bien de son enseignant et n'ont pas été
  altérées ? La signature cryptographique (§6.4) s'applique ici aussi.
- **Dépôt de travaux par l'étudiant** : l'app doit valider tout fichier
  reçu (taille, type MIME, magic bytes, pas de code exécutable).

### 7.3 Phase actuelle

L'interaction étudiante est un horizon lointain. Pour l'instant, l'étudiant
interagit via Lea/Omnivox (plateforme transitoire). L'enseignant fait le
pont manuellement. Ne PAS implémenter de fonctionnalités d'accès étudiant
sans avoir résolu l'authentification et l'isolation des vues.

---

## 8. QUESTIONS POUR LES CONTACTS LOI 25

Ces questions doivent être posées à un juriste ou un responsable de la
protection des renseignements personnels dans le contexte collégial québécois.

### Données étudiantes

1. Quelle est la durée de conservation légale des données étudiantes
   (notes, présences, évaluations) pour un enseignant de cégep ?
2. L'utilisation des DA hors du système d'admission (SRAM/Clara) est-elle
   encadrée ? Un enseignant peut-il stocker des DA dans une application
   tierce sur sa machine ?
3. Si les données servent à la recherche pédagogique (analyse longitudinale),
   un consentement spécifique des étudiants est-il requis ? Faut-il passer
   par un comité d'éthique de la recherche (CÉR) ?
4. Les photos de travaux manuscrits sont-elles considérées comme des
   renseignements personnels au sens de la Loi 25 ?

### Partage et Voûte

5. Si un enseignant partage des configurations pédagogiques (grilles,
   échelles) créées dans le cadre de son emploi, qui détient la propriété
   intellectuelle — l'enseignant ou le cégep ?
6. L'anonymisation par pseudonymisation (remplaçable par l'auteur) est-elle
   suffisante au sens de la Loi 25, ou faut-il une anonymisation irréversible ?
7. Si la Voûte est hébergée par le TI d'un cégep, quelles obligations
   incombent à l'institution (déclaration CPVP, registre des incidents,
   évaluation des facteurs relatifs à la vie privée — ÉFVP) ?

### Infrastructure

8. Le stockage de données étudiantes dans IndexedDB (navigateur, machine
   de l'enseignant) constitue-t-il un « fichier de renseignements personnels »
   au sens de la Loi sur l'accès ?
9. Si les données transitent par un serveur (Voûte), même chiffrées,
   quelles obligations de localisation des données s'appliquent ?
   (Hébergement au Canada obligatoire ?)

---

## 9. RÈGLES OPÉRATIONNELLES POUR LE CODE

### 9.1 Règles ABSOLUES (tout code touchant aux données)

Les règles de base — `echapperHtml()` sur tout innerHTML, `validerZipSecurite()`
sur tout ZIP, `validerMagicBytes()` sur tout blob, zéro `eval()`/`new Function()`,
zéro handler inline, CSP `script-src 'self'` — sont normatives et détaillées
dans **CLAUDE.md §Règles de sécurité** (source unique). Ne pas les redupliquer ;
les appliquer.

Spécifique à la sécurité des DONNÉES (au-delà des règles génériques) :

1. **Validation de schéma** sur TOUT JSON importé (codex, codex data,
   configuration, dépôt Voûte). Ne jamais faire confiance au contenu d'un
   fichier externe — c'est le complément des défenses CLAUDE.md, qui couvrent
   ZIP/blobs/HTML mais pas la structure d'un JSON de données.

### 9.2 Règles pour la Réserve

2. Chaque versement porte un UUID v4 (`crypto.randomUUID()`).
3. Chaque `meta.json` inclut un hash SHA-256 de `donnees.json`.
4. Les données démo (groupe 9999) sont EXCLUES des versements.
5. Les blobs portent un `groupeCoursId` — les fichiers sans ce tag
   (pré-Beta 98) sont exclus avec un warning.

### 9.3 Règles pour l'anonymisation

6. Le DA n'est JAMAIS hashé — il est supprimé. (Un DA est trop court,
   un hash serait réversible par force brute en secondes.)
7. Les noms sont remplacés par des identifiants séquentiels stables
   dans le contexte du codex data (même étudiant = même identifiant
   dans tout le fichier).
8. Les blobs sont exclus par défaut du codex data.
9. L'anonymisation se fait TOUJOURS sur une copie, JAMAIS sur l'original.

### 9.4 Règles pour les imports (anti-injection)

10. Tout champ texte importé est scanné pour les patterns dangereux
    (`<script`, `javascript:`, `onerror=`, `onload=`, `data:text/html`).
    Si détecté → rejet de l'import entier avec message explicite.
11. Les fichiers JSON importés sont validés par `JSON.parse()` strict
    (pas d'extensions, pas de commentaires, pas de trailing commas).
12. Taille maximale d'un import JSON : à définir (suggestion : 50 Mo
    pour un codex data, 500 Mo pour un codex complet).

---

## 10. DÉCISIONS EN SUSPENS

| # | Question                                    | Bloqué par            |
|---|---------------------------------------------|-----------------------|
| 1 | Réversibilité de l'anonymisation            | Avis Loi 25           |
| 2 | Authentification à la Voûte (SSO / invitation / libre) | Gouvernance |
| 3 | Modération des dépôts (auto / humain / combiné) | Gouvernance       |
| 4 | Les photos/PDF sortent-elles de la machine ? | Avis Loi 25 + éthique |
| 5 | Gouvernance de la Voûte (6 questions §6.2)  | Décisions humaines   |
| 6 | Durée de conservation légale des données     | Avis Loi 25          |
| 7 | Obligations si hébergement par le TI du cégep | Avis Loi 25         |
| 8 | Consentement étudiant pour la recherche      | CÉR + Loi 25         |

---

## 11. PRIORITÉS D'IMPLÉMENTATION (sécurité)

1. **Format vérifiable** — hash SHA-256 dans chaque meta.json (Réserve v1)
2. **Validation de schéma** — sur tout JSON importé (codex, config, futur codex data)
3. **Anonymisation** — module d'anonymisation pour le codex data (après avis Loi 25)
4. **Signature des dépôts** — ECDSA P-256 pour la Voûte (après gouvernance décidée)
5. **Accès étudiant** — authentification et isolation des vues (horizon lointain)

---

## HISTORIQUE

| Date       | Changement                                                    |
|------------|---------------------------------------------------------------|
| 2026-04-26 | Création. Classification, modèle de menaces, anonymisation, intégrité, gouvernance Voûte, questions Loi 25. |
