# Checklist Loi 25 (Québec) pour Labo Codex

**Référence** : *Loi modernisant des dispositions législatives en matière de protection des renseignements personnels* (L.Q. 2021, c. 25), entrée en vigueur progressive 2022-2024.

**Note importante** : cette checklist n'est PAS un avis juridique. Pour validation formelle, consulter :
- Le responsable institutionnel de l'accès à l'information du Cégep de Drummondville.
- La Commission d'accès à l'information du Québec : <https://www.cai.gouv.qc.ca/>

---

## Applicabilité à Labo Codex

**Statut** : Labo Codex traite des renseignements personnels d'élèves (au moins identifiants pseudonymes liés à des performances scolaires). À ce titre, **la Loi 25 s'applique** dès lors que :

- L'application est utilisée par un enseignant employé d'une institution publique (cégep) → Loi sur l'accès aux documents des organismes publics + Loi 25.
- L'application sera diffusée à d'autres enseignants ou intégrée dans un environnement institutionnel.

Le caractère « 100 % hors-ligne » **ne dispense pas** de la Loi 25. Il déplace la responsabilité vers l'utilisateur final et l'institution garante.

---

## Checklist

### 1. Responsable de la protection des renseignements personnels

**Exigence** : désignation d'un responsable.

**Pour Labo Codex** :
- Au niveau institutionnel : le Cégep de Drummondville a un responsable désigné (à identifier).
- Au niveau projet : Grégoire est le mainteneur, à mentionner dans `PRIVACY.md`.

**Statut** : __

---

### 2. Politique de protection des renseignements personnels

**Exigence** : politique publique et accessible.

**Pour Labo Codex** : créer `PRIVACY.md` à la racine du repo et lier depuis l'interface de l'application.

