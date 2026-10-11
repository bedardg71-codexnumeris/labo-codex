import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

// #1046 (lot 7, consigne de Cowork du 11 oct. 2026) — UNE SAUVEGARDE RÉCENTE PROPOSE SES GRILLES.
//
// Depuis #358 et S5/#623, grilles, échelles, pratiques et cartouches vivent sous la clé de leur
// trimestre. L'import sélectif ne les cherchait que sous les clés nues : un fichier récent n'offrait
// ni ses grilles, ni ses échelles, ni ses pratiques, ni ses cartouches. Elles sont désormais repliées
// sur les clés nues avant l'aperçu et avant l'import (`_ressourcesDesTrimestresSurLesClesNues`), puis
// suivent le chemin du lot 3.
//
//   A — l'aperçu propose les ressources des deux trimestres du fichier, une fois chacune ; jamais le démo.
//   B — l'import les range dans le trimestre ACTIF (ici `h2033`, absent du fichier).
//   C — même chemin que les clés nues : une grille en conflit d'id est renommée, ses cartouches et
//       la pratique qui désigne son échelle suivent ; au second passage, rien n'entre en double.
//   D — même id, contenu différent dans deux trimestres : la plus récente l'emporte (supposition).
//   E — ce qui voyage : un fichier à clés nues et le codex de banc 1.172.0 donnent la même vue qu'avant.
//
// Même harnais que `import-selectif-lot3-rattache-juste` : vrai `ouvrirModalImport` →
// `previsualiserImport` → `executerImportSelectif`, DOM et base simulés. Noms fictifs.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURE = path.resolve(__dirname, '..', 'fixtures', 'copies-de-secours-1.172.0', 'copie-de-secours.json');
const ACTIF = 'h2033_';

function fauxDb(initial) {
    const magasin = new Map(Object.entries(initial || {}));
    const cloner = (v) => (v === undefined ? undefined : JSON.parse(JSON.stringify(v)));
    return {
        magasin,
        getSync(k, defaut) { return magasin.has(k) ? cloner(magasin.get(k)) : defaut; },
        setSync(k, v) { magasin.set(k, cloner(v)); return true; },
        async get(k, defaut) { return magasin.has(k) ? cloner(magasin.get(k)) : defaut; },
        async set(k, v) { magasin.set(k, cloner(v)); return true; },
        async flush() {},
        keys() { return [...magasin.keys()]; }
    };
}
function elementInerte() {
    return {
        innerHTML: '', textContent: '', value: '', style: {}, checked: false,
        classList: { add() {}, remove() {}, contains: () => false, toggle: () => false },
        dataset: {}, setAttribute() {}, getAttribute: () => null,
        appendChild() {}, insertAdjacentHTML() {}, remove() {},
        addEventListener() {}, removeEventListener() {},
        querySelector: () => null, querySelectorAll: () => [], focus() {}, click() {},
        parentElement: { remove() {} }
    };
}

/** Monte import-export.js ; `coches` : null pour s'arrêter à l'aperçu. Rend l'analyse de l'aperçu. */
async function importer(espace, fichier, coches) {
    const champFichier = elementInerte();
    const document = {
        getElementById: (id) => (id === 'fichierImport' ? champFichier : (id.startsWith('import-') ? null : elementInerte())),
        querySelector: () => null,
        querySelectorAll: (sel) => {
            const m = /^\.import-item-(\w+):checked$/.exec(sel);
            return m ? ((coches || {})[m[1]] || []).map((id) => ({ dataset: { itemId: id } })) : [];
        },
        body: elementInerte(), createElement: () => elementInerte(),
        addEventListener() {}, removeEventListener() {}
    };
    class FauxLecteur { readAsText(f) { this.onload({ target: { result: f.texte } }); } }
    let n = espace.compteurIds || 0;
    const win = chargerScript('js/import-export.js', {
        db: espace.db, document,
        cle: (k) => ACTIF + k,
        echapperHtml: (t) => String(t == null ? '' : t),
        genererIdUnique: (p) => (p || 'ID_') + 'NEUF' + (++n),
        alert() {}, confirm: () => false,
        notifications: { succes() {}, erreur() {}, info() {}, avertissement() {} },
        FileReader: FauxLecteur
    });
    win.ouvrirModalImport();
    const texte = JSON.stringify(fichier);
    await champFichier.onchange({ target: { files: [{ name: 'sauvegarde-fictive.json', type: 'application/json', size: texte.length, texte }] } });
    const apercu = win.analyserRessourcesDetaillees(fichier);
    if (coches) await win.executerImportSelectif();
    espace.compteurIds = n;
    return { apercu, win };
}
const lire = (espace, k) => espace.db.getSync(ACTIF + k, null);
const ids = (liste) => (liste || []).map((x) => x.id);

