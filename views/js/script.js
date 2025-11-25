// Utilidades
function escapeHtml(str) {
    if (!str) return "";
    return String(str).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function getCookie(name) {
    const v = document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)');
    return v ? decodeURIComponent(v.pop()) : null;
}

// Tips hardcodeados para las misiones
const tipsGenerales = [
    "Cada toque en la pantalla es un paso más para comunicarte mejor...",
    "Recuerda que puedes pedir ayuda en cualquier momento.",
    "La práctica constante te ayudará a ganar confianza con la tecnología.",
    "No te preocupes por cometer errores, son parte del aprendizaje.",
    "Celebra cada pequeño logro, ¡cada paso cuenta!"
];

const tipsPorMision = {
    "llamada": "Si algo sale mal, no te preocupes. Puedes volver atrás y reintentar las veces que quieras.",
    "mensaje": "Recuerda que puedes usar el micrófono para enviar mensajes de voz en lugar de escribir.",
    "wifi": "Si tienes problemas para conectar, verifica que la contraseña sea correcta.",
    "volumen": "Puedes ajustar el volumen usando los botones físicos del dispositivo.",
    "fotos": "Mantén la cámara estable para obtener fotos más claras.",
    "navegacion": "Usa la barra de direcciones para escribir directamente la página que quieres visitar."
};

// Variables globales
let misionesActuales = [];
let misionActualId = null;

let ttsActivo = false;
let ttsUtterance = null;
let pasoActual = 0;
let pasosTexto = [];



// ===========================+
// Funciones para controles de accesibilidad
// ============================

function toggleHighContrast() {
    document.body.classList.toggle('high-contrast');
    localStorage.setItem('highContrast', document.body.classList.contains('high-contrast'));

    const btn = document.getElementById('highContrastBtn');
    const isActive = document.body.classList.contains('high-contrast');
    btn.innerHTML = isActive ? '<span>🎨</span> Contraste Normal' : '<span>🎨</span> Alto Contraste';
}

function toggleLargerText() {

    document.body.classList.toggle('larger-text');
    localStorage.setItem('largerText', document.body.classList.contains('larger-text'));

    const btn = document.getElementById('largerTextBtn');
    const isActive = document.body.classList.contains('larger-text');
    btn.innerHTML = isActive ? '<span>🔍</span> Texto Normal' : '<span>🔍</span> Texto Grande';
}

function resetAccessibility() {
    document.body.classList.remove('high-contrast', 'larger-text');
    localStorage.removeItem('highContrast');
    localStorage.removeItem('largerText');


    document.getElementById('highContrastBtn').innerHTML = '<span>🎨</span> Alto Contraste';
    document.getElementById('largerTextBtn').innerHTML = '<span>🔍</span> Texto Grande';
}




// Función para manejar el dropdown de accesibilidad en móviles
function setupAccessibilityDropdown() {
    const dropdownBtn = document.querySelector('.accessibility-dropdown-btn');
    const dropdownContent = document.querySelector('.accessibility-dropdown-content');

    // Mostrar/ocultar dropdown al hacer clic
    dropdownBtn.addEventListener('click', function () {
        dropdownContent.classList.toggle('show');
    });

    // Cerrar dropdown al hacer clic fuera
    document.addEventListener('click', function (event) {
        if (!event.target.closest('.accessibility-dropdown')) {
            dropdownContent.classList.remove('show');
        }
    });

    // Manejar acciones de los elementos del dropdown
    document.querySelectorAll('.accessibility-dropdown-item').forEach(item => {
        item.addEventListener('click', function () {
            const action = this.getAttribute('data-action');
            dropdownContent.classList.remove('show');

            switch (action) {
                case 'highContrast':
                    toggleHighContrast();
                    break;
                case 'largerText':
                    toggleLargerText();
                    break;
                case 'resetAccessibility':
                    resetAccessibility();
                    break;
            }
        });
    });
}

// Función para obtener un tip aleatorio
function obtenerTipAleatorio(tipsArray) {
    const indice = Math.floor(Math.random() * tipsArray.length);
    return tipsArray[indice];
}

// Función para obtener tip específico para una misión
function obtenerTipParaMision(tituloMision) {
    // Buscar palabras clave en el título para determinar el tip
    const titulo = tituloMision.toLowerCase();

    if (titulo.includes('llamada') || titulo.includes('llamar')) {
        return tipsPorMision.llamada;
    } else if (titulo.includes('mensaje') || titulo.includes('whatsapp')) {
        return tipsPorMision.mensaje;
    } else if (titulo.includes('wifi') || titulo.includes('conectar')) {
        return tipsPorMision.wifi;
    } else if (titulo.includes('volumen') || titulo.includes('brillo')) {
        return tipsPorMision.volumen;
    } else if (titulo.includes('foto') || titulo.includes('cámara')) {
        return tipsPorMision.fotos;
    } else if (titulo.includes('navegar') || titulo.includes('internet')) {
        return tipsPorMision.navegacion;
    } else {
        // Tip genérico si no hay coincidencia
        return "Si algo sale mal, no te preocupes. Puedes volver atrás y reintentar las veces que quieras.";
    }
}

