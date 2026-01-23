document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const areaId = params.get('area');

    if (!areaId) {
        console.error("No se encontró el parámetro 'area' en la URL");
        return;
    }

    // Ruta relativa para GitHub Pages
    const jsonPath = `data/${areaId}.json`;

    fetch(jsonPath)
        .then(response => {
            if (!response.ok) throw new Error(`Error al cargar ${jsonPath}`);
            return response.json();
        })
        .then(data => {
            renderizarTodo(data);
        })
        .catch(error => {
            console.error("Error en Fetch:", error);
            document.getElementById('area-title').innerText = "Error de carga";
            document.getElementById('content-target').innerHTML = `<p>Error: No se encontró el archivo data/${areaId}.json o el formato es incorrecto.</p>`;
        });
});

function renderizarTodo(data) {
    // 1. Título y Colores
    const color = data.meta.color_primario || "#333";
    document.getElementById('area-title').innerText = data.meta.titulo;
    document.getElementById('side-header').style.backgroundColor = color;
    document.documentElement.style.setProperty('--primary-color', color);

    // 2. Menú Lateral
    const navTree = document.getElementById('nav-tree');
    navTree.innerHTML = '';

    data.competencias.forEach(comp => {
        const section = document.createElement('div');
        section.innerHTML = `<div class="comp-title" style="font-weight:bold; padding:10px; background:#eee; margin-top:10px;">${comp.nombre}</div>`;
        
        comp.afirmaciones.forEach(af => {
            af.evidencias.forEach(ev => {
                const item = document.createElement('div');
                item.className = 'evid-item';
                item.style.padding = "10px";
                item.style.cursor = "pointer";
                item.style.borderBottom = "1px solid #ddd";
                item.innerText = ev.texto_icfes.substring(0, 50) + "...";
                
                item.onclick = () => {
                    // Quitar activo de otros
                    document.querySelectorAll('.evid-item').forEach(i => i.style.background = "none");
                    item.style.background = "#eef";
                    
                    pintarDetalle(ev, comp.nombre, color);
                };
                section.appendChild(item);
            });
        });
        navTree.appendChild(section);
    });
}

function pintarDetalle(ev, compNombre, color) {
    const target = document.getElementById('content-target');
    const est = ev.estrategia_didactica;

    target.innerHTML = `
        <div style="border-left: 5px solid ${color}; padding: 20px; background: #f9f9f9; margin-bottom: 20px;">
            <small>ICFES | ${compNombre}</small>
            <p><strong>Evidencia:</strong> ${ev.texto_icfes}</p>
        </div>
        
        <h2 style="color:${color}">${est.nombre}</h2>
        <div class="card">
            <strong>Objetivo:</strong>
            <p>${est.objetivo}</p>
        </div>
        
        <div class="card">
            <strong>Fases:</strong>
            <ul>
                ${est.fases_metodologicas.map(f => `<li>${f}</li>`).join('')}
            </ul>
        </div>

        <div style="background:${color}; color:white; padding:15px; border-radius:8px;">
            <strong>Tarea Retadora:</strong>
            <p>${est.tarea_retadora}</p>
        </div>
    `;
}
