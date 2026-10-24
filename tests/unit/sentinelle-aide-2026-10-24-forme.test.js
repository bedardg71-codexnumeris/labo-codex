import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// SENTINELLE — #1152, lot 1 de la refonte de l'Aide (24 oct. 2026) : couper et ranger.
// Audit : plans de travail/audit-aide-2026-10-24/AUDIT-AIDE-2026-10-24.md (décisions de Grégoire, 18 h 24-18 h 25).
// Consigne : plans de travail/CONSIGNE-LOT-2026-10-24-aide-lot-1-couper-et-ranger.md.
//
// Ce que le banc confronte :
//   · les huit sous-sections de la page ⟷ le tableau 'aide' de js/config.js (lu, pas recopié) ;
//   · les entrées de la page ⟷ la DÉCISION de l'audit (coupe et place de chaque entrée), écrite ci-dessous.
//     Elle ne peut pas être lue au fichier : `plans de travail/**` est dans le `paths-ignore` de la CI, et
//     sentinelle-ci-paths-ignore interdit à un test d'y lire (un commit de docs n'y lancerait pas le banc) ;
//   · les noms d'exemple d'avant ne sont écrits nulle part : seule leur empreinte sha256 l'est (D10).

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');
const html = readFileSync(path.join(racine, 'index.html'), 'utf8');
const cfg = readFileSync(path.join(racine, 'js/config.js'), 'utf8');
const popup = readFileSync(path.join(racine, 'js/accompagnement-contenu-popup.js'), 'utf8');

const DEB = html.indexOf('<section id="section-aide"');
const FIN = html.indexOf('fin section-aide');
if (DEB === -1 || FIN === -1) throw new Error('bornes de la section Aide introuvables');
// Les commentaires HTML datés qui remplacent les passages retirés disent pourquoi : ils ne comptent pas comme texte.
const AIDE = html.slice(DEB, FIN).replace(/<!--[\s\S]*?-->/g, '');

const decoder = (s) => s.replace(/&nbsp;/g, ' ').replace(/&eacute;/g, 'é').replace(/&rsquo;/g, '’').replace(/&amp;/g, '&');
const texte = (s) => decoder(s.replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim();

/** Le bloc d'un élément <div> ouvert à `debut`, jusqu'à sa balise fermante. */
function blocDiv(source, debut) {
    const re = /<div\b|<\/div>/g;
    re.lastIndex = debut;
    let profondeur = 0;
    let m;
    while ((m = re.exec(source))) {
        profondeur += m[0] === '</div>' ? -1 : 1;
        if (profondeur === 0) return source.slice(debut, re.lastIndex);
    }
    throw new Error('div non fermé');
}
function carte(id) {
    const i = AIDE.indexOf(`id="accordeon-aide-${id}"`);
    if (i === -1) return null;
    return blocDiv(AIDE, AIDE.lastIndexOf('<div', i));
}

// Côté code : le tableau 'aide' de configurationsOnglets.
const blocCfg = cfg.match(/'aide':\s*\[([\s\S]*?)\]/);
if (!blocCfg) throw new Error("tableau 'aide' introuvable dans config.js");
const ONGLETS = [...blocCfg[1].matchAll(/\{\s*id:\s*'([^']+)',\s*label:\s*'([^']+)'\s*\}/g)].map((m) => ({ id: m[1], label: m[2] }));

// Côté page : les sous-sections de la section Aide, dans l'ordre.
const SOUS_SECTIONS = [...AIDE.matchAll(/<div id="([^"]+)" class="sous-section">/g)].map((m) => {
    const bloc = blocDiv(AIDE, m.index);
    const h2 = bloc.match(/<h2>([\s\S]*?)<\/h2>/);
    return { id: m[1], h2: h2 ? texte(h2[1]) : null, bloc };
});

// La décision : AUDIT-AIDE-2026-10-24.md, colonne « Place dans la nouvelle forme » (D9, D11 ; 74 accords
// explicites de Grégoire), dans l'ordre que fixe la consigne du lot 1 (§3, §4). Clés : les ids de config.js.
const COUPEES = ['monitorage', 'srpnf', 'ssot', 'checklist', 'parcours', 'validation-grille', 'flux-travail',
    'gerer-jetons', 'verification-hebdo', 'temps-estimes', 'presences-apercu', 'seuils-critiques', 'architecture', 'apropos'];
