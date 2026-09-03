/**
 * Sentinelle — LES TAMPONS PAR GRILLE, lot 1 : une seule source de lecture
 * (3 septembre 2026, cadrage « les tampons cessent d'être une liste de
 * français, longue de dix »).
 *
 * Ce que ce lot change : les dix codes d'erreur quittent `travaux-outils.js`
 * pour devenir le REPLI d'un module pur, `js/tampons-erreurs.js`, et une grille
 * dont le critère algorithmique porte le geste d'activation fournit ses
 * propres tampons — ses sous-critères. Décision de Grégoire, le 3 septembre :
 * « les tampons sont les sous-critères », activation par geste partout.
 *
 * Ce que cette sentinelle verrouille :
 *   A  LE REPLI = HIER, AU CARACTÈRE PRÈS — dix identifiants, noms, couleurs,
 *      numéros, et l'empreinte des dix textes déplacés ;
 *   B  les quatre clés globales de personnalisation sont RESPECTÉES, avec les
 *      règles d'hier (ordre de mauvaise longueur ignoré, objet de textes qui
 *      remplace tout) ;
 *   C  une grille activée rend ses sous-critères — code, nom, couleur, texte —
 *      et retombe sur le repli dès qu'un maillon manque ;
 *   D  `tampon()` ne rend JAMAIS null : un tampon posé ne se perd pas ;
 *   E  copie → production → grille, chaque maillon manquant rend null ;
 *   F  les témoins de source : la constante est partie, le module est chargé
 *      avant ses trois lecteurs, et après le registre #581.
 *
 * Break-tests joués le 3 septembre 2026 — voir le bloc SESSION 19 de SESSION.md.
 */
import { describe, it, expect } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');
const source = (rel) => readFileSync(path.join(racine, rel), 'utf8');

// ⚠ HIER, relevé dans travaux-outils.js à HEAD `43f7a57b` (CODES_ERREURS_FR
// :557-568, OUTILS.errfr_* :276-285, RETROACTIONS_ERREURS_FR_DEFAUT :621-630).
const IDS_HIER = ['errfr_1', 'errfr_2', 'errfr_3', 'errfr_4', 'errfr_5', 'errfr_6', 'errfr_7', 'errfr_8', 'errfr_9', 'errfr_10'];
const NOMS_HIER = [
    'Construction syntaxique / accord du verbe', 'Subordonnée employée seule', 'Ponctuation / guillemets',
    'Accord dans le groupe du nom', 'Accord du pronom / lien avec son antécédent', 'Accord du participe passé',
    'Mot invariable', 'Déterminant', 'Vocabulaire / anglicisme', 'Orthographe d’usage / typographie'
];
const NOMS_COURTS_HIER = [
    'Construction syntaxique', 'Subordonnée seule', 'Ponctuation / guillemets', 'Accord dans le GN',
    'Accord du pronom', 'Accord part. passé', 'Mot invariable', 'Déterminant', 'Vocabulaire / anglicisme', 'Orthographe / typo'
];
const COULEURS_HIER = ['#c62828', '#c62828', '#e65100', '#1565c0', '#1565c0', '#1565c0', '#7b1fa2', '#7b1fa2', '#2e7d32', '#2e7d32'];
// sha256 des dix textes joints par « \n », dans l'ordre des identifiants,
// mesuré sur HEAD `43f7a57b` (4 190 caractères). Un texte retouché la change.
const SHA_TEXTES_HIER = 'ac157daf5a110d8dbbab62b43510135377b262bb328231a955b2524d0e950f3c';

/** Un bac à sable : le registre #581, puis le module, avec un faux `db` lu dans `magasin`. */
function charger(magasin = {}, extras = {}) {
    const fenetre = {};
    chargerScript('js/evaluation-enonces.js', {}, fenetre);
    const db = { getSync: (k, d) => (Object.prototype.hasOwnProperty.call(magasin, k) ? magasin[k] : d) };
    chargerScript('js/tampons-erreurs.js', Object.assign({ db, cle: (k) => 'a2026_' + k }, extras), fenetre);
    return fenetre;
}

const SC_PHILO = [
    { id: 'sc_0', code: '0', nom: 'Aucune erreur',       ponderation: 0,   retroaction: 'Rien à cibler.' },
    { id: 'sc_1', code: '1', nom: 'Thèse non dégagée',   ponderation: 1,   retroaction: 'La thèse doit être explicite.' },
    { id: 'sc_2', code: '2', nom: 'Argument circulaire', ponderation: 0.5, retroaction: '', couleur: '#123456' },
    { id: 'sc_3', code: '3', nom: '',                    ponderation: 1 },
    { id: 'sc_4', code: '1', nom: 'Doublon du code 1',   ponderation: 1,   retroaction: 'ne doit pas sortir' }
];
const grille = (sousCriteres, drapeau = true, extra = {}) => ({
    id: 'G1', nom: 'Philo', criteres: [Object.assign({
        id: 'CR', nom: 'Rigueur', type: 'algorithmique', ponderation: 20,
        tamponsDepuisSousCriteres: drapeau, sousCriteres
    }, extra)]
});

