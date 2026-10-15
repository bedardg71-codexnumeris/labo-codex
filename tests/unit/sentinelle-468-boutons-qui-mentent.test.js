import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');

// Sentinelle #468 (lot L6 « boutons qui mentent, gestes qui plantent », 21 août
// 2026) — un sous-lot par section, chacune break-testée :
//   S1 · CO-18 — les cases à cocher Sélection/Obligatoires du mode hybride se
//        rendent réellement (la balise <label> était laissée ouverte, le parseur
//        avalait l'<input> comme un attribut : la fonctionnalité était inopérante).
//   S2 · CO-05 — l'éditeur d'échelles ne meurt plus APRÈS avoir agi : la
//        suppression notifie (elle appelait afficherEchellesPerformance, absente
//        du dépôt), l'ajout/retrait de niveau va au bout (il écrivait dans
//        #nbNiveauxEchelle, absent d'index.html — TypeError à chaque geste).
//   S3 · CO-12 — dupliquer une pratique et adopter une maquette les font
//        RÉAPPARAÎTRE dans la sidebar : les deux gestes annonçaient un succès
//        alors que la pratique restait rangée hors bibliothèque.
//   S4 · CO-17 — enregistrer une production ne réécrit plus son ÉTAT :
//        verrouille / dansBibliotheque / coursId ne sont posés qu'à la création,
//        et les échéances par groupe ne sont jamais effacées par un `undefined`.
//   S5 · CT-13 — « Exporter » un cours EXPORTE (un fichier arrive), et le geste
//        qui dépose la fiche dans « Cours disponibles à ajouter » porte enfin ce
//        nom-là. Verdict Grégoire du 21 août : deux entrées distinctes.
//   S6 · CO-25 — un gabarit de bibliothèque supprimé NE REVIENT PAS au
//        rechargement suivant (tombstone honoré), et les deux gabarits de
//        cartouches en cul-de-sac ont été retirés (verdict Grégoire du 21 août).

/**
 * Vérificateur de balises ouvrantes non fermées.
 *
 * Cherche, pour chaque `<nomBalise`, le `>` qui la termine — en sautant ce qui
 * vit entre guillemets (une valeur d'attribut peut contenir `>`). Si un `<`
 * survient avant ce `>`, la balise n'a jamais été fermée : le parseur du
 * navigateur avale la suite comme des attributs, et le contenu disparaît.
 * C'est exactement la famille CO-18 — invisible à la lecture, fatale au rendu.
 *
 * @returns {number} le nombre de balises ouvrantes laissées béantes
 */
function baliseNonFermee(html) {
    let compte = 0;
    const rxOuvrante = /<[a-zA-Z][a-zA-Z0-9-]*/g;
    let m;
    while ((m = rxOuvrante.exec(html)) !== null) {
        let i = m.index + m[0].length;
        let guillemet = null;
        let beante = true;
        while (i < html.length) {
            const c = html[i];
            if (guillemet) {
                if (c === guillemet) guillemet = null;
            } else if (c === '"' || c === "'") {
                guillemet = c;
            } else if (c === '>') {
                beante = false;
                break;
            } else if (c === '<') {
                break; // une nouvelle balise s'ouvre alors que celle-ci n'est pas close
            }
            i++;
        }
        if (beante) compte++;
    }
    return compte;
}

function chargerPratiquesGestion() {
    return chargerScript('js/pratiques-gestion.js', {
        echapperHtml: (t) => String(t == null ? '' : t)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;').replace(/'/g, '&#39;')
    });
}

