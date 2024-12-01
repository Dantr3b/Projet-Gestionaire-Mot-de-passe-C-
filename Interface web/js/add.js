document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector(".add-form form");

    // Écouteur pour soumettre le formulaire
    form.addEventListener("submit", async (event) => {
        event.preventDefault(); // Empêche le rechargement de la page

        // Récupérer les valeurs des champs du formulaire
        const serviceName = document.getElementById("ServiceName").value.trim();
        const username = document.getElementById("username").value.trim();
        const password = document.getElementById("passwordinput").value.trim();

        // Vérifier que tous les champs sont remplis
        if (!serviceName || !username || !password) {
            if (!serviceName) {
                const serviceNameInput = document.getElementById("ServiceNameInputContainer");
                serviceNameInput.style.border = "2px solid red"; // Met une bordure rouge
            }else{
                const serviceNameInput = document.getElementById("ServiceNameInputContainer");
                serviceNameInput.style.border = "none"; // Met une bordure rouge
            }
        
            if (!username) {
                const usernameInput = document.getElementById("UsernameInputContainer");
                usernameInput.style.border = "2px solid red"; // Met une bordure rouge
            }else{
                const usernameInput = document.getElementById("UsernameInputContainer");
                usernameInput.style.border = "none"; // Met une bordure rouge
            }
        
            if (!password) {
                const passwordInput = document.getElementById("PasswordInputContainer");
                passwordInput.style.border = "2px solid red"; // Met une bordure rouge
            }else{
                const passwordInput = document.getElementById("PasswordInputContainer");
                passwordInput.style.border = "none"; // Met une bordure rouge
            }
            const alertMessage = document.getElementById("alertmessage");
            alertMessage.style.display = "flex";
            alertMessage.innerHTML = "Tous les champs sont requis !";
            
            return;
        }


        if (serviceName.length > 50) {
            const serviceNameInput = document.getElementById("ServiceNameInputContainer");
            serviceNameInput.style.border = "2px solid red"; // Met une bordure rouge
            const alertMessage = document.getElementById("alertmessage");
            alertMessage.style.display = "flex";
            alertMessage.innerHTML = "Le nom du service ne doit pas dépasser 50 caractères !";
            return;
        }

        if (username.length > 50) {
            const usernameInput = document.getElementById("UsernameInputContainer");
            usernameInput.style.border = "2px solid red"; // Met une bordure rouge
            const alertMessage = document.getElementById("alertmessage");
            alertMessage.style.display = "flex";
            alertMessage.innerHTML = "Le nom d'utilisateur ne doit pas dépasser 50 caractères !";
            return;
        }

        if (password.length > 50) {
            const passwordInput = document.getElementById("PasswordInputContainer");
            passwordInput.style.border = "2px solid red"; // Met une bordure rouge
            const alertMessage = document.getElementById("alertmessage");
            alertMessage.style.display = "flex";
            alertMessage.innerHTML = "Le mot de passe ne doit pas dépasser 50 caractères !";
            return;
        }

        if (serviceName.length < 3) {
            const serviceNameInput = document.getElementById("ServiceNameInputContainer");
            serviceNameInput.style.border = "2px solid red"; // Met une bordure rouge
            const alertMessage = document.getElementById("alertmessage");
            alertMessage.style.display = "flex";
            alertMessage.innerHTML = "Le nom du service doit contenir au moins 3 caractères !";
            return;
        }

        if (username.length < 3) {
            const usernameInput = document.getElementById("UsernameInputContainer");
            usernameInput.style.border = "2px solid red"; // Met une bordure rouge
            const alertMessage = document.getElementById("alertmessage");
            alertMessage.style.display = "flex";
            alertMessage.innerHTML = "Le nom d'utilisateur doit contenir au moins 3 caractères !";
            return;
        }

        if (password.length < 8) {
            const passwordInput = document.getElementById("PasswordInputContainer");
            passwordInput.style.border = "2px solid red"; // Met une bordure rouge
            const alertMessage = document.getElementById("alertmessage");
            alertMessage.style.display = "flex";
            alertMessage.innerHTML = "Le mot de passe doit contenir au moins 8 caractères !";
            return;
        }

        

        try {
            // Envoyer une requête POST à l'API
            const response = await fetch("https://localhost:7067/api/Passwords/add", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    serviceName: serviceName, // Correspond au paramètre attendu
                    username: username,       // Correspond au paramètre attendu
                    plainPassword: password,  // Correspond au paramètre attendu
                }),
            });
            

            // Vérifier la réponse de l'API
            if (response.ok) {
                // Change le style du bouton en succès
                submitButton.classList.add("success");
                submitButton.innerHTML = `Ajouter <img class="icon" src="assets/bx-check.svg" alt="Check Icon">`;

                // Réinitialise le formulaire après une courte attente
                setTimeout(() => {
                    form.reset();
                    submitButton.classList.remove("success");
                    submitButton.innerHTML = "Ajouter";
                }, 3000); // Revenir à l'état initial après 3 secondes
            } else {
                const error = await response.text();
                const serviceNameInput = document.getElementById("ServiceNameInputContainer");
                serviceNameInput.style.border = "2px solid red"; // Met une bordure rouge
                const alertMessage = document.getElementById("alertmessage");
                alertMessage.style.display = "flex";
                alertMessage.innerHTML = error;
            }
        } catch (error) {
            console.error("Erreur lors de l'ajout du mot de passe :", error);
            alert("Une erreur s'est produite. Veuillez réessayer.");
        }
    });

    const generateRandomPasswordButton= document.getElementById("generateRandomPassword");

    // Écouteur pour générer un mot de passe aléatoire
    generateRandomPasswordButton.addEventListener("click", () => {
        const password = generateRandomPassword(24); // Génère un mot de passe de 12 caractères
        document.getElementById("passwordinput").value = password;
    });

    const showPasswordButton = document.getElementById("show");

    // Écouteur pour afficher le mot de passe lors du clic
    showPasswordButton.addEventListener("mousedown", () => {
        const passwordInput = document.getElementById("passwordinput");
        passwordInput.type = "text"; // Affiche le mot de passe
    });

    // Écouteur pour masquer le mot de passe quand le bouton est relâché
    showPasswordButton.addEventListener("mouseup", () => {
        const passwordInput = document.getElementById("passwordinput");
        passwordInput.type = "password"; // Masque le mot de passe
    });

    // Écouteur pour gérer le cas où l'utilisateur sort du bouton avec la souris
    showPasswordButton.addEventListener("mouseleave", () => {
        const passwordInput = document.getElementById("passwordinput");
        passwordInput.type = "password"; // Masque le mot de passe
    });

    const serviceNameInput = document.getElementById("ServiceNameInputContainer");
    const usernameInput = document.getElementById("UsernameInputContainer");
    const passwordInput = document.getElementById("PasswordInputContainer");

    // Écouteur pour réinitialiser les bordures des champs du formulaire
    serviceNameInput.addEventListener("click", () => {
        serviceNameInput.style.border = "none"; // Réinitialise la bordure
    });

    usernameInput.addEventListener("click", () => {
        usernameInput.style.border = "none"; // Réinitialise la bordure
    });

    passwordInput.addEventListener("click", () => {
        passwordInput.style.border = "none"; // Réinitialise la bordure
    });

    const SafeGarage = document.getElementById("SafeGarage");

    SafeGarage.addEventListener("click", () => {
        window.location.href = "home.html";
    });

    

});

function generateRandomPassword(length) {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+[]{}|;:,.<>?";
    let password = "";

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        password += characters[randomIndex];
    }

    return password;
}