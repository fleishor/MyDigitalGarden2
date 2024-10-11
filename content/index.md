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
    noteHtml = noteHtml + "     <img></img>"
    noteHtml = noteHtml + "   </div>";
    noteHtml = noteHtml + "   <div class='text'>";
    noteHtml = noteHtml + "      <div class='title'>";
    noteHtml = noteHtml + page.title;
    noteHtml = noteHtml + "      </div>";
    noteHtml = noteHtml + "      <div class='description'>";
    noteHtml = noteHtml + page.description;
    noteHtml = noteHtml + "      </div>";
    noteHtml = noteHtml + "   </div>";
    noteHtml = noteHtml + "</div>";
    
    return noteHtml;
}

let html = "";
let pages = dv.pages().
               where(page => page.draft != false && page.showOnIndexPage == true)
               .sort(page => page.date)
               .map(page => (
	               {
		               title: page.title, 
		               image: page.image, 
		               date: page.date, 
	                   description: page.description
	               }))
               .limit(10);
pages.forEach((page) => {
    html = html + renderOneNote(page);
})
return html;
~~~ 
%%
<div class='note'>   <div class='image'>     <img></img>   </div>   <div class='text'>      <div class='title'>Kiota OpenApi client generator      </div>      <div class='description'>Kiota is a command line tool for generating an API client to call any OpenAPI described API you are interested in. Kiota API clients provide a strongly typed experience with all the features you expect from a high quality API SDK, but without having to learn a new library for every HTTP API.      </div>   </div></div><div class='note'>   <div class='image'>     <img></img>   </div>   <div class='text'>      <div class='title'>Automapper and why not to use it      </div>      <div class='description'>null      </div>   </div></div><div class='note'>   <div class='image'>     <img></img>   </div>   <div class='text'>      <div class='title'>CQRS with MediatR      </div>      <div class='description'>A simple example for Mediatr. Currently only the query part is implemented, the command part is similar. Caching, Logging and Validation is done in MediatR-Behaviors. The client API is generated with Kiota.      </div>   </div></div><div class='note'>   <div class='image'>     <img></img>   </div>   <div class='text'>      <div class='title'>Add Serilog to "CQRS with MediatR"      </div>      <div class='description'>Add Serilog to "CQRS with MediatR" project; the logs are written as plain text to console and as ([Compact Log Event Format (CLEF)](https://clef-json.org/)) to a file. Additionally we can set a correlation id in the http header.      </div>   </div></div><div class='note'>   <div class='image'>     <img></img>   </div>   <div class='text'>      <div class='title'>PDFSharp      </div>      <div class='description'>Read a PDF document with PDFSharp, add some texts and save it with new name      </div>   </div></div>
%% run end 
last update: 2024-10-10 23:59:10
%%
