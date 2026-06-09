# Plan de mise à jour du Design System — Labo Codex
*À exécuter par Claude Code avant la reprise de l'audit technique.*

---

## Contexte

Le Design System v7 de Labo Codex (17 modules HTML dans `design-system/`) est désynchronisé par rapport au code réel. Deux écarts confirmés par Grégoire :

1. **Le mode Assisté n'existe plus** dans le code, mais reste documenté dans le DS.
2. **Le mode sombre est implémenté** dans le code, mais n'est pas documenté dans le DS.

D'autres écarts mineurs sont probables (palette à compléter notamment).

Tant que le DS n'est pas recalé, l'audit technique en cours (notamment sous-audits 1.3 cohérence terminologique et 3.x cohérence DS) produit des résultats inversés. L'audit a été suspendu (voir `audit/reports/SESSION-suspension.md`).

**Objectif de ce travail** : remettre le DS en conformité avec le code réel, module par module, avec traçabilité explicite (chaque section du DS doit pouvoir citer la ou les lignes de code qui la justifient).

---

## Principes non négociables

### 1. Le DS documente ce qui existe, pas ce qui devrait exister

Pour chaque section que tu rédiges, **cite la ou les lignes de code** (CSS, HTML, JS) qui justifient ce que tu documentes. Si tu ne peux pas citer de source dans le code, c'est que la section n'a pas sa place dans le DS — signale-le à Grégoire et attends sa décision.

**Pas d'extrapolation. Pas de « ça serait logique d'ajouter ». Pas de complétion préventive.**

### 2. Trois colonnes de décision, jamais binaire

Pour chaque élément du DS examiné, trois statuts possibles :
- **À conserver** (DS conforme au code).
- **À mettre à jour dans le DS** (le code a évolué, le DS doit suivre).
- **À corriger dans le code** (le DS reste la référence, le code a dérivé par accident).

**Seul Grégoire tranche la troisième colonne.** Tu n'as pas l'information sur ce qui était intentionnel et ce qui était un glissement.

### 3. La sémantique pédagogique est invariante

Quelques associations sémantiques fortes que le code peut casser sans le vouloir, à vérifier systématiquement :
- **SOM = orange**, **PAN = bleu** (gradients et points sur barres A-C-P-E).
- **X orange = réinitialisation** (avec confirmation), **X rouge = annulation/fermeture** (immédiat).
- **Vocabulaire descriptif** : « difficulté émergente », « plateau », « difficulté persistante ». Pas d'« échec », « faible », « insuffisant ».
- **Emojis autorisés uniquement** : 💡 (conseil), 📐 (technique), 🍎 (pédagogique), ⚠️ (alerte). Aucun autre.

Si le code utilise une autre couleur, un autre emoji, ou un autre vocabulaire que ceux-ci, **ne le légitime pas en le documentant dans le DS**. Signale-le à Grégoire comme dérive possible à corriger dans le code.

### 4. Organisation du travail

- Toute la mise à jour vit dans le dossier `ds-update/` à la racine du repo, à côté de `audit/`.
- Branche git dédiée : `ds-update/2026-mai`.
- Ne pas modifier `design-system/*.html` directement pendant les passes 1 et 2. Les réécritures de la passe 3 produisent d'abord des fichiers `ds-update/v8-drafts/` qui ne remplaceront `design-system/` qu'après validation finale.

### 5. Validation entre chaque étape

Tu ne passes pas à l'étape suivante sans validation explicite de Grégoire. Chaque livrable termine par : « **Livrable terminé. En attente de validation pour passer à [étape suivante].** »

---

## Structure du dossier `ds-update/`

```
ds-update/
├── README.md                        ← ce plan, copié à la racine du dossier
├── SESSION.md                       ← suivi de session (mis à jour à chaque fin de session)
│
├── passe-1-inventaire/
│   ├── inventaire-css-variables.md  ← toutes les variables CSS du code
│   ├── inventaire-classes.md         ← toutes les classes CSS pertinentes
│   ├── inventaire-themes.md          ← sélecteurs de thème clair/sombre
│   ├── inventaire-modes.md           ← modes contextuels présents dans le code
│   ├── inventaire-emojis.md          ← tous les emojis trouvés dans HTML/JS
│   ├── inventaire-tokens-visuels.md  ← gradients, box-shadows, border-radius
│   └── README.md                     ← synthèse de la passe 1
│
├── passe-2-diff/
│   ├── 01a-palette.md
│   ├── 01b-typographie.md
│   ├── 02a-boutons.md
│   ├── 02b-formulaires.md
│   ├── 02c-badges-tetris.md
│   ├── 03a-tableaux.md
│   ├── 03b-cartes-sidebars.md
│   ├── 03c-barres-gradient.md
│   ├── 03d-modals.md
│   ├── 04a-navigation.md
│   ├── 04b-box-shadow.md
│   ├── 05-patterns-pedagogiques.md
│   ├── 06a-emojis-CRITIQUE.md
│   ├── 06b-toggles.md
│   ├── 06c-alertes.md
│   ├── 06d-utilitaires-beta97.md
│   ├── 07-primo-assistant.md
│   └── README.md                    ← matrice de décision consolidée
│
└── v8-drafts/
    ├── 01a-palette-couleurs.html    ← brouillon de DS v8 (créé en passe 3)
    └── ...                          ← un par module, dans l'ordre de réécriture
```

