// =====================================================================
// LE JEU DE TAMPONS FOURNI : « OPÉRATIONS » (25 nov. 2026, décisions de Grégoire, 17 h 07 à 17 h 56)
// =====================================================================
// La catégorie fournie `action` s'appelle « Opérations » et porte six tampons : Identification, Relation, Déduction
// (identifiants gardés : action-reperage, action-liaison, action-ouverture), Interprétation, Comparaison, Induction
// (neufs). Incertain, Incomplet et Inexact gardent tout, sauf leur catégorie : « Observations ».
//
// LA CONTRAINTE : rien n'est effacé ni réécrit chez un utilisateur existant. Le jeu fourni est une BASE ; ce que
// chacun a rangé se pose par-dessus, par identifiant. Les cas (a) à (e) de la consigne, puis deux cas que la consigne
// ne nommait pas et que la mesure a fait paraître : (f) l'espace qui a déjà ENREGISTRÉ la fenêtre « Tampons et
// rétroactions » sans rien renommer, et (g) l'ordre rangé d'une catégorie.
//
// Le dessin sur la copie, la palette et la fenêtre : tests/integration/jeu-fourni-operations-2026-11-25.spec.js.
//
// Break-tests (25 nov. 2026) : journal au rapport, plans de travail/RAPPORT-2026-11-25-parcours-9-tampons.md.
import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { chargerScript } from './_helpers/charger-script.js';
import { RACINE } from './_helpers/bac-suivi.js';

const lire = (f) => readFileSync(path.join(RACINE, f), 'utf8');

const OPERATIONS = [
    ['action-reperage', 'Identification', 'operations/identification.svg', 'Tu identifies un élément, le nommes correctement, le restitues avec exactitude.'],
    ['action-liaison', 'Relation', 'operations/relation.svg', 'Tu relies des éléments entre eux.'],
    ['action-ouverture', 'Déduction', 'operations/deduction.svg', 'Tu appliques une idée générale à un cas particulier du texte.'],
    ['action-interpretation', 'Interprétation', 'operations/interpretation.svg', "Tu fais une inférence ou tu expliques l'effet ou le sens que produit un élément."],
    ['action-comparaison', 'Comparaison', 'operations/comparaison.svg', 'Tu rapproches deux éléments pour en dégager les ressemblances et les différences.'],
    ['action-induction', 'Induction', 'operations/induction.svg', 'Tu tires une idée générale de plusieurs exemples.']
];
const MANQUES = [
    ['action-incertain', 'Incertain', 'icons8-help.svg', "L'explication ou le raisonnement est ambigu."],
    ['action-incomplet', 'Incomplet', 'icons8-in-progress.svg', "L'explication ou le raisonnement est inachevé."],
    ['action-inexact', 'Inexact', 'icons8-cancel.svg', "L'explication ou le raisonnement comporte une erreur factuelle."]
];
// Les dessins de Grégoire, tels que la consigne les donne (le corps, après l'en-tête commune).
const ENTETE = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">';
const DESSINS = {
    'operations/identification.svg': '<title>Identification</title><circle cx="12" cy="12" r="9"/><path d="M7.05 12H12M9.75 9.75L12 12L9.75 14.25"/><circle cx="15.6" cy="12" r="2.1" fill="currentColor" stroke="none"/></svg>',
    'operations/relation.svg': '<title>Relation</title><circle cx="12" cy="12" r="9"/><circle cx="6.42" cy="12" r="1.35" fill="currentColor" stroke="none"/><path d="M9.57 12H14.43M12.18 9.75L14.43 12L12.18 14.25"/><circle cx="17.58" cy="12" r="1.35" fill="currentColor" stroke="none"/></svg>',
    'operations/deduction.svg': '<title>Déduction</title><circle cx="12" cy="12" r="9"/><path d="M6.15 12H10.65M10.65 12L16.5 7.05M13.32 6.78L16.5 7.05L16.23 10.23M10.65 12L16.5 16.95M13.32 17.22L16.5 16.95L16.23 13.77"/></svg>',
    'operations/interpretation.svg': '<title>Interprétation</title><circle cx="12" cy="12" r="9"/><circle cx="8.4" cy="12" r="2.1" fill="currentColor" stroke="none"/><path d="M12 12H16.95M14.7 9.75L16.95 12L14.7 14.25"/></svg>',
    'operations/comparaison.svg': '<title>Comparaison</title><circle cx="12" cy="12" r="9"/><path d="M7.5 8.85H16.5M14.25 6.6L16.5 8.85L14.25 11.1M16.5 15.15H7.5M9.75 12.9L7.5 15.15L9.75 17.4"/></svg>',
    'operations/induction.svg': '<title>Induction</title><circle cx="12" cy="12" r="9"/><path d="M7.5 7.05L13.35 12M7.5 16.95L13.35 12M13.35 12H17.85M15.6 9.75L17.85 12L15.6 14.25"/></svg>'
};

