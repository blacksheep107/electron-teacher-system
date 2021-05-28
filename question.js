var ACCESS_TOKEN=null;
function loadUnitQuestions(){
    // 显示几个单元
    var globalData=require('./globalData');
    // console.log(globalData);
    getAccess().then(()=>{
        const getht=new XMLHttpRequest();
        let classid=document.querySelector('.classid').innerHTML.substring(5);
        // console.log(classid);
        getht.open('POST',`https://api.weixin.qq.com/tcb/databasequery?access_token=${ACCESS_TOKEN}`,true);
        let data={
            "env":"fzuanswersystem-7g3gmzjw761ecfdb",
            "query":`db.collection(\'class\').where({classid:'${classid}'}).limit(100).get()`
        }
        getht.send(JSON.stringify(data));
        getht.onreadystatechange=e=>{
            if(getht.readyState==4){
                let info=JSON.parse(JSON.parse(getht.responseText).data).homework;
                console.log(info);
                let allUnits=document.querySelector('.allUnits');
                Object.keys(info).forEach(function(i){
                    console.log(info[i]);
                    // info[i] 一个单元所有题目id
                    for(let j=0;j<info[i].length;j++){
                        getQuestion(info[i][j]);
                    }
                    let newnode=document.createElement('div');
                    newnode.innerHTML=`<p>${info[i].key}</p>`
                })
            }
        }
    })
}
function getQuestion(id){
    const getht=new XMLHttpRequest();
    getht.open('POST',`https://api.weixin.qq.com/tcb/databasequery?access_token=${ACCESS_TOKEN}`,true);
    let data={
        "env":"fzuanswersystem-7g3gmzjw761ecfdb",
        "query":`db.collection(\'questions\').doc('${id}').get()`
    }
    getht.send(JSON.stringify(data));
    getht.onreadystatechange=e=>{
        if(getht.readyState==4){
            let ques=JSON.parse(getht.responseText);
            console.log(ques);
        }
    }
}
function getAccess(){
    return new Promise(resolve=>{
        const http=new XMLHttpRequest();
        const APPID='wx53d4c253e80f5250';
        const APPSECRET='99bfb8dd8bf3736bf4cd0103722b8fbc';
        http.open("GET",`https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${APPID}&secret=${APPSECRET}`);
        http.send();
        http.onreadystatechange=e=>{
            if(http.readyState==4){
                ACCESS_TOKEN=JSON.parse(http.responseText).access_token;
                resolve();
            }
        }        
    })
}
function addHomework(){

}