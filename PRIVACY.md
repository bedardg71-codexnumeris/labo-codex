# Politique de confidentialité — Labo Codex

> **Version** : 1.2 (27 août 2026 — réactivation de Cloudflare Access au 1er septembre 2026 avec une porte ouverte ; déclaration de la conservation des adresses courriel et de leur export périodique)
> **Responsable** : Grégoire Bédard, Cégep de Drummondville
> **Régime applicable** : projet d'expérimentation pédagogique conduit à titre
> personnel, application 100 % hors-ligne. La *Loi sur la protection des
> renseignements personnels dans le secteur privé* (modifiée par la Loi 25) ne
> s'applique vraisemblablement pas à cette configuration (cf. §1 et DEPLOY.md
> §1.4 — *inférence à confirmer par un juriste*). Ce document décrit néanmoins
> la posture de protection des renseignements personnels, par hygiène
> professionnelle et par souci de transparence envers les testeurs et les
> étudiants. Les articles de la Loi 25 cités le sont à titre de repère, comme
> esprit suivi volontairement, non comme cadre formel d'application.
> **Document apparenté** : [`INCIDENTS.md`](INCIDENTS.md) (registre des incidents)

---

## 1. Préambule

Labo Codex est une application web autonome de suivi formatif des apprentissages
au collégial. Elle est conçue pour fonctionner **entièrement hors ligne sur la
machine de l'enseignant** (ordinateur ou tablette), sans transmettre les données
étudiantes à un serveur tiers.

