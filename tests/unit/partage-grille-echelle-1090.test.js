import { describe, it, expect, beforeEach } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// #1090 (27 nov. 2026, décision de Grégoire) — UNE GRILLE PARTAGÉE EMPORTE SON ÉCHELLE.
//
// Avant : `rassemblerDependances` (partage-format.js) n'emportait jamais l'échelle d'une grille. Chez la
// personne qui la recevait, `criteres[].descripteurs.echelleId` désignait une échelle qu'elle n'avait pas :
// Conception › Grilles montrait « Échelle introuvable », sans aucune case de niveau, et les textes sous
// « Textes gardés d'une autre échelle ». Le rebranchement à l'import (`rebrancherReferences`, type grille)
// ne jouait que sur un paquet fait main.
//
// Le banc fait le CHEMIN ENTIER, avec deux espaces distincts — l'émettrice et la destinataire n'ont rien
// en commun que le fichier : construction du paquet chez l'une ; validation, intégration dans `partage_*`
// et « Dupliquer vers mes documents » chez l'autre.
//   E — l'émission : l'échelle part, une fois, avec sa référence ; ce qui ne peut pas voyager ne part pas.
//   V — la destinataire, espace vide : la grille retrouve son échelle et son lien.
//   D — la destinataire a déjà l'échelle : aucun doublon (règle d'identité, identite-item.js).
//   A — un ancien fichier, sans échelle : il s'ouvre comme avant.
//   T — la copie depuis un autre trimestre, qui passe par la même fonction, ne change pas.

function fauxDb() {
    const donnees = {};
    return {
        _donnees: donnees,
        getSync(k, defaut = null) {
            return Object.prototype.hasOwnProperty.call(donnees, k) ? JSON.parse(JSON.stringify(donnees[k])) : defaut;
        },
        setSync(k, v) { donnees[k] = JSON.parse(JSON.stringify(v)); }
    };
}

const NIVEAUX = [
    { code: 'I', nom: 'Insuffisant', min: 0, max: 54, valeurCalcul: 40 },
    { code: 'D', nom: 'En développement', min: 55, max: 74, valeurCalcul: 65 },
    { code: 'M', nom: 'Maîtrisé', min: 75, max: 89, valeurCalcul: 80 },
    { code: 'E', nom: 'Étendu', min: 90, max: 100, valeurCalcul: 95 }
];
const ECHELLE_EMETTRICE = { id: 'ECH_EMET', nom: 'IDME fictive', niveaux: NIVEAUX, seuilSuffisance: 'D', seuilMaitrise: 'M' };

function grilleADescripteurs() {
    return {
        id: 'GR_EMET', nom: 'Analyse littéraire fictive',
        criteres: [
            { id: 'C1', nom: 'Structure', type: 'holistique', ponderation: 50,
                descripteurs: { echelleId: 'ECH_EMET', parNiveau: { D: 'Le plan se suit.', M: 'Le plan sert la thèse.' } } },
            { id: 'C2', nom: 'Langue', type: 'holistique', ponderation: 50,
                descripteurs: { echelleId: 'ECH_EMET', parNiveau: { M: 'Peu d’erreurs.' }, pourVerifier: 'Ai-je relu ?' } }
        ]
    };
}

/** L'émettrice : ses échelles dans le trimestre actif, rien d'autre. */
function emettrice(echelles) {
    const db = fauxDb();
    db.setSync('a2026_echellesTemplates', echelles);
    const w = chargerScript('js/partage-schemas.js', { db });
    chargerScript('js/partage-validation.js', { db }, w);
    chargerScript('js/partage-format.js', { db }, w);
    w.cle = (k) => 'a2026_' + k;
    return w;
}

let dbR;
let wR;
let compteur;

/** La destinataire : la chaîne d'import et la section « Partagés », dans un espace à elle. */
function destinataire() {
    dbR = fauxDb();
    compteur = 0;
    wR = chargerScript('js/partage-schemas.js', { db: dbR });
    chargerScript('js/partage-validation.js', { db: dbR }, wR);
    chargerScript('js/partage-format.js', { db: dbR }, wR);
    chargerScript('js/trust-tofu.js', { db: dbR }, wR);
    chargerScript('js/partage-import.js', { db: dbR }, wR);
    chargerScript('js/import-export.js', { db: dbR }, wR);   // `rebrancherReferences` (#627)
    chargerScript('js/identite-item.js', { db: dbR }, wR);
    chargerScript('js/partage-section.js', {
        db: dbR,
        genererIdUnique: (prefixe) => prefixe + 'NEUF_' + (++compteur),
        getCleProductions: () => 'h2026_productions',
        alert: () => {}
    }, wR);
    wR.cle = (k) => 'h2026_' + k;
    wR.BibliothequeUI = { obtenirAuteurActif: () => 'Destinataire fictive', formaterTitre: (n) => n };
}