/* ============================================================ A — LE REPLI */

describe('tampons par grille · A — le repli est hier, au caractère près', () => {
    it('A.a dix tampons, mêmes identifiants, mêmes noms, mêmes couleurs, numérotés 1 à 10', () => {
        const liste = charger().tamponsErreurs.listeTampons(null);
        expect(liste.map(t => t.id)).toEqual(IDS_HIER);
        expect(liste.map(t => t.nom)).toEqual(NOMS_HIER);
        expect(liste.map(t => t.nomCourt)).toEqual(NOMS_COURTS_HIER);
        expect(liste.map(t => t.couleur)).toEqual(COULEURS_HIER);
        expect(liste.map(t => t.numero)).toEqual(['1', '2', '3', '4', '5', '6', '7', '8', '9', '10']);
        expect(liste.map(t => t.code)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
        expect(liste.every(t => t.source === 'repli')).toBe(true);
    });

    it('A.b les dix textes sont ceux d\'hier — empreinte sha256 identique', () => {
        const m = charger().tamponsErreurs;
        const textes = IDS_HIER.map(id => m.RETROACTIONS_DEFAUT[id]).join('\n');
        expect(createHash('sha256').update(textes, 'utf8').digest('hex')).toBe(SHA_TEXTES_HIER);
        // Et chaque tampon du repli les porte, sans personnalisation.
        m.listeTampons(null).forEach(t => expect(t.retroaction).toBe(m.RETROACTIONS_DEFAUT[t.id]));
    });

    it('A.c l\'apostrophe typographique de « d’usage » survit — pas d\'uniformisation', () => {
        expect(charger().tamponsErreurs.listeTampons(null)[9].nom).toContain('’');
    });

    it('A.d ce qui est exporté est une copie : le muter ne touche pas la liste', () => {
        const m = charger().tamponsErreurs;
        m.REPLI_DEFAUT[0].nom = 'CASSÉ';
        m.REPLI_DEFAUT.push({ id: 'errfr_99' });
        m.COULEURS_DEFAUT[0] = '#000000';
        expect(m.listeTampons(null).map(t => t.nom)).toEqual(NOMS_HIER);
        expect(m.listeTampons(null)).toHaveLength(10);
        expect(m.listeTampons(null)[0].couleur).toBe('#c62828');
    });
});

/* ============================================================ B — LA PERSONNALISATION */

describe('tampons par grille · B — les quatre clés globales sont respectées, règles d\'hier', () => {
    it('B.a nom et couleur personnalisés par identifiant, les autres intacts', () => {
        const liste = charger({ personnalisationErreursFr: { errfr_3: { nom: 'Ponct.', couleur: '#000001' } } })
            .tamponsErreurs.listeTampons(null);
        expect(liste[2]).toMatchObject({ id: 'errfr_3', nom: 'Ponct.', couleur: '#000001' });
        expect(liste[0]).toMatchObject({ nom: NOMS_HIER[0], couleur: COULEURS_HIER[0] });
    });

    it('B.b l\'ordre personnalisé donne les numéros ; un ordre de mauvaise longueur est ignoré ; un inconnu est filtré', () => {
        const inverse = IDS_HIER.slice().reverse();
        let liste = charger({ ordreErreursFr: inverse }).tamponsErreurs.listeTampons(null);
        expect(liste.map(t => t.id)).toEqual(inverse);
        expect(liste[0]).toMatchObject({ id: 'errfr_10', numero: '1', code: 10 });
        // Neuf entrées : `obtenirOrdreErreursFr` d'hier exigeait dix.
        liste = charger({ ordreErreursFr: IDS_HIER.slice(0, 9) }).tamponsErreurs.listeTampons(null);
        expect(liste.map(t => t.id)).toEqual(IDS_HIER);
        // Dix entrées dont une inconnue : filtrée, numéros sur la liste restante.
        const avecInconnu = IDS_HIER.slice(0, 9).concat(['errfr_x']);
        liste = charger({ ordreErreursFr: avecInconnu }).tamponsErreurs.listeTampons(null);
        expect(liste).toHaveLength(9);
        expect(liste[8].numero).toBe('9');
    });

    it('B.c l\'objet de textes enregistré REMPLACE les défauts, clé par clé — une clé absente est vide', () => {
        const liste = charger({ retroactionsErreursFr: { errfr_1: 'Mon texte' } }).tamponsErreurs.listeTampons(null);
        expect(liste[0].retroaction).toBe('Mon texte');
        expect(liste[1].retroaction).toBe('');
    });

    it('B.d le module ne fait que LIRE — aucune écriture sur `db`', () => {
        const fenetre = {};
        chargerScript('js/evaluation-enonces.js', {}, fenetre);
        const ecritures = [];
        const db = { getSync: () => null, setSync: (k) => ecritures.push(k), set: (k) => ecritures.push(k) };
        chargerScript('js/tampons-erreurs.js', { db }, fenetre);
        fenetre.tamponsErreurs.listeTampons(null);
        fenetre.tamponsErreurs.tampon(null, 'errfr_2');
        fenetre.tamponsErreurs.grilleDeCopie({ productionId: 'P' });
        expect(ecritures).toEqual([]);
    });
});

/* ============================================================ C — LA GRILLE */

describe('tampons par grille · C — une grille activée rend ses sous-critères', () => {
    it('C.a code, nom, couleur, texte — pondération 0 exclue, code en double ignoré, nom vide nommé', () => {
        const m = charger().tamponsErreurs;
        const liste = m.listeTampons(grille(SC_PHILO));
        expect(liste.map(t => t.id)).toEqual(['errfr_1', 'errfr_2', 'errfr_3']);
        expect(liste.map(t => t.numero)).toEqual(['1', '2', '3']);
        expect(liste[0]).toMatchObject({ nom: 'Thèse non dégagée', retroaction: 'La thèse doit être explicite.', couleur: '#c62828', source: 'grille' });
        expect(liste[1]).toMatchObject({ nom: 'Argument circulaire', retroaction: '', couleur: '#123456' });
        // Sans couleur, la couleur des dix par POSITION dans la liste rendue (3e ⮕ #e65100).
        expect(liste[2]).toMatchObject({ nom: 'Code 3', couleur: '#e65100', retroaction: '' });
        expect(liste.some(t => t.nom === 'Doublon du code 1')).toBe(false);
        expect(m.estActive(grille(SC_PHILO))).toBe(true);
    });

    it('C.b sans le geste, la grille est ignorée — le repli, à l\'identique', () => {
        const m = charger().tamponsErreurs;
        expect(m.listeTampons(grille(SC_PHILO, false))).toEqual(m.listeTampons(null));
        // Drapeau ABSENT (une grille d'avant ce lot) — pas `undefined` passé à
        // l'aide, dont la valeur par défaut est `true`.
        const sansDrapeau = grille(SC_PHILO);
        delete sansDrapeau.criteres[0].tamponsDepuisSousCriteres;
        expect(m.listeTampons(sansDrapeau)).toEqual(m.listeTampons(null));
        // Le drapeau est un booléen strict : « 'true' » n'active rien.
        expect(m.listeTampons(grille(SC_PHILO, 'true'))).toEqual(m.listeTampons(null));
        expect(m.estActive(grille(SC_PHILO, false))).toBe(false);
    });

    it('C.c un geste sur une liste sans poids, ou sans critère algorithmique, retombe sur le repli', () => {
        const m = charger().tamponsErreurs;
        expect(m.listeTampons(grille([{ code: '1', nom: 'x', ponderation: 0 }]))).toEqual(m.listeTampons(null));
        expect(m.listeTampons(grille([]))).toEqual(m.listeTampons(null));
        expect(m.listeTampons(grille(SC_PHILO, true, { type: 'standard' }))).toEqual(m.listeTampons(null));
        expect(m.listeTampons({ id: 'G', criteres: [] })).toEqual(m.listeTampons(null));
        expect(m.listeTampons(undefined)).toEqual(m.listeTampons(null));
    });

    it('C.d un code numérique ou à deux chiffres passe tel quel — la série Unicode n\'est pas une limite', () => {
        const liste = charger().tamponsErreurs.listeTampons(grille([
            { code: 12, nom: 'Douze', ponderation: 1 }, { code: ' 7 ', nom: 'Sept', ponderation: 2 }
        ]));
        expect(liste.map(t => t.id)).toEqual(['errfr_12', 'errfr_7']);
        expect(liste.map(t => t.numero)).toEqual(['12', '7']);
    });
});

/* ============================================================ D — JAMAIS NULL */

describe('tampons par grille · D — un tampon posé ne se perd jamais', () => {
    it('D.a un identifiant connu rend son entrée ; un inconnu rend un tampon neutre, numéroté, jamais null', () => {
        const m = charger().tamponsErreurs;
        expect(m.tampon(null, 'errfr_3')).toMatchObject({ id: 'errfr_3', nom: NOMS_HIER[2], numero: '3' });
        const g = grille(SC_PHILO);
        expect(m.tampon(g, 'errfr_2')).toMatchObject({ nom: 'Argument circulaire', numero: '2' });
        const inconnu = m.tampon(g, 'errfr_7');
        expect(inconnu).toMatchObject({ id: 'errfr_7', numero: '7', nom: 'Code 7', couleur: '#888888', retroaction: '', inconnu: true });
        expect(m.tampon(null, undefined)).toMatchObject({ inconnu: true });
        expect(m.tampon(null, 'sym-x')).toMatchObject({ id: 'sym-x', numero: 'sym-x', inconnu: true });
    });
});

/* ============================================================ E — COPIE → GRILLE */

describe('tampons par grille · E — copie → production → grille, chaque maillon manquant rend null', () => {
    const G1 = grille(SC_PHILO);
    const G2 = Object.assign({}, grille(SC_PHILO), { id: 'G2' });
    const magasin = () => ({
        a2026_productions: [{ id: 'P1', grilleId: 'G1' }, { id: 'P2', grilleId: '' }],
        a2026_grillesTemplates: [G1, G2]
    });

    it('E.a copie orpheline, production absente, grille absente ⮕ null', () => {
        const m = charger(magasin()).tamponsErreurs;
        expect(m.grilleDeCopie(null)).toBeNull();
        expect(m.grilleDeCopie({ id: 'F', productionId: '' })).toBeNull();
        expect(m.grilleDeCopie({ id: 'F', productionId: 'P_ABSENTE' })).toBeNull();
        expect(m.grilleDeCopie({ id: 'F', productionId: 'P2' })).toBeNull();
    });

    it('E.b sans lecteur d\'évaluations, `prod.grilleId` sert de repli', () => {
        const m = charger(magasin()).tamponsErreurs;
        expect(m.grilleDeCopie({ id: 'F', productionId: 'P1' })).toBe(G1);
    });

    it('E.c les ÉVALUATIONS de la production tranchent avant `prod.grilleId` (#346 : ce champ peut être périmé)', () => {
        const fenetre = charger(magasin());
        fenetre._modeleProductionPourEval = (prod) => ({ grilleId: prod.id === 'P1' ? 'G2' : '' });
        expect(fenetre.tamponsErreurs.grilleDeCopie({ id: 'F', productionId: 'P1' })).toBe(G2);
        fenetre._modeleProductionPourEval = () => ({ grilleId: 'G_DISPARUE' });
        expect(fenetre.tamponsErreurs.grilleDeCopie({ id: 'F', productionId: 'P1' })).toBeNull();
    });

    it('E.d le mode démo est respecté : `obtenirDonneesSelonMode` passe avant `db`', () => {
        const m = charger(magasin(), {
            obtenirDonneesSelonMode: (nom) => nom === 'productions' ? [{ id: 'P1', grilleId: 'G2' }] : [G2]
        }).tamponsErreurs;
        expect(m.grilleDeCopie({ id: 'F', productionId: 'P1' })).toBe(G2);
    });
});

/* ============================================================ F — LES SOURCES */

describe('tampons par grille · F — la constante est partie, le module est chargé au bon endroit', () => {
    it('F.a `CODES_ERREURS_FR` et les textes par défaut n\'existent plus dans travaux-outils.js ni chez ses lecteurs', () => {
        ['js/travaux-outils.js', 'js/evaluation-retroaction.js', 'js/synthese-retroaction-data.js'].forEach(rel => {
            expect(source(rel).includes('CODES_ERREURS_FR'), `${rel} porte encore la constante`).toBe(false);
        });
        expect(source('js/travaux-outils.js').includes('RETROACTIONS_ERREURS_FR_DEFAUT')).toBe(false);
        // Les dix entrées en dur d'OUTILS sont parties : plus aucun `errfr_N:` littéral.
        expect(source('js/travaux-outils.js')).not.toMatch(/^\s*errfr_\d+:\s*\{/m);
    });

    it('F.b les trois lecteurs passent par `tamponsErreurs`', () => {
        ['js/travaux-outils.js', 'js/evaluation-retroaction.js', 'js/synthese-retroaction-data.js'].forEach(rel => {
            expect(source(rel).includes('tamponsErreurs'), `${rel} ne lit pas le module`).toBe(true);
        });
    });

    it('F.c index.html charge le module APRÈS le registre #581 et AVANT ses trois lecteurs', () => {
        const html = source('index.html');
        const pos = (f) => html.indexOf(`js/${f}.js`);
        expect(pos('tampons-erreurs')).toBeGreaterThan(pos('evaluation-enonces'));
        ['travaux-outils', 'synthese-retroaction-data', 'evaluation-retroaction'].forEach(c => {
            expect(pos('tampons-erreurs'), `avant ${c}.js`).toBeLessThan(pos(c));
        });
    });
});
