import { describe, it, expect, beforeEach } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// #329 Voûte Phase 1 · lot P3 — sentinelles du pipeline d'import.
// Couvre la partie PURE/storage du module : préfixage PARTAGE_* (D7) avec
// remappage des références internes et pose d'inspireDe.idOriginal,
// intégration dans le namespace partage_*, registre des packages importés,
// détection de mise à jour (même auteur + même item d'origine, R3) et
// RETRAIT PAR IDENTITÉ (jamais par flag — SKILL_integrite_globaux).
// Le flux navigateur (fichier .lcz, modales, TOFU interactif) est couvert
// par tests/integration/partage-import-rendu.spec.js (Playwright).

function fauxDb() {
    const donnees = {};
    return {
        _donnees: donnees,
        getSync(k, defaut = null) {
            return Object.prototype.hasOwnProperty.call(donnees, k)
                ? JSON.parse(JSON.stringify(donnees[k]))
                : defaut;
        },
        setSync(k, v) {
            donnees[k] = JSON.parse(JSON.stringify(v));
        }
    };
}

let db;
let w;

function charger() {
    db = fauxDb();
    // Même sandbox pour schémas + trust-tofu + import : partage-import
    // s'appuie sur trustTofu.normaliserNomAuteur (source canonique).
    w = chargerScript('js/partage-schemas.js', { db });
    chargerScript('js/trust-tofu.js', { db }, w);
    chargerScript('js/partage-import.js', { db }, w);
    // #627 : les références internes suivent par la règle commune des imports, posée par import-export.js.
    chargerScript('js/import-export.js', { db }, w);
    return w;
}

function packageNettoyeFixture() {
    return {
        format: 'labo-codex-partage-v1',
        manifest: {
            licence: 'CC BY-NC-SA 4.0',
            dateExport: '2026-06-10T12:00:00Z',
            auteur: { nom: 'Marie Collègue' },
            item_principal: { type: 'grille', id: 'GR_X' },
            chaineAttribution: [],
            signature: 'sig', clePublique: 'CLE_A', algorithme: 'ECDSA-P256-SHA-256'
        },
        entites: {
            grilles: [{ id: 'GR_X', nom: 'Grille partagée', criteres: [] }],
            echelles: [],
            cartouches: [{ id: 'CART_1', grilleId: 'GR_X', nom: 'Cartouche liée' }],
            productions: [{ id: 'PROD_1', titre: 'Portfolio', grilleId: '' }],
            pratiques: []
        },
        references: [],
        medias: []
    };
}

beforeEach(() => {
    charger();
});

describe('lot P3 · sentinelle exports', () => {
    it('expose l\'API attendue sur window.partageImport', () => {
        ['importerFichier', 'importerObjet', 'lirePackageDepuisFichier', 'prefixerEntites',
            'integrerPackage', 'retirerImport', 'listerImports', 'trouverImportExistant',
            'verifierMagicBytesZip', 'rafraichirSection', 'confirmerRetrait'].forEach(nom => {
            expect(w.partageImport[nom], nom).toBeTypeOf('function');
        });
        expect(w.partageImport.CLE_REGISTRE).toBe('partage_packagesImportes');
        expect(w.partageImport.CLES_STOCKAGE.grille).toBe('partage_grilles');
    });
});

