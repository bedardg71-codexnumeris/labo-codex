# Tests manuels pendants — 22 mai 2026 PM

**Cible** : Grégoire, à exécuter à la prochaine session (post-évaluations du trimestre).
**Contexte** : ferme tous les tests manuels accumulés depuis le 21 mai soir (post-cycle Cat-B). État de référence : `main` HEAD `00f2f40`, Beta 99.62 build 0522-1115.

**Temps total estimé** : ~5-6 h (peut être étalé sur 2 sessions).

---

## Préparation commune

```bash
cd /Users/kuekatsheu/Documents/GitHub/Monitorage_v6
git status                      # propre côté tracké, untracked attendus
git log --oneline main -5       # HEAD attendu : 00f2f40
npx http-server -p 8080 -c-1    # serveur local
```

Ouvrir Safari à `http://localhost:8080/`.

Pour les tests iPad (D), noter l'IP locale du Mac et ouvrir sur iPad `http://<IP>:8080/`. Connecter Mac+iPad en USB-C, puis Safari Mac → menu Développement → choisir iPad → ouvrir Web Inspector distant.

---

## Section A — Tests critiques (bug latent fixé — vérifier non-régression)

> Le commit `5ccb306` du 22 mai après-midi a réparé un bug latent introduit par `6b2da4b` du matin : l'IIFE de `trimestre.js` crashait au load (exports cassés `genererCalendrierComplet` + `afficherStatistiquesTrimestre`), donc `obtenirCalendrierComplet` et `obtenirInfosJour` n'étaient PAS sur `window` depuis ~6 h ce matin-là. Plusieurs sites étaient cassés silencieusement. **Vérifier que tout fonctionne à nouveau.**

| # | Test | Comportement attendu | Statut |
|---|---|---|:---:|
| A.1 | Boot complet de l'app (Safari Mac) | Pas d'erreur console rouge à l'ouverture. Console F12 → onglet « Console ». | ☐ |
| A.2 | Créer un snapshot (Réglages → Codex → Snapshot) | Snapshot créé sans erreur, contenu non vide. Avant fix : `obtenirCalendrierComplet is not defined`. | ☐ |
| A.3 | Ouvrir la vue Calendrier (si présent dans la nav) | Calendrier affiche correctement les semaines, jours de cours et congés. | ☐ |
| A.4 | Saisie présences | Les jours de cours sont correctement marqués. | ☐ |
| A.5 | Réglages → Cours → bouton « Bibliothèque » | Modal s'ouvre avec liste cours dans/hors bibliothèque. | ☐ |
| A.6 | Modal bibliothèque cours → « Dupliquer pour trimestre actif » | Le cours dupliqué apparaît correctement dans le trimestre actif. | ☐ |
| A.7 | Réglages → Groupe → ajouter étudiant V2 (accordéon) | Étudiant ajouté, liste mise à jour. | ☐ |
| A.8 | Réglages → Groupe → modifier puis supprimer un étudiant | Édition + suppression sans erreur. | ☐ |
| A.9 | Réglages → Trimestre V2 → modifier dates trimestre | Calendrier régénéré, horaires mis à jour. | ☐ |

**Si une régression apparaît** : noter dans `SUIVI-BUGS.md` section Ouverts + screenshot console si erreur. NE PAS revert sans diagnostiquer — le commit `5ccb306` est probablement correct, c'est l'ancien comportement qui était cassé.

---

## Section B — Tests visuels post-fixes a11y (22 mai PM) — ✅ LIVRÉE 23 mai 2026

> Commits livrés : `36a7a81` (T-A3 contraste), `f546215`+`eff9950` (T-A5 focus-ring), `91668ac` (fix régression doubles box-shadow), `22914ac` (T-A10 touch targets).
> **Résultat Grégoire (23 mai 2026)** : « tout est beau » — aucune régression, lisibilité OK modes sombre+clair, focus ring 3 px visible partout, touch targets desktop inchangés.

### B.1 — Lisibilité couleurs ajustées (T-A3)

Variables modifiées : `--texte-muted` et `--gris-clair` (3 modes : sombre, clair, print).

