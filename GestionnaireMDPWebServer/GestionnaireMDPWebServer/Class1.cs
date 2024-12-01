using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Data.SQLite;
using System.ComponentModel.DataAnnotations;
using System.Data.SqlClient;

namespace Gestionnaire_MDP_WEB
{

    public class PasswordManager
    {
        private Dictionary<string, Password> passwords;
        private readonly DatabaseStorage databaseStorage;

        public PasswordManager(string databasePath)
        {
            databaseStorage = new DatabaseStorage(databasePath);
            passwords = databaseStorage.LoadFromDatabase();
        }

        public List<Password> MultiplePasswords(string serviceName)
        {
            if (string.IsNullOrWhiteSpace(serviceName))
            {
                var passwords = databaseStorage.GetLastPasswords(5);
                if (passwords != null)
                {
                    foreach (var password in passwords)
                    {
                        password.DecryptedPassword = EncryptionHelper.Decrypt(password.EncryptedPassword);
                    }
                    return passwords;
                }
                throw new KeyNotFoundException("Aucun mot de passe trouvé");

            }
            else
            {
                // Retourne tous les mots de passe dont le nom du service commence par "serviceName"
                var passwords = databaseStorage.GetPasswordsByServiceNamePrefix(serviceName);
                if (passwords != null)
                {
                    foreach (var password in passwords)
                    {
                        password.DecryptedPassword = EncryptionHelper.Decrypt(password.EncryptedPassword);
                    }
                    return passwords;
                }

                throw new KeyNotFoundException($"Aucun mot de passe trouvé pour le service : {serviceName}");
                
            }
        }

        public string AddPassword(string serviceName, string username, string plainPassword, int category)
        {

            var encryptedPassword = EncryptionHelper.Encrypt(plainPassword);
            var password = new Password
            {
                ServiceName = serviceName,
                Username = username,
                EncryptedPassword = encryptedPassword,
                Category = category
            };
            return databaseStorage.SaveToDatabase(password);
        }

        public Password GetPassword(string serviceName)
        {

                var password = databaseStorage.GetPasswordFromDatabase(serviceName);
                if (password != null)
                {
                    password.DecryptedPassword = EncryptionHelper.Decrypt(password.EncryptedPassword);
                    return password;
                }
                throw new KeyNotFoundException($"Aucun mot de passe trouvé pour le service : {serviceName}");
        }

        public bool DeletePassword(string serviceName)
        {
            return databaseStorage.DeletePasswordFromDatabase(serviceName);
        }
    }

    public class DatabaseStorage
    {
        private readonly string _connectionString;

        public DatabaseStorage(string databasePath)
        {
            _connectionString = $"Data Source={databasePath};Version=3;";
            InitializeDatabase();
        }

        private void InitializeDatabase()
        {
            using var connection = new SQLiteConnection(_connectionString);
            connection.Open();

            string createTableQuery = @"
                CREATE TABLE IF NOT EXISTS Passwords (
                    ServiceName TEXT PRIMARY KEY,
                    Username TEXT NOT NULL,
                    EncryptedPassword TEXT NOT NULL,
                    Category TEXT
                );";
            using var command = new SQLiteCommand(createTableQuery, connection);
            command.ExecuteNonQuery();
        }

