using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authentication.Negotiate;
using Microsoft.OpenApi;
using Scalar.AspNetCore;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

// Authentifizierungstyp aus Konfiguration lesen
var authType = builder.Configuration.GetValue<string>("Authentication:Type", "None");

// Authentifizierung basierend auf Konfiguration hinzuf�gen
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

// CORS konfigurieren f�r UI5 App
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

// JSON-Serializer f�r camelCase konfigurieren
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });

// Konfiguration f�r API-Dokumentation lesen - aktuell wird nur Scalar verwendet
var useScalar = builder.Configuration.GetValue<bool>("ApiDocumentation:UseScalar", true);
var useSwagger = builder.Configuration.GetValue<bool>("ApiDocumentation:UseSwagger", true);

// OpenAPI mit Security Definition konfigurieren
if (builder.Environment.IsDevelopment())
{
    builder.Services.AddOpenApi(options =>
    {
        options.AddDocumentTransformer((document, context, cancellationToken) =>
        {
            document.Components ??= new OpenApiComponents();
            document.Components.SecuritySchemes ??= new Dictionary<string, IOpenApiSecurityScheme>();

            document.Components.SecuritySchemes.Add("windows", new OpenApiSecurityScheme
            {
                Type = SecuritySchemeType.Http,
                Scheme = "negotiate",
                Description = "Windows Authentication"
            });

            return Task.CompletedTask;
        });

        options.AddOperationTransformer((operation, context, cancellationToken) =>
        {
            operation.Security ??= [];
            operation.Security.Add(new OpenApiSecurityRequirement
            {
                [new OpenApiSecuritySchemeReference("windows")] = []
            });

            return Task.CompletedTask;
        });
    });
}

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference(options =>
    {
        options.WithTitle("UI Sample API");
    });
}

app.UseForwardedHeaders();

app.UseCors();

app.UseRateLimiter();

app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
