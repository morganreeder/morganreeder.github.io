d3.csv('data/supermovie.csv')
    .then(dataIsReady);

var colNone = '#93A2A9';
var colNoneLight = '#C9D1D4'
var colWoman = '#F52F57';
var colPOC = '#2274A5';
var colDark = '#5C656A';

// Define WOC gradient
var WOCgradient = d3.select('svg')
  .append('defs').append('linearGradient')
  .attr("id",'WOC')
  .attr('x1','0%')
  .attr('y1','0%')
  .attr('x2','100%')
  .attr('y2','0%')
  .attr('spreadMethod','pad');
WOCgradient.append('stop')
  .attr('offset','50%')
  .attr('stop-color',colWoman)
  .attr('stop-opacity',1);
WOCgradient.append('stop')
  .attr('offset','50%')
  .attr('stop-color',colPOC)
  .attr('stop-opacity',1);

var popup;

//padding: to center of first dot
var leftPad = 40;
var topPad = 12;

// Layout for main chart
function mainLayout(data) {
    var startYr = 1977, i = 0;
    
    data.forEach( function(d) {
        d.layout = {};
        
        var thisYr = d.year;
        if (thisYr == startYr) {
            i = i+1;
        } else {
            i = 0;
            startYr = thisYr;
        }
        d.layout.y = (200+topPad)-(i*25+12);
        d.layout.x = (thisYr-1978)*25+leftPad;
    })   
}

// Layout for secondary dot plots
function secLayout(data) {
    var cellSize = 15, numCols=15;
    data.forEach(function(d,i) {
        d.layout={};
        var col = i % numCols;
        d.layout.x = col*cellSize+cellSize/2;
        var row = Math.floor(i/numCols);
        d.layout.y = row*cellSize+cellSize/2;
    })
}

// Math and scale for earnings bar charts
function earnings(data,year,title) {
    var yrMovies = data.filter(function(d) {return d.year == year & d.movie_title != title});
    var sumGross = 0;
    for (i=0;i<yrMovies.length;i++) {
        sumGross = sumGross + parseFloat(yrMovies[i].gross_mil);
    }
    var avgGross = sumGross/yrMovies.length;
    var theMovie = data.filter(function(d) {return d.movie_title == title});
    var movieGross = parseFloat(theMovie[0].gross_mil);
    var barScale = d3.scaleLinear()
                     .domain([0,movieGross]).range([0,180]);
    var movieGrossScale = barScale(movieGross);
    var avgGrossScale = barScale(avgGross);
    var gross = [movieGrossScale,movieGross,avgGrossScale,avgGross];
    return gross;
}

// Template for movie detail popup
function popupTemplate(d) {
    var title = d.movie_title;
    var year = d.year;
    var studio = d.studio;
    var director = d.director;
    var star = d.star1;
    var image = d.img;
    
    var html = '';
    html += '<img class="popup" src="' + image + '" />'
    html += '<div class="popup"><p><strong>' + title + '</strong><br />';
    html += '<em>' + year + '</em></p>';
    html += '<p>Directed by: ' + director + '<br />';
    html += 'Starring: ' + star + '</p></div>';
    return html;
}

