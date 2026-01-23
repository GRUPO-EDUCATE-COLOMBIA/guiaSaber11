document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const areaId = params.get('area');

    if (!areaId) { window.location.href = 'index.html'; return; }

    fetch(`data/${areaId}.json`)
        .then(res => res.json())
        .then(data => {
            document.title = `Guía Edúcate - ${data.meta.titulo}`;
            setupInterface(data);
        })
        .catch(err => {
            console.error("Error al cargar JSON:", err);
            document.getElementById('content-target').innerHTML = "<h2>Error al cargar los contenidos.</h2>";
        });
});

function setupInterface(data) {
    const areaId = data.meta.area_id;
    const root = document.documentElement;
    root.style.setProperty('--primary-color', data.meta.color_primario);
    
    document.getElementById('area-label').innerText = data.meta.titulo;
    const navTree = document.getElementById('nav-tree');
    navTree.innerHTML = ''; // Limpiar
    
    // 1. Construir el Menú Lateral
    data.competencias.forEach((comp, cIdx) => {
        const compGroup = document.createElement('div');
        compGroup.className = 'comp-group';
        
        // Badge de nivel/porcentaje si existe
        const metaInfo = comp.nivel_lectura || comp.nivel_mcer || comp.porcentaje || "";
        
        compGroup.innerHTML = `
            <div class="comp-title">
                ${comp.nombre}
                ${metaInfo ? `<span class="comp-badge">${metaInfo}</span>` : ''}
            </div>
        `;

        comp.afirmaciones.forEach(af => {
            const afTitle = document.createElement('div');
            afTitle.className = 'afirm-title';
            afTitle.innerText = af.texto;
            compGroup.appendChild(afTitle);

            af.evidencias.forEach(ev => {
                const evItem = document.createElement('div');
                evItem.className = 'evid-item';
                
                // Texto corto para el menú
                let label = ev.texto_icfes.substring(0, 80) + '...';
                if(areaId === 'ingles') label = `Tarea: ${ev.texto_icfes.substring(0, 70)}...`;
                
                evItem.innerText = label;
                evItem.onclick = (e) => renderDetail(ev, comp, data.meta);
                compGroup.appendChild(evItem);
            });
        });
        navTree.appendChild(compGroup);
    });

    // 2. Botones Extra dinámicos
    agregarBotonesExtra(areaId, navTree);
}

function renderDetail(ev, competencia, meta) {
    // Gestión de estado activo en el menú
    document.querySelectorAll('.evid-item').forEach(i => i.classList.remove('active'));
    if(event) event.currentTarget.classList.add('active');

    const target = document.getElementById('content-target');
    const est = ev.estrategia_didactica;
    const areaId = meta.area_id;

    // Detectar etiquetas especiales (Componente en Ciencias, etc.)
    const extraTag = ev.componente_tematico ? `<span class="tag-componente">${ev.componente_tematico}</span>` : '';
    const levelTag = competencia.nivel_lectura ? `<span class="tag-componente">${competencia.nivel_lectura}</span>` : '';

    target.innerHTML = `
        <div class="icfes-box">
            <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                <span class="card-label" style="color:#64748b">Referente Técnico ICFES</span>
                ${extraTag || levelTag}
            </div>
            <h3 style="color:${meta.color_primario}">${competencia.nombre}</h3>
            <p style="font-size:1.1rem"><strong>Evidencia:</strong> ${ev.texto_icfes}</p>
        </div>

        <h1 class="strategy-title">${est.nombre}</h1>
        
        <div class="card">
            <span class="card-label">Objetivo de la Estrategia</span>
            <p style="font-size: 1.3rem; margin:0; font-weight:500;">${est.objetivo}</p>
        </div>

        <div class="card">
            <span class="card-label">Secuencia Metodológica (Fases)</span>
            <div class="phase-list">
                ${est.fases_metodologicas.map((fase, idx) => {
                    const parts = fase.split(':');
                    const titulo = parts[0];
                    const desc = parts.slice(1).join(':'); // Por si hay más de un ":"
                    return `
                        <div class="phase-item">
                            <div class="phase-number" style="background:${meta.color_primario}">${idx + 1}</div>
                            <div><strong>${titulo}:</strong>${desc}</div>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>

        <div class="task-banner" style="border-color:${meta.color_primario}">
            <span class="card-label" style="color:${meta.color_primario}">Tarea Retadora</span>
            <p style="font-size: 1.25rem; font-weight: 700; margin: 5px 0 0 0;">${est.tarea_retadora}</p>
        </div>

        <div class="card" style="margin-top:25px; background: #f8fafc;">
            <span class="card-label">Criterios de Evaluación</span>
            <ul class="criterios-list">
                ${est.criterios_evaluacion.map(c => `<li>${c}</li>`).join('')}
            </ul>
        </div>
    `;
    
    document.querySelector('.main-viewer').scrollTop = 0;
}

function agregarBotonesExtra(areaId, container) {
    const extraDiv = document.createElement('div');
    extraDiv.style.padding = "20px";
    extraDiv.style.borderTop = "1px solid #ddd";
    
    let buttons = "";
    if (areaId === 'matematicas') {
        buttons = `<button class="btn-extra">📊 Contenidos Genéricos</button><button class="btn-extra">📐 No Genéricos</button>`;
    } else if (areaId === 'sociales') {
        buttons = `<button class="btn-extra">⚖️ Constitución Política</button><button class="btn-extra">🌍 Conceptos Geográficos</button>`;
    } else if (areaId === 'lectura_critica') {
        buttons = `<button class="btn-extra">📖 Tipologías Textuales</button>`;
    } else if (areaId === 'ciencias_naturales') {
        buttons = `<button class="btn-extra">🔬 Laboratorios Virtuales</button>`;
    } else if (areaId === 'ingles') {
        buttons = `<button class="btn-extra">💬 Gramática por Nivel</button>`;
    }

    if(buttons) {
        extraDiv.innerHTML = `<span class="card-label" style="margin-bottom:10px; display:block">Recursos Extra</span>` + buttons;
        container.appendChild(extraDiv);
    }
}
