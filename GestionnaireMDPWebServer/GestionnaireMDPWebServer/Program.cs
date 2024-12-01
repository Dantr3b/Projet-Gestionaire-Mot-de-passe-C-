using Microsoft.AspNetCore.Diagnostics;

var builder = WebApplication.CreateBuilder(args);

// Ajouter les services n�cessaires
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Ajouter CORS (Autoriser des origines sp�cifiques)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowSpecificOrigin", policy =>
    {
        policy.WithOrigins("http://127.0.0.1:3000") // Remplacez par l'origine de votre front-end
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// Ajouter la gestion des exceptions globales et le logging
builder.Services.AddLogging(logging =>
{
    logging.ClearProviders();
    logging.AddConsole();
    logging.AddDebug();
});

var app = builder.Build();

// Activer Swagger uniquement en mode d�veloppement
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Gestion des erreurs globales (middleware personnalis�)
app.UseExceptionHandler(errorApp =>
{
    errorApp.Run(async context =>
    {
        context.Response.StatusCode = 500;
        context.Response.ContentType = "application/json";

        var error = context.Features.Get<IExceptionHandlerFeature>();
        if (error != null)
        {
            var logger = context.RequestServices.GetRequiredService<ILogger<Program>>();
            logger.LogError(error.Error, "Une erreur non g�r�e s'est produite");

            var result = System.Text.Json.JsonSerializer.Serialize(new
            {
                message = "Une erreur s'est produite sur le serveur. Veuillez r�essayer plus tard."
            });
            await context.Response.WriteAsync(result);
        }
    });
});

// Utiliser CORS
app.UseCors("AllowSpecificOrigin");

// Ajouter middleware pour routage et contr�leurs
app.UseRouting();
app.UseAuthorization();

// Configurer les routes pour les contr�leurs
app.MapControllers();

app.Run();
