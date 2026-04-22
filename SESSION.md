# SESSION — État au 22 avril 2026 midi

**Date** : 22 avril 2026
**Dernier build** : `0422-1135` · Beta 99.22
**Branche** : `main` (pushée)
**Statut** : **Plan 1 Autonomisation — Phase 4 complète (4.A + 4.B + 4.C livrées et testées terrain pour 4.B).** Prêt à démarrer **Phase 5** (retrait du mode démo legacy `donnees-demo.js`) après clear context.

---

## 🚀 Consigne de démarrage pour la prochaine session

À copier-coller au début de la prochaine session :

```
cd /Users/kuekatsheu/Documents/GitHub/Monitorage_v6

Contexte : clear context effectué le 22 avril midi après session intense
(7 commits entre b0422-0832 et b0422-1135). Build actuel : 0422-1135,
Beta 99.22, pushé sur origin.

Lis dans cet ordre :
1. SESSION.md (état complet, consigne)
2. MEMORY.md (auto-mémoire)
3. memory/feedback_no_debt.md (PRINCIPE DIRECTEUR : stabilité zéro-dette)
4. memory/project_autonomisation_utilisateur.md (Plan 1, Phases 5-7)
5. plans de travail/PLAN-AUTONOMISATION-UTILISATEUR.md (plan détaillé,
   Phases 5-7 à attaquer)

Action concrète à démarrer : Plan 1 Phase 5 — retrait du mode démo
legacy (`js/donnees-demo.js` + bandeau « Mode démonstration » + flag
`demo-actif` + snapshot). Migration silencieuse des flags obsolètes
au 1er démarrage post-livraison. Voir §2 de ce fichier pour le détail.

Convention de build : MMJJ-HHMM (Toronto). Demander le numéro de beta
à Grégoire avant chaque commit. Beta fixe pour la journée, seul le
build change entre commits. Beta courante : 99.22.
```

---

## 1. Travail fait aujourd'hui (22 avril 2026)

### Commits de la journée (7 commits Phase 3 + 4)

| Build | SHA | Livrable |
|---|---|---|
| 0422-0832 | `0ddc633` | Plan 1 Phase 3 — affichage `inspireDe` sur cartes biblio + panneau métadonnées CC |
| 0422-1000 | `46f3604` | Phase 4.A — identité CC utilisateur + fix contributor tracking (bug terrain) |
| 0422-1105 | `a560ee4` | Phase 4.B — formulaires démo en lecture seule + vocabulaire « Dupliquer » harmonisé |
| 0422-1135 | `602bacf` | Phase 4.C — interdiction des références mixtes à la sauvegarde |

Plus les commits du matin pushés en début de session : 6 commits entre `5d5d22c` et `5072f31` (Phase 2 complète + état pré-Phase 3).

### Phases du plan autonomisation — état final

| Phase | État | Commit |
|---|---|---|
| 1 — Namespace demo_* | ✅ Livrée | b0421-0730 |
| 2 — Sélecteurs à 2 sections | ✅ Livrée (2.0–2.5) | b0422-0738 |
| 3 — Fork et attribution | ✅ Livrée | b0422-0832 |
| 4.A — Identité CC utilisateur | ✅ Livrée | b0422-1000 |
| 4.B — Formulaires démo lecture seule | ✅ Livrée, testée iPad | b0422-1105 |
| 4.C — Interdiction références mixtes | ✅ Livrée | b0422-1135 |
| 5 — Retrait mode démo legacy | ⏳ À faire | — |
| 6 — Documentation | ⏳ À faire | — |
| 7 — Préparation Plan 2 | ⏳ À faire | — |

### Changements architecturaux majeurs aujourd'hui

- **Attribution CC séparée du métier** : `obtenirIdentiteCCUtilisateur()` (lit Réglages › Enseignant, filtre `isDemo`, fallback « Utilisateur de Labo Codex ») distinct de `obtenirNomEnseignantActif()` (enseignant du groupe-cours, usage métier PDF seulement). 9 call-sites migrés.
- **Helpers dans BibliothequeUI** : `formaterInspireDe`, `appliquerModeLectureSeuleDemo`, `forkerItem`, `verifierReferencesPasDemo`.
- **Vocabulaire UI** : « Dupliquer » partout (décision 22 avril). « Prendre comme modèle » abandonné.
- **CSS** : `.biblio-carte-inspire` (ligne italique attribution) + `.bandeau-demo-readonly` + `.demo-readonly` (mode lecture seule formulaires).

---

## 2. À faire — Plan 1 Phase 5 — Retrait du mode démo legacy

Le mode démo actuel (pré-Phase 1) chargeait les données démo **en bloc** dans les namespaces réels via `js/donnees-demo.js`, avec un snapshot et une décharge au refresh. Depuis Phase 1 le nouveau mécanisme (namespace `demo_*` permanent) rend ce système obsolète.

### À retirer / nettoyer