/** Le vrai module des tampons, sur un stock en mémoire. `ecritures` : les clés écrites APRÈS le chargement. */
function monter(stockInitial = {}) {
    const stock = structuredClone(stockInitial);
    const depart = structuredClone(stockInitial);
    const ecritures = [];
    const win = { addEventListener() {}, removeEventListener() {} };
    class ImageStub { constructor() { this.src = ''; } addEventListener() {} removeEventListener() {} }
    const db = { ready: false, getSync: (k, d) => (k in stock ? stock[k] : d), setSync: (k, v) => { ecritures.push(k); stock[k] = v; } };
    chargerScript('js/travaux-outils.js', { db, Image: ImageStub }, win);
    win.travauxOutils.rechargerTamponsPersonnalises();
    return { o: win.travauxOutils, stock, depart, ecritures };
}
const fournis = (o, categorie) => o.obtenirAutocollants().filter((a) => !a.custom && !a.legacy && a.categorie === categorie);
const lus = (o, comptes) => o.observationsDesTampons(comptes).map((c) => [c.id, c.nom, c.tampons.map((t) => [t.id, t.nom, t.texte])]);

describe('(a) un espace neuf reçoit « Opérations » et ses six tampons', () => {
    const { o, stock, ecritures } = monter();
    it('la catégorie `action` s\'appelle « Opérations » ; les deux autres ne changent pas', () => {
        expect(o.obtenirNomsCategories()).toEqual({ action: 'Opérations', comprehension: 'Compréhension', observations: 'Observations' });
    });
    it('six tampons, dans l\'ordre, avec leur nom, leur image et leur phrase', () => {
        expect(fournis(o, 'action').map((a) => [a.id, a.nom, a.fichier])).toEqual(OPERATIONS.map((t) => t.slice(0, 3)));
        const phrases = o.obtenirRetroactionsObservations();
        expect(OPERATIONS.map((t) => phrases[t[0]])).toEqual(OPERATIONS.map((t) => t[3]));
        for (const [id, , fichier] of OPERATIONS) expect(o.imageDuTampon(id)).toEqual({ src: 'autocollants/' + fichier, emoji: false });
    });
    it('les six dessins sont dans le dossier des tampons, tels que fournis', () => {
        for (const [fichier, corps] of Object.entries(DESSINS)) {
            expect(existsSync(path.join(RACINE, 'autocollants', fichier)), fichier).toBe(true);
            expect(lire('autocollants/' + fichier).trim(), fichier).toBe(ENTETE + corps);
        }
        expect(lire('autocollants/operations/LICENCE.txt')).toMatch(/Grégoire Bédard[\s\S]*CC BY-NC-SA 4\.0/);
    });
    it('Incertain, Incomplet, Inexact : même identifiant, même nom, même image, même phrase ; sous « Observations », à la suite', () => {
        const obs = fournis(o, 'observations');
        expect(obs).toHaveLength(16);
        expect(obs.slice(-3).map((a) => [a.id, a.nom, a.fichier])).toEqual(MANQUES.map((t) => t.slice(0, 3)));
        const phrases = o.obtenirRetroactionsObservations();
        expect(MANQUES.map((t) => phrases[t[0]])).toEqual(MANQUES.map((t) => t[3]));
        expect(fournis(o, 'action').map((a) => a.id).filter((id) => MANQUES.some((m) => m[0] === id)), 'plus aucun sous « Opérations »').toEqual([]);
    });
    it('« Compréhension » et le reste d\'« Observations » ne bougent pas', () => {
        expect(fournis(o, 'comprehension').map((a) => a.nom)).toEqual(['Unistructurel', 'Multistructurel', 'Relationnel', 'Étendu']);
        expect(fournis(o, 'observations').slice(0, 13).map((a) => a.id)).toEqual(['obs-approfondir', 'obs-attention', 'obs-confusion', 'obs-hoc',
            'obs-integration', 'obs-mecanisme', 'obs-procede', 'obs-relation', 'obs-repetition', 'obs-rupture', 'obs-sans-preuve', 'obs-soupcon', 'obs-longueur']);
    });
    it('ce que l\'étudiant·e lit d\'un tampon posé : le nom et la phrase neufs, sous « Opérations »', () => {
        expect(lus(o, { 'action-reperage': 1, 'action-induction': 2 })).toEqual([['action', 'Opérations',
            [['action-reperage', 'Identification', OPERATIONS[0][3]], ['action-induction', 'Induction', OPERATIONS[5][3]]]]]);
    });
    it('rien n\'est écrit : le jeu fourni se lit, il ne se range chez personne', () => {
        expect(ecritures).toEqual([]);
        expect(stock).toEqual({});
    });
    it('hors de la démo, aucune catégorie n\'est d\'observation d\'office', () => {
        expect(o.tamponsDObservation()).toEqual([]);
        expect(o.tamponDObservation('action-reperage')).toBeNull();
    });
});

