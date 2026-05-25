# ADR-012 : Politique d'audit annuel

**Statut** : Acté
**Date de décision originale** : printemps 2026 (préparation du kit), première itération mai 2026 — formalisation ADR : 14 mai 2026
**Auteur** : Grégoire Bédard

---

## Contexte

Labo Codex est un projet à mainteneur unique (cf. sous-audit 4.2, CAF = 1) qui développe vite, en vibe coding avec Claude Code (cf. ADR-010), sans revue par pair. Ce mode de développement est productif mais cumule de la dette technique et des angles morts :
- Des décisions structurantes prises sans documentation explicite (les ADRs 001-011 sont rétroactifs, c'est révélateur).
- Des dérives de cohérence lexicale (T-L1 sous-audit 1.3) qui s'installent sans qu'on les voie en cours de route.
- Des risques de sécurité qui n'apparaissent que lors d'une lecture transverse (sous-audit 5.1 OWASP).
- Des god modules et des duplications qui grossissent module par module sans alerte (sous-audits 2.x santé code).

Sans mécanisme régulier de prise de recul, ces dérives s'accumuleraient jusqu'à un point critique. Le projet a besoin d'un cycle régulier de **regard externe structuré** — même si l'« externe » est en pratique le mainteneur + Claude Code dans un cadre méthodologique formalisé.

Plusieurs cadres ont été étudiés : ISO 25010 (qualité logicielle), OWASP (sécurité), WCAG (accessibilité), CHAOSS (santé des communautés open source), OpenSSF Scorecard, Loi 25 (protection des renseignements personnels au Québec).

---

## Décision

**Conduire un audit annuel structuré du projet, selon un protocole formalisé** (`audit/PROMPT.md` + `audit/README.md`).

Caractéristiques du protocole :
- **Cadrage par six axes** : (1) conformité pédagogique, (2) santé du code, (3) architecture SSOT, (4) soutenabilité, (5) sécurité + données, (6) accessibilité.
- **25 sous-audits** au total (3-6 par axe), avec critères de seuil V/J/R (Vert / Jaune / Rouge) clairement définis.
- **Protocole d'exécution en 7 phases** : préparation, santé code, architecture, conformité pédagogique, sécurité, accessibilité, soutenabilité (en parallèle), synthèse.
- **Branche dédiée** `audit/<année>-<mois>` pour ne pas polluer `main` avec des artefacts d'audit.
- **Format des livrables standardisé** : chaque sous-audit produit un rapport 7 sections (question, méthode, résultats bruts, interprétation, statut, recommandations, limites).
- **Posture** : factuelle, sans superlatifs, distinguer faits / inférences / extrapolations, signaler les zones grises.
- **Cadres mobilisés** explicitement référencés (ISO 25010, OWASP, WCAG, CHAOSS, OpenSSF, Loi 25).
- **Quatre déclinaisons en sortie** : synthèse interne complète, présentation AQPC (8-12 pages), note institutionnelle (2 pages), `AUDIT.md` public à la racine.

**Cadence** : une fois par année, idéalement en mai (avant le colloque AQPC de juin et avant la saison estivale calme).

---

## Conséquences

### Positives

- **Discipline forcée** : un cycle de prise de recul annuel évite l'accumulation silencieuse de dettes.
- **Transparence externe** : la version publique `AUDIT.md` permet à un tiers (collègue, institution, communauté) de connaître l'état réel du projet sans avoir à le découvrir lui-même.
- **Crédibilité académique** : pour les présentations AQPC et les publications, pouvoir s'appuyer sur un audit structuré est un avantage.
- **Documentation rétroactive** : la première itération a produit les ADRs 001-012, les rapports de cohérence lexicale, l'inventaire des données — autant de documents qui n'existaient pas avant.
- **Onboarding tiers facilité** : un développeur qui découvre le projet peut consulter le dernier rapport d'audit pour comprendre l'état réel.

### Négatives

- **Coût en temps** : ~40 h sur une à deux semaines. Significatif pour un mainteneur unique.
- **Format figé** : le protocole peut se rigidifier d'une année sur l'autre. Mitigation : la phase 0 de chaque audit comprend une révision du protocole précédent.
- **Risque de complaisance** : auto-audit n'est pas un audit externe. La fonction reste utile mais ne remplace pas une revue tierce vraiment indépendante quand elle devient possible.

### Neutres

- **Articulation avec les chantiers internes** : un audit ne corrige rien — il identifie. La correction se fait après, dans des chantiers séparés (cf. cross-référence DS / audit, mai 2026).

---

## Alternatives considérées

### Option A : Pas d'audit, confiance dans les pratiques courantes

**Écartée** parce qu'incompatible avec la posture de commun éducatif et de transparence revendiquée par le projet.

### Option B : Audit ponctuel sans cadence

**Écartée** parce qu'il aurait été reporté indéfiniment. Un cycle annuel force la régularité.

### Option C : Audit externe payant par un cabinet

**Écartée** au stade actuel pour des raisons de coût et parce que le projet n'a pas encore atteint la taille où ce type d'audit serait justifié. À réexaminer si l'adoption institutionnelle progresse.

### Option D : Tests automatisés exhaustifs (CI/CD)

Aurait été complémentaire mais ne remplace pas l'audit transverse. Le projet a déjà des tests automatisés `tests/` (29 tests Vitest + Playwright) qui couvrent la sécurité de base — l'audit annuel les complète sur les axes que les tests ne couvrent pas (architecture, conformité pédagogique, accessibilité, soutenabilité).

---

## Références

- `audit/PROMPT.md` — cadre de collaboration avec Claude Code pour l'audit.
- `audit/README.md` — protocole d'exécution en 7 phases.
- `audit/2026-mai/` (branche git) — première itération.
- ISO/IEC 25010, OWASP ASVS, WCAG 2.1 AA, CHAOSS, OpenSSF Scorecard, Loi 25 — cadres mobilisés.

---

## Notes de révision

À réviser :
- **Après chaque audit annuel** : phase 0 de l'audit suivant doit comprendre une révision du protocole sur la base des leçons apprises.
- Si la structure du projet évolue substantiellement (passage à plusieurs mainteneurs, intégration institutionnelle, autorégulation par la communauté), réviser les seuils et les cadres mobilisés.

---

**Source du format** : Michael Nygard, *Documenting Architecture Decisions* (2011).
