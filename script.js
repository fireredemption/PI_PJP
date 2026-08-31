// =====================================
// BIBLIOTECA COMUNITÁRIA
// script.js - Parte 3A
// =====================================

// ----------------------------
// Variáveis globais
// ----------------------------

let mapa;
let marcadorUsuario;
let bibliotecas = [];

// ----------------------------
// Inicializar o mapa
// ----------------------------

function iniciarMapa() {

    mapa = L.map('map').setView([-15.7801, -47.9292], 4);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {

        attribution: '&copy; OpenStreetMap'

    }).addTo(mapa);

}

iniciarMapa();


// ----------------------------
// Carregar bibliotecas
// ----------------------------

async function carregarBibliotecas() {

    try {

        const resposta = await fetch("bibliotecas.json");

        bibliotecas = await resposta.json();

        console.log("Bibliotecas carregadas:");

        console.table(bibliotecas);

    }

    catch (erro) {

        console.error("Erro ao carregar bibliotecas.");

    }

}

carregarBibliotecas();


// ----------------------------
// Buscar CEP
// ----------------------------

const botao = document.getElementById("btnPesquisar");

botao.addEventListener("click", buscarCEP);


// também pesquisar apertando ENTER

document.getElementById("cep").addEventListener("keypress", function (e) {

    if (e.key === "Enter") {

        buscarCEP();

    }

});


// ----------------------------
// Buscar CEP na ViaCEP
// ----------------------------

async function buscarCEP() {

    let cep = document.getElementById("cep").value;

    cep = cep.replace(/\D/g, '');

    const mensagem = document.getElementById("mensagem");

    if (cep.length != 8) {

        mensagem.innerHTML = "Digite um CEP válido.";

        mensagem.style.color = "red";

        return;

    }

    mensagem.innerHTML = "Buscando CEP...";

    mensagem.style.color = "#198754";

try {

    const resposta = await fetch(
        "https://viacep.com.br/ws/" + cep + "/json/"
    );

    const dados = await resposta.json();

    if (dados.erro) {

        mensagem.innerHTML = "CEP não encontrado.";

        mensagem.style.color = "red";

        return;
    }


        mensagem.innerHTML =

            `${dados.localidade} - ${dados.uf}`;

        localizarCidade(

            dados.localidade,

            dados.uf

        );

    }

    catch {

        mensagem.innerHTML = "Erro ao consultar ViaCEP.";

        mensagem.style.color = "red";

    }

}



// ----------------------------
// Localizar cidade
// ----------------------------

async function localizarCidade(cidade, uf) {

    try {

        const url =

            `https://nominatim.openstreetmap.org/search?city=${cidade}&state=${uf}&country=Brasil&format=json`;

        const resposta = await fetch(url);

        const dados = await resposta.json();

        if (dados.length == 0) {

            return;

        }

        let latitude = parseFloat(dados[0].lat);

        let longitude = parseFloat(dados[0].lon);

        mapa.setView(

            [latitude, longitude],

            13

        );

        if (marcadorUsuario) {

            mapa.removeLayer(marcadorUsuario);

        }

        marcadorUsuario = L.marker([latitude, longitude])

            .addTo(mapa)

            .bindPopup("<b>Você está aqui</b>")

            .openPopup();

        console.log("Cidade localizada.");

        mostrarBibliotecas();

    }

    catch (erro) {

        console.log(erro);

    }

}

// =====================================
// PARTE 3B
// Marcadores + Lista + Painel
// =====================================

// Guardar os marcadores criados
let marcadores = [];


// -------------------------------------
// Mostrar bibliotecas no mapa
// -------------------------------------

function mostrarBibliotecas() {

    // Remove marcadores antigos
    marcadores.forEach(m => mapa.removeLayer(m));

    let distancia = 0;

    if (latitudeUsuario != null) {

        distancia = calcularDistancia(

            latitudeUsuario,

            longitudeUsuario,

            biblioteca.latitude,

            biblioteca.longitude

        );

    }

    marcadores = [];

    const lista = document.getElementById("listaBibliotecas");

    lista.innerHTML = "";

    bibliotecas.forEach((biblioteca, indice) => {

        // -----------------------------
        // Criar marcador
        // -----------------------------

        const marcador = L.marker([
            biblioteca.latitude,
            biblioteca.longitude
        ]).addTo(mapa);

        marcador.bindPopup(`

<b>${biblioteca.nome}</b>

<br>

${biblioteca.endereco}

<br><br>

${distancia.toFixed(1)} km

<br><br>

<button
onclick="comoChegar(${biblioteca.latitude},${biblioteca.longitude})">

Como chegar

</button>

`);

        marcador.on("click", () => {

            mostrarInformacoes(biblioteca);

        });

        marcadores.push(marcador);

        // -----------------------------
        // Card lateral
        // -----------------------------

        const card = document.createElement("div");

        card.className = "cardBiblioteca";

        card.innerHTML = `

<h5>

${biblioteca.nome}

</h5>

<p>

<i class="bi bi-geo-alt-fill"></i>

${biblioteca.endereco}

</p>

<p>

<i class="bi bi-signpost"></i>

${distancia.toFixed(1)} km

</p>

<p>

${bibliotecaAberta(biblioteca.horario)

                ?

                '<span class="badge-aberta">Aberta</span>'

                :

                '<span class="badge-fechada">Fechada</span>'

            }

</p>

`;

        card.onclick = function () {

            mapa.setView(

                [biblioteca.latitude, biblioteca.longitude],

                16

            );

            marcador.openPopup();

            mostrarInformacoes(biblioteca);

        };

        lista.appendChild(card);

    });

}



