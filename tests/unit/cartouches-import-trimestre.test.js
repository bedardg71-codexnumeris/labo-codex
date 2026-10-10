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
        setSync(cle, valeur) { donnees[cle] = valeur; },
        // #522 lot 5 : le site écrit par `db.modifier` ; même contrat (un `undefined` n'écrit rien).
        async modifier(cle, mutateur, defaut = null) {
            const r = await mutateur(cle in donnees ? donnees[cle] : defaut);
            if (r !== undefined) donnees[cle] = r;
            return r;
        }
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
        const cartoucheSource = (await win.lireCartouchesDuTrimestre('a2025', 'GRILLE_A25'))[0];
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
        const cartoucheSource = (await win.lireCartouchesDuTrimestre('a2025', 'GRILLE_A25'))[0];
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

    it('5a · un trimestre VIVANT est lisible : ses cartouches sont dans la clé globale, pas dans une archive', async () => {
        // RÉGRESSION du 24 août, vue sur la capture de Grégoire puis reproduite au
        // navigateur. Ma première version ne lisait QUE la copie d'archive
        // `<src>_cartouches_<grille>`. Or depuis #358, `grillesTemplates` est
        // namespacée pour TOUT trimestre : un trimestre jamais archivé a ses grilles
        // dans `<src>_grillesTemplates` et ses cartouches dans le GLOBAL. La section
        // était donc invisible pour le cas le plus courant — le sien.
        const vivant = monter({
            h2026_grillesTemplates: [],
            a2025_grillesTemplates: [{ id: 'GR_VIVANT', nom: 'Grille d\'un trimestre vivant', criteres: [], dansBibliotheque: true }],
            // Aucune copie d'archive : les cartouches sont dans la clé globale.
            cartouches_GR_VIVANT: [CARTOUCHE('CART_V1', 'Stratégies de lecture')]
        });

        const lot = await vivant.win.lireCartouchesDuTrimestre('a2025', 'GR_VIVANT');
        expect(lot, 'les cartouches d\'un trimestre vivant doivent être lues').toHaveLength(1);

        const liste = await vivant.win.listerTrimestresAvecCartouches();
        expect(liste, 'et le trimestre doit donc être propos\u00e9').toHaveLength(1);
        expect(liste[0].nombre).toBe(1);
    });

    // ⚠⚠ CAS RETOURNÉ PAR S5/#623 LE 31 AOÛT 2026 — la prémisse d'origine est morte.
    //
    // Il s'intitulait « une grille présente À L'IDENTIQUE dans le trimestre actif est
    // EXCLUE », et son motif était écrit : « `cartouches_<id>` est un magasin unique,
    // ce serait proposer à l'enseignant ses propres cartouches ».
    //
    // Sous D2-A le magasin n'est plus unique : chaque trimestre a ses propres
    // `<trim>_cartouches_<id>`, et deux trimestres portant la même grille ont des
    // cartouches DIFFÉRENTES. L'exclusion rendait donc invisible le cas où l'import a
    // le PLUS de sens — rapatrier le travail fait l'an dernier sur la même grille.
    //
    // ⮕ Le cas n'est pas supprimé, il est INVERSÉ : ce qui était la garde devient le
    // sujet. Un constat retiré en silence redevient une source qu'on ne peut plus
    // recouper.
    it('5b · une grille présente dans les DEUX trimestres est PROPOSÉE, avec les cartouches de la source', async () => {
        const partage = monter({
            a2025_grillesTemplates: [{ id: 'GR_PARTAGEE', nom: 'Grille partagée', criteres: [], dansBibliotheque: true }],
            h2026_grillesTemplates: [{ id: 'GR_PARTAGEE', nom: 'Grille partagée', criteres: [], dansBibliotheque: true }],
            a2025_cartouches_GR_PARTAGEE: [CARTOUCHE('CART_P1', 'Le travail de l\'an dernier')],
            h2026_cartouches_GR_PARTAGEE: [CARTOUCHE('CART_H1', 'Celui de cette année')]
        });

        const lots = await partage.win.lotsCartouchesDuTrimestre('a2025');
        expect(lots, 'la grille partagée est proposée : les deux magasins ont divergé').toHaveLength(1);
        expect(lots[0].grille.id).toBe('GR_PARTAGEE');
        expect(lots[0].cartouches.map(c => c.id),
            'ce sont les cartouches de la SOURCE, pas celles du trimestre actif').toEqual(['CART_P1']);

        const liste = await partage.win.listerTrimestresAvecCartouches();
        expect(liste, 'et le trimestre source est proposé').toHaveLength(1);
        expect(liste[0].id).toBe('a2025');
    });

    it('6 · listerTrimestresAvecCartouches compte les cartouches et ignore le trimestre actif', async () => {
        const { win } = ctx;
        const liste = await win.listerTrimestresAvecCartouches();

        expect(liste).toHaveLength(1);
        expect(liste[0].id).toBe('a2025');
        expect(liste[0].nom).toBe('Automne 2025');
        expect(liste[0].nombre, 'les deux cartouches archivées sont comptées').toBe(2);
    });

    it('7 · un trimestre dont aucune grille ne porte de cartouche n\'est pas proposé', async () => {
        const ctx2 = monter({
            a2025_grillesTemplates: [GRILLE_SOURCE()],   // des grilles, mais AUCUNE cartouche nulle part
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
