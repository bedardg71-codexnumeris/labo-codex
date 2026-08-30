/* ===============================
   MODULE: DECODEUR HEIC
   Convertit les remises HEIC/HEIF en JPEG, pour que le reste de
   l'application n'ait jamais à connaître ce format.

   POURQUOI CE MODULE EXISTE
   Le HEIC est annoncé comme format accepté dans quatre textes d'interface,
   et les iPhone le produisent par défaut. Mais aucun navigateur sauf Safari
   ne le décode : Chrome répond `onerror` sur un `<img>`, mesuré le 30 août
   2026 (Chrome 151). Conséquence avant ce module : une remise HEIC entrait
   dans la file, passait la validation, et ressortait sans miniature, sans
   dimensions et — plus grave — non annotable, puisque la visionneuse bute
   sur le même décodage. L'application promettait un format qu'elle ne
   savait pas lire.

   PARTI PRIS : on convertit TOUJOURS, y compris sur Safari qui saurait
   afficher l'original. Un seul comportement quel que soit le navigateur,
   et le fichier archivé puis exporté est un JPEG lisible sur n'importe quel
   appareil — y compris ceux des collègues à qui une production est remise.

   DEPENDANCES
   - js/heic-worker.js (chargé paresseusement, à la première conversion)
   - libs/libheif-bundle.js (chargé par le worker, jamais par cette page)
   =============================== */

