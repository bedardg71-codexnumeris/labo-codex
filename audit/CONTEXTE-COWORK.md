# Mise en contexte pour Cowork — Labo Codex
*Interprétation de l'audit technique et préparation du plan de travail*

---

## 1. Qui je suis et ce que je te demande

Je m'appelle **Grégoire Bédard**. Je suis enseignant de littérature au **Cégep de Drummondville** (Québec) depuis 1995, donc 30 ans d'expérience. Je travaille à temps partiel et je suis neurodivergent (HPI + TDA).

Je développe depuis 9 mois une application web pédagogique appelée **Labo Codex**, en vibe coding avec Claude Code. Cette application est **déjà fonctionnelle et utilisée en classe**. Elle est déployée sur `app.codexnumeris.org` (accès Cloudflare, max 50 utilisateurs). Je tiens en parallèle un blog de recherche-action, **Codex Numeris** (codexnumeris.org), depuis 18 mois, ~300 abonnés au Québec, en France et en Belgique.

Mon **objectif explicite** est que Labo Codex soit un **commun pédagogique** : gratuit, accessible à tous, sous licence AGPL v3 pour le code et CC BY-SA 4.0 pour les ressources pédagogiques. Pour qu'un tel commun soit pérenne, il faut qu'une institution s'en porte garante. J'ai déjà obtenu une **allocation du Cégep de Drummondville** pour développer l'application, la formation et la communauté à partir de l'automne 2026.

Mon objectif n'est **pas pécuniaire**. Je vise une présentation au **45e colloque de l'AQPC**, le **3 juin 2026 à Drummondville** (cégep hôte). Cette présentation doit servir à recruter une première vague d'**expérimentateurs** pour amorcer une communauté de co-développement professionnel à l'automne 2026.

**Ce que je te demande, à toi Cowork** : Claude Code est en train d'exécuter un audit technique complet de Labo Codex (la grille a été conçue en amont avec Claude chat, je te transmets le dossier `audit/`). Quand l'audit sera terminé, **tu prendras le relais pour interpréter les résultats et bâtir le plan de travail qui en découle** — pour l'AQPC, pour l'automne 2026, et pour la trajectoire long terme du commun pédagogique.

---

## 2. Ce qu'est Labo Codex (sur le fond)

### 2.1 Le projet

Labo Codex est une application web de **suivi des apprentissages** qui éclaire le jugement professionnel de l'enseignant plutôt que de l'automatiser. Image directrice : **station météo**, pas pilote automatique.

**L'IA n'est pas active dans l'application.** Je l'utilise uniquement pour la développer. C'est une distinction philosophique fondamentale : Labo Codex est **un outil pour penser, pas un outil qui pense à la place de l'enseignant**.

### 2.2 Le cadre pédagogique implémenté

L'application repose sur six concepts pédagogiques articulés :

1. **Trois indices comportementaux** — A (Assiduité), C (Complétion), P (Performance) — sur fenêtre glissante de 3 artefacts. Croisés, ils distinguent par exemple un élève présent mais qui ne remet rien d'un élève qui remet tout mais peine à atteindre le seuil.

2. **Échelle IDME** (Incomplet / Développement / Maîtrisé / Étendu), alignée sur la taxonomie SOLO (Biggs & Collis 1982). Seuil de maîtrise à 0,75.