---

## PASSE 1 — Inventaire du code réel

**Objectif** : produire une photographie factuelle de ce qui existe dans le code, sans aucun jugement ni interprétation.

**Temps estimé** : 2-3 h.

**Cette passe peut être faite en une session unique.**

### 1.1 — Variables CSS

Lire tous les fichiers CSS du projet (`styles.css` et tout autre fichier `.css`). Produire `ds-update/passe-1-inventaire/inventaire-css-variables.md` avec :

```markdown
# Inventaire des variables CSS

## Variables globales (:root)

| Variable | Valeur | Fichier:ligne | Notes |
|---|---|---|---|
| --bleu-principal | #065dbb | styles.css:12 | |
| ... | | | |

## Variables liées au thème

### Thème clair (par défaut ou sélecteur explicite)

| Variable | Valeur | Fichier:ligne |
|---|---|---|
| ... | | |

### Thème sombre

Sélecteur utilisé (à confirmer) : `[data-theme="dark"]` / `body.dark` / `@media (prefers-color-scheme: dark)` / autre.

| Variable | Valeur | Fichier:ligne |
|---|---|---|
| ... | | |

## Variables d'état (états visuels, modes contextuels)

| Variable | Valeur | Fichier:ligne | Contexte |
|---|---|---|---|
| ... | | | |
```

**Règle stricte** : ne lister que les variables effectivement définies. Pas de « pourrait être ». Si une variable est définie mais jamais utilisée, le signaler dans une colonne « Usages : 0 ».

Commande de support pour vérifier les usages :
```bash
grep -rn "var(--<nom-variable>)" --include="*.css" --include="*.html" --include="*.js" .
```

### 1.2 — Classes CSS pertinentes

Produire `ds-update/passe-1-inventaire/inventaire-classes.md`.

**Périmètre** : seulement les classes qui correspondent à des éléments du DS actuel (boutons, formulaires, cartes, badges, tableaux, modals, navigation, toggles, gradients). Pas besoin de lister chaque classe utilitaire.

Pour chaque classe, donner :
- Nom de la classe.
- Propriétés CSS clés (background, color, border, border-radius, padding, box-shadow).
- Fichier:ligne de définition.
- Variants connus (`.btn` + `.btn-principal`, `.btn-large`, etc.).

### 1.3 — Sélecteurs de thème (clair/sombre)

Produire `ds-update/passe-1-inventaire/inventaire-themes.md` avec :

- Mécanisme utilisé pour basculer entre thèmes : attribut sur `<body>` ? classe ? media query ? mécanisme JS ?
- Liste exhaustive des sélecteurs trouvés (`[data-theme="dark"] .xxx`, `.dark-mode .xxx`, etc.).
- Pour chaque composant majeur du DS (bouton, carte, sidebar, modal, etc.) : est-il sensible au thème sombre ? Si oui, quelles propriétés changent ?
- Mécanisme de persistance du choix de thème (localStorage ? préférence système ? autre ?).

**Question à signaler à Grégoire si tu ne trouves pas** : où est implémenté le toggle utilisateur pour basculer entre thèmes ?

### 1.4 — Modes contextuels

Produire `ds-update/passe-1-inventaire/inventaire-modes.md`.

Le DS actuel mentionne trois modes : Normal, Assisté (`data-mode="simulation"`), Anonymisation (`data-mode="anonymisation"`).

Recherche dans le code :
```bash
grep -rn 'data-mode' --include="*.css" --include="*.html" --include="*.js" .
```

Pour chaque mode trouvé : nom, sélecteur, fichiers concernés, composants affectés.

**Confirmation attendue** : le mode Assisté est-il vraiment absent du code ? Le mode Anonymisation est-il toujours présent ? Y a-t-il un nouveau mode non documenté ?

