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
    it('aucun trimestre : l\'application est vide, la vue est simple', () => {
        expect(D.applicationVide([])).toBe(true);
        expect(D.vueAuDemarrage({ choix: null, vide: true, demoOuverte: false })).toBe('simple');
    });

    it('la démonstration ne compte pas comme des données', () => {
        expect(D.applicationVide([{ id: 'demo', isDemo: true }])).toBe(true);
        expect(D.applicationVide([{ id: 'autre', isDemo: true }])).toBe(true);
    });

    it('un trimestre hors démonstration compte comme des données, même sans étudiant·es (décision de Cowork, 9 nov. 2026)', () => {
        expect(D.applicationVide([{ id: 'h2027', actif: true }])).toBe(false);
        expect(D.applicationVide([{ id: 'demo', isDemo: true }, { id: 'a2026', actif: false }])).toBe(false);
        expect(D.vueAuDemarrage({ choix: null, vide: false, demoOuverte: false })).toBe('etendue');
    });

    it('la vue voyage avec le fichier : sans choix sur l\'appareil, un fichier marqué « simple » s\'ouvre en vue simple', () => {
        expect(D.vueAuDemarrage({ choix: null, vide: false, demoOuverte: false, marque: 'simple' })).toBe('simple');
        expect(D.vueAuDemarrage({ choix: null, vide: false, demoOuverte: false, marque: 'etendue' })).toBe('etendue');
        expect(D.vueAuDemarrage({ choix: null, vide: false, demoOuverte: false, marque: null })).toBe('etendue');
        // Le choix fait sur l'appareil prime toujours.
        expect(D.vueAuDemarrage({ choix: 'etendue', vide: false, demoOuverte: false, marque: 'simple' })).toBe('etendue');
        expect(D.CLE_MARQUE).toBe('vueDuFichier');
    });

    it('la marque s\'écrit dans le fichier à l\'enregistrement, jamais par l\'écran ni à la bascule ; une fusion ne l\'importe pas', () => {
        const ecran = lire('js/vue-simple.js');
        expect(ecran).not.toMatch(/db\.(set|setSync|modifier)\([^)]*CLE_MARQUE/);
        const codex = lire('js/codex.js');
        expect(codex).toContain('donnees[window.VueSimpleDonnees.CLE_MARQUE] = window.VueSimple.vueCourante();');
        expect(tranche(codex, 'async function genererCodex(', 'zip.file(NOM_DONNEES, json);')).toContain('_marquerLaVue(donnees);');   // posée avant que le fichier soit écrit
        // À l'ouverture d'un fichier, la marque arrive dans la base avec ses données ; à la fusion, elle est « de l'appareil » :
        // ni importée, ni mise en conflit.
        expect(tranche(codex, 'var REGLAGES_DE_L_APPAREIL = [', '];')).toContain("'vueDuFichier'");
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
            portfolio: { actif: true, utiliser: true, methodeSelection: 'tous', nombreARetenir: 7, minimumCompletion: 7 } });   // « Toutes les productions » (Grégoire, 9 nov. 2026)
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
        expect(D.regleStd(p)).toEqual({ methode: 'tous', nombre: 7 });   // l'original n'est pas muté
        expect(D.regleStd({ configuration: { portfolio: { methodeSelection: 'derniers', nombreARetenir: 4 } } }).methode).toBe('recents');
        expect(D.regleStd({ configuration: { portfolio: { methodeSelection: 'hybride' } } }).methode).toBe('autre');
        expect(D.poserRegleStd(p, { methode: 'inconnue', nombre: '0' }).configuration.portfolio).toMatchObject({ methodeSelection: 'tous', nombreARetenir: 7 });
    });

});

