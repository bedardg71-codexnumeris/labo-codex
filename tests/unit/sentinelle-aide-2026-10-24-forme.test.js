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
// ↻ #1152, lot 2a (27 oct. 2026) : Commencer et Cadre prennent leur forme finale (audit du 24 oct., verdicts finals ;
// remesure du 27 oct. ; consigne CONSIGNE-LOT-2026-10-27-aide-lot-2a-commencer-cadre.md, §2). Quatre entrées
// absorbées par décision (modes-formation dans modes, fusion confirmée par Grégoire le 24 oct. à 18 h 25 ;
// trimestre et groupe-cours dans etapes-config ; groupe dans etudiants), deux neuves (bibliotheque, chaines-etapes).
// Leur détail est vérifié par sentinelle-aide-2026-10-27-lot-2a.test.js.
const ABSORBEES_2A = ['modes-formation', 'trimestre', 'groupe-cours', 'groupe'];
const NEUVES_2A = ['bibliotheque', 'chaines-etapes'];
// ↻ #1152, lot 2b (27 oct. 2026) : la Conception prend sa forme finale (audit du 24 oct., verdict final de `solo` et
// `idme` : « Fusionner », ~150 mots pour les deux ; remesure du 27 oct. ; consigne
// CONSIGNE-LOT-2026-10-27-aide-lot-2b-conception.md, §2, entrée 9). `idme` est absorbée par `solo`. Le détail est
// vérifié par sentinelle-aide-2026-10-27-lot-2b.test.js.
const ABSORBEES_2B = ['idme'];
// ↻ #1152, lot 2c (28 oct. 2026) : l'Évaluation prend sa forme finale (audit du 24 oct., verdict final
// d'`evaluer-productions` : « Fusionner dans « Annoter et évaluer un travail » » ; remesure du 27 oct., geste neuf n° 7 ;
// consigne CONSIGNE-LOT-2026-10-28-aide-lot-2c-evaluation.md, §2, entrées 1 et 3). `evaluer-productions` est absorbée
// par `annoter-evaluer` ; la Liste des évaluations, sans entrée, en reçoit une, `liste-evaluations`, deuxième, dans l'ordre des
// sous-onglets de js/config.js (verdict de relecture du 28 oct., retouche 1). Le détail
// est vérifié par sentinelle-aide-2026-10-28-lot-2c.test.js.
const ABSORBEES_2C = ['evaluer-productions'];
const NEUVES_2C = ['liste-evaluations'];
// ↻ #1152, lot 2c bis (28 oct. 2026) : le Suivi prend sa forme finale (audit du 24 oct., verdicts finals de `guide-profil`
// et `rai-absences` : « Fusionner » ; remesure du 27 oct., section Suivi ; consigne CONSIGNE-LOT-2026-10-28-aide-lot-2c-bis-suivi.md,
// §1 et §2, entrées 3 et 9). `guide-profil` est absorbée par `profil-etudiant`, `rai-absences` par `planifier-rai`. L'ordre est
// celui des sous-onglets de js/config.js ; une entrée qui explique un calcul se range à côté de l'écran qui l'affiche. Le
// détail est vérifié par sentinelle-aide-2026-10-28-lot-2c-bis.test.js.
const ABSORBEES_2C_BIS = ['guide-profil', 'rai-absences'];
// ↻ #1152, lot 2d (28 oct. 2026) : le Labo, Codex et archives et la Référence prennent leur forme finale (audit du 24 oct.,
// verdicts finals de `modelisation` : « Fusionner avec « Labo — Analyser ta démarche pédagogique » », et de `criteres` :
// « Fusionner dans « 5b. Configurer la grille de critères pour le dépistage » » ; remesure du 27 oct. ; consigne
// CONSIGNE-LOT-2026-10-28-aide-lot-2d-labo-codex-reference.md, §2, entrées 1 et 3). `modelisation` est absorbée par `labo`,
// `criteres` par `grille-depistage`. L'ordre du Labo : la vue d'ensemble, puis les entrées dans l'ordre des sous-onglets de
// js/config.js, chacune à côté de l'écran qui porte son réglage (Outils d'observation : `rai-solo`, `grille-depistage` ;
// Exploration des pratiques : `pan` ; Bilan réflexif). Le détail est vérifié par sentinelle-aide-2026-10-28-lot-2d.test.js.
const ABSORBEES_2D = ['modelisation', 'criteres'];
const PLACES = {
    commencer: ['presentation', 'prise-en-main', 'demo', 'modes', 'bibliotheque', 'chaines-etapes', 'preferences'],
    cadre: ['etapes-config', 'cours', 'horaire', 'etudiants', 'presences-calendrier', 'archivage'],
    conception: ['pratique', 'creer-productions', 'lecons', 'creer-grilles', 'apporter-grille', 'bareme', 'sous-criteres', 'creer-echelles', 'solo', 'creer-cartouches'],
    evaluation: ['preparer-importer', 'liste-evaluations', 'annoter-evaluer', 'jetons-reprise', 'irrecevables', 'exporter-archiver'],
    suivi: ['tableau-bord', 'acp', 'suivi-apprentissage', 'snapshots', 'saisie-presences', 'profil-etudiant', 'diagnostics', 'rai', 'patterns', 'planifier-rai', 'tirage-sort'],
    labo: ['labo', 'rai-solo', 'grille-depistage', 'pan', 'bilan-reflexif'],
    'codex-archives': ['codex', 'export-import', 'partage', 'collaboration'],
    reference: ['glossaire', 'glossaire-statique', 'faq', 'problemes', 'ressources'],
};
const GARDEES = Object.values(PLACES).flat();

