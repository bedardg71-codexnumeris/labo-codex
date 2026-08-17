# Décisions architecturales sécurité — 11 mai 2026

> **Type de document** : registre de décisions architecturales (ADR consolidé).
>
> **Origine** : session de décision du 11 mai 2026, à la suite de l'audit `AUDIT-ETAT-REFLEXION-2026-05-11.md`.
>
> **Acteurs** : Grégoire Bédard (décideur), Claude Cowork (analyse et formulation des options).
>
> **Statut** : décisions prises, en cours d'application dans le code et la documentation.
>
> **Pourquoi ce document existe** : la philosophie « Stabilité zéro-dette » du `CLAUDE.md` impose que les décisions structurelles soient documentées au moment où elles sont prises, avec leur raisonnement et leurs conséquences. Sans ce document, dans trois mois (toi-même, Claude Code, une autre IA), on se demandera « pourquoi a-t-on décidé ça ? » et on risquera de défaire une décision sans en comprendre la motivation. Ce document est l'antidote à la dette de mémoire.
>
> **Public visé** :
> - Grégoire, comme référence à consulter avant d'engager le code Phase 2 Voûte.
> - Toute IA (Claude Code, Claude Cowork, autre) qui reprend le sujet — à charger dès l'ouverture d'une session touchant à la Voûte ou à la sécurité.
> - Futur collaborateur humain éventuel.

---

## Table des matières

