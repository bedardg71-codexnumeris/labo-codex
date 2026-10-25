import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { tranche } from './_helpers/tranche.js';

// SENTINELLE — #386 (audit qualité 5 août 2026, rapports A5+B9+D2, 🟡) —
// Lot échappement/coercition : des données utilisateur ou importées étaient
// injectées BRUTES dans innerHTML (métadonnées du fichier importé dans la
// modale config complète, libellés des dropdowns trimestre-v2, titre de nœud
// planification sur 3 chemins, noms dans la bibliothèque d'alignements) et
// dans des attributs value= (semaineDebut/Fin, symétriques au fix meta.duree).
// Règle CLAUDE.md non négociable : echapperHtml() sur toute donnée injectée.
// CSP bloque le script inline, PAS l'injection de balises.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const lire = (f) => readFileSync(path.join(racineProjet, 'js', f), 'utf8');

const importExport = lire('import-export.js');
const tv2 = lire('trimestre-v2.js');
const tv2liste = lire('trimestre-v2-liste.js');
const tv2orch = lire('trimestre-v2-orchestre.js');
const tv2gc = lire('trimestre-v2-groupes-cours.js');
const carte = lire('planification-carte.js');
const biblio = lire('planification-bibliotheque.js');

describe('#386 · modale « configuration complète » : métadonnées du fichier échappées', () => {
    it('meta.nom / meta.auteur / meta.description passent par echapperHtml', () => {
        expect(importExport).toMatch(/\$\{echapperHtml\(meta\.nom \|\| ''\)\}/);
        expect(importExport).toMatch(/\$\{echapperHtml\(meta\.auteur \|\| ''\)\}/);
        expect(importExport).toMatch(/\$\{echapperHtml\(meta\.description\)\}/);
    });

    it('meta.discipline est gardée par Array.isArray (string → plus de TypeError avalé)', () => {
        expect(importExport).toMatch(/Array\.isArray\(meta\.discipline\)/);
    });

    it('ne réintroduit aucune injection brute des métadonnées', () => {
        expect(importExport).not.toMatch(/\$\{meta\.nom\}/);
        expect(importExport).not.toMatch(/\$\{meta\.auteur\}/);
        expect(importExport).not.toMatch(/\$\{meta\.description\}/);
        expect(importExport).not.toMatch(/\$\{meta\.niveau\}/);
    });
});

describe('#386 · dropdowns/listes trimestre-v2 : libellés utilisateur échappés', () => {
    it('aucun libellé brut dans les <option> de la famille', () => {
        expect(tv2).not.toMatch(/>\$\{nom\}<\/option>/);
        expect(tv2).not.toMatch(/>\$\{labelCours\(c\)\}<\/option>/);
        expect(tv2).not.toMatch(/>\$\{labelEns\(e\)\}<\/option>/);
        expect(tv2orch).not.toMatch(/>\$\{label\}<\/option>/);
        expect(tv2orch).not.toMatch(/>\$\{libelle\}<\/option>/);
        expect(tv2gc).not.toMatch(/>\$\{gc\.nom \|\| gc\.id\}<\/option>/);
        expect(tv2liste).not.toMatch(/>\$\{t\.nom\}<\/span>/);
    });

    it('les libellés passent par echapperHtml', () => {
        expect(tv2).toMatch(/>\$\{echapperHtml\(labelCours\(c\)\)\}<\/option>/);
        expect(tv2orch).toMatch(/>\$\{echapperHtml\(label\)\}<\/option>/);
        // La liste de gestion (`${echapperHtml(t.nom)}`) est retirée le 4 oct. 2026 (#1006). #1159 (lot 6) :
        // la rangée de la bibliothèque passe le nom en TEXTE, le composant l'échappe (`_renderRangee`) ;
        // le banc bibliotheque-liste-1159 l'éprouve avec un nom hostile.
        expect(tv2liste).toContain('nom: t.nom || t.id,');
        expect(tv2liste).toContain('BibliothequeUI.creerFenetreListe(');
        expect(tv2liste).not.toMatch(/nom: [^\n]*\+ badgeActif/);
    });
});