/* Un fichier récent fabriqué à DEUX trimestres (a2031 et h2032), plus le démo. */
const GRILLE_1 = { id: 'GR_1', nom: 'Grille fictive Une', criteres: [{ id: 'CR_1', nom: 'Structure' }] };
const GRILLE_2 = { id: 'GR_2', nom: 'Grille fictive Deux', criteres: [{ id: 'CR_2', nom: 'Langue' }] };
const ECHELLE_1 = { id: 'ECH_1', nom: 'Échelle fictive Une', niveaux: [{ code: 'M', nom: 'Maîtrisé' }] };
const PRATIQUE_1 = { id: 'PRAT_1', nom: 'Pratique fictive Une', echelleId: 'ECH_1' };
const CARTOUCHE_2 = { id: 'CART_2', nom: 'Cartouche fictive Deux', grilleId: 'GR_2', echelleId: 'ECH_1', commentaires: { CR_2_M: 'Rétroaction fictive' } };
const FICHIER = {
    infoCours: { prenomEnseignant: 'Camille', nomEnseignant: 'Fictive' },
    a2031_grillesTemplates: [GRILLE_1],
    h2032_grillesTemplates: [GRILLE_1, GRILLE_2],          // GR_1 identique dans les deux trimestres
    h2032_echellesTemplates: [ECHELLE_1],
    a2031_pratiquesConfigurables: [PRATIQUE_1],
    a2031_cartouches_GR_2: [CARTOUCHE_2],
    h2032_cartouches_GR_2: [CARTOUCHE_2],                  // identique dans les deux trimestres
    demo_grillesTemplates: [{ id: 'GR_DEMO', nom: 'Grille du démo', criteres: [] }],
    demo_cartouches_GR_DEMO: [{ id: 'CART_DEMO', nom: 'Cartouche du démo', grilleId: 'GR_DEMO' }]
};
const TOUT = { grilles: ['GR_1', 'GR_2'], echelles: ['ECH_1'], pratiques: ['PRAT_1'], cartouches: ['cartouches_GR_2'] };

describe('#1046 · A — l\'aperçu propose les ressources des trimestres du fichier', () => {
    it('A.1 grilles, échelles, pratiques et cartouches des deux trimestres, une fois chacune', async () => {
        const { apercu } = await importer({ db: fauxDb({}) }, FICHIER, null);
        expect(ids(apercu.ressources.grilles.items)).toEqual(['GR_1', 'GR_2']);
        expect(ids(apercu.ressources.echelles.items)).toEqual(['ECH_1']);
        expect(ids(apercu.ressources.pratiques.items)).toEqual(['PRAT_1']);
        expect(apercu.ressources.cartouches.cles).toEqual(['cartouches_GR_2']);
        expect(apercu.ressources.cartouches.count).toBe(1);
    });
    it('A.2 le démo n\'est jamais proposé', async () => {
        const { apercu } = await importer({ db: fauxDb({}) }, FICHIER, null);
        expect(ids(apercu.ressources.grilles.items)).not.toContain('GR_DEMO');
        expect(apercu.ressources.cartouches.cles).not.toContain('cartouches_GR_DEMO');
    });
});

