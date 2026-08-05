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
const storageRef = firebase.storage().ref();

/* ================================
   SISTEMA DE LOGIN Y REGISTRO
================================ */
const pantallaLogin = document.getElementById('pantalla-login');
const appPrincipal = document.getElementById('app-principal');
const emailLogin = document.getElementById('email-login');
const passLogin = document.getElementById('pass-login');
const btnIngresar = document.getElementById('btn-ingresar');
const btnRegistrar = document.getElementById('btn-registrar');
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
            errorLogin.textContent = "Error: " + error.message;
            console.error("Detalle técnico:", error);
        });
});

btnRegistrar.addEventListener('click', () => {
    const email = emailLogin.value.trim();
    const pass = passLogin.value.trim();
    
    if(email === "" || pass === "") {
        errorLogin.textContent = "Por favor llena ambos campos para registrarte.";
        return;
    }

    if(pass.length < 6) {
        errorLogin.textContent = "La contraseña debe tener al menos 6 caracteres.";
        return;
    }

    auth.createUserWithEmailAndPassword(email, pass)
        .catch(error => {
            if (error.code === 'auth/email-already-in-use') {
                errorLogin.textContent = "Ese correo ya está registrado. Intenta ingresar.";
            } else {
                errorLogin.textContent = "Error al registrar: " + error.message;
            }
            console.error("Detalle técnico:", error);
        });
});

btnSalir.addEventListener('click', () => {
    auth.signOut();
});

auth.onAuthStateChanged(user => {
    if (user) {
        pantallaLogin.style.display = 'none';
        appPrincipal.style.display = 'block';
        cargarMensajesTiempoReal();
        cargarSeriesTiempoReal();
        cargarClosetTiempoReal();
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
mostrarSeccion('moda');

/* ================================
   SECCIÓN: MODA Y PROBADOR (Con ImgBB)
================================ */
const btnSubirPrenda = document.getElementById('btn-subir-prenda');
const inputFotoPrenda = document.getElementById('subir-foto-prenda');
const selectCategoria = document.getElementById('categoria-prenda');
const btnLimpiarOutfit = document.getElementById('btn-limpiar-outfit');

function cargarClosetTiempoReal() {
    db.collection('closet').orderBy('timestamp', 'desc')
      .onSnapshot(snapshot => {
          document.getElementById('lista-polera').innerHTML = '';
          document.getElementById('lista-pantalones').innerHTML = '';
          document.getElementById('lista-chaqueta').innerHTML = '';
          document.getElementById('lista-calcetines').innerHTML = '';

          snapshot.forEach(doc => {
              const data = doc.data();
              const contenedorCategoria = document.getElementById('lista-' + data.categoria);
              
              if (contenedorCategoria) {
                  const imgPrenda = document.createElement('img');
                  imgPrenda.src = data.imagenUrl;
                  imgPrenda.style.width = "80px";
                  imgPrenda.style.height = "80px";
                  imgPrenda.style.objectFit = "cover";
                  imgPrenda.style.borderRadius = "10px";
                  imgPrenda.style.boxShadow = "0 2px 5px rgba(0,0,0,0.1)";
                  imgPrenda.style.cursor = "pointer";
                  imgPrenda.title = "Haz clic para probar esta prenda";

                  imgPrenda.addEventListener('click', () => {
                      probarPrenda(data.imagenUrl, data.categoria);
                  });

                  contenedorCategoria.appendChild(imgPrenda);
              }
          });
      });
}

function probarPrenda(url, categoria) {
    const slot = document.getElementById('slot-' + categoria);
    if (slot) {
        slot.innerHTML = `<img src="${url}" style="width: 110px; height: 110px; object-fit: cover; border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.15);">`;
    }
}

btnLimpiarOutfit.addEventListener('click', () => {
    document.getElementById('slot-chaqueta').innerHTML = '<span class="placeholder-slot">🧥 Sin chaqueta</span>';
    document.getElementById('slot-polera').innerHTML = '<span class="placeholder-slot">👕 Sin polera</span>';
    document.getElementById('slot-pantalones').innerHTML = '<span class="placeholder-slot">👖 Sin pantalón</span>';
    document.getElementById('slot-calcetines').innerHTML = '<span class="placeholder-slot">🧦 Sin calcetines</span>';
});

// NUEVO: Subir foto combinando ImgBB y Firebase Firestore
btnSubirPrenda.addEventListener('click', () => {
    const archivo = inputFotoPrenda.files[0];
    const categoria = selectCategoria.value;

    if (!archivo) {
        alert("¡Primero selecciona una foto de la prenda!");
        return;
    }

    // Cambiamos el texto del botón para saber que está cargando
    btnSubirPrenda.textContent = "Subiendo foto... ⏳";
    btnSubirPrenda.disabled = true;

    // PREPARAR LA FOTO PARA IMGBB
    const formData = new FormData();
    formData.append("image", archivo);
    
    // AQUÍ ESTÁ TU CLAVE DE IMGBB INSERTADA:
    const apiKey = "5063033a8dedc4f6d6858268c16f1516"; 

    // 1. Enviar la foto a ImgBB
    fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
        method: "POST",
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // ImgBB nos da el Link público de la foto
            const imageUrl = data.data.url;
            
            // 2. Guardamos ese Link en Firebase
            return db.collection('closet').add({
                imagenUrl: imageUrl,
                categoria: categoria,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
        } else {
            throw new Error("ImgBB rechazó la imagen.");
        }
    })
    .then(() => {
        inputFotoPrenda.value = "";
        alert("¡Prenda guardada en el clóset con éxito! 💖");
    })
    .catch(error => {
        console.error("Error al subir la prenda: ", error);
        alert("Hubo un error al guardar la foto.");
    })
    .finally(() => {
        // Restaurar el botón a la normalidad
        btnSubirPrenda.textContent = "Guardar en el Clóset";
        btnSubirPrenda.disabled = false;
    });
});

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
          
          if(data.porVer) data.porVer.forEach(nombre => document.getElementById('lista-por-ver').appendChild(crearElementoSerie(nombre)));
          if(data.viendo) data.viendo.forEach(nombre => document.getElementById('lista-viendo').appendChild(crearElementoSerie(nombre)));
          if(data.completadas) data.completadas.forEach(nombre => document.getElementById('lista-completadas').appendChild(crearElementoSerie(nombre)));
          
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