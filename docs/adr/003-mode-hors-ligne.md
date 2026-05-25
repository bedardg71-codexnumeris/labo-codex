# ADR-003 : Mode 100 % hors-ligne

**Statut** : Acté rétroactivement
**Date de décision originale** : octobre 2025 (formalisation : 14 mai 2026)
**Auteur** : Grégoire Bédard

---

## Contexte

Labo Codex est utilisé par un enseignant en salle de classe et au cégep, sur des postes hétérogènes : MacBook personnel, iPad Air, parfois ordinateurs prêtés. L'usage typique comprend :
- Consultation de profils étudiants pendant les cours, parfois sans accès Wi-Fi fiable.
- Saisie d'évaluations le soir à la maison.
- Démonstrations en classe avec projection.
- Partage du dossier de l'application par USB ou clé Codex.

Les données manipulées sont **sensibles** (noms, présences, performances d'étudiants identifiés), ce qui exige une attention particulière à la Loi 25 québécoise (cf. sous-audit 5.4). Tout transit serveur — même pour une simple télémétrie — élargit la surface de risque réglementaire.

Plusieurs options d'hébergement ont été envisagées : SaaS classique avec backend, application desktop Electron, PWA avec sync, ou pur client-side hors-ligne.

---

## Décision

**Labo Codex fonctionne entièrement côté client, sans serveur d'application et sans connexion réseau.** Toutes les données sont stockées localement (cf. ADR-002). Aucune requête réseau n'est émise par l'application au runtime, à l'exception des chargements initiaux des assets statiques quand l'app est hébergée sur Netlify (cf. ADR-008 pour la couche d'accès).

Conséquence directe :
- **Aucune télémétrie**, aucun analytics, aucun appel à des services tiers (Google Fonts, fonts CDN, analytics CDN).
- **CSP `script-src 'self'`** dans `index.html` — toute tentative d'exécuter un script externe est bloquée.
- **Librairies tierces vendored** dans `libs/` plutôt que chargées via CDN.

---

## Conséquences

### Positives

- **Souveraineté des données** : aucune information étudiante ne quitte le poste local sans action explicite (export). Conformité Loi 25 simplifiée (cf. sous-audit 5.4).
- **Résilience** : l'app fonctionne en cas de coupure réseau, dans une école avec Wi-Fi instable, en classe avec projection sans connexion.
- **Performance** : pas de latence réseau, pas de blocage UI sur un appel API.
- **Pas de coût d'hébergement variable** : Netlify gratuit suffit pour servir les assets statiques.
- **Portabilité maximale** : on peut ouvrir `index.html` directement en `file://` ou depuis une clé USB.

### Négatives

- **Pas de partage temps réel** entre appareils ou enseignants. Le mécanisme « Codex » (export/import ZIP, cf. ADR-011) compense partiellement.
- **Pas de backup serveur** : si l'enseignant perd son disque dur sans backup local, les données sont perdues. Mitigation : backups Codex réguliers + iCloud + USB.
- **Pas de monitoring** : aucune télémétrie ne signale les bugs en production. Le mainteneur dépend des retours testeurs (`Retours des testeurs/SUIVI-BUGS.md`).
- **Pas de mises à jour automatiques** : l'utilisateur doit télécharger la nouvelle version. Mitigation : bandeau « Scripts périmés » au démarrage si le BUILD_ID change.

### Neutres

- **Quota stockage navigateur** s'applique fortement, en particulier en Safari `file://` (cf. ADR-002).
- **Authentification** : impossible côté client (aucun secret ne peut être stocké en sécurité). Déléguée à la couche d'accès (cf. ADR-008).

---

## Alternatives considérées

### Option A : SaaS classique avec backend

Aurait permis le sync multi-appareil, le partage entre enseignants, le backup centralisé. **Écartée** parce que (a) coût d'hébergement et de maintenance d'un backend incompatible avec un mainteneur unique non-pro, (b) responsabilité Loi 25 et données nominatives transite par un service tiers, ce qui sort du périmètre de confort.

### Option B : Application desktop Electron

Aurait offert une expérience desktop native. **Écartée** parce que (a) Electron impose une chaîne de build par plateforme (Mac, Windows, Linux) et des signatures de code coûteuses, (b) pas d'usage iPad possible — or l'iPad est un cas d'usage primaire.

### Option C : Progressive Web App (PWA) avec sync optionnel

Aurait été un compromis. **Écartée** au démarrage pour rester simple, mais la possibilité de réactiver le `manifest.webmanifest` reste ouverte (`docs/operations/` pour la procédure éventuelle).

---

## Références

- `CLAUDE.md` §"Contraintes techniques" — déclaration officielle.
- `index.html` (en-tête CSP) — `script-src 'self'`.
- Audit annuel 2026, sous-audit 5.4 Loi 25 — analyse de conformité.
- ADR-008 Cloudflare Access — couche d'accès complémentaire.

---

## Notes de révision

À réviser si :
- Un partage temps réel entre enseignants devient un besoin opérationnel critique (peu probable dans le périmètre actuel).
- Un backend minimaliste devient nécessaire pour la télémétrie de bugs (poussé par les testeurs).

---

**Source du format** : Michael Nygard, *Documenting Architecture Decisions* (2011).
