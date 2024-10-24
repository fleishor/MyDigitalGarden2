---
draft: true
showOnIndexPage: true
date: 2024-10-14
title: Cookie based Authentication
image: Authentication.png
description: A short example for cookie-based authentication; for authorization we use role-based and policy-based.
tags:
  - Dotnet
---

## References

- [Github](https://github.com/fleishor/MyDevelopment/tree/master/DotNet/Authentication/Cookiebased)

## Add authentication and authorization to program.cs

### AddAuthentication()

Add authentication service to DI container. Here we use cookie based authentication, which means for each http request a cookie is used which contains all authentication information. Because cookie-based authentication also redirects to the login page, we must override OnRedirectToAccessDenied and OnRedirectToLogin.

~~~csharp
builder.Services.AddAuthentication(AuthenticationScheme)
    .AddCookie(AuthenticationScheme, options =>
    {
        options.Cookie.Name = "MyAuthCookie";
        options.Events.OnRedirectToAccessDenied = f =>
        {
            f.Response.StatusCode = StatusCodes.Status403Forbidden;
            return Task.CompletedTask;
        };
        options.Events.OnRedirectToLogin = f =>
        {
            f.Response.StatusCode = StatusCodes.Status401Unauthorized;
            return Task.CompletedTask;
                    };
~~~

### AddAuthorization()

Add policy to authorization, see also AuthorizationAttribute

~~~csharp
builder.Services.AddAuthorization(policyBuilder =>
    {
        policyBuilder.AddPolicy("HelloWorldPolicy", policy =>
        {
            policy.RequireAuthenticatedUser()
                .AddAuthenticationSchemes(AuthenticationScheme)
                .RequireRole("HelloWorldRole");
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

<!-- https://raw.githubusercontent.com/fleishor/MyDevelopment/refs/heads/master/DotNet/Authentication/CookieBased/Program.cs -->
~~~csharp

using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;

namespace CookieBased
{
    public class Program
    {
        public static string AuthenticationScheme = "cookie";

        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            builder.Services.AddHttpContextAccessor();

            // Add services to the container.

            // Add Cookie Authorization
            builder.Services.AddAuthentication(AuthenticationScheme)
                .AddCookie(AuthenticationScheme, options =>
                {
                    options.Cookie.Name = "MyAuthCookie";
                    options.Events.OnRedirectToAccessDenied = f =>
                    {
                        f.Response.StatusCode = StatusCodes.Status403Forbidden;
                        return Task.CompletedTask;
                    };
                    options.Events.OnRedirectToLogin = f =>
                    {
                        f.Response.StatusCode = StatusCodes.Status401Unauthorized;
                        return Task.CompletedTask;
                    };
                });

            // Add Authorization Policy which can be used in AuthorizeAttribute
            builder.Services.AddAuthorization(policyBuilder =>
            {
                policyBuilder.AddPolicy("HelloWorldPolicy", policy =>
                {
                    policy.RequireAuthenticatedUser()
                        .AddAuthenticationSchemes(AuthenticationScheme)
                        .RequireRole("HelloWorldRole");
                });
            });

            builder.Services.AddControllers();

            // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();

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

## Setup cookie based authentication

### Setup claims

Claims is a Key/Value dictionary with properties of an user. ClaimTypes contains a predefined list of Keys, especially ClaimTypes.Role

~~~csharp
var claims = new List<Claim>()
{
    new Claim("user", "fleishor"),
    new Claim(ClaimTypes.Email, "fleishor@fleishor.org"),
    new Claim(ClaimTypes.Name, "FleisHor"),
    new Claim(ClaimTypes.Role, "HelloWorldRole")
};
var identity = new ClaimsIdentity(claims, Program.AuthenticationScheme);
var user = new ClaimsPrincipal(identity);
~~~

### SignIn

SignInAsync creates an encrypted cookie with the data from ClaimsPrincipal. The middleware adds and checks this cookie

~~~csharp
await ctx.HttpContext.SignInAsync(Program.AuthenticationScheme, user);
~~~

### AuthenticationController.cs

<!-- https://raw.githubusercontent.com/fleishor/MyDevelopment/refs/heads/master/DotNet/Authentication/CookieBased/Controllers/AuthenticationController.cs -->

~~~csharp
using Microsoft.AspNetCore.Authorization;

namespace CookieBased.Controllers;

using System.Security.Claims;
using System.Text.Json;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("[controller]")]
public class AuthenticationController(IHttpContextAccessor ctx) : ControllerBase
{
    [AllowAnonymous]
    [HttpGet("SignIn")]
    public async Task<string> SignIn(CancellationToken cancellationToken)
    {
        var claims = new List<Claim>()
        {
            new Claim("user", "fleishor"),
            new Claim(ClaimTypes.Email, "fleishor@fleishor.org"),
            new Claim(ClaimTypes.Name, "FleisHor"),
            new Claim(ClaimTypes.Role, "HelloWorldRole")
        };
        var identity = new ClaimsIdentity(claims, Program.AuthenticationScheme);
        var user = new ClaimsPrincipal(identity);
        if (ctx.HttpContext != null)
        {
            await ctx.HttpContext.SignInAsync(Program.AuthenticationScheme, user);
        }

        return "ok";
    }

    [AllowAnonymous]
    [HttpGet("GetIdentity")]
    public string GetIdentity(CancellationToken cancellationToken)
    {
        if (ctx.HttpContext != null)
        {
            var result = ctx.HttpContext.User.Identities.Select(identity => new
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

<!-- https://raw.githubusercontent.com/fleishor/MyDevelopment/refs/heads/master/DotNet/Authentication/CookieBased/Controllers/HelloWorldController.cs -->

~~~csharp
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CookieBased.Controllers
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

        [Authorize(Roles = "HelloWorldRoleAdmin")]
        [HttpGet("HelloWorldRoleAdmin")]
        public string HelloWorldRolesAdmin()
        {
            return "Hello World with Role Admin";
        }

        [Authorize(Roles = "HelloWorldRole")]
        [HttpGet("HelloWorldRoles")]
        public string HelloWorldRoles()
        {
            return "Hello World with Roles";
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
