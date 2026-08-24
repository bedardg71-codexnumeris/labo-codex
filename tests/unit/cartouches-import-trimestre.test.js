import { describe, it, expect, beforeEach } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// Sentinelle — import inter-trimestre de cartouches (24 août 2026).
//
// Demandé par Grégoire : « je veux pouvoir importer les cartouches d'un autre
// trimestre, comme je peux le faire avec les autres éléments ».
//
// CE QUE CE FICHIER VERROUILLE, et pourquoi chaque point compte :
//
//  1. Une cartouche est ANCRÉE à sa grille par la clé `cartouches_{grilleId}`.
//     Sans grille d'accueil, elle n'a aucun magasin où vivre. Les deux chemins
//     (rattachement / copie de la grille parente) sont donc la fonctionnalité
//     elle-même, pas un détail d'implémentation.
//
//  2. Le rattachement se décide par LIGNÉE (`memeIdentite`), jamais par le nom.
//     Décider au nom recréerait, à chaque import, le problème de doublons que
//     #291 / #476 viennent de fermer — et Grégoire possède réellement deux
//     échelles homonymes en a2025 (#450).
//
//  3. La lecture de la source passe par la clé d'archive EXPLICITE. `cleSource`
//     retombe volontairement sur la clé globale pour un `cartouches_*` sans
//     copie : on lirait alors le trimestre ACTIF en croyant lire la source
//     (#464/CT-26). Le test 5 est la sentinelle de ce piège précis.

const GRILLE_SOURCE = () => ({
    id: 'GRILLE_A25', nom: 'Grille-5 FR-HOLIS A25',
    criteres: [{ id: 'C1', nom: 'Structure', ponderation: 20 }],
    dansBibliotheque: true
});

const CARTOUCHE = (id, nom) => ({
    id, nom, grilleId: 'GRILLE_A25',
    criteres: [{ id: 'C1', nom: 'Structure' }],
    commentaires: { C1_I: 'À retravailler.' },
    verrouille: false
});

/**
 * Magasin en mémoire, API complète (get/set async + getSync/setSync).
 *
 * ⚠ Rend la RÉFÉRENCE vivante, jamais une copie. C'est le modèle pessimiste, et
 * c'est le fidèle : `db.getSync` sert le memoryCache, donc l'objet lui-même. Une
 * première version de ce faux clonait à la lecture — le test « la source n'est
 * jamais mutée » passait alors quoi qu'il arrive, et le break-test l'a démontré
 * en mutant volontairement la source SANS faire rougir le test.
 */
function faireDb(initial) {
    const donnees = JSON.parse(JSON.stringify(initial));
    return {
        _donnees: donnees,
        async get(cle) { return cle in donnees ? donnees[cle] : null; },
        async set(cle, valeur) { donnees[cle] = valeur; },
        getSync(cle, defaut) { return cle in donnees ? donnees[cle] : (defaut !== undefined ? defaut : null); },
        setSync(cle, valeur) { donnees[cle] = valeur; }
    };
}

const TRIMESTRES = [
    { id: 'h2026', nom: 'Hiver 2026', actif: true },
    { id: 'a2025', nom: 'Automne 2025', actif: false }
];

