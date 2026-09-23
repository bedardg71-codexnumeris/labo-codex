import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';
import { tranche } from './_helpers/tranche.js';

// SENTINELLE #895 (23 septembre 2026) — UNE SEULE CARTE « EXPORTER DES TRAVAUX ».
//
// « Exporter et archiver » offrait deux cartes pour un même geste : « Exporter
// des travaux » (`élève/fichier`, refusait « Toutes / Tous » par un `alert`) et
// « Trimestre complet » (`élève/production/fichier`, `_resume.json`, DEFLATE,
// progression, mais ne marquait rien « exporté »). Décision de Grégoire du
// 17 sept. : une carte, la forme des dossiers et la compression en options,
// « Toutes / Tous » = l'export complet. Un seul moteur reste : `exporterTravaux`.
//
// Invariants :
//   · « Toutes / Tous » donne tout le groupe, `_resume.json` compris ; les filtres
//     production / élève / les deux restreignent ;
//   · les deux formes de dossiers ; les deux états de compression ;
//   · un fichier illisible est sauté, nommé dans le bilan ET dans `_resume.json`,
//     les autres partent (#565, #891) ;
//   · « exporté » est posé sur ce qui est parti, et seulement là, dans chaque option ;
//   · un filtre sans fichier ne télécharge rien et le dit sans `alert` ;
//   · plus de carte « Trimestre complet », plus de `lancerArchivageSemestre`,
//     plus d'`alert` dans ce chemin, un seul moteur.
//
// Break-tests (23 sept. 2026, 14 mutations, 14 rouges) : refus remis dans
// `lancerArchivage` ; forme ignorée ; compression forcée ; aucun marquage ; tout
// marqué malgré l'échec ; échecs hors de `_resume.json` ; filtre élève ignoré ;
// filtre vide muet ; `_resume.json` absent ; `lancerArchivageSemestre` revenu ;
// case de compression décochée ; forme par défaut inversée ; « Trimestre
// complet » remis dans l'aide (rougit #893) ; compression non lue par l'écran.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');
const lire = (...p) => readFileSync(path.join(racine, ...p), 'utf8');

function monter({ recupererBlob } = {}) {
    const etudiants = [
        { da: '111', nom: 'Tremblay', prenom: 'Alix' },
        { da: '222', nom: 'Roy', prenom: 'Sam' }
    ];
    // Deux élèves × deux productions.
    const fichiers = [
        { id: 'F1', etudiantDA: '111', productionId: 'P1', nomFichier: 'a1.pdf' },
        { id: 'F2', etudiantDA: '111', productionId: 'P2', nomFichier: 'a2.pdf' },
        { id: 'F3', etudiantDA: '222', productionId: 'P1', nomFichier: 'b1.pdf' },
        { id: 'F4', etudiantDA: '222', productionId: 'P2', nomFichier: 'b2.pdf' }
    ];
    const store = {
        groupeEtudiants: etudiants,
        productions: [{ id: 'P1', titre: 'Écrit 1' }, { id: 'P2', titre: 'Écrit 2' }],
        evaluationsSauvegardees: [
            { id: 'E1', etudiantDA: '111', productionId: 'P1' },
            { id: 'E2', etudiantDA: '222', productionId: 'P2' }
        ]
    };

    const entrees = [];
    const generations = [];
    function FauxZip(prefixe = '') {
        this.file = (chemin, contenu) => { entrees.push({ chemin: prefixe + chemin, contenu }); };
        this.folder = (nom) => new FauxZip(prefixe + nom + '/');
        this.generateAsync = async (opts) => { generations.push(opts); return { fauxBlob: true }; };
    }

    const marques = [];
    const telecharges = [];
    const alertes = [];
    const elements = {
        'travaux-texte-progression': { textContent: '' },
        'travaux-barre-progression': { style: { width: '' } }
    };
    const stubs = {
        document: {
            getElementById: (id) => elements[id] || null,
            createElement: () => ({ click() { telecharges.push(this.download); } })
        },
        db: { get: async () => null, getSync: (_k, d) => d, set: async () => {}, setSync: () => {} },
        cle: (k) => k,
        echapperHtml: (s) => String(s == null ? '' : s),
        obtenirDonneesSelonMode: (k) => store[k] || [],
        sauvegarderDonneesSelonMode: () => {},
        obtenirTrimestreActif: () => ({ id: 'a2026', nom: 'Automne 2026' }),
        travauxStockage: {
            obtenirFichiersGroupeActif: () => fichiers,
            obtenirFichiersEtudiant: (da) => fichiers.filter(f => f.etudiantDA === da),
            obtenirAnnotationFichier: () => null,
            recupererBlob: recupererBlob || (async () => ({ taille: 1 })),
            marquerExporte: (id) => marques.push(id)
        },
        travauxResolution: {},
        travauxExportPDF: {},
        URL: { createObjectURL: () => 'blob:faux', revokeObjectURL: () => {} },
        alert: (m) => alertes.push(String(m)),
        JSZip: FauxZip
    };
    const win = chargerScript('js/travaux-archivage.js', stubs, {
        addEventListener: () => {}, removeEventListener: () => {}
    });
    return { archivage: win.travauxArchivage, entrees, generations, marques, telecharges, alertes, elements };
}

