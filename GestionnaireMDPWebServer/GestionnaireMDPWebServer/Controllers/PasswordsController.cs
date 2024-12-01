using Microsoft.AspNetCore.Mvc;

namespace Gestionnaire_MDP_WEB.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PasswordsController : ControllerBase
    {
        private readonly PasswordManager _passwordManager;

        public PasswordsController()
        {
            string databasePath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData), "Gestionaire_MDP", "passwords.db");
            _passwordManager = new PasswordManager(databasePath);
        }

        [HttpPost("add")]
        public IActionResult AddPassword([FromBody]AddPasswordRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var response=_passwordManager.AddPassword(request.ServiceName, request.Username, request.PlainPassword, request.Category);
                if (response == "Le service a été ajouté ou mis à jour avec succès."){
                    return Ok(response);
                }
                else
                {
                    return BadRequest(response);
                }

            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }


        [HttpGet("multiple")]
        public IActionResult GetMultiplePasswords(string serviceName = "")
        {
            try
            {
                var passwords = _passwordManager.MultiplePasswords(serviceName);
                var result = passwords.Select(p => new
                {
                    Service = p.ServiceName,
                    Username = p.Username,
                    Password = p.DecryptedPassword
                }).ToList();

                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }



        [HttpGet("get")]
        public IActionResult GetPassword(string serviceName)
        {
            try
            {
                var password = _passwordManager.GetPassword(serviceName);
                return Ok(new
                {
                    Service = password.ServiceName,
                    Username = password.Username,
                    Password = password.DecryptedPassword
                });
            }
            catch (KeyNotFoundException)
            {
                return NotFound("Mot de passe non trouvé.");
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpDelete("delete")]
        public IActionResult DeletePassword(string serviceName)
        {
            try
            {
                var success = _passwordManager.DeletePassword(serviceName);
                if (success)
                    return Ok("Mot de passe supprimé avec succès.");
                else
                    return NotFound("Mot de passe non trouvé.");
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}