function monter(initial) {
    const db = faireDb(initial);

    const cle = (nom) => (nom.startsWith('cartouches_') ? nom : `h2026_${nom}`);
    const cleSource = (nom, src) => {
        if (nom.startsWith('cartouches_') || nom === 'grillesTemplates') {
            const copie = `${src}_${nom}`;
            if (db.getSync(copie, null) !== null) return copie;
        }
        return nom.startsWith('cartouches_') ? nom : `${src}_${nom}`;
    };

    let compteur = 0;
    const genererIdUnique = (prefixe) => `${prefixe}${++compteur}`;

    const BibliothequeUI = {
        forgerInspireDe: (src) => ({ nom: (src && src.nom) || 'Inconnu', auteur: 'Test', date: '2026-08-24', sourceId: src && src.id }),
        obtenirAuteurActif: () => 'Grégoire Bédard'
    };

    // identite-item.js et partage-section.js sont chargés RÉELS : la sentinelle
    // éprouve la mécanique du projet, pas une imitation écrite pour elle.
    const winId = chargerScript('js/identite-item.js');
    const winPartage = {};
    winPartage.cle = cle;
    chargerScript('js/partage-section.js', {
        db, cle, genererIdUnique, BibliothequeUI,
        echapperHtml: (s) => String(s == null ? '' : s)
    }, winPartage);

    const notifs = [];
    const win = chargerScript('js/cartouches.js', {
        db, cle, cleSource, genererIdUnique, BibliothequeUI,
        partageSection: winPartage.partageSection,
        memeIdentite: winId.memeIdentite,
        ajouterAvecGardeIdentite: winId.ajouterAvecGardeIdentite,
        echapperHtml: (s) => String(s == null ? '' : s),
        notifications: {
            succes: (m, d) => notifs.push({ type: 'succes', m, d }),
            info: (m, d) => notifs.push({ type: 'info', m, d }),
            erreur: (m, d) => notifs.push({ type: 'erreur', m, d })
        },
        obtenirTrimestres: () => TRIMESTRES,
        obtenirTrimestreId: () => 'h2026',
        alert: () => {}, confirm: () => true
    });

    return { win, db, notifs };
}

