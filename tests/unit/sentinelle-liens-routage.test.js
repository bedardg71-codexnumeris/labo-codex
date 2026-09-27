import { describe, it, expect, beforeEach, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

// =======================================================================
// SENTINELLE — routage des liens et verbe de réactivation (15 août 2026)
// =======================================================================
//
// Deux demandes de Grégoire, captures à l'appui, et elles tiennent ensemble :
// « je voudrais éviter que les liens passent par-dessus d'autres blocs » et
// « comme j'ai en Ouverture une révision de concepts de la leçon précédente,
// il faudrait revoir le verbe (« s'acquiert par » n'est pas approprié ici) ».
//
// Ce qui est verrouillé :
//   A. un lien contourne les blocs — mesuré en NOMBRE DE TRAVERSÉES, pas en
//      forme de courbe (la forme peut changer, l'invariant non) ;
//   B. les conteneurs qui contiennent une extrémité ne sont PAS des obstacles
//      (sinon aucun tracé n'existerait et tout retomberait dans le pire cas) ;
//   C. le libellé se pose SUR la courbe, et pas sur un bloc ;
//   D. une connaissance se RÉACTIVE dans une Ouverture, elle n'y « s'acquiert »
//      pas — et les quatre autres étapes gardent « s'acquiert par » ;
//   E. le menu du lien n'est plus un cul-de-sac : tous les verbes y sont.
//
// ⚠ CE QUE CETTE SENTINELLE NE COUVRE PAS : la BEAUTÉ du tracé. Un lien peut
// ne traverser aucun bloc et faire un détour absurde. C'est un jugement d'œil,
// éprouvé au navigateur (captures du 15 août), pas ici.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');
const source = readFileSync(path.join(racine, 'js', 'planification-carte.js'), 'utf8');

let api;

/**
 * Monte le module avec un DOM factice DIMENSIONNÉ.
 *
 * ⚠ Sans ça, `document.getElementById` rend null, `getPortPosition` rend
 * {0,0} pour TOUS les ports, et le routage s'exécuterait sur une carte où
 * tous les blocs sont au même point : les tests passeraient sans rien
 * exercer. La taille des blocs est ce qui rend la géométrie observable.
 */
function monterModule(opts) {
    const elements = new Map();
    // Ce que le module ajoute au <body> : c'est là que passent les toasts.
    // Un `appendChild` qui ne fait rien rendrait le toast INOBSERVABLE, et un
    // test qui ne peut pas le voir ne peut pas le protéger.
    const ajoutesAuBody = [];
    const faire = (id) => {
        const t = (opts && opts.tailles && opts.tailles[id]) || { w: 160, h: 60 };
        return {
            id, style: {}, dataset: {}, innerHTML: '', textContent: '',
            offsetWidth: t.w, offsetHeight: t.h,
            classList: { add() {}, remove() {}, contains: () => false, toggle() {} },
            setAttribute() {}, getAttribute: () => null, appendChild() {}, remove() {},
            addEventListener() {}, removeEventListener() {},
            querySelector: () => null, querySelectorAll: () => [],
            closest: () => null, contains: () => false
        };
    };
    const win = chargerScript('js/planification-carte.js', {
        db: { getSync: (k, d) => (d !== undefined ? d : null), setSync: () => {},
              get: async (k, d) => d, set: async () => {} },
        cle: (k) => `a2026_${k}`,
        echapperHtml: (t) => String(t ?? ''),
        requestAnimationFrame: (fn) => { fn(); return 0; },
        // Le rendu des badges resout des couleurs CSS : sans ce bouchon,
        // tout chargement de carte casse sur « getComputedStyle is not defined ».
        getComputedStyle: () => ({ getPropertyValue: () => '' }),
        setTimeout: () => 0,
        clearTimeout: () => {},
        document: {
            getElementById: (id) => {
                if (!api || !api.etat.noeuds.has(id)) return null;
                if (!elements.has(id)) elements.set(id, faire(id));
                return elements.get(id);
            },
            querySelector: () => null, querySelectorAll: () => [],
            addEventListener: () => {},
            createElement: () => faire('x'), createElementNS: () => faire('x'),
            execCommand: () => true,
            body: { appendChild(el) { ajoutesAuBody.push(el); }, removeChild() {} }
        }
    });
    win.cle = (k) => `a2026_${k}`;
    win.planificationDonnees = {
        getIndex: () => ({ active: 'carte_1', cartes: [{ id: 'carte_1', nom: 'Test' }] }),
        sauvegarderCarte: () => {}, chargerCarte: () => null
    };
    api = win.planificationCarte;
    win._ajoutesAuBody = ajoutesAuBody;
    // On rend `win` (et non `api`) : les cas de bout en bout ont besoin de
    // remplacer `planificationDonnees` DANS le bac à sable, et de relire ce
    // qui a été ajouté au <body>.
    return win;
}

function poser(id, type, x, y, extra) {
    api.etat.noeuds.set(id, Object.assign({
        id, type, titre: id, description: '', x, y,
        parent: null, enfants: [], metadata: {}, cloneSourceId: null
    }, extra || {}));
}

beforeEach(() => { monterModule(); });

// -----------------------------------------------------------------------
describe('liens · A — le tracé contourne les blocs', () => {
    it('⚠ un bloc pile sur le chemin direct n’est PAS traversé', () => {
        // LE cas de sa capture : « se vérifie par » traversait toute une leçon
        // en diagonale. Un obstacle est posé exactement au milieu du segment.
        poser('src', 'conceptuelle', 0, 300);
        poser('cbl', 'evaluation', 800, 300);
        poser('mur', 'expose', 380, 280);
        const t = api.calculerTraceLien('src', 'cbl');
        expect(t).not.toBeNull();
        expect(t.traversees, 'le lien traverse encore un bloc').toBe(0);
    });

    it('⚠ le CHOIX DES PORTS suffit quand un autre côté est libre', () => {
        // Cas discriminant du premier étage du routage. L'obstacle bloque la
        // ligne de l'axe dominant (droite→gauche), mais le passage par le HAUT
        // est libre. Le tracé doit donc rester une courbe SIMPLE : si le choix
        // des ports disparaissait, il faudrait dévier pour arriver au même
        // résultat, et le tracé porterait un point de passage.
        //
        // ⮕ C'est ce que le break-test du 15 août a révélé : sans ce cas, ma
        // sentinelle restait verte quand on réduisait le routage au seul axe
        // dominant — la déviation rattrapait tout, et le premier étage n'était
        // protégé par rien.
        poser('src', 'conceptuelle', 0, 300);
        poser('cbl', 'evaluation', 800, 300);
        poser('mur', 'expose', 380, 320);
        const t = api.calculerTraceLien('src', 'cbl');
        expect(t.traversees).toBe(0);
        expect((t.d.match(/C /g) || []).length,
               'un port libre existe : aucune déviation ne devrait être nécessaire').toBe(1);
    });

    it('un couloir LARGE est contourné, pas enfilé', () => {
        // Aucun interstice, et surtout une obstruction LARGE : un point de
        // passage unique placé au milieu horizontal retombe dedans en
        // redescendant. Il faut monter, longer, puis redescendre — c'est ce
        // que disent les points de passage aux COINS.
        //
        // ⮕ La largeur n'est pas décorative : avec un mur d'une seule colonne,
        // le point unique s'en tirait et la sentinelle restait verte quand on
        // retirait les coins (break-test du 15 août).
        poser('src', 'conceptuelle', 0, 400);
        poser('cbl', 'evaluation', 1100, 400);
        for (let i = 0; i < 10; i++) {
            poser('m' + i, 'expose', 340, 120 + i * 55);
            poser('n' + i, 'expose', 520, 120 + i * 55);
            poser('o' + i, 'expose', 700, 120 + i * 55);
        }
        const t = api.calculerTraceLien('src', 'cbl');
        expect(t.traversees).toBe(0);
        expect((t.d.match(/C /g) || []).length, 'le tracé doit dévier').toBeGreaterThan(1);
    });

    it('sans obstacle, le tracé reste une courbe simple', () => {
        // La déviation est un RECOURS. Si elle se déclenchait sans raison, la
        // carte de Grégoire se remplirait de méandres inutiles.
        poser('src', 'conceptuelle', 0, 300);
        poser('cbl', 'evaluation', 600, 300);
        const t = api.calculerTraceLien('src', 'cbl');
        expect(t.traversees).toBe(0);
        expect((t.d.match(/C /g) || []).length, 'aucune déviation attendue').toBe(1);
    });
});

// -----------------------------------------------------------------------
describe('liens · A bis — le contournement est un CHOIX', () => {
    it('le défaut est « contourner » — une carte existante s’ouvre corrigée', () => {
        // Grégoire a jugé le contournement « beaucoup mieux ». Le réglage
        // existe pour qui préfère l'autre, pas pour lui demander de choisir
        // avant de profiter du correctif.
        expect(api.contournementActif()).toBe(true);
    });

    it('⚠ AUCUNE préférence enregistrée = contourner', () => {
        // Le cas d'un utilisateur qui n'a jamais touché au réglage — c'est
        // celui de tout le monde au premier lancement.
        //
        // ⮕ Ce cas manquait, et le break-test l'a dit : le précédent lisait la
        // variable du module, que la fonction de chargement n'avait jamais
        // touchée. Basculer le défaut du STOCKAGE le laissait vert. Un test
        // qui n'appelle pas le code qu'il prétend couvrir ne couvre rien.
        expect(api.chargerPrefContournement(), 'db ne rend rien → défaut').toBe(true);
        expect(api.contournementActif()).toBe(true);
    });

    it('⚠ le tracé direct ne calcule AUCUN obstacle', () => {
        // C'est ce qui le rend moins coûteux — et c'est pourquoi `traversees`
        // vaut null et non 0 : non mesuré n'est pas « aucune ». Rendre 0
        // ferait croire à une garantie qu'on n'a pas prise.
        poser('src', 'conceptuelle', 0, 300);
        poser('cbl', 'evaluation', 800, 300);
        poser('mur', 'expose', 380, 280);
        api.definirContournement(false);
        const t = api.calculerTraceLien('src', 'cbl');
        expect(t.traversees).toBeNull();
        expect((t.d.match(/C /g) || []).length, 'jamais de point de passage').toBe(1);
        api.definirContournement(true);
    });

    it('en tracé direct, le libellé revient au milieu géométrique', () => {
        // Le comportement d'avant, à l'identique : c'est ce qu'on offre.
        poser('src', 'conceptuelle', 0, 300);
        poser('cbl', 'evaluation', 800, 300);
        poser('mur', 'expose', 380, 280);
        api.definirContournement(false);
        const t = api.calculerTraceLien('src', 'cbl');
        expect(t.etiquette.x).toBe((t.p1.x + t.p2.x) / 2);
        expect(t.etiquette.y).toBe((t.p1.y + t.p2.y) / 2);
        api.definirContournement(true);
    });

    it('⚠ les DEUX modes produisent un tracé — aucun n’est un chemin mort', () => {
        // La règle zéro-dette interdit d'empiler un chemin « au cas où ». Les
        // deux doivent donc être vivants et éprouvés : ce cas les exerce l'un
        // après l'autre sur la même géométrie.
        poser('src', 'conceptuelle', 0, 300);
        poser('cbl', 'evaluation', 800, 300);
        poser('mur', 'expose', 380, 280);
        api.definirContournement(false);
        const direct = api.calculerTraceLien('src', 'cbl');
        api.definirContournement(true);
        const contourne = api.calculerTraceLien('src', 'cbl');
        expect(direct.d.length).toBeGreaterThan(10);
        expect(contourne.d.length).toBeGreaterThan(10);
        expect(direct.d, 'les deux modes doivent différer sur cette géométrie').not.toBe(contourne.d);
    });

    it('le réglage passe par le stockage, sous une clé nommée', () => {
        // Sans persistance, le choix se perdrait à chaque rechargement — et
        // un réglage qu'on doit reposer chaque fois n'est pas un réglage.
        expect(source).toContain("var CLE_PREF_CONTOURNER = 'planif-liens-contourner'");
        expect(source).toMatch(/db\.setSync\(CLE_PREF_CONTOURNER/);
        expect(source).toMatch(/db\.getSync\(CLE_PREF_CONTOURNER/);
    });

    it('⚠ la préférence est lue UNE fois, pas à chaque lien', () => {
        // `calculerTraceLien` tourne pour chaque lien à chaque redessin :
        // interroger le stockage à l'intérieur paierait un accès par lien et
        // par image pendant un glisser.
        const fn = source.slice(
            source.indexOf('function calculerTraceLien'),
            source.indexOf('function _devier')
        );
        expect(fn.length).toBeGreaterThan(200);
        expect(fn, 'aucune lecture du stockage dans le calcul').not.toContain('getSync');
    });

    it('⚠ basculer le réglage RETRACE les liens', () => {
        // Un réglage qui ne se voit qu'au prochain rechargement passe pour
        // cassé. Le cliquet garde la boucle de redessin dans `definirContournement`.
        const fn = source.slice(
            source.indexOf('function definirContournement'),
            source.indexOf('function contournementActif')
        );
        expect(fn).toContain('dessinerLien');
    });
});

// -----------------------------------------------------------------------
describe('liens · B — ce qui n’est PAS un obstacle', () => {
    it('⚠ le conteneur qui contient une extrémité est exclu', () => {
        // Un lien d'un bloc de la leçon A vers un bloc de la leçon B doit
        // forcément sortir du cadre de A et entrer dans celui de B. Compter
        // ces cadres comme obstacles rendrait TOUT tracé impossible, et le
        // routage retomberait systématiquement dans son pire cas.
        poser('lecon', 'lecon', 0, 0, { enfants: ['dedans'] });
        poser('dedans', 'conceptuelle', 40, 60, { parent: 'lecon' });
        poser('dehors', 'evaluation', 700, 60);
        const obstacles = api.obstaclesPourLien('dedans', 'dehors');
        // Ni la leçon (ancêtre), ni les deux extrémités.
        expect(obstacles.length).toBe(0);
    });

    it('un conteneur ÉTRANGER aux deux extrémités reste un obstacle', () => {
        // C'est la contrepartie : l'exclusion ne doit pas devenir « aucun
        // conteneur ne gêne jamais », sinon un lien traverserait une leçon
        // tierce de part en part.
        poser('a', 'conceptuelle', 0, 300);
        poser('b', 'evaluation', 900, 300);
        poser('autre', 'lecon', 400, 200, { enfants: [] });
        const obstacles = api.obstaclesPourLien('a', 'b');
        expect(obstacles.length).toBe(1);
    });

    it('les blocs très éloignés sont écartés du calcul', () => {
        // Filtre de zone : un bloc à l'autre bout de la carte ne peut pas
        // gêner. Sans lui, chaque lien payait les 150 blocs de la carte.
        poser('a', 'conceptuelle', 0, 300);
        poser('b', 'evaluation', 500, 300);
        poser('loin', 'expose', 9000, 9000);
        expect(api.obstaclesPourLien('a', 'b').length).toBe(0);
    });
});

// -----------------------------------------------------------------------
describe('liens · C — le libellé', () => {
    it('⚠ il se pose SUR la courbe, pas au milieu géométrique', () => {
        // Le libellé était placé au milieu des deux extrémités — un point qui
        // n'appartient pas au tracé. Sur sa capture, « s'acquiert par »
        // atterrissait ainsi sur un bloc sans rapport.
        poser('src', 'conceptuelle', 0, 300);
        poser('cbl', 'evaluation', 800, 300);
        poser('mur', 'expose', 380, 280);
        const t = api.calculerTraceLien('src', 'cbl');
        const milieuGeo = { x: (t.p1.x + t.p2.x) / 2, y: (t.p1.y + t.p2.y) / 2 };
        const obst = api.obstaclesPourLien('src', 'cbl');
        const dans = (p) => obst.some((o) => p.x >= o.x1 && p.x <= o.x2 && p.y >= o.y1 && p.y <= o.y2);
        expect(dans(milieuGeo), 'le cas doit être discriminant : l’ancien point tombait sur le bloc').toBe(true);
        expect(dans(t.etiquette), 'le nouveau point ne doit pas tomber sur un bloc').toBe(false);
    });
});

// -----------------------------------------------------------------------
describe('liens · D — on RÉACTIVE dans une Ouverture, on n’y acquiert pas', () => {
    const verbe = (ts, tc) => {
        poser('s', ts, 0, 0); poser('c', tc, 400, 0);
        const r = api.resoudreVerbe('s', 'c');
        api.etat.noeuds.delete('s'); api.etat.noeuds.delete('c');
        return r;
    };

    it('les quatre types de connaissance se réactivent dans une Ouverture', () => {
        for (const k of ['factuelle', 'conceptuelle', 'procedurale', 'metacognitive']) {
            expect(verbe(k, 'ouverture').verbe, `${k} → ouverture`).toBe('se_reactive_dans');
        }
    });

    it('les quatre AUTRES étapes gardent « s’acquiert par »', () => {
        // L'exception doit rester une exception : une Modélisation ou une
        // Pratique guidée fait bien acquérir.
        for (const e of ['modelisation', 'pratique-guidee', 'pratique-autonome', 'cloture']) {
            expect(verbe('conceptuelle', e).verbe, `conceptuelle → ${e}`).toBe('s_acquiert_par');
        }
    });

    it('le sens du geste n’a pas d’importance : le lien part de la connaissance', () => {
        const r = verbe('ouverture', 'factuelle');
        expect(r.verbe).toBe('se_reactive_dans');
        expect(r.source).toBe('c');   // la connaissance devient la source
        expect(r.cible).toBe('s');
    });

    it('le verbe existe dans le référentiel, avec son libellé', () => {
        const t = api.TYPES_LIENS.find((x) => x.id === 'se_reactive_dans');
        expect(t, 'le type de lien doit être déclaré').toBeTruthy();
        expect(t.label).toBe('se réactive dans');
    });

    it('⚠ la règle passe APRÈS la table brute et AVANT le repli sur la famille', () => {
        // L'ordre est tout : après la table brute, une paire écrite
        // explicitement continue de gagner ; avant le repli, l'Ouverture n'est
        // pas écrasée en « activite » (ce qui redonnerait « s'acquiert par »).
        const posRegle = source.indexOf('TYPES_REACTIVATION.indexOf(cbl.type)');
        const posBrute = source.indexOf("var match = VERBES_AUTO[src.type + '>' + cbl.type];");
        const posRepli = source.indexOf("VERBES_AUTO[src.type + '>' + normaliserType(cbl.type)]");
        expect(posBrute).toBeGreaterThan(-1);
        expect(posRegle, 'la règle doit suivre la table brute').toBeGreaterThan(posBrute);
        expect(posRepli, 'la règle doit précéder le repli sur la famille').toBeGreaterThan(posRegle);
    });

    it('⚠ « révision » se réactive AUSSI — décision de Grégoire du 15 août', () => {
        // Même nature que l'Ouverture : de la pratique répartie sur un acquis,
        // pas une première rencontre.
        for (const k of ['factuelle', 'conceptuelle', 'procedurale', 'metacognitive']) {
            expect(verbe(k, 'revision').verbe, `${k} → revision`).toBe('se_reactive_dans');
        }
    });

    it('⚠ les huit paires explicites ont été RETIRÉES de la table', () => {
        // Cliquet de source, et il est nécessaire : la table brute est
        // consultée AVANT la règle. Réécrire une seule de ces paires suffirait
        // à annuler la décision en silence — le changement aurait l'air fait
        // et ne ferait rien.
        for (const k of ['factuelle', 'conceptuelle', 'procedurale', 'metacognitive']) {
            expect(source, `${k}>revision ne doit plus être écrite`)
                .not.toMatch(new RegExp(`'${k}>revision':`));
            expect(source, `revision>${k} ne doit plus être écrite`)
                .not.toMatch(new RegExp(`'revision>${k}':`));
        }
    });

    it('… et « révision ↔ évaluation » n\'est plus un lien (#964)', () => {
        // Le retrait du 15 août ne touchait que le verbe d'ACQUISITION.
        // ↻ RÉANCRÉ LE 27 SEPT. 2026 (#964), délibérément : décision didactique de
        // Grégoire, une évaluation se relie UNIQUEMENT à des objectifs, cochés
        // dans son Inspecteur. Les seize paires « …>evaluation » sont retirées de
        // VERBES_AUTO ; tracer vers une évaluation est refusé. Les liens déjà
        // tracés restent lus (sentinelle-badges-objectifs-964).
        expect(verbe('revision', 'evaluation')).toBeNull();
    });
});

// -----------------------------------------------------------------------
describe('liens · D bis — la bascule des liens DÉJÀ enregistrés', () => {
    // ⚠ CETTE BASCULE RÉÉCRIT SES DONNÉES. Elle est étroite et réversible d'un
    // clic, mais elle touche ce qu'il a tracé : ce sont les cas qui disent ce
    // qu'elle a le droit de transformer — et surtout ce qu'elle n'a pas le
    // droit de toucher.
    const bloc = () => source.slice(
        source.indexOf("if (l.type === 's_acquiert_par') {"),
        source.indexOf("etat.liens.set(l.id, l);")
    );

    it('elle ne touche QUE les liens portant « s’acquiert par »', () => {
        const b = bloc();
        expect(b.length).toBeGreaterThan(50);
        expect(b, 'la condition d’entrée est le verbe actuel').toContain("l.type === 's_acquiert_par'");
        expect(b, 'et la résolution doit dire « réactive »').toContain("reso.verbe === 'se_reactive_dans'");
    });

    it('⚠ elle NE TOUCHE PAS à la direction du lien', () => {
        // `resoudreVerbe` peut dire que la direction devrait être inversée.
        // Retourner une flèche qu'il a posée est une transformation d'un autre
        // ordre que corriger un libellé — et elle se verrait moins.
        const b = bloc();
        expect(b).not.toContain('l.source =');
        expect(b).not.toContain('l.cible =');
    });

    it('elle est IDEMPOTENTE par construction', () => {
        // Après passage, le verbe n'est plus « s'acquiert par » : la condition
        // ne mord plus. Rejouer le chargement ne rebascule rien — ce qui rend
        // aussi le compte rendu silencieux à partir du second chargement.
        const b = bloc();
        expect(b).toContain("l.type = 'se_reactive_dans'");
        expect(b).toContain("l.type === 's_acquiert_par'");
    });

    it('⚠ BOUT EN BOUT : charger une carte d’AVANT bascule les bons liens, et le DIT', () => {
        // ⚠ CE CAS REMPLACE DES ASSERTIONS SUR LA SOURCE, et le break-test a
        // dit pourquoi : neutraliser un appel (`void 0 &&`, `if (false)`)
        // laisse le TEXTE en place. Un `toContain('console.warn')` reste donc
        // vert alors que plus rien n'est annoncé — et une réécriture
        // silencieuse des données est exactement ce qu'on veut interdire.
        // On charge donc une vraie carte et on observe ce qui se passe.
        const dits = [];
        const sauvees = [];
        const carte = {
            compteur: 9, compteurLiens: 9,
            noeuds: [
                { id: 'planif-k1', type: 'conceptuelle', titre: 'Paratexte', x: 0, y: 0, parent: null, enfants: [], metadata: {} },
                { id: 'planif-o1', type: 'ouverture', titre: 'Rappel', x: 500, y: 0, parent: null, enfants: [], metadata: {} },
                { id: 'planif-k2', type: 'procedurale', titre: 'Annoter', x: 0, y: 300, parent: null, enfants: [], metadata: {} },
                { id: 'planif-r1', type: 'revision', titre: 'Transfert', x: 500, y: 300, parent: null, enfants: [], metadata: {} },
                { id: 'planif-k3', type: 'factuelle', titre: 'Marqueurs', x: 0, y: 600, parent: null, enfants: [], metadata: {} },
                { id: 'planif-m1', type: 'modelisation', titre: 'Modelage', x: 500, y: 600, parent: null, enfants: [], metadata: {} }
            ],
            liens: [
                { id: 'planif-L1', source: 'planif-k1', cible: 'planif-o1', type: 's_acquiert_par' },
                { id: 'planif-L2', source: 'planif-k2', cible: 'planif-r1', type: 's_acquiert_par' },
                { id: 'planif-L3', source: 'planif-k3', cible: 'planif-m1', type: 's_acquiert_par' }
            ]
        };
        // ⚠ ON ESPIONNE LA MÉTHODE, on ne remplace pas l'objet. Le module
        // capture `console` comme paramètre au chargement : le réassigner sur
        // window n'a aucun effet, et le test conclurait « rien n'a été
        // annoncé » alors qu'il n'écoutait simplement pas.
        const win = monterModule();
        const espion = vi.spyOn(console, 'warn').mockImplementation((...a) => dits.push(a.join(' ')));
        win.planificationDonnees = {
            getIndex: () => ({ active: 'c1', cartes: [{ id: 'c1', nom: 'T' }] }),
            chargerCarte: () => JSON.parse(JSON.stringify(carte)),
            sauvegarderCarte: (id, d) => sauvees.push(d)
        };
        api.chargerCarte('c1');
        espion.mockRestore();

        const lien = (id) => api.etat.liens.get(id).type;
        expect(lien('planif-L1'), 'connaissance → Ouverture').toBe('se_reactive_dans');
        expect(lien('planif-L2'), 'connaissance → Révision').toBe('se_reactive_dans');
        expect(lien('planif-L3'), 'connaissance → Modélisation NE bouge PAS').toBe('s_acquiert_par');

        // La direction est intacte : on corrige un libellé, on ne retourne
        // pas une flèche qu'il a posée.
        expect(api.etat.liens.get('planif-L1').source).toBe('planif-k1');
        expect(api.etat.liens.get('planif-L1').cible).toBe('planif-o1');

        // Ça se DIT, et ça dit QUOI : le compte, puis chaque lien par son titre.
        const rapport = dits.join('\n');
        expect(rapport, 'le compte rendu doit exister').toMatch(/2 lien\(s\) passés/);
        expect(rapport, 'et nommer les liens, pas seulement les compter').toContain('Paratexte');
        expect(rapport).toContain('Rappel');

        // Un signal À L'ÉCRAN aussi : la console ne suffit pas, il ne l'ouvre
        // pas. Sans ça, la seule trace d'une réécriture de ses données serait
        // dans un panneau qu'il ne regarde jamais.
        const toasts = win._ajoutesAuBody.filter((e) => /toast/.test(e.className || ''));
        expect(toasts.length, 'un toast doit annoncer la bascule').toBeGreaterThan(0);
        expect(toasts.map((t) => t.textContent).join(' '), 'et porter le compte')
            .toMatch(/2 liens? mis à jour/);

        // Et c'est ÉCRIT, pas seulement en mémoire.
        expect(sauvees.length, 'la carte doit être sauvegardée').toBeGreaterThan(0);
        const ecrits = sauvees[sauvees.length - 1].liens;
        expect(ecrits.find((l) => l.id === 'planif-L1').type).toBe('se_reactive_dans');
        expect(ecrits.find((l) => l.id === 'planif-L3').type).toBe('s_acquiert_par');
    });

    it('⚠ … et un SECOND chargement ne rebascule ni ne réannonce rien', () => {
        // L'idempotence n'est pas un détail : sans elle, il verrait le message
        // à chaque ouverture de sa carte, pour un changement déjà fait.
        const dits = [];
        let carte = {
            compteur: 9, compteurLiens: 9,
            noeuds: [
                { id: 'planif-k1', type: 'conceptuelle', titre: 'Paratexte', x: 0, y: 0, parent: null, enfants: [], metadata: {} },
                { id: 'planif-o1', type: 'ouverture', titre: 'Rappel', x: 500, y: 0, parent: null, enfants: [], metadata: {} }
            ],
            liens: [{ id: 'planif-L1', source: 'planif-k1', cible: 'planif-o1', type: 's_acquiert_par' }]
        };
        const win = monterModule();
        const espion = vi.spyOn(console, 'warn').mockImplementation((...a) => dits.push(a.join(' ')));
        win.planificationDonnees = {
            getIndex: () => ({ active: 'c1', cartes: [{ id: 'c1', nom: 'T' }] }),
            chargerCarte: () => JSON.parse(JSON.stringify(carte)),
            sauvegarderCarte: (id, d) => { carte = JSON.parse(JSON.stringify(d)); }
        };
        api.chargerCarte('c1');
        expect(dits.filter((d) => /passés/.test(d)).length, 'annoncé une fois').toBe(1);

        dits.length = 0;
        api.chargerCarte('c1');
        espion.mockRestore();
        expect(api.etat.liens.get('planif-L1').type).toBe('se_reactive_dans');
        expect(dits.filter((d) => /passés/.test(d)).length, 'plus rien à annoncer').toBe(0);
    });

    it('le changement est persisté, pas seulement mis en mémoire', () => {
        // Muter l'état sans écrire, c'est perdre la bascule au rechargement —
        // et la refaire à chaque ouverture, en réannonçant à chaque fois.
        const b = bloc();
        expect(b).toContain('liensModifies = true');
        expect(source).toContain('if (liensModifies) sauvegarder();');
    });
});

// -----------------------------------------------------------------------
describe('liens · E — le menu n’est plus un cul-de-sac', () => {
    it('⚠ tous les verbes du référentiel sont offerts, sous les suggérés', () => {
        // Pour une résolution « verticale » le menu n'offrait QU'UN verbe.
        // Quand ce verbe unique était le mauvais — le cas de l'Ouverture —
        // l'utilisateur n'avait aucun moyen de le corriger : un défaut de la
        // table devenait une impasse. C'est ce qui a rendu le défaut du jour
        // insoluble pour Grégoire.
        const menu = source.slice(
            source.indexOf('function afficherMenuLienExistant'),
            source.indexOf('function fermerMenuLien')
        );
        expect(menu.length).toBeGreaterThan(200);
        expect(menu, 'la liste des autres verbes doit être construite').toContain('autresVerbes');
        expect(menu, 'elle part du référentiel complet').toMatch(/autresVerbes\s*=\s*TYPES_LIENS/);
        expect(menu, 'et exclut ceux déjà proposés').toContain('verbesPertinents.indexOf(id) === -1');
        expect(menu, 'sous leur propre titre').toContain('Autres verbes');
    });
});
