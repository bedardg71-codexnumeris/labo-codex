# Demande de relecture – « Apporter mon matériel », lot 1

> Claude Code, 16 octobre 2026, vers 14 h 45 (Toronto). Consigne : `CONSIGNE-LOT-2026-10-16-apporter-mon-materiel-1.md`. Pour Cowork (`PROTOCOLE.md`, règle 2).
> **Un commit local, non poussé : `d50af0ff`**, sur `eb6dd86e`. Aucun push, aucune release, aucun verdict Playwright avant le signal du soir.

## État mesuré

- Vitest complet, depuis `tests/` : 764 fichiers, 8 961 essais, tous verts (avant le lot : 8 917).
- Banc neuf `tests/unit/materiel-lot1-lecture.test.js` : 40 essais. **21 mutations du code, 21 rouges** (chaque défense cassée fait rougir l'essai qui la garde). Une mutation restait verte au premier passage : l'échappement des CASES de l'aperçu (mes charges piégées étaient dans l'en-tête et les noms) ; l'essai S.b a reçu une case piégée, il rougit maintenant.
- Spec Playwright `tests/integration/materiel-lot1-onglet.spec.js` : écrite, **non lancée**.

## Ce que le commit fait

| Fichier | Ce qui change |
|---|---|
| `js/config.js` (zone protégée) | `{ id: 'materiel', label: 'Apporter mon matériel' }` en tête de `conception`, autorisation du 15 oct. citée en commentaire. `noms_stables.json` protège le nom de la constante (ligne 32, inchangée), pas les libellés. |
| `index.html` | Sous-section `conception-materiel` avant `conception-carte` (accueil statique, textes du prototype) ; deux scripts ; jetons `?v=20261015b` (convention entre deux releases : jour du build en cours, lettre suivante). |
| `js/materiel-lecture.js` (neuf) | Les fonctions pures : `lireHtml`, `lireTexte`, `lirePressePapiers`, `interpreter`, `inverser`, `transposer`, `coder`, `partsEgales`, `proposerNature`, `plagesContigues`, `charger`, `modeleVide`, `exempleHtml`. |
| `js/materiel.js` (neuf) | Le collage, les trois boutons (`data-action`), l'aperçu (`apercuHtml`, tout texte échappé). Rien n'est écrit en base. |
| `js/partage-schemas.js`, `js/partage-validation.js` | `criteres[].descripteurs` déclaré ; `maxCles`, nouveau dans le mini-langage (`dictionnaire-chaines`) ; `validerDictionnaire` extraite de `validerValeur` pour ne pas monter en complexité. |
| `js/import-export.js` | `descripteurs` au schéma d'import ; `rebrancherReferences` apprend le type `grille`. |
| `styles.css` | Le bloc `.materiel-*`, variables seulement. |
| `tests/package.json` | `jsdom@25.0.1` en dépendance de développement des bancs. |

## Ce que j'ai décidé seul – à vérifier

1. **`jsdom` entre dans les bancs.** Vitest tourne en environnement `node`, sans analyseur HTML : sans lui, le « HTML de type Word » de la consigne ne pouvait pas être lu par un vrai `DOMParser`. L'application reste sans dépendance. Ce que jsdom ne prouve pas (un script collé ne s'exécute pas) est porté par la spec Playwright, dans WebKit.
2. **`inverser` transpose les rangées LUES, pas le modèle** (écart au prototype). Une grille aux niveaux en lignes porte ses plages dans la 1re colonne et sa pondération dans une ligne : relues dans le bon sens, elles sont reprises. Ce qui ne se relit pas retombe comme le dit la consigne (parts égales, plages à remplir). Deux inversions rendent la lecture d'origine (essai I.r).
3. **Un cinquième état, `vide`**, pour une case de descripteur vide : facultative, elle n'est pas « à remplir ». Et `propose` pour la nature des cases (le prototype disait « proposé »).
4. **Le tutoiement** reconnaît l'élision (« t'es », « t'appuyer ») et « te » : le motif du prototype exigeait une frontière après « t' » et ne la reconnaissait jamais.
5. **La lecture garde tout texte hors du tableau** (un `<span>` nu, un texte posé dans `<body>`, la légende `<caption>`), pas seulement les `<p>`, `<h…>`, `<li>` du prototype.
6. **Une ligne d'en-tête à cases fusionnées** affiche un avertissement dans l'aperçu (« les niveaux pourraient être mal reconnus »). Texte provisoire, de moi.
7. **« Taper ma grille à la main »** affiche, à ce lot, l'aperçu d'une grille vide de 3 critères × 4 niveaux (tout « à remplir ») : la saisie vient avec l'assistant, au lot 2.
8. **Les cases de l'aperçu montrent leur texte entier** (le prototype le coupait à trois lignes) : rien de caché derrière un survol. Au lot 2, l'aperçu restant visible à chaque étape, la coupe pourra revenir.
9. **Bornes** : 5 000 caractères par descripteur (comme les commentaires de cartouche), 20 niveaux au plus au partage ; l'import, lui, tronque à 5 000 sans borner le nombre de clés.

## Ce qui reste ouvert, et son issue

- **L'info-bulle du bouton n'est pas posée.** Elle demande une ligne dans `TOOLTIPS_SOUS_NAV` de `js/navigation.js`, zone protégée que l'autorisation du 15 oct. ne nomme pas. Question posée à Grégoire. *Issue : en attente de sa réponse.*
- **`descripteurs.echelleId` ne suit son échelle qu'au partage.** L'import complet ou sélectif et la réouverture d'archive traitent les grilles avant les échelles ; une échelle n'y change d'id que sur collision. Un descripteur qui perd son échelle ne s'affiche pas, rien ne se corrompt. *Issue : commenté dans le code (`rebrancherReferences`) ; à reprendre si le lot 3 affiche les descripteurs à l'évaluation.*
- **Une pondération en points** (colonne « /20 », valeurs 8, 6, 6) est reprise telle quelle : le total ne fait pas 100. *Issue : pour l'assistant du lot 2, qui avertit du total.*
- **Navigation** : mesuré, rien ne suppose que Conception s'ouvre sur la Carte (les liens de l'accueil et `ouvrirReglagesPratique` nomment leur sous-section ; les specs aussi). Effet de bord assumé : la Carte ne s'initialise plus à l'ouverture de Conception, seulement quand on l'affiche.

## À regarder en priorité

- `lireHtml` et `textesHorsTableau` (`js/materiel-lecture.js`) : ce qui sort du document collé.
- `apercuHtml` (`js/materiel.js`) : chaque interpolation.
- La couture du schéma (`partage-schemas.js`, `import-export.js`) et l'essai T.g (une grille sans descripteurs ressort à l'octet près).
