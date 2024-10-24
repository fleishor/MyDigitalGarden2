---
showOnIndexPage: true
date: 2024-10-24
title: JWT based authentication
image: Authentication.png
description: A short example for JWT-based authentication; for authorization we use policy-based.
tags:
  - Dotnet
---

## References

- [Github](https://github.com/fleishor/MyDevelopment/tree/master/DotNet/Authentication/JWTBased)
- [Adding Authorization Option in Swagger](https://medium.com/@meghnav274/adding-authorization-option-in-swagger-638abfb0041f)

## Add authentication and authorization to program.cs

### AddAuthentication()

Add authentication service to DI container. Here we use JWT Bearer based authentication. The JWT Bearer token must be in Authorization HTTP header

~~~csharp
// Load JwtOptions from appsettings.json
builder.Services.ConfigureOptions<JwtConfigureOptions>();
var jwtOptions = builder.Configuration.GetSection("JwtOptions").Get<JwtOptions>();

builder.Services.AddHttpContextAccessor();

// Add JwtBearer Authorization
builder.Services.AddAuthentication(cfg => {
    cfg.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    cfg.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    cfg.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
}).AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;
    options.TokenValidationParameters = new()
    {
        ValidateIssuer = true,
        ValidIssuer = jwtOptions!.Issuer,
        ValidateAudience = true,
        ValidAudience = jwtOptions.Audience,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtOptions.SecretKey))
    };
});
~~~

### AddAuthorization()

Add policy to authorization, see also AuthorizationAttribute

~~~csharp
// Add Authorization Policy which can be used in AuthorizeAttribute
builder.Services.AddAuthorization(policyBuilder =>
{
    policyBuilder.AddPolicy("HelloWorldPolicy", policy =>
    {
        policy.RequireAuthenticatedUser()
            .AddAuthenticationSchemes(JwtBearerDefaults.AuthenticationScheme)
            .RequireClaim("Role", "HelloWorldRole");
    });
});
~~~

### Add authentication and authorization middleware

As soon as AuthorizationAttribute is used, authentication and authorization middleware must be added. In order to add this middleware the services must be added to DI container.

~~~csharp
app.UseAuthentication();
app.UseAuthorization();
~~~

### Program.cs

<!-- https://raw.githubusercontent.com/fleishor/MyDevelopment/refs/heads/master/DotNet/Authentication/JWTBased/Program.cs -->
~~~csharp
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Microsoft.OpenApi.Models;

namespace JWTBased
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            builder.Services.ConfigureOptions<JwtConfigureOptions>();

            var jwtOptions = builder.Configuration.GetSection("JwtOptions").Get<JwtOptions>();

            builder.Services.AddHttpContextAccessor();

            // Add JwtBearer Authorization
            builder.Services.AddAuthentication(cfg => {
                cfg.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                cfg.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
                cfg.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
            }).AddJwtBearer(options =>
            {
                options.RequireHttpsMetadata = false;
                options.SaveToken = true;
                options.TokenValidationParameters = new()
                {
                    ValidateIssuer = true,
                    ValidIssuer = jwtOptions!.Issuer,
                    ValidateAudience = true,
                    ValidAudience = jwtOptions.Audience,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtOptions.SecretKey))
                };
            });

            // Add Authorization Policy which can be used in AuthorizeAttribute
            builder.Services.AddAuthorization(policyBuilder =>
            {
                policyBuilder.AddPolicy("HelloWorldPolicy", policy =>
                {
                    policy.RequireAuthenticatedUser()
                        .AddAuthenticationSchemes(JwtBearerDefaults.AuthenticationScheme)
                        .RequireClaim("Role", "HelloWorldRole");
                });
            });
            builder.Services.AddControllers();

            // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen(options =>
            {
                options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme()
                {
                    Name = "Authorization",
                    Description = "Please insert JWT into field",
                    In = ParameterLocation.Header,
                    Type = SecuritySchemeType.Http,
                    Scheme = "Bearer"
                });

                options.AddSecurityRequirement(new OpenApiSecurityRequirement
                {
                    {
                        new OpenApiSecurityScheme
                        {
                            Reference = new OpenApiReference
                            {
                                Type = ReferenceType.SecurityScheme,
                                Id = "Bearer"
                            }
                        },
                        Array.Empty<string>()
                    }
                });

            });

            var app = builder.Build();

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            app.UseHttpsRedirection();

            app.UseAuthentication();
            app.UseAuthorization();

            app.UseStaticFiles();

            app.MapControllers();

            app.Run();
        }
    }
}
~~~

## Setup JWT based authentication

### Setup claims

Claims is a Key/Value dictionary with properties of an user. ClaimTypes contains a predefined list of Keys.

~~~csharp
var claims = new List<Claim>()
{
    new Claim(JwtRegisteredClaimNames.Sub, new Guid().ToString()),
    new Claim(JwtRegisteredClaimNames.Email, "fleishor@fleishor.org"),
    new Claim(JwtRegisteredClaimNames.Name, "FleisHor"),
    new Claim("Role", "HelloWorldRole")
};
~~~

