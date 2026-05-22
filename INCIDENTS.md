# Registre et procédure des incidents de confidentialité — Labo Codex

> **Version** : 1.0 (DRAFT du 22 mai 2026, soumis à validation)
> **Cadre légal** : Loi 25, art. 63.5 — obligation de tenir un registre
> des incidents de confidentialité.
> **Documents apparentés** : [`PRIVACY.md`](PRIVACY.md), [`DEPLOY.md`](DEPLOY.md)

Ce document a deux fonctions :
1. **Une procédure** de signalement et de gestion d'incident (§2 à §6).
2. **Un registre** chronologique des incidents survenus (§7).

---

## 1. Cadre légal et portée

### 1.1 Article 63.5 de la Loi 25 (Québec)

> *Toute personne qui exploite une entreprise [...] doit tenir un registre
> des incidents de confidentialité. Ce registre doit être communiqué à la
> Commission [d'accès à l'information] à sa demande.*

La Loi 25 impose la tenue d'un tel registre aux **entreprises** et aux
**organismes publics** québécois. Le statut juridique exact de Labo Codex
en tant qu'application en pratique pédagogique individuelle est en cours
de clarification avec le responsable PRP du Cégep de Drummondville (voir
[`PRIVACY.md`](PRIVACY.md) §10).

**Indépendamment de ce statut**, ce registre est tenu par l'auteur dans
l'esprit de la Loi 25 — par souci de transparence et pour anticiper une
éventuelle adoption institutionnelle.

### 1.2 Durée de conservation du registre

Le registre est conservé **au moins 5 ans** après la date de chaque
incident consigné, conformément à l'usage recommandé par la Commission
d'accès à l'information (CAI).

### 1.3 Périmètre

Ce registre couvre les incidents qui touchent :
- Les **données étudiantes** stockées localement par l'auteur ou par un
  collègue utilisant Labo Codex.
- Les **données enseignantes** (auteurs, personnes ayant reçu un accès,
  contacts) qui apparaissent dans le dépôt GitHub public, les rapports de
  bug archivés, la liste blanche Cloudflare Access, ou tout autre composant.
- L'**intégrité du code** déployé (compromission du pipeline GitHub →
  Netlify → Cloudflare).

---

## 2. Qu'est-ce qu'un incident de confidentialité ?

Au sens de la Loi 25 (art. 3.6 et suivants), un incident de confidentialité
est :

> *L'accès non autorisé par la loi à un renseignement personnel,
> son utilisation ou sa communication non autorisée par la loi,
> de même que la perte d'un tel renseignement ou toute autre atteinte
> à sa protection.*

### 2.1 Types d'incidents pertinents pour Labo Codex

| Type | Exemple concret |
|---|---|
| **Accès non autorisé** | Vol d'un MacBook contenant un Codex non chiffré. Compromission d'un compte GitHub/Netlify/Cloudflare. |
| **Utilisation non autorisée** | Un collègue à qui l'auteur a partagé un fichier l'utilise en dehors du cadre convenu. |
| **Communication non autorisée** | Envoi par erreur d'un export non anonymisé à un destinataire non habilité. Inclusion par inadvertance de données identifiantes dans le repo GitHub public. |
| **Perte** | Codex perdu ou non récupérable (corruption disque, suppression accidentelle sans backup). |
| **Atteinte à l'intégrité** | Modification non sollicitée des données par un bug, par un import malveillant, ou par défaillance matérielle. |

### 2.2 Ce qui n'est PAS un incident au sens du registre

- Un bug logiciel qui n'affecte pas la confidentialité ou l'intégrité des
  données (à signaler via [GitHub Issues](https://github.com/bedardg71-codexnumeris/Monitorage_v6/issues),
  pas ici).
- Une demande de retrait d'une personne de la liste blanche Cloudflare
  Access (à traiter via `labo@codexnumeris.org`, pas un incident).
- Une difficulté d'utilisation ou un retour de testeur (consigné dans
  `Retours des testeurs/SUIVI-BUGS.md`).

---

## 3. Procédure de signalement

### 3.1 Qui peut signaler

Toute personne — auteur, collègue ayant un accès, étudiant, parent,
responsable PRP, juriste, observateur — qui suspecte un incident touchant
Labo Codex.

### 3.2 Comment signaler

