import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

// SENTINELLE — #1152, lot 5 de la refonte de l'Aide (29 oct. 2026) : les textes d'écran qui contredisaient le code.
// Consigne : plans de travail/CONSIGNE-LOT-2026-10-28-aide-lot-5-textes-d-ecran.md (§3).
// Textes : plans de travail/TEXTES-2026-10-28-textes-d-ecran.md, validés par Grégoire le 28 oct., un à un.
//
// Ce que le banc confronte, calculé des deux côtés :
//   · chaque texte validé, LU dans le fichier TEXTES (jamais recopié ici) ⟷ le fichier où il doit paraître ;
//   · les mots retirés ⟷ les écrans (js/ hors des Nouvelles publiées, index.html hors des commentaires) ;
//   · la licence du nom des fichiers partagés ⟷ `partageSchemas.LICENCE` (js/partage-schemas.js) ;
//   · l'exemple de nom de fichier de l'aide d'Annoter et évaluer ⟷ ce que l'import en lit (parserNomFichierLea) ;
//   · le soulignement du glossaire ⟷ les mots entiers.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');
const lire = (...p) => readFileSync(path.join(racine, ...p), 'utf8');
const TEXTES = lire('plans de travail', 'TEXTES-2026-10-28-textes-d-ecran.md');

// Le même texte, qu'il soit en Markdown (TEXTES), en HTML ou dans une chaîne JS : gras, balises, entités, échappements
// et insécables ramenés ; apostrophes typographiques unifiées.
const net = (s) => String(s)
    .replace(/\\u([0-9a-fA-F]{4})/g, (_, h) => String.fromCharCode(parseInt(h, 16)))
    .replace(/\\'/g, '\'')
    .replace(/&nbsp;/g, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/\*\*/g, '')
    .replace(/[’‘]/g, '\'')
    .replace(/[  ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

/** La section « ## n. » du fichier TEXTES, jusqu'à la suivante. */
function section(n) {
    const debut = TEXTES.indexOf(`\n## ${n}. `);
    expect(debut, `section ${n} de TEXTES`).toBeGreaterThan(-1);
    const fin = TEXTES.indexOf('\n## ', debut + 5);
    return TEXTES.slice(debut, fin === -1 ? undefined : fin);
}
/** Les citations « > … » d'une section : chacune est un texte validé. */
const citations = (n) => section(n).split('\n').filter((l) => l.startsWith('> ')).map((l) => l.slice(2));

const contient = (fichier, texte) => expect(net(lire(fichier)), `${fichier} : « ${texte} »`).toContain(net(texte));

describe('#1152, lot 5 — chaque texte validé paraît mot pour mot à sa place, lu dans TEXTES', () => {
    it('le fichier TEXTES porte bien les validations de Grégoire', () => {
        for (const n of [1, 2, 3, 4, 5, 7, 8, 9, 10, 11, 12, 13, 15, 16]) {
            expect(section(n), `n° ${n}`).toMatch(/✅ \*\*Validé par Grégoire le 28 oct\. 2026/);
        }
        expect(section(14)).toMatch(/✅ \*\*Décidé par Grégoire le 28 oct\. 2026/);
    });

    it('n° 1, 2, 8, 15 : les notes d\'index.html', () => {
        for (const n of [1, 2, 8, 15]) {
            expect(citations(n), `n° ${n}`).toHaveLength(1);
            contient('index.html', citations(n)[0]);
        }
    });

    it('n° 3 : « Exporter ma config », sous le bouton et dans sa bulle', () => {
        const [texte] = citations(3);
        contient('index.html', texte);
        contient('js/accompagnement-contenu-hover.js', texte);
    });

    it('n° 4 : le paragraphe multi-pages de l\'Aide, recopié dans l\'aide « i » d\'Annoter et évaluer', () => {
        const [texte] = citations(4);
        contient('js/accompagnement-contenu-popup.js', texte);
        expect(section(4)).toContain('(plusieurs pages : -p1, -p2…)');
        contient('js/accompagnement-contenu-popup.js', '(plusieurs pages : -p1, -p2…)');
    });

    it('n° 5 : la section Accompagnement du profil', () => {
        const [texte] = citations(5);
        contient('js/profil-etudiant-sections-affichage.js', texte);
        const neuf = section(5).match(/devient « (\(clique sur « \+ Nouvelle intervention »\)) »/)[1];
        contient('js/profil-etudiant-sections-affichage.js', neuf);
    });

    it('n° 7 : l\'aide « i » des grilles, ses deux sections', () => {
        expect(citations(7)).toHaveLength(2);
        for (const texte of citations(7)) contient('js/accompagnement-contenu-popup.js', texte);
    });

    it('n° 9 : les huit bulles du Labo et de l\'Animation, et les deux lignes de js/navigation.js', () => {
        const bulles = section(9).split('\n').filter((l) => /^- (`nav-|\*\*neuve\*\*)/.test(l)).map((l) => l.match(/ : « (.*) »$/)[1]);
        expect(bulles).toHaveLength(8);
        for (const b of bulles) contient('js/accompagnement-contenu-hover.js', b);
        const nav = lire('js/navigation.js');
        expect(nav).toMatch(/'labo-comparateur': 'nav-labo-comparateur'/);
        expect(nav).toMatch(/'labo-longitudinal': 'nav-labo-longitudinal'/);
        const hover = lire('js/accompagnement-contenu-hover.js');
        expect(hover).toMatch(/'nav-labo-comparateur':/);
        expect(hover).toMatch(/'nav-labo-longitudinal':/);
    });

    it('n° 10 : le nom des fichiers partagés porte la licence réelle, celle de partage-schemas.js', () => {
        const [texte] = citations(10);
        const licence = lire('js/partage-schemas.js').match(/partageSchemas\.LICENCE = '([^']+)'/)[1];
        expect(licence.replace(/ \d+(\.\d+)?$/, '').replace(/ /g, '-')).toBe(texte);
        expect(lire('js/cc-license.js')).toContain(`parties.push('${texte}')`);
    });

    it('n° 11 : l\'introduction des cas, sans la phrase du nom court, le reste intact', () => {
        const atelier = net(lire('js/atelier-algo.js'));
        expect(atelier).toContain(net('L’étudiant·e lit le cas de sa copie sous le critère, après le décompte. Un verdict sans bloc est précédé de la moyenne, sauf au premier cas'));
    });

    it('n° 12, 13, 14, 16 : le bouton, le menu de l\'import, les niveaux RàI, l\'Objectif visé', () => {
        contient('js/materiel.js', citations(12)[0]);
        contient('js/travaux-ui.js', citations(13)[0]);
        const libelle = section(13).match(/« Modifier » devient « ([^»]+) »/)[1];
        contient('js/travaux-ui.js', `<label>${libelle}</label>`);
        contient('js/travaux-ui.js', '<label>Étudiant·e</label>');
        expect(citations(14)).toHaveLength(2);
        // La chaîne ENTIÈRE, entre ses apostrophes : « individuelle » contiendrait « individuel ».
        for (const niveau of citations(14)) expect(lire('js/interventions.js'), niveau).toContain(`'${niveau}'`);
        contient('js/accompagnement-contenu-hover.js', 'universel, préventif, intensif');
        contient('js/accompagnement-contenu-popup.js', citations(16)[0]);
        contient('js/accompagnement-contenu-popup.js', 'Coche les étudiant·es concerné·es');
    });

    it('l\'Aide recopie les libellés neufs (planifier-rai, apporter-grille, l\'import des jetons)', () => {
        for (const niveau of citations(14)) contient('index.html', niveau);
        contient('index.html', `« ${citations(12)[0]} », à côté de « Coller une autre grille »`);
        contient('index.html', '« Jeton de reprise » dans le menu « Production de ce fichier »');
    });
});

describe('#1152, lot 5 — les mots retirés ne sont plus à l\'écran', () => {
    // js/ sans les Nouvelles publiées (un historique) ; index.html sans ses commentaires (l'historique des jetons).
    const ecrans = readdirSync(path.join(racine, 'js')).filter((f) => f.endsWith('.js') && f !== 'changelog-data.js')
        .map((f) => [`js/${f}`, lire('js', f)])
        .concat([['index.html', lire('index.html').replace(/<!--[\s\S]*?-->/g, '')]]);
    // « verrouillées une fois finalisées » : la note de l'écran des grilles (texte n° 2) ; la même promesse sur les cartouches
    // (aide « i », js/accompagnement-contenu-popup.js) est hors du lot : proposée à Grégoire dans la demande de relecture.
    it('« verrouillées une fois finalisées » (la note des grilles)', () => {
        expect(lire('index.html')).not.toContain('verrouillées une fois finalisées');
    });
    const RETIRES = ['Triple confirmation', 'ZIP léger', 'Artefact-8a', 'Indicateurs de risque',
        'Points carrés', 'CC-BY-SA', 'nom court s’imprime', 'Revenir à ma dissection', 'celle-ci a eu un effet', 'Suggestion automatique'];
    for (const mot of RETIRES) {
        it(`« ${mot} »`, () => {
            const ou = ecrans.filter(([, src]) => src.includes(mot)).map(([f]) => f);
            expect(ou, `« ${mot} » paraît encore`).toEqual([]);
        });
    }
});

describe('#1152, retouche du lot 5 (verdict du 29 oct., VERDICT-RELECTURE-2026-10-29-aide-lot-5.md)', () => {
    const ecrans = readdirSync(path.join(racine, 'js')).filter((f) => f.endsWith('.js') && f !== 'changelog-data.js')
        .map((f) => [`js/${f}`, lire('js', f).replace(/\/\*[\s\S]*?\*\//g, '')])
        .concat([['index.html', lire('index.html').replace(/<!--[\s\S]*?-->/g, '')]])
        // Les lignes de commentaire ne s'affichent pas : elles peuvent garder l'ancien nom.
        .map(([f, src]) => [f, src.split('\n').filter((l) => !/^\s*(\/\/|\*|\/\*)/.test(l)).join('\n')]);
    // Le mot entier : « cellule comparateur » (une classe CSS) ne contient pas « le comparateur ».
    const ou = (mot) => {
        const motif = new RegExp('(?<![\\p{L}\\p{N}_-])' + mot.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'u');
        return ecrans.filter(([, src]) => motif.test(src)).map(([f]) => f);
    };
    // « le comparateur » nommait l'écran ; la reprise ciblée, offerte comme un jeton qu'on accorde ; la cartouche
    // verrouillée (champ inerte) ; le HEIC sans réserve. Restent : ce qui nomme une reprise ciblée déjà faite.
    for (const mot of ['Le comparateur', 'le comparateur', 'Labo → Comparateur', 'Reprise (refaire la production) ou Reprise ciblée', 'reprise, reprise ciblée',
        '(ex. : reprise ciblée)', 'jeton de reprise ciblée)', 'Modifiez uniquement', 'cartouches peuvent être verrouillées', 'PNG ou HEIC']) {
        it(`« ${mot} » n'est plus à l'écran`, () => expect(ou(mot), mot).toEqual([]));
    }
    it('ce qui nomme une reprise ciblée déjà faite reste (bulles des types de jetons, badge de la Liste)', () => {
        contient('js/accompagnement-contenu-hover.js', 'Délai (orange), Reprise (vert) ou Reprise ciblée (violet).');
        contient('js/liste-evaluations.js', '<span class="badge-jeton-titre">Reprise ciblée</span>');
    });
    it('n° 9 : la Modélisation dit « HEIC selon le navigateur », dans la bulle (lue dans TEXTES), au bouton et dans l\'Aide', () => {
        const bulle = section(9).split('\n').find((l) => l.startsWith('- `nav-labo-modelisation`')).match(/ : « (.*) »$/)[1];
        expect(bulle).toContain('HEIC selon le navigateur');
        contient('js/accompagnement-contenu-hover.js', bulle);
        expect(lire('js/modelisation.js')).toContain('title="Ouvrir un fichier : PDF, JPG, PNG ; HEIC selon le navigateur"');
        contient('index.html', '(PDF, JPG, PNG ; HEIC selon le navigateur), que tu projettes');
    });
});

describe('#1152, lot 5 — les mesures', () => {
    it('n° 4 : l\'exemple de l\'aide est un nom que l\'import lit (production « Artefact-8 », page 1)', () => {
        const popup = lire('js/accompagnement-contenu-popup.js');
        const exemple = popup.match(/« (Essai_1234567_Artefact-8-p1[^»]*) »/)[1];
        const win = chargerScript('js/travaux-import.js', {});
        const r = win.travauxImport.parserNomFichierLea(exemple);
        expect(r.da).toBe('1234567');
        expect(r.nomProduction).toBe('Artefact-8');
        expect(r.page).toBe(1);
    });

    it('le glossaire souligne aux mots entiers : ni « critère » dans « critères », ni « cours » dans « parcours »', () => {
        // Les trois fonctions VRAIES de js/accompagnement.js (non exportées), découpées du source, sur un glossaire de banc.
        const src = lire('js/accompagnement.js');
        const fn = (nom) => { const i = src.indexOf(`function ${nom}(`); expect(i, nom).toBeGreaterThan(-1); return src.slice(i, src.indexOf('\n}\n', i) + 2); };
        const dict = { critere: { terme: 'Critère' }, cours: { terme: 'Cours' }, 'groupe-cours': { terme: 'Groupe-cours' } };
        const enrichir = new Function('glossaireDict', `let _regexEnrichissement = null;\n${fn('regexEnrichissement')}\n${fn('trouverCleParTerme')}\n${fn('enrichirTermesGlossaire')}\nreturn enrichirTermesGlossaire;`)(() => dict);
        expect(enrichir('Les critères de ton parcours.')).toBe('Les critères de ton parcours.');
        const r = enrichir('Un critère, à l’écran ; et ton cours.');
        expect(r).toContain('<span class="glossaire-terme" data-glossaire="critere" role="button" tabindex="0">critère</span>');
        expect(r).toContain('<span class="glossaire-terme" data-glossaire="cours" role="button" tabindex="0">cours</span>');
        expect(r.startsWith('Un <span')).toBe(true);
        // Sur le glossaire RÉEL (tous ses termes, traits d'union et parenthèses compris), la regex se construit.
        const glossaire = lire('js/accompagnement-contenu-terme.js');
        const reel = {};
        for (const m of glossaire.matchAll(/cle: '([^']+)',\s*\n\s*terme: '((?:[^'\\]|\\.)+)'/g)) reel[m[1]] = { terme: m[2].replace(/\\'/g, '\'') };
        expect(Object.keys(reel).length).toBeGreaterThan(50);
        const surReel = new Function('glossaireDict', `let _regexEnrichissement = null;\n${fn('regexEnrichissement')}\n${fn('trouverCleParTerme')}\n${fn('enrichirTermesGlossaire')}\nreturn enrichirTermesGlossaire;`)(() => reel);
        expect(surReel('Un groupe-cours et ses critères.')).toContain('data-glossaire="groupe-cours"');
    });
});
