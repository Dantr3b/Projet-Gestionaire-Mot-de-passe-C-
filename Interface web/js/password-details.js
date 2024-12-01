document.addEventListener("DOMContentLoaded", async () => {
    const params = new URLSearchParams(window.location.search);
    const serviceName = params.get("service");
    console.log(serviceName);

    if (serviceName) {
        const response = await fetch(`https://localhost:7067/api/Passwords/get?serviceName=${encodeURIComponent(serviceName)}`);
        if (response.ok) {
            const details = await response.json();
            const ServiceName = document.getElementById('ServiceName');
            const usernameInput = document.getElementById('username');
            const passwordInput = document.getElementById('password');
            

            const serviceElement = document.createElement('p');
            serviceElement.id = 'service';
            serviceElement.textContent = `${details.service}`;

            usernameInput.value = details.username;
            passwordInput.value = details.password;

            ServiceName.appendChild(serviceElement);
            
            

        } else {
            document.getElementById('details-container').textContent = "Impossible de récupérer les détails.";
        }
    } else {
        document.getElementById('details-container').textContent = "Aucun service spécifié.";
    }

    // Copier le nom d'utilisateur
    document.getElementById("copyUsername").addEventListener("click", () => {
        const usernameInput = document.getElementById("username");
        navigator.clipboard.writeText(usernameInput.value).then(() => {
            const copyImg = document.getElementById("copyUsername").querySelector('img');
                    copyImg.src = 'assets/bx-check.svg';
                    setTimeout(() => {
                        copyImg.src = 'assets/bx-copy.svg';
                    }, 1000);
        });
    });

    // Afficher/Masquer le mot de passe
    const togglePasswordButton = document.getElementById("togglePassword");
    const passwordInput = document.getElementById("password");

    togglePasswordButton.addEventListener("click", () => {
        if (passwordInput.type === "password") {
            passwordInput.type = "text";
            togglePasswordButton.querySelector("img").src = "assets/bxs-show.svg"; // Icône pour "masquer"
        } else {
            passwordInput.type = "password";
            togglePasswordButton.querySelector("img").src = "assets/bx-hide.svg"; // Icône pour "voir"
        }
    });

    // Copier le mot de passe
    document.getElementById("copyPassword").addEventListener("click", () => {
        navigator.clipboard.writeText(passwordInput.value).then(() => {
            const copyImg = document.getElementById("copyPassword").querySelector('img');
                    copyImg.src = 'assets/bx-check.svg';
                    setTimeout(() => {
                        copyImg.src = 'assets/bx-copy.svg';
                    }, 1000);
        });
    });
    
    const SafeGarage = document.getElementById("SafeGarage");

    SafeGarage.addEventListener("click", () => {
        window.location.href = "home.html";
    });

});

function supr(){
    var ServiceName=document.getElementById("service").innerHTML;
    
    fetch(`https://localhost:7067/api/Passwords/delete?serviceName=${encodeURIComponent(ServiceName)}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json"
        }
    }).then(() => {
        window.location.href = "home.html";
    });

}