(function() {
    'use strict';

    // Un seul worker pour toute la session : le module WASM pèse 1,2 Mo et
    // s'instancie une fois. Les conversions passent en file plutôt qu'en
    // parallèle — décoder quatre photos de front sature la mémoire sans
    // gagner de temps, le calcul étant déjà saturant sur un seul cœur.
    let _worker = null;
    let _workerRefuse = false;
    let _prochainId = 1;
    const _enAttente = new Map(); // id → { resoudre, rejeter, minuterie }

    // 90 s : une conversion mesurée prend ~2,5 s sur un Mac de 2023. La marge
    // couvre un appareil lent sans laisser une promesse pendante pour
    // toujours si le worker meurt en silence.
    const DELAI_MAX_MS = 90000;

    /**
     * Vérifie si un fichier est un HEIC/HEIF.
     * Le type MIME est absent ou faux assez souvent (fichiers sortis d'un zip,
     * recopiés d'un appareil) : l'extension sert de second recours.
     * @param {File|Blob} fichier - Le fichier à tester
     * @param {string} [nomFichier] - Le nom, si le blob n'en porte pas
     * @returns {boolean}
     */
    function estHeic(fichier, nomFichier) {
        if (!fichier) return false;
        const type = (fichier.type || '').toLowerCase();
        if (type === 'image/heic' || type === 'image/heif') return true;
        const nom = (nomFichier || fichier.name || '').toLowerCase();
        return /\.(heic|heif)$/.test(nom);
    }

    /**
     * Dit si le décodage HEIC est possible DANS CE CONTEXTE, sans rien décoder.
     *
     * Mesuré le 30 août 2026 (Chrome, banc isolé, fichier réel) :
     * - application servie en http + CSP du projet → décodage 3024 x 4032 ;
     * - application ouverte par double-clic (`file://`) → `new Worker(...)` lève
     *   « SecurityError : cannot be accessed from origin 'null' ».
     * Les trois contournements ont été mesurés et tous échouent sous la règle
     * « zéro eval() » : décodage en thread principal et blob worker (même avec
     *   le bundle embarqué) butent sur `EvalError`, le glue emscripten évaluant
     *   une chaîne ; un blob worker HÉRITE de la CSP du document, contrairement
     *   à un worker chargé par URL same-origin.
     *
     * On ne construit PAS le worker pour répondre : il tirerait le bundle de
     * 1,2 Mo. Le protocole suffit — c'est la condition mesurée, pas une
     * approximation.
     *
     * @returns {boolean} true si une conversion peut aboutir ici
     */
    function decodagePossible() {
        if (typeof Worker === 'undefined' || typeof OffscreenCanvas === 'undefined') return false;
        if (_workerRefuse) return false;
        return window.location.protocol !== 'file:';
    }

    /**
     * Crée le worker au premier appel et branche la réception.
     * @returns {Worker|null} Le worker, ou null si l'environnement ne le permet pas
     */
    function obtenirWorker() {
        if (_worker) return _worker;
        if (_workerRefuse) return null;
        if (typeof Worker === 'undefined' || typeof OffscreenCanvas === 'undefined') {
            return null;
        }

        // Meme trou de filet que pour le bundle : ce chemin n'est dans aucune
        // balise <script>, donc aucun des trois filets anti-cache ne le voit.
        try {
            _worker = new Worker('js/heic-worker.js?v=20260830a');
        } catch (e) {
            // Ouverte en `file://`, la page a l'origine `null` et Chrome REFUSE
            // de construire un Worker (SecurityError, mesuré le 30 août 2026).
            // C'est le mode d'ouverture normal de l'application par double-clic :
            // ce n'est pas un cas limite, c'est un chemin courant.
            console.warn('[HeicDecodeur] Worker indisponible (' + (e.message || e) + ') — aucun décodage possible dans ce contexte');
            _workerRefuse = true;
            return null;
        }

        _worker.onmessage = function(evenement) {
            const donnees = evenement.data || {};
            const attente = _enAttente.get(donnees.id);
            if (!attente) return;
            _enAttente.delete(donnees.id);
            clearTimeout(attente.minuterie);

            if (donnees.ok) {
                attente.resoudre({
                    blob: donnees.jpeg,
                    largeur: donnees.largeur,
                    hauteur: donnees.hauteur
                });
            } else {
                attente.rejeter(new Error(donnees.erreur || 'echec du decodage HEIC'));
            }
        };

        // Un worker mort ne répondra plus jamais : libérer toutes les
        // conversions en attente plutôt que de les laisser pendantes.
        _worker.onerror = function(evenement) {
            const message = 'worker HEIC interrompu : ' + ((evenement && evenement.message) || 'cause inconnue');
            _enAttente.forEach(function(attente) {
                clearTimeout(attente.minuterie);
                attente.rejeter(new Error(message));
            });
            _enAttente.clear();
            _worker = null;
        };

        return _worker;
    }

    /**
     * Convertit un HEIC en JPEG.
     * @param {File|Blob} fichier - Le fichier HEIC
     * @returns {Promise<{blob: Blob, largeur: number, hauteur: number}>}
     */
    async function convertirEnJpeg(fichier) {
        const worker = obtenirWorker();
        if (!worker) {
            // Le décodage DOIT passer par le worker. Mesuré le 30 août 2026 : sur
            // le thread principal, les deux builds de libheif violent la CSP du
            // projet — le WASM comme l'asm.js évaluent une chaîne, et même
            // `'wasm-unsafe-eval'` ne suffit pas. Seul `'unsafe-eval'` les
            // débloquerait, ce que les règles non négociables interdisent
            // (« zéro eval() », CLAUDE.md). Un repli a été écrit puis RETIRÉ :
            // il ne pouvait jamais réussir.
            throw new Error('Le décodage HEIC exige un Web Worker, refusé quand la page est '
                + 'ouverte directement depuis le disque (file://). Ouvre l\'application via '
                + 'un serveur local ou en ligne, ou demande une remise en JPEG.');
        }

        const buffer = await fichier.arrayBuffer();
        const id = _prochainId++;

        return new Promise(function(resoudre, rejeter) {
            const minuterie = setTimeout(function() {
                _enAttente.delete(id);
                rejeter(new Error('delai depasse pendant le decodage HEIC'));
            }, DELAI_MAX_MS);

            _enAttente.set(id, { resoudre: resoudre, rejeter: rejeter, minuterie: minuterie });
            // Le buffer est TRANSFÉRÉ, pas copié : une photo d'iPhone pèse 3 Mo
            // et la file peut en compter trente.
            worker.postMessage({ id: id, buffer: buffer }, [buffer]);
        });
    }

    /**
     * Remplace l'extension .heic/.heif d'un nom de fichier par .jpg.
     * Le nom voyage jusque dans l'export : laisser « .HEIC » sur un contenu
     * JPEG ferait échouer l'ouverture chez qui reçoit le fichier.
     * @param {string} nomFichier - Le nom d'origine
     * @returns {string} Le nom avec l'extension corrigée
     */
    function renommerEnJpg(nomFichier) {
        return String(nomFichier || '').replace(/\.(heic|heif)$/i, '.jpg');
    }

    window.HeicDecodeur = {
        estHeic: estHeic,
        decodagePossible: decodagePossible,
        convertirEnJpeg: convertirEnJpeg,
        renommerEnJpg: renommerEnJpg
    };

})();