### 1.5 — Emojis dans le code

Produire `ds-update/passe-1-inventaire/inventaire-emojis.md`.

Recherche systématique des emojis dans les fichiers HTML et JS du projet (pas le DS lui-même, le **code applicatif**) :

```bash
grep -rP "[\x{1F300}-\x{1F9FF}]|[\x{2600}-\x{27BF}]" --include="*.html" --include="*.js" js/ index.html 2>/dev/null > ds-update/passe-1-inventaire/emojis-raw.txt
```

Pour chaque emoji trouvé : caractère, fichier:ligne, contexte (UI affichée ? commentaire ? string interne ?).

**Liste autorisée par le DS actuel** : 💡 📐 🍎 ⚠️. Si tu trouves d'autres emojis dans l'UI affichée, c'est une dérive à signaler.

### 1.6 — Tokens visuels (gradients, box-shadows, border-radius)

Produire `ds-update/passe-1-inventaire/inventaire-tokens-visuels.md`.

Recenser :
- Tous les `linear-gradient(...)` et `radial-gradient(...)` utilisés.
- Tous les `box-shadow: ...` utilisés.
- Toutes les valeurs de `border-radius` utilisées.

Pour chacun : valeur exacte, fichier:ligne, classe ou contexte d'utilisation.

**Particularité Labo Codex** : le module 04b documente une palette à 5 niveaux de box-shadow et 4 niveaux de border-radius. Vérifier la conformité.

### 1.7 — Synthèse de la passe 1

Produire `ds-update/passe-1-inventaire/README.md` avec :

- Nombre de variables CSS recensées (globales / clair / sombre / état).
- Nombre de classes CSS pertinentes recensées.
- Mécanisme de thème confirmé (clair/sombre).
- Modes contextuels confirmés.
- Nombre d'emojis trouvés dans l'UI applicative + liste des emojis hors-DS.
- Anomalies notables découvertes pendant l'inventaire.
- **3-5 questions ouvertes** que tu poseras à Grégoire avant la passe 2.

**Livrable terminé. En attente de validation pour passer à la PASSE 2.**

---

## PASSE 2 — Diff structuré DS ↔ code

**Objectif** : comparer le DS actuel au code réel, module par module, et produire une matrice de décision.

**Temps estimé** : 4-6 h. **Cette passe est segmentable en plusieurs sessions** — un module ou deux par session est raisonnable.

### Méthode pour chaque module

Pour chaque module du DS actuel (`design-system/*.html`), produire un fichier dans `ds-update/passe-2-diff/`.

**Format de chaque fichier de diff** :

```markdown
# Diff DS ↔ code — Module XX : [nom]

**Source DS** : `design-system/XX-nom.html`
**Sections du DS analysées** : <liste>

## Tableau de décision

| Élément du DS | Présent dans le code ? | Valeur DS | Valeur code | Décision proposée | Notes |
|---|---|---|---|---|---|
| --bleu-principal | Oui | #065dbb | #065dbb | À conserver | |
| Mode Assisté | Non | data-mode="simulation" | absent | À supprimer du DS | confirmé par Grégoire |
| Thème sombre — fond carte | Oui | absent du DS | rgb(...) à styles.css:1234 | À documenter dans DS | |
| ... | | | | | |

## Éléments du code non documentés dans le DS

| Élément code | Fichier:ligne | Décision proposée |
|---|---|---|
| Variable --gris-sombre-fond | styles.css:567 | À documenter dans DS (lié au mode sombre) |
| ... | | |

## Questions à Grégoire

1. ...
2. ...

## Synthèse

- Sections à supprimer du DS : <nombre>
- Sections à mettre à jour dans le DS : <nombre>
- Sections à ajouter au DS : <nombre>
- Sections à conserver telles quelles : <nombre>
- Éléments code à corriger (dérives non intentionnelles) : <nombre>
```

### Ordre de traitement des modules en passe 2

Suivre cet ordre, par cohérence logique :

1. **01a Palette** (fondation, contient les variables CSS de base).
2. **04a Navigation** + **04b Box-shadow** (thèmes et tokens visuels).
3. **03b Cartes et sidebars** (le mode Assisté vivait ici).
4. **06d Utilitaires beta97** (modes contextuels et utilitaires).
5. **01b Typographie**.
6. **02a Boutons**, **02b Formulaires**, **02c Badges**.
7. **03a Tableaux**, **03c Barres-gradient**, **03d Modals**.
8. **05 Patterns pédagogiques**.
9. **06a Emojis CRITIQUE**, **06b Toggles**, **06c Alertes**.
10. **07 Primo Assistant**.

