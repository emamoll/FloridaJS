/*-----------------------------------------------------------------------------------------------------------------
                                                CLASES
-----------------------------------------------------------------------------------------------------------------*/

/*-----------------------------------------------------------------------------------------------------------------
                                                VARIABLES
-----------------------------------------------------------------------------------------------------------------*/

const contenedorProductos = document.getElementById("contProductos");

const contenedorCanasta = document.getElementById("contCanasta");

let productosDeLaCanasta = {};

const totalCanasta = document.getElementById("contTotalCanasta");

const notificacion = document.getElementById("contNotificacion");

const botonComprar = document.getElementById("contBotonComprar");

/*-----------------------------------------------------------------------------------------------------------------
                                                FUNCIONES
-----------------------------------------------------------------------------------------------------------------*/

// Al cargar la página se carga el array de productos.json.
const obtenerProductos = async () =>{
    try {
        let response = await fetch("js/productos.json");
        let result = await response.json();

        result.forEach( element => {
            contenedorProductos.innerHTML += (`
                <div class="${element.grid} seccionesMayorista">
                    
                    <h5 class="precios">${element.nombre}</h5>
                    <div class="precioYMedida">                    
                        <h5 class="peso">$</h5> <h5 class="precios" id="preciosLista">${element.precio}</h5><p> x </p><p class="medida">${element.medida}</p><p>*</p>
                    </div>
                    <button  class="boton btnAgregar" id="${element.id}">Agregar a la canasta</button>
                </div>
                `);
        });        
    }
    catch (error) {
        console.log(error);
    }
}

// Va arriba donde esta el espacio, abajo del div
/*<img src = "${element.imagen}" alt = "..." class="imgMayorista"/>*/

// Cuando se scrollea la pagína se va llenando la barra de progreso
const barraProgreso = () => {
    let scroll = document.documentElement.scrollTop;
    let largo = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    let progreso = (scroll/largo) * 100;
    document.getElementsByClassName("barra")[0].style.width = progreso + "%";
} 

// Función para llamar al botón "Agregar a la Canasta".
const agregarALaCanasta = (e) => {
    if (e.target.classList.contains("btnAgregar")) {
        crearCanasta(e.target.parentElement)
    }
    e.stopPropagation()
}

// Se crea un objeto con los elementos de los productos.
const crearCanasta = (element) => {
    const producto = {
        id: element.querySelector(".btnAgregar").id,
        nombre: element.querySelector("h5").textContent,
        precio: element.querySelector("#preciosLista").textContent,
        medida: element.querySelector(".medida").textContent,
        cantidad: 1,
    }
    if (productosDeLaCanasta.hasOwnProperty(producto.id)){
        producto.cantidad = productosDeLaCanasta[producto.id].cantidad + 1  
    }
    productosDeLaCanasta[producto.id] = {...producto};
    productoAgregado();
}

// Se agrega el producto a la canasta y aparece una notificación.
const productoAgregado = () => {
    contenedorCanasta.innerHTML = "";
    let i = 1;
    Object.values(productosDeLaCanasta).forEach( element => 
        contenedorCanasta.innerHTML += (`
            <tr class="celdaProducto">
                <td>${i++}</td>
                <td>${element.nombre}</td>
                <td><button class="botonCanasta botonRestar" id="${element.id}"">-</button>${element.cantidad}<button class="botonCanasta botonSumar" id="${element.id}">+</button></td>
                <td>${element.medida}</td>
                <td>${element.cantidad * element.precio}</td>
            </tr>
        `)
        
    );

    notificacion.style.display = "block";
    notificacion.innerHTML = (`
            <p class="notificacionNumero">${i - 1}</p>
        `);

    totalDeLaCanasta();
    
    sessionStorage.setItem("canasta", JSON.stringify(productosDeLaCanasta));
}