// Función para actualizar el tip general
function actualizarTipGeneral() {
    const tipElement = document.getElementById('tipGeneralText');
    if (tipElement) {
        tipElement.textContent = obtenerTipAleatorio(tipsGenerales);
    }
}

// Función para actualizar el tip específico de misión
function actualizarTipMision(tituloMision) {
    const tipElement = document.getElementById('tipMisionText');
    if (tipElement) {
        tipElement.textContent = obtenerTipParaMision(tituloMision);
    }
}





// ===========================+
// Funciones para Text-to-Speech
// ============================

function inicializarTTS() {
    // Verificar si el navegador soporta SpeechSynthesis
    if (!('speechSynthesis' in window)) {
        alert('Tu navegador no soporta la función de texto a voz. Por favor, utiliza un navegador más moderno.');
        document.getElementById('ttsBtn').disabled = true;
        return false;
    }

    // Configurar evento para cuando termine la síntesis de voz
    window.speechSynthesis.onend = function () {
        ttsActivo = false;
        document.getElementById('ttsBtn').classList.remove('playing');
        document.getElementById('ttsBtn').innerHTML = '<span class="btn-icon">🔊</span> Escuchar Pasos';
        resetearResaltadoPasos();
    };

    return true;
}

function reproducirPasos() {
    if (ttsActivo) {
        // Si ya está reproduciendo, detener
        window.speechSynthesis.cancel();
        ttsActivo = false;
        document.getElementById('ttsBtn').classList.remove('playing');
        document.getElementById('ttsBtn').innerHTML = '<span class="btn-icon">🔊</span> Escuchar Pasos';
        resetearResaltadoPasos();
        return;
    }

    if (pasosTexto.length === 0) {
        alert('No hay pasos para reproducir.');
        return;
    }

    ttsActivo = true;
    document.getElementById('ttsBtn').classList.add('playing');
    document.getElementById('ttsBtn').innerHTML = '<span class="btn-icon">⏹️</span> Detener';

    // Iniciar reproducción
    pasoActual = 0;
    reproducirSiguientePaso();
}

function reproducirSiguientePaso() {
    if (pasoActual >= pasosTexto.length || !ttsActivo) {
        ttsActivo = false;
        document.getElementById('ttsBtn').classList.remove('playing');
        document.getElementById('ttsBtn').innerHTML = '<span class="btn-icon">🔊</span> Escuchar Pasos';
        resetearResaltadoPasos();
        return;
    }

    // Resaltar el paso actual
    resetearResaltadoPasos();
    
    const elementosPasos = document.querySelectorAll('#pasosList li');
    if (elementosPasos[pasoActual]) {
        elementosPasos[pasoActual].classList.add('paso-activo');
    }

    // Obtener velocidad actual del selector
    const velocidad = parseFloat(document.getElementById('ttsSpeed').value);

    // Crear y configurar el utterance
    ttsUtterance = new SpeechSynthesisUtterance(pasosTexto[pasoActual]);
    ttsUtterance.lang = 'es-ES';
    ttsUtterance.rate = velocidad;
    ttsUtterance.pitch = 1;
    ttsUtterance.volume = 1;

    // Cuando termine este paso, pasar al siguiente
    ttsUtterance.onend = function () {
        pasoActual++;
        reproducirSiguientePaso();
    };

    // Reproducir
    window.speechSynthesis.speak(ttsUtterance);
}

function resetearResaltadoPasos() {
    const elementosPasos = document.querySelectorAll('#pasosList li');
    elementosPasos.forEach(paso => {
        paso.classList.remove('paso-activo');
    });
}

function prepararPasosParaTTS(pasos) {
    pasosTexto = [];
    pasos.forEach((paso, index) => {
        pasosTexto.push(`Paso ${index + 1}: ${paso}`);
    });
}






// Función para cambiar entre pestañas
function cambiarPestaña(pestañaId) {
    // Ocultar todas las pestañas
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
        tab.setAttribute('aria-hidden', 'true');
    });

    // Desactivar todos los botones de pestaña
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
        tab.setAttribute('aria-selected', 'false');
    });

    // Activar la pestaña seleccionada
    document.getElementById(`tab${pestañaId.charAt(0).toUpperCase() + pestañaId.slice(1)}Content`).classList.add('active');
    document.getElementById(`tab${pestañaId.charAt(0).toUpperCase() + pestañaId.slice(1)}`).classList.add('active');

    // Si estamos en la pestaña de logros, recargar los logros
    if (pestañaId === 'logros') {
        loadLogros();
    }
}

