const MISIONES_API = "/misiones";
const LOGROS_API = "/logros";

let ADMIN_USER = localStorage.getItem("adminUser") || "admin";
let ADMIN_PASS = localStorage.getItem("adminPass") || "1234";

// Array para almacenar los pasos de la misión actual
let pasosActuales = [];

// ===========================
// LOGIN
// ===========================
function login() {
    const user = document.getElementById("username").value;
    const pass = document.getElementById("password").value;
    const error = document.getElementById("loginError");

    if (user === ADMIN_USER && pass === ADMIN_PASS) {
        document.getElementById("loginForm").style.display = "none";
        document.getElementById("adminPanel").style.display = "block";
        cargarMisiones();
        cargarLogros();
    } else {
        error.innerText = "Usuario o contraseña incorrectos.";
        error.style.display = "block";
    }
}

function logout() {
    document.getElementById("loginForm").style.display = "block";
    document.getElementById("adminPanel").style.display = "none";
    document.getElementById("username").value = "";
    document.getElementById("password").value = "";
    document.getElementById("loginError").style.display = "none";
}

// ===========================
// CAMBIAR USUARIO / CONTRASEÑA
// ===========================
function cambiarCredenciales() {
    const newUser = document.getElementById("newUser").value.trim();
    const newPass = document.getElementById("newPass").value.trim();
    const msg = document.getElementById("configMsg");

    if (newUser && newPass) {
        ADMIN_USER = newUser;
        ADMIN_PASS = newPass;
        localStorage.setItem("adminUser", ADMIN_USER);
        localStorage.setItem("adminPass", ADMIN_PASS);

        msg.innerText = "Usuario y contraseña actualizados con éxito.";
        msg.className = "message message-success";
        msg.style.display = "block";

        document.getElementById("newUser").value = "";
        document.getElementById("newPass").value = "";

        
        setTimeout(() => {
            msg.style.display = "none";
        }, 3000);
    } else {
        msg.innerText = "Ambos campos son obligatorios.";
        msg.className = "message message-error";
        msg.style.display = "block";
    }
}

// ===========================
// GESTIÓN DE PASOS
// ===========================
function agregarPaso() {
    const nuevoPasoInput = document.getElementById("nuevoPaso");
    const pasoTexto = nuevoPasoInput.value.trim();

    if (pasoTexto) {
        pasosActuales.push(pasoTexto);
        renderizarPasos();
        nuevoPasoInput.value = "";
        nuevoPasoInput.focus();
    }
}

function eliminarPaso(index) {
    pasosActuales.splice(index, 1);
    renderizarPasos();
}

function renderizarPasos() {
    const pasosContainer = document.getElementById("pasosContainer");
    pasosContainer.innerHTML = "";

    if (pasosActuales.length === 0) {
        pasosContainer.innerHTML = '<p style="color: #777; font-style: italic;">No hay pasos agregados</p>';
        return;
    }

    pasosActuales.forEach((paso, index) => {
        const pasoElement = document.createElement("div");
        pasoElement.className = "paso-item";
        pasoElement.innerHTML = `
      <span class="paso-texto">${index + 1}. ${paso}</span>
      <button class="paso-eliminar" onclick="eliminarPaso(${index})">×</button>
    `;
        pasosContainer.appendChild(pasoElement);
    });
}