3. **Modèle RàI** (Réponse à l'Intervention) à 3 niveaux, déclenché par un indice de persistance (IPB).

4. **Quatre familles de pratiques de notation** : Sommative, PAN-Standards (la mienne), PAN-Spécifications, PAN-Dénotation (non implémentée). L'application **n'impose aucune pratique** — elle s'adapte.

5. **Indice de blocage** = 0,35 × Structure + 0,35 × Français + 0,30 × Rigueur. Seuil critique à 0,60.

6. **Vocabulaire descriptif non-alarmiste** : « difficulté émergente », « plateau », « difficulté persistante ». **Jamais** « échec », « faible », « insuffisant », « risque ».

### 2.3 L'architecture

- **Quatre espaces de données** : Codex (trimestre actif), Réserve (archive personnelle), Codex data (format léger pour recherche), Voûte (bibliothèque partagée — à venir).
- **Principes non négociables** : Single Source of Truth, communication indirecte entre modules via stockage local, stabilité zéro-dette.
- **Stack** : HTML/CSS/JS pur, sans framework. 100 % hors-ligne (IndexedDB + localStorage). ~35 modules JS actuels (après refactoring majeur qui a éliminé 1,2 M de lignes legacy en décembre 2025). Déploiement Netlify + accès Cloudflare. Bêta ~99.

### 2.4 Public cible

À partir de l'automne 2026, les utilisateurs visés enseignent en **philosophie, chimie, histoire, biologie, et autres disciplines** — pas seulement en littérature. **Éviter les présupposés littéraires** dans tes interprétations. Les données empiriques sur d'autres disciplines sont absentes pour l'instant : ne pas extrapoler sans le signaler.

---

## 3. Pourquoi un audit technique

J'ai investi environ **600 heures** sur 9 mois dans Labo Codex. C'est beaucoup. La question légitime, que je me pose à voix haute, est : **suis-je en train de créer un monstre techniquement ingouvernable, ou un objet ambitieux mais sain ?**

Pour y répondre, j'ai besoin d'une **caractérisation honnête** de l'objet. Pas d'une opération de valorisation marchande (j'ai déjà refusé d'utiliser le rapport de mai 2026 produit par Claude Code, qui valorisait à 3,9 M $ — ce n'est pas mon langage).

L'audit sert trois usages parallèles :

1. **Interne** : orienter mon travail entre maintenant et l'automne 2026.
2. **Annexe technique AQPC** + **note institutionnelle** pour le Cégep de Drummondville et la fédération des cégeps — leur permettre d'adopter ou de soutenir le projet en connaissance de cause.
3. **Document de transparence publique** sur le blog Codex Numeris et le repo GitHub.

L'audit a été conçu pour assumer que **Labo Codex a des fragilités spécifiques** à son contexte (projet vibe-codé par un non-développeur, mainteneur unique, 9 mois). Cette transparence est plus utile à un commun pédagogique que la dissimulation.

---

## 4. La grille d'audit en cours d'exécution

Claude Code exécute actuellement l'audit selon le dossier `audit/` que tu trouveras dans le repo. Tu **n'as pas besoin d'exécuter quoi que ce soit** : Claude Code produit les livrables bruts dans `audit/reports/`. Ta mission est **d'interpréter** ces livrables.

L'audit est structuré en six axes hiérarchisés (priorité décroissante) :

### Axe 1 — Conformité pédagogique (priorité 1, ~8h30)
*Le cœur de la légitimité du projet pour l'AQPC.*

Trois sous-audits :
- **1.1 Traçabilité** : chaque concept pédagogique (IDME, A-C-P, RàI, blocage, vocabulaire) est-il implémenté à exactement un endroit, conformément à sa définition canonique ?
- **1.2 Validation numérique** : les formules implémentées produisent-elles les valeurs attendues sur des cas-tests ?
- **1.3 Cohérence terminologique** : le code emploie-t-il exclusivement le vocabulaire descriptif non-alarmiste ?

**Cadre théorique** : *Fidelity of Implementation* (Penuel & Means 2004, O'Donnell 2008).

### Axe 2 — Santé du code (priorité 2, ~4h)

Cinq sous-audits : taille, complexité (cyclomatique ≤ 10, cognitive ≤ 15, nesting ≤ 3), duplication (jscpd ≤ 3 %), code mort / dépendances circulaires (madge), linting global avec ESLint security.

**Cadre** : ISO/IEC 25010:2023, McCabe (1976), Campbell (SonarSource 2018).

### Axe 3 — Architecture / SSOT (priorité 3, ~4h30)

Trois sous-audits : cartographie des points d'écriture/lecture du SSOT, graphe de dépendances (fan-in/fan-out), isolation des modules.

**Cadre** : DDD (Evans, Vernon), Modular Monolith (Brown), Red Hat sur SSOT.

### Axe 4 — Soutenabilité (priorité 4, ~6h15)

Six sous-audits : documentation + ADRs Michael Nygard, bus factor (CHAOSS, CAF = 1 par construction), test d'onboarding tiers, reproductibilité du déploiement, licences, OpenSSF Scorecard (18 checks).

### Axe 5 — Sécurité + données (priorité 5, ~7h30)

Cinq sous-audits : Lighthouse Best Practices, OWASP Top 10 ciblé, contexte Veracode 2025, inventaire des données stockées, conformité Loi 25 (Québec).

**Référence critique** : Veracode 2025 GenAI Code Security Report (30 juillet 2025) — 45 % des complétions LLM introduisent une vulnérabilité OWASP Top 10. Pour JavaScript : 38-45 % d'échec. Pires CWE : XSS (CWE-80, 86 %) et log injection (CWE-117, 88 %). Cela ne signifie pas que Labo Codex est à 45 % vulnérable — cela signifie que **l'audit OWASP n'est pas un caprice**, il est indispensable pour un projet vibe-codé.

### Axe 6 — Accessibilité (priorité 6, ~4h30)

Trois sous-audits : WCAG 2.1 AA automatisé (axe + Lighthouse), tests manuels (clavier, VoiceOver), spécificités iPad (touch targets ≥ 44 pt, gestes, viewport).

**Limite documentée** : l'audit automatisé ne couvre que 16/50 critères WCAG 2.1 AA (Deque). Un score Lighthouse 100/100 ne signifie pas conformité.

**Budget temps total estimé** : ~39 h réparties sur 4-5 semaines.

---

## 5. Ta mission, Cowork

### 5.1 Phase 1 — Interpréter l'audit (~ 6-8 h)

Quand Claude Code aura terminé les livrables dans `audit/reports/`, tu auras à produire :

#### A. Un rapport de synthèse interne (`reports/SYNTHESE-interne.md`)

À partir du gabarit `audit/SUMMARY-template.md` (déjà fourni). Tu remplis :
- Le tableau de bord global (statuts V/J/R par axe).
- La synthèse par axe avec constat principal et recommandations.
- La liste des angles morts (déjà rédigée dans le gabarit, à confirmer).
- Les recommandations consolidées priorisées (haute / moyenne / basse).

Posture : factuel, sans euphémisme. Si l'axe 1 (conformité pédagogique) révèle des écarts entre le cadre théorique et le code, le dire clairement et proposer des corrections avant l'AQPC.

#### B. Une annexe technique pour l'AQPC (`reports/SYNTHESE-aqpc.md`, 8-12 pages)

Public : enseignants-chercheurs québécois en pédagogie collégiale. Ton : académique mais accessible. Structure :
1. Préambule (contexte, périmètre, démarche).
2. Cadres théoriques mobilisés.
3. Synthèse par axe (1 page par axe, encadrés constat/méthode/résultat).
4. Tableau de bord global.
5. Ce que l'audit ne mesure pas (transparence assumée).
6. Annexes (commandes, rapports CLI complets).

**Ce document sera projeté ou distribué le 3 juin 2026.** Pas de superlatifs, pas de marketing. Citation des sources sur tous les seuils chiffrés. Reconnaître publiquement le CAF = 1 et les limites structurelles.

#### C. Une note institutionnelle (`reports/SYNTHESE-institutionnelle.md`, 2 pages)

Public : direction du Cégep de Drummondville, Fédération des cégeps, peut-être Campus Numérique Québec (Katy Junca). Ton : factuel et synthétique. Structure :
1. Pourquoi cet audit (initiative volontaire, transparence).
2. Méthode (références aux standards : ISO 25010, OWASP, WCAG, CHAOSS, OpenSSF, Loi 25).
3. Résultats par axe (encadrés colorés).
4. Limites assumées (mainteneur unique, vibe coding, absence de validation externe).
5. Demandes éventuelles à l'institution (accompagnement juridique pour ÉFVP Loi 25, accès ponctuel à un développeur professionnel, allocation de temps confirmée).

#### D. Une version publique (`AUDIT.md` à la racine du repo + billet de blog optionnel)

Public : communauté open source, lecteurs du blog Codex Numeris. Plus court, narratif, avec liens vers les détails. **Mettre en évidence la section « limites et angles morts »** — c'est ce qui distingue un audit honnête d'une opération de communication.

### 5.2 Phase 2 — Bâtir le plan de travail (~ 4-6 h)

À partir des recommandations de l'audit, produire un plan de travail concret pour :

#### A. Court terme : avant l'AQPC du 3 juin 2026

- Corrections critiques (axe 1 si écarts détectés, axe 5 si vulnérabilités exploitables).
- Préparation matérielle de la présentation.
- Rédaction d'un billet de blog Codex Numeris narrant l'expérience de l'audit (storytelling honnête).

#### B. Moyen terme : automne 2026 (allocation cégep)

Selon ce que l'audit révèle :
- Refactorings prioritaires.
- Mise en place du dispositif de développement professionnel autour de l'application.
- Recrutement d'expérimentateurs (premières adhésions identifiées à l'AQPC).
- Création de SECURITY.md, PRIVACY.md, INCIDENTS.md si manquants.
- Plan d'ADRs rétroactifs (8-12 ADRs à créer pour documenter les décisions structurantes).

#### C. Long terme : trajectoire vers v1.0 et le commun

- Gouvernance du commun pédagogique (à concevoir avec les premiers adhérents — l'essentiel à court terme étant qu'une institution s'en porte garante).
- Politique de licence et de contribution (CONTRIBUTING.md).
- Politique de mise à jour de l'audit (annuel, mini-audit à chaque refactoring majeur).
- Plan de transition / soutenabilité (CAF = 1 à mitiger, recherche de co-mainteneurs).

### 5.3 Phase 3 — Préparer le passage de relais (~ 2 h)

Quand tu auras fini d'interpréter et de planifier, prépare un document de **passage de relais** :
- Ce qui a été produit (liste des fichiers).
- Décisions prises (avec ma validation à chaque étape).
- Points en suspens nécessitant ma décision ou un audit externe.
- Suggestions de prochaines actions, priorisées.

---

## 6. Posture attendue

### Ce que tu fais

- **Lis l'ensemble** de l'audit avant de commencer à interpréter. Ne pas conclure sur la base d'un seul axe.
- **Distingue explicitement** : faits mesurés / inférences / extrapolations.
- **Signale les manques** d'information plutôt que combler par supposition.
- **Critique** de façon argumentée, sans complaisance.
- **Priorise la cohérence d'ensemble** sur l'élégance locale.
- **Reconnais les angles morts** : pédagogie réelle (recherche-action requise), DAST, biais UX, validité juridique AGPL en contexte cégep.

### Ce que tu ne fais PAS

- **Ne pas faire de marketing.** Pas de superlatifs (« remarquable », « excellent », « impressionnant »). Pas de valorisation financière. Pas de comparaison à des produits commerciaux.
- **Ne pas extrapoler** des comparables industriels à un projet pédagogique solo sans signaler la limite.
- **Ne pas combler les trous.** Si une donnée manque, le dire.
- **Ne pas masquer** les résultats défavorables. La transparence est centrale au projet.
- **Ne pas présumer** que je suis développeur professionnel. Je ne le suis pas.
- **Ne pas extrapoler** depuis le contexte littérature vers les autres disciplines.
- **Ne pas modifier le code** de Labo Codex pendant cette phase. Tu interprètes et planifies, c'est tout. Les modifications éventuelles seront faites par Claude Code après que j'aurai validé les recommandations.

### Quand un résultat est ambigu

Plutôt que de trancher, écris :

```
[DÉCISION GRÉGOIRE REQUISE]
Constat de l'audit : <ce qui est mesuré>
Interprétation A : ...
Interprétation B : ...
Ce qui m'aiderait à trancher : <question(s) précise(s)>
```

---

## 7. Style et conventions

- **Guillemets français** : « ... »
- **Tutoiement** dans nos échanges.
- **Ton factuel**, sans enthousiasme marketing.
- **Phrases courtes**, structure visible.
- **Pas d'émojis** dans les rapports (les documents peuvent être imprimés et présentés à des administrateurs).
- **Citations** de toutes les sources sur les seuils chiffrés et les statistiques.

---

## 8. Ce qui s'est passé avant toi (historique court)

Pour que tu saches d'où on part :

1. J'ai conçu Labo Codex à l'hiver 2024 dans un tableur Numbers.
2. J'ai démarré la conversion web en août 2025 avec Claude Sonnet 4.5 + VS Code + GitHub. Premier contact avec ces outils.
3. J'ai basculé vers Claude Code après ~2 mois. Releases bêta régulières.
4. J'ai nommé l'application Labo Codex fin février 2026.
5. Refactoring majeur en décembre 2025 (élimination de 1,2 M lignes legacy).
6. Bêta ~99 actuellement, ~35 modules JS, ~600 h investies.
7. Allocation Cégep de Drummondville obtenue pour l'automne 2026.
8. AQPC confirmé pour le 3 juin 2026.
9. Avec Claude (chat), nous avons conçu en mai 2026 la grille d'audit que Claude Code exécute en ce moment. La grille est volontairement exigeante (axe 1 a un critère d'arrêt : si la fidélité pédagogique révèle des écarts, on suspend l'audit et on corrige avant tout).

---

## 9. Trois choses à retenir avant de te lancer

1. **L'objectif est un commun pédagogique, pas un produit.** Toute interprétation qui glisse vers le langage marketing trahit l'esprit du projet.

2. **L'audit est honnête, pas flatteur.** Si quelque chose est rouge, c'est rouge. Si une limite est structurelle (CAF = 1, vibe coding, mainteneur unique), elle s'écrit en clair — pas par modestie, par honnêteté méthodologique. C'est ce qui distinguera Labo Codex d'autres projets EdTech.

3. **Tu as un budget cognitif limité à respecter de mon côté.** Je suis HPI + TDA, je travaille à temps partiel, j'ai déjà investi 600 h. Préfère :
   - Des sessions de 60-90 min plutôt que des marathons.
   - Des livrables segmentés que je valide un à un, plutôt qu'un rapport-fleuve.
   - Des questions précises plutôt que de longues explications.

---

## 10. Première action recommandée

Quand l'audit Claude Code sera terminé :

1. Lire `audit/README.md` puis `audit/PROMPT.md` pour comprendre le cadre.
2. Lire tous les fichiers dans `audit/reports/`.
3. Me confirmer ce que tu as lu, avec une liste très synthétique des constats majeurs (1-2 lignes par axe).
4. Me proposer un ordre de production des livrables (interne d'abord ? AQPC d'abord ?).
5. Attendre ma validation avant de commencer.

Pas de précipitation. La présentation AQPC est dans environ trois semaines à compter du moment où l'audit sera terminé. C'est court mais suffisant si on procède méthodiquement.

---

**Bienvenue dans le projet, Cowork. À nous deux maintenant.**