Cette politique décrit :
- quelles données sont conservées,
- où elles sont conservées,
- combien de temps,
- quels droits vous avez sur vos données (dans l'esprit de la Loi 25),
- à qui vous adresser pour les exercer.

Elle vise un double public : les **collègues enseignants** qui accèdent à
l'application en ligne, et les **étudiants** dont les données pédagogiques
transitent par l'outil.

### 1.1 Régime de protection des renseignements personnels

Labo Codex est un projet d'expérimentation pédagogique conduit par son auteur
**à titre personnel**, sans activité économique organisée au sens de l'article
1525 du Code civil du Québec. *Inférence à confirmer par un juriste en cas de
doute* : dans cette configuration, la *Loi sur la protection des renseignements
personnels dans le secteur privé* (modifiée par la Loi 25) **ne s'applique
vraisemblablement pas** — son article premier, deuxième alinéa, exclut les
renseignements collectés « à des fins exclusivement personnelles, domestiques
ou artistiques ».

Les versions antérieures de ce document, comme d'anciennes rédactions de
DEPLOY.md et de l'ADR-008, présentaient le contrôle d'accès à l'application
comme une « base de consentement explicite Loi 25 ». Cette qualification était
disproportionnée et a été retirée (cf. DEPLOY.md §1.4). La discipline maintenue
— retrait sur demande, non-diffusion des courriels, et export périodique consigné
plutôt que consultation au fil de l'eau — relève du **contrôle d'accès
opérationnel** et de l'**hygiène professionnelle** envers les testeurs, non
d'une obligation légale.

**Renseignements personnels effectivement traités par l'infrastructure** :

- **Niveau application** : aucun. L'application est 100 % hors-ligne. Les données
  pédagogiques (noms d'étudiants, évaluations, productions) restent sur la
  machine de chaque utilisateur. Aucun flux serveur (voir §4).
- **Niveau infrastructure** : du 3 juin au 31 août 2026, l'application
  `app.codexnumeris.org` a été **publiquement accessible sans authentification**,
  et aucune métadonnée d'accès individuelle n'a été traitée. **À partir du
  1er septembre 2026**, l'entrée demande une identification par code à usage
  unique envoyé par courriel. La porte reste **ouverte à toute adresse** : elle
  sert à savoir qui utilise l'application, pas à choisir qui y accède. Votre
  adresse et la date de votre dernière connexion sont conservées ; le détail est
  au §3.3.

### 1.2 Quand cette posture devra être revue

La posture décrite ici suppose un mainteneur individuel et une application
hors-ligne. Elle devra être **reprise à zéro** — et un dispositif de conformité
Loi 25 complet (registre, ÉFVP, politique formelle, désignation d'un
responsable) probablement enclenché — si l'une de ces conditions se réalise :

- Labo Codex est porté par une **organisation** (cégep, OBNL, entreprise) ;
- l'application acquiert une **base d'utilisateurs hors du cercle
  personnel/collégial** ;
- l'**architecture évolue pour traiter des données pédagogiques côté serveur**
  (par exemple une Voûte hébergeant des contenus identifiants).

Le contrôle d'accès est réactivé le 1er septembre 2026, porte ouverte (§6.1). Les
conditions qui pourraient justifier de le **restreindre** plus tard sont documentées
en §6.4, dans DEPLOY.md §3.6 et dans l'ADR-008 (« À réviser si »).

---

## 2. Qui est responsable du traitement

| Rôle | Personne / entité | Coordonnées |
|---|---|---|
| Responsable du traitement | Grégoire Bédard, enseignant en littérature, Cégep de Drummondville | [labo@codexnumeris.org](mailto:labo@codexnumeris.org) |
| Responsable institutionnel (PRP) | Cégep de Drummondville — responsable de la protection des renseignements personnels | *À confirmer (demande envoyée [À COMPLÉTER — date], réponse attendue 2-6 semaines)* |
| Hébergement public | Netlify (frontal statique) derrière le proxy Cloudflare (DNS/CDN) | Conditions Netlify et Cloudflare applicables. **Cloudflare Access** : désactivé du 2 juin au 31 août 2026, **réactivé le 1er septembre 2026** en porte ouverte (voir §6) |
| Code source | GitHub (dépôt public) | [github.com/bedardg71-codexnumeris/Monitorage_v6](https://github.com/bedardg71-codexnumeris/Monitorage_v6) |

**Statut actuel** : Labo Codex est utilisé en **pratique pédagogique individuelle**
par son auteur. Entre janvier et mai 2026, un accès individuel à l'application
en ligne a été accordé à une cinquantaine de collègues via Cloudflare Access
(voir §6) ; la quasi-totalité a brièvement consulté l'application puis n'y est
pas revenue, **sans retour de bug ni cohorte active d'usage**. Du 3 juin au 31 août
2026, Cloudflare Access a été désactivé et l'application publiquement accessible
sans authentification. **À partir du 1er septembre 2026**, l'identification par
code à usage unique est rétablie, avec une porte ouverte à toute adresse : il n'y
a **pas** de liste d'accès ni de sélection, mais les adresses de ceux qui entrent
sont conservées (§3.3).
L'adoption institutionnelle formelle (Cégep, autres établissements) — qui
changerait le régime applicable (cf. §1.2) — reste subordonnée à l'avis du
responsable PRP du Cégep et à la signature d'une ÉFVP (évaluation des facteurs
relatifs à la vie privée) le cas échéant.

---

## 3. Données collectées

### 3.1 Données pédagogiques étudiantes (sur la machine de l'enseignant)

Conservées **localement** dans le navigateur (IndexedDB + localStorage) ou
sur le système de fichiers local (Réserve).

| Donnée | Classification | Présence | Stockage |
|---|---|---|---|
| Nom et prénom de l'étudiant | **Directement identifiante** | Codex actif, Réserve archivée | IndexedDB local, ZIP `.codex.zip` |
| Numéro d'admission (DA) | **Directement identifiante** (interopérable SRAM) | Codex actif, Réserve archivée | Idem |
| Numéro de groupe | Directement identifiante (en contexte cégep) | Codex actif, Réserve archivée | Idem |
| Présences | Indirectement identifiante (pattern) | Codex actif, Réserve archivée | Idem |
| Notes et évaluations | Indirectement identifiante (profil quasi unique dans groupe de 25) | Codex actif, Réserve archivée | Idem |
| Indices A-C-P-E par étudiant | Indirectement identifiante | Codex actif, Réserve archivée | Idem |
| Interventions RàI | Indirectement identifiante (cible étudiants en difficulté) | Codex actif, Réserve archivée | Idem |
| Snapshots de progression | Indirectement identifiante (trajectoire temporelle) | Codex actif, Réserve archivée | Idem |
| **Photos de travaux manuscrits** | **Biométriquement identifiante** (écriture, nom souvent visible) | Codex actif, Réserve archivée | IndexedDB (blobs) |
| **PDF de travaux** | Identifiante (métadonnées + contenu) | Codex actif, Réserve archivée | Idem |

**Aucune** de ces données ne quitte la machine de l'enseignant sous forme
identifiable. Le réseau n'est pas utilisé pour transmettre les données
étudiantes (voir §4).

### 3.2 Données enseignantes

| Donnée | Présence | Stockage |
|---|---|---|
| Nom, prénom de l'enseignant (champ `infoCours`) | Codex actif, Réserve, dépôts dans la Voûte | Local + métadonnées CC sur exports |
| Adresse courriel (auteur Creative Commons) | Métadonnées des exports CC BY-NC-SA 4.0 | Local + dans les fichiers partagés |
| Configuration pédagogique (grilles, échelles, cartouches, productions) | Codex actif, bibliothèques globales | Local + Voûte (sur dépôt explicite) |

L'enseignant est l'auteur et la donnée le concernant est traitée comme
**identifiant de l'AUTEUR**, soumise à son consentement de partage. Elle
n'est pas anonymisée par défaut puisqu'elle sert l'attribution Creative
Commons.

### 3.3 Données d'accès au site (Cloudflare)

**État actuel (jusqu'au 31 août 2026)** : Cloudflare Access est **désactivé**.
L'application est publiquement accessible sans authentification, derrière le
proxy Cloudflare (DNS/CDN). Aucune métadonnée d'accès **individuelle** (courriel,
identité) n'est donc collectée ni journalisée. Cloudflare peut conserver des
journaux techniques agrégés propres à son CDN/proxy (anti-abus, mise en cache),
sans corrélation à une identité fournie par le projet.

**À partir du 1er septembre 2026** : Cloudflare Access est **réactivé**, avec une
porte **ouverte à toute adresse courriel** (aucune liste d'invités, aucune
sélection). Pour entrer dans l'application, vous saisissez votre adresse, vous
recevez un code à usage unique par courriel, et vous n'avez plus à vous
identifier pendant **un mois**. Passé ce délai, vous saisissez de nouveau votre
adresse et repartez pour un mois : **votre accès n'expire pas**, il se renouvelle.
Il n'y a ni compte à créer, ni mot de passe à retenir, ni autorisation à
redemander.

**Ce qui est conservé, et pourquoi.** Deux choses distinctes, qui ne se
conservent pas de la même manière :

| Donnée | Où | Conservation |
|---|---|---|
| Journaux d'authentification (date, heure, IP) | Cloudflare Zero Trust, `Logs` | **24 heures**, puis purgés automatiquement |
| **Votre adresse courriel et la date de votre dernière connexion** | Cloudflare Zero Trust, `Users` | **conservées sans limite de durée**, tant que votre identité figure dans l'espace Zero Trust du projet |

**La finalité est explicite, et ce n'est pas le contrôle.** L'auteur n'utilise pas
cette porte pour choisir qui entre : elle est ouverte à tous. Il l'utilise pour
**savoir qui utilise l'application**, parce que le projet n'a aucun autre moyen de
le savoir : l'application est locale et hors ligne, et ce que vous y faites n'est
visible de personne. La liste des adresses est **exportée périodiquement** et sert
à constituer un répertoire de personnes joignables, pour les inviter à signaler
des bogues, à contribuer au développement et à rejoindre la communauté de
pratique. Elle n'est ni publiée, ni transmise à un tiers, ni utilisée à d'autres
fins.

**Votre adresse n'est jamais reliée à vos données pédagogiques**, qui ne quittent
pas votre appareil (voir §4). Cloudflare sait que vous êtes entré ; ni Cloudflare
ni l'auteur ne savent ce que vous avez fait ensuite.

**Pour faire retirer votre adresse** : écrire à `labo@codexnumeris.org`. Le retrait
est sans condition et exécuté dans les quelques jours ouvrables qui suivent la
demande (DEPLOY.md §4.3). Il porte sur l'entrée conservée chez Cloudflare, pas sur
votre droit d'utiliser l'application : si vous revenez ensuite, vous vous
identifierez de nouveau comme n'importe qui.

**Historique (janvier – mai 2026)** : pendant cette période, **Cloudflare Access**
(service Zero Trust) servait de portail d'authentification par courriel à usage
unique (OTP) pour la cinquantaine de collègues invités. Cloudflare traitait alors :
- l'adresse courriel de l'invité (envoi du code OTP — One-Time PIN) ;
- la date et l'heure des accès ;
- l'adresse IP de la session ;
- un identifiant de session (cookie, validité une semaine).

Ces journaux d'accès étaient purgés automatiquement après **24 heures**
(rétention du plan gratuit Cloudflare Zero Trust) ; l'historique des accès de
cette période n'est donc **plus reconstituable**.

Cloudflare est une entreprise états-unienne. **Les journaux Cloudflare ne sont
pas hébergés au Canada**. Dans tous les cas, aucun fichier d'élève ne transite
par Cloudflare — seul l'accès à l'application elle-même était filtré (voir §4).

### 3.4 Rapports de bug archivés

Lorsque l'auteur (ou, plus rarement, une personne ayant reçu un accès)
signale un bug via la fonction intégrée, l'application **archive localement**
le rapport dans la clé `rapportsBugArchives` (IndexedDB, **maximum 20
rapports avec rotation automatique**, abaissé depuis 50 le 22 mai 2026
en réponse à la Phase 6.2 PLAN-AQPC).

**Audit technique réalisé le 22 mai 2026** sur la structure stockée par
`js/rapport-bug.js` :

| Champ | Sensibilité | Source |
|---|---|---|
| `id`, `date`, `envoye`, `type` | Faible | Généré automatiquement |
| `prenom` | **PII testeur** | Saisi par le testeur dans le formulaire |
| `description` | **PII potentielle** | Texte libre — peut contenir des noms d'étudiants si le testeur les nomme explicitement |
| `rapport.stack` | Faible (technique) | Trace d'exécution JavaScript |
| `rapport.contexte` | Faible | Section active, compteurs (nb étudiants, nb productions), `infoCours.enseignant` (PII enseignant) |
| `rapport.actions` | Faible | 10 dernières actions (clics, navigation) |
| `rapport.etat` | Faible | 5 clés localStorage tronquées à 50 caractères |

**Données par construction NON présentes dans les rapports** :
- Noms ou prénoms d'étudiants directement
- DA d'étudiants
- Notes individuelles
- Contenu de travaux (photos, PDF)

**Le seul vecteur de PII étudiante** dans un rapport archivé est la
description libre saisie par le testeur. Pour réduire ce risque :
- Le formulaire de saisie affiche désormais (depuis 22 mai 2026) une
  note explicite invitant à éviter de nommer des étudiants nominalement
  (« utilise plutôt l'étudiant·e A »).
- Le seuil de rétention est passé de 50 à 20 rapports.

Pour consulter ou supprimer les rapports archivés, ouvrir l'application
puis aller dans le menu Bug → **« Voir les rapports archivés »**. Chaque
rapport peut être supprimé individuellement.

### 3.5 Code source (GitHub, public)

Le code source est sous licence CC BY-NC-SA 4.0 et hébergé publiquement
sur GitHub. Il contient :
- Aucune donnée étudiante.
- Le nom de l'auteur (signature des commits).
- Éventuellement des **rapports d'incidents anonymisés** dans `INCIDENTS.md`
  et le nom de testeurs qui ont accepté d'être cités dans des remerciements
  (`README.md`).
- Le code, les commentaires, la documentation, les exemples (jeu de données
  démo `groupe 9999` composé d'étudiants fictifs).

---

## 4. Fonctionnement hors-ligne

Labo Codex respecte un principe d'**autonomie complète** :

- Aucune connexion réseau n'est requise après le chargement initial du site.
- L'application peut être ouverte depuis un fichier local (`file://`) ou
  hébergée sur un serveur statique de l'institution.
- Toutes les données étudiantes vivent dans le navigateur (IndexedDB) ou
  sur le système de fichiers de l'enseignant (Réserve).
- Aucune télémétrie, aucun pixel de suivi, aucune balise analytique.
- Aucun service tiers n'est appelé pendant l'usage normal (pas de polices
  Google, pas de CDN externe — sauf Chart.js, vendored localement).

**Conséquence pour la protection des renseignements personnels** : il n'y a
**pas de communication transfrontalière** de renseignements personnels d'élèves
dans l'usage normal. Le seul trafic réseau lors de l'utilisation locale est :
- Le chargement initial du site (HTML, CSS, JS, images) depuis Netlify (Canada/USA)
  via le proxy Cloudflare (DNS/CDN, États-Unis) — sans données étudiantes.
- Aucun envoi automatique de données après le chargement.

**Politique de sécurité du contenu (CSP)** : `script-src 'self'` —
aucun script externe ne peut s'exécuter. Aucun `eval()`, aucune injection
dynamique non échappée.

---

## 5. Anonymisation

Labo Codex offre **deux niveaux distincts** d'anonymisation, à ne pas
confondre.

### 5.1 Mode anonymisation d'affichage (en classe)

Activé via la barre de navigation (icône dédiée), ce mode **masque les noms
réels** des étudiants à l'écran (remplacement par des identifiants stables
`Étudiant-001`, `Étudiant-002`, etc.). Il est destiné aux **projections en
classe** pour préserver la confidentialité.

- L'anonymisation est **réversible** : la table de correspondance est
  conservée localement (clé `mapping_anonymisation`).
- Les données sous-jacentes (Codex, IndexedDB) **restent identifiantes**.
- Le mode est **uniquement visuel** ; il ne modifie pas le stockage.

### 5.2 Anonymisation des codex data (extraction pour recherche)

Lorsqu'un enseignant **extrait** des données vers un fichier `codex data`
destiné au partage (recherche pédagogique, analyse longitudinale, dépôt
dans la Voûte), une anonymisation **plus profonde** est appliquée :

| Donnée | Traitement |
|---|---|
| Noms, prénoms | Identifiants séquentiels |
| Numéros d'admission (DA) | **Supprimés** (jamais hashés — un DA est trop court, un hash serait réversible par force brute) |
| Numéro de groupe | Identifiant générique (`Groupe-A`, `Groupe-B`) |
| Photos et PDF de travaux | **Exclus par défaut** (l'écriture manuscrite est biométriquement identifiable) |
| Notes, présences, indices | Conservés (valeur pédagogique de la recherche) |

**Limite reconnue** : avec ~25 étudiants et ~10 productions, un profil de
notes est quasi unique dans un groupe. L'anonymisation ne protège pas
contre une ré-identification par quelqu'un qui connaît la composition du
groupe. La politique opérationnelle est donc de **limiter l'accès aux
codex data individuels** (pas de publication ouverte de profils étudiants,
même anonymisés).

**Décision en suspens** (avis Loi 25) : caractère réversible ou irréversible
de l'anonymisation. Si l'avis institutionnel impose l'irréversibilité, la
table de correspondance sera détruite à l'extraction.

### 5.3 Donnée de démonstration

L'application inclut un groupe fictif (`groupe 9999`) composé d'**étudiants
inventés** (pas de personnes réelles). Ce jeu de démonstration sert à
l'apprentissage de l'outil et n'est pas concerné par la Loi 25.

---

## 6. Identification à l'entrée du site (Cloudflare Access)

### 6.1 État actuel : identification à porte ouverte

**Du 3 juin au 31 août 2026** : Cloudflare Access désactivé, application
publiquement accessible sans authentification (ADR-008, révision du 2 juin 2026).

**À partir du 1er septembre 2026** : Cloudflare Access est réactivé (ADR-008,
révision du 27 août 2026, et DEPLOY.md §3). Vous saisissez votre adresse
courriel, vous recevez un code à usage unique, et vous n'avez plus à vous
identifier pendant **un mois** — après quoi vous recommencez, aussi souvent que
vous le souhaitez. L'accès ne se ferme pas au bout du mois.

**La porte est ouverte.** La règle d'accès est `Everyone` : toute adresse
courriel capable de recevoir le code entre. Il n'y a **ni liste d'invités, ni
sélection, ni refus**. Ce que le dispositif produit, c'est une liste de ceux qui
sont entrés — et c'est sa seule raison d'être (§3.3).

Conséquence : il n'existe **ni liste d'accès individuelle, ni sélection, ni refus**
— mais, à partir du 1er septembre 2026, il existe une **authentification** et une
liste des personnes qui se sont identifiées (§3.3). Les *journaux* d'accès, eux,
restent purgés à 24 h (§8.2). Le risque résiduel se limite au scraping d'assets
statiques publics (code déjà public sur GitHub) et à un déni de service absorbé
par le CDN Cloudflare.

### 6.2 Historique : phase d'accès individuel (janvier – mai 2026)

Pendant la phase d'invitations alpha, le site était protégé par **Cloudflare
Access** (service Zero Trust) : les personnes invitées s'authentifiaient par OTP
(mot de passe à usage unique envoyé par courriel) à chaque session. La liste
d'accès a compté jusqu'à une cinquantaine de collègues (en plus de l'auteur),
sans jamais atteindre le quota gratuit Cloudflare Zero Trust (50 utilisateurs).
*Correction du 27 août 2026 : ce passage affirmait que le quota était saturé. Il
ne l'a jamais été — l'export du 20 mai 2026 recense 51 identités enregistrées mais
seulement 4 sièges d'accès actifs.* **Aucune
liste nominative n'a été publiée.** La quasi-totalité des personnes invitées a
brièvement consulté l'application puis n'y est pas revenue, sans feedback
structuré ni rapport de bug par cette voie.

Pendant cette phase, Cloudflare traitait, selon la politique standard du plan
gratuit Zero Trust :

| Donnée | Conservation |
|---|---|
| Courriel de l'invité | Conservé dans l'espace Zero Trust du projet, sans limite de durée, indépendamment de la liste d'accès (voir §3.3) |
| Journaux d'accès (date, heure, IP des sessions) | **24 heures** sur le plan gratuit, puis purgés automatiquement par Cloudflare |
| Codes OTP utilisés | Stockés temporairement le temps de la validation, puis purgés |
| Cookies de session | **Validité d'une semaine** par configuration de l'application Access |

À la désactivation d'Access, la liste d'accès n'est plus opérante ; les journaux
de cette période avaient déjà été purgés (rétention 24 h) et ne sont **plus
reconstituables**. Cette communication transfrontalière n'a concerné que les
**métadonnées d'accès au site** (courriels, IP, horaires), jamais les données
étudiantes (strictement locales — voir §4).

### 6.3 Aucun fichier étudiant ne transite par Cloudflare

Que Cloudflare Access soit actif ou non, le proxy Cloudflare n'intercepte que la
**requête initiale** au site. Une fois la page chargée, l'application fonctionne
**hors ligne sur la machine de l'utilisateur**. Aucun fichier étudiant, aucune
note, aucune photo ne transite par les serveurs Cloudflare.

### 6.4 Conditions d'un durcissement ultérieur

La réactivation du 1er septembre 2026 laisse la porte ouverte. Elle pourrait être
**restreinte** plus tard (liste d'adresses, filtrage par domaine) si une raison
concrète apparaissait : abus mesurable, DoS persistant, scraping intensif,
création de la Voûte imposant un contrôle d'accès applicatif, ou bascule
institutionnelle. Le détail figure dans DEPLOY.md §3.6 et l'ADR-008
(« À réviser si »).

---

## 7. Chiffrement au repos

### 7.1 Machine de l'enseignant

| Appareil | Chiffrement |
|---|---|
| MacBook (M3) | **FileVault activé** — chiffrement intégral du disque (AES-XTS 256 bits) par macOS. |
| iPad Air (M1) | **Chiffrement matériel par défaut** — iPadOS chiffre les données utilisateur dès qu'un code d'accès est défini (AES-256 par Secure Enclave). |
| Clé USB (Codex) | Chiffrement **à mettre en place** — versement chiffré ZIP dans la roadmap. Actuellement, le `.codex.zip` n'est pas chiffré ; il dépend de la confidentialité physique de la clé. |

### 7.2 Pendant le transport (réseau)

| Trajet | Chiffrement |
|---|---|
| Navigateur ↔ Netlify | HTTPS / TLS 1.3 obligatoire |
| Navigateur ↔ Cloudflare (DNS / proxy, et Access à partir du 1er septembre 2026) | HTTPS / TLS 1.3 obligatoire — voir §6 |
| Échanges locaux (file://) | Aucun trafic réseau |

### 7.3 Voûte (à venir)

La Voûte (bibliothèque partagée entre enseignants, voir
[`docs/architecture/ECOSYSTEME-DONNEES.md`](docs/architecture/ECOSYSTEME-DONNEES.md))
n'est **pas encore déployée**. Quand elle le sera, les dépôts seront
signés cryptographiquement (ECDSA P-256, Web Crypto API) pour prévenir
l'usurpation d'identité et garantir l'intégrité du contenu.

---

## 8. Durées de conservation

### 8.1 Données étudiantes (sur machine de l'enseignant)

| Donnée | Durée |
|---|---|
| Codex actif (trimestre en cours) | Tant que l'enseignant en a l'usage pédagogique |
| Réserve (trimestres archivés) | **Aucune purge automatique par design** — la Réserve est un coffre-fort personnel jamais détruit (voir [`docs/architecture/ECOSYSTEME-DONNEES.md`](docs/architecture/ECOSYSTEME-DONNEES.md) §2) |
| Snapshots de progression | Liés au trimestre concerné (vit dans la Réserve) |

**Question en suspens (avis Loi 25)** : durée légale maximale de conservation
des données étudiantes pour un enseignant de cégep. La pratique actuelle
(conservation longue) repose sur la valeur pédagogique (suivi longitudinal
sur plusieurs sessions, mémoire institutionnelle des grilles) et l'usage
en **pratique individuelle**. L'avis du responsable PRP du Cégep est
attendu avant fin juin 2026 ; il pourra imposer une durée précise.

### 8.2 Données d'accès Cloudflare

**Du 3 juin au 31 août 2026** : Cloudflare Access désactivé, aucune métadonnée
d'accès individuelle collectée.

**À partir du 1er septembre 2026** :

- **Journaux d'accès** (date, heure, IP) : **24 heures** sur le plan gratuit
  Cloudflare Zero Trust, purgés automatiquement par Cloudflare.
- **Cookies de session** : validité d'**un mois** — valeur retenue pour la
  réactivation du 1er septembre 2026, à confirmer une fois le paramètre en place
  (une semaine pendant la phase historique de janvier – mai 2026). Renouvelés à
  chaque nouvelle authentification OTP.
- **Adresse courriel et date de dernière connexion** : **conservées sans limite
  de durée** dans l'espace Zero Trust du projet, et exportées périodiquement.
  Retrait sur demande (§3.3 et §9). C'est la donnée qui justifie le dispositif ;
  elle est décrite en détail au §3.3.

### 8.3 Rapports de bug archivés

**20 derniers rapports**, rotation automatique (`MAX_RAPPORTS_ARCHIVES`
dans `js/rapport-bug.js`). Seuil abaissé de 50 à 20 le 22 mai 2026
suite à l'audit technique Phase 6.2 PLAN-AQPC (cf. §3.4). Migration
de tronquage idempotente exécutée au démarrage de l'application si
l'utilisateur avait des rapports excédentaires.

L'utilisateur peut à tout moment supprimer un rapport individuellement
via le menu Bug → **« Voir les rapports archivés »**, ou vider toute
la liste via le bouton « Vider les archives ».

### 8.4 Code source (GitHub)

**Public et permanent**. Le dépôt GitHub conserve l'historique complet
des commits, y compris les noms de testeurs cités dans la documentation
ou les remerciements. Toute personne mentionnée nommément (avec son
consentement) peut demander le retrait de cette mention par courriel
(voir §10).

---

## 9. Vos droits sur vos renseignements personnels

Même si le régime formel de la Loi 25 ne s'applique vraisemblablement pas à la
configuration actuelle (cf. §1.1), l'auteur s'engage à honorer, **dans leur
esprit et à titre volontaire**, les droits que la Loi 25 reconnaît sur les
renseignements personnels. Vous pouvez ainsi exercer les droits suivants (les
articles cités servent de repère) :

| Droit | Article Loi 25 | Comment l'exercer |
|---|---|---|
| **Droit d'accès** — savoir si nous détenons des renseignements personnels sur vous, en obtenir une copie | art. 27 | Écrire à [labo@codexnumeris.org](mailto:labo@codexnumeris.org). Délai de réponse : 30 jours. |
| **Droit de rectification** — corriger des renseignements inexacts ou incomplets | art. 28 | Idem. |
| **Droit à l'effacement** — demander la suppression de vos renseignements (sous conditions Loi 25) | art. 28.1 (en vigueur depuis sept. 2023) | Idem. |
| **Droit à la portabilité** — recevoir vos renseignements dans un format technologique structuré et couramment utilisé | art. 27 (depuis sept. 2024) | Idem. Labo Codex peut produire un export JSON UTF-8 conforme. |
| **Droit de retrait du consentement** | art. 14 | À partir du 1er septembre 2026, écrire à [labo@codexnumeris.org](mailto:labo@codexnumeris.org) pour faire supprimer votre adresse de l'espace Zero Trust (§3.3). Vous pourrez continuer d'utiliser l'application : vous vous identifierez de nouveau, ce qui recréera une entrée. |
| **Droit de plainte** auprès de la Commission d'accès à l'information (CAI) | art. 81 | [cai.gouv.qc.ca](https://www.cai.gouv.qc.ca) |

### 9.1 Étudiants — comment exercer vos droits

Si vos données figurent dans l'application Labo Codex utilisée par votre
enseignant, vous pouvez :

1. **D'abord** : en discuter directement avec votre enseignant (le
   responsable du traitement des données dans sa pratique pédagogique).
2. **Sinon** : écrire au responsable institutionnel de la protection des
   renseignements personnels (PRP) du cégep concerné.

Le Cégep de Drummondville étant l'établissement d'attache de l'auteur,
le responsable PRP du Cégep est le point de contact recommandé pour les
demandes formelles. Coordonnées exactes : *à confirmer (information en
attente — voir §11)*.

### 9.2 Collègues enseignants et utilisateurs identifiés

Vous avez les mêmes droits, exercés directement auprès de
[labo@codexnumeris.org](mailto:labo@codexnumeris.org).

### 9.3 Limites de l'effacement

L'application étant hébergée localement chez chaque utilisateur, l'effacement
**effectif** des données stockées sur la machine d'un enseignant tiers ne
peut être garanti par l'auteur. La demande d'effacement adressée au
responsable du traitement (Grégoire Bédard) couvre :
- Les données archivées dans la Réserve de l'auteur.
- Les rapports de bug archivés mentionnant la personne.
- Les mentions nominatives dans `INCIDENTS.md`, `README.md`,
  `docs/MESSAGES_ENSEIGNANTS_H2026.md` (fichier supprimé du dépôt depuis) (si applicable).
- La suppression de votre adresse dans l'espace Zero Trust Cloudflare
  (`My Team → Users`), à partir du 1er septembre 2026 — voir §3.3 et §6.

Elle **ne couvre pas** :
- Les données sur la machine d'un autre enseignant utilisateur (chaque
  enseignant est responsable du traitement de ses propres données).
- Les copies de fichiers transférées hors du système (clé USB, courriel).

---

## 10. Mentions formelles (dans l'esprit de la Loi 25)

> Le régime formel de la Loi 25 ne s'applique vraisemblablement pas à la
> configuration actuelle (cf. §1.1). Les mentions ci-dessous sont maintenues
> **volontairement**, comme bonnes pratiques et points de repère ; elles
> deviendraient des obligations formelles si la posture changeait (cf. §1.2).

### 10.1 Registre des incidents

Le registre des incidents de confidentialité, conforme à l'art. 63.5 de
la Loi 25, est maintenu dans [`INCIDENTS.md`](INCIDENTS.md). Tout incident
de perte, vol, divulgation ou usage non autorisé d'un renseignement
personnel y est consigné.

### 10.2 Évaluation des facteurs relatifs à la vie privée (ÉFVP)

L'ÉFVP formelle est **en cours de préparation**. Elle sera produite
conjointement avec le responsable PRP du Cégep dans le cadre de la
demande d'avis envoyée en mai 2026. Échéance : été-automne 2026.

### 10.3 Déclaration à la Commission d'accès à l'information (CAI)

Aucun fichier de renseignements personnels n'est actuellement déclaré
à la CAI. La nécessité d'une déclaration sera évaluée avec le responsable
PRP du Cégep (question juridique en suspens : un fichier IndexedDB local
sur la machine d'un enseignant constitue-t-il un « fichier de renseignements
personnels » au sens de la Loi sur l'accès ?).

### 10.4 Hébergement à l'étranger

Labo Codex utilise actuellement deux services hébergés à l'étranger :

| Service | Localisation | Données concernées | Mesures de protection |
|---|---|---|---|
| Netlify (frontal statique) | États-Unis / Canada (CDN distribué) | Code de l'application uniquement — **aucune donnée étudiante** | HTTPS / TLS 1.3 |
| Cloudflare (DNS / proxy / CDN / Access) | États-Unis | Requêtes HTTP du site — **aucune donnée étudiante**. **À partir du 1er septembre 2026** : adresse courriel de chaque personne qui s'identifie, conservée **sans limite de durée**, plus IP et horaires conservés 24 h (§3.3, §8.2). Historiquement : mêmes métadonnées pour les collègues invités (janvier – mai 2026) ; aucune du 2 juin au 31 août 2026 | TLS 1.3 ; OTP par courriel |

Aucun fichier d'élève ne transite par ces services dans l'usage normal.
Le transfert transfrontalier de renseignements personnels se limite aux
**métadonnées d'accès au site**, jamais aux données étudiantes. Il a eu lieu
pendant la phase d'accès individuel (janvier – mai 2026), a cessé du 2 juin au
31 août 2026, et **reprend le 1er septembre 2026** avec la réactivation de
Cloudflare Access — avec cette différence que l'adresse courriel y est désormais
conservée **sans limite de durée** et exportée périodiquement (§3.3). Toute
personne qui s'identifie en est informée par la présente politique et peut
demander le retrait de son adresse (§9).

---

## 11. Coordonnées

| Question | Contact |
|---|---|
| Demande Loi 25, retrait Cloudflare, signalement incident | [labo@codexnumeris.org](mailto:labo@codexnumeris.org) |
| Question institutionnelle (Cégep de Drummondville) | Responsable PRP du Cégep — *coordonnées à confirmer* |
| Plainte formelle | [Commission d'accès à l'information du Québec](https://www.cai.gouv.qc.ca) |
| Bug technique ou suggestion | [GitHub Issues](https://github.com/bedardg71-codexnumeris/Monitorage_v6/issues) |

---

## 12. Limites assumées de ce document

Par souci de transparence :

1. **L'avis du responsable PRP du Cégep n'est pas encore reçu** (demande
   envoyée en mai 2026, délai de réponse 2-6 semaines). Plusieurs points
   sont marqués « à confirmer » et seront précisés dans une version ultérieure.
2. **L'inventaire technique de `rapportsBugArchives` a été conduit le
   22 mai 2026** (audit Phase 6.2 PLAN-AQPC). La structure stockée est
   désormais documentée (§3.4). Une revue manuelle du contenu réel des
   rapports actuels par l'auteur reste recommandée si un doute persiste
   sur des descriptions ayant nommé des étudiants.
3. **L'ÉFVP formelle est en préparation** — pas encore disponible.
4. **Cloudflare Access est réactivé le 1er septembre 2026**, porte ouverte. Les
   *journaux* d'accès restent purgés à 24 h sur le plan gratuit et ne sont pas
   reconstituables — ceux de la phase historique (janvier – mai 2026) sont perdus.
   En revanche la **liste des adresses** et leur date de dernière connexion sont
   conservées sans limite et exportées périodiquement (§3.3) : c'est une
   conservation de renseignements personnels qui n'existait pas dans la version
   1.1 de ce document.
5. Labo Codex est un **projet de mainteneur unique** (`CAF = 1`).
   La pérennité de la politique de protection des données dépend de
   l'engagement personnel de l'auteur. Un plan de transition / passage de
   relais sera documenté en cas d'évolution institutionnelle.
6. **Le régime applicable repose sur une inférence juridique** (Loi 25 secteur
   privé vraisemblablement inapplicable, cf. §1.1) qui reste *à confirmer par un
   juriste* et qui devra être reprise si la posture du projet change (cf. §1.2).

Ces limites sont **assumées** et inscrites dans ce document plutôt que
masquées — pour permettre à un lectorat informé (juriste, responsable
PRP, collègue, étudiant, parent) de juger sur pièces.

---

## Historique des révisions

| Date | Version | Modification |
|---|---|---|
| 2026-05-22 | 1.0 DRAFT | Rédaction initiale, soumis à validation de Grégoire et du responsable PRP du Cégep |
| 2026-08-27 | 1.2 | **Réactivation de Cloudflare Access au 1er septembre 2026, avec une porte ouverte (`Everyone`).** (a) §3.3 réécrite : distinction entre les *journaux* d'authentification (purgés à 24 h) et la *liste des identités* (`My Team → Users`, conservée sans limite et **exportée périodiquement**) ; finalité déclarée — savoir qui utilise l'application pour pouvoir joindre les utilisateurs, non pour filtrer l'entrée ; procédure de retrait. (b) §6 retitrée et §6.1 / §6.4 réécrites (durcissement éventuel, plutôt que réactivation éventuelle). (c) §8.2 : durée de session portée à un mois, ajout de la ligne de conservation des adresses. (d) §1.1, §2, §7.2, §9, §9.3, §12.4 alignés. (e) §6.2 : correction d'une affirmation de saturation du quota qui était fausse. Cf. ADR-008 révision du 27 août 2026 et DEPLOY.md v1.6. |
| 2026-06-13 | 1.1 | Alignement sur DEPLOY.md §1.4 et ADR-008 (rév. 2 juin 2026) : régime réel précisé (Loi 25 secteur privé vraisemblablement inapplicable, §1.1) ; conditions de révision de la posture ajoutées (§1.2) ; Cloudflare Access désactivé et accès public par défaut reflétés (§2, §3.3, §4, §6, §7.2, §8.2, §10.4) ; vocabulaire « base de consentement Loi 25 » retiré ; références à la fenêtre 3-30 juin et au refermage du 1er juillet supprimées. |

---

**Document à mettre à jour** en version 1.2 lorsque :
- L'avis du responsable PRP du Cégep est reçu (coordonnées §11, mentions formelles §10).
- L'ÉFVP est produite.
- La posture du projet change au sens du §1.2 (port institutionnel, base
  d'utilisateurs élargie, traitement de données pédagogiques côté serveur).
