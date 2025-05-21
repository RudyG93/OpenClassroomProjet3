let allWorks = [];

const token = localStorage.getItem('token');

const editBar = document.getElementById('edit-bar');
const authLink = document.getElementById('auth');

const modal = document.getElementById('modal');
const openModalBtn = document.getElementById('open-modal-btn');
const closeModalBtn = document.querySelector('.close-modal');
const galleryView = document.querySelector('.modal-gallery-view');
const addPhotoView = document.querySelector('.modal-add-photo-view');

fetch('http://localhost:5678/api/works')
    .then(res => res.json())
    .then(data => {
        allWorks = data;
        displayGallery(allWorks);
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

function deleteWork(id, elementToRemove) {
    fetch(`http://localhost:5678/api/works/${id}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    })
        .then(response => {
            if (!response.ok) throw new Error('Suppression échouée');
            elementToRemove.remove(); // Supprime l’élément du DOM
            allWorks = allWorks.filter(work => work.id !== id); // Mets à jour le tableau
            console.log(`Work ID ${id} supprimé avec succès`);
        })
        .catch(err => console.error('Erreur suppression :', err));
}

function loadGalleryInModal() {
    const container = document.querySelector('.gallery-preview');
    container.innerHTML = '';

    if (!Array.isArray(allWorks) || allWorks.length === 0) {
        console.warn('⚠️ Aucune donnée à afficher dans la galerie modale.');
        return;
    }

    allWorks.forEach(work => {
        const figure = document.createElement('figure');
        figure.classList.add('modal-figure');

        const img = document.createElement('img');
        img.src = work.imageUrl;
        img.alt = work.title;

        const deleteBtn = document.createElement('button');
        deleteBtn.classList.add('delete-btn');
        deleteBtn.innerHTML = '<i class="fa-solid fa-trash-can"></i>';
        deleteBtn.addEventListener('click', () => deleteWork(work.id, figure));

        figure.appendChild(img);
        figure.appendChild(deleteBtn);
        container.appendChild(figure);
    });
}

function loadCategories() {
    fetch('http://localhost:5678/api/categories')
        .then(res => res.json())
        .then(data => {
            const select = document.getElementById('category');
            select.innerHTML = '';
            data.forEach(category => {
                const option = document.createElement('option');
                option.value = category.id;
                option.textContent = category.name;
                select.appendChild(option);
            });
        });
}

if (token) {
    editBar.classList.remove('hidden');
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

openModalBtn?.addEventListener('click', () => {
    modal.classList.remove('hidden');
    loadGalleryInModal();
    loadCategories();
});

closeModalBtn?.addEventListener('click', () => {
    modal.classList.add('hidden');
});

window.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.add('hidden');
});

document.querySelector('.open-add-photo')?.addEventListener('click', () => {
    galleryView.classList.add('hidden');
    addPhotoView.classList.remove('hidden');
});

document.querySelector('.back-to-gallery')?.addEventListener('click', () => {
    addPhotoView.classList.add('hidden');
    galleryView.classList.remove('hidden');
});

const imageInput = document.getElementById('image-upload');
const imagePreview = document.getElementById('image-preview');

imageInput.addEventListener('change', () => {
    const file = imageInput.files[0];

    if (!file) {
        imagePreview.innerHTML = '';
        return;
    }

    const reader = new FileReader();

    reader.onload = function (e) {
        imagePreview.innerHTML = `<img src="${e.target.result}" alt="Aperçu image" class="preview-img">`;
    };

    reader.readAsDataURL(file);
});

function addWorkToGallery(work) {
    const gallery = document.querySelector('.gallery');

    const figure = document.createElement('figure');

    const img = document.createElement('img');
    img.src = work.imageUrl;
    img.alt = work.title;

    const caption = document.createElement('figcaption');
    caption.textContent = work.title;

    figure.appendChild(img);
    figure.appendChild(caption);

    gallery.appendChild(figure);
}

const form = document.querySelector('.add-photo-form');

form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const image = document.getElementById('image-upload').files[0];
    const title = document.getElementById('title').value.trim();
    const category = document.getElementById('category').value;

    if (!image || !title || !category) {
        alert('Veuillez remplir tous les champs.');
        return;
    }

    const formData = new FormData();
    formData.append('image', image);
    formData.append('title', title);
    formData.append('category', category);

    try {
        const response = await fetch('http://localhost:5678/api/works', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: formData
        });

        if (!response.ok) {
            throw new Error('Erreur lors de l\'ajout du projet');
        }

        const newWork = await response.json();
        console.log('✅ Nouveau projet ajouté', newWork);

        // Mets à jour la galerie principale
        addWorkToGallery(newWork);

        // Mets à jour la galerie modale
        allWorks.push(newWork);
        loadGalleryInModal();

        // Ferme la modale et reset
        modal.classList.add('hidden');
        form.reset();
        imagePreview.innerHTML = '';
    } catch (error) {
        console.error(error);
        alert("Une erreur est survenue lors de l'envoi.");
    }
});