describe('(b) un espace où « action-reperage » a été renommé garde SON nom, SON image et SA phrase', () => {
    const IMAGE = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
    const { o, stock, depart, ecritures } = monter({
        personnalisationObservations: { 'action-reperage': { nom: 'Mon tampon fictif', imageBase64: IMAGE } },
        retroactionsObservations: { 'action-reperage': 'Ma phrase fictive.' }
    });
    it('son nom, son image, sa phrase', () => {
        expect(o.getAutocollant('action-reperage').nom).toBe('Mon tampon fictif');
        expect(o.imageDuTampon('action-reperage').src).toBe(IMAGE);
        expect(lus(o, { 'action-reperage': 1 })).toEqual([['action', 'Opérations', [['action-reperage', 'Mon tampon fictif', 'Ma phrase fictive.']]]]);
    });
    it('rien n\'est écrit ni retiré chez lui', () => {
        expect(ecritures).toEqual([]);
        expect(stock).toEqual(depart);
    });
    it('les cinq autres sont ceux du jeu fourni ; une phrase qu\'il n\'a jamais rangée est celle du jeu fourni', () => {
        expect(fournis(o, 'action').slice(1).map((a) => a.nom)).toEqual(OPERATIONS.slice(1).map((t) => t[1]));
        expect(lus(o, { 'action-interpretation': 1 })[0][2]).toEqual([['action-interpretation', 'Interprétation', OPERATIONS[3][3]]]);
    });
});

describe('(c) un espace où la catégorie `action` a été renommée garde SON nom', () => {
    const { o, stock, depart, ecritures } = monter({ nomsCategoriesTampons: { action: 'Mes gestes fictifs', comprehension: 'Compréhension', observations: 'Observations' } });
    it('son nom, partout où la catégorie est nommée', () => {
        expect(o.obtenirNomsCategories().action).toBe('Mes gestes fictifs');
        expect(lus(o, { 'action-liaison': 1 })[0].slice(0, 2)).toEqual(['action', 'Mes gestes fictifs']);
        expect(ecritures).toEqual([]);
        expect(stock).toEqual(depart);
    });
});

