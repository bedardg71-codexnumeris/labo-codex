# Licence du Système de Suivi des Apprentissages

**Auteur :** Grégoire Bédard
**Projet :** Système de monitorage pédagogique (Application web)
**Date de création :** 27 octobre 2025
**Dernière modification :** 16 octobre 2026

---

## Double licence

Ce projet utilise une **double licence** pour distinguer le code technique du contenu pédagogique :

### 1️⃣ Code source → GNU Affero General Public License v3.0 (AGPL v3)

**Concerne :**
- Tous les fichiers HTML (index *.html)
- Tous les fichiers JavaScript (js/*.js)
- Tous les fichiers CSS (styles.css)
- La structure technique de l'application

**Pourquoi AGPL v3 ?**
- Garantit que le code reste libre et open source
- **Protège contre l'appropriation commerciale, même en mode SaaS** (hébergement en ligne)
- Assure que toutes les modifications restent accessibles à la communauté
- Protection contre les brevets logiciels
- Ferme la faille "SaaS loophole" présente dans GPL v3

**Différence clé vs GPL v3 :**
> Si quelqu'un héberge une version modifiée de l'application en ligne (ex: plateforme SaaS), l'AGPL v3 l'oblige à partager le code source modifié avec les utilisateurs. La GPL v3 ne le forçait pas.

**Texte complet :** le fichier [`LICENSE`](LICENSE), copie conforme du texte publié par la Free Software Foundation (<https://www.gnu.org/licenses/agpl-3.0.html>).

### 2️⃣ Contenu pédagogique → Creative Commons BY-NC-SA 4.0

**Concerne :**
- Documentation et aide intégrée (section Aide de l'application)
- Concepts pédagogiques (A-C-P, RàI, SRPNF, IDME)
- Formules et algorithmes de calcul des indices
- Guides méthodologiques (CLAUDE.md, README, documentation)
- Articles et références bibliographiques

**Pourquoi CC BY-NC-SA 4.0 ?**
- Permet l'adaptation pour différents contextes pédagogiques
- Autorise le partage dans des publications académiques
- Encourage la collaboration entre enseignants
- **Protège le travail des enseignants (pas d'usage commercial)**
- Favorise le partage et le bien commun en éducation
- Redistribution sous même licence (ShareAlike)

**Texte complet :** <https://creativecommons.org/licenses/by-nc-sa/4.0/legalcode.fr>

---

## Quel dossier relève de quelle licence

Le tableau dit la licence de chaque dossier du dépôt. Trois règles passent avant lui :

- **Le contenu pédagogique relève de CC BY-NC-SA 4.0 même quand il vit dans un fichier de code.** C'est le cas des textes de l'aide intégrée, des cartouches et des grilles, échelles et gabarits fournis avec l'application (section 2).
- **Les logos et les noms « Labo Codex » et « Codex Numeris » sont protégés : tous droits réservés, où qu'ils se trouvent.** Ni l'AGPL v3 ni CC BY-NC-SA ne s'y appliquent, y compris quand ils figurent dans un fichier de code ou dans une ressource sous l'une de ces licences. Cela vaut pour les fichiers de `Logo/` et `img/logo-codex-numeris.svg`, et pour les logos intégrés au code.
- **Les icônes d'Icons8 restent sous la licence d'Icons8** (<https://icons8.com>), pas sous les nôtres. Ce sont les fichiers `icons8-*` de `icons/` et d'`autocollants/`.

| Dossiers et fichiers | Licence |
|---|---|
| `index.html`, `design-system.html`, `styles.css`, `css/`, `js/`, `version.js`, `version.json`, `noms_stables.json`, `netlify.toml` | AGPL v3 (code de l'application) |
| `icons/`, `img/` | AGPL v3 (ressources graphiques de l'interface), **sauf** les fichiers `icons8-*` (licence d'Icons8) et le logo `img/logo-codex-numeris.svg` (tous droits réservés) |
| `scripts/`, `tests/`, `.github/` | AGPL v3 (outillage, bancs d'essai, intégration continue) |
| `Design system - Modules/`, `design_handoff_synthese_B/` | AGPL v3 (maquettes HTML, CSS et JSX) |
| `docs/`, `plans de travail/`, `Rapports/`, `audit/`, `audit annuel/`, `Plan Accompagnement/`, `Retours des testeurs/`, `références tableur/` | CC BY-NC-SA 4.0 (documentation, plans, rapports) |
| `.claude/`, `.claude-plugin/`, `plugins/` et les fichiers `.md` et `.txt` de la racine | CC BY-NC-SA 4.0 (guides méthodologiques) |
| `Logo/` | **Tous droits réservés** (logos du projet) |
| `autocollants/` | CC BY-NC-SA 4.0, **sauf** les fichiers `icons8-*` (licence d'Icons8) |
| `libs/` | **Licences de chaque bibliothèque** (MIT, Apache 2.0), inventoriées dans [`libs/VERSIONS.md`](libs/VERSIONS.md). Ni l'AGPL v3 ni CC BY-NC-SA ne s'y appliquent. |

Les documents de tiers reproduits dans le dépôt (calendrier scolaire du collège, extraits cités, badges Creative Commons de `icons/`) restent sous les droits de leurs auteurs.

---

## Résumé des permissions

### ✅ Vous POUVEZ :

**Code (AGPL v3) :**
- Utiliser l'application dans votre établissement (installation locale)
- Modifier le code pour l'adapter à vos besoins
- Redistribuer vos versions modifiées
- Utiliser commercialement **si vous redistribuez sous AGPL v3**
- Héberger en ligne **si vous publiez le code source modifié**

**Contenu (CC BY-NC-SA 4.0) :**
- Copier et redistribuer les concepts pédagogiques **à des fins éducatives**
- Adapter les textes pour vos cours (usage non-commercial)
- Publier dans des articles académiques avec attribution
- Traduire dans d'autres langues
- Partager avec vos collègues

### ❌ Vous NE POUVEZ PAS :

**Code (AGPL v3) :**
- Redistribuer une version modifiée sous licence propriétaire
- Vendre une version fermée sans partager le code source
- Héberger en ligne sans publier le code source modifié
- Retirer les mentions de licence

**Contenu (CC BY-NC-SA 4.0) :**
- Utiliser sans attribution à l'auteur original
- **Utiliser à des fins commerciales (vente, formation payante, etc.)**
- Redistribuer sous une licence incompatible
- Retirer les crédits et mentions de licence

---

## Attribution requise

Lors de l'utilisation ou redistribution, veuillez inclure :

```
Système de suivi des apprentissages
© 2025 Grégoire Bédard
Code : AGPL v3.0 | Contenu : CC BY-NC-SA 4.0
https://github.com/[votre-repo]
```

---

## Cas d'usage typiques

### Enseignant qui veut utiliser l'application
✅ **Autorisé** : Télécharger, installer, utiliser tel quel (usage local)
📄 **Licence applicable** : AGPL v3 + CC BY-NC-SA 4.0
⚠️ **Condition** : Aucune (usage personnel local)

### Collègue qui veut adapter les textes pédagogiques
✅ **Autorisé** : Copier les concepts dans ses propres documents
📄 **Licence applicable** : CC BY-NC-SA 4.0
⚠️ **Condition** : Attribution à Grégoire Bédard

### Développeur qui veut améliorer le code
✅ **Autorisé** : Modifier le code et redistribuer
📄 **Licence applicable** : AGPL v3
⚠️ **Condition** : Publier modifications sous AGPL v3

### Établissement qui veut déployer pour tous ses enseignants
✅ **Autorisé** : Installation sur serveur local, modifications internes
📄 **Licence applicable** : AGPL v3 + CC BY-NC-SA 4.0
⚠️ **Condition** : Si hébergement web accessible à l'extérieur, publier le code source

### Chercheur qui veut citer dans un article
✅ **Autorisé** : Citer les concepts, formules, méthodologie
📄 **Licence applicable** : CC BY-NC-SA 4.0
⚠️ **Condition** : Citation appropriée dans la bibliographie

---

## Questions fréquentes

**Q : Puis-je utiliser l'application dans un contexte commercial (ex: formation privée) ?**
R : Oui, mais si vous redistribuez une version modifiée, elle doit rester sous AGPL v3.

**Q : Puis-je publier mes adaptations des concepts dans un livre commercial ?**
R : Non, la licence NC (Non-Commercial) interdit l'usage commercial. Pour un usage académique non-commercial, oui avec attribution sous CC BY-NC-SA 4.0.

**Q : Puis-je créer une version modifiée sans partager mon code ?**
R : Non si vous la redistribuez OU l'hébergez en ligne. Oui si c'est pour usage local interne uniquement.

**Q : Quelle est la différence entre AGPL v3 et GPL v3 ?**
R : L'AGPL v3 ferme la "faille SaaS" : si vous hébergez l'application en ligne (même sans la distribuer), vous devez partager le code source. La GPL v3 ne l'exigeait pas.

**Q : Les données que je mets dans l'application sont-elles soumises à ces licences ?**
R : Non. Vos données d'étudiants vous appartiennent et ne sont pas couvertes par ces licences.

**Q : Pourquoi passer de GPL v3 à AGPL v3 ?**
R : Pour protéger le projet contre l'appropriation par des entreprises qui hébergeraient une version modifiée en ligne sans partager leurs améliorations avec la communauté.

---

## Avis concernant l'usage commercial

Ce projet est conçu comme un **commun éducatif** — gratuit, ouvert et collaboratif. Il est le fruit
de 30 ans d'enseignement, de 7 ans de pratique de l'enseignement explicite et de 2 ans de
recherche-action. Il est destiné à la communauté enseignante du réseau collégial et universitaire.

L'AGPL v3.0 autorise techniquement l'usage commercial du code, mais sous des conditions très
strictes (publication intégrale du code source modifié, y compris en mode SaaS).

**Toute exploitation commerciale de l'application, de ses modèles pédagogiques ou de ses contenus
(vente, intégration dans un produit payant, hébergement commercial) nécessite une autorisation
écrite préalable de l'auteur.**

---

## Contact et contributions

**Auteur :** Grégoire Bédard
**Institution :** Cégep de Drummondville
**Labo Codex :** https://codexnumeris.org/apropos

Les contributions sont les bienvenues ! Veuillez soumettre des pull requests ou ouvrir des issues sur le dépôt GitHub.

---

## Versions des licences

- **AGPL v3.0** : https://www.gnu.org/licenses/agpl-3.0.html
- **CC BY-NC-SA 4.0** : https://creativecommons.org/licenses/by-nc-sa/4.0/deed.fr

**Historique des licences :**
- **27 octobre 2025** : GPL v3 + CC BY-SA 4.0 (versions initiales)
- **3 novembre 2025** : AGPL v3 + CC BY-SA 4.0 (protection renforcée contre appropriation SaaS)
- **26 novembre 2025** : AGPL v3 + CC BY-NC-SA 4.0 (protection enseignants, usage non-commercial)
- **14 avril 2026** : Ajout de l'avis d'usage commercial et précision du statut de commun éducatif
- **16 octobre 2026** : Aucune licence ne change. Le titre de la section 2 dit enfin « BY-NC-SA », comme le reste. Ajout du tableau des dossiers, de la mention des bibliothèques tierces et du texte complet de l'AGPL v3 (`LICENSE`). Les logos et les noms Labo Codex et Codex Numeris sont « tous droits réservés » (décision de l'auteur), et les icônes d'Icons8 restent sous leur licence

**Dernière mise à jour :** 16 octobre 2026