// Cargar misiones
async function loadMisiones() {
    const list = document.getElementById('misionesList');
    const refreshBtn = document.getElementById('refreshBtn');

    try {
        list.innerHTML = '<li class="loading">Cargando actividades...</li>';
        refreshBtn.disabled = true;

        const res = await fetch('/misiones');
        if (!res.ok) throw new Error('Respuesta no ok');

        misionesActuales = await res.json();

        if (!misionesActuales || misionesActuales.length === 0) {
            list.innerHTML = '<li class="empty">No hay actividades disponibles en este momento.</li>';
            return;
        }

        list.innerHTML = misionesActuales.map(m => {
            const btnTexto = m.iniciada ? "Volver a intentar" : "Iniciar Misión";
            const btnIcono = m.iniciada ? "↻" : "▶";
            const btnClase = m.iniciada ? "btn-reintentar" : "btn-iniciar";

            return `<li class="mision-item">
                        <div class="mision-titulo">${escapeHtml(m.titulo)}</div>
                        <div class="mision-descripcion">${escapeHtml(m.descripcion)}</div>
                        <div class="mision-detalles">
                            <div class="mision-nivel">Nivel: ${escapeHtml(m.nivel)}</div>
                            <button class="btn ${btnClase}" data-mision-id="${m._id}" aria-label="${btnTexto}: ${escapeHtml(m.titulo)}">
                                <span class="btn-icon">${btnIcono}</span> ${btnTexto}
                            </button>
                        </div>
                    </li>`;
        }).join('');

        document.querySelectorAll('.btn-iniciar, .btn-reintentar').forEach(btn => {
            btn.addEventListener('click', function () {
                const misionId = this.getAttribute('data-mision-id');
                mostrarDetallesMision(misionId);
            });
        });

    } catch (err) {
        console.error(err);
        list.innerHTML = '<li class="error">Error al cargar las actividades. Por favor, intente nuevamente.</li>';
    } finally {
        refreshBtn.disabled = false;
    }
}

// Mostrar detalles de misión
async function mostrarDetallesMision(misionId) {
    try {
        misionActualId = misionId;
        document.getElementById('misionesSection').style.display = 'none';
        document.getElementById('misionDetallesSection').style.display = 'block';

        const res = await fetch(`/misiones/${misionId}`);
        if (!res.ok) throw new Error('Error al cargar los detalles de la misión');

        const mision = await res.json();

        document.getElementById('mision-detalles-title').textContent = mision.titulo;
        document.querySelector('.mision-detalles-descripcion').textContent = mision.descripcion;
        document.querySelector('.mision-detalles-nivel').textContent = `Nivel: ${mision.nivel}`;

        // Actualizar el tip específico para esta misión
        actualizarTipMision(mision.titulo);

        const pasosList = document.getElementById('pasosList');
        if (mision.pasos && mision.pasos.length > 0) {
            pasosList.innerHTML = mision.pasos.map((paso, index) =>
                `<li><span>${index + 1}.</span> ${escapeHtml(paso)}</li>`
            ).join('');

            // Preparar los pasos para TTS
            prepararPasosParaTTS(mision.pasos);
        } else {
            pasosList.innerHTML = '<li>No hay pasos específicos para esta misión.</li>';
            pasosTexto = [];
        }

    } catch (error) {
        console.error(error);
        alert('Error al cargar los detalles de la misión. Por favor, intente nuevamente.');
        volverAListaMisiones();
    }
}

// Volver a lista
function volverAListaMisiones() {
    // Detener TTS si está activo
    if (ttsActivo) {
        window.speechSynthesis.cancel();
        ttsActivo = false;
        document.getElementById('ttsBtn').classList.remove('playing');
        document.getElementById('ttsBtn').innerHTML = '<span class="btn-icon">🔊</span> Escuchar Pasos';
    }

    document.getElementById('misionDetallesSection').style.display = 'none';
    document.getElementById('misionesSection').style.display = 'block';
    misionActualId = null;
}

// Terminar misión
async function terminarMision() {
    if (!misionActualId) return alert("No se ha seleccionado ninguna misión");

    try {
        const response = await fetch("/misiones/terminar", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ misionId: misionActualId, puntos: 10 })
        });

        const data = await response.json();

        if (response.ok) {
            alert(`¡Misión completada! Ahora tienes ${data.puntos} puntos.`);

            // actualizar UI de logros
            await loadLogros();

            // **Actualizar la lista de misiones para reflejar botón "Volver a intentar"**
            await loadMisiones();

            volverAListaMisiones();
        } else {
            alert("No se pudo completar la misión: " + data.message);
        }
    } catch (err) {
        console.error(err);
        alert("Error al comunicarse con el servidor");
    }
}

