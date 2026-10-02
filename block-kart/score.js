var KartScore={
  // Stored scores retain integer precision; all user-facing scores use a 100-point scale.
  fromStored(points){return Math.min(100,Math.max(0,Number(points)||0)/10);},
  calculate({correct=0,total=0,laps=0,hits=0}){
    const accuracy=Math.round(Math.min(1,Math.max(0,total?correct/total:0))*600)/10;
    const lapPoints=Math.min(6,Math.max(0,laps))*5,hitPoints=Math.min(5,Math.max(0,hits))*2;
    return {accuracy,laps:lapPoints,hits:hitPoints,points:Math.round((accuracy+lapPoints+hitPoints)*10)/10};
  }
};
