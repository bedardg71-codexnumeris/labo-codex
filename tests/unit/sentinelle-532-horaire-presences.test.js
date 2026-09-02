import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

// =======================================================================
// SENTINELLE #532 — « L'HORAIRE N'EST PAS CONFIGURÉ » (ALORS QU'IL L'EST),
// ET LE LIEN QUI NE DÉBOUCHE NULLE PART
// =======================================================================
//
// Retour d'un testeur, 26 août 2026 (1.99.2, build 0826-1008), gravité
// BLOQUANT : « Dans la section Suivi > Présences, je ne peux pas entrer les
// présences, un message d'erreur en couleur jaune doré m'indique que l'horaire
// n'est pas configuré (alors qu'il l'est dans la section Cadre). Un hyperlien
// m'envoie vers Configurer l'horaire, mais le lien ne débouche nulle part. »
//
// DEUX BUGS INDÉPENDANTS, l'un derrière l'autre.
//
// ▣ A — L'ALERTE MENTAIT, TOUJOURS. La condition d'affichage était
//        `if (!formatHoraire || seancesHoraire.length === 0)`, avec
//        `formatHoraire = db.getSync('formatHoraire', null)`. Or cette clé de
//        base de données n'est PLUS ÉCRITE PAR PERSONNE : le format vit
//        maintenant dans l'entité Horaire du groupe-cours
//        (`horaire.formatHoraire`). Grep exhaustif du dépôt au 26 août : trois
//        lectures, zéro écriture. `!formatHoraire` valait donc toujours `true`
//        et le premier terme décidait seul — l'horaire réel n'était même pas
//        consulté. Invisible pour qui traîne un résidu Beta 95 dans son
//        localStorage ; permanent pour tout NOUVEAU testeur. C'est la famille
//        « une opération qui a l'air de vérifier et ne vérifie rien ».
//
// ▣ B — LE LIEN NE POUVAIT PAS ABOUTIR, DEUX FOIS. `naviguerVersReglagesTrimestre`
//        était définie DEUX FOIS sur `window` : dans saisie-presences.js
//        (index.html:14491) et dans main.js (index.html:14629). Le dispatcher
//        `[data-action]` résout par `window[nom]` AU MOMENT DU CLIC : c'est donc
//        main.js — le dernier chargé — qui l'emportait toujours. Et sa version
//        posait `location.href = '#calendrier-trimestre'` (le dépôt n'a AUCUN
//        routeur de hash : grep `hashchange|location.hash` = 0 résultat) puis
//        appelait `afficherSousSectionActuelle`, un nom qui n'existe nulle part.
//        Le clic changeait l'URL, rien d'autre.
//        Le doublon perdant, lui, visait `afficherSection('reglages')` — alors
//        que `#calendrier-trimestre` vit dans `#section-calendrier`, la section
//        « Cadre ». Même en gagnant, il n'aurait rien montré.
//
// ⮕ CE QUI EST VERROUILLÉ ICI :
//   A. le bandeau se décide sur les SÉANCES et sur rien d'autre (banc vivant) ;
//   B. la clé morte `formatHoraire` ne revient pas décider de cet affichage ;
//   C. `naviguerVersReglagesTrimestre` n'est définie qu'UNE fois dans le dépôt ;
//   D. elle mène à la section `calendrier` (Cadre), jamais à `reglages`, et
//      n'appelle aucun nom fantôme ;
//   E. le bandeau et son lien existent dans index.html, et l'action visée est
//      réellement exportée quelque part.
//
// ⚠ CE QUE CETTE SENTINELLE NE COUVRE PAS : que l'horaire du testeur soit
// bien RATTACHÉ à son groupe-cours. Si le bandeau reparaît chez lui après ce
// correctif, il dira alors la vérité — et le défaut sera dans le rattachement
// (`groupesCours[].horaireId`), pas ici.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');
const lire = (...p) => readFileSync(path.join(racine, ...p), 'utf8');

const SRC_PRESENCES = lire('js', 'saisie-presences.js');
const SRC_MAIN = lire('js', 'main.js');
const SRC_INDEX = lire('index.html');

/* ------------------------------------------------------------------ banc A */