// Logros
async function loadLogros() {
    try {
        document.getElementById('logrosDesbloqueadosList').innerHTML = '<li class="loading">Cargando logros...</li>';

        const [actualRes, desbloqRes] = await Promise.all([
            fetch('/logros/actual'),
            fetch('/logros/desbloqueados')
        ]);

        if (!actualRes.ok) throw new Error('Error al obtener logro actual');
        if (!desbloqRes.ok) throw new Error('Error al obtener logros desbloqueados');

        const actualData = await actualRes.json();
        const desbloqData = await desbloqRes.json();

        // puntos y logro actual
        const puntos = actualData.puntos || 0;
        document.getElementById('puntosUsuario').textContent = puntos;

        if (actualData.logroActual) {
            document.getElementById('logroActualNombre').textContent = actualData.logroActual.nombre;
            document.getElementById('logroActualDesc').textContent = actualData.logroActual.descripcion;
        } else {
            document.getElementById('logroActualNombre').textContent = '—';
            document.getElementById('logroActualDesc').textContent = 'Aún no has desbloqueado ningún logro.';
        }

        if (actualData.siguienteLogro) {
            const s = actualData.siguienteLogro;
            document.getElementById('siguienteLogroNombre').textContent = s.nombre;
            document.getElementById('siguienteLogroDesc').textContent = s.descripcion;
            document.getElementById('siguientePuntos').textContent = s.puntos_requeridos;

            // calcular progreso porcentual hacia siguiente logro
            const prev = (actualData.logroActual && actualData.logroActual.puntos_requeridos) ? actualData.logroActual.puntos_requeridos : 0;
            const progress = Math.min(100, Math.round(((puntos - prev) / (s.puntos_requeridos - prev || 1)) * 100));
            const progEl = document.getElementById('logroProgress');
            progEl.value = progress;
            progEl.max = 100;
        } else {
            document.getElementById('siguienteLogroNombre').textContent = '—';
            document.getElementById('siguienteLogroDesc').textContent = 'No hay más logros definidos.';
            document.getElementById('siguientePuntos').textContent = '—';
            const progEl = document.getElementById('logroProgress');
            progEl.value = 100;
        }

        // lista de logros desbloqueados desde /logros/desbloqueados
        const listEl = document.getElementById('logrosDesbloqueadosList');
        const desbloqueados = desbloqData.logros || [];
        if (!desbloqueados.length) {
            listEl.innerHTML = '<li class="empty">No has desbloqueado logros aún.</li>';
        } else {
            listEl.innerHTML = desbloqueados.map(l => `<li class="mision-item"><div class="mision-titulo">${escapeHtml(l.nombre)}</div><div class="mision-descripcion">${escapeHtml(l.descripcion)}</div><div style="margin-top:8px;color:var(--medium-gray)">Requiere ${l.puntos_requeridos} pts</div></li>`).join('');
        }

    } catch (err) {
        console.error(err);
        document.getElementById('logrosDesbloqueadosList').innerHTML = '<li class="error">Error al cargar logros. Intenta nuevamente.</li>';
    }
}

// Inicializar
document.addEventListener('DOMContentLoaded', function () {
    // Inicializar TTS
    inicializarTTS();

    // Inicializar dropdown de accesibilidad
    setupAccessibilityDropdown();

    // Inicializar tips
    actualizarTipGeneral();

    loadMisiones();
    loadLogros();

    // Event listeners para las pestañas
    document.getElementById('tabMisiones').addEventListener('click', () => cambiarPestaña('misiones'));
    document.getElementById('tabLogros').addEventListener('click', () => cambiarPestaña('logros'));

    // Event listeners para controles de accesibilidad
    document.getElementById('highContrastBtn').addEventListener('click', toggleHighContrast);
    document.getElementById('largerTextBtn').addEventListener('click', toggleLargerText);
    document.getElementById('resetAccessibilityBtn').addEventListener('click', resetAccessibility);

    document.getElementById('refreshBtn').addEventListener('click', loadMisiones);
    document.getElementById('refreshLogrosBtn').addEventListener('click', loadLogros);
    document.getElementById('volverBtn').addEventListener('click', volverAListaMisiones);
    document.getElementById('terminarBtn').addEventListener('click', terminarMision);

    // Event listener para el botón de TTS
    document.getElementById('ttsBtn').addEventListener('click', reproducirPasos);

    const nombreUsuario = getCookie('nombreUsuario');
    if (nombreUsuario) {
        document.getElementById('nombreUsuario').textContent = nombreUsuario;
    }
});