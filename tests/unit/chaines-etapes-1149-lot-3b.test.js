/**
 * #1149, LOT 3b — LES CHAÎNES D'ÉTAPES DES ÉCHELLES, CARTOUCHES, PRODUCTIONS ET PRATIQUES (24 oct. 2026).
 * Consigne : plans de travail/CONSIGNE-LOT-2026-10-24-chaines-etapes-3b.md ; étapes validées par Grégoire :
 * plans de travail/CHAINES-ETAPES-3b-etapes-validees.md.
 *
 * E — échelles (echelles.js, `etapesChaineEchelle`, `couvertureDesPourcentages`) : un niveau, deux sans nom,
 *     IDME de départ (0 à 100), un trou, un chevauchement, IDME avec niveau 0, sans repères, repères posés.
 * C — cartouches (cartouches.js, `etapesChaineCartouche`, `niveauxDeLaMatrice`) : sans échelle, matrice
 *     vide, partielle, complète ; les colonnes de la matrice, pas celles de toutes les échelles.
 * P — productions (productions.js, `etapesChaineProduction`) : chaque champ vide un à un, échéance assignée
 *     ou non, le portfolio conteneur sans chaîne.
 * R — pratiques (pratiques-gestion.js, `etapesChainePratique` ; pratique-registre.js,
 *     `methodeDeCalculDeLaPratique`) : sommative à 70, 100, 110 % ; standards avec ou sans échelle ;
 *     spécifications ; active ou non ; la méthode lue comme le moteur la lit.
 * U — les copies uniques : le compte des productions, la somme des pondérations, les méthodes avec échelle.
 *
 * Break-tests (faits le 24 oct.) : voir la demande de relecture.
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { JSDOM } from 'jsdom';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const source = (f) => readFileSync(path.join(racine, f), 'utf8');
const etape = (etapes, id) => etapes.find(e => e.id === id);

const dbVide = { getSync: (k, d) => d, setSync() {}, get: async () => null, set: async () => {}, modifier: async () => undefined };
const echapperHtml = (t) => String(t == null ? '' : t);
const notifications = { succes() {}, erreur() {}, info() {}, avertissement() {}, warning() {} };
const BibliothequeUI = { obtenirAuteurActif: () => 'banc', filtrerParModeDemo: (l) => l, repertoires: { rendre() {} } };

let E, C, P, R, REG;
beforeAll(() => {
    const document = new JSDOM('<!doctype html><html><body></body></html>').window.document;
    const commun = { db: dbVide, cle: (k) => 'a2032_' + k, document, echapperHtml, notifications, BibliothequeUI,
        alert() {}, confirm: () => true, genererIdUnique: (p) => (p || '') + 'X' };
    E = chargerScript('js/echelles.js', commun);
    C = chargerScript('js/cartouches.js', commun);
    P = chargerScript('js/productions.js', { ...commun, productionEnEdition: null,
        formaterDateCourte: (d) => new Date(d + 'T12:00:00').toLocaleDateString('fr-CA', { day: 'numeric', month: 'short' }) });
    R = chargerScript('js/pratiques-gestion.js', commun);
    REG = chargerScript('js/pratiques/pratique-registre.js', commun);
});

/* ======================================================= E — ÉCHELLES */

const niv = (code, nom, min, max) => ({ code, nom, min, max });
const IDME = () => [niv('I', 'Incomplet', 0, 64.99), niv('D', 'Développement', 65, 74.99),
    niv('M', 'Maîtrise', 75, 84.99), niv('E', 'Étendu', 85, 100)];

