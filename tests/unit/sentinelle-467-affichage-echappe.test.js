import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

// Sentinelle #467 (CO-14, 9 oct. 2026) — UN NOM REÇU S'AFFICHE, IL NE S'EXÉCUTE PAS.
//
// Avec la cohorte, grilles, échelles, cartouches, pratiques, productions et tampons
// passent d'un enseignant à l'autre. Le nom reçu arrivait brut dans le `innerHTML`
// du destinataire : barres latérales, cartes de la Bibliothèque, fenêtres d'import
// par trimestre, éditeurs de tampons. La CSP bloque les scripts, pas l'injection
// de HTML (règle 1 de CLAUDE.md). L'échappement à l'affichage couvre aussi le
// STOCK : ce qui a déjà été importé brut chez quelqu'un n'est pas réécrit.
//
// Ce qu'il tient :
//   A — les points de chute communs des cartes (bibliotheque-ui.js).
//   B — trois barres latérales, rendues pour de vrai avec un nom hostile.
//   C — un cliquet statique sur les quinze fichiers de la passe : toute
//       interpolation brute d'un champ nommé (nom, titre, description, auteur…)
//       dans du balisage rougit, sauf les exceptions NOMMÉES ci-dessous, chacune
//       avec sa raison (une constante du code, jamais une donnée reçue).

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');
const CHARGE = '<img src=x onerror=alert(1)>';