describe('#468 · S1 (CO-18) — les cases du mode hybride se rendent', () => {
    it('le vérificateur attrape bien une balise béante (contrôle de l\'outil)', () => {
        expect(baliseNonFermee('<label class="x" <input type="checkbox"></label>')).toBe(1);
        expect(baliseNonFermee('<label class="x"><input type="checkbox"></label>')).toBe(0);
        // un `>` dans une valeur d'attribut ne ferme pas la balise
        expect(baliseNonFermee('<div title="a > b"><span>x</span></div>')).toBe(0);
    });

    it('genererCheckboxesCategorie rend un HTML sans balise béante', () => {
        const win = chargerPratiquesGestion();
        expect(typeof win.genererCheckboxesCategorie).toBe('function');
        const html = win.genererCheckboxesCategorie(
            [{ id: 'PROD_1', titre: 'Dissertation', categorie: 'selection' },
             { id: 'PROD_2', titre: 'Exposé', categorie: 'obligatoire' },
             { id: 'PROD_3', titre: 'Journal', categorie: null }],
            'selection'
        );
        expect(baliseNonFermee(html)).toBe(0);
    });

    it('chaque production rend une case à cocher branchée sur son handler', () => {
        const win = chargerPratiquesGestion();
        const html = win.genererCheckboxesCategorie(
            [{ id: 'PROD_1', titre: 'Dissertation', categorie: 'selection' },
             { id: 'PROD_2', titre: 'Exposé', categorie: null }],
            'selection'
        );
        // l'<input> doit exister comme BALISE à part entière, pas noyé dans le <label>
        const inputs = html.match(/<input type="checkbox"/g) || [];
        expect(inputs.length).toBe(2);
        expect(html).toContain('data-on-change="toggleProductionCategorieHandler"');
        expect(html).toContain('data-prod-id="PROD_1"');
        // la production déjà dans cette catégorie est cochée
        expect(/<input type="checkbox" checked/.test(html)).toBe(true);
    });

    it('liste vide : message d\'état, aucune case', () => {
        const win = chargerPratiquesGestion();
        const html = win.genererCheckboxesCategorie([], 'obligatoire');
        expect(html).toContain('Aucune production');
        expect(html).not.toContain('<input');
    });
});


/* ------------------------------------------------------------------ S2 · CO-05 */

/**
 * Sandbox minimal pour echelles.js : le module est une IIFE qui touche au DOM.
 * On ne simule PAS un DOM complet — on rend `getElementById` fidèle à la
 * réalité : il rend `null` pour un id absent d'index.html. C'est précisément ce
 * null qui tuait les gestes de CO-05, et c'est ce qu'on veut voir ne plus tuer.
 */
function chargerEchelles(store, idsPresents = []) {
    const elements = {};
    for (const id of idsPresents) {
        elements[id] = { value: '', textContent: '', innerHTML: '', style: {},
                         classList: { add() {}, remove() {}, contains: () => false } };
    }
    const appels = { notifiees: [], listeAffichee: 0 };
    const db = {
        get: async (c) => (c in store ? store[c] : null),
        getSync: (c, d) => (c in store ? store[c] : (d !== undefined ? d : null)),
        set: async (c, v) => { store[c] = v; },
        setSync: (c, v) => { store[c] = v; },
        // #522 lot 2b : l'éditeur d'échelles écrit désormais par la file. Le
        // stub la reproduit fidèlement — lecture, mutation, écriture — y compris
        // le refus : un mutateur qui rend `undefined` n'écrit RIEN.
        modifier: async (c, mutateur, defaut = null) => {
            const lue = c in store ? store[c] : defaut;
            const resultat = await mutateur(lue);
            if (resultat === undefined) return undefined;
            store[c] = resultat;
            return resultat;
        }
    };
    const win = chargerScript('js/echelles.js', {
        db,
        cle: (k) => 'a2026_' + k,
        confirm: () => true,
        alert: () => {},
        document: {
            getElementById: (id) => (id in elements ? elements[id] : null),
            querySelector: () => null,
            querySelectorAll: () => [],
            createElement: () => ({ style: {}, classList: { add() {}, remove() {} }, appendChild() {} }),
            addEventListener() {}
        },
        notifications: {
            succes: (t, d) => appels.notifiees.push(String(t) + ' ' + String(d || '')),
            erreur: () => {}, info: () => {}, avertissement: () => {}
        },
        echapperHtml: (t) => String(t == null ? '' : t)
    });
    return { win, appels, elements, store };
}

const ECHELLE_2_NIVEAUX = {
    id: 'ECH_TEST_468', nom: 'Échelle du test',
    niveaux: [
        { code: 'I', nom: 'Insuffisant', min: 0, max: 59 },
        { code: 'M', nom: 'Maîtrise', min: 60, max: 100 }
    ]
};