// Se suma el total de lo agregado a la canasta y se agregar el footer de la tabla con el total y los botones de "Vaciar la canasta" y "Comprar".
const totalDeLaCanasta = () => {
    totalCanasta.innerHTML = "";
    // Cuando no hay productos en la canasta se elimina el footer de la tabla y aparece un mensaje de canasta vacia, y se borra la notificación de la canasta.
    if (Object.keys(productosDeLaCanasta).length === 0) {
        totalCanasta.innerHTML = (`
            <tr>
                <td></td>
                <td></td>
                <td>Tu canasta está vacía</td>
                <td></td>
                <td></td>
                <td></td>   
            </tr>
        `);
        
        botonComprar.innerHTML = (`
            <tr>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
            </tr>
        `);

        notificacion.style.display = "none";

        return;
    }

    const valorPrecio = Object.values(productosDeLaCanasta).reduce((acumulador, {cantidad, precio}) => acumulador + cantidad * precio,0)
 
    // Cuando se agrega un producto aparece el footer de la tabla con sus botones.
    totalCanasta.innerHTML = (`
        <tr class="celdaTotal">
            <td colspan="2">Total de la canasta</td>
            <td><button class="botonCanasta vaciarTodo">Vaciar la canasta</button></td>
            <td></td>
            <td>$${valorPrecio}</td>
        </tr>
    `);
    
    botonComprar.innerHTML = (`
        <tr>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td class="celdaCompar"><button class="botonCanasta comprarTodo">Comprar</button></td>
        </tr>
    `);
}

// Función para sumar o restar cantidades del producto.
const botonCantidad = (e) => {
    // Se suma cantidad.
    if (e.target.classList.contains("botonSumar")) {
        const producto = productosDeLaCanasta[e.target.id];
        producto.cantidad ++;
        productosDeLaCanasta[e.target.id] = {...producto};
        productoAgregado();
    }
    // Se resta cantidad.
     else if (e.target.classList.contains("botonRestar")) {
        const producto = productosDeLaCanasta[e.target.id];
        producto.cantidad --;
        if (producto.cantidad === 0) {
            delete productosDeLaCanasta[e.target.id]
        }
        productoAgregado();
    }
    e.stopPropagation()
}

// Función para vaciar toda la canasta.
const vaciarTodaLaCanasta = (e) => {
    if (e.target.classList.contains("vaciarTodo")){
        productosDeLaCanasta = {};
        productoAgregado();
    }
}


/*-----------------------------------------------------------------------------------------------------------------
                                                EVENTOS
-----------------------------------------------------------------------------------------------------------------*/

// Cargar los productos cuando se abra la ventana y guardarlos en el storage cuando se agregan a la canasta.
document.addEventListener("DOMContentLoaded", () => {
    obtenerProductos();
    if (sessionStorage.getItem("canasta")) {
        productosDeLaCanasta = JSON.parse(sessionStorage.getItem("canasta"));
        productoAgregado();
    }
});

// Evento para la barra de progreso de la página
window.addEventListener("scroll", () => {
    barraProgreso();
})

// Se agrega el producto a la canasta al hacer click en el botón "Agregar a la Canasta".
contenedorProductos.onclick = (e) => {
    agregarALaCanasta(e);
}

// Se suman cantidades del producto si se hace click en "+" y se restan si se hace click en "-".
contenedorCanasta.onclick = (e) => {
    botonCantidad(e);
}

// Cuando se hace click en "Vaciar la canasta" se vacia toda la canasta.
totalCanasta.onclick = (e) => {
    vaciarTodaLaCanasta(e);
}


/*-----------------------------------------------------------------------------------------------------------------
                                                JQUERY
-----------------------------------------------------------------------------------------------------------------*/
$(() => {

    // Evento para desplazarse hasta la canasta.
    $("#imgCanasta").on("click", function(){
        $("html, body").animate({
            scrollTop: $("#contCanasta").offset().top
        }, 50)
    });

    // Evento para desplazarse hasta el inicio del contenedor de los productos.
    $("#imgFlecha").on("click" , function(){
        $("html,body").animate({
            scrollTop: $("#contProductos").offset().top
        }, 50)
    });
})

