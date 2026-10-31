using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authentication.Negotiate;
using Scalar.AspNetCore;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

// Authentifizierungstyp aus Konfiguration lesen
var authType = builder.Configuration.GetValue<string>("Authentication:Type", "None");

// Authentifizierung basierend auf Konfiguration hinzufügen
switch (authType.ToLowerInvariant())
{
    case "windows":
        builder.Services.AddAuthentication(NegotiateDefaults.AuthenticationScheme)
            .AddNegotiate();
        break;

    case "bearer":
    case "jwt":
        builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(options =>
            {
                options.Authority = builder.Configuration.GetValue<string>("Authentication:Authority");
                options.Audience = builder.Configuration.GetValue<string>("Authentication:Audience");
                options.RequireHttpsMetadata = builder.Environment.IsProduction();
            });
        break;

    case "none":
    default:
        // Keine Authentifizierung
        break;
}

builder.Services.AddAuthorization();

// CORS konfigurieren
var allowedOrigins = new[]
{
    "http://localhost:8080",   // UI5
    "http://localhost:4200",   // Angular
    "http://localhost:5173",   // React/Vite
    "http://localhost:5174",   // Vue dev (alternate port)
    "http://localhost:3001",   // Vue dev
    "http://localhost:4174"    // Vue preview
}.Concat(builder.Configuration.GetSection("Cors:Origins").Get<string[]>() ?? []).ToArray();

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins(allowedOrigins)
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials();
    });
});

// Rate limiting pro Client-IP
var permitLimit = builder.Configuration.GetValue("RateLimiting:PermitLimit", 60);
var windowSeconds = builder.Configuration.GetValue("RateLimiting:WindowSeconds", 60);

builder.Services.Configure<Microsoft.AspNetCore.Builder.ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders = Microsoft.AspNetCore.HttpOverrides.ForwardedHeaders.XForwardedFor
        | Microsoft.AspNetCore.HttpOverrides.ForwardedHeaders.XForwardedProto;
    options.KnownNetworks.Clear();
    options.KnownProxies.Clear();
});

builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    options.GlobalLimiter = System.Threading.RateLimiting.PartitionedRateLimiter.Create<HttpContext, string>(context =>
        System.Threading.RateLimiting.RateLimitPartition.GetFixedWindowLimiter(
            context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            _ => new System.Threading.RateLimiting.FixedWindowRateLimiterOptions
            {
                PermitLimit = permitLimit,
                Window = TimeSpan.FromSeconds(windowSeconds),
                QueueLimit = 0
            }));
});

// Explizit das Shared Assembly für Controller-Discovery hinzufügen
builder.Services.AddControllers()
    .AddApplicationPart(assembly: typeof(UI_Sample_API.WeatherForecast).Assembly)
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });

// Konfiguration für API-Dokumentation lesen
var useScalar = builder.Configuration.GetValue<bool>("ApiDocumentation:UseScalar", true);
var useSwagger = builder.Configuration.GetValue<bool>("ApiDocumentation:UseSwagger", false);

// Swagger/OpenAPI für .NET 8
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo
    {
        Title = "UI Sample API (.NET 8)",
        Version = "v1"
    });

    // Security Definition basierend auf Auth-Typ
    switch (authType.ToLowerInvariant())
    {
        case "windows":
            options.AddSecurityDefinition("windows", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Type = Microsoft.OpenApi.Models.SecuritySchemeType.Http,
                Scheme = "negotiate",
                Description = "Windows Authentication"
            });
            options.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
            {
                {
                    new Microsoft.OpenApi.Models.OpenApiSecurityScheme
                    {
                        Reference = new Microsoft.OpenApi.Models.OpenApiReference
                        {
                            Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                            Id = "windows"
                        }
                    },
                    Array.Empty<string>()
                }
            });
            break;

        case "bearer":
        case "jwt":
            options.AddSecurityDefinition("bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Type = Microsoft.OpenApi.Models.SecuritySchemeType.Http,
                Scheme = "bearer",
                BearerFormat = "JWT",
                Description = "JWT Bearer Token Authentication"
            });
            options.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
            {
                {
                    new Microsoft.OpenApi.Models.OpenApiSecurityScheme
                    {
                        Reference = new Microsoft.OpenApi.Models.OpenApiReference
                        {
                            Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                            Id = "bearer"
                        }
                    },
                    Array.Empty<string>()
                }
            });
            break;
    }
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    
    if (useSwagger)
    {
        app.UseSwaggerUI(options =>
        {
            options.SwaggerEndpoint("/swagger/v1/swagger.json", "UI Sample API v1");
            options.RoutePrefix = "swagger";
        });
    }
    
    if (useScalar)
    {
        app.MapScalarApiReference(options =>
        {
            options
                .WithTitle("UI Sample API (.NET 8)")
                .WithTheme(ScalarTheme.Purple)
                .WithDefaultHttpClient(ScalarTarget.CSharp, ScalarClient.HttpClient)
                .WithOpenApiRoutePattern("/swagger/v1/swagger.json");
        });
    }

    app.MapGet("/", () => Results.Json(new
    {
        message = "UI Sample API is running (.NET 8)",
        authentication = new
        {
            type = authType,
            enabled = authType.ToLowerInvariant() != "none"
        },
        documentation = new
        {
            swagger = new { url = useSwagger ? "/swagger" : (string?)null, enabled = useSwagger },
            scalar = new { url = useScalar ? "/scalar/v1" : (string?)null, enabled = useScalar }
        },
        endpoints = new[] { "/WeatherForecast", "/TaskList", "/SunriseSunset" }
    }))
    .ExcludeFromDescription();
}

app.UseForwardedHeaders();

app.UseCors();

app.UseRateLimiter();
app.UseHttpsRedirection();

// Authentication/Authorization nur verwenden wenn aktiviert
if (authType.ToLowerInvariant() != "none")
{
    app.UseAuthentication();
    app.UseAuthorization();
}

app.MapControllers();

app.Run();
