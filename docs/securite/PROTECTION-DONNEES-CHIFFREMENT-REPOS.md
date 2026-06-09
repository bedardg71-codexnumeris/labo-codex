# Protection des données — Chiffrement au repos

> **Document autonome** — première version : 6 mai 2026.
>
> **Question d'origine (Grégoire)** : comment protéger les micro-data recueillies par un enseignant (notes individuelles, présences, indices, photos de travaux, journal confidentiel, identités étudiantes) qui vivent dans IndexedDB.
>
> **Angle traité** : le **chiffrement au repos**, c'est-à-dire la protection des données pendant qu'elles sont stockées dans IndexedDB et que personne n'utilise activement l'app. Premier des trois documents de la série « Protection des données vivantes ». Les deux autres traitent du versioning (doc B) et de l'anonymisation pour le partage (doc C).
>
> **Préliminaire pour Grégoire** : tu m'as dit ne pas maîtriser la cryptographie. Ce document est rédigé en partant de ce constat — analogies concrètes, jargon traduit, et distinction claire entre ce que tu dois comprendre pour décider et ce que tu peux déléguer à Claude Code pour l'implémentation. La cryptographie est mathématique, mais les choix qui te concernent sont surtout des choix de produit (UX, ergonomie, gestion d'urgence) que tu es parfaitement qualifié pour faire.

---

## Table des matières

1. [Pourquoi chiffrer les données au repos](#1-pourquoi-chiffrer-les-données-au-repos)
2. [Comment IndexedDB stocke aujourd'hui : l'état actuel](#2-comment-indexeddb-stocke-aujourdhui--létat-actuel)
3. [Le chiffrement, expliqué sans formules](#3-le-chiffrement-expliqué-sans-formules)
4. [Quelles données chiffrer ?](#4-quelles-données-chiffrer-)
5. [La question centrale : d'où vient la clé ?](#5-la-question-centrale--doù-vient-la-clé-)
6. [Trois modèles de gestion de la clé](#6-trois-modèles-de-gestion-de-la-clé)
7. [Architecture proposée pour Labo Codex](#7-architecture-proposée-pour-labo-codex)
8. [L'UX du chiffrement](#8-lux-du-chiffrement)
9. [Que se passe-t-il si on perd la clé ?](#9-que-se-passe-t-il-si-on-perd-la-clé-)
10. [Impact sur les exports, la Réserve, la Voûte](#10-impact-sur-les-exports-la-réserve-la-voûte)
11. [Ce que le chiffrement au repos NE protège PAS](#11-ce-que-le-chiffrement-au-repos-ne-protège-pas)
12. [Plan de mise en œuvre en trois phases](#12-plan-de-mise-en-œuvre-en-trois-phases)
13. [Questions ouvertes pour Grégoire](#13-questions-ouvertes-pour-grégoire)
14. [Synthèse en une page](#synthèse-en-une-page)

---

## 1. Pourquoi chiffrer les données au repos

Imagine trois situations concrètes.

**Situation A — Ton Mac passe au service de réparation.** Tu as un problème matériel, tu apportes ton MacBook chez un revendeur Apple ou un service tiers. Le technicien démarre la machine, contourne le mot de passe (procédure de service standard avec un disque externe d'amorçage), monte ton disque, et accède à tes fichiers. Les fichiers IndexedDB de Safari sont dans `~/Library/Safari/LocalStorage/` et `~/Library/Containers/.../IndexedDB/`. Aujourd'hui, ces fichiers sont en clair. Le technicien peut, s'il veut, ouvrir le fichier de base de données, parser le format SQLite/LevelDB, et lire tous les noms, DA, notes confidentielles de tes 84 étudiants. Il ne le fera probablement pas — mais il **peut**.

**Situation B — Tu prêtes ton Mac à un collègue.** Un dépannage de cinq minutes, vraiment. Tu lui passes ton ordinateur ouvert. Il ouvre Safari pour vérifier quelque chose, il appuie sur `Cmd+Option+I` pour accéder aux outils de développement (peut-être par curiosité, peut-être par mégarde), navigue vers l'onglet Application › IndexedDB › MonitoragePedagogique. Il voit ton codex actif, tes étudiants, ton journal confidentiel. Tu n'as rien fait de mal — c'est ton ami, c'est ton Mac, c'est une situation normale — mais tu viens de partager involontairement des données sensibles.

**Situation C — Ton Mac est volé.** Il est verrouillé par mot de passe. FileVault est activé (vérifie : Réglages › Confidentialité et sécurité › FileVault). Si oui, le voleur ne peut pas accéder au contenu sans ton mot de passe — c'est la première ligne de défense, robuste. Si FileVault n'est pas activé, le voleur peut démarrer sur un disque externe, monter ta partition, et lire tes fichiers IndexedDB comme dans la situation A. **Le chiffrement au repos applicatif est une deuxième ligne de défense en cas de défaillance de la première.**

Ces trois situations partagent un point commun : **les données sont accessibles parce qu'elles vivent en clair dans IndexedDB**. Le chiffrement au repos consiste à les transformer en charabia tant qu'une clé spécifique n'est pas fournie. Un attaquant qui ouvre le fichier de base voit du bruit indéchiffrable, pas tes noms d'étudiants.

### 1.1 Pertinence pour la Loi 25 (Québec)

Le `SKILL_Securite_donnees.md` §1.1 classe les noms, DA, numéros de groupe comme CRITIQUE — des renseignements personnels identifiants. Le DA est particulièrement sensible (identifiant inter-institutionnel, fuite permettrait le croisement avec d'autres systèmes). La Loi 25, dans son article 10, exige que les responsables du traitement de renseignements personnels « prennent les mesures de sécurité propres à assurer la protection des renseignements personnels collectés [...] et qui sont raisonnables compte tenu, notamment, de leur sensibilité, de la finalité de leur utilisation, de leur quantité, de leur répartition et de leur support ».

Le chiffrement n'est pas explicitement requis par la loi, mais la jurisprudence et les guides d'application de la CPVP (Commission d'accès à l'information) le considèrent comme une mesure « raisonnable » pour les renseignements identifiants stockés numériquement, surtout sur des supports portables comme un MacBook.

Concrètement : **si tu subis un incident de fuite et que les données étaient en clair sans justification, ta responsabilité régulatoire est plus engagée que si elles étaient chiffrées**.

### 1.2 Ce que le chiffrement au repos résout, ce qu'il ne résout pas

**Résout** :
- Vol physique de la machine quand l'app est fermée.
- Accès par un autre utilisateur du Mac (autre compte, session simultanée).
- Inspection involontaire par DevTools.
- Compromission de FileVault ou contournement de l'authentification système.
- Conformité Loi 25 sur les données au repos.

**Ne résout pas** :
- Quand l'app tourne et que les données sont chargées en mémoire, elles sont déchiffrées. Un payload XSS qui s'exécute pendant ta session voit les données déchiffrées.
- Si la clé est faible (mot de passe trivial), un attaquant peut la deviner par force brute.
- Si la clé est compromise (interception, vol), tout est lisible.
- Les sauvegardes externes (clé USB, iCloud) si elles ne sont pas chiffrées séparément.

Le chiffrement au repos est une **couche** de défense, pas une solution globale. Combiné avec FileVault (chiffrement disque par macOS), avec la sandbox iframe pour les aperçus (Défense A du `MODELE-MENACES.md`), avec le verrouillage de session, il forme un dispositif solide.

---

## 2. Comment IndexedDB stocke aujourd'hui : l'état actuel

Pour comprendre ce qu'on protège, il faut savoir ce qui est exposé. Voici à quoi ressemble IndexedDB sur ton Mac, sans aucun chiffrement.

### 2.1 Emplacement physique

Pour Safari (navigateur principal probable sur ton M3), les fichiers IndexedDB de Labo Codex vivent à peu près à :

```
~/Library/Safari/Databases/___IndexedDB/file__0/MonitoragePedagogique/
```

Pour Chrome/Edge :

```
~/Library/Application Support/Google/Chrome/Default/IndexedDB/file__0.indexeddb.leveldb/
```

Ce sont des dossiers contenant des fichiers de base de données (format LevelDB pour Chrome, SQLite pour Safari). Sur un Mac sans FileVault, n'importe qui avec un accès au disque peut lire ces fichiers.

### 2.2 Inspection via DevTools

Bien plus simple que le chemin filesystem : DevTools.

1. Ouvre Labo Codex dans Safari.
2. Active le menu Développer (Safari › Réglages › Avancés › cocher « Afficher Développer dans la barre de menus »).
3. Développer › Afficher l'inspecteur Web (`Cmd+Option+I`).
4. Onglet Stockage › Bases de données › `MonitoragePedagogique` › `keyvalue`.

Tu verras toutes les clés de ton codex. Clique sur `h2026_groupeEtudiants` (par exemple). Tu vois un tableau d'objets avec `nom`, `prenom`, `da`, `programme`, etc., en clair. Pareil pour `h2026_journal` qui contient tes notes confidentielles.

**Cette inspection ne demande aucun privilège spécial.** N'importe quel utilisateur du Mac peut le faire. Le chiffrement au repos vise précisément à ce que cette inspection ne révèle que du bruit.

### 2.3 Contenu typique d'une clé sensible

Pour fixer les idées, voici à quoi ressemble une entrée typique de `groupeEtudiants` :

```json
{
  "id": "etu_001",
  "nom": "Tremblay",
  "prenom": "Marie-Hélène",
  "da": "2024567",
  "groupe": "00001",
  "coursId": "601-103-MQ",
  "programme": "Sciences humaines",
  "courriel": "marie.tremblay@etu.cegep.qc.ca",
  "dateNaissance": "2007-03-15",
  "remarques": "Dyslexie diagnostiquée. Adaptation : temps supplémentaire 33%."
}
```

Chaque champ a sa propre sensibilité. Le nom et le DA sont CRITIQUE. La remarque sur la dyslexie est SENSIBLE (donnée médicale indirecte). Le programme et le groupe sont moins sensibles isolément mais participent à la ré-identification.

Le journal confidentiel (`h2026_journal` ou équivalent) est encore plus sensible — il contient les notes de l'enseignant sur les difficultés, observations comportementales, suspicions de troubles, situations familiales. C'est typiquement le bloc le plus précieux à chiffrer.

---

## 3. Le chiffrement, expliqué sans formules

Le chiffrement transforme une donnée lisible en charabia mathématique grâce à une **clé**. Avec la clé, on peut faire l'opération inverse (déchiffrer). Sans la clé, on est devant du bruit indéchiffrable.

### 3.1 Analogie

Imagine que tu écris une lettre dans une langue inventée que toi seul connais. Tu donnes le dictionnaire de ta langue (la clé) à ta sœur. Quand tu lui écris, tu chiffres avec ton dictionnaire. Elle lit avec le sien. Quelqu'un qui intercepte la lettre voit un texte étrange, illisible. Sans dictionnaire, il est bloqué.

Le chiffrement informatique fait pareil avec des opérations mathématiques au lieu d'un dictionnaire. La force tient au fait que :

- Les algorithmes (AES, ECDSA, etc.) sont publics — tout le monde connaît la méthode. La sécurité ne vient pas du secret de la méthode.
- La sécurité vient du **secret de la clé**. Une clé suffisamment longue (256 bits par exemple, soit 32 octets) ne peut pas être devinée par force brute avec les ordinateurs actuels — il faudrait plus de temps que l'âge de l'univers.

### 3.2 Symétrique vs asymétrique

**Chiffrement symétrique** : une seule clé sert à chiffrer et à déchiffrer. Comme un cadenas et sa clé. Algorithme standard : **AES-GCM** (Advanced Encryption Standard - Galois/Counter Mode). Rapide, robuste, recommandé pour les données au repos.

**Chiffrement asymétrique** : deux clés — une publique (qu'on diffuse) et une privée (qu'on garde). Tout le monde peut chiffrer avec la clé publique ; seule la clé privée déchiffre. Algorithmes : RSA, ECDSA, EdDSA. Utilisé pour les signatures et l'échange de clés, pas pour le chiffrement de gros volumes.

**Pour Labo Codex au repos** : on veut du symétrique (AES-GCM-256). Tu chiffres avec ta clé, tu déchiffres avec ta clé. Pas besoin de clé publique pour cet usage.

### 3.3 La clé doit venir de quelque part

C'est le problème central. La clé fait 256 bits — c'est trop pour qu'un humain la retienne. On ne peut pas simplement demander à Grégoire de taper « cQ7$pZx2vB9!nW4@... ». Donc on **dérive** la clé d'un secret plus facile à manipuler — typiquement un mot de passe utilisateur.

L'opération de dérivation est une fonction qui prend un mot de passe court (« MonChat42! ») et le transforme déterministiquement en clé de 256 bits. Algorithmes standards : **PBKDF2** (vieux mais répandu) et **Argon2** (moderne, recommandé). Ces fonctions sont **lentes par construction** — pour qu'un attaquant qui tenterait de deviner le mot de passe par force brute mette beaucoup de temps à essayer chaque candidat.

### 3.4 Ce que tu dois retenir

- Le chiffrement au repos protège tant que la clé reste secrète.
- La clé peut venir d'un mot de passe, de Touch ID, ou d'une combinaison.
- Sans la bonne clé, les données sont mathématiquement inaccessibles — pas avec les ordinateurs actuels ni les ordinateurs quantiques de la prochaine décennie (pour AES-256, qui résiste aux algorithmes quantiques connus).
- Si tu **perds** la clé (oubli du mot de passe), les données sont **perdues définitivement**. Pas de récupération possible. C'est par construction.

Ce dernier point est le compromis fondamental du chiffrement et c'est ce qui exige une stratégie de récupération soignée (voir §9).

---

## 4. Quelles données chiffrer ?

Tout chiffrer est tentant mais a un coût : performance, complexité, ergonomie. La question raisonnable est : **quelles clés contiennent des données suffisamment sensibles pour justifier le chiffrement ?**

### 4.1 Classification appliquée à Labo Codex

En reprenant la classification du `SKILL_Securite_donnees.md` §1 :

| Clé IndexedDB (exemples) | Contenu | Classification | À chiffrer ? |
|---|---|---|---|
| `<trim>_groupeEtudiants` | Nom, prénom, DA, programme, courriel, dateNaissance | **CRITIQUE** | **Oui — priorité 1** |
| `<trim>_journal` | Notes confidentielles enseignant (dyslexie, situation familiale) | **CRITIQUE** | **Oui — priorité 1** |
| `<trim>_evaluations` | Notes individuelles par étudiant | **SENSIBLE** | **Oui — priorité 2** |
| `<trim>_presences` | Patterns de présence par DA | **SENSIBLE** | **Oui — priorité 2** |
| `<trim>_indices_ACPE` | Indices A-C-P par étudiant | SENSIBLE | Oui — priorité 2 |
| Fichiers blob (photos manuscrites) | Écriture manuscrite biométrique | **CRITIQUE** | **Oui — priorité 1, mais coûteux** |
| `bibliothequeGrilles` | Grilles d'évaluation | Non sensible | Non |
| `bibliothequeEchelles` | Échelles | Non sensible | Non |
| `cartouches_*` | Commentaires types | Non sensible | Non |
| `pratiquesConfigurables` | Configurations pédagogiques | Non sensible | Non |
| `cours`, `enseignants`, `infoCours` | Métadonnées institutionnelles, nom enseignant, courriel | Semi-sensible | À discuter |
| `preferences-v2` | Préférences UI | Non sensible | Non |

### 4.2 Stratégie recommandée : chiffrement sélectif

Plutôt que de tout chiffrer (complexité élevée, performance dégradée), chiffrer **seulement les clés CRITIQUE et SENSIBLE**. Les bibliothèques pédagogiques, qui font l'essentiel du volume, restent en clair — c'est cohérent puisqu'elles sont conçues pour être partagées (CC BY-NC-SA).

Avantages :
- Effort de migration ciblé.
- Performance impactée seulement sur les clés sensibles, pas sur la lecture de bibliothèques.
- Si l'utilisateur perd sa clé, les bibliothèques (patrimoine partageable) restent récupérables.
- Cohérent avec le principe « les bibliothèques peuvent voyager, les identités ne doivent pas ».

### 4.3 Cas des photos manuscrites

Les blobs (photos de copies) sont classés CRITIQUE parce que l'écriture manuscrite est biométriquement identifiante (`SKILL_Securite_donnees.md` §1.3). Les chiffrer est techniquement faisable mais a un coût plus élevé :

- Volume : un dossier `Monitorage_Travaux` peut peser plusieurs Go. Chiffrement/déchiffrement de chaque photo à chaque consultation = latence visible.
- Stockage : les blobs vivent souvent hors IndexedDB (via FSAPI sur disque, dans `Monitorage_Travaux`). Chiffrer ces fichiers est faisable mais nécessite une couche d'abstraction supplémentaire dans `travaux-stockage.js`.

**Recommandation pragmatique** : commencer par les clés IndexedDB (Phase 1 et 2 du plan §12). Traiter les blobs disque dans une phase ultérieure si nécessaire, en s'appuyant sur le chiffrement de filevault de macOS comme première ligne.

---

## 5. La question centrale : d'où vient la clé ?

Comme expliqué en §3.3, la clé de chiffrement doit être **dérivée** de quelque chose. Pour un utilisateur final qui ne va pas retenir 256 bits, trois sources possibles :

1. **Un mot de passe** que l'utilisateur saisit à l'ouverture de l'app.
2. **Une authentification biométrique** (Touch ID sur Mac, Face ID sur iPad) via Web Authentication API.
3. **Une combinaison** des deux ou plus.

Chaque option a des compromis distincts en termes de sécurité, ergonomie, et résilience à la perte. Le §6 développe les trois modèles.

### 5.1 Ce qui caractérise une bonne source de clé

- **Disponible** : l'utilisateur peut la fournir à chaque session sans frustration.
- **Secrète** : seul l'utilisateur la connaît / la possède.
- **Difficile à compromettre** : pas vulnérable à un keylogger, à un raccourci clavier, à une devinette facile.
- **Récupérable en cas de perte** : si l'utilisateur oublie son mot de passe ou casse son Mac (Touch ID indisponible), une procédure de récupération existe.

Ces quatre critères sont partiellement contradictoires. Plus une clé est sûre, plus elle est difficile à retenir. Plus elle est facile à récupérer, plus elle est vulnérable. Le bon compromis dépend de **ton modèle de menace personnel** et de **ta tolérance au risque de perte**.

---

## 6. Trois modèles de gestion de la clé

### 6.1 Modèle 1 — Mot de passe seul

**Principe** : à l'ouverture de Labo Codex, l'utilisateur saisit un mot de passe. Ce mot de passe est dérivé en clé via PBKDF2 ou Argon2. La clé est gardée en mémoire pendant la session, jamais persistée.

**Avantages** :
- Simple à implémenter.
- Aucune dépendance matérielle (fonctionne sur tout navigateur, tout OS).
- L'utilisateur garde le contrôle total — pas de dépendance à Apple ou à un service tiers.

**Inconvénients** :
- Friction à chaque ouverture (saisie du mot de passe).
- Si le mot de passe est faible, vulnérable à la force brute.
- Si l'utilisateur l'oublie, données perdues définitivement.

**Pour qui** : utilisateur autonome, qui priorise l'indépendance et accepte la friction.

**Implémentation** :

```javascript
// Pseudo-code — concepts pédagogiques, pas du code prêt à coller
async function deriverCleDepuisMotDePasse(motDePasse, sel) {
  // 1. Convertir le mot de passe en bytes
  const encoder = new TextEncoder();
  const motDePasseBytes = encoder.encode(motDePasse);
  
  // 2. Importer comme matériel cryptographique
  const cleMatiere = await crypto.subtle.importKey(
    'raw', motDePasseBytes, 'PBKDF2', false, ['deriveBits', 'deriveKey']
  );
  
  // 3. Dériver la clé AES-256 — l'opération est volontairement lente
  return await crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: sel, iterations: 250000, hash: 'SHA-256' },
    cleMatiere,
    { name: 'AES-GCM', length: 256 },
    false, // non extractable — la clé reste dans l'enclave du navigateur
    ['encrypt', 'decrypt']
  );
}
```

Le `sel` est une chaîne aléatoire de 16 octets, générée à la création du compte et stockée en clair dans IndexedDB. Sa fonction : empêcher les attaques par tables précalculées (rainbow tables). Le sel n'a pas besoin d'être secret.

### 6.2 Modèle 2 — Touch ID (Web Authentication)

**Principe** : à l'ouverture, l'utilisateur pose son doigt sur Touch ID (Mac M3) ou Face ID (iPad M1). L'authentification biométrique débloque l'accès à une clé stockée dans la Secure Enclave du Mac, qui sert à déchiffrer une clé maître stockée dans IndexedDB.

**Avantages** :
- Friction minimale (un toucher).
- Très résistant à l'attaque (la biométrie est difficile à reproduire).
- L'utilisateur n'a rien à retenir.

**Inconvénients** :
- Dépendance matérielle (Touch ID/Face ID sur le Mac concerné). Si le Mac est remplacé, la biométrie change.
- L'API Web Authentication n'est pas universellement supportée pour ce cas d'usage (elle est conçue pour l'authentification web, pas pour le chiffrement local).
- **Plus complexe à implémenter correctement.** Risque d'erreur si mal fait.
- Procédure de récupération obligatoire si Touch ID est indisponible (panne, Mac volé et remplacé).

**Pour qui** : utilisateur qui priorise la fluidité quotidienne et accepte la dépendance matérielle.

**Implémentation** : plus complexe. L'idée est :

1. À la première utilisation, générer une paire de clés ECDSA dans Touch ID.
2. Chiffrer la vraie clé AES-GCM avec la clé publique Touch ID.
3. À chaque session, demander Touch ID. Le déblocage donne accès à la clé privée qui déchiffre la clé AES-GCM.

Détails techniques relèvent de l'API Web Authentication + Web Crypto, demandent un audit attentif.

### 6.3 Modèle 3 — Mot de passe + Touch ID combinés

**Principe** : Touch ID au quotidien pour la fluidité, mot de passe en repli pour la récupération. La clé maître AES-GCM peut être débloquée soit par Touch ID, soit par mot de passe (deux « cadenas » sur la même clé).

**Avantages** :
- Meilleur compromis : fluidité quotidienne + résilience à la panne matérielle.
- L'utilisateur peut migrer vers un nouveau Mac en saisissant son mot de passe.
- Pratique pour les utilisateurs qui ont un MacBook + iPad : Touch ID sur Mac, Face ID sur iPad, mot de passe partout.

**Inconvénients** :
- Plus complexe à implémenter (deux mécanismes en parallèle).
- L'utilisateur doit quand même mémoriser un mot de passe (même s'il l'utilise rarement) — il risque de l'oublier précisément parce qu'il l'utilise rarement.

**Pour qui** : recommandé pour le cas d'usage Labo Codex, parce qu'il offre le meilleur équilibre.

### 6.4 Recommandation

Pour Labo Codex, je propose le **Modèle 3** comme cible à terme, avec une **Phase 1** qui implémente d'abord le Modèle 1 (plus simple, plus rapide à livrer). Le mot de passe est obligatoire. Touch ID est un confort additionnel.

---

## 7. Architecture proposée pour Labo Codex

L'objectif : chiffrer les clés sensibles **de manière transparente**, sans que chaque module ait à se soucier du chiffrement. C'est le rôle de la couche `db.js`.

### 7.1 Modifications de `db.js`

`js/db.js` est déjà une couche d'abstraction au-dessus d'IndexedDB et localStorage. C'est l'endroit naturel pour ajouter le chiffrement.

**Principe** : maintenir une liste des clés sensibles (`CLES_CHIFFREES`). Pour ces clés, à chaque écriture, chiffrer avant d'envoyer à IndexedDB ; à chaque lecture, déchiffrer après réception. Le reste de l'app continue d'appeler `db.set` et `db.get` sans rien savoir.

```javascript
// Pseudo-code conceptuel
const CLES_CHIFFREES = new Set([
  'groupeEtudiants',    // suffixe — namespace ignoré dans le matching
  'journal',
  'evaluations',
  'presences',
  'indices_ACPE'
]);

function estCleChiffree(cle) {
  // Retire le préfixe trimestre (h2026_, a2025_) avant comparaison
  const cleSansNamespace = cle.replace(/^[ahe]\d{4}_/, '');
  return CLES_CHIFFREES.has(cleSansNamespace);
}

async function dbSet(cle, valeur) {
  if (estCleChiffree(cle) && cleMaitre) {
    const valeurStr = JSON.stringify(valeur);
    const valeurChiffree = await chiffrerAESGCM(valeurStr, cleMaitre);
    await setIndexedDB(cle, valeurChiffree); // stocke {iv, ciphertext}
  } else {
    await setIndexedDB(cle, valeur); // pas de chiffrement
  }
}

async function dbGet(cle) {
  const raw = await getIndexedDB(cle);
  if (estCleChiffree(cle) && cleMaitre && raw && raw.iv) {
    const valeurStr = await dechiffrerAESGCM(raw, cleMaitre);
    return JSON.parse(valeurStr);
  }
  return raw;
}
```

### 7.2 La clé maître en mémoire

Pendant la session, `cleMaitre` est une variable en mémoire (jamais persistée en localStorage ou IndexedDB). À la fermeture de l'onglet ou à un délai d'inactivité, elle est effacée. À l'ouverture suivante, l'utilisateur doit re-fournir le mot de passe.

```javascript
let cleMaitre = null;
let inactivityTimer = null;

async function ouvrirSession(motDePasse) {
  const sel = await dbGet('chiffrement_sel');
  cleMaitre = await deriverCleDepuisMotDePasse(motDePasse, sel);
  resetInactivityTimer();
}

function resetInactivityTimer() {
  clearTimeout(inactivityTimer);
  inactivityTimer = setTimeout(() => {
    cleMaitre = null; // effacement mémoire
    afficherDialogReSaisieMotDePasse();
  }, 30 * 60 * 1000); // 30 minutes
}

document.addEventListener('click', resetInactivityTimer);
document.addEventListener('keypress', resetInactivityTimer);
```

### 7.3 Format des données chiffrées en IndexedDB

Avant chiffrement, une clé `groupeEtudiants` contient un tableau d'objets. Après chiffrement, elle contient un objet de la forme :

```json
{
  "format": "chiffre-v1",
  "algorithme": "AES-GCM-256",
  "iv": "base64...",
  "ciphertext": "base64...",
  "date_chiffrement": "2026-05-06T10:30:00-04:00"
}
```

Le champ `iv` (initialization vector) est un nombre aléatoire de 12 octets, généré à chaque écriture. Sa fonction : garantir que deux chiffrements de la même donnée produisent des résultats différents, ce qui empêche certaines attaques par analyse statistique.

L'`iv` n'est **pas secret** — il est stocké à côté du ciphertext. C'est intentionnel et correct.

### 7.4 Migration des données existantes

Au moment où Grégoire active le chiffrement pour la première fois, ses données existantes sont en clair. La migration consiste à :

1. Pour chaque clé sensible :
2. Lire la valeur actuelle (en clair).
3. La chiffrer avec la clé maître nouvellement créée.
4. Réécrire la valeur chiffrée à la place de l'ancienne.

Cette migration prend quelques secondes pour un codex normal. Elle doit être **atomique par clé** — si elle échoue à mi-chemin, la clé peut rester en clair (refus de migration partielle).

```javascript
async function migrerVersChiffrement(motDePasse) {
  if (await dbGet('chiffrement_actif')) return; // déjà migré
  
  await ouvrirSession(motDePasse); // crée la clé maître
  
  for (const cleSensible of toutesLesClesSensiblesExistantes()) {
    const valeurClaire = await getIndexedDBBrut(cleSensible);
    if (valeurClaire !== null) {
      await dbSet(cleSensible, valeurClaire); // dbSet chiffre automatiquement
    }
  }
  
  await dbSet('chiffrement_actif', true);
  await dbSet('chiffrement_sel', selUtilise);
}
```

### 7.5 Performance attendue

AES-GCM avec une clé 256 bits est très rapide sur les puces M3 et M1 (instruction matérielle dédiée). Chiffrer/déchiffrer un tableau de 100 étudiants prend de l'ordre de quelques millisecondes — imperceptible.

Pour les très gros volumes (milliers d'entrées), le chiffrement reste rapide mais l'effet cumulé peut être visible. Mesurer avant d'implémenter pour calibrer.

---

## 8. L'UX du chiffrement

L'expérience utilisateur est aussi importante que la technique. Une protection si pénible que l'utilisateur la désactive est pire qu'aucune protection. Trois moments-clés :

### 8.1 La première fois

À la première ouverture après activation du chiffrement :

```
┌──────────────────────────────────────────────────┐
│  Activer la protection de tes données            │
│                                                  │
│  Labo Codex peut chiffrer les données critiques  │
│  (noms, DA, journal confidentiel, notes) pour    │
│  qu'elles soient illisibles si ton Mac est       │
│  volé, prêté ou inspecté par DevTools.           │
│                                                  │
│  Choisis un mot de passe que tu retiens.         │
│  Si tu l'oublies, ces données seront perdues.    │
│                                                  │
│  [Mot de passe : ____________________]           │
│  [Confirmation : ____________________]           │
│                                                  │
│  Phrase de récupération (à noter et conserver) : │
│  « cheval batterie agrafe correct »              │
│                                                  │
│  ☐ J'ai noté ma phrase de récupération           │
│                                                  │
│  [ Activer ]  [ Plus tard ]                      │
└──────────────────────────────────────────────────┘
```

L'utilisateur tape un mot de passe et reçoit une **phrase de récupération** (4-12 mots dans un format mémorisable, style BIP39 mais traduit en français). Cette phrase encode la clé maître. Si l'utilisateur oublie son mot de passe, la phrase de récupération peut servir à régénérer la clé.

### 8.2 À chaque ouverture

Dialogue minimal :

```
┌──────────────────────────────────────────────────┐
│  Déverrouiller Labo Codex                        │
│                                                  │
│  [Mot de passe : ____________________]           │
│                                                  │
│  ⌨️  Entrée pour valider                          │
│  👆 Ou : Toucher Touch ID  (si activé)           │
│                                                  │
│  [Déverrouiller]   [Phrase de récupération...]   │
└──────────────────────────────────────────────────┘
```

### 8.3 Pendant la session

Aucune visibilité. Les données apparaissent normalement. Quand la session expire (30 min d'inactivité), un dialogue de re-saisie apparaît au prochain accès à une clé sensible.

### 8.4 Indication visible de l'état

Un petit badge dans l'en-tête montre :

- 🔒 « Données protégées » (vert) — chiffrement actif, clé déverrouillée.
- 🔓 « Données non protégées » (jaune) — chiffrement non activé, ou clé non chargée.
- ⏰ « Session expirée — déverrouille pour continuer » (orange) — clé effacée par timeout.

L'utilisateur sait toujours dans quel état il est.

---

## 9. Que se passe-t-il si on perd la clé ?

C'est **la** question critique. Le chiffrement est sans valeur si l'utilisateur reste maître de sa clé ; il devient un piège si la perte est probable.

### 9.1 Modes de perte possibles

1. **Oubli du mot de passe** : l'utilisateur ne se souvient plus. Le plus fréquent.
2. **Panne matérielle Touch ID** : si Modèle 2 ou 3, et si Touch ID est indisponible, repli sur le mot de passe — mais si ce dernier est aussi oublié, perdu.
3. **Vol du Mac** : la machine partie avec la clé matérielle. L'utilisateur ne peut plus déchiffrer ses sauvegardes — sauf s'il a la phrase de récupération.
4. **Perte du device** : Mac noyé, écrasé, etc.

### 9.2 Stratégie de récupération : phrase de récupération

Standard de l'industrie : générer une **phrase mnémonique** de 4-12 mots à la création de la clé. La phrase encode la clé maître. L'utilisateur la note sur papier, la conserve dans un coffre, ou la stocke dans un gestionnaire de mots de passe (1Password, Bitwarden, KeePassXC).

Exemple : « cheval batterie agrafe correct fenêtre piano lampe étoile »

Cette phrase peut régénérer la clé maître si l'utilisateur la fournit. Elle est aussi puissante que la clé elle-même — donc à protéger comme telle.

**Format français** : il existe des listes BIP39 en français (2048 mots) qui permettent une compression élégante d'une clé en 12 mots. Les mots sont choisis pour éviter les confusions (pas de mots se ressemblant).

### 9.3 Stratégie de récupération alternative : export de la clé

Pour les utilisateurs qui préfèrent un fichier à une phrase, exporter la clé maître chiffrée par un mot de passe différent (genre une « clé de secours »). Stocker le fichier de secours dans un endroit sûr (clé USB chiffrée séparée, iCloud Drive, coffre-fort numérique).

### 9.4 Ce qui n'est PAS recommandé

- **Stocker la clé en clair quelque part** : annule complètement le chiffrement.
- **Envoyer la phrase de récupération par courriel à soi-même** : compromis si la boîte courriel est piratée.
- **Régénérer la clé à partir du mot de passe seul** : si l'utilisateur oublie le mot de passe, il est bloqué. La phrase de récupération existe précisément pour ce cas.

### 9.5 Procédure officielle Labo Codex (à formaliser)

À l'activation du chiffrement, l'app affiche :

1. La phrase de récupération générée.
2. Une checklist : l'utilisateur doit cocher qu'il a **(a)** noté la phrase, **(b)** vérifié la copie en la tapant, **(c)** stocké la copie dans un endroit sûr.
3. Un avertissement : « Sans cette phrase, en cas d'oubli de ton mot de passe, tes données seront perdues définitivement. Labo Codex ne peut PAS récupérer tes données — c'est par construction. »

Cet avertissement est désagréable. Il est aussi honnête. Mieux vaut perdre l'utilisateur à cette étape (« je préfère ne pas chiffrer ») que de lui donner une fausse promesse de récupération.

---

## 10. Impact sur les exports, la Réserve, la Voûte

Le chiffrement au repos interagit avec les autres mécanismes de Labo Codex. Trois cas :

### 10.1 Exports

À l'export d'un codex complet, deux options :

**Option A — Déchiffrer avant export.** L'export est en clair (comme aujourd'hui). Avantage : compatible avec le format actuel et avec les destinataires qui n'ont pas le mot de passe. Inconvénient : si le ZIP exporté fuit, les données sont lisibles.

**Option B — Conserver le chiffrement dans l'export.** L'export contient les données chiffrées. Pour les lire, le destinataire doit avoir la clé. Avantage : protection même en transit. Inconvénient : impose au destinataire d'avoir le mot de passe (à communiquer par un autre canal).

**Recommandation Labo Codex** : Option A par défaut, avec choix utilisateur explicite à l'export (« Export en clair » vs « Export chiffré avec mot de passe »). Documenter clairement les implications de chaque choix.

### 10.2 Réserve sur disque

La Réserve est stockée dans `~/Documents/Archives_LaboCodex/`. Si elle contient des copies des données sensibles, le chiffrement au repos d'IndexedDB ne suffit pas — les données dans la Réserve sont en clair sur disque.

**Recommandation** : étendre le chiffrement à la Réserve. Le fichier `donnees.json` de chaque versement est écrit chiffré. Le `meta.json` peut rester en clair pour la lisibilité humaine (il contient des métadonnées non sensibles). Une note dans le `README.txt` du dossier de versement explique le format.

### 10.3 Voûte (futur Plan 2)

Quand la Voûte sera en service, deux flux :

- **Voûte de bibliothèques pédagogiques** (grilles, échelles, cartouches) : pas de chiffrement nécessaire — ces données sont publiques par construction (licence CC BY-NC-SA).
- **Voûte de codex data** (données anonymisées pour la recherche pédagogique) : les données sont anonymisées avant publication (doc C de la série). Le chiffrement au repos local concerne le codex original, pas le codex data partagé.

Le chiffrement au repos n'a donc pas d'impact direct sur la Voûte.

---

## 11. Ce que le chiffrement au repos NE protège PAS

À répéter parce que c'est crucial : le chiffrement au repos est **une** défense, pas **la** défense.

### 11.1 Pendant que l'app tourne

Quand tu travailles dans Labo Codex, les données sensibles sont déchiffrées en mémoire pour être utilisables. Un payload XSS qui s'exécute pendant ta session voit tout (cf. scénario X-01 du `MODELE-MENACES.md`). Pour cette menace, la défense est ailleurs : sandbox iframe, sanitisation, audit `innerHTML`.

### 11.2 Si la clé est compromise

Si quelqu'un obtient ton mot de passe (keylogger, observation par-dessus l'épaule, fuite via un service tiers où tu réutilises ce mot de passe), il peut tout déchiffrer. Pour cette menace, la défense est : mot de passe fort et unique, vigilance comportementale.

### 11.3 Backups externes

Si tu sauvegardes ton codex sur clé USB ou iCloud en clair, le chiffrement au repos sur ton Mac ne protège pas la copie externe. Pour cette menace, la défense est : chiffrer aussi les sauvegardes (FileVault, ZIP chiffré, partition chiffrée sur USB).

### 11.4 Bibliothèques en clair

Les grilles, échelles, cartouches restent en clair dans IndexedDB selon la stratégie sélective recommandée (§4.2). Un attaquant qui inspecte IndexedDB voit ces bibliothèques. Acceptable parce qu'elles sont conçues pour être partageables, mais à savoir.

### 11.5 Métadonnées

Même avec les clés sensibles chiffrées, certaines métadonnées restent visibles dans la structure d'IndexedDB : noms des clés (`h2026_groupeEtudiants`), tailles, dates de modification. Un attaquant peut en déduire que tu as 84 étudiants pour le trimestre H2026 sans lire les détails. Pour masquer ça aussi, il faudrait un chiffrement plus exhaustif — pas recommandé pour l'effort.

---

## 12. Plan de mise en œuvre en trois phases

### 12.1 Phase 1 — Chiffrement opt-in avec mot de passe (3-4 semaines)

Objectif : poser les fondations cryptographiques et offrir le chiffrement comme option avancée pour les utilisateurs qui le souhaitent.

**Code** :
- Module `js/chiffrement.js` : `chiffrerAESGCM`, `dechiffrerAESGCM`, `deriverCleDepuisMotDePasse`, `genererPhraseRecuperation`, `restaurerCleDepuisPhrase`. Web Crypto API native.
- Modification de `js/db.js` : ajout de `dbSetChiffre`, `dbGetChiffre`, conditionnels sur l'état de `cleMaitre`.
- Module `js/chiffrement-ui.js` : dialogues d'activation, déverrouillage, expiration, phrase de récupération.
- Migration des données existantes (script idempotent).
- Liste `CLES_CHIFFREES` à valider — démarrer avec les CRITIQUE seulement.

**UX** :
- Dans les préférences : section « Sécurité » avec activation du chiffrement.
- À l'activation : dialogue avec mot de passe + phrase de récupération.
- À l'ouverture : dialogue de déverrouillage (si chiffrement actif).
- Badge d'état dans l'en-tête.

**Effort** : ~3-4 semaines de code à temps partiel + ~1 semaine de tests d'intégration.

### 12.2 Phase 2 — Touch ID + couverture étendue (3-4 semaines)

Objectif : améliorer l'ergonomie via Touch ID et étendre le chiffrement aux clés SENSIBLE.

**Code** :
- Intégration Web Authentication API pour Touch ID/Face ID.
- Stockage de la clé maître chiffrée par Touch ID dans IndexedDB.
- Extension de `CLES_CHIFFREES` aux clés SENSIBLE (évaluations, présences, indices).
- Migration progressive (l'utilisateur déclenche la migration explicitement).

**UX** :
- Dans les préférences : option « Activer Touch ID ».
- À l'ouverture : Touch ID prioritaire, mot de passe en repli.

**Effort** : ~3-4 semaines.

### 12.3 Phase 3 — Chiffrement de la Réserve et des blobs (long terme)

Objectif : étendre le chiffrement aux fichiers disque (Réserve, photos manuscrites).

**Code** :
- Chiffrement de `donnees.json` à l'écriture dans la Réserve (`js/reserve.js`).
- Chiffrement des blobs avant écriture FSAPI (`js/travaux-stockage.js`).
- Compatibilité de lecture : détection chiffré/clair pour gérer les anciens fichiers.

**Effort** : ~3-4 semaines + tests sur volumes réels.

### 12.4 Effort total

Phases 1+2 : environ 6-8 semaines de code à temps partiel. Phase 3 optionnelle, dépend du modèle de menace retenu (si FileVault est jugé suffisant pour les fichiers disque, Phase 3 peut être reportée).

---

## 13. Questions ouvertes pour Grégoire

Ces questions me sont nécessaires pour finaliser une spec d'implémentation. Tu n'as pas besoin de toutes répondre maintenant — c'est une checklist pour quand tu seras prêt à passer au code.

### Q1 — Activation par défaut ou opt-in ?

Chiffrement activé par défaut (chaque nouvel utilisateur doit créer un mot de passe à la première utilisation) ou opt-in (l'utilisateur active dans les préférences) ?

**Pour le défaut** : protection plus large, conformité Loi 25 plus solide, signal éducatif (« la protection est la norme »).

**Pour l'opt-in** : friction réduite pour les nouveaux utilisateurs, choix laissé à l'utilisateur, pas d'imposition.

Ma préférence : **opt-in en Phase 1, par défaut en Phase 2** (après une période de stabilisation).

### Q2 — Modèle de clé en Phase 1 ?

Mot de passe seul (Modèle 1) ou directement combinaison mot de passe + Touch ID (Modèle 3) ?

Ma préférence : **Modèle 1 d'abord, Modèle 3 en Phase 2** (séparer la complexité).

### Q3 — Quelles clés chiffrer en Phase 1 ?

Toutes les clés CRITIQUE, ou seulement `groupeEtudiants` et `journal` pour démarrer ?

Ma préférence : **les deux pour démarrer** (CRITIQUE complet), ajouter les SENSIBLE en Phase 2.

### Q4 — Délai d'inactivité avant verrouillage ?

30 minutes ? 1 heure ? Jamais (verrouillage seulement à la fermeture de l'onglet) ?

Ma préférence : **30 minutes par défaut**, configurable dans les préférences.

### Q5 — Format de la phrase de récupération ?

12 mots français BIP39 (standard) ou 4-6 mots plus mémorisables (moins sûr) ?

Ma préférence : **12 mots BIP39 français**, parce que c'est le standard et que la sécurité est essentielle pour une clé de récupération.

### Q6 — Comportement à l'export ?

Export en clair par défaut, ou export chiffré par défaut ?

Ma préférence : **en clair par défaut, choix explicite à chaque export**.

### Q7 — Le chiffrement bloque-t-il l'usage si l'utilisateur n'a pas son Touch ID disponible ?

Si Phase 2 (Touch ID), que se passe-t-il si l'utilisateur ouvre l'app sur un Mac différent (ex. iPad) ? Repli automatique sur mot de passe, ou refus d'accès ?

Ma préférence : **repli automatique sur mot de passe**, avec préférence Touch ID si disponible.

---

## Synthèse en une page

**Question** : comment protéger les données critiques (DA, journal confidentiel, notes individuelles, présences) dans IndexedDB quand l'app est fermée ou inspectée ?

**Réponse courte** : chiffrer ces clés avec AES-GCM-256, déchiffrer en mémoire pendant la session, clé dérivée d'un mot de passe utilisateur (et optionnellement Touch ID).

**Ce que ça protège** : vol physique du Mac, inspection DevTools par un tiers, accès par un autre utilisateur du Mac, conformité Loi 25 sur les données au repos.

**Ce que ça ne protège pas** : payload XSS en session active, vol du mot de passe, backups externes non chiffrés séparément, métadonnées (taille, noms de clés).

**Stratégie** : chiffrement **sélectif** des clés CRITIQUE et SENSIBLE. Les bibliothèques pédagogiques (grilles, échelles) restent en clair — elles sont partageables par construction.

**Plan en trois phases** :
1. **Phase 1** (3-4 semaines) — Chiffrement opt-in avec mot de passe, clés CRITIQUE seulement.
2. **Phase 2** (3-4 semaines) — Touch ID + extension aux clés SENSIBLE.
3. **Phase 3** (long terme) — Réserve et blobs disque.

**Compromis fondamental** : si Grégoire oublie son mot de passe **et** perd sa phrase de récupération, les données sont perdues définitivement. C'est par construction. La phrase de récupération doit être notée et conservée à part.

**Recommandation immédiate** : démarrer la Phase 1 après les Quick Wins du `MODELE-MENACES.md` §8.2 (sanitisation, hash, hook pré-commit). Le chiffrement au repos est un chantier substantiel qui mérite d'être planifié après les défenses urgentes contre la destruction (qui restent prioritaires sur la confidentialité dans ton ordre).

---

## Historique

| Date | Version | Changement |
|---|---|---|
| 2026-05-06 | 1.0 | Création. Analyse du contexte IndexedDB actuel, modèle de chiffrement AES-GCM, trois modèles de gestion de la clé, architecture proposée pour `db.js`, UX, stratégie de récupération, plan en trois phases, sept questions ouvertes. |

---

**Fin du document A. Document B (Versioning et résilience) et document C (Anonymisation) suivent.**
