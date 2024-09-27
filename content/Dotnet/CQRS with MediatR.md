---
draft: true
date: 2024-09-24
title: CQRS with MediatR
image: MediatR.png
description: A simple example for Mediatr. Currently only the query part is implemented, the command part is similar. Caching, Logging and Validation is done in MediatR-Behaviors. The client API is generated with Kiota.
tags:
  - Dotnet
---

## References

[GitHub](https://github.com/fleishor/MyDevelopment/tree/master/DotNet/Mediatr)
[# CQRS Pattern With MediatR](https://www.milanjovanovic.tech/blog/cqrs-pattern-with-mediatr)
[[Kiota OpenAPI Client Generator]]

## Project settings
### Directory.Build.props

<!-- https://raw.githubusercontent.com/fleishor/MyDevelopment/refs/heads/master/DotNet/Mediatr/Directory.Build.props -->

~~~xml
<Project>
  <PropertyGroup>
    <LangVersion>latest</LangVersion>
    <Nullable>enable</Nullable>
    <ProduceReferenceAssembly>True</ProduceReferenceAssembly>
    <EnableNETAnalyzers>True</EnableNETAnalyzers>
    <EnforceCodeStyleInBuild>True</EnforceCodeStyleInBuild>
  </PropertyGroup>

  <PropertyGroup Condition="'$(Configuration)' == 'Release'">
    <MSBuildTreatWarningsAsErrors>True</MSBuildTreatWarningsAsErrors>
    <TreatWarningsAsErrors>True</TreatWarningsAsErrors>
  </PropertyGroup>
</Project>
~~~

### Directory.Build.targets

<!-- https://raw.githubusercontent.com/fleishor/MyDevelopment/refs/heads/master/DotNet/Mediatr/Directory.Build.targets -->

~~~xml
<Project>
  <PropertyGroup>
    <!-- Common ruleset shared by all projects -->
    <CodeAnalysisRuleset>$(MSBuildThisFileDirectory)Mediatr.ruleset</CodeAnalysisRuleset>
  </PropertyGroup>
  <ItemGroup>
    <!-- Add reference to StyleCop analyzers to all projects  -->
    <PackageReference Include="StyleCop.Analyzers" Version="1.2.0-beta.*" Condition="'$(DisableAdditionalAnalyzers)' != 'True'" />
    <AdditionalFiles Include="$(MSBuildThisFileDirectory)StyleCop.json" />
  </ItemGroup>
  <ItemGroup>
    <PackageReference Include="SonarAnalyzer.CSharp" Version="9.*">
      <PrivateAssets>all</PrivateAssets>
      <IncludeAssets>runtime; build; native; contentfiles; analyzers; buildtransitive</IncludeAssets>
    </PackageReference>
  </ItemGroup>
</Project>
~~~

## Kiota extension

<!-- https://raw.githubusercontent.com/fleishor/MyDevelopment/refs/heads/master/DotNet/Mediatr/Road.API/KiotaServiceCollectionExtensions.cs -->

~~~csharp
namespace Road.API;

using Microsoft.Kiota.Http.HttpClientLibrary;

public static class KiotaServiceCollectionExtensions
{
    // Adds the Kiota handlers to the service collection.
    public static IServiceCollection AddKiotaHandlers(this IServiceCollection services)
    {
        // Dynamically load the Kiota handlers from the Client Factory
        var kiotaHandlers = KiotaClientFactory.GetDefaultHandlerTypes();

        // And register them in the DI container
        foreach (var handler in kiotaHandlers)
        {
            services.AddTransient(handler);
        }

        return services;
    }

    // Adds the Kiota handlers to the http client builder.
    public static IHttpClientBuilder AttachKiotaHandlers(this IHttpClientBuilder builder)
    {
        // Dynamically load the Kiota handlers from the Client Factory
        var kiotaHandlers = KiotaClientFactory.GetDefaultHandlerTypes();

        // And attach them to the http client builder
        foreach (var handler in kiotaHandlers)
        {
            builder.AddHttpMessageHandler((sp) => (DelegatingHandler)sp.GetRequiredService(handler));
        }

        return builder;
    }
}
~~~

In program.cs we can simply add all handlers to DI:

~~~csharp
...
// Add Kiota handlers to the dependency injection container
builder.Services.AddKiotaHandlers();

// Register the factory for the Autobahn client
builder.Services
	.AddHttpClient<AutobahnClientFactory>(
		(_, client) =>
		{
			client.DefaultRequestHeaders.Add("Accept", "application/json");
		})

	// Attach the Kiota handlers to the http client, this is to enable all the Kiota features.
	.AttachKiotaHandlers();

// Register the Autobahn client
builder.Services.AddTransient(sp => sp.GetRequiredService<AutobahnClientFactory>().GetClient());
...
~~~

## Register MediatR handler and behaviors in DI 

The registration order of the behaviors is also the execution order, which means:
1. LoggingBehavior
2. ValidationBehavior
3. QueryCachingBehavior

~~~csharp
...
builder.Services.AddMediatR(cfg =>
{
	cfg.RegisterServicesFromAssembly(typeof(RoadWarningsQueryHandler).Assembly);

	// Order of AddOpenBehavior() is important
	cfg.AddOpenBehavior(typeof(QueryLoggingBehavior<,>));
	cfg.AddOpenBehavior(typeof(QueryValidationBehavior<,>));
	cfg.AddOpenBehavior(typeof(QueryCachingBehavior<,>));
});
...        
~~~

## QueryCachingBehavior

Cache the web service call to autobahn.de for x minutes. The Query (MediatR request) must be additionally implement the interface ICacheable.

<!-- https://raw.githubusercontent.com/fleishor/MyDevelopment/refs/heads/master/DotNet/Mediatr/Road.BusinessLayer/Behaviors/Query/QueryCachingBehavior.cs -->

~~~csharp
namespace Road.BusinessLayer.Behaviors.Query;

using System.Text.Json;
using MediatR;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using Road.BusinessLayer.Interfaces.Query;

public class QueryCachingBehavior<TQuery, TQueryResult>(
        ILogger<QueryCachingBehavior<TQuery, TQueryResult>> logger,
        IMemoryCache cache)
    : IPipelineBehavior<TQuery, TQueryResult>
        where TQuery : IQuery<IQueryResult>, ICacheable
{
    public async Task<TQueryResult> Handle(TQuery request, RequestHandlerDelegate<TQueryResult> next, CancellationToken cancellationToken)
    {
        logger.LogInformation("Checking MemoryCache; CacheKey: \"{CacheKey}\"", request.CacheKey);

        TQueryResult response;
        if (cache.Get(request.CacheKey) is string cachedResponse)
        {
            response = JsonSerializer.Deserialize<TQueryResult>(cachedResponse)!;
            logger.LogInformation("Fetched from cache; CacheKey: \"{CacheKey}\"", request.CacheKey);
        }
        else
        {
            response = await GetResponseAndAddToCache(request, next);
            logger.LogInformation("Added to cache; CacheKey: \"{CacheKey}\"", request.CacheKey);
        }

        return response;
    }

    private async Task<TQueryResult> GetResponseAndAddToCache(TQuery request, RequestHandlerDelegate<TQueryResult> next)
    {
        var response = await next();
        if (response is not null)
        {
            var slidingExpirationInMinutes = request.SlidingExpirationInMinutes == 0 ? 30 : request.SlidingExpirationInMinutes;
            var options = new MemoryCacheEntryOptions().SetSlidingExpiration(TimeSpan.FromMinutes(slidingExpirationInMinutes));

            var serializedData = JsonSerializer.Serialize(response);
            cache.Set(request.CacheKey, serializedData, options);
        }

        return response;
    }
}
~~~

<!-- https://raw.githubusercontent.com/fleishor/MyDevelopment/refs/heads/master/DotNet/Mediatr/Road.BusinessLayer/Queries/RoadWarnings/RoadWarningsQuery.cs -->

~~~csharp
namespace Road.BusinessLayer.Queries.RoadWarnings
{
    using Road.BusinessLayer.Interfaces.Query;

    public record RoadWarningsQuery(string RoadId, int SlidingExpirationInMinutes = 0) : IQuery<RoadWarningsQueryResult>, ICacheable
    {
        public string CacheKey { get; } = RoadId;

        public int SlidingExpirationInMinutes { get; } = SlidingExpirationInMinutes;
    }
}
~~~

## QueryLoggingBehavior

Write a logging message when query handling is started and finished

<!-- https://raw.githubusercontent.com/fleishor/MyDevelopment/refs/heads/master/DotNet/Mediatr/Road.BusinessLayer/Behaviors/Query/QueryLoggingBehavior.cs -->

~~~csharp
namespace Road.BusinessLayer.Behaviors.Query;

using MediatR;
using Microsoft.Extensions.Logging;
using Road.BusinessLayer.Interfaces.Query;

public class QueryLoggingBehavior<TQuery, TQueryResult> : IPipelineBehavior<TQuery, TQueryResult>
    where TQuery : IQuery<IQueryResult>
{
    private readonly ILogger<QueryLoggingBehavior<TQuery, TQueryResult>> logger;

    public QueryLoggingBehavior(ILogger<QueryLoggingBehavior<TQuery, TQueryResult>> logger)
    {
        this.logger = logger;
    }

    public async Task<TQueryResult> Handle(TQuery request, RequestHandlerDelegate<TQueryResult> next, CancellationToken cancellationToken)
    {
        logger.LogInformation("Handling query {QueryName}", typeof(TQuery).Name);
        var response = await next();
        logger.LogInformation("Handled query {QueryName}", typeof(TQuery).Name);

        return response;
    }
}
~~~

## QueryValidationBehavior

- The query parameter are validated if there is a corresponding Validator in DI container. 
- There is also a nuget package: [MediatR.Extensions.FluentValidation.AspNetCore](https://www.nuget.org/packages/MediatR.Extensions.FluentValidation.AspNetCore)

<!-- https://raw.githubusercontent.com/fleishor/MyDevelopment/refs/heads/master/DotNet/Mediatr/Road.BusinessLayer/Behaviors/Query/QueryValidationBehavior.cs -->

~~~csharp
namespace Road.BusinessLayer.Behaviors.Query;

using FluentValidation;
using MediatR;
using Road.BusinessLayer.Interfaces.Query;

public class QueryValidationBehavior<TQuery, TQueryResult>(IEnumerable<IValidator<TQuery>> validators)
    : IPipelineBehavior<TQuery, TQueryResult>
    where TQuery : IQuery<IQueryResult>
{
    public async Task<TQueryResult> Handle(TQuery request, RequestHandlerDelegate<TQueryResult> next, CancellationToken cancellationToken)
    {
        if (validators.Any())
        {
            var context = new ValidationContext<TQuery>(request);

            var validationResults = await Task.WhenAll(
                validators.Select(v => v.ValidateAsync(context, cancellationToken)));

            var failures = validationResults
                .Where(r => r.Errors.Count > 0)
                .SelectMany(r => r.Errors)
                .ToList();

            if (failures.Count > 0)
            {
                throw new ValidationException(failures);
            }
        }

        return await next();
    }
}
~~~

<!-- https://raw.githubusercontent.com/fleishor/MyDevelopment/refs/heads/master/DotNet/Mediatr/Road.BusinessLayer/Queries/RoadWarnings/RoadWarningsQueryValidator.cs -->

~~~csharp
namespace Road.BusinessLayer.Queries.RoadWarnings;

using FluentValidation;

public class RoadWarningsQueryValidator : AbstractValidator<RoadWarningsQuery>
{
    public RoadWarningsQueryValidator()
    {
        RuleFor(x => x.RoadId).NotEmpty().MaximumLength(4);
    }
}
~~~
## Program.cs

<!-- https://raw.githubusercontent.com/fleishor/MyDevelopment/refs/heads/master/DotNet/Mediatr/Road.API/Program.cs -->
~~~csharp
namespace Road.API;

using FluentValidation;
using Road.BusinessLayer;
using Road.BusinessLayer.Behaviors.Query;
using Road.BusinessLayer.Queries.RoadWarnings;

public static class Program
{
    public static void Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);

        // Add services to the container.
        builder.Services.AddControllers();

        // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
        builder.Services.AddEndpointsApiExplorer();
        builder.Services.AddSwaggerGen();

        builder.Services.AddValidatorsFromAssembly(typeof(RoadWarningsQueryHandler).Assembly);

        builder.Services.AddMediatR(cfg =>
        {
            cfg.RegisterServicesFromAssembly(typeof(RoadWarningsQueryHandler).Assembly);

            // Order of AddOpenBehavior() is important
            cfg.AddOpenBehavior(typeof(QueryLoggingBehavior<,>));
            cfg.AddOpenBehavior(typeof(QueryValidationBehavior<,>));
            cfg.AddOpenBehavior(typeof(QueryCachingBehavior<,>));
        });

        // Add Kiota handlers to the dependency injection container
        builder.Services.AddKiotaHandlers();

        // Register the factory for the Autobahn client
        builder.Services
            .AddHttpClient<AutobahnClientFactory>(
                (_, client) =>
                {
                    client.DefaultRequestHeaders.Add("Accept", "application/json");
                })

            // Attach the Kiota handlers to the http client, this is to enable all the Kiota features.
            .AttachKiotaHandlers();

        // Register the Autobahn client
        builder.Services.AddTransient(sp => sp.GetRequiredService<AutobahnClientFactory>().GetClient());

        builder.Services.AddMemoryCache();

        var app = builder.Build();

        // Configure the HTTP request pipeline.
        if (app.Environment.IsDevelopment())
        {
            app.UseSwagger();
            app.UseSwaggerUI();
        }

        app.UseAuthorization();

        app.MapControllers();

        app.Run();
    }
}
~~~
 