// Main chart circles
function updateChart(data) {
    mainLayout(data);
    d3.select('svg g.main-chart g.dots')
      .selectAll('circle')
      .data(data)
      .enter()
      .filter(function(d) {return d.year < 2019;})
      .append('circle')
      .attr('cx', function(d) {return d.layout.x;})
      .attr('cy', function(d) {return d.layout.y;})
      .attr('r', 9)
      .style('fill',function(d) {
        if (d.combined_dem == 2) {
            return colPOC;
        } else if (d.combined_dem == 0) {
            return colNone;
        } else {
            return colWoman;
        }})
      .on('mouseover',function(d) {
        popup.point(d3.event.clientX,d3.event.clientY);
        popup.html(popupTemplate(d));
        popup.draw();
        })
      .on('mouseout',function(d) {
        popup.hide();
        })
      .filter(function(d) {
        return d.movie_title == 'Catwoman';})
        .style('fill','url(#WOC)');
    
    // future releases
    d3.select('svg g.main-chart g.dots')
      .selectAll('circle')
      .data(data)
      .enter()
      .filter(function(d) {return d.year > 2018;})
      .append('circle')
      .attr('cx', function(d) {return d.layout.x;})
      .attr('cy', function(d) {return d.layout.y;})
      .attr('r', 8)
      .style('fill','#FFF')
      .style('stroke',function(d) {
        if (d.combined_dem == 2) {
            return colPOC;
        } else if (d.combined_dem == 0) {
            return colNone;
        } else {
            return colWoman;
        }})
      .style('stroke-width',2)
      .on('mouseover',function(d) {
        popup.point(d3.event.clientX,d3.event.clientY);
        popup.html(popupTemplate(d));
        popup.draw();
        })
      .on('mouseout',function(d) {
        popup.hide();
        })
      .filter(function(d) {
        return d.movie_title == 'Birds of Prey';})
        .style('stroke','url(#WOC)');
}

// Grid for main chart
function updateGrid() {
    var years = [1980,1990,2000,2010,2020];
    d3.select('svg g.main-chart .grid')
      .selectAll('line')
      .data(years)
      .enter()
      .append('line')
      .attr('x1',function(d) {
        return (d-1978)*25+leftPad;
        })
      .attr('x2',function(d) {
        return (d-1978)*25+leftPad;
        })
      .attr('y1',topPad+15)
      .attr('y2',200+topPad)
      .attr('stroke','#93A2A9')
      .attr('stroke-opacity',0.1);
    
    d3.select('svg g.main-chart .year-labels')
      .selectAll('text')
      .data(years)
      .enter()
      .append('text')
      .attr('y',240)
      .attr('x',function(d) {
        return (d-1978)*25+leftPad;
        })
      .text(function(d) {
        return d
        })
      .style('text-anchor','middle')
      .style('fill','#93A2A9');
}

