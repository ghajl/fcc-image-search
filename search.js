var express = require('express');
var app = express();
var GoogleImages = require('google-images');
const client = new GoogleImages(process.env.cse, process.env.key);


app.get('/latest/imagesearch/', function (req, res) {	
  var resultsHtml = makeSearchesView(req.session.searches);
      res.send(resultsHtml);
      
      res.end();
})


app.get('/imagesearch/*', function (req, res, next) {	
  var results = [];
  
  if(Object.keys(req.query).length === 0 || Object.keys(req.query).length == 1 && req.query.hasOwnProperty("offset")){
    if(!~req.session.searches.indexOf(req.params[0]))
      req.session.searches.push(req.params[0]);
    var offset = req.query.offset || 1;
    client.search(req.params[0], {page: offset}).then(images => {
      images.forEach(({url, description, parentPage}) => results.push({url, description, parentPage}));
      var resultsHtml = makeResultsView(results, offset);
      res.send(resultsHtml);
      
      res.end();
    })    
  } else {
    next();
  }
})

function makeResultsView(results, offset){
  var html = `<h3>Page: ${offset}</h3>
              <div>
              [
                ${results.length === 0 ? 
                `<li>"No results"</li>` :
                  `${results.map((value, index, array) => 
                    index !== array.length - 1 ? 
                  `<div style='padding-left:40px'>
                    {
                    <ul style='list-style-type:none; padding-left:40px'>
                    <li>"Image URL": "${value.url}"</li>
                    <li>"Description": "${value.description}"</li>
                    <li>"Parent page": "${value.parentPage}"</li>
                    </ul>
                    },
                  </div>` : 
                  `<div style='padding-left:40px'>
                    {
                    <ul style='list-style-type:none; padding-left:40px'>
                    <li>"Image URL": "${value.url}"</li>
                    <li>"Description": "${value.description}"</li>
                    <li>"Parent page": "${value.parentPage}"</li>
                    </ul>
                    }

                  </div>` 
                  ).reduce((a, b) => a.concat(b))}`
                }
               ]
              </div>`
  
  return html;
}

function makeSearchesView(searches){
  var html = `<h3>Search history:</h3>
               <div>
                [
                <ul style='list-style-type:none; padding-left:20px'>
                ${searches.length === 0 ? 
                `<li>"nothing saved"</li>` :
                  `${searches.map((value, index, array) => 
                    index !== array.length - 1 ? 
                      `<li>"${value}",</li>` : 
                      `<li>"${value}"</li>`
                  ).reduce((a, b) => a.concat(b))}`
                }
                </ul>
                ]
              </div>`;

  return html;
}
module.exports = app;