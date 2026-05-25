# ADR-011 : Architecture quatre espaces de données (Codex / Réserve / Codex data / Voûte)

**Statut** : Acté rétroactivement
**Date de décision originale** : 26 avril 2026 (cf. `docs/architecture/ECOSYSTEME-DONNEES.md`) — formalisation ADR : 14 mai 2026
**Auteur** : Grégoire Bédard

---

## Contexte

L'application gère des données volumineuses : données structurées (présences, évaluations, indices, snapshots) et fichiers travaux (photos de productions, PDF). Pour un trimestre typique (2 groupes de 25 étudiants, 10 productions × 2-3 photos), les travaux seuls pèsent ~1 Go.

Jusqu'au printemps 2026, deux mécanismes coexistaient sans distinction claire :
- **« Exporter les données »** — sauvegarde sélective par clés (JSON ou ZIP).
- **« Enregistrer le codex »** — espace de travail portable (ZIP compressé).

Les deux tentaient de tout faire — backup, portabilité, archivage. Résultat : fichiers de 800 Mo à 1,7 Go, iPad saturé, confusion entre les deux mécanismes, historique TimeMachine invisible qui doublait la taille du codex.

Le 26 avril 2026, le document `docs/architecture/ECOSYSTEME-DONNEES.md` a posé une architecture à quatre concepts séparés, chacun avec une vocation, un format et un cycle de vie propres.

**Note terminologique** : le document `ECOSYSTEME-DONNEES.md` utilise « Archives » mais le module implémenté (`js/reserve.js`) et le backlog (#253, #254, #257) ont retenu « Réserve ». La présente ADR utilise « Réserve » comme terme canonique. Le document architectural sera réaligné dans un chantier d'hygiène ultérieur.

---

## Décision

**Quatre espaces de données distincts**, chacun avec une vocation, un format et un cycle de vie propres :

### 1. Codex (espace de travail actif)

- **Vocation** : l'espace de travail que l'enseignant ouvre le matin et enregistre sur sa clé USB en fin de semaine.
- **Portée** : 1 trimestre actif.
- **Contenu** : données structurées + travaux (blobs).
- **Format** : `.codex.zip` (DEFLATE niveau 6).
- **Taille** : 400-800 Mo.
- **Fréquence** : ~1×/semaine.
- **Verbes** : *ouvrir, enregistrer, enregistrer sous*.
- **Module** : `js/codex.js`.

### 2. Réserve (archive locale du fonds enseignant)

- **Vocation** : coffre-fort de l'enseignant — accumule les données qui ne sont plus actives mais doivent rester consultables.
- **Portée** : multi-trimestre, historique cumulé.
- **Contenu** : versements de trimestres terminés, fonds documentaire personnel.
- **Verbes** : *verser, ouvrir, consulter, importer depuis*.
- **Module** : `js/reserve.js` (versement) + `js/reserve-ouvrir.js` (réimport).

### 3. Codex data (format de recherche / partage)

- **Vocation** : extraction de données structurées sans les fichiers, dans un format orienté analyse / recherche.
- **Portée** : 1 ou plusieurs trimestres.
- **Contenu** : données structurées (JSON), sans blobs.
- **Verbes** : *exporter pour la recherche, importer dans le Labo*.

### 4. Voûte (bibliothèque collective partageable — futur)

- **Vocation** : bibliothèque partagée entre enseignants pour les ressources pédagogiques (grilles, échelles, cartouches, productions).
- **Portée** : collective, multi-utilisateurs.
- **Contenu** : artefacts pédagogiques anonymisés (pas de données étudiantes).
- **Statut implémentation** : décision D1 en attente (cf. sous-audit 5.1 OWASP §3). Phase 1 démarre juillet 2026 (cf. `docs/CALENDRIER.md`).

### Vocabulaire de référence (cohérent dans le code et la documentation)

- *ouvrir / enregistrer* → Codex.
- *verser / consulter / importer depuis* → Réserve.
- *exporter pour la recherche* → Codex data.
- *emprunter de la voûte / partager dans la voûte* → Voûte.

Les verbes ambigus comme *sauvegarder*, *backup*, *archiver* sont **proscrits** dans l'UI applicative au profit du vocabulaire spécifique à chaque espace.

---

## Conséquences

### Positives

- **Vocabulaire clair pour l'enseignant** : un verbe par espace, pas d'amalgame.
- **Cycles de vie séparés** : un codex pèse 400-800 Mo et tourne sur une semaine ; une réserve grossit lentement et reste sur le Mac ; une voûte n'inclut jamais de données étudiantes.
- **Couverture du cas d'usage recherche** : le Codex data permet à un chercheur de récupérer des données anonymisées sans charger les fichiers de travaux.
- **Compatibilité Loi 25** : la séparation Voûte vs Codex enforce une frontière claire — ce qui est partagé est explicitement anonymisé.
- **Maintenance modulaire** : chaque espace est un module ou un groupe de modules (`codex.js`, `reserve.js`, `reserve-ouvrir.js`, et à venir `voute.js`).

### Négatives

- **Coût cognitif initial** pour l'utilisateur : il faut comprendre la distinction Codex / Réserve / Codex data. Section Aide à étoffer.
- **Migration des anciens « exports tout-en-un »** : les utilisateurs qui ont des ZIP « legacy » doivent les importer dans le bon espace. Procédure de migration à formaliser.
- **Voûte future** non encore implémentée : la place est réservée mais le contrat n'est pas finalisé (cf. ADR-008 pour la couche d'accès).
- **Décalage terminologique transitoire** entre le document architectural (« Archives ») et le code (« Réserve »). À résoudre dans un chantier d'hygiène.

### Neutres

- **Stockage interne IDB** reste géré par `db.js` (cf. ADR-002) — la séparation en 4 espaces est conceptuelle au niveau de l'utilisateur, pas une partition dure du stockage navigateur.

---

## Alternatives considérées

### Option A : Garder le système binaire « exports + codex »

**Écartée** parce qu'elle confondait des cas d'usage très différents et produisait des fichiers de 1+ Go ingérables sur iPad.

### Option B : Trois espaces seulement (sans Codex data)

Aurait été plus simple. **Écartée** parce que le cas d'usage recherche (exportation de données pour analyse) est suffisamment distinct pour mériter son propre format — sinon il finit par contaminer le format Codex avec des préoccupations de recherche.

### Option C : Un format unique paramétrable

Aurait été techniquement défendable mais coûteux en complexité de configuration et en confusion utilisateur.

---

## Références

- `docs/architecture/ECOSYSTEME-DONNEES.md` — document fondateur (26 avril 2026, 460+ lignes).
- `js/codex.js`, `js/reserve.js`, `js/reserve-ouvrir.js` — implémentation.
- Audit annuel 2026, sous-audit 5.1 OWASP §3 — risques de la Voûte future.
- `docs/CALENDRIER.md` — calendrier Voûte Phase 1 démarrage juillet 2026.
- Mémoire utilisateur `project_reserve` — détails techniques du versement.

---

## Notes de révision

À réviser si :
- L'implémentation de la Voûte (juillet 2026+) impose un cinquième espace (par exemple une « Voûte privée d'établissement » distincte de la voûte communautaire).
- Le décalage terminologique « Archives / Réserve » est résolu — réécrire ce document pour aligner.

---

**Source du format** : Michael Nygard, *Documenting Architecture Decisions* (2011).
