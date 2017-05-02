// [88, 134, 83, 32, 105, 180, 37, 17, 1, 16, 130, 5, 1]
/* Industry Co - Ordinate */
// var coordinates = [
//                 {x:300, y:550},   // 0
//                 {x:500, y:350},   // 1
//                 {x:500, y:550},   // 2
//                 {x:900, y:550},    // 3
//                 {x:900, y:350},    // 4
//                 {x:300, y:350},   // 5
//                 {x:700, y:550},   // 6
//                 {x:300, y:750},   // 7
//                 {x:750, y:790},   // 8
//                 {x:500, y:750},   // 9
//                 {x:700, y:350},   // 10
//                 {x:650, y:750},   // 11
//               ];

var coordinates = [
                {x:300, y:350},   // 0
                {x:500, y:350},   // 1
                {x:700, y:350},   // 2
                {x:900, y:350},    // 3
                {x:300, y:550},    // 4
                {x:500, y:550},   // 5
                {x:700, y:550},   // 6
                {x:900, y:550},   // 7
                {x:300, y:780},   // 8
                {x:500, y:780},   // 9
                {x:700, y:780},   // 10
                {x:950, y:780},   // 11
              ];

var lbl_coordinates = [
                {x:200, y:430},   // 0
                {x:480, y:430},   // 1
                {x:800, y:430},   // 2
                {x:1050, y:430},   // 3
                {x:200, y:780},   // 4
                {x:480, y:780},   // 5
                {x:800, y:780},   // 6
                {x:1050, y:780},   // 7
                {x:200, y:1050},   // 8
                {x:480, y:1050},   // 9
                {x:800, y:1050},   // 10
                {x:1050, y:1050},  // 11
              ];
// var lbl_coordinates = [
//                 {x:200, y:780},   // 0
//                 {x:530, y:450},   // 1
//                 {x:500, y:780},   // 2
//                 {x:1050, y:780},   // 3
//                 {x:1050, y:450},   // 4
//                 {x:200, y:450},   // 5
//                 {x:800, y:780},   // 6
//                 {x:200, y:1000},   // 7
//                 {x:830, y:1000},   // 8
//                 {x:500, y:1000},   // 9
//                 {x:800, y:450},   // 10
//                 {x:1050, y:1000},  // 11
//                 {x:1050, y:1000}   // 12
//               ];
/* Show By Net Income */
/*
*   x : Net Income
*   x < 0 
*   0 < x <= 20 
*   20 < x <= 50 
*   50 < x <= 100 
*   x > 100 
*/
var netIncomeCenterPos = [
  {x: 270,y: 350},
  {x: 380,y: 350},
  {x: 550,y: 350},
  {x: 720,y: 350},
  {x: 850,y: 350},
];
var lbl_netIncome = [
  {x: 100,y: 600, value:"Net Income < 0"},
  {x: 250,y: 600, value:"0 < Net Income <= $20"},
  {x: 450,y: 600, value:"$20 < Net Income <= $50"},
  {x: 650,y: 600, value:"$50 < Net Income <= $100"},
  {x: 950,y: 600, value:"Net Income > $100"}
];

var stroke_lg = [
  {id:1, size: 1, value :"Revenue < US$100M"},
  {id:2,size: 3, value :"US$100M < Revenue < US$500M"},
  {id:3,size: 6, value :"Revenue > US$500M"}
]

// var opacity_lg = [
//   {size: 0.4, value = "Year >= 2016"},
//   {size: 0.7, value = "2014 <= Year < 2016"},
//   {size: 1, value =   "Year < 2014"}
// ]
/* Show By Scores */

var scoresCenterPos = [
  {x: 350,y: 350},
  {x: 650,y: 350},
  {x: 850,y: 350}
];
var lbl_scores = [
  {id:3, x: 250,y: 600, value:"Year < 2014"},
  {id:2, x: 650,y: 600, value:"2014 <= Year < 2016"},
  {id:1, x: 950,y: 600, value:"Year >= 2016"}
];


/* color pallette */
var colors = ["#f44336" ,"#e91e63" ,"#9c27b0" ,"#673ab7" ,"#3f51b5" ,"#2196f3" ,"#03a9f3" ,"#00bcd4" ,"#009688" ,"#4caf50" ,"#8bc34a" ,"#cddc39" ,"#ffeb3b" ,"#ffc107" ,"#ff9800" ,"#ff5722" ,"#795548" ,"#9e9e9e" ,"#607d8b"];
var border_colors = ["#f44336" ,"#e91e63" ,"#9c27b0" ,"#673ab7" ,"#3f51b5" ,"#2196f3" ,"#03a9f3" ,"#00bcd4" ,"#009688" ,"#4caf50" ,"#8bc34a" ,"#cddc39" ,"#ffeb3b" ,"#ffc107" ,"#ff9800" ,"#ff5722" ,"#795548" ,"#9e9e9e" ,"#607d8b"];

/* Translate Function */

function translate(str, lang)
{
  var localstr  = []

  localstr["cn"] = {
    "target"    : "公司",
    "industries": "产业",
    "revenue"   : "营收",
    "all"       : "所有的项目",
    "industry"  : "按产业别",
    "netincome" : "按净利的大小",
    "scores"    : "独家项目热度预测 ",
    "finance & business services" : "金融 & 商务服务",
    "healthcare & biotech"  : "医疗保健 & 生物技术",
    "consumer products & retail & e-commerce" : "消费品 & 零售 & 电子商务",
    "agriculture & food"  : "农业 & 食品",
    "industrials" : "工业",
    "energy & materials"  : "能源 & 矿业",
    "real estate & hospitality" : "房地产 & 酒店",
    "aerospace & defense" : " 航空 & 国防",
    "materials & chemicals"  : "材料 & 化学",
    "entertainment"  : "招待",
    "tmt" : "科技 & 电信 & 媒体",
    "transportation"  : "运输",
    "education" : "教育",
    "automotive"  : "自动化",
    "energy"  : "能量",
    "real estate"  : "房地产"
  };
  localstr["en"] = {
    "target"    : "Target",
    "industries": "Industry",
    "revenue"   : "Revenue",
    "all"       : "All Companies",
    "industry"  : "Targets By Industries",
    "netincome" : "Targets By Net Income",
    "scores"    : "Hot deals & Serra Scores",
    "finance & business services" : "Finance & Business Services",
    "healthcare & biotech"  : "Healthcare & BioTech",
    "consumer products & retail & e-commerce" : "Consumer Products & Retail & E-Commerce",
    "agriculture & food"  : "Agriculture & Food",
    "industrials" : "Industrials",
    "energy & materials"  : "Energy & Materials",
    "real estate & hospitality" : "Real Estate & Hospitality",
    "aerospace & defense" : "Aerospace & Defense",
    "materials & chemicals"  : "Materials & Chemicals",
    "entertainment"  : "Entertainment",
    "tmt" : "TMT",
    "transportation"  : "Transportation",
    "education" : "Education",
    "automotive"  : "Automotive",
    "energy"  : "Energy",
    "real estate"  : "Real Estate",

  };
  return (localstr[lang.toLowerCase()][str.toLowerCase()])?localstr[lang.toLowerCase()][str.toLowerCase()]:str;
}
function url2link(url)
{
  if (!/^https?:\/\//i.test(url)) {
    url = 'http://' + url;
  }
  return url;
}
String.prototype.capitalize = function(){
    return this.replace( /(^|\s)([a-z])/g , function(m,p1,p2){ return p1+p2.toUpperCase(); } );
};
