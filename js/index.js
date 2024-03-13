var pokemon = {};
var next = {};
var previous = {};

window.onload = () => {
    let menu = document.getElementById("barras-menu");

    menu.onclick = () => {
        if (document.getElementById("menu-movil").classList.contains("menu-movil")) {
            document.getElementById("menu-movil").classList.remove("menu-movil")
        } else {
            document.getElementById("menu-movil").classList.add("menu-movil")
        }
    }
    let buttonNext = document.getElementById("next");
    buttonNext.onclick = () => {
        getDataUrl(next)
    }
    let buttonPrevious = document.getElementById("previous");
    buttonPrevious.onclick = () => {
        getDataUrl(previous)
    }

    let buttonNextBottom = document.getElementById("next-bottom");
    let buttonPreviousBottom = document.getElementById("previous-bottom");

    buttonNextBottom.onclick = () => {
        getDataUrl(next)
        setTimeout(scrollToTopOnMobile, 100);
    }

    buttonPreviousBottom.onclick = () => {
        getDataUrl(previous)
        setTimeout(scrollToTopOnMobile, 100);
    }

    function scrollToTopOnMobile() {
        if (window.innerWidth <= 850) { // Verificar si el ancho de la ventana es menor o igual a 450px (es decir, dispositivo móvil)
            window.scrollTo({ top: 0, behavior: 'smooth' }); // Desplazar suavemente hacia arriba
        }
    }
    
    let url = "https://pokeapi.co/api/v2/pokemon";

    getDataUrl(url);

}
function fetchPokemonRetardada(url) {
    fetch(url)
        .then(resp => {
            if (!resp.ok) {
                throw new Error('Network response was not ok');
            }
            return resp.json();
        })
        .then(datos => {
            extractInfoPokemon(datos);
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
}
function cargarDatosPokemon(listanueva) {
    for (const pk in listanueva) {
        if (pk.img == undefined) {
            setTimeout(fetchPokemonRetardada, 0, (listanueva[pk].url))
        } else {
            extractInfoPokemon(listanueva[pk])
        }
    }
}

function extractInfoPokemon(info) {
    let firstType = info.types[0].type.name.split(',')[0].trim();

    pokemon[info.name] = {
        img: info.sprites.other["official-artwork"].front_default,
        //img: info.sprites.front_default,
        types: info.types.map(t => t.type.name),
        id: info.id,
        experience: info.base_experience
    }
    let selector = "#" + info.name + " img";
    document.querySelector(selector).src = pokemon[info.name].img
    selector = "#" + info.name + " span";
    let texto = document.querySelectorAll(selector);
    texto[0].innerHTML = pokemon[info.name].types;
    texto[1].innerHTML = pokemon[info.name].id;
    texto[2].innerHTML = pokemon[info.name].experience;

    document.getElementById(info.name).classList.add(firstType);
}

function mostrarDatosIniciales(listapk) {
    var contenidopk = ""
    for (const pk in listapk) {
        if (Object.hasOwnProperty.call(listapk, pk)) {
            const element = listapk[pk];
            contenidopk += `
            <article id="${element.name}">
            <h3>${element.name}</h3>
            <img src="img/Loading.gif" alt="loading" style="width: 100%;">
            <div>
                <p><label>Types: </label><span></span></p>
                <p><label>Num: </label><span></span></p>
                <p><label>Experience: </label><span></span></p>
            </div>
        </article>`;
        }
    }
    document.getElementById("containerpk").innerHTML = contenidopk;
}
function getDataUrl(url) {
    document.getElementById("loading").style.display = "block";

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Conexion fallida');
            }
            return response.json();
        })
        .then(data => {
            if (data.next == null) {
                document.getElementById("next").style.display = "none";
                document.getElementById("next-bottom").style.display = "none";
            } else {
                document.getElementById("next").style.display = "inline";
                document.getElementById("next-bottom").style.display = "inline";
            }
            if (data.previous == null) {
                document.getElementById("previous").style.display = "none";
                document.getElementById("previous-bottom").style.display = "none";
            } else {
                document.getElementById("previous").style.display = "inline";
                document.getElementById("previous-bottom").style.display = "inline";
            }
            next = data.next;
            previous = data.previous;
            document.getElementById("loading").style.display = "none";
            //console.log(data);  Aquí puedes trabajar con los datos de respuesta
            mostrarDatosIniciales(data.results);
            for (const pk of data.results) {
                if (pokemon[pk.name] == undefined) {
                    pokemon[pk.name] = { url: pk.url }
                }
            }
            cargarDatosPokemon(data.results);
        })
        .catch(error => {
            console.error('Hay errores para conectarse con el servidor', error);
        });
}