/**
 * Monte saisie-presences.js et exécute le vrai chemin d'entrée dans la
 * sous-section (`initialiserModuleSaisiePresences`), avec pour seul élément
 * observable le bandeau d'alerte.
 *
 * ⚠ Le bandeau doit être un élément VIVANT : si `classList` était un stub
 * inerte, révélé et masqué se ressembleraient et le test ne pourrait rien
 * protéger. On tient donc l'état de `u-hide` dans un Set réel.
 */
function monter({ seances }) {
    const classes = new Set(['alerte', 'alerte-attention', 'u-hide']);
    const bandeau = {
        id: 'alerteFormatHoraire',
        classList: {
            add: (c) => classes.add(c),
            remove: (c) => classes.delete(c),
            contains: (c) => classes.has(c),
            toggle: (c, force) => {
                if (force === undefined) return classes.has(c) ? (classes.delete(c), false) : (classes.add(c), true);
                if (force) classes.add(c); else classes.delete(c);
                return force;
            }
        },
        set innerHTML(_v) { bandeau._innerHTML = _v; },
        get innerHTML() { return bandeau._innerHTML || ''; }
    };

    const elements = {
        'suivi-saisie': { id: 'suivi-saisie' },
        alerteFormatHoraire: bandeau
    };

    const win = chargerScript('js/saisie-presences.js', {
        db: { getSync: (k, d) => (d !== undefined ? d : null), setSync: () => {} },
        cle: (k) => `a2026_${k}`,
        // Le cœur du banc : l'horaire réel du cours actif.
        obtenirSeancesHoraire: () => seances,
        dateLocaleYMD: () => '2026-08-26',
        document: {
            getElementById: (id) => elements[id] || null,
            querySelector: () => null,
            querySelectorAll: () => [],
            addEventListener: () => {},
            createElement: () => ({ style: {}, classList: { add() {}, remove() {} } })
        }
    });

    win.initialiserModuleSaisiePresences();
    return { estVisible: () => !classes.has('u-hide'), bandeau };
}

const SEANCES = [
    { id: 1, lettre: 'A', jour: 'lundi', debut: '08:00', nombrePeriodes: 2 },
    { id: 2, lettre: 'B', jour: 'jeudi', debut: '10:00', nombrePeriodes: 2 }
];

describe('#532 · A — le bandeau se décide sur les séances, et sur rien d\'autre', () => {

    it('A.a LE CAS DU RETOUR DU 26 AOÛT : horaire configuré → aucun bandeau', () => {
        const { estVisible } = monter({ seances: SEANCES });
        expect(
            estVisible(),
            'avant #532, la clé morte formatHoraire rendait la condition toujours vraie : ' +
            'le bandeau s\'affichait même avec un horaire complet'
        ).toBe(false);
    });

    it('A.b horaire vide → le bandeau se montre (sinon on aurait supprimé l\'avertissement)', () => {
        const { estVisible } = monter({ seances: [] });
        expect(estVisible()).toBe(true);
    });

    it('A.c le bandeau n\'est plus réécrit par le code : son texte vit dans index.html', () => {
        const { bandeau } = monter({ seances: [] });
        expect(
            bandeau.innerHTML,
            'deux textes pour un même bandeau finissent toujours par diverger — ' +
            'et c\'est ce qui était arrivé (« 2×2h / 1×4h » d\'un côté, autre chose de l\'autre)'
        ).toBe('');
    });
});

/* ------------------------------------------------ B — la clé morte ne revient pas */

