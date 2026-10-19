# Consigne – rendre la vérification complète à GitHub, maintenant que le dépôt est public

> Écrite par Cowork le 16 octobre 2026 à 14 h 21 (Toronto, mesuré par `date`). Demande de Grégoire à 14 h 20 : retrouver ce que GitHub lui permettait (lancer et suivre la vérification, jusque depuis son téléphone), et libérer son Mac le soir.
> Skills : `verification-adverse`, `release-et-changelog` (seulement pour savoir ce qui ne s'y touche pas).

## Ce qui a changé ce matin, et pourquoi c'est le moment

- Le dépôt `labo-codex` est public depuis le 16 vers 14 h 10. Pour un dépôt public, les machines Linux standard de GitHub ont 4 processeurs et 16 Go (au lieu de 2 et 7) et les minutes sont gratuites (billet de GitHub du 17 janvier 2024, « GitHub-hosted runners: Double the power for open source » ; documentation « Supported runners and hardware resources »). À remesurer : c'est une source, pas une mesure.
- L'objection du 4 septembre aux shards (« ils raccourcissent l'attente, pas la facture ») tombe : il n'y a plus de facture.
- Mesuré par Cowork dans `.github/workflows/tests.yml` : Playwright ne part que par `workflow_dispatch`, en un seul job, `timeout-minutes: 60` ; depuis le 10 octobre, plus de `schedule`. Le poussé d'aujourd'hui (eb6dd86e) a rendu Vitest vert et sauté Playwright.

## Le mandat

1. **Mesure d'abord, sans rien changer** : lance `gh workflow run tests.yml` sur `main` tel quel ; rapporte la durée du job Playwright sur la machine à 4 processeurs, son verdict, et le nombre d'essais de `EXCLUS_WEBKIT_LINUX`.
2. **Découpe Playwright en morceaux parallèles** (`matrix` de shards) ; le nombre de morceaux et de workers est ton choix technique, d'après la mesure. Un job final rassemble les rapports et juge contre `scripts/playwright-baseline.json`, comme le Mac : seule une rougeur NOUVELLE fait échouer.
3. **Déclencheurs** : garder `workflow_dispatch`, pour que Grégoire puisse lancer la vérification depuis l'application GitHub de son téléphone (Actions ▸ Tests ▸ Run workflow) ; ajouter le push sur `main` quand le lot touche un fichier observable (motif `OBSERVABLE`, déjà partagé avec le crochet). Pas de `schedule` : le cron partait en retard, et le push suffit (décision technique de Cowork).
4. **Ne touche ni au crochet pré-push ni au rituel du soir** dans ce lot. La règle « le verdict du Mac avant chaque push » est une décision de Grégoire (10 octobre) : ce lot prépare de quoi la revoir, il ne la change pas.
5. **La comparaison** : ce soir, le verdict du Mac tourne comme d'habitude ; relance la suite sur GitHub sur le même commit ; compare la durée et la liste des rouges. Rapporte, en gestes, si GitHub peut tenir lieu de verdict du soir (le Mac restant pour ce qui ne se juge que dans Safari), avec ta recommandation. La décision revient à Grégoire.

## La méthode

- Fichiers : `.github/workflows/tests.yml`, et au besoin `tests/playwright.config.js` et `scripts/`. **Rien dans `js/` ni `index.html`** : une autre session y travaille (« Apporter mon matériel »).
- Commit, Vitest, demande de relecture `plans de travail/DEMANDE-RELECTURE-2026-10-16-verdict-sur-github.md` ; poussé après la relecture de Cowork. Avant de pousser, fusionne `origin/main` (fusion, pas rebase) si l'autre session a poussé entre-temps.
- Hors lot, à inscrire sans agir : la demande de fusion Dependabot de Vitest qui échoue.
