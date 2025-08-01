/*class Curso {
    constructor(id, nombre, profesor, descripcion, categoria, nivel, duracion_horas, lo_que_aprenderas, temario_resumido, materiales, tareas) {
        this.id = id;
        this.nombre = nombre;
        this.profesor = profesor;
        this.descripcion = descripcion;
        this.categoria = categoria;
        this.nivel = nivel;
        this.duracion_horas = duracion_horas;
        this.lo_que_aprenderas = lo_que_aprenderas || '';
        this.temario_resumido = temario_resumido || [];
        this.materiales = materiales || [];
        this.tareas = tareas || [];
    }

}*/


class Estudiante {
    constructor(nombre, usuario, correo, contrasena, cursos) {
        this.nombre = nombre;
        this.usuario = usuario;
        this.correo = correo;
        this.contrasena = contrasena;
        this.cursos = cursos || [];
    }
}

document.addEventListener('DOMContentLoaded', function () {
    //si estudiantes ya fue inicializado
    if (!localStorage.getItem('estudiantes')) {
        cargarestudiantes();
    }

    //si se desea iniciar sesion 
    const formlogin = document.getElementById('login-form');
    
    if (formlogin) {
        formlogin.addEventListener('submit', async function (event) {
            event.preventDefault();
            const username = document.getElementById('nombreusuario').value;
            const password = document.getElementById('contrasena').value;
            //toma el usuario y contasena proporcionados, los busca en estudiantes
            const user = buscarusuario(username, password);
            if (user) {
                localStorage.setItem('loggedUser', JSON.stringify(user));
                let misCursos = JSON.parse(localStorage.getItem('misCursos')) || {};
                misCursos[user.usuario] = user.cursos || [];
                localStorage.setItem('misCursos', JSON.stringify(misCursos));
                alert('¡Inicio de sesión exitoso!');
                window.location.href = 'CatalogoCursos.html';
            } else {
                alert('Usuario no encontrado.');
            }
        });
    }

    //si desea registrar un nuevo usuario
    const formregistro = document.getElementById('register-form');

    if (formregistro) {
        formregistro.addEventListener('submit', function (event) {
            event.preventDefault();
            console.log("Evento submit registro ejecutado");
            const name = document.getElementById('nombre').value;
            const username = document.getElementById('nombreusuario').value;
            const email = document.getElementById('correo').value;
            const password = document.getElementById('contrasena').value;
            const confirmarcontrasena = document.getElementById('confirmar').value;
            let estudiantes = JSON.parse(localStorage.getItem('estudiantes')) || [];

            //validaciones del formulario
            if (password !== confirmarcontrasena) {
                alert("Error: Las contraseñas no coinciden.")
                return;
            }

            if (!validarsinumero(name)) {
                alert("Error: El nombre solo puede contener letras y espacios. No se permiten otros caracteres.");
                return;
            }

            const existe = estudiantes.some(est => est.usuario === username || est.correo === email);
            if (existe) {
                alert("Error: El nombre de usuario o el correo electrónico ya están en uso.");
                return;
            }
            else{
                //todo bien, crea estudiante y lo agrega a estudiantes
                const newstudent = new Estudiante(name, username, email, password, []);
                estudiantes.push(newstudent);
                localStorage.setItem('estudiantes', JSON.stringify(estudiantes));
                localStorage.setItem('loggedUser', JSON.stringify(newstudent));
                alert("¡Registro exitoso!");
                window.location.href = 'CatalogoCursos.html';
            }
        });
    }

    const user = JSON.parse(localStorage.getItem('loggedUser'));

    //si toca el icono de perfil
    const perfilbtn = document.getElementById('user-icon');
    if (perfilbtn) {
        perfilbtn.addEventListener('click', function (e) {
            if (!user) {
                e.preventDefault();
                window.location.href = 'login.html';
            } else {
                window.location.href = 'perfil.html';
            }
        });
    }

    //saca el icono de logout del catalogo si no hay sesion iniciada
    if (window.location.pathname.endsWith('CatalogoCursos.html')) {
        if (user) {
            document.getElementById('logout-icon').style.display = 'inline';
        }
        mostrarCursos();
    }

    //si se presiona el icono logout
    const logoutBtn = document.getElementById('logout-icon');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function () {
            const resp = confirm('¿Estás seguro de que quieres cerrar sesión?');
            if (resp) {
                alert('Sesión cerrada exitosamente');
                localStorage.removeItem('loggedUser');
                window.location.href = 'CatalogoCursos.html';
            }
        });
    }
});

