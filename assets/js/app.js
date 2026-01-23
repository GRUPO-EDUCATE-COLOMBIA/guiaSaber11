document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const areaId = params.get('area');

    if (!areaId) { window.location.href = 'index.html'; return; }

    fetch(`data/${areaId}.json`)
        .then(res => res.json())
        .then(data => {
            document.title = `Guía Edúcate - ${data.meta.titulo}`;
            setupInterface(data);
        });
});

function setupInterface(data) {
    const root = document.documentElement;
    root.style.setProperty('--primary-color', data.meta.color_primario);
    
    document.getElementById('area-label').innerText = data.meta.titulo;
    const navTree = document.getElementById('nav-tree');
    
    data.competencias.forEach(comp => {
        const compGroup = document.createElement('div');
        compGroup.className = 'comp-group';
        compGroup.innerHTML = `<div class="comp-title">${comp.nombre}</div>`;

        comp.afirmaciones.forEach(af => {
            const afTitle = document.createElement('div');
            afTitle.className = 'afirm-title';
            afTitle.innerText = af.texto.substring(0, 80) + '...';
            compGroup.appendChild(afTitle);

            af.evidencias.forEach(ev => {
                const evItem = document.createElement('div');
                evItem.className = 'evid-item';
                evItem.innerText = ev.texto_icfes.substring(0, 90) + '...';
                evItem.onclick = () => renderDetail(ev, comp.nombre, data.meta.color_primario);
                compGroup.appendChild(evItem);
            });
        });
        navTree.appendChild(compGroup);
    });
}

function renderDetail(ev, compNombre, color) {
    // Marcar activo
    document.querySelectorAll('.evid-item').forEach(i => i.classList.remove('active'));
    event.currentTarget.classList.add('active');

    const target = document.getElementById('content-target');
    const est = ev.estrategia_didactica;

    target.innerHTML = `
        <div class="icfes-box">
            <span class="card-label" style="color:#64748b">Referente Técnico ICFES</span>
            <h3>COMPETENCIA: ${compNombre}</h3>
            <p><strong>Evidencia:</strong> ${ev.texto_icfes}</p>
        </div>

        <h1 class="strategy-title">${est.nombre}</h1>
        
        <div class="card">
            <span class="card-label">Objetivo Estratégico</span>
            <p style="font-size: 1.3rem; margin:0;">${est.objetivo}</p>
        </div>

        <div class="card">
            <span class="card-label">Secuencia Metodológica</span>
            <div class="phase-list">
                ${est.fases_metodologicas.map((fase, idx) => {
                    const [titulo, desc] = fase.split(':');
                    return `
                        <div class="phase-item">
                            <div class="phase-number">${idx + 1}</div>
                            <div>
                                <strong>${titulo}:</strong> ${desc}
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>

        <div class="task-banner">
            <span class="card-label" style="color: #c2410c">Tarea Retadora para el Estudiante</span>
            <p style="font-size: 1.2rem; font-weight: 600; margin: 5px 0 0 0;">${est.tarea_retadora}</p>
        </div>

        <div class="card" style="margin-top:25px; background: #f1f5f9; border:none;">
            <span class="card-label">Criterios de Evaluación (¿Qué observar?)</span>
            <ul style="margin: 10px 0 0 0; padding-left: 20px;">
                ${est.criterios_evaluacion.map(c => `<li style="margin-bottom:8px;">${c}</li>`).join('')}
            </ul>
        </div>
    `;
    
    // Scroll suave al inicio del contenido
    document.querySelector('.main-viewer').scrollTop = 0;
}
