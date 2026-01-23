document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const areaId = params.get('area');

    if (!areaId) return;

    // GitHub es estricto con las rutas, usamos data/nombre.json
    fetch(`data/${areaId}.json`)
        .then(res => {
            if (!res.ok) throw new Error("No se encontró el archivo JSON");
            return res.json();
        })
        .then(data => {
            renderizarApp(data);
        })
        .catch(err => {
            console.error(err);
            const target = document.getElementById('content-target');
            if(target) target.innerHTML = "<h2>Error al cargar datos. Verifica que el archivo exista en la carpeta /data/</h2>";
        });
});

function renderizarApp(data) {
    const color = data.meta.color_primario || "#17334B";
    const areaTitle = document.getElementById('area-title');
    const sideHeader = document.getElementById('side-header');
    const navTree = document.getElementById('nav-tree');

    // Aplicar identidad visual
    if(areaTitle) areaTitle.innerText = data.meta.titulo;
    if(sideHeader) sideHeader.style.backgroundColor = color;
    document.documentElement.style.setProperty('--primary-color', color);

    if(!navTree) return;
    navTree.innerHTML = '';

    // Construir menú lateral
    data.competencias.forEach(comp => {
        const compBox = document.createElement('div');
        compBox.className = 'comp-group';
        compBox.innerHTML = `<div class="comp-title">${comp.nombre}</div>`;

        comp.afirmaciones.forEach(af => {
            af.evidencias.forEach(ev => {
                const item = document.createElement('div');
                item.className = 'evid-item';
                item.innerText = ev.texto_icfes.substring(0, 70) + "...";
                item.onclick = () => {
                    // Resaltar seleccionado
                    document.querySelectorAll('.evid-item').forEach(i => i.classList.remove('active'));
                    item.classList.add('active');
                    pintarDetalle(ev, comp.nombre, color);
                };
                compBox.appendChild(item);
            });
        });
        navTree.appendChild(compBox);
    });
}

function pintarDetalle(ev, compNombre, color) {
    const target = document.getElementById('content-target');
    if(!target) return;

    const est = ev.estrategia_didactica;

    target.innerHTML = `
        <div class="icfes-info">
            <small>COMPETENCIA: ${compNombre}</small>
            <p><strong>EVIDENCIA:</strong> ${ev.texto_icfes}</p>
        </div>

        <h1 class="strategy-title">${est.nombre}</h1>

        <div class="card">
            <strong style="color:${color}; text-transform:uppercase;">Objetivo Pedagógico</strong>
            <p style="font-size:1.2rem; margin-top:10px;">${est.objetivo}</p>
        </div>

        <div class="card">
            <strong style="color:${color}; text-transform:uppercase;">Fases de la Clase</strong>
            <ul style="margin-top:10px; line-height:1.6;">
                ${est.fases_metodologicas.map(f => `<li>${f}</li>`).join('')}
            </ul>
        </div>

        <div class="card" style="background-color:${color}; color:white;">
            <strong style="text-transform:uppercase;">Tarea Retadora</strong>
            <p style="font-size:1.1rem; margin-top:10px;">${est.tarea_retadora}</p>
        </div>
    `;
    
    // Volver arriba en el visor
    document.querySelector('.main-viewer').scrollTop = 0;
}
