# Politique de confidentialité — Labo Codex

> **Version** : 1.0 (DRAFT du 22 mai 2026, soumis à validation)
> **Responsable** : Grégoire Bédard, Cégep de Drummondville
> **Cadre légal** : Loi modernisant des dispositions législatives en matière
> de protection des renseignements personnels (Loi 25, Québec, 2021)
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
- quels droits vous avez sur vos données (Loi 25),
- à qui vous adresser pour les exercer.

Elle vise un double public : les **collègues enseignants** à qui un accès
individuel à l'application a été accordé, et les **étudiants** dont les
données pédagogiques transitent par l'outil.

---

## 2. Qui est responsable du traitement

| Rôle | Personne / entité | Coordonnées |
|---|---|---|
| Responsable du traitement | Grégoire Bédard, enseignant en littérature, Cégep de Drummondville | [labo@codexnumeris.org](mailto:labo@codexnumeris.org) |
| Responsable institutionnel (PRP) | Cégep de Drummondville — responsable de la protection des renseignements personnels | *À confirmer (demande envoyée [À COMPLÉTER — date], réponse attendue 2-6 semaines)* |
| Hébergement public | Netlify (frontal statique) + Cloudflare Access (contrôle d'accès) | Conditions Netlify et Cloudflare applicables |
| Code source | GitHub (dépôt public) | [github.com/bedardg71-codexnumeris/Monitorage_v6](https://github.com/bedardg71-codexnumeris/Monitorage_v6) |

**Statut actuel** : Labo Codex est utilisé en **pratique pédagogique individuelle**
par son auteur. Un accès individuel à l'application en ligne a été accordé
à une cinquantaine de collègues entre janvier et mai 2026 (voir §6). Sur
ces ~50 personnes, la quasi-totalité a brièvement consulté l'application
puis n'y est pas revenue. **Aucun retour de bug, aucune demande de
feedback structuré, aucune cohorte active d'usage n'a émergé de cette
voie**. L'usage effectif est donc resté individuel (l'auteur seul). L'adoption
institutionnelle formelle (Cégep, autres établissements) est subordonnée à
l'avis du responsable PRP du Cégep et à la signature d'ÉFVP (évaluation des
facteurs relatifs à la vie privée) le cas échéant.

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

### 3.3 Données d'accès au site (Cloudflare Access)

Pour la cinquantaine de collègues à qui un accès individuel à l'application
en ligne a été accordé entre janvier et mai 2026, **Cloudflare Access**
(service Zero Trust) agit comme portail d'authentification par courriel à
usage unique (OTP).

**Données collectées par Cloudflare** :
- Adresse courriel de l'invité (pour envoi du code OTP — One-Time PIN)
- Date et heure des accès
- Adresse IP de la session
- Identifiant de session (cookie, validité une semaine)

**Au 22 mai 2026** : la liste blanche compte 51 personnes (l'auteur +
~50 collègues invités). Aucune session active sur les 24 dernières heures
(rétention des logs sur le plan gratuit Cloudflare Zero Trust = 24 h
seulement).

Cloudflare est une entreprise états-unienne. **Les logs Cloudflare ne sont
pas hébergés au Canada**. Aucun fichier d'élève ne transite par Cloudflare —
seul l'accès à l'application elle-même est filtré.

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

**Conséquence Loi 25** : il n'y a **pas de communication transfrontalière**
de renseignements personnels d'élèves dans l'usage normal. Le seul trafic
réseau lors de l'utilisation locale est :
- Le chargement initial du site (HTML, CSS, JS, images) depuis Netlify (Canada/USA)
  via Cloudflare Access (États-Unis) — sans données étudiantes.
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

## 6. Cloudflare Access (contrôle d'accès au site)

### 6.1 Contexte

Pour limiter l'accès à l'application en ligne pendant la phase d'invitations
individuelles, le site est protégé par **Cloudflare Access** (service
Zero Trust). Les personnes invitées reçoivent un courriel d'invitation,
puis s'authentifient par OTP (mot de passe à usage unique envoyé par courriel)
lors de chaque session.

### 6.2 Liste des invités

La liste blanche Cloudflare contient **51 personnes** au 22 mai 2026 :
l'auteur et une cinquantaine de collègues à qui un accès individuel a été
accordé entre janvier et mai 2026. Le quota gratuit Cloudflare Zero Trust
(50 utilisateurs) est essentiellement saturé. **Aucune liste nominative
n'est publiée** dans ce document afin de protéger la confidentialité des
personnes concernées.

**Usage effectif observé** : la quasi-totalité des personnes invitées a
brièvement consulté l'application puis n'y est pas revenue. Aucune
n'a soumis de feedback structuré ni signalé de bug par cette voie.
La liste est conservée par défaut, mais un retrait sera proposé aux
personnes inactives lors d'un futur audit (voir [`DEPLOY.md`](DEPLOY.md) §4.4).

Les personnes invitées peuvent demander **à tout moment** leur retrait de
la liste blanche en écrivant à
[labo@codexnumeris.org](mailto:labo@codexnumeris.org).

### 6.3 Données conservées par Cloudflare

Selon la politique standard de Cloudflare Zero Trust (plan gratuit, état
au 22 mai 2026) :

| Donnée | Conservation |
|---|---|
| Courriel de l'invité | Tant que l'invité figure dans la liste blanche |
| Logs d'accès (date, heure, IP des sessions) | **24 heures** sur le plan gratuit, puis purgés automatiquement par Cloudflare |
| Codes OTP utilisés | Stockés temporairement le temps de la validation, puis purgés |
| Cookies de session | **Validité d'une semaine** par configuration de l'application Access |

**Observation au 22 mai 2026** : la console Cloudflare montre 0 session
active sur les 24 dernières heures. L'usage actif reste limité à l'auteur,
qui travaille essentiellement en local via `file://` sans passer par
Cloudflare. Les logs anciens (janvier à mai 2026) ne sont **plus disponibles**
dans le dashboard en raison de la rétention courte du plan gratuit.

**Hébergement** : Cloudflare est une entreprise américaine. **Les logs ne
sont pas hébergés au Canada**. Cette communication transfrontalière a
concerné les **métadonnées d'accès au site** (courriels des personnes
invitées, IP, horaires) au moment où elles se sont connectées, et non les
données étudiantes (qui restent strictement locales — voir §4).

