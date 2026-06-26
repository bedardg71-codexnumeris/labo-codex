# Règles de protection de branche — `main`

> **Statut au 26 juin 2026 — suspendu.** Depuis la privatisation du dépôt
> (23 juin 2026), la protection de branche `main` est **inactive** : l'API
> GitHub renvoie `403 — Upgrade to GitHub Pro` (la feature exige GitHub Pro
> sur un dépôt privé). Le check **`Analyse CodeQL` a été retiré** le 26 juin
> (Advanced Security indisponible gratuitement sur dépôt privé) ; `codeql.yml`
> n'existe plus. Ce document reste une **référence de configuration** à
> réappliquer si le dépôt redevient public ou passe à GitHub Pro — il ne
> décrit pas l'état courant. Voir `ETAT-PROJET.md` §7.2.
>
> Configuration à appliquer **côté UI GitHub** (Settings → Branches → Branch
> protection rules → Add rule), le cas échéant.
>
> Référence : `audit/PLAN-MOYEN-TERME.md` §5.3 (OpenSSF Scorecard).

---

## Contexte solo dev

Labo Codex est maintenu par **une seule personne** (Grégoire Bédard). Les règles
classiques d'équipe (revue par un pair, code owners) sont **désactivées** car
elles bloqueraient tout merge. Les protections retenues visent à :

1. **Préserver l'intégrité de l'historique** : pas de force-push, pas de
   suppression accidentelle de `main`, historique linéaire (lisible via
   `git log --oneline`).
2. **Bloquer le merge si les tests rouges** : Vitest + Playwright doivent
   passer avant qu'une PR atteigne `main` (CodeQL retiré le 26 juin).
3. **Permettre les hotfixes** : l'admin (Grégoire) peut bypasser en cas
   d'urgence opérationnelle.

---

## Règles recommandées

### Branch name pattern

```
main
```

### Restrictions à activer

| Option | Valeur | Justification |
|---|---|---|
| **Require a pull request before merging** | ❌ Désactivé | Solo dev — bloquerait tout commit direct sur main qui est le workflow actuel. |
| **Require status checks to pass before merging** | ✅ Activé | Bloque merge si tests rouges. |
| **Require branches to be up to date before merging** | ✅ Activé | Force le rebase ou la mise à jour avant merge → évite les conflits de dernière minute. |
| **Status checks required** | `Vitest + Playwright (WebKit)` | Job name tel que défini dans `.github/workflows/tests.yml`. (`Analyse CodeQL` retiré le 26 juin — `codeql.yml` supprimé.) |
| **Require conversation resolution before merging** | ⚪ Optionnel | Utile si tu reçois des PR externes. Sinon ignorer. |
| **Require signed commits** | ⚪ Optionnel | Demande une config GPG ou SSH signing locale. Pas critique tant que tu es seul committer. |
| **Require linear history** | ✅ Activé | Cohérent avec ton workflow merge FF + tag. Bloque les merge commits non-FF. |
| **Require deployments to succeed before merging** | ❌ Désactivé | Netlify déploie après merge, pas avant. |
| **Lock branch** | ❌ Désactivé | Tu écris activement sur main. |
| **Do not allow bypassing the above settings** | ❌ Désactivé | Tu dois pouvoir bypasser en cas d'urgence. |
| **Restrict who can push to matching branches** | ⚪ Optionnel | Tu es le seul collaborateur. Activable si tu ajoutes un mainteneur. |

### Règles destructrices à bloquer

| Option | Valeur |
|---|---|
| **Allow force pushes** | ❌ Tout le monde (y compris admin) interdit |
| **Allow deletions** | ❌ Interdit |

---

## Procédure d'activation

1. Aller à <https://github.com/bedardg71-codexnumeris/Monitorage_v6/settings/branches>.
2. Cliquer **Add branch protection rule** (ou éditer la règle existante).
3. **Branch name pattern** : `main`.
4. Cocher les cases selon le tableau ci-dessus.
5. Dans **Status checks required**, ajouter :
   - `Vitest + Playwright (WebKit)` (du workflow `tests.yml`)
   - Note : ce check n'apparaîtra dans la liste de sélection qu'après
     le **premier run réussi** du workflow. Au pire, sauvegarder la règle
     sans status checks, attendre le premier run vert, puis revenir éditer.
6. Décocher **Allow force pushes** et **Allow deletions**.
7. Sauvegarder.

---

## Validation post-activation

| Test | Comportement attendu |
|---|---|
| `git push origin main` directement (commit local sans PR) | ✅ Doit passer (PR non requise) |
| `git push --force origin main` | ❌ Doit être rejeté |
| `git push origin :main` (delete) | ❌ Doit être rejeté |
| Push d'un commit qui casse les tests | ❌ CI passe en rouge ; les PR vers main seront bloquées |
| Merge d'une PR avec tests rouges | ❌ Bouton « Merge » désactivé |

---

## Statut OpenSSF Scorecard concerné

> Les gains `Branch-Protection` ci-dessous supposent la protection **active**
> (dépôt public ou GitHub Pro). Suspendus depuis la privatisation — voir
> l'encadré de statut en tête.

- `Branch-Protection` : 0 → 9/10 (sans signed commits) ou 10/10 (avec signed
  commits) **si** la protection est réactivée.
- `Code-Review` : reste à 0 (solo dev assume cette absence).
- `CI-Tests` : 0 → 10/10 dès que `tests.yml` tourne sur les PR (actif).
- `SAST` : **retombé à 0** — `codeql.yml` retiré le 26 juin (Advanced Security
  indisponible sur dépôt privé gratuit).

---

**Fin du document.** Mettre à jour si les workflows CI changent (renommage de
job, nouveaux checks à exiger).
