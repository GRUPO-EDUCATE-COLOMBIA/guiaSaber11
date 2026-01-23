document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const areaId = params.get('area');
    
    if (!areaId) {
        window.location.href = 'index.html';
        return;
    }

    // 1. Cargar Datos
    fetch(`data/${areaId}.json`)
        .then(response => response.json())
        .then(data => {
            inicializarVisor(data, areaId);
        })
        .catch(err => console.error("Error cargando el área:", err));
});

function inicializarVisor(data, areaId) {
    // Configurar Header
    const header = document.getElementById('dynamic-header');
    const title = document.getElementById('area-title');
    title.innerText = data.area;
    header.style.backgroundColor = `var(--color-${areaId.split('_')[0]})`; // Usa los colores de tu CSS

    const sidebar = document.getElementById('sidebar-menu');
    sidebar.innerHTML = ''; // Limpiar

    // 2. Construir Menú (Maestro)
    data.competencias.forEach((comp, cIndex) => {
        const compDiv = document.createElement('div');
        compDiv.className = 'nav-group';
        compDiv.innerHTML = `<div class="nav-competencia">${comp.nombre}</div>`;

        // Si es Inglés, la estructura es Partes, si no, es Afirmaciones
        const subNivel = comp.afirmaciones || comp.partes;
        const subLabel = comp.afirmaciones ? "Afirmación" : "Parte";

        subNivel.forEach((sub, sIndex) => {
            const subDiv = document.createElement('div');
            subDiv.className = 'nav-afirmacion';
            subDiv.innerText = `${subLabel}: ${sub.id || (sIndex + 1)}`;
            compDiv.appendChild(subDiv);

            sub.evidencias.forEach((ev, eIndex) => {
                const evDiv = document.createElement('div');
                evDiv.className = 'nav-evidencia';
                evDiv.innerText = ev.definicion.substring(0, 60) + '...';
                evDiv.onclick = () => renderizarDetalle(ev, comp.nombre, areaId);
                compDiv.appendChild(evDiv);
            });
        });
        sidebar.appendChild(compDiv);
    });

    // 3. Agregar Botones Extra según el área
    agregarBotonesExtra(areaId, sidebar);
}

function renderizarDetalle(evidencia, nombreComp, areaId) {
    const container = document.getElementById('detail-view');
    
    // Marcar como activo en el menú
    document.querySelectorAll('.nav-evidencia').forEach(el => el.classList.remove('active'));
    event.currentTarget.classList.add('active');

    // Construir el HTML del detalle (Las "Tarjetas" que ya teníamos)
    container.innerHTML = `
        <div class="evidence-header" style="margin-bottom:30px; border-bottom: 3px solid var(--color-${areaId.split('_')[0]})">
            <small style="text-transform:uppercase; color:#888;">${nombreComp}</small>
            <h2 style="font-size:2rem; margin-top:10px;">${evidencia.definicion}</h2>
        </div>

        <div class="strategy-card objective">
            <h3>Objetivo de Aprendizaje</h3>
            <p>${evidencia.estrategia.objetivo}</p>
        </div>

        <div class="strategy-card sequence">
            <h3>Secuencia Didáctica</h3>
            <div class="phases">
                ${evidencia.estrategia.fases.map(fase => `
                    <div class="phase">
                        <strong>${fase.paso}:</strong> ${fase.descripcion}
                    </div>
                `).join('')}
            </div>
        </div>

        <div class="strategy-card tasks">
            <h3>Tareas del Estudiante</h3>
            <ul>
                ${evidencia.estrategia.tareas_estudiante.map(tarea => `<li>${tarea}</li>`).join('')}
            </ul>
        </div>
    `;
}

function agregarBotonesExtra(areaId, sidebar) {
    const extraDiv = document.createElement('div');
    extraDiv.className = 'extra-nav';
    
    if (areaId === 'matematicas') {
        extraDiv.innerHTML = `
            <button class="btn-extra">📊 Contenidos Genéricos</button>
            <button class="btn-extra">📐 Contenidos No Genéricos</button>
            <button class="btn-extra">🏢 Contextos de Evaluación</button>
        `;
    } else if (areaId === 'ciencias_naturales') {
        extraDiv.innerHTML = `
            <button class="btn-extra">🧪 Componentes (Biol/Fís/Quím)</button>
        `;
    }
    
    if (extraDiv.innerHTML !== '') sidebar.appendChild(extraDiv);
}
