
var svg = d3.select("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height");


var g = svg.append("g");

var color = d3.scaleOrdinal(d3.schemeCategory20);

var simulation = d3.forceSimulation()
    .force("link", d3.forceLink().id(function(d) { return d.id; }).distance(200))
    .force("charge", d3.forceManyBody())
    .force("center", d3.forceCenter(width / 0.2, height / 0.2))
    .force("attraceForce",d3.forceManyBody().strength(-500));

var opacity = 0.05;
var transitionPeriod = 500;
d3.json("https://raw.githubusercontent.com/ZhongTr0n/JD_Analysis/main/jd_data2.json", function(error, graph) {
  if (error) throw error;

	var link = g.selectAll("line")
    .data(graph.links)
    .enter().append("line")
    .style("stroke-width", function(d) { return d.value; })
    .style("stroke", "black" )
    .style("opacity", "1")
    .attr("group",function(d) {return d.group; })
    .on("click", function(d) {
    	// This is to toggle visibility - need to do it on the nodes, links & text
    	d3.selectAll("line:not([group='"+d.group+"'])")
    	.transition().duration(transitionPeriod).style("opacity", function() {
    		var currentDisplay = d3.select(this).style("opacity");
    		currentDisplay = currentDisplay == "1" ? opacity : "1";
    		return currentDisplay;
    	});
    	d3.selectAll("circle:not([group='"+d.group+"'])")
    	.transition().duration(transitionPeriod).style("opacity",function() {
    		var currentDisplay = d3.select(this).style("opacity");
    		currentDisplay = currentDisplay == "1" ? opacity : "1";
    		return currentDisplay;
    	});
    	d3.selectAll("text:not([group='"+d.group+"'])")
    	.transition().duration(transitionPeriod).style("opacity",function() {
    		var currentDisplay = d3.select(this).style("opacity");
    		currentDisplay = currentDisplay == "1" ? opacity : "1";
    		return currentDisplay;
    	});
    	
    })
    .on("mouseover", function(d) {
    		d3.select(this).style("cursor", "crosshair"); 
    	})
    .on("mouseout", function(d) {
    		d3.select(this).style("cursor", "default"); 
    });
	
  var node = g
     .attr("class", "nodes")
    .selectAll("circle")
    .data(graph.nodes)
    .enter().append("circle")
    .attr("r", function(d) { return d.color; })
    .attr("fill", "rgba(219,200,125,0.4)")
    .style("stroke-width", 2)
    .style("stroke", "rgba(230,186,146)")
    .attr("group",function(d) {return d.group;} )
    .call(d3.drag()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended))
		.on("click", function(d) {
			$("#dialog").dialog('open');
			f=fields; // get all the fields from the JS data file.
	        var table_text = '<table class="table" id="summary">';
	        var undefcount=0; // This counts the undefined fields
	        for(var i=3; i<f.length; i++) { // only use the fields from 4 to length
	        	if (d[f[i].name]+"" == 'undefined') {
	        		undefcount++;
	        	}
	        	table_text+="<tr><td>"+f[i].name+"</td><td>"+d[f[i].name]+"</td></tr>";
	        }
	        table_text+="</table>";  
	        if (undefcount == f.length-3) {
	        	table_text="No further information available for this type of node";

	        }
	        if (f.length < 4) {
	        	table_text+="No additional fields defined see config page to set up."
	        }
	        $("#dialog").html(table_text);
	 
	        return false;
	
		})
		.on("mouseover", function(d) {
		    	d3.select(this).style("cursor", "pointer");
	    	})
	    .on("mouseout", function(d) {
	    		d3.select(this).style("cursor", "default"); 
	    })	
	    ;
          
	// This is the label for each node
	var text = g.selectAll("text")
		.data(graph.nodes)
		.enter().append("text")
		.attr("dx",0)
		.attr("dy",0)
    .style('fill', "#444444")
    .attr("font-size", function(d) { if (d.color < 18) {
  return 40;
} else {
  return d.color *1.5;
}; })





		.text(function(d) { return d.id;})
		.attr("text-anchor", "middle")
	  .attr("group",function(d) {return d.group;} )	;
		
  node.append("title")
      .text(function(d) { return d.id; });

  simulation
      .nodes(graph.nodes)
      .on("tick", ticked);

  simulation.force("link")
      .links(graph.links);
      
  function neighboring(a, b) {

		return graph.links.some(function(d) {
		    return (d.source.id === a.source.id && d.target.id === b.target.id)
		        || (d.source.id === b.source.id && d.target.id === a.target.id);
		  });
	}

  function ticked() {
    link
        .attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

    node
        .attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; });
    text
	     .attr("x", function(d) { return d.x; })
	     .attr("y", function(d) { return d.y; });
  }
});



//Used to drag the graph round the screen
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

// This is the zoom handler
var zoom_handler = d3.zoom()
  .on("zoom", zoom_actions);
	  
//specify what to do when zoom event listener is triggered
function zoom_actions(){
	g.attr("transform", d3.event.transform);
	var transform = d3.zoomTransform(this);
	$('#zoomlevel').text("Zoom: "+transform.k.toFixed(3));
}

// initial scaling on the svg container - this means everything in it is scaled as well
svg.call(zoom_handler)
.call(zoom_handler.transform, d3.zoomIdentity.scale(0.1,0.1))
;

zoom_handler(svg);
	  


  
