/* ================================
   NAVEGACIÓN DEL MENÚ (PESTAÑAS)
================================ */
const enlacesMenu = document.querySelectorAll('.nav-link');
const secciones = document.querySelectorAll('main section');

function mostrarSeccion(idSeccion) {
    secciones.forEach(sec => sec.classList.remove('activa'));
    const seccionDestino = document.getElementById(idSeccion);
    if (seccionDestino) {
        seccionDestino.classList.add('activa');
    }
}

enlacesMenu.forEach(enlace => {
    enlace.addEventListener('click', (e) => {
        e.preventDefault(); 
        const id = enlace.getAttribute('href').substring(1); 
        mostrarSeccion(id);
    });
});

// Mostrar Galería por defecto al cargar
mostrarSeccion('galeria');


/* ================================
   BUZÓN DE MENSAJES (GUARDADO LOCAL)
================================ */
const btnEnviar = document.getElementById('btn-enviar');
const inputMensaje = document.getElementById('nuevo-mensaje');
const listaMensajesDiv = document.querySelector('.lista-mensajes');

function guardarMensajes() {
    const mensajes = [];
    document.querySelectorAll('.mensaje-burbuja').forEach(msg => {
        mensajes.push(msg.textContent);
    });
    localStorage.setItem('mensajes_amor', JSON.stringify(mensajes));
}

function cargarMensajes() {
    const guardados = JSON.parse(localStorage.getItem('mensajes_amor') || '[]');
    guardados.forEach(texto => {
        const nuevoMensaje = document.createElement('div');
        nuevoMensaje.classList.add('mensaje-burbuja');
        nuevoMensaje.textContent = texto;
        listaMensajesDiv.appendChild(nuevoMensaje);
    });
}
cargarMensajes(); 

btnEnviar.addEventListener('click', () => {
    const texto = inputMensaje.value.trim();
    if (texto !== "") {
        const nuevoMensaje = document.createElement('div');
        nuevoMensaje.classList.add('mensaje-burbuja');
        nuevoMensaje.textContent = texto;
        listaMensajesDiv.appendChild(nuevoMensaje);
        inputMensaje.value = "";
        guardarMensajes(); 
    }
});


/* ================================
   SERIES (DRAG AND DROP + GUARDADO LOCAL)
================================ */
const btnAgregarSerie = document.getElementById('btn-agregar-serie');
const inputSerie = document.getElementById('nueva-serie');
const categorias = document.querySelectorAll('.categoria');

function crearElementoSerie(nombre) {
    const nuevaSerie = document.createElement('li');
    nuevaSerie.textContent = nombre;
    nuevaSerie.classList.add('serie-item');
    nuevaSerie.setAttribute('draggable', 'true');
    nuevaSerie.id = 'serie-' + Date.now() + Math.floor(Math.random() * 1000); 
    
    nuevaSerie.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', e.target.id);
    });
    return nuevaSerie;
}

function guardarSeries() {
    const estadoSeries = {
        porVer: [], viendo: [], completadas: []
    };
    document.querySelectorAll('#lista-por-ver .serie-item').forEach(el => estadoSeries.porVer.push(el.textContent));
    document.querySelectorAll('#lista-viendo .serie-item').forEach(el => estadoSeries.viendo.push(el.textContent));
    document.querySelectorAll('#lista-completadas .serie-item').forEach(el => estadoSeries.completadas.push(el.textContent));
    
    localStorage.setItem('series_amor', JSON.stringify(estadoSeries));
}

function cargarSeries() {
    const guardadas = JSON.parse(localStorage.getItem('series_amor'));
    if (guardadas) {
        guardadas.porVer.forEach(nombre => document.getElementById('lista-por-ver').appendChild(crearElementoSerie(nombre)));
        guardadas.viendo.forEach(nombre => document.getElementById('lista-viendo').appendChild(crearElementoSerie(nombre)));
        guardadas.completadas.forEach(nombre => document.getElementById('lista-completadas').appendChild(crearElementoSerie(nombre)));
    }
}
cargarSeries(); 

btnAgregarSerie.addEventListener('click', () => {
    const nombreSerie = inputSerie.value.trim();
    if (nombreSerie !== "") {
        document.getElementById('lista-por-ver').appendChild(crearElementoSerie(nombreSerie));
        inputSerie.value = ""; 
        guardarSeries(); 
    }
});

categorias.forEach(categoria => {
    categoria.addEventListener('dragover', (e) => e.preventDefault());

    categoria.addEventListener('drop', (e) => {
        e.preventDefault();
        const idSerie = e.dataTransfer.getData('text/plain');
        const serieArrastrada = document.getElementById(idSerie);
        const ul = categoria.querySelector('ul');
        if (serieArrastrada && ul) {
            ul.appendChild(serieArrastrada);
            guardarSeries(); 
        }
    });
});


/* ================================
   GALERÍA DE FOTOS 
================================ */
const btnSubir = document.getElementById('btn-subir');
const inputFoto = document.getElementById('subir-foto');
const contenedorFotos = document.querySelector('.contenedor-fotos');

btnSubir.addEventListener('click', () => {
    const archivo = inputFoto.files[0];
    if (archivo) {
        const lector = new FileReader();
        lector.onload = function(e) {
            const nuevaImg = document.createElement('img');
            nuevaImg.src = e.target.result;
            nuevaImg.style.width = "200px";
            nuevaImg.style.borderRadius = "10px";
            nuevaImg.style.margin = "10px";
            nuevaImg.style.boxShadow = "0 4px 8px rgba(0,0,0,0.2)";
            contenedorFotos.appendChild(nuevaImg);
        }
        lector.readAsDataURL(archivo);
    } else {
        alert("¡Primero selecciona una foto!");
    }
});