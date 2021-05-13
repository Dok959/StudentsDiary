const { zingchart } = require('./zingchart-nodejs.min.js');

zingchart.DEV.CANVASVERSION = 2;

const chartData = {
    "type":"line",
    "title":{
        "text":"Chart Demo"
    },
    "series":[
        {
            "values":[69,68,54,48,70,74,98,70,72,68,49,69]
        }
    ]
};

zingchart.render({
    id : 'zc',
    width : 600,
    height : 400,

    data : chartData,
    // dataurl : "http://url.path.to/chart.json",
    filetype : 'png', // png or jpeg
    filename : 'out.png'
});

$(document).append(chartData);

// Возврат к основной странице
function returnDashboard() {
    window.location.href = '/dashboard';
}