const copies = (entrees) => entrees.map(e => e.chemin).filter(c => !c.endsWith('.json'));
const json = (entrees, nom) => {
    const e = entrees.find(x => x.chemin === nom);
    return e ? JSON.parse(e.contenu) : undefined;
};
const illisibleSurF3 = async (id) => {
    if (id === 'F3') throw new Error('Blob illisible');
    return { taille: 1 };
};

describe('#895 · « Toutes / Tous » est un export complet, les filtres restreignent', () => {
    it('aucun filtre : tout le groupe, par étudiant·e et production, avec _resume.json et les évaluations', async () => {
        const { archivage, entrees } = monter();
        const r = await archivage.exporterTravaux({});
        expect(copies(entrees)).toEqual([
            'Tremblay_Alix_111/Écrit 1/a1.pdf',
            'Tremblay_Alix_111/Écrit 2/a2.pdf',
            'Roy_Sam_222/Écrit 1/b1.pdf',
            'Roy_Sam_222/Écrit 2/b2.pdf'
        ]);
        expect(r.exportes).toEqual(['F1', 'F2', 'F3', 'F4']);
        expect(json(entrees, '_resume.json')).toMatchObject({ nbFichiers: 4, nbEtudiants: 2, nbProductions: 2, nbEchecs: 0 });
        expect(json(entrees, '_evaluations.json').map(e => e.id)).toEqual(['E1', 'E2']);
    });

    it('une production seule', async () => {
        const { archivage, entrees } = monter();
        const r = await archivage.exporterTravaux({ productionId: 'P2' });
        expect(r.exportes).toEqual(['F2', 'F4']);
        expect(json(entrees, '_evaluations.json').map(e => e.id)).toEqual(['E2']);
    });

    it('un·e étudiant·e seul·e', async () => {
        const { archivage, entrees } = monter();
        const r = await archivage.exporterTravaux({ da: '111' });
        expect(r.exportes).toEqual(['F1', 'F2']);
        expect(json(entrees, '_evaluations.json').map(e => e.id)).toEqual(['E1']);
    });

    it('les deux filtres ensemble', async () => {
        const { archivage, entrees } = monter();
        const r = await archivage.exporterTravaux({ da: '222', productionId: 'P1' });
        expect(r.exportes).toEqual(['F3']);
        expect(copies(entrees)).toEqual(['Roy_Sam_222/Écrit 1/b1.pdf']);
        expect(json(entrees, '_resume.json').nbFichiers).toBe(1);
        // Aucune évaluation pour ce couple : le fichier n'est pas écrit vide.
        expect(json(entrees, '_evaluations.json')).toBeUndefined();
    });
});

