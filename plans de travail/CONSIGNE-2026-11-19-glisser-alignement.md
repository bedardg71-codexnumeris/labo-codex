# Consigne — #1295, le glisser d'Alignement (19 nov. 2026)

**Branche** : `lot/glisser-alignement`, partie de `origin/main` `ade09e939` (relais de la 1.250.0).
**Arbre** : `../labo-codex-glisser-alignement` (l'arbre principal porte `lot/gel-etape-7`).
**Issue** : branche et PR « APERÇU, ne pas fusionner ». Ni fusion ni release (fenêtre du lundi 23 novembre).
**Rapport** : `plans de travail/RAPPORT-2026-11-19-glisser-alignement.md`.

## Ce qui est mesuré avant le lot

Par la session de la 1.250.0 (`ee414b70f`, BACKLOG #1295) : `parcours-5-monter-ton-cours` « les sept
étapes… (1180 px) », ligne 334, est rouge 5 sur 5 sur `8449f25cc` (1.249.0) et vert 6 sur 6 sur
`1661ade8c` (1.244.0). Le pilote du parcours n'est pas en cause : dans `js/planification-carte.js`,
`throttleRAF` garde le premier `pointermove` de chaque image et jette les suivants, et le relâchement
ne relit pas sa propre position. L'activité s'arrête 34 px sous la leçon.

## Les sept points

1. Cette consigne, puis la branche.
2. **Dater la régression** par bissection entre `1661ade8c` (vert) et `8449f25cc` (rouge), sur le banc
   parcours-5 en WebKit (sa plateforme d'échec), `--retries=0`. Nommer le commit et la version qui
   l'ont mise en ligne.
3. **Corriger au relâchement** : la cible se calcule d'après la position du relâchement lui-même, ou
   du dernier mouvement reçu, jamais du dernier retenu. Passer en revue tous les usages de
   `throttleRAF` qui se terminent par un lâcher (feuille, conteneur, groupe, libre, poignée de taille,
   lasso) et le Planificateur (`deposerDansGrille`), à la souris et au doigt.
4. **Source ou stock** : un lâcher raté a-t-il pu écrire quelque chose de faux chez les gens ? Si oui,
   le mesurer et le dire, sans rien réparer.
5. **Un banc** qui glisse à mouvements rapprochés (comme Playwright par défaut) et vérifie que
   l'activité entre dans la leçon. Break-test : rouge sans la correction. parcours-5 repasse au vert
   et sort des échecs connus (`scripts/playwright-baseline.json`). Vitest complet ; Chromium en
   portrait et en paysage ; WebKit au verdict de la release.
6. **Une ligne de Nouvelles** proposée, en mots d'enseignant·e (pas écrite dans `changelog-data.js`).
7. Branche poussée, PR d'aperçu, rapport.

## Critère de fin

PR ouverte, rapport déposé, parcours-5 vert seul en WebKit, banc neuf rouge sans le correctif et vert
avec, Vitest complet vert.