| # | Zone à vérifier | Comportement attendu | Statut |
|---|---|---|:---:|
| B.1.1 | Cartes étudiants (texte secondaire : DA, groupe, programme) | Lisibles, contraste suffisant, pas trop sombres | ✅ |
| B.1.2 | Badges et métadonnées de listes (productions, grilles, biblios) | Métadonnées « par X · discipline · date » lisibles | ✅ |
| B.1.3 | En-tête tableaux (titres colonnes) | Lisibles | ✅ |
| B.1.4 | Texte d'aide / placeholder dans formulaires | Lisibles | ✅ |
| B.1.5 | Mode clair : mêmes vérifs | Lisibles | ✅ |
| B.1.6 | Apparence générale | Pas de zone qui devient trop foncée (au point d'être désagréable à lire) | ✅ |

**Si zone problématique** : noter localisation précise + screenshot. Les variables peuvent être affinées ponctuellement.

### B.2 — Focus visible clavier (T-A5 + bug fix régression)

22 sites où `outline: none` a été complété par `box-shadow: var(--focus-ring)`. Test : Tab à travers la page et vérifier qu'un focus ring (couleur sarcelle/accent, 3 px) est toujours visible.

| # | Site | Test | Statut |
|---|---|---|:---:|
| B.2.1 | Inputs formulaires (.controle-form) | Tab vers un input → focus ring 3px sarcelle | ✅ |
| B.2.2 | Wizard pratique V2 inputs/textarea/select | Focus ring visible | ✅ |
| B.2.3 | `#btn-codex` (en-tête) | Focus ring visible | ✅ |
| B.2.4 | Modal rétroaction travaux (textarea + nom-input) | Focus ring visible | ✅ |
| B.2.5 | Metadata CC ligne (input/select) | Focus ring visible | ✅ |
| B.2.6 | Boutons d'action `.btn` divers | Focus ring visible | ✅ |
| B.2.7 | Mode clair : refaire B.2.1 et B.2.3 | Focus ring visible en mode clair | ✅ |

### B.3 — Touch targets 44×44 px (T-A10)

À tester sur **iPad réel** (couvert aussi en D.B). Sur Mac, simuler avec Web Inspector → Responsive Design Mode → iPad.

| # | Élément | Test | Statut |
|---|---|---|:---:|
| B.3.1 | `#btn-codex` (en-tête) | Bouton clairement tactile, ≥ 44×44 px | ✅ |
| B.3.2 | `.btn-icon-header` (anonymisation, thème) | Cibles élargies à 44×44 sur iPad | ✅ |
| B.3.3 | Boutons d'action en tableaux denses | Cibles ≥ 44 px de haut sur iPad | ✅ |
| B.3.4 | Aucune régression desktop (souris) | Densité visuelle inchangée sur Mac | ✅ |

---

## Section C — Audit 6.2 partie 2 — Parcours clavier + VoiceOver Mac (~1h30) — ⏸ REPORTÉE (23 mai 2026)

> Source : `audit/reports/06-2-manual.md` §3.3.
> **Décision Grégoire (23 mai 2026)** : section sautée pour cette session, à reprendre ultérieurement (pas une priorité immédiate). Aucun parcours C.1-C.5 exécuté.

**Préparation** : activer VoiceOver Mac (`Cmd+F5` ou Touch ID 3×). Désactiver avec le même raccourci.

Pour chaque parcours, cocher 3 colonnes : Focus visible / VoiceOver lisible / Verdict.

| Parcours | Statut |
|---|:---:|
| C.1 — Créer un nouvel élève | ☐ |
| C.2 — Ajouter une évaluation d'artefact | ☐ |
| C.3 — Consulter le profil d'un élève | ☐ |
| C.4 — Déclencher une intervention RàI | ☐ |
| C.5 — Exporter les données (menu Codex) | ☐ |

**Au fil de l'eau**, vérifications globales :
- ☐ Focus visible sur tous les éléments interactifs (jamais `outline: none` sans alternative)
- ☐ Tab préserve un ordre logique de lecture
- ☐ Échap ferme modales / menus
- ☐ Entrée active le bouton focalisé

**Notation détaillée** : reporter dans `audit/reports/06-2-manual.md` §3.3 (édition directe du livrable audit). Cocher les cases existantes et remplir les colonnes « Notes / problèmes ».

---

## Section D — Audit 6.3 partie 2 — Tests iPad réel (~2h) — ⏸ REPORTÉE (23 mai 2026)

> Source : `audit/reports/06-3-ipad.md` §3.2.
> **Décision Grégoire (23 mai 2026)** : section sautée pour cette session, à reprendre ultérieurement (pas une priorité immédiate). Aucun test D.A-D.F exécuté.

### D.A — Viewport et mise en page

| # | Test | Attendu | Statut |
|---|---|---|:---:|
| D.A.2 | Pas de scroll horizontal en portrait | OK | ☐ |
| D.A.3 | Orientation portrait OK | Tout lisible et accessible | ☐ |
| D.A.4 | Orientation paysage OK | Idem | ☐ |
| D.A.5 | Rotation préserve l'état | Formulaire en cours, position scroll préservés | ☐ |

### D.B — Touch targets (Web Inspector)

Mesurer 5 éléments-clés. Méthode : Web Inspector → sélectionner l'élément → onglet « Computed » → noter `width` et `height` (44 pt ≈ 44 px CSS).

| # | Élément | Sélecteur | Largeur mesurée | Hauteur mesurée | ≥ 44×44 ? | Statut |
|---|---|---|---|---|:---:|:---:|
| D.B.1 | Bouton Codex en-tête | `#btn-codex` | __ | __ | __ | ☐ |
| D.B.2 | Sélecteur groupe-cours | `#selectGroupeCoursHeader` | __ | __ | __ | ☐ |
| D.B.3 | Icône Aide en-tête | `button[data-param="aide"]` (ou équivalent) | __ | __ | __ | ☐ |
| D.B.4 | Bouton ⋮ menu (carte biblio) | `.biblio-menu-trigger` | __ | __ | __ | ☐ |
| D.B.5 | Lien profil étudiant | `.btn-voir-profil` ou ligne tableau étudiants | __ | __ | __ | ☐ |

### D.C — Interactions tactiles

| # | Test | Attendu | Statut |
|---|---|---|:---:|
| D.C.1 | Pas de hover-only | Tooltips et menus ⋮ accessibles au tap | ☐ |
| D.C.2 | Pas de double-tap involontaire | Pas de zoom inattendu | ☐ |
| D.C.3 | Long-press réservé au texte | Pas de menu contextuel applicatif | ☐ |
| D.C.4 | Swipe latéral natif | Swipe depuis bord gauche = retour Safari | ☐ |
| D.C.5 | Pinch zoom | Le pinch agrandit le contenu | ☐ |

### D.D — Clavier externe (Bluetooth, si disponible)

| # | Test | Attendu | Statut |
|---|---|---|:---:|
| D.D.1 | Tab navigation | Tous contrôles, focus visible | ☐ |
| D.D.2 | Cmd+F (recherche Safari) | Safari native ou ne casse rien | ☐ |
| D.D.3 | Échap | Ferme modales / menus | ☐ |
| D.D.4 | Entrée | Soumet formulaires | ☐ |
| D.D.5 | Flèches | Navigation dans listes / selects | ☐ |

### D.E — Performance perçue

| # | Test | Attendu | Statut |
|---|---|---|:---:|
| D.E.1 | Chargement initial | < 3 s sur Wi-Fi standard | ☐ |
| D.E.2 | Réactivité au tap | < 100 ms perçus | ☐ |
| D.E.3 | Fluidité scroll | Pas de saccades visibles | ☐ |
| D.E.4 | Tableau de bord avec 51 étudiants | Reste fluide | ☐ |
| D.E.5 | Profil étudiant avec graphiques | Chargement < 2 s | ☐ |

### D.F — Stockage (IndexedDB Safari iPad)

| # | Test | Attendu | Statut |
|---|---|---|:---:|
| D.F.1 | Persistance après fermeture Safari | Données présentes au rouvrir | ☐ |
| D.F.2 | Persistance après redémarrage iPad | Données présentes | ☐ |
| D.F.3 | Mode privé Safari | Erreur lisible si IndexedDB indisponible | ☐ |
| D.F.4 | Quota localStorage Safari | Comportement gracieux si dépassement | ☐ |

**Notation détaillée** : reporter dans `audit/reports/06-3-ipad.md` §3.2 (édition directe).

---

## Section E — Test visuel Cat-B Track 4 chantier E (notifications, reporté du 21 mai) — ⏸ REPORTÉE (23 mai 2026)

> Source : MEMORY.md « Session 21 mai 2026 soir — Cat-B Track 4 chantier E ». Le module `utils-notifications.js` a remplacé 525 sites d'appel — vérifier qu'aucune notification ne s'est cassée.
> **Décision Grégoire (23 mai 2026)** : section sautée pour cette session, à reprendre ultérieurement (pas une priorité immédiate). Aucun scénario E.1-E.6 exécuté.

6 scénarios à déclencher, sur Safari Mac + iPad Air, en modes sombre + clair :

| # | Scénario | Notification attendue | Statut |
|---|---|---|:---:|
| E.1 | Sauvegarde d'une production | `notifications.succes('Production enregistrée')` (ou équivalent) | ☐ |
| E.2 | Sauvegarde d'une évaluation | `notifications.succes` | ☐ |
| E.3 | Erreur d'import ZIP (charger un .zip corrompu) | `notifications.erreur` avec détails | ☐ |
| E.4 | Archivage en réserve (Réglages → Codex → Réserve → Archiver) | `notifications.succes` | ☐ |
| E.5 | Ajout d'un enseignant (Réglages → Trimestre V2 → Enseignants) | `notifications.succes` | ☐ |
| E.6 | Fermeture du codex (sauvegarde + reset) | `notifications.succes` | ☐ |

Pour chaque : vérifier que le toast s'affiche, que les couleurs sont correctes en mode sombre ET clair, que le `role="status"` (ou `role="alert"` pour erreurs) est annoncé par VoiceOver, et que le toast disparaît après 3 s (succès/info) ou 5 s (erreur).

---

## Section F — PLAN-COURT-TERME 7.1 + 7.2 (pré-AQPC) — ⏸ REPORTÉE (23 mai 2026)

> Source : `audit/PLAN-COURT-TERME.md` Phase 7. Ces tests sont moins formels que C/D mais doivent être faits avant la présentation AQPC du 3 juin.
> **Décision Grégoire (23 mai 2026)** : section sautée pour cette session, à reprendre avant AQPC du 3 juin. Aucun test F.7.1-F.7.2 exécuté.

| # | Test | Statut |
|---|---|:---:|
| F.7.1 | Smoke test global (1 itération complète d'une évaluation + saisie présences + consultation profil) | ☐ |
| F.7.2 | Vérification visuelle des écrans présentés en démo AQPC | ☐ |

---

## Rapport final

Une fois tous les tests cochés ou notés :

1. **Bilan global** : combien de cases ☐ → ☑ ? Combien d'anomalies trouvées ? Bloquantes ou cosmétiques ?
2. **Mises à jour** :
   - Cocher les cases dans `audit/reports/06-2-manual.md` et `06-3-ipad.md` (sections respectives).
   - Mettre à jour `audit/reports/06-summary.md` : verdicts 6.2 et 6.3 partie 2 (probablement Vert si rien de bloquant).
   - Inscrire bugs trouvés dans `Retours des testeurs/SUIVI-BUGS.md` section Ouverts.
3. **Décision** :
   - Si aucun bug bloquant : audit annuel **finalement Vert sur l'axe 6 accessibilité** (tous les 3 sous-audits Verts).
   - Si bugs trouvés : prioriser pré-AQPC vs post-AQPC.

Demander à la prochaine instance Claude de tracker ces résultats dans SESSION.md §1 « Tests manuels Grégoire — LIVRÉS » + entrée historique §5.

---

**Document créé** : 22 mai 2026 PM, post-livraison T-A10. Branche `main` HEAD `00f2f40`. À conserver tant que tous les ☐ ne sont pas ☑.
