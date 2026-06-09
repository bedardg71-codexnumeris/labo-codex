# Structures et formats à définir pour Codex

> **Date** : 9 mai 2026
> **Origine** : exploration de l'écosystème Obsidian + vérification des nouveautés 2025-2026 (Bases, CLI, JSON Canvas)
> **Posture** : programme de définition, pas de mise en œuvre. Identifier ce qui mérite d'être formalisé, dans quel ordre, avec quelles options.

---

## 1. Synthèse des vérifications (les claims Gemini)

| Claim Gemini | Réalité vérifiée |
|--------------|------------------|
| Obsidian Bases lancé fin 2025 | **Vrai mais date incorrecte** : lancé le 21 mai 2025 dans Obsidian 1.9.0. Core plugin qui transforme un set de notes en base de données via les Properties (frontmatter YAML). Vues table, card, map. |
| Obsidian CLI officielle pour scripter | **Vrai mais nuance importante** : lancée en early access (Catalyst) le 10 février 2026 dans v1.12.0, GA le 27 février 2026 dans v1.12.4. 100+ commandes. *Mais* — c'est un « remote control » d'une instance Obsidian active, pas un outil headless. Si l'app n'est pas lancée, elle se lance automatiquement. Donc « scripter sans ouvrir l'interface graphique » est trompeur. |
| Format JSON Canvas ouvert | **Vrai et bien documenté** : spec publique sur jsoncanvas.org, repo `obsidianmd/jsoncanvas` sur GitHub, licence MIT, implémentable par n'importe quelle app comme format d'import/export/storage. Structure JSON avec nodes et edges. |
| IA locale via plugins (Claude, Ollama) | **Partiellement vrai, à nuancer** : nombreux plugins (Smart Connections, Claudian, Claudesidian MCP, AI Providers). Ollama oui, *vraiment local*. Claude via API = données envoyées chez Anthropic, *pas local*. La phrase « sans envoyer de données dans le cloud » est imprécise — vraie pour Ollama, fausse pour Claude. |
| 2 750 plugins | **Vrai** : 2 736–2 750 plugins selon les sources, ~50 mises à jour par semaine, ~5 nouveaux plugins/semaine. Communauté très active. |
| MCP comme tendance 2026 | **Vrai** : Model Context Protocol (créé par Anthropic) permet à Claude Code et autres agents d'utiliser un coffre Obsidian comme « live workspace ». C'est une avenue 2026 émergente. |

**Implication** : Gemini est globalement fiable mais imprécis sur les dates et les nuances techniques. Les fondamentaux que j'ai utilisés dans mon analyse précédente tiennent.

---

## 2. Principes de gouvernance des formats Codex

Avant d'inventorier les formats à définir, fixons les principes (s'inspirant directement du modèle JSON Canvas d'Obsidian).

**P1. Spec publique.** Chaque format défini a une spec écrite dans un Markdown versionné, à un emplacement public (`docs/formats/` du dépôt). La spec est la source de vérité, pas le code.

**P2. Versioning sémantique.** Chaque format porte un champ `formatVersion` (ou équivalent) suivant SemVer simplifié : majeur (rupture), mineur (ajout rétro-compatible), patch (clarification). Les implémenteurs déclarent ce qu'ils supportent.