- **`js/donnees-demo.js`** : fonctions `entrerEnDemo`, `quitterDemo`, `nettoyerResiduDemo`, snapshot `demo-etat-precedent`, flag `demo-actif`. Soit vider le fichier, soit le supprimer et retirer le `<script>` de `index.html`.
- **Bandeau « Mode démonstration »** en bas d'écran : retiré. Le toggle « Données démo » de l'accueil V3 suffit pour signaler le mode.
- **Bouton « Quitter la démo »** dans le bandeau : retiré.
- **Flag `demo-actif`** : devenu obsolète. Migration : au 1er démarrage post-livraison, nettoyer silencieusement. Flag de migration `autonomisation-phase5-done` pour éviter ré-exécution.
- **Snapshot `demo-etat-precedent`** : plus utilisé, nettoyer si présent.

### À conserver

- Le toggle **« Données démo »** sur l'accueil V3 reste visible et continue de piloter l'affichage de la section Démo dans les sélecteurs (nouveau comportement Phase 2).

### Points d'attention

- Audit des callers de `entrerEnDemo` / `quitterDemo` / etc. — migrer ou supprimer.
- Vérifier que l'accueil V3 toggle n'appelle plus ces fonctions obsolètes (il devrait déjà être branché sur le nouveau comportement Phase 2).
- Tester migration silencieuse : démarrer sur un storage avec `demo-actif=true` legacy → nettoyage sans erreur, état propre.
- Zéro dette : supprimer entièrement le code mort, pas de code de compatibilité transitoire.

### Risques

- **Callers orphelins** : `entrerEnDemo` peut être appelé depuis plusieurs endroits UI. Grep rigoureux avant suppression.
- **Données utilisateur** : la migration doit être strictement no-op sur les vraies données (trimestres H2026, grilles réelles, etc.). Tests multi-contexte avant livraison.

---

## 3. Architecture actuelle (Beta 99.22)

### Matériel CC
- Matériel démo dans namespace `demo_*` parallèle (Phase 1)
- `auteur: "Labo Codex"` réservé au code d'init démo (chaîne protégée)
- Attribution utilisateur via `obtenirIdentiteCCUtilisateur()` — fallback « Utilisateur de Labo Codex » si Réglages non configurés
- Fork via bouton « Dupliquer » (partout — cartes biblio + bandeau formulaire démo)
- `inspireDe` ajouté automatiquement à chaque duplication, visible sur cartes et panneau métadonnées

### Démo
- Dropdowns natifs exposent les démos via `<optgroup>` avec options disabled (Phase 2)
- 5 modules biblio affichent badge « Démo » + titre préfixé `[Démo]`
- Formulaires d'édition ouverts en lecture seule sur items démo (Phase 4.B) avec bandeau « Dupliquer » en tête
- Sauvegarde des entités assemblées (groupe-cours, pratique, évaluation) refuse les refs démo avec message clair (Phase 4.C)

### Contribution tracking
- `ajouterContributeurSiNecessaire` : ajoute l'identité CC utilisateur comme contributeur quand un item modifié n'est pas de cette identité. N'early-return plus silencieusement.
- Affiché dans le panneau métadonnées via ligne « Contributeur(s) ».

### Vocabulaire UI
- « Dupliquer » partout. « Prendre comme modèle » abandonné (décision 22 avril 2026).

---

## 4. Plans en cours

| Plan | Statut | Priorité | Remarque |
|---|---|---|---|
| PLAN-AUTONOMISATION-UTILISATEUR.md | **Phases 1–4 livrées** | **Haute** | Phase 5 à attaquer (retrait donnees-demo.js) |
| PLAN-PARTAGE-RESSOURCES.md | Cadré, vocabulaire harmonisé | Basse | Attend Plan 1 complet |
| PLAN-CONSOLIDATION-ONBOARDING.md | ✅ Livré 21 avril | — | — |

---

## 5. Conventions opérationnelles

- **Build** : format `MMJJ-HHMM` Toronto. Bump à chaque commit. Beta fixe journée.
- **Demander numéro de beta** avant chaque commit ; ne jamais renuméroter auto.
- **version.json** + fallback `js/init-inline.js` BUILD_ID à chaque commit.
- **CSP strict** : `script-src 'self'`. Violations Cloudflare/beacon attendues.
- **Principe zéro-dette** (CLAUDE.md §Principes directeurs) : appliquer partout.
- **Sécurité** : `echapperHtml` sur innerHTML, `validerZipSecurite` sur imports, etc.

---

## 6. Préservation des données personnelles

Grégoire fait des backups Codex réguliers. Données personnelles (trimestres réels H2026/A2025, grilles, évaluations, productions) **intouchables**. Les migrations silencieuses du chantier ne touchent que les flags et attributions techniques.

Phase 5 inclura une migration silencieuse au 1er démarrage post-livraison : nettoyage du flag `demo-actif`, du snapshot `demo-etat-precedent`, et de tout résidu du mode démo legacy. Test terrain rigoureux avant push.
