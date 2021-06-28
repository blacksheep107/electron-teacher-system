var globalData;
var typearr=['单选题','多选题','填空题'];
var hardlevel=['易','中','难'];
var countsingle=0;
var countmore=0;
var countblank=0;
function addRadioOption(){
    let newRadio=document.createElement('div');
    newRadio.classList.add('oneoption');
    newRadio.innerHTML=`选项${String.fromCharCode(countsingle+65)}. <input class="opinput" data-s=${String.fromCharCode(countsingle+65)} name="radiocontent" placeholder="填入选项内容"></input> <input type="radio" name="radio"></input>`;
    let selectSingle=document.querySelector('.selectSingleB');
    selectSingle.appendChild(newRadio);
    countsingle++;
}
function addBlankOption(){
    let newblank=document.createElement('div');
    newblank.classList.add('oneoption');
    newblank.innerHTML=`答案${countblank}. <input class="opinput" data-s=${countblank} name="blankcontent" placeholder="输入答案内容" />`
    let blank=document.querySelector('.inputanswer');
    blank.appendChild(newblank);
    countblank++;
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
var addidarr;
var classname;
var unitname;
var picturesUrl;    // 只能一张图片
function submitQuestion(newdata){
    console.log(newdata);
    addidarr=newdata;
    let type=document.getElementById('selectType').value;   // 选择填空
    let questionContent=document.getElementById('selectquestion').value;    // 问题
    let selectLevel=document.getElementById('selectLevel').value;   // 易中难
    classname=document.getElementById('classname-select').innerHTML;
    unitname=document.getElementById('unitname').innerHTML;
    let answer;
    let blanknum;
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
        if(singlearr.length<=1){
            showAnime('请添加多于1个选项！');
            return ;
        }
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
        questionContent=document.getElementById('fillquestion').value;
        choosecontent=null;
        choosenum=null;
        let ansarr=document.getElementsByName('blankcontent');
        blanknum=ansarr.length;
        if(blanknum<=0){
            showAnime('请添加至少一个答案！');
            return ;
        }
        for(let i=0;i<ansarr.length;i++){
            answerarr.push(ansarr[i].value);
        }
    }
    let level='easy';
    if(selectLevel=='中')   level='medium';
    else if(selectLevel=='难')  level='hard';
    let qtype='choose';
    if(type=='填空题')  qtype='fillblank';
    let isorder=document.getElementsByName('isOrderBtn')[0].checked;   // true按序
    let data={
        "analysis":analysis,
        "answer":type=='单选题'?answer:answerarr,   // 填空题答案和多选题答案放arr
        "choosecontent":choosecontent,
        "choosenum":choosenum,
        "blanknum":blanknum,    // 填空题
        "content":questionContent,
        "level":level,
        "type":qtype,
        "classname":classname,
        "unitname":unitname,
        "isorder":type=='多选题'?isorder:null,
        "studentsdid":[],
        "point":document.getElementById('setpoint').value,
        "pictures":picturesUrl
    }
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
var ACCESS_TOKEN;
function replaceSlashes(key, value) 
{ 
    if (typeof value == "string") 
    { 
    value = value.replace(/\//g, "\\/"); 
    } 
    return value; 
} 
function addQuestionTowx(data,classid){
    // question放入详细题目
    // class放入题目id
    console.log(data);
    console.log(classid);
    const http=new XMLHttpRequest();
    const APPID='wx53d4c253e80f5250';
    const APPSECRET='99bfb8dd8bf3736bf4cd0103722b8fbc';
    http.open("GET",`https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${APPID}&secret=${APPSECRET}`);
    http.send();
    http.onreadystatechange=e=>{
        if(http.readyState==4){
            ACCESS_TOKEN=JSON.parse(http.responseText).access_token;
            const addhttp2=new XMLHttpRequest();
            addhttp2.open('POST',`https://api.weixin.qq.com/tcb/databaseadd?access_token=${ACCESS_TOKEN}`,true);
            let ad={
                "env":"fzuanswersystem-7g3gmzjw761ecfdb",
                "query":`db.collection(\'questions\').add({data:${JSON.stringify(data)}})`
            }
            // questions
            addhttp2.send(JSON.stringify(ad));
            addhttp2.onreadystatechange=e=>{
                if(addhttp2.readyState==4){
                    console.log(addidarr);
                    let res3=JSON.parse(addhttp2.responseText);
                    if(res3.errcode==0){
                        let _id=res3.id_list[0];

                        addidarr.questions.push(_id);
                        let adddata={};
                        adddata[unitname]=addidarr;
                        console.log(adddata);
                        
                        const addhttp=new XMLHttpRequest();
                        addhttp.open('POST',`https://api.weixin.qq.com/tcb/databaseupdate?access_token=${ACCESS_TOKEN}`,true);
                        let adata={
                            "env":"fzuanswersystem-7g3gmzjw761ecfdb",
                            "query":`db.collection(\'class\').where({classid:'${classid}'}).update({data:{homework:${JSON.stringify(adddata)}}})`
                        }
                        // class插入questions _id
                        console.log(adata);
                        addhttp.send(JSON.stringify(adata));
                        addhttp.onreadystatechange=e=>{
                            if(addhttp.readyState==4){
                                console.log(addhttp.responseText);
                                let res2=JSON.parse(addhttp.responseText);
                                if(res2.errcode==0&&res2.modified==1){
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
    document.getElementById('selectanalysis3').value='';
    document.getElementById('fillquestion').value='';
    document.getElementById('setpoint').value='';
    let children=document.querySelector('.selectSingleB');
    while(children.hasChildNodes()) children.removeChild(children.firstChild);
    let c2=document.querySelector('.selectMoreB');
    while(c2.hasChildNodes()) c2.removeChild(c2.firstChild);
    countmore=countsingle=0;
}
function showAnime(text){
    let doc=document.querySelector('.content');
    let block=document.createElement('div');
    block.classList.add('tip');
    block.innerHTML=text;
    doc.appendChild(block);
    setTimeout(function(){
        doc.removeChild(block);
    },3000);
}
function show(source){
    // 添加图片
    var file=source.files[0];
    var fr=new FileReader();
    fr.readAsBinaryString(file);
    fr.onloadend=function(e){
        var http=new XMLHttpRequest();
        http.open("POST",`https://api.weixin.qq.com/tcb/uploadfile?access_token=${ACCESS_TOKEN}`);
        let path=file.path.replace(/\\/g,'/'); // 把反斜杠都改成斜杠试试
        console.log(path);
        let data={
            "env":"fzuanswersystem-7g3gmzjw761ecfdb",
            "path":path
        }
        http.send(JSON.stringify(data));
        http.onreadystatechange=e=>{
            if(http.readyState==4){
                let res=JSON.parse(http.responseText);
                console.log(res);
                var ht=new XMLHttpRequest();
                ht.open("POST",res.url);            
                let formData=new FormData();
                formData.append("key",path);
                formData.append("Signature",res.authorization);
                formData.append("x-cos-security-token",res.token);
                formData.append("x-cos-meta-fileid",res.cos_file_id);
                formData.append("file",file);
                ht.send(formData);
                ht.onreadystatechange=e=>{
                    if(ht.readyState==4){
                        if(ht.status==204){
                            picturesUrl=res.file_id;
                            showAnime('图片上传成功');
                            // 获取http下载链接，cloud有显示问题
                            // http不能获取永久地址，cnmd微信
                            // var ht2=new XMLHttpRequest();
                            // ht2.open("POST",`https://api.weixin.qq.com/tcb/batchdownloadfile?access_token=${ACCESS_TOKEN}`);
                            // let data3={
                            //     "env":"fzuanswersystem-7g3gmzjw761ecfdb",
                            //     "file_list":[{
                            //         "fileid":res.file_id,
                            //         "max_age":7200
                            //     }]
                            // };
                            // console.log(JSON.stringify(data3));
                            // ht2.send(JSON.stringify(data3));
                            // ht2.onreadystatechange=e=>{
                            //     if(ht2.readyState==4){
                            //         let res=JSON.parse(ht2.responseText);
                            //         console.log(res);
                            //         if(res.errcode==0){
                            //             picturesUrl=res.file_list[0].download_url;
                            //             showAnime('图片上传成功');
                            //         }
                            //     }
                            // }
                        }
                    }
                }
            }
        }
    };
}