//funcion para validad que el texto contenga letras y no numeros, sacada de internet
function validarsinumero(texto) {
    const regex = /^[a-zA-Z\s]+$/;
    return regex.test(texto);
}

//funcion para leer los datos del json de estudiantes
async function cargarestudiantes() {
    try {
        const response = await fetch('estudiantes.json');
        const estudiantes = await response.json();
        localStorage.setItem('estudiantes', JSON.stringify(estudiantes));
    }
    catch (error) {
        console.error('Error al leer el archivo JSON:', error);
        return null;
    }
}

//fucncion para buscar un usuario en el arreglo estudiantes
function buscarusuario(username, password) {
    const estudiantes = JSON.parse(localStorage.getItem('estudiantes')) || [];
    return estudiantes.find(est => est.usuario === username && est.contrasena === password);
}

//funcion para que los cursos se muestren en el catalogo 
//ademas lectura del json cursos
async function mostrarCursos() {
    try {
        const response = await fetch('cursos.json');
        const cursos = await response.json();
        const cursosContainer = document.getElementById('cursos-container');

        //crea tarjetitas de cursos
        cursos.forEach(curso => {
            const cursoElement = document.createElement('div');
            cursoElement.classList.add('curso');
            cursoElement.innerHTML = `
                <h3>${curso.nombre}</h3>
                <p><strong>Profesor: </strong> ${curso.profesor}</p>
                <p>${curso.descripcion}</p>
                <button onclick="inscribirCurso('${curso.id}')" class="btn">Inscribirse</button>
            `;
            cursosContainer.appendChild(cursoElement);
        });

    } catch (error) {
        console.error('Error al leer el archivo JSON:', error);
        return null;
    }
}

//si se presiona el boton de inscribirse en algun curso del catalogo
function inscribirCurso(id) {
    const user = JSON.parse(localStorage.getItem('loggedUser'));
    if (!user) {
        alert('Debe iniciar sesión para inscribirse en un curso');
        return;
    }

    //valida que el usuario ya este inscrito en el curso seleccionado
    const misCursosObj = JSON.parse(localStorage.getItem('misCursos')) || {};
    misCursos = misCursosObj[user.usuario] || [];
    if (misCursos.includes(id)) {
        alert('Ya estás inscrito en este curso');
        return;
    }
    window.location.href = `ConfirmacionCurso.html?curso=${id}`;
}

//informacion del curso para inscribir
if (window.location.pathname.endsWith('ConfirmacionCurso.html')) {
    document.addEventListener('DOMContentLoaded', async () => {
        const params = new URLSearchParams(window.location.search);
        const cursoId = params.get('curso');
        const resp = await fetch('cursos.json');
        const cursos = await resp.json();
        const curso = cursos.find(c => c.id === cursoId);
        //pase de todos los datos del curso
        document.getElementById('curso-nombre').innerText = curso.nombre;
        document.getElementById('curso-profesor').innerText = 'Profesor: ' + curso.profesor;
        document.getElementById('curso-descripcion').innerText = curso.descripcion;
        const listaAprender = document.getElementById('loqueseaprendera');
        listaAprender.innerHTML = '';
        curso.lo_que_aprenderas.forEach(item => {
            const li = document.createElement('li');
            li.innerText = item;
            listaAprender.appendChild(li);
        });
        document.getElementById('categoria').innerText = 'Categoría: ' + curso.categoria;
        document.getElementById('nivel').innerText = 'Nivel: ' + curso.nivel;
        document.getElementById('Duracion').innerText = 'Duración: ' + curso.duracion_horas + ' horas';
        const listatemario = document.getElementById('temario-resumido');
        listatemario.innerHTML = '';
        curso.temario_resumido.forEach(item => {
            const li = document.createElement('li');
            li.innerText = item;
            listatemario.appendChild(li);
        });
        //botones de confirmacion y cancelar solitiud de inscripcion
        document.getElementById('confirm-btn').addEventListener('click', () => {
            const user = JSON.parse(localStorage.getItem('loggedUser'));
            if (!user) return alert('Debe iniciar sesión');
            let misCursos = JSON.parse(localStorage.getItem('misCursos')) || {};
            misCursos[user.usuario] = misCursos[user.usuario] || []; //paque no hayan 2 cursitos iguales
            if (!misCursos[user.usuario].includes(cursoId)) {
                //agg curso nuevo a miscursos del usuario
                misCursos[user.usuario].push(cursoId);
                localStorage.setItem('misCursos', JSON.stringify(misCursos));
                //actualiza estudiantes con el nuevo curso del usuario
                const estudiantes = JSON.parse(localStorage.getItem('estudiantes')) || [];
                const index = estudiantes.findIndex(est => est.usuario === user.usuario);
                console.log("ayudame: " + user.usuario);
                estudiantes[index].cursos = misCursos[user.usuario];
                localStorage.setItem('estudiantes', JSON.stringify(estudiantes));
            }
            alert('Inscripción confirmada');
            window.location.href = 'MisCursos.html';
        });
        document.getElementById('cancel-btn').addEventListener('click', () => {
            window.history.back();
        });
    });
}

