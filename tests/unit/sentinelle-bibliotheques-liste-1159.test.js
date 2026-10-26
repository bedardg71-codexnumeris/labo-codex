import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

// =====================================================================
// #1159 (lot 6, 25 oct. 2026) — LES TROIS LISTES SIMPLES, PUIS LE RETRAIT
// =====================================================================
// Les cours, les trimestres et les groupes-cours passent à la fenêtre à une seule liste
// (`BibliothequeUI.creerFenetreListe`) ; l'ancien rendu en cartes n'a plus d'appelant et part
// (zéro dette) : `creerModal`, `renderCarteSelection`, `renderCarteDisponible`, leur bouton
// principal, `tronquerDescription`, le CSS `.biblio-carte*` (sauf `--pointee`, que « Voir » pose
// sur une rangée) et `.biblio-section-titre`.
//
// A. Le retrait : aucun appel, aucune définition, aucune classe dans js/, styles.css, index.html,
//    design-system.html et tests/ ; un TÉMOIN prouve que le détecteur voit un appel restant.
// B. Les phrases d'une liste vide, mot pour mot (trimestres et groupes-cours : validées par
//    Grégoire le 25 oct., 19 h 06).
//
// BREAK-TESTS (25 oct. 2026, chacun rougit puis l'original est remis) :
//   · `BibliothequeUI.creerModal({ modalId: 'x' });` ajouté au bout de js/cours.js → A ROUGIT ;
//   · `.biblio-carte-meta { color: red; }` ajouté à styles.css → A ROUGIT ;
//   · « Aucun trimestre ouvert. » → « Aucun trimestre actif » → B ROUGIT ;
//   · (verdict, § 2.2) `function genererIdCourtProduction(id) {}` remis dans productions.js → A ROUGIT ;
//     la branche `if (btn.onclick) return onclickToDataAttrs(btn.onclick);` remise (avec sa fonction)
//     → A ET « un bouton `{onclick}` » ROUGISSENT.

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const lire = (f) => readFileSync(path.join(racine, f), 'utf8');
const lister = (d, ext) => readdirSync(path.join(racine, d), { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? (['_archives', 'node_modules', 'fixtures'].includes(e.name) ? [] : lister(path.join(d, e.name), ext))
        : (ext.some(x => e.name.endsWith(x)) ? [path.join(d, e.name)] : []));
/** Le code sans ses commentaires : l'histoire du retrait reste écrite, elle ne compte pas. */
const sansCommentaires = (src) => src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"\\])\/\/[^\n]*/g, '$1').replace(/<!--[\s\S]*?-->/g, '');

const RETIRES = [
    /\bcreerModal\s*[(:=]/,                           // appel, mock d'objet, définition
    /\bcreerModal\s*\(\s*\)\s*\{/,                    // mock en méthode
    /\brenderCarte(?:Selection|Disponible)\b/,
    /\b_renderBoutonPrincipal\b/,
    /\btronquerDescription\b/,
    /biblio-carte(?!--pointee)(?:-[\w-]+|--[\w-]+|(?![\w-]))/,
    /biblio-section-titre/,
    // Verdict du lot 6, § 2.2 : le code mort de l'ancien composant part avec lui.
    /\bformaterMetadonnees\b/,
    /\bformaterAttribution\b/,
    /\bonclickToDataAttrs\b/,
    /\bgenererBadgeSourceProduction\b/,
    /\bgenererIdCourtProduction\b/
];
const trouver = (src) => RETIRES.filter(m => m.test(sansCommentaires(src))).map(String);

describe('#1159 · A — l\'ancien rendu en cartes est retiré', () => {
    const fichiers = [...lister('js', ['.js']), 'styles.css', 'index.html', 'design-system.html',
        ...lister('tests/unit', ['.js']), ...lister('tests/integration', ['.js'])]
        .filter(f => !f.endsWith('sentinelle-bibliotheques-liste-1159.test.js'));

    it('aucun appel, aucune définition, aucune classe, nulle part', () => {
        const restes = fichiers.map(f => [f, trouver(lire(f))]).filter(([, t]) => t.length);
        expect(restes).toEqual([]);
    });

    it('TÉMOIN · le détecteur voit un appel restant, une classe restante ; il laisse `--pointee` et l\'histoire', () => {
        expect(trouver("BibliothequeUI.creerModal({ modalId: 'x' });")).toHaveLength(1);
        expect(trouver("BibliothequeUI: { creerModal() {} }")).not.toEqual([]);
        expect(trouver("x = BibliothequeUI.renderCarteSelection(o);")).toHaveLength(1);
        expect(trouver('.biblio-carte-meta { color: red; }')).toHaveLength(1);
        expect(trouver('<div class="biblio-carte biblio-carte--selection">')).not.toEqual([]);
        expect(trouver("el.classList.add('biblio-carte--pointee');")).toEqual([]);
        expect(trouver('// #1159 — `creerModal` est retiré')).toEqual([]);
        expect(trouver('cc.creerModalMetadonneesEnrichies();')).toEqual([]);
        expect(trouver('var l = BibliothequeUI.formaterMetadonnees(item, {});')).toHaveLength(1);
    });

    // Verdict du lot 6, § 2.2 : la branche `{onclick}` de `_btnAttrs` n'échappait pas ses paramètres ; partie,
    // un bouton qui la passerait encore ne reçoit plus aucun geste (et rien de brut dans ses attributs).
    it('un bouton `{onclick}` ne reçoit plus d\'attributs : la branche héritée est retirée', () => {
        const e = chargerScript('js/securite-echappement.js');
        // `echapperHtml` : fidèle à config.js (encode &, <, >, laisse les guillemets) ; `echapperAttribut` : le vrai.
        const echapperHtml = (t) => t == null ? '' : String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        const B = chargerScript('js/bibliotheque-ui.js', { echapperHtml, echapperAttribut: e.echapperAttribut }).BibliothequeUI;
        const html = B.renderMenuActions([{ label: 'Vieux', onclick: `fn('a" data-x="1')` }], 'ctx');
        expect(html).not.toContain('data-action="fn"');
        expect(html).not.toContain('data-x');
    });

    it('le composant expose la fenêtre à une seule liste, et plus l\'ancienne API', () => {
        const B = chargerScript('js/bibliotheque-ui.js').BibliothequeUI;
        expect(typeof B.creerFenetreListe).toBe('function');
        expect(typeof B.creerFenetreDeuxColonnes).toBe('function');
        for (const f of ['creerModal', 'renderCarteSelection', 'renderCarteDisponible', 'tronquerDescription',
            'formaterMetadonnees', 'formaterAttribution']) {
            expect(B[f], f).toBeUndefined();
        }
    });
});

describe('#1159 · B — la phrase d\'une liste vide', () => {
    it('trimestres : « Aucun trimestre ouvert. », les clos dans « Clos »', () => {
        let config = null;
        const win = chargerScript('js/trimestre-v2-liste.js', {
            obtenirTrimestres: () => [{ id: 'h2099', nom: 'Hiver fictif 2099', archive: true }],
            BibliothequeUI: { creerFenetreListe: (c) => { config = c; }, fermerModal() {} },
            notifications: { info() {}, succes() {}, erreur() {} },
            echapperHtml: (s) => String(s)
        });
        win.ouvrirBibliothequeTrimestreV2();
        expect(config.titre).toBe('Bibliothèque des trimestres');
        expect(config.liste).toEqual({ vide: 'Aucun trimestre ouvert.', rangees: [] });
        expect(config.repli.titre).toBe('Clos');
        expect(config.repli.rangees.map(r => r.id)).toEqual(['h2099']);
    });

    it('groupes-cours : la phrase validée, qui nomme « + Nouveau groupe-cours »', () => {
        let config = null;
        const win = chargerScript('js/trimestre-v2-groupes-cours.js', {
            db: { getSync: (k, d) => d, setSync() {}, get: async () => null },
            cle: (k) => 'a2099_' + k,
            BibliothequeUI: { creerFenetreListe: (c) => { config = c; }, fermerModal() {} },
            notifications: { info() {}, succes() {}, erreur() {} },
            echapperHtml: (s) => String(s)
        });
        win.ouvrirModalBibliothequeGroupeCours();
        expect(config.titre).toBe('Bibliothèque des groupes-cours');
        expect(config.liste.vide).toBe('Aucun groupe-cours pour l\'instant. Crée-en un avec « + Nouveau groupe-cours ».');
        expect(config.liste.rangees).toEqual([]);
        expect(config.repli.rangees).toEqual([]);
    });
});
