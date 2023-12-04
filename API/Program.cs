using API.Data;
using API.Entities;
using API.Extensions;
using API.Middleware;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
builder.Services.AddApplicationServices(builder.Configuration);
builder.Services.AddIdentityServices(builder.Configuration);

builder.Services.AddDbContext<DataContext>(opt =>
{
    // opt.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"));
    opt.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"),
        sqlServerOptionsAction: sqlOptions =>
        {
            sqlOptions.EnableRetryOnFailure(
                maxRetryCount: 3,
                maxRetryDelay: TimeSpan.FromSeconds(2),
                errorNumbersToAdd: null
            );
        }
    );
    

},ServiceLifetime.Scoped);

var app = builder.Build();

// Configure the HTTP request pipeline.

app.UseMiddleware<ExceptionMiddleware>();

app.UseCors(builder => builder.AllowAnyHeader().AllowAnyMethod().WithOrigins("http://localhost:4200"));

app.UseAuthentication();
app.UseAuthorization();

bool serving = false;

if (serving)
{
    app.UseDefaultFiles();
    app.UseStaticFiles();
}

app.MapControllers();

if (serving)
{
    app.MapFallbackToController("Index", "Fallback");
}

using var scope = app.Services.CreateScope();
var services = scope.ServiceProvider;

//if development
if (app.Environment.IsDevelopment())
{
    try
    {
        var context = services.GetRequiredService<DataContext>();
        await context.Database.MigrateAsync();
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occured during migration");
    }
}
try
{
    var context = services.GetRequiredService<DataContext>();
    await Seed.SeedUsers(services.GetRequiredService<UserManager<AppUser>>(),
        services.GetRequiredService<RoleManager<AppRole>>());
;
    if (app.Environment.IsDevelopment()) {
    }
}
catch (Exception ex)
{
    var logger = services.GetRequiredService<ILogger<Program>>();
    Console.WriteLine("======================================================================");
    logger.LogError(ex, "An error occured during migration");
}

app.Run();