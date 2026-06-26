import { describe, it, expect, beforeEach } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// Brique C du PLAN-namespacing-par-trimestre — pas 3 (cadrage C/D §2.4).
//
// Généralisation de dupliquerGrillePartagee : la lecture des cartouches liées est
// INJECTÉE, pour que la même mécanique de copie serve deux sources aux stockages
// différents — la Voûte (collection plate partage_cartouches, lecteur par défaut)
// et un import inter-trimestre (cartouches par CLÉ cartouches_{grilleId}, lues via
// cleSource au pas 4). La non-régression Voûte est couverte par partage-section-P4.
//
// Invariants verrouillés ici :
//   1. DÉLÉGATION — le lecteur de cartouches injecté est bien utilisé (par clé OU plat) ;
//   2. SOURCE INTACTE — la duplication ne mute jamais la source, même si le db ne
//      protège pas (break-test : c'est copiePropre qui protège, pas le faux db) ;
//   3. REMAP — id neuf + cc.grilleId = id de la copie ; snapshots internes intacts ;
//   4. DESTINATION — clé globale nue (grillesTemplates), pas cle() : la migration des
//      writers relève de la Brique D, pas du pas 3 ;
//   5. TÉMOIN D-C4 — echelleId d'une copie N'EST PAS remappé au pas 3 (report assumé ;
//      ce test rougira quand le pas 4 ajoutera le remappage d'échelle).

function fauxDb(deepCopy = true) {
    const donnees = {};
    const clone = (v) => (deepCopy ? JSON.parse(JSON.stringify(v)) : v);
    return {
        _donnees: donnees,
        getSync(k, defaut = null) {
            return Object.prototype.hasOwnProperty.call(donnees, k) ? clone(donnees[k]) : defaut;
        },
        setSync(k, v) { donnees[k] = JSON.parse(JSON.stringify(v)); }
    };
}

let db, w, compteur;

function charger(deepCopy = true) {
    db = fauxDb(deepCopy);
    compteur = 0;
    w = chargerScript('js/partage-section.js', {
        db,
        genererIdUnique: (p) => p + 'NEUF_' + (++compteur),
        getCleProductions: () => 'h2026_productions',
        alert: () => {}
    });
    w.cle = (k) => 'h2026_' + k;
    w.BibliothequeUI = { obtenirAuteurActif: () => 'Grégoire', formaterTitre: (n) => n };
    return w;
}

// Source « trimestre » : cartouches par CLÉ a2025_cartouches_{grilleId}
// (ce que cleSource produit pour un trimestre source — cleSource testé séparément).
function lireCartouchesParCle(grille) {
    return db.getSync('a2025_cartouches_' + grille.id, []);
}
// Source « plate » : collection unique filtrée par grilleId (forme Voûte).
function lireCartouchesPlat(grille) {
    return db.getSync('source_plate_cartouches', []).filter((c) => c.grilleId === grille.id);
}

beforeEach(() => charger());

