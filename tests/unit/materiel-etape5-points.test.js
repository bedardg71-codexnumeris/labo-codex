/**
 * « APPORTER MON MATÉRIEL », ÉTAPE 5 DU PLAN « PRÊT POUR LUNDI » — les grilles en points,
 * acceptées telles quelles.
 *
 * Consigne : plans de travail/CONSIGNE-LOT-2026-10-17-apporter-mon-materiel-5-points.md (« Les bancs »).
 *
 * Ce que ce banc verrouille :
 *   G — LES DEUX GRILLES FICTIVES de la forme de 1995 (avec et sans colonne « Partie ») : lues
 *       juste sans rien toucher — critères, parties, descriptions, points, total.
 *   L — LA LECTURE : une case de critère sur plusieurs lignes ; la colonne des points (en-tête ou
 *       cases) ; « Commentaires » vide ; « Partie » proposée, ou pas ; une ligne de total ; ni
 *       niveau ni points.
 *   A — L'ASSISTANT : ses étapes ; les points, entiers de 1 à 100, total libre, sans « Ramener à 100 % ».
 *   C — LA CRÉATION : la grille seule, analytique, `grilleEntierementEnPoints` vrai (le prédicat de
 *       l'application) ; ni échelle ni cartouche écrites.
 *   U — L'INTERFACE : étape « Points », Vérification Critère | Description | Points, confirmation.
 *   N — NON-RÉGRESSION : les grilles à niveaux se lisent et se créent comme avant.
 *
 * ⛔ Aucun texte d'une grille réelle de Grégoire : critères, explications et parties sont inventés.
 */
import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { JSDOM } from 'jsdom';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');
const fenetreDom = new JSDOM('<!doctype html><html><body></body></html>').window;

function vraiEchapperHtml() {
    const src = readFileSync(path.join(racine, 'js', 'config.js'), 'utf8');
    const fabriquer = new Function('window', 'document', 'console', 'localStorage', 'sessionStorage',
        '"use strict";\n' + src + '\nreturn echapperHtml;');
    const stockage = { getItem: () => null, setItem() {}, removeItem() {}, clear() {} };
    return fabriquer({ addEventListener() {}, removeEventListener() {} }, fenetreDom.document, console, stockage, stockage);
}

/** Un faux `db` qui se comporte comme le vrai pour `modifier` (même forme qu'au lot 2). */
const db = {
    store: new Map(),
    reset() { this.store = new Map(); },
    getSync(k, d) { return this.store.has(k) ? JSON.parse(JSON.stringify(this.store.get(k))) : d; },
    async get(k, d) { return this.getSync(k, d); },
    async set(k, v) { this.store.set(k, JSON.parse(JSON.stringify(v))); },
    async modifier(k, mutateur, d) {
        const r = await mutateur(await this.get(k, d));
        if (r === undefined) return undefined;
        await this.set(k, r);
        return r;
    }
};

let w, L, A, C, materiel, grilleEntierementEnPoints;
let compteur = 0;
beforeAll(() => {
    w = chargerScript('js/materiel-lecture.js', { DOMParser: fenetreDom.DOMParser });
    chargerScript('js/materiel-assistant.js', {}, w);
    chargerScript('js/materiel-creation.js', { db }, w);
    chargerScript('js/materiel.js', { echapperHtml: vraiEchapperHtml(), db }, w);
    L = w.materielLecture; A = w.materielAssistant; C = w.materielCreation; materiel = w.materiel;
    w.genererIdUnique = (p) => p + 'banc' + (++compteur);
    // Le prédicat de l'application (#941), pas une copie.
    ({ grilleEntierementEnPoints } = chargerScript('js/gabarits-utils.js', {
        db: { getSync: (c, d) => (d !== undefined ? d : null), setSync() {}, get: async () => null, set: async () => {} },
        cle: (k) => 'test_' + k, echapperHtml: (t) => String(t == null ? '' : t)
    }));
});
beforeEach(() => {
    w.cle = (k) => 'a2032_' + k;
    w.estTrimestreArchive = () => false;
    db.reset();
});

