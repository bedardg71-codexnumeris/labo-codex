# Labo Codex — Application de suivi pédagogique

**Application web autonome de suivi formatif des apprentissages au collégial**

[![Code — AGPL v3](https://img.shields.io/badge/Code-AGPL%20v3-red.svg)](https://www.gnu.org/licenses/agpl-3.0)
[![Contenu — CC BY-NC-SA 4.0](https://img.shields.io/badge/Contenu-CC%20BY--NC--SA%204.0-blue.svg)](https://creativecommons.org/licenses/by-nc-sa/4.0/)
[![Version](https://img.shields.io/badge/version-voir%20version.json-green.svg)](version.json)
[![Statut](https://img.shields.io/badge/Statut-En%20d%C3%A9veloppement-yellow.svg)]()

---

## À propos

**Labo Codex** est une application web autonome conçue pour faciliter le suivi
formatif des apprentissages au collégial. Elle implémente une approche fondée
sur la taxonomie SOLO et le modèle de Réponse à l'intervention (RàI).

L'application est utilisée en pratique pédagogique individuelle par son auteur,
Grégoire Bédard, enseignant en littérature au Cégep de Drummondville. Elle fait
l'objet d'un développement ouvert sous double licence (AGPL v3 pour le code,
CC BY-NC-SA 4.0 pour les ressources pédagogiques).

---

## Caractéristiques principales

- **100 % hors ligne** — fonctionne entièrement dans le navigateur (IndexedDB +
  localStorage), aucun serveur requis, aucune télémétrie
- **Données locales** — tout reste sur la machine de l'enseignant ; voir
  [`PRIVACY.md`](PRIVACY.md) pour la politique de confidentialité complète
- **Auditée** — audit annuel volontaire (ISO/IEC 25010, OWASP, WCAG 2.1 AA,
  CHAOSS, OpenSSF Scorecard, Loi 25)
- **Pas de framework, pas de build** — HTML5 / CSS3 / JavaScript ES6+ pur

---

## Démarrage

### Téléchargement

Récupérez la dernière version : [Releases GitHub](https://github.com/bedardg71-codexnumeris/Monitorage_v6/releases)

### Lancement local (recommandé pour test ou usage personnel)

Aucune installation requise. Ouvrez `index.html` dans un navigateur moderne
(Safari, Chrome, Firefox, Edge) :

```bash
git clone https://github.com/bedardg71-codexnumeris/Monitorage_v6.git
cd Monitorage_v6
open index.html       # macOS
xdg-open index.html   # Linux
start index.html      # Windows
```

### Serveur HTTP local (pour développement)

```bash
python -m http.server 8000
# Puis ouvrir http://localhost:8000/
```

### Déploiement en ligne

L'instance publique principale est hébergée sur Netlify, derrière Cloudflare
Access (Zero Trust). **À partir du 1er septembre 2026**, l'entrée demande une
identification par code à usage unique envoyé par courriel — valable un mois,
renouvelable en redonnant son adresse — avec une **porte ouverte** : toute adresse entre, il n'y a ni liste d'invités ni sélection. Le
dispositif sert à savoir qui utilise l'application, pas à en filtrer l'accès.
Voir [`DEPLOY.md`](DEPLOY.md) pour la chaîne de déploiement complète,
[`PRIVACY.md`](PRIVACY.md) §3.3 pour ce qui est conservé et pourquoi, et
[`ADR-008`](docs/adr/008-cloudflare-access.md) pour la décision.

---

## Documentation

### Démarrage rapide

- [`docs/00-START-HERE.md`](docs/00-START-HERE.md) — routeur d'onboarding
  pour les nouveaux contributeurs (et pour Claude Code)
- [`CLAUDE.md`](CLAUDE.md) — règles, conventions et sécurité pour le développement
- [`BACKLOG.md`](BACKLOG.md) — tâches en attente

### Architecture

- [`docs/architecture/ECOSYSTEME-DONNEES.md`](docs/architecture/ECOSYSTEME-DONNEES.md) —
  document fondateur : les quatre concepts de gestion des données (Codex,
  Archives, Codex data, Voûte)
- [`docs/DATA-OWNERSHIP.md`](docs/DATA-OWNERSHIP.md) — registre de propriété
  des clés de stockage (Single Source of Truth)
- [`docs/adr/`](docs/adr/README.md) — Architecture Decision Records :
  12 décisions structurantes formalisées (format Michael Nygard) sur le
  choix vanilla JS, stockage hybride, mode hors-ligne, échelle IDME,
  licences, etc.

### Conformité et opérations

- [`PRIVACY.md`](PRIVACY.md) — politique de confidentialité (Loi 25 Québec)
- [`INCIDENTS.md`](INCIDENTS.md) — registre et procédure des incidents de
  confidentialité (Loi 25 art. 63.5)
- [`INFO-ELEVES.md`](INFO-ELEVES.md) — gabarit à remettre aux étudiants en
  début de session
- [`DEPLOY.md`](DEPLOY.md) — guide de déploiement (Netlify + Cloudflare)

### Audit

- [`AUDIT.md`](AUDIT.md) — synthèse publique de l'audit annuel 2026
  (6 axes, 25 sous-audits, statuts Vert/Jaune/Rouge, plan de remédiation)
- [`SECURITY.md`](SECURITY.md) — politique de signalement des vulnérabilités
- Rapports techniques complets : branche
  [`audit/2026-mai`](https://github.com/bedardg71-codexnumeris/Monitorage_v6/tree/audit/2026-mai/audit/reports)
  (`SUMMARY-internal.md` 639 lignes + 25 sous-audits détaillés)

### Publications académiques

- Bédard, G. (2024). « Observer pour mieux accompagner ».
  *Pédagogie collégiale*, vol. 37, n° 3.
  [En ligne (eduq.info)](https://eduq.info/xmlui/bitstream/handle/11515/39749/Bedard-38-2-25.pdf?sequence=2&isAllowed=y)

---

## Fonctionnalités principales

### Suivi des apprentissages

- **Indices A-C-P-E** — Assiduité, Complétion, Performance, et Engagement dérivé
- **Patterns d'apprentissage** — détection des trajectoires
  (stable, défi spécifique, blocage émergent, blocage critique)
- **Niveaux RàI** — recommandations d'intervention graduées
  (Universel / Préventif / Intensif)
- **Profils étudiants** — vue détaillée individuelle avec diagnostic
  pédagogique

### Évaluation critériée

- **Grilles de critères** personnalisables
- **Échelles IDME** (Insuffisant, Développement, Maîtrisé, Étendu) basées
  sur la taxonomie SOLO
- **Cartouches de rétroaction** prédéfinies
- **Jetons pédagogiques** (délai, reprise, aide, bonus)

### Gestion de groupe

- **Import étudiants** TSV / CSV / saisie manuelle
- **Saisie de présences** avec calcul automatique des indices
- **Interventions RàI** planifiables et traçables
- **Mode anonymisé** pour les projections en classe

### Partage pédagogique

- **Métadonnées Creative Commons** intégrées aux exports
- **Bundles de configuration** (échelles + grilles + cartouches + productions)
- **Codex data** pour la recherche pédagogique (extraction anonymisée)

---

## Architecture technique

### Stack

- **Frontend** — HTML5 / CSS3 / JavaScript ES6+ pur (vanilla)
- **Stockage** — IndexedDB principal + localStorage cache synchrone, via
  `js/db.js`
- **Aucune dépendance externe** — sauf Chart.js (vendored localement)
- **Compatibilité** — Safari, Chrome, Firefox, Edge ; testé sur MacBook (M3)
  et iPad Air (M1)
- **CSP** — `script-src 'self'` ; zéro script inline, zéro `eval()`

### Principe directeur

**Single Source of Truth** : chaque donnée a une source unique de vérité.
Les modules ne se parlent jamais directement, ils communiquent via le
stockage local (IndexedDB / localStorage). Le registre des clés et de leurs
propriétaires est dans [`docs/DATA-OWNERSHIP.md`](docs/DATA-OWNERSHIP.md).

---

## Contexte pédagogique

### Monitorage pédagogique

Le **monitorage pédagogique** est une approche de suivi formatif visant
à détecter précocement les difficultés d'apprentissage et à intervenir
de manière proactive. Il repose sur trois indices complémentaires :

1. **Assiduité (A)** — engagement cognitif mesuré par la présence en classe
2. **Complétion (C)** — mobilisation mesurée par la remise des travaux
3. **Performance (P)** — maîtrise mesurée par la qualité des productions

Un indice dérivé synthétise les trois :

- **Engagement (E)** — moyenne géométrique : E = ∛(A × C × P)

### Réponse à l'intervention (RàI)

Le modèle à trois niveaux adapte l'intensité du soutien :

- **Niveau 1 (Universel)** — enseignement standard
- **Niveau 2 (Préventif)** — interventions ciblées pour défis spécifiques
- **Niveau 3 (Intensif)** — soutien individuel pour situations critiques

### Taxonomie SOLO et échelle IDME

| Niveau SOLO | Code IDME | Plage | Compréhension |
|---|---|---|---|
| Préstructurel | **I**nsuffisant | < 64 % | Incompréhension |
| Unistructurel | **I**nsuffisant | < 64 % | Superficielle |
| Multistructurel | **D**éveloppement | 65 - 74 % | Points pertinents sans liens |
| Relationnel | **M**aîtrisé | 75 - 84 % | Compréhension globale avec liens |
| Abstrait étendu | **É**tendu | ≥ 85 % | Transfert à d'autres contextes |

---

## Contribution

Les contributions sont bienvenues. Avant de proposer une modification,
lisez [`CLAUDE.md`](CLAUDE.md) pour les règles de contribution
(sécurité, conventions, principe Single Source of Truth, design system).

### Signaler un bug ou suggérer une amélioration

Ouvrez une [issue GitHub](https://github.com/bedardg71-codexnumeris/Monitorage_v6/issues).

### Signaler un incident de confidentialité

Voir la procédure dans [`INCIDENTS.md`](INCIDENTS.md). Délai d'accusé :
24 heures.

### Proposer du code

1. Forkez le dépôt
2. Créez une branche : `git checkout -b feature/ma-fonctionnalite`
3. Lisez [`docs/00-START-HERE.md`](docs/00-START-HERE.md) avant de coder
4. Lancez les tests : `cd tests && npm test` (97/97 attendus)
5. Ouvrez une Pull Request

---

## Licence

**Double licence** :

### Code source — AGPL v3

[![AGPL v3](https://img.shields.io/badge/Code-AGPL%20v3-red.svg)](https://www.gnu.org/licenses/agpl-3.0)

Tous les fichiers HTML, JavaScript et CSS sont distribués sous **GNU Affero
General Public License v3.0**. Cette licence protège contre l'appropriation
commerciale, y compris en mode SaaS.

### Ressources pédagogiques — CC BY-NC-SA 4.0

[![CC BY-NC-SA 4.0](https://licensebuttons.net/l/by-nc-sa/4.0/88x31.png)](https://creativecommons.org/licenses/by-nc-sa/4.0/)

Toutes les ressources pédagogiques (grilles d'évaluation, échelles, cartouches,
productions, gabarits, configurations exportées) sont distribuées sous
**Creative Commons Attribution — Pas d'Utilisation Commerciale — Partage
dans les Mêmes Conditions 4.0 International**.

Vous êtes autorisé à :
- **Partager** — copier, distribuer et communiquer le matériel
- **Adapter** — remixer, transformer et créer à partir du matériel

Selon les conditions suivantes :
- **Attribution** à Grégoire Bédard (auteur original)
- **Pas d'Utilisation Commerciale** — usage éducatif uniquement
- **Partage dans les Mêmes Conditions** — adaptations sous même licence

Le texte complet est dans [`LICENSE.md`](LICENSE.md).

---

## Auteur

**Grégoire Bédard**
Enseignant en littérature, Cégep de Drummondville
Labo Codex — laboratoire de codexnumeris.org

- Site : [codexnumeris.org](https://codexnumeris.org)
- Courriel : [labo@codexnumeris.org](mailto:labo@codexnumeris.org)
- GitHub : [@bedardg71-codexnumeris](https://github.com/bedardg71-codexnumeris)

---

## Remerciements

- **Anthropic** — Claude Code, assistant de développement utilisé tout au
  long du projet
- **Communauté AQPC** — pour les échanges lors des présentations
- **Collègues du Cégep de Drummondville et d'ailleurs** — pour leur intérêt
  et leurs retours

---

## Statistiques (au 22 mai 2026)

- **Lignes de code** : ~234 000 (HTML + CSS + JavaScript)
- **Modules JavaScript** : 158 fichiers
- **Commits** : ~2 886
- **Période de développement** : septembre 2024 à aujourd'hui
- **Version courante** : voir [`version.json`](version.json) (source unique de verite)

---

## Avertissement

Cette application est en **développement actif (Beta)**. Elle est
fonctionnelle et utilisée en classe, mais peut contenir des bugs. Mettez
régulièrement votre codex à jour :

- **Codex (menu du haut) → Mettre à jour le codex** (fichier ZIP portable)
- et, en fin de trimestre, **Codex → Archiver** (un groupe-cours dans les archives)

Voir [`docs/architecture/ECOSYSTEME-DONNEES.md`](docs/architecture/ECOSYSTEME-DONNEES.md)
pour comprendre les différents formats de sauvegarde.
