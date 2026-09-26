import { describe, it, expect, beforeEach } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// #643 (26 sept. 2026) — LE FICHIER DE PARTAGE DIT DE QUEL TRIMESTRE VIENNENT SES CARTOUCHES.
//
// Décision de Grégoire du 31 août : on partage les cartouches du trimestre ACTIF, et
// l'export doit le dire. La modale de l'émettrice le disait (#623) ; le fichier, non.
// Le format reste `labo-codex-partage-v1` (décision du 25 sept.) : un champ déclaré au
// manifeste fermé, `trimestreCartouches`, qui porte le NOM du trimestre — jamais son id,
// local à l'émettrice.
//
// Ce que ce banc tient :
//   E — l'émission : le nom part dès qu'une cartouche part, et seulement alors.
//   R — la réception : l'aperçu le rend ; un fichier sans le champ ne fait rien dire.
//   A — l'avant : le paquet signé en juin (vecteur du lot F) se vérifie encore.
//   T — le transport : tout champ que construirePackage pose au manifeste est déclaré.
// (Le trajet entre deux espaces, à l'écran : `integration/partage-trimestre-cartouches-643.spec.js`.)

const TRIMESTRES = [
    { id: 'h2026', nom: 'Hiver 2026', actif: false },
    { id: 'a2026', nom: 'Automne 2026', actif: true }
];
const GRILLE = { id: 'G643', nom: 'Analyse fictive', criteres: [{ id: 'c1', nom: 'Structure', ponderation: 100 }] };
const CARTOUCHE = { id: 'CART643', grilleId: 'G643', nom: 'Cartouche d\'automne', commentaires: { c1_M: 'Structure claire.' } };

let w;
let stock;
function monter(trimestres = TRIMESTRES) {
    stock = {
        a2026_grillesTemplates: [GRILLE],
        a2026_cartouches_G643: [CARTOUCHE]
    };
    const db = { getSync: (k, d) => (k in stock ? stock[k] : d), setSync: (k, v) => { stock[k] = v; } };
    w = chargerScript('js/partage-schemas.js', { db });
    chargerScript('js/partage-format.js', { db }, w);
    chargerScript('js/partage-validation.js', { db }, w);
    const actif = trimestres.find(t => t.actif) || null;
    w.obtenirTrimestreActif = () => actif;
    w.cle = (b) => (actif ? actif.id + '_' + b : b);
    w.toutesGrillesTravail = () => stock.a2026_grillesTemplates;
}
beforeEach(() => monter());

const paquet = (item, type, options = {}) =>
    w.partageFormat.construirePackage(item, { type, identiteAuteur: 'Émettrice fictive', ...options });

describe('#643 · E — l\'émission', () => {
    it('E.a LE CAS QUI PORTE LE SENS : une grille à cartouches part avec le NOM du trimestre actif', () => {
        const pkg = paquet(GRILLE, 'grille');
        expect(pkg.entites.cartouches).toHaveLength(1);
        expect(pkg.manifest.trimestreCartouches).toBe('Automne 2026');
    });

    it('E.b l\'identifiant interne du trimestre ne part jamais', () => {
        const pkg = paquet(GRILLE, 'grille');
        expect(JSON.stringify(pkg)).not.toContain('a2026');
    });

    it('E.c une cartouche partagée seule dit aussi son trimestre', () => {
        expect(paquet(CARTOUCHE, 'cartouche').manifest.trimestreCartouches).toBe('Automne 2026');
    });

    it('E.d sans cartouche embarquée, aucun trimestre n\'est dit', () => {
        stock.a2026_cartouches_G643 = [];
        const pkg = paquet(GRILLE, 'grille');
        expect(pkg.entites.cartouches).toHaveLength(0);
        expect(pkg.manifest).not.toHaveProperty('trimestreCartouches');
        // Une échelle n'a pas de cartouche non plus.
        const ech = paquet({ id: 'E1', nom: 'Échelle', niveaux: [{ code: 'A', nom: 'Atteint' }] }, 'echelle');
        expect(ech.manifest).not.toHaveProperty('trimestreCartouches');
    });

    it('E.e un ré-export de « Partagés » (lecteurs injectés) ne s\'attribue pas le trimestre actif', () => {
        const lecteurs = { cartouchesDeGrille: () => [CARTOUCHE], grilleParId: () => GRILLE };
        const pkg = paquet(GRILLE, 'grille', { lecteurs });
        expect(pkg.entites.cartouches).toHaveLength(1);
        expect(pkg.manifest).not.toHaveProperty('trimestreCartouches');
    });

    it('E.f un trimestre sans nom ne fait pas partir son id à la place', () => {
        monter([{ id: 'a2026', actif: true }]);
        const pkg = paquet(GRILLE, 'grille');
        expect(pkg.entites.cartouches).toHaveLength(1);
        expect(pkg.manifest).not.toHaveProperty('trimestreCartouches');
    });
});