//si se presiona el icono de perfil 
if (window.location.pathname.endsWith('perfil.html')) {
    document.addEventListener('DOMContentLoaded', () => {
        //pase de datos de la informacion del perfil
        const user = JSON.parse(localStorage.getItem('loggedUser'));
        const cont = document.querySelector('.infoperfil');
        const div = document.createElement('div');
        div.innerHTML = `
        <p><b>Nombre: </b> ${user.nombre}</p>
        <p><b>Usuario: </b> ${user.usuario}</p>
        <p><b>Correo: </b> ${user.correo}</p>
        `;
        cont.appendChild(div);
    });
}

//si se presiona seccion mis cursos
if (window.location.pathname.endsWith('MisCursos.html')) {
    document.addEventListener('DOMContentLoaded', async () => {
        const user = JSON.parse(localStorage.getItem('loggedUser'));
        if (!user) {
            document.getElementById('mis-cursos-container').innerText = 'Debes iniciar sesion para acceder a tus cursos.';
        }
        else {
            document.getElementById('logout-icon').style.display = 'inline';
        }
        //pase de datos de los cursos del usuario logeado a misCursos
        const misCursos = JSON.parse(localStorage.getItem('misCursos')) || {};
        const ids = misCursos[user.usuario] || [];
        if (ids.length === 0) {
            document.getElementById('mis-cursos-container').innerText = 'No estás inscrito en ningún curso.';
            return;
        }
        const resp = await fetch('cursos.json');
        const cursos = await resp.json();
        const cont = document.getElementById('mis-cursos-container');
        ids.forEach(id => {
            const curso = cursos.find(c => c.id === id);
            if (curso) {
                //crea tarjetita de curso 
                const div = document.createElement('div');
                div.classList.add('curso');
                div.innerHTML = `
                    <h3>${curso.nombre}</h3>
                    <p><strong>Profesor: </strong> ${curso.profesor}</p>
                    <p>${curso.descripcion}</p>
                    <button onclick="window.location.href='CursoDetalle.html?curso=${id}'" class="btn">Ver Detalle</button>
                    `;
                cont.appendChild(div);
            }

        });
    });
}