// ===========================
// FUNCIONES MISIÓN
// ===========================
async function cargarMisiones() {
    try {
        const tbody = document.getElementById("misionesTable");
        tbody.innerHTML = "<tr><td colspan='4' style='text-align: center;'>Cargando misiones...</td></tr>";

        const res = await fetch(MISIONES_API);
        const misiones = await res.json();

        tbody.innerHTML = "";

        if (misiones.length === 0) {
            tbody.innerHTML = "<tr><td colspan='4' style='text-align: center;'>No hay misiones registradas</td></tr>";
            return;
        }

        misiones.forEach(m => {
            const pasosArray = Array.isArray(m.pasos) ? m.pasos : [];

            let nivelClass = "";
            let nivelTexto = "";
            switch (m.nivel) {
                case "facil":
                    nivelClass = "badge-facil";
                    nivelTexto = "Fácil";
                    break;
                case "intermedio":
                    nivelClass = "badge-intermedio";
                    nivelTexto = "Intermedio";
                    break;
                case "dificil":
                    nivelClass = "badge-dificil";
                    nivelTexto = "Difícil";
                    break;
                default:
                    nivelClass = "";
                    nivelTexto = m.nivel || "";
            }

            let tipoClass = "";
            let tipoTexto = "";
            switch (m.tipo) {
                case "diaria":
                    tipoClass = "badge-diaria";
                    tipoTexto = "Diaria";
                    break;
                case "semanal":
                    tipoClass = "badge-semanal";
                    tipoTexto = "Semanal";
                    break;
                case "mensual":
                    tipoClass = "badge-mensual";
                    tipoTexto = "Mensual";
                    break;
                case "especial":
                    tipoClass = "badge-especial";
                    tipoTexto = "Especial";
                    break;
                default:
                    tipoClass = "";
                    tipoTexto = m.tipo || "";
            }

            const tr = document.createElement("tr");
            tr.innerHTML = `
        <td>${m.titulo || ""}</td>
        <td>${m.descripcion || ""}</td>
        
        <td><span class="badge ${nivelClass}">${nivelTexto}</span></td>
        <td>
          <button class='btn btn-small btn-warning' onclick='editarMision("${m._id}")'>Editar</button>
          <button class='btn btn-small btn-danger' onclick='eliminarMision("${m._id}")'>Eliminar</button>
        </td>
      `;
            tbody.appendChild(tr);
        });
    } catch (err) {
        console.error("Error al cargar misiones:", err);
        document.getElementById("misionesTable").innerHTML = "<tr><td colspan='6' style='text-align: center; color: red;'>Error al cargar las misiones</td></tr>";
    }
}

async function guardarMision() {
    const id = document.getElementById("misionId").value;
    const data = {
        titulo: document.getElementById("titulo").value,
        descripcion: document.getElementById("descripcion").value,
        pasos: pasosActuales,
        tipo: document.getElementById("tipo").value,
        nivel: document.getElementById("nivel").value
    };

    // Validación básica
    if (!data.titulo.trim()) {
        alert("El título es obligatorio");
        return;
    }

    if (data.pasos.length === 0) {
        alert("Debe agregar al menos un paso");
        return;
    }

    if (!data.tipo) {
        alert("Debe seleccionar un tipo");
        return;
    }

    if (!data.nivel) {
        alert("Debe seleccionar un nivel");
        return;
    }

    try {
        const btn = event.target;
        const originalText = btn.innerHTML;
        btn.innerHTML = '<span class="loading"></span> Guardando...';
        btn.disabled = true;

        if (id) {
            await fetch(`${MISIONES_API}/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });
        } else {
            await fetch(MISIONES_API, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });
        }

        resetFormMision();
        cargarMisiones();

        btn.innerHTML = originalText;
        btn.disabled = false;
    } catch (err) {
        console.error(err);
        alert("Error al guardar la misión");
        event.target.innerHTML = originalText;
        event.target.disabled = false;
    }
}

async function editarMision(id) {
    try {
        const res = await fetch(`${MISIONES_API}/${id}`);
        const m = await res.json();
        document.getElementById("form-title").innerText = "Editar Misión";
        document.getElementById("misionId").value = m._id;
        document.getElementById("titulo").value = m.titulo || "";
        document.getElementById("descripcion").value = m.descripcion || "";
        document.getElementById("tipo").value = m.tipo || "";
        document.getElementById("nivel").value = m.nivel || "";

        // Cargar los pasos existentes
        pasosActuales = Array.isArray(m.pasos) ? m.pasos : [];
        renderizarPasos();

        // Desplazar hacia el formulario
        document.getElementById("form-title").scrollIntoView({ behavior: 'smooth' });
    } catch (err) {
        console.error(err);
        alert("Error al cargar la misión para editar");
    }
}

async function eliminarMision(id) {
    if (!confirm("¿Seguro que quieres eliminar esta misión?")) return;

    try {
        await fetch(`${MISIONES_API}/${id}`, { method: "DELETE" });
        cargarMisiones();
    }
    catch (err) {
        console.error(err);
        alert("Error al eliminar la misión");
    }
}

function resetFormMision() {
    document.getElementById("form-title").innerText = "Agregar Nueva Misión";
    document.getElementById("misionId").value = "";
    document.getElementById("titulo").value = "";
    document.getElementById("descripcion").value = "";
    document.getElementById("tipo").value = "";
    document.getElementById("nivel").value = "";

    // Limpiar pasos
    pasosActuales = [];
    renderizarPasos();
}

// ===========================
// FUNCIONES LOGRO
// ===========================
async function cargarLogros() {
    try {
        const tbody = document.getElementById("logrosTable");
        tbody.innerHTML = "<tr><td colspan='4' style='text-align: center;'>Cargando logros...</td></tr>";

        const res = await fetch(LOGROS_API);
        const logros = await res.json();
        tbody.innerHTML = "";

        if (logros.length === 0) {
            tbody.innerHTML = "<tr><td colspan='4' style='text-align: center;'>No hay logros registrados</td></tr>";
            return;
        }

        logros.forEach(l => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
        <td>${l.nombre || ""}</td>
        <td>${l.descripcion || ""}</td>
        <td>${l.puntos_requeridos || 0}</td>
        <td>
          <button class='btn btn-small btn-warning' onclick='editarLogro("${l._id}")'>Editar</button>
          <button class='btn btn-small btn-danger' onclick='eliminarLogro("${l._id}")'>Eliminar</button>
        </td>
      `;
            tbody.appendChild(tr);
        });
    } catch (err) {
        console.error("Error al cargar logros:", err);
        document.getElementById("logrosTable").innerHTML = "<tr><td colspan='4' style='text-align: center; color: red;'>Error al cargar los logros</td></tr>";
    }
}

