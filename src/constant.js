var coordinates = [
                {x:280, y:700},
                {x:500, y:350},
                {x:350, y:550},
                {x:550, y:550},
                {x:700, y:680},
                {x:750, y:550},
                {x:800, y:350},
                {x:350, y:350},
                {x:370, y:680},
                {x:500, y:680},
                {x:600, y:680},
                {x:650, y:350},
                {x:800, y:680},
                {x:900, y:720},
                {x:900, y:680}
              ];
var lbl_coordinates = [
                {x:120, y:950},
                {x:450, y:520},
                {x:230, y:780},
                {x:530, y:780},
                {x:750, y:950},
                {x:850, y:780},
                {x:950, y:520},
                {x:200, y:520},
                {x:280, y:950},
                {x:450, y:950},
                {x:600, y:950},
                {x:670, y:520},
                {x:900, y:950},
                {x:1050, y:950},
                {x:1050, y:780}
              ];

/* color pallette */
var colors = ["#f44336" ,"#e91e63" ,"#9c27b0" ,"#673ab7" ,"#3f51b5" ,"#2196f3" ,"#03a9f3" ,"#00bcd4" ,"#009688" ,"#4caf50" ,"#8bc34a" ,"#cddc39" ,"#ffeb3b" ,"#ffc107" ,"#ff9800" ,"#ff5722" ,"#795548" ,"#9e9e9e" ,"#607d8b"];

/* Translate Function */

function translate(str, lang)
{
  var localstr  = []

  localstr["cn"] = {
    "target"    : "公司",
    "industries": "产业",
    "revenue"   : "营收",
    "all"       : "所有的公司",
    "industry"  : "公司按产业",
    "finance & business services" : "金融 & 商务服务",
    "healthcare & biotech"  : "医疗保健 & 生物技术",
    "consumer products & retail & e-commerce" : "消费品 & 零售 & 电子商务",
    "agriculture & food"  : "农业 & 食品",
    "industrials" : "工业",
    "energy & infrastructure & construction"  : "能源 & 基础设施 & 建设",
    "real estate & hospitality" : "房地产 & 酒店",
    "aerospace & defense" : " 航空 & 国防",
    "materials & chemicals"  : "材料 & 化学",
    "entertainment"  : "招待",
    "tmt" : "数字新媒体",
    "transportation"  : "运输",
    "education" : "教育",
    "automotive"  : "自动化"
  };
  localstr["en"] = {
    "target"    : "Target",
    "industries": "Industry",
    "revenue"   : "Revenue",
    "all"       : "All Companies",
    "industry"  : "Targets By Industries",
    "finance & business services" : "Finance & Business Services",
    "healthcare & biotech"  : "Healthcare & BioTech",
    "consumer products & retail & e-commerce" : "Consumer Products & Retail & E-Commerce",
    "agriculture & food"  : "Agriculture & Food",
    "industrials" : "Industrials",
    "energy & infrastructure & construction"  : "Energy & Infrastructure & Construction",
    "real estate & hospitality" : "Real Estate & Hospitality",
    "aerospace & defense" : "Aerospace & Defense",
    "materials & chemicals"  : "Materials & Chemicals",
    "entertainment"  : "Entertainment",
    "tmt" : "TMT",
    "transportation"  : "Transportation",
    "education" : "Education",
    "automotive"  : "Automotive"
  };
  return (localstr[lang.toLowerCase()][str.toLowerCase()])?localstr[lang.toLowerCase()][str.toLowerCase()]:str.toLowerCase().capitalize();
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