| Canal | Quand l'utiliser |
|---|---|
| **Courriel** à [labo@codexnumeris.org](mailto:labo@codexnumeris.org) | Voie principale. Précisez « INCIDENT DE CONFIDENTIALITÉ » en objet. |
| **Responsable PRP du Cégep de Drummondville** (coordonnées dans [`PRIVACY.md`](PRIVACY.md) §11) | Si le signalement vient d'un étudiant du Cégep ou si l'incident touche l'institution. |
| **Commission d'accès à l'information (CAI)** : [cai.gouv.qc.ca](https://www.cai.gouv.qc.ca) | Plainte formelle après absence de réponse satisfaisante. |

### 3.3 Quoi inclure dans le signalement

Pour permettre une évaluation rapide :

1. **Date et heure** de l'incident (ou de sa découverte si différente).
2. **Description factuelle** de ce qui s'est passé.
3. **Données concernées** : étudiantes, enseignantes, configuration,
   code source ; nombre approximatif de personnes touchées.
4. **Comment l'incident a été découvert** (alerte automatique, témoin,
   audit, hasard).
5. **Mesures déjà prises** par la personne qui signale (le cas échéant).

### 3.4 Délais

| Étape | Délai cible |
|---|---|
| Accusé de réception par l'auteur | **24 heures** après signalement |
| Évaluation préliminaire (gravité, risque) | **72 heures** après accusé |
| Première réponse au signalant | **7 jours** après évaluation |
| Inscription au registre | **Avant** la première réponse |
| Notification à la CAI (si « risque sérieux de préjudice ») | **Dans les meilleurs délais** (art. 63.7 Loi 25) |
| Notification aux personnes concernées (si risque sérieux) | **Dans les meilleurs délais** (art. 63.7 Loi 25) |

---

## 4. Évaluation du risque sérieux de préjudice

L'article 63.7 de la Loi 25 distingue les incidents qui présentent un
« risque sérieux de préjudice » des autres. Cette distinction conditionne
les obligations de notification.

### 4.1 Critères d'évaluation

Selon les lignes directrices de la CAI, les facteurs à considérer
incluent :

| Facteur | Pondération |
|---|---|
| **Sensibilité** des renseignements (nom + DA + notes → CRITIQUE) | Élevée |
| **Probabilité d'utilisation malveillante** (perte vs vol ciblé) | Élevée |
| **Nombre** de personnes touchées | Modérée |
| **Étendue temporelle** de l'exposition | Modérée |
| **Mesures de mitigation** déjà en place (chiffrement, etc.) | Élevée |

### 4.2 Décision

L'évaluation est documentée dans l'entrée du registre (§7). En cas
d'incertitude sur la qualification de « risque sérieux », l'auteur
**consulte le responsable PRP du Cégep** avant de décider.

### 4.3 Si « risque sérieux de préjudice » est constaté

Obligations cumulatives (Loi 25 art. 63.7-63.8) :

1. **Notifier la CAI** sans délai déraisonnable, via le [formulaire en
   ligne CAI](https://www.cai.gouv.qc.ca/) — incident de confidentialité.
2. **Notifier les personnes concernées** par écrit, en leur indiquant :
   - La nature de l'incident
   - Les renseignements concernés
   - Les mesures prises pour réduire le risque
   - Les mesures qu'elles peuvent prendre elles-mêmes
   - Comment exercer leurs droits (art. 27, 28, 28.1 — voir [`PRIVACY.md`](PRIVACY.md) §9)
3. **Conserver** copie des notifications dans le registre.

---

## 5. Mesures correctrices

### 5.1 Immédiat (premières 24 h)

- **Contenir** : isoler la cause, suspendre temporairement l'accès si
  nécessaire (révoquer une session Cloudflare, retirer un courriel de
  la liste blanche, fermer temporairement le repo).
- **Documenter** : capture d'écran, copie de logs, état exact au moment
  de la découverte.
- **Informer** les personnes habilitées (PRP du Cégep si pertinent).

### 5.2 Court terme (premières semaines)

- **Investiguer** la cause technique ou humaine.
- **Corriger** la faille ou la cause racine (code, procédure, formation).
- **Notifier** si « risque sérieux » constaté.
- **Mettre à jour** ce document si la procédure doit être améliorée.

### 5.3 Long terme

- **Réviser** la politique de confidentialité (`PRIVACY.md`) si l'incident
  révèle un angle mort.
- **Auditer** les autres surfaces susceptibles d'être affectées par la
  même cause.
- **Bilan annuel** des incidents (résumé dans le rapport annuel d'audit
  Labo Codex).

---

## 6. Communication transparente

Tout incident **résolu et anonymisé** peut être référencé publiquement
dans ce document à des fins de transparence et d'apprentissage collectif.
Les détails sensibles (noms, données concernées) sont **toujours retirés
ou agrégés** avant publication.

Cette pratique est cohérente avec l'esprit du projet Labo Codex (audit
volontaire, transparence assumée — voir [`audit/CONTEXTE-COWORK.md`](audit/CONTEXTE-COWORK.md)).

