document.addEventListener('DOMContentLoaded', () => {
    // 1. Obtener el área de la URL
    const params = new URLSearchParams(window.location.search);
    const areaId = params.get('area');

    console.log("Área seleccionada:", areaId); // Para depuración en consola

    if (!areaId) {
        window.location.href = 'index.html';
        return;
    }

    // 2. Cargar el JSON correspondiente
    // IMPORTANTE: Los archivos deben estar en una carpeta llamada 'data'
    fetch(`data/${areaId}.json`)
        .then(res => {
            if (!res.ok) throw new Error(`No se encontró el archivo: data/${areaId}.json`);
            return res.json();
        })
        .then(data => {
            console.log("Datos cargados correctamente:", data);
            renderizarInterfaz(data);
        })
        .catch(err => {
            console.error("Error detallado:", err);
            document.getElementById('area-title').innerText = "Error de Carga";
            document.getElementById('content-target').innerHTML = `
                <div style="padding:20px; color:red;">
                    <h3>No se pudo cargar la información.</h3>
                    <p>Asegúrate de que el archivo <b>data/${areaId}.json</b> existe y estás usando un servidor local (Live Server).</p>
                </div>`;
        });
});

function renderizarInterfaz(data) {
    // Sincronizar colores y títulos
    const color = data.meta.color_primario || "#333";
    document.documentElement.style.setProperty('--primary-color', color);
    
    // Cambiar fondo del header y texto
    const header = document.getElementById('side-header') || document.querySelector('.area-header');
    if(header) header.style.backgroundColor = color;
    
    document.getElementById('area-title').innerText = data.meta.titulo;

    // Generar menú lateral
    const navTree = document.getElementById('nav-tree');
    if (!navTree) return;
    navTree.innerHTML = '';

    data.competencias.forEach((comp) => {
        const compDiv = document.createElement('div');
        compDiv.className = 'comp-group';
        compDiv.innerHTML = `<div class="comp-title" style="border-left: 4px solid ${color}">${comp.nombre}</div>`;

        comp.afirmaciones.forEach(af => {
            const afDiv = document.createElement('div');
            afDiv.className = 'afirm-title';
            afDiv.innerText = af.texto;
            compDiv.appendChild(afDiv);

            af.evidencias.forEach(ev => {
                const evItem = document.createElement('div');
                evItem.className = 'evid-item';
                // Mostramos un pedazo del texto del ICFES en el menú
                evItem.innerText = ev.texto_icfes.substring(0, 60) + "...";
                evItem.onclick = () => mostrarDetalle(ev, comp.nombre, color);
                compDiv.appendChild(evItem);
            });
        });
        navTree.appendChild(compDiv);
    });
}

function mostrarDetalle(ev, nombreComp, color) {
    // Resaltar ítem seleccionado
    document.querySelectorAll('.evid-item').forEach(i => i.classList.remove('active'));
    event.currentTarget.classList.add('active');

    const target = document.getElementById('content-target');
    const est = ev.estrategia_didactica;

    target.innerHTML = `
        <div class="icfes-box" style="border-left: 5px solid ${color}">
            <span class="card-label">Referente Técnico ICFES</span>
            <h3 style="color:${color}">${nombreComp}</h3>
            <p><strong>Evidencia:</strong> ${ev.texto_icfes}</p>
        </div>

        <h1 class="strategy-title" style="color:${color}">${est.nombre}</h1>
        
        <div class="card">
            <span class="card-label">Objetivo</span>
            <p style="font-size:1.2rem">${est.objetivo}</p>
        </div>

        <div class="card">
            <span class="card-label">Secuencia Didáctica</span>
            <div class="phase-list">
                ${est.fases_metodologicas.map((fase, idx) => {
                    const [titulo, ...desc] = fase.split(':');
                    return `
                        <div class="phase-item">
                            <div class="phase-number" style="background:${color}">${idx + 1}</div>
                            <div><strong>${titulo}:</strong> ${desc.join(':')}</div>
                        </div>`;
                }).join('')}
            </div>
        </div>

        <div class="task-banner" style="background-color: ${color}15; border: 2px dashed ${color}">
            <span class="card-label" style="color:${color}">Tarea Retadora</span>
            <p style="font-size:1.2rem; font-weight:700;">${est.tarea_retadora}</p>
        </div>
    `;
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}