const PLACES = {
    commencer: ['presentation', 'prise-en-main', 'demo', 'modes', 'modes-formation', 'preferences'],
    cadre: ['etapes-config', 'trimestre', 'groupe-cours', 'cours', 'horaire', 'groupe', 'etudiants', 'presences-calendrier', 'archivage'],
    conception: ['pratique', 'creer-productions', 'lecons', 'creer-grilles', 'apporter-grille', 'bareme', 'sous-criteres', 'creer-echelles', 'solo', 'idme', 'creer-cartouches'],
    evaluation: ['preparer-importer', 'annoter-evaluer', 'evaluer-productions', 'jetons-reprise', 'irrecevables', 'exporter-archiver'],
    suivi: ['saisie-presences', 'tableau-bord', 'profil-etudiant', 'guide-profil', 'acp', 'diagnostics', 'rai', 'suivi-apprentissage', 'patterns', 'planifier-rai', 'rai-absences', 'snapshots', 'tirage-sort'],
    labo: ['labo', 'modelisation', 'pan', 'grille-depistage', 'criteres', 'rai-solo', 'bilan-reflexif'],
    'codex-archives': ['codex', 'export-import', 'partage', 'collaboration'],
    reference: ['glossaire', 'glossaire-statique', 'faq', 'problemes', 'ressources'],
};
const GARDEES = Object.values(PLACES).flat();