        public string SaveToDatabase(Password password)
        {
            using var connection = new SQLiteConnection(_connectionString);
            connection.Open();

            // Vérifier la présence du Service dans la Database
            string testQuery = @"SELECT COUNT(1) FROM Passwords WHERE ServiceName = @ServiceName";

            try
            {
                using (var commandTest = new SQLiteCommand(testQuery, connection))
                {
                    // Ajouter le paramètre pour éviter les injections SQL
                    commandTest.Parameters.AddWithValue("@ServiceName", password.ServiceName);

                    // Exécuter la requête
                    int count = Convert.ToInt32(commandTest.ExecuteScalar());

                    if (count > 0)
                    {
                        return ("Sevice Deja Existant");
                    }
                    else
                    {
                        // Insérer ou mettre à jour l'enregistrement
                        string insertQuery = @"
                INSERT INTO Passwords (ServiceName, Username, EncryptedPassword)
                VALUES (@ServiceName, @Username, @EncryptedPassword, @Category)
                ON CONFLICT(ServiceName) DO UPDATE SET
                    Username = excluded.Username,
                    EncryptedPassword = excluded.EncryptedPassword;";

                        using (var commandInsert = new SQLiteCommand(insertQuery, connection))
                        {
                            // Ajouter les paramètres pour l'insertion/mise à jour
                            commandInsert.Parameters.AddWithValue("@ServiceName", password.ServiceName);
                            commandInsert.Parameters.AddWithValue("@Username", password.Username);
                            commandInsert.Parameters.AddWithValue("@EncryptedPassword", password.EncryptedPassword);
                            commandInsert.Parameters.AddWithValue("@Category", password.Category);

                            // Exécuter la commande
                            commandInsert.ExecuteNonQuery();

                            return ("Le service a été ajouté ou mis à jour avec succès.");
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                return("Une erreur s'est produite : " + ex.Message);
            }

        }

        public Dictionary<string, Password> LoadFromDatabase()
        {
            var passwords = new Dictionary<string, Password>();

            using var connection = new SQLiteConnection(_connectionString);
            connection.Open();

            string selectQuery = "SELECT ServiceName, Username, EncryptedPassword FROM Passwords;";
            using var command = new SQLiteCommand(selectQuery, connection);
            using var reader = command.ExecuteReader();
            while (reader.Read())
            {
                passwords[reader.GetString(0)] = new Password
                {
                    ServiceName = reader.GetString(0),
                    Username = reader.GetString(1),
                    EncryptedPassword = reader.GetString(2)
                };
            }

            return passwords;
        }

        public List<Password> GetLastPasswords(int limit)
        {
            var passwords = new List<Password>();

            using var connection = new SQLiteConnection(_connectionString);
            connection.Open();

            string query = $@"
                SELECT ServiceName, Username, EncryptedPassword
                FROM Passwords
                ORDER BY ROWID DESC
                LIMIT @Limit;";
            using var command = new SQLiteCommand(query, connection);
            command.Parameters.AddWithValue("@Limit", limit);

            using var reader = command.ExecuteReader();
            while (reader.Read())
            {
                passwords.Add(new Password
                {
                    ServiceName = reader.GetString(0),
                    Username = reader.GetString(1),
                    EncryptedPassword = reader.GetString(2)
                });
            }

            return passwords;
        }

        public List<Password> GetPasswordsByServiceNamePrefix(string prefix)
        {
            var passwords = new List<Password>();

            using var connection = new SQLiteConnection(_connectionString);
            connection.Open();

            string query = @"
                SELECT ServiceName, Username, EncryptedPassword
                FROM Passwords
                WHERE ServiceName LIKE @Prefix || '%';";
            using var command = new SQLiteCommand(query, connection);
            command.Parameters.AddWithValue("@Prefix", prefix);

            using var reader = command.ExecuteReader();
            while (reader.Read())
            {
                passwords.Add(new Password
                {
                    ServiceName = reader.GetString(0),
                    Username = reader.GetString(1),
                    EncryptedPassword = reader.GetString(2)
                });
            }

            return passwords;
        }


        public Password GetPasswordFromDatabase(string serviceName)
        {
            using var connection = new SQLiteConnection(_connectionString);
            connection.Open();

            string selectQuery = "SELECT ServiceName, Username, EncryptedPassword FROM Passwords WHERE ServiceName = @ServiceName;";
            using var command = new SQLiteCommand(selectQuery, connection);
            command.Parameters.AddWithValue("@ServiceName", serviceName);
            using var reader = command.ExecuteReader();
            if (reader.Read())
            {
                return new Password
                {
                    ServiceName = reader.GetString(0),
                    Username = reader.GetString(1),
                    EncryptedPassword = reader.GetString(2)
                };
            }
            return null;
        }

        public bool DeletePasswordFromDatabase(string serviceName)
        {
            using var connection = new SQLiteConnection(_connectionString);
            connection.Open();

            string deleteQuery = "DELETE FROM Passwords WHERE ServiceName = @ServiceName;";
            using var command = new SQLiteCommand(deleteQuery, connection);
            command.Parameters.AddWithValue("@ServiceName", serviceName);
            return command.ExecuteNonQuery() > 0;
        }
    }

    public static class EncryptionHelper
    {
        public static string Encrypt(string plainText)
        {
            return Convert.ToBase64String(System.Text.Encoding.UTF8.GetBytes(plainText));
        }

        public static string Decrypt(string encryptedText)
        {
            return System.Text.Encoding.UTF8.GetString(Convert.FromBase64String(encryptedText));
        }
    }

    public class Password
    {
        public string ServiceName { get; set; }
        public string Username { get; set; }
        public string EncryptedPassword { get; set; }
        public string DecryptedPassword { get; set; }
        public int Category { get; set; }
    }

    public class AddPasswordRequest
    {
        [Required]
        public string ServiceName { get; set; }

        [Required]
        public string Username { get; set; }

        [Required]
        public string PlainPassword { get; set; }
    }

    //public class Program
    //{
    //    static void Main(string[] args)
    //    {
    //        string databasePath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData), "Gestionaire_MDP", "passwords.db");

    //        var passwordManager = new PasswordManager(databasePath);

    //        passwordManager.AddPassword("Gmail", "user123", "password123");
    //        passwordManager.AddPassword("Facebook", "user456", "securePass456");

    //        try
    //        {
    //            Console.WriteLine(passwordManager.GetPassword("Gmail").DecryptedPassword);
    //        }
    //        catch (Exception e)
    //        {
    //            Console.WriteLine(e.Message);
    //        }

    //        Console.WriteLine(passwordManager.DeletePassword("Gmail")); // Affiche : True
    //        Console.WriteLine(passwordManager.DeletePassword("Twitter")); // Affiche : False
    //    }
    //}
}