describe('#1149 · E — les quatre étapes d\'une échelle', () => {
    it('E.a l\'ordre, les libellés, le point d\'arrivée', () => {
        const e = E.etapesChaineEchelle({ id: 'X', niveaux: IDME() }, []);
        expect(e.map(x => [x.id, x.libelle, !!x.arrivee])).toEqual([
            ['niveaux', 'Niveaux', false], ['pourcentages', 'Pourcentages', false],
            ['reperes', 'Repères', false], ['production', 'Production', true]]);
    });

    it('E.b Niveaux : aucun, un niveau, deux niveaux sans nom, quatre nommés', () => {
        const n = (niveaux) => etape(E.etapesChaineEchelle({ niveaux }, []), 'niveaux');
        expect(n([])).toMatchObject({ reglee: false, info: 'aucun' });
        expect(n([niv('A', 'Atteint', 0, 100)])).toMatchObject({ reglee: false, info: '1 niveau' });
        expect(n([niv('', '', 0, 49), niv('', '', 50, 100)])).toMatchObject({ reglee: false, info: '2 niveaux' });
        expect(n([niv('A', '  ', 0, 49), niv('B', 'Bien', 50, 100)])).toMatchObject({ reglee: false });
        expect(n(IDME())).toMatchObject({ reglee: true, info: '4 niveaux' });
    });

    it('E.c Pourcentages : l\'IDME de départ (bornes en ,99) couvre de 0 à 100 %', () => {
        expect(E.couvertureDesPourcentages(IDME())).toEqual({ etat: 'ok' });
        expect(etape(E.etapesChaineEchelle({ niveaux: IDME() }, []), 'pourcentages'))
            .toMatchObject({ reglee: true, info: '0 à 100 %', ton: '' });
    });

    it('E.d Pourcentages : un trou nomme son premier entier, en attention', () => {
        const trou = [niv('A', 'A', 0, 59), niv('B', 'B', 61, 100)];
        expect(E.couvertureDesPourcentages(trou)).toEqual({ etat: 'trou', a: 60 });
        expect(etape(E.etapesChaineEchelle({ niveaux: trou }, []), 'pourcentages'))
            .toMatchObject({ reglee: false, info: 'trou à 60 %', ton: 'attention' });
        // Le haut de l'échelle qui s'arrête avant 100.
        expect(E.couvertureDesPourcentages([niv('A', 'A', 0, 89)])).toEqual({ etat: 'trou', a: 90 });
        // 64,99 puis 65 : aucun trou (l'entier 65 est dans le second).
        expect(E.couvertureDesPourcentages([niv('A', 'A', 0, 64.99), niv('B', 'B', 65, 100)])).toEqual({ etat: 'ok' });
    });

    it('E.e Pourcentages : un chevauchement nomme son premier entier, en attention', () => {
        const chev = [niv('A', 'A', 0, 75), niv('B', 'B', 75, 100)];
        expect(E.couvertureDesPourcentages(chev)).toEqual({ etat: 'chevauchement', a: 75 });
        expect(etape(E.etapesChaineEchelle({ niveaux: chev }, []), 'pourcentages'))
            .toMatchObject({ reglee: false, info: 'chevauchement à 75 %', ton: 'attention' });
    });

    it('E.f Pourcentages : l\'IDME avec niveau 0 couvre de 0 à 100 % (le niveau 0 ne se déduit jamais d\'un chiffre)', () => {
        const avecZero = [niv('0', 'Aucun', 0, 0), ...IDME()];
        expect(E.couvertureDesPourcentages(avecZero)).toEqual({ etat: 'ok' });
        expect(etape(E.etapesChaineEchelle({ niveaux: avecZero }, []), 'pourcentages')).toMatchObject({ reglee: true });
    });

    it('E.g Pourcentages : des bornes vides ne valent pas zéro ; aucune borne, « à poser » sans couleur', () => {
        expect(E.couvertureDesPourcentages([niv('A', 'A', '', ''), niv('B', 'B', 0, 100)])).toEqual({ etat: 'ok' });
        expect(etape(E.etapesChaineEchelle({ niveaux: [niv('', '', '', '')] }, []), 'pourcentages'))
            .toMatchObject({ reglee: false, info: 'à poser', ton: '' });
    });

    it('E.h Repères : sans repères, « à poser », à régler sans couleur ; posés, les deux codes', () => {
        expect(etape(E.etapesChaineEchelle({ niveaux: IDME() }, []), 'reperes'))
            .toMatchObject({ reglee: false, info: 'à poser' });
        expect(etape(E.etapesChaineEchelle({ niveaux: IDME(), seuilSuffisance: 'D' }, []), 'reperes'))
            .toMatchObject({ reglee: false, info: 'à poser' });
        const r = etape(E.etapesChaineEchelle({ niveaux: IDME(), seuilSuffisance: 'D', seuilMaitrise: 'M' }, []), 'reperes');
        expect(r).toMatchObject({ reglee: true, info: 'D · M' });
        expect(r.ton).toBeUndefined();
    });

    it('E.i Production : les productions de CETTE échelle ; aucune en création', () => {
        const prods = [{ echelleId: 'E1' }, { echelleId: 'E2' }, { echelleId: 'E1' }, null];
        expect(etape(E.etapesChaineEchelle({ id: 'E1', niveaux: [] }, prods), 'production')).toMatchObject({ reglee: true, info: '2 prod.' });
        expect(etape(E.etapesChaineEchelle({ id: 'E2', niveaux: [] }, prods), 'production')).toMatchObject({ reglee: true, info: '1 prod.' });
        expect(etape(E.etapesChaineEchelle({ id: null, niveaux: [] }, prods), 'production')).toMatchObject({ reglee: false, info: 'aucune' });
    });
});