describe('Brique C · dupliquerGrillePartagee — lecture de cartouches injectée', () => {
    it('expose la fonction généralisée sur window.partageSection', () => {
        expect(w.partageSection.dupliquerGrillePartagee).toBeTypeOf('function');
    });

    it('SOURCE PAR CLÉ — cartouches lues dans cartouches_{grilleId} (cas inter-trimestre)', () => {
        const grille = { id: 'GR_SRC', nom: 'Grille A25', criteres: [{ id: 'C1', nom: 'Structure' }] };
        db.setSync('a2025_cartouches_GR_SRC', [
            { id: 'CART_SRC', grilleId: 'GR_SRC', nom: 'Rétro', commentaires: { C1_M: 'ok' } }
        ]);
        const r = w.partageSection.dupliquerGrillePartagee(grille, lireCartouchesParCle);
        expect(r.grille.id).toBe('GRILLE_NEUF_1');
        expect(r.nbCartouches).toBe(1);
        const copies = db.getSync('cartouches_GRILLE_NEUF_1', []);
        expect(copies).toHaveLength(1);
        expect(copies[0].grilleId).toBe('GRILLE_NEUF_1');
        expect(copies[0].id).toMatch(/^CART_NEUF_/);
    });

    it('DESTINATION — la grille copiée va dans la clé GLOBALE nue, pas dans cle()', () => {
        const grille = { id: 'GR_D', nom: 'D', criteres: [] };
        w.partageSection.dupliquerGrillePartagee(grille, lireCartouchesParCle);
        expect(db.getSync('grillesTemplates', [])).toHaveLength(1);
        // si le code passait par cle() (w.cle = k => 'h2026_'+k), la copie atterrirait ici :
        expect(db.getSync('h2026_grillesTemplates', [])).toHaveLength(0);
    });

    it('SOURCE PLATE — même mécanique avec un lecteur par filtre (forme Voûte)', () => {
        const grille = { id: 'GR_PLAT', nom: 'Grille plate', criteres: [] };
        db.setSync('source_plate_cartouches', [
            { id: 'CART_A', grilleId: 'GR_PLAT', nom: 'A' },
            { id: 'CART_B', grilleId: 'AUTRE', nom: 'B' }
        ]);
        const r = w.partageSection.dupliquerGrillePartagee(grille, lireCartouchesPlat);
        expect(r.nbCartouches).toBe(1); // seule CART_A est liée à GR_PLAT
        expect(db.getSync('cartouches_' + r.grille.id, [])[0].grilleId).toBe(r.grille.id);
    });

    it('LECTEUR PAR DÉFAUT omis → lecteur Voûte (partage_cartouches)', () => {
        const grille = { id: 'GR_DEF', nom: 'Grille défaut', criteres: [] };
        db.setSync('partage_cartouches', [{ id: 'CART_D', grilleId: 'GR_DEF', nom: 'D' }]);
        const r = w.partageSection.dupliquerGrillePartagee(grille); // pas de 2e argument
        expect(r.nbCartouches).toBe(1);
    });

    it('BREAK-TEST — source intacte byte-à-byte après duplication', () => {
        const grille = { id: 'GR_SRC', nom: 'Grille A25', criteres: [{ id: 'C1', nom: 'X' }], echelleId: 'ECH_A25' };
        db.setSync('a2025_grillesTemplates', [grille]);
        db.setSync('a2025_cartouches_GR_SRC', [
            { id: 'CART_SRC', grilleId: 'GR_SRC', echelleId: 'ECH_A25', commentaires: { C1_M: 'ok' } }
        ]);
        const avant = JSON.stringify([
            db.getSync('a2025_grillesTemplates', []),
            db.getSync('a2025_cartouches_GR_SRC', [])
        ]);
        w.partageSection.dupliquerGrillePartagee(grille, lireCartouchesParCle);
        const apres = JSON.stringify([
            db.getSync('a2025_grillesTemplates', []),
            db.getSync('a2025_cartouches_GR_SRC', [])
        ]);
        expect(apres).toBe(avant);
    });

    it('SOURCE PAR RÉFÉRENCE (db sans deep-copy) — c\'est copiePropre qui protège', () => {
        charger(false); // getSync renvoie la référence réelle, pas une copie défensive
        const grille = { id: 'GR_REF', nom: 'Ref', criteres: [{ id: 'C1', nom: 'X' }] };
        db.setSync('a2025_cartouches_GR_REF', [{ id: 'CART_R', grilleId: 'GR_REF', nom: 'R' }]);
        const lecteurRef = (g) => db._donnees['a2025_cartouches_' + g.id] || [];
        const srcAvant = JSON.stringify(db._donnees['a2025_cartouches_GR_REF']);
        const r = w.partageSection.dupliquerGrillePartagee(grille, lecteurRef);
        // la COPIE a un grilleId remappé...
        expect(db.getSync('cartouches_' + r.grille.id, [])[0].grilleId).toBe(r.grille.id);
        // ...mais la cartouche SOURCE n'est pas mutée (grilleId d'origine conservé)
        expect(JSON.stringify(db._donnees['a2025_cartouches_GR_REF'])).toBe(srcAvant);
        expect(db._donnees['a2025_cartouches_GR_REF'][0].grilleId).toBe('GR_REF');
    });

    it('REMAP — chaque cartouche copiée : id neuf + grilleId = id de la copie', () => {
        const grille = { id: 'GR_M', nom: 'M', criteres: [] };
        db.setSync('a2025_cartouches_GR_M', [
            { id: 'CART_1', grilleId: 'GR_M' },
            { id: 'CART_2', grilleId: 'GR_M' }
        ]);
        const r = w.partageSection.dupliquerGrillePartagee(grille, lireCartouchesParCle);
        const copies = db.getSync('cartouches_' + r.grille.id, []);
        expect(copies).toHaveLength(2);
        copies.forEach((c) => {
            expect(c.grilleId).toBe(r.grille.id);
            expect(c.id).toMatch(/^CART_NEUF_/);
        });
    });

    it('SNAPSHOTS INTERNES — criteres[].id et clés de commentaires préservés (piège #5)', () => {
        const grille = { id: 'GR_S', nom: 'S', criteres: [] };
        db.setSync('a2025_cartouches_GR_S', [{
            id: 'CART_S', grilleId: 'GR_S',
            criteres: [{ id: 'C1', nom: 'Structure' }],
            niveaux: [{ code: 'M', nom: 'Maîtrisé' }],
            commentaires: { C1_M: 'Bien structuré' }
        }]);
        const r = w.partageSection.dupliquerGrillePartagee(grille, lireCartouchesParCle);
        const copie = db.getSync('cartouches_' + r.grille.id, [])[0];
        // ids internes de critères et clés de commentaires NON régénérés (sinon
        // rétroactions orphelines : la clé 'critereId_niveauCode' se désynchronise).
        expect(copie.criteres[0].id).toBe('C1');
        expect(copie.commentaires).toEqual({ C1_M: 'Bien structuré' });
    });

    it('TÉMOIN D-C4 (report assumé) — echelleId NON remappé au pas 3', () => {
        const grille = { id: 'GR_E', nom: 'E', criteres: [], echelleId: 'ECH_A25' };
        db.setSync('a2025_cartouches_GR_E', [{ id: 'CART_E', grilleId: 'GR_E', echelleId: 'ECH_A25' }]);
        const r = w.partageSection.dupliquerGrillePartagee(grille, lireCartouchesParCle);
        // deep-copy sans remappage : echelleId source conservé sur la grille ET la cartouche.
        expect(r.grille.echelleId).toBe('ECH_A25');
        expect(db.getSync('cartouches_' + r.grille.id, [])[0].echelleId).toBe('ECH_A25');
        // → quand le pas 4 (D-C4) copiera+remappera l'échelle, CES assertions rougiront
        //   et signaleront qu'il faut mettre à jour ce témoin.
    });

    it('IDEMPOTENCE — deux duplications successives : ids distincts, source intouchée', () => {
        const grille = { id: 'GR_I', nom: 'I', criteres: [] };
        db.setSync('a2025_cartouches_GR_I', [{ id: 'CART_I', grilleId: 'GR_I' }]);
        const r1 = w.partageSection.dupliquerGrillePartagee(grille, lireCartouchesParCle);
        const r2 = w.partageSection.dupliquerGrillePartagee(grille, lireCartouchesParCle);
        expect(r1.grille.id).not.toBe(r2.grille.id);
        expect(db.getSync('grillesTemplates', [])).toHaveLength(2);
        expect(db.getSync('cartouches_' + r1.grille.id, [])[0].id)
            .not.toBe(db.getSync('cartouches_' + r2.grille.id, [])[0].id);
    });
});
