# Modèle de confiance — Labo Codex

> **Document de gouvernance** — 10 juin 2026 (action E8 de l'audit sécurité du 11 mai 2026)
> Rédigé à la livraison des lots P1-P4 du chantier #329 (partage par fichiers signés),
> avant le jalon pilote. Source des textes utilisateur du guide (P7).
>
> Références : `DECISIONS-ARCHITECTURALES-2026-05-11.md` (D2, D3, D4),
> `BENCHMARK-OBSIDIAN.md` §8 (cercles de confiance, R2),
> `AUDIT-ETAT-REFLEXION-2026-05-11.md` (E8), `MODELE-MENACES.md` (M1-M8),
> `SKILL_Securite_donnees.md` §6.
>
> **Statut de la Voûte serveur** : ce document couvre la phase ACTUELLE — le
> partage par fichiers `.lcz`, sans serveur. La section 6 fixe ce qui devra
> être réglé avant toute Voûte centralisée (D1 reste en attente).

---

## 1. Les cercles de confiance

Chaque donnée de Labo Codex vit dans un cercle, du plus interne au plus
externe. Changer de cercle exige un geste explicite — jamais automatique.

| Cercle | Contenu | Qui y a accès | Confiance |
|---|---|---|---|
| **1. Codex personnel** | Données étudiantes, évaluations, configurations | L'enseignant·e seul·e, sur sa machine | Totale — c'est ta saisie |
| **2. Partage direct signé (`.lcz`)** | Ressources pédagogiques (grilles, échelles, cartouches, productions, pratiques) — JAMAIS de données étudiantes | Les personnes à qui tu transmets le fichier (courriel, USB) | Dans la personne + vérifiée par signature et TOFU |
| **3. Voûte centralisée (future)** | Ressources déposées publiquement | Communauté Labo Codex | À construire — modération D4, voir §6 |

Deux règles de passage entre cercles :

1. **Du cercle 1 vers le 2** : seules les ressources pédagogiques (données
   NON SENSIBLES, classification §1.4 de `SKILL_Securite_donnees.md`)
   peuvent sortir. L'export `.lcz` projette sur des schémas fermés qui
   excluent par construction les champs locaux et identifiants ; les
   données étudiantes n'ont aucun chemin vers un package.
2. **Du cercle 2 vers le 1** : un package importé reste à part (namespace
   `partage_*`, lecture seule). Il n'entre dans tes documents que par
   « Dupliquer » — geste explicite, copie tracée (`inspireDe`).

---

## 2. Les trois mécanismes techniques et ce qu'ils garantissent

### 2.1 Validation (lot P1) — « le fichier est-il sain et conforme ? »

Six niveaux : structure, manifeste, schémas fermés par entité, intégrité
référentielle, sanitisation (pattern dangereux = rejet entier), chaîne
d'auteur réservée. **Garantit** : aucun champ inconnu, aucun contenu
exécutable, limites de taille. **Ne garantit pas** : que le contenu
pédagogique est bon ou honnête.

### 2.2 Signature ECDSA (lot F, décision D2) — « le fichier vient-il bien de cette clé, intact ? »

Chaque installation de Labo Codex crée une paire de clés (P-256). La clé
privée est non extractible et ne quitte jamais la machine. Le package
entier est signé ; un octet modifié invalide la signature. Un package non
signé ou à signature invalide est **rejeté** sans exception.
**Garantit** : intégrité (pas d'altération en chemin) et authenticité
technique (émis par le détenteur de la clé). **Ne garantit pas** : que le
détenteur de la clé est bien la personne dont le nom figure au manifeste.

### 2.3 Confiance TOFU (lot T, décision D3) — « cette clé est-elle celle de la personne nommée ? »

*Trust On First Use* : au premier import accepté d'une personne, sa clé est
mémorisée localement (`clesConnues`). Ensuite :

| Situation | Statut | Comportement |
|---|---|---|
| Auteur inconnu | `nouveau` | Import possible, clé mémorisée à l'acceptation ; l'interface dit honnêtement que ce premier contact n'est pas garanti |
| Même auteur, même clé | `verifiee` | Continuité confirmée |
| Même auteur, AUTRE clé | `cle_changee` | **Alerte bloquante** ; refus par défaut ; accepter exige un choix explicite |

**Garantit** : la continuité d'identité après le premier contact — personne
ne peut se faire passer pour un contact connu sans déclencher l'alerte
(y compris par variation typographique du nom, normalisé NFC/casse/espaces).
**Ne garantit pas** : l'identité au premier contact (voir §3.1).

---

## 3. Limites assumées (à dire honnêtement aux utilisateurs)

### 3.1 Le premier contact n'est pas garanti

TOFU ne protège pas contre un premier fichier piégé : quelqu'un peut signer
un package sous un faux nom une première fois. Mitigation : **vérifier par
un autre canal** (courriel direct, téléphone, en personne) quand un fichier
arrive d'une personne dont on n'a encore rien importé. Le texte UI le dit
au moment de l'import (lot T).

### 3.2 Perte de clé = nouvelle identité

Une clé privée perdue (changement de machine, réinitialisation du
navigateur) n'est pas récupérable en phase pilote. La personne regénère une
identité ; ses contacts verront l'alerte « clé changée » à son prochain
envoi et devront confirmer le changement par un autre canal. C'est voulu :
l'alerte EST le mécanisme. (Sauvegarde chiffrée de la clé : item #47,
reconsidéré après le pilote.)

### 3.3 Vol de clé

Si la machine d'une personne est compromise, sa clé peut signer des
packages frauduleux qui passeront toutes les vérifications. Mitigations :
verrouillage de session (responsabilité utilisateur, §5.1 du skill
sécurité), clé non extractible (un vol « simple » du profil navigateur ne
suffit pas à exporter la clé), et la modération humaine (§5) pour le volet
social.

### 3.4 La validité technique ne vaut pas validité pédagogique

Un package signé, vérifié et conforme peut contenir une grille
pédagogiquement mauvaise, trompeuse ou plagiée (menace M4). Aucun mécanisme
technique ne couvre ce cas : c'est le rôle du jugement professionnel de la
personne qui importe, et de la modération humaine (D4) au niveau
communautaire.

---

## 4. Couverture des menaces (rappel M1-M8)

| Menace | Couverture en phase fichiers |
|---|---|
| M1 — Usurpation au dépôt | Signature (D2) + TOFU (D3) après premier contact ; premier contact = vigilance humaine (§3.1) |
| M3 — Injection de code | Validation 6 niveaux + CSP + rejet des patterns dangereux |
| M4 — Contenu falsifié | NON couverte techniquement → jugement professionnel + modération D4 |
| M5 — Spam / DoS | Sans objet sans serveur (le destinataire choisit ce qu'il ouvre) |
| M6 — Exfiltration | Les packages ne contiennent que des ressources pédagogiques (schémas fermés) ; données étudiantes sans chemin d'export |
| M2, M7, M8 | Hors périmètre du partage (Codex/Réserve/anonymisation — voir skill sécurité) |

---

## 5. Gouvernance de la modération (décision D4)

### 5.1 Autorité

**Grégoire Bédard est le modérateur unique au démarrage** — autorité de
fait, assumée et explicite (D4 §5.3). La procédure opérationnelle vit dans
`docs/securite/CHECKLIST-MODERATION.md`.

### 5.2 Critères d'acceptation d'une ressource partagée

Une ressource est acceptable si elle satisfait les quatre volets :

1. **Pédagogique** : c'est un matériel d'enseignement réel (grille,
   échelle, cartouche, production, pratique) — pas un véhicule pour autre
   chose.
2. **Légal** : pas de contenu diffamatoire ; pas de plagiat manifeste ;
   licence CC BY-NC-SA 4.0 respectée (attribution présente, pas de
   réutilisation commerciale).
3. **Technique** : passe la validation de Labo Codex sans contournement.
4. **Éthique** : aucune donnée personnelle (étudiante ou de tiers), aucun
   contenu discriminatoire ou offensant, même « à titre d'exemple ».

### 5.3 Procédure d'appel d'un refus

En phase pilote, l'appel est informel : la personne écrit à
labo@codexnumeris.org avec ses arguments ; Grégoire répond avec motifs dans
un délai raisonnable. La décision finale lui revient. À l'échelle (50+
utilisateurs), un second avis indépendant devra exister avant tout refus
définitif (cf. évolution D4 §5.7).

### 5.4 Révocation a posteriori

Une ressource acceptée puis jugée problématique est révoquée : avis aux
personnes connues l'ayant reçue, retrait de la copie de référence, et au
besoin retrait de la confiance TOFU envers l'auteur (`oublierAuteur`).
Détail opérationnel dans la checklist.

### 5.5 Délégation et succession

- **Délégation** : possible dès la phase de croissance (10-50 utilisateurs)
  vers 1-2 personnes de confiance ayant participé au pilote ; les critères
  §5.2 et la checklist sont le contrat de délégation.
- **Succession** : si Grégoire ne peut plus modérer, la modération est
  suspendue (aucun nouveau dépôt accepté dans une éventuelle Voûte
  centralisée) jusqu'à reprise par une personne ou un comité désigné par la
  communauté de pratique. Le partage direct par fichiers, lui, continue de
  fonctionner sans modérateur — c'est une propriété voulue de
  l'architecture sans serveur.

---

## 6. Ce qui devra être réglé AVANT une Voûte centralisée (D1)

La phase fichiers n'exige ni compte, ni serveur, ni registre central. Une
Voûte centralisée exigera de trancher (questions §6.2 du skill sécurité) :
l'authentification (SSO cégep ? invitation ?), le retrait de dépôts
(autorité, procédure formelle), les litiges de propriété intellectuelle,
le financement et la continuité de l'infrastructure, la révocation d'accès.
**Aucun de ces points ne bloque le pilote actuel.** Ce document devra être
révisé à ce moment-là.

---

## 7. Vocabulaire (décision D-V2, tranchée le 10 juin 2026)

Dans l'INTERFACE et les textes utilisateur : **« partage »** (« Partage
entre collègues », « Exporter pour partager », « Importer un partage »,
« Partagés par des collègues »). **« Voûte »** est réservé aux documents
d'architecture et désigne le CONCEPT d'espace partagé (dont la phase
fichiers est la première incarnation) et la future bibliothèque
centralisée. Raisons : « partage » se comprend sans guide ; « Voûte »
nommerait dans l'UI une infrastructure centrale qui n'existe pas encore ;
et c'est la convention de fait des lots P2-P4 livrés.

---

## HISTORIQUE

| Date | Changement |
|---|---|
| 2026-06-10 | Création (E8). Cercles de confiance, garanties et limites des mécanismes P1/F/T, gouvernance D4 (critères, appel, révocation, délégation, succession), D-V2 tranchée. Rédigé en session Claude Code à la livraison de P3-P4, validé par Grégoire. |