### Vérifications transversales obligatoires à chaque module

Pour chaque diff produit, vérifier explicitement les invariants sémantiques :

- [ ] SOM = orange et PAN = bleu sont-ils respectés partout ?
- [ ] X orange = réinitialisation et X rouge = annulation sont-ils respectés ?
- [ ] Vocabulaire descriptif respecté (pas d'« échec », « faible », « insuffisant ») ?
- [ ] Emojis 💡📐🍎⚠️ seuls utilisés (et avec leur rôle fonctionnel) ?
- [ ] Contraste WCAG AA dans les deux thèmes (clair ET sombre) ?

Si une dérive est détectée sur un invariant sémantique, la **marquer comme priorité haute** dans la colonne « Décision proposée ».

### Synthèse de la passe 2

À la fin de la passe 2, produire `ds-update/passe-2-diff/README.md` avec :

- **Matrice de décision consolidée** : un tableau qui agrège les décisions de tous les modules, classées par type (supprimer / mettre à jour / ajouter / conserver / corriger code).
- **Liste des dérives sémantiques** détectées (priorité haute).
- **Cartographie du mode sombre** : un schéma textuel listant tous les composants sensibles au thème sombre et leurs adaptations.
- **Cartographie des modes contextuels restants** : confirmation de ce qui existe encore (Normal, Anonymisation ?), ce qui a disparu (Assisté).
- **Croisement modes × thèmes** : si deux modes contextuels coexistent avec deux thèmes, lister les 4 combinaisons et identifier celles qui sont effectivement implémentées dans le code (les autres seront documentées comme absentes intentionnelles ou à clarifier).

**Livrable terminé. En attente de validation pour passer à la PASSE 3.**

---

## PASSE 3 — Réécriture du DS, module par module

**Objectif** : produire un brouillon de DS v8 dans `ds-update/v8-drafts/`, en commençant par la fondation (palette) et en remontant module par module.

**Temps estimé** : 6-10 h selon l'ampleur des écarts confirmés. **Cette passe est segmentable en plusieurs sessions** — un ou deux modules par session, validation entre chaque.

### Règles de réécriture

1. **Format identique au DS v7** : conserver la structure HTML (header de module, section, component, example, specs, code, do-dont). Les enseignants utilisent ce DS, la familiarité de format compte.

2. **Date de vérification de conformité** : au début de chaque module, ajouter un commentaire HTML ou un encadré visible :
   ```html
   <!-- Dernière vérification de conformité avec le code : 2026-MM-DD -->
   <!-- Commit de référence : <hash git court> -->
   ```
   Cette information permettra à l'avenir de détecter rapidement une dérive comme celle qu'on traite aujourd'hui.

3. **Traçabilité dans le contenu** : pour chaque variable CSS, classe, ou règle documentée, citer en commentaire HTML invisible la source dans le code :
   ```html
   <!-- Source : styles.css:1234-1245 -->
   <li><strong>Background sombre :</strong> var(--carte-fond-sombre) (#1a2540)</li>
   ```

4. **Sections thème sombre** : pour chaque composant sensible au thème, ajouter une sous-section « Adaptation au thème sombre » avec :
   - Les propriétés qui changent.
   - Les valeurs équivalentes en sombre.
   - Le contraste WCAG AA vérifié pour les deux thèmes (mention explicite : « contraste AA validé : oui/non »).

5. **Sections modes contextuels** : ne documenter que les modes effectivement présents dans le code (le mode Assisté est supprimé). Si un mode a disparu, ne pas le mentionner du tout — pas de section « anciennement il y avait... ». Le DS documente le présent.

6. **Pas d'invention** : si un élément du DS v7 n'est pas dans le code et n'est pas signalé par Grégoire comme « à recréer dans le code », il est **supprimé** du DS v8, pas conservé « au cas où ».

### Ordre de réécriture en passe 3

Décidé par Grégoire : **commencer par 01a Palette** puisque c'est la fondation.

Ordre de traitement :

1. **01a Palette de couleurs** — réécriture complète avec sections clair + sombre.
2. **04a Navigation** — thèmes.
3. **04b Box-shadow** — adaptation des ombres au mode sombre (typiquement glows colorés en sombre vs ombres opaques en clair).
4. **03b Cartes et sidebars** — refonte des sections mode contextuel (retrait du mode Assisté, ajout adaptation sombre).
5. **06d Utilitaires beta97** — modes contextuels.
6. **01b Typographie**.
7. **02a Boutons** — variantes sombre des btn-principal, btn-ajouter, etc.
8. **02b Formulaires** — adaptation sombre des inputs, états validation.
9. **02c Badges Tétris**.
10. **03a Tableaux** — adaptation sombre.
11. **03c Barres-gradient** — vérification que SOM=orange et PAN=bleu restent reconnaissables sur fond sombre.
12. **03d Modals** — adaptation sombre.
13. **05 Patterns pédagogiques**.
14. **06a Emojis CRITIQUE** — vérification si nouveaux emojis ajoutés (icônes thème) et clarification de leur statut.
15. **06b Toggles**.
16. **06c Alertes** — adaptation sombre des couleurs d'alerte.
17. **07 Primo Assistant**.

### Validation après chaque module

Après chaque module réécrit, fournir à Grégoire :

1. Le brouillon `ds-update/v8-drafts/<module>.html` ouvrable dans un navigateur.
2. Un fichier `ds-update/v8-drafts/<module>-notes.md` avec :
   - Sections supprimées et raison.
   - Sections ajoutées et source dans le code.
   - Sections modifiées et nature du changement.
   - Questions ouvertes éventuelles.

Attendre validation explicite avant de passer au module suivant.

---

## ÉTAPE FINALE — Bascule v7 → v8

Une fois les 17 modules réécrits et validés par Grégoire :

1. Créer un dossier `design-system-v7-archive/` à la racine.
2. Déplacer le contenu de `design-system/` dans `design-system-v7-archive/`.
3. Déplacer le contenu de `ds-update/v8-drafts/` dans `design-system/`.
4. Mettre à jour `design-system/design-system-index.html` (fichier d'index si présent).
5. Commit final sur la branche `ds-update/2026-mai`.
6. **Ne pas merger sur main** sans validation explicite de Grégoire.

Produire un rapport de bascule `ds-update/RAPPORT-BASCULE.md` avec :
- Date de la bascule.
- Hash du commit.
- Liste des changements majeurs entre v7 et v8.
- Recommandations pour l'audit technique qui va reprendre derrière.

---

## Gestion de session

### En fin de chaque session de travail

Mettre à jour `ds-update/SESSION.md` avec :

```markdown
## Session du YYYY-MM-DD

**Durée** : X h Y min
**Passe en cours** : 1 / 2 / 3
**Modules traités cette session** : <liste>
**Modules restants pour la passe en cours** : <liste>

### Décisions prises avec Grégoire

- ...

### Points en suspens à reprendre la prochaine fois

- ...

### Prochaine action prévue

- ...
```

### En début de chaque session

Relire :
1. Ce plan complet (`ds-update/README.md`).
2. `ds-update/SESSION.md` pour reprendre où on en était.
3. Le dernier livrable produit pour se remettre en contexte.

Puis confirmer à Grégoire ce qui va être fait cette session, et obtenir son go.

---

## Posture attendue

### Ce que tu fais

- **Lire le code avant de documenter.** Toujours.
- **Citer la source dans le code** pour chaque section du DS.
- **Distinguer faits / inférences / extrapolations.**
- **Signaler les dérives sémantiques** comme priorité haute.
- **Respecter la séquence** : passe 1 → validation → passe 2 → validation → passe 3.
- **Segmenter le travail** en sessions de 60-90 minutes maximum.

### Ce que tu ne fais PAS

- **Pas d'invention.** Si ce n'est pas dans le code, ce n'est pas dans le DS.
- **Pas de complétion préventive** (« il serait logique d'ajouter... »).
- **Pas de modification du code applicatif** pendant ce travail. Seul le DS est touché.
- **Pas de modification de `design-system/*.html` directement.** Tout passe par `ds-update/v8-drafts/` jusqu'à validation finale.
- **Pas de superlatifs** dans les rapports (« remarquable », « excellent »).
- **Pas de masquage** des dérives détectées.

### Quand un résultat est ambigu

Format à utiliser :

```
[DÉCISION GRÉGOIRE REQUISE]
Constat : <ce qui est mesuré>
Interprétation A : ...
Interprétation B : ...
Ce qui aiderait à trancher : <question(s) précise(s)>
```

---

## Première action

1. Confirmer à Grégoire que tu as lu et compris ce plan.
2. Vérifier que la branche `ds-update/2026-mai` existe (la créer si non).
3. Créer la structure de dossier `ds-update/` avec les sous-dossiers vides.
4. Commencer la passe 1.1 (inventaire des variables CSS).
5. À la fin de la passe 1 complète, produire la synthèse et attendre validation.

**Bonne mise à jour.**