describe('#1152 lot 1 · la forme de l\'Aide', () => {
    it('les sources se lisent : huit onglets ; 75 entrées à l\'audit, 14 coupées, 61 rangées ; au lot 2a, 4 absorbées et 2 neuves ; au lot 2b, 1 absorbée ; au lot 2c, 1 absorbée et 1 neuve ; au lot 2c bis, 2 absorbées ; au lot 2d, 2 absorbées', () => {
        expect(ONGLETS).toHaveLength(8);
        expect(Object.keys(PLACES)).toEqual(ONGLETS.map((o) => o.id));
        expect(COUPEES).toHaveLength(14);
        expect(GARDEES).toHaveLength(61 - ABSORBEES_2A.length + NEUVES_2A.length - ABSORBEES_2B.length - ABSORBEES_2C.length + NEUVES_2C.length - ABSORBEES_2C_BIS.length - ABSORBEES_2D.length);
        const NEUVES = [...NEUVES_2A, ...NEUVES_2C];
        expect(new Set([...COUPEES, ...GARDEES.filter((id) => !NEUVES.includes(id)), ...ABSORBEES_2A, ...ABSORBEES_2B, ...ABSORBEES_2C, ...ABSORBEES_2C_BIS, ...ABSORBEES_2D]).size).toBe(75);
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
    // ↻ #1152, lot 2a : la ligne « Mesure d'aide » de `groupe` est passée dans `etudiants`, qui l'absorbe.
    it('etudiants (qui absorbe groupe) : plus de phrase sur l\'ancienne colonne « CAF » (intention 2.92, non faite)', () => {
        const t = texte(carte('etudiants'));
        expect(t).toContain('Mesure d\'aide');
        expect(t).not.toMatch(/CAF/);
        expect(t).not.toMatch(/restent lisibles/);
    });
    // ↻ #1152, lot 2c bis (28 oct. 2026) : `rai-absences` est absorbée par `planifier-rai`, qui n'en garde que la case de report
    // (audit du 24 oct., verdict final ; consigne CONSIGNE-LOT-2026-10-28-aide-lot-2c-bis-suivi.md, §2, entrée 9). Le retrait
    // se vérifie donc dans l'entrée qui l'absorbe, et l'entrée dit désormais le contraire, comme l'écran.
    it('planifier-rai (qui absorbe rai-absences) : plus de promesse que les présences suivent toute modification (intention 7.65, non faite)', () => {
        expect(carte('rai-absences')).toBeNull();
        const t = texte(carte('planifier-rai'));
        expect(t).not.toMatch(/se propagent automatiquement aux présences/);
        expect(t).toContain('Le report se fait une seule fois.');
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