// -------------------------------------
// Painel direito
// -------------------------------------

function mostrarInformacoes(biblioteca) {

    const painel = document.getElementById("info");

    painel.innerHTML = `

        <img
        src="https://cdn-icons-png.flaticon.com/512/2232/2232688.png"
        width="90">

        <h4 class="mt-3">

            ${biblioteca.nome}

        </h4>

        <hr>

        <div class="dados">

            <p>

                <i class="bi bi-geo-alt-fill"></i>

                ${biblioteca.endereco}

            </p>

            <p>

                <i class="bi bi-telephone-fill"></i>

                ${biblioteca.telefone}

            </p>

            <p>

                <i class="bi bi-clock-fill"></i>

                ${biblioteca.horario}

            </p>

            <p>

                <i class="bi bi-wifi"></i>

                ${biblioteca.wifi}

            </p>

            <p>

                <i class="bi bi-pc-display"></i>

                ${biblioteca.computadores}

            </p>

            <p>

                <i class="bi bi-book-fill"></i>

                ${biblioteca.emprestimo}

            </p>

        </div>

        <button
        class="btn btn-primary w-100 mt-3"
        onclick="comoChegar(${biblioteca.latitude},${biblioteca.longitude})">

            <i class="bi bi-sign-turn-right-fill"></i>

            Como chegar

        </button>

    `;

}

// =====================================
// PARTE 3C
// Distância, Status e Google Maps
// =====================================


// Guarda a posição do usuário
let latitudeUsuario = null;
let longitudeUsuario = null;


// --------------------------------------
// Salvar localização do usuário
// --------------------------------------

async function localizarCidade(cidade, uf) {

    try {

        const url =
            `https://nominatim.openstreetmap.org/search?city=${cidade}&state=${uf}&country=Brasil&format=json`;

        const resposta = await fetch(url);

        const dados = await resposta.json();

        if (dados.length == 0) {

            return;

        }

        latitudeUsuario = parseFloat(dados[0].lat);

        longitudeUsuario = parseFloat(dados[0].lon);

        mapa.setView(
            [latitudeUsuario, longitudeUsuario],
            13
        );

        if (marcadorUsuario) {

            mapa.removeLayer(marcadorUsuario);

        }

        marcadorUsuario = L.marker([
            latitudeUsuario,
            longitudeUsuario
        ]).addTo(mapa);

        marcadorUsuario
            .bindPopup("<b>Você está aqui</b>")
            .openPopup();

        mostrarBibliotecas();

    }

    catch (erro) {

        console.log(erro);

    }

}



// --------------------------------------
// Distância em quilômetros
// --------------------------------------

function calcularDistancia(lat1, lon1, lat2, lon2) {

    const R = 6371;

    const dLat = (lat2 - lat1) * Math.PI / 180;

    const dLon = (lon2 - lon1) * Math.PI / 180;

    const a =
        Math.sin(dLat / 2) *
        Math.sin(dLat / 2)

        +

        Math.cos(lat1 * Math.PI / 180) *

        Math.cos(lat2 * Math.PI / 180) *

        Math.sin(dLon / 2) *

        Math.sin(dLon / 2);

    const c =

        2 *

        Math.atan2(

            Math.sqrt(a),

            Math.sqrt(1 - a)

        );

    return (R * c);

}



// --------------------------------------
// Biblioteca aberta?
// --------------------------------------

function bibliotecaAberta(horario) {

    const horaAtual = new Date().getHours();

    const partes = horario.split(" às ");

    const inicio = parseInt(partes[0]);

    const fim = parseInt(partes[1]);

    return (

        horaAtual >= inicio

        &&

        horaAtual < fim

    );

}



// --------------------------------------
// Google Maps
// --------------------------------------

function comoChegar(lat, lon) {

    window.open(

        `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`,

        "_blank"

    );

}