async function guardarLogro() {
    const id = document.getElementById("logroId").value;
    const data = {
        nombre: document.getElementById("logroNombre").value,
        descripcion: document.getElementById("logroDescripcion").value,
        puntos_requeridos: Number(document.getElementById("logroPuntos").value)
    };

    // Validación básica
    if (!data.nombre.trim()) {
        alert("El nombre es obligatorio");
        return;
    }

    if (data.puntos_requeridos < 0) {
        alert("Los puntos no pueden ser negativos");
        return;
    }

    try {
        const btn = event.target;
        const originalText = btn.innerHTML;
        btn.innerHTML = '<span class="loading"></span> Guardando...';
        btn.disabled = true;

        if (id) {
            await fetch(`${LOGROS_API}/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });
        } else {
            await fetch(LOGROS_API, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });
        }

        resetFormLogro();
        cargarLogros();

        btn.innerHTML = originalText;
        btn.disabled = false;
    } catch (err) {
        console.error(err);
        alert("Error al guardar el logro");
        event.target.innerHTML = originalText;
        event.target.disabled = false;
    }
}

async function editarLogro(id) {
    try {
        const res = await fetch(`${LOGROS_API}/${id}`);
        const l = await res.json();
        document.getElementById("logro-form-title").innerText = "Editar Logro";
        document.getElementById("logroId").value = l._id;
        document.getElementById("logroNombre").value = l.nombre || "";
        document.getElementById("logroDescripcion").value = l.descripcion || "";
        document.getElementById("logroPuntos").value = l.puntos_requeridos || 0;

        // Desplazar hacia el formulario
        document.getElementById("logro-form-title").scrollIntoView({ behavior: 'smooth' });
    } catch (err) {
        console.error(err);
        alert("Error al cargar el logro para editar");
    }
}

async function eliminarLogro(id) {
    if (!confirm("¿Seguro que quieres eliminar este logro?")) return;

    try {
        await fetch(`${LOGROS_API}/${id}`, { method: "DELETE" });
        cargarLogros();
    }
    catch (err) {
        console.error(err);
        alert("Error al eliminar el logro");
    }
}

function resetFormLogro() {
    document.getElementById("logro-form-title").innerText = "Agregar Nuevo Logro";
    document.getElementById("logroId").value = "";
    document.getElementById("logroNombre").value = "";
    document.getElementById("logroDescripcion").value = "";
    document.getElementById("logroPuntos").value = "";
}

// Permitir enviar formularios con Enter
document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('password').addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            login();
        }
    });

    document.getElementById('nuevoPaso').addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            agregarPaso();
        }
    });
});