---
title: MyDigitalGarden
---

%% run start
~~~ts
function renderOneNote(page)
{
    let noteHtml = "";
    noteHtml = noteHtml + "<div class='note'>";
    noteHtml = noteHtml + "   <div class='image'>";
    if (page.image)
    {
        noteHtml = noteHtml + "     <img src='/Images/" + page.image + "'></img>"
    }
    noteHtml = noteHtml + "   </div>";
    noteHtml = noteHtml + "   <div class='text'>";
    noteHtml = noteHtml + "      <div class='date'>";
    noteHtml = noteHtml + page.date.toISODate();
    noteHtml = noteHtml + "      </div>";
    noteHtml = noteHtml + "      <a href='" + page.file.link.path + "'>";
    noteHtml = noteHtml + "      <div class='title'>";
    noteHtml = noteHtml + page.title;
    noteHtml = noteHtml + "      </div>";
    noteHtml = noteHtml + "      </a>";
    noteHtml = noteHtml + "      <div class='description'>";
    if (page.image)
    {
        noteHtml = noteHtml + page.description;
    }
    noteHtml = noteHtml + "      </div>";
    noteHtml = noteHtml + "   </div>";
    noteHtml = noteHtml + "</div>";
    
    return noteHtml;
}

let html = "";
console.log(dv.pages());
let pages = dv.pages().
               where(page => page.draft != false && page.showOnIndexPage == true)
               .sort(page => page.date, "desc")
               .map(page => (
	               {
		               title: page.title, 
		               image: page.image, 
		               date: page.date, 
	                   description: page.description,
	                   file: page.file
	               }))
               .limit(10);
pages.forEach((page) => {
    html = html + renderOneNote(page);
})
return html;
~~~ 
%%
<div class='note'>   <div class='image'>     <img src='/Images/Authentication.png'></img>   </div>   <div class='text'>      <div class='date'>2024-10-24      </div>      <a href='Dotnet/Authentication/JWT-based Authentication.md'>      <div class='title'>JWT based authentication      </div>      </a>      <div class='description'>A short example for JWT-based authentication; for authorization we use policy-based.      </div>   </div></div><div class='note'>   <div class='image'>     <img src='/Images/Keycloak.png'></img>   </div>   <div class='text'>      <div class='date'>2024-10-17      </div>      <a href='SmartHome/Docker/Install-Keycloak-with-Docker.md'>      <div class='title'>Installation Keycloak with Docker      </div>      </a>      <div class='description'>Installation steps for Keycloak with Docker      </div>   </div></div><div class='note'>   <div class='image'>     <img src='/Images/Authentication.png'></img>   </div>   <div class='text'>      <div class='date'>2024-10-14      </div>      <a href='Dotnet/Authentication/Cookie-based Authentication.md'>      <div class='title'>Cookie based Authentication      </div>      </a>      <div class='description'>A short example for cookie-based authentication; for authorization we use role-based and policy-based.      </div>   </div></div><div class='note'>   <div class='image'>     <img src='/Images/Serilog.png'></img>   </div>   <div class='text'>      <div class='date'>2024-09-29      </div>      <a href='Dotnet/Mediatr/Serilog for CQRS with MediatR.md'>      <div class='title'>Add Serilog to "CQRS with MediatR"      </div>      </a>      <div class='description'>Add Serilog to "CQRS with MediatR" project; the logs are written as plain text to console and as ([Compact Log Event Format (CLEF)](https://clef-json.org/)) to a file. Additionally we can set a correlation id in the http header.      </div>   </div></div><div class='note'>   <div class='image'>     <img src='/Images/MediatR.png'></img>   </div>   <div class='text'>      <div class='date'>2024-09-24      </div>      <a href='Dotnet/Mediatr/CQRS with MediatR.md'>      <div class='title'>CQRS with MediatR      </div>      </a>      <div class='description'>A simple example for Mediatr. Currently only the query part is implemented, the command part is similar. Caching, Logging and Validation is done in MediatR-Behaviors. The client API is generated with Kiota.      </div>   </div></div><div class='note'>   <div class='image'>     <img src='/Images/Kiota.png'></img>   </div>   <div class='text'>      <div class='date'>2024-09-19      </div>      <a href='Dotnet/Kiota OpenAPI Client Generator.md'>      <div class='title'>Kiota OpenApi client generator      </div>      </a>      <div class='description'>Kiota is a command line tool for generating an API client to call any OpenAPI described API you are interested in. Kiota API clients provide a strongly typed experience with all the features you expect from a high quality API SDK, but without having to learn a new library for every HTTP API.      </div>   </div></div>
%% run end 
last update: 2024-10-24 17:54:42
%%


