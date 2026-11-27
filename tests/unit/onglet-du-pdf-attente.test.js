/**
 * FICHE 7 DU LOT « ÉVALUATION » (décision de Grégoire, 22 nov. 2026, 14 h 21 ; relayée le 27 nov.) — L'EXPORT D'UN SEUL
 * PDF S'OUVRE SANS PRÉVENIR.
 *
 * Vécu sur l'iPad le 22 nov. : « Exporter pour Léa », une seule évaluation prête, ouvre le PDF dans un nouvel onglet
 * (décision du 20 nov., gardée) ; l'onglet passe devant, à `about:blank`, page nue, avec pour seul texte « Préparation
 * des PDF : ça peut prendre un moment. », puis devient le PDF. Il a cru « sortir de l'application ».
 * Décidé, textes acceptés :
 *   · la page d'attente du nouvel onglet est habillée, aux couleurs de l'application (sombre et clair), et dit
 *     « Labo Codex prépare la rétroaction de [Prénom Nom]. Le PDF s'affichera ici. Pour revenir à l'application, ferme
 *     cet onglet. » ([Prénom Nom] : ce que l'écran affiche pour cette personne, anonymisé en anonymisation) ;
 *   · sous « Exporter pour Léa », quand une seule évaluation est prête : « Un seul PDF : il s'ouvrira dans un nouvel
 *     onglet. »
 * Pas de script dans l'onglet (CSP `script-src 'self'`) : l'application l'habille d'ici, par le DOM, avec les couleurs
 * qu'elle affiche à cet instant. Les exports d'une rétroaction en un seul PDF passent par le même chemin. Noms fictifs.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { JSDOM } from 'jsdom';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';
import { tranche } from './_helpers/tranche.js';

const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const ATTENTE = (nom) => `Labo Codex prépare la rétroaction de ${nom}. Le PDF s'affichera ici. Pour revenir à l'application, ferme cet onglet.`;
const UN_SEUL_PDF = 'Un seul PDF : il s\'ouvrira dans un nouvel onglet.';

const SOMBRE = { '--surface-page': '#0c1a22', '--surface-carte': '#1a3040', '--texte-principal': '#d0e0e4', '--texte-muted': '#80a0b0', '--accent-primaire': '#6aacb8', '--bordure-moyenne': 'rgba(106, 172, 184, 0.35)' };
const CLAIR = { '--surface-page': '#d4e6f5', '--surface-carte': '#ffffff', '--texte-principal': '#1a1a2e', '--texte-muted': '#636374', '--accent-primaire': '#065dbb', '--bordure-moyenne': 'rgba(3, 46, 92, 0.12)' };

const ELEVES_REELS = [{ da: '2300001', nom: 'Fictifun', prenom: 'Ana' }, { da: '2300002', nom: 'Fictifdeux', prenom: 'Bea' }];
const ELEVES_ANONYMES = [{ da: '2300001', nom: '', prenom: 'Élève 3' }, { da: '2300002', nom: '', prenom: 'Élève 7' }];

let ouverts, telecharges, win;

/** Un onglet ouvert par `window.open('', '_blank')` : un vrai document vide (jsdom), comme `about:blank`. */
function nouvelOnglet() {
    const dom = new JSDOM('<!doctype html><html><head></head><body></body></html>');
    const onglet = { document: dom.window.document, closed: false, location: { href: 'about:blank' }, close() { this.closed = true; } };
    ouverts.push(onglet);
    return onglet;
}

function monter({ eleves = ELEVES_REELS, clair = false, evaluations, fichiers = [], refuserOnglet = false } = {}) {
    ouverts = [];
    telecharges = [];
    const couleurs = clair ? CLAIR : SOMBRE;
    const evals = evaluations || [{ id: 'E1', etudiantDA: '2300001', productionId: 'P1', verrouillee: true }];
    const fauxWindow = {
        addEventListener: () => {}, removeEventListener: () => {}, dispatchEvent: () => {},
        dasElevesSupprimes: () => new Set(),
        open: () => (refuserOnglet ? null : nouvelOnglet()),
        getComputedStyle: () => ({ getPropertyValue: (v) => couleurs[v] || '', fontFamily: 'system-ui, sans-serif' })
    };
    const document = {
        body: { classList: { contains: (c) => c === 'mode-clair' && clair } },
        getElementById: () => null, querySelector: () => null, querySelectorAll: () => [],
        createElement: (t) => ({ tagName: t, click() { if (this.download) telecharges.push(this.download); }, style: {} }),
        addEventListener: () => {}, removeEventListener: () => {}
    };
    win = chargerScript('js/travaux-archivage.js', {
        db: { get: async () => null, getSync: (_k, d) => d, set: async () => {}, setSync: () => {} },
        cle: (k) => k,
        document,
        echapperHtml: (s) => String(s == null ? '' : s),
        obtenirDonneesSelonMode: (k) => ({ groupeEtudiants: eleves, evaluationsSauvegardees: evals, productions: [{ id: 'P1', titre: 'Analyse fictive' }] })[k] || [],
        obtenirEtudiantsCoursActif: () => eleves,
        sauvegarderDonneesSelonMode: () => true,
        obtenirTrimestreActif: () => null,
        requestAnimationFrame: (f) => f(),
        CustomEvent: function (type, init) { this.type = type; this.detail = init && init.detail; },
        travauxStockage: { obtenirFichiersGroupeActif: () => fichiers, obtenirFichiersAffiches: () => fichiers, obtenirCorbeille: () => [], obtenirAnnotationFichier: () => null },
        travauxResolution: { trouverFichierPourEvaluation: () => null },
        travauxExportPDF: {
            genererDocPDF: async () => ({ doc: { output: () => new Blob(['%PDF-1.4'], { type: 'application/pdf' }) }, synthese: { ajoutee: true } }),
            genererDocSyntheseSeule: async () => ({ doc: { output: () => new Blob(['%PDF-1.4'], { type: 'application/pdf' }) }, synthese: { ajoutee: true } })
        },
        alert: () => {},
        JSZip: function () { this.file = () => {}; this.generateAsync = async () => new Blob(['zip']); }
    }, fauxWindow);
    return win.travauxArchivage;
}

