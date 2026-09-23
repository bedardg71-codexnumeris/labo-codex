# Consigne du jour – Lot N7 : le niveau de la note globale se lit dans une seule règle, celle des évaluations

> Écrite le 22 septembre 2026, soir, par Cowork ; **remesurée et lancée le 23 septembre 2026, 7 h 45 (Toronto), sur `origin/main` = `73445a4c`** (1.155.2, en production chez Netlify depuis 7 h 26, déploiement mesuré). **Proposée** tant que Grégoire ne l'a pas relayée.
> La précédente (lot N2, #716, livrée en 1.155.2) est archivée sous `plans de travail/_ancienne-CONSIGNE-DU-JOUR-2026-09-22-lot-n2-p-historique.md` ; l'ancien fichier `CONSIGNE-N7-echelle-note-globale.md` est devenu celui-ci (déplacés par Cowork, à commiter avec ce lot).
> Pas de fiche au backlog : c'est le constat de didactique laissé par N1a (`RELAIS.md` ≈ l. 145), sorti de N2 par Cowork le 22 sept. et tranché par Grégoire le même soir. Il bloque le retrait de la seconde instance (zéro-dette), d'où le lot.

## 0 · La décision de Grégoire (22 sept. 2026, soir) – elle fait foi

Question posée par Cowork : pour une pratique Standards, dans quelle échelle se lit le niveau de la note globale ? A, l'échelle des évaluations de l'élève (règle actuelle, #575, sa règle du 27 août) ; B, l'échelle rangée dans la pratique. **Réponse : A.**

Et le principe qu'il a posé en répondant, qui vaut pour tout le lot et au-delà : **« L'échelle IDME est ma pratique personnelle. On ne peut l'imposer à aucun utilisateur. Il faut toujours prendre les grilles, échelles, cartouches, etc. créés par l'utilisateur. »** Aucune échelle, aucun code de niveau, aucune borne ne s'écrit en dur ; aucun repli sur une échelle « par défaut ».

## 1 · Ce que Cowork a mesuré (lecture seule) – remesuré sur `73445a4c`, après N2

- **Un seul lecteur à l'écran** : `lireNiveauNoteGlobale` (`js/profil-etudiant-helpers.js:638`), appelé par le profil (`profil-etudiant-sections-affichage.js` ≈ l. 1120 et ≈ l. 4101). Il demande `obtenirPratiqueActuelle().obtenirEchelleNoteGlobale(da)`.
- **Deux réponses dans le code, une seule sert** :
  - l'instance du **registre** `PratiquePANStandards.obtenirEchelleNoteGlobale(da)` (`pratique-pan-standards.js:1152`) rend `obtenirEchelleCommuneDesEvaluations(da)` : **règle A**. C'est elle que `obtenirPratiqueActuelle` rend pour une Standards depuis N1a ;
  - `PratiqueConfigurable.obtenirEchelleNoteGlobale()` (`pratique-configurable.js:115`) rend `this.config.echelle` : **règle B**, dormante pour une Standards, mais c'est celle qu'on obtiendrait en réunissant les instances. N1a l'a mesuré (essai E3) : le « M » d'une échelle remplacée (#648) disparaissait.
- **Les autres familles** : la sommative (registre, `pratique-sommative.js:83`) rend « aucune échelle, c'est une note » ; les spécifications du registre n'ont **pas** de `obtenirEchelleNoteGlobale` (raison `pratique-sans-methode`) ; la dénotation passe par la configurable (règle « config.echelle si elle a des niveaux »).
- **Appelants de `obtenirPratiqueActuelle`, remesurés après N2** (`git grep` sur `73445a4c`) : il n'en reste **qu'un vivant**, `lireNiveauNoteGlobale` (`profil-etudiant-helpers.js:639`). N2 a retiré celui de `snapshots.js` (le P historique) ; `snapshots.js:514-515` est dans un bloc commenté (« DÉSACTIVÉ TEMPORAIREMENT ») ; `calculerProgressionEleve` (`profil-etudiant-calculs.js:1496`) déclare `const pratique = obtenirPratiqueActuelle();` et ne s'en sert nulle part (mesuré : aucune autre occurrence de `pratique` comme variable dans la fonction). Méthodes « obtenirEchelleNoteGlobale » : `pratique-pan-standards.js:1152` (les numéros ont bougé avec N2), `pratique-configurable.js:115`, `pratique-sommative.js:83`. Bancs : `sentinelle-542-repli-pratique-actuelle`, `sentinelle-575-niveau-note-globale-une-seule-regle`, `audit-pratique-de-notation-2026-09-05` (E5 et ≈ l. 499), `refactor-profil-etudiant` (liste d'exports), et deux bancs qui la simulent encore (`sentinelle-745`, `sentinelle-lot-D`, stubs `calculerPerformanceHistorique` devenus sans objet).
- ⮕ **Conséquence pour 2d** : la seconde instance n'a plus qu'une raison d'être, ce niveau. Le retrait est donc attendu, pas seulement possible.

## 2 · Ce que fait le lot

**2a. La règle A s'écrit une fois.** Pour une Standards, le niveau de la note globale se lit dans `obtenirEchelleCommuneDesEvaluations(da)` – l'échelle créée par l'utilisateur et portée par ses évaluations. Si elles ne s'accordent pas, aucun niveau et la cause nommée, comme aujourd'hui. L'endroit où la règle vit relève de toi ; elle ne doit exister qu'à un endroit.

**2b. La règle B disparaît pour une Standards.** Aucun chemin ne doit pouvoir lire le niveau de la note globale d'une Standards dans `config.echelle`. Si la configurable garde sa méthode pour la dénotation, elle ne répond pas pour une Standards (ou délègue à la règle A) : décide, et dis-le.

**2c. Les autres familles ne bougent pas à l'écran.** Sommative : aucune échelle. Dénotation : comportement actuel. **Spécifications** : aujourd'hui « pratique sans méthode », donc aucun niveau affiché ; ne lui en donne pas un en passant (ce serait une décision de didactique). Un essai le fige.

**2d. La seconde instance part.** Remesuré : après N2, `obtenirPratiqueActuelle` n'a plus pour raison d'être que ce niveau, elle est remplacée par la résolution unique (`designerPratiqueActive` / `resoudrePratiqueActive`), et les méthodes du registre que plus rien n'appelle partent avec (zéro-dette). Les bancs qui la simulent (`sentinelle-734`, `745`, `lot-D`) suivent. Si elle sert encore ailleurs, dis où et garde-la.

**2e. Le principe de Grégoire, vérifié.** Balaye ce que ce lot touche : aucune borne ni code de niveau en dur (`'I'`, `'D'`, `'M'`, `'E'`, 40 / 65 / 75 / 85 / 100) ne doit subsister dans les chemins qui lisent le niveau de la note globale. Ce que tu trouves **hors** de ces chemins : inscris-le (issue 2), ne le corrige pas.

## 3 · Arrêt prévu

Si un écran change de niveau affiché pour un élève des données d'essai (lettre différente, lettre qui apparaît ou disparaît), **arrête-toi et dis lequel** : le lot ne doit rien changer à l'écran.

## 4 · Tests

- Standards, évaluations dans une même échelle créée par l'utilisateur (pas IDME : une échelle d'essai aux codes et bornes inventés) : le niveau est lu dans cette échelle.
- Standards dont la pratique porte une échelle B **différente** de celle des évaluations (le cas #648) : le niveau vient des évaluations, jamais de B.
- Standards, évaluations dans deux échelles : aucun niveau, cause nommée.
- Sommative, spécifications, dénotation : niveau inchangé par rapport à `main` d'avant le lot.
- Sentinelle : aucun chemin de lecture du niveau global d'une Standards ne passe par `config.echelle`.
- Break-test sur chaque assertion ; suite Vitest complète verte.

## 5 · Livraison

- Aucun mot neuf à l'écran attendu. Version **patch** si du code applicatif change ; sinon build seul.
- Item de « Nouvelles » : probablement aucun (rien ne change à l'écran). S'il en faut un, proposé, à valider par Grégoire.
- Commit, relecture de Cowork, corrections, verdict, push.