### 6.4 Aucun fichier étudiant ne transite par Cloudflare

Cloudflare Access intercepte uniquement la **requête initiale** au site
(authentification). Une fois la session établie, l'application fonctionne
**hors ligne sur la machine de l'utilisateur**. Aucun fichier étudiant,
aucune note, aucune photo ne transite par les serveurs Cloudflare.

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
| Navigateur ↔ Cloudflare Access | HTTPS / TLS 1.3 obligatoire |
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

- **Logs d'accès** (date, heure, IP) : **24 heures** sur le plan gratuit
  Cloudflare Zero Trust, purgés automatiquement par Cloudflare.
- **Cookies de session** : validité d'une semaine, renouvelés à chaque
  nouvelle authentification OTP.
- **Courriels en liste blanche** : conservés tant que la personne reste
  invitée. Retrait sur demande (§9).

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

## 9. Droits Loi 25

Conformément à la Loi 25, vous disposez sur les renseignements personnels
qui vous concernent des droits suivants :

| Droit | Article Loi 25 | Comment l'exercer |
|---|---|---|
| **Droit d'accès** — savoir si nous détenons des renseignements personnels sur vous, en obtenir une copie | art. 27 | Écrire à [labo@codexnumeris.org](mailto:labo@codexnumeris.org). Délai de réponse : 30 jours. |
| **Droit de rectification** — corriger des renseignements inexacts ou incomplets | art. 28 | Idem. |
| **Droit à l'effacement** — demander la suppression de vos renseignements (sous conditions Loi 25) | art. 28.1 (en vigueur depuis sept. 2023) | Idem. |
| **Droit à la portabilité** — recevoir vos renseignements dans un format technologique structuré et couramment utilisé | art. 27 (depuis sept. 2024) | Idem. Labo Codex peut produire un export JSON UTF-8 conforme. |
| **Droit de retrait du consentement** — pour les personnes ayant reçu un accès Cloudflare Access | art. 14 | Demander le retrait de la liste blanche Cloudflare. |
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

### 9.2 Collègues enseignants ayant reçu un accès individuel

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
  `docs/MESSAGES_ENSEIGNANTS_H2026.md` (si applicable).
- La radiation de la liste blanche Cloudflare Access.

Elle **ne couvre pas** :
- Les données sur la machine d'un autre enseignant utilisateur (chaque
  enseignant est responsable du traitement de ses propres données).
- Les copies de fichiers transférées hors du système (clé USB, courriel).

---

## 10. Loi 25 — mentions formelles

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
| Cloudflare Access (contrôle d'accès) | États-Unis (logs aux États-Unis) | Métadonnées d'accès des **personnes ayant reçu un accès individuel** (courriels, IP, horaires) — **aucune donnée étudiante** | Authentification OTP, TLS 1.3 |

Aucun fichier d'élève ne transite par ces services dans l'usage normal.
Le seul transfert transfrontalier concerne les **métadonnées d'accès au
site** des collègues invités, qui en ont été informés à l'invitation.

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
   sont marqués « à confirmer » et seront précisés dans la version 1.1.
2. **L'inventaire technique de `rapportsBugArchives` a été conduit le
   22 mai 2026** (audit Phase 6.2 PLAN-AQPC). La structure stockée est
   désormais documentée (§3.4). Une revue manuelle du contenu réel des
   rapports actuels par l'auteur reste recommandée si un doute persiste
   sur des descriptions ayant nommé des étudiants.
3. **L'ÉFVP formelle est en préparation** — pas encore disponible.
4. **Les logs Cloudflare ne sont conservés que 24 h** sur le plan gratuit.
   L'historique précis des accès depuis janvier 2026 n'est donc pas
   reconstituable a posteriori.
5. Labo Codex est un **projet de mainteneur unique** (`CAF = 1`).
   La pérennité de la politique de protection des données dépend de
   l'engagement personnel de l'auteur. Un plan de transition / passage de
   relais sera documenté en cas d'évolution institutionnelle.

Ces limites sont **assumées** et inscrites dans ce document plutôt que
masquées — pour permettre à un lectorat informé (juriste, responsable
PRP, collègue, étudiant, parent) de juger sur pièces.

---

## Historique des révisions

| Date | Version | Modification |
|---|---|---|
| 2026-05-22 | 1.0 DRAFT | Rédaction initiale, soumis à validation de Grégoire et du responsable PRP du Cégep |

---

**Document à mettre à jour** en version 1.1 lorsque :
- L'avis du responsable PRP du Cégep est reçu (coordonnées §11, mentions formelles §10).
- L'ÉFVP est produite.
