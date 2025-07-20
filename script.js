class Curso {
    constructor(id,nombre, profesor, descripcion, cantestudiantes, estudiantes, materiales, tareas) {
        this.id = id;
        this.nombre = nombre;
        this.profesor = profesor;
        this.descripcion = descripcion;
        this.cantestudiantes = cantestudiantes;
        this.estudiantes = estudiantes || [];
        this.materiales = materiales || [];
        this.tareas = tareas || [];
    }

}


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
    const formlogin = document.getElementById('login-form');

    if (formlogin) {
        formlogin.addEventListener('submit', async function (event) {
            event.preventDefault();
            const username = document.getElementById('nombreusuario').value;
            const password = document.getElementById('contrasena').value;
            const user = await buscarusuario(username, password);
            if (user) {
                alert('¡Inicio de sesión exitoso!');
                window.location.href = 'CatalogoCursos.html';
            } else {
                alert('Usuario o contraseña incorrectos');
            }
        });
    }

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

            if (password !== confirmarcontrasena) {
                alert("Error: Las contraseñas no coinciden.")
                return;
            }

            if (!validarsinumero(name)) {
                alert("Error: El nombre solo puede contener letras y espacios. No se permiten otros caracteres.");
                return;
            }

            const newstudent = new Estudiante(name, username, email, password, []);
            let estudiantes = JSON.parse(localStorage.getItem('estudiantes')) || [];
            estudiantes.push(newstudent);
            localStorage.setItem('estudiantes', JSON.stringify(estudiantes));
            alert("¡Registro exitoso!");
            window.location.href = 'CatalogoCursos.html';

        });
    }

    if (window.location.pathname.endsWith('CatalogoCursos.html')) {
        mostrarCursos();
    }
});

function validarsinumero(texto) {
    const regex = /^[a-zA-Z\s]+$/;
    return regex.test(texto);
}

async function buscarusuario(username, password) {
    try {
        const response = await fetch('estudiantes.json');
        const estudiantes = await response.json();
        return estudiantes.find(est => est.usuario === username && est.contrasena === password);
    } catch (error) {
        console.error('Error al leer el archivo JSON:', error);
        return null;
    }
}

async function mostrarCursos(){
    try {
        const response = await fetch('cursos.json');
        const cursos = await response.json();
        const cursosContainer = document.getElementById('cursos-container');

        cursos.forEach(curso => { 
            const cursoElement = document.createElement('div');
            cursoElement.classList.add('curso');
            cursoElement.innerHTML = `
                <h3>${curso.nombre}</h3>
                <p>Profesor: ${curso.profesor}</p>
                <p>${curso.descripcion}</p>
                <button onclick="inscribirCurso('${curso.id}')">Inscribirse</button>
            `;
            cursosContainer.appendChild(cursoElement);
        });

    }catch (error){
        console.error('Error al leer el archivo JSON:', error);
        return null;
    }
}