/* ------------------------------------------------------------------ les grilles fictives */

/** Forme de 1995, AVEC « Partie » : en-tête « CRITÈRES » sur deux colonnes, parties en cases fusionnées verticales. */
const PARTIES = [
    { partie: 'Introduction', criteres: [['Sujet amené', ['Le thème est situé dans un contexte large.'], '/4'], ['Sujet posé', ['La question est formulée clairement.', 'Elle reprend les termes du sujet.'], '/3']] },
    { partie: 'Développement', criteres: [['Arguments', ['Chaque idée est appuyée par un exemple.'], '/18'], ['Citations', ['Elles sont brèves et commentées.'], '/15'], ['Cohérence', ['Les paragraphes s’enchaînent.', 'Les transitions sont explicites.'], '/10']] },
    { partie: 'Conclusion', criteres: [['Synthèse', ['Le parcours est résumé sans redite.'], '/6'], ['Ouverture', ['Une piste neuve est proposée.'], '/8']] }
];
const p = (lignes) => lignes.map(l => '<p>' + l + '</p>').join('');

function grilleAvecPartiesHtml() {
    let h = '<p>Dissertation fictive : grille de correction</p><table>' +
        '<tr><td colspan="2"><p><b>CRITÈRES</b></p></td><td><p><b>NOTE</b></p></td><td><p><b>COMMENTAIRES</b></p></td></tr>';
    PARTIES.forEach((g) => {
        g.criteres.forEach(([nom, expl, pts], k) => {
            h += '<tr>' + (k === 0 ? '<td rowspan="' + g.criteres.length + '"><p>' + g.partie + '</p></td>' : '') +
                '<td>' + p([nom].concat(expl)) + '</td><td><p>' + pts + '</p></td><td><p>&nbsp;</p></td></tr>';
        });
    });
    return h + '</table>';
}

/** Forme de 1995, SANS « Partie » : « CRITÈRES | NOTE | COMMENTAIRES », des formes de points variées. */
const SIMPLES = [
    ['Compréhension du texte', ['Les idées principales sont repérées.'], '/ 5'],
    ['Organisation', ['Le plan est annoncé et suivi.', 'Chaque partie a son rôle.'], '/10'],
    ['Analyse', ['Les procédés sont nommés et interprétés.'], '/20'],
    ['Langue', ['La syntaxe et l’orthographe sont maîtrisées.'], '/15']
];
function grilleSimpleHtml() {
    return '<p>Analyse fictive : barème</p><table>' +
        '<tr><td><p>CRITÈRES</p></td><td><p>NOTE</p></td><td><p>COMMENTAIRES</p></td></tr>' +
        SIMPLES.map(([nom, expl, pts]) => '<tr><td>' + p([nom].concat(expl)) + '</td><td>' + pts + '</td><td></td></tr>').join('') +
        '</table>';
}

const avecParties = () => L.interpreter(L.lireHtml(grilleAvecPartiesHtml()), 'colle');
const simple = () => L.interpreter(L.lireHtml(grilleSimpleHtml()), 'colle');
const exemple = () => L.interpreter(L.lireHtml(L.exempleHtml()), 'exemple');
const texte = (t) => L.interpreter(L.lireTexte(t), 'colle');
const ctx = () => ({ id: (pre) => pre + (++compteur), maintenant: '2026-10-17T12:00:00.000Z' });

/* ========================================================== G — LES GRILLES FICTIVES */