describe('lot P3 · prefixerEntites (D7)', () => {
    it('préfixe chaque id par PARTAGE_{suffixe}_ et conserve l\'id source dans inspireDe.idOriginal', () => {
        const r = w.partageImport.prefixerEntites(packageNettoyeFixture(), 'IMP_ab12cd34');
        const grille = r.parType.grille[0];
        expect(grille.id).toBe('PARTAGE_ab12cd34_GR_X');
        expect(grille.inspireDe.idOriginal).toBe('GR_X');
        expect(grille.inspireDe.auteur).toBe('Marie Collègue');
        expect(grille.inspireDe.date).toBe('2026-06-10');
        expect(r.idPrincipalNouveau).toBe('PARTAGE_ab12cd34_GR_X');
        expect(r.nbTotal).toBe(3);
    });

    it('remappe cartouche.grilleId vers le nouvel id quand la grille est dans le package', () => {
        const r = w.partageImport.prefixerEntites(packageNettoyeFixture(), 'IMP_ab12cd34');
        expect(r.parType.cartouche[0].grilleId).toBe('PARTAGE_ab12cd34_GR_X');
    });

    it('laisse intact un grilleId vide (production sans grille) ou hors package', () => {
        const pkg = packageNettoyeFixture();
        pkg.entites.cartouches.push({ id: 'CART_2', grilleId: 'GR_AILLEURS', nom: 'Orpheline' });
        const r = w.partageImport.prefixerEntites(pkg, 'IMP_ab12cd34');
        expect(r.parType.production[0].grilleId).toBe('');
        expect(r.parType.cartouche[1].grilleId).toBe('GR_AILLEURS');
    });

    it('complète un inspireDe existant (lignée de l\'auteur) sans l\'écraser', () => {
        const pkg = packageNettoyeFixture();
        pkg.entites.grilles[0].inspireDe = { nom: 'Grille mère', auteur: 'Auteur originel', date: '2025-01-01' };
        const r = w.partageImport.prefixerEntites(pkg, 'IMP_ab12cd34');
        const inspireDe = r.parType.grille[0].inspireDe;
        expect(inspireDe.auteur).toBe('Auteur originel');
        expect(inspireDe.nom).toBe('Grille mère');
        expect(inspireDe.idOriginal).toBe('GR_X');
    });

    it('ne mute pas le package d\'entrée', () => {
        const pkg = packageNettoyeFixture();
        w.partageImport.prefixerEntites(pkg, 'IMP_ab12cd34');
        expect(pkg.entites.grilles[0].id).toBe('GR_X');
        expect(pkg.entites.grilles[0].inspireDe).toBeUndefined();
    });
});

describe('lot P3 · integrerPackage + registre', () => {
    it('écrit les entités dans partage_* et inscrit une entrée de registre complète', () => {
        const entree = w.partageImport.integrerPackage(packageNettoyeFixture(), { statutConfiance: 'nouveau' });

        const grilles = db.getSync('partage_grilles', []);
        const cartouches = db.getSync('partage_cartouches', []);
        const productions = db.getSync('partage_productions', []);
        expect(grilles).toHaveLength(1);
        expect(cartouches).toHaveLength(1);
        expect(productions).toHaveLength(1);
        expect(grilles[0].id.startsWith('PARTAGE_')).toBe(true);
        expect(cartouches[0].grilleId).toBe(grilles[0].id);

        expect(entree.idImport.startsWith('IMP_')).toBe(true);
        expect(entree.auteur.nom).toBe('Marie Collègue');
        expect(entree.auteurNormalise).toBe('marie collègue');
        expect(entree.itemPrincipal).toEqual({
            type: 'grille', idOriginal: 'GR_X', idNouveau: grilles[0].id, nom: 'Grille partagée'
        });
        expect(entree.statutConfiance).toBe('nouveau');
        expect(entree.nbParType).toEqual({ grille: 1, cartouche: 1, production: 1 });
        expect(entree.idsIntegres.grille).toEqual([grilles[0].id]);

        const registre = db.getSync('partage_packagesImportes', []);
        expect(registre).toHaveLength(1);
        expect(registre[0].idImport).toBe(entree.idImport);
    });

    it('deux imports du même package coexistent sans collision d\'ids (suffixes distincts)', () => {
        w.partageImport.integrerPackage(packageNettoyeFixture(), {});
        w.partageImport.integrerPackage(packageNettoyeFixture(), {});
        const grilles = db.getSync('partage_grilles', []);
        expect(grilles).toHaveLength(2);
        expect(grilles[0].id).not.toBe(grilles[1].id);
    });
});

