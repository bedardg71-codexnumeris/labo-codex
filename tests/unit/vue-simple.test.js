/**
 * VUE SIMPLE (lot « Vue simple », consigne de Cowork du 9 nov. 2026) — les fonctions pures et la navigation.
 *
 * A. La règle de la vue par défaut : application vide, démonstration, codex importé, choix explicite.
 * B. La navigation de la vue étendue est IDENTIQUE avant et après le lot : entrées, ordre, sous-sections
 *    (figées à l'état de `b6d5926`, la base du lot) ; `js/config.js` et `js/navigation.js` n'ont pas bougé d'un octet.
 * C. La liste collée : DA, nom, prénom ; rien n'est inventé.
 * D. Ce qui naît en coulisse : le groupe sans horaire, la production la plus légère, la pratique tirée d'un modèle.
 * E. La règle « ne nomme rien qui n'existe pas » : la grille de l'utilisateur ; les mots arrêtés.
 *
 * Break-tests (faits le 9 nov. 2026, code restauré ensuite) : rapport, section « La preuve ».
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';
import { tranche } from './_helpers/tranche.js';

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const lire = (f) => readFileSync(path.join(racine, f), 'utf8');
const D = chargerScript('js/vue-simple-donnees.js', {}, {}).VueSimpleDonnees;

describe('A. La vue au démarrage', () => {
    const eleves = { a2026: [{ da: '9990001', nom: 'Albatros', prenom: 'Ada' }], demo: [{ da: '9990009', nom: 'Démo', prenom: 'Dédé' }] };
    const lire_ = (id) => eleves[id] || [];

    it('aucun trimestre : l\'application est vide, la vue est simple', () => {
        expect(D.applicationVide([], lire_)).toBe(true);
        expect(D.vueAuDemarrage({ choix: null, vide: true, demoOuverte: false })).toBe('simple');
    });

    it('un trimestre sans élève ne compte pas : toujours vide', () => {
        expect(D.applicationVide([{ id: 'h2027', actif: true }], lire_)).toBe(true);
    });

    it('la démonstration ne compte pas comme des données', () => {
        expect(D.applicationVide([{ id: 'demo', isDemo: true }], lire_)).toBe(true);
        expect(D.applicationVide([{ id: 'autre', isDemo: true }], () => [{ da: '9990008' }])).toBe(true);
    });

    it('un codex ouvert ou importé compte : ses élèves sont là, la vue est étendue', () => {
        expect(D.applicationVide([{ id: 'demo', isDemo: true }, { id: 'a2026' }], lire_)).toBe(false);
        expect(D.vueAuDemarrage({ choix: null, vide: false, demoOuverte: false })).toBe('etendue');
    });

    it('un élève dans un trimestre qui n\'est PAS l\'actif compte aussi (« dans aucun trimestre »)', () => {
        expect(D.applicationVide([{ id: 'h2027', actif: true }, { id: 'a2026', actif: false }], lire_)).toBe(false);
    });

    it('le choix de l\'utilisateur prime, dans les deux sens', () => {
        expect(D.vueAuDemarrage({ choix: 'simple', vide: false, demoOuverte: false })).toBe('simple');
        expect(D.vueAuDemarrage({ choix: 'etendue', vide: true, demoOuverte: false })).toBe('etendue');
        expect(D.vueAuDemarrage({ choix: 'simple', vide: true, demoOuverte: true })).toBe('simple');
    });

    it('sans choix, la démonstration ouverte donne la vue étendue (elle ne s\'ouvre que de là)', () => {
        expect(D.vueAuDemarrage({ choix: null, vide: true, demoOuverte: true })).toBe('etendue');
    });

    it('sous un banc (navigateur piloté), sans choix : la vue étendue, pour que les bancs existants gardent leur écran', () => {
        expect(D.vueAuDemarrage({ choix: null, vide: true, demoOuverte: false, pilote: true })).toBe('etendue');
        expect(D.vueAuDemarrage({ choix: 'simple', vide: true, demoOuverte: false, pilote: true })).toBe('simple');
    });

    it('un choix illisible ne vaut pas un choix', () => {
        expect(D.vueAuDemarrage({ choix: 'autre chose', vide: true, demoOuverte: false })).toBe('simple');
    });

    it('le choix reste sur l\'appareil : sa clé n\'est écrite que dans localStorage, jamais par `db`', () => {
        const ecran = lire('js/vue-simple.js');
        expect(ecran).toContain('window.localStorage.setItem(D().CLE_CHOIX');
        expect(ecran).not.toMatch(/db\.(set|setSync|modifier)\([^)]*CLE_CHOIX/);
    });
});

describe('B. La navigation de la vue étendue, identique avant et après', () => {
    // Figé à `b6d5926` (base du lot) : sections, ordre, sous-sections et libellés.
    const FIGE = {
        accueil: [],
        conception: ['materiel:Mon matériel', 'carte:Alignement', 'productions:Productions', 'grille-criteres:Grilles', 'echelle-performance:Échelles', 'retroactions:Cartouches', 'pratiques-notation:Pratiques'],
        calendrier: ['trimestre:Trimestre', 'vue:Calendrier'],
        suivi: ['groupe:Groupe', 'liste:Étudiant·es', 'saisie:Présences', 'profil:Profils', 'interventions:Interventions', 'rencontres:Rencontres', 'animation:Animation'],
        evaluations: ['importer:Préparer', 'liste:Liste', 'annoter:Annoter', 'exporter:Exporter'],
        labo: ['accompagnement:Observation', 'modelisation:Modélisation', 'comparateur:Exploration', 'rythme:Rythme', 'etudes:Études', 'bilan:Bilan', 'longitudinal:Suivi longitudinal'],
        aide: ['commencer:Commencer', 'cadre:Cadre', 'conception:Conception', 'evaluation:Évaluation', 'suivi:Suivi', 'labo:Labo', 'codex-archives:Codex et archives', 'reference:Référence'],
        reglages: ['preferences:Préférences', 'donnees:Données', 'a-propos:À propos']
    };
    const BARRE_FIGEE = ['accueil:Accueil', 'calendrier:Cadre', 'conception:Conception', 'evaluations:Évaluation', 'suivi:Suivi', 'labo:Labo'];
    const html = lire('index.html');

    it('configurationsOnglets : mêmes sections, même ordre, mêmes sous-sections', () => {
        const config = new Function(lire('js/config.js') + '\nreturn configurationsOnglets;')();
        const mesure = {};
        Object.keys(config).forEach((s) => { mesure[s] = config[s].map((i) => `${i.id}:${i.label}`); });
        expect(Object.keys(mesure)).toEqual(Object.keys(FIGE));
        expect(mesure).toEqual(FIGE);
    });

    it('les deux fichiers protégés n\'ont pas bougé d\'un octet depuis la base du lot', () => {
        const empreinte = (f) => createHash('sha256').update(readFileSync(path.join(racine, f))).digest('hex');
        expect(empreinte('js/config.js')).toBe('378a90d2399dc981d48c7785e42e814d8eb5f611b4722a319ef9031467ed4d5b');
        expect(empreinte('js/navigation.js')).toBe('2aa0307b1b91475866d5ec95cb9d6b166914a99e16f88cffdcae17bcb540ec88');
    });

    const decoder = (t) => t.replace(/&Eacute;/g, 'É').replace(/&eacute;/g, 'é');
    const boutonsDe = (bloc) => [...bloc.matchAll(/<button data-onglet="([^"]+)"[^>]*><span class="nav-label"[^>]*>([^<]+)<\/span>/g)].map((m) => `${m[1]}:${decoder(m[2])}`);

    it('la barre principale de la vue étendue : mêmes entrées, même ordre', () => {
        const barre = html.match(/<nav class="navigation-principale">([\s\S]*?)<\/nav>/);
        expect(barre).not.toBeNull();
        expect(boutonsDe(barre[1])).toEqual(BARRE_FIGEE);
    });

    it('la liste des sections des écrans étroits : mêmes entrées, même ordre', () => {
        const liste = html.match(/<div id="entete-sections-liste"[^>]*>([\s\S]*?)<\/div>/);
        const entrees = [...liste[1].matchAll(/data-action="afficherSection" data-param="([^"]+)"/g)].map((m) => m[1]);
        expect(entrees).toEqual(BARRE_FIGEE.map((e) => e.split(':')[0]));
    });

    it('la barre de la vue simple est une AUTRE barre, à cinq entrées, dont les sections existent', () => {
        const barre = html.match(/<nav class="navigation-principale navigation-vue-simple"[^>]*>([\s\S]*?)<\/nav>/);
        expect(barre).not.toBeNull();
        const entrees = boutonsDe(barre[1]).map((e) => e.split(':')[0]);
        expect(entrees).toEqual(D.ECRANS.map((e) => 'simple-' + e));
        entrees.forEach((e) => expect(html).toContain(`id="section-${e}"`));
    });

    it('le menu : les cinq lignes d\'avant, dans l\'ordre, puis un filet, puis les deux lignes des vues', () => {
        const menu = html.match(/<div id="entete-menu-panneau"[^>]*>([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>/)[1];
        const lignes = [...menu.matchAll(/<button [^>]*data-action="([A-Za-z.]+)"(?: data-param="([a-z]+)")?/g)].map((m) => [m[1], m[2]].filter(Boolean).join(':'));
        expect(lignes).toEqual(['ouvrirPanneauAssistance', 'afficherSection:aide', 'ouvrirModalRapportBug', 'ouvrirModalSoutien', 'afficherSection:reglages', 'VueSimple.basculer:simple', 'VueSimple.basculer:etendue']);
        expect(menu.indexOf('entete-menu-filet')).toBeGreaterThan(menu.indexOf('data-param="reglages"'));
        expect(menu.indexOf('entete-menu-filet')).toBeLessThan(menu.indexOf('menu-vue-simple'));
    });

    it('le masquage vit dans la feuille de la vue simple : chaque vue cache la barre et la ligne de menu de l\'autre', () => {
        const css = lire('css/vue-simple.css');
        expect(css).toContain('body:not(.vue-simple) .navigation-vue-simple');
        expect(css).toContain('body:not(.vue-simple) #menu-vue-etendue');
        expect(css).toContain('body.vue-simple .navigation-principale:not(.navigation-vue-simple)');
        expect(css).toContain('body.vue-simple #entete-menu-panneau > :not(#menu-vue-etendue)');
    });
});

describe('C. La liste collée', () => {
    it('lit « DA, nom, prénom » séparés par virgule, point-virgule, tabulation ou espaces', () => {
        const r = D.analyserListeCollee('9990001, Albatros, Ada\n9990002;Baobab;Bruno\n9990003\tCormoran\tChloé\n9990004 Dahlia Dario Junior');
        expect(r.refusees).toEqual([]);
        expect(r.fiches).toEqual([
            { da: '9990001', nom: 'Albatros', prenom: 'Ada' }, { da: '9990002', nom: 'Baobab', prenom: 'Bruno' },
            { da: '9990003', nom: 'Cormoran', prenom: 'Chloé' }, { da: '9990004', nom: 'Dahlia', prenom: 'Dario Junior' }
        ]);
    });

    it('saute la ligne de titres et les lignes vides', () => {
        const r = D.analyserListeCollee('DA;Nom;Prénom\n\n9990001;Albatros;Ada\n   \n');
        expect(r.fiches).toHaveLength(1);
        expect(r.refusees).toEqual([]);
    });

    it('n\'invente aucun DA : une ligne sans DA de 7 chiffres est refusée et nommée', () => {
        const r = D.analyserListeCollee('123, Trop, Court\nAlbatros, Ada\n99900011, Trop, Long');
        expect(r.fiches).toEqual([]);
        expect(r.refusees.map((x) => x.raison)).toEqual([D.RAISONS.da, D.RAISONS.da, D.RAISONS.da]);
        expect(r.refusees[0].ligne).toBe('123, Trop, Court');
    });

    it('refuse une ligne sans nom ou sans prénom, et un DA collé deux fois', () => {
        const r = D.analyserListeCollee('9990001, Albatros\n9990002, Baobab, Bruno\n9990002, Baobab, Bruno');
        expect(r.fiches).toEqual([{ da: '9990002', nom: 'Baobab', prenom: 'Bruno' }]);
        expect(r.refusees.map((x) => x.raison)).toEqual([D.RAISONS.incomplet, D.RAISONS.double]);
    });

    it('une liste à quatre colonnes dont la deuxième est un groupe : le groupe est écarté', () => {
        const r = D.analyserListeCollee('9990001\t00001\tAlbatros\tAda');
        expect(r.fiches).toEqual([{ da: '9990001', nom: 'Albatros', prenom: 'Ada' }]);
    });
});

describe('D. Ce qui naît en coulisse', () => {
    it('le trimestre vient de la date du jour : hiver, été, automne', () => {
        expect(D.trimestreDeLaDate(new Date(2026, 10, 9))).toEqual({ session: 'A', annee: '2026', id: 'a2026' });
        expect(D.trimestreDeLaDate(new Date(2027, 1, 1))).toEqual({ session: 'H', annee: '2027', id: 'h2027' });
        expect(D.trimestreDeLaDate(new Date(2027, 5, 15)).id).toBe('e2027');
    });

    it('le groupe naît sans horaire et sans pratique ; rien qui ressemble à une donnée de l\'enseignant·e', () => {
        const gc = D.groupeCoursLeger({ id: 'GC_1', trimestre: { id: 'a2026', nom: 'Automne 2026' }, cours: { id: 'C1', nomCours: 'Mon cours' }, enseignantId: 'profil', maintenant: '2026-11-09T12:00:00.000Z' });
        expect(gc).toMatchObject({ id: 'GC_1', trimestreId: 'a2026', coursId: 'C1', groupeNum: '1', horaireId: null, pratiqueId: null });
        expect(Object.keys(gc).sort()).toEqual(['actif', 'coursId', 'dateCreation', 'enseignantId', 'groupeNum', 'horaireId', 'id', 'nom', 'pratiqueId', 'trimestreId']);
    });

    it('le rang d\'une production : son numéro, sinon les chiffres qui terminent son identifiant (la lecture du calcul)', () => {
        expect(D.rangDeProduction({ id: 'PROD_x', numero: 4 })).toBe(4);
        expect(D.rangDeProduction({ id: 'PROD_1762700000123' })).toBe(1762700000123);
        expect(D.rangDeProduction({ id: 'sans-chiffre' })).toBe(0);
    });

    it('la fiche d\'un élève ne porte que ce qui a été collé', () => {
        expect(D.ficheEleve({ da: '9990001', nom: 'Albatros', prenom: 'Ada' }, 'C1')).toEqual({ da: '9990001', nom: 'Albatros', prenom: 'Ada', groupe: '1', programme: '', sa: '', coursId: 'C1' });
    });

    it('la production la plus légère : un nom, une date, le cours ; ni grille, ni échelle, ni pondération', () => {
        const p = D.productionLegere({ id: 'PROD_1', titre: '  Production 1 ', date: '2026-11-02', coursId: 'C1', maintenant: '2026-11-09T12:00:00.000Z' });
        expect(p).toEqual({ id: 'PROD_1', titre: 'Production 1', type: 'autre', description: '', dateEcheance: '2026-11-02', coursId: 'C1', dansBibliotheque: true,
            dateCreation: '2026-11-09T12:00:00.000Z', dateModification: '2026-11-09T12:00:00.000Z' });
        expect(D.productionLegere({ id: 'P', titre: 'X', coursId: 'C1', type: 2, maintenant: 'm' }).type).toBe(2);
    });

    const bibliotheque = lire('js/pratiques-bibliotheque.js');
    const MODELES = new Function(tranche(bibliotheque, 'const MODELES_PRATIQUES_PREDEFINIS', '/**\n * Obtenir toutes les configurations') + '\nreturn MODELES_PRATIQUES_PREDEFINIS;')();

    it('la pratique par standards vient du modèle existant : ses valeurs de départ, rien d\'inventé', () => {
        const p = D.pratiqueDepuisModele(MODELES['STD-n-meilleurs'], { id: 'PRAT_1', nom: 'Par standards', echelleId: 'ECHELLE_IDME_DEPART', maintenant: 'm' });
        expect(p).toMatchObject({ id: 'PRAT_1', nom: 'Par standards', type: 'standards', dansBibliotheque: true, jetons: { actif: false }, inspireDe: { sourceId: 'STD-n-meilleurs' } });
        expect(p.configuration).toMatchObject({ type: 'standards', echelleId: 'ECHELLE_IDME_DEPART', notesFinales: false,
            portfolio: { actif: true, utiliser: true, methodeSelection: 'meilleurs', nombreARetenir: 7, minimumCompletion: 7 } });
        expect(p.estGabarit).toBeUndefined();
        expect(p.auteur).toBeUndefined();   // « Demo Labo Codex » la ferait masquer dans Conception › Pratiques (`BibliothequeUI.estItemDemo`)
        expect(MODELES['STD-n-meilleurs'].id).toBe('STD-n-meilleurs');   // le modèle n'est pas touché
    });

    it('la pratique par spécifications vient du modèle existant : ses types et ses paliers', () => {
        const p = D.pratiqueDepuisModele(MODELES['SPE-simple'], { id: 'PRAT_2', nom: 'Par spécifications', maintenant: 'm' });
        expect(p.configuration).toEqual(Object.assign({ type: 'specifications' }, MODELES['SPE-simple'].configuration));
    });

    it('la règle des standards : la méthode et le nombre ; le reste de la pratique ne bouge pas', () => {
        const p = D.pratiqueDepuisModele(MODELES['STD-n-meilleurs'], { id: 'PRAT_1', echelleId: 'E', maintenant: 'm' });
        const q = D.poserRegleStd(p, { methode: 'recents', nombre: '3' });
        expect(D.regleStd(q)).toEqual({ methode: 'recents', nombre: 3 });
        expect(q.configuration.portfolio.minimumCompletion).toBe(3);
        // Un minimum réglé à part en vue étendue (1 pour 3 retenues) n'est pas écrasé par « Enregistrer la règle ».
        const regle = { configuration: { portfolio: { methodeSelection: 'tous', nombreARetenir: 3, minimumCompletion: 1 } } };
        expect(D.poserRegleStd(regle, { methode: 'tous', nombre: '3' }).configuration.portfolio).toMatchObject({ nombreARetenir: 3, minimumCompletion: 1 });
        expect(D.poserRegleStd(regle, { methode: 'meilleurs', nombre: '5' }).configuration.portfolio).toMatchObject({ nombreARetenir: 5, minimumCompletion: 1 });
        expect(q.configuration.echelleId).toBe('E');
        expect(D.regleStd(p)).toEqual({ methode: 'meilleurs', nombre: 7 });   // l'original n'est pas muté
        expect(D.regleStd({ configuration: { portfolio: { methodeSelection: 'derniers', nombreARetenir: 4 } } }).methode).toBe('recents');
        expect(D.regleStd({ configuration: { portfolio: { methodeSelection: 'hybride' } } }).methode).toBe('autre');
        expect(D.poserRegleStd(p, { methode: 'inconnue', nombre: '0' }).configuration.portfolio).toMatchObject({ methodeSelection: 'meilleurs', nombreARetenir: 7 });
    });

    it('les paliers des spécifications : la note et les nombres ; une valeur hors bornes est ignorée', () => {
        const p = D.pratiqueDepuisModele(MODELES['SPE-simple'], { id: 'PRAT_2', maintenant: 'm' });
        const q = D.poserPaliersSpe(p, [{ id: '1', note: '95', travaux: { 1: '3', 2: '-1' } }, { id: '2', note: '170', travaux: {} }]);
        expect(q.configuration.forfaits[0]).toMatchObject({ note: 95, travaux: { 1: 3, 2: 1 } });
        expect(q.configuration.forfaits[1].note).toBe(70);
    });
});

describe('E. La vue simple ne nomme rien qui n\'existe pas', () => {
    it('une grille de l\'utilisateur existe ; la grille que l\'application sème d\'elle-même ne compte pas', () => {
        expect(D.aUneGrille([])).toBe(false);
        expect(D.aUneGrille([{ id: 'GRILLE_GENERIQUE', nom: 'Grille de départ' }])).toBe(false);
        expect(D.aUneGrille([{ id: 'G_X', nom: 'Grille fictive', dansBibliotheque: false }])).toBe(false);
        expect(D.aUneGrille([{ id: 'GRILLE_GENERIQUE' }, { id: 'G_X', nom: 'Grille fictive' }])).toBe(true);
    });

    it('les mots arrêtés par Grégoire, mot pour mot', () => {
        const ecran = lire('js/vue-simple.js');
        expect(ecran).toContain("titreAccueil: 'Ta notation alternative'");
        expect(ecran).toContain("boutonSauvegarder: 'Sauvegarder'");
        expect(ecran).toContain("phraseSauvegarder: 'Tes données restent dans ce navigateur. Enregistre-les dans un fichier, ton codex, pour ne pas les perdre et pour les rouvrir ailleurs.'");
        expect(ecran).toContain("vueSimple: 'Vue simple'");
        expect(ecran).toContain("vueEtendue: 'Vue étendue'");
    });
});