describe('étape 5 · G — une grille de la forme de 1995 se lit juste sans rien toucher', () => {
    it('G.a avec « Partie » : autant de critères que de rangées, noms préfixés de la partie, descriptions, points', () => {
        const m = avecParties();
        const attendu = PARTIES.flatMap(g => g.criteres.map(([nom, expl, pts]) => [g.partie + ' – ' + nom, expl.join('\n'), pts.replace('/', '')]));
        expect(m.criteres.map(c => [c.nom.valeur, c.description.valeur, c.ponderation.valeur])).toEqual(attendu);
        expect(m.criteres.every(c => c.ponderation.etat === 'repris')).toBe(true);
        expect(m.enPoints).toBe(true);
        expect(m.niveaux).toEqual([]);
        expect(m.aClasser).toEqual([]);
        expect(m.manquesLecture).toEqual([]);
        expect(m.nom.valeur).toBe('Dissertation fictive : grille de correction');
    });

    it('G.b avec « Partie » : rôles proposés — partie, noms, points, commentaires ignorés ; l’en-tête ignoré', () => {
        const r = avecParties().roles;
        expect(r.colonnes).toEqual(['partie', 'noms', 'pond', 'ignorer']);
        expect(r.rangees).toEqual(['ignorer'].concat(Array(7).fill('critere')));
    });

    it('G.c sans « Partie » : noms, descriptions, points (« / 5 » compris) ; rôles noms, points, ignorés', () => {
        const m = simple();
        expect(m.criteres.map(c => [c.nom.valeur, c.description.valeur, c.ponderation.valeur]))
            .toEqual(SIMPLES.map(([nom, expl, pts]) => [nom, expl.join('\n'), pts.replace(/[/ ]/g, '')]));
        expect(m.roles.colonnes).toEqual(['noms', 'pond', 'ignorer']);
        expect(m.enPoints).toBe(true);
        expect(m.aClasser).toEqual([]);
    });

    it('G.d total juste ; rien ne manque ; l’assistant n’a que Sens, Contenu et Vérification', () => {
        const m = A.preparer(avecParties());
        const c = A.calculs(m);
        expect(c.total).toBe(64);
        expect(c.manquants).toEqual([]);
        expect(A.etapesPour(m)).toEqual(['axes', 'roles', 'final']);
        expect(A.calculs(A.preparer(simple())).total).toBe(50);
    });

    it('G.e « Créer ma grille » : la grille seule, analytique, `grilleEntierementEnPoints` vrai ; ni échelle ni cartouche écrites', async () => {
        const r = await C.creer(A.preparer(avecParties()));
        expect(r.erreur).toBeUndefined();
        expect([...db.store.keys()]).toEqual(['a2032_grillesTemplates']);
        const g = db.getSync('a2032_grillesTemplates')[0];
        expect(grilleEntierementEnPoints(g)).toBe(true);
        expect(g.criteres.map(c => c.ponderation)).toEqual([4, 3, 18, 15, 10, 6, 8]);
        expect(r.resume).toMatchObject({ enPoints: true, totalPoints: 64, nbC: 7, ids: { echelle: null, cartouche: null } });
    });
});

/* ================================================================ L — LA LECTURE */

