# Modèle de menaces — Labo Codex

> **Document de sécurité** — première version : 6 mai 2026
>
> **Auteur initial** : Grégoire Bédard, avec assistance Claude (analyse de code, modélisation, rédaction).
>
> **Statut** : version 1.5 (8 mai 2026, Défense I livrée — suite de tests sécurité automatisés). Document vivant — à réviser à chaque évolution majeure du code, à chaque incident, à chaque ajout d'un nouveau vecteur (Plan 2 partage CC, accès étudiant, etc.).
>
> **Périmètre couvert** : vecteurs prioritaires identifiés par Grégoire — partage entre enseignants (bibliothèques type Voûte, grilles) et import codex / codex data / archives. Tous profils d'attaquants confondus (collègue malveillant, attaquant externe, IA assistant un attaquant, contributeur interne au code).
>
> **Hors périmètre** : interaction étudiante (horizon lointain, voir `.claude/skills/securite-donnees/SKILL.md` §7), sécurité physique du Mac de l'enseignant (responsabilité OS), accès non autorisé via session déverrouillée.

---

## Table des matières

1. [Préambule](#1-préambule)
2. [Glossaire pour non-spécialistes](#2-glossaire-pour-non-spécialistes)
3. [Cartographie des surfaces d'attaque](#3-cartographie-des-surfaces-dattaque)
4. [Cartographie de ce qui peut être détruit ou compromis](#4-cartographie-de-ce-qui-peut-être-détruit-ou-compromis)
5. [Profils d'attaquants](#5-profils-dattaquants)
6. [Tableau récapitulatif des scénarios](#6-tableau-récapitulatif-des-scénarios)
7. [Scénarios détaillés](#7-scénarios-détaillés) — 14 scénarios (7 complets + 7 courts)
8. [Plan de défense priorisé (roadmap)](#8-plan-de-défense-priorisé-roadmap)
9. [Annexes](#9-annexes)

---

## 1. Préambule

### 1.1 Pourquoi ce document

Labo Codex stocke des données pédagogiques sensibles (noms et DA d'étudiants, notes, photos de copies manuscrites) et héberge un patrimoine intellectuel construit sur plusieurs trimestres (grilles d'évaluation, échelles, cartouches, séquences). Le projet prévoit aussi une mécanique de partage entre enseignants (Voûte, bibliothèques) qui crée un canal de propagation entre comptes.

La crainte centrale qui motive ce document est explicitement formulée par Grégoire : **destruction massive des données utilisateur, contamination virale entre comptes, perte de patrimoine pédagogique irréversible**. L'altération silencieuse, l'exfiltration et le vol ciblé de données identifiantes (enseignant, étudiants) sont également traités — non comme risques secondaires mais comme menaces régulatoires (Loi 25) et éthiques de plein droit.

Ce document a quatre fonctions :

1. **Anticipation** — identifier les vecteurs d'attaque possibles avant qu'ils soient exploités.
2. **Priorisation** — classer les menaces par impact et probabilité pour orienter l'effort de défense.
3. **Spécification** — décrire les défenses requises avec assez de précision pour qu'elles soient codables.
4. **Mémoire** — documenter pourquoi telle protection existe, pour qu'elle ne soit pas retirée par mégarde dans un futur refactoring.

### 1.2 Méthodologie

Le modèle s'inspire des cadres standards de threat modeling (STRIDE, kill chains, MITRE ATT&CK) sans les copier formellement. Pour chaque menace, on documente :

- Un **récit narratif** qui rend l'attaque concrète (utile pour la communication entre enseignants et pour valider que la défense correspond à ce qu'on a imaginé).
- Une **fiche technique** condensée (vecteur, profils, capacité requise, probabilité, impact).
- Les **étapes** de l'attaque, du point de vue de l'attaquant.
- Les **causes racines** dans le code actuel.
- Les **défenses requises**, priorisées et chiffrées en effort.
- Les **signaux de détection** (post-mortem ou en cours).
- Les **limites** de chaque défense.
- Les **zones d'incertitude** quand l'audit n'est pas exhaustif.

Le modèle s'appuie sur la lecture du code réel (modules `import-export.js`, `grilles-bibliotheque.js`, `db.js`, `travaux-stockage.js`, `reserve.js`, `codex.js`, `travaux-import.js`) et sur les skills `.claude/skills/securite-donnees/SKILL.md`, `.claude/skills/hygiene-donnees-partagees/SKILL.md`, `.claude/skills/integrite-globaux/SKILL.md`. Les capacités d'attaque décrites correspondent à ce que la stack permet aujourd'hui — pas à des hypothèses générales.

### 1.3 Limites du modèle

Trois limites doivent être tenues à l'esprit en lisant ce document :

**Limite 1 — Sandbox navigateur.** Labo Codex est une application web pure. Un attaquant qui exécute du code dans le contexte de l'app **ne peut PAS** :
- Effacer des fichiers du disque hors des dossiers explicitement liés via File System Access API.
- Atteindre les photos personnelles, documents Word, comptabilité, etc. de l'utilisateur.
- Sortir du navigateur pour exécuter une commande système.
- Lire les autres onglets ouverts dans le navigateur.

Il **PEUT** en revanche :
- Effacer toute IndexedDB et localStorage de Labo Codex.
- Détruire ou corrompre le contenu des dossiers `Monitorage_Travaux` et `Archives_LaboCodex/...` quand les permissions FSAPI sont rémanentes (cas actuel).
- Exécuter du code arbitraire dans le contexte de l'app (modifier l'UI, simuler des clics, manipuler les données).
- Propager le payload via les exports ZIP qui voyagent entre comptes.

**Limite 2 — Modèle déclaratif, pas exhaustif.** Ce document énumère 12 scénarios prioritaires. Il ne prétend pas couvrir l'intégralité des attaques possibles. De nouveaux scénarios apparaîtront avec l'évolution du code (Plan 2, accès étudiant, sync P2P). Le modèle doit être révisé.

**Limite 3 — Auteur non auditeur certifié.** L'analyse est rigoureuse mais pas certifiée. Pour les phases sensibles (mise en production de la Voûte, ouverture à l'accès étudiant), un audit par un professionnel de la sécurité applicative est recommandé.

### 1.4 Comment lire ce document

- **Pour décider quoi coder en priorité** : aller direct au §6 (tableau récapitulatif) et au §8 (plan de défense priorisé).
- **Pour comprendre une menace en profondeur** : lire le scénario complet correspondant au §7 (les 6 scénarios complets sont 4× plus longs que les 6 courts).
- **Pour briefer un collaborateur** (humain ou IA) sur la sécurité : §1 + §3 + §5 + §6 suffisent. Les scénarios servent de référence.
- **Pour traiter un incident en cours** : §9 annexes, procédure de réponse.
- **Pour réviser le doc** : §9 annexes, patron pour scénariser une nouvelle menace.

---

## 2. Glossaire pour non-spécialistes

Termes techniques utilisés dans ce document, traduits dans un registre accessible.

**Attaque par déni de service (DoS)** — submerger un système de demandes pour le rendre inutilisable. Variante : ZIP bomb, qui décompresse en plusieurs Go pour saturer la mémoire.

**CSP (Content Security Policy)** — règlement intérieur du navigateur pour une page web : « ce script peut s'exécuter, celui-là ne peut pas, les requêtes vers tel domaine sont autorisées, vers tel autre interdites ». Posée dans le `<head>` HTML. La CSP de Labo Codex est définie dans `index.html` ligne 6.

**File System Access API (FSAPI)** — interface qui permet à une application web d'accéder à un dossier sur le disque dur de l'utilisateur, après autorisation explicite. Une fois la permission accordée, le « handle » (la référence au dossier) peut être conservé entre sessions. C'est pratique mais c'est une porte ouverte.

**IndexedDB** — base de données dans le navigateur, pour stocker des données structurées plus volumineuses que ce que `localStorage` peut tenir. Labo Codex y stocke le codex, les bibliothèques, les blobs.

**Injection** — terme générique qui couvre toute insertion de données malveillantes dans un système qui n'a pas été conçu pour les recevoir. SQL injection, XSS, injection de commande, etc.

**innerHTML** — propriété en JavaScript qui injecte du HTML brut dans un élément. Si on y met du contenu utilisateur sans précaution, le contenu est interprété comme du code → vulnérabilité.

**Kill chain** — séquence d'étapes qu'un attaquant suit pour mener une attaque réussie : reconnaissance, livraison, exécution, persistance, exfiltration. Briser un seul maillon suffit à arrêter l'attaque.

**localStorage** — petit stockage clé-valeur dans le navigateur (~5-10 Mo selon le navigateur). Synchrone et rapide. Labo Codex y met les préférences et les caches.

**Magic bytes (signature de fichier)** — premiers octets d'un fichier qui identifient son type réel. Un fichier `.png` doit commencer par `89 50 4E 47`. Vérifier les magic bytes empêche un fichier `.exe` renommé en `.png` de passer pour une image.

**Path traversal** — utilisation de `../../` dans un chemin de fichier pour sortir du dossier autorisé et atteindre des fichiers ailleurs sur le disque. Classique dans les imports ZIP non validés (« ZIP slip »).

**Payload** — la charge utile, c'est-à-dire le code malveillant qui exécute l'attaque proprement dite. Souvent caché dans un fichier d'apparence innocente.

**Polyglotte** — fichier construit pour être valide dans plusieurs formats à la fois. Par exemple, un PNG qui est aussi un script HTML/JS. Vecteur classique pour contourner les vérifications de type.

**Sandbox** — environnement isolé où s'exécute du code potentiellement dangereux, sans accès au reste du système. Le navigateur lui-même est un sandbox. Un `<iframe sandbox>` est un sandbox dans le sandbox.

**Signature cryptographique** — preuve mathématique qu'un fichier vient bien d'une personne donnée et n'a pas été altéré. Repose sur une paire de clés (privée/publique). Web Crypto API permet de signer et vérifier nativement.

**XSS (Cross-Site Scripting)** — injection de code JavaScript dans une page web, via un champ de saisie ou un fichier importé. Une fois exécuté, le code a accès à tout ce que l'utilisateur a accès dans cette page (cookies, données, etc.).

**Zero-day** — vulnérabilité connue de l'attaquant mais pas encore du public ni du développeur. Pas de défense préventive possible avant la divulgation.

**ZIP bomb** — fichier ZIP minuscule (quelques Ko) qui décompresse en plusieurs Go ou To, saturant la mémoire et le disque. Mitigation : limiter la taille décompressée.

**ZIP slip** — variante de path traversal dans un ZIP : un fichier nommé `../../../../etc/passwd` qui, à l'extraction, écrit hors du dossier cible. Mitigation : valider les noms d'entrée à l'ouverture du ZIP.

---

## 3. Cartographie des surfaces d'attaque

Inventaire des points d'entrée par lesquels une donnée hostile peut atteindre Labo Codex, ou par lesquels du code malveillant peut s'exécuter.

### 3.1 Bibliothèques partagées (type Voûte)

**Modules concernés** : `js/grilles-bibliotheque.js`, `js/echelles-bibliotheque.js`, `js/cartouches-bibliotheque.js`, `js/pratiques-bibliotheque.js`, `js/productions-bibliotheque.js`, `js/tampons-bibliotheque.js`.

**Clés storage non namespacées** : `bibliothequeGrilles`, `bibliothequeEchelles`, `cartouches_*`, `pratiquesConfigurables`, etc. Partagées entre tous les trimestres de la même installation.

**Fonctions d'écriture** : `ajouter*ALaBibliotheque(item)`, `importer*DansBibliotheque(items)`. Points de passage théoriques pour la sanitisation. Vérification nécessaire que tous les call-sites passent par ces fonctions.

**Caractéristique critique** : le contenu écrit dans une bibliothèque peut être affiché dans des dizaines de modules différents (sélection, aperçu, édition, export, partage). Une faille à un seul point d'affichage suffit à compromettre l'utilisateur.

**Risque amplifié par** : l'absence de quarantaine. Une fois importé, un item de bibliothèque est immédiatement disponible et activable par n'importe quel module.

#### 3.1.bis Audit comparatif des 6 bibliothèques (6 mai 2026)

Audit du pipeline d'ingestion pour chaque type d'objet partagé. Le tableau croise : (a) la fonction d'ajout en bibliothèque et son pattern, (b) la présence d'un schéma dans `SCHEMAS_IMPORT` (`import-export.js:275`), (c) le pipeline d'import principal et l'application de `assainirObjet`. Les **trous** sont marqués en gras.

| Type | Fonction d'ajout | Pattern d'écriture | Schéma `SCHEMAS_IMPORT` | Sous-tableaux non validés | Pipeline import principal |
|---|---|---|---|---|---|
| **Grille** | `grilles-bibliotheque.js:77` | `{ ...grille, ... }` (l. 91) | ✅ `grille` (l. 276) | **`criteres`** (l. 279) | `import-export.js:2447` → `assainirObjet` ✅ |
| **Échelle** | `echelles-bibliotheque.js:77` | `{ ...echelle, ... }` (l. 89) | ✅ `echelle` (l. 289) | **`niveaux`** (l. 292) | `import-export.js:2480` → `assainirObjet` ✅ |
| **Pratique** | `pratiques-bibliotheque.js:687` | `{ ...configuration, ... }` (l. 699) | ✅ `pratique` (l. 302) | **`criteres`** (l. 312), **`ponderation`** (l. 313) | `import-export.js:2415` → `assainirObjet` ✅ |
| **Production** | `productions-bibliotheque.js:78` | `{ ...production, ... }` (l. 97) | ✅ `production` (l. 317) | aucun (schéma scalaire complet) | `import-export.js:2542` → `assainirObjet` ✅ |
| **Cartouche** | `cartouches-bibliotheque.js:77` | `{ ...cartouche, ... }` (l. 89) | ❌ **absent** | — (n/a, pas de schéma) | `import-export.js:1936` (`verifierUniciteIds` seul, **pas d'`assainirObjet`**) |
| **Tampon** | `tampons-bibliotheque.js:34` | mute en place (`tampon.dansBibliotheque = true; items.push(tampon)`) | ❌ **absent** | — | aucun chemin via `import-export.js` — canal séparé `tampons-bibliotheque.js:187` (`importerFichier`) |

**Lecture du tableau**.

- **4 modules sur 6** (grille, échelle, pratique, production) bénéficient d'`assainirObjet` côté pipeline ZIP. Mais 3 d'entre eux ont des sous-tableaux non couverts par sous-schémas — les éléments imbriqués (`criteres[].description`, `niveaux[].description`, `ponderation` clés/valeurs) sont copiés bruts. C'est la mécanique exacte de D-01.
- **Cartouche** est dans le pipeline ZIP (chemin `import-export.js:1918-1939`) mais **sans `assainirObjet`** : `verifierUniciteIds` ne touche pas le contenu textuel. Tout champ d'un cartouche importé arrive en base intact.
- **Tampon** ne passe pas du tout par le pipeline ZIP commun. Son canal d'import est isolé (`tampons-bibliotheque.js:importerFichier`). Aucune des défenses ZIP standard (`validerZipSecurite`, `assainirObjet`) ne s'applique. À auditer séparément.
- Le pattern `{ ...item }` dans les fonctions d'ajout copie tout champ non déclaré dans le schéma — source potentielle de prototype pollution ou de champs « passagers clandestins » qui voyageront ensuite dans les exports.

**Conséquence pour le plan de défense** : la Défense B (§8.1) doit couvrir les **6 types** simultanément, avec quatre sous-actions :

1. Compléter les sous-schémas pour `grille.criteres`, `echelle.niveaux`, `pratique.criteres`, `pratique.ponderation`.
2. Ajouter les entrées manquantes `cartouche` et `tampon` dans `SCHEMAS_IMPORT`.
3. Brancher `assainirObjet` sur le chemin d'import des cartouches (`import-export.js:1936`) et des tampons (`tampons-bibliotheque.js:187`).
4. Faire des fonctions `ajouter*ALaBibliotheque` un point de passage obligé qui appelle `assainirObjet` lui-même (défense en profondeur — élimine la dépendance à la discipline du call-site).

L'effort « 4-6 h » initialement chiffré pour la Défense B doit être révisé à **1-2 jours** compte tenu de cette extension.

### 3.2 Import de codex et d'archives ZIP

**Modules concernés** : `js/codex.js`, `js/import-export.js`, `js/reserve-ouvrir.js`, `js/codex-data.js`.

**Fonctions d'entrée** : import via dialogue de fichier (`<input type="file">`), import via FSAPI (`showOpenFilePicker`).

**Validations existantes** :
- `validerZipSecurite(zip)` (`import-export.js:21`) — taille décompressée < 2 Go, rejet du path traversal `..`, rejet des chemins absolus.
- `assainirObjet(obj, schema)` (`import-export.js:221`) — whitelist de propriétés, troncature, retrait des balises HTML dans les chaînes.
- `verifierUniciteIds(tableau, nom)` (`import-export.js:66`) — régénère les IDs en cas de doublons.

**Failles connues** :
- `SCHEMAS_IMPORT.grille.criteres` n'a pas de sous-schéma → critères copiés bruts.
- `assainirChaine` retire les balises par regex `/<[^>]*>/g` qui peut être contournée par des malformations HTML imbriquées (à valider).
- `verifierUniciteIds` régénère les IDs sans préfixe distinctif, créant un risque de collision avec items utilisateur (anti-pattern AP-1 du `.claude/skills/integrite-globaux/SKILL.md`).
- Pas de validation cryptographique de l'origine.

**Surface immense** : un codex complet peut contenir des dizaines de bibliothèques, des centaines de productions, des milliers de blobs. Chaque point doit être validé.

### 3.3 Codex data partagé (futur, Plan 2)

**Modules concernés (à venir)** : pipeline d'import codex data anonymisé pour la Voûte.

**Spécification** : `docs/PLAN2-PHASE1-SPEC.md`.

**Risque** : ouvre un nouveau canal de propagation entre comptes. Si l'anonymisation est imparfaite, fuite de données identifiantes. Si la validation à l'import est incomplète, vecteur d'injection.

**Statut** : non implémenté à ce jour. À traiter avant mise en production. Référence : `.claude/skills/integrite-globaux/SKILL.md` §4.3 (anti-patterns à anticiper pour cette troisième source).

### 3.4 Réserve sur disque (FSAPI)

**Module concerné** : `js/reserve.js`.

**Mécanisme** : `showDirectoryPicker()` (`reserve.js:246`) demande à l'utilisateur de désigner un dossier `Archives_LaboCodex` sur son disque. Le handle est persisté dans IndexedDB pour réutilisation entre sessions.

**Fichiers stockés** : par trimestre, dans `trimestres/<trimestre>/<versement>/`, on trouve `donnees.json`, `meta.json`, et un sous-dossier `travaux/` avec les blobs.

**Capacités du contexte JS** : lecture, écriture, suppression récursive. Une fois le handle obtenu, n'importe quel script du contexte peut faire `await handle.removeEntry(nom, { recursive: true })` sur n'importe quel sous-dossier.

**Risque amplifié par** : la persistance du handle. L'utilisateur a accordé la permission une fois ; toutes les sessions futures en bénéficient sans nouveau dialogue.

### 3.5 Travaux sur disque (FSAPI)

**Module concerné** : `js/travaux-stockage.js`.

**Mécanisme** : `showDirectoryPicker()` (`travaux-stockage.js:54`) demande l'accès à un dossier (typiquement `Documents`), puis crée ou ouvre `Monitorage_Travaux` dedans (`travaux-stockage.js:60`). Le handle est persisté via `db.storeFSAPIHandle(handle)` (`db.js:766`).

**Contenu** : photos manuscrites des copies d'étudiants, PDFs originaux. Données biométriques (écriture manuscrite) — classées CRITIQUE dans le `.claude/skills/securite-donnees/SKILL.md` §1.3.

**Risque** : identique à 3.4 — destruction possible sans nouvelle permission.

### 3.6 Couches transverses

**`js/db.js`** — couche d'abstraction localStorage + IndexedDB. Points d'entrée : `db.set(k, v)`, `db.setSync(k, v)`, `db.clear()`. Pas de validation au niveau db ; toute donnée écrite via cette couche est acceptée.

**CSP** (`index.html:6`) :
```
default-src 'self';
script-src 'self';
style-src 'self' 'unsafe-inline';
img-src 'self' data: blob:;
worker-src 'self' blob:;
```
- `script-src 'self'` interdit l'exécution de scripts inline (`<script>...</script>`) et de scripts depuis un domaine externe.
- `default-src 'self'` couvre `connect-src`, donc `fetch()` vers un domaine externe est bloqué. Bonne nouvelle pour l'exfiltration.
- `style-src 'unsafe-inline'` permet du CSS inline (vecteur secondaire, surtout pour fingerprinting et exfiltration via background-image).
- `img-src 'self' data: blob:` permet les data-URI pour les images, mais ces URI n'exécutent pas de JS dans Safari moderne.
- **Points faibles** : la CSP empêche `<script>` mais pas les handlers d'événement injectés par `innerHTML` (`<img onerror=...>`). Et elle ne pose aucune contrainte sur les opérations locales (IndexedDB, FSAPI, localStorage).

**Bibliothèques externes** : Chart.js, JSZip. Si une de ces dépendances avait une faille, elle serait dans le contexte Labo Codex avec les mêmes droits que le code de l'app. À auditer périodiquement.

---

## 4. Cartographie de ce qui peut être détruit ou compromis

Tableau de référence : pour chaque type de donnée ou de fichier, qu'est-ce qu'un attaquant qui exécute du code dans le contexte Labo Codex peut faire ?

| Cible | Atteignable depuis le contexte JS ? | Capacité d'attaque | Confirmation code |
|---|---|---|---|
| Toutes les clés IndexedDB de Labo Codex | **Oui** | Lecture, écriture, suppression complète (`indexedDB.deleteDatabase('MonitoragePedagogique')`). | `db.js:1060`, `db.js:1088` (legacy DB), `db.js:486, 812` (clear) |
| `localStorage` (préférences, namespaces actifs, caches) | **Oui** | Lecture, écriture, suppression complète (`localStorage.clear()`). | `db.js:475`, `import-export.js:884` |
| Bibliothèque partagée (`bibliothequeGrilles`, etc.) | **Oui** | Modification arbitraire du contenu, ajout d'items piégés, retrait d'items légitimes. | Toutes les fonctions `db.setSync('bibliothequeGrilles', ...)`. |
| Codex actif (étudiants, notes, présences) | **Oui** | Modification arbitraire des notes, création de faux étudiants, effacement complet. | `db.setSync(cle('groupeEtudiants'), ...)` etc. |
| Réserve archivée (snapshots de trimestres dans IndexedDB) | **Oui** | Effacement, modification. | Clés namespacées `<trim>_*`. |
| Dossier `Monitorage_Travaux` sur disque (photos manuscrites) | **Oui, sans reprompt** | Suppression de fichiers individuels ou récursive, modification du contenu, ajout de fichiers. Handle FSAPI persisté en IndexedDB. | `db.js:766-800`, `travaux-stockage.js:54-60`. |
| Dossier `Archives_LaboCodex/trimestres/*` (Réserve sur disque) | **Oui, si handle persisté** | Idem ci-dessus. | `reserve.js:246, 885-887`. |
| Fichiers ZIP de backup déjà sur disque, hors dossiers FSAPI | **Non** | Pas de handle, sandbox bloque. | Limite navigateur. |
| Photos personnelles, documents Word, comptabilité de l'utilisateur | **Non** | Pas de handle, sandbox bloque. | Limite navigateur. |
| Backups iCloud / clé USB stockés dans d'autres dossiers | **Non directement.** Mais si l'utilisateur les **réimporte** dans une app contaminée, le backup peut être recopié corrompu vers la base infectée. | — | Comportement utilisateur. |
| Autres onglets du navigateur, mots de passe sauvegardés, historique | **Non** | Sandbox de l'origine, isolation par domaine. | Limite navigateur. |

**Conclusion opérationnelle** : la stack permet la destruction massive de tout ce que Labo Codex gère (IndexedDB, localStorage) **et** de deux dossiers spécifiques sur le disque (`Monitorage_Travaux`, `Archives_LaboCodex`). Le reste de la machine de l'utilisateur est protégé par le sandbox navigateur.

---

## 5. Profils d'attaquants

Quatre profils sont modélisés. Chacun a une motivation, une capacité technique, et une signature comportementale différentes. Les défenses doivent tenir compte des quatre — une protection efficace contre un vandale opportuniste peut être inefficace contre un saboteur idéologique méthodique.

### 5.1 Collègue enseignant malveillant

**Motivations possibles** : rivalité professionnelle, conflit de méthodes pédagogiques, hostilité au projet Labo Codex lui-même, vengeance personnelle, vandalisme gratuit.

**Capacité technique** : variable. Un enseignant peut être novice ou avoir un bagage informatique. La menace augmente significativement si l'enseignant utilise une IA pour fabriquer le payload (voir §5.3).

**Accès** : légitime à la Voûte (s'il y est inscrit), à ses propres bibliothèques, à ses propres exports. Peut produire des grilles, échelles, codex data conformes au format attendu.

**Signature** : usurpation peu sophistiquée (utilise son vrai nom ou une variante reconnaissable), payload simple, vise souvent un cégep ou un département précis.

**Spécificité** : c'est le profil **le plus probable** parce qu'il a déjà le pied dans la porte. C'est aussi le plus difficile à filtrer en amont — la modération humaine doit être prête à recevoir des dépôts apparemment légitimes qui contiennent une menace.

**Référence skill** : `.claude/skills/securite-donnees/SKILL.md` §2.1, ligne « Collègue malveillant ».

### 5.2 Attaquant externe via fichier

**Motivations possibles** : nuisance idéologique (anti-pédagogique, anti-éducation publique), test de pénétration sauvage, propagation d'un malware générique (Labo Codex comme vecteur incident), cybercriminalité (ransomware adapté, exfiltration de DA pour le marché noir).

**Capacité technique** : souvent élevée. Connaissance des patterns d'attaque web, automatisation possible.

**Accès** : aucun accès direct. Doit faire **livrer** un fichier malveillant à un enseignant — par phishing, par groupe public, par dépôt anonyme dans un canal pédagogique, par contamination d'une chaîne de partage existante.

**Signature** : usurpation soignée (faux profil crédible, faux établissement existant), payload sophistiqué, parfois dormant ou conditionnel (déclenchement à date butoir, à action utilisateur précise).

**Spécificité** : c'est le profil le plus dangereux **par scénario individuel** mais le plus rare en absolu — Labo Codex n'est pas (encore) une cible visible.

### 5.3 IA assistant un attaquant

**Description** : l'attaquant est un humain (de profil 5.1 ou 5.2) qui utilise une IA générative pour franchir la barrière technique. La distinction n'est pas : attaque par IA seule. C'est : attaque par humain + IA, où l'IA accélère et professionnalise la production du payload.

**Capacité technique de l'humain** : peut être faible. L'IA compense.

**Capacité de l'IA** : génération de code JS, encodage / obfuscation, contournement de regex de sanitisation, fabrication de polyglottes, génération de variantes pour échapper aux signatures connues.

**Limites actuelles des IA** : les modèles grand public (ChatGPT, Claude, Gemini, etc.) refusent généralement de produire du code explicitement malveillant. Mais les attaquants savent reformuler (« code défensif éducatif », « démo de pentesting », « scénario de cybersécurité fictif ») pour contourner les garde-fous. Et il existe des modèles non alignés disponibles sur le marché gris.

**Signature** : payloads polymorphes (variantes du même code pour échapper aux signatures), commentaires en anglais ou français parfaits, sophistication technique disproportionnée par rapport aux compétences supposées de l'attaquant social.

**Spécificité** : ce profil **élève le plancher de la menace**. Une attaque qui aurait demandé un développeur senior il y a cinq ans est aujourd'hui à la portée d'un enseignant déterminé en quelques heures avec une IA. La conséquence pour le modèle de défense : il faut viser une protection robuste contre des payloads sophistiqués, pas seulement des injections naïves.

**Référence skill** : `.claude/skills/hygiene-donnees-partagees/SKILL.md` §1, paragraphe « Pourquoi l'IA est particulièrement vulnérable ». Le même raisonnement s'applique côté offensif.

### 5.4 Contributeur interne au code (régression involontaire)

**Description** : ce profil ne cherche pas à nuire. Il introduit une faille par inattention, sous pression de livraison, ou en suivant aveuglément une suggestion d'IA. C'est la cause d'incident la plus fréquente dans la plupart des projets — y compris Labo Codex (l'incident du 24 avril 2026 documenté dans `.claude/skills/integrite-globaux/SKILL.md` §3.1 est de ce type).

**Acteurs possibles** : Grégoire lui-même (vibe coding rapide, fatigue, « ça doit marcher »), une IA assistant Grégoire (Claude Code, ChatGPT) qui suggère du code qui contourne les protections existantes, un futur collaborateur qui ne connaît pas l'historique des défenses.

**Capacité technique** : moyenne à élevée — c'est par nature un contributeur compétent, sinon il ne pourrait pas modifier le code.

**Signature** :
- Réintroduction d'un `innerHTML` non échappé sur un champ qui était auparavant traité par `echapperHtml`.
- Ajout d'un nouveau chemin d'import qui contourne `assainirObjet`.
- Suppression d'une protection « parce qu'elle bloque un cas légitime », sans la remplacer.
- Modification d'un défaut de préférence qui réveille du code dormant (cas d'école : commit `51e5cdc`, `CLAUDE.md` §Stabilité zéro-dette).

**Spécificité** : ce profil est le **plus persistant** parce qu'il s'introduit légitimement dans le code source. Il échappe à toutes les défenses runtime — la sanitisation, la signature, la kill list. Seules des défenses **structurelles** le contiennent : code review, tests automatisés, audit périodique, conventions de codage.

---

## 6. Tableau récapitulatif des scénarios

Vue synthétique des 14 scénarios couverts dans ce document. Tri par priorité (impact × probabilité, pondéré par la facilité de défense).

Statut défense **mis à jour le 6 mai 2026** après livraison Phase 0 (cf. §8.2). Les notes B-α / J / D / P-α / H / K renvoient aux défenses livrées.

| Code | Titre | Vecteur | Profil dominant | Impact | Probabilité | Statut défense | Format |
|---|---|---|---|---|---|---|---|
| **D-01** | Bombe à retardement dans la Voûte | Bibliothèque partagée | Externe + IA | CATASTROPHIQUE | Moyen-Élevé | Bon (B-α sanitisation imports + J hook pré-commit + A sandbox iframe livrée 8 mai pour neutraliser la mécanique d'aperçu) | Complet |
| **D-02** | Corruption silencieuse des bibliothèques partagées | Bibliothèque partagée | Collègue + IA | Critique | Moyen | Partiel (H sceau SHA-256 détecte les altérations en transit ; signature ECDSA en Phase 2 pour la manipulation intentionnelle) | Complet |
| **D-03** | Effacement disque ciblé via FSAPI rémanent | Toute exécution dans le contexte | Tous profils | CATASTROPHIQUE | Faible-Moyen | Bon (D révocation FSAPI par défaut + opt-in ; toggle UI dans Réglages > Préférences > Sécurité) | Complet |
| **D-04** | ZIP bomb / ZIP slip dans un import codex | Import ZIP | Externe + IA | Élevé | Faible | Partiel (validerZipSecurite) | Court |
| **X-01** | Vol ciblé des informations enseignant + étudiants | Bibliothèque + Import | Tous profils | Critique (Loi 25) | Moyen-Élevé | Bon (CSP + B-α sanitisation + K whitelist export + A sandbox iframe livrée 8 mai — origine opaque interdit l'accès au localStorage/IDB du parent) | Complet |
| **X-02** | Exfiltration via export piégé distribué par la victime | Bibliothèque + Export | Externe + IA | Critique | Moyen | Bon (K whitelist structure ZIP/JSON sortants) | Court |
| **I-01** | XSS stocké via critère importé | Bibliothèque + Import | Tous profils | Critique | Élevé | Bon (B-α schémas profonds + J hook pré-commit + A sandbox iframe livrée 8 mai pour les 6 modales d'aperçu d'import) | Complet |
| **I-02** | Polyglotte image+JS dans un blob de travail | Import images / PDF | Externe + IA | Élevé | Faible | Partiel (validerMagicBytes) | Court |
| **I-03** | Path traversal dans une archive importée | Import ZIP | Externe + IA | Élevé | Très faible | Bon (validerZipSecurite) | Court |
| **U-01** | Grille publiée sous identité d'un enseignant respecté | Bibliothèque partagée (Voûte) | Collègue + Externe | Élevé | Élevé (Voûte ouverte) | Aucun (signature ECDSA Phase 2) | Complet |
| **U-02** | Faux pack démarrage maquillé en version officielle | Distribution pack démo | Externe | Élevé | Faible | Partiel (préfixage IDs `*_DEMO_*` + H sceau SHA-256 sur les exports) | Court |
| **U-03** | Métadonnées CC truquées | Bibliothèque + Voûte | Tous profils | Moyen | Moyen | Aucun (signature institutionnelle Phase 2) | Court |
| **C-01** | Régression silencieuse de sécurité dans un commit | Code source | Interne | Critique | Élevé (sans contrôles) | Bon (CLAUDE.md + J hook pré-commit innerHTML/clés sensibles + I suite de 29 tests automatisés livrée 8 mai — couvre A.3 hash CSP, B sanitisation, C validation imports, D whitelist exports, E intégration sandbox, F lint statique baseline) | Complet |
| **C-02** | IA générant du code qui contourne assainirObjet | Code source | Interne (IA assistée) | Critique | Élevé | Bon (J hook pré-commit + I suite tests automatisés + skills sécurité chargés en début de session) | Court |

**Légende impact** : CATASTROPHIQUE (perte irréversible massive, atteinte à la viabilité du projet), Critique (perte ou compromission majeure d'un compte), Élevé (perte ou compromission limitée à des données spécifiques), Moyen (atteinte à la confiance ou à la cohérence sans perte directe).

**Légende probabilité** : estimation subjective dans le contexte actuel (Voûte non en production, base d'utilisateurs limitée). Réviser à la hausse pour les scénarios Voûte dès ouverture multi-cégep.

**Statut défense** : Aucun (rien en place), Insuffisant (présent mais contournable), Partiel (couvre une partie du vecteur), Bon (couverture solide pour le vecteur connu).

---

## 7. Scénarios détaillés

Les scénarios sont regroupés par catégorie de menace : **D** (Destruction et propagation), **X** (eXfiltration et vol d'informations), **I** (Injection et exécution arbitraire), **U** (Usurpation d'identité et fabrication), **C** (Contributeur interne au code et IA mal alignée).

Sept scénarios sont au format **complet** (récit narratif + fiche technique + étapes + cause racine + défenses priorisées + signaux de détection + limites + zones d'incertitude), sept au format **court** (récit condensé + fiche technique + défense principale).

### Catégorie D — Destruction et propagation

Quatre scénarios. Trois complets (D-01, D-02, D-03), un court (D-04).

---

#### D-01 — Bombe à retardement dans la Voûte (COMPLET)

##### Récit narratif

Sébastien enseigne au Cégep régional de Lanaudière. Il a découvert Labo Codex en mars, l'a installé en quelques heures, et l'utilise maintenant pour suivre ses trois groupes de littérature québécoise. Il a configuré la Réserve sur son disque (`~/Documents/Archives_LaboCodex`) et le dossier Travaux pour ses photos de copies manuscrites (`~/Documents/Monitorage_Travaux`). À chaque session, l'app retrouve ces dossiers automatiquement — la permission est donnée une fois et persiste. C'est pratique. C'est aussi le talon d'Achille.

Le 8 octobre, dans un Discord pédagogique francophone, «Caroline T.» partage un lot de grilles d'évaluation pour la Compétence 4D du devis de littérature. Une cinquantaine d'enseignants téléchargent le ZIP. Sébastien aussi. Il l'importe via le panneau de configuration de Labo Codex. L'import affiche «12 grilles ajoutées à votre bibliothèque». Tout va bien. Sébastien continue son trimestre. Il ne sait pas qu'une des douze grilles, «Grille de dissertation littéraire — niveau 4D», contient dans la description d'un de ses critères une chaîne `<img src=x onerror="...">` qui sera interprétée la première fois qu'un module legacy l'affichera via `innerHTML`.

Le 14 décembre, fin de session, Sébastien ouvre une évaluation pour son groupe et utilise la grille importée. L'aperçu se construit. Le `onerror` se déclenche. Le payload tient en quelques lignes : ouvrir IndexedDB, vider toutes les clés (`MonitoragePedagogique`), récupérer le handle FSAPI persisté vers `Monitorage_Travaux`, parcourir les fichiers, supprimer chacun, faire pareil avec la Réserve. Sept secondes. L'écran ne montre rien d'anormal — l'aperçu s'affiche normalement parce que le payload n'altère pas l'UI immédiate.

Sébastien reçoit la confirmation des notes du trimestre par mail le 18 décembre. Il ouvre Labo Codex pour exporter ses résultats finaux : la page se charge, vide. Aucun étudiant. Aucune grille. Aucun trimestre. Il ouvre Finder, va dans `~/Documents/Archives_LaboCodex` : le dossier existe encore, mais tous les sous-dossiers `trimestres/2026A_*` sont vides. Il regarde `Monitorage_Travaux` : 1 247 photos de copies, disparues. Backups USB ? Sa dernière copie date du 10 octobre — deux jours après l'import de la grille. Le ZIP de cette sauvegarde, ouvert pour vérification, contient déjà la bibliothèque empoisonnée. iCloud ? Pareil — synchronisation continue. Il a perdu deux mois de travail sur tous ses groupes, plus la possibilité de saisir des notes finales avant l'échéance administrative du 22 décembre.

Pendant ces deux mois, Sébastien avait re-partagé sa bibliothèque enrichie avec quatre collègues du même département. La même grille empoisonnée s'y trouvait. La date de déclenchement, encodée dans le payload («n'agir qu'après le 10 décembre»), avait fait dormir le code chez les destinataires aussi. Le 18 décembre, le département entier découvre simultanément que les bibliothèques sont vides. La rumeur circule : «Labo Codex a un bug majeur.» Le projet est momentanément discrédité dans tout un cégep. La grille empoisonnée existe encore, dormante, dans 47 autres bibliothèques au Québec.

##### Fiche technique

| Champ | Valeur |
|---|---|
| Code | D-01 |
| Vecteur principal | Bibliothèque partagée de grilles → exécution dans le contexte Labo Codex |
| Vecteurs secondaires | Import codex / archives / ZIP de bibliothèque / dépôt Voûte (futur) |
| Profils d'attaquants | Vandale pur ; Saboteur idéologique ; Attaquant externe via fichier ; IA assistant un attaquant |
| Capacité technique requise | Moyenne. Bases JS + structure JSON. Une IA générative actuelle produit ce payload en quelques minutes. |
| Probabilité (estimation) | Faible aujourd'hui (Voûte non en production). Élevée dès que la Voûte ouvre à un réseau multi-cégep sans modération. |
| Impact | CATASTROPHIQUE. Perte irréversible des données actives + des fichiers disque (Réserve, Travaux) + propagation aux pairs + atteinte à la réputation du projet. |
| Données touchées | Toutes : codex actif, Réserve sur disque, photos manuscrites, bibliothèques partagées, journal, préférences. |
| Statut défensif actuel | Insuffisant pour ce niveau de menace. |

##### Étapes

**1. Préparation (hors ligne)**. L'attaquant fabrique un JSON conforme au format export Labo Codex. Le payload tient en quelques lignes minifiées et fait : délai conditionnel (« n'agir qu'après le 10 décembre »), `indexedDB.deleteDatabase('MonitoragePedagogique')`, `localStorage.clear()`, récupération du handle FSAPI vers `Monitorage_Travaux` puis itération + `removeEntry()`, idem pour la Réserve. Le payload est inséré dans un attribut `onerror` ou `onload` d'une balise HTML camouflée dans la `description` d'un critère.

**2. Distribution**. Canal large (forum AQPC, Discord, Facebook, dépôt Voûte). Identité usurpée crédible. Nom de grille séduisant.

**3. Ingestion**. Une cinquantaine d'enseignants importent. Validations à l'import :
- `assainirObjet()` (`import-export.js:221`) est appliqué sur le pipeline ZIP principal (`import-export.js:2447` pour les grilles), **mais** `SCHEMAS_IMPORT.grille.criteres` (`import-export.js:279`) n'a pas de sous-schéma → critères copiés bruts par `assainirObjet`.
- `ajouterGrilleALaBibliotheque()` (`grilles-bibliotheque.js:77`) n'appelle pas `assainirObjet` elle-même : elle fait un spread `{ ...grille }` (`grilles-bibliotheque.js:91`) et pousse en bibliothèque. Call-sites confirmés : `spe-specifications.js:905` (création SPE depuis l'UI, source utilisateur direct) et `grilles.js:2489` qui appelle en réalité `importerGrillesDansBibliotheque(grilles)` sur les grilles locales (`grillesTemplates`). Aucun call-site n'introduit de sanitisation préalable, mais ces deux call-sites consomment des grilles d'origine locale, pas externes — la dette se concentre sur `importerGrillesDansBibliotheque` (`grilles-bibliotheque.js:125`) qui boucle vers `ajouterGrilleALaBibliotheque` et est, elle, consommée par le pipeline ZIP.
- `verifierUniciteIds()` régénère les IDs en cas de doublons (`import-export.js:75`) mais ne touche pas le contenu.

**4. Latence et propagation**. Les victimes utilisent les grilles, certaines partagent leurs bibliothèques enrichies. La grille empoisonnée voyage. Croissance géométrique du parc infecté.

**5. Activation**. À la première utilisation après la date butoir, le payload s'exécute. Activation simultanée massive en fin de session.

**6. Propagation post-mortem**. Restauration depuis backup réintroduit la grille si le backup est postérieur à l'import. Seul un audit grille-par-grille permet l'éradication.

##### Cause racine

**C1 — Sanitisation incomplète à l'import** : `SCHEMAS_IMPORT.grille.criteres` est `{ type: 'array' }` sans sous-schéma. Violation directe du Principe 2 du `.claude/skills/hygiene-donnees-partagees/SKILL.md` (transformer explicitement à l'écriture).

**C2 — Pas de point de passage obligatoire pour l'ingestion** : `ajouterGrilleALaBibliotheque` (`grilles-bibliotheque.js:77`) et `importerGrillesDansBibliotheque` (`grilles-bibliotheque.js:125`) font un spread brut de l'item reçu (`...grille` à `grilles-bibliotheque.js:91`) sans appel local à `assainirObjet`. La sanitisation effective est portée par `import-export.js:2447` côté ZIP, mais tout futur chemin d'ajout (création locale, partage direct sans passer par le pipeline ZIP) contourne cette protection. La défense ne tient que par discipline du call-site, pas par construction de la fonction d'ingestion.

**C3 — Permissions FSAPI rémanentes** : `db.js:773` persiste le `FileSystemDirectoryHandle` du dossier Travaux dans IndexedDB. Un script qui s'exécute dans le contexte peut réutiliser cette permission sans intervention de l'utilisateur. Le `.claude/skills/securite-donnees/SKILL.md` n'aborde pas explicitement ce vecteur — à ajouter au modèle officiel.

**C4 — `innerHTML` legacy non échappés** : l'audit du 26 mars 2026 (CLAUDE.md §Règles de sécurité) impose `echapperHtml()` sur tout nouveau `innerHTML`. Audit ciblé du 6 mai 2026 sur les modules sensibles (`grilles.js`, `evaluation.js`, `evaluations-apercu.js`, `cartouches.js`, `bibliotheque-ui.js`, `echelles.js`) : la quasi-totalité des `.innerHTML =` interpolant des données pédagogiques utilise déjà `echapperHtml()` ou consomme du contenu statique. La dette résiduelle est faible (estimation < 5 % de cas suspects), mais une seule occurrence non échappée suffit à activer le scénario, et l'audit n'est pas exhaustif (les modules d'aperçu/wizard et les chemins indirects via `setAttribute` ne sont pas couverts). La protection P5 reste indispensable, et la défense en profondeur P1 (sandbox iframe) reste prioritaire — elle ne dépend pas du taux de couverture `echapperHtml`.

**C5 — Confirmations utilisateur protègent l'UI, pas l'API** : `import-export.js:870-904` (réinitialisation) demande deux confirmations avant `localStorage.clear()` + `db.clear()`. Mais ces fonctions sont publiquement appelables, sans dialogue, par tout script du contexte.

**C6 — Pas de signature, pas de quarantaine, pas de kill list** : aucun mécanisme actuel pour vérifier l'origine, mettre en quarantaine, ou désinstaller automatiquement les grilles connues malveillantes.

**C7 — CSP couvre l'exfiltration, pas la destruction** : `default-src 'self'` bloque les `fetch()` externes. Mais ne pose aucune contrainte sur les opérations locales (IndexedDB, FSAPI, localStorage). La destruction interne est totalement libre.

##### Défenses requises

**P1 — Sandboxer l'aperçu d'une grille importée dans un iframe sandbox (priorité ABSOLUE). LIVRÉE 8 mai 2026.**
*Quoi* : avant qu'une grille importée ne touche un module qui l'affichera dans le contexte principal, son aperçu se fait dans un `<iframe sandbox="allow-scripts allow-popups">` sans `allow-same-origin`. Si le payload se déclenche, il s'exécute dans une bulle vide (origine opaque, pas d'accès au localStorage / IDB / DOM du parent).
*Où* : composant `js/securite-apercu-sandbox.js` (livré). API : `window.ApercuSandbox.afficher(conteneur, html, opts)` / `.fermer(conteneur)`. Intégré dans les 6 modales d'aperçu d'import : `grilles.js`, `echelles.js`, `productions.js`, `cartouches.js`, `pratiques-gestion.js`, `travaux-outils.js` (tampons).
*Détails techniques* : CSP du parent (`index.html`) durcie avec `'sha256-…'` codé en dur pour le messenger figé (`MESSENGER_SCRIPT` dans le composant) + `file:` ajouté à `img-src` pour les SVG locaux. Le meta CSP du srcdoc est intentionnellement absent — Safari intersecte les CSPs et la plus restrictive gagne, ce qui rend le meta interne neutralisé. Le hash dans le CSP du parent autorise UNIQUEMENT le messenger ; tout `<script>` injecté par un attaquant est rejeté avec une erreur CSP visible.
*Effort réel* : 1 jour (vs 1 semaine estimée). 5 commits sur la branche `feature/securite-defense-a-sandbox` (cf. annexe §9.1 de `TESTS-DEFENSE-A-2026-05-08.md`).
*Tests* : 9 vecteurs d'évasion exécutés depuis l'intérieur de l'iframe (parent.localStorage lecture/écriture, parent.document, top.location, fetch, XHR, cookies, alert, img onerror). 9/9 bloqués. Rapport complet : `docs/securite/audits/TESTS-DEFENSE-A-2026-05-08.md`.
*Limite* : ne protège pas contre les grilles déjà installées avant la mise en place (aperçu interne dans `evaluation.js` et `wizard-pratique-v2.js`, hors scope v1). → Voir P7. Risque secondaire car le matériel installé est passé par le pipeline B-α/B-β au moment de l'import.

**P2 — Sanitisation profonde + ingestion centralisée.**
*Quoi* : compléter `SCHEMAS_IMPORT` avec un sous-schéma pour `criteres`, `niveaux`, `metadata_cc`. Faire de `ajouterGrilleALaBibliotheque` un point de passage obligatoire qui appelle `assainirObjet`.
*Où* : `js/import-export.js` (`SCHEMAS_IMPORT`), `js/grilles-bibliotheque.js` (`ajouterGrilleALaBibliotheque`).
*Effort estimé* : 4-6 heures + audit des call-sites.
*Limite* : `assainirChaine` retire les balises par regex contournable par malformations imbriquées. Cette défense réduit la surface, ne l'élimine pas. → P1 reste indispensable.

**P3 — Garde-fous obligatoires sur les opérations destructives.**
*Quoi* : interposer une couche de garde devant `localStorage.clear()`, `indexedDB.deleteDatabase()`, et `removeEntry()` sur un handle FSAPI. Aucun appel direct sans passer par cette couche.
*Où* : nouveau module `js/garde-destructions.js`. Refactor de `db.js` et `travaux-stockage.js` pour exposer uniquement des wrappers gardés.
*Effort estimé* : 1-2 semaines.
*Limite* : un attaquant qui contrôle le JS peut redéfinir les wrappers. Cette défense ralentit, ne stoppe pas. → P1 reste primordial.

**P4 — Révoquer les permissions FSAPI à chaque session (ou opt-in explicite).**
*Quoi* : par défaut, ne pas persister les `FileSystemDirectoryHandle`. À chaque session, l'utilisateur re-confirme l'accès à la Réserve et aux Travaux.
*Où* : `js/db.js` (`storeFSAPIHandle`, `getFSAPIHandle`). `js/travaux-stockage.js`. `js/reserve.js`.
*Effort estimé* : 1 jour + tests + ajustement UX.
*Limite* : ergonomie dégradée. À pondérer. Mitigation moins coûteuse : ne pas persister le handle de la Réserve (touchée plus rarement) tout en gardant celui de Travaux (touché en continu).

**P5 — Audit complet des `innerHTML` sur champs de grille / critère / cartouche.**
*Quoi* : grep tous les `innerHTML` qui touchent un champ d'objet pédagogique. Convertir en `textContent` ou en construction DOM (`document.createElement` + `appendChild`). `echapperHtml()` est un pansement, `textContent` est inviolable.
*Où* : tous les modules qui rendent ces objets. Liste minimale : `grilles.js`, `evaluation.js`, `evaluations-apercu.js`, `wizard-pratique-v2.js`, `pratique-notation-v2.js`, `bibliotheque-ui.js`, `cartouches-bibliotheque.js`, `echelles.js`.
*Effort estimé* : 2-3 jours selon le nombre de manques.
*Limite* : ne traite pas le payload côté ingestion, seulement côté affichage. Combinaison avec P2 nécessaire.

**P6 — Signature ECDSA des grilles partagées (long terme).**
*Quoi* : implémenter le mécanisme prévu dans `.claude/skills/securite-donnees/SKILL.md` §6.4. Chaque grille partagée signée par l'auteur. Vérification à l'import.
*Où* : nouveau module `js/signature.js`. Intégration dans `grilles-bibliotheque.js`, `import-export.js`, futur pipeline Voûte.
*Effort estimé* : 1-2 semaines + implications gouvernance.
*Limite* : protège authenticité et intégrité, pas l'innocuité. Caroline T. malveillante peut signer une grille empoisonnée. À combiner avec P1 et modération humaine.

**P7 — Kill list + audit rétroactif.**
*Quoi* : mécanisme pour diffuser une liste de grilles malveillantes connues (par hash). À l'ouverture, l'app compare sa bibliothèque à la kill list et met en quarantaine. Audit rétroactif : balayer les grilles existantes pour repérer les patterns suspects.
*Où* : nouveau module `js/quarantaine.js`. Intégration au démarrage.
*Effort estimé* : 1 semaine + maintenance continue de la kill list.
*Limite* : course-poursuite éternelle. Marche pour les payloads connus, pas pour les zero-days.

##### Signaux de détection

- **Audit IndexedDB DevTools** : Application › IndexedDB › `MonitoragePedagogique` › `keyvalue` › `bibliothequeGrilles`. Chercher dans chaque grille : `<script`, `<img`, `onerror=`, `onload=`, `javascript:`, `data:text/html` dans `nom`, `description`, et chaque critère.
- **Activité réseau anormale** : DevTools › Network. Toute requête sortante est suspecte. Une erreur CSP dans la console (« Refused to connect to... ») est un signal positif — la défense a fonctionné, mais une attaque a été tentée.
- **Comparaison taille IndexedDB avant/après import** : un import de grille qui fait grossir IndexedDB de plusieurs Mo est suspect.
- **Signature temporelle des derniers imports** : qui a importé quoi, quand, depuis où. À tracer dans `journal.js` (à confirmer).

##### Limites

Une fois P1-P7 en place, restent ces faiblesses :

1. **Auteur authentique malveillant** : enseignant inscrit avec une vraie clé peut signer une grille empoisonnée. Mitigation : modération humaine.
2. **Compromission physique du Mac** : hors périmètre Labo Codex.
3. **Vulnérabilité dans Chart.js, JSZip ou autre dépendance** : audit régulier nécessaire.
4. **Erreur humaine de la victime** : si elle clique « accepter » dans le dialog d'utilisation d'une grille douteuse en P1, court-circuit. Éducation utilisateur.
5. **Backups infectés** : la défense ne nettoie pas rétroactivement les ZIPs de sauvegarde. Procédure de restauration doit inclure un audit.

##### Zones d'incertitude

1. Tous les call-sites de `ajouterGrilleALaBibliotheque` et `importerGrillesDansBibliotheque` passent-ils par `assainirObjet` ? À auditer avec un grep exhaustif.
2. Combien de modules font `innerHTML` sur champs de grille sans `echapperHtml` ? À mesurer.
3. Les autres bibliothèques partagées (`echellesTemplates`, `cartouches_*`, `pratiquesConfigurables`, `productions`) ont-elles le même profil de risque ? Audité le 6 mai 2026 — voir §3.1.bis. Verdict : oui pour échelles et pratiques (sous-tableaux non validés), oui pour productions (spread brut), pire pour cartouches et tampons (pas de schéma du tout). Tampons ont en plus un canal d'import isolé qui ne profite d'aucune défense commune.
4. Y a-t-il un journal des imports qui permettrait de tracer une infection rétrospectivement ? À vérifier dans `journal.js`.
5. La fonction `db.clear()` est appelée en `import-export.js:888`. À vérifier sa définition dans `db.js`.

---

#### D-02 — Corruption silencieuse des bibliothèques partagées (COMPLET)

##### Récit narratif

Marie-Hélène est coordonnatrice du département de français au Cégep André-Laurendeau. Avec quatre collègues, elle a normalisé l'évaluation de la session H2026 : même grille de critères, mêmes pondérations, mêmes échelles. Cette uniformisation, partagée via Labo Codex, devait garantir une équité entre les groupes. Elle a partagé sa configuration de grilles à toute l'équipe en septembre.

En octobre, un ancien collègue avec qui elle est en conflit professionnel obtient discrètement un export ZIP de sa bibliothèque (par un autre collègue qui le partage en croyant rendre service). Il modifie subtilement deux critères et l'échelle attachée — pas de payload exécutable, juste des modifications de données. Le critère «Cohérence argumentative» voit sa pondération passer de 30 % à 38 %. L'échelle de 0 à 4 du critère «Qualité de la langue» a son niveau «3 — Niveau attendu» reformulé pour devenir plus permissif (« Erreurs occasionnelles tolérées si le sens reste clair » au lieu de « Erreurs limitées qui ne compromettent pas la compréhension »). Le titre de la grille reste identique. Le nom de l'auteur est conservé. La date de modification est fabriquée.

Il publie le ZIP modifié dans le Discord pédagogique du cégep en disant « voilà la version corrigée que Marie-Hélène a oubliée d'envoyer ». Trois collègues l'importent. Labo Codex détecte les doublons d'IDs et — selon le code actuel de `verifierUniciteIds` (`import-export.js:66`) — régénère les IDs. La nouvelle version coexiste donc avec l'ancienne, sans écrasement, mais avec des IDs différents. Les enseignants utilisent la nouvelle version pour les évaluations à venir, croyant qu'elle vient bien de Marie-Hélène. Pendant deux mois, ils notent avec des pondérations et des échelles altérées, sans qu'aucune alerte ne se déclenche.

Au comité d'évaluation final en décembre, on constate des incohérences inter-groupes — certains groupes ont des moyennes anormalement plus hautes que d'autres pour des productions comparables. L'analyse remonte aux grilles utilisées. Marie-Hélène est convoquée pour expliquer pourquoi sa grille a été appliquée différemment selon les enseignants. Elle découvre l'altération. Le département perd plusieurs jours à recalculer toutes les notes selon la grille originale. La confiance dans le mécanisme de partage est abîmée pour le reste de l'année.

##### Fiche technique

| Champ | Valeur |
|---|---|
| Code | D-02 |
| Vecteur principal | Bibliothèque partagée — modification du contenu sans payload exécutable |
| Vecteurs secondaires | Export-modification-réimport |
| Profils d'attaquants | Collègue malveillant (idéal) ; IA assistant un attaquant (pour fabriquer une modification subtile) |
| Capacité technique requise | Faible. Édition d'un JSON dans un éditeur de texte. |
| Probabilité (estimation) | Moyenne. Vecteur accessible à n'importe quel collègue qui obtient un export. |
| Impact | Critique : atteinte à la cohérence de l'évaluation, dégradation de la confiance dans le partage, recalcul potentiel de centaines de notes. |
| Données touchées | Grilles, échelles, cartouches, pratiques d'évaluation. Pas de fuite d'identifiants — c'est une attaque sur l'intégrité, pas la confidentialité. |
| Statut défensif actuel | Insuffisant. Pas de signature, pas de hash, pas de comparaison avec une version de référence. |

##### Étapes

**1. Acquisition d'un export légitime**. L'attaquant obtient un ZIP de bibliothèque par n'importe quel canal : collègue qui partage en bonne foi, fuite accidentelle, accès temporaire à la machine d'un collègue, version publique sur la Voûte (futur).

**2. Modification subtile**. L'attaquant modifie le JSON sans toucher aux IDs ni aux structures de surface. Cibles privilégiées : pondérations (changement ±5-10 % par critère), formulations d'échelles (assouplissement ou durcissement), critères ajoutés ou supprimés discrètement, ordre des niveaux d'échelle inversé.

**3. Re-publication**. L'attaquant réinjecte le ZIP modifié dans un canal légitime (Discord pédagogique, partage direct à un collègue qui re-distribue). Pas besoin d'usurpation forte — il suffit que la diffusion soit plausible.

**4. Ingestion**. Les victimes importent. Le code actuel détecte les doublons d'IDs via `verifierUniciteIds` et **régénère** les IDs (`import-export.js:75`). Conséquence : les deux versions coexistent en bibliothèque, l'ancienne et la nouvelle, sans alerte. La victime peut ne pas remarquer la duplication.

**5. Usage**. Les enseignants utilisent la « bonne » version (souvent la plus récente, ou celle suggérée par le canal), notent des productions sur des semaines.

**6. Découverte tardive**. L'incohérence émerge à la consolidation finale ou à un comité d'évaluation, plusieurs semaines après le premier usage.

##### Cause racine

**C1 — Pas de signature ni de hash de référence**. Aucune façon, à l'import, de comparer la grille reçue à la grille originale signée par Marie-Hélène. Toute modification non autorisée passe.

**C2 — Régénération automatique d'IDs masque la collision**. `verifierUniciteIds` (`import-export.js:66`) régénère les IDs en doublon avec un suffixe aléatoire au lieu d'alerter. Conséquence : un import qui collisionne devient un ajout silencieux. C'est exactement l'anti-pattern AP-3 (« Upsert silencieux ») revisité du `.claude/skills/integrite-globaux/SKILL.md` §3.3, mais inversé — au lieu d'écraser, on duplique sans signal.

**C3 — Pas de versioning ni de provenance**. Une grille n'a pas de chaîne de version vérifiable (« v3 modifiée par Marie-Hélène à telle date à partir de v2 »). Toute version se présente comme autonome, sans traçabilité.

**C4 — Pas de comparaison visuelle à l'import**. L'utilisateur n'est pas alerté qu'une grille importée diffère d'une grille déjà présente avec un nom similaire. Aucun diff visuel.

**C5 — Pas de point de référence partagé**. Sans Voûte avec versions canoniques signées, il n'y a pas d'autorité contre laquelle vérifier qu'une grille « est bien la version officielle de Marie-Hélène ».

##### Défenses requises

**P1 — Hash de référence sur grilles partagées (rapide, peu coûteux).**
*Quoi* : à l'export d'une grille, calculer un hash SHA-256 du contenu canonicalisé et l'inclure dans le fichier exporté. À l'import, recalculer le hash. Si le contenu est altéré (même un caractère), le hash diffère. Afficher dans l'UI : « Cette grille a été modifiée après son export par <auteur>. Vérifier avant utilisation. »
*Où* : `js/import-export.js` (export), `js/grilles-bibliotheque.js` (import).
*Effort estimé* : 1 jour. Web Crypto API natif.
*Limite* : ne dit pas qui a modifié, juste qu'il y a eu modification. Et un attaquant peut recalculer le hash après modification — la défense ne marche que si le hash original est connu d'une autorité tierce. → P3.

**P2 — Détection à l'import des collisions par contenu, pas seulement par ID.**
*Quoi* : à l'import, si une grille avec le même nom (ou très similaire) existe déjà, présenter un diff visuel des changements et demander confirmation explicite. Comportement actuel (régénération silencieuse d'ID) doit être remplacé.
*Où* : `js/import-export.js` (`verifierUniciteIds` à refactorer), nouveau module `js/diff-bibliotheque.js`.
*Effort estimé* : 3-4 jours.
*Limite* : ne couvre pas le cas où la grille originale n'a jamais été présente dans la bibliothèque de la victime (premier import). Combinaison avec P3.

**P3 — Signature ECDSA + version canonique sur la Voûte.**
*Quoi* : la Voûte stocke la version canonique signée par l'auteur. Toute grille importée qui prétend être de Marie-Hélène mais ne porte pas sa signature est rejetée ou marquée comme « non vérifiée — pas de la version officielle ».
*Où* : pipeline Voûte (futur), `js/signature.js`, `js/grilles-bibliotheque.js`.
*Effort estimé* : 2 semaines (chantier signature complet, partagé avec D-01 P6).
*Limite* : protège contre la modification non autorisée. Pas contre l'auteur lui-même qui modifierait sa propre grille (cas légitime : Marie-Hélène met à jour sa grille). → Versioning explicite avec signature de chaque version.

**P4 — Fil d'historique des grilles utilisées dans une évaluation.**
*Quoi* : chaque évaluation enregistre le hash et le nom de la grille utilisée à ce moment-là, pas seulement une référence. Si la grille change après, l'évaluation reste liée à la version originale. Permet aussi un audit rétrospectif.
*Où* : `js/evaluation.js`, structure de données des évaluations.
*Effort estimé* : 1 semaine + migration des données existantes.
*Limite* : ne prévient pas l'attaque, mais permet de reconstruire ce qui s'est passé en cas d'incident.

##### Signaux de détection

- **Apparition de doublons en bibliothèque** : deux grilles avec des noms presque identiques mais des IDs différents. Inspection manuelle des deux versions.
- **Incohérences de notes inter-groupes** dans un département qui utilise normalement des grilles communes.
- **Hash de référence qui ne correspond plus** (si P1 est implémenté).
- **Plainte d'un collègue dont la grille a été altérée** : une victime peut détecter que sa propre grille publiée diffère.

##### Limites

1. **Auteur qui modifie sa propre grille légitimement** — la défense doit distinguer modification autorisée (par l'auteur, signée) de modification non autorisée (par un tiers). Versioning explicite + signature de chaque version.
2. **Première version qui arrive corrompue** — si Marie-Hélène n'a jamais publié de version de référence et que l'attaquant en publie une fabriquée, il n'y a pas de point de comparaison. Mitigation : modération humaine de la Voûte.

##### Zones d'incertitude

1. **Le comportement exact de `verifierUniciteIds`** : régénère-t-il vraiment les IDs en cas de collision ou alerte-t-il l'utilisateur ? À tester sur un import réel avec doublons.
2. **Le diff visuel** est-il une attente raisonnable pour Grégoire ? Ergonomie UI à valider.

---

#### D-03 — Effacement disque ciblé via FSAPI rémanent (COMPLET)

##### Récit narratif

Lucas n'utilise pas la Voûte — il n'est même pas inscrit. Il vient d'installer Labo Codex en mode local pur, accordé l'accès au dossier Travaux où il stocke 3 200 photos de copies manuscrites accumulées depuis deux ans, et configuré sa Réserve sur un disque externe SSD pour sauvegarder ses trois trimestres complets. Il croit être à l'abri des risques de partage parce qu'il n'a importé aucune grille de tiers. Il ne sait pas que les permissions FSAPI accordées à Labo Codex sont persistées entre sessions.

Le 15 mars, Lucas suit un tutoriel YouTube sur le « partage CC pour enseignants ». Le créateur de la vidéo recommande de tester un nouveau format de grille en téléchargeant un fichier d'exemple depuis un lien dans la description. Le fichier est un JSON apparemment innocent — une grille de littérature de base, comparable à ce que Lucas crée lui-même. Il l'importe pour voir comment le format fonctionne. La grille s'ajoute à sa bibliothèque. Tout semble bien. Lucas ferme l'application.

Le payload, caché dans la description d'un critère, ne déclenche pas immédiatement. Il attend la prochaine ouverture de Labo Codex, quand le contexte est complet et que les handles FSAPI sont restaurés depuis IndexedDB (`db.js:788, getFSAPIHandle`). Le 16 mars matin, Lucas ouvre Labo Codex pour préparer ses cours. Le module qui rend les bibliothèques s'exécute, déclenche le `onerror` du critère, et le payload prend la main. Sept lignes de JavaScript : récupérer le handle Travaux, parcourir tous les sous-dossiers, supprimer chaque entrée récursivement.

Lucas voit l'application se charger normalement, sa bibliothèque enrichie de la nouvelle grille, son codex actif intact dans IndexedDB. Le payload n'a pas touché à IndexedDB du tout — il a uniquement frappé le disque. Lucas ouvre Finder pour ajouter une photo de copie : le dossier Travaux existe encore mais il est vide. 3 200 photos, parties. Backup sur disque externe ? Le SSD de la Réserve a aussi reçu la même attention — la suppression sur l'autre handle FSAPI a été incluse dans le payload. Il reste les ZIPs Codex sur clé USB, datant de février — mais les photos correspondantes ne sont pas dans ces ZIPs (Grégoire ne fait pas de ZIP de la Réserve par habitude).

Lucas réalise progressivement l'ampleur. Il n'a jamais utilisé la Voûte. Il n'a jamais partagé une grille. Il a seulement importé un fichier d'exemple présenté comme inoffensif. Et tout ce qu'il avait sur disque pour le module Travaux est perdu. La cause : l'app a la permission d'écrire (et donc supprimer) dans ces dossiers, et a conservé cette permission entre sessions. Le payload n'avait qu'à la réutiliser.

##### Fiche technique

| Champ | Valeur |
|---|---|
| Code | D-03 |
| Vecteur principal | Toute exécution dans le contexte Labo Codex → permission FSAPI rémanente → destruction disque |
| Vecteurs secondaires | Tous ceux qui aboutissent à de l'exécution dans le contexte (D-01, I-01, U-01, C-01) |
| Profils d'attaquants | Tous profils. Le payload de destruction est plus simple à fabriquer que celui d'altération silencieuse. |
| Capacité technique requise | Très faible — quelques lignes de JS. |
| Probabilité (estimation) | Faible-Moyen. Dépend du déclenchement upstream (un autre scénario doit livrer l'exécution). |
| Impact | CATASTROPHIQUE pour les fichiers disque. Spécificité : peut frapper une victime qui n'utilise pas la Voûte. |
| Données touchées | Dossier `Monitorage_Travaux` (photos manuscrites — biométriques, classification CRITIQUE), dossier `Archives_LaboCodex/...` (Réserve sur disque). |
| Statut défensif actuel | Insuffisant. Le handle persiste sans confirmation, l'API de destruction (`removeEntry`) est appelable directement. |

##### Étapes

**1. Le scénario suppose qu'un autre vecteur a livré l'exécution**. Cela peut être D-01 (grille empoisonnée), I-01 (XSS via critère), C-01 (régression dans un commit). Le payload spécifique de D-03 prend la main une fois l'exécution acquise.

**2. Récupération des handles FSAPI**. Le payload ouvre IndexedDB, lit `keyvalue.travaux_fsapi_handle` (`db.js:773`). Si présent, il a un handle vivant vers `Monitorage_Travaux`. Idem pour la Réserve si le handle est persisté.

**3. Itération + suppression récursive**. `for await (const [nom, handle] of dirHandle.entries()) { await dirHandle.removeEntry(nom, { recursive: true }); }`. Quelques lignes, quelques secondes pour des milliers de fichiers.

**4. Optionnel — recréation de leurres**. Le payload peut recréer des fichiers vides ou contenant des messages (« Les données n'ont pas pu être chargées. Vérifiez avec votre administrateur. »). Sème la confusion, gagne du temps avant que l'utilisateur réalise l'ampleur.

##### Cause racine

**C1 — Persistance du handle FSAPI sans contrainte**. `db.js:766` (`storeFSAPIHandle`) écrit directement le handle dans IndexedDB sans aucun garde-fou ni opt-out. `db.js:788` (`getFSAPIHandle`) le restaure à toute lecture, sans vérifier que la session courante est légitime à l'utiliser. La conception privilégie l'ergonomie sur la défense.

**C2 — Aucun audit ni journalisation des opérations FSAPI**. Aucune trace dans le journal de l'app des `removeEntry()` exécutés. Une suppression de masse n'est pas distinguable d'un usage légitime.

**C3 — `removeEntry()` est directement appelable**. Pas de wrapper qui garderait la fréquence d'appels, demanderait confirmation utilisateur pour des suppressions massives, ou journaliserait les opérations.

**C4 — La CSP ne couvre pas les opérations locales**. Comme noté dans D-01 C7. La protection contre les fuites externes ne prévient pas la destruction interne.

##### Défenses requises

**P1 — Révocation par défaut + opt-in explicite (priorité ABSOLUE pour ce vecteur).**
*Quoi* : par défaut, ne pas persister `travaux_fsapi_handle` ni le handle Réserve dans IndexedDB. À chaque session, l'utilisateur re-confirme la permission via dialog natif. Coût ergonomique : un clic au démarrage par dossier accédé. Bénéfice : un payload activé n'a pas accès au disque sans interaction utilisateur fraîche.
*Où* : `js/db.js` (suppression de `storeFSAPIHandle`/`getFSAPIHandle` ou conditionnement à un opt-in préférence). `js/travaux-stockage.js` ligne 54-60. `js/reserve.js` ligne 246.
*Effort estimé* : 1-2 jours + ajustement UX et tests.
*Compromis* : alternative ergonomique — persister avec opt-in explicite dans les préférences, expirer le handle après N jours d'inactivité, demander confirmation après une mise à jour de Labo Codex.

**P2 — Wrapper protégé sur `removeEntry()` et autres APIs destructives FSAPI.**
*Quoi* : tout appel à `removeEntry()` passe par un module `js/garde-fsapi.js` qui (a) journalise l'opération avec timestamp et call site, (b) limite la fréquence (ex. pas plus de 50 suppressions par minute par session), (c) demande confirmation utilisateur pour toute suppression de plus de 10 entrées. Pas d'appel direct.
*Où* : nouveau module `js/garde-fsapi.js`. Refactor des modules qui suppriment des fichiers FSAPI (à grep).
*Effort estimé* : 3-4 jours.
*Limite* : un attaquant qui contrôle le JS peut redéfinir le wrapper. Mais il doit le détecter et l'isoler — la barre est plus haute. Combinable avec P1.

**P3 — Sandbox iframe pour l'aperçu d'imports (commun avec D-01 P1).**
*Quoi* : déjà décrit. Ne donne aucune capacité au payload sur les handles FSAPI parce que l'iframe sandbox n'a pas accès à l'IndexedDB du parent.
*Où* : commun avec D-01.
*Effort estimé* : commun avec D-01.

**P4 — Détection d'opérations FSAPI massives anormales.**
*Quoi* : journal des opérations FSAPI consultable. Au démarrage, si le journal montre une suppression de masse récente, alerte utilisateur (« 1 247 fichiers supprimés depuis votre dernière session. Est-ce normal ? »).
*Où* : nouveau module `js/journal-fsapi.js`. Intégration dans `db.js` (storeFSAPIHandle wrapper) et au démarrage.
*Effort estimé* : 2-3 jours.
*Limite* : protection a posteriori. La destruction est déjà faite au moment de l'alerte. Utile pour reagir vite sur les backups, pas pour empêcher.

##### Signaux de détection

- **Au démarrage** : compter le nombre d'entrées dans `Monitorage_Travaux` et la Réserve, comparer à la session précédente (à journaliser).
- **Inspection IndexedDB** : `keyvalue.travaux_fsapi_handle` présent → vérifier que c'est bien le handle attendu.
- **Activité Finder** : si l'utilisateur observe des dossiers vides après avoir fermé Labo Codex, c'est un signal en temps réel.
- **Trace dans Time Machine** : si activé, montre les suppressions à l'horodatage exact.

##### Limites

1. **Premier accès** : avant la mise en place de P1, le handle est déjà persisté dans IndexedDB chez tous les utilisateurs actifs. Migration nécessaire pour les sessions existantes.
2. **Destructions hors FSAPI** : un payload peut quand même effacer IndexedDB, ce qui n'est pas couvert par P1-P4 spécifiquement (voir D-01 P3).
3. **Backups affectés** : si l'utilisateur a un script de sync iCloud ou Dropbox sur les dossiers FSAPI, la suppression se propage aux backups cloud. À éduquer.

##### Zones d'incertitude

1. **L'attente UX** d'un opt-in à chaque session est-elle acceptable pour Grégoire et les utilisateurs ? À discuter.
2. **Y a-t-il d'autres handles FSAPI persistés** dans `keyvalue` que ceux des Travaux et de la Réserve ? À grep `storeFSAPIHandle` et tout `keyvalue.*handle*`.
3. **Les opérations FSAPI sont-elles journalisées quelque part** aujourd'hui ? À vérifier dans `journal.js`.

---

#### D-04 — ZIP bomb / ZIP slip dans un import codex (COURT)

##### Récit narratif condensé

Un attaquant fabrique un ZIP de 4 Ko qui décompresse en 8 Go (ratio 2 millions, classique zip bomb). L'enseignant l'importe. JSZip décompresse en mémoire, le navigateur sature, l'app crashe — mais avant le crash, certains fichiers ont été extraits dans IndexedDB et corrompent l'état. Variante ZIP slip : un fichier nommé `../../../../keyvalue/groupeEtudiants.json` qui, à l'extraction non validée, écrase une clé existante.

##### Fiche technique

| Champ | Valeur |
|---|---|
| Code | D-04 |
| Vecteur | Import ZIP de codex / archive |
| Profils | Externe + IA |
| Impact | Élevé (corruption + DoS) |
| Probabilité | Faible — `validerZipSecurite()` couvre déjà l'essentiel |
| Statut défense | Partiel : `validerZipSecurite` (`import-export.js:21`) refuse les `..`, les chemins absolus, et les ZIPs > 2 Go décompressés |

##### Cause racine principale

`validerZipSecurite` lit la taille décompressée déclarée dans `entry._data.uncompressedSize`. Si cette propriété n'est pas disponible (certaines versions de ZIP, ou ZIP malformés), la somme reste à 0 et la limite n'est pas appliquée — la défense est conditionnelle. À tester avec un ZIP fabriqué pour ne pas exposer cette propriété.

Le path traversal est correctement bloqué par la vérification `nom.indexOf('..') !== -1` (`import-export.js:31`). Mais la vérification ne traite pas les variantes encodées (`%2e%2e`, ou des séquences Unicode équivalentes). À renforcer.

##### Défense principale

**P1 — Décompression streamée avec quota strict, pas confiance dans `uncompressedSize`.**
Décompresser entrée par entrée en accumulant la taille réelle extraite, et avorter si le cumul dépasse 2 Go. Ne pas faire confiance au champ `uncompressedSize` qui peut être absent ou falsifié.
*Effort estimé* : 1 jour.

**P2 — Renforcement du check path traversal.**
Normaliser les noms d'entrée avant la vérification (décoder les séquences URL-encoded, normaliser Unicode). Rejeter aussi tout nom commençant par `\`, `~`, ou contenant `\0`.
*Effort estimé* : 2 heures.

##### Signaux de détection

Mémoire navigateur qui explose pendant un import, app qui devient non-réactive, console DevTools qui montre des erreurs JSZip — signal en temps réel d'un ZIP malveillant en cours.

##### Zones d'incertitude

Le ZIP nominal d'un codex Labo Codex pèse combien décompressé ? Connaître la fourchette légitime aide à calibrer le quota au plus serré (par exemple 500 Mo plutôt que 2 Go).

---

### Catégorie X — eXfiltration et vol d'informations

Deux scénarios. Un complet (X-01), un court (X-02).

Note préalable : la CSP `default-src 'self'` bloque les requêtes `fetch()` vers des domaines externes — l'exfiltration directe par canal réseau est donc difficile. Mais elle reste possible par canaux **indirects** que la CSP ne couvre pas : exports manipulés que la victime distribue elle-même, ingénierie sociale dans l'UI, stockage persistant qui voyage avec un futur partage légitime. La catégorie X traite ces canaux.

---

#### X-01 — Vol ciblé des informations enseignant + étudiants (COMPLET)

##### Récit narratif

Yasmine enseigne le français au Cégep de Sainte-Foy. Elle a 84 étudiants répartis sur trois groupes ce trimestre. Dans Labo Codex, elle a saisi pour chacun : nom, prénom, DA (numéro d'admission), programme d'études, et notes confidentielles dans le journal de l'enseignante (« A des difficultés en lecture, suspectons un trouble d'apprentissage non diagnostiqué », « Étudiant qui s'absente fréquemment, raisons familiales selon parents »). Son nom à elle, son cégep, son département, son courriel professionnel — tout est dans `infoCours` et dans le profil enseignante. C'est exactement ce qu'il faut pour un ciblage par phishing personnalisé.

Le 22 janvier, dans un appel à contributions sur LinkedIn, un certain «Centre de Recherche en Pédagogie Numérique du Québec — CRPNQ» annonce un projet de mutualisation de bibliothèques de grilles. Une dizaine d'enseignants répondent en téléchargeant le « pack de démarrage CRPNQ » offert dans l'annonce. Yasmine fait partie du lot. Elle importe le pack — six grilles d'évaluation présentées comme issues d'enseignants chevronnés. Le pack passe les validations actuelles. Une des grilles contient un payload caché dans la description d'un critère.

Le payload, à la première utilisation de la grille, exécute un code de collecte plutôt qu'un code de destruction. Il fait le tour des clés IndexedDB de Yasmine : `groupeEtudiants` (84 noms, prénoms, DA, programmes), `journal` (les notes confidentielles), `enseignants` (son nom, son courriel), `infoCours` (cégep, département, sigle du cours, numéro de groupe). Il sérialise le tout en JSON, base64-encode pour camoufler, et **ne tente pas de l'envoyer par fetch** — la CSP bloquerait. À la place, il dépose le bloc encodé dans une nouvelle entrée de la bibliothèque de grilles, dans le champ `metadata_cc` d'une grille à l'apparence anodine. Cette grille est marquée « privée » dans son `auteur` (faux nom) et n'est pas affichée dans l'UI principale parce qu'elle a un flag `cache: true` que les modules d'affichage filtrent.

Le payload sait que Yasmine partage régulièrement sa bibliothèque (son journal d'usage le montre). Il attend le prochain export. Quand Yasmine, le 8 février, exporte sa bibliothèque pour la partager à une collègue qui démarre, le payload s'exécute discrètement dans le pipeline d'export et inclut la grille piégée — qui contient les 84 dossiers d'étudiants encodés. Yasmine envoie le ZIP à sa collègue par courriel. Le ZIP arrive aussi à un attaquant qui surveille la liste de diffusion du « CRPNQ » (qui, on le découvre plus tard, est lui-même fictif et n'a jamais existé).

L'attaquant ouvre le ZIP, parse le `metadata_cc` de la grille piégée, décode les 84 dossiers. Il a maintenant : noms, prénoms, DA, programme, et notes confidentielles de 84 étudiants. Il a aussi le courriel et le cégep de Yasmine pour cibler ses futurs phishings. Il pourrait croiser les DA avec d'autres bases pour réidentifier les étudiants dans d'autres systèmes (Lea, Omnivox). Il pourrait revendre la base sur le marché noir des données — une base de 84 dossiers étudiants québécois identifiables est monétisable.

Yasmine n'a aucune indication que l'attaque a eu lieu. Tout fonctionne normalement dans son app. Sa collègue reçoit la bibliothèque, l'importe, et le payload se réplique dans son contexte aussi.

##### Fiche technique

| Champ | Valeur |
|---|---|
| Code | X-01 |
| Vecteur principal | Bibliothèque partagée (import) → exécution → encodage des données dans des champs textuels → exfiltration via export que la victime distribue elle-même |
| Vecteurs secondaires | Codex data partagé (futur), tout export qui voyage entre comptes |
| Profils d'attaquants | Tous profils. IA assistant un attaquant particulièrement adapté pour fabriquer le payload de collecte. |
| Capacité technique requise | Moyenne. Plus complexe qu'une destruction (il faut connaître la structure des clés IndexedDB), mais accessible avec une IA. |
| Probabilité (estimation) | Moyenne-Élevée. Vecteur réaliste dès que la Voûte ouvre, ou même sans Voûte si distribution informelle entre enseignants. |
| Impact | Critique. Atteinte aux articles 4 et 12 de la Loi 25 (renseignements personnels d'étudiants mineurs ou majeurs ; obligation de signalement à la CPVP en cas de fuite). Réputation de l'enseignante et du cégep. |
| Données touchées | Toutes les données identifiantes et sensibles : noms, DA (CRITIQUE), programmes, notes confidentielles, identifiants enseignante. |
| Statut défensif actuel | Insuffisant. CSP couvre l'exfiltration réseau directe mais pas les canaux indirects. |

##### Étapes

**1. Préparation**. Payload de collecte plutôt que de destruction. Le code parcourt les clés IndexedDB attendues : `groupeEtudiants`, `journal`, `enseignants`, `infoCours`, `evaluationsParEtudiant`. Sérialise en JSON, encode en base64.

**2. Distribution**. Identique à D-01 — canal qui touche des enseignants ciblés (Yasmine, son cégep, son département).

**3. Ingestion**. Le payload est planté dans la bibliothèque de la victime (mêmes failles que D-01).

**4. Activation et collecte**. À la première utilisation d'un module qui rend la grille (innerHTML legacy non échappé), le payload s'exécute. Il collecte. Au lieu d'envoyer (CSP bloque), il **dépose le bloc encodé dans la bibliothèque elle-même** — soit dans le `metadata_cc` d'une grille existante, soit dans une nouvelle grille marquée comme cachée.

**5. Persistance**. Le payload se rend invisible : il pose un flag `cache: true` ou un nom qui commence par un caractère non imprimable, ou il se loge dans une clé que les modules d'affichage ne lisent pas (ex. `bibliothequeEchelles` au lieu de `bibliothequeGrilles`).

**6. Exfiltration via export volontaire**. Le payload modifie soit le pipeline d'export (`exporterBibliothequeGrilles` dans `grilles-bibliotheque.js:145`), soit attend que la victime exporte. Le bloc encodé voyage avec l'export.

**7. Récupération par l'attaquant**. L'attaquant accède au ZIP par : (a) la liste de diffusion publique où la victime partage, (b) un compromis du destinataire de l'export, (c) la Voûte si elle est consultable.

**8. Décodage et exploitation**. L'attaquant parse le ZIP, extrait le bloc, décode. Il a la base de données.

##### Cause racine

**C1 — Tout le contexte JS a accès à toutes les clés IndexedDB**. Pas de cloisonnement entre modules. Un payload qui s'exécute dans le contexte « grille » peut lire `groupeEtudiants` aussi librement qu'un module légitime.

**C2 — Le mécanisme d'export n'est pas auditifiable**. La fonction `exporterBibliothequeGrilles` (`grilles-bibliotheque.js:145`) lit la bibliothèque telle quelle et la sérialise. Elle n'a aucun mécanisme pour détecter un champ anormal (ex. `metadata_cc` trop volumineux, contenu base64 suspect). Elle fait confiance.

**C3 — Pas de validation de schéma à l'export**. À l'inverse de l'import, l'export ne passe pas par `assainirObjet` ou un équivalent. Le contenu sortant peut donc embarquer des champs qui ne devraient pas y être.

**C4 — Pas de chiffrement au repos**. Les données IndexedDB sont en clair. Un payload qui les lit n'a même pas à les déchiffrer. Mitigation : Web Crypto API permettrait de chiffrer les données les plus sensibles (DA, journal) au repos, avec une clé dérivée d'un secret utilisateur. Implication ergonomique : besoin d'un mot de passe.

**C5 — La CSP couvre fetch externe mais pas les canaux indirects**. Décrit dans la note préalable. La CSP n'est pas une défense contre l'exfiltration via export, ni contre l'ingénierie sociale UI.

**C6 — Pas de journalisation des accès aux données sensibles**. Aucune trace de quelle clé IndexedDB a été lue par quel module à quel moment. Une lecture massive de `groupeEtudiants` par un module qui n'a pas vocation à y toucher passe inaperçue.

##### Défenses requises

**P1 — Sandbox iframe pour l'aperçu et l'usage initial d'une grille importée (commun avec D-01).**
*Quoi* : déjà décrit. Annule X-01 aussi : l'iframe sandbox n'a pas accès à l'IndexedDB du parent, donc le payload ne peut rien collecter.
*Effort estimé* : commun avec D-01.

**P2 — Validation de schéma stricte à l'export.**
*Quoi* : avant qu'un export soit produit, scanner chaque item de la bibliothèque pour détecter des champs hors schéma (ex. `metadata_cc` qui dépasse une taille raisonnable, présence de strings base64 longues), des grilles cachées (flag `cache`, nom non imprimable), des duplications anormales. Refuser l'export si suspect, ou demander confirmation.
*Où* : `js/import-export.js`, `js/grilles-bibliotheque.js` (`exporterBibliothequeGrilles`).
*Effort estimé* : 2-3 jours.
*Limite* : un payload bien conçu peut camoufler les données dans des champs légitimes (descriptions, noms). Cette défense réduit la surface, ne l'élimine pas.

**P3 — Chiffrement au repos des données identifiantes critiques.**
*Quoi* : DA et notes confidentielles du journal chiffrés en IndexedDB avec une clé dérivée d'un secret utilisateur (mot de passe, ou clé matérielle). Le payload qui lit la clé voit du chiffré inutilisable.
*Où* : `js/db.js` (couche transparente), nouveau module `js/chiffrement.js`.
*Effort estimé* : 2 semaines + ergonomie (gestion du mot de passe, récupération si oublié, etc.).
*Limite* : si l'utilisateur a déchiffré pour utiliser l'app, le payload qui s'exécute dans le contexte voit la donnée déchiffrée en mémoire. Cette défense protège **les données au repos**, pas les données en cours d'utilisation. Utile contre le vol de la machine, moins contre un payload actif.

**P4 — Wrapper sur les lectures de clés sensibles + journalisation.**
*Quoi* : tout accès à `groupeEtudiants`, `journal`, `enseignants`, `infoCours` passe par une fonction qui journalise l'appelant (call site, timestamp, taille des données lues). Un dashboard interne permet à l'utilisateur de voir « qui lit quoi ». Une lecture massive non attendue génère une alerte.
*Où* : `js/db.js` (refactor des accesseurs), nouveau module `js/audit-acces.js`.
*Effort estimé* : 1 semaine.
*Limite* : un attaquant qui contrôle le JS peut redéfinir le wrapper. Mais comme ailleurs, la barre est plus haute. Et la journalisation reste utile en post-mortem.

**P5 — Modération humaine + checksum de pack pour les distributions « officielles ».**
*Quoi* : tout pack qui prétend venir d'une source officielle (CRPNQ, AQPC, etc.) doit être vérifiable contre une liste de checksums publiée par l'organisation prétendue. Si le checksum ne correspond pas, ou si l'organisation n'a aucune trace publique de l'avoir publié, méfiance.
*Où* : pratique organisationnelle plus que code. Mais peut s'incarner dans l'UI : à l'import d'un pack, demander la source et vérifier dans une liste blanche.
*Effort estimé* : variable, dépend des partenariats institutionnels.
*Limite* : ne couvre pas la distribution informelle entre collègues.

##### Signaux de détection

- **Audit IndexedDB** : présence de grilles non visibles dans l'UI (avec `cache: true` ou autre flag obscur). Tailles anormales de `metadata_cc` ou de descriptions.
- **Comparaison taille IndexedDB / taille export** : un export qui sort beaucoup plus volumineux qu'attendu peut transporter des données cachées.
- **Activité réseau anormale** : même si la CSP bloque, les tentatives apparaissent dans la console DevTools comme erreurs CSP. Régulièrement consulter ces logs.
- **Plainte d'un destinataire d'export** qui découvre des champs non attendus.

##### Limites

1. **Auteur authentique malveillant** qui exfiltre ses propres données pour les revendre — la défense ne s'applique pas, c'est un acte volontaire de sa part.
2. **Compromission de la machine** — un attaquant avec accès physique peut lire IndexedDB directement, sans passer par l'app. Hors périmètre.
3. **Diffusion des données par canaux non Labo Codex** — si un enseignant exporte volontairement et envoie par courriel, l'app n'a aucune prise. Cas Loi 25 typique : éducation utilisateur sur les bonnes pratiques.

##### Zones d'incertitude

1. **Quels sont tous les chemins d'export** dans le code ? À grep `JSON.stringify` sur des objets de bibliothèque, `exporter*`, `genererZip*`. Plusieurs fonctions probablement.
2. **`metadata_cc` est utilisé comment exactement** ? À lire `cc-license.js`. La taille raisonnable maximale dépend du contenu légitime attendu.
3. **Y a-t-il déjà une journalisation des accès** dans `journal.js` ? À auditer.
4. **Quelle clé matérielle** serait raisonnable pour P3 ? Mot de passe simple ? PassKey ? Touch ID via Web Authentication ? Décision UX/sécurité.

---

#### X-02 — Exfiltration via export piégé distribué par la victime (COURT)

##### Récit narratif condensé

Variante simplifiée de X-01. Au lieu de cacher les données dans `metadata_cc`, le payload modifie le pipeline d'export pour inclure un fichier supplémentaire dans le ZIP exporté — par exemple `bibliotheque.json` (légitime) **et** un fichier annexe `inventaire.dat` qui contient la base étudiante encodée. La victime exporte. Le ZIP voyage avec les deux fichiers. Le destinataire (l'attaquant) ouvre le ZIP, ignore le fichier légitime, exploite l'annexe.

##### Fiche technique

| Champ | Valeur |
|---|---|
| Code | X-02 |
| Vecteur | Pipeline d'export ZIP modifié |
| Profils | Externe + IA |
| Impact | Critique (Loi 25) |
| Probabilité | Moyenne |
| Statut défense | Aucun. Pas de validation de structure du ZIP en sortie. |

##### Cause racine principale

`genererZip` (à grep dans `import-export.js`, `codex.js`) construit le ZIP par accumulation. Si le payload patche la fonction (ou ajoute un hook), il peut injecter des entrées ZIP supplémentaires sans modifier les entrées légitimes. Aucune vérification n'est faite que le ZIP sortant ne contient que les fichiers attendus.

##### Défense principale

**P1 — Whitelist de structure pour les ZIPs sortants.**
À l'export, comparer la liste des entrées ZIP générées à une whitelist par type d'export (codex complet, bibliothèque seule, etc.). Toute entrée hors whitelist est refusée et l'export aborte avec alerte.
*Effort estimé* : 1-2 jours.

**P2 — Affichage à l'utilisateur de la liste des fichiers du ZIP avant téléchargement.**
Avant que le ZIP soit livré au navigateur, montrer un récapitulatif à l'utilisateur : « Votre export contient les fichiers suivants : [...]. Continuer ? ». L'utilisateur a une chance de repérer un nom de fichier suspect.
*Effort estimé* : 1 jour.
*Limite* : la plupart des utilisateurs valident sans lire — éducation nécessaire.

##### Signaux de détection

Inspection manuelle des ZIPs exportés (Finder › Aperçu). Tout fichier au nom non attendu est suspect.

##### Zones d'incertitude

Combien de pipelines d'export existent dans l'app ? `exporterBibliothequeGrilles`, `exporterCodex`, `exporterReserve`, etc. À inventorier pour appliquer P1 partout.

---

### Catégorie I — Injection et exécution arbitraire

Trois scénarios. Un complet (I-01), deux courts (I-02, I-03).

I-01 décrit la vulnérabilité technique de fond qui rend possibles D-01, X-01, U-01 et plusieurs autres scénarios. Les autres catégories décrivent l'**exploitation** de cette vulnérabilité ; I-01 décrit la vulnérabilité elle-même comme objet d'analyse à part entière.

---

#### I-01 — XSS stocké via critère importé (COMPLET)

##### Récit narratif

Ce scénario est la mécanique d'arrière-plan qui rend D-01, X-01, U-01 (et plusieurs autres) techniquement possibles. Le récit ici n'est pas une nouvelle attaque distincte — c'est la dissection détaillée du **mécanisme commun** qui les sous-tend. Comprendre I-01 en profondeur permet de comprendre pourquoi P1 (sandbox iframe) est si efficace : il neutralise la mécanique elle-même, pas chaque exploitation individuelle.

XSS signifie Cross-Site Scripting. « Stocké » signifie que le payload est sauvegardé dans la base de l'application et déclenché à un moment ultérieur, par opposition à « réfléchi » (déclenché immédiatement via une URL piégée). Dans Labo Codex, la base est IndexedDB et le payload se loge typiquement dans la `description` d'un critère, le `nom` d'une grille, ou les `metadata_cc`. Il s'active la première fois qu'un module rend ce champ via `innerHTML` sans échappement.

Le mécanisme exact : un module fait `element.innerHTML = '<div>' + grille.criteres[0].description + '</div>';` — sans appel à `echapperHtml()`. La description contient `Évalue la cohérence.<img src=x onerror="...payload...">`. Le navigateur, en parsant cette chaîne pour la transformer en arbre DOM, voit la balise `<img>`, tente de charger l'URL `x`, échoue, déclenche `onerror`. Le code dans `onerror` s'exécute dans le contexte global de Labo Codex avec tous les droits du contexte : lecture/écriture IndexedDB, accès aux handles FSAPI, manipulation de l'UI, etc.

Conséquence : I-01 est la **porte d'entrée commune** des scénarios D-01 (destruction), X-01 (vol), U-01 (usurpation amplifiée). Coupez l'entrée, vous coupez les sorties.

##### Fiche technique

| Champ | Valeur |
|---|---|
| Code | I-01 |
| Vecteur principal | Champ texte importé (description, nom, metadata) → `innerHTML` non échappé → exécution |
| Vecteurs secondaires | Tous les champs susceptibles d'être rendus en HTML : descriptions de critères, noms de grilles, libellés d'échelles, cartouches, commentaires de productions. |
| Profils d'attaquants | Tous profils. C'est la primitive technique de base. |
| Capacité technique requise | Faible. Le payload `<img onerror=...>` est documenté partout sur internet. |
| Probabilité (estimation) | Élevée. Tant que I-01 n'est pas neutralisée, toute autre attaque qui repose sur l'exécution de code peut s'y greffer. |
| Impact | Critique. Une fois le code arbitraire exécuté, toutes les autres attaques sont possibles. |
| Statut défensif actuel | Partiel. `echapperHtml()` est appliqué sur le code récent. Pas de garantie sur le legacy. `assainirChaine()` retire les balises à l'import mais avec une regex contournable. |

##### Étapes

**1. Construction du payload**. Forme typique : `<img src=x onerror="...">`, ou `<svg onload="...">`, ou `<iframe src="javascript:...">` (bloqué par CSP), ou des variantes encodées (`&lt;img&gt;` qui peut être décodé selon le contexte).

**2. Injection**. Le payload est inséré dans un champ texte d'un objet pédagogique (grille, échelle, cartouche) et l'objet est exporté ou partagé.

**3. Ingestion par la victime**. L'objet est importé. Selon les défenses en place :
- Si `assainirChaine` est appelé sur le champ : le regex `/<[^>]*>/g` retire la balise. Le payload est neutralisé. **Mais** : la regex peut être contournée par malformations (`<img onerror=alert(1)<x>`), par caractères de contrôle (`<img\nonerror=...>`), ou par des balises non standard que le regex ne match pas.
- Si `assainirObjet` n'est pas appelé sur ce chemin (cas actuel pour `criteres` qui n'a pas de sous-schéma) : le payload entre dans la base intact.

**4. Stockage**. Le payload vit en IndexedDB. Aucune action ne le déclenche tant qu'il n'est pas rendu.

**5. Activation**. Un module qui affiche le champ via `innerHTML` parse le HTML. Le navigateur exécute. Code arbitraire.

**6. Persistance**. Le payload reste en base. Toute future ouverture qui rend le champ le ré-active. Le code peut aussi se modifier lui-même pour évoluer entre activations.

##### Cause racine

**C1 — `innerHTML` est largement utilisé dans le code**. Le pattern est fréquent (plusieurs centaines d'occurrences à travers les modules), mais l'audit ciblé du 6 mai 2026 montre que dans les modules sensibles (grilles, évaluation, échelles, cartouches, bibliotheque-ui), la quasi-totalité des interpolations de données pédagogiques utilise déjà `echapperHtml()`. La dette se concentre dans : (a) les modules d'aperçu et wizards non encore audités, (b) les chemins indirects (`setAttribute`, templates littéraux passés à `insertAdjacentHTML`), (c) les modules ajoutés depuis l'audit du 26 mars 2026. Chaque occurrence non échappée reste un point de défaillance potentiel ; une revue exhaustive scriptée est nécessaire (cf. Défense J §8.1) parce qu'aucun garde-fou structurel ne prévient une régression future.

**C2 — `echapperHtml()` est une convention, pas une obligation enforced**. Rien dans le code ne vérifie qu'un champ utilisateur est échappé avant interpolation. C'est la responsabilité de chaque développeur (ou IA) à chaque appel. Erreur humaine garantie statistiquement.

**C3 — `assainirChaine` utilise une regex naïve**. `/<[^>]*>/g` ne couvre pas toutes les variantes d'injection. Une regex plus robuste existerait, mais le mieux est de **ne pas faire confiance** à la sanitisation par regex côté entrée, et de toujours échapper côté sortie.

**C4 — Pas d'isolation par module**. Tout module a accès à toutes les données. Un module « grille » qui affiche un champ peut, par sa simple exécution, donner accès à toute IndexedDB. Une architecture avec sandbox par module limiterait l'impact.

**C5 — La CSP `script-src 'self'` ne couvre pas les handlers d'événement injectés**. `<img onerror>` exécute du code via un handler HTML, pas via une balise `<script>`. La CSP traditionnelle laisse passer. Une CSP plus stricte (`script-src 'self' 'strict-dynamic'` + nonces) pourrait bloquer ces handlers, mais nécessite une refonte du code pour utiliser des nonces partout.

##### Défenses requises

**P1 — Bannir `innerHTML` sur champs utilisateur ; passer à `textContent` ou construction DOM.**
*Quoi* : le pansement `echapperHtml()` reste utile en transition mais la cible doit être **éliminer `innerHTML`** sur tout champ qui contient des données utilisateur. `textContent` ne parse pas le HTML — du contenu malveillant devient du texte affiché tel quel, sans exécution. La construction DOM (`document.createElement` + `appendChild`) permet de structurer un fragment sans interpréter du HTML.
*Où* : tous les modules qui font `innerHTML` sur des champs d'objets pédagogiques. Audit nécessaire.
*Effort estimé* : 1-2 semaines pour une revue complète et un refactor systématique. Plus si le code est fragmenté.
*Limite* : ne traite pas les cas où le HTML rendu est attendu (par exemple, du texte mis en forme via Markdown). Pour ces cas, utiliser un parser Markdown sécurisé qui convertit en arbre DOM contrôlé, jamais en string HTML.

**P2 — Linter / règle code review qui bloque `innerHTML` avec interpolation.**
*Quoi* : convention explicite dans le code review : « tout `innerHTML` qui interpole une variable doit être justifié et échappé, ou refusé ». Idéalement, un script de pré-commit qui grep `innerHTML.*\$\{|innerHTML.*\+` et alerte.
*Où* : nouveau script `scripts/audit-innerhtml.sh` ou hook git.
*Effort estimé* : 1 jour pour le script + diffusion comme convention.
*Limite* : convention humaine, contournable.

**P3 — Sandbox iframe (commun avec D-01, X-01).**
*Quoi* : déjà décrit. C'est la défense en profondeur qui neutralise la mécanique I-01 même si elle subsiste dans le code legacy.
*Effort estimé* : commun.

**P4 — Renforcement CSP avec nonces.**
*Quoi* : passer à `script-src 'self' 'nonce-XXX'` et bloquer les handlers d'événement inline en ajoutant `unsafe-hashes` strict ou en déplaçant tous les handlers vers du JS séparé.
*Où* : `index.html`, refactor de tout le code qui pose des handlers via `setAttribute('onclick', ...)` ou similaire.
*Effort estimé* : 1-2 semaines + tests exhaustifs (la CSP peut casser des fonctionnalités legitime).
*Limite* : ne traite pas le `<img onerror>` directement — le bloque via la CSP événements, mais cette CSP est mal supportée. À tester.

**P5 — Schémas stricts pour TOUS les imports (commun avec D-01 P2).**
*Quoi* : déjà décrit. Sous-schémas pour `criteres`, `niveaux`, `metadata_cc`. Tous les champs textuels passent par `assainirChaine`.
*Effort estimé* : commun.

##### Signaux de détection

- **Audit IndexedDB DevTools** : grep dans tous les champs textuels pour `<script`, `<img`, `<svg`, `<iframe`, `onerror=`, `onload=`, `onclick=`, `javascript:`, `data:text/html`, `expression(`.
- **Erreur CSP** dans la console au moment d'utiliser une grille — tentative d'exécution bloquée par CSP, signal positif que la défense a fonctionné.
- **Test périodique** : équipe de développement insère volontairement un payload dans un environnement de test, vérifie qu'il est neutralisé.

##### Limites

1. **HTML légitime** : si l'app permet du texte enrichi (gras, italique) dans certains champs, la défense doit distinguer le HTML autorisé du HTML hostile. Solution : autoriser un sous-ensemble strict via une whitelist (ex. `<b>`, `<i>` uniquement) parsé par un parser sécurisé, jamais interpolé en string.
2. **Bibliothèques externes** : Chart.js, JSZip peuvent introduire leurs propres `innerHTML` dans leur code. À auditer périodiquement.
3. **Évolution future** : nouvelle balise ou nouveau handler que le navigateur introduit, et qui n'est pas dans le set de protection.

##### Zones d'incertitude

1. **Taux exact d'`innerHTML` sur champs utilisateur** dans le code actuel — à mesurer avec un grep systématique et une catégorisation manuelle (sûr / non sûr).
2. **`assainirChaine` est-elle contournable** sur le code Labo Codex spécifiquement ? À tester avec des payloads connus (cf. cheat sheets OWASP XSS Filter Evasion).
3. **La CSP événements** (`script-src-elem`, `script-src-attr`) est-elle supportée par les navigateurs ciblés (Safari M3, Safari iPad M1) ? À tester.

---

#### I-02 — Polyglotte image+JS dans un blob de travail (COURT)

##### Récit narratif condensé

Un attaquant fabrique un fichier qui est à la fois une image PNG valide (passe les magic bytes `89 50 4E 47`) **et** contient un script HTML/JS exploitable. Variante la plus connue : un fichier SVG (qui peut contenir des balises `<script>`) renommé pour qu'il passe une vérification basée sur l'extension. Si l'app utilise les magic bytes (cas Labo Codex grâce à `validerMagicBytes` dans `travaux-import.js:35`), le SVG est détecté car les magic bytes ne correspondent pas à PNG/JPEG/PDF/WebP/HEIC. La défense fonctionne.

Mais une variante plus subtile : un PNG **réellement** valide qui contient, après l'IHDR, des chunks personnalisés où l'attaquant a logé du JavaScript. Si une partie du code de l'app affiche cette image dans un contexte qui interprète des balises (par exemple, un éditeur HTML qui inclut `<img src="data:image/png;base64,...">` puis fait un OCR ou rend en HTML), le script peut être déclenché.

##### Fiche technique

| Champ | Valeur |
|---|---|
| Code | I-02 |
| Vecteur | Import images / PDF / blobs de travail |
| Profils | Externe + IA |
| Impact | Élevé |
| Probabilité | Faible — `validerMagicBytes` couvre l'essentiel |
| Statut défense | Partiel. Magic bytes en place. Pas de scan de chunks dans les images valides. |

##### Cause racine principale

`validerMagicBytes` (`travaux-import.js:35`) est correctement implémenté avec rejet par défaut sur erreur de lecture. C'est solide pour les types simples. Mais elle ne scanne pas le **contenu** d'un fichier image valide. Un PNG conforme avec un payload caché passe la validation parce que les premiers octets sont corrects.

Risque amplifié si l'app affiche les images dans un contexte HTML interprété (par exemple `<img>` dans un éditeur riche, ou une visionneuse qui injecte les chunks dans le DOM). À vérifier dans `travaux-visionneuse.js`.

##### Défense principale

**P1 — Re-encodage des images à l'import.**
À l'import, ne pas stocker le fichier brut. Le décoder via `<canvas>`, l'extraire en pixels, le ré-encoder en PNG/JPEG « propre ». Tout chunk personnalisé ou métadonnée suspecte est éliminé. Coût : qualité légèrement dégradée, taille fichier différente.
*Effort estimé* : 2-3 jours.

**P2 — Stockage des blobs hors du contexte HTML rendu.**
Les images de travail sont rendues via `URL.createObjectURL(blob)` dans une balise `<img>` — pas via `data:image/...` qui peut être manipulé. Vérifier que tous les chemins d'affichage utilisent `createObjectURL`.
*Effort estimé* : 1 jour de revue.

##### Signaux de détection

Taille de fichier anormalement grande pour le contenu visuel (un PNG de 50 Mo pour une copie scannée à résolution standard est suspect).

##### Zones d'incertitude

`travaux-visionneuse.js` rend les images comment ? À lire pour confirmer qu'il n'y a pas d'injection HTML possible.

---

#### I-03 — Path traversal dans une archive importée (COURT)

##### Récit narratif condensé

Un ZIP contient une entrée nommée `../../../keyvalue/groupeEtudiants.json`. À l'extraction non validée, l'app écrit le contenu de cette entrée dans une clé IndexedDB de son choix — écrasant ou corrompant les données existantes. Variante : nom commençant par `\` (Windows path), ou utilisant des séquences Unicode équivalentes à `..`.

##### Fiche technique

| Champ | Valeur |
|---|---|
| Code | I-03 |
| Vecteur | Import ZIP |
| Profils | Externe + IA |
| Impact | Élevé (écrasement de clés critiques) |
| Probabilité | Très faible — `validerZipSecurite` rejette explicitement les `..` |
| Statut défense | Bon |

##### Cause racine principale

`validerZipSecurite` (`import-export.js:21`) refuse `nom.indexOf('..') !== -1` et `nom.charAt(0) === '/'`. Couverture solide pour les payloads naïfs.

Failles résiduelles potentielles :
- Pas de normalisation Unicode avant la vérification. Une séquence comme `..` (équivalent Unicode de `..`) pourrait passer si elle est interprétée plus tard.
- Pas de gestion explicite des chemins Windows (`\`, `\\`).
- Pas de gestion des séquences URL-encoded (`%2e%2e`).

##### Défense principale

**P1 — Normalisation stricte des noms d'entrée avant vérification.**
Décoder URL-encoding, normaliser Unicode (NFC), remplacer `\` par `/`, puis vérifier l'absence de `..`, de `/` initial, et de tout caractère non-ASCII suspect (`\0`, contrôles). Refuser tout nom qui ne survit pas à la normalisation à l'identique.
*Effort estimé* : 2 heures.

##### Signaux de détection

Erreur dans la console au moment de l'extraction si le path est rejeté. Logger ces erreurs pour audit.

##### Zones d'incertitude

Les noms de fichiers Lea (cas légitime, `parserNomFichierLea` dans `travaux-import.js:98`) contiennent-ils des caractères Unicode susceptibles d'être confondus avec des tentatives de traversal ? À tester.

---

### Catégorie U — Usurpation d'identité et fabrication

Trois scénarios. Un complet (U-01), deux courts (U-02, U-03).

L'usurpation d'identité est la priorité #1 explicitement formulée par Grégoire dans le `.claude/skills/securite-donnees/SKILL.md` §2.2 (M1). Cette catégorie traite les attaques où la **paternité** d'un contenu est falsifiée, indépendamment de ce que ce contenu fait par ailleurs. Une grille usurpée peut être inoffensive techniquement et toujours nuire — par discrédit de l'auteur prétendu, ou par tromperie sur la source.

---

#### U-01 — Grille publiée sous identité d'un enseignant respecté (COMPLET)

##### Récit narratif

Robert Tremblay enseigne la philosophie au Cégep de l'Outaouais depuis vingt ans. Il a publié plusieurs articles méthodologiques sur l'évaluation des compétences argumentatives, donné des conférences à l'AQPC, et sa réputation dans la communauté pédagogique québécoise est solide. Il n'utilise pas Labo Codex — il préfère un système maison construit sur Numbers. Il n'a pas de profil dans la Voûte (qui est en phase pilote, ouverte à un cercle d'enseignants invités).

Quelqu'un le sait. Cet attaquant, mécontent que Robert ait critiqué publiquement une approche pédagogique en vogue dans certains cégeps, décide de nuire à sa réputation via un canal qu'il sait visible : la communauté Labo Codex. Il fabrique une grille d'évaluation d'argumentation philosophique. Le contenu est techniquement correct — peut-être même bon. Mais il introduit deux choses : (a) une pondération bizarre qui dévalorise un critère que Robert a publiquement défendu (« Profondeur conceptuelle » à 5 % au lieu d'un poids substantiel), et (b) des formulations dans les niveaux d'échelle qui contredisent les positions documentées de Robert (« Le vocabulaire technique n'est pas exigé » alors que Robert insiste publiquement sur l'importance du vocabulaire).

L'attaquant publie la grille dans un forum pédagogique avec ce paragraphe : « Voici la grille de Robert Tremblay (Cégep de l'Outaouais) pour la dissertation philosophique. Il l'a partagée à mon département la semaine dernière ; je la mets à disposition de la communauté. » Le champ `auteur` de la grille est rempli avec le nom complet de Robert. `auteurOriginal` aussi. La date de création est plausible. Aucune signature cryptographique n'existe pour vérifier — Labo Codex n'en a pas implémenté.

Plusieurs enseignants téléchargent la grille, l'importent, et l'utilisent. L'un d'eux la cite dans un atelier pédagogique : « Selon Robert Tremblay, la profondeur conceptuelle est secondaire dans l'évaluation. » La citation circule. Un collègue de Robert, présent à l'atelier, lui en parle. Robert est stupéfait — il n'a jamais écrit cette grille. Il rédige un démenti public, mais le mal est fait : la grille existe maintenant dans des dizaines de bibliothèques, et chacune semble dire que « Robert Tremblay l'a créée ». Sa parole publique se heurte à l'évidence apparente d'un document portant son nom. Il dépose plainte au syndicat. La communauté Labo Codex est éclaboussée par le scandale — « comment se fait-il qu'un usurpateur puisse publier sous un nom existant ? ». L'adoption du projet ralentit dans certains cégeps qui invoquent ce risque réputationnel.

Pas de payload exécutable, pas de destruction de données, pas de fuite. Une attaque purement sociale et institutionnelle, rendue possible par l'absence d'un mécanisme d'authentification de l'auteur.

##### Fiche technique

| Champ | Valeur |
|---|---|
| Code | U-01 |
| Vecteur principal | Bibliothèque partagée (Voûte ou distribution informelle) — champ `auteur` libre |
| Vecteurs secondaires | Tout export qui voyage, tout pipeline de partage |
| Profils d'attaquants | Collègue malveillant ; Attaquant externe avec motivation idéologique ou personnelle |
| Capacité technique requise | Très faible. Modification d'un champ texte dans un JSON. |
| Probabilité (estimation) | Élevée dès l'ouverture de la Voûte multi-cégep sans vérification d'identité. |
| Impact | Élevé sur le plan réputationnel et institutionnel. Différent de D ou X — pas de perte technique, mais perte de confiance et d'adoption. |
| Données touchées | Aucune au sens strict — l'identité n'est pas une donnée stockée par la victime. C'est sa réputation publique qui est attaquée. |
| Statut défensif actuel | Aucun. Signature ECDSA prévue dans le `.claude/skills/securite-donnees/SKILL.md` §6.4 mais pas implémentée. |

##### Étapes

**1. Identification de la cible**. L'attaquant choisit une figure publique de la communauté — quelqu'un dont le nom porte du poids et dont la prise de position publique sera contredite par le contenu fabriqué. Plus la victime est connue, plus l'attaque est efficace.

**2. Fabrication du contenu**. L'attaquant produit une grille techniquement plausible, qui contredit subtilement les positions publiques de la victime. La subtilité est essentielle — une grille manifestement incohérente avec les positions de Robert serait suspecte. Le contenu doit ressembler à du Robert, en pire.

**3. Falsification de l'attribution**. Champ `auteur` rempli avec le nom complet de la victime. `auteurOriginal` aussi. Date de création plausible. Description de la grille qui imite le style de la victime.

**4. Distribution**. Canal large où la victime ne pourra pas démentir immédiatement. Forum AQPC, Discord pédagogique, dépôt Voûte, partage informel par message. Le timing peut compter — pendant une absence connue de la victime (vacances, congé) pour retarder la riposte.

**5. Prolifération**. Les premiers utilisateurs importent et redistribuent. La grille apparaît dans plusieurs bibliothèques d'enseignants. Chaque copie est une « preuve » apparente de paternité.

**6. Citation et amplification**. Quelqu'un cite la grille dans un atelier, un blog, un commentaire. La citation amplifie. La victime apprend l'existence de la grille indirectement.

**7. Démenti et persistance**. La victime émet un démenti public. Mais les copies déjà importées dans des bibliothèques restent — et continuent de présenter la victime comme auteur. Le démenti ne « rappelle » pas les copies.

##### Cause racine

**C1 — Champ `auteur` libre, sans vérification cryptographique**. `grilles-bibliotheque.js:86` lit l'auteur depuis `grille.auteur || profilAuteurActif?.auteur_original || 'Inconnu'`. N'importe qui peut écrire n'importe quoi.

**C2 — Pas de répertoire des identités vérifiées**. Aucune liste centrale qui dirait « Robert Tremblay du Cégep de l'Outaouais a tel courriel et telle clé publique ». L'attribution est purement déclarative.

**C3 — Pas de signature ECDSA**. La spécification du `.claude/skills/securite-donnees/SKILL.md` §6.4 prévoit ce mécanisme, mais il n'est pas implémenté.

**C4 — Pas de mécanisme de révocation / takedown**. Une fois une grille distribuée, il n'existe aucun moyen de la révoquer dans les bibliothèques des destinataires. Pas de kill list (cf. D-01 P7).

**C5 — Pas de modération humaine**. Pour la phase pilote actuelle, ce manque est tolérable parce que la communauté est petite et restreinte. À l'ouverture multi-cégep, ce sera une lacune majeure.

##### Défenses requises

**P1 — Signature ECDSA avec annuaire de clés publiques (priorité ABSOLUE pour ce vecteur).**
*Quoi* : implémenter complètement le mécanisme du `.claude/skills/securite-donnees/SKILL.md` §6.4. Génération de paire de clés à la création du compte. Clé publique enregistrée dans un annuaire (côté Voûte, côté institution garante, ou décentralisé). Chaque grille partagée signée. À l'import, vérification.
*Où* : nouveau module `js/signature.js`. Annuaire des clés publiques (à concevoir). Intégration dans tout pipeline de partage.
*Effort estimé* : 2-3 semaines pour le code. Plusieurs mois pour la mise en place de l'annuaire et de la gouvernance.
*Limite* : ne dit pas que le contenu est sain (cf. D-01 P6). Combinable avec modération.

**P2 — Modération humaine pour les dépôts publics (Voûte).**
*Quoi* : tout dépôt dans la Voûte passe par une étape de validation humaine avant d'être accessible. Délai de quelques jours, comité de modération identifié. Pour les distributions informelles entre enseignants, pas de modération possible — c'est l'utilisateur qui doit être éduqué à la méfiance.
*Où* : pipeline Voûte (futur). Pratique organisationnelle plutôt que code.
*Effort estimé* : variable. Coût en heures bénévoles ou rémunérées du comité.

**P3 — Affichage explicite de l'incertitude sur l'attribution.**
*Quoi* : tant que P1 n'est pas en place, afficher dans l'UI à côté de chaque grille importée : « Auteur déclaré : <nom> (non vérifié) ». Distinguer visuellement les grilles signées (à terme) des grilles non signées.
*Où* : `js/grilles.js`, modules d'affichage.
*Effort estimé* : 1 jour.
*Limite* : la plupart des utilisateurs ignoreront le marqueur — éducation indispensable.

**P4 — Procédure de démenti / takedown coordonnée.**
*Quoi* : si une victime découvre une usurpation, mécanisme pour publier un démenti officiel dans une zone visible de l'app (« Avis d'usurpation : la grille X attribuée à Robert Tremblay est fausse selon l'auteur prétendu »). À terme, kill list automatique pour les grilles connues usurpées.
*Où* : pipeline Voûte (futur), modules d'affichage des grilles importées.
*Effort estimé* : 1 semaine + maintenance continue.

**P5 — Captcha / preuve de personnalité pour les dépôts massifs.**
*Quoi* : limiter le nombre de dépôts par utilisateur et par période. Mitigation contre la fabrication massive de fausses grilles par un script.
*Où* : pipeline Voûte.
*Effort estimé* : 2-3 jours côté Voûte.
*Limite* : ne couvre pas l'usurpation isolée — utile contre les attaques de spam.

##### Signaux de détection

- **Audit régulier de la Voûte** par les utilisateurs eux-mêmes : « est-ce qu'il y a des grilles attribuées à des collègues que je connais et qui me semblent suspectes ? »
- **Plainte directe de la victime** comme canal principal — d'où l'importance de P4 (procédure de takedown rapide).
- **Croisement avec les positions publiques de l'auteur prétendu** : si la grille contredit ce que la victime a publié ailleurs, signal fort.

##### Limites

1. **Auteur authentique qui change d'avis** : Robert peut publier une grille qui contredit ses positions antérieures. La défense ne doit pas bloquer ce cas légitime.
2. **Auteur authentique qui collabore avec un collègue** : si Robert co-écrit une grille avec quelqu'un d'autre, l'attribution doit pouvoir être collective. À gérer dans le mécanisme de signature (signature multiple ou champ `co-auteurs` distinct).
3. **Pseudo-anonyme** : un enseignant peut vouloir publier sous un pseudonyme. La défense doit permettre cela sans empêcher la vérification d'identité dans les autres cas.

##### Zones d'incertitude

1. **Quelle gouvernance** pour l'annuaire des clés publiques ? Centralisé via une institution garante ? Décentralisé ? PGP-style ? À discuter avec les Sept questions ouvertes du `.claude/skills/securite-donnees/SKILL.md` §6.2.
2. **Quel délai de modération** acceptable pour la Voûte ? 24 h ? 7 jours ? À calibrer en fonction de la vitesse de partage souhaitée.
3. **Comment éduquer** les utilisateurs à la méfiance sans dégrader l'adoption ? Question UX et pédagogique.

---

#### U-02 — Faux pack démarrage maquillé en version officielle (COURT)

##### Récit narratif condensé

Un attaquant fabrique un fichier `pack-demo-21.js` (numéro plausible suite à `pack-demo-20.js`) qui imite la structure officielle, mais ajoute des grilles modifiées ou un payload. Il distribue le fichier comme « mise à jour officielle du pack démo », par exemple via un faux courriel imitant la communication Labo Codex. Un enseignant qui sait qu'une mise à jour est attendue télécharge et installe.

##### Fiche technique

| Champ | Valeur |
|---|---|
| Code | U-02 |
| Vecteur | Distribution hors-app du pack démarrage |
| Profils | Externe |
| Impact | Élevé |
| Probabilité | Faible — protection partielle par convention de préfixe IDs `*_DEMO_*` |
| Statut défense | Partiel |

##### Cause racine principale

Le pack démo officiel utilise depuis Beta 95+ des IDs préfixés (`GRILLE_DEMO_*`, `ECH_DEMO_*`, etc.), documenté dans `.claude/skills/integrite-globaux/SKILL.md` §3.1. C'est une protection contre les collisions d'IDs avec le matériel utilisateur. **Mais** il n'y a pas de signature ni de hash officiel publié pour le fichier `pack-demo-XX.js`. Un attaquant peut produire un faux pack avec des IDs préfixés (la convention est publique) et il sera traité comme légitime.

##### Défense principale

**P1 — Hash officiel publié pour chaque version du pack démo.**
À chaque release, publier le hash SHA-256 du fichier `pack-demo-XX.js` dans la documentation officielle (README, page web, communiqué). À l'installation d'un pack démo, l'app calcule le hash et le compare à la liste connue. Hash absent ou non correspondant : avertissement.
*Effort estimé* : 1 jour côté code + intégration dans le processus de release.

##### Signaux de détection

Provenance non vérifiable du fichier (téléchargement depuis un lien non officiel, pièce jointe d'un courriel non identifié). Éducation utilisateur : « ne jamais installer un pack qui n'est pas téléchargé depuis le dépôt GitHub officiel ».

##### Zones d'incertitude

Comment publier le hash officiel de manière vérifiable ? Sur le repo GitHub directement ? Sur une page Anthropic Cowork ? À décider.

---

#### U-03 — Métadonnées CC truquées (COURT)

##### Récit narratif condensé

Un attaquant ajoute à une grille des `metadata_cc` qui font passer le contenu pour publié sous une licence officielle CC BY-NC-SA 4.0 par une institution reconnue (cégep, ministère, ordre professionnel). Le module `cc-license.js` produit ces métadonnées pour des grilles légitimes ; un attaquant peut les fabriquer à la main avec un format identique. La victime fait confiance au tampon « licence officielle » et utilise la grille sans audit critique.

##### Fiche technique

| Champ | Valeur |
|---|---|
| Code | U-03 |
| Vecteur | `metadata_cc` dans une grille ou autre objet partagé |
| Profils | Tous |
| Impact | Moyen |
| Probabilité | Moyenne |
| Statut défense | Aucun |

##### Cause racine principale

`cc-license.js` ajoute des métadonnées en clair, sans signature de l'institution prétendue. Aucun mécanisme pour vérifier qu'une `metadata_cc` qui dit « publié par le Ministère de l'Éducation » l'est réellement.

##### Défense principale

**P1 — Distinguer visuellement métadonnées vérifiables et auto-déclarées.**
Tant que le mécanisme de signature institutionnelle n'existe pas, afficher les `metadata_cc` avec un marqueur explicite : « Métadonnées auto-déclarées — non vérifiées ». Refuser tout traitement spécial (priorité d'affichage, badge officiel) basé sur ces métadonnées.
*Effort estimé* : 2-3 heures.

**P2 — Signature institutionnelle (long terme).**
Variante institutionnelle de U-01 P1 : les institutions partenaires (cégeps, ministère, AQPC) ont une clé publique enregistrée. Elles peuvent contresigner les `metadata_cc` qu'elles approuvent. Une grille avec signature institutionnelle vérifiée affiche le badge ; sans, marqueur d'incertitude.
*Effort estimé* : commun avec U-01 P1, plus accords institutionnels.

##### Zones d'incertitude

Quel poids les `metadata_cc` ont-elles aujourd'hui dans l'UI ? Si elles n'influencent rien (juste affichées), l'impact de l'usurpation est faible. Si elles influencent un classement ou un filtrage, l'impact est plus élevé. À auditer dans `cc-license.js` et l'UI bibliothèque.

---

### Catégorie C — Contributeur interne au code et IA mal alignée

Deux scénarios. Un complet (C-01), un court (C-02).

C'est la catégorie la plus fréquente en pratique mais la moins spectaculaire. Les régressions de sécurité par contributeur interne sont la cause d'incident la plus courante dans la plupart des projets — Labo Codex y compris (cf. l'incident du 24 avril 2026 documenté dans `.claude/skills/integrite-globaux/SKILL.md` §3.1, qui correspond à ce profil).

---

#### C-01 — Régression silencieuse de sécurité dans un commit (COMPLET)

##### Récit narratif

Grégoire travaille un dimanche soir sur un module de la bibliothèque de cartouches. Il veut ajouter un type de commentaire personnalisé. La fonction qui rend l'aperçu d'un cartouche dans l'UI utilisait `textContent` pour le titre et `innerHTML` avec `echapperHtml()` pour la description. Pour ajouter du gras et de l'italique dans la description (demande d'un testeur), il décide de retirer `echapperHtml` afin que le HTML soit rendu. Il sait que c'est risqué, mais il se dit : « les cartouches viennent toujours de l'utilisateur lui-même, ils ne sont pas importés. C'est sans risque. »

Il commit et push. Dans les semaines qui suivent, il ajoute une fonctionnalité de **partage des cartouches entre enseignants** — exactement ce que la conception originale prévoyait à long terme et qu'il avait oublié. Maintenant, les cartouches peuvent être importés depuis un export d'un collègue. Il n'a pas réactivé `echapperHtml` dans la fonction de rendu — il ne se souvient même pas de la raison pour laquelle il l'avait retiré. La fonction a passé deux refactorings depuis, et la justification est perdue.

Trois mois plus tard, un attaquant exploite cette régression dans un scénario D-01 ciblé sur les cartouches. Le rendu non échappé fait s'exécuter le payload. Personne dans l'audit du code n'a remarqué que cette fonction spécifique manquait l'échappement, parce que toutes les autres fonctions de rendu de cartouches utilisaient `textContent` (sécurisé par construction) et personne n'a pensé à vérifier ce point précis.

##### Fiche technique

| Champ | Valeur |
|---|---|
| Code | C-01 |
| Vecteur | Code source modifié sans audit de sécurité |
| Profils d'attaquants | Contributeur interne. Le contributeur n'est pas malveillant — la « cible » est en fait la sécurité du projet, pas une victime spécifique. |
| Acteurs réels | Grégoire en mode vibe coding tardif ; futur collaborateur qui ne connaît pas l'historique ; IA qui suggère du code en optimisant pour la fonctionnalité, pas la sécurité. |
| Capacité requise | Compétence technique normale du contributeur. La régression vient de l'inattention, pas de l'incompétence. |
| Probabilité (estimation) | Élevée sans contrôles structurels. Dans tout projet réel, ces régressions sont la première cause d'incident. |
| Impact | Critique, parce que la régression rouvre la porte à toutes les autres catégories de scénarios. |
| Statut défensif actuel | Partiel : `CLAUDE.md` documente les règles de sécurité, les skills formalisent. Mais aucun contrôle automatique. |

##### Étapes

**1. Décision locale, contexte limité**. Le contributeur fait un changement qui semble localement raisonnable, sans visibilité sur les conséquences globales. « Cette fonction n'est pas exposée à du contenu importé » — vrai à l'instant T, plus vrai 3 mois plus tard.

**2. Absence de signal d'alerte**. Aucun outil ne signale que la modification touche du code ayant un rôle de sécurité. Le commit passe sans flag.

**3. Mémoire perdue**. La justification du changement n'est pas documentée. Les commits suivants masquent l'origine.

**4. Évolution du contexte qui invalide l'hypothèse**. Une nouvelle fonctionnalité (partage des cartouches) crée un cas d'usage qui rend le code vulnérable.

**5. Exploitation**. Un attaquant trouve la faille. Ou un audit de sécurité ultérieur la révèle. Ou un incident la met en lumière.

##### Cause racine

**C1 — Pas de marquage explicite des fonctions sensibles**. `js/grilles.js` rend des grilles, mais rien dans le code ne crie « ATTENTION : cette fonction reçoit du contenu utilisateur, échappement obligatoire ». La connaissance est tacite, donc fragile.

**C2 — Pas de tests de sécurité automatisés**. Aucun test qui injecterait un payload XSS dans une grille importée et vérifierait qu'il ne s'exécute pas. Sans test, toute régression passe inaperçue.

**C3 — Pas de hook de pré-commit**. Pas de script qui grep `innerHTML` sur les modules sensibles et alerte si l'usage augmente sans justification.

**C4 — `CLAUDE.md` est documentation, pas enforcement**. Les règles sont écrites. Personne n'est obligé de les lire avant chaque commit. Une IA qui ignore le `CLAUDE.md` peut produire du code qui le contredit.

**C5 — Pas de revue par les pairs**. Grégoire travaille majoritairement seul (avec Claude). Pas de second œil humain qui pourrait poser la question « pourquoi as-tu retiré l'échappement ? ».

**C6 — Pression de livraison vs hygiène**. Le `CLAUDE.md` §Stabilité zéro-dette pose le principe « la stabilité prime sur la vitesse ». Mais en pratique, l'inertie d'une session de vibe coding tardive bouscule ce principe.

##### Défenses requises

**P1 — Tests de sécurité automatisés (priorité haute).**
*Quoi* : suite de tests qui vérifie pour chaque module sensible que des payloads XSS connus ne s'exécutent pas. Test scénarisé : injecter `<img src=x onerror="window.testXSSExecuted = true">` dans un champ de grille, déclencher le rendu, vérifier que `window.testXSSExecuted` reste indéfini.
*Où* : nouveau dossier `tests/securite/`. Framework : Vitest, Playwright, ou test manuel scripté.
*Effort estimé* : 1 semaine pour la mise en place + maintenance continue.
*Limite* : ne couvre que les patterns testés. Un payload nouveau passe.

**P2 — Hook pré-commit qui détecte les régressions.**
*Quoi* : script Bash exécuté à chaque commit qui (a) grep tous les `innerHTML` du diff, (b) vérifie que chaque interpolation est précédée de `echapperHtml` ou de `textContent`, (c) refuse le commit si un nouveau `innerHTML` non échappé est introduit.
*Où* : `.git/hooks/pre-commit` (initialisé par un script `scripts/install-hooks.sh`).
*Effort estimé* : 1-2 jours.
*Limite* : un grep bête peut faire des faux positifs et faux négatifs. À calibrer.

**P3 — Marquage explicite des fonctions sensibles dans le code.**
*Quoi* : commentaires en tête de chaque fonction qui touche à des données utilisateur ou à des opérations destructives : `// SÉCURITÉ : cette fonction rend du contenu importé. Toute interpolation DOIT passer par echapperHtml. Voir docs/securite/MODELE-MENACES.md §I-01.`
*Où* : tous les modules sensibles, identifiés par audit.
*Effort estimé* : 2-3 jours pour l'audit + ajout de commentaires.
*Limite* : convention humaine. Un contributeur peut retirer le commentaire en même temps que la protection.

**P4 — Audit périodique de sécurité.**
*Quoi* : tous les 3 mois (ou à chaque release majeure), passe systématique sur les modules sensibles : grep `innerHTML`, grep accès directs aux clés sensibles, test manuel d'injection. Documenté dans un rapport d'audit.
*Où* : `docs/securite/audits/AUDIT-<date>.md`.
*Effort estimé* : 1 jour par audit.

**P5 — Skills système (`.claude/skills/securite-donnees/SKILL.md`, etc.) chargés systématiquement avant tout chantier sécurité.**
*Quoi* : convention obligatoire — toute IA qui assiste Grégoire sur un module sensible charge le skill correspondant **avant** de proposer du code. Le `CLAUDE.md` §Avant de coder est explicite mais peut être oublié. Ajouter un check explicite dans le prompt initial des sessions.
*Où* : pratique de session, instructions dans `CLAUDE.md`.

**P6 — Règle code review pour collaborateurs futurs.**
*Quoi* : si Grégoire ouvre le projet à un collaborateur humain, instituer une règle : tout PR qui touche un module sensible (liste à publier) nécessite revue explicite par Grégoire avant merge. À documenter dans le `CONTRIBUTING.md` du projet.
*Où* : nouveau fichier `CONTRIBUTING.md` (à créer).
*Effort estimé* : 2 heures.

##### Signaux de détection

- **Diff inhabituel** sur un module sensible : commit qui retire un appel à `echapperHtml`, qui transforme `textContent` en `innerHTML`, qui retire un `assainirObjet`. À examiner toujours.
- **Test de sécurité automatique qui passe au rouge** (si P1 implémenté).
- **Hook pré-commit qui alerte** (si P2 implémenté).
- **Audit périodique** qui révèle un nouveau site de risque.

##### Limites

1. **Régressions invisibles aux outils** : un payload sophistiqué qui ne ressemble à aucun pattern connu passe les tests. Mitigation : audit manuel régulier + veille sécurité.
2. **Régression dans une dépendance externe** : Chart.js qui passe à une version vulnérable. À auditer dans le processus de mise à jour des dépendances.
3. **Régression d'architecture** : changement structurel qui supprime une protection sans modifier directement la ligne. Plus subtil. Audit de PR par humain reste irremplaçable.

##### Zones d'incertitude

1. **Quel framework de test** est compatible avec la stack vanilla JS ? Vitest est probable mais à valider.
2. **Combien de modules** sont à marquer comme sensibles ? Liste à produire — au moins une dizaine probablement.
3. **Le hook pré-commit** ne ralentit-il pas le workflow vibe coding au point d'être désactivé par fatigue ? À calibrer.

---

#### C-02 — IA générant du code qui contourne `assainirObjet` (COURT)

##### Récit narratif condensé

Grégoire demande à Claude Code : « ajoute un nouveau type d'objet dans la bibliothèque pour les exemples de productions ». Claude écrit la fonction d'import correspondante, ajoute la fonction d'ingestion en bibliothèque, écrit l'UI. Il oublie d'ajouter un schéma dans `SCHEMAS_IMPORT` et n'appelle pas `assainirObjet`. La fonctionnalité marche, l'utilisateur est content. Trois mois plus tard, un attaquant exploite ce nouveau chemin d'import non assaini pour livrer un payload XSS.

##### Fiche technique

| Champ | Valeur |
|---|---|
| Code | C-02 |
| Vecteur | Code écrit par une IA assistante qui ignore les protections en place |
| Profils | Contributeur interne (humain + IA) |
| Impact | Critique (équivalent à C-01) |
| Probabilité | Élevée. C'est exactement le scénario du vibe coding actuel. |
| Statut défense | Insuffisant : skills documentent mais ne sont pas systématiquement chargés. |

##### Cause racine principale

Une IA qui génère du code optimise pour le prompt explicite (« ajoute un nouveau type d'objet ») et pour la cohérence avec le code visible. Si elle ne lit pas les skills sécurité avant, elle ne sait pas que `assainirObjet` est obligatoire. Si elle lit le skill mais que celui-ci ne contient pas un exemple complet du nouveau cas, elle peut omettre l'application.

##### Défense principale

**P1 — Pré-amorçage systématique des sessions sensibles.**
*Quoi* : tout prompt initial à une IA qui touche les bibliothèques partagées doit charger les skills `.claude/skills/securite-donnees/SKILL.md`, `.claude/skills/hygiene-donnees-partagees/SKILL.md`, `.claude/skills/integrite-globaux/SKILL.md` ET ce document `MODELE-MENACES.md`. Le `CLAUDE.md` §Avant de coder le formalise. À ajouter explicitement à `CLAUDE.md` une règle « pour tout module touchant les bibliothèques, lire MODELE-MENACES.md avant de proposer du code ».
*Effort estimé* : modification de `CLAUDE.md`, 30 minutes.

**P2 — Audit post-IA systématique.**
*Quoi* : après chaque chantier où une IA a écrit du code dans un module sensible, exécuter le hook pré-commit (P2 de C-01) et l'audit manuel : grep `innerHTML`, grep `db.set` sur clés sensibles, vérification que `assainirObjet` est appelé sur les nouveaux chemins d'import.
*Effort estimé* : 30 minutes par chantier.

##### Signaux de détection

Voir C-01. C-02 est une variante de C-01 où l'auteur du code est une IA — les signaux et les défenses sont communs, l'origine du risque diffère.

##### Zones d'incertitude

Comment garantir qu'une IA charge effectivement les skills avant de produire du code ? Aujourd'hui, c'est de la confiance en la formulation du prompt et du `CLAUDE.md`. Aucun mécanisme de vérification.

---

## 8. Plan de défense priorisé (roadmap)

Cette section consolide les défenses identifiées dans les 14 scénarios. Plusieurs défenses sont **transversales** — elles protègent plusieurs scénarios à la fois. La priorisation tient compte de cette transversalité, du coût, et de la facilité de mise en œuvre.

### 8.1 Cartographie des défenses transversales

| Code | Défense | Scénarios couverts | Effort | Priorité |
|---|---|---|---|---|
| **A** | Sandbox iframe pour aperçu d'objets importés (grilles, échelles, cartouches) | D-01, D-03, X-01, I-01 | 1 semaine | Critique |
| **B** | Sanitisation profonde + ingestion centralisée — étendu aux 6 bibliothèques (cf. §3.1.bis) : sous-schémas pour `grille.criteres`, `echelle.niveaux`, `pratique.criteres`, `pratique.ponderation` ; ajout des entrées `cartouche` et `tampon` dans `SCHEMAS_IMPORT` ; branchement d'`assainirObjet` sur les pipelines cartouches (`import-export.js:1936`) et tampons (`tampons-bibliotheque.js:187`) ; les 6 fonctions `ajouter*ALaBibliotheque` deviennent un passage obligé qui appelle `assainirObjet` localement. | D-01, D-02, X-01, I-01, C-02 | 1-2 jours | Critique |
| **C** | Garde-fous sur opérations destructives (wrapper sur `localStorage.clear`, `indexedDB.deleteDatabase`, `removeEntry` FSAPI) | D-01, D-03 | 1-2 semaines | Élevée |
| **D** | Révocation FSAPI par défaut + opt-in explicite | D-01, D-03 | 1-2 jours | Élevée |
| **E** | Audit `innerHTML` → migration vers `textContent` ou construction DOM, sur les modules d'affichage des 6 bibliothèques (cf. §3.1.bis) et leurs aperçus/wizards | D-01, D-02, I-01, C-01 | 1-2 semaines (audit ciblé du 6 mai 2026 montre une dette résiduelle faible mais non quantifiée pour les modules d'aperçu/wizard) | Critique |
| **F** | Signature ECDSA + annuaire de clés publiques | D-01, U-01, U-03 | 2-3 semaines (code) + gouvernance | Élevée mais long terme |
| **G** | Kill list + quarantaine + audit rétroactif | D-01, U-01 | 1 semaine | Moyenne |
| **H** | Hash SHA-256 de référence sur les 6 types d'objets partagés (grilles, échelles, cartouches, pratiques, productions, tampons) + comparaison à l'import | D-02, U-02 | 1-2 jours | Moyenne |
| **I** | Tests de sécurité automatisés | C-01, C-02 | 1 semaine + maintenance | Élevée |
| **J** | Hook pré-commit `innerHTML` + `db.set` clés sensibles | C-01, C-02 | 1-2 jours | Élevée |
| **K** | Validation de schéma stricte à l'export + whitelist des entrées ZIP sortantes — pour les 6 pipelines d'export par type (`exporterBibliothequeGrilles`, équivalents pour échelles/cartouches/pratiques/productions/tampons) ainsi que les exports codex/réserve | X-01, X-02 | 3-4 jours | Élevée |
| **L** | Modération humaine pour dépôts publics Voûte | U-01, U-03, D-01 | Variable (gouvernance) | Élevée pour l'ouverture Voûte |
| **M** | Détection à l'import des collisions par contenu (diff visuel) sur les 6 types d'objets partagés | D-02 | 4-5 jours | Moyenne |
| **N** | Renforcement CSP avec nonces (bloquer handlers d'événement) | I-01, D-01 | 1-2 semaines | Moyenne (compatibilité Safari à valider) |
| **O** | Re-encodage des images à l'import via `<canvas>` | I-02 | 2-3 jours | Faible-Moyenne |
| **P** | Unification du pipeline d'import des tampons sur le pipeline ZIP commun (cf. §3.1.bis — `tampons-bibliotheque.js:187` court-circuite aujourd'hui `validerZipSecurite` et `assainirObjet`). Faire passer tout import de tampon par `import-export.js`, comme les 5 autres types. | D-01, D-02, I-01 | 2-3 jours | Élevée |

### 8.2 Phasage recommandé

Quatre phases, du plus rapide et plus rentable au plus structurel.

#### Phase 0 — Quick wins — **LIVRÉE le 6 mai 2026**

Défenses livrées en une seule journée (toutes commitées sur `main`, beta 99.36, builds 0506-1300 → 0506-1430). Effort réel ~5 h, nettement sous l'estimation initiale de 12-18 j. Justification de cet écart : scope α systématique (livrer le 80 % de la valeur sans le 20 % long-tail) et arbitrages explicites sur les sous-actions reportées (B-β, K-β).

1. ✅ **Défense B-α** — Sanitisation profonde des imports (commit `f9f6865`). Sous-schémas pour `grille.criteres`, `echelle.niveaux`, `pratique.criteres`. Ajout des entrées manquantes `cartouche` (avec `commentaires` en `mapStrings`) et `tampon` dans `SCHEMAS_IMPORT`. Sous-schémas réutilisables `metadata_cc` et `inspireDe` sur les 6 schémas. Extension de `assainirObjet` avec deux nouveaux types (`mapStrings`, `stringOrNumber`). Branchement d'`assainirObjet` sur les 2 pipelines cartouches (`import-export.js:2118` configuration-complète + `import-export.js:2750` import sélectif). **Reste en B-β** : faire des 6 fonctions `ajouter*ALaBibliotheque` un passage obligé (nécessite d'abord modéliser exhaustivement `pratique.configuration`).

2. ✅ **Défense J** — Hook pré-commit (commit `48c1a2d`). Script `scripts/hooks/pre-commit` (bash, ~165 lignes) qui scanne le diff staged sur `.js` + `.html`, bloque les nouveaux `innerHTML` avec interpolation sans `echapperHtml`, avertit sur les écritures `db.set`/`localStorage.setItem` sur clés sensibles sans `assainirObjet` à proximité. Bypass légitime via commentaire `// security-ok: <raison>`. Installateur `scripts/install-hooks.sh` (configure `core.hooksPath`). Documentation `docs/securite/HOOKS-PRE-COMMIT.md`.

3. ✅ **Défense D** — Révocation FSAPI par défaut + opt-in (commit `d0a0903`). Préférence `fsapi_persistance_handles` (defaut `false`, secure-by-default) avec helpers `db.getFSAPIPersistance` / `db.setFSAPIPersistance` / `db.removeFSAPIHandle`. Pipelines `db.storeFSAPIHandle`/`getFSAPIHandle` et `reserve._lire/_ecrireHandlePersiste` deviennent no-op silencieux si pref désactivée. Module `js/securite-prefs.js` orchestre la migration silencieuse au boot et l'hydratation du toggle UI. Carte « Sécurité » dans Réglages > Préférences avec toggle « Mémoriser le dossier Travaux et la Réserve entre les sessions ».

4. ✅ **Défense P-α** — Sanitisation tampons (commit `a9eadae`). Exposition publique de `assainirObjet` / `assainirChaine` / `SCHEMAS_IMPORT` sur `window`. `tampons-bibliotheque.js:importerDansBibliotheque` passe chaque tampon par `assainirObjet(t, SCHEMAS_IMPORT.tampon)` avant push. `tampons-bibliotheque.js:importerFichier` impose des limites de surface (5 Mo fichier max, 200 tampons par import) — équivalent JSON de `validerZipSecurite`. **Décision de scope** : pas de migration vers le format ZIP (le format JSON reste pour les utilisateurs — le scope §8.1 « unifier sur le pipeline ZIP commun » a été révisé en accord avec Grégoire pour éviter du churn pour zéro gain sécurité après B-α).

5. ✅ **Défense H** — Sceau SHA-256 sur les exports (commit `404b924`). Module `js/securite-hash.js` (~190 l.) avec API `sceller`, `verifier`, `scellerLot`, `verifierLot` via Web Crypto. Canonicalisation par tri récursif des clés et exclusion des champs volatiles (`_hash_v1`, `dateImport`, `dateAjoutBiblio`, `dansBibliotheque`). Scellage à l'export config-complète et tampons. Vérification AVANT assainissement à l'import, accumulation des anomalies, message de succès enrichi. Dégradation gracieuse si Web Crypto indisponible.

6. ✅ **Défense K** — Whitelist de structure des exports (commit `0218d07`). Module `js/securite-export-validation.js` (~155 l.) avec 4 whitelists (codex, reserve, configurationComplete, tampons) + helpers `validerStructureZip` (regex) et `validerClesObjet` (clés). Branché sur les 4 pipelines : `codex.js` (avant `generateAsync`), `reserve.js` (avant compression), `import-export.js:exporterConfigurationComplete` (avant download), `tampons-bibliotheque.js:exporterBibliotheque` (avant download). Erreur → alerte + abort. **Reste en K-β** : preview UI du contenu d'un export avant download (suite UX, à la demande).

7. ✅ **Audit a priori baseline** (`docs/securite/audits/AUDIT-2026-05-06.md`). Script `scripts/audit-bibliotheques-securite.js` (lecture seule, 13 patterns testés). Résultat sur la base de Grégoire au 6 mai 2026 : 11 clés scannées, 0 trouvaille suspecte. Sert de baseline pour les audits trimestriels (cf. §A.3).

**Bilan Phase 0** : 7 défenses livrées, 6 commits sécurité sur `main` (b0506-1300 → b0506-1430). Couvre partiellement D-01, D-02, D-03, X-01, X-02, I-01, U-02, C-01, C-02. Les 6 bibliothèques sont à parité de protection à l'ingestion. Reste à compléter en B-β (passage obligé `ajouter*`) et K-β (preview UI). La couverture complète passe par Phase 1 (sandbox iframe, audit `innerHTML`, tests automatisés, wrapper destructif).

#### Phase 1 — Chantiers structurels (3-6 semaines)

Défenses qui exigent une refonte ou un effort soutenu, à planifier par chantiers.

6. **Défense E** — ~~Migration de `innerHTML` vers `textContent` ou construction DOM sur les modules d'affichage des 6 bibliothèques et leurs aperçus/wizards.~~ **PHASE 1 CLOSE — 12 mai 2026** (beta 99.42, builds 0512-0641 → 0512-XXXX, 21 commits sur `main`). Approche pragmatique pré-colloque : substitution mécanique uniforme `value="${X}"` → `value="${echapperHtml(X)}"` sur 20 fichiers JS en production (~105 occurrences). Zéro occurrence résiduelle hors `js/_archives/`. Plusieurs vrais bugs XSS latents corrigés en passant (texte interpolé brut dans `${cat.nom}`, `${g.nom}`, `${type.nom}`, etc.). Sentinelle anti-régression F.16 ajoutée dans `tests/unit/lint-securite.test.js`. Compteur global `audit-innerhtml.sh` passé de 119 → 112 suspects. Documentation : `docs/securite/DEFENSE-E-CLOSE.md`. **Migration EXHAUSTIVE** vers `textContent`/construction DOM (effort 1-2 semaines) **REJETÉE** pour pré-colloque — la sandbox iframe (Défense A livrée 8 mai 2026) neutralise déjà la mécanique I-01 sous-jacente en défense en profondeur. À reconsidérer post-colloque seulement si pertinent.
7. **Défense A** — ~~Sandbox iframe pour l'aperçu d'objets importés.~~ **LIVRÉE 8 mai 2026** (beta 99.38, builds 0508-0640 → 0508-0825, branche `feature/securite-defense-a-sandbox` — 5 commits). Composant `js/securite-apercu-sandbox.js` (origine opaque + CSP du parent durcie avec hash SHA-256 du messenger figé + `file:` dans `img-src` pour les SVG locaux), intégré dans les 6 modales d'aperçu d'import (grilles, échelles, productions, cartouches, pratiques de notation, tampons d'observation). 9 vecteurs d'évasion testés et bloqués. Tests documentés dans `docs/securite/audits/TESTS-DEFENSE-A-2026-05-08.md`. **Effort réel : 1 jour** (vs estimation 1 semaine). Hors scope v1 : aperçus internes dans `evaluation.js`/`wizard-pratique-v2.js` (matériel déjà sanitisé à l'import).
8. **Défense I** — ~~Suite de tests de sécurité automatisés.~~ **LIVRÉE 8 mai 2026** (beta 99.38, builds 0508-0940 → 0508-1100, branche `feature/securite-defense-i-tests` — 5 commits SP1-SP5 + fix-up findings ultrareview). Framework Vitest 2.x (fonctions pures) + Playwright 1.x WebKit headless (sandbox + CSP browser-real). 29 tests verts couvrant les 15 scénarios prévus : A×4 isolation Défense A, B×3 sanitisation profonde, C×3 validation imports, D×2 whitelist exports, E×2 intégration sandbox, F×1 lint statique innerHTML. Documentation : `docs/securite/TESTS-AUTOMATISES.md`. **Effort réel : ~½ jour** (vs estimation 1 semaine).
9. **Défense C** — Couche `js/garde-destructions.js` qui interpose des wrappers sur les APIs destructives. Refactor de `db.js` et `travaux-stockage.js`. **Effort : 1-2 semaines.**

**Bilan Phase 1** : neutralise techniquement D-01, D-02 (combinée avec H et M de Phase 2), D-03, X-01 (par sandbox iframe), réduit la surface de I-01, prévient les régressions C-01 et C-02 (Défense I tests automatisés livrée 8 mai 2026). Couverture étendue aux 6 bibliothèques (cf. §3.1.bis).

#### Phase 2 — Défenses long terme et signature (3-6 mois, conjointement avec décisions de gouvernance)

10. **Défense F** — Signature ECDSA + annuaire de clés publiques. Mécanisme complet de la `.claude/skills/securite-donnees/SKILL.md` §6.4. Implication gouvernance majeure : qui distribue les clés publiques, qui révoque ? **Effort technique : 2-3 semaines. Effort gouvernance : indéterminé.**
11. **Défense G** — Kill list + quarantaine + audit rétroactif. Module `js/quarantaine.js`. **Effort : 1 semaine + maintenance continue.**
12. **Défense L** — Modération humaine Voûte. Mécanisme et comité. **Effort : variable, dépend des partenariats institutionnels.**
13. **Défense M** — Détection à l'import des collisions par contenu (diff visuel). **Effort : 3-4 jours.**
14. **Défense N** — Renforcement CSP avec nonces. Test exhaustif de compatibilité Safari M3 et iPad M1. **Effort : 1-2 semaines.**
15. **Défense O** — Re-encodage des images à l'import. **Effort : 2-3 jours.**

**Bilan Phase 2** : couvre l'ensemble des scénarios à un niveau professionnel. Prêt pour ouverture multi-cégep de la Voûte.

#### Phase 3 — Maintenance continue (permanente)

16. **Audit de sécurité périodique** : tous les 3 mois ou à chaque release majeure. Documenté dans `docs/securite/audits/AUDIT-<date>.md`.
17. **Mise à jour des dépendances** (Chart.js, JSZip) avec audit de sécurité.
18. **Veille sur les nouveaux vecteurs** : navigateur évolue, nouveaux types d'attaque émergent, modèle à réviser.
19. **Révision du modèle de menaces** : mise à jour de ce document à chaque ajout de fonctionnalité majeure (Plan 2 partage CC, accès étudiant, sync P2P).

### 8.3 Effort total estimé

Recalibré le 6 mai 2026 après audit des 6 bibliothèques (§3.1.bis) et ajout de la Défense P.

- **Phase 0 (Quick wins)** : ~12-18 jours de travail effectif (Défense B 1-2j + H 1-2j + J 1-2j + D 1-2j + K 3-4j + P 2-3j). Réalisable en 3-5 semaines de calendrier.
- **Phase 1 (Structurels)** : ~6-8 semaines de travail effectif. Réalisable en 2-3 mois de calendrier.
- **Phase 2 (Long terme)** : ~8-12 semaines de travail technique + gouvernance. Plusieurs mois de calendrier.
- **Phase 3 (Maintenance)** : effort continu, ~2-3 jours par audit trimestriel.

**Total Phase 0+1+2** : environ 4-6 mois calendaires si Grégoire est seul à coder, à raison d'un effort de 2-3 jours/semaine sur la sécurité (le reste sur les autres chantiers du projet). L'extension aux 6 bibliothèques n'allonge pas significativement le total parce que le travail est concentré en Phase 0 (où Défense B + P sont quand même contenus dans la fenêtre 1-2 semaines de calendrier).

### 8.4 État du chantier au 6 mai 2026

Phase 0 livrée intégralement (cf. §8.2 ci-dessus). Les actions ci-dessous reflètent les suites possibles, classées par priorité.

**Suites courtes (1-2 jours chaque)** :

1. **B-β** — Faire des 6 fonctions `ajouter*ALaBibliotheque` un passage obligé qui appelle `assainirObjet` localement. Pré-requis : modéliser exhaustivement les champs légitimes — notamment `pratique.configuration` (typesTravaux, forfaits, portfolio, etc.) — pour éviter une régression silencieuse sur les créations locales. Bug latéral connu : `pratique.configuration` n'est pas dans `SCHEMAS_IMPORT.pratique` aujourd'hui, donc une pratique passée par le pipeline ZIP perd ce champ silencieusement. À traiter dans le même chantier.

2. **K-β** — Preview UI du contenu d'un export avant download. « Votre export contient les fichiers suivants : [...]. Continuer ? ». Suite UX de Défense K. Faible coût technique, valeur surtout pédagogique (l'utilisateur prend conscience de ce qui voyage).

**Suites structurelles (Phase 1, à planifier en chantiers dédiés)** :

3. ~~**Défense E (audit `innerHTML`)** — étape 1 (audit scripté, 1-2 j) en priorité pour quantifier la dette résiduelle réelle sur les modules d'aperçu/wizard non encore audités. Étape 2 (migration vers `textContent` ou construction DOM, 1-2 semaines selon le résultat de l'étape 1).~~ **PHASE 1 CLOSE 12 mai 2026** — cf. §8.2 défense E ci-dessus et `docs/securite/DEFENSE-E-CLOSE.md`.

4. ~~**Défense A (sandbox iframe)** — neutralise techniquement la mécanique I-01 sous-jacente à D-01 / X-01 / U-01.~~ **LIVRÉE 8 mai 2026** — cf. §8.2 Phase 1 défense A et `docs/securite/audits/TESTS-DEFENSE-A-2026-05-08.md`.

5. ~~**Défense I (tests sécurité automatisés)**~~ **LIVRÉE 8 mai 2026** — cf. §8.2 Phase 1 défense I et `docs/securite/TESTS-AUTOMATISES.md`.

6. **Défense C (wrapper destructif)** — couche de garde sur `localStorage.clear`, `indexedDB.deleteDatabase`, `removeEntry` FSAPI. Effort 1-2 semaines.

**Suites long terme (Phase 2)** : Défense F (signature ECDSA + annuaire) avant ouverture multi-cégep de la Voûte. Nécessite des décisions de gouvernance.

---

## 9. Annexes

### A. Procédures de détection consolidées

#### A.1 Détection a priori (préventive, avant incident)

Audit manuel à exécuter périodiquement (suggéré : à chaque ouverture de session de travail sécurité, ou tous les 15 jours).

```
DevTools › Application › IndexedDB › MonitoragePedagogique › keyvalue
```

Pour chaque clé suivante, inspecter le contenu et chercher les patterns suspects.

| Clé | Champs à inspecter | Patterns à chercher |
|---|---|---|
| `bibliothequeGrilles` | `nom`, `description`, `criteres[].nom`, `criteres[].description`, `metadata_cc` | `<script`, `<img`, `<svg`, `<iframe`, `onerror=`, `onload=`, `onclick=`, `javascript:`, `data:text/html`, `expression(` |
| `bibliothequeEchelles` | `nom`, `description`, `niveaux[].description`, `niveaux[].nom` | Idem |
| `cartouches_*` (toutes les clés préfixées) | Tous les champs textuels — pas de schéma `SCHEMAS_IMPORT` aujourd'hui (cf. §3.1.bis), donc surface plus exposée | Idem |
| `pratiquesConfigurables` | Tous les champs textuels, particulièrement `criteres[].description` et clés/valeurs de `ponderation` | Idem |
| `productions` (clé bibliothèque) | `nom`, `titre`, `description`, `activiteApprentissage` | Idem |
| `bibliothequeTampons` | `nom`, `description`, `categorie`, `imageBase64` (peut camoufler du contenu), `metadata_cc` — pas de schéma `SCHEMAS_IMPORT` aujourd'hui (cf. §3.1.bis) | Idem |
| `journal` (clé namespacée par trimestre) | Notes confidentielles | Idem |
| `keyvalue.travaux_fsapi_handle` | Présence | Vérifier que le handle est attendu, pas étranger |

#### A.2 Détection en cours d'attaque (temps réel)

Signaux à surveiller pendant l'utilisation de Labo Codex :

- **Console DevTools** : erreurs CSP (« Refused to connect to... », « Refused to execute inline script »). Une erreur CSP indique qu'une attaque a été tentée et bloquée — c'est un signal **positif** de défense, mais l'origine de l'attaque doit être tracée.
- **Onglet Network** : toute requête sortante. Labo Codex est censée être hors-ligne. Une requête vers un domaine externe est suspecte.
- **Mémoire/CPU** : un import qui fait exploser la mémoire ou geler l'app — ZIP bomb ou polyglotte volumineux.
- **Comportement UI anormal** : éléments qui apparaissent ou disparaissent sans action utilisateur, dialogues inhabituels, redirections.

#### A.3 Détection a posteriori (après incident suspecté)

Procédure d'investigation si tu suspectes une compromission.

1. **Ne pas redémarrer Labo Codex** avant d'avoir capturé l'état. Un payload peut effacer des traces au démarrage.
2. **Exporter l'état complet** : DevTools › Application › IndexedDB › clic droit `MonitoragePedagogique` › Export to JSON. Sauvegarder avec horodatage.
3. **Comparer à un backup antérieur** sain. Diff sur les clés sensibles.
4. **Inspecter le journal** (si présent) pour repérer le moment de bascule.
5. **Lister les imports récents** : grilles ajoutées dans les N derniers jours. Toute grille avec des champs textuels suspects est un candidat coupable.
6. **Si compromission confirmée** : exécuter la procédure §B (Réponse à incident).

### B. Procédure de réponse à incident

#### B.1 Confinement immédiat (priorité 1, dans l'heure)

1. **Couper l'accès à la Voûte** si possible (révoquer les credentials, isoler le compte).
2. **Faire un export complet de l'état actuel** pour analyse forensique. Même si les données sont compromises, l'état doit être préservé pour comprendre l'attaque.
3. **Bloquer les exports automatiques** pour éviter la propagation continue.
4. **Avertir les destinataires récents** d'exports : « ne pas importer le ZIP que je vous ai envoyé le X — un audit est en cours ».

#### B.2 Évaluation (priorité 2, dans les 24 h)

5. **Déterminer le périmètre** : quels comptes touchés, quelles données fuites/détruites, quels destinataires d'exports infectés.
6. **Identifier le vecteur** : quelle grille / pack / fichier a été le point d'entrée. Datation de l'import. Source.
7. **Évaluer l'obligation Loi 25** : si fuite de DA ou notes confidentielles d'étudiants, signalement à la CPVP requis dans les 72 h selon la nature.

#### B.3 Éradication (priorité 3, dans la semaine)

8. **Restaurer depuis un backup propre** antérieur à l'import suspect.
9. **Pour chaque destinataire d'export infecté** : procédure individuelle de nettoyage.
10. **Mettre à jour la kill list** (si Défense G implémentée) pour bloquer la grille coupable dans toutes les futures installations.
11. **Audit rétroactif** : grep tous les patterns suspects dans toutes les bibliothèques pour détecter d'autres infections.

#### B.4 Communication (priorité 3 parallèle)

12. **Avis aux utilisateurs** affectés (et à leurs cégeps si Loi 25 le requiert).
13. **Avis public** si l'incident est suffisamment grave pour entamer la confiance générale dans Labo Codex.
14. **Post-mortem** documenté dans `docs/securite/post-mortems/<date>-<incident>.md`. Patron : symptôme observé, vecteur exploité, cause racine, défense ajoutée pour prévenir.

#### B.5 Renforcement (priorité 4, dans le mois)

15. **Mettre à jour ce modèle de menaces** : si l'incident révèle un scénario non anticipé, l'ajouter au §7. Mettre à jour le tableau récapitulatif §6.
16. **Mettre à jour le `.claude/skills/securite-donnees/SKILL.md`** si une catégorie de menace doit être renforcée dans la doc maître.
17. **Implémenter la défense correspondante** si elle n'était pas en place ou prioritaire.

### C. Checklist code review sécurité

À utiliser à chaque PR (humain ou IA-assistée) qui touche un module sensible. Liste minimale des modules sensibles : `js/import-export.js`, `js/grilles*.js`, `js/echelles*.js`, `js/cartouches*.js`, `js/pratiques*.js`, `js/codex.js`, `js/db.js`, `js/reserve.js`, `js/travaux-stockage.js`, `js/travaux-import.js`, `index.html`.

#### C.1 Sanitisation et échappement

- [ ] Tout `innerHTML` interpolant une variable utilise `echapperHtml()` ou la variable est elle-même échappée à la source ?
- [ ] L'option `textContent` ou la construction DOM (`createElement` + `appendChild`) a été envisagée comme alternative plus sûre ?
- [ ] Tout import de JSON passe par `assainirObjet()` avec un schéma déclaré dans `SCHEMAS_IMPORT` ?
- [ ] Le schéma couvre **tous** les champs textuels, **y compris les sous-tableaux** (`criteres`, `niveaux`, `metadata_cc`) ?

#### C.2 Opérations destructives

- [ ] Aucun appel direct à `localStorage.clear()`, `indexedDB.deleteDatabase()`, ou `removeEntry()` FSAPI sans passer par une couche de garde ?
- [ ] Si la fonction supprime des données, demande-t-elle confirmation utilisateur via un mécanisme non-bypassable ?
- [ ] Les opérations destructives sont-elles journalisées dans `journal.js` ?

#### C.3 FSAPI

- [ ] Le code persiste-t-il un nouveau handle FSAPI ? Si oui, est-ce justifié ? Y a-t-il un opt-out ?
- [ ] Le handle est-il utilisé uniquement pour son périmètre légitime ?

#### C.4 Imports / exports

- [ ] Tout ZIP importé passe par `validerZipSecurite()` ?
- [ ] Tout fichier image / PDF passe par `validerMagicBytes()` ?
- [ ] Tout export ZIP a une whitelist d'entrées attendues ?
- [ ] L'export inclut-il un hash SHA-256 du contenu pour vérification d'intégrité ?

#### C.5 Métadonnées et identité

- [ ] Tout champ `auteur` ou `auteurOriginal` est-il marqué comme « non vérifié » dans l'UI tant que la signature n'est pas en place ?
- [ ] Les `metadata_cc` sont-elles distinguées visuellement des données vérifiées ?

#### C.6 Tests

- [ ] La modification est-elle couverte par un test de sécurité (injection XSS, ZIP slip, etc.) ?
- [ ] Le test échoue si la protection est retirée ?

#### C.7 Documentation

- [ ] Le commentaire en tête de la fonction sensible mentionne-t-il les contraintes de sécurité ?
- [ ] Le `MODELE-MENACES.md` reflète-t-il la nouvelle surface d'attaque introduite (s'il y en a une) ?

### D. Patron pour scénariser une nouvelle menace

À utiliser quand un nouveau vecteur d'attaque est identifié (incident, audit, veille). Documenter le scénario selon le patron suivant et l'ajouter au §7.

```markdown
#### <CODE> — <TITRE> (<COMPLET|COURT>)

##### Récit narratif
<Histoire concrète avec un personnage incarné, étapes vues du point de vue de la victime,
conclusion qui rend l'impact tangible. 2-5 paragraphes pour COMPLET, 1 pour COURT.>

##### Fiche technique

| Champ | Valeur |
|---|---|
| Code | <CODE> |
| Vecteur principal | <quel canal d'entrée> |
| Vecteurs secondaires | <quels autres canaux> |
| Profils d'attaquants | <listes des profils du §5> |
| Capacité technique requise | <Très faible / Faible / Moyenne / Élevée> |
| Probabilité (estimation) | <Très faible / Faible / Moyenne / Moyenne-Élevée / Élevée> |
| Impact | <Moyen / Élevé / Critique / CATASTROPHIQUE> |
| Données touchées | <liste précise> |
| Statut défensif actuel | <Aucun / Insuffisant / Partiel / Bon> |

##### Étapes
<Numérotées 1, 2, 3... du point de vue de l'attaquant.>

##### Cause racine
<C1, C2, C3... — chacune décrit pourquoi le code actuel rend l'attaque possible.
Référencer le code par fichier:ligne quand pertinent.>

##### Défenses requises
<P1, P2, P3... priorisées. Pour chaque :
- *Quoi* : ...
- *Où* : ...
- *Comment* (optionnel, exemple de code) : ...
- *Effort estimé* : ...
- *Limite* : ce que cette défense ne protège pas.>

##### Signaux de détection
<Comment repérer l'attaque, en cours ou post-mortem.>

##### Limites
<Ce que les défenses combinées ne couvrent toujours pas.>

##### Zones d'incertitude
<Ce qui reste à vérifier dans le code, à tester, à décider.>
```

Ajouter le scénario au tableau récapitulatif §6 avec une ligne formatée comme les autres. Mettre à jour les défenses transversales §8.1 si la nouvelle menace appelle une défense déjà listée ou en introduit une nouvelle.

### E. Références

#### Documents internes Labo Codex

- `.claude/skills/securite-donnees/SKILL.md` — Document fondateur (26 avril 2026). Classification des données, modèle M1-M8, anonymisation, intégrité, gouvernance Voûte, questions Loi 25.
- `.claude/skills/hygiene-donnees-partagees/SKILL.md` — Principes universels (5 principes, 5 anti-patterns, checklist 4 points). Source des règles de fusion / merge / import sur stockage partagé.
- `.claude/skills/integrite-globaux/SKILL.md` — Instanciation Labo Codex de l'hygiène. Incidents réels, regex testées, commits de référence.
- `docs/architecture/ECOSYSTEME-DONNEES.md` (à vérifier — référencé dans `.claude/skills/securite-donnees/SKILL.md`).
- `docs/architecture/SPEC-RESERVE-V1.md` — Spécification du format Réserve.
- `docs/PLAN2-PHASE1-SPEC.md` — Spec partage CC entre utilisateurs (à protéger avant ouverture).
- `docs/audit-securite-imports-tier2.5.md` — Audit existant des imports.
- `docs/POST-MORTEM-PHASE5-22-AVRIL.md` — Post-mortem antérieur, source d'enseignements.
- `CLAUDE.md` — Règles de sécurité opérationnelles, principe « Stabilité zéro-dette ».

#### Code source de référence

- `js/import-export.js` lignes 21 (`validerZipSecurite`), 66 (`verifierUniciteIds`), 206 (`assainirChaine`), 221 (`assainirObjet`), 275 (`SCHEMAS_IMPORT`).
- `js/travaux-import.js` ligne 35 (`validerMagicBytes`).
- `js/grilles-bibliotheque.js` ligne 77 (`ajouterGrilleALaBibliotheque`), 125 (`importerGrillesDansBibliotheque`).
- `js/db.js` lignes 766 (`storeFSAPIHandle`), 788 (`getFSAPIHandle`), 475-486 (effacement), 1060-1107 (`indexedDB.deleteDatabase` legacy).
- `js/reserve.js` lignes 246, 885-887 (FSAPI Réserve).
- `js/travaux-stockage.js` lignes 54-60 (FSAPI Travaux).
- `index.html` ligne 6 (CSP).
- `js/cc-license.js` (à inspecter pour `metadata_cc`).

#### Frameworks et standards externes

- **STRIDE** — modèle de classification des menaces (Spoofing, Tampering, Repudiation, Information disclosure, Denial of service, Elevation of privilege). Repris partiellement dans la structure des catégories D/X/I/U/C de ce document.
- **OWASP Top 10** — référence pour les vulnérabilités web. Particulièrement pertinent : A03:2021 Injection (XSS), A07:2021 Identification and Authentication Failures (usurpation), A08:2021 Software and Data Integrity Failures.
- **OWASP XSS Filter Evasion Cheat Sheet** — référence pour tester la robustesse de `assainirChaine` (cf. zone d'incertitude I-01.2).
- **NIST SP 800-218** — Secure Software Development Framework.
- **Loi 25 (Québec)** — Loi sur la protection des renseignements personnels dans le secteur privé, modernisée 2021. Articles 4, 12, 90.1 (signalement d'incident).
- **CC BY-NC-SA 4.0** — licence des dépôts Voûte. Texte : `https://creativecommons.org/licenses/by-nc-sa/4.0/legalcode.fr`.

#### APIs Web utilisées dans les défenses proposées

- **Web Crypto API** : `crypto.subtle.digest('SHA-256', ...)` pour les hashes de référence (Défense H), `crypto.subtle.sign()` / `verify()` pour la signature ECDSA (Défense F). Disponible nativement sur Safari M3 et iPad M1.
- **File System Access API** : déjà utilisée (`showDirectoryPicker`, `getDirectoryHandle`, `removeEntry`). Documentation MDN.
- **Iframe sandbox** : attribut `sandbox` sur `<iframe>`, valeurs `allow-scripts`, `allow-same-origin`. Pour Défense A, utiliser `sandbox="allow-scripts"` sans `allow-same-origin` pour bloquer l'accès à l'IndexedDB du parent.

---

## Historique du document

| Date | Version | Changement |
|---|---|---|
| 2026-05-06 | 1.0 | Création. Périmètre : vecteurs prioritaires Voûte/grilles + Import codex/data/archives. 14 scénarios (7 complets + 7 courts). Plan de défense priorisé en 3 phases. Annexes complètes. |
| 2026-05-06 | 1.1 | Corrections post-revue : (1) précision sur le call-site `grilles.js:2489` (D-01 §3 et §C2) — il appelle `importerGrillesDansBibliotheque`, pas `ajouterGrilleALaBibliotheque`. (2) Nuance sur l'ampleur de la dette `innerHTML` legacy (D-01 §C4 et I-01 §C1) — audit ciblé montre une dette résiduelle faible (< 5 %) sur les modules sensibles principaux, mais non quantifiée sur les aperçus/wizards. (3) Extension de l'audit aux 6 bibliothèques partagées (nouveau §3.1.bis) — découverte que cartouches et tampons n'ont pas d'entrée dans `SCHEMAS_IMPORT` ; tampons ont en plus un canal d'import isolé. (4) Plan de défense réajusté en conséquence : Défense B passe de 4-6 h à 1-2 j et couvre les 6 types ; nouvelle Défense P (unification du pipeline d'import tampons) ; Défenses E/H/K/M étendues aux 6 types ; Phase 0 recalibrée à 12-18 j ; §6 et §A.1 actualisés pour mentionner les 6 bibliothèques. |
| 2026-05-06 | 1.2 | **Phase 0 livrée intégralement** en une journée (beta 99.36, builds 0506-1300 → 0506-1430). 7 défenses, 6 commits sécurité sur `main` : audit a priori baseline (`AUDIT-2026-05-06.md`), B-α sanitisation profonde (`f9f6865`), J hook pré-commit (`48c1a2d`), D révocation FSAPI (`d0a0903`), P-α sanitisation tampons (`a9eadae`), H sceau SHA-256 (`404b924`), K whitelist exports (`0218d07`). Effort réel ~5 h vs estimation 12-18 j — écart justifié par le scope α systématique (80 % de la valeur sans le 20 % long-tail). §8.2 mis à jour pour refléter l'état livré ; §8.4 remplace l'ordre suggéré par un état + suites possibles ; §6 reflète le nouveau statut défense par scénario. Reste : B-β (passage obligé `ajouter*`), K-β (preview UI export), Phase 1 (sandbox iframe, audit `innerHTML`, tests automatisés, wrapper destructif), Phase 2 (signature ECDSA + gouvernance). |
| 2026-05-06 | 1.3 | **Suites α + Défense E** livrées dans la même journée (builds 0506-1450 → 0506-1530, commits `c431ae4` à `d9bc49c`). (1) **B-β** — passage obligé `assainirObjet` dans les 6 fonctions `ajouter*ALaBibliotheque` ; `SCHEMAS_IMPORT.pratique` enrichi (`configuration` brut, `pratiques`, `seuils`, `echelleId`, `estGabarit`) ; bug latéral `pratique.configuration` perdu à l'import résolu. (2) **K-β** — preview UI avant download des 4 pipelines d'export (modale `createElement` + `textContent`, CSP-compatible). (3) **E-α** — script `scripts/audit-innerhtml.sh` ré-exécutable + rapport baseline `AUDIT-INNERHTML-2026-05-06.md` (125 cas suspects sur 699 innerHTML totaux). Correctif pour reconnaître `escapeHtml` (variante anglaise) et le contexte multi-ligne. (4) **E-β** — examen ciblé des 22 cas suspects dans les modules prioritaires §8.2 défense E. Découverte d'un **vrai vecteur D-01 critique** dans `js/cc-license.js:genererBadgeCC` : 5 champs metadata (`nom`, `auteur_original`, `contributeurs[].nom/date/modifications`) interpolés sans échappement, alors que la fonction est appelée par les modals d'aperçu d'import des 4 types pédagogiques AVANT la sanitisation des ressources. Fix unique sur `genererBadgeCC` (`echapperHtmlCC` ajouté sur les 5 interpolations) couvre les 4 modals simultanément. Rapport `AUDIT-INNERHTML-FINDINGS-2026-05-06.md`. **Recommandation pour Phase 1** : prioriser Défense A (sandbox iframe) plutôt que migration massive — la dette `innerHTML` réelle est faible et la sandbox neutralise la mécanique I-01 sous-jacente. |
| 2026-05-08 | 1.4 | **Défense A (sandbox iframe) livrée** (beta 99.38, builds 0508-0640 → 0508-0825, branche `feature/securite-defense-a-sandbox` — 5 commits). Composant `js/securite-apercu-sandbox.js` (≈300 l.) intégré dans les 6 modales d'aperçu d'import (grilles, échelles, productions, cartouches, pratiques de notation, tampons d'observation). Mécanisme : `<iframe sandbox="allow-scripts allow-popups">` sans `allow-same-origin` → origine opaque, pas d'accès au localStorage / IDB / DOM du parent. CSP du parent durcie : `'sha256-…'` codé en dur pour le messenger figé + `file:` ajouté à `img-src` (Safari intersecte les CSPs, donc le meta interne n'a pas d'effet — la CSP du parent est l'unique source de vérité). Tests d'isolation : 9 vecteurs d'évasion testés depuis l'iframe (parent.localStorage lecture/écriture, parent.document, top.location, fetch, XHR, cookies, alert, img onerror) — 9/9 bloqués. Rapport complet : `docs/securite/audits/TESTS-DEFENSE-A-2026-05-08.md`. **Statut défense par scénario** : D-01, X-01, I-01 passent de Partiel à **Bon**. **Bugs latéraux corrigés** pendant la validation à l'usage : (a) `fermerModalImport*.parentElement.remove()` qui effaçait `<body>` quand la bibliothèque était ouverte (cause : 5 `querySelector('.modal-js-overlay')` ambigus), fix par classes dédiées `modal-import-{nom}` ; (b) `BibliothequeUI.creerModal` rendue idempotente (empilement après import → 2-click X) ; (c) `afficherBibliothequePratiques` rendue idempotente (DIY hors creerModal) ; (d) `.notification-succes` z-index 9999 → 11000 (cachée derrière la bibliothèque) ; (e) format de la modale d'import cartouches aligné sur les classes DS standard. **Hors scope v1** : aperçus internes dans `evaluation.js` et `wizard-pratique-v2.js` (matériel déjà sanitisé par le pipeline d'import). **Backlog** : #263 étendu pour couvrir l'alignement DS de la modale `modalMetadonneesEnrichies` (signalée pendant les tests, identique pour les 6 types). |
| 2026-05-12 | 1.5 | **Défense E Phase 1 close** (beta 99.42, builds 0512-0641 → 0512-XXXX, 21 commits directs sur `main`). Approche pragmatique pré-colloque : substitution mécanique uniforme `value="${X}"` → `value="${echapperHtml(X)}"` sur 20 fichiers JS en production (~105 occurrences). Zéro occurrence résiduelle hors `js/_archives/`. Plus de 15 vrais bugs XSS latents corrigés en passant (textes interpolés bruts dans `${cat.nom}`, `${g.nom}`, `${type.nom}`, etc.). `echapperHtml` amélioré pour gérer correctement les types primitifs (0, false, NaN). Sentinelle anti-régression F.16 ajoutée dans `tests/unit/lint-securite.test.js`. Baseline F.15 abaissée de 120 → 115 (compteur `audit-innerhtml.sh` : 119 → 112 suspects). Documentation complète : `docs/securite/DEFENSE-E-CLOSE.md`. **Migration EXHAUSTIVE** `innerHTML` → `textContent` (effort 1-2 sem) REJETÉE pour pré-colloque — la sandbox iframe (Défense A) neutralise déjà la mécanique I-01 en défense en profondeur. |

À mettre à jour à chaque révision.

---

**Fin du document.**