const paragraphes = (onglet) => [...onglet.document.querySelectorAll('p')].map((p) => p.textContent);

describe('fiche 7 — la page d\'attente de l\'onglet est habillée et dit ce qui se passe', () => {
    it('le texte validé par Grégoire, avec le prénom et le nom de la personne', () => {
        const onglet = monter().ongletDuPdf.ouvrir('2300001');
        expect(paragraphes(onglet).join(' ')).toBe(ATTENTE('Ana Fictifun'));
        expect(onglet.document.title).toBe('Rétroaction en PDF');
    });

    it('en anonymisation, le nom que l\'écran affiche (« Élève 3 »), jamais le nom réel', () => {
        const onglet = monter({ eleves: ELEVES_ANONYMES }).ongletDuPdf.ouvrir('2300001');
        expect(paragraphes(onglet).join(' ')).toBe(ATTENTE('Élève 3'));
        expect(onglet.document.body.textContent).not.toContain('Fictifun');
    });

    it('aux couleurs de l\'application : celles du thème sombre en sombre, du thème clair en clair', () => {
        const sombre = monter().ongletDuPdf.ouvrir('2300001');
        const clair = monter({ clair: true }).ongletDuPdf.ouvrir('2300001');
        const fond = (o) => o.document.body.style.background || o.document.body.style.backgroundColor;
        expect(fond(sombre)).toMatch(/#0c1a22|rgb\(12, 26, 34\)/);
        expect(fond(clair)).toMatch(/#d4e6f5|rgb\(212, 230, 245\)/);
        expect(sombre.document.body.style.color).toMatch(/#d0e0e4|rgb\(208, 224, 228\)/);
        expect(clair.document.body.style.color).toMatch(/#1a1a2e|rgb\(26, 26, 46\)/);
    });

    it('sans script, et lisible sur l\'iPad (la largeur de l\'appareil)', () => {
        const onglet = monter().ongletDuPdf.ouvrir('2300001');
        expect(onglet.document.querySelectorAll('script')).toHaveLength(0);
        const meta = onglet.document.querySelector('meta[name="viewport"]');
        expect(meta && meta.getAttribute('content')).toBe('width=device-width, initial-scale=1');
        expect(onglet.document.documentElement.getAttribute('lang')).toBe('fr');
    });

    it('un nom piégé reste du texte', () => {
        const onglet = monter({ eleves: [{ da: '2300001', prenom: '<img src=x onerror=alert(1)>', nom: 'Fictifun' }] }).ongletDuPdf.ouvrir('2300001');
        expect(onglet.document.querySelectorAll('img')).toHaveLength(0);
        expect(paragraphes(onglet)[0]).toContain('<img src=x onerror=alert(1)>');
    });

    it('le navigateur refuse l\'onglet : rien n\'est ouvert, l\'export retombe sur le téléchargement', async () => {
        const a = monter({ refuserOnglet: true });
        expect(a.ongletDuPdf.ouvrir('2300001')).toBeNull();
        await a.lancerExportLea('P1', '2300001', false);
        expect(telecharges).toEqual(['Fictifun_2300001_Analyse-fictive_Evalue.pdf']);
    });
});

describe('fiche 7 — « Exporter pour Léa » : l\'onglet s\'ouvre quand un seul PDF est annoncé', () => {
    const deux = [
        { id: 'E1', etudiantDA: '2300001', productionId: 'P1', verrouillee: true },
        { id: 'E2', etudiantDA: '2300002', productionId: 'P1', verrouillee: true }
    ];

    it('un·e étudiant·e choisi·e : l\'onglet, habillé à son nom, reçoit le PDF ; rien n\'est téléchargé', async () => {
        await monter().lancerExportLea('P1', '2300001', false);
        expect(ouverts).toHaveLength(1);
        expect(ouverts[0].location.href).toMatch(/^blob:/);
        expect(telecharges).toEqual([]);
    });

    it('« — Tous — » avec une seule évaluation prête : le même onglet (tout export d\'un seul PDF)', async () => {
        await monter().lancerExportLea('P1', null, false);
        expect(ouverts).toHaveLength(1);
        expect(paragraphes(ouverts[0]).join(' ')).toBe(ATTENTE('Ana Fictifun'));
        expect(ouverts[0].location.href).toMatch(/^blob:/);
        expect(telecharges).toEqual([]);
    });

    it('plusieurs PDF : aucun onglet, le ZIP est téléchargé', async () => {
        await monter({ evaluations: deux }).lancerExportLea('P1', null, false);
        expect(ouverts).toHaveLength(0);
        expect(telecharges).toHaveLength(1);
        expect(telecharges[0]).toMatch(/^Lea_Analyse-fictive_.*\.zip$/);
    });

    it('rien de prêt : aucun onglet ne s\'ouvre pour rien', async () => {
        await monter({ evaluations: [{ id: 'E1', etudiantDA: '2300001', productionId: 'P1', verrouillee: false }] }).lancerExportLea('P1', '2300001', false);
        expect(ouverts).toHaveLength(0);
    });
});

describe('fiche 7 — sous « Exporter pour Léa », la phrase d\'un seul PDF', () => {
    const source = readFileSync(path.join(RACINE, 'js/travaux-ui.js'), 'utf8');
    const corps = tranche(source, 'function mettreAJourCompteurLea() {', '    /**\n     * Charge et affiche les infos de quota', { longueurMin: 400 });
    function phrase(selection, { production = 'P1' } = {}) {
        const elements = {
            'travaux-lea-compteur': { textContent: '' },
            'travaux-lea-un-seul-pdf': { textContent: 'ancien' },
            'travaux-archivage-lea-production': { value: production },
            'travaux-archivage-lea-etudiant': { value: '' },
            'travaux-lea-reprises-seulement': { checked: false }
        };
        const document = { getElementById: (id) => elements[id] || null };
        const travauxArchivage = { selectionnerEvaluationsLea: () => selection };
        new Function('document', 'travauxArchivage', corps + '\nmettreAJourCompteurLea();')(document, travauxArchivage);
        return elements['travaux-lea-un-seul-pdf'].textContent;
    }
    const sel = (copies, papier) => ({ fichiers: Array(copies).fill({}), sansFichier: Array(papier).fill({}), aLaCorbeille: [], evaluations: [], nonVerrouillees: [] });

    it('une seule évaluation prête, copie importée ou synthèse seule : la phrase validée', () => {
        expect(phrase(sel(1, 0))).toBe(UN_SEUL_PDF);
        expect(phrase(sel(0, 1))).toBe(UN_SEUL_PDF);
    });

    it('plusieurs, ou aucune, ou pas de production : rien', () => {
        expect(phrase(sel(2, 0))).toBe('');
        expect(phrase(sel(1, 1))).toBe('');
        expect(phrase(sel(0, 0))).toBe('');
        expect(phrase(sel(1, 0), { production: '' })).toBe('');
    });

    it('la ligne est posée sous le bouton « Exporter pour Léa »', () => {
        const i = source.indexOf('data-action="travauxUI.lancerExportLea">Exporter pour Léa</button>');
        expect(i).toBeGreaterThan(-1);
        const suite = source.slice(i, i + 300);
        expect(suite).toMatch(/<\/button>\s*<p id="travaux-lea-un-seul-pdf"/);
    });
});

describe('fiche 7 — les autres exports d\'une rétroaction en un seul PDF passent par le même chemin', () => {
    const src = readFileSync(path.join(RACINE, 'js/travaux-export-pdf.js'), 'utf8');
    const corpsDe = (nom) => tranche(src, 'async function ' + nom + '(', '\n    }\n', { longueurMin: 200 });

    for (const nom of ['exporterPDF', 'exporterDossierComplet']) {
        it(`${nom} : l'onglet s'ouvre dans le geste, avant la première attente`, () => {
            const corps = corpsDe(nom);
            const ouverture = corps.indexOf('_ouvrirOngletPour(');
            expect(ouverture, 'l\'onglet est ouvert').toBeGreaterThan(-1);
            expect(ouverture, 'avant toute attente : sous WebKit, un onglet ouvert hors du geste est bloqué').toBeLessThan(corps.indexOf('await '));
        });
    }

    for (const nom of ['exporterPDF', 'exporterDossierComplet', 'exporterSyntheseSeule']) {
        it(`${nom} : le PDF va à l'onglet, le téléchargement seulement en repli`, () => {
            const corps = corpsDe(nom);
            expect(corps).not.toMatch(/doc\.save\(/);
            expect(corps).toContain('_livrerLePdf(');
        });
    }

    it('le repli : le téléchargement quand l\'onglet manque', () => {
        const livrer = tranche(src, 'function _livrerLePdf(', '\n    }\n', { longueurMin: 80 });
        expect(livrer).toMatch(/doc\.save\(nom\)/);
    });
});