1. [Synthèse en une page](#1-synthèse-en-une-page)
2. [Décision D1 — Architecture Voûte : EN ATTENTE](#2-décision-d1--architecture-voûte--en-attente)
3. [Décision D2 — Signature ECDSA en Phase 1 Voûte](#3-décision-d2--signature-ecdsa-en-phase-1-voûte)
4. [Décision D3 — Web of Trust Variante B (TOFU + progressif)](#4-décision-d3--web-of-trust-variante-b-tofu--progressif)
5. [Décision D4 — Modération humaine pour commencer](#5-décision-d4--modération-humaine-pour-commencer)
6. [Décision D5 — Pas de chiffrement local au repos](#6-décision-d5--pas-de-chiffrement-local-au-repos)
7. [Décision D6 — Multi-navigateurs assumé](#7-décision-d6--multi-navigateurs-assumé)
8. [Décision D7 — Préfixage des IDs Voûte à l'import](#8-décision-d7--préfixage-des-ids-voûte-à-limport)
9. [Décisions humaines en attente (G1-G6)](#9-décisions-humaines-en-attente-g1-g6)
10. [Plan d'action consolidé](#10-plan-daction-consolidé)
11. [Conditions de réévaluation](#11-conditions-de-réévaluation)
12. [Annexes](#12-annexes)

---

## 1. Synthèse en une page

| Code | Décision | Statut | Justification courte | Conséquence principale |
|---|---|---|---|---|
| **D1** | Architecture Voûte (serveur/fédéré/GitHub) | **En attente** | Consultations institutionnelles requises (AQPC, cégep, ministère) | Code applicatif peut avancer indépendamment. Infrastructure attend. |
| **D2** | Signature ECDSA en Phase 1 Voûte | **Tranchée : oui Phase 1** | Pas de dette technique, U-01 (usurpation) neutralisée dès l'ouverture | +2-3 semaines de code avant ouverture. Module `js/signature.js` à créer. |
| **D3** | Modèle de confiance Voûte | **Tranchée : WoT Variante B** | Concilier rigueur (WoT) et adoption (TOFU). Mode par défaut TOFU, WoT progressif optionnel | Module `js/trust-tofu.js` + UI signatures manuelles. Évite l'échec d'adoption de PGP. |
| **D4** | Modération des dépôts Voûte | **Tranchée : humaine au démarrage** | Pragmatique. Modération automatique insuffisante contre attaques sociales. | Outil de modération à coder. Toi seul au début, délégation ensuite. |
| **D5** | Chiffrement local des données | **Tranchée : abandonné** | FileVault macOS suffit pour vol physique. Friction quotidienne disproportionnée. | Économie 3-4 semaines. Document `PROTECTION-DONNEES-CHIFFREMENT-REPOS.md` à marquer abandonné. |
| **D6** | Navigateurs cibles | **Tranchée : multi-navigateurs** | Utilisateurs hétérogènes (Safari, Chrome, Firefox, Edge). Tu développes sur Safari Mac. | Fallbacks Safari pour FSAPI. Tests cross-browser. Asymétries fonctionnelles à documenter. |
| **D7** | IDs Voûte à l'import | **Tranchée : préfixage `PARTAGE_*`** | Élimine la classe d'anti-pattern AP-1 (collision d'IDs) par construction | Code d'import Voûte génère un nouvel ID, conserve l'ID source dans `inspireDe.idOriginal`. |
| **G1-G6** | Décisions humaines/légales | **À initier cette semaine** | Délais incompressibles, en parallèle du code | Démarches Loi 25, CER, syndicat, AQPC, TI cégep. |

---

## 2. Décision D1 — Architecture Voûte : EN ATTENTE

### 2.1 Question posée

Quelle architecture pour la Voûte : serveur centralisé, fédéré (modèle Mastodon/Matrix), ou fichiers signés sur dépôt GitHub (modèle Obsidian community plugins) ?

### 2.2 Décision

**En attente.** Grégoire ne tranche pas avant consultation avec spécialistes au cégep et discussion avec l'AQPC.

### 2.3 Raisonnement

Le choix d'architecture détermine :
- **Qui héberge** (TI cégep, AQPC, GitHub public, consortium).
- **Qui paie** (institution garante, contributions communautaires, autofinancement).
- **Qui contrôle** (gouvernance, droit de révocation, succession en cas de disparition).

Ces questions ne sont pas techniques mais institutionnelles. Une réponse précipitée engagerait Labo Codex sur une trajectoire structurelle pour des années. Mieux vaut attendre que les bons interlocuteurs soient consultés.

### 2.4 Ce qui est débloqué malgré l'attente

Le code applicatif **peut avancer** sans connaître l'architecture finale :

- Format de partage (`labo-codex-partage-v1`) : déjà spécifié dans `PLAN2-PHASE1-SPEC.md`.
- Module signature ECDSA : indépendant de l'infrastructure.
- Module TOFU : indépendant.
- Modules `partage-*.js` : indépendants.
- Outil de modération humaine : indépendant (Grégoire peut modérer en local depuis sa machine).

Concrètement, l'ouverture **pilote restreinte** de la Voûte peut se faire avant D1 — par exemple Grégoire et 2-3 collègues qui s'échangent des packages signés par courriel ou clé USB. C'est de la « Voûte sans serveur » par fichiers signés, mode dégradé de la variante C.

### 2.5 Ce qui est bloqué par l'attente

- Hébergement réel d'un serveur Voûte (si variante (a) centralisée retenue).
- Annuaire centralisé des clés publiques (si variante (a) ou (c) retenues).
- Distribution multi-cégep automatique.

### 2.6 Ce qui débloque D1

La décision sera mûre quand au moins trois éléments seront clarifiés :

1. **Avis institutionnel sur l'hébergement** (TI cégep accepte-t-il ? AQPC ? Ministère ?). Lié à G4.
2. **Modèle économique** (qui paie le serveur ? Quels engagements de continuité ? Lié à G6).
3. **Gouvernance de l'autorité** (modérateurs, droit de révocation, recours utilisateur). Lié à G5.

### 2.7 Date butoir suggérée

Décision à prendre **avant l'automne 2026** si l'objectif est une ouverture multi-cégep à la rentrée. Sinon, glissement au trimestre suivant.

### 2.8 Documents impactés

- `docs/architecture/PLAN2-PHASE1-SPEC.md` : reste valide pour le **format**. La section infrastructure devra être complétée quand D1 sera tranchée.
- `.claude/skills/securite-donnees/SKILL.md` §6.2 : les 6 questions de gouvernance restent ouvertes.

---

## 3. Décision D2 — Signature ECDSA en Phase 1 Voûte

### 3.1 Question posée

La signature cryptographique des dépôts Voûte est-elle obligatoire dès l'ouverture (Phase 1), ou reportée à une Phase 2 ultérieure ?

### 3.2 Décision

**Signature ECDSA obligatoire dès Phase 1.** Aucun dépôt accepté sans signature valide.

### 3.3 Raisonnement

**Principe directeur** : « Stabilité zéro-dette » du `CLAUDE.md` — ce qui n'est pas protégé à l'ouverture sera plus coûteux à protéger après. Conséquence concrète : on ne reproduit pas l'erreur des « grilles non signées » qu'on devra rétroactivement signer.

**Argument sécurité** : le scénario U-01 du `MODELE-MENACES.md` (publication sous identité d'un enseignant respecté) est neutralisé par construction dès l'ouverture. Sans signature, U-01 est une faille connue exploitable dès le jour 1.

**Coût accepté** : +2-3 semaines de code avant ouverture Voûte. Acceptable parce que :
- Pas d'urgence à ouvrir (Voûte non promise à une date publique).
- Le coût ultérieur de migration (re-signer toutes les grilles déjà publiées) serait pire.

### 3.4 Alternatives écartées

**Alternative écartée A — Phase 1 sans signature, Phase 2 avec** :
- Avantage : ouverture plus rapide (gain de 2-3 semaines).
- Inconvénient : U-01 exploitable pendant la fenêtre. Risque réputationnel si un incident survient avant la livraison Phase 2.
- Raison du rejet : incompatible avec le principe « pas de dette ».

**Alternative écartée B — Signature optionnelle** :
- Avantage : flexibilité, les utilisateurs avancés peuvent signer mais ce n'est pas obligatoire.
- Inconvénient : la confiance dans le système devient hétérogène. Un attaquant publie sans signature, l'utilisateur naïf clique « importer quand même ».
- Raison du rejet : la sécurité opt-in ne fonctionne pas en pratique (la majorité ne configure pas).

### 3.5 Conséquences code

**À créer** :
- Module `js/signature.js` : génération de paire ECDSA P-256, signature de manifestes, vérification de signatures. Web Crypto API native. Effort estimé : 1 semaine de code propre + tests.
- Module `js/gestion-cles.js` : génération de la paire à la création du compte, stockage local de la clé privée (IndexedDB ou Web Crypto KeyStore), export/import avec phrase de récupération, sauvegarde sur Mac. Effort : 1 semaine + UX.
- Module `js/verification-imports.js` (extension de l'existant) : à l'import Voûte, vérifier la signature avant d'accepter. Effort : 2-3 jours.

**À modifier** :
- `PLAN2-PHASE1-SPEC.md` : le champ `manifest.signature` devient obligatoire au lieu d'optionnel. Format de la signature à spécifier (algorithme, encodage base64, champ référence de la clé publique).
- Modules `partage-*.js` (non encore codés) : intégrer signature à l'export, vérification à l'import.

**Total effort** : 2-3 semaines de code à temps partiel pour Phase 1 signature.

### 3.6 Conséquences gouvernance

D2 implique D3 (où trouve-t-on la clé publique pour vérifier). Conjointement avec D3 Variante B : TOFU au démarrage, signatures manuelles optionnelles.

D2 implique aussi une procédure de **récupération de clé** si l'utilisateur perd sa clé privée (changement de machine, crash disque). Phrase de récupération mnémonique (12 mots BIP39 français) est le standard. À implémenter dans `js/gestion-cles.js`.

### 3.7 Risques résiduels

- **Vol de la clé privée** (compromis du Mac) → un attaquant peut signer en lieu et place. Mitigation : protection de la clé privée par mot de passe local (Web Crypto `wrapKey`). À étudier en Phase 2 ou 3.
- **Perte définitive de la clé** (oubli phrase de récupération) → l'utilisateur perd sa capacité à signer mais peut en générer une nouvelle. Sa réputation passée (anciennes signatures) reste vérifiable, ses futures publications utilisent la nouvelle clé. Procédure de rotation à documenter.

### 3.8 Date butoir

Le module `js/signature.js` doit être livré **avant l'implémentation des modules `partage-*.js`**. Sinon, la spec PLAN2 ne peut pas être complétée correctement.

---

## 4. Décision D3 — Web of Trust Variante B (TOFU + progressif)

### 4.1 Question posée

Quel modèle d'annuaire des clés publiques : annuaire centralisé, TOFU pur (Trust on First Use), Web of Trust pur (modèle PGP), ou variantes hybrides ?

### 4.2 Décision

**Variante B — TOFU + WoT progressif.**

Mode par défaut : TOFU. La première fois qu'un utilisateur reçoit un package signé par « Marie-Hélène », son app mémorise la clé publique de Marie-Hélène. Tout package ultérieur prétendant venir de Marie-Hélène doit être signé avec la même clé, sinon alerte explicite.

Mode avancé optionnel : signatures manuelles entre utilisateurs (« Alice signe la clé publique de Bob » = Alice certifie qu'elle a vérifié l'identité de Bob). Ces signatures constituent un graphe WoT au-dessus du TOFU. Les utilisateurs avancés peuvent l'utiliser pour valider des clés inconnues via chemins de confiance ; les autres peuvent l'ignorer.

### 4.3 Raisonnement

**Principe directeur** : éviter à la fois la dette technique (« on a fait TOFU, on devra tout refaire en WoT plus tard ») et l'échec d'adoption (« on a fait WoT pur, personne n'a compris, la Voûte est vide »).

**Argument adoption** : 30 ans d'histoire PGP montrent que le WoT pur a échoué à atteindre le grand public à cause de sa complexité. Pour une base d'utilisateurs d'enseignants québécois non techniciens (cible Labo Codex), le risque d'échec d'adoption est élevé.

**Argument architectural** : TOFU + WoT progressif n'est pas une architecture « TOFU qu'on remplacera par WoT plus tard ». C'est une architecture WoT dont le mode par défaut au démarrage est TOFU. La sophistication s'ajoute sans changer le paradigme.

### 4.4 Alternatives écartées

**Variante A — WoT pur dès le départ** :
- Avantage : modèle le plus rigoureux mathématiquement.
- Inconvénient : bootstrap problématique (un nouvel utilisateur n'a aucune clé contre-signée, sa première publication apparaît comme « non vérifiée » à tous les autres utilisateurs). Friction maximale au moment de l'engagement.
- Raison du rejet : risque d'échec d'adoption documenté par 30 ans d'historique PGP.

**Variante C — WoT à ancres institutionnelles** :
- Avantage : accessible (« si l'AQPC a signé Marie-Hélène, je lui fais confiance »).
- Inconvénient : dépend de partenariats institutionnels qui ne sont pas acquis (lié à D1 en attente). Pas viable comme solution principale tant que les ancres n'existent pas.
- Raison du rejet : prématuré. Pourra s'ajouter par-dessus B plus tard.

**Variante D — Combinaison B + C en couches successives** :
- Avantage : couverture maximale.
- Inconvénient : complexité conceptuelle, risque d'embrouiller les utilisateurs.
- Raison du rejet : pas pour le démarrage. Évolution possible plus tard si les ancres institutionnelles se concrétisent.

### 4.5 Conséquences code

**À créer** :

- Module `js/trust-tofu.js` :
  - Stockage local des associations « auteur → clé publique » (clé IndexedDB `trustedKeys`).
  - À chaque import signé, vérifier que la clé du signataire correspond à la clé mémorisée pour cet auteur. Si nouveau auteur : mémoriser. Si auteur connu avec clé différente : alerte « cette clé ne correspond pas à celle que tu connais pour <auteur>, ignorer ou approuver le changement ? ».
  - API : `verifierConfianceTOFU(packageImporte)` → résultat (verifiée / nouveau / clé changée).
  - Effort : 1 semaine.

- Module `js/trust-wot.js` :
  - Permet à l'utilisateur de signer manuellement la clé publique d'un autre utilisateur (= certification que cette clé appartient bien à la personne nommée).
  - Stockage local du graphe de signatures (`wotSignatures`).
  - Calcul des chemins de confiance (« Marie-Hélène a signé Pierre, Pierre a signé Lucas → tu peux faire confiance à Lucas via 2 sauts via Pierre »).
  - Algorithme transitif borné (limite de profondeur, ex. 3 sauts max).
  - Effort : 1-2 semaines (l'algorithme est simple, l'UX est complexe).

- Module `js/trust-ui.js` :
  - Panneau « Confiances » dans Labo Codex : liste des auteurs connus, leurs clés, leurs signatures émises et reçues.
  - Dialog « Signer la clé de X » avec procédure de vérification (vérifier l'empreinte de la clé par un canal hors-bande, par exemple appel téléphonique ou rencontre physique).
  - Visualisation simple du graphe local (qui a signé qui).
  - Effort : 1-2 semaines.

**À modifier** : modules `partage-*.js` doivent appeler `verifierConfianceTOFU` à l'import et afficher le statut.

**Total effort D3** : 3-5 semaines, parallélisable avec D2.

### 4.6 Conséquences UX

La sophistication WoT doit rester **opt-in** dans l'UX. La majorité des utilisateurs vivent en mode TOFU sans avoir à comprendre les signatures manuelles. Seuls ceux qui veulent une garantie plus forte (ou qui sont contactés par un collègue pour une signature mutuelle) entrent dans le mode WoT.

L'interface doit :
- Au quotidien : ne pas mentionner WoT. Afficher discrètement « vérifié » ou « non vérifié » par grille importée.
- Sur demande : un panneau « Avancé › Confiances » permet de voir les clés et signer manuellement.
- À l'alerte de changement de clé TOFU : explication claire en français, choix utilisateur clair.

### 4.7 Procédure de vérification hors-bande

Pour signer la clé d'un collègue, l'utilisateur doit avoir un moyen de **vérifier que la clé qu'il s'apprête à signer appartient bien à la personne déclarée**. Méthodes possibles :

- **Empreinte courte (fingerprint)** : un hash de 8 hex affiché dans Labo Codex (« empreinte de la clé de Marie-Hélène : `a1b2c3d4` »). À comparer par téléphone ou en personne. Standard PGP.
- **QR code** : Marie-Hélène montre son QR code, Bob le scanne. Plus convivial mais nécessite un module supplémentaire.
- **Empreinte vocale** : 4 mots tirés d'un dictionnaire (Codename), prononcés au téléphone. Très accessible mais moins précis.

À choisir au moment de l'implémentation. Mon préféré : empreinte courte 8 hex + option QR pour utilisateurs équipés.

### 4.8 Risque résiduel

- **Premier contact piégé** (TOFU) : si l'attaquant est le **premier** à contacter Bob en se faisant passer pour Marie-Hélène, Bob mémorise la mauvaise clé. Marie-Hélène apparaît plus tard comme « clé différente, suspecte ».
  - Mitigation : éducation utilisateur (« la première fois que tu reçois d'un nouvel auteur, vérifie son empreinte par un autre canal »).
  - Mitigation forte : Variante C avec ancres institutionnelles.

- **Signature accidentelle** : un utilisateur signe la clé d'un attaquant sans vérification.
  - Mitigation : UI qui force une étape de vérification explicite avant signature.

---

## 5. Décision D4 — Modération humaine pour commencer

### 5.1 Question posée

Comment modérer les dépôts dans la Voûte : automatique, humaine, ou mixte ? Qui modère ?

### 5.2 Décision

**Modération humaine au démarrage**, avec Grégoire seul comme modérateur initial. Délégation progressive à mesure que des collaborateurs de confiance émergent. Possible évolution vers un système mixte (automatique en première passe, humain sur signalement) une fois la communauté établie.

### 5.3 Raisonnement

**Argument couverture** : la modération automatique (sanitisation + sandbox + audit XSS) suffit contre les attaques techniques (D-01, I-01). Elle **ne suffit pas** contre les attaques sociales (U-01 — usurpation, contenu offensant déguisé en ressource pédagogique, plagiat). Un humain est nécessaire pour ces cas.

**Argument pragmatique** : au démarrage de la Voûte, le volume de dépôts sera faible (quelques par mois ?). Modération humaine reste tenable pour une personne. Si le volume explose, on adaptera (déléguer ou automatiser).

**Argument gouvernance** : un seul modérateur (Grégoire) au démarrage évite la complexité de constituer un comité formel avant que la communauté soit critique. Mais cela concentre la responsabilité — Grégoire est l'autorité unique de fait. À expliciter dans le `MODELE-CONFIANCE.md` à rédiger.

### 5.4 Alternatives écartées

**Modération entièrement automatique** :
- Avantage : passe à l'échelle, pas de friction humaine.
- Inconvénient : ne couvre pas les attaques sociales. Risque réputationnel si un contenu inapproprié passe.
- Raison du rejet : insuffisant pour la responsabilité éditoriale.

**Comité de modération formel dès le départ** :
- Avantage : gouvernance partagée, légitimité collective.
- Inconvénient : prématuré tant que la communauté est embryonnaire. Risque de bureaucratie sur un volume faible.
- Raison du rejet : trop lourd pour le démarrage.

### 5.5 Conséquences code

**À créer** :

- Module `js/moderation.js` :
  - Stockage des dépôts en attente de modération (clé IndexedDB `depotsEnAttenteModeration` ou similaire).
  - API : `soumettreDepot(package)`, `listerDepotsEnAttente()`, `approuverDepot(id, commentaire)`, `refuserDepot(id, motif)`.
  - Effort : 1 semaine.

- Interface « Panneau de modération » dans Labo Codex :
  - Liste des dépôts en attente avec métadonnées (auteur, date, type, taille).
  - Bouton « Prévisualiser » qui ouvre le contenu **dans la sandbox iframe** (Défense A) pour audit sans risque.
  - Boutons « Approuver » et « Refuser » avec champ commentaire/motif.
  - Historique des décisions de modération (audit trail).
  - Effort : 1 semaine.

- Procédure de signalement (futur) : permettre aux utilisateurs de signaler un dépôt approuvé qui s'avère problématique a posteriori. Effort : 2-3 jours.

### 5.6 Conséquences gouvernance

À documenter dans le futur `MODELE-CONFIANCE.md` (action E8 de l'audit, à produire avant ouverture Voûte) :

- Critères d'acceptation/refus d'un dépôt (pédagogique, légal, technique, éthique).
- Procédure d'appel d'un refus.
- Procédure de révocation a posteriori d'un dépôt approuvé.
- Conditions de délégation de la modération.
- Plan de succession si Grégoire ne peut plus modérer.

### 5.7 Évolution prévue

| Étape | Volume | Modèle |
|---|---|---|
| Démarrage (0-10 utilisateurs actifs) | 0-5 dépôts/mois | Grégoire seul |
| Croissance (10-50 utilisateurs) | 5-30 dépôts/mois | Grégoire + 1-2 modérateurs délégués |
| Échelle (50+ utilisateurs) | 30+ dépôts/mois | Comité de modération + modération automatique en première passe |

Critère de passage entre étapes : charge soutenable + qualité des décisions.

---

## 6. Décision D5 — Pas de chiffrement local au repos

### 6.1 Question posée

Implémenter un chiffrement applicatif des données sensibles (DA, journal confidentiel, notes individuelles) dans IndexedDB, avec dérivation de clé par mot de passe utilisateur ou Touch ID ?

### 6.2 Décision

**Non.** Le chantier décrit dans `PROTECTION-DONNEES-CHIFFREMENT-REPOS.md` n'est pas retenu pour Labo Codex actuel.

### 6.3 Raisonnement

**Argument couverture redondante** : FileVault macOS est universel sur les Mac modernes (et activé par défaut sur les nouvelles installations). Il chiffre l'intégralité du disque, y compris les fichiers IndexedDB de Safari. Le chiffrement applicatif ajouterait une seconde couche **redondante** pour le scénario principal (vol physique du Mac).

**Argument friction/bénéfice** : 3-4 semaines de code + saisie d'un mot de passe à chaque ouverture de session + risque de perte définitive si oubli du mot de passe **et** de la phrase de récupération. Bénéfice marginal sur le scénario de menace réel (Grégoire utilisateur unique, machine personnelle, FileVault actif).

**Argument scénario X-01 partiellement couvert ailleurs** : la sandbox iframe (Défense A, livrée le 8 mai) neutralise l'exfiltration via grille empoisonnée. Le risque résiduel d'exfiltration est principalement le vol de la machine — couvert par FileVault.

### 6.4 Alternatives écartées

**Chiffrement opt-in dans les préférences** :
- Avantage : option pour les utilisateurs qui le souhaitent.
- Inconvénient : la sécurité opt-in ne fonctionne pas en pratique (la majorité ne configure pas), risque de fragmentation, complexité accrue pour les exports/sauvegardes.
- Raison du rejet : effort développement disproportionné par rapport à l'adoption attendue.

**Chiffrement activé par défaut** :
- Avantage : protection universelle, conformité Loi 25 plus solide.
- Inconvénient : friction quotidienne maximale, risque élevé de perte de données par oubli, support utilisateur lourd.
- Raison du rejet : disproportionné pour le contexte actuel.

### 6.5 Conséquences

**Économie** : 3-4 semaines de chantier libérées, réallouables à d'autres priorités (Voûte Phase 1, Versioning Phase 1, fallbacks Safari).

**Documentation à mettre à jour** :
- `PROTECTION-DONNEES-CHIFFREMENT-REPOS.md` : ajouter un bandeau d'en-tête « DÉCISION DU 11 MAI 2026 : ce chantier n'est pas retenu. Voir `DECISIONS-ARCHITECTURALES-2026-05-11.md` §6 pour le raisonnement. Document conservé en référence pour réévaluation future. »
- `MODELE-MENACES.md` §X-01 P3 (chiffrement au repos comme défense) : marquer la défense P3 comme « non retenue par décision D5 ». La couverture X-01 repose sur la sandbox iframe (Défense A) + FileVault.

**Conformité Loi 25** : la justification technique à présenter aux responsables de la protection des renseignements personnels (G1) est que :
1. FileVault chiffre le disque par défaut.
2. La sandbox iframe protège contre l'exfiltration via contenu importé.
3. La CSP `default-src 'self'` bloque l'exfiltration réseau.
4. Aucun envoi automatique de données vers un serveur tiers.

Ce dispositif est défendable mais à formaliser dans la consultation Loi 25 (G1).

### 6.6 Risques résiduels acceptés

- **Si FileVault n'est pas activé** chez un utilisateur, ses données sont en clair au repos. Mitigation : message d'éducation à la première ouverture (« Vérifie que FileVault est activé pour protéger tes données »).
- **Vol de la machine avec session ouverte non verrouillée** : les données sont accessibles via DevTools ou via l'app. Mitigation : verrouillage automatique de session macOS (responsabilité utilisateur).
- **Compromis local par autre logiciel sur la machine** : un malware natif macOS peut lire IndexedDB. Hors périmètre Labo Codex.

### 6.7 Conditions de réévaluation

Cette décision sera **réexaminée** si l'un des éléments suivants survient :

- Avis Loi 25 (G1) qui impose explicitement un chiffrement applicatif.
- Distribution de Labo Codex à un public sensible (psy, santé, mineurs vulnérables).
- Incident de fuite documenté chez un utilisateur (qui révélerait que FileVault seul ne suffit pas dans son contexte).
- Apparition d'une vulnérabilité Safari/IndexedDB qui rendrait l'isolation par origin moins fiable.

Sinon, la décision reste **stable**.

---

## 7. Décision D6 — Multi-navigateurs assumé

### 7.1 Question posée

Quel(s) navigateur(s) cible Labo Codex : Safari only (cohérent avec workflow Grégoire), multi-navigateurs avec fonctionnalités asymétriques, ou Chrome/Edge forcé sur Mac ?

### 7.2 Décision

**Multi-navigateurs assumé.** Grégoire développe sur Safari Mac, mais les utilisateurs peuvent être sur n'importe quel navigateur (Safari, Chrome, Firefox, Edge). L'app doit fonctionner partout, avec **fonctionnalités asymétriques documentées** quand certaines APIs ne sont pas disponibles.

### 7.3 Raisonnement

**Argument réalité utilisateur** : les enseignants québécois utilisent ce qu'ils ont. Imposer un navigateur (« utilisez Chrome ») est une barrière d'adoption pour un projet pédagogique. Mieux vaut accepter la diversité.

**Argument technique** : la File System Access API (FSAPI) — utilisée par `travaux-stockage.js`, `reserve.js`, `codex-data.js`, `reserve-ouvrir.js` — n'est pas supportée par Safari (ni sur Mac ni sur iPad). Sur Safari, ces fonctionnalités doivent avoir un fallback (stockage IndexedDB ou téléchargement ZIP manuel).

**Argument cohérence workflow Grégoire** : Grégoire teste principalement sur Safari Mac. Cela garantit qu'il rencontrera les limitations Safari en premier, donc qu'elles seront prises au sérieux dans le code (au lieu d'être un cas marginal négligé).

### 7.4 Alternatives écartées

**Safari only** :
- Avantage : code plus simple (un seul navigateur cible).
- Inconvénient : exclut les utilisateurs Chrome/Edge/Firefox sans raison technique. Beaucoup d'enseignants sur Windows ou avec préférence Chrome.
- Raison du rejet : barrière d'adoption disproportionnée.

**Chrome/Edge forcé** :
- Avantage : FSAPI complète, expérience uniforme.
- Inconvénient : exclut Safari Mac et iPad. Incohérent avec le workflow de Grégoire.
- Raison du rejet : exclut les utilisateurs Apple-only.

### 7.5 Conséquences code

**À auditer / vérifier** :

- État actuel des fallbacks Safari pour `travaux-stockage.js` et `reserve.js`. Hypothèse à confirmer par test : sur Safari, ces modules utilisent-ils déjà un fallback IndexedDB ou affichent-ils une erreur ? À tester en ouvrant Labo Codex sur Safari et en essayant les fonctionnalités Réserve disque et Travaux disque.

**À corriger si fallback cassé** :

- `travaux-stockage.js` : si FSAPI indisponible, stocker les blobs travaux **uniquement** dans IndexedDB. Limite de taille à vérifier (IndexedDB sur Safari : quelques Go selon configuration).
- `reserve.js` : si FSAPI indisponible, la fonction « Verser à la Réserve sur disque » bascule sur « Télécharger un ZIP de versement » que l'utilisateur sauvegarde manuellement.

**À documenter** :

- README utilisateur : tableau des fonctionnalités par navigateur. Exemple :

| Fonctionnalité | Safari | Chrome/Edge | Firefox |
|---|---|---|---|
| Codex et bibliothèques | ✅ | ✅ | ✅ |
| Réserve sur disque (FSAPI) | ❌ (ZIP manuel) | ✅ | ❌ |
| Travaux sur disque (FSAPI) | ❌ (IDB seul) | ✅ | ❌ |
| Importation de grilles partagées | ✅ | ✅ | ✅ |
| Voûte (futur) | ✅ | ✅ | ✅ |

**Tests cross-browser** :

- Suite Playwright à étendre pour couvrir Safari, Chrome, Firefox. Effort : 1 semaine pour la mise en place initiale.
- À chaque release majeure : exécuter la suite sur les 3 navigateurs.

### 7.6 Conséquences sur le modèle de menaces

- **Défense D (révocation FSAPI rémanente)** reste pertinente pour les utilisateurs Chrome/Edge. À conserver dans le modèle.
- **Scénario D-03 (Effacement disque ciblé via FSAPI)** reste valide pour Chrome/Edge. À conserver, avec note explicite qu'il ne s'applique pas à Safari.
- **`MODELE-MENACES.md` §3** : ajouter une mention « FSAPI conditionnelle au navigateur » dans la cartographie §3.4 et §3.5.

### 7.7 Effort total D6

- Audit fallbacks Safari : 1 jour.
- Correction si nécessaire : 2-3 jours.
- Documentation utilisateur : 0.5 jour.
- Tests Playwright cross-browser : 1 semaine de mise en place + maintenance.

**Total** : ~2 semaines.

---

## 8. Décision D7 — Préfixage des IDs Voûte à l'import

### 8.1 Question posée

À l'import d'un package Voûte, les IDs originaux des grilles/échelles/cartouches sont-ils conservés ou ré-attribués ?

### 8.2 Décision

**Préfixage systématique à l'import.** Tout ID importé depuis la Voûte est remplacé par un nouvel ID préfixé `PARTAGE_*`. L'ID source est conservé dans un champ `inspireDe.idOriginal` pour traçabilité de la généalogie, sans risque de collision.

### 8.3 Raisonnement

**Argument anti-pattern** : le `.claude/skills/integrite-globaux/SKILL.md` §3.1 documente l'anti-pattern AP-1 (« Source dérivée de la cible »). Incident du 24 avril 2026 : 3 grilles utilisateur écrasées parce que le pack démo partageait des IDs avec le matériel personnel de Grégoire. Le préfixage systématique élimine cette classe d'erreur **par construction**.

**Argument simplicité** : « préfixer à la conception, pas en runtime » est la règle d'or du skill. Aucun code de détection de collision n'est nécessaire si la collision est impossible par construction du préfixe.

**Argument généalogie** : conserver `inspireDe.idOriginal` permet de répondre à des questions comme « cette grille s'inspire de laquelle dans la Voûte ? » sans créer de dépendance d'ID.

### 8.4 Alternative écartée

**Conserver l'ID original, gérer les collisions au cas par cas** :
- Avantage : continuité du concept d'identité (même grille = même ID partout).
- Inconvénient : nécessite logique de détection + résolution des collisions à chaque import. Reproduit l'erreur du 24 avril si la logique de résolution est imparfaite.
- Raison du rejet : `.claude/skills/integrite-globaux/SKILL.md` AP-1 explicite.

### 8.5 Conséquences code

**À implémenter dans les modules `partage-*.js` (à coder)** :

```javascript
// Pseudo-code conceptuel
async function importerPackageVoute(packageData, signature) {
  // 1. Vérifier signature (D2) et confiance TOFU/WoT (D3)
  if (!await verifierSignatureEtConfiance(packageData, signature)) {
    return { erreur: 'Signature invalide ou confiance refusée' };
  }
  
  // 2. Soumettre à modération si dépôt public (D4)
  // ... ou import direct si partage privé entre utilisateurs ...
  
  // 3. Préfixer les IDs (D7)
  const itemsAvecNouveauxIds = packageData.items.map(item => ({
    ...item,
    id: `PARTAGE_${item.type}_${genererUUID()}`,
    inspireDe: {
      idOriginal: item.id,
      auteurOriginal: packageData.manifest.auteur.nom,
      empreinteOriginale: packageData.manifest.empreinte
    }
  }));
  
  // 4. Sanitisation profonde (Défense B existante) puis ingestion
  for (const item of itemsAvecNouveauxIds) {
    const itemAssaini = assainirObjet(item, SCHEMAS_IMPORT[item.type]);
    await ajouterALaBibliotheque(itemAssaini);
  }
}
```

**Effort estimé** : intégré dans l'effort des modules `partage-*.js` (1 semaine selon spec).

### 8.6 Conséquences pour la spec

`PLAN2-PHASE1-SPEC.md` à mettre à jour :

- §9 « IDs à l'import » : remplacer la formulation actuelle (« conserver à l'import + ré-attribuer en cas de collision Phase 3 ») par « préfixer systématiquement à l'import via `PARTAGE_<type>_<uuid>`, conserver `inspireDe.idOriginal` pour traçabilité ».
- Ajouter section sur le champ `inspireDe` : structure, sémantique, usage.

### 8.7 Conséquences UX

Mineure : un utilisateur qui importe une grille de Marie-Hélène la voit dans sa bibliothèque avec un nouvel ID interne. Le nom et le contenu sont identiques. L'attribution est conservée via `inspireDe.auteurOriginal`. Aucune visibilité utilisateur sur l'ID lui-même.

### 8.8 Risques résiduels

Aucun significatif. La décision élimine une classe entière d'erreurs sans introduire de nouveau risque.

---

## 9. Décisions humaines en attente (G1-G6)

Ces décisions ne sont pas techniques mais conditionnent ou cadrent les décisions techniques précédentes (notamment D1 et D4). Initiation des démarches **cette semaine** en parallèle du code.

### G1 — Avis Loi 25 sur l'anonymisation et le stockage

**Question** : la pseudonymisation réversible (table de correspondance chiffrée localement) est-elle suffisante au sens de la Loi 25, ou faut-il une anonymisation irréversible ?

**Interlocuteur** : responsable de la protection des renseignements personnels du cégep (ou conseil juridique réseau collégial — SRAM, ministère).

**Conditionne** : `PROTECTION-DONNEES-ANONYMISATION.md` Phase 1 (mode par défaut), positionnement Loi 25 dans la communication utilisateur.

**Délai estimé** : 2-6 semaines selon disponibilité.

### G2 — Consentement étudiant pour la recherche pédagogique

**Question** : si les données pédagogiques (anonymisées) sont utilisées pour de la recherche, faut-il un consentement spécifique des étudiants ? Passage par un Comité d'Éthique de la Recherche (CER) obligatoire ?

**Interlocuteur** : CER de ton cégep.

**Conditionne** : périmètre fonctionnel de la Voûte « codex data anonymisé » (pas la Voûte « bibliothèques pédagogiques » qui n'a pas de données étudiantes).

**Délai estimé** : 4-8 semaines (passage en comité).

### G3 — Propriété intellectuelle des grilles créées dans le cadre de l'emploi

**Question** : qui détient la propriété intellectuelle des grilles, échelles, cartouches créées par un enseignant pendant ses heures de travail ? L'enseignant seul, le cégep, ou copropriété ? Qui peut publier dans la Voûte ?

**Interlocuteur** : syndicat enseignant + conventions collectives applicables.

**Conditionne** : qui peut signer un dépôt Voûte avec quelle clé. Possibilité éventuelle de signatures conjointes auteur + institution.

**Délai estimé** : 4-12 semaines (consultations syndicales).

### G4 — Hébergement de la Voûte

**Question** : qui héberge le serveur Voûte (si variante centralisée retenue en D1) ? Qui paie ? Quelle continuité ?

**Interlocuteurs** : TI cégep, AQPC, ministère, consortium d'institutions.

**Conditionne** : D1 (architecture Voûte).

**Délai estimé** : 2-6 mois (démarches institutionnelles).

### G5 — Modération formelle Voûte

**Question** : règles de modération formelle (critères d'acceptation/refus, procédure d'appel, autorité de décision), au-delà de la phase de démarrage où Grégoire modère seul ?

**Interlocuteurs** : à définir avec les premiers utilisateurs Voûte et les institutions partenaires.

**Conditionne** : `MODELE-CONFIANCE.md` à rédiger, évolution de D4.

**Délai estimé** : 3-6 mois (à mesure que la communauté se constitue).

### G6 — Plan de continuité

**Question** : que se passe-t-il pour les données utilisateur et les clés publiques si l'institution garante de la Voûte disparaît, ou si Grégoire ne peut plus assurer la maintenance ?

**Interlocuteurs** : institution garante + plan documenté.

**Conditionne** : confiance long-terme des contributeurs.

**Délai estimé** : à documenter avant ouverture multi-cégep.

---

## 10. Plan d'action consolidé

### 10.1 Cette semaine (mois 1, semaine 1)

**Démarches institutionnelles** :
- [ ] G1 — Contact responsable protection des renseignements personnels du cégep
- [ ] G2 — Contact CER cégep
- [ ] G3 — Contact syndicat enseignant
- [ ] G4 — Premier contact AQPC ou TI cégep sur l'hébergement
- [ ] G5 — Initier réflexion modération formelle
- [ ] G6 — Discuter avec institution garante potentielle

**Documentation** :
- [ ] Marquer `PROTECTION-DONNEES-CHIFFREMENT-REPOS.md` comme « décision : non retenu » (5 min)
- [ ] Fermeture écarts E1 — désynchros MODELE-MENACES (30 min)
- [ ] E2 — Mention « codex data non implémenté » dans 4 docs (15 min)
- [ ] Ajout scénario I-04 « Import MD planification » au MODELE-MENACES (2h, prérequis Voûte)
- [ ] Mise à jour `PLAN2-PHASE1-SPEC.md` : signature ECDSA obligatoire, préfixage IDs, `inspireDe.idOriginal`
- [ ] Création du document `MODELE-CONFIANCE.md` (ébauche)

### 10.2 Mois 1 (mai-juin 2026)

**Code (parallèle aux démarches)** :
- [ ] Module `js/signature.js` (ECDSA P-256, signature/vérification) — 1 semaine
- [ ] Module `js/gestion-cles.js` (génération paire, stockage, phrase de récupération) — 1 semaine
- [ ] Module `js/trust-tofu.js` (stockage clés connues, alertes changement) — 1 semaine

**Fallbacks Safari (D6)** :
- [ ] Audit comportement actuel sur Safari (1 jour)
- [ ] Correction si fallback cassé (2-3 jours)

### 10.3 Mois 2 (juin-juillet 2026)

**Code Voûte applicatif** :
- [ ] Modules `partage-*.js` selon PLAN2-PHASE1-SPEC mise à jour (1 semaine)
- [ ] Module `js/trust-wot.js` (signatures manuelles, graphe local) — 1-2 semaines
- [ ] Module `js/trust-ui.js` (panneau confiances, dialog signature) — 1-2 semaines
- [ ] Outil de modération humaine (D4) — 1 semaine

**Tests** :
- [ ] Extension suite Playwright cross-browser (1 semaine)
- [ ] Tests d'intégration signature + import + modération (1 semaine)

### 10.4 Mois 3 (juillet-août 2026)

**Selon avancement démarches G1-G6** :

Si avis Loi 25 (G1) reçu :
- [ ] Module d'anonymisation Phase 1 selon `PROTECTION-DONNEES-ANONYMISATION.md` (3-4 semaines)

Si D1 mûre :
- [ ] Implémentation de l'infrastructure choisie (variable)

**Documentation utilisateur** :
- [ ] Guide d'utilisation de la Voûte (publier, vérifier, signer un collègue)
- [ ] Tutoriels vidéo si pertinent

### 10.5 Mois 4+ (automne 2026)

**Selon maturité globale** :

- [ ] Ouverture pilote restreinte de la Voûte (Grégoire + 2-3 collègues de confiance)
- [ ] Itération basée sur retours
- [ ] Préparation ouverture multi-cégep si décisions G mûres

### 10.6 Maintenance continue

- Audit trimestriel des bibliothèques (script existant)
- Audit `innerHTML` semestriel
- Revue de ce document à chaque décision majeure
- Veille dépendances (Chart.js, JSZip)

---

## 11. Conditions de réévaluation

Chaque décision sera **réexaminée** dans les conditions suivantes :

### D1 (architecture Voûte)
- Quand les avis G4 et G6 sont reçus.
- Si une opportunité institutionnelle change le contexte (ex. AQPC propose un hébergement gratuit).

### D2 (signature ECDSA Phase 1)
- Si l'effort de 2-3 semaines s'avère significativement plus important (révision possible vers Phase 2).
- Si une vulnérabilité dans ECDSA P-256 est découverte (migration vers Ed25519 ou autre).

### D3 (Web of Trust Variante B)
- Si la communauté demande des fonctionnalités WoT plus avancées (passer à Variante D combinée).
- Si des ancres institutionnelles deviennent disponibles (ajouter Variante C).
- Si l'adoption stagne (envisager des simplifications UX).

### D4 (modération humaine)
- Quand le volume dépasse 10 dépôts/mois (déléguer).
- Quand la communauté atteint 50 utilisateurs actifs (formaliser comité).
- Si un incident révèle une limite (ajuster procédures).

### D5 (pas de chiffrement local)
- Si avis Loi 25 (G1) impose explicitement le chiffrement.
- Si distribution à un public sensible.
- Si incident de fuite documenté.
- Si vulnérabilité Safari/IndexedDB qui affaiblit l'isolation par origin.

### D6 (multi-navigateurs)
- Si une fonctionnalité critique devient impossible sans FSAPI (forcer Chrome/Edge envisageable).
- Si les fallbacks Safari s'avèrent ingérables (réduire à un seul navigateur).

### D7 (préfixage IDs)
- Stable. Pas de condition de réévaluation connue.

---

## 12. Annexes

### A. Documents pertinents

**Source de l'audit** :
- `docs/securite/AUDIT-ETAT-REFLEXION-2026-05-11.md` — Audit qui a déclenché cette session.

**Documents de référence sécurité** :
- `docs/securite/MODELE-MENACES.md` — Threat model complet, 14 scénarios.
- `docs/securite/PROTECTION-FICHIERS-EXPORT.md` — Protection des fichiers d'export.
- `docs/securite/PROTECTION-DONNEES-CHIFFREMENT-REPOS.md` — **Non retenu (D5)**.
- `docs/securite/PROTECTION-DONNEES-VERSIONING-RESILIENCE.md` — Versioning et résilience.
- `docs/securite/PROTECTION-DONNEES-ANONYMISATION.md` — Anonymisation pour partage.
- `docs/securite/BENCHMARK-OBSIDIAN.md` — Comparaison Obsidian (recommandations R1-R6).

**À créer** :
- `docs/securite/MODELE-CONFIANCE.md` — Cercles de confiance Labo Codex (avant ouverture Voûte).

**Skills métier** :
- `.claude/skills/securite-donnees/SKILL.md` — Source de vérité interne (classification, M1-M8, anonymisation, gouvernance).
- `.claude/skills/integrite-globaux/SKILL.md` — Anti-patterns AP-1 à AP-5, justifie D7.
- `.claude/skills/hygiene-donnees-partagees/SKILL.md` — Principes universels.

**Spec Voûte** :
- `docs/architecture/PLAN2-PHASE1-SPEC.md` — Format de partage `labo-codex-partage-v1`. À mettre à jour suite aux décisions D2 et D7.

### B. Glossaire des termes techniques

**AES-GCM** — Algorithme de chiffrement symétrique standard. Mentionné en D5 comme algorithme du chantier non retenu.

**ECDSA P-256** — Elliptic Curve Digital Signature Algorithm sur la courbe P-256. Algorithme de signature retenu en D2.

**FSAPI** — File System Access API. Permet à une application web d'accéder à un dossier sur le disque dur après autorisation explicite. Non supportée par Safari.

**Phrase de récupération** — Suite de mots mnémoniques (typiquement 12 mots BIP39 français) qui encode une clé cryptographique de manière mémorisable. Utilisée pour récupérer une clé privée en cas de perte.

**SHA-256** — Algorithme de hash cryptographique. Produit une empreinte unique de 64 caractères hexadécimaux pour un contenu donné. Utilisé pour les sceaux d'intégrité (Défense H).

**TOFU** — Trust on First Use. Modèle de confiance où l'on accepte la clé publique reçue lors du premier contact, et où toute clé ultérieure différente déclenche une alerte. Modèle SSH par défaut.

**Web Crypto API** — API JavaScript native du navigateur pour les opérations cryptographiques. Disponible sur Safari, Chrome, Firefox, Edge. Utilisée pour ECDSA et SHA-256.

**Web of Trust (WoT)** — Modèle de confiance décentralisé où les utilisateurs signent mutuellement leurs clés publiques. Confiance transitive par chemins de signature. Modèle PGP/GPG.

### C. Historique

| Date | Version | Changement |
|---|---|---|
| 2026-05-11 | 1.0 | Création. Synthèse des 7 décisions architecturales (D1-D7) prises lors de la session du 11 mai 2026, suite à l'audit `AUDIT-ETAT-REFLEXION-2026-05-11`. Plus inscription des démarches G1-G6 à initier en parallèle. Plan d'action mois 1 à mois 4+, conditions de réévaluation par décision, glossaire et liens. |

---

**Fin du document.**