/** Reçoit un paquet : validation, intégration, puis « Dupliquer vers mes documents » de la grille. */
function recevoirEtDupliquer(pkg) {
    const verdict = wR.partageValidation.validerPackage(JSON.parse(JSON.stringify(pkg)));
    expect(verdict.erreurs).toEqual([]);
    const entree = wR.partageImport.integrerPackage(verdict.packageNettoye, {});
    const r = wR.partageSection.dupliquerVersMesDocuments('grille', entree.itemPrincipal.idNouveau);
    expect(r).not.toBeNull();
    const grilles = dbR.getSync('h2026_grillesTemplates', []);
    return { grille: grilles[grilles.length - 1], echelles: dbR.getSync('h2026_echellesTemplates', []) };
}

const paquetDe = (w, grille) => w.partageFormat.construirePackage(grille, { type: 'grille', identiteAuteur: 'Émettrice fictive' });

beforeEach(() => destinataire());

describe('#1090 · E — l\'émission', () => {
    it('E.a l\'échelle des descripteurs part, une seule fois pour deux critères, avec sa référence', () => {
        const pkg = paquetDe(emettrice([ECHELLE_EMETTRICE]), grilleADescripteurs());
        expect(pkg.entites.echelles.map(e => e.id)).toEqual(['ECH_EMET']);
        expect(pkg.references).toContainEqual({ depuis: { type: 'grille', id: 'GR_EMET' }, vers: { type: 'echelle', id: 'ECH_EMET' }, nature: 'utilise' });
        expect(pkg.manifest.item_principal).toEqual({ type: 'grille', id: 'GR_EMET' });
    });

    it('E.b le paquet passe l\'auto-contrôle de l\'export (la validation d\'import)', () => {
        const w = emettrice([ECHELLE_EMETTRICE]);
        expect(w.partageValidation.validerPackage(paquetDe(w, grilleADescripteurs())).erreurs).toEqual([]);
    });

    it('E.c une grille à barème, sans descripteurs, part sans échelle, comme avant', () => {
        const bareme = { id: 'GR_PTS', nom: 'Grille en points fictive', criteres: [{ id: 'C1', nom: 'Contenu', type: 'analytique', ponderation: 100 }] };
        const pkg = paquetDe(emettrice([ECHELLE_EMETTRICE]), bareme);
        expect(pkg.entites.echelles).toEqual([]);
        expect(pkg.references).toEqual([]);
    });

    it('E.d une échelle qui ne passerait pas seule la validation (onze niveaux) ne part pas, la grille si', () => {
        const onze = { ...ECHELLE_EMETTRICE, niveaux: Array.from({ length: 11 }, (_, i) => ({ code: 'N' + i, nom: 'Niveau ' + i })) };
        const w = emettrice([onze]);
        const pkg = paquetDe(w, grilleADescripteurs());
        expect(pkg.entites.echelles).toEqual([]);
        expect(w.partageValidation.validerPackage(pkg).erreurs).toEqual([]);
    });

    it('E.e une échelle de démonstration ne part pas', () => {
        const w = emettrice([{ ...ECHELLE_EMETTRICE, isDemo: true }]);
        w.BibliothequeUI = { estItemDemo: (i) => !!(i && i.isDemo === true) };
        expect(paquetDe(w, grilleADescripteurs()).entites.echelles).toEqual([]);
    });

    it('E.f une production emporte sa grille, et l\'échelle de celle-ci', () => {
        const w = emettrice([ECHELLE_EMETTRICE]);
        w.toutesGrillesTravail = () => [grilleADescripteurs()];
        const pkg = w.partageFormat.construirePackage({ id: 'PROD_1', titre: 'Dissertation fictive', grilleId: 'GR_EMET' },
            { type: 'production', identiteAuteur: 'Émettrice fictive' });
        expect(pkg.entites.grilles.map(g => g.id)).toEqual(['GR_EMET']);
        expect(pkg.entites.echelles.map(e => e.id)).toEqual(['ECH_EMET']);
    });
});

