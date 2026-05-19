// Configuración global de la API
const API_URL = '/api/cartelera';

// JSON de respaldo por si la API se cae o tiene problemas de CORS en entorno local
const FALLBACK_DATA = [
    { "imdbID": "231035", "Title": "Violet Evergarden Movie", "Year": "2020", "Type": "Drama", "Poster": "https://cdn.myanimelist.net/images/anime/1825/110716.jpg", "description": "Han pasado varios años desde el final de la Primera Guerra Mundial...", "Ubication": "POPCINEMA", "Estado": false, "Fec_Registro": "2025-08-29T23:39:05.023Z" },
    { "imdbID": "29082025", "Title": "Rápido y furioso", "Year": "2001", "Type": "Accion", "Poster": "https://hips.hearstapps.com/hmg-prod/images/fast-and-furious-1-1564933929.jpg?crop=1xw:1xh;center,top&resize=980:*", "description": "Una misteriosa banda de delincuentes se dedica a robar camiones...", "Ubication": "Guastatoya", "Estado": true, "Fec_Registro": "2025-08-29T23:00:29.773Z" },
    { "imdbID": "50", "Title": "Kingsman", "Year": "2014", "Type": "Acción", "Poster": "https://th.bing.com/th/id/R.65787ae015b3f841c132ebce37f68c7c?rik=3OLjiaJ2GIinQw&pid=ImgRaw&r=0", "description": "Cuando un agente secreto de Kingsman muere...", "Ubication": "POPCINEMA", "Estado": false, "Fec_Registro": "2025-08-29T21:12:22.900Z" },
    { "imdbID": "54", "Title": "50 SOMBRAS DE GREY", "Year": "2015", "Type": "MAYORES 18", "Poster": "https://es.web.img3.acsta.net/pictures/14/11/14/11/16/546987.jpg", "description": "PASION INTENSA GG", "Ubication": "GUASTATOYA", "Estado": true, "Fec_Registro": "2025-08-30T09:52:51.980Z" }
];

let movies = [];

// Elementos del DOM
const container = document.getElementById('movies-container');
const emptyState = document.getElementById('empty-state');
const searchInput = document.getElementById('search-input');
const genreSelect = document.getElementById('genre-select');
const locationSelect = document.getElementById('location-select');
const modal = document.getElementById('movie-modal');
const modalContent = document.getElementById('modal-content');
const closeModalBtn = document.getElementById('close-modal');

// Inicialización de la App
document.addEventListener('DOMContentLoaded', () => {
    fetchMovies();
    setupEventListeners();
});

// Event Listeners para filtrado reactivo al instante
function setupEventListeners() {
    searchInput.addEventListener('input', applyFilters);
    genreSelect.addEventListener('change', applyFilters);
    locationSelect.addEventListener('change', applyFilters);
    
    // Cerrar modal
    closeModalBtn.addEventListener('click', toggleModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) toggleModal();
    });
}

// 1. EXTRA DE CALIDAD: Skeleton Loader mientras conecta con la API externa
function showSkeletons() {
    container.innerHTML = Array(4).fill(0).map(() => `
        <div class="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden animate-pulse">
            <div class="bg-gray-800 h-72 w-full"></div>
            <div class="p-4 space-y-3">
                <div class="bg-gray-800 h-6 rounded w-3/4"></div>
                <div class="bg-gray-800 h-4 rounded w-1/2"></div>
                <div class="bg-gray-800 h-12 rounded w-full"></div>
            </div>
        </div>
    `).join('');
}

// 2. OPTIMIZACIÓN: Petición asíncrona robusta con manejo de fallos
async function fetchMovies() {
    showSkeletons();
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Error al conectar con el servidor.');
        movies = await response.json();
    } catch (error) {
        console.warn('Usando JSON de respaldo debido a restricciones CORS o caída del servidor:', error.message);
        movies = FALLBACK_DATA; // Fallback inteligente para asegurar la UX
    }
    
    populateFilters(movies);
    renderMovies(movies);
}

// 3. INNOVACIÓN: Generar dinámicamente las opciones de los select basados en la data real
function populateFilters(data) {
    // Normalizamos para evitar duplicados por mayúsculas/minúsculas
    const genres = [...new Set(data.map(m => m.Type.trim()))];
    const locations = [...new Set(data.map(m => m.Ubication.trim().toUpperCase()))];

    genres.forEach(genre => {
        genreSelect.innerHTML += `<option value="${genre}">${genre}</option>`;
    });

    locations.forEach(loc => {
        locationSelect.innerHTML += `<option value="${loc}">${loc}</option>`;
    });
}