describe('étape 5 · L — la lecture', () => {
    const colonnes = (t) => texte(t).roles.colonnes;

    // Étape 5b (point 6) : les lignes À PUCE de la case de nom sont devenues des sous-critères ; les autres restent la description.
    it('L.a une case de critère sur plusieurs lignes : la 1re est le nom, les suivantes la description (sans puce) ou des sous-critères (à puce)', () => {
        const m = L.interpreter(L.lireHtml('<table><tr><td>C</td><td>Points</td></tr>' +
            '<tr><td><p>Style</p><p>Phrases variées.</p><p>• Vocabulaire précis.</p></td><td>/4</td></tr>' +
            '<tr><td>Langue</td><td>/6</td></tr></table>'), 'colle');
        expect(m.criteres.map(c => [c.nom.valeur, c.description.valeur, c.sousCriteres])).toEqual([['Style', 'Phrases variées.', ['Vocabulaire précis.']], ['Langue', '', []]]);
        expect(m.criteres[1].description.etat).toBe('vide');
    });

    it('L.b la colonne des points par son en-tête : Note, Notes, Points, Pts, /N, Sur N', () => {
        ['Note', 'Notes', 'Points', 'Pts', '/20', 'Sur 20'].forEach((h) => {
            expect(colonnes('Critère\t' + h + '\nX\t4\nY\t6'), h).toEqual(['noms', 'pond']);
        });
    });

    it('L.c la colonne des points par ses cases : surtout « /4 », « 4 pts », « sur 18 » ; jamais des nombres nus', () => {
        expect(colonnes('Critère\tBarème\nX\t/4\nY\t4 pts\nZ\tsur 18')).toEqual(['noms', 'pond']);
        expect(colonnes('Critère\tBarème\nX\t____ /4\nY\t6 points\nZ\tvoir plus bas')).toEqual(['noms', 'pond']);
        expect(colonnes('Critère\tBarème\nX\t4\nY\t6')).toEqual(['noms', 'niveau']);
        expect(colonnes('Critère\tBarème\nX\t/4\nY\tTexte\nZ\tAutre')).toEqual(['noms', 'niveau']);
    });

    it('L.d une colonne « Commentaires » ou « Remarques » VIDE est à ignorer ; remplie, elle reste un niveau', () => {
        expect(colonnes('Critère\tPoints\tRemarques\nX\t/4\t\nY\t/6\t ')).toEqual(['noms', 'pond', 'ignorer']);
        expect(colonnes('Critère\tPoints\tCommentaires\nX\t/4\tBien.\nY\t/6\t')).toEqual(['noms', 'pond', 'niveau']);
    });

    it('L.e « Partie » : la partie court sur sa case fusionnée et s’arrête à une case vide non fusionnée', () => {
        const m = L.interpreter(L.lireHtml('<table><tr><td colspan="2">Critères</td><td>Points</td></tr>' +
            '<tr><td rowspan="2">Début</td><td>Un</td><td>/2</td></tr><tr><td>Deux</td><td>/3</td></tr>' +
            '<tr><td></td><td>Trois</td><td>/4</td></tr><tr><td>Fin</td><td>Quatre</td><td>/5</td></tr></table>'), 'colle');
        expect(m.roles.colonnes).toEqual(['partie', 'noms', 'pond']);
        expect(m.criteres.map(c => c.nom.valeur)).toEqual(['Début – Un', 'Début – Deux', 'Trois', 'Fin – Quatre']);
    });

    it('L.f « Partie » n’est pas proposée sans case fusionnée verticale sous l’en-tête, ni quand la 2e colonne est un niveau', () => {
        expect(colonnes('Partie\tCritère\tPoints\nA\tUn\t/2\nB\tDeux\t/3')).toEqual(['noms', 'niveau', 'pond']);
        // Lot 1, I.j : un critère sur deux rangées, deux niveaux — la rangée du dessous reste sa suite.
        const ij = L.interpreter(L.lireHtml('<table><tr><td>C</td><td>A</td><td>B</td></tr>' +
            '<tr><td rowspan="2">X</td><td>1</td><td>2</td></tr><tr><td>3</td><td>4</td></tr></table>'), 'colle');
        expect(ij.roles.colonnes).toEqual(['noms', 'niveau', 'niveau']);
        expect(ij.roles.rangees).toEqual(['niveaux', 'critere', 'suite']);
    });

    it('L.g « Partie » proposée dans une grille à niveaux quand l’en-tête « Critères » couvre les deux colonnes', () => {
        const m = L.interpreter(L.lireHtml('<table><tr><td colspan="2">Critères</td><td>Fort</td><td>Faible</td></tr>' +
            '<tr><td rowspan="2">Fond</td><td>Thèse</td><td>Nette.</td><td>Floue.</td></tr><tr><td>Preuves</td><td>Solides.</td><td>Rares.</td></tr></table>'), 'colle');
        expect(m.roles.colonnes).toEqual(['partie', 'noms', 'niveau', 'niveau']);
        expect(m.enPoints).toBe(false);
        expect(m.criteres.map(c => c.nom.valeur)).toEqual(['Fond – Thèse', 'Fond – Preuves']);
        expect(m.niveaux.map(n => n.titre.valeur)).toEqual(['Fort', 'Faible']);
    });

    it('L.h « Partie » se choisit à la main, une seule par tableau', () => {
        const m = simple();
        const r = L.changerRole(L.changerRole(m.roles, 'colonnes', 2, 'partie'), 'colonnes', 1, 'partie');
        expect(r.colonnes).toEqual(['noms', 'partie', 'ignorer']);
        expect(L.ROLES_COLONNES.map(x => x.libelle)).toContain('Partie');
        expect(L.ROLES_COLONNES.find(x => x.id === 'pond').libelle).toBe('Points ou pondération');
    });

    it('L.i une ligne « Total » va à classer, avec sa raison : comptée, elle doublerait la note', () => {
        const m = texte('Critère\tPoints\nX\t/4\nY\t/6\nTotal\t/10');
        expect(m.criteres.map(c => c.nom.valeur)).toEqual(['X', 'Y']);
        expect(m.aClasser.map(a => [a.texte, a.raison])).toEqual([['Total · /10', 'Ligne de total : l’application le calcule elle-même']]);
    });

    it('L.j ni niveau ni points : chargée, et le manque se nomme ; aucun point ni part égale inventés', () => {
        const r = L.charger(L.lireTexte('Critère\tRemarques\nX\t\nY\t'), 'colle');
        expect(r.modele).toBeDefined();
        const m = A.preparer(r.modele);
        expect(m.criteres.map(c => c.ponderation)).toEqual([{ valeur: '', etat: 'remplir' }, { valeur: '', etat: 'remplir' }]);
        expect(A.calculs(m).manquants).toContain('les points de chaque critère, ou des colonnes de niveaux, à l’étape « Ce que contient ton tableau »');
        expect(A.etapesPour(m)).toEqual(['axes', 'roles', 'points', 'final']);
    });

    it('L.k une grille en points n’est pas refusée faute de deux niveaux ; une grille à un seul niveau l’est toujours', () => {
        expect(L.charger(L.lireHtml(grilleSimpleHtml()), 'colle').modele).toBeDefined();
        expect(L.charger(L.lireTexte('Critère\tA\nX\tun\nY\tdeux'), 'colle').erreur).toBe(L.MESSAGE_INCOMPLET);
    });
});