describe('#1090 · V — reçue dans un espace vide', () => {
    it('V.a LE CAS QUI PORTE LE SENS : la grille copiée désigne une échelle du trimestre, aux mêmes niveaux', () => {
        const { grille, echelles } = recevoirEtDupliquer(paquetDe(emettrice([ECHELLE_EMETTRICE]), grilleADescripteurs()));
        expect(echelles).toHaveLength(1);
        const idPose = grille.criteres[0].descripteurs.echelleId;
        expect(idPose).toBe(echelles[0].id);
        expect(grille.criteres[1].descripteurs.echelleId).toBe(idPose);
        expect(echelles[0].niveaux.map(n => n.code)).toEqual(['I', 'D', 'M', 'E']);
        expect([echelles[0].seuilSuffisance, echelles[0].seuilMaitrise]).toEqual(['D', 'M']);
        // Les textes arrivent tels qu'écrits, sous les codes de cette échelle.
        expect(grille.criteres[0].descripteurs.parNiveau).toEqual({ D: 'Le plan se suit.', M: 'Le plan sert la thèse.' });
    });

    it('V.b ni la grille ni l\'échelle copiées ne désignent le namespace partage_*', () => {
        const { grille, echelles } = recevoirEtDupliquer(paquetDe(emettrice([ECHELLE_EMETTRICE]), grilleADescripteurs()));
        expect(grille.criteres[0].descripteurs.echelleId.indexOf('PARTAGE_')).toBe(-1);
        expect(echelles[0].id.indexOf('PARTAGE_')).toBe(-1);
        expect(echelles[0].inspireDe.idOriginal).toBe('ECH_EMET');   // la lignée, pour la règle d'identité
    });

    it('V.c la duplication n\'écrit pas dans partage_*', () => {
        const pkg = paquetDe(emettrice([ECHELLE_EMETTRICE]), grilleADescripteurs());
        const verdict = wR.partageValidation.validerPackage(pkg);
        const entree = wR.partageImport.integrerPackage(verdict.packageNettoye, {});
        const avant = JSON.stringify(dbR.getSync('partage_echelles', []));
        wR.partageSection.dupliquerVersMesDocuments('grille', entree.itemPrincipal.idNouveau);
        expect(JSON.stringify(dbR.getSync('partage_echelles', []))).toBe(avant);
    });
});

describe('#1090 · D — reçue là où l\'échelle existe déjà', () => {
    it('D.a une échelle de même lignée dans le trimestre : réemployée, aucune écrite', () => {
        const locale = { id: 'ECH_LOCALE', nom: 'IDME renommée', niveaux: NIVEAUX, inspireDe: { idOriginal: 'ECH_EMET', auteur: 'Émettrice fictive' } };
        dbR.setSync('h2026_echellesTemplates', [locale]);
        const { grille, echelles } = recevoirEtDupliquer(paquetDe(emettrice([ECHELLE_EMETTRICE]), grilleADescripteurs()));
        expect(echelles.map(e => e.id)).toEqual(['ECH_LOCALE']);
        expect(grille.criteres[0].descripteurs.echelleId).toBe('ECH_LOCALE');
    });

    it('D.b la même grille reçue et copiée deux fois : une seule échelle', () => {
        const pkg = paquetDe(emettrice([ECHELLE_EMETTRICE]), grilleADescripteurs());
        const premiere = recevoirEtDupliquer(pkg);
        const seconde = recevoirEtDupliquer(pkg);
        expect(seconde.echelles).toHaveLength(1);
        expect(seconde.grille.criteres[0].descripteurs.echelleId).toBe(premiere.grille.criteres[0].descripteurs.echelleId);
    });

    it('D.c une échelle de même NOM mais d\'une autre lignée n\'est pas réemployée (#450)', () => {
        dbR.setSync('h2026_echellesTemplates', [{ id: 'ECH_HOMONYME', nom: 'IDME fictive', niveaux: NIVEAUX }]);
        const { grille, echelles } = recevoirEtDupliquer(paquetDe(emettrice([ECHELLE_EMETTRICE]), grilleADescripteurs()));
        expect(echelles).toHaveLength(2);
        expect(grille.criteres[0].descripteurs.echelleId).not.toBe('ECH_HOMONYME');
    });
});

describe('#1090 · A — un ancien fichier, sans échelle', () => {
    it('A.a il s\'ouvre comme avant : validé, copié, aucune échelle écrite, l\'id de l\'émettrice gardé', () => {
        const pkg = paquetDe(emettrice([ECHELLE_EMETTRICE]), grilleADescripteurs());
        pkg.entites.echelles = [];
        pkg.references = pkg.references.filter(r => r.vers.type !== 'echelle');
        const { grille, echelles } = recevoirEtDupliquer(pkg);
        expect(echelles).toEqual([]);
        expect(grille.criteres[0].descripteurs.echelleId).toBe('ECH_EMET');
        expect(grille.criteres[0].descripteurs.parNiveau.M).toBe('Le plan sert la thèse.');
    });
});

describe('#1090 · T — la copie depuis un autre trimestre ne change pas', () => {
    it('T.a sans l\'option du partage, aucune échelle n\'est écrite et l\'id reste', () => {
        const source = grilleADescripteurs();
        const lireEchelleSource = (id) => (id === 'ECH_EMET' ? ECHELLE_EMETTRICE : null);
        const res = wR.partageSection.dupliquerGrillePartagee(source, () => [], lireEchelleSource);
        expect(res.grille.criteres[0].descripteurs.echelleId).toBe('ECH_EMET');
        expect(dbR.getSync('h2026_echellesTemplates', [])).toEqual([]);
    });
});
