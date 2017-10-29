var svg = d3.select("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height");

var color = d3.scaleOrdinal(d3.schemeCategory20);

var simulation = d3.forceSimulation()
    .force("link", d3.forceLink().id(function(d) { return d.id; }))
    .force("charge", d3.forceManyBody())
    .force("center", d3.forceCenter(width / 2, height / 2));




function drawEvery(error, d){
    var json = {links: [], nodes: []};
    //leagues podria ser leida desde un archivo y no quemado dentro del codigo; en caso de que quieras incluir otras ligas 
    //se modifica el archivo de datos y no el codigo de la funcion
    var leagues = ["Ligue 1", "Premier League", "LaLiga", "Serie A", "Liga NOS", "Premier Liga", "1.Bundesliga", "Torneo Inicial"]
    var arr = {}, teams = [], rels = {}, lm = {}, lislig = [], orgLea={};
        d.forEach(function(ds){

          if(leagues.indexOf(ds["leagueFrom"]) > -1 && leagues.indexOf(ds["leagueTo"])> -1){
              if (teams.indexOf(ds["teamFrom"]) == -1){ teams.push(ds["teamFrom"]); json.nodes.push({id: ds["teamFrom"], group: leagues.indexOf(ds["leagueFrom"]) + 1}) } 
              if (teams.indexOf(ds["teamTo"]) == -1) { teams.push(ds["teamTo"]); json.nodes.push({id: ds["teamTo"], group: leagues.indexOf(ds["leagueTo"]) + 1}) }
              var rel = ds["teamFrom"] + " - " + ds["teamTo"];
              if(!rels[rel]) rels[rel] = {teamFrom: ds["teamFrom"], teamTo: ds["teamTo"], con: 0, cost: 0, leagueFrom: ds["leagueFrom"], leagueTo: ds["leagueTo"]}
              rels[rel].con++;
            if(!orgLea[ds["leagueTo"]]) orgLea[ds["leagueTo"]] = {"nom": ds["leagueTo"], "teams": {}}
            if(!orgLea[ds["leagueFrom"]]) orgLea[ds["leagueFrom"]] = {"nom": ds["leagueFrom"], "teams": {}}
            if(!orgLea[ds["leagueTo"]]["teams"][ds["teamTo"]]) orgLea[ds["leagueTo"]]["teams"][ds["teamTo"]] = 0;
            if(!orgLea[ds["leagueFrom"]]["teams"][ds["teamFrom"]]) orgLea[ds["leagueFrom"]]["teams"][ds["teamFrom"]] = 0;
            orgLea[ds["leagueFrom"]]["teams"][ds["teamFrom"]]++;
            orgLea[ds["leagueTo"]]["teams"][ds["teamTo"]]++;
          }
    


       });
        json.nodes = []; teams = [];
        z = 1;
        for(var l in orgLea){
          tt = [];
          for(var t in orgLea[l]["teams"]){
            tt.push({nom: t, cant: orgLea[l]["teams"][t]})
          }
          tt.sort(function(a, b){
            return b.cant-a.cant;
          })
          orgLea[l]["teams"] = tt.slice(0,10)
          for(var t in orgLea[l]["teams"]){
            json.nodes.push({id: orgLea[l]["teams"][t].nom, group: z})
            teams.push(orgLea[l]["teams"][t].nom);
          }

          z++;
        }
            
          
          for(var t in rels){
            if(teams.indexOf(rels[t].teamFrom) > -1 && teams.indexOf(rels[t].teamTo) > -1)
              json.links.push({source: rels[t].teamFrom, target: rels[t].teamTo, value: rels[t].con})
          } 
        console.log(json);  


          var link = svg.append("g")
              .attr("class", "links")
            .selectAll("line")
            .data(json.links)
            .enter().append("line")
              .attr("stroke-width", function(d) { return Math.sqrt(d.value); });

          var node = svg.append("g")
              .attr("class", "nodes")
            .selectAll("circle")
            .data(json.nodes)
            .enter().append("circle")
              .attr("r", 5)
              .attr("fill", function(d) { return color(d.group); })
              .on("mouseover", function(d){ console.log(d.id)})
              .call(d3.drag()
                  .on("start", dragstarted)
                  .on("drag", dragged)
                  .on("end", dragended));

          node.append("title")
              .text(function(d) { return d.id; });

          simulation
              .nodes(json.nodes)
              .on("tick", ticked);

          simulation.force("link")
              .links(json.links)
              .distance(100)

          function ticked() {

            link
                .attr("x1", function(d) { return d.source.x; })
                .attr("y1", function(d) { return d.source.y; })
                .attr("x2", function(d) { return d.target.x; })
                .attr("y2", function(d) { return d.target.y; });

            node
                .attr("cx", function(d) { return d.x; })
                .attr("cy", function(d) { return d.y; });
          }

          

        }

        

        function dragstarted(d) {
          if (!d3.event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        }

        function dragged(d) {
          d.fx = d3.event.x;
          d.fy = d3.event.y;
        }

        function dragended(d) {
          if (!d3.event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        }

        d3.queue()
          .defer(d3.csv, 'kkfinal.csv')
          .await(drawEvery)
