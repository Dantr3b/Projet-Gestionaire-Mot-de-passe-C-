document.addEventListener("DOMContentLoaded", () => {
    const searchBar = document.querySelector('.search-bar input');
    const contentDiv = document.getElementById('content');
    const addButton = document.getElementById('addButton');

    // Fonction pour effectuer la requête API et afficher les résultats
    const fetchPasswords = async (query) => {
        try {
            const response = await fetch(`https://localhost:7067/api/Passwords/multiple?serviceName=${query}`);
            if (!response.ok) {
                throw new Error("Erreur lors de la récupération des données");
            }
            const passwords = await response.json();

            // Nettoyer l'ancien contenu
            contentDiv.innerHTML = '';

            if (passwords.length > 0) {
                // Créer un tableau
                const table = document.createElement('table');
                table.classList.add('password-table');

                // Ajouter l'en-tête
                table.innerHTML = `
                    <thead>
                        <tr>
                            <th>Service</th>
                            <th id="mdp">Mot de passe</th>
                            <th>Copier</th>
                            <th>Voir</th>
                            <th>Plus</th>
                        </tr>
                    </thead>
                `;

                // Ajouter les lignes dynamiquement
                const tbody = document.createElement('tbody');
                passwords.forEach(password => {
                    const row = document.createElement('tr');

                    row.innerHTML = `
                        <td id="service">${password.service}</td>
                        <td><input type="password" value="${password.password}" readonly></td>
                        <td>
                            <button class="copy-btn">
                                <img src="assets/bx-copy.svg" alt="Copier">
                            </button>
                        </td>
                        <td>
                            <button class="toggle-btn">
                                <img src="assets/bx-hide.svg" alt="Voir">
                            </button>
                        </td>
                        <td>
                            <button class="more">
                                <img src="assets/bx-chevron-right.svg" alt="view more">
                            </button>
                        </td>
                    `;
                    tbody.appendChild(row);
                });

                table.appendChild(tbody);
                contentDiv.appendChild(table);

                // Ajouter les fonctionnalités "Copier" et "Voir"
                addTableActions();
            } else {
                contentDiv.textContent = "Aucun mot de passe trouvé.";
            }
        } catch (error) {
            console.error(error);
            contentDiv.textContent = "Une erreur s'est produite lors de la récupération des données.";
        }
    };

    // Fonctionnalités des boutons "Copier" et "Voir"
    const addTableActions = () => {
        const copyButtons = document.querySelectorAll('.copy-btn');
        const toggleButtons = document.querySelectorAll('.toggle-btn');

        // Copier le mot de passe
        copyButtons.forEach((btn, index) => {
            index=index+1;
            btn.addEventListener('click', () => {
                const passwordInput = document.querySelectorAll('input[type="password"], input[type="text"]')[index];
                navigator.clipboard.writeText(passwordInput.value).then(() => {
                    const copyImg = btn.querySelector('img');
                    copyImg.src = 'assets/bx-check.svg';
                    setTimeout(() => {
                        copyImg.src = 'assets/bx-copy.svg';
                    }, 1000);
                });
            });
        });

        // Afficher/masquer le mot de passe
        toggleButtons.forEach((btn, index) => {
            index=index+1;
            btn.addEventListener('click', () => {
                const passwordInput = document.querySelectorAll('input[type="password"], input[type="text"]')[index];
                const type = passwordInput.type === 'password' ? 'text' : 'password';
                passwordInput.type = type;
                const toggleImg = btn.querySelector('img');
                if (type === 'password') {
                    toggleImg.src = 'assets/bx-hide.svg';
                } else {
                    toggleImg.src = 'assets/bxs-show.svg';
                }
            });
        });

        // Redirection vers la page de détails
        const moreButtons = document.querySelectorAll('.more');

        moreButtons.forEach((btn, index) => {
        btn.addEventListener('click', () => {
            // Sélectionne tous les éléments <td> avec id="service"
            const ServiceNameInput = document.querySelectorAll('td[id=service]')[index];

            // Utilisez textContent pour obtenir le texte à l'intérieur de la cellule
            const serviceName = ServiceNameInput.textContent.trim();

            // Redirection vers la page de détails avec le service dans l'URL
            window.location.href = `password-details.html?service=${encodeURIComponent(serviceName)}`;
        });
});

    };

    // Ajouter un écouteur pour les recherches
    searchBar.addEventListener('input', (event) => {
        const query = event.target.value.trim();
        fetchPasswords(query);
    });

    // Redirection au clic sur le bouton d'ajout
    addButton.addEventListener('click', () => {
        window.location.href = 'add.html';
    });

    // Chargement initial
    fetchPasswords('');
});