// Même table que `echapperHtml` (config.js, zone protégée, non chargée ici).
const echapperHtml = (t) => (t == null ? '' : String(t)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;'));

function conteneurs(ids) {
    const els = {};
    ids.forEach((id) => { els[id] = { innerHTML: '', classList: { add() {}, remove() {} }, style: {} }; });
    return {
        els,
        document: {
            getElementById: (id) => els[id] || null,
            querySelector: () => null,
            querySelectorAll: () => [],
            createElement: () => ({ setAttribute() {}, appendChild() {}, style: {}, classList: { add() {}, remove() {} } }),
            addEventListener() {}, removeEventListener() {},
            body: { appendChild() {}, insertAdjacentHTML() {} }
        }
    };
}

/* --------------------------------------------- A — les points de chute communs */

describe('#467 · A — les cartes de la Bibliothèque', () => {
    const { document } = conteneurs([]);
    const win = chargerScript('js/bibliotheque-ui.js', { echapperHtml, echapperAttribut: echapperHtml, document });
    const B = win.BibliothequeUI;

    it('A.a la ligne de métadonnées échappe l\'auteur reçu et la discipline', () => {
        const ligne = B.formaterMetadonnees(
            { metadata_cc: { auteur_original: CHARGE + 'Autrice' }, discipline: CHARGE + 'Français' },
            { quantite: '3 critère(s)', discipline: true });
        expect(ligne).not.toContain('<img');
        expect(ligne).toContain('&lt;img');
    });

    it('A.b l\'auteur de repli (`item.auteur`) aussi', () => {
        expect(B.formaterMetadonnees({ auteur: CHARGE + 'Autrice' })).not.toContain('<img');
    });

    it('A.c l\'identifiant de contexte du menu d\'actions (un id importé) ne sort pas de son attribut', () => {
        const html = B.renderMenuActions([{ label: 'Supprimer', action: 'x', param: 'y' }], '"><img src=x onerror=alert(1)>');
        expect(html).not.toContain('<img');
    });
});

/* ------------------------------------------------ B — trois barres latérales */

describe('#467 · B — les barres latérales affichent le nom, elles ne l\'exécutent pas', () => {
    const BibliothequeUI = { filtrerParModeDemo: (l) => l, filtrerParMaquette: (l) => l };

    it('B.a pratiques', async () => {
        const { els, document } = conteneurs(['sidebarListePratiques']);
        const win = chargerScript('js/pratiques-gestion.js', {
            document, echapperHtml, BibliothequeUI, cle: (k) => 'a2026_' + k,
            db: { getSync: () => [{ id: 'P1', nom: CHARGE + 'Pratique reçue', dansBibliotheque: true }] },
            genererBadgeTypePratique: () => '', obtenirIdPratiqueActive: () => null
        });
        await win.afficherListePratiquesMateriel();
        expect(els.sidebarListePratiques.innerHTML).toContain('&lt;img');
        expect(els.sidebarListePratiques.innerHTML).not.toContain('<img');
    });

    it('B.b échelles', async () => {
        const { els, document } = conteneurs(['sidebarListeEchelles']);
        const win = chargerScript('js/echelles.js', {
            document, echapperHtml, BibliothequeUI, cle: (k) => 'a2026_' + k,
            db: { get: async () => [{ id: 'E1', nom: CHARGE + 'Échelle reçue', niveaux: [] }], getSync: (k, d) => d }
        });
        await win.afficherListeEchelles();
        expect(els.sidebarListeEchelles.innerHTML).toContain('&lt;img');
        expect(els.sidebarListeEchelles.innerHTML).not.toContain('<img');
    });

    it('B.c ensembles d\'objectifs', () => {
        const { els, document } = conteneurs(['listeEnsemblesObjectifs']);
        const win = chargerScript('js/objectifs.js', {
            document, echapperHtml,
            db: { getSync: () => [{ id: 'O1', nom: CHARGE + 'Ensemble reçu', objectifs: [] }] }
        });
        win.initialiserModuleObjectifs();   // le point d'entrée réel de la liste
        expect(els.listeEnsemblesObjectifs.innerHTML).toContain('&lt;img');
        expect(els.listeEnsemblesObjectifs.innerHTML).not.toContain('<img');
    });
});

/* ----------------------------------------------------- C — le cliquet statique */

const FICHIERS = [
    'js/bibliotheque-ui.js', 'js/pratiques-gestion.js', 'js/echelles.js', 'js/grilles.js',
    'js/cartouches.js', 'js/objectifs.js', 'js/productions.js', 'js/productions-bibliotheque-ui.js',
    'js/tampons-bibliotheque.js', 'js/planification-bibliotheque.js', 'js/travaux-outils.js',
    'js/wizard-pratique-v2.js', 'js/profil-etudiant-sections-affichage.js',
    'js/trimestre-v2-cours.js'
];

// Les seules interpolations brutes admises : des constantes du code, jamais une donnée reçue.
const ADMISES = {
    'js/bibliotheque-ui.js': ['+ config.titre +'],          // titre de fenêtre passé par le code appelant
    'js/echelles.js': ['${ph.code}', '${ph.nom}'],          // exemples de placeholder, table du code
    'js/travaux-outils.js': ['+ c.nom +', '${m.titre}',     // COULEURS et modes de pointe : tables du code
        '${outil.icone}', '${outil.icone}'],                 // icônes <img> des outils et formes (OUTILS) : D.a
    'js/wizard-pratique-v2.js': ['${opt.description}', '${opt.description}', '${badge.code}', '${badge.description}'],
    // ↑ définitions de l'assistant et TYPE_BADGES : tables du code
    'js/profil-etudiant-sections-affichage.js': ['${niveauRai.description}']   // determinerNiveauRaiPedagogique : table du code
};

const CHAMPS = '(?:nom|titre|description|auteur|auteurOriginal|auteur_original|discipline|etablissement|objectif|tache|activiteApprentissage|licence|icone|code|lettre)';
const GABARIT = new RegExp('\\$\\{\\s*(?!echapper|esc\\()[\\w$.?\\[\\]]*\\.' + CHAMPS + '\\s*(?:\\|\\|[^}]*)?\\}', 'g');
const CONCAT = new RegExp('\\+\\s*(?!echapper|esc\\()[\\w$.?\\[\\]]*\\.' + CHAMPS + '\\s*\\+', 'g');

function interpolationsBrutes(fichier) {
    const trouves = [];
    readFileSync(path.join(racine, fichier), 'utf8').split('\n').forEach((l) => {
        if (/^\s*(\/\/|\*)/.test(l)) return;              // commentaire
        if (!/<\/?[a-zA-Z]|="/.test(l)) return;            // pas de balisage sur la ligne
        for (const m of l.matchAll(GABARIT)) trouves.push(m[0].replace(/\s+/g, ''));
        for (const m of l.matchAll(CONCAT)) trouves.push(m[0].replace(/\s+/g, ' '));
    });
    return trouves;
}

describe('#467 · C — aucune interpolation brute d\'un champ nommé dans le balisage', () => {
    for (const f of FICHIERS) {
        it(f, () => {
            expect(interpolationsBrutes(f).sort()).toEqual([...(ADMISES[f] || [])].sort());
        });
    }

    // Les titres de cartes ne passent pas par un gabarit `${…}` : `nom:` reçoit le
    // résultat de `formaterTitre`, qui ne retire qu'un préfixe [XXX]. Le nom doit
    // donc y entrer DÉJÀ échappé. Exceptions : les appels en contexte TEXTE (libellé
    // d'un select de dossiers, échappé à l'option par bibliotheque-ui.js).
    const TITRE_BRUT = /formaterTitre(?:Demo)?\(\s*(?=\S)(?!echapperHtml\()/g;
    const TITRES_TEXTE = {
        'js/bibliotheque-ui.js': 2,               // formaterTitreDemo → formaterTitre ; _labelItem (texte)
        'js/pratiques-gestion.js': 1,             // labelItem (texte)
        'js/grilles.js': 1,                       // libelle (texte)
        'js/echelles.js': 1,                      // libelle (texte)
        'js/productions-bibliotheque-ui.js': 1    // libelle (texte)
    };
    it('C.t les titres de cartes reçoivent un nom déjà échappé', () => {
        for (const f of FICHIERS) {
            const src = readFileSync(path.join(racine, f), 'utf8')
                .replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')
                .replace(/BibliothequeUI\.formaterTitre(?:Demo)? = function\s*\(/g, '');
            expect((src.match(TITRE_BRUT) || []).length, f).toBe(TITRES_TEXTE[f] || 0);
            // Une carte construite sur place : son `nom:` est échappé, ou formaté (règle ci-dessus).
            expect(src.match(/renderCarte\w*\(\{\s*nom:\s*(?=\S)(?!echapperHtml|BibliothequeUI)/g), f).toBeNull();
            // Le `nom` d'une carte est du HTML : le select des dossiers lit `libelle` (texte),
            // sinon « Grille d'analyse » s'y afficherait « Grille d&#39;analyse ».
            expect(src, f).not.toMatch(/labelItem:\s*\(c\)\s*=>\s*c\.nom\b/);
        }
    });

    // Une variable NUE (`${nomPratique}`, `' + nomCat + '`) n'a pas de champ à
    // reconnaître : celles-là sont tenues par un COMPTE, mesuré le 9 oct. après la
    // passe (ids, nombres, fragments HTML déjà construits, et les noms désormais
    // échappés n'y figurent plus). Un nom qu'on désescape fait MONTER le compte.
    // ⚠ Un compte qui BAISSE (échappement ou retrait de plus) se met à jour ici,
    // à la baisse seulement, avec sa raison dans le commit.
    // ↻ 11 oct. 2026 (#574) : echelles.js 23 → 24, SANS désescape. La ligne de niveau
    // est devenue une fonction (`ligneNiveauEchelleHtml`) partagée avec le niveau en
    // attente : ses six `${index}` sont devenus un `${index}` et six `${attrs}` — le
    // même fragment d'identifiants, construit une fois. Aucun nom n'y passe.
    // ↻ 15 oct. 2026 (#821) : profil-etudiant-sections-affichage.js 111 → 112, SANS désescape.
    // La phrase sous le badge du contexte sort dans `_ligneDescriptionContexte` (cliquet de
    // complexité) : sa couleur, un code hexadécimal choisi par le palier, devient `${couleur}`.
    // ↻ 18 oct. 2026 (dissection 2a, C2) : grilles.js 65 → 64 ; `${c.ponderation}%` passe par `texteDePonderation`.
    // ↻ 19 oct. 2026 (#1117) : grilles.js 64 → 65, SANS désescape — même cas que #574. Le menu
    // « Complexité SOLO du critère » sort dans `menuComplexiteSOLOCritere`, partagé par les deux
    // éditeurs ; leurs attributs (handler, `grille.id`, `index`) lui arrivent en `${attrs}`.
    // ↻ 20 oct. 2026 (#1120, lot 1) : grilles.js 65 → 69, SANS désescape — même cas que #574. Une tranche
    // du barème (`trancheBaremeHtml`) reçoit le même fragment d'identifiants dans ses trois champs
    // (`${attrs}` ×3, échappé une fois à sa construction), et le bloc d'un critère pose le barème déjà
    // construit (`${bareme}`). Le nom et le texte d'une tranche passent par `echapperHtml`.
    const NUES = {
        'js/bibliotheque-ui.js': 29, 'js/pratiques-gestion.js': 29, 'js/echelles.js': 21, /* #469 (12 oct. 2026) : −3, exporterEchelleActive partie */
        'js/grilles.js': 69, 'js/cartouches.js': 16, 'js/objectifs.js': 4, 'js/productions.js': 13,
        'js/productions-bibliotheque-ui.js': 1, 'js/tampons-bibliotheque.js': 4,
        'js/planification-bibliotheque.js': 2, 'js/travaux-outils.js': 90,
        'js/wizard-pratique-v2.js': 40, 'js/profil-etudiant-sections-affichage.js': 112, 'js/trimestre-v2-cours.js': 4
    };
    it('C.n les interpolations nues ne montent pas', () => {
        const G = /\$\{\s*([A-Za-z_$][\w$]*)\s*\}/g;
        const C = /'\s*\+\s*([A-Za-z_$][\w$]*)\s*\+\s*'/g;
        for (const f of FICHIERS) {
            let n = 0;
            readFileSync(path.join(racine, f), 'utf8').split('\n').forEach((l) => {
                if (/^\s*(\/\/|\*)/.test(l) || !/<\/?[a-zA-Z]|="/.test(l)) return;
                n += [...l.matchAll(G)].length + [...l.matchAll(C)].length;
            });
            expect(n, f).toBe(NUES[f]);
        }
    });

    it('C.0 le cliquet voit bien un site brut (témoin)', () => {
        const ligne = '<div class="x">${grille.nom}</div>';
        expect([...ligne.matchAll(GABARIT)].length).toBe(1);
        expect([...'<div>${echapperHtml(grille.nom)}</div>'.matchAll(GABARIT)].length).toBe(0);
    });
});

/* ------------- D — ce que l'application écrit elle-même n'est pas échappé (relecture de Cowork) */

// L'échappement vaut pour une donnée REÇUE. L'icône des outils et des formes est une
// balise <img> écrite par l'application (OUTILS) : échappée, le bouton afficherait son
// code. Défaut de la première version du lot, trouvé par la relecture de Cowork.
describe('#467 · D — la palette d\'annotation montre ses icônes, pas leur code', () => {
    class ImageStub { constructor() { this.src = ''; } addEventListener() {} removeEventListener() {} }

    function palette(reglages = {}) {
        const stock = new Map(Object.entries(reglages));
        const db = {
            ready: false,
            getSync: (k, d) => (stock.has(k) && stock.get(k) !== null ? JSON.parse(JSON.stringify(stock.get(k))) : d),
            setSync: (k, v) => { stock.set(k, v); },
            removeSync: (k) => { stock.delete(k); }
        };
        const { document } = conteneurs([]);
        const fenetre = { addEventListener: () => {}, removeEventListener: () => {} };
        const w = chargerScript('js/travaux-outils.js', { db, Image: ImageStub, document, echapperHtml }, fenetre);
        return w.travauxOutils;
    }

    it('D.a chaque bouton d\'outil et de forme porte une vraie balise <img>', () => {
        const html = palette().genererHTMLPalette();
        const boutons = html.match(/<button class="travaux-btn-outil[^"]*" data-outil="[^"]+"[\s\S]*?<\/button>/g) || [];
        expect(boutons.length, 'la palette rend bien ses boutons d\'outil').toBeGreaterThanOrEqual(11);
        for (const b of boutons) {
            expect(b, b.slice(0, 120)).not.toContain('&lt;img');
        }
        expect(html).toContain('<img src="');
    });
    // Le symbole personnel, lui, est saisi par l'usager : son icône reste échappée
    // (palette des tampons) ; le cliquet C relève `+ outil.icone +` s'il redevient brut.
});
