/* ================================
   CONFIGURACIÓN FIREBASE
================================ */
const firebaseConfig = {
    apiKey: "AIzaSyCVwvcdZzyNZvF0K-Iz1uqhzch_XUx1xY0",
    authDomain: "app-amor-2c5fb.firebaseapp.com",
    projectId: "app-amor-2c5fb",
    storageBucket: "app-amor-2c5fb.firebasestorage.app",
    messagingSenderId: "349564122691",
    appId: "1:349564122691:web:7b6fb1cc608232af09c6f6"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

/* ================================
   SISTEMA DE LOGIN
================================ */
const pantallaLogin = document.getElementById('pantalla-login');
const appPrincipal = document.getElementById('app-principal');
const emailLogin = document.getElementById('email-login');
const passLogin = document.getElementById('pass-login');
const btnIngresar = document.getElementById('btn-ingresar');
const errorLogin = document.getElementById('error-login');
const btnSalir = document.getElementById('btn-salir');

btnIngresar.addEventListener('click', () => {
    const email = emailLogin.value.trim();
    const pass = passLogin.value.trim();
    
    if(email === "" || pass === "") {
        errorLogin.textContent = "Por favor llena ambos campos.";
        return;
    }

    auth.signInWithEmailAndPassword(email, pass)
        .catch(error => {
            errorLogin.textContent = "Datos incorrectos. Intenta de nuevo.";
            console.error(error);
        });
});

btnSalir.addEventListener('click', () => {
    auth.signOut();
});

// Vigilar si hay alguien conectado
auth.onAuthStateChanged(user => {
    if (user) {
        pantallaLogin.style.display = 'none';
        appPrincipal.style.display = 'block';
        cargarMensajesTiempoReal();
        cargarSeriesTiempoReal();
    } else {
        pantallaLogin.style.display = 'flex';
        appPrincipal.style.display = 'none';
        emailLogin.value = '';
        passLogin.value = '';
        errorLogin.textContent = '';
    }
});

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
mostrarSeccion('galeria');

/* ================================
   MENSAJES EN LA NUBE (FIRESTORE)
================================ */
const btnEnviar = document.getElementById('btn-enviar');
const inputMensaje = document.getElementById('nuevo-mensaje');
const listaMensajesDiv = document.getElementById('lista-mensajes');

function cargarMensajesTiempoReal() {
    db.collection('mensajes').orderBy('timestamp')
      .onSnapshot(snapshot => {
          listaMensajesDiv.innerHTML = ''; 
          snapshot.forEach(doc => {
              const data = doc.data();
              const nuevoMensaje = document.createElement('div');
              nuevoMensaje.classList.add('mensaje-burbuja');
              nuevoMensaje.textContent = data.texto;
              listaMensajesDiv.appendChild(nuevoMensaje);
          });
          // Scroll hacia abajo automáticamente
          window.scrollTo(0, document.body.scrollHeight);
      });
}

btnEnviar.addEventListener('click', () => {
    const texto = inputMensaje.value.trim();
    if (texto !== "") {
        db.collection('mensajes').add({
            texto: texto,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
        inputMensaje.value = "";
    }
});

/* ================================
   SERIES EN LA NUBE (FIRESTORE)
================================ */
const btnAgregarSerie = document.getElementById('btn-agregar-serie');
const inputSerie = document.getElementById('nueva-serie');
const categorias = document.querySelectorAll('.categoria');
let cargandoSeries = false; 

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

function cargarSeriesTiempoReal() {
    db.collection('datos').doc('series')
      .onSnapshot(docSnap => {
          if (!docSnap.exists) return;
          cargandoSeries = true; 
          const data = docSnap.data();
          
          document.getElementById('lista-por-ver').innerHTML = '';
          document.getElementById('lista-viendo').innerHTML = '';
          document.getElementById('lista-completadas').innerHTML = '';
          
          data.porVer.forEach(nombre => document.getElementById('lista-por-ver').appendChild(crearElementoSerie(nombre)));
          data.viendo.forEach(nombre => document.getElementById('lista-viendo').appendChild(crearElementoSerie(nombre)));
          data.completadas.forEach(nombre => document.getElementById('lista-completadas').appendChild(crearElementoSerie(nombre)));
          
          cargandoSeries = false;
      });
}

function guardarSeriesEnNube() {
    if (cargandoSeries) return; 
    const estadoSeries = {
        porVer: [], viendo: [], completadas: []
    };
    document.querySelectorAll('#lista-por-ver .serie-item').forEach(el => estadoSeries.porVer.push(el.textContent));
    document.querySelectorAll('#lista-viendo .serie-item').forEach(el => estadoSeries.viendo.push(el.textContent));
    document.querySelectorAll('#lista-completadas .serie-item').forEach(el => estadoSeries.completadas.push(el.textContent));
    
    db.collection('datos').doc('series').set(estadoSeries);
}

btnAgregarSerie.addEventListener('click', () => {
    const nombreSerie = inputSerie.value.trim();
    if (nombreSerie !== "") {
        document.getElementById('lista-por-ver').appendChild(crearElementoSerie(nombreSerie));
        inputSerie.value = ""; 
        guardarSeriesEnNube(); 
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
            guardarSeriesEnNube(); 
        }
    });
});

/* ================================
   GALERÍA DE FOTOS (LOCAL TEMPORAL)
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