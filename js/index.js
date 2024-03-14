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
        if (window.innerWidth <= 850) { // Verificar si el ancho de la ventana es menor (es decir, dispositivo móvil)
            window.scrollTo({ top: 0, behavior: 'smooth' }); // Desplazar hacia arriba
        }
    }

    let url = "https://pokeapi.co/api/v2/pokemon";

    getDataUrl(url);

    function fetchPokemonData(pokemonName) {
        fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`)
            .then(response => response.json())
            .then(data => {
                // Obtengo la habilidad primaria de cada pokemon
                const primaryAbility = data.abilities[0].ability.name;

                // Obtener los tipos de cada Pokémon
                const types = data.types.map(type => type.type.name);

                // Hacer una solicitud para obtener las debilidades de los tipos del Pokémon
                Promise.all(types.map(type => fetch(`https://pokeapi.co/api/v2/type/${type}`)))
                    .then(responses => Promise.all(responses.map(response => response.json())))
                    .then(typeData => {

                        //Se crea esto por el inconveniente de debilidades duplicadas en algunos pokemon 
                        //El set no permite elementos duplicados
                        const weaknessesSet = new Set();

                        // Obtener las debilidades de cada tipo
                        typeData.forEach(type => {
                            type.damage_relations.double_damage_from.forEach(weakness => {
                                weaknessesSet.add(weakness.name);
                            });
                        });
                        // Obtener información de la especie del Pokémon
                        fetch(data.species.url)
                            .then(response => response.json())
                            .then(speciesData => {
                                // Convertir el Set de debilidades de nuevo a un array
                                const weaknesses = Array.from(weaknessesSet);

                                const evolutionChainUrl = speciesData.evolution_chain.url;

                                fetch(evolutionChainUrl)
                                    .then(response => response.json())
                                    .then(evolutionChainData => {
                                        // Obtener nombres y números de Pokédex de las evoluciones
                                        const evolutions = [];
                                        getEvolutions(evolutionChainData.chain, evolutions);

                                        // Mostrar las debilidades en la ventana emergente
                                        const weaknessesText = weaknesses.join(', ');
                                        const evolutionsText = evolutions.map(evo => `${evo.name} (${evo.id})`).join(', ');
                                        displayDataExtra(data.name, weaknessesText, primaryAbility, evolutionsText);
                                    })
                                    .catch(error => console.error('Error fetching evolution chain data:', error));
                            })
                            .catch(error => console.error('Error fetching species data:', error));
                    })
                    .catch(error => console.error('Error fetching Pokemon type data:', error));
            })
            .catch(error => console.error('Error fetching Pokemon data:', error));
    }

    function getEvolutions(chain, result) {
        const currentPokemon = chain.species.name;
        const currentId = chain.species.url.split('/').slice(-2)[0];
        const formattedId = "Nº Pokedex " + currentId; // Quise agregar este texto solo por diseño y gusto personal
        result.push({ name: currentPokemon, id: formattedId });

        if (chain.evolves_to.length > 0) {
            chain.evolves_to.forEach(next => getEvolutions(next, result));
        }
    }

    function displayDataExtra(pokemonName, weaknesses, primaryAbility, evolutions) {
        // Traemos lo necesario de el popup para llevar los datos
        const popup = document.getElementById('popup');
        const popupContent = document.getElementById('popup-content');
        const pokemonNameElement = document.getElementById('pokemon-name');
        const primaryAbilityElement = document.getElementById('primary-ability');
        const weaknessesContainer = document.getElementById('weaknesses-container');
        const evolutionsContainer = document.getElementById('evolutions-container');

        // Relacionamos datos de cada popup con su respectiva informacion
        pokemonNameElement.textContent = pokemonName;
        weaknessesContainer.textContent = `Weaknesses: ${weaknesses}`;
        primaryAbilityElement.textContent = `Primary Ability: ${primaryAbility}`;
        evolutionsContainer.textContent = `Related Pokémon: ${evolutions}`;

        popup.style.display = 'block';

        // Cerrar la ventana emergente al hacer clic en la 'x'
        popupContent.querySelector('.close').addEventListener('click', () => {
            popup.style.display = 'none';
        });
    }

    // Evento de click para abrir el popup
    document.getElementById('containerpk').addEventListener('click', event => {
        const article = event.target.closest('article');
        if (article) {
            const pokemonName = article.id;
            fetchPokemonData(pokemonName);
        }
    });
};
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