describe('#468 · S2 (CO-05) — les gestes de l\'éditeur d\'échelles vont au bout', () => {
    it('supprimer une échelle : elle part ET l\'utilisateur est prévenu', async () => {
        const store = { a2026_echellesTemplates: [ECHELLE_2_NIVEAUX, { id: 'AUTRE', nom: 'Autre', niveaux: [] }] };
        const { win, appels } = chargerEchelles(store);
        win.echelleTemplateActuelle = null;

        await win.supprimerEchelle('ECH_TEST_468');

        // l'écriture a bien eu lieu…
        expect(store.a2026_echellesTemplates.map(e => e.id)).toEqual(['AUTRE']);
        // …et la notification de succès est arrivée : rien n'est mort en chemin
        expect(appels.notifiees.some(m => m.includes('supprim'))).toBe(true);
    });

    it('ajouter un niveau : l\'échelle grandit sans TypeError', async () => {
        // ↻ 11 oct. 2026 (#574) : l'ajout ouvre un niveau EN ATTENTE ; il rejoint
        // l'échelle quand ses cinq champs obligatoires sont posés.
        const store = { a2026_echellesTemplates: [JSON.parse(JSON.stringify(ECHELLE_2_NIVEAUX))] };
        const { win, appels } = chargerEchelles(store);

        await win.ajouterNiveauEchelle('ECH_TEST_468');
        expect(store.a2026_echellesTemplates[0].niveaux.length, 'rien d\'écrit à l\'ouverture').toBe(2);
        for (const [champ, v] of [['code', 'E'], ['nom', 'Étendu'], ['min', 90], ['max', 100], ['valeurCalcul', 95]]) {
            await win.modifierNiveauEnAttente('ECH_TEST_468', champ, v);
        }

        expect(store.a2026_echellesTemplates[0].niveaux.length).toBe(3);
        expect(appels.notifiees.some(m => m.includes('Niveau ajouté'))).toBe(true);
    });

    it('retirer un niveau : l\'échelle rétrécit sans TypeError', async () => {
        const store = { a2026_echellesTemplates: [JSON.parse(JSON.stringify(ECHELLE_2_NIVEAUX))] };
        const { win } = chargerEchelles(store);

        await win.supprimerNiveauEchelle('ECH_TEST_468', 0);

        expect(store.a2026_echellesTemplates[0].niveaux.length).toBe(1);
        expect(store.a2026_echellesTemplates[0].niveaux[0].code).toBe('M');
    });

    it('RATCHET — plus aucune référence VIVE aux deux cibles fantômes du module', () => {
        // On dépouille les commentaires : le retrait s'explique DANS le code, et
        // ces explications nomment forcément ce qu'elles retirent.
        const source = readFileSync(path.join(racineProjet, 'js', 'echelles.js'), 'utf8')
            .replace(/\/\*[\s\S]*?\*\//g, '')
            .replace(/(^|[^:])\/\/.*$/gm, '$1');
        expect(source).not.toContain('afficherEchellesPerformance');
        expect(source).not.toContain('nbNiveauxEchelle');
    });
});


/* ------------------------------------------------------------------ S3 · CO-12 */

/**
 * Le filtre RÉEL de la sidebar (pratiques-gestion.js:148) : une pratique n'y
 * paraît que si `dansBibliotheque !== false`. C'est lui qu'on interroge — pas le
 * champ pour lui-même : ce qui compte est « l'utilisateur la revoit-il ».
 */
const visibleDansSidebar = (p) => p.dansBibliotheque !== false;

function chargerPratiques(store) {
    const sauvegardees = [];
    const db = {
        getSync: (k, d) => (k in store ? store[k] : (d !== undefined ? d : null)),
        setSync: (k, v) => { store[k] = v; },
        set: async (k, v) => { store[k] = v; },
        get: async (k, d) => (k in store ? store[k] : d),
        // #522 (30 août 2026) : `adopterMaquette` écrit par la file par clé.
        // Même contrat que db.js — `undefined` rendu par le mutateur n'écrit rien.
        modifier: async (k, mutateur, defaut = null) => {
            const valeur = (k in store ? store[k] : defaut);
            const resultat = await mutateur(valeur);
            if (resultat === undefined) return undefined;
            store[k] = resultat;
            return resultat;
        }
    };
    const win = chargerScript('js/pratiques.js', {
        db,
        cle: (k) => 'h2026_' + k,
        prompt: (_q, defaut) => defaut,
        alert: () => {},
        genererIdUnique: (prefixe) => prefixe + 'test468',
        construireConfigComplete: (p) => p.config || p.configuration || {},
        afficherListePratiques: async () => {},
        notifications: { succes: () => {}, erreur: () => {} },
        PratiqueManager: {
            sauvegarderPratique: async (p) => {
                // reproduit le manager réel : un dansBibliotheque absent est
                // rabattu sur false (pratique-manager.js:208-211)
                if (p.dansBibliotheque === undefined) p.dansBibliotheque = false;
                sauvegardees.push(p);
                const liste = store['h2026_pratiquesConfigurables'] || [];
                liste.push(p);
                store['h2026_pratiquesConfigurables'] = liste;
            },
            supprimerPratique: async () => {}
        },
        BibliothequeUI: {
            obtenirAuteurActif: () => 'Grégoire',
            forgerInspireDe: (src) => ({ nom: src.nom, sourceId: src.id })
        }
    });
    return { win, sauvegardees, store };
}

const SOUCHE = () => ({
    id: 'p_souche', nom: 'Pratique souche', description: 'x', dansBibliotheque: true,
    type: 'standards', calcul_note: { methode: 'moyenne_ponderee' },
    configuration: { seuil: 3 },
    config: { id: 'p_souche', nom: 'Pratique souche', type: 'standards',
              calcul_note: { methode: 'moyenne_ponderee' }, configuration: { seuil: 3 } }
});

describe('#468 · S3 (CO-12) — la copie et la maquette adoptée sont VISIBLES', () => {
    it('dupliquerPratique : la copie paraît dans la sidebar', async () => {
        const store = { 'h2026_pratiquesConfigurables': [SOUCHE()] };
        const { win, sauvegardees } = chargerPratiques(store);

        const idCopie = await win.dupliquerPratique('p_souche', { nom: 'Ma copie' });

        expect(idCopie).toBeTruthy();
        const copie = sauvegardees.find(p => p.id === idCopie);
        expect(copie).toBeTruthy();
        expect(visibleDansSidebar(copie)).toBe(true);
    });

    it('une MAQUETTE dérivée reste hors sidebar — par son propre flag, pas par un rangement', async () => {
        const store = { 'h2026_pratiquesConfigurables': [SOUCHE()] };
        const { win, sauvegardees } = chargerPratiques(store);

        const idMaquette = await win.dupliquerPratique('p_souche', { nom: 'Maquette 1', estMaquette: true, silencieux: true });

        const maquette = sauvegardees.find(p => p.id === idMaquette);
        expect(maquette.estMaquette).toBe(true);
        // c'est filtrerParMaquette qui la masque — dansBibliotheque n'a pas à s'en mêler,
        // sinon elle resterait invisible APRÈS son adoption.
        expect(visibleDansSidebar(maquette)).toBe(true);
    });

    it('adopterMaquette : la pratique adoptée paraît dans la sidebar', async () => {
        const store = { 'h2026_pratiquesConfigurables': [{
            id: 'p_maquette', nom: 'Maquette A', estMaquette: true, dansBibliotheque: false,
            inspireDe: { nom: 'Souche', sourceId: 'p_souche' },
            config: { id: 'p_maquette', nom: 'Maquette A' }
        }] };
        const { win } = chargerPratiques(store);

        expect(await win.adopterMaquette('p_maquette')).toBe(true);

        const apres = store['h2026_pratiquesConfigurables'].find(p => p.id === 'p_maquette');
        expect(apres.estMaquette).toBe(false);
        expect(visibleDansSidebar(apres)).toBe(true);
        // INVARIANT CC : la filiation survit à l'adoption
        expect(apres.inspireDe.sourceId).toBe('p_souche');
    });
});


/* ------------------------------------------------------------------ S4 · CO-17 */

function chargerProductions(coursActif) {
    return chargerScript('js/productions.js', {
        db: { get: async () => null, getSync: (_k, d) => (d !== undefined ? d : null),
              set: async () => {}, setSync: () => {} },
        cle: (k) => 'h2026_' + k,
        obtenirCoursActifId: () => coursActif,
        GabaritsUtils: { lirePratiquesSelectionnees: () => [] },
        document: { getElementById: () => null, querySelector: () => null,
                    querySelectorAll: () => [], addEventListener() {} },
        echapperHtml: (t) => String(t == null ? '' : t)
    });
}

const FORMULAIRE = (extra = {}) => ({
    titre: 'Dissertation finale', activiteApprentissage: 'Écriture', type: 'evaluation',
    ponderation: 30, objectif: '', tache: '', detailTache: '',
    grilleId: 'GRILLE_1', echelleId: 'ECH_1', cartoucheId: null,
    dateEcheance: '2026-11-15', echeancesParGroupe: null, ...extra
});

// La production telle qu'elle vit déjà en base, AVANT la retouche.
const EXISTANTE = () => ({
    id: 'PROD_1', titre: 'Dissertation', coursId: 'COURS_A',
    verrouille: true, dansBibliotheque: false,
    echeancesParGroupe: { gc_1: { assignee: true, date: '2026-10-01' } },
    categorie: 'selection', dateCreation: '2026-09-01T00:00:00.000Z'
});

describe('#468 · S4 (CO-17) — enregistrer une production ne réécrit pas son état', () => {
    it('CRÉATION : les champs d\'état sont posés', () => {
        const win = chargerProductions('COURS_B');
        const data = win.construireProductionData(FORMULAIRE(), [], null);
        // #489 (15 oct. 2026) : le verrou d'une production entière est retiré, la création ne l'écrit plus.
        expect('verrouille' in data).toBe(false);
        expect(data.dansBibliotheque).toBe(true);
        expect(data.coursId).toBe('COURS_B');
    });

    it('MODIFICATION : les champs d\'état ne figurent PAS dans l\'objet fusionné', () => {
        const win = chargerProductions('COURS_B');
        const data = win.construireProductionData(FORMULAIRE(), [EXISTANTE()], 'PROD_1');
        // absents = le spread préservera ce qui existe
        expect('verrouille' in data).toBe(false);
        expect('dansBibliotheque' in data).toBe(false);
        expect('coursId' in data).toBe(false);
    });

    it('MODIFICATION, effet réel du spread : rien de l\'état n\'a bougé', () => {
        const win = chargerProductions('COURS_B'); // un AUTRE cours est actif
        const existante = EXISTANTE();
        const data = win.construireProductionData(FORMULAIRE({ titre: 'Titre retouché' }), [existante], 'PROD_1');

        const apres = { ...existante, ...data };  // exactement ce que fait sauvegarderProduction

        expect(apres.titre).toBe('Titre retouché');        // la retouche passe…
        expect(apres.verrouille).toBe(true);               // …sans déverrouiller
        expect(apres.dansBibliotheque).toBe(false);        // …sans la faire réapparaître
        expect(apres.coursId).toBe('COURS_A');             // …sans la voler au cours A (#346)
    });

    it('MODIFICATION en mode simple : les échéances par groupe SURVIVENT', () => {
        const win = chargerProductions('COURS_A');
        const existante = EXISTANTE();
        // conteneur multi masqué ⇒ le formulaire rend null : « je ne sais pas »
        const data = win.construireProductionData(FORMULAIRE({ echeancesParGroupe: null }), [existante], 'PROD_1');
        expect('echeancesParGroupe' in data).toBe(false);

        const apres = { ...existante, ...data };
        expect(apres.echeancesParGroupe).toEqual({ gc_1: { assignee: true, date: '2026-10-01' } });
    });

    it('MODIFICATION en mode multi : les échéances saisies sont bien écrites', () => {
        const win = chargerProductions('COURS_A');
        const saisies = { gc_1: { assignee: true, date: '2026-12-01' }, gc_2: { assignee: false, date: null } };
        const data = win.construireProductionData(FORMULAIRE({ echeancesParGroupe: saisies }), [EXISTANTE()], 'PROD_1');
        expect(data.echeancesParGroupe).toEqual(saisies);
    });

    it('la catégorie existante est lue sur la production en édition, pas sur un état global', () => {
        const win = chargerProductions('COURS_A');
        const data = win.construireProductionData(FORMULAIRE(), [EXISTANTE()], 'PROD_1');
        expect(data.categorie).toBe('selection');
        const dataCreation = win.construireProductionData(FORMULAIRE(), [EXISTANTE()], null);
        expect(dataCreation.categorie).toBe(null);
    });
});


/* ------------------------------- S4 bis · CO-17, l'héritage au « + Nouvelle » */

/**
 * Faux DOM minimal, fidèle sur un point : `u-hide` est une CLASSE, et c'est elle
 * que lit `lireEcheancesParGroupeDepuisFormulaire` pour décider si le bloc
 * multi-groupes a quelque chose à dire.
 */
function fauxElement(id) {
    const classes = new Set();
    const attributs = {};
    return {
        id, value: '', textContent: '', innerHTML: '', style: {}, disabled: false,
        classList: {
            add: (c) => classes.add(c),
            remove: (c) => classes.delete(c),
            contains: (c) => classes.has(c)
        },
        // #494 : le mode simple pose désormais la case « consignes transmises »
        // AVANT le champ date — d'où `insertBefore` et `remove`. Le mock reste
        // minimal, mais il ne doit pas faire échouer un geste que le navigateur
        // exécute sans peine.
        parentElement: {
            querySelector: () => null, appendChild() {}, insertBefore() {}
        },
        remove() {},
        appendChild() {}, insertBefore() {}, querySelector: () => null,
        addEventListener() {},
        setAttribute(n, v) { attributs[n] = String(v); },
        getAttribute(n) { return n in attributs ? attributs[n] : null; },
        querySelectorAll: () => []
    };
}

describe('#468 · S4 bis (CO-17) — une nouvelle production n\'hérite pas des échéances de la précédente', () => {
    it('le bloc multi-groupes est masqué ET VIDÉ quand il n\'a rien à dire', () => {
        const els = {
            containerEcheancesGroupes: fauxElement('containerEcheancesGroupes'),
            champDateEcheance: fauxElement('champDateEcheance'),
            listeEcheancesGroupes: fauxElement('listeEcheancesGroupes'),
            productionDateEcheance: fauxElement('productionDateEcheance')
        };
        // état hérité : le bloc est VISIBLE et porte les cases de la production précédente
        els.listeEcheancesGroupes.innerHTML =
            '<input type="checkbox" class="echeance-gc-checkbox" data-gc-id="gc_1" checked>';

        const win = chargerScript('js/productions.js', {
            db: { get: async () => null,
                  getSync: (k, d) => (k === 'h2026_groupesCours' ? [{ id: 'gc_1', coursId: 'COURS_A' }]
                                                                 : (d !== undefined ? d : null)),
                  set: async () => {}, setSync: () => {} },
            cle: (k) => 'h2026_' + k,
            obtenirCoursActifId: () => 'COURS_A',   // un SEUL groupe frère ⇒ mode simple
            GabaritsUtils: { lirePratiquesSelectionnees: () => [] },
            document: { getElementById: (id) => els[id] || null, querySelector: () => null,
                        querySelectorAll: () => [], createElement: () => fauxElement('x'),
                        addEventListener() {} },
            echapperHtml: (t) => String(t == null ? '' : t)
        });

        win.peuplerEcheancesParGroupe(null);

        expect(els.containerEcheancesGroupes.classList.contains('u-hide')).toBe(true);
        expect(els.listeEcheancesGroupes.innerHTML).toBe('');
    });

    it('RATCHET — « + Nouvelle production » remet le bloc d\'échéances à neuf', () => {
        const source = readFileSync(path.join(racineProjet, 'js', 'productions-liste.js'), 'utf8');
        const debut = source.indexOf('function creerNouvelleProduction()');
        expect(debut).toBeGreaterThan(-1);
        const corps = source.slice(debut, source.indexOf('\nfunction ', debut + 10));
        expect(corps).toContain('peuplerEcheancesParGroupe(null)');
    });
});


/* ------------------------------------------------------------------ S5 · CT-13 */

function chargerCours(store, journal) {
    journal.cartes = [];
    const db = {
        get: async (k) => (k in store ? store[k] : null),
        getSync: (k, d) => (k in store ? store[k] : (d !== undefined ? d : null)),
        set: async (k, v) => { store[k] = v; },
        setSync: (k, v) => { store[k] = v; },
        // #522 lot 5 : le site écrit par `db.modifier` ; même contrat (un `undefined` n'écrit rien).
        modifier: async (k, mutateur, defaut = null) => {
            const r = await mutateur(k in store ? store[k] : defaut);
            if (r !== undefined) store[k] = r;
            return r;
        }
    };
    const lien = { href: '', download: '', click: () => { journal.telechargements.push(lien.download); } };
    return chargerScript('js/cours.js', {
        db,
        cle: (k) => 'h2026_' + k,
        alert: (m) => journal.alertes.push(String(m)),
        confirm: () => true,
        demanderMetadonneesEnrichies: async () => journal.metadonnees,
        fermerModalBibliothequeCours: () => {},
        ouvrirModalBibliothequeCours: async () => {},
        Blob: function (parties) { journal.contenus.push(String(parties[0])); },
        URL: { createObjectURL: () => 'blob:faux', revokeObjectURL: () => {} },
        document: {
            getElementById: () => null, querySelector: () => null, querySelectorAll: () => [],
            createElement: () => lien, addEventListener() {}
        },
        notifications: { succes: () => {}, erreur: () => {} },
        echapperHtml: (t) => String(t == null ? '' : t),
        BibliothequeUI: {
            // on capture ce que la modale DEMANDE à rendre : c'est là que vivent
            // les libellés du menu ⋮, et donc la promesse faite à l'utilisateur
            renderCarteSelection: (opts) => { journal.cartes.push(opts); return ''; },
            renderCarteDisponible: (opts) => { journal.cartes.push(opts); return ''; },
            renderMenuActions: () => '', obtenirAuteurActif: () => 'Grégoire',
            creerModal: () => ({ style: {}, classList: { add() {}, remove() {} },
                                 querySelector: () => null, appendChild() {} }),
            fermerModal: () => {}, renderSection: (t, contenu) => String(contenu || ''),
            formaterTitre: (t) => String(t), repertoires: { enregistrer: () => {} },
            filtrerParModeDemo: (l) => l, filtrerParMaquette: (l) => l
        }
    });
}

const COURS = () => ({
    id: 'COURS_1', codeCours: '601-101-MQ', nomCours: 'Écriture et littérature',
    dansBibliotheque: true, actif: true, competence: 'Analyser'
});

describe('#468 · S5 (CT-13) — « Exporter » exporte, « Déposer » dépose', () => {
    it('exporterUnCours télécharge un fichier qui contient CE cours', async () => {
        const journal = { alertes: [], telechargements: [], contenus: [], metadonnees: { licence: 'CC BY' } };
        const store = { cours: [COURS(), { id: 'COURS_2', codeCours: 'AUTRE', nomCours: 'Autre' }] };
        const win = chargerCours(store, journal);

        await win.exporterUnCours('COURS_1');

        expect(journal.telechargements.length).toBe(1);
        expect(journal.telechargements[0]).toContain('601-101-MQ');
        const paquet = JSON.parse(journal.contenus[0]);
        expect(paquet.cours.map(c => c.id)).toEqual(['COURS_1']);
        expect(paquet.metadata_cc).toEqual({ licence: 'CC BY' });
    });

    it('exporterUnCours NE TOUCHE PAS à la sélection : exporter n\'est pas se dessaisir', async () => {
        const journal = { alertes: [], telechargements: [], contenus: [], metadonnees: { licence: 'CC BY' } };
        const store = { cours: [COURS()] };
        const win = chargerCours(store, journal);

        await win.exporterUnCours('COURS_1');

        expect(store.cours[0].dansBibliotheque).toBe(true);
        expect(store.cours[0].actif).toBe(true);
    });

    it('métadonnées refusées : aucun fichier, aucune écriture', async () => {
        const journal = { alertes: [], telechargements: [], contenus: [], metadonnees: null };
        const store = { cours: [COURS()] };
        const win = chargerCours(store, journal);

        await win.exporterUnCours('COURS_1');

        expect(journal.telechargements.length).toBe(0);
        expect(store.cours[0].dansBibliotheque).toBe(true);
    });

    it('partagerCours dépose la fiche ET la sort de l\'actif — sans prétendre exporter', async () => {
        const journal = { alertes: [], telechargements: [], contenus: [], metadonnees: { licence: 'CC BY' } };
        const store = { cours: [COURS()] };
        const win = chargerCours(store, journal);

        await win.partagerCours('COURS_1');

        expect(store.cours[0].dansBibliotheque).toBe(false);
        expect(store.cours[0].actif).toBe(false);   // aligné sur « Retirer de ma sélection »
        expect(journal.telechargements.length).toBe(0);  // ce geste ne télécharge rien, et ne le dit plus
    });

    it('le menu ⋮ de la fiche offre les DEUX gestes, chacun sous son vrai nom', async () => {
        const journal = { alertes: [], telechargements: [], contenus: [], metadonnees: null };
        const store = { cours: [COURS()] };
        const win = chargerCours(store, journal);

        await win.ouvrirModalBibliothequeCours();

        const carte = journal.cartes.find(c => c.id === 'COURS_1');
        expect(carte).toBeTruthy();
        const parLabel = Object.fromEntries(carte.actionsMenu.map(a => [a.label, a.action]));
        expect(parLabel['Exporter']).toBe('exporterUnCours');
        expect(parLabel['Déposer dans les cours disponibles']).toBe('partagerCours');
        // les gestes déjà en place n'ont pas bougé
        expect(parLabel['Retirer de ma sélection']).toBe('retirerCoursDeBibliotheque');
        expect(parLabel['Supprimer la fiche']).toBe('supprimerFicheCours');
    });

    it('RATCHET — le doublon mort exporterCoursSimple a quitté le dépôt', () => {
        const source = readFileSync(path.join(racineProjet, 'js', 'cours.js'), 'utf8');
        expect(source).not.toContain('exporterCoursSimple');
    });
});


/* ------------------------------------------------------------------ S6 · CO-25 */

function chargerGabaritsUtils(store, supprimees) {
    const db = {
        getSync: (k, d) => (k in store ? store[k] : (d !== undefined ? d : null)),
        setSync: (k, v) => { store[k] = v; },
        get: async (k) => (k in store ? store[k] : null),
        set: async (k, v) => { store[k] = v; }
    };
    const fauxWindow = {
        estRessourceSupprimee: (id) => supprimees.includes(id),
        marquerRessourceSupprimee: (id) => { if (!supprimees.includes(id)) supprimees.push(id); }
    };
    return chargerScript('js/gabarits-utils.js', { db, cle: (k) => 'h2026_' + k,
                                                   echapperHtml: (t) => String(t == null ? '' : t) },
                         fauxWindow);
}

describe('#468 · S6 (CO-25) — un gabarit supprimé ne ressuscite pas', () => {
    it('initialiserGabaritsDefaut sème les gabarits absents (comportement nominal)', () => {
        const store = {};
        const win = chargerGabaritsUtils(store, []);
        win.GabaritsUtils.initialiserTousLesGabarits();
        // #574 (29 août 2026) : plus AUCUN gabarit d'échelle semé — ils n'avaient pas
        // de valeurCalcul, donc non calculables depuis #527. Les grilles, elles, restent.
        expect(store.bibliothequeEchelles === undefined || store.bibliothequeEchelles.length === 0).toBe(true);
        expect((store.bibliothequeGrilles || []).length).toBe(3);
    });

    it('un gabarit marqué supprimé n\'est PAS re-semé — même après N rechargements', () => {
        const store = {};
        const supprimees = ['GABARIT_GRILLE_ANALYTIQUE'];
        const win = chargerGabaritsUtils(store, supprimees);

        win.GabaritsUtils.initialiserTousLesGabarits();
        win.GabaritsUtils.initialiserTousLesGabarits();  // le rechargement suivant
        win.GabaritsUtils.initialiserTousLesGabarits();

        const idsGrilles = (store.bibliothequeGrilles || []).map(g => g.id);
        expect(idsGrilles).not.toContain('GABARIT_GRILLE_ANALYTIQUE');
        // les autres, eux, sont bien là : la garde vise l'id supprimé, pas la famille
        expect(idsGrilles).toContain('GABARIT_GRILLE_STD_OBJECTIFS');
    });

    it('les gabarits de cartouches en cul-de-sac ont quitté le code', () => {
        const store = {};
        const win = chargerGabaritsUtils(store, []);
        win.GabaritsUtils.initialiserTousLesGabarits();

        expect(store.bibliothequeCartouches === undefined || store.bibliothequeCartouches.length === 0).toBe(true);
        expect(win.GabaritsUtils.GABARITS_CARTOUCHES_DEFAUT).toBeUndefined();

        // hors commentaires : le retrait s'explique dans le code, et l'explication
        // nomme forcément ce qu'elle retire
        const source = readFileSync(path.join(racineProjet, 'js', 'gabarits-utils.js'), 'utf8')
            .replace(/\/\*[\s\S]*?\*\//g, '')
            .replace(/(^|[^:])\/\/.*$/gm, '$1');
        expect(source).not.toContain('GABARIT_CART_ANALYTIQUE');
        expect(source).not.toContain('GABARIT_CART_SPE_REVISION');
    });

    it('RATCHET — les GABARIT_* sont dans la liste qui fait poser le tombstone', () => {
        const source = readFileSync(path.join(racineProjet, 'js', 'main.js'), 'utf8');
        const bloc = source.slice(source.indexOf('window.IDS_GABARITS_HARDCODES = ['),
                                  source.indexOf('];', source.indexOf('window.IDS_GABARITS_HARDCODES = [')));
        for (const id of ['GABARIT_ECHELLE_IDME', 'GABARIT_ECHELLE_STD_MASTERY',
                          'GABARIT_GRILLE_ANALYTIQUE', 'GABARIT_GRILLE_CHECKLIST_SPE',
                          'GABARIT_GRILLE_STD_OBJECTIFS']) {
            expect(bloc, id).toContain(id);
        }
    });

    it('RATCHET — supprimer depuis la bibliothèque PARTAGÉE pose le tombstone (3 familles)', () => {
        const familles = [
            ['grilles.js', 'supprimerGrilleDeBibliothequePartagee'],
            ['echelles.js', 'supprimerEchelleDeBibliothequePartagee'],
            ['cartouches.js', 'supprimerCartoucheDeBibliothequePartagee']
        ];
        for (const [fichier, fn] of familles) {
            const source = readFileSync(path.join(racineProjet, 'js', fichier), 'utf8');
            const debut = source.indexOf('async function ' + fn + '(');
            expect(debut, fn).toBeGreaterThan(-1);
            const corps = source.slice(debut, source.indexOf('\n}', debut));
            expect(corps, fn).toContain('marquerRessourceSupprimee');
        }
    });
});