/* ================================================================ A — L'ASSISTANT */

describe('étape 5 · A — l’assistant d’une grille en points', () => {
    const avecPoints = (valeurs) => {
        const m = A.preparer(simple());
        m.criteres.forEach((c, i) => { c.ponderation = { valeur: valeurs[i], etat: valeurs[i] ? 'saisi' : 'remplir' }; });
        return m;
    };
    const manques = (m) => A.calculs(m).manquants.filter(t => /points/.test(t));

    it('A.a l’étape « Points » seulement si des points manquent ; « À classer » s’il y a des passages', () => {
        const m = A.preparer(simple());
        m.criteres[1].ponderation = { valeur: '', etat: 'remplir' };
        expect(A.etapesPour(m)).toEqual(['axes', 'roles', 'points', 'final']);
        const t = A.preparer(texte('Critère\tPoints\nX\t/4\nTotal\t/4'));
        expect(A.etapesPour(t)).toEqual(['axes', 'roles', 'classer', 'final']);
        expect(A.NOMS_ETAPES.points).toBe('Points');
    });

    // Étape 5b (point 1) : « / 0 » est accepté — la borne basse passe de 1 à 0.
    it('A.b des points entiers de 0 à 100 ; un manque nommé, au singulier ou au pluriel', () => {
        expect(manques(avecPoints(['5', '10', '20', '15']))).toEqual([]);
        expect(manques(avecPoints(['5', '', '20', '15']))).toEqual(['les points d’un critère']);
        expect(manques(avecPoints(['5', '', '', '15']))).toEqual(['les points de 2 critères']);
        expect(manques(avecPoints(['0', '2,5', '101', '100']))).toEqual(['des points en nombre entier de 0 à 100 pour 2 critères']);
        expect(manques(avecPoints(['-1', '0', '4', '100']))).toEqual(['des points en nombre entier de 0 à 100 pour un critère']);
    });

    it('A.c le total est libre : ni avertissement ni « Ramener à 100 % » ; pas de manque de niveau', () => {
        const c = A.calculs(avecPoints(['5', '10', '20', '15']));
        expect(c).toMatchObject({ total: 50, avertPond: false, peutRamener: false, avertPlages: '', avertNotes: '' });
        expect(c.manquants).toEqual([]);
    });
});

