# Demande de relecture – la fiche de production après « Préparer le PDF » (#1127)

> Claude Code, mardi 20 octobre 2026, vers 17 h 20 (Toronto). Consigne : `CONSIGNE-LOT-2026-10-20-fiche-production-apres-pdf.md`. Pour Cowork (`PROTOCOLE.md`, règle 2).
> Un commit sur `main`, **non poussé**, sans numéro de version. **Pas de verdict complet** : il tourne ce soir, au signal de Grégoire.

## Ce que le commit change

| Quoi | Où | Comment le vérifier |
|---|---|---|
| La zone n'est plus détruite | `js/export-pdf.js`, `afficherFormulairePDFInline` / `fermerFormulairePDFInline` | Les enfants de `.zone-principale` reçoivent `prep-pdf-recouvert` ; le formulaire est posé (`prepend`) dans un conteneur à lui, retiré à la fermeture. `git grep -n "_contenuPrecedentPDF\|_zonePrincipalePDF"` ne rend rien : l'ancien chemin est retiré, pas doublé. |
| Une classe à part, pas `u-hide` | `styles.css`, section « Formulaire préparation PDF » | La fiche pose et retire ses propres `u-hide` (accueil, `#formulaireProduction`) : la fermeture ne retire que ce qu'elle a posé. |
| Jetons anticache | `index.html` | `export-pdf.js?v=20261020a`, `styles.css?v=20261020d`, exigés par le hook pre-commit (#547). |
| Le banc | `tests/integration/fiche-production-apres-pdf.spec.js` | (a) « Annuler », (b) « Voir l'aperçu » puis le retour : la fiche montre la grille choisie, la grille puis un champ texte changés ensuite s'écrivent en base, et survivent au rechargement. |
| Le bug inscrit | `Retours des testeurs/SUIVI-BUGS.md` (#1127, aux corrigés), `BACKLOG.md` (dernier ID) | Cause, correctif, stock assumé. |

## Preuves

- **Banc WebKit** : 2 sur 2 verts, sans `waitForTimeout` ni `page.click` (§4.1 bis : attentes sur l'élément ou la base). **Break-test** sur la version finale du banc : `js/export-pdf.js` de `HEAD` remis → 2 rouges (« la fiche montre la grille choisie ») ; code restauré → vert.
- **Stabilité** : `--repeat-each=5` trois fois sur la version finale, puis une : **39 passages sur 40**. Le seul échec a bloqué environ 2 minutes, sans trace capturée, et ne s'est pas reproduit en 30 passages. Non expliqué. La forme ressemble aux dépassements de délai isolés de #534 : c'est une hypothèse, pas une mesure.
- **L'hypothèse de la consigne, mesurée** : sur l'ancien code, assertion d'affichage retirée, le banc tombe sur « la grille changée après le retour s'écrit » ; le premier choix, lui, s'écrit (assertion de `choisirPuisPreparer` verte). Le premier choix de 16 h 51 min 29 s est donc probablement en base chez Grégoire, les suivants non.
- **Vitest complet** : 789 fichiers, 9 278 sur 9 278 verts.
- **Specs voisines en WebKit** (Productions, aucune autre ne touche le PDF inline) : `lot-e3-creer-ou-modifier`, `nouvelle-fiche-apres-exemple-deverrouillee`, `production-selects-echelle-cartouche`, `diagnostique-1055-lu-autrement` et le banc neuf : 26 sur 26.

## Les trouvailles et leur issue

- **`js/modal-soutien.js`** : **périmé**. Il ne garde rien en `innerHTML` pour le remettre : il crée un conteneur neuf (l. 106-108) et l'ajoute au `body`. Mesuré aussi dans tout `js/` : `export-pdf.js` était le seul à sauvegarder puis remettre une zone (`codex.js:4318` garde le libellé d'un bouton, sans formulaire).
- **Le formulaire de préparation ne reprend pas la grille de la production** (seulement son identifiant) : le banc (b) doit la choisir. Comportement existant, sans symptôme vécu : **commenté dans le banc, rien d'inscrit**.
- **Le stock** : rien à réparer. Une modification faite sur une fiche reconstruite n'a jamais été écrite.

## Ce que je suppose

- Que la production de Grégoire n'avait pas d'échelle : c'est le seul chemin, depuis Productions, qui ouvre le formulaire plutôt que l'aperçu (#513). Cohérent avec « le formulaire exige une échelle ».
- `plans de travail/PLAN-2026-10-19-bareme.md` porte deux lignes modifiées qui ne sont pas de moi (décision du 20 oct., 16 h 58) : **hors du commit**, laissées dans l'arbre.

## Ce que je demande de regarder

1. Le choix d'une classe à part plutôt que `u-hide` pour recouvrir la zone.
2. Le cas où l'on navigue ailleurs pendant que le formulaire est ouvert : il reste dans l'ancienne zone, recouvrant sa fiche, jusqu'à la prochaine ouverture (qui ferme d'abord) ou « Annuler ». Avant, il y restait aussi, la fiche détruite en plus.
