/**
 * SENTINELLE (29 oct. 2026) — LE GUIDAGE DE LA DÉMO ET LA FENÊTRE « DONNÉES DÉMO » DISENT LES TEXTES VALIDÉS.
 *
 * Consigne : plans de travail/CONSIGNE-LOT-2026-10-29-guidage-demo.md. Textes : plans de travail/TEXTES-2026-10-28-guidage-demo.md,
 * validés par Grégoire le 29 oct. 2026 de 7 h 53 à 8 h 03, groupe par groupe, à poser mot pour mot.
 *
 * VERROUILLÉ ICI :
 *   A. Chaque texte « APRÈS » (17 bulles ; la fenêtre : titre, blocs 1, 3 à 7), LU DANS LE FICHIER TEXTES (pas recopié),
 *      paraît sous sa clé, à la typographie près (insécables avant « ; : ? ! » et dans « »). Le bloc 2 reste celui du 7 oct.
 *   B. `apercu-contenu` et `suivi-apercu-legacy` n'existent plus ; chaque clé de `GUIDAGE_TEXTES` est l'identifiant d'une
 *      sous-section d'index.html (une clé qui ne l'est pas ne s'affiche jamais).
 *   C. Les nombres que les textes citent se recomptent dans le pack de la démo et dans `CARTE_DEMO_ALIGNEMENT`.
 *
 * BREAK-TESTS : journal en fin de fichier.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerAvecInterne } from './_helpers/bac-suivi.js';
import { chargerScript } from './_helpers/charger-script.js';

const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const lire = (f) => readFileSync(path.join(RACINE, f), 'utf8');
const TEXTES = lire('plans de travail/TEXTES-2026-10-28-guidage-demo.md');

/** La typographie de la consigne (§ 1.3) : insécable avant « ; : ? ! » et à l'intérieur des « ». Rien d'autre. */
const typo = (s) => s.replace(/ ([;:?!])/g, ' $1').replace(/« /g, '« ').replace(/ »/g, ' »');