describe('#1152 lot 1 · la forme de l\'Aide', () => {
    it('les sources se lisent : huit onglets ; 75 entrées à l\'audit, 14 coupées et 61 rangées, chacune une fois', () => {
        expect(ONGLETS).toHaveLength(8);
        expect(Object.keys(PLACES)).toEqual(ONGLETS.map((o) => o.id));
        expect(COUPEES).toHaveLength(14);
        expect(GARDEES).toHaveLength(61);
        expect(new Set([...COUPEES, ...GARDEES]).size).toBe(75);
    });

    it('les huit sous-sections, dans l\'ordre, ont les ids et les titres du tableau \'aide\' de config.js', () => {
        expect(SOUS_SECTIONS.map((s) => ({ id: s.id, h2: s.h2 }))).toEqual(ONGLETS.map((o) => ({ id: `aide-${o.id}`, h2: o.label })));
    });

    it('aucune des quatorze entrées coupées n\'existe', () => {
        expect(COUPEES.filter((id) => html.includes(`accordeon-aide-${id}"`))).toEqual([]);
    });

    it('chaque sous-section porte ses entrées, dans l\'ordre de la décision, et rien d\'autre', () => {
        const trouve = Object.fromEntries(SOUS_SECTIONS.map((s) => [s.id.replace(/^aide-/, ''),
            [...s.bloc.matchAll(/id="accordeon-aide-([a-z0-9-]+)"/g)].map((m) => m[1])]));
        expect(trouve).toEqual(PLACES);
        expect((AIDE.match(/id="accordeon-aide-/g) || []).length).toBe(GARDEES.length);
    });

    it('aucun titre d\'entrée ne commence par un chiffre', () => {
        const titres = [...AIDE.matchAll(/<h3 class="carte-titre-bleu">([\s\S]*?)<\/h3>/g)].map((m) => texte(m[1]).replace(/^[▼▶]\s*/, ''));
        expect(titres.length).toBe(GARDEES.length);
        expect(titres.filter((t) => /^\d/.test(t))).toEqual([]);
    });

    it('seule « Présentation de l\'application » est ouverte par défaut', () => {
        const ouvertes = [...AIDE.matchAll(/<div class="carte accordeon ouvert[^"]*" id="accordeon-aide-([a-z0-9-]+)"/g)].map((m) => m[1]);
        expect(ouvertes).toEqual(['presentation']);
        expect((AIDE.match(/<div class="accordeon-contenu" style="display: block;">/g) || []).length).toBe(1);
    });

    it('Référence se termine par le renvoi à Réglages › À propos, et cet écran existe', () => {
        const ref = SOUS_SECTIONS.find((s) => s.id === 'aide-reference');
        expect(texte(ref.bloc)).toMatch(/sont dans Réglages › À propos\.$/);
        expect(html).toContain('<div id="reglages-a-propos" class="sous-section">');
    });
});

describe('#1152 lot 1 · les quatre retraits (§5) : motifs mesurés au texte d\'avant (35745bd et dc39bff2)', () => {
    it('groupe : plus de phrase sur l\'ancienne colonne « CAF » (intention 2.92, non faite)', () => {
        const t = texte(carte('groupe'));
        expect(t).not.toMatch(/CAF/);
        expect(t).not.toMatch(/restent lisibles/);
    });
    it('rai-absences : plus de promesse que les présences suivent toute modification (intention 7.65, non faite)', () => {
        expect(texte(carte('rai-absences'))).not.toMatch(/se propagent automatiquement aux présences/);
    });
    it('bilan-reflexif : plus de partie « Importer les résultats » tant que #1054 n\'est pas corrigée', () => {
        const t = texte(carte('bilan-reflexif'));
        expect(t).not.toMatch(/Importer les résultats/);
        expect(t).not.toMatch(/Mapping intelligent des colonnes/);
    });
    it('lecons : plus de suppression d\'un bloc par la corbeille tant que #1070 n\'est pas corrigée', () => {
        expect(texte(carte('lecons'))).not.toMatch(/corbeille/i);
    });
});

describe('#1152 lot 1 · les décisions de mots de Grégoire (24 oct., 18 h 24)', () => {
    it('D8 : la FAQ ne propose plus le courriel pour transférer le codex', () => {
        const ligne = texte(carte('faq')).match(/Transférer le fichier codex[^)]*\)/);
        expect(ligne).toBeTruthy();
        expect(ligne[0]).not.toMatch(/courriel|e-?mail/i);
    });

    // D10 : empreintes sha256 des noms d'exemple d'avant (snapshots, collaboration, popup « evaluations-annoter »).
    // Les noms eux-mêmes ne s'écrivent ni ici, ni dans un commit, ni dans un rapport.
    const EMPREINTES_NOMS_D_AVANT = [
        'b9bae658d96579857efe22dee62673a31355446ddc6ad270ec046aa8c717081c',
        '48b85821317182bd2dc61dc0a04560ac7e1deaf11498b0c854aa14fdd282aad5',
        'beebb980d54602ca322a62e077961ced3ea8e051cb8bb4913ed08ece2a1d3f98',
        'ba64eb8b058be189e48d4a3c1ab731a06b5ed0988352a9df8fd6ea27c6b43edd',
        '54619ab96ecfa193e087ad2360567000c6f4672d5de931e2786cb394348891e2',
        '56ec4fee9f20de343a99f2caa8793dadb6c8fbeebeed0f124e397d660112245c',
        '2dfd1adb4ef333071a943da8370b46d424f7148249c6b8bcd94a240990b3e681',
        '3bde3a5999601d8fa7b6bcc6bfdd2ee6a9fb473043d9768fbf8274b5936ef4d2',
        'e4d423695be7e675830671cc52caba3f7ae271137fc1bbe60bf52968f11122ad',
    ];
    const empreintes = (source) => new Set(source.normalize('NFC').split(/[^\p{L}]+/u).filter(Boolean)
        .map((mot) => createHash('sha256').update(mot).digest('hex')));
    // La fiche « evaluations-annoter » seule, jusqu'à la clé suivante, sans ses commentaires de code.
    const debutPopup = popup.indexOf("\n    'evaluations-annoter': {");
    const finPopup = popup.slice(debutPopup + 1).search(/\n    '[a-z-]+': \{/) + debutPopup + 1;
    const fichePopup = popup.slice(debutPopup, finPopup).replace(/\/\/[^\n]*/g, '');

    it('D10 : aucun nom d\'exemple d\'avant ne reste dans les trois exemples', () => {
        expect(debutPopup).toBeGreaterThan(-1);
        expect(fichePopup).toContain('Formats de noms reconnus');
        const surfaces = {
            snapshots: texte(carte('snapshots')),
            collaboration: texte(carte('collaboration')),
            'popup evaluations-annoter': fichePopup,
        };
        for (const [nom, source] of Object.entries(surfaces)) {
            const presentes = EMPREINTES_NOMS_D_AVANT.filter((h) => empreintes(source).has(h));
            expect(presentes, nom).toEqual([]);
        }
    });
});