---

## 7. Gabarit d'entrée au registre

Chaque incident est consigné en suivant ce gabarit. Les entrées sont
listées en §8 par ordre antichronologique (le plus récent en premier).

```markdown
### Incident #YYYY-NNN — [titre court factuel]

**Date de l'incident** : YYYY-MM-DD (heure si pertinente)
**Date de découverte** : YYYY-MM-DD
**Date d'inscription au registre** : YYYY-MM-DD
**Statut** : Ouvert / En cours d'investigation / Résolu / Clos
**Gravité estimée** : Faible / Modérée / Élevée / Risque sérieux de préjudice
**Signalé par** : Auteur / Expérimentateur / Étudiant / Autre

#### Description factuelle

[Ce qui s'est passé, sans interprétation.]

#### Données concernées

| Type | Nombre approximatif | Sensibilité |
|---|---:|---|
| Ex : noms d'étudiants | N | CRITIQUE |
| Ex : notes | N | SENSIBLE |

#### Évaluation du risque sérieux de préjudice

| Facteur | Évaluation |
|---|---|
| Sensibilité des renseignements | ... |
| Probabilité d'utilisation malveillante | ... |
| Nombre de personnes touchées | ... |
| Étendue temporelle de l'exposition | ... |
| Mesures de mitigation déjà en place | ... |

**Conclusion** : risque sérieux de préjudice : OUI / NON / À CONFIRMER
**Justification** : ...

#### Mesures prises

1. **Immédiat (24h)** : ...
2. **Court terme** : ...
3. **Long terme** : ...

#### Notifications

- CAI : N/A | Notifiée le YYYY-MM-DD | Référence : ...
- Personnes concernées : N/A | Notifiées le YYYY-MM-DD | Méthode : ...
- Responsable PRP du Cégep : N/A | Notifié le YYYY-MM-DD

#### Suivi

[Statut courant, prochaines étapes, date de la prochaine revue.]

#### Pièces jointes

- [Lien vers documents internes, captures, etc.]
```

---

## 8. Registre des incidents

### Aucun incident enregistré à ce jour

Au 22 mai 2026, **aucun incident de confidentialité n'a été constaté ou
signalé** depuis le démarrage du projet Labo Codex en septembre 2024.

Cette absence d'incident ne signifie pas que le risque est nul. Elle
reflète :
- Une utilisation **essentiellement individuelle** par l'auteur sur sa
  propre machine.
- Une **diffusion limitée et essentiellement passive** : un accès individuel
  Cloudflare Access a été accordé à 51 personnes entre janvier et mai 2026,
  mais la quasi-totalité a brièvement consulté l'application puis n'y est
  pas revenue (voir [`PRIVACY.md`](PRIVACY.md) §6.2).
- Une **absence de retours de bug** signalant un incident.
- Une **absence d'audit externe** qui pourrait avoir détecté des fuites
  non visibles à l'auteur.

L'audit annuel volontaire de mai 2026 (`audit/`) a identifié des
**vulnérabilités potentielles** (sans incident exploité connu) — voir
[`audit/reports/SUMMARY-internal.md`](audit/reports/SUMMARY-internal.md)
si disponible. Ces vulnérabilités sont traitées par les plans court et
moyen terme et **ne constituent pas des incidents à inscrire ici**, tant
qu'une exploitation effective n'a pas été constatée.

---

## 9. Historique des révisions du présent document

| Date | Version | Modification |
|---|---|---|
| 2026-05-22 | 1.0 DRAFT | Création du registre + procédure. Aucun incident à enregistrer à ce jour. |
