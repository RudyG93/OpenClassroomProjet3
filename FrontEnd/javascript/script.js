let allWorks = [];

fetch('http://localhost:5678/api/works')
    .then(res => res.json())
    .then(data => {
        console.log(data);
        allWorks = data;
        displayGallery(data);
    })
    .catch(error => console.error('Erreur lors de la récupération des données :', error));

fetch('http://localhost:5678/api/categories')
    .then(res => res.json())
    .then(categories => {
        generateCategoryMenu(categories);
    });

function displayGallery(works) {
    const gallery = document.querySelector('.gallery');
    gallery.innerHTML = '';

    works.forEach(work => {
        const figure = document.createElement('figure');

        const img = document.createElement('img');
        img.src = work.imageUrl;
        img.alt = work.title;

        const figcaption = document.createElement('figcaption');
        figcaption.textContent = work.title;

        figure.appendChild(img);
        figure.appendChild(figcaption);
        gallery.appendChild(figure);
    });
}

function generateCategoryMenu(categories) {
    const menu = document.querySelector('.category-menu');

    const allBtn = document.createElement('button');
    allBtn.textContent = 'Tous';
    allBtn.classList.add('active');
    allBtn.addEventListener('click', () => {
        document.querySelectorAll('.category-menu button').forEach(b => b.classList.remove('active'));
        allBtn.classList.add('active');
        displayGallery(allWorks);
    });
    menu.appendChild(allBtn);

    categories.forEach(category => {
        const btn = document.createElement('button');
        btn.textContent = category.name;
        btn.addEventListener('click', () => {
            document.querySelectorAll('.category-menu button').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const filteredWorks = allWorks.filter(work => work.category.id === category.id);
            displayGallery(filteredWorks);
        });
        menu.appendChild(btn);
    });
}

const authLink = document.getElementById('auth');
const token = localStorage.getItem('token');

if (token) {
    authLink.textContent = 'logout';
    authLink.style.cursor = 'pointer';

    authLink.addEventListener('click', () => {
        localStorage.removeItem('token');
        window.location.reload();
    });
} else {
    authLink.textContent = 'login';
    authLink.style.cursor = 'pointer';

    authLink.addEventListener('click', () => {
        window.location.href = 'login.html';
    });
}