describe('#386 · planification : titre de nœud échappé, attributs value= coercés', () => {
    it('plus aucun titre brut dans les innerHTML des nœuds (clone + chargement ×2)', () => {
        expect(carte).not.toMatch(/contenteditable="true">' \+ \(donnees\.titre \|\| ''\)/);
        expect(carte).not.toMatch(/contenteditable="true">' \+ \(n\.titre \|\| ''\)/);
    });

    // ⚠ ASSERTION REVUE LE 9 AOÛT 2026 (#437) — la cible a changé, l'invariant
    // NON. Les « trois chemins » (création, clone, reconstruction) ont été
    // fondus en un seul, `contenuNoeudHTML` : c'était précisément le correctif
    // du jour, les deux premiers rendaient un nœud incomplet. Le titre n'est
    // donc plus injecté qu'aux deux branches de CETTE fonction (conteneur et
    // feuille), et l'ancienne forme `echapperHtml(donnees.titre)` n'a plus de
    // sujet.
    //
    // ⮕ L'assertion se resserre au lieu de se relâcher : au lieu de compter
    // les échappements aux trois endroits qui injectaient, on verrouille qu'il
    // n'existe QU'UN endroit qui injecte, et qu'il échappe. Un quatrième
    // chemin qui se remettrait à fabriquer son innerHTML — le défaut corrigé —
    // ferait rougir le compte.
    it('le titre n’est injecté QUE par le rendu unique, et il y est échappé', () => {
        const injections = carte.match(/contenteditable="true">' \+ echapperHtml\(n\.titre \|\| ''\)/g) || [];
        expect(injections.length, 'deux branches : conteneur et feuille').toBe(2);
        // Plus aucune injection depuis les anciens chemins.
        expect(carte).not.toMatch(/contenteditable="true">' \+ echapperHtml\(donnees\.titre/);
    });

    it('tout innerHTML de nœud passe par le rendu unique', () => {
        // Le vrai gardien : si un appelant se remettait à composer sa propre
        // chaîne, il pourrait y interpoler un titre brut sans que l'assertion
        // ci-dessus ne bouge d'un pouce.
        const delegations = carte.match(/el\.innerHTML = contenuNoeudHTML\(/g) || [];
        expect(delegations.length).toBe(3);
        const fabriques = carte.match(/'<div class="planif-noeud-entete">'/g) || [];
        expect(fabriques.length, 'une seule fabrique d’en-tête').toBe(1);
    });

    // L'ancrage temporel a migré de la séquence (couple semaineDebut/semaineFin)
    // vers la leçon (`metadata.semaine`, lot 1 du planificateur en grille,
    // 6 août 2026). L'invariant d'origine ne change pas : la seule valeur
    // utilisateur injectée dans un attribut `value=` de l'inspecteur doit être
    // un ENTIER coercé, jamais une chaîne brute.
    it('la semaine de leçon est coercée en entier dans value= (symétrique meta.duree)', () => {
        // `semaineDeLecon()` retourne un entier ou null — jamais la valeur brute.
        expect(carte).toMatch(/var semLecon = semaineDeLecon\(donnees\);/);
        expect(carte).toMatch(/id="planif-panneau-semaine" value="' \+ \(semLecon === null \? '' : semLecon\)/);
        expect(carte).toMatch(/return \(isNaN\(s\) \|\| s < SEMAINE_MIN\) \? null : s;/);
        // Aucune metadata temporelle brute ne repart dans un attribut.
        expect(carte).not.toMatch(/value="' \+ \(donnees\.metadata\.semaine[A-Za-z]* \|\| ''\)/);
    });

    it('les deux champs de semaine de la SÉQUENCE ont bien été retirés', () => {
        expect(carte).not.toMatch(/planif-panneau-sem-debut/);
        expect(carte).not.toMatch(/planif-panneau-sem-fin/);
    });

    it('bibliothèque d\'alignements : nom de carte et attributs data-* échappés', () => {
        // ↻ 25 oct. 2026 (#1157, lot 4 des bibliothèques en deux colonnes) — RÉANCRÉ, motif : la fenêtre
        // ne construit plus de HTML. `ligneCarteTrimestre` et ses chaînes sont parties ; le module passe des
        // données (`rangeeCarteTrimestre`) et le composant (`BibliothequeUI.renderRangeesImport`, les colonnes
        // de `creerFenetreDeuxColonnes`) échappe nom, détail et identifiants. La défense est la même, elle
        // a changé de fichier. BREAK-TEST (25 oct.) : `echapperHtml(r.nom)` → `r.nom` dans
        // `renderRangeesImport` → ce test ROUGIT ; une chaîne `'<span>' + nom +` remise dans le module → ROUGIT.
        expect(biblio).toMatch(/BibliothequeUI\.renderRangeesImport\(/);
        expect(biblio).toMatch(/BibliothequeUI\.creerFenetreDeuxColonnes\(/);
        expect(biblio).not.toMatch(/<(span|div|button|option|small|li)\b/);
        const ui = lire('bibliotheque-ui.js');
        const rangees = tranche(ui, 'BibliothequeUI.renderRangeesImport = function', '/** #1157 — une courte liste en tête du repli');
        expect(rangees).toMatch(/^[^]*?echapperHtml\(r\.nom\)[^]*?echapperHtml\(r\.detail\)[^]*?_btnAttrs\(r\)[^]*?echapperHtml\(r\.libelle\)/);
        expect(ui).toMatch(/if \(btn\.param2 != null\) attrs \+= ' data-param2="' \+ echapperAttribut\(btn\.param2\)/);
        expect(ui).toMatch(/'<option value="' \+ echapperAttribut\(t\.value\) \+ '">' \+ echapperHtml\(t\.label\)/);
    });
});