/* ================================================================ C — LA CRÉATION */

describe('étape 5 · C — la grille seule, en points', () => {
    it('C.a `type: \'analytique\'` sur la grille et chaque critère ; pondération = ses points ; aucun descripteur', () => {
        const o = A.construire(A.preparer(avecParties()), ctx());
        expect(o.echelle).toBeNull();
        expect(o.cartouche).toBeNull();
        expect(o.grille.type).toBe('analytique');
        expect(o.grille.criteres.every(c => c.type === 'analytique' && !('descripteurs' in c))).toBe(true);
        expect(o.grille.criteres[1]).toMatchObject({ nom: 'Introduction – Sujet posé', description: 'La question est formulée clairement.\nElle reprend les termes du sujet.', ponderation: 3 });
    });

    it('C.b le critère a la forme de l’éditeur (lot 3a), type mis à part', () => {
        const aNiveaux = A.construire(A.preparer(exemple()), ctx()).grille.criteres[0];
        const enPoints = A.construire(A.preparer(simple()), ctx()).grille.criteres[0];
        const cles = (c) => Object.keys(c).filter(k => k !== 'descripteurs').sort();
        expect(cles(enPoints)).toEqual(cles(aNiveaux));
        expect(enPoints).toMatchObject({ formule: '', niveauSOLO: 'multistructurel', verrouille: false });
    });

    it('C.c `grilleEntierementEnPoints` vrai pour la grille en points, faux pour une grille à niveaux', () => {
        expect(grilleEntierementEnPoints(A.construire(A.preparer(simple()), ctx()).grille)).toBe(true);
        expect(grilleEntierementEnPoints(A.construire(A.preparer(exemple()), ctx()).grille)).toBe(false);
    });
});

/* ================================================================ U — L'INTERFACE */