describe('#532 · B — la clé db `formatHoraire` ne décide plus de cet affichage', () => {

    it('B.a verifierConfigurationFormatHoraire() ne lit plus la clé morte', () => {
        const debut = SRC_PRESENCES.indexOf('function verifierConfigurationFormatHoraire()');
        expect(debut, 'la fonction a été renommée ou retirée sans mettre à jour cette sentinelle').toBeGreaterThan(-1);
        const corps = SRC_PRESENCES.slice(debut, SRC_PRESENCES.indexOf('\n}', debut));
        expect(
            /getSync\(\s*['"]formatHoraire['"]/.test(corps),
            'la clé n\'est écrite NULLE PART dans le dépôt : la relire, c\'est réafficher le bandeau à tort'
        ).toBe(false);
    });

    it('B.b la prémisse tient : personne n\'écrit la clé db `formatHoraire`', () => {
        // Si un jour quelqu'un l'écrit vraiment, ce test tombe et la décision
        // se reprend en connaissance de cause — plutôt qu'en silence.
        const ecritures = /setSync\(\s*(['"]formatHoraire['"]|cle\(\s*['"]formatHoraire['"])/;
        const fichiers = ['js/saisie-presences.js', 'js/horaire.js', 'js/trimestre-v2.js', 'js/donnees-v2.js', 'js/migrations.js'];
        for (const f of fichiers) {
            expect(ecritures.test(lire(...f.split('/'))), `${f} écrit désormais la clé`).toBe(false);
        }
    });
});

/* --------------------------------------------- C+D — un seul lien, qui aboutit */

describe('#532 · C — « Configurer l\'horaire » mène à Cadre, une seule fois', () => {

    const DEFINITION = /window\.naviguerVersReglagesTrimestre\s*=/g;

    it('C.a la fonction n\'est définie qu\'une seule fois dans tout le dépôt', () => {
        const doublons = [];
        for (const [f, src] of [['js/main.js', SRC_MAIN], ['js/saisie-presences.js', SRC_PRESENCES]]) {
            const n = (src.match(DEFINITION) || []).length;
            if (n > 0) doublons.push(`${f} (${n})`);
        }
        expect(
            doublons.join(' + '),
            'deux définitions = la dernière chargée gagne en silence ; c\'était la mauvaise'
        ).toBe('js/main.js (1)');
    });

    it('C.b elle mène à la section `calendrier` (Cadre), pas à `reglages`', () => {
        const debut = SRC_MAIN.indexOf('window.naviguerVersReglagesTrimestre =');
        const corps = SRC_MAIN.slice(debut, SRC_MAIN.indexOf('};', debut));
        expect(corps).toContain("afficherSection('calendrier')");
        expect(corps).toContain("afficherSousSection('calendrier-trimestre')");
        expect(
            corps.includes("afficherSection('reglages')"),
            '#calendrier-trimestre vit dans #section-calendrier : viser reglages n\'affiche rien'
        ).toBe(false);
    });

    it('C.c elle n\'appelle plus de nom fantôme ni de hash sans routeur', () => {
        const debut = SRC_MAIN.indexOf('window.naviguerVersReglagesTrimestre =');
        const corps = SRC_MAIN.slice(debut, SRC_MAIN.indexOf('};', debut));
        expect(corps).not.toContain('afficherSousSectionActuelle');
        expect(corps).not.toContain('location.href');
    });

    it('C.d `afficherSousSectionActuelle` reste bien un nom qui n\'existe pas', () => {
        // La prémisse du diagnostic. Si quelqu'un crée cette fonction un jour,
        // ce test tombe : le raisonnement ci-dessus serait à reprendre.
        const definie = /function\s+afficherSousSectionActuelle|afficherSousSectionActuelle\s*=\s*function/;
        expect(definie.test(SRC_MAIN)).toBe(false);
        expect(definie.test(lire('js', 'navigation.js'))).toBe(false);
    });
});

describe('#532 · D — le bandeau et son lien existent réellement dans la page', () => {

    it('D.a le bandeau #alerteFormatHoraire est présent et masqué au départ', () => {
        expect(SRC_INDEX).toMatch(/id="alerteFormatHoraire"[^>]*class="[^"]*u-hide/);
    });

    it('D.b son lien porte une action réellement exportée', () => {
        const bloc = SRC_INDEX.slice(
            SRC_INDEX.indexOf('id="alerteFormatHoraire"'),
            SRC_INDEX.indexOf('id="alerteFormatHoraire"') + 900
        );
        const action = (bloc.match(/data-action="([^"]+)"/) || [])[1];
        expect(action, 'le bandeau a perdu son lien').toBeTruthy();
        expect(
            new RegExp(`window\\.${action}\\s*=`).test(SRC_MAIN),
            `l'action "${action}" n'est exportée nulle part : le dispatcher ne trouverait rien`
        ).toBe(true);
        expect(bloc).toContain('data-prevent');
    });
});