// 4. CALIDAD Y RENDERIZADO: Crear las tarjetas con estados visuales condicionales
function renderMovies(data) {
    container.innerHTML = '';
    
    if (data.length === 0) {
        emptyState.classList.remove('hidden');
        return;
    }
    emptyState.classList.add('hidden');

    data.forEach(movie => {
        // Tag dinámico según el booleano 'Estado'
        const badgeColor = movie.Estado ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20';
        const badgeText = movie.Estado ? '<i class="fa-solid fa-ticket mr-1"></i> Disponible' : '<i class="fa-solid fa-clock mr-1"></i> Próximamente';

        const card = document.createElement('div');
        card.className = 'bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-2xl overflow-hidden group shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col cursor-pointer transform hover:-translate-y-1';
        
        // Manejo optimizado de imágenes rotas o por defecto
        const posterUrl = movie.Poster || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=500';

        card.innerHTML = `
            <div class="relative overflow-hidden aspect-[2/3] bg-gray-950">
                <img src="${posterUrl}" alt="${movie.Title}" loading="lazy" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                <span class="absolute top-3 right-3 text-xs font-semibold px-2.5 py-1 rounded-md border backdrop-blur-md ${badgeColor}">
                    ${badgeText}
                </span>
            </div>
            <div class="p-4 flex flex-col flex-grow justify-between">
                <div>
                    <div class="flex items-center gap-2 text-xs text-gray-400 mb-1">
                        <span class="bg-gray-800 px-2 py-0.5 rounded">${movie.Year}</span>
                        <span>•</span>
                        <span>${movie.Type}</span>
                    </div>
                    <h3 class="font-bold text-base text-gray-100 group-hover:text-red-400 transition-colors line-clamp-1">${movie.Title}</h3>
                    <p class="text-xs text-gray-400 mt-2 line-clamp-3">${movie.description || 'Sin descripción disponible.'}</p>
                </div>
                <div class="mt-4 pt-3 border-t border-gray-800/60 flex items-center justify-between text-xs text-gray-500">
                    <span><i class="fa-solid fa-location-dot text-red-500/70 mr-1"></i> ${movie.Ubication}</span>
                </div>
            </div>
        `;
        
        // Evento para abrir detalles de la película de forma innovadora
        card.addEventListener('click', () => openMovieDetails(movie));
        container.appendChild(card);
    });
}

// 5. INNOVACIÓN: Filtros multidimensionales simultáneos
function applyFilters() {
    const textSearch = searchInput.value.toLowerCase().trim();
    const selectedGenre = genreSelect.value;
    const selectedLocation = locationSelect.value.toUpperCase();

    const filtered = movies.filter(movie => {
        const matchesText = movie.Title.toLowerCase().includes(textSearch);
        const matchesGenre = selectedGenre === "" || movie.Type.trim() === selectedGenre;
        const matchesLocation = selectedLocation === "" || movie.Ubication.trim().toUpperCase() === selectedLocation;

        return matchesText && matchesGenre && matchesLocation;
    });

    renderMovies(filtered);
}

// 6. EXTRA: Detalle en Modal interactivo sin recargar página
function openMovieDetails(movie) {
    const statusText = movie.Estado ? 'Disponible hoy en taquilla' : 'Próximo estreno en esta ubicación';
    const statusColor = movie.Estado ? 'text-green-400' : 'text-amber-400';

    modalContent.innerHTML = `
        <div class="md:flex">
            <div class="md:w-1/3 bg-gray-950 aspect-[2/3] md:aspect-auto">
                <img src="${movie.Poster}" alt="${movie.Title}" class="w-full h-full object-cover">
            </div>
            <div class="p-6 md:w-2/3 flex flex-col justify-between">
                <div>
                    <span class="text-xs font-semibold tracking-wider text-red-400 uppercase">${movie.Type}</span>
                    <h2 class="text-2xl font-black text-white mt-1">${movie.Title}</h2>
                    <p class="text-sm text-gray-400 mt-1">${movie.Year} — ID: ${movie.imdbID}</p>
                    
                    <h4 class="text-xs font-bold uppercase text-gray-500 mt-6 tracking-wide">Sinopsis</h4>
                    <p class="text-sm text-gray-300 mt-1 leading-relaxed">${movie.description || 'No hay sinopsis disponible actualmente.'}</p>
                </div>
                
                <div class="mt-6 pt-4 border-t border-gray-800 grid grid-cols-2 gap-4">
                    <div>
                        <span class="block text-[10px] uppercase font-bold text-gray-500">Ubicación</span>
                        <span class="text-sm font-medium text-gray-200"><i class="fa-solid fa-location-dot text-red-500 mr-1"></i> ${movie.Ubication}</span>
                    </div>
                    <div>
                        <span class="block text-[10px] uppercase font-bold text-gray-500">Disponibilidad</span>
                        <span class="text-sm font-medium ${statusColor}">${statusText}</span>
                    </div>
                </div>
            </div>
        </div>
    `;
    toggleModal();
}

function toggleModal() {
    const isOpened = !modal.classList.contains('pointer-events-none');
    if (isOpened) {
        modal.classList.add('opacity-0', 'pointer-events-none');
        modal.firstElementChild.classList.add('scale-95');
        modal.firstElementChild.classList.remove('scale-100');
    } else {
        modal.classList.remove('opacity-0', 'pointer-events-none');
        modal.firstElementChild.classList.remove('scale-95');
        modal.firstElementChild.classList.add('scale-100');
    }
}