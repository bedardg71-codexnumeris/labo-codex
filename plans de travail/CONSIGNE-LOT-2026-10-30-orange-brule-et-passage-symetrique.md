# Consigne – L'orange brûlé pour la zone sous le seuil, et le passage symétrique à la cassure

> Cowork, vendredi 30 octobre 2026, 22 h 30 (Toronto), sur `main` = `262c18bd` (le lot des barres, accepté : `VERDICT-RELECTURE-2026-10-30-barres-apercu.md`, à commiter d'abord). Décisions de Grégoire : 22 h 29 (« ok pour le passage symétrique » ; « retirer le rouge actuel, trop associé au danger […] un orange brûlé, comme dans les barres originales ») et 22 h 30 (« oui, partout. Attention au mode sombre. »).

## 1. Le passage symétrique, à la cassure seulement

En mode « deux segments », au seuil de la cassure, le passage se calcule en largeur d'écran : même largeur de part et d'autre du seuil (celle qu'il a à droite aujourd'hui, ou la moitié de la plus étroite des deux zones à l'écran), la couleur exacte restant au seuil (`couleurAuSeuil`). Les autres seuils et le mode proportionnel ne changent pas. Garde : la largeur à l'écran des deux demi-passages est égale à la cassure.

## 2. L'orange brûlé, partout où la couleur marque la zone sous le seuil (`bas`)

- Où : les barres de l'Aperçu (`COULEUR_BANDE.bas`, `js/contexte-qualification.js:288`), le texte de A, C et P dans la liste (`COULEUR_LISTE.bas`, `:287`), les pastilles (`.prioritaire-indice-critique`, `styles.css:13204` et sa variante `.mode-clair` vers 26103), et tout autre lecteur de la zone `bas` (grep). **Pas** les badges du niveau RàI (`badge-rai-3`) : décision de Grégoire, inchangés.
- Teinte : un orange brûlé (point de départ : `#CC5500` pour les barres ; l'orange des barres d'origine était `#ff8c00`). Le texte de la liste et les pastilles prennent la valeur qui tient le contraste dans chaque mode.
- **Mode sombre** (Grégoire : « Attention au mode sombre ») : le texte en orange brûlé sur le fond sombre doit tenir 4,5:1 (`#CC5500` sur `#13262f` n'y arrive pas, à mesurer) ; une variante plus claire en sombre, une plus foncée en clair si besoin. Mesure les rapports de contraste et écris-les au rapport.
- **Distinction avec le jaune** : l'orange brûlé est plus proche du jaune « signalé » (`#ca8a04` dans la liste, `#ffc107` dans les barres) que ne l'était le rouge. Vérifie qu'ils restent distincts dans la liste et les pastilles, dans les deux modes, y compris en simulation de daltonisme (protanopie, deutéranopie). S'ils se confondent, propose un ajustement du jaune plutôt qu'un retour au rouge.
- `design-system.html` suit (source de vérité des couleurs). Le mélange au seuil (`couleurAuSeuil`) suit la nouvelle couleur.
- Les gardes qui nomment `#dc2626` ou `#dc3545` pour la zone basse suivent, chacune avec la décision nommée.

## 3. Inscrire

Aperçu, sous la barre P : « 1 étudiant·e en Développement montrent une progression favorable et pourraient… » (accord au singulier faux, visible) : issue 2.

## 4. Fin

Commit, Vitest entier, specs WebKit touchées ; pas de release. Captures Chrome (Mac), **clair et sombre** : l'Aperçu (deux axes), la liste, une pastille. Les mots du réglage restent à valider (rapport des barres). Relecture de Cowork.