describe('étape 5 · U — l’interface', () => {
    function rendu(m, id) {
        const etapes = A.etapesPour(m).concat(A.etapesPour(m).indexOf(id) < 0 ? [id] : []);
        const div = fenetreDom.document.createElement('div');
        div.innerHTML = materiel.assistantHtml({ modele: m, etapes, etape: etapes.indexOf(id) });
        return div;
    }

    it('U.a la Vérification : Critère | Description | Points, total « sur N », « Ajouter un critère », rien des niveaux', () => {
        const d = rendu(A.preparer(avecParties()), 'final');
        expect([...d.querySelectorAll('.materiel-verif thead th')].map(th => th.textContent)).toEqual(['Critère', 'Description', 'Points']);
        expect(d.querySelectorAll('.materiel-verif tbody tr')).toHaveLength(7);
        expect(d.querySelector('#materiel-v-pond-0').value).toBe('4');
        expect(d.querySelector('label[for="materiel-v-pond-0"]').textContent).toBe('Points du critère, sur');
        expect(d.querySelector('[data-param="critere.1.description"]').value).toBe('La question est formulée clairement.\nElle reprend les termes du sujet.');
        expect(d.querySelector('.materiel-total').textContent).toBe('Total : sur 64');
        expect(d.querySelector('[data-action="materiel.ajouterCritere"]')).not.toBeNull();
        expect(d.querySelector('[data-action="materiel.ajouterNiveau"], [data-action="materiel.ramenerA100"], [data-action="materiel.choisirNature"]')).toBeNull();
        expect(d.querySelector('#materiel-cree li').textContent).toBe('Une grille en points « Dissertation fictive : grille de correction » (7 critères), sur 64.');
    });

    it('U.b l’étape « Points » : un champ « sur » par critère, étiqueté de son nom', () => {
        const m = A.preparer(simple());
        m.criteres[0].ponderation = { valeur: '', etat: 'remplir' };
        const d = rendu(m, 'points');
        const champs = [...d.querySelectorAll('[id^="materiel-q-points-"]')];
        expect(champs.map(c => c.getAttribute('data-param'))).toEqual(['critere.0.ponderation', 'critere.1.ponderation', 'critere.2.ponderation', 'critere.3.ponderation']);
        expect(d.querySelector('label[for="materiel-q-points-0"]').textContent).toBe('Points de « Compréhension du texte », sur');
        expect(d.querySelector('.materiel-progression').textContent).toContain('3. Points');
        expect(d.querySelector('[data-action="materiel.ramenerA100"]')).toBeNull();
    });

    it('U.c l’aperçu : Critère | Points, « sur N », sans colonne de niveau', () => {
        const div = fenetreDom.document.createElement('div');
        div.innerHTML = materiel.apercuHtml(A.preparer(simple()));
        expect([...div.querySelectorAll('thead th')].map(th => th.textContent)).toEqual(['Critère', 'Points']);
        expect(div.querySelector('tbody .materiel-col-pond').textContent).toBe('sur 5');
    });

    it('U.d la confirmation : la carte « Grille » seule ; « Pour t’en servir… » inchangé', () => {
        const div = fenetreDom.document.createElement('div');
        div.innerHTML = materiel.confirmationHtml({ nom: 'G', nbC: 7, enPoints: true, totalPoints: 64, retro: false, descr: false, ids: {}, niveaux: [] });
        expect([...div.querySelectorAll('[data-action="materiel.voir"]')].map(b => b.getAttribute('data-param'))).toEqual(['grille-criteres', 'productions']);
        expect(div.querySelector('.materiel-carte-cree span').textContent).toBe('7 critères, sur 64 points.');
        expect(div.querySelector('.materiel-suite span').textContent).toBe('Pour t’en servir, associe-la à une production, puis évalue une première copie avec elle.');
    });

    it('U.e tout texte venu du document en sort échappé (aperçu, Vérification, Points)', () => {
        const m = A.preparer(texte('Critère\tPoints\n<img src=x onerror=alert(1)>\t\n<b>Y</b>\t/4'));
        ['final', 'points'].forEach((id) => {
            const d = rendu(m, id);
            expect(d.querySelector('img, b'), id).toBeNull();
        });
        const div = fenetreDom.document.createElement('div');
        div.innerHTML = materiel.apercuHtml(m);
        expect(div.querySelector('img, b')).toBeNull();
        expect(div.textContent).toContain('<img src=x onerror=alert(1)>');
    });
});

/* ================================================================ N — NON-RÉGRESSION */

describe('étape 5 · N — les grilles à niveaux, comme avant', () => {
    it('N.a l’exemple : mêmes rôles, mêmes étapes, échelle et grille créées, holistique', () => {
        const m = A.preparer(exemple());
        expect(m.enPoints).toBe(false);
        expect(m.roles.colonnes).toEqual(['noms', 'pond', 'niveau', 'niveau', 'niveau', 'niveau']);
        expect(A.etapesPour(m)).toEqual(['axes', 'roles', 'nature', 'valeurs', 'classer', 'final']);
        const o = A.construire(m, ctx());
        expect(o.echelle).not.toBeNull();
        expect(o.grille.criteres.every(c => c.type === 'holistique')).toBe(true);
        expect(o.grille).not.toHaveProperty('type');
    });

    it('N.b une pondération à 90 % avertit toujours, et « Ramener à 100 % » reste offert', () => {
        const m = A.preparer(exemple());
        m.criteres[0].ponderation = { valeur: '30', etat: 'saisi' };
        expect(A.calculs(m)).toMatchObject({ total: 90, avertPond: true, peutRamener: true });
    });

    // Relecture de Cowork de 5b (C1) : des cases « 1 », « 2 » seraient des points ; ce sont des textes ici.
    it('N.c une grille à niveaux sans pondération garde ses parts égales', () => {
        expect(texte('C\tA\tB\nX\ta\tb\nY\ta\tb').criteres.map(c => c.ponderation)).toEqual([{ valeur: '50', etat: 'complete' }, { valeur: '50', etat: 'complete' }]);
    });
});