describe('(d) un tampon « action-incertain » déjà posé sur une copie reste lisible', () => {
    const { o, ecritures } = monter();
    it('il existe toujours sous son identifiant, avec son image ; l\'étudiant·e le lit sous « Observations », avec la même phrase', () => {
        expect(o.getAutocollant('action-incertain')).toMatchObject({ id: 'action-incertain', nom: 'Incertain', fichier: 'icons8-help.svg' });
        expect(o.imageDuTampon('action-incertain')).toEqual({ src: 'autocollants/icons8-help.svg', emoji: false });
        expect(existsSync(path.join(RACINE, 'autocollants', 'icons8-help.svg'))).toBe(true);
        expect(lus(o, { 'action-incertain': 2 })).toEqual([['observations', 'Observations', [['action-incertain', 'Incertain', MANQUES[0][3]]]]]);
        expect(ecritures).toEqual([]);
    });
    it('le profil des actions le compte toujours : il compte par identifiant, pas par catégorie', () => {
        const source = lire('js/actions-rlo.js');
        for (const [id] of MANQUES) expect(source).toContain(`'${id}'`);
        expect(source, 'témoin : aucun regroupement par catégorie dans ce module').not.toMatch(/categorie\s*===/);
        expect(source.length, 'règle 10 : la source lue n\'est pas vide').toBeGreaterThan(3000);
    });
});

describe('(e) un espace qui a déjà créé à la main un tampon « Interprétation » sous `action` garde le sien, et reçoit aussi le fourni', () => {
    const { o, stock, depart, ecritures } = monter({
        tamponsPersonnalises: [{ id: 'custom-fictif-1', nom: 'Interprétation', categorie: 'action' }],
        retroactionsObservations: { 'custom-fictif-1': 'Ma phrase à moi.' }
    });
    it('deux tampons du même nom, deux identifiants : rien n\'est supprimé, rien n\'est fusionné', () => {
        const homonymes = o.obtenirAutocollants().filter((a) => a.categorie === 'action' && a.nom === 'Interprétation');
        expect(homonymes.map((a) => [a.id, !!a.custom])).toEqual([['action-interpretation', false], ['custom-fictif-1', true]]);
        expect(lus(o, { 'custom-fictif-1': 1, 'action-interpretation': 1 })[0][2]).toEqual([
            ['action-interpretation', 'Interprétation', OPERATIONS[3][3]], ['custom-fictif-1', 'Interprétation', 'Ma phrase à moi.']]);
        expect(ecritures).toEqual([]);
        expect(stock).toEqual(depart);
    });
});