/* ======================================================= C — CARTOUCHES */

const GRILLES = [{ id: 'G1', criteres: [{ id: 'CA', nom: 'Structure' }, { id: 'CB', nom: 'Langue' }, { id: 'CC', nom: ' ' }] }];
const ECHELLES = [{ id: 'E4', niveaux: IDME() }, { id: 'E3', niveaux: [niv('X', 'X', 0, 50), niv('Y', 'Y', 51, 90), niv('Z', 'Z', 91, 100)] }];
const cartouche = (commentaires, echelleId = 'E4') => ({ id: 'K1', grilleId: 'G1', echelleId,
    criteres: [{ id: 'CA', nom: 'Structure' }, { id: 'CB', nom: 'Langue' }], niveaux: [], commentaires });
const tout = () => Object.fromEntries(['CA', 'CB'].flatMap(c => ['I', 'D', 'M', 'E'].map(n => [c + '_' + n, 'Texte ' + c + n])));

describe('#1149 · C — les quatre étapes d\'une cartouche', () => {
    it('C.a l\'ordre, les libellés ; Grille compte les critères nommés de la grille', () => {
        const e = C.etapesChaineCartouche(cartouche({}), GRILLES, ECHELLES, []);
        expect(e.map(x => [x.id, x.libelle, !!x.arrivee])).toEqual([
            ['grille', 'Grille', false], ['echelle', 'Échelle', false], ['commentaires', 'Commentaires', false], ['production', 'Production', true]]);
        expect(etape(e, 'grille')).toMatchObject({ reglee: true, info: '2 critères' });
        expect(etape(C.etapesChaineCartouche({ grilleId: 'G_ABSENTE' }, GRILLES, ECHELLES, []), 'grille')).toMatchObject({ reglee: false, info: 'aucun' });
        expect(etape(C.etapesChaineCartouche({ grilleId: '' }, GRILLES, ECHELLES, []), 'grille')).toMatchObject({ reglee: false, info: 'aucun' });
    });

    it('C.b sans échelle : « à choisir », et aucune case à remplir', () => {
        const e = C.etapesChaineCartouche(cartouche({}, ''), GRILLES, ECHELLES, []);
        expect(etape(e, 'echelle')).toMatchObject({ reglee: false, info: 'à choisir' });
        expect(etape(e, 'commentaires')).toMatchObject({ reglee: false, info: 'aucune case' });
    });

    it('C.c matrice vide, partielle, complète : à régler sans couleur jusqu\'à la dernière case', () => {
        const com = (c) => etape(C.etapesChaineCartouche(cartouche(c), GRILLES, ECHELLES, []), 'commentaires');
        expect(com({})).toMatchObject({ reglee: false, info: '0 sur 8' });
        expect(com({}).ton).toBeUndefined();
        const partielle = tout();
        delete partielle.CB_E;
        partielle.CA_I = '   ';
        expect(com(partielle)).toMatchObject({ reglee: false, info: '6 sur 8' });
        expect(com(tout())).toMatchObject({ reglee: true, info: '8 sur 8' });
        expect(etape(C.etapesChaineCartouche(cartouche({}), GRILLES, ECHELLES, []), 'echelle')).toMatchObject({ reglee: true, info: '4 niveaux' });
    });

    it('C.d les cases sont celles que la matrice montre : les niveaux de SON échelle, pas de toutes', () => {
        // Un commentaire sur un niveau d'une autre échelle ne compte pas ; une autre échelle n'ajoute pas de cases.
        const c = tout();
        c.CA_X = 'hors de la matrice';
        expect(etape(C.etapesChaineCartouche(cartouche(c), GRILLES, ECHELLES, []), 'commentaires')).toMatchObject({ info: '8 sur 8' });
        expect(C.niveauxDeLaMatrice(cartouche({}), ECHELLES).map(n => n.code)).toEqual(['I', 'D', 'M', 'E']);
        // L'échelle retrouvée par son idOriginal ; sans elle, la copie que porte la cartouche.
        expect(C.niveauxDeLaMatrice(cartouche({}, 'ORIG'), [{ id: 'COPIE', idOriginal: 'ORIG', niveaux: IDME() }]).length).toBe(4);
        const sansSource = { echelleId: 'PARTIE', niveaux: [{ code: 'A', nom: 'A' }, { code: 'B', nom: 'B' }] };
        expect(C.niveauxDeLaMatrice(sansSource, ECHELLES).map(n => n.code)).toEqual(['A', 'B']);
    });

    it('C.e Production : les productions de CETTE cartouche', () => {
        const prods = [{ cartoucheId: 'K1' }, { cartoucheId: 'K2' }];
        expect(etape(C.etapesChaineCartouche(cartouche({}), GRILLES, ECHELLES, prods), 'production')).toMatchObject({ reglee: true, info: '1 prod.' });
        expect(etape(C.etapesChaineCartouche({ ...cartouche({}), id: null }, GRILLES, ECHELLES, prods), 'production')).toMatchObject({ reglee: false, info: 'aucune' });
    });

    it('C.f les métriques mortes sont parties (leurs éléments n\'étaient plus dans la page)', () => {
        const src = source('js/cartouches.js');
        expect(src).not.toMatch(/function (calculerPourcentageComplete|mettreAJourMetriques)\b/);
        expect(src).not.toMatch(/(calculerPourcentageComplete|mettreAJourMetriques)\(/);
        expect(source('index.html')).not.toMatch(/id="(pctComplete|nbCommentaires)"/);
    });
});

/* ======================================================= P — PRODUCTIONS */

const PLEINE = () => ({ type: 'travail', objectif: 'Analyser', tache: 'Rédiger', grilleId: 'G1', echelleId: 'E1', cartoucheId: 'K1',
    echeancesParGroupe: { GC1: { date: '2026-11-14', assignee: true } }, dateEcheance: '2026-11-14' });

describe('#1149 · P — les six étapes d\'une production', () => {
    it('P.a une production réglée : six étapes, l\'échéance en date courte au point d\'arrivée', () => {
        const e = P.etapesChaineProduction(PLEINE(), 'GC1');
        expect(e.map(x => [x.id, x.libelle, x.reglee, x.info, !!x.arrivee])).toEqual([
            ['objectif', 'Objectif', true, 'écrit', false], ['tache', 'Tâche', true, 'écrite', false],
            ['grille', 'Grille', true, 'choisie', false], ['echelle', 'Échelle', true, 'choisie', false],
            ['cartouche', 'Cartouche', true, 'choisie', false], ['echeance', 'Échéance', true, '14 nov.', true]]);
        expect(e.some(x => x.ton)).toBe(false);
    });

    it('P.b chaque champ vide, un à un, rend son étape « à régler », sans couleur', () => {
        const vide = { objectif: ['objectif', '  ', 'à écrire'], tache: ['tache', '', 'à écrire'], grilleId: ['grille', '', 'à choisir'],
            echelleId: ['echelle', '', 'à choisir'], cartoucheId: ['cartouche', '', 'aucune'] };
        for (const [champ, [id, valeur, info]] of Object.entries(vide)) {
            const e = P.etapesChaineProduction({ ...PLEINE(), [champ]: valeur }, 'GC1');
            expect(etape(e, id), champ).toMatchObject({ reglee: false, info });
            expect(e.filter(x => !x.reglee).map(x => x.id), champ).toEqual([id]);
            expect(etape(e, id).ton, champ).toBeUndefined();
        }
    });

    it('P.c Échéance : non assignée au groupe-cours actif, sans date, ou assignée à un autre : « à planifier »', () => {
        const ech = (p, gc) => etape(P.etapesChaineProduction(p, gc), 'echeance');
        expect(ech({ ...PLEINE(), echeancesParGroupe: { GC1: { date: '2026-11-14', assignee: false } } }, 'GC1')).toMatchObject({ reglee: false, info: 'à planifier' });
        expect(ech({ ...PLEINE(), echeancesParGroupe: { GC1: { date: null, assignee: true } } }, 'GC1')).toMatchObject({ reglee: false, info: 'à planifier' });
        // Sans groupe-cours : la date unique (le repli de obtenirEcheanceEffective).
        expect(ech({ ...PLEINE(), echeancesParGroupe: null, dateEcheance: '2026-12-03' }, null)).toMatchObject({ reglee: true, info: '3 déc.' });
        expect(ech({ ...PLEINE(), echeancesParGroupe: null, dateEcheance: null }, null)).toMatchObject({ reglee: false, info: 'à planifier' });
    });

    it('P.d le portfolio conteneur n\'a pas de chaîne (ni grille ni échéance : ses artefacts sont évalués)', () => {
        expect(P.etapesChaineProduction({ ...PLEINE(), type: 'portfolio' }, 'GC1')).toEqual([]);
        expect(P.etapesChaineProduction({ ...PLEINE(), type: 'artefact-portfolio' }, 'GC1')).toHaveLength(6);
    });
});

/* ======================================================= R — PRATIQUES */

const ctx = (o) => ({ methode: 'moyenne_ponderee', libelleMethode: 'Sommative', totalPonderation: 100, idActive: null,
    methodesAvecEchelle: ['conversion_niveaux'], ...o });

describe('#1149 · R — les étapes d\'une pratique', () => {
    it('R.a sommative : Méthode, Pondération, Groupe-cours (pas d\'échelle)', () => {
        const e = R.etapesChainePratique({ id: 'P1' }, ctx());
        expect(e.map(x => [x.id, x.libelle, !!x.arrivee])).toEqual([
            ['methode', 'Méthode', false], ['ponderation', 'Pondération', false], ['groupe-cours', 'Groupe-cours', true]]);
        expect(etape(e, 'methode')).toMatchObject({ reglee: true, info: 'Sommative' });
    });

    it('R.b la pondération sommative : 70 % à régler sans couleur, 100 % réglée, 110 % critique', () => {
        const pond = (t) => etape(R.etapesChainePratique({ id: 'P1' }, ctx({ totalPonderation: t })), 'ponderation');
        expect(pond(70)).toMatchObject({ reglee: false, info: '70 %', ton: '' });
        expect(pond(100)).toMatchObject({ reglee: true, info: '100 %', ton: '' });
        expect(pond(110)).toMatchObject({ reglee: false, info: '110 %', ton: 'critique' });
    });

    it('R.c standards : l\'échelle paraît, choisie ou non ; pas de pondération', () => {
        const std = (conf) => R.etapesChainePratique({ id: 'P2', configuration: conf },
            ctx({ methode: 'conversion_niveaux', libelleMethode: 'PAN-Standards' }));
        expect(std({}).map(x => x.id)).toEqual(['methode', 'echelle', 'groupe-cours']);
        expect(etape(std({}), 'echelle')).toMatchObject({ reglee: false, info: 'à choisir' });
        expect(etape(std({ echelleId: '' }), 'echelle')).toMatchObject({ reglee: false });
        expect(etape(std({ echelleId: 'E1' }), 'echelle')).toMatchObject({ reglee: true, info: 'choisie' });
    });

    it('R.d spécifications et dénotation : ni échelle ni pondération', () => {
        for (const methode of ['specifications', 'jugement_global']) {
            expect(R.etapesChainePratique({ id: 'P3', configuration: { echelleId: 'E1' } }, ctx({ methode })).map(x => x.id))
                .toEqual(['methode', 'groupe-cours']);
        }
    });

    it('R.e Groupe-cours : active ou non ; Méthode sans méthode, « à choisir »', () => {
        expect(etape(R.etapesChainePratique({ id: 'P1' }, ctx({ idActive: 'P1' })), 'groupe-cours')).toMatchObject({ reglee: true, info: 'active' });
        expect(etape(R.etapesChainePratique({ id: 'P1' }, ctx({ idActive: 'P9' })), 'groupe-cours')).toMatchObject({ reglee: false, info: 'à activer' });
        expect(etape(R.etapesChainePratique({ id: 'P1' }, ctx({ methode: null })), 'methode')).toMatchObject({ reglee: false, info: 'à choisir' });
    });

    it('R.f la méthode, lue comme le moteur la lit : portée, sinon celle de la famille ; rien, null', () => {
        const m = REG.methodeDeCalculDeLaPratique;
        expect(m({ calcul_note: { methode: 'specifications' }, type: 'sommative' })).toBe('specifications');
        expect(m({ config: { calcul_note: { methode: 'conversion_niveaux' } } })).toBe('conversion_niveaux');
        expect(m({ calcul_note: { methode: 'pan_par_objectif' } })).toBe('conversion_niveaux');   // #396
        expect(m({ type: 'sommative' })).toBe('moyenne_ponderee');   // le « Modèle sommatif » adopté (#762)
        expect(m({ configuration: { type: 'denotation' } })).toBe('jugement_global');
        expect(m({ type: 'pan-standards' })).toBe('conversion_niveaux');   // legacy normalisé
        expect(m({})).toBeNull();
        // construireConfigComplete garde son repli : sans rien, conversion_niveaux.
        expect(REG.construireConfigComplete({ id: 'x', nom: 'x' }).calcul_note).toEqual({ methode: 'conversion_niveaux' });
        expect(REG.construireConfigComplete({ id: 'x', nom: 'x', type: 'sommative' }).calcul_note).toEqual({ methode: 'moyenne_ponderee' });
    });
});

/* ======================================================= U — LES COPIES UNIQUES */

describe('#1149 · U — une seule copie de chaque règle', () => {
    it('U.a le compte des productions vit dans productions-liste.js, et son menu le lit', () => {
        expect(source('js/grilles.js')).not.toMatch(/function productionsVisiblesPourLaChaine/);
        const liste = source('js/productions-liste.js');
        expect(liste).toMatch(/function productionsVisiblesPourLaChaine\(\)/);
        expect(liste.match(/dansBibliotheque !== false/g)).toHaveLength(1);
        for (const f of ['js/grilles.js', 'js/echelles.js', 'js/cartouches.js']) {
            expect(source(f), f).toMatch(/productionsVisiblesPourLaChaine\(\)/);
        }
    });

    it('U.b la somme des pondérations des productions : une fonction, lue par la liste et par la chaîne', () => {
        const prods = [{ type: 'travail', ponderation: 40 }, { type: 'artefact-portfolio', ponderation: 30 }, { type: 'portfolio', ponderation: 35 }, null];
        expect(P.totalPonderationProductions(prods)).toBe(75);
        expect(P.totalPonderationProductions(undefined)).toBe(0);
        expect(source('js/productions.js').match(/sum \+ \(prod\.ponderation/g)).toHaveLength(1);
        expect(source('js/pratiques-gestion.js')).toMatch(/totalPonderationProductions\(/);
    });

    it('U.c les méthodes qui consomment une échelle : une liste, que la validation et la chaîne lisent', () => {
        const cfg = source('js/pratiques/pratique-configurable.js');
        expect(cfg.match(/\['conversion_niveaux'\]/g)).toHaveLength(1);
        expect(cfg).toMatch(/METHODES_AVEC_ECHELLE\.includes\(/);
        expect(source('js/pratiques-gestion.js')).toMatch(/window\.METHODES_AVEC_ECHELLE/);
        expect(source('js/pratiques/pratique-registre.js').match(/sommative: 'moyenne_ponderee'/g)).toHaveLength(1);
    });

    it('U.d les quatre conteneurs, chacun son libellé pour le lecteur d\'écran, en tête de sa fiche', () => {
        const html = source('index.html');
        const attendus = { chaineEchelle: ['conteneurEditionEchelle', 'Étapes de l\'échelle'],
            chaineCartouche: ['infoCartouche', 'Étapes de la cartouche'],
            chaineProduction: ['formulaireProduction', 'Étapes de la production'],
            chainePratique: ['conteneurEditionPratique', 'Étapes de la pratique'] };
        for (const [id, [fiche, libelle]] of Object.entries(attendus)) {
            const nav = html.indexOf('<nav id="' + id + '" class="barre-convergence" aria-label="' + libelle + '">');
            const debut = html.indexOf('id="' + fiche + '"');
            expect(nav, id).toBeGreaterThan(debut);
            // En tête : aucun champ de la fiche avant elle (la pratique a sa rangée d'actions au-dessus).
            expect(html.slice(debut, nav), id + ' en tête de sa fiche').not.toMatch(/<(input|select|textarea)\b/);
        }
    });
});