**P3. Licence permissive sur les specs.** Les specs (pas le code de l'app) peuvent être mises sous MIT ou CC0, pour que d'autres outils les implémentent sans friction. Le code de Codex peut rester sous une licence différente.

**P4. Évolution par proposition explicite.** Une modification de format passe par une note de changement (RFC, ADR, ou simple PR documentée). Pas de modification silencieuse.

**P5. Rétro-compatibilité préservée pour les données personnelles.** Le `CLAUDE.md` énonce déjà ce principe pour les données de Grégoire. À étendre formellement à tout fichier produit par une version stable de Codex.

**P6. Schémas validables.** Chaque format a (à terme) un JSON Schema ou équivalent qui permet de valider un fichier avant import. Pour les `.md` Markdown des cartouches, une grammaire ou un parser de référence joue le même rôle.

---

## 3. Inventaire des formats et structures à définir

Je propose de raisonner en **cinq familles**. Pour chaque entrée, je signale l'**état actuel** (existe / partiel / à créer), la **priorité** (immédiate / court terme / moyen terme / long terme), et la **décision critique** associée.

### 3.A — Formats principaux d'échange (déjà partiellement existants)

| Format | État | Priorité | Décision critique |
|--------|------|----------|-------------------|
| `.codex.zip` | Existe (code), spec absente | **Immédiate** | Publier la spec écrite. Choisir le versioning. |
| `.codex-data.json` | Partiellement spécifié dans `ECOSYSTEME-DONNEES.md` | **Immédiate** | Finaliser et figer la spec v1. |
| `.codex-config.json` | Existe en partie (Beta 91 — « configuration pédagogique complète ») | **Court terme** | Repositionner comme « paquet de dépôt Voûte ». |

Pour `.codex.zip`, la spec doit décrire au minimum : structure interne du ZIP (manifeste, données, dossier travaux), schéma de chaque fichier interne, conventions de nommage, version du format, signature optionnelle.

### 3.B — Formats d'entités unitaires (pour la Voûte et l'extensibilité)

C'est le terrain où Codex peut le plus s'inspirer du modèle JSON Canvas (un format public par type d'objet).

| Format | État | Priorité | Décision critique |
|--------|------|----------|-------------------|
| `.codex-grille.json` | À créer | **Court terme** | Schéma indépendant ou dérivé de `grillesTemplates` ? |
| `.codex-echelle.json` | À créer | **Court terme** | Format autonome (échelle réutilisable) ou couplé à une grille ? |
| `.codex-cartouche.md` | Existe en `.txt` (Markdown léger) | **Court terme** | Renommer en `.md` ? Formaliser la grammaire ? |
| `.codex-cartouche.json` | À créer | **Court terme** | Format JSON complémentaire au `.md` (les deux pour le même contenu)? |
| `.codex-production.json` | À créer | **Moyen terme** | Inclure ou pas les références aux blobs (photos types) ? |
| `.codex-sequence.json` | À créer | **Moyen terme** | Format pour le matériel pédagogique (planification curriculaire). |
| `.codex-tampon.json` | À créer | **Moyen terme** | Pour les tampons d'évaluation réutilisables. |
| `.codex-pratique.json` | À créer | **Moyen terme** | Pour les pratiques de notation (stockées actuellement dans `pratiquesConfigurables`). |

**Décision structurante à trancher** : un seul format unifié `.codex-entity.json` avec un champ `type`, ou un format par type (`.codex-grille.json`, etc.) ? JSON Canvas a choisi un format unifié (`.canvas` avec nodes typés). Pour Codex, je penche pour un format par type — plus lisible, plus validable, plus facile à parser pour des tiers — mais c'est à débattre.

**Sur les cartouches en `.md`** : le format `.txt` actuel est déjà du Markdown (`##`, `**bold**`, structure I/D/M/E). Le passer en `.md` est un changement quasi-cosmétique mais bénéfique :
- Reconnu nativement par Obsidian, GitHub, Quick Look, VS Code.
- Formaliser la grammaire dans une spec (par exemple via une grammaire EBNF ou une description en prose + exemples).
- Permet une « bibliothèque de cartouches » lisible directement dans Obsidian si quelqu'un en a une.

### 3.C — Schémas transversaux (à appliquer à toutes les entités)

Ces schémas sont les plus structurants pour le futur. Ils décident ce qui sera *toujours* présent dans une entité Codex sérialisée.

**Schéma d'identité** (à intégrer dans toutes les entités) :

```jsonc
{
  "uuid": "f47ac10b-58cc-4372-a567-0e02b2c3d479",  // UUID v4 stable
  "schemaVersion": 1,                              // évolution du schéma
  "type": "grille",                                // type d'entité
  "auteur": {
    "id": "local|<uuid utilisateur>",              // local par défaut
    "nom": "Grégoire Wilson",                      // nom affiché
    "institution": "Cégep X"                       // optionnel
  },
  "dateCreation": "2026-05-09T14:32:00Z",
  "dateModification": "2026-05-09T15:10:00Z",
  "source": "local|archive|voute"                  // origine
}
```

**Schéma de licence** (pour les entités partageables) :

```jsonc
{
  "licence": "CC-BY-NC-SA-4.0",                    // par défaut Voûte
  "attribution": "Grégoire Wilson — Cégep X",
  "derivedFrom": {                                 // si emprunté/remixé
    "uuid": "...",
    "auteur": "..."
  }
}
```

**Schéma de visibilité** (préparation multi-utilisateurs) :

```jsonc
{
  "visibilite": "privee|departement|institution|publique",
  "permissions": {                                 // optionnel, futur
    "lecture": ["tous"],
    "ecriture": ["proprietaire"]
  }
}
```

**Décision critique transversale** : ajouter ces trois schémas dans toutes les nouvelles entités dès maintenant, même si plusieurs champs valent toujours leur défaut (`auteur: local`, `visibilite: privee`). Le coût d'aujourd'hui est trivial. Le coût d'une migration rétroactive plus tard est élevé.

### 3.D — Structures de la Voûte

C'est ici que se construit la dimension « marketplace » discutée dans le doc Écosystème.

| Structure | État | Priorité | Description |
|-----------|------|----------|-------------|
| `manifeste-voute.json` | À créer | **Long terme** | Index global de la Voûte (entités disponibles, métadonnées). |
| `meta.json` par dépôt | Esquissé dans `ECOSYSTEME-DONNEES.md` pour archives | **Court terme** | Métadonnées d'un dépôt : auteur, licence, discipline, niveau, version, description, tags, date. |
| Conventions de tags / disciplines | À créer | **Court terme** | Vocabulaire contrôlé pour disciplines (philosophie, mathématiques, etc.) et niveaux (collégial 1, 2, 3). |
| Schéma de validation à l'acceptation | À créer | **Long terme** | Règles que doit respecter un dépôt pour entrer dans la Voûte (intégrité, anonymisation, licence, schéma). |
| Format d'index par discipline / niveau | À créer | **Long terme** | Vues filtrées de la Voûte. |

**Décision critique** : commencer par `meta.json` et le vocabulaire de tags. Une Voûte « Phase 1 fichiers » fonctionne avec juste un système de métadonnées riches et un index simple. Le manifeste global et l'acceptation peuvent attendre.

### 3.E — Conventions d'API / CLI / fichiers de surveillance

Inspiré directement de l'Obsidian CLI (mais en plus simple, vu ton CSP).

| Convention | État | Priorité | Description |
|------------|------|----------|-------------|
| Format CLI (futur) | À explorer | **Long terme** | Si un jour Codex a une CLI, quelles commandes ? Inspiration : `codex extract --groupe gr00002 --output codex-data.json`. |
| Dossier de surveillance | À créer si pertinent | **Long terme** | Convention `.codex-import/` que des outils tiers peuvent peupler, et que Codex importe automatiquement. |
| Format de log d'opération | À créer | **Moyen terme** | Quand un import ou un dépôt se fait, produire un fichier `.codex-log.json` qui trace ce qui a été modifié. Utile pour debug et pour audit Loi 25. |

**Note importante** : l'Obsidian CLI fonctionne en pilotant une instance graphique. Pour Codex (web app dans le navigateur), une CLI au sens Unix est plus complexe — il faudrait un binaire séparé qui lit/écrit dans le même IndexedDB que le navigateur, ce qui est techniquement difficile. Plus réaliste : un format de fichiers de surveillance (un dossier que Codex regarde quand l'utilisateur ouvre un menu).

---

## 4. Priorités d'attaque

Si je devais ordonner ces définitions par valeur/effort, voici ma proposition (à débattre) :

**Priorité 1 — Immédiat (avant tout chantier multi-utilisateurs)** :
1. **Spec publique de `.codex.zip`** — c'est ton format le plus utilisé. Le formaliser stabilise tout ce qui en dépend.
2. **Spec publique de `.codex-data.json`** — déjà bien avancé dans `ECOSYSTEME-DONNEES.md`, à finaliser comme document figé.
3. **Schémas transversaux d'identité, licence, visibilité** appliqués aux nouvelles entités.

**Priorité 2 — Court terme (quand la Voûte commence à se construire)** :
4. **Format des cartouches en `.md` versionné** (formaliser la grammaire actuelle).
5. **Format `.codex-grille.json` / `.codex-echelle.json`** (les deux entités les plus partageables).
6. **Format `meta.json` de dépôt** + vocabulaire de tags pour disciplines/niveaux.

**Priorité 3 — Moyen terme (quand la Voûte sert plusieurs enseignants)** :
7. **Format `.codex-production.json`** et autres entités unitaires.
8. **Format de log d'opération** pour audit Loi 25.

**Priorité 4 — Long terme (quand Codex est multi-institutionnel)** :
9. **Manifeste global de la Voûte**, schéma de validation à l'acceptation.
10. **CLI / fichiers de surveillance** si le besoin se manifeste.

---

## 5. Décisions critiques à prendre maintenant

Trois choix structurants méritent d'être tranchés en amont parce qu'ils sont coûteux à défaire :

**Décision A — Format unifié vs format par type ?**
- Option 1 : un format unifié `.codex-entity.json` avec champ `type`. Plus simple à parser, plus dur à valider strictement.
- Option 2 : un format par type (`.codex-grille.json`, etc.). Plus lisible, plus validable, mais multiplie les specs.
- *Mon penchant* : Option 2, à confirmer.

**Décision B — Markdown vs JSON pour les entités à fort contenu textuel ?**
- Cartouches : actuellement `.txt` Markdown léger. Doit-on basculer en `.md` (formaliser le format) ou en `.json` (structure stricte avec champs `commentaires` riches) ?
- *Mon penchant* : garder `.md` pour les cartouches (c'est une matière textuelle), et envisager un *complémentaire* `.json` pour les métadonnées (licence, auteur, version) — un peu comme le frontmatter YAML d'Obsidian.

**Décision C — Schémas transversaux dès maintenant ou différés ?**
- Option 1 : appliquer le schéma d'identité (uuid, auteur, schemaVersion, etc.) à toute nouvelle entité dès aujourd'hui, même si plusieurs champs sont à leur défaut.
- Option 2 : attendre que le besoin multi-utilisateurs soit concret pour les introduire.
- *Mon penchant* : Option 1, parce que rétroactif = douloureux.

---

## 6. Ce que je n'ai pas couvert

- **Format des blobs** (photos de productions, PDF) : déjà résolu par les standards (JPEG, PNG, HEIC, WebP, PDF). Pas à définir.
- **Format de sync** (delta, conflits, vector clocks) : pertinent seulement quand la sync E2EE sera implémentée. Pas à définir maintenant.
- **Format d'authentification / comptes utilisateurs** : pertinent à la même phase.
- **Format de présentation publique** (équivalent Obsidian Publish) : pertinent en phase Voûte mature.
- **Spec MCP pour intégration Claude/IA** : sujet 2027+, à observer.

---

## 7. Limites de ce document

- Je n'ai pas relu en profondeur le code actuel pour vérifier l'écart précis entre ce qui existe et ce qui est à créer. Ma colonne « état » est une estimation.
- Les schémas que je propose (identité, licence, visibilité) sont des esquisses, pas des specs finales.
- Le découpage des entités (grille, échelle, cartouche, production, séquence, tampon, pratique) suit ce que j'ai compris de `DATA-OWNERSHIP.md`. À valider par toi.
- L'ordre de priorité reflète mon jugement, pas une analyse de coûts/bénéfices rigoureuse.

---

## 8. Prochaines étapes possibles

Si tu veux pousser plus loin, voici ce qui serait utile :

- **Commencer par la spec `.codex.zip`** : un document Markdown de quelques pages qui décrit la structure interne, les conventions, les versions. C'est l'« acte fondateur » dont je parlais.
- **Introduire le schéma d'identité** dans une entité pilote (par exemple les cartouches) pour tester l'ergonomie avant de généraliser.
- **Documenter les formats existants** (cartouches `.txt`, exports actuels) pour figer ce qui est stable avant de bouger.
- **Choisir un emplacement** dans le dépôt pour les specs — ma proposition : `docs/formats/`.

Ces étapes sont des points de départ. Aucune n'est urgente — tu n'as pas d'utilisateurs externes qui contraignent ta liberté. Mais chacune réduit l'ambiguïté pour la suite.