describe('lot P3 · trouverImportExistant (mise à jour, R3)', () => {
    it('retrouve un import par auteur normalisé + item principal d\'origine', () => {
        w.partageImport.integrerPackage(packageNettoyeFixture(), {});
        const manifest = packageNettoyeFixture().manifest;
        manifest.auteur.nom = '  MARIE   collègue '; // variations casse/espaces
        expect(w.partageImport.trouverImportExistant(manifest)).not.toBeNull();
    });

    it('retourne null pour un autre item ou un autre auteur', () => {
        w.partageImport.integrerPackage(packageNettoyeFixture(), {});
        const autreItem = packageNettoyeFixture().manifest;
        autreItem.item_principal.id = 'GR_AUTRE';
        expect(w.partageImport.trouverImportExistant(autreItem)).toBeNull();
        const autreAuteur = packageNettoyeFixture().manifest;
        autreAuteur.auteur.nom = 'Quelqu\'un D\'autre';
        expect(w.partageImport.trouverImportExistant(autreAuteur)).toBeNull();
    });
});

describe('lot P3 · retirerImport — retrait par IDENTITÉ', () => {
    it('retire uniquement les entités du package visé, préserve celles d\'un autre import', () => {
        const entree1 = w.partageImport.integrerPackage(packageNettoyeFixture(), {});
        const pkg2 = packageNettoyeFixture();
        pkg2.manifest.auteur.nom = 'Autre Collègue';
        pkg2.entites.grilles[0].id = 'GR_Y';
        pkg2.manifest.item_principal.id = 'GR_Y';
        pkg2.entites.cartouches = [];
        pkg2.entites.productions = [];
        const entree2 = w.partageImport.integrerPackage(pkg2, {});

        expect(w.partageImport.retirerImport(entree1.idImport)).toBe(true);

        const grilles = db.getSync('partage_grilles', []);
        expect(grilles).toHaveLength(1);
        expect(grilles[0].id).toBe(entree2.itemPrincipal.idNouveau);
        expect(db.getSync('partage_cartouches', [])).toHaveLength(0);
        const registre = db.getSync('partage_packagesImportes', []);
        expect(registre).toHaveLength(1);
        expect(registre[0].idImport).toBe(entree2.idImport);
    });

    it('idImport inconnu → false, aucun effet', () => {
        w.partageImport.integrerPackage(packageNettoyeFixture(), {});
        expect(w.partageImport.retirerImport('IMP_fantome')).toBe(false);
        expect(db.getSync('partage_grilles', [])).toHaveLength(1);
    });
});

describe('lot P3 · garde d\'entrée du conteneur', () => {
    it('verifierMagicBytesZip : signature locale ZIP exigée', () => {
        const zip = new Uint8Array([0x50, 0x4B, 0x03, 0x04, 0x00]).buffer;
        const png = new Uint8Array([0x89, 0x50, 0x4E, 0x47]).buffer;
        const vide = new Uint8Array([]).buffer;
        expect(w.partageImport.verifierMagicBytesZip(zip)).toBe(true);
        expect(w.partageImport.verifierMagicBytesZip(png)).toBe(false);
        expect(w.partageImport.verifierMagicBytesZip(vide)).toBe(false);
    });

    it('listerImports : plus récent en premier', () => {
        const e1 = w.partageImport.integrerPackage(packageNettoyeFixture(), {});
        const pkg2 = packageNettoyeFixture();
        pkg2.manifest.item_principal.id = 'GR_Z';
        pkg2.entites.grilles[0].id = 'GR_Z';
        const e2 = w.partageImport.integrerPackage(pkg2, {});
        const liste = w.partageImport.listerImports();
        expect(liste.map(e => e.idImport)).toEqual([e2.idImport, e1.idImport]);
    });
});