// Secondary charts
function updateSecChart(data) {
    // Place text
    var x_w=30;
    var x_poc=480;
    var x_future=770;
    d3.select('svg g.sec-chart .w_panel .content')
      .selectAll('text')
      .attr('class','sec-text')
      .attr('x',x_w+10);
    d3.select('svg g.sec-chart .poc_panel .content')
      .selectAll('text')
      .attr('class','sec-text')
      .attr('x',x_poc+10);
    d3.select('svg g.sec-chart .future_panel .content')
      .selectAll('text')
      .attr('class','sec-text')
      .attr('x',x_future+10);
    
    var rectTop = 300;
    // Women panel
    // Draw panel
    d3.select('svg g.sec-chart .w_panel .box')
      .append('rect')
      .attr('x',x_w)
      .attr('y',rectTop)
      .attr('width',250)
      .attr('height',525)
      .style('fill','#FFF')
      .style('stroke',colWoman)
      .style('stroke-width',1);
    d3.select('svg g.sec-chart .w_panel .sec-header')
      .append('text')
      .text('Women')
      .attr('x',60)
      .attr('y',rectTop-6)
      .style('fill',colWoman);
    d3.select('svg g.sec-chart .w_panel .sec-header')
      .append('circle')
      .attr('cx',50)
      .attr('cy',rectTop-15)
      .attr('r',6)
      .style('fill',colWoman);
    d3.select('svg g.sec-chart .w_panel .connector')
      .append('line')
      .attr('x1',(1984-1978)*25+leftPad)
      .attr('x2',(1984-1978)*25+leftPad)
      .attr('y1',200)
      .attr('y2',rectTop)
      .style('stroke',colWoman)
      .style('stroke-width',1)
      .style('stroke-dasharray','2,2');
    
    // Charts for Women panel

    // Star dot plot
    var data_star_w = data.filter(function(d) {return d.year < 2019;}).sort(function(a,b) { return b.star_w - a.star_w || a.year - b.year;});
    secLayout(data_star_w);
    d3.select('svg g.sec-chart .w_panel .content .star_dot')
      .selectAll('circle')
      .data(data_star_w)
      .enter()
      .append('circle')
      .attr('cx',function(d) {return d.layout.x+x_w+8;})
      .attr('cy',function(d) {return d.layout.y+430;})
      .attr('r',5)
      .style('fill',function(d) {
        if (d.star_w==1) {
            return colWoman;
        } else {
            return colNoneLight;
        }
        })
      .on('mouseover',function(d) {
        popup.point(d3.event.clientX,d3.event.clientY);
        popup.html(popupTemplate(d));
        popup.draw();
        })
      .on('mouseout',function(d) {
        popup.hide();
        });
    // Director dot plot
    var data_dir_w = data.filter(function(d) {return d.year < 2019;}).sort(function(a,b) { return b.director_w - a.director_w || a.year - b.year;});
    secLayout(data_dir_w);
    d3.select('svg g.sec-chart .w_panel .content .dir_dot')
      .selectAll('circle')
      .data(data_dir_w)
      .enter()
      .append('circle')
      .attr('cx',function(d) {return d.layout.x+x_w+8;})
      .attr('cy',function(d) {return d.layout.y+540;})
      .attr('r',5)
      .style('fill',function(d) {
        if (d.director_w==1) {
            return colWoman;
        } else {
            return colNoneLight;
        }
        })
      .on('mouseover',function(d) {
        popup.point(d3.event.clientX,d3.event.clientY);
        popup.html(popupTemplate(d));
        popup.draw();
        })
      .on('mouseout',function(d) {
        popup.hide();
        });
    // Earnings bar chart
    gross = earnings(data,2017,'Wonder Woman');
    // Baseline
    d3.select('svg g.sec-chart .w_panel .content .earnings')
      .append('line')
      .attr('x1',x_w+8)
      .attr('x2',x_w+8)
      .attr('y1',690)
      .attr('y2',765)
      .style('stroke',colNoneLight)
      .style('opacity',0.5);
    // Wonder Woman bar
    d3.select('svg g.sec-chart .w_panel .content .earnings')
      .append('rect')
      .attr('x',x_w+8)
      .attr('y',695)
      .attr('height',30)
      .attr('width',gross[0])
      .style('fill',colWoman);
    d3.select('svg g.sec-chart .w_panel .content .earnings')
      .append('text')
      .attr('x',x_w+18)
      .attr('y',715)
      .style('fill','#FFF')
      .style('font-weight','bold')
      .attr('class','bar-label')
      .text('Wonder Woman');
    d3.select('svg g.sec-chart .w_panel .content .earnings')
      .append('text')
      .attr('x',x_w+8+gross[0]+5)
      .attr('y',715)
      .style('fill',colNone)
      .attr('class','bar-label')
      .text('$'+Math.round(gross[1])+'M');
    // Other 2017 bar
    d3.select('svg g.sec-chart .w_panel .content .earnings')
      .append('rect')
      .attr('x',x_w+8)
      .attr('y',730)
      .attr('height',30)
      .attr('width',gross[2])
      .style('fill',colNone);
    d3.select('svg g.sec-chart .w_panel .content .earnings')
      .append('text')
      .attr('x',x_w+18)
      .attr('y',750)
      .style('fill','#FFF')
      .attr('class','bar-label')
      .text('Other 2017');
    d3.select('svg g.sec-chart .w_panel .content .earnings')
      .append('text')
      .attr('x',x_w+8+gross[2]+5)
      .attr('y',750)
      .style('fill',colNone)
      .attr('class','bar-label')
      .text('$'+Math.round(gross[3])+'M');

    // POC panel
    // Draw panel
    d3.select('svg g.sec-chart .poc_panel .box')
      .append('rect')
      .attr('x',x_poc)
      .attr('y',rectTop)
      .attr('width',250)
      .attr('height',525)
      .style('fill','#FFF')
      .style('stroke',colPOC)
      .style('stroke-width',1);
    d3.select('svg g.sec-chart .poc_panel .sec-header')
      .append('text')
      .text('People of Color')
      .attr('x',590)
      .attr('y',rectTop-6)
      .style('fill',colPOC);
    d3.select('svg g.sec-chart .poc_panel .sec-header')
      .append('circle')
      .attr('cx',580)
      .attr('cy',rectTop-15)
      .attr('r',6)
      .style('fill',colPOC);
    d3.select('svg g.sec-chart .poc_panel .connector')
      .append('line')
      .attr('x1',(1998-1978)*25+leftPad)
      .attr('x2',(1998-1978)*25+leftPad)
      .attr('y1',200)
      .attr('y2',rectTop)
      .style('stroke',colPOC)
      .style('stroke-width',1)
      .style('stroke-dasharray','2,2');
    
    // Charts for POC panel
    var data_star_poc = data.filter(function(d) {return d.year < 2019;}).sort(function(a,b) { return b.star_poc - a.star_poc || a.year - b.year;});
    secLayout(data_star_poc);
    d3.select('svg g.sec-chart .poc_panel .content .star_dot')
      .selectAll('circle')
      .data(data_star_poc)
      .enter()
      .append('circle')
      .attr('cx',function(d) {return d.layout.x+x_poc+8;})
      .attr('cy',function(d) {return d.layout.y+430;})
      .attr('r',5)
      .style('fill',function(d) {
        if (d.star_poc==1) {
            return colPOC;
        } else {
            return colNoneLight;
        }
        })
      .on('mouseover',function(d) {
        popup.point(d3.event.clientX,d3.event.clientY);
        popup.html(popupTemplate(d));
        popup.draw();
        })
      .on('mouseout',function(d) {
        popup.hide();
        });
    // Director dot plot
    var data_dir_poc = data.filter(function(d) {return d.year < 2019;}).sort(function(a,b) { return b.director_poc - a.director_poc || a.year - b.year;});
    secLayout(data_dir_poc);
    d3.select('svg g.sec-chart .poc_panel .content .dir_dot')
      .selectAll('circle')
      .data(data)
      .enter()
      .append('circle')
      .attr('cx',function(d) {return d.layout.x+x_poc+8;})
      .attr('cy',function(d) {return d.layout.y+540;})
      .attr('r',5)
      .style('fill',function(d) {
        if (d.director_poc==1) {
            return colPOC;
        } else {
            return colNoneLight;
        }
        })
      .on('mouseover',function(d) {
        popup.point(d3.event.clientX,d3.event.clientY);
        popup.html(popupTemplate(d));
        popup.draw();
        })
      .on('mouseout',function(d) {
        popup.hide();
        });
    // Earnings bar chart
    gross = earnings(data,2018,'Black Panther');
    // Baseline
    d3.select('svg g.sec-chart .poc_panel .content .earnings')
      .append('line')
      .attr('x1',x_poc+8)
      .attr('x2',x_poc+8)
      .attr('y1',690)
      .attr('y2',765)
      .style('stroke',colNoneLight)
      .style('opacity',0.5);
    // Black Panther bar
    d3.select('svg g.sec-chart .poc_panel .content .earnings')
      .append('rect')
      .attr('x',x_poc+8)
      .attr('y',695)
      .attr('height',30)
      .attr('width',gross[0])
      .style('fill',colPOC);
    d3.select('svg g.sec-chart .poc_panel .content .earnings')
      .append('text')
      .attr('x',x_poc+18)
      .attr('y',715)
      .style('fill','#FFF')
      .style('font-weight','bold')
      .attr('class','bar-label')
      .text('Black Panther');
    d3.select('svg g.sec-chart .poc_panel .content .earnings')
      .append('text')
      .attr('x',x_poc+8+gross[0]+5)
      .attr('y',715)
      .style('fill',colNone)
      .attr('class','bar-label')
      .text('$'+Math.round(gross[1])+'M');
    // Other 2018 bar
    d3.select('svg g.sec-chart .poc_panel .content .earnings')
      .append('rect')
      .attr('x',x_poc+8)
      .attr('y',730)
      .attr('height',30)
      .attr('width',gross[2])
      .style('fill',colNone);
    d3.select('svg g.sec-chart .poc_panel .content .earnings')
      .append('text')
      .attr('x',x_poc+18)
      .attr('y',750)
      .style('fill','#FFF')
      .attr('class','bar-label')
      .text('Other 2018');
    d3.select('svg g.sec-chart .poc_panel .content .earnings')
      .append('text')
      .attr('x',x_poc+8+gross[2]+5)
      .attr('y',750)
      .style('fill',colNone)
      .attr('class','bar-label')
      .text('$'+Math.round(gross[3])+'M');
    
    // The future panel
    // Draw panel
    d3.select('svg g.sec-chart .future_panel .box')
      .append('rect')
      .attr('x',x_future)
      .attr('y',rectTop)
      .attr('width',330)
      .attr('height',360)
      .style('fill','#FFF')
      .style('stroke',colNone)
      .style('stroke-width',1);
    d3.select('svg g.sec-chart .future_panel .sec-header')
      .append('text')
      .text('The Future')
      .attr('x',800)
      .attr('y',rectTop-6)
      .style('fill',colDark);
    d3.select('svg g.sec-chart .future_panel .sec-header')
      .append('circle')
      .attr('cx',790)
      .attr('cy',rectTop-15)
      .attr('r',5)
      .style('fill','#FFF')
      .style('stroke',colNone)
      .style('stroke-width',2);
    d3.select('svg g.sec-chart .future_panel .connector')
      .append('line')
      .attr('x1',(2018-1978)*25+leftPad+12.5)
      .attr('x2',(2018-1978)*25+leftPad+12.5)
      .attr('y1',30)
      .attr('y2',rectTop)
      .style('stroke',colNone)
      .style('stroke-width',1)
      .style('stroke-dasharray','2,2');
    
    // Charts for future panel
    // future women stars
    var future_star_w = data.filter(function(d) {return d.year > 2018;}).sort(function(a,b) { return b.star_w - a.star_w || a.year - b.year;});
    secLayout(future_star_w);
    d3.select('svg g.sec-chart .future_panel .content .star_dot_w')
      .selectAll('circle')
      .data(future_star_w)
      .enter()
      .append('circle')
      .attr('cx',function(d) {return d.layout.x+x_future+8;})
      .attr('cy',function(d) {return d.layout.y+390;})
      .attr('r',5)
      .style('fill','#FFF')
      .style('stroke',function(d) {
        if (d.star_w==1) {
            return colWoman;
        } else {
            return colNoneLight;
        }
        })
      .style('stroke-width',1.5)
      .on('mouseover',function(d) {
        popup.point(d3.event.clientX,d3.event.clientY);
        popup.html(popupTemplate(d));
        popup.draw();
        })
      .on('mouseout',function(d) {
        popup.hide();
        });
    // future women directors
    var future_dir_w = data.filter(function(d) {return d.year > 2018;}).sort(function(a,b) { return b.director_w - a.director_w || a.year - b.year;});
    secLayout(future_dir_w);
    d3.select('svg g.sec-chart .future_panel .content .dir_dot_w')
      .selectAll('circle')
      .data(future_dir_w)
      .enter()
      .append('circle')
      .attr('cx',function(d) {return d.layout.x+x_future+8;})
      .attr('cy',function(d) {return d.layout.y+455;})
      .attr('r',5)
      .style('fill','#FFF')
      .style('stroke',function(d) {
        if (d.director_w==1) {
            return colWoman;
        } else {
            return colNoneLight;
        }
        })
      .style('stroke-width',1.5)
      .on('mouseover',function(d) {
        popup.point(d3.event.clientX,d3.event.clientY);
        popup.html(popupTemplate(d));
        popup.draw();
        })
      .on('mouseout',function(d) {
        popup.hide();
        });
    // future poc stars
    var future_star_poc = data.filter(function(d) {return d.year > 2018;}).sort(function(a,b) { return b.star_poc - a.star_poc || a.year - b.year;});
    secLayout(future_star_poc);
    d3.select('svg g.sec-chart .future_panel .content .star_dot_poc')
      .selectAll('circle')
      .data(future_star_poc)
      .enter()
      .filter(function(d) {return d.year > 2018;})
      .append('circle')
      .attr('cx',function(d) {return d.layout.x+x_future+8;})
      .attr('cy',function(d) {return d.layout.y+525;})
      .attr('r',5)
      .style('fill','#FFF')
      .style('stroke',function(d) {
        if (d.star_poc==1) {
            return colPOC;
        } else {
            return colNoneLight;
        }
        })
      .style('stroke-width',1.5)
      .on('mouseover',function(d) {
        popup.point(d3.event.clientX,d3.event.clientY);
        popup.html(popupTemplate(d));
        popup.draw();
        })
      .on('mouseout',function(d) {
        popup.hide();
        });
    // future poc directors
    var future_dir_poc = data.filter(function(d) {return d.year > 2018;}).sort(function(a,b) { return b.director_poc - a.director_poc || a.year - b.year;});
    secLayout(future_dir_poc);
    d3.select('svg g.sec-chart .future_panel .content .dir_dot_poc')
      .selectAll('circle')
      .data(future_dir_poc)
      .enter()
      .filter(function(d) {return d.year > 2018;})
      .append('circle')
      .attr('cx',function(d) {return d.layout.x+x_future+8;})
      .attr('cy',function(d) {return d.layout.y+625;})
      .attr('r',5)
      .style('fill','#FFF')
      .style('stroke',function(d) {
        if (d.director_poc==1) {
            return colPOC;
        } else {
            return colNoneLight;
        }
        })
      .style('stroke-width',1.5)
      .on('mouseover',function(d) {
        popup.point(d3.event.clientX,d3.event.clientY);
        popup.html(popupTemplate(d));
        popup.draw();
        })
      .on('mouseout',function(d) {
        popup.hide();
        });
    
    // Annotations
    var x_annotations=380;
    d3.select('svg g.sec-chart .annotations')
      .append('circle')
      .attr('cx',345)
      .attr('cy',443)
      .attr('r',8)
      .style('fill','url(#WOC)');
    d3.select('svg g.sec-chart .annotations')
      .selectAll('text')
      .attr('x',x_annotations)
      .attr('text-anchor','middle')
      .attr('class','sec-text');
    d3.select('svg g.sec-chart .annotations .headers')
      .append('text')
      .text('Actors')
      .attr('text-anchor','middle')
      .attr('x',x_annotations)
      .attr('y',425)
      .style('fill',colDark);
    d3.select('svg g.sec-chart .annotations .headers')
      .append('text')
      .text('Directors')
      .attr('text-anchor','middle')
      .attr('x',x_annotations)
      .attr('y',540)
      .style('fill',colDark);
    d3.select('svg g.sec-chart .annotations .headers')
      .append('text')
      .text('Earnings')
      .attr('text-anchor','middle')
      .attr('x',x_annotations)
      .attr('y',655)
      .style('fill',colDark);
    
    d3.select('svg g.sec-chart')
      .style('visibility','visible');
      
}

function dataIsReady(data) {
    var sortedMain = data.sort(function(a,b) { return a.year - b.year || a.combined_dem - b.combined_dem;});
    updateChart(sortedMain);
    updateGrid();
    updateSecChart(data);
    popup = Popup();
}