describe('#895 · les deux formes de dossiers, les deux états de compression', () => {
    it('forme « par étudiant·e » : pas de niveau production', async () => {
        const { archivage, entrees } = monter();
        await archivage.exporterTravaux({ forme: 'etudiant' });
        expect(copies(entrees)).toEqual([
            'Tremblay_Alix_111/a1.pdf', 'Tremblay_Alix_111/a2.pdf',
            'Roy_Sam_222/b1.pdf', 'Roy_Sam_222/b2.pdf'
        ]);
        expect(json(entrees, '_resume.json').nbFichiers).toBe(4);
    });

    it('forme « par étudiant·e et production » explicite = le défaut', async () => {
        const a = monter();
        await a.archivage.exporterTravaux({ forme: 'etudiant-production' });
        const b = monter();
        await b.archivage.exporterTravaux({});
        expect(copies(a.entrees)).toEqual(copies(b.entrees));
        expect(copies(a.entrees)[0]).toBe('Tremblay_Alix_111/Écrit 1/a1.pdf');
    });

    it('compression par défaut : DEFLATE niveau 6', async () => {
        const { archivage, generations } = monter();
        await archivage.exporterTravaux({});
        expect(generations).toEqual([{ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } }]);
    });

    it('compression désactivée : archive stockée sans DEFLATE', async () => {
        const { archivage, generations } = monter();
        await archivage.exporterTravaux({ compression: false });
        expect(generations).toEqual([{ type: 'blob' }]);
    });
});

describe('#895 · un fichier illisible est sauté et nommé, les autres partent', () => {
    for (const forme of ['etudiant-production', 'etudiant']) {
        it(`forme ${forme} : nommé dans le bilan et dans _resume.json`, async () => {
            const { archivage, entrees, alertes, telecharges } = monter({ recupererBlob: illisibleSurF3 });
            await archivage.lancerExport({ forme });
            expect(telecharges).toHaveLength(1);
            expect(copies(entrees)).toHaveLength(3);
            expect(copies(entrees).some(c => c.endsWith('b1.pdf'))).toBe(false);
            const resume = json(entrees, '_resume.json');
            expect(resume.nbEchecs).toBe(1);
            expect(resume.echecs[0]).toContain('Roy_Sam_222 / b1.pdf — Blob illisible');
            expect(alertes).toHaveLength(1);
            expect(alertes[0]).toContain('3 exporté(s) sur 4, 1 en échec');
            expect(alertes[0]).toContain('Roy_Sam_222 / b1.pdf — Blob illisible');
        });
    }
});

describe('#895 · « exporté » suit #891 pour toute forme d\'export', () => {
    const combinaisons = [];
    for (const forme of ['etudiant-production', 'etudiant']) {
        for (const compression of [true, false]) combinaisons.push({ forme, compression });
    }
    for (const opts of combinaisons) {
        it(`forme ${opts.forme}, compression ${opts.compression} : tout ce qui est parti, et rien d'autre`, async () => {
            const complet = monter();
            await complet.archivage.lancerExport(opts);
            expect(complet.marques).toEqual(['F1', 'F2', 'F3', 'F4']);

            const perte = monter({ recupererBlob: illisibleSurF3 });
            await perte.archivage.lancerExport({ ...opts, productionId: 'P1' });
            expect(perte.marques).toEqual(['F1']);
        });
    }
});

