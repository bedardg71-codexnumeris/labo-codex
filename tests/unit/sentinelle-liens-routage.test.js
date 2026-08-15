import { describe, it, expect, beforeEach } from 'vitest';
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
function monterModule(tailles) {
    const elements = new Map();
    const faire = (id) => {
        const t = (tailles && tailles[id]) || { w: 160, h: 60 };
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
            body: { appendChild() {}, removeChild() {} }
        }
    });
    win.cle = (k) => `a2026_${k}`;
    win.planificationDonnees = {
        getIndex: () => ({ active: 'carte_1', cartes: [{ id: 'carte_1', nom: 'Test' }] }),
        sauvegarderCarte: () => {}, chargerCarte: () => null
    };
    api = win.planificationCarte;
    return api;
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

    it('⏳ « révision » garde « s’acquiert par » — question ouverte, pas oubli', () => {
        // Le type « Révision et réutilisation » a la même nature, mais huit
        // paires explicites de VERBES_AUTO disent le contraire : quelqu'un a
        // tranché en connaissance de cause. On verrouille l'état ACTUEL au
        // lieu de faire comme si la question était réglée.
        expect(verbe('conceptuelle', 'revision').verbe).toBe('s_acquiert_par');
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
