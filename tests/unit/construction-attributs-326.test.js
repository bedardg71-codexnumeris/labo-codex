import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const SOURCE = readFileSync(path.join(RACINE, 'js/pratiques/construction-attributs.js'), 'utf8');
// Commentaires retirés avant toute recherche — même parade qu'à la sentinelle #690 :
// le module DOCUMENTE ce qu'il ne fait pas (« il ne lit pas noteDiffereeActive() »),
// et un grep naïf rougirait sur la documentation au lieu du code.
const CODE = SOURCE.replace(/\/\*[\s\S]*?\*\//g, '')
    .split('\n').map(l => l.replace(/\/\/.*$/, '')).join('\n');

// #326 R3 — extracteur PUR « config résolue → attributs de construction par famille ».
// Lignes du tableau du Comparateur (RELAIS §4.3.4), rangées depuis le 9 sept. 2026
// sous les SIX PARAMÈTRES du rapport PAREA (objet, révisabilité, agentivité,
// communication, granularité, détermination) — les six toujours rendus, y compris
// ceux que l'application ne couvre pas.
// Constat R1 (RELAIS §4.5) : STD ne porte PAS de jetons côté pratique vivante.

const win = chargerScript('js/pratiques/construction-attributs.js');
const { extraire, PARAMETRES } = win.ConstructionAttributs;
const CLES = PARAMETRES.map(p => p.cle);

const axes = (r) => r.attributs.map(a => a.axe);
const val = (r, axe) => (r.attributs.find(a => a.axe === axe) || {}).valeur;
const param = (r, axe) => (r.attributs.find(a => a.axe === axe) || {}).parametre;
const axesDe = (r, cle) => r.attributs.filter(a => a.parametre === cle).map(a => a.axe);

// ─────────────────────────────────────────────────────────────────────────────
// 9 sept. 2026 — LES SIX PARAMÈTRES (rapport PAREA « Laissons-les se tromper »).
// Ce qui est TOUJOURS rendu n'est plus trois ancres mais les six paramètres,
// y compris ceux que l'application ne couvre pas. Les cas ci-dessous
// remplacent les deux cas « ancres » : AXES_ANCRES a été retiré du module.
// ─────────────────────────────────────────────────────────────────────────────
describe('six paramètres · toujours rendus, dans l\'ordre', () => {
    it('les six paramètres du rapport, dans cet ordre exact', () => {
        expect(CLES).toEqual(['objet', 'revisabilite', 'agentivite',
            'communication', 'granularite', 'determination']);
    });

    it.each(['standards', 'specifications', 'sommative', 'denotation'])(
        'chacun des six porte au moins une ligne — famille %s', (type) => {
            const r = extraire({ type });
            const vus = new Set(r.attributs.map(a => a.parametre));
            expect(CLES.filter(c => !vus.has(c))).toEqual([]);
        });

    it('les lignes sortent groupées, dans l\'ordre des paramètres (aucun retour en arrière)', () => {
        const r = extraire({ type: 'standards' });
        const rangs = r.attributs.map(a => CLES.indexOf(a.parametre));
        expect(rangs).toEqual([...rangs].sort((x, y) => x - y));
        expect(rangs.every(i => i >= 0)).toBe(true);   // aucun paramètre inconnu
    });

    it('config vide → repli neutre : six paramètres, aucune exception, aucune valeur vide', () => {
        const r = extraire({});
        const vus = new Set(r.attributs.map(a => a.parametre));
        expect(CLES.filter(c => !vus.has(c))).toEqual([]);
        expect(r.attributs.every(a => typeof a.valeur === 'string' && a.valeur.length > 0)).toBe(true);
    });

    it('AXES_ANCRES est retiré, et rien ne porte plus le champ « ancre »', () => {
        expect(win.ConstructionAttributs.AXES_ANCRES).toBeUndefined();
        expect(extraire({ type: 'standards' }).attributs.some(a => 'ancre' in a)).toBe(false);
    });
});

describe('#326 R3 · STANDARDS', () => {
    const cfg = {
        type: 'standards',
        echelle: { echelle_nom: 'IDME H26', niveaux: [{}, {}, {}, {}] },
        portfolio: {
            methodeSelection: 'meilleurs', nombreARetenir: 4, minimumCompletion: 8,
            categories: { actif: true, selection: { ponderation: 65 }, obligatoires: { ponderation: 35 } }
        },
        notesFinales: true
    };
    it('pondération par catégories Sélection/Obligatoires', () => {
        expect(val(extraire(cfg), 'ponderation')).toBe('Sélection 65\u00A0% / Obligatoires 35\u00A0%');
    });
    it('méthode de sélection, composantes, mode note finale, échelle', () => {
        const r = extraire(cfg);
        expect(val(r, 'methodeSelection')).toBe('meilleurs');
        expect(val(r, 'composantes')).toMatch(/catégories/);
        expect(val(r, 'notesFinales')).toMatch(/Oui/);
        expect(val(r, 'echelle')).toBe('IDME H26 (4 niveaux)');
    });
    it('nb de productions = retenus sur minimum', () => {
        expect(val(extraire(cfg), 'nbProductions')).toBe('4 retenu(s) sur 8 minimum');
    });
    it('#715 · sous « tous », rien n\'est « retenu sur » : toutes les productions évaluées, le minimum entre parenthèses', () => {
        const tous = JSON.parse(JSON.stringify(cfg));
        const portfolio = (tous.configuration && tous.configuration.portfolio) || tous.portfolio;
        portfolio.methodeSelection = 'tous';
        expect(val(extraire(tous), 'nbProductions')).toBe('Toutes les productions évaluées (8 minimum)');
        expect(val(extraire(tous), 'methodeSelection')).toBe('tous');
        delete portfolio.minimumCompletion;
        expect(val(extraire(tous), 'nbProductions')).toBe('Toutes les productions évaluées');
    });
    it('CONSTAT R1 : STD ne liste PAS de jetons', () => {
        expect(axes(extraire(cfg))).not.toContain('jetons');
        // reprises STD = régime/récence, jamais « jetons »
        expect(val(extraire(cfg), 'reprises')).not.toMatch(/jeton/i);
    });
});

describe('relecture du lot 28 (17 sept. 2026) · reprises STD : l\'alias « derniers » vaut « recents »', () => {
    // « derniers » est la valeur que l'assistant et le formulaire ÉCRIVENT pour « N derniers » ; ce lecteur était le
    // seul des cinq à l'ignorer : une pratique « N derniers » lisait « Selon la sélection d'artefacts ».
    const std = (methodeSelection) => ({ type: 'standards', configuration: { portfolio: { nombreARetenir: 4, methodeSelection } } });
    it.each([['derniers'], ['recents'], ['recents-meilleurs']])('%s → « Récence (dernier essai retenu) »', (m) => {
        expect(val(extraire(std(m)), 'reprises')).toBe('Récence (dernier essai retenu)');
    });
    it.each([['meilleurs'], ['tous'], [undefined]])('%s → « Selon la sélection d\'artefacts » (le témoin : l\'alias ne déborde pas)', (m) => {
        expect(val(extraire(std(m)), 'reprises')).toBe('Selon la sélection d\'artefacts');
    });
});

describe('#326 R3 · SPÉCIFICATIONS', () => {
    const cfg = {
        type: 'specifications',
        seuilAcceptabilite: 100,
        tableBundles: [{}, {}, {}],
        jetons: { activer: true, reprise: { nombre: 2 } },
        echelle: { niveaux: [{}, {}, {}] }
    };
    it('reprises = jetons (SPE), seuil d\'acceptabilité, forfaits', () => {
        const r = extraire(cfg);
        expect(val(r, 'reprises')).toMatch(/Jetons de reprise \(2\)/);
        expect(val(r, 'seuilAcceptabilite')).toBe('100\u00A0%');
        expect(val(r, 'forfaits')).toBe('3 palier(s)');
    });
    it('nb de productions = types de travaux', () => {
        // typesTravaux absent → libellé générique
        expect(val(extraire(cfg), 'nbProductions')).toMatch(/Forfaits par type|type/);
    });
});

describe('#326 R3 · SOMMATIVE', () => {
    const cfg = { type: 'sommative', configuration: { reprisesPermises: 'limitees' }, reglesSpeciales: ['remplacement', 'plafonnement'] };
    it('pondération par production ; reprises : ce qui s\'applique, pas le déclaratif (#324, lot 11)', () => {
        const r = extraire(cfg);
        expect(val(r, 'ponderation')).toMatch(/production/i);
        expect(val(r, 'reprises')).toBe('La reprise prend la place de la copie d\'origine dans la note');
    });
    it('toutes les évaluations comptent ; pas d\'échelle (SOM par design)', () => {
        const r = extraire(cfg);
        expect(val(r, 'nbProductions')).toMatch(/Toutes/);
        expect(axes(r)).not.toContain('echelle');
    });
});

describe('#326 R3 · DÉNOTATION', () => {
    const cfg = { type: 'denotation', objectifs: ['Cible A', 'Cible B', 'Cible C'], suggestion: { methode: 'mediane' } };
    it('reprises s.o., note = jugement saisi, cibles, suggestion', () => {
        const r = extraire(cfg);
        expect(val(r, 'reprises')).toBe('s.o.');
        expect(val(r, 'noteFinale')).toMatch(/[Jj]ugement/);
        expect(val(r, 'nbProductions')).toBe('3 cible(s) d\'apprentissage');
        expect(val(r, 'suggestion')).toBe('mediane');
    });
    it('#343 (b) : échelle/grille DEN affichées comme critères explicites (pas « s.o. »)', () => {
        const r = extraire(cfg);
        // échelle/grille absentes → libellé « optionnelle » + cibles, jamais « s.o. » ni « #343 »
        expect(val(r, 'echelle')).toMatch(/[Oo]ptionnelle|critères/);
        expect(val(r, 'echelle')).not.toMatch(/#343|s\.o\./i);
        expect(val(r, 'grille')).toMatch(/[Oo]ptionnelle|critères/);
    });
    it('#343 (b) : échelle/grille DEN rattachées → affichées (résolues)', () => {
        const cfgMateriel = {
            type: 'denotation', objectifs: ['Cible A'], suggestion: { methode: 'mode' },
            echelle: { echelle_nom: 'IDME H26', niveaux: [{}, {}, {}, {}] },
            configuration: { grilleId: 'GRILLE_X' }
        };
        const r = extraire(cfgMateriel);
        expect(val(r, 'echelle')).toBe('IDME H26 (4 niveaux)');
        expect(val(r, 'grille')).toBe('Rattachée');
        // la note reste un jugement (l'échelle ne calcule pas)
        expect(val(r, 'noteFinale')).toMatch(/[Jj]ugement/);
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// 9 sept. 2026 — CE QUE CHAQUE PARAMÈTRE PORTE
// ─────────────────────────────────────────────────────────────────────────────

describe('six paramètres · rangement des axes existants', () => {
    const std = {
        type: 'standards',
        echelle: { echelle_nom: 'IDME H26', niveaux: [{}, {}, {}, {}] },
        portfolio: { methodeSelection: 'meilleurs', nombreARetenir: 4, minimumCompletion: 8 },
        notesFinales: true
    };
    const spe = { type: 'specifications', seuilAcceptabilite: 100, modeleBundle: 'litterature' };
    const den = { type: 'denotation', objectifs: ['A'], suggestion: { methode: 'mediane' } };

    it('OBJET porte le nombre de productions et les composantes', () => {
        const r = extraire(std);
        expect(param(r, 'nbProductions')).toBe('objet');
        expect(param(r, 'composantes')).toBe('objet');
    });

    it('RÉVISABILITÉ porte reprises, méthode de sélection et forfaits', () => {
        expect(param(extraire(std), 'reprises')).toBe('revisabilite');
        expect(param(extraire(std), 'methodeSelection')).toBe('revisabilite');
        // Les modèles de forfaits sont des mécaniques de reprise, pas des disciplines.
        expect(param(extraire(spe), 'forfaits')).toBe('revisabilite');
    });

    it('COMMUNICATION porte l\'échelle (les symboles) et la grille de rétroaction', () => {
        expect(param(extraire(std), 'echelle')).toBe('communication');
        expect(param(extraire(den), 'grille')).toBe('communication');
    });

    it('DÉTERMINATION porte pondération, note finale, seuil et suggestion', () => {
        expect(param(extraire(std), 'ponderation')).toBe('determination');
        expect(param(extraire(std), 'notesFinales')).toBe('determination');
        expect(param(extraire(spe), 'seuilAcceptabilite')).toBe('determination');
        expect(param(extraire(den), 'noteFinale')).toBe('determination');
        expect(param(extraire(den), 'suggestion')).toBe('determination');
    });
});

describe('six paramètres · ce qui n\'est PAS couvert s\'affiche', () => {
    it.each(['standards', 'specifications', 'sommative', 'denotation'])(
        'AGENTIVITÉ : une ligne unique « non couvert », toujours — famille %s', (type) => {
            const r = extraire({ type });
            expect(axesDe(r, 'agentivite')).toEqual(['agentivite']);
            expect(val(r, 'agentivite')).toMatch(/[Nn]on couvert/);
        });

    it('GRANULARITÉ : la note du cours est déclarée non couverte, pour toute famille', () => {
        ['standards', 'specifications', 'sommative', 'denotation'].forEach(type => {
            expect(val(extraire({ type }), 'granulariteCours')).toMatch(/[Nn]on couvert/);
        });
    });

    it('OBJET : l\'alignement sur des cibles est non couvert quand la note porte sur des instruments', () => {
        ['standards', 'specifications', 'sommative'].forEach(type => {
            expect(val(extraire({ type }), 'alignementCibles')).toMatch(/[Nn]on couvert/);
        });
        // Seule la dénotation rapporte la note à des cibles.
        expect(val(extraire({ type: 'denotation' }), 'alignementCibles')).not.toMatch(/[Nn]on couvert/);
    });

    it('un « non couvert » ne se masque jamais : la ligne existe et porte du texte', () => {
        const r = extraire({ type: 'sommative' });
        ['agentivite', 'granulariteCours', 'alignementCibles'].forEach(axe => {
            const ligne = r.attributs.find(a => a.axe === axe);
            expect(ligne).toBeDefined();
            expect(ligne.valeur.length).toBeGreaterThan(0);
        });
    });
});

describe('six paramètres · GRANULARITÉ extraite de l\'échelle', () => {
    it('le nombre de niveaux devient une ligne à part, sous granularité', () => {
        const r = extraire({ type: 'standards', echelle: { echelle_nom: 'IDME', niveaux: [{}, {}, {}, {}] } });
        expect(param(r, 'granulariteEvaluation')).toBe('granularite');
        expect(val(r, 'granulariteEvaluation')).toBe('4 niveaux');
        // l'échelle reste sous communication, avec son nom (les symboles)
        expect(val(r, 'echelle')).toBe('IDME (4 niveaux)');
        expect(param(r, 'echelle')).toBe('communication');
    });

    it('sans échelle : la sommative note en pourcentage, les spécifications sont binaires', () => {
        expect(val(extraire({ type: 'sommative' }), 'granulariteEvaluation')).toMatch(/pourcentage/i);
        expect(val(extraire({ type: 'specifications' }), 'granulariteEvaluation')).toMatch(/[Bb]inaire/);
    });
});

describe('six paramètres · les deux dérivations', () => {
    it('« ce à quoi la note se rapporte » : cibles en dénotation, instruments ailleurs', () => {
        expect(val(extraire({ type: 'denotation' }), 'objetNote')).toMatch(/[Cc]ibles/);
        ['standards', 'specifications', 'sommative'].forEach(type => {
            expect(val(extraire({ type }), 'objetNote')).toMatch(/instruments/i);
        });
    });

    it('la dérivation se range sous COMMUNICATION et ne demande aucun champ neuf', () => {
        const r = extraire({ type: 'standards' });   // config minimale, sans champ ajouté
        expect(param(r, 'objetNote')).toBe('communication');
        expect(val(r, 'objetNote')).not.toBe('—');
    });

    it('« temporalité de la note » pointe vers le réglage global, pas vers la pratique', () => {
        const r = extraire({ type: 'standards' });
        expect(param(r, 'temporaliteNote')).toBe('communication');
        expect(val(r, 'temporaliteNote')).toMatch(/Réglages/);
        expect(val(r, 'temporaliteNote')).toMatch(/Préférences/);
    });

    it('la temporalité est identique pour toutes les familles (c\'est un réglage global)', () => {
        const vus = ['standards', 'specifications', 'sommative', 'denotation']
            .map(type => val(extraire({ type }), 'temporaliteNote'));
        expect(new Set(vus).size).toBe(1);
    });
});

describe('six paramètres · règles spéciales éclatées (le cas tranché)', () => {
    it('chaque règle cochée se range sous SON paramètre', () => {
        const r = extraire({ type: 'sommative',
            reglesSpeciales: ['remplacement', 'double_verrou', 'plafonnement', 'portfolio'] });
        expect(param(r, 'regleVerrou')).toBe('determination');
        expect(param(r, 'reglePortfolio')).toBe('objet');
    });

    it('une règle absente ne produit aucune ligne', () => {
        const r = extraire({ type: 'sommative', reglesSpeciales: ['portfolio'] });
        expect(axes(r)).toContain('reglePortfolio');
        expect(axes(r)).not.toContain('regleVerrou');
    });

    // #903 (21 sept. 2026) — le remplacement et le plafonnement étaient annoncés « Actif »
    // alors que rien ne les applique. Une pratique ancienne PORTE encore leurs clés : elles
    // sont tues — ni ligne « Actif », ni mot brut par le repli des valeurs inconnues.
    it('#903 · une pratique qui porte « remplacement » et « plafonnement » : aucune ligne ne les annonce', () => {
        const r = extraire({ type: 'sommative',
            reglesSpeciales: ['remplacement', 'double_verrou', 'plafonnement', 'portfolio'] });
        expect(axes(r)).not.toContain('regleRemplacement');
        expect(axes(r)).not.toContain('reglePlafonnement');
        expect(axes(r).filter(a => /^regle_/.test(a))).toEqual([]);
        expect(JSON.stringify(r)).not.toMatch(/remplac|plafonn/i);
    });

    it('#903 · elle ne porte QUE des règles retirées : « Aucune », les mots qui existaient déjà', () => {
        for (const reglesSpeciales of [['remplacement'], ['plafonnement', 'remplacement'], { remplacement: true, plafonnement: true }]) {
            const r = extraire({ type: 'sommative', reglesSpeciales });
            expect(val(r, 'reglesSpeciales')).toBe('Aucune');
            expect(JSON.stringify(r)).not.toMatch(/remplac|plafonn/i);
        }
    });

    it('aucune règle → une seule ligne « Aucune », sous détermination', () => {
        const r = extraire({ type: 'sommative' });
        expect(val(r, 'reglesSpeciales')).toBe('Aucune');
        expect(param(r, 'reglesSpeciales')).toBe('determination');
    });

    it('« aucune » explicite vaut pas de règle', () => {
        expect(val(extraire({ type: 'sommative', reglesSpeciales: ['aucune'] }), 'reglesSpeciales')).toBe('Aucune');
    });

    it('règles portées par un objet plutôt qu\'un tableau : même rangement', () => {
        const r = extraire({ type: 'sommative', reglesSpeciales: { double_verrou: true, portfolio: true } });
        expect(param(r, 'regleVerrou')).toBe('determination');
        expect(param(r, 'reglePortfolio')).toBe('objet');
    });

    it('une règle inconnue est rendue telle quelle plutôt que perdue', () => {
        const r = extraire({ type: 'sommative', reglesSpeciales: ['bidule_inconnu'] });
        const ligne = r.attributs.find(a => a.valeur === 'bidule_inconnu');
        expect(ligne).toBeDefined();
        expect(ligne.parametre).toBe('determination');
    });
});

describe('six paramètres · posture et pureté (inchangées)', () => {
    const toutes = ['standards', 'specifications', 'sommative', 'denotation']
        .map(type => extraire({ type, reglesSpeciales: ['remplacement', 'portfolio'],
            echelle: { echelle_nom: 'IDME', niveaux: [{}, {}, {}, {}] } }));

    it('aucune valeur ne hiérarchise les familles ni ne juge la pratique', () => {
        const interdits = /sévèr|généreu|indulgen|meilleure? pratique|plus juste|moins juste|recommandé/i;
        toutes.forEach(r => r.attributs.forEach(a => {
            expect(a.valeur).not.toMatch(interdits);
            expect(a.libelle).not.toMatch(interdits);
        }));
    });

    it('le module reste PUR : ni DOM, ni stockage dans son code', () => {
        expect(CODE).not.toMatch(/document\.|localStorage|sessionStorage|indexedDB/);
        // il ne LIT pas la préférence de note différée : il POINTE vers son emplacement
        expect(CODE).not.toMatch(/noteDiffereeActive\s*\(/);
        // ... et le commentaire qui l'explique est bien là, lui (témoin : la
        // garde ci-dessus mesure le code, pas la documentation)
        expect(SOURCE).toMatch(/noteDiffereeActive/);
    });

    it('MODELES_FORFAITS et ses valeurs persistées ne bougent pas', () => {
        expect(win.ConstructionAttributs.MODELES_FORFAITS.map(m => m.value))
            .toEqual(['sciences', 'simple', 'litterature', 'personnalise']);
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// #809 (9 sept. 2026) — LES LIBELLÉS DES RÈGLES SOMMATIVES ONT UNE SOURCE UNIQUE
// Ils vivaient dans trois tables : les options de l'assistant, son récapitulatif
// et ce module. Et deux d'entre elles AVAIENT DÉJÀ DIVERGÉ.
// ─────────────────────────────────────────────────────────────────────────────
const SRC_WIZARD = readFileSync(path.join(RACINE, 'js/wizard-pratique-v2.js'), 'utf8');
const CODE_WIZARD = SRC_WIZARD.replace(/\/\*[\s\S]*?\*\//g, '')
    .split('\n').map((l) => l.replace(/\/\/.*$/, '')).join('\n');

describe('#809 · une seule table de libellés de règles sommatives', () => {
    const { libelleRegleSommative } = win.ConstructionAttributs;

    it('le module expose le libellé, et rend la clé brute si elle est inconnue', () => {
        expect(libelleRegleSommative('portfolio')).toBe('Portfolio de progression');
        // #903 : sorties de la table — plus aucun écran ne demande leur libellé.
        expect(libelleRegleSommative('remplacement')).toBe('remplacement');
        expect(libelleRegleSommative('plafonnement')).toBe('plafonnement');
        // mieux un mot brut qu'un trou
        expect(libelleRegleSommative('bidule_inconnu')).toBe('bidule_inconnu');
        expect(libelleRegleSommative(null)).toBe('');
    });

    it('LA DIVERGENCE MESURÉE : le libellé retenu est celui de l\'écran de saisie', () => {
        // L'assistant faisait cocher « Verrou sur une évaluation » et son
        // récapitulatif rendait « Verrou d'évaluation ». Une case, deux mots.
        expect(libelleRegleSommative('double_verrou')).toBe('Verrou sur une évaluation');
    });

    it('le wizard ne réécrit AUCUN de ces quatre libellés en dur', () => {
        [
            'Remplacement automatique', 'Portfolio de progression',
            'Plafonnement conditionnel', 'Verrou sur une évaluation', "Verrou d'évaluation"
        ].forEach((libelle) => {
            const enDur = CODE_WIZARD.split('\n')
                .filter((l) => l.includes("label: '" + libelle) || l.includes("'" + libelle + "'"));
            expect(enDur, 'libellé en dur dans le wizard : ' + libelle + ' → ' + enDur.join(' | '))
                .toEqual([]);
        });
    });

    it('et il passe bien par la source unique — l\'APPEL, pas la mention', () => {
        // ⚠ Mesuré au break-test : vérifier que le nom APPARAÎT ne prouve rien.
        // Vider le corps du helper (`? cle : cle`) laissait le nom dans la
        // condition et l'essai restait vert. C'est l'appel qui compte.
        expect(CODE_WIZARD).toMatch(/window\.ConstructionAttributs\.libelleRegleSommative\s*\(\s*cle\s*\)/);
        expect(CODE_WIZARD).toMatch(/_libelleRegle\('portfolio'\)/);
        expect(CODE_WIZARD).toMatch(/_libelleRegle\('double_verrou'\)/);
    });

    it('les deux clés du wizard sont exactement celles que le module connaît (#903 : elles étaient quatre)', () => {
        // Les `value` sont PERSISTÉES : elles ne doivent pas bouger, et aucune
        // règle de l'écran ne doit manquer à la table.
        ['double_verrou', 'portfolio'].forEach((cle) => {
            expect(CODE_WIZARD).toMatch(new RegExp("value: '" + cle + "'"));
            expect(libelleRegleSommative(cle)).not.toBe(cle);   // le module la connaît
        });
        // #903 — cliquet d'absence : les deux cases retirées ne reviennent pas.
        ['remplacement', 'plafonnement'].forEach((cle) => {
            expect(CODE_WIZARD).not.toMatch(new RegExp("value: '" + cle + "'"));
        });
    });
});