**Contenu minimal de `PRIVACY.md`** :
- Quelles données sont collectées (référer à l'inventaire 5.3).
- Pourquoi (finalité pédagogique).
- Où sont stockées (localement, IndexedDB + localStorage).
- Combien de temps (politique de rétention).
- Qui y a accès (uniquement l'utilisateur de l'appareil).
- Comment exporter/supprimer ses données.
- Comment contacter le responsable.

**Statut** : __

---

### 3. Évaluation des facteurs relatifs à la vie privée (ÉFVP)

**Exigence** (art. 3.3 LCCJTI, applicable depuis 2024) : « tout projet d'acquisition, de développement ou de refonte de système d'information ou de prestation électronique de services impliquant des renseignements personnels » doit faire l'objet d'une ÉFVP.

**Pour Labo Codex** :
- Une ÉFVP simplifiée doit être réalisée avant déploiement institutionnel.
- À l'échelle d'un enseignant unique : moins formel, mais documentation des choix de conception (pourquoi telles données, pourquoi tel stockage) est recommandée.
- À l'échelle d'une diffusion inter-cégeps : ÉFVP formelle requise, à coordonner avec la fédération des cégeps.

**Statut actuel** : à initier au moment de la demande d'adoption institutionnelle.

---

### 4. Consentement

**Exigence** : consentement clair, libre, éclairé, manifesté, donné à des fins spécifiques, granulaire.

**Pour Labo Codex** :
- L'enseignant est l'utilisateur primaire — son consentement est implicite à l'usage.
- Les élèves dont les données sont saisies n'utilisent pas l'application — c'est l'enseignant qui consent à utiliser un outil pédagogique.
- Toutefois, **les élèves doivent être informés** que des micro-données sont collectées sur leur progression (transparence éducative, art. 8 LCCJTI sur la transparence algorithmique).

**Action** : prévoir un texte type « information aux élèves » à intégrer dans le plan de cours, fourni avec Labo Codex.

**Statut** : __

---

### 5. Notification des incidents de confidentialité

**Exigence** : tout incident impliquant un renseignement personnel doit être :
- Documenté dans un registre.
- Notifié à la CAI et aux personnes concernées si le risque est sérieux.

**Pour Labo Codex** :
- Créer `INCIDENTS.md` (gabarit de registre) dans le repo.
- Procédure documentée : qui fait quoi en cas de fuite (ex : iPad volé avec données d'élèves).

**Statut** : __

---

### 6. Droits des personnes concernées

**Exigence** : droit d'accès, de rectification, d'effacement, de portabilité.

**Pour Labo Codex** :
- Droit d'accès : l'enseignant peut consulter toutes les données dans l'application. À l'inverse, un élève qui voudrait savoir quelles données sont conservées sur lui doit pouvoir le demander à l'enseignant.
- Droit de rectification : l'enseignant peut modifier toute donnée saisie.
- Droit d'effacement : prévoir une fonctionnalité « supprimer toutes les données d'un élève » dans l'application, ou documenter la procédure manuelle (suppression de l'entrée IndexedDB).
- Droit de portabilité : l'export ZIP/JSON permet de fournir les données dans un format réutilisable.

**Statut** : __ (à vérifier dans le code)

---

### 7. Décisions automatisées

**Exigence** (art. 12.1 Loi 25) : si une décision exclusivement automatisée est prise, la personne doit en être informée et pouvoir présenter des observations.

**Pour Labo Codex** : **aucune décision automatisée ne devrait être prise par l'application**. L'application produit des indices ; c'est l'enseignant qui décide.

**Vérification** : confirmer dans la documentation et dans l'UI que les indices A-C-P, IDME, blocage sont des **aides à la décision**, pas des décisions. Vocabulaire à privilégier : « indique », « signale », « suggère » (jamais « décide », « détermine », « prédit »).

**Statut** : __

---

### 8. Conservation et destruction

**Exigence** : durée de conservation limitée à la finalité, destruction sécurisée après.

**Pour Labo Codex** :
- Durée de conservation par défaut : à définir (1 trimestre actif + archive personnelle ?).
- Destruction : effacement IndexedDB + localStorage par fonction dédiée dans l'app.
- Sécurité de la destruction : noter que la destruction d'IndexedDB n'efface pas immédiatement les blocs disque (le navigateur les réutilise éventuellement).

**Statut** : __

---

### 9. Transfert hors Québec

**Exigence** : si transfert hors Québec, ÉFVP renforcée, évaluation du cadre juridique du pays de destination.

**Pour Labo Codex** :
- Hébergement Netlify : datacenters principalement aux États-Unis.
- Authentification Cloudflare Access : datacenters mondiaux.
- **Toutefois** : Labo Codex étant hors-ligne, les données pédagogiques ne quittent pas l'appareil. Seules les métadonnées d'accès Cloudflare (IP, email) transitent.
- À documenter clairement dans `PRIVACY.md`.

**Statut** : __

---

### 10. Transparence algorithmique

**Exigence** (art. 12.1 Loi 25) : si un système utilise un traitement automatisé qui influence une décision, la personne concernée doit pouvoir comprendre les principes du raisonnement.

**Pour Labo Codex** : c'est exactement le rôle du blog Codex Numeris et de la documentation. **Atout réel** : la transparence du raisonnement (IDME, A-C-P, blocage) est documentée publiquement.

À renforcer : créer une page « Comment Labo Codex raisonne » à intégrer dans l'application elle-même (en plus du blog).

**Statut** : __

---

## Synthèse

| Exigence | Statut |
|---|---|
| 1. Responsable | __ |
| 2. Politique | __ |
| 3. ÉFVP | __ |
| 4. Consentement | __ |
| 5. Notification incidents | __ |
| 6. Droits personnes | __ |
| 7. Décisions automatisées | __ |
| 8. Conservation | __ |
| 9. Transfert hors Québec | __ |
| 10. Transparence | __ |

**Statut global** :
- Vert : toutes les exigences en vert (ou N/A justifié).
- Jaune : ≤ 3 exigences à compléter (documentation manquante).
- Rouge : ≥ 1 exigence en rouge (non-conformité substantielle).

---

## Documents à créer suite à cet audit

1. `PRIVACY.md` à la racine du repo.
2. `INCIDENTS.md` (gabarit de registre).
3. Texte type « information aux élèves » à intégrer dans le plan de cours.
4. Section « Comment Labo Codex raisonne » dans l'application (transparence algorithmique).

---

## Référence officielle

- Commission d'accès à l'information du Québec : <https://www.cai.gouv.qc.ca/>
- Texte de la Loi 25 : <https://www.publicationsduquebec.gouv.qc.ca/fichiers/lois-et-reglements/lois-annuelles/2021/2021C25F.PDF>
- Guide PME et OBNL de la CAI : <https://www.cai.gouv.qc.ca/protection-renseignements-personnels/entreprises/>
