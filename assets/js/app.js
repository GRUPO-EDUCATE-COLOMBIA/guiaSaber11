// assets/js/app.js

document.addEventListener('DOMContentLoaded', () => {
    // 1. Detectar qué área pidió el usuario (ej: viewer.html?area=matematicas)
    const urlParams = new URLSearchParams(window.location.search);
    const areaId = urlParams.get('area');

    if (!areaId) {
        alert("No se ha seleccionado un área.");
        window.location.href = 'index.html'; // Volver al inicio
        return;
    }

    // 2. Cargar el archivo JSON correspondiente
    fetch(`data/${areaId}.json`)
        .then(response => {
            if (!response.ok) throw new Error("No se encontró el archivo de datos.");
            return response.json();
        })
        .then(data => {
            renderArea(data);
        })
        .catch(error => {
            console.error('Error:', error);
            document.getElementById('app-container').innerHTML = `<h2 style="color:red; text-align:center;">Error cargando el módulo: ${areaId}</h2>`;
        });
});

// 3. Función Principal de Renderizado
function renderArea(data) {
    const container = document.getElementById('app-container');
    const headerTitle = document.getElementById('area-title');
    const headerDesc = document.getElementById('area-desc');
    const headerContainer = document.querySelector('.area-header');

    // A. Configurar Cabecera (Colores y Títulos)
    headerTitle.textContent = data.meta.titulo;
    headerDesc.textContent = data.meta.descripcion;
    headerContainer.style.backgroundColor = data.meta.color_primario;
    
    // Guardamos colores para usarlos en las tarjetas
    const themeColor = data.meta.color_primario;
    const secondaryColor = data.meta.color_secundario;

    // B. Recorrer Competencias
    let htmlContent = '';

    data.competencias.forEach(competencia => {
        // Título de la Competencia
        htmlContent += `
            <div class="competency-section">
                <h2 style="color:${themeColor}; border-bottom: 2px solid ${themeColor}; padding-bottom:10px; margin-top:40px;">
                    ${competencia.nombre} <span style="font-size:0.6em; opacity:0.7; float:right;">Peso: ${competencia.porcentaje || ''}</span>
                </h2>
                <p class="competency-def">${competencia.definicion}</p>
        `;

        // Recorrer Afirmaciones
        competencia.afirmaciones.forEach(afirmacion => {
            
            // Recorrer Evidencias (Aquí creamos la Tarjeta Maestra)
            afirmacion.evidencias.forEach(evidencia => {
                htmlContent += createCardHTML(evidencia, afirmacion.texto, themeColor, secondaryColor);
            });

        });

        htmlContent += `</div>`; // Cierre sección competencia
    });

    container.innerHTML = htmlContent;
}

// 4. Generador de HTML de la Tarjeta (El Diseño que aprobaste)
function createCardHTML(evidencia, afirmacionTexto, themeColor, accentColor) {
    const est = evidencia.estrategia_didactica;
    
    // Generar lista de fases metodológicas
    let fasesHTML = '';
    if (est.fases_metodologicas) {
        est.fases_metodologicas.forEach(fase => {
            fasesHTML += `<li>${fase}</li>`;
        });
    }

    // Generar lista de criterios
    let criteriosHTML = '';
    if (est.criterios_evaluacion) {
        est.criterios_evaluacion.forEach(criterio => {
            criteriosHTML += `<li>${criterio}</li>`;
        });
    }

    // Badge de Componente (Para Ciencias)
    let badgeHTML = '';
    if(evidencia.componente_tematico) {
        let badgeColor = '#999';
        if(evidencia.componente_tematico === 'BIOLÓGICO') badgeColor = '#4CAF50';
        if(evidencia.componente_tematico === 'FÍSICO') badgeColor = '#FF9800';
        if(evidencia.componente_tematico === 'QUÍMICO') badgeColor = '#9C27B0';
        badgeHTML = `<span style="background:${badgeColor}; font-size:0.7em; padding:2px 8px; border-radius:4px; margin-left:10px; color:white;">${evidencia.componente_tematico}</span>`;
    }

    return `
    <article class="evidence-card">
        <!-- HEADER TARJETA -->
        <header class="card-header" style="background-color: ${themeColor};">
            <div>
                <span style="font-size: 0.8rem; opacity: 0.9; display:block; margin-bottom:4px;">AFIRMACIÓN: ${afirmacionTexto.substring(0, 50)}...</span>
                <h3 style="margin:0; font-size:1.4rem;">Evidencia ${evidencia.id} ${badgeHTML}</h3>
            </div>
        </header>

        <!-- EVIDENCIA OFICIAL -->
        <div class="icfes-body">
            <p class="text-evidence">${evidencia.texto_icfes}</p>
        </div>

        <!-- DASHBOARD PEDAGÓGICO -->
        <section class="strategy-dashboard">
            <div class="strategy-header">
                <!-- Icono Foco -->
                <svg viewBox="0 0 24 24" fill="none" stroke="#F39325" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:32px; height:32px;"><path d="M9 21h6"></path><path d="M12 3a6 6 0 0 1 6 6 4 4 0 0 0 4 4v1a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3v-1a4 4 0 0 0 4-4 6 6 0 0 1 6-6z"></path></svg>
                <h3 class="strategy-name" style="color:${themeColor}">${est.nombre}</h3>
            </div>

            <div class="pedagogy-grid">
                <!-- Objetivo -->
                <div class="p-box box-objective">
                    <div class="p-box-title" style="color:#54BBAB">OBJETIVO DIDÁCTICO</div>
                    <p>${est.objetivo}</p>
                </div>

                <!-- Fases -->
                <div class="p-box box-phases" style="border-left-color:${themeColor}">
                    <div class="p-box-title" style="color:${themeColor}">SECUENCIA DIDÁCTICA</div>
                    <ul class="phase-list">${fasesHTML}</ul>
                </div>

                <!-- Tarea -->
                <div class="p-box box-task">
                    <div class="p-box-title" style="color:#B01829">TAREA RETADORA</div>
                    <p>${est.tarea_retadora}</p>
                </div>

                <!-- Criterios -->
                <div class="p-box box-criteria">
                    <div class="p-box-title" style="color:#F39325">CRITERIOS EVALUACIÓN</div>
                    <ul class="check-list">${criteriosHTML}</ul>
                </div>
            </div>
        </section>
    </article>
    `;
}