describe('(f) ASSUMÉ, pas réparé : l\'espace qui a déjà ENREGISTRÉ la fenêtre des tampons, sans rien renommer', () => {
    // « Enregistrer » range le nom de CHAQUE tampon et de CHAQUE catégorie affichés, et la phrase de chacun. Un tel
    // espace porte donc les anciens noms comme s'ils étaient les siens : rien ne les distingue d'un choix. Ils restent
    // (rien n'est réécrit chez un utilisateur), et l'image, qui n'était pas rangée, devient le dessin neuf.
    const ANCIEN = {
        personnalisationObservations: { 'action-reperage': { nom: 'Repérage' }, 'action-liaison': { nom: 'Liaison' }, 'action-ouverture': { nom: 'Ouverture' } },
        nomsCategoriesTampons: { action: 'Action', comprehension: 'Compréhension', observations: 'Observations' },
        retroactionsObservations: { 'action-reperage': "L'étudiant·e repère un élément, le nomme correctement, le restitue avec exactitude." }
    };
    const { o, stock, depart, ecritures } = monter(ANCIEN);
    it('il garde « Action », « Repérage », « Liaison », « Ouverture » et son ancienne phrase', () => {
        expect(fournis(o, 'action').slice(0, 3).map((a) => a.nom)).toEqual(['Repérage', 'Liaison', 'Ouverture']);
        expect(lus(o, { 'action-reperage': 1 })).toEqual([['action', 'Action', [['action-reperage', 'Repérage', ANCIEN.retroactionsObservations['action-reperage']]]]]);
    });
    it('MAIS l\'image, jamais rangée, est le dessin neuf : l\'ancien nom sur le nouveau dessin', () => {
        expect(o.imageDuTampon('action-reperage').src).toBe('autocollants/operations/identification.svg');
        expect(o.imageDuTampon('action-ouverture').src).toBe('autocollants/operations/deduction.svg');
    });
    it('il reçoit les trois tampons neufs, avec leur phrase', () => {
        expect(fournis(o, 'action').slice(3).map((a) => a.nom)).toEqual(['Interprétation', 'Comparaison', 'Induction']);
        expect(lus(o, { 'action-comparaison': 1 })[0][2]).toEqual([['action-comparaison', 'Comparaison', OPERATIONS[4][3]]]);
    });
    it('rien n\'est écrit chez lui', () => {
        expect(ecritures).toEqual([]);
        expect(stock).toEqual(depart);
    });
});

describe('(g) l\'ordre rangé d\'une catégorie survit : les neufs à la suite, les manques à la suite d\'« Observations »', () => {
    const { o, stock, depart, ecritures } = monter({
        'demo-actif': 'true',
        ordreAutocollants_action: ['action-ouverture', 'action-inexact', 'action-reperage', 'action-liaison', 'action-incertain', 'action-incomplet'],
        ordreAutocollants_observations: ['obs-soupcon', 'obs-hoc']
    });
    it('« Opérations » : son ordre à lui pour les trois anciens, puis les trois neufs', () => {
        expect(o.tamponsDObservation().map((t) => t.id)).toEqual(['action-ouverture', 'action-reperage', 'action-liaison',
            'action-interpretation', 'action-comparaison', 'action-induction']);
    });
    it('ce que l\'étudiant·e lit sous « Observations » : son ordre, puis le reste dans l\'ordre du jeu fourni, les manques en dernier', () => {
        const ids = lus(o, { 'obs-hoc': 1, 'obs-soupcon': 1, 'action-inexact': 1, 'action-incertain': 1, 'obs-longueur': 1 })[0][2].map((t) => t[0]);
        expect(ids).toEqual(['obs-soupcon', 'obs-hoc', 'obs-longueur', 'action-incertain', 'action-inexact']);
        expect(ecritures).toEqual([]);
        expect(stock).toEqual(depart);
    });
});

