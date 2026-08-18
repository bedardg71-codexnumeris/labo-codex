# PORTES TERRAIN — Passe WebKit des specs Playwright (#456 + #418) — CLOSE

> **Cycle** : 1.87.4 → 1.87.5 (18 août 2026, session cloud « backlog »)
> **Artefact interactif** : <https://claude.ai/code/artifact/2ccba225-4893-4502-be58-557b812d6331>
> **État** : ✅ **CLOSE le 18 août 2026 — quatre passes, 9/9 en WebKit,
> baseline à 0, #456 fermé.** Plus aucune rangée due.

---

## Le bilan des quatre passes (toutes le 18 août, relevés Grégoire)

| Passe | Bilan WebKit | Ce qu'elle a tranché |
|---|---|---|
| 1ʳᵉ | 91 ✓ / 2 ✗ (3,7 min) | 4 réparations tiennent ; Alt/⌥ ne tient pas (le « 5 des 6 » surestimait) ; aimantation mesurée 426 → repos 300 ms ; baseline 6 → 2 |
| 2ᵉ | 7 ✓ / 2 ✗ (57,7 s) + suite complète stable | SONDE : Alt/⌥ = modificateur ⌥ non transporté (pas un bug d'app) → réécriture PointerEvent ; aimantation 400 → diagnostic embarqué |
| 3ᵉ | 8 ✓ / 1 ✗ (55 s) | Alt/⌥ VERTE (la réécriture tient) ; diagnostic : 433 = un pas de souris manquant, zéro guide → WebKit avale le dernier `pointermove` d'un trajet groupé → trajet pas à pas, final doublé, assertion sur l'invariant |
| 4ᵉ | **9 ✓ / 0 ✗ (54,1 s)** | **Tout est vert. #456 clos.** |

**Les six rouges du 12 août étaient toutes des dérives de test ou des défauts
de harnais — zéro bug d'application** : badge #366 retiré qu'une spec
attendait, API `mettreAJourSommaire` renommée, fixture au format d'avant
#367, prise de drag sur le menu de type 1.86, modificateur ⌥ non transporté
par Playwright-WebKit, dernier `pointermove` d'un trajet groupé avalé par
WebKit headless.

## La baseline est à 0

Transcription composée de deux mesures : le **9/9 de la 4ᵉ passe** sur les
deux dernières specs, et la **passe complète `--ecrire` de la 2ᵉ passe**
(diff vide sur 87 tests) — aucun autre fichier de test n'a changé entre les
deux. Le garde-fou de push redevient strict sur TOUTE rougeur.
⚠ La sentinelle lancée en conteneur répond « WebKit introuvable » et
n'écrit rien (fail-open déclaré — vérifié le 18 août) : toute régénération
future se fait sur le Mac, et c'est elle qui fait foi. Si le Mac relance
`--ecrire`, le résultat attendu est identique (0).

## Notes de relevé (pour la méthode)

- 3ᵉ passe : la coche ✗ de la porte 2.10 contredisait la mesure jointe
  (Alt/⌥ absente des échecs) — **la mesure fait foi**, pas la coche.
- 4ᵉ passe : le bilan a été saisi dans le champ 2.13m au lieu de 2.12m —
  sans conséquence, les données y étaient.
- Deux prédictions de vert sont tombées (1ʳᵉ et 2ᵉ passes), chaque fois sur
  la foi du seul moteur du conteneur. Leçon écrite dans
  `tests/playwright.chromium.config.js` : **un vert Chromium est un indice,
  jamais un verdict Safari.**

## Ce qui reste vrai après la clôture

- Le hook de push (sentinelle `verifier-playwright.mjs`) tourne sur le Mac ;
  les conteneurs fail-open en le disant.
- La config Chromium versionnée donne aux sessions cloud un moteur de
  **reproduction ciblée** (un fichier à la fois — la suite entière y rougit
  sur les motifs d'erreurs console rédigés pour WebKit).
- #418 (livré en 1.87.5) garde son angle mort documenté : éprouvé au banc,
  pas sur un vrai Safari en navigation privée.