### Create JWT token

- Create the JWT token. It is signed with SecretKey from configuration
- This token must be added to the Authorization-HTTP-Header at client side, in opposite to cookies they are not added automatically

~~~csharp
var signingCredentials = new SigningCredentials(
                            new SymmetricSecurityKey(
                                Encoding.UTF8.GetBytes(this.jwtOptions.SecretKey)
                                ),
                            SecurityAlgorithms.HmacSha256Signature);

var jwtToken = new JwtSecurityToken(
    this.jwtOptions.Issuer,
    this.jwtOptions.Audience,
    claims,
    DateTime.Now,
    DateTime.Now.AddSeconds(this.jwtOptions.ExpirationTimeInSeconds),
    signingCredentials);

var jwtTokenValue = new JwtSecurityTokenHandler().WriteToken(jwtToken);
~~~

### AuthenticationController.cs

<!-- https://raw.githubusercontent.com/fleishor/MyDevelopment/refs/heads/master/DotNet/Authentication/JWTBased/Controllers/AuthenticationController.cs -->

~~~csharp
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace JWTBased.Controllers;

[ApiController]
[Route("[controller]")]
public class AuthenticationController : ControllerBase
{
    private readonly IHttpContextAccessor httpContextAccessor;
    private readonly JwtOptions jwtOptions;

    public AuthenticationController(IHttpContextAccessor httpContextAccessor,
        IOptions<JwtOptions> jwtOptions)
    {
        this.httpContextAccessor = httpContextAccessor;
        this.jwtOptions = jwtOptions.Value;
    }

    [AllowAnonymous]
    [HttpGet("SignIn")]
    public string SignIn(CancellationToken cancellationToken)
    {
        var claims = new List<Claim>()
        {
            new Claim(JwtRegisteredClaimNames.Sub, new Guid().ToString()),
            new Claim(JwtRegisteredClaimNames.Email, "fleishor@fleishor.org"),
            new Claim(JwtRegisteredClaimNames.Name, "FleisHor"),
            new Claim("Role", "HelloWorldRole")
        };

        var signingCredentials = new SigningCredentials(
                                    new SymmetricSecurityKey(
                                        Encoding.UTF8.GetBytes(this.jwtOptions.SecretKey)
                                        ),
                                    SecurityAlgorithms.HmacSha256Signature);

        var jwtToken = new JwtSecurityToken(
            this.jwtOptions.Issuer,
            this.jwtOptions.Audience,
            claims,
            DateTime.Now,
            DateTime.Now.AddSeconds(this.jwtOptions.ExpirationTimeInSeconds),
            signingCredentials);

        var jwtTokenValue = new JwtSecurityTokenHandler().WriteToken(jwtToken);

        return jwtTokenValue;
    }

    [AllowAnonymous]
    [HttpGet("GetIdentity")]
    public string GetIdentity(CancellationToken cancellationToken)
    {
        if (httpContextAccessor.HttpContext != null)
        {
            var result = httpContextAccessor.HttpContext.User.Identities.Select(identity => new
            {
                identity.IsAuthenticated,
                identity.AuthenticationType,
                identity.Name,
                Claims = identity.Claims.Select(claim => new
                {
                    claim.Type,
                    claim.Value
                })
            });

            return JsonSerializer.Serialize(result, new JsonSerializerOptions { WriteIndented = true });
        }

        return string.Empty;
    }
}
~~~

## Usage in controller

Add AuthorizeAttribute to the endpoints; Policy-based authorization is the modern one.

### HelloWorldController.cs

<!-- https://raw.githubusercontent.com/fleishor/MyDevelopment/refs/heads/master/DotNet/Authentication/JWTBased/Controllers/HelloWorldController.cs -->

~~~csharp
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace JWTBased.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class HelloWorldController : ControllerBase
    {
        [HttpGet("HelloWorldInsecure")]
        public string HelloWorldInsecure()
        {
            return "Hello World (Insecure)";
        }

        [Authorize(Policy = "HelloWorldPolicy")]
        [HttpGet("HelloWorldPolicy")]
        public string HelloWorldPolicy()
        {
            return "Hello World with Policy";
        }

    }
}
~~~

## Add Swagger UI support 

### Add Security to swagger options
~~~csharp
builder.Services.AddSwaggerGen(options =>
{
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme()
    {
        Name = "Authorization",
        Description = "Please insert JWT into field",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        Scheme = "Bearer"
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});
~~~

### UI changes in swagger

In the SwaggerUI there is now the authorization button.

![[SwaggerUI.png]]


### Execute SignIn endpoint to get JWT

![[ExecuteSignInEndpoint.png]]

### Add JWT to Swagger

![[AddJWTToSwagger.png]]

- Do not add additional "Bearer" in the input field 

### Protected Endpoint can be called

- Authorization HTTP header is added to all endpoint calls
- lock symbol is also changed to closed

![[ProtectedEndpointCanBeCalled.png]]