describe('#643 · R — la réception', () => {
    it('R.a le paquet émis passe l\'auto-contrôle, et l\'aperçu rend le trimestre', () => {
        const verdict = w.partageValidation.validerPackage(paquet(GRILLE, 'grille'));
        expect(verdict.erreurs).toEqual([]);
        expect(verdict.preview.trimestreCartouches).toBe('Automne 2026');
    });

    it('R.b un fichier sans le champ (émis avant ce lot) ne fait rien dire', () => {
        const pkg = paquet(GRILLE, 'grille');
        delete pkg.manifest.trimestreCartouches;
        const verdict = w.partageValidation.validerPackage(pkg);
        expect(verdict.valide).toBe(true);
        expect(verdict.preview.trimestreCartouches).toBe('');
    });

    it('R.c le champ est un texte borné : un nom démesuré est refusé, pas tronqué en silence', () => {
        const pkg = paquet(GRILLE, 'grille');
        pkg.manifest.trimestreCartouches = 'x'.repeat(201);
        expect(w.partageValidation.validerPackage(pkg).valide).toBe(false);
    });

    it('R.d un nom porteur de balise est assaini avant d\'atteindre l\'aperçu', () => {
        const pkg = paquet(GRILLE, 'grille');
        pkg.manifest.trimestreCartouches = 'Automne <b>2026</b>';
        const verdict = w.partageValidation.validerPackage(pkg);
        expect(verdict.valide).toBe(true);
        expect(verdict.preview.trimestreCartouches).not.toContain('<b>');
    });

    it('R.f un trimestre annoncé SANS cartouche dans le paquet ne fait rien dire', () => {
        stock.a2026_cartouches_G643 = [];
        const pkg = paquet(GRILLE, 'grille');
        pkg.manifest.trimestreCartouches = 'Automne 2026';
        const verdict = w.partageValidation.validerPackage(pkg);
        expect(verdict.valide).toBe(true);
        expect(verdict.preview.trimestreCartouches).toBe('');
    });

    it('R.e la phrase de la prévisualisation (texte à valider par Grégoire)', () => {
        chargerScript('js/trust-tofu.js', { db: { getSync: () => [], setSync: () => {} } }, w);
        chargerScript('js/partage-import.js', { db: { getSync: () => [], setSync: () => {} } }, w);
        expect(w.partageImport.TEXTE_TRIMESTRE_CARTOUCHES + 'Automne 2026')
            .toBe('Cartouches tirées du trimestre : Automne 2026');
    });
});

// Le vecteur figé du lot F (`signature-F.test.js`), signé le 10 juin 2026 par une clé jetable.
const VECTEUR = {
    clePubliqueB64: 'eyJrZXlfb3BzIjpbInZlcmlmeSJdLCJleHQiOnRydWUsImt0eSI6IkVDIiwieCI6IlN6SDBuV21NT0NxR2toeldKWENNWklwazNmRGRvMFo0WExWbGxRTlRybmsiLCJ5Ijoid3I1TzFSczJqSTVQbzRUM2NjNjJVemlYRlh3YVNvR3I4Y1Y5MVVweTFvNCIsImNydiI6IlAtMjU2In0=',
    signatureB64: 'ttITOAj50vv+/lQ4OsKKoYLaX89Rv9HStdZX0vMUh/y7C7cmrolGADHdSHshQHx74EFL/r6tseJOzU4xL3rZCg=='
};
function paquetDeJuin() {
    return {
        format: 'labo-codex-partage-v1',
        manifest: {
            licence: 'CC BY-NC-SA 4.0',
            licence_url: 'https://creativecommons.org/licenses/by-nc-sa/4.0/',
            dateExport: '2026-06-10T14:00:00.000Z',
            auteur: { nom: 'Vecteur de test lot F' },
            item_principal: { type: 'echelle', id: 'VEC_ECH_1' },
            chaineAttribution: [],
            signature: VECTEUR.signatureB64,
            clePublique: VECTEUR.clePubliqueB64,
            algorithme: 'ECDSA-P256-SHA-256'
        },
        entites: {
            grilles: [],
            echelles: [{ id: 'VEC_ECH_1', nom: 'Échelle vecteur — accents éàç', niveaux: [{ code: 'A', nom: 'Atteint' }, { code: 'NA', nom: 'Non atteint' }] }],
            cartouches: [], productions: [], pratiques: []
        },
        references: [],
        medias: []
    };
}

describe('#643 · A — un paquet d\'avant ce lot passe toujours', () => {
    it('A.a le paquet signé en juin se valide, sans trimestre fabriqué', () => {
        const verdict = w.partageValidation.validerPackage(paquetDeJuin());
        expect(verdict.valide).toBe(true);
        expect(verdict.preview.trimestreCartouches).toBe('');
    });

    it('A.b sa signature se vérifie encore — et poser le champ après coup la casse', async () => {
        chargerScript('js/signature.js', {}, w);
        expect((await w.signaturePartage.verifierSignaturePackage(paquetDeJuin())).valide).toBe(true);
        const altere = paquetDeJuin();
        altere.manifest.trimestreCartouches = 'Automne 2026';
        expect((await w.signaturePartage.verifierSignaturePackage(altere)).valide).toBe(false);
    });
});

describe('#643 · T — le manifeste ne pose aucun champ que le schéma ignore', () => {
    it('T.a chaque champ du manifeste émis est déclaré au schéma fermé (sinon l\'auto-contrôle refuserait tout)', () => {
        const pkg = paquet(GRILLE, 'grille');
        const declares = Object.keys(w.partageSchemas.SCHEMA_MANIFESTE.champs);
        // Garde de validité : le paquet porte bien le champ de ce lot.
        expect(Object.keys(pkg.manifest)).toContain('trimestreCartouches');
        const nonDeclares = Object.keys(pkg.manifest).filter(k => !declares.includes(k));
        expect(nonDeclares, 'champs posés par construirePackage sans descripteur dans SCHEMA_MANIFESTE').toEqual([]);
    });

    it('T.b le trimestre est DÉCLARÉ comme texte (pas un objet qui emporterait l\'id)', () => {
        expect(w.partageSchemas.SCHEMA_MANIFESTE.champs.trimestreCartouches).toMatchObject({ type: 'chaine' });
    });
});
