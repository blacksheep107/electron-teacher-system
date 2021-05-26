var dialog;
var globalData;
var typearr=['单选题','多选题','填空题'];
var hardlevel=['易','中','难'];
var countsingle=0;
var countmore=0;
function onLoad(){
    var doc=document.querySelector('.form');
    var selectblock=document.querySelector('.selectblock');
    // console.log(document.getElementsByTagName('select'));
    globalData=require('./globalData');
    console.log(globalData);
    // 添加下拉框
    if(!document.querySelector('select')){
        let selectClass=document.createElement('select');
        selectClass.innerHTML='';
        let attr=document.createAttribute('id');
        attr.value='selectClass';
        selectClass.setAttributeNode(attr);
        for(let i=0;i<globalData.teacherclass.length;i++){
            selectClass.innerHTML+=`<option>${globalData.teacherclass[i].classname}</option>`;
        }
        let selectType=document.createElement('select');
        let typeattr=document.createAttribute('id');
        typeattr.value='selectType';
        selectType.setAttributeNode(typeattr);
        selectType.innerHTML='';
        for(let i=0;i<typearr.length;i++){
            selectType.innerHTML+=`<option>${typearr[i]}</option>`;
        }
        let selectLevel=document.createElement('select');
        let attr2=document.createAttribute('id');
        attr2.value='selectLevel';
        selectLevel.setAttributeNode(attr2);
        selectLevel.innerHTML='';
        for(let i=0;i<hardlevel.length;i++){
            selectLevel.innerHTML+=`<option>${hardlevel[i]}</option>`;
        }
        selectblock.prepend(selectClass);
        selectblock.prepend(selectType);
        selectblock.prepend(selectLevel);        
    }

    hideAllForm();
    document.querySelector('.selectSingle').classList.add('is-shown');
    document.getElementById('selectType').addEventListener('change',function(e){
        console.log(e.target.value);
        if(e.target.value=='单选题'){
            document.querySelector('.selectSingle').classList.add('is-shown');
            document.querySelector('.selectMore').classList.remove('is-shown');
            document.querySelector('.fillblank').classList.remove('is-shown');
        }else if(e.target.value=='多选题'){
            document.querySelector('.selectSingle').classList.remove('is-shown');
            document.querySelector('.selectMore').classList.add('is-shown');
            document.querySelector('.fillblank').classList.remove('is-shown');
        }else if(e.target.value=='填空题'){
            document.querySelector('.selectSingle').classList.remove('is-shown');
            document.querySelector('.selectMore').classList.remove('is-shown');
            document.querySelector('.fillblank').classList.add('is-shown');
        }
    });
}
function addRadioOption(){
    let newRadio=document.createElement('div');
    newRadio.classList.add('oneoption');
    newRadio.innerHTML=`选项${String.fromCharCode(countsingle+65)}. <input class="opinput" data-s=${String.fromCharCode(countsingle+65)} name="radiocontent" placeholder="填入选项内容"></input> <input type="radio" name="radio"></input>`;
    let selectSingle=document.querySelector('.selectSingleB');
    selectSingle.appendChild(newRadio);
    countsingle++;
}
function hideAllForm(){
    document.querySelector('.selectSingle').classList.remove('is-shown');
    document.querySelector('.selectMore').classList.remove('is-shown');
    document.querySelector('.fillblank').classList.remove('is-shown');
}
function addMoreOption(){
    let newCheck=document.createElement('div');
    newCheck.classList.add('oneoption');
    newCheck.innerHTML=`选项${String.fromCharCode(countmore+65)}. <input class="opinput" data-c=${String.fromCharCode(countmore+65)} name="checkboxcontent" placeholder="填入选项内容"></input> <input type="checkbox" name="checkbox"></input>`;
    let selectMore=document.querySelector('.selectMoreB');
    selectMore.appendChild(newCheck);
    countmore++;
}
function submit(){
    let type=document.getElementById('selectType').value;   // 选择填空
    let questionContent=document.getElementById('selectquestion').value;    // 问题
    let selectLevel=document.getElementById('selectLevel').value;   // 易中难
    let classname=document.getElementById('selectClass').value;
    let answer;
    let answerarr=[];
    let analysis;
    let choosecontent=[];
    let choosenum;
    if(type=='单选题'){
        analysis=document.getElementById('selectanalysis').value;
        let singlearr=document.getElementsByName('radio');
        let ansarr=document.getElementsByName('radiocontent');
        // console.log(singlearr);
        choosenum=1;
        for(let i=0;i<singlearr.length;i++){
            choosecontent.push({
                "content":ansarr[i].value,
                "value":ansarr[i].dataset.s
            });
            if(singlearr[i].checked){
                answer=ansarr[i].dataset.s;
            }
        }
    }else if(type=='多选题'){
        analysis=document.getElementById('selectanalysis2').value;
        questionContent=document.getElementById('selectquestion2').value;
        let singlearr=document.getElementsByName('checkbox');
        let ansarr=document.getElementsByName('checkboxcontent');
        choosenum=0;
        console.log(ansarr);
        for(let i=0;i<singlearr.length;i++){
            choosecontent.push({
                "content":ansarr[i].value,
                "value":ansarr[i].dataset.c
            });
            if(singlearr[i].checked){
                answerarr.push(ansarr[i].dataset.c);
                choosenum++;
            }
        }
    }else if(type=='填空题'){
        analysis=document.getElementById('selectanalysis3').value;
        answer=document.getElementById('fillanswer').value;
        questionContent=document.getElementById('fillquestion').value;
        choosecontent=null;
        choosenum=null;
    }
    let level='easy';
    if(selectLevel=='中')   level='medium';
    else if(selectLevel=='难')  level='hard';
    let qtype='choose';
    if(type=='填空题')  qtype='fillblank';
    let isorder=document.getElementsByName('isOrderBtn')[0].checked;   // true按序
    let data={
        "analysis":analysis,
        "answer":type=='多选题'?answerarr:answer,
        "choosecontent":choosecontent,
        "choosenum":choosenum,
        "content":questionContent,
        "level":level,
        "type":qtype,
        "classname":classname,
        "isorder":type=='多选题'?isorder:null
    }
    console.log(data);
    // 获取classid
    let classid;
    for(let i=0;i<globalData.teacherclass.length;i++){
        if(globalData.teacherclass[i].classname==classname){
            classid=globalData.teacherclass[i].classid;
            break;
        }
    }
    addQuestionTowx(data,classid);
}
function addQuestionTowx(data,classid){
    // question放入详细题目
    // class放入题目id
    const http=new XMLHttpRequest();
    const APPID='wx53d4c253e80f5250';
    const APPSECRET='99bfb8dd8bf3736bf4cd0103722b8fbc';
    http.open("GET",`https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${APPID}&secret=${APPSECRET}`);
    http.send();
    http.onreadystatechange=e=>{
        if(http.readyState==4){
            ACCESS_TOKEN=JSON.parse(http.responseText).access_token;
            var ht=new XMLHttpRequest();
            // question插入
            ht.open('POST',`https://api.weixin.qq.com/tcb/databaseadd?access_token=${ACCESS_TOKEN}`,true);
            let htdata={
                "env":"fzuanswersystem-7g3gmzjw761ecfdb",
                "query":`db.collection(\'${data.level}_question\').add({data:${JSON.stringify(data)}})`
            }
            ht.send(JSON.stringify(htdata));
            ht.onreadystatechange=e=>{
                // console.log(ht.responseText);
                if(ht.readyState==4){
                    let res=JSON.parse(ht.responseText);
                    if(res.errcode==0){
                        // add ok
                        // add to class
                        let _id=res.id_list[0];
                        console.log(_id);
                        const addhttp=new XMLHttpRequest();
                        addhttp.open('POST',`https://api.weixin.qq.com/tcb/databaseupdate?access_token=${ACCESS_TOKEN}`,true);
                        let adata={
                            "env":"fzuanswersystem-7g3gmzjw761ecfdb",
                            "query":`db.collection(\'class\').where({classid:'${classid}'}).update({data:{questions:db.command.push('${_id}')}})`
                        }
                        addhttp.send(JSON.stringify(adata));
                        addhttp.onreadystatechange=e=>{
                            console.log(addhttp.responseText);
                            if(addhttp.readyState==4){
                                let res2=JSON.parse(addhttp.responseText);
                                if(res2.errcode==0){
                                    // update ok
                                    console.log('添加成功！');
                                    // dialog=require('electron');
                                    // dialog.showMessageBox({
                                    //     title:'提示',
                                    //     message:'添加成功',
                                    //     buttons:["确定"]
                                    // })
                                    clearWindow();
                                    showAnime('添加成功！');
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
function clearWindow(){
    document.getElementById('selectquestion').value='';
    document.getElementById('selectanalysis').value='';
    document.getElementById('selectquestion2').value='';
    document.getElementById('selectanalysis2').value='';
    document.getElementById('fillanswer').value='';
    document.getElementById('selectanalysis3').value='';
    document.getElementById('fillquestion').value='';
    let children=document.querySelector('.selectSingleB');
    while(children.hasChildNodes()) children.removeChild(children.firstChild);
    let c2=document.querySelector('.selectMoreB');
    while(c2.hasChildNodes()) c2.removeChild(c2.firstChild);
    countmore=countsingle=0;
}
function showAnime(text){
    let doc=document.querySelector('.content');
    let block=document.createElement('div');
    block.innerHTML=`<div class="tip">${text}</div>`;
    doc.appendChild(block);
    setTimeout(function(){
        doc.removeChild(block);
    },3000);
}