describe('F. La pratique se règle : les niveaux, les types, les paliers', () => {
    const bibliotheque = lire('js/pratiques-bibliotheque.js');
    const MODELES = new Function(tranche(bibliotheque, 'const MODELES_PRATIQUES_PREDEFINIS', '/**\n * Obtenir toutes les configurations') + '\nreturn MODELES_PRATIQUES_PREDEFINIS;')();
    const DEPART = { id: 'ECHELLE_IDME_DEPART', nom: 'Échelle de départ (IDME)', niveaux: [
        { code: 'PS', nom: 'Préstructurel', min: 0, max: 39.99, valeurCalcul: 0, couleur: 'var(--gris-moyen)' },
        { code: 'I', nom: 'Incomplet', min: 40, max: 64.99, valeurCalcul: 40, couleur: 'var(--niveau-attention-critique)' },
        { code: 'D', nom: 'Développement', min: 65, max: 74.99, valeurCalcul: 65, couleur: 'var(--niveau-attention-modere)' },
        { code: 'M', nom: 'Maîtrise', min: 75, max: 84.99, valeurCalcul: 75, couleur: 'var(--niveau-attention-minimal)' },
        { code: 'E', nom: 'Étendu', min: 85, max: 100, valeurCalcul: 100, couleur: 'var(--niveau-attention-nul)' }] };
    const std = () => D.pratiqueDepuisModele(MODELES['STD-n-meilleurs'], { id: 'PRAT_1', nom: 'Par standards', echelleId: null, maintenant: 'm' });
    const spe = () => D.pratiqueDepuisModele(MODELES['SPE-simple'], { id: 'PRAT_2', nom: 'Par spécifications', maintenant: 'm' });
    const aucun = () => 0;

    it('l\'échelle née avec la pratique est UNE COPIE à elle, nommée « Mes niveaux » ; l\'échelle de départ n\'est pas touchée', () => {
        const avant = JSON.stringify(DEPART);
        const p = std();
        const r = D.echelleReglee(DEPART, p, D.brouillonDeLaPratique(p, DEPART).niveaux, { idNeuf: 'ECH_1', maintenant: 'm' });
        expect(r.copiee).toBe(true);
        expect(r.echelle).toMatchObject({ id: 'ECH_1', nom: 'Mes niveaux', pratiqueId: 'PRAT_1' });
        expect(r.echelle.nom).not.toMatch(/IDME|départ/i);
        expect(r.echelle.niveaux).toEqual(DEPART.niveaux);   // même départ : lettres, noms, valeurs, bornes, couleurs
        expect(JSON.stringify(DEPART)).toBe(avant);
        // Réglée ensuite, sa propre échelle est réécrite sous le même identifiant : rien n'est copié une seconde fois.
        const b = D.brouillonDeLaPratique(p, r.echelle).niveaux.map((n) => (n.code === 'M' ? Object.assign({}, n, { valeur: '80' }) : n));
        const r2 = D.echelleReglee(r.echelle, p, b, { idNeuf: 'ECH_2', maintenant: 'm2' });
        expect(r2.copiee).toBe(false);
        expect(r2.echelle.id).toBe('ECH_1');
        expect(r2.echelle.niveaux.find((n) => n.code === 'M').valeurCalcul).toBe(80);
    });

    it('une échelle née avec la pratique mais lue aussi ailleurs (une pratique dupliquée, une production) est copiée, pas réécrite', () => {
        const p = std();
        const aElle = { id: 'ECH_1', nom: 'Mes niveaux', pratiqueId: 'PRAT_1', niveaux: DEPART.niveaux };
        const b = D.brouillonDeLaPratique(p, aElle).niveaux;
        expect(D.echelleReglee(aElle, p, b, { idNeuf: 'ECH_2', maintenant: 'm', lueAilleurs: false })).toMatchObject({ copiee: false, echelle: { id: 'ECH_1' } });
        const r = D.echelleReglee(aElle, p, b, { idNeuf: 'ECH_2', maintenant: 'm', lueAilleurs: true });
        expect(r).toMatchObject({ copiee: true, echelle: { id: 'ECH_2', pratiqueId: 'PRAT_1', copieDe: 'ECH_1' } });   // `copieDe` : les résultats d'avant portent encore ECH_1
    });

    it('des bornes en chaînes (stock importé) se lisent en nombres : sans rien changer, « Étendu » garde sa borne à 85', () => {
        const chaines = DEPART.niveaux.map((n) => Object.assign({}, n, { min: String(n.min), max: String(n.max) }));
        const n = D.niveauxRegles(chaines, D.brouillonDeLaPratique(std(), { niveaux: chaines }).niveaux);
        expect(n.map((x) => [x.code, x.min, x.max])).toEqual([['PS', 0, 39.99], ['I', 40, 64.99], ['D', 65, 74.99], ['M', 75, 84.99], ['E', 85, 100]]);
    });

    it('une pratique qui lit une échelle du trimestre : au premier réglage, l\'échelle est copiée, jamais modifiée', () => {
        const partagee = { id: 'E_PARTAGEE', nom: 'Échelle fictive', niveaux: DEPART.niveaux };
        const avant = JSON.stringify(partagee);
        const p = std();
        const b = D.brouillonDeLaPratique(p, partagee).niveaux.map((n) => (n.code === 'D' ? Object.assign({}, n, { valeur: 60 }) : n));
        const r = D.echelleReglee(partagee, p, b, { idNeuf: 'ECH_9', maintenant: 'm' });
        expect(r).toMatchObject({ copiee: true, echelle: { id: 'ECH_9', pratiqueId: 'PRAT_1' } });
        expect(JSON.stringify(partagee)).toBe(avant);
    });

    it('quatre niveaux aux valeurs inventées : lettres, noms, valeurs et ordre sont ceux du brouillon ; les bornes suivent les valeurs', () => {
        const brouillon = [{ origine: null, code: 'A', nom: 'Abouti', valeur: '95' }, { origine: null, code: 'B', nom: 'Bien', valeur: '82' },
            { origine: null, code: 'C', nom: 'En chemin', valeur: '61,5' }, { origine: null, code: 'Z', nom: 'À reprendre', valeur: '30' }];
        const n = D.niveauxRegles([], brouillon);
        expect(n.map((x) => [x.code, x.nom, x.valeurCalcul, x.min, x.max])).toEqual([
            ['A', 'Abouti', 95, 95, 100], ['B', 'Bien', 82, 82, 94.99], ['C', 'En chemin', 61.5, 61.5, 81.99], ['Z', 'À reprendre', 30, 0, 61.49]]);
    });

    it('un niveau gardé conserve sa couleur ; un niveau ajouté n\'en a pas (le tableau lui donne la couleur neutre)', () => {
        const p = std();
        const b = D.gestes.niveauAjouter(D.brouillonDeLaPratique(p, DEPART));
        b.niveaux[5] = { origine: null, code: 'X', nom: 'Exemplaire', valeur: 110 };
        expect(D.refusDesNiveaux(b, aucun)).toEqual({ refus: 'valeurNiveau' });
        b.niveaux[5].valeur = 90;
        const n = D.niveauxRegles(DEPART.niveaux, b.niveaux);
        expect(n.find((x) => x.code === 'E').couleur).toBe('var(--niveau-attention-nul)');
        expect(n.find((x) => x.code === 'X').couleur).toBeUndefined();
    });

    it('retirer un niveau : deux au minimum ; un niveau inscrit dans des résultats ne se retire pas, et le brouillon ne bouge pas', () => {
        const b = D.brouillonDeLaPratique(std(), DEPART);
        const compter = (lettre) => (lettre === 'M' ? 3 : 0);
        expect(D.gestes.niveauRetirer(b, 3, compter)).toEqual({ refus: 'niveauUtilise', n: 3, nom: 'Maîtrise' });
        const sansE = D.gestes.niveauRetirer(b, 4, compter);
        expect(sansE.niveaux.map((n) => n.code)).toEqual(['PS', 'I', 'D', 'M']);
        expect(b.niveaux).toHaveLength(5);   // l'ancien brouillon n'est pas muté
        const deux = { niveaux: b.niveaux.slice(0, 2) };
        expect(D.gestes.niveauRetirer(deux, 0, aucun)).toEqual({ refus: 'minimumNiveaux' });
    });

    it('la lettre d\'un niveau inscrit dans des résultats ne se change pas ; deux niveaux ne portent pas la même lettre', () => {
        const b = D.brouillonDeLaPratique(std(), DEPART);
        b.niveaux[3] = Object.assign({}, b.niveaux[3], { code: 'B' });
        expect(D.refusDesNiveaux(b, (l) => (l === 'M' ? 2 : 0))).toEqual({ refus: 'lettreUtilisee', n: 2, nom: 'M' });
        expect(D.refusDesNiveaux(b, aucun)).toBeNull();
        b.niveaux[3].code = 'd';
        expect(D.refusDesNiveaux(b, aucun)).toEqual({ refus: 'lettreEnDouble' });
        b.niveaux[3].code = '';
        expect(D.refusDesNiveaux(b, aucun)).toEqual({ refus: 'niveauIncomplet' });
    });

    it('changer l\'ordre des niveaux : monter, descendre ; rien ne sort de la liste', () => {
        const b = D.brouillonDeLaPratique(std(), DEPART);
        expect(D.gestes.niveauDeplacer(b, 4, -1).niveaux.map((n) => n.code)).toEqual(['PS', 'I', 'D', 'E', 'M']);
        expect(D.gestes.niveauDeplacer(b, 0, -1).niveaux.map((n) => n.code)).toEqual(['PS', 'I', 'D', 'M', 'E']);
        expect(D.gestes.niveauDeplacer(b, 4, 1).niveaux).toHaveLength(5);
    });

    it('une règle changée sans toucher aux niveaux n\'écrit aucune échelle', () => {
        const b = D.brouillonDeLaPratique(std(), DEPART);
        expect(D.niveauxChanges(DEPART, b.niveaux)).toBe(false);
        b.niveaux[1] = Object.assign({}, b.niveaux[1], { valeur: 45 });
        expect(D.niveauxChanges(DEPART, b.niveaux)).toBe(true);
    });

    it('les types : renommer, ajouter, retirer (un au minimum) ; un type porté par une production ne se retire pas', () => {
        const p = spe();
        let b = D.brouillonDeLaPratique(p, null);
        expect(b.types).toEqual([{ id: 1, nom: 'Projet' }, { id: 2, nom: 'Examen' }]);
        expect(D.gestes.typeRetirer(b, 0, () => 2)).toEqual({ refus: 'typeUtilise', n: 2, nom: 'Projet' });
        b = D.gestes.typeAjouter(b);
        expect(b.types[2]).toEqual({ id: 3, nom: '', neuf: true });
        // Un type ajouté après un retrait ne reprend jamais l'identifiant du retiré (il hériterait de ses champs cachés et de ses productions).
        const reprise = D.gestes.typeAjouter(D.gestes.typeRetirer(b, 2, aucun));
        expect(reprise.types.map((t) => t.id)).toEqual([1, 2, 4]);
        expect(D.refusDesSpecifications(b)).toEqual({ refus: 'typeSansNom' });
        b.types[2].nom = 'Atelier';
        b.types[0].nom = 'Travail long';
        b = D.gestes.typeRetirer(b, 1, aucun);   // « Examen » part, et ses exigences avec lui
        expect(b.paliers.map((x) => x.travaux)).toEqual([{ 1: 2 }, { 1: 1 }]);
        const q = D.poserSpecifications(p, b);
        expect(q.configuration.typesTravaux).toEqual([{ id: 1, nom: 'Travail long', description: 'Travail pratique ou créatif' }, { id: 3, nom: 'Atelier' }]);
        expect(D.gestes.typeRetirer({ types: [{ id: 1, nom: 'Seul' }], paliers: [] }, 0, aucun)).toEqual({ refus: 'minimumTypes' });
        expect(p.configuration.typesTravaux).toHaveLength(2);   // la pratique d'origine n'est pas mutée
    });

    it('les paliers : ajouter, retirer (un au minimum), leur note et leurs exigences ; sans exigence, c\'est le plancher', () => {
        const p = spe();
        let b = D.gestes.palierAjouter(D.brouillonDeLaPratique(p, null));
        expect(D.refusDesSpecifications(b)).toEqual({ refus: 'palierSansNom' });
        b.paliers[2] = Object.assign({}, b.paliers[2], { lettre: 'Sous la réussite', note: '45', travaux: { 1: '0', 2: '' } });
        b.paliers[0] = Object.assign({}, b.paliers[0], { note: '95', travaux: { 1: '3', 2: '1', 9: '4' } });
        expect(D.refusDesSpecifications(b)).toBeNull();
        const q = D.poserSpecifications(p, b);
        expect(q.configuration.forfaits.map((f) => [f.lettre, f.note, f.travaux])).toEqual([
            ['Excellence', 95, { 1: 3, 2: 1 }], ['Réussite', 70, { 1: 1, 2: 1 }], ['Sous la réussite', 45, {}]]);
        b.paliers[1] = Object.assign({}, b.paliers[1], { note: '170' });
        expect(D.refusDesSpecifications(b)).toEqual({ refus: 'notePalier' });
        expect(D.gestes.palierRetirer({ paliers: [{ id: 1 }] }, 0)).toEqual({ refus: 'minimumPaliers' });
        // Un seul plancher, et c'est la note la plus basse : sinon qui n'a rien d'acceptable recevrait la note haute.
        const c = D.gestes.palierAjouter(D.brouillonDeLaPratique(p, null));
        c.paliers[2] = Object.assign({}, c.paliers[2], { lettre: 'Bonus', note: '100', travaux: {} });
        expect(D.refusDesSpecifications(c)).toEqual({ refus: 'plancherTropHaut', nom: 'Bonus' });
        c.paliers[2].note = '40';
        expect(D.refusDesSpecifications(c)).toBeNull();
        const d = D.gestes.palierAjouter(c);
        d.paliers[3] = Object.assign({}, d.paliers[3], { lettre: 'Autre plancher', note: '20', travaux: { 1: '0' } });
        expect(D.refusDesSpecifications(d)).toEqual({ refus: 'deuxPlanchers' });
        expect(d.paliers.map((x) => x.id)).toEqual([1, 2, 3, 4]);
        expect(D.gestes.palierRetirer(b, 2).paliers).toHaveLength(2);
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
        // Arrêtés le 9 nov. 2026, 19 h 35 : la carte 4, et « étudiant·e » partout (jamais « élève »).
        expect(ecran).toContain("texte: 'Vois la note de chaque étudiant·e et exporte-les en CSV, prêtes pour ton relevé.'");
        expect(ecran).toContain("sousTitreAccueil: 'Quatre étapes, de ta liste d’étudiant·es à ta note finale.'");
        expect(ecran).toContain("texte: 'Colle ta liste d’étudiant·es : DA, nom, prénom.'");
        const mots = tranche(ecran, 'const MOTS = Object.freeze({', '    /**\n     * Le seul point d\'écriture de HTML');
        const sansCommentaires = mots.split('\n').map((l) => l.replace(/\/\/.*$/, '')).join('\n');   // les commentaires disent le mot qu'on écarte
        expect(sansCommentaires.match(/élèves?|élève/gi)).toBeNull();
    });
});