describe('#895 · « Télécharger » : nom du ZIP, et un filtre vide dit sans alert', () => {
    it('l\'archive de tout le groupe est datée et porte le trimestre', async () => {
        const { archivage, telecharges, alertes } = monter();
        await archivage.lancerExport({});
        expect(telecharges).toHaveLength(1);
        expect(telecharges[0]).toMatch(/^travaux_a2026_\d{4}-\d{2}-\d{2}\.zip$/);
        expect(alertes).toEqual([]);
    });

    it('un filtre sans fichier : rien n\'est téléchargé, la carte le dit, aucune alerte', async () => {
        const { archivage, telecharges, alertes, marques, elements } = monter();
        // P2 existe, mais pas pour cet élève inconnu du stock.
        await archivage.lancerExport({ da: '999', productionId: 'P2' });
        expect(telecharges).toEqual([]);
        expect(alertes).toEqual([]);
        expect(marques).toEqual([]);
        expect(elements['travaux-texte-progression'].textContent).toBe('Aucun fichier trouvé pour ces critères.');
    });
});

describe('#895 · sentinelle structurelle : une carte, un moteur, aucun refus', () => {
    const ui = lire('js', 'travaux-ui.js');
    const moteur = lire('js', 'travaux-archivage.js');
    const zoneCartes = tranche(ui, '<div class="travaux-archivage-options">', '<!-- Quota stockage -->', { longueurMin: 2000 });
    const carte = tranche(zoneCartes, '<h4>Exporter des travaux</h4>', '<!-- Export Lea -->', { longueurMin: 800 });
    const lancer = tranche(ui, '    function lancerArchivage() {', '    /**', { longueurMin: 200 });

    it('plus de carte « Trimestre complet », plus de lancerArchivageSemestre', () => {
        expect(zoneCartes).not.toContain('Trimestre complet');
        expect(ui).not.toContain('lancerArchivageSemestre');
        expect(ui).not.toContain('travaux-archivage-semestre');
    });

    it('la carte porte les deux options, la progression et le bouton', () => {
        expect(carte).toContain('id="travaux-archivage-forme"');
        expect(carte).toContain('<option value="etudiant-production">');
        expect(carte).toContain('<option value="etudiant">');
        // Le défaut est la première option, et la compression est cochée.
        expect(carte.indexOf('value="etudiant-production"')).toBeLessThan(carte.indexOf('value="etudiant"'));
        expect(carte).toMatch(/<input type="checkbox" id="travaux-archivage-compression" checked>/);
        expect(carte).toContain('id="travaux-barre-progression"');
        expect(carte).toContain('data-action="travauxUI.lancerArchivage"');
    });

    it('lancerArchivage ne refuse rien et transmet les quatre réglages', () => {
        expect(lancer).not.toMatch(/alert\(/);
        expect(lancer).not.toMatch(/return;/);
        for (const id of ['travaux-archivage-etudiant', 'travaux-archivage-production', 'travaux-archivage-forme', 'travaux-archivage-compression']) {
            expect(lancer, id).toContain(`'${id}'`);
        }
        expect(lancer).toContain('travauxArchivage.lancerExport({');
    });

    it('un seul moteur ZIP pour l\'écran : exporterSemestre et lancerExportSemestre ont disparu', () => {
        expect(moteur).not.toMatch(/exporterSemestre|lancerExportSemestre/);
        const exporteurs = [...moteur.matchAll(/async function (exporter\w*)\(/g)].map(m => m[1]);
        // Profil (exporterParEtudiant) et Léa (exporterPourLea) sont d'autres gestes.
        expect(exporteurs.sort()).toEqual(['exporterParEtudiant', 'exporterPourLea', 'exporterTravaux']);
    });

    it('le chemin de « Télécharger » n\'a plus d\'alert de refus', () => {
        const lancerExport = tranche(moteur, '    async function lancerExport(options = {}) {', '    /**', { longueurMin: 800 });
        // Seul l'échec inattendu (catch) alerte encore ; le filtre vide non.
        expect((lancerExport.match(/alert\(/g) || []).length).toBe(1);
        expect(lancerExport).toMatch(/catch \(e\) \{[\s\S]*alert\('L\\'export a échoué/);
    });
});
