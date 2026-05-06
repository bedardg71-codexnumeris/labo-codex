# Hook pré-commit Labo Codex

> Implémentation de la Défense J du modèle de menaces (cf. `MODELE-MENACES.md` §C-01, §8.1).

## Ce que fait le hook

Pour chaque commit, scanne les ajouts (`+` du diff) sur les fichiers `.js` et `.html` :

1. **innerHTML avec interpolation sans `echapperHtml`** — **BLOQUANT**.
   Détecte `.innerHTML = ` ou `.innerHTML += ` qui contient une interpolation (`${...}`, `' + ...`, `" + ...`) et où `echapperHtml` n'apparaît pas sur la même ligne. Bloque le commit.

2. **Écriture sur clé sensible sans `assainirObjet` à proximité** — **WARNING**.
   Détecte `db.set`, `db.setSync`, `localStorage.setItem` sur les 6 bibliothèques partagées, les `cartouches_*`, ou les clés identifiantes (`groupeEtudiants`, `journal`, `enseignants`, `infoCours`, `grillesTemplates`, `echellesTemplates`, `pratiquesConfigurables`, `productions`). Avertit mais laisse passer.

## Installation

Une fois par clone du repo :

```bash
./scripts/install-hooks.sh
```

Cela configure `core.hooksPath` sur `scripts/hooks/`. Pas de copie, pas de duplication — les mises à jour du hook source s'appliquent directement.

## Bypass légitime

Si une ligne signalée est sûre malgré tout (ex. `innerHTML` avec contenu statique, ou `db.set` sur donnée déjà assainie en amont), ajouter un commentaire **`// security-ok: <raison>`** sur la même ligne ou une ligne adjacente :

```javascript
container.innerHTML = '<div class="static">' + valeur + '</div>'; // security-ok: valeur vient de cle() interne, pas d'input externe
```

La raison est conservée dans le diff git et peut être auditée plus tard via :

```bash
grep -rn "security-ok:" js/ index.html
```

## Bypass total (déconseillé)

`git commit --no-verify` désactive tous les hooks. **CLAUDE.md interdit cette pratique** sauf circonstance exceptionnelle (ex. correction urgente d'un hook lui-même cassé). À justifier par écrit dans le message de commit.

## Désinstallation

```bash
git config --unset core.hooksPath
```

## Limites connues

- **Faux négatif** : un `innerHTML` indirect via une variable templating ne sera pas détecté. Le hook attrape l'interpolation littérale, pas les patterns plus subtils.
- **Faux positif** : un `innerHTML` avec contenu statique entrelacé d'une concaténation peut être signalé. Bypass via `// security-ok:` documenté.
- **Pas de défense en profondeur** : un attaquant qui modifie le hook lui-même peut désactiver la protection. Le hook n'est qu'un garde-fou contre les régressions involontaires (cf. profil C dans le modèle de menaces).
- **Périmètre fichiers** : seuls les `.js` et `.html` sont scannés. Les autres extensions (CSS, MD, etc.) ne sont pas analysées.

## Maintenance

Le hook source vit dans `scripts/hooks/pre-commit` (versionné). Toute modification se fait dans ce fichier — la prochaine commande git utilise automatiquement la nouvelle version.

Pour étendre le périmètre des clés sensibles : modifier les variables `CLES_SENSIBLES_LITTERAL` et `CLES_SENSIBLES_CONSTANTES` en haut du script.