/** Les bulles du fichier TEXTES : `### N. \`clé\`` puis la ligne « **APRÈS** — *Titre* : texte ». */
function bullesValidees() {
    const sections = TEXTES.split(/^### /m).slice(1);
    const bulles = [];
    for (const s of sections) {
        const entete = s.match(/^(\d+)\. `([a-z-]+)`/);
        if (!entete) continue;
        const apres = s.match(/^\*\*APRÈS\*\* — \*(.+?)\* : (.+)$/m);
        if (!apres) continue;   // la bulle 5 : « (aucun texte : l'entrée se retire) »
        bulles.push({ num: Number(entete[1]), cle: entete[1] === '1' ? 'suivi-groupe' : entete[2], titre: apres[1], texte: apres[2] });
    }
    return bulles;
}

/** La fenêtre « Données démo » du fichier TEXTES : titre, blocs 1 et 3 à 7 (bloc 4 : ses trois éléments). */
function fenetreValidee() {
    // Les sections `## …` du fichier, puis les `### …` de celle de la fenêtre (découpe par titres, sans index de chaîne).
    const fen = TEXTES.split(/^## /m).find(t => t.startsWith('La fenêtre « Données démo »'));
    const blocs = Object.fromEntries(fen.split(/^### /m).slice(1).map(t => [t.split('\n')[0].trim(), t]));
    const bloc = (nom) => blocs[Object.keys(blocs).find(k => k.startsWith(nom))];
    const apres = (nom) => bloc(nom).match(/^\*\*APRÈS\*\* : (.+)$/m)[1];
    const b4 = bloc('Bloc 4').split(/^\*\*APRÈS\*\*/m)[1];
    return {
        titre: apres('Le titre'),
        blocs: { 1: apres('Bloc 1'), 3: apres('Bloc 3'), 5: apres('Bloc 5'), 6: apres('Bloc 6'), 7: apres('Bloc 7') },
        parcours: [...b4.matchAll(/^- \*\*(.+?)\*\* – (.+)$/gm)].map(m => '<strong>' + m[1] + '</strong> – ' + m[2])
    };
}

function guidage() {
    const win = {};
    chargerAvecInterne('js/guidage-demo.js', {}, win, ['GUIDAGE_TEXTES']);
    return win.__audit['guidage-demo.js'].GUIDAGE_TEXTES;
}
function fenetre() {
    const win = { accompagnement: { ajouterEntrees() {} } };
    chargerAvecInterne('js/accompagnement-contenu-popup.js', {}, win, ['AIDE_CONTEXTUELLE']);
    return win.__audit['accompagnement-contenu-popup.js'].AIDE_CONTEXTUELLE['accueil-donnees-demo'];
}

/* ================================================================ A. LES TEXTES */
describe('A · chaque texte validé paraît sous sa clé, mot pour mot', () => {
    it('les 17 bulles (la 5 retirée), titre et texte', () => {
        const bulles = bullesValidees();
        expect(bulles.map(b => b.num)).toEqual([1, 2, 3, 4, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18]);
        const g = guidage();
        for (const b of bulles) expect(g[b.cle], b.cle).toEqual({ titre: typo(b.titre), texte: typo(b.texte) });
        expect(Object.keys(g)).toEqual(bulles.map(b => b.cle));   // aucune bulle de plus
    });

    it('la fenêtre « Données démo » : le titre, les blocs 1, 3 à 7 ; le bloc 2 (G4, 7 oct.) inchangé', () => {
        const v = fenetreValidee();
        const f = fenetre();
        expect(f.titre).toBe(v.titre);
        expect(f.sections.map(s => s.type)).toEqual(['texte', 'texte', 'texte', 'liste', 'exemple', 'conseil', 'alerte']);
        expect(f.sections[0].contenu).toBe(typo(v.blocs[1]));
        expect(f.sections[1].contenu).toBe('Ce que tu fais dans la démo est provisoire : une nouvelle version du pack démo remplace tes évaluations, et « Retirer les copies » efface les copies importées.');
        expect(f.sections[2].contenu).toBe(typo(v.blocs[3]));
        expect(f.sections[3].titre).toBe('Le parcours en trois temps');
        expect(f.sections[3].items).toEqual(v.parcours.map(typo));
        expect(v.parcours).toHaveLength(3);
        expect(f.sections[4].contenu).toBe(typo(v.blocs[5]));
        expect(f.sections[5].contenu).toBe(typo(v.blocs[6]));
        expect(f.sections[6].contenu).toBe(typo(v.blocs[7]));
        expect(f.voirAussi).toEqual(['bibliotheque-fonctionnement', 'construction-objectifs-reflexion']);
    });

    it('la typographie : aucun espace ordinaire avant « ; : ? ! » ni dans « » ; demi-cadratins au bloc 4', () => {
        const g = guidage();
        const f = fenetre();
        const chaines = Object.values(g).flatMap(b => [b.titre, b.texte])
            .concat([f.sections[0], f.sections[2], f.sections[4], f.sections[5], f.sections[6]].map(s => s.contenu), f.sections[3].items);
        for (const c of chaines) expect(c, c).not.toMatch(/ [;:?!]|« | »/);
        for (const item of f.sections[3].items) expect(item).toMatch(/<\/strong> – /);
    });
});

/* ================================================================ B. LES CLÉS */
describe('B · chaque bulle vise un écran qui existe', () => {
    it('les clés mortes ne sont plus là', () => {
        const g = guidage();
        expect(g['apercu-contenu']).toBeUndefined();
        expect(g['suivi-apercu-legacy']).toBeUndefined();
    });
    it('chaque clé de GUIDAGE_TEXTES est l\'identifiant d\'une sous-section d\'index.html', () => {
        const index = lire('index.html');
        for (const cle of Object.keys(guidage())) {
            expect(index.match(new RegExp('<div[^>]*\\bid="' + cle + '"[^>]*class="[^"]*sous-section|<div[^>]*class="[^"]*sous-section[^"]*"[^>]*\\bid="' + cle + '"')), cle).not.toBeNull();
        }
    });
});

/* ================================================================ C. LES NOMBRES */
describe('C · les nombres cités se recomptent', () => {
    it('le pack : 10 étudiant·es, 11 productions (1 portfolio, 9 artefacts, 1 terminale), 101 évaluations, 32 dates, 3 grilles, 2 échelles, 9 cartouches', () => {
        const pack = chargerScript('js/pack-demo-10.js', {}).PACK_DEMARRAGE;
        const types = pack.productions.map(p => p.type);
        const cartouches = Object.keys(pack).filter(k => k.startsWith('cartouches_')).reduce((n, k) => n + pack[k].length, 0);
        const dates = Object.keys(pack.presences).sort();
        expect({
            etudiants: pack.groupeEtudiants.length, productions: pack.productions.length,
            portfolio: types.filter(t => t === 'portfolio').length, artefacts: types.filter(t => t === 'artefact-portfolio').length,
            terminale: types.filter(t => t === 'terminale').length, evaluations: pack.evaluationsSauvegardees.length,
            dates: dates.length, premiere: dates[0], derniere: dates[dates.length - 1],
            grilles: pack.grillesTemplates.length, echelles: pack.echellesTemplates.length, cartouches,
            cours: pack.listeCours[0].titre
        }).toEqual({ etudiants: 10, productions: 11, portfolio: 1, artefacts: 9, terminale: 1, evaluations: 101, dates: 32,
            premiere: '2025-08-25', derniere: '2025-12-10', grilles: 3, echelles: 2, cartouches: 9, cours: 'Écriture et littérature (Démo)' });
        // Les noms que la fenêtre cite : « Grille-5 FR-HOLIS-20 H26 » et son auteur, « Labo Codex » ; le critère algorithmique.
        const holis = pack.grillesTemplates.find(g => g.nom === 'Grille-5 FR-HOLIS-20 H26');
        expect(holis && holis.metadata_cc && holis.metadata_cc.auteur_original).toBe('Labo Codex');
        expect(pack.grillesTemplates.filter(g => (g.criteres || []).some(c => c.type === 'algorithmique')).map(g => g.criteres.find(c => c.type === 'algorithmique').nom))
            .toEqual(['Français écrit']);
    });

    it('la carte d\'alignement : « Écriture et littérature (démo) », 17 nœuds et 12 liens (pas les compteurs 26 et 45)', () => {
        const carte = chargerScript('js/demo-namespace.js', {}).CARTE_DEMO_ALIGNEMENT.cartes.carte_1;
        expect({ noeuds: carte.noeuds.length, liens: carte.liens.length }).toEqual({ noeuds: 17, liens: 12 });
        expect(chargerScript('js/demo-namespace.js', {}).CARTE_DEMO_ALIGNEMENT.metadata_cc.nom).toBe('Écriture et littérature (démo)');
    });
});

// JOURNAL DES BREAK-TESTS (29 oct. 2026) — copie de référence, mutation, lancement de ce fichier, restauration (sha256 identique) :
//   G1 guidage-demo.js — un mot changé dans une bulle (« ouvre la fiche »)                  → 1 rouge (les 17 bulles)
//   G2 guidage-demo.js — la bulle 1 rendue à « apercu-contenu »                              → 3 rouges (bulles ; clés mortes ; sous-sections)
//   G3 guidage-demo.js — la bulle 5 remise                                                    → 3 rouges (idem)
//   G4 guidage-demo.js — un espace ordinaire avant « : »                                      → 2 rouges (bulles ; typographie)
//   G5 accompagnement-contenu-popup.js — le bloc 2 (G4, 7 oct.) retouché                       → 1 rouge (fenêtre)
//   G6 accompagnement-contenu-popup.js — l'ancien titre « Mode démonstration & duplication CC » → 1 rouge (fenêtre)
//   G7 accompagnement-contenu-popup.js — le bloc 4 au tiret cadratin                           → 2 rouges (fenêtre ; typographie)
//   Playwright (WebKit, guidage-demo-29-oct.spec.js) : G2 → rouge (aucune bulle sous Suivi du groupe).
