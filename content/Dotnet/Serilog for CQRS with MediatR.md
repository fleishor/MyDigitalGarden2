---
date: 2024-09-29
title: Add Serilog to "CQRS with MediatR"
image: 
description: Add Serilog to "CQRS with MediatR" project; the logs are written as plain text to console and as ([Compact Log Event Format (CLEF)](https://clef-json.org/)) to a file. Additionally we can set a correlation id in the http header.
tags:
  - Dotnet
---

## References

[GitHub](https://github.com/fleishor/MyDevelopment/tree/master/DotNet/Mediatr)
[HTTP logging in ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/http-logging/?view=aspnetcore-8.0)
[Compact Log Event Format (CLEF)](https://clef-json.org/)
[Serilog](https://serilog.net/)
[Serilog Enrichers](https://github.com/serilog/serilog/wiki/Enrichment)
[Serilog ClientInfo Enricher](https://github.com/serilog-contrib/serilog-enrichers-clientinfo)

## Nuget packages

~~~xml
  <ItemGroup>
    ...
    <PackageReference Include="Serilog.AspNetCore" Version="8.0.2" />
    <PackageReference Include="Serilog.Enrichers.ClientInfo" Version="2.1.1" />
    <PackageReference Include="Serilog.HttpClient" Version="3.0.0" />
    ...
  </ItemGroup>
~~~

## Program.cs

~~~csharp
public static void Main(string[] args)
{
	var builder = WebApplication.CreateBuilder(args);

	// Add Serilog and use configuration from appsettings.json
	builder.Host.UseSerilog((context, config) =>
	{
		config.ReadFrom.Configuration(context.Configuration);
	});

	// Required by ClientInfo enricher
	builder.Services.AddHttpContextAccessor();
	
	...
	
	builder.Services.AddSwaggerGen(config =>
	{
		// Add CorrelationId to SwaggerUI
		config.OperationFilter<AddHeaderParameters>();
	});

	...
	
	// Log also ASP.Net request to Serilog
	app.UseSerilogRequestLogging();

	...

}
~~~


## Configuration

~~~json
{
  "Serilog": {
    "Using": [ "Serilog.Sinks.Console", "Serilog.Sinks.File" ],
    "MinimumLevel": {
      "Default": "Debug",
      "Override": {
        "Microsoft.AspNetCore": "Information",
        "Microsoft.AspNetCore.HttpLogging.HttpLoggingMiddleware": "Information"
      }
    },
    "WriteTo": [
      {
        "Name": "Console"
      },
      {
        "Name": "File",
        "Args": {
          "path": "./logs/Road.API_.json",
          "rollingInterval": "Day",
          "formatter": "Serilog.Formatting.Compact.CompactJsonFormatter, Serilog.Formatting.Compact"
        }
      }

    ],
    "Enrich": [
      "FromLogContext",
      {
        "Name": "WithCorrelationId",
        "Args": {
          "headerName": "x-correlation-id",
          "addValueIfHeaderAbsence": true
        }
      }
    ],
    "Properties": {
      "Application": "Road.API"
    }
  },
  "AllowedHosts": "*"
}
~~~

Interesting is the Override, here we can set different levels for each logger.

## Logging Scope

~~~csharp
public async Task<RoadWarningsQueryResult> GetRoadWarnings(string roadId, CancellationToken cancellationToken)
{
	using var loggerScope = logger.BeginScope("Get road warnings for highway {RoadId}", roadId);

	var roadWarningsQuery = new RoadWarningsQuery(roadId.ToUpper(), SlidingExpirationInMinutes: 1);
	var result = await mediator.Send(roadWarningsQuery, cancellationToken);

	return result;
}
~~~

With BeginScope, the property RoadId will be added to all log messages within this scope.

## CorrelationId

The CorrelationId can be set from external (HTTP Header) and will be added to all log messages.

## HTTP logging

~~~csharp
public static void Main(string[] args)
{

    ...

    // Add HttpLogging, but may cause performance issues
	builder.Services.AddHttpLogging(options =>
	{
		options.LoggingFields = HttpLoggingFields.RequestPropertiesAndHeaders | HttpLoggingFields.ResponsePropertiesAndHeaders;
		options.RequestHeaders.Add("x-correlation-id");
		options.CombineLogs = false;
	});

    ...

	app.UseStaticFiles();

    ... 

	// Log also HTTP to Serilog, static files are excluded because it called after UseStaticFiles()
	// But may cause performance issues
	app.UseHttpLogging();

    ...
}
~~~

## HTTPClient logging


~~~csharp
public static void Main(string[] args)
{
	
	...
	
	// Add Serilog and use configuration from appsettings.json
	builder.Host.UseSerilog((context, config) =>
	{
		config.ReadFrom.Configuration(context.Configuration)
	
			// necessary for Serilog.LogRequestResponse
			.AddJsonDestructuringPolicies();
	});
	
	...
	
	// Register the factory for the Autobahn client
	builder.Services
		.AddHttpClient<AutobahnClientFactory>(
			(_, client) =>
			{
				client.DefaultRequestHeaders.Add("Accept", "application/json");
			})
	
		// Attach the Kiota handlers to the http client, this is to enable all the Kiota features.
		.AttachKiotaHandlers()
		// HTTPClient logging
		.LogRequestResponse();
	
	...

}
~~~