//si se presiona ver detalles en un curso
if (window.location.pathname.endsWith('CursoDetalle.html')) {
    document.addEventListener('DOMContentLoaded', async () => {
        const params = new URLSearchParams(window.location.search);
        const cursoId = params.get('curso');
        const resp = await fetch('cursos.json');
        const cursos = await resp.json();
        const user = JSON.parse(localStorage.getItem('loggedUser'));
        const curso = cursos.find(c => c.id === cursoId);
        //pase de datos a la interfaz
        document.getElementById('curso-nombre').innerText = curso.nombre;
        document.getElementById('curso-profesor').innerText = 'Profesor: ' + curso.profesor;
        document.getElementById('curso-descripcion').innerText = curso.descripcion;
        const listaAprender = document.getElementById('loqueseaprendera');
        listaAprender.innerHTML = '';
        curso.lo_que_aprenderas.forEach(item => {
            const li = document.createElement('li');
            li.innerText = item;
            listaAprender.appendChild(li);
        });
        document.getElementById('categoria').innerText = 'Categoría: ' + curso.categoria;
        document.getElementById('nivel').innerText = 'Nivel: ' + curso.nivel;
        document.getElementById('Duracion').innerText = 'Duración: ' + curso.duracion_horas + ' horas';
        const listatemario = document.getElementById('temario-resumido');
        listatemario.innerHTML = '';
        curso.temario_resumido.forEach(item => {
            const li = document.createElement('li');
            li.innerText = item;
            listatemario.appendChild(li);
        });
        //incrustar enlaces, pdfs y videos del curso (materiales)
        const listamateriales = document.getElementById('materiales-lista');
        listamateriales.innerHTML = '';
        curso.materiales.forEach(item => {
            const h3 = document.createElement('h3');
            h3.innerHTML = item.titulo;
            const divmateriales = document.createElement('div');
            listamateriales.appendChild(h3);
            if (item.tipo === 'enlace') {
                divmateriales.innerHTML = `<a href="${item.url}" target="_blank">${item.titulo}</a>`;
            } else if (item.tipo === 'video') {
                divmateriales.innerHTML = `<iframe width="600" height="300" src="${item.url}" frameborder="0" allowfullscreen></iframe>`;
            } else if (item.tipo === 'pdf') {
                divmateriales.innerHTML = `<iframe width="600" height="700" src="${item.url}" frameborder="0" allowfullscreen></iframe>`;
            }
            listamateriales.appendChild(divmateriales);
        });

        //pase del proyecto final
        document.getElementById('proyectotitulo').innerText = curso.proyecto_final.titulo;
        document.getElementById('proyecto-enunciado').innerText = curso.proyecto_final.enunciado;

        //detalles de calificaciones, crea seccion calificaciones una vez se hizo una entrega
        const entregas = JSON.parse(localStorage.getItem('entregas')) || {};
        const entregaActual = user && entregas[user.usuario] && entregas[user.usuario][cursoId];
        const statusDiv = document.getElementById('project-status');
        if (entregaActual) {
            statusDiv.innerText = `Ya enviaste: ${entregaActual.fileName}`;
            statusDiv.classList.add('success');
            let cont = document.querySelector('aside nav');
            const ahref = document.createElement('a');
            ahref.href = "#calificaciones";
            ahref.innerText = "Ver calificaciones";
            cont.appendChild(ahref);
            cont = document.getElementById('detallescurso-container');
            const calificacionDiv = document.createElement('div');
            calificacionDiv.innerHTML = `
                <br>
                <h2 id="calificaciones">Calificación</h2>
                <p><strong>Nota: </strong>${entregaActual.calificacion || 'No disponible'}</p>
                <p><strong>Comentarios: </strong>${entregaActual.comentarios || 'No hay comentarios'}</p>
            `;
            cont.appendChild(calificacionDiv);
        }

        //genera datos de la entrega una vez se sube el archivo
        const form = document.getElementById('final-project-form');
        form.addEventListener('submit', event => {
            event.preventDefault();
            const fileInput = document.getElementById('project-file');
            if (fileInput.files.length === 0) {
                statusDiv.innerText = 'Por favor, selecciona un archivo.';
                return;
            }
            const file = fileInput.files[0];
            //supuesto guardado de entrega en localStorage
            let entregas = JSON.parse(localStorage.getItem('entregas')) || {};

            //genera calificacion random
            const calificacion = Math.floor(Math.random() * 21);
            //crea un comentario segun calificacion
            let comentario = '';
            if (calificacion >= 16) {
                comentario = '¡Muy buen trabajo!';
            } else if (calificacion >= 10) {
                comentario = 'Podemos mejorar. Revisado.';
            } else {
                comentario = 'Lo peor que he visto en mi vida.';
            }

            //crea entrega
            entregas[user.usuario] = entregas[user.usuario] || {};
            entregas[user.usuario][cursoId] = {
                fileName: file.name,
                calificacion: calificacion,
                comentarios: comentario
            };
            localStorage.setItem('entregas', JSON.stringify(entregas));
            statusDiv.innerText = '¡Proyecto enviado exitosamente!';
            statusDiv.classList.add('success');
        });

    });
}