describe('#1046 · B — l\'import les range dans le trimestre actif', () => {
    it('B.1 tout ce qui est coché entre sous `h2033_`, une fois', async () => {
        const espace = { db: fauxDb({}) };
        await importer(espace, FICHIER, TOUT);
        expect(ids(lire(espace, 'grillesTemplates'))).toEqual(['GR_1', 'GR_2']);
        expect(ids(lire(espace, 'echellesTemplates'))).toEqual(['ECH_1']);
        expect(ids(lire(espace, 'pratiquesConfigurables'))).toEqual(['PRAT_1']);
        expect(ids(lire(espace, 'cartouches_GR_2'))).toEqual(['CART_2']);
        expect(espace.db.getSync('h2032_grillesTemplates', null), 'rien sous le trimestre du fichier').toBeNull();
    });
});

describe('#1046 · C — le chemin du lot 3 : renommage, rebranchement, pas de double', () => {
    it('C.1 une grille et une échelle en conflit d\'id sont renommées ; cartouches et pratique suivent ; second passage sans double', async () => {
        const espace = { db: fauxDb({
            [ACTIF + 'grillesTemplates']: [{ id: 'GR_2', nom: 'Grille locale', criteres: [] }],
            [ACTIF + 'echellesTemplates']: [{ id: 'ECH_1', nom: 'Échelle locale', niveaux: [] }]
        }) };
        await importer(espace, FICHIER, TOUT);
        const grilles = lire(espace, 'grillesTemplates');
        const recue = grilles.find((g) => g.nom === 'Grille fictive Deux');
        expect(recue.id).not.toBe('GR_2');
        expect(ids(lire(espace, 'cartouches_' + recue.id)), 'les cartouches suivent la grille renommée').toEqual(['CART_2']);
        const echelle = lire(espace, 'echellesTemplates').find((e) => e.nom === 'Échelle fictive Une');
        expect(echelle.id).not.toBe('ECH_1');
        expect(lire(espace, 'pratiquesConfigurables')[0].echelleId, 'la pratique suit l\'échelle renommée').toBe(echelle.id);

        await importer(espace, FICHIER, TOUT);
        expect(lire(espace, 'grillesTemplates').length, 'second passage : aucune grille de plus').toBe(grilles.length);
        expect(lire(espace, 'cartouches_' + recue.id).length, 'second passage : aucune cartouche de plus').toBe(1);
    });
});

describe('#1046 · D — même id, contenu différent dans deux trimestres', () => {
    it('D.1 la plus récente l\'emporte, proposée une fois', async () => {
        const fichier = {
            infoCours: FICHIER.infoCours,
            a2031_grillesTemplates: [{ ...GRILLE_1, nom: 'Version d\'automne' }],
            h2032_grillesTemplates: [{ ...GRILLE_1, nom: 'Version d\'hiver' }]
        };
        const { apercu } = await importer({ db: fauxDb({}) }, fichier, null);
        expect(apercu.ressources.grilles.items.map((g) => g.nom)).toEqual(['Version d\'hiver']);
    });
});

describe('#1046 · E — ce qui voyage : un fichier ancien donne la même vue qu\'avant', () => {
    it('E.1 un fichier à clés nues seules est rendu tel quel, objet compris', async () => {
        const ancien = { infoCours: FICHIER.infoCours, grillesTemplates: [GRILLE_1, GRILLE_1], cartouches_GR_2: [CARTOUCHE_2] };
        const { win } = await importer({ db: fauxDb({}) }, ancien, null);
        expect(win._ressourcesDesTrimestresSurLesClesNues(ancien)).toBe(ancien);
        expect(ids(win.analyserRessourcesDetaillees(ancien).ressources.grilles.items), 'un doublon de la clé nue reste, comme avant').toEqual(['GR_1', 'GR_1']);
    });
    it('E.2 le codex de banc 1.172.0 : sa vue est celle d\'avant (aucun trimestre n\'y porte de ces ressources ; le démo écarté)', async () => {
        const fixture = JSON.parse(readFileSync(FIXTURE, 'utf8'));
        const { win } = await importer({ db: fauxDb({}) }, { infoCours: FICHIER.infoCours }, null);
        expect(win._ressourcesDesTrimestresSurLesClesNues(fixture)).toBe(fixture);
    });
});