describe('Cartouches · import depuis un autre trimestre', () => {
    let ctx;

    beforeEach(() => {
        ctx = monter({
            a2025_grillesTemplates: [GRILLE_SOURCE()],
            a2025_cartouches_GRILLE_A25: [CARTOUCHE('CART_1', 'Stratégies de lecture'), CARTOUCHE('CART_2', 'Plan de rédaction')],
            h2026_grillesTemplates: []
        });
    });

    it('1 · sans grille d\'accueil, la grille parente est copiée avec la SEULE cartouche demandée', async () => {
        const { win, db } = ctx;
        const res = await win.copierCartoucheDepuisTrimestre('a2025', GRILLE_SOURCE(), CARTOUCHE('CART_1', 'Stratégies de lecture'));

        expect(res.ajoutee).toBe(true);
        expect(res.grilleCreee, 'une grille d\'accueil a été créée').toBeTruthy();

        const grilles = await db.get('h2026_grillesTemplates');
        expect(grilles).toHaveLength(1);
        expect(grilles[0].inspireDeTrimestre).toBe('a2025');

        const cartouches = await db.get(`cartouches_${res.grilleCreee.id}`);
        expect(cartouches, 'UNE seule cartouche, pas tout le lot de la grille').toHaveLength(1);
        expect(cartouches[0].nom).toBe('Stratégies de lecture');
    });

    it('2 · avec une grille de MÊME LIGNÉE déjà là, la cartouche s\'y range et AUCUNE grille n\'est créée', async () => {
        const { win, db } = ctx;
        // La grille locale descend de la grille source (trace posée à l'import de grille).
        await db.set('h2026_grillesTemplates', [{
            id: 'GRILLE_LOCALE', nom: 'Grille-5 FR-HOLIS A25',
            criteres: [], dansBibliotheque: true,
            inspireDe: { nom: 'Grille-5 FR-HOLIS A25', auteur: 'Test', date: '2026-08-24', sourceId: 'GRILLE_A25' }
        }]);

        const res = await win.copierCartoucheDepuisTrimestre('a2025', GRILLE_SOURCE(), CARTOUCHE('CART_1', 'Stratégies de lecture'));

        expect(res.ajoutee).toBe(true);
        expect(res.grilleCreee, 'aucune seconde grille ne doit apparaître').toBeNull();
        expect(res.grilleAccueil.id).toBe('GRILLE_LOCALE');

        const grilles = await db.get('h2026_grillesTemplates');
        expect(grilles, 'toujours UNE seule grille dans le trimestre actif').toHaveLength(1);

        const cartouches = await db.get('cartouches_GRILLE_LOCALE');
        expect(cartouches).toHaveLength(1);
        expect(cartouches[0].grilleId, 'la cartouche pointe la grille d\'accueil').toBe('GRILLE_LOCALE');
        expect(cartouches[0].idOriginal).toBe('CART_1');
    });

    it('3 · réimporter la même cartouche est REFUSÉ par la garde d\'identité', async () => {
        const { win, db } = ctx;
        await db.set('h2026_grillesTemplates', [{
            id: 'GRILLE_LOCALE', nom: 'Grille locale', criteres: [], dansBibliotheque: true,
            inspireDe: { sourceId: 'GRILLE_A25' }
        }]);

        const premier = await win.copierCartoucheDepuisTrimestre('a2025', GRILLE_SOURCE(), CARTOUCHE('CART_1', 'Stratégies de lecture'));
        expect(premier.ajoutee).toBe(true);

        const second = await win.copierCartoucheDepuisTrimestre('a2025', GRILLE_SOURCE(), CARTOUCHE('CART_1', 'Stratégies de lecture'));
        expect(second.ajoutee, 'le second import doit être refusé').toBe(false);
        expect(second.conflit, 'le conflit est nommé pour pouvoir le dire à l\'enseignant').toBeTruthy();

        const cartouches = await db.get('cartouches_GRILLE_LOCALE');
        expect(cartouches, 'pas de second exemplaire empilé en silence').toHaveLength(1);
    });

    it('4a · chemin « copie de la grille » : le trimestre SOURCE n\'est jamais muté', async () => {
        const { win, db } = ctx;
        // On passe les objets RÉELLEMENT lus dans la source — pas des littéraux
        // neufs. Avec des littéraux, la fonction pouvait les muter sans que rien
        // du magasin ne bouge : le test passait sans rien prouver (break-test B6).
        const grilleSource = (await db.get('a2025_grillesTemplates'))[0];
        const cartoucheSource = (await win.lireCartouchesArchivees('a2025', 'GRILLE_A25'))[0];
        const empreinteAvant = JSON.stringify({ grille: grilleSource, cartouche: cartoucheSource });
        const magasinAvant = JSON.stringify(await db.get('a2025_cartouches_GRILLE_A25'));

        await win.copierCartoucheDepuisTrimestre('a2025', grilleSource, cartoucheSource);

        expect(JSON.stringify({ grille: grilleSource, cartouche: cartoucheSource }),
            'les objets lus dans la source sont intacts').toBe(empreinteAvant);
        expect(JSON.stringify(await db.get('a2025_cartouches_GRILLE_A25')),
            'le magasin source est intact').toBe(magasinAvant);
        expect(await db.get('a2025_grillesTemplates')).toHaveLength(1);
    });

    it('4b · chemin « rattachement » : le trimestre SOURCE n\'est jamais muté non plus', async () => {
        const { win, db } = ctx;
        // Le test 4a ne visite QUE le chemin de copie de grille. Le break-test l'a
        // montré : une mutation posée dans le chemin de rattachement ne le faisait
        // pas rougir. Les deux chemins ont donc chacun leur sentinelle.
        await db.set('h2026_grillesTemplates', [{
            id: 'GRILLE_LOCALE', nom: 'Grille locale', criteres: [], dansBibliotheque: true,
            inspireDe: { sourceId: 'GRILLE_A25' }
        }]);

        const grilleSource = (await db.get('a2025_grillesTemplates'))[0];
        const cartoucheSource = (await win.lireCartouchesArchivees('a2025', 'GRILLE_A25'))[0];
        const empreinteAvant = JSON.stringify({ grille: grilleSource, cartouche: cartoucheSource });

        const res = await win.copierCartoucheDepuisTrimestre('a2025', grilleSource, cartoucheSource);
        expect(res.grilleAccueil, 'on est bien passé par le rattachement').toBeTruthy();

        expect(JSON.stringify({ grille: grilleSource, cartouche: cartoucheSource }),
            'les objets lus dans la source sont intacts').toBe(empreinteAvant);
        expect(cartoucheSource.grilleId, 'la cartouche source pointe toujours SA grille').toBe('GRILLE_A25');
    });

    it('3b · ENCHAÎNEMENT des deux chemins : copie de grille, puis réimport → toujours refusé', async () => {
        const { win, db } = ctx;
        // Le cas que la sentinelle unitaire ratait et que la preuve d'intégration a
        // attrapé : le premier import passe par la COPIE DE GRILLE, le second par le
        // RATTACHEMENT. `copiePropre` remplace l'id sans rien poser d'autre — sans
        // trace de provenance posée AVANT, la cartouche déjà là n'était reconnue par
        // aucune lignée, et le réimport en empilait un second exemplaire.
        const premier = await win.copierCartoucheDepuisTrimestre('a2025', GRILLE_SOURCE(), CARTOUCHE('CART_1', 'Stratégies de lecture'));
        expect(premier.grilleCreee, 'premier import : chemin copie de grille').toBeTruthy();

        const second = await win.copierCartoucheDepuisTrimestre('a2025', GRILLE_SOURCE(), CARTOUCHE('CART_1', 'Stratégies de lecture'));
        expect(second.grilleAccueil, 'second import : chemin rattachement').toBeTruthy();
        expect(second.ajoutee, 'et il doit être REFUSÉ').toBe(false);

        const grilles = await db.get('h2026_grillesTemplates');
        expect(grilles, 'aucune seconde grille').toHaveLength(1);
        const cartouches = await db.get(`cartouches_${grilles[0].id}`);
        expect(cartouches, 'aucun second exemplaire de la cartouche').toHaveLength(1);
    });

    it('5 · lireCartouchesArchivees ne retombe JAMAIS sur la clé globale du trimestre actif', async () => {
        const { win, db } = ctx;
        // Le piège : pas de copie d'archive pour cette grille, mais la clé
        // GLOBALE porte des cartouches — celles du trimestre ACTIF.
        await db.set('cartouches_GRILLE_SANS_ARCHIVE', [CARTOUCHE('CART_ACTIF', 'Cartouche du trimestre actif')]);

        const lot = await win.lireCartouchesArchivees('a2025', 'GRILLE_SANS_ARCHIVE');
        expect(lot, 'lire la source ne doit jamais rendre le contenu de l\'actif').toEqual([]);
    });

    it('6 · listerTrimestresAvecCartouches compte les archives et ignore le trimestre actif', async () => {
        const { win } = ctx;
        const liste = await win.listerTrimestresAvecCartouches();

        expect(liste).toHaveLength(1);
        expect(liste[0].id).toBe('a2025');
        expect(liste[0].nom).toBe('Automne 2025');
        expect(liste[0].nombre, 'les deux cartouches archivées sont comptées').toBe(2);
    });

    it('7 · un trimestre sans copie propre de cartouches n\'est pas proposé', async () => {
        const ctx2 = monter({
            a2025_grillesTemplates: [GRILLE_SOURCE()],   // grilles archivées, mais AUCUNE cartouche
            h2026_grillesTemplates: []
        });
        expect(await ctx2.win.listerTrimestresAvecCartouches()).toEqual([]);
    });

    it('8 · sans trimestre source, la section HTML n\'est pas rendue du tout', () => {
        const { win } = ctx;
        expect(win.genererSectionImportTrimestreCartouches([])).toBe('');
        const html = win.genererSectionImportTrimestreCartouches([{ id: 'a2025', nom: 'Automne 2025', nombre: 2 }]);
        expect(html).toContain('selectTrimestreImportCartouches');
        expect(html).toContain('2 cartouches');
        expect(html, 'zéro handler inline — règle de sécurité 2').not.toMatch(/onclick=|onchange=/);
    });
});
