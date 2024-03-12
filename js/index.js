var pokemon ={};

window.onload = () => {
    let menu = document.getElementById("barras-menu");

    menu.onclick = () => {
        if (document.getElementById("menu-movil").classList.contains("menu-movil")) {
            document.getElementById("menu-movil").classList.remove("menu-movil")
        } else {
            document.getElementById("menu-movil").classList.add("menu-movil")
        }
    }


    let url = "https://pokeapi.co/api/v2/pokemon";
    document.getElementById("loading").style.display = "block";

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Conexion fallida');
            }
            return response.json();
        })
        .then(data => {
            document.getElementById("loading").style.display = "none";
            //console.log(data);  Aquí puedes trabajar con los datos de respuesta
            mostrarDatosIniciales(data.results);
            for (const pk of data.results) {
                if (pokemon[pk.name]==undefined) {
                    pokemon[pk.name]={url: pk.url}
                }
            }
            cargarDatosPokemon();
        })
        .catch(error => {
            console.error('Hay errores para conectarse con el servidor', error);
        });
}
function cargarDatosPokemon() {
    for (const pk in pokemon) {
        fetch(pokemon[pk].url)
            .then(resp => {
                if (!resp.ok) {
                    throw new Error('Network response was not ok');
                }
                return resp.json();
            })
            .then(datos => {
               extractInfoPokemon(datos)
            })
            .catch(error => {
                console.error('There was a problem with the fetch operation:', error);
            });
    }
}

function extractInfoPokemon(info) {
    pokemon[info.name]={
        //img:info.sprites.other.oficcial-artwork.front_default,
        img:info.sprites.front_default,
        types:info.types.map(t=>t.type.name),
        id:info.id,
        experience:info.base_experience
    }
    let selector ="#"+info.name + " img";
    document.querySelector(selector).src=info.sprites.front_default
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

                <p><label>Types: </label></p>
                <p><label>Id: </label></p>
                <p><label>Experience: </label></p>

            </div>
        </article>`;
        }
    }
    document.getElementById("containerpk").innerHTML=contenidopk;
}