describe('La démo : « Opérations » y est une catégorie d\'observation, par LECTURE', () => {
    it('dans la démo, « Observer » reçoit les six tampons, dans la forme qu\'une inscription copie ; rien n\'est rangé', () => {
        const { o, stock, ecritures } = monter({ 'demo-actif': 'true' });
        expect(o.tamponsDObservation()).toEqual(OPERATIONS.map(([id, nom]) => ({ id, nom, categorieId: 'action', categorieNom: 'Opérations', critere: '', emoji: '' })));
        expect(o.tamponDObservation('action-reperage')).toMatchObject({ id: 'action-reperage', nom: 'Identification' });
        expect(o.tamponDObservation('action-incertain'), 'un manque n\'est pas un tampon d\'observation : sa catégorie n\'est pas cochée').toBeNull();
        expect(ecritures).toEqual([]);
        expect(stock).toEqual({ 'demo-actif': 'true' });
        expect('categoriesObservation' in stock).toBe(false);
    });
    it('hors de la démo, le même espace n\'offre rien : rien de la démo n\'en sort', () => {
        for (const drapeau of [undefined, null, 'false', true]) {
            const { o } = monter(drapeau === undefined ? {} : { 'demo-actif': drapeau });
            expect(o.tamponsDObservation(), String(drapeau)).toEqual([]);
        }
    });
    it('dans la démo, ce que l\'utilisateur a coché lui-même reste, et « Opérations » s\'y ajoute sans doublon', () => {
        const { o, stock } = monter({ 'demo-actif': 'true', categoriesObservation: ['observations'] });
        expect([...new Set(o.tamponsDObservation().map((t) => t.categorieId))].sort()).toEqual(['action', 'observations']);
        expect(stock.categoriesObservation).toEqual(['observations']);
        const deja = monter({ 'demo-actif': 'true', categoriesObservation: ['action'] });
        expect(deja.o.tamponsDObservation().map((t) => t.id)).toEqual(OPERATIONS.map((t) => t[0]));
    });
    it('une catégorie `action` retirée de la palette par l\'utilisateur n\'est pas offerte, même dans la démo', () => {
        const { o } = monter({ 'demo-actif': 'true', categoriesMasquees: ['action'] });
        expect(o.tamponsDObservation()).toEqual([]);
    });
    it('ce qui VOYAGE lit la liste rangée, jamais la lecture de la démo', () => {
        const source = lire('js/travaux-outils.js');
        expect(source).toContain("var catsObservation = _categoriesObservationRangees();   // ce qui voyage");
        expect(source.match(/db\.setSync\(CLE_CATEGORIES_OBSERVATION/g), 'un seul écrivain').toHaveLength(1);
    });
});

describe('Le parcours 9, « Je regarde » : le tampon de l\'histoire', () => {
    const code = lire('js/parcours-cibles.js');
    it('« Remplir » touche les tampons de la saisie (a), et la bulle ne passe à sa seconde forme que s\'ils sont retenus', () => {
        expect(code).toContain('toucherLesTampons(a);');
        expect(code).toContain('return cochesSont(bloc, a) && tamponsSont(a) && !!note && note.value === a.noteBreve;');
    });
    it('le tampon que la bulle 5 nomme est celui que « Remplir » touche, et son nom est celui du jeu fourni ; le texte qu\'elle cite est celui qu\'il pose', () => {
        const win = { addEventListener() {}, removeEventListener() {}, Assistance: { enregistrer() {} }, PACK_DEMARRAGE: chargerScript('js/pack-demo-10.js').PACK_DEMARRAGE };
        chargerScript('js/parcours-cibles.js', { db: { getSync: (k, d) => d } }, win);
        const P = win.ParcoursCibles;
        const [a, b, c] = P.histoire();
        expect(a.tampons.map((t) => t.id)).toEqual(['action-reperage']);
        expect(a.noteBreve).toBe("Son hypothèse ne s'appuie pas encore sur le texte.");
        // Le reste de (a), et (b) et (c) en entier, viennent du pack, non modifié (il ne change qu'avec une release).
        const pack = win.PACK_DEMARRAGE.groupeParStandards.histoire.inscriptions;
        expect([a.date, a.niveau, a.criteres, b, c]).toEqual([pack[0].date, pack[0].niveau, pack[0].criteres, pack[1], pack[2]]);
        expect(pack[0].tampons, 'témoin : le pack ne porte pas le tampon').toBeUndefined();
        const { o } = monter({ 'demo-actif': 'true' });
        const offert = o.tamponsDObservation().find((x) => x.id === a.tampons[0].id);
        expect(offert.nom, 'le nom que la bulle dit est celui du jeu fourni').toBe(a.tampons[0].nom);
        const bulle5 = P.textes[4].puis[0].map((l) => l[1]);
        expect(bulle5[1]).toBe(`Il a touché le tampon « ${offert.nom} » : un geste que Marmotte Pétillante fait déjà bien. Un tampon d'observation ne pose pas de niveau.`);
        expect(bulle5[2]).toBe(`Il a écrit : « ${a.noteBreve} »`);
    });
});
